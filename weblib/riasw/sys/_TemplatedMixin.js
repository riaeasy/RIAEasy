define([
	"riasw/riaswBase",
	"dojo/parser"
], function(rias, parser){

	// module:
	//		riasw/sys/_TemplatedMixin

	var synthEvents = rias.delegate(rias.touch, {
		//"keypress": connect._keypress	// remove for 2.0,
		"mouseenter": rias.mouse.enter,
		"mouseleave": rias.mouse.leave
	});

	var _TemplatedMixin = rias.declare("riasw.sys._TemplatedMixin", null, {
		// summary:
		//		Mixin for widgets that are instantiated from a template

		// templateString: [protected] String
		//		A string that represents the widget template.
		//		Use in conjunction with dojo.cache() to load from a file.
		templateString: null,
		// skipNodeCache: [protected] Boolean
		//		If using a cached widget template nodes poses issues for a
		//		particular widget class, it can set this property to ensure
		//		that its template is always re-built from a string
		_skipNodeCache: false,
		/*=====
		// _rendered: Boolean
		//		Not normally use, but this flag can be set by the app if the server has already rendered the template,
		//		i.e. already inlining the template for the widget into the main page.   Reduces _TemplatedMixin to
		//		just function like _AttachMixin.
		_rendered: false,
		=====*/
		// Set _AttachMixin.searchContainerNode to true for back-compat for widgets that have data-dojo-attach-point's
		// and events inside this.containerNode.   Remove for 2.0.
		searchContainerNode: true,

		// _earlyTemplatedStartup: Boolean
		//		A fallback to preserve the 1.0 - 1.3 behavior of children in
		//		templates having their startup called before the parent widget
		//		fires postCreate. Defaults to 'false', causing child widgets to
		//		have their .startup() called immediately before a parent widget
		//		.startup(), but always after the parent .postCreate(). Set to
		//		'true' to re-enable to previous, arguably broken, behavior.
		_earlyTemplatedStartup: false,
		// contextRequire: Function
		//		Used to provide a context require to the dojo/parser in order to be
		//		able to use relative MIDs (e.g. `./Widget`) in the widget's template.
		contextRequire: null,

		/// _AttachMixin ===================================== ///
		constructor: function(/*===== params, srcNodeRef =====*/){
			// summary:
			//		Create the widget.
			// params: Object|null
			//		Hash of initialization parameters for widget, including scalar values (like title, duration etc.)
			//		and functions, typically callbacks like onClick.
			//		The hash can contain any of the widget's properties, excluding read-only properties.
			// srcNodeRef: DOMNode|String?
			//		If a srcNodeRef (DOM node) is specified, replace srcNodeRef with my generated DOM tree.

			this._attachPoints = [];
			this._attachEvents = [];
			//this.dojoAttachEvent = "";
			//this.dojoAttachPoint = "";
		},
		buildRendering: function(){
			// summary:
			//		Construct the UI for this widget from a template, setting this.domNode.
			// tags:
			//		protected

			if(!this._rendered){
				// Lookup cached version of template, and download to cache if it
				// isn't there already.  Returns either a DomNode or a string, depending on
				// whether or not the template contains ${foo} replacement parameters.
				var cached = _TemplatedMixin.getCachedTemplate(this.templateString, this._skipNodeCache, this.ownerDocument);

				var node;
				if(rias.isString(cached)){
					node = rias.dom.toDom(this._stringRepl(cached), this.ownerDocument);
					if(node.nodeType !== 1){
						// Flag common problems such as templates with multiple top level nodes (nodeType == 11)
						throw new Error("Invalid template: " + cached);
					}
				}else{
					// if it's a node, all we have to do is clone it
					node = cached.cloneNode(true);
				}

				this.domNode = node;
			}

			// Call down to _WidgetBase.buildRendering() to get base classes assigned
			// TODO: change the baseClass assignment to _setBaseClassAttr
			this.inherited(arguments);
			// recurse through the node, looking for, and attaching to, our
			// attachment points and events, which should be defined on the template node.
			this._attachTemplateNodes(this.domNode);
			this._beforeFillContent();		// hook for _WidgetsInTemplateMixin

			if(!this._rendered){
				this._fillContent(this.srcNodeRef);
			}

			this._badgeNode0 = this.badgeNode;
			this._iconNode0 = this.iconNode;
			this._labelNode0 = this.labelNode;
			this._valueNode0 = this.valueNode;

			this._rendered = true;
		},
		destroyRendering: function(){
			this._detachTemplateNodes();
			this.inherited(arguments);

			delete this._badgeNode0;
			delete this._iconNode0;
			delete this._labelNode0;
			delete this._valueNode0;
		},

		_beforeFillContent: function(){
			// Short circuit the parser when the template doesn't contain any widgets.  Note that checking against
			// this.templateString is insufficient because the data-dojo-type=... may appear through a substitution
			// variable, like in ConfirmDialog, where the widget is hidden inside of the ${!actionBarTemplate}.
			if(/dojoType|data-dojo-type/i.test(this.domNode.innerHTML)){
				// Before copying over content, instantiate widgets in template
				var self = this,
					node = this.domNode;

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
				}).then(function(widgets){
					self._startupWidgets = widgets;

					// _WidgetBase::destroy() will destroy any supporting widgets under this.domNode.
					// If we wanted to, we could call this.own() on anything in this._startupWidgets that was moved outside
					// of this.domNode (like Dialog, which is moved to <body>).

					// Hook up attach points and events for nodes that were converted to widgets
					for(var i = 0; i < widgets.length; i++){
						self._processTemplateNode(widgets[i], function(n,p){
							// callback to get a property of a widget
							return n[p];
						}, function(widget, type, callback){
							// callback to do data-dojo-attach-event to a widget
							if(type in widget){
								// back-compat, remove for 2.0
								//return widget.connect(widget, type, callback);
								return widget.after(type, callback, true);
							}else{
								// 1.x may never hit this branch, but it's the default for 2.0
								return widget.on(type, callback, true);
							}
						});
					}

					// Cleanup flag set above, just in case
					if(self.containerNode && self.containerNode.stopParser){
						delete self.containerNode.stopParser;
					}
				});

				if(!this._startupWidgets){
					throw new Error(this.declaredClass + ": parser returned unfilled promise (probably waiting for module auto-load), " +
						"unsupported by _WidgetsInTemplateMixin.   Must pre-load all supporting widgets before instantiation.");
				}
			}
		},
		_attachTemplateNodes: function(rootNode){
			// summary:
			//		Iterate through the dom nodes and attach functions and nodes accordingly.
			// description:
			//		Map widget properties and functions to the handlers specified in
			//		the dom node and it's descendants. This function iterates over all
			//		nodes and looks for these properties:
			//
			//		- dojoAttachPoint/data-dojo-attach-point
			//		- dojoAttachEvent/data-dojo-attach-event
			// rootNode: DomNode
			//		The node to search for properties. All descendants will be searched.
			// tags:
			//		private

			// DFS to process all nodes except those inside of this.containerNode
			var node = rootNode;
			while(true){
				if(node.nodeType === 1 && (this._processTemplateNode(node, function(n,p){
						return n.getAttribute(p);
					}, this._attach) || this.searchContainerNode) && node.firstChild){
					node = node.firstChild;
				}else{
					if(node === rootNode){
						return;
					}
					while(!node.nextSibling){
						node = node.parentNode;
						if(node === rootNode){
							return;
						}
					}
					node = node.nextSibling;
				}
			}
		},
		_processTemplateNode: function(/*DOMNode|Widget*/ baseNode, getAttrFunc, attachFunc){
			// summary:
			//		Process data-dojo-attach-point and data-dojo-attach-event for given node or widget.
			//		Returns true if caller should process baseNode's children too.

			if(getAttrFunc(baseNode, "dojoType") || getAttrFunc(baseNode, "data-dojo-type")){
				return true;
			}

			var ret = true;

			// Process data-dojo-attach-point
			var _attachScope = this.attachScope || this,
				attachPoint = getAttrFunc(baseNode, "dojoAttachPoint") || getAttrFunc(baseNode, "data-dojo-attach-point");
			if(attachPoint){
				var point,
					points = attachPoint.split(/\s*,\s*/);
				while((point = points.shift())){
					if(rias.isArray(_attachScope[point])){
						_attachScope[point].push(baseNode);
					}else{
						_attachScope[point] = baseNode;
					}
					ret = (point !== "containerNode");
					this._attachPoints.push(point);
				}
			}

			// Process data-dojo-attach-event
			var attachEvent = getAttrFunc(baseNode, "dojoAttachEvent") || getAttrFunc(baseNode, "data-dojo-attach-event");
			if(attachEvent){
				// NOTE: we want to support attributes that have the form
				// "domEvent: nativeEvent, ..."
				var event, events = attachEvent.split(/\s*,\s*/);
				var trim = rias.trim;
				while((event = events.shift())){
					if(event){
						var thisFunc = null;
						if(event.indexOf(":") !== -1){
							// oh, if only JS had tuple assignment
							var funcNameArr = event.split(":");
							event = trim(funcNameArr[0]);
							thisFunc = trim(funcNameArr[1]);
						}else{
							event = trim(event);
						}
						if(!thisFunc){
							thisFunc = event;
						}

						this._attachEvents.push(attachFunc(baseNode, event, rias.hitch(_attachScope, thisFunc)));
					}
				}
			}

			return ret;
		},
		_attach: function(node, type, func){
			// summary:
			//		Roughly corresponding to dojo/on, this is the default function for processing a
			//		data-dojo-attach-event.  Meant to attach to DOMNodes, not to widgets.
			// node: DOMNode
			//		The node to setup a listener on.
			// type: String
			//		Event name like "click".
			// getAttrFunc: Function
			//		Function to get the specified property for a given DomNode/Widget.
			// attachFunc: Function?
			//		Attaches an event handler from the specified node/widget to specified function.

			// Map special type names like "mouseenter" to synthetic events.
			// Subclasses are responsible to require() riasw/a11yclick if they want to use it.
			type = type.replace(/^on/, "").toLowerCase();
			if(type === "dijitclick"){
				type = rias.a11yclick;
			}else{
				type = synthEvents[type] || type;
			}

			return rias.on(node, type, func);
		},
		_detachTemplateNodes: function() {
			// summary:
			//		Detach and clean up the attachments made in _attachtempalteNodes.

			// Delete all attach points to prevent IE6 memory leaks.
			var _attachScope = this.attachScope || this,
				point;
			//rias.forEach(this._attachPoints, function(point){
			//	delete _attachScope[point];
			//});
			//this._attachPoints = [];
			while((point = this._attachPoints.pop())){
				delete _attachScope[point];
			}

			// And same for event handlers
			rias.forEach(this._attachEvents, function(handle, i, arr){
				handle.remove();
				arr[i] = undefined;
			});
			this._attachEvents = [];
		},

		/// ===================================== ///
		_stringRepl: function(tmpl){
			// summary:
			//		Does substitution of ${foo} type properties in template string
			// tags:
			//		private
			var className = this.declaredClass, _this = this;
			// Cache contains a string because we need to do property replacement
			// do the property replacement
			return rias.substitute(tmpl, this, function(value, key){
				if(key.charAt(0) === '!'){
					value = rias.getObject(key.substr(1), false, _this);
				}
				if(typeof value === "undefined"){
					throw new Error(className+" template:"+key);
				} // a debugging aide
				if(value == null){
					return "";
				}

				// Substitution keys beginning with ! will skip the transform step,
				// in case a user wishes to insert unescaped markup, e.g. ${!foo}
				return key.charAt(0) === "!" ? value : this._escapeValue("" + value);
			}, this);
		},
		_escapeValue: function(/*String*/ val){
			// summary:
			//		Escape a value to be inserted into the template, either into an attribute value
			//		(ex: foo="${bar}") or as inner text of an element (ex: <span>${foo}</span>)

			// Safer substitution, see heading "Attribute values" in
			// http://www.w3.org/TR/REC-html40/appendix/notes.html#h-B.3.2
			// and also https://www.owasp.org/index.php/XSS_%28Cross_Site_Scripting%29_Prevention_Cheat_Sheet#RULE_.231_-_HTML_Escape_Before_Inserting_Untrusted_Data_into_HTML_Element_Content
			return val.replace(/["'<>&]/g, function(val){
				return {
					"&": "&amp;",
					"<": "&lt;",
					">": "&gt;",
					"\"": "&quot;",
					"'": "&#x27;"
				}[val];
			});
		},

		_fillContent: function(/*DomNode*/ source){
			// summary:
			//		Relocate source contents to templated container node.
			//		this.containerNode must be able to receive children, or exceptions will be thrown.
			// tags:
			//		protected
			var dest = this.containerNode;
			if(source && dest){
				while(source.hasChildNodes()){
					dest.appendChild(source.firstChild);
				}
			}
		},

		startup: function(){
			rias.forEach(this._startupWidgets, function(w){
				if(w && !w._started && w.startup){
					w.startup();
				}
			});
			this._startupWidgets = null;
			this.inherited(arguments);
		}

	});

	// key is templateString; object is either string or DOM tree
	_TemplatedMixin._templateCache = {};

	_TemplatedMixin.getCachedTemplate = function(templateString, alwaysUseString, doc){
		// summary:
		//		Static method to get a template based on the templatePath or
		//		templateString key
		// templateString: String
		//		The template
		// alwaysUseString: Boolean
		//		Don't cache the DOM tree for this template, even if it doesn't have any variables
		// doc: Document?
		//		The target document.   Defaults to document global if unspecified.
		// returns: Mixed
		//		Either string (if there are ${} variables that need to be replaced) or just
		//		a DOM tree (if the node can be cloned directly)

		// is it already cached?
		var tmplts = _TemplatedMixin._templateCache;
		var key = templateString;
		var cached = tmplts[key];
		if(cached){
			try{
				// if the cached value is an innerHTML string (no ownerDocument) or a DOM tree created within the
				// current document, then use the current cached value
				if(!cached.ownerDocument || cached.ownerDocument === (doc || document)){
					// string or node of the same document
					return cached;
				}
			}catch(e){ /* squelch */ } // IE can throw an exception if cached.ownerDocument was reloaded
			rias.dom.destroy(cached);
		}

		templateString = rias.trim(templateString);

		if(alwaysUseString || templateString.match(/\$\{([^\}]+)\}/g)){
			// there are variables in the template so all we can do is cache the string
			return (tmplts[key] = templateString); //String
		}else{
			// there are no variables in the template so we can cache the DOM tree
			var node = rias.dom.toDom(templateString, doc);
			if(node.nodeType !== 1){
				throw new Error("Invalid template: " + templateString);
			}
			return (tmplts[key] = node); //Node
		}
	};

	if(rias.has("ie")){
		rias.on(window, "unload", function(){
			var cache = _TemplatedMixin._templateCache;
			for(var key in cache){
				var value = cache[key];
				if(typeof value === "object"){ // value is either a string or a DOM node template
					rias.dom.destroy(value);
				}
				delete cache[key];
			}
		});
	}

	return _TemplatedMixin;
});
