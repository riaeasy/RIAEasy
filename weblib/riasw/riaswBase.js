
//RIAStudio Client Runtime Widget(riasWidget Base).

define([
	"riasw/hostDojo",
	//"dojo/has!require-encoding?rias/encoding",
	"rias/encoding",

	"riasw/theme",
	"riasw/html",
	"riasw/xhr",
	"riasw/fx",

	"riasw/popupManager",

	"riasw/riaswMetas"
], function(rias, encoding,
			theme, html, xhr, fx,
			popupManager,
			riaswMetas) {

	var //_dInitStudio = rias.newDeferred(),
		_dom = rias.dom;
	//rias.whenLoaded._deferreds.push(_dInitStudio);

///kernal******************************************************************************///

	//if(!console.memory){
	//	console.memory = {};
	//}

	rias.defaultDuration = rias.config.defaultDuration || rias.has("ff") ? 400 : 200;
	rias.autoToggleDuration = rias.defaultDuration;

	rias.popupManager = popupManager;

	//rias.registry = registry;
	rias.mixin(rias.rt, {
		add: function(widget){
			// summary:
			//		Add a widget to the _widgets. If a duplicate ID is detected, a error is thrown.
			// widget: rias.ObjectBase this.或 riasw.sys._WidgetBase
			if(this._widgets[widget.id]){
				throw new Error("Tried to register widget with id==" + widget.id + " but that id is already registered");
			}
			this._widgets[widget.id] = widget;
			this.length++;
		},
		remove: function(/*String*/ id, doDestroy){
			// summary:
			//		Remove a widget from the this._widgets. Does not destroy the widget; simply
			//		removes the reference.
			var w = this._widgets[id];
			if(w){
				delete this._widgets[id];
				this.length--;
				if(doDestroy){
					rias.destroy(w);
				}
			}
		},

		byNode: function(/*DOMNode*/ node){
			// summary:
			//		Returns the widget corresponding to the given DOMNode
			return this._widgets[node.getAttribute("widgetId")]; // riasw.sys._WidgetBase
		},

		_destroyAll: function(){
			// summary:
			//		Code to destroy all widgets and do other cleanup on page unload

			// Clean up focus manager lingering references to widgets and nodes
			//this._curFocus = null;
			//this._prevFocus = null;
			//this._activeStack = [];

			// Destroy all the widgets, top down
			rias.forEach(this.findWidgets(_dom.docBody), function(widget){
				// Avoid double destroy of widgets like Menu that are attached to <body>
				// even though they are logically children of other widgets.
				this.remove(widget.id, true);
			}, this);
		},

		getEnclosingWidget: function(/*DOMNode*/ node){
			// summary:
			//		Returns the widget whose DOM tree contains the specified DOMNode, or null if
			//		the node is not contained within the DOM tree of any widget
			while(node){
				var id = node.nodeType === 1 && node.getAttribute("widgetId");
				if(id){
					return this._widgets[id];
				}
				node = node.parentNode;
			}
			return null;
		},
		findWidgets: function(root, skipNode){
			// summary:
			//		Search subtree under root returning widgets found.
			//		Doesn't search for nested widgets (ie, widgets inside other widgets).
			// root: DOMNode
			//		Node to search under.
			// skipNode: DOMNode
			//		If specified, don't search beneath this node (usually containerNode).

			var _widgets = this._widgets,
				outAry = [];

			function getChildrenHelper(root){
				for(var node = root.firstChild; node; node = node.nextSibling){
					if(node.nodeType === 1){
						var widgetId = node.getAttribute("widgetId");
						if(widgetId){
							var widget = _widgets[widgetId];
							if(widget){	// may be null on page w/multiple dojo's loaded
								outAry.push(widget);
							}
						}else if(node !== skipNode){
							getChildrenHelper(node);
						}
					}
				}
			}

			getChildrenHelper(root);
			return outAry;
		},

		getEnclosingScrollable: function(/*DomNode*/ node){
			// summary:
			//		Gets the dojox/mobile/scrollable object containing the specified DOM node.
			// returns: dojox/mobile/scrollable
			for(var w = this.getEnclosingWidget(node); w; w = w.getParent()){
				if(w.scrollableParams && w._v){
					return w;
				}
			}
			return null;
		},

		dispatchTransition: function(sender, detail, triggerEvent){
			// summary:
			//		Dispatches this transition event. Emits a "startTransition" event on the target.
			/// triggerEvent 是 sender 监听到的“原始事件”
			sender = rias.by(sender);
			detail.sender = sender;
			if(sender){
				rias.on.emit(sender.domNode, "startTransition", {
					bubbles:true,
					cancelable:true,
					detail: detail,
					triggerEvent: triggerEvent
				});
			}
		}
	});

	/*rias.riasdParams = {
		//moduleMeta: "",
		_riaswVersion: "1.1",
		_riaswParams: {},
		_riaswType: "",
		_riaswIdInModule: "",
		_riaswModuleMeta: {},
		_riaswElements: [],
		_riasrCreated: false,
		_riasrOwner: undefined,
		_riasrElements: [],
		_riasrModule: undefined,
		__riasrWidget: undefined//,
		//_riaspParent: undefined,
		//_riaspChildren: []
	};*/

	rias.queryRiasdParams = function(/*riasWidget*/root, /*String*/name, /*Object*/value){
		var items = (rias.isArray(root) ? root : [root]),
			i, l = items.length,
			w, r = [];
		for(i = 0; i < l; i++){
			if((w = items[i])){
				if(w[name] && (value === undefined || w[name] === value)){
					r.push(w);
				}
				r = r.concat(arguments.callee(w._riaswElements, name, value));
			}
		}
		return r;
	};

	var _riaswMetas = {};
	function _getRiaswMeta(/*riaswType*/riaswType, errCall){
		if(!riaswType){
			console.error("Needs _riaswType/declaredClass param.", riaswType);
			if(errCall){
				errCall("Needs _riaswType/declaredClass param." + riaswType);
			}
			return;
		}
		if(!(riaswType in _riaswMetas)){
			console.error("No riaswMeta found. (" + riaswType + ")", riaswType);
			if(errCall){
				errCall("No riaswMeta found. (" + riaswType + ")" + riaswType);
			}
			return;
		}
		return _riaswMetas[riaswType];
	}
	rias.getRiaswMeta = function(riaswType){
		riaswType = rias.isString(riaswType) ? riaswType : (riaswType._riaswType || riaswType.declaredClass);
		return _getRiaswMeta(riaswType);
	};
	rias.getRiaswMetas = function(){
		//需要复制一个Metas，而不是直接使用RiaswMetas.
		return rias.mixinDeep({}, _riaswMetas);
	};
	function _setRiaswMetas(cat, metas, clearCat){
		if(clearCat){
			_riaswMetas = {};
		}
		rias.mixinDeep(_riaswMetas, metas);
		return _riaswMetas;
	}
	_setRiaswMetas(1, riaswMetas, true);
	rias.registerRiaswMetas = function(metas){
		if(arguments.length === 2){
			_setRiaswMetas(arguments[0], arguments[1]);
		}else{
			_setRiaswMetas(2, metas);
		}
	};

	function _getRiaswCtor(/*riaswType*/riaswType, errCall){
		if(!riaswType){
			console.error("Needs _riaswType/declaredClass param.", riaswType);
			if(errCall){
				errCall("Needs _riaswType/declaredClass param." + riaswType);
			}
		}else if(rias.isRiaswCtor(riaswType)){
			return riaswType;
		}else{
			var r = rias.getObject(riaswType, false);
			if(rias.isRiaswCtor(r)){
				return r;
			}
		}
	}
	rias.requireRiaswCtor = function(riaswType, errf){
		var s, ctor,// t,
			d = rias.newDeferred("requireRiaswCtor", rias.debugDeferredTimeout ? rias.defaultDeferredTimeout >> 1 : 0, function(){
			this.cancel();
		});
		function rerror(e){
			if(e instanceof Error){
				s = e.message;
				console.error(e.message, e);
			}else{
				s = "requireRiaswCtor error. (" + riaswType + ")";
				console.error(s);
			}
			if(errf){
				errf(new Error(s));
			}
			d.resolve(undefined);
		}

		ctor = _getRiaswCtor(riaswType);
		if(ctor){
			d.resolve(ctor);
		}else{
			var r = _getRiaswMeta(riaswType);
			if (!r) {
				rerror("The riaswMeta of (" + riaswType + ") not found.");
			}else{
				r = r.requires;
				if (!r) {
					rerror("riaswMeta of " + riaswType + " has no requires.");
				}else{
					if(!rias.isArray(r)){
						r = [r];
					}
					rias.require(r, function(ctor){
						d.resolve(ctor);
					});
				}
			}
		}
		return d.promise;
	};
	function _requireCtors(children, errCall){
		var d = rias.newDeferred("_requireCtors", rias.debugDeferredTimeout ? rias.defaultDeferredTimeout : 0, function(){
				this.cancel();
			}, children),
			rs = [], t, meta, r, pn,
			s;

		function _do1(param){
			t = param._riaswType || param.declaredClass;
			if(!_getRiaswCtor(t)){
				meta = _getRiaswMeta(t);
				if (!meta) {
					s = "The riaswMeta of (" + t + ") not found.";
					if(errCall){
						errCall(s);
					}else{
						throw s;
					}
				}else{
					r = meta.requires;
					if (!r) {
						s = "riaswMeta of " + t + " has no requires.";
						if(errCall){
							errCall(s);
						}else{
							throw s;
						}
					}else{
						if(!rias.isArray(r)){
							if(rias.indexOf(rs, r) < 0){
								rs.push(r);
							}
						}else{
							rias.concatUnique(rs, r);
						}
					}
				}
			}
		}
		function _do(params){
			rias.forEach(params, function(param){
				/// 只需要判断是 isRiaswParam 的情况，其他情况表示已经 require 了。
				if (rias.isRiaswParam(param)){
					_do1(param);
				}
				for(pn in param){
					if(param.hasOwnProperty(pn)){
						r = param[pn];
						if(rias.isRiaswParam(r)){
							_do1(r);
						}
					}
				}
				if(rias.isArray(param._riaswElements)){
					_do(param._riaswElements);
				}
			});
		}

		_do(children);
		if(rs.length){
			rias.require(rs, function(){
				d.resolve([rs, arguments]);
			});
		}else{
			d.resolve([]);
		}
		return d.promise;
	}

	//var _xtor = new Function;
	rias.newRiasw = function(/*Constructor*/widgetCtor, params, /*DOMNode|String?*/refNode, errCall){
		/*function forceNew(ctor){
			// create object with correct prototype using a do-nothing
			// constructor
			_xtor.prototype = ctor.prototype;
			var t = new _xtor;
			_xtor.prototype = null;	// clean up
			return t;
		}
		function applyNew(args){
			// create an object with ctor's prototype but without
			// calling ctor on it.
			var ctor = args.callee, t = forceNew(ctor);
			// execute the real constructor on the new object
			ctor.apply(t, args || []);
			return t;
		}
		function _create(bases, ctorSpecial){
			return function RiasWidget(){
				var a = arguments || [], args = a, a0 = a[0], f, i, m,
					l = bases.length, preArgs;

				if(!(this instanceof a.callee)){
					// not called via new, so force it
					return applyNew(a);
				}

				//this._inherited = {};
				// perform the shaman's rituals of the original declare()
				// 1) call two types of the preamble
				if(ctorSpecial && (a0 && a0.preamble || this.preamble)){
					// full blown ritual
					preArgs = new Array(bases.length);
					// prepare parameters
					preArgs[0] = a;
					for(i = 0;;){
						// process the preamble of the 1st argument
						a0 = a[0];
						if(a0){
							f = a0.preamble;
							if(f){
								a = f.apply(this, a) || a;
							}
						}
						// process the preamble of this class
						f = bases[i].prototype;
						f = f.hasOwnProperty("preamble") && f.preamble;
						if(f){
							a = f.apply(this, a) || a;
						}
						// one peculiarity of the preamble:
						// it is called if it is not needed,
						// e.g., there is no constructor to call
						// let's watch for the last constructor
						// (see ticket #9795)
						if(++i === l){
							break;
						}
						preArgs[i] = a;
					}
				}
				// 2) call all non-trivial constructors using prepared arguments
				for(i = l - 1; i >= 0; --i){
					f = bases[i];
					m = f._meta;
					f = m ? m.ctor : f;
					if(f){
						f.apply(this, preArgs ? preArgs[i] : a);
					}
				}
				// 3) continue the original ritual: call the postscript
				//f = this.postscript;
				//if(f){
				//	f.apply(this, args);
				//}
			}
		}*/
		var _ctor, w;//, ctor, owner;
		if(rias.isRiaswCtor(widgetCtor)){
			_ctor = widgetCtor;
		}else if(rias.isString(widgetCtor)){
			//if(!widgetCtor || !(_ctor = _getRiaswCtor(widgetCtor, errCall)) || !(_ctor = _ctor.ctor)){
			if(!widgetCtor || !(_ctor = _getRiaswCtor(widgetCtor, errCall))){
				_ctor = undefined;
			}
		}else{
			errCall = refNode;
			refNode = params;
			params = widgetCtor;
			w = params._riaswType || params.declaredClass;
			//if(!w || !(_ctor = _getRiaswCtor(w, errCall)) || !(_ctor = _ctor.ctor)){
			if(!w || !(_ctor = _getRiaswCtor(w, errCall))){
				_ctor = undefined;
			}
		}
		if(!_ctor){
			console.error("No constructor found.", params);
			if(errCall){
				errCall(new Error("No constructor found.\n" + rias.toJson(params, {
					prettyPrint: true,
					includeFunc: false,
					loopToString: true,
					errorToString: true,
					simpleObject: true,
					ignoreProperty_: false
				})));
			}
			return undefined;
		}
		//var bases = rias.clone(_ctor._meta.bases),
		//	chains = _ctor._meta.chains;//, args = rias.argsToArray(arguments, 1);
		///只修改 params.id，无需用 mixinDeep()。
		params = rias.mixin({
			_riaswType: _ctor.prototype.declaredClass
		}, params);
		try{
			rias.decodeRiaswParams(params, params);
			/*//if(args.length > 2){
			//	args.splice(2);
			//}
			//w = new widgetCtor(params, refNode);
			ctor = _create(bases, !chains || !chains.hasOwnProperty("constructor"));
			bases[0] = ctor;
			ctor.prototype = _ctor.prototype;
			rias.safeMixin(ctor, _ctor);
			///if(!params._riaswType && )///还是先不强行设置为 riasWidget 好些，以便区分 Dijit 和 riasWidget。
			if(params.ownerRiasw){
				//if(!params._riasrOwner){
				owner = rias.by(params.ownerRiasw);/// context ?
				//}
				//delete params.ownerRiasw;
			}
			if(!params.id){
				params.id = refNode && refNode.id ? refNode.id :
					params._riasrModule && params._riaswIdInModule ? (params._riasrModule.id + "_" + params._riaswIdInModule) :
						rias.rt.getUniqueId(rias.desktop.id + "_" + rias.rt._getUniqueCat(params, true), rias.desktop);
			}
			w = new ctor(params, refNode);
			try{
				if(w.postscript){
					w.postscript.apply(w, [params, refNode]);
				}
			}catch(e){
				console.error(w, e);
				if(errCall){
					errCall(e);
				}
			}
			if(owner){
				w._riasrCreated = true;///下面需要用到
				owner.own(w);
			}
			//_initRiasW(w, {
			//	//_riaswType: w._riaswType || ctor.prototype._declaredClass
			//}, errCall);
			try{
				if(params._riaswElements){
					//rias.parseRiasws(params._riaswElements, w);
				}
			}catch(e){
				console.error(params, w, e);
				if(errCall){
					errCall(e);
				}
			}*/
			w = new _ctor(params, refNode);
			if(w && w._riasrCreateError && w._riasrCreateError.length){
				/// this._riasrCreateError 只有 [0] 有效。
				if(errCall){
					errCall(w._riasrCreateError[0]);
				}else{
					throw w._riasrCreateError[0];
				}
			}
		}catch(e){
			//console.error("Error occurred when creating dijitWidget, params: " + params + "\n" + e.message, e, params);
			console.error(params, e);
			if(w && params.id){
				if(w === rias.rt._widgets[params.id]){
					delete rias.rt._widgets[params.id];
				}
			}
			w = undefined;
			if(errCall){
				errCall(e);
			}
			throw e;
		}
		return w;
	};

	function _createRiasws(/*riasdChildren*/children, /*riasWidget*/ownerRiasw, /*riaswModule*/module, container, /*Array*/refs, pi){
		//注意，不能修改 child 的内容值，及 metadata 的内容值
		var d = rias.newDeferred("_createRiasws", rias.debugDeferredTimeout ? rias.defaultDeferredTimeout >> 1 : 0, function(_children, _ownerRiasw){
				///由 _createRiasw 来 resolve d，屏蔽 reject/cancel
				_createRiasw(_getRiaswCtor("riasw.sys.DefaultError"), {
					//_riaswIdInModule: params._riaswIdInModule + "_Error",
					_riaswType: "riasw.sys.DefaultError",
					errorMessage: "_createRiasws deferred timeout.",
					_riaswOriginalParams: _children
				}, _ownerRiasw, m, d);
			}, children, ownerRiasw),
			ds = [],// _owners = [],
			m = module,//rias.by(module),
			errs = "", s;
		function errf(e){
			if(e instanceof Error){
				errs += (errs ? "\n" : "") + e.message;
			}else if(e){
				errs += (errs ? "\n" : "") + e;
			}
		}

		if(!ownerRiasw){
			if(!rias.desktop){///避免缺少 rias.desktop
				s = "no rias.desktop.";
				console.error(s);
				errf(s);
				d.resolve();
				return d.promise;
			}
			console.debug("_createRiasws need a ownerRiasw, now, using rias.desktop.", children);
			ownerRiasw = rias.desktop;
		}
		if(ownerRiasw.isDestroyed(false)){
			s = "The ownerRiasw(" + ownerRiasw.id + ") was destroyed.";
			console.error(s, ownerRiasw);
			errf(s);
			d.resolve();
			return d.promise;
		}
		//if(!m || ((m._riaswType !== 'riasw.sys.Module')&&(m._riaswType !== 'riasw.sys.Page'))){
		if(!m || !rias.isRiaswModule(m)){
			s = "The module(" + (m ? m.id : "no module") + ") is not a Module.";
			console.error(s, m);
			errf(s);
			d.resolve();
			return d.promise;
		}

		var _createRiasw = function(ctor, _params, _ownerRiasw, _module, _d){
			/// _ownerRiasw 有可能是 {id: params.id}
			var params,
				//pn, ppn, p, _o, i, l,
				//ps = [], _dps = [],
				_ref = [],
				_owner = _params.ownerRiasw || _ownerRiasw;
			function _createError(message){
				//s = "Error occurred when creating riasWidget: {id: " + params.id + ", _riaswType: " + params._riaswType + "}";
				console.error(message, params);
				errf(message);
				try{
					///需要关联 _params.__riasrWidget，不能用 mixinDeep({}, _params)
					_createRiasw(_getRiaswCtor("riasw.sys.DefaultError"), rias.mixin(rias.isObjectExact(params) ? params : {}, {
						_riaswIdInModule: _params._riaswIdInModule + "_Error",
						_riaswType: "riasw.sys.DefaultError",
						errorMessage: message,
						_riaswOriginalParams: _params
					}), _owner, _module, _d);
				}catch(e){
					console.error(e, _params);
					errf(e);
					_d.reject(e);
				}
			}
			/*function _decodeParams(_p, _pn, isModule){
				for (pn in _p) {
					if (_p.hasOwnProperty(pn)) {
						if(pn === "_riaswElements" || pn === "_riaswOriginalParams"){///必须跳过，否则会被当做 params 来创建。
							continue;
						}
						if(pn === "moduleMeta"){///必须过滤一下，只保留 $refObj 和 $refScript， 避免其他 property 当做 params 来创建。
							if(_p.moduleMeta.$refObj){
								_p.moduleMeta = {
									$refObj: _p.moduleMeta.$refObj
								};
							}else if(_p.moduleMeta.$refScript){
								_p.moduleMeta = {
									$refScript: _p.moduleMeta.$refScript
								};
							}else{
								continue;
							}
						}
						ppn = (_pn ? _pn + "." + pn : pn);
						p = _p[pn];
						if(rias.isObjectSimple(p)){
							if(p.$refObj){
								_o = rias.$obj(_module, p.$refObj, params.id + "[" + ppn + "]");///此时，有可能尚未有 _owner 实例，只能支持 _module 为 contextWidget
								if(_o != undefined){
									rias.setObject(pn, _o, _p);
								}else{
									_ref.push([p, ppn, -1, -1]);
									delete _p[pn];
								}
							}else if(p.$refScript){
								try{
									_o = rias.$script(_module, p.$refScript, params.id + "[" + ppn + "]");
								}catch(e){
									_o = undefined;
								}
								if(_o != undefined){
									rias.setObject(pn, _o, _p);
								}else{
									_ref.push([p, ppn, -1, -1]);
									delete _p[pn];
								}
							}else if(p._riaswType || p.declaredClass){
								ps.push([p, ppn, -1, -1, isModule]);
							}else{
								arguments.callee(p, ppn, isModule);
							}
						}else if(rias.isArray(p)){
							for(i = 0, l = p.length; i < l; i++){
								if(rias.isObjectSimple(p[i])){
									if(p[i].$refObj){//
										_o = rias.$obj(_module, p[i].$refObj, params.id + "[" + pn + "]");///此时，有可能尚未有 _owner 实例，只能支持 _module 为 contextWidget
										if(_o == undefined){
											_ref.push([p[i], ppn + "." + i, l, i]);
											/// TODO:zensst. 是否需要 undefined/delete？
										}else{
											p[i] = _o;
										}
									}else if(p[i].$refScript){//
										try{
											_o = rias.$script(_module, p[i].$refScript, params.id + "[" + pn + "]");
										}catch(e){
											_o = undefined;
										}
										if(_o == undefined){
											_ref.push([p[i], ppn + "." + i, l, i]);
										}else{
											p[i] = _o;
										}
									}else if(p[i]._riaswType || p[i].declaredClass){
										ps.push([p[i], ppn + "." + i, l, i, isModule]);
									}else{
										arguments.callee(p[i], ppn + "." + i, isModule);
									}
								}
							}
						}
					}
				}
			}*/

			//var _dt0 = new Date();
			if(rias.config.publishParse && rias.publish){
				var pParams = {
					params: _params
				};
				rias.publish("/rias/parse/start", [pParams]);
				///不应该处理 reject，如果需要，则应该在 reject 中返回 promise，否则会丢失 reject
				_d.then(
					function(result){
						rias.publish("/rias/parse/parsed", [pParams, result]);
						rias.publish("/rias/parse/done", [pParams, result]);
						return result;
					},
					function(e){
						rias.publish("/rias/parse/error", [pParams, e]);
						rias.publish("/rias/parse/done", [pParams, e]);
						return rias.newDeferredReject(e);
					}
				);
			}
			///不应该处理 reject，如果需要，则应该在 reject 中返回 promise，否则会丢失 reject
			//_d.then(function(w){
			//	console.debug("_createRiasw - " + (new Date() - _dt0) + " ms - " + (w ? w.id : w));
			//});
			if(_params){
				if(rias.isRiasObject(_params)){
					_d.resolve(_params);
					//return;
				}else if(ctor){
					params = rias.mixinDeep({}, _params);
					if(rias.is(_owner, rias.Destroyable)){
						params.ownerRiasw = _owner;
					}
					rias.decodeRiaswParams(params, params, "", _ref);///buildParams 不支持 $ref，且需要后期绑定，故应先 decodeRiaswParams
					if(rias.isFunction(ctor.buildParams)){
						params = ctor.buildParams(params);///此时，有可能尚未有 _owner 实例，只能支持 _module 为 contextWidget
					//}else{
					//	params = rias.mixinDeep({}, _params);
					}
					rias.when(params, function(params){
						///FIXME:zensst. 使用 refNode 后，id 会重复。
						var refNode = _dom.byId(params.srcNodeRef || params.id);

						delete params.srcNodeRef;
						//delete params._riaswType;
						//delete params._riaswIdInModule;
						///最好不在这里设置 params.owner，避免在下面的 params 自动创建中处理
						//params.owner = _ownerRiasw;
						//delete params.ownerRiasw;///强制使用 _ownerRiasw
						rias._deleDP(params, true);///保留 _riaswElements
						params._riaswParams = _params;///_riaswParams 只用于 设计器，不用于 newRiasw，前面 rias._deleDP 已经删除

						if(params._riaswIdInModule && _module[params._riaswIdInModule]){
							s = "Duplication _riaswIdInModule['" + params._riaswIdInModule + "'] in the module['" + _module.id + "']";
							params._riaswIdInModule = params._riaswIdInModule + "_duplicationId";///id 重复时，会造成循环，需要变更 id。
							_createError(s);
							return;
						}
						if(params._riaswAttachPoint && _owner[params._riaswAttachPoint]){
							s = "Duplication _riaswAttachPoint['" + params._riaswAttachPoint + "'] in the ownerRiasw['" + _owner.id + "']";
							params._riaswAttachPoint = params._riaswAttachPoint + "_duplicationId";///id 重复时，会造成循环，需要变更 id。
							_createError(s);
							return;
						}
						try{
							///后面需要引用 params.id
							params.id = refNode ? refNode.id :
								params.id ? params.id :
									params._riaswIdInModule ? (_module.id + "_" + params._riaswIdInModule) :
										_owner ? params._riaswAttachPoint ? _owner.id + "_" + params._riaswAttachPoint :
											rias.rt.getUniqueId(_owner.id + "_" + rias.rt._getUniqueCat(params)) :
											rias.rt.getUniqueId(_module.id + "_" + rias.rt._getUniqueCat(params), _module);
						}catch(e){
							_createError(e.message);
							return;
						}
						//_decodeParams(params, "", rias.isRiaswModuleParam(params));
						//rias.forEach(ps, function(_p){
						//	var _dp = rias.newDeferred("_createParamRiasw", rias.debugDeferredTimeout ? rias.defaultDeferredTimeout >> 2 : 0, function(){
						//		this.cancel();
						//	}, _p, {
						//		paramOwner: params.id
						//	});
						//	_dps.push(_dp);
						//	//此处 _ownerRiasw 用 params
						//	//此处可以不用mixinDeep
						//	_module.defer(function(){
						//		_requireRiaswCtor(_p[0]._riaswType || _p[0].declaredClass, errf).then(function(ctor){
						//			if(_p[4]){/// _p[4] 是 isModule
						//				_dp.resolve(_p[0]);
						//			}else{
						//				///params 中的 riasw 由 _obj 自己维护，不执行 placeRiasw()
						//				_createRiasw(ctor, _p[0], {
						//					id: params.id
						//				}, _module, _dp);
						//			}
						//		});
						//	});
						//	_dp.then(function(c){
						//		rias.setObject(_p[1], c, params);
						//	});
						//});
						//rias.all(_dps, rias.debugDeferredTimeout ? rias.defaultDeferredTimeout >> 1 : 0, function(arr, _p){
						//	this.cancel();
						//}, params).then(function(){
							var _obj;
							try {
								//params._riaswElements = _params._riaswElements;///前面 rias._deleDP 已经删除
								//refNode || (refNode = _dom.create("div", {style: params.style}, _owner.domNode, params.position));
								//_obj = meta.create(params, refNode, errf);
								_obj = rias.newRiasw(ctor, params, refNode, errf);
								_params.__riasrWidget = _obj;///给 设计值_params 设置运行期实例。
								//if(!rias.is(_owner, rias.Destroyable)){
								//	_owners.push([_obj, _owner]);
								//}
							}catch(e){
								s = "Error occurred when creating riasWidget: {id: " + params.id + ", _riaswType: " + params._riaswType + "}\n" + e.message;
								_createError(s);
								return;
							}
							if(!_obj){
								s = "Error occurred when creating riasWidget: {id: " + params.id + ", _riaswType: " + params._riaswType + "}";
								_createError(s);
								return;
							}
							rias.forEach(_ref, function(_p){//refs,
								refs.push([_p[0], _p[1], _p[2], _p[3], _obj]);
							});
							//console.debug("newRiasw - " + (new Date() - _dt0) + " ms - " + (_obj ? _obj.id : _obj));
							if(_obj.is("riasw.sys._Container")){
								if(params._riaswElements && ((rias.isArray(params._riaswElements) && params._riaswElements.length > 0) || rias.isString(params._riaswElements))){
									//_obj.defer(function(){
										_createRiasws(params._riaswElements, _obj, rias.isRiaswModule(_obj) ? _obj : _module, _obj, refs/*, _pi*/).then(function(c){
											if(c && c.errors){
												errf(c.errors);
											}
											_d.resolve(_obj);
										});
									//});
								}else{
									_d.resolve(_obj);
								}
							}else{
								_d.resolve(_obj);
							}
						//}, function(){
						//	s = "Error occurred when creating riasWidget: {id: " + params.id + ", _riaswType: " + params._riaswType + "}";
						//	_createError(s);
						//});
					});
				}else{
					s = "Error occurred when creating riasWidget: No Constructor of {id: " + _params.id + ", _riaswType: " + _params._riaswType + "}";
					_createError(s);
				}
			}else{
				s = "Error occurred when creating riasWidget: No Params.";
				_createError(s);
			}
		};

		_requireCtors(children, errf).then(function(){
			rias.forEach(children, function(child){
				if(child){
					///优化速度
					var _d = rias.newDeferred("_createRiasw", rias.debugDeferredTimeout ? rias.defaultDeferredTimeout >> 2 : 0, function(){
						this.cancel();
					}, child, ownerRiasw);
					ds.push(_d);
					if (rias.isRiasObject(child)){
						//有错，或者已经创建并绑定
						_d.resolve(child);
					}else{
						//m.defer(function(){
							_createRiasw(_getRiaswCtor(child._riaswType || child.declaredClass), child, ownerRiasw, m, _d);
						//});
					}
				}
			});
			rias.all(ds, rias.debugDeferredTimeout ? rias.defaultDeferredTimeout : 0, function(arr, children){
				this.cancel();
				rias.forEach(arr, function(r){
					if(!r.isFulfilled){
						console.debug(r);
					}
				});
				rias.forEach(children, function(r){
					console.debug(r);
				});
			}, children).then(function(widgets){
				/*var i, p, pl;
				//_owners = [[_obj, _owner]];
				for(i = 0; i < _owners.length; i++){
					pl = _owners[i];
					if(pl[0] && pl[1]){
						if(rias.isRiasw(pl[1])){
							p = pl[1];
						}else if(pl[1].id){
							p = rias.by(pl[1].id);
						}
						if(p || m || rias.desktop){
							(p || m || rias.desktop).own(pl[0]);
						}
					}
				}*/
				rias.forEach(widgets, function(w, index){
					try{
						//var _dt0 = new Date();
						if(rias.isRiasw(w)){
							if(container){
								if(rias.is(container, "riasw.sys._Container")){
									container.addChild(w, pi >= 0 ? pi + index : pi);
								}else if(rias.isDomNode(container)){
									w.placeAt(container, pi >= 0 ? pi + index : pi);
								}else{
									s = "The widget need a Container or a domNode as the container." + w.id;
									console.error(s);
									errf(s);
									if(ownerRiasw.is("riasw.sys._Container")){
										ownerRiasw.addChild(w, pi >= 0 ? pi + index : pi);
									}
								}
							}else{
								console.warn("The widget maybe need a Container or a domNode as the container." + w.id);
							}
							//}else{
							//	///暂时没有什么可以处理的。
						}
						//console.debug("placeAt - " + (new Date() - _dt0) + " ms - " + (w ? w.id : w));
					}catch(e){
						console.error(ownerRiasw.id + " addChild error: " + w.id, e.message, e);
						errf(e);
					}
				});
				d.resolve({
					widgets: widgets,
					ownerRiasw: ownerRiasw,
					module: m,
					errors: errs
				});
			}, function(e){
				d.resolve({
					widgets: undefined,
					ownerRiasw: ownerRiasw,
					module: m,
					errors: errs + "\n" + (e.message ? e.message : e)
				});
			});
		}, function(err){
			d.resolve({
				widgets: undefined,
				ownerRiasw: ownerRiasw,
				module: m,
				errors: errs + "\n" + (err.message ? err.message : err)
			});
		});
		return d.promise;
	}

	rias.parseRiasws = function(/*riasdChildren|riasWidget*/children, /*riasWidget*/ownerRiasw, /*DomNode|riasWidget*/container, position){
		if (rias.isString(children)){
			children = rias.fromJson(children);
		}
		if (children && !rias.isArray(children)){
			children = [children];
		}
		ownerRiasw = rias.by(ownerRiasw);
		if(!ownerRiasw){
			if(!rias.desktop){///避免缺少 rias.desktop
				console.error("no rias.desktop.");
				throw "no rias.desktop.";
			}
			console.error("rias.parseRiasws need a ownerRiasw, now, using rias.desktop.", children);
			ownerRiasw = rias.desktop;
		}
		var module = (rias.isRiaswModule(ownerRiasw) ? ownerRiasw : rias.ownerModuleBy(ownerRiasw)),///ownerRiasw 有可能是 params，需要用 ownerModuleBy
			_c,
			d = rias.newDeferred("parseRiasws", rias.defaultDeferredTimeout, function(children, ownerRiasw, module){
				///屏蔽 reject/cancel
				this.resolve({
					widgets: undefined,
					ownerRiasw: ownerRiasw,
					module: module,
					errors: "rias.parseRiasws timeout cancel."
				});
			}, children, ownerRiasw, module),
			refs = [];
		if(rias.is(container, "riasw.sys._Container")){
			_c = container;
		}else{
			/// 是 DomNode
			_c = rias.by(container);
			if(_c){
				_c = _c._getContainerRiasw();
			}
		}
		if(_c){
			_c._beforeUpdateSize(_c.id + " - beforeParse.");
		}
		d.then(function(result){
			/// _afterUpdateSize 需要优先执行。
			if(_c){
				_c._afterUpdateSize(_c.id + " - afterParse.", false);
			}
			rias.forEach(result.widgets, function(w){
				if(ownerRiasw._started && !w._started && rias.isFunction(w.startup)){
					w.startup();
				}
			});
		});

		function errf(result, e){
			if(e instanceof Error){
				result.errors += (result.errors ? "\n" : "") + e.message;
			}else if(e){
				result.errors += (result.errors ? "\n" : "") + e;
			}
		}
		_createRiasws(children, ownerRiasw, module, container, refs, position).then(function(result){
			var ref, _o,
				pn, pns = {};
			while(refs.length > 0){
				ref = refs.shift();
				try{
					/// ref = [obj[pn], pn, -1, -1, obj];
					if(module){
						///合并，在前面设置好 ref[1]，包含数组 i
						//if(ref[2] < 0){///非数组
							if(ref[0].$refObj){
								_o = rias.$obj(ref[4], ref[0].$refObj, ref[4].id + "[" + ref[1] + "]");
							}else if(ref[0].$refScript){
								_o = rias.$script(module, ref[0].$refScript, ref[4].id + "[" + ref[1] + "]");
							}
							if(_o == undefined){
								console.warn(ref[4].id, "params." + ref[1] + " = undefined.");
							}
							//ref[4].set(ref[1], _o);
							rias.setObject(ref[1], _o, ref[4]);
							pn = ref[1].split(".").shift();
							if(ref[4]["_set" + rias.upperCaseFirst(pn) + "Attr"]){
								pns[ref[4].id + "." + pn] = [ref[4], pn];
							}
						/*}else{///目前只支持 push，不支持 index。
							if(ref[0].$refObj){
								//_o = rias.getObject(ref[0].$refObj, 0, module) || rias.getObject(ref[0].$refObj);
								if(ref[0].$refObj === "module"){
									_o = module;
								}else if(ref[0].$refObj.indexOf("module.") >= 0){
									_o = rias.getObject(ref[0].$refObj.substring(7), 0, module);
								}else{
									_o = rias.getObject(ref[0].$refObj, 0, module) || rias.getObject(ref[0].$refObj);
								}
							}else if(ref[0].$refScript){
								try{
									_o = rias.$script(module, ref[0].$refScript, ref[0].id + "[" + ref[1] + "]");
								}catch(e){
									_o = undefined;
								}
							}
							if(_o == undefined){
								console.warn(ref[4].id, "params." + ref[1] + " = undefined.");
							}
							//ref[4][ref[1]].push(_o);
							//ref[4][ref[1]] = _o;
							rias.setObject(ref[1], _o, ref[4]);
						}*/
					}
					//if(rias.isRiasObject(ref[4])){
					//	i = ref[4];
					//	p = i.getParent ? i.getParent() : i._getContainerRiasw();
					//	if((!p || p._started && !i._started) && rias.isFunction(i.startup)){
					//		i.startup();
					//	}
					//}
				}catch(e){
					if(ref && rias.isRiasObject(ref[4])){
						errf(result, ref[4].id + "." + ref[1] + " - " + e.message);
					}else{
						errf(result, e);
					}
				}
			}
			for(pn in pns){
				if(pns.hasOwnProperty(pn)){
					_o = pns[pn];
					_o[0].set(_o[1], _o[0].get(_o[1]));
				}
			}
			d.resolve(result);
			return result;
		}, function(e){
			d.reject({
				widgets: undefined,
				ownerRiasw: ownerRiasw,
				module: module,
				errors: e
			});
			return e;
		});
		return d.promise;
	};

/// studio******************************************************************************///

	rias.studioHome = "http://www.riaeasy.com/";
	rias.studioVersion = {
		major: 2017, minor: "b", patch: 1, flag: "",
		revision: "2017",
		toString: function(){
			var v = dojo.version;
			return this.major + "." + this.minor + "." + this.patch + this.flag + " (" + this.revision + ")" +
				" (dojo:" + v.major + "." + v.minor + "." + v.patch + v.flag + " (" + v.revision + "))";
		}
	};
	rias.studioBuildtime = new Date("2017-5-1");
	rias.studioOwner = "成都世高科技有限公司";
	rias.studioUser = "成都世高科技有限公司";
	//rias.studioTitle = rias.i18n.sys.title + "(" + (rias.i18n.sys.shell) + ")";
	rias.studioTitle = rias.i18n.sys.title;
	rias.compareVersion = function(v1, v2){
		v1 = (v1 + "").split("(")[0].split(".");
		v2 = (v2 + "").split("(")[0].split(".");
		var i = 0,
			l = 4,///注意起止点，< 判断，不是 <=
			t1, t2;
		for(;i < l; i++){
			t1 = rias.toNumber(v1[i], 0);
			t2 = rias.toNumber(v2[i], 0);
			if(t1 < t2){
				return -1;
			}else if(t1 > t2){
				return 1;
			}
		}
		return 0;
	};
	rias.startupDesktop = function(params, refNode){
		var d = rias.newDeferred("startupDesktop", rias.defaultDeferredTimeout, function(){
			this.cancel();
		});
		if(rias.getObject("rias.desktop")){
			console.debug("The rias.desktop already exists when startupDesktop.", rias.desktop);
			d.resolve(rias.desktop);
		}else{
			rias.require([
				"dojo/i18n!appweb/nls/appi18n",
				"riasw/sys/Desktop"
			], function(appi18n, Desktop) {

				rias.i18n.app = appi18n;

				rias.theme.loadThemeCss([
					"app.css"
				], true);

				params = rias.mixinDeep(params, {
					id: _dom.docBody.id ? _dom.docBody.id : "desktop"
				});
				rias.desktop = rias.newRiasw(Desktop, params, refNode || _dom.docBody);

				rias.ready(1000, function(){
					if(rias.has("ie") < 10){
						rias.defer(function(){
							rias.message({
								_riaswIdInModule: "ie10",
								dialogType: "top",
								content: "为了得到更好的效果，请使用 ie10+ 或者 chrome/safari/firefox 等 HTML5 内核的浏览器。"
							});
						}, 50);
					}
					rias.desktop.startup();
					d.resolve(rias.desktop);
				});

			});
		}
		return d.promise;
	};

	//if(!rias.require.packs.gridx){
	//	rias.require.packs.gridx = {name: "gridx", location: "../gridx-1.3.7"};
	//}
	if(!rias.require.packs.dgrid){
		rias.require.packs.dgrid = {name: "dgrid", location: "../dgrid"};
	}
	if(!rias.require.packs.dstore){
		rias.require.packs.dstore = {name: "dstore", location: "../dstore"};
	}

	if(!rias.require.packs.orion){
		rias.require.packs.orion = {name: "orion", location: "../orion/orion"};
		rias.require.packs.webtools = {name: "webtools", location: "../orion/webtools"};
		rias.require.packs.javascript = {name: "javascript", location: "../orion/javascript"};
		rias.require.packs.csslint = {name: "csslint", location: "../orion/csslint", main: "csslint"};
		rias.require.packs.htmlparser2 = {name: "htmlparser2", location: "../orion/htmlparser2"};
		rias.require.packs.i18n = {name: "i18n", location: "../orion/requirejs", main: "i18n"};
	}

	rias.theme.loadTheme("rias");

	///需要延迟加载，以生效 host 中的 extend
	rias.require([
		"riasw/sys/Dialog"
	], function(Dialog){

		//args = {
		//	id: "",///如果有值，则先 rias.by
		//	parent: parent,
		//	around: around,
		//	popupPositions: ["below-centered", "above-centered", "after-centered", "before-centered"],//_dom.tooltipPositions
		//	content: content,
		//	contentType: -1/0/1/2("innerHTML"/"info"/"warn"/"error")内部使用
		//	innerHTML: innerHTML,
		//	moduleMeta: moduleMeta,
		//	caption: caption,
		//	actionBar: [
		//		"btnSubmit",
		//		{label: "cancel"}
		//	],
		//	closeDelay: 0,
		//	style: undefined

		//	resizable: true,
		//	maxable: false,
		//	minable: true
		//};
		function _showDialog(args) {
			var d, s;
			function _destroyExists(d){
				if(d){
					if(!args.reCreate){
						console.error(rias.substitute(rias.i18n.message.isExists, [s]));
						d.focus(null, true);
						return d;
					}
					console.debug(rias.substitute(rias.i18n.message.isExists, [s]));
					rias.destroy(d);
				}
			}
			args.ownerRiasw = (args.ownerRiasw != undefined ? args.ownerRiasw : rias.desktop);
			if(!args.ownerRiasw){
				console.error("_showDialog(args) must has a ownerRiasw in args.", args);
				throw new Error("_showDialog(args) must has a ownerRiasw in args.");
			}
			//args._riaswIdInModule = args._riaswIdInModule;
			if((args._riaswIdInModule || args._riaswAttachPoint) && args.ownerRiasw){
				if(args._riaswIdInModule){
					d = rias.isRiaswModule(args.ownerRiasw) ? args.ownerRiasw : rias.ownerModuleBy(args.ownerRiasw);///args.ownerRiasw 有可能是 params，需要用 ownerModuleBy
					s = d.id + "." + args._riaswIdInModule;
					d = d[args._riaswIdInModule];
					if(_destroyExists(d)){
						return d;
					}
				}
				if(args._riaswAttachPoint){
					s = args.ownerRiasw.id + "." + args._riaswAttachPoint;
					d = args.ownerRiasw[args._riaswAttachPoint];
					if(_destroyExists(d)){
						return d;
					}
				}
			}
			args.style = _dom.styleToObject(args.style);
			args.parent = (args.parent != undefined ? args.parent :
				rias.desktop);
			args.closable = (args.closable != undefined ? args.closable : true);
			args.resizable = (args.resizable != undefined ? args.resizable : "xy");
			args.maxable = (args.maxable != undefined ? args.maxable : false);
			//args.persist = (args.persist != undefined ? args.persist : 0);// 保持 类定义的值
			args.contentType = (args.contentType != undefined ? args.contentType : "none");
			args.popupArgs = rias.mixin({
				parent: args.parent,
				around: args.around ? args.around : args.x && args.y ? {x: args.x, y: args.y} : "center",
				popupPositions: args.popupPositions,
				maxHeight: args.maxHeight,
				padding: args.padding
			}, args.popupArgs);
			delete args.parent;
			delete args.around;
			delete args.popupPositions;
			delete args.maxHeight;
			delete args.padding;
			delete args.x;
			delete args.y;
			try{
				d = rias.newRiasw(Dialog, args);
				d.startup();
			}catch(e){
				console.error(e);
				//rias.error(e.message);
				rias.destroy(d);
			}
			return d;
		}
		function _toShowArgs(args, ownerRiasw, around, dialogType, contentType, actionType, caption, closeDelay, actionBar) {
			var _args;
			if(rias.isString(args)){
				_args = {
					content: args
				};
			}else{
				_args = rias.mixin({}, args);///因为有可能 content 中有实例，最好不用 mixinDeep，防止递归循环
			}
			if(around){
				_args.around = around;
			}
			if(ownerRiasw){
				_args.ownerRiasw = ownerRiasw;
			}
			if(rias.isString(_args.content)){
				_args.content = _args.content.replace(/\n/g, "<br/>");
			}
			_args.dialogType = (_args.dialogType != undefined ? _args.dialogType : dialogType);
			_args.contentType = (_args.contentType != undefined ? _args.contentType : contentType);
			_args.actionType = (_args.actionType != undefined ? _args.actionType : actionType);
			_args.restrictPadding = (_args.restrictPadding >= 0 ? _args.restrictPadding : _dom.defaultRestrict);
			if(!_args.caption){
				_args.caption = caption || rias.i18n.action.message;
			}
			//if(rias.isBoolean(closeDelay) || rias.isNumber(closeDelay)){
			//	_args.closeDelay = closeDelay;
			//}
			if(!_args.closeDelay && !_args.actionBar){
				_args.actionBar = actionBar;
			}
			return _args;
		}
		rias.showDialog = function(args, ownerRiasw, around) {
			if(!rias.isObjectSimple(args)){
				console.error("The rias.showDialog\'s parameter type must be Object.", args);
				//throw s;
			}
			return _showDialog(_toShowArgs(args, ownerRiasw, around));
		};
		rias.showModal = function(args, ownerRiasw, around) {
			if(!rias.isObjectSimple(args)){
				console.error("The rias.showModal\'s parameter type must be Object.", args);
				//throw s;
			}
			return _showDialog(_toShowArgs(args, ownerRiasw, around, "modal"));
		};
		rias.showSelect = function(args, ownerRiasw, around){
			var _args;
			if(!rias.isObjectSimple(args)){
				console.error("The rias.showSelect\'s parameter type must be Object.", args);
				//throw _args;
			}
			_args = rias.mixin({}, args);///因为有可能 content 中有实例，最好不用 mixinDeep，防止递归循环
			//_args.actionBar = _args.actionBar || [
			//	"btnSubmit",
			//	"btnCancel"
			//];
			return _showDialog(_toShowArgs(_args, ownerRiasw, around, "modal", "none", "select", rias.i18n.action.choose, 0, ["btnSubmit", "btnNo"]));
		};
		rias.showInput = function(args, ownerRiasw, around){
			var _args;
			if(rias.isString(args) || rias.isNumber(args)){
				_args = {
					value: args
				};
			}else{
				_args = rias.mixin({}, args);///因为有可能 content 中有实例，最好不用 mixinDeep，防止递归循环
			}
			_args.moduleMeta = "riasw/module/input";
			//_args.value = _args.value;
			//_args.actionBar = _args.actionBar || [
			//	"btnSubmit",
			//	"btnCancel"
			//];
			return _showDialog(_toShowArgs(_args, ownerRiasw, around, "modal", "none", "input", rias.i18n.action.input, 0, ["btnSubmit", "btnNo"]));
		};
		rias.hint = function(args, ownerRiasw, around) {
			var _args;
			if(rias.isString(args)){
				_args = {
					content: args
				};
			}else{
				_args = rias.mixin({}, args);///因为有可能 content 中有实例，最好不用 mixinDeep，防止递归循环
			}
			_args.movable = false;
			_args.showCaption = false;
			_args.resizable = false;
			_args.minSize = {
				w: "10em",
				h: "3em"
			};
			if(!_args.popupArgs){
				_args.popupArgs = {};
			}
			_args.popupArgs.lockPosition = true;
			return _showDialog(_toShowArgs(_args, ownerRiasw, around, "tip", "info", "hint", rias.i18n.action.message));
		};
		rias.message = rias.info = function(args, ownerRiasw, around) {
			return _showDialog(_toShowArgs(args, ownerRiasw, around, "win", "info", "hint", rias.i18n.action.message, undefined, ["btnSubmit"]));
		};
		rias.warn = function(args, ownerRiasw, around) {
			return _showDialog(_toShowArgs(args, ownerRiasw, around, "modal", "warn", "warn", rias.i18n.action.warn, undefined, ["btnSubmit"]));
		};
		rias.error = function(args, ownerRiasw, around) {
			return _showDialog(_toShowArgs(args, ownerRiasw, around, "modal", "error", "error", rias.i18n.action.error, undefined, ["btnSubmit"]));
		};
		rias.choose = function(args, ownerRiasw, around) {
			return _showDialog(_toShowArgs(args, ownerRiasw, around, "modal", "choose", "choose", rias.i18n.action.choose, 0, ["btnYes", "btnNo"]));
		};
		rias.confirm = function(args, ownerRiasw, around) {
			return _showDialog(_toShowArgs(args, ownerRiasw, around, "modal", "choose", "choose", rias.i18n.action.confirm, 0, ["btnYes", "btnNo"]));
		};
		rias.getSelectTreeModeInt = function(mode){
			if(rias.isString(mode)){
				if(mode === "leaf"){
					mode = 1;
				}else if(mode === "branch"){
					mode = 2;
				}else{
					mode = 0;
				}
			}
			if(mode >= 0 && mode < 3){
				return mode;
			}
			return 0;
		};
		rias.showAbout = function(around) {
			var formHTML = "<div class='about_container'>";
			formHTML += "<div class='about_owner'>" +
				rias.substitute(rias.i18n.sys.owner, [rias.desktop ? rias.desktop.desktopOwner : rias.studioOwner]) + "</div>";
			formHTML += "<div class='about_user'>" +
				rias.substitute(rias.i18n.sys.user, [rias.desktop ? rias.desktop.desktopUser : rias.studioUser]) + "</div>";
			var homeLink = (rias.desktop ? rias.desktop.desktopHome : rias.studioHome);
			homeLink = "<a href='" + homeLink + "' target='_blank'>" + homeLink + "</a>";
			formHTML += "<div class='about_home'>" +
				rias.substitute(rias.i18n.sys.home, [homeLink]) + "</div>";
			formHTML += "<div class='about_version'>" +
				rias.substitute(rias.i18n.sys.version, [rias.desktop ? rias.desktop.desktopVersion : rias.studioVersion]) + "</div>";
			formHTML += "<div class='about_date'>" +
				rias.substitute(rias.i18n.sys.buildDate, [rias.formatDatetime(rias.desktop ? rias.desktop.desktopBuildtime : rias.studioBuildtime, "")]) + "</div>";
			//var revisionLink = "<a href='" + rias.studioHome + "' target='_blank'>" + rias.studioVersion  + "</a>";
			//formHTML += "<div class='about_build'>" + rias.substitute(rias.i18n.sys.build, [revisionLink]) + "</div>";
			formHTML += "</div>";
			return rias.message({
				dialogType: "modal",
				_riaswIdInModule: "about",
				resizable: false,
				caption: (rias.desktop ? rias.desktop.desktopTitle : rias.i18n.sys.about),
				contentType: -1,
				content: formHTML
			}, rias.desktop, around);
		};

		rias.has.add("riasbi", 0);
		if(rias.has("riasbi") && !(rias.has("ie") < 9)){
			rias.require.packs.riasbi = {
				name: "riasbi",
				location: "../riasbi",
				main: "main"
			};
			//rias.defer(function(){///优化加载速度
			//	rias.require([
			//		"riasw/riaswBase",
			//		"riasbi/riasbiCommon"
			//	], function(rias){
			//	});
			//}, 20);
		}
		rias.has.add("riasd", 0);
		if(rias.has("riasd") && !(rias.has("ie") < 11)){
			rias.require.packs.riasd = {
				name: "riasd",
				location: "../riasd",
				main: "main"
			};
		}

		//_dInitStudio.resolve(rias);

	});

	return rias;

});