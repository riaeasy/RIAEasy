
//RIAStudio client runtime widget - _TabControllerMixin

define([
	"riasw/riaswBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/Menu",
	"riasw/sys/MenuItem",
	"riasw/sys/ToolButton",
	"riasw/form/DropDownButton"
], function(rias, _TemplatedMixin, Menu, MenuItem, ToolButton, DropDownButton){

	var _dom = rias.dom;

	rias.declare("riasw.layout._TabControllerButton", [ToolButton], {
		baseClass: "riaswTabStripButton",

		isFocusable: function(){
			return false;
		}
	});

	rias.declare("riasw.layout._TabControllerMenuButton", [DropDownButton], {
		baseClass: "riaswTabStripButton",
		//popupPositions: ['below', 'above'],///_HasDropDown 中已经定义

		isFocusable: function(){
			return false;
		},
		isLoaded: function(){///覆盖 _HasDropDown 的 isLoaded，每次刷新下拉菜单
			// recreate menu every time, in case the TabContainer's list of children (or their icons/labels) have changed
			return false;
		},

		toggleDropDown: function(){
			this.dropDown = new Menu({
				//ownerDocument: this.ownerDocument,
				ownerRiasw: this,
				//parent: rias.desktop,
				id: this.controller.id + "_menu",
				dir: this.dir,
				lang: this.lang,
				textDir: this.textDir
			});
			rias.forEach(this.controller._buttons, function(btn){
				var menuItem = new MenuItem({
					//ownerDocument: this.ownerDocument,
					ownerRiasw: this.dropDown,
					id: btn.id + "_tabControllerMenuItem",
					label: btn.caption || btn.label || btn.title,
					iconClass: btn.iconClass,
					disabled: btn.disabled,
					dir: btn.dir,
					lang: btn.lang,
					textDir: btn.textDir || this.controller.textDir,
					onClick: function(evt){
						btn._onClick(evt);
					}
				});
				this.dropDown.addChild(menuItem);
			}, this);
			return this.inherited(arguments);
		},

		closeDropDown: function(/*Boolean*/ focus){
			this.inherited(arguments);
			if(this.dropDown){
				this._popupStateNode.removeAttribute("aria-owns");	// remove ref to node that we are about to delete
				this.dropDown.destroy();
				this.dropDown = undefined;
			}
		}
	});

	var _sizeMax = 50000;
	var riaswType = "riasw.layout._TabControllerMixin";
	var Widget = rias.declare(riaswType, [_TemplatedMixin], {

		templateString:
			"<div class='dijitReset'>" +
				"<div data-dojo-type='riasw.layout._TabControllerMenuButton' class='riaswHidden' id='${id}_menuBtn'" +
					"data-dojo-props='iconClass: \"riaswTabStripIconMenu\"' " +
					"data-dojo-attach-point='_menuBtn'>&#9660;</div>" +
				"<div data-dojo-type='riasw.layout._TabControllerButton' class='riaswHidden' id='${id}_leftBtn'" +
					"data-dojo-props='iconClass:\"riaswTabStripIconLeft\"' " +
					"data-dojo-attach-point='_leftBtn' data-dojo-attach-event='onClick: doSlideLeft'>&#9664;</div>" +
				"<div data-dojo-type='riasw.layout._TabControllerButton' class='riaswHidden' id='${id}_rightBtn'" +
					"data-dojo-props='iconClass:\"riaswTabStripIconRight\"' " +
					"data-dojo-attach-point='_rightBtn' data-dojo-attach-event='onClick: doSlideRight'>&#9654;</div>" +
				"<div class='riaswTabListWrapper' data-dojo-attach-point='scrollNode'>" +
					"<div role='tablist' data-dojo-attach-event='onkeydown:onkeydown' data-dojo-attach-point='focusNode,containerNode' class='riaswTabContainer'>" +
						//"<span data-dojo-attach-point='spaceNode' class='dijitInline'></span>"+
					"</div>" +
				"</div>" +
			"</div>",

		buttonCtor: null,
		layoutVertical: false,
		layoutRtl: false,
		alwaysContainerLayout: true,

		//useMenu: true,
		//useSlider: true,

		// Override default behavior mapping class to DOMNode
		//_setClassAttr: { node: "containerNode", type: "class" },

		postMixInProperties: function(){
			this._buttons = [];
			this.inherited(arguments);
			this.targetContainer = this.getOwnerRiasw();
		},
		_getSize: function(node){
			return _dom.getStyle(node, this.layoutVertical ? "height" : "width");
		},
		_setSize: function(node, value){
			_dom.setStyle(node, this.layoutVertical ? "height" : "width", value);
		},
		buildRendering: function(){
			if(!this.region){
				this.region = "top";
			}
			this.layoutVertical = !!this.layoutVertical;//this.region == "left" || this.region == "right";
			this.inherited(arguments);
			///_dom.addClass(this.domNode, this._baseClass0 + "-" + this.region);///改在 _setRegionAttr 中处理
			this._initSpaceNode();
			this._setSize(this.containerNode, _sizeMax + "px");

			this._scrollButtons = [this._menuBtn.domNode, this._rightBtn.domNode, this._leftBtn.domNode];
			if(this.layoutVertical){
				this._leftBtn.set("iconClass", "riaswTabStripIconUp");
				this._rightBtn.set("iconClass", "riaswTabStripIconDown");
			}
			this._menuBtn.controller = this;
			///_setContainerRiasw(this) 调用了 _doContainerChanged，无需显式调用 _containerLayout
			this._leftBtn._setContainerRiasw(this);
			this._rightBtn._setContainerRiasw(this);
			this._menuBtn._setContainerRiasw(this);
		},
		postCreate: function(){
			this.inherited(arguments);
			this.containerNode.dojoClick = true;
		},
		_stopAnimation: function(){
			if(this._anim){
				this._anim.stop(true);
			}
			this._anim = undefined;
		},
		destroyRendering: function(/*Boolean?*/ preserveDom){
			if(!preserveDom){
				if(this.spaceNode){
					_dom.destroy(this.spaceNode);
				}
			}else{
				delete this.spaceNode;
			}
			this.inherited(arguments);
		},
		_onDestroy: function(){
			this._stopAnimation();
			this.inherited(arguments);
			this._scrollButtons.length = 0;
			this.targetContainer = undefined;
		},

		_createButton: function(params){
			if(!params || !params.ownerRiasw){
				console.error("Must has a ownerRiasw param.");
			}
			var ctor = rias.isString(this.buttonCtor) ? rias.getObject(this.buttonCtor) : this.buttonCtor;
			return new ctor(rias.mixinDeep({
				ownerRiasw: this,///ownerRiasw 需要由 params 覆盖为 targetWidget
				controller: this,
				layoutVertical: this.layoutVertical,
				dir: this.dir,
				lang: this.lang,
				textDir: this.textDir || this.textDir,
				style: {
					"float": this.layoutRtl ? this.layoutVertical ? "bottom" : "right" : ""
				}
			}, params));
		},
		_initSpaceNode: function(){
			///该方法必须实现。
			///throw new Error("Unimplemented API: " + riaswType + "._createSpaceNode.");
			this.spaceNode = this._createButton({
				//srcNodeRef: this.spaceNode,
				//ownerDocument: this.ownerDocument,
				ownerRiasw: this,
				id: this.id + "_spaceNode",
				"class": "riaswTabSpace",
				disabled: true,
				closable: false,
				iconClass: "",
				label: "",
				//showLabel: true,
				dir: this.dir,
				lang: this.lang,
				textDir: this.textDir || this.textDir,
				style: {
					"float": ""
				}
			}).domNode;
			this.containerNode.appendChild(this.spaceNode);
		},
		_refreshbuttons: function(){
			if(this.layoutVertical){
				/// Button 自身维护 居中
				this._leftBtn.region = "top";
				this._rightBtn.region = "bottom";
				this._menuBtn.region = "top";
			}else{
				this._leftBtn.region = "left";
				this._rightBtn.region = "right";
				this._menuBtn.region = this.layoutRtl ? "left" : "right";
			}
			var _float = this.layoutRtl ? this.layoutVertical ? "bottom" : "right" : "";
			//_dom.visible(this.spaceNode, !!_float);
			rias.forEach(this._buttons, function(child){
				_dom.setStyle(child.domNode, "float", _float);
			});
		},
		_setLayoutVerticalAttr: function(value){
			value = !!value;
			rias.forEach(this.splitBaseClass(), function(cls){
				rias.dom.toggleClass(this.domNode, cls + "Vertical", value);
			}, this);
			this._set("layoutVertical", value);
			this._refreshbuttons();
		},
		//_onLayoutVerticalAttr: function(value, oldValue){
		//},
		_setLayoutRtlAttr: function(value){
			value = !!value;
			rias.forEach(this.splitBaseClass(), function(cls){
				rias.dom.toggleClass(this.domNode, cls + "Rtl", value);
			}, this);
			this._set("layoutRtl", value);
			this._refreshbuttons();
		},
		//_onLayoutRtlAttr: function(value, oldValue){
		//},
		_setRegionAttr: function(value){
			if(!value){
				value = "top";
			}
			this.inherited(arguments, [value]);
		},

		_beforeLayout: function(){
			this._stopAnimation();

			var l, d,
				box = _dom.getContentBox(this.domNode),
				children;
			l = this._getTabsSize();
			d = _dom.marginBox2contentBox(this.scrollNode, box);
			d = (this.layoutVertical ? d.h : d.w);
			d = l > 0 && d < l;

			rias.forEach(this._scrollButtons, function(node){
				_dom.toggleClass(node, "riaswHidden", !d);
			});
			if(d){
				children = [this._menuBtn, this._leftBtn, this._rightBtn, {
					domNode: this.scrollNode,
					region: "center"
				}];
			}else{
				children = [{
					domNode: this.scrollNode,
					region: "center"
				}];
			}
			_dom.layoutChildren.apply(this, [this.domNode, box, children]);

			this._contentBox = _dom.getContentBox(this.scrollNode);
			this._contentBox = _dom.marginBox2contentBox(this.containerNode, this._contentBox);

			// set proper scroll so that selected tab is visible
			this.scrollNode[this.layoutVertical ? "scrollTop" : "scrollLeft"] = this._convertToScrollBegin(this._getScrollForSelectedTab());
			// Enable/disabled left right buttons depending on whether or not user can scroll to left or right
			this._setScrollButton(this._getScroll());

			return this.beforeLayout(this._contentBox, false);///没有必要 resizeContent(_layoutChildren)
		},
		//layout: function(/*String?*/ changedChildId, /*Number?*/ changedChildSize){
		//	//this.inherited(arguments);
		//	this._beforeLayout();
		//},

		_resizeDomNode: function(box, cs){
			var cb = _dom.getMarginBox(this.containerNode);
			if(this.region && this.region !== "center"){
				if(this.layoutVertical){
					//cb.w = _dom.contentBox2marginBox(this.scrollNode, cb).w;/// scrollNode 的 margin/padding 有特殊作用，故应忽略
					box.w = _dom.contentBox2marginBox(this.domNode, cb).w;
				}else{
					//cb.h = _dom.contentBox2marginBox(this.scrollNode, cb).h;/// scrollNode 的 margin/padding 有特殊作用，故应忽略
					box.h = _dom.contentBox2marginBox(this.domNode, cb).h;
				}
			}
			_dom.setMarginBox(this.domNode, box);
		},

		getChildren: function(){
			return this._buttons;///优化速度。
		},
		_setupChild: function(/*_WidgetBase*/child, /*int*/ insertIndex){
			this.inherited(arguments, [child, ++insertIndex]);
		},
		addChild: function(button, insertIndex, noresize){
			if(button){
				if(!rias.contains(this._buttons, button)){
					this._buttons.push(button);
				}
				this.inherited(arguments);
			}
		},
		removeChild: function(button, noresize){
			if(button){
				if(button.targetWidget){///destroy 中调用时 button.targetWidget 已经 destroy
					if(button.targetWidget === this.currentTarget){
						this.currentTarget = undefined;
					}
					button.targetWidget.controlButton = undefined;
					button.targetWidget.domNode.setAttribute("aria-labelledby", button._labelledby0);
				}
				var i = this._buttons.indexOf(button);
				if(i >= 0){
					this._buttons.splice(i, 1);
				}
				this.inherited(arguments);
			}
		},
		selectChild: function(/*_WidgetBase*/ child, /*Boolean*/ containerFocused){
			if(child === this.currentTarget){
				return;
			}

			if(this.currentTarget){
				this.currentTarget.controlButton.set('checked', false);
				this.currentTarget.controlButton.focusNode.setAttribute("tabIndex", "-1");
				this.currentTarget = undefined;
			}
			if(!child){
				return;
			}

			var button = child.controlButton,
				node = button.domNode;
			button.set('checked', true);
			//button.focusNode.setAttribute("tabIndex", "0");
			this.set("focusedChild", button);

			this.currentTarget = child;
			// Scroll to the selected tab, except on startup, when scrolling is handled in resize()
			if(this.isShowNormal() || this.isShowMax()){
				var sl = this._getScroll();
				if(sl > (this.layoutVertical ? node.offsetTop : node.offsetLeft) ||
					sl + this._getSize(this.scrollNode) < (this.layoutVertical ? node.offsetTop : node.offsetLeft) + this._getSize(node)){
					var anim = this.createSmoothScroll();
					if(containerFocused){
						anim.onEnd = function(){
							// Focus is on hidden tab or previously selected tab label.  Move to current tab label.
							button.focus();
						};
					}
					anim.play();
				}else if(containerFocused){
					// Focus is on hidden tab or previously selected tab label.  Move to current tab label.
					button.focus();
				}
			}
		},

		_getScroll: function(){
			// summary:
			//		Returns the current scroll of the tabs where 0 means
			//		"scrolled all the way to the left" and some positive number, based on #
			//		of pixels of possible scroll (ex: 1000) means "scrolled all the way to the right"
			return (!this.layoutRtl || rias.has("ie") < 8 || (rias.has("trident") && rias.has("quirks")) || rias.has("webkit")) ?
				(this.layoutVertical ? this.scrollNode.scrollTop : this.scrollNode.scrollLeft) :
				this._getSize(this.containerNode) - this._getSize(this.scrollNode) + (rias.has("trident") || rias.has("edge") ? -1 : 1) * (this.layoutVertical ? this.scrollNode.scrollTop : this.scrollNode.scrollLeft);
		},
		_convertToScrollBegin: function(val){
			// summary:
			//		Given a scroll value where 0 means "scrolled all the way to the left"
			//		and some positive number, based on # of pixels of possible scroll (ex: 1000)
			//		means "scrolled all the way to the right", return value to set this.scrollNode.scrollLeft
			//		to achieve that scroll.
			//
			//		This method is to adjust for RTL funniness in various browsers and versions.
			if(!this.layoutRtl || rias.has("ie") < 8 || (rias.has("trident") && rias.has("quirks")) || rias.has("webkit")){
				return val;
			}else{
				var maxScroll = this._getSize(this.containerNode) - this._getSize(this.scrollNode);
				return maxScroll + (rias.has("trident") || rias.has("edge") ? -1 : 1) * (val - maxScroll);
			}
		},
		_getTabsSize: function(){
			if(this._buttons.length){
				var leftTab = this._buttons[this.layoutRtl ? this._buttons.length - 1 : 0].domNode,
					rightTab = this._buttons[this.layoutRtl ? 0 : this._buttons.length - 1].domNode;
				return this.layoutVertical ?
					rightTab.offsetTop + rightTab.offsetHeight - leftTab.offsetTop :
					rightTab.offsetLeft + rightTab.offsetWidth - leftTab.offsetLeft;
			}else{
				return 0;
			}
		},
		_getScrollBounds: function(){
			// summary:
			//		Returns the minimum and maximum scroll setting to show the leftmost and rightmost
			//		tabs (respectively)
			var children = this._buttons,
				scrollNodeWidth = this._getSize(this.scrollNode), // about 500px
				containerWidth = this._getSize(this.containerNode), // 50,000px
				maxPossibleScroll = containerWidth - scrollNodeWidth, // scrolling until right edge of containerNode visible
				tabsWidth = this._getTabsSize();

			if(children.length && tabsWidth > scrollNodeWidth){
				// Scrolling should happen
				children = children[children.length - 1].domNode;
				return {
					min: this.layoutRtl ? (this.layoutVertical ? children.offsetTop : children.offsetLeft) : 0,
					max: this.layoutRtl ? maxPossibleScroll
						: (this.layoutVertical ? (children.offsetTop + children.offsetHeight) : (children.offsetLeft + children.offsetWidth)) - scrollNodeWidth

				};
			}else{
				// No scrolling needed, all tabs visible, we stay either scrolled to far left or far right (depending on dir)
				var onlyScrollPosition = this.layoutRtl ? maxPossibleScroll : 0;
				return {
					min: onlyScrollPosition,
					max: onlyScrollPosition
				};
			}
		},
		_getScrollForSelectedTab: function(){
			// summary:
			//		Returns the scroll value setting so that the selected tab
			//		will appear in the center
			var n = this.currentTarget && this.currentTarget.controlButton.domNode,
				scrollNodeWidth = this._getSize(this.scrollNode),
				scrollBounds = this._getScrollBounds();

			// TODO: scroll minimal amount (to either right or left) so that
			// selected tab is fully visible, and just return if it's already visible?
			var pos = n ? ((this.layoutVertical ? n.offsetTop : n.offsetLeft) + this._getSize(n) / 2) - scrollNodeWidth / 2 : 0;
			pos = Math.min(Math.max(pos, scrollBounds.min), scrollBounds.max);

			// TODO:
			// If scrolling close to the left side or right side, scroll
			// all the way to the left or right.  See this._minScroll.
			// (But need to make sure that doesn't scroll the tab out of view...)
			return pos;
		},

		createSmoothScroll: function(x){
			// summary:
			//		Creates a dojo._Animation object that smoothly scrolls the tab list
			//		either to a fixed horizontal pixel value, or to the selected tab.
			// description:
			//		If an number argument is passed to the function, that horizontal
			//		pixel position is scrolled to.  Otherwise the currently selected
			//		tab is scrolled to.
			// x: Integer?
			//		An optional pixel value to scroll to, indicating distance from left.
			this._stopAnimation();
			// Calculate position to scroll to
			if(arguments.length > 0){
				// position specified by caller, just make sure it's within bounds
				var scrollBounds = this._getScrollBounds();
				x = Math.min(Math.max(x, scrollBounds.min), scrollBounds.max);
			}else{
				// scroll to center the current tab
				x = this._getScrollForSelectedTab();
			}

			var self = this,
				w = this.scrollNode,
				anim = new rias.fx.Animation({
					beforeBegin: function(){
						if(this.curve){
							this.curve = undefined;
						}
						var oldS = (self.layoutVertical ? w.scrollTop : w.scrollLeft),
							newS = self._convertToScrollBegin(x);
						this.curve = new rias.fx._Line(oldS, newS);
					},
					onAnimate: function(val){
						if(self.layoutVertical){
							w.scrollTop = val;
						}else{
							w.scrollLeft = val;
						}
					}
				});
			this._anim = anim;

			// Disable/enable left/right buttons according to new scroll position
			this._setScrollButton(x);

			return anim; // dojo/_base/fx/Animation
		},

		_setScrollButton: function(/*Number*/ scroll){
			// summary:
			//		Disables the left scroll button if the tabs are scrolled all the way to the left,
			//		or the right scroll button in the opposite case.
			// scroll: Integer
			//		amount of horizontal scroll

			var scrollBounds = this._getScrollBounds();
			this._leftBtn.set("disabled", scroll <= scrollBounds.min);
			this._rightBtn.set("disabled", scroll >= scrollBounds.max);
		},
		_getBtnNode: function(/*Event*/ e){
			// summary:
			//		Gets a button DOM node from a mouse click event.
			// e:
			//		The mouse click event.
			var n = e.target;
			while(n && !_dom.containsClass(n, "riaswTabStripButton")){
				n = n.parentNode;
			}
			return n;
		},
		doSlideRight: function(/*Event*/ e){
			// summary:
			//		Scrolls the menu to the right.
			// e:
			//		The mouse click event.
			this.doSlide(1, this._getBtnNode(e));
		},
		doSlideLeft: function(/*Event*/ e){
			// summary:
			//		Scrolls the menu to the left.
			// e:
			//		The mouse click event.
			this.doSlide(-1, this._getBtnNode(e));
		},
		doSlide: function(/*Number*/ direction, /*DomNode*/ node){
			// summary:
			//		Scrolls the tab list to the left or right by 75% of the widget width.
			// direction:
			//		If the direction is 1, the widget scrolls to the right, if it is -1,
			//		it scrolls to the left.

			if(node && _dom.containsClass(node, "riaswTabDisabled")){
				return;
			}

			var sWidth = this._getSize(this.scrollNode);
			var d = (sWidth * 0.75) * direction;

			var to = this._getScroll() + d;

			this._setScrollButton(to);

			this.createSmoothScroll(to).play();
		},
		_adjacent: function(/*Boolean*/ forward){
			if(this.layoutRtl){
				forward = !forward;
			}
			var sw = this.currentTarget && this.currentTarget.controlButton;
			var children = rias.filter(this._buttons, function(child){
				return child === sw || !child.isDestroyed(true) && !child.get("disabled");
			});
			var index = rias.indexOf(children, sw);
			index += forward ? 1 : children.length - 1;
			return children[ index % children.length ]; // _WidgetBase
		},
		forward: function(animate){
			return this._adjacent(true);
		},
		back: function(animate){
			return this._adjacent(false);
		},

		onkeydown: function(/*Event*/ e, /*Boolean?*/ fromContainer){
			if(this.disabled || e.altKey){
				return;
			}
			var forward = null,
				idx, child;
			if(e.ctrlKey || !e._targetWidget){
				switch(e.keyCode){
					case rias.keys.LEFT_ARROW:
					case rias.keys.UP_ARROW:
						if(!e._targetWidget){
							forward = false;
						}
						break;
					case rias.keys.PAGE_UP:
						if(e.ctrlKey){
							forward = false;
						}
						break;
					case rias.keys.RIGHT_ARROW:
					case rias.keys.DOWN_ARROW:
						if(!e._targetWidget){
							forward = true;
						}
						break;
					case rias.keys.PAGE_DOWN:
						if(e.ctrlKey){
							forward = true;
						}
						break;
					case rias.keys.HOME:
						// Navigate to first non-disabled child
						for(idx = 0; idx < this._buttons.length; idx++){
							child = this._buttons[idx];
							if(!child.disabled){
								child._onClick(e);
								break;
							}
						}
						e.stopPropagation();
						e.preventDefault();
						break;
					case rias.keys.END:
						// Navigate to last non-disabled child
						for(idx = this._buttons.length - 1; idx >= 0; idx--){
							child = this._buttons[idx];
							if(!child.disabled){
								child._onClick(e);
								break;
							}
						}
						e.stopPropagation();
						e.preventDefault();
						break;
					case rias.keys.DELETE:
					case "W".charCodeAt(0):    // ctrl-W
						if(this.currentTarget && this.currentTarget.closable && (e.keyCode === rias.keys.DELETE || e.ctrlKey)){
							this.currentTarget.controlButton._onClose(e);

							// avoid browser tab closing
							e.stopPropagation();
							e.preventDefault();
						}
						break;
					case rias.keys.TAB:
						if(e.ctrlKey){
							child = this._adjacent(!e.shiftKey);
							if(child && !child.disabled){
								child._onClick(e);
							}
							e.stopPropagation();
							e.preventDefault();
						}
						break;
				}
				// handle next/previous page navigation (left/right arrow, etc.)
				if(forward !== null){
					child = this._adjacent(forward);
					if(child && !child.disabled){
						child._onClick(e);
					}
					e.stopPropagation();
					e.preventDefault();
				}
			}
		}

	});

	return Widget;

});
