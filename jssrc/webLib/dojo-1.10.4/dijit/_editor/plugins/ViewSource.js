//>>built

define("dijit/_editor/plugins/ViewSource", ["dojo/_base/array", "dojo/aspect", "dojo/_base/declare", "dojo/dom-attr", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/i18n", "dojo/keys", "dojo/_base/lang", "dojo/on", "dojo/sniff", "dojo/window", "../../focus", "../_Plugin", "../../form/ToggleButton", "../..", "../../registry", "dojo/i18n!../nls/commands"], function (array, aspect, declare, domAttr, domConstruct, domGeometry, domStyle, i18n, keys, lang, on, has, winUtils, focus, _Plugin, ToggleButton, dijit, registry) {
    var ViewSource = declare("dijit._editor.plugins.ViewSource", _Plugin, {stripScripts:true, stripComments:true, stripIFrames:true, readOnly:false, _fsPlugin:null, toggle:function () {
        if (has("webkit")) {
            this._vsFocused = true;
        }
        this.button.set("checked", !this.button.get("checked"));
    }, _initButton:function () {
        var strings = i18n.getLocalization("dijit._editor", "commands"), editor = this.editor;
        this.button = new ToggleButton({label:strings["viewSource"], ownerDocument:editor.ownerDocument, dir:editor.dir, lang:editor.lang, showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "ViewSource", tabIndex:"-1", onChange:lang.hitch(this, "_showSource")});
        if (has("ie") == 7) {
            this._ieFixNode = domConstruct.create("div", {style:{opacity:"0", zIndex:"-1000", position:"absolute", top:"-1000px"}}, editor.ownerDocumentBody);
        }
        this.button.set("readOnly", false);
    }, setEditor:function (editor) {
        this.editor = editor;
        this._initButton();
        this.editor.addKeyHandler(keys.F12, true, true, lang.hitch(this, function (e) {
            this.button.focus();
            this.toggle();
            e.stopPropagation();
            e.preventDefault();
            setTimeout(lang.hitch(this, function () {
                if (this.editor.focused) {
                    this.editor.focus();
                }
            }), 100);
        }));
    }, _showSource:function (source) {
        var ed = this.editor;
        var edPlugins = ed._plugins;
        var html;
        this._sourceShown = source;
        var self = this;
        try {
            if (!this.sourceArea) {
                this._createSourceView();
            }
            if (source) {
                ed._sourceQueryCommandEnabled = ed.queryCommandEnabled;
                ed.queryCommandEnabled = function (cmd) {
                    return cmd.toLowerCase() === "viewsource";
                };
                this.editor.onDisplayChanged();
                html = ed.get("value");
                html = this._filter(html);
                ed.set("value", html);
                array.forEach(edPlugins, function (p) {
                    if (p && !(p instanceof ViewSource) && p.isInstanceOf(_Plugin)) {
                        p.set("disabled", true);
                    }
                });
                if (this._fsPlugin) {
                    this._fsPlugin._getAltViewNode = function () {
                        return self.sourceArea;
                    };
                }
                this.sourceArea.value = html;
                this.sourceArea.style.height = ed.iframe.style.height;
                this.sourceArea.style.width = ed.iframe.style.width;
                domStyle.set(ed.iframe, "display", "none");
                domStyle.set(this.sourceArea, {display:"block"});
                var resizer = function () {
                    var vp = winUtils.getBox(ed.ownerDocument);
                    if ("_prevW" in this && "_prevH" in this) {
                        if (vp.w === this._prevW && vp.h === this._prevH) {
                            return;
                        } else {
                            this._prevW = vp.w;
                            this._prevH = vp.h;
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
                        this._resize();
                    }), 10);
                };
                this._resizeHandle = on(window, "resize", lang.hitch(this, resizer));
                setTimeout(lang.hitch(this, this._resize), 100);
                this.editor.onNormalizedDisplayChanged();
                this.editor.__oldGetValue = this.editor.getValue;
                this.editor.getValue = lang.hitch(this, function () {
                    var txt = this.sourceArea.value;
                    txt = this._filter(txt);
                    return txt;
                });
                this._setListener = aspect.after(this.editor, "setValue", lang.hitch(this, function (htmlTxt) {
                    htmlTxt = htmlTxt || "";
                    htmlTxt = this._filter(htmlTxt);
                    this.sourceArea.value = htmlTxt;
                }), true);
            } else {
                if (!ed._sourceQueryCommandEnabled) {
                    return;
                }
                this._setListener.remove();
                delete this._setListener;
                this._resizeHandle.remove();
                delete this._resizeHandle;
                if (this.editor.__oldGetValue) {
                    this.editor.getValue = this.editor.__oldGetValue;
                    delete this.editor.__oldGetValue;
                }
                ed.queryCommandEnabled = ed._sourceQueryCommandEnabled;
                if (!this._readOnly) {
                    html = this.sourceArea.value;
                    html = this._filter(html);
                    ed.beginEditing();
                    ed.set("value", html);
                    ed.endEditing();
                }
                array.forEach(edPlugins, function (p) {
                    if (p && p.isInstanceOf(_Plugin)) {
                        p.set("disabled", false);
                    }
                });
                domStyle.set(this.sourceArea, "display", "none");
                domStyle.set(ed.iframe, "display", "block");
                delete ed._sourceQueryCommandEnabled;
                this.editor.onDisplayChanged();
            }
            setTimeout(lang.hitch(this, function () {
                var parent = ed.domNode.parentNode;
                if (parent) {
                    var container = registry.getEnclosingWidget(parent);
                    if (container && container.resize) {
                        container.resize();
                    }
                }
                ed.resize();
            }), 300);
        }
        catch (e) {
            console.log(e);
        }
    }, updateState:function () {
        this.button.set("disabled", this.get("disabled"));
    }, _resize:function () {
        var ed = this.editor;
        var tbH = ed.getHeaderHeight();
        var fH = ed.getFooterHeight();
        var eb = domGeometry.position(ed.domNode);
        var containerPadding = domGeometry.getPadBorderExtents(ed.iframe.parentNode);
        var containerMargin = domGeometry.getMarginExtents(ed.iframe.parentNode);
        var extents = domGeometry.getPadBorderExtents(ed.domNode);
        var edb = {w:eb.w - extents.w, h:eb.h - (tbH + extents.h + fH)};
        if (this._fsPlugin && this._fsPlugin.isFullscreen) {
            var vp = winUtils.getBox(ed.ownerDocument);
            edb.w = (vp.w - extents.w);
            edb.h = (vp.h - (tbH + extents.h + fH));
        }
        if (has("ie")) {
            edb.h -= 2;
        }
        if (this._ieFixNode) {
            var _ie7zoom = -this._ieFixNode.offsetTop / 1000;
            edb.w = Math.floor((edb.w + 0.9) / _ie7zoom);
            edb.h = Math.floor((edb.h + 0.9) / _ie7zoom);
        }
        domGeometry.setMarginBox(this.sourceArea, {w:edb.w - (containerPadding.w + containerMargin.w), h:edb.h - (containerPadding.h + containerMargin.h)});
        domGeometry.setMarginBox(ed.iframe.parentNode, {h:edb.h});
    }, _createSourceView:function () {
        var ed = this.editor;
        var edPlugins = ed._plugins;
        this.sourceArea = domConstruct.create("textarea");
        if (this.readOnly) {
            domAttr.set(this.sourceArea, "readOnly", true);
            this._readOnly = true;
        }
        domStyle.set(this.sourceArea, {padding:"0px", margin:"0px", borderWidth:"0px", borderStyle:"none"});
        domAttr.set(this.sourceArea, "aria-label", this.editor.id);
        domConstruct.place(this.sourceArea, ed.iframe, "before");
        if (has("ie") && ed.iframe.parentNode.lastChild !== ed.iframe) {
            domStyle.set(ed.iframe.parentNode.lastChild, {width:"0px", height:"0px", padding:"0px", margin:"0px", borderWidth:"0px", borderStyle:"none"});
        }
        ed._viewsource_oldFocus = ed.focus;
        var self = this;
        ed.focus = function () {
            if (self._sourceShown) {
                self.setSourceAreaCaret();
            } else {
                try {
                    if (this._vsFocused) {
                        delete this._vsFocused;
                        focus.focus(ed.editNode);
                    } else {
                        ed._viewsource_oldFocus();
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }
        };
        var i, p;
        for (i = 0; i < edPlugins.length; i++) {
            p = edPlugins[i];
            if (p && (p.declaredClass === "dijit._editor.plugins.FullScreen" || p.declaredClass === (dijit._scopeName + "._editor.plugins.FullScreen"))) {
                this._fsPlugin = p;
                break;
            }
        }
        if (this._fsPlugin) {
            this._fsPlugin._viewsource_getAltViewNode = this._fsPlugin._getAltViewNode;
            this._fsPlugin._getAltViewNode = function () {
                return self._sourceShown ? self.sourceArea : this._viewsource_getAltViewNode();
            };
        }
        this.own(on(this.sourceArea, "keydown", lang.hitch(this, function (e) {
            if (this._sourceShown && e.keyCode == keys.F12 && e.ctrlKey && e.shiftKey) {
                this.button.focus();
                this.button.set("checked", false);
                setTimeout(lang.hitch(this, function () {
                    ed.focus();
                }), 100);
                e.stopPropagation();
                e.preventDefault();
            }
        })));
    }, _stripScripts:function (html) {
        if (html) {
            html = html.replace(/<\s*script[^>]*>((.|\s)*?)<\\?\/\s*script\s*>/ig, "");
            html = html.replace(/<\s*script\b([^<>]|\s)*>?/ig, "");
            html = html.replace(/<[^>]*=(\s|)*[("|')]javascript:[^$1][(\s|.)]*[$1][^>]*>/ig, "");
        }
        return html;
    }, _stripComments:function (html) {
        if (html) {
            html = html.replace(/<!--(.|\s){1,}?-->/g, "");
        }
        return html;
    }, _stripIFrames:function (html) {
        if (html) {
            html = html.replace(/<\s*iframe[^>]*>((.|\s)*?)<\\?\/\s*iframe\s*>/ig, "");
        }
        return html;
    }, _filter:function (html) {
        if (html) {
            if (this.stripScripts) {
                html = this._stripScripts(html);
            }
            if (this.stripComments) {
                html = this._stripComments(html);
            }
            if (this.stripIFrames) {
                html = this._stripIFrames(html);
            }
        }
        return html;
    }, setSourceAreaCaret:function () {
        var elem = this.sourceArea;
        focus.focus(elem);
        if (this._sourceShown && !this.readOnly) {
            if (elem.setSelectionRange) {
                elem.setSelectionRange(0, 0);
            } else {
                if (this.sourceArea.createTextRange) {
                    var range = elem.createTextRange();
                    range.collapse(true);
                    range.moveStart("character", -99999);
                    range.moveStart("character", 0);
                    range.moveEnd("character", 0);
                    range.select();
                }
            }
        }
    }, destroy:function () {
        if (this._ieFixNode) {
            domConstruct.destroy(this._ieFixNode);
        }
        if (this._resizer) {
            clearTimeout(this._resizer);
            delete this._resizer;
        }
        if (this._resizeHandle) {
            this._resizeHandle.remove();
            delete this._resizeHandle;
        }
        if (this._setListener) {
            this._setListener.remove();
            delete this._setListener;
        }
        this.inherited(arguments);
    }});
    _Plugin.registry["viewSource"] = _Plugin.registry["viewsource"] = function (args) {
        return new ViewSource({readOnly:("readOnly" in args) ? args.readOnly : false, stripComments:("stripComments" in args) ? args.stripComments : true, stripScripts:("stripScripts" in args) ? args.stripScripts : true, stripIFrames:("stripIFrames" in args) ? args.stripIFrames : true});
    };
    return ViewSource;
});

