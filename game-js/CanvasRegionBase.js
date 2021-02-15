/**
 * 
 */
import BSDrawable from './Drawable'
import {BSGame, GameSingleton} from './GameBase.js'
import {   Point2d  } from './GeneralUtilities'
import BSSelectionSet from './UnitSelectionSet.js'

export default class BSCanvasRegion extends BSDrawable{
	constructor() {
		super();
		this.width = 200;
		this.height = 300;
		this.canvas = null;
		this.ident = null;
		//this.mousePos = null;
		this.mousePos = new Point2d(-1, -1);
		this.activeSet = null;
		this.activeRegion = false;
		this.visibility = true;
	}
	//Overrideables
	//Management
	init(loading) { }
	draw() { }
	destroy() { }
	adjustUIForCurrentState(state) { }
	invalidateUnits() { }
	notify(message, context){}
	//BSCanvasRegion.prototype.createCanvas = function(width, height, id){}
	invalidate() {
		this.refreshCanvas();
	}
	//Allow regions to customize how they populate with their units
	populate() { }
	//File I/O 
	serialize(data) { }
	deserialize(data) { }
	//Fixup references after deserialization
	fixup() { }
	//Allow the region to react after a unit has been transferred from another region
	notifyUnitTransferred(unit) { }
	//Scale the game up or down
	scale(newSize) { }
	//Apply transient Zones of control to a region
	applyZOCs(playerId) { }
	addEventHandlers() { }
	//Event handlers
	onMouseMove(e) { }
	onLMBDown(e) { }
	onLMBUp(e) { }
	onRMBDown(e) { }
	onMouseEnter(e) { }
	onMouseExit(e) { }
	onRMBUp(e) { }
	onContextMenu(e) { }
	//Do not override
	//Accessors/mutators
	setWidth(w) { this.width = w; }
	setHeight(h) { this.height = h; }
	getWidth() { return this.width; }
	getHeight() { return this.height; }
	setIdent(id) { this.ident = id; }
	getIdent() { return this.ident; }
	clearActive() {
		if (this.activeSet != null) {
			this.activeSet.clear();
			this.activeSet = null;
		}
	}
	addToActiveSet(a) {
		if (a == null) {
			this.activeSet.clear();
			this.activeSet = null;
		}
		else {
			this.activeSet = new BSSelectionSet();
			this.activeSet.addToSelection(a); // = a; 
		}
	}
	getActivePiece() {
		if (this.activeSet == null)
			return null;
		return this.activeSet.getTopSelection();
	}
	getActiveSet() {
		return this.activeSet;
	}
	toggleActive() { this.activeRegion = !this.activeRegion; }
	isActive() { return this.activeRegion; }
	activate() { this.activeRegion = true; }
	deactivate() { this.activeRegion = false; }
	resetForNewTurn() { }
	resetAfterPlayerTurn() { }
	resolve() { }
	//Helpers
	refreshCanvas() {
		this.draw();
	}
	createCanvas(width, height, id) {
		var theCanvas = document.createElement("canvas");
		theCanvas.id = id;
		var b = document.body;
		b.appendChild(theCanvas);
		theCanvas.width = width;
		theCanvas.height = height;
		theCanvas.visibilty = 'visible';
		//this.widgets = new Array();
		return theCanvas;
	}
	invalidateAll() {
		//debugger;
		var theGame = GameSingleton.getInstance();
		theGame.invalidateRegions();
	}
	setVisibility(visible) {
		this.visibility = visible;
		//Make sure the region has been initialized. 
		//If loading it would not yet be initialized
		if (this.canvas == null)
			return;
		if (visible)
			this.canvas.style.visibility = 'visible';
		else
			this.canvas.style.visibility = 'hidden';
	}
	getActiveTarget() {
		//Check for a modal child of this canvas
		if (this.widgets != null && this.widgets.length > 0) {
			//console.log("Widgets Length: " + this.widgets.length);
			if (this.widgets[0].isModal())
				return this.widgets[0];
		}
		//No modal dialog so the canvas is the target	
		return this;
	}

}


	










