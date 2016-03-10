//>>built

define("dojo/dnd/Target", ["../_base/declare", "../dom-class", "./Source"], function (declare, domClass, Source) {
    return declare("dojo.dnd.Target", Source, {constructor:function () {
        this.isSource = false;
        domClass.remove(this.node, "dojoDndSource");
    }});
});

