//>>built

define("dijit/_DialogMixin", ["dojo/_base/declare", "./a11y"], function (declare, a11y) {
    return declare("dijit._DialogMixin", null, {actionBarTemplate:"", execute:function () {
    }, onCancel:function () {
    }, onExecute:function () {
    }, _onSubmit:function () {
        this.onExecute();
        this.execute(this.get("value"));
    }, _getFocusItems:function () {
        var elems = a11y._getTabNavigable(this.domNode);
        this._firstFocusItem = elems.lowest || elems.first || this.closeButtonNode || this.domNode;
        this._lastFocusItem = elems.last || elems.highest || this._firstFocusItem;
    }});
});

