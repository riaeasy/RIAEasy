//>>built

define("dijit/_editor/plugins/Print", ["dojo/_base/declare", "dojo/i18n", "dojo/_base/lang", "dojo/sniff", "../../focus", "../_Plugin", "../../form/Button", "dojo/i18n!../nls/commands"], function (declare, i18n, lang, has, focus, _Plugin, Button) {
    var Print = declare("dijit._editor.plugins.Print", _Plugin, {_initButton:function () {
        var strings = i18n.getLocalization("dijit._editor", "commands"), editor = this.editor;
        this.button = new Button({label:strings["print"], ownerDocument:editor.ownerDocument, dir:editor.dir, lang:editor.lang, showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "Print", tabIndex:"-1", onClick:lang.hitch(this, "_print")});
    }, setEditor:function (editor) {
        this.editor = editor;
        this._initButton();
        this.editor.onLoadDeferred.then(lang.hitch(this, function () {
            if (!this.editor.iframe.contentWindow["print"]) {
                this.button.set("disabled", true);
            }
        }));
    }, updateState:function () {
        var disabled = this.get("disabled");
        if (!this.editor.iframe.contentWindow["print"]) {
            disabled = true;
        }
        this.button.set("disabled", disabled);
    }, _print:function () {
        var edFrame = this.editor.iframe;
        if (edFrame.contentWindow["print"]) {
            if (!has("opera") && !has("chrome")) {
                focus.focus(edFrame);
                edFrame.contentWindow.print();
            } else {
                var edDoc = this.editor.document;
                var content = this.editor.get("value");
                content = "<html><head><meta http-equiv='Content-Type' " + "content='text/html; charset='UTF-8'></head><body>" + content + "</body></html>";
                var win = window.open("javascript: ''", "", "status=0,menubar=0,location=0,toolbar=0," + "width=1,height=1,resizable=0,scrollbars=0");
                win.document.open();
                win.document.write(content);
                win.document.close();
                var styleNodes = edDoc.getElementsByTagName("style");
                if (styleNodes) {
                    var i;
                    for (i = 0; i < styleNodes.length; i++) {
                        var style = styleNodes[i].innerHTML;
                        var sNode = win.document.createElement("style");
                        sNode.appendChild(win.document.createTextNode(style));
                        win.document.getElementsByTagName("head")[0].appendChild(sNode);
                    }
                }
                win.print();
                win.close();
            }
        }
    }});
    _Plugin.registry["print"] = function () {
        return new Print({command:"print"});
    };
    return Print;
});

