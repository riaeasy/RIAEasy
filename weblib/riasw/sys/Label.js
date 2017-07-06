
define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_CssStateMixin"
], function(rias, _WidgetBase, _CssStateMixin){

	var riaswType = "riasw.sys.Label";
	var Widget = rias.declare(riaswType, [_WidgetBase, _CssStateMixin],{

		baseClass: "riaswLabel",

		label: "",
		textAlign: "left",

		buildRendering:function () {
			if (!this.domNode) {
				if(this.srcNodeRef && this.srcNodeRef.tagName.toLowerCase() === "span"){
					this.domNode = this.srcNodeRef;
				}else{
					this.domNode = rias.dom.create("span");///强制按 tagType 生成新的 domNode，而不采用 srcNodeRef
				}
			}
			rias.dom.addClass(this.domNode, "dijitReset");
			this.inherited(arguments);
			this.labelNode = this.domNode;
		},

		isFocusable: function(){
			return false;
		},

		_setTextAlign: function(value){
			//this._set("textAlign", value);
			this.textAlign = value;
			rias.dom.toggleClass(this.domNode, "riaswAlignLeft", value === "left");
			rias.dom.toggleClass(this.domNode, "riaswAlignRight", value === "right");
			rias.dom.toggleClass(this.domNode, "riaswAlignCenter", value === "center");
		},
		onSetLabel: function(value){
		},
		_setLabelAttr: function(value){
			this._set("label", value);
			this.labelNode.innerHTML = value;
			this.onSetLabel(value);
			this.resize();
		}
	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//allowedChild: "",
		property: {
			label: {
				datatype: "string",
				title: "label"
			}
		}
	};

	return Widget;
});