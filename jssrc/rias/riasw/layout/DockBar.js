define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_CssStateMixin",
	"dojo/dnd/Moveable",
	"rias/riasw/layout/_PanelBase",
	"rias/riasw/layout/Panel",
	"rias/riasw/form/Button",///Badge
	"dijit/BackgroundIframe"
], function(rias, _Widget, _TemplatedMixin, _CssStateMixin, Moveable, _PanelBase, Panel){

	rias.theme.loadCss([
		"form/Button.css",
		"layout/DockBar.css"
	]);

	var DockNode = rias.declare("rias.riasw.layout.DockNode", [_Widget, _TemplatedMixin, _CssStateMixin], {
		title: "",

		targetWidget: null,

		templateString:
			'<span data-dojo-attach-point="focusNode" class="riaswDockNode" data-dojo-attach-event="onclick: toggle">'+
				'<span data-dojo-attach-point="iconNode" class="dijitReset dijitInline riaswDockNodeIcon"></span>'+
				'<span data-dojo-attach-point="titleNode" class="riaswDockNodeTitle">${title}</span>'+
				'<div data-dojo-attach-point="badgeNode" class="${badgeClass}">'+
					'<div data-dojo-attach-point="badgeText" class="riasButtonBadgeRed"></div>'+
				'</div>'+
			'</span>',

		baseClass: "riaswDockNode",
		cssStateNodes: {
			domNode: "riaswDockNode",
			focusNode: "riaswDockNode"
		},
		iconClass: "riaswDockNodeDefaultIcon",
		_setIconClassAttr: function(value){
			rias.dom.removeClass(this.iconNode, this.iconClass || "riaswDockNodeDefaultIcon");
			this._set("iconClass", (value && value !== "dijitNoIcon") ? value : "riaswDockNodeDefaultIcon");
			rias.dom.addClass(this.iconNode, this.iconClass);
		},

		badgeClass: "riasButtonBadge",
		badgeStyle: "",
		badgeColor: "red",//"blue","green","red"(default)
		badge: "",
		_getBadgeStyleAttr: function(){
			return this.badgeStyle;
		},
		_setBadgeStyleAttr: function(/*String*/value){
			var n = this.badgeNode;
			if(rias.isObject(value)){
				rias.dom.setStyle(n, value);
			}else{
				if(n.style.cssText){
					n.style.cssText += "; " + value;
				}else{
					n.style.cssText = value;
				}
			}
			this._set("badgeStyle", value);
		},
		_getBadgeColorAttr: function(){
			return this.badgeColor;
		},
		_setBadgeColorAttr: function(/*String*/value){
			var n = this.badgeText;
			if(rias.isString(value)){
				rias.dom.removeClass(n, "riasButtonBadgeRed");
				rias.dom.removeClass(n, "riasButtonBadgeBlue");
				rias.dom.removeClass(n, "riasButtonBadgeGreen");
				rias.dom.removeClass(n, "riasButtonBadgeYellow");
				switch(value.charAt(0)){
					case "b":
						rias.dom.addClass(n, "riasButtonBadgeBlue");
						this._set("badgeColor", "blue");
						break;
					case "g":
						rias.dom.addClass(n, "riasButtonBadgeGreen");
						this._set("badgeColor", "green");
						break;
					case "y":
						rias.dom.addClass(n, "riasButtonBadgeYellow");
						this._set("badgeColor", "yellow");
						break;
					default:
						rias.dom.addClass(n, "riasButtonBadgeRed");
						this._set("badgeColor", "red");
				}
			}
		},
		_getBadgeAttr: function(){
			return this.badgeText.innerHTML || "";
		},
		_setBadgeAttr: function(/*String*/value){
			if(value){
				this.badgeText.innerHTML = value;
				this.badgeNode.style.visibility = "visible";
			}else{
				this.badgeNode.style.visibility = "hidden";
			}
			this._set("badge", value);
		},

		_setTargetState: function(){
			if(!this.targetWidget){
				return;
			}
			var d = this.targetWidget.displayState,
				s = d === _PanelBase.displayShowNormal || d === _PanelBase.displayShowMax || d === _PanelBase.displayShowMin,
				t = s && this.targetWidget.isTopmost;
			rias.dom.toggleClass(this.domNode, "riaswDockNodeTopmost", t);
			rias.dom.toggleClass(this.domNode, "riaswDockNodeShown", s);
			rias.dom.toggleClass(this.domNode, "riaswDockNodeDocked", !s);
		},
		_setTargetWidgetAttr: function(widget){
			rias.forEach(this._hBadge, function(item){
				item.remove();
			});
			if(rias.isInstanceOf(widget, _PanelBase)){
				this._hBadge = this.own(
					rias.after(widget, "_getBadgeStyleAttr", rias.hitch(this, "_getBadgeStyleAttr"), true),
					rias.after(widget, "_setBadgeStyleAttr", rias.hitch(this, "_setBadgeStyleAttr")),
					rias.after(widget, "_getBadgeColorAttr", rias.hitch(this, "_getBadgeColorAttr"), true),
					rias.after(widget, "_setBadgeColorAttr", rias.hitch(this, "_setBadgeColorAttr")),
					rias.after(widget, "_getBadgeAttr", rias.hitch(this, "_getBadgeAttr"), true),
					rias.after(widget, "_setBadgeAttr", rias.hitch(this, "_setBadgeAttr")),

					rias.after(widget, rias.isFunction(widget._setCaptionAttr) ? "_setCaptionAttr" : "_setTitleAttr", rias.hitch(this, function(value){
						this.set("title", value);
					})),
					rias.after(widget, "onDisplayStateChanged", rias.hitch(this, "_setTargetState")),
					rias.isFunction(widget._onBringToTop) ? rias.after(widget, "_onBringToTop", rias.hitch(this, "_setTargetState")) : undefined,
					rias.after(widget, "_setIconClassAttr", rias.hitch(this, "_setIconClassAttr"))
				);
				this._set("targetWidget", widget);
			}else{
				this._set("targetWidget", null);
			}
		},

		startup: function(){
			this.inherited(arguments);
		},
		destroy: function(){
			//if(this._destroying || this._beingDestroyed){
			//	return;
			//}
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
				if(!this.targetWidget.isTopmost && rias.isFunction(this.targetWidget.bringToTop)){
					this.targetWidget.bringToTop();
				}else if(rias.isFunction(this.targetWidget.toggle)){
					this.targetWidget.toggle();
				}
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
				title: targetWidget.caption || targetWidget.title,
				iconClass: targetWidget.iconClass,
				badgeStyle: targetWidget._badgeStyle,
				badgeColor: targetWidget._badgeColor,
				badge: targetWidget._badge
			}));
			var self= this,
				h = this.own(
				rias.after(node, "destroy", function(){
					rias.removeItems(self._docked, node);
					h.remove();
				})
			)[0];
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