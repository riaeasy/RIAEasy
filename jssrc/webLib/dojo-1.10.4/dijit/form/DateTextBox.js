//>>built

define("dijit/form/DateTextBox", ["dojo/_base/declare", "../Calendar", "./_DateTimeTextBox"], function (declare, Calendar, _DateTimeTextBox) {
    return declare("dijit.form.DateTextBox", _DateTimeTextBox, {baseClass:"dijitTextBox dijitComboBox dijitDateTextBox", popupClass:Calendar, _selector:"date", maxHeight:Infinity, value:new Date("")});
});

