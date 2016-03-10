//>>built

define("dijit/layout/LinkPane", ["./ContentPane", "../_TemplatedMixin", "dojo/_base/declare"], function (ContentPane, _TemplatedMixin, declare) {
    return declare("dijit.layout.LinkPane", [ContentPane, _TemplatedMixin], {templateString:"<div class=\"dijitLinkPane\" data-dojo-attach-point=\"containerNode\"></div>", postMixInProperties:function () {
        if (this.srcNodeRef) {
            this.title += this.srcNodeRef.innerHTML;
        }
        this.inherited(arguments);
    }, _fillContent:function () {
    }});
});

