//>>built

define("dojox/mobile/bidi/ListItem", ["dojo/_base/declare", "dojo/_base/array", "dojo/dom-construct", "./common", "dojo/_base/window"], function (declare, array, domConstruct, common, win) {
    return declare(null, {_applyAttributes:function () {
        if (!this.textDir && this.getParent() && this.getParent().get("textDir")) {
            this.textDir = this.getParent().get("textDir");
        }
        this.inherited(arguments);
        if (this.textDir) {
            this._applyTextDirToTextElements();
        }
    }, _setRightTextAttr:function (text) {
        if (!this.templateString && !this.rightTextNode) {
            this.rightTextNode = domConstruct.create("div", {className:"mblListItemRightText"}, this.labelNode, "before");
        }
        if (this.rightTextNode) {
            this.rightText = text;
            this.rightTextNode.innerHTML = this._cv ? this._cv(text) : text;
            if (this.textDir) {
                this.rightTextNode.innerHTML = common.enforceTextDirWithUcc(this.rightTextNode.innerHTML, this.textDir);
            }
        }
    }, _setLabelAttr:function (text) {
        this.inherited("_setLabelAttr", arguments);
        this.labelNode.innerHTML = common.enforceTextDirWithUcc(this.labelNode.innerHTML, this.textDir);
    }, _applyTextDirToTextElements:function () {
        if (this.labelNode.innerHTML) {
            this.labelNode.innerHTML = common.removeUCCFromText(this.labelNode.innerHTML);
            this.labelNode.innerHTML = common.enforceTextDirWithUcc(this.labelNode.innerHTML, this.textDir);
            this.labelNode.style.cssText = "text-align: start";
            return;
        }
        var nEncount = 0;
        array.forEach(this.domNode.childNodes, function (node) {
            var textNode;
            if (nEncount === 0) {
                if (node.nodeType === 3 && (node.nodeValue === common.MARK.RLE || node.nodeValue === common.MARK.LRE)) {
                    node.nodeValue = (node.nodeValue === common.MARK.RLE) ? common.MARK.LRE : common.MARK.RLE;
                    nEncount = 2;
                    return;
                }
                var currentNode = (node.nodeType === 1 && node.childNodes.length === 1) ? node.firstChild : node;
                if (currentNode.nodeType === 3 && currentNode.nodeValue) {
                    if (currentNode.nodeValue.search(/[.\S]/) != -1) {
                        nEncount = 1;
                        textNode = win.doc.createTextNode((this.getTextDir(currentNode.nodeValue).toLowerCase() === "rtl") ? common.MARK.RLE : common.MARK.LRE);
                        domConstruct.place(textNode, node, "before");
                    }
                }
            } else {
                if (nEncount === 1 && node.nodeName.toLowerCase() === "div") {
                    nEncount = 2;
                    textNode = win.doc.createTextNode(common.MARK.PDF);
                    domConstruct.place(textNode, node, "before");
                }
            }
        }, this);
    }, _setTextDirAttr:function (textDir) {
        if (textDir && this.textDir !== textDir) {
            this.textDir = textDir;
            this._applyTextDirToTextElements();
            if (this.rightTextNode) {
                this.rightTextNode.innerHTML = common.removeUCCFromText(this.rightTextNode.innerHTML);
                this.rightTextNode.innerHTML = common.enforceTextDirWithUcc(this.rightTextNode.innerHTML, this.textDir);
            }
        }
    }});
});

