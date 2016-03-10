//>>built

define("dojox/editor/plugins/AutoUrlLink", ["dojo", "dijit", "dojox", "dijit/_editor/_Plugin", "dijit/form/Button", "dojo/_base/declare", "dojo/string"], function (dojo, dijit, dojox, _Plugin) {
    var AutoUrlLink = dojo.declare("dojox.editor.plugins.AutoUrlLink", [_Plugin], {_template:"<a _djrealurl='${url}' href='${url}'>${url}</a>", setEditor:function (editor) {
        this.editor = editor;
        if (!dojo.isIE) {
            dojo.some(editor._plugins, function (plugin) {
                if (plugin.isInstanceOf(dijit._editor.plugins.EnterKeyHandling)) {
                    this.blockNodeForEnter = plugin.blockNodeForEnter;
                    return true;
                }
                return false;
            }, this);
            this.connect(editor, "onKeyPress", "_keyPress");
            this.connect(editor, "onClick", "_recognize");
            this.connect(editor, "onBlur", "_recognize");
        }
    }, _keyPress:function (evt) {
        var ks = dojo.keys, v = 118, V = 86, kc = evt.keyCode, cc = evt.charCode;
        if (cc == ks.SPACE || (evt.ctrlKey && (cc == v || cc == V))) {
            setTimeout(dojo.hitch(this, "_recognize"), 0);
        } else {
            if (kc == ks.ENTER) {
                setTimeout(dojo.hitch(this, function () {
                    this._recognize({enter:true});
                }), 0);
            } else {
                this._saved = this.editor.window.getSelection().anchorNode;
            }
        }
    }, _recognize:function (args) {
        var template = this._template, isEnter = args ? args.enter : false, ed = this.editor, selection = ed.window.getSelection();
        console.log("_recognize: isEnter = ", isEnter, ", selection is ", selection, selection.anchorNode, this._findLastEditingNode(selection.anchorNode));
        if (selection) {
            var node = isEnter ? this._findLastEditingNode(selection.anchorNode) : (this._saved || selection.anchorNode), bm = this._saved = selection.anchorNode, bmOff = selection.anchorOffset;
            if (node.nodeType == 3 && !this._inLink(node)) {
                var linked = false, result = this._findUrls(node, bm, bmOff), range = ed.document.createRange(), item, cost = 0, isSameNode = (bm == node);
                item = result.shift();
                while (item) {
                    range.setStart(node, item.start);
                    range.setEnd(node, item.end);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    ed.execCommand("insertHTML", dojo.string.substitute(template, {url:range.toString()}));
                    cost += item.end;
                    item = result.shift();
                    linked = true;
                }
                if (isSameNode && (bmOff = bmOff - cost) <= 0) {
                    return;
                }
                if (!linked) {
                    return;
                }
                try {
                    range.setStart(bm, 0);
                    range.setEnd(bm, bmOff);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    ed._sCall("collapse", []);
                }
                catch (e) {
                }
            }
        }
    }, _inLink:function (node) {
        var editNode = this.editor.editNode, result = false, tagName;
        node = node.parentNode;
        while (node && node !== editNode) {
            tagName = node.tagName ? node.tagName.toLowerCase() : "";
            if (tagName == "a") {
                result = true;
                break;
            }
            node = node.parentNode;
        }
        return result;
    }, _findLastEditingNode:function (node) {
        var blockTagNames = dijit.range.BlockTagNames, editNode = this.editor.editNode, blockNode;
        if (!node) {
            return node;
        }
        if (this.blockNodeForEnter == "BR" && (!(blockNode = dijit.range.getBlockAncestor(node, null, editNode).blockNode) || blockNode.tagName.toUpperCase() != "LI")) {
            while ((node = node.previousSibling) && node.nodeType != 3) {
            }
        } else {
            if ((blockNode || (blockNode = dijit.range.getBlockAncestor(node, null, editNode).blockNode)) && blockNode.tagName.toUpperCase() == "LI") {
                node = blockNode;
            } else {
                node = dijit.range.getBlockAncestor(node, null, editNode).blockNode;
            }
            while ((node = node.previousSibling) && !(node.tagName && node.tagName.match(blockTagNames))) {
            }
            if (node) {
                node = node.lastChild;
                while (node) {
                    if (node.nodeType == 3 && dojo.trim(node.nodeValue) != "") {
                        break;
                    } else {
                        if (node.nodeType == 1) {
                            node = node.lastChild;
                        } else {
                            node = node.previousSibling;
                        }
                    }
                }
            }
        }
        return node;
    }, _findUrls:function (node, bm, bmOff) {
        var pattern = /(http|https|ftp):\/\/[^\s]+/ig, list = [], baseIndex = 0, value = node.nodeValue, result, ch;
        if (node === bm && bmOff < value.length) {
            value = value.substr(0, bmOff);
        }
        while ((result = pattern.exec(value)) != null) {
            if (result.index == 0 || (ch = value.charAt(result.index - 1)) == " " || ch == "\xa0") {
                list.push({start:result.index - baseIndex, end:result.index + result[0].length - baseIndex});
                baseIndex = result.index + result[0].length;
            }
        }
        return list;
    }});
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        var name = o.args.name.toLowerCase();
        if (name === "autourllink") {
            o.plugin = new AutoUrlLink();
        }
    });
    return AutoUrlLink;
});

