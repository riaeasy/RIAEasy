//RIAStudio client runtime widget - Select

define([
	"rias",
	"dijit/form/Select",
	"dijit/form/_FormSelectWidget",
	"rias/riasw/store/StoreBase",
	"rias/riasw/store/ObjectStore"
], function(rias, _Widget, _FormSelectWidget, StoreBase, ObjectStore) {

	_FormSelectWidget.extend({
		_setStoreAttr: function(val){
			var store = val;
			if(this._created){		// don't repeat work that will happen in postCreate()
				if(!store.getFeatures && rias.isInstanceOf(store, StoreBase)){
					val = new ObjectStore({
						idProperty: store.idAttribute || "id",
						labelProperty: store.labelAttribute || "label",
						objectStore: store
					});
				}
				this._deprecatedSetStore(val);
			}
		},
		postCreate: function(){
			// summary:
			//		sets up our event handling that we need for functioning
			//		as a select
			this.inherited(arguments);

			// Make our event connections for updating state
			rias.after(this, "onChange", rias.hitch(this, "_updateSelection"));

			//		Connects in our store, if we have one defined
			var store = this.store;
			if(store && (store.getIdentity || store.getFeatures()["dojo.data.api.Identity"])){
				// Temporarily set our store to null so that it will get set
				// and connected appropriately
				this.store = null;
				if(!store.getFeatures && rias.isInstanceOf(store, StoreBase)){
					this._deprecatedSetStore(new ObjectStore({
						idProperty: store.idAttribute || "id",
						labelProperty: store.labelAttribute || "label",
						objectStore: store
					}), this._oValue, {query: this.query, queryOptions: this.queryOptions});
				}else{
					this._deprecatedSetStore(store, this._oValue, {query: this.query, queryOptions: this.queryOptions});
				}
			}

			this._storeInitialized = true;
		}
	});

	_Widget.extend({
		templateString:
			'<div data-dojo-attach-point="_popupStateNode" class="dijit dijitReset dijitInline dijitLeft" id="widget_${id}" role="combobox" aria-haspopup="true">'+
				'<div data-dojo-attach-point="labelNode" class="dijitReset riaswTextBoxLabel" id="${id}_labelNode" tabIndex="-1" readonly="readonly" role="presentation">'+
				'</div>'+
				'<div data-dojo-attach-point="validationNode" class="dijitReset dijitValidationContainer">'+
					'<input class="dijitReset dijitInputField dijitValidationIcon dijitValidationInner" value="&#935; " type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
				'</div>'+
				'<div data-dojo-attach-point="containerNode,textDirNode,_aroundNode" class="dijitReset dijitInputField dijitInputContainer riaswTextBoxContainer" role="presentation">'+
					'<input type="text" data-dojo-attach-point="textbox,focusNode" class="dijitReset dijitInputInner" aria-labelledby="${id}_labelNode" role="textbox" readonly="readonly" ${!nameAttrSetting}/>'+
					'<input type="hidden" data-dojo-attach-point="valueNode" value="${value}" aria-hidden="true" ${!nameAttrSetting}/>'+
				'</div>'+
				'<div data-dojo-attach-point="_buttonNode" class="dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer" role="presentation">'+
					'<input class="dijitReset dijitInputField dijitArrowButtonInner" value="&#9660; " type="text" tabIndex="-1" readonly="readonly" role="presentation" aria-hidden="true" ${_buttonInputDisabled}/>'+
				'</div>'+
			'</div>',

		cssStateNodes: {
			"_buttonNode": "dijitDownArrowButton"
		},

		_setDisplay: function(/*String*/ newDisplay){
			// summary:
			//		sets the display for the given value (or values)

			var lbl = (this.labelType === 'text' ? (newDisplay || '')
				.replace(/&/g, '&amp;').replace(/</g, '&lt;') :
				newDisplay) || this.emptyLabel;
			//this.containerNode.innerHTML = '<span role="option" class="dijitReset dijitInline ' + this.baseClass.replace(/\s+|$/g, "Label ") + '">' + lbl + '</span>';
			this.textbox.value = lbl;
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
				if(rias.likeNumber(value)){
					value = value + "px";
				}
				rias.dom.setStyle(ln, "width", value);
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
					//rias.dom.setStyle(ln, "width", rias.likeNumber(this.labelWidth) ? this.labelWidth + "px" : this.labelWidth);
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
			var dn = this.domNode,
				ln = this.labelNode,
				bn = this._buttonNode,
				cn = this.containerNode,
				mb = resultSize || {},
				cs,
				me,
				be,
				pe;
			if(this._destroying || this._destroyed){
				return;
			}
			if(changeSize){
				rias.dom.setMarginBox(dn, changeSize);
			}
			rias.mixin(mb, changeSize || {}); // changeSize overrides resultSize
			if(!("h" in mb) || !("w" in mb)){
				mb = rias.mixin(rias.dom.getMarginBox(dn), mb); // just use domGeometry.setMarginBox() to fill in missing values
			}

			this._contentBox = rias.dom.getContentBox(dn);
			if(bn){
				this._contentBox.w -= rias.dom.getMarginBox(bn).w;
				cs = rias.dom.getComputedStyle(bn);
				me = rias.dom.getMarginExtents(bn, cs);
				be = rias.dom.getBorderExtents(bn, cs);
				pe = rias.dom.getPadExtents(bn, cs);
				rias.dom.setStyle(bn, "height", (this._contentBox.h - me.h - be.h - pe.h) + "px");
			}
			if(this.showLabel){
				this._contentBox.w -= rias.dom.getMarginBox(ln).w;
				rias.dom.setStyle(ln, "height", this._contentBox.h + "px");
				rias.dom.setStyle(ln, "line-height", this._contentBox.h + "px");
			}
			rias.dom.setMarginBox(cn, this._contentBox);
			rias.dom.setStyle(this.textbox, "height", this._contentBox.h + "px");
			rias.dom.setStyle(this.textbox, "line-height", this._contentBox.h + "px");
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
				label: "Select",
				tabIndex: 0,
				showLabel: true,
				scrollOnFocus: true,
				store: {
					_riaswType: "rias.riasw.store.JsonRestStore",
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