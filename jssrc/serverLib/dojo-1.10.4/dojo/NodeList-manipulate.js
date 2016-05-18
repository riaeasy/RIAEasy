//>>built

define("dojo/NodeList-manipulate", ["./query", "./_base/lang", "./_base/array", "./dom-construct", "./dom-attr", "./NodeList-dom"], function (dquery, lang, array, construct, attr) {
    var NodeList = dquery.NodeList;
    function getWrapInsertion(node) {
        while (node.childNodes[0] && node.childNodes[0].nodeType == 1) {
            node = node.childNodes[0];
        }
        return node;
    }
    function makeWrapNode(html, refNode) {
        if (typeof html == "string") {
            html = construct.toDom(html, (refNode && refNode.ownerDocument));
            if (html.nodeType == 11) {
                html = html.childNodes[0];
            }
        } else {
            if (html.nodeType == 1 && html.parentNode) {
                html = html.cloneNode(false);
            }
        }
        return html;
    }
    lang.extend(NodeList, {_placeMultiple:function (query, position) {
        var nl2 = typeof query == "string" || query.nodeType ? dquery(query) : query;
        var toAdd = [];
        for (var i = 0; i < nl2.length; i++) {
            var refNode = nl2[i];
            var length = this.length;
            for (var j = length - 1, item; item = this[j]; j--) {
                if (i > 0) {
                    item = this._cloneNode(item);
                    toAdd.unshift(item);
                }
                if (j == length - 1) {
                    construct.place(item, refNode, position);
                } else {
                    refNode.parentNode.insertBefore(item, refNode);
                }
                refNode = item;
            }
        }
        if (toAdd.length) {
            toAdd.unshift(0);
            toAdd.unshift(this.length - 1);
            Array.prototype.splice.apply(this, toAdd);
        }
        return this;
    }, innerHTML:function (value) {
        if (arguments.length) {
            return this.addContent(value, "only");
        } else {
            return this[0].innerHTML;
        }
    }, text:function (value) {
        if (arguments.length) {
            for (var i = 0, node; node = this[i]; i++) {
                if (node.nodeType == 1) {
                    attr.set(node, "textContent", value);
                }
            }
            return this;
        } else {
            var result = "";
            for (i = 0; node = this[i]; i++) {
                result += attr.get(node, "textContent");
            }
            return result;
        }
    }, val:function (value) {
        if (arguments.length) {
            var isArray = lang.isArray(value);
            for (var index = 0, node; node = this[index]; index++) {
                var name = node.nodeName.toUpperCase();
                var type = node.type;
                var newValue = isArray ? value[index] : value;
                if (name == "SELECT") {
                    var opts = node.options;
                    for (var i = 0; i < opts.length; i++) {
                        var opt = opts[i];
                        if (node.multiple) {
                            opt.selected = (array.indexOf(value, opt.value) != -1);
                        } else {
                            opt.selected = (opt.value == newValue);
                        }
                    }
                } else {
                    if (type == "checkbox" || type == "radio") {
                        node.checked = (node.value == newValue);
                    } else {
                        node.value = newValue;
                    }
                }
            }
            return this;
        } else {
            node = this[0];
            if (!node || node.nodeType != 1) {
                return undefined;
            }
            value = node.value || "";
            if (node.nodeName.toUpperCase() == "SELECT" && node.multiple) {
                value = [];
                opts = node.options;
                for (i = 0; i < opts.length; i++) {
                    opt = opts[i];
                    if (opt.selected) {
                        value.push(opt.value);
                    }
                }
                if (!value.length) {
                    value = null;
                }
            }
            return value;
        }
    }, append:function (content) {
        return this.addContent(content, "last");
    }, appendTo:function (query) {
        return this._placeMultiple(query, "last");
    }, prepend:function (content) {
        return this.addContent(content, "first");
    }, prependTo:function (query) {
        return this._placeMultiple(query, "first");
    }, after:function (content) {
        return this.addContent(content, "after");
    }, insertAfter:function (query) {
        return this._placeMultiple(query, "after");
    }, before:function (content) {
        return this.addContent(content, "before");
    }, insertBefore:function (query) {
        return this._placeMultiple(query, "before");
    }, remove:NodeList.prototype.orphan, wrap:function (html) {
        if (this[0]) {
            html = makeWrapNode(html, this[0]);
            for (var i = 0, node; node = this[i]; i++) {
                var clone = this._cloneNode(html);
                if (node.parentNode) {
                    node.parentNode.replaceChild(clone, node);
                }
                var insertion = getWrapInsertion(clone);
                insertion.appendChild(node);
            }
        }
        return this;
    }, wrapAll:function (html) {
        if (this[0]) {
            html = makeWrapNode(html, this[0]);
            this[0].parentNode.replaceChild(html, this[0]);
            var insertion = getWrapInsertion(html);
            for (var i = 0, node; node = this[i]; i++) {
                insertion.appendChild(node);
            }
        }
        return this;
    }, wrapInner:function (html) {
        if (this[0]) {
            html = makeWrapNode(html, this[0]);
            for (var i = 0; i < this.length; i++) {
                var clone = this._cloneNode(html);
                this._wrap(lang._toArray(this[i].childNodes), null, this._NodeListCtor).wrapAll(clone);
            }
        }
        return this;
    }, replaceWith:function (content) {
        content = this._normalize(content, this[0]);
        for (var i = 0, node; node = this[i]; i++) {
            this._place(content, node, "before", i > 0);
            node.parentNode.removeChild(node);
        }
        return this;
    }, replaceAll:function (query) {
        var nl = dquery(query);
        var content = this._normalize(this, this[0]);
        for (var i = 0, node; node = nl[i]; i++) {
            this._place(content, node, "before", i > 0);
            node.parentNode.removeChild(node);
        }
        return this;
    }, clone:function () {
        var ary = [];
        for (var i = 0; i < this.length; i++) {
            ary.push(this._cloneNode(this[i]));
        }
        return this._wrap(ary, this, this._NodeListCtor);
    }});
    if (!NodeList.prototype.html) {
        NodeList.prototype.html = NodeList.prototype.innerHTML;
    }
    return NodeList;
});

