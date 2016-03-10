//>>built

define("dojox/mobile/TextArea", ["dojo/_base/declare", "dojo/dom-construct", "./TextBox"], function (declare, domConstruct, TextBox) {
    return declare("dojox.mobile.TextArea", TextBox, {baseClass:"mblTextArea", postMixInProperties:function () {
        if (!this.value && this.srcNodeRef) {
            this.value = this.srcNodeRef.value;
        }
        this.inherited(arguments);
    }, buildRendering:function () {
        if (!this.srcNodeRef) {
            this.srcNodeRef = domConstruct.create("textarea", {});
        }
        this.inherited(arguments);
    }});
});

