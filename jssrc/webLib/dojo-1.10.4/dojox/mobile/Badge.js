//>>built

define("dojox/mobile/Badge", ["dojo/_base/declare", "dojo/_base/lang", "dojo/dom-class", "dojo/dom-construct", "./iconUtils", "dojo/has", "require"], function (declare, lang, domClass, domConstruct, iconUtils, has, BidiBadge) {
    var Badge = declare(0 ? "dojox.mobile.NonBidiBadge" : "dojox.mobile.Badge", null, {value:"0", className:"mblDomButtonRedBadge", fontSize:16, constructor:function (params, node) {
        if (params) {
            lang.mixin(this, params);
        }
        this.domNode = node ? node : domConstruct.create("div");
        domClass.add(this.domNode, "mblBadge");
        if (this.domNode.className.indexOf("mblDomButton") === -1) {
            domClass.add(this.domNode, this.className);
        }
        if (this.fontSize !== 16) {
            this.domNode.style.fontSize = this.fontSize + "px";
        }
        iconUtils.createDomButton(this.domNode);
        this.setValue(this.value);
    }, getValue:function () {
        return this.domNode.firstChild.innerHTML || "";
    }, setValue:function (value) {
        this.domNode.firstChild.innerHTML = value;
    }});
    return 0 ? declare("dojox.mobile.Badge", [Badge, BidiBadge]) : Badge;
});

