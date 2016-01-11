
//RIAStudio client runtime widget - SwapView

define([
	"rias/riasw/mobile/mobileBase",
	//"dojox/mobile/SwapView",
	"rias/riasw/mobile/View",
	"dojox/mobile/_ScrollableMixin",
	"rias/riasw/mobile/scrollable"
], function(rias, _Widget, _ScrollableMixin){

	rias.theme.loadCss([
		//"SwapView.css"
	], true);

	var riasType = "rias.riasw.mobile.SwapView";
	var Widget = rias.declare(riasType, [_Widget, _ScrollableMixin], {

		scrollDir: "f",
		// weight: [private] Number
		//		Frictional weight used to compute scrolling speed.
		weight: 1.2,

		// _endOfTransitionTimeoutHandle: [private] Object
		//		The handle (returned by _WidgetBase.defer) for the timeout set on touchEnd in case
		//      the end of transition event is not fired by the browser.
		_endOfTransitionTimeoutHandle: null,

		buildRendering: function(){
			this.inherited(arguments);
			rias.dom.addClass(this.domNode, "mblSwapView");
			this.setSelectable(this.domNode, false);
			this.containerNode = this.domNode;
			this.subscribe("/dojox/mobile/nextPage", "handleNextPage");
			this.subscribe("/dojox/mobile/prevPage", "handlePrevPage");
			this.noResize = true; // not to call resize() from scrollable#init
		},

		startup: function(){
			if(this._started){
				return;
			}
			this.inherited(arguments);
		},

		resize: function(){
			// summary:
			//		Calls resize() of each child widget.
			this.inherited(arguments); //继承至 _ScrollableMixin，没有调用（inherited）View // scrollable#resize() will be called
			//rias.forEach(this.getChildren(), function(child){
			//	if(child.resize){
			//		child.resize();
			//	}
			//});
			this._resizeCalled = true;
			this._internalResize();
		},

		onTouchStart: function(/*Event*/e){
			// summary:
			//		Internal function to handle touchStart events.
			if(this._siblingViewsInMotion()){  // Ignore touchstart if the views are already in motion
				this.propagatable ? e.preventDefault() : rias.event.stop(e);
				return;
			}
			var fromTop = this.domNode.offsetTop;
			var nextView = this.nextView(this.domNode);
			if(nextView){
				nextView.stopAnimation();
				rias.dom.addClass(nextView.domNode, "mblIn");
				// Temporarily add padding to align with the fromNode while transition
				nextView.containerNode.style.paddingTop = fromTop + "px";
			}
			var prevView = this.previousView(this.domNode);
			if(prevView){
				prevView.stopAnimation();
				rias.dom.addClass(prevView.domNode, "mblIn");
				// Temporarily add padding to align with the fromNode while transition
				prevView.containerNode.style.paddingTop = fromTop + "px";
			}
			this._setSiblingViewsInMotion(true);
			this.inherited(arguments);
		},

		onTouchEnd: function(/*Event*/e){
			if(e){
				if(!this._moved){ // No transition / animation following touchend in this case
					this._setSiblingViewsInMotion(false);
				}else{ // There might be a transition / animation following touchend
					// As the webkitTransitionEndEvent is not always fired, make sure we call this._setSiblingViewsInMotion(false) even
					// if the event is not fired (and onFlickAnimationEnd is not called as a result)
					this._endOfTransitionTimeoutHandle = this.defer(function(){
						this._setSiblingViewsInMotion(false);
					}, 1000);
				}
			}
			this.inherited(arguments);
		},

		handleNextPage: function(/*Widget*/w){
			// summary:
			//		Called when the "/dojox/mobile/nextPage" topic is published.
			var refNode = w.refId && rias.dom.byId(w.refId) || w.domNode;
			if(this.domNode.parentNode !== refNode.parentNode){ return; }
			if(this.getShowingView() !== this){ return; }
			this.goTo(1);
		},

		handlePrevPage: function(/*Widget*/w){
			// summary:
			//		Called when the "/dojox/mobile/prevPage" topic is published.
			var refNode = w.refId && rias.dom.byId(w.refId) || w.domNode;
			if(this.domNode.parentNode !== refNode.parentNode){ return; }
			if(this.getShowingView() !== this){ return; }
			this.goTo(-1);
		},

		goTo: function(/*Number*/dir, /*String?*/moveTo){
			// summary:
			//		Moves to the next or previous view.
			var view = moveTo ? rias.by(moveTo) :
				((dir == 1) ? this.nextView(this.domNode) : this.previousView(this.domNode));
			if(view && view !== this){
				this.stopAnimation(); // clean-up animation states
				view.stopAnimation();
				this.domNode._isShowing = false; // update isShowing flag
				view.domNode._isShowing = true;
				this.performTransition(view.id, dir, "slide", null, function(){
					rias.publish("/dojox/mobile/viewChanged", [view]);
				});
			}
		},

		isSwapView: function(/*DomNode*/node){
			// summary:
			//		Returns true if the given node is a SwapView widget.
			return (node && node.nodeType === 1 && rias.dom.hasClass(node, "mblSwapView"));
		},

		nextView: function(/*DomNode*/node){
			// summary:
			//		Returns the next view.
			for(var n = node.nextSibling; n; n = n.nextSibling){
				if(this.isSwapView(n)){
					return rias.registry.byNode(n);
				}
			}
			return null;
		},

		previousView: function(/*DomNode*/node){
			// summary:
			//		Returns the previous view.
			for(var n = node.previousSibling; n; n = n.previousSibling){
				if(this.isSwapView(n)){
					return rias.registry.byNode(n);
				}
			}
			return null;
		},

		scrollTo: function(/*Object*/to){
			// summary:
			//		Overrides dojox/mobile/scrollable.scrollTo().
			if(!this._beingFlipped){
				var newView, x;
				if(to.x){
					if(to.x < 0){
						newView = this.nextView(this.domNode);
						x = to.x + this.domNode.offsetWidth;
					}else{
						newView = this.previousView(this.domNode);
						x = to.x - this.domNode.offsetWidth;
					}
				}
				if(newView){
					if(newView.domNode.style.display === "none"){
						newView.domNode.style.display = "";
						newView.resize();
					}
					newView._beingFlipped = true;
					newView.scrollTo({x:x});
					newView._beingFlipped = false;
				}
			}
			this.inherited(arguments);
		},

		findDisp: function(/*DomNode*/node){
			// summary:
			//		Overrides dojox/mobile/scrollable.findDisp().
			// description:
			//		When this function is called from scrollable.js, there are
			//		two visible views, one is the current view, the other is the
			//		next view. This function returns the current view, not the
			//		next view, which has the mblIn class.
			if(!rias.dom.hasClass(node, "mblSwapView")){
				return this.inherited(arguments);
			}
			if(!node.parentNode){ return null; }
			var nodes = node.parentNode.childNodes;
			for(var i = 0; i < nodes.length; i++){
				var n = nodes[i];
				if(n.nodeType === 1 && rias.dom.hasClass(n, "mblSwapView")
					&& !rias.dom.hasClass(n, "mblIn") && n.style.display !== "none"){
					return n;
				}
			}
			return node;
		},

		slideTo: function(/*Object*/to, /*Number*/duration, /*String*/easing, /*Object?*/fake_pos){
			// summary:
			//		Overrides dojox/mobile/scrollable.slideTo().
			if(!this._beingFlipped){
				var w = this.domNode.offsetWidth;
				var pos = fake_pos || this.getPos();
				var newView, newX;
				if(pos.x < 0){ // moving to left
					newView = this.nextView(this.domNode);
					if(pos.x < -w/4){ // slide to next
						if(newView){
							to.x = -w;
							newX = 0;
						}
					}else{ // go back
						if(newView){
							newX = w;
						}
					}
				}else{ // moving to right
					newView = this.previousView(this.domNode);
					if(pos.x > w/4){ // slide to previous
						if(newView){
							to.x = w;
							newX = 0;
						}
					}else{ // go back
						if(newView){
							newX = -w;
						}
					}
				}

				if(newView){
					newView._beingFlipped = true;
					newView.slideTo({x:newX}, duration, easing);
					newView._beingFlipped = false;
					newView.domNode._isShowing = (newView && newX === 0);
				}
				this.domNode._isShowing = !(newView && newX === 0);
			}
			this.inherited(arguments);
		},

		onAnimationEnd: function(/*Event*/e){
			// summary:
			//		Overrides dojox/mobile/View.onAnimationEnd().
			if(e && e.target && rias.dom.hasClass(e.target, "mblScrollableScrollTo2")){ return; }
			this.inherited(arguments);
		},

		onFlickAnimationEnd: function(/*Event*/e){
			if(this._endOfTransitionTimeoutHandle){
				this._endOfTransitionTimeoutHandle = this._endOfTransitionTimeoutHandle.remove();
			}
			// summary:
			//		Overrides dojox/mobile/scrollable.onFlickAnimationEnd().
			if(e && e.target && !rias.dom.hasClass(e.target, "mblScrollableScrollTo2")){ return; }
			this.inherited(arguments);

			if(this.domNode._isShowing){
				// Hide all the views other than the currently showing one.
				// Otherwise, when the orientation is changed, other views
				// may appear unexpectedly.
				array.forEach(this.domNode.parentNode.childNodes, function(c){
					if(this.isSwapView(c)){
						rias.dom.removeClass(c, "mblIn");
						if(!c._isShowing){
							c.style.display = "none";
							c.style[css3.name("transform")] = "";
							c.style.left = "0px"; // top/left mode needs this
							// reset the temporaty padding on the container node
							c.style.paddingTop = "";
						}
					}
				}, this);
				rias.publish("/dojox/mobile/viewChanged", [this]);
				// Reset the temporary padding
				this.containerNode.style.paddingTop = "";
			}else if(!has("css3-animations")){
				this.containerNode.style.left = "0px"; // compat mode needs this
			}
			this._setSiblingViewsInMotion(false);
		},

		_setSiblingViewsInMotion: function(/*Boolean*/inMotion){
			var inMotionAttributeValue = inMotion ? "true" : false;
			var parent = this.domNode.parentNode;
			if(parent){
				parent.setAttribute("data-dojox-mobile-swapview-inmotion", inMotionAttributeValue);
			}
		},

		_siblingViewsInMotion: function(){
			var parent = this.domNode.parentNode;
			if(parent){
				return parent.getAttribute("data-dojox-mobile-swapview-inmotion") == "true";
			}else{
				return false;
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswSwapViewIcon",
		iconClass16: "riaswSwapViewIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
