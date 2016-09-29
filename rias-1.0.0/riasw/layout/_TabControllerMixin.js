
//RIAStudio client runtime widget - ScrollingMixin

define([
	"rias",
	"dijit/_WidgetsInTemplateMixin",
	"rias/riasw/widget/Menu",
	"rias/riasw/widget/MenuItem",
	"rias/riasw/form/Button",
	"dijit/_HasDropDown",
	"dojo/NodeList-dom", // NodeList.style
	"dijit/a11yclick"	// template uses ondijitclick (not for keyboard support, but for responsive touch support)
], function(rias, _WidgetsInTemplateMixin, Menu, MenuItem, Button, _HasDropDown){

	var TabControllerButtonMixin = rias.declare("rias.riasw.layout._TabControllerButtonMixin", null, {
		baseClass: "riaswTabStripButton",

		templateString:
			'<div role="button" data-dojo-attach-point="focusNode,buttonNode" data-dojo-attach-event="ondijitclick:_onClick">' +
				'<span data-dojo-attach-point="badgeNode" class="${badgeClass}"></span>'+
				'<span role="presentation" data-dojo-attach-point="iconNode" class="dijitInline riaswTabStripIcon"></span>' +
				'<span data-dojo-attach-point="containerNode,titleNode,labelNode" class="riaswButtonText"></span>' +
				'</div>',

		// Override inherited tabIndex: 0 from dijit/form/Button, because user shouldn't be
		// able to tab to the left/right/menu buttons
		tabIndex: "",

		postMixInProperties: function(){
			this.inherited(arguments);
		},
		buildRendering: function(){
			this.inherited(arguments);
		},

		// Similarly, override FormWidget.isFocusable() because clicking a button shouldn't focus it
		// either (this override avoids focus() call in FormWidget.js)
		isFocusable: function(){
			return false;
		}
	});

	// Class used in template
	rias.declare("rias.riasw.layout._TabControllerButton", [Button, TabControllerButtonMixin], {
		postMixInProperties: function(){
			this.inherited(arguments);
		},
		buildRendering: function(){
			this.inherited(arguments);
		}
	});

	// Class used in template
	rias.declare("rias.riasw.layout._TabControllerMenuButton", [Button, _HasDropDown, TabControllerButtonMixin], {

		ownerController: null,

		// -1 so user can't tab into the button, but so that button can still be focused programatically.
		// Because need to move focus to the button (or somewhere) before the menu is hidden or IE6 will crash.
		tabIndex: "-1",
		//dropDownPosition: ['below', 'above'],///_HasDropDown 中已经定义

		isLoaded: function(){///覆盖 dijit/_HasDropDown 的 isLoaded，每次刷新下拉菜单
			// recreate menu every time, in case the TabContainer's list of children (or their icons/labels) have changed
			return false;
		},

		loadDropDown: function(callback){
			this.dropDown = new Menu({
				ownerRiasw: this,
				parent: rias.webApp,
				id: this.ownerController.id + "_menu",
				ownerDocument: this.ownerDocument,
				dir: this.dir,
				lang: this.lang,
				textDir: this.textDir
			});
			rias.forEach(this.ownerController.getChildren(), function(btn){
				var menuItem = new MenuItem({
					ownerRiasw: this.dropDown,
					id: btn.id + "_stcMi",
					label: btn.caption || btn.label || btn.title,
					iconClass: btn.iconClass,
					disabled: btn.disabled,
					ownerDocument: this.ownerDocument,
					dir: btn.dir,
					lang: btn.lang,
					textDir: btn.textDir || this.ownerController.textDir,
					onClick: function(evt){
						btn._onClick(evt);
					}
				});
				this.dropDown.addChild(menuItem);
			}, this);
			callback();
		},

		closeDropDown: function(/*Boolean*/ focus){
			this.inherited(arguments);
			if(this.dropDown){
				this._popupStateNode.removeAttribute("aria-owns");	// remove ref to node that we are about to delete
				this.dropDown.destroyRecursive();
				this.dropDown = undefined;
			}
		}
	});

	var riaswType = "rias.riasw.layout._TabControllerMixin";
	var Widget = rias.declare(riaswType, [_WidgetsInTemplateMixin], {

		templateString:
			'<div class="dijitReset">' +
				'<div data-dojo-type="rias.riasw.layout._TabControllerMenuButton" class="dijitHidden riaswTabStripButton-${region}" id="${id}_menuBtn"' +
					'data-dojo-props="iconClass: \'riaswTabStripMenuIcon\'"' +
					'data-dojo-attach-point="_menuBtn" showLabel="false" title="">&#9660;</div>' +
				'<div data-dojo-type="rias.riasw.layout._TabControllerButton" class="dijitHidden riaswTabStripButton-${region}" id="${id}_leftBtn"' +
					'data-dojo-props="iconClass:\'riaswTabStripSlideLeftIcon\', showLabel:false, title:\'\'"' +
					'data-dojo-attach-point="_leftBtn" data-dojo-attach-event="onClick: doSlideLeft">&#9664;</div>' +
				'<div data-dojo-type="rias.riasw.layout._TabControllerButton" class="dijitHidden riaswTabStripButton-${region}" id="${id}_rightBtn"' +
					'data-dojo-props="iconClass:\'riaswTabStripSlideRightIcon\', showLabel:false, title:\'\'"' +
					'data-dojo-attach-point="_rightBtn" data-dojo-attach-event="onClick: doSlideRight">&#9654;</div>' +
				'<div class="riaswTabListWrapper" data-dojo-attach-point="scrollNode">' +
					'<div role="tablist" data-dojo-attach-event="onkeydown:onkeydown" data-dojo-attach-point="containerNode" class="nowrapTabStrip"></div>' +
				'</div>' +
			'</div>',

		useMenu: true,
		useSlider: true,

		// Override default behavior mapping class to DOMNode
		//_setClassAttr: { node: "containerNode", type: "class" },

		_getSize: function(node){
			return rias.dom.getStyle(node, this._isTabV ? "height" : "width");
		},
		_setSize: function(node, value){
			rias.dom.setStyle(node, this._isTabV ? "height" : "width", value);
		},
		buildRendering: function(){
			if(!this.region){
				this.region = "top";
			}
			this._isTabV = this.region == "left" || this.region == "right";
			this.inherited(arguments);
			rias.dom.addClass(this.domNode, this.baseClass + "-" + this.region);
			this._setSize(this.containerNode, "50000px");

			this._initButtons();
			this._menuBtn.ownerController = this;
		},
		postCreate: function(){
			var self = this;
			self.inherited(arguments);
			this._initAttr(["float"]);
		},

		_onFloat: function(value, oldValue){
			rias.dom.toggleClass(this.containerNode, "rightFloatTabStrip", !this._isTabV && value == "right");
			rias.dom.toggleClass(this.containerNode, "bottomFloatTabStrip", this._isTabV && value == "bottom");
			rias.filter(this.getChildren(), function(child){
				rias.dom.setStyle(child.domNode, "float", value);
			});
		},

		createButton: function(ctor, params){
			return new ctor(rias.mixinDeep({
				ownerRiasw: this,
				layoutVertical: this._isTabV,
				ownerController: this,
				style: {
					float: this.float || ""
				}
			}, params));
		},

		_initButtons: function(){
			// summary:
			//		Creates the buttons used to scroll to view tabs that
			//		may not be visible if the TabContainer is too narrow.

			// Make a list of the buttons to display when the tab labels become
			// wider than the TabContainer, and hide the other buttons.
			// Also gets the total width of the displayed buttons.
			var self = this;
			//self._btnWidth = 0;
			self._buttons = rias.dom.query("> .riaswTabStripButton", self.domNode).filter(function(btn){
				if((self.useMenu && btn == self._menuBtn.domNode) ||
					(self.useSlider && (btn == self._rightBtn.domNode || btn == self._leftBtn.domNode))){
					//rias.dom.removeClass(btn, "dijitHidden");
					//self._btnWidth += rias.dom.getMarginBox(btn)[this._isTabV ? "h" : "w"];
					return true;
				}else{
					rias.dom.addClass(btn, "dijitHidden");
					//rias.dom.setStyle(btn, "display", "none");
					return false;
				}
			}, self);
			if(self._isTabV){
				self._leftBtn.set("iconClass", "riaswTabStripSlideUpIcon");
				self._rightBtn.set("iconClass", "riaswTabStripSlideDownIcon");
			}
		},

		_getTabsSize: function(){
			var children = this.getChildren();
			if(children.length){
				var leftTab = children[this.isLeftToRight() ? 0 : children.length - 1].domNode,
					rightTab = children[this.isLeftToRight() ? children.length - 1 : 0].domNode;
				return this._isTabV ?
					rightTab.offsetTop + rightTab.offsetHeight - leftTab.offsetTop :
					rightTab.offsetLeft + rightTab.offsetWidth - leftTab.offsetLeft;
			}else{
				return 0;
			}
		},

		_enableBtn: function(dim){
			// summary:
			//		Determines if the tabs are wider than the width of the TabContainer, and
			//		thus that we need to display left/right/menu navigation buttons.
			var l, d;
			l = this._getTabsSize();
			d = (this._isTabV ? dim.h : dim.w);
			d = l > 0 && d < l;

			rias.forEach(this._buttons, function(btn){
				rias.dom.toggleClass(btn, "dijitHidden", !d);
			});
			if(d){
				if(this._isTabV){
					l = rias.dom.getContentMargin(this._menuBtn.domNode).w - rias.dom.getContentMargin(this._menuBtn.iconNode).w;
					this._menuBtn.iconNode.style["margin-left"] = l / 2 + "px";
					this._leftBtn.iconNode.style["margin-left"] = l / 2 + "px";
					this._rightBtn.iconNode.style["margin-left"] = l / 2 + "px";
					// Position and size the navigation buttons and the tablist
					this._leftBtn.region = "top";
					this._rightBtn.region = "bottom";
					this._menuBtn.region = "top";// this.isLeftToRight() ? "right" : "left";
				}else{
					l = rias.dom.getContentMargin(this._menuBtn.domNode).h;
					this._menuBtn.domNode.style["line-height"] = l + "px";
					this._leftBtn.domNode.style["line-height"] = l + "px";
					this._rightBtn.domNode.style["line-height"] = l + "px";
					// Position and size the navigation buttons and the tablist
					this._leftBtn.region = "left";
					this._rightBtn.region = "right";
					this._menuBtn.region = this.isLeftToRight() ? "right" : "left";
				}
			}
			rias.dom.layoutChildren.apply(this, [this.domNode, this._contentBox,
				[this._menuBtn, this._leftBtn, this._rightBtn, {domNode: this.scrollNode, region: "center"}]]);

			return d;
		},

		resize: function(dim){
			// summary:
			//		Hides or displays the buttons used to scroll the tab list and launch the menu
			//		that selects tabs.
			if(dim){
				rias.dom.setMarginBox(this.domNode, dim);
			}
			dim = this._contentBox = rias.dom.getContentMargin(this.domNode);

			//console.debug("resize - " + this.id, dim);
			if(this.region && this.region != "center"){
				if(this._isTabV){
					this.domNode.style.width = "auto";
					this.scrollNode.style.width = "auto";
					dim.w = this.containerNode.offsetWidth;
					rias.dom.setContentSize(this.domNode, {
						w: dim.w
					});
				}else{
					this.domNode.style.height = "auto";
					this.scrollNode.style.height = "auto";
					dim.h = this.containerNode.offsetHeight;
					rias.dom.setContentSize(this.domNode, {
						h: dim.h
					});
				}
			}
			// Show/hide the left/right/menu navigation buttons depending on whether or not they
			// are needed.
			this._enableBtn(dim);
			// set proper scroll so that selected tab is visible
			if(this._selectedButtonNode){
				if(this._anim && this._anim.status() == "playing"){
					this._anim.stop();
				}
				this.scrollNode[this._isTabV ? "scrollTop" : "scrollLeft"] = this._convertToScrollBegin(this._getScrollForSelectedTab());
			}

			// Enable/disabled left right buttons depending on whether or not user can scroll to left or right
			this._setButtonClass(this._getScroll());
			this._postResize = true;

			// Return my size so layoutChildren() can use it.
			// Also avoids IE9 layout glitch on browser resize when scroll buttons present
			//return dim;
		},

		_getScroll: function(){
			// summary:
			//		Returns the current scroll of the tabs where 0 means
			//		"scrolled all the way to the left" and some positive number, based on #
			//		of pixels of possible scroll (ex: 1000) means "scrolled all the way to the right"
			return (this.isLeftToRight() || rias.has("ie") < 8 || (rias.has("trident") && rias.has("quirks")) || rias.has("webkit")) ?
				(this._isTabV ? this.scrollNode.scrollTop : this.scrollNode.scrollLeft) :
				this._getSize(this.containerNode) - this._getSize(this.scrollNode)
					+ (rias.has("trident") || rias.has("edge") ? -1 : 1) * (this._isTabV ? this.scrollNode.scrollTop : this.scrollNode.scrollLeft);
		},

		_convertToScrollBegin: function(val){
			// summary:
			//		Given a scroll value where 0 means "scrolled all the way to the left"
			//		and some positive number, based on # of pixels of possible scroll (ex: 1000)
			//		means "scrolled all the way to the right", return value to set this.scrollNode.scrollLeft
			//		to achieve that scroll.
			//
			//		This method is to adjust for RTL funniness in various browsers and versions.
			if(this.isLeftToRight() || rias.has("ie") < 8 || (rias.has("trident") && rias.has("quirks")) || rias.has("webkit")){
				return val;
			}else{
				var maxScroll = this._getSize(this.containerNode) - this._getSize(this.scrollNode);
				return (rias.has("trident") || rias.has("edge") ? -1 : 1) * (val - maxScroll);
			}
		},

		_getScrollBounds: function(){
			// summary:
			//		Returns the minimum and maximum scroll setting to show the leftmost and rightmost
			//		tabs (respectively)
			var children = this.getChildren(),
				scrollNodeWidth = this._getSize(this.scrollNode), // about 500px
				containerWidth = this._getSize(this.containerNode), // 50,000px
				maxPossibleScroll = containerWidth - scrollNodeWidth, // scrolling until right edge of containerNode visible
				tabsWidth = this._getTabsSize();

			if(children.length && tabsWidth > scrollNodeWidth){
				// Scrolling should happen
				children = children[children.length - 1].domNode;
				return {
					min: this.isLeftToRight() ?
						0 :
						(this._isTabV ? children.offsetTop : children.offsetLeft),
					max: this.isLeftToRight() ?
						(this._isTabV ? (children.offsetTop + children.offsetHeight) : (children.offsetLeft + children.offsetWidth)) - scrollNodeWidth :
						maxPossibleScroll
				};
			}else{
				// No scrolling needed, all tabs visible, we stay either scrolled to far left or far right (depending on dir)
				var onlyScrollPosition = this.isLeftToRight() ? 0 : maxPossibleScroll;
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
			var w = this.scrollNode,
				n = this._selectedButtonNode,
				scrollNodeWidth = this._getSize(this.scrollNode),
				scrollBounds = this._getScrollBounds();

			// TODO: scroll minimal amount (to either right or left) so that
			// selected tab is fully visible, and just return if it's already visible?
			var pos = ((this._isTabV ? n.offsetTop : n.offsetLeft) + this._getSize(n) / 2) - scrollNodeWidth / 2;
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

			// Calculate position to scroll to
			if(arguments.length > 0){
				// position specified by caller, just make sure it's within bounds
				var scrollBounds = this._getScrollBounds();
				x = Math.min(Math.max(x, scrollBounds.min), scrollBounds.max);
			}else{
				// scroll to center the current tab
				x = this._getScrollForSelectedTab();
			}

			if(this._anim && this._anim.status() == "playing"){
				this._anim.stop();
			}

			var self = this,
				w = this.scrollNode,
				anim = new rias.fx.Animation({
					beforeBegin: function(){
						if(this.curve){
							this.curve = undefined;
						}
						var oldS = (self._isTabV ? w.scrollTop : w.scrollLeft),
							newS = self._convertToScrollBegin(x);
						anim.curve = new rias.fx._Line(oldS, newS);
					},
					onAnimate: function(val){
						self._isTabV ? w.scrollTop = val : w.scrollLeft = val;
					}
				});
			this._anim = anim;

			// Disable/enable left/right buttons according to new scroll position
			this._setButtonClass(x);

			return anim; // dojo/_base/fx/Animation
		},

		_getBtnNode: function(/*Event*/ e){
			// summary:
			//		Gets a button DOM node from a mouse click event.
			// e:
			//		The mouse click event.
			var n = e.target;
			while(n && !rias.dom.hasClass(n, "riaswTabStripButton")){
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

			if(node && rias.dom.hasClass(node, "riaswTabDisabled")){
				return;
			}

			var sWidth = this._getSize(this.scrollNode);
			var d = (sWidth * 0.75) * direction;

			var to = this._getScroll() + d;

			this._setButtonClass(to);

			this.createSmoothScroll(to).play();
		},

		_setButtonClass: function(/*Number*/ scroll){
			// summary:
			//		Disables the left scroll button if the tabs are scrolled all the way to the left,
			//		or the right scroll button in the opposite case.
			// scroll: Integer
			//		amount of horizontal scroll

			var scrollBounds = this._getScrollBounds();
			this._leftBtn.set("disabled", scroll <= scrollBounds.min);
			this._rightBtn.set("disabled", scroll >= scrollBounds.max);
		},

		_adjacent: function(/*Boolean*/ forward){
			if(!this.isLeftToRight()){
				forward = !forward;
			}
			var sw = this._currentTarget && this._currentTarget.controllButton;
			var children = rias.filter(this.getChildren(), function(child){
				return child == sw || !child.isDestroyed(true) && !child.get("disabled");
			});
			var index = rias.indexOf(children, sw);
			index += forward ? 1 : children.length - 1;
			return children[ index % children.length ]; // dijit/_WidgetBase
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
				children, idx, child;
			if(e.ctrlKey || !e._djpage){
				switch(e.keyCode){
					case rias.keys.LEFT_ARROW:
					case rias.keys.UP_ARROW:
						if(!e._djpage){
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
						if(!e._djpage){
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
						children = this.getChildren();
						for(idx = 0; idx < children.length; idx++){
							child = children[idx];
							if(!child.disabled){
								child._onClick();
								break;
							}
						}
						e.stopPropagation();
						e.preventDefault();
						break;
					case rias.keys.END:
						// Navigate to last non-disabled child
						children = this.getChildren();
						for(idx = children.length - 1; idx >= 0; idx--){
							child = children[idx];
							if(!child.disabled){
								child._onClick();
								break;
							}
						}
						e.stopPropagation();
						e.preventDefault();
						break;
					case rias.keys.DELETE:
					case "W".charCodeAt(0):    // ctrl-W
						if(this._currentTarget && this._currentTarget.closable && (e.keyCode == rias.keys.DELETE || e.ctrlKey)){
							this._currentTarget.controllButton._onClose();

							// avoid browser tab closing
							e.stopPropagation();
							e.preventDefault();
						}
						break;
					case rias.keys.TAB:
						if(e.ctrlKey){
							child = this.adjacent(!e.shiftKey);
							if(child && !child.disabled){
								child._onClick();
							}
							e.stopPropagation();
							e.preventDefault();
						}
						break;
				}
				// handle next/previous page navigation (left/right arrow, etc.)
				if(forward !== null){
					child = this.adjacent(forward);
					if(child && !child.disabled){
						child._onClick();
					}
					e.stopPropagation();
					e.preventDefault();
				}
			}
		}

	});


	return Widget;
});
