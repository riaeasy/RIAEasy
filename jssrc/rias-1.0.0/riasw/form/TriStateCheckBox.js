//RIAStudio client runtime widget - TriStateCheckBox

define([
	"rias",
	"dojox/form/TriStateCheckBox"
], function(rias, _Widget) {

	//rias.loadRiasCss(["dojox/form/resources/TriStateCheckBox.css"]);

	var riasType = "rias.riasw.form.TriStateCheckBox";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTriStateCheckBoxIcon",
		iconClass16: "riaswTriStateCheckBoxIcon16",
		defaultParams: {
			//content: "<input></input>",
			states: "false, mixed, true",
			checked: "false",
			state: ""
		},
		initialSize: {},
		resizable: "none",
		//allowedChild: "",
		"property": {
			"name": {
				"datatype": "string",
				"title": "Name"
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
			"state": {
				"datatype": "string",
				"option": [
					{
						"value": ""
					},
					{
						"value": "Error"
					}
				],
				"defaultValue": "",
				"title": "State"
			},
			"checked": {
				"datatype": "string",
				"option": [
					{
						"value": "true"
					},
					{
						"value": "mixed"
					},
					{
						"value": "false"
					}
				],
				"defaultValue": "false",
				"title": "Checked"
			},
			"states": {
				"datatype": "string",
				"defaultValue": "false, mixed, true",
				"title": "States"
			}
		}
	};

	return Widget;

});