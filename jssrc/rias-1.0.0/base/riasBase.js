
//RIAStudio Client/Server Runtime riasBase(rias).

define([
	"rias/base/lang",

	"dojo/Stateful", // Stateful
	"dijit/Destroyable"
], function(rias, Stateful, Destroyable) {

	var _catCounter = {};
	//FIXME:zensst.考虑以后多页(rias.webApp)时怎样处理.
	rias._getUniqueCat = function(widget, wholeTypeName){
		widget = (widget._riaswType || widget.declaredClass || (rias.isString(widget) ? widget : "riasWidget"));
		if(!wholeTypeName){
			widget = widget.split('.').pop();
		}
		return rias.lowerCaseFirst(widget);
	};
	rias.getUniqueId = function(/*String*/id, module){
		var m = (rias.isRiaswModule(module) ? module : rias.webApp ? rias.webApp : undefined),
			t = (id || m && m.id || "id"),//.replace(/\./g, "_"),
			c = (m && m._catCounter ? m._catCounter : _catCounter);
		do{
			id = t + (t in c ? ++c[t] : c[t] = 1);
		}while(rias.getObject(id) || m && (m[id] || rias.webApp.byId(id) || rias.webApp.byId(m.id + "_" + id)));
		return id;// dijit._scopeName === "dijit" ? id : dijit._scopeName + "_" + id; // String
	};

///Destroyable==================================================================///

	rias.isDestroyed = function(riasw, checkAncestors){
		riasw = rias.by(riasw);
		var d = !riasw || (riasw._beingDestroyed || riasw._destroyed);
		if(checkAncestors){
			while(!d && riasw._riasrParent && (riasw = riasw._riasrParent)){
				d = riasw._beingDestroyed || riasw._destroyed;
			}
		}
		return !!d;
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
			child._riasrParent = undefined;
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
	var __riasrId = 0;
	rias.setObject("rias.riasw.Stateful", Stateful);
	Stateful.extend({
		toString: function(){
			return "[object RiasStateful]";
		},
		///attributeMap, _introspect, _applyAttributes 与 _WidgetBase 相互独立，没有继承关系。
		attributeMap: {},
		postscript: function(/*Object?*/ params){
			if(/*rias.isDebug &&*/ !this.__riasrId){
				this.__riasrId = __riasrId++;
			}
			try{
				this.create.apply(this, arguments);
			}catch(e){
				this._riasrCreateError = e;
				console.error(rias.captureStackTrace(e), this);
			}
		},
		create: function(params){
			this._introspect();
			if(params){
				this.params = params;
				//rias.safeMixin(this, params);
				rias.mixin(this, params);
			}
			this._applyAttributes();
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
				N, _init = true;
			if(rias.isArray(name)){
				rias.forEach(name, function(n){
					self._initAttr(n);
				});
			}
			if(rias.isObject(name)){
				_init = (name.initialize == undefined || name.initialize);
				name = name.name;
			}
			if(rias.isString(name)){
				N = rias.upperCaseFirst(name);
				if(!rias.isFunction(self["_set" + N + "Attr"])){
					self["_set" + N + "Attr"] = function(value){
						//if(self[name] !== value){
						self._set(name, value);///触发 watch()
						//}
					};
				}
				if(rias.isFunction(self["_on" + N])){
					self.own(self.watch(name, function(_name, oldValue, value){
						if(self.isDestroyed(true)){
							return undefined;
						}
						return self["_on" + N](value, oldValue);
					}));
					//self["_on" + N](undefined, self[name]);
				}
				if(!rias.isFunction(self["_get" + N + "Attr"])){
					self["_get" + N + "Attr"] = function(){
						return self[name];
					};
				}
				if(_init && rias.isFunction(self["_on" + N])){
					self["_on" + N](self[name]);
				}
			}
		}
	});
	rias.setObject("rias.riasw.Destroyable", Destroyable);
	Destroyable.extend({
		toString: function(){
			return "[object RiasDestroyable]";
		},

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
				this._riasrCreateError = e;
				console.error(rias.captureStackTrace(e), this);
			}
		},

		_initRiasW: function(params, errCall){
			var s,
				w = this,
				owner = w._riasrOwner || w.ownerRiasw;
			w._riasrCreated = true;///下面需要用到

			///改在 _WidgetBase.postCreate 中设置。
			//if(w.domNode){
			//	w.domNode._riasrWidget = w;
			//}

			if(!w._riaswType){
				w._riaswType = w.declaredClass;
			}
			//w._riaswVersion 保留原生的 _riaswVersion
			//w._riasrOwner = /*params._riasrOwner ||*/ undefined;
			//w._riasrChildren = /*params._riasrChildren ||*/ [];
			if(!w._riaswParams){
				w._riaswParams = params._riaswParams || {};
			}
			if(w._riaswParams){
				///保留设计值，删除运行期值
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
			//w.ownerRiasw = undefined;
			if(rias.isDebug && !w._riasrModule && !rias.isRiasWebApp(w)){///new App() 时，webApp 尚未赋值。
				console.debug("The widget('" + (w.id || w.name || w._riaswType) + "')._riasrModule is undefined.", params);
			}
			if(!w._riasrOwner){
				try{
					if(rias.isRiasw(w.ownerRiasw)){
						w.ownerRiasw.own(w);
					}else if(rias.isRiasw(w._riasrModule)){
						w._riasrModule.own(w);
					}
				}catch(e){
					console.error(rias.captureStackTrace(e), w);
					if(rias.isFunction(errCall)){
						rias.hitch(this, errCall)(e);
					}
				}
			}
			if(w._riasrOwner && w._riasrOwner._riasrDesigning){
				w._riasrDesigning = true;
			}
			if(!w._riaswIdOfModule && params._riaswIdOfModule){
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
					console.error(rias.captureStackTrace(e), w);
					if(rias.isFunction(errCall)){
						rias.hitch(this, errCall)(e);
					}
				}
			}
			if(rias.isDebug && !w._riasrOwner && !rias.isRiasWebApp(w)){
				console.debug("The widget('" + (w.id || w.name || w._riaswType) + "')._riasrOwner is undefined.", params);
			}
			if(!w.id){
				w.id = w._riasrModule && w._riaswIdOfModule ? (w._riasrModule.id + "_" + w._riaswIdOfModule) :
					w._riasrOwner ? rias.getUniqueId(w._riasrOwner.id + "_" + rias._getUniqueCat(w)) :
						w._riasrModule ? rias.getUniqueId(w._riasrModule.id + "_" + rias._getUniqueCat(w), w._riasrModule) :
							rias.getUniqueId(rias._getUniqueCat(w));
				if(w.params){
					// if params contains {id: undefined}, prevent _applyAttributes() from processing it
					//delete w.params.id;
				}
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
			if(!self._riasrDestroying){
				self._riasrDestroying = true;
				self.destroyRiasrChildren(preserveDom);
				self.orphan();
				if(self._riasrModule && self._riasrModule[self._riaswIdOfModule]){
					delete self._riasrModule[self._riaswIdOfModule];
				}
			}
			self._destroyed = true;
			self._riasrDestroying = false;
			rias.publish("_riaswDestroy", {
				widget: self
			});
		},

		isDestroyed: function(checkAncestors){
			return rias.isDestroyed(this, checkAncestors != false);
		},
		_setOwnerRiaswAttr: function(owner){
			if(rias.isString(owner)){
				owner = rias.by(owner);
			}
			if(rias.isInstanceOf(owner, Destroyable)){
				owner.own(this);
			}else{
				throw new Error("The owner of " + owner + " is not isInstanceOf rias.riasw.Destroyable.");
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
					this._riasrOwner = undefined;
					/// 暂时不考虑 rias.webApp.removeWidget.
					//rias.publish("_riaswOrphan", {
					//	widget: this
					//});
				}
				return this;
			//};
		},
		own: function(handles){
			///FIXME:zensst. own(after(destroy))时，有错！执行 after 之前就 remove 了。
			var self = this,
				i,
				hds,
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
				hds = rias.concat(hds, arguments);// [].concat 未做转换;
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
				var da = [],
					odh = {
					_handle: handle,
					_remove: rias.before(self, "destroy", function (preserveDom){
						self._beingDestroyed = true;
						if(handle._riasrParent){
							rias.removeChild(handle._riasrParent, handle);
						}
						if(destroyMethodName === "remove" || destroyMethodName === "close"){
							rias.hitch(handle, self.orphan)();
						}
						handle[destroyMethodName](preserveDom);
						i = self._riasrChildren.indexOf(odh);
						if(i >= 0){
							self._riasrChildren.splice(i, 1);
						}
					})
				};
				if(rias.isRiasw(handle)){
					rias.hitch(handle, self.orphan)(true);
					handle._riasrOwner = self;
					self._riasrChildren.push(odh);
				}

				// Callback for when handle is manually destroyed.
				function onManualDestroy(){
					odh._remove.remove();
					rias.forEach(da, function(hdh){
						hdh._remove.remove();
					});
					da = undefined;
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
							///每种 destroy 方法都 handle after
							da.push({
								_handle: handle,
								_remove: rias.after(handle, cleanupMethod, onManualDestroy, true)
							});
						}
					});
				}
			}, self);

			return hds;		// arguments
		},

		around: function(target, methodName, advice, receiveArguments){
			return this.own(rias.around(target, methodName, advice, receiveArguments))[0];
		},
		before: function(target, methodName, advice, receiveArguments){
			return this.own(rias.before(target, methodName, advice, receiveArguments))[0];
		},
		after: function(target, methodName, advice, receiveArguments){
			return this.own(rias.after(target, methodName, advice, receiveArguments))[0];
		}
	});
	rias.ObjectBase = rias.declare([Destroyable, Stateful], {
		toString: function(){
			return "[object RiasWidget]";
		},
		create: function(params){
			this._introspect();
			if(params){
				this.params = params;
				//rias.safeMixin(this, params);
				rias.mixin(this, params);
			}
			this.postMixInProperties();
			this._applyAttributes();

			this.postCreate(params);
		}
	});

	return rias;

});