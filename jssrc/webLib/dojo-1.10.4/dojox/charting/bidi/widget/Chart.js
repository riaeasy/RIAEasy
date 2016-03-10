//>>built

define("dojox/charting/bidi/widget/Chart", ["dojo/_base/declare"], function (declare) {
    function validateTextDir(textDir) {
        return /^(ltr|rtl|auto)$/.test(textDir) ? textDir : null;
    }
    return declare(null, {postMixInProperties:function () {
        this.textDir = this.params["textDir"] ? this.params["textDir"] : this.params["dir"];
    }, _setTextDirAttr:function (textDir) {
        if (validateTextDir(textDir) != null) {
            this._set("textDir", textDir);
            this.chart.setTextDir(textDir);
        }
    }, _setDirAttr:function (dir) {
        this._set("dir", dir);
        this.chart.setDir(dir);
    }});
});

