//>>built

define("dojo/dnd/Avatar", ["../_base/declare", "../_base/window", "../dom", "../dom-attr", "../dom-class", "../dom-construct", "../hccss", "../query"], function (declare, win, dom, domAttr, domClass, domConstruct, has, query) {
    return declare("dojo.dnd.Avatar", null, {constructor:function (manager) {
        this.manager = manager;
        this.construct();
    }, construct:function () {
        var a = domConstruct.create("table", {"class":"dojoDndAvatar", style:{position:"absolute", zIndex:"1999", margin:"0px"}}), source = this.manager.source, node, b = domConstruct.create("tbody", null, a), tr = domConstruct.create("tr", null, b), td = domConstruct.create("td", null, tr), k = Math.min(5, this.manager.nodes.length), i = 0;
        if (has("highcontrast")) {
            domConstruct.create("span", {id:"a11yIcon", innerHTML:this.manager.copy ? "+" : "<"}, td);
        }
        domConstruct.create("span", {innerHTML:source.generateText ? this._generateText() : ""}, td);
        domAttr.set(tr, {"class":"dojoDndAvatarHeader", style:{opacity:0.9}});
        for (; i < k; ++i) {
            if (source.creator) {
                node = source._normalizedCreator(source.getItem(this.manager.nodes[i].id).data, "avatar").node;
            } else {
                node = this.manager.nodes[i].cloneNode(true);
                if (node.tagName.toLowerCase() == "tr") {
                    var table = domConstruct.create("table"), tbody = domConstruct.create("tbody", null, table);
                    tbody.appendChild(node);
                    node = table;
                }
            }
            node.id = "";
            tr = domConstruct.create("tr", null, b);
            td = domConstruct.create("td", null, tr);
            td.appendChild(node);
            domAttr.set(tr, {"class":"dojoDndAvatarItem", style:{opacity:(9 - i) / 10}});
        }
        this.node = a;
    }, destroy:function () {
        domConstruct.destroy(this.node);
        this.node = false;
    }, update:function () {
        domClass.toggle(this.node, "dojoDndAvatarCanDrop", this.manager.canDropFlag);
        if (has("highcontrast")) {
            var icon = dom.byId("a11yIcon");
            var text = "+";
            if (this.manager.canDropFlag && !this.manager.copy) {
                text = "< ";
            } else {
                if (!this.manager.canDropFlag && !this.manager.copy) {
                    text = "o";
                } else {
                    if (!this.manager.canDropFlag) {
                        text = "x";
                    }
                }
            }
            icon.innerHTML = text;
        }
        query(("tr.dojoDndAvatarHeader td span" + (has("highcontrast") ? " span" : "")), this.node).forEach(function (node) {
            node.innerHTML = this.manager.source.generateText ? this._generateText() : "";
        }, this);
    }, _generateText:function () {
        return this.manager.nodes.length.toString();
    }});
});

