//>>built

define("dijit/_editor/plugins/EnterKeyHandling", ["dojo/_base/declare", "dojo/dom-construct", "dojo/keys", "dojo/_base/lang", "dojo/on", "dojo/sniff", "dojo/_base/window", "dojo/window", "../_Plugin", "../RichText", "../range"], function (declare, domConstruct, keys, lang, on, has, win, winUtils, _Plugin, RichText, rangeapi) {
    return declare("dijit._editor.plugins.EnterKeyHandling", _Plugin, {blockNodeForEnter:"BR", constructor:function (args) {
        if (args) {
            if ("blockNodeForEnter" in args) {
                args.blockNodeForEnter = args.blockNodeForEnter.toUpperCase();
            }
            lang.mixin(this, args);
        }
    }, setEditor:function (editor) {
        if (this.editor === editor) {
            return;
        }
        this.editor = editor;
        if (this.blockNodeForEnter == "BR") {
            this.editor.customUndo = true;
            editor.onLoadDeferred.then(lang.hitch(this, function (d) {
                this.own(on(editor.document, "keydown", lang.hitch(this, function (e) {
                    if (e.keyCode == keys.ENTER) {
                        var ne = lang.mixin({}, e);
                        ne.shiftKey = true;
                        if (!this.handleEnterKey(ne)) {
                            e.stopPropagation();
                            e.preventDefault();
                        }
                    }
                })));
                if (has("ie") >= 9 && has("ie") <= 10) {
                    this.own(on(editor.document, "paste", lang.hitch(this, function (e) {
                        setTimeout(lang.hitch(this, function () {
                            var r = this.editor.document.selection.createRange();
                            r.move("character", -1);
                            r.select();
                            r.move("character", 1);
                            r.select();
                        }), 0);
                    })));
                }
                return d;
            }));
        } else {
            if (this.blockNodeForEnter) {
                var h = lang.hitch(this, "handleEnterKey");
                editor.addKeyHandler(13, 0, 0, h);
                editor.addKeyHandler(13, 0, 1, h);
                this.own(this.editor.on("KeyPressed", lang.hitch(this, "onKeyPressed")));
            }
        }
    }, onKeyPressed:function () {
        if (this._checkListLater) {
            if (this.editor.selection.isCollapsed()) {
                var liparent = this.editor.selection.getAncestorElement("LI");
                if (!liparent) {
                    RichText.prototype.execCommand.call(this.editor, "formatblock", this.blockNodeForEnter);
                    var block = this.editor.selection.getAncestorElement(this.blockNodeForEnter);
                    if (block) {
                        block.innerHTML = this.bogusHtmlContent;
                        if (has("ie") <= 9) {
                            var r = this.editor.document.selection.createRange();
                            r.move("character", -1);
                            r.select();
                        }
                    } else {
                        console.error("onKeyPressed: Cannot find the new block node");
                    }
                } else {
                    if (has("mozilla")) {
                        if (liparent.parentNode.parentNode.nodeName == "LI") {
                            liparent = liparent.parentNode.parentNode;
                        }
                    }
                    var fc = liparent.firstChild;
                    if (fc && fc.nodeType == 1 && (fc.nodeName == "UL" || fc.nodeName == "OL")) {
                        liparent.insertBefore(fc.ownerDocument.createTextNode("\xa0"), fc);
                        var newrange = rangeapi.create(this.editor.window);
                        newrange.setStart(liparent.firstChild, 0);
                        var selection = rangeapi.getSelection(this.editor.window, true);
                        selection.removeAllRanges();
                        selection.addRange(newrange);
                    }
                }
            }
            this._checkListLater = false;
        }
        if (this._pressedEnterInBlock) {
            if (this._pressedEnterInBlock.previousSibling) {
                this.removeTrailingBr(this._pressedEnterInBlock.previousSibling);
            }
            delete this._pressedEnterInBlock;
        }
    }, bogusHtmlContent:"&#160;", blockNodes:/^(?:P|H1|H2|H3|H4|H5|H6|LI)$/, handleEnterKey:function (e) {
        var selection, range, newrange, startNode, endNode, brNode, doc = this.editor.document, br, rs, txt;
        if (e.shiftKey) {
            var parent = this.editor.selection.getParentElement();
            var header = rangeapi.getAncestor(parent, this.blockNodes);
            if (header) {
                if (header.tagName == "LI") {
                    return true;
                }
                selection = rangeapi.getSelection(this.editor.window);
                range = selection.getRangeAt(0);
                if (!range.collapsed) {
                    range.deleteContents();
                    selection = rangeapi.getSelection(this.editor.window);
                    range = selection.getRangeAt(0);
                }
                if (rangeapi.atBeginningOfContainer(header, range.startContainer, range.startOffset)) {
                    br = doc.createElement("br");
                    newrange = rangeapi.create(this.editor.window);
                    header.insertBefore(br, header.firstChild);
                    newrange.setStartAfter(br);
                    selection.removeAllRanges();
                    selection.addRange(newrange);
                } else {
                    if (rangeapi.atEndOfContainer(header, range.startContainer, range.startOffset)) {
                        newrange = rangeapi.create(this.editor.window);
                        br = doc.createElement("br");
                        header.appendChild(br);
                        header.appendChild(doc.createTextNode("\xa0"));
                        newrange.setStart(header.lastChild, 0);
                        selection.removeAllRanges();
                        selection.addRange(newrange);
                    } else {
                        rs = range.startContainer;
                        if (rs && rs.nodeType == 3) {
                            txt = rs.nodeValue;
                            startNode = doc.createTextNode(txt.substring(0, range.startOffset));
                            endNode = doc.createTextNode(txt.substring(range.startOffset));
                            brNode = doc.createElement("br");
                            if (endNode.nodeValue == "" && has("webkit")) {
                                endNode = doc.createTextNode("\xa0");
                            }
                            domConstruct.place(startNode, rs, "after");
                            domConstruct.place(brNode, startNode, "after");
                            domConstruct.place(endNode, brNode, "after");
                            domConstruct.destroy(rs);
                            newrange = rangeapi.create(this.editor.window);
                            newrange.setStart(endNode, 0);
                            selection.removeAllRanges();
                            selection.addRange(newrange);
                            return false;
                        }
                        return true;
                    }
                }
            } else {
                selection = rangeapi.getSelection(this.editor.window);
                if (selection.rangeCount) {
                    range = selection.getRangeAt(0);
                    if (range && range.startContainer) {
                        if (!range.collapsed) {
                            range.deleteContents();
                            selection = rangeapi.getSelection(this.editor.window);
                            range = selection.getRangeAt(0);
                        }
                        rs = range.startContainer;
                        if (rs && rs.nodeType == 3) {
                            var offset = range.startOffset;
                            if (rs.length < offset) {
                                ret = this._adjustNodeAndOffset(rs, offset);
                                rs = ret.node;
                                offset = ret.offset;
                            }
                            txt = rs.nodeValue;
                            startNode = doc.createTextNode(txt.substring(0, offset));
                            endNode = doc.createTextNode(txt.substring(offset));
                            brNode = doc.createElement("br");
                            if (!endNode.length) {
                                endNode = doc.createTextNode("\xa0");
                            }
                            if (startNode.length) {
                                domConstruct.place(startNode, rs, "after");
                            } else {
                                startNode = rs;
                            }
                            domConstruct.place(brNode, startNode, "after");
                            domConstruct.place(endNode, brNode, "after");
                            domConstruct.destroy(rs);
                            newrange = rangeapi.create(this.editor.window);
                            newrange.setStart(endNode, 0);
                            newrange.setEnd(endNode, endNode.length);
                            selection.removeAllRanges();
                            selection.addRange(newrange);
                            this.editor.selection.collapse(true);
                        } else {
                            var targetNode;
                            if (range.startOffset >= 0) {
                                targetNode = rs.childNodes[range.startOffset];
                            }
                            var brNode = doc.createElement("br");
                            var endNode = doc.createTextNode("\xa0");
                            if (!targetNode) {
                                rs.appendChild(brNode);
                                rs.appendChild(endNode);
                            } else {
                                domConstruct.place(brNode, targetNode, "before");
                                domConstruct.place(endNode, brNode, "after");
                            }
                            newrange = rangeapi.create(this.editor.window);
                            newrange.setStart(endNode, 0);
                            newrange.setEnd(endNode, endNode.length);
                            selection.removeAllRanges();
                            selection.addRange(newrange);
                            this.editor.selection.collapse(true);
                        }
                    }
                } else {
                    RichText.prototype.execCommand.call(this.editor, "inserthtml", "<br>");
                }
            }
            return false;
        }
        var _letBrowserHandle = true;
        selection = rangeapi.getSelection(this.editor.window);
        range = selection.getRangeAt(0);
        if (!range.collapsed) {
            range.deleteContents();
            selection = rangeapi.getSelection(this.editor.window);
            range = selection.getRangeAt(0);
        }
        var block = rangeapi.getBlockAncestor(range.endContainer, null, this.editor.editNode);
        var blockNode = block.blockNode;
        if ((this._checkListLater = (blockNode && (blockNode.nodeName == "LI" || blockNode.parentNode.nodeName == "LI")))) {
            if (has("mozilla")) {
                this._pressedEnterInBlock = blockNode;
            }
            if (/^(\s|&nbsp;|&#160;|\xA0|<span\b[^>]*\bclass=['"]Apple-style-span['"][^>]*>(\s|&nbsp;|&#160;|\xA0)<\/span>)?(<br>)?$/.test(blockNode.innerHTML)) {
                blockNode.innerHTML = "";
                if (has("webkit")) {
                    newrange = rangeapi.create(this.editor.window);
                    newrange.setStart(blockNode, 0);
                    selection.removeAllRanges();
                    selection.addRange(newrange);
                }
                this._checkListLater = false;
            }
            return true;
        }
        if (!block.blockNode || block.blockNode === this.editor.editNode) {
            try {
                RichText.prototype.execCommand.call(this.editor, "formatblock", this.blockNodeForEnter);
            }
            catch (e2) {
            }
            block = {blockNode:this.editor.selection.getAncestorElement(this.blockNodeForEnter), blockContainer:this.editor.editNode};
            if (block.blockNode) {
                if (block.blockNode != this.editor.editNode && (!(block.blockNode.textContent || block.blockNode.innerHTML).replace(/^\s+|\s+$/g, "").length)) {
                    this.removeTrailingBr(block.blockNode);
                    return false;
                }
            } else {
                block.blockNode = this.editor.editNode;
            }
            selection = rangeapi.getSelection(this.editor.window);
            range = selection.getRangeAt(0);
        }
        var newblock = doc.createElement(this.blockNodeForEnter);
        newblock.innerHTML = this.bogusHtmlContent;
        this.removeTrailingBr(block.blockNode);
        var endOffset = range.endOffset;
        var node = range.endContainer;
        if (node.length < endOffset) {
            var ret = this._adjustNodeAndOffset(node, endOffset);
            node = ret.node;
            endOffset = ret.offset;
        }
        if (rangeapi.atEndOfContainer(block.blockNode, node, endOffset)) {
            if (block.blockNode === block.blockContainer) {
                block.blockNode.appendChild(newblock);
            } else {
                domConstruct.place(newblock, block.blockNode, "after");
            }
            _letBrowserHandle = false;
            newrange = rangeapi.create(this.editor.window);
            newrange.setStart(newblock, 0);
            selection.removeAllRanges();
            selection.addRange(newrange);
            if (this.editor.height) {
                winUtils.scrollIntoView(newblock);
            }
        } else {
            if (rangeapi.atBeginningOfContainer(block.blockNode, range.startContainer, range.startOffset)) {
                domConstruct.place(newblock, block.blockNode, block.blockNode === block.blockContainer ? "first" : "before");
                if (newblock.nextSibling && this.editor.height) {
                    newrange = rangeapi.create(this.editor.window);
                    newrange.setStart(newblock.nextSibling, 0);
                    selection.removeAllRanges();
                    selection.addRange(newrange);
                    winUtils.scrollIntoView(newblock.nextSibling);
                }
                _letBrowserHandle = false;
            } else {
                if (block.blockNode === block.blockContainer) {
                    block.blockNode.appendChild(newblock);
                } else {
                    domConstruct.place(newblock, block.blockNode, "after");
                }
                _letBrowserHandle = false;
                if (block.blockNode.style) {
                    if (newblock.style) {
                        if (block.blockNode.style.cssText) {
                            newblock.style.cssText = block.blockNode.style.cssText;
                        }
                    }
                }
                rs = range.startContainer;
                var firstNodeMoved;
                if (rs && rs.nodeType == 3) {
                    var nodeToMove, tNode;
                    endOffset = range.endOffset;
                    if (rs.length < endOffset) {
                        ret = this._adjustNodeAndOffset(rs, endOffset);
                        rs = ret.node;
                        endOffset = ret.offset;
                    }
                    txt = rs.nodeValue;
                    startNode = doc.createTextNode(txt.substring(0, endOffset));
                    endNode = doc.createTextNode(txt.substring(endOffset, txt.length));
                    domConstruct.place(startNode, rs, "before");
                    domConstruct.place(endNode, rs, "after");
                    domConstruct.destroy(rs);
                    var parentC = startNode.parentNode;
                    while (parentC !== block.blockNode) {
                        var tg = parentC.tagName;
                        var newTg = doc.createElement(tg);
                        if (parentC.style) {
                            if (newTg.style) {
                                if (parentC.style.cssText) {
                                    newTg.style.cssText = parentC.style.cssText;
                                }
                            }
                        }
                        if (parentC.tagName === "FONT") {
                            if (parentC.color) {
                                newTg.color = parentC.color;
                            }
                            if (parentC.face) {
                                newTg.face = parentC.face;
                            }
                            if (parentC.size) {
                                newTg.size = parentC.size;
                            }
                        }
                        nodeToMove = endNode;
                        while (nodeToMove) {
                            tNode = nodeToMove.nextSibling;
                            newTg.appendChild(nodeToMove);
                            nodeToMove = tNode;
                        }
                        domConstruct.place(newTg, parentC, "after");
                        startNode = parentC;
                        endNode = newTg;
                        parentC = parentC.parentNode;
                    }
                    nodeToMove = endNode;
                    if (nodeToMove.nodeType == 1 || (nodeToMove.nodeType == 3 && nodeToMove.nodeValue)) {
                        newblock.innerHTML = "";
                    }
                    firstNodeMoved = nodeToMove;
                    while (nodeToMove) {
                        tNode = nodeToMove.nextSibling;
                        newblock.appendChild(nodeToMove);
                        nodeToMove = tNode;
                    }
                }
                newrange = rangeapi.create(this.editor.window);
                var nodeForCursor;
                var innerMostFirstNodeMoved = firstNodeMoved;
                if (this.blockNodeForEnter !== "BR") {
                    while (innerMostFirstNodeMoved) {
                        nodeForCursor = innerMostFirstNodeMoved;
                        tNode = innerMostFirstNodeMoved.firstChild;
                        innerMostFirstNodeMoved = tNode;
                    }
                    if (nodeForCursor && nodeForCursor.parentNode) {
                        newblock = nodeForCursor.parentNode;
                        newrange.setStart(newblock, 0);
                        selection.removeAllRanges();
                        selection.addRange(newrange);
                        if (this.editor.height) {
                            winUtils.scrollIntoView(newblock);
                        }
                        if (has("mozilla")) {
                            this._pressedEnterInBlock = block.blockNode;
                        }
                    } else {
                        _letBrowserHandle = true;
                    }
                } else {
                    newrange.setStart(newblock, 0);
                    selection.removeAllRanges();
                    selection.addRange(newrange);
                    if (this.editor.height) {
                        winUtils.scrollIntoView(newblock);
                    }
                    if (has("mozilla")) {
                        this._pressedEnterInBlock = block.blockNode;
                    }
                }
            }
        }
        return _letBrowserHandle;
    }, _adjustNodeAndOffset:function (node, offset) {
        while (node.length < offset && node.nextSibling && node.nextSibling.nodeType == 3) {
            offset = offset - node.length;
            node = node.nextSibling;
        }
        return {"node":node, "offset":offset};
    }, removeTrailingBr:function (container) {
        var para = /P|DIV|LI/i.test(container.tagName) ? container : this.editor.selection.getParentOfType(container, ["P", "DIV", "LI"]);
        if (!para) {
            return;
        }
        if (para.lastChild) {
            if ((para.childNodes.length > 1 && para.lastChild.nodeType == 3 && /^[\s\xAD]*$/.test(para.lastChild.nodeValue)) || para.lastChild.tagName == "BR") {
                domConstruct.destroy(para.lastChild);
            }
        }
        if (!para.childNodes.length) {
            para.innerHTML = this.bogusHtmlContent;
        }
    }});
});

