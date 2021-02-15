/**
 *BSHex
 *Structure:
    Declaration and Initialization
    External accessors and mutators
    Helper methods
    Draw methods
    Serialization
 *
 **/

import TerrainFactory from './TerrainFactory'
import { createUnit, cacheKeyByElement, cacheKeyByValue, retrieveElementByKey, addEvent, HoverListener, Point2d, debugAlert, addListenerToElement, getRandomInt, inside, serialize, scaleImage, addToFrontOfArray, HexListener} from './GeneralUtilities'
import {	DEFAULT_BOARD_SIZE, 
	SIN_OF_60, 
	COS_OF_60, 
	COS_OF_30, 
	SIN_OF_30,
	BOARD_SIZE,
	BOARD_SIZE_TAG,
	TERRAIN, 
	NOTIFICATIONS } from './Constants.js'


/*****************************
*BS Hex Class declaration and initialization
*****************************/
class BSHex {
	constructor(/*X, Y, */ owner, rowIndex, columnIndex, terrain) {
		//Persisted data
		if(arguments.length > 1)
		{
			this.row = rowIndex;
			this.col = columnIndex;
			this.terrainImprovements = null;
			this.owner = owner;
			//IMPORTANT
			//Todo: need to allow terrain overlays. The idea is that terrain like roads and forts overlay the underlying terrain
			//
			var terrain = TerrainFactory(terrain); //Should be persisted as the string; the object can be recreated 
			if (terrain.isImprovement()) {
				this.addImprovement(terrain);
			}
			else
				this.theTerrain = terrain;
			this.definingRadius = this.owner.getHexSize();
			//Derived data cached for quick calculations
			this.origin = null;
			this.definingPoints = null;
			this.unitsOnThis = null;
			//Other transient data
			this.underZOCInfluence = false;
			this.init();
		}
		else if(arguments.length == 1){
			this.owner = owner;
			this.definingRadius = owner.getHexSize();
		}
	}
	//Generate the points of the hex
	init() {
		var xHexOffset = this.definingRadius * (1 + COS_OF_60);
		var yHexOffset = 2 * this.definingRadius * COS_OF_30;
		var xInitOffset = (2 * SIN_OF_30 + 1) * (this.definingRadius * COS_OF_60);
		var xPos = xInitOffset + (this.row - 1) * xHexOffset;
		var yPos = 0;
		var rem = this.row % 2;
		if (rem == 0)
			yPos = (2 * this.col) * this.definingRadius * COS_OF_30;
		else
			yPos = (2 * this.col - 1) * this.definingRadius * COS_OF_30;
		this.m_x = xPos;
		this.m_y = yPos;
		this.generateDefiningPoints();
	}
    /**************************
    *BS Hex external facing accessors/mutators
    **************************/
	addImprovementFromType(type){
		var terrain = TerrainFactory(type); //Should be persisted as the string; the object can be recreated 
		return this.addImprovement(terrain);
	}
	addImprovement(improvement) {
		if(improvement.isCompatibleWithBaseTerrain(this.theTerrain)){
			if (!this.improvementExists(improvement)) {
				if (this.terrainImprovements == null) {
					this.terrainImprovements = new Array();
				}
		
				improvement.setOwningHex(this);
				this.terrainImprovements.push(improvement);
				console.log("add improvement:", improvement);
				return true;
			}
		}
		return false;
	}
	improvementExists(improvement) {
		if (this.terrainImprovements != null) {
			var length = this.terrainImprovements.length;
			for (var i = 0; i < length; i++) {
				let el = this.terrainImprovements[i];
				if (el.type == improvement.type)
					return true;
			}
		}
		return false;
	}
	removeImprovements(){
		this.terrainImprovements = null;
	}
	removeImprovement(improvement) {
		this.terrainImprovements = this.terrainImprovements.filter(function (el) {
			return el != improvement;
		});
		if (this.terrainImprovements.length == 0)
			this.terrainImprovements = null;
	}
	removeIncompatibleImprovements() {

		let baseTerrain = this.theTerrain;
		this.terrainImprovements = this.terrainImprovements.filter(function (el) {
			if(el == null)
				return false;
			return el.isCompatibleWithBaseTerrain(baseTerrain);
		});
		if (this.terrainImprovements.length == 0)
			this.terrainImprovements = null;

		this.owner.notify(NOTIFICATIONS.INVALID_IMPROVEMENT, this);	
	}

	hasImprovements() {
		return this.terrainImprovements != null;
	}
	hasCompatibleImprovement(improvement) {
		if (this.hasImprovements() == false)
			return false;
		var status = false;
		this.terrainImprovements.forEach(function (i) {
			if (i.type == improvement.type)
				status = true;
		});
		return status;
	}
	getTerrain() {
		return this.theTerrain;
	}
	getImprovements()
	{
		let a = new Array();
		if (this.terrainImprovements != null) {
			for (var i = 0; i < this.terrainImprovements.length; i++) {
				a.push(this.terrainImprovements[i]);
			}
		}
		return a;
	}
	getTerrainAndImprovementsFlags() {
		var a = new Array();
		a.push(this.theTerrain.getTerrainFlag());
		if (this.terrainImprovements != null) {
			for (var i = 0; i < this.terrainImprovements.length; i++) {
				a.push(this.terrainImprovements[i].getTerrainFlag());
			}
		}
		return a;
	}
	setTerrain(terrain) {
		var t = TerrainFactory(terrain);
		if (!t.isImprovement()) {
			if (!this.theTerrain.isEqual(t))
				this.theTerrain = t;
			//Clear out any improvements since these may no longer be compatible
			if(this.hasImprovements()){
				this.removeIncompatibleImprovements();
			}	
		}
		else {
			this.addImprovement(t);
		}
	}
	getDefenseFactor() {
		return this.theTerrain.getDefenseFactor();
	}
	stackingLimit() {
		return 100; //this.theTerrain.getStackingLimit();
	}
	addUnit(unit) {
		if (this.unitsOnThis == null) {
			this.unitsOnThis = new Array();
		}
		if (this.unitsOnThis.length < this.stackingLimit()) {
			//Push the new unit to the front of the stack
			this.unitsOnThis.reverse().push(unit);
			this.unitsOnThis.reverse();
			if (this.underZOCInfluence)
				unit.endMove();
			return true;
		}
		return false;
	}
	removeUnit(unit) {
		//Remove the unit 
		this.unitsOnThis = this.unitsOnThis.filter(function (a) {
			return a != unit;
		});
		if (this.unitsOnThis.length == 0)
			this.unitsOnThis = null;
	}
	getUnitsOnHex() {
		return this.unitsOnThis;
	}
	getTop() {
		if (this.unitsOnThis != null && this.unitsOnThis.length > 0)
			return this.unitsOnThis[0];
		return null;
	}
	setTop(unit) {
		this.unitsOnThis = this.unitsOnThis.filter(function (el) {
			return el != unit;
		});
		this.unitsOnThis.unshift(unit);
		//addToFrontOfArray(this.unitsOnThis, unit);
	}
	rotateUnits() {
		if (this.unitsOnThis != null) {
			var front = this.unitsOnThis.shift();
			this.unitsOnThis.push(front);
		}
	}
	getRow() { return this.row; }
	getCol() { return this.col; }
	getCost() {
		return this.theTerrain.getMovementCost();
	}
	getOrigin() { return this.origin; }
	setUnderZOCInfluence(b) {
		this.underZOCInfluence = b;
	}
	resetForNewTurn() {
		this.underZOCInfluence = false;
	}
	isNoEntryAllowed() {
		if (this.theTerrain.isImpassable())
			return true;
		return false;
	}
	isStopOnEntry() {
		if (this.theTerrain.isStopOnEntry() || this.underZOCInfluence)
			return true;
		return false;
	}
	//Test to see if a point is on the hex
	isOn(ptTest) {
		//if(this.definingPoints == null)
		//	this.generateDefiningPoints();
		return inside(ptTest, this.definingPoints);
	}
	getAdjacencies() {
		var adj = this.owner.getAdjacentHexes(this);
		return adj;
	}
    /**************************
    *BS Hex Class helpers
    **************************/
	scale(size) {
		var scaleFactor = size / this.definingRadius;
		this.definingRadius = size;
		this.init();
		if (this.unitsOnThis != null) {
			this.unitsOnThis.forEach(function (unit) {
				var pos = unit.getOwningHex().getOrigin();
				unit.setPosition(pos.getX(), pos.getY());
			});
		}
	}
	generateDefiningPoints() {
		this.origin = new Point2d(this.m_x, this.m_y);
		this.definingPoints = new Array();
		var numberOfSides = 6;
		var size = this.definingRadius;
		var pt = this.origin;
		var Xcenter = pt.getX();
		var Ycenter = pt.getY();
		this.definingPoints.push(new Point2d(Xcenter + size * Math.cos(0), Ycenter + size * Math.sin(0)));
		var pt = this.definingPoints[0];
		pt.getX();
		//Find the six definiing points of the hex and cache them to speed up draw
		for (var i = 1; i <= numberOfSides; i += 1) {
			this.definingPoints.push(new Point2d(Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides)));
		}
	}
	//Test if this hex is at the position specified
	isEqual(x, y) {
		if ((this.m_x == x) && (this.m_y == y))
			return true;
		return false;
	}
    /**************************
    *BS Hex Class draw functions
    **************************/
	drawUnitFlyout(ctx, selectionPos) {
		//console.log("Enter draw Flyout:" + this);
		var selection = null;
		if (this.unitsOnThis != null && this.unitsOnThis.length > 1) {
			//drawRect(ctx, );
			//Draw the units in a flyout to the right of the origin point separated by a 10% space
			//var len = this.unitsOnThis.length;
			//console.log("Length: " + len);
			var spacing = COS_OF_30 * 2 * this.definingRadius;
			//Set the position of each unit, draw, and then return the unit 
			for (var i = 1; i < this.unitsOnThis.length; i++) {
				var el = this.unitsOnThis[i];
				el.translate(spacing * i, 0);
				el.draw(ctx, false);
				if (selectionPos != null) {
					if (el.pickTest(selectionPos.getX(), selectionPos.getY())) {
						el.draw(ctx, true);
						console.log("Target hit");
						selection = el;
					}
				}
				el.translate(-spacing * i, 0);
			}
		}
		return selection;
	}
	drawOutline(ctx) {
		ctx.beginPath();
		ctx.moveTo(this.definingPoints[0].getX(), this.definingPoints[0].getY());
		var len = this.definingPoints.length;
		for (var i = 1; i < len; i++) {
			var pt = this.definingPoints[i];
			ctx.lineTo(pt.getX(), pt.getY());
		}
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 1;
		ctx.stroke();
	}
	drawImprovements(ctx, emphasis) {
		if (this.terrainImprovements != null) {
			var x = this.origin.getX();
			var y = this.origin.getY();
			var r = this.definingRadius;
			this.terrainImprovements.forEach(function (improvement) {
				improvement.draw(ctx, x, y, r, emphasis);
			});
		}
	}
	drawBaseTerrain(ctx, emphasize){
		//Cache the current context
		ctx.save();
		//Draw the outline of the hex
		this.drawOutline(ctx);
		//Draw the image
		//First set the hex to be the clipping region so the image draws within the hex only
		ctx.clip();
		if (this.theTerrain != undefined)
			this.theTerrain.draw(ctx, this.origin.getX(), this.origin.getY(), this.definingRadius, emphasize);
		ctx.restore();
	}
	drawHexImprovements(ctx, emphasize){
		//Cache the current context
		ctx.save();
		this.drawImprovements(ctx, emphasize);
		ctx.restore();
	}
	
	draw(ctx, emphasize) {
		//Cache the current context
		ctx.save();
		//Draw the outline of the hex
		this.drawOutline(ctx);
		//Draw the image
		//First set the hex to be the clipping region so the image draws within the hex only
		ctx.clip();
		if (this.theTerrain != undefined)
			this.theTerrain.draw(ctx, this.origin.getX(), this.origin.getY(), this.definingRadius, emphasize);
		this.drawImprovements(ctx, emphasize);
		ctx.restore();
	}
	drawUnits(ctx) {
		if (this.unitsOnThis != null && this.unitsOnThis.length > 0) {
			this.unitsOnThis[0].draw(ctx, false, this.unitsOnThis.length > 1);
		}
	}
	getShade(ctx, emphasize) {
		return this.theTerrain.getColor(emphasize);
	}
	getImage(ctx, emphasize) {
		if (emphasize) {
			return this.theTerrain.getSelectedImage();
		}
		return this.theTerrain.getNormalImage();
	}
    /**************************
    *BS Hex Class de/serialization
    **************************/
	loadInit(rowIndex, columnIndex, terrainType){
		this.row = rowIndex;
		this.col = columnIndex;
		this.terrainImprovements = null;
		//Get the terrain to add
		let terrain;
		if(terrainType == TERRAIN.FORTIFICATION)
		{
			terrain = TerrainFactory(TERRAIN.CLEARING);//Should be persisted as the string; the object can be recreated
			this.addImprovement(TerrainFactory(TERRAIN.FORTIFICATION));
		}
		else
			terrain = TerrainFactory(terrainType);//Should be persisted as the string; the object can be recreated
		this.theTerrain = terrain;
			//Assign as base terrain or add to improvements array as appropriate
		
		//if(!terrain.isImprovement()){
		//	this.theTerrain = terrain;
		//}
		//else{
		//	this.addImprovement(terrain);
		//}

		//Derived data cached for quick calculations
		this.origin = null;
		this.definingPoints = null;
		this.unitsOnThis = null;

		//Other transient data
		this.underZOCInfluence = false;

		this.init();
	}

	serialize(table) {
		//table.push({ row: this.row, column: this.col, terrain: this.theTerrain.type, radius: this.radius });
		let tableEntry = {};
		tableEntry.row = this.row;
		tableEntry.column = this.col;
		tableEntry.terrain = this.theTerrain.type;
		//Iterate over the improvements
		let improvements = this.getImprovements();
		tableEntry.numImprovements = improvements.length;
		if(improvements.length > 0){
			let impEntries = [];

			for(let i=0; i< improvements.length; i++){
				let imp = improvements[i];
				impEntries.push(imp.type);
			}
			let tmp = JSON.stringify(impEntries);
			tableEntry.improvements = tmp;
		}
		table.push(tableEntry);
	}
	deserialize(data) {
		//data.table.push({ row : this.row, column : this.col, terrain : this.theTerrain.type, radius : this.radius});
		//this.row = data
		this.loadInit(data.row, data.column, data.terrain);
		if(data.numImprovements > 0 ){
			let improvements = JSON.parse(data.improvements);
			for(let i=0; i< improvements.length; i++){
				let imp = improvements[i];
				let terrain = TerrainFactory(imp);
				this.addImprovement(terrain);	
			}
		}

		if (data.improvement != undefined) {
			this.addImprovement(TerrainFactory(data.improvement));
		}
		//this.init();
	}
}


class BSHexFactory {
	constructor() {
	}
	createHex(owner) {
		return new BSHex(owner);
	}
	createHex2(i, j, terrain, owner) {
		var h = new BSHex(i, j, terrain, owner);
		h.init();
		return h;
	}
}

var HexFactorySingleton = (function(){
    var instance = null;
    function createInstance() {
        var factory = new BSHexFactory();
        return factory;
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


export {BSHex, BSHexFactory, HexFactorySingleton}



