//>>built

define("dijit/_editor/range", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang"], function (array, declare, lang) {
    var rangeapi = {getIndex:function (node, parent) {
        var ret = [], retR = [];
        var onode = node;
        var pnode, n;
        while (node != parent) {
            var i = 0;
            pnode = node.parentNode;
            while ((n = pnode.childNodes[i++])) {
                if (n === node) {
                    --i;
                    break;
                }
            }
            ret.unshift(i);
            retR.unshift(i - pnode.childNodes.length);
            node = pnode;
        }
        if (ret.length > 0 && onode.nodeType == 3) {
            n = onode.previousSibling;
            while (n && n.nodeType == 3) {
                ret[ret.length - 1]--;
                n = n.previousSibling;
            }
            n = onode.nextSibling;
            while (n && n.nodeType == 3) {
                retR[retR.length - 1]++;
                n = n.nextSibling;
            }
        }
        return {o:ret, r:retR};
    }, getNode:function (index, parent) {
        if (!lang.isArray(index) || index.length == 0) {
            return parent;
        }
        var node = parent;
        array.every(index, function (i) {
            if (i >= 0 && i < node.childNodes.length) {
                node = node.childNodes[i];
            } else {
                node = null;
                return false;
            }
            return true;
        });
        return node;
    }, getCommonAncestor:function (n1, n2, root) {
        root = root || n1.ownerDocument.body;
        var getAncestors = function (n) {
            var as = [];
            while (n) {
                as.unshift(n);
                if (n !== root) {
                    n = n.parentNode;
                } else {
                    break;
                }
            }
            return as;
        };
        var n1as = getAncestors(n1);
        var n2as = getAncestors(n2);
        var m = Math.min(n1as.length, n2as.length);
        var com = n1as[0];
        for (var i = 1; i < m; i++) {
            if (n1as[i] === n2as[i]) {
                com = n1as[i];
            } else {
                break;
            }
        }
        return com;
    }, getAncestor:function (node, regex, root) {
        root = root || node.ownerDocument.body;
        while (node && node !== root) {
            var name = node.nodeName.toUpperCase();
            if (regex.test(name)) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }, BlockTagNames:/^(?:P|DIV|H1|H2|H3|H4|H5|H6|ADDRESS|PRE|OL|UL|LI|DT|DE)$/, getBlockAncestor:function (node, regex, root) {
        root = root || node.ownerDocument.body;
        regex = regex || rangeapi.BlockTagNames;
        var block = null, blockContainer;
        while (node && node !== root) {
            var name = node.nodeName.toUpperCase();
            if (!block && regex.test(name)) {
                block = node;
            }
            if (!blockContainer && (/^(?:BODY|TD|TH|CAPTION)$/).test(name)) {
                blockContainer = node;
            }
            node = node.parentNode;
        }
        return {blockNode:block, blockContainer:blockContainer || node.ownerDocument.body};
    }, atBeginningOfContainer:function (container, node, offset) {
        var atBeginning = false;
        var offsetAtBeginning = (offset == 0);
        if (!offsetAtBeginning && node.nodeType == 3) {
            if (/^[\s\xA0]+$/.test(node.nodeValue.substr(0, offset))) {
                offsetAtBeginning = true;
            }
        }
        if (offsetAtBeginning) {
            var cnode = node;
            atBeginning = true;
            while (cnode && cnode !== container) {
                if (cnode.previousSibling) {
                    atBeginning = false;
                    break;
                }
                cnode = cnode.parentNode;
            }
        }
        return atBeginning;
    }, atEndOfContainer:function (container, node, offset) {
        var atEnd = false;
        var offsetAtEnd = (offset == (node.length || node.childNodes.length));
        if (!offsetAtEnd && node.nodeType == 3) {
            if (/^[\s\xA0]+$/.test(node.nodeValue.substr(offset))) {
                offsetAtEnd = true;
            }
        }
        if (offsetAtEnd) {
            var cnode = node;
            atEnd = true;
            while (cnode && cnode !== container) {
                if (cnode.nextSibling) {
                    atEnd = false;
                    break;
                }
                cnode = cnode.parentNode;
            }
        }
        return atEnd;
    }, adjacentNoneTextNode:function (startnode, next) {
        var node = startnode;
        var len = (0 - startnode.length) || 0;
        var prop = next ? "nextSibling" : "previousSibling";
        while (node) {
            if (node.nodeType != 3) {
                break;
            }
            len += node.length;
            node = node[prop];
        }
        return [node, len];
    }, create:function (win) {
        win = win || window;
        if (win.getSelection) {
            return win.document.createRange();
        } else {
            return new W3CRange();
        }
    }, getSelection:function (window, ignoreUpdate) {
        if (window.getSelection) {
            return window.getSelection();
        } else {
            var s = new ie.selection(window);
            if (!ignoreUpdate) {
                s._getCurrentSelection();
            }
            return s;
        }
    }};
    if (!window.getSelection) {
        var ie = rangeapi.ie = {cachedSelection:{}, selection:function (window) {
            this._ranges = [];
            this.addRange = function (r, internal) {
                this._ranges.push(r);
                if (!internal) {
                    r._select();
                }
                this.rangeCount = this._ranges.length;
            };
            this.removeAllRanges = function () {
                this._ranges = [];
                this.rangeCount = 0;
            };
            var _initCurrentRange = function () {
                var r = window.document.selection.createRange();
                var type = window.document.selection.type.toUpperCase();
                if (type == "CONTROL") {
                    return new W3CRange(ie.decomposeControlRange(r));
                } else {
                    return new W3CRange(ie.decomposeTextRange(r));
                }
            };
            this.getRangeAt = function (i) {
                return this._ranges[i];
            };
            this._getCurrentSelection = function () {
                this.removeAllRanges();
                var r = _initCurrentRange();
                if (r) {
                    this.addRange(r, true);
                    this.isCollapsed = r.collapsed;
                } else {
                    this.isCollapsed = true;
                }
            };
        }, decomposeControlRange:function (range) {
            var firstnode = range.item(0), lastnode = range.item(range.length - 1);
            var startContainer = firstnode.parentNode, endContainer = lastnode.parentNode;
            var startOffset = rangeapi.getIndex(firstnode, startContainer).o[0];
            var endOffset = rangeapi.getIndex(lastnode, endContainer).o[0] + 1;
            return [startContainer, startOffset, endContainer, endOffset];
        }, getEndPoint:function (range, end) {
            var atmrange = range.duplicate();
            atmrange.collapse(!end);
            var cmpstr = "EndTo" + (end ? "End" : "Start");
            var parentNode = atmrange.parentElement();
            var startnode, startOffset, lastNode;
            if (parentNode.childNodes.length > 0) {
                array.every(parentNode.childNodes, function (node, i) {
                    var calOffset;
                    if (node.nodeType != 3) {
                        atmrange.moveToElementText(node);
                        if (atmrange.compareEndPoints(cmpstr, range) > 0) {
                            if (lastNode && lastNode.nodeType == 3) {
                                startnode = lastNode;
                                calOffset = true;
                            } else {
                                startnode = parentNode;
                                startOffset = i;
                                return false;
                            }
                        } else {
                            if (i == parentNode.childNodes.length - 1) {
                                startnode = parentNode;
                                startOffset = parentNode.childNodes.length;
                                return false;
                            }
                        }
                    } else {
                        if (i == parentNode.childNodes.length - 1) {
                            startnode = node;
                            calOffset = true;
                        }
                    }
                    if (calOffset && startnode) {
                        var prevnode = rangeapi.adjacentNoneTextNode(startnode)[0];
                        if (prevnode) {
                            startnode = prevnode.nextSibling;
                        } else {
                            startnode = parentNode.firstChild;
                        }
                        var prevnodeobj = rangeapi.adjacentNoneTextNode(startnode);
                        prevnode = prevnodeobj[0];
                        var lenoffset = prevnodeobj[1];
                        if (prevnode) {
                            atmrange.moveToElementText(prevnode);
                            atmrange.collapse(false);
                        } else {
                            atmrange.moveToElementText(parentNode);
                        }
                        atmrange.setEndPoint(cmpstr, range);
                        startOffset = atmrange.text.length - lenoffset;
                        return false;
                    }
                    lastNode = node;
                    return true;
                });
            } else {
                startnode = parentNode;
                startOffset = 0;
            }
            if (!end && startnode.nodeType == 1 && startOffset == startnode.childNodes.length) {
                var nextnode = startnode.nextSibling;
                if (nextnode && nextnode.nodeType == 3) {
                    startnode = nextnode;
                    startOffset = 0;
                }
            }
            return [startnode, startOffset];
        }, setEndPoint:function (range, container, offset) {
            var atmrange = range.duplicate(), node, len;
            if (container.nodeType != 3) {
                if (offset > 0) {
                    node = container.childNodes[offset - 1];
                    if (node) {
                        if (node.nodeType == 3) {
                            container = node;
                            offset = node.length;
                        } else {
                            if (node.nextSibling && node.nextSibling.nodeType == 3) {
                                container = node.nextSibling;
                                offset = 0;
                            } else {
                                atmrange.moveToElementText(node.nextSibling ? node : container);
                                var parent = node.parentNode;
                                var tempNode = parent.insertBefore(node.ownerDocument.createTextNode(" "), node.nextSibling);
                                atmrange.collapse(false);
                                parent.removeChild(tempNode);
                            }
                        }
                    }
                } else {
                    atmrange.moveToElementText(container);
                    atmrange.collapse(true);
                }
            }
            if (container.nodeType == 3) {
                var prevnodeobj = rangeapi.adjacentNoneTextNode(container);
                var prevnode = prevnodeobj[0];
                len = prevnodeobj[1];
                if (prevnode) {
                    atmrange.moveToElementText(prevnode);
                    atmrange.collapse(false);
                    if (prevnode.contentEditable != "inherit") {
                        len++;
                    }
                } else {
                    atmrange.moveToElementText(container.parentNode);
                    atmrange.collapse(true);
                    atmrange.move("character", 1);
                    atmrange.move("character", -1);
                }
                offset += len;
                if (offset > 0) {
                    if (atmrange.move("character", offset) != offset) {
                        console.error("Error when moving!");
                    }
                }
            }
            return atmrange;
        }, decomposeTextRange:function (range) {
            var tmpary = ie.getEndPoint(range);
            var startContainer = tmpary[0], startOffset = tmpary[1];
            var endContainer = tmpary[0], endOffset = tmpary[1];
            if (range.htmlText.length) {
                if (range.htmlText == range.text) {
                    endOffset = startOffset + range.text.length;
                } else {
                    tmpary = ie.getEndPoint(range, true);
                    endContainer = tmpary[0], endOffset = tmpary[1];
                }
            }
            return [startContainer, startOffset, endContainer, endOffset];
        }, setRange:function (range, startContainer, startOffset, endContainer, endOffset, collapsed) {
            var start = ie.setEndPoint(range, startContainer, startOffset);
            range.setEndPoint("StartToStart", start);
            if (!collapsed) {
                var end = ie.setEndPoint(range, endContainer, endOffset);
            }
            range.setEndPoint("EndToEnd", end || start);
            return range;
        }};
        var W3CRange = rangeapi.W3CRange = declare(null, {constructor:function () {
            if (arguments.length > 0) {
                this.setStart(arguments[0][0], arguments[0][1]);
                this.setEnd(arguments[0][2], arguments[0][3]);
            } else {
                this.commonAncestorContainer = null;
                this.startContainer = null;
                this.startOffset = 0;
                this.endContainer = null;
                this.endOffset = 0;
                this.collapsed = true;
            }
        }, _updateInternal:function () {
            if (this.startContainer !== this.endContainer) {
                this.commonAncestorContainer = rangeapi.getCommonAncestor(this.startContainer, this.endContainer);
            } else {
                this.commonAncestorContainer = this.startContainer;
            }
            this.collapsed = (this.startContainer === this.endContainer) && (this.startOffset == this.endOffset);
        }, setStart:function (node, offset) {
            offset = parseInt(offset);
            if (this.startContainer === node && this.startOffset == offset) {
                return;
            }
            delete this._cachedBookmark;
            this.startContainer = node;
            this.startOffset = offset;
            if (!this.endContainer) {
                this.setEnd(node, offset);
            } else {
                this._updateInternal();
            }
        }, setEnd:function (node, offset) {
            offset = parseInt(offset);
            if (this.endContainer === node && this.endOffset == offset) {
                return;
            }
            delete this._cachedBookmark;
            this.endContainer = node;
            this.endOffset = offset;
            if (!this.startContainer) {
                this.setStart(node, offset);
            } else {
                this._updateInternal();
            }
        }, setStartAfter:function (node, offset) {
            this._setPoint("setStart", node, offset, 1);
        }, setStartBefore:function (node, offset) {
            this._setPoint("setStart", node, offset, 0);
        }, setEndAfter:function (node, offset) {
            this._setPoint("setEnd", node, offset, 1);
        }, setEndBefore:function (node, offset) {
            this._setPoint("setEnd", node, offset, 0);
        }, _setPoint:function (what, node, offset, ext) {
            var index = rangeapi.getIndex(node, node.parentNode).o;
            this[what](node.parentNode, index.pop() + ext);
        }, _getIERange:function () {
            var r = (this._body || this.endContainer.ownerDocument.body).createTextRange();
            ie.setRange(r, this.startContainer, this.startOffset, this.endContainer, this.endOffset, this.collapsed);
            return r;
        }, getBookmark:function () {
            this._getIERange();
            return this._cachedBookmark;
        }, _select:function () {
            var r = this._getIERange();
            r.select();
        }, deleteContents:function () {
            var s = this.startContainer, r = this._getIERange();
            if (s.nodeType === 3 && !this.startOffset) {
                this.setStartBefore(s);
            }
            r.pasteHTML("");
            this.endContainer = this.startContainer;
            this.endOffset = this.startOffset;
            this.collapsed = true;
        }, cloneRange:function () {
            var r = new W3CRange([this.startContainer, this.startOffset, this.endContainer, this.endOffset]);
            r._body = this._body;
            return r;
        }, detach:function () {
            this._body = null;
            this.commonAncestorContainer = null;
            this.startContainer = null;
            this.startOffset = 0;
            this.endContainer = null;
            this.endOffset = 0;
            this.collapsed = true;
        }});
    }
    lang.setObject("dijit.range", rangeapi);
    return rangeapi;
});

