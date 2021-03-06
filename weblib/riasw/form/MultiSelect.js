//RIAStudio client runtime widget - MultiSelect

define([
	"riasw/riaswBase",
	"riasw/form/_FormSelectWidget",
	"riasw/sys/_HasDropDown",
	"riasw/sys/_KeyNavMixin",
	"riasw/sys/DropDownMenu",
	"riasw/sys/MenuItem",
	"riasw/sys/MenuSeparator",
	"riasw/store/ObjectStore"
], function(rias, _FormSelectWidget, _HasDropDown, _KeyNavMixin, DropDownMenu, MenuItem, MenuSeparator, ObjectStore) {

	///TODO:zensst. 未修改完成。废弃不用。
	///从 dojox/form/CheckedMultiSelect 中分离出来，与 dijit/form/MultiSelect 不同

	var formCheckedMultiSelectMenu = rias.declare("riasw.form._CheckedMultiSelectMenu", DropDownMenu, {
		// summary:
		//		An internally-used menu for dropdown that allows us a vertical scrollbar

		_handleValue: true,

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
			rias.dom.removeClass(o, "riaswDropDownMenu");
			n.className = o.className + " riaswCheckedMultiSelectMenu";
			o.className = "dijitReset riaswDropDownMenu";
			o.setAttribute("role", "listbox");
			n.setAttribute("role", "presentation");
			n.appendChild(o);
		},

		hide: function(){
			if(this.menuTableNode){
				// Erase possible width: 100% setting from _SelectMenu.resize().
				// Leaving it would interfere with the next openDropDown() call, which
				// queries the natural size of the drop down.
				this.menuTableNode.style.width = "";
			}
			return this.inherited(arguments);
		},

		onItemClick: function(/*_WidgetBase*/ item, /*Event*/ evt){
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
				this.onSubmit();
			}
			// user defined handler for click
			item.onClick(evt);
		}
	});

	var formCheckedMultiSelectMenuItem = rias.declare("riasw.form._CheckedMultiSelectMenuItem", [MenuItem], {
		// summary:
		//		A checkbox-like menu item for toggling on and off

		templateString:
			'<tr role="menuitemcheckbox" data-dojo-attach-point="focusNode" class="dijitReset riaswMenuItem" tabIndex="-1" data-dojo-attach-event="ondijitclick:_onClick">' +
				'<td role="presentation" class="dijitReset riaswMenuItemIconCell">' +
					'<div data-dojo-attach-point="iconNode" class="riaswButtonIcon riaswNoIcon riaswMenuItemIcon" src="${_blankGif}" alt="">' +
						'<input data-dojo-attach-point="inputNode" class="riaswCheckedMultiSelectCheckBoxInput" type="${_type.type}"/>' +
					'</div>' +
				'</td>' +
				'<td data-dojo-attach-point="containerNode,labelNode" class="dijitReset riaswMenuItemLabel" colspan="2"></td>' +
				'<td data-dojo-attach-point="accelKeyNode" class="dijitReset riaswMenuItemAccelKey" style="display: none"></td>' +
				'<td role="presentation" class="dijitReset riaswMenuArrowCell">&nbsp;</td>' +
			'</tr>',

		// option: dojox.form.__SelectOption
		//		The option that is associated with this item
		option: null,

		// icon of the checkbox/radio button
		//iconClass: "",

		postMixInProperties: function(){
			// summary:
			//		Set the appropriate _subClass value - based on if we are multi-
			//		or single-select
			this.inherited(arguments);
			if(this.ownerRiasw.multiple){
				this._type = {
					type: "checkbox"
				};
			}else{
				this._type = {
					type: "hidden"
				};
			}
			this.disabled = this.option.disabled;
			this.checked = this.option.selected;
			this.label = this.option.label;
			this.readOnly = this.option.readOnly;
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
			if(!this.getOwnerRiasw().multiple){
				rias.dom.toggleClass(this.domNode, "riaswCheckedMultiSelectSelectedOption", !!this.option.selected);
			}
		},

		_onClick: function(/*Event*/ e){
			// summary:
			//		Clicking this item just toggles its state
			// tags:
			//		private
			if(!this.disabled && !this.readOnly){
				if(this.getOwnerRiasw().multiple){
					this.option.selected = !this.option.selected;
					this.getOwnerRiasw().onChange();
					this.onChange(this.option.selected);
				}else{
					if(!this.option.selected){
						rias.forEach(this.getOwnerRiasw().getChildren(), function(item){
							item.option.selected = false;
						});
						this.option.selected = true;
						this.getOwnerRiasw().onChange();
						this.onChange(this.option.selected);
					}
				}
			}
			this.inherited(arguments);
		}
	});

	var riaswType = "riasw.form.MultiSelect";
	var Widget = rias.declare(riaswType, [_FormSelectWidget, _HasDropDown, _KeyNavMixin], {
		// summary:
		//		This is a "styleable" select box - it is basically a DropDownButton which
		//		can take a `<select>` as its input.

		templateString:
			'<div class="dijitReset dijitInline dijitLeft" data-dojo-attach-point="_popupStateNode" id="widget_${id}" role="combobox" aria-haspopup="true">'+
				//'<div class="riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_label" tabIndex="-1" readonly="readonly" role="presentation"></div>'+
				'<div class="riaswTextBoxContainer" data-dojo-attach-point="containerNode,_aroundNode" role="presentation">'+
					'<span class="riaswArrowButtonContainer" data-dojo-attach-point="_dropDownContainer" role="presentation">'+
						'<span class="riaswArrowButton riaswDownArrowButton" data-dojo-attach-point="_dropDownButton" type="text" tabIndex="-1" readonly="readonly" role="presentation" aria-hidden="true" ${_buttonInputDisabled}></span>'+
					'</span>'+
					'<span class="riaswValidationContainer" data-dojo-attach-point="validationNode">'+
						//'<input class="riaswValidationIcon riaswValidationInner" value="&#935; " type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
					'</span>'+
					'<span class="riaswInputContainer">'+
						'<input type="text" class="riaswInputInner" data-dojo-attach-point="textbox,focusNode" autocomplete="off" aria-labelledby="${id}_label" role="textbox" readonly="readonly" ${!nameAttrSetting}/>'+
					'</span>'+
					'<input type="hidden" data-dojo-attach-point="valueNode" value="${value}" aria-hidden="true" ${!nameAttrSetting}/>'+
				'</div>'+
				'<select data-dojo-attach-point="optionNode" class="riaswCheckedMultiSelectSelect riaswHidden" multiple="true"></select>' +
			'</div>',
		baseClass: "riaswTextBox riaswComboBox",
		cssStateNodes: {
			"_dropDownButton": "riaswArrowButton"
		},

		multiple: true,
		// required: Boolean
		//		User is required to check at least one item.
		required: false,
		// invalidMessage: String
		//		The message to display if value is invalid.
		invalidMessage: rias.i18n.message.invalid,
		missingMessage: rias.i18n.message.missing,
		// labelText: String
		//		Label of the drop down button
		labelText: "",

		_buttonInputDisabled: rias.has("ie") ? "disabled" : "", // allows IE to disallow focus, but Firefox cannot be disabled for mousedown events
		state: "",
		message: "",
		emptyLabel: "&#160;", // &nbsp;
		_isLoaded: false,
		_childrenLoaded: false,
		labelType: "html",

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
		},
		postCreate: function(){
			this.inherited(arguments);

			// stop mousemove from selecting text on IE to be consistent with other browsers
			this.own(rias.on(this.domNode, "selectstart", function(evt){
				evt.preventDefault();
				evt.stopPropagation();
			}));

			this.domNode.setAttribute("aria-expanded", "false");

			// Prevent _KeyNavMixin from calling stopPropagation() on left and right arrow keys, thus breaking
			// navigation when Select inside Toolbar.
			var keyNavCodes = this._keyNavCodes;
			delete keyNavCodes[rias.keys.LEFT_ARROW];
			delete keyNavCodes[rias.keys.RIGHT_ARROW];
		},
		_onDestroy: function(preserveDom){
			rias.hideTooltip(this.domNode);	// in case Select (or enclosing Dialog) destroyed while tooltip shown
			this.inherited(arguments);
		},

		_fillContent: function(){
			// summary:
			//		Set the value to be the first, or the selected index
			this.inherited(arguments);
			// set value from selected option
			if(this.options.length && !this.value && this.srcNodeRef){
				var si = this.srcNodeRef.selectedIndex || 0; // || 0 needed for when srcNodeRef is not a SELECT
				this._set("value", this.options[si >= 0 ? si : 0].value);
			}
			// Create the dropDown widget
			this.dropDown = new formCheckedMultiSelectMenu({
				///增加 ownerRiasw
				ownerRiasw: this,
				id: this.id + "_menu",
				parentWidget: this,
				style: "display: none;",
				multiple: this.multiple,
				onChange: rias.hitch(this, "_updateSelection")
			});
			rias.dom.addClass(this.dropDown.domNode, this.baseClass.replace(/\s+|$/g, "Menu "));
		},
		onAfterAddOptionItem: function(item, option){
			// summary:
			//		a function that can be connected to in order to receive a
			//		notification that an item as been added to this dijit.
		},
		_addOptionItem: function(/*_FormSelectWidget.__SelectOption*/ option){
			// summary:
			//		For the given option, add an option to our dropdown.
			//		If the option doesn't have a value, then a separator is added
			//		in that place.
			var item;
			if(this.dropDown){
				item = new formCheckedMultiSelectMenuItem({
					ownerRiasw: this.dropDown,
					option: option
				});
				this.dropDown.addChild(item);
			}
			this.onAfterAddOptionItem(item, option);
		},
		_getChildren: function(){
			if(!this.dropDown){
				return [];
			}
			return this.dropDown.getChildren();
		},
		/*focus: function(){
			// Override _KeyNavMixin::focus(), which calls focusFirstChild().
			// We just want the standard form widget behavior.
			forceVisible
			if(!this.isDestroyed(true)){
			}
			if(!this.disabled && this.focusNode.focus){
				try{
					this.focusNode.focus();
				}catch(e){
					//squelch errors from hidden nodes
				}
			}
		},*/
		focusChild: function(/*_WidgetBase*/ widget){
			// summary:
			//		Sets the value to the given option, used during search by letter.
			// widget:
			//		Reference to option's widget
			// tags:
			//		protected
			if(widget){
				this.set('value', widget.option);
			}
		},
		_getFirstChild: function(){
			// summary:
			//		Returns the first child widget.
			// tags:
			//		abstract extension
			var children = this._getChildren();
			return children.length ? children[0] : null;
		},
		_getLastChild: function(){
			// summary:
			//		Returns the last child widget.
			// tags:
			//		abstract extension
			var children = this._getChildren();
			return children.length ? children[children.length-1] : null;
		},
		childSelector: function(/*DOMNode*/ node){
			// Implement _KeyNavMixin.childSelector, to identify focusable child nodes.
			// If we allowed a dojo/query dependency from this module this could more simply be a string "> *"
			// instead of this function.

			node = rias.by(node);
			return node && node.getParent() === this.dropDown;
		},
		onKeyboardSearch: function(/*_WidgetBase*/ item, /*Event*/ evt, /*String*/ searchString, /*Number*/ numMatches){
			// summary:
			//		When a key is pressed that matches a child item,
			//		this method is called so that a widget can take appropriate action is necessary.
			// tags:
			//		protected
			if(item){
				this.focusChild(item);
			}
		},

		_loadChildren: function(/*Boolean*/ loadMenuItems){
			// summary:
			//		Resets the menu and the length attribute of the button - and
			//		ensures that the label is appropriately set.
			// loadMenuItems: Boolean
			//		actually loads the child menu items - we only do this when we are
			//		populating for showing the dropdown.

			if(loadMenuItems === true){
				// this.inherited destroys this.dropDown's child widgets (MenuItems).
				// Avoid this.dropDown (Menu widget) having a pointer to a destroyed widget (which will cause
				// issues later in _setSelected). (see #10296)
				if(this.dropDown){
					delete this.dropDown.focusedChild;
					this.focusedChild = null;
				}
				if(this.options.length){
					this.inherited(arguments);
				}else{
					// Drop down menu is blank but add one blank entry just so something appears on the screen
					// to let users know that they are no choices (mimicing native select behavior)
					rias.forEach(this._getChildren(), function(child){
						child.destroy();
					});
					var item = new MenuItem({
						ownerRiasw: this,
						//ownerDocument: this.ownerDocument,
						label: this.emptyLabel
					});
					this.dropDown.addChild(item);
				}
			}else{
				this._updateSelection();
			}

			this._isLoaded = false;
			this._childrenLoaded = true;

			if(!this._loadingStore){
				// Don't call this if we are loading - since we will handle it later
				this.set("value", this.value, false);
			}
		},

		onChange: function(/*Boolean*/ checked){
			// summary:
			//		User defined function to handle check/uncheck events
			// tags:
			//		callback
			this._refreshState();
		},
		_refreshState: function(){
			if(this._started){
				this.validate(this.focused);
			}
		},

		_setValueAttr: function(value){
			this.inherited(arguments);
			rias.dom.setAttr(this.valueNode, "value", this.get("value"));
			this._refreshState();	// to update this.state
		},
		_setNameAttr: "valueNode",
		_setDisabledAttr: function(/*Boolean*/ value){
			this.inherited(arguments);
			this._refreshState();	// to update this.state
		},
		_setRequiredAttr: function(/*Boolean*/ value){
			this._set("required", value);
			this.focusNode.setAttribute("aria-required", value);
			this._refreshState();	// to update this.state
		},
		_setOptionsAttr: function(/*Array*/ options){
			this._isLoaded = false;
			this._set('options', options);
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
		validate: function(/*Boolean*/ isFocused){
			// summary:
			//		Called by oninit, onblur, and onkeypress, and whenever required/disabled state changes
			// description:
			//		Show missing or invalid messages if appropriate, and highlight textbox field.
			//		Used when a select is initially set to no value and the user is required to
			//		set the value.

			var isValid = this.disabled || this.isValid(isFocused);
			this._set("state", isValid ? "" : (this._hasBeenBlurred ? "Error" : "Incomplete"));
			this.focusNode.setAttribute("aria-invalid", isValid ? "false" : "true");
			var message = isValid ? "" : this.missingMessage;
			if(message && this.focused && this._hasBeenBlurred){
				rias.showTooltip(message, this.domNode, this.tooltipPositions, !this.isLeftToRight());
			}else{
				rias.hideTooltip(this.domNode);
			}
			this._set("message", message);
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

		reset: function(){
			// summary:
			//		Overridden so that the state will be cleared.
			this.inherited(arguments);
			rias.hideTooltip(this.domNode);
			this._refreshState();	// to update this.state
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

		isLoaded: function(){
			return this._isLoaded;
		},
		loadDropDown: function(){
			// summary:
			//		populates the menu
			this._loadChildren(true);
			this._isLoaded = true;
			return this.inherited(arguments);
		},
		_onFocus: function(){
			this.validate(true);	// show tooltip if second focus of required tooltip, but no selection
			// Note: not calling superclass _onFocus() to avoid _KeyNavMixin::_onFocus() setting tabIndex --> -1
		},
		_onBlur: function(){
			rias.hideTooltip(this.domNode);
			this.inherited(arguments);
			this.validate(false);
		},

		_onContainerKeydown: function(evt){
			var self = this,
				args = arguments;
			if(!this.isOpened()){
				this.loadAndOpenDropDown().then(function(){
					self.inherited(args);
				});
			}else{
				this.inherited(args);
			}
		},
		_onContainerKeypress: function(evt){
			var self = this,
				args = arguments;
			if(!this.isOpened()){
				this.loadAndOpenDropDown().then(function(){
					self.inherited(args);
				});
			}else{
				this.inherited(args);
			}
		}
	});

	Widget._Menu = formCheckedMultiSelectMenu;	// for monkey patching
	// generic event helper to ensure the dropdown items are loaded before the real event handler is called
	/*function _onEventAfterLoad(method){
		return function(evt){
			var self = this,
				args = arguments;
			if(!this._isLoaded){
				this.loadDropDown.then(function(){
					self.inherited(method, args);
				});
			}else{
				this.inherited(method, args);
			}
		};
	}
	Widget.prototype._onContainerKeydown = _onEventAfterLoad("_onContainerKeydown");
	Widget.prototype._onContainerKeypress = _onEventAfterLoad("_onContainerKeypress");*/

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "none",
		//allowedChild: "",
		"property": {
			"type": {
				"datatype": "string",
				"defaultValue": "button",
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
			"showLabel": {
				"datatype": "boolean",
				"defaultValue": true,
				"hidden": true
			},
			"iconClass": {
				"datatype": "string",
				"hidden": true
			},
			"emptyLabel": {
				"datatype": "string",
				"title": "Empty Label"
			},
			"required": {
				"datatype": "boolean",
				"description": "Can be true or false, default is false.",
				"hidden": false
			},
			"state": {
				"datatype": "string",
				"description": "Shows current state (ie, validation result) of input (Normal, Warning, or Error)",
				"hidden": true
			},
			"multiple": {
				"datatype": "boolean",
				"description": "Matches the select's \"multiple=\" value",
				"hidden": false
			},
			"autoWidth": {
				"datatype": "boolean",
				"description": "Set to true to make the drop down at least as wide as this\nwidget.  Set to false if the drop down should just be its\ndefault width",
				"hidden": false
			},
			"maxHeight": {
				"datatype": "string",
				"description": "The max height for our dropdown.  Set to 0 for no max height.\nany dropdown taller than this will have scrollbars",
				"hidden": true
			}
		}
	};

	return Widget;

});