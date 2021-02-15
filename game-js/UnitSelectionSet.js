export default class BSSelectionSet {
	constructor() {
		this.selectedUnits = null;
	}
	getSelectedUnits() {
		return this.selectedUnits;
	}
	addToSelection(unit) {
		if (this.selectedUnits == null) {
			this.selectedUnits = new Array();
		}
		this.selectedUnits.push(unit);
	}
	clear() {
		this.selectedUnits = null;
	}
	//DEPRECATE THIS
	getTopSelection() {
		return this.top();
	}
	top() {
		if (this.selectedUnits != null && this.selectedUnits.length > 0)
			return this.selectedUnits[0];
		return null;
	}
}

