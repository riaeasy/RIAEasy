//RIAStudio client runtime widget - TextArea(SimpleTextarea)

define([
	"rias",
	"dijit/form/SimpleTextarea",
	"rias/riasw/form/TextBox"///extend(templateString)
], function(rias, _Widget) {

	_Widget.extend({
		templateString:
			'<div class="dijit dijitReset dijitInline dijitLeft" id="widget_${id}" role="presentation">'+
				'<div class="dijitReset riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_labelNode" tabIndex="-1" readonly="readonly" role="presentation">'+
				'</div>'+
				'<textarea class="riaswTextBoxContainer" data-dojo-attach-point="focusNode,containerNode,textbox" aria-labelledby="${id}_labelNode" autocomplete="off" ${!nameAttrSetting}></textarea>'+
			'</div>',

		_setWhiteSpaceAttr: function(value){
			rias.dom.setStyle(this.textbox, "white-space", value);
		},
		_setWordWrapAttr: function(value){
			rias.dom.setStyle(this.textbox, "word-wrap", value);
		},
		resize: function(changeSize, resultSize){
			if(this._riasrDestroying || this._beingDestroyed){
				return;
			}
			var dn = this.domNode,
				ln = this.labelNode,
				bn = this._buttonNode,
				cn = this.containerNode,
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
				this._contentBox.w -= rias.dom.getMarginBox(bn).w;
				cs = rias.dom.getComputedStyle(bn);
				me = rias.dom.getMarginExtents(bn, cs);
				be = rias.dom.getBorderExtents(bn, cs);
				pe = rias.dom.getPadExtents(bn, cs);
				rias.dom.setStyle(bn, "height", (this._contentBox.h - me.h - be.h - pe.h) + "px");
			}
			if(this.showLabel){
				this._contentBox.w -= rias.dom.getMarginBox(ln).w;
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
				w: this._contentBox.w,
				h: this._contentBox.h
			});
			rias.dom.setStyle(this.textbox, "height", this._contentBox.h + "px");
			//rias.dom.setStyle(this.textbox, "line-height", this._contentBox.h + "px");
		}

	});

	var riasType = "rias.riasw.form.TextArea";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTextAreaIcon",
		iconClass16: "riaswTextAreaIcon16",
		defaultParams: {
			//content: "<textarea type='text'></textarea>",
			width: "200px",
			height: "auto",
			rows: "10",
			cols: "10",
			tabIndex: 0,
			scrollOnFocus: true
		},
		initialSize: {},
		resizable: "width",
		//allowedChild: "",
		"property": {
			"name": {
				"datatype": "string",
				"title": "Name"
			},
			"alt": {
				"datatype": "string",
				"hidden": true
			},
			"_children": {
				"datatype": "string",
				"title": "Text"
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
			"rows": {
				"datatype": "string",
				"title": "Rows"
			},
			"cols": {
				"datatype": "string",
				"title": "Columns"
			},
			"trim": {
				"datatype": "boolean",
				"description": "Removes leading and trailing whitespace if true.  Default is false.",
				"hidden": false
			},
			"uppercase": {
				"datatype": "boolean",
				"description": "Converts all characters to uppercase if true.  Default is false.",
				"hidden": false
			},
			"lowercase": {
				"datatype": "boolean",
				"description": "Converts all characters to lowercase if true.  Default is false.",
				"hidden": false
			},
			"propercase": {
				"datatype": "boolean",
				"description": "Converts the first character of each word to uppercase if true.",
				"hidden": false
			},
			"maxLength": {
				"datatype": "string",
				"description": "HTML INPUT tag maxLength declaration.",
				"hidden": false
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