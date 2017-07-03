
//RIAStudio client runtime widget - StackPanel

define([
	"riasw/riaswBase",
	"riasw/layout/Panel"
], function(rias, Panel){

	//rias.theme.loadThemeCss([
	//	"riasw/layout/Panel.css"
	//]);

	var riaswType = "riasw.layout.StackPanel";
	var Widget = rias.declare(riaswType, Panel, {

		//doLayout: true,
		animate: true,

		_transitionDeferred: null,
		_fx: "fadeIn",
		//_fx: "slideTo",

		baseClass: "riaswStackPanel",

		/*=====
		// selectedChild: [readonly] _WidgetBase
		//		References the currently selected child widget, if any.
		//		Adjust selected child with selectChild() method.
		 selectedChild: null,
		=====*/

		postCreate: function(){
			var self = this;
			self.inherited(arguments);
			self._selectedHandles = {};
			self.own(
				rias.on(self.domNode, "keydown", function(evt){
					rias.publish(self.id + "-containerKeyDown", {
						e: evt,
						targetWidget: self
					});	// publish
				})
			);
		},
		_stopAnimation: function(){
			if(this._animation){
				if(rias.isArray(this._animation)){
					rias.forEach(this._animation, function(item){
						item.stop(true);
					});
				}else{
					this._animation.stop(true);
				}
				this._animation = undefined;
			}
		},
		_onDestroy: function(){
			var hn;
			for(hn in this._selectedHandles){
				if(this._selectedHandles[hn]){
					this._selectedHandles[hn].remove();
					delete this._selectedHandles[hn];
				}
			}
			this._stopAnimation();
			if(this._transitionDeferred){
				this._transitionDeferred.cancel();
				this._transitionDeferred = undefined;
			}
			this.selectedChild = undefined;
			this.inherited(arguments);
		},

		_loadPersist: function(args){
			this.inherited(arguments);
			this.selectedChild = this.getPersist("selectedChildId");
		},
		_savePersist: function(args){
			if(!this.isClosed()){
				this.setPersist({
					selectedChildId: this.selectedChild ? this.selectedChild.id : undefined
				});
			}
			this.inherited(arguments);
		},
		_onStartup: function(){
			var children = this.getChildren();
			// Figure out which child to initially display, defaulting to first one
			if(rias.isString(this.selectedChild)){
				this.selectedChild = rias.by(this.selectedChild, this);
			}
			if(!this.selectedChild){
				rias.some(children, function(child){
					if(child.get("selected")){
						this.selectedChild = child;
					}
					return child.get("selected");
				}, this);
			}
			///仍然没有 selectedChild，则 selectedChild = children[0]
			if(!this.selectedChild && children[0]){
				this.selectedChild = children[0];
				this.selectedChild.set("selected", true);
			}

			///需要先 inherited 设置 __updatingSize，然后再 resize
			// Startup each child widget, and do initial layout like setting this._contentBox,
			// then calls this.resize() which does the initial sizing on the selected child.
			this.inherited(arguments);

			if(this.selectedChild){
				this._transition(this.selectedChild);
			}
		},

		_layoutChildren: function(/*String?*/ changedChildId, /*Object?*/ changedChildSize){
			var child = rias.by(changedChildId, this) || this.selectedChild;/// 有可能是 String
			if(child && !child.isDestroyed(true) && this._contentBox){
				rias.dom.setMarginBox(child._wrapper, this._contentBox);
				/// child 在 wrapper 中，故应该再次取 wrapper 的 contentBox
				this._containerContentBox = rias.dom.getContentBox(child._wrapper);
				changedChildSize = rias.mixin({}, this._containerContentBox, changedChildSize);
				if(child.resize){
					child.resize(changedChildSize);
				//}else{
				//	rias.dom.setMarginBox(child.domNode, changedChildSize);
				}
			}
			return true;
		},
		_beforeLayout: function(){
			this._contentBox = rias.dom.getContentBox(this.containerNode);
			return this.beforeLayout(this._contentBox, true);
		},

		_setSelectedChildAttr: function(child, animate){
			return this.selectChild(child, animate);
		},

		onShowChild: function(child){
			return true;
		},
		_onShowChild: function(child){
			//console.debug("_onShowChild - " + (child ? child.id : "undefined"));
			return rias.when(this.onHideChild(child));
		},
		afterShowChild: function(child){
		},
		_afterShowChild: function(child){
			this.afterShowChild(child);
		},
		_showChild: function(/*_WidgetBase*/ child, /*Object*/ args){
			// summary:
			//		Show the specified child by changing it's CSS, and call _onShow()/onShow() so
			//		it can do any updates it needs regarding loading href's etc.
			// returns:
			//		Promise that fires when child has finished showing, or true if there's no href
			var self = this,
				p;
			if(!child || child.isDestroyed()){
				return rias.when(false);
			}
			return rias.when(self._onShowChild(child)).always(function(result){
				if(result != false){
					//self._set("selectedChild", child);
					rias.publish(self.id + "-selectChild", child, self.focused);
					if(child._wrapper){	// false if not started yet
						rias.dom.removeClass(child._wrapper, "riaswHidden");
					}
					child.set("visible", true);
					self.set("focusedChild", child);
					child.set("selected", true);

					if(!(rias.has("ie") < 9) && args && args.animate != false){
						///hide 建议在 _doPlayNode.end 后处理
						p = self._doPlayNode(true, child.domNode, self.duration / 2);
					}
					//// 有可能初始化时缺少 self._containerContentBox || self._contentBox，改为用 layout
					//if(child.resize){
					//	child.resize(args && args.box || self._containerContentBox || self._contentBox);
					//}
					self._layoutChildren(child, args && args.box);/// _layoutChildren 自行计算 self._containerContentBox || self._contentBox
					return rias.when(p || true).always(function(){
						var a = child.animate;
						child.animate = false;
						if(rias.isFunction(child.show)){
							p = child.show();
						}else if(rias.isFunction(child._onShow)){///用 _onShow 而不是 onShow
							p = child._onShow();
						}
						child.animate = a;
						return rias.when(p || true).always(function(result){
							a = rias.isFunction(child.isShowing) ? child.isShowing() : rias.dom.isVisible(child, false);///不要判断 parent
							if(a){
								self._afterShowChild(child);
								return true;
							}
							return false;
						});
					});
				}
				return result;
			});
		},

		onHideChild: function(child){
			return true;
		},
		_onHideChild: function(child){
			//console.debug("_onHideChild - " + (child ? child.id : "undefined"));
			var self = this;
			return rias.when(rias.isFunction(child._checkCanHide) ? child._checkCanHide() : true).always(function(result){
				if(result != false){
					return rias.when(self.onHideChild(child));
				}
				return result;
			});
		},
		afterHideChild: function(child){
		},
		_afterHideChild: function(child){
			child.set("visible", false);
			if(child._wrapper){	// false if not started yet
				rias.dom.addClass(child._wrapper, "riaswHidden");
			}
			this.afterHideChild(child);
		},
		_hideChild: function(/*_WidgetBase*/ child, /*Object*/ args){
			// summary:
			//		Hide the specified child by changing it's CSS, and call onHide() so
			//		it's notified.
			var self = this,
				p;
			if(!child || child.isDestroyed()){
				return rias.when(true);
			}
			return rias.when(self._onHideChild(child)).always(function(result){
				if(result != false){
					child.set("selected", false);
					if(self.get("focusedChild") === child){
						self.set("focusedChild", null);
					}

					if(!(rias.has("ie") < 9) && args && args.animate != false){
						///hide 建议在 _doPlayNode.end 后处理
						p = self._doPlayNode(false, child.domNode, self.duration / 2);
					}
					return rias.when(p || true).always(function(){
						var a = child.animate;
						child.animate = false;
						if(rias.isFunction(child.hide)){
							p = child.hide();
						}else if(rias.isFunction(child._onHide)){
							p = child._onHide();
						}
						child.animate = a;
						return rias.when(p || true).always(function(result){
							a = rias.isFunction(child.isShowing) ? child.isShowing() : rias.dom.isVisible(child, false);///不要判断 parent
							if(!a){
								self._afterHideChild(child);
								return true;
							}
							return false;
						});
					});
				}
				return result;
			});
		},

		onCloseChild: function(child){
			return true;
		},
		_onCloseChild: function(child){
			//console.debug("_onCloseChild - " + (child ? child.id : "undefined"));
			var self = this;
			return rias.when(self._onHideChild(child)).always(function(result){
				if(result != false){
					return rias.when(self.onCloseChild(child));
				}
				return result;
			});
		},
		afterCloseChild: function(child){
		},
		_afterCloseChild: function(child){
			this.afterCloseChild(child);
		},
		closeChild: function(/*_WidgetBase*/ child){
			// summary:
			//		Callback when user clicks the [X] to remove a child.
			//		If onClose() returns true then remove and destroy the child.
			// tags:
			//		private
			var self = this,
				p;
			if(!child || child.isDestroyed()){
				return rias.when(true);
			}
			return rias.when(self._onCloseChild(child)).always(function(result){
				if(result != false){
					self._hideChild(child).always(function(result){
						if(result != false){
							if(rias.isFunction(child.close)){
								p = child.close();
							}else if(rias.isFunction(child._onClose)){
								p = child._onClose();
							}else if(rias.isFunction(child.onClose)){
								p = child.onClose();
							}
							return rias.when(p || true).always(function(result){
								var a = rias.isFunction(child.isClosed) ? child.isClosed() : rias.dom.isVisible(child, false);///不要判断 parent
								if(!a){
									self.removeChild(child);
									self._afterCloseChild(child);
									// makes sure we can clean up executeScripts in ContentPane onUnLoad
									rias.destroy(child);
									return true;
								}
								return false;
							});
						}
						return result;
					});
				}
				return result;
			});
		},

		_show: function(){
			var self = this;
			return rias.when(self.inherited(arguments)).always(function(result){
				return self.selectChild();
			});
		},
		restore: function(forceVisible, ignoreMax, ignoreCollapsed, child, _deep){
			var self = this;
			return self.inherited(arguments).then(function(result){
				return self.selectChild(child);
			});
		},

		_setupChild: function(child, /*int*/ insertIndex){
			this.inherited(arguments);

			// For aria support, wrap child widget in a <div role="tabpanel">
			if(child._wrapper){
				rias.dom.place(child.domNode, child._wrapper, "replace");
			}
			var childNode = child.domNode,
				wrapper = rias.dom.place(
					"<div role='tabpanel' class='" + this._baseClass0 + "ChildWrapper riaswHidden'>",
					child.domNode,
					"replace"),
				label = child["aria-label"] || child.caption || child.title || child.label;
			if(label){
				// setAttribute() escapes special chars, and if() statement avoids setting aria-label="undefined"
				wrapper.setAttribute("aria-label", label);
			}
			rias.dom.place(childNode, wrapper);
			child._wrapper = wrapper;	// to set the aria-labelledby in StackController
			child.set("visible", false);

			// child may have style="display: none" (at least our test cases do), so remove that
			if(childNode.style.display === "none"){
				childNode.style.display = "block";
			}
			// remove the title attribute so it doesn't show up when i hover over a node
			child.domNode.removeAttribute("title");
		},
		addChild: function(/*_WidgetBase*/ child, /*int?*/ insertIndex){
			this.inherited(arguments);

			rias.publish(this.id + "-addChild", child, insertIndex);
			var self = this;
			if(this._selectedHandles){
				if(this._selectedHandles[child.id]){
					this._selectedHandles[child.id].remove();
				}
				this._selectedHandles[child.id] = rias.subscribe(child.id + "Selected", function(params){
					if(params && params.selected){
						self.selectChild(params.widget);
					}
				});
			}
			if(this._started){
				if(child.get("selected") || !this.selectedChild){
					this.selectChild(child, this.isShowing() && this.get("visible"));
				}
			}
		},
		removeChild: function(/*_WidgetBase*/ child){
			child.set("visible", true);
			rias.dom.removeClass(child.domNode, "riaswHidden");
			//var idx = rias.indexOf(this.getChildren(), child);
			if(this._selectedHandles){
				if(this._selectedHandles[child.id]){
					this._selectedHandles[child.id].remove();
					delete this._selectedHandles[child.id];
				}
			}
			if(!this.selectedChild || this.selectedChild === child){
				if(this._started){
					this.back(!this.isDestroyed(true));/// back 是 promise，且会刷新 this.selectedChild
				}else{
					this.selectedChild = undefined;
					this.focusPrev();
				}
			}

			this.inherited(arguments);

			if(child._wrapper){
				rias.dom.destroy(child._wrapper);
				child._wrapper = undefined;
			}

			if(this._started){
				rias.publish(this.id + "-removeChild", child);
			}
		},
		selectChild: function(/*_WidgetBase|String*/ child, /*Boolean*/ animate){
			// summary:
			//		Show the given widget (which must be one of my children)
			// child:
			//		Reference to child widget or id of child widget

			child = this.getChild(child);
			if(!child){
				child = this.selectedChild;
			}

			if(!child || child.isDestroyed(true) || child.get("disabled")){
				child = rias.filter(this.getChildren(), function(child){
					return !child.isDestroyed(true) && !child.get("disabled");
				})[0];
			}
			if(!child || this.selectedChild === child){
				var p = rias.newDeferred();
				p.resolve(child);
				return p.promise;
			}
			///注意 _transition 的 new 和 old 是否正确
			return this._transition(child, this.selectedChild, animate);
		},
		_transition: function(newWidget, oldWidget, animate){
			var self = this,
				df = rias.newDeferred(function(){
					//console.debug("_transition.cancel - " + self.id + " - " + (newWidget ? newWidget.id : ""));
					return false;
				});

			if(!this.animate || !this.isShowing() || !this.get("visible") || rias.has("ie") < 9){
				// workaround animation bugs by not animating; not worth supporting animation for IE6 & 7
				animate = false;
			}
			this._stopAnimation();
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
			var box = rias.mixin({}, this._containerContentBox);///使用 _containerContentBox 而不是 _contentBox ///使用副本，避免修改
			if(newWidget){
				if(oldWidget){
					//rias.when(rias.isFunction(oldWidget._checkCanHide) ? oldWidget._checkCanHide() : true).always(function(result){
						/// 需要提前 set selectedChild，避免 showChild 时触发的 selectChild 不一致。
						//if(result == false){
						//	df.reject(oldWidget);
						//}else{
							self._set("selectedChild", newWidget);
							if(animate != false){
								var newContents = newWidget._wrapper,
									oldContents = oldWidget._wrapper;
								if(self._fx === "slideTo"){
									rias.dom.visible(newContents, true, 0);
									self._showChild(newWidget, {
										animate: false,
										box: {
											t: box.t,
											l: -box.w,
											h: box.h,
											w: box.w
										}
									}).always(function(result){
										if(result != false){
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
												}).always(function(result){
													if(result != false){
														oldContents.style.left = "0px";
														df.resolve(newWidget);
													}else{
														df.cancel(oldWidget.id + " cancel hide.");
													}
												});
											};
											self._animation[0].onStop = self._animation[0].onEnd;
											self.defer(function(){
												self._animation[0].play();
											});
										}else{
											df.cancel(newWidget.id + " cancel show.");
										}
									});
								}else{
									self.defer(function(){
										self._hideChild(oldWidget, {
											animate: true
										}).always(function(result){
											if(result != false){
												self._showChild(newWidget, {
													//box: box,
													animate: true
												}).always(function(result){
													if(result != false){
														df.resolve(newWidget);
													}else{
														df.cancel(newWidget.id + " cancel show.");
													}
												});
											}else{
												df.cancel(oldWidget.id + " cancel hide.");
											}
										});
									});
								}
							}else{
								self._hideChild(oldWidget, {
									animate: false
								}).always(function(result){
									if(result != false){
										self._showChild(newWidget, {
											//box: box,
											animate: false
										}).always(function(result){
											if(result != false){
												df.resolve(newWidget);
											}else{
												df.cancel(newWidget.id + " cancel show.");
											}
										});
									}else{
										df.cancel(oldWidget.id + " cancel hide.");
									}
								});
							}
						//}
						//return result;
					//});
				}else{
					self._set("selectedChild", newWidget);
					self._showChild(newWidget, {
						//box: box,
						animate: !!animate
					}).always(function(result){
						if(result != false){
							df.resolve(newWidget);
						}else{
							df.cancel(newWidget.id + " cancel show.");
						}
					});
				}
			}else{
				self._set("selectedChild", null);
				df.resolve();
			}
			return df.promise.always(function(result){
				if(result != false){/// df.cancel 返回 false
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

		_adjacent: function(/*Boolean*/ forward){
			// summary:
			//		Gets the next/previous child widget in this container from the current selection.
			var sw = this.selectedChild;
			var children = rias.filter(this.getChildren(), function(child){
				return child === sw || !child.isDestroyed(true) && !child.get("disabled");
			});
			var index = rias.indexOf(children, sw);
			index += forward ? 1 : children.length - 1;
			return children[ index % children.length ]; // _WidgetBase
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
		}
	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//allowedChild: "",
		"property": {
			"doLayout": {
				"datatype": "boolean",
				"defaultValue": true,
				"hidden": true
			},
			"selectedChild": {
				"datatype": "object",
				"description": "References the currently selected child widget, if any",
				"hidden": true
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
