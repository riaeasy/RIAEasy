//>>built

define("dojox/mobile/bidi/_StoreListMixin", ["dojo/_base/declare"], function (declare) {
    return declare(null, {createListItem:function (item) {
        var w = this.inherited(arguments);
        w.set("textDir", this.textDir);
        return w;
    }});
});

