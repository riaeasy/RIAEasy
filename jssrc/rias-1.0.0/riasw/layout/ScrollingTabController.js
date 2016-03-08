
//RIAStudio client runtime widget - ScrollingTabController

define([
	"rias",
	"rias/riasw/layout/TabController",
	"dijit/_WidgetsInTemplateMixin",
	"rias/riasw/widget/Menu",
	"rias/riasw/widget/MenuItem",
	"rias/riasw/form/Button",
	"dijit/_HasDropDown",
	"dojo/NodeList-dom", // NodeList.style
	"dijit/a11yclick"	// template uses ondijitclick (not for keyboard support, but for responsive touch support)
], function(rias, TabController, _WidgetsInTemplateMixin, Menu, MenuItem, Button, _HasDropDown){

	var riasType = "rias.riasw.layout.ScrollingTabController";
	var Widget = rias.declare(riasType, [TabController, _WidgetsInTemplateMixin], {
		// summary:
		//		Set of tabs with left/right arrow keys and a menu to switch between tabs not
		//		all fitting on a single row.
		//		Works only for horizontal tabs (either above or below the content, not to the left
		//		or right).
		// tags:
		//		private

		baseClass: "dijitTabController dijitScrollingTabController",

		templateString:
			'<div class="dijitTabListContainer-${tabPosition}" style="visibility:hidden">' +
				'<div data-dojo-type="rias.riasw.layout._ScrollingTabControllerMenuButton" class="tabStripButton-${tabPosition}" id="${id}_menuBtn"' +
					'data-dojo-props="containerId: \'${containerId}\', iconClass: \'dijitTabStripMenuIcon\', dropDownPosition: [\'below-alt\', \'above-alt\']"' +
					'data-dojo-attach-point="_menuBtn" showLabel="false" title="">&#9660;</div>' +
				'<div data-dojo-type="rias.riasw.layout._ScrollingTabControllerButton" class="tabStripButton-${tabPosition}" id="${id}_leftBtn"' +
					'data-dojo-props="iconClass:\'dijitTabStripSlideLeftIcon\', showLabel:false, title:\'\'"' +
					'data-dojo-attach-point="_leftBtn" data-dojo-attach-event="onClick: doSlideLeft">&#9664;</div>' +
				'<div data-dojo-type="rias.riasw.layout._ScrollingTabControllerButton" class="tabStripButton-${tabPosition}" id="${id}_rightBtn"' +
					'data-dojo-props="iconClass:\'dijitTabStripSlideRightIcon\', showLabel:false, title:\'\'"' +
					'data-dojo-attach-point="_rightBtn" data-dojo-attach-event="onClick: doSlideRight">&#9654;</div>' +
				'<div class="dijitTabListWrapper" data-dojo-attach-point="tablistWrapper">' +
					'<div role="tablist" data-dojo-attach-event="onkeydown:onkeydown" data-dojo-attach-point="containerNode" class="nowrapTabStrip"></div>' +
				'</div>' +
			'</div>',

		// useMenu: [const] Boolean
		//		True if a menu should be used to select tabs when they are too
		//		wide to fit the TabContainer, false otherwise.
		useMenu: true,

		// useSlider: [const] Boolean
		//		True if a slider should be used to select tabs when they are too
		//		wide to fit the TabContainer, false otherwise.
		useSlider: true,

		// tabStripClass: [const] String
		//		The css class to apply to the tab strip, if it is visible.
		tabStripClass: "",

		// _minScroll: Number
		//		The distance in pixels from the edge of the tab strip which,
		//		if a scroll animation is less than, forces the scroll to
		//		go all the way to the left/right.
		_minScroll: 5,

		// Override default behavior mapping class to DOMNode
		_setClassAttr: { node: "containerNode", type: "class" },

		buildRendering: function(){
			this.inherited(arguments);
			var n = this.domNode;

			this.scrollNode = this.tablistWrapper;
			this._initButtons();

			if(!this.tabStripClass){
				this.tabStripClass = "dijitTabContainer" +
					this.tabPosition.charAt(0).toUpperCase() +
					this.tabPosition.substr(1).replace(/-.*/, "") +
					"None";
				rias.dom.addClass(n, "tabStrip-disabled")
			}

			rias.dom.addClass(this.tablistWrapper, this.tabStripClass);
		},

		onStartup: function(){
			var self = this;
			this.inherited(arguments);

			// TabController is hidden until it finishes drawing, to give
			// a less visually jumpy instantiation.   When it's finished, set visibility to ""
			// to that the tabs are hidden/shown depending on the container's visibility setting.
			rias.dom.setStyle(this.domNode, "visibility", "");
			this._postStartup = true;

			// changes to the tab button label or iconClass will have changed the width of the
			// buttons, so do a resize
			this.own(rias.on(this.containerNode, "attrmodified-label, attrmodified-iconclass", function(evt){
				if(self._dim){
					self.resize(self._dim);
				}
			}));
		},

		onAddChild: function(page, insertIndex){
			this.inherited(arguments);

			// Increment the width of the wrapper when a tab is added
			// This makes sure that the buttons never wrap.
			// The value 200 is chosen as it should be bigger than most
			// Tab button widths.
			rias.dom.setStyle(this.containerNode, "width", (rias.dom.getStyle(this.containerNode, "width") + 200) + "px");
		},

		onRemoveChild: function(page, insertIndex){
			// null out _selectedTab because we are about to delete that dom node
			var button = this.page2button(page);
			if(this._selectedTab === button.domNode){
				this._selectedTab = null;
			}

			this.inherited(arguments);
		},

		_initButtons: function(){
			// summary:
			//		Creates the buttons used to scroll to view tabs that
			//		may not be visible if the TabContainer is too narrow.

			// Make a list of the buttons to display when the tab labels become
			// wider than the TabContainer, and hide the other buttons.
			// Also gets the total width of the displayed buttons.
			var self = this;
			self._btnWidth = 0;
			self._buttons = rias.dom.query("> .tabStripButton", self.domNode).filter(function(btn){
				if((self.useMenu && btn == self._menuBtn.domNode) ||
					(self.useSlider && (btn == self._rightBtn.domNode || btn == self._leftBtn.domNode))){
					self._btnWidth += rias.dom.getMarginSize(btn).w;
					return true;
				}else{
					rias.dom.setStyle(btn, "display", "none");
					return false;
				}
			}, self);
		},

		_getTabsWidth: function(){
			var children = this.getChildren();
			if(children.length){
				var leftTab = children[this.isLeftToRight() ? 0 : children.length - 1].domNode,
					rightTab = children[this.isLeftToRight() ? children.length - 1 : 0].domNode;
				return rightTab.offsetLeft + rightTab.offsetWidth - leftTab.offsetLeft;
			}else{
				return 0;
			}
		},

		_enableBtn: function(width){
			// summary:
			//		Determines if the tabs are wider than the width of the TabContainer, and
			//		thus that we need to display left/right/menu navigation buttons.
			var tabsWidth = this._getTabsWidth();
			width = width || rias.dom.getStyle(this.scrollNode, "width");
			return tabsWidth > 0 && width < tabsWidth;
		},

		resize: function(dim){
			// summary:
			//		Hides or displays the buttons used to scroll the tab list and launch the menu
			//		that selects tabs.

			// Save the dimensions to be used when a child is renamed.
			this._dim = dim;

			// Set my height to be my natural height (tall enough for one row of tab labels),
			// and my content-box width based on margin-box width specified in dim parameter.
			// But first reset scrollNode.height in case it was set by layoutChildren() call
			// in a previous run of this method.
			this.scrollNode.style.height = "auto";
			var cb = this._contentBox = rias.dom.marginBox2contentBox(this.domNode, {h: 0, w: dim.w});
			cb.h = this.scrollNode.offsetHeight;
			rias.dom.setContentSize(this.domNode, cb);
			if(rias.dom.getStyle(this.containerNode, "width") < cb.w){
				rias.dom.setStyle(this.containerNode, "width", cb.w + "px");
			}

			// Show/hide the left/right/menu navigation buttons depending on whether or not they
			// are needed.
			var enable = this._enableBtn(this._contentBox.w);
			this._buttons.style("display", enable ? "" : "none");

			// Position and size the navigation buttons and the tablist
			this._leftBtn.region = "left";
			this._rightBtn.region = "right";
			this._menuBtn.region = this.isLeftToRight() ? "right" : "left";
			rias.dom.layoutChildren(this.domNode, this._contentBox,
				[this._menuBtn, this._leftBtn, this._rightBtn, {domNode: this.scrollNode, region: "center"}]);

			// set proper scroll so that selected tab is visible
			if(this._selectedTab){
				if(this._anim && this._anim.status() == "playing"){
					this._anim.stop();
				}
				this.scrollNode.scrollLeft = this._convertToScrollLeft(this._getScrollForSelectedTab());
			}

			// Enable/disabled left right buttons depending on whether or not user can scroll to left or right
			this._setButtonClass(this._getScroll());

			this._postResize = true;

			// Return my size so layoutChildren() can use it.
			// Also avoids IE9 layout glitch on browser resize when scroll buttons present
			return {h: this._contentBox.h, w: dim.w};
		},

		_getScroll: function(){
			// summary:
			//		Returns the current scroll of the tabs where 0 means
			//		"scrolled all the way to the left" and some positive number, based on #
			//		of pixels of possible scroll (ex: 1000) means "scrolled all the way to the right"
			return (this.isLeftToRight() || rias.has("ie") < 8 || (rias.has("ie") && rias.has("quirks")) || rias.has("webkit"))
				? this.scrollNode.scrollLeft
				: rias.dom.getStyle(this.containerNode, "width") - rias.dom.getStyle(this.scrollNode, "width")
					+ (rias.has("ie") >= 8 ? -1 : 1) * this.scrollNode.scrollLeft;
		},

		_convertToScrollLeft: function(val){
			// summary:
			//		Given a scroll value where 0 means "scrolled all the way to the left"
			//		and some positive number, based on # of pixels of possible scroll (ex: 1000)
			//		means "scrolled all the way to the right", return value to set this.scrollNode.scrollLeft
			//		to achieve that scroll.
			//
			//		This method is to adjust for RTL funniness in various browsers and versions.
			if(this.isLeftToRight() || rias.has("ie") < 8 || (rias.has("ie") && rias.has("quirks")) || rias.has("webkit")){
				return val;
			}else{
				var maxScroll = rias.dom.getStyle(this.containerNode, "width") - rias.dom.getStyle(this.scrollNode, "width");
				return (rias.has("ie") >= 8 ? -1 : 1) * (val - maxScroll);
			}
		},

		onSelectChild: function(/*dijit/_WidgetBase*/ page){
			// summary:
			//		Smoothly scrolls to a tab when it is selected.

			var tab = this.page2button(page);
			if(!tab){
				return;
			}

			var node = tab.domNode;

			// Save the selection
			if(node != this._selectedTab){
				this._selectedTab = node;

				// Scroll to the selected tab, except on startup, when scrolling is handled in resize()
				if(this._postResize){
					var sl = this._getScroll();

					if(sl > node.offsetLeft || sl + rias.dom.getStyle(this.scrollNode, "width") < node.offsetLeft + rias.dom.getStyle(node, "width")){
						this.createSmoothScroll().play();
					}
				}
			}

			this.inherited(arguments);
		},

		_getScrollBounds: function(){
			// summary:
			//		Returns the minimum and maximum scroll setting to show the leftmost and rightmost
			//		tabs (respectively)
			var children = this.getChildren(),
				scrollNodeWidth = rias.dom.getStyle(this.scrollNode, "width"), // about 500px
				containerWidth = rias.dom.getStyle(this.containerNode, "width"), // 50,000px
				maxPossibleScroll = containerWidth - scrollNodeWidth, // scrolling until right edge of containerNode visible
				tabsWidth = this._getTabsWidth();

			if(children.length && tabsWidth > scrollNodeWidth){
				// Scrolling should happen
				return {
					min: this.isLeftToRight() ? 0 : children[children.length - 1].domNode.offsetLeft,
					max: this.isLeftToRight() ?
						(children[children.length - 1].domNode.offsetLeft + children[children.length - 1].domNode.offsetWidth) - scrollNodeWidth :
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
				n = this._selectedTab,
				scrollNodeWidth = rias.dom.getStyle(this.scrollNode, "width"),
				scrollBounds = this._getScrollBounds();

			// TODO: scroll minimal amount (to either right or left) so that
			// selected tab is fully visible, and just return if it's already visible?
			var pos = (n.offsetLeft + rias.dom.getStyle(n, "width") / 2) - scrollNodeWidth / 2;
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
							delete this.curve;
						}
						var oldS = w.scrollLeft,
							newS = self._convertToScrollLeft(x);
						anim.curve = new rias.fx._Line(oldS, newS);
					},
					onAnimate: function(val){
						w.scrollLeft = val;
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
			while(n && !rias.dom.hasClass(n, "tabStripButton")){
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

			if(node && rias.dom.hasClass(node, "dijitTabDisabled")){
				return;
			}

			var sWidth = rias.dom.getStyle(this.scrollNode, "width");
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
		}
	});


	var ScrollingTabControllerButtonMixin = rias.declare("rias.riasw.layout._ScrollingTabControllerButtonMixin", null, {
		baseClass: "dijitTab tabStripButton",

		templateString:
			'<div role="button" data-dojo-attach-point="focusNode" data-dojo-attach-event="ondijitclick:_onClick" class="dijitTabInnerDiv dijitTabContent dijitButtonContents">' +
				'<span data-dojo-attach-point="badgeNode" class="${badgeClass}"></span>'+
				'<span role="presentation" data-dojo-attach-point="iconNode" class="dijitInline dijitTabStripIcon"></span>' +
				'<span data-dojo-attach-point="containerNode,titleNode" class="dijitButtonText"></span>' +
			'</div>',

		// Override inherited tabIndex: 0 from dijit/form/Button, because user shouldn't be
		// able to tab to the left/right/menu buttons
		tabIndex: "",

		// Similarly, override FormWidget.isFocusable() because clicking a button shouldn't focus it
		// either (this override avoids focus() call in FormWidget.js)
		isFocusable: function(){
			return false;
		}
	});

	// Class used in template
	rias.declare("rias.riasw.layout._ScrollingTabControllerButton", [Button, ScrollingTabControllerButtonMixin]);

	// Class used in template
	rias.declare("rias.riasw.layout._ScrollingTabControllerMenuButton", [Button, _HasDropDown, ScrollingTabControllerButtonMixin], {
		// id of the TabContainer itself
		containerId: "",

		// -1 so user can't tab into the button, but so that button can still be focused programatically.
		// Because need to move focus to the button (or somewhere) before the menu is hidden or IE6 will crash.
		tabIndex: "-1",

		isLoaded: function(){
			// recreate menu every time, in case the TabContainer's list of children (or their icons/labels) have changed
			return false;
		},

		loadDropDown: function(callback){
			this.dropDown = new Menu({
				id: this.containerId + "_menu",
				ownerDocument: this.ownerDocument,
				dir: this.dir,
				lang: this.lang,
				textDir: this.textDir
			});
			var container = rias.by(this.containerId);
			rias.forEach(container.getChildren(), function(page){
				var menuItem = new MenuItem({
					id: page.id + "_stcMi",
					label: page.caption || page.title,
					iconClass: page.iconClass,
					disabled: page.disabled,
					ownerDocument: this.ownerDocument,
					dir: page.dir,
					lang: page.lang,
					textDir: page.textDir || container.textDir,
					onClick: function(){
						container.selectChild(page);
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
				delete this.dropDown;
			}
		}
	});

	return Widget;
});
