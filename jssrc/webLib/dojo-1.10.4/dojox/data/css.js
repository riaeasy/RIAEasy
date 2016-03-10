//>>built

define("dojox/data/css", ["dojo/_base/lang", "dojo/_base/array"], function (lang, array) {
    var css = lang.getObject("dojox.data.css", true);
    css.rules = {};
    css.rules.forEach = function (fn, ctx, context) {
        if (context) {
            var _processSS = function (styleSheet) {
                array.forEach(styleSheet[styleSheet.cssRules ? "cssRules" : "rules"], function (rule) {
                    if (!rule.type || rule.type !== 3) {
                        var href = "";
                        if (styleSheet && styleSheet.href) {
                            href = styleSheet.href;
                        }
                        fn.call(ctx ? ctx : this, rule, styleSheet, href);
                    }
                });
            };
            array.forEach(context, _processSS);
        }
    };
    css.findStyleSheets = function (sheets) {
        var sheetObjects = [];
        var _processSS = function (styleSheet) {
            var s = css.findStyleSheet(styleSheet);
            if (s) {
                array.forEach(s, function (sheet) {
                    if (array.indexOf(sheetObjects, sheet) === -1) {
                        sheetObjects.push(sheet);
                    }
                });
            }
        };
        array.forEach(sheets, _processSS);
        return sheetObjects;
    };
    css.findStyleSheet = function (sheet) {
        var sheetObjects = [];
        if (sheet.charAt(0) === ".") {
            sheet = sheet.substring(1);
        }
        var _processSS = function (styleSheet) {
            if (styleSheet.href && styleSheet.href.match(sheet)) {
                sheetObjects.push(styleSheet);
                return true;
            }
            if (styleSheet.imports) {
                return array.some(styleSheet.imports, function (importedSS) {
                    return _processSS(importedSS);
                });
            }
            return array.some(styleSheet[styleSheet.cssRules ? "cssRules" : "rules"], function (rule) {
                if (rule.type && rule.type === 3 && _processSS(rule.styleSheet)) {
                    return true;
                }
                return false;
            });
        };
        array.some(document.styleSheets, _processSS);
        return sheetObjects;
    };
    css.determineContext = function (initialStylesheets) {
        var ret = [];
        if (initialStylesheets && initialStylesheets.length > 0) {
            initialStylesheets = css.findStyleSheets(initialStylesheets);
        } else {
            initialStylesheets = document.styleSheets;
        }
        var _processSS = function (styleSheet) {
            ret.push(styleSheet);
            if (styleSheet.imports) {
                array.forEach(styleSheet.imports, function (importedSS) {
                    _processSS(importedSS);
                });
            }
            array.forEach(styleSheet[styleSheet.cssRules ? "cssRules" : "rules"], function (rule) {
                if (rule.type && rule.type === 3) {
                    _processSS(rule.styleSheet);
                }
            });
        };
        array.forEach(initialStylesheets, _processSS);
        return ret;
    };
    return css;
});

