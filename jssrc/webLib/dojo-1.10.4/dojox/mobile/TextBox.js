//>>built

define("dojox/mobile/TextBox", ["dojo/_base/declare", "dojo/dom-construct", "dijit/_WidgetBase", "dijit/form/_FormValueMixin", "dijit/form/_TextBoxMixin", "dojo/has", "require"], function (declare, domConstruct, WidgetBase, FormValueMixin, TextBoxMixin, has, BidiTextBox) {
    var TextBox = declare(0 ? "dojox.mobile.NonBidiTextBox" : "dojox.mobile.TextBox", [WidgetBase, FormValueMixin, TextBoxMixin], {baseClass:"mblTextBox", _setTypeAttr:null, _setPlaceHolderAttr:function (value) {
        value = this._cv ? this._cv(value) : value;
        this._set("placeHolder", value);
        this.textbox.setAttribute("placeholder", value);
    }, buildRendering:function () {
        if (!this.srcNodeRef) {
            this.srcNodeRef = domConstruct.create("input", {"type":this.type});
        }
        this.inherited(arguments);
        this.textbox = this.focusNode = this.domNode;
    }, postCreate:function () {
        this.inherited(arguments);
        this.connect(this.textbox, "onmouseup", function () {
            this._mouseIsDown = false;
        });
        this.connect(this.textbox, "onmousedown", function () {
            this._mouseIsDown = true;
        });
        this.connect(this.textbox, "onfocus", function (e) {
            this._onFocus(this._mouseIsDown ? "mouse" : e);
            this._mouseIsDown = false;
        });
        this.connect(this.textbox, "onblur", "_onBlur");
    }});
    return 0 ? declare("dojox.mobile.TextBox", [TextBox, BidiTextBox]) : TextBox;
});

