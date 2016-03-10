//>>built

define("dijit/_editor/plugins/LinkDialog", ["require", "dojo/_base/declare", "dojo/dom-attr", "dojo/keys", "dojo/_base/lang", "dojo/on", "dojo/sniff", "dojo/query", "dojo/string", "../_Plugin", "../../form/DropDownButton", "../range"], function (require, declare, domAttr, keys, lang, on, has, query, string, _Plugin, DropDownButton, rangeapi) {
    var LinkDialog = declare("dijit._editor.plugins.LinkDialog", _Plugin, {buttonClass:DropDownButton, useDefaultCommand:false, urlRegExp:"((https?|ftps?|file)\\://|./|../|/|)(/[a-zA-Z]{1,1}:/|)(((?:(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)\\.)*(?:[a-zA-Z](?:[-\\da-zA-Z]{0,80}[\\da-zA-Z])?)\\.?)|(((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])|(0[xX]0*[\\da-fA-F]?[\\da-fA-F]\\.){3}0[xX]0*[\\da-fA-F]?[\\da-fA-F]|(0+[0-3][0-7][0-7]\\.){3}0+[0-3][0-7][0-7]|(0|[1-9]\\d{0,8}|[1-3]\\d{9}|4[01]\\d{8}|42[0-8]\\d{7}|429[0-3]\\d{6}|4294[0-8]\\d{5}|42949[0-5]\\d{4}|429496[0-6]\\d{3}|4294967[01]\\d{2}|42949672[0-8]\\d|429496729[0-5])|0[xX]0*[\\da-fA-F]{1,8}|([\\da-fA-F]{1,4}\\:){7}[\\da-fA-F]{1,4}|([\\da-fA-F]{1,4}\\:){6}((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])))(\\:\\d+)?(/(?:[^?#\\s/]+/)*(?:[^?#\\s/]{0,}(?:\\?[^?#\\s/]*)?(?:#.*)?)?)?", emailRegExp:"<?(mailto\\:)([!#-'*+\\-\\/-9=?A-Z^-~]+[.])*[!#-'*+\\-\\/-9=?A-Z^-~]+" + "@" + "((?:(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)\\.)+(?:[a-zA-Z](?:[-\\da-zA-Z]{0,6}[\\da-zA-Z])?)\\.?)|localhost|^[^-][a-zA-Z0-9_-]*>?", htmlTemplate:"<a href=\"${urlInput}\" _djrealurl=\"${urlInput}\"" + " target=\"${targetSelect}\"" + ">${textInput}</a>", tag:"a", _hostRxp:/^((([^\[:]+):)?([^@]+)@)?(\[([^\]]+)\]|([^\[:]*))(:([0-9]+))?$/, _userAtRxp:/^([!#-'*+\-\/-9=?A-Z^-~]+[.])*[!#-'*+\-\/-9=?A-Z^-~]+@/i, linkDialogTemplate:["<table role='presentation'><tr><td>", "<label for='${id}_urlInput'>${url}</label>", "</td><td>", "<input data-dojo-type='dijit.form.ValidationTextBox' required='true' " + "id='${id}_urlInput' name='urlInput' data-dojo-props='intermediateChanges:true'/>", "</td></tr><tr><td>", "<label for='${id}_textInput'>${text}</label>", "</td><td>", "<input data-dojo-type='dijit.form.ValidationTextBox' required='true' id='${id}_textInput' " + "name='textInput' data-dojo-props='intermediateChanges:true'/>", "</td></tr><tr><td>", "<label for='${id}_targetSelect'>${target}</label>", "</td><td>", "<select id='${id}_targetSelect' name='targetSelect' data-dojo-type='dijit.form.Select'>", "<option selected='selected' value='_self'>${currentWindow}</option>", "<option value='_blank'>${newWindow}</option>", "<option value='_top'>${topWindow}</option>", "<option value='_parent'>${parentWindow}</option>", "</select>", "</td></tr><tr><td colspan='2'>", "<button data-dojo-type='dijit.form.Button' type='submit' id='${id}_setButton'>${set}</button>", "<button data-dojo-type='dijit.form.Button' type='button' id='${id}_cancelButton'>${buttonCancel}</button>", "</td></tr></table>"].join(""), _initButton:function () {
        this.inherited(arguments);
        this.button.loadDropDown = lang.hitch(this, "_loadDropDown");
        this._connectTagEvents();
    }, _loadDropDown:function (callback) {
        require(["dojo/i18n", "../../TooltipDialog", "../../registry", "../../form/Button", "../../form/Select", "../../form/ValidationTextBox", "dojo/i18n!../../nls/common", "dojo/i18n!../nls/LinkDialog"], lang.hitch(this, function (i18n, TooltipDialog, registry) {
            var _this = this;
            this.tag = this.command == "insertImage" ? "img" : "a";
            var messages = lang.delegate(i18n.getLocalization("dijit", "common", this.lang), i18n.getLocalization("dijit._editor", "LinkDialog", this.lang));
            var dropDown = (this.dropDown = this.button.dropDown = new TooltipDialog({title:messages[this.command + "Title"], ownerDocument:this.editor.ownerDocument, dir:this.editor.dir, execute:lang.hitch(this, "setValue"), onOpen:function () {
                _this._onOpenDialog();
                TooltipDialog.prototype.onOpen.apply(this, arguments);
            }, onCancel:function () {
                setTimeout(lang.hitch(_this, "_onCloseDialog"), 0);
            }}));
            messages.urlRegExp = this.urlRegExp;
            messages.id = registry.getUniqueId(this.editor.id);
            this._uniqueId = messages.id;
            this._setContent(dropDown.title + "<div style='border-bottom: 1px black solid;padding-bottom:2pt;margin-bottom:4pt'></div>" + string.substitute(this.linkDialogTemplate, messages));
            dropDown.startup();
            this._urlInput = registry.byId(this._uniqueId + "_urlInput");
            this._textInput = registry.byId(this._uniqueId + "_textInput");
            this._setButton = registry.byId(this._uniqueId + "_setButton");
            this.own(registry.byId(this._uniqueId + "_cancelButton").on("click", lang.hitch(this.dropDown, "onCancel")));
            if (this._urlInput) {
                this.own(this._urlInput.on("change", lang.hitch(this, "_checkAndFixInput")));
            }
            if (this._textInput) {
                this.own(this._textInput.on("change", lang.hitch(this, "_checkAndFixInput")));
            }
            this._urlRegExp = new RegExp("^" + this.urlRegExp + "$", "i");
            this._emailRegExp = new RegExp("^" + this.emailRegExp + "$", "i");
            this._urlInput.isValid = lang.hitch(this, function () {
                var value = this._urlInput.get("value");
                return this._urlRegExp.test(value) || this._emailRegExp.test(value);
            });
            this.own(on(dropDown.domNode, "keydown", lang.hitch(this, lang.hitch(this, function (e) {
                if (e && e.keyCode == keys.ENTER && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
                    if (!this._setButton.get("disabled")) {
                        dropDown.onExecute();
                        dropDown.execute(dropDown.get("value"));
                    }
                }
            }))));
            callback();
        }));
    }, _checkAndFixInput:function () {
        var self = this;
        var url = this._urlInput.get("value");
        var fixupUrl = function (url) {
            var appendHttp = false;
            var appendMailto = false;
            if (url && url.length > 1) {
                url = lang.trim(url);
                if (url.indexOf("mailto:") !== 0) {
                    if (url.indexOf("/") > 0) {
                        if (url.indexOf("://") === -1) {
                            if (url.charAt(0) !== "/" && url.indexOf("./") && url.indexOf("../") !== 0) {
                                if (self._hostRxp.test(url)) {
                                    appendHttp = true;
                                }
                            }
                        }
                    } else {
                        if (self._userAtRxp.test(url)) {
                            appendMailto = true;
                        }
                    }
                }
            }
            if (appendHttp) {
                self._urlInput.set("value", "http://" + url);
            }
            if (appendMailto) {
                self._urlInput.set("value", "mailto:" + url);
            }
            self._setButton.set("disabled", !self._isValid());
        };
        if (this._delayedCheck) {
            clearTimeout(this._delayedCheck);
            this._delayedCheck = null;
        }
        this._delayedCheck = setTimeout(function () {
            fixupUrl(url);
        }, 250);
    }, _connectTagEvents:function () {
        this.editor.onLoadDeferred.then(lang.hitch(this, function () {
            this.own(on(this.editor.editNode, "dblclick", lang.hitch(this, "_onDblClick")));
        }));
    }, _isValid:function () {
        return this._urlInput.isValid() && this._textInput.isValid();
    }, _setContent:function (staticPanel) {
        this.dropDown.set({parserScope:"dojo", content:staticPanel});
    }, _checkValues:function (args) {
        if (args && args.urlInput) {
            args.urlInput = args.urlInput.replace(/"/g, "&quot;");
        }
        return args;
    }, setValue:function (args) {
        this._onCloseDialog();
        if (has("ie") < 9) {
            var sel = rangeapi.getSelection(this.editor.window);
            var range = sel.getRangeAt(0);
            var a = range.endContainer;
            if (a.nodeType === 3) {
                a = a.parentNode;
            }
            if (a && (a.nodeName && a.nodeName.toLowerCase() !== this.tag)) {
                a = this.editor.selection.getSelectedElement(this.tag);
            }
            if (a && (a.nodeName && a.nodeName.toLowerCase() === this.tag)) {
                if (this.editor.queryCommandEnabled("unlink")) {
                    this.editor.selection.selectElementChildren(a);
                    this.editor.execCommand("unlink");
                }
            }
        }
        args = this._checkValues(args);
        this.editor.execCommand("inserthtml", string.substitute(this.htmlTemplate, args));
        query("a", this.editor.document).forEach(function (a) {
            if (!a.innerHTML && !domAttr.has(a, "name")) {
                a.parentNode.removeChild(a);
            }
        }, this);
    }, _onCloseDialog:function () {
        if (this.editor.focused) {
            this.editor.focus();
        }
    }, _getCurrentValues:function (a) {
        var url, text, target;
        if (a && a.tagName.toLowerCase() === this.tag) {
            url = a.getAttribute("_djrealurl") || a.getAttribute("href");
            target = a.getAttribute("target") || "_self";
            text = a.textContent || a.innerText;
            this.editor.selection.selectElement(a, true);
        } else {
            text = this.editor.selection.getSelectedText();
        }
        return {urlInput:url || "", textInput:text || "", targetSelect:target || ""};
    }, _onOpenDialog:function () {
        var a, b, fc;
        if (has("ie")) {
            var sel = rangeapi.getSelection(this.editor.window);
            if (sel.rangeCount) {
                var range = sel.getRangeAt(0);
                a = range.endContainer;
                if (a.nodeType === 3) {
                    a = a.parentNode;
                }
                if (a && (a.nodeName && a.nodeName.toLowerCase() !== this.tag)) {
                    a = this.editor.selection.getSelectedElement(this.tag);
                }
                if (!a || (a.nodeName && a.nodeName.toLowerCase() !== this.tag)) {
                    b = this.editor.selection.getAncestorElement(this.tag);
                    if (b && (b.nodeName && b.nodeName.toLowerCase() == this.tag)) {
                        a = b;
                        this.editor.selection.selectElement(a);
                    } else {
                        if (range.startContainer === range.endContainer) {
                            fc = range.startContainer.firstChild;
                            if (fc && (fc.nodeName && fc.nodeName.toLowerCase() == this.tag)) {
                                a = fc;
                                this.editor.selection.selectElement(a);
                            }
                        }
                    }
                }
            }
        } else {
            a = this.editor.selection.getAncestorElement(this.tag);
        }
        this.dropDown.reset();
        this._setButton.set("disabled", true);
        this.dropDown.set("value", this._getCurrentValues(a));
    }, _onDblClick:function (e) {
        if (e && e.target) {
            var t = e.target;
            var tg = t.tagName ? t.tagName.toLowerCase() : "";
            if (tg === this.tag && domAttr.get(t, "href")) {
                var editor = this.editor;
                this.editor.selection.selectElement(t);
                editor.onDisplayChanged();
                if (editor._updateTimer) {
                    editor._updateTimer.remove();
                    delete editor._updateTimer;
                }
                editor.onNormalizedDisplayChanged();
                var button = this.button;
                setTimeout(function () {
                    button.set("disabled", false);
                    button.loadAndOpenDropDown().then(function () {
                        if (button.dropDown.focus) {
                            button.dropDown.focus();
                        }
                    });
                }, 10);
            }
        }
    }});
    var ImgLinkDialog = declare("dijit._editor.plugins.ImgLinkDialog", [LinkDialog], {linkDialogTemplate:["<table role='presentation'><tr><td>", "<label for='${id}_urlInput'>${url}</label>", "</td><td>", "<input dojoType='dijit.form.ValidationTextBox' regExp='${urlRegExp}' " + "required='true' id='${id}_urlInput' name='urlInput' data-dojo-props='intermediateChanges:true'/>", "</td></tr><tr><td>", "<label for='${id}_textInput'>${text}</label>", "</td><td>", "<input data-dojo-type='dijit.form.ValidationTextBox' required='false' id='${id}_textInput' " + "name='textInput' data-dojo-props='intermediateChanges:true'/>", "</td></tr><tr><td>", "</td><td>", "</td></tr><tr><td colspan='2'>", "<button data-dojo-type='dijit.form.Button' type='submit' id='${id}_setButton'>${set}</button>", "<button data-dojo-type='dijit.form.Button' type='button' id='${id}_cancelButton'>${buttonCancel}</button>", "</td></tr></table>"].join(""), htmlTemplate:"<img src=\"${urlInput}\" _djrealurl=\"${urlInput}\" alt=\"${textInput}\" />", tag:"img", _getCurrentValues:function (img) {
        var url, text;
        if (img && img.tagName.toLowerCase() === this.tag) {
            url = img.getAttribute("_djrealurl") || img.getAttribute("src");
            text = img.getAttribute("alt");
            this.editor.selection.selectElement(img, true);
        } else {
            text = this.editor.selection.getSelectedText();
        }
        return {urlInput:url || "", textInput:text || ""};
    }, _isValid:function () {
        return this._urlInput.isValid();
    }, _connectTagEvents:function () {
        this.inherited(arguments);
        this.editor.onLoadDeferred.then(lang.hitch(this, function () {
            this.own(on(this.editor.editNode, "mousedown", lang.hitch(this, "_selectTag")));
        }));
    }, _selectTag:function (e) {
        if (e && e.target) {
            var t = e.target;
            var tg = t.tagName ? t.tagName.toLowerCase() : "";
            if (tg === this.tag) {
                this.editor.selection.selectElement(t);
            }
        }
    }, _checkValues:function (args) {
        if (args && args.urlInput) {
            args.urlInput = args.urlInput.replace(/"/g, "&quot;");
        }
        if (args && args.textInput) {
            args.textInput = args.textInput.replace(/"/g, "&quot;");
        }
        return args;
    }, _onDblClick:function (e) {
        if (e && e.target) {
            var t = e.target;
            var tg = t.tagName ? t.tagName.toLowerCase() : "";
            if (tg === this.tag && domAttr.get(t, "src")) {
                var editor = this.editor;
                this.editor.selection.selectElement(t);
                editor.onDisplayChanged();
                if (editor._updateTimer) {
                    editor._updateTimer.remove();
                    delete editor._updateTimer;
                }
                editor.onNormalizedDisplayChanged();
                var button = this.button;
                setTimeout(function () {
                    button.set("disabled", false);
                    button.loadAndOpenDropDown().then(function () {
                        if (button.dropDown.focus) {
                            button.dropDown.focus();
                        }
                    });
                }, 10);
            }
        }
    }});
    _Plugin.registry["createLink"] = function () {
        return new LinkDialog({command:"createLink"});
    };
    _Plugin.registry["insertImage"] = function () {
        return new ImgLinkDialog({command:"insertImage"});
    };
    LinkDialog.ImgLinkDialog = ImgLinkDialog;
    return LinkDialog;
});

