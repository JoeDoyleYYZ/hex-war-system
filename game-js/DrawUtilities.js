/**
 * 
 */
function drawRect(ctx, fromX, fromY, toX, toY, newFillStyle) {
//debugger;	
	
	var oldStyle = preDrawShape(ctx, newFillStyle);

	ctx.rect(fromX,fromY,toX,toY);
	
	postDrawShape(ctx, oldStyle);
}
function preDrawShape(ctx, new_style) {
	var oldStyle = ctx.fillStyle;
	ctx.fillStyle = new_style;
	ctx.beginPath();
	return oldStyle;
}
function postDrawShape(ctx, old_style) {
	ctx.fill();
	ctx.stroke();
	ctx.fillStyle = old_style;
}

export {drawRect, preDrawShape, postDrawShape }
//import {drawRect, preDrawShape, postDrawShape } from './DrawUtilities'


