//>>built

define("dojox/mobile/bidi/Carousel", ["dojo/_base/declare", "./common", "dojo/dom-style"], function (declare, common, domStyle) {
    return declare(null, {buildRendering:function () {
        this.inherited(arguments);
        if (!this.isLeftToRight()) {
            if (this.navButton) {
                domStyle.set(this.btnContainerNode, "float", "left");
                this.disconnect(this._prevHandle);
                this.disconnect(this._nextHandle);
                this._prevHandle = this.connect(this.prevBtnNode, "onclick", "onNextBtnClick");
                this._nextHandle = this.connect(this.nextBtnNode, "onclick", "onPrevBtnClick");
            }
            if (this.pageIndicator) {
                domStyle.set(this.piw.domNode, "float", "left");
            }
        }
    }, _setTitleAttr:function (title) {
        this.titleNode.innerHTML = this._cv ? this._cv(title) : title;
        this._set("title", title);
        if (this.textDir) {
            this.titleNode.innerHTML = common.enforceTextDirWithUcc(this.titleNode.innerHTML, this.textDir);
            this.titleNode.style.textAlign = (this.dir.toLowerCase() === "rtl") ? "right" : "left";
        }
    }, _setTextDirAttr:function (textDir) {
        if (textDir && this.textDir !== textDir) {
            this.textDir = textDir;
            this.titleNode.innerHTML = common.removeUCCFromText(this.titleNode.innerHTML);
            this.titleNode.innerHTML = common.enforceTextDirWithUcc(this.titleNode.innerHTML, this.textDir);
            if (this.items.length > 0) {
                this.onComplete(this.items);
            }
        }
    }});
});

