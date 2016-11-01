
//RIAStudio client runtime widget - RoundRectStoreList

define([
	"rias",
	"dojox/mobile/_StoreMixin"
], function(rias, Widget){

	//var Widget = rias.getObject("dojox.mobile._StoreMixin");
	Widget.extend({

		autoRefresh: true,

		postMixInProperties: function(){
			this._resizeParent = rias.isFunction(this._parentResize);
			this.inherited(arguments);
		},

		setStore: function(/*dojo/store/api/Store*/store, /*Object*/query, /*Object*/queryOptions){
			// summary:
			//		Sets the store to use with this widget.
			if(store === this.store){
				return null;
			}
			if(store){
				store.getValue = function(item, property){
					return item[property];
				};
			}
			this.store = store;
			this._setQuery(query, queryOptions);
			return (this.autoRefresh === false ? null : this.refresh());
		},

		setQuery: function(/*Object*/query, /*Object*/queryOptions){
			this._setQuery(query, queryOptions);
			return (this.autoRefresh === false ? null : this.refresh());
		},

		_doParentResize: function(){
			//if(this._resizeParent && (this.domNode.style.height == "" || this.domNode.style.width == "")){
			//	///只要有一方向是 自适应，即要 _parentResize
			//	this._parentResize();/// layoutChildren 之后，TablePanel 的尺寸一般会改变，需要 _parentResize
			//}
			if(this._resizeParent && this.region){
				this._parentResize();
			}else{
				this.resize();
			}
		},
		_onComplete: function(items){
			if(rias.isFunction(this.onComplete)){
				this.onComplete(items);
				this._doParentResize();
			}
		},
		_onUpdate: function(item, insertedInto){
			if(rias.isFunction(this.onUpdate)){
				this.onUpdate(item, insertedInto);
				this._doParentResize();
			}
		},
		_onDelete: function(item, removedFrom){
			if(rias.isFunction(this.onDelete)){
				this.onDelete(item, removedFrom);
				this._doParentResize();
			}
		},
		_onAdd: function(item, insertedInto){
			if(rias.isFunction(this.onAdd)){
				this.onAdd(item, insertedInto);
				this._doParentResize();
			}
		},
		refresh: function(){
			// summary:
			//		Fetches the data and generates the list items.
			if(!this.store){
				return null;
			}
			var _this = this;
			var promise = this.store.query(this.query, this.queryOptions);
			rias.when(promise, function(results){
				if(results.items){
					results = results.items; // looks like dojo/data style items array
				}
				if(promise.observe){
					if(_this._observe_h){
						_this._observe_h.remove();
					}
					_this._observe_h = promise.observe(function(object, previousIndex, newIndex){
						if(previousIndex != -1){
							if(newIndex != previousIndex){
								// item removed or moved
								_this._onDelete(object, previousIndex);
								if(newIndex != -1){
									if (_this._onAdd) {
										// new widget with _onAdd method defined
										_this._onAdd(object, newIndex);
									} else {
										// TODO remove in 2.0
										// compatibility with 1.8: _onAdd did not exist, add was handled by _onUpdate
										_this._onUpdate(object, newIndex);
									}
								}
							}else{
								// item modified
								// if _onAdd is not defined, we are "bug compatible" with 1.8 and we do nothing.
								// TODO remove test in 2.0
								if(_this._onAdd){
									_this._onUpdate(object, newIndex);
								}
							}
						}else if(newIndex != -1){
							// item added
							if(_this._onAdd){
								// new widget with _onAdd method defined
								_this._onAdd(object, newIndex);
							}else{
								// TODO remove in 2.0
								// compatibility with 1.8: _onAdd did not exist, add was handled by _onUpdate
								_this._onUpdate(object, newIndex);
							}
						}
					}, true); // we want to be notified of updates
				}
				_this._onComplete(results);
			}, function(error){
				_this.onError(error);
			});
			return promise;
		}

	});

	return Widget;

});
