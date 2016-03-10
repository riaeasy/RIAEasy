//>>built

define("dojox/mobile/ExpandingTextArea", ["dojo/_base/declare", "dijit/form/_ExpandingTextAreaMixin", "./TextArea"], function (declare, ExpandingTextAreaMixin, TextArea) {
    return declare("dojox.mobile.ExpandingTextArea", [TextArea, ExpandingTextAreaMixin], {baseClass:"mblTextArea mblExpandingTextArea"});
});

