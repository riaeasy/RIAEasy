define([
	"rias",
	"dijit/_TemplatedMixin",
	"rias/riasw/layout/_PanelBase",
	"rias/riasw/form/Button",
	"rias/riasw/layout/_TabControllerMixin",
	"dijit/BackgroundIframe"
], function(rias, _TemplatedMixin, _PanelBase, Button, _TabControllerMixin){

	///由于 css 加载的延迟，造成如果 domNode 的 css 有 padding、margin、border，可能显示不正确，最好移到 _PabelBase 中加载。
	//rias.theme.loadThemeCss([
	//	"riasw/layout/DockBar.css"
	//]);

	var DockNode = rias.declare("rias.riasw.layout.DockNode", [Button], {
		title: "",

		targetWidget: null,

		templateString:
			'<span data-dojo-attach-point="focusNode,buttonNode" class="dijitReset dijitInline riaswDockNode" data-dojo-attach-event="onclick:_onClick,onmouseenter:_onMouseEnter,onmouseleave:_onMouseLeave" role="button" aria-labelledby="${id}_label">'+
				'<span data-dojo-attach-point="badgeNode" class="${badgeClass}"></span>'+
				'<span data-dojo-attach-point="closeNode" class="${badgeClass} riaswDockCloseNode" data-dojo-attach-event="onclick: _onClose">'+
					'<span data-dojo-attach-point="closeNodeText" class="riaswBadgeText riaswBadgeBlack">X</span>'+
				'</span>'+
				'<span data-dojo-attach-point="iconNode" class="dijitInline dijitIcon riaswButtonIconNode"></span>'+
				'<span data-dojo-attach-point="containerNode,titleNode,labelNode" class="dijitInline riaswButtonText" id="${id}_label"></span>'+
			'</span>',

		 cssStateNodes: {
			focusNode: "riaswDockNode"
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
			if(this.targetWidget && !this.targetWidget.isDestroyed(true, true) && rias.isFunction(this.targetWidget.restore)){
				this.targetWidget.restore(false);
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
				s = d === rias.riasw.layout.displayShowNormal || d === rias.riasw.layout.displayShowMax || d === rias.riasw.layout.displayCollapsed;
			/// focused 容易改变、丢失，用 selected
			rias.dom.toggleClass(this.domNode, "riaswDockNodeSelected", !!this.targetWidget.get("selected"));
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
					/// focused 容易改变、丢失，用 selected
					widget.watch('selected', function(name, oldValue, newValue){
						self.setTargetState();
					}),
					//widget.watch('focused', function(name, oldValue, newValue){
					//	self.setTargetState();
					//}),
					widget.watch('displayState', function(name, oldValue, newValue){
						self.setTargetState();
					})
				);
				//if(rias.isFunction(widget.onSelected)){
				//	self._hBadge.concat(self.own(rias.after(widget, "onSelected", function(){
				//		self.setTargetState();
				//	}, true)));
				//}
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
				this.targetWidget.restore(true);
			}
		},
		_onClick: function(e){
			e.stopPropagation();
			e.preventDefault();
			if(!this.disabled){
				var target = this.targetWidget;
				if(target && !target._playing){
					///某些时候，target 被隐藏，但任然是 focused
					if(rias.isFunction(target.toggle) && (target.get("selected") || !target.get("visible"))){
						target.toggle();
					}else if(rias.isFunction(target.focus)){
						target.focus();
					}
				}
			}
			return false;
		},
		_onClose: function(e){
			e.stopPropagation();
			e.preventDefault();
			if(!this.disabled){
				var target = this.targetWidget;
				if(target && !target._playing){
					if(rias.isFunction(target.close)){
						target.close();
					}
				}
			}
			return false;
		},

		_onMouseEnter: function(e){
			var self = this,
				target = self.targetWidget;
			if(target){
				if(target.toggleOnEnter && target.toggleable && !self._autoToggleDelay && !target._playing){
					self._autoToggleDelay = self.defer(function(){
						if(self._autoToggleDelay){
							self._autoToggleDelay.remove();
							self._autoToggleDelay = undefined;
						}

						if(target.isHidden() || target.isCollapsed()){
							target.restore(true);
						}else if(rias.isFunction(target.focus) && (!target.get("visible") || !target.get("selected"))){
							target.focus();
						}else{
							target.toggle();
						}
					}, rias.autoToggleDuration);
				}
				if(target.closable){
					//rias.dom.visible(self.closeNode, true);
					rias.dom.addClass(this.closeNode, "riaswBadgeVisible");
				}
			}
		},
		_onMouseLeave: function(e){
			if(this._autoToggleDelay){
				this._autoToggleDelay.remove();
				this._autoToggleDelay = undefined;
			}
			//rias.dom.visible(this.closeNode, false);
			rias.dom.removeClass(this.closeNode, "riaswBadgeVisible");
		}

	});

	var riaswType = "rias.riasw.layout.DockBar";
	var Widget = rias.declare(riaswType, [_PanelBase, _TemplatedMixin, _TabControllerMixin], {

		//使用 _TabControllerMixin 的 templateString
		//templateString: '<div class="DockBar"><ul data-dojo-attach-point="containerNode" class="dijitReset riaswDockBarList"></ul></div>',
		baseClass: "riaswDockBar",

		///这里申明，是在 ctor 里面，_docked.push() 是对 ctor 操作。
		//_docked: [],

		_riasdRefChildren: {
			items: "_docked",
			add: "addTarget",
			remove: "removeTarget"
		},

		//float: "left",

		findNodeByTarget: function(targetWidget){
			return rias.filter(this.getChildren(), function(child){
				return child.targetWidget === targetWidget;
			})[0];
		},
		addTarget: function(targetWidget){
			if(!rias.isInstanceOf(targetWidget, _PanelBase)){
				return;
			}
			var node = this.findNodeByTarget(targetWidget);
			if(node){
				return node;
			}
			if(!this._docked){
				this._docked = [];
			}
			this._docked.push(targetWidget);
			this.addChild(node = this.createButton(DockNode, rias.mixinDeep(targetWidget.dockNodeArgs, {
				targetWidget: targetWidget,
				label: targetWidget.caption || targetWidget.title,
				tooltip: targetWidget.tooltip || targetWidget.caption || targetWidget.title,
				iconClass: targetWidget.iconClass,
				badgeStyle: targetWidget.badgeStyle,
				badgeColor: targetWidget.badgeColor,
				badge: targetWidget.badge
			})));
			var self= this,
				h = rias.after(node, "destroy", function(){
					rias.removeItems(self._docked, targetWidget);
					h.remove();
				});
			node.startup();
			return node;
		},
		removeTarget: function(targetWidget){
			var node = this.findNodeByTarget(targetWidget);
			if(node){
				this.removeChild(node);
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