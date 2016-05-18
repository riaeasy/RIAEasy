//>>built

define("dojo/NodeList-dom", ["./_base/kernel", "./query", "./_base/array", "./_base/lang", "./dom-class", "./dom-construct", "./dom-geometry", "./dom-attr", "./dom-style"], function (dojo, query, array, lang, domCls, domCtr, domGeom, domAttr, domStyle) {
    var magicGuard = function (a) {
        return a.length == 1 && (typeof a[0] == "string");
    };
    var orphan = function (node) {
        var p = node.parentNode;
        if (p) {
            p.removeChild(node);
        }
    };
    var NodeList = query.NodeList, awc = NodeList._adaptWithCondition, aafe = NodeList._adaptAsForEach, aam = NodeList._adaptAsMap;
    function getSet(module) {
        return function (node, name, value) {
            if (arguments.length == 2) {
                return module[typeof name == "string" ? "get" : "set"](node, name);
            }
            return module.set(node, name, value);
        };
    }
    lang.extend(NodeList, {_normalize:function (content, refNode) {
        var parse = content.parse === true;
        if (typeof content.template == "string") {
            var templateFunc = content.templateFunc || (dojo.string && dojo.string.substitute);
            content = templateFunc ? templateFunc(content.template, content) : content;
        }
        var type = (typeof content);
        if (type == "string" || type == "number") {
            content = domCtr.toDom(content, (refNode && refNode.ownerDocument));
            if (content.nodeType == 11) {
                content = lang._toArray(content.childNodes);
            } else {
                content = [content];
            }
        } else {
            if (!lang.isArrayLike(content)) {
                content = [content];
            } else {
                if (!lang.isArray(content)) {
                    content = lang._toArray(content);
                }
            }
        }
        if (parse) {
            content._runParse = true;
        }
        return content;
    }, _cloneNode:function (node) {
        return node.cloneNode(true);
    }, _place:function (ary, refNode, position, useClone) {
        if (refNode.nodeType != 1 && position == "only") {
            return;
        }
        var rNode = refNode, tempNode;
        var length = ary.length;
        for (var i = length - 1; i >= 0; i--) {
            var node = (useClone ? this._cloneNode(ary[i]) : ary[i]);
            if (ary._runParse && dojo.parser && dojo.parser.parse) {
                if (!tempNode) {
                    tempNode = rNode.ownerDocument.createElement("div");
                }
                tempNode.appendChild(node);
                dojo.parser.parse(tempNode);
                node = tempNode.firstChild;
                while (tempNode.firstChild) {
                    tempNode.removeChild(tempNode.firstChild);
                }
            }
            if (i == length - 1) {
                domCtr.place(node, rNode, position);
            } else {
                rNode.parentNode.insertBefore(node, rNode);
            }
            rNode = node;
        }
    }, position:aam(domGeom.position), attr:awc(getSet(domAttr), magicGuard), style:awc(getSet(domStyle), magicGuard), addClass:aafe(domCls.add), removeClass:aafe(domCls.remove), toggleClass:aafe(domCls.toggle), replaceClass:aafe(domCls.replace), empty:aafe(domCtr.empty), removeAttr:aafe(domAttr.remove), marginBox:aam(domGeom.getMarginBox), place:function (queryOrNode, position) {
        var item = query(queryOrNode)[0];
        return this.forEach(function (node) {
            domCtr.place(node, item, position);
        });
    }, orphan:function (filter) {
        return (filter ? query._filterResult(this, filter) : this).forEach(orphan);
    }, adopt:function (queryOrListOrNode, position) {
        return query(queryOrListOrNode).place(this[0], position)._stash(this);
    }, query:function (queryStr) {
        if (!queryStr) {
            return this;
        }
        var ret = new NodeList;
        this.map(function (node) {
            query(queryStr, node).forEach(function (subNode) {
                if (subNode !== undefined) {
                    ret.push(subNode);
                }
            });
        });
        return ret._stash(this);
    }, filter:function (filter) {
        var a = arguments, items = this, start = 0;
        if (typeof filter == "string") {
            items = query._filterResult(this, a[0]);
            if (a.length == 1) {
                return items._stash(this);
            }
            start = 1;
        }
        return this._wrap(array.filter(items, a[start], a[start + 1]), this);
    }, addContent:function (content, position) {
        content = this._normalize(content, this[0]);
        for (var i = 0, node; (node = this[i]); i++) {
            if (content.length) {
                this._place(content, node, position, i > 0);
            } else {
                domCtr.empty(node);
            }
        }
        return this;
    }});
    return NodeList;
});

