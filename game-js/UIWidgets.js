/**
 *UI Widgets 
 */

import { createUnit, cacheKeyByElement, cacheKeyByValue, retrieveElementByKey, addEvent, HoverListener, Point2d, debugAlert, addListenerToElement, getRandomInt, inside, serialize, scaleImage, addToFrontOfArray, HexListener} from './GeneralUtilities'
import { COLORS, DIALOG_BACKGROUND, SIN_OF_60 } from './Constants'

var DialogBackgroundImageLoader = {

	image : null,
	getDialogBoxBackgroundImage : function(){
		if(this.image == null ){
			this.image = new Image();
			this.image.src = DIALOG_BACKGROUND;
			this.image.onLoad = function(){
				//var fillStyle = ctx.createPattern(image, 'repeat');
				return this.image;
			}
		}
		return this.image;
	}
};

import BSDrawable from './Drawable'
//
//Base class for canvas UI widgets
//
class BSCanvasWidgetBase extends BSDrawable{
	constructor(x, y, w, h, color, parent) {
		super();
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.bgcolor = color;
		this.parent = parent;
	}
	onMouseMove(e) { }
	onLMBDown(e) { }
	onLMBUp(e) { }
	onRMBDown(e) { }
	onMouseEnter(e) { }
	onMouseExit(e) { }
	onRMBUp(e) { }
	onContextMenu(e) { }
	isModal() { return false; }
	getParent() { return this.parent; }
	draw(ctx, hoverPos) { }
	drawWidgetOutline(ctx, hoverPos) {
		ctx.lineWidth = 3;
		var strokeStyle = ctx.strokeStyle;
		var fillStyle = ctx.fillStyle;
		ctx.strokeStyle = this.bgcolor; //"#bc9925";
		//var image = new Image();
		//image.src = DIALOG_BACKGROUND;
		//var image = DialogBackgroundImageLoader.getDialogBoxBackgroundImage();
		//ctx.fillStyle = ctx.createPattern(image, 'repeat');
		ctx.fillStyle = this.bgcolor;
		ctx.beginPath();
		ctx.rect(this.x, this.y, this.w, this.h);
		ctx.stroke();
		ctx.fill();
		ctx.lineWidth = 1;
		ctx.strokeStyle = strokeStyle;
		ctx.fillStyle = fillStyle;
	}
}


//
//Context menu item
//
class BSMenuItem {
	constructor(str, fn, ul, lr, owner) {
		this.str = str;
		this.ul = ul;
		this.lr = lr;
		this.isSelected = false;
		this.owner = owner;
		this.function = fn;
	}
	getOwner() { return this.owner; }
	select(pos) {
		var a = new Array();
		a.push(new Point2d(this.ul.getX(), this.ul.getY()));
		a.push(new Point2d(this.lr.getX(), this.ul.getY()));
		a.push(new Point2d(this.lr.getX(), this.lr.getY()));
		a.push(new Point2d(this.ul.getX(), this.lr.getY()));
		if (inside(pos, a)) {
			a = null;
			this.isSelected = true;
			return true;
		}
		this.isSelected = false;
		return false;
	}
	action(e) {
		if (this.isSelected) {
			this.function(e, this.getOwner().getParent());
		}
	}
	draw(ctx, hoverPos) {
		var fontSize = 10;
		if (hoverPos != null) {
			if (this.select(hoverPos)) {
				fontSize = 12;
			}
		}
		var fontStr = fontSize + "px" + " Courier New";
		ctx.font = fontStr;
		ctx.strokeText(this.str, this.ul.getX() + 5, (this.ul.getY() + this.lr.getY()) / 2);
	}
}

//
//BSContextMenu
//
class BSContextMenu  extends BSCanvasWidgetBase{
	constructor(x, y, w, h, color, menuItems, parent) {
		super(x, y, w, h, color, parent);
		this.menuItems = new Array();
		for (var i = 0; i < menuItems.length; i++) {
			var ul = new Point2d(this.x, this.y + 20 * i);
			var lr = new Point2d(this.x + this.w, this.y + 20 * (i + 1));
			this.menuItems.push(new BSMenuItem(menuItems[i][0], menuItems[i][1], ul, lr, this));
		}
		this.h = 20 * menuItems.length;
	}
	isModal() { return true; }
	onLMBDown(e) {
		//console.log("Context Menu LMB Down");
		for (var i = 0; i < this.menuItems.length; i++) {
			var item = this.menuItems[i];
			item.action(e);
		}
		this.parent.removeWidget(this);
	}
	onMouseMove(e) {
		var pos = new Point2d(e.offsetX, e.offsetY);
		this.draw(this.parent.context, pos);
	}
	draw(ctx, hoverPos) {
		ctx.save();
		this.drawWidgetOutline(ctx, hoverPos);
		this.drawMenuItems(ctx, hoverPos);
		ctx.clip();
		ctx.restore();
	}
	drawMenuItems(ctx, hoverPos) {
		for (var i = 0; i < this.menuItems.length; i++) {
			this.menuItems[i].draw(ctx, hoverPos);
		}
	}
}



//
//Information Window
//
function timeoutHandler(context){
	context.removeWidgets();	
}
class BSInfoWindow extends BSCanvasWidgetBase{
	constructor(x, y, w, h, color, info, parent, clearOnMove, duration) {
		super(x, y, w, h, color, parent);
		this.info = info;
		this.lineHeight = 15;
		this.calculateHeight();
		this.calculateWidth();
		this.bgcolor = COLORS.INFO_WINDOW;
		this.clearOnMove = clearOnMove;
		if (duration > 0) {
			setTimeout(timeoutHandler, duration, parent);
		}
	}
	draw(ctx, hoverPos) {
		ctx.save();
		this.drawWidgetOutline(ctx, hoverPos);
		this.drawText(ctx);
		ctx.clip();
		ctx.restore();
	}
	calculateHeight() {
		this.h = (1 + this.lineCount()) * this.lineHeight;
	}
	calculateWidth() {
		var lines = this.info.split('\n');
		let maxChars = 0;
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			if (line.length > maxChars)
				maxChars = line.length;
		}
		this.w = this.w > 10 * maxChars ? this.w : 10 * maxChars;
	}
	lineCount() {
		var lines = this.info.split('\n');
		return lines.length;
	}
	drawText(ctx) {
		var fontSize = 12;
		var fontStr = fontSize + "px" + " Courier New";
		ctx.font = fontStr;
		var lines = this.info.split('\n');
		for (var i = 0; i < lines.length; i++)
			ctx.strokeText(lines[i], this.x + 5, this.y + ((i + 1) * this.lineHeight));
	}
	isModal() { return true; }
	onLMBDown(e) {
		this.parent.removeWidget(this);
	}
	onMouseMove(e) {
		if (this.clearOnMove)
			this.parent.removeWidget(this);
	}
}


//
//Unit flyout
//
class BSUnitFlyout extends BSCanvasWidgetBase {
	constructor(x, y, w, h, color, units, parent, action) {
		super(x, y, w, h, color, parent);
		this.units = units;
		this.selection - null;
		this.action = action;
		this.calculateHeight();
		this.calculateWidth();
	}
	draw(ctx, hoverPos) {
		ctx.save();
		this.drawWidgetOutline(ctx, hoverPos);
		this.drawUnits(ctx, hoverPos);
		ctx.clip();
		ctx.restore();
	}
	calculateHeight() {
		this.h = 2 * SIN_OF_60 * this.units[0].getSize() * 1.1;
	}
	calculateWidth() {
		this.w = this.units.length * this.h;
	}
	unitCount() {
		return this.units.length;
	}
	isModal() { return true; }
	drawUnits(ctx, selectionPos) {
		//Get the origin of the start unit
		var xStart = this.units[0].getPosition().getX();
		var yStart = this.units[0].getPosition().getY();
		var wCell = this.w / this.unitCount();
		var spacing = wCell;
		var xOffset = this.x + wCell / 2 - xStart;
		var yOffset = this.y + this.h / 2 - yStart;
		for (var i = 0; i < this.units.length; i++) {
			var el = this.units[i];
			el.translate(xOffset + spacing * i, yOffset);
			el.draw(ctx, false, false);
			if (selectionPos != null) {
				if (el.pickTest(selectionPos.getX(), selectionPos.getY())) {
					el.draw(ctx, true);
					//console.log("Target hit");
					this.selection = el;
				}
			}
			el.translate(-(xOffset + spacing * i), -yOffset);
		}
	}
	onMouseExit(event) {
		//if(this.selection != null){
		//this.action(e, this.selection, this.parent);	
		//}
		this.parent.removeWidget(this);
	}
	onLMBDown(e) {
		console.log("BSUnitFlyout LMBDown");
		if (this.selection != null) {
			this.action(e, this.selection, this.parent);
		}
		this.parent.removeWidget(this);
	}
	onMouseMove(e) {
		var pos = new Point2d(e.offsetX, e.offsetY);
		var ctx = this.parent.canvas.getContext("2d");
		this.draw(ctx, pos);
	}
}


export{BSContextMenu,BSInfoWindow,BSUnitFlyout}
//import {BSContextMenu,BSInfoWindow,BSUnitFlyout} from './UIWidget'


