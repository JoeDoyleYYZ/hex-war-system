
import {	DEFAULT_BOARD_SIZE, 
            SELECTED_IMAGE, 
            TERRAIN_FLAGS, 
            TERRAIN_COLORS_NO_EMPHASIS } from './Constants.js'

//Base class for terrain types
export default class BSTerrain {
    constructor() {
        this.type;
        this.movementCost = 1;
        this.defenseFactor = 1;
        this.stackingLimit = 3;
        this.imageNormal = null;
        this.imageSelected = null;
        this.owningHex = undefined;
    }
    setOwningHex(owner) { this.owningHex = owner; }
    getTerrainFlag() { return TERRAIN_FLAGS.CLEARING; }
    init() { }
    getType() { return this.type; }
    getMovementCost() { return this.movementCost; }
    getDefenseFactor() { return this.defenseFactor; }
    getNormalImageFile() { return NORMAL_IMAGE.CLEARING; }
    getSelectedImageFile() { return SELECTED_IMAGE.CLEARING; }
    getColor(emphasize) { return "#000000"; }
    getStackingLimit() { return this.stackingLimit; }
    isStopOnEntry() { return false; }
    isImpassable() { return false; }
    isEqual(terrain) {
        return this.type == terrain;
    }
    isImprovement() { return false; }
    canNetwork() { return false; }
    getDescriptor() { return ""; }
    fillToExtents() { return true; }
    getNormalImage() {
        if (this.imageNormal == null && this.getNormalImageFile() != "") {
            this.imageNormal = new Image();
            this.imageNormal.src = this.getNormalImageFile();
        }
        return this.imageNormal;
    }
    getSelectedImage() {
        if (this.imageSelected == null && this.getSelectedImageFile() != "") {
            this.imageSelected = new Image();
            this.imageSelected.src = this.getSelectedImageFile();
        }
        return this.imageSelected;
    }
    drawFill(ctx, emphasis) {
        ctx.fillStyle = this.getColor(emphasis);
        if (ctx.fillStyle == "#ffffff")
            ctx.fillStyle = TERRAIN_COLORS_NO_EMPHASIS.CLEARING;
        //ctx.fillStyle = this.getShade(ctx, emphasize);
        if (!(ctx.fillStyle == "#ffffff"))
            ctx.fill();
    }
    draw(ctx, originX, originY, radius, emphasis) {
        //this.drawFill(ctx, emphasis); return;


        var img = null;
        if (emphasis) {
            img = this.getSelectedImage();
        }
        img = this.getNormalImage();
        var div = this.fillToExtents() ? 1 : 3;
        if (img == null || div > 1) {
            this.drawFill(ctx, emphasis);
            return;
        }
        if (img != null) {
            var x = originX - radius / div;
            var y = originY - radius / div;
            ctx.drawImage(img, x, y, 2 * radius / div, 2 * radius / div);
        }
    }
}

