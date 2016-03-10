//>>built

define("dijit/_editor/plugins/NewPage", ["dojo/_base/declare", "dojo/i18n", "dojo/_base/lang", "../_Plugin", "../../form/Button", "dojo/i18n!../nls/commands"], function (declare, i18n, lang, _Plugin, Button) {
    var NewPage = declare("dijit._editor.plugins.NewPage", _Plugin, {content:"<br>", _initButton:function () {
        var strings = i18n.getLocalization("dijit._editor", "commands"), editor = this.editor;
        this.button = new Button({label:strings["newPage"], ownerDocument:editor.ownerDocument, dir:editor.dir, lang:editor.lang, showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "NewPage", tabIndex:"-1", onClick:lang.hitch(this, "_newPage")});
    }, setEditor:function (editor) {
        this.editor = editor;
        this._initButton();
    }, updateState:function () {
        this.button.set("disabled", this.get("disabled"));
    }, _newPage:function () {
        this.editor.beginEditing();
        this.editor.set("value", this.content);
        this.editor.endEditing();
        this.editor.focus();
    }});
    _Plugin.registry["newPage"] = _Plugin.registry["newpage"] = function (args) {
        return new NewPage({content:("content" in args) ? args.content : "<br>"});
    };
    return NewPage;
});

