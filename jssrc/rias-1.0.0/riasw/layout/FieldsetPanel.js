
//RIAStudio client runtime widget - FieldsetPanel

define([
	"rias",
	"rias/riasw/layout/CaptionPanel"
], function(rias, CaptionPanel){

	///由于 css 加载的延迟，造成如果 domNode 的 css 有 padding、margin、border，可能显示不正确，最好移到 _PabelBase 中加载。
	//rias.theme.loadThemeCss([
	//	"riasw/layout/CaptionPanel.css"
	//]);

	///FIXME:zensst. region 为 left/right 时，toggle 不正常。
	var riaswType = "rias.riasw.layout.FieldsetPanel";
	var Widget = rias.declare(riaswType, [CaptionPanel], {
		templateString:
			"<fieldset role='region' class='dijit dijitReset' data-dojo-attach-event='onmouseenter: _onEnter, onmouseleave: _onLeave'>"+
				"<legend role='button' data-dojo-attach-point='captionNode,focusNode' class='riaswFieldsetPanelCaptionNode' data-dojo-attach-event='ondblclick:_toggleMax, onkeydown:_toggleKeydown' role='button'>"+
					'<span data-dojo-attach-point="badgeNode" class="dijitInline ${badgeClass}"></span>'+
					"<span data-dojo-attach-point='toggleNode' class='dijitInline riaswCaptionPanelIconNode riaswCaptionPanelToggleIconNode riaswCaptionPanelToggleIcon' role='presentation'></span>"+
					'<span data-dojo-attach-point="iconNode" class="dijitInline riaswCaptionPanelIconNode16 dijitIcon"></span>'+
					"<span data-dojo-attach-point='labelNode' class='dijitInline riaswCaptionPanelLabelNode'></span>"+
					"<span data-dojo-attach-point='closeNode' class='dijitInline dijitHidden riaswCaptionPanelIconNode riaswCaptionPanelCloseIcon'></span>"+
					"<span data-dojo-attach-point='maxNode' class='dijitInline dijitHidden riaswCaptionPanelIconNode riaswCaptionPanelMaximizeIcon'></span>"+
				"</legend>"+
				//"<div role='region' data-dojo-attach-point='_wrapper' class='dijit dijitReset riaswPanelWrapper'>"+
					"<div role='region' data-dojo-attach-point='containerNode' class='riaswFieldsetPanelContent'></div>"+
				//"</div>" +
			"</fieldset>",
		baseClass: "riaswFieldsetPanel",
		cssStateNodes: {
			focusNode: "riaswFieldsetPanelCaptionNode",
			closeNode: "riaswCaptionPanelIconNode",
			maxNode: "riaswCaptionPanelIconNode",
			toggleNode: "riaswCaptionPanelIconNode",
			labelNode: "riaswCaptionPanelLabelNode",
			containerNode: "riaswFieldsetPanelContent"
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

		_doResize: function(box){
			/// Fieldset 纵向显示需要单独设置 captionNode.height
			var node = this.domNode,
				cs,
				//dns = node.style,
				isV = (this.region == "left" || this.region == "right");
			if(this.isCollapsed()){
				///这里处理可以防止 move 和 resize 的时候改变，同时允许先改变 大小 和 约束
				cs = rias.dom.getComputedStyle(node);
				if(isV){
					//dns.width = this.collapsedHeight + "px";
					box.w = this.collapsedHeight;
					rias.dom.setMarginBox(node, {
						w: box.w
					}, cs);
					if(this.showCaption && this.captionNode){
						rias.dom.setMarginSize(this.captionNode, {
							//h: rias.dom.marginBox2contentBox(node, box, cs).h,
							w: rias.dom.marginBox2contentBox(node, box, cs).w//this.collapsedHeight
						});
						this.captionNode.style.height = "2em";
					}
				}else if(this.region == "top" || this.region == "bottom"){
					//dns.height = this.collapsedHeight + "px";
					box.h = this.collapsedHeight;
					rias.dom.setMarginBox(node, {
						h: box.h
					}, cs);
				}else{
					//dns.height = this.collapsedHeight + "px";
					box.h = this.collapsedHeight;
					//if(this.collapsedWidth > 60){
					//	dns.width = this.collapsedWidth + "px";
					//}
					rias.dom.setMarginBox(node, {
						w: this.collapsedWidth > 60 ? (box.w = this.collapsedWidth) : undefined,
						h: box.h
					}, cs);
				}
				//box = rias.dom.getMarginBox(node);
			}else{
				if(this.isShowNormal()){
					if(!rias.objLike(this._size0, box)){
						this._size0 = rias.mixinDeep(this._size0, box);
						//this._needPosition = false;
						this._saveToCookie();
					}
				}

				if(this.isShowNormal() || this.isShowMax()){
					//this.layout();
					if(this.get("needLayout") || this._needResizeChild || !this._marginBox0 || !rias.dom.boxEqual(box, this._marginBox0, 1)){
						this._marginBox0 = box;
						//console.debug("layout - " + this.id);
						this.layout();
					}else{
						//console.debug("layout pass - " + this.id);
					}
				}
			}
			this._marginBox = box;
		},
		_setDomNodeSize: function(box){
			var node = this.domNode,
				cs,
				w = box.w,
				cb;
			cs = rias.dom.getComputedStyle(node);
			rias.dom.setMarginBox(node, box, cs);
			if(this.restrictBox){
				rias.dom.restrictBox(node, this.restrictBox);
			}
			///需要在 setMarginBox 之后立即 setMarginBox(this.containerNode)，否则 getMarginBox(domNode) 会失真。
			if(rias.dom.hasWidth(node.style, this.region)){
				///各个浏览器对 Fieldset 的 width 处理不同，必须在这里强行设置 containerNode 以保证正确设置 width，及后面能获得正确的 containerNode 的 size,
				// 且，只应该设置 width
				/// containerNode 的 position 是 relative，不应该设置 top 和 left?
				///由于在缩小的时候，有 overflow 存在，重新获取 box 的话，导致 _contentBox 失真
				//cb = rias.dom.getContentMargin(node, cs);
				cb = rias.dom.marginBox2contentBox(node, box, cs);
				rias.dom.setMarginSize(this.containerNode, {
					w: cb.w
				});
			}

			box = rias.dom.getMarginBox(node, cs);
			if(this.restrictPadding >= 0){
				rias.dom.noOverflowCall(this.getParentNode(), function(){
					box = rias.dom.restrict(node, box, this.getParentNode(), this.restrictPadding);
				}, this);
			}
			if(w !== box.w){
				//如果 box 有变化，需要再次设置。
				if(rias.dom.hasWidth(node.style, this.region)){
					cb = rias.dom.marginBox2contentBox(node, box, cs);
					rias.dom.setMarginSize(this.containerNode, {
						w: cb.w
					});
				}
			}
			return box;
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswFieldsetPanelIcon",
		iconClass16: "riaswFieldsetPanelIcon16",
		defaultParams: {
		},
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
