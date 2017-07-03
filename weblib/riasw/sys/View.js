
//RIAStudio client runtime widget - View

define([
	"riasw/riaswBase",
	//"dojox/mobile/transition",
	//"riasw/layout/_PanelWidget",
	"riasw/layout/ContentPanel",
	"riasw/sys/_FormMixin",
	"riasw/sys/_ModuleMixin"
], function(rias, //transitDeferred, _PanelWidget,
	ContentPanel, _FormMixin, _ModuleMixin){

	var ViewController = rias.declare("riasw.sys.ViewController", null, {
		// summary:
		//		A singleton class that controls view transition.
		// description:
		//		This class listens to the "startTransition" events and performs
		//		view transitions. If the transition destination is an external
		//		view specified with the url parameter, the view content is
		//		retrieved and parsed to create a new target view.

		// dataHandlerClass: Object
		//		The data handler class used to load external views,
		//		by default "dojox/mobile/dh/DataHandler"
		//		(see the Data Handlers page in the reference documentation).
		dataHandlerClass: "dojox/mobile/dh/DataHandler",
		// dataSourceClass: Object
		//		The data source class used to load external views,
		//		by default "dojox/mobile/dh/UrlDataSource"
		//		(see the Data Handlers page in the reference documentation).
		dataSourceClass: "dojox/mobile/dh/UrlDataSource",
		// fileTypeMapClass: Object
		//		The file type map class used to load external views,
		//		by default "dojox/mobile/dh/SuffixFileTypeMap"
		//		(see the Data Handlers page in the reference documentation).
		fileTypeMapClass: "dojox/mobile/dh/SuffixFileTypeMap",

		constructor: function(){
			// summary:
			//		Creates a new instance of the class.
			// tags:
			//		private
			this.viewMap = {};
			rias.ready(rias.hitch(this, function(){
				this._onStartTransitionHandle = rias.on(rias.dom.body(), "startTransition", rias.hitch(this, "onStartTransition"));
			}));
		},

		findTransitionViews: function(/*String*/moveTo, src){
			// summary:
			//		Parses the moveTo argument and determines a starting view and a destination view.
			// returns: Array
			//		An array containing the currently showing view, the destination view
			//		and the transition parameters, or an empty array if the moveTo argument
			//		could not be parsed.
			if(!moveTo){
				return [];
			}
			// removes a leading hash mark (#) and params if exists
			// ex. "#bar&myParam=0003" -> "bar"
			var s = moveTo.match(/^#?([^&?]+)(.*)/);
			var params = s[2];// RegExp.$2;
			//var view = rias.by(RegExp.$1);
			var view = rias.viewBy(s[1], this),
				r;
			if(!view){
				return [];
			}
			if(!view.get("visible")){
				view.restore(true, true, false);
			}
			while(view){
				if(view.get("visible")){
					var sv = view.getShowingSiblingView();
					if(sv && sv.id !== view.id){
						view.show();
					}
					view = v;
				}
				r = w;
				w = rias.viewBy(w._getContainerRiasw());
			}
			for(var v = view.getParent(); v; v = v.getParent()){ // search for the topmost invisible parent node
				if(rias.is(v, Widget) && v.get("visible")){
					var sv = view.getShowingSiblingView();
					if(sv && sv.id !== view.id){
						view.show();
					}
					view = v;
				}
			}
			return [view.getShowingSiblingView(), view, params]; // fromView, toView, params
		},

		openExternalView: function(/*Object*/ transOpts, /*DomNode*/ target){
			// summary:
			//		Loads an external view and performs a transition to it.
			// returns: dojo/_base/Deferred
			//		Deferred object that resolves when the external view is
			//		ready and a transition starts. Note that it resolves before
			//		the transition is complete.
			// description:
			//		This method loads external view content through the
			//		dojox/mobile data handlers, creates a new View instance with
			//		the loaded content, and performs a view transition to the
			//		new view. The external view content can be specified with
			//		the url property of transOpts. The new view is created under
			//		a DOM node specified by target.
			//
			// example:
			//		This example loads view1.html, creates a new view under
			//		`<body>`, and performs a transition to the new view with the
			//		slide animation.
			//
			//	|	var vc = ViewController.getInstance();
			//	|	vc.openExternalView({
			//	|	    url: "view1.html",
			//	|	    transition: "slide"
			//	|	}, win.body());
			//
			//
			// example:
			//		If you want to perform a view transition without animation,
			//		you can give transition:"none" to transOpts.
			//
			//	|	var vc = ViewController.getInstance();
			//	|	vc.openExternalView({
			//	|	    url: "view1.html",
			//	|	    transition: "none"
			//	|	}, win.body());
			//
			// example:
			//		If you want to dynamically create an external view, but do
			//		not want to perform a view transition to it, you can give noTransition:true to transOpts.
			//		This may be useful when you want to preload external views before the user starts using them.
			//
			//	|	var vc = ViewController.getInstance();
			//	|	vc.openExternalView({
			//	|	    url: "view1.html",
			//	|	    noTransition: true
			//	|	}, win.body());
			//
			// example:
			//		To do something when the external view is ready:
			//
			//	|	var vc = ViewController.getInstance();
			//	|	Deferred.when(vc.openExternalView({...}, win.body()), function(){
			//	|	    doSomething();
			//	|	});

			var d = rias.newDeferred();
			var id = this.viewMap[transOpts.url];
			if(id){
				transOpts.moveTo = id;
				if(transOpts.noTransition){
					rias.by(id, this).hide();/// 有可能是 String
				}else{
					rias.dom.dispatchTransition(rias.dom.body(), transOpts);
				}
				d.resolve(true);
				return d;
			}

			// if a fixed bottom bar exists, a new view should be placed before it.
			var refNode = null;
			for(var i = target.childNodes.length - 1; i >= 0; i--){
				var c = target.childNodes[i];
				if(c.nodeType === 1){
					var fixed = c.getAttribute("fixed") // TODO: Remove the non-HTML5-compliant attribute in 2.0
						|| c.getAttribute("data-mobile-fixed")
						|| (rias.by(c) && rias.by(c).fixed);
					if(fixed === "bottom"){
						refNode = c;
						break;
					}
				}
			}

			var dh = transOpts.dataHandlerClass || this.dataHandlerClass;
			var ds = transOpts.dataSourceClass || this.dataSourceClass;
			var ft = transOpts.fileTypeMapClass || this.fileTypeMapClass;
			require([dh, ds, ft], rias.hitch(this, function(DataHandler, DataSource, FileTypeMap){
				var handler = new DataHandler(new DataSource(transOpts.data || transOpts.url), target, refNode);
				var contentType = transOpts.contentType || FileTypeMap.getContentType(transOpts.url) || "html";
				handler.processData(contentType, rias.hitch(this, function(id){
					if(id){
						this.viewMap[transOpts.url] = transOpts.moveTo = id;
						if(transOpts.noTransition){
							rias.by(id, this).hide();/// 有可能是 String
						}else{
							rias.dom.dispatchTransition(rias.dom.body(), transOpts);
						}
						d.resolve(true);
					}else{
						d.reject("Failed to load " + transOpts.url);
					}
				}));
			}));
			return d;
		},

		onStartTransition: function(evt){
			// summary:
			//		A handler that performs view transition.
			evt.preventDefault();
			if(!evt.detail){
				return;
			}
			var detail = evt.detail,
				src;
			if(!detail.moveTo && !detail.href && !detail.url && !detail.scene){
				return;
			}

			if(detail.url && !detail.moveTo){
				var urlTarget = detail.urlTarget;
				var w = rias.by(urlTarget);
				var target = w && w.containerNode || rias.dom.byId(urlTarget);
				if(!target){
					w = rias.rt.getEnclosingView(evt.target);
					target = w && w.domNode.parentNode || rias.dom.body();
				}
				src = rias.by(evt.target);
				if(src && src.callback){
					detail.context = src;
					detail.method = src.callback;
				}
				this.openExternalView(detail, target);
				return;
			}else if(detail.href){
				if(detail.hrefTarget && detail.hrefTarget !== "_self"){
					rias.dom.openWindow(detail.href, detail.hrefTarget);
				}else{
					var view = rias.topViewBy(evt.target); // find top level visible view
					if(view){
						view.performTransition(null, detail.transitionDir, detail.transition, evt.target, function(){
							location.href = detail.href;
						});
					}
				}
				return;
			}else if(detail.scene){
				rias.publish("/dojox/mobile/app/pushScene", [detail.scene]);
				return;
			}

			var arr = this.findTransitionViews(detail.moveTo, rias.viewBy(evt.target)),
				fromView = arr[0],
				toView = arr[1],
				params = arr[2];
			if(!location.hash && !detail.hashchange){
				rias.rt.initialView = fromView;
			}
			if(detail.moveTo && toView){
				detail.moveTo = (detail.moveTo.charAt(0) === '#' ? '#' + toView.id : toView.id) + params;
			}
			if(!fromView || (detail.moveTo && fromView === rias.by(detail.moveTo.replace(/^#?([^&?]+).*/, "$1"), this))){/// 有可能是 String
				return;
			}
			src = rias.by(evt.target);
			if(src && src.callback){
				detail.context = src;
				detail.method = src.callback;
			}
			fromView.performTransition(detail);
		}
	});
	ViewController._instance = new ViewController(); // singleton
	ViewController.getInstance = function(){
		return ViewController._instance;
	};

	//rias.theme.loadMobileThemeCss([
	//	"View.css"
	//]);

	var riaswType = "riasw.sys.View";
	var Widget = rias.declare(riaswType, [ContentPanel, _FormMixin, _ModuleMixin], {

		baseClass: "mblView",
		// tagType: String
		//		The name of the HTML tagType to create as domNode. The default value is "div".
		tagType: "div",
		// keepScrollPos: Boolean
		//		If true, the scroll position is kept when transition occurs between views.
		keepScrollPos: true,

		selected: false,
		animate: false,
		//initDisplayState: _PanelWidget.displayHidden,

		/// begin bookmarkable
		// settingHash: [private] Boolean
		//		Whether the browser URL needs to be updated to include the hash.
		settingHash: false,
		// transitionInfo: Array
		//		An array containing information about the transition.
		transitionInfo: [],
		getTransitionInfo: function(/*String*/ fromViewId, /*String*/ toViewId){
			// summary:
			//		Returns an array containing the transition information.
			return this.transitionInfo[fromViewId.replace(/^#/, "") + ":" + toViewId.replace(/^#/, "")]; // Array
		},
		addTransitionInfo: function(/*String*/ fromViewId, /*String*/ toViewId, /*Object*/args){
			// summary:
			//		Adds transition information.
			this.transitionInfo[fromViewId.replace(/^#/, "") + ":" + toViewId.replace(/^#/, "")] = args;
		},
		findTransitionViews: function(/*String*/moveTo){
			// summary:
			//		Searches for a starting view and a destination view.
			if(!moveTo){
				return [];
			}
			if(rias.isString(moveTo)){
				moveTo = moveTo.replace(/^#/, "");
			}
			var view = rias.viewBy(moveTo);
			if(!view){
				return [];
			}
			// fromView, toView
			return [view.getShowingSiblingView(), view]; // Array
		},
		setFragIds: function(){
			// summary:
			//		Updates the hash (fragment id) in the browser URL.
			// description:
			//		The hash value consists of one or more visible view ids
			//		separated with commas.

			var arr = rias.filter(rias.rt.getViews(), function(v){
				return v.get("visible");
			});
			this.settingHash = true;
			rias.hash(rias.map(arr, function(v){
				return v.id;
			}).join(","));
		},
		handleFragIds: function(/*String*/fragIds){
			// summary:
			//		Analyzes the given hash (fragment id).
			// description:
			//		Given a comma-separated list of view IDs, this method
			//		searches for a transition destination, and makes all the
			//		views in the hash visible.

			var arr, moveTo, args, dir,
				f = function(v){
					v.domNode.style.display = (v === view) ? "" : "none";
				};
			if(!fragIds){
				moveTo = rias.rt.initialView.id;
				arr = this.findTransitionViews(moveTo);
			}else{
				var ids = fragIds.replace(/^#/, "").split(/,/);
				for(var i = 0; i < ids.length; i++){
					// Search for a transition destination view.

					var view = rias.viewBy(ids[i]);

					// Skip a non-existent or visible view. Visible view can't be a destination candidate.
					if(!view || view._isVisible(true)){
						continue;
					}

					// Check if all the ancestors are in the fragIds.
					// If not, obviously the view was NOT visible before the previous transition.
					// That means the previous transition can't happen from that view,
					// which means the view can't be a destination.
					var success = true,
						v = rias.;
					while((v))
					for(var v = rias.rt.getParentView(view); v; v = rias.rt.getParentView(v)){
						if(rias.indexOf(ids, v.id) === -1){
							success = false;
							break;
						}
					}
					if(!success){
						// Simply make the view visible without transition.
						rias.forEach(view.getSiblingViews(), f);
						continue;
					}

					arr = this.findTransitionViews(ids[i]);
					if(arr.length === 2){
						moveTo = ids[i];
						// The destination found. But continue the loop to make
						// the other views in the fragIds visible.
					}
				}
			}

			if (arr) {
				args = this.getTransitionInfo(arr[0].id, arr[1].id);
				dir = 1;
				if(!args){
					args = this.getTransitionInfo(arr[1].id, arr[0].id);
					dir = -1;
				}
			}

			return {
				moveTo: moveTo ? "#" + moveTo : null,
				transitionDir: args ? args.transitionDir * dir : 1,
				transition: args ? args.transition : "none"
			};
		},
		onHashChange: function(value){
			// summary:
			//		Called on "/dojo/hashchange" events.
			if(this.settingHash){
				this.settingHash = false;
				return;
			}
			var params = this.handleFragIds(value);
			params.hashchange = true;
			if (params.moveTo) {
				rias.dom.dispatchTransition(rias.dom.desktopBody || rias.dom.body(), params);
			}
		},
		/// End bookmarkable

		constructor: function(/*Object*/params, /*DomNode?*/node){
			if(node){
				rias.dom.byId(node).style.visibility = "hidden";
			}
		},
		buildRendering: function(){
			//if(!this.templateString){
			//	// Create root node if it wasn't created by _TemplatedMixin
			//	this.domNode = this.containerNode = this.srcNodeRef || rias.dom.create(this.tagType);
			//}

			this.inherited(arguments);

			this.on(this.domNode, rias.dom.css3Name("animationEnd"), "_onAnimationEnd");
			this.on(this.domNode, rias.dom.css3Name("animationStart"), "_onAnimationStart");
			//if(!rias.config.mblCSS3Transition){
				this.on(this.domNode, rias.dom.css3Name("transitionEnd"), "_onAnimationEnd");
			//}
			//this._animEndHandle = this.on(["animationend", "webkitAnimationEnd", "MSAnimationEnd"], "_onAnimationEnd");
			//this._animStartHandle = this.on(["animationstart", "webkitAnimationStart", "MSAnimationStart"], "_onAnimationStart");
			//this._transEndHandle = this.on(["transitionend", "webkitTransitionEnd", "MSTransitionEnd", "oTransitionEnd", "otransitionend"], "_onAnimationEnd");
			if(rias.has('mblAndroid3Workaround')){
				// workaround for the screen flicker issue on Android 3.x/4.0
				// applying "-webkit-transform-style:preserve-3d" to domNode can avoid
				// transition animation flicker
				rias.dom.setStyle(this.domNode, rias.dom.css3Name("transformStyle"), "preserve-3d");
			}

			//rias.rt.add(this);
		},
		//_onDestroy: function(){
		//	rias.rt.remove(this.id);
		//	this.inherited(arguments);
		//},

		//onStartView: function(){
		//	// summary:
		//	//		Stub function to connect to from your application.
		//	// description:
		//	//		Called only when this view is shown at startup time.
		//},
		startup: function(){
			//var self = this;
			//self.inherited(arguments);
			if(this._started){
				return;
			}

			// Determine which view among the siblings should be visible.
			// Priority:
			//	 1. fragment id in the url (ex. #view1,view2)
			//	 2. this.selected
			//	 3. the first view
			//if(this._visible === undefined){
				var views = this.getSiblingViews();
				var ids = location.hash && location.hash.substring(1).split(/,/);
				var fragView, selectedView, firstView;
				rias.forEach(views, function(v, i){
					if(rias.contains(ids, v.id)){
						fragView = v;
					}
					if(i === 0){
						firstView = v;
					}
					if(v.selected){
						selectedView = v;
					}
					//v._visible = false;
				}, this);
				//(fragView || selectedView || firstView)._visible = true;
				//(fragView || selectedView || firstView).initDisplayState = _PanelWidget.displayShowNormal;
			//}
			/*if(this._visible){
				// The 2nd arg is not to hide its sibling views so that they can be
				// correctly initialized.
				this.show(true, true);

				// Defer firing events to let user connect to events just after creation
				// TODO: revisit this for 2.0
				this.defer(function(){
					//this.onStartView();
					rias.publish("/dojox/mobile/startView", [this]);
				});
			}else{
				this.hide();
			}*/
			//if(this.initDisplayState === _PanelWidget.displayShowNormal){
			if(this.isShowNormal()){
				//this.onStartView();
				rias.publish("/dojox/mobile/startView", [this]);
			}

			///继承自 ContentPanel，可以不要
			//if(this.domNode.style.visibility === "hidden"){ // this check is to avoid screen flickers
			//	this.domNode.style.visibility = "inherit";
			//}

			// Need to call inherited first - so that child widgets get started
			// up correctly
			this.inherited(arguments);

			//var parent = this.getParent();
			//if(!parent || !parent.resize){ // top level widget
			//	this.resize();
			//}

			///改在上面处理
			//if(!this._visible){
				// hide() should be called last so that child widgets can be
				// initialized while they are visible.
			//	this.hide();
			//}
		},

		getShowingSiblingView: function(){
			// summary:
			//		Find the currently showing view from my sibling views.
			// description:
			//		Note that depending on the ancestor views' visibility,
			//		the found view may not be actually shown.
			var ws = this.getSiblings(),
				w;
			for(var i = ws.length; i--;){
				w = ws[i];
				if(w && rias.is(w, Widget) && w.isShowing()){
					return w;
				}
			}
			return null;
		},
		getSiblingViews: function(){
			// summary:
			//		Returns an array of the sibling views.

			return rias.filter(this.getSiblings(), function(w){
				return rias.is(w, Widget);
			});
		},

		convertToId: function(moveTo){
			if(typeof(moveTo) === "string"){
				// removes a leading hash mark (#) and params if exists
				// ex. "#bar&myParam=0003" -> "bar"
				moveTo = moveTo.replace(/^#?([^&?]+).*/, "$1");
			}
			var w = rias.by(moveTo, this);/// 有可能是 String
			return w ? w.id : moveTo;
		},
		_isBookmarkable: function(detail){
			return detail.moveTo && (rias.config.mblForceBookmarkable || detail.moveTo.charAt(0) === '#') && !detail.hashchange;
		},

		onBeforeTransitionIn: function(moveTo, dir, transition, context, method){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called before the arriving transition occurs.
		},
		onAfterTransitionIn: function(moveTo, dir, transition, context, method){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called after the arriving transition occurs.
		},
		onBeforeTransitionOut: function(moveTo, dir, transition, context, method){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called before the leaving transition occurs.
		},
		onAfterTransitionOut: function(moveTo, dir, transition, context, method){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called after the leaving transition occurs.
		},

		_addTransitionPaddingTop: function(/*String|Integer*/ value){
			// add padding top to the view in order to get alignment during the transition
			this.containerNode.style.paddingTop = value + "px";
		},
		_removeTransitionPaddingTop: function(){
			// remove padding top from the view after the transition
			this.containerNode.style.paddingTop = "";
		},
		_toCls: function(s){
			// convert from transition name to corresponding class name
			// ex. "slide" -> "mblSlide"
			return "mbl" + s.charAt(0).toUpperCase() + s.substring(1);
		},
		_clearClasses: function(/*DomNode*/node){
			// summary:
			//		Clean up the domNode classes that were added while making a transition.
			// description:
			//		Remove all the "mbl" prefixed classes except mbl*View.
			if(!node){
				return;
			}
			var classes = [];
			rias.forEach(rias.trim(node.className||"").split(/\s+/), function(c){
				if(c.match(/^mbl\w*View$/) || c.indexOf("mbl") === -1){
					classes.push(c);
				}
			}, this);
			node.className = classes.join(' ');
		},
		_fixViewState: function(/*DomNode*/toNode){
			// summary:
			//		Sanity check for view transition states.
			// description:
			//		Sometimes uninitialization of Views fails after making view transition,
			//		and that results in failure of subsequent view transitions.
			//		This function does the uninitialization for all the sibling views.
			var nodes = this.domNode.parentNode.childNodes;
			for(var i = 0; i < nodes.length; i++){
				var n = nodes[i];
				if(n.nodeType === 1 && rias.dom.containsClass(n, "mblView")){
					this._clearClasses(n);
				}
			}
			this._clearClasses(toNode); // just in case toNode is a sibling of an ancestor.

			// #16337
			// Uninitialization may fail to clear _inProgress when multiple
			// performTransition calls occur in a short duration of time.
			var toWidget = rias.by(toNode);
			if(toWidget){
				toWidget._inProgress = false;
			}
		},
		/*_isVisible: function(checkAncestors){
			// summary:
			//		Return true if this view is visible
			// checkAncestors:
			//		If true, in addition to its own visibility, also checks the
			//		ancestors visibility to see if the view is actually being
			//		shown or not.
			var visible = function(node){
				return rias.dom.getStyle(node, "display") !== "none";
			};
			if(checkAncestors){
				for(var n = this.domNode; n.tagName !== "BODY"; n = n.parentNode){
					if(!visible(n)){
						return false;
					}
				}
				return true;
			}else{
				return visible(this.domNode);
			}
		},*/

		performTransition: function(/*String*/moveTo, /*Number*/transitionDir, /*String*/transition,
									/*Object|null*/context, /*String|Function*/method /*...*/){
			// summary:
			//		Function to perform the various types of view transitions, such as fade, slide, and flip.
			// moveTo: String
			//		The id of the transition destination view which resides in
			//		the current page.
			//		If the value has a hash sign ('#') before the id
			//		(e.g. #view1) and the dojo/hash module is loaded by the user
			//		application, the view transition updates the hash in the
			//		browser URL so that the user can bookmark the destination
			//		view. In this case, the user can also use the browser's
			//		back/forward button to navigate through the views in the
			//		browser history.
			//		If null, transitions to a blank view.
			//		If '#', returns immediately without transition.
			// transitionDir: Number
			//		The transition direction. If 1, transition forward. If -1, transition backward.
			//		For example, the slide transition slides the view from right to left when transitionDir == 1,
			//		and from left to right when transitionDir == -1.
			// transition: String
			//		A type of animated transition effect. You can choose from
			//		the standard transition types, "slide", "fade", "flip", or
			//		from the extended transition types, "cover", "coverv",
			//		"dissolve", "reveal", "revealv", "scaleIn", "scaleOut",
			//		"slidev", "swirl", "zoomIn", "zoomOut", "cube", and
			//		"swap". If "none" is specified, transition occurs
			//		immediately without animation.
			// context: Object
			//		The object that the callback function will receive as "this".
			// method: String|Function
			//		A callback function that is called when the transition has finished.
			//		A function reference, or name of a function in context.
			// tags:
			//		public
			//
			// example:
			//		Transition backward to a view whose id is "foo" with the slide animation.
			//	|	performTransition("foo", -1, "slide");
			//
			// example:
			//		Transition forward to a blank view, and then open another page.
			//	|	performTransition(null, 1, "slide", null, function(){location.href = href;});

			if(this._inProgress){// transition is in progress
				return;
			}
			this._inProgress = true;

			// normalize the arg
			var detail, optArgs;
			//if(moveTo && typeof(moveTo) === "object"){
			if(moveTo && rias.isObjectSimple(moveTo)){
				detail = moveTo;
				optArgs = transitionDir; // array
			}else{
				detail = {
					moveTo: moveTo,
					transitionDir: transitionDir,
					transition: transition,
					context: context,
					method: method
				};
				optArgs = [];
				for(var i = 5; i < arguments.length; i++){
					optArgs.push(arguments[i]);
				}
			}

			// save the parameters
			this._detail = detail;
			this._optArgs = optArgs;
			this._arguments = [
				detail.moveTo,
				detail.transitionDir,
				detail.transition,
				detail.context,
				detail.method
			];

			if(detail.moveTo === "#"){
				return;
			}
			var toNode;
			if(detail.moveTo){
				toNode = this.convertToId(detail.moveTo);
			}else{
				if(!this._dummyNode){
					this._dummyNode = this.ownerDocument.createElement("div");
					this.ownerDocumentBody.appendChild(this._dummyNode);
				}
				toNode = this._dummyNode;
			}

			///bookmarkable
			if(this.addTransitionInfo && typeof(detail.moveTo) === "string" && this._isBookmarkable(detail)){
				this.addTransitionInfo(this.id, detail.moveTo, {
					transitionDir: detail.transitionDir,
					transition: detail.transition
				});
			}

			var fromNode = this.domNode;
			var fromTop = fromNode.offsetTop;
			toNode = this.toNode = rias.dom.byId(toNode);
			if(!toNode){
				console.log("riasw/mobile/View.performTransition: destination view not found: " + detail.moveTo);
				return;
			}
			toNode.style.visibility = "hidden";
			toNode.style.display = "";
			this._fixViewState(toNode);
			var toWidget = rias.by(toNode);
			if(toWidget){
				//if(rias.is(toWidget, Widget) && !toWidget.displayState !== _PanelWidget.displayShowNormal){
				//	toWidget.show();
				//}
				if(rias.is(toWidget, Widget)){
					toWidget.restore(true, true, false);
				}
				// Now that the target view became visible, it's time to run resize()
				///继承自 ContentPanel，可以不要
				//if(rias.config.mblAlwaysResizeOnTransition || !toWidget._resized){
				//	rias.dom.resizeAll(null, toWidget);
				//	toWidget._resized = true;
				//}

				if(detail.transition && detail.transition !== "none"){
					// Temporarily add padding to align with the fromNode while transition
					toWidget._addTransitionPaddingTop(fromTop);
				}

				///继承自 ContentPanel，可以不要
				//toWidget.load && toWidget.load(); // for ContentView

				toWidget.movedFrom = fromNode.id;
			}
			if(rias.has('mblAndroidWorkaround') && !rias.config.mblCSS3Transition && detail.transition && detail.transition !== "none"){
				// workaround for the screen flicker issue on Android 2.2/2.3
				// apply "-webkit-transform-style:preserve-3d" to both toNode and fromNode
				// to make them 3d-transition-ready state just before transition animation
				rias.dom.setStyle(toNode, rias.dom.css3Name("transformStyle"), "preserve-3d");
				rias.dom.setStyle(fromNode, rias.dom.css3Name("transformStyle"), "preserve-3d");
				// show toNode offscreen to avoid flicker when switching "display" and "visibility" styles
				rias.dom.addClass(toNode, "mblAndroidWorkaround");
			}

			this.onBeforeTransitionOut.apply(this, this._arguments);
			rias.publish("/dojox/mobile/beforeTransitionOut", [this].concat(rias.argsToArray(this._arguments)));
			if(toWidget){
				// perform view transition keeping the scroll position
				if(this.keepScrollPos && !this.getParent()){
					var scrollTop = rias.dom.docBody.scrollTop || rias.dom.doc.documentElement.scrollTop || rias.global.pageYOffset || 0;
					fromNode._scrollTop = scrollTop;
					var toTop = (detail.transitionDir === 1) ? 0 : (toNode._scrollTop || 0);
					toNode.style.top = "0px";
					if(scrollTop > 1 || toTop !== 0){
						fromNode.style.top = toTop - scrollTop + "px";
						// address bar hiding does not work on iOS 7+.
						if(!(rias.has("ios") >= 7) && rias.config.mblHideAddressBar !== false){
							this.defer(function(){ // iPhone needs setTimeout (via defer)
								rias.global.scrollTo(0, (toTop || 1));
							});
						}
					}
				}else{
					toNode.style.top = "0px";
				}
				toWidget.onBeforeTransitionIn.apply(toWidget, this._arguments);
				rias.publish("/dojox/mobile/beforeTransitionIn", [toWidget].concat(rias.argsToArray(this._arguments)));
			}
			toNode.style.display = "none";
			toNode.style.visibility = "inherit";

			rias.dom.fromView = this;
			rias.dom.toView = toWidget;

			this._doTransition(fromNode, toNode, detail.transition, detail.transitionDir);
		},
		_doTransition: function(fromNode, toNode, transition, transitionDir){
			var self = this,
				rev = (transitionDir === -1) ? " mblReverse" : "";
			toNode.style.display = "";
			if(!transition || transition === "none"){
				self.domNode.style.display = "none";
				self.invokeCallback();
			//}else if(rias.config.mblCSS3Transition){
			//	//get dojox/css3/transit first
			//	rias.when(transitDeferred, function(transit){
			//		//follow the style of .mblView.mblIn in View.css
			//		//need to set the toNode to absolute position
			//		var toPosition = rias.dom.getStyle(toNode, "position");
			//		rias.dom.setStyle(toNode, "position", "absolute");
			//		rias.when(transit(fromNode, toNode, {
			//			transition: transition,
			//			reverse: (transitionDir===-1)
			//		}), function(){
			//			rias.dom.setStyle(toNode, "position", toPosition);
			//			// Reset the temporary padding on toNode
			//			toNode.style.paddingTop = "";
			//			self.invokeCallback();
			//		});
			//	});
			}else{
				if(transition.indexOf("cube") !== -1){
					if(rias.has('ipad')){
						rias.dom.setStyle(toNode.parentNode, {webkitPerspective:1600});
					}else if(rias.has("ios")){
						rias.dom.setStyle(toNode.parentNode, {webkitPerspective:800});
					}
				}
				var s = self._toCls(transition);
				if(rias.has('mblAndroidWorkaround')){
					// workaround for the screen flicker issue on Android 2.2
					// applying transition css classes just after setting toNode.style.display = ""
					// causes flicker, so wait for a while using setTimeout (via defer)
					self.defer(function(){
						rias.dom.addClass(fromNode, s + " mblOut" + rev);
						rias.dom.addClass(toNode, s + " mblIn" + rev);
						rias.dom.removeClass(toNode, "mblAndroidWorkaround"); // remove offscreen style
						self.defer(function(){
							rias.dom.addClass(fromNode, "mblTransition");
							rias.dom.addClass(toNode, "mblTransition");
						}, 30); // 30 = 100 - 70, to make total delay equal to 100ms
					}, 70); // 70ms is experiential value
				}else{
					rias.dom.addClass(fromNode, s + " mblOut" + rev);
					rias.dom.addClass(toNode, s + " mblIn" + rev);
					self.defer(function(){
						rias.dom.addClass(fromNode, "mblTransition");
						rias.dom.addClass(toNode, "mblTransition");
					}, 100);
				}
				// set transform origin
				var fromOrigin = "50% 50%";
				var toOrigin = "50% 50%";
				var scrollTop, posX, posY;
				if(transition.indexOf("swirl") !== -1 || transition.indexOf("zoom") !== -1){
					if(self.keepScrollPos && !self.getParent()){
						scrollTop = rias.dom.docBody.scrollTop || rias.dom.doc.documentElement.scrollTop || rias.global.pageYOffset || 0;
					}else{
						scrollTop = -rias.dom.getPosition(fromNode, true).y;
					}
					posY = rias.global.innerHeight / 2 + scrollTop;
					fromOrigin = "50% " + posY + "px";
					toOrigin = "50% " + posY + "px";
				}else if(transition.indexOf("scale") !== -1){
					var viewPos = rias.dom.getPosition(fromNode, true);
					posX = ((self.clickedPosX !== undefined) ? self.clickedPosX : rias.global.innerWidth / 2) - viewPos.x;
					if(self.keepScrollPos && !self.getParent()){
						scrollTop = rias.dom.docBody.scrollTop || rias.dom.doc.documentElement.scrollTop || rias.global.pageYOffset || 0;
					}else{
						scrollTop = -viewPos.y;
					}
					posY = ((self.clickedPosY !== undefined) ? self.clickedPosY : rias.global.innerHeight / 2) + scrollTop;
					fromOrigin = posX + "px " + posY + "px";
					toOrigin = posX + "px " + posY + "px";
				}
				rias.dom.setStyle(fromNode, rias.dom.css3Add({}, {
					transformOrigin: fromOrigin
				}));
				rias.dom.setStyle(toNode, rias.dom.css3Add({}, {
					transformOrigin: toOrigin
				}));
			}
		},

		_onAnimationStart: function(e){
			// summary:
			//		A handler that is called when transition animation starts.
		},
		_onAnimationEnd: function(e){
			// summary:
			//		A handler that is called after transition animation ends.
			var name = e.animationName || e.target.className;
			if(name.indexOf("Out") === -1 &&
				name.indexOf("In") === -1 &&
				name.indexOf("Shrink") === -1){ return; }
			var isOut = false;
			if(rias.dom.containsClass(this.domNode, "mblOut")){
				isOut = true;
				this.domNode.style.display = "none";
				rias.dom.removeClass(this.domNode, [this._toCls(this._detail.transition), "mblIn", "mblOut", "mblReverse"]);
			}else{
				// Reset the temporary padding
				this._removeTransitionPaddingTop();
			}
			rias.dom.setStyle(this.domNode, rias.dom.css3Add({}, {transformOrigin:""}));
			if(name.indexOf("Shrink") !== -1){
				var li = e.target;
				li.style.display = "none";
				rias.dom.removeClass(li, "mblCloseContent");

				// If target is placed inside scrollable, need to call onTouchEnd
				// to adjust scroll position
				var p = rias.rt.getEnclosingScrollable(this.domNode);
				if(p){
					p.onTouchEnd();
				}
			}
			if(isOut){
				this.invokeCallback();
			}
			this._clearClasses(this.domNode);

			// clear the clicked position
			this.clickedPosX = this.clickedPosY = undefined;

			if(name.indexOf("Cube") !== -1 &&
				name.indexOf("In") !== -1 && rias.has("ios")){
				this.domNode.parentNode.style[rias.dom.css3Name("perspective")] = "";
			}

			this._containerLayout();
		},

		invokeCallback: function(){
			// summary:
			//		A function to be called after performing a transition to
			//		call a specified callback.
			this.onAfterTransitionOut.apply(this, this._arguments);
			rias.publish("/dojox/mobile/afterTransitionOut", [this].concat(this._arguments));
			var toWidget = rias.by(this.toNode);
			if(toWidget){
				toWidget.onAfterTransitionIn.apply(toWidget, this._arguments);
				rias.publish("/dojox/mobile/afterTransitionIn", [toWidget].concat(this._arguments));
				toWidget.movedFrom = undefined;
				if(this.setFragIds && this._isBookmarkable(this._detail)){
					this.setFragIds(); // setFragIds is defined in bookmarkable.js
				}
			}
			if(rias.has('mblAndroidWorkaround')){
				// workaround for the screen flicker issue on Android 2.2/2.3
				// remove "-webkit-transform-style" style after transition finished
				// to avoid side effects such as input field auto-scrolling issue
				// use setTimeout (via defer) to avoid flicker in case of ScrollableView
				this.defer(function(){
					if(toWidget){
						rias.dom.setStyle(this.toNode, rias.dom.css3Name("transformStyle"), "");
					}
					rias.dom.setStyle(this.domNode, rias.dom.css3Name("transformStyle"), "");
				});
			}

			var c = this._detail.context, m = this._detail.method;
			if(c || m){
				if(!m){
					m = c;
					c = null;
				}
				c = c || rias.global;
				if(typeof(m) === "string"){
					c[m].apply(c, this._optArgs || []);
				}else if(typeof(m) === "function"){
					m.apply(c, this._optArgs || []);
				}
			}
			this._detail = this._optArgs = this._arguments = undefined;
			this._inProgress = false;
		},



		_show: function(/*Boolean?*/noEvent, /*Boolean?*/doNotHideOthers){
			// summary:
			//		Shows this view without a transition animation.
			var out = this.getShowingSiblingView();
			if(!noEvent){
				if(out){
					out.onBeforeTransitionOut(out.id);
					rias.publish("/dojox/mobile/beforeTransitionOut", [out, out.id]);
				}
				this.onBeforeTransitionIn(this.id);
				rias.publish("/dojox/mobile/beforeTransitionIn", [this, this.id]);
			}

			///继承自 ContentPanel，用 hide
			//if(doNotHideOthers){
			//	this.domNode.style.display = "";
			//}else{
			//	rias.forEach(this.getSiblingViews(), function(v){
			//		v.domNode.style.display = (v === this) ? "" : "none";
			//	}, this);
			//}
			if(!doNotHideOthers){
				rias.forEach(this.getSiblingViews(), function(v){
					if(v !== this){
						v.hide();
					}
				}, this);
			}
			var r = this.inherited(arguments);
			///继承自 ContentPanel，可以不要
			//this.load && this.load(); // for ContentView

			if(!noEvent){
				if(out){
					out.onAfterTransitionOut(out.id);
					rias.publish("/dojox/mobile/afterTransitionOut", [out, out.id]);
				}
				this.onAfterTransitionIn(this.id);
				rias.publish("/dojox/mobile/afterTransitionIn", [this, this.id]);
			}
			return r;
		},
		show: function(/*Boolean?*/noEvent, /*Boolean?*/doNotHideOthers){
			this._show(noEvent, doNotHideOthers);
			this.inherited(arguments);
		},

		hide: function(){
			// summary:
			//		Hides this view without a transition animation.
			this.domNode.style.display = "none";
			this.inherited(arguments);
		}

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
