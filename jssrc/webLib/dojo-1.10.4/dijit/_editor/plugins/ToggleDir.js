//>>built

define("dijit/_editor/plugins/ToggleDir", ["dojo/_base/declare", "dojo/dom-style", "dojo/_base/kernel", "dojo/_base/lang", "dojo/on", "../_Plugin", "../../form/ToggleButton"], function (declare, domStyle, kernel, lang, on, _Plugin, ToggleButton) {
    var ToggleDir = declare("dijit._editor.plugins.ToggleDir", _Plugin, {useDefaultCommand:false, command:"toggleDir", buttonClass:ToggleButton, _initButton:function () {
        this.inherited(arguments);
        var button = this.button, editorLtr = this.editor.isLeftToRight();
        this.own(this.button.on("change", lang.hitch(this, function (checked) {
            this.editor.set("textDir", editorLtr ^ checked ? "ltr" : "rtl");
        })));
        var editorDir = editorLtr ? "ltr" : "rtl";
        function setButtonChecked(textDir) {
            button.set("checked", textDir && textDir !== editorDir, false);
        }
        setButtonChecked(this.editor.get("textDir"));
        this.editor.watch("textDir", function (name, oval, nval) {
            setButtonChecked(nval);
        });
    }, updateState:function () {
        this.button.set("disabled", this.get("disabled"));
    }});
    _Plugin.registry["toggleDir"] = function () {
        return new ToggleDir({command:"toggleDir"});
    };
    return ToggleDir;
});

