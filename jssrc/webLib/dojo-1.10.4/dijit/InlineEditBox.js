//>>built

require({cache:{"url:dijit/templates/InlineEditBox.html":"<span data-dojo-attach-point=\"editNode\" role=\"presentation\" class=\"dijitReset dijitInline dijitOffScreen\"\n\t><span data-dojo-attach-point=\"editorPlaceholder\"></span\n\t><span data-dojo-attach-point=\"buttonContainer\"\n\t\t><button data-dojo-type=\"./form/Button\" data-dojo-props=\"label: '${buttonSave}', 'class': 'saveButton'\"\n\t\t\tdata-dojo-attach-point=\"saveButton\" data-dojo-attach-event=\"onClick:save\"></button\n\t\t><button data-dojo-type=\"./form/Button\"  data-dojo-props=\"label: '${buttonCancel}', 'class': 'cancelButton'\"\n\t\t\tdata-dojo-attach-point=\"cancelButton\" data-dojo-attach-event=\"onClick:cancel\"></button\n\t></span\n></span>\n"}});
define("dijit/InlineEditBox", ["require", "dojo/_base/array", "dojo/aspect", "dojo/_base/declare", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-style", "dojo/i18n", "dojo/_base/kernel", "dojo/keys", "dojo/_base/lang", "dojo/on", "dojo/sniff", "dojo/when", "./a11yclick", "./focus", "./_Widget", "./_TemplatedMixin", "./_WidgetsInTemplateMixin", "./_Container", "./form/Button", "./form/_TextBoxMixin", "./form/TextBox", "dojo/text!./templates/InlineEditBox.html", "dojo/i18n!./nls/common"], function (require, array, aspect, declare, domAttr, domClass, domConstruct, domStyle, i18n, kernel, keys, lang, on, has, when, a11yclick, fm, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, Button, _TextBoxMixin, TextBox, template) {
    var InlineEditor = declare("dijit._InlineEditor", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {templateString:template, contextRequire:require, postMixInProperties:function () {
        this.inherited(arguments);
        this.messages = i18n.getLocalization("dijit", "common", this.lang);
        array.forEach(["buttonSave", "buttonCancel"], function (prop) {
            if (!this[prop]) {
                this[prop] = this.messages[prop];
            }
        }, this);
    }, buildRendering:function () {
        this.inherited(arguments);
        var Cls = typeof this.editor == "string" ? (lang.getObject(this.editor) || require(this.editor)) : this.editor;
        var srcStyle = this.sourceStyle, editStyle = "line-height:" + srcStyle.lineHeight + ";", destStyle = domStyle.getComputedStyle(this.domNode);
        array.forEach(["Weight", "Family", "Size", "Style"], function (prop) {
            var textStyle = srcStyle["font" + prop], wrapperStyle = destStyle["font" + prop];
            if (wrapperStyle != textStyle) {
                editStyle += "font-" + prop + ":" + srcStyle["font" + prop] + ";";
            }
        }, this);
        array.forEach(["marginTop", "marginBottom", "marginLeft", "marginRight", "position", "left", "top", "right", "bottom", "float", "clear", "display"], function (prop) {
            this.domNode.style[prop] = srcStyle[prop];
        }, this);
        var width = this.inlineEditBox.width;
        if (width == "100%") {
            editStyle += "width:100%;";
            this.domNode.style.display = "block";
        } else {
            editStyle += "width:" + (width + (Number(width) == width ? "px" : "")) + ";";
        }
        var editorParams = lang.delegate(this.inlineEditBox.editorParams, {style:editStyle, dir:this.dir, lang:this.lang, textDir:this.textDir});
        this.editWidget = new Cls(editorParams, this.editorPlaceholder);
        if (this.inlineEditBox.autoSave) {
            this.saveButton.destroy();
            this.cancelButton.destroy();
            this.saveButton = this.cancelButton = null;
            domConstruct.destroy(this.buttonContainer);
        }
    }, postCreate:function () {
        this.inherited(arguments);
        var ew = this.editWidget;
        if (this.inlineEditBox.autoSave) {
            this.own(aspect.after(ew, "onChange", lang.hitch(this, "_onChange"), true), on(ew, "keydown", lang.hitch(this, "_onKeyDown")));
        } else {
            if ("intermediateChanges" in ew) {
                ew.set("intermediateChanges", true);
                this.own(aspect.after(ew, "onChange", lang.hitch(this, "_onIntermediateChange"), true));
                this.saveButton.set("disabled", true);
            }
        }
    }, startup:function () {
        this.editWidget.startup();
        this.inherited(arguments);
    }, _onIntermediateChange:function () {
        this.saveButton.set("disabled", (this.getValue() == this._resetValue) || !this.enableSave());
    }, destroy:function () {
        this.editWidget.destroy(true);
        this.inherited(arguments);
    }, getValue:function () {
        var ew = this.editWidget;
        return String(ew.get(("displayedValue" in ew || "_getDisplayedValueAttr" in ew) ? "displayedValue" : "value"));
    }, _onKeyDown:function (e) {
        if (this.inlineEditBox.autoSave && this.inlineEditBox.editing) {
            if (e.altKey || e.ctrlKey) {
                return;
            }
            if (e.keyCode == keys.ESCAPE) {
                e.stopPropagation();
                e.preventDefault();
                this.cancel(true);
            } else {
                if (e.keyCode == keys.ENTER && e.target.tagName == "INPUT") {
                    e.stopPropagation();
                    e.preventDefault();
                    this._onChange();
                }
            }
        }
    }, _onBlur:function () {
        this.inherited(arguments);
        if (this.inlineEditBox.autoSave && this.inlineEditBox.editing) {
            if (this.getValue() == this._resetValue) {
                this.cancel(false);
            } else {
                if (this.enableSave()) {
                    this.save(false);
                }
            }
        }
    }, _onChange:function () {
        if (this.inlineEditBox.autoSave && this.inlineEditBox.editing && this.enableSave()) {
            fm.focus(this.inlineEditBox.displayNode);
        }
    }, enableSave:function () {
        return this.editWidget.isValid ? this.editWidget.isValid() : true;
    }, focus:function () {
        this.editWidget.focus();
        if (this.editWidget.focusNode) {
            fm._onFocusNode(this.editWidget.focusNode);
            if (this.editWidget.focusNode.tagName == "INPUT") {
                this.defer(function () {
                    _TextBoxMixin.selectInputText(this.editWidget.focusNode);
                });
            }
        }
    }});
    var InlineEditBox = declare("dijit.InlineEditBox" + (0 ? "_NoBidi" : ""), _Widget, {editing:false, autoSave:true, buttonSave:"", buttonCancel:"", renderAsHtml:false, editor:TextBox, editorWrapper:InlineEditor, editorParams:{}, disabled:false, onChange:function () {
    }, onCancel:function () {
    }, width:"100%", value:"", noValueIndicator:has("ie") <= 6 ? "<span style='font-family: wingdings; text-decoration: underline;'>&#160;&#160;&#160;&#160;&#x270d;&#160;&#160;&#160;&#160;</span>" : "<span style='text-decoration: underline;'>&#160;&#160;&#160;&#160;&#x270d;&#160;&#160;&#160;&#160;</span>", constructor:function () {
        this.editorParams = {};
    }, postMixInProperties:function () {
        this.inherited(arguments);
        this.displayNode = this.srcNodeRef;
        this.own(on(this.displayNode, a11yclick, lang.hitch(this, "_onClick")), on(this.displayNode, "mouseover, focus", lang.hitch(this, "_onMouseOver")), on(this.displayNode, "mouseout, blur", lang.hitch(this, "_onMouseOut")));
        this.displayNode.setAttribute("role", "button");
        if (!this.displayNode.getAttribute("tabIndex")) {
            this.displayNode.setAttribute("tabIndex", 0);
        }
        if (!this.value && !("value" in this.params)) {
            this.value = lang.trim(this.renderAsHtml ? this.displayNode.innerHTML : (this.displayNode.innerText || this.displayNode.textContent || ""));
        }
        if (!this.value) {
            this.displayNode.innerHTML = this.noValueIndicator;
        }
        domClass.add(this.displayNode, "dijitInlineEditBoxDisplayMode");
    }, setDisabled:function (disabled) {
        kernel.deprecated("dijit.InlineEditBox.setDisabled() is deprecated.  Use set('disabled', bool) instead.", "", "2.0");
        this.set("disabled", disabled);
    }, _setDisabledAttr:function (disabled) {
        this.domNode.setAttribute("aria-disabled", disabled ? "true" : "false");
        if (disabled) {
            this.displayNode.removeAttribute("tabIndex");
        } else {
            this.displayNode.setAttribute("tabIndex", 0);
        }
        domClass.toggle(this.displayNode, "dijitInlineEditBoxDisplayModeDisabled", disabled);
        this._set("disabled", disabled);
    }, _onMouseOver:function () {
        if (!this.disabled) {
            domClass.add(this.displayNode, "dijitInlineEditBoxDisplayModeHover");
        }
    }, _onMouseOut:function () {
        domClass.remove(this.displayNode, "dijitInlineEditBoxDisplayModeHover");
    }, _onClick:function (e) {
        if (this.disabled) {
            return;
        }
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        this._onMouseOut();
        this.defer("edit");
    }, edit:function () {
        if (this.disabled || this.editing) {
            return;
        }
        this._set("editing", true);
        this._savedTabIndex = domAttr.get(this.displayNode, "tabIndex") || "0";
        if (!this.wrapperWidget) {
            var placeholder = domConstruct.create("span", null, this.domNode, "before");
            var Ewc = typeof this.editorWrapper == "string" ? lang.getObject(this.editorWrapper) : this.editorWrapper;
            this.wrapperWidget = new Ewc({value:this.value, buttonSave:this.buttonSave, buttonCancel:this.buttonCancel, dir:this.dir, lang:this.lang, tabIndex:this._savedTabIndex, editor:this.editor, inlineEditBox:this, sourceStyle:domStyle.getComputedStyle(this.displayNode), save:lang.hitch(this, "save"), cancel:lang.hitch(this, "cancel"), textDir:this.textDir}, placeholder);
            if (!this.wrapperWidget._started) {
                this.wrapperWidget.startup();
            }
            if (!this._started) {
                this.startup();
            }
        }
        var ww = this.wrapperWidget;
        domClass.add(this.displayNode, "dijitOffScreen");
        domClass.remove(ww.domNode, "dijitOffScreen");
        domStyle.set(ww.domNode, {visibility:"visible"});
        domAttr.set(this.displayNode, "tabIndex", "-1");
        var ew = ww.editWidget;
        var self = this;
        when(ew.onLoadDeferred, lang.hitch(ww, function () {
            ew.set(("displayedValue" in ew || "_setDisplayedValueAttr" in ew) ? "displayedValue" : "value", self.value);
            this.defer(function () {
                if (ww.saveButton) {
                    ww.saveButton.set("disabled", "intermediateChanges" in ew);
                }
                this.focus();
                this._resetValue = this.getValue();
            });
        }));
    }, _onBlur:function () {
        this.inherited(arguments);
        if (!this.editing) {
        }
    }, destroy:function () {
        if (this.wrapperWidget && !this.wrapperWidget._destroyed) {
            this.wrapperWidget.destroy();
            delete this.wrapperWidget;
        }
        this.inherited(arguments);
    }, _showText:function (focus) {
        var ww = this.wrapperWidget;
        domStyle.set(ww.domNode, {visibility:"hidden"});
        domClass.add(ww.domNode, "dijitOffScreen");
        domClass.remove(this.displayNode, "dijitOffScreen");
        domAttr.set(this.displayNode, "tabIndex", this._savedTabIndex);
        if (focus) {
            fm.focus(this.displayNode);
        }
    }, save:function (focus) {
        if (this.disabled || !this.editing) {
            return;
        }
        this._set("editing", false);
        var ww = this.wrapperWidget;
        var value = ww.getValue();
        this.set("value", value);
        this._showText(focus);
    }, setValue:function (val) {
        kernel.deprecated("dijit.InlineEditBox.setValue() is deprecated.  Use set('value', ...) instead.", "", "2.0");
        return this.set("value", val);
    }, _setValueAttr:function (val) {
        val = lang.trim(val);
        var renderVal = this.renderAsHtml ? val : val.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;").replace(/\n/g, "<br>");
        this.displayNode.innerHTML = renderVal || this.noValueIndicator;
        this._set("value", val);
        if (this._started) {
            this.defer(function () {
                this.onChange(val);
            });
        }
    }, getValue:function () {
        kernel.deprecated("dijit.InlineEditBox.getValue() is deprecated.  Use get('value') instead.", "", "2.0");
        return this.get("value");
    }, cancel:function (focus) {
        if (this.disabled || !this.editing) {
            return;
        }
        this._set("editing", false);
        this.defer("onCancel");
        this._showText(focus);
    }});
    if (0) {
        InlineEditBox = declare("dijit.InlineEditBox", InlineEditBox, {_setValueAttr:function () {
            this.inherited(arguments);
            this.applyTextDir(this.displayNode);
        }});
    }
    InlineEditBox._InlineEditor = InlineEditor;
    return InlineEditBox;
});

