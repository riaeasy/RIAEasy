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

	rias.theme.loadCss([
		"layout/DockBar.css"
	]);

	var DockNode = rias.declare("rias.riasw.layout.DockNode", [_Widget, _TemplatedMixin, _CssStateMixin, _BadgeMixin], {
		title: "",

		targetWidget: null,

		templateString:
			'<div data-dojo-attach-point="focusNode" class="riaswDockNode" data-dojo-attach-event="onclick:toggle,onmouseenter:onMouseEnter" role="button">'+
				'<span data-dojo-attach-point="toggleIcon" class="dijitReset dijitInline riaswDockNodeIcon"></span>'+
				'<span data-dojo-attach-point="iconNode" class="dijitReset dijitInline dijitIcon"></span>'+
				'<span data-dojo-attach-point="containerNode,titleNode,labelNode" class="riaswDockNodeTitle"></span>'+
				'<div data-dojo-attach-point="badgeNode" class="${badgeClass}">'+
				'</div>'+
			'</div>',

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

		_setBadgeAttr: function(/*String*/value){
			this.inherited(arguments);
			rias.dom.toggleClass(this.domNode, "riaswBadgeNodeStretch", !!value);
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

		_setTargetState: function(){
			if(!this.targetWidget){
				return;
			}
			//var s = this.targetWidget.isShown();
			/// isShown() 检测了 _wasShown，在初始化时由于 _playing 的延迟而导致返回 false。改用 displayState 来判断。
			var d = this.targetWidget.displayState,
				s = d === _PanelBase.displayShowNormal || d === _PanelBase.displayShowMax || d === _PanelBase.displayShowMin;
			rias.dom.toggleClass(this.domNode, "riaswDockNodeTopmost", !!this.targetWidget.isTopmost);
			rias.dom.toggleClass(this.domNode, "riaswDockNodeShown", s);
			rias.dom.toggleClass(this.domNode, "riaswDockNodeDocked", !s);
			if(s){
				rias.dom.setStyle(this.domNode, "background-color", rias.dom.getStyle(this.targetWidget.captionNode, "background-color"));
			}else{
				rias.dom.setStyle(this.domNode, "background-color", "");
			}
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
						self._setTargetState(newValue);
					})
				);
				if(rias.isFunction(widget.onBringToTop)){
					self._hBadge.concat(self.own(rias.after(widget, "onBringToTop", function(){
						self._setTargetState();
					}, true)));
				}
				self._set("targetWidget", widget);
				self.set("caption", widget.get("caption"));
				self.set("tooltip", widget.get("tooltip"));
				self.set("iconClass", widget.get("iconClass"));
				self.set("badgeStyle", widget.get("badgeStyle"));
				self.set("badgeColor", widget.get("badgeColor"));
				self.set("badge", widget.get("badge"));
				self._setTargetState();
			}else{
				self._set("targetWidget", null);
				///这里不应该初始化 caption 等，而应该保持设计值。
			}
		},

		startup: function(){
			this.inherited(arguments);
		},
		destroy: function(){
			rias.forEach(this._hBadge, function(item){
				item.remove();
			});
			delete this._hBadge;
			if(this.targetWidget && this.targetWidget.restore){
				this.targetWidget.restore();
			}
			delete this.targetWidget;
			this.inherited(arguments);
		},

		/*restore: function(){
			// summary:
			//		remove this dock item from parent dock, and call show() on reffed floatingpane
			if(this.targetWidget && this.targetWidget.restore){
				this.targetWidget.restore();
			}
			//this.destroyRecursive();
		},*/
		toggle: function(){
			if(this.targetWidget){
				//if(this.targetWidget.isShown() && !this.targetWidget.isTopmost && rias.isFunction(this.targetWidget.bringToTop)){
				if(this.targetWidget.isShown() && this.targetWidget._wasResized && !this.targetWidget.isTopmost && rias.isFunction(this.targetWidget.bringToTop)){
					this.targetWidget.bringToTop();
				}else if(rias.isFunction(this.targetWidget.toggle)){
					this.targetWidget.toggle();
				}
			}
		},

		onMouseEnter: function(e){
			if(this.targetWidget && this.targetWidget.autoToggle){
				if(this.targetWidget.isDocked()){
					this.targetWidget.restore();
				}
			}
		},
		onMouseLeave: function(e){
			//if(this.targetWidget && this.targetWidget.autoToggle){
			//	if(this.targetWidget.isShown() && this.targetWidget._wasResized){
			//		this.targetWidget.dock();
			//	}
			//}
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

		float: "left",

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
			this.addChild(node = new DockNode({
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
			}));
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