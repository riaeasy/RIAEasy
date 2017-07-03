
//RIAStudio client runtime widget - CaptionPanel

define([
	"riasw/riaswBase",
	"riasw/layout/ContentPanel",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/ToolButton",
	"riasw/sys/ToolbarSeparator",
	"riasw/layout/DockBar"
], function(rias, ContentPanel, _TemplatedMixin, ToolButton, ToolbarSeparator, DockBar){

	///由于 css 加载的延迟，造成如果 domNode 的 css 有 padding、margin、border，可能显示不正确，最好移到 _PabelBase 中加载。
	//rias.theme.loadThemeCss([
	//	"riasw/layout/CaptionPanel.css"
	//]);

	var _dom = rias.dom;
	var riaswType = "riasw.layout.CaptionPanel";
	var Widget = rias.declare(riaswType, [ContentPanel, _TemplatedMixin], {

		templateString:
			"<div role='region' class='dijitReset' data-dojo-attach-event='onmouseenter: _onMouseEnter, onmouseleave: _onMouseLeave'>"+
				"<div role='button' data-dojo-attach-point='captionContainer,captionNode,focusNode' class='riaswCaptionPanelCaptionNode' data-dojo-attach-event='ondblclick:_toggleMax, onkeydown:_toggleKeydown'>"+
					/// float 元素需要提前显示
					"<span data-dojo-attach-point='badgeNode' class='dijitInline ${badgeClass}'></span>"+
					"<div data-dojo-attach-point='captionToolsNode' class='dijitInline riaswCaptionToolsNode riaswFloatRight' role='region'></div>"+
					"<span data-dojo-attach-point='iconNode' class='riaswButtonIcon riaswNoIcon'></span>"+
					"<span data-dojo-attach-point='labelNode' class='riaswButtonLabel riaswNoLabel'></span>"+
				"</div>"+
				"<div role='region' data-dojo-attach-point='containerNode' class='riaswCaptionPanelContent'></div>"+
			"</div>",
		baseClass: "riaswCaptionPanel",

		cssStateNodes: {
			//focusNode: "riaswCaptionPanelCaptionNode"
		},

		//persist: true,

		//captionTools: [],
		//caption: "",
		showCaption: true,
		showToolButtonLabel: false,
		collapsedWidth: 0,

		animate: true,
		splitter: false,
		//selectable: true,
		toggleable: false,
		displayStateOnToggle: "collapsed",
		displayStateOnHover: "",
		displayStateOnLeave: "",
		displayStateOnBlur: "",
		maxable: false,
		closable: false,
		//movable: false,
		//resizable: "none",

		extIconNode: null,

		dockTo: null,
		alwaysShowDockNode: true,

		selected: false,

		_calCollapsedHeight: function(){
			if(this.showCaption && this.captionNode){
				this.collapsedHeight = _dom.getMarginBox(this.captionNode).h + _dom.getBoxExtents(this.domNode).h;// rias.dom.getMarginBox(this.captionNode).h;
			}else{
				this.collapsedHeight = 0;
			}
		},
		postMixInProperties: function(){
			//this.nameAttrSetting = this.name ? ("name='" + this.name + "'") : "";
			if(!this.captionTools){
				this.captionTools = [];
			}
			this.inherited(arguments);
		},
		addCaptionTool: function(item, index){
			///注意：默认没有 _riaswIdInModule，如果有需求，需要显式指定，特别要注意的是：Dialog 是 Module。
			///_riaswIdInModule 可以通过 toolName 来获取。
			var self = this,
				p = Widget._internalToolParams,
				ps;
			if(this.captionToolsNode){
				/// ps 需要用 mixinDeep 副本，避免修改 _internalToolParams
				if(rias.isString(item)){
					///已经存在，则忽略，不创建，不改变 parent。
					if(!this[item]){
						ps = item === "toolClose" ? p.toolClose :
							item === "toolShowMax" ? p.toolShowMax :
								item === "toolDockRegion" ? p.toolDockRegion :
									item === "toolShowMore" ? p.toolShowMore :
										item === "toolShowOption" ? p.toolShowOption :
											item === "toolRefresh" ? p.toolRefresh :
												item === "|" ? {
													_riaswType: "riasw.sys.ToolbarSeparator"
												} : undefined;
						if(ps){
							ps = rias.mixinDeep({}, ps);
						}
					}
				}else if(rias.isObjectSimple(item)){///允许简化的 riaswParams
					if(!item.toolName || !this[item.toolName]){
						/// 忽略已经存在的
						ps = item.toolName === "toolClose" ? p.toolClose :
							item.toolName === "toolShowMax" ? p.toolShowMax :
								item.toolName === "toolDockRegion" ? p.toolDockRegion :
									item.toolName === "toolShowMore" ? p.toolShowMore :
										item.toolName === "toolShowOption" ? p.toolShowOption :
											item.toolName === "toolRefresh" ? p.toolRefresh :
											{
												iconClass: "logoRiaEasyIcon",
												showLabel: false
											};
						ps = rias.mixinDeep({}, ps, item);
					}else{
						this[item.toolName].placeAt(this.captionToolsNode, index);
					}
				}else if(rias.isRiasw(item)){
					item.placeAt(this.captionToolsNode, index);
				}
				if(ps){
					/// ps 已经是副本，可以直接 mixin
					ps = rias.mixin({
						_riaswType: "riasw.sys.ToolButton",
						ownerRiasw: this,
						showLabel: this.showToolButtonLabel
					}, ps);
					///ps 是 riawParams，故不能用 getOwnerRiasw()
					//if(ps.toolName === "toolDockRegion"){
					//	///注意：这里需要先 decodeRiaswParams，而不能放到 parseRiasws 里解析，且，contextWidget 用 self，而不是 popupMenu
					//	rias.decodeRiaswParams(self, ps, self.id);
					//	rias.forEach(ps.popupMenu._riaswElements, function(p){
					//		rias.decodeRiaswParams(self, p, self.id);///注意：这里需要先 decodeRiaswParams，而不能放到 parseRiasws 里解析，且，contextWidget 用 self，而不是 popupMenu
					//	});
					//}
					var d = rias.parseRiasws(ps, ps.ownerRiasw, this.captionToolsNode, index).then(function(result){
						if(result && result.widgets){
							ps = result.widgets[0];
							if(ps.toolName){
								self[ps.toolName] = ps;
							}
							self.after(ps, "destroy", function(){
								delete self[ps.toolName];
							});
						}
						return result;
					});
					this._renderDeferreds.push(d);
					return d;
				}
			}
			return rias.when(false);
		},
		//removeCaptionTool: function(obj){
		//},
		buildRendering: function(){
			this.inherited(arguments);

			///为了能够正确计算 _calCollapsedHeight，需要先创建 toolToggle
			var self = this;
			this.toolToggle = new ToolButton({
				ownerRiasw: self,
				//_riaswAttachPoint: "toolToggle",
				iconClass: this.isCollapsed() ? "captionRightIcon" : "captionDownIcon",
				showLabel: false,
				label: rias.i18n.action.showToggle,
				tooltip: rias.i18n.action.showToggle,
				onCheckBusy: function(msTime){
					return !!self._playingDeferred && !self._playingDeferred.isFulfilled();
				},
				onClick: function(evt){
					self._toggleClick(evt);
				}
			});
			_dom.place(this.toolToggle.domNode, this.iconNode, "before");
			if(this.captionToolsNode && this.captionTools && this.captionTools.length){
				rias.allInOrder(this.captionTools, rias.debugDeferredTimeout ? rias.defaultDeferredTimeout >> 2 : 0, function(arr){
					this.cancel();
				}, function(item, i){
					return self.addCaptionTool(item, i);
				});
			}
			//var oldCls = this._captionClass;
			//this._captionClass = this._baseClass0 + "CaptionNode" + (this.toggleable ? this.isCollapsed() ? "Collapsed" : "Expanded" : "Fixed");
			//_dom.replaceClass(this.captionNode, this._captionClass, oldCls || "");
			this._calCollapsedHeight();
		},
		postCreate: function(){
			if(this.closable){
				if(!this.toolClose){
					this.addCaptionTool("toolClose", -1);
				}else{
					this.toolClose.set("visible", true);
				}
			}else{
				rias.destroy(this.toolClose);
			}
			if(this.maxable){
				if(!this.toolShowMax){
					this.addCaptionTool("toolShowMax", this.toolClose ? -2 : -1);
				}else{
					this.toolShowMax.set("visible", true);
				}
			}else{
				rias.destroy(this.toolShowMax);
			}
			this.inherited(arguments);
		},
		_onDestroy: function(){
			if(this._autoToggleDelay){
				this._autoToggleDelay.remove();
				this._autoToggleDelay = undefined;
			}
			if(this.dockTo && this.dockTo.removeTarget && !this.dockTo.isDestroyed(false)){/// this.dockTo 可能不是正常的 DockBar
				this.dockTo.removeTarget(this);
			}
			this.inherited(arguments);
		},

		_setRegionAttr: function(value){
			this.inherited(arguments);
			this.set("maxable", this.get("maxable"));
			this._adjCaption();
		},
		onCaptionChanging: function(value, oldValue){
			return value;
		},
		onCaptionChanged: function(value){},
		_setCaptionAttr: function(value){
			if(!rias.isEqual(this.labelNode.innerHTML, value)){
				value = this.onCaptionChanging(value, this.labelNode.innerHTML) + "";
				this._set("caption", value);
				_dom.toggleClass(this.labelNode, "riaswHidden", !value);
				_dom.toggleClass(this.labelNode, "riaswNoLabel", !value);
				_dom.toggleClass(this.labelNode, "riaswHasLabel", !!value);
				this.labelNode.innerHTML = value;
				this.onCaptionChanged();
			}
		},
		_setCaptionClassAttr: function(value){
			_dom.removeClass(this.captionNode, this.captionClass);
			this._set("captionClass", value);
			_dom.addClass(this.captionNode, value);
			this._calCollapsedHeight();
		},
		_setShowCaptionAttr: function(value){
			value = !!value;
			this._set("showCaption", value);
			_dom.toggleClass(this.captionNode, "riaswHidden", !this.showCaption);
			_dom.toggleClass(this.domNode, this._baseClass0 + "NoCaption", !this.showCaption);
			this._calCollapsedHeight();
		},
		_setMaxableAttr: function(value){
			value = !!value && !this.region;
			this._set("maxable", value);
			if(this._started){
				if(this.maxable){
					if(!this.toolShowMax){
						this.addCaptionTool("toolShowMax", this.toolClose ? -2 : -1);
					}else{
						this.toolShowMax.set("visible", true);
					}
				}else{
					rias.destroy(this.toolShowMax);
				}
			}
		},
		_setClosableAttr: function(value){
			value = !!value;
			this._set("closable", value);
			if(this._started){
				if(this.closable){
					if(!this.toolClose){
						this.addCaptionTool("toolClose", -1);
					}else{
						this.toolClose.set("visible", true);
					}
				}else{
					rias.destroy(this.toolClose);
				}
			}
		},
		_setToggleableAttr: function(value){
			value = !!value;
			this._set("toggleable", value);
			_dom.setStyle(this.toolToggle.domNode, "width", this.toggleable ? "" : "0px");///需要保持 height，支持 badge
			_dom.setStyle(this.toolToggle.iconNode, "width", this.toggleable ? "" : "0px");///需要保持 height，支持 badge
			if(this.toggleable){
				_dom.addClass(this.toolToggle.iconNode, this.isCollapsed() ? "captionRightIcon" : "captionDownIcon");///需要保持 height，支持 badge
			}else{
				_dom.removeClass(this.toolToggle.iconNode, "captionRightIcon captionDownIcon");///需要保持 height，支持 badge
			}
			//this.toolToggle.set("visible", this.toggleable);
			if(this._minSize0){
				this.set("minSize", this._minSize0);
			}
			if(this._maxSize0){
				this.set("maxSize", this._maxSize0);
			}
		},
		makeDockNodeArgs: function(){
			return {};
		},
		_setDockToAttr: function(value){
			value = rias.by(value, this);///因为没有 dockable 属性，dockTo 即表示是否 dockable，所以允许为 undefined
			if(!value && this.dockTo){
				if(this.dockTo.removeTarget){///担心 this.dockTo 可能不是正常的
					this.dockTo.removeTarget(this);
				}
				this.dockTo = null;
				if(this.isCollapsed()){
					this.restore(false);
				}
			}else if(value){
				if(rias.is(value, DockBar)){
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
		_setAlwaysShowDockNodeAttr: function(value, oldValue){
			value = !!value;
			if(!rias.isEqual(this.alwaysShowDockNode, value)){
				this._set("alwaysShowDockNode", value);
				if(this.dockTo){
					if(value){
						this.dockTo.addTarget(this);
					}else if(this.isShowing(true)){
						this.dockTo.removeTarget(this);
					}else if(this.isHidden() || this.isCollapsed()){
						this.dockTo.addTarget(this);
					}
				}
			}
		},

		_onMouseEnter: function(e, fromDockNode){
			//e.preventDefault();
			//e.stopPropagation();
			var self = this;
			if(self.displayStateOnHover && !self._autoToggleDelay && !self._playing){
				self._autoToggleDelay = self.defer(function(){
					if(self._autoToggleDelay){
						self._autoToggleDelay.remove();
						self._autoToggleDelay = undefined;
					}
					//if(self.isCollapsed()){
					//	self.restore(false);
					//}
					self.display(self.displayStateOnHover);
				}, rias.autoToggleDuration);
			}
		},
		_onMouseLeave: function(e, fromDockNode){
			//e.preventDefault();
			//e.stopPropagation();
			if(this._autoToggleDelay){
				this._autoToggleDelay.remove();
				this._autoToggleDelay = undefined;
			}
			if(this.displayStateOnLeave && !this._playing){
				//if(this.isShowing(true)){
				//	this.collapse();
				//}
				this.display(this.displayStateOnLeave);
			}
		},
		_onBlur: function(){
			if(this._autoToggleDelay){
				this._autoToggleDelay.remove();
				this._autoToggleDelay = undefined;
			}
			if(this.displayStateOnBlur && !this._playing){
				//if(this.isShowing(true)){
				//	this.collapse();
				//}
				this.display(this.displayStateOnBlur);
			}
			this.inherited(arguments);
		},

		_setStateClass: function(){
			///需要响应非 captionNode
			this.inherited(arguments);
			///避免 Container 的 css 包含，需要单独设置 captionNode 的 css
			_dom.toggleClass(this.captionNode, this._baseClass0 + "CaptionNodeHover", !!this.hovering);
			_dom.toggleClass(this.captionNode, this._baseClass0 + "CaptionNodeActive", !!this.active);
			_dom.toggleClass(this.captionNode, this._baseClass0 + "CaptionNodeFocused", !!this.focused);
			_dom.toggleClass(this.captionNode, this._baseClass0 + "CaptionNodeSelected", !!this.selected);
		},
		_adjCaption: function(){
			var isCollapsed = this.isCollapsed(),
				isV = (this.region === "left" || this.region === "right"),
				cpn = this.captionNode, ctn = this.captionToolsNode;
			///注意：riaswDisplayVertical 和 riaswTextVertical 不要跨 Widget，即不要加到 Container.domNode 或 Container.containerNode
			_dom.toggleClass(cpn, "riaswDisplayVertical", isV && isCollapsed);
			rias.forEach(this.splitBaseClass(), function(cls){
				_dom.toggleClass(cpn, cls + "CaptionNodeVertical", isV && isCollapsed);
			}, this);
			if(this.labelNode){
				_dom.toggleClass(this.labelNode, "riaswTextVertical", isV && isCollapsed);
			}
			rias.forEach(cpn.childNodes, function(node){
				_dom.toggleClass(node, "riaswFloatNone", isV && isCollapsed);
			});
			cpn = this.captionContainer;
			if(isV && isCollapsed){
				if(ctn !== cpn.lastChild){
					cpn.appendChild(ctn);
				}
			}else if(_dom.containsClass(ctn, "riaswFloatRight")){
				if(ctn !== cpn.firstChild){
					cpn.insertBefore(ctn, cpn.firstChild);
				}
			}
		},
		_updateDisplayState: function(){
			if(this._resizer){
				this._resizer.set("disabled", !this.isShowNormal());
			}

			_dom.toggleClass(this.domNode, this._baseClass0 + "Collapsed", this.isCollapsed());
			_dom.toggleClass(this.domNode, this._baseClass0 + "Maximized", this.isShowMax());
			/// CaptionNode 需要单独设置，避免 css 嵌套
			_dom.toggleClass(this.captionNode, this._baseClass0 + "CaptionNodeCollapsed", this.isCollapsed());
			_dom.toggleClass(this.captionNode, this._baseClass0 + "CaptionNodeMaximized", this.isShowMax());
			if(this.toolShowMax){
				if(this.isShowMax()){
					if(this.toolShowMax.get("iconClass") !== "captionShowCascadeIcon"){
						this.toolShowMax.set("iconClass", "captionShowCascadeIcon");
					}
				}else{
					if(this.toolShowMax.get("iconClass") !== "captionShowMaxIcon"){
						this.toolShowMax.set("iconClass", "captionShowMaxIcon");
					}
				}
			}
			if(this.toolToggle){
				if(this.isCollapsed()){
					if(this.toolToggle.get("iconClass") !== "captionRightIcon"){
						this.toolToggle.set("iconClass", "captionRightIcon");
					}
				}else{
					if(this.toolToggle.get("iconClass") !== "captionDownIcon"){
						this.toolToggle.set("iconClass", "captionDownIcon");
					}
				}
			}
			if(this.dockTo && !this.alwaysShowDockNode){
				if(this.isShowing(true)){
					this.dockTo.removeTarget(this);
				}else if(this.isHidden()){
					this.dockTo.addTarget(this);
				}
			}
			this._adjCaption();
			this.inherited(arguments);
		},

		_show: function(){
			var self = this;
			return rias.when(self.inherited(arguments), function(result){
				self._doPlayNode(true, self.domNode, self.duration / 2);///这个不建议 return.
				return result;
			});
		},
		collapse: function(){
			if(this.dockTo){
				var self = this;
				return self._checkCanHide().always(function(result){
					if(result != false){
						return self._doPlayNode(false, self.domNode, self.duration / 2).always(function(){
							return self.hide();
						});
					}
					return result;
				});
			}else{
				return this.inherited(arguments);
			}
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
			if(e.keyCode === rias.keys.DOWN_ARROW || e.keyCode === rias.keys.UP_ARROW){
				this._toggleClick(e);
			}
		},
		toggle: function(forceVisible){
			if(this.toggleable){
				if(this.isShowNormal()){
					return this.display(this.displayStateOnToggle || "collapsed");
				}else{
					return this.restore(forceVisible);
				}
			}else{
				return this.restore(forceVisible);
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
		},
		onToolShowMore: function(){
		},
		doToolShowMore: function(){
			this.onToolShowMore();
		},
		onToolShowOption: function(){
		},
		doToolShowOption: function(){
			this.onToolShowOption();
		},
		onToolRefresh: function(){
		},
		doToolRefresh: function(){
			this.onToolRefresh();
		}

	});

	Widget._internalToolParams = {
		toolClose: {
			toolName: "toolClose",
			_riaswAttachPoint: "toolClose",
			iconClass: "captionCloseIcon",
			label: rias.i18n.action.close,
			tooltip: rias.i18n.action.close,
			onCheckBusy: function(msTime){
				var d = this.getOwnerRiasw()._playingDeferred;
				return !!d && !d.isFulfilled();
			},
			onClick: function(evt){
				this.getOwnerRiasw().close(evt);
			}
		},
		toolShowMax: {
			toolName: "toolShowMax",
			_riaswAttachPoint: "toolShowMax",
			iconClass: "captionShowMaxIcon",
			label: rias.i18n.action.showMax,
			tooltip: rias.i18n.action.showMax,
			onCheckBusy: function(msTime){
				var d = this.getOwnerRiasw()._playingDeferred;
				return !!d && !d.isFulfilled();
			},
			onClick: function(evt){
				this.getOwnerRiasw()._toggleMax(evt);
			}
		},
		toolShowMore: {
			toolName: "toolShowMore",
			_riaswAttachPoint: "toolShowMore",
			iconClass: "captionShowMoreIcon",
			label: rias.i18n.action.showMore,
			tooltip: rias.i18n.action.showMore,
			onClick: function(evt){
				this.getOwnerRiasw().doToolShowMore(evt);
			}
		},
		toolShowOption: {
			toolName: "toolShowOption",
			_riaswAttachPoint: "toolShowOption",
			iconClass: "optionIcon",
			label: rias.i18n.action.option,
			tooltip: rias.i18n.action.option,
			onClick: function(evt){
				this.getOwnerRiasw().doToolShowOption(evt);
			}
		},
		toolRefresh: {
			toolName: "toolRefresh",
			_riaswAttachPoint: "toolRefresh",
			iconClass: "refreshIcon",
			label: rias.i18n.action.refresh,
			tooltip: rias.i18n.action.refresh,
			onClick: function(evt){
				this.getOwnerRiasw().doToolRefresh(evt);
			}
		},
		toolDockRegion: {
			toolName: "toolDockRegion",
			_riaswAttachPoint: "toolDockRegion",
			iconClass: "dockToIcon",
			label: rias.i18n.action.dockTo,
			tooltip: rias.i18n.action.dockTo,
			popupMenu: {
				_riaswType: "riasw.sys.Menu",
				_riaswAttachPoint: "toolDockRegionMenu",
				//autoFocus: true,
				leftClickToOpen: true,
				onShow: function(value){
					var self = this,
						panel = this.getOwnerRiasw().getOwnerRiasw();
					function _show(){
						switch(panel.dockRegion){
							case "none":
								self.toolDockRegionNone.set("checked", true);
								break;
							case "left":
								self.toolDockRegionLeft.set("checked", true);
								break;
							case "right":
								self.toolDockRegionRight.set("checked", true);
								break;
							case "top":
								self.toolDockRegionTop.set("checked", true);
								break;
							case "bottom":
								self.toolDockRegionBottom.set("checked", true);
								break;
							default:
								self.toolDockRegionAuto.set("checked", true);
						}
					}
					if(!this.toolDockRegionNone){
						return rias.parseRiasws([{
							_riaswType: "riasw.sys.RadioMenuItem",
							ownerRiasw: this,
							_riaswAttachPoint: "toolDockRegionNone",
							label: rias.i18n.action.dockToNone,
							tooltip: rias.i18n.action.dockToNone,
							"name": "toolDockRegionMenuItem",
							visible: !panel.dockRegionArgs.disabledNone,
							onChange: function(checked){
								if(checked){
									panel.set("dockRegion", "none");
								}
							}
						}, {
							_riaswType: "riasw.sys.RadioMenuItem",
							ownerRiasw: this,
							_riaswAttachPoint: "toolDockRegionAuto",
							label: rias.i18n.action.dockToAuto,
							tooltip: rias.i18n.action.dockToAuto,
							"name": "toolDockRegionMenuItem",
							visible: !panel.dockRegionArgs.disabledAuto,
							onChange: function(checked){
								if(checked){
									panel.set("dockRegion", "auto");
								}
							}
						}, {
							_riaswType: "riasw.sys.MenuSeparator",
							ownerRiasw: this,
							_riaswAttachPoint: "toolDockRegionSep",
							visible: !panel.dockRegionArgs.disabledNone || !panel.dockRegionArgs.disabledAuto
						}, {
							_riaswType: "riasw.sys.RadioMenuItem",
							ownerRiasw: this,
							_riaswAttachPoint: "toolDockRegionCenter",
							label: rias.i18n.action.dockToCenter,
							tooltip: rias.i18n.action.dockToCenter,
							"name": "toolDockRegionMenuItem",
							visible: !panel.dockRegionArgs.disabledCenter,
							onChange: function(checked){
								if(checked){
									panel.set("dockRegion", "center");
								}
							}
						}, {
							_riaswType: "riasw.sys.RadioMenuItem",
							ownerRiasw: this,
							_riaswAttachPoint: "toolDockRegionLeft",
							label: rias.i18n.action.dockToLeft,
							tooltip: rias.i18n.action.dockToLeft,
							"name": "toolDockRegionMenuItem",
							visible: !panel.dockRegionArgs.disabledLeft,
							onChange: function(checked){
								if(checked){
									panel.set("dockRegion", "left");
								}
							}
						}, {
							_riaswType: "riasw.sys.RadioMenuItem",
							ownerRiasw: this,
							_riaswAttachPoint: "toolDockRegionRight",
							label: rias.i18n.action.dockToRight,
							tooltip: rias.i18n.action.dockToRight,
							"name": "toolDockRegionMenuItem",
							visible: !panel.dockRegionArgs.disabledRight,
							onChange: function(checked){
								if(checked){
									panel.set("dockRegion", "right");
								}
							}
						}, {
							_riaswType: "riasw.sys.RadioMenuItem",
							ownerRiasw: this,
							_riaswAttachPoint: "toolDockRegionTop",
							label: rias.i18n.action.dockToTop,
							tooltip: rias.i18n.action.dockToTop,
							"name": "toolDockRegionMenuItem",
							visible: !panel.dockRegionArgs.disabledTop,
							onChange: function(checked){
								if(checked){
									panel.set("dockRegion", "top");
								}
							}
						}, {
							_riaswType: "riasw.sys.RadioMenuItem",
							ownerRiasw: this,
							_riaswAttachPoint: "toolDockRegionBottom",
							label: rias.i18n.action.dockToBottom,
							tooltip: rias.i18n.action.dockToBottom,
							"name": "toolDockRegionMenuItem",
							visible: !panel.dockRegionArgs.disabledBottom,
							onChange: function(checked){
								if(checked){
									panel.set("dockRegion", "bottom");
								}
							}
						}], this, this).then(function(result){
							_show();
						});
					}
					_show();
					return true;
				}
			}
		}
	};

	Widget._riasdMeta = {
		visual: true,
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
