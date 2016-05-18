//>>built

define("dojo/selector/lite", ["../has", "../_base/kernel"], function (has, dojo) {
    "use strict";
    var testDiv = document.createElement("div");
    var matchesSelector = testDiv.matches || testDiv.webkitMatchesSelector || testDiv.mozMatchesSelector || testDiv.msMatchesSelector || testDiv.oMatchesSelector;
    var querySelectorAll = testDiv.querySelectorAll;
    var unionSplit = /([^\s,](?:"(?:\\.|[^"])+"|'(?:\\.|[^'])+'|[^,])*)/g;
    has.add("dom-matches-selector", !!matchesSelector);
    has.add("dom-qsa", !!querySelectorAll);
    var liteEngine = function (selector, root) {
        if (combine && selector.indexOf(",") > -1) {
            return combine(selector, root);
        }
        var doc = root ? root.ownerDocument || root : dojo.doc || document, match = (querySelectorAll ? /^([\w]*)#([\w\-]+$)|^(\.)([\w\-\*]+$)|^(\w+$)/ : /^([\w]*)#([\w\-]+)(?:\s+(.*))?$|(?:^|(>|.+\s+))([\w\-\*]+)(\S*$)/).exec(selector);
        root = root || doc;
        if (match) {
            if (match[2]) {
                var found = dojo.byId ? dojo.byId(match[2], doc) : doc.getElementById(match[2]);
                if (!found || (match[1] && match[1] != found.tagName.toLowerCase())) {
                    return [];
                }
                if (root != doc) {
                    var parent = found;
                    while (parent != root) {
                        parent = parent.parentNode;
                        if (!parent) {
                            return [];
                        }
                    }
                }
                return match[3] ? liteEngine(match[3], found) : [found];
            }
            if (match[3] && root.getElementsByClassName) {
                return root.getElementsByClassName(match[4]);
            }
            var found;
            if (match[5]) {
                found = root.getElementsByTagName(match[5]);
                if (match[4] || match[6]) {
                    selector = (match[4] || "") + match[6];
                } else {
                    return found;
                }
            }
        }
        if (querySelectorAll) {
            if (root.nodeType === 1 && root.nodeName.toLowerCase() !== "object") {
                return useRoot(root, selector, root.querySelectorAll);
            } else {
                return root.querySelectorAll(selector);
            }
        } else {
            if (!found) {
                found = root.getElementsByTagName("*");
            }
        }
        var results = [];
        for (var i = 0, l = found.length; i < l; i++) {
            var node = found[i];
            if (node.nodeType == 1 && jsMatchesSelector(node, selector, root)) {
                results.push(node);
            }
        }
        return results;
    };
    var useRoot = function (context, query, method) {
        var oldContext = context, old = context.getAttribute("id"), nid = old || "__dojo__", hasParent = context.parentNode, relativeHierarchySelector = /^\s*[+~]/.test(query);
        if (relativeHierarchySelector && !hasParent) {
            return [];
        }
        if (!old) {
            context.setAttribute("id", nid);
        } else {
            nid = nid.replace(/'/g, "\\$&");
        }
        if (relativeHierarchySelector && hasParent) {
            context = context.parentNode;
        }
        var selectors = query.match(unionSplit);
        for (var i = 0; i < selectors.length; i++) {
            selectors[i] = "[id='" + nid + "'] " + selectors[i];
        }
        query = selectors.join(",");
        try {
            return method.call(context, query);
        }
        finally {
            if (!old) {
                oldContext.removeAttribute("id");
            }
        }
    };
    if (!has("dom-matches-selector")) {
        var jsMatchesSelector = (function () {
            var caseFix = testDiv.tagName == "div" ? "toLowerCase" : "toUpperCase";
            var selectorTypes = {"":function (tagName) {
                tagName = tagName[caseFix]();
                return function (node) {
                    return node.tagName == tagName;
                };
            }, ".":function (className) {
                var classNameSpaced = " " + className + " ";
                return function (node) {
                    return node.className.indexOf(className) > -1 && (" " + node.className + " ").indexOf(classNameSpaced) > -1;
                };
            }, "#":function (id) {
                return function (node) {
                    return node.id == id;
                };
            }};
            var attrComparators = {"^=":function (attrValue, value) {
                return attrValue.indexOf(value) == 0;
            }, "*=":function (attrValue, value) {
                return attrValue.indexOf(value) > -1;
            }, "$=":function (attrValue, value) {
                return attrValue.substring(attrValue.length - value.length, attrValue.length) == value;
            }, "~=":function (attrValue, value) {
                return (" " + attrValue + " ").indexOf(" " + value + " ") > -1;
            }, "|=":function (attrValue, value) {
                return (attrValue + "-").indexOf(value + "-") == 0;
            }, "=":function (attrValue, value) {
                return attrValue == value;
            }, "":function (attrValue, value) {
                return true;
            }};
            function attr(name, value, type) {
                var firstChar = value.charAt(0);
                if (firstChar == "\"" || firstChar == "'") {
                    value = value.slice(1, -1);
                }
                value = value.replace(/\\/g, "");
                var comparator = attrComparators[type || ""];
                return function (node) {
                    var attrValue = node.getAttribute(name);
                    return attrValue && comparator(attrValue, value);
                };
            }
            function ancestor(matcher) {
                return function (node, root) {
                    while ((node = node.parentNode) != root) {
                        if (matcher(node, root)) {
                            return true;
                        }
                    }
                };
            }
            function parent(matcher) {
                return function (node, root) {
                    node = node.parentNode;
                    return matcher ? node != root && matcher(node, root) : node == root;
                };
            }
            var cache = {};
            function and(matcher, next) {
                return matcher ? function (node, root) {
                    return next(node) && matcher(node, root);
                } : next;
            }
            return function (node, selector, root) {
                var matcher = cache[selector];
                if (!matcher) {
                    if (selector.replace(/(?:\s*([> ])\s*)|(#|\.)?((?:\\.|[\w-])+)|\[\s*([\w-]+)\s*(.?=)?\s*("(?:\\.|[^"])+"|'(?:\\.|[^'])+'|(?:\\.|[^\]])*)\s*\]/g, function (t, combinator, type, value, attrName, attrType, attrValue) {
                        if (value) {
                            matcher = and(matcher, selectorTypes[type || ""](value.replace(/\\/g, "")));
                        } else {
                            if (combinator) {
                                matcher = (combinator == " " ? ancestor : parent)(matcher);
                            } else {
                                if (attrName) {
                                    matcher = and(matcher, attr(attrName, attrValue, attrType));
                                }
                            }
                        }
                        return "";
                    })) {
                        throw new Error("Syntax error in query");
                    }
                    if (!matcher) {
                        return true;
                    }
                    cache[selector] = matcher;
                }
                return matcher(node, root);
            };
        })();
    }
    if (!has("dom-qsa")) {
        var combine = function (selector, root) {
            var selectors = selector.match(unionSplit);
            var indexed = [];
            for (var i = 0; i < selectors.length; i++) {
                selector = new String(selectors[i].replace(/\s*$/, ""));
                selector.indexOf = escape;
                var results = liteEngine(selector, root);
                for (var j = 0, l = results.length; j < l; j++) {
                    var node = results[j];
                    indexed[node.sourceIndex] = node;
                }
            }
            var totalResults = [];
            for (i in indexed) {
                totalResults.push(indexed[i]);
            }
            return totalResults;
        };
    }
    liteEngine.match = matchesSelector ? function (node, selector, root) {
        if (root && root.nodeType != 9) {
            return useRoot(root, selector, function (query) {
                return matchesSelector.call(node, query);
            });
        }
        return matchesSelector.call(node, selector);
    } : jsMatchesSelector;
    return liteEngine;
});

