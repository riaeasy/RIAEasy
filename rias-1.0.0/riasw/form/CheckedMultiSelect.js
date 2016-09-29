//RIAStudio client runtime widget - CheckedMultiSelect

define([
	"rias",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/_CssStateMixin",
	"rias/riasw/widget/Menu",
	"rias/riasw/widget/MenuItem",
	"dijit/form/_FormSelectWidget",
	"rias/riasw/form/ComboButton",
	"rias/riasw/widget/Tooltip",
	"rias/riasw/form/CheckBox",
	"rias/riasw/form/RadioBox"
], function(rias, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, Menu, MenuItem, _FormSelectWidget, ComboButton, Tooltip) {

// module:
//		dojox/form/CheckedMultiSelect
// summary:
//		Extends the core dojox.form.CheckedMultiSelect to provide a "checkbox" selector


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

	var formCheckedMultiSelectMenu = rias.declare("rias.riasw.form._CheckedMultiSelectMenu", Menu, {
		// summary:
		//		An internally-used menu for dropdown that allows us a vertical scrollbar

		multiple: false,

		buildRendering: function(){
			// summary:
			//		Stub in our own changes, so that our domNode is not a table
			//		otherwise, we won't respond correctly to heights/overflows
			this.inherited(arguments);
			var o = (this.menuTableNode = this.domNode),
				n = (this.domNode = rias.dom.create("div", {style: {overflowX: "hidden", overflowY: "scroll"}}));
			if(o.parentNode){
				o.parentNode.replaceChild(n, o);
			}
			rias.dom.removeClass(o, "dijitMenuTable");
			n.className = o.className + " riaswCheckedMultiSelectMenu";
			o.className = "dijitReset dijitMenuTable";
			o.setAttribute("role", "listbox");
			n.setAttribute("role", "presentation");
			n.appendChild(o);
		},

		resize: function(/*Object*/ mb){
			// summary:
			//		Overridden so that we are able to handle resizing our
			//		internal widget.  Note that this is not a "full" resize
			//		implementation - it only works correctly if you pass it a
			//		marginBox.
			//
			// mb: Object
			//		The margin box to set this dropdown to.
			if(mb){
				rias.dom.setMarginBox(this.domNode, mb);
				if("w" in mb){
					// We've explicitly set the wrapper <div>'s width, so set <table> width to match.
					// 100% is safer than a pixel value because there may be a scroll bar with
					// browser/OS specific width.
					this.menuTableNode.style.width = "100%";
				}
			}
		},

		onClose: function(){
			this.inherited(arguments);
			if(this.menuTableNode){
				// Erase possible width: 100% setting from _SelectMenu.resize().
				// Leaving it would interfere with the next openDropDown() call, which
				// queries the natural size of the drop down.
				this.menuTableNode.style.width = "";
			}
		},

		onItemClick: function(/*dijit._Widget*/ item, /*Event*/ evt){
			// summary:
			//		Handle clicks on an item.
			// tags:
			//		private

			// this can't be done in _onFocus since the _onFocus events occurs asynchronously
			if(typeof this.isShowingNow == 'undefined'){ // non-popup menu
				this._markActive();
			}

			this.focusChild(item);

			if(item.disabled || item.readOnly){
				return false;
			}

			if(!this.multiple){
				// before calling user defined handler, close hierarchy of menus
				// and restore focus to place it was when menu was opened
				this.onExecute();
			}
			// user defined handler for click
			item.onClick(evt);
		}
	});

	var formCheckedMultiSelectMenuItem = rias.declare("rias.riasw.form._CheckedMultiSelectMenuItem", [MenuItem], {
		// summary:
		//		A checkbox-like menu item for toggling on and off

		templateString:
			'<tr role="menuitemcheckbox" data-dojo-attach-point="focusNode" class="dijitReset dijitMenuItem" tabIndex="-1" data-dojo-attach-event="ondijitclick:_onClick">' +
				'<td role="presentation" class="dijitReset dijitMenuItemIconCell">' +
					'<div data-dojo-attach-point="iconNode" class="dijitMenuItemIcon ${_iconClass}" src="${_blankGif}" alt="">' +
						'<input data-dojo-attach-point="inputNode" class="riaswCheckedMultiSelectCheckBoxInput" type="${_type.type}"/>' +
					'</div>' +
				'</td>' +
				'<td data-dojo-attach-point="containerNode,labelNode" class="dijitReset dijitMenuItemLabel" colspan="2"></td>' +
				'<td data-dojo-attach-point="accelKeyNode" class="dijitReset dijitMenuItemAccelKey" style="display: none"></td>' +
				'<td role="presentation" class="dijitReset dijitMenuArrowCell">&nbsp;</td>' +
			'</tr>',

		// option: dojox.form.__SelectOption
		//		The option that is associated with this item
		option: null,

		// reference of dojox.form._CheckedMultiSelectMenu
		parent: null,

		// icon of the checkbox/radio button
		iconClass: "",

		postMixInProperties: function(){
			// summary:
			//		Set the appropriate _subClass value - based on if we are multi-
			//		or single-select
			if(this.parent.multiple){
				this._iconClass = "riaswCheckedMultiSelectMenuCheckBoxItemIcon";
				this._type = {
					type: "checkbox"
				};
			}else{
				this._iconClass = "";
				this._type = {
					type: "hidden"
				};
			}
			this.disabled = this.option.disabled;
			this.checked = this.option.selected;
			this.label = this.option.label;
			this.readOnly = this.option.readOnly;
			this.inherited(arguments);
		},

		onChange: function(/*Boolean*/ checked){
			// summary:
			//		User defined function to handle check/uncheck events
			// tags:
			//		callback
		},

		_updateBox: function(){
			// summary:
			//		Called to force the box to match the state of the select
			rias.dom.toggleClass(this.domNode, "riaswCheckedMultiSelectMenuItemChecked", !!this.option.selected);
			this.domNode.setAttribute("aria-checked", this.option.selected);
			this.inputNode.checked = this.option.selected;
			if(!this.parent.multiple){
				rias.dom.toggleClass(this.domNode, "riaswCheckedMultiSelectSelectedOption", !!this.option.selected);
			}
		},

		_onClick: function(/*Event*/ e){
			// summary:
			//		Clicking this item just toggles its state
			// tags:
			//		private
			if(!this.disabled && !this.readOnly){
				if(this.parent.multiple){
					this.option.selected = !this.option.selected;
					this.parent.onChange();
					this.onChange(this.option.selected);
				}else{
					if(!this.option.selected){
						rias.forEach(this.parent.getChildren(), function(item){
							item.option.selected = false;
						});
						this.option.selected = true;
						this.parent.onChange();
						this.onChange(this.option.selected);
					}
				}
			}
			this.inherited(arguments);
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
			'<div class="dijit dijitReset dijitInline dijitLeft" id="widget_${id}">' +
				'<div data-dojo-attach-point="comboButtonNode"></div>' +
				'<div data-dojo-attach-point="selectNode" class="dijit dijitReset dijitInline ${baseClass}Wrapper" data-dojo-attach-event="onmousedown:_onMouseDown,onclick:focus" tabIndex="0">' +
					'<select data-dojo-attach-point="containerNode,focusNode" class="${baseClass}Select riaswCheckedMultiSelectHidden" multiple="true"></select>' +
					'<div data-dojo-attach-point="wrapperDiv"></div>' +
				'</div>' +
			'</div>',

		baseClass: "riaswCheckedMultiSelect",

		// required: Boolean
		//		User is required to check at least one item.
		required: false,

		// invalidMessage: String
		//		The message to display if value is invalid.
		invalidMessage: "$_unset_$",

		// _message: String
		//		Currently displayed message
		_message: "",

		// dropDown: Boolean
		//		Drop down version or not
		dropDown: false,

		// labelText: String
		//		Label of the drop down button
		labelText: "",

		// tooltipPosition: String[]
		//		See description of `Tooltip.defaultPosition` for details on this parameter.
		tooltipPosition: [],

		postMixInProperties: function(){
			this.inherited(arguments);
			this._nlsResources = rias.i18n.getLocalization("rias.riasw.form", "CheckedMultiSelect", this.lang);
			if(this.invalidMessage == "$_unset_$"){
				this.invalidMessage = this._nlsResources.invalidMessage;
			}
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
			if(this.dropDown){
				rias.dom.toggleClass(this.selectNode, "riaswCheckedMultiSelectHidden");
				this.dropDownMenu = new formCheckedMultiSelectMenu({
					ownerRiasw: this,
					id: this.id + "_menu",
					style: "display: none;",
					multiple: this.multiple,
					onChange: rias.hitch(this, "_updateSelection")
				});
			}
		},

		startup: function(){
			// summary:
			//		Set the value to be the first, or the selected index
			if(this.dropDown){
				this.dropDownButton = new ComboButton({
					ownerRiasw: this,
					label: this.labelText,
					dropDown: this.dropDownMenu,
					baseClass: "riaswCheckedMultiSelectButton",
					maxHeight: this.maxHeight
				}, this.comboButtonNode);
			}
			this.inherited(arguments);
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
			if(this.dropDown){
				item = new formCheckedMultiSelectMenuItem({
					ownerRiasw: this,
					option: option,
					parent: this.dropDownMenu
				});
				this.dropDownMenu.addChild(item);
			}else{
				item = new formCheckedMultiSelectItem({
					ownerRiasw: this,
					option: option,
					parent: this,
					disabled: this.disabled,
					readOnly: this.readOnly
				});
				this.wrapperDiv.appendChild(item.domNode);
			}
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
			rias.dom.empty(this.containerNode);
			var self = this;
			rias.forEach(this.value, function(item){
				var opt = rias.dom.create("option", {
					"value": item,
					"label": item,
					"selected": "selected"
				});
				rias.dom.place(opt, self.containerNode);
			});
			if(this.dropDown && this.dropDownButton){
				var i = 0, label = "";
				rias.forEach(this.options, function(option){
					if(option.selected){
						i++;
						label = option.label;
					}
				});
				this.dropDownButton.set("label", this.multiple ?
					rias.replace(this._nlsResources.multiSelectLabelText, {num: i}) :
					label);
			}
		},

		_getChildren: function(){
			if(this.dropDown){
				return this.dropDownMenu.getChildren();
			}else{
				return rias.map(this.wrapperDiv.childNodes, function(n){
					return rias.registry.byNode(n);
				});
			}
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
			if(this.dropDown){
				this.dropDownButton.set("disabled", value);
			}
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

		uninitialize: function(){
			Tooltip.hide(this.domNode);
			// Make sure these children are destroyed
			rias.forEach(this._getChildren(), function(child){
				child.destroyRecursive();
			});
			this.inherited(arguments);
		},

		resize: function(changeSize, resultSize){
			if(this.isDestroyed(true)){
				return;
			}
			if(changeSize){
				rias.dom.setMarginBox(this.domNode, changeSize);
			}
			changeSize = rias.dom.getContentMargin(this.domNode);
			changeSize.h = Math.floor(changeSize.h);
			changeSize.w = Math.floor(changeSize.w) - 1;/// 与 TextBox 一致
			rias.dom.setMarginSize(this.selectNode, changeSize);
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