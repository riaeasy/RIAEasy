//>>built

define("dojox/form/DateTextBox", ["dojo/_base/kernel", "dojo/dom-style", "dojox/widget/Calendar", "dijit/form/_DateTimeTextBox", "dojo/_base/declare"], function (kernel, domStyle, Calendar, _DateTimeTextBox, declare) {
    kernel.experimental("dojox/form/DateTextBox");
    return declare("dojox.form.DateTextBox", _DateTimeTextBox, {baseClass:"dijitTextBox dijitComboBox dojoxDateTextBox", popupClass:Calendar, _selector:"date", openDropDown:function () {
        this.inherited(arguments);
        domStyle.set(this.dropDown.domNode.parentNode, "position", "absolute");
    }});
});

