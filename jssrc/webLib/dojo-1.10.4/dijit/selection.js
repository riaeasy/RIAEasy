//>>built

define("dijit/selection", ["dojo/_base/array", "dojo/dom", "dojo/_base/lang", "dojo/sniff", "dojo/_base/window", "dijit/focus"], function (array, dom, lang, has, baseWindow, focus) {
    var SelectionManager = function (win) {
        var doc = win.document;
        this.getType = function () {
            if (doc.getSelection) {
                var stype = "text";
                var oSel;
                try {
                    oSel = win.getSelection();
                }
                catch (e) {
                }
                if (oSel && oSel.rangeCount == 1) {
                    var oRange = oSel.getRangeAt(0);
                    if ((oRange.startContainer == oRange.endContainer) && ((oRange.endOffset - oRange.startOffset) == 1) && (oRange.startContainer.nodeType != 3)) {
                        stype = "control";
                    }
                }
                return stype;
            } else {
                return doc.selection.type.toLowerCase();
            }
        };
        this.getSelectedText = function () {
            if (doc.getSelection) {
                var selection = win.getSelection();
                return selection ? selection.toString() : "";
            } else {
                if (this.getType() == "control") {
                    return null;
                }
                return doc.selection.createRange().text;
            }
        };
        this.getSelectedHtml = function () {
            if (doc.getSelection) {
                var selection = win.getSelection();
                if (selection && selection.rangeCount) {
                    var i;
                    var html = "";
                    for (i = 0; i < selection.rangeCount; i++) {
                        var frag = selection.getRangeAt(i).cloneContents();
                        var div = doc.createElement("div");
                        div.appendChild(frag);
                        html += div.innerHTML;
                    }
                    return html;
                }
                return null;
            } else {
                if (this.getType() == "control") {
                    return null;
                }
                return doc.selection.createRange().htmlText;
            }
        };
        this.getSelectedElement = function () {
            if (this.getType() == "control") {
                if (doc.getSelection) {
                    var selection = win.getSelection();
                    return selection.anchorNode.childNodes[selection.anchorOffset];
                } else {
                    var range = doc.selection.createRange();
                    if (range && range.item) {
                        return doc.selection.createRange().item(0);
                    }
                }
            }
            return null;
        };
        this.getParentElement = function () {
            if (this.getType() == "control") {
                var p = this.getSelectedElement();
                if (p) {
                    return p.parentNode;
                }
            } else {
                if (doc.getSelection) {
                    var selection = doc.getSelection();
                    if (selection) {
                        var node = selection.anchorNode;
                        while (node && (node.nodeType != 1)) {
                            node = node.parentNode;
                        }
                        return node;
                    }
                } else {
                    var r = doc.selection.createRange();
                    r.collapse(true);
                    return r.parentElement();
                }
            }
            return null;
        };
        this.hasAncestorElement = function (tagName) {
            return this.getAncestorElement.apply(this, arguments) != null;
        };
        this.getAncestorElement = function (tagName) {
            var node = this.getSelectedElement() || this.getParentElement();
            return this.getParentOfType(node, arguments);
        };
        this.isTag = function (node, tags) {
            if (node && node.tagName) {
                var _nlc = node.tagName.toLowerCase();
                for (var i = 0; i < tags.length; i++) {
                    var _tlc = String(tags[i]).toLowerCase();
                    if (_nlc == _tlc) {
                        return _tlc;
                    }
                }
            }
            return "";
        };
        this.getParentOfType = function (node, tags) {
            while (node) {
                if (this.isTag(node, tags).length) {
                    return node;
                }
                node = node.parentNode;
            }
            return null;
        };
        this.collapse = function (beginning) {
            if (doc.getSelection) {
                var selection = win.getSelection();
                if (selection.removeAllRanges) {
                    if (beginning) {
                        selection.collapseToStart();
                    } else {
                        selection.collapseToEnd();
                    }
                } else {
                    selection.collapse(beginning);
                }
            } else {
                var range = doc.selection.createRange();
                range.collapse(beginning);
                range.select();
            }
        };
        this.remove = function () {
            var sel = doc.selection;
            if (doc.getSelection) {
                sel = win.getSelection();
                sel.deleteFromDocument();
                return sel;
            } else {
                if (sel.type.toLowerCase() != "none") {
                    sel.clear();
                }
                return sel;
            }
        };
        this.selectElementChildren = function (element, nochangefocus) {
            var range;
            element = dom.byId(element);
            if (doc.getSelection) {
                var selection = win.getSelection();
                if (has("opera")) {
                    if (selection.rangeCount) {
                        range = selection.getRangeAt(0);
                    } else {
                        range = doc.createRange();
                    }
                    range.setStart(element, 0);
                    range.setEnd(element, (element.nodeType == 3) ? element.length : element.childNodes.length);
                    selection.addRange(range);
                } else {
                    selection.selectAllChildren(element);
                }
            } else {
                range = element.ownerDocument.body.createTextRange();
                range.moveToElementText(element);
                if (!nochangefocus) {
                    try {
                        range.select();
                    }
                    catch (e) {
                    }
                }
            }
        };
        this.selectElement = function (element, nochangefocus) {
            var range;
            element = dom.byId(element);
            if (doc.getSelection) {
                var selection = doc.getSelection();
                range = doc.createRange();
                if (selection.removeAllRanges) {
                    if (has("opera")) {
                        if (selection.getRangeAt(0)) {
                            range = selection.getRangeAt(0);
                        }
                    }
                    range.selectNode(element);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            } else {
                try {
                    var tg = element.tagName ? element.tagName.toLowerCase() : "";
                    if (tg === "img" || tg === "table") {
                        range = baseWindow.body(doc).createControlRange();
                    } else {
                        range = baseWindow.body(doc).createRange();
                    }
                    range.addElement(element);
                    if (!nochangefocus) {
                        range.select();
                    }
                }
                catch (e) {
                    this.selectElementChildren(element, nochangefocus);
                }
            }
        };
        this.inSelection = function (node) {
            if (node) {
                var newRange;
                var range;
                if (doc.getSelection) {
                    var sel = win.getSelection();
                    if (sel && sel.rangeCount > 0) {
                        range = sel.getRangeAt(0);
                    }
                    if (range && range.compareBoundaryPoints && doc.createRange) {
                        try {
                            newRange = doc.createRange();
                            newRange.setStart(node, 0);
                            if (range.compareBoundaryPoints(range.START_TO_END, newRange) === 1) {
                                return true;
                            }
                        }
                        catch (e) {
                        }
                    }
                } else {
                    range = doc.selection.createRange();
                    try {
                        newRange = node.ownerDocument.body.createTextRange();
                        newRange.moveToElementText(node);
                    }
                    catch (e2) {
                    }
                    if (range && newRange) {
                        if (range.compareEndPoints("EndToStart", newRange) === 1) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        this.getBookmark = function () {
            var bm, rg, tg, sel = doc.selection, cf = focus.curNode;
            if (doc.getSelection) {
                sel = win.getSelection();
                if (sel) {
                    if (sel.isCollapsed) {
                        tg = cf ? cf.tagName : "";
                        if (tg) {
                            tg = tg.toLowerCase();
                            if (tg == "textarea" || (tg == "input" && (!cf.type || cf.type.toLowerCase() == "text"))) {
                                sel = {start:cf.selectionStart, end:cf.selectionEnd, node:cf, pRange:true};
                                return {isCollapsed:(sel.end <= sel.start), mark:sel};
                            }
                        }
                        bm = {isCollapsed:true};
                        if (sel.rangeCount) {
                            bm.mark = sel.getRangeAt(0).cloneRange();
                        }
                    } else {
                        rg = sel.getRangeAt(0);
                        bm = {isCollapsed:false, mark:rg.cloneRange()};
                    }
                }
            } else {
                if (sel) {
                    tg = cf ? cf.tagName : "";
                    tg = tg.toLowerCase();
                    if (cf && tg && (tg == "button" || tg == "textarea" || tg == "input")) {
                        if (sel.type && sel.type.toLowerCase() == "none") {
                            return {isCollapsed:true, mark:null};
                        } else {
                            rg = sel.createRange();
                            return {isCollapsed:rg.text && rg.text.length ? false : true, mark:{range:rg, pRange:true}};
                        }
                    }
                    bm = {};
                    try {
                        rg = sel.createRange();
                        bm.isCollapsed = !(sel.type == "Text" ? rg.htmlText.length : rg.length);
                    }
                    catch (e) {
                        bm.isCollapsed = true;
                        return bm;
                    }
                    if (sel.type.toUpperCase() == "CONTROL") {
                        if (rg.length) {
                            bm.mark = [];
                            var i = 0, len = rg.length;
                            while (i < len) {
                                bm.mark.push(rg.item(i++));
                            }
                        } else {
                            bm.isCollapsed = true;
                            bm.mark = null;
                        }
                    } else {
                        bm.mark = rg.getBookmark();
                    }
                } else {
                    console.warn("No idea how to store the current selection for this browser!");
                }
            }
            return bm;
        };
        this.moveToBookmark = function (bookmark) {
            var mark = bookmark.mark;
            if (mark) {
                if (doc.getSelection) {
                    var sel = win.getSelection();
                    if (sel && sel.removeAllRanges) {
                        if (mark.pRange) {
                            var n = mark.node;
                            n.selectionStart = mark.start;
                            n.selectionEnd = mark.end;
                        } else {
                            sel.removeAllRanges();
                            sel.addRange(mark);
                        }
                    } else {
                        console.warn("No idea how to restore selection for this browser!");
                    }
                } else {
                    if (doc.selection && mark) {
                        var rg;
                        if (mark.pRange) {
                            rg = mark.range;
                        } else {
                            if (lang.isArray(mark)) {
                                rg = doc.body.createControlRange();
                                array.forEach(mark, function (n) {
                                    rg.addElement(n);
                                });
                            } else {
                                rg = doc.body.createTextRange();
                                rg.moveToBookmark(mark);
                            }
                        }
                        rg.select();
                    }
                }
            }
        };
        this.isCollapsed = function () {
            return this.getBookmark().isCollapsed;
        };
    };
    var selection = new SelectionManager(window);
    selection.SelectionManager = SelectionManager;
    return selection;
});

