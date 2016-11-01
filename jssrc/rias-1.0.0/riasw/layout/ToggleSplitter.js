define([
	"rias",
	"dijit/_WidgetBase",
	"rias/riasw/layout/_Splitter"
], function(rias, _WidgetBase, _Splitter) {

	//rias.theme.loadThemeCss([
	//	"riasw/layout/ToggleSplitter.css"
	//]);

	var riaswType = "rias.riasw.layout.ToggleSplitter";

	var Widget = rias.declare(riaswType, _Splitter, {
		// summary:
		//		A draggable and clickable spacer between two items in a `dijit.layout.BorderContainer`.
		// description:
		//		This is instantiated by `dijit.layout.BorderContainer`. Users should not
		//		create it directly.
		// tags:
		//		private

		// container: [const] dijit/layout/BorderContainer
		//		Pointer to the parent BorderContainer
		container: null,

		// child: [const] dijit/layout/_LayoutWidget
		//		Pointer to the pane associated with this splitter
		child: null,

		// region: [const] String
		//		Region of pane associated with this splitter.
		//		"top", "bottom", "left", "right".
		region: null,

		// state: String
		//		the initial and current state of the splitter (and its attached pane)
		//		It has three values: full, collapsed (optional), closed
		state: "full",

		// _closedSize: String
		//	the css height/width value to apply by default when the attached pane is closed
		_closedSize: "0",

		baseClass: "riaswToggleSplitter",

		templateString:
			'<div data-dojo-attach-event="onkeypress:_onKeyPress,onmousedown:_startDrag,onmouseenter:_onMouse,onmouseleave:_onMouse">' +
				'<div role="separator" data-dojo-attach-point="toggleNode" class="riaswToggleSplitterThumb" ' +
					'data-dojo-attach-event="onmousedown:_onToggleNodeMouseDown, onclick:_toggle, onmouseenter:_onToggleNodeMouseMove, onmouseleave:_onToggleNodeMouseMove, onfocus:_onToggleNodeMouseMove, onblur:_onToggleNodeMouseMove">' +
				'<span data-dojo-attach-point="a11yText" class="riaswToggleSplitterA11y"></span></div>' +
			'</div>',

		postCreate: function(){
			this.inherited(arguments);

			// add a region css hook so that it can figure out the region correctly
			var region = this.region;
			rias.dom.addClass(this.domNode, this._baseClass0 + rias.upperCaseFirst(region));
		},

		destroy: function(){
			this.inherited(arguments);
		},

		startup: function(){
			this.inherited(arguments);

			// we have to wait until startup to be sure the child exists in the dom
			// and has non-zero size (if its supposed to be showing)
			var paneNode = this.child.domNode,
				intPaneSize = rias.dom.getStyle(paneNode, (this.horizontal ? "height" : "width"));

			this.domNode.setAttribute("aria-controls", paneNode.id);

			// creation of splitters is an opaque process in BorderContainer,
			// so if we want to get init params, we have to retrieve them from the attached BC child
			// NOTE: for this to work we have to extend the prototype of dijit._Widget (some more)
			rias.forEach(["toggleSplitterState", "toggleSplitterFullSize", "toggleSplitterCollapsedSize"], function(name){
				var pname = name.substring("toggleSplitter".length);
				pname = rias.lowerCaseFirst(pname);
				if(name in this.child){
					this[pname] = this.child[name];
				}
			}, this);

			if(!this.fullSize){
				// Store the current size as the fullSize if none was provided
				// dojo.style always returns a integer (pixel) value for height/width
				// use an arbitrary default if a pane was initialized closed and no fullSize provided
				// If collapsedSize is not specified, collapsed state does not exist.
				this.fullSize = this.state === "full" ? intPaneSize + "px" : "75px";
			}

			this._openStyleProps = this._getStyleProps(paneNode, "full");

			// update state
			this._started = true;
			this.set("state", this.state);

			return this;
		},

		_onKeyPress: function(evt){
			if(this.state === "full"){
				this.inherited(arguments);
			}
			if(evt.charCode === rias.keys.SPACE || evt.keyCode === rias.keys.ENTER){
				this._toggle(evt);
			}
		},

		_onToggleNodeMouseDown: function(evt){
			rias.event.stopEvent(evt);
			this.toggleNode.focus();
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
				case "collapsed":
					//state = "closed";
					state = "full";
					break;
				default:
					state = "full";
			}
			this.set("state", state);
		},

		_onToggleNodeMouseMove: function(evt){
			var on = this.state === "full",// || this.state === "collapsed",
				leave = evt.type === "mouseout" || evt.type === "blur";

			rias.dom.toggleClass(this.toggleNode, this._baseClass0 + "ThumbOpen", leave && on);
			rias.dom.toggleClass(this.toggleNode, this._baseClass0 + "ThumbOpenHover", !leave && on);
			rias.dom.toggleClass(this.toggleNode, this._baseClass0 + "ThumbClosed", leave && !on);
			rias.dom.toggleClass(this.toggleNode, this._baseClass0 + "ThumbClosedHover", !leave && !on);
		},

		_handleOnChange: function(preState){
			// summary:
			//		Effect the state change with the new value of this.state
			var paneNode = this.child.domNode,
				openProps, paneStyle,
				dim = this.horizontal ? "height" : "width";

			if(this.state === "full"){
				// change to full open state
				var styleProps = rias.mixin({
					display: "block",
					overflow: "auto",
					visibility: "visible"
				}, this._openStyleProps);
				styleProps[dim] = (this._openStyleProps && this._openStyleProps[dim]) ? this._openStyleProps[dim] : this.fullSize;

				rias.dom.setStyle(this.domNode, "cursor", "");
				rias.dom.setStyle(paneNode, styleProps);
			}else if(this.state === "collapsed"){
				//paneStyle  = rias.dom.getComputedStyle(paneNode);
				//openProps = this._getStyleProps(paneNode, "full", paneStyle);
				//this._openStyleProps = openProps;

				rias.dom.setStyle(this.domNode, "cursor", "auto");
				//rias.dom.setStyle(paneNode, dim, this.collapsedSize);
			}else{
				// change to closed state
				//if(!this.collapsedSize){
					paneStyle  = rias.dom.getComputedStyle(paneNode);
					openProps = this._getStyleProps(paneNode, "full", paneStyle);
					this._openStyleProps = openProps;
				//}
				var closedProps = this._getStyleProps(paneNode, "closed", paneStyle);
				closedProps.display = "none";

				rias.dom.setStyle(this.domNode, "cursor", "auto");
				rias.dom.setStyle(paneNode, closedProps);
			}
			this._setStateClass();
			if(this.container._started){
				//this.container._layoutChildren(this.region);
				this.container.layout();
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
				dim = this.horizontal ? "height" : "width";

			styleProps.overflow = (state !== "closed") ? paneStyle.overflow : "hidden";
			styleProps.visibility = (state !== "closed") ? paneStyle.visibility : "hidden";

			// Use the inline width/height style value, in preference to the computedStyle
			// for the open width/height
			styleProps[dim] = (state !== "closed") ? paneNode.style[dim] || paneStyle[dim] : this._closedSize;

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

		_setStateClass: function(){
			// summary:
			//		Apply the appropriate classes for the current open state
			var arrow = "&#9652",
				region = this.region.toLowerCase(),
				on = this.state === "full",// || this.state === "collapsed",
				focused = this.get("focused");

			rias.dom.toggleClass(this.toggleNode, this._baseClass0 + "ThumbOpen", on && !focused);
			rias.dom.toggleClass(this.toggleNode, this._baseClass0 + "ThumbClosed", !on && !focused);
			rias.dom.toggleClass(this.toggleNode, this._baseClass0 + "ThumbOpenHover", on && focused);
			rias.dom.toggleClass(this.toggleNode, this._baseClass0 + "ThumbClosedHover", !on && focused);

			// For a11y
			if(region === "top" && on || region === "bottom" && !on){
				arrow = "&#9650";
			}else if(region === "top" && !on || region === "bottom" && on){
				arrow = "&#9660";
			}else if(region === "right" && on || region === "left" && !on){
				arrow = "&#9654";
			}else if(region === "right" && !on || region === "left" && on){
				arrow = "&#9664";
			}

			this.a11yText.innerHTML = arrow;
		},

		_setStateAttr: function(/*String*/ state){
			// summary:
			//		setter for the state property
			if(!this._started) {
				return;
			}
			var preState = this.state;
			this.state = state;

			this._handleOnChange(preState);
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
			this[evtName](this.child);
		},

		onOpen: function(pane){ /*Stub*/ },
		onCollapsed: function(pane){ /*Stub*/ },
		onClosed: function(pane){ /*Stub*/ }
	});

	// As BC places no constraints on what kind of widgets can be children
	// we have to extend the base class to ensure the properties we need can be set (both in markup and programatically)
	/*_WidgetBase.extend({
		// toggleSplitterOpen: Boolean
		toggleSplitterState: "full",

		// toggleSplitterClosedThreshold: String
		//		A css size value (e.g. "100px")
		toggleSplitterFullSize: "",

		toggleSplitterCollapsedSize: ""
	});*/

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswSplitterIcon",
		iconClass16: "riaswSplitterIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
