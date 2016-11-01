
define([
	"rias",
	"dijit/_Widget",
	"dijit/_Container",
	"dijit/_Contained",
	"dijit/_CssStateMixin"
], function(rias, _Widget, _Container, _Contained, _CssStateMixin){

	var riaswType = "rias.riasw.html.ContainerTag";
	var Widget = rias.declare(riaswType, [_Widget, _Container, _CssStateMixin],{

		//doLayout: false,///不建议自动 layout()。
		parseOnLoad: true,

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
		destroyDescendants: function(preserveDom){
			if(this._contentSetter){
				this._contentSetter.empty();
			}
			this.inherited(arguments);
			if(!preserveDom && this.containerNode){
				rias.dom.empty(this.containerNode);/// 兼容 ie，ie 不能对 null 用 in
			}
		},
		_getContentAttr: function(){
			return this.containerNode.innerHTML;
		},
		_setContentAttr: function(content){
			//this.destroyDescendants();
			//this.containerNode.innerHTML = value;
			///该方法不继承。继承不好处理。
			var self = this;

			self.destroyDescendants();

			var setterParams = rias.mixin({
				cleanContent: self.cleanContent,
				extractContent: self.extractContent,
				parseContent: !content.domNode && self.parseOnLoad,
				parserScope: self.parserScope,
				startup: false,/// 用 _startChildren 手动 startup。
				dir: self.dir,
				lang: self.lang,
				textDir: self.textDir
			}, self._contentSetterParams || {});

			if(!(self._contentSetter && self._contentSetter instanceof rias.html._ContentSetter)){
				self._contentSetter = new rias.html._ContentSetter({
					node: self.containerNode
				});
			}
			return self._contentSetter.setContent((rias.isObject(content) && content.domNode) ? content.domNode : content, setterParams);
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