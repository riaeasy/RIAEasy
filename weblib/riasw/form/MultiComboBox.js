//RIAStudio client runtime widget - MultiComboBox

define([
	"riasw/riaswBase",
	"riasw/form/ValidationTextBox",
	"riasw/form/ComboBoxMixin"
], function(rias, ValidationTextBox, ComboBoxMixin) {

	var riaswType = "riasw.form.MultiComboBox";
	var Widget = rias.declare(riaswType, [ValidationTextBox, ComboBoxMixin], {

		delimiter: ",",

		_previousMatches: false,

		_setValueAttr: function(value){
			if(this.delimiter && value.length !== 0){
				value = value + this.delimiter+" ";
				arguments[0] = this._addPreviousMatches(value);
			}
			this.inherited(arguments);
		},

		_addPreviousMatches: function(/*String*/ text){
			if(this._previousMatches){
				if(!text.match(new RegExp("^" + this._previousMatches))){
					text = this._previousMatches+text;
				}
				text = this._cleanupDelimiters(text);
			}
			return text; // String
		},

		_cleanupDelimiters: function(/*String*/ text){
			if(this.delimiter){
				text = text.replace(new RegExp("  +"), " ");
				text = text.replace(new RegExp("^ *" + this.delimiter+"* *"), "");
				text = text.replace(new RegExp(this.delimiter+" *" + this.delimiter), this.delimiter);
			}
			return text;
		},

		_autoCompleteText: function(/*String*/ text){
			arguments[0] = this._addPreviousMatches(text);
			this.inherited(arguments);
		},

		_startSearch: function(/*String*/ text){
			text = this._cleanupDelimiters(text);
			var re = new RegExp("^.*" + this.delimiter+" *");

			if((this._previousMatches = text.match(re))){
				arguments[0] = text.replace(re, "");
			}
			this.inherited(arguments);
		}

	});

	Widget._riasdMeta = {
		visual: true,
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
			"constraints": {
				"datatype": "json",
				"defaultValue": "\"{}\"",
				"title": "Constraints",
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
			"delimiter": {
				"datatype": "string",
				"defaultValue": ",",
				"title": "Delimiter"
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