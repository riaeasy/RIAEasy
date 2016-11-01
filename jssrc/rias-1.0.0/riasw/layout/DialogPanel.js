//RIAStudio ClientWidget - DialogPanel.

define([
	"rias",
	"dojo/dnd/Moveable",
	"dojo/dnd/TimedMoveable",
	"rias/riasw/layout/Underlay",
	"rias/riasw/layout/Panel",
	"rias/riasw/form/Button",
	"rias/riasw/layout/CaptionPanel"
], function(rias, Moveable, TimedMoveable, Underlay, Panel, Button, CaptionPanel){

	///由于 css 加载的延迟，造成如果 domNode 的 css 有 padding、margin、border，可能显示不正确，最好移到 _PabelBase 中加载。
	//rias.theme.loadThemeCss([
	//	"riasw/layout/CaptionPanel.css"
	//]);

	var contentTypeInfo = "info",
		contentTypeWarn = "warn",
		contentTypeError = "error",
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

	var riaswType = "rias.riasw.layout.DialogPanel";
	var Widget = rias.declare(riaswType, [CaptionPanel], {

		closeResult: rias.closeResult.crCancel,

		_captionHeight0: 33,

		_size: undefined,
		_state: -1,

		///dialogType: 0 = win, 1 = modal, 2 = top, 3 = tip.
		isTip: function (){
			return this.dialogType && (this.dialogType == 3 || rias.contains(this.dialogType, "ip"));
		},
		isTop: function (){
			return this.dialogType && (this.dialogType == 2 || rias.contains(this.dialogType, "op"));
		},
		isModal: function (){
			return this.dialogType && (this.dialogType == 1 || rias.contains(this.dialogType, "odal"));
		},

		isBoxResizer: true,
		resizeBorderWidth: 8,
		resizable: "xy",
		movable: true,
		moveDelay: 0,
		closable: true,
		animate: true,

		minSize: {
			w: 180,
			h: 80
		},

		selectOnShow: true,
		//_focusStack: true,

		closeOnSubmit: true,
		closeDelay: 0,

		templateString:
			"<div class='dijit dijitReset dijitPopup' role='dialog' data-dojo-attach-event='onmouseenter: _onEnter, onmouseleave: _onLeave'>"+
				"<div data-dojo-attach-point='captionNode,focusNode' class='riaswDialogPanelCaptionNode' tabIndex='-1' role='button'>" +
					"<div data-dojo-attach-point='moveNode' class='riaswDialogPanelMoveNode' role='region' data-dojo-attach-event='ondblclick:_toggleMax, onkeydown:_toggleKeydown'>"+
						'<span data-dojo-attach-point="badgeNode" class="dijitInline ${badgeClass}"></span>'+
						"<span data-dojo-attach-point='toggleNode' class='dijitInline riaswCaptionPanelIconNode riaswCaptionPanelToggleIconNode riaswCaptionPanelToggleIcon' role='presentation'></span>"+
						'<span data-dojo-attach-point="iconNode" class="dijitInline riaswCaptionPanelIconNode16 dijitIcon"></span>'+
						"<span data-dojo-attach-point='labelNode' class='dijitInline riaswCaptionPanelLabelNode'></span>"+
						"<span data-dojo-attach-point='closeNode' class='dijitInline dijitHidden riaswCaptionPanelIconNode riaswCaptionPanelCloseIcon riaswFloatRight'></span>"+
						"<span data-dojo-attach-point='maxNode' class='dijitInline dijitHidden riaswCaptionPanelIconNode riaswCaptionPanelMaximizeIcon riaswFloatRight'></span>"+
					"</div>"+
				"</div>"+
				"<div data-dojo-attach-point='containerNode' class='riaswDialogPanelContent' role='region'></div>"+
					//"<div data-dojo-attach-point='actionBarNode' class='riaswDialogPanelActionBar' role='region' id='${id}_actionBar'></div>"+
			"</div>",
		baseClass: "riaswDialogPanel",
		cssStateNodes: {
			focusNode: "riaswDialogPanelCaptionNode",
			closeNode: "riaswCaptionPanelIconNode",
			maxNode: "riaswCaptionPanelIconNode",
			toggleNode: "riaswCaptionPanelIconNode",
			labelNode: "riaswCaptionPanelLabelNode",
			containerNode: "riaswDialogPanelContent"
		},

		//splitter: false,

		_tabCycle: true,

		showCaption: true,
		contentType: "none",/// 0 = none, 1 = info, 2 = warn, 3 = error, -1 = about

		restrictPadding: rias.dom.defaultRestrict,

		postMixInProperties: function(){
			if(!rias.isNumber(this.zIndex)){
				if(this.isModal()){
					this.zIndex = this.panelManager._currentZModal;
				}else if(this.isTip()){
					this.zIndex = this.panelManager._startZ + this.panelManager._allPanel.length + 100;
				}else if(this.isTop()){
					this.zIndex = this.panelManager._currentZTop;
				}else{
					this.zIndex = this.panelManager._currentZNormal;
				}
				if(this.selectOnShow){
					this.zIndex = this.zIndex + 2;
				}
			}
			this.inherited(arguments);
		},
		buildRendering: function(){
			this.inherited(arguments);
			rias.dom.setStyle(this.domNode, {
				//visiblity: "hidden",
				//display: "none",
				opacity: 0,
				position: "absolute"
			});
			var p = rias.by((this.initPlaceToArgs && this.initPlaceToArgs.popupParent ? this.initPlaceToArgs.popupParent : this.popupParent) || this.getOwnerRiasw());
			if(p){
				//rias.dom.setAttr(this.domNode, "_riasrPopupParent", p.id);
				this.domNode._riasrPopupParent = p.id;
			}
		},
		postCreate: function(){
			var self = this;
			/*self.own(
				rias.on(self.domNode, rias.touch.over, function(evt){
					rias.dom.toggleClass(self.captionNode, "riaswDialogPanelCaptionNodeHover", true);
				}),
				rias.on(self.domNode, rias.touch.out, function(evt){
					rias.dom.toggleClass(self.captionNode, "riaswDialogPanelCaptionNodeHover", false);
				})
			);*/
			self.inherited(arguments);
			this._initAttr(["dialogType", "movable",
				//"zIndex", "selected",
				"contentType"]);

			if(self.closeDelay == 1){
				self.on("mouseleave", function(){
					self.close();
				});
			}else if(self.closeDelay > 1){
				self.selectOnShow = false;
				self.own(rias.after(self, "onShow", function(){
					self.defer(function(){
						self.close();
					}, self.closeDelay);
				}, true));
			}
		},
		startup: function(){
			var self = this;
			if(self._started){
				return;
			}
			self.inherited(arguments);
			self.own(
				rias.on(self.moveNode, "mousedown", function(evt){
					////focus 会导致其他 popup 失去焦点，最好判断一下
					if(!self.get("focused")){
						self.focus();
					}
				})
			);
		},
		destroy: function(){
			if(this._whenCloseDeferred && !this._whenCloseDeferred.isFulfilled()){
				this._whenCloseDeferred.cancel();
			}
			this._whenCloseDeferred = undefined;
			if(this._actionBar){
				rias.destroy(this._actionBar);
				this._actionBar = undefined;
			}
			if(this._onMouseOverHandle){
				this._onMouseOverHandle.remove();
				this._onMouseOverHandle = undefined;
			}
			if(this._doRestrictSizeHandle){
				this._doRestrictSizeHandle.remove();
				this._doRestrictSizeHandle = undefined;
			}
			if(this._moveHandle){
				rias.destroy(this._moveHandle);///没有 destroyRecursive();
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
			this.inherited(arguments);
		},

		/*_setStateClass: function(){
			try{
				this.inherited(arguments);
				rias.dom.toggleClass(this.captionNode, "riaswDialogPanelCaptionNodeHover", !!this.hovering);
				rias.dom.toggleClass(this.captionNode, "riaswDialogPanelCaptionNodeActive", !!this.active);
				rias.dom.toggleClass(this.captionNode, "riaswDialogPanelCaptionNodeFocused", !!this.focused);
				rias.dom.toggleClass(this.captionNode, "riaswDialogPanelCaptionNodeSelected", !!this.selected);
			}catch(e){
			}
		},*/

		_initSize: function(){
			var self = this,
				args = arguments;
			if(self._actionBar){
				self._actionBar.destroyRecursive();
				self._actionBar = undefined;
			}
			if(self.actionBar && self.actionBar.length){
				var i, l, p, w,
				//wOk = self.btnOk,
				//wCancel = self.btnCancel,
					ps = [];
				for(i = 0, l = self.actionBar.length; i < l; i++){
					p = self.actionBar[i];
					if(rias.isString(p)){
						w = self[p];
						if(!w){
							w = {
								_riaswType: "rias.riasw.form.Button",
								_riaswIdOfModule: p,
								label: p,
								tooltip: p,
								closeResult: rias.closeResult.crCancel,
								onClick: function(evt){
									self.cancel(evt);
								}
							};
							if(p === "btnOk"){
								w.label = w.tooltip = rias.i18n.action.ok;
								w.iconClass = "okIcon";
								w.closeResult = rias.closeResult.crSubmit;
								w.onClick =  function(evt){
									self.submit(evt);
								};
							}else if(p === "btnCancel"){
								w.label = w.tooltip = rias.i18n.action.cancel;
								w.iconClass = "cancelIcon";
								w.onClick =  function(evt){
									self.cancel(evt);
								};
							}else if(p === "btnYes"){
								w.label = w.tooltip = rias.i18n.action.yes;
								w.iconClass = "okIcon";
								w.closeResult = rias.closeResult.crYes;
								w.onClick =  function(evt){
									self.submit(evt);
								};
							}else if(p === "btnSave"){
								w.label = w.tooltip = rias.i18n.action.save;
								w.iconClass = "saveIcon";
								w.closeResult = rias.closeResult.crSubmit;
								w.onClick =  function(evt){
									self.submit(evt);
								};
							}else if(p === "btnNo"){
								w.label = w.tooltip = rias.i18n.action.no;
								w.iconClass = "cancelIcon";
								w.closeResult = rias.closeResult.crNo;
								w.onClick =  function(evt){
									self.cancel(evt);
								};
							}else if(p === "btnClose"){
								w.label = w.tooltip = rias.i18n.action.close;
								w.iconClass = "closeIcon";
								w.onClick =  function(evt){
									self.cancel(evt);
								};
							}
						}
					}else if(rias.isObjectSimple(p)){
						w = rias.mixinDeep({}, {
							_riaswType: "rias.riasw.form.Button",
							//_riaswIdOfModule: "btnCancel",
							label: rias.i18n.action.cancel,
							//tooltip: rias.i18n.action.cancel,
							//iconClass: "cancelIcon",
							closeResult: rias.closeResult.crCancel,
							onClick: function(evt){
								self.cancel(evt);
							}
						}, p);
					}else{
						w = rias.by(p);
					}
					if(w){
						ps.push(w);
					}
				}
				if(ps.length > 0){
					self.own(self._actionBar = rias.createRiasw(Panel, {
						ownerRiasw: self,
						_riasrModule: self,///self 有可能本身不是 RiasrModule，会导致 _actionBar 的 RiasrModule 不明确，需要显式指定为 self
						//_riaswIdOfModule: "_actionBar",
						"class": "dijitReset"
					}));///注意，模板中的 actionBarNode 被 _actionBar.domNode 替代
					//self.actionBarNode = self._actionBar.domNode;///重新设置正确的 this.actionBarNode
					if(self.actionBarPosition === "top" || self.actionBarPosition === "first"){
						self._actionBar.placeAt(self.containerNode, "before");
						rias.dom.addClass(self._actionBar.domNode, "riaswDialogPanelActionBarTop");
					}else{
						self._actionBar.placeAt(self.containerNode, "after");
						rias.dom.addClass(self._actionBar.domNode, "riaswDialogPanelActionBar");
					}
					if(!self.activeWidget){
						self.set("activeWidget", ps[ps.length - 1]._riaswIdOfModule || ps[ps.length - 1].id);
					}
					rias.bind(ps, self._actionBar).then(function(){
						self.inherited(args);
					});
				}else{
					self.inherited(args);
				}
			}else{
				self.inherited(args);
			}
			this._initPos = rias.dom.placeAt(this, this.initPlaceToArgs);
			this._needPosition = !this._initPos || !rias.dom.visible(self);/// self 不可见时，placeAt 定位不正确。;
		},

		_on_riasrParentNode: function(value){
			if(!this._canResize()){
				return;
			}
			this.inherited(arguments);
			if(this._riasrUnderlay){
				this._riasrUnderlay.show();
			}
		},
		_onZIndex: function(value, oldValue){
			if(rias.isNumber(value)){
				rias.dom.setStyle(this.domNode, "zIndex", value);
				if(this._riasrUnderlay){
					this._riasrUnderlay.set("zIndex", value - 1);
				}
			}
		},
		_onDialogType: function(value, oldValue){
			if(this._riasrUnderlay){
				rias.destroy(this._riasrUnderlay);
			}
			if(this.isModal()){
				this._riasrUnderlay = new Underlay({
					ownerRiasw: this,
					dialog: this
				});
				if(this.isShown(true)){
					this._riasrUnderlay.show();
				}
			}else if(this.isTip()){
				this.selectOnShow = false;
			}
			///不能改变当前显示，否则可能造成 restore 循环。如有需要，则手动刷新。
			//this.panelManager.selectPanel();
		},
		_onContentType: function(value, oldValue){
			this.contentType = contentTypeStr(value);
			rias.dom.removeClass(this.domNode, this._baseClass0 + "Type" + rias.upperCaseFirst(contentTypeStr(oldValue)));
			rias.dom.addClass(this.domNode, this._baseClass0 + "Type" + rias.upperCaseFirst(this.contentType));
			switch(this.contentType){
				case contentTypeInfo:
					return this.set("iconClass", "infoIcon");
				case contentTypeAbout:
					return this.set("iconClass", "aboutIcon");
				case contentTypeWarn:
					return this.set("iconClass", "warnIcon");
				case contentTypeError:
					return this.set("iconClass", "errorIcon");
				default:
					return;// this.set("iconClass", "");
			}
		},

		_onMovable: function(value, oldValue){
			var self = this;
			if(!!value && self.region){
				console.warn("Cannot set movable when has region.");
			}
			self.movable = self.region ? false : !!value;
			if(self.movable){
				if(!self._moveHandle){
					self._moveHandle = rias.safeMixin(new ((rias.has("ie") === 6) ? TimedMoveable : Moveable)(
						self.domNode,
						{
							delay: self.moveDelay,
							handle: self.moveNode// || self.focusNode
						}
					), {
						onMoving: function(mover, leftTop){
							///约束方法可以参考 dojo/dnd/move
							var p = self.domNode.parentNode,
								r = (self.restrictPadding >= 0 ? self.restrictPadding : 0);
							if(p){
								p = rias.dom.getContentMargin(p);
								if(leftTop.t < p.st + r){
									leftTop.t = p.st + r;
								}
								if(leftTop.l < p.sl + r){
									leftTop.l = p.sl + r;
								}
								if(self.restrictPadding >= 0){
									if(leftTop.t > p.h + p.st - r){
										leftTop.t = p.h + p.st - r;
									}
									if(leftTop.l > p.w + p.sl - r){
										leftTop.l = p.w + p.sl - r;
									}
								}
							}
						//},
						//onMoved: function(/*===== mover, leftTop =====*/){
						}
					});
					//self.own(self._moveHandle);
					//self._doRestrictSizeHandle = rias.after(self._moveHandle, "onMoveStop", rias.hitch(self, "_doRestrictResize"));
					self._doRestrictSizeHandle = rias.after(self._moveHandle, "onMoveStop", rias.hitch(self, function(){
						self._doRestrictResize();
					}));
				}
			}else{
				if(self._moveHandle){
					rias.destroy(self._moveHandle);///没有 destroyRecursive();
					self._moveHandle = undefined;
				}
				if(self._doRestrictSizeHandle){
					self._doRestrictSizeHandle.remove();
					self._doRestrictSizeHandle = undefined;
				}
			}
			//if(self._started){
			//}
		},

		/*_onEnter: function(e){
			if(this.dockTo){
				return;
			}
			this.inherited(arguments);
		},
		_onBlur: function(e){
			var self = this;
			self.inherited(arguments);
			//if(self.isTip()){/// inherited 可能启动 playing，这里不检测 self._playing，直接 close
			//	self.close();
			//}
		},*/

		_hide: function(newState){
			this.inherited(arguments);
			if(this._riasrUnderlay){
				this._riasrUnderlay.hide();
			}
		},
		_onClose: function(){
			//return this.canClose == true && !this.get("modified") && (this.onClose() != false);/// _close 在 DialogPanel 中设置
			///this.onClose() 有可能是 promise，返回 this.onClose()
			var self = this,
				d = self._whenCloseDeferred;
			///只需要处理 _onClose resolved 的情况，其它情况下，不会 Close，可以不处理。
			return rias.when(self.inherited(arguments)).always(function(result){
				if(result != false){
					if(d){
						d.resolve(self.get("closeResult"));
					}
				}
				return result;
			}, function(){
				return false;
			});
		},
		_show: function(){
			var self = this;
			if(this._needPosition){
				this._initPos = rias.dom.placeAt(this, this.initPlaceToArgs);
				if(!this.isLoaded){
					this._initPos = false;
				}
				this._needPosition = !this._initPos;
			}else if(this._initPos){
				var pos = rias.dom.position(this.domNode);
				if(Math.abs(this._initPos.x - pos.x) < 4 && Math.abs(this._initPos.y - pos.y) < 4){
					this._initPos = rias.dom.placeAt(this, this.initPlaceToArgs);
				}
			}
			var r = this.inherited(arguments);
			if(self.isShown(true) && self.selectOnShow){// && !(self.closeDelay > 0) && !self.isTip()){
				///有些时候，show 之前已经 focus，导致 onFocus 时不能 selected
				self.whenLoadedAll(function(){
					self.whenPlayed(function(){
						self.defer(self.select, 90, true);
					});
				});
			}
			return r;
		},
		_onShow: function(newState){
			var self = this;
			return rias.when(self.inherited(arguments), function(result){
				if(self._riasrUnderlay){
					self._riasrUnderlay.show();
				}
				return result;
			});
		},
		_restore: function(){
			var self = this;
			var r = this.inherited(arguments);
			if(self.isShown(true) && self.selectOnShow){// && !(self.closeDelay > 0) && !self.isTip()){
				///有些时候，show 之前已经 focus，导致 onFocus 时不能 selected
				self.whenLoadedAll(function(){
					self.whenPlayed(function(){
						self.defer(self.select, 90, true);
					});
				});
			}
			return r;
			/*return rias.when(self.inherited(arguments), function(result){
				if(self.isShown(true) && self.selectOnShow && !(self.closeDelay > 0) && !self.isTip()){///防止无限递归
					///有些时候，show 之前已经 focus，导致 onFocus 时不能 selected
					if(self._playingDeferred){
						rias.when(self._playingDeferred, function(){
							self.focus();
						});
					}else{
						self.focus();
					}
				}
			});*/
		},
		_showMax: function(){
			var self = this;
			var r = this.inherited(arguments);
			if(self.isShown(true) && self.selectOnShow){// && !(self.closeDelay > 0) && !self.isTip()){
				///有些时候，show 之前已经 focus，导致 onFocus 时不能 selected
				self.whenLoadedAll(function(){
					self.whenPlayed(function(){
						self.defer(self.select, 90, true);
					});
				});
			}
			return r;
		},

		/*resize: function(rect){
			if(!this._canResize()){
				return;
			}
			this.inherited(arguments);
		},*/

		_afterSubmit: function(result){
			var self = this;
			result = self.get("moduleResult");
			///没必要用 Deferred
			rias.when(self.afterSubmit(result), function(result){
				if(self.closeOnSubmit){
					self.close();
				}
			});
		},
		_afterCancel: function(result){
			var self = this;
			///没必要用 Deferred
			rias.when(self.afterCancel(result), function(result){
				if(self.closeOnSubmit){
					self.close();
				}
			});
		},

		whenClose: function(callback){
			var self = this,
				d = self._whenCloseDeferred || (self._whenCloseDeferred = rias.newDeferred(function(){
					self._whenCloseDeferred = undefined;
				}));
			if(!self.isDestroyed(true)){
				if(rias.isFunction(callback)){
					return d.promise.always(function(result){
						return rias.hitch(self, callback)(self.get("closeResult"));
					});
				}
			}
			return d.promise;
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswDialogPanelIcon",
		iconClass16: "riaswDialogPanelIcon16",
		defaultParams: function(params){
			return rias.mixinDeep({}, {
				//parseOnLoad: true,
				//doLayout: false,
				//closable: false,
				resizable: "xy",
				//maxable: false,
				//minable: false,
				dockTo: null//,
				//resizeAxis: "xy",
				//duration: 400
			}, params);
		},
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
				"description": "The innerHTML of the ContentPane.\nNote that the initialization parameter / argument to attr(\"content\", ...)\ncan be a String, DomNode, Nodelist, or _Widget.",
				"hidden": false
			},
			"scriptHasHooks": {
				"datatype": "boolean",
				"description": "replace keyword '_container_' in scripts with 'dijit.byId(this.id)'\nNOTE this name might change in the near future",
				"hidden": false
			}
		}
	};

	return Widget;

});