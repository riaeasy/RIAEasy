
define([
	"rias",
	"dijit/_Widget",
	"dijit/_CssStateMixin"
], function(rias, _Widget, _CssStateMixin){

	var riaswType = "rias.riasw.html.Tag";
	var Widget = rias.declare(riaswType, [_Widget, _CssStateMixin],{
		postscript: function(/*Object?*/params, /*DomNode|String*/srcNodeRef){
			if(!params.tagType){
				params.tagType = "div";
			}
			//this.inherited(arguments, [params, srcNodeRef || rias.dom.create(params.tagType || "div", params.attrs)]);
			this.inherited(arguments);
			this.tagType = this.domNode.tagName.toLowerCase();
		},
		buildRendering:function () {
			if (!this.domNode) {
				if(this.srcNodeRef && this.srcNodeRef.tagName.toLowerCase() === this.tagType){
					this.domNode = this.srcNodeRef;
				}else{
					this.domNode = rias.dom.create(this.tagType || "div", this.attrs);///强制按 tagType 生成新的 domNode，而不采用 srcNodeRef
				}
			}
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
		iconClass: "riaswTagIcon",
		iconClass16: "riaswTagIcon16",
		defaultParams: {
			tagType: "div"
		},
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
			},
			innerHTML: {
				datatype: "string",
				title: "innerHTML"
			}
		}
	};

	return Widget;
});