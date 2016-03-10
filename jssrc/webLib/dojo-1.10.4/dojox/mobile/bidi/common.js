//>>built

define("dojox/mobile/bidi/common", ["dojo/_base/array", "dijit/_BidiSupport"], function (array, _BidiSupport) {
    var common = {};
    common.enforceTextDirWithUcc = function (text, textDir) {
        if (textDir) {
            textDir = (textDir === "auto") ? _BidiSupport.prototype._checkContextual(text) : textDir;
            return ((textDir === "rtl") ? common.MARK.RLE : common.MARK.LRE) + text + common.MARK.PDF;
        }
        return text;
    };
    common.removeUCCFromText = function (text) {
        if (!text) {
            return text;
        }
        return text.replace(/\u202A|\u202B|\u202C/g, "");
    };
    common.setTextDirForButtons = function (widget) {
        var children = widget.getChildren();
        if (children && widget.textDir) {
            array.forEach(children, function (ch) {
                ch.set("textDir", widget.textDir);
            }, widget);
        }
    };
    common.MARK = {LRE:"\u202a", RLE:"\u202b", PDF:"\u202c"};
    return common;
});

