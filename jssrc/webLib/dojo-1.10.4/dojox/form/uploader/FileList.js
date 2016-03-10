//>>built

require({cache:{"url:dojox/form/resources/UploaderFileList.html":"<div class=\"dojoxUploaderFileList\">\n\t<div data-dojo-attach-point=\"progressNode\" class=\"dojoxUploaderFileListProgress\">\n\t\t<div data-dojo-attach-point=\"percentBarNode\" class=\"dojoxUploaderFileListProgressBar\"></div>\n\t\t<div data-dojo-attach-point=\"percentTextNode\" class=\"dojoxUploaderFileListPercentText\">0%</div>\n\t</div>\n\t<table class=\"dojoxUploaderFileListTable\">\n\t\t<thead>\n\t\t\t<tr class=\"dojoxUploaderFileListHeader\">\n\t\t\t\t<th class=\"dojoxUploaderIndex\">${headerIndex}</th>\n\t\t\t\t<th class=\"dojoxUploaderIcon\">${headerType}</th>\n\t\t\t\t<th class=\"dojoxUploaderFileName\">${headerFilename}</th>\n\t\t\t\t<th class=\"dojoxUploaderFileSize\" data-dojo-attach-point=\"sizeHeader\">${headerFilesize}</th>\n\t\t\t</tr>\n\t\t</thead>\n\t\t<tbody class=\"dojoxUploaderFileListContent\" data-dojo-attach-point=\"listNode\"></tbody>\n\t</table>\n<div>"}});
define("dojox/form/uploader/FileList", ["dojo/_base/fx", "dojo/dom-style", "dojo/dom-class", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dijit/_base/manager", "dojox/form/uploader/_Base", "dojo/text!../resources/UploaderFileList.html"], function (fx, domStyle, domClass, declare, lang, arrayUtil, manager, Base, template) {
    return declare("dojox.form.uploader.FileList", Base, {uploaderId:"", uploader:null, headerIndex:"#", headerType:"Type", headerFilename:"File Name", headerFilesize:"Size", _upCheckCnt:0, rowAmt:0, templateString:template, postCreate:function () {
        this.setUploader();
        this.hideProgress();
    }, reset:function () {
        for (var i = 0; i < this.rowAmt; i++) {
            this.listNode.deleteRow(0);
        }
        this.rowAmt = 0;
    }, setUploader:function () {
        if (!this.uploaderId && !this.uploader) {
            console.warn("uploaderId not passed to UploaderFileList");
        } else {
            if (this.uploaderId && !this.uploader) {
                this.uploader = manager.byId(this.uploaderId);
            } else {
                if (this._upCheckCnt > 4) {
                    console.warn("uploader not found for ID ", this.uploaderId);
                    return;
                }
            }
        }
        if (this.uploader) {
            this.connect(this.uploader, "onChange", "_onUploaderChange");
            this.connect(this.uploader, "reset", "reset");
            this.connect(this.uploader, "onBegin", function () {
                this.showProgress(true);
            });
            this.connect(this.uploader, "onProgress", "_progress");
            this.connect(this.uploader, "onComplete", function () {
                setTimeout(lang.hitch(this, function () {
                    this.hideProgress(true);
                }), 1250);
            });
            if (!(this._fileSizeAvail = {"html5":1, "flash":1}[this.uploader.uploadType])) {
                this.sizeHeader.style.display = "none";
            }
        } else {
            this._upCheckCnt++;
            setTimeout(lang.hitch(this, "setUploader"), 250);
        }
    }, hideProgress:function (animate) {
        var o = animate ? {ani:true, endDisp:"none", beg:15, end:0} : {endDisp:"none", ani:false};
        this._hideShowProgress(o);
    }, showProgress:function (animate) {
        var o = animate ? {ani:true, endDisp:"block", beg:0, end:15} : {endDisp:"block", ani:false};
        this._hideShowProgress(o);
    }, _progress:function (customEvent) {
        this.percentTextNode.innerHTML = customEvent.percent;
        domStyle.set(this.percentBarNode, "width", customEvent.percent);
    }, _hideShowProgress:function (o) {
        var node = this.progressNode;
        var onEnd = function () {
            domStyle.set(node, "display", o.endDisp);
        };
        if (o.ani) {
            domStyle.set(node, "display", "block");
            fx.animateProperty({node:node, properties:{height:{start:o.beg, end:o.end, units:"px"}}, onEnd:onEnd}).play();
        } else {
            onEnd();
        }
    }, _onUploaderChange:function (fileArray) {
        this.reset();
        arrayUtil.forEach(fileArray, function (f, i) {
            this._addRow(i + 1, this.getFileType(f.name), f.name, f.size);
        }, this);
    }, _addRow:function (index, type, name, size) {
        var c, r = this.listNode.insertRow(-1);
        c = r.insertCell(-1);
        domClass.add(c, "dojoxUploaderIndex");
        c.innerHTML = index;
        c = r.insertCell(-1);
        domClass.add(c, "dojoxUploaderIcon");
        c.innerHTML = type;
        c = r.insertCell(-1);
        domClass.add(c, "dojoxUploaderFileName");
        c.innerHTML = name;
        if (this._fileSizeAvail) {
            c = r.insertCell(-1);
            domClass.add(c, "dojoxUploaderSize");
            c.innerHTML = this.convertBytes(size).value;
        }
        this.rowAmt++;
    }});
});

