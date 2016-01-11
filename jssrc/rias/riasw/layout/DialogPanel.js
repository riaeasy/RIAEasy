//RIAStudio ClientWidget - DialogPanel.

define([
	"rias",
	"dojo/dnd/Moveable",
	"dojo/dnd/TimedMoveable",
	//"dijit/BackgroundIframe",
	"rias/riasw/layout/Resizer",
	"rias/riasw/layout/Underlay",
	"rias/riasw/layout/Panel",
	"rias/riasw/form/Button",
	"rias/riasw/layout/CaptionPanel"
], function(rias, Moveable, TimedMoveable, Resizer, Underlay, Panel, Button, CaptionPanel){

	rias.theme.loadCss([
		"layout/DialogPanel.css"
	]);

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

	var _allWin = [];

	var riasType = "rias.riasw.layout.DialogPanel";
	///state:	1=show(showNormal, restore, expand), 2=showMax, 3=collapse(showMin, shrink),
	//			0=hide(display=none), -1=close(destroy), -2=hide(but display) -3=dock(collapse, and hide, dock)
	var Widget = rias.declare(riasType, [CaptionPanel], {

		//loadOnStartup: false,

		_startZ: 100,
		isTopmost: false,

		_size: undefined,
		_state: -1,

		///dialogType: 0 = win, 1 = modal, 2 = top, 3 = tip.
		isTip: function (){
			return this.dialogType && (this.dialogType == 3 || rias.indexOf(this.dialogType, "ip") >= 0);
		},
		isTop: function (){
			return this.dialogType && (this.dialogType == 2 || rias.indexOf(this.dialogType, "top") >= 0);
		},
		isModal: function (){
			return this.dialogType && (this.dialogType == 1 || rias.indexOf(this.dialogType, "odal") >= 0);
		},

		isBoxResizer: true,
		resizeBorderWidth: 8,
		resizable: "xy",
		movable: true,
		closable: true,
		animated: true,

		minSize: {
			w: 180,
			h: 80
		},

		_canClose: true,
		closeOnSubmit: true,
		autoClose: 0,

		templateString:
			"<div class='dijitReset' role='dialog' aria-labelledby='${id}_captionNode'>"+
				"<div data-dojo-attach-point='captionNode,focusNode' id='${id}_captionNode' class='dijitReset riaswDialogPanelCaptionNode' data-dojo-attach-event='ondblclick:_onToggleClick, onkeydown:_onToggleKeydown' tabindex='-1' role='button'>"+
					"<span data-dojo-attach-point='closeNode' class='dijitInline riaswDialogPanelIconNode'>"+
						"<span class='riaswDialogPanelIconInner riaswDialogPanelCloseIcon'></span>"+
					"</span>"+
					"<span data-dojo-attach-point='maxNode' class='dijitInline riaswDialogPanelIconNode'>"+
						"<span class='riaswDialogPanelIconInner riaswDialogPanelMaximizeIcon'></span>"+
					"</span>"+
					"<span data-dojo-attach-point='toggleNode' class='dijitInline riaswDialogPanelIconNode' role='presentation'>"+
						"<span class='riaswDialogPanelIconInner riaswDialogPanelToggleIcon'></span>"+
					"</span>"+
					"<span data-dojo-attach-point='captionTextNode' class='dijitInline riaswDialogPanelCaptionTextNode'>"+
						"<span data-dojo-attach-point='captionText' class='dijitInline riaswDialogPanelCaptionText'></span>"+
					"</span>"+
				"</div>"+
				"<div data-dojo-attach-point='wrapperNode' class='dijitReset riaswDialogPanelWrapper' role='region' id='${id}_wrapper' ${!nameAttrSetting}>"+
					"<div data-dojo-attach-point='containerNode' class='dijitReset riaswDialogPanelContent' role='region' id='${id}_container' ${!nameAttrSetting}>"+
					"</div>"+
					//"<div data-dojo-attach-point='actionBarNode' class='dijitReset riaswDialogPanelActionBar' role='region' id='${id}_actionBar'></div>"+
				"</div>"+
			"</div>",
		baseClass: "riaswDialogPanel",
		cssStateNodes: {
			focusNode: "riaswDialogPanelCaptionNode",
			closeNode: "riaswDialogPanelIconNode",
			maxNode: "riaswDialogPanelIconNode",
			toggleNode: "riaswDialogPanelIconNode",
			captionTextNode: "riaswDialogPanelCaptionTextNode",
			captionText: "riaswDialogPanelCaptionText",
			containerNode: "riaswDialogPanelContent"
		},

		focusOnShow: true,
		showCaption: true,
		contentType: "none",/// 0 = none, 1 = info, 2 = warn, 3 = error, -1 = about

		restrictPadding: 12,

		postMixInProperties: function(){
			this.nameAttrSetting = this.name ? ("name='" + this.name + "'") : "";
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
			this._initAttr(["closable", "movable", "contentType"]);
		},
		postCreate: function(){
			var self = this;
			self.own(
				rias.on(self.closeNode, rias.touch.press, rias.hitch(self, "_stopEvent")),
				rias.on(self.closeNode, rias.touch.release, rias.hitch(self, "cancel")),
				rias.on(self.domNode, "keydown", rias.hitch(self, "_onKey")),
				rias.on(self.domNode, rias.touch.over, function(evt){
					rias.dom.toggleClass(self.captionNode, "riaswDialogPanelCaptionNodeHover", true);
				}),
				rias.on(self.domNode, rias.touch.out, function(evt){
					rias.dom.toggleClass(self.captionNode, "riaswDialogPanelCaptionNodeHover", false);
				})
			);
			self._onContentType(self.contentType);
			self._onClosable(self.closable);
			self._onMovable(self.movable);
			self.inherited(arguments);

			if(self.autoClose == 1){
				self.own(self.on("mouseleave", function(){
					self.close();
				}));
			}else if(self.autoClose > 1){
				self.own(rias.after(self, "onShow", function(){
					self.defer(function(){
						self.close();
					}, self.autoClose);
				}, true));
			}

			_allWin.push(self);
		},
		startup: function(){
			var self = this;
			if(self._started){
				return;
			}
			self.inherited(arguments);
			self.own(
				rias.after(self, "onFocus", function(){
					self.bringToTop();
				}),
				rias.after(self.captionNode, "onmousedown", function(evt){
					//self.defer(function(){
					if(!self.focused){
						self.focus();
					}
					//}, 100);
				/*}),
				rias.after(self.domNode, "onmousedown", function(evt){
					//self.defer(function(){
						////focus 会导致其他 popup 失去焦点，最好判断一下
						if(!self.focused){
							self.focus();
						}
					//}, 100);
				*/})//,
				//rias.after(self, "onSubmit", rias.hitch(self, "close"), true),
				//rias.after(self, "onCancel", rias.hitch(self, "close"), true)
			);
		},
		destroy: function(){
			if(this._actionBar){
				this._actionBar.destroyRecursive();
				delete this._actionBar;
			}
			if(this._onMouseOverHandle){
				this._onMouseOverHandle.remove();
				delete this._onMouseOverHandle;
			}
			if(this._doRestrictSizeHandle){
				this._doRestrictSizeHandle.remove();
				delete this._doRestrictSizeHandle;
			}
			if(this._moveHandle){
				this._moveHandle.destroy();///没有 destroyRecursive();
				delete this._moveHandle;
			}
			if(this.bgIframe){
				this.bgIframe.destroy();
				delete this.bgIframe;
			}
			this.inherited(arguments);
			var i = rias.indexOf(_allWin, this);
			if(i >= 0){
				_allWin.splice(i, 1);
				Widget.bringToTop();
			}
		},

		_setStateClass: function(){
			try{
				this.inherited(arguments);

				rias.dom.toggleClass(this.captionNode, "riaswDialogPanelCaptionNodeHover", !!this.hovering);
				rias.dom.toggleClass(this.captionNode, "riaswDialogPanelCaptionNodeActive", !!this.active);
			}catch(e){ /* Squelch any errors caused by focus change if hidden during a state change */
			}
		},

		_initSize: function(meta){
			var self = this,
				args = arguments;
			if(self._actionBar){
				self._actionBar.destroyRecursive();
				delete self._actionBar;
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
								_riaswIdOfModule: rias.isRiaswModule(self) ? p : undefined,
								label: p,
								tooltip: p
							};
							if(p === "btnOk"){
								w.label = w.tooltip = rias.i18n.action.ok;
								w.iconClass = "okIcon";
								w.onClick =  function(evt){
									self.submit();
								};
							}else if(p === "btnCancel"){
								w.label = w.tooltip = rias.i18n.action.cancel;
								w.iconClass = "cancelIcon";
								w.onClick =  function(evt){
									self.cancel();
								};
							}else if(p === "btnYes"){
								w.label = w.tooltip = rias.i18n.action.yes;
								w.iconClass = "okIcon";
								w.onClick =  function(evt){
									self.submit();
								};
							}else if(p === "btnSave"){
								w.label = w.tooltip = rias.i18n.action.save;
								w.iconClass = "saveIcon";
								w.onClick =  function(evt){
									self.submit();
								};
							}else if(p === "btnNo"){
								w.label = w.tooltip = rias.i18n.action.no;
								w.iconClass = "cancelIcon";
								w.onClick =  function(evt){
									self.cancel();
								};
							}else if(p === "btnClose"){
								w.label = w.tooltip = rias.i18n.action.close;
								w.iconClass = "closeIcon";
								w.onClick =  function(evt){
									self.cancel();
								};
							}
						}
					}else if(rias.isObjectSimple(p)){
						w = rias.mixinDeep({}, {
							_riaswType: "rias.riasw.form.Button",
							_riaswIdOfModule: "btnCancel"
						}, p);
					}else{
						w = rias.by(p);
					}
					if(w){
						ps.push(w);
						if(!self.activeNode){
							self.activeNode = w._riaswIdOfModule || w.id;
						}
					}
				}
				if(ps.length > 0){
					self.own(self._actionBar = rias.createRiasw(Panel, {
						ownerRiasw: self,
						//_riaswIdOfModule: "_actionBar",
						"class": "dijitReset riaswDialogPanelActionBar"
					}));///注意，模板中的 actionBarNode 被 _actionBar.domNode 替代
					//self.actionBarNode = self._actionBar.domNode;///重新设置正确的 this.actionBarNode
					if(self.actionBarPosition === "top" || self.actionBarPosition === "first"){
						self._actionBar.placeAt(self.wrapperNode, "first");
					}else{
						self._actionBar.placeAt(self.wrapperNode, "last");
					}
					rias.filer(ps, self._actionBar, rias.isRiaswModule(self) ? self : self._riasrModule).then(function(){
						self.inherited(args);
					});
				}else{
					self.inherited(args);
				}
			}else{
				self.inherited(args);
			}
			//if(self.placeToArgs){
				rias.dom.placeTo(self, self.placeToArgs);
			//}
		},

		_refreshDisplayState: function(){
			/*if(this.actionBar && this.actionBar.length){
				if(!rias.dom.isVisible(this._actionBar)){
					rias.dom.visible(this._actionBar, true);
				}
				this._actionBarHeight = rias.dom.getMarginBox(this._actionBar.domNode).h;
			}else{
				if(rias.dom.isVisible(this._actionBar)){
					rias.dom.visible(this._actionBar, false);
				}
				this._actionBarHeight = 0;
			}*/
			if(this._actionBar){
				this._actionBarHeight = rias.dom.getMarginBox(this._actionBar.domNode).h;
			}else{
				this._actionBarHeight = 0;
			}
			this.inherited(arguments);
		},

		_onContentType: function(value, oldValue){
			this.contentType = contentTypeStr(value);
			rias.dom.removeClass(this.domNode, this.baseClass + "Type" + rias.upperCaseFirst(contentTypeStr(oldValue)));
			rias.dom.addClass(this.domNode, this.baseClass + "Type" + rias.upperCaseFirst(this.contentType));
		},

		//_onParentNode: function(value, oldValue){
		//	///还是不强行指定
		//	//if(this.isModal()){
		//	//	value = rias.webApp.domNode || rias.body(rias.doc);
		//	//}
		//	this.inherited(arguments, [value, oldValue]);
		//},

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
							delay: 0,
							handle: self.captionNode// || self.focusNode
						}
					), {
						onMoving: function(mover, leftTop){
							if(leftTop.t < self.restrictPadding){
								leftTop.t = self.restrictPadding;
							}
							if(leftTop.l < self.restrictPadding){
								leftTop.l = self.restrictPadding;
							}
							var p = self.domNode.parentNode,
								r = (self.restrictPadding >= Widget.prototype.restrictPadding ? self.restrictPadding : Widget.prototype.restrictPadding);
							p = rias.dom.getContentBox(p);
							if(leftTop.t > p.h - r){
								leftTop.t = p.h - r;
							}
							if(leftTop.l > p.w - r){
								leftTop.l = p.w - r;
							}
						},
						onMoved: function(/*===== mover, leftTop =====*/){
						}
					});
					self.own(self._moveHandle);
					//self._doRestrictSizeHandle = rias.after(self._moveHandle, "onMoveStop", rias.hitch(self, "_doRestrictResize"));
					self._doRestrictSizeHandle = rias.after(self._moveHandle, "onMoveStop", rias.hitch(self, function(){
						self._doRestrictResize();
						//self._internalResize();
					}));
				}
			}else{
				if(self._moveHandle){
					self._moveHandle.destroy();///没有 destroyRecursive();
					delete self._moveHandle;
				}
				if(self._doRestrictSizeHandle){
					self._doRestrictSizeHandle.remove();
					delete self._doRestrictSizeHandle;
				}
			}
			//if(self._started){
			//}
		},
		_onClosable: function(value, oldValue){
			this.closable = !!value;
			rias.dom.visible(this.closeNode, this.closable);
		},

		_onKey: function(/*Event*/ evt){
			if(evt.keyCode == rias.keys.TAB){
				var fn = rias.dom.focusedNode();
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

		//layout: function(){
		//	this.inherited(arguments);
		//},
		_onShow: function(newState){
			if(this.focusOnShow && !(this.autoClose > 0) && !this.isTip()){
				this.focus();
			}
			this.inherited(arguments);
		},
		_show: function(newState){
			var self = this;
			return rias.when(self.inherited(arguments), function(){
			});
		},
		resize: function(/* Object */rect){
			this.inherited(arguments);
		},

		onBringToTop: function(isTopmost){
		},
		_onBringToTop: function(){
			this.onBringToTop(this.isTopmost);
		},
		bringToTop: function(){
			Widget.bringToTop(this);
		}

	});

	Widget._startZ = 100;
	Widget.bringToTop = function(win){
		var i, z, zt, h,
			ws, ms, ts;

		function _topmost(h, value, z){
			h.set("isTopmost", !!value);
			if(value){
				Widget.topmost = h;
				rias.dom.addClass(h.domNode, "riaswDialogPanelTopmost");
				rias.dom.addClass(h.captionNode, "riaswDialogPanelCaptionNodeTopmost");
			}else{
				rias.dom.removeClass(h.domNode, "riaswDialogPanelTopmost");
				rias.dom.removeClass(h.captionNode, "riaswDialogPanelCaptionNodeTopmost");
			}
			rias.dom.setStyle(h.domNode, "zIndex", z);
			h._onBringToTop();
		}
		function _sort(a, b){
			h = a === win ? 1 : b === win ? -1 : rias.dom.getStyle(a.domNode, "zIndex") - rias.dom.getStyle(b.domNode, "zIndex");
			if(isNaN(h)){
				h = 0;
			}
			return (a.isShown() ? b.isShown() ? h : 1 : h);
		}

		if(win && Widget.topmost === win){
			return Widget.topmost;
		}
		Widget.topmost = null;
		if(win && !win.isShown()){
			win.restore();
		}
		///因为需要处理 css，应该包含未显示的
		ws = rias.filter(_allWin, function(w){
			return !w._destroying && !w.isModal() && !w.isTop();// && (!win || w !== win);
		});
		ms = rias.filter(_allWin, function(w){
			return !w._destroying && w.isModal();// && (!win || w !== win);
		});
		ts = rias.filter(_allWin, function(w){
			return !w._destroying && w.isTop();// && (!win || w !== win);
		});
		Underlay.hide();
		try{
			ws.sort(_sort);
			ms.sort(_sort);
			ts.sort(_sort);
			/*if(win && !win._destroying){
				if(win.isShown()){
					win.isModal() ? ms.push(win) : win.isTop() ? ts.push(win) : ws.push(win);
				}else{
					win.isModal() ? ms.unshift(win) : win.isTop() ? ts.unshift(win) : ws.unshift(win);
				}
			}*/
			z = zt = Widget._startZ + ((ms.length + ts.length + ws.length + 3) << 1);
			for(i = ms.length - 1; i >= 0; i--){
				z -= 2;
				h = ms[i];
				if(h === win && h.isShown()){
					Underlay.show({
						ownerRiasw: h,
						dialog: h,
						"class": rias.map(h["class"].split(/\s/),function(s){
							return s + "_underlay";
						}).join(" "),
						_onKeyDown: rias.hitch(h, "_onKey"),
						ownerDocument: h.ownerDocument
					}, zt - 1);
					_topmost(h, true, zt);
				}else{
					_topmost(h, false, z);
				}
			}
			zt = z;
			for(i = ts.length - 1; i >= 0; i--){
				z -= 2;
				h = ts[i];
				if(h === win && h.isShown()){
					_topmost(h, true, zt);
				}else{
					_topmost(h, false, z);
				}
			}
			zt = z;
			for(i = ws.length - 1; i >= 0; i--){
				z -= 2;
				h = ws[i];
				if(h === win && h.isShown()){
					_topmost(h, true, zt);
				}else{
					_topmost(h, false, z);
				}
			}
		}catch(e){
			Underlay.hide();
		}
		return Widget.topmost;
	};

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
			"parseOnLoad": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Parse On Load"
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
			"duration": {
				"datatype": "number",
				"defaultValue": rias.defaultDuration,
				"title": "Duration"
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