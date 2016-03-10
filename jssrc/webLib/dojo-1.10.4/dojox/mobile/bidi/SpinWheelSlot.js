//>>built

define("dojox/mobile/bidi/SpinWheelSlot", ["dojo/_base/declare", "dojo/_base/window", "dojo/_base/array", "dojo/dom-construct", "./common"], function (declare, win, array, domConstruct, common) {
    return declare(null, {postCreate:function () {
        this.inherited(arguments);
        if (!this.textDir && this.getParent() && this.getParent().get("textDir")) {
            this.set("textDir", this.getParent().get("textDir"));
        }
    }, _setTextDirAttr:function (textDir) {
        if (textDir && (!this._created || this.textDir !== textDir)) {
            this.textDir = textDir;
            this._setTextDirToNodes(this.textDir);
        }
    }, _setTextDirToNodes:function (textDir) {
        array.forEach(this.panelNodes, function (panel) {
            array.forEach(panel.childNodes, function (node, i) {
                node.innerHTML = common.removeUCCFromText(node.innerHTML);
                node.innerHTML = common.enforceTextDirWithUcc(node.innerHTML, this.textDir);
                node.style.textAlign = (this.dir.toLowerCase() === "rtl") ? "right" : "left";
            }, this);
        }, this);
    }});
});

