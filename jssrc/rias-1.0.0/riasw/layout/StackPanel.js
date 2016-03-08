
//RIAStudio client runtime widget - StackPanel

define([
	"rias",
	"dijit/_Widget",
	"rias/riasw/layout/_PanelBase"
], function(rias, _Widget, _PanelBase){

	//rias.theme.loadRiasCss([
	//	//"layout/Panel.css"
	//]);

	var riasType = "rias.riasw.layout.StackPanel";
	var Widget = rias.declare(riasType, _PanelBase, {

		doLayout: true,
		persist: false,

		_transitionDeferred: null,

		baseClass: "dijitStackContainer",

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
			self.own(
				rias.on(self.domNode, "keydown", rias.hitch(self, "_onKeyDown")),
				rias.subscribe(self.id + "-startup", function(params){
					if(params.selected){
						self._transition(params.selected, params.selected);
						rias.publish(self.id + "-selectChild", params.selected);
					}
				}),
				rias.subscribe(self.id + "-selectChild", rias.hitch(self, "_onShowChild"))
			);
		},

		destroyDescendants: function(/*Boolean*/ preserveDom){
			this._descendantsBeingDestroyed = true;
			this.selectedChildWidget = undefined;
			rias.forEach(this.getChildren(), function(child){
				this.removeChild(child, preserveDom);
				child.destroyRecursive(preserveDom);
			}, this);
			rias.forEach(this.__reserved_page, function(child){
				child.destroyRecursive(preserveDom);
			}, this);
			delete this.__reserved_page;
			this._descendantsBeingDestroyed = false;
		},
		destroy: function(){
			if(this._animation){
				this._animation.stop();
				delete this._animation;
			}
			if(this._transitionDeferred){
				this._transitionDeferred.cancel();
				delete this._transitionDeferred;
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
					if(child.selected){
						this.selectedChildWidget = child;
					}
					return child.selected;
				}, this);
			}
			var selected = this.selectedChildWidget;
			if(!selected && children[0]){
				selected = this.selectedChildWidget = children[0];
				selected.selected = true;
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

		_layoutChildren: function(/*String?*/ changedChildId, /*Number?*/ changedChildSize){

			var child = this.selectedChildWidget;
			if(child){
				if(child.resize){
					if(this.doLayout){
						child.resize(this._containerContentBox || this._contentBox);
					}else{
						child.resize();
					}
				}
			}
			return true;
		},

		_setupChild: function(/*dijit/_WidgetBase*/ child, added, insertIndex){
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
			///需要设置 wrapperNode，以在 resize 的时候可以设置 wrapperNode
			//child._wrapper = child.wrapperNode = wrapper;	// to set the aria-labelledby in StackController
			child._wrapper = wrapper;	// to set the aria-labelledby in StackController

			rias.publish(this.id + "-addChild", child, insertIndex);
			if(this._started){
				if(child.selected || !this.selectedChildWidget){
					this.selectChild(child);
				}
			}

			// child may have style="display: none" (at least our test cases do), so remove that
			if(childNode.style.display == "none"){
				childNode.style.display = "block";
			}

			// remove the title attribute so it doesn't show up when i hover over a node
			child.domNode.removeAttribute("title");

			this.inherited(arguments);
		},

		addChild: function(/*dijit/_WidgetBase*/ child, /*Integer?*/ insertIndex){
			var p = this,
				cs = p.getChildren();
			this.inherited(arguments);
			var i = rias.indexOf(this.__reserved_page, child);
			if(i >= 0){
				this.__reserved_page.splice(i, 1);
			}
		},
		removeChild: function(/*dijit/_WidgetBase*/ page, reserve){
			var idx = rias.indexOf(this.getChildren(), page);
			if(!this.__reserved_page){
				this.__reserved_page = [];
			}
			if(reserve){
				this.__reserved_page.push(page);
				page._wrapper.removeChild(page.domNode);
			}
			this.inherited(arguments);

			rias.dom.destroy(page._wrapper);
			delete page._wrapper;

			if(this._started){
				rias.publish(this.id + "-removeChild", page);
			}

			if(this._descendantsBeingDestroyed){
				return;
			}
			if(this.selectedChildWidget === page){
				this.selectedChildWidget = undefined;
				if(this._started){
					var children = this.getChildren();
					if(children.length){
						this.selectChild(children[Math.max(idx - 1, 0)]);
					}
				}
			}
		},

		selectChild: function(/*dijit/_WidgetBase|String*/ page, /*Boolean*/ animate){
			// summary:
			//		Show the given widget (which must be one of my children)
			// page:
			//		Reference to child widget or id of child widget

			var self = this,
				d = self.selectedChildWidget;

			//page = rias.registry.byId(page);
			page = rias.by(page);

			if(self.selectedChildWidget != page){
				///先设置 selectedChildWidget，以保证在 _transition.showChild 中 selectedChildWidget 正确
				///同时，注意 _transition 的 new 和 old 是否正确
				self._set("selectedChildWidget", page);
				// Deselect old page and select new one
				d = self._transition(page, d, animate);
				d.then(function(){
					rias.publish(self.id + "-selectChild", page);	// publish
					if(self.persist){
						rias.cookie(self.id + "_selectedChild", self.selectedChildWidget.id);
					}
				});
			}

			// d may be null, or a scalar like true.  Return a promise in all cases
			return rias.when(d || true);		// Promise
		},

		_transition: function(newWidget, oldWidget, animate){
			var self = this,
				df = rias.newDeferred();

			/*if(oldWidget){
				rias.when(self._hideChild(oldWidget), function(){
					rias.when(self._showChild(newWidget), function(){
						df.resolve();
					});
				});
			}else{
				rias.when(self._showChild(newWidget), function(){
					df.resolve();
				});
			}*/

			if(rias.has("ie") < 8){
				// workaround animation bugs by not animating; not worth supporting animation for IE6 & 7
				animate = false;
			}
			if(self._animation){
				// there's an in-progress animation.  speedily end it so we can do the newly requested one
				self._animation.stop(true);
				delete self._animation;
			}
			if(self._transitionDeferred){
				self._transitionDeferred.cancel();
			}
			self._transitionDeferred = df;
			if(oldWidget && rias.isFunction(oldWidget._stopPlay)){
				//oldWidget._stopPlay();
			}
			animate = false;
			if(newWidget){
				if(oldWidget){
					if(animate){
						var newContents = newWidget.domNode,
							oldContents = oldWidget.domNode;

						self._animation = new rias.fx.slideTo({
							node: newContents,
							duration: self.duration / 2,
							beforeBegin: function(value){
								self._showChild(newWidget);
							},
							onEnd: function(){
								rias.when(self._hideChild(oldWidget), function(){
									df.resolve();
								});
							}
						});
						self._animation.onStop = self._animation.onEnd;
						self._animation.play();
					}else{
						rias.when(self._hideChild(oldWidget), function(){
							rias.when(self._showChild(newWidget), function(){
								df.resolve();
							});
						});
					}
				}else{
					rias.when(self._showChild(newWidget), function(){
						df.resolve();
					});
				}
			}else{
				df.resolve();
			}

			df.then(function(){
			});
			return df;
		},

		_adjacent: function(/*Boolean*/ forward){
			// summary:
			//		Gets the next/previous child widget in this container from the current selection.

			// TODO: remove for 2.0 if this isn't being used.   Otherwise, fix to skip disabled tabs.

			var children = this.getChildren();
			var index = rias.indexOf(children, this.selectedChildWidget);
			index += forward ? 1 : children.length - 1;
			return children[ index % children.length ]; // dijit/_WidgetBase
		},

		forward: function(){
			// summary:
			//		Advance to next page.
			return this.selectChild(this._adjacent(true), true);
		},

		back: function(){
			// summary:
			//		Go back to previous page.
			return this.selectChild(this._adjacent(false), true);
		},

		_onKeyDown: function(e){
			rias.publish(this.id + "-containerKeyDown", { e: e, page: this});	// publish
		},

		onShowChild: function(page){
		},
		_onShowChild: function(page){
			this.onShowChild(page);
		},
		_showChild: function(/*dijit/_WidgetBase*/ page, /*Boolean*/ animate){
			// summary:
			//		Show the specified child by changing it's CSS, and call _onShow()/onShow() so
			//		it can do any updates it needs regarding loading href's etc.
			// returns:
			//		Promise that fires when page has finished showing, or true if there's no href
			var children = this.getChildren();
			page.isFirstChild = (page == children[0]);
			page.isLastChild = (page == children[children.length - 1]);
			page._set("selected", true);

			if(page._wrapper){	// false if not started yet
				rias.dom.replaceClass(page._wrapper, "dijitVisible", "dijitHidden");
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
			this._onShowChild(page);

			//this._needResize = true;
			this.needLayout = true;//this._isShown();
			this.layout();
			if(animate != false){
				return this._doPlayContent().then(function(){
					(page._show && page._show()) || (page._onShow && page._onShow());
				});
			}else{
				return (page._show && page._show()) || (page._onShow && page._onShow()) || true;
			}
		},

		onHideChild: function(page){
		},
		_onHideChild: function(page){
			this.onHideChild(page);
		},
		_hideChild: function(/*dijit/_WidgetBase*/ page, /*Boolean*/ animate){
			// summary:
			//		Hide the specified child by changing it's CSS, and call _onHide() so
			//		it's notified.
			page._set("selected", false);

			if(page._wrapper){	// false if not started yet
				rias.dom.replaceClass(page._wrapper, "dijitHidden", "dijitVisible");
			}
			this._onHideChild(page);
			if(animate != false){
				return this._doPlayContent(false).then(function(){
					page._hide && page._hide() || page.onHide && page.onHide();
				});
			}else{
				return page._hide && page._hide() || page.onHide && page.onHide() || true;
			}
		},

		closeChild: function(/*dijit/_WidgetBase*/ page, reserve){
			// summary:
			//		Callback when user clicks the [X] to remove a page.
			//		If onClose() returns true then remove and destroy the child.
			// tags:
			//		private
			var remove = page.onClose && page.onClose(this, page);
			if(remove){
				this.removeChild(page, reserve);
				// makes sure we can clean up executeScripts in ContentPane onUnLoad
				page.destroyRecursive();
			}
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

		// showTitle: Boolean
		//		When true, display title of this widget as tab label etc., rather than just using
		//		icon specified in iconClass
		showTitle: true
	};

	// Since any widget can be specified as a StackPanel child, mix them
	// into the base widget class.  (This is a hack, but it's effective.)
	// This is for the benefit of the parser.   Remove for 2.0.  Also, hide from doc viewer.
	rias.extend(_Widget, /*===== {} || =====*/ Widget.ChildWidgetProperties);

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswStackContainerIcon",
		iconClass16: "riaswStackContainerIcon16",
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
