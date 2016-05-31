
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

	rias.theme.loadRiasCss([
		"layout/Panel.css",
		"layout/CaptionPanel.css",
		"layout/AccordionPanel.css",
		"layout/TabPanel.css",
		"layout/TablePanel.css",
		"layout/DockBar.css",
		"layout/Underlay.css"
	]);

	var riasType = "rias.riasw.layout._PanelBase";
	var Widget = rias.declare(riasType, [_Widget, _Container, _Contained, _CssStateMixin], {

		gutters: false,
		liveSplitters: false,
		splitterClass: null,//ToggleSplitter,//Splitter

		baseClass: "riaswPanel",

		//tabIndex: "0",
		//_setTabIndexAttr: ["domNode"],

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
		restrictPadding: -1,
		/*fixed: {
			top: "12px",
			left: "70%",
			bottom: "30em",
			right: "0"
		},*/
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
		animate: false,

		_focusStack: false,

		//canClose: true,

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
			this._size0 = {};
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
			if(this.isDestroyed(false)){
				return;
			}
			rias.forEach(this.getChildren(), function(child){
				if(child._splitterWidget){
					child._splitterWidget.destroy();
				}
				child._splitterWidget = undefined;
			});
			this.inherited(arguments);
		},
		destroy: function(){//FIXME:zensst. dojo 2.0 才开始支持 destroyRecursive()，目前只 destroy 自身.
			if(this._onScrollHandle){
				rias.destroy(this._onScrollHandle);
				this._onScrollHandle = undefined;
			}
			if(this._onResizeHandle){
				rias.destroy(this._onResizeHandle);
				this._onResizeHandle = undefined;
			}
			this._stopPlay();
			//this._playingDeferred = undefined;
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
			this._loadFromCookie();

			this._afterUpdateSize(this.id + " - startup.");
			//this._onDisplayState(this.initDisplayState || displayShowNormal);
			this.set("displayState", this.initDisplayState || displayShowNormal);
		},

		_beforeUpdateSize: function(id){
			this.__updateSize ? this.__updateSize++ : this.__updateSize = 1;
			if(!id){
				id = this.id + " - _updateSize."
			}
			this.__updateSizes ? this.__updateSizes.push(id) : (this.__updateSizes = []).push(id);
		},
		_afterUpdateSize: function(id, doResize){
			this.__updateSize ? this.__updateSize-- : this.__updateSize = 0;
			if(!id){
				id = this.id + " - _updateSize."
			}
			this.__updateSizes ? this.__updateSizes.pop() : this.__updateSizes = [];
			///不建议自动 resize。
			if(doResize && !this.__updateSize){
				this._internalResize();
			}
		},

		_handleOnScroll: function(){
			var self = this;
			if(this._onScrollHandle){
				rias.destroy(this._onScrollHandle);
				this._onScrollHandle = undefined;
			}
			if(this.domNode.parentNode && this.restrictPadding >= 0){
				this._onScrollHandle = rias.on(this.domNode.parentNode, "scroll", function(){
					//_cnt++;
					//console.debug(self.id, _cnt, "parentScroll");
					rias.debounce(self.id + "_onScroll", function(){
						if(!self.isDestroyed(true, true)){
							self.resize();
						}
					}, self, 150)();
				});
			}
		},
		_onMinSize: function(value, oldValue){
			rias.dom.setStyle(this.domNode, {
				"min-width": !this.toggleable && value.w > 0 ? value.w + "px" : "",
				"min-height": !this.toggleable && value.h > 0 ? value.h + "px" : ""
			});
			if(!rias.objLike(value, oldValue)){
				this.minSize = rias.mixinDeep(this.minSize, {
					w: value.w,
					h: value.h
				});
				this._internalResize();
			}
		},
		_onMaxSize: function(value, oldValue){
			rias.dom.setStyle(this.domNode, {
				"max-width": !this.toggleable && value.w > 0 ? value.w + "px" : "",
				"max-height": !this.toggleable && value.h > 0 ? value.h + "px" : ""
			});
			if(!rias.objLike(value, oldValue)){
				this.maxSize = rias.mixinDeep(this.maxSize, {
					w: value.w,
					h: value.h
				});
				this._internalResize();
			}
		},
		_onRestrictPadding: function(value, oldValue){
			this.restrictPadding = value;//(value >= 0 ? value : 0);
			this._handleOnScroll();
			if(this._started){
				this._internalResize(this._changeSize, this._resultSize);
			}
		},

		//_onParentNodeChanged: function(){
		_onRiasrParentNode: function(){
			if(this.isDestroyed(true, true)){
				return;
			}
			var self = this,
				parent = this.getParent();

			this._childOfLayoutWidget = parent && parent.isLayoutContainer;

			if(this._onResizeHandle){
				rias.destroy(this._onResizeHandle);
				this._onResizeHandle = undefined;
			}
			if(!this._childOfLayoutWidget){
				this.own(this._onResizeHandle = rias.dom.Viewport.on("resize", function(){
					_cnt++;
					rias.debounce(self.id + "_onViewportResize", function(){
						//console.debug(self.id, _cnt, "resize");
						//console.trace();
						if(!self.isDestroyed(true, true)){
							self.resize();
						}
					}, self, 150, function(){
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
				a = (c && c.a) ? Widget.displayStateStr(c.a) : this.displayState ? this.displayState : Widget.displayShowNormal;
			}else{
				//this._size0 = undefined;// = rias.dom.getMarginBox(this.domNode);
				a = this.displayState;
			}
			//if(a < 0){
			//	a = 2;
			//}
			this.set("displayState", a);
			return this._playingDeferred || true;
		},
		_saveToCookie: function(){
			if(this.persist && this._started){
				var c = {
					s: this._size0,
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

		focus: function(){
			if(!this.isDestroyed(true, true) && (this.isHidden() || this.isCollapsed() || !this.isShown() || !this.get("visible"))){
				///非可见时，直接返回，在 restore 后处理。
				this.restore(true);
			}else{
				this.inherited(arguments);
			}
		},

		/*_isShown: function(){
			/// isShown 只判断自己是否可见
			///self 可能是 StackContainer.child，可能在不可见 页，所以不要判断 parent 的可见性。
			//var node = this.domNode;
			//return this._wasShown && this.get("visible");
			return this._wasShown && rias.dom.visible(this);
		},*/
		getChildren: function(){
			// Override _LayoutWidget.getChildren() to only return real children, not the splitters.
			return rias.filter(this.inherited(arguments), function(widget){
				return !widget._isSplitter;
			});
		},
		_getOrderedChildren: function(){
			var self = this,
				wrappers = rias.map(this.getChildren(), function(child, idx){
					if(self._needResizeChild){
						child._needResizeChild = true;
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
				childrenAndSplitters = [];
			rias.forEach(this._getOrderedChildren(), function(pane){
				childrenAndSplitters.push(pane);
				if(pane._splitterWidget){
					childrenAndSplitters.push(pane._splitterWidget);
				}
			});

			this._noOverflowCall(function(){
				///不要传 this._contentBox，避免被修改
				rias.dom.layoutChildren(cn, this._contentBox ? rias.dom.floorBox({
					t: this._contentBox.t,
					l: this._contentBox.l,
					w: this._contentBox.w,
					h: this._contentBox.h
				}) : undefined, childrenAndSplitters, changedChildId, changedChildSize);
			});

		},
		beforeLayout: function(needLayout){
			return needLayout;
		},
		_beforeLayout: function(){
			if(this.isDestroyed(true, true)){
				return false;
			}
			var box,
				dom = rias.dom,
				node = this.domNode,
				cn = this.containerNode,
				cs,
				rg = this.region,
				noheight = !rias.dom.hasHeight(node.style, rg),// ((node.style.height === "" || node.style.height === "auto") && rg !== "left" && rg !== "right" && rg !== "center"),
				nowidth = !rias.dom.hasWidth(node.style, rg);// ((node.style.width === "" || node.style.width === "auto") && rg !== "top" && rg !== "bottom" && rg !== "center");

			this._noOverflowCall(function(){
				cs = dom.getComputedStyle(node);
				if(node === this.containerNode){
					box = dom.getMarginBox(node, cs);
					box = dom.marginBox2contentBox(node, box, cs);
				}else{
					if(rg || !noheight || !nowidth){
						box = dom.getContentBox(node, cs);
						node = this.containerNode;
						if(this.captionNode && this.showCaption){
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
							///如果 wrapperNode 有 margin、padding，setMarginBox 后 Style 变了，不应该带入到 containerNode。
							cs = dom.getComputedStyle(this.wrapperNode);
							/// 为了能够自动大小，position 必须为 relative，故不应该设置 top、left
							dom.setMarginBox(this.wrapperNode, {
								h: box.h,
								w: box.w
							}, cs);
							box = dom.marginBox2contentBox(this.wrapperNode, box, cs);
							//box = dom.getContentBox(this.wrapperNode);
						}
						if(this._actionBar){
							box.h -= rias.dom.getMarginBox(this._actionBar.domNode).h;
						}
						cs = dom.getComputedStyle(node);
						rias.dom.floorBox(box);
						/// 为了能够自动大小，position 必须为 relative，故不应该设置 top、left
						/// 但是 containerNode 内部则需要 top 和 left
						dom.setMarginBox(node, {
							h: box.h,
							w: box.w
						}, cs);
						///由于在缩小的时候，有 overflow 存在，重新获取 box 的话，导致 _contentBox 失真
						///box = dom.getContentBox(this.containerNode);
						box = dom.marginBox2contentBox(node, box, cs);
					}else{
						/// CaptionPanel/DialogPanel 等，如果直接设置 moduleMeta时，是设置 containerNode，所以需要继续判断 containerNode.
						if(this.wrapperNode){
							this.wrapperNode.style.top = "";
							this.wrapperNode.style.left = "";
							this.wrapperNode.style.height = "";
							this.wrapperNode.style.width = "";
						}
						node = this.containerNode;
						noheight = !rias.dom.hasHeight(node.style, rg);// ((node.style.height == "" && rg !== "left" && rg !== "right" && rg !== "center");
						nowidth = !rias.dom.hasWidth(node.style, rg);// (node.style.width == "" && rg !== "top" && rg !== "bottom" && rg !== "center");
						if(!noheight || !nowidth){
							cs = dom.getComputedStyle(node);
							box = dom.getContentBox(node, cs);
							//box = dom.marginBox2contentBox(node, box, cs);
						}else{
							box = undefined;
						}
					}
				}
			});
			rias.dom.floorBox(box);
			if(!box || !this._contentBox || Math.abs(box.l - this._contentBox.l) > 0.5 || Math.abs(box.t - this._contentBox.t) > 0.5 ||
				Math.abs(box.w - this._contentBox.w) > 0.01 || Math.abs(box.h - this._contentBox.h) > 0.01){
				////if(this.needLayout || !box || !this._contentBox || box.w != this._contentBox.w || box.h != this._contentBox.h){
				this._contentBox = box;
				this.needLayout = true;
			}
			return this.beforeLayout(this.needLayout || this._needResizeChild);
		},
		afterLayout: function(){
		},
		layout: function(/*String?*/ changedChildId, /*Number?*/ changedChildSize){
			var v;
			v = this._started && !this.__updateSize && this.get("visible");
			if(!v){
				this.needLayout = true;
				return v;
			}
			if(v = this._beforeLayout()){
				this._layoutChildren(changedChildId, changedChildSize);
				this.needLayout = false;
				this._needResizeChild = false;
				this.afterLayout();
			}
			return v;
		},
		beforeResize: function(){
		},
		afterResize: function(){
		},
		_internalResize: function(changeSize, resultSize){
			//var dt0 = new Date();
			if(this.isDestroyed(true, true)){
				return;
			}
			var v,
				box,
				dom,
				dns,
				isV = (this.region == "left" || this.region == "right"),
				node;
			v = this._started && !this.__updateSize && this.get("visible");
			if(!v){
				//this._needResize = true;
				this._changeSize = rias.mixin(this._changeSize, changeSize);
				this._resultSize = rias.mixin(this._resultSize, resultSize);
				return;
			}
			this._wasResized = true;
			box = resultSize || {};

			this.beforeResize();
			dom = rias.dom;
			node = this.domNode;
			dns = node.style;
			//cs = dom.getComputedStyle(node);
			//pb = (dom.boxModel == "border-box" ? {w:0, h:0} : dom.getPadBorderExtents(node, cs));
			box = rias.mixin(this._changeSize, changeSize, box);
			this._changeSize = undefined;
			this._resultSize = undefined;
			dom.setMarginBox(node, box);
			dom.fixedNode(node, this.fixed || {});

			box = dom.getMarginBox(node);
			box = this._checkRestrict(box);
			if(this.displayState === Widget.displayCollapsed){
				///这里处理可以防止 move 和 resize 的时候改变，同时允许先改变 大小 和 约束
				if(isV){
					dns.width = this._captionHeight + "px";
					if(this.showCaption && this.captionNode){
						rias.dom.setMarginBox(this.captionNode, {
							w: this._captionHeight,
							h: dom.marginBox2contentBox(node, box).h
						});
					}
				}else if(this.region == "top" || this.region == "bottom"){
					dns.height = this._captionHeight + "px";
				}else{
					dns.height = this._captionHeight + "px";
					if(this.collapsedWidth > 60){
						dns.width = this.collapsedWidth + "px";
					//}else if(this._size0 && this._size0.w > 0){
					//	dns.width = (this._size0.w - rias.dom.getMarginBorderBox(node).w) + "px";
					}
				}
			}else{
				if(this.showCaption && this.captionNode){
					this._captionHeight = rias.dom.getMarginBox(this.captionNode).h;
				}else{
					this._captionHeight = 0;
				}
				if(this.displayState === Widget.displayShowNormal){
					if(!rias.objLike(this._size0, box)){
						this._size0 = rias.mixinDeep(this._size0, box);
						//this._needPosition = false;
						this._saveToCookie();
					}
				}

				this.layout();
			}

			this.afterResize();
			//console.debug(this.id + " resize: " + (new Date() - dt0) + " ms.");
		},
		_checkRestrict: function(box){
			var dns = this.domNode.style;
			if(this.restrictPadding >= 0 || this.isShowMax()){
				var r = this.restrictPadding,
					p = rias.dom.getContentBox(this.getParentNode());
				///先判断 height，然后才能判断 top。
				if(box.h > p.h - r - r){
					box.h = p.h - r - r;
					dns.height = box.h + "px";
				}
				if(box.t < p.st + r){
					box.t = p.st + r;
					dns.top = box.t + "px";
				}
				if(box.t + box.h > p.h + p.st - r){
					box.t = p.h + p.st - box.h - r;
					dns.top = box.t + "px";
				}
				if(box.w > p.w - r - r){
					box.w = p.w - r - r;
					dns.width = box.w + "px";
				}
				if(box.l < p.sl + r){
					box.l = p.sl + r;
					dns.left = box.l + "px";
				}
				if(box.l + box.w > p.w + p.sl - r){
					box.l = p.w + p.sl - box.w - r;
					dns.left = box.l + "px";
				}
			}

			return box;
		},
		_doRestrictResize: function(){
			if(this._riasrParent && this._riasrParent.resize){
				this._riasrParent.needLayout = true;
				this._riasrParent.resize();
			}else{
				this.resize();
			}
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
		_refreshDisplayState: function(state){
			this.needLayout = true;
			if(state && this._splitterWidget && rias.isFunction(this._splitterWidget._setStateAttr)){
				this._splitterWidget.set("state", state);
			}else{
				this._resizeParent();
			}
		},
		onDisplayStateChanging: function(value, oldValue){
			return value;
		},
		onDisplayStateChanged: function(value){},
		_setDisplayStateAttr: function(value){
			value = displayStateStr(value);
			if(value === displayClosed){
				var self = this,
					d;
				rias.when(this._onClose(), function(result){
					if(result === true || result > 0){
						d = self.get("displayState");
						if(d !== self.closeDisplayState && d !== displayHidden && d !== displayClosed){
							self._set("displayState", self.closeDisplayState || "closed");
						}
					}
				});
			}else{
				this._set("displayState", value);
			}
		},
		_onDisplayState: function(value, oldValue){
			var self = this;
			if(rias.isNumber(value)){
				value = Widget.displayStateStr(value) || displayShowNormal;
			}
			value = self.onDisplayStateChanging(value, oldValue);
			//if(this._started){
			return rias.when(self._doPlay(value), function(result){
				if(result){
					if(!self.isDestroyed(true)){
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
				this._playingEndHandle = undefined;
			}
			if(this._playingDeferred){
			//	this._playingDeferred.cancel();
				this._playingDeferred = undefined;
			}
			if(this._playingContent){
				this._playingContent.stop();
				this._playingContent = undefined;
			}
			if(this._playing){
				this._playing.stop();
				this._playing = undefined;
			}
		},
		_doPlayContent: function(show){
			var self = this,
				df = rias.newDeferred(),
				cn = self.wrapperNode ? self.wrapperNode : self.containerNode,
				duration = self.duration / 2;
			if(show == false){
				self._playingContent = self._playingHide({
					node: cn,
					duration: duration,
					beforeBegin: function(){
					},
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
					beforeBegin: function(){
						//self.needLayout = true;
						//self.layout();
					},
					onEnd: function(){
						df.resolve();
					},
					onStop: function(){
						df.resolve();
					}
				});
			}
			self._playingContent.play();
			return df;
		},
		_doPlay: function(newState, forcePlay){
			var self = this,
				df = rias.newDeferred(),
				canPlay = self._started && self.animate && self.get("visible"),
				oldState = self._displayState0,//不能取 this.displayState，因为已经改变了。
				dn = self.domNode, dns = dn.style,
				cn = self.wrapperNode ? self.wrapperNode : self.containerNode,
				cpn = self.captionNode,
				duration = self.duration,
				_playContent,
				r = (self.restrictPadding > 0 ? self.restrictPadding : 0),
				isV = (self.region == "left" || self.region == "right"),
				oldSize = self._size0;

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
							start: isV ? undefined : (self.showCaption && cpn ? self._captionHeight : 0),
							end: isV ? undefined : oldSize && oldSize.h ? oldSize.h - mb.h : undefined
						},
						width: {
							start: isV ? (self.showCaption && cpn ? self._captionHeight : 0) : undefined,
							end: isV ? oldSize && oldSize.w ? oldSize.w - mb.w : undefined : undefined
						}
					},
					beforeBegin: function(){
						rias.dom.visible(cn, true);
						doExpand(true);
					},
					onEnd: function() {
						//self._resizeParent();
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
						doExpand(false);
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
				var parentSize = rias.dom.getContentBox(self.getParentNode());
				var mb = _mb();
				return {
					__fxparamname: "sizeMAxParam",
					//method: "combine",
					node: dn,
					duration: duration * 1.5,
					properties: {
						top: {
							end: parentSize ? parentSize.st + r : oldSize ? oldSize.t : undefined
						},
						left: {
							end: parentSize ? parentSize.sl + r : oldSize ? oldSize.l : undefined
						},
						width: {
							end: parentSize ? (parentSize.w - r - r - mb.w) : oldSize && oldSize.w ? oldSize.w - mb.w : undefined
						},
						height: {
							end: parentSize ? (parentSize.h - r - r - mb.h) : oldSize && oldSize.h ? oldSize.h - mb.h : undefined
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
					duration: duration * 1.5,
					properties: {
						top: {
							end: oldSize ? oldSize.t : undefined
						},
						left: {
							end: oldSize ? oldSize.l : undefined
						},
						width: {
							end: oldSize && oldSize.w ? oldSize.w - mb.w : undefined
						},
						height: {
							end: oldSize && oldSize.h ? oldSize.h - mb.h : undefined
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
						self._restore(true);
						self._changeSize = self._size0;
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
			function doExpand(value){
				value = !!value;
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
					cpn.style.height = "";///auto?
					cpn.style.width = "";
					//}
				}
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
					df.resolve(false);
					self._displayState0 = Widget.displayStateInt(self.displayState);
					self._doPlay(_nextState, true);
				}else{
					self._playing = undefined;///先 delete，df.resolve 中要检测
					df.resolve(self.displayState);
					if(self.animate && _playContent && newState >= intHidden){
						self.defer(function(){
							self._doPlayContent();
						});
					}
				}
			}

			self._stopPlay();
			self._playingDeferred = rias.newDeferred();
			newState = Widget.displayStateInt(newState);
			isNaN(newState) && (newState = intShowNormal);
			if(self.isDestroyed(true) || !forcePlay && oldState === newState){
				df.resolve(false);
				return df.promise;
			}
			///onShow 等事件中需要使用 self.displayState，提前设置.
			self._displayState0 = newState;
			self.displayState = Widget.displayStateStr(newState) || displayShowNormal;
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
								self.displayState = "showNormal";
								self._playing = self._playingExpand(expandParam);
								_nextState = "showMax";
							}else{
								doExpand(true);
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
							doExpand(false);
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
							doExpand(false);
						}
					}else{
						///showNormal
						if(canPlay && self._playingCollapse){
							self._playing = self._playingCollapse(collapseParam());
						}else{
							doExpand(false);
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
							doExpand(true);
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
				//self._playing.onEnd = _onEnd;
				self.own(self._playingEndHandle = rias.after(self._playing, "onEnd", _onEnd));
				self._playing.onStop = function(){
					if(self._playingDeferred){
						self._playingDeferred.resolve(self);
					}
				};
				//console.debug(this.id, this._playing);
				self._playing.play();
			}else{
				_onEnd();
			}
			df.then(function(result){
				//console.debug("played.");
				//self._playingDeferred = undefined;
			});
			return df.promise;
		},

		onHide: function(){
			return true;
		},
		_hide: function(newState){
			//this._wasShown = false;/// _wasShown 表示已经显示过了，而不是 showing
			newState = (arguments.length > 0 ? newState : displayStateInt(this.displayState));
			if(newState === intClosed){
				this._close(newState);
			}else if(newState === intTransparent){
				//this.onHide();
			}else{
				this._refreshDisplayState();
				this.onHide();
			}
		},
		hide: function(){
			this.set("displayState", Widget.displayHidden);
			return this._playingDeferred || true;
		},

		onClose: function(){
			return true;
		},
		_onClose: function(){
			//return this.canClose == true && !this.get("modified") && (this.onClose() != false);/// _close 在 DialogPanel 中设置
			///this.onClose() 有可能是 promise，返回 this.onClose()
			var self = this,
				go = this.canClose != false && this.onClose();
			return rias.when(go, function(result){
				if(result != false && self.get("modified")){
					return rias.choose({
						//parent: rias.webApp,
						autoClose: 0,
						content: "是否放弃修改并退出？",
						caption: rias.i18n.action.choose,
						actionBar: [
							"btnYes",
							"btnNo"
						]
					}).closeDeferred;
					//return false;
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
			this.set("displayState", Widget.displayClosed);
			return this._playingDeferred || this.canClose;
		},

		onShow: function(){
			//return true;
		},
		_onShow: function(){
			this.inherited(arguments);
		},
		_show: function(){
			this._wasShown = true;//this.get("visible");
			if(this._needPosition){
				this._needPosition = !rias.dom.positionAt(this, this.initPlaceToArgs);
			}
			this._refreshDisplayState();
			this._onShow.apply(this, arguments);
			return this.isShown();
		},
		show: function(){
			this.set("displayState", Widget.displayShowNormal);
			return this._playingDeferred || true;
		},

		onRestore: function(){
		},
		_restore: function(silent){
			if(silent != true){
				this._refreshDisplayState();
			}
			this.onRestore.apply(this, arguments);
		},
		restore: function(forceVisible){
			var self = this,
				d = true,
				dr = true,
				ds = true,
				parent;
			if(self.isDestroyed(true, true)){
				return false;
			}
			if(!self.get("visible") && forceVisible){
				d = rias.newDeferred();
				parent = self.getParent();
				if(!parent.get("visible")){
					if(rias.isFunction(parent.restore)){
						dr = parent.restore(forceVisible);
					}
				}
				rias.when(dr, function(){
					if(rias.isFunction(parent.selectChild)){
						ds = parent.selectChild(self, true);
					}
					return rias.when(ds, function(){
						d.resolve(self);
					})
				})
			}
			rias.when(d, function(){
				self.set("displayState", Widget.displayShowNormal);
				return self._playingDeferred || true;
			});
			return d.promise || d;
		},

		onExpand: function(){
		},
		_expand: function(){
			var dns = this.domNode.style,
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
			this._refreshDisplayState("full");
			this.onExpand.apply(this, arguments);
		},
		expand: function(){
			this.set("displayState", Widget.displayShowNormal);
			return this._playingDeferred || true;
		},

		onCollapse: function(){
		},
		_collapse: function(){
			var dns = this.domNode.style;
			this._size0.hasH = (dns.height !== "" && dns.height !== "auto");
			this._size0.hasW = (dns.width !== "" && dns.width !== "auto");
			//var h = (this.showCaption && this.captionNode ? rias.dom.getMarginBox(this.captionNode).h : 0);
			/*var h = (this.showCaption && this.captionNode ? this._captionHeight : 0);
			if(this.region == "left" || this.region == "right"){
				dns.width = h + "px";
			}else if(this.region == "top" || this.region == "bottom"){
				dns.height = h + "px";
			}else{
				dns.height = h + "px";
				if(this.collapsedWidth > 60){
					dns.width = this.collapsedWidth + "px";
				//}else if(this._size0 && this._size0.w > 0){
				//	dns.width = (this._size0.w - rias.dom.getMarginBorderBox(this.domNode).w) + "px";
				}
			}*/
			this._refreshDisplayState("collapsed");
			this.onCollapse.apply(this, arguments);
		},
		collapse: function(){
			this.set("displayState", Widget.displayCollapsed);
			return this._playingDeferred || true;
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
			this._refreshDisplayState();
			this.onShowMax.apply(this, arguments);
		},
		showMax: function(){
			this.set("displayState", Widget.displayShowMax);
			return this._playingDeferred || true;
		},

		isDisplayState: function(state){
			switch(state){
				case intShowNormal://1:
				case displayShowNormal://1:
					return this.displayState === Widget.displayShowNormal;
				case intHidden://0:
				case displayHidden://0:
					return this.displayState === Widget.displayHidden
						|| this.displayState === Widget.displayClosed
						|| (this.dockTo && this.displayState === Widget.displayCollapsed);
				case intClosed://-1:
				case displayClosed://-1:
					return this.displayState === Widget.displayClosed;
				case intTransparent://-2:
				case displayTransparent://-2:
					return this.displayState === Widget.displayTransparent;
				case intShowMax://2:
				case displayShowMax://2:
					return this.displayState === Widget.displayShowMax;
				case intCollapsed://3:
				case displayCollapsed://3:
					return (this.displayState === Widget.displayCollapsed)
						|| (this.dockTo && this.displayState === Widget.displayHidden);
				default:
					return false;
			}
		},
		isShowNormal: function(){
			return this.isDisplayState(Widget.displayShowNormal);
		},
		isShowMax: function(){
			return this.isDisplayState(Widget.displayShowMax);
		},
		isCollapsed: function(){
			return this.isDisplayState(Widget.displayCollapsed);
		},
		isShown: function(excludeShrink){
			return !!this._wasShown &&
				(this.displayState == Widget.displayShowNormal || this.displayState == Widget.displayShowMax
					|| (!excludeShrink && this.displayState == Widget.displayCollapsed));
		},
		isHidden: function(){
			return this.isDisplayState(Widget.displayHidden);
		},
		isClosed: function(){
			return this.isDisplayState(Widget.displayClosed);
		},
		isTransparent: function(){
			return this.isDisplayState(Widget.displayTransparent);
		},

		_setupChild: function(/*dijit/_WidgetBase*/child, added, insertIndex, noresize){
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
					child._splitterWidget = undefined;
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

			if(!noresize && this._started && !this.isDestroyed(true, true)){
				this.needLayout = true;
				this.resize();
			}
		},
		onAddChild: function(child, insertIndex){
		},
		addChild: function(/*dijit/_WidgetBase*/ child, /*Integer?*/ insertIndex, noresize){
			this.onAddChild.apply(this, arguments);
			this.inherited(arguments);
			///必须在 _setupChild 完成后才能明确 resize
			/*if(this._started){
				this.needLayout = true;
				this.defer("resize");
			}*/
		},
		onRemoveChild: function(child){
		},
		removeChild: function(/*dijit/_WidgetBase*/ child, noresize){
			this.onRemoveChild(arguments);
			this.inherited(arguments);
			if(child && child._splitterWidget){
				rias.destroy(child._splitterWidget);
				child._splitterWidget = undefined;
			}
			///必须在 _setupChild 完成后才能明确 resize
			/*if(this._started){
				this.needLayout = true;
				this.defer("resize");
			}*/
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
