//RIAStudio client runtime widget - ToggleButton

define([
	"rias",
	"rias/riasw/form/Button",
	"rias/riasw/form/_ToggleButtonMixin"
], function(rias, Button, _ToggleButtonMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/form/Button.css"
	//]);

	var riaswType = "rias.riasw.form.ToggleButton";
	var Widget = rias.declare(riaswType, [Button, _ToggleButtonMixin], {

		templateString:
			'<span data-dojo-attach-point="focusNode,buttonNode" class="dijitReset dijitInline" data-dojo-attach-event="ondijitclick:__onClick" role="button" aria-labelledby="${id}_label">'+
				'<span data-dojo-attach-point="badgeNode" class="${badgeClass}"></span>'+
				'<span data-dojo-attach-point="checkIconNode" class="dijitInline dijitCheckBox"></span>'+
				'<span data-dojo-attach-point="iconNode" class="dijitInline dijitIcon"></span>'+
				'<span data-dojo-attach-point="containerNode,titleNode,labelNode" class="dijitInline riaswButtonText" role="presentation" id="${id}_label"></span>'+
				'<input data-dojo-attach-point="valueNode" data-dojo-attach-event="onclick:_onClick" role="presentation" type="${type}" value="${value}" class="dijitOffScreen" tabIndex="-1" aria-hidden="true" ${!nameAttrSetting}/>'+
			'</span>',

		baseClass: "riaswToggleButton riaswButtonNode",

		cssStateNodes: {
			//"buttonNode": "riaswButtonNode"
		},

		checked: false

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswToggleButtonIcon",
		iconClass16: "riaswToggleButtonIcon16",
		defaultParams: {
			//content: "<input type='button'></input>",
			//label: "ToggleButton",
			//showLabel: true
		},
		initialSize: {},
		resizable: "none",
		allowedChild: "",
		"property": {
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
			"checked": {
				"datatype": "boolean",
				"title": "Checked"
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