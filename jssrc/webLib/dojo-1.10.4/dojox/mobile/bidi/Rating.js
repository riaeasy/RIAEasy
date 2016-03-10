//>>built

define("dojox/mobile/bidi/Rating", ["dojo/_base/declare", "dojo/dom-style", "../_css3"], function (declare, domStyle, css3) {
    return declare(null, {_setCustomTransform:function (parent) {
        domStyle.set(parent, css3.add({"float":"right"}, {transform:"scaleX(-1)"}));
        return parent;
    }});
});

