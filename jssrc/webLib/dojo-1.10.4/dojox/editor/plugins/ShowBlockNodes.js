//>>built

define("dojox/editor/plugins/ShowBlockNodes", ["dojo", "dijit", "dojox", "dijit/_editor/_Plugin", "dijit/form/Button", "dijit/form/ToggleButton", "dojo/_base/connect", "dojo/_base/declare", "dojo/i18n", "dojo/i18n!dojox/editor/plugins/nls/ShowBlockNodes"], function (dojo, dijit, dojox, _Plugin) {
    var ShowBlockNodes = dojo.declare("dojox.editor.plugins.ShowBlockNodes", _Plugin, {useDefaultCommand:false, iconClassPrefix:"dijitAdditionalEditorIcon", _styled:false, _initButton:function () {
        var strings = dojo.i18n.getLocalization("dojox.editor.plugins", "ShowBlockNodes");
        this.button = new dijit.form.ToggleButton({label:strings["showBlockNodes"], showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "ShowBlockNodes", tabIndex:"-1", onChange:dojo.hitch(this, "_showBlocks")});
        this.editor.addKeyHandler(dojo.keys.F9, true, true, dojo.hitch(this, this.toggle));
    }, updateState:function () {
        this.button.set("disabled", this.get("disabled"));
    }, setEditor:function (editor) {
        this.editor = editor;
        this._initButton();
    }, toggle:function () {
        this.button.set("checked", !this.button.get("checked"));
    }, _showBlocks:function (show) {
        var doc = this.editor.document;
        if (!this._styled) {
            try {
                this._styled = true;
                var style = "";
                var blocks = ["div", "p", "ul", "ol", "table", "h1", "h2", "h3", "h4", "h5", "h6", "pre", "dir", "center", "blockquote", "form", "fieldset", "address", "object", "pre", "hr", "ins", "noscript", "li", "map", "button", "dd", "dt"];
                var template = "@media screen {\n" + "\t.editorShowBlocks {TAG} {\n" + "\t\tbackground-image: url({MODURL}/images/blockelems/{TAG}.gif);\n" + "\t\tbackground-repeat: no-repeat;\n" + "\t\tbackground-position: top left;\n" + "\t\tborder-width: 1px;\n" + "\t\tborder-style: dashed;\n" + "\t\tborder-color: #D0D0D0;\n" + "\t\tpadding-top: 15px;\n" + "\t\tpadding-left: 15px;\n" + "\t}\n" + "}\n";
                dojo.forEach(blocks, function (tag) {
                    style += template.replace(/\{TAG\}/gi, tag);
                });
                var modurl = dojo.moduleUrl(dojox._scopeName, "editor/plugins/resources").toString();
                if (!(modurl.match(/^https?:\/\//i)) && !(modurl.match(/^file:\/\//i))) {
                    var bUrl;
                    if (modurl.charAt(0) === "/") {
                        var proto = dojo.doc.location.protocol;
                        var hostn = dojo.doc.location.host;
                        bUrl = proto + "//" + hostn;
                    } else {
                        bUrl = this._calcBaseUrl(dojo.global.location.href);
                    }
                    if (bUrl[bUrl.length - 1] !== "/" && modurl.charAt(0) !== "/") {
                        bUrl += "/";
                    }
                    modurl = bUrl + modurl;
                }
                style = style.replace(/\{MODURL\}/gi, modurl);
                if (!dojo.isIE) {
                    var sNode = doc.createElement("style");
                    sNode.appendChild(doc.createTextNode(style));
                    doc.getElementsByTagName("head")[0].appendChild(sNode);
                } else {
                    var ss = doc.createStyleSheet("");
                    ss.cssText = style;
                }
            }
            catch (e) {
                console.warn(e);
            }
        }
        if (show) {
            dojo.addClass(this.editor.editNode, "editorShowBlocks");
        } else {
            dojo.removeClass(this.editor.editNode, "editorShowBlocks");
        }
    }, _calcBaseUrl:function (fullUrl) {
        var baseUrl = null;
        if (fullUrl !== null) {
            var index = fullUrl.indexOf("?");
            if (index != -1) {
                fullUrl = fullUrl.substring(0, index);
            }
            index = fullUrl.lastIndexOf("/");
            if (index > 0 && index < fullUrl.length) {
                baseUrl = fullUrl.substring(0, index);
            } else {
                baseUrl = fullUrl;
            }
        }
        return baseUrl;
    }});
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        var name = o.args.name.toLowerCase();
        if (name === "showblocknodes") {
            o.plugin = new ShowBlockNodes();
        }
    });
    return ShowBlockNodes;
});

