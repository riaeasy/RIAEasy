//>>built

define("dijit/_editor/plugins/TabIndent", ["dojo/_base/declare", "dojo/_base/kernel", "../_Plugin", "../../form/ToggleButton"], function (declare, kernel, _Plugin, ToggleButton) {
    kernel.experimental("dijit._editor.plugins.TabIndent");
    var TabIndent = declare("dijit._editor.plugins.TabIndent", _Plugin, {useDefaultCommand:false, buttonClass:ToggleButton, command:"tabIndent", _initButton:function () {
        this.inherited(arguments);
        var e = this.editor;
        this.own(this.button.on("change", function (val) {
            e.set("isTabIndent", val);
        }));
        this.updateState();
    }, updateState:function () {
        var disabled = this.get("disabled");
        this.button.set("disabled", disabled);
        if (disabled) {
            return;
        }
        this.button.set("checked", this.editor.isTabIndent, false);
    }});
    _Plugin.registry["tabIndent"] = function () {
        return new TabIndent({command:"tabIndent"});
    };
    return TabIndent;
});

