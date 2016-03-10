//>>built

define("dijit/Editor", ["require", "dojo/_base/array", "dojo/_base/declare", "dojo/Deferred", "dojo/i18n", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style", "dojo/keys", "dojo/_base/lang", "dojo/sniff", "dojo/string", "dojo/topic", "./_Container", "./Toolbar", "./ToolbarSeparator", "./layout/_LayoutWidget", "./form/ToggleButton", "./_editor/_Plugin", "./_editor/plugins/EnterKeyHandling", "./_editor/html", "./_editor/range", "./_editor/RichText", "./main", "dojo/i18n!./_editor/nls/commands"], function (require, array, declare, Deferred, i18n, domAttr, domClass, domGeometry, domStyle, keys, lang, has, string, topic, _Container, Toolbar, ToolbarSeparator, _LayoutWidget, ToggleButton, _Plugin, EnterKeyHandling, html, rangeapi, RichText, dijit) {
    var Editor = declare("dijit.Editor", RichText, {plugins:null, extraPlugins:null, constructor:function () {
        if (!lang.isArray(this.plugins)) {
            this.plugins = ["undo", "redo", "|", "cut", "copy", "paste", "|", "bold", "italic", "underline", "strikethrough", "|", "insertOrderedList", "insertUnorderedList", "indent", "outdent", "|", "justifyLeft", "justifyRight", "justifyCenter", "justifyFull", EnterKeyHandling];
        }
        this._plugins = [];
        this._editInterval = this.editActionInterval * 1000;
        if (has("ie") || has("trident")) {
            this.events.push("onBeforeDeactivate");
            this.events.push("onBeforeActivate");
        }
    }, postMixInProperties:function () {
        this.setValueDeferred = new Deferred();
        this.inherited(arguments);
    }, postCreate:function () {
        this.inherited(arguments);
        this._steps = this._steps.slice(0);
        this._undoedSteps = this._undoedSteps.slice(0);
        if (lang.isArray(this.extraPlugins)) {
            this.plugins = this.plugins.concat(this.extraPlugins);
        }
        this.commands = i18n.getLocalization("dijit._editor", "commands", this.lang);
        if (has("webkit")) {
            domStyle.set(this.domNode, "KhtmlUserSelect", "none");
        }
    }, startup:function () {
        this.inherited(arguments);
        if (!this.toolbar) {
            this.toolbar = new Toolbar({ownerDocument:this.ownerDocument, dir:this.dir, lang:this.lang, "aria-label":this.id});
            this.header.appendChild(this.toolbar.domNode);
        }
        array.forEach(this.plugins, this.addPlugin, this);
        this.setValueDeferred.resolve(true);
        domClass.add(this.iframe.parentNode, "dijitEditorIFrameContainer");
        domClass.add(this.iframe, "dijitEditorIFrame");
        domAttr.set(this.iframe, "allowTransparency", true);
        this.toolbar.startup();
        this.onNormalizedDisplayChanged();
    }, destroy:function () {
        array.forEach(this._plugins, function (p) {
            if (p && p.destroy) {
                p.destroy();
            }
        });
        this._plugins = [];
        this.toolbar.destroyRecursive();
        delete this.toolbar;
        this.inherited(arguments);
    }, addPlugin:function (plugin, index) {
        var args = lang.isString(plugin) ? {name:plugin} : lang.isFunction(plugin) ? {ctor:plugin} : plugin;
        if (!args.setEditor) {
            var o = {"args":args, "plugin":null, "editor":this};
            if (args.name) {
                if (_Plugin.registry[args.name]) {
                    o.plugin = _Plugin.registry[args.name](args);
                } else {
                    topic.publish(dijit._scopeName + ".Editor.getPlugin", o);
                }
            }
            if (!o.plugin) {
                try {
                    var pc = args.ctor || lang.getObject(args.name) || require(args.name);
                    if (pc) {
                        o.plugin = new pc(args);
                    }
                }
                catch (e) {
                    throw new Error(this.id + ": cannot find plugin [" + args.name + "]");
                }
            }
            if (!o.plugin) {
                throw new Error(this.id + ": cannot find plugin [" + args.name + "]");
            }
            plugin = o.plugin;
        }
        if (arguments.length > 1) {
            this._plugins[index] = plugin;
        } else {
            this._plugins.push(plugin);
        }
        plugin.setEditor(this);
        if (lang.isFunction(plugin.setToolbar)) {
            plugin.setToolbar(this.toolbar);
        }
    }, resize:function (size) {
        if (size) {
            _LayoutWidget.prototype.resize.apply(this, arguments);
        }
    }, layout:function () {
        var areaHeight = (this._contentBox.h - (this.getHeaderHeight() + this.getFooterHeight() + domGeometry.getPadBorderExtents(this.iframe.parentNode).h + domGeometry.getMarginExtents(this.iframe.parentNode).h));
        this.editingArea.style.height = areaHeight + "px";
        if (this.iframe) {
            this.iframe.style.height = "100%";
        }
        this._layoutMode = true;
    }, _onIEMouseDown:function (e) {
        var outsideClientArea;
        var b = this.document.body;
        var clientWidth = b.clientWidth;
        var clientHeight = b.clientHeight;
        var clientLeft = b.clientLeft;
        var offsetWidth = b.offsetWidth;
        var offsetHeight = b.offsetHeight;
        var offsetLeft = b.offsetLeft;
        if (/^rtl$/i.test(b.dir || "")) {
            if (clientWidth < offsetWidth && e.x > clientWidth && e.x < offsetWidth) {
                outsideClientArea = true;
            }
        } else {
            if (e.x < clientLeft && e.x > offsetLeft) {
                outsideClientArea = true;
            }
        }
        if (!outsideClientArea) {
            if (clientHeight < offsetHeight && e.y > clientHeight && e.y < offsetHeight) {
                outsideClientArea = true;
            }
        }
        if (!outsideClientArea) {
            delete this._cursorToStart;
            delete this._savedSelection;
            if (e.target.tagName == "BODY") {
                this.defer("placeCursorAtEnd");
            }
            this.inherited(arguments);
        }
    }, onBeforeActivate:function () {
        this._restoreSelection();
    }, onBeforeDeactivate:function (e) {
        if (this.customUndo) {
            this.endEditing(true);
        }
        if (e.target.tagName != "BODY") {
            this._saveSelection();
        }
    }, customUndo:true, editActionInterval:3, beginEditing:function (cmd) {
        if (!this._inEditing) {
            this._inEditing = true;
            this._beginEditing(cmd);
        }
        if (this.editActionInterval > 0) {
            if (this._editTimer) {
                this._editTimer.remove();
            }
            this._editTimer = this.defer("endEditing", this._editInterval);
        }
    }, _steps:[], _undoedSteps:[], execCommand:function (cmd) {
        if (this.customUndo && (cmd == "undo" || cmd == "redo")) {
            return this[cmd]();
        } else {
            if (this.customUndo) {
                this.endEditing();
                this._beginEditing();
            }
            var r = this.inherited(arguments);
            if (this.customUndo) {
                this._endEditing();
            }
            return r;
        }
    }, _pasteImpl:function () {
        return this._clipboardCommand("paste");
    }, _cutImpl:function () {
        return this._clipboardCommand("cut");
    }, _copyImpl:function () {
        return this._clipboardCommand("copy");
    }, _clipboardCommand:function (cmd) {
        var r;
        try {
            r = this.document.execCommand(cmd, false, null);
            if (has("webkit") && !r) {
                throw {code:1011};
            }
        }
        catch (e) {
            if (e.code == 1011 || (e.code == 9 && has("opera"))) {
                var sub = string.substitute, accel = {cut:"X", copy:"C", paste:"V"};
                alert(sub(this.commands.systemShortcut, [this.commands[cmd], sub(this.commands[has("mac") ? "appleKey" : "ctrlKey"], [accel[cmd]])]));
            }
            r = false;
        }
        return r;
    }, queryCommandEnabled:function (cmd) {
        if (this.customUndo && (cmd == "undo" || cmd == "redo")) {
            return cmd == "undo" ? (this._steps.length > 1) : (this._undoedSteps.length > 0);
        } else {
            return this.inherited(arguments);
        }
    }, _moveToBookmark:function (b) {
        var bookmark = b.mark;
        var mark = b.mark;
        var col = b.isCollapsed;
        var r, sNode, eNode, sel;
        if (mark) {
            if (has("ie") < 9 || (has("ie") === 9 && has("quirks"))) {
                if (lang.isArray(mark)) {
                    bookmark = [];
                    array.forEach(mark, function (n) {
                        bookmark.push(rangeapi.getNode(n, this.editNode));
                    }, this);
                    this.selection.moveToBookmark({mark:bookmark, isCollapsed:col});
                } else {
                    if (mark.startContainer && mark.endContainer) {
                        sel = rangeapi.getSelection(this.window);
                        if (sel && sel.removeAllRanges) {
                            sel.removeAllRanges();
                            r = rangeapi.create(this.window);
                            sNode = rangeapi.getNode(mark.startContainer, this.editNode);
                            eNode = rangeapi.getNode(mark.endContainer, this.editNode);
                            if (sNode && eNode) {
                                r.setStart(sNode, mark.startOffset);
                                r.setEnd(eNode, mark.endOffset);
                                sel.addRange(r);
                            }
                        }
                    }
                }
            } else {
                sel = rangeapi.getSelection(this.window);
                if (sel && sel.removeAllRanges) {
                    sel.removeAllRanges();
                    r = rangeapi.create(this.window);
                    sNode = rangeapi.getNode(mark.startContainer, this.editNode);
                    eNode = rangeapi.getNode(mark.endContainer, this.editNode);
                    if (sNode && eNode) {
                        r.setStart(sNode, mark.startOffset);
                        r.setEnd(eNode, mark.endOffset);
                        sel.addRange(r);
                    }
                }
            }
        }
    }, _changeToStep:function (from, to) {
        this.setValue(to.text);
        var b = to.bookmark;
        if (!b) {
            return;
        }
        this._moveToBookmark(b);
    }, undo:function () {
        var ret = false;
        if (!this._undoRedoActive) {
            this._undoRedoActive = true;
            this.endEditing(true);
            var s = this._steps.pop();
            if (s && this._steps.length > 0) {
                this.focus();
                this._changeToStep(s, this._steps[this._steps.length - 1]);
                this._undoedSteps.push(s);
                this.onDisplayChanged();
                delete this._undoRedoActive;
                ret = true;
            }
            delete this._undoRedoActive;
        }
        return ret;
    }, redo:function () {
        var ret = false;
        if (!this._undoRedoActive) {
            this._undoRedoActive = true;
            this.endEditing(true);
            var s = this._undoedSteps.pop();
            if (s && this._steps.length > 0) {
                this.focus();
                this._changeToStep(this._steps[this._steps.length - 1], s);
                this._steps.push(s);
                this.onDisplayChanged();
                ret = true;
            }
            delete this._undoRedoActive;
        }
        return ret;
    }, endEditing:function (ignore_caret) {
        if (this._editTimer) {
            this._editTimer = this._editTimer.remove();
        }
        if (this._inEditing) {
            this._endEditing(ignore_caret);
            this._inEditing = false;
        }
    }, _getBookmark:function () {
        var b = this.selection.getBookmark();
        var tmp = [];
        if (b && b.mark) {
            var mark = b.mark;
            if (has("ie") < 9 || (has("ie") === 9 && has("quirks"))) {
                var sel = rangeapi.getSelection(this.window);
                if (!lang.isArray(mark)) {
                    if (sel) {
                        var range;
                        if (sel.rangeCount) {
                            range = sel.getRangeAt(0);
                        }
                        if (range) {
                            b.mark = range.cloneRange();
                        } else {
                            b.mark = this.selection.getBookmark();
                        }
                    }
                } else {
                    array.forEach(b.mark, function (n) {
                        tmp.push(rangeapi.getIndex(n, this.editNode).o);
                    }, this);
                    b.mark = tmp;
                }
            }
            try {
                if (b.mark && b.mark.startContainer) {
                    tmp = rangeapi.getIndex(b.mark.startContainer, this.editNode).o;
                    b.mark = {startContainer:tmp, startOffset:b.mark.startOffset, endContainer:b.mark.endContainer === b.mark.startContainer ? tmp : rangeapi.getIndex(b.mark.endContainer, this.editNode).o, endOffset:b.mark.endOffset};
                }
            }
            catch (e) {
                b.mark = null;
            }
        }
        return b;
    }, _beginEditing:function () {
        if (this._steps.length === 0) {
            this._steps.push({"text":html.getChildrenHtml(this.editNode), "bookmark":this._getBookmark()});
        }
    }, _endEditing:function () {
        var v = html.getChildrenHtml(this.editNode);
        this._undoedSteps = [];
        this._steps.push({text:v, bookmark:this._getBookmark()});
    }, onKeyDown:function (e) {
        if (!has("ie") && !this.iframe && e.keyCode == keys.TAB && !this.tabIndent) {
            this._saveSelection();
        }
        if (!this.customUndo) {
            this.inherited(arguments);
            return;
        }
        var k = e.keyCode;
        if (e.ctrlKey && !e.shiftKey && !e.altKey) {
            if (k == 90 || k == 122) {
                e.stopPropagation();
                e.preventDefault();
                this.undo();
                return;
            } else {
                if (k == 89 || k == 121) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.redo();
                    return;
                }
            }
        }
        this.inherited(arguments);
        switch (k) {
          case keys.ENTER:
          case keys.BACKSPACE:
          case keys.DELETE:
            this.beginEditing();
            break;
          case 88:
          case 86:
            if (e.ctrlKey && !e.altKey && !e.metaKey) {
                this.endEditing();
                if (e.keyCode == 88) {
                    this.beginEditing("cut");
                } else {
                    this.beginEditing("paste");
                }
                this.defer("endEditing", 1);
                break;
            }
          default:
            if (!e.ctrlKey && !e.altKey && !e.metaKey && (e.keyCode < keys.F1 || e.keyCode > keys.F15)) {
                this.beginEditing();
                break;
            }
          case keys.ALT:
            this.endEditing();
            break;
          case keys.UP_ARROW:
          case keys.DOWN_ARROW:
          case keys.LEFT_ARROW:
          case keys.RIGHT_ARROW:
          case keys.HOME:
          case keys.END:
          case keys.PAGE_UP:
          case keys.PAGE_DOWN:
            this.endEditing(true);
            break;
          case keys.CTRL:
          case keys.SHIFT:
          case keys.TAB:
            break;
        }
    }, _onBlur:function () {
        this.inherited(arguments);
        this.endEditing(true);
    }, _saveSelection:function () {
        try {
            this._savedSelection = this._getBookmark();
        }
        catch (e) {
        }
    }, _restoreSelection:function () {
        if (this._savedSelection) {
            delete this._cursorToStart;
            if (this.selection.isCollapsed()) {
                this._moveToBookmark(this._savedSelection);
            }
            delete this._savedSelection;
        }
    }, onClick:function () {
        this.endEditing(true);
        this.inherited(arguments);
    }, replaceValue:function (html) {
        if (!this.customUndo) {
            this.inherited(arguments);
        } else {
            if (this.isClosed) {
                this.setValue(html);
            } else {
                this.beginEditing();
                if (!html) {
                    html = "&#160;";
                }
                this.setValue(html);
                this.endEditing();
            }
        }
    }, _setDisabledAttr:function (value) {
        this.setValueDeferred.then(lang.hitch(this, function () {
            if ((!this.disabled && value) || (!this._buttonEnabledPlugins && value)) {
                array.forEach(this._plugins, function (p) {
                    p.set("disabled", true);
                });
            } else {
                if (this.disabled && !value) {
                    array.forEach(this._plugins, function (p) {
                        p.set("disabled", false);
                    });
                }
            }
        }));
        this.inherited(arguments);
    }, _setStateClass:function () {
        try {
            this.inherited(arguments);
            if (this.document && this.document.body) {
                domStyle.set(this.document.body, "color", domStyle.get(this.iframe, "color"));
            }
        }
        catch (e) {
        }
    }});
    function simplePluginFactory(args) {
        return new _Plugin({command:args.name});
    }
    function togglePluginFactory(args) {
        return new _Plugin({buttonClass:ToggleButton, command:args.name});
    }
    lang.mixin(_Plugin.registry, {"undo":simplePluginFactory, "redo":simplePluginFactory, "cut":simplePluginFactory, "copy":simplePluginFactory, "paste":simplePluginFactory, "insertOrderedList":simplePluginFactory, "insertUnorderedList":simplePluginFactory, "indent":simplePluginFactory, "outdent":simplePluginFactory, "justifyCenter":simplePluginFactory, "justifyFull":simplePluginFactory, "justifyLeft":simplePluginFactory, "justifyRight":simplePluginFactory, "delete":simplePluginFactory, "selectAll":simplePluginFactory, "removeFormat":simplePluginFactory, "unlink":simplePluginFactory, "insertHorizontalRule":simplePluginFactory, "bold":togglePluginFactory, "italic":togglePluginFactory, "underline":togglePluginFactory, "strikethrough":togglePluginFactory, "subscript":togglePluginFactory, "superscript":togglePluginFactory, "|":function () {
        return new _Plugin({setEditor:function (editor) {
            this.editor = editor;
            this.button = new ToolbarSeparator({ownerDocument:editor.ownerDocument});
        }});
    }});
    return Editor;
});

