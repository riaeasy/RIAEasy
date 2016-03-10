//>>built

define("dojox/mobile/RoundRectCategory", ["dojo/_base/declare", "dojo/_base/window", "dojo/dom-construct", "dijit/_Contained", "dijit/_WidgetBase", "dojo/has", "require"], function (declare, win, domConstruct, Contained, WidgetBase, has, BidiRoundRectCategory) {
    var RoundRectCategory = declare(0 ? "dojox.mobile.NonBidiRoundRectCategory" : "dojox.mobile.RoundRectCategory", [WidgetBase, Contained], {label:"", tag:"h2", baseClass:"mblRoundRectCategory", buildRendering:function () {
        var domNode = this.domNode = this.containerNode = this.srcNodeRef || domConstruct.create(this.tag);
        this.inherited(arguments);
        if (!this.label && domNode.childNodes.length === 1 && domNode.firstChild.nodeType === 3) {
            this.label = domNode.firstChild.nodeValue;
        }
    }, _setLabelAttr:function (label) {
        this.label = label;
        this.domNode.innerHTML = this._cv ? this._cv(label) : label;
    }});
    return 0 ? declare("dojox.mobile.RoundRectCategory", [RoundRectCategory, BidiRoundRectCategory]) : RoundRectCategory;
});

