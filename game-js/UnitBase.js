/**
 *
 */

import { BSGame, GameSingleton } from './GameBase'
import { UNIT_ERA, UNIT_SHAPE, TERRAIN_FLAGS, COST, STATE, PLAYER, PLAYER1_COLOR, PLAYER2_COLOR } from './Constants'
import {  Point2d } from './GeneralUtilities'

 class BSUnitBase {
	constructor() {
		this.pos = null;
		this.size = -1;
		this.highlightFill = "#ff00ff";
		this.suspendedFill = "#BEBEBE";
		this.movementFactor = 2;
		this.range = 1;
		this.moveConsumed = 0;
		this.moveCompleted = false;
		this.attackFactor = 2;
		this.defenseFactor = 0;
		this.owningPlayer = -1;
		this.validDestinations = null;
		this.owningHex = null;
		this.row = -1;
		this.col = -1;
		this.stackingCost = 0;
		this.turnOfAppearance = 0; //By default all units appear at the outset of the game
		this.era = UNIT_ERA.PRE_HISTORIC;
		this.shape = UNIT_SHAPE.SQUARE;
		this.allowableTerrain = TERRAIN_FLAGS.CLEARING | TERRAIN_FLAGS.MOUNTAIN;
	}
	//
	//Terrain and movement related methods
	//
	removeAllowableTerrain(terrain) {
		if (this.allowableTerrain | terrain)
			this.allowableTerrain -= terrain;
	}
	addAllowableTerrain(terrain) {
		this.allowableTerrain |= terrain;
	}
	isAllowableTerrain(terrain) {
		if (terrain & this.allowableTerrain)
			return true;
		return false;
	}
	getUnitCostForTerrain(toTerrain, fromTerrain) {
		return COST.CLEARING;
	}
	getRole(){
		return COMBAT_UNIT;
	}
	useDefaultTerrainCost(toTerrain) {
		return true;
	}
	defaultTerrainCost(toTerrain) {
		if (toTerrain & TERRAIN_FLAGS.FOREST)
			return COST.FOREST;
		if (toTerrain & TERRAIN_FLAGS.ROAD)
			return COST.ROAD;
		if (toTerrain & TERRAIN_FLAGS.CLEARING)
			return COST.CLEARING;
		if (toTerrain & TERRAIN_FLAGS.MOUNTAIN)
			return COST.MOUNTAIN;
		if (toTerrain & TERRAIN_FLAGS.RIVER)
			return COST.RIVER;
		if (toTerrain & TERRAIN_FLAGS.TOWN)
			return COST.TOWN;
		if (toTerrain & TERRAIN_FLAGS.FORTIFICATION)
			return COST.FORTIFICATION;
		if (toTerrain & TERRAIN_FLAGS.HILL)
			return COST.HILL;
		if (toTerrain & TERRAIN_FLAGS.MARSH)
			return COST.MARSH;
		if (toTerrain & TERRAIN_FLAGS.SEA)
			return COST.SEA;
		//Unknown terrain so treat as impassable
		return COST.IMPASSABLE;
	}
	getMinimumUnitMovementCostForTerrainFlags(toFlags, fromFlags) {
		//Need to look pairwise for the from and to flags to find the lowest cost combination
		//and then return that cost
		var lowestCost = COST.IMPASSABLE;
		var lowestCostFlag = TERRAIN_FLAGS.IMPASSABLE;
		var me = this;
		for (var i = 0; i < toFlags.length; i++) {
			var toFlag = toFlags[i];
			if (this.isAllowableTerrain(toFlag) == false)
				continue;
			for (var j = 0; j < fromFlags.length; j++) {
				var fromFlag = fromFlags[j];
				var cost;
				if (this.useDefaultTerrainCost(toFlag)) {
					cost = this.defaultTerrainCost(toFlag);
				}
				else {
					cost = this.getUnitCostForTerrain(toFlag, fromFlag);
				}
				//Check to see if the unit would have to stop on entry into the toTerrain. 
				//If so, the cost will be the greater of the found cost or the unit's available movement
				//factor
				if (this.stopOnEntry(toFlag) == true && cost < this.getMovementFactor()) {
					cost = this.getMovementFactor();
				}
				if (cost < lowestCost) {
					lowestCost = cost;
					lowestCostFlag = toFlag;
				}
			}
		}
		return lowestCost;
	}
	getTerrainCost(toTerrain, fromTerrain) {
		return this.getUnitCostForTerrain(toTerrain, fromTerrain);
	}
	//Override to change the behavior
	stopOnEntry(terrain) {
		if (terrain & (TERRAIN_FLAGS.MOUNTAIN | TERRAIN_FLAGS.RIVER | TERRAIN_FLAGS.MARSH | TERRAIN_FLAGS.FOREST))
			return true;
		return false;
	}
	//Override this to allow units to differ in behavior depending on terrain
	getMovementCapacity() {
		return this.movementFactor;
	}
	endMove() {
		//this.moveConsumed = this.movementFactor;
		this.moveCompleted = true;
	}
	completeMove(cost) {
		this.moveConsumed += cost;
		if (this.moveConsumed >= this.movementFactor)
			this.moveCompleted = true;
	}
	resetMovementFactor() {
		this.moveConsumed = 0;
		this.moveCompleted = false;
	}
	getMovementFactor(adjusted) {
		if (adjusted === true && this.moveCompleted === true)
			return 0;
		return this.movementFactor - this.moveConsumed;
	}
	moveZOCBlocked() {
		if (this.moveCompleted && this.movementFactor > this.moveConsumed)
			return true;
		return false;
	}
	//
	//Serialization methods
	//
	getSerializationObject(obj) {
		var r = this.owningHex != null ? this.owningHex.row : -1;
		var c = this.owningHex != null ? this.owningHex.col : -1;
		obj.type = this.identity(),
			obj.player = this.owningPlayer,
			obj.movefactor = this.movementFactor,
			obj.attackFactor = this.attackFactor,
			obj.defenseFactor = this.defenseFactor,
			obj.range = this.range,
			obj.row = r, //this.row
			obj.col = c, /*this.col*/
			obj.turnOfAppearance = this.turnOfAppearance,
			obj.era = this.era;
		obj.shape = this.shape;
		obj.allowableTerrain = this.allowableTerrain;
	}
	serialize(table) {
		//1. Write out the owning hex coords (row, col)
		//2. Write out move, attack, defense, range, 
		//3. Write out type, owning player
		var obj = {};
		this.getSerializationObject(obj);
		table.push(obj);
	}
	deserialize(obj) {
		this.owningPlayer = obj.player;
		this.movementFactor = obj.movefactor;
		this.attackFactor = obj.attackFactor;
		this.defenseFactor = obj.defenseFactor;
		this.range = obj.range;
		this.row = obj.row;
		this.col = obj.col;
		this.turnOfAppearance = obj.turnOfAppearance; //By default all units appear at the outset of the game
		this.era = obj.era;
		this.shape = obj.shape == undefined ? UNIT_SHAPE.SQUARE : obj.shape;
		var theGame = GameSingleton.getInstance();
		this.size = theGame.size;
		this.allowableTerrain = obj.allowableTerrain == undefined ? this.allowableTerrain : obj.allowableTerrain;
	}
	//
	//Combat related methods
	//
	getDefenseFactor() { return this.unifiedAttackAndDefend() ? this.attackFactor : this.defenseFactor; }
	getAttackFactor() { return this.attackFactor; }
	unifiedAttackAndDefend() { return true; }
	getEra() { return this.era; }
	setAttackFactor(f) {
		this.attackFactor = f;
	}
	setDefenseFactor(f) {
		if (!this.unifiedAttackAndDefend())
			this.defenseFactor = f;
	}
	applyCombatResult(reduction) {
		this.attackFactor -= reduction;
		if (!this.unifiedAttackAndDefend()) {
			this.defenseFactor -= reduction;
		}
	}
	//
	//Unit management methods
	//
	getTurnOfAppearance() {
		return this.turnOfAppearance;
	}
	isInPlay() {
		return (this.owningHex != null);
	}
	isSplittable() { return false; }
	canSplit() { return false; }
	doSplit() { }
	exertZOC() {
		return false;
	}
	identity() {
		alert("unidentified unit");
		return "none";
	}
	getUnitTypeName() {
		alert("unidentified unit");
		return "none";
	}
	getRange() {
		return this.range;
	}
	isDead() {
		if (this.getDefenseFactor() < 0) {
			debugger;
		}
		return this.getDefenseFactor() <= 0;
	}
	attack(enemy, longRange) {
	}
	setStackingCost(cost) {
		this.stackingCost = cost;
	}
	getStackingCost() {
		return ths.stackingCost;
	}
	getOwningHex() {
		return this.owningHex;
	}
	setOwningHex(hex) {
		//Remove from the original hex if on one
		if (this.owningHex != null) {
			this.owningHex.removeUnit(this);
		}
		//Add to the new hex and add new hex to this
		hex.addUnit(this);
		this.owningHex = hex;
	}
	isEligibleForCombat(state) {
		if (this.getDefenseFactor() == 0)
			return false;
		if ((state == STATE.PLAYER_1_COMBAT) && this.owningPlayer == PLAYER.ONE)
			return true;
		if ((state == STATE.PLAYER_2_COMBAT) && this.owningPlayer == PLAYER.TWO)
			return true;
		return false;
	}
	isEligibleForMove(state) {
		if (this.isDead())
			return false;
		if ((state == STATE.PLAYER_1_MOVE) && this.owningPlayer == PLAYER.ONE)
			return true;
		if ((state == STATE.PLAYER_2_MOVE) && this.owningPlayer == PLAYER.TWO)
			return true;
		return false;
	}
	isEligibleForSelection(state) {
		if (this.isDead())
			return false;
		if ((state == STATE.PLAYER_1_SETUP ||
			state == STATE.PLAYER_1_MOVE ||
			state == STATE.PLAYER_1_COMBAT) && this.owningPlayer == PLAYER.ONE)
			return true;
		if ((state == STATE.PLAYER_2_SETUP
			|| state == STATE.PLAYER_2_MOVE ||
			state == STATE.PLAYER_2_COMBAT) && this.owningPlayer == PLAYER.TWO)
			return true;
		return false;
	}
	setValidDestinations(dest) {
		this.validDestinations = dest;
	}
	clearValidDestinations(dest) {
		this.validDestinations = null;
	}
	getValidDestinations() {
		return this.validDestinations;
	}
	getOwningPlayer() {
		return this.owningPlayer;
	}
	ignoreTerrain() {
		return false;
	}
	setOwningPlayer(id) {
		this.owningPlayer = id;
	}
	init2(original) {
	}
	init(x, y) {
		this.pos = new Point2d(x, y);
	}
	getFill(fill) {
		return this.owningPlayer == PLAYER.TWO ? PLAYER2_COLOR : PLAYER1_COLOR;
	}
	getPosition() {
		return this.pos;
	}
	setPosition(x, y) {
		this.pos.setPos(x, y);
	}
	translate(dx, dy) {
		this.pos.translate(dx, dy);
	}
	scalePos(sf) {
		this.pos.setX(this.pos.getX() * sf);
		this.pos.setY(this.pos.getY() * sf);
	}
	setSize(size) {
		this.size = size;
	}
	getSize(size) {
		return this.size;
	}
	draw(ctx, bHighlight) {
		ctx.beginPath();
		//debugger;
		var x = this.pos.getX();
		var y = this.pos.getY();
		var size = this.size * COS_OF_60 * 1.2;
		ctx.rect(x - size, y - size, 2 * size, 2 * size); //x+this.size, y+this.size);
		ctx.strokeStyle = "#000000";
		if (bHighlight)
			ctx.fillStyle = this.highlightFill;
		else
			ctx.fillStyle = this.getFill();
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.fill();
		ctx.strokeStyle = "#0000ff";
		ctx.moveTo(x - size, y - size);
		ctx.lineTo(x + size, y + size);
		ctx.stroke();
	}
	pickTest(x, y) {
		if (this.isDead())
			return false;
		var xCenter = this.pos.getX();
		var yCenter = this.pos.getY();
		var sz = this.size / 2;
		if (x <= (xCenter + sz) && x >= (xCenter - sz)) {
			if (y <= (yCenter + sz) && y >= (yCenter - sz))
				return true;
		}
		return false;
	}
	getRow = function(){
		if(this.owningHex == null) return -1;
		return this.owningHex.getRow();
	}
	getCol = function(){
		if(this.owningHex == null) return -1;
		return this.owningHex.getCol();
	}
}

let DrawUnitShapeMixin = {
	drawSquare(ctx, bHighlight, x, y, size, lineWidth, isDead){
		ctx.beginPath();

		ctx.rect(x-size, y-size, 2*size, 2*size);//x+this.size, y+this.size);
		ctx.strokeStyle = "#000000";
		if(bHighlight)
			ctx.fillStyle = this.highlightFill;
		else if(isDead)//this.isDead())//getDefenseFactor() == 0)
			ctx.fillStyle = "#FF0000";
		else
			ctx.fillStyle = this.getFill();
		ctx.lineWidth = lineWidth;
		ctx.stroke();
		ctx.fill();
	},
	drawCircle(ctx, bHighlight, x, y, size, lineWidth, isDead){
		ctx.beginPath();

		ctx.arc(x, y, size, 0, 2*Math.PI);
		if(bHighlight)
			ctx.fillStyle = this.highlightFill;
		else
			ctx.fillStyle = this.getFill();
		ctx.lineWidth = lineWidth;
		ctx.stroke();
		ctx.fill();
	},	
	drawTriangle(ctx, bHighlight, x, y, size, lineWidth, isDead){
		ctx.beginPath();
		size *= 1.5;
		ctx.moveTo(x, y-size);
		ctx.lineTo(x+size, y+size);
		ctx.lineTo(x-size, y+size);
		ctx.lineTo(x, y-size);

		ctx.strokeStyle = "#000000";
		if(bHighlight)
			ctx.fillStyle = this.highlightFill;
		else if(isDead)//this.isDead())//getDefenseFactor() == 0)
			ctx.fillStyle = "#FF0000";
		else
			ctx.fillStyle = this.getFill();
		ctx.lineWidth = lineWidth;
		ctx.stroke();
		ctx.fill();
	}
};

export { BSUnitBase, DrawUnitShapeMixin }




