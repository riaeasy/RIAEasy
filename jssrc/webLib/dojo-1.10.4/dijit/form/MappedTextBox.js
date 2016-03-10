//>>built

define("dijit/form/MappedTextBox", ["dojo/_base/declare", "dojo/sniff", "dojo/dom-construct", "./ValidationTextBox"], function (declare, has, domConstruct, ValidationTextBox) {
    return declare("dijit.form.MappedTextBox", ValidationTextBox, {postMixInProperties:function () {
        this.inherited(arguments);
        this.nameAttrSetting = "";
    }, _setNameAttr:"valueNode", serialize:function (val) {
        return val.toString ? val.toString() : "";
    }, toString:function () {
        var val = this.filter(this.get("value"));
        return val != null ? (typeof val == "string" ? val : this.serialize(val, this.constraints)) : "";
    }, validate:function () {
        this.valueNode.value = this.toString();
        return this.inherited(arguments);
    }, buildRendering:function () {
        this.inherited(arguments);
        this.valueNode = domConstruct.place("<input type='hidden'" + ((this.name && !has("msapp")) ? " name=\"" + this.name.replace(/"/g, "&quot;") + "\"" : "") + "/>", this.textbox, "after");
    }, reset:function () {
        this.valueNode.value = "";
        this.inherited(arguments);
    }});
});

