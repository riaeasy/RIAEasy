//RIAStudio client runtime widget - ComboBox

define([
	"rias",
	"rias/riasw/form/ValidationTextBox",
	"rias/riasw/form/ComboBoxMixin",
	"dojo/store/util/QueryResults"
], function(rias, _Widget, ComboBoxMixin, QueryResults) {

	var riasType = "rias.riasw.form.ComboBox";
	var Widget = rias.declare(riasType, [_Widget, ComboBoxMixin], {
		/*templateString:
			'<div class="dijit dijitReset dijitInline dijitLeft" data-dojo-attach-point="_popupStateNode" id="widget_${id}" role="combobox" aria-haspopup="true">'+
				'<div class="dijitReset riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_labelNode" tabIndex="-1" readonly="readonly" role="presentation"></div>'+
				'<div class="dijitReset dijitInputField dijitInputContainer riaswTextBoxContainer" data-dojo-attach-point="containerNode,_aroundNode">'+
					'<input class="dijitReset dijitInputInner" data-dojo-attach-point="textbox,focusNode" type="text" autocomplete="off" aria-labelledby="${id}_labelNode" role="textbox" ${!nameAttrSetting}/>'+
					'<div class="dijitReset dijitValidationContainer" data-dojo-attach-point="validationNode">'+
						'<input class="dijitReset dijitInputField dijitValidationIcon dijitValidationInner" value="&#935;" type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
					'</div>'+
				'</div>'+
				'<div class="dijitReset dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer" data-dojo-attach-point="_buttonNode" role="presentation">'+
					'<input class="dijitReset dijitInputField dijitArrowButtonInner" value="&#9660;" type="text" tabIndex="-1" readonly="readonly" role="button presentation" aria-hidden="true" ${_buttonInputDisabled}/>'+
				'</div>'+
			'</div>',*/

		openOnfocus: true,

		destroy: function(){
			if(this.dropDown){
				rias.destroy(this.dropDown);
			}
			this.inherited(arguments);
		},

		/*filter: function(val, item){
			if(val === null){
				return this._blankValue;
			}
			if(item && this.allwaysFilter){
				if(this.labelAttr){
					val = item[this.labelAttr].toString();
				}else{
					val = item[this.searchAttr].toString();
				}
			}
			if(typeof val != "string"){
				return val;
			}
			if(this.trim){
				val = rias.trim(val);
			}
			if(this.uppercase){
				val = val.toUpperCase();
			}
			if(this.lowercase){
				val = val.toLowerCase();
			}
			if(this.propercase){
				val = val.replace(/[^\s]+/g, function(word){
					return word.substring(0, 1).toUpperCase() + word.substring(1);
				});
			}
			return val;
		},*/
		//parse: function(value /*=====, constraints =====*/){
		//	if(this.item && this.allwaysFilter){
		//		return this.item[this.searchAttr];
		//	}
		//	return value;
		//},
		/*_getDisplayedValueAttr: function(){
			var text = "";
			try{
				//return this.filter(this.textbox.value);
				if(this.item){
					text = this.labelFunc(this.item, this.store);
				}else{
					text = this.filter(this.value);
				}
			}catch(e){
				console.error(this, "_getDisplayedValueAttr() error: ", rias.captureStackTrace(e));
				text = this.filter(this.value, this.item);
			}
			return text.toString();
		},*/
		/*_getValueField: function(){
			return this.valueAttr || this.searchAttr;
		},
		_getValueAttr: function(){
			return this.inherited(arguments);
		},
		_setValueAttr: function(value, priorityChange, displayedValue, item){
			this.value = value;
			displayedValue = (displayedValue == undefined ? this.get("displayedValue") : displayedValue);
			this.inherited(arguments, [value, priorityChange, displayedValue, item || this.item]);
		},*/

		onFocus: function(){
			if(this.openOnfocus && !this.disabled && !this.readOnly){
				if(!this.get("editable")){
					this.loadAndOpenDropDown();
				}
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswComboBoxIcon",
		iconClass16: "riaswComboBoxIcon16",
		defaultParams: function(params){
			params = rias.mixinDeep({}, {
				type: "text",
				//labelType: "html",
				//label: "ComboBox",
				invalidMessage: rias.i18n.message.invalid,
				constraints: {locale: ""},
				//regExp: ".*",
				//pageSize: null,
				query: {},
				queryExpr: "${0}*",
				autoComplete: true,
				searchDelay: 200,
				//searchAttr: "id",
				ignoreCase: true,
				hasDownArrow: true,
				highlightMatch: "first"
			}, params);
			if(!params.store && !this.srcNodeRef){///注意：!params.store && this.srcNodeRef 的时候，默认是取 srcNodeRef 中的数据。
				params.store = {
					_riaswType: "rias.riasw.store.MemoryStore"
				};
				if(params.data){
					params.store.data = params.data;
				}
			}
			if(params.idAttribute){
				params.store.idAttribute = params.idAttribute;
				//params.idAttribute = undefined;
			}
			return params;
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
				"defaultValue": "The value entered is not valid.",
				"title": "Invalid Message",
				"hidden": true
			},
			"constraints": {
				"datatype": "json",
				"defaultValue": "\"{\\\"locale\\\":\\\"\\\"}\"",
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
				"defaultValue": "id",
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
			"state": {
				"datatype": "string",
				"description": "Shows current state (ie, validation result) of input (Normal, Warning, or Error)",
				"hidden": true
			},
			"scrollOnFocus": {
				"datatype": "boolean",
				"description": "On focus, should this widget scroll into view?",
				"hidden": false,
				"defaultValue": true
			},
			"item": {
				"datatype": "object",
				"description": "This is the item returned by the dojo.data.store implementation that\nprovides the data for this cobobox, it's the currently selected item.",
				"hidden": true
			},
			"fetchProperties": {
				"datatype": "json",
				"description": "Mixin to the dojo.data store's fetch.\nFor example, to set the sort order of the ComboBox menu, pass:\n\t{ sort: {attribute:\"name\",descending: true} }\nTo override the default queryOptions so that deep=false, do:\n\t{ queryOptions: {ignoreCase: true, deep: false} }",
				"hidden": true
			},
			"highlightMatch": {
				"datatype": "string",
				"defaultValue": "first",
				"option": [
					{
						"value": "first"
					},
					{
						"value": "all"
					},
					{
						"value": "none"
					}
				],
				"description": "One of: \"first\", \"all\" or \"none\".\n\nIf the ComboBox/FilteringSelect opens with the search results and the searched\nstring can be found, it will be highlighted.  If set to \"all\"\nthen will probably want to change queryExpr parameter to '*${0}*'\n\nHighlighting is only performed when labelType is \"text\", so as to not\ninterfere with any HTML markup an HTML label might contain.",
				"hidden": false
			},
			"labelAttr": {
				"datatype": "string",
				"description": "The entries in the drop down list come from this attribute in the\ndojo.data items.\nIf not specified, the searchAttr attribute is used instead.",
				"hidden": false
			},
			"labelType": {
				"datatype": "string",
				"option": [
					{
						"value": "text"
					},
					{
						"value": "html"
					}
				],
				"description": "Specifies how to interpret the labelAttr in the data store items.\nCan be \"html\" or \"text\".",
				"defaultValue": "text",
				"title": "Label Type"
			}
		}
	};

	return Widget;

});