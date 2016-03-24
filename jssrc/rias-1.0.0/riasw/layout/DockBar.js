define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_CssStateMixin",
	"dojo/dnd/Moveable",
	"rias/riasw/layout/_PanelBase",
	"rias/riasw/layout/Panel",
	"rias/riasw/widget/_BadgeMixin",///Badge
	"dijit/BackgroundIframe"
], function(rias, _Widget, _TemplatedMixin, _CssStateMixin, Moveable, _PanelBase, Panel, _BadgeMixin){

	rias.theme.loadRiasCss([
		"layout/DockBar.css"
	]);

	var DockNode = rias.declare("rias.riasw.layout.DockNode", [_Widget, _TemplatedMixin, _CssStateMixin, _BadgeMixin], {
		title: "",

		targetWidget: null,

		templateString:
			'<span role="button" data-dojo-attach-point="focusNode" class="riaswDockNode" data-dojo-attach-event="onclick:toggle,onmouseenter:_onMouseEnter,onmouseleave:_onMouseLeave">'+
				'<span data-dojo-attach-point="badgeNode" class="${badgeClass}"></span>'+
				//'<span data-dojo-attach-point="toggleIcon" class="dijitReset dijitInline riaswDockNodeIcon"></span>'+
				'<span data-dojo-attach-point="iconNode" class="dijitReset dijitInline dijitIcon riaswDockNodeIconNode"></span>'+
				'<span data-dojo-attach-point="containerNode,titleNode,labelNode" class="riaswDockNodeTitle"></span>'+
			'</span>',

		baseClass: "riaswDockNode",
		cssStateNodes: {
			domNode: "riaswDockNode",
			focusNode: "riaswDockNode"
		},
		//iconClass: "dijitNoIcon",
		_setIconClassAttr: function(value){
			rias.dom.removeClass(this.iconNode, this.iconClass);
			this._set("iconClass", (value && value !== "dijitNoIcon") ? value : "dijitNoIcon");
			rias.dom.addClass(this.iconNode, this.iconClass);
		},
		_setIconLayoutTopAttr: function(value){
			value = !!value;
			if(value){
				rias.dom.toggleClass(this.domNode, "riaswButtonIconTop", !!value);
			}
			this._set("iconLayoutTop", value);
		},

		///注意 if(has("dojo-bidi")) 是两个不同的类，用 rias.isFunction(this.applyTextDir) 来判断
		showLabel: true,
		_setLabelAttr: function(/*String*/ content){
			//this.inherited(arguments);
			this._set("label", content);
			this.labelNode.innerHTML = content;
			if(this.tooltip){
				this.labelNode.title = "";
			}else{
				if(!this.showLabel && !("title" in this.params)){
					this.labelNode.title = rias.trim(this.labelNode.innerText || this.labelNode.textContent || "");
				}
				if(this.labelNode.title && rias.isFunction(this.applyTextDir)){
					this.applyTextDir(this.labelNode, this.labelNode.title);
				}
			}
		},
		_setTooltipAttr: function(/*String*/ tooltip){
			this.inherited(arguments);
			this.titleNode.title = "";
		},

		startup: function(){
			this.inherited(arguments);
		},
		destroy: function(){
			this.targetWidget._riasrDockNode = undefined;
			if(this._autoToggleDelay){
				this._autoToggleDelay.remove();
				this._autoToggleDelay = undefined;
			}
			rias.forEach(this._hBadge, function(item){
				item.remove();
			});
			this._hBadge = undefined;
			if(this.targetWidget && rias.isFunction(this.targetWidget.restore)){
				this.targetWidget.restore();
			}
			this.targetWidget = undefined;
			this.inherited(arguments);
		},

		setTargetState: function(){
			if(!this.targetWidget){
				return;
			}
			//var s = this.targetWidget.isShown();
			/// isShown() 检测了 _wasShown，在初始化时由于 _playing 的延迟而导致返回 false。改用 displayState 来判断。
			var d = this.targetWidget.displayState,
				s = d === _PanelBase.displayShowNormal || d === _PanelBase.displayShowMax || d === _PanelBase.displayCollapsed;
			rias.dom.toggleClass(this.domNode, "riaswDockNodeTopmost", !!this.targetWidget.isTopmost);
			rias.dom.toggleClass(this.domNode, "riaswDockNodeShown", s);
			rias.dom.toggleClass(this.domNode, "riaswDockNodeHidden", !s);
			/*if(s){
				rias.dom.setStyle(this.domNode, "background-color", rias.dom.getStyle(this.targetWidget.captionNode, "background-color"));
			}else{
				rias.dom.setStyle(this.domNode, "background-color", "");
			}*/
		},
		_setTargetWidgetAttr: function(widget){
			var self = this;
			rias.forEach(self._hBadge, function(item){
				item.remove();
			});
			if(rias.isInstanceOf(widget, _PanelBase)){
				self._hBadge = self.own(
					//widget.watch('title', function(name, oldValue, newValue){
					//	self.set("label", newValue);
					//}),
					widget.watch('caption', function(name, oldValue, newValue){
						self.set("label", newValue);
					}),
					widget.watch('tooltip', function(name, oldValue, newValue){
						self.set("tooltip", newValue);
					}),
					widget.watch('iconClass', function(name, oldValue, newValue){
						self.set("iconClass", newValue);
					}),
					widget.watch('badgeStyle', function(name, oldValue, newValue){
						self.set("badgeStyle", newValue);
					}),
					widget.watch('badgeColor', function(name, oldValue, newValue){
						self.set("badgeColor", newValue);
					}),
					widget.watch('badge', function(name, oldValue, newValue){
						self.set("badge", newValue);
					}),
					widget.watch('displayState', function(name, oldValue, newValue){
						self.setTargetState();
					})
				);
				if(rias.isFunction(widget.onBringToTop)){
					self._hBadge.concat(self.own(rias.after(widget, "onBringToTop", function(){
						self.setTargetState();
					}, true)));
				}
				self._set("targetWidget", widget);
				self.set("caption", widget.get("caption"));
				self.set("tooltip", widget.get("tooltip"));
				self.set("iconClass", widget.get("iconClass"));
				self.set("badgeStyle", widget.get("badgeStyle"));
				self.set("badgeColor", widget.get("badgeColor"));
				self.set("badge", widget.get("badge"));
				self.setTargetState();
			}else{
				self._set("targetWidget", null);
				///这里不应该初始化 caption 等，而应该保持设计值。
			}
			widget._riasrDockNode = self;
		},

		restore: function(){
			if(this.targetWidget && rias.isFunction(this.targetWidget.restore)){
				this.targetWidget.restore();
			}
		},
		toggle: function(){
			var target = this.targetWidget;
			if(target && !target._playing){
				//if(target.isShown() && !target.isTopmost && rias.isFunction(target.bringToTop)){
				if(target.isShown() && target._wasResized && !target.isTopmost && rias.isFunction(target.bringToTop)){
					target.bringToTop();
				}else if(rias.isFunction(target.toggle)){
					target.toggle();
				}
			}
		},

		_onMouseEnter: function(e){
			var self = this,
				target = self.targetWidget;
			if(target && target.toggleOnEnter && target.toggleable && !self._autoToggleDelay && !target._playing){
				self._autoToggleDelay = self.defer(function(){
					if(self._autoToggleDelay){
						self._autoToggleDelay.remove();
						self._autoToggleDelay = undefined;
					}
					if(target.isHidden() || target.isCollapsed()){
						target.restore();
					}else if(target.isShown() && !target.get("isTopmost")){
						target.bringToTop();
					}
				}, rias.autoToggleDuration);
			}
		},
		_onMouseLeave: function(e){
			if(this._autoToggleDelay){
				this._autoToggleDelay.remove();
				this._autoToggleDelay = undefined;
			}
		}

	});

	var riasType = "rias.riasw.layout.DockBar";
	var Widget = rias.declare(riasType, [Panel],{
		// summary:
		//		A widget that attaches to a node and keeps track of incoming / outgoing FloatingPanes
		//		and handles layout

		///直接使用 Panel。
		//templateString: '<div class="DockBar"><ul data-dojo-attach-point="containerNode" class="dijitReset riaswDockBarList"></ul></div>',

		// _docked: [private] Array
		//		array of panes currently in our dock
		///这里申明，是在 ctor 里面，_docked.push() 是对 ctor 操作。
		//_docked: [],

		_riasdRefChildren: {
			items: "_docked",
			add: "addTarget",
			remove: "removeTarget"
		},

		//float: "left",

		postCreate: function(){
			var self = this;
			self.inherited(arguments);
			this._initAttr(["float"]);
		},

		_onFloatAttr: function(value, oldValue){
			rias.filter(this.getChildren(), function(child){
				rias.dom.setStyle(child.domNode, "float", value);
			});
		},

		findTarget: function(targetWidget){
			return rias.filter(this.getChildren(), function(child){
				return child.targetWidget === targetWidget;
			})[0];
		},
		addTarget: function(targetWidget){
			if(!rias.isInstanceOf(targetWidget, _PanelBase)){
				return;
			}
			var node = this.findTarget(targetWidget);
			if(node){
				return node;
			}
			//var div = rias.dom.create('li', null, this.containerNode);
			if(!this._docked){
				this._docked = [];
			}
			this._docked.push(targetWidget);
			this.addChild(node = new DockNode(rias.mixinDeep({
				ownerRiasw: this,
				targetWidget: targetWidget,
				label: targetWidget.caption || targetWidget.title,
				tooltip: targetWidget.tooltip || targetWidget.caption || targetWidget.title,
				iconClass: targetWidget.iconClass,
				badgeStyle: targetWidget.badgeStyle,
				badgeColor: targetWidget.badgeColor,
				badge: targetWidget.badge,
				style: {
					float: this.float
				}
			}, targetWidget.dockNodeParams)));
			var self= this,
				h = rias.after(node, "destroy", function(){
					rias.removeItems(self._docked, node);
					h.remove();
				});
			node.startup();
			return node;
		},
		removeTarget: function(targetWidget){
			var node = this.findTarget(targetWidget);
			if(node){
				node.destroyRecursive();
			}
			return node;
		},

		startup: function(){
			this.inherited(arguments);
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswDockBarIcon",
		iconClass16: "riaswDockBarIcon16",
		defaultParams: {
			//content: "<span></span>"
		},
		initialSize: {},
		allowedChild: "rias.riasw.layout.DialogPanel",
		"property": {
		}
	};

	return Widget;

});