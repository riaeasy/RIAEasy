
//RIAStudio Client Runtime(rias) in Browser.

define([
	"rias/base/riasBase",

	"dojo/on",
	"dojo/touch",
	"dojo/keys",
	"dojo/mouse",
	//"dojox/gesture/tap",
	//"dojox/gesture/swipe",
	"dojo/_base/connect",
	"dojo/_base/event",
	"dojo/_base/window",
	"dojo/window",

	"dojo/_base/html",//dojo.byId(),dojo.destroy()
	"dojo/html",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dojo/dom-prop",

	"dojo/parser",
	"dojo/query",
	"dojo/cookie",
	"dojo/hash",
	"dojo/ready",

	"dojo/dnd/Mover",

	//"dijit/dijit",///不能加载，否则会加载 form/_FormWidget，造成 _FormWidgetMixin.extend 失败。
	//"dijit/_base",///有废弃的 require，单独引入需要的
	//"dijit/main",//打包出来的文件
	"dijit/_base/manager",///废弃，但是很多地方在用 dijit.defaultDuration
	"dijit/_base/focus",///废弃，同上
	//"dijit/_base/place",///废弃
	//"dijit/_base/popup",///废弃
	//"dijit/_base/scroll",///废弃
	//"dijit/_base/sniff",///废弃
	//"dijit/_base/typematic",///废弃
	//"dijit/_base/wai",///废弃
	//"dijit/_base/window",///废弃
	"dijit/typematic",

	"dijit/a11y",
	"dijit/a11yclick",
	"dijit/registry",
	"dijit/WidgetSet",	// used to be in dijit/_base/manager
	"dijit/selection",
	"dijit/focus",
	"dijit/place",
	"dijit/Viewport",
	"dijit/layout/utils",
	"dijit/popup",
	"dijit/BackgroundIframe",

	"dijit/_WidgetBase",
	"dijit/_Widget",
	"dijit/_CssStateMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/_FocusMixin",
	"dijit/_Container",

	"dijit/form/_FormWidgetMixin",
	"dijit/form/_FormValueMixin",
	"dijit/form/_TextBoxMixin",
	"dijit/form/_AutoCompleterMixin",
	"dijit/_HasDropDown"
], function(rias, on, touch, keys, mouse, //gestureTap, gestureSwipe,
			connect, event, basewin, win,
			_html, html, dojoDom, domConstruct, domGeom, domClass, domStyle, domAttr, domProp,
			parser, query, cookie, hash, ready,
			Mover,
			manager, _basefocus, typematic,
			a11y, a11yclick, registry, WidgetSet,
			selection, focus, place, Viewport, layoutUtils, popup, BackgroundIframe,
			_WidgetBase, _Widget, _CssStateMixin, _WidgetsInTemplateMixin, _FocusMixin, _Container,
			_FormWidgetMixin, _FormValueMixin, _TextBoxMixin, _AutoCompleterMixin, _HasDropDown) {

///dom******************************************************************************///
	rias.on = on;
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
	rias.touch = touch;
	rias.keys = keys;
	rias.mouse = mouse;
	//rias.gesture = {
	//	tap: gestureTap,
	//	swipe: gestureSwipe
	//};
	rias.typematic = typematic;

	rias.connect = connect;
	//rias.disconnect = connect;
	rias.event = event;
	rias.event.fixEvent = event.fix;
	rias.event.stopEvent = event.stop;

	rias.html = html;

	rias.cookie = cookie;
	rias.hash = hash;
	rias.ready = ready;

	rias.global = basewin.global;
	rias.setContext = basewin.setContext;
	rias.withGlobal = basewin.withGlobal;
	var _dom = rias.dom = {};
	var winDoc = _dom.doc = basewin.doc;
	//_dom.withDoc = basewin.withDoc;
	var winBody = _dom.body = basewin.body;
	_dom.docBody = winBody(winDoc);
	var webAppNode = _dom.webAppNode = rias.webApp ? rias.webApp.domNode : _dom.docBody;
	_dom.heads = winDoc.getElementsByTagName('head');
	_dom.scripts = winDoc.getElementsByTagName('script');

	_dom.getWindow = win.get;
	_dom.getWindowBox = win.getBox;
	_dom.scrollIntoView = rias.hitch(win, win.scrollIntoView);///调用了 this，需要 hitch

	_dom.parse = rias.hitch(parser, parser.parse);///调用了 this，需要 hitch
	//_dom.css3 = css3;
	_dom.query = query;

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
			if(typeof val == "string"){ // inline'd type check
				obj[name] = [val, value];
			}else if(lang.isArray(val)){
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
					if(type == "radio" || type == "checkbox"){
						if(inputNode.checked){
							ret = inputNode.value;
						}
					}else if(inputNode.multiple){
						ret = [];
						var nodes = [inputNode.firstChild];
						while(nodes.length){
							for(var node = nodes.pop(); node; node = node.nextSibling){
								if(node.nodeType === 1 && node.tagName.toLowerCase() == "option"){
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
					if(type == "image"){
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

			return rias.objectToQuery(this.toObject(formNode)); // String
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

	var byId;
	if(rias.has("ie")){
		byId = _dom.byId = dojoDom.byId = function(id, doc){
			if(typeof id != "string"){
				return rias.isDomNode(id) ? id : null;
			}
			var _doc = doc || winDoc,
				te = id && _doc.getElementById(id);
			// attributes.id.value is better than just id in case the
			// user has a name=id inside a form
			if(te && (te.attributes.id.value == id || te.id == id)){
				return rias.isDomNode(te) ? te : null;
			}else{
				var eles = _doc.all[id];
				if(!eles || eles.nodeName){
					eles = [eles];
				}
				// if more than 1, choose first with the correct id
				var i = 0;
				while((te = eles[i++])){
					if((te.attributes && te.attributes.id && te.attributes.id.value == id) || te.id == id){
						return rias.isDomNode(te) ? te : null;
					}
				}
			}
		};
	}else{
		byId = _dom.byId = dojoDom.byId = function(id, doc){
			// inline'd type check.
			// be sure to return null per documentation, to match IE branch.
			id = (typeof id == "string") ? (doc || winDoc).getElementById(id) : id;
			return rias.isDomNode(id) ? id : null; // DOMNode
		};
	}
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
				if(node == ancestor){
					return true; // Boolean
				}
				node = node.parentNode;
			}
		}catch(e){ /* squelch, return false */ }
		return false; // Boolean
	};
	_dom.contains = function(parent, child){
		parent = rias.domNodeBy(parent);
		child = rias.domNodeBy(child);
		return isDescendant(child, parent)
	};
	_dom.setSelectable = dojoDom.setSelectable;

	_dom.toDom = domConstruct.toDom;
	var domOn = _dom.domOn = function(node, eventName, ieEventName, handler){
		// Add an event listener to a DOM node using the API appropriate for the current browser;
		// return a function that will disconnect the listener.
		if(!rias.has("ie-event-behavior")){
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
						callback && callback();
					}
				}),
				errorDisconnector = domOn(node, "error", "onerror", function(e){
					loadDisconnector();
					errorDisconnector();
					rias.require.signal("error", rias.mixin(new Error("injectUrl error: "), {
						src:"dojoLoader/rias.require.injectNode",
						info:[node, e]
					}));
					callback && callback();
				});
		}
		return domConstruct.place(node, refNode || webAppNode, position);
	};
	_dom.create = domConstruct.create;
	_dom.empty = domConstruct.empty;
	_dom.destroy = domConstruct.destroy;

	(function (){
		///为了隔离 var，独立设置一个 function 实现闭包。
		///这里的 injectUrl 是基于浏览器的
		if(rias.has("dom") && (rias.has("dojo-inject-api") || rias.has("dojo-dom-ready-api"))){
			var insertPointSibling = 0,
				doc = dojo.global.document,///rias.dom.doc 尚未取得
				makeError = function(error, info){
					return rias.mixin(new Error(error), {
						src:"dojoLoader/rias.require.injectNode",
						info:info
					});
				},
				windowOnLoadListener = domOn(window, "load", "onload", function(){
					rias.require.pageLoaded = 1;
					doc.readyState != "complete" && (doc.readyState = "complete");
					windowOnLoadListener();
				});

			if(rias.has("dojo-inject-api")){
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
							if(e.type === "load" || /complete|loaded/.test(n.readyState)){
								loadDisconnector();
								errorDisconnector();
								callback && callback();
							}
							if(rias.config.requirePublish && rias.publish){
								rias.publish("/rias/require/load", [url]);
								rias.publish("/rias/require/done", [url]);
							}
						},
						loadDisconnector = domOn(node, "load", "onreadystatechange", onLoad),
						errorDisconnector = domOn(node, "error", "onerror", function(e){
							loadDisconnector();
							errorDisconnector();
							if(rias.contains(url, "rias/riasd")){
								rias.require.signal("error", makeError("injectUrl rias/riasd error: ", [url, e]));
							}else{
								rias.require.signal("error", makeError("injectUrl error: ", [url, e]));
							}
							callback && callback();
							if(rias.config.requirePublish && rias.publish){
								rias.publish("/rias/require/error", [url, e]);
								rias.publish("/rias/require/done", [url]);
							}
						});

					if(rias.config.requirePublish && rias.publish){
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


	/// 一般地，Box 表示 style，Size表示 width+height，Margin 表示外框，
	/// client 包含了 padding，不包含 maring 和 border，不包含 滚动条
	/// offset 包含 margin
	var nilExtents = {l: 0, t: 0, w: 0, h: 0};
	function isButtonTag(/*DomNode*/ node, tagName){
		tagName = tagName || node.tagName.toLowerCase();
		return tagName == "button" || tagName == "input" && (node.getAttribute("type") || "").toLowerCase() == "button"; // boolean
	}
	var boxModel = _dom.boxModel = domGeom.boxModel;
	var usesBorderBox = _dom.usesBorderBox = function(/*DomNode*/ node){
		var t = node.tagName.toLowerCase();
		return boxModel == "border-box" || t == "table" || isButtonTag(node, t); // boolean
	};
	var floorBox = _dom.floorBox = function(box){
		for(var n in box){
			box[n] = Math.floor(box[n]);
		}
		/*if(box){
			if("t" in box){
				box.t = Math.floor(box.t);
			}
			if("l" in box){
				box.l = Math.floor(box.l);
			}
			if("w" in box){
				box.w = Math.floor(box.w);
			}
			if("h" in box){
				box.h = Math.floor(box.h);
			}
		}*/
		return box;
	};
	function setBox(node, box, /*String?*/ unit){
		unit = unit || "px";
		var s = node.style;
		if(!isNaN(box.l)){
			if(s.left != box.l + unit){
				s.left = box.l + unit;
			}
		}
		if(!isNaN(box.t)){
			if(s.top != box.t + unit){
				s.top = box.t + unit;
			}
		}
		if(box.w >= 0){
			if(s.width != box.w + unit){
				s.width = box.w + unit;
			}
		}
		if(box.h >= 0){
			if(s.height != box.h + unit){
				s.height = box.h + unit;
			}
		}
		return box;
	}
	_dom.boxEqual = function(src, des, diff){
		if(!(diff >= 1)){
			diff = 1;
		}
		return Math.abs(src.t - des.t) < diff
			&& Math.abs(src.l - des.l) < diff
			&& Math.abs(src.w - des.w) < diff
			&& Math.abs(src.h - des.h) < diff;
	};
	var getPadExtents = _dom.getPadExtents = domGeom.getPadExtents;
	var getBorderExtents = _dom.getBorderExtents = domGeom.getBorderExtents;
	var getPadBorderExtents = _dom.getPadBorderExtents = domGeom.getPadBorderExtents;
	var getMarginExtents = _dom.getMarginExtents = domGeom.getMarginExtents;
	var getMarginSize = _dom.getMarginSize = domGeom.getMarginSize;
	/// getMarginBox 取自身容器的大小，包括 padding 和 marging
	var getMarginBox = _dom.getMarginBox = domGeom.getMarginBox;
	var getMarginBorderBox = _dom.getMarginBorderBox = function(/*DomNode*/ node, /*Object*/ computedStyle){
		node = byId(node);
		var s = computedStyle || getComputedStyle(node),
			pb = usesBorderBox(node) ? nilExtents : getPadBorderExtents(node, s),
			mb = getMarginExtents(node, s);
		if(rias.has("webkit")){
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
	var setMarginBox = _dom.setMarginBox = domGeom.setMarginBox = function(node, box, computedStyle) {
		if(!box){
			return box;
		}
		node = byId(node);
		var s = computedStyle || getComputedStyle(node),
			w = box.w,
			h = box.h,
			pb = usesBorderBox(node) ? nilExtents : getPadBorderExtents(node, s),
			mb = getMarginExtents(node, s);
		if (rias.has("webkit")) {
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
		return setBox(node, {
			l: box.l,
			t: box.t,
			w: w,
			h: h
		});
	};
	var setMarginSize = _dom.setMarginSize = function(node, box, computedStyle) {
		if(!box){
			return box;
		}
		node = byId(node);
		var s = computedStyle || getComputedStyle(node),
			w = box.w,
			h = box.h,
			pb = usesBorderBox(node) ? nilExtents : getPadBorderExtents(node, s),
			mb = getMarginExtents(node, s);
		if (rias.has("webkit")) {
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
		return setBox(node, {
			//l: box.l,
			//t: box.t,
			w: w,
			h: h
		});
	};
	/// getContentBox 取内容容器的大小，去掉 padding 和 marging，如果有 clientWidth 则保留 borderWidth
	_dom.getContentBox = domGeom.getContentBox = function(node, computedStyle){
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
		node = byId(node);
		var s = computedStyle || getComputedStyle(node), w = node.clientWidth, h,
			pe = getPadExtents(node, s), be = getBorderExtents(node, s);
		if(!w){
			w = node.offsetWidth;
			h = node.offsetHeight;
		}else{
			h = node.clientHeight;
			be.w = be.h = 0;
		}
		// On Opera, offsetLeft includes the parent's border
		if(rias.has("opera")){
			pe.l += be.l;
			pe.t += be.t;
		}
		return {
			l: pe.l,
			t: pe.t,
			w: w - pe.w - be.w,
			h: h - pe.h - be.h,
			sl: node.scrollLeft + pe.l,
			st: node.scrollTop + pe.t,
			sw: node.scrollWidth - pe.w - be.w,
			sh: node.scrollHeight - pe.h - be.h
		};
	};
	var getContentMargin = _dom.getContentMargin = function(/*DomNode*/ node, /*Object*/ computedStyle){
		/*var cs = computedStyle || getComputedStyle(node);
		node = byId(node);
		var s = computedStyle || getComputedStyle(node),
			w = node.clientWidth, h,
			pe = getPadExtents(node, s),
			be = getBorderExtents(node, s);
		if(!w){
			var me = getMarginExtents(node, cs);
			w = node.offsetWidth - me.w - be.w;
			h = node.offsetHeight - me.h - be.h;
		}else{
			h = node.clientHeight;
			//be.w = be.h = 0;
		}
		// On Opera, offsetLeft includes the parent's border
		if(rias.has("opera")){
			pe.l += be.l;
			pe.t += be.t;
		}
		return {
			l: pe.l,
			t: pe.t,
			w: w - pe.w,
			h: h - pe.h,
			sl: node.scrollLeft,
			st: node.scrollTop,
			sw: node.scrollWidth,
			sh: node.scrollHeight
		};*/
		return _dom.getContentBox(node, computedStyle);
	};
	var marginBox2contentBox = _dom.marginBox2contentBox = layoutUtils.marginBox2contentBox = function(/*DomNode*/ node, /*Object*/ mb, /*Object*/ computedStyle){
		// summary:
		//		Given the margin-box size of a node, return its content box size.
		//		Functions like domGeometry.contentBox() but is more reliable since it doesn't have
		//		to wait for the browser to compute sizes.
		var cs = computedStyle || getComputedStyle(node);
		var me = getMarginExtents(node, cs);
		var pb = getPadBorderExtents(node, cs);
		return {
			l: toPixelValue(node, cs.paddingLeft),
			t: toPixelValue(node, cs.paddingTop),
			w: mb.w - (me.w + pb.w),
			h: mb.h - (me.h + pb.h),
			sl: node.scrollLeft,
			st: node.scrollTop,
			sw: node.scrollWidth,
			sh: node.scrollHeight
		};
	};
	var setContentSize = _dom.setContentSize = domGeom.setContentSize = function(node, box, computedStyle) {
		node = byId(node);
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
		return setBox(node, {
			//t: undefined,
			//l: undefined,
			w: w,
			h: h
		});
	};
	var getBoxOfStyle = _dom.getBoxOfStyle = function(box, style){
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
	var _none = "none";
	var box2marginBox = _dom.box2marginBox = function(node, box, computedStyle) {
		node = byId(node);
		var s = computedStyle || getComputedStyle(node),
			me = getMarginExtents(node, s),
			l = box.l,
			t = box.t,
			p = node.parentNode,
			pcs;
		if(!isNaN(l) || !isNaN(t)){
			if (rias.has("mozilla")) {
				if (p && p.style) {
					pcs = getComputedStyle(p);
					if (pcs.overflow != "visible") {
						if(!isNaN(l)){
							l += pcs.borderLeftStyle != _none ? toPixelValue(node, pcs.borderLeftWidth) : 0;
						}
						if(!isNaN(t)){
							t += pcs.borderTopStyle != _none ? toPixelValue(node, pcs.borderTopWidth) : 0;
						}
					}
				}
			} else {
				if (rias.has("opera") || (rias.has("ie") == 8 && !rias.has("quirks"))) {
					if (p) {
						pcs = getComputedStyle(p);
						if(!isNaN(l)){
							l -= pcs.borderLeftStyle != _none ? toPixelValue(node, pcs.borderLeftWidth) : 0;
						}
						if(!isNaN(t)){
							t -= pcs.borderTopStyle != _none ? toPixelValue(node, pcs.borderTopWidth) : 0;
						}
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
	var marginBox2box = _dom.marginBox2box = function(node, box, computedStyle) {
		node = byId(node);
		var s = computedStyle || getComputedStyle(node),
			w = box.w,
			h = box.h,
			pb = usesBorderBox(node) ? nilExtents : getPadBorderExtents(node, s),
			mb = getMarginExtents(node, s);
		if (rias.has("webkit")) {
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
		return {
			l: box.l,
			t: box.t,
			w: w,
			h: h
		};
	};
	var getEffectiveBox = _dom.getEffectiveBox = Viewport.getEffectiveBox;
	var noOverflowCall = _dom.noOverflowCall = function(node, callback, scope){
		var vf,
			vfx,
			vfy;
		vf = getStyle(node, "overflow");
		vfx = getStyle(node, "overflow-x");
		vfy = getStyle(node, "overflow-y");
		setStyle(node, "overflow", "hidden");

		if(rias.isFunction(callback)){
			callback.apply(scope, []);
		}

		if(vf != undefined){
			setStyle(node, "overflow", vf);
		}else if(vfx == undefined && vfx == undefined){
			setStyle(node, "overflow", "");
		}else{
			if(vfx != undefined){
				setStyle(node, "overflow-x", vfx);
			}
			if(vfy != undefined){
				setStyle(node, "overflow-y", vfy);
			}
		}
	};
	var restrictBox = _dom.restrictBox = function(node, box){
		if(!box){
			return;
		}
		var s = node.style,
			style = {
				top: box.top,
				left: box.left,
				bottom: box.bottom,
				right: box.right
			};
		if(style.left && style.right){
			style.width = "auto";
		}else if(style.right){
			style.left = "auto";
		}else if(style.left){
			style.right = "auto";
		}else if(s.width){
			style.right = "";
		}
		if(style.top && style.bottom){
			style.height = "auto";
		}else if(style.bottom){
			style.top = "auto";
		}else if(style.top){
			style.bottom = "auto";
		}else if(s.height){
			style.bottom = "";
		}
		rias.compact(style);///兼容 ie8，去掉 undefined
		setStyle(node, style);
	};
	_dom.defaultRestrict = rias.theme ? rias.theme.scrollbarWidth + 1 : 18;
	var restrict = _dom.restrict = function(node, box, parentNode, restrictPadding){
		var dns,
			p, pn;
		if(!node){
			return box;
		}
		dns = node.style;
		if(!(restrictPadding >= 0)){
			restrictPadding = 0;
		}
		if(!box){
			box = getMarginBox(node);
		}
		if(!parentNode){
			parentNode = node.parentNode;
		}
		pn = parentNode || node.ownerDocumentBody || webAppNode;
		p = getContentMargin(pn);
		///FIXME:zensst. box 是 marginBox ，需要转换为 style
		noOverflowCall(pn, function(){
			///先判断 height，然后才能判断 top。
			if(box.h > p.h - restrictPadding - restrictPadding){
				box.h = p.h - restrictPadding - restrictPadding;
				if(dns){
					dns.height = box.h + "px";
				}
			}
			if(box.t < p.st + restrictPadding){
				box.t = p.st + restrictPadding;
				if(dns){
					dns.top = box.t + "px";
				}
			}
			if(box.t + box.h > p.h + p.st - restrictPadding){
				box.t = p.h + p.st - box.h - restrictPadding;
				if(dns){
					dns.top = box.t + "px";
				}
			}
			if(box.w > p.w - restrictPadding - restrictPadding){
				box.w = p.w - restrictPadding - restrictPadding;
				if(dns){
					dns.width = box.w + "px";
				}
			}
			if(box.l < p.sl + restrictPadding){
				box.l = p.sl + restrictPadding;
				if(dns){
					dns.left = box.l + "px";
				}
			}
			if(box.l + box.w > p.w + p.sl - restrictPadding){
				box.l = p.w + p.sl - box.w - restrictPadding;
				if(dns){
					dns.left = box.l + "px";
				}
			}
		});
		return box;
	};
	_dom.position = domGeom.position;
	//rias.coords = dojo.coords; /// = domGeom.position?
	_dom.isBodyLtr = domGeom.isBodyLtr;
	_dom.docScroll = domGeom.docScroll;
	_dom.getIeDocumentElementOffset = domGeom.getIeDocumentElementOffset;
	_dom.fixIeBiDiScrollLeft = domGeom.fixIeBiDiScrollLeft;

	_dom.hasClass = domClass.contains;
	_dom.containsClass = domClass.contains;
	_dom.addClass = domClass.add;
	_dom.removeClass = domClass.remove;
	///domClass.toggle(/*DomNode|String*/ node, /*String|Array*/ classStr, /*Boolean?*/ condition) 中 condition == undefined 时为实时反转
	_dom.toggleClass = domClass.toggle;
	var fakeNode = {
		nodeType: 1///_dom.byId 需要检测 nodeType
	};  // for effective replacement
	var className = "className";
	var replaceClass = _dom.replaceClass = domClass.replace = function(/*DomNode|String*/ node, /*String|Array*/ addClassStr, /*String|Array?*/ removeClassStr){
		node = byId(node);
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
	var _setOpacity = rias.has("ie") < 9 || (rias.has("ie") < 10 && rias.has("quirks")) ?
		function(/*DomNode*/ node, /*Number*/ opacity){
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

			if(node.tagName.toLowerCase() == "tr"){
				for(var td = node.firstChild; td; td = td.nextSibling){
					if(td.tagName.toLowerCase() == "td"){
						_setOpacity(td, opacity);
					}
				}
			}
			return opacity;
		} :
		function(node, opacity){
			return node.style.opacity = opacity;
		};
	var getStyle = _dom.getStyle = domStyle.get;
	var setStyle = _dom.setStyle = domStyle.set = function(/*DOMNode|String*/ node, /*String|Object*/ name, /*String?*/ value){
		var n = _dom.byId(node), l = arguments.length, op = (name == "opacity");
		name = _floatAliases[name] ? "cssFloat" in n.style ? "cssFloat" : "styleFloat" : name;
		if(l == 3){
			return op ? _setOpacity(n, value) : n.style[name] = value; // Number
		}
		for(var x in name){
			setStyle(node, x, name[x]);
		}
		return;// style.getComputedStyle(n);
	};
	var getComputedStyle = _dom.getComputedStyle = domStyle.getComputedStyle;
	var toPixelValue = _dom.toPixelValue = domStyle.toPixelValue;
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
		if(str.indexOf(";") == -1){
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
			if(kv.length == 2){
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
			str += pn + ":" + obj[pn] + ";";
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
	_dom.styleToBox = function(value){
		/// top,left,width,height 有单位（px,em,pt,...）
		value = _dom.styleToObject(value);
		return {
			t: value.top || value.t,
			l: value.left || value.l,
			w: value.width || value.w,
			h: value.height || value.h
		};
	};
	_dom.hasHeight = function(style, region){
		return (style.height && style.height !== "auto")
			|| region === "left" || region === "right" || region === "center";
	};
	_dom.hasWidth = function(style, region){
		return (style.width && style.width !== "auto")
			|| region === "top" || region === "bottom" || region === "center";
	};

	rias.tooltipPositions = [
		"below-centered", "below", "below-alt",
		"above-centered", "above", "above-alt",
		"after", "after-centered",
		"before", "before-centered",
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
		var view = getContentMargin(node.parentNode || winBody(node.ownerDocument));// getEffectiveBox(node.ownerDocument);

		// This won't work if the node is inside a <div style="position: relative">,
		// so reattach it to <body>.	 (Otherwise, the positioning will be wrong
		// and also it might get cutoff.)
		////有 parent 时也执行。注意：有 parent 时先获取正确的 choices
		//if(!node.parentNode || String(node.parentNode.tagName).toLowerCase() != "body"){
		//	basewin.body(node.ownerDocument).appendChild(node);
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
			// specifically when layoutNode() (a.k.a. Tooltip.orient()) measures natural width of Tooltip
			style = node.style;
			style.left = style.right = "auto";

			// configure node to be displayed in given position relative to button
			// (need to do this in order to get an accurate size for the node, because
			// a tooltip's size changes based on position, due to triangle)
			if(layoutNode){
				overflow = layoutNode(node, choice.aroundCorner, corner, spaceAvailable, aroundNodeCoords);
				overflow = typeof overflow == "undefined" ? 0 : overflow;
			}

			// get node's size
			oldDisplay = style.display;
			oldVis = style.visibility;
			if(style.display == "none"){
				style.visibility = "hidden";
				style.display = "";
			}
			bb = _dom.position(node);
			style.display = oldDisplay;
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
		if(node._riasrWidget){
			if(node._riasrWidget._changeSize){
				node._riasrWidget._changeSize.t = top;
				node._riasrWidget._changeSize.l = side;
			}
		}

		return best;
	}
	_dom.positionAround = place.around = function(
		/*DomNode*/		node,
		/*DomNode|dijit/place.__Rectangle*/ anchor,
		/*String[]*/	positions,
		/*Boolean*/		leftToRight,
		/*Function?*/	layoutNode){

		// If around is a DOMNode (or DOMNode id), convert to coordinates.
		var aroundNodePos;
		if(typeof anchor == "string" || "offsetWidth" in anchor || "ownerSVGElement" in anchor){
			aroundNodePos = _dom.position(anchor, true);

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
			aroundNodePos = anchor;
		}

		// Compute position and size of visible part of anchor (it may be partially hidden by ancestor nodes w/scrollbars)
		if(anchor.parentNode){
			// ignore nodes between position:relative and position:absolute
			var sawPosAbsolute = getComputedStyle(anchor).position == "absolute";
			var parent = anchor.parentNode;
			//while(parent && parent.nodeType == 1 && parent.nodeName != "BODY"){  //ignoring the body will help performance
			///增加 parent != node.parentNode，实现 node 有 parent 时也可以获取正确的 choices.
			while(parent && parent.nodeType === 1 && parent.nodeName != "BODY"){  //ignoring the body will help performance
				var parentPos = _dom.position(parent, true),
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
				if(pcs.position == "absolute"){
					sawPosAbsolute = true;
				}
				if(parent == node.parentNode){
					aroundNodePos.x = aroundNodePos.x - parentPos.x;
					aroundNodePos.y = aroundNodePos.y - parentPos.y;
					break;
				}
				parent = parent.parentNode;
			}
		}

		var x = aroundNodePos.x,
			y = aroundNodePos.y,
			width = "w" in aroundNodePos ? aroundNodePos.w : (aroundNodePos.w = aroundNodePos.width ? aroundNodePos.width : 0),
			height = "h" in aroundNodePos ? aroundNodePos.h : (aroundNodePos.h = aroundNodePos.height ? aroundNodePos.height : 0);

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
			})
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
					// To assist dijit/_base/place, accept arguments of type {aroundCorner: "BL", corner: "TL"}.
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
	_dom.positionAt = place.at = function(node, pos, corners, padding, layoutNode){
		// summary:
		//		Positions node kitty-corner to the rectangle centered at (pos.x, pos.y) with width and height of
		//		padding.x * 2 and padding.y * 2, or zero if padding not specified.  Picks first corner in corners[]
		//		where node is fully visible, or the corner where it's most visible.
		//
		//		Node is assumed to be absolutely or relatively positioned.
		// node: DOMNode
		//		The node to position
		// pos: dijit/place.__Position
		//		Object like {x: 10, y: 20}
		// corners: String[]
		//		Array of Strings representing order to try corners of the node in, like ["TR", "BL"].
		//		Possible values are:
		//
		//		- "BL" - bottom left
		//		- "BR" - bottom right
		//		- "TL" - top left
		//		- "TR" - top right
		// padding: dijit/place.__Position?
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
				aroundCorner: reverse[corner],	// so TooltipDialog.orient() gets aroundCorner argument set
				pos: {x: pos.x,y: pos.y}
			};
			if(padding){
				c.pos.x += corner.charAt(1) == 'L' ? padding.x : -padding.x;
				c.pos.y += corner.charAt(0) == 'T' ? padding.y : -padding.y;
			}
			return c;
		});

		return _riasPlace(node, choices, layoutNode);
	};
	_dom.placeTo = function(node, parent){
		//args.parent: dijit
		var parent0;
		if(rias.isString(parent)){
			parent = rias.by(parent, rias.riasrModuleBy(node));
		}
		if(rias.isDijit(node)){
			if(!node.domNode._riasrWidget && rias.isRiasw(node)){
				node.domNode._riasrWidget = node;
			}
			parent0 = node.getParent();
			if(!parent && !parent0){
				node.placeAt(webAppNode);
			}else if(parent){
				if(rias.isDijit(parent)){
					if(parent0 !== parent){
						node.placeAt(parent);
					}
				}else if(node.parentNode !== parent && rias.isDomNode(parent)){
					node.placeAt(parent);
				}
			}
			if(!node._started && node.startup){
				if(!parent || parent._started){
					node.startup();
				}
			}
			node = node.domNode;
		}else if(rias.isDomNode(node)){
			parent0 = rias.by(node.parentNode);
			if(!parent && !parent0){
				domPlace(node);
			}else if(parent){
				if(rias.isDijit(parent)){
					if(parent0 !== parent){
						domPlace(node, parent.domNode);
					}
				}else if(node.parentNode !== parent && rias.isDomNode(parent)){
					domPlace(node, parent);
				}
			}
		}
		return node.parentNode;
	};
	_dom.placeAt = function(node, args){
		//args.parent: dijit
		//args.around: dijit or domNode
		//args.positions: around:["below", "below-alt", "above", "above-alt"] or at:["MM", "TL", "TR"...]
		//args.maxHeight: Number(without "px")
		//args.padding: Number(without "px")
		//args.x: Number(without "px")
		//args.y: Number(without "px")
		args = args || {};
		var parent,
			around;
		around = rias.isDijit(args.around) ? args.around.domNode : rias.isString(args.around) ? rias.domNodeBy(args.around, rias.riasrModuleBy(node)) : args.around;
		///FIXME:zensst. parent 和 around 不同步（不在同一个 parent）时的定位问题。
		//if(rias.isDomNode(around)){
		//	args.parent = rias.byUntil(around.parentNode);
		//}
		parent = rias.byUntil(_dom.placeTo(node, args.parent));
		if(rias.isDijit(node)){
		//	parent = node.getParent();
			node = node.domNode;
		//}else if(rias.isDomNode(node)){
		//	parent = rias.by(node.parentNode);
		}
		if(!_dom.isVisible(parent, true) || (rias.isDomNode(around) && !_dom.isVisible(around, true))){
			return false;
		}
		var ltr = parent ? parent.isLeftToRight() : _dom.isBodyLtr(node.ownerDocument),
			viewport = getContentMargin(node.parentNode || winBody(node.ownerDocument));// getEffectiveBox(node.ownerDocument),

		var maxHeight,
			pos = _dom.position(node);
		if("maxHeight" in args && args.maxHeight != -1){
			maxHeight = args.maxHeight || Infinity;	// map 0 --> infinity for back-compat of _HasDropDown.maxHeight
		}else{
			//var aroundPos = around ? _dom.position(around, false) : {y: args.y - (args.padding||0), h: (args.padding||0) * 2};
			var aroundPos = rias.isDomNode(around) ? getContentMargin(around) : around ? around : {y: args.y - (args.padding||0), h: (args.padding||0) * 2};
			maxHeight = Math.floor(Math.max(aroundPos.y, viewport.h - (aroundPos.y + aroundPos.h)));
		}
		if(pos.h > maxHeight){
			// Get style of popup's border.  Unfortunately getStyle(node, "border") doesn't work on FF or IE,
			// and getStyle(node, "borderColor") etc. doesn't work on FF, so need to use fully qualified names.
			var cs = getComputedStyle(node),
				borderStyle = cs.borderLeftWidth + " " + cs.borderLeftStyle + " " + cs.borderLeftColor;
			setStyle(node, {
				overflowY: "scroll",
				height: maxHeight + "px",
				border: borderStyle	// so scrollbar is inside border
			});
		}

		pos = (around ?
			_dom.positionAround(node, around, (rias.isString(args.positions) ? [args.positions] : args.positions) || rias.tooltipPositions, ltr, null) :
			//_dom.positionAt(node, {x: viewport.w >> 1, y: viewport.h >> 1}, ["MM"], args.padding, null));
			_dom.positionAround(node, {x: viewport.w >> 1, y: viewport.h >> 1}, ["center"], ltr, null));
		maxHeight = rias.by(node);
		if(maxHeight){
			maxHeight = args.restrictPadding || maxHeight.restrictPadding;
			if(maxHeight >= 0){///默认不 restrict
				maxHeight = restrict(node, undefined, undefined, maxHeight);
				pos = rias.mixin(pos, maxHeight);
			}
		}
		return pos;
	};
	///注意：popup 是单例实例。
	popup.open = function(/*__OpenArgs*/ args, parent){
		// summary:
		//		Popup the widget at the specified position
		//
		// example:
		//		opening at the mouse position
		//		|		popup.open({popup: menuWidget, x: evt.pageX, y: evt.pageY});
		//
		// example:
		//		opening the widget as a dropdown
		//		|		popup.open({parent: this, popup: menuWidget, around: this.domNode, onClose: function(){...}});
		//
		//		Note that whatever widget called dijit/popup.open() should also listen to its own _onBlur callback
		//		(fired from _base/focus.js) to know that focus has moved somewhere else and thus the popup should be closed.

		if(!args.parent){
			args.parent = rias.webApp;
		}
		var stack = this._stack,
			widget = args.popup,
			node = widget.domNode,
			orient = args.orient || ["below", "below-alt", "above", "above-alt"],
			ltr = args.parent && args.parent.isLeftToRight ? args.parent.isLeftToRight() : _dom.isBodyLtr(widget.ownerDocument),
			around = args.around,
			id = (args.around && args.around.id) ? (args.around.id + "_dropdown") : ("popup_" + this._idGen++);

		// If we are opening a new popup that isn't a child of a currently opened popup, then
		// close currently opened popup(s).   This should happen automatically when the old popups
		// gets the _onBlur() event, except that the _onBlur() event isn't reliable on IE, see [22198].
		while(stack.length && (!args.parent || !isDescendant(args.parent.domNode, stack[stack.length - 1].widget.domNode))){
			this.close(stack[stack.length - 1].widget);
		}

		// Get pointer to popup wrapper, and create wrapper if it doesn't exist.  Remove display:none (but keep
		// off screen) so we can do sizing calculations.
		var wrapper = this.moveOffScreen(widget);
		if(parent){
			parent = _dom.placeTo(wrapper, parent);
		}

		if(widget.startup && !widget._started){
			widget.startup(); // this has to be done after being added to the DOM
		}

		// Limit height to space available in viewport either above or below aroundNode (whichever side has more
		// room), adding scrollbar if necessary. Can't add scrollbar to widget because it may be a <table> (ex:
		// dijit/Menu), so add to wrapper, and then move popup's border to wrapper so scroll bar inside border.
		var maxHeight, popupSize = _dom.position(node);
		if("maxHeight" in args && args.maxHeight != -1){
			maxHeight = args.maxHeight || Infinity;	// map 0 --> infinity for back-compat of _HasDropDown.maxHeight
		}else{
			var viewport = getEffectiveBox(this.ownerDocument),
				aroundPos = around ? _dom.position(around, false) : {y: args.y - (args.padding || 0), h: (args.padding || 0) * 2};
			maxHeight = Math.floor(Math.max(aroundPos.y, viewport.h - (aroundPos.y + aroundPos.h)));
		}
		if(popupSize.h > maxHeight){
			// Get style of popup's border.  Unfortunately domStyle.get(node, "border") doesn't work on FF or IE,
			// and domStyle.get(node, "borderColor") etc. doesn't work on FF, so need to use fully qualified names.
			var cs = getComputedStyle(node),
				borderStyle = cs.borderLeftWidth + " " + cs.borderLeftStyle + " " + cs.borderLeftColor;
			setStyle(wrapper, {
				overflowY: "scroll",
				height: maxHeight + "px",
				border: borderStyle	// so scrollbar is inside border
			});
			node._originalStyle = node.style.cssText;
			node.style.border = "none";
		}

		setAttr(wrapper, {
			id: id,
			style: {
				zIndex: this._beginZIndex + stack.length
			},
			"class": "dijitPopup " + (widget.baseClass || widget["class"] || "").split(" ")[0] + "Popup",
			dijitPopupParent: args.parent ? args.parent.id : ""
		});

		if(stack.length == 0 && around){
			// First element on stack. Save position of aroundNode and setup listener for changes to that position.
			this._firstAroundNode = around;
			this._firstAroundPosition = _dom.position(around, true);
			this._aroundMoveListener = setTimeout(rias.hitch(this, "_repositionAll"), 50);
		}

		if(rias.has("config-bgIframe") && !widget.bgIframe){
			// setting widget.bgIframe triggers cleanup in _WidgetBase.destroyRendering()
			widget.bgIframe = new BackgroundIframe(wrapper);
		}

		// position the wrapper node and make it visible
		var layoutFunc = widget.orient ? rias.hitch(widget, "orient") : null,
			best = around ?
				_dom.positionAround(wrapper, around, orient, ltr, layoutFunc) :
				_dom.positionAt(wrapper, args, orient == 'R' ? ['TR', 'BR', 'TL', 'BL'] : ['TL', 'BL', 'TR', 'BR'], args.padding,
					layoutFunc);

		wrapper.style.visibility = "visible";
		node.style.visibility = "visible";	// counteract effects from _HasDropDown

		var handlers = [];

		// provide default escape and tab key handling
		// (this will work for any widget, not just menu)
		handlers.push(on(wrapper, "keydown", rias.hitch(this, function(evt){
			if(evt.keyCode == rias.keys.ESCAPE && args.onCancel){
				evt.stopPropagation();
				evt.preventDefault();
				args.onCancel();
			}else if(evt.keyCode == rias.keys.TAB){
				evt.stopPropagation();
				evt.preventDefault();
				var topPopup = this.getTopPopup();
				if(topPopup && topPopup.onCancel){
					topPopup.onCancel();
				}
			}
		})));

		// watch for cancel/execute events on the popup and notify the caller
		// (for a menu, "execute" means clicking an item)
		if(widget.onCancel && args.onCancel){
			handlers.push(widget.on("cancel", args.onCancel));
		}

		handlers.push(widget.on(widget.onExecute ? "execute" : "change", rias.hitch(this, function(){
			var topPopup = this.getTopPopup();
			if(topPopup && topPopup.onExecute){
				topPopup.onExecute();
			}
		})));

		stack.push({
			widget: widget,
			wrapper: wrapper,
			parent: args.parent,
			onExecute: args.onExecute,
			onCancel: args.onCancel,
			onClose: args.onClose,
			handlers: handlers
		});

		if(widget.onOpen){
			// TODO: in 2.0 standardize onShow() (used by StackContainer) and onOpen() (used here)
			widget.onOpen(best);
		}

		if(args.focus && widget.focus){
			widget.focus();
		}

		maxHeight = args.restrictPadding || widget.restrictPadding;
		if(!(maxHeight < 0)){///默认需要 restrict
			restrict(wrapper, undefined, undefined, maxHeight || rias.dom.defaultRestrict || 0);
		}

		return best;
	};
	_dom.openPopup = rias.hitch(popup, popup.open);//function(/*__OpenArgs*/ args)
	_dom.closePopup = rias.hitch(popup, popup.close);//function(/*Widget?*/ popup)
	_dom.hidePopup = rias.hitch(popup, popup.hide);//function(/*Widget?*/ popup)
	_dom.getTopPopup = rias.hitch(popup, popup.getTopPopup);//function()
	//_dom.moveOffScreen = rias.hitch(popup, popup.moveOffScreen);//function(/*Widget*/ widget)///内部调用

	_dom.Viewport = Viewport;
	_dom.layoutChildren = layoutUtils.layoutChildren = function(/*DomNode*/ container, /*Object*/ dim, /*Widget[]*/ children,
																	/*String?*/ changedRegionId, /*Number?*/ changedRegionSize){
		///修改 child 缺少 region 时报错为跳过并继续。
		function capitalize(word){
			return word.substring(0,1).toUpperCase() + word.substring(1);
		}
		function size(widget, _dim){
			// size the child
			//var newSize = widget.resize ? widget.resize(_dim) : setMarginBox(widget.domNode, _dim);
			/// setMarginBox 有返回值，只能取 widget.resize
			var newSize;
			widget.resize ? newSize = widget.resize(_dim) : setMarginBox(widget.domNode, _dim);

			// record child's size
			if(newSize){
				// if the child returned it's new size then use that
				rias.mixin(widget, newSize);
			}else{
				// otherwise, call getMarginBox(), but favor our own numbers when we have them.
				// the browser lies sometimes
				rias.mixin(widget, getMarginBox(widget.domNode));
				rias.mixin(widget, _dim);
			}
		}

		children = rias.filter(children, function(item){
			return item.region != "center" && item.layoutAlign != "client";
		}).concat(rias.filter(children, function(item){
				return item.region == "center" || item.layoutAlign == "client";
			}));

		// set positions/sizes
		//_dom.addClass(container, "dijitLayoutContainer");///".dijitLayoutContainer" 会导致显示异常
		//var cs = getComputedStyle(container);
		//dim = rias.mixin({}, dim);
		///不应该设置 dim，避免强行给 child 设置 width/height，导致不能自适应
		//if(!dim){
			//dim = {};
			//dim = getContentMargin(container, cs);
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
				nodeStyle.left = (dim.l ? dim.l : 0) + "px";
				nodeStyle.top = (dim.t ? dim.t : 0) + "px";
				nodeStyle.position = "absolute";

				/// class dijitAlign* 有 overflow 设置，不推荐，还是不加载的好。
				//_dom.addClass(node, "dijitAlign" + capitalize(pos));

				// Size adjustments to make to this child widget
				var sizeSetting = {};

				// Check for optional size adjustment due to splitter drag (height adjustment for top/bottom align
				// panes and width adjustment for left/right align panes.
				if(changedRegionId && changedRegionId == child.id){
					sizeSetting[child.region == "top" || child.region == "bottom" ? "h" : "w"] = changedRegionSize;
				}

				if(pos == "leading"){
					pos = child.isLeftToRight() ? "left" : "right";
				}
				if(pos == "trailing"){
					pos = child.isLeftToRight() ? "right" : "left";
				}

				// set size && adjust record of remaining space.
				// note that setting the width of a <div> may affect its height.
				if(pos == "top" || pos == "bottom"){
					sizeSetting.w = dim.w;
					size(child, sizeSetting);
					dim.h -= child.h;
					if(pos == "top"){
						dim.t += child.h;
					}else{
						nodeStyle.top = dim.t + dim.h + "px";
					}
				}else if(pos == "left" || pos == "right"){
					sizeSetting.h = dim.h;
					size(child, sizeSetting);
					dim.w -= child.w;
					if(pos == "left"){
						dim.l += child.w;
					}else{
						nodeStyle.left = dim.l + dim.w + "px";
					}
				}else if(pos == "client" || pos == "center"){
					size(child, dim);
				}else{
					if(child.resize){
						child.resize();
					}
				}
			}else{
				///size()执行后，会设置 style，导致 child.size 固化
				//size(child, getMarginBox(child.domNode));
				if(child.resize){
					child.resize();
				}
			}
		});
		return true;
	};

	/*_dom.visible = function(widget, visiblity, display, opacity){
		widget = rias.isDomNode(widget) ? widget : (widget = rias.by(widget)) ? widget.domNode : undefined;
		if(widget){
			if(arguments.length > 1){
				setStyle(widget, "visibility", (visiblity == 0 || visiblity === "hidden" ? "hidden" : "visible"));
			}
			if(arguments.length > 2){
				setStyle(widget, "display", display);
			}
			if(arguments.length > 3){
				setStyle(widget, "opacity", opacity);
			}
			return (getStyle(widget, "visibility") === "visible" && getStyle(widget, "display") !== "none");
		}
		return undefined;
	};*/
	_dom.visible = function(widget, visiblity, opacity){
		widget = rias.isDomNode(widget) ? widget : (widget = rias.by(widget)) ? widget.domNode : undefined;
		if(widget){
			var ws;
			if(arguments.length > 1){
				ws = widget.style;
				if(visiblity != undefined){
					visiblity = !(visiblity == 0 || visiblity === "hidden");
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
			}
			///用 _isElementVisible 排除 visibility（可视性）的判断。
			//return rias.a11y._isElementShown(widget) && !_dom.hasClass(widget, "dijitHidden");
			return rias.a11y._isElementVisible(widget) && !_dom.hasClass(widget, "dijitHidden");
		}
		return undefined;
	};
	//_dom.isVisible = function(widget){
	//	widget = rias.isDomNode(widget) ? widget : (widget = rias.by(widget)) ? widget.domNode : undefined;
	//	return rias.a11y._isElementShown(widget) && !_dom.hasClass(widget, "dijitHidden");
	//};
	_dom.isVisible = function(node, checkAncestors){
		node = rias.domNodeBy(node);
		var v = node && node.parentNode && _dom.visible(node);
		if(checkAncestors){
			while(v && (node.parentNode !== node.ownerDocument) && (node = node.parentNode)){
				v = _dom.visible(node);
			}
			v = v && node && node.parentNode === node.ownerDocument;
		}
		return !!v;
	};
	_dom.disabled = function(widget, disabled){
		widget = rias.isDomNode(widget) ? widget : (widget = rias.by(widget)) ? widget.domNode : undefined;
		if(widget){
			var ws;
			if(arguments.length > 1){
				setAttr(widget, "disabled", !!disabled);
			}
			return getAttr(widget, "disabled");
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
	_dom.readOnly = function(widget, readOnly){
		widget = rias.isDomNode(widget) ? widget : (widget = rias.by(widget)) ? widget.domNode : undefined;
		if(widget){
			var ws;
			if(arguments.length > 1){
				setAttr(widget, "readOnly", !!readOnly);
			}
			return getAttr(widget, "readOnly");
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
					l = Math.round(parseFloat(bm.l)) || 0;
					t = Math.round(parseFloat(bm.t)) || 0;
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
					var bc = getContentMargin(b, bs);
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

	_dom.selection = selection;
	_dom.focusManager = focus;
	// Time of the last focusin event
	var lastFocusin;
	// Time of the last touch/mousedown or focusin event
	var lastTouchOrFocusin;
	rias.safeMixin(focus, {
		_onBlurNode: function(/*DomNode*/ node){
			// summary:
			//		Called when focus leaves a node.
			//		Usually ignored, _unless_ it *isn't* followed by touching another node,
			//		which indicates that we tabbed off the last field on the page,
			//		in which case every widget is marked inactive

			var now = (new Date()).getTime();

			// IE9+ and chrome have a problem where focusout events come after the corresponding focusin event.
			// For chrome problem see https://bugs.dojotoolkit.org/ticket/17668.
			// IE problem happens when moving focus from the Editor's <iframe> to a normal DOMNode.
			if(now < lastFocusin + 100){
				return;
			}

			// If the blur event isn't followed by a focus event, it means the user clicked on something unfocusable,
			// so clear focus.
			if(this._clearFocusTimer){
				clearTimeout(this._clearFocusTimer);
			}
			this._clearFocusTimer = setTimeout(rias.hitch(this, function(){
				this.set("prevNode", this.curNode);
				this.set("curNode", null);
			}), 0);

			// Unset timer to zero-out widget stack; we'll reset it below if appropriate.
			if(this._clearActiveWidgetsTimer){
				clearTimeout(this._clearActiveWidgetsTimer);
			}

			if(now < lastTouchOrFocusin + 100){
				// This blur event is coming late (after the call to _onTouchNode() rather than before.
				// So let _onTouchNode() handle setting the widget stack.
				// See https://bugs.dojotoolkit.org/ticket/17668
				return;
			}

			// If the blur event isn't followed (or preceded) by a focus or touch event then mark all widgets as inactive.
			this._clearActiveWidgetsTimer = setTimeout(rias.hitch(this, function(){
				delete this._clearActiveWidgetsTimer;
				this._setStack([]);
			}), 0);
		},
		_onTouchNode: function(/*DomNode*/ node, /*String*/ by){

			// Keep track of time of last focusin or touch event.
			lastTouchOrFocusin = (new Date()).getTime();

			if(this._clearActiveWidgetsTimer){
				// forget the recent blur event
				clearTimeout(this._clearActiveWidgetsTimer);
				delete this._clearActiveWidgetsTimer;
			}

			// if the click occurred on the scrollbar of a dropdown, treat it as a click on the dropdown,
			// even though the scrollbar is technically on the popup wrapper (see #10631)
			if(domClass.contains(node, "dijitPopup")){
				node = node.firstChild;
			}

			// compute stack of active widgets (ex: ComboButton --> Menu --> MenuItem)
			var newStack = [],
				newFocused = node;
			try{
				while(node){
					var popupParent = domAttr.get(node, "dijitPopupParent"),
						riasPopupParent = domAttr.get(node, "_riasrPopupParent"),
						id, widget;
					///只要有 widget，就 focus
					///widget = rias.by(node);/// rias.by 导致子节点也会定位到 widget。
					id = node.getAttribute && node.getAttribute("widgetId");
					widget = id && registry.byId(id);
					if(widget && (widget._focusStack != false) && !(by == "mouse" && widget.get("disabled"))){
						newStack.unshift(id);
					}
					if(riasPopupParent){
						widget = rias.by(riasPopupParent);
						node = widget.domNode;
					}else if(popupParent){
						node = registry.byId(popupParent).domNode;
					}else if(node.tagName && node.tagName.toLowerCase() == "body"){
						// is this the root of the document or just the root of an iframe?
						if(node === winBody()){
							// node is the root of the main document
							break;
						}
						// otherwise, find the iframe this node refers to (can't access it via parentNode,
						// need to do this trick instead). window.frameElement is supported in IE/FF/Webkit
						node = win.get(node.ownerDocument).frameElement;
					}else{
						// if this node is the root node of a widget, then add widget id to stack,
						// except ignore clicks on disabled widgets (actually focusing a disabled widget still works,
						// to support MenuItem)
						/*id = node.getAttribute && node.getAttribute("widgetId");
						widget = id && registry.byId(id);
						if(widget && (widget._focusStack != false) && !(by == "mouse" && widget.get("disabled"))){
							newStack.unshift(id);
						}*/
						node = node.parentNode;
					}
				}
			}catch(e){ /* squelch */ }

			this._setStack(newStack, by, newFocused);
		},
		_onFocusNode: function(/*DomNode*/ node){
			// summary:
			//		Callback when node is focused

			if(!node){
				return;
			}

			if(node.nodeType === 9){/// 9 是 Documnet
				// Ignore focus events on the document itself.  This is here so that
				// (for example) clicking the up/down arrows of a spinner
				// (which don't get focus) won't cause that widget to blur. (FF issue)
				return;
			}

			// Keep track of time of last focusin event.
			lastFocusin = (new Date()).getTime();

			// There was probably a blur event right before this event, but since we have a new focus,
			// forget about the blur
			if(this._clearFocusTimer){
				clearTimeout(this._clearFocusTimer);
				delete this._clearFocusTimer;
			}

			this._onTouchNode(node);

			if(node == this.curNode){
				return;
			}
			this.set("prevNode", this.curNode);
			this.set("curNode", node);
		},
		_setStack: function (newStack, by, newFocused) {
			var oldStack = this.activeStack,
				lastOldIdx = oldStack.length - 1,
				lastNewIdx = newStack.length - 1;
			if (newStack[lastNewIdx] == oldStack[lastOldIdx] && lastOldIdx === lastNewIdx) {
				/// 如果 length 不同也需要重置。
				return;
			}
			this.set("activeStack", newStack);/// activeStack 有可能会被修改，改到后面去。
			var widget, i,
				oldWidget = rias.by(oldStack[lastOldIdx]),
				//newWidget = rias.by(newStack[lastNewIdx]),
				focusableNode;
			/// 修改 dijit 原来的重置机制，允许长度不同时重置。
			/// 全部扫描一遍，排除已经 focused。
			for (i = lastOldIdx; i >= 0; i--) {
				widget = rias.by(oldStack[i]);
				if (widget && rias.isFunction(widget._setLastFocusedChild)) {
					widget._setLastFocusedChild(oldWidget);
				}
				if(widget && newStack.indexOf(oldStack[i]) < 0){
					widget._hasBeenBlurred = true;
					widget.set("focused", false);
					//console.debug("blur:", widget.id);
					if (widget._focusManager == this) {
						widget._onBlur(by);
					}
					this.emit("widget-blur", widget, by);
				}
			}
			for (i = 0; i <= lastNewIdx; i++) {
				widget = rias.by(newStack[i]);
				if(widget && oldStack.indexOf(newStack[i]) < 0){
					widget.set("focused", true);
					//console.debug("focused:", widget.id);
					if (widget._focusManager == this) {
						widget._onFocus(by);
					}
					this.emit("widget-focus", widget, by);
				}
			}
			///只处理最终的 widget
			if (newFocused && widget && rias.isFunction(widget._getFocusableNode)) {
				focusableNode = widget._getFocusableNode(newFocused);
				if(focusableNode !== newFocused){
					rias.defer(this, function(){
						_dom.focus(focusableNode);
					});
				}
			}
			//this.set("activeStack", newStack);
		},
		focus: function(/*Object|DomNode */ handle){
			if(!handle){
				return;
			}

			var node = "node" in handle ? handle.node : handle;		// because handle is either DomNode or a composite object

			if(node){
				///允许使用 dijit
				if(rias.isDijit(node)){
					/// Tree.focusNode 是 function
					node = (rias.isDomNode(node.focusNode) ? node.focusNode : node.containerNode || node.domNode);
				}
				var focusNode = (node.tagName && node.tagName.toLowerCase() == "iframe") ? node.contentWindow : node;
				if(focusNode && focusNode.focus){
					try{
						// Gecko throws sometimes if setting focus is impossible,
						// node not displayed or something like that
						focusNode.focus();
					}catch(e){/*quiet*/}
				}
				//focus._onFocusNode(node);
			}
		}
	});
	_dom.focus = focus.focus;
	rias.subscribe("focusNode", function(node){
		///subscribe("focusNode")未响应 blur，这样可以保留当前 focusNode
		_dom.focusedNodePrev = _dom.focusedNode;
		_dom.focusedNode = node;
		//console.debug(node);
	});
	/*rias.subscribe("widgetFocus", function(widget, by){
		_dom.focusedWidget = widget;
		//console.debug(node);
	});
	rias.subscribe("widgetBlur", function(widget, by){
		if(_dom.focusedWidget === widget){
			_dom.focusedWidget = undefined;
		};
		//console.debug(node);
	});*/

///dijit******************************************************************************///
	a11y._isElementVisible = function(/*Element*/ elem){
		///与 _isElementShown 的区别在于不判断 visibility（可视性）。
		return(domStyle.get(elem).display != "none")
			&& (domAttr.get(elem, "type") != "hidden");
	};
	a11y.effectiveTabIndex = function (elem) {
		/// Tree.focusNode 是 function
		//elem = rias.isDomNode(elem) ? elem : rias.isDijit(elem) ? rias.isDomNode(elem.focusNode) ? elem.focusNode : elem.domNode : undefined;
		elem = rias.domNodeBy(elem);
		if(elem){
			///disabled 和 visible 只检查自己。要允许非可见 和 readOnly 的 Node。
			//if (domAttr.get(elem, "disabled") || domAttr.get(elem, "readOnly") || !_dom.isVisible(elem, false)) {
			if (domAttr.get(elem, "disabled")) {
				return undefined;
			} else {
				if (domAttr.has(elem, "tabIndex")) {
					return +domAttr.get(elem, "tabIndex");
				} else {
					return a11y.hasDefaultTabStop(elem) ? 0 : undefined;
				}
			}
		}
		return undefined;
	};
	a11y._getTabNavigable = function(root){
		// summary:
		//		Finds descendants of the specified root node.
		// description:
		//		Finds the following descendants of the specified root node:
		//
		//		- the first tab-navigable element in document order
		//		  without a tabIndex or with tabIndex="0"
		//		- the last tab-navigable element in document order
		//		  without a tabIndex or with tabIndex="0"
		//		- the first element in document order with the lowest
		//		  positive tabIndex value
		//		- the last element in document order with the highest
		//		  positive tabIndex value
		var first, last, lowest, lowestTabindex, highest, highestTabindex, radioSelected = {};
		var arr = [];

		root = rias.domNodeBy(root);

		function radioName(node){
			// If this element is part of a radio button group, return the name for that group.
			return node && node.tagName.toLowerCase() == "input" &&
				node.type && node.type.toLowerCase() == "radio" &&
				node.name && node.name.toLowerCase();
		}

		var shown = a11y._isElementShown,
			effectiveTabIndex = a11y.effectiveTabIndex;
		var walkTree = function(/*DOMNode*/ parent){
			for(var child = parent.firstChild; child; child = child.nextSibling){
				// Skip text elements, hidden elements, and also non-HTML elements (those in custom namespaces) in IE,
				// since show() invokes getAttribute("type"), which crash on VML nodes in IE.
				if(child.nodeType != 1 || (rias.has("ie") <= 9 && child.scopeName !== "HTML") || !shown(child)){
					continue;
				}

				var tabindex = effectiveTabIndex(child);
				if(tabindex >= 0){
					if(tabindex == 0){
						if(!first){
							first = child;
						}
						last = child;
					}else if(tabindex > 0){
						if(!lowest || tabindex < lowestTabindex){
							lowestTabindex = tabindex;
							lowest = child;
						}
						if(!highest || tabindex >= highestTabindex){
							highestTabindex = tabindex;
							highest = child;
						}
					}
					var rn = radioName(child);
					if(getAttr(child, "checked") && rn){
						radioSelected[rn] = child;
					}
					arr.push(rs(child));
				}
				if(child.nodeName.toUpperCase() != 'SELECT'){
					walkTree(child);
				}
			}
		};
		if(shown(root)){
			walkTree(root);
		}
		function rs(node){
			// substitute checked radio button for unchecked one, if there is a checked one with the same name.
			return radioSelected[radioName(node)] || node;
		}

		return {
			first: rs(first),
			last: rs(last),
			lowest: rs(lowest),
			highest: rs(highest),
			all: arr
		};
	};
	a11y._getTabWidget = function(widget, prev){
		var lowestTabindex, highestTabindex, radioSelected = {};
		var arr = [];
		var node = rias.domNodeBy(widget),
			w;



		function radioName(node){
			// If this element is part of a radio button group, return the name for that group.
			return node && node.tagName.toLowerCase() == "input" &&
				node.type && node.type.toLowerCase() == "radio" &&
				node.name && node.name.toLowerCase();
		}

		var shown = a11y._isElementShown,
			effectiveTabIndex = a11y.effectiveTabIndex;
		var walkTree = function(/*DOMNode*/ parent){
			for(var child = parent.firstChild; child; child = child.nextSibling){
				// Skip text elements, hidden elements, and also non-HTML elements (those in custom namespaces) in IE,
				// since show() invokes getAttribute("type"), which crash on VML nodes in IE.
				if(child.nodeType != 1 || (rias.has("ie") <= 9 && child.scopeName !== "HTML") || !shown(child)){
					continue;
				}

				var tabindex = effectiveTabIndex(child);
				if(tabindex >= 0){
					if(tabindex == 0){
						if(!first){
							first = child;
						}
						last = child;
					}else if(tabindex > 0){
						if(!lowest || tabindex < lowestTabindex){
							lowestTabindex = tabindex;
							lowest = child;
						}
						if(!highest || tabindex >= highestTabindex){
							highestTabindex = tabindex;
							highest = child;
						}
					}
					var rn = radioName(child);
					if(getAttr(child, "checked") && rn){
						radioSelected[rn] = child;
					}
					arr.push(rs(child));
				}
				if(child.nodeName.toUpperCase() != 'SELECT'){
					walkTree(child);
				}
			}
		};
		if(shown(root)){
			walkTree(root);
		}
		function rs(node){
			// substitute checked radio button for unchecked one, if there is a checked one with the same name.
			return radioSelected[radioName(node)] || node;
		}

		return {
			first: rs(first),
			last: rs(last),
			lowest: rs(lowest),
			highest: rs(highest),
			all: arr
		};
	};

	rias.a11y = a11y;
	rias.a11yclick = a11yclick;

	rias.registry = registry;

	_WidgetBase.extend({

		gutters: false,
		liveSplitters: false,
		splitterCtor: null,//ToggleSplitter,//Splitter

		///不建议修改 set。如果需要触发 watch，则需要在 _setXXXAttr 中调用 _set()
		//set: function(name, value){
		//},
		_introspect: function(){
			this.inherited(arguments);
		},
		_applyAttributes: function(){
			this.inherited(arguments);
		},
		_attrToDom: function(/*String*/ attr, /*String*/ value, /*Object?*/ commands){

			if(this.isDestroyed()){
				return;
			}
			commands = arguments.length >= 3 ? commands : this.attributeMap[attr];

			rias.forEach(rias.isArray(commands) ? commands : [commands], function(command){

				// Get target node and what we are doing to that node
				/// this[command.node || command] 不一定存在
				//var mapNode = this[command.node || command || "domNode"];	// DOM node
				var mapNode = (this[command.node || command] || this.domNode);	// DOM node
				var type = command.type || "attribute";	// class, innerHTML, innerText, or attribute

				switch(type){
					case "attribute":
						if(rias.isFunction(value)){ // functions execute in the context of the widget
							value = rias.hitch(this, value);
						}

						// Get the name of the DOM node attribute; usually it's the same
						// as the name of the attribute in the widget (attr), but can be overridden.
						// Also maps handler names to lowercase, like onSubmit --> onsubmit
						var attrName = command.attribute ? command.attribute :
							(/^on[A-Z][a-zA-Z]*$/.test(attr) ? attr.toLowerCase() : attr);

						if(mapNode.tagName){
							// Normal case, mapping to a DOMNode.  Note that modern browsers will have a mapNode.set()
							// method, but for consistency we still call domAttr
							domAttr.set(mapNode, attrName, value);
						}else{
							// mapping to a sub-widget
							mapNode.set(attrName, value);
						}
						break;
					case "innerText":
						mapNode.innerHTML = "";
						mapNode.appendChild(this.ownerDocument.createTextNode(value));
						break;
					case "innerHTML":
						mapNode.innerHTML = value;
						break;
					case "class":
						domClass.replace(mapNode, value, this[attr]);
						break;
				}
			}, this);
		},
		postscript: function(/*Object?*/params, /*DomNode|String*/srcNodeRef){
			this.inherited(arguments);
		},
		postMixInProperties: function(){
			this._beforeUpdateSize(this.id + " - buildRendering.");
			this.inherited(arguments);
		},
		buildRendering:function () {
			if (!this.domNode) {
				this.domNode = this.srcNodeRef || this.ownerDocument.createElement("div");
			}
			if(!rias.isDomNode(this.domNode.parentNode)){
				domPlace(this.domNode, winBody(this.ownerDocument));
			}
			if(!this._riasrParent){
				this._riasrParent = rias.by(this.domNode.parentNode);
			}
			if (this.baseClass) {
				var classes = this.baseClass.split(" ");
				if (!this.isLeftToRight()) {
					classes = classes.concat(array.map(classes, function (name) {
						return name + "Rtl";
					}));
				}
				domClass.add(this.domNode, classes);
			}
		},
		postCreate: function(){
			if(this.domNode){
				this.domNode._riasrWidget = this;
			}
			this.inherited(arguments);

			this._afterUpdateSize(this.id + " - startup.");
		},
		destroyRecursive: function(/*Boolean?*/ preserveDom){
			this._beingDestroyed = true;
			//this.destroyDescendants(preserveDom);
			this.destroy(preserveDom);
		},
		destroy: function(/*Boolean*/ preserveDom){
			if(!this._destroyed && !this._riasrDestroying){
				this._riasrDestroying = true;
				this.destroyDescendants(preserveDom);
				this.uninitialize();

				function _destroy(w){
					///这里是 domNode 和 containerNode 的 remove
					if(w._riasrParent){
						rias.removeChild(w._riasrParent, w, true);
					}
					//if(w.destroyRecursive){
					//	w.destroyRecursive(preserveDom);
					//}else if(w.destroy){
					//	w.destroy(preserveDom);
					//}
					rias.destroy(w);
				}

				this.set("tooltip", "");
				///因为 destroy 中的 isolate 时，已经销毁了 domNode，无法 释放 parent，故应在这里先做处理。
				if(this._riasrParent){
					rias.removeChild(this._riasrParent, this, true);
				}

				// Back-compat, remove for 2.0
				rias.forEach(this._connects, rias.hitch(this, "disconnect"));
				rias.forEach(this._supportingWidgets, _destroy);

				// Destroy supporting widgets, but not child widgets under this.containerNode (for 2.0, destroy child widgets
				// here too).   if() statement is to guard against exception if destroy() called multiple times (see #15815).
				if(this.domNode){
					rias.forEach(rias.registry.findWidgets(this.domNode, this.containerNode), _destroy);
				}

				this.destroyRendering(preserveDom);
				rias.registry.remove(this.id);
			}
			this._riasrDestroying = false;
			this._destroyed = true;
			this.inherited(arguments);
		},
		destroyDescendants: function(/*Boolean?*/ preserveDom){
			var self = this,
				ow;
			rias.forEach(self.getChildren(), function(widget){
				ow = widget.getOwnerRiasw();
				if(!ow || ow == self){
					//if(widget._riasrParent){
					//	widget._riasrParent = undefined;
					//}
					rias.destroy(widget, preserveDom);
				}else if(ow && ow != self){
					//	widget.parentNode.removeChild(widget.domNode);
					//}
					rias.removeChild(self, widget, true);
				}
			});
		},
		startup: function(){
			if(this._started){
				return;
			}
			this._started = true;
			rias.forEach(this.getChildren(), function(obj){
				if(!obj._started && !obj._destroyed && rias.isFunction(obj.startup)){
					obj.startup();
					obj._started = true;
				}
			});
			if(this._splitterWidget && !this._splitterWidget._destroyed){
				this._splitterWidget.startup();
			}
		},

		_beforeUpdateSize: function(id){
			this.__updateSize > 0 ? this.__updateSize++ : this.__updateSize = 1;
			if(!id){
				id = this.id + " - _updateSize."
			}
			this.__updateSizes ? this.__updateSizes.push(id) : (this.__updateSizes = []).push(id);
		},
		_afterUpdateSize: function(id, doResize){
			this.__updateSize > 0 ? this.__updateSize-- : this.__updateSize = 0;
			if(!id){
				id = this.id + " - _updateSize."
			}
			this.__updateSizes ? this.__updateSizes.pop() : this.__updateSizes = [];
			///不建议自动 resize。
			if(doResize && !this.__updateSize){
				if(rias.isFunction(this.resize)){
					this.resize();
				}
			}
		},

		_setAttachClassAttr: function(value){
			for(var pn in value){
				if(value.hasOwnProperty(pn) && rias.isDomNode(this[pn]) && value[pn]){
					try{
						_dom.addClass(this[pn], value[pn]);
					}catch(e){
						console.error(e.message, rias.captureStackTrace(e), this);
					}
				}
			}
			this._set("attachClass", value);
		},
		_setAttachStyleAttr: function(value){
			for(var pn in value){
				if(value.hasOwnProperty(pn) && rias.isDomNode(this[pn]) && value[pn]){
					try{
						setStyle(this[pn], value[pn]);
					}catch(e){
						console.error(e.message, rias.captureStackTrace(e), this);
					}
				}
			}
			this._set("attachStyle", value);
		},

		restore: function(forceVisible, child){
			var self = this,
				d = rias.newDeferred(),
				dr,
				ds = true,
				parent;
			if(self.isDestroyed(true, true)){
				return d.reject(false);
			}
			if(!self.get("visible") && forceVisible){
				parent = self.getParent();
				if(parent && parent !== rias.webApp && !parent.get("visible")){
					if(rias.isFunction(parent.restore)){
						dr = parent.restore(forceVisible, self);
					}
				}
				rias.when(dr || true).always(function(){
					d.resolve(self);
				})
			}else{
				d.resolve();
			}
			return rias.when(d).always(function(result){
				return self.get("visible");
			});
		},
		_setVisibleAttr: function(value){
			this._set("visible", value);
			_dom.visible(this.domNode, value);
		},
		_getVisibleAttr: function(){
			return this.isVisible(true);
		},
		isVisible: function(checkAncestors){
			/// isVisible 需要判断 parent 是否可见
			///? self 可能是 StackPanel.child，可能在不可见 页，所以不要判断 parent 的可见性。
			return _dom.isVisible(this.domNode, checkAncestors);
		},
		_setDisabledAttr: function(value){
			value = !!value;
			this._set("disabled", value);
			setAttr(this.domNode, 'disabled', value);
			this.domNode.setAttribute("aria-disabled", value ? "true" : "false");
		},
		/*_getDisabledAttr: function(){
			return this.isDisabled(true);
		},*/
		isDisabled: function(checkAncestors){
			/// isVisible 需要判断 parent 是否可见
			///? self 可能是 StackPanel.child，可能在不可见 页，所以不要判断 parent 的可见性。
			return _dom.isDisabled(this.domNode, checkAncestors);
		},

		_getActiveChildNode: function(){
			var node = this.activeChild;
			if(rias.isDomNode(node)){
				return node;
			}else {
				node = rias.by(node, this);
				if(node){
					if(rias.isFunction(node._getFocusableNode)){
						node = node._getFocusableNode();
					}else{
						node = node.focusNode || node.domNode;
					}
				}
			}
			return node;
		},
		_setActiveChildAttr: function(node){
			this._set("activeChild", rias.by(node) || node);
		},
		//_setFocusedAttr: function(value){
		//	//console.debug(this.id, "focused", value);
		//	this.inherited(arguments);
		//},
		_setLastFocusedChild: function(widget){
			this._set("_lastFocusedNode", widget ? widget._getFocusableNode() : undefined);
		},
		_getFocusableNode: function(node){
			function _node(n){
				if(a11y.effectiveTabIndex(n) >= -1){
					return n;
				}
				return undefined;
			}
			if(!isDescendant(node, this.domNode)){
				node = undefined;
			}
			if(!rias.a11y.isFocusable(node) && this._lastFocusedNode){
				node = _node(this._lastFocusedNode);
			}
			if(!rias.a11y.isFocusable(node) && this.activeChild){
				node = _node(this._getActiveChildNode(this.activeChild));
			}
			if(!rias.a11y.isFocusable(node) || !isDescendant(node, this.domNode)){
				if(rias.isFunction(this._getFocusItems)){
					this._getFocusItems();
				}
				node = _node(this._firstFocusNode || this.focusNode || this.domNode);
			}
			this._focusableNode = node;
			return node;
		},
		isFocusable: function () {
			//return this.focus && !this.disabled && !this.readOnly && rias.a11y.isFocusable(this.focusNode || this.domNode);
			//return !!this.focus && !this.disabled && rias.a11y.isFocusable(this.focusNode || this.domNode);
			if(!this.focus || this.isDisabled() || this.isDestroyed(true)){
				return false;
			}
			var node = this._getFocusableNode();
			return a11y.effectiveTabIndex(node) >= -1;
		},
		focus: function(forceVisible){
			///如果 _focusableNode 不能 focus，则需要 focus 到 domNode。
			if(this.isFocusable()){
				//_dom.focus(this.focusNode || this.domNode);
				_dom.focus(this._focusableNode);
			}else{
				_dom.focus(this.domNode);
			}
		},

		placeAt: function(/* String|DomNode|_Widget */ reference, /* String|Int? */ position, noresize){
			//FIXME:zensst.修正position为"only"时，没有调用addChild()的错误.
			//调用addChild()主要是为了layout()
			///first|last/.test(position || "")
			var child = this,
				p = !reference.tagName && rias.registry.byId(reference);
			///某些控件的 position 可能是 Object，比如 GridContainer。
			//if(p && p.addChild && (!position || rias.isObjectSimple(position) || rias.isNumber(position) || /first|last/.test(position || ""))){
			if(p && rias.isFunction(p.addChild)){
				/// addChild() 中包含 startup()
				p.addChild(child, position, noresize);
			}else{
				//var ref = p ? (p.containerNode && !/after|before|replace/.test(position || "") ? p.containerNode : p.domNode)
				//	: byId(reference, child.ownerDocument);
				var old =child.domNode.parentNode,
					ref = p && ("domNode" in p)
					? (p.containerNode && !/after|before|replace/.test(position || "") ? p.containerNode : p.domNode)
					: byId(reference, this.ownerDocument);
				////parent 有可能是没有 addChild 的 widget
				domPlace(child.domNode, ref, position);
				child.set("_riasrParentNode", ref);
				p = child.getParent();
				child._riasrParent = p;
				if(!child._started){
					if(!p || p._started){
						child.startup();
					}
				}
			}
			return child;
		},
		on: function(/*String|Function*/ type, /*Function*/ func){
			return this.inherited(arguments);
		},
		emit: function(/*String*/ type, /*Object?*/ eventObj, /*Array?*/ callbackArgs){
			return this.inherited(arguments);
		},
		defer: function(fcn, delay, args){
			return this.inherited(arguments);
		},
		getParentNode: function(){
			return this.domNode.parentNode || webAppNode;
		}
	});
	//_Widget.extend({
	//});
	_CssStateMixin.extend({
		_applyAttributes: function(){
			// This code would typically be in postCreate(), but putting in _applyAttributes() for
			// performance: so the class changes happen before DOM is inserted into the document.
			// Change back to postCreate() in 2.0.  See #11635.

			this.inherited(arguments);

			// Monitoring changes to disabled, readonly, etc. state, and update CSS class of root node
			rias.forEach(["disabled", "readOnly", "modified", "checked", "selected", "focused", "state", "hovering", "active", "_opened"], function(attr){
				this.watch(attr, rias.hitch(this, "_setStateClass"));
			}, this);

			// Track hover and active mouse events on widget root node, plus possibly on subnodes
			for(var ap in this.cssStateNodes || {}){
				this._trackMouseState(this[ap], this.cssStateNodes[ap]);
			}
			this._trackMouseState(this.domNode, this.baseClass);

			// Set state initially; there's probably no hover/active/focus state but widget might be
			// disabled/readonly/checked/selected so we want to set CSS classes for those conditions.
			this._setStateClass();
		},
		_setStateClass: function(){
			// summary:
			//		Update the visual state of the widget by setting the css classes on this.domNode
			//		(or this.stateNode if defined) by combining this.baseClass with
			//		various suffixes that represent the current widget state(s).
			//
			// description:
			//		In the case where a widget has multiple
			//		states, it sets the class based on all possible
			//		combinations.  For example, an invalid form widget that is being hovered
			//		will be "dijitInput dijitInputInvalid dijitInputHover dijitInputInvalidHover".
			//
			//		The widget may have one or more of the following states, determined
			//		by this.state, this.checked, this.valid, and this.selected:
			//
			//		- Error - ValidationTextBox sets this.state to "Error" if the current input value is invalid
			//		- Incomplete - ValidationTextBox sets this.state to "Incomplete" if the current input value is not finished yet
			//		- Checked - ex: a checkmark or a ToggleButton in a checked state, will have this.checked==true
			//		- Selected - ex: currently selected tab will have this.selected==true
			//
			//		In addition, it may have one or more of the following states,
			//		based on this.disabled and flags set in _onMouse (this.active, this.hovering) and from focus manager (this.focused):
			//
			//		- Disabled	- if the widget is disabled
			//		- Active		- if the mouse (or space/enter key?) is being pressed down
			//		- Focused		- if the widget has focus
			//		- Hover		- if the mouse is over the widget

			// Compute new set of classes
			var baseClasses = this.baseClass ? this.baseClass.split(" ") : [],
				newStateClasses = baseClasses;

			function multiply(modifier, classes){
				newStateClasses = newStateClasses.concat(rias.map(classes || newStateClasses, function(c){
					return c + modifier;
				}), "dijit" + modifier);
			}

			if(!this.isLeftToRight()){
				// For RTL mode we need to set an addition class like dijitTextBoxRtl.
				multiply("Rtl", baseClasses);
			}

			var checkedState = this.checked == "mixed" ? "Mixed" : (this.checked ? "Checked" : "");
			if(this.checked){
				multiply(checkedState, baseClasses);
			}
			if(this.selected){
				multiply("Selected", baseClasses);
			}
			if(this._opened){
				multiply("Opened", baseClasses);
			}
			if(this.state){
				multiply(this.state, baseClasses);
			}
			if(this.modified){
				multiply("Modified", baseClasses);
			}

			if(this.disabled){
				multiply("Disabled");
			}else if(this.readOnly){
				multiply("ReadOnly");
			}else{
				if(this.active){
					multiply("Active");
				}else if(this.hovering){
					multiply("Hover");
				}
			}

			if(this.focused){
				multiply("Focused");
			}

			// Remove old state classes and add new ones.
			// For performance concerns we only write into domNode.className once.
			var tn = this.stateNode || this.domNode,
				classHash = {};	// set of all classes (state and otherwise) for node

			rias.forEach(tn.className.split(" "), function(c){
				classHash[c] = true;
			});

			if("_stateClasses" in this){
				rias.forEach(this._stateClasses, function(c){
					delete classHash[c];
				});
			}

			rias.forEach(newStateClasses, function(c){
				classHash[c] = true;
			});

			var newClasses = [];
			for(var c in classHash){
				newClasses.push(c);
			}
			tn.className = newClasses.join(" ");

			this._stateClasses = newStateClasses;
		}
	});
	rias.require([
		"rias/riasw/layout/_Gutter",
		"rias/riasw/layout/_Splitter",
		"rias/riasw/layout/ToggleSplitter"
	], function(_Gutter, _Splitter, ToggleSplitter){
		//var _cnt = 0;
		_Container.extend({

			isLayoutContainer: true,
			needLayout: true,
			//minHeight: 0,
			//minWidth: 0,
			minSize: {
				w: 0,
				h: 0
			},
			maxSize: {
				w: 0,
				h: 0
			},
			_captionHeight0: 30,
			//_actionBarHeight: 0,
			collapsedWidth: 0,
			//toggleSplitterCollapsedSize: "2em",
			//maxPadding: 60,
			restrictPadding: -1,///因为需要允许 Panel、Container 等可以在可视区外，故默认不能有 restrict
			/*restrictBox: {
			 top: "12px",
			 left: "70%",
			 bottom: "30em",
			 right: "0"
			 },*/

			buildRendering: function(){
				this._size0 = {};
				this.inherited(arguments);
				if(!this.containerNode){
					this.containerNode = this.domNode;
				}

				///没有 template 时，显式设置 focusNode。
				if(!this.focusNode){
					this.focusNode = this.containerNode;
				}

				//暂时不用
				//if(this.showCaption && this.captionNode){
				//	this._captionHeight = getMarginBox(this.captionNode).h;
				//}else{
				//	this._captionHeight = 0;
				//}

				if(this.minSize.w > 0){
					setStyle(this.domNode, "min-width", this.minSize.w);
				}
				if(this.minSize.h > 0){
					setStyle(this.domNode, "min-height", this.minSize.h);
				}
				if(this.maxSize.w > 0){
					setStyle(this.domNode, "max-width", this.maxSize.w);
				}
				if(this.maxSize.h > 0){
					setStyle(this.domNode, "max-height", this.maxSize.h);
				}
			},
			postCreate: function(){
				var self = this;
				//self.domNode.style.position = "absolute";
				///没有 template 时，显式设置 focusNode。
				//if(!self.focusNode){
				//	self.focusNode = self.containerNode;
				//}
				rias.forEach(self.baseClass.split(" "), function(c){
					_dom.addClass(self.containerNode, c + "Content");
				});

				//self._onMinSize(this.minSize);
				//self._onMaxSize(this.maxSize);
				self.inherited(arguments);
				this._initAttr(["splitter", "caption", {
				//	name: "displayState",
				//	initialize: false///在 startup 中用 initDisplayState 初始化
				//}, {
					name: "restrictPadding",
					initialize: false
				}, {
					name: "_riasrParentNode",
					initialize: true
				}, "minSize", "maxSize"]);
			},
			destroyRecursive: function(preserveDom){
				if(this.isDestroyed(false)){
					return;
				}
				rias.forEach(this.getChildren(), function(child){
					if(child._splitterWidget){
						rias.destroy(child._splitterWidget);
					}
					child._splitterWidget = undefined;
				});
				this.inherited(arguments);
			},
			destroy: function(){
				if(this._onScrollHandle){
					rias.destroy(this._onScrollHandle);
					this._onScrollHandle = undefined;
				}
				if(this._onResizeHandle){
					rias.destroy(this._onResizeHandle);
					this._onResizeHandle = undefined;
				}
				this.inherited(arguments);
			},

			startup: function(){
				if(this._started){
					return;
				}
				this.inherited(arguments);
			},

			_handleOnScroll: function(){
				var self = this;
				if(this._onScrollHandle){
					rias.destroy(this._onScrollHandle);
					this._onScrollHandle = undefined;
				}
				if(this.domNode.parentNode && this.restrictPadding >= 0){
					this._onScrollHandle = rias.on(this.domNode.parentNode, "scroll", function(){
						//_cnt++;
						//console.debug(self.id, _cnt, "parentScroll");
						rias.debounce(self.id + "_onScroll", function(){
							if(!self.isDestroyed(true, true)){
								self.resize();
							}
						}, self, 30)();
					});
				}
			},

			_onSplitter: function(value, oldValue){
				//this.splitter = !!value;
				if(this._riasrParent && this._riasrParent._setupChild){
					this._riasrParent._setupChild(this);
				}
			},
			_onMinSize: function(value, oldValue){
				setStyle(this.domNode, {
					"min-width": !this.toggleable && value.w > 0 ? value.w + "px" : "",
					"min-height": !this.toggleable && value.h > 0 ? value.h + "px" : ""
				});
				if(!rias.objLike(value, oldValue)){
					this.minSize = rias.mixinDeep(this.minSize, {
						w: value.w,
						h: value.h
					});
					this._internalResize();
				}
			},
			_onMaxSize: function(value, oldValue){
				setStyle(this.domNode, {
					"max-width": !this.toggleable && value.w > 0 ? value.w + "px" : "",
					"max-height": !this.toggleable && value.h > 0 ? value.h + "px" : ""
				});
				if(!rias.objLike(value, oldValue)){
					this.maxSize = rias.mixinDeep(this.maxSize, {
						w: value.w,
						h: value.h
					});
					this._internalResize();
				}
			},
			_onRestrictPadding: function(value, oldValue){
				this.restrictPadding = value;//(value >= 0 ? value : 0);
				this._handleOnScroll();
				if(this._started){
					this._internalResize(this._changeSize, this._resultSize);
				}
			},

			_on_riasrParentNode: function(value){
				if(this.isDestroyed(true)){
					return;
				}
				if(this._onResizeHandle){
					rias.destroy(this._onResizeHandle);
					this._onResizeHandle = undefined;
				}
				var self = this,
					parent = this.getParent();
				this._childOfLayoutWidget = parent && parent.isLayoutContainer;
				if(!this._childOfLayoutWidget){
					this.own(this._onResizeHandle = _dom.Viewport.on("resize", function(){
						//_cnt++;
						rias.debounce(self.id + "_onViewportResize", function(){
							//console.debug(self.id, _cnt, "resize");
							//console.trace();
							if(!self.isDestroyed(true, true)){
								self.resize();
							}
						}, self, 230, function(){
							//console.debug(self.id, _cnt, "resizePass");
							//console.trace();
						})();
					}));
				}
				this._handleOnScroll();
				if(value && this._started){
					this._internalResize(this._changeSize, this._resultSize);
				}
			},

			_getFocusItems: function(){
				var elems = rias.a11y._getTabNavigable(this.domNode);
				this._firstFocusNode = elems.lowest || elems.first || this.closeButtonNode || this.domNode;
				this._lastFocusNode = elems.last || elems.highest || this._firstFocusNode;
			},

			/*_isShown: function(){
			 /// isShown 只判断自己是否可见
			 ///self 可能是 StackPanel.child，可能在不可见 页，所以不要判断 parent 的可见性。
			 //var node = this.domNode;
			 //return this._wasShown && this.get("visible");
			 return this._wasShown && _dom.visible(this);
			 },*/
			getChildren: function(){
				// Override _LayoutWidget.getChildren() to only return real children, not the splitters.
				return rias.filter(this.inherited(arguments), function(widget){
					return !widget._isSplitter;
				});
			},
			_getOrderedChildren: function(){
				var self = this,
					wrappers = rias.map(this.getChildren(), function(child, idx){
						if(self._needResizeChild){
							child._needResizeChild = true;
						}
						return {
							panel: child,
							weight: [
								child.region == "center" ? Infinity : 0,
								child.layoutPriority,
								(this.design == "sidebar" ? 1 : -1) * (/top|bottom/.test(child.region) ? 1 : -1),
								idx
							]
						};
					}, this);
				wrappers.sort(function(a, b){
					var aw = a.weight, bw = b.weight;
					for(var i = 0; i < aw.length; i++){
						if(aw[i] != bw[i]){
							return aw[i] - bw[i];
						}
					}
					return 0;
				});
				return rias.map(wrappers, function(w){
					return w.panel;
				});
			},
			_layoutChildren: function(/*String?*/ changedChildId, /*Number?*/ changedChildSize){
				var cn = this.containerNode,
					cb = this._contentBox,
					childrenAndSplitters = [];
				rias.forEach(this._getOrderedChildren(), function(child){
					childrenAndSplitters.push(child);
					if(child._splitterWidget){
						childrenAndSplitters.push(child._splitterWidget);
					}
				});

				noOverflowCall(cn, function(){
					///不要传 this._contentBox，避免被修改
					_dom.layoutChildren.apply(this, [cn, cb ? floorBox({
						t: cb.t,
						l: cb.l,
						w: cb.w,
						h: cb.h
					}) : undefined, childrenAndSplitters, changedChildId, changedChildSize]);
				}, this);

			},
			_getNeedLayoutAttr: function(){
				var self = this,
					children = this.getChildren();
				return self.needLayout || rias.some(self.getChildren(), function(child){
					return child.get("needLayout");
				});
			},
			_setNeedLayoutAttr: function(value){
				value = !!value;
				if(!value){
					rias.some(this.getChildren(), function(child){
						if(child.get("needLayout")){
							value = true;
							return true;
						}
						return false;
					});
				}
				this._set("needLayout", value);
			},
			beforeLayout: function(needLayout){
				//console.debug("needLayout: " + needLayout, this.id);
				return needLayout;
			},
			_doBeforeLayout: function(box){
				if(!box){
					box = rias.dom.getMarginBox(this.domNode);
					if(!_dom.boxEqual(box, this._size0, 1)){
						this.set("needLayout", true);
					}
				}else{
					//rias.dom.floorBox(box);
					if(!box || !this._contentBox || !_dom.boxEqual(box, this._contentBox, 1)){
						this._contentBox = box;
						this.set("needLayout", true);
					}
				}
				return this.beforeLayout(this.get("needLayout") || this._needResizeChild);
			},
			_beforeLayout: function(){
				if(this.isDestroyed(true)){
					return false;
				}
				var self = this,
					box,
					node = this.domNode,
					cs,
					rg = this.region;

				noOverflowCall(node, function(){
					box = getContentMargin(node);
					if(node === self.containerNode){
						if(_dom.hasHeight(node.style, rg) || _dom.hasWidth(node.style, rg)){
							//floorBox(box);
							//box = marginBox2contentBox(node, box);
						}else{
							///如果 box != undefined 则会在 layoutChildren 时，将 child 设为 absolute，导致 containerNode 不能自适应
							box = undefined;
						}
					}else{
						noOverflowCall(self.containerNode, function(){
							if(_dom.hasHeight(node.style, rg) || _dom.hasWidth(node.style, rg)){
								node = self.containerNode;
								if(self.captionNode && self.showCaption){
									//h = (self.showCaption && self.captionNode ? self._captionHeight = getMarginBox(self.captionNode).h : self._captionHeight = 0);
									/*h = (self.showCaption && self.captionNode ?
									 //self._captionHeight = getMarginBox(self.captionNode)[(self.region == "left" || self.region == "right") ? "h" : "w"] :
									 self._captionHeight = getMarginBox(self.captionNode).h :
									 self._captionHeight = 0);*/
									box.h -= self._captionHeight;
									box.h -= ("fixedHeaderHeight" in self ? self.fixedHeaderHeight : 0);
									box.h -= ("fixedFooterHeight" in self ? self.fixedFooterHeight : 0);
								}
								if(self._actionBar){
									box.h -= getMarginBox(self._actionBar.domNode).h;
								}
								cs = getComputedStyle(node);
								floorBox(box);
								/// 为了能够自动大小，position 必须为 relative，故不应该设置 top、left
								/// 但是 containerNode 内部则需要 top 和 left
								setMarginSize(node, box, cs);
								///由于在缩小的时候，有 overflow 存在，重新获取 box 的话，导致 _contentBox 失真
								//box = getContentMargin(node);
								box = marginBox2contentBox(node, box, cs);
							}else{
								/// CaptionPanel/DialogPanel 等，如果直接设置 moduleMeta时，是设置 containerNode，所以需要继续判断 containerNode.
								node = self.containerNode;
								///如果 box != undefined 则会在 layoutChildren 时，将 child 设为 absolute，导致 containerNode 不能自适应
								if(_dom.hasHeight(node.style, rg) || _dom.hasWidth(node.style, rg)){
									box = getContentMargin(node);
									//floorBox(box);
								}else{
									box = undefined;
								}
							}
						});
					}
				});
				return self._doBeforeLayout(box);
			},
			afterLayout: function(){
			},
			layout: function(/*String?*/ changedChildId, /*Number?*/ changedChildSize){
				///有可能要用 debounce，返回值不好获取，舍弃。
				var v;
				v = this._started && !this.__updateSize && this.get("visible");
				if(!v){
					this.set("needLayout", true);
					return;
				}
				if(v = this._beforeLayout() || changedChildId){
					this._layoutChildren(changedChildId, changedChildSize);
					this.set("needLayout", false);
					this._needResizeChild = false;

					this.afterLayout();
				}
			},
			beforeResize: function(box){
				//return box;
			},
			afterResize: function(box){
			},
			_doResize: function(box){
				if(!rias.objLike(this._size0, box)){
					this._size0 = rias.mixinDeep(this._size0, box);
					//this._needPosition = false;
				}
				this.layout();
			},
			_setDomNodeSize: function(box){
				var node = this.domNode;
				setMarginBox(node, box);
				if(this.restrictBox){
					restrictBox(node, this.restrictBox);
				}
				box = getMarginBox(node);
				if(this.restrictPadding >= 0){
					box = restrict(node, box, this.getParentNode(), this.restrictPadding);
				}
				return box;
			},
			_internalResize: function(changeSize, resultSize){
				//var dt0 = new Date();
				if(this.isDestroyed(true)){
					return;
				}
				var box;
				if(!this._started || this.__updateSize || !this.get("visible")){
					//this._needResize = true;
					this._changeSize = rias.mixin(this._changeSize, changeSize);
					this._resultSize = rias.mixin(this._resultSize, resultSize);
					return;
				}
				if(this.needParentResize){
					this._parentResize();
					return;
				}
				//this.needParentResize = false;
				this._wasResized = true;
				box = rias.mixin(this._changeSize, changeSize, resultSize);
				this._changeSize = undefined;
				this._resultSize = undefined;

				this.beforeResize(box);

				box = this._setDomNodeSize(box);

				this._doResize(box);

				this.afterResize(this._size0);
				//console.debug("resize - " + this.id + " - " + (new Date() - dt0) + " ms.");
			},
			_doRestrictResize: function(){
				this._parentResize();
				this.resize();
			},
			resize: function(changeSize, resultSize){
				this._internalResize(changeSize, resultSize);
			},

			_parentResize: function(){
				var p = this._riasrParent;
				if(p && p.resize){
					if(!this.__updateSize){
						this.needParentResize = false;
						p.set("needLayout", true);
						rias.debounce(this.id + "_parentResize", function(){
							//console.debug(this.id + " _parentResize debounce callback...");
							if(p){///debounce 后，有可能 _raisrParent 改变。
								p.resize();
							}
						}, this, 260, function(){
							//console.debug(this.id + " _parentResize debounce pass...", this._widgets.length);
						})();
					}else{
						this.needParentResize = true;
					}
				}
			},

			_setupChild: function(/*dijit/_WidgetBase*/child, added, insertIndex, noresize){
				var self = this,
					region,
					ltr;
				if(this.isDestroyed(true)){
					return;
				}
				rias.forEach(self.baseClass.split(" "), function(c){
					_dom[added ? "addClass" : "removeClass"](child.domNode, c + "Child");
				});
				if(added){
					region = child.region;
					ltr = child.isLeftToRight();
					if(region == "leading"){
						region = ltr ? "left" : "right";
					}
					if(region == "trailing"){
						region = ltr ? "right" : "left";
					}
					if(region){
						// Create draggable splitter for resizing pane,
						// or alternately if splitter=false but BorderContainer.gutters=true then
						// insert dummy div just for spacing
						/// 需要 rias.by(child.id + "_splitter")
						if(child._splitterWidget){
							rias.destroy(child._splitterWidget);
							child._splitterWidget = undefined;
						}
						if(region != "center" && (child.splitter || child.gutters) && !child._splitterWidget && !rias.by(child.id + "_splitter")){
							var Splitter = child.splitter ? child.splitterCtor ? child.splitterCtor : child.splitter === "toggle" ? ToggleSplitter : _Splitter : _Gutter;
							if(rias.isString(Splitter)){
								Splitter = rias.getObject(Splitter);
							}
							var splitter = new Splitter({
								ownerRiasw: child,
								id: child.id + "_splitter",
								container: self,
								child: child,
								region: region,
								live: child.liveSplitters,
								minSize: child.minSize,
								maxSize: child.maxSize
							});
							splitter._isSplitter = true;
							child._splitterWidget = splitter;

							// Make the tab order match the visual layout by placing the splitter before or after the pane,
							// depending on where the splitter is visually compared to the pane.
							var before = region == "bottom" || region == (self.isLeftToRight() ? "right" : "left");
							domPlace(child._splitterWidget.domNode, child.domNode, before ? "before" : "after");

							// Splitters aren't added as Contained children, so we need to call startup explicitly
							if(child._started && !child._destroyed){
								child._splitterWidget.startup();
							}
						}
					}

					if(this._started){
						if(!child._started){
							child.startup();
						}
					}
				}
				///不能忽略没有 child.region 的 resize，比如 TabelPanel
				//if(!noresize && this._started && !this.isDestroyed(true) && child._started && (!rias.isInstanceOf(child, _Container) || !child.__updateSize)){
				if(!noresize && this._started && child._started){
					this.set("needLayout", true);
					this.resize();
				}
			},
			onAddChild: function(child, insertIndex, noresize){
			},
			addChild: function(/*dijit/_WidgetBase*/ child, /*int?*/ insertIndex, noresize){
				this.onAddChild.apply(this, arguments || []);
				var p = this,
					refNode = p.containerNode;
				///注意：是对 parent.containerNode 操作.
				if(rias.isNumber(insertIndex) && insertIndex > 0){
					refNode = refNode.firstChild;
					while(refNode && insertIndex > 0){
						if(refNode.nodeType === 1){
							insertIndex--;
						}
						refNode = refNode.nextSibling;
					}
					if(refNode){
						insertIndex = "before";
					}else{
						refNode = p.containerNode;
						insertIndex = "last";
					}
				}

				domPlace(child.domNode, refNode, insertIndex);
				child._riasrParent = p;
				child.set("_riasrParentNode", p.domNode);
				p._setupChild(child, true, insertIndex, noresize);
			},
			onRemoveChild: function(child){
			},
			removeChild: function(/*Widget|int*/ child, noresize){
				/// remove 不处理 owner/children
				this.onRemoveChild.apply(this, arguments || []);
				var p = this;
				if(typeof child == "number"){
					child = p.getChildren()[child];
				}
				if(child){
					if(child._riasrParent == p){
						child._riasrParent = undefined;
						child._riasrNext = undefined;
						child._riasrPrev = undefined;
					}
					var n = (child.domNode ? child.domNode : child);
					if(n && n.parentNode){
						n.parentNode.removeChild(n); // detach but don't destroy
						child.set("_riasrParentNode", undefined);
					}
					p._setupChild(child, false, undefined, noresize);
					if(child._splitterWidget){
						rias.destroy(child._splitterWidget);
						child._splitterWidget = undefined;
					}
				}
				//console.debug("removeChild - " + child.id + " - " + rias.__dt() + " ms.");
			}
		});
	});

	_WidgetsInTemplateMixin.extend({
		_beforeFillContent: function(){
			// Short circuit the parser when the template doesn't contain any widgets.  Note that checking against
			// this.templateString is insufficient because the data-dojo-type=... may appear through a substitution
			// variable, like in ConfirmDialog, where the widget is hidden inside of the ${!actionBarTemplate}.
			if(/dojoType|data-dojo-type/i.test(this.domNode.innerHTML)){
				// Before copying over content, instantiate widgets in template
				var node = this.domNode;

				if(this.containerNode && !this.searchContainerNode){
					// Tell parse call below not to look for widgets inside of this.containerNode
					this.containerNode.stopParser = true;
				}

				parser.parse(node, {
					///增加 ownerRiasw
					defaults: {
						ownerRiasw: this
					},
					noStart: !this._earlyTemplatedStartup,
					template: true,
					inherited: {dir: this.dir, lang: this.lang, textDir: this.textDir},
					propsThis: this,	// so data-dojo-props of widgets in the template can reference "this" to refer to me
					contextRequire: this.contextRequire,
					scope: "dojo"	// even in multi-version mode templates use dojoType/data-dojo-type
				}).then(rias.hitch(this, function(widgets){
						this._startupWidgets = widgets;

						// _WidgetBase::destroy() will destroy any supporting widgets under this.domNode.
						// If we wanted to, we could call this.own() on anything in this._startupWidgets that was moved outside
						// of this.domNode (like Dialog, which is moved to <body>).

						// Hook up attach points and events for nodes that were converted to widgets
						for(var i = 0; i < widgets.length; i++){
							this._processTemplateNode(widgets[i], function(n,p){
								// callback to get a property of a widget
								return n[p];
							}, function(widget, type, callback){
								// callback to do data-dojo-attach-event to a widget
								if(type in widget){
									// back-compat, remove for 2.0
									return widget.connect(widget, type, callback);
								}else{
									// 1.x may never hit this branch, but it's the default for 2.0
									return widget.on(type, callback, true);
								}
							});
						}

						// Cleanup flag set above, just in case
						if(this.containerNode && this.containerNode.stopParser){
							delete this.containerNode.stopParser;
						}
					}));

				if(!this._startupWidgets){
					throw new Error(this.declaredClass + ": parser returned unfilled promise (probably waiting for module auto-load), " +
						"unsupported by _WidgetsInTemplateMixin.   Must pre-load all supporting widgets before instantiation.");
				}
			}
		}
	});

	_FormWidgetMixin.extend({
		/*postMixInProperties: function(){
			if(!this.name && (this._riaswIdOfModule != undefined)){
				this.name = this._riaswIdOfModule;
			}
			this.inherited(arguments);
		},*/
		_setDisabledAttr: function(/*Boolean*/ value){
			value = !!value;
			this._set("disabled", value);
			setAttr(this.focusNode, 'disabled', value);
			if(this.valueNode){
				setAttr(this.valueNode, 'disabled', value);
			}
			this.focusNode.setAttribute("aria-disabled", value ? "true" : "false");

			if(value){
				// reset these, because after the domNode is disabled, we can no longer receive
				// mouse related events, see #4200
				this._set("hovering", false);
				this._set("active", false);

				// clear tab stop(s) on this widget's focusable node(s)  (ComboBox has two focusable nodes)
				var attachPointNames = "tabIndex" in this.attributeMap ? this.attributeMap.tabIndex :
					("_setTabIndexAttr" in this) ? this._setTabIndexAttr : "focusNode";
				rias.forEach(rias.isArray(attachPointNames) ? attachPointNames : [attachPointNames], function(attachPointName){
					var node = this[attachPointName];
					// complex code because tabIndex=-1 on a <div> doesn't work on FF
					if( true  || rias.a11y.hasDefaultTabStop(node)){    // see #11064 about webkit bug
						node.setAttribute('tabIndex', "-1");
					}else{
						node.removeAttribute('tabIndex');
					}
				}, this);
			}else{
				if(this.tabIndex != ""){
					this.set('tabIndex', this.tabIndex);
				}
			}
		},
		//isFocusable: function () {
		//	//return this.focus && !this.disabled && !this.readOnly && rias.a11y.isFocusable(this.focusNode || this.domNode);
		//	this.inherited(arguments);
		//},
		_handleOnChange: function(newValue, priorityChange){
			if(this._lastValueReported == undefined && (priorityChange === null || !this._onChangeActive)){
				// this block executes not for a change, but during initialization,
				// and is used to store away the original value (or for ToggleButton, the original checked state)
				this._resetValue = this._lastValueReported = newValue;
			}
			this.set("modified", this.compare(newValue, this._resetValue) != 0);
			/*var m = this.compare(newValue, this._resetValue) != 0;
			if(!m){
				this._resetValue = this.get("value");
			}
			this._set("modified", m);*/
			this._pendingOnChange = this._pendingOnChange
				|| (typeof newValue != typeof this._lastValueReported)
				|| (this.compare(newValue, this._lastValueReported) != 0);
			if((this.intermediateChanges || priorityChange || priorityChange === undefined) && this._pendingOnChange){
				this._lastValueReported = newValue;
				this._pendingOnChange = false;
				if(this._onChangeActive){
					if(this._onChangeHandle){
						this._onChangeHandle.remove();
					}
					// defer allows hidden value processing to run and
					// also the onChange handler can safely adjust focus, etc
					this._onChangeHandle = this.defer(
						function(){
							this._onChangeHandle = null;
							this.onChange(newValue);
						}); // try to collapse multiple onChange's fired faster than can be processed
				}
			}
		},

		startup: function(){
			this.inherited(arguments);
			this.set("modified", false);
		}

	});
	_FormValueMixin.extend({
		///注意：CheckBox 等是继承自 _FormWidgetMixin，需要独自扩展
		//editable: true,///还是留给 _TextBoxMixin 来 extend
		_setReadOnlyAttr: function(/*Boolean*/ value){
			if(value != undefined){
				value = !!value;
				setAttr(this.focusNode, 'readOnly', value || !this.editable);
				this._set("readOnly", value);
			}
			/// editable == false 也应该可以 focus
			//if(this.readOnly || this.editable == false){
			if(this.readOnly){
				// reset these, because after the domNode is disabled, we can no longer receive
				// mouse related events, see #4200
				this._set("hovering", false);
				this._set("active", false);

				// clear tab stop(s) on this widget's focusable node(s)  (ComboBox has two focusable nodes)
				var attachPointNames = "tabIndex" in this.attributeMap ? this.attributeMap.tabIndex :
					("_setTabIndexAttr" in this) ? this._setTabIndexAttr : "focusNode";
				rias.forEach(rias.isArray(attachPointNames) ? attachPointNames : [attachPointNames], function(attachPointName){
					var node = this[attachPointName];
					// complex code because tabIndex=-1 on a <div> doesn't work on FF
					if( true  || rias.a11y.hasDefaultTabStop(node)){    // see #11064 about webkit bug
						node.setAttribute('tabIndex', "-1");
					}else{
						node.removeAttribute('tabIndex');
					}
				}, this);
			}else{
				if(this.tabIndex != ""){
					this.set('tabIndex', this.tabIndex);
				}
			}
		},
		_setEditableAttr: function(value){
			value = !!value;
			if(this.textbox){
				setAttr(this.textbox, "readOnly", (this.readOnly || !value));
			}
			this._set("editable", !!value);
			this._setReadOnlyAttr();
		},
		_setModifiedAttr: function(value){
			value = !!value;
			if(!value){
				this._resetValue = this.get("value");
			}
			this._set("modified", value);
			//console.debug(this.id + ".modified: ", value);
		},
		reset: function(){
			// summary:
			//		Reset the widget's value to what it was at initialization time
			this._hasBeenBlurred = false;
			this._setValueAttr(this._resetValue, true);
			this.set("modified", false);
		},
		select: function(){
			if(this.textbox){
				this.textbox.select();
			}
		}
	});
	_TextBoxMixin.extend({
		editable: true,
		_onInput: function(/*Event*/ evt){

			this._processInput(evt);

			if(this.intermediateChanges){
				// allow the key to post to the widget input box
				this.defer(function(){
					this._handleOnChange(this.get('value'), false);
				});
			}else{
				//this.set("modified", this.compare(newValue, this._resetValue) != 0);
				var m = this.compare(this.get('value'), this._resetValue) != 0;
				if(!m){
					this._resetValue = this.get("value");
				}
				this._set("modified", m);
			}
		}
	});

	_AutoCompleterMixin.extend({
		_startSearch: function(/*String*/ key){
			// summary:
			//		Starts a search for elements matching key (key=="" means to return all items),
			//		and calls _openResultList() when the search completes, to display the results.
			if(!this.dropDown){
				var popupId = this.id + "_popup",
					dropDownConstructor = rias.isString(this.dropDownClass) ? rias.getObject(this.dropDownClass, false) : this.dropDownClass;
				this.dropDown = new dropDownConstructor({
					///增加 ownerRiasw
					ownerRiasw: this,
					onChange: rias.hitch(this, this._selectOption),
					id: popupId,
					dir: this.dir,
					textDir: this.textDir
				});
			}
			this._lastInput = key; // Store exactly what was entered by the user.
			this.inherited(arguments);
		},
		/*_announceOption: function(node){
			// summary:
			//		a11y code that puts the highlighted option in the textbox.
			//		This way screen readers will know what is happening in the
			//		menu.

			if(!node){
				return;
			}
			// pull the text value from the item attached to the DOM node
			var newValue;
			if(node == this.dropDown.nextButton ||
				node == this.dropDown.previousButton){
				newValue = node.innerHTML;
				this.item = undefined;
				this.value = '';
			}else{
				var item = this.dropDown.items[node.getAttribute("item")];
				///需要先设置 this.item，使得 this.get("displayedValue") 正确。
				this.set('item', item, false);
				///不转换 value.toString();
				//newValue = (this.store._oldAPI ? // remove getValue() for 2.0 (old dojo.data API)
				//	this.store.getValue(item, this.searchAttr) : item[this.searchAttr]).toString();
				newValue = this.get("displayedValue");
			}
			// get the text that the user manually entered (cut off autocompleted text)
			this.focusNode.value = this.focusNode.value.substring(0, this._lastInput.length);
			// set up ARIA activedescendant
			this.focusNode.setAttribute("aria-activedescendant", getAttr(node, "id"));
			// autocomplete the rest of the option to announce change
			this._autoCompleteText(newValue);
		},*/
		allwaysShowSearch: true,
		labelFunc: function(item, store){
			var text = "";
			try{
				store = store || this.store;
				if(this.labelAttr){
					//return (store._oldAPI ? store.getValue(this.searchAttr) + "(" + store.getValue(item, this.labelAttr) + ")" :
					//	item[this.searchAttr].toString() + "(" + item[this.labelAttr].toString() + ")");
					if(this.allwaysShowSearch == false){
						text = store && store._oldAPI ? store.getValue(item, this.labelAttr) : item[this.labelAttr];
					}else{
						text = (store && store._oldAPI ? store.getValue(item, this.labelAttr) : item[this.labelAttr])
							+ "(" + (store && store._oldAPI ? store.getValue(item, this.searchAttr) : item[this.searchAttr]) + ")";
					}
				}else{
					text = (store && store._oldAPI ? store.getValue(item, this.searchAttr) : item[this.searchAttr]);
				}
			}catch(e){
				console.error(this, "labelFunc() error: ", rias.captureStackTrace(e));
				text = this.filter(this.value, item);
			}
			return text.toString();
		},
		_setBlurValue: function(){
			// if the user clicks away from the textbox OR tabs away, set the
			// value to the textbox value
			// #4617:
			//		if value is now more choices or previous choices, revert
			//		the value
			var newvalue = this.get('displayedValue');
			var pw = this.dropDown;
			if(pw && (newvalue == pw._messages["previousMessage"] || newvalue == pw._messages["nextMessage"])){
				this._setValueAttr(this._lastValueReported, true);
			}else if(typeof this.item == "undefined"){
				// Update 'value' (ex: KY) according to currently displayed text
				this.item = null;
				//this.set('displayedValue', newvalue);
			}else{
				if(this.value != this._lastValueReported){
					this._handleOnChange(this.value, true);
				}
				this._refreshState();
			}
			///转换 displayedValue
			if(this.item){
				this.set('displayedValue', this.labelFunc(this.item));
			}else{
				this.set('displayedValue', newvalue);
			}
			// Remove aria-activedescendant since it may not be removed if they select with arrows then blur with mouse
			this.focusNode.removeAttribute("aria-activedescendant");
		},
		onSetItem: function(item){

		},
		_setItemAttr: function(/*item*/ item, /*Boolean?*/ priorityChange, displayedValue){
			var value = '';
			if(item){
				if(!displayedValue){
					displayedValue = this.store._oldAPI ? this.store.getValue(item, this.searchAttr) : item[this.searchAttr];
					//displayedValue = this.labelFunc(item);
				}
				//value = this._getValueField() != this.searchAttr ? this.store.getIdentity(item) : displayedValue;
				value = this.store && this.store._oldAPI ? this.store.getValue(item, this._getValueField()) : item[this._getValueField()];
			}
			//this._set("item", item);
			//if(item){
			//	value = (this._getValueField() ? item[this._getValueField()] : this.store.getIdentity(item));
			//}
			//this.set('value', value, priorityChange, this.get("displayedValue"), item);
			this.set('value', value, priorityChange, displayedValue, item);
			///增加 onSetItem
			this.onSetItem(item);
		},
		onSelectOption: function(){
			return true;
		},
		_selectOption: function(/*DomNode*/ target){
			// summary:
			//		Menu callback function, called when an item in the menu is selected.
			this.closeDropDown();
			if(target){
				this._announceOption(target);
			}
			this._setCaretPos(this.focusNode, this.focusNode.value.length);
			this._handleOnChange(this.value, true);
			// Remove aria-activedescendant since the drop down is no loner visible
			// after closeDropDown() but _announceOption() adds it back in
			this.focusNode.removeAttribute("aria-activedescendant");
			///增加 onSelectOption
			this.onSelectOption();
		}
	});

	/*_HasDropDown.extend({
		onCloseDropDown: function(){
			return true;
		},
		closeDropDown: function(focus){
			// summary:
			//		Closes the drop down on this widget
			// focus:
			//		If true, refocuses the button widget
			// tags:
			//		protected

			if(this._focusDropDownTimer){
				this._focusDropDownTimer.remove();
				delete this._focusDropDownTimer;
			}

			if(this._opened){
				this._popupStateNode.setAttribute("aria-expanded", "false");
				if(focus && this.focus){
					this.focus();
				}
				rias.popup.close(this.dropDown);
				this._opened = false;
			}
			this.onCloseDropDown();
		}
	});*/

	return rias;

});
