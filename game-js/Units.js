
import BSUnitBase from './UnitBase'
import BSCombatUnitBase from './CombatUnitBase'
import { createUnit, cacheKeyByElement, cacheKeyByValue, retrieveElementByKey, addEvent, HoverListener, Point2d, debugAlert, addListenerToElement, getRandomInt, inside, serialize, scaleImage, addToFrontOfArray, HexListener} from './GeneralUtilities'
import {UNIT, TERRAIN_FLAGS, UNIT_ROLE, TERRAIN, COS_OF_60 } from './Constants'
import {BSGame, GameSingleton} from './GameBase.js'

var UnitFactorySingleton = (function(){
    var instance = null;
    function createInstance() {
        var game = new BSUnitFactory();
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

class BSUnitFactory {
	constructor() {
	}
	createUnit(type) {
		var t = null;
		switch (type) {
			case UNIT.INFANTRY:
				{
					t = new BSInfantry();
				}
				break;
			case UNIT.CAVALRY:
				{
					t = new BSCavalry();
				}
				break;
			case UNIT.ARTILLERY:
				{
					t = new BSArtillery();
				}
				break;
			case UNIT.BOMBER:
				{
					t = new BSBomber();
				}
				break;
			case UNIT.LEADER:
				{
					t = new BSLeaderUnit();
				}
				break;
			case UNIT.CUSTOM:
			default:
				{
					t = new BSCustomCombatUnit();
				}
				break;
		}
		return t;
	}
	deserialize(obj) {
		//Create the unit
		var type = obj.type;
		var u = this.createUnit(type);
		u.init(-1, -1);
		u.deserialize(obj);
		return u;
	}
}




class BSInfantry extends BSCombatUnitBase{
	constructor() {
		super();
		this.movementFactor = 2;
		this.setAttackFactor(4);
		//this.defenseFactor = 4;
		this.addAllowableTerrain(TERRAIN_FLAGS.CLEARING |
			TERRAIN_FLAGS.FOREST |
			TERRAIN_FLAGS.ROAD |
			TERRAIN_FLAGS.TOWN |
			TERRAIN_FLAGS.HILL |
			TERRAIN_FLAGS.MARSH |
			TERRAIN_FLAGS.RIVER |
			TERRAIN_FLAGS.MOUNTAIN |
			TERRAIN_FLAGS.FORTIFICATION |
			TERRAIN_FLAGS.HILL);
	}
	useDefaultTerrainCost(toTerrain) {
		if (toTerrain & (TERRAIN_FLAGS.ROAD |
			TERRAIN_FLAGS.FOREST))
			return false;
		return true;
	}
	//
	//Override this to provide special cost determination for specific terrain types
	getUnitCostForTerrain(toTerrain, fromTerrain) {
		if (toTerrain & TERRAIN_FLAGS.ROAD) {
			//If starting from a road then the movement rate will double; otherwise,
			//return the highest cost terrain. That's okay as it will just mean the road can't
			//be used yet
			if (fromTerrain & TERRAIN_FLAGS.ROAD)
				return .5;
			else
				return TERRAIN.IMPASSABLE;
		}
	}
	stopOnEntry(terrain) {
		return BSCombatUnitBase.prototype.stopOnEntry.call(this, terrain);
	}
	exertZOC() { return true; }
	identity() { return UNIT.INFANTRY; }
	drawSymbol(ctx, bHighlight) {
		var ul = new Point2d();
		var lr = new Point2d();
		this.calculateSymbolDimensions(ul, lr);
		//
		//Test the extended behavior
		//	this.drawSymbolOutlineEx(ctx, bHighlight, ul, lr,"oval.png");
		//
		this.drawSymbolOutline(ctx, bHighlight, ul, lr);
		//Draw the infantry "X" symbol
		var deltaX = lr.getX() - ul.getX();
		var deltaY = lr.getY() - ul.getY();
		ctx.strokeStyle = "#000000";
		ctx.moveTo(ul.getX(), ul.getY());
		ctx.lineTo(lr.getX(), lr.getY());
		ctx.stroke();
		ctx.moveTo(lr.getX(), ul.getY());
		ctx.lineTo(ul.getX(), lr.getY());
		ctx.stroke();
		//Map an image to the box
	}
	draw(ctx, bHighlight, stacked) {
		//if(this.isDead()) return;
		ctx.save();
		//Base class can draw the unit outline
		BSCombatUnitBase.prototype.draw.call(this, ctx, bHighlight, stacked);
		//Now draw the specific symbol
		this.drawSymbol(ctx, bHighlight);
		this.drawFactors(ctx);
		ctx.restore();
	}
	isSplittable() { return true; }
}



class BSCavalry extends BSCombatUnitBase{
	constructor() {
		super();
		this.movementFactor = 4;
		this.setAttackFactor(6);
		this.setDefenseFactor(4);
	}
	identity() { return UNIT.CAVALRY; }
	exertZOC() { return false; }
	unifiedAttackAndDefend() { return false; }
	drawSymbol(ctx, bHighlight) {
		var ul = new Point2d();
		var lr = new Point2d();
		this.calculateSymbolDimensions(ul, lr);
		this.drawSymbolOutline(ctx, bHighlight, ul, lr);
		//Draw the infantry "X" symbol
		var deltaX = lr.getX() - ul.getX();
		var deltaY = lr.getY() - ul.getY();
		ctx.strokeStyle = "#000000";
		ctx.moveTo(ul.getX(), ul.getY());
		ctx.lineTo(ul.getX() + deltaX, ul.getY() + deltaY);
		ctx.stroke();
	}
	draw(ctx, bHighlight, stacked) {
		//if(this.isDead()) return;
		ctx.save();
		//Base class can draw the unit outline
		BSCombatUnitBase.prototype.draw.call(this, ctx, bHighlight, stacked);
		//Now draw the specific symbol
		this.drawSymbol(ctx, bHighlight);
		this.drawFactors(ctx);
		ctx.restore();
	}
	isSplittable() { return true; }
}

//Artillery
class BSArtillery extends BSCombatUnitBase{
	constructor() {
		super();
		this.movementFactor = 1;
		this.setAttackFactor(8);
		this.setDefenseFactor(2);
		this.range = 2;
	}
	identity() { return UNIT.ARTILLERY; }
	unifiedAttackAndDefend() { return false; }
	draw(ctx, bHighlight, stacked) {
		//if(this.isDead()) return;
		ctx.save();
		//Base class can draw the unit outline
		BSCombatUnitBase.prototype.draw.call(this, ctx, bHighlight, stacked);
		//Now draw the specific symbol
		this.drawSymbol(ctx, bHighlight);
		this.drawFactors(ctx);
		ctx.restore();
	}
	drawSymbol(ctx, bHighlight) {
		var ul = new Point2d();
		var lr = new Point2d();
		this.calculateSymbolDimensions(ul, lr);
		this.drawSymbolOutline(ctx, bHighlight, ul, lr);
		//Now draw a black circle
		var rad = 2 * ((lr.getX() - ul.getX()) / 2) / 3;
		var deltaX = lr.getX() - ul.getX();
		var deltaY = lr.getY() - ul.getY();
		var xCtr = ul.getX() + deltaX / 2;
		var yCtr = ul.getY() + deltaY / 2;
		ctx.strokeStyle = "#000000";
		ctx.fillStyle = "#000000";
		ctx.beginPath();
		ctx.arc(xCtr, yCtr, rad, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
	}
}

//Bomber
class BSBomber extends BSCombatUnitBase{
	constructor() {
		super();
		this.movementFactor = 4;
		this.getAttackFactor(6);
		//this.defenseFactor = 2;
		this.range = 3;
	}
	identity() { return UNIT.BOMBER; }
	draw(ctx, bHighlight, stacked) {
		//if(this.isDead()) return;
		ctx.save();
		//Base class can draw the unit outline
		BSCombatUnitBase.prototype.draw.call(this, ctx, bHighlight, stacked);
		//Now draw the specific symbol
		this.drawSymbol(ctx, bHighlight);
		this.drawFactors(ctx);
		ctx.restore();
	}
	drawSymbol(ctx, bHighlight) {
		var ul = new Point2d();
		var lr = new Point2d();
		this.calculateSymbolDimensions(ul, lr);
		this.drawSymbolOutline(ctx, bHighlight, ul, lr);
		//Now draw a black circle
		var rad = 2 * ((lr.getX() - ul.getX()) / 2) / 3;
		var deltaX = lr.getX() - ul.getX();
		var deltaY = lr.getY() - ul.getY();
		var xCtr = ul.getX() + deltaX / 2;
		var yCtr = ul.getY() + deltaY / 2;
		ctx.strokeStyle = "#000000";
		ctx.beginPath();
		ctx.arc(xCtr, yCtr, rad, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
	}
	getRange() {
		return this.movementFactor;
	}
	ignoreTerrain() {
		return true;
	}
}

//Custom unit type
//Allows free definition of new unit type
class BSCustomCombatUnit extends BSCombatUnitBase{
	constructor() {
		super();
		this.movementFactor = 4;
		this.setAttackFactor(6);
		this.typeTag = "Phalanx";
		this.imageTag = "Phalanx.png";
		this.splittable = true;
		this.ZOC = "false";
		this.role = UNIT_ROLE.COMBAT_UNIT;
		this.stackingCost = 1;
	}
	getRole(){
		return this.role;
	}
	isSplittable() { return this.splittable; }
	identity() { return UNIT.CUSTOM; }
	exertZOC() { return this.ZOC; }
	drawSymbol(ctx, bHighlight) {
		var ul = new Point2d();
		var lr = new Point2d();
		this.calculateSymbolDimensions(ul, lr);
		//Draw the unit with an image file that is supplied for this unit type
		this.drawSymbolOutlineEx(ctx, bHighlight, ul, lr, "http://localhost:8082/images/" + this.imageTag);
	}
	draw(ctx, bHighlight, stacked) {
		//if(this.isDead()) return;
		ctx.save();
		//Base class can draw the unit outline
		BSCombatUnitBase.prototype.draw.call(this, ctx, bHighlight, stacked);
		//Now draw the specific symbol
		this.drawSymbol(ctx, bHighlight);
		this.drawFactors(ctx);
		ctx.restore();
	}
	drawFactors(ctx) {
		if (this.role == UNIT_ROLE.LEADER) {
			var x = this.pos.getX();
			var y = this.pos.getY();
			var size = this.size * COS_OF_60 * 1.2;
			var fontSize = size;
			var fontStr = fontSize + "px" + " Courier New";
			ctx.font = fontStr;
			//ctx.strokeText("L", x-1/5*size, y);
			ctx.strokeText(this.getMovementFactor(true), x - 1 / 5 * size, y + 4 * size / 5);
		}
		else if (this.role == UNIT_ROLE.FIXED_UNIT) {
			var x = this.pos.getX();
			var y = this.pos.getY();
			var size = this.size * COS_OF_60;
			var fontSize = 3 * size / 4;
			var fontStr = fontSize + "px" + " Courier New";
			ctx.font = fontStr;
			//ctx.strokeText("L", x-1/5*size, y);
			ctx.strokeText(this.getDefenseFactor(), x - size / 3, y + 7 * size / 8);
		}
		else
			BSCombatUnitBase.prototype.drawFactors.call(this, ctx);
	}
	unifiedAttackAndDefend() {
		if (this.role == UNIT_ROLE.FIXED_UNIT) {
			return false;
		}
		return true;
	}
	isDead() {
		let role = this.getRole();

		if (role == UNIT_ROLE.LEADER || role == UNIT_ROLE.FIXED_UNIT)
			return false;

		return super.isDead();
	}
	getSerializationObject(obj) {
		BSCombatUnitBase.prototype.getSerializationObject.call(this, obj);
		obj.typeTag = this.typeTag;
		obj.imageTag = this.imageTag;
		obj.splittable = this.splittable;
		obj.ZOC = this.ZOC;
		obj.role = this.role;
		obj.shape = this.shape;
	}
	deserialize(obj) {
		BSCombatUnitBase.prototype.deserialize.call(this, obj);
		//Serialize the unit
		this.typeTag = obj.typeTag;
		this.imageTag = obj.imageTag;
		this.splittable = obj.splittable;
		this.ZOC = obj.ZOC == undefined ? false : obj.ZOC;
		this.role = obj.role == undefined ? UNIT_ROLE.COMBAT_UNIT : obj.role;
		this.stackingCost = (obj.role == UNIT_ROLE.LEADER || obj.role == UNIT_ROLE.FIXED_UNIT) ? 0 : 1;
		if (obj.role == UNIT_ROLE.FIXED_UNIT) {
			this.size *= 1.3;
		}
	}
	doSplit() {
		var factory = UnitFactorySingleton.getInstance();
		var clone = factory.createUnit(this.identity());
		clone.init2(this);
		//Add clone to list of units
		var theGame = GameSingleton.getInstance();
		theGame.getGamePieces().push(clone);
	}
	//BSCustomCombatUnit.prototype.init = function(x, y){
	//	BSCombatUnitBase.call(this);
	//	this.pos = new Point2d(x, y);
	//}
	init2(original) {
		this.init(original.pos.getX(), original.pos.getY());
		//Divide the combat strength
		original.setAttackFactor(original.getAttackFactor() / 2);
		this.setAttackFactor(original.getAttackFactor());
		//Divide defensive strength if different than combat
		if (!original.unifiedAttackAndDefend()) {
			original.setDefenseFactor(original.getDefenseFactor() / 2);
			this.setDefenseFactor(original.getDefenseFactor() / 2);
		}
		this.movementFactor = original.movementFactor;
		this.moveConsumed = original.moveConsumed;
		this.typeTag = original.typeTag;
		this.imageTag = original.imageTag;
		this.setOwningHex(original.owningHex);
		this.setSize(original.size);
		this.setOwningPlayer(original.owningPlayer);
	}
	getUnitTypeName() {
		//For custom units the identity == custom, but the type name is user specified
		return this.typeTag;
	}
}

//
//Leader units
//
class BSLeaderUnit extends BSCombatUnitBase{
	constructor() {
		super();
		this.setStackingCost(0);
		this.movementFactor = 4;
		this.attackFactor = 0;
		this.defenseFactor = 0;
	}
	identity() { return UNIT.LEADER; }
	getUnitTypeName() {
		//For built in units the type name is the same as the identity
		return this.identity();
	}
	drawOutline(ctx, bHighlight, stacked) {
		ctx.save();
		//Get the geometry needed to draw the unit
		var x = this.pos.getX();
		var y = this.pos.getY();
		var size = this.size * COS_OF_60 * 1.3;
		var lineWidth = stacked ? 3 : 1;
		//Set up context params that are not tied to stacking
		ctx.strokeStyle = "#000000";
		//If stacked then draw an outline slightly offset
		if (stacked) {
			var offsetFactor = 1;
			//Draw slightly offset first		
			ctx.beginPath();
			ctx.rect(x - size - offsetFactor, y - size - offsetFactor, 2 * size, 2 * size); //x+this.size, y+this.size);
			if (bHighlight)
				ctx.fillStyle = this.highlightFill;
			else
				ctx.fillStyle = this.getFill();
			ctx.lineWidth = lineWidth;
			ctx.stroke();
			ctx.fill();
		}
		this.drawCircle(ctx, bHighlight, x, y, size, lineWidth);
		ctx.restore();
	}
	calculateSymbolDimensions(upperLeft, lowerRight) {
		var x = this.pos.getX();
		var y = this.pos.getY();
		var size = this.size * COS_OF_60 * 1.2;
		var symSize = .6 * size;
		upperLeft.setX(x - symSize);
		upperLeft.setY(y - 5 * size / 6);
		lowerRight.setX(upperLeft.getX() + 2 * symSize);
		lowerRight.setY(upperLeft.getY() + 2 * symSize);
	}
	drawFactors(ctx) {
		var x = this.pos.getX();
		var y = this.pos.getY();
		var size = this.size * COS_OF_60 * 1.2;
		var fontSize = size;
		var fontStr = fontSize + "px" + " Courier New";
		ctx.font = fontStr;
		ctx.strokeText("L", x - 1 / 5 * size, y);
		ctx.strokeText(this.getMovementFactor(true), x - 1 / 5 * size, y + 4 * size / 5);
	}
	drawSymbol(ctx, bHighlight) {
	}
	draw(ctx, bHighlight, stacked) {
		this.drawOutline(ctx, bHighlight, stacked);
		this.drawFactors(ctx);
	}
	isDead() {
		return false;
	}
}



export { UnitFactorySingleton, BSUnitFactory, BSCustomCombatUnit, BSLeaderUnit, BSBomber }
//import { UnitFactorySingleton, BSUnitFactory } from './Units.js'
//import { UnitFactorySingleton, BSUnitFactory } from '..\..\game-js\Units.js'
