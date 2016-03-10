//>>built

define("dojox/widget/_CalendarView", ["dojo/_base/declare", "dijit/_WidgetBase", "dojo/dom-construct", "dojo/query", "dojo/date", "dojo/_base/window"], function (declare, _WidgetBase, domConstruct, query, dojoDate, win) {
    return declare("dojox.widget._CalendarView", _WidgetBase, {headerClass:"", useHeader:true, cloneClass:function (clazz, n, before) {
        var template = query(clazz, this.domNode)[0];
        var i;
        if (!before) {
            for (i = 0; i < n; i++) {
                template.parentNode.appendChild(template.cloneNode(true));
            }
        } else {
            var bNode = query(clazz, this.domNode)[0];
            for (i = 0; i < n; i++) {
                template.parentNode.insertBefore(template.cloneNode(true), bNode);
            }
        }
    }, _setText:function (node, text) {
        if (node.innerHTML != text) {
            domConstruct.empty(node);
            node.appendChild(win.doc.createTextNode(text));
        }
    }, getHeader:function () {
        return this.header || (this.header = domConstruct.create("span", {"class":this.headerClass}));
    }, onValueSelected:function (date) {
    }, adjustDate:function (date, amount) {
        return dojoDate.add(date, this.datePart, amount);
    }, onDisplay:function () {
    }, onBeforeDisplay:function () {
    }, onBeforeUnDisplay:function () {
    }});
});

