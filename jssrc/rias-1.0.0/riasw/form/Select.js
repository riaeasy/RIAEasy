//RIAStudio client runtime widget - Select

define([
	"rias",
	"dijit/form/Select",
	"dijit/form/_FormSelectWidget",
	"rias/riasw/widget/MenuItem",
	"rias/riasw/widget/MenuSeparator",
	"rias/riasw/store/StoreBase",
	"rias/riasw/store/ObjectStore"
], function(rias, _Widget, _FormSelectWidget, MenuItem, MenuSeparator) {

	_Widget.extend({
		templateString:
			'<div class="dijit dijitReset dijitInline dijitLeft" data-dojo-attach-point="_buttonNode,_popupStateNode" id="widget_${id}" role="listbox" aria-haspopup="true">'+
				'<div class="dijitReset riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_labelNode" tabIndex="-1" readonly="readonly" role="presentation"></div>'+
				'<div class="dijitReset dijitInputField dijitInputContainer riaswTextBoxContainer" data-dojo-attach-point="containerNode,focusNode,textDirNode,_aroundNode" role="presentation">'+
					'<input type="text" class="dijitReset dijitInputInner" data-dojo-attach-point="textbox" aria-labelledby="${id}_labelNode" role="textbox" readonly="readonly" ${!nameAttrSetting}/>'+
					'<input type="hidden" data-dojo-attach-point="valueNode" value="${value}" aria-hidden="true" ${!nameAttrSetting}/>'+
					'<div class="dijitReset dijitValidationContainer" data-dojo-attach-point="validationNode">'+
						'<input class="dijitReset dijitInputField dijitValidationIcon dijitValidationInner" value="&#935; " type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
					'</div>'+
				'</div>'+
				'<div class="dijitReset dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer" data-dojo-attach-point="titleNode" role="presentation">'+
					'<input class="dijitReset dijitInputField dijitArrowButtonInner" value="&#9660; " type="text" tabIndex="-1" readonly="readonly" role="presentation" aria-hidden="true" ${_buttonInputDisabled}/>'+
				'</div>'+
			'</div>',

		cssStateNodes: {
			"titleNode": "dijitDownArrowButton"
		},

		label: "",
		labelAlign: "",///"", "left", "right"
		labelWidth: "60px",
		spacing: "4px",
		showLabel: false,
		_setLabelAttr: function(value){
			var ln = this.labelNode;
			if(ln){
				ln.innerHTML = value;
			}
		},
		_setLabelWidthAttr: function(value){
			var ln = this.labelNode,
				b = this.labelWidth != value;
			///value 要允许是 string
			this._set("labelWidth", value);
			if(ln /*&& this.showLabel*/ && value !== undefined){
				rias.dom.setStyle(ln, "width", rias.isNumberLike(value) ? value + "px" : value);
			}
			if(this._started && b){
				this.resize();
			}
		},
		_setShowLabelAttr: function(value){
			var ln = this.labelNode,
				b = this.showLabel != value;
			this._set("showLabel", value);
			if(ln){
				if(value){
					//rias.dom.setStyle(ln, "width", rias.validate.isNumber(this.labelWidth) ? this.labelWidth + "px" : this.labelWidth);
					//rias.dom.setStyle(ln, "width", rias.isNumberLike(this.labelWidth) ? this.labelWidth + "px" : this.labelWidth);
					rias.dom.setStyle(ln, "padding-right", this.spacing);
					rias.dom.setStyle(ln, "visibility", "visible");
					rias.dom.setStyle(ln, "display", this._labelDisplay || "inline-block");
				}else{
					this._labelDisplay = rias.dom.getStyle(ln, "display");
					//rias.dom.setStyle(ln, "width", "0px");
					rias.dom.setStyle(ln, "padding-right", "0px");
					rias.dom.setStyle(ln, "visibility", "hidden");
					rias.dom.setStyle(ln, "display", "none");
				}
			}
			if(this._started && b){
				this.resize();
			}
		},
		_setSpacingAttr: function(value){
			var ln = this.labelNode,
				b = this.spacing != value;
			///value 要允许是 string
			this._set("spacing", value);
			if(ln && this.showLabel && value !== undefined){
				rias.dom.setStyle(ln, "padding-right", value);
			}
			if(this._started && b){
				this.resize();
			}
		},

		_setDisplay: function(/*String*/ newDisplay){
			// summary:
			//		sets the display for the given value (or values)

			var lbl = (this.labelType === 'text' ? (newDisplay || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') : newDisplay) || this.emptyLabel;
			//this.containerNode.innerHTML = '<span role="option" class="dijitReset dijitInline ' + this.baseClass.replace(/\s+|$/g, "Label ") + '">' + lbl + '</span>';
			///修改了 containerNode，用 textbox
			this.textbox.value = lbl;
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
			this.dropDown = new _Widget._Menu({
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
					ownerRiasw: this,
					ownerDocument: this.ownerDocument
				});
			}else{
				// Just a regular menu option
				var click = rias.hitch(this, "_setValueAttr", option);
				var item = new MenuItem({
					ownerRiasw: this,
					option: option,
					label: (this.labelType === 'text'
						? (option.label || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;')
						: option.label) || this.emptyLabel,
					onClick: click,
					ownerDocument: this.ownerDocument,
					dir: this.dir,
					textDir: this.textDir,
					disabled: option.disabled || false
				});
				item.focusNode.setAttribute("role", "option");
				return item;
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
						child.destroyRecursive();
					});
					var item = new MenuItem({
						ownerRiasw: this,
						ownerDocument: this.ownerDocument,
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
				this._setValueAttr(this.value, false);
			}
		},

		startup: function(){
			if(this._started){
				return;
			}
			this.inherited(arguments);
			var parent = this.getParent && this.getParent();
			if(!(parent && parent.isLayoutContainer)){
				this.own(rias.dom.Viewport.on("resize", rias.hitch(this, "resize")));
			}
			this.resize();
		},
		resize: function(changeSize, resultSize){
			if(this.isDestroyed(true)){
				return;
			}
			var dn = this.domNode,
				ln = this.labelNode,
				bn = this._buttonNode,
				cn = this.containerNode,// || this.domNode,///兼容 dijit.form.TextBox
				cs,
				h, w;
			if(changeSize){
				rias.dom.setMarginBox(dn, changeSize);
			}
			changeSize = rias.dom.getContentBox(dn);
			changeSize.h = h = Math.floor(changeSize.h);
			changeSize.w = w = Math.floor(changeSize.w);
			//if(rias.has("ff")){
				--w;
			//}

			if(bn){
				cs = rias.dom.getComputedStyle(bn);
				resultSize = rias.dom.getMarginBox(bn, cs);
				w -= resultSize.w;
				rias.dom.setMarginBox(bn, {
					h: h
				}, cs);
			}
			if(this.showLabel){
				cs = rias.dom.getComputedStyle(ln);
				resultSize = rias.dom.getMarginBox(ln, cs);
				w -= resultSize.w;
				rias.dom.setMarginBox(ln, {
					h: h
				}, cs);
				rias.dom.setStyle(ln, "line-height", rias.dom.marginBox2contentSize(ln, {w: 0, h: h}, cs).h + "px");
			}
			/// dijit.Editor 打包（Build）后，dijit.form.TextBox 不能 hack。
			cs = rias.dom.getComputedStyle(cn);
			rias.dom.setMarginBox(cn, {
				h: h,
				w: Math.floor(w)
			}, cs);
			rias.dom.setStyle(this.textbox, "line-height", rias.dom.marginBox2contentSize(cn, {w: 0, h: h}, cs).h + "px");
		},
		layout: function(){
			this.resize();
		}
	});

	var riasType = "rias.riasw.form.Select";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswSelectIcon",
		iconClass16: "riaswSelectIcon16",
		defaultParams: function(params){
			var p = rias.mixinDeep({}, {
				type: "button",
				//label: "Select",
				//showLabel: true,
				store: {
					_riaswType: "rias.riasw.store.JsonXhrStore",
					oldApi: true
				}
			}, params);
			return p;
		},
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
			"scrollOnFocus": {
				"datatype": "boolean",
				"description": "On focus, should this widget scroll into view?",
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