//>>built

define("dijit/form/ToggleButton", ["dojo/_base/declare", "dojo/_base/kernel", "./Button", "./_ToggleButtonMixin"], function (declare, kernel, Button, _ToggleButtonMixin) {
    return declare("dijit.form.ToggleButton", [Button, _ToggleButtonMixin], {baseClass:"dijitToggleButton", setChecked:function (checked) {
        kernel.deprecated("setChecked(" + checked + ") is deprecated. Use set('checked'," + checked + ") instead.", "", "2.0");
        this.set("checked", checked);
    }});
});

