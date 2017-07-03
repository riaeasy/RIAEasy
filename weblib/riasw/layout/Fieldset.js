
//RIAStudio client runtime widget - Fieldset

define([
	"riasw/riaswBase",
	"riasw/layout/CaptionPanel"
], function(rias, CaptionPanel){

	///由于 css 加载的延迟，造成如果 domNode 的 css 有 padding、margin、border，可能显示不正确，最好移到 _PabelBase 中加载。
	//rias.theme.loadThemeCss([
	//	"riasw/layout/CaptionPanel.css"
	//]);

	///FIXME:zensst. region 为 left/right 时，toggle 不正常。
	var riaswType = "riasw.layout.Fieldset";
	var Widget = rias.declare(riaswType, [CaptionPanel], {
		templateString:
			"<fieldset role='region' class='dijitReset' data-dojo-attach-event='onmouseenter: _onMouseEnter, onmouseleave: _onMouseLeave'>"+
				"<legend role='button' data-dojo-attach-point='captionContainer,captionNode,focusNode' class='riaswFieldsetCaptionNode' data-dojo-attach-event='ondblclick:_toggleMax, onkeydown:_toggleKeydown' role='button'>"+
					/// float 元素需要提前显示
					/// Fieldset 不适宜设置 caption 宽度，故 closeNode、maxNode 不用 floatRight
					"<span data-dojo-attach-point='badgeNode' class='${badgeClass}'></span>"+
					"<span data-dojo-attach-point='iconNode' class='riaswButtonIcon riaswNoIcon'></span>"+
					"<span data-dojo-attach-point='labelNode' class='riaswButtonLabel riaswNoLabel'></span>"+
					"<div role='region' data-dojo-attach-point='captionToolsNode' class='dijitInline riaswCaptionToolsNode'>"+
					"</div>"+
				"</legend>"+
				"<div role='region' data-dojo-attach-point='containerNode' class='riaswFieldsetContent'></div>"+
			"</fieldset>",
		baseClass: "riaswFieldset",
		cssStateNodes: {
			focusNode: "riaswFieldsetCaptionNode",
			containerNode: "riaswFieldsetContent"
		},

		postCreate: function() {
			if(!this.caption){
				var legends = rias.dom.query('legend', this.containerNode);
				if(legends.length) { // oops, no legend?
					this.set('caption', legends[0].innerHTML);
					legends[0].parentNode.removeChild(legends[0]);
				}
			}
			this.set('title', this.caption);

			this.inherited(arguments);
		},

		_resizeDomNode: function(box, cs){
			/// Fieldset 纵向显示需要单独设置 captionNode.height
			if(this.isCollapsed()){
				///这里处理可以防止 move 和 resize 的时候改变，同时允许先改变 大小 和 约束
				if((this.region === "left" || this.region === "right")){
					box.w = this.collapsedHeight;
					if(this.showCaption && this.captionNode){
						rias.dom.noOverflowCall(this.captionNode, function(){
							rias.dom.setMarginSize(this.captionNode, {
								//h: rias.dom.marginBox2contentBox(node, box, cs).h,
								w: rias.dom.marginBox2contentBox(this.domNode, box, cs).w//this.collapsedHeight
							});
							this.captionNode.style.height = "2em";
						}, this);
					}
				}else if(this.region === "top" || this.region === "bottom"){
					box.h = this.collapsedHeight;
				}else{
					box.h = this.collapsedHeight;
					if(this.collapsedWidth > 60){
						box.w = this.collapsedWidth;
					}
				}
			}
			rias.dom.setMarginBox(this.domNode, box, cs);
		}

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//allowedChild: "",
		property: {
			"caption": {
				"datatype": "string",
				"description": "The state of the Panel.",
				"hidden": false
			}
		}
	};

	return Widget;

});
