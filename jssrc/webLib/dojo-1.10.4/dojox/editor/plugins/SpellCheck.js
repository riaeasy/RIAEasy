//>>built

define("dojox/editor/plugins/SpellCheck", ["dojo", "dijit", "dojo/io/script", "dijit/popup", "dijit/_Widget", "dijit/_Templated", "dijit/_editor/_Plugin", "dijit/form/TextBox", "dijit/form/DropDownButton", "dijit/TooltipDialog", "dijit/form/MultiSelect", "dijit/Menu", "dojo/i18n!dojox/editor/plugins/nls/SpellCheck"], function (dojo, dijit, script, popup, _Widget, _Templated, _Plugin) {
    dojo.experimental("dojox.editor.plugins.SpellCheck");
    var SpellCheckControl = dojo.declare("dojox.editor.plugins._spellCheckControl", [_Widget, _Templated], {widgetsInTemplate:true, templateString:"<table role='presentation' class='dijitEditorSpellCheckTable'>" + "<tr><td colspan='3' class='alignBottom'><label for='${textId}' id='${textId}_label'>${unfound}</label>" + "<div class='dijitEditorSpellCheckBusyIcon' id='${id}_progressIcon'></div></td></tr>" + "<tr>" + "<td class='dijitEditorSpellCheckBox'><input dojoType='dijit.form.TextBox' required='false' intermediateChanges='true' " + "class='dijitEditorSpellCheckBox' dojoAttachPoint='unfoundTextBox' id='${textId}'/></td>" + "<td><button dojoType='dijit.form.Button' class='blockButton' dojoAttachPoint='skipButton'>${skip}</button></td>" + "<td><button dojoType='dijit.form.Button' class='blockButton' dojoAttachPoint='skipAllButton'>${skipAll}</button></td>" + "</tr>" + "<tr>" + "<td class='alignBottom'><label for='${selectId}'>${suggestions}</td></label>" + "<td colspan='2'><button dojoType='dijit.form.Button' class='blockButton' dojoAttachPoint='toDicButton'>${toDic}</button></td>" + "</tr>" + "<tr>" + "<td>" + "<select dojoType='dijit.form.MultiSelect' id='${selectId}' " + "class='dijitEditorSpellCheckBox listHeight' dojoAttachPoint='suggestionSelect'></select>" + "</td>" + "<td colspan='2'>" + "<button dojoType='dijit.form.Button' class='blockButton' dojoAttachPoint='replaceButton'>${replace}</button>" + "<div class='topMargin'><button dojoType='dijit.form.Button' class='blockButton' " + "dojoAttachPoint='replaceAllButton'>${replaceAll}</button><div>" + "</td>" + "</tr>" + "<tr>" + "<td><div class='topMargin'><button dojoType='dijit.form.Button' dojoAttachPoint='cancelButton'>${cancel}</button></div></td>" + "<td></td>" + "<td></td>" + "</tr>" + "</table>", constructor:function () {
        this.ignoreChange = false;
        this.isChanged = false;
        this.isOpen = false;
        this.closable = true;
    }, postMixInProperties:function () {
        this.id = dijit.getUniqueId(this.declaredClass.replace(/\./g, "_"));
        this.textId = this.id + "_textBox";
        this.selectId = this.id + "_select";
    }, postCreate:function () {
        var select = this.suggestionSelect;
        dojo.removeAttr(select.domNode, "multiple");
        select.addItems = function (items) {
            var _this = this;
            var o = null;
            if (items && items.length > 0) {
                dojo.forEach(items, function (item, i) {
                    o = dojo.create("option", {innerHTML:item, value:item}, _this.domNode);
                    if (i == 0) {
                        o.selected = true;
                    }
                });
            }
        };
        select.removeItems = function () {
            dojo.empty(this.domNode);
        };
        select.deselectAll = function () {
            this.containerNode.selectedIndex = -1;
        };
        this.connect(this, "onKeyPress", "_cancel");
        this.connect(this.unfoundTextBox, "onKeyPress", "_enter");
        this.connect(this.unfoundTextBox, "onChange", "_unfoundTextBoxChange");
        this.connect(this.suggestionSelect, "onKeyPress", "_enter");
        this.connect(this.skipButton, "onClick", "onSkip");
        this.connect(this.skipAllButton, "onClick", "onSkipAll");
        this.connect(this.toDicButton, "onClick", "onAddToDic");
        this.connect(this.replaceButton, "onClick", "onReplace");
        this.connect(this.replaceAllButton, "onClick", "onReplaceAll");
        this.connect(this.cancelButton, "onClick", "onCancel");
    }, onSkip:function () {
    }, onSkipAll:function () {
    }, onAddToDic:function () {
    }, onReplace:function () {
    }, onReplaceAll:function () {
    }, onCancel:function () {
    }, onEnter:function () {
    }, focus:function () {
        this.unfoundTextBox.focus();
    }, _cancel:function (evt) {
        if (evt.keyCode == dojo.keys.ESCAPE) {
            this.onCancel();
            dojo.stopEvent(evt);
        }
    }, _enter:function (evt) {
        if (evt.keyCode == dojo.keys.ENTER) {
            this.onEnter();
            dojo.stopEvent(evt);
        }
    }, _unfoundTextBoxChange:function () {
        var id = this.textId + "_label";
        if (!this.ignoreChange) {
            dojo.byId(id).innerHTML = this["replaceWith"];
            this.isChanged = true;
            this.suggestionSelect.deselectAll();
        } else {
            dojo.byId(id).innerHTML = this["unfound"];
        }
    }, _setUnfoundWordAttr:function (value) {
        value = value || "";
        this.unfoundTextBox.set("value", value);
    }, _getUnfoundWordAttr:function () {
        return this.unfoundTextBox.get("value");
    }, _setSuggestionListAttr:function (values) {
        var select = this.suggestionSelect;
        values = values || [];
        select.removeItems();
        select.addItems(values);
    }, _getSelectedWordAttr:function () {
        var selected = this.suggestionSelect.getSelected();
        if (selected && selected.length > 0) {
            return selected[0].value;
        } else {
            return this.unfoundTextBox.get("value");
        }
    }, _setDisabledAttr:function (disabled) {
        this.skipButton.set("disabled", disabled);
        this.skipAllButton.set("disabled", disabled);
        this.toDicButton.set("disabled", disabled);
        this.replaceButton.set("disabled", disabled);
        this.replaceAllButton.set("disabled", disabled);
    }, _setInProgressAttr:function (show) {
        var id = this.id + "_progressIcon";
        dojo.toggleClass(id, "hidden", !show);
    }});
    var SpellCheckScriptMultiPart = dojo.declare("dojox.editor.plugins._SpellCheckScriptMultiPart", null, {ACTION_QUERY:"query", ACTION_UPDATE:"update", callbackHandle:"callback", maxBufferLength:100, delimiter:" ", label:"response", _timeout:30000, SEC:1000, constructor:function () {
        this.serviceEndPoint = "";
        this._queue = [];
        this.isWorking = false;
        this.exArgs = null;
        this._counter = 0;
    }, send:function (content, action) {
        var _this = this, dt = this.delimiter, mbl = this.maxBufferLength, label = this.label, serviceEndPoint = this.serviceEndPoint, callbackParamName = this.callbackHandle, comms = this.exArgs, timeout = this._timeout, l = 0, r = 0;
        if (!this._result) {
            this._result = [];
        }
        action = action || this.ACTION_QUERY;
        var batchSend = function () {
            var plan = [];
            var plannedSize = 0;
            if (content && content.length > 0) {
                _this.isWorking = true;
                var len = content.length;
                do {
                    l = r + 1;
                    if ((r += mbl) > len) {
                        r = len;
                    } else {
                        while (dt && content.charAt(r) != dt && r <= len) {
                            r++;
                        }
                    }
                    plan.push({l:l, r:r});
                    plannedSize++;
                } while (r < len);
                dojo.forEach(plan, function (item, index) {
                    var jsonpArgs = {url:serviceEndPoint, action:action, timeout:timeout, callbackParamName:callbackParamName, handle:function (response, ioArgs) {
                        if (++_this._counter <= this.size && !(response instanceof Error) && response[label] && dojo.isArray(response[label])) {
                            var offset = this.offset;
                            dojo.forEach(response[label], function (item) {
                                item.offset += offset;
                            });
                            _this._result[this.number] = response[label];
                        }
                        if (_this._counter == this.size) {
                            _this._finalizeCollection(this.action);
                            _this.isWorking = false;
                            if (_this._queue.length > 0) {
                                (_this._queue.shift())();
                            }
                        }
                    }};
                    jsonpArgs.content = comms ? dojo.mixin(comms, {action:action, content:content.substring(item.l - 1, item.r)}) : {action:action, content:content.substring(item.l - 1, item.r)};
                    jsonpArgs.size = plannedSize;
                    jsonpArgs.number = index;
                    jsonpArgs.offset = item.l - 1;
                    dojo.io.script.get(jsonpArgs);
                });
            }
        };
        if (!_this.isWorking) {
            batchSend();
        } else {
            _this._queue.push(batchSend);
        }
    }, _finalizeCollection:function (action) {
        var result = this._result, len = result.length;
        for (var i = 0; i < len; i++) {
            var temp = result.shift();
            result = result.concat(temp);
        }
        if (action == this.ACTION_QUERY) {
            this.onLoad(result);
        }
        this._counter = 0;
        this._result = [];
    }, onLoad:function (data) {
    }, setWaitingTime:function (seconds) {
        this._timeout = seconds * this.SEC;
    }});
    var SpellCheck = dojo.declare("dojox.editor.plugins.SpellCheck", [_Plugin], {url:"", bufferLength:100, interactive:false, timeout:30, button:null, _editor:null, exArgs:null, _cursorSpan:"<span class=\"cursorPlaceHolder\"></span>", _cursorSelector:"cursorPlaceHolder", _incorrectWordsSpan:"<span class='incorrectWordPlaceHolder'>${text}</span>", _ignoredIncorrectStyle:{"cursor":"inherit", "borderBottom":"none", "backgroundColor":"transparent"}, _normalIncorrectStyle:{"cursor":"pointer", "borderBottom":"1px dotted red", "backgroundColor":"yellow"}, _highlightedIncorrectStyle:{"borderBottom":"1px dotted red", "backgroundColor":"#b3b3ff"}, _selector:"incorrectWordPlaceHolder", _maxItemNumber:3, constructor:function () {
        this._spanList = [];
        this._cache = {};
        this._enabled = true;
        this._iterator = 0;
    }, setEditor:function (editor) {
        this._editor = editor;
        this._initButton();
        this._setNetwork();
        this._connectUp();
    }, _initButton:function () {
        var _this = this, strings = (this._strings = dojo.i18n.getLocalization("dojox.editor.plugins", "SpellCheck")), dialogPane = (this._dialog = new dijit.TooltipDialog());
        dialogPane.set("content", (this._dialogContent = new SpellCheckControl({unfound:strings["unfound"], skip:strings["skip"], skipAll:strings["skipAll"], toDic:strings["toDic"], suggestions:strings["suggestions"], replaceWith:strings["replaceWith"], replace:strings["replace"], replaceAll:strings["replaceAll"], cancel:strings["cancel"]})));
        this.button = new dijit.form.DropDownButton({label:strings["widgetLabel"], showLabel:false, iconClass:"dijitEditorSpellCheckIcon", dropDown:dialogPane, id:dijit.getUniqueId(this.declaredClass.replace(/\./g, "_")) + "_dialogPane", closeDropDown:function (focus) {
            if (_this._dialogContent.closable) {
                _this._dialogContent.isOpen = false;
                if (dojo.isIE) {
                    var pos = _this._iterator, list = _this._spanList;
                    if (pos < list.length && pos >= 0) {
                        dojo.style(list[pos], _this._normalIncorrectStyle);
                    }
                }
                if (this._opened) {
                    popup.close(this.dropDown);
                    if (focus) {
                        this.focus();
                    }
                    this._opened = false;
                    this.state = "";
                }
            }
        }});
        _this._dialogContent.isOpen = false;
        dialogPane.domNode.setAttribute("aria-label", this._strings["widgetLabel"]);
    }, _setNetwork:function () {
        var comms = this.exArgs;
        if (!this._service) {
            var service = (this._service = new SpellCheckScriptMultiPart());
            service.serviceEndPoint = this.url;
            service.maxBufferLength = this.bufferLength;
            service.setWaitingTime(this.timeout);
            if (comms) {
                delete comms.name;
                delete comms.url;
                delete comms.interactive;
                delete comms.timeout;
                service.exArgs = comms;
            }
        }
    }, _connectUp:function () {
        var editor = this._editor, cont = this._dialogContent;
        this.connect(this.button, "set", "_disabled");
        this.connect(this._service, "onLoad", "_loadData");
        this.connect(this._dialog, "onOpen", "_openDialog");
        this.connect(editor, "onKeyPress", "_keyPress");
        this.connect(editor, "onLoad", "_submitContent");
        this.connect(cont, "onSkip", "_skip");
        this.connect(cont, "onSkipAll", "_skipAll");
        this.connect(cont, "onAddToDic", "_add");
        this.connect(cont, "onReplace", "_replace");
        this.connect(cont, "onReplaceAll", "_replaceAll");
        this.connect(cont, "onCancel", "_cancel");
        this.connect(cont, "onEnter", "_enter");
        editor.contentPostFilters.push(this._spellCheckFilter);
        dojo.publish(dijit._scopeName + ".Editor.plugin.SpellCheck.getParser", [this]);
        if (!this.parser) {
            console.error("Can not get the word parser!");
        }
    }, _disabled:function (name, disabled) {
        if (name == "disabled") {
            if (disabled) {
                this._iterator = 0;
                this._spanList = [];
            } else {
                if (this.interactive && !disabled && this._service) {
                    this._submitContent(true);
                }
            }
            this._enabled = !disabled;
        }
    }, _keyPress:function (evt) {
        if (this.interactive) {
            var v = 118, V = 86, cc = evt.charCode;
            if (!evt.altKey && cc == dojo.keys.SPACE) {
                this._submitContent();
            } else {
                if ((evt.ctrlKey && (cc == v || cc == V)) || (!evt.ctrlKey && evt.charCode)) {
                    this._submitContent(true);
                }
            }
        }
    }, _loadData:function (data) {
        var cache = this._cache, html = this._editor.get("value"), cont = this._dialogContent;
        this._iterator = 0;
        dojo.forEach(data, function (d) {
            cache[d.text] = d.suggestion;
            cache[d.text].correct = false;
        });
        if (this._enabled) {
            cont.closable = false;
            this._markIncorrectWords(html, cache);
            cont.closable = true;
            if (this._dialogContent.isOpen) {
                this._iterator = -1;
                this._skip();
            }
        }
    }, _openDialog:function () {
        var cont = this._dialogContent;
        cont.ignoreChange = true;
        cont.set("unfoundWord", "");
        cont.set("suggestionList", null);
        cont.set("disabled", true);
        cont.set("inProgress", true);
        cont.isOpen = true;
        cont.closable = false;
        this._submitContent();
        cont.closable = true;
    }, _skip:function (evt, noUpdate) {
        var cont = this._dialogContent, list = this._spanList || [], len = list.length, iter = this._iterator;
        cont.closable = false;
        cont.isChanged = false;
        cont.ignoreChange = true;
        if (!noUpdate && iter >= 0 && iter < len) {
            this._skipWord(iter);
        }
        while (++iter < len && list[iter].edited == true) {
        }
        if (iter < len) {
            this._iterator = iter;
            this._populateDialog(iter);
            this._selectWord(iter);
        } else {
            this._iterator = -1;
            cont.set("unfoundWord", this._strings["msg"]);
            cont.set("suggestionList", null);
            cont.set("disabled", true);
            cont.set("inProgress", false);
        }
        setTimeout(function () {
            if (dojo.isWebKit) {
                cont.skipButton.focus();
            }
            cont.focus();
            cont.ignoreChange = false;
            cont.closable = true;
        }, 0);
    }, _skipAll:function () {
        this._dialogContent.closable = false;
        this._skipWordAll(this._iterator);
        this._skip();
    }, _add:function () {
        var cont = this._dialogContent;
        cont.closable = false;
        cont.isOpen = true;
        this._addWord(this._iterator, cont.get("unfoundWord"));
        this._skip();
    }, _replace:function () {
        var cont = this._dialogContent, iter = this._iterator, targetWord = cont.get("selectedWord");
        cont.closable = false;
        this._replaceWord(iter, targetWord);
        this._skip(null, true);
    }, _replaceAll:function () {
        var cont = this._dialogContent, list = this._spanList, len = list.length, word = list[this._iterator].innerHTML.toLowerCase(), targetWord = cont.get("selectedWord");
        cont.closable = false;
        for (var iter = 0; iter < len; iter++) {
            if (list[iter].innerHTML.toLowerCase() == word) {
                this._replaceWord(iter, targetWord);
            }
        }
        this._skip(null, true);
    }, _cancel:function () {
        this._dialogContent.closable = true;
        this._editor.focus();
    }, _enter:function () {
        if (this._dialogContent.isChanged) {
            this._replace();
        } else {
            this._skip();
        }
    }, _query:function (html) {
        var service = this._service, cache = this._cache, words = this.parser.parseIntoWords(this._html2Text(html)) || [];
        var content = [];
        dojo.forEach(words, function (word) {
            word = word.toLowerCase();
            if (!cache[word]) {
                cache[word] = [];
                cache[word].correct = true;
                content.push(word);
            }
        });
        if (content.length > 0) {
            service.send(content.join(" "));
        } else {
            if (!service.isWorking) {
                this._loadData([]);
            }
        }
    }, _html2Text:function (html) {
        var text = [], isTag = false, len = html ? html.length : 0;
        for (var i = 0; i < len; i++) {
            if (html.charAt(i) == "<") {
                isTag = true;
            }
            if (isTag == true) {
                text.push(" ");
            } else {
                text.push(html.charAt(i));
            }
            if (html.charAt(i) == ">") {
                isTag = false;
            }
        }
        return text.join("");
    }, _getBookmark:function (eValue) {
        var ed = this._editor, cp = this._cursorSpan;
        ed.execCommand("inserthtml", cp);
        var nv = ed.get("value"), index = nv.indexOf(cp), i = -1;
        while (++i < index && eValue.charAt(i) == nv.charAt(i)) {
        }
        return i;
    }, _moveToBookmark:function () {
        var ed = this._editor, cps = dojo.query("." + this._cursorSelector, ed.document), cursorSpan = cps && cps[0];
        if (cursorSpan) {
            ed._sCall("selectElement", [cursorSpan]);
            ed._sCall("collapse", [true]);
            var parent = cursorSpan.parentNode;
            if (parent) {
                parent.removeChild(cursorSpan);
            }
        }
    }, _submitContent:function (delay) {
        if (delay) {
            var _this = this, interval = 3000;
            if (this._delayHandler) {
                clearTimeout(this._delayHandler);
                this._delayHandler = null;
            }
            setTimeout(function () {
                _this._query(_this._editor.get("value"));
            }, interval);
        } else {
            this._query(this._editor.get("value"));
        }
    }, _populateDialog:function (index) {
        var list = this._spanList, cache = this._cache, cont = this._dialogContent;
        cont.set("disabled", false);
        if (index < list.length && list.length > 0) {
            var word = list[index].innerHTML;
            cont.set("unfoundWord", word);
            cont.set("suggestionList", cache[word.toLowerCase()]);
            cont.set("inProgress", false);
        }
    }, _markIncorrectWords:function (html, cache) {
        var _this = this, parser = this.parser, editor = this._editor, spanString = this._incorrectWordsSpan, nstyle = this._normalIncorrectStyle, selector = this._selector, words = parser.parseIntoWords(this._html2Text(html).toLowerCase()), indices = parser.getIndices(), bookmark = this._cursorSpan, bmpos = this._getBookmark(html), spanOffset = "<span class='incorrectWordPlaceHolder'>".length, bmMarked = false, cArray = html.split(""), spanList = null;
        for (var i = words.length - 1; i >= 0; i--) {
            var word = words[i];
            if (cache[word] && !cache[word].correct) {
                var offset = indices[i], len = words[i].length, end = offset + len;
                if (end <= bmpos && !bmMarked) {
                    cArray.splice(bmpos, 0, bookmark);
                    bmMarked = true;
                }
                cArray.splice(offset, len, dojo.string.substitute(spanString, {text:html.substring(offset, end)}));
                if (offset < bmpos && bmpos < end && !bmMarked) {
                    var tmp = cArray[offset].split("");
                    tmp.splice(spanOffset + bmpos - offset, 0, bookmark);
                    cArray[offset] = tmp.join("");
                    bmMarked = true;
                }
            }
        }
        if (!bmMarked) {
            cArray.splice(bmpos, 0, bookmark);
            bmMarked = true;
        }
        editor.set("value", cArray.join(""));
        editor._cursorToStart = false;
        this._moveToBookmark();
        spanList = this._spanList = dojo.query("." + this._selector, editor.document);
        spanList.forEach(function (span, i) {
            span.id = selector + i;
        });
        if (!this.interactive) {
            delete nstyle.cursor;
        }
        spanList.style(nstyle);
        if (this.interactive) {
            if (_this._contextMenu) {
                _this._contextMenu.uninitialize();
                _this._contextMenu = null;
            }
            _this._contextMenu = new dijit.Menu({targetNodeIds:[editor.iframe], bindDomNode:function (node) {
                node = dojo.byId(node);
                var cn;
                var iframe, win;
                if (node.tagName.toLowerCase() == "iframe") {
                    iframe = node;
                    win = this._iframeContentWindow(iframe);
                    cn = dojo.body(editor.document);
                } else {
                    cn = (node == dojo.body() ? dojo.doc.documentElement : node);
                }
                var binding = {node:node, iframe:iframe};
                dojo.attr(node, "_dijitMenu" + this.id, this._bindings.push(binding));
                var doConnects = dojo.hitch(this, function (cn) {
                    return [dojo.connect(cn, this.leftClickToOpen ? "onclick" : "oncontextmenu", this, function (evt) {
                        var target = evt.target, strings = _this._strings;
                        if (dojo.hasClass(target, selector) && !target.edited) {
                            dojo.stopEvent(evt);
                            var maxNumber = _this._maxItemNumber, id = target.id, index = id.substring(selector.length), suggestions = cache[target.innerHTML.toLowerCase()], slen = suggestions.length;
                            this.destroyDescendants();
                            if (slen == 0) {
                                this.addChild(new dijit.MenuItem({label:strings["iMsg"], disabled:true}));
                            } else {
                                for (var i = 0; i < maxNumber && i < slen; i++) {
                                    this.addChild(new dijit.MenuItem({label:suggestions[i], onClick:(function () {
                                        var idx = index, txt = suggestions[i];
                                        return function () {
                                            _this._replaceWord(idx, txt);
                                            editor.focus();
                                        };
                                    })()}));
                                }
                            }
                            this.addChild(new dijit.MenuSeparator());
                            this.addChild(new dijit.MenuItem({label:strings["iSkip"], onClick:function () {
                                _this._skipWord(index);
                                editor.focus();
                            }}));
                            this.addChild(new dijit.MenuItem({label:strings["iSkipAll"], onClick:function () {
                                _this._skipWordAll(index);
                                editor.focus();
                            }}));
                            this.addChild(new dijit.MenuSeparator());
                            this.addChild(new dijit.MenuItem({label:strings["toDic"], onClick:function () {
                                _this._addWord(index);
                                editor.focus();
                            }}));
                            this._scheduleOpen(target, iframe, {x:evt.pageX, y:evt.pageY});
                        }
                    }), dojo.connect(cn, "onkeydown", this, function (evt) {
                        if (evt.shiftKey && evt.keyCode == dojo.keys.F10) {
                            dojo.stopEvent(evt);
                            this._scheduleOpen(evt.target, iframe);
                        }
                    })];
                });
                binding.connects = cn ? doConnects(cn) : [];
                if (iframe) {
                    binding.onloadHandler = dojo.hitch(this, function () {
                        var win = this._iframeContentWindow(iframe), cn = dojo.body(editor.document);
                        binding.connects = doConnects(cn);
                    });
                    if (iframe.addEventListener) {
                        iframe.addEventListener("load", binding.onloadHandler, false);
                    } else {
                        iframe.attachEvent("onload", binding.onloadHandler);
                    }
                }
            }});
        }
    }, _selectWord:function (index) {
        var ed = this._editor, list = this._spanList;
        if (index < list.length && list.length > 0) {
            ed._sCall("selectElement", [list[index]]);
            ed._sCall("collapse", [true]);
            this._findText(list[index].innerHTML, false, false);
            if (dojo.isIE) {
                dojo.style(list[index], this._highlightedIncorrectStyle);
            }
        }
    }, _replaceWord:function (index, text) {
        var list = this._spanList;
        list[index].innerHTML = text;
        dojo.style(list[index], this._ignoredIncorrectStyle);
        list[index].edited = true;
    }, _skipWord:function (index) {
        var list = this._spanList;
        dojo.style(list[index], this._ignoredIncorrectStyle);
        this._cache[list[index].innerHTML.toLowerCase()].correct = true;
        list[index].edited = true;
    }, _skipWordAll:function (index, word) {
        var list = this._spanList, len = list.length;
        word = word || list[index].innerHTML.toLowerCase();
        for (var i = 0; i < len; i++) {
            if (!list[i].edited && list[i].innerHTML.toLowerCase() == word) {
                this._skipWord(i);
            }
        }
    }, _addWord:function (index, word) {
        var service = this._service;
        service.send(word || this._spanList[index].innerHTML.toLowerCase(), service.ACTION_UPDATE);
        this._skipWordAll(index, word);
    }, _findText:function (txt, caseSensitive, backwards) {
        var ed = this._editor, win = ed.window, found = false;
        if (txt) {
            if (win.find) {
                found = win.find(txt, caseSensitive, backwards, false, false, false, false);
            } else {
                var doc = ed.document;
                if (doc.selection) {
                    this._editor.focus();
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
    }, _spellCheckFilter:function (value) {
        var regText = /<span class=["']incorrectWordPlaceHolder["'].*?>(.*?)<\/span>/g;
        return value.replace(regText, "$1");
    }});
    SpellCheck._SpellCheckControl = SpellCheckControl;
    SpellCheck._SpellCheckScriptMultiPart = SpellCheckScriptMultiPart;
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        var name = o.args.name.toLowerCase();
        if (name === "spellcheck") {
            o.plugin = new SpellCheck({url:("url" in o.args) ? o.args.url : "", interactive:("interactive" in o.args) ? o.args.interactive : false, bufferLength:("bufferLength" in o.args) ? o.args.bufferLength : 100, timeout:("timeout" in o.args) ? o.args.timeout : 30, exArgs:o.args});
        }
    });
    return SpellCheck;
});

