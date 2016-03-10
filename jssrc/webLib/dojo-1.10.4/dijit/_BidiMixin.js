//>>built

define("dijit/_BidiMixin", [], function () {
    var bidi_const = {LRM:"\u200e", LRE:"\u202a", PDF:"\u202c", RLM:"\u200f", RLE:"\u202b"};
    return {textDir:"", getTextDir:function (text) {
        return this.textDir == "auto" ? this._checkContextual(text) : this.textDir;
    }, _checkContextual:function (text) {
        var fdc = /[A-Za-z\u05d0-\u065f\u066a-\u06ef\u06fa-\u07ff\ufb1d-\ufdff\ufe70-\ufefc]/.exec(text);
        return fdc ? (fdc[0] <= "z" ? "ltr" : "rtl") : this.dir ? this.dir : this.isLeftToRight() ? "ltr" : "rtl";
    }, applyTextDir:function (element, text) {
        if (this.textDir) {
            var textDir = this.textDir;
            if (textDir == "auto") {
                if (typeof text === "undefined") {
                    var tagName = element.tagName.toLowerCase();
                    text = (tagName == "input" || tagName == "textarea") ? element.value : element.innerText || element.textContent || "";
                }
                textDir = this._checkContextual(text);
            }
            if (element.dir != textDir) {
                element.dir = textDir;
            }
        }
    }, enforceTextDirWithUcc:function (option, text) {
        if (this.textDir) {
            if (option) {
                option.originalText = text;
            }
            var dir = this.textDir == "auto" ? this._checkContextual(text) : this.textDir;
            return (dir == "ltr" ? bidi_const.LRE : bidi_const.RLE) + text + bidi_const.PDF;
        }
        return text;
    }, restoreOriginalText:function (origObj) {
        if (origObj.originalText) {
            origObj.text = origObj.originalText;
            delete origObj.originalText;
        }
        return origObj;
    }, _setTextDirAttr:function (textDir) {
        if (!this._created || this.textDir != textDir) {
            this._set("textDir", textDir);
            var node = null;
            if (this.displayNode) {
                node = this.displayNode;
                this.displayNode.align = this.dir == "rtl" ? "right" : "left";
            } else {
                node = this.textDirNode || this.focusNode || this.textbox;
            }
            if (node) {
                this.applyTextDir(node);
            }
        }
    }};
});

