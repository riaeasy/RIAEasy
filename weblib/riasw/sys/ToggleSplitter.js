define([
	"riasw/riaswBase",
	"riasw/sys/_Splitter"
], function(rias, _Splitter) {

	//rias.theme.loadThemeCss([
	//	"riasw/sys/ToggleSplitter.css"
	//]);

	var riaswType = "riasw.sys.ToggleSplitter";

	var Widget = rias.declare(riaswType, _Splitter, {
		// summary:
		//		A draggable and clickable spacer between two items in a `riasw.layout._PanelWidget`.
		// description:
		//		This is instantiated by `riasw.layout._PanelWidget`. Users should not
		//		create it directly.
		// tags:
		//		private

		templateString:
			'<div data-dojo-attach-event="onkeydown:_onKeyDown,press:_startDrag">' +
				'<div role="separator" data-dojo-attach-point="toggleNode" class="riaswToggleSplitterThumb" data-dojo-attach-event="onclick:_toggle, press:_onToggleNodeMouseDown">' +
				//'<span data-dojo-attach-point="a11yText" class="riaswToggleSplitterA11y"></span></div>' +
			'</div>',

		baseClass: "riaswToggleSplitter",
		cssStateNodes: {
			toggleNode: "riaswToggleSplitterThumb"
		},

		child: null,

		// state: String
		//		the initial and current state of the splitter (and its attached pane)
		//		It has three values: full, collapsed (optional), closed
		///取消 collapsed 状态
		state: "full",

		// _closedSize: String
		//	the css height/width value to apply by default when the attached pane is closed
		_closedSize: "0",

		_loadPersist: function(args){
			this.inherited(arguments);
			var p = this.getPersist("state");
			if(p){
				this.set("state", p);
			}
		},
		_savePersist: function(args){
			this.setPersist({
				state: this.get("state")
			});
			this.inherited(arguments);
		},
		postMixInProperties: function(){
			/// Persist 需要
			if(!this._riaswIdInModule && this.child._riaswIdInModule){
				this._riaswIdInModule = this.child._riaswIdInModule + "_spl";
			}

			this.inherited(arguments);

			this.set("persist", this.persist || this.child.get("persist"));///子类需要
		},
		startup: function(){
			this.inherited(arguments);

			// we have to wait until startup to be sure the child exists in the dom
			// and has non-zero size (if its supposed to be showing)
			var paneNode = this.child.domNode;

			this.domNode.setAttribute("aria-controls", paneNode.id);

			// creation of splitters is an opaque process in BorderContainer,
			// so if we want to get init params, we have to retrieve them from the attached BC child
			// NOTE: for this to work we have to extend the prototype of _WidgetBase (some more)
			rias.forEach(["toggleSplitterState", "toggleSplitterFullSize", "toggleSplitterCollapsedSize"], function(name){
				var pname = name.substring("toggleSplitter".length);
				pname = rias.lowerCaseFirst(pname);
				if(name in this.child){
					this[pname] = this.child[name];
				}
			}, this);
			// Store the current size as the fullSize if none was provided
			// dojo.style always returns a integer (pixel) value for height/width
			// use an arbitrary default if a pane was initialized closed and no fullSize provided
			// If collapsedSize is not specified, collapsed state does not exist.
			this._size0 = {
				t: this.state === "full" ? rias.dom.getStyle(paneNode, (this.horizontal ? "top" : "left")) + "px" : "0px",
				h: this.fullSize || (this.state === "full" ? rias.dom.getStyle(paneNode, (this.horizontal ? "height" : "width")) + "px" : "6em")
			};

			this._openStyleProps = this._getStyleProps(paneNode, "full");

			// update state
			this.set("state", this.state);
			///不建议联动 child.displayState，因为 splitter.size 与 child.size 的含义不同
			//var self = this;
			//this.own(
			//	this.child.watch('displayState', function(name, oldValue, newValue){
			//		self.set("state", this.isHidden() ? "closed" : "full");
			//	})
			//);
			return this;
		},

		_setRegionAttr: function(value){
			this.inherited(arguments);
			rias.dom.addClass(this.domNode, this._baseClass0 + rias.upperCaseFirst(value));
			this._setStateClass();
		},

		_startDrag: function(e){
			if(this.state === "full"){
				this.inherited(arguments);
			}
		},
		_stopDrag: function(e){
			this.inherited(arguments);
			this._openStyleProps = this._getStyleProps(this.child.domNode, "full");
			this.toggleNode.blur();
		},
		_toggle: function(evt){
			var state;
			switch(this.state){
				case "full":
					//state = this.collapsedSize ? "collapsed" : "closed";
					state = "closed";
					break;
				//case "collapsed":
					//state = "closed";
				//	state = "full";
				//	break;
				default:
					state = "full";
			}
			this.set("state", state);
		},

		_onToggleNodeMouseDown: function(evt){
			rias.stopEvent(evt);
			this.toggleNode.focus();
		},
		_onKeyDown: function(evt){
			if(this.state === "full"){
				this.inherited(arguments);
			}
			if(evt.charCode === rias.keys.SPACE || evt.keyCode === rias.keys.ENTER){
				this._toggle(evt);
			}
		},

		_getStyleProps: function(paneNode, state, paneStyle){
			// summary:
			//		Create an object with the style property name: values
			//		that will need to be applied to the child pane render the given state
			if(!paneStyle){
				paneStyle  = rias.dom.getComputedStyle(paneNode);
			}
			var styleProps = {},
				t = this.horizontal ? "top" : "left",
				h = this.horizontal ? "height" : "width";

			styleProps.overflow = (state !== "closed") ? paneStyle.overflow : "hidden";
			styleProps.visibility = (state !== "closed") ? paneStyle.visibility : "hidden";

			// Use the inline width/height style value, in preference to the computedStyle
			// for the open width/height
			styleProps[t] = (state !== "closed") ? paneNode.style[t] || paneStyle[t] : "0px";
			styleProps[h] = (state !== "closed") ? paneNode.style[h] || paneStyle[h] : this._closedSize;

			// We include the padding, border, margin width values for restoring on state full open
			var edgeNames = ["Top", "Right", "Bottom", "Left"];
			rias.forEach(["padding", "margin", "border"], function(pname){
				for(var i = 0; i < edgeNames.length; i++){
					var fullName = pname + edgeNames[i];
					if(pname === "border"){
						fullName += "Width";
					}
					if(undefined !== paneStyle[fullName]){
						styleProps[fullName] = (state !== "closed") ? paneStyle[fullName] : 0;
					}
				}
			});

			return styleProps;
		},
		///不建议联动 child.displayState，因为 splitter.size 与 child.size 的含义不同
		_handleOnChange: function(preState){
			// summary:
			//		Effect the state change with the new value of this.state
			if(this._started){
				var paneNode = this.child.domNode,
					openProps, paneStyle,
					h = this.horizontal ? "height" : "width",
					t = this.horizontal ? "top" : "left";

				if(this.state === "full"){
					// change to full open state
					//if(rias.isFunction(this.child.restore)){
					//	this.child.restore();
					//}else{
					var styleProps = rias.mixin({
						display: "block",
						overflow: "auto",
						visibility: "visible"
					}, this._openStyleProps);
					styleProps[t] = (this._openStyleProps && this._openStyleProps[t]) ? this._openStyleProps[t] : this._size0.t;
					styleProps[h] = (this._openStyleProps && this._openStyleProps[h]) ? this._openStyleProps[h] : this._size0.h;

					rias.dom.setStyle(this.domNode, "cursor", "");
					rias.dom.setStyle(paneNode, styleProps);
					//}
					//}else if(this.state === "collapsed"){
					//paneStyle  = rias.dom.getComputedStyle(paneNode);
					//openProps = this._getStyleProps(paneNode, "full", paneStyle);
					//this._openStyleProps = openProps;

					//	rias.dom.setStyle(this.domNode, "cursor", "auto");
				}else{
					// change to closed state
					//if(rias.isFunction(this.child.hide)){
					//	this.child.hide();
					//}else{
					//if(!this.collapsedSize){
					paneStyle  = rias.dom.getComputedStyle(paneNode);
					openProps = this._getStyleProps(paneNode, "full", paneStyle);
					this._openStyleProps = openProps;
					//}
					var closedProps = this._getStyleProps(paneNode, "closed", paneStyle);
					closedProps.display = "none";

					rias.dom.setStyle(this.domNode, "cursor", "auto");
					rias.dom.setStyle(paneNode, closedProps);
					//}
				}
				this._setStateClass();

				this._containerLayout();
			}
		},

		_setStateClass: function(){
			// summary:
			//		Apply the appropriate classes for the current open state
			this.inherited(arguments);
			var full = this.state === "full",// || this.state === "collapsed",
				hovering = this.get("hovering"),
				focused = this.get("focused");
			rias.dom.toggleClass(this.toggleNode, this._baseClass0 + "ThumbOpen", full);
			rias.dom.toggleClass(this.toggleNode, this._baseClass0 + "ThumbClosed", !full);
			rias.dom.toggleClass(this.toggleNode, this._baseClass0 + "ThumbOpenHover", full && hovering);
			rias.dom.toggleClass(this.toggleNode, this._baseClass0 + "ThumbClosedHover", !full && hovering);
			rias.dom.toggleClass(this.toggleNode, this._baseClass0 + "ThumbOpenFocused", full && focused);
			rias.dom.toggleClass(this.toggleNode, this._baseClass0 + "ThumbClosedFocused", !full && focused);
		},

		_setStateAttr: function(/*String*/ state){
			// summary:
			//		setter for the state property
			this._set("state", state);
		},
		_onStateAttr: function(/*String*/ state, oldState){
			this._handleOnChange(oldState);
			var evtName;
			switch(state){
				case "full":
					this.domNode.setAttribute("aria-expanded", true);
					evtName = "onOpen";
					break;
				case "collapsed":
					this.domNode.setAttribute("aria-expanded", true);
					evtName = "onCollapsed";
					break;
				default:
					this.domNode.setAttribute("aria-expanded", false);
					evtName = "onClosed";
			}
			this.savePersist();
			this[evtName](this.child);
		},

		onOpen: function(pane){ /*Stub*/ },
		onCollapsed: function(pane){ /*Stub*/ },
		onClosed: function(pane){ /*Stub*/ }
	});

	// As BC places no constraints on what kind of widgets can be children
	// we have to extend the base class to ensure the properties we need can be set (both in markup and programatically)
	/*_Widget.extend({
		// toggleSplitterOpen: Boolean
		toggleSplitterState: "full",

		// toggleSplitterClosedThreshold: String
		//		A css size value (e.g. "100px")
		toggleSplitterFullSize: "",

		toggleSplitterCollapsedSize: ""
	});*/

	/*Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};*/

	return Widget;

});
