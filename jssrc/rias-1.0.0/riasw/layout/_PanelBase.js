
//RIAStudio client runtime widget - _PanelBase

define([
	"rias",
	"dijit/_Widget",
	"dijit/_Container",
	"dijit/_Contained",
	"dijit/_CssStateMixin",
	"dijit/_TemplatedMixin",
	"dijit/_KeyNavContainer",
	"rias/riasw/layout/_Gutter",
	"rias/riasw/layout/_Splitter",
	"rias/riasw/layout/ToggleSplitter"
], function(rias, _Widget, _Container, _Contained, _CssStateMixin, _TemplatedMixin, _KeyNavContainer, _Gutter, _Splitter, ToggleSplitter){

	///displayState:	1=shown(showNormal, restore, expand), 2=showMax, 3=collapsed(showMin, shrunk),
	//			0=hideen(display=none), -1=closed(destroy), -2=transparent(but display)
	var displayShowNormal = "showNormal",///1
		displayShowMax = "showMax",///2
		displayCollapsed = "collapsed",///3
		displayHidden = "hidden",///0
		displayClosed = "closed",///-1
		displayTransparent = "transparent";///-2
	var intShowNormal = 1,
		intShowMax = 2,
		intCollapsed = 3,
		intHidden = 0,
		intClosed = -1,
		intTransparent = -2;
	function displayStateInt(displayState){
		switch(displayState){
			case intShowNormal://1:
			case displayShowNormal://1:
				return intShowNormal;
			case intHidden://0:
			case displayHidden://0:
				return intHidden;
			case intClosed://-1:
			case displayClosed://-1:
				return intClosed;
			case intTransparent://-2:
			case displayTransparent://-2:
				return intTransparent;
			case intShowMax://2:
			case displayShowMax://2:
				return intShowMax;
			case intCollapsed://3:
			case displayCollapsed://3:
				return intCollapsed;
			default:
				return undefined;
		}
	}
	function displayStateStr(displayState){
		switch(displayState){
			case intShowNormal://1:
			case displayShowNormal://1:
				return displayShowNormal;
			case intHidden://0:
			case displayHidden://0:
				return displayHidden;
			case intClosed://-1:
			case displayClosed://-1:
				return displayClosed;
			case intTransparent://-2:
			case displayTransparent://-2:
				return displayTransparent;
			case intShowMax://2:
			case displayShowMax://2:
				return displayShowMax;
			case intCollapsed://3:
			case displayCollapsed://3:
				return displayCollapsed;
			default:
				return undefined;
		}
	}

	//rias.theme.loadThemeCss([
		//"riasw/layout/Panel.css",
		//"riasw/layout/CaptionPanel.css",
		//"riasw/layout/AccordionPanel.css",
		//"riasw/layout/StackPanel.css",
		//"riasw/layout/TabPanel.css",
		//"riasw/layout/TablePanel.css",
		//"riasw/layout/DockBar.css",
		//"riasw/layout/Underlay.css"
	//]);

	var riaswType = "rias.riasw.layout._PanelBase";
	var Widget = rias.declare(riaswType, [_Widget, _Container, _Contained, _CssStateMixin], {

		caption: "",///有些 widget 需要 watch 该值。
		showCaption: false,
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

		baseClass: "riaswPanel",

		//tabIndex: "0",
		//_setTabIndexAttr: ["domNode"],

		//movable: false,
		//resizable: "",
		animate: false,

		_focusStack: true,//false,
		_tabCycle: false,

		//canClose: true,

		//displayState: displayShowNormal,
		initDisplayState: displayShowNormal,
		initDisplayBox: null,

		cookieName: "",
		persist: false,

		postMixInProperties: function(){
			this.inherited(arguments);
		},
		_calCollapsedHeight: function(){
			if(this.showCaption && this.captionNode){
				this.collapsedHeight = rias.dom.getMarginBox(this.captionNode).h + rias.dom.getMarginBorderBox(this.domNode).h;// rias.dom.getMarginBox(this.captionNode).h;
			}else{
				this.collapsedHeight = 0;
			}
		},
		buildRendering: function(){
			this.inherited(arguments);
			this._calCollapsedHeight();
		},

		postCreate: function(){
			this.inherited(arguments);
			this._initAttr([{
				name: "displayState",
				initialize: false///在 startup 中用 initDisplayState 初始化
			}, "selected"]);
			this.own(
				rias.on(this.domNode, "keydown", rias.hitch(this, "_onKey"))
			);
		},
		destroy: function(){//FIXME:zensst. dojo 2.0 才开始支持 destroyRecursive()，目前只 destroy 自身.
			this._stopPlay();
			this.inherited(arguments);
		},
		isDestroyed: function(checkAncestors, checkClose){
			return (checkClose && this.isClosed()) || rias.isDestroyed(this, checkAncestors != false);
		},

		startup: function(){
			if(this._started){
				return;
			}
			this.inherited(arguments);
			var a = this._loadFromCookie();
			return this.set("displayState", this.initDisplayState || a);
		},

		_loadFromCookie: function(){
			var a;
			//this._size0 = rias.mixin(this._size0, this.initDisplayBox || {});
			if(this.persist && this.cookieName){
				var c = rias.cookie(this.cookieName);
				try{
					c = rias.fromJson(c);
				}catch(error){
					c = undefined;
				}
				(c && c.s) && rias.mixin(this._size0, c.s);
				//this._internalResize(this._size0 || this._changeSize, this._resultSize);
				a = (c && c.a) ? displayStateStr(c.a) : this.displayState ? this.displayState : displayShowNormal;
			}else{
				//this._size0 = undefined;// = rias.dom.getMarginBox(this.domNode);
				a = this.displayState;
			}
			return a;
		},
		_saveToCookie: function(){
			if(this.persist && this._started){
				var c = {
					s: this._size0,
					a: displayStateInt(this.displayState)
				};
				if(!this.cookieName){
					console.error(this.id + ": Persist the widget requires define the cookieName.");
				}else{
					rias.cookie(this.cookieName, rias.toJson(c), {expires:365});
				}
			}
		},

		_onKey: function(/*Event*/ evt){
			/*function _do(root, cn, next, cycle){
				var all = rias.a11y._getTabNavigable(root).all,
					i = rias.indexOf(all, cn), l = all.length - 1,
					fn;
				while(!fn){
					next ? i++ : i--;
					if(i < 0){
						if(cycle){
							i = l;
							fn = all[i];
						}
					}else if(i > l){
						if(cycle){
							i = 0;
							fn = all[i];
						}
					}
				}
				if(this._firstFocusNode == this._lastFocusNode){
					evt.stopPropagation();
					evt.preventDefault();
				}else if(fn == this._firstFocusNode && evt.shiftKey){
					if(this._tabCycle){
						if(this._lastFocusNode && this._lastFocusNode.focus){
							tn = this._lastFocusNode;
						}
						evt.stopPropagation();
						evt.preventDefault();
					}
				}else if(fn == this._lastFocusNode && !evt.shiftKey){
					if(this._tabCycle){
						if(this._firstFocusNode && this._firstFocusNode.focus){
							tn = this._firstFocusNode;
						}
						evt.stopPropagation();
						evt.preventDefault();
					}
				}else if(evt.keyCode == rias.keys.ENTER){

				}
				if(tn){
					tn.focus();
				}
			}*/
			var fn = rias.dom.focusedNode,
				tn;
			if(evt.keyCode == rias.keys.TAB || evt.keyCode == rias.keys.ENTER){
				//if(rias.dom.isDescendant(fn, this.domNode) && fn.focus){
				//	fn.focus();
				//}
				this._getFocusItems();
				if(this._firstFocusNode == this._lastFocusNode){
					tn = fn;
				}else if(fn == this._firstFocusNode && evt.shiftKey){
					if(this._tabCycle){
						if(this._lastFocusNode && this._lastFocusNode.focus){
							tn = this._lastFocusNode;
						}
					}
				}else if(fn == this._lastFocusNode && !evt.shiftKey){
					if(this._tabCycle){
						if(this._firstFocusNode && this._firstFocusNode.focus){
							tn = this._firstFocusNode;
						}
					}
				}
				if(tn){
					if(tn !== fn){
						tn.focus();
					}
					evt.stopPropagation();
					evt.preventDefault();
				}
			}else if(this.closable && evt.keyCode == rias.keys.ESCAPE && rias.isFunction(this.close)){
				this.defer(this.close);
				evt.stopPropagation();
				evt.preventDefault();
			}
		},

		///_onFocus 和 focus 的触发规则不同，都需要 select().
		_onFocus: function(by){
			this.inherited(arguments);
			if(!this.get("selected")){
				this.select(true);
			}
		},
		focus: function(forceVisible){
			var self = this;
			if(!self.get("selected")){
				self.select(true);
			}
			self.inherited(arguments);
		},
		onSelected: function(selected){
		},
		_onSelected: function(value, oldValue){
			if(value){
				this.focus();
				if(!oldValue){
					this.focus();
					this.onSelected(this.get("selected"));
					rias.publish(this.id + "_onSelected", {
						widget: this,
						selected: value
					});
				}
			}
		},
		_setSelectedAttr: function(value){
			if(!this.isDestroyed(true)){
				value = value != false;
				rias.dom.setAttr(this.domNode, "selected", value);
				rias.dom.setAttr(this.domNode, "aria-selected", value ? "true" : "false");
				this._set("selected", value);
			}
		},
		select: function(value){
			value = !!value;
			this.set("selected", value);
		},

		_doResize: function(box){
			var node = this.domNode,
				cs,
				//dns = node.style,
				isV = (this.region == "left" || this.region == "right");
			if(this.isCollapsed()){
				///这里处理可以防止 move 和 resize 的时候改变，同时允许先改变 大小 和 约束
				cs = rias.dom.getComputedStyle(node);
				if(isV){
					//dns.width = this.collapsedHeight + "px";
					box.w = this.collapsedHeight;
					rias.dom.setMarginBox(node, {
						w: box.w
					}, cs);
					if(this.showCaption && this.captionNode){
						rias.dom.setMarginSize(this.captionNode, {
							w: rias.dom.marginBox2contentBox(node, box, cs).w,//this.collapsedHeight,
							h: rias.dom.marginBox2contentBox(node, box, cs).h
						});
					}
				}else if(this.region == "top" || this.region == "bottom"){
					//dns.height = this.collapsedHeight + "px";
					box.h = this.collapsedHeight;
					rias.dom.setMarginBox(node, {
						h: box.h
					}, cs);
				}else{
					//dns.height = this.collapsedHeight + "px";
					box.h = this.collapsedHeight;
					//if(this.collapsedWidth > 60){
					//	dns.width = this.collapsedWidth + "px";
					//}
					rias.dom.setMarginBox(node, {
						w: this.collapsedWidth > 60 ? (box.w = this.collapsedWidth) : undefined,
						h: box.h
					}, cs);
				}
				//box = rias.dom.getMarginBox(node);
			}else{
				if(this.isShowNormal()){
					if(!rias.objLike(this._size0, box)){
						this._size0 = rias.mixinDeep(this._size0, box);
						//this._needPosition = false;
						this._saveToCookie();
					}
				}
				if(this.isShowNormal() || this.isShowMax()){
					//this.layout();
					if(this.get("needLayout") || this._needResizeChild || !this._marginBox0 || !rias.dom.boxEqual(box, this._marginBox0, 1)){
						this._marginBox0 = box;
						//console.debug("layout - " + this.id);
						this.layout();
					}else{
						//console.debug("layout pass - " + this.id);
					}
				}
			}
			this._marginBox = box;
		},

		///displayState:	1=shown(showNormal, restore, expand), 2=showMax, 3=collapsed(showMin, shrunk),
		//			0=hideen(display=none), -1=closed(destroy), -2=hideen(but display)
		whenPlayed: function(callback){
			var self = this;
			return rias.when(this._playingDeferred || true).always(function(result){
				if(rias.isFunction(callback)){
					callback.apply(self, arguments);
				}
				return result;
			});
		},
		_refreshDisplayState: function(state){
			//if(this.displayStateOld != this.displayState){
				this.set("needLayout", true);
				///不应该联动 _splitterWidget 的 state，而应该由 _splitterWidget 自行设置
				//if(state && this._splitterWidget && rias.isFunction(this._splitterWidget._setStateAttr)){
				//	this._splitterWidget.set("state", state);
				//}else{
				//	this._parentResize();
				//}
				if(this.region){
					this._parentResize();
				}else{
					this.resize();
				}
			//}
		},
		onDisplayStateChanging: function(value, oldValue){
			return value;
		},
		onDisplayStateChanged: function(value){},
		_setDisplayStateAttr: function(value){
			var self = this;
			function _always(result){
				self._playingDeferred = undefined;
				if(!self.isDestroyed(true) && result){
					self.onDisplayStateChanged(self.displayState);
					self._saveToCookie();
				}
				return result;
			}

			self.displayStateOld = self.displayState;
			value = displayStateStr(value);
			if(value === displayClosed){
				var d = displayClosed;
				return rias.when(this._onClose()).always(function(result){
					//if(result === true || result > 0){
					if(result != false){
						if(self.closeDisplayState != undefined){
							d = self.closeDisplayState;
						}else if(self.dockTo && !self.closable){
							d = displayHidden;
						}
						self._set("displayState", d);
						return self.whenPlayed(_always);
					}
					return result;
				});
			}else{
				this._set("displayState", value);
				return self.whenPlayed(_always);
			}
		},
		_onDisplayState: function(value, oldValue){
			var self = this;
			if(rias.isNumber(value)){
				value = displayStateStr(value) || displayShowNormal;
			}
			value = self.onDisplayStateChanging(value, oldValue);
			self._doPlay(value);
		},

		_playingHide: rias.fx.fadeOut,
		_playingShow: rias.fx.fadeIn,
		_playingCollapse: rias.fx.wipeOut,
		_playingExpand: rias.fx.wipeIn,
		_playingSize: rias.fx.sizeTo,

		duration: rias.defaultDuration * 2,

		_stopPlay: function(noFulfilled){
			if(this._playingContent){
				this._playingContent.stop(true);
				this._playingContent = undefined;
			}
			if(this._playing){
				var p = this._playing;
				this._playing.stop(true);
				this._playing = undefined;
			}
			if(this._playingEndHandle){
				this._playingEndHandle.remove();
				this._playingEndHandle = undefined;
			}
			if(!noFulfilled && this._playingDeferred){
				///如果是正常
				console.debug(this.id, "cancel play", p);
				this._playingDeferred.cancel();
				this._playingDeferred = undefined;
			}
		},
		_doPlayContent: function(show){
			var self = this,
				df = rias.newDeferred(),
				cn = self.containerNode,
				duration = self.duration / 2;
			if(show == false){
				self._playingContent = self._playingHide({
					node: cn,
					duration: duration,
					onEnd: function(){
						df.resolve();
					},
					onStop: function(){
						df.resolve();
					}
				});
			}else{
				self._playingContent = self._playingShow({
					node: cn,
					duration: duration,
					onEnd: function(){
						df.resolve();
					},
					onStop: function(){
						df.resolve();
					}
				});
			}
			self._playingContent.play();
			df.promise.always(function(){
				self._playingContent = undefined;
			});
			return df.promise;
		},
		_doPlay: function(newState, forcePlay){
			var self = this,
				canPlay = self._started && self.animate && self.get("visible"),
				oldState = self._displayState0,//不能取 this.displayState，因为已经改变了。
				dn = self.domNode, dns = dn.style,
				cn = self.containerNode,
				cpn = self.captionNode,
				duration = self.duration,
				_playContent,
				r = (self.restrictPadding > 0 ? self.restrictPadding : 0),
				isV = (self.region == "left" || self.region == "right"),
				_size0 = self._size0;

			function _mb(){
				return rias.dom.getMarginBorderBox(dn);
			}
			function expandParam(){
				var mb = _mb();
				return {
					__fxparamname: "expandParam",
					node: dn,
					duration: duration,
					properties: {
						height: {
							start: isV ? undefined : (self.showCaption && cpn ? self.collapsedHeight : 0),
							end: isV ? undefined : _size0 && _size0.h ? _size0.h - mb.h : undefined
						},
						width: {
							start: isV ? (self.showCaption && cpn ? self.collapsedHeight : 0) : undefined,
							end: isV ? _size0 && _size0.w ? _size0.w - mb.w : undefined : undefined
						}
					},
					beforeBegin: function(){
						rias.dom.visible(cn, true);
						setExpand(true);
					},
					onEnd: function() {
						doExpanded(true);
					}
				};
			}
			function collapseParam(){
				return {
					__fxparamname: "collapseParam",
					node: dn,
					duration: duration,
					properties: {
						height: {
							end: isV ? undefined : (self.showCaption && cpn ? self.collapsedHeight : 0)
						},
						width: {
							end: isV ? (self.showCaption && cpn ? self.collapsedHeight : 0) : undefined
						}
					},
					beforeBegin: function(){
					},
					onEnd: function(){
						setExpand(false);
						doExpanded(false);
					}
				};
			}
			function hideParam(){
				return {
					__fxparamname: "hideParam",
					node: dn,
					duration: duration,
					beforeBegin: function(){
					},
					onEnd: function(){
						doShow(newState);
					}
				};
			}
			function showParam(){
				return {
					__fxparamname: "showParam",
					node: dn,
					duration: duration,
					beforeBegin: function(){
						doShow(newState, 0);
					},
					onEnd: function(){
					}
				};
			}
			function sizeMAxParam(){
				var parentSize = rias.dom.getContentMargin(self.getParentNode()); ///用 getContentMargin 更好些
				var mb = _mb();
				return {
					__fxparamname: "sizeMAxParam",
					//method: "combine",
					node: dn,
					duration: duration * 2,
					properties: {
						top: {
							end: parentSize ? parentSize.st + r : _size0 ? _size0.t : undefined
						},
						left: {
							end: parentSize ? parentSize.sl + r : _size0 ? _size0.l : undefined
						},
						width: {
							end: parentSize ? (parentSize.w - r - r - mb.w) : _size0 && _size0.w ? _size0.w - mb.w : undefined
						},
						height: {
							end: parentSize ? (parentSize.h - r - r - mb.h) : _size0 && _size0.h ? _size0.h - mb.h : undefined
						}
					},
					beforeBegin: function(){
						///由于 onEnd 会调用两次，且， Widget._internalResize/_internalLayout 中有 defer/debounce 存在，hidden 会导致 resize 不正常.
						rias.dom.visible(cn, false, 0);
					},
					onEnd: function(){
						rias.dom.visible(cn, true, 1);
						doMax(true);
					}
				};
			}
			function sizeNormalParam(){
				var mb = _mb();
				return {
					__fxparamname: "sizeNormalParam",
					//method: "combine",
					node: dn,
					duration: duration * 2,
					properties: {
						top: {
							end: _size0 ? _size0.t : undefined
						},
						left: {
							end: _size0 ? _size0.l : undefined
						},
						width: {
							end: _size0 && _size0.w ? _size0.w - mb.w : undefined
						},
						height: {
							end: _size0 && _size0.h ? _size0.h - mb.h : undefined
						}
					},
					beforeBegin: function(){
						rias.dom.visible(cn, false, 0);
					},
					onEnd: function(){
						rias.dom.visible(cn, true, 1);
						doMax(false);
					}
				};
			}

			function doShow(value, opacity){
				rias.dom.visible(cn, value > 0);
				rias.dom.visible(dn, value > 0, opacity);
				if(value > 0){
					if(oldState !== intShowNormal){
						self._changeSize = rias.mixin(self._changeSize, self._size0);
					}
					self._show();
				}else{
					self._hide(value);
				}
			}
			function doMax(value){
				if(value){
					self._showMax(value);
				}else{
					self._restore();
				}
			}
			function setExpand(value){
				//value = !!value;
				rias.dom.visible(cn, value);
				rias.dom.visible(dn, true);

				if(cpn){
					//var oldCls = self._captionClass;
					//self._captionClass = self._baseClass0 + "CaptionNode" + (self.toggleable ? !value ? "Collapsed" : "Expanded" : "Fixed");
					//rias.dom.replaceClass(cpn, self._captionClass, oldCls || "");
					rias.dom.toggleClass(cpn, "riaswDisplayVertical", isV && !value);
					rias.forEach(self.splitBaseClass(), function(cls){
						rias.dom.toggleClass(cpn, cls + "CaptionNodeVertical", isV && !value);
					}, self);
					if(self.labelNode){
						rias.dom.toggleClass(self.labelNode, "riaswTextVertical", isV && !value);
					}
					cpn.style.height = "";///auto?
					cpn.style.width = "";
				 }
			}
			function doExpanded(value){
				//value = !!value;
				rias.forEach(cpn.childNodes, function(node){
					rias.dom.toggleClass(node, "riaswFloatNone", !value);
				});
				if(value){
					self.onRestore();
					self._expand();
				}else{
					self._collapse();
				}
			}
			var _nextState;
			function _onEnd(){
				if(self.isDestroyed(true)){
					return;
				}
				if(self._playingEndHandle){
					self._playingEndHandle.remove();
					self._playingEndHandle = undefined;
				}
				if(_nextState){
					self._displayState0 = displayStateInt(self.displayState);
					self._doPlay(_nextState, forcePlay);
				}else{
					self._playing = undefined;
					if(self.animate && _playContent && newState >= intHidden){
						//self.defer(function(){
							self._doPlayContent().always(function(result){
								if(self._playingDeferred){
									self._playingDeferred.resolve(self.displayState);
								}
							});
						//});
					}else{
						if(self._playingDeferred){
							self._playingDeferred.resolve(self.displayState);
						}
					}
				}
			}

			newState = displayStateInt(newState);
			isNaN(newState) && (newState = intShowNormal);
			if(self.isDestroyed(true) || !forcePlay && oldState === newState){
				return;
			}
			self._stopPlay(self._playingDeferred);
			///onShow 等事件中需要使用 self.displayState，提前设置.
			self._displayState0 = newState;
			self.displayState = displayStateStr(newState) || displayShowNormal;
			if(newState <= intHidden){
				///hide...
				if(canPlay && self._playingHide){
					self._playing = self._playingHide(hideParam());
				}else{
					doShow(newState);
				}
			}else{
				if(newState == intShowMax){
					///showMax
					if(dn.parentNode){
						_playContent = true;
						if(oldState == intCollapsed){
							///collapsed
							if(canPlay && self._playingSize && self._playingExpand){
								self.displayState = "showNormal";
								self._playing = self._playingExpand(expandParam);
								_nextState = "showMax";
							}else{
								setExpand(true);
								doExpanded(true);
								doMax(true);
							}
						}else if(isNaN(oldState) || oldState <= intHidden){
							///hide...
							if(canPlay && self._playingSize && self._playingShow){
								//self._playing = rias.fx.chain([
								//	self._playingShow(showParam()),
								//	self._playingSize(sizeMAxParam())
								//]);
								self.displayState = "showNormal";
								self._playing = self._playingShow(showParam());
								_nextState = "showMax";
							}else{
								doShow(newState, 1);
								doMax(true);
							}
						}else{
							///showNormal
							if(canPlay && self._playingSize){
								self._playing = self._playingSize(sizeMAxParam());
							}else{
								doShow(newState, 1);
								doMax(true);
							}
						}
					}else{
						if(canPlay && self._playingShow){
							self._playing = self._playingShow(showParam());
						}else{
							doShow(newState, 1);
						}
					}
				}else if(newState == intCollapsed){
					///collapse
					if(oldState == 2){
						///showMax
						if(canPlay && self._playingCollapse && self._playingSize){
							_playContent = true;
							self.displayState = "showNormal";
							self._playing = self._playingSize(sizeNormalParam());
							_nextState = "collapsed";
						}else{
							doMax(false);
							setExpand(false);
							doExpanded(false);
						}
					}else if(isNaN(oldState) || oldState <= intHidden){
						///hide...
						if(canPlay && self._playingCollapse && self._playingShow){
							//self._playing = rias.fx.chain([
							//	self._playingShow(showParam()),
							//	self._playingCollapse(collapseParam())
							//]);
							self.displayState = "showNormal";
							self._playing = self._playingShow(showParam());
							_nextState = "collapsed";
						}else{
							doShow(newState, 1);
							setExpand(false);
							doExpanded(false);
						}
					}else{
						///showNormal
						if(canPlay && self._playingCollapse){
							self._playing = self._playingCollapse(collapseParam());
						}else{
							setExpand(false);
							doExpanded(false);
						}
					}
				}else{
					///showNormal
					canPlay = self._started && self.animate;
					_playContent = true;
					if(oldState == intShowMax){
						///showMax
						if(canPlay && self._playingSize){
							self._playing = self._playingSize(sizeNormalParam());
						}else{
							doMax(false);
						}
					}else if(oldState == intCollapsed){
						///collapsed
						if(canPlay && self._playingExpand){
							self._playing = self._playingExpand(expandParam());
						}else{
							setExpand(true);
							doExpanded(true);
						}
					}else{
						///hide...
						if(canPlay && self._playingShow){
							self._playing = self._playingShow(showParam());
						}else{
							doShow(newState, 1);
						}
					}
				}
			}
			if(self._playing){
				if(!self._playingDeferred){
					self._playingDeferred = rias.newDeferred();
				}
				///直接 onEnd = _onEnd 会覆盖 _playing 原有的定义，应该用 aspect.after
				//self._playing.onEnd = _onEnd;
				self.own(self._playingEndHandle = rias.after(self._playing, "onEnd", _onEnd));
				//console.debug(this.id, self._playing);
				self._playing.play();
			}else{
				_onEnd();
			}
		},

		onHide: function(){
			return true;
		},
		_hide: function(newState){
			//this._wasShown = false;/// _wasShown 表示已经显示过了，而不是 showing
			newState = (arguments.length > 0 ? newState : displayStateInt(this.displayState));
			if(newState === intClosed){
				/// _close 调用了 destroy，需要等待 _playingDeferred 。
				this.defer(function(){
					this._close(newState);
				});
			}else if(newState === intTransparent){
				//this.onHide();
			}else{
				this._refreshDisplayState();
				this.onHide();
			}
		},
		hide: function(){
			return this.set("displayState", rias.riasw.layout.displayHidden);
		},

		onClose: function(){
			return true;
		},
		_onClose: function(){
			//return this.canClose == true && !this.get("modified") && (this.onClose() != false);/// _close 在 DialogPanel 中设置
			///this.onClose() 有可能是 promise，返回 this.onClose()
			var self = this,
				go = this.canClose != false && this.onClose();
			return rias.when(go).always(function(result){
				if(result != false && self.get("modified")){
					return rias.choose({
						//parent: rias.webApp,
						content: "是否放弃修改并退出？",
						caption: rias.i18n.action.choose,
						actionBar: [
							"btnYes",
							"btnNo"
						]
					}).whenClose(function(closeResult){
							return rias.closeResult.isOk(closeResult);
						});
				}
				return result;
			});
		},
		_close: function(){
			if(!this.isDestroyed(true)){
				this.destroyRecursive();
			}
		},
		close: function(){
			return this.set("displayState", rias.riasw.layout.displayClosed);
		},

		onShow: function(){
			//return true;
		},
		/*_onShow: function(){
			this.inherited(arguments);
		},*/
		_show: function(){
			this._wasShown = true;
			this._refreshDisplayState();
			this.whenPlayed(function(){
				this.onRestore.apply(this, []);
				this._onShow.apply(this, []);
			});
			return this.isShown();
		},
		show: function(){
			return this.set("displayState", rias.riasw.layout.displayShowNormal);
		},

		onRestore: function(){
		},
		_restore: function(){
			var self = this;
			///restore 时，_restore 先于 _show 执行，而在 _restore.then(比如 DialogPanel._restore) 中需要判断该值，故应设置该值。
			/// _show 是 Deferred，在 afterLoaded 之后执行。
			this._wasShown = true;
			this._refreshDisplayState();
			this.whenPlayed(function(){
				this.onRestore.apply(this, []);
			});
			return this.isShowNormal();
		},
		restore: function(forceVisible, child, _deep){
			var self = this;
			return this.inherited(arguments).always(function(){
				return self.set("displayState", rias.riasw.layout.displayShowNormal);
			}).then(function(result){
					self._wasShown = true;
					if(result != false){
						///可能之前已经是 panelManager.select 触发，即 self.selected 已经是 true，这里需要强行 select
						//self.focus();
						//if(!self.get("selected")){
							self.select(true);
						//}
					}
					return self;
				});
		},

		onExpand: function(){
		},
		_expand: function(){
			var dns = this.domNode.style,
				cpn = this.captionNode,
				mb = rias.dom.getMarginBorderBox(this.domNode);
			if(this._size0){
				if(this._size0.hasH){
					dns.height = (this._size0.h - mb.h) + "px";
				}else{
					dns.height = "";
				}
				if(this._size0.hasW){
					dns.width = (this._size0.w - mb.w) + "px";
				}else{
					dns.width = "";
				}
			}
			this._refreshDisplayState();
			this.whenPlayed(function(){
				this.onExpand.apply(this, []);
			});
			return this.isShowNormal();
		},
		expand: function(){
			return this.set("displayState", rias.riasw.layout.displayShowNormal);
		},

		onCollapse: function(){
		},
		_collapse: function(){
			var dns = this.domNode.style,
				cpn = this.captionNode;
			this._size0.hasH = (dns.height !== "" && dns.height !== "auto");
			this._size0.hasW = (dns.width !== "" && dns.width !== "auto");
			this._refreshDisplayState();
			this.whenPlayed(function(){
				this.onCollapse.apply(this, []);
			});
			return this.isCollapsed();
		},
		collapse: function(){
			return this.set("displayState", rias.riasw.layout.displayCollapsed);
		},
		//shrink: function(){
		//	this.set("displayState", rias.riasw.layout.displayCollapsed);
		//	if(this._playingDeferred){
		//		return this._playingDeferred;
		//	}
		//	return true;
		//},

		onShowMax: function(){
		},
		_showMax: function(){
			this._handleOnScroll();
			this._refreshDisplayState();
			this.whenPlayed(function(){
				this.onShowMax.apply(this, []);
			});
			return this.isShowMax();
		},
		showMax: function(){
			return this.set("displayState", rias.riasw.layout.displayShowMax);
		},

		isDisplayState: function(state){
			switch(state){
				case intShowNormal://1:
				case displayShowNormal://1:
					return this.displayState === rias.riasw.layout.displayShowNormal;
				case intHidden://0:
				case displayHidden://0:
					return this.displayState === rias.riasw.layout.displayHidden
						|| this.displayState === rias.riasw.layout.displayClosed
						|| (this.dockTo && this.displayState === rias.riasw.layout.displayCollapsed);
				case intClosed://-1:
				case displayClosed://-1:
					return this.displayState === rias.riasw.layout.displayClosed;
				case intTransparent://-2:
				case displayTransparent://-2:
					return this.displayState === rias.riasw.layout.displayTransparent;
				case intShowMax://2:
				case displayShowMax://2:
					return this.displayState === rias.riasw.layout.displayShowMax;
				case intCollapsed://3:
				case displayCollapsed://3:
					return (this.displayState === rias.riasw.layout.displayCollapsed)
						|| (this.dockTo && this.displayState === rias.riasw.layout.displayHidden);
				default:
					return false;
			}
		},
		isShowNormal: function(){
			return this.isDisplayState(rias.riasw.layout.displayShowNormal);
		},
		isShowMax: function(){
			return this.isDisplayState(rias.riasw.layout.displayShowMax);
		},
		isCollapsed: function(){
			return this.isDisplayState(rias.riasw.layout.displayCollapsed);
		},
		isShown: function(excludeWasShown, excludeCollapsed){
			return (excludeWasShown || !!this._wasShown) &&
				(this.displayState == rias.riasw.layout.displayShowNormal || this.displayState == rias.riasw.layout.displayShowMax
					|| (!excludeCollapsed && this.displayState == rias.riasw.layout.displayCollapsed));
		},
		isHidden: function(){
			return this.isDisplayState(rias.riasw.layout.displayHidden);
		},
		isClosed: function(){
			return this.isDisplayState(rias.riasw.layout.displayClosed);
		},
		isTransparent: function(){
			return this.isDisplayState(rias.riasw.layout.displayTransparent);
		}

	});

	rias.riasw.layout.displayShowNormal = displayShowNormal;
	rias.riasw.layout.displayShowMax = displayShowMax;
	rias.riasw.layout.displayCollapsed = displayCollapsed;
	rias.riasw.layout.displayHidden = displayHidden;
	rias.riasw.layout.displayClosed = displayClosed;
	rias.riasw.layout.displayTransparent = displayTransparent;
	rias.riasw.layout.displayStateInt = displayStateInt;
	rias.riasw.layout.displayStateStr = displayStateStr;

	Widget.ChildWidgetProperties = {
		region: '',
		//layoutAlign: '',
		layoutPriority: 0,

		splitter: false
	};

	//_Widget.extend(/*===== {} || =====*/ Widget.ChildWidgetProperties);

	return Widget;

});
