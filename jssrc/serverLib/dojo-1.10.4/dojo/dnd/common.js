//>>built

define("dojo/dnd/common", ["../sniff", "../_base/kernel", "../_base/lang", "../dom"], function (has, kernel, lang, dom) {
    var exports = lang.getObject("dojo.dnd", true);
    exports.getCopyKeyState = function (evt) {
        return evt[has("mac") ? "metaKey" : "ctrlKey"];
    };
    exports._uniqueId = 0;
    exports.getUniqueId = function () {
        var id;
        do {
            id = kernel._scopeName + "Unique" + (++exports._uniqueId);
        } while (dom.byId(id));
        return id;
    };
    exports._empty = {};
    exports.isFormElement = function (e) {
        var t = e.target;
        if (t.nodeType == 3) {
            t = t.parentNode;
        }
        return " a button textarea input select option ".indexOf(" " + t.tagName.toLowerCase() + " ") >= 0;
    };
    return exports;
});

