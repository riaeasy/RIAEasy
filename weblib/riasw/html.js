
define([
	"exports",
	"riasw/hostDojo",
	"riasw/xhr",
	"./html/entities",
	"./html/format"
], function(exports, rias, riasXhr, _entities, _format){

	var _dom = rias.dom;

	function secureForInnerHtml(/*String*/ cont){
		// summary:
		//		removes !DOCTYPE and title elements from the html string.
		//
		//		khtml is picky about dom faults, you can't attach a style or `<title>` node as child of body
		//		must go into head, so we need to cut out those tags
		// cont:
		//		An html string for insertion into the dom
		//
		return cont.replace(/(?:\s*<!DOCTYPE\s[^>]+>|<title[^>]*>[\s\S]*?<\/title>)/ig, ""); // String
	}
	function setNodeContent(/*DomNode*/ node, /*String|DomNode|NodeList*/ cont, emptyAll){
		// summary:
		//		inserts the given content into the given node
		// node:
		//		the parent element
		// content:
		//		the content to be set on the parent element.
		//		This can be an html string, a node reference or a NodeList, dojo/NodeList, Array or other enumerable list of nodes

		if(emptyAll){
			_dom.empty(node);
		}

		var a = [],
			i, l;
		if(cont){
			if(typeof cont === "number"){
				cont = cont.toString();
			}
			if(typeof cont === "string"){
				cont = _dom.toDom(cont, node.ownerDocument);
			}
			if(!cont.nodeType && rias.isArrayLike(cont)){
				// handle as enumerable, but it may shrink as we enumerate it
				for(l = cont.length, i = 0; i < cont.length; i = (l === cont.length ? i + 1 : 0)){
					a.push(cont[i]);
					_dom.place( cont[i], node, "last");
				}
			}else{
				if(cont.nodeType === 11){
					for(i = 0, l = cont.childNodes.length; i < l; i++){
						a.push(cont.childNodes[i]);
					}
				}else if(rias.isArrayLike(cont)){
					for(i = 0, l = cont.length; i < l; i++){
						a.push(cont[i]);
					}
				}else{
					a.push(cont);
				}
				// pass nodes, documentFragments and unknowns through to dojo.place
				_dom.place(cont, node, "last");
			}
		}

		// return DomNode
		return a;
	}

	var idCounter = 0;
	if(rias.has("ie")){
		var alphaImageLoader = /(AlphaImageLoader\([^)]*?src=(['"]))(?![a-z]+:|\/)([^\r\n;}]+?)(\2[^)]*\)\s*[;}]?)/g;
	}
	var cssPaths = /(?:(?:@import\s*(['"])(?![a-z]+:|\/)([^\r\n;{]+?)\1)|url\(\s*(['"]?)(?![a-z]+:|\/)([^\r\n;]+?)\3\s*\))([a-z, \s]*[;}]?)/g;
	var htmlAttrPaths = /(<[a-z][a-z0-9]*\s[^>]*)(?:(href|src)=(['"]?)([^>]*?)\3|style=(['"]?)([^>]*?)\5)([^>]*>)/gi;

	_dom.html = exports;
	rias.mixin(exports, {
		_adjustCssPaths: function(cssUrl, cssText){
			// summary:
			//		adjusts relative paths in cssText to be relative to cssUrl
			//		a path is considered relative if it doesn't start with '/' and not contains ':'
			// description:
			//		Say we fetch a HTML page from level1/page.html
			//		It has some inline CSS:
			//	|		@import "css/page.css" tv, screen;
			//	|		...
			//	|		background-image: url(images/aplhaimage.png);
			//
			//		as we fetched this HTML and therefore this CSS
			//		from level1/page.html, these paths needs to be adjusted to:
			//	|		@import 'level1/css/page.css' tv, screen;
			//	|		...
			//	|		background-image: url(level1/images/alphaimage.png);
			//
			//		In IE it will also adjust relative paths in AlphaImageLoader()
			//	|		filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='images/alphaimage.png');
			//		will be adjusted to:
			//	|		filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='level1/images/alphaimage.png');
			//
			//		Please note that any relative paths in AlphaImageLoader in external css files wont work, as
			//		the paths in AlphaImageLoader is MUST be declared relative to the HTML page,
			//		not relative to the CSS file that declares it

			if(!cssText || !cssUrl){
				return;
			}

			// support the ImageAlphaFilter if it exists, most people use it in IE 6 for transparent PNGs
			// We are NOT going to kill it in IE 7 just because the PNGs work there. Somebody might have
			// other uses for it.
			// If user want to disable css filter in IE6  he/she should
			// unset filter in a declaration that just IE 6 doesn't understands
			// like * > .myselector { filter:none; }
			if(alphaImageLoader){
				cssText = cssText.replace(alphaImageLoader, function(ignore, pre, delim, url, post){
					return pre + (new rias._Url(cssUrl, './'+url).toString()) + post;
				});
			}

			return cssText.replace(cssPaths, function(ignore, delimStr, strUrl, delimUrl, urlUrl, media){
				if(strUrl){
					return '@import "' + (new rias._Url(cssUrl, './'+strUrl).toString()) + '"' + media;
				}else{
					return 'url(' + (new rias._Url(cssUrl, './'+urlUrl).toString()) + ')' + media;
				}
			});
		},
		_adjustHtmlPaths: function(htmlUrl, cont){
			var url = htmlUrl || "./";

			return cont.replace(htmlAttrPaths,
				function(tag, start, name, delim, relUrl, delim2, cssText, end){
					return start + (name ?
						(name + '=' + delim + (new rias._Url(url, relUrl).toString()) + delim) :
						('style=' + delim2 + exports._adjustCssPaths(url, cssText) + delim2)
					) + end;
				}
			);
		},
		_snarfStyles: function(/*String*/cssUrl, /*String*/cont, /*Array*/styles){
			/****************  cut out all <style> and <link rel="stylesheet" href=".."> **************/
				// also return any attributes from this tag (might be a media attribute)
				// if cssUrl is set it will adjust paths accordingly
			styles.attributes = [];

			cont = cont.replace(/<[!][-][-](.|\s)*?[-][-]>/g,
				function(comment){
					return comment.replace(/<(\/?)style\b/ig,"&lt;$1Style").replace(/<(\/?)link\b/ig,"&lt;$1Link").replace(/@import "/ig,"@ import \"");
				}
			);
			return cont.replace(/(?:<style([^>]*)>([\s\S]*?)<\/style>|<link\s+(?=[^>]*rel=['"]?stylesheet)([^>]*?href=(['"])([^>]*?)\4[^>\/]*)\/?>)/gi,
				function(ignore, styleAttr, cssText, linkAttr, delim, href){
					// trim attribute
					var i, attr = (styleAttr||linkAttr||"").replace(/^\s*([\s\S]*?)\s*$/i, "$1");
					if(cssText){
						i = styles.push(cssUrl ? exports._adjustCssPaths(cssUrl, cssText) : cssText);
					}else{
						i = styles.push('@import "' + href + '";');
						attr = attr.replace(/\s*(?:rel|href)=(['"])?[^\s]*\1\s*/gi, ""); // remove rel=... and href=...
					}
					if(attr){
						attr = attr.split(/\s+/);// split on both "\n", "\t", " " etc
						var atObj = {}, tmp;
						for(var j = 0, e = attr.length; j < e; j++){
							tmp = attr[j].split('='); // split name='value'
							atObj[tmp[0]] = tmp[1].replace(/^\s*['"]?([\s\S]*?)['"]?\s*$/, "$1"); // trim and remove ''
						}
						styles.attributes[i - 1] = atObj;
					}
					return "";
				}
			);
		},
		_snarfScripts: function(cont, byRef){
			// summary:
			//		strips out script tags from cont
			// byRef:
			//		byRef = {errBack:function(){/*add your download error code here*/, downloadRemote: true(default false)}}
			//		byRef will have {code: 'jscode'} when this scope leaves
			byRef.code = "";

			//Update script tags nested in comments so that the script tag collector doesn't pick
			//them up.
			cont = cont.replace(/<[!][-][-](.|\s)*?[-][-]>/g,
				function(comment){
					return comment.replace(/<(\/?)script\b/ig,"&lt;$1Script");
				}
			);

			function download(src){
				if(byRef.downloadRemote){
					// console.debug('downloading',src);
					//Fix up src, in case there were entity character encodings in it.
					//Probably only need to worry about a subset.
					src = src.replace(/&([a-z0-9#]+);/g, function(m, name) {
						switch(name) {
							case "amp"	: return "&";
							case "gt"	: return ">";
							case "lt"	: return "<";
							default:
								return name.charAt(0) ==="#" ? String.fromCharCode(name.substring(1)) : "&" + name + ";";
						}
					});
					riasXhr.get({
						url: src,
						sync: true,
						load: function(code){
							if(byRef.code !=="") {
								code = "\n" + code;
							}
							byRef.code += code+";";
						},
						error: byRef.errBack
					});
				}
			}

			// match <script>, <script type="text/..., but not <script type="dojo(/method)...
			return cont.replace(/<script\s*(?![^>]*type=['"]?(?:dojo\/|text\/html\b))[^>]*?(?:src=(['"]?)([^>]*?)\1[^>]*)?>([\s\S]*?)<\/script>/gi,
				function(ignore, delim, src, code){
					if(src){
						download(src);
					}else{
						if(byRef.code !=="") {
							code = "\n" + code;
						}
						byRef.code += code+";";
					}
					return "";
				}
			);
		},
		evalInGlobal: function(code, appendNode){
			// we do our own eval here as dojo.eval doesn't eval in global crossbrowser
			// This work X browser but but it relies on a DOM
			// plus it doesn't return anything, thats unrelevant here but not for dojo core
			appendNode = appendNode || _dom.doc.body;
			var n = appendNode.ownerDocument.createElement('script');
			n.type = "text/javascript";
			appendNode.appendChild(n);
			n.text = code; // DOM 1 says this should work
		},

		setContent: function(/*DomNode*/ node, /*String|DomNode|NodeList*/ cont, /*Object?*/ params){
			// summary:
			//		inserts (replaces) the given content into the given node. dojo/dom-construct.place(cont, node, "only")
			//		may be a better choice for simple HTML insertion.
			// description:
			//		Unless you need to use the params capabilities of this method, you should use
			//		dojo/dom-construct.place(cont, node, "only"). dojo/dom-construct..place() has more robust support for injecting
			//		an HTML string into the DOM, but it only handles inserting an HTML string as DOM
			//		elements, or inserting a DOM node. dojo/dom-construct..place does not handle NodeList insertions
			//		dojo/dom-construct.place(cont, node, "only"). dojo/dom-construct.place() has more robust support for injecting
			//		an HTML string into the DOM, but it only handles inserting an HTML string as DOM
			//		elements, or inserting a DOM node. dojo/dom-construct.place does not handle NodeList insertions
			//		or the other capabilities as defined by the params object for this method.
			// node:
			//		the parent element that will receive the content
			// cont:
			//		the content to be set on the parent element.
			//		This can be an html string, a node reference or a NodeList, dojo/NodeList, Array or other enumerable list of nodes
			// params:
			//		Optional flags/properties to configure the content-setting. See dojo/html/_ContentSetter
			// example:
			//		A safe string/node/nodelist content replacement/injection with hooks for extension
			//		Example Usage:
			//	|	html.set(node, "some string");
			//	|	html.set(node, contentNode, {options});
			//	|	html.set(node, myNode.childNodes, {options});
			if(undefined == cont){
				console.warn("rias.html.setContent: no cont argument provided, using empty string");
				cont = "";
			}
			if (typeof cont === 'number'){
				cont = cont.toString();
			}
			if(!params){
				// simple and fast
				return setNodeContent(node, cont, true);
			}else{
				// more options but slower
				// note the arguments are reversed in order, to match the convention for instantiation via the parser
				var op = new _ContentSetter(rias.mixin(params, {
					content: cont,
					node: node
				}));
				return op.setContent();
			}
		},

		entities: _entities,
		format: _format
	});

	var _ContentSetter = rias.declare("rias.dom.html._ContentSetter", null, {
		// node: DomNode|String
		//		An node which will be the parent element that we set content into
		node: "",

		// content: String|DomNode|DomNode[]
		//		The content to be placed in the node. Can be an HTML string, a node reference, or a enumerable list of nodes
		content: "",

		// id: String?
		//		Usually only used internally, and auto-generated with each instance
		id: "",

		// cleanContent: Boolean
		//		Should the content be treated as a full html document,
		//		and the real content stripped of <html>, <body> wrapper before injection
		cleanContent: false,

		// extractContent: Boolean
		//		Should the content be treated as a full html document,
		//		and the real content stripped of `<html> <body>` wrapper before injection
		extractContent: false,

		// parseContent: Boolean
		//		Should the node by passed to the parser after the new content is set
		parseContent: false,

		// parserScope: String
		//		Flag passed to parser.	Root for attribute names to search for.	  If scopeName is dojo,
		//		will search for data-dojo-type (or dojoType).  For backwards compatibility
		//		reasons defaults to dojo._scopeName (which is "dojo" except when
		//		multi-version support is used, when it will be something like dojo16, dojo20, etc.)
		parserScope: dojo._scopeName,// kernel._scopeName,

		// startup: Boolean
		//		Start the child widgets after parsing them.	  Only obeyed if parseContent is true.
		startup: true,

		adjustPaths: false,
		referencePath: ".",
		renderStyles: false,

		executeScripts: false,
		scriptHasHooks: false,
		scriptHookReplacement: null,

		// lifecycle methods
		constructor: function(/*Object*/ params, /*String|DomNode*/ node){
			// summary:
			//		Provides a configurable, extensible object to wrap the setting on content on a node
			//		call the set() method to actually set the content..

			// the original params are mixed directly into the instance "this"
			rias.mixin(this, params || {});

			// give precedence to params.node vs. the node argument
			// and ensure its a node, not an id string
			node = this.node = _dom.byId( this.node || node );

			if(!this.id){
				this.id = [
					"Setter",
					(node) ? node.id || node.tagName : "",
					idCounter++
				].join("_");
			}
		},

		_setNodeContent: function(){
			///对应 dojo.html._ContentSetter.setContent
			// summary:
			//		sets the content on the node

			var node = this.node;
			if(!node){
				// can't proceed
				throw new Error(this.declaredClass + ": _setNodeContent given no node");
			}
			try{
				this.empty(false);///应该保留 DomTree，如要清楚，需要
				this._parsedContentNode = setNodeContent(node, this.content);
			}catch(e){
				// check if a domfault occurs when we are appending this.errorMessage
				// like for instance if domNode is a UL and we try append a DIV
				this._onError("Content", e);
			}
			// always put back the node for the next method
			this.node = node; // DomNode
		},
		setContent: function(/* String|DomNode|NodeList? */ cont, /*Object?*/ params){
			///对应 dojo.html._ContentSetter.set，因为 set 与 setObject 有冲突，导致 rias.declare 注册 类名 时失败。
			// summary:
			//		front-end to the set-content sequence
			// cont:
			//		An html string, node or enumerable list of nodes for insertion into the dom
			//		If not provided, the object's content property will be used
			if(undefined !== cont){
				this.content = cont;
			}
			if(typeof cont === 'number'){
				cont = cont.toString();
			}
			// in the re-use scenario, set needs to be able to mixin new configuration
			if(params){
				this._mixin(params);
			}

			this._onBegin();
			this._setNodeContent();

			return this._onEnd();
		},

		_onBegin: function(){
			// summary:
			//		Called after instantiation, but before set();
			//		It allows modification of any of the object properties -
			//		including the node and content provided - before the set operation actually takes place
			//		This default implementation checks for cleanContent and extractContent flags to
			//		optionally pre-process html string content
			// clean out the node and any cruft associated with it - like widgets
			this.empty();

			var cont = this.content;
			if(rias.isString(cont)){
				if(this.cleanContent){
					cont = secureForInnerHtml(cont);
				}

				if(this.extractContent){
					var match = cont.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
					if(match){ cont = match[1]; }
				}
			}

			var styles = this._styles;// init vars
			this._code = null; // do not execute scripts from previous content set

			if(rias.isString(cont)){
				if(this.adjustPaths && this.referencePath){
					cont = this._adjustHtmlPaths(this.referencePath, cont);
				}

				if(this.renderStyles || this.cleanContent){
					cont = this._snarfStyles(this.referencePath, cont, styles);
				}

				// because of a bug in IE, the script tag that is first in html hierarchy doesnt make it into the DOM
				//	when content is innerHTML'ed, so we can't use dojo/query to retrieve scripts from DOM
				if(this.executeScripts){
					var _t = this;
					var byRef = {
						downloadRemote: true,
						errBack:function(e){
							_t._onError.call(_t, 'Exec', 'Error downloading remote script in "'+_t.id+'"', e);
						}
					};
					cont = this._snarfScripts(cont, byRef);
					this._code = byRef.code;
				}
			}
			this.content = cont;

			return this.node; // DomNode
		},
		_onEnd: function(){
			// summary:
			//		Called after set(), when the new content has been pushed into the node
			//		It provides an opportunity for post-processing before handing back the node to the caller
			//		This default implementation checks a parseContent flag to optionally run the dojo parser over the new content
			// Deferred to signal when this function is complete
			var self = this,
				//d = rias.newDeferred(),
				code = this._code,
				styles = this._styles;
			this.parseDeferred = rias.newDeferred("rias.dom.html._ContentSetter.parse", rias.defaultDeferredTimeout, function(){
				this.cancel();
			});
			// clear old stylenodes from the DOM
			// these were added by the last set call
			// (in other words, if you dont keep and reuse the ContentSetter for a particular node
			// .. you'll have no practical way to do this)
			if(this._styleNodes){
				while(this._styleNodes.length){
					_dom.destroy(this._styleNodes.pop());
				}
			}
			// render new style nodes
			if(this.renderStyles && styles && styles.length){
				exports._renderStyles(styles);
			}

			// Setup function to call onEnd() in the superclass, for parsing, and resolve the above Deferred when
			// parsing is complete.
			var _callParse = function(){
				if(self.parseContent){
					// populates this.parseResults and this.parseDeferred if you need those..
					self._parse();
				}
				// If parser ran (parseContent == true), wait for it to finish, otherwise call this.parseDeferred.resolve() immediately
				///改在 _parse() 中处理。
				//rias.when(self._parseDeferred, function(results){
				//	self.parseDeferred.resolve(results);
				//});
			};

			if(this.executeScripts && code){
				// Evaluate any <script> blocks in the content
				if(this.cleanContent){
					// clean JS from html comments and other crap that browser
					// parser takes care of in a normal page load
					code = code.replace(/(<!--|(?:\/\/)?-->|<!\[CDATA\[|\]\]>)/g, '');
				}
				if(this.scriptHasHooks){
					// replace _container_ with this.scriptHookReplace()
					// the scriptHookReplacement can be a string
					// or a function, which when invoked returns the string you want to substitute in
					code = code.replace(/_container_(?!\s*=[^=])/g, this.scriptHookReplacement);
				}
				try{
					this.evalInGlobal(code, this.node);
				}catch(e){
					this._onError('Exec', 'Error eval script in '+this.id+', '+e.message, e);
				}

				// Finally, use ready() to wait for any require() calls from the <script> blocks to complete,
				// then call onEnd() in the superclass, for parsing, and when that is done resolve the Deferred.
				// For 2.0, remove the call to ready() (or this whole if() branch?) since the parser can do loading for us.
				rias.ready(_callParse);
			}else{
				// There were no <script>'s to execute, so immediately call onEnd() in the superclass, and
				// when the parser finishes running, resolve the Deferred.
				_callParse();
			}

			// Return a promise that resolves after the ready() call completes, and after the parser finishes running.
			return this.parseDeferred.promise;

		},
		_renderStyles: function(styles){
			// insert css from content into document head
			this._styleNodes = [];
			var st, att, cssText, doc = this.node.ownerDocument;
			var head = doc.getElementsByTagName('head')[0];

			for(var i = 0, e = styles.length; i < e; i++){
				cssText = styles[i];
				att = styles.attributes[i];
				st = doc.createElement('style');
				st.setAttribute("type", "text/css"); // this is required in CSS spec!

				for(var x in att){
					st.setAttribute(x, att[x]);
				}

				this._styleNodes.push(st);
				head.appendChild(st); // must insert into DOM before setting cssText

				if(st.styleSheet){ // IE
					st.styleSheet.cssText = cssText;
				}else{ // w3c
					st.appendChild(doc.createTextNode(cssText));
				}
			}
		},

		empty: function(emptyAll){
			// summary:
			//		cleanly empty out existing content

			// If there is a parse in progress, cancel it.
			if(this.parseDeferred){
				//if(!this.parseDeferred.isResolved()){
					this.parseDeferred.cancel();
				//}
				delete this.parseDeferred;
			}

			// destroy any widgets from a previous run
			// NOTE: if you don't want this you'll need to empty
			// the parseResults array property yourself to avoid bad things happening
			if(this.parseResults && this.parseResults.length){
				rias.forEach(this.parseResults, function(w){
					//if(w.destroy){
					//	w.destroy();
					//}
					rias.destroy(w);
				});
				delete this.parseResults;
			}
			this._styles = [];
			var n;
			if(this._parsedContentNode){
				try{
					while((n = this._parsedContentNode.pop())){
						if(n.parentNode){
							n.parentNode.removeChild(n);
						}
					}
				}catch(err){
					err;
				}
				delete this._parsedContentNode;
			}
			// this is fast, but if you know its already empty or safe, you could
			// override empty to skip this step
			if(emptyAll){
				_dom.empty(this.node);
			}
		},

		tearDown: function(){
			// summary:
			//		manually reset the Setter instance if its being re-used for example for another set()
			// description:
			//		tearDown() is not called automatically.
			//		In normal use, the Setter instance properties are simply allowed to fall out of scope
			//		but the tearDown method can be called to explicitly reset this instance.
			delete this.parseResults;
			delete this.parseDeferred;
			delete this.node;
			delete this.content;
			delete this._styles;
			// only tear down -or another set() - will explicitly throw away the
			// references to the style nodes we added
			if(this._styleNodes){
				while(this._styleNodes.length){
					rias.destroy(this._styleNodes.pop());
				}
			}
			delete this._styleNodes;
			// reset the defaults from the prototype
			// XXX: not sure if this is the correct intended behaviour, it was originally
			// dojo.getObject(this.declaredClass).prototype which will not work with anonymous
			// modules
			rias.mixin(this, _ContentSetter.prototype);
		},

		_mixin: function(params){
			// mix properties/methods into the instance
			// TODO: the intention with tearDown is to put the Setter's state
			// back to that of the original constructor (vs. deleting/resetting everything regardless of ctor params)
			// so we could do something here to move the original properties aside for later restoration
			var empty = {}, key;
			for(key in params){
				if(key in empty){
					continue;
				}
				// TODO: here's our opportunity to mask the properties we don't consider configurable/overridable
				// .. but history shows we'll almost always guess wrong
				this[key] = params[key];
			}
		},
		_parse: function(){
			// summary:
			//		runs the dojo parser over the node contents, storing any results in this.parseResults
			//		and the parse promise in this.parseDeferred
			//		Any errors resulting from parsing are passed to _onError for handling

			var rootNode = this.node;
			try{
				// store the results (widgets, whatever) for potential retrieval
				var inherited = {};
				rias.forEach(["dir", "lang", "textDir"], function(name){
					if(this[name]){
						inherited[name] = this[name];
					}
				}, this);
				var self = this;
				this._parseDeferred = _dom.parser.parse({
					rootNode: rootNode,
					noStart: !this.startup,
					inherited: inherited,
					scope: this.parserScope
				}).then(function(results){
						self.parseResults = results;
						self.parseDeferred.resolve(results);
						return results;
					}, function(e){
						self._onError('Content', e, "Error parsing in _ContentSetter#" + self.id);
						self.parseDeferred.reject(e);
					});
			}catch(e){
				this._onError('Content', e, "Error parsing in _ContentSetter#" + this.id);
			}
		},

		onContentError: function(err){
			return "Error occurred setting content: " + err;
		},
		onExecError: function(err){
			return "Error occurred executing scripts: " + err;
		},
		_onError: function(type, err, consoleText){
			// summary:
			//		shows user the string that is returned by on[type]Error
			//		override/implement on[type]Error and return your own string to customize
			var errText = this['on' + type + 'Error'].call(this, err);
			if(consoleText){
				console.error(consoleText, err);
			}else{
				console.error(errText, err);
			}
			try{
				//node.innerHTML = errMess;///不能破坏原结构
				errText = _dom.create("div", {
					innerHTML: errText
				});
				this.parseResults.push(errText);
				this.node.appendChild(errText);
			}catch(e){
				console.error('Fatal ' + this.declaredClass + '._setNodeContent could not change content due to ' + e.message, e);
			}
		}
	});

	rias.prototypeExtend(_dom.query.NodeList, {
		html: function(/* String|DomNode|NodeList? */ content, /* Object? */params){
			// summary:
			//		see `dojo/html.set()`. Set the content of all elements of this NodeList
			//
			// content:
			//		An html string, node or enumerable list of nodes for insertion into the dom
			//
			// params:
			//		Optional flags/properties to configure the content-setting. See dojo/html._ContentSetter
			//
			// description:
			//		Based around `dojo/html.set()`, set the content of the Elements in a
			//		NodeList to the given content (string/node/nodelist), with optional arguments
			//		to further tune the set content behavior.
			//
			// example:
			//	|	require(["dojo/query", "dojo/NodeList-html"
			//	|	], function(query){
			//	| 		query(".thingList").html("<li data-dojo-type='dojo/dnd/Moveable'>1</li><li data-dojo-type='dojo/dnd/Moveable'>2</li><li data-dojo-type='dojo/dnd/Moveable'>3</li>",
			//	| 		{
			//	| 			parseContent: true,
			//	| 			onBegin: function(){
			//	| 				this.content = this.content.replace(/([0-9])/g, this.id + ": $1");
			//	| 				this.inherited("onBegin", arguments);
			//	| 			}
			//	|		}).removeClass("notdone").addClass("done");
			//	| 	});

			var dhs = new _ContentSetter(params || {});
			this.forEach(function(elm){
				dhs.node = elm;
				dhs.setContent(content);
				dhs.tearDown();
			});
			return this; // dojo/NodeList
		}
	});

	return exports;

});
