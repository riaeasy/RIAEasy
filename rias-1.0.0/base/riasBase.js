
//RIAStudio Client/Server Runtime riasBase(rias).

define([
	"rias/base/lang",
	"rias/base/encoding",

	"dojo/Stateful", // Stateful
	"dijit/Destroyable"
], function(rias, encoding, Stateful, Destroyable) {

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

	rias.removeChild = function(parent, child, noresize){
		if(child._riasrParent == parent){
			//console.debug(parent, child);
			child._riasrParent = undefined;
			child._riasrNext = undefined;
			child._riasrPrev = undefined;
		}
		if(!rias.isRiasw(child)){
			return;
		}
		if(rias.isDijit(parent)){
			if(parent.removeChild && rias.isDijit(child)){
				parent.removeChild(child, noresize);
			}else{
				try{
					(parent.containerNode || parent.domNode).removeChild(child.domNode ? child.domNode : child);
				}catch(e){
					console.error(e);
				}
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
		delete p._riasrElements;
		delete p._riasrParent;
		delete p._riasrNext;
		delete p._riasrPrev;
	};
	var __riasrId = 0;
	rias.Destroyable = Destroyable;
	function isEqual(a, b){
		return a === b || (/* a is NaN */ a !== a && /* b is NaN */ b !== b);
	}
	Destroyable.extend({
		toString: function(){
			return "[riasObject Rias.Destroyable, " + (this.id || "NO ID") + "]";
		},

		///是简单对象，不是类工厂。
		//constructor: function(params){
		//	this._riasrOwner = null;
		//	this._riasrElements = [];
		//},
		postscript: function(/*Object?*/params){
			if(!this.__riasrId){
				this.__riasrId = __riasrId++;
			}
			try{
				this.create.apply(this, arguments || []);
			}catch(e){
				if(!this._riasrCreateError){
					this._riasrCreateError = [];
				}
				this._riasrCreateError.push(e);
				console.error(rias.captureStackTrace(e), this);
			}
		},
		create: function(params){
			this._introspect();
			if(params){
				this.params = params;
				rias.mixin(this, params);
			}
			this.postMixInProperties();
			this._applyAttributes();

			this._initAttr(["_riasrDesigning"]);
			this.postCreate(params);
		},

		_initRiasW: function(params, errCall){
			var s,
				w = this,
				owner = params.ownerRiasw || params._riasrOwner;
			w._riasrCreated = true;///下面需要用到

			///改在 _WidgetBase.postCreate 中设置。
			//if(w.domNode){
			//	w.domNode._riasrWidget = w;
			//}

			if(!w._riaswType){
				w._riaswType = w.declaredClass;
			}
			//w._riaswVersion 保留原生的 _riaswVersion
			if(!w._riaswParams){
				w._riaswParams = params._riaswParams || {};
			}
			if(w._riaswParams){
				///保留设计值，删除运行期值
				rias._deleDP(w._riaswParams, true, true, true);
			}

			//w._riasrParent = undefined;
			//w._riaspChildren = [];
			w.setOwnerRiasw(owner);
			owner = w.getOwnerRiasw();
			if(!w._riasrElements){
				w._riasrElements = [];
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
			if(rias.isDebug && !w._riasrModule && !rias.isRiasApp(w)){///new App() 时，webApp 尚未赋值。
				console.debug("The widget('" + (w.id || w.name || w._riaswType) + "')._riasrModule is undefined.", params);
			}
			if(!w._riasrOwner){
				try{
					if(rias.isRiasw(w.getOwnerRiasw())){
						w.getOwnerRiasw().own(w);
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
							if(rias.hostBrowser){
								debugger;
							}
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
			//if(!rias.isFunction(w.destroy)){
			//	console.debug("The widget('" + (w.id || w.name || w._riaswType) + "') has no property of 'destroy: function()'.", params);
			//}
			try{
				if(w._riasrOwner && rias.contains(w._riasrOwner._riasrElements, w)){
					w._riasrOwner.own(w);
				}
				if(!w._riasrOwner){
					if(rias.webApp && w != rias.webApp){
						rias.webApp.own(w);
						if(rias.isDebug){
							console.debug("The widget('" + (w.id || w.name || w._riaswType) + "')._riasrOwner set to the rias.webApp.", params);
						}
					//}else{
					}
				}
				//rias.webApp.addWidget(w);
			}catch(e){
				console.error(rias.captureStackTrace(e), w);
				if(rias.isFunction(errCall)){
					rias.hitch(this, errCall)(e);
				}
			}
			if(rias.isDebug && !w._riasrOwner && !rias.isRiasApp(w)){
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
			/// Destroyable 尚没有 destroyRecursive
			var self = this;
			rias.forEach(self._riasrElements, function(handle){
				handle = handle._handle;
				if(handle._riasrOwner && handle._riasrOwner != self){
					//if(widget.parentNode){
					//	widget.parentNode.removeChild(widget.domNode);
					//}
					rias.removeChild(self, handle, true);
				}else{
					rias.destroy(handle, preserveDom);
				}
			});
		},
		destroy: function(/*Boolean*/ preserveDom){
			var self = this,
				pp = {
					widget: self
				};
			//console.debug("beforeDestroy - " + this.id + " - " + rias.__dt() + " ms.");
			self._beingDestroyed = true;
			//rias.publish("/rias/destroy/start", [pp]);
			if(!self._riasrDestroying){
				self._riasrDestroying = true;
				self.destroyRiasrChildren(preserveDom);
				self.isolate();/// destroy 时，不再保留 parent。
				if(self._riasrModule && self._riasrModule[self._riaswIdOfModule]){
					delete self._riasrModule[self._riaswIdOfModule];
				}
			}
			self._destroyed = true;
			self._riasrDestroying = false;
			rias.publish("_riaswDestroy", {
				widget: self
			});
			//rias.publish("/rias/destroy/done", [pp]);
			//console.debug("destroy - " + this.id + " - " + rias.__dt() + " ms.");
		},

		_get: function(/*String*/ name){
			return this[name];
		},
		/// store 有自己的 get 方法，有冲突。
		/// 如果需要 get 方法，则需要继承自 rias.ClassBase 或 _WidgetBase，或自己扩展一个。
		//get: function(name){
		//	var names = this._getAttrNames(name);
		//	return this[names.g] ? this[names.g]() : this._get(name);
		//},
		_set: function(/*String*/ name, /*anything*/ value){
			var oldValue = this[name];
			this[name] = value;
			if(this._created && !isEqual(oldValue, value)){
				if(this._watchCallbacks){
					this._watchCallbacks(name, oldValue, value);
				}
			}
		},
		set: function(name, value){
			if(typeof name === "object"){
				for(var x in name){
					this.set(x, name[x]);
				}
				return this;
			}
			var names = this._getAttrNames(name),
				setter = this[names.s],
				result;
			if(rias.isFunction(setter)){
				result = setter.apply(this, rias.toArray(arguments, 1));
			}else{
				this._set(name, value);
			}
			return result || this;
		},
		_attrPairNames: {},
		_getAttrNames: function(name){
			var apn = this._attrPairNames;
			if(apn[name]){
				return apn[name];
			}
			return (apn[name] = {
				s: "_" + name + "Setter",
				g: "_" + name + "Getter"
			});
		},
		attributeMap: {},
		_introspect: function(){
			var ctor = this.constructor;
			if(!ctor._setterAttrs){
				var proto = ctor.prototype,
					attrs = ctor._setterAttrs = [], // attributes with custom setters
					onMap = (ctor._onMap = {});

				for(var name in proto.attributeMap){
					attrs.push(name);
				}
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
			}
		},
		_applyAttributes: function(){
			var self = this,
				params = {};

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
			/// _initAttr 初始化执行 _onXXX 的条件是 name.initialize == undefined || name.initialize。
			/// watch 没有 return，故 _initAttr 也没有 return。
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
						self._set(name, value);///触发 watch()
					};
				}
				if(rias.isFunction(self["_on" + N])){
					self.own(self.watch(name, function(_name, oldValue, value){
						if(self.isDestroyed(true)){
							return undefined;
						}
						return self["_on" + N](value, oldValue);
					}));
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
		},
		watch: function(/*String?*/name, /*Function*/callback){
			var callbacks = this._watchCallbacks;
			if(!callbacks){
				var self = this;
				callbacks = this._watchCallbacks = function(name, oldValue, value, ignoreCatchall){
					var notify = function(propertyCallbacks){
						if(propertyCallbacks){
							propertyCallbacks = propertyCallbacks.slice();
							for(var i = 0, l = propertyCallbacks.length; i < l; i++){
								propertyCallbacks[i].call(self, name, oldValue, value);
							}
						}
					};
					notify(callbacks['_' + name]);
					if(!ignoreCatchall){
						notify(callbacks["*"]); // the catch-all
					}
				}; // we use a function instead of an object so it will be ignored by JSON conversion
			}
			if(!callback && typeof name === "function"){
				callback = name;
				name = "*";
			}else{
				// prepend with dash to prevent name conflicts with function (like "name" property)
				name = '_' + name;
			}
			var propertyCallbacks = callbacks[name];
			if(typeof propertyCallbacks !== "object"){
				propertyCallbacks = callbacks[name] = [];
			}
			propertyCallbacks.push(callback);

			var handle = {};
			handle.remove = function(){
				var index = rias.indexOf(propertyCallbacks, callback);
				if(index > -1){
					propertyCallbacks.splice(index, 1);
				}
			};
			return handle; //Object
		},

		_set_riasrDesigningAttr: function(value){
			value = !!value;
			this._set("_riasrDesigning", value);
		},
		_get_riasrDesigningAttr: function(){
			return this._get("_riasrDesigning");
		},
		_on_riasrDesigning: function(){
		},

		isDestroyed: function(checkAncestors){
			return rias.isDestroyed(this, checkAncestors != false);
		},

		setOwnerRiasw: function(owner){
			owner = rias.by(owner);
			if(owner){
				if(this._riasrOwner !== owner || this.ownerRiasw !== owner){
					if(rias.isInstanceOf(owner, Destroyable)){
						owner.own(this);
					}else{
						throw new Error("The owner of " + owner + " is not isInstanceOf rias.Destroyable.");
					}
				}
			}else{
				this.isolate(true);/// 改变 owner，并非是 改变 parent，故应保留 parent。
			}
		},
		getOwnerRiasw: function(){
			return this._riasrOwner || this.ownerRiasw;
		},
		isolate: function(preserveParent){
			var i;
			///一般情况下，isolate() 之前有可能已经 destroy domNode，所以不能在这里 removeChilde。移到 destroy() 和 destroyDescendants() 中处理。
			/// isolate 有可能只是 isolate，而不是 destroy，则可能没有提前 释放 parent，所以这里仍然需要判断是否释放 parent。
			if(!preserveParent && this._riasrParent){
				rias.removeChild(this._riasrParent, this, false);
			}
			if(this._riasrOwner){
				///_riasrOwner 不是 Parent，不应该 removeChild
				//if(rias.isDijit(this)){
				//	rias.removeChild(this._riasrOwner, this, false);
				//}
				i = rias.indexOfByAttr(this._riasrOwner._riasrElements, this, "_handle");
				if(i >= 0){
					this._riasrOwner._riasrElements[i]._remove.remove();
					this._riasrOwner._riasrElements.splice(i, 1);
				}
				this._riasrOwner = undefined;
				this.ownerRiasw = undefined;
				/// 暂时不考虑 rias.webApp.removeWidget.
				//rias.publish("_riaswOrphan", {
				//	widget: this
				//});
			}
			return this;
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
			if(!self._riasrElements){
				self._riasrElements = [];
			}
			i = self._riasrElements.length;
			hds = rias.concat(hds, arguments);// [].concat 未做转换;

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
							rias.removeChild(handle._riasrParent, handle, true);
						}
						if(destroyMethodName === "remove" || destroyMethodName === "close"){
							//rias.hitch(handle, self.isolate)();/// destroy 时，不再保留 parent。
							self.isolate.apply(handle, []);
						}
						handle[destroyMethodName](preserveDom);
						i = self._riasrElements.indexOf(odh);
						if(i >= 0){
							self._riasrElements.splice(i, 1);
						}
					})
				};
				if(rias.isRiasw(handle)){
					rias.hitch(handle, self.isolate)(true);/// 改变 owner，并非是 改变 parent，故应保留 parent。
					handle._riasrOwner = self;
					handle.ownerRiasw = self;
					self._riasrElements.push(odh);
					if(rias.isInstanceOf(handle, Destroyable)){
						if(rias.isFunction(handle._set_riasrDesigningAttr)){
							handle._set_riasrDesigningAttr(self._riasrDesigning);
						}else if(rias.isFunction(handle._set_riasrDesigning)){
							handle._set_riasrDesigning(self._riasrDesigning);
						}else{
							handle._riasrDesigning = self._riasrDesigning;
						}
					}
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
		},
		on: function(/*String|Function*/ type, /*Function*/ func){
			// summary:
			//		Call specified function when event occurs, ex: myWidget.on("click", function(){ ... }).
			// type:
			//		Name of event (ex: "click") or extension event like touch.press.
			// description:
			//		Call specified function when event `type` occurs, ex: `myWidget.on("click", function(){ ... })`.
			//		Note that the function is not run in any particular scope, so if (for example) you want it to run in the
			//		widget's scope you must do `myWidget.on("click", lang.hitch(myWidget, func))`.

			if(rias.isString(func)){
				func = rias.hitch(this, func);
			}
			// For backwards compatibility, if there's an onType() method in the widget then connect to that.
			// Remove in 2.0.
			var widgetMethod = this._onMap(type);
			if(widgetMethod){
				return rias.after(this, widgetMethod, func, true);
			}

			// Otherwise, just listen for the event on this.domNode.
			return this.own(rias.on(this.domNode, type, func))[0];
		},
		emit: function(/*String*/ type, /*Object?*/ eventObj, /*Array?*/ callbackArgs){
			// summary:
			//		Used by widgets to signal that a synthetic event occurred, ex:
			//	|	myWidget.emit("attrmodified-selectedChildWidget", {}).
			//
			//		Emits an event on this.domNode named type.toLowerCase(), based on eventObj.
			//		Also calls onType() method, if present, and returns value from that method.
			//		By default passes eventObj to callback, but will pass callbackArgs instead, if specified.
			//		Modifies eventObj by adding missing parameters (bubbles, cancelable, widget).
			// tags:
			//		protected

			// Specify fallback values for bubbles, cancelable in case they are not set in eventObj.
			// Also set pointer to widget, although since we can't add a pointer to the widget for native events
			// (see #14729), maybe we shouldn't do it here?
			eventObj = eventObj || {};
			if(eventObj.bubbles === undefined){
				eventObj.bubbles = true;
			}
			if(eventObj.cancelable === undefined){
				eventObj.cancelable = true;
			}
			if(!eventObj.detail){
				eventObj.detail = {};
			}
			eventObj.detail.widget = this;

			var ret, callback = this["on" + type];
			if(callback){
				ret = callback.apply(this, callbackArgs ? callbackArgs : [eventObj]);
			}

			// Emit event, but avoid spurious emit()'s as parent sets properties on child during startup/destroy
			if(this._started && !this._beingDestroyed){
				rias.on.emit(this.domNode, type.toLowerCase(), eventObj);
			}

			return ret;
		},
		defer: function(callback, delay, args){
			var self = this,
				timer = null,
				stack = "";
			if(rias.isDebug){
				stack = rias.getStackTrace();
			}
			if(rias.isString(callback)){
				if(!self[callback]){
					throw(this.id + ".defer: the '" + callback + "'] is null.\n" + stack);
				}
				callback = self[callback];
			}
			args = rias.toArray(arguments, 2);
			timer = setTimeout(function(){
				if(!timer){
					return;
				}
				timer = null;
				if(!self._destroyed){
					try{
						callback.apply(self, args);///IE8 不支持 args = undefined。
					}catch(e){
						console.error("this.defer()", args, rias.captureStackTrace(e) + "\n    ----\n" + stack);
					}
				}
			}, delay || 0);
			return {
				remove: function(){
					if(timer){
						clearTimeout(timer);
						timer = null;
					}
					return null; // so this works well: handle = handle.remove();
				}
			};
		}

	});
	/// rias.ClassBase 相当于无 dom 的 _WidgetBase.
	rias.ClassBase = rias.declare([Destroyable], {
		toString: function(){
			return '[riasClass ' + this._riaswType || this.declaredClass + ', ' + (this.id || 'NO ID') + ']'; // String
		},
		attributeMap: {},
		_attrPairNames: {}, // shared between all widgets
		_getAttrNames: function(name){
			var apn = this._attrPairNames;
			if(apn[name]){
				return apn[name];
			}
			var uc = name.replace(/^[a-z]|-[a-zA-Z]/g, function(c){
				return c.charAt(c.length - 1).toUpperCase();
			});
			return (apn[name] = {
				s: "_set" + uc + "Attr", // converts dashes to camel case, ex: accept-charset --> _setAcceptCharsetAttr
				g: "_get" + uc + "Attr"
			});
		},
		get: function(name){
			var names = this._getAttrNames(name);
			return this[names.g] ? this[names.g]() : this._get(name);
		},
		set: function(name, value){
			if(typeof name === "object"){
				for(var x in name){
					this.set(x, name[x]);
				}
				return this;
			}
			var names = this._getAttrNames(name),
				setter = this[names.s],
				result;
			if(rias.isFunction(setter)){
				result = setter.apply(this, rias.toArray(arguments, 1));
			}else{
				this._set(name, value);
			}
			return result || this;
		}

	});

	return rias;

});