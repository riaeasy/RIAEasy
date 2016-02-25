
//RIAStudio client runtime widget - _PanelBase

define([
	"rias",
	"dijit/_Widget",
	"dijit/_Container",
	"dijit/_Contained",
	"dijit/_CssStateMixin",
	"dijit/_TemplatedMixin",
	"rias/riasw/layout/_Gutter",
	"rias/riasw/layout/_Splitter",
	"rias/riasw/layout/ToggleSplitter"
], function(rias, _Widget, _Container, _Contained, _CssStateMixin, _TemplatedMixin, _Gutter, _Splitter, ToggleSplitter){

	var _cnt = 0;

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
		if(displayState === displayHidden || displayState === intHidden){
			return intHidden;//0;
		}else if(displayState === displayClosed || displayState === intClosed){
			return intClosed;//-1;
		}else if(displayState === displayTransparent || displayState === intTransparent){
			return intTransparent;//-2;
		}else if(displayState === displayShowMax || displayState === intShowMax){
			return intShowMax;//2;
		}else if(displayState === displayCollapsed || displayState === intCollapsed){
			return intCollapsed;//3;
		}
		return intShowNormal;
	}
	function displayStateStr(displayState){
		switch(displayState){
			case intHidden://0:
				return displayHidden;
			case intClosed://-1:
				return displayClosed;
			case intTransparent://-2:
				return displayTransparent;
			case intShowMax://2:
				return displayShowMax;
			case intCollapsed://3:
				return displayCollapsed;
			default:
				return displayShowNormal;
		}
	}

	rias.theme.loadCss([
		//"layout/Splitter.css",
		"layout/Panel.css"
	]);

	var riasType = "rias.riasw.layout._PanelBase";
	var Widget = rias.declare(riasType, [_Widget, _Container, _Contained, _CssStateMixin], {

		gutters: false,
		liveSplitters: false,
		splitterClass: null,//ToggleSplitter,//Splitter

		baseClass: "riaswPanel",

		tabIndex: "0",

		//minHeight: 0,
		//minWidth: 0,
		minSize: {
			w: 0,
			h: 0
		},
		maxSize: {
			w: 0,
			h: 0
		},
		_captionHeight: 28,///FIXME:zensst.修改为 "2em"
		//_actionBarHeight: 0,
		collapsedWidth: 0,
		//toggleSplitterCollapsedSize: "2em",
		//maxPadding: 60,
		restrictPadding: 0,
		// doLayout: Boolean
		//		- false - don't adjust size of children
		//		- true - if there is a single visible child widget, set it's size to however big the _Panel is
		//doLayout: true,/// false 相当于 autoSize
		// isLayoutContainer: [protected] Boolean
		//		Indicates that this widget will call resize() on it's child widgets
		//		when they become visible.
		isLayoutContainer: true,
		//design: "headline",

		//movable: false,
		//resizable: "",
		animated: false,

		//_canClose: false,

		//displayState: displayShowNormal,
		initDisplayState: displayShowNormal,
		initDisplayBox: null,

		cookieName: "",
		persist: false,

		postMixInProperties: function(){
			// change class name to indicate that BorderContainer is being used purely for
			// layout (like LayoutContainer) rather than for pretty formatting.
			//if(!this.gutters){
			//	this.baseClass += "NoGutter";
			//}
			this.inherited(arguments);
		},

		buildRendering: function(){
			this._beforeUpdateSize(this.id + " - buildRendering.");
			this.inherited(arguments);

			///没有 template 时，显式设置 focusNode。
			if(!this.focusNode){
				this.focusNode = this.containerNode;
			}

			if(this.minSize.w > 0){
				rias.dom.setStyle(this.domNode, "min-width", this.minSize.w);
			}
			if(this.minSize.h > 0){
				rias.dom.setStyle(this.domNode, "min-height", this.minSize.h);
			}
			if(this.maxSize.w > 0){
				rias.dom.setStyle(this.domNode, "max-width", this.maxSize.w);
			}
			if(this.maxSize.h > 0){
				rias.dom.setStyle(this.domNode, "max-height", this.maxSize.h);
			}

		},
		postCreate: function(){
			var self = this;
			//self.domNode.style.position = "absolute";
			///没有 template 时，显式设置 focusNode。
			//if(!self.focusNode){
			//	self.focusNode = self.containerNode;
			//}
			rias.forEach(self.baseClass.split(","), function(c){
				rias.dom.addClass(self.containerNode, c + "Content");
			});

			//self._onMinSize(this.minSize);
			//self._onMaxSize(this.maxSize);
			self.inherited(arguments);
			///这里 _initAttr，避免初始化时执行，如果需要初始化，可以在 postCreate 中显式执行初始化。
			this._initAttr([{
				name: "displayState",
				initialize: false///在 startup 中用 initDisplayState 初始化
			}, "minSize", "maxSize", {
				name: "restrictPadding",
				initialize: false
			}, {
				name: "riasrParentNode",
				initialize: true
			}]);
			//self._onParentNodeChanged();
		},
		destroyRecursive: function(/*Boolean*/ preserveDom){
			// summary:
			//		Destroy the ContentPane and its contents

			// if we have multiple controllers destroying us, bail after the first
			if(this._beingDestroyed){
				return;
			}
			rias.forEach(this.getChildren(), function(child){
				if(child._splitterWidget){
					child._splitterWidget.destroy();
				}
				delete child._splitterWidget;
			});
			this.inherited(arguments);
		},
		destroy: function(){//FIXME:zensst. dojo 2.0 才开始支持 destroyRecursive()，目前只 destroy 自身.
			if(this._onScrollHandle){
				rias.destroy(this._onScrollHandle);
				delete this._onScrollHandle;
			}
			if(this._onResizeHandle){
				rias.destroy(this._onResizeHandle);
				delete this._onResizeHandle;
			}
			this._stopPlay();
			//delete this._playingDeferred;
			this.inherited(arguments);
		},

		startup: function(){
			if(this._started){
				return;
			}
			this.inherited(arguments);
			this._loadFromCookie();

			this._afterUpdateSize(this.id + " - startup.");
			//this._onDisplayState(this.initDisplayState || displayShowNormal);
			this.set("displayState", this.initDisplayState || displayShowNormal);
		},

		_beforeUpdateSize: function(id){
			this.__updateSize ? this.__updateSize++ : this.__updateSize = 1;
			this.__updateSizes ? this.__updateSizes.push(id) : (this.__updateSizes = []).push(id);
		},
		_afterUpdateSize: function(id, doResize){
			this.__updateSize ? this.__updateSize-- : this.__updateSize = 0;
			this.__updateSizes ? this.__updateSizes.pop(id) : this.__updateSizes = [];
			///不建议自动 resize。
			//if(doResize && !this.__updateSize){
			//	this._internalResize(this._changeSize, this._resultSize);
			//}
		},

		_handleOnScroll: function(){
			var self = this;
			if(this._onScrollHandle){
				rias.destroy(this._onScrollHandle);
				delete this._onScrollHandle;
			}
			if(this.domNode.parentNode && this.restrictPadding > 0){
				this.own(this._onScrollHandle = rias.on(this.domNode.parentNode, "scroll", function(){
					//_cnt++;
					//console.debug(self.id, _cnt, "parentScroll");
					//rias.debounce(this.id + "_onScroll", function(){
					if(!self._riasrDestroying && !self._beingDestroyed){
						self.resize();
					}
					//}, this, 800)();
				}));
			}
		},
		_onMinSize: function(value, oldValue){
			if(!rias.objContains(this.minSize, value)){
				this.minSize = rias.mixinDeep(this.minSize, {
					w: value.w,
					h: value.h
				});
				this.set("style", {
					"min-width": this.minSize.w > 0 ? this.minSize.w + "px" : "",
					"min-height": this.minSize.h > 0 ? this.minSize.h + "px" : ""
				});
				this._internalResize();
			}
		},
		_onMaxSize: function(value, oldValue){
			if(!rias.objContains(this.maxSize, value)){
				this.maxSize = rias.mixinDeep(this.maxSize, {
					w: value.w,
					h: value.h
				});
				this.set("style", {
					"max-width": this.maxSize.w > 0 ? this.maxSize.w + "px" : "",
					"max-height": this.maxSize.h > 0 ? this.maxSize.h + "px" : ""
				});
				this._internalResize();
			}
		},
		_onRestrictPadding: function(value, oldValue){
			this.restrictPadding = (value >= 0 ? value : 0);
			this._handleOnScroll();
			if(this._started){
				this._internalResize(this._changeSize, this._resultSize);
			}
		},

		//_setFocusedAttr: function(value){
		//	console.debug(this.id, "focused", value);
		//	this.inherited(arguments);
		//},

		//_onParentNodeChanged: function(){
		_onRiasrParentNode: function(){
			if(this._riasrDestroying || this._beingDestroyed){
				return;
			}
			var self = this,
				parent = this.getParent();

			this._childOfLayoutWidget = parent && parent.isLayoutContainer;
			//this._needResize = !this._childOfLayoutWidget;

			if(this._onResizeHandle){
				rias.destroy(this._onResizeHandle);
				delete this._onResizeHandle;
			}
			if(!this._childOfLayoutWidget){
				this.own(this._onResizeHandle = rias.dom.Viewport.on("resize", function(){
					_cnt++;
					rias.debounce(self.id + "_onViewportResize", function(){
						//console.debug(self.id, _cnt, "resize");
						//console.trace();
						if(!self._riasrDestroying && !self._beingDestroyed){
							self.resize();
						}
					}, self, 200, function(){
						//console.debug(self.id, _cnt, "resizePass");
						//console.trace();
					})();
				}));
			}
			this._handleOnScroll();

			if(this._started){
				this._internalResize(this._changeSize, this._resultSize);
			}
		},

		_loadFromCookie: function(){
			var a;
			this._size0 = rias.mixin(this._size0, this.initDisplayBox || {});
			if(this.persist && this.cookieName){
				var c = rias.cookie(this.cookieName);
				try{
					c = rias.fromJson(c);
				}catch(error){
					c = undefined;
				}
				(c && c.s) && rias.mixin(this._size0, c.s);
				//this._internalResize(this._size0 || this._changeSize, this._resultSize);
				a = (c && c.a) ? Widget.displayStateStr(c.a) : this.displayState ? this.displayState : Widget.displayShowNormal;
			}else{
				//delete this._size0;// = rias.dom.getMarginBox(this.domNode);
				a = this.displayState;
			}
			//if(a < 0){
			//	a = 2;
			//}
			//this._displayState0 = a;
			//this.adjustSize();
			//this.layout();
			//this._playAni(a);
			this.set("displayState", a);
			if(this._playingDeferred){
				return this._playingDeferred;
			}
			return true;
		},
		_saveToCookie: function(){
			if(this.persist && this._started){
				var c = {
					s: this._size0,
					//a: (this._displayState0 >= 0) ? this._displayState0 : this.__state0
					a: Widget.displayStateInt(this.displayState)
				};
				if(!this.cookieName){
					console.error(this.id + ": Persist the widget requires define the cookieName.");
				}else{
					rias.cookie(this.cookieName, rias.toJson(c), {expires:365});
				}
				//if(rias.isDebug){
				//	console.debug(rias.toJson(c));
				//}
			}
		},

		_getFocusItems: function(){
			var elems = rias.a11y._getTabNavigable(this.domNode);
			this._firstFocusNode = elems.lowest || elems.first || this.closeButtonNode || this.domNode;
			this._lastFocusNode = elems.last || elems.highest || this._firstFocusNode;
		},
		focus: function(){
			this._getFocusItems();
			rias.dom.focus(this._firstFocusNode);
		},

		/*_isShown: function(){
			/// isShown 只判断自己是否可见
			///self 可能是 StackContainer.child，可能在不可见 页，所以不要判断 parent 的可见性。
			//var node = this.domNode;
			//return this._wasShown && this._isVisible();
			return this._wasShown && rias.dom.isVisible(this);
		},*/
		_isVisible: function(){
			/// isVisible 需要判断 parent 是否可见
			///? self 可能是 StackContainer.child，可能在不可见 页，所以不要判断 parent 的可见性。
			var node = this.domNode,
			//parent = this.domNode.parentNode,
			//v = (node.style.display != 'none') && (node.style.visibility != 'hidden') && !rias.dom.hasClass(node, "dijitHidden") &&
			//	parent && parent.style && (parent.style.display != 'none');
				v = node.parentNode && rias.dom.isVisible(node);
			while(v && (node = node.parentNode)){
				v = rias.dom.isVisible(node);
			}
			return !!v;
		},
		getChildren: function(){
			// Override _LayoutWidget.getChildren() to only return real children, not the splitters.
			return rias.filter(this.inherited(arguments), function(widget){
				return !widget._isSplitter;
			});
		},
		_getOrderedChildren: function(){
			var self = this,
				wrappers = rias.map(this.getChildren(), function(child, idx){
					if(self._needResize){
						child._needResize = true;
					}
					return {
						panel: child,
						weight: [
							child.region == "center" ? Infinity : 0,
							child.layoutPriority,
							(this.design == "sidebar" ? 1 : -1) * (/top|bottom/.test(child.region) ? 1 : -1),
							idx
						]
					};
				}, this);
			wrappers.sort(function(a, b){
				var aw = a.weight, bw = b.weight;
				for(var i = 0; i < aw.length; i++){
					if(aw[i] != bw[i]){
						return aw[i] - bw[i];
					}
				}
				return 0;
			});
			return rias.map(wrappers, function(w){
				return w.panel;
			});
		},
		_layoutChildren: function(/*String?*/ changedChildId, /*Number?*/ changedChildSize){
			var cn = this.containerNode,
				vf,
				vfx,
				vfy;
			var childrenAndSplitters = [];
			rias.forEach(this._getOrderedChildren(), function(pane){
				childrenAndSplitters.push(pane);
				if(pane._splitterWidget){
					childrenAndSplitters.push(pane._splitterWidget);
				}
			});
			vf = rias.dom.getStyle(cn, "overflow");
			vfx = rias.dom.getStyle(cn, "overflow-x");
			vfy = rias.dom.getStyle(cn, "overflow-y");
			rias.dom.setStyle(cn, "overflow", "hidden");

			///不要传 this._contentBox，避免被修改
			rias.dom.layoutChildren(cn, this._contentBox ? {
				t: Math.floor(this._contentBox.t),
				l: Math.floor(this._contentBox.l),
				w: Math.floor(this._contentBox.w),
				h: Math.floor(this._contentBox.h)
			} : undefined, childrenAndSplitters, changedChildId, changedChildSize);

			if(vf !== undefined){
				rias.dom.setStyle(cn, "overflow", vf);
			}else{
				if(vfx !== undefined){
					rias.dom.setStyle(cn, "overflow-x", vfx);
				}
				if(vfy !== undefined){
					rias.dom.setStyle(cn, "overflow-y", vfy);
				}
			}
		},
		beforeLayout: function(needLayout){
			return needLayout;
		},
		_beforeLayout: function(){
			var box,
				dom = rias.dom,
				node = this.domNode,
				ns = node.style,
				cs = dom.getComputedStyle(node),
			//h,
				rg = this.region,
				noheight = (ns.height == "" && rg !== "left" && rg !== "right" && rg !== "center"),
				nowidth = (ns.width == "" && rg !== "top" && rg !== "bottom" && rg !== "center");
			function _getBox(b){
				return b ? {
					t: b.t,
					l: b.l,
					w: nowidth ? undefined : b.w,
					h: noheight ? undefined : b.h
				} : {};
			}
			if(rg || !noheight || !nowidth){
				//if(rg || ns.height !== ""){
				var cn = this.containerNode;
				if(cn === node){
					box = box || dom.getMarginBox(node, cs);
					box = dom.marginBox2contentBox(node, box, cs);
				}else{
					box = dom.getContentBox(node, cs);
					if(!noheight){
						//h = (this.showCaption && this.captionNode ? this._captionHeight = rias.dom.getMarginBox(this.captionNode).h : this._captionHeight = 0);
						/*h = (this.showCaption && this.captionNode ?
							//this._captionHeight = rias.dom.getMarginBox(this.captionNode)[(this.region == "left" || this.region == "right") ? "h" : "w"] :
							this._captionHeight = rias.dom.getMarginBox(this.captionNode).h :
							this._captionHeight = 0);*/
						box.h -= this._captionHeight;
						box.h -= ("fixedHeaderHeight" in this ? this.fixedHeaderHeight : 0);
						box.h -= ("fixedFooterHeight" in this ? this.fixedFooterHeight : 0);
					}
					if(this.wrapperNode){
						cs = dom.getComputedStyle(this.wrapperNode);
						dom.setMarginBox(this.wrapperNode, _getBox(box), cs);
						box = dom.marginBox2contentBox(this.wrapperNode, box, cs);
					}
					if(!noheight){
						if(this._actionBar){
							box.h -= rias.dom.getMarginBox(this._actionBar.domNode).h;
						}
					}
					cs = dom.getComputedStyle(cn);
					dom.setMarginBox(cn, _getBox(box), cs);
					///由于在缩小的时候，有 overflow 存在，重新获取 box 的话，导致 _contentBox 失真
					///box = dom.getContentBox(cn);
					box = dom.marginBox2contentBox(cn, box, cs);
				}
			}else{
				box = undefined;
			}
			if(!box || !this._contentBox || Math.abs(box.l - this._contentBox.l) > 0.5 || Math.abs(box.t - this._contentBox.t) > 0.5 ||
				Math.abs(box.w - this._contentBox.w) > 0.5 || Math.abs(box.h - this._contentBox.h) > 0.5){
				////if(this.needLayout || !box || !this._contentBox || box.w != this._contentBox.w || box.h != this._contentBox.h){
				this._contentBox = box;//_getBox(box);
				this.needLayout = true;
			}
			return this.beforeLayout(this.needLayout || this._needResize);
		},
		afterLayout: function(){
		},
		layout: function(/*String?*/ changedChildId, /*Number?*/ changedChildSize){
			if(this._riasrDestroying || this._beingDestroyed){
				return;
			}
			var self = this,
				cn = this.containerNode,
				v,// = (this.isLoaded != false) && !this.__updateSize && this._isVisible(),
				vf,
				vfx,
				vfy;
			v = this._started && !this.__updateSize && this._isVisible();
			if(!v){
				this._needResize = true;
				return;
			}
			//if(!this._isShown()){
			//	this.needLayout = true;
			//	return;
			//}
			if(v = this._beforeLayout()){
				this._layoutChildren(changedChildId, changedChildSize);

				this.needLayout = false;
				this._needResize = false;

				this.afterLayout();
			}
			return v;
		},
		beforeResize: function(){
		},
		afterResize: function(){
		},
		_internalResize: function(changeSize, resultSize){
			//_cnt++;
			//console.debug(this.id, _cnt, "resize in.");
			var r;
			if(this._riasrDestroying || this._beingDestroyed){
				//console.debug(c, this.id, "resize out:", r);
				return;
			}
			var v,// = (this.isLoaded != false) && !this.__updateSize && this._isVisible(),
			//s, pb,
				box,
				dom,
				ns,
			//cs,
			//h,
				isV = (this.region == "left" || this.region == "right"),
				node;
			v = this._started && !this.__updateSize && this._isVisible();
			if(!v){
				this._needResize = true;
				this._changeSize = rias.mixin(this._changeSize, changeSize);
				this._resultSize = rias.mixin(this._resultSize, resultSize);
				//console.debug(c, this.id, "resize out:", r);
				return;
			}
			this._wasResized = true;
			box = resultSize || {};

			this.beforeResize();
			dom = rias.dom;
			node = this.domNode;
			ns = node.style;
			//cs = dom.getComputedStyle(node);
			//pb = (dom.boxModel == "border-box" ? {w:0, h:0} : dom.getPadBorderExtents(node, cs));
			box = rias.mixin(this._changeSize, changeSize, box);
			delete this._changeSize;
			delete this._resultSize;
			if(!isNaN(box.l) || !isNaN(box.t) || box.w >= 0 || box.h >= 0){
				dom.setMarginBox(node, box);
			}

			box = dom.getMarginBox(node);
			if(this._checkRestrict(box)){
				dom.setMarginBox(node, box);
			}
			if(this.displayState === Widget.displayCollapsed){
				///这里处理可以防止 move 和 resize 的时候改变，同时允许先改变 大小 和 约束
				if(isV){
					ns.width = this._captionHeight + "px";
					if(this.showCaption && this.captionNode){
						rias.dom.setMarginBox(this.captionNode, {
							w: this._captionHeight,
							h: dom.marginBox2contentBox(node, box).h
						});
					}
				}else if(this.region == "top" || this.region == "bottom"){
					ns.height = this._captionHeight + "px";
				}else{
					ns.height = this._captionHeight + "px";
					if(this.collapsedWidth > 60){
						ns.width = this.collapsedWidth + "px";
					}else if(this._size0 && this._size0.w > 0){
						ns.width = (this._size0.w - rias.dom.getMarginBorderBox(node).w) + "px";
					}
				}
			}else{
				if(this.showCaption && this.captionNode){
					this._captionHeight = rias.dom.getMarginBox(this.captionNode).h;
				}else{
					this._captionHeight = 0;
				}
				///TODO:zensst.由于 container 是动态的、自动布局的，设置后不能自动布局。
				//if(this.displayState === Widget.displayShowNormal && this._isVisible()){
				if(this.displayState === Widget.displayShowNormal){
					//if(rg || ns.height !== "" || ns.width !== ""){
					if(!rias.objContains(this._size0, box)){
						this._size0 = rias.mixinDeep(this._size0, box);
						this._saveToCookie();
					}
				}

				r = (r = this.layout()) ? "layoutChildren" : "layout";
			}

			this.afterResize();
			//console.debug(c, this.id, "resize out:", r + " - " + rias.toJson(box));
			return;
		},
		_checkRestrict: function(box){
			var changed = false;
			if(this.minSize.h >= 0 && box.h < this.minSize.h){
				box.h = this.minSize.h;
				//changed = true;///防止自动布局时修改 style，改为设置 domNode 的 min-height
			}
			if(this.maxSize.h > 0 && box.h > this.maxSize.h){
				box.h = this.maxSize.h;
				//changed = true;
			}
			if(this.minSize.w >= 0 && box.w < this.minSize.w){
				box.w = this.minSize.w;
				//changed = true;
			}
			if(this.maxSize.w > 0 && box.w > this.maxSize.w){
				box.w = this.maxSize.w;
				//changed = true;
			}
			if(this.restrictPadding > 0 || this.isShowMax()){
				///TODO:zensst. 是否解耦 webApp?
				var r = (this.restrictPadding > 0 ? this.restrictPadding : 0),
					p = rias.dom.getContentBox(this.domNode.parentNode || (rias.webApp ? rias.webApp.domNode : rias.body(rias.doc)));
				///先判断 height，然后才能判断 top。
				if(box.h > p.h - r - r){
					box.h = p.h - r - r;
					changed = true;
				}
				if(box.t < p.st + r){
					box.t = p.st + r;
					changed = true;
				}
				if(box.t + box.h > p.h + p.st - r){
					box.t = p.h + p.st - box.h - r;
					changed = true;
				}
				if(box.w > p.w - r - r){
					box.w = p.w - r - r;
					changed = true;
				}
				if(box.l < p.sl + r){
					box.l = p.sl + r;
					changed = true;
				}
				if(box.l + box.w > p.w + p.sl - r){
					box.l = p.w + p.sl - box.w - r;
					changed = true;
				}
			}

			return changed;
		},
		_doRestrictResize: function(){
			var self = this;
			//rias.debounce(self.id + "_doRestrictResize", function(){
			if(self._riasrParent && self._riasrParent.resize){
				self._riasrParent.needLayout = true;
				self._riasrParent.resize();
			}else{
				self.resize();
			}
			//}, self, 350)();
		},
		resize: function(changeSize, resultSize){
			this._internalResize(changeSize, resultSize);
		},

		_resizeParent: function(){
			if(this._riasrParent && this._riasrParent.resize){
				this._riasrParent.needLayout = true;
				this._riasrParent.resize();
			}
		},

		///displayState:	1=shown(showNormal, restore, expand), 2=showMax, 3=collapsed(showMin, shrunk),
		//			0=hideen(display=none), -1=closed(destroy), -2=hideen(but display)
		_refreshDisplayState: function(){
			//this.needLayout = this._isShown();
			//this._internalResize(this._changeSize, this._resultSize);
		},
		onDisplayStateChanging: function(value, oldValue){
			return value;
		},
		onDisplayStateChanged: function(value){},
		_onDisplayState: function(value, oldValue){
			var self = this;
			if(rias.isNumber(value)){
				value = Widget.displayStateStr(value);
			}
			value = self.onDisplayStateChanging(value, oldValue);
			//if(this._started){
			return rias.when(self._doPlay(value), function(result){
				if(result){
					if(!self._riasrDestroying && !self._beingDestroyed){
						self._refreshDisplayState();
						self.onDisplayStateChanged(self.displayState);
						self._saveToCookie();
						if(self._playingDeferred){
							self._playingDeferred.resolve(self);
						}
					}
				}
			});
		},

		_playingHide: rias.fx.fadeOut,
		_playingShow: rias.fx.fadeIn,
		_playingCollapse: rias.fx.wipeOut,
		_playingExpand: rias.fx.wipeIn,
		_playingSize: rias.fx.sizeTo,

		duration: rias.defaultDuration * 2,

		_stopPlay: function(){
			if(this._playingEndHandle){
				this._playingEndHandle.remove();
				delete this._playingEndHandle;
			}
			if(this._playingDeferred){
			//	this._playingDeferred.cancel();
				delete this._playingDeferred;
			}
			if(this._playingContent){
				this._playingContent.stop();
				delete this._playingContent;
			}
			if(this._playing){
				this._playing.stop();
				delete this._playing;
			}
		},
		_doPlayContent: function(show){
			var self = this,
				df = rias.newDeferred(),
				cn = self.wrapperNode ? self.wrapperNode : self.containerNode,
				duration = self.duration;
			if(show == false){
				this._playingContent = this._playingHide({
					node: cn,
					duration: duration,
					beforeBegin: function(){
					},
					onEnd: function(){
						df.resolve();
					}
				});
			}else{
				this._playingContent = this._playingShow({
					node: cn,
					duration: duration,
					beforeBegin: function(){
						//self.needLayout = true;
						//self.layout();
					},
					onEnd: function(){
						df.resolve();
					}
				});
			}
			this._playingContent.play();
			return df;
		},
		_doPlay: function(newState, forcePlay){
			var self = this,
				df = rias.newDeferred(),
				canPlay = self._started && self.animated && self._isVisible(),
				oldState = self._displayState0,
				dn = self.domNode,
				cn = self.wrapperNode ? self.wrapperNode : self.containerNode,
				cpn = self.captionNode,
				duration = self.duration,
				parentSize = rias.dom.getContentBox(dn.parentNode || (rias.webApp ? rias.webApp.domNode : rias.body(rias.doc))),
				mb = rias.dom.getMarginBorderBox(dn),
				_playContent,
				r = (self.restrictPadding > 0 ? self.restrictPadding : 0),
				isV = (self.region == "left" || self.region == "right");

			function expandParam(){
				return {
					__fxparamname: "expandParam",
					node: dn,
					duration: duration,
					properties: {
						height: {
							start: isV ? undefined : (self.showCaption && cpn ? self._captionHeight : 0),
							end: isV ? undefined : self._size0 ? self._size0.h - mb.h : undefined
						},
						width: {
							start: isV ? (self.showCaption && cpn ? self._captionHeight : 0) : undefined,
							end: isV ? self._size0 ? self._size0.w - mb.w : undefined : undefined
						}
					},
					beforeBegin: function(){
						rias.dom.visible(cn, true);
						doExpanded(true);
					},
					onEnd: function() {
						self._resizeParent();
					}
				};
			}
			function collapseParam(){
				return {
					__fxparamname: "collapseParam",
					//node: cn,///不能用 domNode，因为 fx 最后会设置 node.display = none
					node: dn,
					duration: duration,
					properties: {
						height: {
							end: isV ? undefined : (self.showCaption && cpn ? self._captionHeight : 0)
						},
						width: {
							end: isV ? (self.showCaption && cpn ? self._captionHeight : 0) : undefined
						}
					},
					beforeBegin: function(){
					},
					onEnd: function(){
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
						if(!oldState || oldState <= intHidden || oldState === intShowMax){
							self._restore();
						}
						doShow(newState, 0);
					},
					onEnd: function(){
					}
				};
			}
			function sizeMAxParam(){
				return {
					__fxparamname: "sizeMAxParam",
					//method: "combine",
					node: dn,
					duration: duration * 1.5,
					properties: {
						top: {
							end: parentSize ? r > 0 ? parentSize.st + r : 0 : self._size0 ? self._size0.t : undefined
						},
						left: {
							end: parentSize ? r > 0 ? parentSize.sl + r : 0 : self._size0 ? self._size0.l : undefined
						},
						width: {
							end: parentSize ? r > 0 ? (parentSize.w - r - r - mb.w) : parentSize.w : self._size0 ? self._size0.w - mb.w : undefined
						},
						height: {
							end: parentSize ? r > 0 ? (parentSize.h - r - r - mb.h) : parentSize.h : self._size0 ? self._size0.h - mb.h : undefined
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
				return {
					__fxparamname: "sizeNormalParam",
					//method: "combine",
					node: dn,
					duration: duration * 1.5,
					//width: (self._size0 ? self._size0.w : undefined),
					//height: (self._size0 ? self._size0.h : undefined),
					properties: {
						top: {
							end: self._size0 ? self._size0.t : undefined
						},
						left: {
							end: self._size0 ? self._size0.l : undefined
						},
						width: {
							end: self._size0 ? self._size0.w - mb.w : undefined
						},
						height: {
							end: self._size0 ? self._size0.h - mb.h : undefined
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
					self._show(value);
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
			function doExpanded(value){
				value = !!value;
				//var dns = dn.style;
				rias.dom.visible(cn, value);
				rias.dom.visible(dn, true);

				if(cpn){
					var oldCls = self._captionClass;
					self._captionClass = self.baseClass + "CaptionNode" + (self.toggleable ? !value ? "Collapsed" : "Expanded" : "Fixed");
					rias.dom.replaceClass(cpn, self._captionClass, oldCls || "");
					rias.dom.toggleClass(cpn, "riaswDisplayVertical", isV && !value);
					rias.dom.toggleClass(cpn, "riaswTextVertical", isV && !value);
					///为了能穿透，riaswTextHorizontal 还是手动设置好些。
					///rias.dom.toggleClass(cpn, "riaswTextHorizontal", !isV || value);
					//if(self.showCaption){
					cpn.style.height = "";
					cpn.style.width = "";
					//}
				}
				if(value){
					self._expand();
				}else{
					self._collapse();
				}
			}
			var _nextState;
			function _onEnd(){
				if(self._riasrDestroying || self._beingDestroyed){
					return;
				}
				if(self._playingEndHandle){
					self._playingEndHandle.remove();
					delete self._playingEndHandle;
				}
				if(_nextState){
					df.resolve(false);
					self._doPlay(_nextState, true);
				}else{
					delete self._playing;///先 delete，df.resolve 中要检测
					df.resolve(self.displayState);
					if(_playContent && newState >= intHidden){
						self.defer(function(){
							self._doPlayContent();
						});
					}
				}
			}

			self._stopPlay();
			this._playingDeferred = rias.newDeferred();
			newState = Widget.displayStateInt(newState);
			if(self._riasrDestroying || self._beingDestroyed || !forcePlay && oldState === newState){
				df.resolve(false);
				return df.promise;
			}
			///onShow 等事件中需要使用 this.displayState，提前设置.
			self._displayState0 = newState;
			self.displayState = Widget.displayStateStr(newState);
			if(newState <= intHidden){
				///hide...
				if(canPlay && self._playingHide){
					self._playing = self._playingHide(hideParam());
				}else{
					doShow(newState);
				}
			}else{
				if(canPlay){
					//rias.dom.setStyle(dn, {
					//	//position: "absolute",
					//	//visiblity: "hidden",
					//	//display: "none",
					//	opacity: 0
					//});
				}
				if(newState == intShowMax){
					///showMax
					if(dn.parentNode){
						_playContent = true;
						if(oldState == intCollapsed){
							///collapsed
							if(canPlay && self._playingSize && self._playingExpand){
								//self._playing = rias.fx.chain([
								//	self._playingExpand(expandParam),
								//	self._playingSize(sizeMAxParam())
								//]);
								self._playing = self._playingExpand(expandParam);
								_nextState = "showMax";
							}else{
								doExpanded(true);
								doMax(true);
							}
						}else if(!oldState || oldState <= intHidden){
							///hide...
							if(canPlay && self._playingSize && self._playingShow){
								//self._playing = rias.fx.chain([
								//	self._playingShow(showParam()),
								//	self._playingSize(sizeMAxParam())
								//]);
								self._playing = self._playingShow(showParam());
								_nextState = "showMax";
							}else{
								self._restore();
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
							//self._playing = rias.fx.chain([
							//	self._playingSize(sizeNormalParam()),
							//	self._playingCollapse(collapseParam())
							//]);
							self._playing = self._playingSize(sizeNormalParam());
							_nextState = "collapsed";
						}else{
							doMax(false);
							doExpanded(false);
						}
					}else if(!oldState || oldState <= intHidden){
						///hide...
						if(canPlay && self._playingCollapse && self._playingShow){
							//self._playing = rias.fx.chain([
							//	self._playingShow(showParam()),
							//	self._playingCollapse(collapseParam())
							//]);
							self._playing = self._playingShow(showParam());
							_nextState = "collapsed";
						}else{
							self._restore();
							doShow(newState, 1);
							doExpanded(false);
						}
					}else{
						///showNormal
						if(canPlay && self._playingCollapse){
							self._playing = self._playingCollapse(collapseParam());
						}else{
							doExpanded(false);
						}
					}
				}else{
					///showNormal
					canPlay = self._started && self.animated;
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
							doExpanded(true);
						}
					}else{
						///hide...
						if(canPlay && self._playingShow){
							self._playing = self._playingShow(showParam());
						}else{
							self._restore();
							doShow(newState, 1);
						}
					}
				}
			}
			if(self._playing){
				//self._playing.onEnd = _onEnd;
				self.own(self._playingEndHandle = rias.after(self._playing, "onEnd", _onEnd));
				self._playing.onStop = function(){
					if(self._playingDeferred){
						self._playingDeferred.resolve(self);
					}
				};
				self._playing.play();
			}else{
				_onEnd();
			}
			df.then(function(result){
				//console.debug("played.");
				//delete self._playingDeferred;
			});
			return df.promise;
		},

		onHide: function(){
			return true;
		},
		_hide: function(newState){
			//this._wasShown = false;/// _wasShown 表示已经显示过了，而不是 showing
			newState = newState || this.displayState;
			if(newState === intClosed){
				this._close(newState);
			}else if(newState === intTransparent){
				//this.onHide();
			}else{
				this.onHide();
			}
			this._resizeParent();
		},
		hide: function(){
			this.set("displayState", Widget.displayHidden);
			if(this._playingDeferred){
				return this._playingDeferred;
			}
			return true;
		},

		onClose: function(closeResult){
			return this._canClose != false;/// _close 在 DialogPanel 中设置
		},
		_close: function(){
			if(this.onClose(this.closeResult)){
				if(!this._beingDestroyed){
					this.destroyRecursive();
				}
				return true;
			}
			return false;
		},
		close: function(){
			this.set("displayState", Widget.displayClosed);
			//if(this._playingDeferred){
			//	return this._playingDeferred;
			//}
			return true;
		},

		onShow: function(){
			//return true;
		},
		_onShow: function(){
			this.inherited(arguments);
		},
		_show: function(){
			this._wasShown = true;//this._isVisible();
			///需要计算 Height，用 _refreshDisplayState
			this._refreshDisplayState();///在 play.onEnd 中调用
			this._needResize = true;
			this._internalResize(this._changeSize, this._resultSize);
			this._onShow.apply(this, arguments);
			this._resizeParent();
			//this.focus();
			return this.isShown();
		},
		show: function(){
			this.set("displayState", Widget.displayShowNormal);
			if(this._playingDeferred){
				return this._playingDeferred;
			}
			return true;
		},

		onRestore: function(){
		},
		_restore: function(){
			///需要计算 Height，用 _refreshDisplayState
			this._refreshDisplayState();///在 play.onEnd 中调用
			this._needResize = true;
			this._internalResize(this._size0);
			this.onRestore.apply(this, arguments);
			this._resizeParent();
		},
		restore: function(){
			var self = this;
			this.set("displayState", Widget.displayShowNormal);
			if(this._playingDeferred){
				return this._playingDeferred;
			}else{
				return true;
			}
		},

		onExpand: function(){
		},
		_expand: function(){
			var dns = this.domNode.style,
				mb = rias.dom.getMarginBorderBox(this.domNode);
			if(this._size0){
				dns.width = (this._size0.w - mb.w) + "px";
				dns.height = (this._size0.h - mb.h) + "px";
			}
			///需要计算 Height，用 _refreshDisplayState
			this._refreshDisplayState();///在 play.onEnd 中调用
			this._needResize = true;
			this._internalResize();
			this.onExpand.apply(this, arguments);

			if(this._splitterWidget && rias.isFunction(this._splitterWidget._setStateAttr)){
				this._splitterWidget.set("state", "full");
			}else{
				this._resizeParent();
			}
		},
		expand: function(){
			this.set("displayState", Widget.displayShowNormal);
			if(this._playingDeferred){
				return this._playingDeferred;
			}
			return true;
		},

		onCollapse: function(){
		},
		_collapse: function(){
			var dns = this.domNode.style;
			//var h = (this.showCaption && this.captionNode ? rias.dom.getMarginBox(this.captionNode).h : 0);
			var h = (this.showCaption && this.captionNode ? this._captionHeight : 0);
			if(this.region == "left" || this.region == "right"){
				dns.width = h + "px";
			}else if(this.region == "top" || this.region == "bottom"){
				dns.height = h + "px";
			}else{
				dns.height = h + "px";
				if(this.collapsedWidth > 60){
					dns.width = this.collapsedWidth + "px";
				}else if(this._size0 && this._size0.w > 0){
					dns.width = (this._size0.w - rias.dom.getMarginBorderBox(this.domNode).w) + "px";
				}
			}
			///需要计算 Height，用 _refreshDisplayState
			this._refreshDisplayState();///在 play.onEnd 中调用
			this._needResize = true;
			this._internalResize();
			this.onCollapse.apply(this, arguments);

			if(this._splitterWidget && rias.isFunction(this._splitterWidget._setStateAttr)){
				this._splitterWidget.set("state", "collapsed");
			}else{
				this._resizeParent();
			}
		},
		collapse: function(){
			this.set("displayState", Widget.displayCollapsed);
			if(this._playingDeferred){
				return this._playingDeferred;
			}
			return true;
		},
		//shrink: function(){
		//	this.set("displayState", Widget.displayCollapsed);
		//	if(this._playingDeferred){
		//		return this._playingDeferred;
		//	}
		//	return true;
		//},

		onShowMax: function(){
		},
		_showMax: function(){
			this._handleOnScroll();
			///需要计算 Height，用 _refreshDisplayState
			this._refreshDisplayState();///在 play.onEnd 中调用
			this._needResize = true;
			this._internalResize();
			this.onShowMax.apply(this, arguments);
			this._resizeParent();
		},
		showMax: function(){
			this.set("displayState", Widget.displayShowMax);
			if(this._playingDeferred){
				return this._playingDeferred;
			}
			return true;
		},
		//maximize: function(){
		//	this.set("displayState", Widget.displayShowMax);
		//	if(this._playingDeferred){
		//		return this._playingDeferred;
		//	}
		//	return true;
		//},

		isShowNormal: function(){
			return this.displayState == Widget.displayShowNormal;
		},
		isShowMax: function(){
			return this.displayState == Widget.displayShowMax;
		},
		isCollapsed: function(){
			return this.displayState == Widget.displayCollapsed;
		},
		isShown: function(excludeShrink){
			return !!this._wasShown &&
				(this.displayState == Widget.displayShowNormal || this.displayState == Widget.displayShowMax
					|| (!excludeShrink && this.displayState == Widget.displayCollapsed));
		},
		isHidden: function(){
			return this.displayState == Widget.displayHidden;
		},
		isClosed: function(){
			return this.displayState == Widget.displayClosed;
		},
		isTransparent: function(){
			return this.displayState == Widget.displayTransparent;
		},

		_setupChild: function(/*dijit/_WidgetBase*/child, added, insertIndex){
			var self = this,
				region = child.region,
				ltr = child.isLeftToRight();
			if(region == "leading"){
				region = ltr ? "left" : "right";
			}
			if(region == "trailing"){
				region = ltr ? "right" : "left";
			}
			if(region){
				// Create draggable splitter for resizing pane,
				// or alternately if splitter=false but BorderContainer.gutters=true then
				// insert dummy div just for spacing
				/// 需要 rias.by(child.id + "_splitter")
				if(child._splitterWidget){
					rias.destroy(child._splitterWidget);
					delete child._splitterWidget;
				}
				if(region != "center" && (child.splitter || self.gutters) && !child._splitterWidget && !rias.by(child.id + "_splitter")){
					var Splitter = child.splitter ? self.splitterClass ? self.splitterClass : child.toggleable ? _Splitter : ToggleSplitter : _Gutter;
					if(rias.isString(Splitter)){
						Splitter = rias.getObject(Splitter);
					}
					var splitter = new Splitter({
						ownerRiasw: child,
						id: child.id + "_splitter",
						container: self,
						child: child,
						region: region,
						live: child.liveSplitters,
						minSize: child.minSize,
						maxSize: child.maxSize
					});
					splitter._isSplitter = true;
					child._splitterWidget = splitter;

					// Make the tab order match the visual layout by placing the splitter before or after the pane,
					// depending on where the splitter is visually compared to the pane.
					var before = region == "bottom" || region == (self.isLeftToRight() ? "right" : "left");
					rias.dom.place(splitter.domNode, child.domNode, before ? "before" : "after");

					// Splitters aren't added as Contained children, so we need to call startup explicitly
					splitter.startup();
				}
			}
			if(added){
				rias.dom.addClass(child.domNode, self.baseClass + "-child " + (child.baseClass ? self.baseClass + "-" + child.baseClass : ""));
				//rias.dom.addClass(child.domNode, self.baseClass + "Pane");
			}else if(added == false){
				rias.dom.removeClass(child.domNode, self.baseClass + "-child " + (child.baseClass ? self.baseClass + "-" + child.baseClass : ""));
				//rias.dom.removeClass(child.domNode, self.baseClass + "Pane");

				///不应该设置 style
				/*rias.dom.setStyle(child.domNode, {
					top: "auto",
					bottom: "auto",
					left: "auto",
					right: "auto",
					position: "absolute"///"static"
				});
				rias.dom.setStyle(child.domNode, /top|bottom/.test(child.region) ? "width" : "height", "auto");*/
			}

			this.inherited(arguments);

			///FIXME:zensst. playing 时如何处理，参见 dijit.TitlePane._setContentAttr
			if(self._started){
				/// self._isVisible 在 resize 中判断
				/*if(child._isShown && child._isShown()){
					self.needLayout = true;
					if(child.region || child.layoutAlign){
						self.resize();
						//self.layout();
					}else{
						self.resize();
					}
				}*/
				self.needLayout = true;
				//rias.debounce(this.id + "_setupChild", function(){
				//	self.resize();
				//}, self, 300)();
				if(child.region || child.layoutAlign){
					//self.resize();
					self.layout();
				}else{
					self.resize();
				}
			}
		},
		onAddChild: function(child, insertIndex){
		},
		addChild: function(/*dijit/_WidgetBase*/ child, /*Integer?*/ insertIndex){
			this.onAddChild.apply(this, arguments);
			this.inherited(arguments);
		},
		onRemoveChild: function(child){
		},
		removeChild: function(/*dijit/_WidgetBase*/ child){
			this.onRemoveChild(arguments);
			this.inherited(arguments);
			if(child && child._splitterWidget){
				rias.destroy(child._splitterWidget);
				delete child._splitterWidget;
			}
		}

	});

	Widget.displayShowNormal = displayShowNormal;
	Widget.displayShowMax = displayShowMax;
	Widget.displayCollapsed = displayCollapsed;
	Widget.displayHidden = displayHidden;
	Widget.displayClosed = displayClosed;
	Widget.displayTransparent = displayTransparent;
	Widget.displayStateInt = displayStateInt;
	Widget.displayStateStr = displayStateStr;

	Widget.ChildWidgetProperties = {
		region: '',
		//layoutAlign: '',
		layoutPriority: 0,

		splitter: false
	};
	Widget._Splitter = ToggleSplitter;
	Widget._Gutter = _Gutter;

	rias.extend(_Widget, /*===== {} || =====*/ Widget.ChildWidgetProperties);

	return Widget;

});
