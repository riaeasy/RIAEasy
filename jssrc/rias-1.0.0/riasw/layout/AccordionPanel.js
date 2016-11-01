
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

	//rias.theme.loadThemeCss([
	//	"riasw/layout/AccordionPanel.css"
	//]);

	var AccordionButton = rias.declare("rias.riasw.layout._AccordionButton", [_Widget, _TemplatedMixin, _CssStateMixin], {
		// summary:
		//		The title bar to click to open up an accordion pane.
		//		Internal widget used by AccordionContainer.
		// tags:
		//		private

		baseClass: "riaswAccordionTitle",

		templateString:
			'<div data-dojo-attach-event="ondijitclick:_onTitleClick, onkeydown:_onTitleKeyDown" role="presentation">' +
				'<div role="tab" data-dojo-attach-point="focusNode" class="riaswAccordionTitleFocusNode" aria-expanded="false">' +
					'<span role="presentation" class="dijitInline riaswAccordionArrow"></span>' +
					'<span role="presentation" class="arrowTextUp">+</span>' +
					'<span role="presentation" class="arrowTextDown">-</span>' +
					'<span role="presentation" class="dijitInline dijitIcon" data-dojo-attach-point="iconNode"></span>' +
					'<span role="presentation" data-dojo-attach-point="titleTextNode,labelNode,textDirNode" class="riaswAccordionText"></span>' +
				'</div>' +
			'</div>',

		cssStateNodes: {
			focusNode: "riaswAccordionTitleFocusNode"
		},

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

		getParent: function(){
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
			return rias.dom.getMarginBox(this.domNode).h;	// Integer
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
			isSelected = !!isSelected;
			this._set("selected", isSelected);
			this.focusNode.setAttribute("aria-expanded", isSelected ? "true" : "false");
			this.focusNode.setAttribute("aria-selected", isSelected ? "true" : "false");
			this.focusNode.setAttribute("tabIndex", isSelected ? "0" : "-1");
			rias.dom.toggleClass(this.focusNode, "riaswAccordionTitleFocusNodeSelected", isSelected);
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

		baseClass: "riaswAccordionInnerContainer",
		//cssStateNodes: {
		//	containerNode: "riaswAccordionChildWrapper"
		//},

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
				badge: child.badge,
				badgeStyle: child.badgeStyle,
				badgeColor: child.badgeColor,
				id: child.id + "_button",
				parent: this.parent
			})).placeAt(this.domNode);

			this.containerNode = rias.dom.place("<div class='riaswAccordionChildWrapper' role='tabpanel' style='display:none'>", this.domNode);
			this.containerNode.setAttribute("aria-labelledby", this.button.id);

			rias.dom.place(this.contentWidget.domNode, this.containerNode);
		},

		postCreate: function(){
			this.inherited(arguments);

			// Map changes in content widget's title etc. to changes in the button
			var button = this.button,
				cw = this.contentWidget;
			this._contentWidgetWatches = [
				cw.watch('title', function(name, oldValue, newValue){
					button.set("label", newValue);
				}),
				///增加 caption
				cw.watch('caption', function(name, oldValue, newValue){
					button.set("label", newValue);
				}),
				cw.watch('tooltip', function(name, oldValue, newValue){
					button.set("title", newValue);
				}),
				cw.watch('iconClass', function(name, oldValue, newValue){
					button.set("iconClass", newValue);
				}),
				cw.watch('badgeStyle', function(name, oldValue, newValue){
					button.set("badgeStyle", newValue);
				}),
				cw.watch('badgeColor', function(name, oldValue, newValue){
					button.set("badgeColor", newValue);
				}),
				cw.watch('badge', function(name, oldValue, newValue){
					button.set("badge", newValue);
				})
			];
		},

		_setSelectedAttr: function(/*Boolean*/ isSelected){
			isSelected = !!isSelected;
			this._set("selected", isSelected);
			this.button.set("selected", isSelected);
			///rias.dom.toggleClass(this.containerNode, "riaswAccordionChildWrapperSelected", isSelected);///无此必要，因为肯定是 selected
			if(isSelected){
				var cw = this.contentWidget;
				if(cw.onSelected){
					cw.onSelected(isSelected);
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
				w.remove();//w.unwatch();//Remove unwatch in dojo2.0
			});

			this.contentWidget._buttonWidget = undefined;
			this.contentWidget._wrapperWidget = undefined;

			this.inherited(arguments);
		},

		destroyDescendants: function(/*Boolean*/ preserveDom){
			// since getChildren isn't working for me, have to code this manually
			this.contentWidget.destroyRecursive(preserveDom);
		}

	});

	if(rias.has("dojo-bidi")){
		AccordionInnerContainer = rias.declare("rias.riasw.layout._AccordionInnerContainer", [AccordionInnerContainer], {
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

	var riaswType = "rias.riasw.layout.AccordionPanel";
	var Widget = rias.declare(riaswType, StackPanel, {
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
		//duration: rias.defaultDuration,

		// buttonWidget: [const] String
		//		The name of the widget used to display the title of each pane
		buttonWidget: AccordionButton,

		/*=====
		 // _verticalSpace: Number
		 //		Pixels of space available for the open pane
		 //		(my content box size minus the cumulative size of all the title bars)
		 _verticalSpace: 0,
		 =====*/
		baseClass: "riaswAccordionPanel",

		buildRendering: function(){
			this.inherited(arguments);
			//this.domNode.style.overflow = "hidden";
			this.domNode.setAttribute("role", "tablist");
		},
		destroy: function(){
			if(this._animation){
				this._animation.stop();
				this._animation = undefined;
			}
			rias.forEach(this.getChildren(), function(child){
				// If AccordionContainer has been started, then each child has a wrapper widget which
				// also needs to be destroyed.
				if(child._wrapperWidget){
					rias.destroy(child._wrapperWidget);
					child._wrapperWidget = undefined;
				}else{
					child.destroyRecursive();
				}
			});
			this.inherited(arguments);
		},

		startup: function(){
			if(this._started){
				return;
			}
			this.inherited(arguments);
			//this.resize();
			if(this.selectedChildWidget){
				this.selectedChildWidget._wrapperWidget.set("selected", true);
			}
		},

		getChildren: function(){
			// Overrides _Container.getChildren() to return content panes rather than internal AccordionInnerContainer panes
			return rias.map(this.inherited(arguments), function(child){
				return child.declaredClass == "rias.riasw.layout._AccordionInnerContainer" ? child.contentWidget : child;
			}, this);
		},

		_getContainerContentBox: function(child){
			if(!child){
				return;
			}
			if(!this._contentBox){
				console.warn(this.id, "The AccordionPanel should need a initial size.", this);
				return;
			}

			var wrapperDomNode = child._wrapperWidget.domNode,
				wrapperDomNodeMargin = rias.dom.getMarginExtents(wrapperDomNode),
				wrapperDomNodePadBorder = rias.dom.getPadBorderExtents(wrapperDomNode),
				wrapperContainerNode = child._wrapperWidget.containerNode,
				wrapperContainerNodeMargin = rias.dom.getMarginExtents(wrapperContainerNode),
				wrapperContainerNodePadBorder = rias.dom.getPadBorderExtents(wrapperContainerNode),
				childMargin = rias.dom.getMarginExtents(child.domNode),
				childBorder = rias.dom.getPadBorderExtents(child.domNode),
				totalCollapsedHeight = 0;
			rias.forEach(this.getChildren(), function(c){
				/// 应该取 child 的 MarginBox
				if(c != child){
					// Using domGeometry.getMarginSize() rather than domGeometry.position() since claro has 1px bottom margin
					// to separate accordion panes.  Not sure that works perfectly, it's probably putting a 1px
					// margin below the bottom pane (even though we don't want one).
					c._wrapperWidget && (totalCollapsedHeight += rias.dom.getMarginBox(c._wrapperWidget.domNode).h);
				}
			});
			this._verticalSpace = this._contentBox.h
				- totalCollapsedHeight
				- childMargin.h
				- childBorder.h
				- wrapperDomNodeMargin.h
				- wrapperDomNodePadBorder.h
				- wrapperContainerNodeMargin.h
				- wrapperContainerNodePadBorder.h
				- child._buttonWidget.getTitleHeight();
			return this._containerContentBox = {
				h: this._verticalSpace,
				w: this._contentBox.w
					- childMargin.w
					- childBorder.w
					- wrapperDomNodeMargin.w
					- wrapperDomNodePadBorder.w
					- wrapperContainerNodeMargin.w
					- wrapperContainerNodePadBorder.w
			};
		},
		_layoutChildren: function(){
			// Implement _LayoutWidget.layout() virtual method.
			// Set the height of the open pane based on what room remains.
			var openPane = this.selectedChildWidget;
			if(!openPane){
				return true;
			}
			//console.debug(this.id + " _layoutChildren: ", this._contentBox);
			rias.dom.noOverflowCall(this.containerNode, function(){
				var box = this._getContainerContentBox(openPane);
				rias.dom.setMarginSize(openPane._wrapperWidget.domNode, {
					h: box.h + rias.dom.getMarginBox(openPane._buttonWidget.domNode).h
				});
				rias.dom.setMarginSize(openPane._wrapperWidget.containerNode, box);
				openPane.resize(box);
			}, this);
			return true;
		},

		_showChild: function(child, args){
			child._wrapperWidget.set("selected", true);
			child._wrapperWidget.containerNode.style.display = "block";
			return this.inherited(arguments);
		},
		_hideChild: function(child, args){
			child._wrapperWidget.set("selected", false);
			child._wrapperWidget.containerNode.style.display = "none";
			return this.inherited(arguments);
		},
		_transition: function(/*dijit/_WidgetBase?*/ newWidget, /*dijit/_WidgetBase?*/ oldWidget, /*Boolean*/ animate){
			var self = this,
				df = rias.newDeferred(function(){
					console.debug(self.id + "._transition cancel " + (newWidget ? newWidget.id : ""));
				});
			self.set("selectedChildWidget", newWidget);
			if(rias.has("ie") < 8){
				// workaround animation bugs by not animating; not worth supporting animation for IE6 & 7
				animate = false;
			}
			if(self._animation){
				// there's an in-progress animation.  speedily end it so we can do the newly requested one
				self._animation.stop(true);
				self._animation = undefined;
			}

			///需要另行计算 _verticalSpace
			///oldWidget 可能已经 destroy
			if(animate && oldWidget){
				var newContents = newWidget._wrapperWidget.domNode,
					oldContents = oldWidget._wrapperWidget.domNode;

				///需要在 _showChild(newWidget) 之前获取，避免包含 newWidget 的 containerNode
				var h = self._getContainerContentBox(oldWidget).h,
					nh = rias.dom.getStyle(newContents, "height"),// rias.dom.getMarginBox(newContents).h,///此时，newContents 没有包含 h
					oh = rias.dom.getStyle(oldContents, "height") - h;
				oldWidget._wrapperWidget.set("selected", false);///先去掉 selected 的 css
				self._showChild(newWidget, {
					animate: false
				}).always(function(){
						// During the animation we will be showing two dijitAccordionChildWrapper nodes at once,
						// which on claro takes up 4px extra space (compared to stable AccordionContainer).
						// Have to compensate for that by immediately shrinking the pane being closed.

						//oldContents.style.height = h + "px";

						self._animation = new rias.fx.Animation({
							node: newContents,
							duration: self.duration,
							curve: [0, h],
							onAnimate: function(value){
								//console.debug("onAnimate", value);
								value = Math.floor(value);	// avoid fractional values
								newContents.style.height = (value + nh) + "px";
								newWidget.domNode.style.height = (value) + "px";
								oldContents.style.height = (h - value + oh) + "px";
								oldWidget.domNode.style.height = (h - value) + "px";
							},
							onEnd: function(){
								self._animation = undefined;

								self._hideChild(oldWidget, {
									animate: false///关闭 动画，避免隐藏 containerNode
								});
								if(rias.isFunction(newWidget._doPlayContent)){
									newWidget._doPlayContent(true).always(function(){
										df.resolve(newWidget);
									});
								}else{
									df.resolve(newWidget);
								}
							}
						});
						self._animation.onStop = self._animation.onEnd;
						self._animation.play();
					});
			}else if(newWidget){
				self._showChild(newWidget).always(function(){
					df.resolve(newWidget);
				});
			}else{
				df.resolve();
			}

			return df.promise.always(function(result){
				rias.publish(self.id + "-selectChild", newWidget, self._focused);
				if(self.persist){
					rias.cookie(self.id + "_selectedChild", self.selectedChildWidget.id);
				}
				self.set("needLayout", true);
				self.resize();
				if(newWidget && self.isShown() && self.get("visible")){
					///避免在 addChild 时，引起 restore.
					newWidget.focus();
				}
				return result;
			});
		},

		_setupChild: function(child, added, insertIndex, noresize){
			if(added && !child._wrapperWidget){
				child._wrapperWidget = new AccordionInnerContainer({
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
				rias.dom.place(child.domNode, child._wrapper, "replace");
			}
		},
		addChild: function(/*dijit/_WidgetBase*/ child, /*Integer?*/ insertIndex, noresize){
			this.inherited(arguments, [child, insertIndex, true]);
			if(this._started && !this.isDestroyed(true)){
				this.set("needLayout", true);
				this.defer("resize");
			}
		},
		removeChild: function(child, noresize){
			// Destroy wrapper widget first, before StackPanel.getChildren() call.
			// Replace wrapper widget with true child widget (ContentPane etc.).
			// This step only happens if the AccordionContainer has been started; otherwise there's no wrapper.
			// (TODO: since StackPanel destroys child._wrapper, maybe it can do this step too?)
			if(child._wrapperWidget){
				//rias.dom.place(child.domNode, child._wrapperWidget.domNode, "after");
				rias.destroy(child._wrapperWidget);
				child._wrapperWidget = undefined;
			}

			this.inherited(arguments);
			/*if(this._started && !this.isDestroyed(true)){
				this.set("needLayout", true);
				this.defer("resize");
			}*/
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
		iconClass: "riaswAccordionPanelIcon",
		iconClass16: "riaswAccordionPanelIcon16",
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
			/*duration: {
				datatype: "number",
				defaultValue: rias.defaultDuration,
				title: "Duration"
			},*/
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
