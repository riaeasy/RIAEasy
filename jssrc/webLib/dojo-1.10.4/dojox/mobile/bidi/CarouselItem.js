//>>built

define("dojox/mobile/bidi/CarouselItem", ["dojo/_base/declare", "./common"], function (declare, common) {
    return declare(null, {_setHeaderTextAttr:function (text) {
        this._set("headerText", text);
        this.headerTextNode.innerHTML = this._cv ? this._cv(text) : text;
        var p = this.getParent() ? this.getParent().getParent() : null;
        this.textDir = this.textDir ? this.textDir : p ? p.get("textDir") : "";
        if (this.textDir) {
            this.headerTextNode.innerHTML = common.enforceTextDirWithUcc(this.headerTextNode.innerHTML, this.textDir);
        }
    }, _setFooterTextAttr:function (text) {
        this._set("footerText", text);
        this.footerTextNode.innerHTML = this._cv ? this._cv(text) : text;
        var p = this.getParent() ? this.getParent().getParent() : null;
        this.textDir = this.textDir ? this.textDir : p ? p.get("textDir") : "";
        if (this.textDir) {
            this.footerTextNode.innerHTML = _BidiSupport.enforceTextDirWithUcc(this.footerTextNode.innerHTML, this.textDir);
        }
    }});
});

