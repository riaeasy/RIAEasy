//>>built

define("dojox/editor/plugins/NormalizeIndentOutdent", ["dojo", "dijit", "dojox", "dijit/_editor/_Plugin", "dojo/_base/declare"], function (dojo, dijit, dojox, _Plugin) {
    var NormalizeIndentOutdent = dojo.declare("dojox.editor.plugins.NormalizeIndentOutdent", _Plugin, {indentBy:40, indentUnits:"px", setEditor:function (editor) {
        this.editor = editor;
        editor._indentImpl = dojo.hitch(this, this._indentImpl);
        editor._outdentImpl = dojo.hitch(this, this._outdentImpl);
        if (!editor._indentoutdent_queryCommandEnabled) {
            editor._indentoutdent_queryCommandEnabled = editor.queryCommandEnabled;
        }
        editor.queryCommandEnabled = dojo.hitch(this, this._queryCommandEnabled);
        editor.customUndo = true;
    }, _queryCommandEnabled:function (command) {
        var c = command.toLowerCase();
        var ed, sel, range, node, tag, prevNode;
        var style = "marginLeft";
        if (!this._isLtr()) {
            style = "marginRight";
        }
        if (c === "indent") {
            ed = this.editor;
            sel = dijit.range.getSelection(ed.window);
            if (sel && sel.rangeCount > 0) {
                range = sel.getRangeAt(0);
                node = range.startContainer;
                while (node && node !== ed.document && node !== ed.editNode) {
                    tag = this._getTagName(node);
                    if (tag === "li") {
                        prevNode = node.previousSibling;
                        while (prevNode && prevNode.nodeType !== 1) {
                            prevNode = prevNode.previousSibling;
                        }
                        if (prevNode && this._getTagName(prevNode) === "li") {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        if (this._isIndentableElement(tag)) {
                            return true;
                        }
                    }
                    node = node.parentNode;
                }
                if (this._isRootInline(range.startContainer)) {
                    return true;
                }
            }
        } else {
            if (c === "outdent") {
                ed = this.editor;
                sel = dijit.range.getSelection(ed.window);
                if (sel && sel.rangeCount > 0) {
                    range = sel.getRangeAt(0);
                    node = range.startContainer;
                    while (node && node !== ed.document && node !== ed.editNode) {
                        tag = this._getTagName(node);
                        if (tag === "li") {
                            return this.editor._indentoutdent_queryCommandEnabled(command);
                        } else {
                            if (this._isIndentableElement(tag)) {
                                var cIndent = node.style ? node.style[style] : "";
                                if (cIndent) {
                                    cIndent = this._convertIndent(cIndent);
                                    if (cIndent / this.indentBy >= 1) {
                                        return true;
                                    }
                                }
                                return false;
                            }
                        }
                        node = node.parentNode;
                    }
                    if (this._isRootInline(range.startContainer)) {
                        return false;
                    }
                }
            } else {
                return this.editor._indentoutdent_queryCommandEnabled(command);
            }
        }
        return false;
    }, _indentImpl:function (html) {
        var ed = this.editor;
        var sel = dijit.range.getSelection(ed.window);
        if (sel && sel.rangeCount > 0) {
            var range = sel.getRangeAt(0);
            var node = range.startContainer;
            var tag, start, end, div;
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
                        div = ed.document.createElement("div");
                        dojo.place(div, start, "after");
                        div.appendChild(start);
                        end = div.nextSibling;
                        while (end && (this._isTextElement(end) || (end.nodeType === 1 && this._isInlineFormat(this._getTagName(end))))) {
                            div.appendChild(end);
                            end = div.nextSibling;
                        }
                        this._indentElement(div);
                        ed._sCall("selectElementChildren", [div]);
                        ed._sCall("collapse", [true]);
                    }
                } else {
                    while (node && node !== ed.document && node !== ed.editNode) {
                        tag = this._getTagName(node);
                        if (tag === "li") {
                            this._indentList(node);
                            return;
                        } else {
                            if (this._isIndentableElement(tag)) {
                                this._indentElement(node);
                                return;
                            }
                        }
                        node = node.parentNode;
                    }
                }
            } else {
                var curNode;
                start = range.startContainer;
                end = range.endContainer;
                while (start && this._isTextElement(start) && start.parentNode !== ed.editNode) {
                    start = start.parentNode;
                }
                while (end && this._isTextElement(end) && end.parentNode !== ed.editNode) {
                    end = end.parentNode;
                }
                if (end === ed.editNode || end === ed.document.body) {
                    curNode = start;
                    while (curNode.nextSibling && ed._sCall("inSelection", [curNode])) {
                        curNode = curNode.nextSibling;
                    }
                    end = curNode;
                    if (end === ed.editNode || end === ed.document.body) {
                        tag = this._getTagName(start);
                        if (tag === "li") {
                            this._indentList(start);
                        } else {
                            if (this._isIndentableElement(tag)) {
                                this._indentElement(start);
                            } else {
                                if (this._isTextElement(start) || this._isInlineFormat(tag)) {
                                    div = ed.document.createElement("div");
                                    dojo.place(div, start, "after");
                                    var next = start;
                                    while (next && (this._isTextElement(next) || (next.nodeType === 1 && this._isInlineFormat(this._getTagName(next))))) {
                                        div.appendChild(next);
                                        next = div.nextSibling;
                                    }
                                    this._indentElement(div);
                                }
                            }
                        }
                        return;
                    }
                }
                end = end.nextSibling;
                curNode = start;
                while (curNode && curNode !== end) {
                    if (curNode.nodeType === 1) {
                        tag = this._getTagName(curNode);
                        if (dojo.isIE) {
                            if (tag === "p" && this._isEmpty(curNode)) {
                                curNode = curNode.nextSibling;
                                continue;
                            }
                        }
                        if (tag === "li") {
                            if (div) {
                                if (this._isEmpty(div)) {
                                    div.parentNode.removeChild(div);
                                } else {
                                    this._indentElement(div);
                                }
                                div = null;
                            }
                            this._indentList(curNode);
                        } else {
                            if (!this._isInlineFormat(tag) && this._isIndentableElement(tag)) {
                                if (div) {
                                    if (this._isEmpty(div)) {
                                        div.parentNode.removeChild(div);
                                    } else {
                                        this._indentElement(div);
                                    }
                                    div = null;
                                }
                                curNode = this._indentElement(curNode);
                            } else {
                                if (this._isInlineFormat(tag)) {
                                    if (!div) {
                                        div = ed.document.createElement("div");
                                        dojo.place(div, curNode, "after");
                                        div.appendChild(curNode);
                                        curNode = div;
                                    } else {
                                        div.appendChild(curNode);
                                        curNode = div;
                                    }
                                }
                            }
                        }
                    } else {
                        if (this._isTextElement(curNode)) {
                            if (!div) {
                                div = ed.document.createElement("div");
                                dojo.place(div, curNode, "after");
                                div.appendChild(curNode);
                                curNode = div;
                            } else {
                                div.appendChild(curNode);
                                curNode = div;
                            }
                        }
                    }
                    curNode = curNode.nextSibling;
                }
                if (div) {
                    if (this._isEmpty(div)) {
                        div.parentNode.removeChild(div);
                    } else {
                        this._indentElement(div);
                    }
                    div = null;
                }
            }
        }
    }, _indentElement:function (node) {
        var style = "marginLeft";
        if (!this._isLtr()) {
            style = "marginRight";
        }
        var tag = this._getTagName(node);
        if (tag === "ul" || tag === "ol") {
            var div = this.editor.document.createElement("div");
            dojo.place(div, node, "after");
            div.appendChild(node);
            node = div;
        }
        var cIndent = node.style ? node.style[style] : "";
        if (cIndent) {
            cIndent = this._convertIndent(cIndent);
            cIndent = (parseInt(cIndent, 10) + this.indentBy) + this.indentUnits;
        } else {
            cIndent = this.indentBy + this.indentUnits;
        }
        dojo.style(node, style, cIndent);
        return node;
    }, _outdentElement:function (node) {
        var style = "marginLeft";
        if (!this._isLtr()) {
            style = "marginRight";
        }
        var cIndent = node.style ? node.style[style] : "";
        if (cIndent) {
            cIndent = this._convertIndent(cIndent);
            if (cIndent - this.indentBy > 0) {
                cIndent = (parseInt(cIndent, 10) - this.indentBy) + this.indentUnits;
            } else {
                cIndent = "";
            }
            dojo.style(node, style, cIndent);
        }
    }, _outdentImpl:function (html) {
        var ed = this.editor;
        var sel = dijit.range.getSelection(ed.window);
        if (sel && sel.rangeCount > 0) {
            var range = sel.getRangeAt(0);
            var node = range.startContainer;
            var tag;
            if (range.startContainer === range.endContainer) {
                while (node && node !== ed.document && node !== ed.editNode) {
                    tag = this._getTagName(node);
                    if (tag === "li") {
                        return this._outdentList(node);
                    } else {
                        if (this._isIndentableElement(tag)) {
                            return this._outdentElement(node);
                        }
                    }
                    node = node.parentNode;
                }
                ed.document.execCommand("outdent", false, html);
            } else {
                var start = range.startContainer;
                var end = range.endContainer;
                while (start && start.nodeType === 3) {
                    start = start.parentNode;
                }
                while (end && end.nodeType === 3) {
                    end = end.parentNode;
                }
                end = end.nextSibling;
                var curNode = start;
                while (curNode && curNode !== end) {
                    if (curNode.nodeType === 1) {
                        tag = this._getTagName(curNode);
                        if (tag === "li") {
                            this._outdentList(curNode);
                        } else {
                            if (this._isIndentableElement(tag)) {
                                this._outdentElement(curNode);
                            }
                        }
                    }
                    curNode = curNode.nextSibling;
                }
            }
        }
        return null;
    }, _indentList:function (listItem) {
        var ed = this.editor;
        var newList, li;
        var listContainer = listItem.parentNode;
        var prevTag = listItem.previousSibling;
        while (prevTag && prevTag.nodeType !== 1) {
            prevTag = prevTag.previousSibling;
        }
        var type = null;
        var tg = this._getTagName(listContainer);
        if (tg === "ol") {
            type = "ol";
        } else {
            if (tg === "ul") {
                type = "ul";
            }
        }
        if (type) {
            if (prevTag && prevTag.tagName.toLowerCase() == "li") {
                var embList;
                if (prevTag.childNodes) {
                    var i;
                    for (i = 0; i < prevTag.childNodes.length; i++) {
                        var n = prevTag.childNodes[i];
                        if (n.nodeType === 3) {
                            if (dojo.trim(n.nodeValue)) {
                                if (embList) {
                                    break;
                                }
                            }
                        } else {
                            if (n.nodeType === 1 && !embList) {
                                if (type === n.tagName.toLowerCase()) {
                                    embList = n;
                                }
                            } else {
                                break;
                            }
                        }
                    }
                }
                if (embList) {
                    embList.appendChild(listItem);
                } else {
                    newList = ed.document.createElement(type);
                    dojo.style(newList, {paddingTop:"0px", paddingBottom:"0px"});
                    li = ed.document.createElement("li");
                    dojo.style(li, {listStyleImage:"none", listStyleType:"none"});
                    prevTag.appendChild(newList);
                    newList.appendChild(listItem);
                }
                ed._sCall("selectElementChildren", [listItem]);
                ed._sCall("collapse", [true]);
            }
        }
    }, _outdentList:function (listItem) {
        var ed = this.editor;
        var list = listItem.parentNode;
        var type = null;
        var tg = list.tagName ? list.tagName.toLowerCase() : "";
        var li;
        if (tg === "ol") {
            type = "ol";
        } else {
            if (tg === "ul") {
                type = "ul";
            }
        }
        var listParent = list.parentNode;
        var lpTg = this._getTagName(listParent);
        if (lpTg === "li" || lpTg === "ol" || lpTg === "ul") {
            if (lpTg === "ol" || lpTg === "ul") {
                var prevListLi = list.previousSibling;
                while (prevListLi && (prevListLi.nodeType !== 1 || (prevListLi.nodeType === 1 && this._getTagName(prevListLi) !== "li"))) {
                    prevListLi = prevListLi.previousSibling;
                }
                if (prevListLi) {
                    prevListLi.appendChild(list);
                    listParent = prevListLi;
                } else {
                    li = listItem;
                    var firstItem = listItem;
                    while (li.previousSibling) {
                        li = li.previousSibling;
                        if (li.nodeType === 1 && this._getTagName(li) === "li") {
                            firstItem = li;
                        }
                    }
                    if (firstItem !== listItem) {
                        dojo.place(firstItem, list, "before");
                        firstItem.appendChild(list);
                        listParent = firstItem;
                    } else {
                        li = ed.document.createElement("li");
                        dojo.place(li, list, "before");
                        li.appendChild(list);
                        listParent = li;
                    }
                    dojo.style(list, {paddingTop:"0px", paddingBottom:"0px"});
                }
            }
            var prevLi = listItem.previousSibling;
            while (prevLi && prevLi.nodeType !== 1) {
                prevLi = prevLi.previousSibling;
            }
            var nextLi = listItem.nextSibling;
            while (nextLi && nextLi.nodeType !== 1) {
                nextLi = nextLi.nextSibling;
            }
            if (!prevLi) {
                dojo.place(listItem, listParent, "after");
                listItem.appendChild(list);
            } else {
                if (!nextLi) {
                    dojo.place(listItem, listParent, "after");
                } else {
                    var newList = ed.document.createElement(type);
                    dojo.style(newList, {paddingTop:"0px", paddingBottom:"0px"});
                    listItem.appendChild(newList);
                    while (listItem.nextSibling) {
                        newList.appendChild(listItem.nextSibling);
                    }
                    dojo.place(listItem, listParent, "after");
                }
            }
            if (list && this._isEmpty(list)) {
                list.parentNode.removeChild(list);
            }
            if (listParent && this._isEmpty(listParent)) {
                listParent.parentNode.removeChild(listParent);
            }
            ed._sCall("selectElementChildren", [listItem]);
            ed._sCall("collapse", [true]);
        } else {
            ed.document.execCommand("outdent", false, null);
        }
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
    }, _isIndentableElement:function (tag) {
        switch (tag) {
          case "p":
          case "div":
          case "h1":
          case "h2":
          case "h3":
          case "center":
          case "table":
          case "ul":
          case "ol":
            return true;
          default:
            return false;
        }
    }, _convertIndent:function (indent) {
        var pxPerEm = 12;
        indent = indent + "";
        indent = indent.toLowerCase();
        var curUnit = (indent.indexOf("px") > 0) ? "px" : (indent.indexOf("em") > 0) ? "em" : "px";
        indent = indent.replace(/(px;?|em;?)/gi, "");
        if (curUnit === "px") {
            if (this.indentUnits === "em") {
                indent = Math.ceil(indent / pxPerEm);
            }
        } else {
            if (this.indentUnits === "px") {
                indent = indent * pxPerEm;
            }
        }
        return indent;
    }, _isLtr:function () {
        var editDoc = this.editor.document.body;
        var cs = dojo.getComputedStyle(editDoc);
        return cs ? cs.direction == "ltr" : true;
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
    }});
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        var name = o.args.name.toLowerCase();
        if (name === "normalizeindentoutdent") {
            o.plugin = new NormalizeIndentOutdent({indentBy:("indentBy" in o.args) ? (o.args.indentBy > 0 ? o.args.indentBy : 40) : 40, indentUnits:("indentUnits" in o.args) ? (o.args.indentUnits.toLowerCase() == "em" ? "em" : "px") : "px"});
        }
    });
    return NormalizeIndentOutdent;
});

