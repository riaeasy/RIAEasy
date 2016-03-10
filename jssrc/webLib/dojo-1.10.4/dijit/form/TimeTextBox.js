//>>built

define("dijit/form/TimeTextBox", ["dojo/_base/declare", "dojo/keys", "dojo/_base/lang", "../_TimePicker", "./_DateTimeTextBox"], function (declare, keys, lang, _TimePicker, _DateTimeTextBox) {
    return declare("dijit.form.TimeTextBox", _DateTimeTextBox, {baseClass:"dijitTextBox dijitComboBox dijitTimeTextBox", popupClass:_TimePicker, _selector:"time", value:new Date(""), maxHeight:-1, _onKey:function (evt) {
        if (this.disabled || this.readOnly) {
            return;
        }
        this.inherited(arguments);
        switch (evt.keyCode) {
          case keys.ENTER:
          case keys.TAB:
          case keys.ESCAPE:
          case keys.DOWN_ARROW:
          case keys.UP_ARROW:
            break;
          default:
            this.defer(function () {
                var val = this.get("displayedValue");
                this.filterString = (val && !this.parse(val, this.constraints)) ? val.toLowerCase() : "";
                if (this._opened) {
                    this.closeDropDown();
                }
                this.openDropDown();
            });
        }
    }});
});

