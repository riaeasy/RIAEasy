//RIAStudio client runtime widget - BorderPanel

define([
	"rias",
	"rias/riasw/layout/_Gutter"
], function(rias, _Gutter) {

	rias.theme.loadRiasCss([
		"layout/Splitter.css"
	]);

	var riasType = "rias.riasw.layout._Splitter";
	var Widget = rias.declare(riasType, [_Gutter], {

		live: true,

		minSize: {
			w: 0,
			h: 0
		},
		maxSize: {
			w: 0,
			h: 0
		},

		baseClass: "riaswSplitter",
		templateString:
			'<div data-dojo-attach-event="onkeydown:_onKeyDown,press:_startDrag,onmouseenter:_onMouse,onmouseleave:_onMouse" tabIndex="0" role="separator">' +
				'<div class="riaswSplitterThumb"></div>' +
			'</div>',

		constructor: function(){
			this._handlers = [];
		},

		postMixInProperties: function(){
			this.inherited(arguments);

			this._factor = /top|left/.test(this.region) ? 1 : -1;
			this._cookieName = this.container.id + "_" + this.region;
		},

		buildRendering: function(){
			this.inherited(arguments);

			if(this.container.persist){
				// restore old size
				var persistSize = rias.cookie(this._cookieName);
				if(persistSize){
					this.child.domNode.style[this.horizontal ? "height" : "width"] = persistSize;
				}
			}
		},

		destroy: function(){
			this._cleanupHandlers();
			this.child = undefined;
			this.container = undefined;
			this.cover = undefined;
			this.fake = undefined;
			this.inherited(arguments);
		},

		/*startup: function(){
			var self = this;
			this.inherited(arguments);
			this.own(rias.after(this.child, "resize", function(){
				if(self.live && self.container){
					//self.setSplitterSize();
				}
			}, true));
		},

		setSplitterSize: function(){
			var childSize = rias.dom.getMarginBox(this.child.domNode)[this.horizontal ? 'h' : 'w'],
				region = this.region,
				splitterAttr = region == "top" || region == "bottom" ? "top" : "left";// style attribute of splitter to adjust
			//this.container._layoutChildren();
			this.domNode.style[splitterAttr] = childSize + "px";
		},*/

		_computeMaxSize: function(){
			var dim = this.horizontal ? 'h' : 'w',
				childSize = rias.dom.getMarginBox(this.child.domNode)[dim],
				center = rias.filter(this.container.getChildren(), function(child){
					return child.region == "center";
				})[0];

			// Can expand until center is crushed.  But always leave room for center's padding + border,
			//  otherwise on the next call domGeometry methods start to lie about size.
			var spaceAvailable = rias.dom.getContentBox(center.domNode)[dim] - 10;
			///maxSize 改为 _splitterMaxSize
			return Math.min(this.child.maxSize[dim] ? this.child.maxSize[dim] : Infinity, childSize + spaceAvailable);
		},

		_startDrag: function(e){
			if(this.child && rias.isFunction(this.child.isCollapsed) && this.child.isCollapsed()){
				return;
			}
			if(!this.cover){
				this.cover = rias.dom.place("<div class=" + this.baseClass + "Cover></div>", this.child.domNode, "after");
			}
			rias.dom.addClass(this.cover, this.baseClass + "CoverActive");

			// Safeguard in case the stop event was missed.  Shouldn't be necessary if we always get the mouse up.
			if(this.fake){
				rias.dom.destroy(this.fake);
			}
			if(!(this._resize = this.live)){ //TODO: disable live for IE6?
				// create fake splitter to display at old position while we drag
				(this.fake = this.domNode.cloneNode(true)).removeAttribute("id");
				rias.dom.addClass(this.domNode, this.baseClass + "Shadow");
				rias.dom.place(this.fake, this.domNode, "after");
			}
			rias.dom.addClass(this.domNode, this.baseClass + "Active " + this.baseClass + (this.horizontal ? "H" : "V") + "Active");
			if(this.fake){
				rias.dom.removeClass(this.fake, this.baseClass + "Hover " + this.baseClass + (this.horizontal ? "H" : "V") + "Hover");
			}

			//Performance: load data info local vars for onmousevent function closure
			var factor = this._factor,
				isHorizontal = this.horizontal,
				axis = isHorizontal ? "pageY" : "pageX",
				pageStart = e[axis],
				splitterStyle = this.domNode.style,
				dim = isHorizontal ? 'h' : 'w',
				childCS = rias.dom.getComputedStyle(this.child.domNode),
				childStart = rias.dom.getMarginBox(this.child.domNode, childCS)[dim],
				max = this._computeMaxSize(),
				/// minSize 改为 _splitterMinSize
				min = Math.max(this.child.minSize[dim], rias.dom.getPadBorderExtents(this.child.domNode, childCS)[dim] + 10),
				region = this.region,
				splitterAttr = region == "top" || region == "bottom" ? "top" : "left", // style attribute of splitter to adjust
				splitterStart = parseInt(splitterStyle[splitterAttr], 10),
				resize = this._resize,
				layoutFunc = rias.hitch(this.container, "_layoutChildren", this.child.id),
				de = this.ownerDocument;

			this._handlers = this._handlers.concat([
				rias.on(de, rias.touch.move, this._drag = function(e, forceResize){
					var delta = e[axis] - pageStart,
						childSize = factor * delta + childStart,
						boundChildSize = Math.max(Math.min(childSize, max), min);

					if(resize || forceResize){
						layoutFunc(boundChildSize);
					}
					// TODO: setting style directly (usually) sets content box size, need to set margin box size
					splitterStyle[splitterAttr] = delta + splitterStart + factor * (boundChildSize - childSize) + "px";
				}),
				rias.on(de, "dragstart", function(e){
					e.stopPropagation();
					e.preventDefault();
				}),
				rias.on(this.ownerDocumentBody, "selectstart", function(e){
					e.stopPropagation();
					e.preventDefault();
				}),
				rias.on(de, rias.touch.release, rias.hitch(this, "_stopDrag"))
			]);
			e.stopPropagation();
			e.preventDefault();
		},

		_onMouse: function(e){
			// summary:
			//		Handler for onmouseenter / onmouseleave events
			if(this.child && rias.isFunction(this.child.isCollapsed) && this.child.isCollapsed()){
				return;
			}
			var o = (e.type == "mouseover" || e.type == "mouseenter");
			rias.dom.toggleClass(this.domNode, this.baseClass + "Hover", o);
			rias.dom.toggleClass(this.domNode, this.baseClass + (this.horizontal ? "H" : "V") + "Hover", o);
		},

		_stopDrag: function(e){
			try{
				if(this.cover){
					rias.dom.removeClass(this.cover, this.baseClass + "CoverActive");
				}
				if(this.fake){
					rias.dom.destroy(this.fake);
				}
				rias.dom.removeClass(this.domNode, this.baseClass + "Active " + this.baseClass + (this.horizontal ? "H" : "V") + "Active " + this.baseClass + "Shadow");
				if(this._drag){
					this._drag(e); //TODO: redundant with onmousemove?
					this._drag(e, true);
				}
			}finally{
				this._cleanupHandlers();
				delete this._drag;
			}

			if(this.container.persist && this._cookieName){
				rias.cookie(this._cookieName, this.child.domNode.style[this.horizontal ? "height" : "width"], {expires: 365});
			}
		},

		_cleanupHandlers: function(){
			var h;
			while(h = this._handlers.pop()){
				h.remove();
			}
		},

		_onKeyDown: function(/*Event*/ e){
			// should we apply typematic to this?
			this._resize = true;
			var horizontal = this.horizontal;
			var tick = 1;
			switch(e.keyCode){
				case horizontal ? rias.keys.UP_ARROW : rias.keys.LEFT_ARROW:
					tick *= -1;
//				break;
				case horizontal ? rias.keys.DOWN_ARROW : rias.keys.RIGHT_ARROW:
					break;
				default:
//				this.inherited(arguments);
					return;
			}
			var childSize = rias.dom.getMarginSize(this.child.domNode)[ horizontal ? 'h' : 'w' ] + this._factor * tick;
			this.container._layoutChildren(this.child.id, Math.max(Math.min(childSize, this._computeMaxSize()), this.child.minSize[horizontal ? 'h' : 'w']));
			e.stopPropagation();
			e.preventDefault();
		}

	});

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