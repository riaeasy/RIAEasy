
//RIAStudio client runtime widget - AccordionPanel

define([
	"rias",
	"dijit/_Widget",
	"dijit/_Container",
	"dijit/_TemplatedMixin",
	"dijit/_CssStateMixin",
	"rias/riasw/layout/StackPanel",
	"dijit/a11yclick" // AccordionButton template uses ondijitclick; not for keyboard, but for responsive touch.
], function(rias, _Widget, _Container, _TemplatedMixin, _CssStateMixin, StackPanel){

	rias.theme.loadCss([
		"layout/AccordionContainer.css"
	]);

	var AccordionButton = rias.declare("rias.riasw.layout._AccordionButton", [_Widget, _TemplatedMixin, _CssStateMixin], {
		// summary:
		//		The title bar to click to open up an accordion pane.
		//		Internal widget used by AccordionContainer.
		// tags:
		//		private

		templateString:
			'<div data-dojo-attach-event="ondijitclick:_onTitleClick" class="dijitAccordionTitle" role="presentation">' +
				'<div role="tab" class="dijitAccordionTitleFocus" data-dojo-attach-point="titleNode,focusNode" data-dojo-attach-event="onkeydown:_onTitleKeyDown" aria-expanded="false">' +
					'<span role="presentation" class="dijitInline dijitAccordionArrow"></span>' +
					'<span role="presentation" class="arrowTextUp">+</span>' +
					'<span role="presentation" class="arrowTextDown">-</span>' +
					'<span role="presentation" class="dijitInline dijitIcon" data-dojo-attach-point="iconNode"></span>' +
					'<span role="presentation" data-dojo-attach-point="titleTextNode, textDirNode" class="dijitAccordionText"></span>' +
				'</div>' +
			'</div>',

		// label: String
		//		Title of the pane
		label: "",
		_setLabelAttr: {node: "titleTextNode", type: "innerHTML" },

		// title: String
		//		Tooltip that appears on hover
		title: "",
		_setTitleAttr: {node: "titleTextNode", type: "attribute", attribute: "title"},

		// iconClassAttr: String
		//		CSS class for icon to left of label
		iconClassAttr: "",
		_setIconClassAttr: { node: "iconNode", type: "class" },

		baseClass: "dijitAccordionTitle",

		getParent: function(){
			// summary:
			//		Returns the AccordionContainer parent.
			// tags:
			//		private
			return this.parent;
		},

		buildRendering: function(){
			this.inherited(arguments);
			var titleTextNodeId = this.id.replace(' ', '_');
			rias.dom.setAttr(this.titleTextNode, "id", titleTextNodeId + "_title");
			this.focusNode.setAttribute("aria-labelledby", rias.dom.getAttr(this.titleTextNode, "id"));
			rias.dom.setSelectable(this.domNode, false);
		},

		getTitleHeight: function(){
			// summary:
			//		Returns the height of the title dom node.
			return rias.dom.getMarginSize(this.domNode).h;	// Integer
		},

		// TODO: maybe the parent should set these methods directly rather than forcing the code
		// into the button widget?
		_onTitleClick: function(){
			// summary:
			//		Callback when someone clicks my title.
			var parent = this.getParent();
			parent.selectChild(this.contentWidget, true);
			rias.dom.focus(this.focusNode);
		},

		_onTitleKeyDown: function(/*Event*/ evt){
			return this.getParent()._onKeyDown(evt, this.contentWidget);
		},

		_setSelectedAttr: function(/*Boolean*/ isSelected){
			this._set("selected", isSelected);
			this.focusNode.setAttribute("aria-expanded", isSelected ? "true" : "false");
			this.focusNode.setAttribute("aria-selected", isSelected ? "true" : "false");
			this.focusNode.setAttribute("tabIndex", isSelected ? "0" : "-1");
		}
	});

	if(rias.has("dojo-bidi")){
		AccordionButton.extend({
			_setLabelAttr: function(label){
				this._set("label", label);
				rias.dom.setAttr(this.titleTextNode, "innerHTML", label);
				this.applyTextDir(this.titleTextNode);
			},

			_setTitleAttr: function(title){
				this._set("title", title);
				rias.dom.setAttr(this.titleTextNode, "title", title);
				this.applyTextDir(this.titleTextNode);
			}
		});
	}

	var AccordionInnerContainer = rias.declare("rias.riasw.layout._AccordionInnerContainer" + (rias.has("dojo-bidi") ? "_NoBidi" : ""), [_Widget, _CssStateMixin], {
		// summary:
		//		Internal widget placed as direct child of AccordionContainer.containerNode.
		//		When other widgets are added as children to an AccordionContainer they are wrapped in
		//		this widget.

		/*=====
		 // buttonWidget: Function|String
		 //		Class to use to instantiate title
		 //		(Wish we didn't have a separate widget for just the title but maintaining it
		 //		for backwards compatibility, is it worth it?)
		 buttonWidget: null,
		 =====*/

		/*=====
		 // contentWidget: dijit/_WidgetBase
		 //		Pointer to the real child widget
		 contentWidget: null,
		 =====*/

		baseClass: "dijitAccordionInnerContainer",

		// tell nested layout widget that we will take care of sizing
		isLayoutContainer: true,

		buildRendering: function(){
			// Builds a template like:
			//	<div class=dijitAccordionInnerContainer>
			//		Button
			//		<div class=dijitAccordionChildWrapper>
			//			ContentPane
			//		</div>
			//	</div>

			this.domNode = rias.dom.place("<div class='" + this.baseClass + "' role='presentation'>", this.contentWidget.domNode, "after");

			// wrapper div's first child is the button widget (ie, the title bar)
			var child = this.contentWidget,
				cls = rias.isString(this.buttonWidget) ? rias.getObject(this.buttonWidget) : this.buttonWidget;
			this.button = child._buttonWidget = (new cls({
				ownerRiasw: this,
				contentWidget: child,
				///增加 caption
				label: child.caption || child.title,
				title: child.tooltip,
				dir: child.dir,
				lang: child.lang,
				textDir: child.textDir || this.textDir,
				iconClass: child.iconClass,
				id: child.id + "_button",
				parent: this.parent
			})).placeAt(this.domNode);

			// and then the actual content widget (changing it from prior-sibling to last-child),
			// wrapped by a <div class=dijitAccordionChildWrapper>
			this.containerNode = rias.dom.place("<div class='dijitAccordionChildWrapper' role='tabpanel' style='display:none'>", this.domNode);
			this.containerNode.setAttribute("aria-labelledby", this.button.id);

			rias.dom.place(this.contentWidget.domNode, this.containerNode);
		},

		postCreate: function(){
			this.inherited(arguments);

			// Map changes in content widget's title etc. to changes in the button
			var button = this.button,
				cw = this.contentWidget;
			this._contentWidgetWatches = [
				cw.watch('title', rias.hitch(this, function(name, oldValue, newValue){
					button.set("label", newValue);
				})),
				///增加 caption
				cw.watch('caption', rias.hitch(this, function(name, oldValue, newValue){
					button.set("label", newValue);
				})),
				cw.watch('tooltip', rias.hitch(this, function(name, oldValue, newValue){
					button.set("title", newValue);
				})),
				cw.watch('iconClass', rias.hitch(this, function(name, oldValue, newValue){
					button.set("iconClass", newValue);
				}))
			];
		},

		_setSelectedAttr: function(/*Boolean*/ isSelected){
			this._set("selected", isSelected);
			this.button.set("selected", isSelected);
			if(isSelected){
				var cw = this.contentWidget;
				if(cw.onSelected){
					cw.onSelected();
				}
			}
		},

		startup: function(){
			// Called by _Container.addChild()
			this.contentWidget.startup();
		},

		destroy: function(){
			this.button.destroyRecursive();

			rias.forEach(this._contentWidgetWatches || [], function(w){
				w.unwatch();
			});

			delete this.contentWidget._buttonWidget;
			delete this.contentWidget._wrapperWidget;

			this.inherited(arguments);
		},

		destroyDescendants: function(/*Boolean*/ preserveDom){
			// since getChildren isn't working for me, have to code this manually
			this.contentWidget.destroyRecursive(preserveDom);
		}
	});

	if(rias.has("dojo-bidi")){
		AccordionInnerContainer = rias.declare("rias.riasw.layout._AccordionInnerContainer", AccordionInnerContainer, {
			postCreate: function(){
				this.inherited(arguments);

				// Map changes in content widget's textdir to changes in the button
				var button = this.button;
				this._contentWidgetWatches.push(
					this.contentWidget.watch("textDir", function(name, oldValue, newValue){
						button.set("textDir", newValue);
					})
				);
			}
		});
	}

	var riasType = "rias.riasw.layout.AccordionPanel";
	var Widget = rias.declare(riasType, StackPanel, {
		// summary:
		//		Holds a set of panes where every pane's title is visible, but only one pane's content is visible at a time,
		//		and switching between panes is visualized by sliding the other panes up/down.
		// example:
		//	|	<div data-dojo-type="dijit/layout/AccordionContainer">
		//	|		<div data-dojo-type="dijit/layout/ContentPane" title="pane 1">
		//	|		</div>
		//	|		<div data-dojo-type="dijit/layout/ContentPane" title="pane 2">
		//	|			<p>This is some text</p>
		//	|		</div>
		//	|	</div>

		// duration: Integer
		//		Amount of time (in ms) it takes to slide panes
		duration: rias.defaultDuration,

		// buttonWidget: [const] String
		//		The name of the widget used to display the title of each pane
		buttonWidget: AccordionButton,

		/*=====
		 // _verticalSpace: Number
		 //		Pixels of space available for the open pane
		 //		(my content box size minus the cumulative size of all the title bars)
		 _verticalSpace: 0,
		 =====*/
		baseClass: "dijitAccordionContainer",

		buildRendering: function(){
			this.inherited(arguments);
			this.domNode.style.overflow = "hidden";		// TODO: put this in dijit.css
			this.domNode.setAttribute("role", "tablist");
		},

		startup: function(){
			if(this._started){
				return;
			}
			this.inherited(arguments);
			if(this.selectedChildWidget){
				this.selectedChildWidget._wrapperWidget.set("selected", true);
			}
		},

		_getContainerContentBox:function(){
			var openPane = this.selectedChildWidget;
			if(!openPane){
				return;
			}

			var wrapperDomNode = openPane._wrapperWidget.domNode,
				wrapperDomNodeMargin = rias.dom.getMarginExtents(wrapperDomNode),
				wrapperDomNodePadBorder = rias.dom.getPadBorderExtents(wrapperDomNode),
				wrapperContainerNode = openPane._wrapperWidget.containerNode,
				wrapperContainerNodeMargin = rias.dom.getMarginExtents(wrapperContainerNode),
				wrapperContainerNodePadBorder = rias.dom.getPadBorderExtents(wrapperContainerNode),
				mySize = this._contentBox,
				totalCollapsedHeight = 0;
			rias.forEach(this.getChildren(), function(child){
				/// 改为只取 child 的 titleHeight，不取 MarginBox
				if(child != openPane){
					// Using domGeometry.getMarginSize() rather than domGeometry.position() since claro has 1px bottom margin
					// to separate accordion panes.  Not sure that works perfectly, it's probably putting a 1px
					// margin below the bottom pane (even though we don't want one).
					totalCollapsedHeight += child._buttonWidget.getTitleHeight();
				}
			});
			this._verticalSpace = mySize.h - totalCollapsedHeight - wrapperDomNodeMargin.h
				- wrapperDomNodePadBorder.h - wrapperContainerNodeMargin.h - wrapperContainerNodePadBorder.h
				- openPane._buttonWidget.getTitleHeight();
			return this._containerContentBox = {
				h: this._verticalSpace,
				w: this._contentBox.w - wrapperDomNodeMargin.w - wrapperDomNodePadBorder.w
					- wrapperContainerNodeMargin.w - wrapperContainerNodePadBorder.w
			};
		},
		_layoutChildren: function(){
			// Implement _LayoutWidget.layout() virtual method.
			// Set the height of the open pane based on what room remains.

			var openPane = this.selectedChildWidget;

			if(!openPane){
				return true;
			}

			openPane.resize(this._getContainerContentBox());
			return true;
		},

		_setupChild: function(child, added){
			// Overrides _LayoutWidget._setupChild().
			// Put wrapper widget around the child widget, showing title

			if(added && !child._wrapperWidget){
				child._wrapperWidget = AccordionInnerContainer({
					ownerRiasw: this,
					contentWidget: child,
					buttonWidget: this.buttonWidget,
					id: child.id + "_wrapper",
					dir: child.dir,
					lang: child.lang,
					textDir: child.textDir || this.textDir,
					parent: this
				});
			}

			this.inherited(arguments);

			if(added){
				// Since we are wrapping children in AccordionInnerContainer, replace the default
				// wrapper that we created in StackPanel.
				rias.dom.place(child.domNode, child._wrapper, "replace");
			}
		},

		removeChild: function(child){
			// Overrides _LayoutWidget.removeChild().

			// Destroy wrapper widget first, before StackPanel.getChildren() call.
			// Replace wrapper widget with true child widget (ContentPane etc.).
			// This step only happens if the AccordionContainer has been started; otherwise there's no wrapper.
			// (TODO: since StackPanel destroys child._wrapper, maybe it can do this step too?)
			if(child._wrapperWidget){
				rias.dom.place(child.domNode, child._wrapperWidget.domNode, "after");
				child._wrapperWidget.destroy();
				delete child._wrapperWidget;
			}

			rias.dom.removeClass(child.domNode, "dijitHidden");

			this.inherited(arguments);
		},

		getChildren: function(){
			// Overrides _Container.getChildren() to return content panes rather than internal AccordionInnerContainer panes
			return rias.map(this.inherited(arguments), function(child){
				return child.declaredClass == "rias.riasw.layout._AccordionInnerContainer" ? child.contentWidget : child;
			}, this);
		},

		destroy: function(){
			if(this._animation){
				this._animation.stop();
			}
			rias.forEach(this.getChildren(), function(child){
				// If AccordionContainer has been started, then each child has a wrapper widget which
				// also needs to be destroyed.
				if(child._wrapperWidget){
					child._wrapperWidget.destroy();
				}else{
					child.destroyRecursive();
				}
			});
			this.inherited(arguments);
		},

		_showChild: function(page, /*Boolean*/ animate){
			// Override StackPanel._showChild() to set visibility of _wrapperWidget.containerNode
			page._wrapperWidget.containerNode.style.display = "block";
			return this.inherited(arguments);
		},

		_hideChild: function(child, /*Boolean*/ animate){
			// Override StackPanel._showChild() to set visibility of _wrapperWidget.containerNode
			child._wrapperWidget.containerNode.style.display = "none";
			return this.inherited(arguments);
		},

		_transition: function(/*dijit/_WidgetBase?*/ newWidget, /*dijit/_WidgetBase?*/ oldWidget, /*Boolean*/ animate){
			var self = this,
				d = rias.newDeferred();
			if(rias.has("ie") < 8){
				// workaround animation bugs by not animating; not worth supporting animation for IE6 & 7
				animate = false;
			}
			if(self._animation){
				// there's an in-progress animation.  speedily end it so we can do the newly requested one
				self._animation.stop(true);
				delete self._animation;
			}

			///先 hide，以保证 showChild 取 大小 正确，同时调整 动画 处理
			if(oldWidget){
				oldWidget._wrapperWidget.set("selected", false);
			}
			if(newWidget){
				newWidget._wrapperWidget.set("selected", true);
			}

			///需要另行计算 _verticalSpace
			if(animate){
				var newContents = newWidget._wrapperWidget.containerNode,
					oldContents = oldWidget._wrapperWidget.containerNode;

				// During the animation we will be showing two dijitAccordionChildWrapper nodes at once,
				// which on claro takes up 4px extra space (compared to stable AccordionContainer).
				// Have to compensate for that by immediately shrinking the pane being closed.
				var h = this._getContainerContentBox().h,
					wrapperContainerNode = newWidget._wrapperWidget.containerNode,
					wrapperContainerNodeMargin = rias.dom.getMarginExtents(wrapperContainerNode),
					wrapperContainerNodePadBorder = rias.dom.getPadBorderExtents(wrapperContainerNode),
					animationHeightOverhead = wrapperContainerNodeMargin.h + wrapperContainerNodePadBorder.h;

				oldContents.style.height = (h - animationHeightOverhead) + "px";

				self._animation = new rias.fx.Animation({
					node: newContents,
					duration: self.duration,
					curve: [1, h - animationHeightOverhead - 1],
					onAnimate: function(value){
						//console.debug("onAnimate", value);
						value = Math.floor(value);	// avoid fractional values
						newContents.style.height = value + "px";
						oldContents.style.height = (h - animationHeightOverhead - value) + "px";
						if(newWidget){
							rias.when(self._showChild(newWidget), function(w){
								d.resolve(w);
							});
						}else{
							d.resolve(w);
						}
					},
					onEnd: function(){
						delete self._animation;
						newContents.style.height = "auto";
						oldWidget._wrapperWidget.containerNode.style.display = "none";
						oldContents.style.height = "auto";
						///关闭 动画，避免隐藏 containerNode
						self._hideChild(oldWidget, false);
					}
				});
				self._animation.onStop = self._animation.onEnd;
				self._animation.play();
			}else if(newWidget){
				rias.when(self._showChild(newWidget), function(w){
					d.resolve(w);
				});
			}else{
				d.resolve();
			}

			return d;	// If child has an href, promise that fires when the widget has finished loading
		},

		// note: we are treating the container as controller here
		_onKeyDown: function(/*Event*/ e, /*dijit/_WidgetBase*/ fromTitle){
			// summary:
			//		Handle keydown events
			// description:
			//		This is called from a handler on AccordionContainer.domNode
			//		(setup in StackPanel), and is also called directly from
			//		the click handler for accordion labels
			if(this.disabled || e.altKey || !(fromTitle || e.ctrlKey)){
				return;
			}
			var c = e.keyCode;
			if((fromTitle && (c == rias.keys.LEFT_ARROW || c == rias.keys.UP_ARROW)) ||
				(e.ctrlKey && c == rias.keys.PAGE_UP)){
				this._adjacent(false)._buttonWidget._onTitleClick();
				e.stopPropagation();
				e.preventDefault();
			}else if((fromTitle && (c == rias.keys.RIGHT_ARROW || c == rias.keys.DOWN_ARROW)) ||
				(e.ctrlKey && (c == rias.keys.PAGE_DOWN || c == rias.keys.TAB))){
				this._adjacent(true)._buttonWidget._onTitleClick();
				e.stopPropagation();
				e.preventDefault();
			}
		}
	});

	// For monkey patching
	Widget._InnerContainer = AccordionInnerContainer;
	Widget._Button = AccordionButton;

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswAccordionContainerIcon",
		iconClass16: "riaswAccordionContainerIcon16",
		defaultParams: {
			//content: "<span></span>",
			//doLayout: true,
			//duration: rias.defaultDuration,
			persist: false
		},
		initialSize: {},
		//allowedChild: "",
		property: {
			doLayout: {
				datatype: "boolean",
				defaultValue: true,
				hidden: true
			},
			duration: {
				datatype: "number",
				defaultValue: rias.defaultDuration,
				title: "Duration"
			},
			persist: {
				datatype: "boolean",
				description: "Remembers the selected child across sessions\n\n\nBoolean",
				defaultValue: true,
				hidden: false
			},
			selectedChildWidget: {
				datatype: "object",
				description: "References the currently selected child widget, if any",
				hidden: true
			},
			isContainer: {
				datatype: "boolean",
				description: "Just a flag indicating that this widget descends from dijit._Container",
				defaultValue: true,
				hidden: true
			}
		},
		childProperty: {
			selected: {
				datatype: "boolean",
				title: "Selected"
			},
			closable: {
				datatype: "boolean",
				title: "Closable"
			}
		}
	};

	return Widget;
});
