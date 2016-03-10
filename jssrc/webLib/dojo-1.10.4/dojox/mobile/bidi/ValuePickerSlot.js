//>>built

define("dojox/mobile/bidi/ValuePickerSlot", ["dojo/_base/declare", "./common"], function (declare, common) {
    return declare(null, {postCreate:function () {
        if (!this.textDir && this.getParent() && this.getParent().get("textDir")) {
            this.textDir = this.getParent().get("textDir");
        }
    }, _getValueAttr:function () {
        return common.removeUCCFromText(this.inputNode.value);
    }, _setValueAttr:function (value) {
        this.inherited(arguments);
        this._applyTextDirToValueNode();
    }, _setTextDirAttr:function (textDir) {
        if (textDir && this.textDir !== textDir) {
            this.textDir = textDir;
            this._applyTextDirToValueNode();
        }
    }, _applyTextDirToValueNode:function () {
        this.inputNode.value = common.removeUCCFromText(this.inputNode.value);
        this.inputNode.value = common.enforceTextDirWithUcc(this.inputNode.value, this.textDir);
    }});
});

