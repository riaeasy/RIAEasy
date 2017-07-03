//RIAStudio client runtime widget - ToggleButton

define([
	"riasw/riaswBase"
], function(rias) {

	var riaswType = "riasw.form._ToggleButtonMixin";
	var Widget = rias.declare(riaswType, null, {

		autoName: true,/// 需要覆盖 Button

		checked: false,
		checkedLabel: "",
		showCheckNode: true,

		// aria-pressed for toggle buttons, and aria-checked for checkboxes
		_aria_attr: "aria-pressed",

		postCreate: function(){ // use postCreate instead of startup so users forgetting to call startup are OK
			this.inherited(arguments);
			var node = this.focusNode || this.domNode;
			if(this.checked){
				// need this here instead of on the template so IE8 tab order works
				node.setAttribute('checked', 'checked');
			}

			// Update our reset value if it hasn't yet been set (because this.set()
			// is only called when there *is* a value)
			if(this._resetValue == undefined){
				this._lastValueReported = this._resetValue = this.checked;
			}
		},

		_setCheckedAttr: function(/*Boolean*/ value, /*Boolean?*/ priorityChange){
			value = !!value;
			this._set("checked", value);
			if(this._created){ // IE is not ready to handle checked attribute (affects tab order)
				var node = this.focusNode || this.domNode;
				// needlessly setting "checked" upsets IE's tab order
				if(rias.dom.getAttr(node, "checked") !== !!value){
					rias.dom.setAttr(node, "checked", !!value); // "mixed" -> true
				}
				node.setAttribute(this._aria_attr, String(value)); // aria values should be strings
				this._handleOnChange(value, priorityChange);
			}
		},
		_onContainerChanged: function(container){
			this.inherited(arguments);
			this.set("checked", this.get("checked"));
		},
		_setLabelAttr: function(/*String*/ content){
			if(this.checkedLabel && this.checked){
				content = this.checkedLabel;
			}
			this.inherited(arguments);
		},
		_setShowCheckNodeAttr: function(val){
			if(this.checkNode){
				rias.dom.toggleClass(this.checkNode, "riaswHidden", !val);
			}
			this._set("showCheckNode", val);
		},

		reset: function(){
			this.inherited(arguments);
			//this.set('checked', this.params.checked || false);
		},

		_onClick: function(/*Event*/ evt){
			if(!this.disabled && !this.isBusy && !this.readOnly){
				var original = this.checked;
				this._set('checked', !original); // partially set the toggled value, assuming the toggle will work, so it can be overridden in the onclick handler
				var ret = this.inherited(arguments); // the user could reset the value here
				this.set('checked', ret ? this.checked : original); // officially set the toggled or user value, or reset it back
			}
			evt.stopPropagation();
			evt.preventDefault();
			return false;
		}

	});

	/*Widget._riasdMeta = {
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
			"checked": {
				"datatype": "boolean",
				"title": "Checked"
			}
		}
	};*/

	return Widget;

});