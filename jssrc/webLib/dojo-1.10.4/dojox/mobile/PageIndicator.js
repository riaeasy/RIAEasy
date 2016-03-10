//>>built

define("dojox/mobile/PageIndicator", ["dojo/_base/connect", "dojo/_base/declare", "dojo/dom", "dojo/dom-class", "dojo/dom-construct", "dijit/registry", "dijit/_Contained", "dijit/_WidgetBase", "dojo/i18n!dojox/mobile/nls/messages"], function (connect, declare, dom, domClass, domConstruct, registry, Contained, WidgetBase, messages) {
    return declare("dojox.mobile.PageIndicator", [WidgetBase, Contained], {refId:"", baseClass:"mblPageIndicator", buildRendering:function () {
        this.inherited(arguments);
        this.domNode.setAttribute("role", "img");
        this._tblNode = domConstruct.create("table", {className:"mblPageIndicatorContainer"}, this.domNode);
        this._tblNode.insertRow(-1);
        this.connect(this.domNode, "onclick", "_onClick");
        this.subscribe("/dojox/mobile/viewChanged", function (view) {
            this.reset();
        });
    }, startup:function () {
        var _this = this;
        _this.defer(function () {
            _this.reset();
        });
    }, reset:function () {
        var r = this._tblNode.rows[0];
        var i, c, a = [], dot, value = 0;
        var refNode = (this.refId && dom.byId(this.refId)) || this.domNode;
        var children = refNode.parentNode.childNodes;
        for (i = 0; i < children.length; i++) {
            c = children[i];
            if (this.isView(c)) {
                a.push(c);
            }
        }
        if (r.cells.length !== a.length) {
            domConstruct.empty(r);
            for (i = 0; i < a.length; i++) {
                c = a[i];
                dot = domConstruct.create("div", {className:"mblPageIndicatorDot"});
                r.insertCell(-1).appendChild(dot);
            }
        }
        if (a.length === 0) {
            return;
        }
        var currentView = registry.byNode(a[0]).getShowingView();
        for (i = 0; i < r.cells.length; i++) {
            dot = r.cells[i].firstChild;
            if (a[i] === currentView.domNode) {
                value = i + 1;
                domClass.add(dot, "mblPageIndicatorDotSelected");
            } else {
                domClass.remove(dot, "mblPageIndicatorDotSelected");
            }
        }
        if (r.cells.length) {
            this.domNode.setAttribute("alt", messages["PageIndicatorLabel"].replace("$0", value).replace("$1", r.cells.length));
        } else {
            this.domNode.removeAttribute("alt");
        }
    }, isView:function (node) {
        return (node && node.nodeType === 1 && domClass.contains(node, "mblView"));
    }, _onClick:function (e) {
        if (this.onClick(e) === false) {
            return;
        }
        if (e.target !== this.domNode) {
            return;
        }
        if (e.layerX < this._tblNode.offsetLeft) {
            connect.publish("/dojox/mobile/prevPage", [this]);
        } else {
            if (e.layerX > this._tblNode.offsetLeft + this._tblNode.offsetWidth) {
                connect.publish("/dojox/mobile/nextPage", [this]);
            }
        }
    }, onClick:function () {
    }});
});

