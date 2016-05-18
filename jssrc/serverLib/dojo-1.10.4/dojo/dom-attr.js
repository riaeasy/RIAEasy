//>>built

define("dojo/dom-attr", ["exports", "./sniff", "./_base/lang", "./dom", "./dom-style", "./dom-prop"], function (exports, has, lang, dom, style, prop) {
    var forcePropNames = {innerHTML:1, textContent:1, className:1, htmlFor:has("ie"), value:1}, attrNames = {classname:"class", htmlfor:"for", tabindex:"tabIndex", readonly:"readOnly"};
    function _hasAttr(node, name) {
        var attr = node.getAttributeNode && node.getAttributeNode(name);
        return !!attr && attr.specified;
    }
    exports.has = function hasAttr(node, name) {
        var lc = name.toLowerCase();
        return forcePropNames[prop.names[lc] || name] || _hasAttr(dom.byId(node), attrNames[lc] || name);
    };
    exports.get = function getAttr(node, name) {
        node = dom.byId(node);
        var lc = name.toLowerCase(), propName = prop.names[lc] || name, forceProp = forcePropNames[propName], value = node[propName];
        if (forceProp && typeof value != "undefined") {
            return value;
        }
        if (propName == "textContent") {
            return prop.get(node, propName);
        }
        if (propName != "href" && (typeof value == "boolean" || lang.isFunction(value))) {
            return value;
        }
        var attrName = attrNames[lc] || name;
        return _hasAttr(node, attrName) ? node.getAttribute(attrName) : null;
    };
    exports.set = function setAttr(node, name, value) {
        node = dom.byId(node);
        if (arguments.length == 2) {
            for (var x in name) {
                exports.set(node, x, name[x]);
            }
            return node;
        }
        var lc = name.toLowerCase(), propName = prop.names[lc] || name, forceProp = forcePropNames[propName];
        if (propName == "style" && typeof value != "string") {
            style.set(node, value);
            return node;
        }
        if (forceProp || typeof value == "boolean" || lang.isFunction(value)) {
            return prop.set(node, name, value);
        }
        node.setAttribute(attrNames[lc] || name, value);
        return node;
    };
    exports.remove = function removeAttr(node, name) {
        dom.byId(node).removeAttribute(attrNames[name.toLowerCase()] || name);
    };
    exports.getNodeProp = function getNodeProp(node, name) {
        node = dom.byId(node);
        var lc = name.toLowerCase(), propName = prop.names[lc] || name;
        if ((propName in node) && propName != "href") {
            return node[propName];
        }
        var attrName = attrNames[lc] || name;
        return _hasAttr(node, attrName) ? node.getAttribute(attrName) : null;
    };
});

