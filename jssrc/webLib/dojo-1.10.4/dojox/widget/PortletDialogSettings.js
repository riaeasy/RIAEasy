//>>built

define("dojox/widget/PortletDialogSettings", ["dojo/_base/declare", "dojo/_base/window", "dojo/dom-style", "./PortletSettings", "dijit/Dialog"], function (declare, window, domStyle, PortletSettings, Dialog) {
    return declare("dojox.widget.PortletDialogSettings", [PortletSettings], {dimensions:null, constructor:function (props, node) {
        this.dimensions = props.dimensions || [300, 100];
    }, toggle:function () {
        if (!this.dialog) {
            this.dialog = new Dialog({title:this.title});
            window.body().appendChild(this.dialog.domNode);
            this.dialog.containerNode.appendChild(this.domNode);
            domStyle.set(this.dialog.domNode, {"width":this.dimensions[0] + "px", "height":this.dimensions[1] + "px"});
            domStyle.set(this.domNode, "display", "");
        }
        if (this.dialog.open) {
            this.dialog.hide();
        } else {
            this.dialog.show(this.domNode);
        }
    }});
});

