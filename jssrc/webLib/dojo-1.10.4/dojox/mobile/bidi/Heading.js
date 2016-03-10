//>>built

define("dojox/mobile/bidi/Heading", ["dojo/_base/declare", "./common"], function (declare, common) {
    return declare(null, {_setLabelAttr:function (label) {
        this.inherited(arguments);
        if (this.getTextDir(label) === "rtl") {
            this.domNode.style.direction = "rtl";
        }
        this.labelDivNode.innerHTML = common.enforceTextDirWithUcc(this.labelDivNode.innerHTML, this.textDir);
    }, _setBackAttr:function (back) {
        this.inherited(arguments);
        this.backButton.labelNode.innerHTML = common.enforceTextDirWithUcc(this.backButton.labelNode.innerHTML, this.textDir);
        this.labelNode.innerHTML = this.labelDivNode.innerHTML;
    }, _setTextDirAttr:function (textDir) {
        if (!this._created || this.textDir != textDir) {
            this._set("textDir", textDir);
            if (this.getTextDir(this.labelDivNode.innerHTML) === "rtl") {
                this.domNode.style.direction = "rtl";
            }
            this.labelDivNode.innerHTML = common.enforceTextDirWithUcc(common.removeUCCFromText(this.labelDivNode.innerHTML), this.textDir);
            common.setTextDirForButtons(this);
        }
    }});
});

