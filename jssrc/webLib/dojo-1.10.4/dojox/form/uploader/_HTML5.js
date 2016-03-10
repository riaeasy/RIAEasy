//>>built

define("dojox/form/uploader/_HTML5", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo"], function (declare, lang, arrayUtil, dojo) {
    return declare("dojox.form.uploader._HTML5", [], {errMsg:"Error uploading files. Try checking permissions", uploadType:"html5", postMixInProperties:function () {
        this.inherited(arguments);
        if (this.uploadType === "html5") {
        }
    }, postCreate:function () {
        this.connectForm();
        this.inherited(arguments);
        if (this.uploadOnSelect) {
            this.connect(this, "onChange", function (data) {
                this.upload(data[0]);
            });
        }
    }, _drop:function (e) {
        dojo.stopEvent(e);
        var dt = e.dataTransfer;
        this._files = dt.files;
        this.onChange(this.getFileList());
    }, upload:function (formData) {
        this.onBegin(this.getFileList());
        this.uploadWithFormData(formData);
    }, addDropTarget:function (node, onlyConnectDrop) {
        if (!onlyConnectDrop) {
            this.connect(node, "dragenter", dojo.stopEvent);
            this.connect(node, "dragover", dojo.stopEvent);
            this.connect(node, "dragleave", dojo.stopEvent);
        }
        this.connect(node, "drop", "_drop");
    }, uploadWithFormData:function (data) {
        if (!this.getUrl()) {
            console.error("No upload url found.", this);
            return;
        }
        var fd = new FormData(), fieldName = this._getFileFieldName();
        arrayUtil.forEach(this._files, function (f, i) {
            fd.append(fieldName, f);
        }, this);
        if (data) {
            data.uploadType = this.uploadType;
            for (var nm in data) {
                fd.append(nm, data[nm]);
            }
        }
        var xhr = this.createXhr();
        xhr.send(fd);
    }, _xhrProgress:function (evt) {
        if (evt.lengthComputable) {
            var o = {bytesLoaded:evt.loaded, bytesTotal:evt.total, type:evt.type, timeStamp:evt.timeStamp};
            if (evt.type == "load") {
                o.percent = "100%";
                o.decimal = 1;
            } else {
                o.decimal = evt.loaded / evt.total;
                o.percent = Math.ceil((evt.loaded / evt.total) * 100) + "%";
            }
            this.onProgress(o);
        }
    }, createXhr:function () {
        var xhr = new XMLHttpRequest();
        var timer;
        xhr.upload.addEventListener("progress", lang.hitch(this, "_xhrProgress"), false);
        xhr.addEventListener("load", lang.hitch(this, "_xhrProgress"), false);
        xhr.addEventListener("error", lang.hitch(this, function (evt) {
            this.onError(evt);
            clearInterval(timer);
        }), false);
        xhr.addEventListener("abort", lang.hitch(this, function (evt) {
            this.onAbort(evt);
            clearInterval(timer);
        }), false);
        xhr.onreadystatechange = lang.hitch(this, function () {
            if (xhr.readyState === 4) {
                clearInterval(timer);
                try {
                    this.onComplete(JSON.parse(xhr.responseText.replace(/^\{\}&&/, "")));
                }
                catch (e) {
                    var msg = "Error parsing server result:";
                    console.error(msg, e);
                    console.error(xhr.responseText);
                    this.onError(msg, e);
                }
            }
        });
        xhr.open("POST", this.getUrl());
        xhr.setRequestHeader("Accept", "application/json");
        timer = setInterval(lang.hitch(this, function () {
            try {
                if (typeof (xhr.statusText)) {
                }
            }
            catch (e) {
                clearInterval(timer);
            }
        }), 250);
        return xhr;
    }});
});

