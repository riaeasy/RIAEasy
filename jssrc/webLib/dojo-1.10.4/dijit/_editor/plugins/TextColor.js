//>>built

define("dijit/_editor/plugins/TextColor", ["require", "dojo/colors", "dojo/_base/declare", "dojo/_base/lang", "../_Plugin", "../../form/DropDownButton"], function (require, colors, declare, lang, _Plugin, DropDownButton) {
    var TextColor = declare("dijit._editor.plugins.TextColor", _Plugin, {buttonClass:DropDownButton, colorPicker:"dijit/ColorPalette", useDefaultCommand:false, _initButton:function () {
        this.command = this.name;
        this.inherited(arguments);
        var self = this;
        this.button.loadDropDown = function (callback) {
            function onColorPaletteLoad(ColorPalette) {
                self.button.dropDown = new ColorPalette({dir:self.editor.dir, ownerDocument:self.editor.ownerDocument, value:self.value, onChange:function (color) {
                    self.editor.execCommand(self.command, color);
                }, onExecute:function () {
                    self.editor.execCommand(self.command, this.get("value"));
                }});
                callback();
            }
            if (typeof self.colorPicker == "string") {
                require([self.colorPicker], onColorPaletteLoad);
            } else {
                onColorPaletteLoad(self.colorPicker);
            }
        };
    }, updateState:function () {
        var _e = this.editor;
        var _c = this.command;
        if (!_e || !_e.isLoaded || !_c.length) {
            return;
        }
        if (this.button) {
            var disabled = this.get("disabled");
            this.button.set("disabled", disabled);
            if (disabled) {
                return;
            }
            var value;
            try {
                value = _e.queryCommandValue(_c) || "";
            }
            catch (e) {
                value = "";
            }
        }
        if (value == "") {
            value = "#000000";
        }
        if (value == "transparent") {
            value = "#ffffff";
        }
        if (typeof value == "string") {
            if (value.indexOf("rgb") > -1) {
                value = colors.fromRgb(value).toHex();
            }
        } else {
            value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
            value = value.toString(16);
            value = "#000000".slice(0, 7 - value.length) + value;
        }
        this.value = value;
        var dropDown = this.button.dropDown;
        if (dropDown && dropDown.get && value !== dropDown.get("value")) {
            dropDown.set("value", value, false);
        }
    }});
    _Plugin.registry["foreColor"] = function (args) {
        return new TextColor(args);
    };
    _Plugin.registry["hiliteColor"] = function (args) {
        return new TextColor(args);
    };
    return TextColor;
});

