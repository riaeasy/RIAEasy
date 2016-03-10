//>>built

define("dojox/editor/plugins/Blockquote", ["dojo", "dijit", "dojox", "dijit/_editor/_Plugin", "dijit/form/ToggleButton", "dojo/_base/connect", "dojo/_base/declare", "dojo/i18n", "dojo/i18n!dojox/editor/plugins/nls/Blockquote"], function (dojo, dijit, dojox, _Plugin) {
    var Blockquote = dojo.declare("dojox.editor.plugins.Blockquote", _Plugin, {iconClassPrefix:"dijitAdditionalEditorIcon", _initButton:function () {
        this._nlsResources = dojo.i18n.getLocalization("dojox.editor.plugins", "Blockquote");
        this.button = new dijit.form.ToggleButton({label:this._nlsResources["blockquote"], showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "Blockquote", tabIndex:"-1", onClick:dojo.hitch(this, "_toggleQuote")});
    }, setEditor:function (editor) {
        this.editor = editor;
        this._initButton();
        this.connect(this.editor, "onNormalizedDisplayChanged", "updateState");
        editor.customUndo = true;
    }, _toggleQuote:function (arg) {
        try {
            var ed = this.editor;
            ed.focus();
            var quoteIt = this.button.get("checked");
            var sel = dijit.range.getSelection(ed.window);
            var range, elem, start, end;
            if (sel && sel.rangeCount > 0) {
                range = sel.getRangeAt(0);
            }
            if (range) {
                ed.beginEditing();
                if (quoteIt) {
                    var bq, tag;
                    if (range.startContainer === range.endContainer) {
                        if (this._isRootInline(range.startContainer)) {
                            start = range.startContainer;
                            while (start && start.parentNode !== ed.editNode) {
                                start = start.parentNode;
                            }
                            while (start && start.previousSibling && (this._isTextElement(start) || (start.nodeType === 1 && this._isInlineFormat(this._getTagName(start))))) {
                                start = start.previousSibling;
                            }
                            if (start && start.nodeType === 1 && !this._isInlineFormat(this._getTagName(start))) {
                                start = start.nextSibling;
                            }
                            if (start) {
                                bq = ed.document.createElement("blockquote");
                                dojo.place(bq, start, "after");
                                bq.appendChild(start);
                                end = bq.nextSibling;
                                while (end && (this._isTextElement(end) || (end.nodeType === 1 && this._isInlineFormat(this._getTagName(end))))) {
                                    bq.appendChild(end);
                                    end = bq.nextSibling;
                                }
                            }
                        } else {
                            var node = range.startContainer;
                            while ((this._isTextElement(node) || this._isInlineFormat(this._getTagName(node)) || this._getTagName(node) === "li") && node !== ed.editNode && node !== ed.document.body) {
                                node = node.parentNode;
                            }
                            if (node !== ed.editNode && node !== node.ownerDocument.documentElement) {
                                bq = ed.document.createElement("blockquote");
                                dojo.place(bq, node, "after");
                                bq.appendChild(node);
                            }
                        }
                        if (bq) {
                            ed._sCall("selectElementChildren", [bq]);
                            ed._sCall("collapse", [true]);
                        }
                    } else {
                        var curNode;
                        start = range.startContainer;
                        end = range.endContainer;
                        while (start && this._isTextElement(start) && start.parentNode !== ed.editNode) {
                            start = start.parentNode;
                        }
                        curNode = start;
                        while (curNode.nextSibling && ed._sCall("inSelection", [curNode])) {
                            curNode = curNode.nextSibling;
                        }
                        end = curNode;
                        if (end === ed.editNode || end === ed.document.body) {
                            bq = ed.document.createElement("blockquote");
                            dojo.place(bq, start, "after");
                            tag = this._getTagName(start);
                            if (this._isTextElement(start) || this._isInlineFormat(tag)) {
                                var next = start;
                                while (next && (this._isTextElement(next) || (next.nodeType === 1 && this._isInlineFormat(this._getTagName(next))))) {
                                    bq.appendChild(next);
                                    next = bq.nextSibling;
                                }
                            } else {
                                bq.appendChild(start);
                            }
                            return;
                        }
                        end = end.nextSibling;
                        curNode = start;
                        while (curNode && curNode !== end) {
                            if (curNode.nodeType === 1) {
                                tag = this._getTagName(curNode);
                                if (tag !== "br") {
                                    if (!window.getSelection) {
                                        if (tag === "p" && this._isEmpty(curNode)) {
                                            curNode = curNode.nextSibling;
                                            continue;
                                        }
                                    }
                                    if (this._isInlineFormat(tag)) {
                                        if (!bq) {
                                            bq = ed.document.createElement("blockquote");
                                            dojo.place(bq, curNode, "after");
                                            bq.appendChild(curNode);
                                        } else {
                                            bq.appendChild(curNode);
                                        }
                                        curNode = bq;
                                    } else {
                                        if (bq) {
                                            if (this._isEmpty(bq)) {
                                                bq.parentNode.removeChild(bq);
                                            }
                                        }
                                        bq = ed.document.createElement("blockquote");
                                        dojo.place(bq, curNode, "after");
                                        bq.appendChild(curNode);
                                        curNode = bq;
                                    }
                                }
                            } else {
                                if (this._isTextElement(curNode)) {
                                    if (!bq) {
                                        bq = ed.document.createElement("blockquote");
                                        dojo.place(bq, curNode, "after");
                                        bq.appendChild(curNode);
                                    } else {
                                        bq.appendChild(curNode);
                                    }
                                    curNode = bq;
                                }
                            }
                            curNode = curNode.nextSibling;
                        }
                        if (bq) {
                            if (this._isEmpty(bq)) {
                                bq.parentNode.removeChild(bq);
                            } else {
                                ed._sCall("selectElementChildren", [bq]);
                                ed._sCall("collapse", [true]);
                            }
                            bq = null;
                        }
                    }
                } else {
                    var found = false;
                    if (range.startContainer === range.endContainer) {
                        elem = range.endContainer;
                        while (elem && elem !== ed.editNode && elem !== ed.document.body) {
                            var tg = elem.tagName ? elem.tagName.toLowerCase() : "";
                            if (tg === "blockquote") {
                                found = true;
                                break;
                            }
                            elem = elem.parentNode;
                        }
                        if (found) {
                            var lastChild;
                            while (elem.firstChild) {
                                lastChild = elem.firstChild;
                                dojo.place(lastChild, elem, "before");
                            }
                            elem.parentNode.removeChild(elem);
                            if (lastChild) {
                                ed._sCall("selectElementChildren", [lastChild]);
                                ed._sCall("collapse", [true]);
                            }
                        }
                    } else {
                        start = range.startContainer;
                        end = range.endContainer;
                        while (start && this._isTextElement(start) && start.parentNode !== ed.editNode) {
                            start = start.parentNode;
                        }
                        var selectedNodes = [];
                        var cNode = start;
                        while (cNode && cNode.nextSibling && ed._sCall("inSelection", [cNode])) {
                            if (cNode.parentNode && this._getTagName(cNode.parentNode) === "blockquote") {
                                cNode = cNode.parentNode;
                            }
                            selectedNodes.push(cNode);
                            cNode = cNode.nextSibling;
                        }
                        var bnNodes = this._findBlockQuotes(selectedNodes);
                        while (bnNodes.length) {
                            var bn = bnNodes.pop();
                            if (bn.parentNode) {
                                while (bn.firstChild) {
                                    dojo.place(bn.firstChild, bn, "before");
                                }
                                bn.parentNode.removeChild(bn);
                            }
                        }
                    }
                }
                ed.endEditing();
            }
            ed.onNormalizedDisplayChanged();
        }
        catch (e) {
        }
    }, updateState:function () {
        var ed = this.editor;
        var disabled = this.get("disabled");
        if (!ed || !ed.isLoaded) {
            return;
        }
        if (this.button) {
            this.button.set("disabled", disabled);
            if (disabled) {
                return;
            }
            var elem;
            var found = false;
            var sel = dijit.range.getSelection(ed.window);
            if (sel && sel.rangeCount > 0) {
                var range = sel.getRangeAt(0);
                if (range) {
                    elem = range.endContainer;
                }
            }
            while (elem && elem !== ed.editNode && elem !== ed.document) {
                var tg = elem.tagName ? elem.tagName.toLowerCase() : "";
                if (tg === "blockquote") {
                    found = true;
                    break;
                }
                elem = elem.parentNode;
            }
            this.button.set("checked", found);
        }
    }, _findBlockQuotes:function (nodeList) {
        var bnList = [];
        if (nodeList) {
            var i;
            for (i = 0; i < nodeList.length; i++) {
                var node = nodeList[i];
                if (node.nodeType === 1) {
                    if (this._getTagName(node) === "blockquote") {
                        bnList.push(node);
                    }
                    if (node.childNodes && node.childNodes.length > 0) {
                        bnList = bnList.concat(this._findBlockQuotes(node.childNodes));
                    }
                }
            }
        }
        return bnList;
    }, _getTagName:function (node) {
        var tag = "";
        if (node && node.nodeType === 1) {
            tag = node.tagName ? node.tagName.toLowerCase() : "";
        }
        return tag;
    }, _isRootInline:function (node) {
        var ed = this.editor;
        if (this._isTextElement(node) && node.parentNode === ed.editNode) {
            return true;
        } else {
            if (node.nodeType === 1 && this._isInlineFormat(node) && node.parentNode === ed.editNode) {
                return true;
            } else {
                if (this._isTextElement(node) && this._isInlineFormat(this._getTagName(node.parentNode))) {
                    node = node.parentNode;
                    while (node && node !== ed.editNode && this._isInlineFormat(this._getTagName(node))) {
                        node = node.parentNode;
                    }
                    if (node === ed.editNode) {
                        return true;
                    }
                }
            }
        }
        return false;
    }, _isTextElement:function (node) {
        if (node && node.nodeType === 3 || node.nodeType === 4) {
            return true;
        }
        return false;
    }, _isEmpty:function (node) {
        if (node.childNodes) {
            var empty = true;
            var i;
            for (i = 0; i < node.childNodes.length; i++) {
                var n = node.childNodes[i];
                if (n.nodeType === 1) {
                    if (this._getTagName(n) === "p") {
                        if (!dojo.trim(n.innerHTML)) {
                            continue;
                        }
                    }
                    empty = false;
                    break;
                } else {
                    if (this._isTextElement(n)) {
                        var nv = dojo.trim(n.nodeValue);
                        if (nv && nv !== "&nbsp;" && nv !== "\xa0") {
                            empty = false;
                            break;
                        }
                    } else {
                        empty = false;
                        break;
                    }
                }
            }
            return empty;
        } else {
            return true;
        }
    }, _isInlineFormat:function (tag) {
        switch (tag) {
          case "a":
          case "b":
          case "strong":
          case "s":
          case "strike":
          case "i":
          case "u":
          case "em":
          case "sup":
          case "sub":
          case "span":
          case "font":
          case "big":
          case "cite":
          case "q":
          case "img":
          case "small":
            return true;
          default:
            return false;
        }
    }});
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        var name = o.args.name.toLowerCase();
        if (name === "blockquote") {
            o.plugin = new Blockquote({});
        }
    });
    return Blockquote;
});

