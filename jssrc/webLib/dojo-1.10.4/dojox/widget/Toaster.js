//>>built

define("dojox/widget/Toaster", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/connect", "dojo/_base/fx", "dojo/dom-style", "dojo/dom-class", "dojo/dom-geometry", "dijit/registry", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/BackgroundIframe", "dojo/fx", "dojo/has", "dojo/_base/window", "dojo/window"], function (declare, lang, connect, baseFx, domStyle, domClass, domGeometry, registry, WidgetBase, Templated, BackgroundIframe, coreFx, has, baseWindow, window) {
    lang.getObject("dojox.widget", true);
    var capitalize = function (w) {
        return w.substring(0, 1).toUpperCase() + w.substring(1);
    };
    return declare("dojox.widget.Toaster", [WidgetBase, Templated], {templateString:"<div class=\"dijitToasterClip\" dojoAttachPoint=\"clipNode\"><div class=\"dijitToasterContainer\" dojoAttachPoint=\"containerNode\" dojoAttachEvent=\"onclick:onSelect\"><div class=\"dijitToasterContent\" dojoAttachPoint=\"contentNode\"></div></div></div>", messageTopic:"", messageTypes:{MESSAGE:"message", WARNING:"warning", ERROR:"error", FATAL:"fatal"}, defaultType:"message", positionDirection:"br-up", positionDirectionTypes:["br-up", "br-left", "bl-up", "bl-right", "tr-down", "tr-left", "tl-down", "tl-right"], duration:2000, slideDuration:500, separator:"<hr></hr>", postCreate:function () {
        this.inherited(arguments);
        this.hide();
        baseWindow.body().appendChild(this.domNode);
        if (this.messageTopic) {
            connect.subscribe(this.messageTopic, this, "_handleMessage");
        }
    }, _handleMessage:function (message) {
        if (lang.isString(message)) {
            this.setContent(message);
        } else {
            this.setContent(message.message, message.type, message.duration);
        }
    }, setContent:function (message, messageType, duration) {
        duration = duration || this.duration;
        if (this.slideAnim) {
            if (this.slideAnim.status() != "playing") {
                this.slideAnim.stop();
            }
            if (this.slideAnim.status() == "playing" || (this.fadeAnim && this.fadeAnim.status() == "playing")) {
                setTimeout(lang.hitch(this, function () {
                    this.setContent(message, messageType, duration);
                }), 50);
                return;
            }
        }
        for (var type in this.messageTypes) {
            domClass.remove(this.containerNode, "dijitToaster" + capitalize(this.messageTypes[type]));
        }
        domStyle.set(this.containerNode, "opacity", 1);
        this._setContent(message);
        domClass.add(this.containerNode, "dijitToaster" + capitalize(messageType || this.defaultType));
        this.show();
        var nodeSize = domGeometry.getMarginBox(this.containerNode);
        this._cancelHideTimer();
        if (this.isVisible) {
            this._placeClip();
            if (!this._stickyMessage) {
                this._setHideTimer(duration);
            }
        } else {
            var style = this.containerNode.style;
            var pd = this.positionDirection;
            if (pd.indexOf("-up") >= 0) {
                style.left = 0 + "px";
                style.top = nodeSize.h + 10 + "px";
            } else {
                if (pd.indexOf("-left") >= 0) {
                    style.left = nodeSize.w + 10 + "px";
                    style.top = 0 + "px";
                } else {
                    if (pd.indexOf("-right") >= 0) {
                        style.left = 0 - nodeSize.w - 10 + "px";
                        style.top = 0 + "px";
                    } else {
                        if (pd.indexOf("-down") >= 0) {
                            style.left = 0 + "px";
                            style.top = 0 - nodeSize.h - 10 + "px";
                        } else {
                            throw new Error(this.id + ".positionDirection is invalid: " + pd);
                        }
                    }
                }
            }
            this.slideAnim = coreFx.slideTo({node:this.containerNode, top:0, left:0, duration:this.slideDuration});
            this.connect(this.slideAnim, "onEnd", function (nodes, anim) {
                this.fadeAnim = baseFx.fadeOut({node:this.containerNode, duration:1000});
                this.connect(this.fadeAnim, "onEnd", function (evt) {
                    this.isVisible = false;
                    this.hide();
                });
                this._setHideTimer(duration);
                this.connect(this, "onSelect", function (evt) {
                    this._cancelHideTimer();
                    this._stickyMessage = false;
                    this.fadeAnim.play();
                });
                this.isVisible = true;
            });
            this.slideAnim.play();
        }
    }, _setContent:function (message) {
        if (lang.isFunction(message)) {
            message(this);
            return;
        }
        if (message && this.isVisible) {
            message = this.contentNode.innerHTML + this.separator + message;
        }
        this.contentNode.innerHTML = message;
    }, _cancelHideTimer:function () {
        if (this._hideTimer) {
            clearTimeout(this._hideTimer);
            this._hideTimer = null;
        }
    }, _setHideTimer:function (duration) {
        this._cancelHideTimer();
        if (duration > 0) {
            this._cancelHideTimer();
            this._hideTimer = setTimeout(lang.hitch(this, function (evt) {
                if (this.bgIframe && this.bgIframe.iframe) {
                    this.bgIframe.iframe.style.display = "none";
                }
                this._hideTimer = null;
                this._stickyMessage = false;
                this.fadeAnim.play();
            }), duration);
        } else {
            this._stickyMessage = true;
        }
    }, _placeClip:function () {
        var view = window.getBox();
        var nodeSize = domGeometry.getMarginBox(this.containerNode);
        var style = this.clipNode.style;
        style.height = nodeSize.h + "px";
        style.width = nodeSize.w + "px";
        var pd = this.positionDirection;
        if (pd.match(/^t/)) {
            style.top = view.t + "px";
        } else {
            if (pd.match(/^b/)) {
                style.top = (view.h - nodeSize.h - 2 + view.t) + "px";
            }
        }
        if (pd.match(/^[tb]r-/)) {
            style.left = (view.w - nodeSize.w - 1 - view.l) + "px";
        } else {
            if (pd.match(/^[tb]l-/)) {
                style.left = 0 + "px";
            } else {
                if (pd.match(/^[tb]c-/)) {
                    style.left = Math.round((view.w - nodeSize.w - 1 - view.l) / 2) + "px";
                }
            }
        }
        style.clip = "rect(0px, " + nodeSize.w + "px, " + nodeSize.h + "px, 0px)";
        if (has("ie")) {
            if (!this.bgIframe) {
                if (!this.clipNode.id) {
                    this.clipNode.id = registry.getUniqueId("dojox_widget_Toaster_clipNode");
                }
                this.bgIframe = new BackgroundIframe(this.clipNode);
            }
            var iframe = this.bgIframe.iframe;
            if (iframe) {
                iframe.style.display = "block";
            }
        }
    }, onSelect:function (e) {
    }, show:function () {
        domStyle.set(this.domNode, "display", "block");
        this._placeClip();
        if (!this._scrollConnected) {
            this._scrollConnected = connect.connect(window, "onscroll", this, this._placeClip);
        }
    }, hide:function () {
        domStyle.set(this.domNode, "display", "none");
        if (this._scrollConnected) {
            connect.disconnect(this._scrollConnected);
            this._scrollConnected = false;
        }
        domStyle.set(this.containerNode, "opacity", 1);
    }});
});

