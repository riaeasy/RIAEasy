//>>built

define("dojox/editor/plugins/Smiley", ["dojo", "dijit", "dojox", "dijit/_editor/_Plugin", "dijit/form/DropDownButton", "dojo/_base/connect", "dojo/_base/declare", "dojo/i18n", "dojox/editor/plugins/_SmileyPalette", "dojox/html/format", "dojo/i18n!dojox/editor/plugins/nls/Smiley"], function (dojo, dijit, dojox, _Plugin) {
    dojo.experimental("dojox.editor.plugins.Smiley");
    var Smiley = dojo.declare("dojox.editor.plugins.Smiley", _Plugin, {iconClassPrefix:"dijitAdditionalEditorIcon", emoticonMarker:"[]", emoticonImageClass:"dojoEditorEmoticon", _initButton:function () {
        this.dropDown = new dojox.editor.plugins._SmileyPalette();
        this.connect(this.dropDown, "onChange", function (ascii) {
            this.button.closeDropDown();
            this.editor.focus();
            ascii = this.emoticonMarker.charAt(0) + ascii + this.emoticonMarker.charAt(1);
            this.editor.execCommand("inserthtml", ascii);
        });
        this.i18n = dojo.i18n.getLocalization("dojox.editor.plugins", "Smiley");
        this.button = new dijit.form.DropDownButton({label:this.i18n.smiley, showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "Smiley", tabIndex:"-1", dropDown:this.dropDown});
        this.emoticonImageRegexp = new RegExp("class=(\"|')" + this.emoticonImageClass + "(\"|')");
    }, updateState:function () {
        this.button.set("disabled", this.get("disabled"));
    }, setEditor:function (editor) {
        this.editor = editor;
        this._initButton();
        this.editor.contentPreFilters.push(dojo.hitch(this, this._preFilterEntities));
        this.editor.contentPostFilters.push(dojo.hitch(this, this._postFilterEntities));
        if (dojo.isFF) {
            var deleteHandler = dojo.hitch(this, function () {
                var editor = this.editor;
                setTimeout(function () {
                    if (editor.editNode) {
                        dojo.style(editor.editNode, "opacity", "0.99");
                        setTimeout(function () {
                            if (editor.editNode) {
                                dojo.style(editor.editNode, "opacity", "");
                            }
                        }, 0);
                    }
                }, 0);
                return true;
            });
            this.editor.onLoadDeferred.addCallback(dojo.hitch(this, function () {
                this.editor.addKeyHandler(dojo.keys.DELETE, false, false, deleteHandler);
                this.editor.addKeyHandler(dojo.keys.BACKSPACE, false, false, deleteHandler);
            }));
        }
    }, _preFilterEntities:function (value) {
        return value.replace(/\[([^\]]*)\]/g, dojo.hitch(this, this._decode));
    }, _postFilterEntities:function (value) {
        return value.replace(/<img [^>]*>/gi, dojo.hitch(this, this._encode));
    }, _decode:function (str, ascii) {
        var emoticon = dojox.editor.plugins.Emoticon.fromAscii(ascii);
        return emoticon ? emoticon.imgHtml(this.emoticonImageClass) : str;
    }, _encode:function (str) {
        if (str.search(this.emoticonImageRegexp) > -1) {
            return this.emoticonMarker.charAt(0) + str.replace(/(<img [^>]*)alt="([^"]*)"([^>]*>)/, "$2") + this.emoticonMarker.charAt(1);
        } else {
            return str;
        }
    }});
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        if (o.args.name === "smiley") {
            o.plugin = new Smiley();
        }
    });
    return Smiley;
});

