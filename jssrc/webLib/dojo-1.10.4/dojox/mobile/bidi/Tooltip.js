//>>built

define("dojox/mobile/bidi/Tooltip", ["dojo/_base/array", "dojo/_base/declare", "./common"], function (array, declare, common) {
    return declare(null, {postCreate:function () {
        this.inherited(arguments);
        if (this.textDir) {
            this._applyTextDirToTextElements();
        }
    }, buildRendering:function () {
        this.inherited(arguments);
        if (!this.isLeftToRight()) {
            this.arrow.style.left = "0px";
        }
    }, _setTextDirAttr:function (textDir) {
        if (textDir && this.textDir !== textDir) {
            this.textDir = textDir;
            this._applyTextDirToTextElements();
        }
    }, _applyTextDirToTextElements:function () {
        array.forEach(this.domNode.childNodes, function (node) {
            var currentNode = (node.nodeType === 1 && node.childNodes.length === 1) ? node.firstChild : node;
            if (currentNode.nodeType === 3 && currentNode.nodeValue) {
                if (currentNode.nodeValue.search(/[.\S]/) != -1) {
                    currentNode.nodeValue = common.removeUCCFromText(currentNode.nodeValue);
                    currentNode.nodeValue = common.enforceTextDirWithUcc(currentNode.nodeValue, this.textDir);
                }
            }
        }, this);
    }});
});

