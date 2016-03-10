//>>built

define("dijit/a11y", ["dojo/_base/array", "dojo/dom", "dojo/dom-attr", "dojo/dom-style", "dojo/_base/lang", "dojo/sniff", "./main"], function (array, dom, domAttr, domStyle, lang, has, dijit) {
    var undefined;
    var a11y = {_isElementShown:function (elem) {
        var s = domStyle.get(elem);
        return (s.visibility != "hidden") && (s.visibility != "collapsed") && (s.display != "none") && (domAttr.get(elem, "type") != "hidden");
    }, hasDefaultTabStop:function (elem) {
        switch (elem.nodeName.toLowerCase()) {
          case "a":
            return domAttr.has(elem, "href");
          case "area":
          case "button":
          case "input":
          case "object":
          case "select":
          case "textarea":
            return true;
          case "iframe":
            var body;
            try {
                var contentDocument = elem.contentDocument;
                if ("designMode" in contentDocument && contentDocument.designMode == "on") {
                    return true;
                }
                body = contentDocument.body;
            }
            catch (e1) {
                try {
                    body = elem.contentWindow.document.body;
                }
                catch (e2) {
                    return false;
                }
            }
            return body && (body.contentEditable == "true" || (body.firstChild && body.firstChild.contentEditable == "true"));
          default:
            return elem.contentEditable == "true";
        }
    }, effectiveTabIndex:function (elem) {
        if (domAttr.get(elem, "disabled")) {
            return undefined;
        } else {
            if (domAttr.has(elem, "tabIndex")) {
                return +domAttr.get(elem, "tabIndex");
            } else {
                return a11y.hasDefaultTabStop(elem) ? 0 : undefined;
            }
        }
    }, isTabNavigable:function (elem) {
        return a11y.effectiveTabIndex(elem) >= 0;
    }, isFocusable:function (elem) {
        return a11y.effectiveTabIndex(elem) >= -1;
    }, _getTabNavigable:function (root) {
        var first, last, lowest, lowestTabindex, highest, highestTabindex, radioSelected = {};
        function radioName(node) {
            return node && node.tagName.toLowerCase() == "input" && node.type && node.type.toLowerCase() == "radio" && node.name && node.name.toLowerCase();
        }
        var shown = a11y._isElementShown, effectiveTabIndex = a11y.effectiveTabIndex;
        var walkTree = function (parent) {
            for (var child = parent.firstChild; child; child = child.nextSibling) {
                if (child.nodeType != 1 || (has("ie") <= 9 && child.scopeName !== "HTML") || !shown(child)) {
                    continue;
                }
                var tabindex = effectiveTabIndex(child);
                if (tabindex >= 0) {
                    if (tabindex == 0) {
                        if (!first) {
                            first = child;
                        }
                        last = child;
                    } else {
                        if (tabindex > 0) {
                            if (!lowest || tabindex < lowestTabindex) {
                                lowestTabindex = tabindex;
                                lowest = child;
                            }
                            if (!highest || tabindex >= highestTabindex) {
                                highestTabindex = tabindex;
                                highest = child;
                            }
                        }
                    }
                    var rn = radioName(child);
                    if (domAttr.get(child, "checked") && rn) {
                        radioSelected[rn] = child;
                    }
                }
                if (child.nodeName.toUpperCase() != "SELECT") {
                    walkTree(child);
                }
            }
        };
        if (shown(root)) {
            walkTree(root);
        }
        function rs(node) {
            return radioSelected[radioName(node)] || node;
        }
        return {first:rs(first), last:rs(last), lowest:rs(lowest), highest:rs(highest)};
    }, getFirstInTabbingOrder:function (root, doc) {
        var elems = a11y._getTabNavigable(dom.byId(root, doc));
        return elems.lowest ? elems.lowest : elems.first;
    }, getLastInTabbingOrder:function (root, doc) {
        var elems = a11y._getTabNavigable(dom.byId(root, doc));
        return elems.last ? elems.last : elems.highest;
    }};
    1 && lang.mixin(dijit, a11y);
    return a11y;
});

