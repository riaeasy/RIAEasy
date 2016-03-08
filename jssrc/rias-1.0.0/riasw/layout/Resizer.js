define([
	"rias",
	"dijit/_Widget"
], function(rias, _Widget){

	///TODO:zensst.改为左右下角（或者四角）都可以拉动。
	rias.theme.loadRiasCss([
		"layout/Resizer.css"
	]);

	var _ResizerHelper = rias.declare("rias.riasw.layout._ResizerHelper", _Widget, {
		show: function(){
			rias.dom.visible(this.domNode, true);
		},
		hide: function(){
			rias.dom.visible(this.domNode, false);
		},
		resize: function(/* Object */dim){
			if(dim){
				rias.dom.setMarginBox(this.domNode, dim);
			}
		}
	});

	var riasType = "rias.riasw.layout.Resizer";
	var Widget = rias.declare(riasType, [_Widget], {

		isBoxResizer: false,
		resizeBorderWidth: 8,

		// targetId: String
		//		id of the Widget OR DomNode that I will size
		targetId: "",
		targetWidget: null,

		disabled: false,
		resizeX: true,
		resizeY: true,
		_resizeTop: false,
		_resizeBottom: false,
		_resizeLeft: false,
		_resizeRight: false,
		activeResize: false,
		activeResizeClass: "riaswResizerClone",
		intermediateChanges: false,

		// animateSizing: Boolean
		//		only applicable if activeResize = false. onMouseup, animate the node to the
		//		new size
		animateSizing: true,
		animateMethod: "chain",
		animateDuration: rias.defaultDuration,

		minSize: {
			w: 36,
			h: 36
		},
		maxSize: {
			w: 0,
			h: 0
		},

		// fixedAspect: Boolean
		//		Toggle to enable this widget to maintain the aspect
		//		ratio of the attached node.
		fixedAspect: false,

		startTopic: "/dojo/resize/start",
		endTopic:"/dojo/resize/stop",

		//templateString: '<span data-dojo-attach-point="resizeHandle" class="riaswResizer"></span>',

		buildRendering: function(){
			if(!this.targetWidget){
				this.targetWidget = this.targetId ? rias.registry.byId(this.targetId) : undefined;
			}
			this.targetDomNode = this.targetWidget ? this.targetWidget.domNode : this.targetId ? rias.dom.byId(this.targetId) : undefined;

			this.domNode = this.resizeHandle = rias.dom.create("span");
			rias.dom.addClass(this.resizeHandle, "riaswResizer");
			if(this.targetDomNode){
				this.targetDomNode.appendChild(this.domNode);
			}
			if(!this.isBoxResizer){
				// should we modify the css for the cursor hover to n-resize nw-resize and w-resize?
				var addClass = rias.partial(rias.dom.addClass, this.resizeHandle);
				if(this.resizeX && this.resizeY){
					// FIXME: need logic to determine NW or NE class to see
					// based on which [todo] corner is clicked
					this.isLeftToRight() ? this._resizeRight = true : this._resizeLeft = true;
					this._resizeBottom = true;
					addClass("riaswResizerNW");
				}else if(this.resizeX){
					this.isLeftToRight() ? this._resizeRight = true : this._resizeLeft = true;
					addClass("riaswResizerW");
				}else if(this.resizeY){
					this._resizeBottom = true;
					addClass("riaswResizerN");
				}else{
					rias.dom.visible(this.domNode, false);
				}
			}

			this.inherited(arguments);
		},
		postCreate: function(){
			var self = this;
			if(!this.disabled){
				//if(this.isBoxResizer){
					this._boxResizerMoveHandle = this.own(rias.on(this.targetDomNode, rias.touch.move, function(evt){
						self._getBoxResizeHandle(evt);
					}))[0];
				//}else{
					//this.connect(this.resizeHandle, rias.touch.press, "_beginSizing");
					this._resizerMoveHandle = this.own(rias.on(this.resizeHandle, rias.touch.press, function(evt){
						self._beginSizing(evt);
					}))[0];
				//}
			}
			if(!this.activeResize){
				// there shall be only a single resize rubberbox that at the top
				// level so that we can overlay it on anything whenever the user
				// resizes something. Since there is only one mouse pointer he
				// can't at once resize multiple things interactively.
				this._resizerHelper = rias.by('riaswGlobalResizeHelper');///FIXME:zensst.目前不能保证是 riasw，故用 rias.registry.byId， 以后改为 rias.by。
				if(!this._resizerHelper){
					this._resizerHelper = new _ResizerHelper({
						ownerRiasw: rias.webApp,
						id: 'riaswGlobalResizeHelper'
					}).placeAt(rias.webApp || rias.body(rias.doc));
					rias.dom.addClass(this._resizerHelper.domNode, this.activeResizeClass);
				}
			}else{
				this.animateSizing = false;
			}

			if(!(this.minSize.w >= 0)){
				this.minSize.w = 36;
			}
			if(!(this.minSize.h >= 0)){
				this.minSize.h = 36;
			}
			if(!(this.maxSize.w >= 0)){
				this.maxSize.w = 0;
			}
			if(!(this.maxSize.h >= 0)){
				this.maxSize.h = 0;
			}

		},

		destroy: function(){
			//rias.forEach(this._pconnects, function(h){
			//	h.remove();
			//});
			//delete this._pconnects;
		},

		_setDisabledAttr: function(value){
			var self = this;
			value = !!value;
			if(value){
				if(this._boxResizerMoveHandle){
					this._boxResizerMoveHandle.remove();
					delete this._boxResizerMoveHandle;
				}
				if(this._resizerMoveHandle){
					this._resizerMoveHandle.remove();
					delete this._resizerMoveHandle;
				}
				if(this._boxResizerPressHandle){
					this._boxResizerPressHandle.remove();
					delete this._boxResizerPressHandle;
				}
				if(this._moveHandle){
					this._moveHandle.remove();
					delete this._moveHandle;
				}
				if(this._releaseHandle){
					this._releaseHandle.remove();
					delete this._releaseHandle;
				}
				this._resizerHelper.hide();
			}else{
				this._boxResizerMoveHandle = this.own(rias.on(this.targetDomNode, rias.touch.move, function(evt){
					self._getBoxResizeHandle(evt);
				}))[0];
				this._resizerMoveHandle = this.own(rias.on(this.resizeHandle, rias.touch.press, function(evt){
					self._beginSizing(evt);
				}))[0];
			}
			rias.dom.visible(this.domNode, !value);
			this._set("disabled", value);
		},

		_getBoxResizeHandle: function(evt){
			if(this.disabled || this._isSizing){
				return;
			}
			var box = rias.dom.position(this.targetDomNode, true);
			var self = this,
				dtop = evt.y - box.y,
				dbottom = box.h - dtop,
				dleft = evt.x - box.x,
				dright = box.w - dleft,
				oldCursor = rias.dom.getComputedStyle(this.targetDomNode).cursor,
				cursor;

			this._resizeTop = dtop > 0 && dtop < this.resizeBorderWidth && this.resizeY;
			this._resizeBottom = dbottom > 0 && dbottom < this.resizeBorderWidth && this.resizeY;
			this._resizeLeft = dleft > 0 && dleft < this.resizeBorderWidth && this.resizeX;
			this._resizeRight = dright > 0 && dright < this.resizeBorderWidth && this.resizeX;

			if(this._resizeTop && this._resizeLeft || this._resizeBottom && this._resizeRight){
				cursor = "nw-resize";
			}else if(this._resizeTop && this._resizeRight || this._resizeBottom && this._resizeLeft){
				cursor = "ne-resize";
			}else if(this._resizeTop || this._resizeBottom){
				cursor = "n-resize";
			}else if(this._resizeLeft || this._resizeRight){
				cursor = "w-resize";
			}else{
				cursor = "";
			}
			if(oldCursor !== cursor && (cursor || (oldCursor && oldCursor !== "auto"))){
				rias.dom.setStyle(this.targetDomNode, "cursor", cursor);
				if(this._boxResizerPressHandle){
					this._boxResizerPressHandle.remove();
					delete this._boxResizerPressHandle;
				}
				if(cursor){
					this._boxResizerPressHandle = this.own(rias.on(this.targetDomNode, rias.touch.press, function(evt){
						self._beginSizing(evt);
					}))[0];
				}
				//console.debug(oldCursor, cursor, this._resizeTop, this._resizeBottom, this._resizeLeft, this._resizeRight);
			}
		},

		_beginSizing: function(/*Event*/ e){
			if(this.disabled || this._isSizing){
				return;
			}
			if(!this.targetDomNode){
				return;
			}
			if(this._boxResizerMoveHandle){
				this._boxResizerMoveHandle.remove();
				delete this._boxResizerMoveHandle;
			}
			rias.publish(this.startTopic, [this]);

			var box = rias.dom.position(this.targetDomNode, true);///取绝对位置，注意：没有 box.l 和 box.t
			if(!this.activeResize){
				this._resizerHelper.resize({
					l: box.x,
					t: box.y,
					w: box.w,
					h: box.h
				});
				this._resizerHelper.show();
				this._resizerHelper.startPosition = {
					l: box.x,
					t: box.y,
					w: box.w,
					h: box.h
				};
			}

			this._isSizing = true;
			this.startPoint  = {
				x: e.clientX,
				y: e.clientY
			};

			// widget.resize() or setting style.width/height expects native box model dimension
			// (in most cases content-box, but it may be border-box if in backcompact mode)
			var style = rias.dom.getComputedStyle(this.targetDomNode),
				pb = (rias.dom.boxModel === 'border-model' ? {w:0, h:0} : rias.dom.getPadBorderExtents(this.targetDomNode, style)),
				me = rias.dom.getMarginExtents(this.targetDomNode, style);
			this.startSize = {
				t: rias.dom.toPixelValue(this.targetDomNode, style.top),
				l: rias.dom.toPixelValue(this.targetDomNode, style.left),
				w: rias.dom.toPixelValue(this.targetDomNode, style.width),
				h: rias.dom.toPixelValue(this.targetDomNode, style.height),
				//ResizeHelper.resize expects a bounding box of the
				//border box, so let's keep track of padding/border
				//width/height as well
				pb: pb,
				me: me
			};
			if(style.position === "absolute"){
				box = rias.dom.getMarginBox(this.targetDomNode);///取相对位置，注意：没有 box.x 和 box.y
				this.startPosition = {
					l: box.l,
					t: box.t,
					w: box.w,
					h: box.h
				};
			}

			if(this._moveHandle){
				this._moveHandle.remove();
				delete this._moveHandle;
			}
			this._moveHandle = this.own(rias.on(rias.doc, rias.touch.move, rias.hitch(this, this._updateSizing)))[0];
			if(this._releaseHandle){
				this._releaseHandle.remove();
				delete this._releaseHandle;
			}
			this._releaseHandle = this.own(rias.on(rias.doc, rias.touch.release, rias.hitch(this, this._endSizing)))[0];

			rias.event.stop(e);
		},

		_updateSizing: function(/*Event*/ e){
			if(this.activeResize){
				this._changeSizing(e);
			}else{
				var tmp = this._getNewCoords(e, 'border', this._resizerHelper.startPosition);
				if(tmp === false){
					return;
				}
				this._resizerHelper.resize(tmp);
			}
			e.preventDefault();
			//console.debug(this.id, "_updateSizing");
		},

		_getNewCoords: function(/* Event */ e, /* String */ boxModel, /* Object */startPosition){
			if(!(startPosition = (startPosition || this.startPosition))){
				return false;
			}
			// On IE, if you move the mouse above/to the left of the object being resized,
			// sometimes clientX/Y aren't set, apparently.  Just ignore the event.
			try{
				if(!e.clientX  || !e.clientY){
					return false;
				}
			}catch(err){
				// sometimes you get an exception accessing above fields...
				return false;
			}
			//this._activeResizeLastEvent = e;

			var dx = this.startPoint.x - e.clientX,
				dy = this.startPoint.y - e.clientY,
				newW = this.startSize.w - (this._resizeLeft ? -dx : this._resizeRight ? dx : 0),
				newH = this.startSize.h - (this._resizeTop ? -dy : this._resizeBottom ? dy : 0),
				r = this._checkConstraints(newW, newH);

			if(this._resizeTop){
				r.t = startPosition.t - dy;
				if(r.h != newH){
					r.t += (newH - r.h);
				}
			}
			if(this._resizeLeft){
				r.l = startPosition.l - dx;
				if(r.w != newW){
					r.l += (newW - r.w);
				}
			}

			switch(boxModel){
				case 'margin':
					/*if(this._resizeTop){
						r.t -= this.startSize.me.t
					}
					if(this._resizeLeft){
						r.l -= this.startSize.me.l
					}*/
					r.w += this.startSize.me.w;
					r.h += this.startSize.me.h;
				//pass through
				case "border":
					/*if(this._resizeTop){
						r.t -= this.startSize.pb.t
					}
					if(this._resizeLeft){
						r.l -= this.startSize.pb.l
					}*/
					r.w += this.startSize.pb.w;
					r.h += this.startSize.pb.h;
					break;
				//default: //native, do nothing
			}

			return r; // Object
		},

		_checkConstraints: function(newW, newH){
			// summary:
			//		filter through the various possible constaint possibilities.

			if(this.minSize.w >= 0 && newW < this.minSize.w){
				newW = this.minSize.w;
			}
			if(this.minSize.h >= 0 && newH < this.minSize.h){
				newH = this.minSize.h;
			}
			if(this.maxSize.w > 0 && newW > this.maxSize.w){
				newW = this.maxSize.w;
			}
			if(this.maxSize.h > 0 && newH > this.maxSize.h){
				newH = this.maxSize.h;
			}

			if(this.fixedAspect){
				var w = this.startSize.w,
					h = this.startSize.h,
					delta = w * newH - h * newW;
				if(delta < 0){
					newW = newH * w / h;
				}else if(delta > 0){
					newH = newW * h / w;
				}
			}

			return {
				w: newW,
				h: newH
			}; // Object
		},

		_changeSizing: function(/*Event*/ e){
			// summary:
			//		apply sizing information based on information in (e) to attached node

			var isWidget = this.targetWidget && rias.isFunction(this.targetWidget.resize),
				tmp = this._getNewCoords(e, isWidget && 'margin');
			if(tmp === false){
				return;
			}

			if(isWidget){
				this.targetWidget.resize(tmp);
			}else{
				if(this.animateSizing){
					var anim = rias.fx[this.animateMethod]([
						rias.fx.animateProperty({
							node: this.targetDomNode,
							properties: {
								left: {
									start: this.startSize.l,
									end: tmp.l
								},
								width: {
									start: this.startSize.w,
									end: tmp.w
								}
							},
							duration: this.animateDuration
						}),
						rias.fx.animateProperty({
							node: this.targetDomNode,
							properties: {
								top: {
									start: this.startSize.t,
									end: tmp.t
								},
								height: {
									start: this.startSize.h,
									end: tmp.h
								}
							},
							duration: this.animateDuration
						})
					]);
					anim.play();
				}else{
					rias.dom.setStyle(this.targetDomNode, {
						top: tmp.t + "px",
						left: tmp.l + "px",
						width: tmp.w + "px",
						height: tmp.h + "px"
					});
				}
			}
			if(this.intermediateChanges){
				this.onResize(e);
			}
		},

		_endSizing: function(/*Event*/ e){
			// summary:
			//		disconnect listenrs and cleanup sizing
			var self = this;
			if(this._moveHandle){
				this._moveHandle.remove();
				delete this._moveHandle;
			}
			if(this._releaseHandle){
				this._releaseHandle.remove();
				delete this._releaseHandle;
			}

			var pub = rias.partial(rias.publish, this.endTopic, [this]);
			if(!this.activeResize){
				this._resizerHelper.hide();
				this._changeSizing(e);
				setTimeout(pub, this.animateDuration + 30);
			}else{
				pub();
			}
			this._isSizing = false;
			this.onResize(e);
			if(this._boxResizerMoveHandle){
				this._boxResizerMoveHandle.remove();
				delete this._boxResizerMoveHandle;
			}
			if(!this.disabled && this.isBoxResizer){
				this._boxResizerMoveHandle = this.own(rias.on(this.targetDomNode, rias.touch.move, function(evt){
					self._getBoxResizeHandle(evt);
				}))[0];
			}
			//console.debug(this.id, "_endSizing");
		},

		onResize: function(e){
			// summary:
			//		Stub fired when sizing is done. Fired once
			//		after resize, or often when `intermediateChanges` is
			//		set to true.
		}

	});

	Widget._riasdMeta = {
		visual: true,
		//iconClass: "riaswPopupPaneIcon",
		//iconClass16: "riaswPopupPaneIcon16",
		defaultParams: {
			//resizeX: true,
			//resizeY: true,
			//activeResize: false,
			//animateSizing: true,
			//animateDuration: 225,
		}
	};

	return Widget;

});