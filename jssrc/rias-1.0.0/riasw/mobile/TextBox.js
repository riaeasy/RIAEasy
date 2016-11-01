
//RIAStudio client runtime widget - TextBox

define([
	"rias",
	"dijit/_WidgetBase",
	"rias/riasw/form/_FormValueMixin",
	"dijit/form/_TextBoxMixin"
], function(rias, _WidgetBase, _FormValueMixin, _TextBoxMixin){

	///已经 extend 了 _TextBoxMixin

	//_Widget.extend({
	//	editable: true
	//});

	rias.theme.loadMobileThemeCss([
		"TextBox.css"
	]);

	var riaswType = "rias.riasw.mobile.TextBox";
	var Widget = rias.declare(riaswType, [_WidgetBase, _FormValueMixin, _TextBoxMixin], {
		// summary:
		//		A non-templated base class for textbox form inputs

		baseClass: "mblTextBox",

		// Override automatic assigning type --> node, it causes exception on IE8.
		// Instead, type must be specified as this.type when the node is created, as part of the original DOM
		_setTypeAttr: null,

		// Map widget attributes to DOMNode attributes.
		_setPlaceHolderAttr: function(/*String*/value){
			value = this._cv ? this._cv(value) : value;
			this._set("placeHolder", value);
			this.textbox.setAttribute("placeholder", value);
		},

		buildRendering: function(){
			if(!this.srcNodeRef){
				this.srcNodeRef = rias.dom.create("input", {"type":this.type});
			}
			this.inherited(arguments);
			this.textbox = this.focusNode = this.domNode;
		},

		postCreate: function(){
			this.inherited(arguments);
			this.connect(this.textbox, "onmouseup", function(){ this._mouseIsDown = false; });
			this.connect(this.textbox, "onmousedown", function(){ this._mouseIsDown = true; });
			this.connect(this.textbox, "onfocus", function(e){
				this._onFocus(this._mouseIsDown ? "mouse" : e);
				this._mouseIsDown = false;
			});
			this.connect(this.textbox, "onblur", "_onBlur");
		},

		_setTextDirAttr: function(/*String*/ textDir){
			if(!this._created || this.textDir != textDir){
				this._set("textDir", textDir);
				if(this.value){
					this.applyTextDir(this.focusNode || this.textbox);
				}
				else{
					this.applyTextDir(this.focusNode || this.textbox, this.textbox.getAttribute("placeholder"));
				}
			}
		},

		_setDirAttr: function(/*String*/ dir){
			if(!(this.textDir && this.textbox)){
				this.dir = dir;
			}
		},

		_onBlur: function(e){
			this.inherited(arguments);
			if(!this.textbox.value){
				this.applyTextDir(this.textbox, this.textbox.getAttribute("placeholder"));
			}
		},

		_onInput: function(e){
			this.inherited(arguments);
			if(!this.textbox.value){
				this.applyTextDir(this.textbox, this.textbox.getAttribute("placeholder"));
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTextBoxIcon",
		iconClass16: "riaswTextBoxIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
