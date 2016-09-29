
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
			"<fieldset role='region' class='dijit dijitReset' data-dojo-attach-event='onmouseenter: _onEnter, onmouseleave: _onBlur'>"+
				"<legend role='button' data-dojo-attach-point='captionNode,focusNode' class='riaswFieldsetPanelCaptionNode' data-dojo-attach-event='ondblclick:_toggleMax, onkeydown:_toggleKeydown' role='button'>"+
					'<span data-dojo-attach-point="badgeNode" class="dijitInline ${badgeClass}"></span>'+
					"<span data-dojo-attach-point='toggleNode' class='dijitInline riaswCaptionPanelIconNode riaswCaptionPanelToggleIconNode riaswCaptionPanelToggleIcon' role='presentation'></span>"+
					'<span data-dojo-attach-point="iconNode" class="dijitInline dijitIcon"></span>'+
					"<span data-dojo-attach-point='captionTextNode' class='dijitInline riaswCaptionPanelCaptionTextNode'></span>"+
					"<span data-dojo-attach-point='closeNode' class='dijitInline riaswCaptionPanelIconNode riaswCaptionPanelCloseIcon'></span>"+
					"<span data-dojo-attach-point='maxNode' class='dijitInline riaswCaptionPanelIconNode riaswCaptionPanelMaximizeIcon'></span>"+
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
			captionTextNode: "riaswCaptionPanelCaptionTextNode",
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
				dns = node.style,
				isV = (this.region == "left" || this.region == "right");
			if(this.displayState === rias.riasw.layout.displayCollapsed){
				///这里处理可以防止 move 和 resize 的时候改变，同时允许先改变 大小 和 约束
				if(isV){
					dns.width = this._captionHeight + "px";
					if(this.showCaption && this.captionNode){
						rias.dom.setMarginSize(this.captionNode, {
							//h: rias.dom.marginBox2contentBox(node, box).h,
							w: this._captionHeight
						});
						this.captionNode.style.height = "2em";
					}
				}else if(this.region == "top" || this.region == "bottom"){
					dns.height = this._captionHeight + "px";
				}else{
					dns.height = this._captionHeight + "px";
					if(this.collapsedWidth > 60){
						dns.width = this.collapsedWidth + "px";
						//}else if(this._size0 && this._size0.w > 0){
						//	dns.width = (this._size0.w - rias.dom.getMarginBorderBox(node).w) + "px";
					}
				}
				//box = rias.dom.getMarginBox(node);
			}else{
				if(this.showCaption && this.captionNode){
					this._captionHeight = this._captionHeight0;// rias.dom.getMarginBox(this.captionNode).h;
				}else{
					this._captionHeight = 0;
				}
				if(this.displayState === rias.riasw.layout.displayShowNormal){
					if(!rias.objLike(this._size0, box)){
						this._size0 = rias.mixinDeep(this._size0, box);
						//this._needPosition = false;
						this._saveToCookie();
					}
				}

				this.layout();
			}
		},
		_setDomNodeSize: function(box){
			var node = this.domNode,
				w = box.w;
			rias.dom.setMarginBox(node, box);
			if(this.restrictBox){
				rias.dom.restrictBox(node, this.restrictBox);
			}
			///需要在 setMarginBox 之后立即 setMarginBox(this.containerNode)，否则 getMarginBox(domNode) 会失真。
			if(rias.dom.hasWidth(node.style, this.region)){
				///各个浏览器对 Fieldset 的 width 处理不同，必须在这里强行设置 containerNode 以保证正确设置 width，及后面能获得正确的 containerNode 的 size,
				// 且，只应该设置 width
				/// containerNode 的 position 是 relative，不应该设置 top 和 left?
				///由于在缩小的时候，有 overflow 存在，重新获取 box 的话，导致 _contentBox 失真
				//box = rias.dom.getContentMargin(node);
				box = rias.dom.marginBox2contentBox(node, box);
				rias.dom.setMarginSize(this.containerNode, {
					w: box.w
				});
			}

			box = rias.dom.getMarginBox(node);
			if(this.restrictPadding >= 0){
				box = rias.dom.restrict(node, box, this.getParentNode(), this.restrictPadding);
			}
			if(w !== box.w){
				//如果 box 有变化，需要再次设置。
				if(rias.dom.hasWidth(node.style, this.region)){
					box = rias.dom.marginBox2contentBox(node, box);
					rias.dom.setMarginSize(this.containerNode, {
						w: box.w
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
