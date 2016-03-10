//>>built

define("dojox/fx/style", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/fx", "dojo/fx", "./_base", "dojo/_base/array", "dojo/dom", "dojo/dom-style", "dojo/dom-class", "dojo/_base/connect"], function (dojo, lang, baseFx, coreFx, dojoxFx, arrayUtil, dom, domStyle, domClass, connectUtil) {
    dojo.experimental("dojox.fx.style");
    var _getStyleSnapshot = function (cache) {
        return arrayUtil.map(dojoxFx._allowedProperties, function (style) {
            return cache[style];
        });
    };
    var _getCalculatedStyleChanges = function (node, cssClass, addClass) {
        node = dom.byId(node);
        var cs = domStyle.getComputedStyle(node);
        var _before = _getStyleSnapshot(cs);
        dojo[(addClass ? "addClass" : "removeClass")](node, cssClass);
        var _after = _getStyleSnapshot(cs);
        dojo[(addClass ? "removeClass" : "addClass")](node, cssClass);
        var calculated = {}, i = 0;
        arrayUtil.forEach(dojoxFx._allowedProperties, function (prop) {
            if (_before[i] != _after[i]) {
                calculated[prop] = parseInt(_after[i]);
            }
            i++;
        });
        return calculated;
    };
    var styleFx = {addClass:function (node, cssClass, args) {
        node = dom.byId(node);
        var pushClass = (function (n) {
            return function () {
                domClass.add(n, cssClass);
                n.style.cssText = _beforeStyle;
            };
        })(node);
        var mixedProperties = _getCalculatedStyleChanges(node, cssClass, true);
        var _beforeStyle = node.style.cssText;
        var _anim = baseFx.animateProperty(lang.mixin({node:node, properties:mixedProperties}, args));
        connectUtil.connect(_anim, "onEnd", _anim, pushClass);
        return _anim;
    }, removeClass:function (node, cssClass, args) {
        node = dom.byId(node);
        var pullClass = (function (n) {
            return function () {
                domClass.remove(n, cssClass);
                n.style.cssText = _beforeStyle;
            };
        })(node);
        var mixedProperties = _getCalculatedStyleChanges(node, cssClass);
        var _beforeStyle = node.style.cssText;
        var _anim = baseFx.animateProperty(lang.mixin({node:node, properties:mixedProperties}, args));
        connectUtil.connect(_anim, "onEnd", _anim, pullClass);
        return _anim;
    }, toggleClass:function (node, cssClass, condition, args) {
        if (typeof condition == "undefined") {
            condition = !domClass.contains(node, cssClass);
        }
        return dojoxFx[(condition ? "addClass" : "removeClass")](node, cssClass, args);
    }, _allowedProperties:["width", "height", "left", "top", "backgroundColor", "color", "borderBottomWidth", "borderTopWidth", "borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginTop", "marginRight", "marginBottom", "lineHeight", "letterSpacing", "fontSize"]};
    lang.mixin(dojoxFx, styleFx);
    return styleFx;
});

