//>>built

define("dojox/editor/plugins/FindReplace", ["dojo", "dijit", "dojox", "dijit/_base/manager", "dijit/_base/popup", "dijit/_Widget", "dijit/_TemplatedMixin", "dijit/_KeyNavContainer", "dijit/_WidgetsInTemplateMixin", "dijit/TooltipDialog", "dijit/Toolbar", "dijit/form/CheckBox", "dijit/form/_TextBoxMixin", "dijit/form/TextBox", "dijit/_editor/_Plugin", "dijit/form/Button", "dijit/form/DropDownButton", "dijit/form/ToggleButton", "./ToolbarLineBreak", "dojo/_base/connect", "dojo/_base/declare", "dojo/i18n", "dojo/string", "dojo/i18n!dojox/editor/plugins/nls/FindReplace"], function (dojo, dijit, dojox, manager, popup, _Widget, _TemplatedMixin, _KeyNavContainer, _WidgetsInTemplateMixin, TooltipDialog, Toolbar, CheckBox, _TextBoxMixin, TextBox, _Plugin) {
    dojo.experimental("dojox.editor.plugins.FindReplace");
    var FindReplaceCloseBox = dojo.declare("dojox.editor.plugins._FindReplaceCloseBox", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {btnId:"", widget:null, widgetsInTemplate:true, templateString:"<span style='float: right' class='dijitInline' tabindex='-1'>" + "<button class='dijit dijitReset dijitInline' " + "id='${btnId}' dojoAttachPoint='button' dojoType='dijit.form.Button' tabindex='-1' iconClass='dijitEditorIconsFindReplaceClose' showLabel='false'>X</button>" + "</span>", postMixInProperties:function () {
        this.id = dijit.getUniqueId(this.declaredClass.replace(/\./g, "_"));
        this.btnId = this.id + "_close";
        this.inherited(arguments);
    }, startup:function () {
        this.connect(this.button, "onClick", "onClick");
    }, onClick:function () {
    }});
    var FindReplaceTextBox = dojo.declare("dojox.editor.plugins._FindReplaceTextBox", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {textId:"", label:"", toolTip:"", widget:null, widgetsInTemplate:true, templateString:"<span style='white-space: nowrap' class='dijit dijitReset dijitInline dijitEditorFindReplaceTextBox' " + "title='${tooltip}' tabindex='-1'>" + "<label class='dijitLeft dijitInline' for='${textId}' tabindex='-1'>${label}</label>" + "<input dojoType='dijit.form.TextBox' intermediateChanges='true' class='focusTextBox' " + "tabIndex='0' id='${textId}' dojoAttachPoint='textBox, focusNode' value='' dojoAttachEvent='onKeyPress: _onKeyPress'/>" + "</span>", postMixInProperties:function () {
        this.id = dijit.getUniqueId(this.declaredClass.replace(/\./g, "_"));
        this.textId = this.id + "_text";
        this.inherited(arguments);
    }, postCreate:function () {
        this.textBox.set("value", "");
        this.disabled = this.textBox.get("disabled");
        this.connect(this.textBox, "onChange", "onChange");
        dojo.attr(this.textBox.textbox, "formnovalidate", "true");
    }, _setValueAttr:function (value) {
        this.value = value;
        this.textBox.set("value", value);
    }, focus:function () {
        this.textBox.focus();
    }, _setDisabledAttr:function (value) {
        this.disabled = value;
        this.textBox.set("disabled", value);
    }, onChange:function (val) {
        this.value = val;
    }, _onKeyPress:function (evt) {
        var start = 0;
        var end = 0;
        if (evt.target && !evt.ctrlKey && !evt.altKey && !evt.shiftKey) {
            if (evt.keyCode == dojo.keys.LEFT_ARROW) {
                start = evt.target.selectionStart;
                end = evt.target.selectionEnd;
                if (start < end) {
                    dijit.selectInputText(evt.target, start, start);
                    dojo.stopEvent(evt);
                }
            } else {
                if (evt.keyCode == dojo.keys.RIGHT_ARROW) {
                    start = evt.target.selectionStart;
                    end = evt.target.selectionEnd;
                    if (start < end) {
                        dijit.selectInputText(evt.target, end, end);
                        dojo.stopEvent(evt);
                    }
                }
            }
        }
    }});
    var FindReplaceCheckBox = dojo.declare("dojox.editor.plugins._FindReplaceCheckBox", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {checkId:"", label:"", tooltip:"", widget:null, widgetsInTemplate:true, templateString:"<span style='white-space: nowrap' tabindex='-1' " + "class='dijit dijitReset dijitInline dijitEditorFindReplaceCheckBox' title='${tooltip}' >" + "<input dojoType='dijit.form.CheckBox' " + "tabIndex='0' id='${checkId}' dojoAttachPoint='checkBox, focusNode' value=''/>" + "<label tabindex='-1' class='dijitLeft dijitInline' for='${checkId}'>${label}</label>" + "</span>", postMixInProperties:function () {
        this.id = dijit.getUniqueId(this.declaredClass.replace(/\./g, "_"));
        this.checkId = this.id + "_check";
        this.inherited(arguments);
    }, postCreate:function () {
        this.checkBox.set("checked", false);
        this.disabled = this.checkBox.get("disabled");
        this.checkBox.isFocusable = function () {
            return false;
        };
    }, _setValueAttr:function (value) {
        this.checkBox.set("value", value);
    }, _getValueAttr:function () {
        return this.checkBox.get("value");
    }, focus:function () {
        this.checkBox.focus();
    }, _setDisabledAttr:function (value) {
        this.disabled = value;
        this.checkBox.set("disabled", value);
    }});
    var FindReplaceToolbar = dojo.declare("dojox.editor.plugins._FindReplaceToolbar", Toolbar, {postCreate:function () {
        this.connectKeyNavHandlers([], []);
        this.connect(this.containerNode, "onclick", "_onToolbarEvent");
        this.connect(this.containerNode, "onkeydown", "_onToolbarEvent");
        dojo.addClass(this.domNode, "dijitToolbar");
    }, addChild:function (widget, insertIndex) {
        dijit._KeyNavContainer.superclass.addChild.apply(this, arguments);
    }, _onToolbarEvent:function (evt) {
        evt.stopPropagation();
    }});
    var FindReplace = dojo.declare("dojox.editor.plugins.FindReplace", [_Plugin], {buttonClass:dijit.form.ToggleButton, iconClassPrefix:"dijitEditorIconsFindReplace", editor:null, button:null, _frToolbar:null, _closeBox:null, _findField:null, _replaceField:null, _findButton:null, _replaceButton:null, _replaceAllButton:null, _caseSensitive:null, _backwards:null, _promDialog:null, _promDialogTimeout:null, _strings:null, _initButton:function () {
        this._strings = dojo.i18n.getLocalization("dojox.editor.plugins", "FindReplace");
        this.button = new dijit.form.ToggleButton({label:this._strings["findReplace"], showLabel:false, iconClass:this.iconClassPrefix + " dijitEditorIconFindString", tabIndex:"-1", onChange:dojo.hitch(this, "_toggleFindReplace")});
        if (dojo.isOpera) {
            this.button.set("disabled", true);
        }
        this.connect(this.button, "set", dojo.hitch(this, function (attr, val) {
            if (attr === "disabled") {
                this._toggleFindReplace((!val && this._displayed), true, true);
            }
        }));
    }, setEditor:function (editor) {
        this.editor = editor;
        this._initButton();
    }, toggle:function () {
        this.button.set("checked", !this.button.get("checked"));
    }, _toggleFindReplace:function (show, ignoreState, buttonDisabled) {
        var size = dojo.marginBox(this.editor.domNode);
        if (show && !dojo.isOpera) {
            dojo.style(this._frToolbar.domNode, "display", "block");
            this._populateFindField();
            if (!ignoreState) {
                this._displayed = true;
            }
        } else {
            dojo.style(this._frToolbar.domNode, "display", "none");
            if (!ignoreState) {
                this._displayed = false;
            }
            if (!buttonDisabled) {
                this.editor.focus();
            }
        }
        this.editor.resize({h:size.h});
    }, _populateFindField:function () {
        var ed = this.editor;
        var win = ed.window;
        var selectedTxt = ed._sCall("getSelectedText", [null]);
        if (this._findField && this._findField.textBox) {
            if (selectedTxt) {
                this._findField.textBox.set("value", selectedTxt);
            }
            this._findField.textBox.focus();
            dijit.selectInputText(this._findField.textBox.focusNode);
        }
    }, setToolbar:function (toolbar) {
        this.inherited(arguments);
        if (!dojo.isOpera) {
            var _tb = (this._frToolbar = new FindReplaceToolbar());
            dojo.style(_tb.domNode, "display", "none");
            dojo.place(_tb.domNode, toolbar.domNode, "after");
            _tb.startup();
            this._closeBox = new FindReplaceCloseBox();
            _tb.addChild(this._closeBox);
            this._findField = new FindReplaceTextBox({label:this._strings["findLabel"], tooltip:this._strings["findTooltip"]});
            _tb.addChild(this._findField);
            this._replaceField = new FindReplaceTextBox({label:this._strings["replaceLabel"], tooltip:this._strings["replaceTooltip"]});
            _tb.addChild(this._replaceField);
            _tb.addChild(new dojox.editor.plugins.ToolbarLineBreak());
            this._findButton = new dijit.form.Button({label:this._strings["findButton"], showLabel:true, iconClass:this.iconClassPrefix + " dijitEditorIconFind"});
            this._findButton.titleNode.title = this._strings["findButtonTooltip"];
            _tb.addChild(this._findButton);
            this._replaceButton = new dijit.form.Button({label:this._strings["replaceButton"], showLabel:true, iconClass:this.iconClassPrefix + " dijitEditorIconReplace"});
            this._replaceButton.titleNode.title = this._strings["replaceButtonTooltip"];
            _tb.addChild(this._replaceButton);
            this._replaceAllButton = new dijit.form.Button({label:this._strings["replaceAllButton"], showLabel:true, iconClass:this.iconClassPrefix + " dijitEditorIconReplaceAll"});
            this._replaceAllButton.titleNode.title = this._strings["replaceAllButtonTooltip"];
            _tb.addChild(this._replaceAllButton);
            this._caseSensitive = new FindReplaceCheckBox({label:this._strings["matchCase"], tooltip:this._strings["matchCaseTooltip"]});
            _tb.addChild(this._caseSensitive);
            this._backwards = new FindReplaceCheckBox({label:this._strings["backwards"], tooltip:this._strings["backwardsTooltip"]});
            _tb.addChild(this._backwards);
            this._findButton.set("disabled", true);
            this._replaceButton.set("disabled", true);
            this._replaceAllButton.set("disabled", true);
            this.connect(this._findField, "onChange", "_checkButtons");
            this.connect(this._findField, "onKeyDown", "_onFindKeyDown");
            this.connect(this._replaceField, "onKeyDown", "_onReplaceKeyDown");
            this.connect(this._findButton, "onClick", "_find");
            this.connect(this._replaceButton, "onClick", "_replace");
            this.connect(this._replaceAllButton, "onClick", "_replaceAll");
            this.connect(this._closeBox, "onClick", "toggle");
            this._promDialog = new dijit.TooltipDialog();
            this._promDialog.startup();
            this._promDialog.set("content", "");
        }
    }, _checkButtons:function () {
        var fText = this._findField.get("value");
        if (fText) {
            this._findButton.set("disabled", false);
            this._replaceButton.set("disabled", false);
            this._replaceAllButton.set("disabled", false);
        } else {
            this._findButton.set("disabled", true);
            this._replaceButton.set("disabled", true);
            this._replaceAllButton.set("disabled", true);
        }
    }, _onFindKeyDown:function (evt) {
        if (evt.keyCode == dojo.keys.ENTER) {
            this._find();
            dojo.stopEvent(evt);
        }
    }, _onReplaceKeyDown:function (evt) {
        if (evt.keyCode == dojo.keys.ENTER) {
            if (!this._replace()) {
                this._replace();
            }
            dojo.stopEvent(evt);
        }
    }, _find:function (showMessage) {
        var txt = this._findField.get("value") || "";
        if (txt) {
            var caseSensitive = this._caseSensitive.get("value");
            var backwards = this._backwards.get("value");
            var isFound = this._findText(txt, caseSensitive, backwards);
            if (!isFound && showMessage) {
                this._promDialog.set("content", dojo.string.substitute(this._strings["eofDialogText"], {"0":this._strings["eofDialogTextFind"]}));
                dijit.popup.open({popup:this._promDialog, around:this._findButton.domNode});
                this._promDialogTimeout = setTimeout(dojo.hitch(this, function () {
                    clearTimeout(this._promDialogTimeout);
                    this._promDialogTimeout = null;
                    dijit.popup.close(this._promDialog);
                }), 3000);
                setTimeout(dojo.hitch(this, function () {
                    this.editor.focus();
                }), 0);
            }
            return isFound;
        }
        return false;
    }, _replace:function (showMessage) {
        var isReplaced = false;
        var ed = this.editor;
        ed.focus();
        var txt = this._findField.get("value") || "";
        var repTxt = this._replaceField.get("value") || "";
        if (txt) {
            var caseSensitive = this._caseSensitive.get("value");
            var backwards = this._backwards.get("value");
            var selected = ed._sCall("getSelectedText", [null]);
            if (dojo.isMoz) {
                txt = dojo.trim(txt);
                selected = dojo.trim(selected);
            }
            var regExp = this._filterRegexp(txt, !caseSensitive);
            if (selected && regExp.test(selected)) {
                ed.execCommand("inserthtml", repTxt);
                isReplaced = true;
                if (backwards) {
                    this._findText(repTxt, caseSensitive, backwards);
                    ed._sCall("collapse", [true]);
                }
            }
            if (!this._find(false) && showMessage) {
                this._promDialog.set("content", dojo.string.substitute(this._strings["eofDialogText"], {"0":this._strings["eofDialogTextReplace"]}));
                dijit.popup.open({popup:this._promDialog, around:this._replaceButton.domNode});
                this._promDialogTimeout = setTimeout(dojo.hitch(this, function () {
                    clearTimeout(this._promDialogTimeout);
                    this._promDialogTimeout = null;
                    dijit.popup.close(this._promDialog);
                }), 3000);
                setTimeout(dojo.hitch(this, function () {
                    this.editor.focus();
                }), 0);
            }
            return isReplaced;
        }
        return null;
    }, _replaceAll:function (showMessage) {
        var replaced = 0;
        var backwards = this._backwards.get("value");
        if (backwards) {
            this.editor.placeCursorAtEnd();
        } else {
            this.editor.placeCursorAtStart();
        }
        if (this._replace(false)) {
            replaced++;
        }
        var loopBody = dojo.hitch(this, function () {
            if (this._replace(false)) {
                replaced++;
                setTimeout(loopBody, 10);
            } else {
                if (showMessage) {
                    this._promDialog.set("content", dojo.string.substitute(this._strings["replaceDialogText"], {"0":"" + replaced}));
                    dijit.popup.open({popup:this._promDialog, around:this._replaceAllButton.domNode});
                    this._promDialogTimeout = setTimeout(dojo.hitch(this, function () {
                        clearTimeout(this._promDialogTimeout);
                        this._promDialogTimeout = null;
                        dijit.popup.close(this._promDialog);
                    }), 3000);
                    setTimeout(dojo.hitch(this, function () {
                        this._findField.focus();
                        this._findField.textBox.focusNode.select();
                    }), 0);
                }
            }
        });
        loopBody();
    }, _findText:function (txt, caseSensitive, backwards) {
        var ed = this.editor;
        var win = ed.window;
        var found = false;
        if (txt) {
            if (win.find) {
                found = win.find(txt, caseSensitive, backwards, false, false, false, false);
            } else {
                var doc = ed.document;
                if (doc.selection) {
                    this.editor.focus();
                    var txtRg = doc.body.createTextRange();
                    var curPos = doc.selection ? doc.selection.createRange() : null;
                    if (curPos) {
                        if (backwards) {
                            txtRg.setEndPoint("EndToStart", curPos);
                        } else {
                            txtRg.setEndPoint("StartToEnd", curPos);
                        }
                    }
                    var flags = caseSensitive ? 4 : 0;
                    if (backwards) {
                        flags = flags | 1;
                    }
                    found = txtRg.findText(txt, txtRg.text.length, flags);
                    if (found) {
                        txtRg.select();
                    }
                }
            }
        }
        return found;
    }, _filterRegexp:function (pattern, ignoreCase) {
        var rxp = "";
        var c = null;
        for (var i = 0; i < pattern.length; i++) {
            c = pattern.charAt(i);
            switch (c) {
              case "\\":
                rxp += c;
                i++;
                rxp += pattern.charAt(i);
                break;
              case "$":
              case "^":
              case "/":
              case "+":
              case ".":
              case "|":
              case "(":
              case ")":
              case "{":
              case "}":
              case "[":
              case "]":
                rxp += "\\";
              default:
                rxp += c;
            }
        }
        rxp = "^" + rxp + "$";
        if (ignoreCase) {
            return new RegExp(rxp, "mi");
        } else {
            return new RegExp(rxp, "m");
        }
    }, updateState:function () {
        this.button.set("disabled", this.get("disabled"));
    }, destroy:function () {
        this.inherited(arguments);
        if (this._promDialogTimeout) {
            clearTimeout(this._promDialogTimeout);
            this._promDialogTimeout = null;
            dijit.popup.close(this._promDialog);
        }
        if (this._frToolbar) {
            this._frToolbar.destroyRecursive();
            this._frToolbar = null;
        }
        if (this._promDialog) {
            this._promDialog.destroyRecursive();
            this._promDialog = null;
        }
    }});
    FindReplace._FindReplaceCloseBox = FindReplaceCloseBox;
    FindReplace._FindReplaceTextBox = FindReplaceTextBox;
    FindReplace._FindReplaceCheckBox = FindReplaceCheckBox;
    FindReplace._FindReplaceToolbar = FindReplaceToolbar;
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        var name = o.args.name.toLowerCase();
        if (name === "findreplace") {
            o.plugin = new FindReplace({});
        }
    });
    return FindReplace;
});

