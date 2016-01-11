
//RIAStudio client runtime widget - View

define([
	"rias/riasw/mobile/mobileBase",
	"rias/riasw/layout/_PanelBase",
	"dojox/mobile/ViewController",
	"dojox/mobile/common",
	"dojox/mobile/transition",
	"dojox/mobile/viewRegistry",
	"dojox/mobile/_css3",
	"dojox/mobile/TransitionEvent"
], function(rias, _Widget, ViewController, common, transitDeferred, viewRegistry, css3){

	ViewController.extend({
		findTransitionViews: function(/*String*/moveTo){
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
			//var view = rias.registry.byId(RegExp.$1);
			var view = rias.by(s[1]);
			if(!view){
				return [];
			}
			for(var v = view.getParent(); v; v = v.getParent()){ // search for the topmost invisible parent node
				//if((v.isInstanceOf(Widget) || rias.isInstanceOf(v, "")) && v.isVisible && !v.isVisible()){
				if(rias.isInstanceOf(v, Widget) && v.isVisible && !v.isVisible()){
					var sv = view.getShowingView();
					if(sv && sv.id !== view.id){
						view.show();
					}
					view = v;
				}
			}
			return [view.getShowingView(), view, params]; // fromView, toView, params
		}
	});

	rias.theme.loadCss([
		"View.css"
	], true);

	var riasType = "rias.riasw.mobile.View";
	var Widget = rias.declare(riasType, [_Widget], {

		isLayoutContainer: true,
		animated: false,

		startup: function(){
			var self = this;
			//self.inherited(arguments);
			if(this._started){ return; }

			// Determine which view among the siblings should be visible.
			// Priority:
			//	 1. fragment id in the url (ex. #view1,view2)
			//	 2. this.selected
			//	 3. the first view
			if(this._visible === undefined){
				var views = this.getSiblingViews();
				var ids = location.hash && location.hash.substring(1).split(/,/);
				var fragView, selectedView, firstView;
				rias.forEach(views, function(v, i){
					if(rias.indexOf(ids, v.id) !== -1){
						fragView = v;
					}
					if(i == 0){
						firstView = v;
					}
					if(v.selected){
						selectedView = v;
					}
					v._visible = false;
				}, this);
				(fragView || selectedView || firstView)._visible = true;
			}
			if(this._visible){
				// The 2nd arg is not to hide its sibling views so that they can be
				// correctly initialized.
				this.show(true, true);

				// Defer firing events to let user connect to events just after creation
				// TODO: revisit this for 2.0
				this.defer(function(){
					this.onStartView();
					rias.publish("/dojox/mobile/startView", [this]);
				});
			}

			if(this.domNode.style.visibility === "hidden"){ // this check is to avoid screen flickers
				this.domNode.style.visibility = "inherit";
			}

			// Need to call inherited first - so that child widgets get started
			// up correctly
			this.inherited(arguments);

			var parent = this.getParent();
			if(!parent || !parent.resize){ // top level widget
				this.resize();
			}

			if(!this._visible){
				// hide() should be called last so that child widgets can be
				// initialized while they are visible.
				this.hide();
			}

			///扩展===================================///
			self.own(rias.subscribe("/dojox/mobile/afterTransitionIn", function(view, moveTo, dir, transition, context, method){
				//view.afterTransitionIn();///使用 view 本身的 onAfterTransitionIn
				if(view == self){
					self.resize();
				}
			}));
		},

		//afterTransitionIn: function(){
		//},

		convertToId: function(moveTo){
			if(typeof(moveTo) == "string"){
				// removes a leading hash mark (#) and params if exists
				// ex. "#bar&myParam=0003" -> "bar"
				moveTo = moveTo.replace(/^#?([^&?]+).*/, "$1");
			}
			var w = rias.by(moveTo, this._riasrModule);
			return w ? w.id : moveTo;
		},

		/// dojox/mobile/View =====================================///
		selected: false,
		// keepScrollPos: Boolean
		//		If true, the scroll position is kept when transition occurs between views.
		keepScrollPos: true,
		// tag: String
		//		The name of the HTML tag to create as domNode. The default value is "div".
		tag: "div",
		/* internal properties */
		baseClass: "mblView",

		constructor: function(/*Object*/params, /*DomNode?*/node){
			if(node){
				rias.dom.byId(node).style.visibility = "hidden";
			}
		},
		destroy: function(){
			viewRegistry.remove(this.id);
			this.inherited(arguments);
		},
		buildRendering: function(){
			if(!this.templateString){
				// Create root node if it wasn't created by _TemplatedMixin
				this.domNode = this.containerNode = this.srcNodeRef || rias.dom.create(this.tag);
			}

			this._animEndHandle = this.connect(this.domNode, css3.name("animationEnd"), "onAnimationEnd");
			this._animStartHandle = this.connect(this.domNode, css3.name("animationStart"), "onAnimationStart");
			if(!rias.config.mblCSS3Transition){
				this._transEndHandle = this.connect(this.domNode, css3.name("transitionEnd"), "onAnimationEnd");
			}
			if(rias.has('mblAndroid3Workaround')){
				// workaround for the screen flicker issue on Android 3.x/4.0
				// applying "-webkit-transform-style:preserve-3d" to domNode can avoid
				// transition animation flicker
				rias.dom.setStyle(this.domNode, css3.name("transformStyle"), "preserve-3d");
			}

			viewRegistry.add(this);
			this.inherited(arguments);
		},

		resize: function(){
			// summary:
			//		Calls resize() of each child widget.
			//rias.forEach(this.getChildren(), function(child){
			//	if(child.resize){
			//		child.resize();
			//	}
			//});
			this.inherited(arguments);
		},

		onStartView: function(){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called only when this view is shown at startup time.
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
				if(n.nodeType === 1 && rias.dom.hasClass(n, "mblView")){
					this._clearClasses(n);
				}
			}
			this._clearClasses(toNode); // just in case toNode is a sibling of an ancestor.

			// #16337
			// Uninitialization may fail to clear _inProgress when multiple
			// performTransition calls occur in a short duration of time.
			var toWidget = rias.registry.byNode(toNode);
			if(toWidget){
				toWidget._inProgress = false;
			}
		},

		_isBookmarkable: function(detail){
			return detail.moveTo && (rias.config.mblForceBookmarkable || detail.moveTo.charAt(0) === '#') && !detail.hashchange;
		},

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

			if(this._inProgress){ return; } // transition is in progress
			this._inProgress = true;

			// normalize the arg
			var detail, optArgs;
			if(moveTo && typeof(moveTo) === "object"){
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

			if(detail.moveTo === "#"){ return; }
			var toNode;
			if(detail.moveTo){
				toNode = this.convertToId(detail.moveTo);
			}else{
				if(!this._dummyNode){
					this._dummyNode = rias.doc.createElement("div");
					rias.body().appendChild(this._dummyNode);
				}
				toNode = this._dummyNode;
			}

			if(this.addTransitionInfo && typeof(detail.moveTo) == "string" && this._isBookmarkable(detail)){
				this.addTransitionInfo(this.id, detail.moveTo, {transitionDir:detail.transitionDir, transition:detail.transition});
			}

			var fromNode = this.domNode;
			var fromTop = fromNode.offsetTop;
			toNode = this.toNode = rias.dom.byId(toNode);
			if(!toNode){ console.log("dojox/mobile/View.performTransition: destination view not found: "+detail.moveTo); return; }
			toNode.style.visibility = "hidden";
			toNode.style.display = "";
			this._fixViewState(toNode);
			var toWidget = rias.registry.byNode(toNode);
			if(toWidget){
				if(rias.isInstanceOf(toWidget, Widget) && toWidget.displayState !== _Widget.displayShowNormal){
					toWidget.show();
				}
				// Now that the target view became visible, it's time to run resize()
				if(rias.config.mblAlwaysResizeOnTransition || !toWidget._resized){
					common.resizeAll(null, toWidget);
					toWidget._resized = true;
				}

				if(detail.transition && detail.transition != "none"){
					// Temporarily add padding to align with the fromNode while transition
					toWidget._addTransitionPaddingTop(fromTop);
				}

				toWidget.load && toWidget.load(); // for ContentView

				toWidget.movedFrom = fromNode.id;
			}
			if(rias.has('mblAndroidWorkaround') && !rias.config.mblCSS3Transition
				&& detail.transition && detail.transition != "none"){
				// workaround for the screen flicker issue on Android 2.2/2.3
				// apply "-webkit-transform-style:preserve-3d" to both toNode and fromNode
				// to make them 3d-transition-ready state just before transition animation
				rias.dom.setStyle(toNode, css3.name("transformStyle"), "preserve-3d");
				rias.dom.setStyle(fromNode, css3.name("transformStyle"), "preserve-3d");
				// show toNode offscreen to avoid flicker when switching "display" and "visibility" styles
				rias.dom.addClass(toNode, "mblAndroidWorkaround");
			}

			this.onBeforeTransitionOut.apply(this, this._arguments);
			rias.publish("/dojox/mobile/beforeTransitionOut", [this].concat(rias.toArray(this._arguments)));
			if(toWidget){
				// perform view transition keeping the scroll position
				if(this.keepScrollPos && !this.getParent()){
					var scrollTop = rias.body().scrollTop || rias.doc.documentElement.scrollTop || rias.global.pageYOffset || 0;
					fromNode._scrollTop = scrollTop;
					var toTop = (detail.transitionDir == 1) ? 0 : (toNode._scrollTop || 0);
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
				rias.publish("/dojox/mobile/beforeTransitionIn", [toWidget].concat(rias.toArray(this._arguments)));
			}
			toNode.style.display = "none";
			toNode.style.visibility = "inherit";

			common.fromView = this;
			common.toView = toWidget;

			this._doTransition(fromNode, toNode, detail.transition, detail.transitionDir);
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

		_doTransition: function(fromNode, toNode, transition, transitionDir){
			var self = this,
				rev = (transitionDir == -1) ? " mblReverse" : "";
			toNode.style.display = "";
			if(!transition || transition == "none"){
				self.domNode.style.display = "none";
				self.invokeCallback();
			}else if(rias.config.mblCSS3Transition){
				//get dojox/css3/transit first
				rias.when(transitDeferred, function(transit){
					//follow the style of .mblView.mblIn in View.css
					//need to set the toNode to absolute position
					var toPosition = rias.dom.getStyle(toNode, "position");
					rias.dom.setStyle(toNode, "position", "absolute");
					rias.when(transit(fromNode, toNode, {transition: transition, reverse: (transitionDir===-1) ? true : false}), function(){
						rias.dom.setStyle(toNode, "position", toPosition);
						// Reset the temporary padding on toNode
						toNode.style.paddingTop = "";
						self.invokeCallback();
					});
				});
			}else{
				if(transition.indexOf("cube") != -1){
					if(rias.has('ipad')){
						rias.dom.setStyle(toNode.parentNode, {webkitPerspective:1600});
					}else if(rias.has("ios")){
						rias.dom.setStyle(toNode.parentNode, {webkitPerspective:800});
					}
				}
				var s = this._toCls(transition);
				if(rias.has('mblAndroidWorkaround')){
					// workaround for the screen flicker issue on Android 2.2
					// applying transition css classes just after setting toNode.style.display = ""
					// causes flicker, so wait for a while using setTimeout (via defer)
					var self = this;
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
					this.defer(function(){
						rias.dom.addClass(fromNode, "mblTransition");
						rias.dom.addClass(toNode, "mblTransition");
					}, 100);
				}
				// set transform origin
				var fromOrigin = "50% 50%";
				var toOrigin = "50% 50%";
				var scrollTop, posX, posY;
				if(transition.indexOf("swirl") != -1 || transition.indexOf("zoom") != -1){
					if(this.keepScrollPos && !this.getParent()){
						scrollTop = rias.body().scrollTop || rias.doc.documentElement.scrollTop || rias.global.pageYOffset || 0;
					}else{
						scrollTop = -rias.dom.position(fromNode, true).y;
					}
					posY = rias.global.innerHeight / 2 + scrollTop;
					fromOrigin = "50% " + posY + "px";
					toOrigin = "50% " + posY + "px";
				}else if(transition.indexOf("scale") != -1){
					var viewPos = rias.dom.position(fromNode, true);
					posX = ((this.clickedPosX !== undefined) ? this.clickedPosX : rias.global.innerWidth / 2) - viewPos.x;
					if(this.keepScrollPos && !this.getParent()){
						scrollTop = rias.body().scrollTop || rias.doc.documentElement.scrollTop || rias.global.pageYOffset || 0;
					}else{
						scrollTop = -viewPos.y;
					}
					posY = ((this.clickedPosY !== undefined) ? this.clickedPosY : rias.global.innerHeight / 2) + scrollTop;
					fromOrigin = posX + "px " + posY + "px";
					toOrigin = posX + "px " + posY + "px";
				}
				rias.dom.setStyle(fromNode, css3.add({}, {transformOrigin:fromOrigin}));
				rias.dom.setStyle(toNode, css3.add({}, {transformOrigin:toOrigin}));
			}
		},

		onAnimationStart: function(e){
			// summary:
			//		A handler that is called when transition animation starts.
		},

		onAnimationEnd: function(e){
			// summary:
			//		A handler that is called after transition animation ends.
			var name = e.animationName || e.target.className;
			if(name.indexOf("Out") === -1 &&
				name.indexOf("In") === -1 &&
				name.indexOf("Shrink") === -1){ return; }
			var isOut = false;
			if(rias.dom.hasClass(this.domNode, "mblOut")){
				isOut = true;
				this.domNode.style.display = "none";
				rias.dom.removeClass(this.domNode, [this._toCls(this._detail.transition), "mblIn", "mblOut", "mblReverse"]);
			}else{
				// Reset the temporary padding
				this._removeTransitionPaddingTop();
			}
			rias.dom.setStyle(this.domNode, css3.add({}, {transformOrigin:""}));
			if(name.indexOf("Shrink") !== -1){
				var li = e.target;
				li.style.display = "none";
				rias.dom.removeClass(li, "mblCloseContent");

				// If target is placed inside scrollable, need to call onTouchEnd
				// to adjust scroll position
				var p = viewRegistry.getEnclosingScrollable(this.domNode);
				p && p.onTouchEnd();
			}
			if(isOut){
				this.invokeCallback();
			}
			this._clearClasses(this.domNode);

			// clear the clicked position
			this.clickedPosX = this.clickedPosY = undefined;

			if(name.indexOf("Cube") !== -1 &&
				name.indexOf("In") !== -1 && rias.has("ios")){
				this.domNode.parentNode.style[css3.name("perspective")] = "";
			}
		},

		invokeCallback: function(){
			// summary:
			//		A function to be called after performing a transition to
			//		call a specified callback.
			this.onAfterTransitionOut.apply(this, this._arguments);
			rias.publish("/dojox/mobile/afterTransitionOut", [this].concat(this._arguments));
			var toWidget = rias.registry.byNode(this.toNode);
			if(toWidget){
				toWidget.onAfterTransitionIn.apply(toWidget, this._arguments);
				rias.publish("/dojox/mobile/afterTransitionIn", [toWidget].concat(this._arguments));
				toWidget.movedFrom = undefined;
				if(this.setFragIds && this._isBookmarkable(this._detail)){
					this.setFragIds(toWidget); // setFragIds is defined in bookmarkable.js
				}
			}
			if(rias.has('mblAndroidWorkaround')){
				// workaround for the screen flicker issue on Android 2.2/2.3
				// remove "-webkit-transform-style" style after transition finished
				// to avoid side effects such as input field auto-scrolling issue
				// use setTimeout (via defer) to avoid flicker in case of ScrollableView
				this.defer(function(){
					if(toWidget){
						rias.dom.setStyle(this.toNode, css3.name("transformStyle"), "");
					}
					rias.dom.setStyle(this.domNode, css3.name("transformStyle"), "");
				});
			}

			var c = this._detail.context, m = this._detail.method;
			if(c || m){
				if(!m){
					m = c;
					c = null;
				}
				c = c || rias.global;
				if(typeof(m) == "string"){
					c[m].apply(c, this._optArgs);
				}else if(typeof(m) == "function"){
					m.apply(c, this._optArgs);
				}
			}
			this._detail = this._optArgs = this._arguments = undefined;
			this._inProgress = false;
		},

		isVisible: function(/*Boolean?*/checkAncestors){
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
		},

		getShowingView: function(){
			// summary:
			//		Find the currently showing view from my sibling views.
			// description:
			//		Note that depending on the ancestor views' visibility,
			//		the found view may not be actually shown.
			var nodes = this.domNode.parentNode.childNodes;
			for(var i = 0; i < nodes.length; i++){
				var n = nodes[i];
				if(n.nodeType === 1 && rias.dom.hasClass(n, "mblView") && n.style.display !== "none"){
					return rias.registry.byNode(n);
				}
			}
			return null;
		},

		getSiblingViews: function(){
			// summary:
			//		Returns an array of the sibling views.
			if(!this.domNode.parentNode){
				return [this];
			}
			return rias.map(rias.filter(this.domNode.parentNode.childNodes, function(n){
				return n.nodeType === 1 && rias.dom.hasClass(n, "mblView");
			}), function(n){
				return rias.registry.byNode(n);
			});
		},

		show: function(/*Boolean?*/noEvent, /*Boolean?*/doNotHideOthers){
			// summary:
			//		Shows this view without a transition animation.
			var out = this.getShowingView();
			if(!noEvent){
				if(out){
					out.onBeforeTransitionOut(out.id);
					rias.publish("/dojox/mobile/beforeTransitionOut", [out, out.id]);
				}
				this.onBeforeTransitionIn(this.id);
				rias.publish("/dojox/mobile/beforeTransitionIn", [this, this.id]);
			}

			if(doNotHideOthers){
				this.domNode.style.display = "";
			}else{
				rias.forEach(this.getSiblingViews(), function(v){
					v.domNode.style.display = (v === this) ? "" : "none";
				}, this);
			}
			this.inherited(arguments);
			this.load && this.load(); // for ContentView

			if(!noEvent){
				if(out){
					out.onAfterTransitionOut(out.id);
					rias.publish("/dojox/mobile/afterTransitionOut", [out, out.id]);
				}
				this.onAfterTransitionIn(this.id);
				rias.publish("/dojox/mobile/afterTransitionIn", [this, this.id]);
			}
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
		iconClass: "riaswViewIcon",
		iconClass16: "riaswViewIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
