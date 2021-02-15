/**
 *
 */
import BSCanvasRegion  from './CanvasRegionBase'
import {	DEFAULT_BOARD_SIZE, 
	SIN_OF_60, 
	COS_OF_60, 
	COS_OF_30, 
	SIN_OF_30,
	BOARD_SIZE,
	BOARD_SIZE_TAG,
	TERRAIN,
	BOARD_BGRD, 
	NOTIFICATIONS} from './Constants.js'
import {drawRect, preDrawShape, postDrawShape } from './DrawUtilities'
import {BSContextMenu,BSInfoWindow,BSUnitFlyout} from './UIWidgets'
import { BSBoardCreatorSingleton } from './BoardCreator.js'
import { colinear, createUnit, cacheKeyByElement, cacheKeyByValue, retrieveElementByKey, addEvent, HoverListener, Point2d, debugAlert, addListenerToElement, getRandomInt, inside, serialize, scaleImage, addToFrontOfArray, HexListener} from './GeneralUtilities'
import  {onMouseMove,onMouseEnter,onMouseExit,onContextMenu,onMouseDown,onMouseUp} from './EventHandlers'
import { onHover, onUnitDetails, onSplitUnit, onZoomIn, onZoomOut, onHelp, onNextUnit, onUnitsFlyout, onTerrainInfo, onSelectAll, onMoveStack, onReorderUnits} from './GameBoardCtxMenuHandlers'
import { BSGame, GameSingleton } from './GameBase'
import { BSHex, BSHexFactory, HexFactorySingleton } from './Hex'

//Create a container for the active piece along with valid destinations so it only needs to be calculated once
class BSActiveGamePieceValidDestinations {
	constructor() {
		this.piece = null;
		this.validDestinations = null;
	}
	setActivePiece(piece) {
		this.piece = piece;
	}
	setValidDestinations(dests) {
		this.validDestinations = dests;
	}
	getPiece() {
		return this.piece;
	}
	getValidDestinations() {
		return this.validDestinations;
	}
}
class adjHex{
	constructor(h, c, l) {
		this.hex = h;
		this.edgeCost = c;
		this.leastCostToHere = l;
	}
}
class ConnectedFeature{
	constructor(type){
		this.hexes = new Array();
		this.type = type;
	}
	contains(hex){
		for(let i=0; i< this.hexes.length; i++){
			if(this.hexes[i] == hex)
			return true;
		}
		return false;
	}
	addHex(hex){

		if(this.hexes.includes(hex)==false){
			if(hex.addImprovementFromType(this.type))
				this.hexes.push(hex);
		}
	}
	removeAll(){
		for(let i=0; i< this.hexes.length; i++){
			let hex = this.hexes[i];
			if(hex != null)
				hex.removeIncompatibleImprovements();
		}
		this.hexes = new Array();
	}
	draw(ctx){
		for(let i=1; i< this.hexes.length; i++){
			let start = this.hexes[i-1];
			let end = this.hexes[i];

			var ptStart = start.getOrigin();
			var ptEnd = end.getOrigin();

			this.drawLine(ptStart, ptEnd, ctx);
			/*
			//Find vector between the centers and draw the line halfway
			var xo, yo, xi, yi, xp, yp;
			var xo = ptOther.getX();
			yo = ptOther.getY();
			xi = ptThis.getX();
			yi = ptThis.getY();
			xp = (xi + xo) / 2;
			yp = (yi + yo) / 2;
			ctx.beginPath();
			ctx.moveTo(xi, yi);
			ctx.lineTo(xo, yo);
			ctx.strokeStyle = "#000000";
			ctx.lineWidth = 1;
			ctx.stroke();
			*/
		}
	}
	drawDoubleLine(ptStart, ptEnd, ctx){
		var xo, yo, xi, yi, xp, yp;
		xo = ptEnd.getX();
		yo = ptEnd.getY();
		xi = ptStart.getX();
		yi = ptStart.getY();
		xp = (xi + xo) / 2;
		yp = (yi + yo) / 2;
		ctx.beginPath();
		ctx.moveTo(xi, yi);
		ctx.lineTo(xo, yo);
		ctx.strokeStyle = "#889900";
		ctx.lineWidth = 3;
		ctx.stroke();
	}
	drawLine(ptStart, ptEnd, ctx){
		var xo, yo, xi, yi, xp, yp;
		xo = ptEnd.getX();
		yo = ptEnd.getY();
		xi = ptStart.getX();
		yi = ptStart.getY();
		xp = (xi + xo) / 2;
		yp = (yi + yo) / 2;
		ctx.beginPath();
		ctx.moveTo(xi, yi);
		ctx.lineTo(xo, yo);
		ctx.strokeStyle = "#c47539";
		ctx.lineWidth = 5;
		ctx.stroke();
	}
	draw2(ctx){
		if( this.hexes.length < 3){
			this.draw(ctx);
		}
		else{
			for(let i=2; i< this.hexes.length; i++){
				let start = this.hexes[i-2];
				let mid = this.hexes[i-1];
				let end = this.hexes[i];
				
				let ptStart = start.getOrigin();
				let ptMid = mid.getOrigin();
				let ptEnd = end.getOrigin();

				if(colinear(ptStart, ptMid, ptEnd)){
					this.drawLine(ptStart, ptMid, ctx);
					continue;
				}
				
				
				//At this point the polyline is branching so need to draw a curve between the start and mid
				//that will have a tangent based on line(end-mid)

				//Find vector between the centers and draw the line halfway
				var xS, yS, xM, yM, xE, yE, xP, yP, xC, yC;
				xS = ptStart.getX();
				yS = ptStart.getY();
				xM = ptMid.getX();
				yM = ptMid.getY();
				xE = ptEnd.getX();
				yE = ptEnd.getY();
				xP = (xS + xE) / 2;
				yP = (yS + yE) / 2;
				var rad = Math.sqrt(Math.pow(xP-xS,2) +Math.pow(yP-yS,2));
				var offset = rad/6;

				xC = xP + offset;
				yC = yP;


				ctx.beginPath();
				ctx.moveTo(xS, yS);
				ctx.quadraticCurveTo(xC,yC, xE,yE);
				//ctx.lineTo(xo, yo);
				ctx.strokeStyle = "#000000";
				ctx.lineWidth = 1;
				ctx.stroke();
				i++;
			}
		}	
	}
}

class BSBoard extends BSCanvasRegion {
	constructor(document) {
		super();
		//this.setExtents(document);
		//Persistent data
		this.hexXDir = 0;
		this.hexYDir = 0;
		this.size = 0;
		this.m_hexes = null;
		//Non-persistant data
		this.context = null;
		//this.mousePos = null;
		this.paintTerrain = false;
		this.newLine = null;
		//this.contextMenuOrigin = null;
		this.contextMenuHex = null;
		this.contextSelection = null;
		//Cache the active hex to track mouse position
		//this.activeHex = null;
		this.background = null;
		this.connectedFeatures = null;
	}
	notify(message, sender){
		if(message == NOTIFICATIONS.INVALID_IMPROVEMENT){
			//Search for any improvement that contains the sender and remove it
			if(this.connectedFeatures != null){
				this.connectedFeatures = this.connectedFeatures.filter(function(connectedFeature){
					if(connectedFeature.contains(sender) ){
						connectedFeature.removeAll();		
						return false;
					}
					return true;	
				});
			}
	
		}
	}
	setExtents(document){
		var c = document.getElementById("canvas");
		c.width  = DEFAULT_BOARD_SIZE["WIDTH"];
		c.height = DEFAULT_BOARD_SIZE["HEIGHT"];
		var ctx = c.getContext("2d");
		ctx.fillStyle = "blue";
		ctx.fillRect(0, 0, c.width, c.height);    
	}
	draw(canvas){
		//var c = document.getElementById("canvas");
		var ctx = canvas.getContext("2d");
		
		ctx.fillStyle = "purple";
		ctx.fillRect(0, 0, canvas.width, canvas.height);    

		ctx.beginPath();
		ctx.rect(20, 30, 150, 100);
		ctx.stroke();  
	}
	//Scale the board to the new size
	scale(newSize) {
		this.size = newSize;
		this.setWidth(this.hexXDir * newSize * (1 + COS_OF_60) + (2 * SIN_OF_30 + 1) * (newSize * COS_OF_60));
		this.setHeight(this.hexYDir * 2 * newSize * COS_OF_30 + (2 * SIN_OF_30 + 1) * (newSize * COS_OF_60));
		//The board is the primary driver of the dimensions of the game so let the game know	
		var theGame = GameSingleton.getInstance();
		theGame.setGameDimensions(this.width, this.height, this.size);
		this.oX = 0;
		this.oY = 0;
		this.gridCountX = 0;
		this.gridCountY = 0;
		//this.m_hexes = null;
		this.canvas.width = this.getWidth();
		this.canvas.height = this.getHeight();
		for (var i = 0; i < this.m_hexes.length; i++) {
			var hex = this.m_hexes[i];
			hex.scale(this.size);
		}
		this.draw();
	}
	//BSBoard.prototype.isFlyoutMode = function(){ return this.contextMenuOrigin != null; }
	serialize(data) {
		//Write out board params
		data.table.push({ hexes: [] });
		var h = data.table[3].hexes;
		h.push({ rows: this.hexXDir, cols: this.hexYDir, size: this.size });
		//Write out each hex
		for (var i = 0; i < this.m_hexes.length; i++) {
			this.m_hexes[i].serialize(h);
		}
	}
	deserialize(data) {
		//Read the header data for the array of hexes
		var hexes = data.hexes;
		this.hexXDir = hexes[0].rows;
		this.hexYDir = hexes[0].cols;
		this.size = hexes[0].size;
		//Set the board dimensions based on the array size and the size of the hexes
		var dimX = this.hexXDir;
		var dimY = this.hexYDir;
		var radius = this.size;
		this.setWidth(dimX * radius * (1 + COS_OF_60) + (2 * SIN_OF_30 + 1) * (radius * COS_OF_60));
		this.setHeight(dimY * 2 * radius * COS_OF_30 + (2 * SIN_OF_30 + 1) * (radius * COS_OF_60));
		//Now read in the individual hex data and create BSHex objects 
		this.m_hexes = new Array();
		var factory = HexFactorySingleton.getInstance();
		for (var i = 1; i < hexes.length; i++) {
			var hex = hexes[i];
			//Create a hex of the specified size
			var h = factory.createHex(this);
			//Load in the hex data
			h.deserialize(hex);
			this.m_hexes.push(h);
		}
	}
	fixup() {
		var units = GameSingleton.getInstance().getGamePieces();
		this.chits = new Array();
		//for(var i=0; j< this.m_hexes.length; i++){
		//	var hex = this.m_hexes[i];
		//	hex.init(-1,-1);
		//}
		for (let i = 0; i < units.length; i++) {
			var unit = units[i];
			//unit.init(-1,-1);
			for (var j = 0; j < this.m_hexes.length; j++) {
				var hex = this.m_hexes[j];
				if (unit.row == hex.row &&
					unit.col == hex.col) {
					unit.setOwningHex(hex);
					//hex.addUnit(unit);
					unit.setPosition(hex.m_x, hex.m_y);
					this.chits.push(unit);
				}
			}
		}
	}
	calculateDimensions() {
		var width, length;
		width = parseInt(document.getElementById("lengthId").value);
		length = parseInt(document.getElementById("heightId").value);
	}
	getUnitSize() {
		return GameSingleton.getInstance().getGameScale();
	}
	getHexSize() {
		return this.size;
	}
	calculateBoardDimenions(defaultSize) {
		var tag = document.getElementById("boardSizeId") != null ? document.getElementById("boardSizeId").value : defaultSize;
		var dimX = 0;
		var dimY = 0;
		switch (tag) {
			case BOARD_SIZE_TAG.TINY:
				dimX = BOARD_SIZE.TINY[0];
				dimY = BOARD_SIZE.TINY[1];
				break;
			case BOARD_SIZE_TAG.SMALL:
				dimX = BOARD_SIZE.SMALL[0];
				dimY = BOARD_SIZE.SMALL[1];
				break;
			case BOARD_SIZE_TAG.MED:
				dimX = BOARD_SIZE.MED[0];
				dimY = BOARD_SIZE.MED[1];
				break;
			case BOARD_SIZE_TAG.LARGE:
				dimX = BOARD_SIZE.LARGE[0];
				dimY = BOARD_SIZE.LARGE[1];
				break;
			case BOARD_SIZE_TAG.XLARGE:
				dimX = BOARD_SIZE.XLARGE[0];
				dimY = BOARD_SIZE.XLARGE[1];
				break;
			case BOARD_SIZE_TAG.GIGANTIC:
				dimX = BOARD_SIZE.GIGANTIC[0];
				dimY = BOARD_SIZE.GIGANTIC[1];
				break;
			default:
				dimX = BOARD_SIZE.MED[0];
				dimY = BOARD_SIZE.MED[1];
				break;
		}
		this.hexXDir = dimX;
		this.hexYDir = dimY;
		//The size value is a radius of the circle circumscribing the hex. To calculate the canvas size we need:
		//1. Calculate the count in "x" direction based on the geometry of the hex
		//2. Calculate the count in the "y" direction
		//3. Multiply out to find the canvas size
		var radius = this.size;
		this.setWidth(dimX * radius * (1 + COS_OF_60) + (2 * SIN_OF_30 + 1) * (radius * COS_OF_60));
		this.setHeight(dimY * 2 * radius * COS_OF_30 + (2 * SIN_OF_30 + 1) * (radius * COS_OF_60));
	}
	createNewCanvas() {
		this.setIdent("game_board");
		this.canvas = this.createCanvas(this.getWidth(), this.getHeight(), this.getIdent());
		//Cache the context for easy access
		this.context = this.canvas.getContext("2d");
		this.canvas.oncontextmenu = function (e) {
			e.preventDefault();
		};
		//Add event listener to the canvas
		this.addEventHandlers();
	}
	adjustBoardSizesForImage() {
		var imageX = this.background.width;
		var imageY = this.background.height;
		var boardX = this.width;
		var boardY = this.height;
		var newBoardX, newBoardY;
		var aspectRatio = imageY / imageX;
		if (aspectRatio >= 1) {
			//Taller than wide so increase the Y axis to grow the board to achieve the same aspect ratio
			newBoardX = boardX;
			newBoardY = boardX * aspectRatio;
		}
		else {
			//Wider than tall
			newBoardY = boardY;
			newBoardX = boardY / aspectRatio;
		}
		this.width = newBoardX;
		this.height = newBoardY;
		var size = this.size;
		this.hexXDir = this.gridCountX = Math.floor(this.width / size);
		this.hexYDir = this.gridCountY = Math.floor(this.height / size);
	}
	init(loading, defaultSize, bgImg) {
		this.size = this.getUnitSize();
		if (!loading)
			this.calculateBoardDimenions(defaultSize);
		var theGame = GameSingleton.getInstance();
		var scaleF = 1;
		if (loading && 0) {
			this.width = this.hexXDir * this.size;
			this.height = this.hexYDir * this.size;
		}
		theGame.setGameDimensions(this.width, this.height, this.size);
		this.oX = 0;
		this.oY = 0;
		this.gridCountX = 0;
		this.gridCountY = 0;
		if (!loading)
			this.m_hexes = null;
		//Initialize the unit data structures
		this.chits = new Array();
		this.activePieceContainer = new BSActiveGamePieceValidDestinations();
		//Create a new paragraph for the canvas
		this.newLine = document.createElement("P");
		document.body.append(this.newLine);
		//Create load handler for background image if using one
		if (bgImg != "" && bgImg != null) {
			//Get image dimnensions
			this.background = new Image();
			this.background.src = bgImg;
			var that = this;
			this.background.onload = function () {
				that.adjustBoardSizesForImage();
				that.createNewCanvas();
				that.createHexes(that.size);
				that.draw();
			};
			//Create event handler for transparency control if using a bground
			var slider = document.getElementById("bgtransparency");
			if (slider != null) {
				// Update the current slider value (each time you drag the slider handle)
				slider.oninput = function () {
					that.draw();
				};
			}
		}
		else {
			this.createNewCanvas();
			if (!loading)
				this.createHexes(this.size);
			this.draw();
		}
	}
	addEventHandlers() {
		addListenerToElement(this.canvas, onMouseMove, "mousemove");
		addListenerToElement(this.canvas, onMouseDown, "mousedown");
		addListenerToElement(this.canvas, onMouseUp, "mouseup");
		addListenerToElement(this.canvas, onMouseEnter, "mouseenter");
		addListenerToElement(this.canvas, onMouseExit, "mouseout");
		addListenerToElement(this.canvas, onContextMenu, "contextmenu");
	}
	resetForNewTurn() {
		this.chits.forEach(function (el) {
			el.resetMovementFactor();
		});
	}
	resetAfterPlayerTurn() {
		this.m_hexes.forEach(function (el) {
			el.resetForNewTurn();
		});
	}
	getPiecesOnBoard(playerId) {
		var theGame = GameSingleton.getInstance();
		return theGame.getGamePieces().filter(function (el) {
			if (el.getOwningPlayer() === playerId && el.isInPlay())
				return true;
		});
	}
	applyZOCs(playerId) {
		var theGame = GameSingleton.getInstance();
		var enemies = this.getPiecesOnBoard(playerId);
		var theBoard = this;
		enemies.forEach(function (unit) {
			if (unit.exertZOC()) {
				var hex = unit.getOwningHex();
				//Get all hexes adjacent to this
				var hexes = theBoard.getAdjacentHexes(hex);
				hexes.forEach(function (adjhex) {
					adjhex.setUnderZOCInfluence(true);
				});
			}
		});
	}
	resolve() {
		var theGame = GameSingleton.getInstance();
		var state = theGame.getState();
		var friendlyChitsInCombat = new Array();
		for (var i = 0; i < this.chits.length; i++) {
			var chit = this.chits[i];
			if (state == STATE.PLAYER_1_COMBAT && chit.getOwningPlayer() == PLAYER_IDENT.PLAYER_ONE ||
				state == STATE.PLAYER_2_COMBAT && chit.getOwningPlayer() == PLAYER_IDENT.PLAYER_TWO) {
				friendlyChitsInCombat.push(chit);
			}
		}
	}
	destroy() {
		this.canvas.parentNode.removeChild(this.canvas);
		this.newLine.parentNode.removeChild(this.newLine);
		this.newLine = null;
		this.canvas = null;
		this.m_hexes = null;
		this.chits = null;
	}
	getAdjacentHexes(hex) {
		//;
		var adj = new Array();
		var row = hex.getRow();
		var col = hex.getCol();
		for (var i = 0; i < this.m_hexes.length; i++) {
			var h = this.m_hexes[i];
			var isAdj = false;
			if (h.getRow() == row) {
				var c = h.getCol();
				if (c == (col + 1) || c == (col - 1))
					isAdj = true;
			}
			else if (row % 2 != 0) { //odd rows
				if (h.getRow() == (row - 1)) {
					var c = h.getCol();
					if (c == col || c == (col - 1))
						isAdj = true;
				}
				else if (h.getRow() == (row + 1)) {
					var c = h.getCol();
					if (c == col || c == (col - 1))
						//if(c == col)
						isAdj = true;
				}
			}
			else { //even rows
				if (h.getRow() == (row - 1)) {
					var c = h.getCol();
					if (c == col || c == (col + 1))
						isAdj = true;
				}
				else if (h.getRow() == (row + 1)) {
					var c = h.getCol();
					if (c == col || c == (col + 1))
						isAdj = true;
				}
			}
			if (isAdj == true) {
				adj.push(h);
			}
			//Should only be six sides to a hex
			if (adj.length == 6)
				break;
		}
		return adj;
	}
	//Find the lowest cost path between two hexes from a given set of hexes
	lowestCostBetween(fromHex, toHex, validSet) {
		var paths = new Array();
		return 1;
	}
	getValidDestinationsFast(movementFactor, fromHex, validSet, chit) {
		//var candidates = new Array();
		//candidates.push(fromHex);
		this.getCandidateDestinationsFast(movementFactor, fromHex, validSet, chit);
		//candidates = removeDuplicatesFromArray(candidates);
		var friendlySide = this.getActivePiece().getOwningPlayer();
		validSet = validSet.filter(function (hex) {
			return !hexHasEnemies(hex, friendlySide);
		});
		validSet = filterHigherCostDuplicates(validSet, movementFactor);
		//Now convert the result to adjacencies. This is only for drawing purposes, so ignore the costs
		return validSet;
	}
	getCandidateDestinationsFast(movementFactor, fromHex, validSet, chit) {
		if (movementFactor > 0) {
			var immediateNeighbours = this.getAdjacentHexes(fromHex);
			for (var i = 0; i < immediateNeighbours.length; i++) {
				var hex = immediateNeighbours[i];
				//If hex contains enemies then skip
				//If this hex is already in the valid hexes do no recurse
				//if(!validSet.includes(hex)){
				//if(!isInValidSet(hex, validSet)){
				//validSet.push(new adjHex(hex, 1, fromHex.leastCostToHere + 1));
				validSet.push(new adjHex(hex, 1, lookupAdjFromHex(fromHex, validSet).leastCostToHere + 1));
				//}
			}
			for (i = 0; i < immediateNeighbours.length; i++) {
				var hex = immediateNeighbours[i];
				this.getCandidateDestinationsFast(movementFactor - 1, hex, validSet, chit);
			}
		}
	}
	//Recursively find valid destinations until movement factor consumed 
	getCandidateDestinations(movementFactor, fromHex, validSet, enemiesOnly, chit) {
		if (movementFactor > 0) {
			if (enemiesOnly == false) {
				//Do a quick search if terrain and passing thru enemies is not an issue
				//I.e. an aircraft
				//if( this.getActivePiece().ignoreTerrain() ){
				//validSet.push(new adjHex(fromHex, 0, 1));
				//	return this.getValidDestinationsFast( movementFactor, fromHex, validSet );
				//}
				var immediateNeighbours = this.getAdjacentHexes(fromHex);
				//Immediately filter out invalid hexes
				var exclusions = this.findDestinationExclusions(immediateNeighbours, this.getActivePiece().getOwningPlayer(), movementFactor, this.getActivePiece().ignoreTerrain(), chit, fromHex);
				immediateNeighbours = this.removeSubsetFromOriginalArray(immediateNeighbours, exclusions);
				for (var i = 0; i < immediateNeighbours.length; i++) {
					var hex = immediateNeighbours[i];
					var leastCost = 10000;
					for (var k = 0; k < validSet.length; k++) {
						var from = validSet[k];
						//For each match of the from hex to the current hex, check to see which is the lowest cost 
						if (from.hex == fromHex) {
							if (from.leastCostToHere < leastCost) {
								leastCost = from.leastCostToHere;
							}
						}
					}
					//The first time through this algorithm will have a validset of 0 length so least cost to this point is zero
					if (leastCost == 10000)
						leastCost = 0;
					var toTerrainFlags = hex.getTerrainAndImprovementsFlags();
					var fromTerrainFlags = fromHex.getTerrainAndImprovementsFlags();
					var costToMove = chit.getMinimumUnitMovementCostForTerrainFlags(toTerrainFlags, //hex.getTerrain().getTerrainFlag(), 
						fromTerrainFlags); //fromHex.getTerrain().getTerrainFlag() );//chit.getOwningHex().getTerrain().getTerrainFlag());
					if (this.getActivePiece().ignoreTerrain())
						costToMove = COST.CLEARING;
					var a = new adjHex(hex, costToMove, leastCost + costToMove);
					validSet.push(a);
					if (!hex.isStopOnEntry())
						this.getCandidateDestinations(movementFactor - costToMove, hex, validSet, enemiesOnly, chit);
				}
			}
			else {
				var immediateNeighbours = this.getAdjacentHexes(fromHex);
				for (var i = 0; i < immediateNeighbours.length; i++) {
					var hex = immediateNeighbours[i];
					//If this is artillery or something with a range, recursively gather enemy units to the extent of the range
					if (this.getActivePiece().getRange() > 1) {
						this.getCandidateDestinations(movementFactor - 1, hex, validSet, enemiesOnly, chit);
					}
					//Now add all the enemies occupied hexes to the validSet
					var unitsOnHex = hex.getUnitsOnHex();
					if (unitsOnHex != null) {
						for (var j = 0; j < unitsOnHex.length; j++) {
							var unit = unitsOnHex[j];
							//If the unit is an enemy and alive add the hex to validSet
							if (unit.getOwningPlayer() != this.getActivePiece().getOwningPlayer() && !unit.isDead()) {
								validSet.push(new adjHex(hex, movementFactor, 0));
								break;
							}
						}
					}
				}
			}
		}
		return validSet;
	}
	draw() {
		//console.log("Draw Board");
		//if(this.isFlyoutMode() == true) return;
		var theGame = GameSingleton.getInstance();
		var highlightAdj = false;
		var active = this.getActivePiece();
		if (theGame != null &&
			theGame.getStateMachine() != null &&
			theGame.gameStarted() &&
			active != null) {
			highlightAdj = true;
		}
		var ctx = this.context;
		ctx.save();
		//If there is a background image then set the transparency
		if (this.background != null) {
			var slider = document.getElementById("bgtransparency");
			var alpha = 1;
			if (slider != null) {
				alpha = slider.value / 100;
			}
			ctx.globalAlpha = alpha;
			var imageX = this.background.width;
			var imageY = this.background.height;
			//Scale the image to the game area
			var boardX = this.width;
			var boardY = this.height;
			var scaleF = 1;
			if (imageX / boardX > imageY / boardY)
				scaleF = imageX / boardX;
			else
				scaleF = imageY / boardY;
			//this.scale(scaleF, scaleF);
			ctx.drawImage(this.background, 0, 0, imageX / scaleF, imageY / scaleF);
		}
		drawRect(ctx, 0, 0, this.getWidth(), this.getHeight(), BOARD_BGRD);
		var onHex = null;
		/*
		for (var i = 0; i < this.m_hexes.length; i++) {
			var hex = this.m_hexes[i];
			if (hex.isOn(this.mousePos)) {
				//;
				onHex = hex;
				hex.draw(ctx, true);
			}
			else
				hex.draw(ctx, false);
		}
		*/
		for (var i = 0; i < this.m_hexes.length; i++) {
			var hex = this.m_hexes[i];
			if (hex.isOn(this.mousePos)) {
				//;
				onHex = hex;
				hex.drawBaseTerrain(ctx, true);
			}
			else
				hex.drawBaseTerrain(ctx, false);
		}
		if(this.connectedFeatures != null){
			this.connectedFeatures.forEach(function(el){
				el.draw(ctx);
			});
		}
		for (var i = 0; i < this.m_hexes.length; i++) {
			var hex = this.m_hexes[i];
			if (hex.isOn(this.mousePos)) {
				//;
				onHex = hex;
				hex.drawHexImprovements(ctx, true);
			}
			else
				hex.drawHexImprovements(ctx, false);
		}

		if (highlightAdj == true && onHex != null) {
			var movementFactor = active.getMovementFactor(true);
			var adj = new Array();
			adj = active.getValidDestinations();
			if (adj != null) {
				for (var k = 0; k < adj.length; k++) {
					var node = adj[k];
					//;
					var hex = node.hex;
					hex.draw(ctx, true);
				}
			}
		}
		for (var i = 0; i < this.m_hexes.length; i++) {
			var hex = this.m_hexes[i];
			hex.drawUnits(ctx);
		}
		//this.chits.filter(function(unit){
		//	unit.draw(ctx, false);
		//});
		var xTest = this.mousePos.x;
		var yTest = this.mousePos.y;
		if (active != null && this.isActive()) {
			//;
			var xOld = active.getPosition().getX();
			var yOld = active.getPosition().getY();
			active.setPosition(xTest, yTest);
			active.draw(ctx, true);
			active.setPosition(xOld, yOld);
		}
		if (this.widgets != null) {
			var pos = this.mousePos;
			this.widgets.forEach(function (el) {
				el.draw(ctx, pos);
			});
		}
		ctx.restore();
	}
	createHexes(radius) {
		this.m_hexes = new Array();
		var xRange = this.width - this.oX;
		var yRange = this.height - this.oY;
		var xInitOffset = (2 * SIN_OF_30 + 1) * (radius * COS_OF_60);
		var xHexOffset = radius * (1 + COS_OF_60);
		var yHexOffset = 2 * radius * COS_OF_30;
		var xCount = Math.floor((xRange - xInitOffset) / (xHexOffset));
		var yCount = Math.floor(yRange / yHexOffset); //(2*radius);
		this.gridCountX = xCount;
		this.gridCountY = yCount;
		var factory = HexFactorySingleton.getInstance();
		//Loop for rows of hexes
		for (var i = 1; i <= xCount; i++) {
			var xPos = xInitOffset + (i - 1) * xHexOffset;
			//Loop for columns of hexes
			for (var j = 1; j <= yCount; j++) {
				let hex = factory.createHex2(this, i, j, TERRAIN.NONE); //new BSHex(i, j, TERRAIN.CLEARING, this);
				//hex.init();
				this.m_hexes.push(hex);
			}
		}
	}
	onLMBUp(e) {
		this.paintTerrain = false;
		this.invalidateAll();
	}
	removeWidgets() {
		this.widgets = null;
		//this.invalidateAll();
	}
	invalidateUnits() {
		var theGame = GameSingleton.getInstance();
		this.chits = theGame.getGamePieces().filter(function (el) {
			return (el.isInPlay() && !el.isDead());
		});
	}
	getOnHex(event) {
		var pt = new Point2d(event.offsetX, event.offsetY);
		return this.centerOnHex(pt);
	}
	onContextMenu(event) {
		console.log("onContextMenu");
		event.preventDefault();
		//Stop any timer events
		HexListener.unMonitorHex();
		var onHex = this.getOnHex(event);
		if (onHex == null) {
			console.log("ERROR: Null hex selected");
			return;
		}
		//Retrieve the units so the contexxt menu can be more contextual
		var units = onHex.getUnitsOnHex();
		var x = event.offsetX;
		var y = event.offsetY;
		var menuItems;
		if (units == null || units.length == 0) { //No units
			menuItems = [["Terrain Info", onTerrainInfo],
			["Zoom out", onZoomOut],
			["Zoom in", onZoomIn],
			["__________", function () { } ],
			["Help", onHelp]];
		}
		else if (units.length == 1) {
			if (units[0].isSplittable()) {
				menuItems = [["Terrain Info", onTerrainInfo],
				["Select All", onSelectAll],
				["Split Unit", onSplitUnit],
				["Zoom out", onZoomOut],
				["Zoom in", onZoomIn],
				["__________", function () { } ],
				[units[0].getUnitTypeName(), onUnitDetails],
				["Help", onHelp]];
			}
			else {
				menuItems = [["Terrain Info", onTerrainInfo],
				["Select All", onSelectAll],
				["Zoom out", onZoomOut],
				["Zoom in", onZoomIn],
				["__________", function () { } ],
				[units[0].getUnitTypeName(), onUnitDetails],
				["Help", onHelp]];
			}
		}
		else { //More than one unit
			if (units[0].isSplittable()) {
				menuItems = [["Terrain Info", onTerrainInfo],
				["Select All", onSelectAll],
				["Split Unit", onSplitUnit],
				["Zoom out", onZoomOut],
				["Zoom in", onZoomIn],
				["__________", function () { } ],
				[units[0].getUnitTypeName(), onUnitDetails],
				["Help", onHelp]];
			}
			else {
				menuItems = [["Terrain Info", onTerrainInfo],
				["Select All", onSelectAll],
				["Zoom out", onZoomOut],
				["Zoom in", onZoomIn],
				["__________", function () { } ],
				[units[0].getUnitTypeName(), onUnitDetails],
				["Help", onHelp]];
			}
		}
		var child = new BSContextMenu(x, y, 100, 50, "#ffffff", menuItems, this);
		this.addWidget(child);
		child.draw(this.canvas.getContext("2d"), null);
	}
	onMouseMove(event) {
		this.mousePos.x = event.offsetX;
		this.mousePos.y = event.offsetY;
		//var theGame = GameSingleton.getInstance();
		var selectPosition = new Point2d(event.offsetX, event.offsetY);
		var onHex = this.centerOnHex(selectPosition);
		if (onHex != null) {
			//1. User has started the terrain definition mode 
			if (this.isDefineTerrainMode() == true && this.paintTerrain == true) {
				console.log(onHex);
				this.setTerrain(onHex);
			}
			//Mouse move during play 
			else {
				//Set up a listener to detect a hover event
				HexListener.monitorHex(onHex, onHover, 1000, this);
			}
		}
		//else
		//this.activeHex = null;
		if (this.activeSet != null && this.activeSet.selectedUnits.length > 0)
			this.invalidateAll();
	}
	onMouseEnter(event) {
		//;
		this.activate();
		this.invalidateAll();
		//console.log("onMouseEnter: " + event);
	}
	onMouseExit(event) {
		//;
		this.deactivate();
		this.invalidateAll();
	}
	onRMBDown(event) {
		console.log("RMB down");
	}
	onRMBUp(event) {
	}
	centerOnHex(pt) {
		var x = pt.getX();
		var y = pt.getY();
		for (var i = 0; i < this.m_hexes.length; i++) {
			var hex = this.m_hexes[i];
			if (hex.isOn(this.mousePos)) {
				pt.setPos(hex.getOrigin().getX(), hex.getOrigin().getY());
				return hex;
			}
		}
		return null;
	}
	getChitForHex(hex) {
		var chitsOnHex = hex.getUnitsOnHex();
		//For now just return the top unit
		if (chitsOnHex.length > 0)
			return chitsOnHex[0];
		return null;
	}
	isDefineTerrainMode() {
		//var state = GameSingleton.getInstance().authorMode;//getState();
		//return(state == STATE_DESCRIPTOR.ASSIGN_TERRAIN);
		var ret = GameSingleton.getInstance().authorMode;
		return ret;
	}
	setTerrain(target) {
		var theGame = GameSingleton.getInstance();
		if (theGame.authorMode) { //{getState() == STATE_DESCRIPTOR.ASSIGN_TERRAIN){
			if (theGame.activeTerrain == TERRAIN_DESCRIPTOR.FOREST)
				target.setTerrain(TERRAIN.FOREST);
			else if (theGame.activeTerrain == TERRAIN_DESCRIPTOR.MOUNTAIN)
				target.setTerrain(TERRAIN.MOUNTAIN);
			else if (theGame.activeTerrain == TERRAIN_DESCRIPTOR.FORTIFICATION)
				target.setTerrain(TERRAIN.FORTIFICATION);
			else if (theGame.activeTerrain == TERRAIN_DESCRIPTOR.SEA)
				target.setTerrain(TERRAIN.SEA);
			else if (theGame.activeTerrain == TERRAIN_DESCRIPTOR.CLEARING)
				target.setTerrain(TERRAIN.CLEARING);
			else if (theGame.activeTerrain == TERRAIN_DESCRIPTOR.TOWN)
				target.setTerrain(TERRAIN.TOWN);
			else if (theGame.activeTerrain == TERRAIN_DESCRIPTOR.HILL_L)
				target.setTerrain(TERRAIN.HILL_L);
			else if (theGame.activeTerrain == TERRAIN_DESCRIPTOR.HILL_M)
				target.setTerrain(TERRAIN.HILL_M);
			else if (theGame.activeTerrain == TERRAIN_DESCRIPTOR.HILL_H)
				target.setTerrain(TERRAIN.HILL_H);
		}
	}
	resolveCombat(attacker, enemyUnits) {
		let theGame = GameSingleton.getInstance();

		var enemy = enemyUnits[0];
		//If this is a a ranged unit then check if enemy is directly adjacent or not 
		var longRange = false;
		if (attacker.getRange() > 1) {
			longRange = true;
			//Get this units immediate neighbours
			var immediateNeighbours = this.getAdjacentHexes(attacker.getOwningHex());
			//Find the target hex
			var enemyHex = enemy.getOwningHex();
			//If the target hex is adjacent to the attacking unit then it is acting as long range
			for (var j = 0; j < immediateNeighbours.length; j++) {
				var e = immediateNeighbours[j];
				if (e == enemyHex) {
					longRange = false;
					break;
				}
			}
		}
		attacker.attack(enemy, longRange);
		attacker.completeMove(attacker.getMovementFactor(true));
		theGame.clearSelection();
	}
	doSelection(theGame, onHex) {
		if (onHex == null)
			return;
		var chits = onHex.getUnitsOnHex(); //this.chits;
		if (chits == null)
			return;
		for (var i = 0; i < chits.length; i++) {
			var chit = chits[i];
			if (!chit.isDead()) {
				if (chit.isEligibleForSelection(theGame.getState()) && chit.getMovementFactor(false) > 0) {
					//Draw the chit in a selected state and activate it
					chit.draw(this.context, true);
					theGame.setActivePiece(chit);
					var adj = new Array();
					var movementFactor = chit.getMovementFactor(true);
					if (chit.isEligibleForMove(theGame.getState()) && movementFactor > 0) {
						//Seed the candidates with the start hex to ensure that the recursive algorithm
						//does not over count the total cost when it doubles back to its origin
						adj.push(new adjHex(onHex, 0, 0));
						adj = this.getCandidateDestinations(movementFactor, onHex, adj, false, chit);
					}
					else if (chit.isEligibleForCombat(theGame.getState())) {
						//Get adjacent units
						//this.getEnemyUnits();
						if (chit.getRange() > 1) {
							adj = this.getCandidateDestinations(chit.getRange(), onHex, adj, true, chit);
						}
						else
							adj = this.getCandidateDestinations(chit.getMovementFactor(false), onHex, adj, true, chit);
					}
					chit.setValidDestinations(adj);
				}
				break;
			}
			this.refreshCanvas();
		}
	}
	//Handler for all LMB actions:
	//1. Select a hex to specify terrain
	//2. Select a stack of units
	//3. Select a single unit for move action 
	//4. Select a single unit for combat action 
	//5. Select a destination hex for a move action 
	onLMBDown(event) {
		this.widgets = null;
		var theGame = GameSingleton.getInstance();
		var x = event.offsetX;
		var y = event.offsetY;
		//Stop any timer events
		HexListener.unMonitorHex();
		//First, center the event on the center of the hex
		var pt = new Point2d(x, y);
		var onHex = this.centerOnHex(pt);
		//Not sure how this could happen but...
		if (onHex == null) {
			//alert("null hex selected");
			return;
		}
		//1. User has started the terrain definition mode 
		if (this.isDefineTerrainMode() == true) {
			this.paintTerrain = true;
			//this.setTerrain(onHex);
		}
		//2. Select an active unit for operations
		//a. Move to another hex
		//b. attach another unit
		//c. look at the details of the unit stack
		//Since we don't know the intent at this point we need to do the following:
		//a. if it is a move phase then assume this is a move action and precalculate all potential moves 
		var activeSet = this.getActiveSet();
		var active = this.getActivePiece(); //activeSet.top();
		//1. NO ACTIVE PIECE SELECTED: 
		//No active piece selected yet
		//Select one, which caches it's destinations
		if (active === null && theGame.gameStarted()) {
			this.doSelection(theGame, onHex);
			return;
		}
		if (active != null) { //(active != null){//activeSet != null){
			//Retrieve the valid destinations for this unit. These are valid for both move and combat and will be 
			//highlighted in the draw. 
			var dests = active.getValidDestinations();
			//Combat phase		
			if (theGame.isCombatPhase() && dests != null && dests.filter(function (el) { return onHex == el.hex; }) != null) {
				//Check if the hex has a enemy that still can defend (not dead)
				var units = onHex.getUnitsOnHex();
				if (units == null) {
					//alert("no enemy units found");
					return;
				}
				//Resolve
				this.resolveCombat(active, units);
			}
			//Initial placement phase
			else if (theGame.isPlacementPhase()) { //dests == null){
				active.setPosition(pt.getX(), pt.getY());
				active.setOwningHex(onHex);
				//Reset the pieces on the board			
				this.chits = theGame.getGamePieces().filter(function (el) {
					return (el.isInPlay());
				});
				//Notify other game regions of this being added
				theGame.notifyUnitTransferred(active, this);
			}
			//Movement phase
			else if (theGame.isMovementPhase()) {
				var cost = 10000;
				if (dests != null) {
					//Check if user picked a hex he was allowed to
					var onHexIncluded = false;
					for (var i = 0; i < dests.length; i++) {
						var node = dests[i];
						if (onHex == node.hex) {
							onHexIncluded = true;
							if (node.leastCostToHere < cost)
								cost = node.leastCostToHere;
						}
					}
					if ( onHexIncluded && !active.getPosition().isEqual(pt.getX(), pt.getY())) {
						active.setPosition(pt.getX(), pt.getY());
						active.setOwningHex(onHex);
						//Should happen at the end of a drag		
						if (active.getValidDestinations() != null) {
							active.completeMove(cost);
						}
						active.setValidDestinations(null);
					}
				}
			}
			else {
				alert("Unexpected phase: " + theGame.getState().getUnitTypeName());
			}
			theGame.clearSelection();
			this.refreshCanvas();
			return;
		}
		
	}
	findDestinationExclusions(candidates, thisSide, movementFactor, ignoreTerrain, chit, fromHex) {
		var exclusions = new Array();
		for (var i = 0; i < candidates.length; i++) {
			var hex = candidates[i];
	
			//Find the cost for the unit moving from a hex of one terrain type to a hex of another type
			var toTerrainFlags = hex.getTerrainAndImprovementsFlags();
			var fromTerrainFlags = fromHex.getTerrainAndImprovementsFlags();
			var terrainCost = chit.getMinimumUnitMovementCostForTerrainFlags(toTerrainFlags,
				fromTerrainFlags);
	
	
	
			if (ignoreTerrain)
				terrainCost = COST.CLEARING;
			if (movementFactor < terrainCost) {
				exclusions.push(hex);
				continue;
			}
	
			var unitsOnHex = hex.getUnitsOnHex();
			if (unitsOnHex != null) {
				for (var j = 0; j < unitsOnHex.length; j++) {
					var unit = unitsOnHex[j];
					//If the unit is an enemy and alive 
					if (unit.getOwningPlayer() != thisSide && !unit.isDead()) {
						exclusions.push(hex); //exclude = true;
						break;
					}
				}
			}
		}
		return exclusions;
	}
	path() {
		var path = new Array();
		var cost = 0;
	}
	
	
	removeSubsetFromOriginalArray(original, subset) {
		original = original.filter(function (el) {
			return !subset.includes(el);
		})
		return original;
	}
	
	isInValidSet(hex, validSet) {
		for (var i = 0; i < validSet.length; i++) {
			if (validSet[i].hex == hex)
				return true;
		}
		return false;
	}
	hexHasEnemies(target, friendlySide) {
		var unitsOnHex = target.hex.getUnitsOnHex();
		if (unitsOnHex != null) {
			for (var j = 0; j < unitsOnHex.length; j++) {
				var unit = unitsOnHex[j];
				//If the unit is an enemy and alive 
				if (unit.getOwningPlayer() != friendlySide && !unit.isDead()) {
					return true;
				}
			}
		}
		return false;
	}
	edgesBetween(from, to) {
	}
	
	filterHigherCostDuplicates(validSet, movement) {
		//var filtered = Array();
	
		validSet = validSet.filter(function (a) {
			if (a.leastCostToHere > movement)
				return false;
			return true;
		});
	
		return validSet;
	}
	
	removeDuplicatesFromArray(candidates) {
		var a = new Array();
		for (var i = 0; i < candidates.length(); i++) {
			hex = candidates[i]
			if (!a.includes(hex)) {
				push(hex);
			}
		}
		return a;
	}
	
	lookupAdjFromHex(hex, adjs) {
		for (var i = 0; i < adjs.length; i++) {
			if (adjs[i].hex == hex)
				return adjs[i];
		}
		return null;
	}
}
//
//Prototype for board design
//
function onMouseMoveBC(event) {
	var theCreator = BSBoardCreatorSingleton.getInstance();
	theCreator.getBoard().onMouseMove(event)
}
function onMouseDownBC(event) {
	var theCreator = BSBoardCreatorSingleton.getInstance();
	theCreator.getBoard().onMouseDown(event)
}
function onMouseUpBC(event) {
	var theCreator = BSBoardCreatorSingleton.getInstance();
	theCreator.getBoard().onMouseUp(event)
}
class BSBoardPrototype extends BSBoard{
	constructor() {
		super();
		this.activatePaint = false;
		this.isConnectedImprovement = false;
		this.activeConnectedImprovement = null;
	}
	addEventHandlers() {
		addListenerToElement(this.canvas, onMouseMoveBC, "mousemove");
		addListenerToElement(this.canvas, onMouseDownBC, "mousedown");
		addListenerToElement(this.canvas, onMouseUpBC, "mouseup");
	}
	doPaintTerrain(targetHex) {
		var theCreator = BSBoardCreatorSingleton.getInstance();
		var brush = theCreator.getTerrainBrush();
		targetHex.setTerrain(brush);
	}
	onMouseMove(event) {
		//console.log("onMouseMove");
		if (this.activatePaint == false)
			return;
		this.mousePos.x = event.offsetX;
		this.mousePos.y = event.offsetY;
		var selectPosition = new Point2d(event.offsetX, event.offsetY);
		var onHex = this.centerOnHex(selectPosition);
		if (onHex != null) {
			if(this.isConnectedImprovement){
				this.activeConnectedImprovement.addHex(onHex);
			}
			else{
				this.doPaintTerrain(onHex);
			}
			this.draw();
		}
	}
	onMouseDown(event) {
		//console.log("onMouseDown");
		this.activatePaint = true;
		var theCreator = BSBoardCreatorSingleton.getInstance();
		var brush = theCreator.getTerrainBrush();
		if(brush == TERRAIN.ROAD){
			this.isConnectedImprovement = true;
			if(this.connectedFeatures == null){
				this.connectedFeatures = new Array();
			}
			this.activeConnectedImprovement = new ConnectedFeature(TERRAIN.ROAD);
			this.connectedFeatures.push(this.activeConnectedImprovement);
		}
	}
	onMouseUp(event) {
		//console.log("onMouseUp");
		this.activatePaint = false;
		this.isConnectedImprovement = false;
		this.activeConnectedImprovement = null;
	}
	serialize(data) {
		//Write out board params
		data.table.push({ hexes: [] });
		var h = data.table[0].hexes;
		h.push({ rows: this.hexXDir, cols: this.hexYDir, size: this.size });
		//Write out each hex
		for (var i = 0; i < this.m_hexes.length; i++) {
			this.m_hexes[i].serialize(h);
		}
	}
}

export {BSBoard, BSBoardPrototype}

