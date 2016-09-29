define([
	"rias",
	"dijit/_Widget"
], function(rias, _Widget){

	//rias.theme.loadThemeCss([
	//	"riasw/layout/Resizer.css"
	//]);

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

	var riaswType = "rias.riasw.layout.Resizer";
	var Widget = rias.declare(riaswType, [_Widget], {

		isBoxResizer: false,
		resizeBorderWidth: 12,

		// targetId: String
		//		id of the Widget OR DomNode that I will size
		targetId: "",
		targetWidget: null,
		//referNodes: null,

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

		postMixInProperties: function(){
			this.referNodes = [];
			this._resizerMoveHandle = [];
			this._boxResizerPressHandle = [];
			this.inherited(arguments);
		},
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
			this.inherited(arguments);
			this.set("disabled", this.disabled);
			if(!this.activeResize){
				// there shall be only a single resize rubberbox that at the top
				// level so that we can overlay it on anything whenever the user
				// resizes something. Since there is only one mouse pointer he
				// can't at once resize multiple things interactively.
				this._resizerHelper = rias.by('riaswGlobalResizeHelper');
				if(!this._resizerHelper){
					this._resizerHelper = new _ResizerHelper({
						ownerRiasw: rias.webApp,
						id: 'riaswGlobalResizeHelper'
					}).placeAt(rias.dom.webAppNode);
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
			this._cancel();
			if(this._resizerHelper){
				this._resizerHelper.hide();
			}
		},

		_cancel: function(){
			this._removeResizeMoveHandle();
			this._removePressHandle();
			this._removeMoveHandle();
			this._removeReleaseHandle();
		},
		_removeResizeMoveHandle: function(){
			rias.forEach(this._resizerMoveHandle, function(item){
				item.remove();
			});
			this._resizerMoveHandle.length = 0;
		},
		_removePressHandle: function(){
			rias.forEach(this._boxResizerPressHandle, function(item){
				item.remove();
			});
			this._boxResizerPressHandle.length = 0;
		},
		_handleResizeMove: function(){
			var self = this;
			self._removeResizeMoveHandle();
			self._removePressHandle();
			if(!this.get("disabled")){
				rias.concat(self._resizerMoveHandle, self.own(rias.on(self.resizeHandle, rias.touch.press, function(evt){
					self._beginSizing(evt);
				})));
				if(self.isBoxResizer){
					rias.concat(self._resizerMoveHandle, self.own(rias.on(self.targetDomNode, rias.touch.move, function(evt){
						self._getBoxResizeHandle(evt);
					})));
					rias.forEach(self.referNodes, function(node){
						if(rias.isDomNode(node)){
							rias.concat(self._resizerMoveHandle, self.own(rias.on(node, rias.touch.move, function(evt){
								self._getBoxResizeHandle(evt);
							})));
						}
					});

					rias.concat(self._boxResizerPressHandle, self.own(rias.on(self.targetDomNode, rias.touch.press, function(evt){
						if(self._currCursor){
							self._beginSizing(evt);
						};
					})));
					rias.forEach(self.referNodes, function(node){
						if(rias.isDomNode(node)){
							rias.concat(self._boxResizerPressHandle, self.own(rias.on(node, rias.touch.press, function(evt){
								if(self._currCursor){
									self._beginSizing(evt);
								};
							})));
						}
					});
				}
			}
		},
		_removeMoveHandle: function(){
			if(this._moveHandle){
				this._moveHandle.remove();
				this._moveHandle = undefined;
			}
		},
		_handleMove: function(){
			var self = this;
			self._removeMoveHandle();
			self._moveHandle = self.own(rias.on(rias.dom.doc, rias.touch.move, rias.hitch(self, self._updateSizing)))[0];
		},
		_removeReleaseHandle: function(){
			if(this._releaseHandle){
				this._releaseHandle.remove();
				this._releaseHandle = undefined;
			}
		},
		_handleRelease: function(){
			var self = this;
			self._removeReleaseHandle();
			this._releaseHandle = this.own(rias.on(rias.dom.doc, rias.touch.release, rias.hitch(this, this._endSizing)))[0];
		},

		addReferNodes: function(value){
			this._cancel();
			rias.concat(this.referNodes, value);
			this._handleResizeMove();
		},
		removeReferNodes: function(value){
			this._cancel();
			rias.removeItems(this.referNodes, value);
			this._handleResizeMove();
		},
		_setDisabledAttr: function(value){
			var self = this;
			value = !!value;
			if(value){
				this._cancel();
				this._resizerHelper.hide();
			}
			rias.dom.visible(this.domNode, !value);
			this._set("disabled", value);
			this._handleResizeMove();
		},

		_getBoxResizeHandle: function(evt){
			if(this.disabled || this._isSizing){
				return;
			}
			var box = rias.dom.position(this.targetDomNode, true);
			var dtop = evt.pageY - box.y,
				dbottom = box.h - dtop,
				dleft = evt.pageX - box.x,
				dright = box.w - dleft,
				//oldCursor = rias.dom.getComputedStyle(this.targetDomNode).cursor,
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
			rias.dom.setStyle(this.targetDomNode, "cursor", cursor);
			this._currCursor = cursor;
			//console.debug("move - " + cursor + " - " + (evt.target ? evt.target.className : this.id));
		},

		_beginSizing: function(/*Event*/ e){
			if(this.disabled || this._isSizing){
				return;
			}
			if(!this.targetDomNode){
				return;
			}
			this._removeResizeMoveHandle();
			this._removePressHandle();
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

			this._handleMove();
			this._handleRelease();

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
				//pass through，继续，不是 break
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
				default: //native, do nothing
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
			this._removePressHandle();
			this._removeMoveHandle();
			this._removeReleaseHandle();

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
			this._handleResizeMove();
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