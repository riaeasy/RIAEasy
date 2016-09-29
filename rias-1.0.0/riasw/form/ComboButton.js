//RIAStudio client runtime widget - ComboButton

define([
	"rias",
	"rias/riasw/form/DropDownButton"
], function(rias, _Widget) {

	//rias.theme.loadThemeCss([
	//	"riasw/form/Button.css"
	//]);

	var riaswType = "rias.riasw.form.ComboButton";
	var Widget = rias.declare(riaswType, [_Widget], {

		templateString:
			'<span data-dojo-attach-point="focusNode,buttonNode,_arrowWrapperNode" class="dijitReset dijitInline" data-dojo-attach-event="ondijitclick:__onClick,onkeydown:_onButtonKeyDown" role="button" aria-labelledby="${id}_label">' +
				'<span data-dojo-attach-point="badgeNode" class="${badgeClass}"></span>'+
				'<span class="dijitInline dijitIcon" data-dojo-attach-point="iconNode" role="presentation"></span>' +
				'<span class="dijitInline riaswButtonText" data-dojo-attach-point="containerNode,titleNode,labelNode" id="${id}_label" role="presentation"></span>' +
				'<span class="dijitInline riaswArrowButton riaswDownArrowButton riaswArrowButtonContainer" data-dojo-attach-point="_popupStateNode,_buttonNode" data-dojo-attach-event="onkeydown:_onArrowKeyDown" id="${id}_arrow" role="button">'+
					'<input class="dijitInputField riaswArrowButtonInner" type="text" tabIndex="-1" readonly="readonly" role="button presentation" aria-hidden="true" ${_buttonInputDisabled}/>'+
				'</span>'+
				'<input data-dojo-attach-point="valueNode" class="dijitOffScreen" role="presentation" tabIndex="-1" aria-hidden="true" data-dojo-attach-event="onclick:_onClick" type="${type}" value="${value}" ${!nameAttrSetting}/>' +
			'</span>',

		_buttonInputDisabled: rias.has("ie") ? "disabled" : "", // allows IE to disallow focus, but Firefox cannot be disabled for mousedown events

		// Map widget attributes to DOMNode attributes.
		_setIdAttr: "", // override _FormWidgetMixin which puts id on the focusNode
		_setTabIndexAttr: ["_popupStateNode", "titleNode"],
		_setTitleAttr: "titleNode",

		// optionsTitle: String
		//		Text that describes the options menu (accessibility)
		optionsTitle: "",

		baseClass: "riaswComboButton riaswButtonNode",

		// Set classes like riaswButtonContentsHover or riaswArrowButtonActive depending on
		// mouse action over specified node
		cssStateNodes: {
			//"buttonNode": "riaswButtonNode",
			"_popupStateNode": "riaswArrowButton"
		},

		_focusedNode: null,

		_onButtonKeyDown: function(/*Event*/ evt){
			// summary:
			//		Handler for right arrow key when focus is on left part of button
			if(evt.keyCode == rias.keys[this.isLeftToRight() ? "RIGHT_ARROW" : "LEFT_ARROW"]){
				rias.dom.focus(this._popupStateNode);
				evt.stopPropagation();
				evt.preventDefault();
			}
		},

		_onArrowKeyDown: function(/*Event*/ evt){
			// summary:
			//		Handler for left arrow key when focus is on right part of button
			if(evt.keyCode == rias.keys[this.isLeftToRight() ? "LEFT_ARROW" : "RIGHT_ARROW"]){
				rias.dom.focus(this.titleNode);
				evt.stopPropagation();
				evt.preventDefault();
			}
		},

		focus: function(/*String*/ position){
			// summary:
			//		Focuses this widget to according to position, if specified,
			//		otherwise on arrow node
			// position:
			//		"start" or "end"
			if(!this.disabled){
				rias.dom.focus(position == "start" ? this.titleNode : this._popupStateNode);
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswComboButtonIcon",
		iconClass16: "riaswComboButtonIcon16",
		defaultParams: {
			//content: "<span></span>",
			type: "button",
			showLabel: true,
			optionsTitle: "combo options"
		},
		initialSize: {},
		resizable: "none",
		//allowedChild: "",
		"property": {
			"type": {
				"datatype": "string",
				"defaultValue": "button",
				"hidden": true
			},
			"name": {
				"datatype": "string",
				"title": "Name"
			},
			"alt": {
				"datatype": "string",
				"hidden": true
			},
			"value": {
				"datatype": "string",
				"title": "Value"
			},
			"dropDown": {
				"datatype": "object",
				"title": "Popup",
				"isData": true
			},
			"tabIndex": {
				"datatype": "string",
				"defaultValue": "0",
				"title": "Tab Index"
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled"
			},
			"readOnly": {
				"datatype": "boolean",
				"hidden": true
			},
			"intermediateChanges": {
				"datatype": "boolean",
				"hidden": true
			},
			"label": {
				"datatype": "string",
				"title": "Label"
			},
			"showLabel": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Show Label"
			},
			"iconClass": {
				"datatype": "string",
				"title": "Icon Class"
			},
			"optionsTitle": {
				"datatype": "string",
				"defaultValue": "combo options",
				"description": "Text that describes the options menu (accessibility)",
				"hidden": false
			},
			"dropDownPosition": {
				"datatype": "array",
				"description": "TODO: changes the direction of the arrow and placement of menu.",
				"option": [
					{
						"value": "[before]"
					},
					{
						"value": "[after]"
					},
					{
						"value": "[above]"
					},
					{
						"value": "[below]"
					}
				],
				"title": "Dropdown Position",
				"hidden": true
			},
			"scrollOnFocus": {
				"datatype": "boolean",
				"description": "On focus, should this widget scroll into view?",
				"hidden": false,
				"defaultValue": true
			}
		}
	};

	return Widget;

});