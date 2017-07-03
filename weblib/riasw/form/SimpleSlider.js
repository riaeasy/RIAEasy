
/// riasw/form/SimpleSlider

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_CssStateMixin",
	"riasw/form/_FormWidgetMixin"
],
	function(rias, _WidgetBase, _CssStateMixin, _FormWidgetMixin){

	return rias.declare("riasw.form.SimpleSlider", [_WidgetBase, _CssStateMixin, _FormWidgetMixin], {
		// summary:
		//		A non-templated Slider widget similar to the HTML5 INPUT type=range.

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "riaswSimpleSlider",

		// value: [const] Number
		//		The current slider value.
		value: 0,
		_handleValue: true,
		// min: [const] Number
		//		The first value the slider can be set to.
		min: 0,
		// max: [const] Number
		//		The last value the slider can be set to.
		max: 100,

		// step: [const] Number
		//		The delta from 1 value to another.
		//		This causes the slider knob to snap/jump to the closest possible value.
		//		A value of 0 means continuous (as much as allowed by pixel resolution).
		step: 1,

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
				this.valueNode = rias.dom.create("input", (this.srcNodeRef && this.srcNodeRef.name) ? {
					type: "hidden",
					name: this.srcNodeRef.name
				} : {
					type: "hidden"
				}, this.domNode, "last");
				this.containerNode = rias.dom.create("div", {
					"class":"riaswSimpleSliderBar"
				}, this.domNode, "last");
				this.progressBar = rias.dom.create("div", {
					"class":"riaswSimpleSliderProgressBar"
				}, this.containerNode, "last");
				this.touchBox = rias.dom.create("div", {
					"class":"riaswSimpleSliderTouchBox"
				}, this.containerNode, "last");
				this.knob = rias.dom.create("div", {
					"class":"riaswSimpleSliderKnob"
				}, this.containerNode, "last");
				this.knob.setAttribute("role", "slider");
				this.knob.setAttribute("tabindex", 0);
			}
			this.inherited(arguments);

			var node = this.domNode;
			if(this.orientation === "auto"){
				this.orientation = node.offsetHeight <= node.offsetWidth ? "H" : "V";
			}
			// add V or H suffix to baseClass for styling purposes
			rias.dom.addClass(this.domNode, rias.map(this.baseClass.split(" "), rias.hitch(this, function(c){
				return c + this.orientation;
			})));
			var horizontal = this.orientation !== "V",
				ltr = horizontal ? this.isLeftToRight() : false,
				flip = !!this.flip;
			// _reversed is complicated since you can have flipped right-to-left and vertical is upside down by default
			this._reversed = !((horizontal && ((ltr && !flip) || (!ltr && flip))) || (!horizontal && flip));
			this._attrs = horizontal ? {
				x: 'x',
				w: 'w',
				l: 'l',
				r: 'r',
				pageX: 'pageX',
				clientX: 'clientX',
				handleLeft: "left",
				left: this._reversed ? "right" : "left",
				width: "width"
			} : {
				x: 'y',
				w: 'h',
				l: 't',
				r: 'b',
				pageX: 'pageY',
				clientX: 'clientY',
				handleLeft: "top",
				left: this._reversed ? "bottom" : "top",
				width: "height"
			};
			this.progressBar.style[this._attrs.left] = "0px";

			// prevent browser scrolling on IE10 (evt.preventDefault() is not enough)
			rias.dom._setTouchAction(this.domNode, "none");
		},
		postCreate: function(){
			this.inherited(arguments);

			this.on(this.touchBox, rias.touch.press, "_doBeginDrag");
			this.on(this.knob, rias.touch.press, "_doBeginDrag");
			this.on(this.domNode, "keydown", "_onKeyDown"); // for desktop a11y
			this.on(this.domNode, "keyup", "_onKeyUp"); // fire onChange on desktop
		},
		_onDestroy: function(){
			rias.forEach(this._actionHandles, function(handle){
				handle.remove();
			});
			this._actionHandles = undefined;
			this.inherited(arguments);
			delete this.knob;
			delete this.touchBox;
			delete this.progressBar;
		},

		startup: function(){
			this.inherited(arguments);
		},

		_doBeginDrag: function(evt){
			var self = this,
				point, pixelValue, value,
				node = this.domNode;

			if(this.disabled || this.readOnly || evt.altKey || evt.ctrlKey || evt.metaKey){
				return;
			}

			evt.target.focus();

			function getEventData(evt){
				point = isMouse ? evt[self._attrs.pageX] : (evt.touches ? evt.touches[0][self._attrs.pageX] : evt[self._attrs.clientX]);
				pixelValue = point - startPixel;
				pixelValue = Math.min(Math.max(pixelValue, 0), maxPixels);
				var discreteValues = self.step ? ((self.max - self.min) / self.step) : maxPixels;
				if(discreteValues <= 1 || discreteValues == Infinity ){
					discreteValues = maxPixels;
				}
				var wholeIncrements = Math.round(pixelValue * discreteValues / maxPixels);
				value = (self.max - self.min) * wholeIncrements / discreteValues;
				value = self._reversed ? (self.max - value) : (self.min + value);
			}
			function continueDrag(evt){
				evt.preventDefault();
				getEventData.apply(self, [evt]);
				self.set('value', value, false);
			}
			function endDrag(evt){
				evt.preventDefault();
				rias.forEach(self._actionHandles, function(h){
					h.remove();
				});
				self._actionHandles = [];
				self.set('value', self.value, true);
			}

			evt.preventDefault();
			var isMouse = evt.type === "mousedown";
			var box = rias.dom.getPosition(node, false); // can't use true since the added docScroll and the returned x are body-zoom incompatible
			var bodyZoom = (rias.has("ie") || rias.has("trident") > 6) ? 1 : (rias.dom.getStyle(rias.dom.body(), "zoom") || 1);
			if(isNaN(bodyZoom)){
				bodyZoom = 1;
			}
			var nodeZoom = (rias.has("ie") || rias.has("trident") > 6) ? 1 : (rias.dom.getStyle(node, "zoom") || 1);
			if(isNaN(nodeZoom)){
				nodeZoom = 1;
			}
			var startPixel = box[self._attrs.x] * nodeZoom * bodyZoom + rias.dom.docScroll()[self._attrs.x];
			var maxPixels = box[self._attrs.w] * nodeZoom * bodyZoom;
			getEventData.apply(self, [evt]);
			if(evt.target === self.touchBox){
				self.set('value', value, true);
			}
			rias.forEach(self._actionHandles, function(handle){
				handle.remove();
			});
			var root = rias.dom.doc.documentElement;
			self._actionHandles = [
				self.on(root, rias.touch.move, continueDrag),
				self.on(root, rias.touch.release, endDrag)
			];
		},
		_onKeyDown: function(evt){
			if(this.disabled || this.readOnly || evt.altKey || evt.ctrlKey || evt.metaKey){
				return;
			}
			var horizontal = this.orientation !== "V",
				flip = !!this.flip,
				step = this.step,
				multiplier = 1,
				newValue;
			switch(evt.keyCode){
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
			evt.preventDefault();
			this._setValueAttr(newValue, false);
		},
		_onKeyUp: function(evt){
			if(this.disabled || this.readOnly || evt.altKey || evt.ctrlKey || evt.metaKey){
				return;
			}
			this._setValueAttr(this.value, true);
		},

		_setMinAttr: function(/*Number*/ min){
			this.knob.setAttribute("aria-valuemin", min);
			this._set("min",min);
		},
		_setMaxAttr: function(/*Number*/ max){
			this.knob.setAttribute("aria-valuemax", max);
			this._set("max",max);
		},
		_setValueAttr: function(/*Number*/ value, /*Boolean?*/ priorityChange){
			// summary:
			//		Hook such that set('value', value) works.
			// tags:
			//		private
			value = Math.max(Math.min(value, this.max), this.min);
			//var fromPercent = (this.value - this.min) * 100 / (this.max - this.min);
			this.valueNode.value = value;
			this.inherited(arguments);
			//if(!this._started){
			//	return;
			//} // don't move images until all the properties are set
			var toPercent = (value - this.min) * 100 / (this.max - this.min);
			// now perform visual slide
			//var horizontal = this.orientation !== "V";
			if(priorityChange === true){
				rias.dom.addClass(this.knob, "riaswSimpleSliderTransition");
				rias.dom.addClass(this.progressBar, "riaswSimpleSliderTransition");
			}else{
				rias.dom.removeClass(this.knob, "riaswSimpleSliderTransition");
				rias.dom.removeClass(this.progressBar, "riaswSimpleSliderTransition");
			}
			rias.dom.setStyle(this.knob, this._attrs.handleLeft, (this._reversed ? (100-toPercent) : toPercent) + "%");
			rias.dom.setStyle(this.progressBar, this._attrs.width, toPercent + "%");
			this.knob.setAttribute("aria-valuenow", value);
		}

	});
});
