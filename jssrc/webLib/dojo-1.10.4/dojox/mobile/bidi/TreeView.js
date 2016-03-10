//>>built

define("dojox/mobile/bidi/TreeView", ["dojo/_base/declare"], function (declare) {
    return declare(null, {_customizeListItem:function (listItemArgs) {
        listItemArgs.textDir = this.textDir;
        if (!this.isLeftToRight()) {
            listItemArgs.dir = "rtl";
            listItemArgs.transitionDir = -1;
        }
    }});
});

