//>>built

define("dojo/_base/window", ["./kernel", "./lang", "../sniff"], function (dojo, lang, has) {
    var ret = {global:dojo.global, doc:dojo.global["document"] || null, body:function (doc) {
        doc = doc || dojo.doc;
        return doc.body || doc.getElementsByTagName("body")[0];
    }, setContext:function (globalObject, globalDocument) {
        dojo.global = ret.global = globalObject;
        dojo.doc = ret.doc = globalDocument;
    }, withGlobal:function (globalObject, callback, thisObject, cbArguments) {
        var oldGlob = dojo.global;
        try {
            dojo.global = ret.global = globalObject;
            return ret.withDoc.call(null, globalObject.document, callback, thisObject, cbArguments);
        }
        finally {
            dojo.global = ret.global = oldGlob;
        }
    }, withDoc:function (documentObject, callback, thisObject, cbArguments) {
        var oldDoc = ret.doc, oldQ = has("quirks"), oldIE = has("ie"), isIE, mode, pwin;
        try {
            dojo.doc = ret.doc = documentObject;
            dojo.isQuirks = has.add("quirks", dojo.doc.compatMode == "BackCompat", true, true);
            if (has("ie")) {
                if ((pwin = documentObject.parentWindow) && pwin.navigator) {
                    isIE = parseFloat(pwin.navigator.appVersion.split("MSIE ")[1]) || undefined;
                    mode = documentObject.documentMode;
                    if (mode && mode != 5 && Math.floor(isIE) != mode) {
                        isIE = mode;
                    }
                    dojo.isIE = has.add("ie", isIE, true, true);
                }
            }
            if (thisObject && typeof callback == "string") {
                callback = thisObject[callback];
            }
            return callback.apply(thisObject, cbArguments || []);
        }
        finally {
            dojo.doc = ret.doc = oldDoc;
            dojo.isQuirks = has.add("quirks", oldQ, true, true);
            dojo.isIE = has.add("ie", oldIE, true, true);
        }
    }};
    1 && lang.mixin(dojo, ret);
    return ret;
});

