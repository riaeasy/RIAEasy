//>>built

define("dijit/_editor/selection", ["dojo/dom", "dojo/_base/lang", "dojo/sniff", "dojo/_base/window", "../main"], function (dom, lang, has, win, dijit) {
    var selection = {getType:function () {
        if (win.doc.getSelection) {
            var stype = "text";
            var oSel;
            try {
                oSel = win.global.getSelection();
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
            return win.doc.selection.type.toLowerCase();
        }
    }, getSelectedText:function () {
        if (win.doc.getSelection) {
            var selection = win.global.getSelection();
            return selection ? selection.toString() : "";
        } else {
            if (dijit._editor.selection.getType() == "control") {
                return null;
            }
            return win.doc.selection.createRange().text;
        }
    }, getSelectedHtml:function () {
        if (win.doc.getSelection) {
            var selection = win.global.getSelection();
            if (selection && selection.rangeCount) {
                var i;
                var html = "";
                for (i = 0; i < selection.rangeCount; i++) {
                    var frag = selection.getRangeAt(i).cloneContents();
                    var div = win.doc.createElement("div");
                    div.appendChild(frag);
                    html += div.innerHTML;
                }
                return html;
            }
            return null;
        } else {
            if (dijit._editor.selection.getType() == "control") {
                return null;
            }
            return win.doc.selection.createRange().htmlText;
        }
    }, getSelectedElement:function () {
        if (dijit._editor.selection.getType() == "control") {
            if (win.doc.getSelection) {
                var selection = win.global.getSelection();
                return selection.anchorNode.childNodes[selection.anchorOffset];
            } else {
                var range = win.doc.selection.createRange();
                if (range && range.item) {
                    return win.doc.selection.createRange().item(0);
                }
            }
        }
        return null;
    }, getParentElement:function () {
        if (dijit._editor.selection.getType() == "control") {
            var p = this.getSelectedElement();
            if (p) {
                return p.parentNode;
            }
        } else {
            if (win.doc.getSelection) {
                var selection = win.global.getSelection();
                if (selection) {
                    var node = selection.anchorNode;
                    while (node && (node.nodeType != 1)) {
                        node = node.parentNode;
                    }
                    return node;
                }
            } else {
                var r = win.doc.selection.createRange();
                r.collapse(true);
                return r.parentElement();
            }
        }
        return null;
    }, hasAncestorElement:function (tagName) {
        return this.getAncestorElement.apply(this, arguments) != null;
    }, getAncestorElement:function (tagName) {
        var node = this.getSelectedElement() || this.getParentElement();
        return this.getParentOfType(node, arguments);
    }, isTag:function (node, tags) {
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
    }, getParentOfType:function (node, tags) {
        while (node) {
            if (this.isTag(node, tags).length) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }, collapse:function (beginning) {
        if (win.doc.getSelection) {
            var selection = win.global.getSelection();
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
            var range = win.doc.selection.createRange();
            range.collapse(beginning);
            range.select();
        }
    }, remove:function () {
        var sel = win.doc.selection;
        if (win.doc.getSelection) {
            sel = win.global.getSelection();
            sel.deleteFromDocument();
            return sel;
        } else {
            if (sel.type.toLowerCase() != "none") {
                sel.clear();
            }
            return sel;
        }
    }, selectElementChildren:function (element, nochangefocus) {
        var doc = win.doc;
        var range;
        element = dom.byId(element);
        if (win.doc.getSelection) {
            var selection = win.global.getSelection();
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
    }, selectElement:function (element, nochangefocus) {
        var range;
        element = dom.byId(element);
        var doc = element.ownerDocument;
        var global = win.global;
        if (doc.getSelection) {
            var selection = global.getSelection();
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
                    range = win.body(doc).createControlRange();
                } else {
                    range = win.body(doc).createRange();
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
    }, inSelection:function (node) {
        if (node) {
            var newRange;
            var doc = win.doc;
            var range;
            if (win.doc.getSelection) {
                var sel = win.global.getSelection();
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
                    newRange = node.ownerDocument.body.createControlRange();
                    if (newRange) {
                        newRange.addElement(node);
                    }
                }
                catch (e1) {
                    try {
                        newRange = node.ownerDocument.body.createTextRange();
                        newRange.moveToElementText(node);
                    }
                    catch (e2) {
                    }
                }
                if (range && newRange) {
                    if (range.compareEndPoints("EndToStart", newRange) === 1) {
                        return true;
                    }
                }
            }
        }
        return false;
    }};
    lang.setObject("dijit._editor.selection", selection);
    return selection;
});

