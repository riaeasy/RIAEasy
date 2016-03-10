//>>built

define("dojox/form/uploader/_Flash", ["dojo/dom-form", "dojo/dom-style", "dojo/dom-construct", "dojo/dom-attr", "dojo/_base/declare", "dojo/_base/config", "dojo/_base/connect", "dojo/_base/lang", "dojo/_base/array", "dojox/embed/Flash"], function (domForm, domStyle, domConstruct, domAttr, declare, config, connect, lang, arrayUtil, embedFlash) {
    return declare("dojox.form.uploader._Flash", [], {swfPath:config.uploaderPath || require.toUrl("dojox/form/resources/uploader.swf"), preventCache:true, skipServerCheck:true, serverTimeout:2000, isDebug:false, devMode:false, deferredUploading:0, postMixInProperties:function () {
        if (this.uploadType === "flash") {
            this._files = [];
            this._fileMap = {};
            this._createInput = this._createFlashUploader;
            this.getFileList = this.getFlashFileList;
            this.reset = this.flashReset;
            this.upload = this.uploadFlash;
            this.fieldname = "flashUploadFiles";
        }
        this.inherited(arguments);
    }, onReady:function (uploader) {
    }, onLoad:function (uploader) {
    }, onFileChange:function (fileArray) {
    }, onFileProgress:function (fileArray) {
    }, getFlashFileList:function () {
        return this._files;
    }, flashReset:function () {
        this.flashMovie.reset();
        this._files = [];
        this._fileMap = {};
    }, uploadFlash:function (formData) {
        this.onBegin(this.getFileList());
        formData = formData || {};
        formData.returnType = "F";
        formData.uploadType = this.uploadType;
        console.log("flas upload", formData);
        this.flashMovie.doUpload(formData);
    }, _change:function (fileArray) {
        this._files = this._files.concat(fileArray);
        arrayUtil.forEach(fileArray, function (f) {
            f.bytesLoaded = 0;
            f.bytesTotal = f.size;
            this._fileMap[f.name + "_" + f.size] = f;
        }, this);
        this.onChange(this._files);
        this.onFileChange(fileArray);
    }, _complete:function (fileArray) {
        var o = this._getCustomEvent();
        o.type = "load";
        this.onComplete(fileArray);
    }, _progress:function (f) {
        this._fileMap[f.name + "_" + f.bytesTotal].bytesLoaded = f.bytesLoaded;
        var o = this._getCustomEvent();
        this.onFileProgress(f);
        this.onProgress(o);
    }, _error:function (err) {
        this.onError(err);
    }, _onFlashBlur:function (fileArray) {
    }, _getCustomEvent:function () {
        var o = {bytesLoaded:0, bytesTotal:0, type:"progress", timeStamp:new Date().getTime()};
        for (var nm in this._fileMap) {
            o.bytesTotal += this._fileMap[nm].bytesTotal;
            o.bytesLoaded += this._fileMap[nm].bytesLoaded;
        }
        o.decimal = o.bytesLoaded / o.bytesTotal;
        o.percent = Math.ceil((o.bytesLoaded / o.bytesTotal) * 100) + "%";
        return o;
    }, _connectFlash:function () {
        this._subs = [];
        this._cons = [];
        var doSub = lang.hitch(this, function (s, funcStr) {
            this._subs.push(connect.subscribe(this.id + s, this, funcStr));
        });
        doSub("/filesSelected", "_change");
        doSub("/filesUploaded", "_complete");
        doSub("/filesProgress", "_progress");
        doSub("/filesError", "_error");
        doSub("/filesCanceled", "onCancel");
        doSub("/stageBlur", "_onFlashBlur");
        this.connect(this.domNode, "focus", function () {
            this.flashMovie.focus();
            this.flashMovie.doFocus();
        });
        if (this.tabIndex >= 0) {
            domAttr.set(this.domNode, "tabIndex", this.tabIndex);
        }
    }, _createFlashUploader:function () {
        var w = this.btnSize.w;
        var h = this.btnSize.h;
        if (!w) {
            setTimeout(dojo.hitch(this, function () {
                this._getButtonStyle(this.domNode);
                this._createFlashUploader();
            }), 200);
            return;
        }
        var url = this.getUrl();
        if (url) {
            if (url.toLowerCase().indexOf("http") < 0 && url.indexOf("/") != 0) {
                var loc = window.location.href.split("/");
                loc.pop();
                loc = loc.join("/") + "/";
                url = loc + url;
            }
        } else {
            console.warn("Warning: no uploadUrl provided.");
        }
        this.inputNode = domConstruct.create("div", {className:"dojoxFlashNode"}, this.domNode, "first");
        domStyle.set(this.inputNode, {position:"absolute", top:"-2px", width:w + "px", height:h + "px", opacity:0});
        var args = {expressInstall:true, path:(this.swfPath.uri || this.swfPath) + ((this.preventCache) ? ("?cb_" + (new Date().getTime())) : ""), width:w, height:h, allowScriptAccess:"always", allowNetworking:"all", vars:{uploadDataFieldName:this.flashFieldName || this.name + "Flash", uploadUrl:url, uploadOnSelect:this.uploadOnSelect, deferredUploading:this.deferredUploading || 0, selectMultipleFiles:this.multiple, id:this.id, isDebug:this.isDebug, noReturnCheck:this.skipServerCheck, serverTimeout:this.serverTimeout}, params:{scale:"noscale", wmode:"opaque", allowScriptAccess:"always", allowNetworking:"all"}};
        this.flashObject = new embedFlash(args, this.inputNode);
        this.flashObject.onError = lang.hitch(function (msg) {
            console.error("Flash Error: " + msg);
        });
        this.flashObject.onReady = lang.hitch(this, function () {
            this.onReady(this);
        });
        this.flashObject.onLoad = lang.hitch(this, function (mov) {
            this.flashMovie = mov;
            this.flashReady = true;
            this.onLoad(this);
        });
        this._connectFlash();
    }});
});

