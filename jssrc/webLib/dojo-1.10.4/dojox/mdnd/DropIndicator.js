//>>built

define("dojox/mdnd/DropIndicator", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/dom-class", "dojo/dom-construct", "./AreaManager"], function (dojo, declare, domClass, domConstruct) {
    var di = declare("dojox.mdnd.DropIndicator", null, {node:null, constructor:function () {
        var dropIndicator = document.createElement("div");
        var subDropIndicator = document.createElement("div");
        dropIndicator.appendChild(subDropIndicator);
        domClass.add(dropIndicator, "dropIndicator");
        this.node = dropIndicator;
    }, place:function (area, nodeRef, size) {
        if (size) {
            this.node.style.height = size.h + "px";
        }
        try {
            if (nodeRef) {
                area.insertBefore(this.node, nodeRef);
            } else {
                area.appendChild(this.node);
            }
            return this.node;
        }
        catch (e) {
            return null;
        }
    }, remove:function () {
        if (this.node) {
            this.node.style.height = "";
            if (this.node.parentNode) {
                this.node.parentNode.removeChild(this.node);
            }
        }
    }, destroy:function () {
        if (this.node) {
            if (this.node.parentNode) {
                this.node.parentNode.removeChild(this.node);
            }
            domConstruct.destroy(this.node);
            delete this.node;
        }
    }});
    dojox.mdnd.areaManager()._dropIndicator = new dojox.mdnd.DropIndicator();
    return di;
});

