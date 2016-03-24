
//RIAStudio client runtime widget - CaptionPanel

define([
	"rias",
	"rias/riasw/layout/ContentPanel",
	"rias/riasw/widget/_BadgeMixin",
	"rias/riasw/layout/_PanelBase",
	"rias/riasw/layout/DockBar"
], function(rias, ContentPanel, _BadgeMixin, _PanelBase, DockBar){

	rias.theme.loadRiasCss([
		"layout/CaptionPanel.css"
	]);

	var riasType = "rias.riasw.layout.CaptionPanel";
	var Widget = rias.declare(riasType, [ContentPanel, _BadgeMixin], {
		templateString:
			"<div role='region' data-dojo-attach-event='onmouseenter: _onDomNodeEnter, onmouseleave: _onBlur'>"+
				"<div role='button' data-dojo-attach-point='captionNode,focusNode' id='${id}_captionNode' class='dijitReset riaswCaptionPanelCaptionNode' tabindex='-1'" +
					" data-dojo-attach-event='ondblclick:_onToggleClick, onkeydown:_onToggleKeydown'>"+
					'<span data-dojo-attach-point="badgeNode" class="dijitInline ${badgeClass}"></span>'+
					"<span data-dojo-attach-point='toggleNode' class='dijitInline riaswCaptionPanelIconNode riaswCaptionPanelToggleIconNode riaswCaptionPanelToggleIcon' role='presentation'></span>"+
					'<span data-dojo-attach-point="iconNode" class="dijitReset dijitInline dijitIcon"></span>'+
					"<span data-dojo-attach-point='captionTextNode' class='dijitInline riaswCaptionPanelCaptionTextNode'></span>"+
					"<span data-dojo-attach-point='closeNode' class='dijitInline riaswDialogPanelIconNode riaswDialogPanelCloseIcon'></span>"+
					"<span data-dojo-attach-point='maxNode' class='dijitInline riaswCaptionPanelIconNode riaswCaptionPanelMaximizeIcon'></span>"+
				"</div>"+
				"<div role='region' data-dojo-attach-point='containerNode' class='dijitReset riaswCaptionPanelContent' id='${id}_container' aria-labelledby='${id}_captionNode'></div>"+
			"</div>",
		baseClass: "riaswCaptionPanel",

		cssStateNodes: {
			focusNode: "riaswCaptionPanelCaptionNode",
			maxNode: "riaswCaptionPanelIconNode",
			closeNode: "riaswDialogPanelIconNode",
			toggleNode: "riaswCaptionPanelIconNode",
			captionTextNode: "riaswCaptionPanelCaptionTextNode",
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

		//tabIndex: "0",
		caption: "",
		showCaption: true,

		animated: true,
		splitter: false,
		//selectable: true,
		toggleable: false,
		toggleOnEnter: false,
		toggleOnBlur: false,
		maxable: false,
		closable: false,
		//movable: false,
		//resizable: "none",

		extIconNode: null,

		dockTo: null,
		alwaysShowDockNode: true,

		//state: Panel.displayShowNormal,

		iconClass: "dijitNoIcon",
		_setIconClassAttr: function(value){
			if(this.iconNode){
				rias.dom.removeClass(this.iconNode, this.iconClass);
				this._set("iconClass", (value && value !== "dijitNoIcon") ? value : "dijitNoIcon");
				rias.dom.addClass(this.iconNode, this.iconClass);
			}else{
				this._set("iconClass", (value && value !== "dijitNoIcon") ? value : "dijitNoIcon");
			}
		},

		_addIconNode: function(){

		},
		buildRendering: function(){
			this.inherited(arguments);

			var oldCls = this._captionClass;
			this._captionClass = this.baseClass + "CaptionNode" + (this.toggleable ? this.isCollapsed() ? "Collapsed" : "Expanded" : "Fixed");
			rias.dom.replaceClass(this.captionNode, this._captionClass, oldCls || "");

		},
		postCreate: function(){
			var self = this;
			self.own(
				rias.on(self.domNode, "keydown", rias.hitch(self, "_onKey")),
				rias.on(self.closeNode, rias.touch.press, rias.hitch(self, "_stopEvent")),
				rias.on(self.closeNode, rias.touch.release, rias.hitch(self, "cancel")),
				rias.on(self.maxNode, rias.touch.press, function(evt){
					self._stopEvent(evt);
				}),
				rias.on(self.toggleNode, rias.touch.press, function(evt){
					self._stopEvent(evt);
				}),
				rias.on(self.maxNode, rias.touch.release, function(evt){
					self._onToggleMax(evt);
				}),
				rias.on(self.toggleNode, rias.touch.release, function(evt){
					self._onToggleClick(evt);
				})
			);
			self.inherited(arguments);
			self._initAttr(["caption", "captionClass", "contentClass", "showCaption", "splitter",
				"toggleable", "toggleOnEnter", "toggleOnBlur", "closable", "maxable", "dockTo", "alwaysShowDockNode"]);
		},
		destroy: function(){//FIXME:zensst. dojo 2.0 才开始支持 destroyRecursive()，目前只 destroy 自身.
			if(this._autoToggleDelay){
				this._autoToggleDelay.remove();
				this._autoToggleDelay = undefined;
			}
			if(this.dockTo && this.dockTo.removeTarget){/// this.dockTo 可能不是正常的 DockBar
				this.dockTo.removeTarget(this);
			}
			this.inherited(arguments);
		},

		startup: function(){
			if(this._started){
				return;
			}
			this.inherited(arguments);
		},

		/*_layoutChildren: function(){
			return this.inherited(arguments);
		},
		_internalResize: function(){
			this.inherited(arguments);
		},*/

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

			rias.dom.toggleClass(this.captionNode, this.baseClass + "Maximized", this.isShowMax());
			if(this.dockTo && !this.alwaysShowDockNode){
				if(this.isShown(true)){
					this.dockTo.removeTarget(this);
				}else if(this.isHidden(true)){
					this.dockTo.addTarget(this);
				}
			}
			this.inherited(arguments);
		},

		onCaptionChanging: function(value, oldValue){
			return value;
		},
		onCaptionChanged: function(value){},
		_onCaption: function(value, oldValue){
			this.caption = this.onCaptionChanging(value, oldValue) + "";
			if(this.captionTextNode.innerHTML !== this.caption){
				this.captionTextNode.innerHTML = this.caption;
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
			rias.dom.visible(this.captionNode, this.showCaption);
			rias.dom.toggleClass(this.domNode, this.baseClass + "WithCaption", !!this.showCaption);
		},
		_onMaxable: function(value, oldValue){
			this.maxable = !!value && !this.region;
			rias.dom.visible(this.maxNode, this.maxable);
		},
		_onClosable: function(value, oldValue){
			this.closable = !!value;
			rias.dom.visible(this.closeNode, this.closable);
		},
		_onToggleable: function(value, oldValue){
			this.toggleable = !!value;
			//rias.dom.visible(this.toggleNode, this.toggleable);
			rias.dom.setStyle(this.toggleNode, "width", this.toggleable ? "" : "0");///需要支持 badge
			this._onMinSize(this.minSize);
			this._onMaxSize(this.maxSize);
			if(this._riasrParent && this._riasrParent._setupChild){
				this._setupChild(this);
			}
		},
		_onToggleOnEnter: function(value, oldValue){
			this.toggleOnEnter = !!value;
		},
		_onToggleOnLeave: function(value, oldValue){
			this.toggleOnBlur = !!value;
		},
		_onSplitter: function(value, oldValue){
			this.splitter = !!value;
			if(this._riasrParent && this._riasrParent._setupChild){
				this._riasrParent._setupChild(this);
			}
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
				this.restore();
			}else if(value && rias.isInstanceOf(value, DockBar)){
				//if(value != this.dockTo){
				this.dockTo = value;
				if(this.alwaysShowDockNode){
					this.dockTo.addTarget(this);
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
				}else if(this.isShown()){
					this.dockTo.removeTarget(this);
				}else if(this.isHidden()){
					this.dockTo.addTarget(this);
				}
			}
		},

		_onKey: function(/*Event*/ evt){
			if(evt.keyCode == rias.keys.TAB){
				var fn = rias.dom.focusedNode;///不需要判断 this._focusedNode ？
				//if(rias.dom.isDescendant(fn, this.domNode) && fn.focus){
				//	fn.focus();
				//}
				this._getFocusItems();
				if(this._firstFocusNode == this._lastFocusNode){
					// don't move focus anywhere, but don't allow browser to move focus off of dialog either
					evt.stopPropagation();
					evt.preventDefault();
				}else if(fn == this._firstFocusNode && evt.shiftKey){
					// if we are shift-tabbing from first focusable item in dialog, send focus to last item
					//rias.dom.focus(this._lastFocusNode);
					if(this._lastFocusNode && this._lastFocusNode.focus){
						this._lastFocusNode.focus();
					}
					evt.stopPropagation();
					evt.preventDefault();
				}else if(fn == this._lastFocusNode && !evt.shiftKey){
					// if we are tabbing from last focusable item in dialog, send focus to first item
					//rias.dom.focus(this._firstFocusNode);
					if(this._firstFocusNode && this._firstFocusNode.focus){
						this._firstFocusNode.focus();
					}
					evt.stopPropagation();
					evt.preventDefault();
				}
			}else if(this.closable && evt.keyCode == rias.keys.ESCAPE){
				this.defer(this.cancel);
				evt.stopPropagation();
				evt.preventDefault();
			}
		},

		_collapse: function(){
			this.inherited(arguments);
			if(this.dockTo){
				this.defer(this.hide);
			}
		},
		restore: function(){
			var self = this;
			return rias.when(self.inherited(arguments), function(result){
				if(result === self){
					self.focus();
				}
			});
		},

		_stopEvent: function(/*Event*/e){
			e.preventDefault();
			e.stopPropagation();
		},
		_onToggleClick: function(/*Event*/e){
			e.preventDefault();
			e.stopPropagation();
			this.toggle();
		},
		_onToggleKeydown: function(/*Event*/ e){
			if(e.keyCode == rias.keys.DOWN_ARROW || e.keyCode == rias.keys.UP_ARROW){
				this._onToggleClick(e);
			}
		},
		toggle: function(){
			if(this.toggleable){
				if(this.isHidden()){
					this.restore();
				}else if(this.isCollapsed()){
					this.expand();
				}else if(this.isShown()){
					this.collapse();
				}
			}else{
				this.restore();
			}
		},
		_onToggleMax: function(e){
			e.preventDefault();
			e.stopPropagation();
			this.toggleMax();
		},
		toggleMax: function(){
			if(this.maxable){
				if(this.isShowMax()){
					this.restore();
				}else{
					this.showMax();
				}
			}else{
				this.restore();
			}
		},
		_onDomNodeEnter: function(e){
			//e.preventDefault();
			//e.stopPropagation();
			var self = this;
			if(self.toggleOnEnter && self.toggleable && !self._autoToggleDelay && !self._playing){
				self._autoToggleDelay = self.defer(function(){
					if(self._autoToggleDelay){
						self._autoToggleDelay.remove();
						self._autoToggleDelay = undefined;
					}
					if(self.isCollapsed()){
						self.restore();
					}
				}, rias.autoToggleDuration);
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
				if(!self.isCollapsed()){
					self.collapse();
				}
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswPaneIcon",
		iconClass16: "riaswPaneIcon16",
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
