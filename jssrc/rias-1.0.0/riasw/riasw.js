
//RIAStudio Client Runtime(rias) in Browser.

define([
	"rias/riasw/hostDijit",
	"rias/riasw/html",
	"dojo/i18n!rias/riasw/nls/riaswi18n",
	"rias/riasw/riaswMappers"
], function(rias, riasHtml, riaswi18n, riaswMappers) {

	rias.getObject("rias.riasw", true);

	rias.i18n.riasw = riaswi18n;

	rias.autoToggleDuration = 500;

///kernal******************************************************************************///

	///rias.by 可以替代 registry.byId 和 registry.byNode 和 registry.getEnclosingWidget
	rias.by = function(/*String|DOMNode|Dijit|riasWidget*/any, /*Object*/context){
		if(!any){
			return undefined;
		}
		var w;
		if(rias.isObjectSimple(any)){
			if(any.$refObj){
				any = rias.by(any.$refObj, context) || any.$refObj;
			}
			if(any.$refScript){
				any = rias.$runByModule(context, any.$refScript);
			}
		}
		if(rias.isString(any)){
			if(any.indexOf("module.") >= 0){
				if(context){
					if(rias.isRiaswModule(context)){
						w = rias.getObject(any.substring(7), 0, context);
					}else if(context._riasrModule){
						w = rias.getObject(any.substring(7), 0, context._riasrModule);
					}else{
						w = undefined;
					}
				}else{
					w = undefined;
				}
			}else if(any.indexOf("context.") >= 0){
				if(context){
					w = rias.getObject(any.substring(8), 0, context);
				}else{
					w = undefined;
				}
			}else{
				w = rias.getObject(any, false, context);
				//if(!w && !/^module\.|^context\./.test(any)){
				if(!w){
					w = (rias.webApp && rias.webApp.byId && rias.webApp.byId(any)) || rias.registry.byId(any)
						|| rias.dom.byId(any)
						|| rias.getObject(any);
				}
			}
			any = w;
		}
		if(rias.isDomNode(any)){
			any = any._riasrWidget || rias.registry.byNode(any) || rias.registry.getEnclosingWidget(any);
		}
		if(rias.isRiasw(any)){
			return any;
		}else if(rias.isDijit(any)){
			w = _getRiaswCtor(any.declaredClass);
			if(w){
				any._initRiasW({
					_riaswType: w.prototype.declaredClass
				});
				return any;
			}
		}
		return undefined;
	};
	rias.orDomNode = function(/*String|DOMNode|Dijit|riasWidget*/any, /*Object*/context){
		var node = rias.dom.byId(any);
		if(node){
			return node;
		}
		node = rias.by.apply(this, arguments || []);
		if(node){
			return node.domNode;
		}
		return undefined;
	};
	/*rias.orFocusNode = function(any, context){
		//if(rias.isRiasw(any._riasrWidget)){
		//}
		var node = rias.dom.byId(any);
		if(node){
			return node;
		}
		node = rias.by.apply(this, arguments || []);
		if(node){
			return node.domNode;
		}
		return undefined;
	};*/
	rias.byUntil = function(/*String|DOMNode|Dijit|riasWidget*/any, /*Object*/context){
		var w = rias.by(any, context);
		/*if(!w){
			w = rias.dom.byId(any);
			if(w){
				w = arguments.callee(w.parentNode, context);
			}
		}*/
		return w;
	};
	rias.riasrParentBy = function(/*String|DOMNode|Dijit|riasWidget*/any, /*Object*/context){
		var w = rias.byUntil(any, context);
		if(w){
			w = w._riasrParent;
		}
		return w;
	};
	rias.riasrModuleBy = function(/*String|DOMNode|Dijit|riasWidget*/any, /*Object*/context){
		var w = rias.byUntil(any, context);
		if(w){
			w = w._riasrModule;
		}
		return w;
	};
	rias.ownerModuleBy = function(/*String|DOMNode|Dijit|riasWidget*/any, /*Object*/context){
		var w = rias.byUntil(any, context);
		if(w){
			if(!rias.isRiaswModule(w)){
				w = w._riasrModule;
			}
		}
		return w;
	};

	rias.riasdParams = {
		moduleMeta: "",
		_riaswVersion: "1.0",
		_riaswParams: {},
		_riaswType: "",
		_riaswIdOfModule: "",
		_riaswModuleMeta: {},
		_riaswChildren: [],
		_riasrCreated: false,
		_riasrOwner: undefined,
		_riasrElements: [],
		_riasrParent: undefined,
		_riasrModule: undefined,
		_riasrWidget: undefined//,
		//_riaspParent: undefined,
		//_riaspChildren: []
	};

	rias.decodeRiaswParam = function(module, params, name, pathname){
		///TODO:zensst. 未实现 params 中包含 _riaswType。
		var p,
			_o, i, l;
		if(!params || !name || !params[name]){
			return;
		}
		p = params[name];
		if(!module){
			module = rias.webApp;
		}
		if(rias.isRiasw(p)){
			if(!p._riasrModule || p._riasrModule !== module){
				p._riasrModule = module;
			}
		}else if(rias.isObjectSimple(p)){
			if(p.$refObj){
				//_o = rias.getObject(p.$refObj, 0, module) || rias.getObject(p.$refObj);
				if(p.$refObj === "module"){
					_o = module;
				}else if(p.$refObj.indexOf("module.") >= 0){
					_o = rias.getObject(p.$refObj.substring(7), 0, module);
				}else{
					_o = rias.getObject(p.$refObj, 0, module) || rias.getObject(p.$refObj);
				}
				params[name] = _o;
				if(_o == undefined){
					console.warn(module.id, pathname + " = undefined.");
				}
			}else if(p.$refScript){
				try{
					_o = rias.$runByModule(module, p.$refScript, module.id + "[" + pathname + "]");
				}catch(e){
					_o = undefined;
				}
				params[name] = _o;
				if(_o == undefined){
					console.warn(module.id, pathname + " = undefined.");
				}
			}else{
				rias.decodeRiaswParams(module, p, pathname);
			}
		}else if(rias.isArray(p)){
			for(i = 0, l = p.length; i < l; i++){
				if(rias.isRiasw(p[i])){
					if(!p[i]._riasrModule || p[i]._riasrModule === rias.webApp){
						p[i]._riasrModule = module;
					}
				}else if(rias.isObjectSimple(p[i])){
					if(p[i].$refObj){
						//_o = rias.getObject(p[i].$refObj, 0, module) || rias.getObject(p[i].$refObj);
						if(p[i].$refObj === "module"){
							_o = module;
						}else if(p[i].$refObj.indexOf("module.") >= 0){
							_o = rias.getObject(p[i].$refObj.substring(7), 0, module);
						}else{
							_o = rias.getObject(p[i].$refObj, 0, module) || rias.getObject(p[i].$refObj);
						}
						p[i] = _o;
						if(_o == undefined){
							console.warn(module.id, pathname + "." + i + " = undefined.");
						}
					}else if(p[i].$refScript){
						try{
							_o = rias.$runByModule(module, p[i].$refScript, module.id + "[" + pathname + "." + i + "]");
						}catch(e){
							_o = undefined;
						}
						p[i] = _o;
						if(_o == undefined){
							console.warn(module.id, pathname + "." + i + " = undefined.");
						}
					}else{
						rias.decodeRiaswParams(module, p[i], pathname + "." + i);
					}
				}
			}
		}
		return p;
	};
	rias.decodeRiaswParams = function(module, params, pathname){
		///TODO:zensst. 未实现 params 中包含 _riaswType。
		var pn, ppn;
		for (pn in params) {
			if(pn == "_riaswChildren" || pn == "_riaswOriginalParams"){///必须跳过，否则会被当做 params 来创建。
				continue;
			}
			if(pn == "moduleMeta"){///必须过滤一下，避免当做 params 来创建。
				if(params.moduleMeta.$refObj){
					params.moduleMeta = {
						$refObj: params.moduleMeta.$refObj
					}
				}else if(params.moduleMeta.$refScript){
					params.moduleMeta = {
						$refScript: params.moduleMeta.$refScript
					}
				}else{
					continue;
				}
			}
			if (params.hasOwnProperty(pn)) {
				ppn = (pathname ? pathname + "." + pn : pn);
				rias.decodeRiaswParam(module, params, pn, ppn);
			}
		}
		return params;
	};
	var _xtor = new Function;
	rias.createRiasw = function(/*Constructor*/widgetCtor, params, /*DOMNode|String?*/refNode, errCall){
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
						if(++i == l){
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
		var _ctor, ctor, w, owner;
		if(rias.isFunction(widgetCtor)){
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
			if(rias.isFunction(errCall)){
				rias.hitch(this, errCall)(new Error("No constructor found.\n" + rias.toJson(params, true)));
			}
			return undefined;
		}
		//var bases = rias.clone(_ctor._meta.bases),
		//	chains = _ctor._meta.chains;//, args = rias.toArray(arguments, 1);
		///只修改 params.id，无需用 mixinDeep()。
		params = rias.mixin({_riaswType: _ctor.prototype.declaredClass}, params);
		try{
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
					owner = rias.by(params.ownerRiasw);
				//}
				//delete params.ownerRiasw;
			}
			if(!params._riasrModule && owner){
				if(rias.isRiaswModule(owner)){
					params._riasrModule = owner;
				}else if(rias.isRiaswModule(owner._riasrModule)){
					params._riasrModule = owner._riasrModule;
				}
			}
			if(!params.id){
				params.id = refNode && refNode.id ? refNode.id :
					params._riasrModule && params._riaswIdOfModule ? (params._riasrModule.id + "_" + params._riaswIdOfModule) :
					rias.getUniqueId(rias.webApp.id + "_" + rias._getUniqueCat(params, true), rias.webApp);
			}
			w = new ctor(params, refNode);
			try{
				if(w.postscript){
					w.postscript.apply(w, [params, refNode]);
				}
			}catch(e){
				console.error(rias.captureStackTrace(e), w);
				if(rias.isFunction(errCall)){
					rias.hitch(this, errCall)(e);
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
				if(params._riaswChildren){
					//rias.bind(params._riaswChildren, w);
				}
			}catch(e){
				console.error(rias.captureStackTrace(e), params, w);
				if(rias.isFunction(errCall)){
					rias.hitch(this, errCall)(e);
				}
			}*/
			w = new _ctor(params, refNode);
			if(w && w._riasrCreateError && w._riasrCreateError.length){
				if(rias.isFunction(errCall)){
					rias.forEach(w._riasrCreateError, function(e){
						rias.hitch(this, errCall)(e);
					});
				}
			}
		}catch(e){
			/*if(e.message.indexOf("Tried to register widget") < 0){
				w = rias.by(params.id);
				if(w && rias.isFunction(w.destroyRecursive)){
					w.destroyRecursive();
				}
			}*/
			//console.error("Error occurred when creating dijitWidget, params: " + params + "\n" + e.message, e, params);
			console.error(rias.captureStackTrace(e), params);
			if(w && params.id){
				if(w == rias.registry._hash[params.id]){
					delete rias.registry._hash[params.id];
				}
			}
			w = undefined;
			if(rias.isFunction(errCall)){
				rias.hitch(this, errCall)(e);
			}
		}
		return w;
	};

	rias.queryRiasdParams = function(/*riasWidget*/root, /*String*/name, /*Object*/value){
		var items = (rias.isArray(root) ? root : [root]),
			i, l = items.length,
			w, r = [];
		for(i = 0; i < l; i++){
			if(w = items[i]){
				if(w[name] && (value == undefined || w[name] === value)){
					r.push(w);
				}
				r = r.concat(arguments.callee(w._riaswChildren, name, value));
			}
		}
		return r;
	};

	var _riaswMappers = {};
	function _getRiaswMapper(/*riaswType|refType|riasdChildren.item|riasWidget*/w, errCall){
		var s,
			t = w ? rias.isString(w) ? w : (w._riaswType || w.declaredClass) : "",
			mp = (!t) ? undefined : rias.getObject(t, false, _riaswMappers);
		if(!t){
			s = "Lose _riaswType/declaredClass param.";
			console.error(s, w);
			if(rias.isFunction(errCall)){
				rias.hitch(this, errCall)(new Error(s + w));
			}
		}else if(!mp){
			s = "No riaswMapper found. (" + t + ")";
			console.error(s, w);
			if(rias.isFunction(errCall)){
				rias.hitch(this, errCall)(new Error(s + w));
			}
		}else{
			mp = mp._mapper;
		}
		return mp;
	}
	rias.getRiaswMappers = function(/*Int*/cat, /*Object*/keyValue){
		var r = [],
			c = rias.toInt(cat, -1);
		function _get(m){
			var type, item, key, add;
			for(type in m){
				if (m.hasOwnProperty(type)) {
					item = m[type];
					if(c !== 0 && item._cat !== c){
						continue;
					}
					if(!item._ref){
						r.concat(_get(item));
					}
					if(item._ref !== 1){
						continue;
					}
					add = true;
					for(key in keyValue){
						if (item._mapper.hasOwnProperty(key)) {
							if(item._mapper[key] !== keyValue[key]){
								add = false;
								//continue;
							}
						}else{
							add = false;
							//continue;
						}
					}
					if(add){
						r.push(item._mapper);
					}
				}
			}
		}
		_get(_riaswMappers);
		return r;
	};
	function _setRiaswMappers(/*Int|String*/cat, /*Object|Array?*/newMappers, /*Int*/clearCat){
		//clearCat === 0，全部清空, 其他则清空该 cat
		var _new = [], _c, _item;
		if(rias.isNumber(clearCat)){
			if(clearCat == false){
				_riaswMappers = {};
			}else{
				for(_item in _riaswMappers){
					if(_item._cat === clearCat){
						delete _riaswMappers[_item];
					}
				}
			}
		}
		if(rias.isArray(newMappers)){
			_new = newMappers.concat();
		}else if (newMappers){
			_new = _new.push(newMappers);
		}
		rias.forEach(_new, function(item){
			if(!rias.isArray(item.riaswType)){
				item.riaswType = [item.riaswType];
			}
			_c = 1;
			rias.forEach(item.riaswType, function(t){
				rias.setObject(t, {_cat: cat, _ref: _c++, _mapper: item}, _riaswMappers);
			});
		});
		return _riaswMappers;
	}
	_setRiaswMappers(1, riaswMappers, 0);
	rias.registerRiaswMappers = function(/*Object|Array?*/newMappers){
		var cat = 2,
			mapper;
		if(arguments.length === 2){
			cat = arguments[0];
			mapper = arguments[1];
		}else{
			mapper = newMappers;
		}
		//if(!rias.isNumber(cat)){
		//	console.error("the cat must be Integer.");
		//	return;
		//}
		//if(cat < 2){
		//	console.error("the cat must greater 1.");
		//	return;
		//}
		_setRiaswMappers(cat, mapper);
	};

	function _getRiaswCtor(/*riaswType|refType|riasdChildren.item|riasWidget*/w, errCall){
		var t = w ? rias.isString(w) ? w : (w._riaswType || w.declaredClass) : "",
			md, s;
		if(!t){
			s = "Lose _riaswType/declaredClass param.";
			console.error(s, w);
			if(rias.isFunction(errCall)){
				rias.hitch(this, errCall)(new Error(s + w));
			}
		}else {
			md = rias.getObject(t, false);
		}
		return md;
	}
	function _requireRiasCtor(/*String*/riaswType, /*Array*/requires, errCall){
		var s;
		var d = rias.newDeferred("_requireRiasCtor", rias.defaultDeferredTimeout >> 1, function(){
				this.cancel();
			}),
			t = rias.isString(riaswType) ? riaswType :
				rias.isRiasw(riaswType) || rias.isDijit(riaswType) ? riaswType._riaswType || riaswType.declaredClass : undefined,
			ctor = _getRiaswCtor(t);
		function rerror(e){
			if(e instanceof Error){
				s = e.message;
				console.error(e.message, e);
			}else{
				s = "_requireRiasCtor error. (" + riaswType + ")";
				console.error(s);
			}
			if(rias.isFunction(errCall)){
				rias.hitch(this, errCall)(new Error(s));
			}
			d.resolve(undefined);
		}

		if(ctor){
			d.resolve(ctor);
		}else{
			var r = _getRiaswMapper(t);
			if (!r) {
				rerror("The riaswMapper of (" + riaswType + ") not found.");
			}else{
				r = r.requires;
				if (!r) {
					rerror("riaswMapper of " + riaswType + " has no requires.");
				}else{
					if(!rias.isArray(r)){
						r = [r];
					}
					rias.require(r, function(ctor){
						if(ctor){
							//r = rias.isString(requires) ? [requires] : rias.isArray(requires) ? requires : [];
							//if(r.length > 0){
							//	rias.require(r, function(){
							//		d.resolve(ctor);
							//	});
							//}else{
								d.resolve(ctor);
							//}
						}else{
							rerror("No riaswMetadata required. (" + riaswType + ")");
						}
					});
				}
			}
		}
		return d.promise;
	}
	rias.requireRiaswCtor = function(riaswType, errf){
		function _errf(e){
			if(e instanceof Error){
				if(errf){
					errf(e.message);
				}else{
					console.error(e.message);
				}
			}else if(e){
				if(errf){
					errf(e);
				}else{
					console.error(e);
				}
			}
		}
		return _requireRiasCtor(riaswType, [], _errf);
	};

	function _createRiasws(/*riasdChildren*/children, /*String|DOMNode|Dijit|riasWidget*/ownerRiasw, /*String|riaswModule|rias.webApp*/module,
								  /*Array*/refs, /*Array*/pp, pi){
		//注意，不能修改 child 的内容值，及 metadata 的内容值
		ownerRiasw = rias.by(ownerRiasw) || rias.dom.byId(ownerRiasw) || rias.webApp;
		var d = rias.newDeferred("_createRiasws", rias.defaultDeferredTimeout >> 1, function(children, ownerRiasw){
				this.cancel();
			}, children, ownerRiasw),
			ds = [], _owners = [],
			m = rias.by(module),
			errs = "", s;
		function errf(e){
			if(e instanceof Error){
				errs += (errs ? "\n" : "") + e.message;
			}else if(e){
				errs += (errs ? "\n" : "") + e;
			}
		}
		pp = pp || [];
		//if(!m || ((m._riaswType !== 'rias.riasw.studio.Module')&&(m._riaswType !== 'rias.riasw.studio.Page'))){
		if(!m || !rias.isRiasw_Module(m)){
			s = "The module(" + (m ? m.id : m) + ") is not a Module.";
			console.error(s, m);
			errf(s);
			d.resolve(m);
			return d.promise;
		}

		function _placeRiasw(_obj, _owner, _pp, index){
			if(_owner){
				try{
					if(rias.isDijit(_obj) && (rias.isDijit(_owner) || rias.isDomNode(_owner))){
						///没有 parent 或者 prent 不是 owner，则不 resize
						//_obj.placeAt(_obj.parent || _owner, _obj.position || index, !_obj.parent || _obj.parent === _owner);
						_obj.placeAt(_obj.parent || _owner, _obj.position || index);
					//}else{
					//	///暂时没有什么可以处理的。
					}
				}catch(e){
					console.error(e.message, rias.captureStackTrace(e), _obj);
					errf(e);
				}
			}
		}
		function _createChildren(_obj, _children, _module, _d){
			if(rias.isRiaswModule(_obj)){///rias.riasw.studio.Module不创建 _riaswChildren，而是 _loadModuleMeta。
				_d.resolve(_obj);
			}else if (_children
				&& (rias.isString(_children) || (rias.isArray(_children) && _children.length > 0))){
				var _pp = [],
					_pi = (_obj.containerNode && _obj.containerNode.childNodes && _obj.containerNode.childNodes.length > 0)
						? _obj.containerNode.childNodes.length : 0;
				for(var i = 0; i < _pi; i++){
					if(_obj.containerNode.childNodes[i].nodeType === 1){
						_pp.push(_pp.length);
					}
				}
				_createRiasws(_children, _obj, _module, refs, _pp, _pi).then(function(c){
					if(c && c.errors){
						errf(c.errors);
					}
					_d.resolve(_obj);
				});
			}else{
				_d.resolve(_obj);
			}
		}
		var _createRiasw = function(ctor, _params, _ownerRiasw, _module, _d, _pp, index){
			var params,
				pn, ppn, p, ps = [], _dps = [], _ref = [], _o, i, l, _p;
			function _createError(message){
				//s = "Error occurred when creating riasWidget: {id: " + params.id + ", _riaswType: " + _params._riaswType + "}";
				console.error(message, _params);
				errf(message);
				//_d.resolve(undefined);
				///需要关联 _params._riasrWidget，不能用 Mixin({}, _params)
				_createRiasw(_getRiaswCtor("rias.riasw.studio.DefaultError"), rias.mixin(rias.isObjectExact(_params) ? _params : {}, {
					_riaswType: "rias.riasw.studio.DefaultError",
					errorMessage: message,
					_riaswOriginalParams: rias.mixinDeep({}, _params)///_params 已经被改变，需要用 mixinDeep
				}), _ownerRiasw, _module, _d, _pp, index);
			}
			function _decodeParams(_p, _pn){
				for (pn in _p) {
					if(pn == "_riaswChildren" || pn == "_riaswOriginalParams"){///必须跳过，否则会被当做 params 来创建。
						continue;
					}
					if(pn == "moduleMeta"){///必须过滤一下，避免当做 params 来创建。
						if(_p.moduleMeta.$refObj){
							_p.moduleMeta = {
								$refObj: _p.moduleMeta.$refObj
							}
						}else if(_p.moduleMeta.$refScript){
							_p.moduleMeta = {
								$refScript: _p.moduleMeta.$refScript
							}
						}else{
							continue;
						}
					}
					if (_p.hasOwnProperty(pn)) {
						ppn = (_pn ? _pn + "." + pn : pn);
						p = _p[pn];
						if(rias.isRiasw(p)){
							if(!p._riasrModule || p._riasrModule === rias.webApp){
								p._riasrModule = _module;
							}
						}else if(rias.isObjectSimple(p)){
							if(p.$refObj){
								if(p.$refObj === "module"){
									_o = _module;
								}else if(p.$refObj.indexOf("module.") >= 0){
									_o = rias.getObject(p.$refObj.substring(7), 0, _module);
								}else{
									_o = rias.getObject(p.$refObj, 0, _module) || rias.getObject(p.$refObj);
								}
								if(_o != undefined){
									rias.setObject(pn, _o, _p);
								}else{
									_ref.push([p, ppn, -1, -1]);
									delete _p[pn];
								}
							}else if(p.$refScript){
								try{
									_o = rias.$runByModule(_module, p.$refScript, params.id + "[" + ppn + "]");
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
								//p.id = p.id || rias.getUniqueId((_params.id || _params._riaswType.split('.').slice(-1)) + "_" + t.split('.').slice(-1), _module);
								//p.id = p.id ? p.id : p._riaswIdOfModule ? (_module.id + "_" + p._riaswIdOfModule) :
								//	rias.getUniqueId(_p.id + "_" + rias._getUniqueCat(p), _module);
								if(!p._riasrModule){
									p._riasrModule = _module;
								}
								ps.push([p, ppn, -1, -1]);
							}else{
								arguments.callee(p, ppn);
							}
						}else if(rias.isArray(p)){
							for(i = 0, l = p.length; i < l; i++){
								if(rias.isRiasw(p[i])){
									if(!p[i]._riasrModule || p[i]._riasrModule === rias.webApp){
										p[i]._riasrModule = _module;
									}
								}else if(rias.isObjectSimple(p[i])){
									if(p[i].$refObj){//
										//_o = rias.getObject(p[i].$refObj, 0, _module) || rias.getObject(p[i].$refObj);
										if(p[i].$refObj === "module"){
											_o = _module;
										}else if(p[i].$refObj.indexOf("module.") >= 0){
											_o = rias.getObject(p[i].$refObj.substring(7), 0, _module);
										}else{
											_o = rias.getObject(p[i].$refObj, 0, _module) || rias.getObject(p[i].$refObj);
										}
										if(_o == undefined){
											_ref.push([p[i], ppn + "." + i, l, i]);
										}else{
											p[i] = _o;
										}
									}else if(p[i].$refScript){//
										try{
											_o = rias.$runByModule(_module, p[i].$refScript, params.id + "[" + pn + "]");
										}catch(e){
											_o = undefined;
										}
										if(_o == undefined){
											_ref.push([p[i], ppn + "." + i, l, i]);
										}else{
											p[i] = _o;
										}
									}else if(p[i]._riaswType || p[i].declaredClass){
										//p[i].id = p[i].id ? p[i].id : p[i]._riaswIdOfModule ? (_module.id + "_" + p[i]._riaswIdOfModule) :
										//	rias.getUniqueId(_p.id + "_" + rias._getUniqueCat(p[i]), _module);
										if(!p[i]._riasrModule){
											p[i]._riasrModule = _module;
										}
										ps.push([p[i], ppn + "." + i, l, i]);
									}else{
										arguments.callee(p[i], ppn + "." + i);
									}
								}
							}
						}
					}
				}
			}

			if(_params){
				if(rias.isRiasw(_params)){
					_placeRiasw(_params, _ownerRiasw, _pp, index);
					_d.resolve(_params);
					//return;
				}else if (rias.isDijit(_params)){
					_placeRiasw(_params, _ownerRiasw, _pp, index);
					_d.resolve(_params);
					//return;
				}else if(ctor && ctor._riasdMeta){
					/*var params = rias.isFunction(ctor._riasdMeta.defaultParams) ?
							rias.mixinDeep({}, ctor._riasdMeta.defaultParams(_params)) :
							rias.mixinDeep({}, ctor._riasdMeta.defaultParams, _params),//不应该修改 meta.defaultParams，故mixinDeep({},..}
						refNode = rias.dom.byId(params.refNodeId || params.id);*/

					var pd;
					if(rias.isFunction(ctor._riasdMeta.defaultParams)){
						pd = ctor._riasdMeta.defaultParams(_params, _module);
					}else{
						pd = rias.mixinDeep({}, ctor._riasdMeta.defaultParams, _params);
					}
					rias.when(pd, function(p){
						params = rias.mixinDeep({}, p);
						///FIXME:zensst. 使用 refNode 后，id 会重复。
						var refNode = rias.dom.byId(params.refNodeId || params.id);

						delete params.refNodeId;
						//delete params._riaswType;
						//delete params._riaswIdOfModule;
						///最好不在这里设置 params.owner，避免在下面的 params 自动创建中处理
						//params.owner = _ownerRiasw;
						delete params.ownerRiasw;///强制使用 _ownerRiasw
						rias._deleDP(params);

						if(_params._riaswIdOfModule && _module[_params._riaswIdOfModule]){
							s = "Duplication _riaswIdOfModule['" + _params._riaswIdOfModule + "'] in module['" + _module.id + "']";
							_params._riaswIdOfModule = _params._riaswIdOfModule + "_duplicationId";///id 重复时，会造成循环，需要变更 id。
							_createError(s);
							return;
						}
						try{
							///后面需要引用 params.id
							params.id = refNode ? refNode.id :
								params.id ? params.id :
									_params._riaswIdOfModule ? (_module.id + "_" + _params._riaswIdOfModule) :
										_ownerRiasw ? rias.getUniqueId(_ownerRiasw.id + "_" + rias._getUniqueCat(_params)) :
											rias.getUniqueId(_module.id + "_" + rias._getUniqueCat(_params), _module);
						}catch(e){
							_createError(e.message);
							return;
						}
						_decodeParams(params);
						rias.forEach(ps, function(_p){
							var _dp = rias.newDeferred();
							_dps.push(_dp);
							//此处 _ownerRiasw 用 _params
							//此处可以不用mixinDeep
							_requireRiasCtor(_p[0]._riaswType || _p[0].declaredClass, _p[0].requires, errf).then(function(ctor){
								///params 中的 riasw 由 _obj 自己维护，不执行 placeRiasw()
								_createRiasw(ctor, _p[0], {id: params.id}, _module, _dp, _pp, index);
							});
							_dp.then(function(c){
								/*if(_p[2] < 0){
									params[_p[1]] = c;
								}else{
									params[_p[1]][_p[3]] = c;
								}*/
								rias.setObject(_p[1], c, params);
							});
						});
						rias.all(_dps, rias.defaultDeferredTimeout >> 1, function(arr, _p){
							this.cancel();
						}, params).then(function(){
							var _obj;
							try {
								params._riaswParams = _params;
								params._riaswChildren = _params._riaswChildren;///前面 rias._deleDP 已经删除
								params._riasrModule = _module;
								if(rias.isInstanceOf(_ownerRiasw, rias.Destroyable)){
									params.ownerRiasw = _ownerRiasw;
								}
								//refNode || (refNode = rias.dom.create("div", {style: params.style}, _ownerRiasw.domNode, params.position));
								//_obj = meta.create(params, refNode, errf);
								_obj = rias.createRiasw(ctor, params, refNode, errf);
								_params._riasrWidget = _obj;///给 params(_params) 设置运行期实例。
								if(!rias.isInstanceOf(_ownerRiasw, rias.Destroyable)){
									_owners.push([_obj, _ownerRiasw]);
								}
							}catch(e){
								s = "Error occurred when creating riasWidget: {id: " + params.id + ", _riaswType: " + _params._riaswType + "}\n" + e.message;
								_createError(s);
								return;
							}
							if(!_obj){
								s = "Error occurred when creating riasWidget: {id: " + params.id + ", _riaswType: " + _params._riaswType + "}";
								_createError(s);
								return;
							}
							rias.forEach(_ref, function(_p){//refs,
								refs.push([_p[0], _p[1], _p[2], _p[3], _obj]);
							});
							/*try{
								if(!_obj.id){
									///简化 id
									//_obj.id = _obj.id || rias.getUniqueId(_ownerRiasw.id + "_" + _params._riaswType.split('.').slice(-1), _module);
									//_obj.id = rias.getUniqueId(_ownerRiasw.id + "_" + rias._getUniqueCat(_params), _module);
								}
							}catch(e){
								_createError(e.message);
								return;
							}*/
							//function _createChildren(_obj, _params, _ownerRiasw, _module, _d)
							_placeRiasw(_obj, _ownerRiasw, _pp, index);
							_createChildren(_obj, _params._riaswChildren, _module, _d);
						}, function(){
							s = "Error occurred when creating riasWidget: {id: " + params.id + ", _riaswType: " + _params._riaswType + "}";
							_createError(s);
						});
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

		if (rias.isString(children)){
			children = rias.fromJson(children);
		}
		if (children && !rias.isArray(children)){
			children = [children];
		}
		rias.forEach(children, function(child, index){
			if(child){
				var _d = rias.newDeferred("_createRiasw", rias.defaultDeferredTimeout >> 2, function(child, ownerRiasw){
					this.cancel();
				}, child, ownerRiasw);
				/// _afterUpdateSize 需要优先执行。
				_d.promise.always(function(){
					//ownerRiasw._afterUpdateSize(ownerRiasw.id + " - _createRiasw.");
				});
				ds.push(_d);
				//ownerRiasw._beforeUpdateSize(ownerRiasw.id + " - _createRiasw.");
				if (rias.isRiasw(child)){
					//有错，或者已经创建并绑定
					_placeRiasw(child, ownerRiasw, pp, pi + index);
					_d.resolve(child);
				}else{
					_requireRiasCtor(child._riaswType || child.declaredClass, child.requires, errf).then(function(ctor){
						_createRiasw(ctor, child, ownerRiasw, m, _d, pp, pi + index, undefined);
					});
					//_d.then(function(widget){
					//});
				}
			}
			//console.debug(children, child);
		});
		function _consoleResult(arr, children){
			rias.forEach(arr, function(r){
				if(!r.isFulfilled){
					console.debug(r);
				}
			});
			rias.forEach(children, function(r){
				if(!r._riasrWidget){
					console.debug(r, r._riasrWidget);
				}
			});
		}
		rias.all(ds, rias.defaultDeferredTimeout, function(arr, children){
			this.cancel();
			_consoleResult(arr, children);
		}, children).then(function(widgets){
			var i, p, pl;
			for(i = 0; i < _owners.length; i++){
				pl = _owners[i];
				if(pl[0] && pl[1]){
					p = rias.by(pl[1]);
					if(!p && pl[1].id){
						p = rias.by(pl[1].id);
					}
					if(p || m || rias.webApp){
						(p || m || rias.webApp).own(pl[0]);
					}
				}
			}
			d.resolve(/*result*/{widgets: widgets, ownerRiasw: ownerRiasw, module: m, errors: errs});
		}, function(e){
			d.resolve(/*result*/{widgets: undefined, ownerRiasw: ownerRiasw, module: m, errors: errs + "\n" + e.message});
		});
		return d.promise;
	}

	rias.bind = function(/*riasdChildren|riasWidget*/children, /*String|DOMNode|Dijit|riasWidget*/ownerRiasw, position){
		if(!ownerRiasw){
			console.error("rias.bind need a ownerRiasw, now, using rias.webApp.");
		}
		ownerRiasw = rias.by(ownerRiasw) || rias.dom.byId(ownerRiasw) || rias.webApp;
		var module = rias.ownerModuleBy(ownerRiasw);
		var d = rias.newDeferred("bind", rias.defaultDeferredTimeout << 1, function(children, ownerRiasw, module){
				this.cancel();
			}, children, ownerRiasw, module),
			ref, refs = [], pl,
			_o;
		var pParams = {
			children: children,
			ownerRiasw: ownerRiasw,
			module: module
		};
		/// _afterUpdateSize 需要优先执行。
		d.promise.always(function(){
			ownerRiasw._afterUpdateSize(ownerRiasw.id + " - bind.", false);
		});
		if(rias.config.bindPublish && rias.publish){
			rias.publish("/rias/bind/start", [pParams]);
		}
		ownerRiasw._beforeUpdateSize(ownerRiasw.id + " - bind.");
		var pp = [],
			pi = (ownerRiasw.containerNode && ownerRiasw.containerNode.childNodes && (ownerRiasw.containerNode.childNodes.length > 0))
				? ownerRiasw.containerNode.childNodes.length : 0,
			i, p;
		if(rias.isNumber(position) && position < pi){
			pi = position;
		}
		for(i = 0, p = 0; i < pi; i++){
			if(ownerRiasw.containerNode.childNodes[i].nodeType === 1){
				pp.push(p++);
			}
		}

		function errf(result, e){
			if(e instanceof Error){
				result.errors += (result.errors ? "\n" : "") + e.message;
			}else if(e){
				result.errors += (result.errors ? "\n" : "") + e;
			}
		}
		_createRiasws(children, ownerRiasw, module, refs, pp, pi, 0).then(function(result){
			while(refs.length > 0){
				ref = refs.shift();
				try{
					/// ref = [obj[pn], pn, -1, -1, obj];
					//ref[2][ref[1]] = rias.by(ref[0].$refObj);
					if(module){
						///合并，在前面设置好 ref[1]，包含数组 i
						//if(ref[2] < 0){///非数组
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
									_o = rias.$runByModule(module, ref[0].$refScript, ref[0].id + "[" + ref[1] + "]");
								}catch(e){
									_o = undefined;
								}
							}
							if(_o == undefined){
								console.warn(ref[4].id, "params." + ref[1] + " = undefined.");
							}
							//ref[4].set(ref[1], _o);
							rias.setObject(ref[1], _o, ref[4]);
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
									_o = rias.$runByModule(module, ref[0].$refScript, ref[0].id + "[" + ref[1] + "]");
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
					if(rias.isRiasw(ref[4])){
						i = ref[4];
						p = i.getParent ? i.getParent() : i._riasrParent;
						if((!p || p._started && !i._started) && rias.isFunction(i.startup)){
							i.startup();
						}
					}
				}catch(e){
					if(ref && rias.isRiasw(ref[4])){
						errf(result, ref[4].id + "." + ref[1] + " - " + e.message);
					}else{
						errf(result, e);
					}
				}
			}
			d.resolve(result);
			return result;
		}, function(e){
			d.reject(e);
			return e;
		});
		if(rias.config.bindPublish && rias.publish){
			d.then(
				function(result){
					rias.publish("/rias/bind/binded", [pParams, result]);
					rias.publish("/rias/bind/done", [pParams, result]);
					return result;
				},
				function(result){
					rias.publish("/rias/bind/error", [pParams, result]);
					rias.publish("/rias/bind/done", [pParams, result]);
					return result;
				}
			);
		}
		return d.promise;
	};

	return rias;

});
