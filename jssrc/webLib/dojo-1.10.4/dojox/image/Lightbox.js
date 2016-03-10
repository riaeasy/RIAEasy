//>>built

require({cache:{"url:dojox/image/resources/Lightbox.html":"<div class=\"dojoxLightbox\" dojoAttachPoint=\"containerNode\">\n\t<div style=\"position:relative\">\n\t\t<div dojoAttachPoint=\"imageContainer\" class=\"dojoxLightboxContainer\" dojoAttachEvent=\"onclick: _onImageClick\">\n\t\t\t<img dojoAttachPoint=\"imgNode\" src=\"${imgUrl}\" class=\"${imageClass}\" alt=\"${title}\">\n\t\t\t<div class=\"dojoxLightboxFooter\" dojoAttachPoint=\"titleNode\">\n\t\t\t\t<div class=\"dijitInline LightboxClose\" dojoAttachPoint=\"closeButtonNode\"></div>\n\t\t\t\t<div class=\"dijitInline LightboxNext\" dojoAttachPoint=\"nextButtonNode\"></div>\t\n\t\t\t\t<div class=\"dijitInline LightboxPrev\" dojoAttachPoint=\"prevButtonNode\"></div>\n\t\t\t\t<div class=\"dojoxLightboxText\" dojoAttachPoint=\"titleTextNode\"><span dojoAttachPoint=\"textNode\">${title}</span><span dojoAttachPoint=\"groupCount\" class=\"dojoxLightboxGroupText\"></span></div>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</div>"}});
define("dojox/image/Lightbox", ["dojo", "dijit", "dojox", "dojo/text!./resources/Lightbox.html", "dijit/Dialog", "dojox/fx/_base"], function (dojo, dijit, dojox, template) {
    dojo.experimental("dojox.image.Lightbox");
    dojo.getObject("image", true, dojox);
    var Lightbox = dojo.declare("dojox.image.Lightbox", dijit._Widget, {group:"", title:"", href:"", duration:500, modal:false, _allowPassthru:false, _attachedDialog:null, startup:function () {
        this.inherited(arguments);
        var tmp = dijit.byId("dojoxLightboxDialog");
        if (tmp) {
            this._attachedDialog = tmp;
        } else {
            this._attachedDialog = new dojox.image.LightboxDialog({id:"dojoxLightboxDialog"});
            this._attachedDialog.startup();
        }
        if (!this.store) {
            this._addSelf();
            this.connect(this.domNode, "onclick", "_handleClick");
        }
    }, _addSelf:function () {
        this._attachedDialog.addImage({href:this.href, title:this.title}, this.group || null);
    }, _handleClick:function (e) {
        if (!this._allowPassthru) {
            e.preventDefault();
        } else {
            return;
        }
        this.show();
    }, show:function () {
        this._attachedDialog.show(this);
    }, hide:function () {
        this._attachedDialog.hide();
    }, disable:function () {
        this._allowPassthru = true;
    }, enable:function () {
        this._allowPassthru = false;
    }, onClick:function () {
    }, destroy:function () {
        this._attachedDialog.removeImage(this);
        this.inherited(arguments);
    }});
    Lightbox.LightboxDialog = dojo.declare("dojox.image.LightboxDialog", dijit.Dialog, {title:"", inGroup:null, imgUrl:dijit._Widget.prototype._blankGif, errorMessage:"Image not found.", adjust:true, modal:false, imageClass:"dojoxLightboxImage", errorImg:dojo.moduleUrl("dojox.image", "resources/images/warning.png"), templateString:template, constructor:function (args) {
        this._groups = this._groups || (args && args._groups) || {XnoGroupX:[]};
    }, startup:function () {
        this.inherited(arguments);
        this._animConnects = [];
        this.connect(this.nextButtonNode, "onclick", "_nextImage");
        this.connect(this.prevButtonNode, "onclick", "_prevImage");
        this.connect(this.closeButtonNode, "onclick", "hide");
        this._makeAnims();
        this._vp = dojo.window.getBox();
        return this;
    }, show:function (groupData) {
        var _t = this;
        this._lastGroup = groupData;
        if (!_t.open) {
            _t.inherited(arguments);
            _t._modalconnects.push(dojo.connect(dojo.global, "onscroll", this, "_position"), dojo.connect(dojo.global, "onresize", this, "_position"), dojo.connect(dojo.body(), "onkeypress", this, "_handleKey"));
            if (!groupData.modal) {
                _t._modalconnects.push(dojo.connect(dijit._underlay.domNode, "onclick", this, "onCancel"));
            }
        }
        if (this._wasStyled) {
            var tmpImg = dojo.create("img", {className:_t.imageClass}, _t.imgNode, "after");
            dojo.destroy(_t.imgNode);
            _t.imgNode = tmpImg;
            _t._makeAnims();
            _t._wasStyled = false;
        }
        dojo.style(_t.imgNode, "opacity", "0");
        dojo.style(_t.titleNode, "opacity", "0");
        var src = groupData.href;
        if ((groupData.group && groupData !== "XnoGroupX") || _t.inGroup) {
            if (!_t.inGroup) {
                _t.inGroup = _t._groups[(groupData.group)];
                dojo.forEach(_t.inGroup, function (g, i) {
                    if (g.href == groupData.href) {
                        _t._index = i;
                    }
                });
            }
            if (!_t._index) {
                _t._index = 0;
                var sr = _t.inGroup[_t._index];
                src = (sr && sr.href) || _t.errorImg;
            }
            _t.groupCount.innerHTML = " (" + (_t._index + 1) + " of " + Math.max(1, _t.inGroup.length) + ")";
            _t.prevButtonNode.style.visibility = "visible";
            _t.nextButtonNode.style.visibility = "visible";
        } else {
            _t.groupCount.innerHTML = "";
            _t.prevButtonNode.style.visibility = "hidden";
            _t.nextButtonNode.style.visibility = "hidden";
        }
        if (!groupData.leaveTitle) {
            _t.textNode.innerHTML = groupData.title;
        }
        _t._ready(src);
    }, _ready:function (src) {
        var _t = this;
        _t._imgError = dojo.connect(_t.imgNode, "error", _t, function () {
            dojo.disconnect(_t._imgError);
            _t.imgNode.src = _t.errorImg;
            _t.textNode.innerHTML = _t.errorMessage;
        });
        _t._imgConnect = dojo.connect(_t.imgNode, "load", _t, function (e) {
            _t.resizeTo({w:_t.imgNode.width, h:_t.imgNode.height, duration:_t.duration});
            dojo.disconnect(_t._imgConnect);
            if (_t._imgError) {
                dojo.disconnect(_t._imgError);
            }
        });
        _t.imgNode.src = src;
    }, _nextImage:function () {
        if (!this.inGroup) {
            return;
        }
        if (this._index + 1 < this.inGroup.length) {
            this._index++;
        } else {
            this._index = 0;
        }
        this._loadImage();
    }, _prevImage:function () {
        if (this.inGroup) {
            if (this._index == 0) {
                this._index = this.inGroup.length - 1;
            } else {
                this._index--;
            }
            this._loadImage();
        }
    }, _loadImage:function () {
        this._loadingAnim.play(1);
    }, _prepNodes:function () {
        this._imageReady = false;
        if (this.inGroup && this.inGroup[this._index]) {
            this.show({href:this.inGroup[this._index].href, title:this.inGroup[this._index].title});
        } else {
            this.show({title:this.errorMessage, href:this.errorImg});
        }
    }, _calcTitleSize:function () {
        var sizes = dojo.map(dojo.query("> *", this.titleNode).position(), function (s) {
            return s.h;
        });
        return {h:Math.max.apply(Math, sizes)};
    }, resizeTo:function (size, forceTitle) {
        var adjustSize = dojo.boxModel == "border-box" ? dojo._getBorderExtents(this.domNode).w : 0, titleSize = forceTitle || this._calcTitleSize();
        this._lastTitleSize = titleSize;
        if (this.adjust && (size.h + titleSize.h + adjustSize + 80 > this._vp.h || size.w + adjustSize + 60 > this._vp.w)) {
            this._lastSize = size;
            size = this._scaleToFit(size);
        }
        this._currentSize = size;
        var _sizeAnim = dojox.fx.sizeTo({node:this.containerNode, duration:size.duration || this.duration, width:size.w + adjustSize, height:size.h + titleSize.h + adjustSize});
        this.connect(_sizeAnim, "onEnd", "_showImage");
        _sizeAnim.play(15);
    }, _scaleToFit:function (size) {
        var ns = {}, nvp = {w:this._vp.w - 80, h:this._vp.h - 60 - this._lastTitleSize.h};
        var viewportAspect = nvp.w / nvp.h, imageAspect = size.w / size.h;
        if (imageAspect >= viewportAspect) {
            ns.h = nvp.w / imageAspect;
            ns.w = nvp.w;
        } else {
            ns.w = imageAspect * nvp.h;
            ns.h = nvp.h;
        }
        this._wasStyled = true;
        this._setImageSize(ns);
        ns.duration = size.duration;
        return ns;
    }, _setImageSize:function (size) {
        var s = this.imgNode;
        s.height = size.h;
        s.width = size.w;
    }, _size:function () {
    }, _position:function (e) {
        this._vp = dojo.window.getBox();
        this.inherited(arguments);
        if (e && e.type == "resize") {
            if (this._wasStyled) {
                this._setImageSize(this._lastSize);
                this.resizeTo(this._lastSize);
            } else {
                if (this.imgNode.height + 80 > this._vp.h || this.imgNode.width + 60 > this._vp.h) {
                    this.resizeTo({w:this.imgNode.width, h:this.imgNode.height});
                }
            }
        }
    }, _showImage:function () {
        this._showImageAnim.play(1);
    }, _showNav:function () {
        var titleSizeNow = dojo.marginBox(this.titleNode);
        if (titleSizeNow.h > this._lastTitleSize.h) {
            this.resizeTo(this._wasStyled ? this._lastSize : this._currentSize, titleSizeNow);
        } else {
            this._showNavAnim.play(1);
        }
    }, hide:function () {
        dojo.fadeOut({node:this.titleNode, duration:200, onEnd:dojo.hitch(this, function () {
            this.imgNode.src = this._blankGif;
        })}).play(5);
        this.inherited(arguments);
        this.inGroup = null;
        this._index = null;
    }, addImage:function (child, group) {
        var g = group;
        if (!child.href) {
            return;
        }
        if (g) {
            if (!this._groups[g]) {
                this._groups[g] = [];
            }
            this._groups[g].push(child);
        } else {
            this._groups["XnoGroupX"].push(child);
        }
    }, removeImage:function (child) {
        var g = child.group || "XnoGroupX";
        dojo.every(this._groups[g], function (item, i, ar) {
            if (item.href == child.href) {
                ar.splice(i, 1);
                return false;
            }
            return true;
        });
    }, removeGroup:function (group) {
        if (this._groups[group]) {
            this._groups[group] = [];
        }
    }, _handleKey:function (e) {
        if (!this.open) {
            return;
        }
        var dk = dojo.keys;
        switch (e.charOrCode) {
          case dk.ESCAPE:
            this.hide();
            break;
          case dk.DOWN_ARROW:
          case dk.RIGHT_ARROW:
          case 78:
            this._nextImage();
            break;
          case dk.UP_ARROW:
          case dk.LEFT_ARROW:
          case 80:
            this._prevImage();
            break;
        }
    }, _makeAnims:function () {
        dojo.forEach(this._animConnects, dojo.disconnect);
        this._animConnects = [];
        this._showImageAnim = dojo.fadeIn({node:this.imgNode, duration:this.duration});
        this._animConnects.push(dojo.connect(this._showImageAnim, "onEnd", this, "_showNav"));
        this._loadingAnim = dojo.fx.combine([dojo.fadeOut({node:this.imgNode, duration:175}), dojo.fadeOut({node:this.titleNode, duration:175})]);
        this._animConnects.push(dojo.connect(this._loadingAnim, "onEnd", this, "_prepNodes"));
        this._showNavAnim = dojo.fadeIn({node:this.titleNode, duration:225});
    }, onClick:function (groupData) {
    }, _onImageClick:function (e) {
        if (e && e.target == this.imgNode) {
            this.onClick(this._lastGroup);
            if (this._lastGroup.declaredClass) {
                this._lastGroup.onClick(this._lastGroup);
            }
        }
    }});
    return Lightbox;
});

