//RIAStudio client runtime widget - ComboBox

define([
	"rias",
	"dijit/form/ComboBox",
	"dijit/form/ComboBoxMixin",
	"dijit/form/_TextBoxMixin",
	"rias/riasw/form/ValidationTextBox"///extend(templateString)
], function(rias, _Widget, ComboBoxMixin, _TextBoxMixin) {

	////必须 extend ComboBoxMixin，因为 诸如 dijit.form.FilteringSelect 等控件也使用 ComboBoxMixin。
	ComboBoxMixin.extend({
		templateString:
			'<div class="dijit dijitReset dijitInline dijitLeft" id="widget_${id}" role="combobox" aria-haspopup="true" data-dojo-attach-point="_popupStateNode">'+
				'<div class="dijitReset riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_labelNode" tabIndex="-1" readonly="readonly" role="presentation">'+
				'</div>'+
				'<div class="dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer" data-dojo-attach-point="_buttonNode" role="presentation">'+
					'<input class="dijitReset dijitInputField dijitArrowButtonInner" value="&#9660;" type="text" tabIndex="-1" readonly="readonly" role="button presentation" aria-hidden="true"'+
						' ${_buttonInputDisabled}/>'+
				'</div>'+
				'<div class="dijitReset dijitValidationContainer" data-dojo-attach-point="validationNode">'+
					'<input class="dijitReset dijitInputField dijitValidationIcon dijitValidationInner" value="&#935;" type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
				'</div>'+
				'<div class="dijitReset dijitInputField dijitInputContainer riaswTextBoxContainer" data-dojo-attach-point="containerNode,_aroundNode">'+
					'<input class="dijitReset dijitInputInner" type="text" autocomplete="off" data-dojo-attach-point="textbox,focusNode" aria-labelledby="${id}_labelNode" role="textbox" ${!nameAttrSetting}/>'+
				'</div>'+
			'</div>'
	});
	_Widget.extend({
		templateString:
			'<div class="dijit dijitReset dijitInline dijitLeft" id="widget_${id}" role="combobox" aria-haspopup="true" data-dojo-attach-point="_popupStateNode">'+
				'<div class="dijitReset riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_labelNode" tabIndex="-1" readonly="readonly" role="presentation">'+
				'</div>'+
				'<div class="dijitReset dijitInputField dijitInputContainer riaswTextBoxContainer" data-dojo-attach-point="containerNode,_aroundNode">'+
					'<input class="dijitReset dijitInputInner" type="text" autocomplete="off" data-dojo-attach-point="textbox,focusNode" aria-labelledby="${id}_labelNode" role="textbox" ${!nameAttrSetting}/>'+
				'</div>'+
				'<div class="dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer" data-dojo-attach-point="_buttonNode" role="presentation">'+
					'<input class="dijitReset dijitInputField dijitArrowButtonInner" value="&#9660;" type="text" tabIndex="-1" readonly="readonly" role="button presentation" aria-hidden="true"'+
						' ${_buttonInputDisabled}/>'+
				'</div>'+
				'<div class="dijitReset dijitValidationContainer" data-dojo-attach-point="validationNode">'+
					'<input class="dijitReset dijitInputField dijitValidationIcon dijitValidationInner" value="&#935;" type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
				'</div>'+
			'</div>'
	});

	var riasType = "rias.riasw.form.ComboBox";
	var Widget = rias.declare(riasType, [_Widget], {
		destroy: function(){
			if(this.dropDown){
				rias.destroy(this.dropDown);
			}
			this.inherited(arguments);
		},

		parse: function(value /*=====, constraints =====*/){
			if(this.item){
				return this.item[this.searchAttr].toString();
			}
			return value;
		},
		_getDisplayedValueAttr: function(){
			try{
				if(this.item){
					if(this.labelAttr){
						return this.filter((this.store._oldAPI ? this.store.getValue(this.item, this.searchAttr) : this.item[this.searchAttr].toString()))
							+ "(" + (this.store._oldAPI ? this.store.getValue(this.item, this.labelAttr) : this.item[this.labelAttr].toString()) + ")";
					}
					return this.filter((this.store._oldAPI ? this.store.getValue(this.item, this.searchAttr) : this.item[this.searchAttr].toString()));
				}
				return this.filter(this.textbox.value);
			}catch(e){
				console.error(this.item, "_getDisplayedValueAttr() error: ", rias.getStackTrace(e));
				return this.searchAttr;
			}
		},
		labelFunc: function(item, store){
			try{
				if(this.labelAttr){
					return (store._oldAPI ? store.getValue(this.searchAttr) + "(" + store.getValue(item, this.labelAttr) + ")" :
						item[this.searchAttr].toString() + "(" + item[this.labelAttr].toString() + ")");
				}
				return (store._oldAPI ? store.getValue(item, this.searchAttr) : item[this.searchAttr].toString()) ; // String
			}catch(e){
				console.error(item, "labelFunc() error: ", rias.getStackTrace(e));
				return this.searchAttr;
			}
		},
		_getValueField: function(){
			return this.valueAttr || this.searchAttr;
		},
		_getValueAttr: function(){
			return this.inherited(arguments);
		},
		_setValueAttr: function(){
			this.inherited(arguments);
		},
		_setItemAttr: function(/*item*/ item, /*Boolean?*/ priorityChange, /*String?*/ displayedValue){
			// summary:
			//		Set the displayed valued in the input box, and the hidden value
			//		that gets submitted, based on a dojo.data store item.
			// description:
			//		Users shouldn't call this function; they should be calling
			//		set('item', value)
			// tags:
			//		private
			var value = '';
			if(item){
				if(!displayedValue){
					displayedValue = this.get("displayedValue");
				}
				//value = this._getValueField() != this.searchAttr ? this.store.getIdentity(item) : displayedValue;
				value = item[this._getValueField()];
			}
			this.set('value', value, priorityChange, displayedValue, item);
		},
		_announceOption: function(/*Node*/ node){
			// summary:
			//		a11y code that puts the highlighted option in the textbox.
			//		This way screen readers will know what is happening in the
			//		menu.

			if(!node){
				return;
			}
			// pull the text value from the item attached to the DOM node
			var newValue;
			if(node == this.dropDown.nextButton ||
				node == this.dropDown.previousButton){
				newValue = node.innerHTML;
				this.item = undefined;
				this.value = '';
			}else{
				var item = this.dropDown.items[node.getAttribute("item")];
				newValue = this.get("displayedValue");
				this.set('item', item, false, newValue);
			}
			// get the text that the user manually entered (cut off autocompleted text)
			this.focusNode.value = this.focusNode.value.substring(0, this._lastInput.length);
			// set up ARIA activedescendant
			this.focusNode.setAttribute("aria-activedescendant", rias.dom.getAttr(node, "id"));
			// autocomplete the rest of the option to announce change
			this._autoCompleteText(newValue);
		},
		_autoCompleteText: function(/*String*/ text){
			// summary:
			//		Fill in the textbox with the first item from the drop down
			//		list, and highlight the characters that were
			//		auto-completed. For example, if user typed "CA" and the
			//		drop down list appeared, the textbox would be changed to
			//		"California" and "ifornia" would be highlighted.

			text = this._getDisplayedValueAttr();
			var fn = this.focusNode;

			// IE7: clear selection so next highlight works all the time
			_TextBoxMixin.selectInputText(fn, fn.value.length);
			// does text autoComplete the value in the textbox?
			var caseFilter = this.ignoreCase ? 'toLowerCase' : 'substr';
			if(text[caseFilter](0).indexOf(this.focusNode.value[caseFilter](0)) == 0){
				var cpos = this.autoComplete ? this._getCaretPos(fn) : fn.value.length;
				// only try to extend if we added the last character at the end of the input
				if((cpos + 1) > fn.value.length){
					// only add to input node as we would overwrite Capitalisation of chars
					// actually, that is ok
					fn.value = text;//.substr(cpos);
					// visually highlight the autocompleted characters
					_TextBoxMixin.selectInputText(fn, cpos);
				}
			}else{
				// text does not autoComplete; replace the whole value and highlight
				fn.value = text;
				_TextBoxMixin.selectInputText(fn);
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswComboBoxIcon",
		iconClass16: "riaswComboBoxIcon16",
		defaultParams: function(params){
			params = rias.mixinDeep({}, {
				type: "text",
				labelType: "html",
				label: "ComboBox",
				tabIndex: 0,
				invalidMessage: rias.i18n.message.invalid,
				constraints: {locale: ""},
				regExp: ".*",
				tooltipPosition: [],
				//pageSize: null,
				query: {},
				queryExpr: "${0}*",
				autoComplete: true,
				searchDelay: 200,
				searchAttr: "name",
				ignoreCase: true,
				hasDownArrow: true,
				scrollOnFocus: true,
				highlightMatch: "first"
			}, params);
			if(!params.store && !this.srcNodeRef){///注意：!params.store && this.srcNodeRef 的时候，默认是取 srcNodeRef 中的数据。
				params.store = {
					_riaswType: "rias.riasw.store.MemoryStore"
				};
				if(params.data){
					params.store.data = params.data;
				}
			}
			if(params.idAttribute){
				params.store.idAttribute = params.idAttribute;
				//params.idAttribute = undefined;
			}
			return params;
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
				"hidden": true
			},
			"uppercase": {
				"datatype": "boolean",
				"hidden": true
			},
			"lowercase": {
				"datatype": "boolean",
				"hidden": true
			},
			"propercase": {
				"datatype": "boolean",
				"hidden": true
			},
			"maxLength": {
				"datatype": "string",
				"title": "Max Length"
			},
			"required": {
				"datatype": "boolean",
				"title": "Required",
				"hidden": true
			},
			"promptMessage": {
				"datatype": "string",
				"title": "Prompt Message",
				"hidden": true
			},
			"invalidMessage": {
				"datatype": "string",
				"defaultValue": "The value entered is not valid.",
				"title": "Invalid Message",
				"hidden": true
			},
			"constraints": {
				"datatype": "json",
				"defaultValue": "\"{\\\"locale\\\":\\\"\\\"}\"",
				"title": "Constraints",
				"hidden": true
			},
			"regExp": {
				"datatype": "string",
				"defaultValue": ".*",
				"title": "Regular Expression",
				"hidden": true
			},
			"tooltipPosition": {
				"datatype": "array",
				"defaultValue": "[]",
				"title": "Tooltip Positions",
				"hidden": true
			},
			"pageSize": {
				"datatype": "number",
				"defaultValue": null,
				"title": "Page Size"
			},
			"store": {
				"datatype": "object",
				"hidden": true
			},
			"query": {
				"datatype": "json",
				"defaultValue": "\"{}\"",
				"hidden": true
			},
			"autoComplete": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Auto Complete"
			},
			"searchDelay": {
				"datatype": "number",
				"defaultValue": 100,
				"title": "Search Delay",
				"description": "Search delay (ms)"
			},
			"searchAttr": {
				"datatype": "string",
				"defaultValue": "name",
				"title": "Search Attribute"
			},
			"queryExpr": {
				"datatype": "string",
				"defaultValue": "${0}*",
				"title": "Query Expression"
			},
			"ignoreCase": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Ignore Case"
			},
			"hasDownArrow": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Show Down Arrow"
			},
			"state": {
				"datatype": "string",
				"description": "Shows current state (ie, validation result) of input (Normal, Warning, or Error)",
				"hidden": true
			},
			"scrollOnFocus": {
				"datatype": "boolean",
				"description": "On focus, should this widget scroll into view?",
				"hidden": false,
				"defaultValue": true
			},
			"item": {
				"datatype": "object",
				"description": "This is the item returned by the dojo.data.store implementation that\nprovides the data for this cobobox, it's the currently selected item.",
				"hidden": true
			},
			"fetchProperties": {
				"datatype": "json",
				"description": "Mixin to the dojo.data store's fetch.\nFor example, to set the sort order of the ComboBox menu, pass:\n\t{ sort: {attribute:\"name\",descending: true} }\nTo override the default queryOptions so that deep=false, do:\n\t{ queryOptions: {ignoreCase: true, deep: false} }",
				"hidden": true
			},
			"highlightMatch": {
				"datatype": "string",
				"defaultValue": "first",
				"option": [
					{
						"value": "first"
					},
					{
						"value": "all"
					},
					{
						"value": "none"
					}
				],
				"description": "One of: \"first\", \"all\" or \"none\".\n\nIf the ComboBox/FilteringSelect opens with the search results and the searched\nstring can be found, it will be highlighted.  If set to \"all\"\nthen will probably want to change queryExpr parameter to '*${0}*'\n\nHighlighting is only performed when labelType is \"text\", so as to not\ninterfere with any HTML markup an HTML label might contain.",
				"hidden": false
			},
			"labelAttr": {
				"datatype": "string",
				"description": "The entries in the drop down list come from this attribute in the\ndojo.data items.\nIf not specified, the searchAttr attribute is used instead.",
				"hidden": false
			},
			"labelType": {
				"datatype": "string",
				"option": [
					{
						"value": "text"
					},
					{
						"value": "html"
					}
				],
				"description": "Specifies how to interpret the labelAttr in the data store items.\nCan be \"html\" or \"text\".",
				"defaultValue": "text",
				"title": "Label Type"
			}
		}
	};

	return Widget;

});