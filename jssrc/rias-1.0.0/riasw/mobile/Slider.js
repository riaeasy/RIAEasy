define([
	"rias",
	"dijit/_WidgetBase",
	"rias/riasw/form/_FormValueMixin",
	"dojox/mobile/common"
],
	function(rias, WidgetBase, FormValueMixin, common){

	return rias.declare("rias.riasw.mobile.Slider", [WidgetBase, FormValueMixin], {
		// summary:
		//		A non-templated Slider widget similar to the HTML5 INPUT type=range.

		// value: [const] Number
		//		The current slider value.
		value: 0,

		// min: [const] Number
		//		The first value the slider can be set to.
		min: 0,

		// max: [const] Number
		//		The last value the slider can be set to.
		max: 100,

		// step: [const] Number
		//		The delta from 1 value to another.
		//		This causes the slider handle to snap/jump to the closest possible value.
		//		A value of 0 means continuous (as much as allowed by pixel resolution).
		step: 1,

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblSlider",

		// flip: [const] Boolean
		//		Specifies if the slider should change its default: ascending <--> descending.
		flip: false,

		// orientation: [const] String
		//		The slider direction.
		//
		//		- "H": horizontal
		//		- "V": vertical
		//		- "auto": use width/height comparison at instantiation time (default is "H" if width/height are 0)
		orientation: "auto",

		// halo: Number
		//		Size of the boundary that extends beyond the edges of the slider
		//		to make it easier to touch.
		halo: "8pt",

		buildRendering: function(){
			if(!this.templateString){ // true if this widget is not templated
				this.focusNode = this.domNode = rias.dom.create("div", {});
				this.valueNode = rias.dom.create("input", (this.srcNodeRef && this.srcNodeRef.name) ? { type: "hidden", name: this.srcNodeRef.name } : { type: "hidden" }, this.domNode, "last");
				var relativeParent = rias.dom.create("div", { style: { position:"relative", height:"100%", width:"100%" } }, this.domNode, "last");
				this.progressBar = rias.dom.create("div", { style:{ position:"absolute" }, "class":"mblSliderProgressBar" }, relativeParent, "last");
				this.touchBox = rias.dom.create("div", { style:{ position:"absolute" }, "class":"mblSliderTouchBox" }, relativeParent, "last");
				this.handle = rias.dom.create("div", { style:{ position:"absolute" }, "class":"mblSliderHandle" }, relativeParent, "last");
				this.handle.setAttribute("role", "slider");
				this.handle.setAttribute("tabindex", 0);
			}
			this.inherited(arguments);
			// prevent browser scrolling on IE10 (evt.preventDefault() is not enough)
			common._setTouchAction(this.domNode, "none");
		},

		_setMinAttr: function(/*Number*/ min){
			this.handle.setAttribute("aria-valuemin", min);
			this._set("min",min);
		},
		_setMaxAttr: function(/*Number*/ max){
			this.handle.setAttribute("aria-valuemax", max);
			this._set("max",max);
		},
		_setValueAttr: function(/*Number*/ value, /*Boolean?*/ priorityChange){
			// summary:
			//		Hook such that set('value', value) works.
			// tags:
			//		private
			value = Math.max(Math.min(value, this.max), this.min);
			var fromPercent = (this.value - this.min) * 100 / (this.max - this.min);
			this.valueNode.value = value;
			this.inherited(arguments);
			if(!this._started){ return; } // don't move images until all the properties are set
			var toPercent = (value - this.min) * 100 / (this.max - this.min);
			// now perform visual slide
			var horizontal = this.orientation != "V";
			if(priorityChange === true){
				rias.dom.addClass(this.handle, "mblSliderTransition");
				rias.dom.add(this.progressBar, "mblSliderTransition");
			}else{
				rias.dom.removeClass(this.handle, "mblSliderTransition");
				rias.dom.removeClass(this.progressBar, "mblSliderTransition");
			}
			rias.dom.setStyle(this.handle, this._attrs.handleLeft, (this._reversed ? (100-toPercent) : toPercent) + "%");
			rias.dom.setStyle(this.progressBar, this._attrs.width, toPercent + "%");
			this.handle.setAttribute("aria-valuenow", value);
		},

		postCreate: function(){
			this.inherited(arguments);

			function beginDrag(e){
				e.target.focus();
				function getEventData(e){
					point = isMouse ? e[this._attrs.pageX] : (e.touches ? e.touches[0][this._attrs.pageX] : e[this._attrs.clientX]);
					pixelValue = point - startPixel;
					pixelValue = Math.min(Math.max(pixelValue, 0), maxPixels);
					var discreteValues = this.step ? ((this.max - this.min) / this.step) : maxPixels;
					if(discreteValues <= 1 || discreteValues == Infinity ){ discreteValues = maxPixels; }
					var wholeIncrements = Math.round(pixelValue * discreteValues / maxPixels);
					value = (this.max - this.min) * wholeIncrements / discreteValues;
					value = this._reversed ? (this.max - value) : (this.min + value);
				}
				function continueDrag(e){
					e.preventDefault();
					rias.hitch(this, getEventData)(e);
					this.set('value', value, false);
				}
		
				function endDrag(e){
					e.preventDefault();
					rias.forEach(actionHandles, rias.hitch(this, "disconnect"));
					actionHandles = [];
					this.set('value', this.value, true);
				}

				e.preventDefault();
				var isMouse = e.type == "mousedown";
				var box = rias.dom.position(node, false); // can't use true since the added docScroll and the returned x are body-zoom incompatible
				var bodyZoom = (rias.has("ie") || rias.has("trident") > 6) ? 1 : (rias.dom.getStyle(rias.dom.body(), "zoom") || 1);
				if(isNaN(bodyZoom)){ bodyZoom = 1; }
				var nodeZoom = (rias.has("ie") || rias.has("trident") > 6) ? 1 : (rias.dom.getStyle(node, "zoom") || 1);
				if(isNaN(nodeZoom)){ nodeZoom = 1; }
				var startPixel = box[this._attrs.x] * nodeZoom * bodyZoom + rias.dom.docScroll()[this._attrs.x];
				var maxPixels = box[this._attrs.w] * nodeZoom * bodyZoom;
				rias.hitch(this, getEventData)(e);
				if(e.target == this.touchBox){
					this.set('value', value, true);
				}
				rias.forEach(actionHandles, function(handle){
					handle.remove();
				});
				var root = rias.dom.doc.documentElement;
				var actionHandles = [
					this.on(root, rias.touch.move, continueDrag),
					this.on(root, rias.touch.release, endDrag)
				];
			}

			function keyPress(/*Event*/ e){
				if(this.disabled || this.readOnly || e.altKey || e.ctrlKey || e.metaKey){ return; }
				var	step = this.step,
					multiplier = 1,
					newValue;
				switch(e.keyCode){
					case rias.keys.HOME:
						newValue = this.min;
						break;
					case rias.keys.END:
						newValue = this.max;
						break;
					case rias.keys.RIGHT_ARROW:
						multiplier = -1;
					case rias.keys.LEFT_ARROW:
						newValue = this.value + multiplier * ((flip && horizontal) ? step : -step);
						break;
					case rias.keys.DOWN_ARROW:
						multiplier = -1;
					case rias.keys.UP_ARROW:
						newValue = this.value + multiplier * ((!flip || horizontal) ? step : -step);
						break;
					default:
						return;
				}
				e.preventDefault();
				this._setValueAttr(newValue, false);
			}

			function keyUp(/*Event*/ e){
				if(this.disabled || this.readOnly || e.altKey || e.ctrlKey || e.metaKey){ return; }
				this._setValueAttr(this.value, true);
			}

			var	point, pixelValue, value,
				node = this.domNode;
			if(this.orientation == "auto"){
				 this.orientation = node.offsetHeight <= node.offsetWidth ? "H" : "V";
			}
			// add V or H suffix to baseClass for styling purposes
			rias.dom.addClass(this.domNode, rias.map(this.baseClass.split(" "), rias.hitch(this, function(c){ return c+this.orientation; })));
			var	horizontal = this.orientation != "V",
				ltr = horizontal ? this.isLeftToRight() : false,
				flip = !!this.flip;
			// _reversed is complicated since you can have flipped right-to-left and vertical is upside down by default
			this._reversed = !((horizontal && ((ltr && !flip) || (!ltr && flip))) || (!horizontal && flip));
			this._attrs = horizontal ? { x:'x', w:'w', l:'l', r:'r', pageX:'pageX', clientX:'clientX', handleLeft:"left", left:this._reversed ? "right" : "left", width:"width" } : { x:'y', w:'h', l:'t', r:'b', pageX:'pageY', clientX:'clientY', handleLeft:"top", left:this._reversed ? "bottom" : "top", width:"height" };
			this.progressBar.style[this._attrs.left] = "0px";
			this.own(rias.after(this.touchBox, rias.touch.press, beginDrag));
			this.own(rias.after(this.handle, rias.touch.press, beginDrag));
			this.own(rias.after(this.domNode, "onkeypress", keyPress)); // for desktop a11y
			this.own(rias.after(this.domNode, "onkeyup", keyUp)); // fire onChange on desktop
			this.startup();
			this.set('value', this.value);
		}
	});
});
