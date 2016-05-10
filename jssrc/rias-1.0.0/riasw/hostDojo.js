
//RIAStudio Client Runtime(rias) in Browser.

define([
	"rias/base/riasBase",

	"dojo/on",
	"dojo/touch",
	"dojo/keys",
	"dojo/mouse",
	"dojox/gesture/tap",
	"dojox/gesture/swipe",
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

	"dojox/mobile/_css3",
	"dojo/parser",
	"dojo/query",
	"dojo/cookie",
	"dojo/hash",
	"dojo/ready",

	"dijit/dijit",//打包出来的文件
	"dijit/_base",
	"dijit/registry",
	"dijit/a11y",
	"dijit/selection",
	"dijit/focus",
	"dijit/place",
	"dijit/Viewport",
	"dijit/layout/utils",

	"dijit/_WidgetBase",
	"dijit/_Widget",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/_FocusMixin",
	"dijit/_Container",
	"dijit/_KeyNavContainer",
	"dijit/_HasDropDown",

	"dijit/form/_TextBoxMixin",
	"dijit/form/_FormWidgetMixin",
	"dijit/form/_AutoCompleterMixin",
	"dijit/form/_FormSelectWidget",

	"rias/riasw/store/StoreBase",
	"rias/riasw/store/ObjectStore"
], function(rias, on, touch, keys, mouse, gestureTap, gestureSwipe, connect, event, basewin, win,
			_html, html, dom, domConstruct, domGeom, domClass, domStyle, domAttr, domProp,
			css3, parser, query, cookie, hash, ready,
			dijit, dijitbase, registry, a11y, selection, focus, place, Viewport, layoutUtils,
			_WidgetBase, _Widget, _WidgetsInTemplateMixin, _FocusMixin, _Container, _KeyNavContainer, _HasDropDown,
			_TextBoxMixin, _FormWidgetMixin, _AutoCompleterMixin, _FormSelectWidget,
			StoreBase, ObjectStore) {

///dom******************************************************************************///
	rias.on = on;
	rias.touch = touch;
	rias.keys = keys;
	rias.mouse = mouse;
	rias.gesture = {
		tap: gestureTap,
		swipe: gestureSwipe
	};

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
	rias.dom = {};
	rias.dom.doc = basewin.doc;
	//rias.dom.withDoc = basewin.withDoc;
	rias.dom.body = basewin.body;
	rias.dom.docBody = rias.dom.body(rias.dom.doc);
	rias.dom.webAppNode = rias.webApp ? rias.webApp.domNode : rias.dom.docBody;
	rias.dom.heads = rias.dom.doc.getElementsByTagName('head');
	rias.dom.scripts = rias.dom.doc.getElementsByTagName('script');

	//rias.dom.getWindow = win.get;
	//rias.dom.getWindowBox = win.getBox;
	rias.dom.scrollIntoView = rias.hitch(win, win.scrollIntoView);///调用了 this，需要 hitch

	rias.dom.parse = rias.hitch(parser, parser.parse);///调用了 this，需要 hitch
	rias.dom.css3 = css3;
	rias.dom.query = query;

	if(rias.has("ie")){
		rias.dom.byId = dom.byId = function(id, doc){
			if(typeof id != "string"){
				return rias.isDomNode(id) ? id : null;
			}
			var _doc = doc || rias.dom.doc,
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
		rias.dom.byId = dom.byId = function(id, doc){
			// inline'd type check.
			// be sure to return null per documentation, to match IE branch.
			id = (typeof id == "string") ? (doc || rias.dom.doc).getElementById(id) : id;
			return rias.isDomNode(id) ? id : null; // DOMNode
		};
	}
	rias.dom.isDescendant = dom.isDescendant;
	rias.dom.setSelectable = dom.setSelectable;

	rias.dom.toDom = domConstruct.toDom;
	rias.dom.domOn = function(node, eventName, ieEventName, handler){
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
	rias.dom.place = function(node, refNode, position, callback){
		if(callback){
			var loadDisconnector = rias.dom.domOn(node, "load", "onreadystatechange", function(e){
					e = e || window.event;
					var n = e.target || e.srcElement;
					if(e.type === "load" || /complete|loaded/.test(n.readyState)){
						loadDisconnector();
						errorDisconnector();
						callback && callback();
					}
				}),
				errorDisconnector = rias.dom.domOn(node, "error", "onerror", function(e){
					loadDisconnector();
					errorDisconnector();
					rias.require.signal("error", rias.mixin(new Error("injectUrl error: "), {
						src:"dojoLoader/rias.require.injectNode",
						info:[node, e]
					}));
					callback && callback();
				});
		}
		return domConstruct.place(node, refNode || rias.dom.webAppNode, position);
	};
	rias.dom.create = domConstruct.create;
	rias.dom.empty = domConstruct.empty;
	rias.dom.destroy = domConstruct.destroy;

	var nilExtents = {l: 0, t: 0, w: 0, h: 0};
	function isButtonTag(/*DomNode*/ node, tagName){
		tagName = tagName || node.tagName.toLowerCase();
		return tagName == "button" || tagName == "input" && (node.getAttribute("type") || "").toLowerCase() == "button"; // boolean
	}
	rias.dom.boxModel = domGeom.boxModel;
	rias.dom.usesBorderBox = function(/*DomNode*/ node){
		var t = node.tagName.toLowerCase();
		return domGeom.boxModel == "border-box" || t == "table" || isButtonTag(node, t); // boolean
	};
	rias.dom.getBox = function (node, computedStyle){
		node = dom.byId(node);
		var s = computedStyle || domStyle.getComputedStyle(node),
			px = domStyle.toPixelValue;
		return {
			t: px(node, s.top),
			l: px(node, s.left),
			w: px(node, s.width),
			h: px(node, s.height)
		};
	};
	rias.dom.floorBox = function(box){
		if(box){
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
		}
		return box;
	};
	rias.dom.setBox = function(node, box, /*String?*/ unit){
		unit = unit || "px";
		var r = {},
			s = node.style;
		if(!isNaN(box.l)){
			if(s.left != box.l + unit){
				s.left = box.l + unit;
				//r.__l = box.l + unit;
			}
		}
		if(!isNaN(box.t)){
			if(s.top != box.t + unit){
				s.top = box.t + unit;
				//r.__t = box.t + unit;
			}
		}
		if(box.w >= 0){

			if(s.width != box.w + unit){
				s.width = box.w + unit;
				//r.__w = box.w + unit;
			}
		}
		if(box.h >= 0){
			if(s.height != box.h + unit){
				s.height = box.h + unit;
				//r.__h = box.h + unit;
			}
		}
		return r;
	};
	rias.dom.getPadExtents = domGeom.getPadExtents;
	rias.dom.getBorderExtents = domGeom.getBorderExtents;
	rias.dom.getPadBorderExtents = domGeom.getPadBorderExtents;
	rias.dom.getMarginExtents = domGeom.getMarginExtents;
	rias.dom.getMarginSize = domGeom.getMarginSize;
	/// getMarginBox 取自身容器的大小，包括 padding 和 marging
	rias.dom.getMarginBox = domGeom.getMarginBox;
	rias.dom.getMarginBorderBox = function(/*DomNode*/ node, /*Object*/ computedStyle){
		node = dom.byId(node);
		var s = computedStyle || domStyle.getComputedStyle(node),
			pb = rias.dom.usesBorderBox(node) ? nilExtents : domGeom.getPadBorderExtents(node, s),
			mb = domGeom.getMarginExtents(node, s);
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
	rias.dom.setMarginBox = domGeom.setMarginBox = function(node, box, computedStyle) {
		node = dom.byId(node);
		var s = computedStyle || domStyle.getComputedStyle(node),
			w = box.w,
			h = box.h,
			pb = rias.dom.usesBorderBox(node) ? nilExtents : domGeom.getPadBorderExtents(node, s),
			mb = domGeom.getMarginExtents(node, s);
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
		return rias.dom.setBox(node, rias.dom.floorBox({
			l: box.l,
			t: box.t,
			w: w,
			h: h
		}));
	};
	/// getContentBox 取内容容器的大小，去掉 padding 和 marging
	rias.dom.getContentBox = domGeom.getContentBox = function(node, computedStyle){
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
		node = dom.byId(node);
		var s = computedStyle || domStyle.getComputedStyle(node),
			w = node.clientWidth, h,
			pe = domGeom.getPadExtents(node, s),
			be = domGeom.getBorderExtents(node, s);
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
			sl: node.scrollLeft,
			st: node.scrollTop,
			sw: node.scrollWidth,
			sh: node.scrollHeight
		};
	};
	rias.dom.setContentSize = domGeom.setContentSize = function(node, box, computedStyle) {
		node = dom.byId(node);
		var w = box.w, h = box.h;
		if (rias.dom.usesBorderBox(node)) {
			var pb = domGeom.getPadBorderExtents(node, computedStyle);
			if (w >= 0) {
				w += pb.w;
			}
			if (h >= 0) {
				h += pb.h;
			}
		}
		return rias.dom.setBox(node, rias.dom.floorBox({t: NaN, l: NaN, w: w, h: h}));
	};
	rias.dom.getBoxOfStyle = function(box, style){
		return box ? {
			t: box.t,
			l: box.l,
			w: style.width ? box.w : undefined,
			h: style.height ? box.h : undefined
		} : {};
	};
	rias.dom.position = domGeom.position;
	//rias.coords = dojo.coords; /// = domGeom.position?
	rias.dom.isBodyLtr = domGeom.isBodyLtr;
	rias.dom.docScroll = domGeom.docScroll;
	rias.dom.getIeDocumentElementOffset = domGeom.getIeDocumentElementOffset;
	rias.dom.fixIeBiDiScrollLeft = domGeom.fixIeBiDiScrollLeft;
	var none = "none";
	rias.dom.box2marginBox = function(node, box, computedStyle) {
		node = dom.byId(node);
		var s = computedStyle || domStyle.getComputedStyle(node),
			me = domGeom.getMarginExtents(node, s),
			l = box.l,
			t = box.t,
			p = node.parentNode,
			px = domStyle.toPixelValue,
			pcs;
		if(!isNaN(l) || !isNaN(t)){
			if (rias.has("mozilla")) {
				if (p && p.style) {
					pcs = domStyle.getComputedStyle(p);
					if (pcs.overflow != "visible") {
						if(!isNaN(l)){
							l += pcs.borderLeftStyle != none ? px(node, pcs.borderLeftWidth) : 0;
						}
						if(!isNaN(t)){
							t += pcs.borderTopStyle != none ? px(node, pcs.borderTopWidth) : 0;
						}
					}
				}
			} else {
				if (rias.has("opera") || (rias.has("ie") == 8 && !rias.has("quirks"))) {
					if (p) {
						pcs = domStyle.getComputedStyle(p);
						if(!isNaN(l)){
							l -= pcs.borderLeftStyle != none ? px(node, pcs.borderLeftWidth) : 0;
						}
						if(!isNaN(t)){
							t -= pcs.borderTopStyle != none ? px(node, pcs.borderTopWidth) : 0;
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
	rias.dom.box2contentBox = function(/*DomNode*/ node, /*Object*/ mb, /*Object*/ computedStyle){
		var cs = computedStyle || domStyle.getComputedStyle(node);
		//var me = domGeom.getMarginExtents(node, cs);
		var pe = domGeom.getPadExtents(node, cs);
		return {
			l: pe.l,
			t: pe.t,
			w: mb.w - (pe.w),
			h: mb.h - (pe.h)
		};
	};
	rias.dom.marginBox2box = function(node, box, computedStyle) {
		node = dom.byId(node);
		var s = computedStyle || domStyle.getComputedStyle(node),
			w = box.w,
			h = box.h,
			pb = rias.dom.usesBorderBox(node) ? nilExtents : domGeom.getPadBorderExtents(node, s),
			mb = domGeom.getMarginExtents(node, s);
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
	rias.dom.marginBox2contentBox = layoutUtils.marginBox2contentBox = function(/*DomNode*/ node, /*Object*/ mb, /*Object*/ computedStyle){
		// summary:
		//		Given the margin-box size of a node, return its content box size.
		//		Functions like domGeometry.contentBox() but is more reliable since it doesn't have
		//		to wait for the browser to compute sizes.
		var cs = computedStyle || domStyle.getComputedStyle(node);
		var me = domGeom.getMarginExtents(node, cs);
		var pb = domGeom.getPadBorderExtents(node, cs);
		return {
			l: domStyle.toPixelValue(node, cs.paddingLeft),
			t: domStyle.toPixelValue(node, cs.paddingTop),
			w: mb.w - (me.w + pb.w),
			h: mb.h - (me.h + pb.h)
		};
	};
	rias.dom.getEffectiveBox = Viewport.getEffectiveBox;

	rias.dom.hasClass = domClass.contains;
	rias.dom.addClass = domClass.add;
	rias.dom.removeClass = domClass.remove;
	///domClass.toggle(/*DomNode|String*/ node, /*String|Array*/ classStr, /*Boolean?*/ condition) 中 condition == undefined 时为实时反转
	rias.dom.toggleClass = domClass.toggle;
	var fakeNode = {
		nodeType: 1///rias.dom.byId 需要检测 nodeType
	};  // for effective replacement
	var className = "className";
	rias.dom.replaceClass = domClass.replace = function (/*DomNode|String*/ node, /*String|Array*/ addClassStr, /*String|Array?*/ removeClassStr){
		node = rias.dom.byId(node);
		fakeNode[className] = node[className];
		domClass.remove(fakeNode, removeClassStr);
		domClass.add(fakeNode, addClassStr);
		if(node[className] !== fakeNode[className]){
			node[className] = fakeNode[className];
		}
	};

	rias.dom.getAttr = domAttr.get;
	rias.dom.setAttr = domAttr.set;
	rias.dom.hasAttr = domAttr.has;
	rias.dom.removeAttr = domAttr.remove;
	rias.dom.getNodeProp = domAttr.getNodeProp;

	rias.dom.getProp = domProp.get;
	rias.dom.setProp = domProp.set;

	rias.dom.getStyle = domStyle.get;
	rias.dom.setStyle = domStyle.set;
	rias.dom.getComputedStyle = domStyle.getComputedStyle;
	rias.dom.toPixelValue = domStyle.toPixelValue;
	rias.dom._allStyles = [
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
	rias.dom._allRootStyles = [
		"border", "verticalAlign", "backgroundColor", "top", "right", "bottom", "left", "position", "width", "height",
		"margin", "marginTop", "marginBottom", "marginRight", "marginLeft",
		"padding", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight",
		"borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "borderTopStyle", "borderRightStyle", "borderBottomStyle", "borderLeftStyle",
		"zIndex", "overflowX", "overflowY", "float", "clear"
	];
	rias.dom.styleFromString = function(str){
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
	rias.dom.styleToString = function(obj) {
		if(rias.isString(obj)){
			return obj;
		}
		var str = "", pn;
		for(pn in obj){
			str += pn + ":" + obj[pn] + ";";
		}
		return str;
	};
	rias.dom.styleToObject = function(value){
		if(rias.isString(value)){
			return rias.dom.styleFromString(value);
		}else if(rias.isObjectSimple(value)){
			return value;
		}
		return {};
	};
	rias.dom.styleToBox = function(value){
		/// top,left,width,height 有单位（px,em,pt,...）
		value = rias.dom.styleToObject(value);
		return {
			t: value.top || value.t,
			l: value.left || value.l,
			w: value.width || value.w,
			h: value.height || value.h
		};
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
		var view = rias.dom.getContentBox(node.parentNode || rias.dom.body(node.ownerDocument));// Viewport.getEffectiveBox(node.ownerDocument);

		// This won't work if the node is inside a <div style="position: relative">,
		// so reattach it to <body>.	 (Otherwise, the positioning will be wrong
		// and also it might get cutoff.)
		////有 parent 时也执行。注意：有 parent 时先获取正确的 choices
		//if(!node.parentNode || String(node.parentNode.tagName).toLowerCase() != "body"){
		//	win.body(node.ownerDocument).appendChild(node);
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
			bb = rias.dom.position(node);
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
			body = rias.dom.body(node.ownerDocument);

		if(/relative|absolute/.test(rias.dom.getStyle(body, "position"))){
			// compensate for margin on <body>, see #16148
			top -= rias.dom.getStyle(body, "marginTop");
			side -= rias.dom.getStyle(body, "marginLeft");
		}

		style = node.style;
		style.top = top + "px";
		style.left = side + "px";
		style.right = "auto";	// needed for FF or else tooltip goes to far left

		return best;
	}
	function _riasPlaceAround(
		/*DomNode*/		node,
		/*DomNode|dijit/place.__Rectangle*/ anchor,
		/*String[]*/	positions,
		/*Boolean*/		leftToRight,
		/*Function?*/	layoutNode){

		// If around is a DOMNode (or DOMNode id), convert to coordinates.
		var aroundNodePos;
		if(typeof anchor == "string" || "offsetWidth" in anchor || "ownerSVGElement" in anchor){
			aroundNodePos = rias.dom.position(anchor, true);

			// For above and below dropdowns, subtract width of border so that popup and aroundNode borders
			// overlap, preventing a double-border effect.  Unfortunately, difficult to measure the border
			// width of either anchor or popup because in both cases the border may be on an inner node.
			if(/^(above|below)/.test(positions[0])){
				var anchorBorder = rias.dom.getBorderExtents(anchor),
					anchorChildBorder = anchor.firstChild ? rias.dom.getBorderExtents(anchor.firstChild) : {t:0,l:0,b:0,r:0},
					nodeBorder =  rias.dom.getBorderExtents(node),
					nodeChildBorder = node.firstChild ? rias.dom.getBorderExtents(node.firstChild) : {t:0,l:0,b:0,r:0};
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
			var sawPosAbsolute = rias.dom.getComputedStyle(anchor).position == "absolute";
			var parent = anchor.parentNode;
			//while(parent && parent.nodeType == 1 && parent.nodeName != "BODY"){  //ignoring the body will help performance
			///增加 parent != node.parentNode，实现 node 有 parent 时也可以获取正确的 choices.
			while(parent && parent.nodeType == 1 && parent.nodeName != "BODY"){  //ignoring the body will help performance
				var parentPos = rias.dom.position(parent, true),
					pcs = rias.dom.getComputedStyle(parent);
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
	}
	rias.dom.placeTo = function(node, args){
		//args.parent: dijit
		//args.around: dijit or domNode
		//args.positions: around:["below", "below-alt", "above", "above-alt"] or at:["MM", "TL", "TR"...]
		//args.maxHeight: Number(without "px")
		//args.padding: Number(without "px")
		//args.x: Number(without "px")
		//args.y: Number(without "px")
		var parent,
			_parent;
		args = args || {};
		_parent = args.parent;
		if(rias.isString(_parent)){
			_parent = rias.by(_parent, rias.riasrModuleBy(node));
		}
		if(rias.isDijit(node)){
			if(!node.domNode._riasrWidget && rias.isRiasw(node)){
				node.domNode._riasrWidget = node;
			}
			parent = node.getParent();
			if(!_parent && !parent){
				node.placeAt(rias.dom.webAppNode);
			}else if(_parent){
				if(rias.isDijit(_parent)){
					if(parent !== _parent){
						node.placeAt(_parent);
					}
				}else if(node.parentNode !== _parent && rias.isDomNode(_parent)){
					node.placeAt(_parent);
				}
			}
			if(!node._started && node.startup){
				if(!_parent || _parent._started){
					node.startup();
				}
			}
			node = node.domNode;
		}else if(rias.isDomNode(node)){
			parent = rias.by(node.parentNode);
			if(!_parent && !parent){
				rias.dom.place(node);
			}else if(_parent){
				if(rias.isDijit(_parent)){
					if(parent !== _parent){
						rias.dom.place(node, _parent.domNode);
					}
				}else if(node.parentNode !== _parent && rias.isDomNode(_parent)){
					rias.dom.place(node, _parent);
				}
			}
		}
		return node.parentNode;
	};
	rias.dom.positionAt = function(node, args){
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
		parent = rias.byUntil(rias.dom.placeTo(node, args));
		if(rias.isDijit(node)){
		//	parent = node.getParent();
			node = node.domNode;
		//}else if(rias.isDomNode(node)){
		//	parent = rias.by(node.parentNode);
		}
		if(!rias.dom.isVisible(parent, true) || (rias.isDomNode(around) && !rias.dom.isVisible(around, true))){
			return false;
		}
		var ltr = parent ? parent.isLeftToRight() : rias.dom.isBodyLtr(node.ownerDocument),
			viewport = rias.dom.getContentBox(node.parentNode || rias.dom.body(node.ownerDocument));// Viewport.getEffectiveBox(node.ownerDocument),

		var maxHeight,
			pos = rias.dom.position(node);
		if("maxHeight" in args && args.maxHeight != -1){
			maxHeight = args.maxHeight || Infinity;	// map 0 --> infinity for back-compat of _HasDropDown.maxHeight
		}else{
			//var aroundPos = around ? rias.dom.position(around, false) : {y: args.y - (args.padding||0), h: (args.padding||0) * 2};
			var aroundPos = rias.isDomNode(around) ? rias.dom.getContentBox(around) : around ? around : {y: args.y - (args.padding||0), h: (args.padding||0) * 2};
			maxHeight = Math.floor(Math.max(aroundPos.y, viewport.h - (aroundPos.y + aroundPos.h)));
		}
		if(pos.h > maxHeight){
			// Get style of popup's border.  Unfortunately rias.dom.getStyle(node, "border") doesn't work on FF or IE,
			// and rias.dom.getStyle(node, "borderColor") etc. doesn't work on FF, so need to use fully qualified names.
			var cs = rias.dom.getComputedStyle(node),
				borderStyle = cs.borderLeftWidth + " " + cs.borderLeftStyle + " " + cs.borderLeftColor;
			rias.dom.setStyle(node, {
				overflowY: "scroll",
				height: maxHeight + "px",
				border: borderStyle	// so scrollbar is inside border
			});
		}

		pos = (around ?
			_riasPlaceAround(node, around, (rias.isString(args.positions) ? [args.positions] : args.positions) || rias.tooltipPositions, ltr, null) :
			//rias.placeAt(node, {x: viewport.w >> 1, y: viewport.h >> 1}, ["MM"], args.padding, null));
			_riasPlaceAround(node, {x: viewport.w >> 1, y: viewport.h >> 1}, ["center"], ltr, null));
		return pos;
	};

	rias.dom.Viewport = Viewport;
	rias.dom.layoutChildren = layoutUtils.layoutChildren = function(/*DomNode*/ container, /*Object*/ dim, /*Widget[]*/ children,
																	/*String?*/ changedRegionId, /*Number?*/ changedRegionSize){
		///修改 child 缺少 region 时报错为跳过并继续。
		function capitalize(word){
			return word.substring(0,1).toUpperCase() + word.substring(1);
		}
		function size(widget, _dim){
			// size the child
			//var newSize = widget.resize ? widget.resize(_dim) : rias.dom.setMarginBox(widget.domNode, _dim);
			/// rias.dom.setMarginBox 有返回值，只能取 widget.resize
			var newSize;
			widget.resize ? newSize = widget.resize(_dim) : rias.dom.setMarginBox(widget.domNode, _dim);

			// record child's size
			if(newSize){
				// if the child returned it's new size then use that
				rias.mixin(widget, newSize);
			}else{
				// otherwise, call getMarginBox(), but favor our own numbers when we have them.
				// the browser lies sometimes
				rias.mixin(widget, rias.dom.getMarginBox(widget.domNode));
				rias.mixin(widget, _dim);
			}
		}

		children = rias.filter(children, function(item){ return item.region != "center" && item.layoutAlign != "client"; })
			.concat(rias.filter(children, function(item){ return item.region == "center" || item.layoutAlign == "client"; }));

		// set positions/sizes
		//rias.dom.addClass(container, "dijitLayoutContainer");///".dijitLayoutContainer" 会导致显示异常
		//var cs = rias.dom.getComputedStyle(container);
		//dim = rias.mixin({}, dim);
		if(!dim){
			//dim = {};//rias.dom.getContentBox(container);
		}
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

				rias.dom.addClass(node, "dijitAlign" + capitalize(pos));

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
				//size(child, rias.dom.getMarginBox(child.domNode));
				if(child.resize){
					child.resize();
				}
			}
		});
		return true;
	};

	/*rias.dom.visible = function(widget, visiblity, display, opacity){
		widget = rias.isDomNode(widget) ? widget : (widget = rias.by(widget)) ? widget.domNode : undefined;
		if(widget){
			if(arguments.length > 1){
				rias.dom.setStyle(widget, "visibility", (visiblity == 0 || visiblity === "hidden" ? "hidden" : "visible"));
			}
			if(arguments.length > 2){
				rias.dom.setStyle(widget, "display", display);
			}
			if(arguments.length > 3){
				rias.dom.setStyle(widget, "opacity", opacity);
			}
			return (rias.dom.getStyle(widget, "visibility") === "visible" && rias.dom.getStyle(widget, "display") !== "none");
		}
		return undefined;
	};*/
	rias.dom.visible = function(widget, visiblity, opacity){
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
			//ws = domStyle.getComputedStyle(widget);// widget.style;
			//return ((ws.visibility === "visible" || ws.visibility === "") && ws.display !== "none");
			return rias.a11y._isElementShown(widget) && !rias.dom.hasClass(widget, "dijitHidden");
		}
		return undefined;
	};
	//rias.dom.isVisible = function(widget){
	//	widget = rias.isDomNode(widget) ? widget : (widget = rias.by(widget)) ? widget.domNode : undefined;
	//	return rias.a11y._isElementShown(widget) && !rias.dom.hasClass(widget, "dijitHidden");
	//};
	rias.dom.isVisible = function(node, checkAncestors){
		node = rias.domNodeBy(node);
		var v = node && node.parentNode && rias.dom.visible(node);
		if(checkAncestors){
			while(v && (node.parentNode !== node.ownerDocument) && (node = node.parentNode)){
				v = rias.dom.visible(node);
			}
			v = v && node && node.parentNode === node.ownerDocument;
		}
		return !!v;
	};
	rias.dom.disabled = function(widget, disabled){
		widget = rias.isDomNode(widget) ? widget : (widget = rias.by(widget)) ? widget.domNode : undefined;
		if(widget){
			var ws;
			if(arguments.length > 1){
				rias.dom.setAttr(widget, "disabled", !!disabled);
			}
			return rias.dom.getAttr(widget, "disabled");
		}
		return undefined;
	};
	rias.dom.isDisabled = function(node, checkAncestors){
		node = rias.domNodeBy(node);
		var v = node && node.parentNode && rias.dom.disabled(node);
		if(checkAncestors){
			while(v && (node.parentNode !== node.ownerDocument) && (node = node.parentNode)){
				v = rias.dom.disabled(node);
			}
			v = v && node && node.parentNode === node.ownerDocument;
		}
		return !!v;
	};

	rias.dom.selection = selection;
	rias.dom.focusManager = focus;
	focus._setStack = function (newStack, by, newFocused) {
		var oldStack = this.activeStack, lastOldIdx = oldStack.length - 1, lastNewIdx = newStack.length - 1;
		if (newStack[lastNewIdx] == oldStack[lastOldIdx] && lastOldIdx === lastNewIdx) {
			/// 如果 length 不同也需要重置。
			return;
		}
		this.set("activeStack", newStack);
		var widget, i;
		/// 修改 dijit 原来的重置机制，允许长度不同时重置。
		/// 全部扫描一遍，排除已经 focused。
		for (i = lastOldIdx; i >= 0; i--) {
			if(newStack.indexOf(oldStack[i]) < 0){
				widget = rias.registry.byId(oldStack[i]);
				if (widget) {
					widget._hasBeenBlurred = true;
					widget.set("focused", false);
					if (widget._focusManager == this) {
						widget._onBlur(by, newFocused);
					}
					this.emit("widget-blur", widget, by);
				}
			}
		}
		for (i = 0; i <= lastNewIdx; i++) {
			if(oldStack.indexOf(newStack[i]) < 0){
				widget = rias.registry.byId(newStack[i]);
				if (widget) {
					widget.set("focused", true);
					if (widget._focusManager == this) {
						widget._onFocus(by, newFocused);
					}
					this.emit("widget-focus", widget, by);
				}
			}
		}
	};
	rias.dom.focus = focus.focus = function(/*Object|DomNode */ handle){
		if(!handle){
			return;
		}

		var node = "node" in handle ? handle.node : handle,		// because handle is either DomNode or a composite object
			bookmark = handle.bookmark,
			openedForWindow = handle.openedForWindow,
			collapsed = bookmark ? bookmark.isCollapsed : false;

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
			focus._onFocusNode(node);
		}

		if(bookmark && win.withGlobal(openedForWindow || win.global, dijit.isCollapsed) && !collapsed){
			if(openedForWindow){
				openedForWindow.focus();
			}
			try{
				win.withGlobal(openedForWindow || win.global, dijit.moveToBookmark, null, [bookmark]);
			}catch(e2){
				/*squelch IE internal error, see http://trac.dojotoolkit.org/ticket/1984 */
			}
		}
	};
	rias.subscribe("focusNode", function(node){
		///subscribe("focusNode")未响应 blur，这样可以保留当前 focusNode
		rias.dom.focusedNodePrev = rias.dom.focusedNode;
		rias.dom.focusedNode = node;
		//console.debug(node);
	});
	/*rias.subscribe("widgetFocus", function(widget, by){
		rias.dom.focusedWidget = widget;
		//console.debug(node);
	});
	rias.subscribe("widgetBlur", function(widget, by){
		if(rias.dom.focusedWidget === widget){
			rias.dom.focusedWidget = undefined;
		};
		//console.debug(node);
	});*/

///dijit******************************************************************************///
	rias.a11y = a11y;
	a11y.effectiveTabIndex = function (elem, checkAncestors) {
		/// Tree.focusNode 是 function
		//elem = rias.isDomNode(elem) ? elem : rias.isDijit(elem) ? rias.isDomNode(elem.focusNode) ? elem.focusNode : elem.domNode : undefined;
		elem = rias.domNodeBy(elem);
		if (elem && (domAttr.get(elem, "disabled") || domAttr.get(elem, "readOnly") || !rias.dom.isVisible(elem, checkAncestors))) {
			return undefined;
		} else {
			if (domAttr.has(elem, "tabIndex")) {
				return +domAttr.get(elem, "tabIndex");
			} else {
				return a11y.hasDefaultTabStop(elem) ? 0 : undefined;
			}
		}
	};
	a11y.isTabNavigable = function (elem, checkAncestors) {
		return a11y.effectiveTabIndex(elem, checkAncestors) >= 0;
	};
	a11y.isFocusable = function (elem, checkAncestors) {
		return rias.dom.isVisible(elem, checkAncestors) && !rias.dom.isDisabled(elem, checkAncestors) &&
			(a11y.effectiveTabIndex(elem, checkAncestors) >= -1);
	};
	rias.registry = registry;

	_WidgetBase.extend({
		/*own: function(position, handles){
			var self = this,
				hds = this.inherited(arguments);
			if(!rias.isRiaswModule(this)){
				rias.forEach(hds, function(handle){
					if(rias.isRiasw(handle)){
						console.warn(handle.id + "'s owner is not a Module.", handle, self);
					}
				});
			}
			return hds;
		},*/
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
			// summary:
			//		Reflect a widget attribute (title, tabIndex, duration etc.) to
			//		the widget DOM, as specified by commands parameter.
			//		If commands isn't specified then it's looked up from attributeMap.
			//		Note some attributes like "type"
			//		cannot be processed this way as they are not mutable.
			// attr:
			//		Name of member variable (ex: "focusNode" maps to this.focusNode) pointing
			//		to DOMNode inside the widget, or alternately pointing to a subwidget
			// tags:
			//		private

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
			this.inherited(arguments);
		},
		buildRendering:function () {
			if (!this.domNode) {
				this.domNode = this.srcNodeRef || this.ownerDocument.createElement("div");
			}
			if(!this.domNode.parentNode){
				rias.dom.place(this.domNode, rias.dom.body(this.ownerDocument));
			}
			this._riasrParent = this._riasrParent || rias.by(this.domNode.parentNode);
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
		},
		destroy: function(/*Boolean*/ preserveDom){
			if(!this._destroyed && !this._riasrDestroying){
				this._riasrDestroying = true;
				this.uninitialize();

				function destroy(w){
					///这里是 domNode 和 containerNode 的 remove
					if(w._riasrParent){
						rias.removeChild(w._riasrParent, w);
					}
					if(w.destroyRecursive){
						w.destroyRecursive(preserveDom);
					}else if(w.destroy){
						w.destroy(preserveDom);
					}
				}

				// Back-compat, remove for 2.0
				rias.forEach(this._connects, rias.hitch(this, "disconnect"));
				rias.forEach(this._supportingWidgets, destroy);

				///这里是不管是否有 domNode 都 remove
				if(this._riasrParent){
					rias.removeChild(this._riasrParent, this);
				}
				// Destroy supporting widgets, but not child widgets under this.containerNode (for 2.0, destroy child widgets
				// here too).   if() statement is to guard against exception if destroy() called multiple times (see #15815).
				if(this.domNode){
					rias.forEach(rias.registry.findWidgets(this.domNode, this.containerNode), destroy);
				}

				this.destroyRendering(preserveDom);
				rias.registry.remove(this.id);
			}
			this._riasrDestroying = false;
			this._destroyed = true;
			this.inherited(arguments);
		},
		destroyDescendants: function(/*Boolean?*/ preserveDom){
			var self = this;
			rias.forEach(self.getChildren(), function(widget){
				if(!widget._riasrOwner || widget._riasrOwner == self){
					if(widget._riasrParent){
						widget._riasrParent = undefined;
					}
					rias.destroy(widget, preserveDom);
				}else if(widget._riasrOwner && widget._riasrOwner != self){
					//	widget.parentNode.removeChild(widget.domNode);
					//}
					rias.removeChild(self, widget);
				}
			});
		},
		_setVisibleAttr: function(value){
			value = !!value;
			this._set("visible", value);
			rias.dom.visible(this.domNode, value);
		},
		_getVisibleAttr: function(){
			return this.isVisible(true);
		},
		isVisible: function(checkAncestors){
			/// isVisible 需要判断 parent 是否可见
			///? self 可能是 StackContainer.child，可能在不可见 页，所以不要判断 parent 的可见性。
			return rias.dom.isVisible(this.domNode, checkAncestors);
		},
		focus: function(){
			if(this.isFocusable()){
				rias.dom.focus(this.focusNode || this.domNode);
			}
		},
		isFocusable: function () {
			//return this.focus && !this.disabled && !this.readOnly && rias.a11y.isFocusable(this.focusNode || this.domNode);
			return !!this.focus && !this.disabled && rias.a11y.isFocusable(this.focusNode || this.domNode);
		},
		placeAt: function(/* String|DomNode|_Widget */ reference, /* String|Int? */ position){
			//FIXME:zensst.修正position为"only"时，没有调用addChild()的错误.
			//调用addChild()主要是为了layout()
			///first|last/.test(position || "")
			var child = this,
				p = !reference.tagName && rias.registry.byId(reference);
			//if(child._riasrParent){
			//	rias.removeChild(child._riasrParent, child);
			//}
			///某些控件的 position 可能是 Object，比如 GridContainer。
			//if(p && p.addChild && (!position || rias.isObjectSimple(position) || rias.isNumber(position) || /first|last/.test(position || ""))){
			if(p && p.addChild && (!position || rias.isObjectSimple(position) || rias.isNumber(position))){
				////移到 rias.orphan() 处理
				////有些控件在 removeChild() 的时候会 destroy(), 比如 StackContainer，所以不能 removeChild()
				//if(p.removeChild && p != child.(parent)){
				//	p.removeChild(child);
				//}
				p.addChild(child, position);
				///这里还是不处理好些，放到 addChild 中处理，与 removeChild 配对。
				//child._riasrParent = p;
				/// addChild() 中包含 startup()
				//child.startup();
			}else{
				//var ref = p ? (p.containerNode && !/after|before|replace/.test(position || "") ? p.containerNode : p.domNode)
				//	: rias.dom.byId(reference, child.ownerDocument);
				var old =child.domNode.parentNode,
					ref = p && ("domNode" in p)
					? (p.containerNode && !/after|before|replace/.test(position || "") ? p.containerNode : p.domNode)
					: rias.dom.byId(reference, this.ownerDocument);
				////parent 有可能是没有 addChild 的 widget
				//rias.orphan(child);
				//rias.own(ref, child, position);
				rias.dom.place(child.domNode, ref, position);
				//if(child._onParentNodeChanged){
				//	child._onParentNodeChanged();
				//}
				child.set("riasrParentNode", ref);
				p = child.getParent();
				child._riasrParent = p;
				if(!child._started){
					if(!p || p._started){
						child.startup();
					}
				}
			}
			return child;
			//},
			//getChildrenRiasw: function(/*Boolean*/onlyDijit){
			//	return rias.filter(this._riasrChildren, function(node){
			//		return !onlyDijit || (node && rias.isDijit(node));
			//	});
			//},
			//getParentRiasw: function(/*Boolean*/onlyDijit){
			//	var node = this._riasrOwner;
			//	if(!onlyDijit || (rias.isDijit(node))){
			//		return node;
			//	}
			//	return undefined;
		},
		defer: function(fcn, delay, args){
			var self = this,
				timer = setTimeout(function(){
					if(!timer){
						return;
					}
					timer = null;
					if(!self._destroyed){
						try{
							fcn.apply(self, args || []);///IE8 不支持 args = undefined。
						}catch(e){
							console.error("this.defer()", rias.captureStackTrace(e), args, fcn.toString());
						}
					}
				}, delay || 0);
			if(rias.isString(fcn)){
				if(!self[fcn]){
					throw(['Widget.defer: this["', fcn, '"] is null (this="', self, '")'].join(''));
				}
				fcn = self[fcn];
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
		},
		getParentNode: function(){
			return this.domNode.parentNode || rias.dom.webAppNode;
		}
	});

	_WidgetsInTemplateMixin.extend({
		_beforeFillContent: function(){
			if(this.widgetsInTemplate){
				// Before copying over content, instantiate widgets in template
				var node = this.domNode;

				if(this.containerNode && !this.searchContainerNode){
					// Tell parse call below not to look for widgets inside of this.containerNode
					this.containerNode.stopParser = true;
				}

				parser.parse(node, {
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
							this.containerNode.stopParser = undefined;
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
		_setDisabledAttr: function(/*Boolean*/ value){
			value = !!value;
			this._set("disabled", value);
			rias.dom.setAttr(this.focusNode, 'disabled', value);
			if(this.valueNode){
				rias.dom.setAttr(this.valueNode, 'disabled', value);
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
		isFocusable: function () {
			//return this.focus && !this.disabled && !this.readOnly && rias.a11y.isFocusable(this.focusNode || this.domNode);
			this.inherited(arguments);
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
			this.focusNode.setAttribute("aria-activedescendant", rias.dom.getAttr(node, "id"));
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
						text = store._oldAPI ? store.getValue(item, this.labelAttr) : item[this.labelAttr];
					}else{
						text = (store._oldAPI ? store.getValue(item, this.labelAttr) : item[this.labelAttr])
							+ "(" + (store._oldAPI ? store.getValue(item, this.searchAttr) : item[this.searchAttr]) + ")";
					}
				}else{
					text = (store._oldAPI ? store.getValue(item, this.searchAttr) : item[this.searchAttr]);
				}
			}catch(e){
				console.error(this, "labelFunc() error: ", rias.captureStackTrace(e));
				text = this.filter(this.value, item);
			}
			return text.toString();
		},
		onSetItem: function(item){

		},
		_setItemAttr: function(/*item*/ item, /*Boolean?*/ priorityChange, displayedValue){
			// summary:
			//		Set the displayed valued in the input box, and the hidden value
			//		that gets submitted, based on a dojo.data store item.
			// description:
			//		Users shouldn't call this function; they should be calling
			//		set('item', value)
			// tags:
			//		private
			var value = '';
			if(item){
				if(!displayedValue){
					displayedValue = this.store._oldAPI ? // remove getValue() for 2.0 (old dojo.data API)
						this.store.getValue(item, this.searchAttr) : item[this.searchAttr];
				}
				value = this._getValueField() != this.searchAttr ? this.store.getIdentity(item) : displayedValue;
			}
			//this._set("item", item);
			//if(item){
			//	value = (this._getValueField() ? item[this._getValueField()] : this.store.getIdentity(item));
			//}
			this.set('value', value, priorityChange, this.get("displayedValue"), item);
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

	_FormSelectWidget.extend({
		/*postCreate: function(){
			// summary:
			//		sets up our event handling that we need for functioning
			//		as a select
			this.inherited(arguments);

			// Make our event connections for updating state
			this.own(rias.after(this, "onChange", rias.hitch(this, "_updateSelection")));

			//		Connects in our store, if we have one defined
			var store = this.store;
			if(store && (store.getIdentity || store.getFeatures()["dojo.data.api.Identity"])){
				// Temporarily set our store to null so that it will get set
				// and connected appropriately
				this.store = null;
				if(!store.getFeatures && rias.isInstanceOf(store, StoreBase)){
					this._deprecatedSetStore(new ObjectStore({
						idProperty: store.idAttribute || "id",
						labelProperty: store.labelAttribute || "label",
						objectStore: store
					}), this._oValue, {query: this.query, queryOptions: this.queryOptions});
				}else{
					this._deprecatedSetStore(store, this._oValue, {query: this.query, queryOptions: this.queryOptions});
				}
			}

			this._storeInitialized = true;
		},
		_setStoreAttr: function(val){
			var store = val;
			if(this._created){		// don't repeat work that will happen in postCreate()
				if(!store.getFeatures && rias.isInstanceOf(store, StoreBase)){
					val = new ObjectStore({
						idProperty: store.idAttribute || "id",
						labelProperty: store.labelAttribute || "label",
						objectStore: store
					});
				}
				this._deprecatedSetStore(val);
			}
		}*/
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

	_Container.extend({
		_setupChild: function(/*dijit/_WidgetBase*/child, added, insertIndex, resize){
			if(added && this._started){
				if(!child._started){
					child.startup();
				}
			}
		},
		addChild: function(/*dijit/_WidgetBase*/ child, /*int?*/ insertIndex, resize){
			var p = this,
				refNode = p.containerNode;
			//rias.orphan(child);
			//rias.own(p, child, insertIndex);
			///注意：是对 parent.containerNode 操作.
			if(insertIndex > 0){
				refNode = refNode.firstChild;
				while(refNode && insertIndex > 0){
					if(refNode.nodeType == 1){
						insertIndex--;
					}
					refNode = refNode.nextSibling;
				}
				if(refNode){
					insertIndex = "before";
				}else{
					// to support addChild(child, n-1) where there are n children (should add child at end)
					refNode = p.containerNode;
					insertIndex = "last";
				}
			}

			rias.dom.place(child.domNode, refNode, insertIndex);
			child._riasrParent = p;
			//if(child._onParentNodeChanged){
			//	child._onParentNodeChanged();
			//}
			child.set("riasrParentNode", p.domNode);
			p._setupChild(child, true, insertIndex, resize);
		},
		removeChild: function(/*Widget|int*/ child, resize){
			var p = this;
			if(typeof child == "number"){
				child = p.getChildren()[child];
			}
			//if(child._riasrOwner){
			//	child._riasrOwner = undefined;
			//}
			///必须判断 rias.indexOf(p._riasrChildren, child, 0) > -1
			//if(rias.isRiasw(p) && rias.indexOf(p._riasrChildren, child, 0) > -1){
			//	p._riasrChildren.splice(rias.indexOf(p._riasrChildren, child, 0), 1);
			//}
			if(child){
				if(child._riasrParent == p){
					//console.debug(parent, child);
					child._riasrParent = undefined;
				}
				var n = (child.domNode ? child.domNode : child);
				if(n && n.parentNode){
					n.parentNode.removeChild(n); // detach but don't destroy
					//if(child._onParentNodeChanged){
					//	child._onParentNodeChanged();
					//}
					child.set("riasrParentNode", undefined);
				}
				p._setupChild(child, false, resize);
			}
		},
		_getActiveNode: function(){
			var node = this.activeNode;
			if(rias.isDomNode(node)){
				return node;
			}else {
				node = rias.by(node, this);
			}
			return node;
		},
		_setActiveNodeAttr: function(node){
			this._set("activeNode", rias.by(node) || node);
		},
		/*_setFocusedAttr: function(value){
			//console.debug(this.id, "focused", value);
			if(!value){
				this._focusedOk = false;
			}
			this.inherited(arguments);
		},
		_onBlur: function(){
			//if(rias.dom.isDescendant(rias.dom.focusedNode, this.domNode)){
			//	this._focusedNode = rias.dom.focusedNode;
			//}
			this.inherited(arguments);
		},
		_onFocus: function(by, newFocused){
			this.inherited(arguments);
			if(rias.dom.isDescendant(newFocused, this.domNode)){
				var node = newFocused;
				node = rias.by(node);
				//if(node && rias.dom.isDescendant(node.domNode, this.domNode)){
				//	this.focusedChild = node;
				//}
			}
			//if(!this._focusedOk){
			//	this.defer("focus");
			//}
		},*/
		_getFocusItems: function(){
			var elems = rias.a11y._getTabNavigable(this.domNode);
			this._firstFocusNode = elems.lowest || elems.first || this.closeButtonNode || this.domNode;
			this._lastFocusNode = elems.last || elems.highest || this._firstFocusNode;
		},
		focus: function(){
			if(!this._focusedOk && !this.focused){
				this._focusedOk = true;
				var node;// = this.focusedChild;
				if(!rias.a11y.isFocusable(node) && this.activeNode){
					node = this._getActiveNode(this.activeNode);// rias.by(this.activeNode, this);
				}
				if(rias.isFunction(this._getFocusItems) && !rias.a11y.isFocusable(node)){
					this._getFocusItems();
					node = this._firstFocusNode;
				}
				if(rias.a11y.isFocusable(node)){
					rias.dom.focus(node);
					node = rias.by(node);
					//if(node && rias.dom.isDescendant(node.domNode, this.domNode)){
					//	this.focusedChild = node;
					//}
				}
			}
		}
	});

	/*_FocusMixin.extend({
		_onBlur: function(){
			//if(rias.dom.isDescendant(rias.dom.focusedNode, this.domNode)){
			//	this._focusedNode = rias.dom.focusedNode;
			//}
			this.inherited(arguments);
		},
		_onFocus: function(){
			this.inherited(arguments);
			if(rias.dom.isDescendant(rias.dom.focusedNode, this.domNode)){
				var node = rias.dom.focusedNode;
				node = rias.by(node);
				if(node && rias.dom.isDescendant(node.domNode, this.domNode)){
					this.focusedChild = node;
				}
			}
			if(!this._focusedOk){
				this.defer("focus");
			}
		}
	});*/
	_KeyNavContainer.extend({
		_getActiveNode: function(){
			var node = this.activeNode;
			if(rias.isDomNode(node)){
				return node;
			}else {
				node = rias.by(node, this);
			}
			return node;
		},
		_setActiveNodeAttr: function(node){
			this._set("activeNode", rias.by(node) || node);
		},
		/*_setFocusedAttr: function(value){
			//console.debug(this.id, "focused", value);
			if(!value){
				this._focusedOk = false;
			}
			this.inherited(arguments);
		},
		_onBlur: function(){
			//if(rias.dom.isDescendant(rias.dom.focusedNode, this.domNode)){
			//	this._focusedNode = rias.dom.focusedNode;
			//}
			this.inherited(arguments);
		},
		_onFocus: function(by, newFocused){
			this.inherited(arguments);
			if(rias.dom.isDescendant(newFocused, this.domNode)){
				var node = newFocused;
				node = rias.by(node);
				//if(node && rias.dom.isDescendant(node.domNode, this.domNode)){
				//	this.focusedChild = node;
				//}
			}
			//if(!this._focusedOk){
			//	this.defer("focus");
			//}
		},*/
		/*_getFocusItems: function(){
			var elems = rias.a11y._getTabNavigable(this.domNode);
			this._firstFocusNode = elems.lowest || elems.first || this.closeButtonNode || this.domNode;
			this._lastFocusNode = elems.last || elems.highest || this._firstFocusNode;
		},*/
		focus: function(){
			if(!this._focusedOk && !this.focused){
				this._focusedOk = true;
				var node;// = this.focusedChild;
				if(!rias.a11y.isFocusable(node) && this.activeNode){
					node = this._getActiveNode(this.activeNode);// rias.by(this.activeNode, this);
				}
				if(rias.isFunction(this._getFocusItems) && !rias.a11y.isFocusable(node)){
					this._getFocusItems();
					node = this._firstFocusNode;
				}
				if(rias.a11y.isFocusable(node)){
					rias.dom.focus(node);
					node = rias.by(node);
					//if(node && rias.dom.isDescendant(node.domNode, this.domNode)){
					//	this.focusedChild = node;
					//}
				}
			}
		}
	});

	return rias;

});
