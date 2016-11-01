//RIAStudio client runtime widget - ToggleButton

define([
	"rias"
], function(rias) {

	var riaswType = "rias.riasw.form._ToggleButtonMixin";
	var Widget = rias.declare(riaswType, null, {

		checked: false,
		checkedLabel: "",
		showCheckNode: true,

		// aria-pressed for toggle buttons, and aria-checked for checkboxes
		_aria_attr: "aria-pressed",

		_onClick: function(/*Event*/ evt){
			var original = this.checked;
			this._set('checked', !original); // partially set the toggled value, assuming the toggle will work, so it can be overridden in the onclick handler
			var ret = this.inherited(arguments); // the user could reset the value here
			this.set('checked', ret ? this.checked : original); // officially set the toggled or user value, or reset it back
			return ret;
		},

		_setReadOnlyAttr: function(/*Boolean*/ value){
			if(value != undefined){
				value = !!value;
				rias.dom.setAttr(this.focusNode, 'readOnly', value || !this.editable);
				this._set("readOnly", value);
			}
			/// editable == false 也应该可以 focus
			//if(this.readOnly || this.editable == false){
			if(this.readOnly){
				// reset these, because after the domNode is disabled, we can no longer receive
				// mouse related events, see #4200
				this._set("hovering", false);
				this._set("active", false);

				// clear tab stop(s) on this widget's focusable node(s)  (ComboBox has two focusable nodes)
				var attachPointNames = "tabIndex" in this.attributeMap ? this.attributeMap.tabIndex :
					("_setTabIndexAttr" in this) ? this._setTabIndexAttr : "focusNode";
				rias.forEach(rias.isArray(attachPointNames) ? attachPointNames : [attachPointNames], function(attachPointName){
					var node = this[attachPointName];
					// complex code because tabIndex=-1 on a <div> doesn't work on FF
					if( true  || rias.a11y.hasDefaultTabStop(node)){    // see #11064 about webkit bug
						node.setAttribute('tabIndex', "-1");
					}else{
						node.removeAttribute('tabIndex');
					}
				}, this);
			}else{
				if(this.tabIndex != ""){
					this.set('tabIndex', this.tabIndex);
				}
			}
		},
		_setEditableAttr: function(value){
			value = !!value;
			if(this.textbox){
				rias.dom.setAttr(this.textbox, "readOnly", (this.readOnly || !value));
			}
			this._set("editable", !!value);
			this._setReadOnlyAttr();
		},
		_setModifiedAttr: function(value){
			value = !!value;
			if(!value){
				this._resetValue = this.get("checked");
			}
			this._set("modified", value);
			//console.debug(this.id + ".modified: ", value);
		},
		_setCheckedAttr: function(/*Boolean*/ value, /*Boolean?*/ priorityChange){
			value = !!value;
			this._set("checked", value);
			var node = this.focusNode || this.domNode;
			if(this._created){ // IE is not ready to handle checked attribute (affects tab order)
				// needlessly setting "checked" upsets IE's tab order
				if(rias.dom.getAttr(node, "checked") != !!value){
					rias.dom.setAttr(node, "checked", !!value); // "mixed" -> true
				}
			}
			node.setAttribute(this._aria_attr, String(value)); // aria values should be strings
			if(this.checkNode){
				rias.dom.toggleClass(this.checkNode, "dijitCheckBoxChecked", value);
			}
			this._handleOnChange(value, priorityChange);
		},
		_setLabelAttr: function(/*String*/ content){
			if(this.checkedLabel && this.checked){
				content = this.checkedLabel;
			}
			this.inherited(arguments);
		},
		_setShowCheckNodeAttr: function(val){
			if(this.checkNode){
				rias.dom.toggleClass(this.checkNode, "dijitDisplayNone", !val);
			}
			this._set("showCheckNode", val);
		},

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

		reset: function(){
			// summary:
			//		Reset the widget's value to what it was at initialization time

			this._hasBeenBlurred = false;

			// set checked state to original setting
			this.set('checked', this.params.checked || false);
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswToggleButtonIcon",
		iconClass16: "riaswToggleButtonIcon16",
		defaultParams: {
			//content: "<input type='button'></input>",
			//label: "ToggleButton",
			//showLabel: true
		},
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