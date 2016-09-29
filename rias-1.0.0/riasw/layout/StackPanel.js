
//RIAStudio client runtime widget - StackPanel

define([
	"rias",
	"dijit/_WidgetBase",
	"rias/riasw/layout/_PanelBase"
], function(rias, _WidgetBase, _PanelBase){

	//rias.theme.loadThemeCss([
	//	"riasw/layout/Panel.css"
	//]);

	var riaswType = "rias.riasw.layout.StackPanel";
	var Widget = rias.declare(riaswType, _PanelBase, {

		doLayout: true,
		persist: false,

		_transitionDeferred: null,

		baseClass: "riaswStackPanel",

		/*=====
		// selectedChildWidget: [readonly] dijit._Widget
		//		References the currently selected child widget, if any.
		//		Adjust selected child with selectChild() method.
		selectedChildWidget: null,
		=====*/

		//postMixInProperties: function(){
		//	this.inherited(arguments);
		//},
		buildRendering: function(){
			this.inherited(arguments);
			//rias.dom.addClass(this.domNode, "dijitLayoutContainer");
		},

		postCreate: function(){
			var self = this;
			self.inherited(arguments);
			self._selectedHandles = {};
			self.own(
				rias.on(self.domNode, "keydown", rias.hitch(self, "_onKeyDown")),
				///rias.subscribe(self.id + "-selectChild", rias.hitch(self, "_onShowChild")),///没必要
				rias.subscribe(self.id + "-startup", function(params){
					if(params.selected){
						self._transition(params.selected);
					}
				})
			);
		},

		destroyDescendants: function(/*Boolean*/ preserveDom){
			//this._descendantsBeingDestroyed = true;
			this.selectedChildWidget = undefined;
			rias.forEach(this.getChildren(), function(child){
				this.removeChild(child, true, preserveDom);
				child.destroyRecursive(preserveDom);
			}, this);
		},
		destroy: function(){
			var hn;
			for(hn in this._selectedHandles){
				if(this._selectedHandles[hn]){
					this._selectedHandles[hn].remove();
					delete this._selectedHandles[hn];
				}
			}
			if(this._animation){
				rias.forEach(this._animation, function(item){
					item.stop();
				});
				this._animation = undefined;
			}
			if(this._transitionDeferred){
				this._transitionDeferred.cancel();
				this._transitionDeferred = undefined;
			}
			this.inherited(arguments);
		},

		startup: function(){
			if(this._started){
				return;
			}

			var children = this.getChildren();

			// Setup each page panel to be initially hidden
			rias.forEach(children, function(child){
				this._setupChild(child);
			}, this);

			// Figure out which child to initially display, defaulting to first one
			if(this.persist){
				//this.selectedChildWidget = rias.registry.byId(cookie(this.id + "_selectedChild"));
				this.selectedChildWidget = rias.by(rias.cookie(this.id + "_selectedChild"));
			}else{
				rias.some(children, function(child){
					if(child.get("selected")){
						this.selectedChildWidget = child;
					}
					return child.get("selected");
				}, this);
			}
			var selected = this.selectedChildWidget;
			if(!selected && children[0]){
				selected = this.selectedChildWidget = children[0];
				selected.set("selected", true);
			}
			// Startup each child widget, and do initial layout like setting this._contentBox,
			// then calls this.resize() which does the initial sizing on the selected child.
			this.inherited(arguments);

			///需要先 inherited 设置 __updateSize，然后再 resize
			// Publish information about myself so any StackControllers can initialize.
			// This needs to happen before this.inherited(arguments) so that for
			// TabPanel, this._contentBox doesn't include the space for the tab labels.
			rias.publish(this.id + "-startup", {children: children, selected: selected, textDir: this.textDir});

		},

		//resize: function(changeSize, resultSize){
		//	this.inherited(arguments);
		//},

		_layoutChildren: function(/*String?*/ changedChildId, /*Object?*/ changedChildSize){
			var child = rias.by(changedChildId) || this.selectedChildWidget;
			if(child && !child.isDestroyed(true)){
				rias.dom.noOverflowCall(this.containerNode, function(){
					if(child.resize){
						if(changedChildSize || this.doLayout){
							//this._containerContentBox = this._contentBox;
							/// 尺寸取 this.containerNode 的 contentBox，即 this._contentBox，但是位置是 child._wrapper，
							/// 此时 _wrapper 尚未有 size，不能用 getContentMargin
							this._containerContentBox = rias.dom.marginBox2contentBox(child._wrapper, this._contentBox);
							//this._containerContentBox.l = 0;
							//this._containerContentBox.t = 0;
							changedChildSize = rias.mixin({}, this._containerContentBox, changedChildSize);
							child.resize(changedChildSize);
						}else{
							child.resize();
						}
					}
				}, this);
			}
			return true;
		},
		_beforeLayout: function(){
			if(this.isDestroyed(true)){
				return false;
			}
			var box;
			rias.dom.noOverflowCall(this.domNode, function(){
				box = rias.dom.getContentMargin(this.domNode);
				//rias.dom.floorBox(box);
			}, this);
			return this._doBeforeLayout(box);
		},

		restore: function(forceVisible, child){
			var self = this,
				d = self.inherited(arguments);
			return d.then(function(result){
				return self.selectChild(child, true);
			});
		},

		selectChild: function(/*dijit/_WidgetBase|String*/ page, /*Boolean*/ animate){
			// summary:
			//		Show the given widget (which must be one of my children)
			// page:
			//		Reference to child widget or id of child widget

			var self = this,
				p;

			//page = rias.registry.byId(page);
			page = rias.by(page);

			if(!page || page.isDestroyed(true) || page.get("disabled")){
				page = rias.filter(this.getChildren(), function(child){
					return !child.isDestroyed(true) && !child.get("disabled");
				})[0];
			}
			if(self.selectedChildWidget == page){
				p = rias.newDeferred();
				p.resolve(page);
				p = p.promise;
			}else{
				///注意 _transition 的 new 和 old 是否正确
				p = self._transition(page, self.selectedChildWidget, animate);
			}

			// d may be null, or a scalar like true.  Return a promise in all cases
			//return rias.when(d || true);		// Promise
			p.always(function(result){
				//console.debug("selectChild - " + (result && result.id ? result.id : result));
				return result;
			});
			return p;
		},

		_transition: function(newWidget, oldWidget, animate){
			var self = this,
				df = rias.newDeferred(function(){
					//console.debug("_transition.cancel - " + self.id + " - " + (newWidget ? newWidget.id : ""));
					return false;
				});

			self.set("selectedChildWidget", newWidget);
			if(rias.has("ie") < 8){
				// workaround animation bugs by not animating; not worth supporting animation for IE6 & 7
				animate = false;
			}
			if(self._animation){
				rias.forEach(this._animation, function(item){
					item.stop();
				});
				self._animation = undefined;
			}
			if(self._transitionDeferred){
				self._transitionDeferred.cancel();
			}
			self._transitionDeferred = df;
			if(oldWidget && (oldWidget.isDestroyed(true))){
				oldWidget = undefined;
			}
			//if(oldWidget && rias.isFunction(oldWidget._stopPlay)){
			//	oldWidget._stopPlay();
			//}
			//animate = false;
			if(newWidget){
				if(oldWidget){
					if(animate != false){
						var newContents = newWidget._wrapper,
							oldContents = oldWidget._wrapper,
							box = this._containerContentBox || this._contentBox;

						rias.dom.visible(newContents, true, 0);
						self._showChild(newWidget, {
							animate: false,
							box: {
								t: box.t,
								l: -box.w,
								h: box.h,
								w: box.w
							}
						}).always(function(){
							rias.dom.setStyle(newContents, "left", -box.w + "px");
							rias.dom.visible(newContents, true, 1);
							self._animation = [rias.fx.combine([
								rias.fx.slideTo({
									node: oldContents,
									duration: self.duration * 2,
									top: box.t,
									left: box.w
								}), rias.fx.slideTo({
									node: newContents,
									duration: self.duration * 2,
									top: box.t,
									left: 0
								})
							])];
							self._animation[0].onEnd = function(){
								self._hideChild(oldWidget, {
									animate: false
								}).always(function(){
										oldContents.style.left = "0px";
										df.resolve(newWidget);
									});
							};
							self._animation[0].onStop = function(){
								self._hideChild(oldWidget, {
									animate: false
								}).always(function(){
										oldContents.style.left = "0px";
										df.resolve(newWidget);
									});
							};
								self.defer(function(){
									self._animation[0].play();
								});
						});
					}else{
						self._hideChild(oldWidget, {
							animate: true
						}).always(function(){
							self._showChild(newWidget, {
								animate: true
							}).always(function(){
								df.resolve(newWidget);
							});
						});
					}
				}else{
					self._showChild(newWidget, {
						animate: true
					}).always(function(){
						df.resolve(newWidget);
					});
				}
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

		_adjacent: function(/*Boolean*/ forward){
			// summary:
			//		Gets the next/previous child widget in this container from the current selection.
			var sw = this.selectedChildWidget;
			var children = rias.filter(this.getChildren(), function(child){
				return child == sw || !child.isDestroyed(true) && !child.get("disabled");
			});
			var index = rias.indexOf(children, sw);
			index += forward ? 1 : children.length - 1;
			return children[ index % children.length ]; // dijit/_WidgetBase
		},

		forward: function(animate){
			// summary:
			//		Advance to next page.
			return this.selectChild(this._adjacent(true), animate);
		},

		back: function(animate){
			// summary:
			//		Go back to previous page.
			return this.selectChild(this._adjacent(false), animate);
		},

		_onKeyDown: function(e){
			rias.publish(this.id + "-containerKeyDown", { e: e, page: this});	// publish
		},

		onShowChild: function(page){
		},
		_onShowChild: function(page){
			//console.debug("_onShowChild - " + (page ? page.id : "undefined"));
			this.onShowChild(page);
		},
		_showChild: function(/*dijit/_WidgetBase*/ page, /*Object*/ args){
			// summary:
			//		Show the specified child by changing it's CSS, and call _onShow()/onShow() so
			//		it can do any updates it needs regarding loading href's etc.
			// returns:
			//		Promise that fires when page has finished showing, or true if there's no href
			var children = this.getChildren();
			page.isFirstChild = (page == children[0]);
			page.isLastChild = (page == children[children.length - 1]);
			page.set("selected", true);

			if(page._wrapper){	// false if not started yet
				rias.dom.removeClass(page._wrapper, "dijitHidden");
			}

			//// 有可能初始化时缺少 this._containerContentBox || this._contentBox，改为用 layout
			// Size the new widget, in case this is the first time it's being shown,
			// or I have been resized since the last time it was shown.
			// Note that page must be visible for resizing to work.
			/*if(page.resize){
				if(this.doLayout){
					page.resize(this._containerContentBox || this._contentBox);
				}else{
					// the child should pick it's own size but we still need to call resize()
					// (with no arguments) to let the widget lay itself out
					page.resize();
				}
			}*/
			if(args && args.box){
				this.layout(page, args.box);
			}
			this._onShowChild(page);

			var p;
			if(args && args.animate != false){
				p = this._doPlayContent().always(function(){
					if(rias.isFunction(page._show)){
						page._show();
					}else if(rias.isFunction(page._onShow)){
						page._onShow();
					}
					return page;
				});
			}else{
				var a = page.animate;
				page.animate = false;
				//p = rias.newDeferred();
				if(rias.isFunction(page._show)){
					page._show();
				}else if(rias.isFunction(page._onShow)){
					page._onShow();
				}
				//p.resolve(page);
				//p = p.promise;
				page.animate = a;
			}
			return rias.when(p || page);
		},

		onHideChild: function(page){
		},
		_onHideChild: function(page){
			//console.debug("_onHideChild - " + (page ? page.id : "undefined"));
			this.onHideChild(page);
		},
		_hideChild: function(/*dijit/_WidgetBase*/ page, /*Object*/ args){
			// summary:
			//		Hide the specified child by changing it's CSS, and call _onHide() so
			//		it's notified.
			page.set("selected", false);

			if(page._wrapper){	// false if not started yet
				rias.dom.addClass(page._wrapper, "dijitHidden");
			}
			this._onHideChild(page);
			var p;
			if(args && args.animate != false){
				p = this._doPlayContent(false).always(function(){
					if(rias.isFunction(page._hide)){
						page._hide();
					}else if(rias.isFunction(page.onHide)){
						page.onHide();
					}
					return page;
				});
			}else{
				var a = page.animate;
				page.animate = false;
				//p = rias.newDeferred();
				if(rias.isFunction(page._hide)){
					page._hide();
				}else if(rias.isFunction(page.onHide)){
					page.onHide();
				}
				//p.resolve(page);
				//p = p.promise;
				page.animate = a;
			}
			return rias.when(p || page);
		},

		_show: function(){
			var self = this;
			return rias.when(self.inherited(arguments)).always(function(result){
				return self.selectChild();
			});
		},

		_setupChild: function(/*dijit/_WidgetBase*/ child, added, insertIndex, noresize){
			if(!added){
				this.inherited(arguments);
				return;
			}
			// For aria support, wrap child widget in a <div role="tabpanel">
			var childNode = child.domNode,
				wrapper = rias.dom.place(
					//"<div role='tabpanel' class='dijitLayoutContainer " + this.baseClass + "ChildWrapper dijitHidden'>",
					"<div role='tabpanel' class='" + this.baseClass + "ChildWrapper dijitHidden'>",
					child.domNode,
					"replace"),
				label = child["aria-label"] || child.title || child.label;
			if(label){
				// setAttribute() escapes special chars, and if() statement avoids setting aria-label="undefined"
				wrapper.setAttribute("aria-label", label);
			}
			rias.dom.place(childNode, wrapper);
			child._wrapper = wrapper;	// to set the aria-labelledby in StackController

			rias.publish(this.id + "-addChild", child, insertIndex);

			// child may have style="display: none" (at least our test cases do), so remove that
			if(added && childNode.style.display == "none"){
				childNode.style.display = "block";
			}

			// remove the title attribute so it doesn't show up when i hover over a node
			child.domNode.removeAttribute("title");

			this.inherited(arguments);
		},

		addChild: function(/*dijit/_WidgetBase*/ child, /*Integer?*/ insertIndex, noresize){
			var //cs = this.getChildren(),
				self = this;
			child._focusStack0 = child._focusStack;
			child._focusStack = true;
			noresize = true;///在 selectChild 中 resize
			this.inherited(arguments);
			if(this._started){
				if(child.get("selected") || !this.selectedChildWidget){
					this.selectChild(child, this.isShown() && this.get("visible"));
				}
			}
			if(this._selectedHandles){
				if(this._selectedHandles[child.id]){
					this._selectedHandles[child.id].remove();
				}
				this._selectedHandles[child.id] = rias.subscribe(child.id + "_onSelected", function(params){
					if(params && params.selected){
						self.selectChild(params.widget, true);
					}
				});
			}
		},
		removeChild: function(/*dijit/_WidgetBase*/ child, noresize){
			rias.dom.removeClass(child.domNode, "dijitHidden");
			var idx = rias.indexOf(this.getChildren(), child);
			if(this._selectedHandles){
				if(this._selectedHandles[child.id]){
					this._selectedHandles[child.id].remove();
					delete this._selectedHandles[child.id];
				}
			}
			child._focusStack = child._focusStack0;
			if(!this.selectedChildWidget || this.selectedChildWidget === child){
				if(this._started){
					this.back(!this.isDestroyed(true));/// back 是 promise，且会刷新 this.selectedChildWidget
				}else{
					this.selectedChildWidget = undefined;
				}
			}
			this.inherited(arguments);

			rias.dom.destroy(child._wrapper);
			child._wrapper = undefined;

			if(this._started){
				rias.publish(this.id + "-removeChild", child);
			}

			//if(this._descendantsBeingDestroyed){
			//	return;
			//}
		},
		closeChild: function(/*dijit/_WidgetBase*/ page){
			// summary:
			//		Callback when user clicks the [X] to remove a page.
			//		If onClose() returns true then remove and destroy the child.
			// tags:
			//		private
			var self = this;
			if(rias.isFunction(page.close)){
				return rias.when(page.close() || true).always(function(){
					self.removeChild(page, false);
					// makes sure we can clean up executeScripts in ContentPane onUnLoad
					rias.destroy(page);
				});
			}
			var go;
			if(rias.isFunction(page._onClose)){
				go = page._onClose();
			}else if(rias.isFunction(page.onClose)){
				go = page.onClose();
			}
			return rias.when(go || page).always(function(){
				self.removeChild(page, false);
				// makes sure we can clean up executeScripts in ContentPane onUnLoad
				rias.destroy(page);
			});
		}

	});

	Widget.ChildWidgetProperties = {
		// summary:
		//		These properties can be specified for the children of a StackPanel.

		// selected: Boolean
		//		Specifies that this widget should be the initially displayed pane.
		//		Note: to change the selected child use `dijit/layout/StackPanel.selectChild`
		selected: false,

		// disabled: Boolean
		//		Specifies that the button to select this pane should be disabled.
		//		Doesn't affect programmatic selection of the pane, nor does it deselect the pane if it is currently selected.
		disabled: false,

		// closable: Boolean
		//		True if user can close (destroy) this child, such as (for example) clicking the X on the tab.
		closable: false,

		// iconClass: String
		//		CSS Class specifying icon to use in label associated with this pane.
		iconClass: "dijitNoIcon",

		// showCaption: Boolean
		//		When true, display title of this widget as tab label etc., rather than just using
		//		icon specified in iconClass
		showCaption: true
	};

	// Since any widget can be specified as a StackPanel child, mix them
	// into the base widget class.  (This is a hack, but it's effective.)
	// This is for the benefit of the parser.   Remove for 2.0.  Also, hide from doc viewer.
	rias.extend(_WidgetBase, /*===== {} || =====*/ Widget.ChildWidgetProperties);

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswStackPanelIcon",
		iconClass16: "riaswStackPanelIcon16",
		defaultParams: {
			//content: "<span></span>",
			//doLayout: true,
			//duration: rias.defaultDuration
		},
		initialSize: {},
		//allowedChild: "",
		"property": {
			"doLayout": {
				"datatype": "boolean",
				"defaultValue": true,
				"hidden": true
			},
			"persist": {
				"datatype": "boolean",
				"description": "Remembers the selected child across sessions"
			},
			"selectedChildWidget": {
				"datatype": "object",
				"description": "References the currently selected child widget, if any",
				"hidden": true
			},
			"isContainer": {
				"datatype": "boolean",
				"description": "Just a flag indicating that this widget descends from dijit._Container",
				"hidden": true,
				"defaultValue": true
			}
		},
		"childProperties": {
			"selected": {
				"datatype": "boolean",
				"title": "Selected"
			},
			"closable": {
				"datatype": "boolean",
				"title": "Closable"
			}
		}
	};

	return Widget;
});
