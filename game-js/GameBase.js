/**
 * 
 */


import BSSelectionSet from './UnitSelectionSet.js'
import {	DEFAULT_BOARD_SIZE, 
			SIN_OF_60, 
			COS_OF_60, 
			COS_OF_30, 
			SIN_OF_30, 
			HOT_SEAT_MODE,
            PIECE_SIZE,
            UNIT,
            PLAYER,
			STATE,
			CHIT_TRAY1_BGRD } from './Constants.js'
import BSStateMachine from './GameStateMachine.js'
import { onRunTest, onSave, onChangeState, onUnitCreation, onDefineTerrain } from './Reactors.js';
import { createUnit, cacheKeyByElement, cacheKeyByValue, retrieveElementByKey, addEvent, HoverListener, Point2d, debugAlert, addListenerToElement, getRandomInt, inside, serialize, scaleImage, addToFrontOfArray, HexListener} from './GeneralUtilities'
//import BSUnitTray from './UnitTray'
import { UnitFactorySingleton, BSUnitFactory, BSCustomCombatUnit } from './Units.js'
import {BSBoard} from './GameBoard'
import BSUnitTray from './UnitTray'


//The game:
//Owns the board, the trays for the pieces, the pieces
//Coordinates the interactions
class BSGame {
	constructor() {
		this.mode = HOT_SEAT_MODE;
		//Array of regions/canvases 
		this.playRegions = null;
		//this.state = null;
		this.stateMachine = null;
		//Array of game pieces 
		this.gameAllPieces = null;
		this.activityButton = null;
		//this.loadButton = null;
		this.selectedGame = "";
		this.activePiece = null;
		this.xExtents = 0;
		this.yExtents = 0;
		this.size = PIECE_SIZE.MED;
		this.activeTerrain = 0;
		this.authorMode = false;
		this.selection = new BSSelectionSet();
		this.fileNameAndPath = "";
	}
	setGameFile(theFile){
		this.fileNameAndPath = "http://localhost:8082/Battles/";
		this.fileNameAndPath += theFile.name;
		//this.fileNameAndPath = "file:///C:/Users/joedo/Documents/Battlesim/Scenarios/PellenorFields.json"
	}
	//BSGame.prototype.get
	getStateMachine() {
		return this.stateMachine;
	}
	getSelectionSet() {
		return this.selection;
	}
	scaleGame(up) {
		var newSize = -1;
		if (up == true) {
			switch (this.size) {
				case PIECE_SIZE.SMALL:
					newSize = PIECE_SIZE.MED;
					break;
				case PIECE_SIZE.MED:
					newSize = PIECE_SIZE.LARGE;
					break;
				case PIECE_SIZE.LARGE:
					newSize = PIECE_SIZE.XLARGE;
					break;
				case PIECE_SIZE.LARGE:
				default:
					newSize = PIECE_SIZE.XXLARGE;
					break;
			}
		}
		else {
			switch (this.size) {
				case PIECE_SIZE.MED:
					newSize = PIECE_SIZE.SMALL;
					break;
				case PIECE_SIZE.LARGE:
					newSize = PIECE_SIZE.MED;
					break;
				case PIECE_SIZE.XLARGE:
					newSize = PIECE_SIZE.LARGE;
					break;
				case PIECE_SIZE.XXLARGE:
					newSize = PIECE_SIZE.XLARGE;
					break;
				case PIECE_SIZE.SMALL:
				default:
					newSize = PIECE_SIZE.SMALL;
					break;
			}
		}
		if (this.size != newSize) {
			var oldSize = this.size;
			this.size = newSize;
			var ratio = newSize / oldSize;
			if (this.gameAllPieces != null) {
				this.gameAllPieces.forEach(function (unit) {
					unit.setSize(unit.getSize() * ratio);
				});
			}
			this.playRegions.forEach(function (region) {
				region.scale(newSize);
			});
		}
	}
	initializeDataStructures() {
		this.setGamePieces(new Array());
		this.stateMachine = new BSStateMachine(this);
		this.playRegions = new Array();


		this.playRegions.push(new BSBoard(document)); //this.board);
	}
	//Iterate over the units and remove dead units
	removeTheDead() {
		this.gameAllPieces = this.gameAllPieces.filter(function (el) {
			if (el.isDead()) {
				el.getOwningHex().removeUnit(el);
				return false;
			}
			return true;
		});
		//Update the regions to remove the dead units
		this.playRegions.forEach(function (region) {
			region.invalidateUnits();
		});
	}
	//Initialize from the default UI
	defaultGamePieceInit() {
		//Create the game pieces from the UI settings
		this.initPlayer1Pieces();
		this.initPlayer2Pieces();
		//Load the pieces into the regions
		this.populateRegions();
	}
	//Goal is to remove all elements of existing game and prepare for a new game
	reset() {
		//Destroy the existing data structures		
		this.setGamePieces(null);
		//this.state - null;
		this.stateMachine = null;
		if (this.playRegions != null) {
			for (var i = 0; i < this.playRegions.length; i++) {
				this.playRegions[i].destroy();
			}
			this.playRegions = null;
		}
		this.removeControls();
	}
	serialize() {
		//Gather up all the persistent data in a table
		var data = {
			table: []
		};
		//Gather basic game settings	
		data.table.push({ size: this.getGameScale() });
		//Write out the current state
		//this.state.serialize(data);
		this.stateMachine.serialize(data);
		//Get all the units owned by the game 
		data.table.push({ units: [] });
		for (i = 0; i < this.getGamePieces().length; i++) {
			this.getGamePieces()[i].serialize(data.table[2].units);
		}
		//Play region specific seriialization
		for (var i = 0; i < this.playRegions.length; i++) {
			this.playRegions[i].serialize(data);
		}
		serialize(data);
	}
	//usage:
	deserialize(scenario) {
		//Clear out any existing game info
		this.reset();
		this.readTextFile(scenario, this, function (text, context) {
			if(text == "" ) return;
			var json_data = JSON.parse(text);
			console.log(json_data);
			//Need to unpack the JSON data in the correct order to ensure proper initialization for subsequent objects
			var data = { table: [] };
			data = json_data.game.definition; //BattleOfPellenorFields;//LoadTest;//BattleOfPellenorFields;
			//Basic game info
			context.size = data[0].size;
			//Initialize the game. This will init the UI as well. Need to make sure that 
			//the settings assigned during the init of the UI are overridden by the loaded values
			//
			//this.init();
			context.initializeDataStructures();
			//State
			//this.state.deserialize(data[1]);
			context.stateMachine.deserialize(data[1]);
			//this.state.setGame(this);
			//Game regions
			for (var i = 0; i < context.playRegions.length; i++) {
				context.playRegions[i].deserialize(data[3]);
			}
			//Units
			var units = data[2].units;
			for (var i = 0; i < units.length; i++) {
				var unit = units[i];
				
				var u = UnitFactorySingleton.getInstance().deserialize(unit);
				//u.setSize(context.size);
				//Now add to the data structures
				//context
				context.getGamePieces().push(u);
				
			}
			context.initUI(true);
			context.invalidateRegions();
			for (var i = 0; i < context.playRegions.length; i++) {
				context.playRegions[i].fixup();
			}
		});
	}
	//Need to refactor to get rid of the caching of the extents. 
	//They are only used as a hint to the unit corral for dimensions.
	//Start refactor   
	setGameDimensions(x, y, s) {
		this.xExtents = x;
		this.yExtents = y;
		this.size = s;
	}
	getXDimension() { return this.xExtents; }
	getYDimension() { return this.yExtents; }
	getGameScale() { return this.size; }
	//End refactor
	getState() {
		return this.stateMachine.getState().identity(); // this.state.gameState();
	}
	getCurrentTurn() {
		return this.stateMachine.getTurnCount(); // this.state.gameState();
	}
	setState(state) {
		//this.state.setState(state);
	}
	hasUnitsToDeploy(player) {
		//See if this player has undeployed units
		var pieces = this.getPlayerPieces(player);
		for (var i = 0; i < pieces.length; i++) {
			var piece = pieces[i];
			if (!piece.isInPlay() && piece.getTurnOfAppearance() <= this.getCurrentTurn())
				return true;
		}
		return false;
	}
	openTray(player) {
		
		var tray = new BSUnitTray(player, CHIT_TRAY1_BGRD);
		this.playRegions.push(tray); //player 1 unit tray
		tray.init(false);
		tray.populate();
		
	}
	closeTray(player) {
		for (var i = 0; i < this.playRegions.length; i++) {
			var region = this.playRegions[i];
			if (region.player == player) {
				region.destroy();
			}
		}
		this.playRegions = this.playRegions.filter(function (el) {
			return el.player != player;
		});
	}
	adjustUI() {
		var state = this.getState();
		for (var i = 0; i < this.playRegions.length; i++) {
			this.playRegions[i].adjustUIForCurrentState(state);
		}
	}
	resetForNewTurn() {
		for (var i = 0; i < this.playRegions.length; i++) {
			this.playRegions[i].resetForNewTurn();
		}
	}
	resetAfterPlayerTurn() {
		for (var i = 0; i < this.playRegions.length; i++) {
			this.playRegions[i].resetAfterPlayerTurn();
		}
	}
	resolve() {
		for (var i = 0; i < this.playRegions.length; i++) {
			this.playRegions[i].resolve();
		}
	}
	gameStarted() {
		return this.stateMachine.gameStarted();
	}
	startGame() {
		this.state.startGame();
		this.activityButton.innerHTML = this.state.getDescriptor();
	}
	incrementPhase() {
		this.state.incrementPhase();
		this.activityButton.innerHTML = this.state.getDescriptor();
	}
	setGamePieces(pieces) {
		return this.gameAllPieces = pieces;
	}
	getGamePieces() {
		return this.gameAllPieces;
	}
	getActivePiece() {
		return this.selection.getTopSelection();
	}
	invalidateRegionUnits() {
		for (var i = 0; i < this.playRegions.length; i++) {
			this.playRegions[i].invalidateUnits();
		}
	}
	invalidateRegions() {
		//Let the regions know there is an active piece
		for (var i = 0; i < this.playRegions.length; i++) {
			this.playRegions[i].invalidate();
		}
	}
	defaultActionOnStackSelection() {
		//Let the regions know there is an active piece
		var units = this.selection.getSelectedUnits();
		if (units == null || units.length == 0)
			return;
		for (var i = 0; i < this.playRegions.length; i++) {
			this.playRegions[i].addToActiveSet(units[0]);
		}
	}
	activateSelection() {
		//Let the regions know there is an active piece
		var units = this.selection.getSelectedUnits();
		if (units == null || units.length == 0)
			return;
		for (var i = 0; i < this.playRegions.length; i++) {
			this.playRegions[i].addToActiveSet(units[i]);
		}
	}
	clearSelection() {
		this.selection.clear();
		for (var i = 0; i < this.playRegions.length; i++) {
			this.playRegions[i].clearActive();
		}
	}
	setActivePiece(thePiece) {
		if (thePiece == null)
			this.selection.clear();
		else
			this.selection.addToSelection(thePiece);
		this; //.activePiece = thePiece;
		//Let the regions know there is an active piece
		for (var i = 0; i < this.playRegions.length; i++) {
			this.playRegions[i].addToActiveSet(thePiece);
		}
	}
	findTargetRegionFromId(ident) {
		var region = null;
		for (var i = 0; i < this.playRegions.length; i++) {
			if (this.playRegions[i].getIdent() == ident) {
				region = this.playRegions[i].getActiveTarget();
				break;
			}
		}
		return region;
	}
	populateRegions() {
		for (var i = 0; i < this.playRegions.length; i++) {
			this.playRegions[i].populate();
		}
	}
	notifyUnitTransferred(unit, region) {
		for (var i = 0; i < this.playRegions.length; i++) {
			if (region != this.playRegions[i])
				this.playRegions[i].notifyUnitTransferred(unit);
		}
	}
	initUI(loading) {
		this.initControls();
		//Create the game board
		for (var i = 0; i < this.playRegions.length; i++) {
			this.playRegions[i].init(loading, "", "");
		}
		this.adjustUI();
	}
	//ALERT
	//Experimental code
	//
	initLoadFile() {
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			//alert('File API is supported in this browser.');
			function handleFileSelect(evt) {
				var files = evt.target.files; // FileList object
				if (files.length > 0)
					this.selectedGame = files[0];
			}
			document.getElementById('files').addEventListener('change', handleFileSelect, false);
		}
		else {
			alert('The File APIs are not fully supported in this browser.');
		}
	}
	removeControls() {
		if (this.activityButton != null) {
			this.activityButton.parentNode.removeChild(this.activityButton);
			this.activityButton = null;
		}
		if (this.loadButton != null) {
			this.loadButton.parentNode.removeChild(this.loadButton);
			this.loadButton = null;
		}
		if (this.defineTerrainButton != null) {
			this.defineTerrainButton.parentNode.removeChild(this.defineTerrainButton);
			this.defineTerrainButton = null;
		}
		if (this.mountainButton != null) {
			this.mountainButton.parentNode.removeChild(this.mountainButton);
			this.mountainButton = null;
		}
		if (this.saveButton != null) {
			this.saveButton.parentNode.removeChild(this.saveButton);
			this.saveButton = null;
		}
		if (this.loadScenario != null) {
			this.loadScenario.parentNode.removeChild(this.loadScenario);
			this.loadScenario = null;
		}
	}
	initControls() {
		let fileChooser = document.getElementById("file-btn");
		fileChooser.style.display = "none";

		//Create activity buttons
		this.activityButton = document.createElement("Button");
		this.activityButton.innerHTML = this.stateMachine.getState().label(); //this.state.getDescriptor();
		let divNewGame = document.getElementById("new-game");
		divNewGame.appendChild(this.activityButton);
		addListenerToElement(this.activityButton, onChangeState, "click");
		//Save button
		this.saveButton = document.createElement("Button");
		this.saveButton.innerHTML = "Save";
		var body = document.getElementsByTagName("body")[0];
		body.appendChild(this.saveButton);
		divNewGame.appendChild(this.saveButton);
		addListenerToElement(this.saveButton, onSave, "click");

		//Test functionality  button
		/*
		this.loadScenario = document.createElement("Button");
		this.loadScenario.innerHTML = "Load Selected Scenario";
		var body = document.getElementsByTagName("body")[0];
		body.appendChild(this.loadScenario);
		addListenerToElement(	this.loadScenario, onRunTest, 
								"click");
		*/
	}
	selectPieces() {
		var modal = document.getElementById('myModal');
		// Get the button that opens the modal
		var btn = document.getElementById("myBtn");
		// Get the <span> element that closes the modal
		var span = document.getElementsByClassName("close")[0];
		// When the user clicks on <span> (x), close the modal
		span.onclick = function () {
			modal.style.display = "none";
		};
		// When the user clicks the button, open the modal 
		modal.style.display = "block";
	}
	//Game pieces are owned by the game and shared between the unit corral and the board
	initPlayer1Pieces() {
		//Create all the game pieces
		pieceCount = parseInt(document.getElementById("countId").value);
		var theGame = GameSingleton.getInstance();
		var size = theGame.getGameScale();
	/*
		var factory = UnitFactorySingleton.getInstance();
	*/
		var factory = null;
		var chitCount = pieceCount;
		var eachType = chitCount / 5;
		for (var j = 0; j < 5; j++) {
			for (var i = 0; i < eachType; i++) {
				var chit = null;
				switch (j) {
					case 0:
						chit = factory.createUnit(UNIT.INFANTRY);
						break;
					case 1:
						chit = factory.createUnit(UNIT.ARTILLERY);
						break;
					case 2:
						chit = factory.createUnit(UNIT.CAVALRY);
						break;
					case 3:
						chit = factory.createUnit(UNIT.BOMBER);
						break;
					case 4:
						chit = factory.createUnit(UNIT.CUSTOM);
						break;
				}
				//Set an initial position. This will be adjusted when assigned to the regions
				chit.init(-1, -1);
				chit.setSize(size);
				chit.setOwningPlayer(PLAYER.ONE);
				this.getGamePieces().push(chit);
			}
		}
		var chit = factory.createUnit(UNIT.LEADER);
		chit.init(-1, -1);
		chit.setSize(size);
		chit.setOwningPlayer(PLAYER.ONE);
		this.getGamePieces().push(chit);
	}
	//Game pieces are owned by the game and shared between the unit corral and the board
	initPlayer2Pieces() {
		//Create all the game pieces
		//debugger;
		var pieceCount = parseInt(document.getElementById("countId").value);
		var theGame = GameSingleton.getInstance();
		var size = theGame.getGameScale();
/*		
		var factory = UnitFactorySingleton.getInstance();
*/
		var factory = null;
		var chitCount = pieceCount;
		for (var i = 0; i < chitCount; i++) {
			var chit = null;
			if (i % 3)
				chit = factory.createUnit(UNIT.INFANTRY);
			else if (i % 7)
				chit = factory.createUnit(UNIT.ARTILLERY);
			else if (i % 5)
				chit = factory.createUnit(UNIT.CAVALRY);
			else
				chit = factory.createUnit(UNIT.BOMBER);
			//Set an initial position. This will be adjusted when assigned to the regions
			chit.init(-1, -1);
			chit.setSize(size);
			chit.setOwningPlayer(PLAYER.TWO);
			this.getGamePieces().push(chit);
		}
	}
	isCombatPhase() {
		return this.getState() == STATE.PLAYER_1_COMBAT || this.getState() == STATE.PLAYER_2_COMBAT;
	}
	isPlacementPhase() {
		return this.getState() == STATE.PLAYER_1_SETUP || this.getState() == STATE.PLAYER_2_SETUP;
	}
	isMovementPhase() {
		return this.getState() == STATE.PLAYER_1_MOVE || this.getState() == STATE.PLAYER_2_MOVE;
	}
	getPlayerPieces(player) {
		return this.getGamePieces().filter(function (el) {
			if (el.getOwningPlayer() === player)
				return true;
		});
	}
	//Setup the transient zones of control for the enemy player
	setZOCs(enemy) {
		for (var i = 0; i < this.playRegions.length; i++) {
			this.playRegions[i].applyZOCs(enemy);
		}
	}
	getStateMachine(){
		return this.stateMachine;
	}
	init(){

		this.initializeDataStructures();
		this.initUI(false);
		GameSingleton.getInstance().deserialize(this.fileNameAndPath);	

//this.invalidateRegions();
	}
	readTextFile(file, context, callback) {
		var rawFile = new XMLHttpRequest();
		rawFile.overrideMimeType("application/json");
		rawFile.open("GET", file, true);
		rawFile.onreadystatechange = function() {
			if (rawFile.readyState === 4 ){//}&& rawFile.status == "200") {
				callback(rawFile.responseText, context);
			}
		}
		rawFile.send(null);
	}
	isStarted(){
		return this.stateMachine != null;
	}
}


var GameSingleton = (function () {
	var instance = null;
    function createInstance() {
        var game = new BSGame();
        return game;
    }
 
    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();


export { BSGame, GameSingleton }