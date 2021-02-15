

//Base class for state object
export default class BSStateBase {
    constructor(context) {
        this.ctx = context;
        this.identity = function () { return this._identity(); };
    }
    _activate(ctx) { }
    _changeState(ctx) { }
    _identity() { return -2; }
    _label() { return ""; }
    label() { return this._label(); }
    changeState() {
        this._changeState(this.context);
    }
    activate() {
        this._activate(this.ctx);
    }
}

