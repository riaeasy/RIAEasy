//RIAStudio client runtime widget - ToggleButton

define([
	"rias",
	"rias/riasw/form/Button",
	"dijit/form/_ToggleButtonMixin"
], function(rias, Button, _ToggleButtonMixin) {

	//rias.theme.loadRiasCss([
	//	"form/Button.css"
	//]);

	var riasType = "rias.riasw.form.ToggleButton";
	var Widget = rias.declare(riasType, [Button, _ToggleButtonMixin], {

		templateString:
			'<span data-dojo-attach-point="focusNode,buttonNode" class="dijitReset dijitInline dijitStretch dijitButtonNode dijitButtonContents" data-dojo-attach-event="ondijitclick:__onClick" role="button" aria-labelledby="${id}_label">'+
				'<span data-dojo-attach-point="badgeNode" class="${badgeClass}"></span>'+
				'<span data-dojo-attach-point="checkIconNode" class="dijitReset dijitInline dijitCheckBoxIcon"></span>'+
				'<span data-dojo-attach-point="iconNode" class="dijitReset dijitInline dijitIcon"></span>'+
				//'<span class="dijitReset dijitToggleButtonIconChar">&#x25CF;</span>'+
				'<span role="presentation" data-dojo-attach-point="containerNode,titleNode,labelNode" class="dijitReset dijitInline dijitButtonText" id="${id}_label"></span>'+
				'<input role="presentation" data-dojo-attach-point="valueNode" data-dojo-attach-event="onclick:_onClick" type="${type}" value="${value}" class="dijitOffScreen" tabIndex="-1" aria-hidden="true" ${!nameAttrSetting}/>'+
			'</span>',

		baseClass: "dijitToggleButton dijitButtonNode"

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswToggleButtonIcon",
		iconClass16: "riaswToggleButtonIcon16",
		defaultParams: {
			//content: "<input type='button'></input>",
			//label: "ToggleButton",
			//iconClass: "dijitCheckBoxIcon",
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
			"iconClass": {
				"datatype": "string",
				"defaultValue": "dijitCheckBoxIcon",
				"title": "Icon Class"
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