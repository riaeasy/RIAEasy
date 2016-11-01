//RIAStudio client runtime widget - CheckButton

define([
	"rias",
	"rias/riasw/form/CheckButton",
	"rias/riasw/form/_RadioButtonMixin"
], function(rias, CheckButton, _RadioButtonMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/form/Button.css"
	//]);

	var riaswType = "rias.riasw.form.RadioButton";
	var Widget = rias.declare(riaswType, [CheckButton, _RadioButtonMixin], {
		templateString:
			'<span data-dojo-attach-point="focusNode,buttonNode" class="dijitReset dijitInline" data-dojo-attach-event="ondijitclick:__onClick" role="button" aria-labelledby="${id}_label">'+
				'<span data-dojo-attach-point="badgeNode" class="${badgeClass}"></span>'+
				'<span data-dojo-attach-point="checkNode" class="dijitInline dijitRadio"></span>'+
				'<span data-dojo-attach-point="iconNode" class="dijitInline dijitIcon riaswButtonIconNode"></span>'+
				'<span data-dojo-attach-point="containerNode,labelNode" class="dijitInline riaswButtonText" role="presentation" id="${id}_label"></span>'+
				'<input data-dojo-attach-point="valueNode" data-dojo-attach-event="onclick:_onClick" role="presentation" type="${type}" value="${value}" class="dijitOffScreen" tabIndex="-1" aria-hidden="true" ${!nameAttrSetting}/>'+
			'</span>',

		baseClass: "riaswRadioButton riaswButtonNode",

		_setCheckedAttr: function(/*Boolean*/ value){
			// If I am being checked then have to deselect currently checked radio button
			this.inherited(arguments);
			if(!this._created){
				return;
			}
			rias.forEach(this._getRelatedWidgets(), rias.hitch(this, function(widget){
				if(widget.checkNode){
					rias.dom.toggleClass(widget.checkNode, "dijitRadioChecked", widget.get("checked"));
				}
			}));
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswRadioButtonIcon",
		iconClass16: "riaswRadioButtonIcon16",
		defaultParams: {
			//content: "<input type='radio' showLabel='true'></input>",
			//value: "on"
		},
		initialSize: {},
		resizable: "none",
		//allowedChild: "",
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
				"defaultValue": "on",
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
				"hidden": true
			},
			"label": {
				"datatype": "string",
				"hidden": true
			},
			"iconClass": {
				"datatype": "string",
				"hidden": true
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