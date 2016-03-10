//>>built

define("dojox/html/styles", ["dojo/_base/lang", "dojo/_base/array", "dojo/_base/window", "dojo/_base/sniff"], function (lang, ArrayUtil, Window, has) {
    var dh = lang.getObject("dojox.html", true);
    var dynamicStyleMap = {};
    var pageStyleSheets = {};
    var titledSheets = [];
    dh.insertCssRule = function (selector, declaration, styleSheetName) {
        var ss = dh.getDynamicStyleSheet(styleSheetName);
        var styleText = selector + " {" + declaration + "}";
        console.log("insertRule:", styleText);
        if (has("ie")) {
            ss.cssText += styleText;
            console.log("ss.cssText:", ss.cssText);
        } else {
            if (ss.sheet) {
                ss.sheet.insertRule(styleText, ss._indicies.length);
            } else {
                ss.appendChild(Window.doc.createTextNode(styleText));
            }
        }
        ss._indicies.push(selector + " " + declaration);
        return selector;
    };
    dh.removeCssRule = function (selector, declaration, styleSheetName) {
        var ss;
        var index = -1;
        var nm;
        var i;
        for (nm in dynamicStyleMap) {
            if (styleSheetName && styleSheetName !== nm) {
                continue;
            }
            ss = dynamicStyleMap[nm];
            for (i = 0; i < ss._indicies.length; i++) {
                if (selector + " " + declaration === ss._indicies[i]) {
                    index = i;
                    break;
                }
            }
            if (index > -1) {
                break;
            }
        }
        if (!ss) {
            console.warn("No dynamic style sheet has been created from which to remove a rule.");
            return false;
        }
        if (index === -1) {
            console.warn("The css rule was not found and could not be removed.");
            return false;
        }
        ss._indicies.splice(index, 1);
        if (has("ie")) {
            ss.removeRule(index);
        } else {
            if (ss.sheet) {
                ss.sheet.deleteRule(index);
            }
        }
        return true;
    };
    dh.modifyCssRule = function (selector, declaration, styleSheetName) {
    };
    dh.getStyleSheet = function (styleSheetName) {
        if (dynamicStyleMap[styleSheetName || "default"]) {
            return dynamicStyleMap[styleSheetName || "default"];
        }
        if (!styleSheetName) {
            return false;
        }
        var allSheets = dh.getStyleSheets();
        if (allSheets[styleSheetName]) {
            return dh.getStyleSheets()[styleSheetName];
        }
        var nm;
        for (nm in allSheets) {
            if (allSheets[nm].href && allSheets[nm].href.indexOf(styleSheetName) > -1) {
                return allSheets[nm];
            }
        }
        return false;
    };
    dh.getDynamicStyleSheet = function (styleSheetName) {
        if (!styleSheetName) {
            styleSheetName = "default";
        }
        if (!dynamicStyleMap[styleSheetName]) {
            if (Window.doc.createStyleSheet) {
                dynamicStyleMap[styleSheetName] = Window.doc.createStyleSheet();
                if (has("ie") < 9) {
                    dynamicStyleMap[styleSheetName].title = styleSheetName;
                }
            } else {
                dynamicStyleMap[styleSheetName] = Window.doc.createElement("style");
                dynamicStyleMap[styleSheetName].setAttribute("type", "text/css");
                Window.doc.getElementsByTagName("head")[0].appendChild(dynamicStyleMap[styleSheetName]);
                console.log(styleSheetName, " ss created: ", dynamicStyleMap[styleSheetName].sheet);
            }
            dynamicStyleMap[styleSheetName]._indicies = [];
        }
        return dynamicStyleMap[styleSheetName];
    };
    dh.enableStyleSheet = function (styleSheetName) {
        var ss = dh.getStyleSheet(styleSheetName);
        if (ss) {
            if (ss.sheet) {
                ss.sheet.disabled = false;
            } else {
                ss.disabled = false;
            }
        }
    };
    dh.disableStyleSheet = function (styleSheetName) {
        var ss = dh.getStyleSheet(styleSheetName);
        if (ss) {
            if (ss.sheet) {
                ss.sheet.disabled = true;
            } else {
                ss.disabled = true;
            }
        }
    };
    dh.activeStyleSheet = function (title) {
        var sheets = dh.getToggledStyleSheets();
        var i;
        if (arguments.length === 1) {
            ArrayUtil.forEach(sheets, function (s) {
                s.disabled = (s.title === title) ? false : true;
            });
        } else {
            for (i = 0; i < sheets.length; i++) {
                if (sheets[i].disabled === false) {
                    return sheets[i];
                }
            }
        }
        return true;
    };
    dh.getPreferredStyleSheet = function () {
    };
    dh.getToggledStyleSheets = function () {
        var nm;
        if (!titledSheets.length) {
            var sObjects = dh.getStyleSheets();
            for (nm in sObjects) {
                if (sObjects[nm].title) {
                    titledSheets.push(sObjects[nm]);
                }
            }
        }
        return titledSheets;
    };
    dh.getStyleSheets = function () {
        if (pageStyleSheets.collected) {
            return pageStyleSheets;
        }
        var sheets = Window.doc.styleSheets;
        ArrayUtil.forEach(sheets, function (n) {
            var s = (n.sheet) ? n.sheet : n;
            var name = s.title || s.href;
            if (has("ie")) {
                if (s.cssText.indexOf("#default#VML") === -1) {
                    if (s.href) {
                        pageStyleSheets[name] = s;
                    } else {
                        if (s.imports.length) {
                            ArrayUtil.forEach(s.imports, function (si) {
                                pageStyleSheets[si.title || si.href] = si;
                            });
                        } else {
                            pageStyleSheets[name] = s;
                        }
                    }
                }
            } else {
                pageStyleSheets[name] = s;
                pageStyleSheets[name].id = s.ownerNode.id;
                var rules = [];
                try {
                    rules = s[s.cssRules ? "cssRules" : "rules"];
                }
                catch (err) {
                    console.warn("Reading css rules from stylesheet " + s.href + " is forbidden due to same-origin policy. See http://www.w3.org/TR/CSP/#cascading-style-sheet-css-parsing", s);
                }
                ArrayUtil.forEach(rules, function (r) {
                    if (r.href) {
                        pageStyleSheets[r.href] = r.styleSheet;
                        pageStyleSheets[r.href].id = s.ownerNode.id;
                    }
                });
            }
        });
        pageStyleSheets.collected = true;
        return pageStyleSheets;
    };
    return dh;
});

