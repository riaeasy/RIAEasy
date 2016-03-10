//>>built

define("dojox/mobile/bidi/_ItemBase", ["dojo/_base/declare", "./common"], function (declare, common) {
    return declare(null, {_setLabelAttr:function (text) {
        this._set("label", text);
        this.labelNode.innerHTML = this._cv ? this._cv(text) : text;
        if (!this.textDir) {
            var p = this.getParent();
            this.textDir = p && p.get("textDir") ? p.get("textDir") : "";
        }
        this.labelNode.innerHTML = common.enforceTextDirWithUcc(this.labelNode.innerHTML, this.textDir);
    }, _setTextDirAttr:function (textDir) {
        if (!this._created || this.textDir !== textDir) {
            this._set("textDir", textDir);
            this.labelNode.innerHTML = common.enforceTextDirWithUcc(common.removeUCCFromText(this.labelNode.innerHTML), this.textDir);
            if (this.badgeObj && this.badgeObj.setTextDir) {
                this.badgeObj.setTextDir(textDir);
            }
        }
    }, getTransOpts:function () {
        var opts = this.inherited(arguments);
        if (!this.isLeftToRight()) {
            opts.transitionDir = opts.transitionDir * -1;
        }
        return opts;
    }});
});

