
//RIAStudio client runtime widget - CaptionPanel

define([
	"rias",
	"rias/riasw/layout/ContentPanel",
	"rias/riasw/layout/DockBar"
], function(rias, ContentPanel, DockBar){

	rias.theme.loadCss([
		"layout/CaptionPanel.css"
	]);

	var riasType = "rias.riasw.layout.CaptionPanel";
	var Widget = rias.declare(riasType, [ContentPanel], {
		templateString:
			"<div>"+
				"<div data-dojo-attach-point='captionNode,focusNode' id='${id}_captionNode' class='dijitReset riaswCaptionPanelCaptionNode' data-dojo-attach-event='ondblclick:_onToggleClick, onkeydown:_onToggleKeydown' tabindex='-1' role='button'>"+
					"<span data-dojo-attach-point='maxNode' class='dijitInline riaswCaptionPanelIconNode'>"+
						"<span class='riaswCaptionPanelIconInner riaswCaptionPanelMaximizeIcon'></span>"+
					"</span>"+
					"<span data-dojo-attach-point='toggleNode' class='dijitInline riaswCaptionPanelIconNode' role='presentation'>"+
						"<span class='riaswCaptionPanelIconInner riaswCaptionPanelToggleIcon'></span>"+
					"</span>"+
					"<span data-dojo-attach-point='captionTextNode' class='dijitInline riaswCaptionPanelCaptionTextNode'>"+
						"<span data-dojo-attach-point='captionText' class='dijitInline riaswCaptionPanelCaptionText'></span>"+
					"</span>"+
				"</div>"+
				"<div data-dojo-attach-point='containerNode' class='dijitReset riaswCaptionPanelContent' role='region' id='${id}_container' aria-labelledby='${id}_captionNode'>"+
				"</div>"+
			"</div>",
		baseClass: "riaswCaptionPanel",
		cssStateNodes: {
			focusNode: "riaswCaptionPanelCaptionNode",
			maxNode: "riaswCaptionPanelIconNode",
			toggleNode: "riaswCaptionPanelIconNode",
			captionTextNode: "riaswCaptionPanelCaptionTextNode",
			captionText: "riaswCaptionPanelCaptionText",
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

		dockTo: null,
		alwaysShowDockNode: true,

		//selectable: true,
		toggleable: false,
		maxable: false,
		//cloasable: false,
		//movable: false,
		//resizable: "none",
		animated: true,
		duration: rias.defaultDuration * 4,

		//state: Panel.displayShowNormal,

		buildRendering: function(){
			this.inherited(arguments);
			//this._initAttr(["caption", "toggleable", "cloasable"]);
			this._initAttr(["caption", "toggleable", "maxable"]);
		},
		postCreate: function(){
			var self = this;
			self.own(
				rias.on(self.maxNode, rias.touch.press, rias.hitch(self, "_stopEvent")),
				rias.on(self.toggleNode, rias.touch.press, rias.hitch(self, "_stopEvent")),
				rias.on(self.maxNode, rias.touch.release, rias.hitch(self, "_onToggleMax")),
				rias.on(self.toggleNode, rias.touch.release, rias.hitch(self, "_onToggleClick"))
			);
			self._onToggleable(self.toggleable);
			self._onMaxable(self.maxable);
			self._onCaption(self.caption);
			self._onShowCaption(self.showCaption);
			self._onDockTo(self.dockTo);
			self.inherited(arguments);
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
			if(this.isShowMin()){
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
			var oldCls = this._captionClass;
			this._captionClass = this.baseClass + "CaptionNode" + (this.toggleable ? "" : "Fixed") + (this.isShowMin() ? "Collapsed" : "Expanded");
			rias.dom.replaceClass(this.captionNode, this._captionClass, oldCls || "");
			rias.dom.toggleClass(this.captionNode, this.baseClass + "Maximized", this.isShowMax());
			this._captionHeight = rias.dom.getMarginBox(this.captionNode).h;
			if(!this.alwaysShowDockNode && this.dockTo && (this.isShowNormal() || this.isShowMax() || this.isShowMin())){
				this.dockTo.removeTarget(this);
			}
			this.inherited(arguments);
		},

		onCaptionChanging: function(value, oldValue){
			return value;
		},
		onCaptionChanged: function(value){},
		_onCaption: function(value, oldValue){
			this.caption = this.onCaptionChanging(value, oldValue) + "";
			if(this.captionText.innerHTML !== this.caption){
				this.captionText.innerHTML = this.caption;
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
		},
		//_setFocusedAttr: function(value){
		//	console.debug(this.id, "focused", value);
		//	this.inherited(arguments);
		//},
		_onDockTo: function(value, oldValue){
			//var //m = this._riasrModule,
			//	obj;
			//if(m && rias.isString(value)){
			//	value = m[value] || value;
			//}
			value = rias.by(value);
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
				if(this.displayState === Widget.displayDocked){
					this.dock();
				}
				//}
			}else{
				//console.warn("The dockTo of '" + value + "' not exists or not the DockBar Widget.");
				this.dockTo = null;
			}
		},

		_dock: function(){
			if(this.toggleable){
				if(rias.by(this.dockTo)){
					if(!this.alwaysShowDockNode){
						this.dockTo.addTarget(this);
					}
					this.inherited(arguments);
				}else{
					this.collapse();
				}
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
		toggle: function(){
			if(this.toggleable){
				if(this.dockTo){
					if(this.isDocked()){
						this.show();
					}else{
						this.dock();
					}
				}else{
					if(this.isShowMin()){
						this.expand();
					}else{
						this.collapse();
					}
				}
			}
			else{
				this.expand();
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
					this.show();
				}else{
					this.showMax();
				}
			}else{
				this.show();
			}
		},

		/// badge=======================///

		//badgeStyle: "please use this.get/set('badgeStyle')",
		//badgeColor: "please use this.get/set('badgeColor')",//"blue","green","red"(default)
		//badge: "please use this.get/set('badge')",
		_getBadgeStyleAttr: function(){
		},
		_setBadgeStyleAttr: function(/*String*/value){
			/*this._set("badgeStyle", value);
			var n = this._dockNode;
			if(n && n.badgeStyle != this.badgeStyle){
				n.set("badgeStyle", this.badgeStyle);
			}*/
			this._set("_badgeStyle", value);
		},
		_getBadgeColorAttr: function(){
		},
		_setBadgeColorAttr: function(/*String*/value){
			/*this._set("badgeColor", value);
			var n = this._dockNode;
			if(n && n.badgeColor != this.badgeColor){
				n.set("badgeColor", this.badgeColor);
			}*/
			this._set("_badgeColor", value);
		},
		_getBadgeAttr: function(){
			//return this._dockNode ? this._dockNode.get("badge") : null;
		},
		_setBadgeAttr: function(value){
			/*var n = this._dockNode;
			if(n){
				n.set("badge", value);
				if(n.badgeColor != this.badgeColor){
					n.set("badgeColor", this.badgeColor);
				}
				if(n.badgeStyle != this.badgeStyle){
					n.set("badgeStyle", this.badgeStyle);
				}
			}
			this._set("badge", value);*/
			this._set("_badge", value);
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
