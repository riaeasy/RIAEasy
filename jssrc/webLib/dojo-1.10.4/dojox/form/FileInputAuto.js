//>>built

require({cache:{"url:dojox/form/resources/FileInputAuto.html":"<div class=\"dijitFileInput\">\n\t<input id=\"${id}\" name=\"${name}\" class=\"dijitFileInputReal\" type=\"file\" dojoAttachPoint=\"fileInput\" />\n\t<div class=\"dijitFakeInput\" dojoAttachPoint=\"fakeNodeHolder\">\n\t\t<input class=\"dijitFileInputVisible\" type=\"text\" dojoAttachPoint=\"focusNode, inputNode\" />\n\t\t<div class=\"dijitInline dijitFileInputText\" dojoAttachPoint=\"titleNode\">${label}</div>\n\t\t<div class=\"dijitInline dijitFileInputButton\" dojoAttachPoint=\"cancelNode\" dojoAttachEvent=\"onclick:reset\">${cancelText}</div>\n\t</div>\n\t<div class=\"dijitProgressOverlay\" dojoAttachPoint=\"overlay\">&nbsp;</div>\n</div>\n"}});
define("dojox/form/FileInputAuto", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/fx", "dojo/_base/window", "dojo/dom-style", "dojo/_base/sniff", "dojo/text!./resources/FileInputAuto.html", "dojox/form/FileInput", "dojo/io/iframe"], function (declare, lang, fx, win, domStyle, has, template, FileInput, ioIframe) {
    var FileInputAuto = declare("dojox.form.FileInputAuto", FileInput, {url:"", blurDelay:2000, duration:500, uploadMessage:"Uploading ...", triggerEvent:"onblur", _sent:false, templateString:template, onBeforeSend:function () {
        return {};
    }, startup:function () {
        this._blurListener = this.connect(this.fileInput, this.triggerEvent, "_onBlur");
        this._focusListener = this.connect(this.fileInput, "onfocus", "_onFocus");
        this.inherited(arguments);
    }, _onFocus:function () {
        if (this._blurTimer) {
            clearTimeout(this._blurTimer);
        }
    }, _onBlur:function () {
        if (this._blurTimer) {
            clearTimeout(this._blurTimer);
        }
        if (!this._sent) {
            this._blurTimer = setTimeout(lang.hitch(this, "_sendFile"), this.blurDelay);
        }
    }, setMessage:function (title) {
        this.overlay.removeChild(this.overlay.firstChild);
        this.overlay.appendChild(document.createTextNode(title));
    }, _sendFile:function (e) {
        if (this._sent || this._sending || !this.fileInput.value) {
            return;
        }
        this._sending = true;
        domStyle.set(this.fakeNodeHolder, "display", "none");
        domStyle.set(this.overlay, {opacity:0, display:"block"});
        this.setMessage(this.uploadMessage);
        fx.fadeIn({node:this.overlay, duration:this.duration}).play();
        var _newForm;
        if (has("ie") < 9 || (has("ie") && has("quirks"))) {
            _newForm = document.createElement("<form enctype=\"multipart/form-data\" method=\"post\">");
            _newForm.encoding = "multipart/form-data";
        } else {
            _newForm = document.createElement("form");
            _newForm.setAttribute("enctype", "multipart/form-data");
            _newForm.setAttribute("method", "post");
        }
        _newForm.appendChild(this.fileInput);
        win.body().appendChild(_newForm);
        ioIframe.send({url:this.url, form:_newForm, handleAs:"json", handle:lang.hitch(this, "_handleSend"), content:this.onBeforeSend()});
    }, _handleSend:function (data, ioArgs) {
        this.overlay.removeChild(this.overlay.firstChild);
        this._sent = true;
        this._sending = false;
        domStyle.set(this.overlay, {opacity:0, border:"none", background:"none"});
        this.overlay.style.backgroundImage = "none";
        this.fileInput.style.display = "none";
        this.fakeNodeHolder.style.display = "none";
        fx.fadeIn({node:this.overlay, duration:this.duration}).play(250);
        this.disconnect(this._blurListener);
        this.disconnect(this._focusListener);
        win.body().removeChild(ioArgs.args.form);
        this.fileInput = null;
        this.onComplete(data, ioArgs, this);
    }, reset:function (e) {
        if (this._blurTimer) {
            clearTimeout(this._blurTimer);
        }
        this.disconnect(this._blurListener);
        this.disconnect(this._focusListener);
        this.overlay.style.display = "none";
        this.fakeNodeHolder.style.display = "";
        this.inherited(arguments);
        this._sent = false;
        this._sending = false;
        this._blurListener = this.connect(this.fileInput, this.triggerEvent, "_onBlur");
        this._focusListener = this.connect(this.fileInput, "onfocus", "_onFocus");
    }, onComplete:function (data, ioArgs, widgetRef) {
    }});
    declare("dojox.form.FileInputBlind", FileInputAuto, {startup:function () {
        this.inherited(arguments);
        this._off = domStyle.get(this.inputNode, "width");
        this.inputNode.style.display = "none";
        this._fixPosition();
    }, _fixPosition:function () {
        if (has("ie")) {
            domStyle.set(this.fileInput, "width", "1px");
        } else {
            domStyle.set(this.fileInput, "left", "-" + (this._off) + "px");
        }
    }, reset:function (e) {
        this.inherited(arguments);
        this._fixPosition();
    }});
    return FileInputAuto;
});

