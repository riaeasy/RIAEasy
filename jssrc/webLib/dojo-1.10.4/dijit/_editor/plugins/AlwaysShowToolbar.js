//>>built

define("dijit/_editor/plugins/AlwaysShowToolbar", ["dojo/_base/declare", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/_base/lang", "dojo/on", "dojo/sniff", "dojo/_base/window", "../_Plugin"], function (declare, domClass, domConstruct, domGeometry, lang, on, has, win, _Plugin) {
    return declare("dijit._editor.plugins.AlwaysShowToolbar", _Plugin, {_handleScroll:true, setEditor:function (e) {
        if (!e.iframe) {
            console.log("Port AlwaysShowToolbar plugin to work with Editor without iframe");
            return;
        }
        this.editor = e;
        e.onLoadDeferred.then(lang.hitch(this, this.enable));
    }, enable:function (d) {
        this._updateHeight();
        this.own(on(window, "scroll", lang.hitch(this, "globalOnScrollHandler")), this.editor.on("NormalizedDisplayChanged", lang.hitch(this, "_updateHeight")));
        return d;
    }, _updateHeight:function () {
        var e = this.editor;
        if (!e.isLoaded) {
            return;
        }
        if (e.height) {
            return;
        }
        var height = domGeometry.getMarginSize(e.editNode).h;
        if (has("opera")) {
            height = e.editNode.scrollHeight;
        }
        if (!height) {
            height = domGeometry.getMarginSize(e.document.body).h;
        }
        if (this._fixEnabled) {
            height += domGeometry.getMarginSize(this.editor.header).h;
        }
        if (height == 0) {
            console.debug("Can not figure out the height of the editing area!");
            return;
        }
        if (has("ie") <= 7 && this.editor.minHeight) {
            var min = parseInt(this.editor.minHeight);
            if (height < min) {
                height = min;
            }
        }
        if (height != this._lastHeight) {
            this._lastHeight = height;
            domGeometry.setMarginBox(e.iframe, {h:this._lastHeight});
        }
    }, _lastHeight:0, globalOnScrollHandler:function () {
        var isIE6 = has("ie") < 7;
        if (!this._handleScroll) {
            return;
        }
        var tdn = this.editor.header;
        if (!this._scrollSetUp) {
            this._scrollSetUp = true;
            this._scrollThreshold = domGeometry.position(tdn, true).y;
        }
        var scrollPos = domGeometry.docScroll(this.editor.ownerDocument).y;
        var s = tdn.style;
        if (scrollPos > this._scrollThreshold && scrollPos < this._scrollThreshold + this._lastHeight) {
            if (!this._fixEnabled) {
                var tdnbox = domGeometry.getMarginSize(tdn);
                this.editor.iframe.style.marginTop = tdnbox.h + "px";
                if (isIE6) {
                    s.left = domGeometry.position(tdn).x;
                    if (tdn.previousSibling) {
                        this._IEOriginalPos = ["after", tdn.previousSibling];
                    } else {
                        if (tdn.nextSibling) {
                            this._IEOriginalPos = ["before", tdn.nextSibling];
                        } else {
                            this._IEOriginalPos = ["last", tdn.parentNode];
                        }
                    }
                    this.editor.ownerDocumentBody.appendChild(tdn);
                    domClass.add(tdn, "dijitIEFixedToolbar");
                } else {
                    s.position = "fixed";
                    s.top = "0px";
                }
                domGeometry.setMarginBox(tdn, {w:tdnbox.w});
                s.zIndex = 2000;
                this._fixEnabled = true;
            }
            var eHeight = (this.height) ? parseInt(this.editor.height) : this.editor._lastHeight;
            s.display = (scrollPos > this._scrollThreshold + eHeight) ? "none" : "";
        } else {
            if (this._fixEnabled) {
                this.editor.iframe.style.marginTop = "";
                s.position = "";
                s.top = "";
                s.zIndex = "";
                s.display = "";
                if (isIE6) {
                    s.left = "";
                    domClass.remove(tdn, "dijitIEFixedToolbar");
                    if (this._IEOriginalPos) {
                        domConstruct.place(tdn, this._IEOriginalPos[1], this._IEOriginalPos[0]);
                        this._IEOriginalPos = null;
                    } else {
                        domConstruct.place(tdn, this.editor.iframe, "before");
                    }
                }
                s.width = "";
                this._fixEnabled = false;
            }
        }
    }, destroy:function () {
        this._IEOriginalPos = null;
        this._handleScroll = false;
        this.inherited(arguments);
        if (has("ie") < 7) {
            domClass.remove(this.editor.header, "dijitIEFixedToolbar");
        }
    }});
});

