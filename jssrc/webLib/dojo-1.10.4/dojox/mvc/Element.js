//>>built

define("dojox/mvc/Element", ["dojo/_base/declare", "dijit/_WidgetBase"], function (declare, _WidgetBase) {
    return declare("dojox.mvc.Element", _WidgetBase, {_setInnerTextAttr:{node:"domNode", type:"innerText"}, _setInnerHTMLAttr:{node:"domNode", type:"innerHTML"}, buildRendering:function () {
        this.inherited(arguments);
        if (/select|input|textarea/i.test(this.domNode.tagName)) {
            var _self = this, node = this.focusNode = this.domNode;
            this.on("change", function (e) {
                var attr = /^checkbox$/i.test(node.getAttribute("type")) ? "checked" : "value";
                _self._set(attr, _self.get(attr));
            });
        }
    }, _getCheckedAttr:function () {
        return this.domNode.checked;
    }, _getValueAttr:function () {
        return this.domNode.value;
    }});
});

