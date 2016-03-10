//>>built

define("dojox/mobile/bidi/_PickerBase", ["dojo/_base/declare", "dojo/dom-construct"], function (declare, domConstruct) {
    return declare(null, {buildRendering:function () {
        this.inherited(arguments);
        if (!this.isLeftToRight()) {
            for (var i = this.domNode.children.length; i > 0; i--) {
                domConstruct.place(this.domNode.children[0], this.domNode.children[i - 1], "after");
            }
        }
    }});
});

