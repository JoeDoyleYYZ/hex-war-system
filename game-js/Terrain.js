
import BSTerrain from './TerrainBase'
import {	SELECTED_IMAGE,
            NORMAL_IMAGE,
            TERRAIN,
            COST,
            TERRAIN_DESCRIPTOR,
            TERRAIN_COLORS_NO_EMPHASIS,
            TERRAIN_FLAGS } from './Constants.js'

//Forest terrain
class BSForest extends BSTerrain{
    constructor() {
        super();
        this.type = TERRAIN.FOREST;
        this.movementCost = COST.FOREST;
        this.defenseFactor = 2;
    }
    getNormalImageFile() { return NORMAL_IMAGE.FOREST; }
    getSelectedImageFile() { return SELECTED_IMAGE.FOREST; }
    getColor(emphasize) {
        if (emphasize)
            return "DarkGrey";
        return TERRAIN_COLORS_NO_EMPHASIS.FOREST;
    }
    getDescriptor() { return TERRAIN_DESCRIPTOR.FOREST; }
    getTerrainFlag() { return TERRAIN_FLAGS.FOREST; }
}

//Mountain terrain 
class BSMountain  extends BSTerrain{
    constructor() {
        super();
        this.type = TERRAIN.MOUNTAIN;
        this.movementCost = COST.MOUNTAIN;
        this.defenseFactor = 3;
    }
    getNormalImageFile() { return NORMAL_IMAGE.MOUNTAIN; }
    getSelectedImageFile() { return SELECTED_IMAGE.MOUNTAIN; }
    getColor(emphasize) {
        if (emphasize)
            return "DarkGrey";
        return TERRAIN_COLORS_NO_EMPHASIS.MOUNTAIN;//"#524008";
    }
    drawFill(ctx, emphasis) {
        super.drawFill(ctx,emphasis);
    }
    draw(ctx, originX, originY, radius, emphasis) {
        super.draw(ctx, originX, originY, radius, emphasis);
    }    
    getDescriptor() { return TERRAIN_DESCRIPTOR.MOUNTAIN; }
    isStopOnEntry() { return true; }
    getTerrainFlag() { return TERRAIN_FLAGS.MOUNTAIN; }
}

//Town/city terrain 
class BSTown  extends BSTerrain{
    constructor() {
        super();
        this.type = TERRAIN.TOWN;
        this.movementCost = COST.TOWN;
        this.defenseFactor = 2;
    }
    getNormalImageFile() { return NORMAL_IMAGE.TOWN; }
    getSelectedImageFile() { return SELECTED_IMAGE.TOWN; }
    getColor(emphasize) {
        if (emphasize)
            return "DarkGrey";
        return TERRAIN_COLORS_NO_EMPHASIS.TOWN;
    }
    getDescriptor() { return TERRAIN_DESCRIPTOR.TOWN; }
    getTerrainFlag() { return TERRAIN_FLAGS.TOWN; }
}

//Clearing terrain 
class BSClearing  extends BSTerrain{
    constructor() {
        super();
        this.type = TERRAIN.CLEARING;
        this.movementCost = COST.CLEARING;
        this.terrainFlag = TERRAIN_FLAGS.CLEARING;
    }
    getNormalImageFile() { return NORMAL_IMAGE.CLEARING; }
    getSelectedImageFile() { return SELECTED_IMAGE.CLEARING; }
    getColor(emphasize) {
        if (emphasize)
            return "DarkGrey";
        return TERRAIN_COLORS_NO_EMPHASIS.CLEARING;
    }
    getDescriptor() { return TERRAIN_DESCRIPTOR.CLEARING; }
    getTerrainFlag() { return TERRAIN_FLAGS.CLEARING; }
}
//Clearing terrain 
class BSDesert  extends BSTerrain{
    constructor() {
        super();
        this.type = TERRAIN.DESERT;
        this.movementCost = COST.DESERT;
        this.terrainFlag = TERRAIN_FLAGS.DESERT;
    }
    getNormalImageFile() { return NORMAL_IMAGE.DESERT; }
    getSelectedImageFile() { return SELECTED_IMAGE.DESERT; }
    getColor(emphasize) {
        if (emphasize)
            return "DarkGrey";
        return TERRAIN_COLORS_NO_EMPHASIS.DESERT;
    }
    getDescriptor() { return TERRAIN_DESCRIPTOR.DESERT; }
    getTerrainFlag() { return TERRAIN_FLAGS.DESERT; }
}




//Null terrain
class BSNullTerrain  extends BSTerrain{
    constructor() {
        super();
        this.type = TERRAIN.NONE;
        this.movementCost = COST.NONE;
        this.defenseFactor = 1;
    }
    getNormalImageFile() { return NORMAL_IMAGE.NONE; }
    getSelectedImageFile() { return SELECTED_IMAGE.NONE; }
    getColor(emphasize) {
        if (emphasize)
            return "White";
        return TERRAIN_COLORS_NO_EMPHASIS.NONE;
    }
    getDescriptor() { return TERRAIN_DESCRIPTOR.NONE; }
    isImpassable() { return true; }
}



//Sea terrain 
class BSSea  extends BSTerrain{
    constructor() {
        super();
        this.type = TERRAIN.SEA;
        this.movementCost = COST.SEA;
        this.defenseFactor = 2;
    }
    getNormalImageFile() { return NORMAL_IMAGE.SEA; }
    getSelectedImageFile() { return SELECTED_IMAGE.SEA; }
    getColor(emphasize) {
        if (emphasize)
            return "Blue";
        return TERRAIN_COLORS_NO_EMPHASIS.SEA;
    }
    getDescriptor() { return TERRAIN_DESCRIPTOR.SEA; }
    isImpassable() { return true; }
    getTerrainFlag() { return TERRAIN_FLAGS.SEA; }
}


//Hill terrain 
class BSHill  extends BSTerrain{
    constructor() {
        super();
        this.type = TERRAIN.HILL_L;
        this.elev = 25;
        this.movementCost = COST.HILL;
        this.defenseFactor = 2;
    }
    getNormalImageFile() { return NORMAL_IMAGE.HILL; }
    getSelectedImageFile() { return SELECTED_IMAGE.HILL; }
    getColor(emphasize) {
        if (this.elev <= 25)
            return "burlywood";
        if (this.elev <= 50)
            return "peru";
        if (this.elev <= 75)
            return "sienna";
        return "maroon";
    }
    getDescriptor() { return TERRAIN_DESCRIPTOR.HILL; }
    isImpassable() { return false; }
    getTerrainFlag() { return TERRAIN_FLAGS.HILL; }
}



/*****************************
*BSImprovement: Improvement terrain improves upon the base terrain. I.e. a fort.
*A hex can have one base terrain and multiple improvements
*****************************/
class BSImprovement  extends BSTerrain{
    constructor() {
        super();
        this.connections = new Array();
    }
    isImprovement() { return true; }
    isCompatibleWithBaseTerrain(terrain){
        return true;
    }
    drawLetter(letter, ctx, originX, originY, boundingRadius){
        if(letter == "F")
        {
            ctx.beginPath();
            ctx.moveTo(originX - boundingRadius/5, originY + boundingRadius/3);
            ctx.lineTo(originX - boundingRadius/5, originY - boundingRadius/3);
            ctx.lineTo(originX+boundingRadius/5, originY - boundingRadius/3)
            ctx.stroke();
    
            ctx.beginPath();
            ctx.moveTo(originX - boundingRadius/5, originY );
            ctx.lineTo(originX , originY);
            ctx.stroke();
    
        }
    }
    drawSquare(ctx, originX, originY, sideLength){
        ctx.moveTo(originX - sideLength, originY + sideLength);
        ctx.lineTo(originX + sideLength, originY+sideLength);
        ctx.lineTo(originX + sideLength, originY-sideLength);
        ctx.lineTo(originX - sideLength, originY-sideLength);
        ctx.lineTo(originX - sideLength, originY+sideLength);
        ctx.stroke()
    }

}

/*****************************
*BSConnectedImprovement: Improvement that can be connected to others of the same
*type to form a network. I.e. a road.
*****************************/
class BSConnectedImprovement extends BSImprovement {
    constructor() {
        super();
        this.connections = new Array();
    }
    //Hex sides are numbered from 1 to 6 starting from the top CW
    canNetwork() { return true; }
    connectionSides() { return this.connections; }
    addConnection(whichSide) { this.connections.push(whichSide); }
    removeConnection(whichSide) {
        return;
        this.connections = this.connections.filter(function (el) {
            el != whichSide;
        });
    }
}
/*****************************
*BSRoad: A road improvement that can be connected to other roads
*****************************/
class BSRoad  extends BSImprovement{
    constructor() {
        super();
        this.type = TERRAIN.ROAD;
        this.movementCost = COST.ROAD;
        this.defenseFactor = 1;
    }
    getColor(emphasize) {
        if (emphasize)
            return "DarkGrey";
        return "#c1b8a2";
    }
    fillToExtents() { return false; }
    getDescriptor() { return TERRAIN_DESCRIPTOR.ROAD; }
    getTerrainFlag() { return TERRAIN_FLAGS.ROAD; }
    isCompatibleWithBaseTerrain(terrain){
        if(terrain.type == TERRAIN.NONE ||
            terrain.type == TERRAIN.SEA )
            return false;
        return super.isCompatibleWithBaseTerrain(terrain);
    }
    draw(ctx, x, y, radius, emphasis) {
        return; 
        
        if (this.owningHex != undefined) {
            var adj = this.owningHex.getAdjacencies();
            var thisImprovement = this;
            adj.forEach(function (h) {
                if (h.hasCompatibleImprovement(thisImprovement)) {
                    //Now draw this road to connect with the shared side
                    var ptOther = h.getOrigin();
                    var ptThis = thisImprovement.owningHex.getOrigin();
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
                    ctx.lineTo(xp, yp);
                    ctx.strokeStyle = "#000000";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        }
        else {
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x - radius / 3, y);
            ctx.lineTo(x + radius / 3, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y + radius / 3);
            ctx.lineTo(x, y - radius / 3);
            ctx.stroke();
        }
    }
}



/*****************************
*BSFortification: A fort improvement that offers greater defense than its base terrain
*****************************/
class BSFortification  extends BSImprovement{
    constructor() {
        super();
        this.type = TERRAIN.FORTIFICATION;
        this.movementCost = COST.FORTIFICATION;
        this.defenseFactor = 2;
    }
    isCompatibleWithBaseTerrain(terrain){
        if(terrain.type == TERRAIN.NONE ||
            terrain.type == TERRAIN.SEA ||
            terrain.type == TERRAIN.MARSH)
            return false;
        return super.isCompatibleWithBaseTerrain(terrain);
    }
    getDescriptor() { return TERRAIN_DESCRIPTOR.FORTIFICATION; }
    getTerrainFlag() { return TERRAIN_FLAGS.FORTIFICATION; }
    draw(ctx, x, y, radius, emphasis) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        let sideLength = radius/3;
        
        //Make a box with an F in the center
        this.drawSquare(ctx, x, y, sideLength);
        this.drawLetter("F", ctx, x, y, 2*sideLength);
    }
}

export { BSFortification, BSRoad, BSForest, BSMountain, BSTown, BSClearing, BSNullTerrain,  BSSea, BSHill, BSDesert}
