//RIAStudio client runtime widget - TextArea(SimpleTextarea)

define([
	"rias",
	"rias/riasw/form/SimpleTextarea"
], function(rias, _Widget) {

	_Widget.extend({

		templateString:
			'<div class="dijitReset dijitInline dijitLeft" id="widget_${id}" role="presentation">'+
				'<div class="dijitInline riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_labelNode" tabIndex="-1" readonly="readonly" role="presentation">'+
				'</div>'+
				'<span class="dijitInline dijitInputField riaswTextBoxContainer" data-dojo-attach-point="containerNode">'+
					'<textarea class="riaswInputInner" data-dojo-attach-point="focusNode,textbox" aria-labelledby="${id}_labelNode" autocomplete="off" ${!nameAttrSetting}></textarea>'+
				'</span>'+
			'</div>',

		baseClass: "riaswTextBox riaswTextArea",

		_setWhiteSpaceAttr: function(value){
			rias.dom.setStyle(this.textbox, "white-space", value);
		},
		_setWordWrapAttr: function(value){
			rias.dom.setStyle(this.textbox, "word-wrap", value);
		},
		resize: function(changeSize, resultSize){
			if(this.isDestroyed(true)){
				return;
			}
			var dn = this.domNode,
				ln = this.labelNode,
				//bn = this._buttonNode,
				cn = this.containerNode,// || this.domNode,///兼容 dijit.form.TextBox
				tn = this.textbox,
				cs,
				h, w;
			if(changeSize){
				rias.dom.setMarginBox(dn, changeSize);
			}
			changeSize = rias.dom.getContentMargin(dn);
			changeSize.h = h = Math.floor(changeSize.h);
			changeSize.w = w = Math.floor(changeSize.w);
			//if(rias.has("ff")){
			--w;
			//}

			if(this.showLabel){
				cs = rias.dom.getComputedStyle(ln);
				resultSize = rias.dom.getMarginBox(ln, cs);
				w -= resultSize.w;
				rias.dom.setMarginSize(ln, {
					h: h
				}, cs);
				rias.dom.setStyle(ln, "line-height", rias.dom.getContentMargin(ln, cs).h + "px");
			}
			w = Math.floor(w);
			/// dijit.Editor 打包（Build）后，dijit.form.TextBox 不能 hack。
			cs = rias.dom.getComputedStyle(cn);
			rias.dom.setMarginSize(cn, {
				h: h,
				w: w
			}, cs);
			resultSize = rias.dom.getMarginBox(cn);
			resultSize = rias.dom.getContentMargin(cn);
			h = Math.floor(resultSize.h);
			w = Math.floor(resultSize.w);
			cs = rias.dom.getComputedStyle(tn);
			rias.dom.setMarginSize(tn, {
				h: h,
				w: w
			}, cs);
		}

	});

	var riaswType = "rias.riasw.form.TextArea";
	var Widget = rias.declare(riaswType, [_Widget], {
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
			cols: "10"
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