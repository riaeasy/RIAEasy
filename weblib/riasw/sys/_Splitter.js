//RIAStudio client runtime widget - _Splitter

define([
	"riasw/riaswBase",
	"riasw/sys/_Gutter",
	"riasw/sys/_CssStateMixin"
], function(rias, _Gutter, _CssStateMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/sys/Splitter.css"
	//]);

	var riaswType = "riasw.sys._Splitter";
	var Widget = rias.declare(riaswType, [_Gutter, _CssStateMixin], {

		templateString:
			'<div data-dojo-attach-event="onkeydown:_onKeyDown,press:_startDrag" role="separator">' +
				'<div class="riaswSplitterThumb"></div>' +
			'</div>',
		baseClass: "riaswSplitter",

		//child: null,

		live: true,

		parentMinSize: {
			w: 0,
			h: 0
		},
		parentMaxSize: {
			w: 0,
			h: 0
		},

		constructor: function(){
			this._handlers = [];
		},
		postMixInProperties: function(){
			this.inherited(arguments);

			if(!this.parentMinSize){
				this.parentMinSize = {
					w: 0,
					h: 0
				};
			}else{
				if(!(this.parentMinSize.w >= 0)){
					this.parentMinSize.w = 0;
				}
				if(!(this.parentMinSize.h >= 0)){
					this.parentMinSize.h = 0;
				}
			}
			if(!this.parentMaxSize){
				this.parentMaxSize = {
					w: 0,
					h: 0
				};
			}else{
				if(!(this.parentMaxSize.w >= 0)){
					this.parentMaxSize.w = 0;
				}
				if(!(this.parentMaxSize.h >= 0)){
					this.parentMaxSize.h = 0;
				}
			}
		},
		buildRendering: function(){
			this.inherited(arguments);

			var self = this;
			this._zIndexHandle = this.child.watch('zIndex', function(name, oldValue, newValue){
				self.set("zIndex", newValue);
			});
		},
		_onDestroy: function(){
			if(this._zIndexHandle){
				this._zIndexHandle.remove();
				this._zIndexHandle = undefined;
			}
			this._cleanupHandlers();
			this.child = undefined;
			this.cover = undefined;
			this.fake = undefined;
			this.inherited(arguments);
		},

		_setRegionAttr: function(value){
			this.inherited(arguments);
			this._factor = /top|left/.test(value) ? 1 : -1;
		},

		_computeMaxSize: function(){
			var dim = this.horizontal ? 'h' : 'w',
				childSize = rias.dom.getMarginBox(this.child.domNode)[dim],
				center = rias.filter(this._getContainerRiasw().getChildren(), function(child){
					return child.region === "center";
				})[0];

			// Can expand until center is crushed.  But always leave room for center's padding + border,
			//  otherwise on the next call domGeometry methods start to lie about size.
			var spaceAvailable = rias.dom.getContentBox(center.domNode)[dim] - 10;///用 getContentBox 更好些
			return Math.min(this.parentMaxSize[dim] ? this.parentMaxSize[dim] : Infinity, childSize + spaceAvailable);
		},

		_startDrag: function(e){
			if(this.child && rias.isFunction(this.child.isShowNormal) && !this.child.isShowNormal()){
				return;
			}
			var self = this,
				child = this.child;
			if(!this.cover){
				this.cover = rias.dom.place("<div class=" + this._baseClass0 + "Cover></div>", child.domNode, "after");
			}
			rias.dom.addClass(this.cover, this._baseClass0 + "CoverActive");

			// Safeguard in case the stop event was missed.  Shouldn't be necessary if we always get the mouse up.
			if(this.fake){
				rias.dom.destroy(this.fake);
			}
			if(!(this._live = this.live)){ //TODO: disable live for IE6?
				// create fake splitter to display at old position while we drag
				(this.fake = this.domNode.cloneNode(true)).removeAttribute("id");
				rias.dom.addClass(this.domNode, this._baseClass0 + "Shadow");
				rias.dom.place(this.fake, this.domNode, "after");
			}
			rias.dom.addClass(this.domNode, this._baseClass0 + "Active " + this._baseClass0 + (this.horizontal ? "H" : "V") + "Active");
			if(this.fake){
				rias.dom.removeClass(this.fake, this._baseClass0 + "Hover " + this._baseClass0 + (this.horizontal ? "H" : "V") + "Hover");
			}

			//Performance: load data info local vars for onmousevent function closure
			var isHorizontal = this.horizontal,
				axis = isHorizontal ? "pageY" : "pageX",
				pageStart = e[axis],
				dim = isHorizontal ? 'h' : 'w',
				childCS = rias.dom.getComputedStyle(child.domNode),
				childStart = rias.dom.getMarginBox(child.domNode, childCS)[dim],
				max = this._computeMaxSize(),
				min = Math.max(this.parentMinSize[dim], rias.dom.getPadBorderExtents(child.domNode, childCS)[dim] + 10),
				splitterAttr = this.region === "top" || this.region === "bottom" ? "top" : "left", // style attribute of splitter to adjust
				splitterStart = parseInt(this.domNode.style[splitterAttr], 10);

			///需要支持 非 _PanelBase ，故保留 percent
			var percent = child.domNode.style[isHorizontal ? "height" : "width"];
			percent = (percent.indexOf("%") >= 0 ? 1 : 0);
			this._handlers = this._handlers.concat([
				rias.on(this.ownerDocument, rias.touch.move, this._drag = function(e, forceResize){
					var delta = e[axis] - pageStart,
						childSize = self._factor * delta + childStart,
						boundChildSize = Math.max(Math.min(childSize, max), min);

					if(self._live || forceResize){
						self._getContainerRiasw()._layoutChildren(child.id, boundChildSize);
						if(percent){
							percent = rias.dom.getStyle(child.domNode, isHorizontal ? "height" : "width", child.domNode.style)
								/ rias.dom.getContentBox(child.getParentNode())[isHorizontal ? "h" : "w"];
							percent = +rias.toFixed(percent * 100, 2);
							child.domNode.style[isHorizontal ? "height" : "width"] = percent + "%";
						}
						if(child._style0){
							child._style0[isHorizontal ? "height" : "width"] = child.domNode.style[isHorizontal ? "height" : "width"];
						}
					}else{
						// TODO: setting style directly (usually) sets content box size, need to set margin box size
						self.domNode.style[splitterAttr] = delta + splitterStart + self._factor * (boundChildSize - childSize) + "px";
					}
					//console.debug(child.id + " - " + child.domNode.style[this.horizontal ? "height" : "width"]);
				}),
				rias.on(this.ownerDocument, "dragstart", function(e){
					e.stopPropagation();
					e.preventDefault();
				}),
				rias.on(this.ownerDocumentBody, "selectstart", function(e){
					e.stopPropagation();
					e.preventDefault();
				}),
				rias.on(this.ownerDocument, rias.touch.release, rias.hitch(this, "_stopDrag"))
			]);
			e.stopPropagation();
			e.preventDefault();
		},

		_stopDrag: function(e){
			try{
				if(this.cover){
					rias.dom.removeClass(this.cover, this._baseClass0 + "CoverActive");
				}
				if(this.fake){
					rias.dom.destroy(this.fake);
				}
				rias.dom.removeClass(this.domNode, this._baseClass0 + "Active " + this._baseClass0 + (this.horizontal ? "H" : "V") + "Active " + this._baseClass0 + "Shadow");
				if(this._drag){
					this._drag(e); //TODO: redundant with onmousemove?
					this._drag(e, true);
				}
			}finally{
				this._cleanupHandlers();
				delete this._drag;
			}
		},

		_cleanupHandlers: function(){
			var h;
			while((h = this._handlers.pop())){
				h.remove();
			}
		},

		_onKeyDown: function(/*Event*/ e){
			// should we apply typematic to this?
			this._live = true;
			var child = this.child,
				isHorizontal = this.horizontal,
				dim = isHorizontal ? 'h' : 'w',
				tick = e.shiftKey ? 10 : 1;
			switch(e.keyCode){
				case isHorizontal ? rias.keys.UP_ARROW : rias.keys.LEFT_ARROW:
					tick *= -1;
//				break;/// 继续
				case isHorizontal ? rias.keys.DOWN_ARROW : rias.keys.RIGHT_ARROW:
					break;
				default:
//				this.inherited(arguments);
					return;
			}

			var percent = child.domNode.style[isHorizontal ? "height" : "width"];
			percent = (percent.indexOf("%") >= 0 ? 1 : 0);
			var childSize = rias.dom.getMarginBox(child.domNode)[dim] + this._factor * tick;
			childSize = Math.max(
				Math.min(childSize, this._computeMaxSize()),
				Math.max(this.parentMinSize[dim], rias.dom.getPadBorderExtents(child.domNode)[dim] + 10)
			);
			this._getContainerRiasw()._layoutChildren(child.id, childSize);
			if(percent){
				percent = rias.dom.toPixelValue(child.domNode, child.domNode.style[isHorizontal ? "height" : "width"])
					/ rias.dom.getContentBox(child.getParentNode())[isHorizontal ? "h" : "w"];
				percent = +rias.toFixed(percent * 100, 2);
				child.domNode.style[isHorizontal ? "height" : "width"] = percent + "%";
			}
			if(child._style0){
				child._style0[isHorizontal ? "height" : "width"] = child.domNode.style[isHorizontal ? "height" : "width"];
			}

			e.stopPropagation();
			e.preventDefault();
		}

	});

	/*Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};*/

	return Widget;

});