//>>built

define("dojo/NodeList-traverse", ["./query", "./_base/lang", "./_base/array"], function (dquery, lang, array) {
    var NodeList = dquery.NodeList;
    lang.extend(NodeList, {_buildArrayFromCallback:function (callback) {
        var ary = [];
        for (var i = 0; i < this.length; i++) {
            var items = callback.call(this[i], this[i], ary);
            if (items) {
                ary = ary.concat(items);
            }
        }
        return ary;
    }, _getUniqueAsNodeList:function (nodes) {
        var ary = [];
        for (var i = 0, node; node = nodes[i]; i++) {
            if (node.nodeType == 1 && array.indexOf(ary, node) == -1) {
                ary.push(node);
            }
        }
        return this._wrap(ary, null, this._NodeListCtor);
    }, _getUniqueNodeListWithParent:function (nodes, query) {
        var ary = this._getUniqueAsNodeList(nodes);
        ary = (query ? dquery._filterResult(ary, query) : ary);
        return ary._stash(this);
    }, _getRelatedUniqueNodes:function (query, callback) {
        return this._getUniqueNodeListWithParent(this._buildArrayFromCallback(callback), query);
    }, children:function (query) {
        return this._getRelatedUniqueNodes(query, function (node, ary) {
            return lang._toArray(node.childNodes);
        });
    }, closest:function (query, root) {
        return this._getRelatedUniqueNodes(null, function (node, ary) {
            do {
                if (dquery._filterResult([node], query, root).length) {
                    return node;
                }
            } while (node != root && (node = node.parentNode) && node.nodeType == 1);
            return null;
        });
    }, parent:function (query) {
        return this._getRelatedUniqueNodes(query, function (node, ary) {
            return node.parentNode;
        });
    }, parents:function (query) {
        return this._getRelatedUniqueNodes(query, function (node, ary) {
            var pary = [];
            while (node.parentNode) {
                node = node.parentNode;
                pary.push(node);
            }
            return pary;
        });
    }, siblings:function (query) {
        return this._getRelatedUniqueNodes(query, function (node, ary) {
            var pary = [];
            var nodes = (node.parentNode && node.parentNode.childNodes);
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i] != node) {
                    pary.push(nodes[i]);
                }
            }
            return pary;
        });
    }, next:function (query) {
        return this._getRelatedUniqueNodes(query, function (node, ary) {
            var next = node.nextSibling;
            while (next && next.nodeType != 1) {
                next = next.nextSibling;
            }
            return next;
        });
    }, nextAll:function (query) {
        return this._getRelatedUniqueNodes(query, function (node, ary) {
            var pary = [];
            var next = node;
            while ((next = next.nextSibling)) {
                if (next.nodeType == 1) {
                    pary.push(next);
                }
            }
            return pary;
        });
    }, prev:function (query) {
        return this._getRelatedUniqueNodes(query, function (node, ary) {
            var prev = node.previousSibling;
            while (prev && prev.nodeType != 1) {
                prev = prev.previousSibling;
            }
            return prev;
        });
    }, prevAll:function (query) {
        return this._getRelatedUniqueNodes(query, function (node, ary) {
            var pary = [];
            var prev = node;
            while ((prev = prev.previousSibling)) {
                if (prev.nodeType == 1) {
                    pary.push(prev);
                }
            }
            return pary;
        });
    }, andSelf:function () {
        return this.concat(this._parent);
    }, first:function () {
        return this._wrap(((this[0] && [this[0]]) || []), this);
    }, last:function () {
        return this._wrap((this.length ? [this[this.length - 1]] : []), this);
    }, even:function () {
        return this.filter(function (item, i) {
            return i % 2 != 0;
        });
    }, odd:function () {
        return this.filter(function (item, i) {
            return i % 2 == 0;
        });
    }});
    return NodeList;
});

