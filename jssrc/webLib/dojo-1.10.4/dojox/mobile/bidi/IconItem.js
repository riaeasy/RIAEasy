//>>built

define("dojox/mobile/bidi/IconItem", ["dojo/_base/declare", "./common"], function (declare, common) {
    return declare(null, {_applyAttributes:function () {
        if (!this.textDir && this.getParent() && this.getParent().get("textDir")) {
            this.textDir = this.getParent().get("textDir");
        }
        this.inherited(arguments);
    }, _setLabelAttr:function (text) {
        if (this.textDir) {
            text = common.enforceTextDirWithUcc(text, this.textDir);
        }
        this.inherited(arguments);
    }, _setTextDirAttr:function (textDir) {
        if (textDir && this.textDir !== textDir) {
            this.textDir = textDir;
            this.labelNode.innerHTML = common.removeUCCFromText(this.labelNode.innerHTML);
            this.labelNode.innerHTML = common.enforceTextDirWithUcc(this.labelNode.innerHTML, this.textDir);
            if (this.paneWidget) {
                this.paneWidget.labelNode.innerHTML = common.removeUCCFromText(this.paneWidget.labelNode.innerHTML);
                this.paneWidget.labelNode.innerHTML = common.enforceTextDirWithUcc(this.paneWidget.labelNode.innerHTML, this.textDir);
            }
        }
    }});
});

