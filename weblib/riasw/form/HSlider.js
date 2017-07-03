//RIAStudio client runtime widget - HorizontalSlider

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/_CssStateMixin",
	"riasw/form/_FormWidgetMixin",
	"riasw/sys/_Container",
	"dojo/dnd/move",
	"dojo/dnd/Moveable", // Moveable
	"dojo/dnd/Mover" // Mover Mover.prototype.destroy.apply
], function(rias, _WidgetBase, _TemplatedMixin, _CssStateMixin, _FormWidgetMixin, _Container, move, Moveable, Mover) {

	var _SliderMover = rias.declare("riasw.form._SliderMover", Mover, {
		onMouseMove: function(e){
			var widget = this.widget;
			var abspos = widget._abspos;
			if(!abspos){
				abspos = widget._abspos = rias.dom.getPosition(widget.sliderBarContainer, true);
				widget._setPixelValue_ = rias.hitch(widget, "_setPixelValue");
				widget._isReversed_ = widget._isReversed();
			}
			var pixelValue = e[widget._mousePixelCoord] - abspos[widget._startingPixelCoord];
			widget._setPixelValue_(widget._isReversed_ ? (abspos[widget._pixelCount] - pixelValue) : pixelValue, abspos[widget._pixelCount], false);
		},

		destroy: function(e){
			///注意：没有继承自 Desrtoyable
			Mover.prototype.destroy.apply(this, arguments);
			var widget = this.widget;
			widget._abspos = null;
			widget.set("value", widget.value, true);
		}
	});

	var riaswType = "riasw.form.HSlider";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin, _CssStateMixin, _FormWidgetMixin, _Container], {
		// summary:
		//		A form widget that allows one to select a value with a horizontally draggable handle

		templateString:
			'<table data-dojo-attach-point="containerNode" class="dijitReset" data-dojo-attach-event="onkeydown:_onKeyDown, onkeyup:_onKeyUp" cellspacing="0" cellpadding="0" border="0" border-collapse="collapse" border-spacing="0" frame="void" rules="none" role="presentation">' +
				'<tr class="dijitReset">' +
					'<td class="dijitReset" colspan="2"></td>' +
					'<td data-dojo-attach-point="topDecoration" class="dijitReset riaswSliderDecoration riaswSliderDecorationTop"></td>' +
					'<td class="dijitReset" colspan="2"></td>' +
				'</tr><tr class="dijitReset">' +
					'<td class="dijitReset riaswSliderButtonContainer">' +
						'<div class="riaswSliderDecrementIcon" data-dojo-attach-point="decrementButton"><span class="riaswSliderButtonInner">-</span></div>' +
					'</td><td class="dijitReset">' +
						'<div class="riaswSliderBar riaswSliderLeftBumper" data-dojo-attach-event="press:_onClkDecBumper"></div>' +
					'</td><td class="dijitReset riaswSliderBarContainer" data-dojo-attach-point="sliderBarContainer">' +
						'<input data-dojo-attach-point="valueNode" type="hidden" ${!nameAttrSetting}/>' +
						//'<div class="dijitReset riaswSliderBarContainer" role="presentation" data-dojo-attach-point="sliderBarContainer">' +
							'<div role="presentation" data-dojo-attach-point="progressBar" class="riaswSliderBar riaswSliderProgressBar" data-dojo-attach-event="press:_onBarClick">' +
								'<div class="riaswSliderMoveable">' +
									'<div data-dojo-attach-point="sliderHandle,focusNode" class="riaswSliderImageHandle" data-dojo-attach-event="press:_onHandleClick" role="slider"></div>' +
								'</div>' +
							'</div>' +
							'<div role="presentation" data-dojo-attach-point="remainingBar" class="riaswSliderBar riaswSliderRemainingBar" data-dojo-attach-event="press:_onBarClick"></div>' +
						//'</div>' +
					'</td><td class="dijitReset">' +
						'<div class="riaswSliderBar riaswSliderRightBumper" data-dojo-attach-event="press:_onClkIncBumper"></div>' +
					'</td><td class="dijitReset riaswSliderButtonContainer">' +
						'<div class="riaswSliderIncrementIcon" data-dojo-attach-point="incrementButton"><span class="riaswSliderButtonInner">+</span></div>' +
					'</td>' +
				'</tr><tr class="dijitReset">' +
					'<td class="dijitReset" colspan="2"></td>' +
					'<td data-dojo-attach-point="bottomDecoration" class="dijitReset riaswSliderDecoration riaswSliderDecorationBottom"></td>' +
					'<td class="dijitReset" colspan="2"></td>' +
				'</tr>' +
			'</table>',

		baseClass: "riaswSlider riaswSliderH",
		// Apply CSS classes to up/down arrows and handle per mouse state
		cssStateNodes: {
			incrementButton: "riaswSliderIncrementButton",
			decrementButton: "riaswSliderDecrementButton",
			focusNode: "riaswSliderThumb"
		},

		_isVertical: false,

		// Overrides FormValueWidget.value to indicate numeric value
		value: 0,
		_handleValue: true,

		// showButtons: [const] Boolean
		//		Show increment/decrement buttons at the ends of the slider?
		showButtons: true,

		// minimum: [const] Integer
		//		The minimum value the slider can be set to.
		minimum: 0,
		// maximum: [const] Integer
		//		The maximum value the slider can be set to.
		maximum: 100,

		// steps: Integer
		//		If specified, indicates that the slider handle has only 'steps' possible positions,
		//		and that after dragging the handle, it will snap to the nearest possible position.
		//		Thus, the slider has only 'steps' possible values.
		//
		//		For example, if minimum=10, maxiumum=30, and steps=3, then the slider handle has
		//		three possible positions, representing values 10, 20, or 30.
		//
		//		If steps is not specified or if it's value is higher than the number of pixels
		//		in the slider bar, then the slider handle can be moved freely, and the slider's value will be
		//		computed/reported based on pixel position (in this case it will likely be fractional,
		//		such as 123.456789).
		steps: Infinity,
		// pageIncrement: Integer
		//		If steps is also specified, this indicates the amount of clicks (ie, snap positions)
		//		that the slider handle is moved via pageup/pagedown keys.
		//		If steps is not specified, it indicates the number of pixels.
		pageIncrement: 2,
		restrictValue: true,

		//enterAsTab: true,

		// clickSelect: Boolean
		//		If clicking the slider bar changes the value or not
		clickSelect: true,

		// slideDuration: Number
		//		The time in ms to take to animate the slider handle from 0% to 100%,
		//		when clicking the slider bar to make the handle move.
		slideDuration: rias.defaultDuration,

		// Map widget attributes to DOMNode attributes.
		_setIdAttr: "", // Override _FormWidgetMixin which sends id to focusNode
		_setNameAttr: "valueNode", // Override default behavior to send to focusNode

		tooltipPositions: ["above-centered", "below-centered"],

		_mousePixelCoord: "pageX",
		_pixelCount: "w",
		_startingPixelCoord: "x",
		_handleOffsetCoord: "left",
		_progressPixelSize: "width",

		_layoutHackIE7: function(){
			// summary:
			//		Work around table sizing bugs on IE7 by forcing redraw

			function _do(){
				var disconnectHandle = self.on(parent, "scroll", function(){
					disconnectHandle.remove(); // only call once
					pingNode.style.filter = (new Date()).getMilliseconds(); // set to anything that's unique
					self.defer(function(){
						pingNode.style.filter = origFilter;
					}); // restore custom filter, if any
				});
			}
			if(rias.has("ie") === 7){ // fix IE7 layout bug when the widget is scrolled out of sight
				var domNode = this.domNode;
				var parent = domNode.parentNode;
				var pingNode = domNode.firstChild || domNode; // target node most unlikely to have a custom filter
				var origFilter = pingNode.style.filter; // save custom filter, most likely nothing
				var self = this;
				while(parent && parent.clientHeight === 0){ // search for parents that haven't rendered yet
					_do();
					parent = parent.parentNode;
				}
			}
		},

		buildRendering: function(){
			this.inherited(arguments);
			rias.dom.toggleClass(this.incrementButton, "riaswHidden", !this.showButtons);
			rias.dom.toggleClass(this.decrementButton, "riaswHidden", !this.showButtons);

			// find any associated label element and add to slider focusnode.
			var label = rias.dom.query('label[for="' + this.id + '"]');
			if(label.length){
				if(!label[0].id){
					label[0].id = this.id + "_label";
				}
				this.focusNode.setAttribute("aria-labelledby", label[0].id);
			}

			this.focusNode.setAttribute("aria-valuemin", this.minimum);
			this.focusNode.setAttribute("aria-valuemax", this.maximum);
		},
		postCreate: function(){
			this.inherited(arguments);

			if(this.showButtons){
				this.own(
					rias.typematic.addMouseListener(this.decrementButton, this, "_typematicCallback", 25, 500),
					rias.typematic.addMouseListener(this.incrementButton, this, "_typematicCallback", 25, 500)
				);
			}
			this.own(
				rias.on(this.domNode, rias.mouse.wheel, rias.hitch(this, "_mouseWheeled"))
			);

			// define a custom constructor for a SliderMover that points back to me
			var mover = rias.declare(_SliderMover, {
				widget: this
			});
			this._mover = new Moveable(this.sliderHandle, {
				mover: mover
			});

			this._layoutHackIE7();
		},
		_onDestroy: function(){
			this._mover.destroy();
			if(this._inProgressAnim && this._inProgressAnim.status !== "stopped"){
				this._inProgressAnim.stop(true);
			}
			this.inherited(arguments);
		},

		_setupChild: function(/*_WidgetBase*/ child, /*int*/ insertIndex){
			this.inherited(arguments);
			function _do(self, pn){
				var i, j, ref;
				if(insertIndex == undefined){
					insertIndex = pn.childNodes.length;
				}
				if(insertIndex >= self._riasrChildren.length){///应该判断 self._riasrChildren 而不是 pn.childNodes，insertIndex 为 lastIndex 的时候，仍然需要判断
					pn.appendChild(child.domNode);
				}else{
					for(i = pn.childNodes.length - 1; i >= 0; i--){
						ref = pn.childNodes[i];
						j = self._riasrChildren.indexOf(rias.by(ref));
						if(j >= 0 && j <= insertIndex){
							break;
						}
					}
					if(ref && j >= 0){/// j >= 0 只响应 riasw
						rias.dom.place(child.domNode, ref, j <= insertIndex ? "after" : "before");
					}else{
						pn.appendChild(child.domNode);
					}
				}
			}

			if(child.sliderPosition === "bottom" || child.sliderPosition === "right"){
				if(this.bottomDecoration !== child.domNode.parentNode){
					_do(this, this.bottomDecoration);
				}
			}else if(this.topDecoration !== child.domNode.parentNode){
				_do(this, this.topDecoration);
			}
		},

		_setPixelValue: function(/*Number*/ pixelValue, /*Number*/ maxPixels, /*Boolean?*/ priorityChange){
			if(this.disabled || this.readOnly){
				return;
			}
			var steps = this.steps;
			if(steps <= 1 || steps > this.maximum - this.minimum){
				steps = this.maximum - this.minimum;// maxPixels;
			}
			var pixelsPerValue = maxPixels / steps;
			var wholeIncrements = Math.round(pixelValue / pixelsPerValue);
			this.set("value", Math.max(Math.min((this.maximum - this.minimum) * wholeIncrements / steps + this.minimum, this.maximum), this.minimum), priorityChange);
		},
		_setValueAttr: function(/*Number*/ value, /*Boolean?*/ priorityChange){
			// summary:
			//		Hook so set('value', value) works.
			/*if(this.restrictValue){
			}*/
			this._set("value", value);
			this.valueNode.value = value;
			this.focusNode.setAttribute("aria-valuenow", value);
			this.inherited(arguments);
			var percent = this.maximum > this.minimum ? ((value - this.minimum) / (this.maximum - this.minimum)) : 0;
			var progressBar = (this._descending === false) ? this.remainingBar : this.progressBar;
			var remainingBar = (this._descending === false) ? this.progressBar : this.remainingBar;
			if(this._inProgressAnim && this._inProgressAnim.status !== "stopped"){
				this._inProgressAnim.stop(true);
			}
			if(priorityChange && this.slideDuration > 0 && progressBar.style[this._progressPixelSize]){
				// animate the slider
				var _this = this;
				var props = {};
				var start = rias.dom.toPixelValue(progressBar, progressBar.style[this._progressPixelSize]);
				var duration = this.slideDuration * (percent - start / 100);
				if(duration === 0){
					return;
				}
				if(duration < 0){
					duration = 0 - duration;
				}
				props[this._progressPixelSize] = {
					start: start,
					end: percent * 100,
					units: "%"
				};
				this._inProgressAnim = rias.fx.animateProperty({ node: progressBar, duration: duration,
					onAnimate: function(v){
						remainingBar.style[_this._progressPixelSize] = (100 - parseFloat(v[_this._progressPixelSize])) + "%";
					},
					onEnd: function(){
						delete _this._inProgressAnim;
					},
					properties: props
				});
				this._inProgressAnim.play();
			}else{
				progressBar.style[this._progressPixelSize] = (percent * 100) + "%";
				remainingBar.style[this._progressPixelSize] = ((1 - percent) * 100) + "%";
			}
		},
		_bumpValue: function(signedChange, /*Boolean?*/ priorityChange){
			if(this.disabled || this.readOnly || (this.maximum <= this.minimum)){
				return;
			}
			var steps = this.steps;
			if(steps <= 1 || steps > this.maximum - this.minimum){
				steps = this.maximum - this.minimum;// rias.dom.getContentBox(this.sliderBarContainer)[this._pixelCount];
			}
			// the division is imprecise so the expression has to be rounded to avoid long floating numbers
			var value = Math.round((this.value - this.minimum) * steps / (this.maximum - this.minimum)) + signedChange;
			if(value < 0){
				value = 0;
			}
			if(value > steps){
				value = steps;
			}
			value = value * (this.maximum - this.minimum) / steps + this.minimum;
			this.set("value", value, priorityChange);
		},
		doStep: function(step){
			this._bumpValue(step);
		},
		decrementEvent: function(/*Event*/ e){
			// summary:
			//		Decrement slider
			// tags:
			//		private
			this._bumpValue(e.keyCode === rias.keys.PAGE_DOWN ? -this.pageIncrement : -1);
		},
		incrementEvent: function(/*Event*/ e){
			// summary:
			//		Increment slider
			// tags:
			//		private
			this._bumpValue(e.keyCode === rias.keys.PAGE_UP ? this.pageIncrement : 1);
		},

		_onKeyUp: function(/*Event*/ e){
			if(this.disabled || this.readOnly || e.altKey || e.ctrlKey || e.metaKey){
				return;
			}
			this.set("value", this.value, true);
		},
		_onKeyDown: function(/*Event*/ e){
			if(this.disabled || this.readOnly || e.altKey || e.ctrlKey || e.metaKey){
				return;
			}
			switch(e.keyCode){
				case rias.keys.HOME:
					this.set("value", this.minimum, false);
					break;
				case rias.keys.END:
					this.set("value", this.maximum, false);
					break;
				// this._descending === false: if ascending vertical (min on top)
				// (this._descending || this.isLeftToRight()): if left-to-right horizontal or descending vertical
				case ((this._descending || this.isLeftToRight()) ? rias.keys.RIGHT_ARROW : rias.keys.LEFT_ARROW):
				case (this._descending === false ? rias.keys.DOWN_ARROW : rias.keys.UP_ARROW):
				case (this._descending === false ? rias.keys.PAGE_DOWN : rias.keys.PAGE_UP):
					this.incrementEvent(e);
					break;
				case ((this._descending || this.isLeftToRight()) ? rias.keys.LEFT_ARROW : rias.keys.RIGHT_ARROW):
				case (this._descending === false ? rias.keys.UP_ARROW : rias.keys.DOWN_ARROW):
				case (this._descending === false ? rias.keys.PAGE_UP : rias.keys.PAGE_DOWN):
					this.decrementEvent(e);
					break;
				default:
					return;
			}
			e.stopPropagation();
			e.preventDefault();
		},
		_isReversed: function(){
			// summary:
			//		Returns true if direction is from right to left
			// tags:
			//		protected extension
			return !this.isLeftToRight();
		},
		_onHandleClick: function(e){
			if(this.disabled || this.readOnly){
				return;
			}
			if(!rias.has("ie")){
				// make sure you get focus when dragging the handle
				// (but don't do on IE because it causes a flicker on mouse up (due to blur then focus)
				rias.dom.focus(this.sliderHandle);
			}
			e.stopPropagation();
			e.preventDefault();
		},
		_onBarClick: function(e){
			if(this.disabled || this.readOnly || !this.clickSelect){
				return;
			}
			rias.dom.focus(this.sliderHandle);
			e.stopPropagation();
			e.preventDefault();
			var abspos = rias.dom.getPosition(this.sliderBarContainer, true);
			var pixelValue = e[this._mousePixelCoord] - abspos[this._startingPixelCoord];
			this._setPixelValue(this._isReversed() ? (abspos[this._pixelCount] - pixelValue) : pixelValue, abspos[this._pixelCount], true);
			this._mover.onMouseDown(e);
		},
		_onClkBumper: function(val){
			if(this.disabled || this.readOnly || !this.clickSelect){
				return;
			}
			this.set("value", val, true);
		},
		_onClkIncBumper: function(){
			this._onClkBumper(this._descending === false ? this.minimum : this.maximum);
		},
		_onClkDecBumper: function(){
			this._onClkBumper(this._descending === false ? this.maximum : this.minimum);
		},
		_mouseWheeled: function(/*Event*/ evt){
			// summary:
			//		Event handler for mousewheel where supported

			if(!this.focused){
				// If use is scrolling over page and we happen to get the mouse wheel event, just ignore it.
				return;
			}

			evt.stopPropagation();
			evt.preventDefault();
			this._bumpValue(evt.wheelDelta < 0 ? -1 : 1, true); // negative scroll acts like a decrement
		},
		_typematicCallback: function(/*Number*/ count, /*Object*/ button, /*Event*/ e){
			if(count === -1){
				this.set("value", this.value, true);
			}else{
				this[(button === (this._descending ? this.incrementButton : this.decrementButton)) ? "decrementEvent" : "incrementEvent"](e);
			}
		}

	});

	Widget._SliderMover = _SliderMover;	// for monkey patching

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "width",
		allowedChild: "riasw.form.SliderLabels, riasw.form.SliderRule",
		"property": {
			"name": {
				"datatype": "string",
				"title": "Name",
				"description": "Name used when submitting form; same as \"name\" attribute or plain HTML elements."
			},
			"alt": {
				"datatype": "string",
				"hidden": true,
				"description": "Corresponds to the native HTML <input> element's attribute."
			},
			"value": {
				"datatype": "number",
				"defaultValue": 0,
				"title": "Value",
				"description": "Corresponds to the native HTML <input> element's attribute."
			},
			"tabIndex": {
				"datatype": "number",
				"defaultValue": "0",
				"title": "Tab Index",
				"description": "Order fields are traversed when user hits the tab key."
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled",
				"description": "Determines if this widget should respond to user input."
			},
			"intermediateChanges": {
				"datatype": "boolean",
				"title": "Intermediate Changes",
				"description": "Fires onChange for each value change or only on demand."
			},
			"showButtons": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Show Buttons",
				"description": "Show increment/decrement buttons at the ends of the slider."
			},
			"minimum": {
				"datatype": "number",
				"defaultValue": 0,
				"title": "Minimum Value",
				"description": "The minimum value the slider can be set to."
			},
			"maximum": {
				"datatype": "number",
				"defaultValue": 100,
				"title": "Maximum Value",
				"description": "The maximum value the slider can be set to."
			},
			"steps": {
				"datatype": "number",
				"defaultValue": null,
				"title": "Discrete Values",
				"description": "If specified, indicates that the slider handle has only 'steps' possible positions, and that after dragging the handle, it will snap to the nearest possible position. Thus, the slider has only 'steps' possible values."
			},
			"pageIncrement": {
				"datatype": "number",
				"defaultValue": 2,
				"title": "Page Increment",
				"description": "If steps is also specified, this indicates the amount of clicks (ie, snap positions) that the slider handle is moved via pageup/pagedown keys. If steps is not specified, it indicates the number of pixels."
			},
			"labelValues": {
				"datatype": "array",
				"defaultValue": "[]",
				"title": "labelValues",
				"description": "Array of text label to render - evenly spaced from left-to-right or bottom-to-top. Alternately, minimum and maximum can be specified, to get numeric label."
			},
			"numericMargin": {
				"datatype": "number",
				"defaultValue": 0,
				"title": "Numeric Margin",
				"description": "Number of generated numeric label that should be rendered as '' on the ends when labelValues[] are not specified"
			},
			"constraints": {
				"datatype": "json",
				"defaultValue": "\"{\\\"pattern\\\":\\\"#%\\\"}\"",
				"description": "pattern, places, lang, et al (see dojo.number) for generated numeric label when labelValues[] are not specified",
				"hidden": true
			},
			"clickSelect": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Click Select",
				"description": "Determines if clicking the slider bar changes the value or not"
			},
			"slideDuration": {
				"datatype": "number",
				"defaultValue": 200,
				"title": "Slide Duration",
				"description": "The time in ms to take to animate the slider handle from 0% to 100%, when clicking the slider bar to make the handle move.. Default is registry.defaultDuration."
			}
		}
	};

	return Widget;

});