import { UnitFactorySingleton, BSUnitFactory } from './Units.js'
import { BSUnitBase, DrawUnitShapeMixin } from './UnitBase.js';
import {	DEFAULT_BOARD_SIZE, 
	SIN_OF_60, 
	COS_OF_60, 
	COS_OF_30, 
	SIN_OF_30,
	BOARD_SIZE,
	COLORS,
    UNIT_SHAPE,
    DICE_SIDES,
    BASIC_RESULTS_TABLE, A_ELIM, A_DAMAGED, D_ELIM, EXCHANGE, D_DAMAGED } from './Constants.js'
import {  getRandomInt } from './GeneralUtilities'

export default class BSCombatUnitBase extends BSUnitBase {
    constructor() {
        super();
        this.setStackingCost(1);
    }
    deserialize(obj) {
        //Serialize the unit
        super.deserialize(obj);
    }
    drawOutline(ctx, bHighlight, stacked) {
        //Save the draw context
        ctx.save();
        //Get the geometry needed to draw the unit
        var x = this.pos.getX();
        var y = this.pos.getY();
        var size = this.size * COS_OF_60 * 1.2;
        var lineWidth = stacked ? 3 : 1;
        //If stacked then draw an outline slightly offset
        if (stacked) {
            var offsetFactor = 3;
            if (this.shape != UNIT_SHAPE.SQUARE)
                offsetFactor = 0;
            //Draw slightly offset first		
            ctx.beginPath();
            ctx.rect(x - size - offsetFactor, y - size - offsetFactor, 2 * size, 2 * size); //x+this.size, y+this.size);
            ctx.strokeStyle = "#000000";
            if (bHighlight)
                ctx.fillStyle = this.highlightFill;
            else if (this.isDead()) //this.getDefenseFactor() == 0)
                ctx.fillStyle = "#FF0000";
            else
                ctx.fillStyle = this.getFill();
            ctx.lineWidth = lineWidth;
            ctx.stroke();
            ctx.fill();
        }
        if (this.shape == UNIT_SHAPE.SQUARE)
            this.drawSquare(ctx, bHighlight, x, y, size, lineWidth, this.isDead());
        else if (this.shape == UNIT_SHAPE.CIRCLE)
            this.drawCircle(ctx, bHighlight, x, y, size, lineWidth, this.isDead());
        else if (this.shape == UNIT_SHAPE.TRIANGLE)
            this.drawTriangle(ctx, bHighlight, x, y, size, lineWidth, this.isDead());
        /*
            ctx.beginPath();
        
            ctx.rect(x-size, y-size, 2*size, 2*size);//x+this.size, y+this.size);
            ctx.strokeStyle = "#000000";
            if(bHighlight)
                ctx.fillStyle = this.highlightFill;
            else if(this.isDead())//getDefenseFactor() == 0)
                ctx.fillStyle = "#FF0000";
            else
                ctx.fillStyle = this.getFill();
            ctx.lineWidth = lineWidth;
            ctx.stroke();
            ctx.fill();
        */
        //Restore the draw context
        ctx.restore();
    }
    calculateSymbolDimensions(upperLeft, lowerRight) {
        var x = this.pos.getX();
        var y = this.pos.getY();
        var size = this.size * COS_OF_60 * 1.2;
        var symSize = .55 * size;
        upperLeft.setX(x - symSize);
        upperLeft.setY(y - 5 * size / 6);
        lowerRight.setX(upperLeft.getX() + 2 * symSize);
        lowerRight.setY(upperLeft.getY() + 2 * symSize);
    }
    drawFactors(ctx) {
        var x = this.pos.getX();
        var y = this.pos.getY();
        var size = this.size * COS_OF_60 * 1.2;
        var fontSize = .7 * size;
        var fontStr = fontSize + "px" + " Courier New";
        ctx.font = fontStr;
        if (!this.unifiedAttackAndDefend()) {
            ctx.strokeText(this.getAttackFactor(), x - size, y + 4 * size / 5);
            ctx.strokeText(this.getDefenseFactor(), x - size / 3, y + 4 * size / 5);
            if (this.moveZOCBlocked()) {
                ctx.strokeStyle = COLORS.UNIT_ALERT;
                ctx.strokeText("ZOC", x - size / 5 /*+size/4*/, y + 4 * size / 5);
            }
            else {
                ctx.strokeText(this.getMovementFactor(true), x + size / 3, y + 4 * size / 5);
            }
        }
        else {
            ctx.strokeText(this.getAttackFactor(), x - 3 / 4 * size, y + 4 * size / 5);
            if (this.moveZOCBlocked()) {
                ctx.strokeStyle = COLORS.UNIT_ALERT;
                ctx.strokeText("ZOC", x - size / 5 /*x+size/4*/, y + 4 * size / 5);
            }
            else {
                ctx.strokeText(this.getMovementFactor(true), x + size / 3, y + 4 * size / 5);
            }
        }
    }
    drawSymbol(ctx, bHighlight) {
    }
    attack(enemy, longRange) {
        if (enemy.getDefenseFactor() <= 0) {
            return;
        }
        var dHex = enemy.getOwningHex();
        var dFactor = dHex.getDefenseFactor();
        //Get the ratio of attack to defense rounding down
        var ratio = 1;
        let defense = enemy.getDefenseFactor();
        if (dFactor > 0)
            defense *= dFactor;
        //Entries in the combat table:
        //Attack >= 1:1 => 6-11 (idx 5-10)
        //Defend > 1:1 => 1-5 (idx 0 -> 4)
        if (this.setAttackFactor >= defense)
            ratio = Math.floor(this.getAttackFactor() / defense) + 4;
        else {
            ratio = 6 - Math.ceil(defense / this.getAttackFactor());
        }
        //Odds greater than 6-1 or less than 1-6 mean automatice elimation for defender and attacker, respectively
        var dieRoll = getRandomInt(0, DICE_SIDES - 1);
        var row = BASIC_RESULTS_TABLE[dieRoll];
        var result = row[ratio];
        //Outside of the tables so automatic elimination cases
        if (ratio > 10)
            enemy.applyCombatResult(enemy.getDefenseFactor());
        else if (ratio < 0)
            this.applyCombatResult(this.getDefenseFactor());
        //Table driven results
        switch (result) {
            case A_ELIM:
                {
                    if (!longRange)
                        this.applyCombatResult(Math.ceil(this.getDefenseFactor() / 2));
                }
                break;
            case D_ELIM:
                {
                    enemy.applyCombatResult(Math.ceil(enemy.getDefenseFactor() / 2));
                }
                break;
            case EXCHANGE:
                {
                    if (!longRange)
                        this.applyCombatResult(1);
                    enemy.applyCombatResult(1);
                }
                break;
            case A_DAMAGED:
                {
                    if (!longRange)
                        this.applyCombatResult(1);
                }
                break;
            case D_DAMAGED:
                {
                    enemy.applyCombatResult(1);
                }
                break;
            case NO_EFFECT:
            default:
                break;
        }
    }
    draw(ctx, bHighlight, stacked) {
        this.drawOutline(ctx, bHighlight, stacked);
    }
    drawSymbolOutline(ctx, bHighlight, ul, lr) {
        ctx.beginPath();
        ctx.rect(ul.getX(), ul.getY(), lr.getX() - ul.getX(), lr.getY() - ul.getY()); //x+this.size, y+this.size);
        ctx.stroke();
    }
    drawSymbolOutlineEx(ctx, bHighlight, ul, lr, img) {
        ctx.beginPath();
        var width = lr.getX() - ul.getX();
        var height = lr.getY() - ul.getY();
        if (this.shape != UNIT_SHAPE.TRIANGLE)
            ctx.rect(ul.getX(), ul.getY(), width, height); //x+this.size, y+this.size);
        var image = new Image();
        image.src = img;
        //ctx.fillStyle = ctx.createPattern(image, 'repeat');
        ctx.stroke();
        //ctx.fill();
        //ctx.clip();
        ctx.drawImage(image, ul.getX(), ul.getY(), width, height);
    }
    canSplit() {
        if (!this.isSplittable())
            return false;
        return this.getAttackFactor() % 2 == 0 && this.getDefenseFactor() % 2 == 0;
    }
    doSplit() {
        var factory = UnitFactorySingleton.getInstance();
        var clone = factory.createUnit(this.identity());
        clone.init(this.pos.getX(), this.pos.getY());
        //Divide the combat strength
        this.setAttackFactor(this.getAttackFactor() / 2);
        clone.setAttackFactor(this.getAttackFactor());
        //Divide defensive strength if different than combat
        if (!this.unifiedAttackAndDefend()) {
            this.setDefenseFactor(this.getDefenseFactor() / 2);
            clone.setDefenseFactor(this.getDefenseFactor() / 2);
        }
        clone.movementFactor = this.movementFactor;
        clone.moveConsumed = this.moveConsumed;
        clone.setOwningHex(this.owningHex);
        clone.setSize(this.size);
        clone.setOwningPlayer(this.owningPlayer);
        //Add clone to list of units
        var theGame = GameSingleton.getInstance();
        theGame.getGamePieces().push(clone);
    }
    getUnitTypeName() {
        //For built in units the type name is the same as the identity
        return this.identity();
    }
}
Object.assign(BSCombatUnitBase.prototype, DrawUnitShapeMixin)







