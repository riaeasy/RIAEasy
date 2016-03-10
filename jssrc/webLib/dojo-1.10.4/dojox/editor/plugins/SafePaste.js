//>>built

define("dojox/editor/plugins/SafePaste", ["dojo", "dijit", "dojox", "dojox/editor/plugins/PasteFromWord", "dijit/Dialog", "dojo/_base/connect", "dojo/_base/declare", "dojo/i18n", "dojo/string", "dojo/i18n!dojox/editor/plugins/nls/SafePaste", "dojo/i18n!dijit/nls/common", "dojo/i18n!dijit/_editor/nls/commands"], function (dojo, dijit, dojox, PasteFromWord) {
    var SafePaste = dojo.declare("dojox.editor.plugins.SafePaste", [PasteFromWord], {_initButton:function () {
        this._filters = this._filters.slice(0);
        var strings = dojo.i18n.getLocalization("dojox.editor.plugins", "SafePaste");
        dojo.mixin(strings, dojo.i18n.getLocalization("dijit", "common"));
        dojo.mixin(strings, dojo.i18n.getLocalization("dijit._editor", "commands"));
        this._uId = dijit.getUniqueId(this.editor.id);
        strings.uId = this._uId;
        strings.width = this.width || "400px";
        strings.height = this.height || "300px";
        this._dialog = new dijit.Dialog({title:strings["paste"]}).placeAt(dojo.body());
        this._dialog.set("content", dojo.string.substitute(this._template, strings));
        dojo.style(dojo.byId(this._uId + "_rte"), "opacity", 0.001);
        this.connect(dijit.byId(this._uId + "_paste"), "onClick", "_paste");
        this.connect(dijit.byId(this._uId + "_cancel"), "onClick", "_cancel");
        this.connect(this._dialog, "onHide", "_clearDialog");
        dojo.forEach(this.stripTags, function (tag) {
            var tagName = tag + "";
            var rxStartTag = new RegExp("<\\s*" + tagName + "[^>]*>", "igm");
            var rxEndTag = new RegExp("<\\\\?\\/\\s*" + tagName + "\\s*>", "igm");
            this._filters.push({regexp:rxStartTag, handler:""});
            this._filters.push({regexp:rxEndTag, handler:""});
        }, this);
    }, updateState:function () {
    }, setEditor:function (editor) {
        this.editor = editor;
        this._initButton();
        this.editor.onLoadDeferred.addCallback(dojo.hitch(this, function () {
            var spFunc = dojo.hitch(this, function (e) {
                if (e) {
                    dojo.stopEvent(e);
                }
                this._openDialog();
                return true;
            });
            this.connect(this.editor.editNode, "onpaste", spFunc);
            this.editor._pasteImpl = spFunc;
        }));
    }});
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        var name = o.args.name.toLowerCase();
        if (name === "safepaste") {
            o.plugin = new SafePaste({width:(o.args.hasOwnProperty("width")) ? o.args.width : "400px", height:(o.args.hasOwnProperty("height")) ? o.args.width : "300px", stripTags:(o.args.hasOwnProperty("stripTags")) ? o.args.stripTags : null});
        }
    });
    return SafePaste;
});

