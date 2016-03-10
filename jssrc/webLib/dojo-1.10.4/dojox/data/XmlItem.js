//>>built

define("dojox/data/XmlItem", ["dojo/_base/declare"], function (declare) {
    return declare("dojox.data.XmlItem", null, {constructor:function (element, store, query) {
        this.element = element;
        this.store = store;
        this.q = query;
    }, toString:function () {
        var str = "";
        if (this.element) {
            for (var i = 0; i < this.element.childNodes.length; i++) {
                var node = this.element.childNodes[i];
                if (node.nodeType === 3 || node.nodeType === 4) {
                    str += node.nodeValue;
                }
            }
        }
        return str;
    }});
});

