//>>built

define("dojox/mobile/bidi/Accordion", ["dojo/_base/declare", "./common", "dojo/dom-class"], function (declare, common, domClass) {
    return declare(null, {_setupChild:function (child) {
        if (this.textDir) {
            child.label = common.enforceTextDirWithUcc(child.label, this.textDir);
        }
        this.inherited(arguments);
    }, _setIconDir:function (iconNode) {
        domClass.add(iconNode, "mblAccordionIconParentRtl");
    }});
});

