
//RIAStudio client runtime widget - AccordionPanel

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/_CssStateMixin",
	"riasw/layout/StackPanel"
], function(rias, _WidgetBase, _TemplatedMixin, _CssStateMixin, StackPanel){

	//rias.theme.loadThemeCss([
	//	"riasw/layout/AccordionPanel.css"
	//]);

	var AccordionButton = rias.declare("riasw.layout._AccordionButton", [_WidgetBase, _TemplatedMixin, _CssStateMixin], {
		// summary:
		//		The caption bar to click to open up an accordion pane.
		//		Internal widget used by AccordionContainer.
		// tags:
		//		private

		templateString:
			'<div class = "dijitReset" data-dojo-attach-point="focusNode" data-dojo-attach-event="ondijitclick:_onCaptionClick, onkeydown:_onCaptionKeyDown" aria-expanded="false" role="tab">' +
				//'<span role="presentation" class="dijitInline riaswAccordionArrow"></span>' +
				//'<span role="presentation" class="arrowTextUp">+</span>' +
				//'<span role="presentation" class="arrowTextDown">-</span>' +
				'<span role="presentation" class="riaswButtonIcon riaswNoIcon" data-dojo-attach-point="iconNode"></span>' +
				'<span role="presentation" data-dojo-attach-point="labelNode" class="riaswAccordionCaptionLabel"></span>' +
			'</div>',

		baseClass: "riaswAccordionCaption",

		// label: String
		//		Caption label of the pane
		label: "",
		_setLabelAttr: function(label){
			this._set("label", label);
			if(this.labelNode){
				rias.dom.setAttr(this.labelNode, "innerHTML", label);
				//if(this.applyTextDir){
				//	this.applyTextDir(this.labelNode);
				//}
			}
		},

		buildRendering: function(){
			this.inherited(arguments);
			if(this.labelNode){
				rias.dom.setAttr(this.labelNode, "id", this.id.replace(' ', '_') + "_caption");
				this.focusNode.setAttribute("aria-labelledby", rias.dom.getAttr(this.labelNode, "id"));
			}
			rias.dom.setSelectable(this.domNode, false);
		},

		getCaptionHeight: function(){
			// summary:
			//		Returns the height of the dom node.
			return rias.dom.getMarginBox(this.domNode).h;	// Integer
		},

		_onCaptionClick: function(){
			this.ownerAccordion.selectChild(this.targetWidget);
			rias.dom.focus(this.focusNode);
		},

		_onCaptionKeyDown: function(/*Event*/ evt){
			return this.getParent()._onKeyDown(evt, this.targetWidget);
		},

		_setSelectedAttr: function(/*Boolean*/ isSelected){
			isSelected = !!isSelected;
			this._set("selected", isSelected);
			this.focusNode.setAttribute("aria-expanded", isSelected ? "true" : "false");
			this.focusNode.setAttribute("aria-selected", isSelected ? "true" : "false");
			this.focusNode.setAttribute("tabIndex", isSelected ? "0" : "-1");
		}
	});

	var AccordionInnerContainer = rias.declare("riasw.layout._AccordionInnerContainer", [_WidgetBase, _CssStateMixin], {
		// summary:
		//		Internal widget placed as direct child of AccordionContainer.containerNode.
		//		When other widgets are added as children to an AccordionContainer they are wrapped in
		//		this widget.

		baseClass: "riaswAccordionInner",
		//cssStateNodes: {
		//	containerNode: "riaswAccordionChildContainer"
		//},

		buildRendering: function(){
			this.domNode = rias.dom.place("<div class='" + this.baseClass + "' role='presentation'>", this.targetWidget.domNode, "after");

			// wrapper div's first child is the _buttonWidget widget (ie, the caption bar)
			var child = this.targetWidget,
				cls = rias.isString(this.buttonCtor) ? rias.getObject(this.buttonCtor) : this.buttonCtor;
			this._buttonWidget = child._buttonWidget = (new cls({
				ownerRiasw: this,
				targetWidget: child,
				ownerAccordion: this.ownerAccordion,
				///增加 caption
				label: child.caption || child.title,
				tooltip: child.tooltip,
				dir: child.dir,
				lang: child.lang,
				textDir: child.textDir || this.textDir,
				iconClass: child.iconClass,
				badge: child.badge,
				badgeStyle: child.badgeStyle,
				badgeColor: child.badgeColor,
				id: child.id + "_button"
			}));
			this._buttonWidget.placeAt(this.domNode);

			this.containerNode = rias.dom.place("<div class='riaswAccordionChildContainer' role='tabpanel' style='display:none'>", this.domNode);
			this.containerNode.setAttribute("aria-labelledby", this._buttonWidget.id);
			this.stateNode = this.containerNode;

			rias.dom.place(this.targetWidget.domNode, this.containerNode);
		},
		postCreate: function(){
			this.inherited(arguments);

			// Map changes in content widget's caption etc. to changes in the _buttonWidget
			var button = this._buttonWidget,
				cw = this.targetWidget;
			this.own(
				cw.watch("textDir", function(name, oldValue, newValue){
					button.set("textDir", newValue);
				}),
				cw.watch('title', function(name, oldValue, newValue){
					button.set("label", newValue);
				}),
				///增加 caption
				cw.watch('caption', function(name, oldValue, newValue){
					button.set("label", newValue);
				}),
				cw.watch('tooltip', function(name, oldValue, newValue){
					button.set("tooltip", newValue);
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
			);
		},
		_onDestroy: function(){
			this._buttonWidget.destroy();

			this.targetWidget._buttonWidget = undefined;
			this.targetWidget._wrapperWidget = undefined;
			this.targetWidget._wrapper = undefined;
			this.targetWidget._container = undefined;

			this.inherited(arguments);
		},
		///需要判断 ownerRiasw，应该由 inherited 处理
		//destroyDescendants: function(/*Boolean*/ preserveDom){
		//	// since getChildren isn't working for me, have to code this manually
		//	this.targetWidget.destroy(preserveDom);
		//},

		startup: function(){
			if(!this.targetWidget._started){
				this.targetWidget.startup();
			}
		},

		_setSelectedAttr: function(/*Boolean*/ isSelected){
			isSelected = !!isSelected;
			this._set("selected", isSelected);
			this._buttonWidget.set("selected", isSelected);
			///rias.dom.toggleClass(this.containerNode, "riaswAccordionChildWrapperSelected", isSelected);///无此必要，因为肯定是 selected
			if(isSelected){
				this.containerNode.setAttribute('tabIndex', this.tabIndex);
				this._buttonWidget.set("tabIndex", -1);
				if(this.targetWidget.onSelected){
					this.targetWidget.onSelected(isSelected);
				}
			}else{
				this._buttonWidget.set("tabIndex", this.tabIndex);
				this.containerNode.removeAttribute('tabIndex');
			}
		},

		_getFocusableNode: function(){
			return this.inherited(arguments, [this.selected ? this.containerNode : this._buttonWidget.isFocusable()]);
		}
	});

	var riaswType = "riasw.layout.AccordionPanel";
	var Widget = rias.declare(riaswType, StackPanel, {

		baseClass: "riaswAccordionPanel",

		// buttonCtor: [const] String
		//		The name of the widget used to display the caption of each pane
		buttonCtor: AccordionButton,

		buildRendering: function(){
			this.inherited(arguments);
			//this.domNode.style.overflow = "hidden";
			this.domNode.setAttribute("role", "tablist");
		},

		_onStartup: function(){
			this.inherited(arguments);
			if(this.selectedChild){
				this.selectedChild._wrapperWidget.set("selected", true);
			}
		},

		getChildren: function(){
			return rias.map(this.inherited(arguments), function(child){
				return rias.is(child, AccordionInnerContainer) ? child.targetWidget : child;
			}, this);
		},

		_getWrapperBox: function(child, box){
			if(!child){
				return;
			}
			if(!box){
				console.warn(this.id, "The AccordionPanel should need a initial size.", this);
				return;
			}

			var totalCollapsedHeight = 0;
			rias.forEach(this.getChildren(), function(c){
				/// 应该取 children 的 MarginBox
				if(c !== child && c._wrapperWidget){
					totalCollapsedHeight += c._buttonWidget.getCaptionHeight();
					totalCollapsedHeight += rias.dom.getMarginExtents(c._wrapper).h + rias.dom.getPadBorderExtents(c._wrapper).h;
				}
			});
			box = rias.dom.getContentBox(this.containerNode);
			box.h -= totalCollapsedHeight;
			this._wrapperBox = box;
			return this._wrapperBox;
		},
		_layoutChildren: function(changedChildId, changedChildSize){
			var child = rias.by(changedChildId, this) || this.selectedChild;
			if(child && !child.isDestroyed(true) && this._contentBox){
				this._getWrapperBox(child, this._contentBox);
				rias.dom.setMarginBox(child._wrapper, this._wrapperBox);
				this._containerBox = rias.dom.getContentBox(child._wrapper);
				this._containerBox.t += child._buttonWidget.getCaptionHeight();
				this._containerBox.h -= child._buttonWidget.getCaptionHeight();
				rias.dom.setMarginBox(child._container, this._containerBox);
				this._containerContentBox = rias.dom.getContentBox(child._container);
				changedChildSize = rias.mixin({}, this._containerContentBox, changedChildSize);
				if(child.resize){
					child.resize(changedChildSize);
				}
			}
			return true;
		},

		_showChild: function(child, args){
			if(child && !child.isDestroyed()){
				child._wrapperWidget.set("selected", true);
				child._container.style.display = "block";
			}
			return this.inherited(arguments, [child, args]);
		},
		_afterHideChild: function(child){
			/// 屏蔽 StackPanel 中的处理
			this.afterHideChild(child);
		},
		_hideChild: function(child, args){
			if(child && !child.isDestroyed()){
				child._wrapperWidget.set("selected", false);
				child._container.style.display = "none";
				//child.domNode.style.height = "";
				child._container.style.height = "";
				child._wrapper.style.height = "";
			}
			return this.inherited(arguments);
		},
		_transition: function(/*_WidgetBase?*/ newWidget, /*_WidgetBase?*/ oldWidget, /*Boolean*/ animate){
			var self = this,
				df = rias.newDeferred(function(){
					console.debug(self.id + "._transition cancel " + (newWidget ? newWidget.id : ""));
					if(oldWidget && oldWidget._stopPlay){
						oldWidget._stopPlay();
					}
					if(newWidget && newWidget._stopPlay){
						newWidget._stopPlay();
					}
					return false;
				});
			if(!this.animate || !this.isShowing(false) || !this.get("visible") || rias.has("ie") < 9){
				// workaround animation bugs by not animating; not worth supporting animation for IE6 & 7
				animate = false;
			}
			self._stopAnimation();
			if(self._transitionDeferred){
				self._transitionDeferred.cancel();
			}
			self._transitionDeferred = df;
			if(oldWidget && (oldWidget.isDestroyed(true))){
				oldWidget = undefined;
			}

			self._beforeUpdateSize(self.id + " - _transition.");
			if(newWidget){
				if(oldWidget){
					rias.when(rias.isFunction(oldWidget._checkCanHide) ? oldWidget._checkCanHide() : true).always(function(result){
						/// 需要提前 set selectedChild，避免 showChild 时触发的 selectChild 不一致。
						if(result == false){
							df.reject(oldWidget);
						}else{
							self._set("selectedChild", newWidget);
							//self.focusChild(newWidget);
							if(animate != false){
								var newContents = newWidget._container,
									oldContents = oldWidget._container;

								///需要在 _showChild(newWidget) 之前获取，避免包含 newWidget 的 _container
								var ch = rias.dom.getStyle(oldContents, "height"),// rias.dom.getMarginBox(newContents).h,///此时，newContents 没有包含 h
									wh = rias.dom.getStyle(oldWidget._wrapper, "height");
								oldWidget._wrapperWidget.set("selected", false);///先去掉 selected 的 css

								self._animation = new rias.fx.Animation({
									node: newContents,
									duration: self.duration,
									curve: [0, ch],
									onBegin: function(){
										self._showChild(newWidget, {
											animate: false
										});
									},
									onAnimate: function(value){
										//console.debug("onAnimate", value);
										value = Math.floor(value);	// avoid fractional values
										newWidget._wrapper.style.height = (wh - ch + value) + "px";
										newContents.style.height = (value) + "px";
										newWidget.domNode.style.height = (value) + "px";
										oldWidget.domNode.style.height = (ch - value) + "px";
										oldContents.style.height = (ch - value) + "px";
										oldWidget._wrapper.style.height = (wh - value) + "px";
									},
									onEnd: function(){
										self._animation = undefined;
										self._hideChild(oldWidget, {
											animate: false///关闭 动画，避免隐藏 _container
										}).always(function(){
											df.resolve(newWidget);
										});
									}
								});
								self._animation.onStop = self._animation.onEnd;
								self._animation.play();
							}else{
								self._showChild(newWidget);
								self._hideChild(oldWidget, {
									animate: false///关闭 动画，避免隐藏 _container
								}).always(function(){
									df.resolve(newWidget);
								});
							}
						}
						return result;
					});
				}else{
					self._set("selectedChild", newWidget);
					self._showChild(newWidget);
					df.resolve(newWidget);
				}
			}else{
				self._set("selectedChild", null);
				df.resolve();
			}

			return df.promise.always(function(result){
				if(result != false){
					self._afterUpdateSize(self.id + " - _transition.");
					self.resize();
					self.savePersist();
					if(result && result.autoFocus && self.isShowing() && self.get("visible")){
						///避免在 addChild 时，引起 restore.
						result.focus();
					}
				}
				return self.selectedChild;
			});
		},

		_setupChild: function(child, insertIndex){
			this.inherited(arguments);

			if(!child._wrapperWidget){
				child._wrapperWidget = new AccordionInnerContainer({
					ownerRiasw: this,
					targetWidget: child,
					ownerAccordion: this,
					buttonCtor: this.buttonCtor,
					id: child.id + "_inner",
					dir: child.dir,
					lang: child.lang,
					textDir: child.textDir || this.textDir
				});
			}
			/// 需要更改 child._wrapper
			/// inherited("_setupChild")之后才有 child._wrapper
			rias.dom.place(child._wrapperWidget.domNode, child._wrapper, "replace");
			child._wrapper = child._wrapperWidget.domNode;
			child._container = child._wrapperWidget.containerNode;
		},
		removeChild: function(child){
			// Destroy wrapper widget first, before StackPanel.getChildren() call.
			// Replace wrapper widget with true child widget (ContentPane etc.).
			// This step only happens if the AccordionContainer has been started; otherwise there's no wrapper.
			child._wrapper = undefined;///避免 StackPanel.removeChild -> destroy(child._wrapper)
			this.inherited(arguments);
			rias.destroy(child._wrapperWidget);
			child._wrapperWidget = undefined;
			child._container = undefined;
		},

		// note: we are treating the container as controller here
		_onKeyDown: function(/*Event*/ e, /*_WidgetBase*/ fromCaption){
			// summary:
			//		Handle keydown events
			// description:
			//		This is called from a handler on AccordionContainer.domNode
			//		(setup in StackPanel), and is also called directly from
			//		the click handler for accordion labels
			if(this.disabled || e.altKey || !(fromCaption || e.ctrlKey)){
				return;
			}
			var c = e.keyCode;
			if((fromCaption && (c === rias.keys.LEFT_ARROW || c === rias.keys.UP_ARROW)) ||
				(e.ctrlKey && c === rias.keys.PAGE_UP)){
				this._adjacent(false)._buttonWidget._onCaptionClick();
				e.stopPropagation();
				e.preventDefault();
			}else if((fromCaption && (c === rias.keys.RIGHT_ARROW || c === rias.keys.DOWN_ARROW)) ||
				(e.ctrlKey && (c === rias.keys.PAGE_DOWN || c === rias.keys.TAB))){
				this._adjacent(true)._buttonWidget._onCaptionClick();
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
		initialSize: {},
		//allowedChild: "",
		property: {
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
