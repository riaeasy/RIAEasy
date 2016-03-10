//>>built

define("dijit/_editor/plugins/FullScreen", ["dojo/aspect", "dojo/_base/declare", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style", "dojo/i18n", "dojo/keys", "dojo/_base/lang", "dojo/on", "dojo/sniff", "dojo/_base/window", "dojo/window", "../../focus", "../_Plugin", "../../form/ToggleButton", "../../registry", "dojo/i18n!../nls/commands"], function (aspect, declare, domClass, domGeometry, domStyle, i18n, keys, lang, on, has, win, winUtils, focus, _Plugin, ToggleButton, registry) {
    var FullScreen = declare("dijit._editor.plugins.FullScreen", _Plugin, {zIndex:500, _origState:null, _origiFrameState:null, _resizeHandle:null, isFullscreen:false, toggle:function () {
        this.button.set("checked", !this.button.get("checked"));
    }, _initButton:function () {
        var strings = i18n.getLocalization("dijit._editor", "commands"), editor = this.editor;
        this.button = new ToggleButton({label:strings["fullScreen"], ownerDocument:editor.ownerDocument, dir:editor.dir, lang:editor.lang, showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "FullScreen", tabIndex:"-1", onChange:lang.hitch(this, "_setFullScreen")});
    }, setEditor:function (editor) {
        this.editor = editor;
        this._initButton();
        this.editor.addKeyHandler(keys.F11, true, true, lang.hitch(this, function (e) {
            this.toggle();
            e.stopPropagation();
            e.preventDefault();
            this.editor.defer("focus", 250);
            return true;
        }));
        this.own(on(this.editor.domNode, "keydown", lang.hitch(this, "_containFocus")));
    }, _containFocus:function (e) {
        if (this.isFullscreen) {
            var ed = this.editor;
            if (!ed.isTabIndent && ed._fullscreen_oldOnKeyDown && e.keyCode === keys.TAB) {
                var f = focus.curNode;
                var avn = this._getAltViewNode();
                if (f == ed.iframe || (avn && f === avn)) {
                    setTimeout(lang.hitch(this, function () {
                        ed.toolbar.focus();
                    }), 10);
                } else {
                    if (avn && domStyle.get(ed.iframe, "display") === "none") {
                        setTimeout(lang.hitch(this, function () {
                            focus.focus(avn);
                        }), 10);
                    } else {
                        setTimeout(lang.hitch(this, function () {
                            ed.focus();
                        }), 10);
                    }
                }
                event.stopPropagation();
                event.preventDefault();
            } else {
                if (ed._fullscreen_oldOnKeyDown) {
                    ed._fullscreen_oldOnKeyDown(e);
                }
            }
        }
    }, _resizeEditor:function () {
        var vp = winUtils.getBox(this.editor.ownerDocument);
        domGeometry.setMarginBox(this.editor.domNode, {w:vp.w, h:vp.h});
        var hHeight = this.editor.getHeaderHeight();
        var fHeight = this.editor.getFooterHeight();
        var extents = domGeometry.getPadBorderExtents(this.editor.domNode);
        var fcpExtents = domGeometry.getPadBorderExtents(this.editor.iframe.parentNode);
        var fcmExtents = domGeometry.getMarginExtents(this.editor.iframe.parentNode);
        var cHeight = vp.h - (hHeight + extents.h + fHeight);
        domGeometry.setMarginBox(this.editor.iframe.parentNode, {h:cHeight, w:vp.w});
        domGeometry.setMarginBox(this.editor.iframe, {h:cHeight - (fcpExtents.h + fcmExtents.h)});
    }, _getAltViewNode:function () {
    }, _setFullScreen:function (full) {
        var ed = this.editor;
        var body = ed.ownerDocumentBody;
        var editorParent = ed.domNode.parentNode;
        var vp = winUtils.getBox(ed.ownerDocument);
        this.isFullscreen = full;
        if (full) {
            while (editorParent && editorParent !== body) {
                domClass.add(editorParent, "dijitForceStatic");
                editorParent = editorParent.parentNode;
            }
            this._editorResizeHolder = this.editor.resize;
            ed.resize = function () {
            };
            ed._fullscreen_oldOnKeyDown = ed.onKeyDown;
            ed.onKeyDown = lang.hitch(this, this._containFocus);
            this._origState = {};
            this._origiFrameState = {};
            var domNode = ed.domNode, rawStyle = domNode && domNode.style || {};
            this._origState = {width:rawStyle.width || "", height:rawStyle.height || "", top:domStyle.get(domNode, "top") || "", left:domStyle.get(domNode, "left") || "", position:domStyle.get(domNode, "position") || "static", marginBox:domGeometry.getMarginBox(ed.domNode)};
            var iframe = ed.iframe, iframeStyle = iframe && iframe.style || {};
            var bc = domStyle.get(ed.iframe, "backgroundColor");
            this._origiFrameState = {backgroundColor:bc || "transparent", width:iframeStyle.width || "auto", height:iframeStyle.height || "auto", zIndex:iframeStyle.zIndex || ""};
            domStyle.set(ed.domNode, {position:"absolute", top:"0px", left:"0px", zIndex:this.zIndex, width:vp.w + "px", height:vp.h + "px"});
            domStyle.set(ed.iframe, {height:"100%", width:"100%", zIndex:this.zIndex, backgroundColor:bc !== "transparent" && bc !== "rgba(0, 0, 0, 0)" ? bc : "white"});
            domStyle.set(ed.iframe.parentNode, {height:"95%", width:"100%"});
            if (body.style && body.style.overflow) {
                this._oldOverflow = domStyle.get(body, "overflow");
            } else {
                this._oldOverflow = "";
            }
            if (has("ie") && !has("quirks")) {
                if (body.parentNode && body.parentNode.style && body.parentNode.style.overflow) {
                    this._oldBodyParentOverflow = body.parentNode.style.overflow;
                } else {
                    try {
                        this._oldBodyParentOverflow = domStyle.get(body.parentNode, "overflow");
                    }
                    catch (e) {
                        this._oldBodyParentOverflow = "scroll";
                    }
                }
                domStyle.set(body.parentNode, "overflow", "hidden");
            }
            domStyle.set(body, "overflow", "hidden");
            var resizer = function () {
                var vp = winUtils.getBox(ed.ownerDocument);
                if ("_prevW" in this && "_prevH" in this) {
                    if (vp.w === this._prevW && vp.h === this._prevH) {
                        return;
                    }
                } else {
                    this._prevW = vp.w;
                    this._prevH = vp.h;
                }
                if (this._resizer) {
                    clearTimeout(this._resizer);
                    delete this._resizer;
                }
                this._resizer = setTimeout(lang.hitch(this, function () {
                    delete this._resizer;
                    this._resizeEditor();
                }), 10);
            };
            this._resizeHandle = on(window, "resize", lang.hitch(this, resizer));
            this._resizeHandle2 = aspect.after(ed, "onResize", lang.hitch(this, function () {
                if (this._resizer) {
                    clearTimeout(this._resizer);
                    delete this._resizer;
                }
                this._resizer = setTimeout(lang.hitch(this, function () {
                    delete this._resizer;
                    this._resizeEditor();
                }), 10);
            }));
            this._resizeEditor();
            var dn = this.editor.toolbar.domNode;
            setTimeout(function () {
                winUtils.scrollIntoView(dn);
            }, 250);
        } else {
            if (this._resizeHandle) {
                this._resizeHandle.remove();
                this._resizeHandle = null;
            }
            if (this._resizeHandle2) {
                this._resizeHandle2.remove();
                this._resizeHandle2 = null;
            }
            if (this._rst) {
                clearTimeout(this._rst);
                this._rst = null;
            }
            while (editorParent && editorParent !== body) {
                domClass.remove(editorParent, "dijitForceStatic");
                editorParent = editorParent.parentNode;
            }
            if (this._editorResizeHolder) {
                this.editor.resize = this._editorResizeHolder;
            }
            if (!this._origState && !this._origiFrameState) {
                return;
            }
            if (ed._fullscreen_oldOnKeyDown) {
                ed.onKeyDown = ed._fullscreen_oldOnKeyDown;
                delete ed._fullscreen_oldOnKeyDown;
            }
            var self = this;
            setTimeout(function () {
                var mb = self._origState.marginBox;
                var oh = self._origState.height;
                if (has("ie") && !has("quirks")) {
                    body.parentNode.style.overflow = self._oldBodyParentOverflow;
                    delete self._oldBodyParentOverflow;
                }
                domStyle.set(body, "overflow", self._oldOverflow);
                delete self._oldOverflow;
                domStyle.set(ed.domNode, self._origState);
                domStyle.set(ed.iframe.parentNode, {height:"", width:""});
                domStyle.set(ed.iframe, self._origiFrameState);
                delete self._origState;
                delete self._origiFrameState;
                var pWidget = registry.getEnclosingWidget(ed.domNode.parentNode);
                if (pWidget && pWidget.resize) {
                    pWidget.resize();
                } else {
                    if (!oh || oh.indexOf("%") < 0) {
                        setTimeout(lang.hitch(this, function () {
                            ed.resize({h:mb.h});
                        }), 0);
                    }
                }
                winUtils.scrollIntoView(self.editor.toolbar.domNode);
            }, 100);
        }
    }, updateState:function () {
        this.button.set("disabled", this.get("disabled"));
    }, destroy:function () {
        if (this._resizeHandle) {
            this._resizeHandle.remove();
            this._resizeHandle = null;
        }
        if (this._resizeHandle2) {
            this._resizeHandle2.remove();
            this._resizeHandle2 = null;
        }
        if (this._resizer) {
            clearTimeout(this._resizer);
            this._resizer = null;
        }
        this.inherited(arguments);
    }});
    _Plugin.registry["fullScreen"] = _Plugin.registry["fullscreen"] = function (args) {
        return new FullScreen({zIndex:("zIndex" in args) ? args.zIndex : 500});
    };
    return FullScreen;
});

