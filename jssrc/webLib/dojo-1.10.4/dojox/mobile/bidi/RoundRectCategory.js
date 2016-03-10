//>>built

define("dojox/mobile/bidi/RoundRectCategory", ["dojo/_base/declare", "./common"], function (declare, common) {
    return declare(null, {_setLabelAttr:function (text) {
        if (this.textDir) {
            text = common.enforceTextDirWithUcc(text, this.textDir);
        }
        this.inherited(arguments);
    }, _setTextDirAttr:function (textDir) {
        if (textDir && this.textDir !== textDir) {
            this.textDir = textDir;
            this.label = common.removeUCCFromText(this.label);
            this.set("label", this.label);
        }
    }});
});

