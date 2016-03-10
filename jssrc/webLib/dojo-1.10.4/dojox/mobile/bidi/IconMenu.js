//>>built

define("dojox/mobile/bidi/IconMenu", ["dojo/_base/declare", "./common"], function (declare, common) {
    return declare(null, {_setTextDirAttr:function (textDir) {
        if (!this._created || this.textDir !== textDir) {
            this._set("textDir", textDir);
            common.setTextDirForButtons(this);
        }
    }});
});

