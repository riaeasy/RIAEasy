define([
	"riasw/riaswBase",
	"riasw/form/ToggleButton",
	"riasw/form/_CheckBoxMixin"
], function(rias, ToggleButton, _CheckBoxMixin){

	// module:
	//		riasw/form/CheckBox

	var riaswType = "riasw.form.CheckBox";
	var Widget = rias.declare(riaswType, [ToggleButton, _CheckBoxMixin], {
		// summary:
		//		Same as an HTML checkbox, but with fancy styling.
		//
		// description:
		//		User interacts with real html inputs.
		//		On onclick (which occurs by mouse click, space-bar, or
		//		using the arrow keys to switch the selected radio button),
		//		we update the state of the checkbox/radio.
		//
		//		There are two modes:
		//
		//		1. High contrast mode
		//		2. Normal mode
		//
		//		In case 1, the regular html inputs are shown and used by the user.
		//		In case 2, the regular html inputs are invisible but still used by
		//		the user. They are turned quasi-invisible and overlay the background-image.

		/// 需要 dijitCheckBoxInput 兼容 dojo/touch
		templateString:
			'<div class="dijitReset" data-dojo-attach-point="focusNode,buttonNode" data-dojo-attach-event="ondijitclick:__onClick" role="presentation">' +
				'<input data-dojo-attach-point="valueNode" data-dojo-attach-event="onclick:_onClick" class="dijitReset dijitCheckBoxInput riaswCheckBoxInput dijitOffScreen" tabIndex="-1" ' +
					'type="${type}" role="${type}" aria-checked="false" ${!nameAttrSetting} ${checkedAttrSetting}/>' +
			'</div>',

		baseClass: "riaswCheckBox",

		showLabel: false,
		_setLabelAttr: null,///必须为 null，不可为 undefined，以正确覆盖基类，避免创建 labelNode
		// Override behavior from Button, since we don't have an iconNode or valueNode
		_setIconClassAttr: null,
		_setNameAttr: "focusNode",

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
		},

		postMixInProperties: function(){
			this.inherited(arguments);

			// Need to set initial checked state via node.setAttribute so that form submit works
			// and IE8 radio button tab order is preserved.
			// domAttr.set(node, "checked", bool) doesn't work on IE until node has been attached
			// to <body>, see #8666
			this.checkedAttrSetting = "";
		},

		 _fillContent: function(){
			// Override Button::_fillContent() since it doesn't make sense for CheckBox,
			// since CheckBox doesn't even have a container
		},

		_onFocus: function(){
			if(this.id){
				rias.dom.query("label[for='" + this.id + "']").addClass("riaswCheckBoxFocusedLabel");
			}
			this.inherited(arguments);
		},

		_onBlur: function(){
			if(this.id){
				rias.dom.query("label[for='" + this.id + "']").removeClass("riaswCheckBoxFocusedLabel");
			}
			this.inherited(arguments);
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
