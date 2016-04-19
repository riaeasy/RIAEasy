//RIAStudio client runtime widget - MultiComboBox

define([
	"rias",
	"dojox/form/MultiComboBox",
	"rias/riasw/form/ComboBox"///extend(templateString)
], function(rias, _Widget) {

	_Widget.extend({
		templateString:
			'<div class="dijit dijitReset dijitInline dijitLeft" id="widget_${id}" role="combobox" aria-haspopup="true" data-dojo-attach-point="_popupStateNode">'+
				'<div class="dijitReset riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_labelNode" tabIndex="-1" readonly="readonly" role="presentation">'+
				'</div>'+
				'<div class="dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer"'+
					'data-dojo-attach-point="_buttonNode" role="presentation">'+
					'<input class="dijitReset dijitInputField dijitArrowButtonInner" value="&#9660;" type="text" tabIndex="-1" readonly="readonly" role="button presentation" aria-hidden="true"'+
						'${_buttonInputDisabled}/>'+
				'</div>'+
				'<div class="dijitReset dijitValidationContainer" data-dojo-attach-point="validationNode">'+
					'<input class="dijitReset dijitInputField dijitValidationIcon dijitValidationInner" value="&#935;" type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
				'</div>'+
				'<div class="dijitReset dijitInputField dijitInputContainer riaswTextBoxContainer" data-dojo-attach-point="containerNode">'+
					'<input class="dijitReset dijitInputInner" type="text" data-dojo-attach-point="textbox,focusNode" aria-labelledby="${id}_labelNode" autocomplete="off" role="textbox" ${!nameAttrSetting}/>'+
				'</div>'+
			'</div>'
	});

	var riasType = "rias.riasw.form.MultiComboBox";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswMultiComboBoxIcon",
		iconClass16: "riaswMultiComboBoxIcon16",
		defaultParams: {
			//content: "<select></select>",
			type: "text",
			labelType: "text",
			label: "MultiComboBox",
			tabIndex: 0,
			invalidMessage: rias.i18n.message.invalid,
			constraints: {},
			//regExp: ".*",
			//pageSize: null,
			query: {},
			queryExpr: "${0}*",
			autoComplete: true,
			searchDelay: 200,
			searchAttr: "name",
			ignoreCase: true,
			hasDownArrow: true,
			delimiter: ",",
			//scrollOnFocus: true,
			highlightMatch: "first"
		},
		initialSize: {},
		resizable: "width",
		//allowedChild: "",
		"property": {
			"type": {
				"datatype": "string",
				"option": [
					{
						"value": "text"
					},
					{
						"value": "password"
					}
				],
				"defaultValue": "text",
				"title": "Type"
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
				"title": "Read Only"
			},
			"intermediateChanges": {
				"datatype": "boolean",
				"title": "Intermediate Changes"
			},
			"trim": {
				"datatype": "boolean",
				"hidden": true
			},
			"uppercase": {
				"datatype": "boolean",
				"hidden": true
			},
			"lowercase": {
				"datatype": "boolean",
				"hidden": true
			},
			"propercase": {
				"datatype": "boolean",
				"hidden": true
			},
			"maxLength": {
				"datatype": "string",
				"title": "Max Length"
			},
			"required": {
				"datatype": "boolean",
				"title": "Required",
				"hidden": true
			},
			"promptMessage": {
				"datatype": "string",
				"title": "Prompt Message",
				"hidden": true
			},
			"invalidMessage": {
				"datatype": "string",
				"defaultValue": "$_unset_$",
				"title": "Invalid Message",
				"hidden": true
			},
			"constraints": {
				"datatype": "json",
				"defaultValue": "\"{}\"",
				"title": "Constraints",
				"hidden": true
			},
			"regExp": {
				"datatype": "string",
				"defaultValue": ".*",
				"title": "Regular Expression",
				"hidden": true
			},
			"pageSize": {
				"datatype": "number",
				"defaultValue": null,
				"title": "Page Size"
			},
			"store": {
				"datatype": "object",
				"hidden": true
			},
			"query": {
				"datatype": "json",
				"defaultValue": "\"{}\"",
				"hidden": true
			},
			"autoComplete": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Auto Complete"
			},
			"searchDelay": {
				"datatype": "number",
				"defaultValue": 100,
				"title": "Search Delay",
				"description": "Search delay (ms)"
			},
			"searchAttr": {
				"datatype": "string",
				"defaultValue": "name",
				"title": "Search Attribute"
			},
			"queryExpr": {
				"datatype": "string",
				"defaultValue": "${0}*",
				"title": "Query Expression"
			},
			"ignoreCase": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Ignore Case"
			},
			"hasDownArrow": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Show Down Arrow"
			},
			"delimiter": {
				"datatype": "string",
				"defaultValue": ",",
				"title": "Delimiter"
			},
			"scrollOnFocus": {
				"datatype": "boolean",
				"description": "On focus, should this widget scroll into view?",
				"hidden": false
			},
			"fetchProperties": {
				"datatype": "json",
				"description": "Mixin to the dojo.data store's fetch.\nFor example, to set the sort order of the ComboBox menu, pass:\n\t{ sort: {attribute:\"name\",descending: true} }\nTo override the default queryOptions so that deep=false, do:\n\t{ queryOptions: {ignoreCase: true, deep: false} }",
				"hidden": true
			},
			"highlightMatch": {
				"datatype": "string",
				"description": "One of: \"first\", \"all\" or \"none\".\n\nIf the ComboBox/FilteringSelect opens with the search results and the searched\nstring can be found, it will be highlighted.  If set to \"all\"\nthen will probably want to change queryExpr parameter to '*${0}*'\n\nHighlighting is only performed when labelType is \"text\", so as to not\ninterfere with any HTML markup an HTML label might contain.",
				"hidden": false,
				"defaultValue": "first"
			},
			"labelAttr": {
				"datatype": "string",
				"description": "The entries in the drop down list come from this attribute in the\ndojo.data items.\nIf not specified, the searchAttr attribute is used instead.",
				"hidden": false
			},
			"labelType": {
				"datatype": "string",
				"description": "Specifies how to interpret the labelAttr in the data store items.\nCan be \"html\" or \"text\".",
				"hidden": false,
				"defaultValue": "text"
			},
			"state": {
				"datatype": "string",
				"description": "Shows current state (ie, validation result) of input (Normal, Warning, or Error)",
				"hidden": true
			},
			"item": {
				"datatype": "object",
				"description": "This is the item returned by the dojo.data.store implementation that\nprovides the data for this cobobox, it's the currently selected item.",
				"hidden": true
			}
		}
	};

	return Widget;

});