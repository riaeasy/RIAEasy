define([
	"riasw/riaswBase",
	"riasw/_base/focus"
], function(rias, focus){

	// module:
	//		riasw/sys/_WidgetBase

	var has = rias.has,
		_dom = rias.dom;

	var Tooltip, _Gutter, _Splitter, ToggleSplitter;
	var _riasrTooltipData;

	// Flag to make dijit load modules the app didn't explicitly request, for backwards compatibility
	///has.add("dijit-legacy-requires", !rias.isAsync);///废弃不用
	// Flag to enable support for textdir attribute
	has.add("riasw-bidi", false);

	// Nested hash listing attributes for each tag, all strings in lowercase.
	// ex: {"div": {"style": true, "tabindex" true}, "form": { ...
	var tagAttrs = {};
	function getAttrs(obj){
		var ret = {};
		for(var attr in obj){
			ret[attr.toLowerCase()] = true;
		}
		return ret;
	}
	function nonEmptyAttrToDom(attr){
		// summary:
		//		Returns a setter function that copies the attribute to this.domNode,
		//		or removes the attribute from this.domNode, depending on whether the
		//		value is defined or not.
		return function(val){
			_dom[val ? "setAttr" : "removeAttr"](this.domNode, attr, val);
			this._set(attr, val);
		};
	}

	function connectToDomNode(){
	}
	// Trap dojo.connect() calls to connectToDomNode methods, and redirect to _Widget.on()
	/*function aroundAdvice(originalConnect){
		return function(obj, event, scope, method){
			if(obj && typeof event === "string" && obj[event] === connectToDomNode){
				return obj.on(event.substring(2).toLowerCase(), rias.hitch(scope, method));
			}
			return originalConnect.apply(connect, arguments);
		};
	}*/
	//rias.around(connect, "connect", aroundAdvice);

	function _getSibling(self, /*int*/dir){
		// summary:
		//		Returns next or previous sibling
		// which:
		//		Either "next" or "previous"
		// tags:
		//		private
		var p = self._getContainerRiasw();
		if(p){
			var children = p.getChildren();
			return children[rias.indexOf(children, self) + dir];
		}
		return null;
	}

	var _WidgetBase = rias.declare("riasw.sys._WidgetBase", [rias.Destroyable], {
		// summary:
		//		Future base class for all Dijit widgets.
		// description:
		//		Future base class for all Dijit widgets.
		//		_Widget extends this class adding support for various features needed by desktop.
		//
		//		Provides stubs for widget lifecycle methods for subclasses to extend, like postMixInProperties(), buildRendering(),
		//		postCreate(), startup(), and destroy(), and also public API methods like set(), get(), and watch().
		//
		//		Widgets can provide custom setters/getters for widget attributes, which are called automatically by set(name, value).
		//		For an attribute XXX, define methods _setXXXAttr() and/or _getXXXAttr().
		//
		//		_setXXXAttr can also be a string/hash/array mapping from a widget attribute XXX to the widget's DOMNodes:
		//
		//		- DOM node attribute
		// |		_setFocusAttr: {node: "focusNode", type: "attribute"}
		// |		_setFocusAttr: "focusNode"	(shorthand)
		// |		_setFocusAttr: ""		(shorthand, maps to this.domNode)
		//		Maps this.focus to this.focusNode.focus, or (last example) this.domNode.focus
		//
		//		- DOM node innerHTML
		//	|		_setTitleAttr: { node: "titleNode", type: "innerHTML" }
		//		Maps this.title to this.titleNode.innerHTML
		//
		//		- DOM node innerText
		//	|		_setTitleAttr: { node: "titleNode", type: "innerText" }
		//		Maps this.title to this.titleNode.innerText
		//
		//		- DOM node CSS class
		// |		_setMyClassAttr: { node: "domNode", type: "class" }
		//		Maps this.myClass to this.domNode.className
		//
		//		- Toggle DOM node CSS class
		// |		_setMyClassAttr: { node: "domNode", type: "toggleClass" }
		//		Toggles myClass on this.domNode by this.myClass
		//
		//		If the value of _setXXXAttr is an array, then each element in the array matches one of the
		//		formats of the above list.
		//
		//		If the custom setter is null, no action is performed other than saving the new value
		//		in the widget (in this).
		//
		//		If no custom setter is defined for an attribute, then it will be copied
		//		to this.focusNode (if the widget defines a focusNode), or this.domNode otherwise.
		//		That's only done though for attributes that match DOMNode attributes (title,
		//		alt, aria-labelledby, etc.)

		// id: [const] String
		//		A unique, opaque ID string that can be assigned by users or by the
		//		system. If the developer passes an ID which is known not to be
		//		unique, the specified ID is ignored and the system-generated ID is
		//		used instead.
		id: "",
		_setIdAttr: "domNode", // to copy to this.domNode even for auto-generated id's

		// lang: [const] String
		//		Rarely used.  Overrides the default Dojo locale used to render this widget,
		//		as defined by the [HTML LANG](http://www.w3.org/TR/html401/struct/dirlang.html#adef-lang) attribute.
		//		Value must be among the list of locales specified during by the Dojo bootstrap,
		//		formatted according to [RFC 3066](http://www.ietf.org/rfc/rfc3066.txt) (like en-us).
		lang: "",
		// set on domNode even when there's a focus node.	but don't set lang="", since that's invalid.
		_setLangAttr: nonEmptyAttrToDom("lang"),

		// dir: [const] String
		//		Bi-directional support, as defined by the [HTML DIR](http://www.w3.org/TR/html401/struct/dirlang.html#adef-dir)
		//		attribute. Either left-to-right "ltr" or right-to-left "rtl".  If undefined, widgets renders in page's
		//		default direction.
		dir: "",
		// set on domNode even when there's a focus node.	but don't set dir="", since that's invalid.
		_setDirAttr: nonEmptyAttrToDom("dir"), // to set on domNode even when there's a focus node

		// Override automatic assigning type --> focusNode, it causes exception on IE6-8.
		// Instead, type must be specified as ${type} in the template, as part of the original DOM.
		_setTypeAttr: null,

		// title: String
		//		HTML title attribute.
		//
		//		For form widgets this specifies a tooltip to display when hovering over
		//		the widget (just like the native HTML title attribute).
		//
		//		For TitlePane or for when this widget is a child of a TabContainer, AccordionContainer,
		//		etc., it's used to specify the tab label, accordion pane title, etc.  In this case it's
		//		interpreted as HTML.
		title: "",

		// srcNodeRef: [readonly] DomNode
		//		pointer to original DOM node
		srcNodeRef: null,

		// domNode: [readonly] DomNode
		//		This is our visible representation of the widget! Other DOM
		//		Nodes may by assigned to other properties, usually through the
		//		template system's data-dojo-attach-point syntax, but the domNode
		//		property is the canonical "top level" node in widget UI.
		domNode: null,
		// containerNode: [readonly] DomNode
		//		Designates where children of the source DOM node will be placed.
		//		"Children" in this case refers to both DOM nodes and widgets.
		//		For example, for myWidget:
		//
		//		|	<div data-dojo-type=myWidget>
		//		|		<b> here's a plain DOM node
		//		|		<span data-dojo-type=subWidget>and a widget</span>
		//		|		<i> and another plain DOM node </i>
		//		|	</div>
		//
		//		containerNode would point to:
		//
		//		|		<b> here's a plain DOM node
		//		|		<span data-dojo-type=subWidget>and a widget</span>
		//		|		<i> and another plain DOM node </i>
		//
		//		In templated widgets, "containerNode" is set via a
		//		data-dojo-attach-point assignment.
		//
		//		containerNode must be defined for any widget that accepts innerHTML
		//		(like ContentPane or BorderContainer or even Button), and conversely
		//		is null for widgets that don't, like TextBox.
		containerNode: null,

		// ownerDocument: [const] Document?
		//		The document this widget belongs to.  If not specified to constructor, will default to
		//		srcNodeRef.ownerDocument, or if no sourceRef specified, then to the document global
		ownerDocument: null,
		_setOwnerDocumentAttr: function(val){
			// this setter is merely to avoid automatically trying to set this.domNode.ownerDocument
			this._set("ownerDocument", val);
		},

		/*=====
		// _started: [readonly] Boolean
		//		startup() has completed.
		_started: false,
		=====*/

		// attributeMap: [protected] Object
		//		Deprecated.	Instead of attributeMap, widget should have a _setXXXAttr attribute
		//		for each XXX attribute to be mapped to the DOM.
		//
		//		attributeMap sets up a "binding" between attributes (aka properties)
		//		of the widget and the widget's DOM.
		//		Changes to widget attributes listed in attributeMap will be
		//		reflected into the DOM.
		//
		//		For example, calling set('title', 'hello')
		//		on a TitlePane will automatically cause the TitlePane's DOM to update
		//		with the new title.
		//
		//		attributeMap is a hash where the key is an attribute of the widget,
		//		and the value reflects a binding to a:
		//
		//		- DOM node attribute
		// |		focus: {node: "focusNode", type: "attribute"}
		//		Maps this.focus to this.focusNode.focus
		//
		//		- DOM node innerHTML
		//	|		title: { node: "titleNode", type: "innerHTML" }
		//		Maps this.title to this.titleNode.innerHTML
		//
		//		- DOM node innerText
		//	|		title: { node: "titleNode", type: "innerText" }
		//		Maps this.title to this.titleNode.innerText
		//
		//		- DOM node CSS class
		// |		myClass: { node: "domNode", type: "class" }
		//		Maps this.myClass to this.domNode.className
		//
		//		If the value is an array, then each element in the array matches one of the
		//		formats of the above list.
		//
		//		There are also some shorthands for backwards compatibility:
		//
		//		- string --> { node: string, type: "attribute" }, for example:
		//
		//	|	"focusNode" ---> { node: "focusNode", type: "attribute" }
		//
		//		- "" --> { node: "domNode", type: "attribute" }
		attributeMap: {},

		onClick: connectToDomNode,
		onDblClick: connectToDomNode,
		onKeyDown: connectToDomNode,
		onKeyPress: connectToDomNode,
		onKeyUp: connectToDomNode,
		onMouseDown: connectToDomNode,
		onMouseMove: connectToDomNode,
		onMouseOut: connectToDomNode,
		onMouseOver: connectToDomNode,
		onMouseLeave: connectToDomNode,
		onMouseEnter: connectToDomNode,
		onMouseUp: connectToDomNode,
		onScroll: connectToDomNode,

		// _blankGif: [protected] String
		//		Path to a blank 1x1 image.
		//		Used by `<img>` nodes in templates that really get their image via CSS background-image.
		_blankGif: rias.config.blankGif || rias.require.toUrl("dojo/resources/blank.gif"),

		// textDir: String
		//		Bi-directional support,	the main variable which is responsible for the direction of the text.
		//		The text direction can be different than the GUI direction by using this parameter in creation
		//		of a widget.
		//
		//		This property is only effective when `has("riasw-bidi")` is defined to be true.
		//
		//		Allowed values:
		//
		//		1. "" - default value; text is same direction as widget
		//		2. "ltr"
		//		3. "rtl"
		//		4. "auto" - contextual the direction of a text defined by first strong letter.
		textDir: "",

		//_i18nConvert: function(s){
		//	if(!rias.i18n.bundle){
		//		return s;
		//	}
		//	return rias.i18n.bundle[rias.trim(s)] || s;
		//},

		gutters: false,
		splitter: false,
		liveSplitters: false,
		splitterCtor: "",
		//_setSplitterAttr: function(value){
		//	//value = !!value;///this.splitter 允许 String，比如 "toggle"，参见 riastudio.js 中的 _getSplitterCtor
		//	if(this.splitter !== value){
		//		this.splitter = value;
		//	}
		//},
		_getSplitterCtor: function(){
			var ctor = this.splitter ? this.splitterCtor ? this.splitterCtor : this.splitter === "toggle" ? ToggleSplitter : _Splitter : _Gutter;
			if(rias.isString(ctor)){
				ctor = rias.getObject(ctor);
			}
			return ctor;
		},
		// tooltip: String
		//		When this widget's title attribute is used to for a tab label, accordion pane title, etc.,
		//		this specifies the tooltip to appear when the mouse is hovered over that text.
		tooltip: "",
		//_setTooltipAttr: {node: "focusNode", type: "attribute", attribute: "title"}, // focusNode spans the entire width, titleNode doesn't
		//tooltipPositions: _dom.tooltipPositions,
		onGetTooltip: function(tooltip){
			return tooltip;
		},
		_getTooltipAttr: function(){
			return this.onGetTooltip(this.tooltip);
		},
		_setTooltipAttr: function(/*String*/ tooltip){
			if(this.is(Tooltip) || rias.isRiaswDesktop(this)){///避免递归 和 缺少 _riasrModule
				return;
			}
			var self = this,
				t = _riasrTooltipData ? _riasrTooltipData : (_riasrTooltipData = new Tooltip({
					ownerRiasw: rias.desktop,
					_riaswIdInModule: "_riasrTooltipData",
					__h: {},
					popupPositions: _dom.tooltipPositions,
					showDelay: 1500,
					showingDuration: 3000,
					hideDelay: 200
				})),
			//delegatedEvent = function(eventType){
			//	return eventType;
			//},
				node;
			if(self._tooltipHandle){
				self._tooltipHandle.remove();
				delete self._tooltipHandle;
			}
			///还是由 Tooltip 处理好些
			//tooltip = self.enforceTextDirWithUcc(null, tooltip + "");
			tooltip = tooltip + "";
			self._set("tooltip", tooltip);
			if(tooltip){
				if(self.focusNode && self.id){
					if(!(node = _dom.byId(self.focusNode, self.ownerDocument))){
						return;
					}
				}
				self._tooltipHandle = self.own(t.addTarget(self.focusNode || self.domNode))[0];
			}
		},

		toString: function(){
			// summary:
			//		Returns a string that represents the widget.
			// description:
			//		When a widget is cast to a string, this method will be used to generate the
			//		output. Currently, it does not implement any sort of reversible
			//		serialization.
			return '[Widget ' + this.declaredClass + ', ' + (this.id || 'NO ID') + ']'; // String
		},

		////////////////// GET/SET, CUSTOM SETTERS, ETC. ///////////////////
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
							_dom.setAttr(mapNode, attrName, value);
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
						_dom.replaceClass(mapNode, value, this[attr]);
						break;
				}
			}, this);
		},
		get: function(name){
			// summary:
			//		Get a property from a widget.
			// name:
			//		The property to get.
			// description:
			//		Get a named property from a widget. The property may
			//		potentially be retrieved via a getter method. If no getter is defined, this
			//		just retrieves the object's property.
			//
			//		For example, if the widget has properties `foo` and `bar`
			//		and a method named `_getFooAttr()`, calling:
			//		`myWidget.get("foo")` would be equivalent to calling
			//		`widget._getFooAttr()` and `myWidget.get("bar")`
			//		would be equivalent to the expression
			//		`widget.bar2`
			var names = this._getAttrNames(name);
			return this[names.g] ? this[names.g]() : this._get(name);
		},
		_setOn: function(name, value){
			if(name.startWith("on")){
				name = name.replace(/^on/, "").toLowerCase();
				if(this._toConnect[name]){
					this._toConnect[name].remove();
					this._toConnect[name] = this.on(name, value);
					return true;
				}
			}
			return false;
		},
		///不建议修改 set。如果需要触发 watch，则需要在 _setXXXAttr 中调用 _set()
		set: function(name, value){
			// summary:
			//		Set a property on a widget
			// name:
			//		The property to set.
			// value:
			//		The value to set in the property.
			// description:
			//		Sets named properties on a widget which may potentially be handled by a
			//		setter in the widget.
			//
			//		For example, if the widget has properties `foo` and `bar`
			//		and a method named `_setFooAttr()`, calling
			//		`myWidget.set("foo", "Howdy!")` would be equivalent to calling
			//		`widget._setFooAttr("Howdy!")` and `myWidget.set("bar", 3)`
			//		would be equivalent to the statement `widget.bar = 3;`
			//
			//		set() may also be called with a hash of name/value pairs, ex:
			//
			//	|	myWidget.set({
			//	|		foo: "Howdy",
			//	|		bar: 3
			//	|	});
			//
			//	This is equivalent to calling `set(foo, "Howdy")` and `set(bar, 3)`

			if(typeof name === "object"){
				for(var x in name){
					this.set(x, name[x]);
				}
				return this;
			}

			var names = this._getAttrNames(name),
				result = value;
			try{
				if(rias.isFunction(this[names.s])){
					// use the explicit setter
					result = this[names.s].apply(this, Array.prototype.slice.call(arguments, 1));
				}else if(!this._setOn(name, value)){
					// Mapping from widget attribute to DOMNode/subwidget attribute/value/etc.
					// Map according to:
					//		1. attributeMap setting, if one exists (TODO: attributeMap deprecated, remove in 2.0)
					//		2. _setFooAttr: {...} type attribute in the widget (if one exists)
					//		3. apply to focusNode or domNode if standard attribute name, excluding funcs like onClick.
					// Checks if an attribute is a "standard attribute" by whether the DOMNode JS object has a similar
					// attribute name (ex: accept-charset attribute matches jsObject.acceptCharset).
					// Note also that Tree.focusNode() is a function not a DOMNode, so test for that.
					var defaultNode = this.focusNode && !rias.isFunction(this.focusNode) ? "focusNode" : "domNode",
						tag = this[defaultNode] && this[defaultNode].tagName,
						attrsForTag = tag && (tagAttrs[tag] || (tagAttrs[tag] = getAttrs(this[defaultNode]))),
						map = name in this.attributeMap ? this.attributeMap[name] :
							names.s in this ? this[names.s] :
								((attrsForTag && names.l in attrsForTag && typeof value !== "function") ||
									/^aria-|^data-|^role$/.test(name)) ? defaultNode : null;
					if(map != null){
						this._attrToDom(name, value, map);
					}
					result = this._set(name, value);
				}
			}catch(e){
				console.error("set " + this.id + "." + name + " = " + value + " error.\n", e);
				//throw e;
			}
			return result;
		},
		_get: function(/*String*/ name){
			// summary:
			//		Helper function to get value for specified property stored by this._set(),
			//		i.e. for properties with custom setters.  Used mainly by custom getters.
			//
			//		For example, CheckBox._getValueAttr() calls this._get("value").

			// future: return name in this.props ? this.props[name] : this[name];
			return this[name];
		},
		// baseClass: [protected] String
		//		Root CSS class of the widget (ex: dijitTextBox), used to construct CSS classes to indicate
		//		widget state.
		baseClass: "",
		splitBaseClass: function(split){
			return rias.compact(this.baseClass ? this.baseClass.split(split || " ") : []);
		},
		// class: String
		//		HTML class attribute
		"class": "",
		_setClassAttr: function(clazz){
			/// 非 _setXxxAttr 调用时是执行 _attrToDom()，默认为 this.focusNode || this.domNode
			var go = clazz !== this["class"];
			_dom.clearComputedStyle(this.domNode);
			///初始化时，go 为 false，故 replaceClass 需要在 if(go) 之外
			_dom.replaceClass(this.domNode, clazz, this["class"]);///注意：是 replace 原来的
			if(go){
				this._set("class", clazz);
				this._containerLayout();
			}
		},
		iconClass: "",
		_setIconClassAttr: function(value){
			//layoutVertical: false,
			//iconLayoutTop: false,
			value = (value && value !== "riaswNoIcon") ? value : "";
			if(this.iconNode){
				if(this.iconClass){
					_dom.removeClass(this.iconNode, this.iconClass);
				}
				this._set("iconClass", value);
				if(value){
					_dom.addClass(this.iconNode, this.iconClass);
				}
				_dom.toggleClass(this.iconNode, "riaswNoIcon", !value);
				_dom.toggleClass(this.iconNode, "riaswHasIcon", !!value);
				_dom.toggleClass(this.domNode, this._baseClass0 + "HasIcon", !!value);
			}else{
				this._set("iconClass", value);
			}
		},
		// style: String||Object
		//		HTML style attributes as cssText string or name/value hash
		style: "",
		_setStyleAttr: function(value){
			value = _dom.styleToObject(value);
			var x,
				node = this.domNode,
				s = node.style,
				go = false;
			for(x in value){
				if(value[x] !== s[x]){
					go = true;
					_dom.setStyle(node, x, value[x]);
				}
			}
			if(go){
				this._set("style", value);
				this._containerLayout();
			}
		},
		_setWidgetCssAttr: function(value){
			value = value || "";
			if(value !== this._widgetCss){
				_dom.clearComputedStyle(this.domNode);
				if(this._widgetCss){
					_dom.removeClass(this.domNode, this._widgetCss);
				}
				if(value){
					_dom.addClass(this.domNode, value);
				}
				this._widgetCss = value;
				this._set("widgetCss", value);
				this._containerLayout();
			}
		},
		_setStateStyleAttr: function(value){
			if(!rias.isObjectSimple(value)){
				console.error("The stateStyle need a Object value, " + value);
				return;
			}
			if(!rias.objEqual(this._stateStyle, value)){
				_dom.clearComputedStyle(this.domNode);
				for(var pn in value){
					if(value.hasOwnProperty(pn) && rias.isDomNode(this[pn]) && value[pn]){
						try{
							if(value[pn].base){
								if(this._trackMouseState){
									if(pn === "domNode"){
										this._trackMouseState(this.domNode, this._baseClass0 ? this._baseClass0 : "_riasrStateStyle");
									}else{
										this._trackMouseState(this[pn], this.cssStateNodes && this.cssStateNodes[pn] ? this.cssStateNodes[pn] : "_riasrStateStyle");
									}
								}
								_dom.setStyle(this[pn], value[pn].base);
							}
						}catch(e){
							console.error(e.message, e, this);
						}
					}
				}
				this._stateStyle = value;
				this._set("stateStyle", value);
				this._containerLayout();
			}
		},
		_setZIndexAttr: function(value){
			value = rias.toNumber(value);
			if(rias.isNumber(value) && !isNaN(value)){
				this._set("zIndex", value);
				_dom.setStyle(this.domNode, "zIndex", value);
				/// 由 _splitterWidget 自身监听
				//if(this._splitterWidget && !this._splitterWidget.isDestroyed(false)){
				//	this._splitterWidget.set("zIndex", value);
				//}
			}
		},

		badgeClass: "riaswBadge",
		badgeStyle: "",
		badgeColor: "",//"blue","green","red"(default)
		badge: "",
		_getBadgeStyleAttr: function(){
			return this.badgeStyle;
		},
		_setBadgeStyleAttr: function(value){
			var n = this.badgeNode;
			if(n){
				rias.dom.setStyle(n, rias.dom.styleToObject(value));
				this._set("badgeStyle", value);
			}
		},
		_getBadgeColorAttr: function(){
			return this.badgeColor;
		},
		_setBadgeColorAttr: function(/*String*/value){
			var n = this.badgeText;
			if(n){
				if(rias.isString(value)){
					rias.dom.removeClass(n, "riaswBadgeRed");
					rias.dom.removeClass(n, "riaswBadgeBlue");
					rias.dom.removeClass(n, "riaswBadgeGreen");
					rias.dom.removeClass(n, "riaswBadgeYellow");
					switch(value.charAt(0)){
						case "b":
							rias.dom.addClass(n, "riaswBadgeBlue");
							this._set("badgeColor", "blue");
							break;
						case "g":
							rias.dom.addClass(n, "riaswBadgeGreen");
							this._set("badgeColor", "green");
							break;
						case "y":
							rias.dom.addClass(n, "riaswBadgeYellow");
							this._set("badgeColor", "yellow");
							break;
						default:
							rias.dom.addClass(n, "riaswBadgeRed");
							this._set("badgeColor", "red");
					}
				}else{
					rias.dom.addClass(n, "riaswBadgeRed");
					this._set("badgeColor", "red");
				}
			}
		},
		_getBadgeAttr: function(){
			return this.badgeText ? this.badgeText.innerHTML : "";
		},
		_setBadgeAttr: function(/*String*/value){
			value = value + "";
			this._set("badge", value);
			if(value){
				if(!this.badgeNode){
					this.badgeNode = rias.dom.place("<span data-dojo-attach-point='badgeNode'></span>", this.domNode, "first");
					rias.dom.addClass(this.badgeNode, this.badgeClass);
					this.set("badgeStyle", this.badgeStyle);
				}
			}else{
				if(this.badgeNode && this.badgeNode !== this._badgeNode0){
					rias.dom.destroy(this.badgeNode);
					delete this.badgeText;
					delete this.badgeNode;
				}
			}
			if(this.badgeNode){
				switch(value.length){
					case 1:
						break;
					case 2:
						rias.dom.addClass(this.badgeNode, "riaswBadge2");
						break;
					case 3:
						rias.dom.addClass(this.badgeNode, "riaswBadge3");
						break;
					default:
						rias.dom.addClass(this.badgeNode, "riaswBadgeMore");
				}
				rias.dom.toggleClass(this.badgeNode, "riaswBadgeVisible", !!value);
				if(!this.badgeText){
					this.badgeText = rias.dom.create("div", {
						"class": "riaswBadgeText riaswBadgeRed"
					}, this.badgeNode);
					this.set("badgeColor", this.badgeColor);
				}
				this.badgeText.innerHTML = value;
				this._containerLayout();
			}
		},

		//////////// INITIALIZATION METHODS ///////////////////////////////////////
		constructor: function(params /*===== ,srcNodeRef =====*/){
			// summary:
			//		Create the widget.
			// params: Object|null
			//		Hash of initialization parameters for widget, including scalar values (like title, duration etc.)
			//		and functions, typically callbacks like onClick.
			//		The hash can contain any of the widget's properties, excluding read-only properties.
			// srcNodeRef: DOMNode|String?
			//		If a srcNodeRef (DOM node) is specified:
			//
			//		- use srcNodeRef.innerHTML as my contents
			//		- if this is a behavioral widget then apply behavior to that srcNodeRef
			//		- otherwise, replace srcNodeRef with my generated DOM tree

			// extract parameters like onMouseMove that should connect directly to this.domNode
			this._toConnect = {};
			for(var name in params){
				if(this[name] === connectToDomNode){
					this._toConnect[name.replace(/^on/, "").toLowerCase()] = params[name];
					delete params[name];
				}
			}
		},
		create: function(params, srcNodeRef){

			// First time widget is instantiated, scan prototype to figure out info about custom setters etc.
			this._introspect();

			// store pointer to original DOM tree
			this.srcNodeRef = _dom.byId(srcNodeRef || params && params.srcNodeRef);

			// No longer used, remove for 2.0.
			//this._connects = [];
			//this._supportingWidgets = [];

			// this is here for back-compat, remove in 2.0 (but check NodeList-instantiate.html test)
			if(this.srcNodeRef && this.srcNodeRef.id  && (typeof this.srcNodeRef.id === "string")){
				this.id = this.srcNodeRef.id;
			}

			// mix in our passed parameters
			if(params){
				this.params = params;
				rias.mixin(this, params);///使用 rias.mixin，实现 nom
			//}else{
			//	//this.params = {};
			}
			this.postMixInProperties();

			// Generate an id for the widget if one wasn't specified, or it was specified as id: undefined.
			// Do this before buildRendering() because it might expect the id to be there.
			if(!this.id){
				this.id = rias.rt.getUniqueId(this.declaredClass.replace(/\./g, "_"));
				if(this.params){
					// if params contains {id: undefined}, prevent _applyAttributes() from processing it
					delete this.params.id;
				}
			}

			// The document and <body> node this widget is associated with
			this.ownerDocument = this.ownerDocument || (this.srcNodeRef ? this.srcNodeRef.ownerDocument : document);
			this.ownerDocumentBody = _dom.body(this.ownerDocument);

			rias.rt.add(this);

			this.buildRendering();

			var deleteSrcNodeRef;

			this._created = true;///提前，只要 buildRendering 即表示已经 create。后面需要判断。

			if(this.domNode){
				// Copy attributes listed in attributeMap into the [newly created] DOM for the widget.
				// Also calls custom setters for all attributes with custom setters.
				this._applyAttributes();

				// If srcNodeRef was specified, then swap out original srcNode for this widget's DOM tree.
				// For 2.0, move this after postCreate().  postCreate() shouldn't depend on the
				// widget being attached to the DOM since it isn't when a widget is created programmatically like
				// new MyWidget({}).	See #11635.
				var source = this.srcNodeRef;
				if(source && source.parentNode && this.domNode !== source){
					source.parentNode.replaceChild(this.domNode, source);
					deleteSrcNodeRef = true;
				}

				// Note: for 2.0 may want to rename widgetId to dojo._scopeName + "_widgetId",
				// assuming that dojo._scopeName even exists in 2.0
				this.domNode.setAttribute("widgetId", this.id);
			}
			this.postCreate();

			// If srcNodeRef has been processed and removed from the DOM (e.g. TemplatedWidget) then delete it to allow GC.
			// I think for back-compatibility it isn't deleting srcNodeRef until after postCreate() has run.
			if(deleteSrcNodeRef){
				delete this.srcNodeRef;
			}

		},
		postMixInProperties: function(){
			this.inherited(arguments);/// inherited RiasBase

			//this._connectToDomNode = this.constructor.prototype.onClick;
			/*this.constructor._onMap.scroll = "onScroll";
			this.constructor.prototype.onScroll = connectToDomNode;//this._connectToDomNode;
			if(this.params && this.params.onScroll){
				this._toConnect.scroll = this.params.onScroll;
				delete this.params.onScroll;
			}
			delete this.onScroll;///需要删除*/

			if (this.baseClass) {
				var classes = this.splitBaseClass();
				if (!this.isLeftToRight()) {
					classes = classes.concat(rias.map(classes, function (name) {
						return name + "Rtl";
					}));
				}
				this.baseClass = classes.join(" ");
				this._baseClass0 = classes[0] || "";
			}
		},
		buildRendering: function () {
			if (!this.domNode) {
				this.domNode = this.srcNodeRef || this.ownerDocument.createElement("div");
			}
			this.domNode.__riasrWidget = this;
			///此时，this.domNode 尚未 replace this.srcNodeRef
			//if(this.srcNodeRef && this.srcNodeRef.parentNode){
			//	var p = rias.by(this.srcNodeRef.parentNode);
			//	if(p && p.is(_Container) && p.containerNode && _dom.contains(p.containerNode, this.srcNodeRef.parentNode)){///有可能存在直接 new refNode 的 widget，不会经过 placeAt 处理，所以这里最好先处理一下。
			//		/// 此时，this.srcNodeRef 有可能没有 widgetId，故不能获取 this.srcNodeRef 的 widget。
			//		/// 另，_dom.contains(p.containerNode, this.srcNodeRef.parentNode) 可能包含 次次级，故是不准确的。
			//		this._setContainerRiasw(p);
			//	}
			//}else if(!rias.isDomNode(this.domNode.parentNode)){
			//	//domPlace(this.domNode, winBody(this.ownerDocument));
			//	domPlace(this.domNode, _globalTempDiv);
			//}
			if(!this.srcNodeRef || !this.srcNodeRef.parentNode || !rias.isDomNode(this.domNode.parentNode)){
				//_dom.place(this.domNode, _dom.body(this.ownerDocument));
				_dom.place(this.domNode, _dom._globalTempDiv);
			}
			if (this.baseClass) {
				_dom.addClass(this.domNode, this.splitBaseClass());
				_dom.clearComputedStyle(this.domNode);
			}
			if(this.widgetCss){
				_dom.addClass(this.domNode, this.widgetCss);
				_dom.clearComputedStyle(this.domNode);
			}
		},
		postCreate: function(){
			this.inherited(arguments);/// inherited RiasBase
			if(this.debounceLayoutDelay >= rias.defaultDuration){///debounceLayoutDelay 需要小于 playing 最短的 defaultDuration
				this.debounceLayoutDelay = rias.defaultDuration - 10;
			}
			///还是手动设置好些
			//if(this.parent){
			//	if(rias.is(this.parent, _Container)){
			//		this.parent.addChild(this);
			//	}else{
			//		console.error("The widget need a Container as parent." + this.id);
			//	}
			//}

			// perform connection from this.domNode to user specified handlers (ex: onMouseMove)
			for(var name in this._toConnect){
				this._toConnect[name] = this.on(name, this._toConnect[name]);
			}
		},
		//////////// DESTROY FUNCTIONS ////////////////////////////////
		destroyRecursive: function(/*Boolean?*/ preserveDom){
			//this._beingDestroyed = true;
			//this.destroyDescendants(preserveDom);///移到 destroy 中
			this.destroy(preserveDom);
		},
		_destroyParentChangedHandles: function(){
			if(this._onViewportResizeHandle){
				this._onViewportResizeHandle.remove();
				this._onViewportResizeHandle = undefined;
			}
			if(this._onResizeHandle){
				this._onResizeHandle.remove();
				this._onResizeHandle = undefined;
			}
			if(this._parentLayoutHandle){
				this._parentLayoutHandle.remove();
				this._parentLayoutHandle = undefined;
			}
		},
		_onDestroy: function(/*Boolean*/ preserveDom){
			delete this._toConnect;

			this._destroyParentChangedHandles();
			if(this._splitterWidget){
				rias.destroy(this._splitterWidget);
				this._splitterWidget = undefined;
			}

			var c = this._getContainerRiasw();
			if(c && !c.isDestroyed(false)){
				if(rias.dom.contains(this.domNode, this._focusManager.get("currNode"))){
					c.focus();
				}
				c.removeChild(this);
			}
			//this.set("tooltip", "");
			if(this._tooltipHandle){
				this._tooltipHandle.remove();
				delete this._tooltipHandle;
			}
			//this.uninitialize();

			// Back-compat, remove for 2.0
			//rias.forEach(this._connects, rias.hitch(this, "disconnect"));
			//rias.forEach(this._supportingWidgets, function(w){
			//	rias.destroy(w);
			//});

			this._destroyPopupMenu();
			// Destroy supporting widgets, but not child widgets under this.containerNode (for 2.0, destroy child widgets
			// here too).   if() statement is to guard against exception if destroy() called multiple times (see #15815).
			if(this.domNode){
				rias.forEach(rias.rt.findWidgets(this.domNode, this.containerNode), function(w){
					c = w.getOwnerRiasw();
					if(c === this){
						rias.destroy(w, preserveDom);
					}
				});
				delete this.domNode.__riasrWidget;
			}
			this.destroyDescendants(preserveDom);
			this.inherited(arguments);/// inherited RiasBase


			this.destroyRendering(preserveDom);
			this._focusableNode = undefined;
			//rias.rt.remove(this.id);
		},
		destroyDescendants: function(/*Boolean?*/ preserveDom){
			var ow;
			rias.forEach(this.getChildren(), function(widget){
				ow = widget.getOwnerRiasw();
				if(!ow || ow === this){
					rias.destroy(widget, preserveDom);
				}
			}, this);
			this.inherited(arguments);/// inherited RiasBase
		},
		destroyRendering: function(/*Boolean?*/ preserveDom){
			// summary:
			//		Destroys the DOM nodes associated with this widget.
			// preserveDom:
			//		If true, this method will leave the original DOM structure alone
			//		during tear-down. Note: this will not work with _Templated
			//		widgets yet.
			// tags:
			//		protected

			if(this.bgIframe){
				this.bgIframe.destroy(preserveDom);
				delete this.bgIframe;
			}
			if(this.badgeNode && this.badgeNode !== this._badgeNode0){
				rias.dom.destroy(this.badgeNode);
				delete this.badgeText;
				delete this.badgeNode;
			}
			if(!preserveDom){
				if(this.containerNode){
					_dom.destroy(this.containerNode);
				}
				if(this.domNode){
					_dom.destroy(this.domNode);
				}
				if(this.srcNodeRef){
					_dom.destroy(this.srcNodeRef);
				}
			}
			delete this.containerNode;
			delete this.domNode;
			delete this.srcNodeRef;
			delete this.ownerDocument;
			delete this.ownerDocumentBody;
		},

		//uninitialize: function(){
			// summary:
			//		Deprecated. Override destroy() instead to implement custom widget tear-down
			//		behavior.
			// tags:
			//		protected
		//	return false;
		//},

		onStartup: function(){
		},
		_onStartup: function(){
			if(this._splitterWidget && !this._splitterWidget._destroyed){///_splitterWidget 不是 parent/owner 的 child，需要单独 startup
				this._splitterWidget.startup();
			}
			this.onStartup();
		},
		startup: function(){
			if(this._started){
				return;
			}
			this._started = true;

			this._onStartup();
			this._containerLayout();
			rias.forEach(this.getChildren(), function(obj){
				if(!obj._started && !obj._destroyed && rias.isFunction(obj.startup)){
					obj.startup();
					obj._started = true;
				}
			});
		},

		/*_onMap: function(type){
			// summary:
			//		Maps on() type parameter (ex: "mousemove") to method name (ex: "onMouseMove").
			//		If type is a synthetic event like touch.press then returns undefined.
			var ctor = this.constructor,
				map = ctor._onMap;
			if(!map){
				map = (ctor._onMap = {});
				for(var attr in ctor.prototype){
					if(/^on/.test(attr)){
						map[attr.replace(/^on/, "").toLowerCase()] = attr;
					}
				}
			}
			return map[typeof type === "string" && type.toLowerCase()];	// String
		},*/
		on: function(target, /*String|Function*/ type, /*Function*/ func){
			// summary:
			//		Call specified function when event occurs, ex: myWidget.on("click", function(){ ... }).
			// type:
			//		Name of event (ex: "click") or extension event like touch.press.
			// description:
			//		Call specified function when event `type` occurs, ex: `myWidget.on("click", function(){ ... })`.
			//		Note that the function is not run in any particular scope, so if (for example) you want it to run in the
			//		widget's scope you must do `myWidget.on("click", lang.hitch(myWidget, func))`.

			///调整参数。
			if(!rias.isDomNode(target) && !rias.isDocument(target) && !rias.isWindow(target) && !rias.isRiasw(target)){
				func = type;
				type = target;
				target = this.domNode;
			}else if(rias.isRiasw(target)){
				target = target.domNode;
			}
			//if(rias.isString(func)){
			//	func = rias.hitch(this, func);
			//}

			// For backwards compatibility, if there's an onType() method in the widget then connect to that.
			// Remove in 2.0.
			//var widgetMethod = this._onMap(type);
			//if(widgetMethod){
			//	return this.after(widgetMethod, func, true);
			//}

			// Otherwise, just listen for the event on this.domNode.
			if(!target){
				console.error(this.id + " - The on method must has a target node.", this);
				return null;
			}
			return this.own(rias.on(target, type, rias.hitch(this, func)))[0];
		},
		emit: function(target, /*String*/ type, /*Object?*/ eventObj, /*Array?*/ callbackArgs){
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

			///调整参数。
			if(!rias.isDomNode(target) && !rias.isDocument(target) && !rias.isRiasw(target)){
				callbackArgs = eventObj;
				eventObj = type;
				type = target;
				target = this.domNode;
			}else if(rias.isRiasw(target)){
				target = target.domNode;
			}
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
			if(this._started && !this.isDestroyed(false)){
				rias.on.emit(this.domNode, type.toLowerCase(), eventObj);
			}

			return ret;
		},

		getChildren: function(){
			// summary:
			//		Returns all direct children of this widget, i.e. all widgets underneath this.containerNode whose parent
			//		is this widget.   Note that it does not return all descendants, but rather just direct children.
			//		Analogous to [Node.childNodes](https://developer.mozilla.org/en-US/docs/DOM/Node.childNodes),
			//		except containing widgets rather than DOMNodes.
			//
			//		The result intentionally excludes internally created widgets (a.k.a. supporting widgets)
			//		outside of this.containerNode.
			//
			//		Note that the array returned is a simple array.  Application code should not assume
			//		existence of methods like forEach().

			return this.containerNode ? rias.rt.findWidgets(this.containerNode) : []; // _WidgetBase[]
		},
		hasChildren: function(){
			// summary:
			//		Returns true if widget has child widgets, i.e. if this.containerNode contains widgets.
			return this.getChildren().length > 0;	// Boolean
		},
		getParentNode: function(){
			return this.domNode.parentNode;// || rias.dom.desktopBody;
		},
		getParent: function(){
			// summary:
			//		Returns the parent widget of this widget.

			return rias.rt.getEnclosingWidget(this.domNode.parentNode);
		},
		getIndexInContainer: function(){
			// summary:
			//		Returns the index of this widget within its container parent.
			//		It returns -1 if the parent does not exist, or if the parent
			//		is not a riasw.sys._Container

			var p = this._getContainerRiasw();
			return p ? rias.indexOf(p.getChildren(), this) : -1;
		},
		getSiblings: function(){
			var p = this._getContainerRiasw();
			///如果有 Container，则包含自身，否则返回空数组
			return p ? p.getChildren() : [];
		},
		getPreviousSibling: function(){
			// summary:
			//		Returns null if this is the first child of the parent,
			//		otherwise returns the next element sibling to the "left".

			return _getSibling(this, -1); // _WidgetBase
		},
		getNextSibling: function(){
			// summary:
			//		Returns null if this is the last child of the parent,
			//		otherwise returns the next element sibling to the "right".

			return _getSibling(this, 1); // _WidgetBase
		},

		isLeftToRight: function(){
			// summary:
			//		Return this widget's explicit or implicit orientation (true for LTR, false for RTL)
			// tags:
			//		protected
			return this.dir ? (this.dir.toLowerCase() === "ltr") : _dom.isBodyLtr(this.ownerDocument); //Boolean
		},
		_getContainerRiasw: function(){
			return this._riasrContainer;
		},
		_setContainerRiasw: function(value){
			if(rias.is(this._riasrContainer, "riasw.sys._Container")){
				this._riasrContainer.removeChild(this);
			}
			if(value !== undefined && !rias.is(value, "riasw.sys._Container")){
				console.error("The value is not a _Container.", value);
				return;
			}
			var b = this._riasrContainer !== value;
			this._riasrContainer = value;
			//console.debug("_setContainerRiasw - " + this.id + " - " + (value ? value.id : value));
			if(b && this._doContainerChanged){
				this._doContainerChanged(value);
			}
		},
		debounceLayoutDelay: rias.has("ff") ? 240 : 120,
		_containerLayout: function(container, delay){
			//console.debug("_containerLayout - " + this.id);
			//if(!this._canDoDom()){///因为 container.removeChild 时需要调用，这里检测 destroyed 会导致丢失 container.layout，改在下面检测
			//	return;
			//}
			//	///只要有一方向是 自适应，即要 _containerLayout?
			if(!container){
				container = this._getContainerRiasw();
			}
			if(container){
				if(!container._canDoDom()){///检测 destroyed，优化 destroyed 速度。此时，亦无需 this.resize
					return;
				}
				//if(container.alwaysContainerLayout || this.region){
				if(container.debounceLayout){
					container.debounceLayout(delay);
				}else if(container.layout){
					this._parentLayoutHandle = rias._debounce(container.id + ".layout", function(){
						this._parentLayoutHandle = undefined;
						///debounce 后，有可能 container 的状态已经改变。
						if(!container._canUpdateSize()){
							container.set("needResizeContent", true);
							//console.debug("debounceLayout - needResizeContent - " + container.id);
						}else{
							//console.debug("debounceLayout - layout - " + container.id);
							container.layout();
						}
					}, this, (delay == undefined ? this.debounceLayoutDelay : delay), function(){
					})();
				}else{
					this._parentLayoutHandle = rias._debounce(container.id + ".layout", function(){
						this._parentLayoutHandle = undefined;
						//console.debug("debounceResize - " + container.id);
						///debounce 后，有可能 container 的状态已经改变。
						if(!container._canUpdateSize()){
							container.set("needResizeContent", true);
							//console.debug("debounceLayout - needResizeContent - " + container.id);
						}else{
							if(container.resize){///有些 container 没有 resize，比如 TreeNode。针对需要 resize 的 TreeNode，可以扩展一个新的 TreeNode
								container.resize();
							}
						}
					}, this, (delay == undefined ? this.debounceLayoutDelay : delay), function(){
					})();
				}
				//}
			}else{
				if(this.debounceLayout){
					this.debounceLayout(delay);
				}else if(this.layout){
					this._parentLayoutHandle = rias._debounce(this.id + ".layout", function(){
						this._parentLayoutHandle = undefined;
						///debounce 后，有可能 this 的状态已经改变。
						if(!this._canUpdateSize()){
							this.set("needResizeContent", true);
							//console.debug("debounceLayout - needResizeContent - " + this.id);
						}else{
							//console.debug("debounceLayout - layout - " + this.id);
							this.layout();
						}
					}, this, (delay == undefined ? this.debounceLayoutDelay : delay), function(){
					})();
				}else if(this.resize){
					this._parentLayoutHandle = rias._debounce(this.id + ".resize", function(){
						this._parentLayoutHandle = undefined;
						///debounce 后，有可能 this 的状态已经改变。
						if(!this._canUpdateSize()){
							this.set("needResizeContent", true);
							//console.debug("debounceLayout - needResizeContent - " + this.id);
						}else{
							//console.debug("debounceLayout - resize - " + this.id);
							this.resize();
						}
					}, this, (delay == undefined ? this.debounceLayoutDelay : delay), function(){
					})();
				}
			}
		},
		_onViewportResizeDelay: 330,
		_onContainerChanged: function(container){
		},
		_doContainerChanged: function(container){
			///只响应 属于 Container 的 child ，即 Container.containerNode ，对于 属于 Container.domNode 的，由 Container 实例自行维护。
			this._destroyParentChangedHandles();
			if(!this._canDoDom()){///包含检测 parentNode
				return;
			}
			this._onContainerChanged(container);
			if(this._minSize0){///可以放这里，而不必放在 _PanelWidget 中。
				this.set("minSize", this._minSize0);
			}
			if(this._maxSize0){
				this.set("maxSize", this._maxSize0);
			}

			var self = this;
			if(!this._getContainerRiasw()){
				this._onResizeHandle = !rias.desktop || self === rias.desktop ?///rias.desktop 必须注册到 Viewport
					_dom.Viewport.on("resize", function(){
						self._onViewportResizeHandle = rias._throttleDelayed(self.id + "._onViewportResize", function(){
							self._onViewportResizeHandle = undefined;
							if(!self._canDoDom()){
								return;
							}
							if(self === rias.desktop){
								self.resize();
							}else{
								self._containerLayout();
							}
						}, self, self._onViewportResizeDelay, function(){
						})();
					}) : rias.desktop.addResizeWidget(self, true)[0];
			}else{
				if(!this.textDir && this._getContainerRiasw() && this._getContainerRiasw().get("textDir")){
					this.set("textDir", this._getContainerRiasw().get("textDir"));
				}
			}
			this._containerLayout();
		},
		placeAt: function(/* String|DomNode|_Widget */ reference, /* String|Int? */ position){
			//调用addChild()主要是为了layout()
			///first|last/.test(position || "")
			var child = this,
				refNode, p, insertIndex, isSibling, _container;

			if(position === "after" || position === "before" || position === "replace"){
				isSibling = true;
				refNode = rias.isRiasw(reference) ? reference.domNode : _dom.byId(reference, child.ownerDocument);
				p = rias.by(refNode.parentNode);
			}else{
				refNode = rias.isRiasw(reference) ? reference.containerNode ? reference.containerNode : reference.domNode : _dom.byId(reference, child.ownerDocument);
				p = rias.by(refNode);
			}
			if(refNode && p && p.is("riasw.sys._Container") && (isSibling ? refNode.parentNode === p.containerNode : refNode === p.containerNode)){// rias.isFunction(p.addChild)){/// addChild 只应该对 refNode === p.containerNode 作用
				if(position === "replace"){
					///TODO:zensst.先 destroy，再 addChild
					console.error("placeAt('replace') not be implemented.");
				}else if(position === "only"){
					///TODO:zensst.先 empty，再 addChild
					console.error("placeAt('only') not be implemented.");
				}else{
					if(rias.isString(position)){
						if(position === "before"){
							insertIndex = rias.indexOf(p.containerNode.childNodes, refNode);
						}else if(position === "after"){
							insertIndex = rias.indexOf(p.containerNode.childNodes, refNode) + 1;
						}else if(position === "first"){
							insertIndex = 0;
						}/// 其它情况由 addChild 处理
					}else{
						insertIndex = position;
					}
					/// addChild() 中包含 startup()
					p.addChild(child, insertIndex);
				}
			}else{
				////parent 有可能是没有 addChild 的 widget
				/// _riasrContainer 特指 _Container，需要用 addChild 来赋值。如果需要显式赋值，应在 placeAt 之后显式赋值。
				//rias.removeChild(child);
				_container = child._getContainerRiasw();///_container 是 oldContainer
				_dom.place(child.domNode, refNode, position);
				if(_container && _container !== p){
					_container._containerLayout(_container);///借用
				}
				//if(p && rias.isFunction(p.resize)){
				//	p.resize();
				//}
				if(p){
					p._containerLayout(p);
				}
				if(!child._started){
					if(!p || p._started){
						child.startup();
					}
				}
			}
			return child;
		},

		layoutPriority: 0,
		_setRegionAttr: function(value){
			/// 废弃 this.id + "_splitter"
			var ltr = this.isLeftToRight(),
				p = this._getContainerRiasw(),
				r;
			if(value === "leading"){
				value = ltr ? "left" : "right";
			}else if(value === "trailing"){
				value = ltr ? "right" : "left";
			}else if(value === "client"){
				value = "center";
			}else if(value === "none"){
				value = "";
			}
			// value 和 this.region 有可能是 undefined
			if(!value && !this.region){
				r = false;
			}else{
				r = value !== this.region;
			}
			this._set("region", value);
			if(this.is(["riasw.sys._Gutter"])){
				return;
			}
			var splitter = this._splitterWidget;
			if(!value || value === "center" || (!this.splitter && !this.gutters) || !p){
				if(splitter){
					rias.destroy(splitter);
					this._splitterWidget = undefined;
				}
			}else{
				//if(value !== "center" && (this.splitter || this.gutters) && !splitter && this.id && !rias.by(this.id + "_splitter")){
				if(splitter){
					if(splitter.region !== value){
						splitter.set("region", value);
						splitter.domNode.style.width = "";
						splitter.domNode.style.height = "";
						r = false;
						this._containerLayout(p);
					}
				}else{
					var Splitter = this._getSplitterCtor();
					if(Splitter){
						splitter = new Splitter({
							ownerRiasw: this.getOwnerRiasw(),
							_riaswIdInModule: this._riaswIdInModule ? this._riaswIdInModule + "_spl" : "",
							child: this,
							region: value,
							live: this.liveSplitters,
							parentMinSize: this.minSize,
							parentMaxSize: this.maxSize
						});
						splitter._isSplitter = true;
						this._splitterWidget = splitter;

						// Make the tab order match the visual layout by placing the splitter before or after the pane,
						// depending on where the splitter is visually compared to the pane.
						var before = value === "bottom" || value === (this.isLeftToRight() ? "right" : "left");
						_dom.place(splitter.domNode, this.domNode, before ? "before" : "after");
						r = false;
						splitter._setContainerRiasw(p);

						// Splitters aren't added as Contained children, so we need to call startup explicitly
						splitter.startup();
					}
				}
			}
			if(r){
				this._containerLayout(p);
			}
		},
		_canDoDom: function(){
			return this.domNode && this.domNode.parentNode && !this.isDestroyed(true);
		},
		/// needResize 应该初始化为 false
		//needResize: true,
		_canUpdateSize: function(ignoreVisible){
			this.needResize = !(!this._parentLayoutHandle && !this._debounceLayoutHandle && this.domNode && this.domNode.parentNode && this._started && !this.__updatingSize
				&& !this.isDestroyed(true)
				&& (ignoreVisible || this.get("visible")));
			//if(this.needResize){
			//	console.warn("needResize - " + this.id);
			//}
			return !this.needResize;
		},
		//_resize: function(changeSize){
		//	///用于扩展无 size() 的 Widget 手动刷新。
		//	if(changeSize){
		//		setMarginBox(this.domNode, changeSize);
		//	}
		//	return changeSize;
		//},
		resize: function(changeSize){
			//var _dt0 = new Date();
			//if(this._rcnt == undefined){
			//	this._rcnt = 0;
			//}
			if(this._resize){
				if(!this._canUpdateSize()){
					this._changeSize = rias.mixin(this._changeSize, changeSize);
					//console.debug("resize - " + (new Date() - _dt0) + " ms - " + this.id + " - not_canUpdateSize - ");
					return;
				}
				//this._rcnt++;
				if(this._changeSize || changeSize){
					changeSize = rias.mixin(this._changeSize, changeSize);
				}
				this._changeSize = undefined;
				_dom.noOverflowCall(this.getParentNode(), function(){
					///应该由 _resize 处理 noOverflowCall(this.domNode)
					//_dom.noOverflowCall(this.domNode, function(){
						this._resize(changeSize);
					//}, this);
				}, this);
				//console.debug("_resize - " + (new Date() - _dt0) + " ms - " + this.id + " - " + this._rcnt + " - " + rias.toJson(changeSize));
			}else{
				//this._rcnt++;
				this.needResize = false;
				if(changeSize){
					_dom.setMarginBox(this.domNode, changeSize);
					//console.debug("resize - " + (new Date() - _dt0) + " ms - " + this.id + " - " + this._rcnt + " - " + rias.toJson(changeSize));
				}
			}
		},

		visible: true,
		_setVisibleAttr: function(value){
			value = !!value;
			this._set("visible", value);
			_dom.visible(this.domNode, value);
			this._containerLayout();
		},
		_getVisibleAttr: function(){
			return this._isVisible(true);
		},
		_isVisible: function(checkAncestors){
			/// isVisible 需要判断 parent 是否可见
			///? this 可能是 StackPanel.child，可能在不可见 页，所以不要判断 parent 的可见性。
			return this.visible && _dom.isVisible(this.domNode, checkAncestors);
		},
		onShow: function(){
		},
		_onShow: function(){
			// summary:
			//		Internal method called when this widget is made visible.
			//		See `onShow` for details.
			//console.debug("_onShow: " + this.id);
			if(this.onRestore){
				///注意：restore 没有调用 onRestore。onRestore 是由 PanelBase 处理的
				this.onRestore();
			}
			return this.onShow();
		},
		show: function(){
			this.set("visible", true);
			return this._onShow();
		},
		restore: function(forceVisible, ignoreMax, ignoreCollapsed, child, _deep){
			///注意：restore 没有调用 onRestore。onRestore 是由 PanelBase 处理的
			var self = this,
				d = rias.newDeferred(this.id + ".restore", rias.debugDeferredTimeout ? rias.defaultDeferredTimeout >> 2 : 0, function(){
					this.cancel();
				}),
				dr,
				parent;
			if(!(_deep >= 0)){
				_deep = 0;
			}
			if(self.isDestroyed(true)){
				return d.reject(false);
			}
			if(_deep > (has("deepLimitOfRestore") || 19)){
				console.error("restore _deep: " + _deep);
				d.resolve(self);
			}
			if(forceVisible && _deep < 20){
				/// 用 _getContainerRiasw 好些，即，只处理 containNode 中的 child，不处理其他 node，比如 captionNode/actionBar 中的 node
				/// 如果调用者处理了 ignoreCollapsed ，则可以采用 getParent
				parent = self.getParent();
				///parent = self._getContainerRiasw();
				if(parent && parent !== rias.desktop){
					parent._inHistoryAction = self._inHistoryAction;
					if(rias.isFunction(parent.restore)){
						dr = parent.restore(forceVisible, ignoreMax, ignoreCollapsed, self, ++_deep);
					}else if(!parent.get("visible")){
						parent.show();
					}
				}
				rias.when(dr || true).always(function(){
					d.resolve(self);
				});
			}else{
				d.resolve(self);
			}
			return rias.when(d).always(function(result){
				if(!self._started){
					return rias.when(self.startup()).then(function(){
						return self.show();
					});
				}
				return self.show();
			});
		},
		onHide: function(){
		},
		_onHide: function(){
			return this.onHide();
		},
		hide: function(){
			this.set("visible", false);
			return this._onHide();
		},
		onClose: function(){
		},

		needUpdateHash: false,
		transition: "slide",//"slide", "fade", "flip", "cover", "coverv", "dissolve",
		//"reveal", "revealv", "scaleIn", "scaleOut", "slidev", "swirl", "zoomIn", "zoomOut", "cube", "swap"
		transitionDir: 1,
		transitionTo: function(/*String|Object*/moveTo, /*String*/href, /*String*/url, transition, transitionDir){
			// summary:
			//		Performs a view transition.
			// description:
			//		Given a transition destination, this method performs a view
			//		transition. This method is typically called when this item
			//		is clicked.
			rias.rt.dispatchTransition(this, (moveTo && typeof(moveTo) === "object") ? moveTo : {
				moveTo: moveTo,
				href: href,
				url: url,
				transition: transition || this.transition,
				transitionDir: transitionDir || this.transitionDir
			});
		},

		disabled: false,
		_setDisabledAttr: function(value){
			value = !!value;
			this._set("disabled", value);
			// Set disabled property if focusNode is an <input>, but aria-disabled attribute if focusNode is a <span>.
			// Can't use "disabled" in this.focusNode as a test because on IE, that's true for all nodes.
			var fn = this.focusNode;///riasw.tree.Tree.focusNode 是 function
			if(!rias.isDomNode(fn)){
				fn = this.domNode;
			}
			if(/^(button|input|select|textarea|optgroup|option|fieldset)$/i.test(fn.tagName)){
				_dom.setAttr(fn, 'disabled', value);
			}else{
				fn.setAttribute("aria-disabled", value ? "true" : "false");
			}
			if(this.valueNode){
				_dom.setAttr(this.valueNode, 'disabled', value);
			}

			if(value){
				// reset these, because after the domNode is disabled, we can no longer receive
				// mouse related events, see #4200
				this._set("hovering", false);
				this._set("active", false);

				// clear tab stop(s) on this widget's focusable node(s)  (ComboBox has two focusable nodes)
				var attachPointNames = "tabIndex" in this.attributeMap ? this.attributeMap.tabIndex :
					this._setTabIndexAttr ? this._setTabIndexAttr : this.focusNode ? "focusNode" : "domNode";
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
				if(this.tabIndex !== ""){
					this.set('tabIndex', this.tabIndex);
				}
			}
		},
		_getDisabledAttr: function(){
			return this._isDisabled(true);
		},
		_isDisabled: function(checkAncestors){
			/// isVisible 需要判断 parent 是否可见
			///? this 可能是 StackPanel.child，可能在不可见 页，所以不要判断 parent 的可见性。
			return this.disabled || _dom.isDisabled(this.domNode, checkAncestors);
		},

		_focusManager: focus,
		focused: false,
		// scrollOnFocus: Boolean
		//		On focus, should this widget scroll into view?
		scrollOnFocus: true,
		_setFocusedAttr: function(value){
			//console.debug(this.id, "focused", value);
			this._set("focused", !!value);
		},
		isFocusable: function (node) {
			//return this.focus && !this.disabled && !this.readOnly && rias.a11y.isFocusable(this.focusNode || this.domNode);
			//return !!this.focus && !this.disabled && rias.a11y.isFocusable(this.focusNode || this.domNode);
			if(!this.focus || this.get("disabled") || this.get("readOnly") || !this.get("visible") || this.isDestroyed(true)){
				return undefined;
			}
			return (this._focusableNode = this._getFocusableNode(node));
		},
		_getFocusableNode: function(node){
			if(!_dom.isDescendant(node, this.domNode)){
				node = undefined;
			}
			if(!rias.a11y.isFocusable(node) && rias.a11y.isFocusable(this.focusNode || this.domNode)){
				node = this.focusNode || this.domNode;
			}
			return node;
		},
		_needFocus: function(){
			if(!this.isFocusable()){
				return false;
			}
			var i = _dom.focusedStack ? _dom.focusedStack.indexOf(this.id) : -1;
			return i < 0 || i === _dom.focusedStack.length - 1;
		},
		focus: function(node, forceVisible){
			//var w;
			//console.debug("focus - ", this.id);
			var self = this;
			function _do(){
				if(rias.isRiasw(node)){
					node = node.domNode;
				}else if(!rias.isDomNode(node)){
					node = undefined;
				}
				if(self.isFocusable(node)){
					//_dom.focus(self.focusNode || self.domNode);
					_dom.focus(self._focusableNode);
					if(self.scrollOnFocus){
						self.defer(function(){
							rias.dom.scrollIntoView(self._focusableNode);
						}); // without defer, the input caret position can change on mouse click
					}
				}
			}

			if(!this.isDestroyed(true)){
				//if(this._needFocus()){///避免重复 focus，导致重定向和 blur
				if(forceVisible){
					/// !this._getContainerRiasw() 表示 this 不属于 containNode 中的 child，需要 ignoreCollapsed
					this.restore(true, true, !this._getContainerRiasw()).then(function(result){
						_do();
					});
				}else{
					_do();
				}
				//}
				//console.debug("focused", this.id, this._focusManager.get("currNode") ? this._focusManager.get("currNode").id : "");
			}
		},
		onFocus: function(){
		},
		onBlur: function(){
		},
		_onFocus: function(){
			//console.debug("_onFocus - " + this.id + " - " + rias.__dt() + " ms.");
			this.onFocus();
		},
		_onBlur: function(){
			//console.debug("_onBlur - " + this.id + " - " + rias.__dt() + " ms.");
			this.onBlur();
		},

		_destroyPopupMenu: function(){
			if(this._popupMenu){
				if(this._popupMenu.getOwnerRiasw() === this){
					rias.destroy(this._popupMenu);
				}else{
					this._popupMenu.removeTarget(this);
				}
				delete this._popupMenu;
			}
			delete this.popupMenu;///popupMenu 是定义，_popupMenu 才是实例。
		},
		_setPopupMenuAttr: function(value){
			this._destroyPopupMenu();
			var self = this;

			function _do(menu){
				menu = rias.by(menu, this);/// 有可能是 String
				if(!rias.is(menu, "riasw.sys.Menu")){
					return;
				}
				menu.addTarget(self);
				self.set("_popupMenu", menu);
			}

			self._set("popupMenu", value);
			if(rias.isRiaswParam(value)){
				rias.parseRiasws(value, this, rias.desktop).then(function(result){
					if(result && result.widgets){
						_do(result.widgets[0]);
					}
				});
			}else{
				_do(value);
			}
		}

	});

	if(has("riasw-bidi")){
		var bidi_const = {
			LRM : '\u200E',
			LRE : '\u202A',
			PDF : '\u202C',
			RLM : '\u200f',
			RLE : '\u202B'
		};
		_WidgetBase.extend({
			// summary:
			//		When has("riasw-bidi") is true, _WidgetBase will mixin this class.   It enables support for the textdir
			//		property to control text direction independently from the GUI direction.
			// description:
			//		There's a special need for displaying BIDI text in rtl direction
			//		in ltr GUI, sometimes needed auto support.
			//		In creation of widget, if it's want to activate this class,
			//		the widget should define the "textDir".

			_checkContextual: function(text){
				// summary:
				//		Finds the first strong (directional) character, return ltr if isLatin
				//		or rtl if isBidiChar.
				// tags:
				//		private.

				// look for strong (directional) characters
				var fdc = /[A-Za-z\u05d0-\u065f\u066a-\u06ef\u06fa-\u07ff\ufb1d-\ufdff\ufe70-\ufefc]/.exec(text);
				// if found return the direction that defined by the character, else return widgets dir as defult.
				return fdc ? ( fdc[0] <= 'z' ? "ltr" : "rtl" ) : this.dir ? this.dir : this.isLeftToRight() ? "ltr" : "rtl";
			},

			getTextDir: function(/*String*/ text){
				// summary:
				//		Gets the right direction of text.
				// description:
				//		If textDir is ltr or rtl returns the value.
				//		If it's auto, calls to another function that responsible
				//		for checking the value, and defining the direction.
				// tags:
				//		protected.
				return this.textDir === "auto" ? this._checkContextual(text) : this.textDir;
			},
			_onSetTextDir: function(textDir){
			},
			_setTextDirAttr: function(/*String*/ textDir){
				// summary:
				//		Setter for textDir.
				// description:
				//		Users shouldn't call this function; they should be calling
				//		set('textDir', value)
				if(!this._created || this.textDir !== textDir){
					this._set("textDir", textDir);
					if(this.badgeText){
						//this.badgeText.innerHTML = this.enforceTextDirWithUcc(this.removeUCCFromText(this.badgeText.innerHTML));
						this.applyTextDir(this.badgeText);
					}
					if(this.labelNode){
						//this.labelNode.innerHTML = this.enforceTextDirWithUcc(this.removeUCCFromText(this.labelNode.innerHTML));
						this.applyTextDir(this.labelNode);
					}
					var node = null;
					if(this.displayNode){
						node = this.displayNode;
						this.displayNode.align = this.dir === "rtl" ? "right" : "left";
					}else{
						node = this.textDirNode || this.focusNode || this.textbox;
					}
					if(node){
						this.applyTextDir(node);
					}
					this._onSetTextDir(this.textDir);
				}
			},
			setTextDirForChildren: function(){
				// summary:
				//		Sets textDir property to children.
				// widget:
				//		parent widget
				if (this.textDir){
					rias.forEach(this.getChildren(), function(w){
						w.set("textDir", this.textDir);
					}, this);
				}
			},
			applyTextDir: function(/*DOMNode*/ element, /*String?*/ text){
				// summary:
				//		Set element.dir according to this.textDir, assuming this.textDir has a value.
				// element:
				//		The text element to be set. Should have dir property.
				// text:
				//		If specified, and this.textDir is "auto", for calculating the right transformation
				//		Otherwise text read from element.
				// description:
				//		If textDir is ltr or rtl returns the value.
				//		If it's auto, calls to another function that responsible
				//		for checking the value, and defining the direction.
				// tags:
				//		protected.

				if(this.textDir){
					var textDir = this.textDir;
					if(textDir === "auto"){
						// convert "auto" to either "ltr" or "rtl"
						if(typeof text === "undefined"){
							// text not specified, get text from element
							var tagName = element.tagName.toLowerCase();
							text = (tagName === "input" || tagName === "textarea") ? element.value : element.innerText || element.textContent || "";
						}
						textDir = this._checkContextual(text);
					}

					if(element.dir !== textDir){
						// set element's dir to match textDir, but not when textDir is null and not when it already matches
						element.dir = textDir;
					}
				}
			},
			enforceTextDirWithUcc: function(text){
				// summary:
				//		Wraps by UCC (Unicode control characters) option's text according to this.textDir
				// option:
				//		The element (`<option>`) we wrapping the text for.
				// text:
				//		The text to be wrapped.
				// description:
				//		There's a dir problem with some HTML elements. For some elements (e.g. `<option>`, `<select>`)
				//		defining the dir in different direction then the GUI orientation, won't display correctly.
				//		FF 3.6 will change the alignment of the text in option - this doesn't follow the bidi standards (static text
				//		should be aligned following GUI direction). IE8 and Opera11.10 completely ignore dir setting for `<option>`.
				//		Therefore the only solution is to use UCC (Unicode  control characters) to display the text in correct orientation.
				//		This function saves the original text value for later restoration if needed, for example if the textDir will change etc.
				if(this.textDir){
					if (text){
						text = text.replace(/\u202A|\u202B|\u202C/g, "");
					}
					var dir = this.textDir === "auto" ? this._checkContextual(text) : this.textDir;
					return (dir === "ltr" ? bidi_const.LRE : bidi_const.RLE ) + text + bidi_const.PDF;
				}
				return text;
			},
			removeUCCFromText: function(text){
				// summary:
				//		Removes UCC from input string.
				// text:
				//		The text to be stripped from UCC.
				if (!text){
					return text;
				}
				return text.replace(/\u202A|\u202B|\u202C/g, "");
			}
		});
	}

	rias.require([
		"riasw/sys/Tooltip",
		"riasw/sys/_Gutter",
		"riasw/sys/_Splitter",
		"riasw/sys/ToggleSplitter"
	], function(cTooltip, c_Gutter, c_Splitter, cToggleSplitter){
		Tooltip = cTooltip;
		_Gutter = c_Gutter;
		_Splitter = c_Splitter;
		ToggleSplitter = cToggleSplitter;
	});

	return _WidgetBase;
});
