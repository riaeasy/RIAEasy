
//RIAStudio Client/Server Runtime riasBase(rias).

define([
	"rias/base/lang",

	"dojo/Stateful", // Stateful
	"dijit/Destroyable"
], function(rias, Stateful, Destroyable) {

///Destroyable==================================================================///
	rias.isInstanceOf = function(obj, base){
		function _do(ctor){
			if(rias.isString(ctor)){
				ctor = rias.getObject(ctor);
			}
			if(obj instanceof ctor){
				return true;
			}
			if(obj && obj.constructor && obj.constructor._meta){
				var bases = obj.constructor._meta.bases;
				for(var i = 0, l = bases.length; i < l; ++i){
					if(bases[i] === ctor){
						return true;
					}
				}
			}
			return false;
		}
		if(rias.isArray(base)){
			return rias.some(base, function(item){
				return _do(item);
			});
		}else{
			return _do(base);
		}
	};

	rias.destroy = function(/*riasWidget|dijit|DOMNode|String*/ node, preserveDom){
		var w = rias.by(node);
		if(w){
			if(!w._beingDestroyed){
				if(!w._destroyed){
					if(rias.isFunction(w.destroyRecursive)){
						w.destroyRecursive(preserveDom);
					}else if(rias.isFunction(w.destroy)){
						w.destroy(preserveDom)
					}else if(rias.isFunction(w.remove)){
						w.remove(preserveDom)
					}
					w._destroyed = true;
				}
				w._beingDestroyed = true;
			}
		}else if(rias.dom){
			w = rias.dom.byId(node);
			if(rias.isDomNode(w)){
				rias.dom.destroy(w);
			}else if(w && rias.isFunction(w.remove)){
				w.remove();
			}
		}
	};

	rias.removeChild = function(parent, child){
		if(child._riasrParent == parent){
			//console.debug(parent, child);
			delete child._riasrParent;
		}
		if(!rias.isDijit(child) && !rias.isDomNode(child)){
			return;
		}
		////有些控件在 removeChild() 的时候会 destroy(), 比如 StackContainer，所以不能 removeChild()
		///重写 StackContainer.removeChild 和 destroyDescendants
		if(rias.isDijit(parent)){
			if(parent.removeChild && rias.isDijit(child)){
				parent.removeChild(child);
			}else{
				(parent.containerNode || parent.domNode).removeChild(child.domNode ? child.domNode : child);
			}
		}else if(rias.isDomNode(parent)){
			parent.removeChild(child.domNode ? child.domNode : child);
		}else{///其它，仅仅是 Object
			///暂时没有什么可以处理的。
		}
	};

	rias._deleDP = function(p, reserveWC, reserveRW, reserveMM){
		//delete p._rsfVersion;
		delete p._riasdParams;
		delete p._riaswParams;
		if(!reserveWC){
			delete p._riaswChildren;
		}
		if(!reserveRW && p._riasrWidget){
			//console.debug(p);
			delete p._riasrWidget;
		}
		//delete p._riaspParent;
		//delete p._riaspChildren;
		delete p._riasrModule;
		if(!reserveMM && p._riaswModuleMeta){
			console.debug(p);
			delete p._riaswModuleMeta;
		}
		delete p._riasrOwner;
		delete p._riasrChildren;
		delete p._riasrParent;
	};
	//if(rias.hostBrowser){
		rias.setObject("rias.Destroyable", Destroyable);
	//}else{
	//	Destroyable = rias.declare("rias.Destroyable", null, {});
	//}
	var __riasrId = 0;
	Destroyable.extend({

		///是简单对象，不是类工厂。
		//constructor: function(params){
		//	this._riasrOwner = null;
		//	this._riasrChildren = [];
		//},
		postscript: function(/*Object?*/params, /*DomNode|String*/srcNodeRef){
			if(/*rias.isDebug &&*/ !this.__riasrId){
				this.__riasrId = __riasrId++;
			}
			try{
				this.create.apply(this, arguments);
			}catch(e){
				console.error(rias.getStackTrace(e), this);
			}
		},

		_initRiasW: function(params, errCall){
			var s,
				w = this,
				owner = w._riasrOwner || w.ownerRiasw;
			w._riasrCreated = true;///下面需要用到

			if(w.domNode){
				w.domNode._riasrWidget = w;
			}
			if(!w._riaswType){
				/*if(!params._riaswType){
					s = "No _riaswType in params.";
					console.error(s, params, w);
					if(rias.isFunction(errCall)){
						rias.hitch(this, errCall)(new Error(s + params));
					}
					return;
				}
				w._riaswType = params._riaswType || w.declaredClass;*/
				w._riaswType = w.declaredClass;
			}
			//w._riaswVersion 保留原生的 _riaswVersion
			//w._riasrOwner = /*params._riasrOwner ||*/ undefined;
			//w._riasrChildren = /*params._riasrChildren ||*/ [];
			if(!w._riaswParams){
				w._riaswParams = params._riaswParams;
			}
			if(w._riaswParams){
				///保留设计值，删除运行期值
				/*delete w._riaswParams._riaswVersion;
				delete w._riaswParams._riaswType;
				delete w._riaswParams._riaswIdOfModule;
				delete w._riaswParams._riaswModuleMeta;*/
				//delete w._riaswParams._riaswChildren;///如果 rias.riasd.module.outlineEditor 的 getRiasd() 是取运行期的 _riaswChildren ，则保留。
				//delete w._riaswParams._riasrWidget;///如果 rias.riasd.module.outlineEditor 的 getRiasd() 是取运行期的 _riaswChildren ，则保留。
				rias._deleDP(w._riaswParams, true, true, true);
			}

			//w._riasrParent = undefined;
			//w._riaspChildren = [];
			if(!w._riasrChildren){
				w._riasrChildren = [];
			}
			if(!w._riaswChildren){
				w._riaswChildren = [];
			}

			if(!w._riasrModule){
				if(params._riasrModule){
					w._riasrModule = params._riasrModule;
				}else if(rias.isRiasw(owner)){
					if(rias.isRiaswModule(owner)){
						w._riasrModule = owner;
					}else if(rias.isRiaswModule(owner._riasrModule)){
						w._riasrModule = owner._riasrModule;
					}
				}
			}
			//delete w.ownerRiasw;
			if(rias.isDebug && !w._riasrModule && !rias.isRiasWebApp(w)){///new App() 时，webApp 尚未赋值。
				console.debug("The widget('" + (w.id || w.name || w._riaswType) + "')._riasrModule is undefined.", params);
			}
			if(w._riasrModule){
				try{
					if(!w._riasrOwner){
						w._riasrModule.own(w);
					}
				}catch(e){
					console.error(rias.getStackTrace(e), w);
					if(rias.isFunction(errCall)){
						rias.hitch(this, errCall)(e);
					}
				}
			}
			if(!w._riaswIdOfModule){
				w._riaswIdOfModule = params._riaswIdOfModule;
			}
			if(w._riaswIdOfModule){
				if(rias.isString(w._riaswIdOfModule)){
					if(~(w._riaswIdOfModule.indexOf("."))){
						s = "The widget._riaswIdOfModule(" + w._riaswIdOfModule + ") cannot contains \".\". ";
						console.error(s, w);
						if(rias.isFunction(errCall)){
							rias.hitch(this, errCall)(new Error(s + params));
						}
					}
					if(w._riasrModule){
						if(rias.getObject(w._riaswIdOfModule, false, w._riasrModule)){
							s = "Duplication _riaswIdOfModule['" + w._riaswIdOfModule + "'] in module['" + w._riasrModule.id + "']";
							console.error(s, w);
							if(rias.isFunction(errCall)){
								rias.hitch(this, errCall)(new Error(s + params));
							}
						}else{
							rias.setObject(w._riaswIdOfModule, w, w._riasrModule);
						}
					}
				}else{
					s = "The widget._riaswIdOfModule(" + w._riaswIdOfModule + ") error.";
					console.error(s, w);
					if(rias.isFunction(errCall)){
						rias.hitch(this, errCall)(s);
					}
				}
			}
			///必须判断 isDijit，才能处理 _riasWidgets，否则会导致因为非 Dijit 缺少 destroy() 而不能释放的问题。
			///非 dijit 已经扩展了 destroy()
			if(rias.webApp && w != rias.webApp){
				if(!rias.isFunction(w.destroy)){
					console.debug("The widget('" + (w.id || w.name || w._riaswType) + "') has no property of 'destroy: function()'.", params);
				}
				try{
					if(!w._riasrOwner){
						rias.webApp.own(w);
						if(rias.isDebug){
							console.debug("The widget('" + (w.id || w.name || w._riaswType) + "')._riasrOwner set to the rias.webApp.", params);
						}
					}
					//rias.webApp.addWidget(w);
				}catch(e){
					console.error(rias.getStackTrace(e), w);
					if(rias.isFunction(errCall)){
						rias.hitch(this, errCall)(e);
					}
				}
			}
			if(rias.isDebug && !w._riasrOwner && !rias.isRiasWebApp(w)){
				console.debug("The widget('" + (w.id || w.name || w._riaswType) + "')._riasrOwner is undefined.", params);
			}
		},

		create: function(params){
			if(params){
				this.params = params;
				rias.mixin(this, params);
			}
			this.postMixInProperties();

			this.postCreate(params);
		},

		postMixInProperties: function(){
			// summary:
			//		Called after the parameters to the widget have been read-in,
			//		but before the widget template is instantiated. Especially
			//		useful to set properties that are referenced in the widget
			//		template.
			// tags:
			//		protected
			this._initRiasW(this.params || (this.params = {}));
		},

		postCreate: function(){
			this._created = true;
			rias.publish("_riaswPostCreate", {
				widget: this,
				params: this.params
			});
		},
		destroyRiasrChildren: function(preserveDom){
			var self = this;
			rias.forEach(self._riasrChildren, function(handle){
				handle = handle._handle;
				if(handle._riasrOwner && handle._riasrOwner != self){
					//if(widget.parentNode){
					//	widget.parentNode.removeChild(widget.domNode);
					//}
					rias.removeChild(self, handle);
				}else if(handle.destroy){
					handle.destroy(preserveDom);
				}
			});
		},
		destroy: function(/*Boolean*/ preserveDom){
			var self = this;
			self._beingDestroyed = true;
			if(!self._destroying){
				self._destroying = true;
				self.destroyRiasrChildren(preserveDom);
				self.orphan();
				if(self._riasrModule && self._riasrModule[self._riaswIdOfModule]){
					delete self._riasrModule[self._riaswIdOfModule];
				}
			}
			self._destroyed = true;
			self._destroying = false;
			rias.publish("_riaswDestroy", {
				widget: self
			});
		},

		//setOwner: function(owner){
		//	if(rias.isInstanceOf(owner, Destroyable)){
		//		this._set("_riasrOwner", owner);
		//		owner.own(this);
		//	}else{
		//		throw new Error("The owner of " + owner + " is not isInstanceOf rias.Destroyable.");
		//	}
		//},
		_setOwnerRiaswAttr: function(owner){
			if(rias.isString(owner)){
				owner = rias.by(owner);
			}
			if(rias.isInstanceOf(owner, Destroyable)){
				//this._set("ownerRiasw", owner);
				owner.own(this);
				//delete this.ownerRiasw;
			}else{
				throw new Error("The owner of " + owner + " is not isInstanceOf rias.Destroyable.");
			}
		},
		_getOwnerRiaswAttr: function(){
			return this._riasrOwner;
		},
		orphan: function(preserveParent){
			//return rias.orphan(this, preserveParent);
			//rias.orphan = function(handle, preserveParent){
				var i;
				///一般情况下，orphan() 之前有可能已经 destroy domNode，所以不能在这里 removeChilde。移到 destroy() 和 destroyDescendants() 中处理。
				if(!preserveParent && this._riasrParent){
					rias.removeChild(this._riasrParent, this);
				}
				if(this._riasrOwner){
					///_riasrOwner 不是 Parent，不应该 removeChild
					//if(rias.isDijit(this)){
					//	rias.removeChild(this._riasrOwner, this);
					//}
					i = rias.indexOfByAttr(this._riasrOwner._riasrChildren, this, "_handle");
					if(i >= 0){
						this._riasrOwner._riasrChildren[i]._remove.remove();
						this._riasrOwner._riasrChildren.splice(i, 1);
					}
					delete this._riasrOwner;
					/// 暂时不考虑 rias.webApp.removeWidget.
					//rias.publish("_riaswOrphan", {
					//	widget: this
					//});
				}
				return this;
			//};
		},
		own: function(handles){
			var self = this,
				i, _i,
				hds,
				hdhs = [],
				cleanupMethods = [
					"destroyRecursive",
					"destroy",
					"remove"
				];
			if(!self._riasrChildren){
				self._riasrChildren = [];
			}
			/*if(rias.isNumber(position)){
				i = (position < self._riasrChildren.length ? position >= 0 ? position : 0 : self._riasrChildren.length);
				hds = rias.toArray(arguments, 1);
			}else if(rias.isString(position)){
				i = (position === "first" ? 0 : self._riasrChildren.length);
				hds = rias.toArray(arguments, 1);
			}else{*/
				i = self._riasrChildren.length;
				hds = arguments;
			//}

			rias.forEach(hds, function(handle){
				// When this.destroy() is called, destroy handle.  Since I'm using aspect.before(),
				// the handle will be destroyed before a subclass's destroy() method starts running, before it calls
				// this.inherited() or even if it doesn't call this.inherited() at all.  If that's an issue, make an
				// onDestroy() method and connect to that instead.
				if(rias.isArray(handle)){
					var callee = arguments.callee;
					rias.forEach(handle, function(_h){
						callee(_h);
					});
				}
				var destroyMethodName;
				var odh = {
					_handle: handle,
					_remove: rias.before(self, "destroy", function (preserveDom){
						if(handle._riasrParent){
							rias.removeChild(handle._riasrParent, handle);
						}
						if(destroyMethodName === "remove" || destroyMethodName === "close"){
							rias.hitch(handle, self.orphan)();
						}
						handle[destroyMethodName](preserveDom);
					})
				};
				if(rias.isRiasw(handle)){
					rias.hitch(handle, self.orphan)(1);
					handle._riasrOwner = self;
					self._riasrChildren.splice(i, 0, odh);
					//delete self.ownerRiasw;
					i++;
				}

				// Callback for when handle is manually destroyed.
				function onManualDestroy(){
					odh._remove.remove();
					rias.forEach(hdhs, function(hdh){
						hdh._remove.remove();
					});
				}

				// Setup listeners for manual destroy of handle.
				// Also computes destroyMethodName, used in listener above.
				if(handle.then){
					// Special path for Promises.  Detect when Promise is resolved, rejected, or
					// canceled (nb: cancelling a Promise causes it to be rejected).
					destroyMethodName = "cancel";
					handle.then(onManualDestroy, onManualDestroy);
				}else{
					// Path for other handles.  Just use AOP to detect when handle is manually destroyed.
					rias.forEach(cleanupMethods, function(cleanupMethod){
						if(typeof handle[cleanupMethod] === "function"){
							if(!destroyMethodName){
								// Use first matching method name in above listener (prefer destroyRecursive() to destroy())
								destroyMethodName = cleanupMethod;
							}
							hdhs.push({
								_handle: handle,
								_remove: rias.after(handle, cleanupMethod, onManualDestroy, true)
							});
						}
					});
				}
			}, self);

			return hds;		// arguments
		}
	});
	rias.setObject("rias.Stateful", Stateful);
	Stateful.extend({
		///attributeMap, _introspect, _applyAttributes 与 _WidgetBase 相互独立，没有继承关系。
		attributeMap: {},
		postscript: function(/*Object?*/ params){
			//if(params){
			//	this.set(params);
			//}
			this.inherited(arguments);
		},
		create: function(params){
			this._introspect();
			if(params){
				this.params = params;
				rias.mixin(this, params);
			}
			this.postMixInProperties();
			this._applyAttributes();

			this.postCreate(params);
		},
		_get: function(name, names){
			// summary:
			//		Private function that does a get based off a hash of names
			// names:
			//		Hash of names of custom attributes
			return (names && typeof this[names.g] === "function") ? this[names.g]() : this[name];
		},
		_introspect: function(){
			// summary:
			//		Collect metadata about this widget (only once per class, not once per instance):
			//
			//			- list of attributes with custom setters, storing in this.constructor._setterAttrs
			//			- generate this.constructor._onMap, mapping names like "mousedown" to functions like onMouseDown

			var ctor = this.constructor;
			if(!ctor._setterAttrs){
				var proto = ctor.prototype,
					attrs = ctor._setterAttrs = [], // attributes with custom setters
					onMap = (ctor._onMap = {});

				// Items in this.attributeMap are like custom setters.  For back-compat, remove for 2.0.
				for(var name in proto.attributeMap){
					attrs.push(name);
				}

				// Loop over widget properties, collecting properties with custom setters and filling in ctor._onMap.
				for(name in proto){
					if(/^on/.test(name)){
						onMap[name.substring(2).toLowerCase()] = name;
					}

					if(/^_set[A-Z](.*)Attr$/.test(name)){
						name = name.charAt(4).toLowerCase() + name.substr(5, name.length - 9);
						if(!proto.attributeMap || !(name in proto.attributeMap)){
							attrs.push(name);
						}
					}
				}

				// Note: this isn't picking up info on properties like aria-label and role, that don't have custom setters
				// but that set() maps to attributes on this.domNode or this.focusNode
			}
		},
		_applyAttributes: function(){
			// summary:
			//		Step during widget creation to copy  widget attributes to the
			//		DOM according to attributeMap and _setXXXAttr objects, and also to call
			//		custom _setXXXAttr() methods.
			//
			//		Skips over blank/false attribute values, unless they were explicitly specified
			//		as parameters to the widget, since those are the default anyway,
			//		and setting tabIndex="" is different than not setting tabIndex at all.
			//
			//		For backwards-compatibility reasons attributeMap overrides _setXXXAttr when
			//		_setXXXAttr is a hash/string/array, but _setXXXAttr as a functions override attributeMap.
			// tags:
			//		private

			// Call this.set() for each property that was either specified as parameter to constructor,
			// or is in the list found above.	For correlated properties like value and displayedValue, the one
			// specified as a parameter should take precedence.
			// Particularly important for new DateTextBox({displayedValue: ...}) since DateTextBox's default value is
			// NaN and thus is not ignored like a default value of "".

			// Step 1: Save the current values of the widget properties that were specified as parameters to the constructor.
			// Generally this.foo == this.params.foo, except if postMixInProperties() changed the value of this.foo.
			var params = {};
			for(var key in this.params || {}){
				params[key] = this._get(key);
			}

			// Step 2: Call set() for each property with a non-falsy value that wasn't passed as a parameter to the constructor
			rias.forEach(this.constructor._setterAttrs, function(key){
				if(!(key in params)){
					var val = this._get(key);
					if(val){
						this.set(key, val);
					}
				}
			}, this);

			// Step 3: Call set() for each property that was specified as parameter to constructor.
			// Use params hash created above to ignore side effects from step #2 above.
			for(key in params){
				this.set(key, params[key]);
			}
		},
		_initAttr: function(name){
			var self = this,
				N;
			if(rias.isArray(name)){
				rias.forEach(name, function(n){
					self._initAttr(n);
				});
			}
			if(rias.isString(name)){
				N = rias.upperCaseFirst(name);
				if(!rias.isFunction(self["_set" + N + "Attr"])){
					self["_set" + N + "Attr"] = function(value){
						//if(self[name] !== value){
						self._set(name, value);
						//}
					};
					if(rias.isFunction(self["_on" + N])){
						self.own(self.watch(name, function(_name, oldValue, value){
							if(this._destroying || this._beingDestroyed){
								return undefined;
							}
							return self["_on" + N](value, oldValue);
						}));
						//self["_on" + N](undefined, self[name]);
					}
				}
				if(!rias.isFunction(self["_get" + N + "Attr"])){
					self["_get" + N + "Attr"] = function(){
						return self[name];
					};
				}
			}
		}
	});
	rias.ObjectBase = rias.declare([Destroyable, Stateful], {
	});

	return rias;

});