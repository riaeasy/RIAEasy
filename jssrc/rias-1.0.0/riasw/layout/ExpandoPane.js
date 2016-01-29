//RIAStudio client runtime widget - ExpandoPane

define([
	"rias",
	"rias/riasw/layout/Panel"
], function(rias, Panel) {

	rias.theme.loadCss([
		"layout/ExpandoPane.css"
	]);

	var riasType = "rias.riasw.layout.ExpandoPane";
	var Widget = rias.declare(riasType, [Panel],{
		//maxHeight: "",
		//maxWidth: "",
		//splitter: false,
		title: "",
		_setTitleAttr: {
			node: "titleNode",
			type: "innerHTML"
		}, // override default where title becomes a hover tooltip

		templateString:
			'<div class="riaswExpandoPane">'+
				'<div data-dojo-attach-point="focusNode" class="riaswExpandoTitle">'+
					'<div class="riaswExpandoIcon" data-dojo-attach-point="iconNode" data-dojo-attach-event="ondijitclick:toggle">'+
						'<span class="a11yNode">X</span>'+
					'</div>'+
					'<span class="riaswExpandoTitleNode" data-dojo-attach-point="titleNode">${title}</span>'+
				'</div>'+
				'<div class="riaswExpandoWrapper" data-dojo-attach-point="cwrapper" data-dojo-attach-event="ondblclick:_trap">'+
					'<div class="riaswLayoutContent" data-dojo-attach-point="containerNode"></div>'+
				'</div>'+
			'</div>',

		// easeOut: String|Function
		//		easing function used to hide pane
		easeOut: "dojo._DefaultEasing", // FIXME: This won't work with globalless AMD

		// easeIn: String|Function
		//		easing function use to show pane
		easeIn: "dojo._DefaultEasing", // FIXME: This won't work with globalless AMD

		// duration: Integer
		//		duration to run show/hide animations
		duration: rias.defaultDuration,

		// startExpanded: Boolean
		//		Does this widget start in an open (true) or closed (false) state
		startExpanded: true,

		// previewOpacity: Float
		//		A value from 0 .. 1 indicating the opacity to use on the container
		//		when only showing a preview
		previewOpacity: 0.75,

		// previewOnDblClick: Boolean
		//		If true, will override the default behavior of a double-click calling a full toggle.
		//		If false, a double-click will cause the preview to popup
		previewOnDblClick: false,

		// tabIndex: String
		//		Order fields are traversed when user hits the tab key
		tabIndex: "0",
		_setTabIndexAttr: "iconNode",

		baseClass: "riaswExpandoPane",

		postCreate: function(){
			this.inherited(arguments);
			this._animConnects = [];

			this._isHorizontal = true;

			if(rias.isString(this.easeOut)){
				this.easeOut = rias.getObject(this.easeOut);
			}
			if(rias.isString(this.easeIn)){
				this.easeIn = rias.getObject(this.easeIn);
			}

			var thisClass = "", rtl = !this.isLeftToRight();
			if(this.region){
				switch(this.region){
					case "trailing" :
					case "right" :
						thisClass = rtl ? "Left" : "Right";
						this._needsPosition = "left";
						break;
					case "leading" :
					case "left" :
						thisClass = rtl ? "Right" : "Left";
						break;
					case "top" :
						thisClass = "Top";
						break;
					case "bottom" :
						this._needsPosition = "top";
						thisClass = "Bottom";
						break;
				}
				rias.dom.addClass(this.domNode, "riaswExpando" + thisClass);
				rias.dom.addClass(this.iconNode, "riaswExpandoIcon" + thisClass);
				this._isHorizontal = /top|bottom/.test(this.region);
			}
			rias.dom.setStyle(this.domNode, {
				//overflow: "hidden",
				padding:0
			});

			this.connect(this.domNode, "ondblclick", this.previewOnDblClick ? "preview" : "toggle");

			this.iconNode.setAttribute("aria-controls", this.id);

			if(this.previewOnDblClick){
				this.connect(this.getParent(), "_layoutChildren", rias.hitch(this, function(){
					this._isonlypreview = false;
				}));
			}

		},

		_startupSizes: function(){

			this._container = this.getParent();
			this._closedSize = this._titleHeight = rias.dom.getMarginBox(this.focusNode).h;

			if(this.splitter){
				// find our splitter and tie into it's drag logic
				var myid = this.id;
				rias.forEach(rias.registry.toArray(), function(w){
					if(w && w.child && w.child.id == myid){
						this.connect(w,"_stopDrag","_afterResize");
					}
				}, this);
			}

			this._currentSize = rias.dom.getContentBox(this.domNode);	// TODO: can compute this from passed in value to resize(), see _LayoutWidget for example
			this._showSize = this._currentSize[(this._isHorizontal ? "h" : "w")];
			this._setupAnims();

			if(this.startExpanded){
				this._showing = true;
			}else{
				this._showing = false;
				this._hideWrapper();
				this._hideAnim.gotoPercent(99,true);
			}

			this.domNode.setAttribute("aria-expanded", this._showing);
			this._hasSizes = true;
		},

		_afterResize: function(e){
			var tmp = this._currentSize;						// the old size
			this._currentSize = rias.dom.getMarginBox(this.domNode);	// the new size
			var n = this._currentSize[(this._isHorizontal ? "h" : "w")];
			if(n > this._titleHeight){
				if(!this._showing){
					this._showing = !this._showing;
					this._showEnd();
				}
				this._showSize = n;
				this._setupAnims();
			}else{
				this._showSize = tmp[(this._isHorizontal ? "h" : "w")];
				this._showing = false;
				this._hideWrapper();
				this._hideAnim.gotoPercent(89,true);
			}

		},

		_setupAnims: function(){
			// summary:
			//		Create the show and hide animations
			rias.forEach(this._animConnects, rias.connect.disconnect);

			var _common = {
					node:this.domNode,
					duration:this.duration
				},
				isHorizontal = this._isHorizontal,
				showProps = {},
				showSize = this._showSize,
				hideSize = this._closedSize,
				hideProps = {},
				dimension = isHorizontal ? "height" : "width",
				also = this._needsPosition
				;

			showProps[dimension] = {
				end: showSize
			};
			hideProps[dimension] = {
				end: hideSize
			};

			if(also){
				showProps[also] = {
					end: function(n){
						var c = parseInt(n.style[also], 10);
						return c - showSize + hideSize;
					}
				};
				hideProps[also] = {
					end: function(n){
						var c = parseInt(n.style[also], 10);
						return c + showSize - hideSize;
					}
				}
			}

			this._showAnim = rias.fx.animateProperty(rias.mixin(_common,{
				easing:this.easeIn,
				properties: showProps
			}));
			this._hideAnim = rias.fx.animateProperty(rias.mixin(_common,{
				easing:this.easeOut,
				properties: hideProps
			}));

			this._animConnects = [
				rias.connect.connect(this._showAnim, "onEnd", this, "_showEnd"),
				rias.connect.connect(this._hideAnim, "onEnd", this, "_hideEnd")
			];
		},

		preview: function(){
			// summary:
			//		Expand this pane in preview mode (does not affect surrounding layout)

			if(!this._showing){
				this._isonlypreview = !this._isonlypreview;
			}
			this.toggle();
		},

		toggle: function(){
			// summary:
			//		Toggle this pane's visibility
			if(this._showing){
				this._hideWrapper();
				this._showAnim && this._showAnim.stop();
				this._hideAnim.play();
			}else{
				this._hideAnim && this._hideAnim.stop();
				this._showAnim.play();
			}
			this._showing = !this._showing;
			this.domNode.setAttribute("aria-expanded", this._showing);
		},

		_hideWrapper: function(){
			// summary:
			//		Set the Expando state to "closed"
			rias.dom.addClass(this.domNode, "riaswExpandoClosed");

			rias.dom.setStyle(this.cwrapper,{
				visibility: "hidden",
				//overflow: "hidden",
				opacity: "0"
			});
		},

		_showEnd: function(){
			// summary:
			//		Common animation onEnd code - "unclose"
			rias.dom.setStyle(this.cwrapper, {
				opacity: 0,
				visibility:"visible"
			});
			rias.fx.anim(this.cwrapper, {
				opacity: this._isonlypreview ? this.previewOpacity : 1
			}, 227);
			rias.dom.removeClass(this.domNode, "riaswExpandoClosed");
			if(!this._isonlypreview){
				setTimeout(rias.hitch(this._container, "layout"), 15);
			}else{
				this._previewShowing = true;
				this.resize();
			}
		},

		_hideEnd: function(){
			// summary:
			//		Callback for the hide animation - "close"

			// every time we hide, reset the "only preview" state
			if(!this._isonlypreview){
				setTimeout(rias.hitch(this._container, "layout"), 25);
			}else{
				this._previewShowing = false;
			}
			this._isonlypreview = false;

		},

		resize: function(/*Object?*/newSize){
			// summary:
			//		we aren't a layout widget, but need to act like one.
			// newSize: Object
			//		The size object to resize to

			if(!this._hasSizes){ this._startupSizes(newSize); }
			this._closedSize = this._titleHeight = rias.dom.getMarginBox(this.focusNode).h;

			// compute size of container (ie, size left over after title bar)
			var currentSize = rias.dom.getMarginBox(this.domNode);
			this._contentBox = {
				w: newSize && "w" in newSize ? newSize.w : currentSize.w,
				h: (newSize && "h" in newSize ? newSize.h : currentSize.h) - this._titleHeight
			};
			rias.dom.setStyle(this.containerNode, "height", this._contentBox.h + "px");

			if(newSize){
				rias.dom.setMarginBox(this.domNode, newSize);
			}

			this.defer(this._layoutChildren);
			this._setupAnims();
		},

		_trap: function(/*Event*/ e){
			// summary:
			//		Trap stray events
			rias.event.stopEvent(e);
		}
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswExpandoPaneIcon",
		iconClass16: "riaswExpandoPaneIcon16",
		defaultParams: {
			//content: "<span></span>",
			parseOnLoad: true,
			//doLayout: "auto",
			duration: 420,
			startExpanded: true
		},
		initialSize: {},
		//allowedChild: "",
		"property": {
			"href": {
				"datatype": "string",
				"format": "url",
				"title": "URL"
			},
			"extractContent": {
				"datatype": "boolean",
				"title": "Extract Content"
			},
			"parseOnLoad": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Parse On Load"
			},
			"preventCache": {
				"datatype": "boolean",
				"title": "Prevent Cache"
			},
			"preload": {
				"datatype": "boolean",
				"title": "Preload"
			},
			"refreshOnShow": {
				"datatype": "boolean",
				"title": "Refresh On Show"
			},
			"doLayout": {
				"datatype": "string",
				"defaultValue": "auto",
				"hidden": true
			},
			"maxHeight": {
				"datatype": "string",
				"title": "Maximum Height"
			},
			"maxWidth": {
				"datatype": "string",
				"title": "Maximum Width"
			},
			"splitter": {
				"datatype": "string",
				"title": "Render Styles"
			},
			"duration": {
				"datatype": "number",
				"description": "duration to run show/hide animations",
				"defaultValue": "420",
				"hidden": false
			},
			"startExpanded": {
				"datatype": "boolean",
				"description": "Does this widget start in an open (true) or closed (false) state",
				"defaultValue": true,
				"hidden": false
			},
			"isContainer": {
				"datatype": "boolean",
				"description": "Just a flag indicating that this widget will call resize() on\nits children.   _LayoutWidget based widgets check for\n\n\t\tif(!this.getParent || !this.getParent()){\n\nand if getParent() returns false because !parent.isContainer,\nthen they resize themselves on initialization.",
				"defaultValue": true,
				"hidden": true
			}
		}
	};

	return Widget;
});