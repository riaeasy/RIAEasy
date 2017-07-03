define([
	"riasw/riaswBase"
], function(rias){

	// module:
	//		riasw/sys/_Container

	return rias.declare("riasw.sys._Container", null, {
		// summary:
		//		Mixin for widgets that contain HTML and/or a set of widget children.

		postMixInProperties: function(){
			this._beforeUpdateSize(this.id + " - postMixInProperties.");
			this._riasrChildren = [];
			this.inherited(arguments);
		},
		postCreate: function(){
			rias.forEach(this.splitBaseClass(), function(c){
				rias.dom.addClass(this.containerNode, c + "Content");
			}, this);

			this.inherited(arguments);
		},
		buildRendering: function(){
			this.inherited(arguments);
			if(!this.containerNode){
				// All widgets with descendants must set containerNode.
				// NB: this code doesn't quite work right because for TabContainer it runs before
				// _TemplatedMixin::buildRendering(), and thus
				// sets this.containerNode to this.domNode, later to be overridden by the assignment in the template.
				this.containerNode = this.domNode;
			}
		},
		destroyDescendants: function(preserveDom){
			var ow;
			rias.forEach(this.getChildren(), function(widget){
				ow = widget.getOwnerRiasw();
				if(!ow || ow === this){
					rias.destroy(widget, preserveDom);
				}else if(ow && ow !== this){
					this.removeChild(widget);
				}
			}, this);
			this.inherited(arguments);
		},

		_onStartup: function(){
			this._afterUpdateSize(this.id + " - _onStartup.");
			//rias.forEach(this.getChildren(), function(child, index){
			//	this._setupChild(child, index);
			//}, this);
			this.inherited(arguments);
		},

		_beforeUpdateSize: function(id){
			if(this.__updatingSize > 0){
				this.__updatingSize++;
			} else {
				(this.__updatingSize = 1);
			}
			if(!id){
				id = this.id + " - _updateSize.";
			}
			if(this.__updateSizes){
				this.__updateSizes.push(id);
			} else {
				(this.__updateSizes = []).push(id);
			}
		},
		_afterUpdateSize: function(id, doResize){
			if(this.__updatingSize > 0){
				this.__updatingSize--;
			} else {
				this.__updatingSize = 0;
			}
			//if(!id){
			//	id = this.id + " - _updateSize.";
			//}
			if(this.__updateSizes){
				this.__updateSizes.pop();
			}else{
				this.__updateSizes = [];
			}
			///不建议自动 resize。
			if(doResize && !this.__updatingSize){
				this.resize();
			}
		},
		_resize: function(box){
			if(box){
				rias.dom.setMarginBox(this.domNode, box);
			}
			rias.forEach(this.getChildren(), function(child){
				if(child.resize){
					child.resize();
				}
			}, this);
			return box;
		},

		getChild: function(child){
			child = rias.by(child, this);/// 有可能是 String
			if(child && rias.indexOf(this.getChildren(), child) >= 0){
				return child;
			}
			return null;
		},
		_setupChild: function(/*_WidgetBase*/child, /*int*/ insertIndex){
			if(child){
				///注意：是对 parent.containerNode 操作.
				///TODO:zensst. TablePanel 的 insertIndex 有错。
				rias.dom.place(child.domNode, this.containerNode, insertIndex);
				if(!child.getOwnerRiasw()){
					this.own(child);
				}
				rias.forEach(this.splitBaseClass(), function(c){
					rias.dom.addClass(child.domNode, c + "Child");
				});
			}
		},
		onAddChild: function(child, insertIndex){
		},
		addChild: function(/*_WidgetBase*/ child, /*int*/ insertIndex){
			///FIXME:zensst.排除 splitter
			if(!rias.isRiasw(child) || rias.is(child, ["riasw.sys._Gutter"])){
				return;
			}
			var p = child._getContainerRiasw();
			if(p !== this){
				if(p){
					p.removeChild(child);
				}
				if(insertIndex < 0){
					this._riasrChildren.splice(insertIndex, 0, child);
				}else if(insertIndex >= 0 && insertIndex < this._riasrChildren.length){
					this._riasrChildren.splice(insertIndex, 0, child);
				}else{
					this._riasrChildren.push(child);
					insertIndex = this._riasrChildren.length - 1;
				}

				this._setupChild(child, insertIndex);

				child._setContainerRiasw(this);///_setContainerRiasw(this) 调用了 _doContainerChanged，无需显式调用 _containerLayout
				child.set("region", child.region);
			}

			if(this._started){
				if(!child._started){
					child.startup();
				}
			}
			this.onAddChild.apply(this, arguments || []);
		},

		onRemoveChild: function(child){
		},
		removeChild: function(/*Widget*/ child){
			/// remove 不处理 owner/element
			//if(typeof child === "number"){/// 有 splitter 存在，不建议用 index
			//	child = this.getChildren()[child];
			//}
			if(child && this._riasrChildren.indexOf(child) >= 0){
				rias.removeItems(this._riasrChildren, child);
				child._setContainerRiasw(undefined);
				if(child._splitterWidget){/// _splitterWidget 初始化与 Container 相关，重新创建更好些。
					rias.destroy(child._splitterWidget);
					child._splitterWidget = undefined;
				}
				if(!child.isDestroyed(false)){///可能 destroyed
					rias.forEach(this.splitBaseClass(), function(c){
						rias.dom.removeClass(child.domNode, c + "Child");
					});

					///由于 _setContainerRiasw(undefined) 中无法获取 containerRiasw，故不会调用 _doContainerChanged，故需要显式调用 _containerLayout
					child._containerLayout(this);///用 child._containerLayout 比用 this.resize 更好些

					this.onRemoveChild.apply(this, arguments || []);
					child = (child.domNode ? child.domNode : undefined);
					if(child && child.parentNode){
						child.parentNode.removeChild(child); // detach but don't destroy
					}
					//console.debug("removeChild - " + child.id + " - " + rias.__dt() + " ms.");
				}
			}
		}

	});
});
