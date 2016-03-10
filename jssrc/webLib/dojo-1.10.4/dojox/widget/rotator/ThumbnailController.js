//>>built

define("dojox/widget/rotator/ThumbnailController", ["dojo/_base/declare", "dojo/_base/connect", "dojo/_base/lang", "dojo/_base/event", "dojo/aspect", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-construct", "dojo/query"], function (declare, connect, lang, event, aspect, domAttr, domClass, domConstruct, query) {
    var _css = "dojoxRotatorThumb", _selected = _css + "Selected";
    return declare("dojox.widget.rotator.ThumbnailController", null, {rotator:null, constructor:function (params, node) {
        lang.mixin(this, params);
        this._domNode = node;
        var r = this.rotator;
        if (r) {
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
            for (var i = 0; i < r.panes.length; i++) {
                var n = r.panes[i].node, s = domAttr.get(n, "thumbsrc") || domAttr.get(n, "src"), t = domAttr.get(n, "alt") || "";
                if (/img/i.test(n.tagName)) {
                    (function (j) {
                        domConstruct.create("a", {classname:_css + " " + _css + j + " " + (j == r.idx ? _selected : ""), href:s, onclick:function (e) {
                            event.stop(e);
                            if (r) {
                                r.control.apply(r, ["go", j]);
                            }
                        }, title:t, innerHTML:"<img src=\"" + s + "\" alt=\"" + t + "\"/>"}, node);
                    })(i);
                }
            }
            aspect.after(r, "onUpdate", lang.hitch(this, "_onUpdate"), true);
        }
    }, destroy:function () {
        domConstruct.destroy(this._domNode);
    }, _onUpdate:function (type) {
        var r = this.rotator;
        if (type == "onAfterTransition") {
            var n = query("." + _css, this._domNode).removeClass(_selected);
            if (r.idx < n.length) {
                domClass.add(n[r.idx], _selected);
            }
        }
    }});
});

