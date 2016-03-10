//>>built

define("dojox/mobile/bidi/Badge", ["dojo/_base/declare", "./common"], function (declare, common) {
    return declare(null, {textDir:"", setValue:function (value) {
        this.domNode.firstChild.innerHTML = common.enforceTextDirWithUcc(value, this.textDir);
    }, setTextDir:function (textDir) {
        if (this.textDir !== textDir) {
            this.textDir = textDir;
            this.domNode.firstChild.innerHTML = common.enforceTextDirWithUcc(common.removeUCCFromText(this.domNode.firstChild.innerHTML), this.textDir);
        }
    }});
});

