//>>built

define("dojox/form/uploader/_Base", ["dojo/dom-form", "dojo/dom-style", "dojo/dom-construct", "dojo/dom-attr", "dojo/has", "dojo/_base/declare", "dojo/_base/event", "dijit/_Widget", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin"], function (domForm, domStyle, domConstruct, domAttr, has, declare, event, Widget, TemplatedMixin, WidgetsInTemplateMixin) {
    has.add("FormData", function () {
        return !!window.FormData;
    });
    has.add("xhr-sendAsBinary", function () {
        var xhr = window.XMLHttpRequest && new window.XMLHttpRequest();
        return xhr && !!xhr.sendAsBinary;
    });
    has.add("file-multiple", function () {
        return !!({"true":1, "false":1}[domAttr.get(document.createElement("input", {type:"file"}), "multiple")]);
    });
    return declare("dojox.form.uploader._Base", [Widget, TemplatedMixin, WidgetsInTemplateMixin], {getForm:function () {
        if (!this.form) {
            var n = this.domNode;
            while (n && n.tagName && n !== document.body) {
                if (n.tagName.toLowerCase() == "form") {
                    this.form = n;
                    break;
                }
                n = n.parentNode;
            }
        }
        return this.form;
    }, getUrl:function () {
        if (this.uploadUrl) {
            this.url = this.uploadUrl;
        }
        if (this.url) {
            return this.url;
        }
        if (this.getForm()) {
            this.url = this.form.action;
        }
        return this.url;
    }, connectForm:function () {
        this.url = this.getUrl();
        if (!this._fcon && !!this.getForm()) {
            this._fcon = true;
            this.connect(this.form, "onsubmit", function (evt) {
                console.log("SUBMIT");
                event.stop(evt);
                this.submit(this.form);
            });
        }
    }, supports:function (what) {
        switch (what) {
          case "multiple":
            if (this.force == "flash" || this.force == "iframe") {
                return false;
            }
            return has("file-multiple");
          case "FormData":
            return has(what);
          case "sendAsBinary":
            return has("xhr-sendAsBinary");
        }
        return false;
    }, getMimeType:function () {
        return "application/octet-stream";
    }, getFileType:function (name) {
        return name.substring(name.lastIndexOf(".") + 1).toUpperCase();
    }, convertBytes:function (bytes) {
        var kb = Math.round(bytes / 1024 * 100000) / 100000;
        var mb = Math.round(bytes / 1048576 * 100000) / 100000;
        var gb = Math.round(bytes / 1073741824 * 100000) / 100000;
        var value = bytes;
        if (kb > 1) {
            value = kb.toFixed(1) + " kb";
        }
        if (mb > 1) {
            value = mb.toFixed(1) + " mb";
        }
        if (gb > 1) {
            value = gb.toFixed(1) + " gb";
        }
        return {kb:kb, mb:mb, gb:gb, bytes:bytes, value:value};
    }});
});

