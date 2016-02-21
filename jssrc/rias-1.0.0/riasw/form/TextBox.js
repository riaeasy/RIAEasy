//RIAStudio client runtime widget - TextBox

define([
	"rias",
	"dijit/form/TextBox",
	"dijit/form/_FormValueWidget"
], function(rias, _Widget, _FormValueWidget) {

	_FormValueWidget.extend({
		select: function(){
			if(this.textbox){
				this.textbox.select();
			}
		}
	});

	_Widget.extend({
		templateString:
			'<div class="dijit dijitReset dijitInline dijitLeft" id="widget_${id}" role="presentation">'+
				'<div class="dijitReset riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_labelNode" tabIndex="-1" readonly="readonly" role="presentation">'+
				'</div>'+
				'<div class="dijitReset dijitInputField dijitInputContainer riaswTextBoxContainer" data-dojo-attach-point="containerNode">'+
					'<input class="dijitReset dijitInputInner" data-dojo-attach-point="textbox,focusNode" tabIndex="0" aria-labelledby="${id}_labelNode" autocomplete="off"'+
						'${!nameAttrSetting} type="${type}"/>'+
				'</div>'+
			'</div>',

		//baseClass: "dijitTextBox",
		editable: true,

		label: "",
		labelAlign: "",///"", "left", "right"
		labelWidth: "60px",
		spacing: "4px",
		showLabel: false,
		_setLabelAttr: function(value){
			if(this.labelNode){
				this.labelNode.innerHTML = value;
			}
		},
		_setLabelStyleAttr: function(value){
			rias.dom.setStyle(this.labelNode, value);
		},
		_setLabelWidthAttr: function(value){
			var b = this.labelWidth != value;
			///value 要允许是 string
			this._set("labelWidth", value);
			if(this.labelNode /*&& this.showLabel*/ && value !== undefined){
				if(rias.likeNumber(value)){
					value = value + "px";
				}
				rias.dom.setStyle(this.labelNode, "width", value);
			}
			if(this._started && b){
				this.resize();
			}
		},
		_setShowLabelAttr: function(value){
			var b = this.showLabel != value;
			this._set("showLabel", value);
			if(this.labelNode){
				if(value){
					//rias.dom.setStyle(this.labelNode, "width", rias.validate.isNumber(this.labelWidth) ? this.labelWidth + "px" : this.labelWidth);
					//rias.dom.setStyle(this.labelNode, "width", rias.likeNumber(this.labelWidth) ? this.labelWidth + "px" : this.labelWidth);
					rias.dom.setStyle(this.labelNode, "padding-right", this.spacing);
					rias.dom.setStyle(this.labelNode, "visibility", "visible");
					rias.dom.setStyle(this.labelNode, "display", this._labelDisplay || "inline-block");
				}else{
					this._labelDisplay = rias.dom.getStyle(this.labelNode, "display");
					//rias.dom.setStyle(this.labelNode, "width", "0px");
					rias.dom.setStyle(this.labelNode, "padding-right", "0px");
					rias.dom.setStyle(this.labelNode, "visibility", "hidden");
					rias.dom.setStyle(this.labelNode, "display", "none");
				}
			}
			if(this._started && b){
				this.resize();
			}
		},
		_setSpacingAttr: function(value){
			var b = this.spacing != value;
			///value 要允许是 string
			this._set("spacing", value);
			if(this.labelNode && this.showLabel && value !== undefined){
				rias.dom.setStyle(this.labelNode, "padding-right", value);
			}
			if(this._started && b){
				this.resize();
			}
		},
		_setBoxStyleAttr: function(value){
			rias.dom.setStyle(this.containerNode, value);
		},

		_setReadOnlyAttr: function(/*Boolean*/ value){
			value = !! value;
			rias.dom.setAttr(this.focusNode, 'readOnly', value || !this.editable);

			this._set("readOnly", value);
			if(value || !this.editable){
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
			this._set("editable", !!value);
			rias.dom.setAttr(this.textbox, "readonly", (this.readOnly || !value));
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
			if(this._riasrDestroying || this._beingDestroyed){
				return;
			}
			var dn = this.domNode,
				ln = this.labelNode,
				bn = this._buttonNode,
				cn = this.containerNode,// || this.domNode,///兼容 dijit.form.TextBox
				mb = resultSize || {},
				cs,
				me,
				be,
				pe;
			if(changeSize){
				rias.dom.setMarginBox(dn, changeSize);
			}
			rias.mixin(mb, changeSize || {}); // changeSize overrides resultSize
			if(!("h" in mb) || !("w" in mb)){
				mb = rias.mixin(rias.dom.getMarginBox(dn), mb); // just use domGeometry.setMarginBox() to fill in missing values
			}

			this._contentBox = rias.dom.getContentBox(dn);
			if(bn){
				this._contentBox.w -= Math.ceil(rias.dom.getMarginBox(bn).w);
				cs = rias.dom.getComputedStyle(bn);
				me = rias.dom.getMarginExtents(bn, cs);
				be = rias.dom.getBorderExtents(bn, cs);
				pe = rias.dom.getPadExtents(bn, cs);
				rias.dom.setStyle(bn, "height", (this._contentBox.h - me.h - be.h - pe.h) + "px");
			}
			if(this.showLabel){
				this._contentBox.w -= Math.ceil(rias.dom.getMarginBox(ln).w);
				cs = rias.dom.getComputedStyle(ln);
				me = rias.dom.getMarginExtents(ln, cs);
				be = rias.dom.getBorderExtents(ln, cs);
				pe = rias.dom.getPadExtents(ln, cs);
				rias.dom.setStyle(ln, "height", (this._contentBox.h - me.h - be.h - pe.h) + "px");
				rias.dom.setStyle(ln, "line-height", (this._contentBox.h - me.h - be.h - pe.h) + "px");
			}
			/// dijit.Editor 打包（Build）后，dijit.form.TextBox 不能 hack。
			//cn = cn || dn;
			cs = rias.dom.getComputedStyle(cn);
			me = rias.dom.getMarginExtents(cn, cs);
			be = rias.dom.getBorderExtents(cn, cs);
			pe = rias.dom.getPadExtents(cn, cs);
			rias.dom.setMarginBox(cn, {
				h: this._contentBox.h > 0 ? this._contentBox.h : undefined,
				w: this._contentBox.w
			});
			if(this._contentBox.h > 0){
				rias.dom.setStyle(this.textbox, "height", this._contentBox.h + "px");
				rias.dom.setStyle(this.textbox, "line-height", this._contentBox.h + "px");
			}
		},
		layout: function(){
			this.resize();
		}

	});

	var riasType = "rias.riasw.form.TextBox";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTextBoxIcon",
		iconClass16: "riaswTextBoxIcon16",
		defaultParams: {
			//content: "<input type='text'></input>",
			type: "text",
			//tabIndex: 0,
			scrollOnFocus: true
		},
		initialSize: {},
		resizable: "width",
		//allowedChild: "",
		"property": {
			"type": {
				"datatype": "string",
				"option": [
					{
						"value": "text"
					},
					{
						"value": "password"
					}
				],
				"defaultValue": "text",
				"title": "Type"
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
				"title": "Read Only"
			},
			"intermediateChanges": {
				"datatype": "boolean",
				"title": "Intermediate Changes"
			},
			"trim": {
				"datatype": "boolean",
				"title": "Trim"
			},
			"uppercase": {
				"datatype": "boolean",
				"title": "Upper Case"
			},
			"lowercase": {
				"datatype": "boolean",
				"title": "Lower Case"
			},
			"propercase": {
				"datatype": "boolean",
				"title": "Proper Case"
			},
			"maxLength": {
				"datatype": "string",
				"title": "Max Length"
			},
			"selectOnClick": {
				"datatype": "boolean",
				"defaultValue": "false"
			},
			"placeHolder": {
				"datatype": "string"
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