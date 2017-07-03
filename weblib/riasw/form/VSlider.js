//RIAStudio client runtime widget - VerticalSlider

define([
	"riasw/riaswBase",
	"riasw/form/HSlider"
], function(rias, HSlider) {

	var riaswType = "riasw.form.VSlider";

	var Widget = rias.declare(riaswType, [HSlider], {
		// summary:
		//		A form widget that allows one to select a value with a vertically draggable handle

		templateString:
			'<table data-dojo-attach-point="containerNode" class="dijitReset" data-dojo-attach-event="onkeydown:_onKeyDown,onkeyup:_onKeyUp" cellspacing="0" cellpadding="0" border="0" border-collapse="collapse" border-spacing="0" frame="void" rules="none" role="presentation">' +
				'<tr class="dijitReset">' +
					'<td class="dijitReset"></td>' +
					'<td class="dijitReset riaswSliderButtonContainer" align="center">' +
						'<div class="riaswSliderIncrementIcon" data-dojo-attach-point="decrementButton"><span class="riaswSliderButtonInner">+</span></div>' +
					'</td><td class="dijitReset">' +
					'</td>' +
				'</tr><tr class="dijitReset">' +
					'<td class="dijitReset"></td>' +
					'<td class="dijitReset" align="center">' +
						'<div class="riaswSliderBar riaswSliderTopBumper" data-dojo-attach-event="press:_onClkIncBumper"></div>' +
					'</td><td class="dijitReset"></td>' +
				'</tr><tr class="dijitReset">' +
					'<td data-dojo-attach-point="topDecoration" class="dijitReset riaswSliderDecoration riaswSliderDecorationLeft"></td>' +
					'<td class="dijitReset riaswSliderBarContainer" align="center" data-dojo-attach-point="sliderBarContainer">' +
						'<input data-dojo-attach-point="valueNode" type="hidden" ${!nameAttrSetting}/>' +
						//'<div class="dijitReset riaswSliderBarContainer" role="presentation" data-dojo-attach-point="sliderBarContainer">' +
							'<div role="presentation" data-dojo-attach-point="remainingBar" class="riaswSliderBar riaswSliderRemainingBar" data-dojo-attach-event="press:_onBarClick"><!--#5629--></div>' +
							'<div role="presentation" data-dojo-attach-point="progressBar" class="riaswSliderBar riaswSliderProgressBar" data-dojo-attach-event="press:_onBarClick">' +
								'<div class="riaswSliderMoveable">' +
									'<div data-dojo-attach-point="sliderHandle,focusNode" class="riaswSliderImageHandle" data-dojo-attach-event="press:_onHandleClick" role="slider"></div>' +
								'</div>' +
							'</div>' +
						//'</div>' +
					'</td><td data-dojo-attach-point="bottomDecoration" class="dijitReset riaswSliderDecoration riaswSliderDecorationRight"></td>' +
				'</tr><tr class="dijitReset">' +
					'<td class="dijitReset"></td>' +
					'<td class="dijitReset" align="center">' +
						'<div class="riaswSliderBar riaswSliderBottomBumper" data-dojo-attach-event="press:_onClkDecBumper"></div>' +
					'</td><td class="dijitReset"></td>' +
				'</tr><tr class="dijitReset">' +
					'<td class="dijitReset"></td>' +
					'<td class="dijitReset riaswSliderButtonContainer" align="center">' +
						'<div class="riaswSliderDecrementIcon" data-dojo-attach-point="incrementButton"><span class="riaswSliderButtonInner">-</span></div>' +
					'</td><td class="dijitReset"></td>' +
				'</tr>' +
			'</table>',

		baseClass: "riaswSlider riaswSliderV",

		_isVertical: true,

		_mousePixelCoord: "pageY",
		_pixelCount: "h",
		_startingPixelCoord: "y",
		_handleOffsetCoord: "top",
		_progressPixelSize: "height",

		// _descending: Boolean
		//		Specifies if the slider values go from high-on-top (true), or low-on-top (false)
		//		TODO: expose this in 1.2 - the css progress/remaining bar classes need to be reversed
		_descending: true,

		_isReversed: function(){
			// summary:
			//		Overrides HorizontalSlider._isReversed.
			//		Indicates if values are high on top (with low numbers on the bottom).
			return this._descending;
		}

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "height",
		allowedChild: "riasw.form.VRuleLabels, riasw.form.VRule",
		"property": {
			"type": {
				"datatype": "string",
				"defaultValue": "text",
				"description": "Corresponds to the native HTML <input> element's attribute.",
				"hidden": true
			},
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