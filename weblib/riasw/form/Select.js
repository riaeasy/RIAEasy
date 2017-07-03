//RIAStudio client runtime widget - Select

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

	///TODO:zensst. 未做完整测试。慎用。
	var _SelectMenu = rias.declare("riasw.form._SelectMenu", DropDownMenu, {
		// summary:
		//		An internally-used menu for dropdown that allows us a vertical scrollbar

		// Override Menu.autoFocus setting so that opening a Select highlights the current value.
		//autoFocus: true,

		buildRendering: function(){
			this.inherited(arguments);

			this.domNode.setAttribute("role", "listbox");
		},

		postCreate: function(){
			this.inherited(arguments);

			// stop mousemove from selecting text on IE to be consistent with other browsers
			this.own(rias.on(this.domNode, "selectstart", function(evt){
				evt.preventDefault();
				evt.stopPropagation();
			}));
		},

		focus: function(node, forceVisible){
			// summary:
			//		Overridden so that the previously selected value will be focused instead of only the first item
			if(!this.isDestroyed(true)){
				var found = false,
					val = this.parentWidget.value;
				if(rias.isArray(val)){
					val = val[val.length - 1];
				}
				if(val){ // if focus selected
					rias.forEach(this.parentWidget._getChildren(), function(child){
						if(child.option && (val === child.option.value)){ // find menu item widget with this value
							found = true;
							this.focusChild(child, forceVisible); // focus previous selection
						}
					}, this);
				}
				if(!found){
					this.inherited(arguments); // focus first item by default
				}
			}
		}
	});

	var riaswType = "riasw.form.Select";
	var Widget = rias.declare(riaswType, [_FormSelectWidget, _HasDropDown, _KeyNavMixin], {
		// summary:
		//		This is a "styleable" select box - it is basically a DropDownButton which
		//		can take a `<select>` as its input.

		templateString:
			'<div class="dijitReset dijitInline" data-dojo-attach-point="_popupStateNode" id="widget_${id}" role="listbox" aria-haspopup="true">'+
				//'<div class="riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_label" tabIndex="-1" readonly="readonly" role="presentation"></div>'+
				'<div class="riaswTextBoxContainer" data-dojo-attach-point="containerNode,_aroundNode" role="presentation">'+
					'<span class="riaswArrowButtonContainer" data-dojo-attach-point="_dropDownContainer" role="presentation">'+
						'<span class="riaswArrowButton riaswDownArrowButton" data-dojo-attach-point="_dropDownButton" type="text" tabIndex="-1" readonly="readonly" role="presentation" aria-hidden="true" ${_buttonInputDisabled}></span>'+
					'</span>'+
					'<span class="riaswValidationContainer" data-dojo-attach-point="validationNode">'+
						//'<input class="riaswValidationIcon riaswValidationInner" value="&#935; " type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
					'</span>'+
					'<span class="riaswInputContainer">'+
						'<input type="text" class="riaswInputInner" data-dojo-attach-point="textbox,focusNode" aria-labelledby="${id}_label" role="textbox" readonly="readonly" ${!nameAttrSetting}/>'+
					'</span>'+
					'<input type="hidden" data-dojo-attach-point="valueNode" value="${value}" aria-hidden="true" ${!nameAttrSetting}/>'+
				'</div>'+
			'</div>',
		baseClass: "riaswTextBox riaswComboBox",
		cssStateNodes: {
			"_dropDownButton": "riaswArrowButton"
		},

		_buttonInputDisabled: rias.has("ie") ? "disabled" : "", // allows IE to disallow focus, but Firefox cannot be disabled for mousedown events
		required: false,
		state: "",
		message: "",
		emptyLabel: "&#160;", // &nbsp;
		_isLoaded: false,
		_childrenLoaded: false,
		labelType: "html",

		_setDisplay: function(/*String*/ newDisplay){
			// summary:
			//		sets the display for the given value (or values)

			var lbl = (this.labelType === 'text' ? (newDisplay || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') : newDisplay) || this.emptyLabel;
			//this.containerNode.innerHTML = '<span role="option" class="dijitReset dijitInline ' + this.baseClass.replace(/\s+|$/g, "Label ") + '">' + lbl + '</span>';
			///修改了 containerNode，用 textbox
			this.textbox.value = lbl;
			//if(this.applyTextDir){
			//	this.applyTextDir(this.containerNode);
			//}
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
			this.dropDown = new _SelectMenu({
				///增加 ownerRiasw
				ownerRiasw: this,
				id: this.id + "_menu",
				parentWidget: this
			});
			rias.dom.addClass(this.dropDown.domNode, this.baseClass.replace(/\s+|$/g, "Menu "));
		},
		_getMenuItemForOption: function(/*_FormSelectWidget.__SelectOption*/ option){
			// summary:
			//		For the given option, return the menu item that should be
			//		used to display it.  This can be overridden as needed
			if(!option.value && !option.label){
				// We are a separator (no label set for it)
				return new MenuSeparator({
					//ownerDocument: this.ownerDocument,
					ownerRiasw: this
				});
			}else{
				// Just a regular menu option
				var click = rias.hitch(this, "_setValueAttr", option);
				var item = new MenuItem({
					//ownerDocument: this.ownerDocument,
					ownerRiasw: this,
					option: option,
					label: (this.labelType === 'text'
						? (option.label || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;')
						: option.label) || this.emptyLabel,
					onClick: click,
					dir: this.dir,
					textDir: this.textDir,
					disabled: option.disabled || false
				});
				item.focusNode.setAttribute("role", "option");
				return item;
			}
		},

		_addOptionItem: function(/*_FormSelectWidget.__SelectOption*/ option){
			// summary:
			//		For the given option, add an option to our dropdown.
			//		If the option doesn't have a value, then a separator is added
			//		in that place.
			if(this.dropDown){
				this.dropDown.addChild(this._getMenuItemForOption(option));
			}
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
			if(!this.isDestroyed(true)){
				if(!this.disabled && this.focusNode.focus){
					try{
						this.focusNode.focus();
					}catch(e){
						//squelch errors from hidden nodes
					}
				}
			}
		},*/
		focusChild: function(/*_WidgetBase*/ widget, forceVisible){
			// summary:
			//		Sets the value to the given option, used during search by letter.
			// widget:
			//		Reference to option's widget
			// tags:
			//		protected
			if(!widget || widget.isDestroyed(false)){
				this.set('value', widget.option);
			}
			this.inherited(arguments);
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
						//ownerDocument: this.ownerDocument,
						ownerRiasw: this,
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
			var message = isValid ? "" : this._missingMsg;
			if(message && this.focused && this._hasBeenBlurred){
				rias.showTooltip(message, this.domNode, this.tooltipPositions, !this.isLeftToRight());
			}else{
				rias.hideTooltip(this.domNode);
			}
			this._set("message", message);
			return isValid;
		},
		isValid: function(/*Boolean*/ /*===== isFocused =====*/){
			// summary:
			//		Whether or not this is a valid value.  The only way a Select
			//		can be invalid is when it's required but nothing is selected.
			return (!this.required || this.value === 0 || !(/^\s*$/.test(this.value || ""))); // handle value is null or undefined
		},
		reset: function(){
			// summary:
			//		Overridden so that the state will be cleared.
			this.inherited(arguments);
			rias.hideTooltip(this.domNode);
			this._refreshState();	// to update this.state
		},
		postMixInProperties: function(){
			this.inherited(arguments);
			this._missingMsg = rias.i18n.getLocalization("riasw.form", "validate", this.lang).missingMessage;

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
		_onDestroy: function(preserveDom){
			rias.hideTooltip(this.domNode);	// in case Select (or enclosing Dialog) destroyed while tooltip shown
			this.inherited(arguments);
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

	Widget._Menu = _SelectMenu;	// for monkey patching
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