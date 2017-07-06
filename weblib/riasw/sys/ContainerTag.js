
define([
	"riasw/riaswBase",
	"riasw/sys/Tag",
	"riasw/sys/_Container"
], function(rias, Tag, _Container){

	var riaswType = "riasw.sys.ContainerTag";
	var Widget = rias.declare(riaswType, [Tag, _Container],{

		//doLayout: false,///不建议自动 layout()。
		parseOnLoad: true,

		destroyDescendants: function(preserveDom){
			if(!preserveDom && this._contentSetter){
				this._contentSetter.empty();
			}
			this.inherited(arguments);
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

			if(!(self._contentSetter && self._contentSetter instanceof rias.dom.html._ContentSetter)){
				self._contentSetter = new rias.dom.html._ContentSetter({
					node: self.containerNode
				});
			}
			return self._contentSetter.setContent((rias.isObject(content) && content.domNode) ? content.domNode : content, setterParams).then(function(result){
				this.onSetContent(result);
				});
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