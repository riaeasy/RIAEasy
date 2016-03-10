//>>built

define("dojox/editor/plugins/PasteFromWord", ["dojo", "dijit", "dojox", "dijit/_editor/_Plugin", "dijit/_base/manager", "dijit/_editor/RichText", "dijit/form/Button", "dijit/Dialog", "dojox/html/format", "dojo/_base/connect", "dojo/_base/declare", "dojo/i18n", "dojo/string", "dojo/i18n!dojox/editor/plugins/nls/PasteFromWord", "dojo/i18n!dijit/nls/common", "dojo/i18n!dijit/_editor/nls/commands"], function (dojo, dijit, dojox, _Plugin) {
    var PasteFromWord = dojo.declare("dojox.editor.plugins.PasteFromWord", _Plugin, {iconClassPrefix:"dijitAdditionalEditorIcon", width:"400px", height:"300px", _template:["<div class='dijitPasteFromWordEmbeddedRTE'>", "<div style='width: ${width}; padding-top: 5px; padding-bottom: 5px;'>${instructions}</div>", "<div id='${uId}_rte' style='width: ${width}; height: ${height}'></div>", "<table style='width: ${width}' tabindex='-1'>", "<tbody>", "<tr>", "<td align='center'>", "<button type='button' dojoType='dijit.form.Button' id='${uId}_paste'>${paste}</button>", "&nbsp;", "<button type='button' dojoType='dijit.form.Button' id='${uId}_cancel'>${buttonCancel}</button>", "</td>", "</tr>", "</tbody>", "</table>", "</div>"].join(""), _filters:[{regexp:/(<meta\s*[^>]*\s*>)|(<\s*link\s* href="file:[^>]*\s*>)|(<\/?\s*\w+:[^>]*\s*>)/gi, handler:""}, {regexp:/(?:<style([^>]*)>([\s\S]*?)<\/style>|<link\s+(?=[^>]*rel=['"]?stylesheet)([^>]*?href=(['"])([^>]*?)\4[^>\/]*)\/?>)/gi, handler:""}, {regexp:/(class="Mso[^"]*")|(<!--(.|\s){1,}?-->)/gi, handler:""}, {regexp:/(<p[^>]*>\s*(\&nbsp;|\u00A0)*\s*<\/p[^>]*>)|(<p[^>]*>\s*<font[^>]*>\s*(\&nbsp;|\u00A0)*\s*<\/\s*font\s*>\s<\/p[^>]*>)/ig, handler:""}, {regexp:/(style="[^"]*mso-[^;][^"]*")|(style="margin:\s*[^;"]*;")/gi, handler:""}, {regexp:/(<\s*script[^>]*>((.|\s)*?)<\\?\/\s*script\s*>)|(<\s*script\b([^<>]|\s)*>?)|(<[^>]*=(\s|)*[("|')]javascript:[^$1][(\s|.)]*[$1][^>]*>)/ig, handler:""}, {regexp:/<(\/?)o\:p[^>]*>/gi, handler:""}], _initButton:function () {
        this._filters = this._filters.slice(0);
        var strings = dojo.i18n.getLocalization("dojox.editor.plugins", "PasteFromWord");
        dojo.mixin(strings, dojo.i18n.getLocalization("dijit", "common"));
        dojo.mixin(strings, dojo.i18n.getLocalization("dijit._editor", "commands"));
        this.button = new dijit.form.Button({label:strings["pasteFromWord"], showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "PasteFromWord", tabIndex:"-1", onClick:dojo.hitch(this, "_openDialog")});
        this._uId = dijit.getUniqueId(this.editor.id);
        strings.uId = this._uId;
        strings.width = this.width || "400px";
        strings.height = this.height || "300px";
        this._dialog = new dijit.Dialog({title:strings["pasteFromWord"]}).placeAt(dojo.body());
        this._dialog.set("content", dojo.string.substitute(this._template, strings));
        dojo.style(dojo.byId(this._uId + "_rte"), "opacity", 0.001);
        this.connect(dijit.byId(this._uId + "_paste"), "onClick", "_paste");
        this.connect(dijit.byId(this._uId + "_cancel"), "onClick", "_cancel");
        this.connect(this._dialog, "onHide", "_clearDialog");
    }, updateState:function () {
        this.button.set("disabled", this.get("disabled"));
    }, setEditor:function (editor) {
        this.editor = editor;
        this._initButton();
    }, _openDialog:function () {
        this._dialog.show();
        if (!this._rte) {
            setTimeout(dojo.hitch(this, function () {
                this._rte = new dijit._editor.RichText({height:this.height || "300px"}, this._uId + "_rte");
                this._rte.startup();
                this._rte.onLoadDeferred.addCallback(dojo.hitch(this, function () {
                    dojo.animateProperty({node:this._rte.domNode, properties:{opacity:{start:0.001, end:1}}}).play();
                }));
            }), 100);
        }
    }, _paste:function () {
        var content = dojox.html.format.prettyPrint(this._rte.get("value"));
        this._dialog.hide();
        var i;
        for (i = 0; i < this._filters.length; i++) {
            var filter = this._filters[i];
            content = content.replace(filter.regexp, filter.handler);
        }
        content = dojox.html.format.prettyPrint(content);
        this.editor.focus();
        this.editor.execCommand("inserthtml", content);
    }, _cancel:function () {
        this._dialog.hide();
    }, _clearDialog:function () {
        this._rte.set("value", "");
    }, destroy:function () {
        if (this._rte) {
            this._rte.destroy();
        }
        if (this._dialog) {
            this._dialog.destroyRecursive();
        }
        delete this._dialog;
        delete this._rte;
        this.inherited(arguments);
    }});
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        var name = o.args.name.toLowerCase();
        if (name === "pastefromword") {
            o.plugin = new PasteFromWord({width:("width" in o.args) ? o.args.width : "400px", height:("height" in o.args) ? o.args.width : "300px"});
        }
    });
    return PasteFromWord;
});

