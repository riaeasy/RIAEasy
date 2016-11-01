
//RIAStudio client runtime widget - CaptionPanel

define([
	"rias",
	"rias/riasw/layout/ContentPanel",
	"rias/riasw/widget/_BadgeMixin",
	"rias/riasw/layout/_PanelBase",
	"rias/riasw/layout/DockBar",
	"rias/riasw/layout/PanelManager"
], function(rias, ContentPanel, _BadgeMixin, _PanelBase, DockBar, PanelManager){

	///由于 css 加载的延迟，造成如果 domNode 的 css 有 padding、margin、border，可能显示不正确，最好移到 _PabelBase 中加载。
	//rias.theme.loadThemeCss([
	//	"riasw/layout/CaptionPanel.css"
	//]);

	var riaswType = "rias.riasw.layout.CaptionPanel";
	var Widget = rias.declare(riaswType, [ContentPanel, _BadgeMixin], {

		panelManager: PanelManager.singleton,

		templateString:
			"<div role='region' class='dijit dijitReset' data-dojo-attach-event='onmouseenter: _onEnter, onmouseleave: _onLeave'>"+
				"<div role='button' data-dojo-attach-point='captionNode,focusNode' class='riaswCaptionPanelCaptionNode' data-dojo-attach-event='ondblclick:_toggleMax, onkeydown:_toggleKeydown' role='button'>"+
					'<span data-dojo-attach-point="badgeNode" class="dijitInline ${badgeClass}"></span>'+
					"<span data-dojo-attach-point='toggleNode' class='dijitInline riaswCaptionPanelIconNode riaswCaptionPanelToggleIconNode riaswCaptionPanelToggleIcon' role='presentation'></span>"+
					'<span data-dojo-attach-point="iconNode" class="dijitInline riaswCaptionPanelIconNode16 dijitIcon"></span>'+
					"<span data-dojo-attach-point='labelNode' class='dijitInline riaswCaptionPanelLabelNode'></span>"+
					"<span data-dojo-attach-point='closeNode' class='dijitInline dijitHidden riaswCaptionPanelIconNode riaswCaptionPanelCloseIcon riaswFloatRight'></span>"+
					"<span data-dojo-attach-point='maxNode' class='dijitInline dijitHidden riaswCaptionPanelIconNode riaswCaptionPanelMaximizeIcon riaswFloatRight'></span>"+
				"</div>"+
				//"<div role='region' data-dojo-attach-point='_wrapper' class='dijit dijitReset riaswPanelWrapper'>"+
					"<div role='region' data-dojo-attach-point='containerNode' class='riaswCaptionPanelContent'></div>"+
				//"</div>" +
			"</div>",
		baseClass: "riaswCaptionPanel",

		cssStateNodes: {
			focusNode: "riaswCaptionPanelCaptionNode",
			maxNode: "riaswCaptionPanelIconNode",
			closeNode: "riaswCaptionPanelIconNode",
			toggleNode: "riaswCaptionPanelIconNode",
			labelNode: "riaswCaptionPanelLabelNode",
			containerNode: "riaswCaptionPanelContent"
		},

		//minSize: {
		//	w: 180,
		//	h: 80
		//},
		//maxSize: {
		//	w: 0,
		//	h: 0
		//},

		//caption: "",
		showCaption: true,
		collapsedWidth: 0,

		animate: true,
		splitter: false,
		//selectable: true,
		toggleable: false,
		//canToggle: true,
		toggleOnEnter: false,
		toggleOnBlur: false,
		toggleOnLeave: false,
		maxable: false,
		closable: false,
		//movable: false,
		//resizable: "none",

		extIconNode: null,

		dockTo: null,
		alwaysShowDockNode: true,

		_focusStack: true,
		selected: false,

		/*iconClass: "dijitNoIcon",
		_setIconClassAttr: function(value){
			if(this.iconNode){
				rias.dom.removeClass(this.iconNode, this.iconClass);
				this._set("iconClass", (value && value !== "dijitNoIcon") ? value : "dijitNoIcon");
				rias.dom.addClass(this.iconNode, this.iconClass);
			}else{
				this._set("iconClass", (value && value !== "dijitNoIcon") ? value : "dijitNoIcon");
			}
		},*/

		postMixInProperties: function(){
			//this.nameAttrSetting = this.name ? ("name='" + this.name + "'") : "";
			if(!rias.isNumber(this.zIndex)){
				this.zIndex = this.panelManager._currentZCaption;
				if(this.selectOnShow){
					this.zIndex = this.zIndex + 2;
				}
			}
			this.inherited(arguments);
		},
		/*buildRendering: function(){
			this.inherited(arguments);

			//var oldCls = this._captionClass;
			//this._captionClass = this._baseClass0 + "CaptionNode" + (this.toggleable ? this.isCollapsed() ? "Collapsed" : "Expanded" : "Fixed");
			//rias.dom.replaceClass(this.captionNode, this._captionClass, oldCls || "");
			this._calCollapsedHeight();
		},*/
		postCreate: function(){
			var self = this;
			self.inherited(arguments);
			self._initAttr(["captionClass", "contentClass", "showCaption",
				"zIndex", "selected",
				"toggleable", "toggleOnEnter", "toggleOnBlur", "toggleOnLeave", "closable", "maxable", "dockTo", "alwaysShowDockNode"]);
			self.own(
				//rias.on(self.domNode, "keydown", rias.hitch(self, "_onKey")),
				rias.on(self.closeNode, rias.touch.press, rias.hitch(self, "_stopEvent")),
				rias.on(self.closeNode, rias.touch.release, rias.hitch(self, "close")),
				rias.on(self.maxNode, rias.touch.press, function(evt){
					self._stopEvent(evt);
				}),
				rias.on(self.maxNode, rias.touch.release, function(evt){
					self._toggleMax(evt);
				}),
				rias.on(self.toggleNode, rias.touch.press, function(evt){
					self._stopEvent(evt);
				}),
				rias.on(self.toggleNode, rias.touch.release, function(evt){
					self._toggleClick(evt);
				})
			);

			self.panelManager.addPanel(self);
		},
		destroy: function(){//FIXME:zensst. dojo 2.0 才开始支持 destroyRecursive()，目前只 destroy 自身.
			if(this._autoToggleDelay){
				this._autoToggleDelay.remove();
				this._autoToggleDelay = undefined;
			}
			if(this.dockTo && this.dockTo.removeTarget){/// this.dockTo 可能不是正常的 DockBar
				this.dockTo.removeTarget(this);
			}
			this.panelManager.removePanel(this);///要用到 domNode，故先于 inherited 执行。
			this.inherited(arguments);
		},

		startup: function(){
			if(this._started){
				return;
			}
			this.inherited(arguments);
		},

		_setStateClass: function(){
			try{
				this.inherited(arguments);
				rias.dom.toggleClass(this.captionNode, this._baseClass0 + "CaptionNodeHover", !!this.hovering);
				rias.dom.toggleClass(this.captionNode, this._baseClass0 + "CaptionNodeActive", !!this.active);
				rias.dom.toggleClass(this.captionNode, this._baseClass0 + "CaptionNodeFocused", !!this.focused);
				rias.dom.toggleClass(this.captionNode, this._baseClass0 + "CaptionNodeSelected", !!this.selected);
			}catch(e){
			}
		},

		_refreshDisplayState: function(){
			if(this.isCollapsed()){
				if(rias.dom.visible(this.containerNode)){
					//rias.dom.setAttr(this.captionNode, "aria-hidden", "true");
					//rias.dom.setAttr(this.captionNode, "aria-pressed", "false");
					rias.dom.visible(this.containerNode, false);
				}
			}else{
				if(!rias.dom.visible(this.containerNode)){
					//rias.dom.setAttr(this.captionNode, "aria-hidden", "false");
					//rias.dom.setAttr(this.captionNode, "aria-pressed", "true");
					rias.dom.visible(this.containerNode, true);
				}
			}

			rias.dom.toggleClass(this.domNode, this._baseClass0 + "Collapsed", this.isCollapsed());
			rias.dom.toggleClass(this.domNode, this._baseClass0 + "Maximized", this.isShowMax());
			if(this.dockTo && !this.alwaysShowDockNode){
				if(this.isShown(false, true)){
					this.dockTo.removeTarget(this);
				}else if(this.isHidden(true)){
					this.dockTo.addTarget(this);
				}
			}
			this.inherited(arguments);
		},

		_onResizable: function(value, oldValue){
			this.inherited(arguments);
			/*if(this._resizer){
				this._resizer.addReferNodes([
					this.captionNode,
					this.containerNode
				]);
				if(this._actionBar){
					this._resizer.addReferNodes(this._actionBar.domNode);
				}
			}*/
		},

		_onZIndex: function(value, oldValue){
			if(rias.isNumber(value)){
				rias.dom.setStyle(this.domNode, "zIndex", value);
			}
		},
		onCaptionChanging: function(value, oldValue){
			return value;
		},
		onCaptionChanged: function(value){},
		_onCaption: function(value, oldValue){
			this.caption = this.onCaptionChanging(value, oldValue) + "";
			if(this.labelNode.innerHTML !== this.caption){
				this.labelNode.innerHTML = this.caption;
				this.onCaptionChanged();
			}
		},
		_onCaptionClass: function(value, oldValue){
			if(oldValue){
				rias.dom.removeClass(this.captionNode, oldValue);
			}
			if(value){
				rias.dom.addClass(this.captionNode, value);
			}
			this._calCollapsedHeight();
		},
		_onContentClass: function(value, oldValue){
			if(oldValue){
				rias.dom.removeClass(this.containerNode, oldValue);
			}
			if(value){
				rias.dom.addClass(this.containerNode, value);
			}
		},
		_onShowCaption: function(value, oldValue){
			this.showCaption = !!value;
			rias.dom.toggleClass(this.captionNode, "dijitHidden", !this.showCaption);
			rias.dom.toggleClass(this.domNode, this._baseClass0 + "WithCaption", this.showCaption);
			this._calCollapsedHeight();
		},
		_onMaxable: function(value, oldValue){
			this.maxable = !!value && !this.region;
			rias.dom.toggleClass(this.maxNode, "dijitHidden", !this.maxable);
		},
		_onClosable: function(value, oldValue){
			this.closable = !!value;
			rias.dom.toggleClass(this.closeNode, "dijitHidden", !this.closable);
		},
		_onToggleable: function(value, oldValue){
			this.toggleable = !!value;
			//rias.dom.toggleClass(this.toggleNode, "dijitHidden", !this.toggleable);
			rias.dom.setStyle(this.toggleNode, "width", this.toggleable ? "" : "0");///需要支持 badge
			this._onMinSize(this.minSize);
			this._onMaxSize(this.maxSize);
			if(this._riasrParent && this._riasrParent._setupChild){
				this._riasrParent._setupChild(this);
			}
		},
		_onToggleOnEnter: function(value, oldValue){
			this.toggleOnEnter = !!value;
		},
		_onToggleOnBlur: function(value, oldValue){
			this.toggleOnBlur = !!value;
		},
		_onToggleOnLeave: function(value, oldValue){
			this.toggleOnLeave = !!value;
		},
		//_setFocusedAttr: function(value){
		//	console.debug(this.id, "focused", value);
		//	this.inherited(arguments);
		//},
		_onDockTo: function(value, oldValue){
			value = rias.by(value);///因为没有 dockable 属性，dockTo 即表示是否 dockable，所以允许为 undefined
			if(!value && this.dockTo){
				if(this.dockTo.removeTarget){///担心 this.dockTo 可能不是正常的
					this.dockTo.removeTarget(this);
				}
				this.dockTo = null;
				if(this.isCollapsed()){
					this.restore(false);
				}
			}else if(value){
				value = rias.by(value);
				if(rias.isInstanceOf(value, DockBar)){
					//if(value != this.dockTo){
					this.dockTo = value;
					if(this.alwaysShowDockNode){
						this.dockTo.addTarget(this);
					}
				}else{
					this.dockTo = null;
				}
			}else{
				//console.warn("The dockTo of '" + value + "' not exists or not the DockBar Widget.");
				this.dockTo = null;
			}
		},
		_onAlwaysShowDockNode: function(value, oldValue){
			value = !!value;
			if(this.dockTo){
				if(value){
					this.dockTo.addTarget(this);
				}else if(this.isShown(false, true)){
					this.dockTo.removeTarget(this);
				}else if(this.isHidden()){
					this.dockTo.addTarget(this);
				}
			}
		},

		_onEnter: function(e){
			//e.preventDefault();
			//e.stopPropagation();
			var self = this;
			if(self.toggleOnEnter && self.toggleable && !self._autoToggleDelay && !self._playing){
				if(self.canToggle != false){
					self._autoToggleDelay = self.defer(function(){
						if(self._autoToggleDelay){
							self._autoToggleDelay.remove();
							self._autoToggleDelay = undefined;
						}
						if(self.isCollapsed()){
							self.restore(false);
						}
					}, rias.autoToggleDuration);
				}
			}
		},
		_onBlur: function(e){
			//e.preventDefault();
			//e.stopPropagation();
			var self = this;
			if(self._autoToggleDelay){
				self._autoToggleDelay.remove();
				self._autoToggleDelay = undefined;
			}
			self.inherited(arguments);
			if(self.toggleOnBlur && self.toggleable && !self._playing){
				if(self.canToggle != false){
					if(!self.isCollapsed()){
						self.collapse();
					}
				}
			}
		},
		_onLeave: function(e){
			//e.preventDefault();
			//e.stopPropagation();
			var self = this;
			if(self._autoToggleDelay){
				self._autoToggleDelay.remove();
				self._autoToggleDelay = undefined;
			}
			self.inherited(arguments);
			if(self.toggleOnLeave && self.toggleable && !self._playing){
				if(self.canToggle != false){
					if(!self.isCollapsed()){
						self.collapse();
					}
				}
			}
		},

		select: function(value){
			value = !!value;
			///需要先 selectPanel 再 set("selected", value)，避免递归循环
			if(value){
				this.panelManager.selectPanel(this);
			}else{
				this.panelManager.unselectPanel(this);
			}
			this.inherited(arguments);
		},

		_hide: function(newState){
			this.inherited(arguments);
			this.panelManager.hidePanel(this);
		},
		collapse: function(){
			if(this.dockTo){
				return this.hide();
			}else{
				return this.inherited(arguments);
			}
		},

		_stopEvent: function(/*Event*/e){
			e.preventDefault();
			e.stopPropagation();
		},
		_toggleClick: function(/*Event*/e){
			e.preventDefault();
			e.stopPropagation();
			//if(this.maxable){
			//	this.toggleMax();
			//}else{
				this.toggle(true);
			//}
		},
		_toggleKeydown: function(/*Event*/ e){
			if(e.keyCode == rias.keys.DOWN_ARROW || e.keyCode == rias.keys.UP_ARROW){
				this._toggleClick(e);
			}
		},
		toggle: function(forceVisible){
			if(this.canToggle != false){
				if(this.toggleable){
					if(this.isHidden()){
						this.restore(forceVisible);
					}else if(this.isCollapsed()){
						this.expand();
					}else if(this.isShown()){
						this.collapse();
					}
				}else{
					this.restore(forceVisible);
				}
			}
		},
		_toggleMax: function(e){
			e.preventDefault();
			e.stopPropagation();
			this.toggleMax();
		},
		toggleMax: function(){
			if(this.maxable){
				if(this.isShowMax()){
					this.restore(false);
				}else{
					this.showMax();
				}
			}else{
				this.restore(false);
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswCaptionPanelIcon",
		iconClass16: "riaswCaptionPanelIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
			"state": {
				"datatype": "string",
				"description": "The state of the Panel.",
				"hidden": false
			}
		}
	};

	return Widget;

});
