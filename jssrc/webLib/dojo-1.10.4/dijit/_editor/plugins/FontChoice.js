//>>built

define("dijit/_editor/plugins/FontChoice", ["require", "dojo/_base/array", "dojo/_base/declare", "dojo/dom-construct", "dojo/i18n", "dojo/_base/lang", "dojo/store/Memory", "../../registry", "../../_Widget", "../../_TemplatedMixin", "../../_WidgetsInTemplateMixin", "../../form/FilteringSelect", "../_Plugin", "../range", "dojo/i18n!../nls/FontChoice"], function (require, array, declare, domConstruct, i18n, lang, MemoryStore, registry, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, FilteringSelect, _Plugin, rangeapi) {
    var _FontDropDown = declare("dijit._editor.plugins._FontDropDown", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {label:"", plainText:false, templateString:"<span style='white-space: nowrap' class='dijit dijitReset dijitInline'>" + "<label class='dijitLeft dijitInline' for='${selectId}'>${label}</label>" + "<input data-dojo-type='../../form/FilteringSelect' required='false' " + "data-dojo-props='labelType:\"html\", labelAttr:\"label\", searchAttr:\"name\"' " + "class='${comboClass}' " + "tabIndex='-1' id='${selectId}' data-dojo-attach-point='select' value=''/>" + "</span>", contextRequire:require, postMixInProperties:function () {
        this.inherited(arguments);
        this.strings = i18n.getLocalization("dijit._editor", "FontChoice");
        this.label = this.strings[this.command];
        this.id = registry.getUniqueId(this.declaredClass.replace(/\./g, "_"));
        this.selectId = this.id + "_select";
        this.inherited(arguments);
    }, postCreate:function () {
        this.select.set("store", new MemoryStore({idProperty:"value", data:array.map(this.values, function (value) {
            var name = this.strings[value] || value;
            return {label:this.getLabel(value, name), name:name, value:value};
        }, this)}));
        this.select.set("value", "", false);
        this.disabled = this.select.get("disabled");
    }, _setValueAttr:function (value, priorityChange) {
        priorityChange = priorityChange !== false;
        this.select.set("value", array.indexOf(this.values, value) < 0 ? "" : value, priorityChange);
        if (!priorityChange) {
            this.select._lastValueReported = null;
        }
    }, _getValueAttr:function () {
        return this.select.get("value");
    }, focus:function () {
        this.select.focus();
    }, _setDisabledAttr:function (value) {
        this._set("disabled", value);
        this.select.set("disabled", value);
    }});
    var _FontNameDropDown = declare("dijit._editor.plugins._FontNameDropDown", _FontDropDown, {generic:false, command:"fontName", comboClass:"dijitFontNameCombo", postMixInProperties:function () {
        if (!this.values) {
            this.values = this.generic ? ["serif", "sans-serif", "monospace", "cursive", "fantasy"] : ["Arial", "Times New Roman", "Comic Sans MS", "Courier New"];
        }
        this.inherited(arguments);
    }, getLabel:function (value, name) {
        if (this.plainText) {
            return name;
        } else {
            return "<div style='font-family: " + value + "'>" + name + "</div>";
        }
    }, _setValueAttr:function (value, priorityChange) {
        priorityChange = priorityChange !== false;
        if (this.generic) {
            var map = {"Arial":"sans-serif", "Helvetica":"sans-serif", "Myriad":"sans-serif", "Times":"serif", "Times New Roman":"serif", "Comic Sans MS":"cursive", "Apple Chancery":"cursive", "Courier":"monospace", "Courier New":"monospace", "Papyrus":"fantasy", "Estrangelo Edessa":"cursive", "Gabriola":"fantasy"};
            value = map[value] || value;
        }
        this.inherited(arguments, [value, priorityChange]);
    }});
    var _FontSizeDropDown = declare("dijit._editor.plugins._FontSizeDropDown", _FontDropDown, {command:"fontSize", comboClass:"dijitFontSizeCombo", values:[1, 2, 3, 4, 5, 6, 7], getLabel:function (value, name) {
        if (this.plainText) {
            return name;
        } else {
            return "<font size=" + value + "'>" + name + "</font>";
        }
    }, _setValueAttr:function (value, priorityChange) {
        priorityChange = priorityChange !== false;
        if (value.indexOf && value.indexOf("px") != -1) {
            var pixels = parseInt(value, 10);
            value = {10:1, 13:2, 16:3, 18:4, 24:5, 32:6, 48:7}[pixels] || value;
        }
        this.inherited(arguments, [value, priorityChange]);
    }});
    var _FormatBlockDropDown = declare("dijit._editor.plugins._FormatBlockDropDown", _FontDropDown, {command:"formatBlock", comboClass:"dijitFormatBlockCombo", values:["noFormat", "p", "h1", "h2", "h3", "pre"], postCreate:function () {
        this.inherited(arguments);
        this.set("value", "noFormat", false);
    }, getLabel:function (value, name) {
        if (this.plainText || value == "noFormat") {
            return name;
        } else {
            return "<" + value + ">" + name + "</" + value + ">";
        }
    }, _execCommand:function (editor, command, choice) {
        if (choice === "noFormat") {
            var start;
            var end;
            var sel = rangeapi.getSelection(editor.window);
            if (sel && sel.rangeCount > 0) {
                var range = sel.getRangeAt(0);
                var node, tag;
                if (range) {
                    start = range.startContainer;
                    end = range.endContainer;
                    while (start && start !== editor.editNode && start !== editor.document.body && start.nodeType !== 1) {
                        start = start.parentNode;
                    }
                    while (end && end !== editor.editNode && end !== editor.document.body && end.nodeType !== 1) {
                        end = end.parentNode;
                    }
                    var processChildren = lang.hitch(this, function (node, ary) {
                        if (node.childNodes && node.childNodes.length) {
                            var i;
                            for (i = 0; i < node.childNodes.length; i++) {
                                var c = node.childNodes[i];
                                if (c.nodeType == 1) {
                                    if (editor.selection.inSelection(c)) {
                                        var tag = c.tagName ? c.tagName.toLowerCase() : "";
                                        if (array.indexOf(this.values, tag) !== -1) {
                                            ary.push(c);
                                        }
                                        processChildren(c, ary);
                                    }
                                }
                            }
                        }
                    });
                    var unformatNodes = lang.hitch(this, function (nodes) {
                        if (nodes && nodes.length) {
                            editor.beginEditing();
                            while (nodes.length) {
                                this._removeFormat(editor, nodes.pop());
                            }
                            editor.endEditing();
                        }
                    });
                    var clearNodes = [];
                    if (start == end) {
                        var block;
                        node = start;
                        while (node && node !== editor.editNode && node !== editor.document.body) {
                            if (node.nodeType == 1) {
                                tag = node.tagName ? node.tagName.toLowerCase() : "";
                                if (array.indexOf(this.values, tag) !== -1) {
                                    block = node;
                                    break;
                                }
                            }
                            node = node.parentNode;
                        }
                        processChildren(start, clearNodes);
                        if (block) {
                            clearNodes = [block].concat(clearNodes);
                        }
                        unformatNodes(clearNodes);
                    } else {
                        node = start;
                        while (editor.selection.inSelection(node)) {
                            if (node.nodeType == 1) {
                                tag = node.tagName ? node.tagName.toLowerCase() : "";
                                if (array.indexOf(this.values, tag) !== -1) {
                                    clearNodes.push(node);
                                }
                                processChildren(node, clearNodes);
                            }
                            node = node.nextSibling;
                        }
                        unformatNodes(clearNodes);
                    }
                    editor.onDisplayChanged();
                }
            }
        } else {
            editor.execCommand(command, choice);
        }
    }, _removeFormat:function (editor, node) {
        if (editor.customUndo) {
            while (node.firstChild) {
                domConstruct.place(node.firstChild, node, "before");
            }
            node.parentNode.removeChild(node);
        } else {
            editor.selection.selectElementChildren(node);
            var html = editor.selection.getSelectedHtml();
            editor.selection.selectElement(node);
            editor.execCommand("inserthtml", html || "");
        }
    }});
    var FontChoice = declare("dijit._editor.plugins.FontChoice", _Plugin, {useDefaultCommand:false, _initButton:function () {
        var clazz = {fontName:_FontNameDropDown, fontSize:_FontSizeDropDown, formatBlock:_FormatBlockDropDown}[this.command], params = this.params;
        if (this.params.custom) {
            params.values = this.params.custom;
        }
        var editor = this.editor;
        this.button = new clazz(lang.delegate({dir:editor.dir, lang:editor.lang}, params));
        this.own(this.button.select.on("change", lang.hitch(this, function (choice) {
            if (this.editor.focused) {
                this.editor.focus();
            }
            if (this.command == "fontName" && choice.indexOf(" ") != -1) {
                choice = "'" + choice + "'";
            }
            if (this.button._execCommand) {
                this.button._execCommand(this.editor, this.command, choice);
            } else {
                this.editor.execCommand(this.command, choice);
            }
        })));
    }, updateState:function () {
        var _e = this.editor;
        var _c = this.command;
        if (!_e || !_e.isLoaded || !_c.length) {
            return;
        }
        if (this.button) {
            var disabled = this.get("disabled");
            this.button.set("disabled", disabled);
            if (disabled) {
                return;
            }
            var value;
            try {
                value = _e.queryCommandValue(_c) || "";
            }
            catch (e) {
                value = "";
            }
            var quoted = lang.isString(value) && (value.match(/'([^']*)'/) || value.match(/"([^"]*)"/));
            if (quoted) {
                value = quoted[1];
            }
            if (_c === "formatBlock") {
                if (!value || value == "p") {
                    value = null;
                    var elem;
                    var sel = rangeapi.getSelection(this.editor.window);
                    if (sel && sel.rangeCount > 0) {
                        var range = sel.getRangeAt(0);
                        if (range) {
                            elem = range.endContainer;
                        }
                    }
                    while (elem && elem !== _e.editNode && elem !== _e.document) {
                        var tg = elem.tagName ? elem.tagName.toLowerCase() : "";
                        if (tg && array.indexOf(this.button.values, tg) > -1) {
                            value = tg;
                            break;
                        }
                        elem = elem.parentNode;
                    }
                    if (!value) {
                        value = "noFormat";
                    }
                } else {
                    if (array.indexOf(this.button.values, value) < 0) {
                        value = "noFormat";
                    }
                }
            }
            if (value !== this.button.get("value")) {
                this.button.set("value", value, false);
            }
        }
    }});
    array.forEach(["fontName", "fontSize", "formatBlock"], function (name) {
        _Plugin.registry[name] = function (args) {
            return new FontChoice({command:name, plainText:args.plainText});
        };
    });
    FontChoice._FontDropDown = _FontDropDown;
    FontChoice._FontNameDropDown = _FontNameDropDown;
    FontChoice._FontSizeDropDown = _FontSizeDropDown;
    FontChoice._FormatBlockDropDown = _FormatBlockDropDown;
    return FontChoice;
});

