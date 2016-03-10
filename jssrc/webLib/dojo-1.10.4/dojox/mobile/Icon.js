//>>built

define("dojox/mobile/Icon", ["dojo/_base/declare", "dojo/_base/lang", "dojo/dom-class", "dojo/dom-construct", "./iconUtils", "dojo/has", "require"], function (declare, lang, domClass, domConstruct, iconUtils, has, BidiIcon) {
    var Icon = declare(0 ? "dojox.mobile.NonBidiIcon" : "dojox.mobile.Icon", null, {icon:"", iconPos:"", alt:"", tag:"div", constructor:function (args, node) {
        if (args) {
            lang.mixin(this, args);
        }
        this.domNode = node || domConstruct.create(this.tag);
        iconUtils.createIcon(this.icon, this.iconPos, null, this.alt, this.domNode);
        this._setCustomTransform();
    }, _setCustomTransform:function () {
    }});
    return 0 ? declare("dojox.mobile.Icon", [Icon, BidiIcon]) : Icon;
});

