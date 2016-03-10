//>>built

define("dojox/mvc/parserExtension", ["require", "dojo/_base/kernel", "dojo/_base/lang", "require", "dojo/has", "require", "require", "dojox/mvc/_atBindingMixin", "dojox/mvc/Element"], function (require, kernel, lang, win, has, parser, mobileParser, _atBindingMixin) {
    has.add("dom-qsa", !!document.createElement("div").querySelectorAll);
    try {
        1 || has.add("dojo-parser", !!require("dojo/parser"));
    }
    catch (e) {
    }
    try {
        1 || has.add("dojo-mobile-parser", !!require("dojox/mobile/parser"));
    }
    catch (e) {
    }
    if (1) {
        var oldScan = parser.scan;
        parser.scan = function (root, options) {
            return oldScan.apply(this, lang._toArray(arguments)).then(function (list) {
                var dojoType = (options.scope || kernel._scopeName) + "Type", attrData = "data-" + (options.scope || kernel._scopeName) + "-", dataDojoType = attrData + "type";
                for (var nodes = has("dom-qsa") ? root.querySelectorAll("[" + _atBindingMixin.prototype.dataBindAttr + "]") : root.getElementsByTagName("*"), i = 0, l = nodes.length; i < l; i++) {
                    var node = nodes[i], foundBindingInAttribs = false;
                    if (!node.getAttribute(dataDojoType) && !node.getAttribute(dojoType) && node.getAttribute(_atBindingMixin.prototype.dataBindAttr)) {
                        list.push({types:["dojox/mvc/Element"], node:node});
                    }
                }
                return list;
            });
        };
    }
    if (1) {
        var oldParse = mobileParser.parse;
        mobileParser.parse = function (root, options) {
            var dojoType = ((options || {}).scope || kernel._scopeName) + "Type", attrData = "data-" + ((options || {}).scope || kernel._scopeName) + "-", dataDojoType = attrData + "type";
            nodes = has("dom-qsa") ? (root || win.body()).querySelectorAll("[" + _atBindingMixin.prototype.dataBindAttr + "]") : (root || win.body()).getElementsByTagName("*");
            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i], foundBindingInAttribs = false, bindingsInAttribs = [];
                if (!node.getAttribute(dataDojoType) && !node.getAttribute(dojoType) && node.getAttribute(_atBindingMixin.prototype.dataBindAttr)) {
                    node.setAttribute(dataDojoType, "dojox/mvc/Element");
                }
            }
            return oldParse.apply(this, lang._toArray(arguments));
        };
    }
    return parser || mobileParser;
});

