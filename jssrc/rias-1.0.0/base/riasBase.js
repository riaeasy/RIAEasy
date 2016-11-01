
//RIAStudio Client/Server Runtime riasBase(rias).
//非常重要：由于低版本ie不支持Array的indexOf、each等方法，请使用rias.indexOf和rias.each等函数来代替。
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”

///是否需要显式申明？在 redef() 时有什么影响？


///在 dojo/promise/instrumentation 中增加 captureStackTrace

define([
	"rias",
	"dojo/i18n",
	"dojo/i18n!rias/nls/riasi18n",

	"dojo/_base/sniff",//包含has，并初始化浏览器相关判断
	"dojo/_base/lang",
	"dojo/_base/array",
	//"dojo/_base/json",
	"dojo/json",
	"dojo/_base/window",

	"dojo/cldr/supplemental",
	"dojo/date",
	"dojo/date/locale",
	"dojo/date/stamp",

	"dojo/errors/create",
	"dojo/number",
	"dojo/currency",
	"dojo/string",

	"dojo/Evented",
	"dojo/io-query",

	"dojo/_base/declare",
	"dojo/_base/config",
	"dojo/_base/Color",

	"dojo/_base/loader",
	"dojo/aspect",
	"dojo/promise/Promise",
	"dojo/Deferred",/// 在 dojo/Deferred 中增加 __riasrDeferredId
	"dojo/promise/all",
	"dojo/promise/first",
	"dojo/when",
	"dojo/topic",
	"dojo/cache",

	"dojo/Stateful",
	"dijit/Destroyable"
], function(rias, dojoI18n, riasi18n,
			has, lang, array, json, basewin,
			supplemental, date, dateLocale, dateStamp,
			createError, number, currency, string, Evented, ioq,
			declare, config, Color,
			loader, aspect, Promise, Deferred, all, first, when, topic, cache,
			Stateful, Destroyable) {

///lang******************************************************************************///

	if(!("mblApplyPageStyles" in config)){
		config.mblApplyPageStyles = false;
	}
	rias.config = config;
	rias.Color = Color;
	rias.isDebug = config.isDebug;
	rias.isStackTrace = config.isStackTrace;
	rias.has = has;

	rias.global = basewin.global;
	rias.setContext = basewin.setContext;
	rias.withGlobal = basewin.withGlobal;

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
	rias.$run = function(scope, text, hint){
		return (new Function(
			'rias',
			text + (hint ? "\r\n////@ sourceURL=" + hint : "")))(scope, rias);
	};
	rias.$runByModule = function(module, text, hint){
		if(module){
			if(rias.isRiaswModule(module)){
			}else if(module._riasrModule){
				module = module._riasrModule;
			}else{
				throw "Function $runByModule need a module. " + module;
			}
		}else{
			throw "Function $runByModule need a module.";
		}
		var r = new Function(
			'rias',
			'module',
			text + (hint ? "\r\n////@ sourceURL=" + hint : ""));
		//r.remove = function(){};
		//if(rias.isRiasw_Module(module)){
		//	module.own(r);
		//}
		r = r.call(module, rias, module);
		if(r && r.$refScript){
			r = rias.$runByModule(module, r.$refScript, hint);
		}
		return r;
	};

	rias.getStackTrace = function(obj) {
		if(obj && obj.stack){
			return obj.stack;
		}
		obj = obj || {};//new Error();
		if(Error.captureStackTrace){
			Error.captureStackTrace(obj, arguments.callee);
		}
		return obj.stack;
	};
	//rias.raise = dojo.raise;//没有 dojo.raise
	rias.captureStackTrace = function(e) {
		if(e.stack){
			return e.stack;
		}
		if(e instanceof Error){
			if(Error.captureStackTrace){
				Error.captureStackTrace(e, arguments.callee);
			}
			return e.stack;
		}
		return e;
	};
	rias.createError = createError;
	rias.exists = lang.exists;
	rias.isEmpty = function(any){
		if(any == undefined || any === "" || (isArrayLike(any) && any.length == 0)){
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
	var isFunction = rias.isFunction = lang.isFunction;
	var isObject = rias.isObject = lang.isObject;
	var isObjectExact = rias.isObjectExact = function(it){
		return (it != undefined) && (it != null) && (typeof it === "object") && (!isArray(it)) && (!isFunction(it));
	};
	var isObjectSimple = rias.isObjectSimple = function(it){
		return (it != undefined) && (it != null) && (typeof it === "object") && (it.constructor === Object);
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
		return obj && obj == "[object Deferred]" && isFunction(obj.resolve);
	};
	rias.isPromise = function(obj){
		return obj && obj == "[object Promise]" && isFunction(obj.then);
	};
	rias.isPromiseLike = function(obj){
		return obj && isFunction(obj.then);
	};

	var isInstanceOf = rias.isInstanceOf = function(obj, base){
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
				for(var i = 0, l = bases.length; i < l; ++i){
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
	///注意：在 _WidgetBase.postCreate() 之前（包含 _WidgetBase.postCreate()） obj._created都为 false，故 rias.isDijit() 为 false。
	///建议在 _WidgetBase.startUp() 之后使用。
	var isDijit = rias.isDijit = function(obj){
		return !!(hostBrowser && obj && obj._created && (!!obj.domNode) && isInstanceOf(obj, "dijit._WidgetBase"));
	};
	rias.isRiasd = function(obj){
		return !!(isObjectSimple(obj) && obj._riaswType);
		//return !!_getRiaswMapper(obj);
	};
	var isRiasw = rias.isRiasw = function(obj){
		return !!(obj && obj._riasrCreated && obj._riaswType && isInstanceOf(obj, rias.Destroyable));// && obj.constructor && obj.constructor._riasdMeta;// && isDijit(obj);//有非 Dijit 的 RiasWidget
	};
	rias.isRiasw_Module = function(obj){
		return !!(hostBrowser && isRiasw(obj) && isInstanceOf(obj, "rias.riasw.studio._ModuleMixin"));
	};
	rias.isRiaswModule = function(obj){
		//return hostBrowser && isRiasw(obj) && (isInstanceOf(obj, getObject("rias.riasw.studio.Module")) || isInstanceOf(obj, getObject("rias.riasw.studio.App")));
		//return hostBrowser && isRiasw(obj) && obj.moduleMeta != undefined && isInstanceOf(obj, getObject("rias.riasw.studio._ModuleMixin"));
		return !!(hostBrowser && isRiasw(obj)
			///DialogPanel 视为 Module
			&& (isInstanceOf(obj, ["rias.riasw.studio.Module", "rias.riasw.studio.App"])
				|| obj.moduleMeta != undefined && isInstanceOf(obj, "rias.riasw.studio._ModuleMixin")));
	};
	rias.isRiasWebApp = function(obj){
		return !!(hostBrowser && isRiasw(obj) && isInstanceOf(obj, "rias.riasw.studio.App"));
	};
	rias.isRiasServerApp = function(obj){
		return !hostBrowser && isRiasw(obj) && isInstanceOf(obj, "rias.riass.ServerApp");
	};
	rias.isRiasApp = function(obj){
		return rias.isRiasWebApp(obj) || rias.isRiasServerApp(obj);
	};

	///这里只做 Object 的 by，dom 和 Widget 的 by 在 riasw 中实现。
	var by = rias.by = function(/*String|DOMNode|Dijit|riasWidget*/any, context){
		if(!any){
			return undefined;
		}
		var w;
		if(isObjectSimple(any)){
			if(any.$refObj){
				any = by(any.$refObj, context) || any.$refObj;
			}
			if(any.$refScript){
				any = rias.$runByModule(context, any.$refScript);
			}
		}
		if(isString(any)){
			///TODO:zensst. context => module
			w = getObject(any, false, context);
			if(!w && !/^module\.|^context\./.test(any)){
				w = getObject(any);
			}
			any = w;
		}
		return any;
	};

	rias.objLike = function(srcObj, desObj){
		var name,
			ok = isObject(srcObj) && isObject(desObj);
		if(ok){
			for(name in desObj){
				if(!(name in srcObj) || (srcObj[name] !== desObj[name])){
					ok = false;
					break;
				}
			}
		}
		return ok;
	};
	rias.objEqual = function(srcObj, equalObj){
		var name,
			ok = isObject(srcObj) && isObject(equalObj);
		if(ok){
			for(name in equalObj){
				if(!(name in srcObj) || (srcObj[name] !== equalObj[name])){
					ok = false;
					break;
				}
			}
			for(name in srcObj){
				if(!(name in equalObj)){
					ok = false;
					break;
				}
			}
		}
		return ok;
	};

	function _delete(dest, ref, /*Integer*/deep){
		//deep是嵌套的层数.
		var name, s, i, empty = {}, a = [];
		function _dele1(name){
			s = ref[name];
			if(name in dest){
				if (deep > 0){
					try{
						if(s instanceof Date){
							delete dest[name];
						}else if(s instanceof RegExp){
							delete dest[name];
						}else if(isArray(s)){
							if (!isArray(dest[name])){
								delete dest[name];
							}else{
								_delete(dest[name], s, deep - 1);
							}
						}else if(isObjectExact(s)){
							///因为有可能没有 require([riasw])，所以需要检查 isRiasw、isDijit
							if((isRiasw && isRiasw(s)) || (isDijit && isDijit(s)) || s.nodeType){
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
						console.error(rias.captureStackTrace(e));
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
			if(exact && !(name in source)){
				return;
			}
			s = source[name];
			if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
				if (deep > 0){
					try{
						if(s instanceof Date){
							dest[name] = new Date(s.getTime());	// Date
						}else if(s instanceof RegExp){
							dest[name] = new RegExp(s);   // RegExp
						}else if(isArray(s)){
							if (!isArray(dest[name])){
								dest[name] = [];
							}
							_mixin(dest[name], s, copyFunc, deep - 1, ord, exact, onlyCopy);
						}else if(isObjectExact(s)){
							///因为有可能没有 require([riasw])，所以需要检查 isRiasw、isDijit
							if((isRiasw && isRiasw(s)) || (isDijit && isDijit(s)) || s.nodeType){
								dest[name] = s;	//复杂对象不建议深度mix，比如 DOM Node
							}else{
								if (!isObjectExact(dest[name])){
									dest[name] = {};
								}
								_mixin(dest[name], s, copyFunc, deep - 1, ord, exact, onlyCopy);
							}
						}else if(isFunction(s)){
							dest[name] = s;
							dest[name].nom = s.nom || name;
							_mixin(dest[name], s, copyFunc, deep - 1, ord, exact, onlyCopy);
						}else{
							dest[name] = copyFunc ? copyFunc(s) : s;
						}
					}catch(e){
						console.error(rias.captureStackTrace(e));
						//throw e;
					}
				}else{
					dest[name] = copyFunc ? copyFunc(s) : s;
					if(isFunction(s)){
						dest[name].nom = s.nom || name;
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
	rias.mixin_notexists = function(/*Object*/dest, /*Object..*/sources){
		if(!dest){ dest = {}; }
		for(var i = 1, l = arguments.length; i < l; i++){
			_mixin(dest, arguments[i]);
		}
		return dest; // Object
	};
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
		if(!dest){ dest = {}; }
		for(var i = 1, l = arguments.length; i < l; i++){
			_mixin(dest, arguments[i], undefined, undefined, undefined, true);
		}
		return dest; // Object
	};
	rias.mixinDeep = function(/*Object*/dest, /*Object..*/sources) {
		//针对下级含有object（包含数组、不包含函数?）的object的mixin，可以保留下级object原有的属性，而不是直接覆盖替换
		//函数任然直接覆盖
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
		//针对下级含有object（包含数组、不包含函数?）的object的mixin，可以保留下级object原有的属性，而不是直接覆盖替换
		//函数任然直接覆盖
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
		//针对下级含有object（包含数组、不包含函数?）的object的mixin，可以保留下级object原有的属性，而不是直接覆盖替换
		//函数任然直接覆盖
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
		//if(isFunction(src)){
		//	// function
		//	return src;	// anything
		//}
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
			//we don't clone functions for performance reasons
			//}else if(d.isFunction(src)){
			//	// function
			//	r = function(){ return src.apply(this, arguments || []); };
		}else{
			// generic objects
			r = src.constructor ? new src.constructor() : {};
		}
		return _mixin(r, src, rias.clone);
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
		if(n != "" && Number(n) == n){
			return Number(n);
		}
		if(isNumber(def)){
			return def;
		}
		throw n + " is not Number.";
	};
	rias.toFixed = function(x, length){
		length = (length || 0);
		length = (length >= 0 ? length : 0) + 2;
		x = toNumber(x) + Math.pow(10, -length);
		/// Number.toFixed 是返回 String
		return x.toFixed(length - 2);
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
	rias.toStr = function(obj){
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
		var s, c, space, result = "",
			i, l, j,
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

	if(!String.prototype.startWith){
		String.prototype.startWith = function(sub){
			return this.indexOf(sub) === 0;//new RegExp("^" + sub).test(this);
		}
	}
	if(!String.prototype.endWith){
		String.prototype.endWith = function(sub){
			return this.lastIndexOf(sub) === this.length - sub.length;//new RegExp(sub + "$").test(this);
		}
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
				if(arr[i]){
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
				if (key == ''){
					return '$';
				}
				var value = getObject(key, false, map);
				if(format){
					value = getObject(format, false, thisObject).call(thisObject, value, key);
				}
				try{
					value = transform(value, key).toString();
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
		(p < 0) ? p = "" : p = str.substring(p + 1);
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
	rias.objectToQuery = ioq.objectToQuery;
	rias.queryToObject = ioq.queryToObject;

	var _langCache = {};
	function buildFn(fn){
		return _langCache[fn] = new Function("item", "index", "array", fn); // Function
	}
	var toArray = rias.toArray = lang._toArray;
	rias.every = array.every;
	rias.some = array.some;
	if(!Array.prototype.indexOf){
		Array.prototype.indexOf = function(a, from){
			var len = this.length >>> 0;
			from = (from < 0) ? Math.ceil(from) : Math.floor(from);
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
	rias.indexOf = function(arr, value, fromIndex, findLast){
		if(isArray(arr)){
			return array.indexOf(arr, value, fromIndex, findLast);
		}else{
			if(findLast){
				return (arr + "").lastIndexOf(value, fromIndex);
			}
			return (arr + "").indexOf(value, fromIndex);
		}
	};
	rias.indexOfByAttr = function(arr, value, attrName){
		var i = 0, l = arr.length;
		for(; i < l; i++){
			if(arr[i] && arr[i][attrName] == value){
				return i;
			}
		}
		return -1;
	};
	//rias.lastIndexOf = array.lastIndexOf;
	rias.lastIndexOf = function(arr, value, fromIndex){
		if(isArray(arr)){
			return array.lastIndexOf(arr, value, fromIndex);
		}else{
			return (arr + "").lastIndexOf(value, fromIndex);
		}
	};
	var contains = rias.contains = function(arr, value, attrName){
		if(attrName == undefined){
			if(isArray(value)){
				return rias.some(value, function(v){
					return rias.indexOf(arr, v) >= 0;
				});
			}
			return rias.indexOf(arr, value) >= 0;
		}
		if(isArray(value)){
			return rias.some(value, function(v){
				return rias.indexOfByAttr(arr, v, attrName) >= 0;
			});
		}
		return rias.indexOfByAttr(arr, value, attrName) >= 0;
	};
	rias.map = array.map;
	rias.filter = array.filter;
	//rias.forEach = array.forEach;
	var forEach = rias.forEach = function(arrayOrObject, callback, context){
		if (!arrayOrObject) {
			return;
		}
		if(typeof callback == "string") {
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
					if(arrayOrObject[i] != undefined){
						callback.call(context, arrayOrObject[i], i, arrayOrObject);
					}
				}
			}else{
				for(; i < l; ++i){
					if(arrayOrObject[i] != undefined){
						callback(arrayOrObject[i], i, arrayOrObject);
					}
				}
			}
		}else{
			if(context){
				for (i in arrayOrObject) {
					if(arrayOrObject[i] != undefined){
						callback.call(context, arrayOrObject[i], i, arrayOrObject);
					}
				}
			}else{
				for (i in arrayOrObject) {
					if(arrayOrObject[i] != undefined){
						callback(arrayOrObject[i], i, arrayOrObject);
					}
				}
			}
		}
	};
	function _concat(dest, src, uni){
		if(isArray(dest) && isArrayLike(src)){
			var i, l = src.length, item;
			for(i = 0; i < l; i++){
				item = src[i];
				if(item && (!uni || !contains(dest, item))){
					dest.push(item);
				}
			}
			return dest;
		}else{
			return dest.concat(src);
		}
	}
	rias.concat = function(dest, sources){
		if(!dest){
			dest = [];
		}
		for(var i = 1, l = arguments.length; i < l; i++){
			_concat(dest, arguments[i]);
		}
		return dest; // Object
	};
	rias.concatUnique = function(dest, sources){
		if(!dest){
			dest = [];
		}
		for(var i = 1, l = arguments.length; i < l; i++){
			_concat(dest, arguments[i], true);
		}
		return dest; // Object
	};
	rias.removeItems = function(src, items, callback, context){
		var i, l, k;
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
					}else{
						i++;
					}
				}
			}else{
				while((i = src.indexOf(item)) > -1){
					if(item != undefined && callback){
						if(context){
							callback.call(context, item, i, src);
						}else{
							callback(item, i, src);
						}
					}
					src.splice(i, 1);
					l--;
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
		return src;
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
	_datetime.defaultDateFormatStr = "yyyy/MM/dd";
	_datetime.defaultTimeFormatStr = "HH:mm:ss";
	_datetime.defaultFormatStr = _datetime.defaultDateFormatStr + " " + _datetime.defaultTimeFormatStr;
	rias.toDatetime = _datetime.toDatetime = function(datetime){
		if(!rias.isDate(datetime)){
			return new Date(datetime);
		}
		return datetime;
	};
	rias.ymdToDatetime = _datetime.ymdToDatetime = function(ymd){
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
			datetime = new Date(datetime);
		}
		if(isString(formatStr)){
			return rias.dateLocale.format(datetime, {
				selector: 'time',
				timePattern: formatStr || _datetime.defaultFormatStr
			});
		}
		return rias.dateLocale.format(datetime, formatStr);
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

	function _getF(f){
		var i = 0, n = 0, c;
		if(!isString(f)){
			f = f.toString();
		}
		while(c = f.charAt(i)){
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
	function escapeString(/*String*/str){
		// summary:
		//		Adds escape sequences for non-visual characters, double quote and
		//		backslash and surrounds with double quotes to form a valid string
		//		literal.
		return ('"' + str.replace(/(["\\])/g, '\\$1') + '"')
			.replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n")
			.replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r"); // string
	}
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
			if(typeof replacer == "string"){
				spacer = replacer;
				replacer = null;
			}
			function stringify(it, indent, key){
				if(replacer){
					it = replacer(key, it);
				}
				var val, objtype = typeof it;
				if(objtype == "number"){
					return isFinite(it) ? it + "" : "null";
				}
				if(objtype == "boolean"){
					return it + "";
				}
				if(it === null){
					return "null";
				}
				if(typeof it == "string"){
					return escapeString(it);
				}
				if(objtype == "undefined"){
					return undef; //直接返回 undef 变量，即undefined
				}
				if(objtype == "function"){
					if(args.includeFunc == true){
						return it.toString();
					}else if(args.includeFuncName == true){
						return _getF(it);
					}else{
						return undef; //直接返回 undef 变量，即undefined
					}
				}
				// short-circuit for objects that support "json" serialization
				// if they return "self" then just pass-through...
				if(typeof it.toJSON == "function"){
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
						if(typeof val != "string"){
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
						console.error("rias.json.stringify(it): it has circular reference.", it, objPath);
						return "rias.json.stringify(it): it has circular reference." + it + ", " + objPath;
						/*return rias.toJson(it, {
							prettyPrint: args.prettyPrint,
							includeFunc: args.includeFunc,
							includeFuncName: args.includeFuncName,
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
					//if(key == "_riasrWidget"){
					//	if(rias.isDebug){
					//		console.error(key, it);
					//	}else{
					//		console.error("_riasrWidget:", key);
					//	}
					//}
					var keyStr;
					if(it.hasOwnProperty(key)){
						if(typeof key == "number"){
							keyStr = '"' + key + '"';
						}else if(typeof key == "string"){
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
						if(typeof val != "string"){
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
				if(typeof tf == "function"){
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
				console.error(e, rias.captureStackTrace(e));
			}
			throw e;
		}
	};
	/*rias.fromJsonFunc = function(js){
		try{
			return (new Function("","return " + js))();
		}catch(e){
			console.error(e, rias.captureStackTrace(e));
			throw e;
		}
	};*/

	rias.defer = function(scope, callback, delay, args){
		if(isString(callback)){
			if(!scope[callback]){
				throw("rias.defer: " + scope + "['" + callback + "'] is null.");
			}
			callback = scope[callback];
		}
		args = toArray(arguments, 3);
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
		if(rias.isStackTrace){
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
	//rias.throttle = function (func, threshold, alt) {
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
	rias.throttle = function(id, callback, scope, delay, callPass){
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
			if(rias.isStackTrace){
				var stack = rias.getStackTrace();
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
						console.error(rias.captureStackTrace(e), stack);
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
				console.error(rias.captureStackTrace(e), stack);
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
	rias.throttleDelayed = function(id, callback, scope, delay, callPass){
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
			if(rias.isStackTrace){
				var stack = rias.getStackTrace();
			}
			var a = arguments || [];
			var cb = setTimeout(function () {
				r.remove();
				try{
					callback.apply(scope, a);
				}catch(e){
					console.error(rias.captureStackTrace(e), stack);
					//throw e;
				}
			}, delay || rias._defaultThrottleDelay);
			var cp = function(){
				if(isFunction(callPass)){
					try{
						callPass.apply(scope, a);
					}catch(e){
						console.error(rias.captureStackTrace(e), stack);
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
	rias.debounce = function(id, callback, scope, delay, callPass){
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
			if(rias.isStackTrace){
				var stack = rias.getStackTrace();
			}
			var a = arguments || [];
			var cb = setTimeout(function () {
				r.remove();
				try{
					callback.apply(scope, a);
				}catch(e){
					console.error(rias.captureStackTrace(e), stack);
					//throw e;
				}
			}, delay || rias._defaultThrottleDelay);
			var cp = function(){
				if(isFunction(callPass)){
					try{
						callPass.apply(scope, a);
					}catch(e){
						console.error(rias.captureStackTrace(e), stack);
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

	rias._hitchArgs = dojo._hitchArgs = lang._hitchArgs = function(scope, method){
		var pre = toArray(arguments, 2);
		var named = isString(method);
		return function(){
			// arrayify arguments
			var args = toArray(arguments);
			// locate our method
			var f = named ? (scope || dojo.global)[method] : method;
			if(rias.isStackTrace){
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
				if(rias.isStackTrace){
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
			if(rias.isStackTrace){
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
				// Voodoo code from the old days where "dojo" or "dijit" maps to some special object
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
					console.error(arg.message, arg.info, rias.captureStackTrace(arg));
				});
			}
		}catch(e){
			console.error("rias.require._riasrWatch error: ", moduleName, type, rias.captureStackTrace(e));
		}
	};*/
	require.on("error", function(arg){
		try{
			console.error(arg.message, arg.info, arg.src, rias.captureStackTrace(arg));
			//if(isFunction(rias.publish)){
			//	rias.publish("rias.require.error", arg);
			//}
		}catch(e){
			console.error("require error: ", arg, rias.captureStackTrace(arg));
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
				console.debug("rias.undef: " + moduleId);
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
	rias.declare = declare;
	///dojo.extend 不是 declare.extend，即不是 safeMixin，只是 mixin。
	//rias.extend = dojo.extend;// = lang.extend;///隐藏，避免歧义

	rias.baseUrl = rias.require.baseUrl;
	rias.toUrl = rias.require.toUrl;

	rias.deprecated = dojo.deprecated;
	rias.experimental = dojo.experimental;
	rias.aspect = aspect;
	rias.before = aspect.before;
	rias.after = aspect.after;
	rias.around = aspect.around;

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
			f = rias.defer(null, function(){
				remove();
				args = d.__riasrArgs = toArray(args, 3);
				console.debug("Deferred timeout, " + timeout + " seconds.", args);
				//if(rias.isStackTrace){
					console.error(rias.getStackTrace(d), args);
				//}
				if(isFunction(timeoutCall)){
					timeoutCall.apply(d, args);
				}
			}, timeout * 1000);
			if(rias.isStackTrace){
				d.stack = rias.getStackTrace(d);
			}
			d.then(function(result){
				remove();
				return result;
			}, function(result){
				remove();
				return result;
			});
		}
		return d;
	};
	rias.Deferred = Deferred;
	rias.when = when;
	rias.first = first;
	rias.all = all;
	rias.all = function(arr, timeout, timeoutCall){
		var d, args = arguments;
		d = rias.newDeferred("rias.all", timeout, function(){
			if(isFunction(timeoutCall)){
				timeoutCall.apply(d, args);
			}
		});
		args = d.__riasrArgs = [arr].concat(toArray(args, 3));
		all(arr).then(function(result){
			d.resolve(result);
		}, function(result){
			d.reject(result);
		});
		return d;
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
	rias.allByOrder = function(funcs, timeout, timeoutCall){
		///item() 如果需要参数，就需要用 hitch 来传递
		var d, _d, args = arguments,
			a = [].concat(funcs), item,
			rs = [];
		d = rias.newDeferred("rias.allByOrder", timeout, function(){
			if(isFunction(timeoutCall)){
				timeoutCall.apply(d, d.__riasrArgs);
			}
		});
		d.__riasrArgs = [funcs].concat(toArray(args, 3));
		_d = d;
		rias.some(a, function(f, index){
			if(f){
				_d = _d.then(function(){
					return rias.when(f(), function(result){
						rs.push(result);
					}, function(result){
						rs.push(result);
					});
				});
			}
		});
		d.resolve();
		/*function run1(f){
			var _d = rias.newDeferred("rias.allByOrder.run1", timeout, function(){
				if(isFunction(timeoutCall)){
					timeoutCall.apply(_d, _d.__riasrArgs);
				}
			});
			_d.__riasrArgs = [f].concat(toArray(args, 3));
			rias.when(f(), function(result){
				rs.push(result);
				if(a.length < 1){
					d.resolve(rs);
				}else{
					f = a.shift();

				}
			});
		}
		item = a.shift();
		if(item){
			_d = rias.newDeferred("rias.allByOrder.run1", timeout, function(){
				if(isFunction(timeoutCall)){
					timeoutCall.apply(d, _d.__riasrArgs);
				}
			});
			_d.__riasrArgs = [item].concat(toArray(args, 3));
			rias.when(item(), function(result){

			})
		}*/
		return _d.promise;
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
		if(target.isDestroyed()){
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

	rias.i18n = rias.delegate(dojoI18n);///做成委托好些，避免修改原型。
	rias.i18n.studio = rias.delegate(riasi18n.studio);
	rias.i18n.action = rias.delegate(riasi18n.action);
	rias.i18n.message = rias.delegate(riasi18n.message);
	rias.locale = dojo.locale;

	rias.closeResult = {
		crError: -1,
		crCancel: 0,
		crSubmit: 1,
		crYes: 2,
		crNo: 3,
		isOk: function(cr){
			return cr == rias.closeResult.crSubmit || cr == rias.closeResult.crYes;
		}
	};

///RiasBase ===============================================///

	var _catCounter = {};
	//FIXME:zensst.考虑以后多页(rias.webApp)时怎样处理.
	rias._getUniqueCat = function(widget, wholeTypeName){
		widget = (widget._riaswType || widget.declaredClass || (isString(widget) ? widget : "riasWidget"));
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
		riasw = by(riasw);
		var d = !riasw || (riasw._beingDestroyed || riasw._destroyed);
		if(checkAncestors){
			while(!d && riasw._riasrOwner && (riasw = riasw._riasrOwner)){
				d = riasw._beingDestroyed || riasw._destroyed;
			}
		}
		return !!d;
	};
	rias.destroy = function(/*riasWidget|dijit|DOMNode|String*/ any, preserveDom){
		var w = by(any);
		if(w){
			if(!w._beingDestroyed){
				if(!w._destroyed){
					if(isFunction(w.destroyRecursive)){
						w.destroyRecursive(preserveDom);
					}else if(isFunction(w.destroy)){
						w.destroy(preserveDom)
					}else if(isFunction(w.remove)){
						w.remove(preserveDom)
					}
					w._destroyed = true;
				}
				w._beingDestroyed = true;
			}
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
				if(any && isFunction(any.remove)){
					any.remove();
				}
			}
		}
	};

	rias.removeChild = function(parent, child, noresize){
		if(child._riasrParent == parent){
			//console.debug(parent, child);
			child._riasrParent = undefined;
		}
		if(!isRiasw(child)){
			return;
		}
		if(isDijit(parent)){
			if(parent.removeChild && isDijit(child)){
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
				}else if(isRiasw(owner)){
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
					if(isRiasw(w.getOwnerRiasw())){
						w.getOwnerRiasw().own(w);
					}else if(isRiasw(w._riasrModule)){
						w._riasrModule.own(w);
					}
				}catch(e){
					console.error(rias.captureStackTrace(e), w);
					if(isFunction(errCall)){
						hitch(this, errCall)(e);
					}
				}
			}
			if(!w._riaswIdOfModule && params._riaswIdOfModule){
				w._riaswIdOfModule = params._riaswIdOfModule;
			}
			if(w._riaswIdOfModule){
				if(isString(w._riaswIdOfModule)){
					if(~(w._riaswIdOfModule.indexOf("."))){
						s = "The widget._riaswIdOfModule(" + w._riaswIdOfModule + ") cannot contains \".\". ";
						console.error(s, w);
						if(isFunction(errCall)){
							hitch(this, errCall)(new Error(s + params));
						}
					}
					if(w._riasrModule){
						if(rias.getObject(w._riaswIdOfModule, false, w._riasrModule)){
							if(rias.hostBrowser){
								debugger;
							}
							s = "Duplication _riaswIdOfModule['" + w._riaswIdOfModule + "'] in module['" + w._riasrModule.id + "']";
							console.error(s, w);
							if(isFunction(errCall)){
								hitch(this, errCall)(new Error(s + params));
							}
						}else{
							rias.setObject(w._riaswIdOfModule, w, w._riasrModule);
						}
					}
				}else{
					s = "The widget._riaswIdOfModule(" + w._riaswIdOfModule + ") error.";
					console.error(s, w);
					if(isFunction(errCall)){
						hitch(this, errCall)(s);
					}
				}
			}
			///必须判断 isDijit，才能处理 _riasWidgets，否则会导致因为非 Dijit 缺少 destroy() 而不能释放的问题。
			///非 dijit 已经扩展了 destroy()
			//if(!isFunction(w.destroy)){
			//	console.debug("The widget('" + (w.id || w.name || w._riaswType) + "') has no property of 'destroy: function()'.", params);
			//}
			try{
				if(w._riasrOwner && contains(w._riasrOwner._riasrElements, w)){
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
				if(isFunction(errCall)){
					hitch(this, errCall)(e);
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
			forEach(self._riasrElements, function(handle){
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
		isDestroyed: function(checkAncestors){
			return rias.isDestroyed(this, checkAncestors != false);
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
			if(isFunction(setter)){
				result = setter.apply(this, toArray(arguments, 1));
			}else{
				this._set(name, value);
			}
			return result || this;
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
					if(val){
						this.set(key, val);
					}
				}
			}, this);

			//delete params.ownerRiasw;
			delete params.riasrModule;
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
			if(isArray(name)){
				forEach(name, function(n){
					self._initAttr(n);
				});
			}
			if(isObject(name)){
				_init = (name.initialize == undefined || name.initialize);
				name = name.name;
			}
			if(isString(name)){
				N = rias.upperCaseFirst(name);
				if(!isFunction(self["_set" + N + "Attr"])){
					self["_set" + N + "Attr"] = function(value){
						self._set(name, value);///触发 watch()
					};
				}
				if(isFunction(self["_on" + N])){
					self.own(self.watch(name, function(_name, oldValue, value){
						if(self.isDestroyed(true)){
							return undefined;
						}
						return self["_on" + N](value, oldValue);
					}));
				}
				if(!isFunction(self["_get" + N + "Attr"])){
					self["_get" + N + "Attr"] = function(){
						return self[name];
					};
				}
				if(_init && isFunction(self["_on" + N])){
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

		_getRiasrModuleAttr: function(){
			return this._riasrModule;
		},
		_setRiasrModuleAttr: function(){
			throw "The riasrModule is readOnly.";
		},

		//_setOwnerRiaswAttr: function(){
		//	throw "The ownerRiasw is readOnly.";
		//},
		setOwnerRiasw: function(owner){
			owner = by(owner);
			if(owner){
				if(this._riasrOwner !== owner || this.ownerRiasw !== owner){
					if(isInstanceOf(owner, Destroyable)){
						owner.own(this);
					}else{
						//throw new Error("The owner of " + owner + " is not isInstanceOf rias.Destroyable.");
						console.error(this.id + ".setOwnerRiasw: the owner of " + owner + " is not isInstanceOf rias.Destroyable.\n    ----\n" + rias.getStackTrace());
					}
				}
			}else{
				this.isolate(true);/// 改变 owner，并非是 改变 parent，故应保留 parent。
			}
		},
		getOwnerRiasw: function(){
			return this._riasrOwner || this.ownerRiasw;
		},
		getRiasrElements: function(){
			return rias.map(this._riasrElements, function(i){
				return i && i._handle;
			});
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
				//if(isDijit(this)){
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
			//i = self._riasrElements.length;
			hds = rias.concat(hds, arguments);// [].concat 未做转换;

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
							//hitch(handle, self.isolate)();/// destroy 时，不再保留 parent。
							self.isolate.apply(handle, []);
						}
						handle[destroyMethodName](preserveDom);
						i = self._riasrElements.indexOf(odh);
						if(i >= 0){
							self._riasrElements.splice(i, 1);
						}
					})
				};
				if(isRiasw(handle)){
					hitch(handle, self.isolate)(true);/// 改变 owner，并非是 改变 parent，故应保留 parent。
					handle._riasrOwner = self;
					handle.ownerRiasw = self;
					self._riasrElements.push(odh);
					if(isInstanceOf(handle, Destroyable)){
						if(isFunction(handle._set_riasrDesigningAttr)){
							handle._set_riasrDesigningAttr(self._riasrDesigning);
						}else if(isFunction(handle._set_riasrDesigning)){
							handle._set_riasrDesigning(self._riasrDesigning);
						}else{
							handle._riasrDesigning = self._riasrDesigning;
						}
					}
				}

				// Callback for when handle is manually destroyed.
				function onManualDestroy(){
					odh._remove.remove();
					forEach(da, function(hdh){
						hdh._remove.remove();
					});
					//da = undefined;
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
					forEach(cleanupMethods, function(cleanupMethod){
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

			if(isString(func)){
				func = hitch(this, func);
			}
			// For backwards compatibility, if there's an onType() method in the widget then connect to that.
			// Remove in 2.0.
			var widgetMethod = this._onMap(type);
			if(widgetMethod){
				return this.after(this, widgetMethod, func, true);
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
		publish: function(target, topicName, event){
			if(this.isDestroyed()){
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
			var self = this,
				timer = null;
			if(isString(callback)){
				if(!self[callback]){
					console.error(this.id + ".defer: the '" + callback + "'] is null.");
				}
				callback = self[callback];
			}
			args = toArray(arguments, 2);
			timer = setTimeout(function(){
				if(!timer){
					return;
				}
				if(rias.isStackTrace){
					args.stack = rias.getStackTrace(args);
				}
				if(!self._destroyed){
					try{
						callback.apply(self, args);///IE8 不支持 args = undefined。
					}catch(e){
						console.error("this.defer()", e, rias.getStackTrace(args));
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
	/// rias.ClassBase 相当于无 dom 的 _WidgetBase.
	rias.ClassBase = rias.declare([Destroyable], {
		toString: function(){
			return '[riasClass ' + this._riaswType || this.declaredClass + ', ' + (this.id || 'NO ID') + ']'; // String
		},
		get: function(name){
			var names = this._getAttrNames(name);
			return this[names.g] ? this[names.g]() : this._get(name);
		}

	});

	return rias;

});