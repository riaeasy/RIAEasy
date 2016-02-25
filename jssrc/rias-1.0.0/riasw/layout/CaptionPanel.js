
//RIAStudio client runtime widget - CaptionPanel

define([
	"rias",
	"rias/riasw/layout/ContentPanel",
	"rias/riasw/widget/_BadgeMixin",
	"rias/riasw/layout/_panelBase",
	"rias/riasw/layout/DockBar"
], function(rias, ContentPanel, _BadgeMixin, _panelBase, DockBar){

	rias.theme.loadCss([
		"layout/CaptionPanel.css"
	]);

	var riasType = "rias.riasw.layout.CaptionPanel";
	var Widget = rias.declare(riasType, [ContentPanel, _BadgeMixin], {
		templateString:
			"<div role='region' data-dojo-attach-event='onmouseenter:_onDomNodeEnter, onmouseleave:_onDomNodeLeave'>"+
				"<div role='button' data-dojo-attach-point='captionNode,focusNode' id='${id}_captionNode' class='dijitReset riaswCaptionPanelCaptionNode' tabindex='-1'" +
					" data-dojo-attach-event='ondblclick:_onToggleClick, onkeydown:_onToggleKeydown'>"+
					"<div data-dojo-attach-point='toggleNode' class='riaswCaptionPanelIconNode riaswCaptionPanelToggleIconNode riaswCaptionPanelToggleIcon' role='presentation'></div>"+
					'<div data-dojo-attach-point="iconNode" class="dijitReset dijitInline dijitIcon"></div>'+
					"<div data-dojo-attach-point='captionTextNode' class='riaswCaptionPanelCaptionTextNode'></div>"+
					'<div data-dojo-attach-point="badgeNode" class="${badgeClass}"></div>'+
					"<div data-dojo-attach-point='maxNode' class='riaswCaptionPanelIconNode riaswCaptionPanelMaximizeIcon'></div>"+
				"</div>"+
				"<div role='region' data-dojo-attach-point='containerNode' class='dijitReset riaswCaptionPanelContent' id='${id}_container' aria-labelledby='${id}_captionNode'></div>"+
			"</div>",
		baseClass: "riaswCaptionPanel",

		cssStateNodes: {
			focusNode: "riaswCaptionPanelCaptionNode",
			maxNode: "riaswCaptionPanelIconNode",
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
		autoToggle: false,
		maxable: false,
		//cloasable: false,
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
				rias.on(this.maxNode, rias.touch.press, function(evt){
					self._stopEvent(evt);
				}),
				rias.on(this.toggleNode, rias.touch.press, function(evt){
					self._stopEvent(evt);
				}),
				rias.on(this.maxNode, rias.touch.release, function(evt){
					self._onToggleMax(evt);
				}),
				rias.on(this.toggleNode, rias.touch.release, function(evt){
					self._onToggleClick(evt);
				})
			);
			self.inherited(arguments);
			this._initAttr(["caption", "showCaption", "splitter", "toggleable", "autoToggle", "maxable", "dockTo", "alwaysShowDockNode"]);
		},
		destroy: function(){//FIXME:zensst. dojo 2.0 才开始支持 destroyRecursive()，目前只 destroy 自身.
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
			if(this._started) && !this.__updateSize && this._isVisible()){
				console.debug(this.id);
				console.trace();
			}
			return this.inherited(arguments);
		},
		_internalResize: function(){
			if(this._started && !this.__updateSize && this._isVisible()){
				console.debug(this.id);
				console.trace();
			}
			this.inherited(arguments);
		},*/

		_refreshDisplayState: function(){
			if(this.isCollapsed()){
				if(rias.dom.isVisible(this.containerNode)){
					//rias.dom.setAttr(this.captionNode, "aria-hidden", "true");
					//rias.dom.setAttr(this.captionNode, "aria-pressed", "false");
					rias.dom.visible(this.containerNode, false);
				}
			}else{
				if(!rias.dom.isVisible(this.containerNode)){
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
		_onShowCaption: function(value, oldValue){
			this.showCaption = !!value;
			rias.dom.visible(this.captionNode, this.showCaption);
			rias.dom.toggleClass(this.domNode, this.baseClass + "WithCaption", !!this.showCaption);
		},
		_onMaxable: function(value, oldValue){
			this.maxable = !!value;
			rias.dom.visible(this.maxNode, this.maxable);
		},
		_onToggleable: function(value, oldValue){
			this.toggleable = !!value;
			rias.dom.visible(this.toggleNode, this.toggleable);
			if(this._riasrParent && this._riasrParent._setupChild){
				this._setupChild(this);
			}
		},
		_onAutoToggle: function(value, oldValue){
			this.autoToggle = !!value;
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
			//value = rias.by(value) || (rias.webApp && rias.webApp.mainDock);
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
				//if(this.displayState === _panelBase.displayCollapsed){
				//	this.collapse();
				//}
				//}
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

		_collapse: function(){
			this.inherited(arguments);
			if(this.dockTo){
				this.hide();
			}
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
		/*toggle: function(){
			if(this.toggleable){
				if(this.dockTo){
					if(this.isDocked()){
						this.restore();
					}else{
						this.dock();
					}
				}else{
					if(this.isCollapsed()){
						this.expand();
					}else{
						this.collapse();
					}
				}
			}else{
				this.restore();
			}
		},*/
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
			if(this.autoToggle && this.toggleable && !this._playing){
				this.own(this._autoToggleDelay = this.defer(function(){
					if(this.isCollapsed()){
						this.restore();
					}
				}, 200));
			}
		},
		_onDomNodeLeave: function(e){
			//e.preventDefault();
			//e.stopPropagation();
			if(this._autoToggleDelay){
				this._autoToggleDelay.remove();
			}
			if(this.autoToggle && this.toggleable && !this._playing){
				if(!this.isCollapsed()){
					this.collapse();
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
