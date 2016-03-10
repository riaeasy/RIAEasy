//>>built

define("dojox/mobile/IconMenu", ["dojo/_base/declare", "dojo/sniff", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-style", "dojo/dom-attr", "dijit/_Contained", "dijit/_Container", "dijit/_WidgetBase", "require", "./IconMenuItem"], function (declare, has, domClass, domConstruct, domStyle, domAttr, Contained, Container, WidgetBase, BidiIconMenu) {
    var IconMenu = declare(0 ? "dojox.mobile.NonBidiIconMenu" : "dojox.mobile.IconMenu", [WidgetBase, Container, Contained], {transition:"slide", iconBase:"", iconPos:"", cols:3, tag:"ul", selectOne:false, baseClass:"mblIconMenu", childItemClass:"mblIconMenuItem", _createTerminator:false, buildRendering:function () {
        this.domNode = this.containerNode = this.srcNodeRef || domConstruct.create(this.tag);
        domAttr.set(this.domNode, "role", "menu");
        this.inherited(arguments);
        if (this._createTerminator) {
            var t = this._terminator = domConstruct.create("br");
            t.className = this.childItemClass + "Terminator";
            this.domNode.appendChild(t);
        }
    }, startup:function () {
        if (this._started) {
            return;
        }
        this.refresh();
        this.inherited(arguments);
    }, refresh:function () {
        var p = this.getParent();
        if (p) {
            domClass.remove(p.domNode, "mblSimpleDialogDecoration");
        }
        var children = this.getChildren();
        if (this.cols) {
            var nRows = Math.ceil(children.length / this.cols);
            var w = Math.floor(100 / this.cols);
            var _w = 100 - w * this.cols;
            var h = Math.floor(100 / nRows);
            var _h = 100 - h * nRows;
            if (has("ie")) {
                _w--;
                _h--;
            }
        }
        for (var i = 0; i < children.length; i++) {
            var item = children[i];
            if (this.cols) {
                var first = ((i % this.cols) === 0);
                var last = (((i + 1) % this.cols) === 0);
                var rowIdx = Math.floor(i / this.cols);
                domStyle.set(item.domNode, {width:w + (last ? _w : 0) + "%", height:h + ((rowIdx + 1 === nRows) ? _h : 0) + "%"});
                domClass.toggle(item.domNode, this.childItemClass + "FirstColumn", first);
                domClass.toggle(item.domNode, this.childItemClass + "LastColumn", last);
                domClass.toggle(item.domNode, this.childItemClass + "FirstRow", rowIdx === 0);
                domClass.toggle(item.domNode, this.childItemClass + "LastRow", rowIdx + 1 === nRows);
            }
        }
    }, addChild:function (widget, insertIndex) {
        this.inherited(arguments);
        this.refresh();
    }, hide:function () {
        var p = this.getParent();
        if (p && p.hide) {
            p.hide();
        }
    }});
    return 0 ? declare("dojox.mobile.IconMenu", [IconMenu, BidiIconMenu]) : IconMenu;
});

