//>>built

define("dojo/dom-style", ["./sniff", "./dom"], function (has, dom) {
    var getComputedStyle, style = {};
    if (has("webkit")) {
        getComputedStyle = function (node) {
            var s;
            if (node.nodeType == 1) {
                var dv = node.ownerDocument.defaultView;
                s = dv.getComputedStyle(node, null);
                if (!s && node.style) {
                    node.style.display = "";
                    s = dv.getComputedStyle(node, null);
                }
            }
            return s || {};
        };
    } else {
        if (has("ie") && (has("ie") < 9 || has("quirks"))) {
            getComputedStyle = function (node) {
                return node.nodeType == 1 && node.currentStyle ? node.currentStyle : {};
            };
        } else {
            getComputedStyle = function (node) {
                return node.nodeType == 1 ? node.ownerDocument.defaultView.getComputedStyle(node, null) : {};
            };
        }
    }
    style.getComputedStyle = getComputedStyle;
    var toPixel;
    if (!has("ie")) {
        toPixel = function (element, value) {
            return parseFloat(value) || 0;
        };
    } else {
        toPixel = function (element, avalue) {
            if (!avalue) {
                return 0;
            }
            if (avalue == "medium") {
                return 4;
            }
            if (avalue.slice && avalue.slice(-2) == "px") {
                return parseFloat(avalue);
            }
            var s = element.style, rs = element.runtimeStyle, cs = element.currentStyle, sLeft = s.left, rsLeft = rs.left;
            rs.left = cs.left;
            try {
                s.left = avalue;
                avalue = s.pixelLeft;
            }
            catch (e) {
                avalue = 0;
            }
            s.left = sLeft;
            rs.left = rsLeft;
            return avalue;
        };
    }
    style.toPixelValue = toPixel;
    var astr = "DXImageTransform.Microsoft.Alpha";
    var af = function (n, f) {
        try {
            return n.filters.item(astr);
        }
        catch (e) {
            return f ? {} : null;
        }
    };
    var _getOpacity = has("ie") < 9 || (has("ie") < 10 && has("quirks")) ? function (node) {
        try {
            return af(node).Opacity / 100;
        }
        catch (e) {
            return 1;
        }
    } : function (node) {
        return getComputedStyle(node).opacity;
    };
    var _setOpacity = has("ie") < 9 || (has("ie") < 10 && has("quirks")) ? function (node, opacity) {
        if (opacity === "") {
            opacity = 1;
        }
        var ov = opacity * 100, fullyOpaque = opacity === 1;
        if (fullyOpaque) {
            node.style.zoom = "";
            if (af(node)) {
                node.style.filter = node.style.filter.replace(new RegExp("\\s*progid:" + astr + "\\([^\\)]+?\\)", "i"), "");
            }
        } else {
            node.style.zoom = 1;
            if (af(node)) {
                af(node, 1).Opacity = ov;
            } else {
                node.style.filter += " progid:" + astr + "(Opacity=" + ov + ")";
            }
            af(node, 1).Enabled = true;
        }
        if (node.tagName.toLowerCase() == "tr") {
            for (var td = node.firstChild; td; td = td.nextSibling) {
                if (td.tagName.toLowerCase() == "td") {
                    _setOpacity(td, opacity);
                }
            }
        }
        return opacity;
    } : function (node, opacity) {
        return node.style.opacity = opacity;
    };
    var _pixelNamesCache = {left:true, top:true};
    var _pixelRegExp = /margin|padding|width|height|max|min|offset/;
    function _toStyleValue(node, type, value) {
        type = type.toLowerCase();
        if (has("ie") || has("trident")) {
            if (value == "auto") {
                if (type == "height") {
                    return node.offsetHeight;
                }
                if (type == "width") {
                    return node.offsetWidth;
                }
            }
            if (type == "fontweight") {
                switch (value) {
                  case 700:
                    return "bold";
                  case 400:
                  default:
                    return "normal";
                }
            }
        }
        if (!(type in _pixelNamesCache)) {
            _pixelNamesCache[type] = _pixelRegExp.test(type);
        }
        return _pixelNamesCache[type] ? toPixel(node, value) : value;
    }
    var _floatAliases = {cssFloat:1, styleFloat:1, "float":1};
    style.get = function getStyle(node, name) {
        var n = dom.byId(node), l = arguments.length, op = (name == "opacity");
        if (l == 2 && op) {
            return _getOpacity(n);
        }
        name = _floatAliases[name] ? "cssFloat" in n.style ? "cssFloat" : "styleFloat" : name;
        var s = style.getComputedStyle(n);
        return (l == 1) ? s : _toStyleValue(n, name, s[name] || n.style[name]);
    };
    style.set = function setStyle(node, name, value) {
        var n = dom.byId(node), l = arguments.length, op = (name == "opacity");
        name = _floatAliases[name] ? "cssFloat" in n.style ? "cssFloat" : "styleFloat" : name;
        if (l == 3) {
            return op ? _setOpacity(n, value) : n.style[name] = value;
        }
        for (var x in name) {
            style.set(node, x, name[x]);
        }
        return style.getComputedStyle(n);
    };
    return style;
});

