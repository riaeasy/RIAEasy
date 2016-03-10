//>>built

define("dijit/_KeyNavContainer", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-attr", "dojo/_base/kernel", "dojo/keys", "dojo/_base/lang", "./registry", "./_Container", "./_FocusMixin", "./_KeyNavMixin"], function (array, declare, domAttr, kernel, keys, lang, registry, _Container, _FocusMixin, _KeyNavMixin) {
    return declare("dijit._KeyNavContainer", [_FocusMixin, _KeyNavMixin, _Container], {connectKeyNavHandlers:function (prevKeyCodes, nextKeyCodes) {
        var keyCodes = (this._keyNavCodes = {});
        var prev = lang.hitch(this, "focusPrev");
        var next = lang.hitch(this, "focusNext");
        array.forEach(prevKeyCodes, function (code) {
            keyCodes[code] = prev;
        });
        array.forEach(nextKeyCodes, function (code) {
            keyCodes[code] = next;
        });
        keyCodes[keys.HOME] = lang.hitch(this, "focusFirstChild");
        keyCodes[keys.END] = lang.hitch(this, "focusLastChild");
    }, startupKeyNavChildren:function () {
        kernel.deprecated("startupKeyNavChildren() call no longer needed", "", "2.0");
    }, startup:function () {
        this.inherited(arguments);
        array.forEach(this.getChildren(), lang.hitch(this, "_startupChild"));
    }, addChild:function (widget, insertIndex) {
        this.inherited(arguments);
        this._startupChild(widget);
    }, _startupChild:function (widget) {
        widget.set("tabIndex", "-1");
    }, _getFirst:function () {
        var children = this.getChildren();
        return children.length ? children[0] : null;
    }, _getLast:function () {
        var children = this.getChildren();
        return children.length ? children[children.length - 1] : null;
    }, focusNext:function () {
        this.focusChild(this._getNextFocusableChild(this.focusedChild, 1));
    }, focusPrev:function () {
        this.focusChild(this._getNextFocusableChild(this.focusedChild, -1), true);
    }, childSelector:function (node) {
        var node = registry.byNode(node);
        return node && node.getParent() == this;
    }});
});

