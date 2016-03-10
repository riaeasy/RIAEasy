//>>built

define("dijit/PopupMenuItem", ["dojo/_base/declare", "dojo/dom-style", "dojo/_base/lang", "dojo/query", "./popup", "./registry", "./MenuItem", "./hccss"], function (declare, domStyle, lang, query, pm, registry, MenuItem) {
    return declare("dijit.PopupMenuItem", MenuItem, {baseClass:"dijitMenuItem dijitPopupMenuItem", _fillContent:function () {
        if (this.srcNodeRef) {
            var nodes = query("*", this.srcNodeRef);
            this.inherited(arguments, [nodes[0]]);
            this.dropDownContainer = this.srcNodeRef;
        }
    }, _openPopup:function (params, focus) {
        var popup = this.popup;
        pm.open(lang.delegate(params, {popup:this.popup, around:this.domNode}));
        if (focus && popup.focus) {
            popup.focus();
        }
    }, _closePopup:function () {
        pm.close(this.popup);
        this.popup.parentMenu = null;
    }, startup:function () {
        if (this._started) {
            return;
        }
        this.inherited(arguments);
        if (!this.popup) {
            var node = query("[widgetId]", this.dropDownContainer)[0];
            this.popup = registry.byNode(node);
        }
        this.ownerDocumentBody.appendChild(this.popup.domNode);
        this.popup.domNode.setAttribute("aria-labelledby", this.containerNode.id);
        this.popup.startup();
        this.popup.domNode.style.display = "none";
        if (this.arrowWrapper) {
            domStyle.set(this.arrowWrapper, "visibility", "");
        }
        this.focusNode.setAttribute("aria-haspopup", "true");
    }, destroyDescendants:function (preserveDom) {
        if (this.popup) {
            if (!this.popup._destroyed) {
                this.popup.destroyRecursive(preserveDom);
            }
            delete this.popup;
        }
        this.inherited(arguments);
    }});
});

