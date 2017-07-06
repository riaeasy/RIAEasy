//RIAStudio ClientWidget - Dialog.

define([
	"riasw/riaswBase",
	"riasw/layout/CaptionPanel",
	"riasw/sys/_FormMixin",
	"riasw/sys/_ModuleMixin",
	"dojo/dnd/move",
	"dojo/dnd/TimedMoveable",
	"riasw/panelManager",
	"riasw/sys/Underlay",
	"riasw/layout/Panel",
	"riasw/form/Button"
], function(rias, CaptionPanel, _FormMixin, _ModuleMixin, move, TimedMoveable, panelManager, Underlay, Panel, Button){

	///由于 css 加载的延迟，造成如果 domNode 的 css 有 padding、margin、border，可能显示不正确，最好移到 _PabelBase 中加载。
	//rias.theme.loadThemeCss([
	//	"riasw/layout/CaptionPanel.css",
	//	"riasw/sys/Underlay.css"
	//]);

	var contentTypeInfo = "info",
		contentTypeWarn = "warn",
		contentTypeError = "error",
		contentTypeChoose = "choose",
		contentTypeAbout = "about",
		contentTypeNone = "none";
	function contentTypeStr(contentType){
		if(rias.isString(contentType)){
			return contentType;
		}
		switch(contentType){
			case 1:
				return contentTypeInfo;
			case -1:
				return contentTypeAbout;
			case 2:
				return contentTypeWarn;
			case 3:
				return contentTypeError;
			default:
				return contentTypeNone;
		}
	}

	var _tip_arrow_size = 9;///跟随 css 变化

	var riaswType = "riasw.sys.Dialog";
	var Widget = rias.declare(riaswType, [CaptionPanel, _FormMixin, _ModuleMixin], {

		formResult: rias.formResult.frNone,
		checkModifiedWhenHide: true,

		_tip_arrow_size: 0,///跟随 _tip_arrow_size 和 dialogType 变化

		///dialogType: 0 = win, 1 = modal, 2 = top, 3 = tip. 4 = dropDown
		isDropDown: function (){
			return this.dialogType && rias.contains(this.dialogType, "rop");
		},
		isTip: function (){
			return this.dialogType && rias.contains(this.dialogType, "ip");
		},
		isTop: function (){
			return this.dialogType && !rias.contains(this.dialogType, "rop") && rias.contains(this.dialogType, "op");
		},
		isModal: function (){
			return this.dialogType && rias.contains(this.dialogType, "odal");
		},

		autoFocus: true,

		isBoxResizer: true,
		resizeBorderWidth: 8,
		resizable: "xy",
		movable: true,
		moveDelay: 0,
		closable: true,
		animate: true,

		minSize: {
			w: "15em",
			h: "6em"
		},

		//selectedOnShow: true,
		_needPosition: true,

		closeDelay: 0,
		defaultCloseDelay: 2000,
		closeWhenSubmit: true,
		closeWhenAbort: true,

		templateString:
			"<div class='dijitReset' role='dialog' data-dojo-attach-event='onmouseenter: _onMouseEnter, onmouseleave: _onMouseLeave'>"+
				"<div class='riaswTooltipConnector riaswHidden' data-dojo-attach-point='connectorNode'>" +
				"</div>" +
				"<div data-dojo-attach-point='captionNode,focusNode' class='riaswDialogCaptionNode' tabIndex='-1' role='button'>" +
					"<div data-dojo-attach-point='captionContainer,moveNode' class='riaswDialogMoveNode riaswMovable' data-dojo-attach-event='ondblclick:_toggleMax, onkeydown:_toggleKeydown' role='region'>"+
						/// float 元素需要提前显示
						"<span data-dojo-attach-point='badgeNode' class='${badgeClass}'></span>"+
						"<div data-dojo-attach-point='captionToolsNode' class='dijitInline riaswCaptionToolsNode riaswFloatRight' role='region'></div>"+
						"<span data-dojo-attach-point='iconNode' class='riaswButtonIcon riaswNoIcon'></span>"+
						"<span data-dojo-attach-point='labelNode' class='riaswButtonLabel riaswNoLabel'></span>"+
					"</div>"+
				"</div>" +
				"<div data-dojo-attach-point='containerNode' class='riaswDialogContent' role='region'></div>"+
				//"<div data-dojo-attach-point='actionBarNode' class='riaswDialogActionBar' role='region' id='${id}_actionBar'></div>"+
			"</div>",
		baseClass: "riaswDialog",
		cssStateNodes: {
			focusNode: "riaswDialogCaptionNode"
		},

		//splitter: false,

		tabCycle: true,

		//showCaption: true,
		contentType: "none",/// 0 = none, 1 = info, 2 = warn, 3 = error, -1 = about

		restrictPadding: rias.dom.defaultRestrict,

		isContainedOf: function(obj){
			/// ownerRiasw 即 _riasrPopupOwner
			if(!obj){
				return false;
			}
			var owner = this.getOwnerRiasw();
			while(owner){
				if(owner === obj || rias.dom.isDescendant(owner.domNode, obj.domNode)){
					return true;
				}
				owner = owner.getOwnerRiasw();
			}
			return false;
		},
		_getTabOrderChildren: function(){
			///增加
			///TODO:zensst. 按 tabIndex 和 childNodes 排序。
			var arr = this.getChildren();
			if(rias.isRiasw(this.actionBar)){
				if(this.actionBarPosition === "top" || this.actionBarPosition === "first"){
					arr.unshift(this.actionBar);
				}else{
					arr.push(this.actionBar);
				}
			}
			return arr;
		},
		_onKeyEsc: function(evt){
			if(this.closable && rias.isFunction(this.close)){
				this.defer(this.close);
				evt.stopPropagation();
				evt.preventDefault();
				return true;
			}
			return false;
		},
		postMixInProperties: function(){
			this.inherited(arguments);

			this.panelManager = panelManager;
			if(!rias.isNumber(this.zIndex)){
				this.zIndex = this.panelManager._currentZIndex;
				if(this.selected != false){
					this.zIndex--;
				}
			}
			if(!this.popupArgs){
				this.popupArgs = {};
			}
			/// this.around 是 aspect.around
			if(this.parent || this.popupPositions){
				if(this.parent){
					this.popupArgs.parent = this.parent;
					delete this.parent;
				}
				if(this.popupPositions){
					this.popupArgs.popupPositions = this.popupPositions;
					delete this.popupPositions;
				}
			}
			if(!this.popupArgs._riasrPopupOwner){
				this.popupArgs._riasrPopupOwner = this.getOwnerRiasw();
			}
			this._keyNavCodes[rias.keys.ESCAPE] = this._onKeyEsc;
		},
		buildRendering: function(){
			this.inherited(arguments);
			this._shownOpacity0 = this._shownOpacity;
			this._shownOpacity = this._hiddenOpacity;
			rias.dom.setStyle(this.domNode, {
				//visiblity: "hidden",
				//display: "none",
				//opacity: this._hiddenOpacity,
				position: "absolute"
			});
			var p = this.popupArgs._riasrPopupOwner;
			if(p){
				this.domNode._riasrPopupOwner = p;
				p = rias.ownerDialogBy(p);
				if(p){
					this._riasrPopupDialog = p;
					if(!p._riasrPopupElements){
						p._riasrPopupElements = [];
					}
					p._riasrPopupElements.push(this);
				}
			}
			delete this.popupArgs._riasrPopupOwner;

			this._actionBarParams = this.actionBar;
			delete this.actionBar;
		},
		postCreate: function(){
			var self = this;
			/*self.own(
				rias.on(self.domNode, rias.touch.over, function(evt){
					rias.dom.toggleClass(self.captionNode, "riaswDialogCaptionNodeHover", true);
				}),
				rias.on(self.domNode, rias.touch.out, function(evt){
					rias.dom.toggleClass(self.captionNode, "riaswDialogCaptionNodeHover", false);
				})
			);*/
			self.inherited(arguments);
			/// hidden 应放在 buildRendering 之后，以保证 初始化正确，比如 计算 _calCollapsedHeight
			rias.dom.visible(this.domNode, false);
			this.domNode.style.opacity = this._hiddenOpacity;
			this.displayState = "hidden";

			self.panelManager.addPanel(self);

			if(self.closeDelay === 1){
				self.on("mouseleave", function(){
					self.close();
				});
			}else if((self.isTip() && self.closeDelay >= 0) || self.closeDelay > 1){
				self.own(rias.after(self, "_onShow", function(){/// 注意要用 _onShow，避免 onShow 被 param 修改
					self.defer(function(){
						self.close();
					}, self.closeDelay > 1 ? self.closeDelay : self.defaultCloseDelay);
				}, true));
			}
		},
		_onDestroy: function(){
			if(this._aroundMoveListener){
				clearTimeout(this._aroundMoveListener);
				this._aroundMoveListener = undefined;
			}
			if(this._riasrPopupDialog){
				rias.removeItems(this._riasrPopupDialog._riasrPopupElements, this);
			}
			this._riasrPopupDialog = undefined;
			if(this._riasrPopupElements){
				rias.forEach(this._riasrPopupElements, function(child){
					rias.destroy(child);
				});
				this._riasrPopupElements = undefined;
			}
			if(this._popupStackItem){
				rias.removeItems(rias.popupManager._stack, this._popupStackItem);
				delete this._popupStackItem;
			}
			if(this._whenHideDeferred && !this._whenHideDeferred.isFulfilled()){
				this._whenHideDeferred.cancel();
			}
			this._whenHideDeferred = undefined;
			if(rias.isRiasw(this.actionBar)){
				rias.destroy(this.actionBar);
				this.actionBar = undefined;
			}
			if(this._onMoveStopHandle){
				this._onMoveStopHandle.remove();
				this._onMoveStopHandle = undefined;
			}
			if(this._moveHandle){
				rias.destroy(this._moveHandle);
				this._moveHandle = undefined;
			}
			if(this._riasrUnderlay){
				rias.destroy(this._riasrUnderlay);
				this._riasrUnderlay = undefined;
			}
			if(this.bgIframe){
				rias.destroy(this.bgIframe);
				this.bgIframe = undefined;
			}

			this.panelManager.removePanel(this);///要用到 domNode，故先于 inherited 执行。
			this.panelManager = undefined;

			this.inherited(arguments);
		},

		_onStartup: function(){
			var self = this;
			self.inherited(arguments);
			self.own(
				rias.on(self.moveNode, rias.touch.press, function(evt){
					////focus 会导致其他 popup 失去焦点，最好判断一下
					if(self._needFocus()){///_needFocus 包含 isFocusable
						self.focus();
					}
				})
			);
		},

		_loadPersist: function(args){
			this.inherited(arguments);

			var c = this.getPersist("state");
			if(c && c.s){
				this._needPosition = false;
			}
		},

		_onContainerChanged: function(container){
			this.inherited(arguments);
			if(this._riasrUnderlay){
				this._riasrUnderlay.placeAt(this, "before");
			}
		},
		_setZIndexAttr: function(value){
			if(rias.isNumber(value)){
				this.inherited(arguments);
				if(this._riasrUnderlay){
					this._riasrUnderlay.set("zIndex", value - 1);
				}
			}
		},
		_setDialogTypeAttr: function(value){
			if(this._popupStackItem){
				rias.removeItems(rias.popupManager._stack, this._popupStackItem);
				delete this._popupStackItem;
			}
			if(this._riasrUnderlay){
				rias.destroy(this._riasrUnderlay);
			}
			var s = rias.upperCaseFirst(this.dialogType);
			this._set("dialogType", value);
			rias.dom.removeClass(this.domNode, this._baseClass0 + "Type" + s);
			rias.dom.removeClass(this.captionNode, this._baseClass0 + "CaptionType" + s);
			rias.dom.removeClass(this.containerNode, this._baseClass0 + "ContentType" + s);
			s = rias.upperCaseFirst(value);
			rias.dom.addClass(this.domNode, this._baseClass0 + "Type" + s);
			rias.dom.addClass(this.captionNode, this._baseClass0 + "CaptionType" + s);
			rias.dom.addClass(this.containerNode, this._baseClass0 + "ContentType" + s);
			if(!this.popupArgs.around || this.hiddenConnector || !this.isDropDown() && !this.isTip()){
				rias.dom.addClass(this.connectorNode, "riaswHidden");
				this._tip_arrow_size = 0;
			}else{
				rias.dom.removeClass(this.connectorNode, "riaswHidden");
				this._tip_arrow_size = _tip_arrow_size;
			}
			if(this.isDropDown()){
				this._popupStackItem = {
					widget: this,
					handlers: []
				};
				if(this.isShowing()){
					rias.popupManager._stack.push(this._popupStackItem);
				}
			}
			if(this.isModal()){
				this._riasrUnderlay = new Underlay({
					ownerRiasw: this,
					targetWidget: this
				});
				if(this.isShowing()){
					this._riasrUnderlay.show();
				}
			}
			///不能改变当前显示，否则可能造成 restore 循环。如有需要，则手动刷新。
			//this.panelManager.selectPanel();
		},
		_setContentTypeAttr: function(value){
			value = contentTypeStr(value);
			if(value === "message"){
				value = contentTypeInfo;
			}
			var s = rias.upperCaseFirst(contentTypeStr(this.contentType));
			this._set("contentType", value);
			rias.dom.removeClass(this.domNode, this._baseClass0 + "Type" + s);
			rias.dom.removeClass(this.captionNode, this._baseClass0 + "CaptionType" + s);
			rias.dom.removeClass(this.containerNode, this._baseClass0 + "ContentType" + s);
			s = rias.upperCaseFirst(this.contentType);
			rias.dom.addClass(this.domNode, this._baseClass0 + "Type" + s);
			rias.dom.addClass(this.captionNode, this._baseClass0 + "CaptionType" + s);
			rias.dom.addClass(this.containerNode, this._baseClass0 + "ContentType" + s);
			switch(this.contentType){
				case contentTypeInfo:
					return this.set("iconClass", "infoIcon");
				case contentTypeAbout:
					return this.set("iconClass", "aboutIcon");
				case contentTypeWarn:
					return this.set("iconClass", "warnIcon");
				case contentTypeError:
					return this.set("iconClass", "errorIcon");
				case contentTypeChoose:
					this.checkResultWhenHide = true;
					return this.set("iconClass", "chooseIcon");
				default:
					return;// this.set("iconClass", "");
			}
		},

		_setMovableAttr: function(value){
			var self = this;
			value = !!value;
			if(value && (self.isDropDown())){
				console.warn("Cannot set movable when isDropDown.");
				value = false;
			}
			this._set("movable", value);
			rias.dom.toggleClass(self.moveNode, "riaswMovable", value);
			if(self.movable && !self.region){
				if(!self._moveHandle){
					if(rias.has("ie") === 6){
						self._moveHandle = rias.safeMixin(new TimedMoveable(self.domNode, {
							//ownerRiasw: self,
							delay: self.moveDelay,
							handle: self.moveNode// || self.focusNode
						}), {
							onMoving: function(mover, leftTop){
								///约束方法可以参考 dojo/dnd/move
								var p = self.domNode.parentNode,
									restrictPadding = (self.restrictPadding >= 0 ? self.restrictPadding : 0),
									mb = rias.dom.getMarginBox(self.domNode);
								if(p){
									p = rias.dom.getContentBox(p);
									///top、left 始终不能为负
									if(leftTop.t < p.st + restrictPadding){
										leftTop.t = p.st + restrictPadding;
									}
									if(leftTop.l < p.sl + restrictPadding){
										leftTop.l = p.sl + restrictPadding;
									}
									///height、width 则只有在有 restrictPadding 时才约束
									if(restrictPadding >= 0){
										if(leftTop.t > p.h + p.st - restrictPadding - restrictPadding - mb.h){
											leftTop.t = p.h + p.st - restrictPadding - restrictPadding - mb.h;
										}
										if(leftTop.l > p.w + p.sl - restrictPadding - restrictPadding - mb.w){
											leftTop.l = p.w + p.sl - restrictPadding - restrictPadding - mb.w;
										}
									}
								}
							}
						});
					}else{
						self._moveHandle = new move.constrainedMoveable(self.domNode, {
							//ownerRiasw: self,
							///约束方法可以参考 dojo/dnd/move
							within: self.restrictPadding >= 0,
							constraints: function(){
								var n = this.node.parentNode,
									s = rias.dom.getComputedStyle(n),
									p = rias.dom.getContentBox(n, s),
									restrictPadding = (self.restrictPadding >= 0 ? self.restrictPadding : 0);
								///top、left 始终不能为负
								return {
									t: restrictPadding + p.t,
									l: restrictPadding + p.l,
									w: p.w - restrictPadding - restrictPadding,
									h: p.h - restrictPadding - restrictPadding
								};
							},
							delay: self.moveDelay,
							handle: self.moveNode// || self.focusNode
						});
					}
					self._onMoveStopHandle = rias.after(self._moveHandle, "onMoveStop", function(){
						if(self.isShowNormal()){
							self._save_style0();
						}else if(self.isCollapsed()){
							self._style0.top = self.domNode.style.top;
							self._style0.left = self.domNode.style.left;
						}
						self._containerLayout();
					});
				}
			}else{
				if(self._onMoveStopHandle){
					self._onMoveStopHandle.remove();
					self._onMoveStopHandle = undefined;
				}
				if(self._moveHandle){
					rias.destroy(self._moveHandle);
					self._moveHandle = undefined;
				}
			}
			//if(self._started){
			//}
		},
		_setRegionAttr: function(value){
			this.inherited(arguments);
			this.set("movable", this.get("movable"));
		},

		select: function(value){
			value = !!value;
			if(value){
				this.panelManager.selectPanel(this);
			}else{
				this.panelManager.unselectPanel(this);
			}
			this.inherited(arguments);
		},

		_getCornerOrient: function(/*DomNode*/ node, /*String*/ aroundCorner, /*String*/ tooltipCorner){
			// summary:
			//		Configure widget to be displayed in given position relative to the button.
			// tags:
			//		protected

			// Note: intentionally not using riaswTooltip class since that sets position:absolute, which
			// confuses riasw.dom.popup trying to get the size of the tooltip.
			var newC = rias.dom.orientCorner[aroundCorner + "-" + tooltipCorner];

			rias.dom.removeClass(this.domNode, this._currentOrientClass || "");
			if(this.isDropDown() || this.isTip()){
				rias.dom.addClass(this.domNode, newC);
			}
			this._currentOrientClass = newC;

			// Tooltip._getCornerOrient() has code to reposition connector for when Tooltip is before/after anchor.
			// Not putting here to avoid code bloat, and since TooltipDialogs are generally above/below.
			// Should combine code from Tooltip and TooltipDialog.
		},
		_setCornerOrient: function(/*Object*/ pos){
			// summary:
			//		Called when dialog is displayed.
			// tags:
			//		protected

			//this._getCornerOrient(this.domNode, pos.aroundCorner, pos.corner);

			// Position the tooltip connector for middle alignment.
			// This could not have been done in _getCornerOrient() since the tooltip wasn't positioned at that time.
			var aroundNodeCoords = pos.aroundNodePos;
			var d;
			if(pos.corner.charAt(0) === 'M' && pos.aroundCorner.charAt(0) === 'M'){
				d = aroundNodeCoords.y + ((aroundNodeCoords.h - this.connectorNode.offsetHeight) >> 1) - pos.y;
				this.connectorNode.style.top = d + "px";
				this.connectorNode.style.left = "";
			}else if(pos.corner.charAt(1) === 'M' && pos.aroundCorner.charAt(1) === 'M'){
				d = aroundNodeCoords.x + ((aroundNodeCoords.w - this.connectorNode.offsetWidth) >> 1) - pos.x;
				this.connectorNode.style.top = "";
				this.connectorNode.style.left = d + "px";
			}
		},
		_restorePos: function(){
			if(this._style0){
				if(this._style0.top){
					this.domNode.style.top = this._style0.top;
				}
				if(this._style0.left){
					this.domNode.style.left = this._style0.left;
				}
				if(this._changeSize){
					delete this._changeSize.t;
					delete this._changeSize.l;
				}
			}
		},
		_reposition: function(){
			if(this.popupArgs && this.popupArgs.around && this.popupArgs.lockPosition && this._listenAroundMove && (this.isShowNormal() || this.isCollapsed())){
				var oldPos = this._aroundPosition,
					newPos = rias.dom.getPosition(this.popupArgs.around, true),
					dx = newPos.x - oldPos.x,
					dy = newPos.y - oldPos.y;

				if(dx || dy){
					this._aroundPosition = newPos;
					rias.dom.placeAndPosition(this.domNode, this, this.popupArgs);
				}

				this._aroundMoveListener = setTimeout(rias.hitch(this, "_reposition"), dx || dy ? 30 : 150);
			}
		},
		beforePlaceAndPosition: function(){
		},
		afterPlaceAndPosition: function(pos){
		},
		_listenAroundMove: false,///有性能代价，不建议开启。
		_placeAndPosition: function(){
			this.beforePlaceAndPosition();
			if(!(this.popupArgs.padding >= 0)){
				this.popupArgs.padding = this._tip_arrow_size;
			}
			this._initPos = rias.dom.placeAndPosition(this.domNode, this, this.popupArgs);
			//if(!this.popupArgs || !this.popupArgs.around){
			//	this._restorePos();
			//}
			//this._needPosition = !this.contentLoaded;
			if(this.popupArgs && this.popupArgs.lockPosition && this._listenAroundMove){
				this._aroundPosition = rias.dom.getPosition(this.popupArgs.around, true);
				this._aroundMoveListener = setTimeout(rias.hitch(this, "_reposition"), 150);
			}
			this.afterPlaceAndPosition(this._initPos);
		},
		_afterResize: function(box){
			this.inherited(arguments);
			if(this.popupArgs.lockPosition && this.contentLoaded && this.isShowing()){
				this._placeAndPosition();
			}
		},

		_checkCanHide: function(){
			///this.canHide() 有可能是 promise，返回 this.canHide()
			var self = this,
				d = self._whenHideDeferred,
				a = [],
				args = arguments;
			if(this._riasrPopupElements){
				rias.forEach(this._riasrPopupElements, function(child){
					a.push(child._checkCanHide());///TODO:zensst.是否需要 _checkCanHide.apply(child, args)
				});
			}
			return rias.all(a, rias.debugDeferredTimeout ? rias.defaultDeferredTimeout >> 1 : 0, function(arr){
				this.cancel();
			}).then(function(results){
				var i = 0,
					l = results.length;
				for(; i < l; i++){
					if(results[i] == false){
						return false;
					}
				}
				return true;
			}, function(e){
				console.debug(e);
				return false;
			}).then(function(result){
				if(result != false){
					return rias.when(self.inherited(args)).always(function(result){
						if(result != false){
							if(d){
								d.resolve(self.get("formResult"));
							}
						}
						return result;
					});
				}
				return false;
			});
		},
		_onShow: function(){
			if(this._popupStackItem){
				rias.popupManager._stack.push(this._popupStackItem);
			}
			return this.inherited(arguments);
		},
		_hide: function(newState){
			this.inherited(arguments);

			this.panelManager.hidePanel(this);

			if(rias.dom.focusedStack.indexOf(this.id) >= 0){
				var w = this.domNode._riasrPopupOwner;
				if(w && w.focus){
					w.focus();
				}
			}
			if(this._riasrUnderlay){
				this._riasrUnderlay.hide();
			}
			if(this._popupStackItem){
				rias.removeItems(rias.popupManager._stack, this._popupStackItem);
			}
			if(this._whenHideDeferred && !this._whenHideDeferred.isFulfilled()){
				this._whenHideDeferred.cancel();
			}
			this._whenHideDeferred = undefined;
		},
		whenHide: function(callback){
			var self = this,
				d = self._whenHideDeferred;
			if(!d){
				d = self._whenHideDeferred = rias.newDeferred(function(){
					self._whenHideDeferred = undefined;
				});
			}
			if(!self.isDestroyed(true)){
				///还是闪避 初始 hidden 的情况好些
				//if(!self.isShowing()){
				//	d.resolve();
				//}
				return d.promise.always(function(){
					if(rias.isFunction(callback)){
						return callback.apply(self, [self.get("formResult")]);
					}
					return self.get("formResult");
				});
			}
			d.cancel(this.id + " is destroyed.");
			return d.promise;
		},
		_updateSelectPanelDelay: 10,/// 不宜过大，以免滞后导致混乱。
		_updateSelectPanel: function(){
			var self = this;
			///有些时候，show 之前已经 focus，导致 onFocus 时不能 selected
			self.whenLoadedAll(function(){
				self._whenDisplayed(function(){
					if(self.isShowing() && (self.selected || (self.autoFocus && !self.isTip() && !(self.closeDelay > 1)))){
						//console.debug("selectedOnShow - " + self.id);
						/// defer 会造成多重弹出 Dialog 时循环。
						self.focus();
						//self.defer(self.focus);
					}else{
						this.panelManager.selectPanel();
					}
				});
			});
		},
		_show: function(){
			var self = this;
			///需要先 _placeAndPosition，处理 container
			if(self._needPosition || self.popupArgs && self.popupArgs.lockPosition){
				self._placeAndPosition();
			}
			if(self._riasrUnderlay){
				self._riasrUnderlay.show();
			}
			return rias.when(self.inherited(arguments), function(result){
				//if(self._riaswIdInModule === "ie10"){
				//	console("ie10");
				//}
				self._updateSelectPanel();
				return result;
			});
		},
		_restore: function(){
			var r = this.inherited(arguments);
			if(this._moveHandle){
				this._moveHandle.skip = false;
				rias.dom.toggleClass(this.moveNode, "riaswMovable", true);
			}
			this._updateSelectPanel();
			return r;
		},
		_showMax: function(){
			var r = this.inherited(arguments);
			if(this._moveHandle){
				this._moveHandle.skip = true;
				rias.dom.toggleClass(this.moveNode, "riaswMovable", false);
			}
			return r;
		},
		addActionButton: function(item, index){
			///需要在 loaded 之后，才能正确判断是否存在 各个 btns
			if(!this._loadAllDeferred.isFulfilled()){
				console.error(this.id + ".addActionButton must be called afterLoadedAll.");
				return;
			}
			var p = Widget._internalToolParams,
				ps;
			if(this.actionBar){
				/// ps 需要用 mixinDeep 副本，避免修改 _internalToolParams
				if(rias.isString(item)){
					///已经存在，则忽略，不创建，不改变 parent。
					if(!this[item]){
						ps = item === "btnSubmit" ? p.btnSubmit :
							item === "btnAbort" ? p.btnAbort :
								item === "btnSave" ? p.btnSave :
									item === "btnYes" ? p.btnYes :
										item === "btnNo" ? p.btnNo :
											item === "btnCancel" ? p.btnCancel :
												item === "btnClose" ? p.btnClose :
													item === "|" ? {
														_riaswType: "riasw.sys.ToolbarSeparator"
													} : undefined;
						if(ps){
							ps = rias.mixinDeep({}, ps);
						}
					}
				}else if(rias.isObjectSimple(item)){///允许简化的 riaswParams
					if(!item.btnName || !this[item.btnName]){
						/// 忽略已经存在的
						ps = item.toolName === "btnSubmit" ? p.btnSubmit :
							item.toolName === "btnAbort" ? p.btnAbort :
								item.toolName === "btnSave" ? p.btnSave :
									item.toolName === "btnYes" ? p.btnYes :
										item.toolName === "btnNo" ? p.btnNo :
											item.toolName === "btnCancel" ? p.btnCancel :
												item.toolName === "btnClose" ? p.btnClose :
												{
													formResult: rias.formResult.frNone,
													iconClass: "logoRiaEasyIcon",
													showLabel: false
												};
						ps = rias.mixinDeep({}, ps, item);
					}else{
						this[item.btnName].placeAt(this.actionBar, index);
					}
				}else if(rias.isRiasw(item)){
					item.placeAt(this.actionBar, index);
				}
				if(ps){
					/// ps 已经是副本，可以直接 mixin
					ps = rias.mixin({
						_riaswType: "riasw.form.Button",
						ownerRiasw: this,
						formResult: rias.formResult.frNone
					}, ps);
					///ps 是 riawParams，故不能用 getOwnerRiasw()
					var self = this,
						d = rias.parseRiasws(ps, ps.ownerRiasw, this.actionBar, index).then(function(result){
						if(result && result.widgets){
							ps = result.widgets[0];
							if(ps.btnName){
								self[ps.btnName] = ps;
							}
						}
						return result;
					});
					this._renderDeferreds.push(d);
					return d;
				}
			}
		},
		_afterLoadedAll: function(loadOk){
			var self = this,
				//i, l,
				args = arguments;
			if(rias.isArray(this._actionBarParams) && this._actionBarParams.length > 0){
				rias.newRiasw(Panel, {
					ownerRiasw: this,
					_riaswIdInModule: "actionBar",
					"class": "dijitReset",
					panel: this
				});///注意，模板中的 actionBarNode 被 actionBar.domNode 替代
				//this.actionBarNode = this.actionBar.domNode;///重新设置正确的 this.actionBarNode
				if(this.actionBarPosition === "top" || this.actionBarPosition === "first"){
					this.actionBar.placeAt(this.containerNode, "before");
					rias.dom.addClass(this.actionBar.domNode, "riaswDialogActionBarTop");
				}else{
					this.actionBar.placeAt(this.containerNode, "after");
					rias.dom.addClass(this.actionBar.domNode, "riaswDialogActionBar");
				}
				///_setContainerRiasw(this) 调用了 _onContainerChanged，无需显式调用 _containerLayout
				///this.actionBar._setContainerRiasw(this);///没必要挂钩
				return rias.allInOrder(this._actionBarParams, rias.debugDeferredTimeout ? rias.defaultDeferredTimeout >> 2 : 0, function(arr){
					this.cancel();
				}, function(item, i){
					return self.addActionButton(item, i);
				}).then(function(results){
					return rias.all(this._renderDeferreds).always(function(arr){
						var cs = self.actionBar.getChildren();
						self.actionBar.set("visible", cs.length > 0);
						if(!self.initFocusedChild && cs.length > 0){
							self.initFocusedChild = cs[0];
						}
						/*if(self.btnAbort && self.btnSubmit){
							if(self.btnSubmit.label === rias.i18n.action.ok){
								self.btnSubmit.set("label", rias.i18n.action.yes);
								self.btnSubmit.set("tooltip", rias.i18n.action.yes);
							}
						}*/
						return self.inherited(args);
					});
				});
			}
			return this.inherited(arguments);
		},
		_afterLoadedAllAndShown: function(loadOk){
			var self = this;
			var result = self.inherited(arguments);
			///因为可能在 afterLoadedAllAndShown 中会有初始化处理，这里 reset modified，。
			self.set("modified", false);
			if(self._needPosition || self.popupArgs && self.popupArgs.lockPosition){
				self._placeAndPosition();
			}
			return result;
		}

	});

	function eventSubmit(evt){
		this.getOwnerRiasw().submit(evt);
	}
	function eventAbort(evt){
		this.getOwnerRiasw().formResult = this.formResult == undefined ? rias.formResult.frAbort : this.formResult;
		this.getOwnerRiasw().abort(evt);
	}
	function eventNormal(){
		this.getOwnerRiasw().formResult = this.formResult == undefined ? rias.formResult.frNone : this.formResult;
		this.getOwnerRiasw().close();
	}
	Widget._internalToolParams = {
		btnSubmit: {
			_riaswAttachPoint: "btnSubmit",
			"class": "riaswButtonOk",
			btnName: "btnSubmit",
			label: rias.i18n.action.ok,
			tooltip: rias.i18n.action.ok,
			iconClass: "okIcon",
			formResult: rias.formResult.frSubmit,
			onClick: eventSubmit
		},
		btnAbort: {
			_riaswAttachPoint: "btnAbort",
			"class": "riaswButtonPrimary",
			btnName: "btnAbort",
			label: rias.i18n.action.abort,
			tooltip: rias.i18n.action.abort,
			iconClass: "abortIcon",
			formResult: rias.formResult.frAbort,
			onClick: eventAbort
		},
		btnSave: {
			_riaswAttachPoint: "btnSave",
			"class": "riaswButtonInfo",
			btnName: "btnSave",
			label: rias.i18n.action.save,
			tooltip: rias.i18n.action.save,
			iconClass: "saveIcon",
			formResult: rias.formResult.frSubmit,
			onClick: eventSubmit
		},
		btnYes: {
			_riaswAttachPoint: "btnYes",
			"class": "riaswButtonOk",
			btnName: "btnYes",
			label: rias.i18n.action.yes,
			tooltip: rias.i18n.action.yes,
			iconClass: "okIcon",
			formResult: rias.formResult.frSubmit,
			onClick: eventSubmit
		},
		btnNo: {
			_riaswAttachPoint: "btnNo",
			"class": "riaswButtonPrimary",
			btnName: "btnNo",
			label: rias.i18n.action.no,
			tooltip: rias.i18n.action.no,
			iconClass: "noIcon",
			formResult: rias.formResult.frNo,
			onClick: eventAbort
		},
		btnCancel: {
			_riaswAttachPoint: "btnCancel",
			"class": "riaswButtonPrimary",
			btnName: "btnCancel",
			label: rias.i18n.action.cancel,
			tooltip: rias.i18n.action.cancel,
			iconClass: "cancelIcon",
			formResult: rias.formResult.frCancel,
			onClick: eventNormal
		},
		btnClose: {
			_riaswAttachPoint: "btnClose",
			"class": "riaswButtonPrimary",
			btnName: "btnClose",
			label: rias.i18n.action.close,
			tooltip: rias.i18n.action.close,
			iconClass: "closeIcon",
			formResult: rias.formResult.frNone,
			onClick: eventNormal
		}
	};

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//allowedChild: "",
		"property": {
			"href": {
				"datatype": "string",
				"format": "url",
				"title": "URL"
			},
			"extractContent": {
				"datatype": "boolean",
				"title": "Extract Content"
			},
			"preventCache": {
				"datatype": "boolean",
				"title": "Prevent Cache"
			},
			"preload": {
				"datatype": "boolean",
				"title": "Preload"
			},
			"refreshOnShow": {
				"datatype": "boolean",
				"title": "Refresh On Show"
			},
			"doLayout": {
				"datatype": "string",
				"defaultValue": "auto",
				"hidden": true
			},
			"closable": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Closable"
			},
			"resizable": {
				"datatype": "string",
				"option": [
					{
						"value": "none"
					},
					{
						"value": "x"
					},
					{
						"value": "y"
					},
					{
						"value": "xy"
					}
				],
				"defaultValue": "xy",
				"title": "Resizable"
			},
			"minable": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Minimizable"
			},
			"maxable": {
				"datatype": "boolean",
				"defaultValue": false,
				"title": "Maximizable"
			},
			"adjustPaths": {
				"datatype": "boolean",
				"description": "Adjust relative paths in html string content to point to this page.\nOnly useful if you grab content from a another folder then the current one",
				"hidden": false
			},
			"cleanContent": {
				"datatype": "boolean",
				"description": "cleans content to make it less likely to generate DOM/JS errors.",
				"hidden": false
			},
			"renderStyles": {
				"datatype": "boolean",
				"description": "trigger/load styles in the content",
				"hidden": false
			},
			"executeScripts": {
				"datatype": "boolean",
				"description": "Execute (eval) scripts that is found in the content",
				"hidden": false
			},
			"content": {
				"datatype": "string",
				//"description": "The innerHTML of the ContentPane.\nNote that the initialization parameter / argument to attr(\"content\", ...)\ncan be a String, DomNode, Nodelist, or _Widget.",
				"hidden": false
			}
		}
	};

	return Widget;

});