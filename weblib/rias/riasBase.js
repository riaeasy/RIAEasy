
//RIAStudio Client/Server Runtime riasBase(rias).
//非常重要：由于低版本ie不支持Array的indexOf、each等方法，请使用rias.indexOf和rias.each等函数来代替。
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”

///是否需要显式申明？在 redef() 时有什么影响？


define([
	"rias/main",
	"dojo/i18n",
	"dojo/i18n!rias/nls/riasI18n",

	"dojo/_base/kernel",
	"dojo/has",
	"dojo/sniff",//包含has，并初始化浏览器相关判断
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/config",
	//"dojo/_base/json",
	"dojo/json",
	"dojo/_base/window",
	"dojo/_base/declare",
	"dojo/errors/create",
	"dojo/aspect",
	//"dojo/_base/connect",

	"dojo/ready",

	"dojo/cldr/supplemental",
	"dojo/date",
	"dojo/date/locale",
	"dojo/date/stamp",

	"dojo/number",
	"dojo/currency",
	"dojo/string",

	"dojo/io-query",

	"rias/Color",//"dojo/_base/Color",

	"dojo/_base/loader",
	"dojo/promise/Promise",
	"dojo/Deferred",/// 在 dojo/Deferred 中增加 __riasrDeferredId
	"dojo/promise/all",
	"dojo/promise/first",
	"dojo/when",
	"dojo/topic",
	"dojo/cache",

	"dojo/Stateful"
], function(rias, i18n, riasI18n,
			kernel, _has, has, lang, array, config, json, basewin, declare, createError, aspect, //connect,
			ready,
			supplemental, date, dateLocale, dateStamp,
			number, currency, string, ioq,
			Color,
			loader, Promise, Deferred, all, first, when, topic, cache,
			Stateful) {

///lang******************************************************************************///

	if(!("mblApplyPageStyles" in config)){
		config.mblApplyPageStyles = false;
	}
	rias.config = config;
	rias.Color = Color;
	rias.isDebug = config.isDebug;
	rias.debugDeferredTimeout = config.debugDeferredTimeout;
	rias.debugStackTrace = config.debugStackTrace;
	rias.debugStackTraceOwn = config.debugStackTraceOwn;
	rias.has = has;

	rias.isAsync = !has("dojo-loader") || require.async;
	rias.locale = config.locale;

	rias.createError = createError;
	function _getF(f){
		var i = 0, n = 0, c;
		if(!isString(f)){
			f = f.toString();
		}
		while((c = f.charAt(i))){
			if(c === ")" && n === 1){
				i++;
				break;
			}
			if(c === "("){
				n++;
			}else if(c === ")"){
				n--;
			}
			i++;
		}
		//return f.slice(0, i).replace(/connectToDomNode/i, "");
		return f.slice(0, i) + "{}";
	}
	rias.getStackTrace = function(obj){
		if(obj && obj.stack){
			return obj.stack;
		}
		obj = obj || {};//new Error();
		if(Error.captureStackTrace){
			Error.captureStackTrace(obj, arguments.callee);
		}else{
			try {
				throw new Error();
			} catch (e) {
				obj.stack = e.stack;
			}
		}
		if(!obj.stack){
			var stack = [],
				deep = 0,
				caller = arguments.callee.caller;
			while(deep < 19 && caller){
				stack.push(_getF(caller));
				caller = caller.caller;
				deep++;
			}
			obj.stack = stack.join("\n");
		}
		return obj.stack;
	};
	//rias.raise = dojo.raise;//没有 dojo.raise

	rias.deprecated = dojo.deprecated;
	rias.experimental = dojo.experimental;
	rias.aspect = aspect;
	if(rias.debugStackTrace){
		rias.before = function(target, methodName, advice, receiveArguments){
			var h = aspect.before.apply(aspect, arguments || []),
				r = h.remove;
			h._args = arguments;
			h._targetid = target.id;
			h._methodName = methodName;
			h.remove = function(){
				h._args = undefined;
				r();
			};
			return h;
		};
		rias.after = function(target, methodName, advice, receiveArguments){
			var h = aspect.after.apply(aspect, arguments || []),
				r = h.remove;
			h._args = arguments;
			h._targetid = target.id;
			h._methodName = methodName;
			h.remove = function(){
				h._args = undefined;
				r();
			};
			return h;
		};
		rias.around = function(target, methodName, advice, receiveArguments){
			var h = aspect.around.apply(aspect, arguments || []),
				r = h.remove;
			h._args = arguments;
			h._targetid = target.id;
			h._methodName = methodName;
			h.remove = function(){
				h._args = undefined;
				r();
			};
			return h;
		};
	}else{
		rias.before = aspect.before;
		rias.after = aspect.after;
		rias.around = aspect.around;
	}

	///保留，预留以后 非 Dom 端 使用.
	rias.global = basewin.global;
	rias.doc = basewin.doc;
	rias.body = basewin.body;
	//rias.withDoc = basewin.withDoc;
	//rias.setContext = basewin.setContext;///没必要
	//rias.withGlobal = basewin.withGlobal;///没必要
	rias.ready = ready;
	//rias.connect = connect.connect;
	//rias.disconnect = connect.disconnect;

	var __dt0 = new Date(),
		__dt1;
	rias.__dt = function(){
		__dt1 = __dt0;
		__dt0 = new Date();
		return __dt0 - __dt1;
	};

	rias.noop = function(){};
	rias.ifnull = function(any, nullValue){
		return any == null ? nullValue : any;
	};

	// use the function constructor so our eval is scoped close to (but not in) in the global space with minimal pollution
	var _eval = new Function('return eval(arguments[0]);');
	rias._eval = function(scope, text, hint){
		return _eval.call(scope, text + (hint ? "\r\n////@ sourceURL=" + hint : ""));
	};
	rias.$script = function(contextWidget, /*String*/text, hint){
		if(!text){
			return undefined;
		}
		var module;
		if(contextWidget){
			module = rias.isRiaswModule(contextWidget) ? contextWidget : rias.ownerModuleBy(contextWidget);
			if(!module){
				console.error("rias.$script need a module.\n" + text + "\n" + hint);
				return undefined;
			}
		}else{
			console.error("rias.$script need a contextWidget as the scope.\n" + text + "\n" + hint);
			return undefined;
		}
		var r = new Function(
			'rias',
			'module',
			text + (hint ? "\r\n////@ sourceURL=" + hint : ""));
		try{
			r = r.call(contextWidget, rias, module);
			if(r && r.$refScript){
				r = rias.$script(contextWidget, r.$refScript, hint);
			}
		}catch(err){
			console.error("rias.$script execute error: " + err.message + "\n" + text + "\n" + hint);
			return undefined;
		}
		return r;
	};
	rias.$obj = function(contextWidget, /*String*/text, hint){
		if(!text){
			return undefined;
		}
		var module;
		if(contextWidget){
			module = rias.isRiaswModule(contextWidget) ? contextWidget : rias.ownerModuleBy(contextWidget);
		}
		if(text === "module"){
			if(!module){
				console.error("rias.$obj need a module.\n" + text + "\n" + hint);
				return undefined;
			}
			return module;
		//}else if(text === "this"){
		//	if(!contextWidget){
		//		console.error("rias.$obj need a contextWidget as the scope.\n" + text + "\n" + hint);
		//		return undefined;
		//	}
		//	return contextWidget;
		//}else if(text.indexOf("module.") >= 0 || text.indexOf("this.") >= 0){
		}else if(text.indexOf("module.") >= 0){
			var a = text.split("."),
				ctx = a.length > 1 ? a[0] : "",
				id;
			a.shift();
			id = a.join(".");
			/// 用 getObject 以支持 module.b.c
			if(ctx === "module"){
				if(!module){
					console.error("rias.$obj need a module.\n" + text + "\n" + hint);
					return undefined;
				}
				return rias.getObject(id, 0, module);
			}
			if(!contextWidget){
				console.error("rias.$obj need a contextWidget as the scope.\n" + text + "\n" + hint);
				return undefined;
			}
			return rias.getObject(id, 0, contextWidget);
		}
		return rias.getObject(text);
	};
	rias.by = function(/*String|DOMNode|riasWidget*/any, contextWidget){
		if(!any){
			return undefined;
		}
		if(rias.isObjectSimple(any)){
			if(any.$refObj){
				any = rias.$obj(contextWidget, any.$refObj);
			}else if(any.$refScript){
				any = rias.$script(contextWidget, any.$refScript);
			}
		}
		if(rias.isString(any)){
			any = rias.$obj(contextWidget, any) ||
				(rias.desktop && rias.desktop.byId && rias.desktop.byId(any)) ||
					rias.rt.byId(any) ||
					rias.dom && rias.dom.byId && rias.dom.byId(any) ||
					rias.getObject(any);
		}
		if(rias.isDomNode(any)){
			any = any.__riasrWidget || rias.rt.byNode(any) || rias.rt.getEnclosingWidget(any);
		}
		if(isRiasObject(any)){
			return any;
		}
		return undefined;
	};
	rias.ownerModuleBy = function(/*String|DOMNode|riasWidget*/any){
		var r = any && (isFunction(any.ownerModule) && any.ownerModule() || any._riasrModule);
		if(!r){
			r = isFunction(any.getOwnerRiasw) && any.getOwnerRiasw() || any.ownerRiasw;
			if(r){
				r = rias.ownerModuleBy(rias.by(r));
			}
		}
		return r;
	};
	/*function _decodeRiaswParam(contextWidget, params, name, pathname){
		///TODO:zensst. 未实现 params 中包含 _riaswType。
		var p, i, l;
		if(!params || !name){
			return;
		}
		p = params[name];
		if(!contextWidget){
			contextWidget = rias.desktop;
		}
		if(rias.isObjectSimple(p)){
			if(p.$refObj){
				params[name] = rias.$obj(contextWidget, p.$refObj, contextWidget.id + "[" + pathname + "]");
				if(params[name] == undefined){
					console.error(contextWidget.id, pathname + " = undefined.");
				}
			}else if(p.$refScript){
				params[name] = rias.$script(contextWidget, p.$refScript, contextWidget.id + "[" + pathname + "]");
				if(params[name] == undefined){
					console.error(contextWidget.id, pathname + " = undefined.");
				}
			}else{
				rias.decodeRiaswParams(contextWidget, p, pathname);
			}
		}else if(rias.isArray(p)){
			for(i = 0, l = p.length; i < l; i++){
				if(rias.isObjectSimple(p[i])){
					if(p[i].$refObj){
						p[i] = rias.$obj(contextWidget, p[i].$refObj, contextWidget.id + "[" + pathname + "]");
						if(p[i] == undefined){
							console.error(contextWidget.id, pathname + "." + i + " = undefined.");
						}
					}else if(p[i].$refScript){
						p[i] = rias.$script(contextWidget, p[i].$refScript, contextWidget.id + "[" + pathname + "." + i + "]");
						if(p[i] == undefined){
							console.error(contextWidget.id, pathname + "." + i + " = undefined.");
						}
					}else{
						rias.decodeRiaswParams(contextWidget, p[i], pathname + "." + i);
					}
				}
			}
		}
		return p;
	}*/
	rias.decodeRiaswParams = function(contextWidget, params){
		///TODO:zensst. 未实现 params 中包含 _riaswType。
		var pn,
			pathname = arguments[2],
			refs = arguments[3];

		function _get(_param, _pn, _ppn){
			var p, i, l;
			p = _param[_pn];
			if(rias.isObjectSimple(p)){
				if(p.$refObj || p.$refScript){
					_param[_pn] = (p.$refObj ? rias.$obj : rias.$script)(contextWidget, p.$refObj ? p.$refObj : p.$refScript, contextWidget.id + "." + _ppn);
					if(_param[_pn] == undefined){
						if(refs){
							refs.push([p, _ppn, -1, -1]);
							//delete _param[_pn];//兼容 Array，不删除
						}else{
							console.error(contextWidget.id + "." + _ppn + " = undefined.");
						}
					}
				}else{
					rias.decodeRiaswParams(contextWidget, p, _ppn, refs);
				}
			}else if(rias.isArray(p)){
				for(i = 0, l = p.length; i < l; i++){
					_get(p, i, _ppn + "." + i);
				}
			}
		}

		if(!params){
			return;
		}
		if(!contextWidget){
			contextWidget = rias.desktop;
		}
		for (pn in params) {
			if (params.hasOwnProperty(pn)) {
				if(pn === "_riaswParams" || pn === "_riaswElements" || pn === "_riaswOriginalParams"){///必须跳过，否则会被当做 params 来创建。
					continue;
				}
				if(pn === "moduleMeta"){///必须过滤一下，避免当做 params 来创建。
					if(params.moduleMeta.$refObj){
						params.moduleMeta = {
							$refObj: params.moduleMeta.$refObj
						};
					}else if(params.moduleMeta.$refScript){
						params.moduleMeta = {
							$refScript: params.moduleMeta.$refScript
						};
					}else{
						continue;
					}
				}
				_get(params, pn, (pathname ? pathname + "." + pn : pn));
			}
		}
		return params;
	};

	rias.exists = lang.exists;

	rias.isEmpty = function(any){
		if(any == undefined || any === "" || (isArrayLike(any) && any.length === 0)){
			return true;
		}
		if(isObject(any)){
			//return JSON.stringify(any) === "{}";
			for(var n in any){
				return false;
			}
			return true;
		}
		return false;
	};
	var isString = rias.isString = lang.isString;
	var isArray = rias.isArray = lang.isArray;
	var isArrayLike = rias.isArrayLike = lang.isArrayLike;/// ArrayLike("") = "", String 不是 ArrayLike。
	rias.isAlien = lang.isAlien;
	//var isFunction = rias.isFunction = lang.isFunction;
	var isFunction = rias.isFunction = function(it){///优化速度
		return typeof it === "function";
	};
	var isObject = rias.isObject = lang.isObject;
	var isObjectExact = rias.isObjectExact = function(it){
		///优化速度
		//return (it != undefined) && (it != null) && (typeof it === "object") && (!isArray(it)) && (!isFunction(it));
		return it != undefined && typeof it === "object" && !isArray(it);
	};
	var isObjectSimple = rias.isObjectSimple = function(it){
		///优化速度
		//return (it != undefined) && (it != null) && (typeof it === "object") && (it.constructor === Object);
		return it != undefined && typeof it === "object" && it.constructor === Object;
	};
	var isNumber = rias.isNumber = function(v){
		return typeof v === "number" && isFinite(v);
	};
	rias.isNumberLike = function(v){
		return Number(v) == v && v !== "";
	};
	rias.isNumberString = function(v, typ){
		return Number(v) == v && v !== "";
	};
	rias.isBoolean = function(v){
		return typeof v === "boolean";
	};
	rias.isDate = function(it, includeInvalid){
		return it instanceof Date && (includeInvalid || it.toString() !== "Invalid Date");
		//return (it != undefined) && (it != null) && (typeof it === "object") && (it.constructor.name === "Date");
	};
	rias.isUrl = function(location){
		return /^:\/\//.test(location);
	};
	rias.isUrlLocal = function(location){
		return /^file:\/\//.test(location) && !/^http/.test(location);
	};
	rias.isDeferred = function(obj){
		return obj && Object.prototype.toString.call(obj) === "[object Deferred]" && isFunction(obj.resolve);
	};
	rias.isPromise = function(obj){
		return obj && Object.prototype.toString.call(obj) === "[object Promise]" && isFunction(obj.then);
	};
	rias.isPromiseLike = function(obj){
		return obj && isFunction(obj.then);
	};

	var is = rias.is = function(obj, base){
		function _do(ctor){
			if(isString(ctor)){
				ctor = getObject(ctor);
			}
			if(!ctor){
				return false;
			}
			if(obj instanceof ctor){
				return true;
			}
			if(obj && obj.constructor && obj.constructor._meta){
				var bases = obj.constructor._meta.bases;
				/// bases[0] 是自身，bases[length - 1]是基类
				/// 采用倒序，优化速度
				for(var i = bases.length - 1; i >= 0; i--){
					if(bases[i] === ctor){
						return true;
					}
				}
			}
			return false;
		}
		if(isArray(base)){
			return rias.some(base, function(item){
				return _do(item);
			});
		}else{
			return _do(base);
		}
	};

	var hostBrowser = rias.hostBrowser = !!has("host-browser");

	rias.isDomEvent = function(any){
		return !!any && (!!any.stopPropagation || !!any.preventDefault);
	};
	rias.isDomNode = function(obj){
		///IE不支持 instanceof Node
		return !!(hostBrowser && obj && /*(obj instanceof Node) &&*/ (obj.nodeType === 1 || obj.nodeType === 3));
	};
	rias.isWindow = function(obj){
		return rias.is(obj, Window);
	};
	rias.isDocument = function(obj){
		return obj === rias.doc;
	};
	var isRiasObject = rias.isRiasObject = function(obj){
		return !!(obj && obj._riasrCreated && obj._riaswType && is(obj, Destroyable));// && isRiasw(obj);//有非 Dijit 的 RiasWidget
	};
	///注意：在 _WidgetBase.postCreate() 之前（包含 _WidgetBase.postCreate()） obj._created都为 false，故 rias.isRiasw() 为 false。
	///建议在 _WidgetBase.startUp() 之后使用。
	var isRiasw = rias.isRiasw = function(obj){
		return !!(hostBrowser && obj && obj.domNode && is(obj, "riasw.sys._WidgetBase"));
	};
	rias.isRiaswCtor = function(obj){
		return !!(isFunction(obj) && obj.prototype && obj.prototype.declaredClass);
	};
	rias.isRiaswParam = function(obj){
		//return !!(isObjectSimple(obj) && obj._riaswType && !obj._created);
		return !!(isObjectSimple(obj) && obj._riaswType);
	};
	//rias.isRiaswModuleParam = function(obj){
	//	return !!(isObjectSimple(obj) && obj._riaswType && rias.contains(["riasw.sys.Dialog", "riasw.sys.Module", "riasw.sys.Scene", "riasw.sys.Desktop"], obj._riaswType));
	//};
	//rias.isRiasw_Module = function(obj){
	//	return !!(hostBrowser && isRiasObject(obj) && is(obj, "riasw.sys._ModuleMixin"));
	//};
	rias.isRiaswModule = function(obj){
		return !!(hostBrowser
			//&& isRiasObject(obj) && (is(obj, ["riasw.sys.Dialog", "riasw.sys.Module", "riasw.sys.Scene", "riasw.sys.Desktop"]) || obj.moduleMeta != undefined && is(obj, "riasw.sys._ModuleMixin")));
			&& isRiasObject(obj) && is(obj, "riasw.sys._ModuleMixin"));
	};
	rias.isRiaswForm = function(obj){
		return !!(hostBrowser && isRiasObject(obj) && is(obj, "riasw.sys._FormMixin"));
	};
	rias.isRiaswDialog = function(obj){
		return !!(hostBrowser && isRiasObject(obj) && is(obj, "riasw.sys.Dialog"));
	};
	rias.isRiaswView = function(obj){
		return !!(hostBrowser && isRiasObject(obj) && is(obj, "riasw.sys.View"));
	};
	//rias.isRiaswApp = function(obj){
	//	//return _isRiasWebApp(obj) || _isRiasServerApp(obj);
	//	//return isRiasObject(obj) && (!!hostBrowser && is(obj, "riasw.sys.App") || !hostBrowser && is(obj, "riass.App"));
	//	return isRiasObject(obj) && (!hostBrowser && is(obj, "riass.App"));
	//};
	rias.isRiaswDesktop = function(obj){
		return isRiasObject(obj) && is(obj, "riasw.sys.Desktop");
	};
	rias.isRiaswScene = function(obj){
		return isRiasObject(obj) && is(obj, "riasw.sys.Scene");
	};

	var _isEqualDeep = rias.has("isEqualDeep") > 0 ? rias.has("isEqualDeep") : 19;
	rias.isEqual = function(a, b){
		//	summary:
		//		Function that determines whether two values are identical,
		//		taking into account that NaN is not normally equal to itself
		//		in JS.

		return a === b || (/* a is NaN */ a !== a && /* b is NaN */ b !== b) || rias.objEqual(a, b, _isEqualDeep) || rias.arrayEqual(a, b);
	};
	rias.objEqual = function(srcObj, equalObj, deep){
		var name,
			ok = isObjectExact(srcObj) && isObjectExact(equalObj);
		if(ok){
			for(name in equalObj){
				if(!(name in srcObj) || (srcObj[name] !== equalObj[name] && (!deep || deep < 0 || !rias.objEqual(srcObj[name], equalObj[name], --deep)))){
					return false;
				}
			}
			for(name in srcObj){
				if(!(name in equalObj)){
					return false;
				}
			}
		}
		return ok;
	};
	rias.objLike = function(srcObj, desObj, deep){
		var name,
			ok = isObject(srcObj) && isObject(desObj);
		if(ok){
			for(name in desObj){
				if(!(name in srcObj) || (srcObj[name] !== desObj[name] && (!deep || deep < 0 || !rias.objEqual(srcObj[name], desObj[name], --deep)))){
					return false;
				}
			}
		}
		return ok;
	};
	rias.objToArray = function(obj){
		var arr = [],
			id;
		if(obj){
			for(id in obj){
				arr.push(obj[id]);
			}
		}
		return arr;
	};

	rias.objToUrlParams = ioq.objectToQuery;
	rias.urlParamsToObj = ioq.queryToObject;

	function _delete(dest, ref, /*Integer*/deep){
		//deep是嵌套的层数.
		var name, s;
		function _dele1(name){
			s = ref[name];
			if(name in dest){
				if (deep > 0){
					try{
						/*if(s instanceof Date){
							delete dest[name];
						}else if(s instanceof RegExp){
							delete dest[name];
						}else*/ if(isArray(s)){
							if (!isArray(dest[name])){
								delete dest[name];
							}else{
								_delete(dest[name], s, deep - 1);
							}
						}else if(isObjectExact(s)){
							if(isRiasObject(s) || isRiasw(s) || s.nodeType){
								delete dest[name];//复杂对象不建议深度delete，比如 DOM Node
							}else{
								if (!isObjectExact(dest[name])){
									delete dest[name];
								}else{
									_delete(dest[name], s, deep - 1);
								}
							}
						}else{
							delete dest[name];
						}
					}catch(e){
						console.error(e);
						//throw e;
					}
				}else{
					delete dest[name];
				}
			}
		}

		deep = isNumber(deep) ? deep : 0;
		for(name in ref){
			if (ref.hasOwnProperty(name)) {///不要delete原型链，否则可能出现不可测问题。
				_dele1(name);
			}
		}
		return dest; // Object
	}
	rias.dele = function(/*Object*/dest, /*Object..*/refs) {
		if(!dest){
			return {};
		}
		for(var i = 1, l = arguments.length; i < l; i++){
			_delete(dest, arguments[i]);
		}
		return dest; // Object
	};
	rias.deleteDeep = function(/*Object*/dest, /*Object..*/refs) {
		//如果 dest 中的 attr 存在于 refs，则删除
		if(!dest){
			return {};
		}
		for(var i = 1, l = arguments.length; i < l; i++){
			//_mixin(dest, arguments[i], undefined, rias.toInt(deep, 99));
			_delete(dest, arguments[i], 99);
		}
		return dest; // Object
	};

	rias.mixin_notexists = function(/*Object*/dest, /*Object..*/sources){
		///只 mixin dest 中不存在的
		/// 没有 Deep
		///TODO:zensst. 是否需要 deep
		var n;
		function _mix(src){
			for(n in src){
				if(!(n in dest)){
					dest[n] = src[n];
				}
			}
		}
		if(!dest){
			dest = {};
		}
		for(var i = 1, l = arguments.length; i < l; i++){
			_mix(arguments[i]);
		}
		return dest;
	};
	function _mixin(dest, source, copyFunc, /*Integer*/deep, ord, exact, onlyCopy){
		// the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
		// inherited from Object.prototype. For example, if dest has a custom toString() method,
		// don't overwrite it with the toString() method that source inherited from Object.prototype
		//deep是嵌套的层数.
		var name, s, i, empty = {}, a = [];
		function _mix1(name){
			if(exact && source[name] === undefined){///允许 null
				return;
			}
			s = source[name];
			if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
				if (deep > 0){
					try{
						/*if(s instanceof Date){
							dest[name] = new Date(s.getTime());	// Date
						}else if(s instanceof RegExp){
							dest[name] = new RegExp(s);   // RegExp
						}else*/ if(isArray(s)){
							if (!isArray(dest[name])){
								dest[name] = [];
							}
							_mixin(dest[name], s, copyFunc, deep - 1, ord, exact, onlyCopy);
						}else if(isObjectExact(s)){
							if(isRiasObject(s) || isRiasw(s) || s.nodeType){
								dest[name] = s;	//复杂对象不建议深度mix，比如 DOM Node
							}else{
								if (!isObjectExact(dest[name])){
									dest[name] = {};
								}
								_mixin(dest[name], s, copyFunc, deep - 1, ord, exact, onlyCopy);
							}
						}else if(isFunction(s)){
							dest[name] = s;
							if(!dest[name].nom){
								dest[name].nom = s.nom || name;/// fake inherited
							}
							//_mixin(dest[name], s, copyFunc, deep - 1, ord, exact, onlyCopy);/// mixin Function 的 属性
						}else{
							dest[name] = copyFunc ? copyFunc(s) : s;
						}
					}catch(e){
						console.error(e);
						//throw e;
					}
				}else{
					dest[name] = copyFunc ? copyFunc(s) : s;
					if(isFunction(s)){
						if(!dest[name].nom){
							dest[name].nom = s.nom || name;/// fake inherited
						}
						//_mixin(dest[name], s, copyFunc, 0, ord, exact, onlyCopy);/// mixin Function 的 属性
					}
				}
			}
		}

		deep = isNumber(deep) ? deep : 0;
		if(ord){
			for(name in dest){
				a.push(name);
			}
			if(!onlyCopy){
				for(name in source){
					a.push(name);
				}
			}
			if(isFunction(ord)){
				a.sort(ord);
			}else{
				a.sort();
			}
			forEach(a, _mix1);
		}else{
			if(onlyCopy){
				for(name in dest){
					_mix1(name);
				}
			}else{
				for(name in source){
					_mix1(name);
				}
			}
		}
		if(has("bug-for-in-skips-shadowed")){
			if(source){
				for(i = 0; i < lang._extraNames.length; ++i){
					name = lang._extraNames[i];
					if(onlyCopy){
						_mix1(name);
					}else{
						_mix1(name);
					}
				}
			}
		}
		return dest; // Object
	}
	rias.mixin = function(/*Object*/dest, /*Object..*/sources) {
		if(!dest){ dest = {}; }
		for(var i = 1, l = arguments.length; i < l; i++){
			_mixin(dest, arguments[i]);
		}
		return dest; // Object
	};
	rias.mixin_ord = function(/*Object*/dest, /*Object..*/sources) {
		if(!dest){ dest = {}; }
		for(var i = 1, l = arguments.length; i < l; i++){
			_mixin(dest, arguments[i], undefined, undefined, 1);
		}
		return dest; // Object
	};
	rias.mixin_exact = function(/*Object*/dest, /*Object..*/sources) {
		///忽略 sources 中的 undefined
		if(!dest){ dest = {}; }
		for(var i = 1, l = arguments.length; i < l; i++){
			_mixin(dest, arguments[i], undefined, undefined, undefined, true);
		}
		return dest; // Object
	};
	rias.mixinDeep = function(/*Object*/dest, /*Object..*/sources) {
		//针对下级含有object（包含数组、函数）的object的mixin，可以保留下级object原有的属性，而不是直接覆盖替换
		if(!dest){
			dest = {};
		}
		for(var i = 1, l = arguments.length; i < l; i++){
			//_mixin(dest, arguments[i], undefined, rias.toInt(deep, 99));
			_mixin(dest, arguments[i], undefined, 99);
		}
		return dest; // Object
	};
	rias.mixinDeep_ord = function(/*Object*/dest, /*Object..*/sources) {
		if(!dest){
			dest = {};
		}
		for(var i = 1, l = arguments.length; i < l; i++){
			//_mixin(dest, arguments[i], undefined, rias.toInt(deep, 99), 1);
			_mixin(dest, arguments[i], undefined, 99, 1);
		}
		return dest; // Object
	};
	rias.mixinDeep_exact = function(/*Object*/dest, /*Object..*/sources) {
		///忽略 sources 中的 undefined
		if(!dest){
			dest = {};
		}
		for(var i = 1, l = arguments.length; i < l; i++){
			//_mixin(dest, arguments[i], undefined, rias.toInt(deep, 99), 1);
			_mixin(dest, arguments[i], undefined, 99, undefined, true);
		}
		return dest; // Object
	};
	rias.copy = function(/*Object*/dest, /*Object..*/sources){
		//只获取 dest 中已有的属性
		if(!dest){
			dest = {};
		}
		for(var i = 1, l = arguments.length; i < l; i++){
			_mixin(dest, arguments[i], undefined, undefined, undefined, undefined, true);
		}
		return dest; // Object
	};
	rias.copyDeep = function(/*Object*/dest, /*Object..*/sources){
		//只获取 dest 中已有的属性
		//针对下级含有object（包含数组、不包含函数?）的object的mixin，可以保留下级object原有的属性，而不是直接覆盖替换
		//函数任然直接覆盖
		if(!dest){
			dest = {};
		}
		for(var i = 1, l = arguments.length; i < l; i++){
			_mixin(dest, arguments[i], undefined, 99, undefined, undefined, true);
		}
		return dest; // Object
	};
	rias.clone = function(/*anything*/ src){
		if(!src || typeof src !== "object"){
			// null, undefined, any non-object
			return src;	// anything
		}
		if(src.nodeType && "cloneNode" in src){
			// DOM Node
			return src.cloneNode(true); // Node
		}
		if(src instanceof Date){
			// Date
			return new Date(src.getTime());	// Date
		}
		if(src instanceof RegExp){
			// RegExp
			return new RegExp(src);   // RegExp
		}
		var r, i, l;
		if(isArray(src)){
			r = [];
			for(i = 0, l = src.length; i < l; ++i){
				if(i in src){
					r.push(rias.clone(src[i]));
				}
			}
		}else if(isFunction(src)){
			//we don't clone functions for performance reasons
			// function
			//r = function(){ return src.apply(this, arguments || []); };
			return src;	// anything
		}else{
			// generic objects
			r = src.constructor ? new src.constructor() : {};
		}
		return _mixin(r, src, arguments.callee);
	};
	/*rias.cloneDeep = function(Obj) {
		var buf;
		if (Obj instanceof Array) {
			buf = [];  //创建一个空的数组
			var i = Obj.length;
			while (i--) {
				buf[i] = rias.cloneDeep(Obj[i]);
			}
			return buf;
		}else if (Obj instanceof Object){
			buf = {};  //创建一个空对象
			for (var k in Obj) {  //为这个对象添加新的属性
				buf[k] = rias.cloneDeep(Obj[k]);
			}
			return buf;
		}else{
			return Obj;
		}
	};*/
	rias.compact = function(obj){
		var name;
		for(name in obj){
			if(obj[name] == undefined){
				delete obj[name];
			}
		}
		return obj;
	};

	rias.currency = currency;
	var _number = rias.number = number;
	_number.add = function(n1, n2){
		var m1, m2, m;
		try{
			m1 = n1.toString().split(".")[1].length;
		}catch(e){
			m1 = 0;
		}
		try{
			m2 = n2.toString().split(".")[1].length;
		}catch(e){
			m2 = 0;
		}
		m = Math.pow(10, Math.max(m1, m2));
		return number.round(n1 * m + n2 * m) / m;
	};
	_number.mul = function(n1, n2){
		var s1 = n1.toString(),
			s2 = n2.toString(),
			m = 0;
		try{
			m += s1.split(".")[1].length;
		}catch(e){
		}
		try{
			m += s2.split(".")[1].length;
		}catch(e){
		}
		return Number(s1.replace(".", "")) * Number(s2.replace(".","")) / Math.pow(10, m);
	};
	_number.div = function(n1, n2){
		var s1 = n1.toString(),
			s2 = n2.toString(),
			m1 = 0, m2 = 0;
		try{
			m1 = s1.split(".")[1].length;
		}catch(e){
		}
		try{
			m2 = s2.split(".")[1].length;
		}catch(e){
		}
		return Number(s1.replace(".", "")) / Number(s2.replace(".","")) * Math.pow(10, m2 - m1);
	};

	var toNumber = rias.toNumber = function(n, def){
		if(isNumber(n)){
			return n;
		}
		if(n !== "" && Number(n) == n){
			return Number(n);
		}
		if(isNumber(def)){
			return def;
		}
		throw n + " is not Number.";
	};
	rias.toFixed = function(x, decimals){
		//decimals = (decimals || 0);
		decimals = (decimals >= 0 ? decimals : 0) + 2;
		x = toNumber(x) + Math.pow(10, -decimals);
		/// Number.toFixed 是返回 String
		return x.toFixed(decimals - 2);
	};
	rias.toInt = function(n, def, trunc){
		if(trunc){
			return rias.trunc(n, def);
		}
		n = toNumber(n, def);
		return number.round(n);
	};
	rias.trunc = function(x, def) {
		x = toNumber(x, def);
		return x < 0 ? Math.ceil(x) : Math.floor(x);
	};
	rias.toStr = function(obj){///不应该命名为 toString，避免覆盖原型
		if(!obj){
			obj = "";
		}else{
			if(isFunction(obj.toString)){
				obj = obj.toString();
			}else{
				obj = obj + "";
			}
		}
		return obj;
	};
	//rias.toHTMLStr = function(str){
	//	return str//.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;").replace(/'/gm, "&quot;")
	//		.replace(/\n/g, "<br/>");//.replace(/\s/g, "&nbsp;");///先转换 回车（\n），否则 回车会被当做 空格（\s）处理
	//};
	rias.toChinese = function(value, len, compact){
		var s, c, result = "",
			i, l,
			pad = true;//!compact;
		s = rias.toStr(rias.toFixed(value, 2));
		//if(s[0] === "-"){
		//	//s = s.slice(1);
		//	//throw "待转换的值不能为负！";
		//}
		//s = TrimStrNum(S);
		if (len > 0){
			rias.pad(s, len, "0", false);
		}
		l = s.length;
		for(i = l - 1; i >= 0; i--){
			c = s[l - 1 - i];
			switch(c){
				case "0":
					if(pad){
						result += "零";
					}
					break;
				case "1":
					result += "壹";
					break;
				case "2":
					result += "贰";
					break;
				case "3":
					result += "叁";
					break;
				case "4":
					result += "肆";
					break;
				case "5":
					result += "伍";
					break;
				case "6":
					result += "陆";
					break;
				case "7":
					result += "柒";
					break;
				case "8":
					result += "捌";
					break;
				case "9":
					result += "玖";
					break;
				case "-":
					result += "负";
					break;
			}
			pad = !compact || c !== "0";
			switch(i){
				case 0:
					if(pad){
						result += "分";
					}
					break;
				case 1:
					if(pad){
						result += "角";
					}
					break;
				case 3:
					if(pad || result === "零"){
						result += "元";
					}else{
						result = result.slice(0, -1) + "元";
					}
					break;
				case 4:
					if(pad){
						result += "拾";
					}
					break;
				case 5:
					if(pad){
						result += "佰";
					}
					break;
				case 6:
					if(pad){
						result += "仟";
					}
					break;
				case 7:
					if(pad || result === "零"){
						result += "万";
					}else{
						result = result.slice(0, -1) + "万";
					}
					break;
				case 8:
					if(pad){
						result += "拾";
					}
					break;
				case 9:
					if(pad){
						result += "佰";
					}
					break;
				case 10:
					if(pad){
						result += "仟";
					}
					break;
				case 11:
					if(pad || result === "零"){
						result += "亿";
					}else{
						result = result.slice(0, -1) + "亿";
					}
					break;
				case 12:
					if(pad){
						result += "拾";
					}
					break;
				case 13:
					if(pad){
						result += "佰";
					}
					break;
				case 14:
					if(pad){
						result += "仟";
					}
					break;
				case 15:
					if(pad || result === "零"){
						result += "万";
					}else{
						result = result.slice(0, -1) + "万";
					}
					break;
			}
		}
		if(!!compact && rias.endWith(result, "零")){
			result = result.slice(0, -1);
		}
		return result;
	};

	if(!String.prototype.equal){
		String.prototype.equal = function(b, ignoreCase, ignoreBlank){
			if(ignoreBlank){
				return this.equal(b, ignoreCase);
			}
			if(ignoreCase){
				return this.toLowerCase() === b.toLowerCase();
			}
			return this === b;
		};
	}
	if(!String.prototype.startWith){
		String.prototype.startWith = function(sub){
			return this.indexOf(sub) === 0;//new RegExp("^" + sub).test(this);
		};
	}
	if(!String.prototype.endWith){
		String.prototype.endWith = function(sub){
			return this.lastIndexOf(sub) === this.length - sub.length;//new RegExp(sub + "$").test(this);
		};
	}
	rias.startWith = function(s, sub){
		return s.startWith(sub);//new RegExp("^" + sub, gi).test(s);
	};
	rias.endWith = function(s, sub, gi){
		return s.endWith(sub);//new RegExp(sub + "$", gi).test(s);
	};
	//如果是字符串，则去掉首尾空格；如果是数组，则去掉全部 null/undefined/""
	rias.trim = function(/*string | array*/arr){
		if(isArray(arr)){
			var a = [], i, l = arr.length;
			for(i = 0; i < l; i++){
				if(arr[i] !== undefined){
					a.push(arr[i]);
				}
			}
			return a;
		}else if(isString(arr)){
			return string.trim(arr);
		}
		return arr;
	};
	rias.trimStartChars = function(str, /*chars*/trim){
		var p = 0;
		if(trim.indexOf(str.charAt(p)) >= 0){
			p++;
		}
		return str.substring(p);
	};
	rias.trimEndChars = function(str, /*chars*/trim){
		var p = str.length;
		if(trim.indexOf(str.charAt(p - 1)) >= 0){
			p--;
		}
		return str.substring(0, p);
	};
	rias.trimStartStr = function(str, /*string*/trim){
		if(str.startWith(trim)){
			return str.slice(trim.length);
		}
		return str;//str.replace(new RegExp("^" + trim, gi), "");
	};
	rias.trimEndStr = function(str, /*string*/trim){
		if(str.endWith(trim)){
			return str.slice(0, -trim.length);
		}
		return str;//str.replace(new RegExp(trim + "$", gi), "");
	};
	//rias.replaceStr = function(str, /*string*/trim, gi){
	//	return str.replace(new RegExp(trim, gi), "");
	//};
	rias.lowerCaseFirst = function(s){
		return (s && isString(s) ? s.charAt(0).toLowerCase() + s.substring(1) : "");
	};
	rias.upperCaseFirst = function(s){
		return (s && isString(s) ? s.charAt(0).toUpperCase() + s.substring(1) : "");
	};
	rias.replace = lang.replace;//被替换的部分不包含 '$'
	//rias.substitute 被替换的部分包含 '$'
	rias.substitute = string.substitute = function(
		/*String*/template,
		/*Object|Array*/map,
		/*Function?*/transform,
		/*Object?*/thisObject){
		thisObject = thisObject || dojo.global;
		transform = transform ? lang.hitch(thisObject, transform) : function(v){ return v; };

		return template.replace(/\$\{([^\s\:\}]*)(?:\:([^\s\:\}]+))?\}/g,
			function(match, key, format){
				if (key === ''){
					return '$';
				}
				var value = getObject(key, false, map);
				if(format){
					value = getObject(format, false, thisObject).call(thisObject, value, key);
				}
				try{
					///value = transform(value, key).toString();
					value = transform(value, key) + "";/// transform(value, key) 有可能为 undefined
				}catch(e){
					console.error("substitute error: " + key, e);
					//throw "substitute error: " + key + "\n" + e;
				}
				return value;
			}); // String
	};
	rias.escape = string.escape;
	rias.rep = string.rep;
	rias.pad = string.pad;
	rias.lastString = function(str, separator){
		var p = str.lastIndexOf(separator);
		if(p < 0){
			p = "";
		}else{
			p = str.substring(p + 1);
		}
		return p;
	};
	rias.formatPath = function (path, def) {
		if(!path){
			return def || "";
		}
		if (!path.endWith("/")) {
			return path + "/";
		}
		return path;
	};

	rias.toBoolean = function(any){
		return any == true || any === "true";
	};

	var _langCache = {};
	function buildFn(fn){
		return (_langCache[fn] = new Function("item", "index", "array", fn)); // Function
	}
	var argsToArray = rias.argsToArray = lang._toArray;
	rias.every = array.every;
	rias.some = array.some;
	rias.arrayEqual = function(a, b){
		var i,
			ok = isArray(a) && isArray(b) && a.length === b.length;
		if(ok){
			for (i = a.length - 1; i >= 0; i--) {
				if (!rias.isEqual(a[i], b[i])) {
					return false;
				}
			}
		}
		return ok;
	};
	if(!Array.prototype.indexOf){
		Array.prototype.indexOf = function(a, from){
			var len = this.length >>> 0;
			if (isNaN(from)) {
				from = 0;
			} else {
				from = (from < 0) ? Math.ceil(from) : Math.floor(from);
			}
			if(from < 0){
				from += len;
			}
			for(; from < len; from++){
				if (from in this && this[from] === a){
					return from;
				}
			}
			return -1;
		};
	}
	if(!Array.prototype.lastIndexOf){
		Array.prototype.lastIndexOf = function(a, from){
			var len = this.length >>> 0;
			if (isNaN(from)) {
				from = len - 1;
			} else {
				from = (from < 0) ? Math.ceil(from) : Math.floor(from);
				if (from < 0) {
					from += len;
				} else if (from >= len){
					from = len - 1;
				}
			}
			for (; from > -1; from--) {
				if (from in this && this[from] === a) {
					return from;
				}
			}
			return -1;
		};
	}
	//rias.indexOf = array.indexOf;///只能用于 array，如果用于 String，则只能 indexOf(char)。
	rias.indexOf = function(array_string, value, fromIndex, findLast){
		if(array_string){
			if(isArrayLike(array_string)){
				if(findLast){
					return Array.prototype.lastIndexOf.apply(array_string, [value, fromIndex]);
				}
				return Array.prototype.indexOf.apply(array_string, [value, fromIndex]);
			}else{
				if(findLast){
					return array_string.lastIndexOf(value, fromIndex);
				}
				return array_string.indexOf(value, fromIndex);
			}
		}
		return -1;
	};
	rias.indexOfByAttr = function(array, value, attrName){
		var i = 0, l = array.length;
		for(; i < l; i++){
			if(array[i] && array[i][attrName] === value){
				return i;
			}
		}
		return -1;
	};
	//rias.lastIndexOf = array.lastIndexOf;
	rias.lastIndexOf = function(array_string, value, fromIndex){
		if(array_string){
			if(isArrayLike(array_string)){
				return Array.prototype.lastIndexOf.apply(array_string, [value, fromIndex]);
			}else{
				return array_string.lastIndexOf(value, fromIndex);
			}
		}
		return -1;
	};
	var contains = rias.contains = function(array_string, value, attrName){
		if(attrName == undefined){
			if(isArray(value)){
				return rias.some(value, function(v){
					return rias.indexOf(array_string, v) >= 0;
				});
			}
			return rias.indexOf(array_string, value) >= 0;
		}
		if(isArray(value)){
			return rias.some(value, function(v){
				return rias.indexOfByAttr(array_string, v, attrName) >= 0;
			});
		}
		return rias.indexOfByAttr(array_string, value, attrName) >= 0;
	};
	rias.map = array.map;
	rias.filter = array.filter;
	//rias.forEach = array.forEach;
	var forEach = rias.forEach = function(arrayOrObject, callback, context, all){
		if (!arrayOrObject) {
			return;
		}
		if(typeof callback === "string") {
			callback = _langCache[callback] || buildFn(callback);
		}
		var i = 0, l;
		if(isNumber(arrayOrObject.length)){
			if(isString(arrayOrObject)) {
				arrayOrObject = arrayOrObject.split("");
			}
			l = arrayOrObject.length || 0;
			if(context){
				for(; i < l; ++i){
					if(all || arrayOrObject[i] != undefined){
						callback.call(context, arrayOrObject[i], i, arrayOrObject);
					}
				}
			}else{
				for(; i < l; ++i){
					if(all || arrayOrObject[i] != undefined){
						callback(arrayOrObject[i], i, arrayOrObject);
					}
				}
			}
		}else{
			if(context){
				for (i in arrayOrObject) {
					if(all || arrayOrObject[i] != undefined){
						callback.call(context, arrayOrObject[i], i, arrayOrObject);
					}
				}
			}else{
				for (i in arrayOrObject) {
					if(all || arrayOrObject[i] != undefined){
						callback(arrayOrObject[i], i, arrayOrObject);
					}
				}
			}
		}
	};
	function _concat(dest, src, uni){
		if(isArray(dest)){
			if(isArrayLike(src)){
				var i, l = src.length, item;
				for(i = 0; i < l; i++){
					item = src[i];
					if(item !== undefined && (!uni || !contains(dest, item))){
						if(rias.isArray(item)){
							_concat(dest, item, uni);
						}else{
							dest.push(item);
						}
					}
				}
				return dest;
			}else{
				if(src !== undefined && (!uni || !contains(dest, src))){
					dest.push(src);
				}
			}
			return dest;
		}else if(src){
			return dest.concat(src);
		}
		return dest;
	}
	rias.concat = function(sources){
		var r = arguments[0],
			i = 1, l = arguments.length;
		for(; i < l; i++){
			_concat(r, arguments[i]);
		}
		return r;
	};
	rias.concatUnique = function(sources){
		var r = arguments[0],
			i = 1, l = arguments.length;
		for(; i < l; i++){
			_concat(r, arguments[i], true);
		}
		return r;
	};
	rias.insertItems = function(src, index, items, reverse){
		var arr = [].concat(items);
		if(reverse){
			arr.reverse();
		}
		Array.prototype.splice.apply(src, [index, 0].concat(arr));
		return src;
	};
	rias.addItems = function(src, index, items, reverse){
		var arr = [].concat(items);
		if(reverse){
			arr.reverse();
		}
		Array.prototype.splice.apply(src, [index + 1, 0].concat(arr));
		return src;
	};
	rias.removeItems = function(src, items, callback, context){
		var i, l, c = 0;
		function _do(item){
			if(isFunction(item)){
				for(i = 0, l = src.length; i < l;){
					if(item(src[i], i, src)){
						if(callback){
							if(context){
								callback.call(context, src[i], i, src);
							}else{
								callback(src[i], i, src);
							}
						}
						src.splice(i, 1);
						l--;
						c++;
					}else{
						i++;
					}
				}
			}else{
				while((i = src.indexOf(item)) > -1){
					if(item !== undefined && callback){
						if(context){
							callback.call(context, item, i, src);
						}else{
							callback(item, i, src);
						}
					}
					src.splice(i, 1);
					l--;
					c++;
				}
			}
		}
		if(isArray(items)){
			forEach(items, function(item){
				_do(item);
			});
		}else{
			_do(items);
		}
		return c;
	};
	rias.sort = function(arr, func){
		if(isArray(arr)){
			return arr.sort(func);
		}
		return arr;
	};
	rias.exchangeItem = function(arr, src, dest){
		///不支持多个相同的 item
		///arr[arr.indexOf(src)] = dest 之后，arr.indexOf(dest) 不正确，需要先获取。
		var i = arr.indexOf(dest);
		arr[arr.indexOf(src)] = dest;
		arr[i] = src;
	};
	//rias.filterByQuery = function(arr, query){
	//	return rias.filter(arr, function (item) {
	//		return true;
	//	});
	//};
	//rias.queryArray = function(arr, query, options){
	//	return QueryResults(SimpleQueryEngine(query, options)(arr));
	//};

	rias.min = function(args){
		var result = (arguments || [])[0],
			t;
		for(var i = 1, l = arguments.length; i < l; i++){
			t = typeof arguments[i];
			if(t === "number" || t === "string"){
				if (arguments[i] < result){
					result = arguments[i];
				}
			}
		}
		return result;
	};
	rias.max = function(args){
		var result = (arguments || [])[0],
			t;
		for(var i = 1, l = arguments.length; i < l; i++){
			t = typeof arguments[i];
			if(t === "number" || t === "string"){
				if (arguments[i] > result){
					result = arguments[i];
				}
			}
		}
		return result;
	};

	rias.date = date;
	rias.date.getFirstDayOfWeek = supplemental.getFirstDayOfWeek;
	rias.date.getWeekend = supplemental.getWeekend;
	rias.date.fromISOString = dateStamp.fromISOString;
	rias.date.toISOString = dateStamp.toISOString;
	rias.dateLocale = dateLocale;
	var _datetime = rias.datetime = {};
	_datetime.defaultDateFormatStr = "yyyy-MM-dd";
	_datetime.defaultTimeFormatStr = "HH:mm:ss";
	_datetime.defaultFormatStr = _datetime.defaultDateFormatStr + " " + _datetime.defaultTimeFormatStr;
	rias.toDatetime = _datetime.toDatetime = function(datetime){
		if(!rias.isDate(datetime)){
			return new Date(datetime);
		}
		return datetime;
	};
	rias.ymdToDatetime = _datetime.ymdToDatetime = function(ymd){
		///只支持 4位年份，其他的需另行定义
		if(ymd < 10000101 || ymd > 99991231){
			throw "Invalid Date";
		}
		ymd = ymd + "";
		ymd = ymd.substring(0, 4) + "/" + ymd.substring(4, 6) + "/" + ymd.substring(6, 8);
		return new Date(ymd);
	};
	rias.formatDatetime = _datetime.format = function(datetime, formatStr){
		if(datetime == undefined){
			return "";
		}
		if(!rias.isDate(datetime)){
			if(datetime){
				datetime = new Date(datetime);
			}else{
				datetime = new Date();
			}
		}
		if(isString(formatStr)){
			return rias.dateLocale.format(datetime, {
				selector: 'time',
				timePattern: formatStr || _datetime.defaultFormatStr
			});
		}
		return rias.dateLocale.format(datetime, {
			selector: 'time',
			timePattern: _datetime.defaultFormatStr
		});
	};
	/*if(!Date.prototype.format){
		Date.prototype.format = function(fmt){
			var k,
				o = {
					"M+" : this.getMonth() + 1,                 //月份
					"d+" : this.getDate(),                    //日
					"h+" : this.getHours(),                   //小时
					"m+" : this.getMinutes(),                 //分
					"s+" : this.getSeconds(),                 //秒
					"q+" : Math.floor((this.getMonth() + 3) / 3), //季度
					"S"  : this.getMilliseconds()             //毫秒
				};
			if(/(y+)/.test(fmt))
				fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substring(4 - RegExp.$1.length));
			for(k in o)
				if(new RegExp("("+ k +")").test(fmt))
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substring(("" + o[k]).length)));
			return fmt;
		};
	}*/

	var escapeString = rias.escapeString = function(/*String*/str){
		// summary:
		//		Adds escape sequences for non-visual characters, double quote and
		//		backslash and surrounds with double quotes to form a valid string
		//		literal.
		return ('"' + str.replace(/(["\\])/g, '\\$1') + '"')
			.replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n")
			.replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r"); // string
	};
	rias.json = {
		parse: json.parse,
		//stringify: json.stringify
		stringify: function(value, replacer, spacer, args){
			var objPath = [],
				undef;
			if(rias.isBoolean(args)){
				args = {
					prettyPrint: args
				};
			}else if(!isObjectExact(args)){
				args = {};
			}
			if(typeof replacer === "string"){
				spacer = replacer;
				replacer = null;
			}
			function stringify(it, indent, key){
				if(replacer){
					it = replacer(key, it);
				}
				if(it === null){
					return "null";
				}
				var val, objtype = typeof it;
				switch(objtype){
					case "number":
						return isFinite(it) ? it + "" : "null";
					case "boolean":
						return it + "";
					case "string":
						return escapeString(it);
					case "undefined":
						return undef; //直接返回 undef 变量，即undefined
					case "function":
						if(args.includeFunc == true){
							return it.toString();
						}else if(args.includeFuncHeader == true){
							return _getF(it);
						}
						return undef; //直接返回 undef 变量，即undefined
				}
				/*if(objtype === "number"){
					return isFinite(it) ? it + "" : "null";
				}
				if(objtype === "boolean"){
					return it + "";
				}
				if(typeof it === "string"){
					return escapeString(it);
				}
				if(objtype === "undefined"){
					return undef; //直接返回 undef 变量，即undefined
				}
				if(objtype === "function"){
					if(args.includeFunc == true){
						return it.toString();
					}else if(args.includeFuncHeader == true){
						return _getF(it);
					}else{
						return undef; //直接返回 undef 变量，即undefined
					}
				}*/
				// short-circuit for objects that support "json" serialization
				// if they return "self" then just pass-through...
				if(typeof it.toJSON === "function"){
					return stringify(it.toJSON(key), indent, key);
				}
				if(it instanceof Date){
					return '"{FullYear}-{Month+}-{Date}T{Hours}:{Minutes}:{Seconds}Z"'.replace(/\{(\w+)(\+)?\}/g, function(t, prop, plus){
						var num = it["getUTC" + prop]() + (plus ? 1 : 0);
						return num < 10 ? "0" + num : num;
					});
				}
				if(isFunction(it.valueOf) && it.valueOf() !== it){
					// primitive wrapper, try again unwrapped:
					return stringify(it.valueOf(), indent, key);
				}
				var nextIndent= spacer ? (indent + spacer) : "";
				/* we used to test for DOM nodes and throw, but FF serializes them as {}, so cross-browser consistency is probably not efficiently attainable */

				var sep = spacer ? " " : "";
				var newLine = spacer ? "\n" : "";

				// array
				if(it instanceof Array){
					var itl = it.length, res = [];
					for(key = 0; key < itl; key++){
						var obj = it[key];
						val = stringify(obj, nextIndent, key);
						if(typeof val !== "string"){
							val = "null";
						}
						res.push(newLine + nextIndent + val);
					}
					return "[" + res.join(",") + newLine + indent + "]";
				}
				// generic object code path
				if(contains(objPath, it)){
					if(args.loopToString != true){
						console.error("rias.json.stringify(it): it has circular reference.", it, objPath);
						//throw rias.mixin(new Error("rias.json.stringify(it): it has circular reference."), {it: it, objPath: objPath});
					}else{
						console.warn("rias.json.stringify(it): it has circular reference.", it, objPath);
						return "rias.json.stringify(it): it has circular reference." + it + ", " + objPath;
						/*return rias.toJson(it, {
							prettyPrint: args.prettyPrint,
							includeFunc: args.includeFunc,
							includeFuncHeader: args.includeFuncHeader,
							loopToString: args.loopToString,
							errorToString: args.errorToString,
							simpleObject: true,//args.simpleObject,
							ignoreProperty_: args.ignoreProperty_
						});*/
					}
				}
				if(args.simpleObject == true){
					if(isObjectExact(it) && !isObjectSimple(it)){
						return it.toString();
					}
				}
				objPath.push(it);
				var output = [];
				for(key in it){
					//if(key == "__riasrWidget"){
					//	if(rias.isDebug){
					//		console.error(key, it);
					//	}else{
					//		console.error("__riasrWidget:", key);
					//	}
					//}
					var keyStr;
					if(it.hasOwnProperty(key)){
						if(typeof key === "number"){
							keyStr = '"' + key + '"';
						}else if(typeof key === "string"){
							if(args.ignoreProperty_ == true && key.startWith("_") && !key.startWith("_rias")){
								continue;
							}
							keyStr = escapeString(key);
						}else{
							// skip non-string or number keys
							continue;
						}
						try{
							val = stringify(it[key], nextIndent, key);
						}catch(e){
							if(args.errorToString != true){
								throw "rias.json.stringify(" + it + "[" + key + "]): " + e;
							}else{
								val = "rias.json.stringify(" + it + "[" + key + "]): " + e.message;
							}
						}
						if(typeof val !== "string"){
							// skip non-serializable values
							continue;
						}
						// At this point, the most non-IE browsers don't get in this branch
						// (they have native JSON), so push is definitely the way to
						output.push(newLine + nextIndent + keyStr + ":" + sep + val);
					}
				}
				objPath.pop();
				return "{" + output.join(",") + newLine + indent + "}"; // String
			}
			return stringify(value, "", "");
		}
	};
	rias.toJson = function(/*Object*/ it, args){
		//args = {
		//	prettyPrint: false,
		//	includeFunc: false,
		//	loopToString: false,
		//	errorToString: false,
		//	simpleObject: false,
		//	ignoreProperty_: false
		//};
		if(rias.isBoolean(args)){
			args = {
				prettyPrint: args
			};
		}else if(!isObjectExact(args)){
			args = {};
		}
		return rias.json.stringify(it, function(key, value){
			if(value){
				var tf = value.__json__ || value.json;
				if(typeof tf === "function"){
					return tf.call(value);
				}
			}
			return value;
		}, args.prettyPrint && "\t", args);	// String
	};
	//rias.fromJson = json.fromJson;
	rias.fromJson = function(js, test){
		try{
			return eval("(" + js + ")"); // Object
		}catch(e){
			if(test != true){
				console.error(e);
			}
			throw e;
		}
	};
	/*rias.fromJsonFunc = function(js){
		try{
			return (new Function("","return " + js))();
		}catch(e){
			console.error(e);
			throw e;
		}
	};*/

	rias._hitchArgs = dojo._hitchArgs = lang._hitchArgs = function(scope, method){
		var pre = argsToArray(arguments, 2);
		var named = isString(method);
		return function(){
			// arrayify arguments
			var args = argsToArray(arguments);
			// locate our method
			var f = named ? (scope || dojo.global)[method] : method;
			if(rias.debugStackTrace){
				arguments.stack = rias.getStackTrace(arguments);
			}
			try{
				// invoke with collected args
				return f && f.apply(scope || this, pre.concat(args)); // mixed
			}catch(e){
				console.error(e, rias.getStackTrace(arguments));
				//throw e;
			}
		}; // Function
	};
	var hitch = rias.hitch = lang.hitch = function(scope, method){
		if(arguments.length > 2){
			return rias._hitchArgs.apply(rias, arguments); // Function
		}
		if(!method){
			method = scope;
			scope = null;
		}
		if(isString(method)){
			scope = scope || dojo.global;
			if(!scope[method]){
				throw(['lang.hitch: scope["', method, '"] is null (scope="', scope, '")'].join(''));
			}
			return function(){
				if(rias.debugStackTrace){
					arguments.stack = rias.getStackTrace(arguments);
				}
				try{
					return scope[method].apply(scope, arguments || []);
				}catch(e){
					console.error(e, rias.getStackTrace(arguments));
					//throw e;
				}
			}; // Function
		}
		return !scope ? method : function(){
			if(rias.debugStackTrace){
				arguments.stack = rias.getStackTrace(arguments);
			}
			try{
				return method.apply(scope, arguments || []);
			}catch(e){
				console.error(e, rias.getStackTrace(arguments));
				//throw e;
			}
		}; // Function
	};
	rias.delegate = dojo.delegate = lang.delegate;
	rias.partial = dojo.partial = lang.partial;
	function getProp(/*Array*/parts, /*Boolean*/create, /*Object*/context){
		if(!context){
			if(parts[0] && dojo.scopeMap[parts[0]]) {
				// Voodoo code from the old days where "dojo" maps to some special object
				// rather than just window.dojo
				context = dojo.scopeMap[parts.shift()][1];
			}else{
				context = dojo.global;
			}
		}

		try{
			for(var i = 0; i < parts.length; i++){
				var p = parts[i];
				if(!(p in context)){
					if(create){
						context[p] = {};
					}else{
						return;		// return undefined
					}
				}
				context = context[p];
			}
			return context; // mixed
		}catch(e){
			// "p in context" throws an exception when context is a number, boolean, etc. rather than an object,
			// so in that corner case just return undefined (by having no return statement)
		}
	}
	rias.setObject = dojo.setObject = lang.setObject = function(name, value, context){
		var parts = name.split("."),
			p = parts.pop(),
			obj = getProp(parts, true, context);
		return obj && p ? (isFunction(obj.set) ? obj.set(p, value) : obj[p] = value) : undefined; // Object
	};
	var getObject = rias.getObject = dojo.getObject = lang.getObject = function(name, create, context){
		return getProp(name ? name.split(".") : [], create, context); // Object
	};

	rias.require = require;
	/*var _requireWatchErrorHandle;
	rias.require._riasrWatch = function(moduleName, type, func){
		try{
			if(type == "error" && !_requireWatchErrorHandle){
				_requireWatchErrorHandle = rias.subscribe("rias.require.error", function(arg){
					console.error(arg.message, arg.info, rias.getStackTrace(arg));
				});
			}
		}catch(e){
			console.error("rias.require._riasrWatch error: ", moduleName, type, e);
		}
	};*/
	require.on("error", function(arg){
		try{
			console.error(arg.message, arg.info, arg.src, rias.getStackTrace(arg));
			//if(isFunction(rias.publish)){
			//	rias.publish("rias.require.error", arg);
			//}
		}catch(e){
			console.error("require error: ", arg, rias.getStackTrace(arg));
		}
	});
	rias.loadModule = dojo.require;
	rias.undef = function(moduleId, referenceModule){
		///FIXME:zensst.大小写，以及 deps（依赖）
		if(!isFunction(rias.require.undef)){
			console.error("There's no rias.require.undef.");
			return;
		}
		var m = rias.require.modules[moduleId];
		if(m){
			m._riasrUndef = true;
			if(m.executed){
				console.info("rias.undef: " + moduleId);
			}
			///require.undef 会清空 m.node，应先 removeChild
			if(m.node && m.node.parentNode){
				m.node.parentNode.removeChild(m.node);
			}
			rias.require.undef(moduleId, referenceModule);
			//if(rias.require.modules[moduleId]){
			//	delete rias.require.modules[moduleId];
			//}
			delete m.injected;
		}
	};
	rias.safeMixin = declare.safeMixin;
	rias.define = define;
	rias.declare = function(className, superclass, props){
		return rias.extendAttrs(declare(className, superclass, props));
	};
	///dojo.extend 不是 declare.extend，即不是 safeMixin，只是 mixin。
	//rias.extend = dojo.extend;// = lang.extend;///隐藏，避免歧义
	rias.prototypeExtend = lang.extend;
	rias.extendAttrs = function(ctor){
		var N,
			p = ctor.prototype;
		if(isObject(p._initAttrs)){
			forEach(p._initAttrs, function(v, name){
				N = rias.upperCaseFirst(name);
				if(!isFunction(p["_set" + N + "Attr"])){
					p["_set" + N + "Attr"] = function(value){
						return this._set(name, value);///触发 watch/_onAttr
					};
				}
			});
		}
		if(ctor._meta){
			forEach(ctor._meta.bases, function(m){///[0] 是自身类定义，[length - 1] 是 BaseClass
				forEach(m.prototype._initAttrs, function(v, name){
					if(!(name in p._initAttrs)){
						p._initAttrs[name] = v;
					}
				});
			});
		}
		return ctor;
	};

	rias.baseUrl = rias.require.baseUrl;
	rias.toUrl = rias.require.toUrl;

	var __riasrDeferredId = 0;
	rias.defaultDeferredTimeout = 30;
	rias.newDeferred = function(canceler, timeout, timeoutCall){
		var d, f, args = arguments;
		if(isString(canceler)){
			d = new Deferred(function(){
				return "Deferred cancel - " + canceler;
			});
		}else{
			d = new Deferred(canceler);
		}
		d.__riasrDeferredId__ = __riasrDeferredId++;
		d.__riasrDeferredHint__ = canceler;
		function remove(){
			if(f){
				f.remove();
				f = undefined;
			}
		}
		if(timeout > 0){
			f = rias.defer(function(){
				remove();
				if(!d.isFulfilled()){
					args = d.__riasrArgs = argsToArray(args, 3);
					//console.debug("Deferred timeout, " + timeout + " seconds.", args);
					console.error(args, rias.getStackTrace(d));
					if(isFunction(timeoutCall)){
						timeoutCall.apply(d, args);
					}
				}
			}, timeout * 1000);
			if(rias.debugStackTrace){
				d.stack = rias.getStackTrace(d);
			}
			///注意：不能阻断 reject。
			///reject 时，由 defer 自身 remove
			d.then(function(result){
				remove();
				return result;
			});
		}
		return d;
	};
	rias.newDeferredReject = function(result){
		var d = new Deferred();
		d.reject(result);
		return d.promise;
	};
	rias.Deferred = Deferred;
	rias.when = when;
	rias.first = first;
	//rias.all = all;
	rias.all = function(arr, timeout, timeoutCall){
		var d, args = arguments;
		d = rias.newDeferred("rias.all", timeout, function(){
			if(isFunction(timeoutCall)){
				timeoutCall.apply(d, args);
			}
		});
		args = d.__riasrArgs = [arr].concat(argsToArray(args, 3));
		all(arr).then(function(result){
			d.resolve(result);
		}, function(result){
			d.reject(result);
		});
		return d.promise;
	};
	/*rias.all = function(objectOrArray){
		///动态改变 objectOrArray 内容过于复杂，且实际意义不大，不打算实现。
		var object, array,
			results,
			keyLookup = [],
			deferred = new Deferred();
		if(objectOrArray instanceof Array){
			array = objectOrArray;
		}else if(isObjectExact(objectOrArray)){
			object = objectOrArray;
		}
		if(object){
			array = [];
			for(var key in object){
				if(Object.hasOwnProperty.call(object, key)){
					keyLookup.push(key);
					array.push(object[key]);
				}
			}
			results = {};
		}else if(array){
			results = [];
		}


		if(!array || !array.length){
			return deferred.resolve(results);
		}

		deferred.promise.always(function(){
			results = keyLookup = null;
		});
		var waiting = array.length;
		rias.some(array, function(valueOrPromise, index){
			if(!object){
				keyLookup.push(index);
			}
			rias.when(valueOrPromise, function(value){
				if(!deferred.isFulfilled()){
					results[keyLookup[index]] = value;
					if(--waiting === 0){
						deferred.resolve(results);
					}
				}
			}, deferred.reject);
			return deferred.isFulfilled();
		});
		return deferred.promise;	// dojo/promise/Promise
	};*/
	rias.allInOrder = function(arr, timeout, timeoutCall, callback, forceContinue){
		var d, args = arguments,
			a = [].concat(arr), i = 0,
			rs = [];
		d = rias.newDeferred("rias.allInOrder", timeout, function(){
			if(isFunction(timeoutCall)){
				timeoutCall.apply(d, args);
			}
		});
		args = d.__riasrArgs = [arr].concat(argsToArray(args, 5));

		function _do(){
			if(!a.length){
				d.resolve(rs);
			}else{
				var item = a.shift();
				rias.when(rias.isFunction(callback) ? callback(item, i++) : rias.isFunction(item) ? item() : item).then(function(result){
					rs.push(result);
					_do();
				}, function(e){
					console.error(e);
					rs.push(e);
					if(forceContinue){
						_do();
					}else{
						while(a.length){
							item = a.shift();
							if(rias.isDeferred(item)){
								item.cancel();
							}
						}
						d.reject(rs);
					}
				});
			}
		}
		_do();
		return d.promise;
	};

	//rias.topic = topic;
	//rias.publish = topic.publish;
	rias.publish = function(target, topicName, event){
		if(rias.isString(target)){
			return topic.publish(target, topicName);
		}
		if(!rias.isRiasw(target)){
			throw "rias.publish need a riasWidget target.";
		}
		if(target.isDestroyed(false)){
			console.error("The target is destroyed when publish " + topicName, target);
			return;
		}
		if(!target._riasrTopic){
			target._riasrTopic = new Evented;
		}
		return target._riasrTopic.emit.apply(target._riasrTopic, [topicName, event]);
	};
	//rias.subscribe = topic.subscribe;
	rias.subscribe = function(target, topicName, listener){
		if(rias.isString(target)){
			return topic.subscribe(target, topicName);
		}
		if(!rias.isRiasw(target)){
			throw "rias.subscribe need a riasWidget target.";
		}
		if(!target._riasrTopic){
			target._riasrTopic = new Evented;
		}
		return target._riasrTopic.on.apply(target._riasrTopic, [topicName, listener]);
	};

	rias.cache = cache;

	i18n.registerBundle = function(/*Array*/bundle){
		// summary:
		//		Accumulates the given localized resources in an array and returns
		//		it.
		if(!i18n.bundle){
			i18n.bundle = [];
		}
		return lang.mixin(i18n.bundle, bundle);
	};
	i18n.loadBundle = function(/*String*/packageName, /*String*/bundleName, /*String?*/locale){
		// summary:
		//		Loads an nls resource bundle and returns an array of localized
		//		resources.
		return i18n.registerBundle(i18n.getLocalization(packageName, bundleName, locale));
	};
	rias.i18n = rias.delegate(i18n);///做成委托好些，避免修改原型。
	rias.i18n.sys = riasI18n.sys;
	rias.i18n.desktop = riasI18n.desktop;
	rias.i18n.action = riasI18n.action;
	rias.i18n.message = riasI18n.message;

	rias.sleep = function(delay){
		var _dt0 = new Date();
		delay = delay > 0 ? delay : 1000;
		while(true){
			if(new Date() - _dt0 >= delay){
				break;
			}
		}
	};
	rias.defer = function(callback, delay, scope, args){
		if(isString(callback)){
			if(!scope[callback]){
				throw("rias.defer: " + scope + "['" + callback + "'] is null.");
			}
			callback = scope[callback];
		}
		args = argsToArray(arguments, 3);
		var timer = setTimeout(function(){
			if(!timer){
				return;
			}
			timer = null;
			try{
				callback.apply(scope, args);///IE8 不支持 args = undefined。
			}catch(e){
				console.error("rias.defer()", e, rias.getStackTrace(args));
				//throw e;
			}
		}, delay || 0);
		if(rias.debugStackTrace){
			args.stack = rias.getStackTrace(args);
		}
		return {
			remove: function(){
				if(timer){
					clearTimeout(timer);
					timer = null;
				}
				return null; // so this works well: handle = handle.remove();
			}
		};
	};
	rias._defaultThrottleDelay = 50;
	//rias._throttle = function (func, threshold, alt) {
	//	var last = Date.now();
	//	threshold = threshold || 100;
	//	return function () {
	//		var now = Date.now();
	//		if (now - last < threshold) {
	//			if (alt) {
	//				alt.apply(this, arguments);
	//			}
	//			return;
	//		}
	//		last = now;
	//		func.apply(this, arguments);
	//	};
	//};
	var _throttleCache = {};
	rias._throttle = function(id, callback, scope, delay, callPass){
		/// 调用一开始即执行 callback，并在 delay 时间内不再执行，类似 keydown
		/// callback
		/// |------delay------|callback
		///                   |------delay------|...
		// summary:
		//		Returns a function which calls the given callback at most once per
		//		delay milliseconds.  (Inspired by plugd)
		if(isFunction(id)){
			callPass = delay;
			delay = scope;
			scope = callback;
			callback = id;
			id = "";
		}else{
			id = id + "";
		}
		var f, r;
		r = function (){
			var stack;
			if(rias.debugStackTrace){
				stack = rias.getStackTrace();
			}
			var a = arguments || [];
			var cb = setTimeout(function(){
				r.remove();
			}, delay || rias._defaultThrottleDelay);
			var cp = function(){
				if(isFunction(callPass)){
					try{
						callPass.apply(scope, a);
					}catch(e){
						console.error(e, stack);
						//throw e;
					}
				}
			};
			if(id){
				if(_throttleCache[id]){
					cp();
					return;
				}
				_throttleCache[id] = cb;
			}else{
				if (f) {
					cp();
					return;
				}
				f = cb;
			}
			try{
				callback.apply(scope, a);
			}catch(e){
				console.error(e, stack);
				//throw e;
			}
		};
		r.remove = function(){
			if(f){
				clearTimeout(f);
				f = undefined;
			}
			if(id){
				clearTimeout(_throttleCache[id]);
				delete _throttleCache[id];
			}
		};
		return r;
	};
	var _throttleDelayedCache = {};
	rias._throttleDelayed = function(id, callback, scope, delay, callPass){
		/// 调用开始的 delay 时间后执行 callback，并在 delay 时间内不再执行，类似 keyup
		/// |------delay------|callback
		///                   |------delay------|callback...
		// summary:
		//		Like throttle, except that the callback runs after the delay,
		//		rather than before it.
		if(isFunction(id)){
			callPass = delay;
			delay = scope;
			scope = callback;
			callback = id;
			id = "";
		}else{
			id = id + "";
		}
		var f, r;
		r = function (){
			if(rias.debugStackTrace){
				var stack = rias.getStackTrace();
			}
			var a = arguments || [];
			var cb = setTimeout(function () {
				r.remove();
				try{
					callback.apply(scope, a);
				}catch(e){
					console.error(e, stack);
					//throw e;
				}
			}, delay || rias._defaultThrottleDelay);
			var cp = function(){
				if(isFunction(callPass)){
					try{
						callPass.apply(scope, a);
					}catch(e){
						console.error(e, stack);
						//throw e;
					}
				}
			};
			if(id){
				if (_throttleDelayedCache[id]) {
					cp();
					return;
				}
				_throttleDelayedCache[id] = cb;
			}else{
				if (f) {
					cp();
					return;
				}
				f = cb;
			}
		};
		r.remove = function(){
			if(f){
				clearTimeout(f);
				f = undefined;
			}
			if(id){
				clearTimeout(_throttleDelayedCache[id]);
				delete _throttleDelayedCache[id];
			}
		};
		return r;
	};
	var _debounceCache = {};
	rias._debounce = function(id, callback, scope, delay, callPass){
		/// 调用开始的 delay 时间后不再有调用时才执行 callback，类似 defer once
		/// |------delay------|
		///          |------delay------|
		///                           |------delay------|callback...
		// summary:
		//		Returns a function which calls the given callback only after a
		//		certain time has passed without successive calls.  (Inspired by plugd)
		if(isFunction(id)){
			callPass = delay;
			delay = scope;
			scope = callback;
			callback = id;
			id = "";
		}else{
			id = id + "";
		}
		var f, r;
		r = function () {
			if(rias.debugStackTrace){
				var stack = rias.getStackTrace();
			}
			var a = arguments || [];
			var cb = setTimeout(function () {
				r.remove();
				try{
					callback.apply(scope, a);
				}catch(e){
					console.error(e, stack);
					//throw e;
				}
			}, delay || rias._defaultThrottleDelay);
			var cp = function(){
				if(isFunction(callPass)){
					try{
						callPass.apply(scope, a);
					}catch(e){
						console.error(e, stack);
						//throw e;
					}
				}
			};
			if(id){
				if (_debounceCache[id]) {
					r.remove();
					cp();
				}
				_debounceCache[id] = cb;
			}else{
				if(f){
					clearTimeout(f);
					cp();
				}
				f = cb;
			}
		};
		r.remove = function(){
			if(f){
				clearTimeout(f);
				f = undefined;
			}
			if(id){
				clearTimeout(_debounceCache[id]);
				delete _debounceCache[id];
			}
		};
		return r;
	};

///RiasBase ===============================================///
	rias.fakeConsole = {
		logs: null,
		//logLimit: 49,
		//logLevels: ["error"],
		_hookConsole: function(config){
			/// ie 的 console 没有 prototype、apply、call 等
			var self = this,
				fake = {},
				logLimit = config && config.logLimit || 49,
				logLevels = config && config.logLevels || ["error"];
			var hClear = rias.subscribe("/rias/desktop/clearLog", function(){
				self.clear();
			});
			rias.forEach(logLevels, function(level){
				if(!console[level]._hooked){
					fake[level] = console[level];
					console[level] = function(){
						//self._log(fake, level, "desktop", arguments || []);
						var args = rias.concat([], arguments);
						//if(rias.has("ie") < 11 || level === "error"){
						if(rias.has("ie") < 11){
							args.push(rias.getStackTrace());
						}
						///ie 不能 console[level].apply
						if(fake[level].apply){
							fake[level].apply(console, args);
						}else{/// ie
							Function.prototype.apply.apply(fake[level], [console, args]);
						}
						if(!rias.isArray(self.logs)){
							self.logs = [];
						}
						self.logs.push([(new Date()), level, arguments]);
						if(self.logs.length > logLimit){
							self.logs.shift();
						}
						rias.publish("/rias/console/log", self.logs);
					};
					console[level]._hooked = true;
				}
			});
			return {
				remove: function(){
					for(var n in fake){
						console[n] = fake[n];
					}
					self.clear();
					hClear.remove();
				}
			};
		},
		clear: function(){
			this.logs = [];
			rias.publish("/rias/console/log", this.logs);
		}
	};
	//if(config.hookConsole){
	//	rias._hookConsoleHandle = rias.fakeConsole._hookConsole(config.hookConsole);
	//}

	rias.formResult = {
		frError: -1,
		frNone: 0,
		frSubmit: 1,
		frCancel: 2,
		frAbort: 3,
		frNo: 4,
		isError: function(formResult){
			return formResult === rias.formResult.frError;
		},
		isNone: function(formResult){
			return !formResult;
		},
		isSubmit: function(formResult){
			return formResult === rias.formResult.frSubmit;
		},
		isCancel: function(formResult){
			return formResult === rias.formResult.frCancel;
		},
		isAbort: function(formResult){
			return formResult === rias.formResult.frAbort;
		},
		isNo: function(formResult){
			return formResult === rias.formResult.frNo;
		}
	};

	rias._deleDP = function(p, reserveWE, reserveRW, reserveMM){
		///只应该用于 param，避免 delete _riasrElements 等。
		///destroy 自己处理 delete。
		//delete p._rsfVersion;
		delete p._riasdParams;
		delete p._riaswParams;
		if(!reserveWE){
			delete p._riaswElements;
		}
		if(!reserveRW && p.__riasrWidget){
			//console.debug(p);
			delete p.__riasrWidget;
		}
		delete p._riasrModule;
		if(!reserveMM && p._riaswModuleMeta){
			//console.debug(p);
			delete p._riaswModuleMeta;
		}
		if(p._riasrOwned){
			console.error("Cannot _deleDP the runtime params: ", p);
		}
		delete p._riasrPersist;
		delete p._riasrTopic;
		delete p._riasrChildren;
		delete p._riasrContainer;
		delete p._riasrOwner;
		delete p._riasrOwned;
		delete p._riasrElements;
	};

	var _catCounter = {};
	rias.rt = {
		// summary:
		//		Registry of existing widget, plus some utility methods.

		// In case someone needs to access this._widgets.
		// Actually, this is accessed from WidgetSet back-compatibility code
		_widgets: {},
		// length: Number
		//		Number of registered widgets
		length: 0,

		add: function(widget){
			// summary:
			//		Add a widget to the this._widgets. If a duplicate ID is detected, a error is thrown.
			// widget: rias.ObjectBase 或 riasw.sys._WidgetBase
			if(this._widgets[widget.id]){
				throw new Error("Tried to register widget with id==" + widget.id + " but that id is already registered");
			}
			this._widgets[widget.id] = widget;
			this.length++;
		},
		remove: function(/*String*/ id){
			// summary:
			//		Remove a widget from the this._widgets. Does not destroy the widget; simply
			//		removes the reference.
			if(this._widgets[id]){
				delete this._widgets[id];
				this.length--;
			}
		},

		byId: function(/*String|Widget*/ id){
			// summary:
			//		Find a widget by it's id.
			//		If passed a widget then just returns the widget.
			return typeof id === "string" ? this._widgets[id] : id; // rias.Destroyable
		},
		toArray: function(){
			// summary:
			//		Convert this._widgets into a true Array
			//
			// example:
			//		Work with the widget .domNodes in a real Array
			//		|	array.map(this._widgets.toArray(), function(w){ return w.domNode; });

			return rias.objToArray(this._widgets);
		},

		_getUniqueCat: function(widget, wholeTypeName){
			widget = (widget._riaswType || widget.declaredClass || (isString(widget) ? widget : "riasWidget"));
			if(!wholeTypeName){
				widget = widget.split('.').pop();
			}
			return rias.lowerCaseFirst(widget);
		},
		getUniqueId: function(/*String*/id, module){
			var m = (rias.isRiaswModule(module) ? module : rias.desktop ? rias.desktop : undefined),
				t = (id || m && m.id || "id"),//.replace(/\./g, "_"),
				c = (m && m._catCounter ? m._catCounter : _catCounter);
			do{
				id = t + (t in c ? ++c[t] : c[t] = 1);
			}while(this._widgets[id] || rias.getObject(id) || m && (m[id] || rias.desktop.byId(id) || rias.desktop.byId(m.id + "_" + id)));
			return id;
		}
	};

/// Stateful ==================================================================///
	rias.Stateful = Stateful;
	rias.Stateful.extend({
		toString: function(){
			return "[rias.Stateful, " + (this.id || "NO ID") + "]";
		},
		is: function(ctor){
			return rias.is(this, ctor);
		}
	});

/// Destroyable ==================================================================///
	rias.isDestroyed = function(widget, checkAncestors){
		//widget = rias.by(widget);
		var d = !widget || widget._destroyed || widget._riasrDestroying;// || widget._beingDestroyed;
		if(!d && checkAncestors){
			while(!d && widget._riasrOwner && (widget = widget._riasrOwner)){
				d = widget._destroyed || widget._riasrDestroying;// || widget._beingDestroyed;
			}
		}
		return !!d;
	};
	rias.destroy = function(/*riasWidget|DOMNode|String*/ any, preserveDom){
		if(any){
			var w = rias.by(any);
			if(w){
				//if(!w._beingDestroyed){
					if(!w._destroyed && !w._riasrDestroying){
						if(isFunction(w.destroy)){
							w.destroy(preserveDom);
						}else if(isFunction(w.remove)){
							w.remove(preserveDom);
						}
						w._destroyed = true;
					}
					//w._beingDestroyed = true;
				//}
			}else{
				if(rias.dom){
					w = rias.dom.byId(any);
				}
				if(w){
					if(rias.isDomNode(w)){
						rias.dom.destroy(w);
					}else if(isFunction(w.remove)){
						w.remove();
					}
				}else{
					if(any && isFunction(any.destroy)){///非 Destroyable(riasWidget) 对象
						any.destroy();
					}else if(any && isFunction(any.remove)){
						any.remove();
					}
				}
			}
		}
	};

	var __riasrId = 0,
		__riasrOwnedId = 0;
	var Destroyable = rias.declare("rias.Destroyable", null, {
		// summary:
		//		Mixin to track handles and release them when instance is destroyed.
		// description:
		//		Call this.own(...) on list of handles (returned from dojo/aspect, dojo/on,
		//		dojo/Stateful::watch, or any class (including widgets) with a destroyRecursive() or destroy() method.
		//		Then call destroy() later to destroy this instance and release the resources.

		toString: function(){
			return "[rias.Destroyable, " + (this.id || "NO ID") + "]";
		},

		persist: false,

		is: function(ctor){
			return rias.is(this, ctor);
		},
		isElementOf: function(obj){
			if(!obj){
				return false;
			}
			var owner = this.getOwnerRiasw();
			while(owner){
				if(owner === obj){
					return true;
				}
				owner = owner.getOwnerRiasw();
			}
			return false;
		},
		ownerModule: function(){
			return this._riasrModule;
		},

		postscript: function(/*Object?*/params){
			if(!this.__riasrId){
				this.__riasrId = __riasrId++;
			}
			try{
				this.create.apply(this, arguments || []);
			}catch(e){
				/// this._riasrCreateError 使用 Array 而不是直接赋值 是为了更加准确地表明 存在 error。
				/// this._riasrCreateError 只有 [0] 有效。
				if(!this._riasrCreateError){
					this._riasrCreateError = [];
				}
				this._riasrCreateError.push(e);
				console.error(e);
			}
		},
		create: function(params){
			this._introspect();
			if(params){
				this.params = params;
				rias.mixin(this, params);
			}
			this.postMixInProperties();
			this._created = true;///提前，只要 buildRendering 即表示已经 create。后面需要判断。

			rias.rt.add(this);

			this._applyAttributes();

			this.postCreate(params);
		},

		_initRiasW: function(params, errCall){
			var w = this,
				owner = params.ownerRiasw || params._riasrOwner,
				s, m;

			w._riasrCreated = true;///下面需要用到
			///改在 _WidgetBase.postCreate 中设置。
			//if(w.domNode){
			//	w.domNode.__riasrWidget = w;
			//}

			if(!w._riaswType){
				w._riaswType = w.declaredClass;
			}
			//w._riaswVersion 保留原生的 _riaswVersion
			//if(!w._riaswParams){
			//	w._riaswParams = rias.mixinDeep({}, params._riaswParams);
			//}
			//if(w._riaswParams){
			//	///保留设计值，删除运行期值
			//	rias._deleDP(w._riaswParams, true, true, true);
			//}
			if(!w._riaswElements){
				w._riaswElements = [];
			}

			w.setOwnerRiasw(owner);
			owner = w.getOwnerRiasw();

			if(w._riaswIdInModule && !rias.isRiaswDesktop(w)){
				if(isString(w._riaswIdInModule)){
					if(~(w._riaswIdInModule.indexOf("."))){
						s = "The widget._riaswIdInModule(" + w._riaswIdInModule + ") cannot contains \".\". ";
						console.error(s, w);
						if(isFunction(errCall)){
							hitch(this, errCall)(new Error(s));
						}
					}
					if((w._riaswIdInModule.indexOf("_p_") === 0)){
						s = "The widget._riaswIdInModule(" + w._riaswIdInModule + ") cannot begin with '_p_', because it is reserved. ";
						console.error(s, w);
						if(isFunction(errCall)){
							hitch(this, errCall)(new Error(s));
						}
					}
					m = w.ownerModule();
					if(m){
						if(rias.getObject(w._riaswIdInModule, false, m)){
							//if(rias.hostBrowser){
							//}
							s = "Duplication _riaswIdInModule['" + w._riaswIdInModule + "'] in module['" + m.id + "']";
							console.error(s, w);
							if(isFunction(errCall)){
								hitch(this, errCall)(new Error(s));
							}
						}else{
							rias.setObject(w._riaswIdInModule, w, m);
						}
					}
				}else{
					s = "The widget._riaswIdInModule(" + w._riaswIdInModule + ") must be a String.";
					console.error(s, w);
					if(isFunction(errCall)){
						hitch(this, errCall)(s);
					}
				}
			}

			try{
				if(!w._riasrOwner){
					if(rias.desktop && w !== rias.desktop){
						rias.desktop.own(w);
						if(rias.isDebug){
							console.debug("The widget('" + (w.id || w.name || w._riaswType) + "')._riasrOwner set to the rias.desktop.", params);
						}
					//}else{
					}
				}
				//rias.desktop.addWidget(w);
			}catch(e){
				console.error(w, e);
				if(isFunction(errCall)){
					hitch(this, errCall)(e);
				}
			}
			if(!w._riasrOwner && !rias.isRiaswDesktop(w)){
				if(rias.isDebug){
					console.debug("The widget('" + (w.id || w.name || w._riaswType) + "')._riasrOwner is undefined.", params);
				}
			}
			if(!w.id){
				m = w.ownerModule();
				w.id = m && w._riaswIdInModule ? (m.id + "_" + w._riaswIdInModule) :
					w._riasrOwner ? w._riaswAttachPoint ? w._riasrOwner.id + "_" + w._riaswAttachPoint :
						rias.rt.getUniqueId(w._riasrOwner.id + "_" + rias.rt._getUniqueCat(w)) :
						m ? rias.rt.getUniqueId(m.id + "_" + rias.rt._getUniqueCat(w), m) :
							rias.rt.getUniqueId(rias.rt._getUniqueCat(w));
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
			this._riasrOwned = [];
			this._riasrElements = [];
			this._initRiasW(this.params || (this.params = {}));
			rias.publish("/rias/create/start", {
				widget: this,
				params: this.params
			});
		},

		//_initAttrValue: function(){
		//	/// _initAttrValue 初始化执行 _onXXXAttr 的条件是 _initAttrs[name] == true。
		//	var N;
		//	forEach(this._initAttrs, function(v, name){
		//		N = rias.upperCaseFirst(name);
		//		//if(v && isFunction(this["_on" + N + "Attr"])){
		//		if(v && isFunction(this["_on" + N + "Attr"])){
		//			this["_on" + N + "Attr"](this[name]);
		//		}
		//	}, this);
		//},
		postCreate: function(){
			if(this.persist){
				this.loadPersist();
			}
			//this._created = true;移到 create 中，_applyAttributes 之前
			//this._initAttrValue();///初始化执行 _onXXXAttr
			rias.publish("/rias/create/done", {
				widget: this,
				params: this.params
			});
		},
		destroyRiasrChildren: function(/*Boolean?*/ preserveDom){
			forEach(this._riasrElements, function(handle){
				handle = handle._handle;
				rias.destroy(handle, preserveDom);
			});
		},
		_beforeDestroyed: function(){
		},
		_onDestroy: function(){
		},
		_afterDestroyed: function(){
		},
		destroy: function(/*Boolean*/ preserveDom){
			//console.debug("destroy - " + this.id + " - " + rias.__dt() + " ms.");
			//this._beingDestroyed = true;
			if(!this._destroyed && !this._riasrDestroying){

				///这里，beforeDestroyed 放到 _beforeDestroyed 之外，不受 继承 控制。下同。
				if(this.beforeDestroyed){
					this.beforeDestroyed();
				}
				this._beforeDestroyed();

				this._riasrDestroying = true;
				//rias.publish("/rias/destroy/start", {
				//	widget: this
				//});

				if(this.onDestroy){
					this.onDestroy();
				}
				this._onDestroy();
				this.destroyRiasrChildren(preserveDom);
				//this.destroyDescendants(preserveDom);/// dom 结构由 _WidgetBase 维护

				this.orphan();

				this._destroyed = true;
				rias.publish("/rias/destroy/done", {
					widget: this
				});
				if(this.afterDestroyed){
					this.afterDestroyed();
				}
				this._afterDestroyed();
				//console.debug("destroy - " + this.id + " - " + rias.__dt() + " ms.");

				rias.rt.remove(this.id);
			}
			this._destroyed = true;
			this._riasrDestroying = false;
		},
		isDestroyed: function(checkAncestors){
			return rias.isDestroyed(this, checkAncestors != false);
		},

		attributeMap: {},
		_attrPairNames: {}, // shared between all widgets
		_getAttrNames: function(name){
			// summary:
			//		Helper function for get() and set().
			//		Caches attribute name values so we don't do the string ops every time.
			// tags:
			//		private

			var apn = this._attrPairNames;
			if(apn[name]){
				return apn[name];
			}
			var uc = name.replace(/^[a-z]|-[a-zA-Z]/g, function(c){
				return c.charAt(c.length - 1).toUpperCase();
			});
			return (apn[name] = {
				n: name + "Node",
				s: "_set" + uc + "Attr", // converts dashes to camel case, ex: accept-charset --> _setAcceptCharsetAttr
				g: "_get" + uc + "Attr",
				l: uc.toLowerCase()        // lowercase name w/out dashes, ex: acceptcharset
			});
		},
		_get: function(/*String*/ name){
			return this[name];
		},
		/// store 有自己的 get 方法，有冲突。
		/// 如果需要 get 方法，则需要继承自 rias.ObjectBase 或 _WidgetBase，或自己扩展一个。
		//get: function(name){
		//	var names = this._getAttrNames(name);
		//	return this[names.g] ? this[names.g]() : this._get(name);
		//},
		_set: function(/*String*/ name, /*anything*/ value){
			var N = rias.upperCaseFirst(name),
				oldValue = this[name],
				result;
			result = this[name] = value;
			if(this._created && !rias.isEqual(oldValue, value)){
				/// watch 没有 return，故 _onXXXAttr 也没有 return。
				if(isFunction(this["_on" + N + "Attr"])){
					if(!this.isDestroyed(true)){
						result = this["_on" + N + "Attr"](value, oldValue);
					}
				}
				if(this._watchCallbacks){
					this._watchCallbacks(name, oldValue, value);
				}
			}
			return result;
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
			try{
				if(isFunction(setter)){
					result = setter.apply(this, argsToArray(arguments, 1));
				}else{
					result = this._set(name, value);
				}
			}catch(e){
				console.error("set " + this.id + "." + name + " = " + value + " error.\n", e);
				throw e;
			}
			return result;
		},
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
			var params = {};

			for(var key in this.params || {}){
				params[key] = this._get(key);
			}

			// Step 2: Call set() for each property with a non-falsy value that wasn't passed as a parameter to the constructor
			forEach(this.constructor._setterAttrs, function(key){
				if(!(key in params)){
					var val = this._get(key);
					if(val != undefined){
						this.set(key, val);
					}
				}
			}, this);

			//delete params.ownerRiasw;
			// Step 3: Call set() for each property that was specified as parameter to constructor.
			// Use params hash created above to ignore side effects from step #2 above.
			for(key in params){
				this.set(key, params[key]);
			}
		},
		watch: function(/*String?*/name, /*Function*/callback){
			var callbacks = this._watchCallbacks;
			if(!callbacks){
				callbacks = this._watchCallbacks = function(name, oldValue, value, ignoreCatchall){
					var self = this;
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

		setDesigning: function(value){
			value = !!value;
			if(value){
				this._set("_riasrDesigning", value);
			}else{
				delete this._riasrDesigning;
			}
		},
		getDesigning: function(){
			return this._get("_riasrDesigning");
		},

		//_setOwnerRiaswAttr: function(){
		//	throw "The ownerRiasw is readOnly.";
		//},
		setOwnerRiasw: function(owner){
			//owner = rias.by(owner);
			if(owner){
				if(this._riasrOwner !== owner || this.ownerRiasw !== owner){
					if(is(owner, Destroyable)){
						owner.own(this);
					}else{
						//throw new Error("The owner of " + owner + " is not is rias.Destroyable.");
						console.error(this.id + ".setOwnerRiasw: the owner of " + owner + " is not isInstanceOf rias.Destroyable.\n    ----\n" + rias.getStackTrace());
					}
				}
			}else{
				this.orphan();
			}
		},
		getOwnerRiasw: function(){
			return this._riasrOwner;
		},
		getRiasrElements: function(){
			return rias.map(this._riasrElements, function(i){
				return i && i._handle;
			});
		},
		orphan: function(){
			var i,
				owner = this._riasrOwner;
			/// orphan 有可能只是 orphan，而不是 destroy。
			/// orphan 只处理 owner，不处理 container
			if(owner){
				while((i = rias.indexOfByAttr(owner._riasrElements, this, "_handle")) >= 0){
					//console.debug("orphan - " + this.id);
					owner._riasrElements[i]._remove.remove();
					owner._riasrElements.splice(i, 1);

					if(rias.getObject(this._riaswAttachPoint, false, owner) === this){
						delete owner[this._riaswAttachPoint];
					}
				}
				while((i = rias.indexOfByAttr(owner._riasrOwned, this, "_handle")) >= 0){
					//console.debug("orphan - " + this.id);
					owner._riasrOwned[i]._remove.remove();
					owner._riasrOwned.splice(i, 1);
				}
				this._riasrOwner = undefined;
				//this.ownerRiasw = undefined;
				/// 暂时不考虑 rias.desktop.removeWidget.
				//rias.publish("/riasr/orphan", {
				//	widget: this
				//});
			}
			owner = this.ownerModule();
			if(owner && owner[this._riaswIdInModule] === this){
				delete owner[this._riaswIdInModule];
			}
			delete this._riasrModule;
			return this;
		},
		own: function(handles){
			///FIXME:zensst. own(after(destroy))时，有错！执行 after 之前就 remove 了。
			var self = this,
				//i,
				hds,
				cleanupMethods = [
					//"destroyRecursive",
					"destroy",
					"remove"
				];

			//i = self._riasrElements.length;
			hds = rias.concat([], arguments);// [].concat 未做转换和过滤;

			forEach(hds, function(handle){
				// When this.destroy() is called, destroy handle.  Since I'm using aspect.before(),
				// the handle will be destroyed before a subclass's destroy() method starts running, before it calls
				// this.inherited() or even if it doesn't call this.inherited() at all.  If that's an issue, make an
				// onDestroy() method and connect to that instead.
				if(isArray(handle)){
					var callee = arguments.callee;
					forEach(handle, function(_h){
						callee(_h);
					});
					return;
				}
				var destroyMethodName,
					hManualDestroy,
					odh = {
						__riasrOwnedId: ++__riasrOwnedId,
						_handle: handle,
						_remove: rias.after(self, "_afterDestroyed", function (preserveDom){
							///这里是 self.destroy，且 handle 没有 destroy
							try{
								handle[destroyMethodName](preserveDom);
								///正常情况下，handle[destroyMethodName] 包含了 orphan，故下面的代码仅用于检测是否有错。
								//i = self._riasrElements.indexOf(odh);
								//if(i >= 0){
								//	self._riasrElements.splice(i, 1);
								//}
								//i = self._riasrOwned.indexOf(odh);
								//if(i >= 0){
								//	self._riasrOwned.splice(i, 1);
								//}
								//i = self._riasrOwned.indexOf(hManualDestroy);
								//if(i >= 0){
								//	self._riasrOwned.splice(i, 1);
								//}
								rias.removeItems(self._riasrOwned, odh);
								if(rias.removeItems(self._riasrElements, odh)){
									console.error("The handle was not released properly when [" + self.id + "] destroy: ", handle);
								}
								if(rias.removeItems(self._riasrOwned, hManualDestroy) && isRiasObject(handle)){
									console.error("The handle was not released properly when [" + self.id + "] destroy: ", handle);
								}
							}catch(e){
								console.error(e, self);
							}
						})
					};
				//if(rias.debugStackTraceOwn){
				//	odh.stack = rias.getStackTrace(arguments);
				//}
				if(isRiasObject(handle)){
					if(handle._riasrOwner !== self){
						handle.orphan();
						handle._riasrOwner = self;
						//handle.ownerRiasw = self;
						self._riasrElements.push(odh);

						if(handle._riaswAttachPoint){
							if(isString(handle._riaswAttachPoint)){
								if(~(handle._riaswAttachPoint.indexOf("."))){
									console.error("The widget._riaswAttachPoint(" + handle._riaswAttachPoint + ") cannot contains \".\". ", handle);
								}
								if((handle._riaswAttachPoint.indexOf("_p_") === 0)){
									console.error("The widget._riaswAttachPoint(" + handle._riaswAttachPoint + ") cannot begin with '_p_', because it is the reserved word. ", handle);
								}
								if(rias.getObject(handle._riaswAttachPoint, false, self)){
									console.error("Duplication _riaswAttachPoint['" + handle._riaswAttachPoint + "'] in owner['" + self.id + "']", handle);
								}else{
									rias.setObject(handle._riaswAttachPoint, handle, self);
								}
							}else{
								console.error("The widget._riaswAttachPoint(" + handle._riaswAttachPoint + ") must be a String.", handle);
							}
						}

						if(!handle.ownerModule()){
							if(rias.isRiaswModule(self)){
								handle._riasrModule = self;
							}else if(rias.isRiaswModule(self.ownerModule())){
								handle._riasrModule = self.ownerModule();
							}
						}
						if(rias.isDebug && !handle.ownerModule() && !rias.isRiaswDesktop(handle)){///new Desktop() 时，rias.desktop 尚未赋值，只能用 isRiaswDesktop 来判断。
							console.debug("The widget('" + (handle.id || handle.name || handle._riaswType) + "').ownerModule() is undefined.");
						}

						if(is(handle, Destroyable) && self.getDesigning()){
							if(isFunction(handle.setDesigning)){
								handle.setDesigning(true);
							}else{
								handle._riasrDesigning = true;
							}
						}
					}
				}else{
					self._riasrOwned.push(odh);
				}

				// Callback for when handle is manually destroyed.
				function onManualDestroy(){
					///这里是 handle.destroy，且 self 没有 destroy
					/// 正常情况下，this 已经 orphan，下面的代码仅用于检测是否有错。
					rias.removeItems(self._riasrOwned, odh);
					if(rias.removeItems(self._riasrElements, odh)){
						console.error("The handle was not released properly when [" + self.id + "] destroy: ", handle);
					}
					if(rias.removeItems(self._riasrOwned, hManualDestroy) && isRiasObject(handle)){
						console.error("The handle was not released properly when [" + self.id + "] destroy: ", handle);
					}
					odh._remove.remove();
					hManualDestroy._remove.remove();
					if(this._riasrOwned){
						if(this._riasrOwned.length){
							console.error(this.id + ".onManualDestroy error, _riasrOwned is not empty. ", this);
						}

						var hdh;
						while((hdh = this._riasrOwned.pop())){
							hdh._remove.remove();
						}
					}
					if(this._riaswType){
						delete this._riasdParams;
						delete this._riaswParams;
						delete this._riaswElements;
						delete this.__riasrWidget;
						delete this._riasrModule;
						delete this._riaswModuleMeta;
						delete this._riasrPersist;///需要 delete，避免不能正常释放
						delete this._riasrTopic;
						delete this._riasrChildren;
						delete this._riasrContainer;
						delete this._riasrOwner;
						delete this._riasrOwned;
						delete this._riasrElements;
						delete this.ownerRiasw;
						delete this.params;
						delete this._watchCallbacks;
					}
				}

				// Setup listeners for manual destroy of handle.
				// Also computes destroyMethodName, used in listener above.
				if(handle.then){
					// Special path for Promises.  Detect when Promise is resolved, rejected, or
					// canceled (nb: cancelling a Promise causes it to be rejected).
					destroyMethodName = "cancel";
					handle.then(rias.hitch(handle, onManualDestroy), rias.hitch(handle, onManualDestroy));
				}else{
					// Path for other handles.  Just use AOP to detect when handle is manually destroyed.
					forEach(cleanupMethods, function(cleanupMethod){
						if(typeof handle[cleanupMethod] === "function"){
							if(!destroyMethodName){
								// Use first matching method name in above listener (prefer destroyRecursive() to destroy())
								destroyMethodName = cleanupMethod;
								hManualDestroy = {
									__riasrOwnedId: ++__riasrOwnedId,
									_handle: handle,
									_remove: rias.after(handle, cleanupMethod, onManualDestroy, true)
								};
								self._riasrOwned.push(hManualDestroy);
							}
						}
					});
				}
				if(!destroyMethodName){
					console.error("Cannot find the destroyMethodName when '" + self.id + "' own the handle: ", handle);
				}
			}, self);

			return hds;		// arguments
		},

		_initPersist: function(errCall){
			var w = this,
				s, m;
			if(rias.isRiaswDesktop(w)){
				w._riasrPersist = rias.mixinDeep(w._riasrPersist, {
					//_p_: {}
				});
			}else{
				if(!w._riaswIdInModule){
					//if(w.persist){
					//	console.debug("The widget('" + (w.id || w.name || w._riaswType) + "') define persist, but _riaswIdInModule is undefined.", params);
					//}
					w.persist = false;
				}else{
					if(isString(w._riaswIdInModule)){
						if(~(w._riaswIdInModule.indexOf("."))){
							s = "The widget._riaswIdInModule(" + w._riaswIdInModule + ") cannot contains \".\". ";
							console.error(s, w);
							if(isFunction(errCall)){
								hitch(this, errCall)(new Error(s));
							}
						}
						if((w._riaswIdInModule.indexOf("_p_") === 0)){
							s = "The widget._riaswIdInModule(" + w._riaswIdInModule + ") cannot begin with '_p_', because it is the reserved word. ";
							console.error(s, w);
							if(isFunction(errCall)){
								hitch(this, errCall)(new Error(s));
							}
						}
						m = w.ownerModule();
						if(!m){
							w.persist = false;
						}else{
							if(rias.getObject(w._riaswIdInModule, false, m)){
								//if(rias.hostBrowser){
								//}
								s = "Duplication _riaswIdInModule['" + w._riaswIdInModule + "'] in module['" + m.id + "']";
								console.error(s, w);
								if(isFunction(errCall)){
									hitch(this, errCall)(new Error(s));
								}
							}else{
								rias.setObject(w._riaswIdInModule, w, m);
							}
							if(m._riasrPersist){
								if(!m._riasrPersist[w._riaswIdInModule]){
									m._riasrPersist[w._riaswIdInModule] = {
										//_p_: {}
									};
								}
								w._riasrPersist = m._riasrPersist[w._riaswIdInModule];
							}
						}
					}else{
						w.persist = false;
						s = "The widget._riaswIdInModule(" + w._riaswIdInModule + ") must be a String.";
						console.error(s, w);
						if(isFunction(errCall)){
							hitch(this, errCall)(s);
						}
					}
				}
			}
		},
		_setPersistAttr: function(value){
			var m;
			value = !!value;
			this.persist = value;
			/// 只有 desktop 的 _riasrPersist 需要创建，其他的均附属于 desktop 的 _riasrPersist
			if(rias.isRiaswDesktop(this)){
				if(!this._riasrPersist){
					this._riasrPersist = {};
				}
			}else if(!this._riaswIdInModule){
				if(this.persist){
					console.debug("The widget('" + (this.id || this.name || this._riaswType) + "') define persist, but _riaswIdInModule is undefined.", this);
					this.persist = false;
				}
			}else{
				m = this.ownerModule();
				if(!m){
					if(this.persist){
						console.error("The widget('" + (this.id || this.name || this._riaswType) + "') define persist, but no ownerModule.", this);
						this.persist = false;
					}
				}else{
					if(m._riasrPersist){/// 存在 ownerModule 无 _riaswIdInModule 的情况，则同样缺少 m._riasrPersist
						if(!m._riasrPersist[this._riaswIdInModule]){
							m._riasrPersist[this._riaswIdInModule] = {};
						}
						/// 只有 desktop 的 _riasrPersist 需要创建，其他的均附属于 desktop 的 _riasrPersist
						this._riasrPersist = m._riasrPersist[this._riaswIdInModule];
					}
				}
			}
			if(this.persist){
				if(this._started){
					this.loadPersist();
				}
			}else{
				//this.clearPersist(false);///只清除自身
				/// 不应该 publish
				if(this._riasrPersist){
					delete this._riasrPersist._p_;
				}
			}
		},
		getPersist: function(key){
			if(this._riasrPersist && this._riasrPersist._p_){
				return this._riasrPersist._p_[key];
			}
		},
		onSetPersist: function(args, key, value){
			return value;
		},
		setPersist: function(key, value){
			if(!this._riasrPersist || !this.persist || this.isDestroyed(false)){
				return;
			}
			if(!this._riasrPersist._p_){
				this._riasrPersist._p_ = {};
			}
			if(arguments.length === 1){
				value = key;
				key = "";
			}
			if(!key){///全部
				if(!rias.isObjectExact(value)){
					console.error("Error persist value - " + this.id);
				}else{
					for(key in value){
						/// for 中不应该用 delete
						if(rias.isRiasObject(this[key])){///是 child，不是 persist
							this[key].setPersist(key, value[key]);
						}else{// 非 child
							this.setPersist(key, value[key]);
						}
					}
				}
				return;
			}
			value = this.onSetPersist(this._riasrPersist._p_, key, value);
			if(!rias.isEqual(this._riasrPersist._p_[key], value)){
				this._riasrPersist._p_[key] = value;
				rias.publish("/riasr/persistChange", {
					widget: this
				});
			}
		},
		clearPersist: function(child){
			/// child == string 是清除一个 child，child == false 是只清除自身，其它则是全部，
			var self = this;
			function _do(c){
				if(rias.isRiasObject(self[c])){
					self[c].clearPersist();
				}else{///遗留/废弃的 persist
					delete self._riasrPersist[c];
				}
			}

			if(!this._riasrPersist){///
				return;
			}
			if(child == true || child == undefined){
				this._riasrPersist._p_ = {};
				for(child in this._riasrPersist){
					if(child !== "_p_"){
						_do(child);
					}
				}
			}else if(child == false || child === "_p_"){
				delete this._riasrPersist._p_;
			}else if(rias.isString(child)){
				_do(child);
			}else if(rias.isRiasw(child)){
				_do(child.id);
			}else if(rias.isArray(child)){
				rias.forEach(child, function(c){
					self.clearPersist(c);
				});
			}else{
				return;
			}
			rias.publish("/riasr/persistChange", {
				widget: this
			});
		},
		onLoadPersist: function(args){
		},
		_loadPersist: function(args){
		},
		loadPersist: function(){
			///有可能尚未 startup
			if(this.persist && !this.isDestroyed(false)){
				if(!this._riasrPersist._p_){
					this._riasrPersist._p_ = {};
				}
				this.onLoadPersist(this._riasrPersist._p_);
				this._loadPersist(this._riasrPersist._p_);
			}
		},
		onSavePersist: function(args){
		},
		_savePersist: function(args){
		},
		savePersist: function(){
			if(this._riasrPersist && this._riaswIdInModule){
				if(!this.persist){
					///只清除自身
					this.clearPersist(false);
				}else if((!this.startup || this._started) && !this.isDestroyed(false)){
					this._savePersist(this._riasrPersist._p_);
					this.onSavePersist(this._riasrPersist._p_);
				}
			}
		},

		around: function(target, methodName, advice, receiveArguments){
			if(rias.isString(target)){
				if(rias.isString(methodName)){
					methodName = rias.hitch(this, methodName);
				}
				return this.own(rias.around(this, target, methodName, advice))[0];
			}
			if(rias.isString(advice)){
				advice = rias.hitch(this, advice);
			}
			return this.own(rias.around(target, methodName, advice, receiveArguments))[0];
		},
		before: function(target, methodName, advice, receiveArguments){
			if(rias.isString(target)){
				if(rias.isString(methodName)){
					methodName = rias.hitch(this, methodName);
				}
				return this.own(rias.before(this, target, methodName, advice))[0];
			}
			if(rias.isString(advice)){
				advice = rias.hitch(this, advice);
			}
			return this.own(rias.before(target, methodName, advice, receiveArguments))[0];
		},
		after: function(target, methodName, advice, receiveArguments){
			if(rias.isString(target)){
				if(rias.isString(methodName)){
					methodName = rias.hitch(this, methodName);
				}
				return this.own(rias.after(this, target, methodName, advice))[0];
			}
			if(rias.isString(advice)){
				advice = rias.hitch(this, advice);
			}
			return this.own(rias.after(target, methodName, advice, receiveArguments))[0];
		},
		publish: function(target, topicName, event){
			if(this.isDestroyed(false)){
				console.error("The widget is destroyed when publish " + topicName, this);
				return;
			}
			return rias.publish(target, topicName, event);
		},
		subscribe: function(target, topicName, func){
			var self = this;
			if(rias.isString(target)){
				return self.own(rias.subscribe(target, function(){
					return topicName.apply(self, arguments);
				}))[0];
			}else{
				return self.own(rias.subscribe(target, topicName, function(){
					return func.apply(self, arguments);
				}))[0];
			}
		},
		defer: function(callback, delay, args){
			if(isString(callback)){
				if(!this[callback]){
					console.error(this.id + ".defer: the '" + callback + "'] is undefined.");
				}
				callback = this[callback];
			}
			args = argsToArray(arguments, 2);
			var self = this,
				timer = setTimeout(function(){
					if(!timer){
						return;
					}
					var _dt = new Date();
					if(rias.debugStackTrace){
						args.stack = rias.getStackTrace(args);
					}
					if(!self._destroyed){
						try{
							callback.apply(self, args);///IE8 不支持 args = undefined。
						}catch(e){
							console.error("this.defer()", e, rias.getStackTrace(args));
						}
						_dt = new Date() - _dt;
						if(_dt > 50){
							console.debug("defer took: " + _dt + " ms - " + self.id, args.stack);
						}
					}
					timer = null;
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

	/// rias.ObjectBase 相当于无 dom 的 _WidgetBase.
	/// Destroyable 已经涵盖了 dojo.Stateful 的属性和方法。
	rias.ObjectBase = rias.declare([Destroyable], {
		toString: function(){
			return '[rias.ObjectBase ' + (this._riaswType || this.declaredClass) + ', ' + (this.id || 'NO ID') + ']'; // String
		},
		get: function(name){
			var names = this._getAttrNames(name);
			return this[names.g] ? this[names.g]() : this._get(name);
		}

	});

	return rias;

});