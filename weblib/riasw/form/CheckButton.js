//RIAStudio client runtime widget - CheckButton

define([
	"riasw/riaswBase",
	"riasw/form/ToggleButton",
	"riasw/form/_CheckBoxMixin"
], function(rias, ToggleButton, _CheckBoxMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/form/Button.css"
	//]);

	var riaswType = "riasw.form.CheckButton";
	var Widget = rias.declare(riaswType, [ToggleButton, _CheckBoxMixin], {
		templateString:
			'<div data-dojo-attach-point="focusNode,buttonNode" class="dijitReset" data-dojo-attach-event="ondijitclick:__onClick" role="button" aria-labelledby="${id}_label">'+
				//'<div data-dojo-attach-point="badgeNode" class="${badgeClass}"></div>'+
				'<div data-dojo-attach-point="checkNode" class="${checkNodeClass}"></div>'+
				/// 有 labelNode，可以定位，可以动态创建
				//'<div data-dojo-attach-point="iconNode" class="riaswButtonIcon riaswNoIcon"></div>'+
				/// 需要显式定义 labelNode，便于定位
				'<div data-dojo-attach-point="labelNode" class="riaswButtonLabel riaswNoLabel" role="presentation" id="${id}_label"></div>'+
				'<input data-dojo-attach-point="valueNode" data-dojo-attach-event="onclick:_onClick" ' +
					'role="presentation" type="${type}" value="${value}" class="dijitOffScreen" tabIndex="-1" aria-hidden="true" ${!nameAttrSetting}/>'+
			'</div>',
		baseClass: "riaswButton riaswCheckButton",
		checkNodeClass: "riaswCheckBox",
		showCheckNode: true,

		_setReadOnlyAttr: function(/*Boolean*/ value){
			this.inherited(arguments);
			if(this.checkNode){
				rias.dom.toggleClass(this.checkNode, this.checkNodeClass + "ReadOnly", value);
			}
		},
		_setDisabledAttr: function(/*Boolean*/ value){
			// Additional code to set disabled state of ComboBox node.
			// Overrides _FormWidgetMixin._setDisabledAttr() or ValidationTextBox._setDisabledAttr().
			this.inherited(arguments);
			if(this.checkNode){
				rias.dom.toggleClass(this.checkNode, this.checkNodeClass + "Disabled", value);
			}
		},
		_setCheckedAttr: function(/*Boolean*/ value){
			this.inherited(arguments);
			if(this.checkNode){
				rias.dom.toggleClass(this.checkNode, this.checkNodeClass + "Checked", value);
			}
		},
		_setValueAttr: function(/*String|Boolean*/ newValue, /*Boolean*/ priorityChange){
			// summary:
			//		Handler for value= attribute to constructor, and also calls to
			//		set('value', val).
			// description:
			//		During initialization, just saves as attribute to the `<input type=checkbox>`.
			//
			//		After initialization,
			//		when passed a boolean, controls whether or not the CheckBox is checked.
			//		If passed a string, changes the value attribute of the CheckBox (the one
			//		specified as "value" when the CheckBox was constructed
			//		(ex: `<input data-dojo-type="riasw/form/CheckBox" value="chicken">`).
			//
			//		`widget.set('value', string)` will check the checkbox and change the value to the
			//		specified string.
			//
			//		`widget.set('value', boolean)` will change the checked state.

			if(typeof newValue === "string"){
				this.inherited(arguments);
				newValue = true;
			}
			if(this._created){
				this.set('checked', newValue, priorityChange);
			}
		},
		_getValueAttr: function(){
			// summary:
			//		Hook so get('value') works.
			// description:
			//		If the CheckBox is checked, returns the value attribute.
			//		Otherwise returns false.
			return this.checked && this._get("value");
		}

	});

	Widget._riasdMeta = {
		visual: true,
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
			}
		}
	};

	return Widget;

});