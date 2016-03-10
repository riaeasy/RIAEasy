//>>built

define("dojox/form/Manager", ["dijit/_Widget", "dijit/_AttachMixin", "dijit/_WidgetsInTemplateMixin", "./manager/_Mixin", "./manager/_NodeMixin", "./manager/_FormMixin", "./manager/_ValueMixin", "./manager/_EnableMixin", "./manager/_DisplayMixin", "./manager/_ClassMixin", "dojo/_base/declare"], function (_Widget, _AttachMixin, _WidgetsInTemplateMixin, _Mixin, _NodeMixin, _FormMixin, _ValueMixin, _EnableMixin, _DisplayMixin, _ClassMixin, declare) {
    return declare("dojox.form.Manager", [_Widget, _WidgetsInTemplateMixin, _AttachMixin, _Mixin, _NodeMixin, _FormMixin, _ValueMixin, _EnableMixin, _DisplayMixin, _ClassMixin], {searchContainerNode:true, buildRendering:function () {
        if (!this.containerNode) {
            this.containerNode = this.srcNodeRef;
        }
        this.inherited(arguments);
    }});
});

