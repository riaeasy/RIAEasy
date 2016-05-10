//RIAStudio client runtime widget - CheckedMultiSelect

define([
	"rias",
	"dojox/form/CheckedMultiSelect"
], function(rias, _Widget) {

	rias.theme.loadRiasCss(["form/CheckedMultiSelect.css"]);

	var riasType = "rias.riasw.form.CheckedMultiSelect";
	var Widget = rias.declare(riasType, [_Widget], {

		_addOptionItem: function(/*dojox.form.__SelectOption*/ option){
			var item;
			if(this.dropDown){
				item = new dojox.form._CheckedMultiSelectMenuItem({
					ownerRiasw: this,
					option: option,
					parent: this.dropDownMenu
				});
				this.dropDownMenu.addChild(item);
			}else{
				item = new dojox.form._CheckedMultiSelectItem({
					ownerRiasw: this,
					option: option,
					parent: this,
					disabled: this.disabled,
					readOnly: this.readOnly
				});
				this.wrapperDiv.appendChild(item.domNode);
			}
			this.onAfterAddOptionItem(item, option);
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswCheckedMultiSelectIcon",
		iconClass16: "riaswCheckedMultiSelectIcon16",
		defaultParams: {
			//content: "<select multiple='true'></select>",
			width: "200px",
			height: "auto",
			type: "text",
			tabIndex: 0,
			size: 7
			//,scrollOnFocus: true
		},
		initialSize: {},
		resizable: "width",
		//allowedChild: "",
		style: "min-width:1em; min-height:1em; width: 200px; height: auto",
		"property": {
			"type": {
				"datatype": "string",
				"defaultValue": "text",
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
				"hidden": true
			},
			"size": {
				"datatype": "number",
				"defaultValue": 7,
				"title": "Size"
			},
			"scrollOnFocus": {
				"datatype": "boolean",
				"description": "On focus, should this widget scroll into view?",
				"hidden": false
			}
		}
	};

	return Widget;

});