//RIAStudio client runtime widget - CheckedMultiSelect

define([
	"rias",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/_CssStateMixin",
	"rias/riasw/form/_FormSelectWidget",
	"rias/riasw/widget/Tooltip",
	"rias/riasw/store/ObjectStore",
	"rias/riasw/form/CheckBox",
	"rias/riasw/form/RadioBox",
	"dojo/i18n!./nls/CheckedMultiSelect"
], function(rias, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, _FormSelectWidget, Tooltip, ObjectStore) {

	var formCheckedMultiSelectItem = rias.declare("rias.riasw.form._CheckedMultiSelectItem", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin], {
		// summary:
		//		The individual items for a CheckedMultiSelect

		templateString:
			'<div class="dijitReset ${baseClass}" data-dojo-attach-event="onclick:_onClick">' +
				'<input data-dojo-attach-point="checkBox" aria-labelledby="${id}_labelNode" data-dojo-type="rias.riasw.form.CheckBox" class="${baseClass}Box" data-dojo-attach-event="_onClick:_changeBox" type="${_type.type}" ' +
					'baseClass="${_type.baseClass}" data-dojo-props="disabled:${disabled}, readOnly:${readOnly}"/>' +
				'<span class="dijitInline ${baseClass}Label" data-dojo-attach-point="labelNode" id="${id}_labelNode" role="presentation"></span>' +
			'</div>',

		baseClass: "riaswMultiSelectItem",

		// option: dojox.form.__SelectOption
		//		The option that is associated with this item
		option: null,
		parent: null,

		// disabled: boolean
		//		Whether or not this widget is disabled
		disabled: false,

		// readOnly: boolean
		//		Whether or not this widget is readOnly
		readOnly: false,

		postMixInProperties: function(){
			// summary:
			//		Set the appropriate _subClass value - based on if we are multi-
			//		or single-select
			this._type = this.parent.multiple ? {
				type: "checkbox",
				baseClass: "dijitCheckBox"
			} : {
				type: "radio",
				baseClass: "dijitRadio"
			};
			// use global disabled/readOnly if set to true, otherwise use per-option setting
			if(!this.disabled){
				this.disabled = this.option.disabled = this.option.disabled || false;
			}
			if(!this.readOnly){
				this.readOnly = this.option.readOnly = this.option.readOnly || false;
			}
			this.inherited(arguments);
		},
		postCreate: function(){
			// summary:
			//		Set innerHTML here - since the template gets messed up sometimes
			//		with rich text
			this.inherited(arguments);
			this.labelNode.innerHTML = this.option.label;
		},

		_changeBox: function(){
			// summary:
			//		Called to force the select to match the state of the check box
			//		(only on click of the checkbox)	 Radio-based calls _setValueAttr
			//		instead.
			if(this.get("disabled") || this.get("readOnly")){
				return;
			}
			if(this.parent.multiple){
				this.option.selected = this.checkBox.get('value') && true;
			}else{
				this.parent.set('value', this.option.value);
			}
			// fire the parent's change
			this.parent._updateSelection();

			// refocus the parent
			this.parent.focus();
		},

		_onClick: function(e){
			// summary:
			//		Sets the click state (passes through to the check box)
			if(this.get("disabled") || this.get("readOnly")){
				rias.event.stop(e);
			}else{
				this.checkBox._onClick(e);
			}
		},

		_updateBox: function(){
			// summary:
			//		Called to force the box to match the state of the select
			this.checkBox.set('value', this.option.selected);
		},

		_setDisabledAttr: function(value){
			// summary:
			//		Disables (or enables) all the children as well
			this.disabled = value || this.option.disabled;
			this.checkBox.set("disabled", this.disabled);
			rias.dom.toggleClass(this.domNode, "riaswMultiSelectItemDisabled", this.disabled);
		},

		_setReadOnlyAttr: function(value){
			// summary:
			//		Sets read only (or unsets) all the children as well
			this.checkBox.set("readOnly", value);
			this.readOnly = value;
		}

	});

	//rias.theme.loadThemeCss([
	//	//"riasw/form/CheckedMultiSelect.css"
	//]);

	var riaswType = "rias.riasw.form.CheckedMultiSelect";
	var Widget = rias.declare(riaswType, [_FormSelectWidget], {

		// summary:
		//		Extends the core dijit MultiSelect to provide a "checkbox" selector

		templateString:
			'<div data-dojo-attach-point="selectNode" class="dijit dijitReset dijitInline" id="widget_${id}" data-dojo-attach-event="onmousedown:_onMouseDown,onclick:focus" tabIndex="0">' +
				'<select data-dojo-attach-point="optionNode,focusNode" class="${baseClass}Select riaswCheckedMultiSelectHidden" multiple="true"></select>' +
				'<div data-dojo-attach-point="containerNode" class="${baseClass}Wrapper"></div>' +
			'</div>',

		baseClass: "riaswCheckedMultiSelect",

		multiple: true,

		// required: Boolean
		//		User is required to check at least one item.
		required: false,

		// invalidMessage: String
		//		The message to display if value is invalid.
		invalidMessage: "$_unset_$",

		// _message: String
		//		Currently displayed message
		_message: "",

		// labelText: String
		//		Label of the drop down button
		labelText: "",

		// tooltipPosition: String[]
		//		See description of `Tooltip.defaultPosition` for details on this parameter.
		tooltipPosition: [],

		postMixInProperties: function(){
			// Since _setValueAttr() depends on this.store, _setStoreAttr() needs to execute first.
			// Unfortunately, without special code, it ends up executing second.
			var store = this.params.store || this.store;
			if(store){
				this._setStoreAttr(store);
			}

			this.inherited(arguments);
			this._nlsResources = rias.i18n.getLocalization("rias.riasw.form", "CheckedMultiSelect", this.lang);
			if(this.invalidMessage == "$_unset_$"){
				this.invalidMessage = this._nlsResources.invalidMessage;
			}

			// User may try to access this.store.getValue() etc.  in a custom labelFunc() function.
			// It's not available with the new data store for handling inline <option> tags, so add it.
			if(!this.params.store && this.store && !this.store._oldAPI){
				var clazz = this.declaredClass;
				rias.mixin(this.store, {
					getValue: function(item, attr){
						rias.deprecated(clazz + ".store.getValue(item, attr) is deprecated for builtin store.  Use item.attr directly", "", "2.0");
						return item[attr];
					},
					getLabel: function(item){
						rias.deprecated(clazz + ".store.getLabel(item) is deprecated for builtin store.  Use item.label directly", "", "2.0");
						return item.name;
					},
					fetch: function(args){
						rias.deprecated(clazz + ".store.fetch() is deprecated for builtin store.", "Use store.query()", "2.0");
						new ObjectStore({objectStore: this}).fetch(args);
					}
				});
			}
		},

		destroy: function(){
			Tooltip.hide(this.domNode);
			// Make sure these children are destroyed
			rias.forEach(this._getChildren(), function(child){
				child.destroyRecursive();
			});
			this.inherited(arguments);
		},

		_fillContent: function(){
			// summary:
			//		Set the value to be the first, or the selected index
			this.inherited(arguments);

			// set value from selected option
			if(this.options.length && !this.value && this.srcNodeRef){
				var si = this.srcNodeRef.selectedIndex || 0; // || 0 needed for when srcNodeRef is not a SELECT
				this.value = this.options[si >= 0 ? si : 0].value;
			}
		},

		_onMouseDown: function(e){
			// summary:
			//		Cancels the mousedown event to prevent others from stealing
			//		focus
			e.preventDefault();
		},

		validator: function(){
			// summary:
			//		Overridable function used to validate that an item is selected if required =
			//		true.
			// tags:
			//		protected
			if(!this.required){
				return true;
			}
			return rias.some(this.getOptions(), function(opt){
				return opt.selected && opt.value != null && opt.value.toString().length != 0;
			});
		},

		validate: function(isFocused){
			Tooltip.hide(this.domNode);
			var isValid = this.isValid(isFocused);
			if(!isValid){
				this.displayMessage(this.invalidMessage);
			}
			return isValid;
		},

		isValid: function(/*Boolean*/ isFocused){
			// summary:
			//		Tests if the required items are selected.
			//		Can override with your own routine in a subclass.
			// tags:
			//		protected
			return this.validator();
		},

		getErrorMessage: function(/*Boolean*/ isFocused){
			// summary:
			//		Return an error message to show if appropriate
			// tags:
			//		protected
			return this.invalidMessage;
		},

		displayMessage: function(/*String*/ message){
			// summary:
			//		Overridable method to display validation errors/hints.
			//		By default uses a tooltip.
			// tags:
			//		extension
			Tooltip.hide(this.domNode);
			if(message){
				Tooltip.show(message, this.domNode, this.tooltipPosition);
			}
		},

		onAfterAddOptionItem: function(item, option){
			// summary:
			//		a function that can be connected to in order to receive a
			//		notification that an item as been added to this dijit.
		},

		_addOptionItem: function(/*dojox.form.__SelectOption*/ option){
			var item;
			item = new formCheckedMultiSelectItem({
				ownerRiasw: this,
				option: option,
				parent: this,
				disabled: this.disabled,
				readOnly: this.readOnly
			});
			this.containerNode.appendChild(item.domNode);
			this.onAfterAddOptionItem(item, option);
		},

		_refreshState: function(){
			// summary:
			//		Validate if selection changes.
			this.validate(this.focused);
		},

		onChange: function(newValue){
			// summary:
			//		Validate if selection changes.
			this._refreshState();
		},

		reset: function(){
			// Overridden so that the state will be cleared.
			this.inherited(arguments);
			Tooltip.hide(this.domNode);
		},

		_updateSelection: function(){
			this.inherited(arguments);
			this._handleOnChange(this.value);
			rias.forEach(this._getChildren(), function(item){
				item._updateBox();
			});
			rias.dom.empty(this.optionNode);
			var self = this;
			rias.forEach(this.value, function(item){
				var opt = rias.dom.create("option", {
					"value": item,
					"label": item,
					"selected": "selected"
				});
				rias.dom.place(opt, self.optionNode);
			});
		},

		_getChildren: function(){
			return rias.map(this.containerNode.childNodes, function(n){
				return rias.by(n);
			});
		},

		invertSelection: function(onChange){
			// summary:
			//		Invert the selection
			// onChange: Boolean
			//		If null, onChange is not fired.
			if(this.multiple){
				rias.forEach(this.options, function(i){
					i.selected = !i.selected;
				});
				this._updateSelection();
			}
		},

		_setDisabledAttr: function(value){
			// summary:
			//		Disable (or enable) all the children as well
			this.inherited(arguments);
			rias.forEach(this._getChildren(), function(node){
				if(node && node.set){
					node.set("disabled", value);
				}
			});
		},

		_setReadOnlyAttr: function(value){
			// summary:
			//		Sets read only (or unsets) all the children as well
			this.inherited(arguments);
			if("readOnly" in this.attributeMap){
				this[this.attributeMap.readOnly].setAttribute("readonly", value);
			}
			this.readOnly = value;
			rias.forEach(this._getChildren(), function(node){
				if(node && node.set){
					node.set("readOnly", value);
				}
			});
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
			size: 7
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