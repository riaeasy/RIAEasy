//>>built

define("dojox/form/uploader/_IFrame", ["dojo/query", "dojo/dom-construct", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/dom-form", "dojo/request/iframe"], function (query, domConstruct, declare, lang, arrayUtil, domForm, request) {
    return declare("dojox.form.uploader._IFrame", [], {postMixInProperties:function () {
        this.inherited(arguments);
        if (this.uploadType === "iframe") {
            this.uploadType = "iframe";
            this.upload = this.uploadIFrame;
        }
    }, uploadIFrame:function (data) {
        var formObject = {}, sendForm, form = this.getForm(), url = this.getUrl(), self = this;
        data = data || {};
        data.uploadType = this.uploadType;
        sendForm = domConstruct.place("<form enctype=\"multipart/form-data\" method=\"post\"></form>", this.domNode);
        arrayUtil.forEach(this._inputs, function (n, i) {
            if (n.value !== "") {
                sendForm.appendChild(n);
                formObject[n.name] = n.value;
            }
        }, this);
        if (data) {
            for (nm in data) {
                if (formObject[nm] === undefined) {
                    domConstruct.create("input", {name:nm, value:data[nm], type:"hidden"}, sendForm);
                }
            }
        }
        request.post(url, {form:sendForm, handleAs:"json", content:data}).then(function (result) {
            domConstruct.destroy(sendForm);
            if (result["ERROR"] || result["error"]) {
                self.onError(result);
            } else {
                self.onComplete(result);
            }
        }, function (err) {
            console.error("error parsing server result", err);
            domConstruct.destroy(sendForm);
            self.onError(err);
        });
    }});
});

