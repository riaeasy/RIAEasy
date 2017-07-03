
//RIAStudio client runtime widget - _PanelWidget

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_KeyNavContainer",
	"riasw/sys/_CssStateMixin"
], function(rias, _WidgetBase, _KeyNavContainer, _CssStateMixin){

	///displayState:	1=shown(showNormal, restore, expand), 2=showMax, 3=collapsed(showMin, shrunk),
	//			0=hideen(display=none), -1=closed(destroy), -2=transparent(but display)
	var displayShowNormal = "showNormal",///1
		displayShowMax = "showMax",///2
		displayCollapsed = "collapsed",///3
		displayClosed = "closed",///-1
		//displayTransparent = "transparent",///-2
		displayHidden = "hidden";///0
	var intShowNormal = 1,
		intShowMax = 2,
		intCollapsed = 3,
		intClosed = -1,
		//intTransparent = -2,
		intHidden = 0;
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
			//case intTransparent://-2:
			//case displayTransparent://-2:
			//	return intTransparent;
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
			//case intTransparent://-2:
			//case displayTransparent://-2:
			//	return displayTransparent;
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
		//"riasw/layout/DockBar.css"
	//]);

	var _dom = rias.dom;
	var riaswType = "riasw.layout._PanelBase";
	var Widget = rias.declare(riaswType, [_WidgetBase, _KeyNavContainer, _CssStateMixin], {

		_ignoreKeyboardSearch: true,

		restrictPadding: -1,///因为需要允许 Panel、Container 等可以在可视区外，故默认不能有 restrict
		//restrictBox: {
		//	top: "12px",
		//	left: "70%",
		//	bottom: "30em",
		//	right: "0"
		//},

		baseClass: "riaswPanel",

		caption: "",///有些 widget 需要 watch 该值。
		//showCaption: false,

		collapsedHeight: 0,

		//tabIndex: "",
		//_setTabIndexAttr: ["domNode"],

		//movable: false,
		//resizable: "",
		animate: false,

		autoFocus: false,
		//_keyNavCodes: null,

		//displayState: displayShowNormal,
		initDisplayState: displayShowNormal,
		_hiddenOpacity: 0,
		_shownOpacity: 1,

		dockRegion: "",
		dockRegionArgs: null,

		_setCaptionAttr: function(value){
			this._set("caption", value);///触发 watch/_onAttr，响应 tabButton
		},

		_onKeyTab: function(evt, focusedChild){
			if((evt.keyCode === rias.keys.TAB || evt.keyCode === rias.keys.ENTER && focusedChild.enterAsTab) && this.isFocusable()){
				var tn;
				if(!focusedChild){
					tn = this._getFirstFocusableChild(true);
				}else{
					tn = this._getNextFocusableChild(focusedChild, evt.shiftKey ? -1 : 1);
				}
				if(tn){
					if(tn !== focusedChild){
						tn.focus();
					}
					return true;///不应该 preventDefault 和 stopPropagation
				}
			}
			return false;
		},
		postMixInProperties: function(){
			this._renderDeferreds = [];
			this.dockRegionArgs = this.dockRegionArgs || {};
			this.dockRegionSize = this.dockRegionSize || {};
			this.initDisplayState = this.initDisplayState || this.displayState;
			delete this.displayState;
			this.inherited(arguments);
			this._keyNavCodes = {};
			this._keyNavCodes[rias.keys.TAB] = this._onKeyTab;
			this._keyNavCodes[rias.keys.ENTER] = this._onKeyTab;
		},
		_onDestroy: function(){
			rias.forEach(this._renderDeferreds, function(d){
				if(d){
					d.cancel();
				}
			});
			this._renderDeferreds = undefined;
			if(this._onScrollHandle){
				this._onScrollHandle.remove();
				this._onScrollHandle = undefined;
			}
			if(this.onScrollHandle){
				this.onScrollHandle.remove();
				this.onScrollHandle = undefined;
			}
			if(this._debounceLayoutHandle){
				this._debounceLayoutHandle.remove();
				this._debounceLayoutHandle = undefined;
			}
			this._stopPlay(true);
			this.inherited(arguments);
		},
		//isDestroyed: function(checkAncestors, checkClose){
		//	return (checkClose && this.isClosed()) || rias.isDestroyed(this, checkAncestors != false);
		//},

		startup: function(){
			if(this._started){
				return this.whenPlayed();
			}
			this.inherited(arguments);

			this._save_style0();
			//this.domNode.style.opacity = this._hiddenOpacity;
			var r;
			try{
				r = this.display(this.initDisplayState);
			}catch(e){
				console.error(e);
			}
			return r;
		},

		_setContentClassAttr: function(value){
			_dom.removeClass(this.containerNode, this.contentClass);
			this._set("contentClass", value);
			_dom.addClass(this.containerNode, value);
		},

		onDockRegionNone: function(){
			this.dockRegionSaveHeight = false;
			this.dockRegionSaveWidth = false;
			this._dockRegion = "";
			this.set("region", "");
		},
		onDockRegionAuto: function(parentBox){
			this.dockRegionSaveHeight = false;
			this.dockRegionSaveWidth = false;
			this._dockRegion = "";
			this.set("region", "");
		},
		onDockRegionCenter: function(){
			this.dockRegionSaveHeight = false;
			this.dockRegionSaveWidth = false;
			this._dockRegion = "center";
			this.set("region", "center");
		},
		onDockRegionLeft: function(){
			this.set("style", {
				width: this.dockRegionSize.width || this.dockRegionArgs.initWidth
			});
			this.dockRegionSaveHeight = false;
			this.dockRegionSaveWidth = true;
			this._dockRegion = "left";
			this.set("region", "left");
		},
		onDockRegionRight: function(){
			this.set("style", {
				width: this.dockRegionSize.width || this.dockRegionArgs.initWidth
			});
			this.dockRegionSaveHeight = false;
			this.dockRegionSaveWidth = true;
			this._dockRegion = "right";
			this.set("region", "right");
		},
		onDockRegionTop: function(){
			this.set("style", {
				height: this.dockRegionSize.height || this.dockRegionArgs.initHeight
			});
			this.dockRegionSaveHeight = true;
			this.dockRegionSaveWidth = false;
			this._dockRegion = "top";
			this.set("region", "top");
		},
		onDockRegionBottom: function(){
			this.set("style", {
				height: this.dockRegionSize.height || this.dockRegionArgs.initHeight
			});
			this.dockRegionSaveHeight = true;
			this.dockRegionSaveWidth = false;
			this._dockRegion = "bottom";
			this.set("region", "bottom");
		},
		_setDockRegionAttr: function(region){
			this.dockRegion = region;
			if(region){
				if(region === "none"){
					this.onDockRegionNone();
				//}else if(region === "auto"){
				//	this._containerLayout();
				}else if(region === "center"){
					this.onDockRegionCenter();
				}else if(region === "left"){
					this.onDockRegionLeft();
				}else if(region === "right"){
					this.onDockRegionRight();
				}else if(region === "top"){
					this.onDockRegionTop();
				}else if(region === "bottom"){
					this.onDockRegionBottom();
				}
				this._containerLayout();
			}
		},
		_loadPersist: function(args){
			this.inherited(arguments);

			this.dockRegionSize = args.drs || {};
			if(args.dr){
				this.set("dockRegion", args.dr);
			}

			var c = this.getPersist("state");
			if(c && c.s){
				this._save_style0(c.s);
				_dom.setStyle(this.domNode, this._style0);
			}
			this.initDisplayState = (c && c.a) ? displayStateStr(c.a) : this.initDisplayState ? this.initDisplayState : displayShowNormal;
		},
		_savePersist: function(args){
			if(!this.isClosed()){/// isClosed 不应该 save
				this.setPersist({
					state: {
						s: rias.mixinDeep({}, this._style0),///用副本
						a: displayStateInt(this.displayState)
					},
					dr: this.dockRegion,
					drs: this.dockRegionSize
				});
			}
			this.inherited(arguments);
		},

		childSelector: function(/*DOMNode*/ node){
			// Implement _KeyNavMixin.childSelector, to identify focusable child nodes.
			// If we allowed a dojo/query dependency from this module this could more simply be a string "> *"
			// instead of this function.
			node = rias.by(node);
			return node && node.getParent() === this;
		},

		///_onFocus 和 focus 的触发规则不同，都需要 select().
		_onFocus: function(by, i, newStack, oldStack){
			//console.debug("_onFocus - " + this.id + " - " + rias.__dt() + " ms.");
			this.inherited(arguments);
			if(!this.get("selected")){
				//console.debug("_onFocus - select(true) - " + this.id);
				this.select(true);
			}
		},
		focus: function(child, forceVisible){
			if(!this.isDestroyed(true) && !this.isClosed()){
				if(!this.get("selected")){
					this.select(true);
				}
				this.inherited(arguments);
			}
		},
		_onBlur: function(by, i, newStack, oldStack){
			//console.debug("_onBlur - " + this.id + " - " + rias.__dt() + " ms.");
			this.inherited(arguments);
			if(this.get("selected")){
				//console.debug("_onBlur - select(false) - " + this.id);
				this.select(false);
			}
		},
		onSelected: function(selected){
		},
		_setSelectedAttr: function(value, fromSelect){
			if(!this.isDestroyed(true)){
				value = value != false;
				//console.debug("selected: " + value + " - " + this.id);
				_dom.setAttr(this.domNode, "selected", value);
				_dom.setAttr(this.domNode, "aria-selected", value ? "true" : "false");
				if(this.selected !== value){
					this._set("selected", value);
					this.onSelected(value);
					rias.publish(this.id + "Selected", {
						widget: this,
						selected: value
					});
					if(!fromSelect){///避免循环
						this.select(value);
					}
				}
				if(value){
					if(this.autoFocus && this._needFocus()){///_needFocus 包含 isFocusable
						//console.debug("focusOnSelected - " + this.id);
						this.focus();///需要立即 focus，刷新 focusedStack，不能 defer
					}
				}else if(this.focused){
					this._onBlur();
				}
			}
		},
		select: function(value){
			if(!this.isDestroyed(true) && !this.isClosed()){
				value = !!value;
				if(this.selected !== value){
					this.set("selected", value, true);///避免循环
				}
			}
		},

		_setRegionAttr: function(value){
			if(this._regionClass){
				rias.dom.removeClass(this.domNode, this._regionClass);
			}
			this.inherited(arguments);
			if(value){
				this._regionClass = "riaswRegion" + rias.upperCaseFirst(value) + " " + this._baseClass0 + rias.upperCaseFirst(value);
				rias.dom.addClass(this.domNode, this._regionClass);
			}else{
				this._regionClass =  "riaswRegionNone";
			}
		},
		_setRestrictPaddingAttr: function(value, oldValue){
			if(!rias.isEqual(this.restrictPadding, value)){
				this._set("restrictPadding", value);
				this._handleOnScroll();
				if(this._started){
					this.resize();
				}
			}
		},
		//minHeight: 0,
		//minWidth: 0,
		//minSize: {
		//  w: 0,
		//  h: 0
		//},
		//maxSize: {
		//  w: 0,
		//  h: 0
		//},
		_setMinSizeAttr: function(value){
			/// value 是 Object，操作 value 会改变原值。
			if(!value){
				this._set("minSize", undefined);
			}else{
				var h = value.h,
					w = value.w;
				this._minSize0 = value;
				if(h && rias.isString(h)){
					rias.theme.testElement(this.domNode, {
						height: h
					}, function(el){
						h = rias.dom.toPixelValue(el, _dom.getComputedStyle(el).height);
					});
				}
				if(w && rias.isString(w)){
					rias.theme.testElement(this.domNode, {
						width: w
					}, function(el){
						w = rias.dom.toPixelValue(el, _dom.getComputedStyle(el).width);
					});
				}
				value = {
					h: h,
					w: w
				};
				if(!rias.isEqual(this.minSize, value)){
					this._set("minSize", value);
					_dom.setStyle(this.domNode, "min-height", value && value.h > 0 ? value.h + "px" : "");
					_dom.setStyle(this.domNode, "min-width", value && value.w > 0 ? value.w + "px" : "");
					if(this.started && value){
						this._containerLayout();
					}
				}
			}
		},
		//_onMinSizeAttr: function(value, oldValue){
		//},
		_setMaxSizeAttr: function(value){
			/// value 是 Object，操作 value 会改变原值。
			if(!value){
				this._set("maxSize", undefined);
			}else{
				var h = value.h,
					w = value.w;
				this._maxSize0 = value;
				if(h && rias.isString(h)){
					rias.theme.testElement(this.domNode, {
						height: h
					}, function(el){
						h = rias.dom.toPixelValue(el, _dom.getComputedStyle(el).height);
					});
				}
				if(w && rias.isString(w)){
					rias.theme.testElement(this.domNode, {
						width: w
					}, function(el){
						w = rias.dom.toPixelValue(el, _dom.getComputedStyle(el).width);
					});
				}
				value = {
					h: h,
					w: w
				};
				if(!rias.isEqual(this.maxSize, value)){
					this._set("maxSize", value);
					_dom.setStyle(this.domNode, "max-height", value && value.h > 0 ? value.h + "px" : "");
					_dom.setStyle(this.domNode, "max-width", value && value.w > 0 ? value.w + "px" : "");
					if(this.started && value){
						this._containerLayout();
					}
				}
			}
		},
		//_onMaxSizeAttr: function(value, oldValue){
		//},

		getChildren: function(){
			// Override _LayoutWidget.getChildren() to only return real children, not the splitters.
			return rias.filter(this.inherited(arguments), function(widget){
				return !widget._isSplitter;
			});
		},
		_getOrderedChildren: function(){
			var wrappers = rias.map(this.getChildren(), function(child, idx){
					return {
						panel: child,
						weight: [
							child.region === "center" ? Infinity : 0,
							child.layoutPriority,
							(this.design === "sidebar" ? 1 : -1) * (/top|bottom/.test(child.region) ? 1 : -1),
							idx
						]
					};
				}, this);
			wrappers.sort(function(a, b){
				var aw = a.weight, bw = b.weight;
				for(var i = 0; i < aw.length; i++){
					if(aw[i] !== bw[i]){
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
			var box = rias.mixin({}, this._contentBox);
			var childrenAndSplitters = [];
			rias.forEach(this._getOrderedChildren(), function(child){
				childrenAndSplitters.push(child);
				if(child._splitterWidget){
					childrenAndSplitters.push(child._splitterWidget);
				}
			});

			if(childrenAndSplitters.length){
				rias.forEach(childrenAndSplitters, function(child){
					if(child.dockRegion === "auto"){
						child.onDockRegionAuto(box);
					}
				});
				///不要传 this._contentBox，避免被修改
				_dom.layoutChildren.apply(this, [this.containerNode, this._contentBox, childrenAndSplitters, changedChildId, changedChildSize]);
			}
		},
		beforeLayout: function(_contentBox, needResizeContent){
			return needResizeContent;
		},
		_beforeLayout: function(){
			var self = this,
				box,
				node = this.domNode,
				cs,
				rg = this.region,
				h, w;

			if(this.isCollapsed()){///Collapsed 时，不应该 layout。
				return false;
			}
			/// ff 的 FIELDSET 的 domNode.clientHeight 已经去掉 legend(captionNode) 的 height，故不用 getContentBox，改用 marginBox2contentBox
			cs = _dom.getComputedStyle(node);
			///box = _dom.getContentBox(node);
			box = _dom.getMarginBox(node, cs);
			box = _dom.marginBox2contentBox(node, {
				t: 0,
				l: 0,
				h: box.h,
				w: box.w
			}, cs);
			h = _dom.hasHeight(node.style, rg, false);
			w = _dom.hasWidth(node.style, rg, false);
			if(node === self.containerNode){
				if(!h && !w){
					///如果 box != undefined 则会在 layoutChildren 时，将 child 设为 absolute，导致 containerNode 不能自适应
					box = undefined;
				}
			}else{
				node = self.containerNode;
				if(h || w){
					/// ff 的 FIELDSET 的 domNode.clientHeight 已经去掉 legend(captionNode) 的 height
					//if(self.captionNode && self.showCaption && (this.domNode.tagName !== "FIELDSET" || !rias.has("ff"))){
					if(self.captionNode && self.showCaption){
						/// collapsedHeight 包含 domNode 的 padding 和 border，应该只计算 captionNode
						///box.h -= self.collapsedHeight;
						box.h -= rias.dom.getMarginBox(this.captionNode).h;
					}
					if("fixedHeaderHeight" in self){
						box.h -= self.fixedHeaderHeight;
					}
					if("fixedFooterHeight" in self){
						box.h -= self.fixedFooterHeight;
					}
					if(self.actionBar && self.actionBar.domNode){/// actionBar 有可能尚未创建，还是 Params
						box.h -= _dom.getMarginBox(self.actionBar.domNode).h;
					}
					cs = _dom.getComputedStyle(node);
					//_dom.floorBox(box);
					/// 为了能够自动大小，position 必须为 relative，故不应该设置 top、left
					/// 但是 containerNode 内部则需要 top 和 left
					_dom.setMarginSize(node, {
						h: h ? box.h : undefined,
						w: w ? box.w : undefined
					}, cs);
					box.t = 0;
					box.l = 0;
					///由于在缩小的时候，有 overflow 存在，重新获取 box 的话，导致 _contentBox 失真
					//box = getContentBox(node);
					box = _dom.marginBox2contentBox(node, box, cs);
				}else{
					/// CaptionPanel/Dialog 等，如果直接设置 moduleMeta时，是设置 containerNode，所以需要继续判断 containerNode.
					///如果 box != undefined 则会在 layoutChildren 时，将 child 设为 absolute，导致 containerNode 不能自适应
					h = _dom.hasHeight(node.style, rg, false);
					w = _dom.hasWidth(node.style, rg, false);
					if(h || w){
						box = _dom.getContentBox(node);
					}else{
						box = undefined;
					}
				}
			}

			if(box){
				this._contentBox = box;
			}
			return this.beforeLayout(this._contentBox, true);
		},
		afterLayout: function(){
		},
		layout: function(/*String?*/ changedChildId, /*Number?*/ changedChildSize){
			///有可能要用 debounce，返回值不好获取，舍弃。
			if(!this._canUpdateSize()){
				this.set("needResizeContent", true);
				return;
			}
			var self = this;
			_dom.noOverflowCall(self.domNode, function(){
				if(self.containerNode === self.domNode){
					if(self._beforeLayout() != false || changedChildId){
						self._layoutChildren(changedChildId, changedChildSize);
					}
				}else{
					_dom.noOverflowCall(self.containerNode, function(){
						if(self._beforeLayout() != false || changedChildId){
							self._layoutChildren(changedChildId, changedChildSize);
						}
					});
				}
			});
			self.afterLayout();
		},
		debounceLayout: function(delay){
			///有可能要用 debounce，返回值不好获取，舍弃。
			//if(!this._canUpdateSize()){
			//	this.set("needResizeContent", true);
			//	return;
			//}
			this._debounceLayoutHandle = rias._debounce(this.id + "layout", function(){
				this._debounceLayoutHandle = undefined;
				///debounce 后，有可能 this 的状态已经改变。
				if(!this._canUpdateSize()){
					this.set("needResizeContent", true);
					//console.debug("debounceLayout - needResizeContent - " + this.id);
				}else{
					//console.debug("debounceLayout - layout - " + this.id);
					this.layout();
				}
			}, this, (delay == undefined ? this.debounceLayoutDelay : delay), function(){
				//console.debug("debounceLayout pass... - " + this.id);
			})();
		},

		_getNeedResizeContentAttr: function(){
			if(!this._canUpdateSize()){///优化，可以不要
				return false;
			}
			var v;
			return this.needResizeContent || rias.some(this.getChildren(), function(child){
				//return child.get("visible") && (child.needResize || child.get("needResizeContent"));
				v = child.get("visible");
				if(v){
					v = child.needResize || child.get("needResizeContent");
					//if(v){
					//	console.warn("needResizeContent - " + child.id);
					//}
				}
				return v;
			});
		},
		_setNeedResizeContentAttr: function(value){
			value = !!value;
			///设置自身，不应该检查 children
			this._set("needResizeContent", value);
		},
		beforeResize: function(box){
			//return box;
		},
		afterResize: function(box){
		},
		_afterResize: function(box){
			this.afterResize();
			if(this.isShowNormal()){
				if(this.dockRegionSaveHeight){
					this.dockRegionSize.height = this._style0.height;
				}
				if(this.dockRegionSaveWidth){
					this.dockRegionSize.width = this._style0.width;
				}
			}
		},
		_checkNeedResizeContent: function(box){
			return this.get("needResizeContent") || !this._marginBox0 || !_dom.sizeEqual(box, this._marginBox0, 1);
		},
		_save_style0: function(style){
			if(!style){
				style = this.domNode.style;
			}else{
				style = rias.mixin({}, this._style0, style);
			}
			this._style0 = {
				top: style.top,
				bottom: style.bottom,
				left: style.left,
				right: style.right,
				height: style.height,
				width: style.width
			};
			///this.savePersist();///由于这里只被 showNormal 调用，故不应该 savePersist，而只应该在 _setDisplayStateAttr 和 resize 中 savePersist
		},
		_resizeToChild: function(node){
			node = rias.domNodeBy(node);
			if(!node){
				node = this.containerNode.firstChild;
			}
			_dom.noOverflowCall(this.domNode, function(){
				_dom.noOverflowCall(this.containerNode, function(){
					var box = _dom.getMarginBox(node);
					box = _dom.contentBox2marginBox(this.containerNode, box);
					_dom.setMarginSize(this.containerNode, box);
					_dom.setStyle(this.domNode, {
						height: "",
						width: ""
					});
				}, this);
			}, this);
			this.resize();
		},
		_resizeContent: function(box, cs){
			if(this.isShowNormal() || this.isShowMax()){
				this.layout();
				return true;
			}else if(this.isCollapsed() || this.isDocked()){
				return true;
			}
			return false;
		},
		_resizeDomNode: function(box, cs){
			if(this.isCollapsed()){
				///这里处理可以防止 move 和 resize 的时候改变，同时允许先改变 大小 和 约束
				if(!box){
					box = {};
				}
				if(this.region === "left" || this.region === "right"){
					box.w = this.collapsedHeight;
				}else if(this.region === "top" || this.region === "bottom"){
					box.h = this.collapsedHeight;
				}else{
					box.h = this.collapsedHeight;
					if(this.collapsedWidth > 60){
						box.w = this.collapsedWidth;
					}
				}
				if(this.showCaption && this.captionNode){
					_dom.noOverflowCall(this.captionNode, function(){
						_dom.setMarginSize(this.captionNode, _dom.marginBox2contentBox(this.domNode, box, cs));
					}, this);
				}
			}else if(this.isShowMax()){
				var parentSize = _dom.getContentBox(this.getParentNode()), ///用 getContentBox 更好些
					restrictPadding = (this.restrictPadding > 0 ? this.restrictPadding : 0);///只用于 showMax ，可以设为 0
				box = {
					t: parentSize.st + restrictPadding,
					l: parentSize.sl + restrictPadding,
					w: parentSize.w - restrictPadding - restrictPadding,
					h: parentSize.h - restrictPadding - restrictPadding
				};
			}
			_dom.setMarginBox(this.domNode, box, cs);
		},
		_resize: function(changeSize){
			//var _dt0 = new Date();
			//rias.__dt();
			var node = this.domNode,
				box, cs,
				w, h,
				cb,
				fs = node.tagName === "FIELDSET";
			//this._wasResized = true;
			if(changeSize){
				box = changeSize;
			}else{
				box = {};
			}

			cs = node.style;
			var percent = {
				t: cs.top && cs.top.indexOf("%") > 0,
				l: cs.left && cs.left.indexOf("%") > 0,
				h: cs.height && cs.height.indexOf("%") > 0,
				w: cs.width && cs.width.indexOf("%") > 0
			};
			this.beforeResize(box);

			//cs = _dom.getComputedStyle(node, !_dom.isEmptyBox(box));
			cs = _dom.getComputedStyle(node);
			if(fs){
				w = box.w;
				h = box.h;
				///需要在 setMarginBox 之后立即 setMarginBox(this.containerNode)，否则 getMarginBox(domNode) 会失真。
				if(_dom.hasWidth(node.style, this.region, false)){
					///各个浏览器对 Fieldset 的 width 处理不同，必须在这里强行设置 containerNode 以保证正确设置 width，及后面能获得正确的 containerNode 的 size,
					// 且，只应该设置 width
					/// containerNode 的 position 是 relative，不应该设置 top 和 left?
					///由于在缩小的时候，有 overflow 存在，重新获取 box 的话，导致 _contentBox 失真
					//cb = _dom.getContentBox(node, cs);
					cb = _dom.marginBox2contentBox(node, box, cs);
					_dom.setMarginSize(this.containerNode, {
						//h: cb.h,
						w: cb.w
					});
				}
			}
			this._resizeDomNode(box, cs);
			if(this.restrictBox){
				if(this.region){
					console.warn("Can not restrictBox when the widget has region: " + this.id, this);
				}else{
					_dom.restrictBox(node, this.restrictBox);
				}
			}
			box = _dom.getMarginBox(node, cs);
			///不准确的，且只应该 setMarginBox 需要的值，保持其他值可能的 %、em
			if(this.minSize){
				if(this.minSize.w && box.w < this.minSize.w){
					box.w = this.minSize.w;
					_dom.setMarginBox(node, {
						w: box.w
					}, cs);
				}
				if(this.minSize.h && box.h < this.minSize.h){
					box.h = this.minSize.h;
					_dom.setMarginBox(node, {
						h: box.h
					}, cs);
				}
			}
			if(this.maxSize){
				if(this.maxSize.w && box.w > this.maxSize.w){
					box.w = this.maxSize.w;
					_dom.setMarginBox(node, {
						w: box.w
					}, cs);
				}
				if(this.maxSize.h && box.h > this.maxSize.h){
					box.h = this.maxSize.h;
					_dom.setMarginBox(node, {
						h: box.h
					}, cs);
				}
			}
			if(this.restrictPadding >= 0){
				box = _dom.restrict(node, box, this.getParentNode(), this.restrictPadding);
			}
			if(fs && (w !== box.w || h !== box.h)){
				//如果 box 有变化，需要再次设置。
				if(_dom.hasWidth(node.style, this.region, false)){
					cb = _dom.marginBox2contentBox(node, box, cs);
					_dom.setMarginSize(this.containerNode, {
						h: cb.h,
						w: cb.w
					});
				}
			}

			/// 应该在 约束 之后保存 _style0
			if(this.isShowNormal()){
				if(percent.t || percent.l || percent.h || percent.w){
					var pb = _dom.getContentBox(this.getParentNode());
					cb = _dom.marginBox2contentBox(node, box, cs);
					cs = {};
					if(percent.t){
						cs.top = +rias.toFixed(cb.t / pb.h * 100, 2) + "%";
					}
					if(percent.l){
						cs.left = +rias.toFixed(cb.l / pb.w * 100, 2) + "%";
					}
					if(percent.h){
						cs.height = +rias.toFixed(cb.h / pb.h * 100, 2) + "%";
					}
					if(percent.w){
						cs.width = +rias.toFixed(cb.w / pb.w * 100, 2) + "%";
					}
					_dom.setStyle(node, cs);
					cs = _dom.getComputedStyle(node);///需要重新获取
				}
				this._save_style0();
			}

			if(this._checkNeedResizeContent(box)){
				this._marginBox0 = box;
				//if(this.containerNode === this.domNode){
				this.set("needResizeContent", this._resizeContent(_dom.marginBox2contentBox(node, box, cs), cs) == false);
				//}else{
				//	noOverflowCall(this.containerNode, function(){
				//		this.set("needResizeContent", this._resizeContent(_dom.marginBox2contentBox(node, box, cs), cs) == false);
				//	}, this);
				//}
				//console.debug("_resizeContent - " + this.id + " - " + (new Date() - _dt0) + " ms.");
				//}else{
				//console.debug("_resizeContent pass - " + this.id + " - " + (new Date() - _dt0) + " ms.");
			}

			this._afterResize(box);
			this.savePersist();
			//console.debug("resize - " + this.id + " - " + (new Date() - _dt0) + " ms.");
			return box;
		},
		_handleOnScroll: function(){
			if(this.isDestroyed(false)){
				return;
			}
			/// _handleOnScroll 不止是在 _onContainerChanged 中调用，需要显式处理 onScrollHandle 和 _onScrollHandle
			if(this.onScrollHandle){
				this.onScrollHandle.remove();
				this.onScrollHandle = undefined;
			}
			if(this._onScrollHandle){
				this._onScrollHandle.remove();
				this._onScrollHandle = undefined;
			}
			var self = this;
			if(self.domNode.parentNode && self.restrictPadding >= 0){
				self.onScrollHandle = rias.on(self.domNode.parentNode, "scroll", function(){
					self._onScrollHandle = rias._throttleDelayed(self.id + "_onScroll", function(){
						self._onScrollHandle = undefined;
						self._resize();
					}, self, 370)();
				});
			}
		},
		_onContainerChanged: function(container){
			this.inherited(arguments);
			this._handleOnScroll();
		},

		canHide: function(formResult){
			return true;
		},
		_checkCanHide: function(){
			///this.canHide() 有可能是 promise，返回 this.canHide()
			return rias.when(this.canHide != false && this.canHide.apply(this, arguments || []) != false);
		},
		_hide: function(newState){
			newState = (arguments.length > 0 ? newState : intHidden);
			if(displayStateInt(this.displayState) !== newState){
				this.displayState = displayStateStr(newState);
			}
			this._onHide();
			if(newState === intClosed){
				/// _close 调用了 destroy，需要等待 _playingDeferred 。
				this.defer(function(){
					this._close(newState);
				});
			//}else if(newState === intTransparent){
			}else{
				this._updateDisplayState();
			}
		},
		hide: function(){
			return this.set("displayState", displayHidden);
		},

		_close: function(){
			if(!this.isDestroyed(true)){
				if(this.onClose() == false){
					this.displayState = displayHidden;
				}else{
					this.destroy();
				}
			}
		},
		close: function(){
			return this.set("displayState", displayClosed);
		},

		_show: function(){
			var self = this;
			return rias.all(this._renderDeferreds).always(function(arr){
				self._renderDeferreds.length = 0;
				self.domNode.style.opacity = self._shownOpacity;
				//console.debug(self.id + "_show - opacity: " + self._shownOpacity);
				//self._wasShown = true;
				//if(!self.isShowing()){/// showMax 等状态下，仍然会有 _show() 调用，比如 _Module.afterLoaded
				if(self.displayState !== displayShowNormal){
					self.displayState = displayShowNormal;
				}
				self._updateDisplayState();
				return self.whenPlayed(function(){
					self._onShow();
					return self.isShowing();
				});
			});
		},
		show: function(){
			if(!this._started){
				var self = this;
				return rias.when(this.startup()).then(function(){
					return self.set("displayState", displayShowNormal);
				});
			}
			return this.set("displayState", displayShowNormal);
		},

		onRestore: function(){
		},
		_restore: function(){
			//var self = this;
			///restore 时，_restore 先于 _show 执行，而在 _restore.then(比如 Dialog._restore) 中需要判断该值，故应设置该值。
			/// _show 是 Deferred，在 afterLoadedAll 之后执行。
			//this._wasShown = true;
			if(this.restrictBox){
				delete this.restrictBox.disabled;
			}
			if(this.displayState !== displayShowNormal){
				this.displayState = displayShowNormal;
			}
			if(this._minSize0){
				this.set("minSize", this._minSize0);
			}
			if(this._maxSize0){
				this.set("maxSize", this._maxSize0);
			}
			this._updateDisplayState();
			this.whenPlayed(function(){
				this.onRestore();
			});
			return this.isShowNormal();
		},
		restore: function(forceVisible, ignoreMax, ignoreCollapsed, child, _deep){
			var self = this,
				play = !this.isShowing();///需要取 restore 之前的状态。
			function _do(focus){
				if(self.autoFocus && focus != false){
					self.focus(child);
				}
			}
			if(this.isDestroyed(true) || this.isClosed()){
				return rias.when(false).always(function(result){
					_do(result);
					return self;
				});
			}
			if((this.isShowNormal() || ignoreMax && this.isShowMax() || ignoreCollapsed && this.isCollapsed()) && this.get("visible")){
				///没有状态转换时，还是不强行 focus 好些，否则会导致 popup 失去焦点。
				return rias.when(false).always(function(result){
					_do(result);
					return self;
				});
			}
			return this.inherited(arguments).always(function(){
				return self.set("displayState", displayShowNormal).always(function(result){
					if(play){/// 不建议 return self._doPlayNode
						self._doPlayNode(true, self.domNode, self.duration / 2);
					}
					return result;
				});
			}).then(function(result){
				_do(result);
				return self;
			});
		},

		onExpand: function(){
		},
		_expand: function(){
			var dns = this.domNode.style;
			if(this._style0){
				if(this._style0.height){
					dns.height = this._style0.height;
				}else{
					dns.height = "";
				}
				if(this._style0.width){
					dns.width = this._style0.width;
				}else{
					dns.width = "";
				}
			}
			if(this.displayState !== displayShowNormal){
				this.displayState = displayShowNormal;
			}
			this._updateDisplayState();
			this.whenPlayed(function(){
				this.onExpand();
			});
			return this.isShowNormal();
		},
		expand: function(){
			return this.show();
		},

		onCollapse: function(){
		},
		_collapse: function(){
			if(this.displayState !== displayCollapsed){
				this.displayState = displayCollapsed;
			}
			if(this._minSize0){
				this.set("minSize", undefined);
			}
			this._updateDisplayState();
			this.whenPlayed(function(){
				this.onCollapse();
			});
			return this.isCollapsed() || this.isDocked();
		},
		collapse: function(){
			if(!this._started){
				var self = this;
				return rias.when(this.startup()).then(function(){
					return self.set("displayState", displayCollapsed);
				});
			}
			return this.set("displayState", displayCollapsed);
		},

		onShowMax: function(){
		},
		_showMax: function(){
			if(this.displayState !== displayShowMax){
				this.displayState = displayShowMax;
			}
			//if(this.restrictBox){
			//	//this.restrictBox.disabled = true;
			//}
			if(this._maxSize0){
				this.set("maxSize", undefined);
			}
			this._updateDisplayState();
			this.whenPlayed(function(){
				this.onShowMax();
			});
			return this.isShowMax();
		},
		showMax: function(){
			if(!this._started){
				var self = this;
				return rias.when(this.startup()).then(function(){
					return self.set("displayState", displayShowMax);
				});
			}
			return this.set("displayState", displayShowMax);
		},

		display: function(displayState){
			if(this.isDestroyed(false)){
				return rias.when(this.displayState);
			}
			switch(displayState){
				case intShowNormal://1:
				case displayShowNormal://1:
					return this.show();
				case intHidden://0:
				case displayHidden://0:
					return this.hide();
				case intClosed://-1:
				case displayClosed://-1:
					return this.close();
				//case intTransparent://-2:
				//case displayTransparent://-2:
				//	return this.displayState === displayTransparent;
				case intShowMax://2:
				case displayShowMax://2:
					return this.showMax();
				case intCollapsed://3:
				case displayCollapsed://3:
					return this.collapse();
				default:
					return rias.when(this.displayState);
			}
		},
		isDisplayState: function(state){
			if(this.isDestroyed(false)){
				return false;
			}
			switch(state){
				case intShowNormal://1:
				case displayShowNormal://1:
					return this.displayState === displayShowNormal;
				case intHidden://0:
				case displayHidden://0:
					return this.displayState === displayHidden;
				case intClosed://-1:
				case displayClosed://-1:
					return this.displayState === displayClosed;
				//case intTransparent://-2:
				//case displayTransparent://-2:
				//	return this.displayState === displayTransparent;
				case intShowMax://2:
				case displayShowMax://2:
					return this.displayState === displayShowMax;
				case intCollapsed://3:
				case displayCollapsed://3:
					return this.displayState === displayCollapsed;
				default:
					return false;
			}
		},
		isShowNormal: function(){
			return this.isDisplayState(displayShowNormal);
		},
		isShowMax: function(){
			return this.isDisplayState(displayShowMax);
		},
		isCollapsed: function(){
			return this.isDisplayState(displayCollapsed);
		},
		isDocked: function(exact){
			return !this.isDestroyed(false) && this.dockTo && this.displayState === displayHidden;
		},
		isShowing: function(excludeCollapsed){
			return !this.isDestroyed(false) && (this.displayState === displayShowNormal || this.displayState === displayShowMax
					|| (!excludeCollapsed && this.displayState === displayCollapsed));
		},
		isHidden: function(){
			return this.isDisplayState(displayHidden);
		},
		isClosed: function(){
			return this.isDisplayState(displayClosed);
		},
		//isTransparent: function(){
		//	return this.isDisplayState(displayTransparent);
		//},

		///displayState:	1=shown(showNormal, restore, expand), 2=showMax, 3=collapsed(showMin, shrunk),
		//			0=hideen(display=none), -1=closed(destroy), -2=hideen(but display)
		whenPlayed: function(callback){
			var self = this;
			return rias.when(this._playingDeferred || true).always(function(result){
				if(result && rias.isFunction(callback)){
					return callback.apply(self, [result]);
				}
				return self.displayState;
			});
		},
		_updateDisplayState: function(){
			//console.debug("_updateDisplayState - " + this.id + " - " + this.displayState);
			this._containerLayout();
		},
		onDisplayStateChanging: function(value, oldValue){
			return value;
		},
		onDisplayStateChanged: function(value){},
		_setDisplayStateAttr: function(value){
			var self = this;
			function _do(result){
				if(result){
					self._playingDeferred = undefined;
					if(!self.isDestroyed(true)){
						self.onDisplayStateChanged(self.displayState);
						self.savePersist();
					}
				}
				return self.displayState;
			}

			value = displayStateStr(value);
			if(value !== self.displayState){
				value = self.onDisplayStateChanging(value, self.displayState);
				if(value === displayClosed || value === displayHidden){
					return self._checkCanHide().always(function(result){
						if(result != false){
							if(value === displayClosed && !self.closable){///只处理 closed
								if(self.dockTo){
									return self.collapse();
								}
								return self.hide();
							}
							///由于有 _close/destroy，需要 _doPlayNode 之后再 _set("displayState", value);
							return self._doPlayNode(false, self.domNode, self.duration / 2).always(function(){
								self._set("displayState", value);
								self._doDisplay(value);
								return self.whenPlayed(_do);
							});
						}
						return self.displayState;
					});
				}else{
					self._set("displayState", value);
					self._doDisplay(value);
					return self.whenPlayed(_do);
				}
			}else{
				return rias.when(self.displayState);
			}
		},
		//_onDisplayStateAttr: function(value, oldValue){
		//	this._doDisplay(value);
		//},

		_playingHide: rias.fx.fadeOut,
		_playingShow: rias.fx.fadeIn,
		_playingCollapse: rias.fx.sizeTo,
		_playingExpand: rias.fx.sizeTo,
		_playingSize: rias.fx.sizeTo,

		duration: rias.defaultDuration,

		_stopPlay: function(destroy){
			var p;
			if(this._playingContent){
				this._playingContent.stop(true);
				this._playingContent = undefined;
			}
			if(this._playing){
				p = this._playing;
				this._playing.stop(true);
				this._playing = undefined;
			}
			if(this._playingEndHandle){
				this._playingEndHandle.remove();
				this._playingEndHandle = undefined;
			}
			if(this._playingStopHandle){
				this._playingStopHandle.remove();
				this._playingStopHandle = undefined;
			}
			if(this._playingDeferred){
				/// 正常情况下，_playingDeferred 不应该 cancel，而只应该等待 resolve
				if(destroy){
					if(!this._playingDeferred.isFulfilled()){
						console.debug(this.id, "cancel play", p);
					}
					this._playingDeferred.cancel();
					this._playingDeferred = undefined;
				}
			}
		},
		_doPlayNode: function(show, node, duration){
			var self = this,
				df = rias.newDeferred();
			node = node || self.domNode;
			duration = duration || self.duration;
			self._stopPlay();
			if(self.animate){
				if(show == false){
					self._playingContent = rias.fx.fadeOut({
						node: node,
						duration: duration,
						end: self._hiddenOpacity,
						onEnd: function(){
							self._playingContent = undefined;
							df.resolve();
						},
						onStop: function(){
							self._playingContent = undefined;
							df.resolve();
						}
					});
				}else{
					self._playingContent = rias.fx.fadeIn({
						node: node,
						duration: duration,
						start: self._hiddenOpacity,
						end: self._shownOpacity0 == undefined ? self._shownOpacity : self._shownOpacity0,
						onEnd: function(){
							self._playingContent = undefined;
							df.resolve();
						},
						onStop: function(){
							self._playingContent = undefined;
							df.resolve();
						}
					});
				}
				self._playingContent.play();
			}else{
				_dom.setStyle(node, "opacity", show == false ? self._hiddenOpacity : self._shownOpacity0 == undefined ? self._shownOpacity : self._shownOpacity0);
				df.resolve();
			}
			return df.promise;
		},
		_doDisplay: function(newState, isNext){
			var self = this,
				oldState = this._displayState0,//不能取 this.displayState，因为已经改变了。
				canPlay = oldState && this._started && this.animate && !this.isDestroyed(true) && this.get("visible"),
				dn = this.domNode,
				cn = this.containerNode,
				cpn = this.captionNode,
				duration = this.duration,
				restrictPadding = (this.restrictPadding > 0 ? this.restrictPadding : 0),///只用于 showMax ，可以设为 0
				isV = (this.region === "left" || this.region === "right"),
				_style0 = this._style0,
				defShow = false;

			function _mb(){
				return _dom.getBoxExtents(dn);
			}
			function _style0Auto(pn){///这个只是判断 是否是 auto，不判断 %
				/// _style0[pn] = "0" 视作非 auto
				return !_style0 || !_style0[pn] || _style0[pn] === "auto";
			}
			function _set_style0(node){
				if(_style0 && !self.region){
					if(_style0Auto("top")){
						node.style.top = "";
					}
					if(_style0Auto("left")){
						node.style.left = "";
					}
					if(_style0Auto("bottom")){
						node.style.bottom = "";
					}
					if(_style0Auto("right")){
						node.style.right = "";
					}
					if(_style0Auto("height")){
						node.style.height = "";
					}
					if(_style0Auto("width")){
						node.style.width = "";
					}
				}
			}
			function expandParam(){
				return {
					__fxparamname: "expandParam",
					method: "combine",
					node: dn,
					duration: duration,
					properties: {
						top: self.region === "bottom" && !_style0Auto("top") ? {
							end: _style0.top
						} : undefined,
						left: self.region === "right" && !_style0Auto("left") ? {
							end: _style0.left
						} : undefined,
						bottom: !_style0Auto("bottom") ? {
							end: _style0.bottom
						} : undefined,
						right: !_style0Auto("right") ? {
							end: _style0.right
						} : undefined,
						height: !isV && !_style0Auto("height") ? {
							end: _style0.height
						} : undefined,
						width: isV && !_style0Auto("width") ? {
							end: _style0.width
						} : undefined
					},
					onBegin: function(){
						preExpand(true);
						_set_style0(dn);
					},
					onEnd: function() {
						doExpanded(true);
					}
				};
			}
			function collapseParam(){
				return {
					__fxparamname: "collapseParam",
					method: "combine",
					node: dn,
					duration: duration,
					properties: {
						top: self.region === "bottom" ? {
							end: _dom.getStyle(dn, "top") + _dom.getStyle(dn, "height") - (self.showCaption && cpn ? self.collapsedHeight : 0)
						} : undefined,
						left: self.region === "right" ? {
							end: _dom.getStyle(dn, "left") + _dom.getStyle(dn, "width") - (self.showCaption && cpn ? self.collapsedHeight : 0)
						} : undefined,
						bottom: !_style0Auto("bottom") ? {
							end: _style0.bottom
						} : undefined,
						right: !_style0Auto("right") ? {
							end: _style0.right
						} : undefined,
						height: !isV ? {
							end: (self.showCaption && cpn ? self.collapsedHeight : 0)
						} : undefined,
						width: isV ? {
							end: (self.showCaption && cpn ? self.collapsedHeight : 0)
						} : undefined
					},
					onEnd: function(){
						preExpand(false);
						doExpanded(false);
					}
				};
			}
			function sizeMAxParam(){
				var parentSize = _dom.getContentBox(self.getParentNode()); ///用 getContentBox 更好些
				var mb = _mb();
				return {
					__fxparamname: "sizeMAxParam",
					method: "combine",
					node: dn,
					duration: duration,
					properties: {
						top: parentSize ? {
							end: parentSize.st + restrictPadding
						} : !_style0Auto("top") ? {
							end: _style0.top
						} : undefined,
						left: parentSize ? {
							end: parentSize.sl + restrictPadding
						} : !_style0Auto("left") ? {
							end: _style0.left
						} : undefined,
						width: parentSize ? {
							end: (parentSize.w - restrictPadding - restrictPadding - mb.w)
						} : !_style0Auto("width") ? {
							end: _style0.width
						} : undefined,
						height: parentSize ? {
							end: (parentSize.h - restrictPadding - restrictPadding - mb.h)
						} : !_style0Auto("height") ? {
							end: _style0.height
						} : undefined
					},
					onBegin: function(){
						///由于 onEnd 会调用两次，且， Widget.resize/layout 中有 defer/debounce 存在，hidden 会导致 resize 不正常.
						_dom.visible(cn, false, 0);
					},
					onEnd: function(){
						_dom.visible(cn, true, 1);
						doMax(true);
					}
				};
			}
			function sizeNormalParam(){
				return {
					__fxparamname: "sizeNormalParam",
					method: "combine",
					node: dn,
					duration: duration,
					properties: {
						top: !_style0Auto("top") ? {
							end: _style0.top
						} : undefined,
						left: !_style0Auto("left") ? {
							end: _style0.left
						} : undefined,
						bottom: !_style0Auto("bottom") ? {
							end: _style0.bottom
						} : undefined,
						right: !_style0Auto("right") ? {
							end: _style0.right
						} : undefined,
						width: !_style0Auto("width") ? {
							end: _style0.width
						} : undefined,
						height: !_style0Auto("height") ? {
							end: _style0.height
						} : undefined
					},
					onBegin: function(){
						_dom.visible(cn, false, 0);
						_set_style0(dn);
					},
					onEnd: function(){
						_dom.visible(cn, true, 1);
						doMax(false);
					}
				};
			}
			/*function hideParam(){
				return {
					__fxparamname: "hideParam",
					node: dn,
					duration: duration,
					//end: self._hiddenOpacity,
					onEnd: function(){
						doShow(newState);
					}
				};
			}*/
			/*function showParam(){
				return {
					__fxparamname: "showParam",
					node: dn,
					duration: duration,
					start: self._hiddenOpacity,
					onBegin: function(){
						doShow(newState, 0);
					},
					onEnd: function(){
					}
				};
			}*/
			function doShow(value){
				_dom.visible(cn, value > intHidden);
				_dom.visible(dn, value > intHidden);
				var r = true;
				if(value > intHidden){
					//if(_style0 && oldState !== intShowNormal){
						//if(_style0.top){
						//	dn.style.top = _style0.top;
						//}
						//if(_style0.left){
						//	dn.style.left = _style0.left;
						//}
						//if(self._changeSize){
						//	delete self._changeSize.t;
						//	delete self._changeSize.l;
						//}
					//}
					_dom.setStyle(dn, _style0);
					delete self._changeSize;
					r = self._show();/// _show 有可能是 promise
				}else{
					self._hide(value);
				}
				defShow = rias.when(r);
				return defShow;
			}
			function doMax(value){
				if(value){
					self._showMax(value);
				}else{
					_dom.setStyle(dn, _style0);
					delete self._changeSize;
					self._restore();
				}
			}
			function preExpand(value){
				_dom.visible(cn, value);
				_dom.visible(dn, true);
				if(value){
					cpn.style.height = "";///auto?
					cpn.style.width = "";
				}
			}
			function doExpanded(value){
				if(value){
					if(_style0){
						_dom.setStyle(dn, {
							top: _style0.top,
							left: _style0.left,
							bottom: _style0.bottom,
							right: _style0.right
						});
						if(self._changeSize){
							delete self._changeSize.t;
							delete self._changeSize.l;
						}
					}
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
				if(self._playingStopHandle){
					self._playingStopHandle.remove();
					self._playingStopHandle = undefined;
				}
				///_beforeUpdateSize 包含 _nextState，故 _afterUpdateSize 也应该包含
				if(_nextState){
					self._displayState0 = displayStateInt(self.displayState);
					self._doDisplay(_nextState, true);///需要跳过 _beforeUpdateSize
				}else{
					self._afterUpdateSize(self.id + " - _doDisplay._onEnd.", true);///需要与 _beforeUpdateSize 的是否忽略 _nextState 匹配
					self._playing = undefined;
					if(self._playingDeferred){
						self._playingDeferred.resolve(self.displayState);
					}
					//if(self._started && self.animate && self.get("visible") && newState > intHidden){
					//	self._doPlayNode();
					//}
				}
			}

			newState = displayStateInt(newState);
			if(isNaN(newState)){
				newState = intShowNormal;
			}
			if(self.isDestroyed(true) || oldState === newState){
				return;
			}
			self._stopPlay();
			///onShow 等事件中需要使用 self.displayState，提前设置.
			self._displayState0 = newState;
			self.displayState = displayStateStr(newState) || displayShowNormal;
			if(newState <= intHidden){
				///hide...
				//if(canPlay && self._playingHide){
				//	self._playing = self._playingHide(hideParam());
				//}else{
					doShow(newState);
				//}
			}else{
				if(newState === intShowMax){
					///showMax
					if(dn.parentNode){
						if(oldState === intCollapsed){
							///collapsed
							if(canPlay && self._playingSize && self._playingExpand){
								self.displayState = "showNormal";///有 _nextState 时，displayState 需要匹配，以保证状态正确
								self._playing = self._playingExpand(expandParam());
								_nextState = "showMax";
							}else{
								preExpand(true);
								doExpanded(true);
								doMax(true);
							}
						}else if(isNaN(oldState) || oldState <= intHidden){
							///hide...
							self.displayState = "showNormal";///有 _nextState 时，displayState 需要匹配，以保证状态正确
							doShow(newState, 1);
							_nextState = "showMax";
						}else{
							///showNormal
							if(canPlay && self._playingSize){
								self._playing = self._playingSize(sizeMAxParam());
							}else{
								doMax(true);
							}
						}
					}else{
						//if(canPlay && self._playingShow){
						//	self._playing = self._playingShow(showParam());
						//}else{
							doShow(newState, 1);
						//}
					}
				}else if(newState === intCollapsed){
					///collapse
					if(oldState === 2){
						///showMax
						if(canPlay && self._playingCollapse && self._playingSize){
							self.displayState = "showNormal";///有 _nextState 时，displayState 需要匹配，以保证状态正确
							self._playing = self._playingSize(sizeNormalParam());
							_nextState = "collapsed";
						}else{
							doMax(false);
							preExpand(false);
							doExpanded(false);
						}
					}else if(isNaN(oldState) || oldState <= intHidden){
						///hide...
						self.displayState = "showNormal";///有 _nextState 时，displayState 需要匹配，以保证状态正确
						doShow(newState, 1);
						_nextState = "collapsed";
					}else{
						///showNormal
						if(canPlay && self._playingCollapse){
							self._playing = self._playingCollapse(collapseParam());
						}else{
							preExpand(false);
							doExpanded(false);
						}
					}
				}else{
					///showNormal
					canPlay = self._started && self.animate;
					if(oldState === intShowMax){
						///showMax
						if(canPlay && self._playingSize){
							self._playing = self._playingSize(sizeNormalParam());
						}else{
							doMax(false);
						}
					}else if(oldState === intCollapsed){
						///collapsed
						if(canPlay && self._playingExpand){
							self._playing = self._playingExpand(expandParam());
						}else{
							preExpand(true);
							doExpanded(true);
						}
					}else{
						///hide...
						//if(self._started && self.animate && self._playingShow){
						//	self._playing = self._playingShow(showParam());
						//}else{
							doShow(newState, 1);
						//}
					}
				}
			}
			function _play(){
				///有 延迟 存在，应该关闭 resize，最后统一 resize
				/// 跳过 doShow，即 defShow
				if(!isNext){
					self._beforeUpdateSize(self.id + " - _doDisplay._play.");
				}
				if(self._playing){
					if(!self._playingDeferred){
						self._playingDeferred = rias.newDeferred();
					}
					///直接 onEnd = _onEnd 会覆盖 _playing 原有的定义，应该用 aspect.after
					//self._playing.onEnd = _onEnd;
					self._playingEndHandle = rias.after(self._playing, "onEnd", _onEnd);
					self._playingStopHandle = rias.after(self._playing, "onStop", function(){
						console.debug("_doDisplay stop - " + self.id, self._playing);
						_onEnd();
					});
					//console.debug(self.displayState, self.id, self._playing);
					self._playing.play();
				}else{
					_onEnd();
				}
			}
			if(defShow){/// _show 是 promise 时，需要 then
				defShow.then(function(){
					if(newState > intHidden){
						self.resize();///需要单独 resize，以保证 _style0 的正确
					}
					_play();
				});
			}else{
				_play();
			}
		}

	});

	Widget.displayShowNormal = displayShowNormal;
	Widget.displayShowMax = displayShowMax;
	Widget.displayCollapsed = displayCollapsed;
	Widget.displayHidden = displayHidden;
	Widget.displayClosed = displayClosed;
	//Widget.displayTransparent = displayTransparent;
	Widget.displayStateInt = displayStateInt;
	Widget.displayStateStr = displayStateStr;

	return Widget;

});
