/**
 *
 */
//
//Base class for drawables
//
export default class BSDrawable {
	constructor() {
		this.widgets = null;
	}
	addWidget(widget) {
		if (this.widgets == null) {
			this.widgets = new Array();
		}
		this.widgets.push(widget);
	}
	removeWidget(widget) {
		if (this.widgets != null) {
			this.widgets = this.widgets.filter(function (el) { return el != widget; });
		}
	}
	onMouseMove(e) { }
	onLMBDown(e) { }
	onLMBUp(e) { }
	onRMBDown(e) { }
	onMouseEnter(e) { }
	onMouseExit(e) { }
	onRMBUp(e) { }
	onContextMenu(e) { }
}


