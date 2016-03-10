//>>built

define("dojox/mobile/CheckBox", ["dojo/_base/declare", "dojo/dom-construct", "dijit/form/_CheckBoxMixin", "./ToggleButton", "./sniff"], function (declare, domConstruct, CheckBoxMixin, ToggleButton, has) {
    return declare("dojox.mobile.CheckBox", [ToggleButton, CheckBoxMixin], {baseClass:"mblCheckBox", _setTypeAttr:function () {
    }, buildRendering:function () {
        if (!this.templateString && !this.srcNodeRef) {
            this.srcNodeRef = domConstruct.create("input", {type:this.type});
        }
        this.inherited(arguments);
        if (!this.templateString) {
            this.focusNode = this.domNode;
        }
        if (has("windows-theme")) {
            var rootNode = domConstruct.create("span", {className:"mblCheckableInputContainer"});
            rootNode.appendChild(this.domNode.cloneNode());
            this.labelNode = domConstruct.create("span", {className:"mblCheckableInputDecorator"}, rootNode);
            this.domNode = rootNode;
            this.focusNode = rootNode.firstChild;
        }
    }, _getValueAttr:function () {
        return (this.checked ? this.value : false);
    }});
});

