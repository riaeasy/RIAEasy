//>>built

define("dojox/mobile/bidi/SwapView", ["dojo/_base/declare"], function (declare) {
    return declare(null, {_callParentFunction:false, nextView:function (node) {
        if (this.isLeftToRight() || this._callParentFunction) {
            this._callParentFunction = false;
            return this.inherited(arguments);
        } else {
            this._callParentFunction = true;
            return this.previousView(node);
        }
    }, previousView:function (node) {
        if (this.isLeftToRight() || this._callParentFunction) {
            this._callParentFunction = false;
            return this.inherited(arguments);
        } else {
            this._callParentFunction = true;
            return this.nextView(node);
        }
    }});
});

