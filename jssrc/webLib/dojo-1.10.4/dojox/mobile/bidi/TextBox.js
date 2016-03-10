//>>built

define("dojox/mobile/bidi/TextBox", ["dojo/_base/declare", "dijit/_BidiSupport"], function (declare) {
    return declare(null, {_setTextDirAttr:function (textDir) {
        if (!this._created || this.textDir != textDir) {
            this._set("textDir", textDir);
            if (this.value) {
                this.applyTextDir(this.focusNode || this.textbox);
            } else {
                this.applyTextDir(this.focusNode || this.textbox, this.textbox.getAttribute("placeholder"));
            }
        }
    }, _setDirAttr:function (dir) {
        if (!(this.textDir && this.textbox)) {
            this.dir = dir;
        }
    }, _onBlur:function (e) {
        this.inherited(arguments);
        if (!this.textbox.value) {
            this.applyTextDir(this.textbox, this.textbox.getAttribute("placeholder"));
        }
    }, _onInput:function (e) {
        this.inherited(arguments);
        if (!this.textbox.value) {
            this.applyTextDir(this.textbox, this.textbox.getAttribute("placeholder"));
        }
    }});
});

