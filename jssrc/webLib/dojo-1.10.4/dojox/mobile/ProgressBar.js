//>>built

define("dojox/mobile/ProgressBar", ["dojo/_base/declare", "dojo/dom-class", "dojo/dom-construct", "dijit/_WidgetBase"], function (declare, domClass, domConstruct, WidgetBase) {
    return declare("dojox.mobile.ProgressBar", WidgetBase, {value:"0", maximum:100, label:"", baseClass:"mblProgressBar", buildRendering:function () {
        this.inherited(arguments);
        this.progressNode = domConstruct.create("div", {className:"mblProgressBarProgress"}, this.domNode);
        this.msgNode = domConstruct.create("div", {className:"mblProgressBarMsg"}, this.domNode);
    }, _setValueAttr:function (value) {
        value += "";
        this._set("value", value);
        var percent = Math.min(100, (value.indexOf("%") != -1 ? parseFloat(value) : this.maximum ? 100 * value / this.maximum : 0));
        this.progressNode.style.width = percent + "%";
        domClass.toggle(this.progressNode, "mblProgressBarNotStarted", !percent);
        domClass.toggle(this.progressNode, "mblProgressBarComplete", percent == 100);
        this.onChange(value, this.maximum, percent);
    }, _setLabelAttr:function (label) {
        this.msgNode.innerHTML = label;
    }, onChange:function () {
    }});
});

