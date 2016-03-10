//>>built

define("dijit/ToolbarSeparator", ["dojo/_base/declare", "dojo/dom", "./_Widget", "./_TemplatedMixin"], function (declare, dom, _Widget, _TemplatedMixin) {
    return declare("dijit.ToolbarSeparator", [_Widget, _TemplatedMixin], {templateString:"<div class=\"dijitToolbarSeparator dijitInline\" role=\"presentation\"></div>", buildRendering:function () {
        this.inherited(arguments);
        dom.setSelectable(this.domNode, false);
    }, isFocusable:function () {
        return false;
    }});
});

