/**
 *Game region showing the available units 
 */
import BSCanvasRegion from './CanvasRegionBase'
import {BSGame, GameSingleton} from "./GameBase.js"
import { createUnit, cacheKeyByElement, cacheKeyByValue, retrieveElementByKey, addEvent, HoverListener, Point2d, debugAlert, addListenerToElement, getRandomInt, inside, serialize, scaleImage, addToFrontOfArray, HexListener} from './GeneralUtilities'
import {	PLAYER,
			STATE,
			CHIT_SPACING,
			PLAYER_IDENT } from './Constants.js'

import {drawRect, preDrawShape, postDrawShape } from './DrawUtilities'
import  {onMouseMove,onMouseEnter,onMouseExit,onContextMenu,onMouseDown,onMouseUp} from './EventHandlers'


class BSUnitTray extends BSCanvasRegion {
	constructor(player, bgrd) {
		super();
		this.player = player;
		this.bgrd = bgrd;
		this.newLine = null;
	}
	init(loading) {
		var theGame = GameSingleton.getInstance();
		this.setWidth(theGame.getXDimension());
		this.size = theGame.getGameScale();
		//Available chits1
		//var pieceCount = parseInt(document.getElementById("countId").value);
		var theGame = GameSingleton.getInstance();
		//this.chits = theGame.getPlayerPieces(this.player).filter(function(el){
		var chits = theGame.getPlayerPieces(this.player).filter(function (el) {
			if (!el.isInPlay())
				return true;
		});
		var pieceCount = chits.length;
		this.chitCount = 2 * pieceCount;
		//this.chits = null;//new Array();
		this.numColumns = this.calculateColumns(this.getWidth(), this.chitCount, this.size);
		this.numRows = Math.ceil(this.chitCount / this.numColumns);
		this.setHeight(this.numRows * this.size * CHIT_SPACING); //parseInt(document.getElementById("heightId").value)/2 );
		//Track the mouse position 
		var ident = (this.player == PLAYER.ONE) ? PLAYER_IDENT.PLAYER_ONE : PLAYER_IDENT.PLAYER_TWO;
		this.setIdent(ident);
		this.newLine = document.createElement("P");
		document.body.append(this.newLine);
		this.canvas = this.createCanvas(this.getWidth(), this.getHeight(), this.getIdent());
		//Add event listener
		addListenerToElement(this.canvas, onMouseMove, "mousemove");
		addListenerToElement(this.canvas, onMouseDown, "mousedown");
		addListenerToElement(this.canvas, onMouseEnter, "mouseenter");
		addListenerToElement(this.canvas, onMouseExit, "mouseout");
	}
	populate() {
		//Get the chits from the game
		var theGame = GameSingleton.getInstance();
		//this.chits = theGame.getPlayerPieces(this.player).filter(function(el){
		var chits = theGame.getPlayerPieces(this.player).filter(function (el) {
			if (!el.isInPlay())
				return true;
		});
		//Position the chits in the tray
		var width = this.getWidth();
		var height = this.getHeight();
		var xSpacing = width / this.numColumns;
		var xStart = xSpacing / 2;
		var ySpacing = height / this.numRows;
		var yStart = ySpacing / 2;
		var xPos = xStart;
		var yPos = yStart;
		for (let i = 0; i < chits.length; i++) {
			var chit = chits[i];
			//Set the position inside the corral
			chit.setPosition(xPos, yPos);
			//Increment the spacing
			xPos += xSpacing;
			//Reset XPos if exceeding the width of the corral and start a new row
			if (xPos > width) {
				xPos = xStart;
				yPos += ySpacing;
			}
		}
		this.draw();
	}
	destroy(data) {
		//this.chits = null;
		this.canvas.parentNode.removeChild(this.canvas);
		this.newLine.parentNode.removeChild(this.newLine);
		this.newLine = null;
		this.canvas = null;
	}
	serialize(data) {
	}
	fixup() {
		//Get the unplayed units from the game and load them into this tray
		var theGame = GameSingleton.getInstance();
		var chits = theGame.getPlayerPieces(this.player).filter(function (el) {
			if (!el.isInPlay()) {
				el.init(-1, -1);
				return true;
			}
		});
		this.populate();
	}
	calculateColumns(width, count, size) {
		//Lets put some buffer between each chit
		size = CHIT_SPACING * size;
		var maxColumns = Math.floor(width / size);
		if (count < maxColumns)
			return count;
		return maxColumns;
	}
	getBgrdColor() {
		return this.bgrd;
	}
	draw() {
		if (this.visibility == false)
			return;
		var ctx = this.canvas.getContext("2d");
		drawRect(ctx, 0, 0, this.getWidth(), this.getHeight(), this.getBgrdColor());
		this.drawChits();
	}
	drawChits() {
		var theGame = GameSingleton.getInstance();
		var ctx = this.canvas.getContext("2d");
		var xTest = this.mousePos.x;
		var yTest = this.mousePos.y;
		var chits = theGame.getPlayerPieces(this.player);
		if ( chits != null) {
            chits.filter(function (chit) {
			if (!chit.isInPlay())
				chit.draw(ctx, chit.pickTest(xTest, yTest) == true);
		});
		}
		var active = this.getActivePiece();
		if (active != null && this.isActive() == true) {
			var xOld = active.getPosition().getX();
			var yOld = active.getPosition().getY();
			active.setPosition(xTest, yTest);
			active.draw(ctx, true);
			active.setPosition(xOld, yOld);
		}
	}
	onMouseMove(event) {
		this.mousePos.x = event.offsetX;
		this.mousePos.y = event.offsetY;
		this.invalidateAll();
	}
	onMouseEnter(event) {
		this.activate();
		this.invalidateAll();
	}
	onMouseExit(event) {
		this.deactivate();
		this.invalidateAll();
	}
	onRMBDown(event) {
		alert("RMB");
	}
	onLMBDown(event) {
		var theGame = GameSingleton.getInstance();
		var state = theGame.getState();
		//Only take action if placing the pieces
		if (state != STATE.PLAYER_1_SETUP && state != STATE.PLAYER_2_SETUP)
			return;
		var x = event.offsetX;
		var y = event.offsetY;
		var theGame = GameSingleton.getInstance();
		theGame.clearSelection();
		var chits = theGame.getPlayerPieces(this.player);
		for (var i = 0; i < chits.length; i++) {
			var chit = chits[i];
			if (chit.pickTest(x, y) == true) {
				if (!chit.isEligibleForSelection(state))
					break;
				theGame.setActivePiece(chit);
				break;
			}
		}
		this.invalidateAll();
	}
	//Being notified that a unit has been added to another region so remove it from this one.
	notifyUnitTransferred(unit) {
		//this.chits = this.chits.filter(function(el){
		//	return el != unit;
		//});
	}
	adjustUIForCurrentState(active_state) {
		if (active_state == STATE.PLAYER_1_SETUP && this.player == PLAYER.ONE ||
			active_state == STATE.PLAYER_2_SETUP && this.player == PLAYER.TWO) {
			this.setVisibility(true);
		}
		else {
			this.setVisibility(false);
		}
	}
}

export default BSUnitTray;
	

    /*
    BSUnitTray.prototype.createAvailableChits = function(){
        //Get the chits from the game
        var theGame = GameSingleton.getInstance();
        var game_chits = theGame.getGamePieces();
        //var chits = new Array();
        for(var i=0; i< game_chits.length; i++){
            var chit = game_chits[i];
            if(chit.getOwningPlayer() == this.player){
                this.chits.push(chit);
            }
        }
    
        //Create the chits centered
        var width = this.getWidth();
        var height = this.getHeight();
        
        var xSpacing = width/this.numColumns;
        var xStart = xSpacing/2;
        var ySpacing = height/this.numRows;
        var yStart = ySpacing/2;
        var xPos = xStart;
        var yPos = yStart;
        
        for(i=0; i< this.chits.length; i++){
            var chit = this.chits[i];
            chit.setPosition(xPos, yPos);
            //Increment the spacing
            xPos += xSpacing;
            //Reset XPos if exceeding the width of the corral and start a new row
            if(xPos > width){
                xPos = xStart;
                yPos += ySpacing;
            }
        }
    }
    */
