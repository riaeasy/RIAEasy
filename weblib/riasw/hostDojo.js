
//RIAStudio Client Runtime(rias) in Browser.

define([
	"rias/riasBase",
	"rias/regexp",

	"dojo/window",
	"dojo/on",
	"dojo/Evented",
	"dojo/keys",
	"dojo/mouse",
	"dojo/touch",
	"riasw/_base/gesture",

	"riasw/_base/a11yclick",
	"riasw/_base/typematic",

	"dojo/dom",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dojo/dom-prop",

	"dojo/parser",
	"dojo/query",
	"dojo/NodeList-dom",
	"dojo/NodeList-traverse",
	"dojo/hash",
	//"dojo/_base/url",
	//"dojo/_base/unload",
	//"dojo/cookie",

	"riasw/_base/a11y",
	"riasw/_base/focus",
	"riasw/_base/selection",

	"dojo/dnd/Moveable",
	"dojo/dnd/move",
	"dojo/dnd/Mover",

	"dojo/uacss",
	"dojo/hccss"

], function(rias, regexp,
			win, on, Evented, keys, mouse, touch, gesture,
			a11yclick, typematic,
			dojoDom, domConstruct, domGeom, domClass, domStyle, domAttr, domProp,
			parser, query, NodeListDom, NodeListTraverse, dojoHash, //_Url, //unload, cookie,
			a11y, focus, selection,
			Moveable, move, Mover,
			uacss, hccss) {

	//var _dInitDojo = rias.newDeferred();
	//rias.whenLoaded._deferreds.push(_dInitDojo);
	var has = rias.has,
		config = rias.config;

	rias.domNodeBy = function(/*String|DOMNode|riasWidget*/any){
		var node = byId(any);
		if(node){
			return node;
		}
		node = rias.by.apply(this, arguments || []);
		if(node){
			return node.domNode;
		}
		return undefined;
	};
	/// 下面的这些，需要注意 container 和 owner 的区别。
	rias.ownerDialogBy = function(any){
		var w = rias.by.apply(this, arguments || []);
		if(w && !rias.isRiaswModule(w)){
			w = w.ownerModule();
		}
		if(w){
			//if(w.domNode.parentNode === _globalTempDiv || w.domNode.parentNode === desktopBody){
			//	return undefined;
			//}else
			if(!rias.isRiaswDialog(w)){
				w = arguments.callee(w.ownerModule());
			}
		}
		return w;
	};
	rias.desktopBy = function(any){
		var w = rias.by.apply(this, arguments || []);
		if(w){
			if(!rias.isRiaswDesktop(w)){
				w = arguments.callee(w._getContainerRiasw());
			}
		}
		return w;
	};
	rias.ownerSceneBy = function(any){
		var w = rias.by.apply(this, arguments || []);
		if(w){
			if(!rias.isRiaswScene(w)){
				w = arguments.callee(w.ownerModule());
			}
		}
		return w;
	};
	rias.parentSceneBy = function(any){
		var w = rias.by.apply(this, arguments || []);
		if(w){
			if(!rias.isRiaswScene(w)){
				w = arguments.callee(w._getContainerRiasw());
			}
		}
		return w;
	};
	rias.viewBy = function(any){
		var w = rias.by.apply(this, arguments || []);
		if(w){
			if(!rias.isRiaswView(w)){
				w = arguments.callee(w._getContainerRiasw());
			}
		}
		return w;
	};
	rias.topViewBy = function(any){
		var w = rias.viewBy.apply(this, arguments || []),
			r;
		while(w){
			r = w;
			w = rias.viewBy(w._getContainerRiasw());
		}
		return w;
	};
	rias.formBy = function(any){
		var w = rias.by.apply(this, arguments || []);
		if(w){
			if(!rias.isRiaswForm(w)){
				w = arguments.callee(w._getContainerRiasw());
			}
		}
		return w;
	};

///dom******************************************************************************///
	rias.Evented = Evented;
	rias.on = on;
	rias.stopEvent = function(/*Event*/ evt){
		// summary:
		//		prevents propagation and clobbers the default action of the
		//		passed event
		// evt: Event
		//		The event object. If omitted, window.event is used on IE.
		if(has("dom-addeventlistener") || (evt && evt.preventDefault)){
			evt.preventDefault();
			evt.stopPropagation();
		}else{
			evt = evt || window.event;
			evt.cancelBubble = true;
			on._preventDefault.call(evt);
		}
	};
	/*function syntheticPreventDefault(){
		this.cancelable = false;
		this.defaultPrevented = true;
	}
	function syntheticStopPropagation(){
		this.bubbles = false;
	}
	rias.emit = function(target, type, event){
		event = event || {};
		if(event.bubbles == undefined){
			event.bubbles = true;
		}
		if(event.cancelable == undefined){
			event.cancelable = true;
		}
		//if(!event.detail){
		//	event.detail = {};
		//}
		//event.detail.widget = this;
		return on.emit(target, type, event);
	};*/
	rias.keys = keys;
	rias.mouse = mouse;
	rias.touch = touch;
	rias.tap = gesture.tap;
	rias.swipe = gesture.swipe;

	rias.a11yclick = a11yclick;
	rias.typematic = typematic;

	rias.hash = dojoHash;
	rias.mixin(rias.hash, {
		getParams: function(/*String*/ hash){
			// summary:
			//		get the params from the hash
			//
			// hash: String
			//		the url hash
			//
			// returns:
			//		the params object
			//
			var params;
			if(hash && hash.length){
				// fixed handle view specific params

				while(hash.indexOf("(") > 0){
					var index = hash.indexOf("(");
					var endindex = hash.indexOf(")");
					var viewPart = hash.substring(index, endindex + 1);
					if(!params){
						params = {};
					}
					params = this.getParamObj(params, viewPart);
					// next need to remove the viewPart from the hash, and look for the next one
					var viewName = viewPart.substring(1,viewPart.indexOf("&"));
					hash = hash.replace(viewPart, viewName);
				}
				// after all of the viewParts need to get the other params

				for(var parts = hash.split("&"), x = 0; x < parts.length; x++){
					var tp = parts[x].split("="),
						name = tp[0],
						value = encodeURIComponent(tp[1] || "");
					if(name && value){
						if(!params){
							params = {};
						}
						params[name] = value;
					}
				}
			}
			return params; // Object
		},
		getParamObj: function(/*Object*/ params, /*String*/ viewPart){
			// summary:
			//		called to handle a view specific params object
			// params: Object
			//		the view specific params object
			// viewPart: String
			//		the part of the view with the params for the view
			//
			// returns:
			//		the params object for the view
			//
			var viewparams;
			var viewName = viewPart.substring(1, viewPart.indexOf("&"));
			var hash = viewPart.substring(viewPart.indexOf("&"), viewPart.length - 1);
			for(var parts = hash.split("&"), x = 0; x < parts.length; x++){
				var tp = parts[x].split("="),
					name = tp[0],
					value = encodeURIComponent(tp[1] || "");
				if(name && value){
					if(!viewparams){
						viewparams = {};
					}
					viewparams[name] = value;
				}
			}
			params[viewName] = viewparams;
			return params; // Object
		},
		buildWithParams: function(/*String*/ hash, /*Object*/ params){
			// summary:
			//		build up the url hash adding the params
			// hash: String
			//		the url hash
			// params: Object
			//		the params object
			//
			// returns:
			//		the params object
			//
			if(hash.charAt(0) !== "#"){
				hash = "#" + hash;
			}
			var item;
			for(item in params){
				var value = params[item];
				// add a check to see if the params includes a view name if so setup the hash like (viewName&item=value);
				if(rias.isObject(value)){
					hash = this.addViewParams(hash, item, value);
				}else{
					if(item && value != null){
						hash = hash + "&" + item + "=" + params[item];
					}
				}
			}
			return hash; // String
		},
		addViewParams: function(/*String*/ hash, /*String*/ view, /*Object*/ params){
			// summary:
			//		add the view specific params to the hash for example (view1&param1=value1)
			// hash: String
			//		the url hash
			// view: String
			//		the view name
			// params: Object
			//		the params for this view
			//
			// returns:
			//		the hash string
			//
			if(hash.charAt(0) !== "#"){
				hash = "#" + hash;
			}
			var index = hash.indexOf(view);
			if(index > 0){ // found the view?
				if((hash.charAt(index - 1) === "#" || hash.charAt(index - 1) === "+") && // assume it is the view? or could check the char after for + or & or -
					(hash.charAt(index + view.length) === "&" || hash.charAt(index + view.length) === "+" || hash.charAt(index+view.length) === "-")){
					// found the view at this index.
					var oldView = hash.substring(index - 1, index + view.length + 1);
					var paramString = this.getParamString(params);
					var newView = hash.charAt(index - 1) + "(" + view + paramString + ")" + hash.charAt(index + view.length);
					hash = hash.replace(oldView, newView);
				}
			}
			return hash; // String
		},
		getParamString: function(/*Object*/ params){
			// summary:
			//		return the param string
			// params: Object
			//		the params object
			//
			// returns:
			//		the params string
			//
			var paramStr = "",
				item;
			for(item in params){
				if(item && params[item] != null){
					paramStr = paramStr + "&" + item + "=" + params[item];
				}
			}
			return paramStr; // String
		},
		getTarget: function(/*String*/ hash, /*String?*/ defaultView){
			// summary:
			//		return the target string
			// hash: String
			//		the hash string
			// defaultView: String
			//		the optional defaultView string
			//
			// returns:
			//		the target string
			//
			if(!defaultView){
				defaultView = ""
			}
			while(hash.indexOf("(") > 0){
				var index = hash.indexOf("(");
				var endindex = hash.indexOf(")");
				var viewPart = hash.substring(index, endindex + 1);
				var viewName = viewPart.substring(1, viewPart.indexOf("&"));
				hash = hash.replace(viewPart, viewName);
			}
			return (((hash && hash.charAt(0) === "#") ? hash.substr(1) : hash) || defaultView).split('&')[0];	// String
		}
	});

	var ore = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$"),
		ire = new RegExp("^((([^\\[:]+):)?([^@]+)@)?(\\[([^\\]]+)\\]|([^\\[:]*))(:([0-9]+))?$"),
		_Url = function(){
			var n = null,
				_a = arguments,
				uri = [_a[0]];
			// resolve uri components relative to each other
			for(var i = 1; i<_a.length; i++){
				if(!_a[i]){
					continue;
				}

				// Safari doesn't support this.constructor so we have to be explicit
				// FIXME: Tracked (and fixed) in Webkit bug 3537.
				//		http://bugs.webkit.org/show_bug.cgi?id=3537
				var relobj = new _Url(_a[i] + ""),
					uriobj = new _Url(uri[0] + "");

				if(
					relobj.path === "" &&
						!relobj.scheme &&
						!relobj.authority &&
						!relobj.query
					){
					if(relobj.fragment !== n){
						uriobj.fragment = relobj.fragment;
					}
					relobj = uriobj;
				}else if(!relobj.scheme){
					relobj.scheme = uriobj.scheme;

					if(!relobj.authority){
						relobj.authority = uriobj.authority;

						if(relobj.path.charAt(0) !== "/"){
							var path = uriobj.path.substring(0,
								uriobj.path.lastIndexOf("/") + 1) + relobj.path;

							var segs = path.split("/");
							for(var j = 0; j < segs.length; j++){
								if(segs[j] === "."){
									// flatten "./" references
									if(j === segs.length - 1){
										segs[j] = "";
									}else{
										segs.splice(j, 1);
										j--;
									}
								}else if(j > 0 && !(j === 1 && segs[0] === "") &&
									segs[j] === ".." && segs[j-1] !== ".."){
									// flatten "../" references
									if(j === (segs.length - 1)){
										segs.splice(j, 1);
										segs[j - 1] = "";
									}else{
										segs.splice(j - 1, 2);
										j -= 2;
									}
								}
							}
							relobj.path = segs.join("/");
						}
					}
				}

				uri = [];
				if(relobj.scheme){
					uri.push(relobj.scheme, ":");
				}
				if(relobj.authority){
					uri.push("//", relobj.authority);
				}
				uri.push(relobj.path);
				if(relobj.query){
					uri.push("?", relobj.query);
				}
				if(relobj.fragment){
					uri.push("#", relobj.fragment);
				}
			}

			this.uri = uri.join("");

			// break the uri into its main components
			var r = this.uri.match(ore);

			this.scheme = r[2] || (r[1] ? "" : n);
			this.authority = r[4] || (r[3] ? "" : n);
			this.path = r[5]; // can never be undefined
			this.query = r[7] || (r[6] ? "" : n);
			this.fragment	 = r[9] || (r[8] ? "" : n);

			if(this.authority !== n){
				// server based naming authority
				r = this.authority.match(ire);

				this.user = r[3] || n;
				this.password = r[4] || n;
				this.host = r[6] || r[7]; // ipv6 || ipv4
				this.port = r[9] || n;
			}
		};
	_Url.prototype.toString = function(){
		return this.uri;
	};
	rias._Url = _Url;

	//rias.addOnWindowUnload = unload.addOnWindowUnload;
	//rias.addOnWindowUnload = function(/*Object|Function?*/ obj, /*String|Function?*/ functionName){
		// summary:
		//		Registers a function to be triggered when window.onunload fires.
		//		Deprecated, use on(window, "unload", lang.hitch(obj, functionName)) instead.
		// description:
		//		The first time that addOnWindowUnload is called Dojo
		//		will register a page listener to trigger your unload
		//		handler with. Note that registering these handlers may
		//		destroy "fastback" page caching in browsers that support
		//		it. Be careful trying to modify the DOM or access
		//		JavaScript properties during this phase of page unloading:
		//		they may not always be available. Consider
		//		addOnUnload() if you need to modify the DOM or do
		//		heavy JavaScript work since it fires at the equivalent of
		//		the page's "onbeforeunload" event.
		// example:
		//	|	var afunc = function() {console.log("global function");};
		//	|	require(["dojo/_base/unload"], function(unload) {
		//	|		var foo = {bar: function(){ console.log("bar unloading...");},
		//	|		           data: "mydata"};
		//	|		unload.addOnWindowUnload(afunc);
		//	|		unload.addOnWindowUnload(foo, "bar");
		//	|		unload.addOnWindowUnload(foo, function(){console.log("", this.data);});
		//	|	});
	//	if (!rias.windowUnloaded){
	//		on(window, "unload", (rias.windowUnloaded = function(){
				// summary:
				//		signal fired by impending window destruction. You may use
				//		dojo.addOnWindowUnload() to register a listener for this
				//		event. NOTE: if you wish to dojo.connect() to this method
				//		to perform page/application cleanup, be aware that this
				//		event WILL NOT fire if no handler has been registered with
				//		addOnWindowUnload(). This behavior started in Dojo 1.3.
				//		Previous versions always triggered windowUnloaded(). See
				//		addOnWindowUnload for more info.
	//		}));
	//	}
	//	on(window, "unload", rias.hitch(obj, functionName));
	//};
	//rias.addOnUnload = unload.addOnUnload;
	//rias.addOnBeforeUnload = function(node, /*Object?|Function?*/ obj, /*String|Function?*/ functionName){
		// summary:
		//		Registers a function to be triggered when the page unloads.
		//		Deprecated, use on(window, "beforeunload", lang.hitch(obj, functionName)) instead.
		// description:
		//		The first time that addOnBeforeUnload is called Dojo will
		//		register a page listener to trigger your unload handler
		//		with.
		//
		//		In a browser environment, the functions will be triggered
		//		during the window.onbeforeunload event. Be careful of doing
		//		too much work in an unload handler. onbeforeunload can be
		//		triggered if a link to download a file is clicked, or if
		//		the link is a javascript: link. In these cases, the
		//		onbeforeunload event fires, but the document is not
		//		actually destroyed. So be careful about doing destructive
		//		operations in a rias.addOnBeforeUnload callback.
		//
		//		Further note that calling rias.addOnBeforeUnload will prevent
		//		browsers from using a "fast back" cache to make page
		//		loading via back button instantaneous.
		// example:
		//	|	var afunc = function() {console.log("global function");};
		//	|	require(["dojo/_base/unload"], function(unload) {
		//	|		var foo = {bar: function(){ console.log("bar unloading...");},
		//	|		           data: "mydata"};
		//	|		rias.addOnBeforeUnload(afunc);
		//	|		rias.addOnBeforeUnload(foo, "bar");
		//	|		rias.addOnBeforeUnload(foo, function(){console.log("", this.data);});
		//	|	});
	//	if(node && !rias.isDomNode(node)){
	//		functionName = obj;
	//		obj = node;
	//		node = window;
	//	}
	//	on(node, "beforeunload", rias.hitch(obj, functionName));
	//};

	//rias.cookie = cookie;
	rias.cookie =  function(/*String*/name, /*String?*/ value, /*__cookieProps?*/ props){
		// summary:
		//		Get or set a cookie.
		// description:
		//		If one argument is passed, returns the value of the cookie
		//		For two or more arguments, acts as a setter.
		// name:
		//		Name of the cookie
		// value:
		//		Value for the cookie
		// props:
		//		Properties for the cookie
		// example:
		//		set a cookie with the JSON-serialized contents of an object which
		//		will expire 5 days from now:
		//	|	require(["dojo/cookie", "dojo/json"], function(cookie, json){
		//	|		cookie("configObj", json.stringify(config, {expires: 5 }));
		//	|	});
		//
		// example:
		//		de-serialize a cookie back into a JavaScript object:
		//	|	require(["dojo/cookie", "dojo/json"], function(cookie, json){
		//	|		config = json.parse(cookie("configObj"));
		//	|	});
		//
		// example:
		//		delete a cookie:
		//	|	require(["dojo/cookie"], function(cookie){
		//	|		cookie("configObj", null, {expires: -1});
		//	|	});
		var c = document.cookie, ret;
		if(arguments.length === 1){
			var matches = c.match(new RegExp("(?:^|; )" + regexp.escapeString(name) + "=([^;]*)"));
			ret = matches ? decodeURIComponent(matches[1]) : undefined;
		}else{
			props = props || {};
			// FIXME: expires=0 seems to disappear right away, not on close? (FF3)  Change docs?
			var exp = props.expires;
			if(typeof exp === "number"){
				var d = new Date();
				d.setTime(d.getTime() + exp * 24 * 60 * 60 * 1000);
				exp = props.expires = d;
			}
			if(exp && exp.toUTCString){
				props.expires = exp.toUTCString();
			}

			value = encodeURIComponent(value);
			var updatedCookie = name + "=" + value, propName;
			for(propName in props){
				updatedCookie += "; " + propName;
				var propValue = props[propName];
				if(propValue !== true){
					updatedCookie += "=" + propValue;
				}
			}
			document.cookie = updatedCookie;
		}
		return ret; // String|undefined
	};
	rias.cookie.isSupported = function(){
		// summary:
		//		Use to determine if the current browser supports cookies or not.
		//
		//		Returns true if user allows cookies.
		//		Returns false if user doesn't allow cookies.
		if(!("cookieEnabled" in navigator)){
			this("__djCookieTest__", "CookiesAllowed");
			navigator.cookieEnabled = this("__djCookieTest__") === "CookiesAllowed";
			if(navigator.cookieEnabled){
				this("__djCookieTest__", "", {
					expires: -1
				});
			}
		}
		return navigator.cookieEnabled;
	};

	var _dom = rias.dom = {};
	var winDoc = _dom.doc = rias.doc;
	//_dom.withDoc = rias.withDoc;
	var winBody = _dom.body = rias.body;
	_dom.docBody = winBody(winDoc);
	var desktopBody = _dom.desktopBody = rias.desktop ? rias.desktop.domNode : _dom.docBody;
	_dom.head = winDoc.head || winDoc.getElementsByTagName('head')[0];
	//_dom.scripts = winDoc.getElementsByTagName('script');

	_dom.getWindow = win.get;
	_dom.getWindowBox = win.getBox;
	//_dom.scrollIntoView = rias.hitch(win, win.scrollIntoView);///调用了 this，需要 hitch
	_dom.scrollIntoView = function(/*DomNode*/ node, /*Object?*/ pos){
		if(node){
			win.scrollIntoView(node, pos);
		}
	};

	_dom.parser = parser;
	//_dom.parse = rias.hitch(parser, parser.parse);///调用了 this，需要 hitch
	_dom.query = query;

	rias.dom.dispatchTransition = function(/*DomNode*/target, /*Object*/transitionOptions, /*Event?*/triggerEvent){
		// summary:
		//		Creates a transition event.
		// target:
		//		The DOM node that initiates the transition (for example a ListItem).
		// transitionOptions:
		//		Contains the transition options.
		// triggerEvent:
		//		The event that triggered the transition (for example a touch event on a ListItem).
		rias.on.emit(target, "startTransition", {
			bubbles: true,
			cancelable: true,
			detail: transitionOptions,
			triggerEvent: triggerEvent || null
		});
	};

	// caches for capitalized names and hypen names
	var capitalizedNames = [],
		hypenNames = [];
	// We just test webkit prefix for now since our themes only have standard and webkit
	// (see dojox/mobile/themes/common/css3.less)
	// More prefixes can be added if/when we add them to css3.less.
	var webkitPrefixes = ["webkit"];
	//var webkitPrefixes = ["webkit", 'ms', 'o', 'moz'];
	// Does the browser support CSS3 animations?
	has.add("css3-animations", function(global, document, element){
		var style = element.style;
		return (style.animation !== undefined && style.transition !== undefined) || rias.some(webkitPrefixes, function(p){
			return style[p + "Animation"] !== undefined && style[p + "Transition"] !== undefined;
		});
	});
	// Indicates whether style 'transition' returns empty string instead of
	// undefined, although TransitionEvent is not supported.
	// Reported on Android 4.1.x on some devices: https://bugs.dojotoolkit.org/ticket/17164
	// element style used for feature testing
	var t17164Style = rias.doc.createElement("div").style;
	rias.has.add("t17164", function(global, document, element){
		return (element.style.transition !== undefined) && !('TransitionEvent' in window);
	});

	rias.dom.css3Name = function(/*String*/p, /*Boolean?*/hyphen){
		// summary:
		//		Returns the name of a CSS3 property with the correct prefix depending on the browser.
		// p:
		//		The (non-prefixed) property name. The property name is assumed to be consistent with
		//		the hyphen argument, for example "transition-property" if hyphen is true, or "transitionProperty"
		//		if hyphen is false. If the browser supports the non-prefixed property, the property name will be
		//		returned unchanged.
		// hyphen:
		//		Optional, true if hyphen notation should be used (for example "transition-property" or "-webkit-transition-property"),
		//		false for camel-case notation (for example "transitionProperty" or "webkitTransitionProperty").

		var n = (hyphen ? hypenNames : capitalizedNames)[p];
		if(!n){

			if(/End|Start/.test(p)){
				// event names: no good way to feature-detect, so we
				// assume they have the same prefix as the corresponding style property
				var idx = p.length - (p.match(/End/) ? 3 : 5);
				var s = p.substr(0, idx);
				var pp = this.name(s);
				if(pp === s){
					// no prefix, standard event names are all lowercase
					n = p.toLowerCase();
				}else{
					// prefix, e.g. webkitTransitionEnd (camel case)
					n = pp + p.substr(idx);
				}
			}else if(p === "keyframes"){
				// special case for keyframes, we also rely on consistency between 'animation' and 'keyframes'
				var pk = this.name("animation", hyphen);
				if(pk === "animation"){
					n = p;
				}else if(hyphen){
					n = pk.replace(/animation/, "keyframes");
				}else{
					n = pk.replace(/Animation/, "Keyframes");
				}
			}else{
				// convert name to camel-case for feature test
				var cn = hyphen ? p.replace(/-(.)/g, function(match, p1){
					return p1.toUpperCase();
				}) : p;
				if(t17164Style[cn] !== undefined && !rias.has('t17164')){
					// standard non-prefixed property is supported
					n = p;
				}else{
					// try prefixed versions
					cn = cn.charAt(0).toUpperCase() + cn.slice(1);
					rias.some(webkitPrefixes, function(prefix){
						if(t17164Style[prefix + cn] !== undefined){
							if(hyphen){
								n = "-" + prefix + "-" + p;
							}else{
								n = prefix + cn;
							}
						}
					});
				}
			}

			if(!n){
				// The property is not supported, just return it unchanged, it will be ignored.
				n = p;
			}

			(hyphen ? hypenNames : capitalizedNames)[p] = n;
		}
		return n;
	};
	rias.dom.css3Add = function(/*Object*/styles, /*Object*/css3Styles){
		// summary:
		//		Prefixes all property names in "css3Styles" and adds the prefixed properties in "styles".
		//		Used as a convenience when an object is passed to domStyle.set to set multiple styles.
		// example:
		//		domStyle.set(bar, css3.add({
		//			opacity: 0.6,
		//			position: "absolute",
		//			backgroundColor: "#606060"
		//		}, {
		//			borderRadius: "2px",
		//			transformOrigin: "0 0"
		//		}));
		// returns:
		//		The "styles" argument where the CSS3 styles have been added.

		for(var p in css3Styles){
			if(css3Styles.hasOwnProperty(p)){
				styles[rias.dom.css3Name(p)] = css3Styles[p];
			}
		}
		return styles;
	};

	var byId;
	if(has("ie")){
		byId = _dom.byId = dojoDom.byId = function(id, doc){
			if(typeof id !== "string"){
				return rias.isDomNode(id) ? id : null;
			}
			var _doc = doc || winDoc,
				te = id && _doc.getElementById(id);
			// attributes.id.value is better than just id in case the
			// user has a name=id inside a form
			if(te && (te.attributes.id.value === id || te.id === id)){
				return rias.isDomNode(te) ? te : null;
			}else{
				var eles = _doc.all[id];
				if(!eles || eles.nodeName){
					eles = [eles];
				}
				// if more than 1, choose first with the correct id
				var i = 0;
				while((te = eles[i++])){
					if((te.attributes && te.attributes.id && te.attributes.id.value === id) || te.id === id){
						return rias.isDomNode(te) ? te : null;
					}
				}
			}
		};
	}else{
		byId = _dom.byId = dojoDom.byId = function(id, doc){
			// inline'd type check.
			// be sure to return null per documentation, to match IE branch.
			id = (typeof id === "string") ? (doc || winDoc).getElementById(id) : id;
			return rias.isDomNode(id) ? id : null; // DOMNode
		};
	}

	_dom.form = {
		exclude: "file|submit|image|reset|button",
		setValue: function(/*Object*/ obj, /*String*/ name, /*String*/ value){
			// summary:
			//		For the named property in object, set the value. If a value
			//		already exists and it is a string, convert the value to be an
			//		array of values.

			// Skip it if there is no value
			if(value === null){
				return;
			}

			var val = obj[name];
			if(typeof val === "string"){ // inline'd type check
				obj[name] = [val, value];
			}else if(rias.isArray(val)){
				val.push(value);
			}else{
				obj[name] = value;
			}
		},
		fieldToObject: function(/*DOMNode|String*/ inputNode){
			// summary:
			//		Serialize a form field to a JavaScript object.
			// description:
			//		Returns the value encoded in a form field as
			//		as a string or an array of strings. Disabled form elements
			//		and unchecked radio and checkboxes are skipped.	Multi-select
			//		elements are returned as an array of string values.
			// inputNode: DOMNode|String
			// returns: Object

			var ret = null;
			inputNode = byId(inputNode);
			if(inputNode){
				var _in = inputNode.name,
					type = (inputNode.type || "").toLowerCase();
				if(_in && type && !inputNode.disabled){
					if(type ==="radio" || type === "checkbox"){
						if(inputNode.checked){
							ret = inputNode.value;
						}
					}else if(inputNode.multiple){
						ret = [];
						var nodes = [inputNode.firstChild];
						while(nodes.length){
							for(var node = nodes.pop(); node; node = node.nextSibling){
								if(node.nodeType === 1 && node.tagName.toLowerCase() === "option"){
									if(node.selected){
										ret.push(node.value);
									}
								}else{
									if(node.nextSibling){
										nodes.push(node.nextSibling);
									}
									if(node.firstChild){
										nodes.push(node.firstChild);
									}
									break;
								}
							}
						}
					}else{
						ret = inputNode.value;
					}
				}
			}
			return ret; // Object
		},

		toObject: function(/*DOMNode|String*/ formNode){
			// summary:
			//		Serialize a form node to a JavaScript object.
			// description:
			//		Returns the values encoded in an HTML form as
			//		string properties in an object which it then returns. Disabled form
			//		elements, buttons, and other non-value form elements are skipped.
			//		Multi-select elements are returned as an array of string values.
			// formNode: DOMNode|String
			// example:
			//		This form:
			//		|	<form id="test_form">
			//		|		<input type="text" name="blah" value="blah">
			//		|		<input type="text" name="no_value" value="blah" disabled>
			//		|		<input type="button" name="no_value2" value="blah">
			//		|		<select type="select" multiple name="multi" size="5">
			//		|			<option value="blah">blah</option>
			//		|			<option value="thud" selected>thud</option>
			//		|			<option value="thonk" selected>thonk</option>
			//		|		</select>
			//		|	</form>
			//
			//		yields this object structure as the result of a call to
			//		formToObject():
			//
			//		|	{
			//		|		blah: "blah",
			//		|		multi: [
			//		|			"thud",
			//		|			"thonk"
			//		|		]
			//		|	};

			var ret = {},
				elems = byId(formNode).elements;
			for(var i = 0, l = elems.length; i < l; ++i){
				var item = elems[i],
					_in = item.name,
					type = (item.type || "").toLowerCase();
				if(_in && type && this.exclude.indexOf(type) < 0 && !item.disabled){
					this.setValue(ret, _in, this.fieldToObject(item));
					if(type === "image"){
						ret[_in + ".x"] = ret[_in + ".y"] = ret[_in].x = ret[_in].y = 0;
					}
				}
			}
			return ret; // Object
		},

		toQuery: function(/*DOMNode|String*/ formNode){
			// summary:
			//		Returns a URL-encoded string representing the form passed as either a
			//		node or string ID identifying the form to serialize
			// formNode: DOMNode|String
			// returns: String

			return rias.objToUrlParams(this.toObject(formNode)); // String
		},

		toJson: function(/*DOMNode|String*/ formNode, args){
			// summary:
			//		Create a serialized JSON string from a form node or string
			//		ID identifying the form to serialize
			// formNode: DOMNode|String
			// prettyPrint: Boolean?
			// returns: String

			return rias.toJson(this.toObject(formNode), args); // String
		}
	};

	var isDescendant = _dom.isDescendant = dojoDom.isDescendant = function(/*DOMNode|String*/ node, /*DOMNode|String*/ ancestor){
		// summary:
		//		Returns true if node is a descendant of ancestor
		// node: DOMNode|String
		//		string id or node reference to test
		// ancestor: DOMNode|String
		//		string id or node reference of potential parent to test against
		//
		// example:
		//		Test is node id="bar" is a descendant of node id="foo"
		//	|	require(["dojo/dom"], function(dom){
		//	|		if(dom.isDescendant("bar", "foo")){ ... }
		//	|	});

		if(!node || !ancestor){
			return false;
		}
		try{
			node = byId(node);
			ancestor = byId(ancestor);
			while(node){
				if(node === ancestor){
					return true; // Boolean
				}
				node = node.parentNode;
			}
		}catch(e){
			//squelch, return false
		}
		return false; // Boolean
	};
	_dom.contains = function(parent, child){
		parent = rias.domNodeBy(parent);
		child = rias.domNodeBy(child);
		return isDescendant(child, parent);
	};

	_dom.toDom = domConstruct.toDom;
	var domOn = _dom.domOn = function(node, eventName, ieEventName, handler){
		// Add an event listener to a DOM node using the API appropriate for the current browser;
		// return a function that will disconnect the listener.
		if(!has("ie-event-behavior")){
			node.addEventListener(eventName, handler, false);
			return function(){
				node.removeEventListener(eventName, handler, false);
			};
		}else{
			node.attachEvent(ieEventName, handler);
			return function(){
				node.detachEvent(ieEventName, handler);
			};
		}
	};
	var domPlace = _dom.place = function(node, refNode, position, callback){
		if(callback){
			var loadDisconnector = domOn(node, "load", "onreadystatechange", function(e){
					e = e || window.event;
					var n = e.target || e.srcElement;
					if(e.type === "load" || /complete|loaded/.test(n.readyState)){
						loadDisconnector();
						errorDisconnector();
						if(callback){
							callback();
						}
					}
				}),
				errorDisconnector = domOn(node, "error", "onerror", function(e){
					loadDisconnector();
					errorDisconnector();
					rias.require.signal("error", rias.mixin(new Error("injectUrl error: "), {
						src:"dojoLoader/rias.require.injectNode",
						info:[node, e]
					}));
					if(callback){
						callback();
					}
				});
		}
		_dom.clearComputedStyle(node);
		refNode = refNode || desktopBody;
		if(position < 0){
			if(!refNode.childNodes.length){
				position = Infinity;
			}else{
				position += refNode.childNodes.length;
			}
		}
		///domConstruct.place 可能存在 aspect，需要包一层
		return domConstruct.place(node, refNode, position);
	};
	///domConstruct.create 可能存在 aspect，需要包一层
	_dom.create = function(/*DOMNode|String*/ tag, /*Object*/ attrs, /*DOMNode|String?*/ refNode, /*String?*/ pos){
		return domConstruct.create(tag, attrs, refNode, pos);
	};
	function _empty(/*DomNode*/ node){
		// TODO: remove this if() block in 2.0 when we no longer have to worry about IE memory leaks,
		// and then uncomment the emptyGrandchildren() test case from html.html.
		// Note that besides fixing #16957, using removeChild() is actually faster than setting node.innerHTML,
		// see http://jsperf.com/clear-dom-node.
		if(node){
			/// 兼容 ie，ie 不能对 null 用 in
			if("innerHTML" in node){
				try{
					// fast path
					node.innerHTML = "";
					return;
				}catch(e){
					// innerHTML is readOnly (e.g. TABLE (sub)elements in quirks mode)
					// Fall through (saves bytes)
				}
			}

			// SVG/strict elements don't support innerHTML
			for(var c; (c = node.lastChild);){ // intentional assignment
				node.removeChild(c);
			}
		}
	}
	///domConstruct.empty 存在 aspect，需要包一层
	domConstruct.empty = function(node){
		_empty(byId(node));
	};
	_dom.empty = function(node){
		domConstruct.empty(byId(node));
	};
	function _destroy(/*DomNode*/ node, /*DomNode*/ parent){
		// in IE quirks, node.canHaveChildren can be false but firstChild can be non-null (OBJECT/APPLET)
		if(node){
			/// 兼容 ie，ie 不能对 null 用 in
			if(node.firstChild){
				_empty(node);
			}
			if(parent){
				// removeNode(false) doesn't leak in IE 6+, but removeChild() and removeNode(true) are known to leak under IE 8- while 9+ is TBD.
				// In IE quirks mode, PARAM nodes as children of OBJECT/APPLET nodes have a removeNode method that does nothing and
				// the parent node has canHaveChildren=false even though removeChild correctly removes the PARAM children.
				// In IE, SVG/strict nodes don't have a removeNode method nor a canHaveChildren boolean.
				if(has("ie") && parent.canHaveChildren && "removeNode" in node){
					node.removeNode(false);
				}else{
					parent.removeChild(node);
				}
			}
		}
	}
	///domConstruct.destroy 存在 aspect，需要包一层
	domConstruct.destroy = function(node){
		node = byId(node);
		if(node){
			_destroy(node, node.parentNode);
		}
	};
	_dom.destroy = function(node){
		domConstruct.destroy(node);
	};

	(function (){
		///为了隔离 var，独立设置一个 function 实现闭包。
		///这里的 injectUrl 是基于浏览器的
		if(has("dom") && (has("dojo-inject-api") || has("dojo-dom-ready-api"))){
			var insertPointSibling = 0,
				doc = rias.global.document,///rias.dom.doc 尚未取得
				makeError = function(error, info){
					return rias.mixin(new Error(error), {
						src:"dojoLoader/rias.require.injectNode",
						info:info
					});
				},
				windowOnLoadListener = domOn(window, "load", "onload", function(){
					rias.require.pageLoaded = 1;
					if(doc.readyState !== "complete"){
						(doc.readyState = "complete");
					}
					windowOnLoadListener();
				});

			if(has("dojo-inject-api")){
				// if the loader is on the page, there must be at least one script element
				// getting its parent and then doing insertBefore solves the "Operation Aborted"
				// error in IE from appending to a node that isn't properly closed; see
				// dojo/tests/_base/loader/requirejs/simple-badbase.html for an example
				// don't use scripts with type dojo/... since these may be removed; see #15809
				// prefer to use the insertPoint computed during the config sniff in case a script is removed; see #16958
				var scripts = doc.getElementsByTagName("script"),
					i = 0,
					script, src;
				//while(!insertPointSibling){
				//	if(!/^dojo/.test((script = scripts[i++]) && script.type)){
				//		insertPointSibling = script;
				//	}
				//}
				while(i < scripts.length){
					script = scripts[i++];
					if((src = script.getAttribute("src")) && (src.match(/(((.*)\/)|^)dojo\.js(\W|$)/i))){
						insertPointSibling = script;
					}
					if((src = (script.getAttribute("data-dojo-config") || script.getAttribute("djConfig")))){
						insertPointSibling = script;
					}
				}

				rias.require.injectUrl = function(url, callback, module){
					// insert a script element to the insert-point element with src=url;
					// apply callback upon detecting the script has loaded.

					var node = module.node = doc.createElement("script"),
						onLoad = function(e){
							e = e || window.event;
							var n = e.target || e.srcElement;
							if(rias.config.publishRequire && rias.publish){
								rias.publish("/rias/require/load", [url]);
								rias.publish("/rias/require/done", [url]);
							}
							if(e.type === "load" || /complete|loaded/.test(n.readyState)){
								loadDisconnector();
								errorDisconnector();
								if(callback){
									callback();
								}
							}
						},
						loadDisconnector = domOn(node, "load", "onreadystatechange", onLoad),
						errorDisconnector = domOn(node, "error", "onerror", function(e){
							loadDisconnector();
							errorDisconnector();
							if(rias.config.publishRequire && rias.publish){
								rias.publish("/rias/require/error", [url, e]);
								rias.publish("/rias/require/done", [url]);
							}
							if(rias.contains(url, "rias/riasd")){
								rias.require.signal("error", makeError("injectUrl rias/riasd error: ", [url, e]));
							}else{
								rias.require.signal("error", makeError("injectUrl error: ", [url, e]));
							}
							if(callback){
								callback();
							}
						});

					if(rias.config.publishRequire && rias.publish){
						rias.publish("/rias/require/start", [url]);
					}
					node.type = "text/javascript";
					node.charset = "utf-8";
					///不要改变 url，以致 publish 不一致。
					node.src = (module && module._riasrUndef ? url + (/\?/.test(url) ? "&" : "?") + (new Date()).getTime() : url);
					if(module){
						delete module._riasrUndef;
					}
					insertPointSibling.parentNode.insertBefore(node, insertPointSibling);
					return node;
				};
			}
		}
	})();

	_dom.containsClass = domClass.contains;
	_dom.addClass = domClass.add;
	_dom.removeClass = domClass.remove;
	///domClass.toggle(/*DomNode|String*/ node, /*String|Array*/ classStr, /*Boolean?*/ condition) 中 condition == undefined 时为实时反转
	_dom.toggleClass = domClass.toggle;
	var fakeNode = {
		nodeType: 1///_dom.byId 需要检测 nodeType
	};  // for effective replacement
	var className = "className";
	_dom.replaceClass = domClass.replace = function(/*DomNode|String*/ node, /*String|Array*/ addClassStr, /*String|Array?*/ removeClassStr){
		//node = byId(node);
		fakeNode[className] = node[className];
		domClass.remove(fakeNode, removeClassStr);
		domClass.add(fakeNode, addClassStr);
		if(node[className] !== fakeNode[className]){
			node[className] = fakeNode[className];
		}
	};

	var getAttr = _dom.getAttr = domAttr.get;
	var setAttr = _dom.setAttr = domAttr.set;
	_dom.hasAttr = domAttr.has;
	_dom.removeAttr = domAttr.remove;
	_dom.getNodeProp = domAttr.getNodeProp;

	_dom.getProp = domProp.get;
	_dom.setProp = domProp.set;

	/*var getComputedStyle = _dom.getComputedStyle = function(node, always, refreshExtents){
		if(refreshExtents){
			delete node._riasrPadExtents;
			delete node._riasrBorderExtents;
			delete node._riasrPadBorderExtents;
			delete node._riasrMarginExtents;
		}
		if(always){
			clearComputedStyle(node);
		}
		if(!node._riasrComputedStyle){
			var s = node._riasrComputedStyle = domStyle.getComputedStyle(node);
			node.__riasrComputedStyleCache = {
				display: s.display,
				paddingLeft: s.paddingLeft,
				paddingTop: s.paddingTop,
				paddingRight: s.paddingRight,
				paddingBottom: s.paddingBottom,
				borderLeftStyle: s.borderLeftStyle,
				borderTopStyle: s.borderTopStyle,
				borderRightStyle: s.borderRightStyle,
				borderBottomStyle: s.borderBottomStyle,
				borderLeftWidth: s.borderLeftWidth,
				borderTopWidth: s.borderTopWidth,
				borderRightWidth: s.borderRightWidth,
				borderBottomWidth: s.borderBottomWidth,
				marginLeft: s.marginLeft,
				marginTop: s.marginTop,
				marginRight: s.marginRight,
				marginBottom: s.marginBottom,
				overflow: s.overflow,
				overflowX: s.overflowX,
				overflowY: s.overflowY,

				fontSize: s.fontSize
			};
		}
		return node._riasrComputedStyle;
	};*/
	var getComputedStyle = _dom.getComputedStyle = function(node, always, refreshExtents){
		clearComputedStyle(node);
		return domStyle.getComputedStyle(node);
	};
	var clearComputedStyle = _dom.clearComputedStyle = function(node){
		if(node._riasrPadExtents){
			delete node._riasrPadExtents;
		}
		if(node._riasrBorderExtents){
			delete node._riasrBorderExtents;
		}
		if(node._riasrPadBorderExtents){
			delete node._riasrPadBorderExtents;
		}
		if(node._riasrMarginExtents){
			delete node._riasrMarginExtents;
		}
		if(node._riasrOverflow){
			delete node._riasrOverflow;
		}

		if(node._riasrComputedStyle){
			delete node._riasrComputedStyle;
		}
	};
	var toPixelValue = _dom.toPixelValue = domStyle.toPixelValue;///不能计算 height、width，height、width 需要用 setStyle()
	_dom._allStyles = [
		"font", "fontFamily", "fontSize", "fontSizeAdjust", "fontStretch", "fontStyle", "fontVariant", "fontWeight",
		"direction", "letterSpacing", "textDecoration", "unicodeBidi", "wordSpacing", "clip", "color", "cursor",
		"display", "overflow", "visibility", "clipPath", "clipRule", "mask", "opacity",
		"enableBackground", "filter", "floodColor", "floodOpacity", "lightingColor", "stopColor", "stopOpacity",
		"pointerEvents", "colorInterpolation", "colorInterpolationFilters", "colorProfile", "colorRendering",
		"fill", "fillOpacity", "fillRule", "imageRendering", "marker", "markerEnd", "markerMid", "markerStart",
		"shapeRendering", "stroke", "strokeDasharray", "strokeDashoffset", "strokeLinecap", "strokeLinejoin", "strokeMiterlimit", "strokeOpacity", "strokeWidth",
		"textRendering", "alignmentBaseline", "baselineShift", "dominantBaseline", "glyphOrientationHorizontal", "glyphOrientationVertical", "kerning",
		"textAnchor", "writingMode"
	];
	_dom._allRootStyles = [
		"border", "verticalAlign", "backgroundColor", "top", "right", "bottom", "left", "position", "width", "height",
		"margin", "marginTop", "marginBottom", "marginRight", "marginLeft",
		"padding", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight",
		"borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "borderTopStyle", "borderRightStyle", "borderBottomStyle", "borderLeftStyle",
		"zIndex", "overflowX", "overflowY", "float", "clear"
	];
	_dom.styleFromString = function(str){
		if(!rias.isString(str)){
			return {};
		}
		var ss;
		if(str.indexOf(";") === -1){
			ss = [str];
		}else{
			ss = str.split(/\s*;\s*/);
			if(!ss[ss.length - 1]){
				ss = ss.slice(0, ss.length - 1);
			}
		}
		var obj = {};
		for(var i = 0; i < ss.length; i++) {
			var s = ss[i];
			var kv = s.split(":");
			if(kv.length === 2){
				var n = kv[0];
				var v = kv[1];
				n = n.replace(/^\s+/, "");
				v = v.replace(/^\s+/, "");
				obj[n] = v;
			}
		}
		return obj;
	};
	_dom.styleToString = function(obj) {
		if(rias.isString(obj)){
			return obj;
		}
		var str = "", pn;
		for(pn in obj){
			str += pn + ":" + (obj[pn] === "" ? "\"\"" : obj[pn]) + ";";
		}
		return str;
	};
	_dom.styleToObject = function(value){
		if(rias.isString(value)){
			return _dom.styleFromString(value);
		}else if(rias.isObjectSimple(value)){
			return value;
		}
		return {};
	};
	_dom.hasTop = function(style, region, excludePercent){
		return (style.top && style.top !== "auto" && (!excludePercent || style.top.indexOf("%") < 0)) ||
			region && (region === "top" || region === "bottom" || region === "center");
	};
	_dom.hasLeft = function(style, region, excludePercent){
		return (style.left && style.left !== "auto" && (!excludePercent || style.left.indexOf("%") < 0)) ||
			region && (region === "left" || region === "right" || region === "center");
	};
	_dom.hasHeight = function(style, region, excludePercent){
		return (style.height && style.height !== "auto" && (!excludePercent || style.height.indexOf("%") < 0)) ||
			region && (region === "left" || region === "right" || region === "center");
	};
	_dom.hasWidth = function(style, region, excludePercent){
		return (style.width && style.width !== "auto" && (!excludePercent || style.width.indexOf("%") < 0)) ||
			region && (region === "top" || region === "bottom" || region === "center");
	};
	var _pixelNamesCache = {
		left: true,
		top: true
	};
	var _pixelRegExp = /margin|padding|width|height|max|min|offset/; // |border
	function _toStyleValue(node, type, value){
		//TODO: should we really be doing string case conversion here? Should we cache it? Need to profile!
		type = type.toLowerCase();

		// Adjustments for IE and Edge
		if(value === "auto"){
			if(type === "height"){
				return node.offsetHeight;
			}
			if(type === "width"){
				return node.offsetWidth;
			}
		}
		if(type === "fontweight"){
			switch(value){
				case 700:
					return "bold";
				case 400:
				default:
					return "normal";
			}
		}

		if(!(type in _pixelNamesCache)){
			_pixelNamesCache[type] = _pixelRegExp.test(type);
		}
		return _pixelNamesCache[type] ? toPixelValue(node, value) : value;
	}
	var _floatAliases = {
		cssFloat: 1,
		styleFloat: 1,
		"float": 1
	};
	var astr = "DXImageTransform.Microsoft.Alpha";
	var af = function(n, f){
		try{
			return n.filters.item(astr);
		}catch(e){
			return f ? {} : null;
		}
	};
	var _getOpacity =
		has("ie") < 9 || (has("ie") < 10 && has("quirks")) ? function(node){
			try{
				return af(node).Opacity / 100; // Number
			}catch(e){
				return 1; // Number
			}
		} : function(node){
			return getComputedStyle(node).opacity;
		};
	var _setOpacity = has("ie") < 9 || (has("ie") < 10 && has("quirks")) ? function(/*DomNode*/ node, /*Number*/ opacity){
		if(opacity === ""){ opacity = 1; }
		var ov = opacity * 100,
			fullyOpaque = opacity === 1;

		// on IE7 Alpha(Filter opacity=100) makes text look fuzzy so disable it altogether (bug #2661),
		// but still update the opacity value so we can get a correct reading if it is read later:
		// af(node, 1).Enabled = !fullyOpaque;

		if(fullyOpaque){
			node.style.zoom = "";
			if(af(node)){
				node.style.filter = node.style.filter.replace(
					new RegExp("\\s*progid:" + astr + "\\([^\\)]+?\\)", "i"), "");
			}
		}else{
			node.style.zoom = 1;
			if(af(node)){
				af(node, 1).Opacity = ov;
			}else{
				node.style.filter += " progid:" + astr + "(Opacity=" + ov + ")";
			}
			af(node, 1).Enabled = true;
		}

		if(node.tagName.toLowerCase() === "tr"){
			for(var td = node.firstChild; td; td = td.nextSibling){
				if(td.tagName.toLowerCase() === "td"){
					_setOpacity(td, opacity);
				}
			}
		}
		return opacity;
	} : function(node, opacity){
		return (node.style.opacity = opacity);
	};
	var getStyle = _dom.getStyle = domStyle.get = function(/*DOMNode|String*/ node, /*String?*/ name){
		//node = byId(node);
		if(arguments.length === 2 && (name === "opacity")){
			return _getOpacity(node);
		}
		name = _floatAliases[name] ? "cssFloat" in node.style ? "cssFloat" : "styleFloat" : name;
		var s = getComputedStyle(node);
		return (arguments.length === 1) ? s : _toStyleValue(node, name, s[name] || node.style[name]); /* CSS2Properties||String||Number */
	};
	var setStyle = _dom.setStyle = domStyle.set = function(/*DOMNode|String*/ node, /*String|Object*/ name, /*String?*/ value){
		//node = byId(node);
		if(arguments.length === 3){
			name = _floatAliases[name] ? "cssFloat" in node.style ? "cssFloat" : "styleFloat" : name;
			if(has("ie") < 9 && name.indexOf("-") > 0){
				var i, l,
					a = name.split("-");
				//console.warn("The setStyle need the Camel-Case name - " + name);
				for(i = 1, l = a.length; i < l; i++){
					a[i] = rias.upperCaseFirst(a[i]);
				}
				name = a.join("");
			}
			return (name === "opacity") ? _setOpacity(node, value) : (node.style[name] = value); //需要允许 value === ""
		}
		for(var x in name){
			setStyle(node, x, name[x]);
		}
		//return style.getComputedStyle(node);///优化速度
	};

	/// 一般地，Box 表示 top、left、width 和 height，Size表示 width 和 height，Margin 表示外框，
	/// client 包含了 padding，不包含 maring 和 border，不包含 滚动条
	/// offset 包含 margin
	var nilExtents = {
		l: 0,
		t: 0,
		w: 0,
		h: 0
	};
	function isButtonTag(/*DomNode*/ node, tagName){
		tagName = tagName || node.tagName.toLowerCase();
		return tagName === "button" || tagName === "input" && (node.getAttribute("type") || "").toLowerCase() === "button"; // boolean
	}
	var boxModel = _dom.boxModel = domGeom.boxModel;
	var usesBorderBox = _dom.usesBorderBox = function(/*DomNode*/ node){
		var t = node.tagName.toLowerCase();
		return boxModel === "border-box" || getStyle(node, "box-sizing") === "border-box" || t === "table" || isButtonTag(node, t); // boolean
	};
	var floorBox = _dom.floorBox = function(box){
		for(var n in box){
			box[n] = Math.floor(box[n]);
		}
		return box;
	};
	_dom.ceilBox = function(box){
		for(var n in box){
			box[n] = Math.ceil(box[n]);
		}
		return box;
	};
	function setBox(node, box, /*String?*/ unit){
		unit = unit || "px";
		var s = node.style;
		if(!isNaN(box.l)){
			if(s.left !== box.l + unit){
				s.left = box.l + unit;
			}
		}
		if(!isNaN(box.t)){
			if(s.top !== box.t + unit){
				s.top = box.t + unit;
			}
		}
		if(box.w >= 0){
			if(s.width !== box.w + unit){
				s.width = box.w + unit;
			}
		}
		if(box.h >= 0){
			if(s.height !== box.h + unit){
				s.height = box.h + unit;
			}
		}
		return box;
	}
	_dom.isEmptyBox = function(box){
		return !box || isNaN(box.t) && isNaN(box.l) && isNaN(box.h) && isNaN(box.w);
	};
	_dom.boxEqual = function(src, des, diff){
		if(!(diff >= 1)){
			diff = 1;
		}
		return Math.abs(src.t - des.t) < diff &&
			Math.abs(src.l - des.l) < diff &&
			Math.abs(src.w - des.w) < diff &&
			Math.abs(src.h - des.h) < diff;
	};
	_dom.sizeEqual = function(src, des, diff){
		if(!(diff >= 1)){
			diff = 1;
		}
		return Math.abs(src.w - des.w) < diff &&
			Math.abs(src.h - des.h) < diff;
	};
	var getPadExtents = _dom.getPadExtents = domGeom.getPadExtents = function(/*DomNode*/ node, /*Object*/ computedStyle){
		// summary:
		//		Returns object with special values specifically useful for node
		//		fitting.
		// description:
		//		Returns an object with `w`, `h`, `l`, `t` properties:
		//	|		l/t/r/b = left/top/right/bottom padding (respectively)
		//	|		w = the total of the left and right padding
		//	|		h = the total of the top and bottom padding
		//		If 'node' has position, l/t forms the origin for child nodes.
		//		The w/h are used for calculating boxes.
		//		Normally application code will not need to invoke this
		//		directly, and will use the ...box... functions instead.
		// node: DOMNode
		// computedStyle: Object?
		//		This parameter accepts computed styles object.
		//		If this parameter is omitted, the functions will call
		//		dojo/dom-style.getComputedStyle to get one. It is a better way, calling
		//		dojo/dom-style.getComputedStyle once, and then pass the reference to this
		//		computedStyle parameter. Wherever possible, reuse the returned
		//		object of dojo/dom-style.getComputedStyle().

		//node = byId(node);
		if(!node._riasrPadExtents){
			var s = computedStyle || getComputedStyle(node),
			//px = toPixelValue,
				l = toPixelValue(node, s.paddingLeft),
				t = toPixelValue(node, s.paddingTop),
				r = toPixelValue(node, s.paddingRight),
				b = toPixelValue(node, s.paddingBottom);
			node._riasrPadExtents = {
				l: l,
				t: t,
				r: r,
				b: b,
				w: l + r,
				h: t + b
			};
		}
		return node._riasrPadExtents;
	};
	var getBorderExtents = _dom.getBorderExtents = domGeom.getBorderExtents = function(/*DomNode*/ node, /*Object*/ computedStyle){
		// summary:
		//		returns an object with properties useful for noting the border
		//		dimensions.
		// description:
		//		- l/t/r/b = the sum of left/top/right/bottom border (respectively)
		//		- w = the sum of the left and right border
		//		- h = the sum of the top and bottom border
		//
		//		The w/h are used for calculating boxes.
		//		Normally application code will not need to invoke this
		//		directly, and will use the ...box... functions instead.
		// node: DOMNode
		// computedStyle: Object?
		//		This parameter accepts computed styles object.
		//		If this parameter is omitted, the functions will call
		//		dojo/dom-style.getComputedStyle to get one. It is a better way, calling
		//		dojo/dom-style.getComputedStyle once, and then pass the reference to this
		//		computedStyle parameter. Wherever possible, reuse the returned
		//		object of dojo/dom-style.getComputedStyle().

		//node = byId(node);
		if(!node._riasrBorderExtents){
			var s = computedStyle || getComputedStyle(node),
				//px = toPixelValue,
				l = s.borderLeftStyle !== "none" ? toPixelValue(node, s.borderLeftWidth) : 0,
				t = s.borderTopStyle !== "none" ? toPixelValue(node, s.borderTopWidth) : 0,
				r = s.borderRightStyle !== "none" ? toPixelValue(node, s.borderRightWidth) : 0,
				b = s.borderBottomStyle !== "none" ? toPixelValue(node, s.borderBottomWidth) : 0;
			node._riasrBorderExtents = {
				l: l,
				t: t,
				r: r,
				b: b,
				w: l + r,
				h: t + b
			};
		}
		return node._riasrBorderExtents;
	};
	var getPadBorderExtents = _dom.getPadBorderExtents = domGeom.getPadBorderExtents = function(/*DomNode*/ node, /*Object*/ computedStyle){
		// summary:
		//		Returns object with properties useful for box fitting with
		//		regards to padding.
		// description:
		//		- l/t/r/b = the sum of left/top/right/bottom padding and left/top/right/bottom border (respectively)
		//		- w = the sum of the left and right padding and border
		//		- h = the sum of the top and bottom padding and border
		//
		//		The w/h are used for calculating boxes.
		//		Normally application code will not need to invoke this
		//		directly, and will use the ...box... functions instead.
		// node: DOMNode
		// computedStyle: Object?
		//		This parameter accepts computed styles object.
		//		If this parameter is omitted, the functions will call
		//		dojo/dom-style.getComputedStyle to get one. It is a better way, calling
		//		dojo/dom-style.getComputedStyle once, and then pass the reference to this
		//		computedStyle parameter. Wherever possible, reuse the returned
		//		object of dojo/dom-style.getComputedStyle().

		//node = byId(node);
		if(!node._riasrPadBorderExtents){
			var s = computedStyle || getComputedStyle(node),
				p = getPadExtents(node, s),
				b = getBorderExtents(node, s);
			node._riasrPadBorderExtents = {
				l: p.l + b.l,
				t: p.t + b.t,
				r: p.r + b.r,
				b: p.b + b.b,
				w: p.w + b.w,
				h: p.h + b.h
			};
		}
		return node._riasrPadBorderExtents;
	};
	var getMarginExtents = _dom.getMarginExtents = domGeom.getMarginExtents = function(node, computedStyle){
		// summary:
		//		returns object with properties useful for box fitting with
		//		regards to box margins (i.e., the outer-box).
		//
		//		- l/t = marginLeft, marginTop, respectively
		//		- w = total width, margin inclusive
		//		- h = total height, margin inclusive
		//
		//		The w/h are used for calculating boxes.
		//		Normally application code will not need to invoke this
		//		directly, and will use the ...box... functions instead.
		// node: DOMNode
		// computedStyle: Object?
		//		This parameter accepts computed styles object.
		//		If this parameter is omitted, the functions will call
		//		dojo/dom-style.getComputedStyle to get one. It is a better way, calling
		//		dojo/dom-style.getComputedStyle once, and then pass the reference to this
		//		computedStyle parameter. Wherever possible, reuse the returned
		//		object of dojo/dom-style.getComputedStyle().

		//node = byId(node);
		if(!node._riasrMarginExtents){
			var s = computedStyle || getComputedStyle(node),
				//px = toPixelValue,
				l = toPixelValue(node, s.marginLeft),
				t = toPixelValue(node, s.marginTop),
				r = toPixelValue(node, s.marginRight),
				b = toPixelValue(node, s.marginBottom);
			node._riasrMarginExtents = {
				l: l,
				t: t,
				r: r,
				b: b,
				w: l + r,
				h: t + b
			};
		}
		return node._riasrMarginExtents;
	};
	_dom.getBoxExtents = function(/*DomNode*/ node, /*Object*/ computedStyle){
		//node = byId(node);
		var s = computedStyle || getComputedStyle(node),
			pb = usesBorderBox(node) ? nilExtents : getPadBorderExtents(node, s),
			mb = getMarginExtents(node, s);
		if(has("webkit")){
			// on Safari (3.1.2), button nodes with no explicit size have a default margin
			// setting an explicit size eliminates the margin.
			// We have to swizzle the width to get correct margin reading.
			if(isButtonTag(node)){
				var ns = node.style;
				if(!ns.width){
					ns.width = "4px";
				}
				if(!ns.height){
					ns.height = "4px";
				}
			}
		}
		return {
			t: pb.t + mb.t,
			l: pb.l + mb.l,
			w: pb.w + mb.w,
			h: pb.h + mb.h
		};
	};
	_dom.getMarginSize = domGeom.getMarginSize = function(/*DomNode*/ node, /*Object*/ computedStyle){
		// summary:
		//		returns an object that encodes the width and height of
		//		the node's margin box
		// node: DOMNode|String
		// computedStyle: Object?
		//		This parameter accepts computed styles object.
		//		If this parameter is omitted, the functions will call
		//		dojo/dom-style.getComputedStyle to get one. It is a better way, calling
		//		dojo/dom-style.getComputedStyle once, and then pass the reference to this
		//		computedStyle parameter. Wherever possible, reuse the returned
		//		object of dojo/dom-style.getComputedStyle().

		//node = byId(node);
		var me = getMarginExtents(node, computedStyle || getComputedStyle(node));
		var size = node.getBoundingClientRect();
		return {
			w: (size.right - size.left) + me.w,
			h: (size.bottom - size.top) + me.h
		};
	};
	/// getMarginBox 取自身容器的大小，包括 padding 和 marging
	var getMarginBox = _dom.getMarginBox = domGeom.getMarginBox = function(/*DomNode*/ node, /*Object*/ computedStyle){
		// summary:
		//		returns an object that encodes the width, height, left and top
		//		positions of the node's margin box.
		// node: DOMNode
		// computedStyle: Object?
		//		This parameter accepts computed styles object.
		//		If this parameter is omitted, the functions will call
		//		dojo/dom-style.getComputedStyle to get one. It is a better way, calling
		//		dojo/dom-style.getComputedStyle once, and then pass the reference to this
		//		computedStyle parameter. Wherever possible, reuse the returned
		//		object of dojo/dom-style.getComputedStyle().

		//node = byId(node);
		var s = computedStyle || getComputedStyle(node),
			me = getMarginExtents(node, s),
			l = node.offsetLeft - me.l,
			t = node.offsetTop - me.t,
			pcs;

		if((has("ie") === 8 && !has("quirks"))){
			// IE 8 offsetLeft/Top includes the parent's border
			if(node.parentNode){
				pcs = getComputedStyle(node.parentNode);
				l -= pcs.borderLeftStyle !== "none" ? toPixelValue(node, pcs.borderLeftWidth) : 0;
				t -= pcs.borderTopStyle !== "none" ? toPixelValue(node, pcs.borderTopWidth) : 0;
			}
		}
		return {
			l: l,
			t: t,
			w: node.offsetWidth + me.w + (s.width.indexOf(".") >= 0 ? 1 : 0),
			h: node.offsetHeight + me.h + (s.height.indexOf(".") >= 0 ? 1 : 0)
		};
	};
	var setMarginBox = _dom.setMarginBox = domGeom.setMarginBox = function(node, box, computedStyle) {
		if(!box || _dom.isEmptyBox(box)){
			return box;
		}
		//node = byId(node);
		var s = computedStyle || getComputedStyle(node),
			w = box.w,
			h = box.h,
			pb = usesBorderBox(node) ? nilExtents : getPadBorderExtents(node, s),
			mb = getMarginExtents(node, s);
		if (has("webkit")) {
			if (isButtonTag(node)) {
				var ns = node.style;
				if (w >= 0 && !ns.width) {
					ns.width = "4px";
				}
				if (h >= 0 && !ns.height) {
					ns.height = "4px";
				}
			}
		}
		if (w >= 0) {
			w = Math.max(w - pb.w - mb.w, 0);
		}
		if (h >= 0) {
			h = Math.max(h - pb.h - mb.h, 0);
		}
		return setBox(node, floorBox({
			l: box.l,
			t: box.t,
			w: w,
			h: h
		}));
	};
	_dom.setMarginSize = function(node, box, computedStyle) {
		if(!box || !(box.t || box.l || box.w || box.h)){
			return box;
		}
		//node = byId(node);
		var s = computedStyle || getComputedStyle(node),
			w = box.w,
			h = box.h,
			pb = usesBorderBox(node) ? nilExtents : getPadBorderExtents(node, s),
			mb = getMarginExtents(node, s);
		if (has("webkit")) {
			if (isButtonTag(node)) {
				var ns = node.style;
				if (w >= 0 && !ns.width) {
					ns.width = "4px";
				}
				if (h >= 0 && !ns.height) {
					ns.height = "4px";
				}
			}
		}
		if (w >= 0) {
			w = Math.max(w - pb.w - mb.w, 0);
		}
		if (h >= 0) {
			h = Math.max(h - pb.h - mb.h, 0);
		}
		return setBox(node, floorBox({
			//l: box.l,
			//t: box.t,
			w: w,
			h: h
		}));
	};
	/// getContentBox 取内容容器的大小，去掉 padding 和 marging，如果有 clientWidth 则保留 borderWidth
	var getContentBox = _dom.getContentBox = domGeom.getContentBox = function(node, computedStyle){
		// summary:
		//		Returns an object that encodes the width, height, left and top
		//		positions of the node's content box, irrespective of the
		//		current box model.
		// node: DOMNode
		// computedStyle: Object?
		//		This parameter accepts computed styles object.
		//		If this parameter is omitted, the functions will call
		//		dojo/dom-style.getComputedStyle to get one. It is a better way, calling
		//		dojo/dom-style.getComputedStyle once, and then pass the reference to this
		//		computedStyle parameter. Wherever possible, reuse the returned
		//		object of dojo/dom-style.getComputedStyle().

		// clientWidth/Height are important since the automatically account for scrollbars
		// fallback to offsetWidth/Height for special cases (see #3378)
		//node = byId(node);
		var s = computedStyle || getComputedStyle(node),
			w = node.clientWidth, h,
			pe = getPadExtents(node, s),
			be = getBorderExtents(node, s),
			//l = node.offsetLeft + pe.l,
			//t = node.offsetTop + pe.t,
			l = pe.l,///content 不包含 border
			t = pe.t;///content 不包含 border
		/// 暂时不考虑小数
		if(!w){
			w = node.offsetWidth - be.w;
			h = node.offsetHeight - be.h;
		}else{
			h = node.clientHeight;
		}
		if((has("ie") === 8 && !has("quirks"))){
			// IE 8 offsetLeft/Top includes the parent's border
			var pcs;
			if(node.parentNode){
				pcs = getComputedStyle(node.parentNode);
				l -= pcs.borderLeftStyle !== "none" ? toPixelValue(node, pcs.borderLeftWidth) : 0;
				t -= pcs.borderTopStyle !== "none" ? toPixelValue(node, pcs.borderTopWidth) : 0;
			}
		}
		return {
			l: l,
			t: t,
			w: w - pe.w,///content 不包含 border
			h: h - pe.h,///content 不包含 border
			sl: node.scrollLeft,
			st: node.scrollTop,
			sw: node.scrollWidth,
			sh: node.scrollHeight
		};
	};
	_dom.marginBox2contentBox = function(/*DomNode*/ node, /*Object*/ mb, /*Object*/ computedStyle){
		// summary:
		//		Given the margin-box size of a node, return its content box size.
		//		Functions like domGeometry.contentBox() but is more reliable since it doesn't have
		//		to wait for the browser to compute sizes.
		var s = computedStyle || getComputedStyle(node),
			me = getMarginExtents(node, s),
			pe = getPadExtents(node, s),
			be = getBorderExtents(node, s),
			l = pe.l,///content 不包含 border
			t = pe.t;///content 不包含 border
		if((has("ie") === 8 && !has("quirks"))){
			// IE 8 offsetLeft/Top includes the parent's border
			var pcs;
			if(node.parentNode){
				pcs = getComputedStyle(node.parentNode);
				l -= pcs.borderLeftStyle !== "none" ? toPixelValue(node, pcs.borderLeftWidth) : 0;
				t -= pcs.borderTopStyle !== "none" ? toPixelValue(node, pcs.borderTopWidth) : 0;
			}
		}
		return {
			l: mb.l + l,
			t: mb.t + t,
			w: mb.w - me.w - pe.w - be.w,
			h: mb.h - me.h - pe.h - be.h,
			sl: node.scrollLeft,
			st: node.scrollTop,
			sw: node.scrollWidth,
			sh: node.scrollHeight
		};
	};
	_dom.contentBox2marginBox = function(/*DomNode*/ node, /*Object*/ cb, /*Object*/ computedStyle){
		// summary:
		//		Given the margin-box size of a node, return its content box size.
		//		Functions like domGeometry.contentBox() but is more reliable since it doesn't have
		//		to wait for the browser to compute sizes.
		var s = computedStyle || getComputedStyle(node),
			pe = getPadExtents(node, s),
			be = getBorderExtents(node, s),
			mb = getMarginExtents(node, s),
			l = pe.l,
			t = pe.t;
		if((has("ie") === 8 && !has("quirks"))){
			// IE 8 offsetLeft/Top includes the parent's border
			var pcs;
			if(node.parentNode){
				pcs = getComputedStyle(node.parentNode);
				l += pcs.borderLeftStyle !== "none" ? toPixelValue(node, pcs.borderLeftWidth) : 0;
				t += pcs.borderTopStyle !== "none" ? toPixelValue(node, pcs.borderTopWidth) : 0;
			}
		}
		return {
			l: cb.l - l,
			t: cb.t - t,
			w: cb.w + mb.w + pe.w + be.w,
			h: cb.h + mb.h + pe.h + be.h,
			sl: node.scrollLeft,
			st: node.scrollTop,
			sw: node.scrollWidth,
			sh: node.scrollHeight
		};
	};
	_dom.setContentSize = domGeom.setContentSize = function(node, box, computedStyle) {
		//node = byId(node);
		var w = box.w,
			h = box.h;
		if (usesBorderBox(node)) {
			var pb = getPadBorderExtents(node, computedStyle);
			if (w >= 0) {
				w += pb.w;
			}
			if (h >= 0) {
				h += pb.h;
			}
		}
		return setBox(node, floorBox({
			//t: undefined,
			//l: undefined,
			w: w,
			h: h
		}));
	};
	_dom.getBoxOfStyle = function(box, style){
		///暂时不考虑 style 的 right、bottom
		return box ? {
			//t: box.t,
			//l: box.l,
			t: style.top ? box.t : undefined,
			l: style.left ? box.l : undefined,
			w: style.width ? box.w : undefined,
			h: style.height ? box.h : undefined
		} : {};
	};
	_dom.style2box = function(node, style){
		///暂时不考虑 style 的 right、bottom
		return {
			t: style.top ? toPixelValue(node, style.top) : undefined,
			l: style.left ? toPixelValue(node, style.left) : undefined,
			w: style.width ? toPixelValue(node, style.width) : undefined,
			h: style.height ? toPixelValue(node, style.height) : undefined
		};
	};
	_dom.box2marginBox = function(node, box, computedStyle) {
		//node = byId(node);
		var s = computedStyle || getComputedStyle(node),
			me = getMarginExtents(node, s),
			l = box.l,
			t = box.t,
			p = node.parentNode,
			pcs;
		if(!isNaN(l) || !isNaN(t)){
			if (has("ie") === 8 && !has("quirks")) {
				if (p) {
					pcs = getComputedStyle(p);
					if(!isNaN(l)){
						l -= pcs.borderLeftStyle !== "none" ? toPixelValue(node, pcs.borderLeftWidth) : 0;
					}
					if(!isNaN(t)){
						t -= pcs.borderTopStyle !== "none" ? toPixelValue(node, pcs.borderTopWidth) : 0;
					}
				}
			}
		}
		return {
			l: l,
			t: t,
			w: box.w + me.w,
			h: box.h + me.h
		};
	};
	_dom.marginBox2box = function(node, box, computedStyle) {
		//node = byId(node);
		var s = computedStyle || getComputedStyle(node),
			w = box.w,
			h = box.h,
			pb = usesBorderBox(node) ? nilExtents : getPadBorderExtents(node, s),
			mb = getMarginExtents(node, s);
		if (has("webkit")) {
			if (isButtonTag(node)) {
				var ns = node.style;
				if (w >= 0 && !ns.width) {
					ns.width = "4px";
				}
				if (h >= 0 && !ns.height) {
					ns.height = "4px";
				}
			}
		}
		if (w >= 0) {
			//w = Math.max(w - pb.w - mb.w, 0);
			w = w - pb.w - mb.w;
			if(w < 0){
				w = 0;
			}
		}
		if (h >= 0) {
			//h = Math.max(h - pb.h - mb.h, 0);
			h = h - pb.h - mb.h;
			if(h < 0){
				h = 0;
			}
		}
		return {
			l: box.l,
			t: box.t,
			w: w,
			h: h
		};
	};

	var Viewport = _dom.Viewport = new rias.Evented();
	///FIXME:zensst. 需要合并到 Desktop
	///TODO:zensst. 需要合并到 Desktop
	Viewport.getEffectiveBox = function(/*Document*/ doc){
		// summary:
		//		Get the size of the viewport, or on mobile devices, the part of the viewport not obscured by the
		//		virtual keyboard.
		var box = _dom.getWindowBox(doc);
		// Account for iOS virtual keyboard, if it's being shown.  Unfortunately no direct way to check or measure.
		var fn = focus.get("currNode"),
			tag = fn && fn.tagName && fn.tagName.toLowerCase();
		if(has("ios") && fn && !fn.readOnly
			&& (tag === "textarea" || (tag === "input" && /^(color|email|number|password|search|tel|text|url)$/.test(fn.type)))){

			// Box represents the size of the viewport.  Some of the viewport is likely covered by the keyboard.
			// Estimate height of visible viewport assuming viewport goes to bottom of screen, but is covered by keyboard.
			box.h *= (orientation === 0 || orientation === 180 ? 0.66 : 0.40);

			// Above measurement will be inaccurate if viewport was scrolled up so far that it ends before the bottom
			// of the screen.   In this case, keyboard isn't covering as much of the viewport as we thought.
			// We know the visible size is at least the distance from the top of the viewport to the focused node.
			var rect = fn.getBoundingClientRect();
			box.h = Math.max(box.h, rect.top + rect.height);
		}

		return box;
	};
	_dom.getEffectiveBox = Viewport.getEffectiveBox;
	rias.ready(function(){
		///FIXME:zensst. 需要合并到 Desktop
		///TODO:zensst. 需要合并到 Desktop
		if(has("highcontrast")){
			domClass.add(_dom.body(), "dijit_a11y");
		}

		var oldBox = _dom.getWindowBox();
		Viewport._rlh = on(window, "resize", function(){
			var newBox = _dom.getWindowBox();
			if(oldBox.h === newBox.h && oldBox.w === newBox.w){
				return;
			}
			oldBox = newBox;
			Viewport.emit("resize");
		});

		// Also catch zoom changes on IE8, since they don't naturally generate resize events
		if(has("ie") === 8){
			var deviceXDPI = screen.deviceXDPI;
			Viewport._ie8ScreenSizeHandle = setInterval(function(){
				if(screen.deviceXDPI !== deviceXDPI){
					deviceXDPI = screen.deviceXDPI;
					Viewport.emit("resize");
				}
			}, 500);
		}

		// On iOS, keep track of the focused node so we can guess when the keyboard is/isn't being displayed.
		if(has("ios")){
			_dom._iosFocusinHandle = on(document, "focusin", function(evt){
				focus.set("currNode", evt.target);
			});
			_dom._iosFocusoutHandle = on(document, "focusout", function(evt){
				focus.set("currNode", null);
			});
		}
	});

	var getOverflow = _dom.getOverflow = function(node, computedStyle){
		//if(!node._riasrOverflow){
			var s = computedStyle || getComputedStyle(node);
			node._riasrOverflow = {
				both: s.overflow,
				x: s.overflowX,
				y: s.overflowY
			};
		//}
		return node._riasrOverflow;
	};
	_dom.noOverflowCall = function(node, callback, scope){
		var vf = getOverflow(node);
		if(vf.x !== "hidden" || vf.x !== "hidden"){
			setStyle(node, "overflow", "hidden");
		}

		if(rias.isFunction(callback)){
			callback.apply(scope, []);
		}

		if(vf.x !== "hidden"){
			setStyle(node, "overflowX", vf.x);
		}
		if(vf.y !== "hidden"){
			setStyle(node, "overflowY", vf.y);
		}
		//if(vf.both !== "hidden"){/// ie 需要
		//	setStyle(node, "overflow", vf.both);
		//}
	};
	_dom.restrictBox = function(node, box){
		if(!box || box.disabled){
			return;
		}
		var s = node.style;
		box = {
			top: box.top,
			left: box.left,
			bottom: box.bottom,
			right: box.right
		};
		if(box.left && box.right){
			if(s.width){
				box.width = "";
			}
		}else if(box.right){
			box.left = "";
		}else if(box.left){
			box.right = "";
		}else if(s.width){
			box.right = "";
		}
		if(box.top && box.bottom){
			if(s.height){
				box.height = "";
			}
		}else if(box.bottom){
			box.top = "";
		}else if(box.top){
			box.bottom = "";
		}else if(s.height){
			box.bottom = "";
		}
		rias.compact(box);///兼容 ie8，去掉 undefined
		setStyle(node, box);
	};
	_dom.defaultRestrict = rias.theme ? rias.theme.scrollbarWidth + 1 : 18;
	var restrict = _dom.restrict = function(node, box, parentNode, restrictPadding){
		var dns,
			p, pn;
		if(!node){
			return box;
		}
		if(!box){
			box = getMarginBox(node);
		}
		if(!(restrictPadding >= 0)){
			return box;
		}
		if(!parentNode){
			parentNode = node.parentNode;
		}
		pn = parentNode || node.ownerDocumentBody || desktopBody;
		p = getContentBox(pn);
		dns = node.style;
		///FIXME:zensst. box 是 marginBox ，需要转换为 style
		//noOverflowCall(pn, function(){
			///先判断 height，然后才能判断 top。
			if(box.h > p.h - restrictPadding - restrictPadding){
				box.h = p.h - restrictPadding - restrictPadding;
				if(box.h < 0){///ie 不能 < 0
					box.h = 0;
				}
				if(dns){
					dns.height = box.h + "px";
				}
			}
			if(box.t < p.st + restrictPadding){
				box.t = p.st + restrictPadding;
				if(box.t < 0){///ie 不能 < 0
					box.t = 0;
				}
				if(dns){
					dns.top = box.t + "px";
				}
			}
			if(box.t + box.h > p.h + p.st - restrictPadding){
				box.t = p.h + p.st - box.h - restrictPadding;
				if(box.t < 0){///ie 不能 < 0
					box.t = 0;
				}
				if(dns){
					dns.top = box.t + "px";
				}
			}
			if(box.w > p.w - restrictPadding - restrictPadding){
				box.w = p.w - restrictPadding - restrictPadding;
				if(box.w < 0){///ie 不能 < 0
					box.w = 0;
				}
				if(dns){
					dns.width = box.w + "px";
				}
			}
			if(box.l < p.sl + restrictPadding){
				box.l = p.sl + restrictPadding;
				if(box.l < 0){///ie 不能 < 0
					box.l = 0;
				}
				if(dns){
					dns.left = box.l + "px";
				}
			}
			if(box.l + box.w > p.w + p.sl - restrictPadding){
				box.l = p.w + p.sl - box.w - restrictPadding;
				if(box.l < 0){///ie 不能 < 0
					box.l = 0;
				}
				if(dns){
					dns.left = box.l + "px";
				}
			}
		//});
		return box;
	};
	var domPosition = _dom.getPosition = domGeom.position = function(/*DomNode*/ node, /*Boolean?*/ includeScroll){
		// summary:
		//		Gets the position and size of the passed element relative to
		//		the viewport (if includeScroll==false), or relative to the
		//		document root (if includeScroll==true).
		//
		// description:
		//		Returns an object of the form:
		//		`{ x: 100, y: 300, w: 20, h: 15 }`.
		//		If includeScroll==true, the x and y values will include any
		//		document offsets that may affect the position relative to the
		//		viewport.
		//		Uses the border-box model (inclusive of border and padding but
		//		not margin).  Does not act as a setter.
		// node: DOMNode|String
		// includeScroll: Boolean?
		// returns: Object

		//node = byId(node);
		var	db = winBody(node.ownerDocument),
			ret = node.getBoundingClientRect();
		ret = {
			x: ret.left,
			y: ret.top,
			w: ret.right - ret.left,
			h: ret.bottom - ret.top
		};

		if(has("ie") < 9){
			// fixes the position in IE, quirks mode
			ret.x -= (has("quirks") ? db.clientLeft + db.offsetLeft : 0);
			ret.y -= (has("quirks") ? db.clientTop + db.offsetTop : 0);
		}

		// account for document scrolling
		// if offsetParent is used, ret value already includes scroll position
		// so we may have to actually remove that value if !includeScroll
		if(includeScroll){
			var scroll = docScroll(node.ownerDocument);
			ret.x += scroll.x;
			ret.y += scroll.y;
		}

		return ret; // Object
	};
	//rias.coords = dojo.coords; /// = domGeom.position?
	var isBodyLtr = _dom.isBodyLtr = domGeom.isBodyLtr = function isBodyLtr(/*Document?*/ doc){
		// summary:
		//		Returns true if the current language is left-to-right, and false otherwise.
		// doc: Document?
		//		Optional document to query.   If unspecified, use rias.doc.
		// returns: Boolean

		doc = doc || winDoc;
		return (winBody(doc) && winBody(doc).dir || doc.documentElement.dir || "ltr").toLowerCase() === "ltr"; // Boolean
	};
	var docScroll = _dom.docScroll = domGeom.docScroll = function(/*Document?*/ doc){
		// summary:
		//		Returns an object with {node, x, y} with corresponding offsets.
		// doc: Document?
		//		Optional document to query.   If unspecified, use rias.doc.
		// returns: Object

		doc = doc || winDoc;
		// use UI window, not rias.global window.
		// TODO: use dojo/window::get() except for circular dependency problem
		var node = winDoc.parentWindow || winDoc.defaultView;
		return "pageXOffset" in node ? {
			x: node.pageXOffset,
			y: node.pageYOffset
		} : (node = has("quirks") ? winBody(doc) : doc.documentElement) && {
			x: fixIeBiDiScrollLeft(node.scrollLeft || 0, doc),
			y: node.scrollTop || 0
		};
	};
	_dom.getIeDocumentElementOffset = domGeom.getIeDocumentElementOffset = function(/*Document?*/ doc){
		// summary:
		//		Deprecated method previously used for IE6-IE7.  Now, just returns `{x:0, y:0}`.
		return {
			x: 0,
			y: 0
		};
	};
	var fixIeBiDiScrollLeft =_dom.fixIeBiDiScrollLeft = domGeom.fixIeBiDiScrollLeft = function(/*Integer*/ scrollLeft, /*Document?*/ doc){
		// summary:
		//		In RTL direction, scrollLeft should be a negative value, but IE
		//		returns a positive one. All codes using documentElement.scrollLeft
		//		must call this function to fix this error, otherwise the position
		//		will offset to right when there is a horizontal scrollbar.
		// scrollLeft: Number
		// doc: Document?
		//		Optional document to query.   If unspecified, use rias.doc.
		// returns: Number

		// In RTL direction, scrollLeft should be a negative value, but IE
		// returns a positive one. All codes using documentElement.scrollLeft
		// must call this function to fix this error, otherwise the position
		// will offset to right when there is a horizontal scrollbar.

		doc = doc || winDoc;
		var ie = has("ie");
		if(ie && !isBodyLtr(doc)){
			var qk = has("quirks"),
				de = qk ? winBody(doc) : doc.documentElement,
				pwin = rias.global;	// TODO: use winUtils.get(doc) after resolving circular dependency b/w dom-geometry.js and dojo/window.js
			if(ie === 6 && !qk && pwin.frameElement && de.scrollHeight > de.clientHeight){
				scrollLeft += de.clientLeft; // workaround ie6+strict+rtl+iframe+vertical-scrollbar bug where clientWidth is too small by clientLeft pixels
			}
			return (ie < 8 || qk) ? (scrollLeft + de.clientWidth - de.scrollWidth) : -scrollLeft; // Integer
		}
		return scrollLeft; // Integer
	};

	_dom.orientCorner = {
		// Real around node
		"MR-ML": "riaswTooltipRight",
		"ML-MR": "riaswTooltipLeft",
		"TM-BM": "riaswTooltipAbove",
		"BM-TM": "riaswTooltipBelow",
		"BL-TL": "riaswTooltipBelow riaswTooltipABLeft",
		"TL-BL": "riaswTooltipAbove riaswTooltipABLeft",
		"BR-TR": "riaswTooltipBelow riaswTooltipABRight",
		"TR-BR": "riaswTooltipAbove riaswTooltipABRight",
		"BR-BL": "riaswTooltipRight",
		"BL-BR": "riaswTooltipLeft",

		// Positioning "around" a point, ex: mouse position
		"BR-TL": "riaswTooltipBelow riaswTooltipABLeft",
		"BL-TR": "riaswTooltipBelow riaswTooltipABRight",
		"TL-BR": "riaswTooltipAbove riaswTooltipABRight",
		"TR-BL": "riaswTooltipAbove riaswTooltipABLeft"
	};
	_dom.tooltipPositions = [
		"below-centered", "below", "below-alt",
		"above-centered", "above", "above-alt",
		"after-centered", "after",
		"before-centered", "before",
		"centered"
	];

	function _riasPlace(/*DomNode*/ node, choices, layoutNode, aroundNodeCoords){
		// summary:
		//		Given a list of spots to put node, put it at the first spot where it fits,
		//		of if it doesn't fit anywhere then the place with the least overflow
		// choices: Array
		//		Array of elements like: {corner: 'TL', pos: {x: 10, y: 20} }
		//		Above example says to put the top-left corner of the node at (10,20)
		// layoutNode: Function(node, aroundNodeCorner, nodeCorner, size)
		//		for things like tooltip, they are displayed differently (and have different dimensions)
		//		based on their orientation relative to the parent.	 This adjusts the popup based on orientation.
		//		It also passes in the available size for the popup, which is useful for tooltips to
		//		tell them that their width is limited to a certain amount.	 layoutNode() may return a value expressing
		//		how much the popup had to be modified to fit into the available space.	 This is used to determine
		//		what the best placement is.
		// aroundNodeCoords: Object
		//		Size of aroundNode, ex: {w: 200, h: 50}

		// get {x: 10, y: 10, w: 100, h:100} type obj representing position of
		// viewport over document
		var view = getContentBox(node.parentNode || winBody(node.ownerDocument));// getEffectiveBox(node.ownerDocument);

		// This won't work if the node is inside a <div style="position: relative">,
		// so reattach it to <body>.	 (Otherwise, the positioning will be wrong
		// and also it might get cutoff.)
		////有 parent 时也执行。注意：有 parent 时先获取正确的 choices
		//if(!node.parentNode || String(node.parentNode.tagName).toLowerCase() != "body"){
		//	_dom.body(node.ownerDocument).appendChild(node);
		//}

		var best = null,
			style, pos, corner, overflow,
			bb, oldDisplay, oldVis;
		var startXpos,
			startYpos,
			startX,
			startY,
			endX,
			endY,
			width,
			height;
		rias.some(choices, function(choice){
			corner = choice.corner;
			pos = choice.pos;
			overflow = 0;

			// calculate amount of space available given specified position of node
			var spaceAvailable = {
				w: {
					'L': view.l + view.w - pos.x,
					'R': pos.x - view.l,
					'M': view.w
				}[corner.charAt(1)],
				h: {
					'T': view.t + view.h - pos.y,
					'B': pos.y - view.t,
					'M': view.h
				}[corner.charAt(0)]
			};

			// Clear left/right position settings set earlier so they don't interfere with calculations,
			// specifically when layoutNode() (a.k.a. Tooltip._getCornerOrient()) measures natural width of Tooltip
			style = node.style;
			style.left = style.right = "auto";

			// configure node to be displayed in given position relative to button
			// (need to do this in order to get an accurate size for the node, because
			// a tooltip's size changes based on position, due to triangle)
			if(layoutNode){
				overflow = layoutNode(node, choice.aroundCorner, corner, spaceAvailable, aroundNodeCoords);
				overflow = typeof overflow === "undefined" ? 0 : overflow;
			}

			// get node's size
			oldDisplay = style.display;
			oldVis = style.visibility;
			if(style.display === "none"){
				style.visibility = "hidden";
				style.display = "";
			}
			bb = domPosition(node);
			style.display = oldDisplay ? oldDisplay : "";
			style.visibility = oldVis;

			// coordinates and size of node with specified corner placed at pos,
			// and clipped by viewport
			startXpos = {
				'L': pos.x,
				'R': pos.x - bb.w,
				'M': Math.max(view.l, Math.min(view.l + view.w, pos.x + (bb.w >> 1)) - bb.w) // M orientation is more flexible
			}[corner.charAt(1)];
			startYpos = {
				'T': pos.y,
				'B': pos.y - bb.h,
				'M': Math.max(view.t, Math.min(view.t + view.h, pos.y + (bb.h >> 1)) - bb.h)
			}[corner.charAt(0)];
			startX = Math.max(view.l, startXpos);
			startY = Math.max(view.t, startYpos);
			endX = Math.min(view.l + view.w, startXpos + bb.w);
			endY = Math.min(view.t + view.h, startYpos + bb.h);
			width = endX - startX;
			height = endY - startY;

			overflow += (bb.w - width) + (bb.h - height);

			if(best == null || overflow < best.overflow){
				best = {
					corner: corner,
					aroundCorner: choice.aroundCorner,
					x: startX,
					y: startY,
					w: width,
					h: height,
					overflow: overflow,
					spaceAvailable: spaceAvailable
				};
			}

			return !overflow;
		});

		// In case the best position is not the last one we checked, need to call
		// layoutNode() again.
		if(best.overflow > 0 && layoutNode){
			layoutNode(node, best.aroundCorner, best.corner, best.spaceAvailable, aroundNodeCoords);
		}

		// And then position the node.  Do this last, after the layoutNode() above
		// has sized the node, due to browser quirks when the viewport is scrolled
		// (specifically that a Tooltip will shrink to fit as though the window was
		// scrolled to the left).

		var top = best.y,
			side = best.x,
			body = winBody(node.ownerDocument);

		if(/relative|absolute/.test(getStyle(body, "position"))){
			// compensate for margin on <body>, see #16148
			top -= getStyle(body, "marginTop");
			side -= getStyle(body, "marginLeft");
		}

		style = node.style;
		style.top = top + "px";
		style.left = side + "px";
		style.right = "auto";	// needed for FF or else tooltip goes to far left
		node = node.__riasrWidget;
		if(node){
			node = node._changeSize;
			if(node){
				//node.t = top;
				//node.l = side;
				delete node.t;
				delete node.l;
			}
		}

		return best;
	}
	_dom.positionAround = function(///place.around
		/*DomNode*/		node,
		/*DomNode|RiasWidget/place.__Rectangle*/ anchor,
		/*String[]*/	positions,
		/*Boolean*/		leftToRight,
		padding,
		/*Function?*/	layoutNode){

		// If around is a DOMNode (or DOMNode id), convert to coordinates.
		var aroundNodePos;
		if(typeof anchor === "string" || "offsetWidth" in anchor || "ownerSVGElement" in anchor){
			/// anchor is DomNode
			aroundNodePos = domPosition(anchor, true);

			// For above and below dropdowns, subtract width of border so that popup and aroundNode borders
			// overlap, preventing a double-border effect.  Unfortunately, difficult to measure the border
			// width of either anchor or popup because in both cases the border may be on an inner node.
			if(/^(above|below)/.test(positions[0])){
				var anchorBorder = getBorderExtents(anchor),
					anchorChildBorder = anchor.firstChild ? getBorderExtents(anchor.firstChild) : {t:0,l:0,b:0,r:0},
					nodeBorder =  getBorderExtents(node),
					nodeChildBorder = node.firstChild ? getBorderExtents(node.firstChild) : {t:0,l:0,b:0,r:0};
				aroundNodePos.y += Math.min(anchorBorder.t + anchorChildBorder.t, nodeBorder.t + nodeChildBorder.t);
				aroundNodePos.h -=  Math.min(anchorBorder.t + anchorChildBorder.t, nodeBorder.t+ nodeChildBorder.t) +
					Math.min(anchorBorder.b + anchorChildBorder.b, nodeBorder.b + nodeChildBorder.b);
			}
		}else{
			/// anchor is pos
			aroundNodePos = anchor;
		}

		// Compute position and size of visible part of anchor (it may be partially hidden by ancestor nodes w/scrollbars)
		if(anchor.parentNode){
			// ignore nodes between position:relative and position:absolute
			var sawPosAbsolute = getComputedStyle(anchor).position === "absolute";
			var parent = anchor.parentNode;
			//while(parent && parent.nodeType == 1 && parent.nodeName != "BODY"){  //ignoring the body will help performance
			///增加 parent != node.parentNode，实现 node 有 parent 时也可以获取正确的 choices.
			while(parent && parent.nodeType === 1 && parent.nodeName !== "BODY"){  //ignoring the body will help performance
				var parentPos = domPosition(parent, true),
					pcs = getComputedStyle(parent);
				if(/relative|absolute/.test(pcs.position)){
					sawPosAbsolute = false;
				}
				if(!sawPosAbsolute && /hidden|auto|scroll/.test(pcs.overflow)){
					var bottomYCoord = Math.min(aroundNodePos.y + aroundNodePos.h, parentPos.y + parentPos.h);
					var rightXCoord = Math.min(aroundNodePos.x + aroundNodePos.w, parentPos.x + parentPos.w);
					aroundNodePos.x = Math.max(aroundNodePos.x, parentPos.x);
					aroundNodePos.y = Math.max(aroundNodePos.y, parentPos.y);
					aroundNodePos.h = bottomYCoord - aroundNodePos.y;
					aroundNodePos.w = rightXCoord - aroundNodePos.x;
				}
				if(pcs.position === "absolute"){
					sawPosAbsolute = true;
				}
				if(parent === node.parentNode){
					aroundNodePos.x = aroundNodePos.x - parentPos.x;
					aroundNodePos.y = aroundNodePos.y - parentPos.y;
					break;
				}
				parent = parent.parentNode;
			}
		}

		var x = aroundNodePos.x - padding,
			y = aroundNodePos.y - padding,
			width = "w" in aroundNodePos ? aroundNodePos.w : (aroundNodePos.w = aroundNodePos.width ? aroundNodePos.width : 0),
			height = "h" in aroundNodePos ? aroundNodePos.h : (aroundNodePos.h = aroundNodePos.height ? aroundNodePos.height : 0);
		width += padding + padding;
		height += padding + padding;

		// Convert positions arguments into choices argument for _riasPlace()
		var choices = [];
		function push(aroundCorner, corner){
			choices.push({
				aroundCorner: aroundCorner,
				corner: corner,
				pos: {
					x: {
						'L': x,
						'R': x + width,
						'M': x + (width >> 1)
					}[aroundCorner.charAt(1)],
					y: {
						'T': y,
						'B': y + height,
						'M': y + (height >> 1)
					}[aroundCorner.charAt(0)]
				}
			});
		}
		rias.forEach(positions, function(pos){
			var ltr =  leftToRight;
			switch(pos){
				case "center":
				case "centered":
					push("MM", "MM");
					break;
				case "above-centered":
					push("TM", "BM");
					break;
				case "below-centered":
					push("BM", "TM");
					break;
				case "after-centered":
					ltr = !ltr;
				// fall through
				case "before-centered":
					push(ltr ? "ML" : "MR", ltr ? "MR" : "ML");
					break;
				case "after":
					ltr = !ltr;
				// fall through
				case "before":
					push(ltr ? "TL" : "TR", ltr ? "TR" : "TL");
					push(ltr ? "BL" : "BR", ltr ? "BR" : "BL");
					break;
				case "below-alt":
					ltr = !ltr;
				// fall through
				case "below":
					// first try to align left borders, next try to align right borders (or reverse for RTL mode)
					push(ltr ? "BL" : "BR", ltr ? "TL" : "TR");
					push(ltr ? "BR" : "BL", ltr ? "TR" : "TL");
					break;
				case "above-alt":
					ltr = !ltr;
				// fall through
				case "above":
					// first try to align left borders, next try to align right borders (or reverse for RTL mode)
					push(ltr ? "TL" : "TR", ltr ? "BL" : "BR");
					push(ltr ? "TR" : "TL", ltr ? "BR" : "BL");
					break;
				default:
					// To assist _riasPlace, accept arguments of type {aroundCorner: "BL", corner: "TL"}.
					// Not meant to be used directly.  Remove for 2.0.
					push(pos.aroundCorner, pos.corner);
			}
		});

		var position = _riasPlace(node, choices, layoutNode, {w: width, h: height});
		position.aroundNodePos = aroundNodePos;

		return position;
	};
	var reverse = {
		// Map from corner to kitty-corner
		"TL": "BR",
		"TR": "BL",
		"BL": "TR",
		"BR": "TL"
	};
	_dom.positionAt = function(node, pos, corners, padding, layoutNode){///place.at
		// summary:
		//		Positions node kitty-corner to the rectangle centered at (pos.x, pos.y) with width and height of
		//		padding.x * 2 and padding.y * 2, or zero if padding not specified.  Picks first corner in corners[]
		//		where node is fully visible, or the corner where it's most visible.
		//
		//		Node is assumed to be absolutely or relatively positioned.
		// node: DOMNode
		//		The node to position
		// pos: rias.dom.placePosition
		//		Object like {x: 10, y: 20}
		// corners: String[]
		//		Array of Strings representing order to try corners of the node in, like ["TR", "BL"].
		//		Possible values are:
		//
		//		- "BL" - bottom left
		//		- "BR" - bottom right
		//		- "TL" - top left
		//		- "TR" - top right
		// padding: rias.dom.placePosition?
		//		Optional param to set padding, to put some buffer around the element you want to position.
		//		Defaults to zero.
		// layoutNode: Function(node, aroundNodeCorner, nodeCorner)
		//		For things like tooltip, they are displayed differently (and have different dimensions)
		//		based on their orientation relative to the parent.  This adjusts the popup based on orientation.
		// example:
		//		Try to place node's top right corner at (10,20).
		//		If that makes node go (partially) off screen, then try placing
		//		bottom left corner at (10,20).
		//	|	place(node, {x: 10, y: 20}, ["TR", "BL"])
		var choices = rias.map(corners, function(corner){
			var c = {
				corner: corner,
				aroundCorner: reverse[corner],	// so _getCornerOrient() gets aroundCorner argument set
				pos: {
					x: pos.x,
					y: pos.y
				}
			};
			if(padding){
				c.pos.x += corner.charAt(1) === 'L' ? padding.x : -padding.x;
				c.pos.y += corner.charAt(0) === 'T' ? padding.y : -padding.y;
			}
			return c;
		});

		return _riasPlace(node, choices, layoutNode);
	};
	function _placeTo(node, parent){
		var w = rias.by(node);
		if(rias.isString(parent)){
			parent = rias.by(parent, w);
		}
		if(w && node === w.domNode || rias.isRiasw(node)){
			if(!w.domNode.__riasrWidget){
				w.domNode.__riasrWidget = w;
			}
			if(parent){
				w.placeAt(parent);
			}else if(!rias.by(w.domNode.parentNode)){
				w.placeAt(rias.desktop || desktopBody);
			}
			/// 不建议 startup
			//if(!w._started && w.startup){
			//	if(!parent || parent._started){
			//		w.startup();
			//	}
			//}
			node = w.domNode;
		}else if(rias.isDomNode(node)){
			if(parent){
				if(rias.isRiasw(parent)){
					domPlace(node, parent.domNode);
				}else if(node.parentNode !== parent && rias.isDomNode(parent)){
					domPlace(node, parent);
				}
			}else if(!rias.by(node.parentNode)){
				domPlace(node);
			}
		}else{
			return undefined;
		}
		return node.parentNode;
	}
	function _doPlace(wrapper, widget, args){
		//args.parent: riasWidget
		//args.around: riasWidget or domNode
		//args.positions: around:["below", "below-alt", "above", "above-alt"] or at:["MM", "TL", "TR"...]
		//args.maxHeight: Number(without "px")
		//args.padding: Number(without "px")
		//args.x: Number(without "px")
		//args.y: Number(without "px")
		var //widget,
			//node,
			padding = args.padding || 0,
			parent = args.parent,
			around = args.around;
		if(!widget || !parent){
			console.debug("The _doPlace need a widget and a parent.", widget, parent);
			return false;
		}
		if(!_dom.isVisible(parent, true) || (rias.isDomNode(around) && !_dom.isVisible(around, true))){
			return false;
		}

		var ltr = parent && parent.isLeftToRight ? parent.isLeftToRight() : isBodyLtr(wrapper.ownerDocument),
			viewport = getContentBox(wrapper.parentNode || winBody(wrapper.ownerDocument));// getEffectiveBox(wrapper.ownerDocument),
		var maxHeight,
			pos = domPosition(wrapper);
		if("maxHeight" in args && args.maxHeight !== -1){
			maxHeight = args.maxHeight || Infinity;	// map 0 --> infinity for back-compat of _HasDropDown.maxHeight
		}else{
			//var aroundPos = around ? domPosition(around, false) : {y: args.y - (args.padding||0), h: (args.padding||0) * 2};
			var aroundPos = rias.isDomNode(around) ? domPosition(around, false) : {
				y: args.y,
				h: 0
			};
			aroundPos.y -= padding;
			aroundPos.h += padding + padding;
			maxHeight = Math.floor(Math.max(aroundPos.y, viewport.h - _dom.defaultRestrict - (aroundPos.y + aroundPos.h)));
		}
		if(pos.h > maxHeight){
			var cs = getComputedStyle(widget.domNode);
			widget.resize({
				w: cs.width + rias.theme.scrollbarWidth,
				h: maxHeight
			});
		}

		// position the wrapper and make it visible
		var layoutFunc = widget._getCornerOrient ? rias.hitch(widget, "_getCornerOrient") : null,
			positions = (rias.isString(args.popupPositions) ? [args.popupPositions] : args.popupPositions) || _dom.tooltipPositions;
		if(around === "center"){
			pos = _dom.positionAround(wrapper, {
				x: viewport.w >> 1,
				y: viewport.h >> 1
			}, ["center"], ltr, 0, null);
		}else if(around){
			pos = _dom.positionAround(wrapper, around, positions, ltr, padding, layoutFunc);
		}else{
			pos = _dom.positionAt(wrapper, args, positions === 'R' ? ['TR', 'BR', 'TL', 'BL'] : ['TL', 'BL', 'TR', 'BR'], padding, layoutFunc);
		}

		maxHeight = args.restrictPadding || maxHeight.restrictPadding;
		if(maxHeight >= 0){///默认不 restrict，与 popup 不同的是 placeAndPosition 可以不约束
			maxHeight = restrict(wrapper, undefined, undefined, maxHeight);
			pos = rias.mixin(pos, maxHeight);
		}
		if(widget._setCornerOrient){
			widget._setCornerOrient(pos);
		}
		return pos;
	}
	_dom.placeAndPosition = function(wrapper, widget, args){
		args = args || {};
		var around;
		if(rias.isRiasw(args.around)){
			around = args.around.domNode;
		}else if(rias.isString(args.around)){
			around = rias.domNodeBy(args.around, widget);
			if(!around){
				around = "center";
			}
		}else if(args.around){
			around = args.around;
		//}else if(!args.x || !args.y){
		//	around = "center";/// Dialog 有需要由 设计期 style 定位，不应该强行赋值
		}
		///FIXME:zensst. parent 和 around 不同步（不在同一个 parent）时的定位问题。
		args = rias.mixin({}, args);///只需要 mixin，不要 mixinDeep
		args.parent = rias.by(_placeTo(wrapper, args.parent));
		args.around = around;

		return _doPlace(wrapper, widget, args);
	};

	_dom.layoutChildren = function(/*DomNode*/ container, /*Object*/ dim, /*Widget[]*/ children,
								/*String?*/ changedRegionId, /*Number?*/ changedRegionSize){
		///修改 child 缺少 region 时报错为跳过并继续。
		function size(widget, _dim){
			// size the child
			//var newSize = widget.resize ? widget.resize(_dim) : setMarginBox(widget.domNode, _dim);
			if(widget.resize){///需要支持 非 Widget 的 child，比如 TabPanel 中的 layoutChildren
				widget.resize(_dim);
			}else{
				setMarginBox(widget.domNode, _dim);
			}

			/// resize 的返回值可能不全，放弃。
			// record child's size
			//if(newSize){
				// if the child returned it's new size then use that
			//	rias.mixin(widget, newSize);
			//}else{
				// otherwise, call getMarginBox(), but favor our own numbers when we have them.
				// the browser lies sometimes
			//	rias.mixin(widget, getMarginBox(widget.domNode));
			//	rias.mixin(widget, _dim);
			//}
			return rias.mixin(getMarginBox(widget.domNode), _dim);

		}

		children = rias.filter(children, function(item){
			return item.region !== "center" && item.layoutAlign !== "client";
		}).concat(rias.filter(children, function(item){
				return item.region === "center" || item.layoutAlign === "client";
			}));

		// set positions/sizes
		//var cs = getComputedStyle(container);
		if(_dom.isEmptyBox(dim)){///注意：dim = undefined 有特殊意义，表示无 box，但是要 resize()。
			dim = undefined;
		}else{
			dim = rias.mixin({}, dim);///使用副本，避免修改
			_dom.floorBox(dim);
		}
		///不应该设置 dim，避免强行给 child 设置 width/height，导致不能自适应
		//if(!dim){
			//dim = {};
			//dim = getContentBox(container, cs);
		//}
		rias.forEach(children, function(child){
			if(child.isDestroyed && child.isDestroyed(true)){
				return;
			}
			var node = child.domNode,
				pos = (child.region || child.layoutAlign);
			if(dim && pos){
				// set elem to upper left corner of unused space; may move it later
				var nodeStyle = node.style;
				if(pos !== "right"){
					nodeStyle.left = (dim.l ? dim.l : 0) + "px";
				//}else{
				//	nodeStyle.left = "";///避免收缩时不准确
				}
				if(pos !== "bottom"){
					nodeStyle.top = (dim.t ? dim.t : 0) + "px";
				//}else{
				//	nodeStyle.top = "";///避免收缩时不准确
				}
				nodeStyle.position = "absolute";

				/// class dijitAlign* 有 overflow 设置，不推荐，还是不加载的好。
				//addClass(node, "dijitAlign" + capitalize(pos));

				// Size adjustments to make to this child widget
				var sizeSetting = {};

				// Check for optional size adjustment due to splitter drag (height adjustment for top/bottom align
				// panes and width adjustment for left/right align panes.
				if(changedRegionId && changedRegionId === child.id && changedRegionSize >= 0){
					sizeSetting[child.region === "top" || child.region === "bottom" ? "h" : "w"] = changedRegionSize;
				}

				if(pos === "leading"){
					pos = child.isLeftToRight() ? "left" : "right";
				}
				if(pos === "trailing"){
					pos = child.isLeftToRight() ? "right" : "left";
				}

				// set size && adjust record of remaining space.
				// note that setting the width of a <div> may affect its height.
				if(pos === "top" || pos === "bottom"){
					sizeSetting.w = dim.w;
					sizeSetting = size(child, sizeSetting);
					dim.h -= sizeSetting.h;
					if(pos === "top"){
						dim.t += sizeSetting.h;
					}else{
						nodeStyle.top = (dim.t + dim.h) + "px";
					}
				}else if(pos === "left" || pos === "right"){
					sizeSetting.h = dim.h;
					sizeSetting = size(child, sizeSetting);
					dim.w -= sizeSetting.w;
					if(pos === "left"){
						dim.l += sizeSetting.w;
					}else{
						nodeStyle.left = (dim.l + dim.w) + "px";
					}
				}else if(pos === "client" || pos === "center"){
					size(child, dim);
				}else{
					if(child.resize){
						child.resize();
					}
				}
			}else{
				///size()执行后，会设置 style，导致 child.size 固化
				//size(child, getMarginBox(child.domNode));
				if(child.resize){///需要 resize，计算 needResize
					child.resize();
				}
			}
		});
		return true;
	};

	_dom.visible = function(node, visiblity, opacity){
		node = rias.domNodeBy(node);
		if(node){
			var ws;
			if(arguments.length > 1){
				ws = node.style;
				if(visiblity != undefined){
					visiblity = !(visiblity == false || visiblity === "hidden");
					if(visiblity){
						ws.visibility = "visible";
						ws.display = "";
					}else{
						ws.visibility = "hidden";
						ws.display = "none";
					}
				}
				if(rias.isNumber(opacity)){
					ws.opacity = opacity;
				}
			}else{
				ws = getComputedStyle(node);///优化速度
			}
			/// 排除 visibility（可视性）的判断。
			return ws.display !== "none" && (node.getAttribute("type") !== "hidden");
		}
		return undefined;
	};
	_dom.isVisible = function(node, checkAncestors){
		node = rias.domNodeBy(node);
		if(!node){
			return false;
		}
		/*var v = node && node.parentNode && _dom.visible(node);
		if(checkAncestors){
			while(v && (node.parentNode !== node.ownerDocument) && (node = node.parentNode)){
				v = _dom.visible(node);
			}
			v = v && node && node.parentNode === node.ownerDocument;
		}
		return !!v;*/
		var v = node && node.parentNode && _dom.visible(node);
		if(checkAncestors){
			while(v && (node.parentNode !== node.ownerDocument) && (node = node.parentNode)){
				/*while(node && (node.nodeType !== 1 || !node.getAttribute("widgetId"))){
					if(node.parentNode === node.ownerDocument){
						break;
					}
					node = node.parentNode;
				}*/
				v = _dom.visible(node);
			}
			v = v && node && node.parentNode === node.ownerDocument;
		}
		return !!v;
	};
	_dom.disabled = function(node, disabled){
		node = rias.domNodeBy(node);
		if(node){
			if(arguments.length > 1){
				setAttr(node, "disabled", !!disabled);
			}
			return getAttr(node, "disabled");
		}
		return undefined;
	};
	_dom.isDisabled = function(node, checkAncestors){
		node = rias.domNodeBy(node);
		var v = node && node.parentNode && _dom.disabled(node);
		if(checkAncestors){
			while(v && (node.parentNode !== node.ownerDocument) && (node = node.parentNode)){
				v = _dom.disabled(node);
			}
			v = v && node && node.parentNode === node.ownerDocument;
		}
		return !!v;
	};
	_dom.readOnly = function(node, readOnly){
		node = rias.domNodeBy(node);
		if(node){
			if(arguments.length > 1){
				setAttr(node, "readOnly", !!readOnly);
			}
			return getAttr(node, "readOnly");
		}
		return undefined;
	};
	_dom.isReadOnly = function(node, checkAncestors){
		node = rias.domNodeBy(node);
		var v = node && node.parentNode && _dom.readOnly(node);
		if(checkAncestors){
			while(v && (node.parentNode !== node.ownerDocument) && (node = node.parentNode)){
				v = _dom.readOnly(node);
			}
			v = v && node && node.parentNode === node.ownerDocument;
		}
		return !!v;
	};

	rias.a11y = a11y;

	_dom.focus = function(/*Object|DomNode */ handle){
		focus.focus(handle);
	};
	//var _globalFocusedDiv = _dom._globalFocusedDiv = winDoc.createElement("div");
	//addClass(_globalFocusedDiv, "riaswGlobalFocused");
	//_globalFocusedDiv.setAttribute("id", "_riasrGlobalFocusedDiv");
	//domPlace(_globalFocusedDiv, winBody(_globalFocusedDiv.ownerDocument));
	//rias.subscribe("focusNode", function(node){/// focusNode 在 dijit/_base/focus 中 publish，废弃，且未响应 blur，还是直接 watch 好些，这样可以保留当前 focusNode
	//focus.watch("currNode", function(name, oldVal, newVal){
		//if(newVal){
		//	var pos = domPosition(newVal, true);
		//	setStyle(_globalFocusedDiv, {
		//		top: pos.y + "px",
		//		left: pos.x + "px",
		//		width: pos.w + "px",
		//		height: pos.h + "px"
		//	});
		//	removeClass(_globalFocusedDiv, "riaswHidden");
		//}else{
		//	addClass(_globalFocusedDiv, "riaswHidden");
		//}
	//});

	_dom.selection = selection;
	_dom.setSelectable = dojoDom.setSelectable;
	if(rias.has("ie") < 9){
		_dom._setSelectionRange = function(/*DomNode*/ element, /*Number?*/ start, /*Number?*/ stop){
			if(element.createTextRange){
				var r = element.createTextRange();
				r.collapse(true);
				r.moveStart("character", -99999); // move to 0
				r.moveStart("character", start); // delta from 0 is the correct position
				r.moveEnd("character", stop - start);
				r.select();
			}
		};
	}else{
		_dom._setSelectionRange = function(/*DomNode*/ element, /*Number?*/ start, /*Number?*/ stop){
			if(element.setSelectionRange){
				element.setSelectionRange(start, stop);
			}
		};
	}
	_dom.selectInputText = function(/*DomNode*/ element, /*Number?*/ start, /*Number?*/ stop){
		// summary:
		//		Select text in the input element argument, from start (default 0), to stop (default end).

		// TODO: use functions in _editor/selection.js?
		element = _dom.byId(element);
		if(isNaN(start)){
			start = 0;
		}
		if(isNaN(stop)){
			stop = element.value ? element.value.length : 0;
		}
		try{
			element.focus();
			_dom._setSelectionRange(element, start, stop);
		}catch(e){ /* squelch random errors (esp. on IE) from unexpected focus changes or DOM nodes being hidden */
		}
	};

	var docElement = _dom.doc.documentElement;
	// tell dojo/touch to generate synthetic clicks immediately
	// and regardless of preventDefault() calls on touch events
	_dom.doc.dojoClick = true;
	/// ... but let user disable this by removing dojoClick from the document
	if(has("touch")){
		// Do we need to send synthetic clicks when preventDefault() is called on touch events?
		// This is normally true on anything except Android 4.1+ and IE10+, but users reported
		// exceptions like Galaxy Note 2. So let's use a has("clicks-prevented") flag, and let
		// applications override it through data-dojo-config="has:{'clicks-prevented':true}" if needed.
		has.add("clicks-prevented", !(has("android") >= 4.1 || (has("ie") === 10) || (!has("ie") && has("trident") > 6)));
		if(has("clicks-prevented")){
			_dom._sendClick = function(target, e){
				// dojo/touch will send a click if dojoClick is set, so don't do it again.
				for(var node = target; node; node = node.parentNode){
					if(node.dojoClick){
						return;
					}
				}
				var ev = _dom.doc.createEvent("MouseEvents");
				ev.initMouseEvent("click", true, true, rias.global, 1, e.screenX, e.screenY, e.clientX, e.clientY);
				target.dispatchEvent(ev);
			};
		}
	}
	var touchActionProp = has("pointer-events") ? "touchAction" : has("MSPointer") ? "msTouchAction" : null;
	_dom._setTouchAction = touchActionProp ? function(/*Node*/node, /*Boolean*/value){
		node.style[touchActionProp] = value;
	} : function(){};

	_dom.getScreenSize = function(){
		// summary:
		//		Returns the dimensions of the browser window.
		return {
			h: rias.global.innerHeight || docElement.clientHeight,
			w: rias.global.innerWidth || docElement.clientWidth
		};
	};
	_dom.updateOrient = function(){
		// summary:
		//		Updates the orientation specific CSS classes, 'dj_portrait' and
		//		'dj_landscape'.
		var dim = _dom.getScreenSize();
		_dom.replaceClass(docElement,
			dim.h > dim.w ? "dj_portrait" : "dj_landscape",
			dim.h > dim.w ? "dj_landscape" : "dj_portrait"
		);
	};
	_dom.updateOrient();
	_dom.tabletSize = 500;
	_dom.detectScreenSize = function(/*Boolean?*/force){
		// summary:
		//		Detects the screen size and determines if the screen is like
		//		phone or like tablet. If the result is changed,
		//		it sets either of the following css class to `<html>`:
		//
		//		- 'dj_phone'
		//		- 'dj_tablet'
		//
		//		and it publishes either of the following events:
		//
		//		- '/dojox/mobile/screenSize/phone'
		//		- '/dojox/mobile/screenSize/tablet'

		var dim = _dom.getScreenSize();
		var sz = Math.min(dim.w, dim.h);
		var from, to;
		if(sz >= _dom.tabletSize && (force || (!this._sz || this._sz < _dom.tabletSize))){
			from = "phone";
			to = "tablet";
		}else if(sz < _dom.tabletSize && (force || (!this._sz || this._sz >= _dom.tabletSize))){
			from = "tablet";
			to = "phone";
		}
		if(to){
			_dom.replaceClass(docElement, "dj_" + to, "dj_" + from);
			rias.publish("/dojox/mobile/screenSize/" + to, [dim]);
		}
		this._sz = sz;
	};
	_dom.detectScreenSize();

	// dojox/mobile.hideAddressBarWait: Number
	//		The time in milliseconds to wait before the fail-safe hiding address
	//		bar runs. The value must be larger than 800.
	_dom.hideAddressBarWait = typeof(config.mblHideAddressBarWait) === "number" ? config.mblHideAddressBarWait : 1500;
	_dom.hide_1 = function(){
		// summary:
		//		Internal function to hide the address bar.
		// tags:
		//		private
		scrollTo(0, 1);
		_dom._hidingTimer = (_dom._hidingTimer == 0) ? 200 : _dom._hidingTimer * 2;
		///TODO:zensst.以后再考虑释放
		setTimeout(function(){ // wait for a while for "scrollTo" to finish
			if(_dom.isAddressBarHidden() || _dom._hidingTimer > _dom.hideAddressBarWait){
				// Succeeded to hide address bar, or failed but timed out
				_dom.resizeAll();
				_dom._hiding = false;
			}else{
				// Failed to hide address bar, so retry after a while
				setTimeout(_dom.hide_1, _dom._hidingTimer);
			}
		}, 50); //50ms is an experiential value
	};
	_dom.hideAddressBar = function(/*Event?*/evt){
		// summary:
		//		Hides the address bar.
		// description:
		//		Tries to hide the address bar a couple of times. The purpose is to do
		//		it as quick as possible while ensuring the resize is done after the hiding
		//		finishes.
		if(_dom.disableHideAddressBar || _dom._hiding){
			return;
		}
		_dom._hiding = true;
		_dom._hidingTimer = has("ios") ? 200 : 0; // Need to wait longer in case of iPhone
		var minH = screen.availHeight;
		if(has('android')){
			minH = window.outerHeight / window.devicePixelRatio;///window.outerHeight / window.devicePixelRatio
			// On some Android devices such as Galaxy SII, minH might be 0 at this time.
			// In that case, retry again after a while. (190ms is an experiential value)
			if(minH == 0){
				_dom._hiding = false;
				///TODO:zensst.以后再考虑释放
				setTimeout(function(){
					_dom.hideAddressBar();
				}, 190);
			}
			// On some Android devices such as HTC EVO, "outerHeight/devicePixelRatio"
			// is too short to hide address bar, so make it high enough
			if(minH <= window.innerHeight){
				minH = window.outerHeight;
			}
			// On Android 2.2/2.3, hiding address bar fails when "overflow:hidden" style is
			// applied to html/body element, so force "overflow:visible" style
			if(has('android') < 3){
				docElement.style.overflow = _dom.body().style.overflow = "visible";
			}
		}
		if(_dom.body().offsetHeight < minH){ // to ensure enough height for scrollTo to work
			_dom.body().style.minHeight = minH + "px";
			_dom._resetMinHeight = true;
		}
		///TODO:zensst.以后再考虑释放
		setTimeout(_dom.hide_1, _dom._hidingTimer);
	};
	_dom.isAddressBarHidden = function(){
		return window.pageYOffset === 1;
	};

	_dom.disableResizeAll = true;/// 在 riasCordovaShell 中启动。
	_dom.resizeAll = function(/*Event?*/evt, /*Widget?*/root){
		///FIXME:zensst. 需要合并到 Desktop
		///TODO:zensst. 需要合并到 Desktop
		// summary:
		//		Calls the resize() method of all the top level resizable widgets.
		// description:
		//		Finds all widgets that do not have a parent or the parent does not
		//		have the resize() method, and calls resize() for them.
		//		If a widget has a parent that has resize(), calling widget's
		//		resize() is its parent's responsibility.
		// evt:
		//		Native event object
		// root:
		//		If specified, searches the specified widget recursively for top-level
		//		resizable widgets.
		//		root.resize() is always called regardless of whether root is a
		//		top level widget or not.
		//		If omitted, searches the entire page.
		function _do(){
			rias.publish("/dojox/mobile/resizeAll", evt, root); // back compat
			rias.publish("/dojox/mobile/beforeResizeAll", evt, root);
			if(_dom._resetMinHeight){
				desktopBody.style.minHeight = _dom.getScreenSize().h + "px";
			}
			_dom.updateOrient();
			_dom.detectScreenSize();
			var isTopLevel = function(w){
				var parent = w.getParent && w.getParent();
				return !!((!parent || !parent.resize) && w.resize);
			};
			var resizeRecursively = function(w){
				rias.forEach(w.getChildren(), function(child){
					if(isTopLevel(child)){
						child.resize();
					}
					resizeRecursively(child);
				});
			};
			if(root){
				if(root.resize){
					root.resize();
				}
				resizeRecursively(root);
			}else{
				rias.forEach(rias.filter(rias.rt.toArray(), isTopLevel),
					function(w){
						w.resize();
					});
			}
			rias.publish("/dojox/mobile/afterResizeAll", evt, root);
		}
		if(_dom.disableResizeAll || rias.isRiaswDesktop(rias.desktop)){/// rias.isRiaswDesktop(rias.desktop) 判断为 Desktop 时，则交由 Desktop 处理
			return;
		}
		rias._debounce("rias.dom.resizeAll", function(){
			console.debug("rias.dom.resizeAll");
			_do();
		}, _dom, 230, function(){
			console.debug("rias.dom.resizeAll pass");
		})();
	};

	_dom.openWindow = function(url, target, preventCache){
		// summary:
		//		Opens a new browser window with the given URL.
		if(preventCache){
			url += (~url.indexOf('?') ? '&' : '?') + 'request.preventCache=' + (+(new Date()));
		}
		rias.global.open(url, target || "_blank");
	};

	if(config.mblApplyPageStyles !== false){
		_dom.addClass(docElement, "mobile");
	}
	if(has('chrome')){
		// dojox/mobile does not load uacss (only _compat does), but we need dj_chrome.
		_dom.addClass(docElement, "dj_chrome");
	}
	//if(rias.global._no_dojo_dm){
	//	// deviceTheme seems to be loaded from a script tag (= non-dojo usage)
	//	var _dm = rias.global._no_dojo_dm;
	//	for(var i in _dm){
	//		mobile[i] = _dm[i];
	//	}
	//	mobile.deviceTheme.setDm(mobile);
	//}
	// flag for Android transition animation flicker workaround
	has.add('mblAndroidWorkaround', config.mblAndroidWorkaround !== false && has('android') < 3, undefined, true);
	has.add('mblAndroid3Workaround', config.mblAndroid3Workaround !== false && has('android') >= 3, undefined, true);

	// Set the background style using dojo/domReady, not dojo/ready, to ensure it is already
	// set at widget initialization time. (#17418)
	rias.ready(function(){
		///FIXME:zensst. 需要合并到 Desktop
		///TODO:zensst. 需要合并到 Desktop
		if(config.mblApplyPageStyles !== false){
			_dom.addClass(_dom.body(), "mblBackground");
		}

		_dom.detectScreenSize(true);
		if(config.mblAndroidWorkaroundButtonStyle !== false && has('android')){
			// workaround for the form button disappearing issue on Android 2.2-4.0
			_dom.create("style", {
				innerHTML:"BUTTON,INPUT[type='button'],INPUT[type='submit'],INPUT[type='reset'],INPUT[type='file']::-webkit-file-upload-button{-webkit-appearance:none;} audio::-webkit-media-controls-play-button,video::-webkit-media-controls-play-button{-webkit-appearance:media-play-button;} video::-webkit-media-controls-fullscreen-button{-webkit-appearance:media-fullscreen-button;}"
			}, _dom.doc.head, "first");
		}
		if(has('mblAndroidWorkaround')){
			// add a css class to show view offscreen for android flicker workaround
			_dom.create("style", {
				innerHTML:".mblView.mblAndroidWorkaround{position:absolute;top:-9999px !important;left:-9999px !important;}"
			}, _dom.doc.head, "last");
		}

		var _resizeFunc = _dom.resizeAll;
		// Address bar hiding
		var isHidingPossible = navigator.appVersion.indexOf("Mobile") >= 0 && // only mobile browsers
			// #17455: hiding Safari's address bar works in iOS < 7 but this is
			// no longer possible since iOS 7. Hence, exclude iOS 7 and later:
			!(has("ios") >= 7);
		// You can disable the hiding of the address bar with the following dojoConfig:
		// var dojoConfig = { mblHideAddressBar: false };
		// If unspecified, the flag defaults to true.
		if((config.mblHideAddressBar !== false && isHidingPossible) ||
			config.mblForceHideAddressBar === true){
			_dom.hideAddressBar();
			if(config.mblAlwaysHideAddressBar === true){
				_resizeFunc = _dom.hideAddressBar;
			}
		}

		var ios6 = has("ios") >= 6; // Full-screen support for iOS6 or later
		if((has('android') || ios6) && rias.global.onorientationchange !== undefined){
			var _f = _resizeFunc;
			var curSize, curClientWidth, curClientHeight;
			if(ios6){
				curClientWidth = docElement.clientWidth;
				curClientHeight = docElement.clientHeight;
			}else{ // Android
				// Call resize for the first resize event after orientationchange
				// because the size information may not yet be up to date when the
				// event orientationchange occurs.
				_resizeFunc = function(evt){
					var _conn = rias.after(rias.global, "onresize", function(e){
						_conn.remove();
						_f(e);
					});
				};
				curSize = _dom.getScreenSize();
			}
			// Android: Watch for resize events when the virtual keyboard is shown/hidden.
			// The heuristic to detect this is that the screen width does not change
			// and the height changes by more than 100 pixels.
			//
			// iOS >= 6: Watch for resize events when entering or existing the new iOS6
			// full-screen mode. The heuristic to detect this is that clientWidth does not
			// change while the clientHeight does change.
			_dom._onResizeHandle = rias.after(rias.global, "onresize", function(e){
				if(ios6){
					var newClientWidth = docElement.clientWidth,
						newClientHeight = docElement.clientHeight;
					if(newClientWidth === curClientWidth && newClientHeight !== curClientHeight){
						// full-screen mode has been entered/exited (iOS6)
						_f(e);
					}
					curClientWidth = newClientWidth;
					curClientHeight = newClientHeight;
				}else{ // Android
					var newSize = _dom.getScreenSize();
					if(newSize.w === curSize.w && Math.abs(newSize.h - curSize.h) >= 100){
						// keyboard has been shown/hidden (Android)
						_f(e);
					}
					curSize = newSize;
				}
			});
		}

		_dom._onOrientationHandle = rias.after(rias.global, rias.global.onorientationchange !== undefined ? "onorientationchange" : "onresize", _resizeFunc);
		_dom.body().style.visibility = "visible";
	});

	var _globalTempDiv = _dom._globalTempDiv = _dom.doc.createElement("div");
	_dom.setStyle(_globalTempDiv, {
		top: "-10000px",
		left: "-10010px",
		width: "1010px",
		height: "1000px",
		visibility: "hidden",
		position: "absolute",
		overflow: "hidden"
	});
	_globalTempDiv.setAttribute("id", "_riasrGlobalTempDiv");
	_dom.place(_globalTempDiv, desktopBody);
	rias.on(window, "unload", function(){
		if(_dom._onOrientationHandle){
			_dom._onOrientationHandle.remove();
			delete _dom._onOrientationHandle;
		}
		if(_dom._onResizeHandle){
			_dom._onResizeHandle.remove();
			delete _dom._onResizeHandle;
		}
		if(_dom._iosFocusinHandle){
			_dom._iosFocusinHandle.remove();
			delete _dom._iosFocusinHandle;
		}
		if(_dom._iosFocusoutHandle){
			_dom._iosFocusoutHandle.remove();
			delete _dom._iosFocusoutHandle;
		}
		if(Viewport._ie8ScreenSizeHandle){
			clearInterval(Viewport._ie8ScreenSizeHandle);
			delete Viewport._ie8ScreenSizeHandle;
		}
		Viewport._rlh.remove();
		delete Viewport._rlh;
		Viewport = undefined;
		_dom.destroy(_globalTempDiv);
	});

	Moveable.extend({
		onFirstMove: function(/*===== mover, e =====*/){
			// summary:
			//		called during the very first move notification;
			//		can be used to initialize coordinates, can be overwritten.
			// mover: Mover
			// e: Event

			// default implementation does nothing
			this._styleTopPercent = this.node.style.top.indexOf("%") >= 0;
			this._styleLeftPercent = this.node.style.left.indexOf("%") >= 0;
		},
		onMoveStop: function(/*Mover*/ mover){
			// summary:
			//		called after every move operation

			var pb = getContentBox(this.node.parentNode);
			///这里，node 的 top/left 都是 px，可以用 parseFloat，无需用 rias.dom.toPixelValue
			if(this._styleTopPercent && this.node.style.top.indexOf("%") < 0){
				this.node.style.top = +rias.toFixed(parseFloat(this.node.style.top) / pb.h * 100, 2) + "%";
			}
			if(this._styleLeftPercent && this.node.style.left.indexOf("%") < 0){
				this.node.style.left = +rias.toFixed(parseFloat(this.node.style.left) / pb.w * 100, 2) + "%";
			}

			rias.publish("/dnd/move/stop", mover);
			_dom.removeClass(_dom.body(), "dojoMove");
			_dom.removeClass(this.node, "dojoMoveItem");
		}
	});
	move.constrainedMoveable.extend({
		destroy: function(){
			///注意：没有继承自 Destroyable
			this.inherited(arguments);
			this.constraintBox = this.constraints = null;
		},
		onFirstMove: function(/*Mover*/ mover){
			// summary:
			//		called during the very first move notification;
			//		can be used to initialize coordinates, can be overwritten.
			this._styleTopPercent = this.node.style.top.indexOf("%") >= 0;
			this._styleLeftPercent = this.node.style.left.indexOf("%") >= 0;

			var c = this.constraintBox = this.constraints.call(this, mover);
			c.r = c.l + c.w;
			c.b = c.t + c.h;
			if(this.within){
				var mb = domGeom.getMarginSize(mover.node);
				c.r -= mb.w;
				c.b -= mb.h;
			}
		}
	});
	Mover.extend({
		// utilities
		onFirstMove: function(e){
			// summary:
			//		makes the node absolute; it is meant to be called only once.
			//		relative and absolutely positioned nodes are assumed to use pixel units
			var s = this.node.style,
				bm,
				l, t, h = this.host;
			switch(s.position){
				case "relative":
				case "absolute":
					// assume that left and top values are in pixels already
					///改为取 getMarginBox，以支持 right、bottom
					bm = getMarginBox(this.node);
					l = Math.round(bm.l) || 0;
					t = Math.round(bm.t) || 0;
					break;
				default:
					s.position = "absolute";	// enforcing the absolute mode
					var m = getMarginBox(this.node);
					// event.pageX/pageY (which we used to generate the initial
					// margin box) includes padding and margin set on the body.
					// However, setting the node's position to absolute and then
					// doing domGeom.marginBox on it *doesn't* take that additional
					// space into account - so we need to subtract the combined
					// padding and margin.  We use getComputedStyle and
					// _getMarginBox/_getContentBox to avoid the extra lookup of
					// the computed style.
					var b = _dom.docBody;
					var bs = getComputedStyle(b);
					bm = getMarginBox(b, bs);
					var bc = getContentBox(b, bs);
					l = m.l - (bc.l - bm.l);
					t = m.t - (bc.t - bm.t);
					break;
			}
			this.marginBox.l = l - this.marginBox.l;
			this.marginBox.t = t - this.marginBox.t;
			if(h && h.onFirstMove){
				h.onFirstMove(this, e);
			}

			// Disconnect touch.move that call this function
			this.events.shift().remove();
		}
	});

	//_dInitDojo.resolve(rias);

	return rias;

});
