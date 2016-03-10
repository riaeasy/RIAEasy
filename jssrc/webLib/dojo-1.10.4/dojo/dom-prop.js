//>>built

define("dojo/dom-prop", ["exports", "./_base/kernel", "./sniff", "./_base/lang", "./dom", "./dom-style", "./dom-construct", "./_base/connect"], function (exports, dojo, has, lang, dom, style, ctr, conn) {
    var _evtHdlrMap = {}, _ctr = 0, _attrId = dojo._scopeName + "attrid";
    has.add("dom-textContent", function (global, doc, element) {
        return "textContent" in element;
    });
    exports.names = {"class":"className", "for":"htmlFor", tabindex:"tabIndex", readonly:"readOnly", colspan:"colSpan", frameborder:"frameBorder", rowspan:"rowSpan", textcontent:"textContent", valuetype:"valueType"};
    function getText(node) {
        var text = "", ch = node.childNodes;
        for (var i = 0, n; n = ch[i]; i++) {
            if (n.nodeType != 8) {
                if (n.nodeType == 1) {
                    text += getText(n);
                } else {
                    text += n.nodeValue;
                }
            }
        }
        return text;
    }
    exports.get = function getProp(node, name) {
        node = dom.byId(node);
        var lc = name.toLowerCase(), propName = exports.names[lc] || name;
        if (propName == "textContent" && !has("dom-textContent")) {
            return getText(node);
        }
        return node[propName];
    };
    exports.set = function setProp(node, name, value) {
        node = dom.byId(node);
        var l = arguments.length;
        if (l == 2 && typeof name != "string") {
            for (var x in name) {
                exports.set(node, x, name[x]);
            }
            return node;
        }
        var lc = name.toLowerCase(), propName = exports.names[lc] || name;
        if (propName == "style" && typeof value != "string") {
            style.set(node, value);
            return node;
        }
        if (propName == "innerHTML") {
            if (has("ie") && node.tagName.toLowerCase() in {col:1, colgroup:1, table:1, tbody:1, tfoot:1, thead:1, tr:1, title:1}) {
                ctr.empty(node);
                node.appendChild(ctr.toDom(value, node.ownerDocument));
            } else {
                node[propName] = value;
            }
            return node;
        }
        if (propName == "textContent" && !has("dom-textContent")) {
            ctr.empty(node);
            node.appendChild(node.ownerDocument.createTextNode(value));
            return node;
        }
        if (lang.isFunction(value)) {
            var attrId = node[_attrId];
            if (!attrId) {
                attrId = _ctr++;
                node[_attrId] = attrId;
            }
            if (!_evtHdlrMap[attrId]) {
                _evtHdlrMap[attrId] = {};
            }
            var h = _evtHdlrMap[attrId][propName];
            if (h) {
                conn.disconnect(h);
            } else {
                try {
                    delete node[propName];
                }
                catch (e) {
                }
            }
            if (value) {
                _evtHdlrMap[attrId][propName] = conn.connect(node, propName, value);
            } else {
                node[propName] = null;
            }
            return node;
        }
        node[propName] = value;
        return node;
    };
});

