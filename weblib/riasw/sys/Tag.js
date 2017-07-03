
define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_CssStateMixin"
], function(rias, _WidgetBase, _CssStateMixin){

	var riaswType = "riasw.sys.Tag";
	var Widget = rias.declare(riaswType, [_WidgetBase, _CssStateMixin],{
		tagType: "div",
		//postMixInProperties: function(){
		//	this.inherited(arguments);
		//	if(!this.tagType){
		//		this.tagType = "div";
		//	}
		//},
		buildRendering:function () {
			if (!this.domNode) {
				if(this.srcNodeRef && this.srcNodeRef.tagName.toLowerCase() === this.tagType){
					this.domNode = this.srcNodeRef;
				}else{
					this.domNode = rias.dom.create(this.tagType || "div");///强制按 tagType 生成新的 domNode，而不采用 srcNodeRef
				}
			}
			this.tagType = this.domNode.tagName.toLowerCase();
			this.inherited(arguments);
		},
		_getContentAttr: function(){
			return this.domNode.innerHTML;
		},
		_setContentAttr: function(value){
			this.domNode.innerHTML = value;
		}
	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//allowedChild: "",
		property: {
			tagType: {
				datatype: "string",
				title: "tagType"
			},
			content: {
				datatype: "string",
				title: "content"
			}
		}
	};

	return Widget;
});