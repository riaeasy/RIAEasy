//RIAStudio client runtime widget - CheckedMultiSelect

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/_KeyNavContainer",
	"riasw/sys/_CssStateMixin",
	"riasw/form/_FormSelectWidget",
	"riasw/store/ObjectStore",
	"riasw/form/CheckBox",
	"riasw/form/RadioBox"
], function(rias, _WidgetBase, _TemplatedMixin, _KeyNavContainer, _CssStateMixin, _FormSelectWidget, ObjectStore) {

	var formCheckedMultiSelectItem = rias.declare("riasw.form._CheckedMultiSelectItem", [_WidgetBase, _TemplatedMixin, _CssStateMixin], {
		// summary:
		//		The individual items for a CheckedMultiSelect

		templateString:
			'<div class="dijitReset ${baseClass}" data-dojo-attach-event="onclick:_onClick">' +
				'<input data-dojo-attach-point="checkBox" aria-labelledby="${id}_label" data-dojo-type="riasw.form.CheckBox" class="${baseClass}Box" data-dojo-attach-event="_onClick:_changeBox" type="${_type.type}" ' +
					'baseClass="${_type.baseClass}" data-dojo-props="disabled:${disabled}, readOnly:${readOnly}"/>' +
				'<span class="${baseClass}Label" data-dojo-attach-point="labelNode" id="${id}_label" role="presentation"></span>' +
			'</div>',

		baseClass: "riaswCheckedMultiSelectItem",
		itemDisplay: "",///"block"、"inline-block"

		// tabIndex: String
		//		Order fields are traversed when user hits the tab key
		tabIndex: "0",
		//_setTabIndexAttr: "domNode", // force copy even when tabIndex default value, needed since Button is <span>
		// disabled: boolean
		//		Whether or not this widget is disabled
		disabled: false,
		// readOnly: boolean
		//		Whether or not this widget is readOnly
		readOnly: false,

		// option: dojox.form.__SelectOption
		//		The option that is associated with this item
		option: null,

		postMixInProperties: function(){
			// summary:
			//		Set the appropriate _subClass value - based on if we are multi-
			//		or single-select
			this.inherited(arguments);
			this._type = this.ownerRiasw.multiple ? {
				type: "checkbox",
				baseClass: "riaswCheckBox"
			} : {
				type: "radio",
				baseClass: "riaswRadioBox"
			};
			// use global disabled/readOnly if set to true, otherwise use per-option setting
			if(!this.disabled){
				this.disabled = this.option.disabled = this.option.disabled || false;
			}
			if(!this.readOnly){
				this.readOnly = this.option.readOnly = this.option.readOnly || false;
			}
		},
		//buildRendering: function () {
		//	this.inherited(arguments);
		//	this.focusNode = this.checkBox.focusNode;
		//},
		postCreate: function(){
			// summary:
			//		Set innerHTML here - since the template gets messed up sometimes
			//		with rich text
			this.inherited(arguments);
			if(this.labelNode){
				this.labelNode.innerHTML = this.option.label;
			}
		},

		_setDisabledAttr: function(value){
			// summary:
			//		Disables (or enables) all the children as well
			this.disabled = value || this.option.disabled;
			this.checkBox.set("disabled", this.disabled);
			rias.dom.toggleClass(this.domNode, "riaswCheckedMultiSelectItemDisabled", this.disabled);
		},
		_setReadOnlyAttr: function(value){
			// summary:
			//		Sets read only (or unsets) all the children as well
			this.checkBox.set("readOnly", value);
			this.readOnly = value;
		},
		_setItemDisplayAttr: function(value){
			if(value === "block" || value === "inline-block"){
				this._set("itemDisplay", value);
				rias.dom.setStyle(this.domNode, "display", value);
			}
		},

		_changeBox: function(){
			// summary:
			//		Called to force the select to match the state of the check box
			//		(only on click of the checkbox)	 Radio-based calls _setValueAttr
			//		instead.
			if(this.get("disabled") || this.get("readOnly")){
				return;
			}
			if(this.getOwnerRiasw().multiple){
				this.option.selected = this.checkBox.get('value') && true;
			}else{
				this.getOwnerRiasw().set('value', this.option.value);
			}
			// fire the parent's change
			this.getOwnerRiasw()._updateSelection();

			// refocus the parent
			//this.getOwnerRiasw().focus();
		},
		_updateBox: function(){
			// summary:
			//		Called to force the box to match the state of the select
			this.checkBox.set('value', this.option.selected);
		},

		_onClick: function(e){
			// summary:
			//		Sets the click state (passes through to the check box)
			if(this.get("disabled") || this.get("readOnly")){
				rias.stopEvent(e);
			}else{
				this.checkBox._onClick(e);
			}
		}

	});

	//rias.theme.loadThemeCss([
	//	//"riasw/form/CheckedMultiSelect.css"
	//]);

	var riaswType = "riasw.form.CheckedMultiSelect";
	var Widget = rias.declare(riaswType, [_FormSelectWidget, _KeyNavContainer], {

		// summary:
		//		Extends the core _FormSelectWidget to provide a "checkbox" selector

		//_ignoreKeyboardSearch: false,

		templateString:
			'<div data-dojo-attach-point="selectNode" class="dijitReset" id="widget_${id}" data-dojo-attach-event="onmousedown:_onMouseDown,onclick:focus" tabIndex="0">' +
				//'<div class="riaswHidden riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_label" tabIndex="-1" readonly="readonly" role="presentation"></div>'+
				'<div data-dojo-attach-point="containerNode,focusNode" class="${baseClass}Container"></div>' +
				'<select data-dojo-attach-point="optionNode" class="${baseClass}Select riaswHidden" multiple="true"></select>' +
			'</div>',

		baseClass: "riaswCheckedMultiSelect",

		multiple: true,

		// required: Boolean
		//		User is required to check at least one item.
		required: false,

		// invalidMessage: String
		//		The message to display if value is invalid.
		invalidMessage: rias.i18n.message.invalid,

		// labelText: String
		//		Label of the drop down button
		labelText: "",
		itemDisplay: "",///"block"、"inline-block"

		postMixInProperties: function(){
			this.inherited(arguments);

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

			this._keyNavCodes = {};
			this._keyNavCodes[rias.keys.UP_ARROW] = function(evt, focusedChild){
				this.focusPrev();
			};
			this._keyNavCodes[rias.keys.DOWN_ARROW] = function(evt, focusedChild){
				this.focusNext();
			};
			this._keyNavCodes[rias.keys.SPACE] = function(evt, focusedChild){
				if(focusedChild){
					focusedChild._onClick(evt);
				}
			};
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
		_onDestroy: function(){
			rias.hideTooltip(this.domNode);
			// Make sure these children are destroyed
			rias.forEach(this._getChildren(), function(child){
				child.destroy();
			});
			this.inherited(arguments);
		},

		onAfterAddOptionItem: function(item, option){
			// summary:
			//		a function that can be connected to in order to receive a
			//		notification that an item as been added to this widget.
		},
		_addOptionItem: function(/*dojox.form.__SelectOption*/ option){
			var item;
			item = new formCheckedMultiSelectItem({
				ownerRiasw: this,
				option: option,
				itemDisplay: this.itemDisplay,
				disabled: this.disabled,
				readOnly: this.readOnly
			});
			this.containerNode.appendChild(item.domNode);
			this.onAfterAddOptionItem(item, option);
		},

		_getChildren: function(){
			//return rias.map(this.containerNode.childNodes, function(n){
			//	return rias.by(n);
			//});
			return this.getChildren();
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
		},
		_setItemDisplayAttr: function(value){
			if(value === "block" || value === "inline-block"){
				this._set("itemDisplay", value);
				rias.forEach(this._getChildren(), function(child){
					child.set("itemDisplay", value);
				});
			}
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
			rias.hideTooltip(this.domNode);
			if(message){
				rias.showTooltip(message, this.domNode, this.tooltipPositions);
			}
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
				return opt.selected && opt.value != null && opt.value.toString().length !== 0;
			});
		},
		validate: function(isFocused){
			rias.hideTooltip(this.domNode);
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
		_refreshState: function(){
			// summary:
			//		Validate if selection changes.
			this.validate(this.focused);
		},

		reset: function(){
			// Overridden so that the state will be cleared.
			this.inherited(arguments);
			rias.hideTooltip(this.domNode);
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

		onChange: function(newValue){
			// summary:
			//		Validate if selection changes.
			this._refreshState();
		},
		_onMouseDown: function(e){
			// summary:
			//		Cancels the mousedown event to prevent others from stealing
			//		focus
			e.preventDefault();
		}
	});

	Widget._riasdMeta = {
		visual: true,
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
			}
		}
	};

	return Widget;

});