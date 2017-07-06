
/// riasw.sys._ItemBase

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_Contained",
	"riasw/sys/_Container"
], function(rias, _WidgetBase, _Contained, _Container){

	// module:
	//		riasw/sys/_ItemBase

	var _ItemBase = rias.declare("riasw.sys._ItemBase", [_WidgetBase, _Container, _Contained], {
		// summary:
		//		A base class for item classes (e.g. ListItem, IconItem, etc.).
		// description:
		//		_ItemBase is a base class for widgets that have capability to
		//		make a view transition when clicked.

		// scene: String
		//		The name of a scene. Used from dojox/mobile/app.
		scene: "",
		// clickable: Boolean
		//		If true, this item becomes clickable even if a transition
		//		destination (moveTo, etc.) is not specified.
		clickable: false,

		// href: String
		//		A URL of another web page to go to.
		href: "",
		// hrefTarget: String
		//		A target that specifies where to open a page specified by
		//		href. The value will be passed to the 2nd argument of
		//		window.open().
		hrefTarget: "",

		// url: String
		//		A URL of an html fragment page or JSON data that represents a
		//		new view content. The view content is loaded with XHR and
		//		inserted in the current page. Then a view transition occurs to
		//		the newly created view. The view is cached so that subsequent
		//		requests would not load the content again.
		url: "",
		// urlTarget: String
		//		Node id under which a new view will be created according to the
		//		url parameter. If not specified, The new view will be created as
		//		a sibling of the current view.
		urlTarget: "",

		script: "",

		// moveTo: String
		//		The id of the transition destination view which resides in the
		//		current page.
		//
		//		If the value has a hash sign ('#') before the id (e.g. #view1)
		//		and the dojo/hash module is loaded by the user application, the
		//		view transition updates the hash in the browser URL so that the
		//		user can bookmark the destination view. In this case, the user
		//		can also use the browser's back/forward button to navigate
		//		through the views in the browser history.
		//
		//		If null, transitions to a blank view.
		//		If '#', returns immediately without transition.
		moveTo: "",
		// back: Boolean
		//		If true, history.back() is called when clicked.
		back: false,
		// transition: String
		//		A type of animated transition effect. You can choose from the
		//		standard transition types, "slide", "fade", "flip", or from the
		//		extended transition types, "cover", "coverv", "dissolve",
		//		"reveal", "revealv", "scaleIn", "scaleOut", "slidev",
		//		"swirl", "zoomIn", "zoomOut", "cube", and "swap". If "none" is
		//		specified, transition occurs immediately without animation.
		transition: "",
		// transitionDir: Number
		//		The transition direction. If 1, transition forward. If -1,
		//		transition backward. For example, the slide transition slides
		//		the view from right to left when dir == 1, and from left to
		//		right when dir == -1.
		transitionDir: 1,
		// transitionOptions: Object
		//		A hash object that holds transition options.
		transitionOptions: null,
		// callback: Function|String
		//		A callback function that is called when the transition has been
		//		finished. A function reference, or name of a function in
		//		context.
		callback: null,

		// icon: String
		//		An icon image to display. The value can be either a path for an
		//		image file or a class name of a DOM button. If icon is not
		//		specified, the iconBase parameter of the parent widget is used.
		icon: "",
		// iconPos: String
		//		The position of an aggregated icon. IconPos is comma separated
		//		values like top,left,width,height (ex. "0,0,29,29"). If iconPos
		//		is not specified, the iconPos parameter of the parent widget is
		//		used.
		iconPos: "", // top,left,width,height (ex. "0,0,29,29")
		// alt: String
		//		An alternate text for the icon image.
		alt: "",
		// label: String
		//		A label of the item. If the label is not specified, innerHTML is
		//		used as a label.
		label: "",
		// tabIndex: String
		//		Tabindex setting for the item so users can hit the tab key to
		//		focus on it.
		tabIndex: "0",
		// _setTabIndexAttr: [private] String
		//		Sets tabIndex to domNode.
		_setTabIndexAttr: "",

		// toggle: Boolean
		//		If true, the item acts like a toggle button.
		toggle: false,
		// selected: Boolean
		//		If true, the item is highlighted to indicate it is selected.
		selected: false,

		/* internal properties */	

		// paramsToInherit: String
		//		Comma separated parameters to inherit from the parent.
		paramsToInherit: "transition,icon",

		// _selStartMethod: String
		//		Specifies how the item enters the selected state.
		//
		//		- "touch": Use touch events to enter the selected state.
		//		- "none": Do not change the selected state.
		_selStartMethod: "none", // touch or none
		// _selEndMethod: String
		//		Specifies how the item leaves the selected state.
		//
		//		- "touch": Use touch events to leave the selected state.
		//		- "timer": Use setTimeout to leave the selected state.
		//		- "none": Do not change the selected state.
		_selEndMethod: "none", // touch, timer, or none
		// _delayedSelection: Boolean
		//		If true, selection is delayed 100ms and canceled if dragged in
		//		order to avoid selection when flick operation is performed.
		_delayedSelection: false,
		// _duration: Number
		//		Duration of selection, milliseconds.
		_duration: 800,

		// _handleClick: Boolean
		//		If true, this widget listens to touch events.
		_handleClick: true,

		inheritParams: function(){
			// summary:
			//		Copies from the parent the values of parameters specified
			//		by the property paramsToInherit.
			var parent = this.getParent();
			if(parent){
				rias.forEach(this.paramsToInherit.split(/,/), function(p){
					p = rias.trim(p);
					if(p.match(/icon/i)){
						var base = p + "Base",
							pos = p + "Pos";
						if(this[p] && parent[base] && parent[base].charAt(parent[base].length - 1) === '/'){
							this[p] = parent[base] + this[p];
						}
						if(!this[p]){
							this[p] = parent[base];
						}
						if(!this[pos]){
							this[pos] = parent[pos];
						}
					}
					if(!this[p]){
						this[p] = parent[p];
					}
				}, this);
			}
			return !!parent;
		},
		buildRendering: function(){
			this.inherited(arguments);
			this._isOnLine = this.inheritParams();
		},

		_updateHandles: function(){
			// tags:
			//		private
			if(this._handleClick && this._selStartMethod === "touch"){
				if(!this._onTouchStartHandle){
					this._onTouchStartHandle = this.after(this.domNode, rias.touch.press, "_onTouchStart", true);
				}
			}else{
				if(this._onTouchStartHandle){
					this._onTouchStartHandle.remove();
					this._onTouchStartHandle = null;
				}
			}
		},
		startup: function(){
			if(this._started){
				return;
			}
			if(!this._isOnLine){
				this.inheritParams();
			}
			this._updateHandles();
			this.inherited(arguments);
		},

		userClickAction: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined click action.
		},
		defaultClickAction: function(/*Event*/e){
			// summary:
			//		The default action of this item.
			this.handleSelection(e);
			if(this.userClickAction(e) === false){
				return;
			} // user's click action
			this.makeTransition(e);
		},

		handleSelection: function(/*Event*/e){
			// summary:
			//		Handles this items selection state.

			// Before transitioning, we want the visual effect of selecting the item.
			// To ensure this effect happens even if _delayedSelection is true:
			if(this._delayedSelection){
				this.set("selected", true);
			} // the item will be deselected after transition.

			if(this._onTouchEndHandle){
				this._onTouchEndHandle.remove();
				this._onTouchEndHandle = null;
			}

			var p = this.getParent();
			if(this.toggle){
				this.set("selected", !this._currentSel);
			}else if(p && p.selectOne){
				this.set("selected", true);
			}else{
				if(this._selEndMethod === "touch"){
					this.set("selected", false);
				}else if(this._selEndMethod === "timer"){
					this.defer(function(){
						this.set("selected", false);
					}, this._duration);
				}
			}
		},

		getTransOpts: function(){
			// summary:
			//		Copies from the parent and returns the values of parameters
			//		specified by the property paramsToInherit.
			var opts = rias.mixinDeep({}, this.transitionOptions);///需要使用副本
			rias.forEach(["moveTo", "href", "hrefTarget", "url", "target", "urlTarget", "scene", "transition", "transitionDir"], function(p){
				if(!opts[p]){
					opts[p] = rias.mixinDeep({}, this[p]);
				}
			}, this);
			if(!this.isLeftToRight()){
				opts.transitionDir = opts.transitionDir * -1;
			}
			return opts; // Object
		},
		_onNewWindowOpened: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		Subclasses may want to implement it.
		},
		_prepareForTransition: function(/*Event*/e, /*Object*/transOpts){
			// summary:
			//		Subclasses may want to implement it.
		},
		setTransitionPos: function(e){
			// summary:
			//		Stores the clicked position for later use.
			// description:
			//		Some of the transition animations (e.g. ScaleIn) need the
			//		clicked position.
			var w = this;
			while(true){
				w = w.getParent();
				if(!w || rias.isRiaswView(w)){
					break;
				}
			}
			if(w){
				w.clickedPosX = e.clientX;
				w.clickedPosY = e.clientY;
			}
		},
		makeTransition: function(/*Event*/e){
			// summary:
			//		Makes a transition.
			if(this.back && history){
				history.back();
				return;
			}	
			if (this.href && this.hrefTarget && this.hrefTarget !== "_self") {
				rias.dom.openWindow(this.href, this.hrefTarget || "_blank");
				this._onNewWindowOpened(e);
				return;
			}
			var opts = this.getTransOpts();
			var doTransition = !!(opts.moveTo || opts.href || opts.url || opts.target || opts.scene);
			if(this._prepareForTransition(e, doTransition ? opts : null) === false){
				return;
			}
			if(doTransition){
				this.setTransitionPos(e);
				rias.rt.dispatchTransition(this, opts, e);
			}
		},

		onTouchStart: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined function to handle touchStart events.
			// tags:
			//		callback
		},
		_onTouchStart: function(e){
			// tags:
			//		private
			if(this.getParent().isEditing || this.onTouchStart(e) === false){
				return;
			} // user's touchStart action
			var enclosingScrollable = rias.rt.getEnclosingScrollable(this.domNode);
			if(enclosingScrollable && rias.dom.containsClass(enclosingScrollable.containerNode, "mblScrollableScrollTo2")){
				// #17165: do not select the item during scroll animation
				return;
			}
			if(!this._onTouchEndHandle && this._selStartMethod === "touch"){
				// Connect to the entire window. Otherwise, fail to receive
				// events if operation is performed outside this widget.
				// Expose both connect handlers in case the user has interest.
				this._onTouchMoveHandle = this.after(rias.dom.desktopBody, rias.touch.move, "_onTouchMove", true);
				this._onTouchEndHandle = this.after(rias.dom.desktopBody, rias.touch.release, "_onTouchEnd", true);
			}
			this.touchStartX = e.touches ? e.touches[0].pageX : e.clientX;
			this.touchStartY = e.touches ? e.touches[0].pageY : e.clientY;
			this._currentSel = this.selected;

			if(this._delayedSelection){
				// so as not to make selection when the user flicks on ScrollableView
				this._selTimer = this.defer(function(){
					this.set("selected", true);
				}, 100);
			}else{
				this.set("selected", true);
			}
		},

		_onTouchMove: function(e){
			// tags:
			//		private
			var x = e.touches ? e.touches[0].pageX : e.clientX;
			var y = e.touches ? e.touches[0].pageY : e.clientY;
			if(Math.abs(x - this.touchStartX) >= 4 ||
			   Math.abs(y - this.touchStartY) >= 4){ // dojox/mobile/scrollable.threshold
				this.cancel();
				var p = this.getParent();
				if(p && p.selectOne){
					if(this._prevSel){
						this._prevSel.set("selected", true);
					}
				}else{
					this.set("selected", false);
				}
			}
		},

		cancel: function(){
			// summary:
			//		Cancels an ongoing selection (if any).
			if(this._selTimer){
				this._selTimer.remove(); 
				this._selTimer = null;
			}
			if(this._onTouchMoveHandle){
				this._onTouchMoveHandle.remove();
				this._onTouchMoveHandle = undefined;
			}
			if(this._onTouchEndHandle){
				this._onTouchEndHandle.remove();
				this._onTouchEndHandle = undefined;
			}
		},
		_onTouchEnd: function(e){
			// tags:
			//		private
			if(!this._selTimer && this._delayedSelection){
				return;
			}
			this.cancel();
			this._onClick(e);
		},

		_setLabelAttr: function(/*String*/ text){
			this._set("label", text);
			this.labelNode.innerHTML = text;
			if(!this.textDir){
				var p = this.getParent();
				this.textDir = p && p.get("textDir") ? p.get("textDir") : "";
			}
			//if(this.enforceTextDirWithUcc){
			//	this.labelNode.innerHTML = this.enforceTextDirWithUcc(this.labelNode.innerHTML);
			//}
			//if(this.applyTextDir){
			//	this.applyTextDir(this.labelNode);
			//}
		},
		_setSelectedAttr: function(/*Boolean*/selected){
			// summary:
			//		Makes this widget in the selected or unselected state.
			// description:
			//		Subclass should override.
			// tags:
			//		private
			if(selected){
				var p = this.getParent();
				if(p && p.selectOne){
					// deselect the currently selected item
					var arr = rias.filter(p.getChildren(), function(w){
						return w.selected;
					});
					rias.forEach(arr, function(c){
						this._prevSel = c;
						c.set("selected", false);
					}, this);
				}
			}
			this._set("selected", selected);
		}
	});

	return _ItemBase;
});
