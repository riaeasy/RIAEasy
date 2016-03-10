//>>built

define("dojox/mobile/bidi/Button", ["dojo/_base/declare", "./common"], function (declare, common) {
    return declare(null, {_setLabelAttr:function (content) {
        this.inherited(arguments, [this._cv ? this._cv(content) : content]);
        this.focusNode.innerHTML = common.enforceTextDirWithUcc(this.focusNode.innerHTML, this.textDir);
    }, _setTextDirAttr:function (textDir) {
        if (!this._created || this.textDir !== textDir) {
            this._set("textDir", textDir);
            this.focusNode.innerHTML = common.enforceTextDirWithUcc(common.removeUCCFromText(this.focusNode.innerHTML), this.textDir);
        }
    }});
});

