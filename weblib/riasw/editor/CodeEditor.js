
define([
	"riasw/riaswBase",
	"riasw/editor/OrionEditor"
], function(rias, OrionEditor) {

	var riaswType = "riasw.editor.CodeEditor";
	var Widget = rias.declare(riaswType, OrionEditor, {
		postscript: function(/*Object?*/params, /*DomNode|String*/srcNodeRef){
			if(rias.has("ie") < 9){
				console.error("The riasw.editor.CodeEditor require IE 9+.");
			}
			//this.create(params, srcNodeRef);
			this.inherited(arguments);
		}
	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "width",
		//allowedChild: "",
		"property": {
			"name": {
				"datatype": "string",
				"title": "Name"
			},
			"maxLength": {
				"datatype": "string",
				"title": "MaxLength"
			},
			"alt": {
				"datatype": "string",
				"hidden": true
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
			"cols": {
				"datatype": "string",
				"hidden": false
			},
			"rows": {
				"datatype": "number",
				"description": "The number of characters per line.",
				"hidden": false
			},
			"trim": {
				"datatype": "boolean",
				"description": "Removes leading and trailing whitespace if true.  Default is false.",
				"hidden": false
			},
			"uppercase": {
				"datatype": "boolean",
				"description": "Converts all characters to uppercase if true.  Default is false.",
				"hidden": false
			},
			"lowercase": {
				"datatype": "boolean",
				"description": "Converts all characters to lowercase if true.  Default is false.",
				"hidden": false
			},
			"propercase": {
				"datatype": "boolean",
				"description": "Converts the first character of each word to uppercase if true.",
				"hidden": false
			}
		}
	};

	return Widget;

});

