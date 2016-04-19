//RIAStudio client runtime widget - DateTextBox

define([
	"rias",
	"dijit/form/_DateTimeTextBox",
	"rias/riasw/form/TextBox"///extend()
], function(rias, _Widget) {

	_Widget.extend({
		templateString:
			'<div class="dijit dijitReset dijitInline dijitLeft" id="widget_${id}" role="combobox" aria-haspopup="true" data-dojo-attach-point="_popupStateNode">'+
				'<div class="dijitReset riaswTextBoxLabel" data-dojo-attach-point="labelNode" tabIndex="-1" readonly="readonly" role="presentation">'+
				'</div>'+
				'<div class="dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer" data-dojo-attach-point="_buttonNode" role="presentation">'+
					'<input class="dijitReset dijitInputField dijitArrowButtonInner" value="&#9660;" type="text" tabIndex="-1" readonly="readonly" role="button presentation" aria-hidden="true"'+
						'${_buttonInputDisabled}/>'+
				'</div>'+
				'<div class="dijitReset dijitValidationContainer" data-dojo-attach-point="validationNode">'+
					'<input class="dijitReset dijitInputField dijitValidationIcon dijitValidationInner" value="&#935; " type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
				'</div>'+
				'<div class="dijitReset dijitInputField dijitInputContainer riaswTextBoxContainer" data-dojo-attach-point="containerNode">'+
					'<input class="dijitReset dijitInputInner" type="text" autocomplete="off" data-dojo-attach-point="textbox,focusNode" role="textbox" ${!nameAttrSetting}/>'+
				'</div>'+
			'</div>',

		openDropDown: function(/*Function*/ callback){
			// rebuild drop down every time, so that constraints get copied (#6002)
			if(this.dropDown){
				this.dropDown.destroy();
			}
			var PopupProto = rias.isString(this.popupClass) ? rias.getObject(this.popupClass, false) : this.popupClass,
				textBox = this,
				value = this.get("value");
			this.dropDown = new PopupProto({
				ownerRiasw: this,
				onChange: function(value){
					// this will cause InlineEditBox and other handlers to do stuff so make sure it's last
					textBox.set('value', value, true);
				},
				id: this.id + "_popup",
				dir: textBox.dir,
				lang: textBox.lang,
				value: value,
				textDir: textBox.textDir,
				currentFocus: !this._isInvalidDate(value) ? value : this.dropDownDefaultValue,
				constraints: textBox.constraints,
				filterString: textBox.filterString, // for TimeTextBox, to filter times shown
				datePackage: textBox.datePackage,
				isDisabledDate: function(/*Date*/ date){
					// summary:
					//		disables dates outside of the min/max of the _DateTimeTextBox
					return !textBox.rangeCheck(date, textBox.constraints);
				}
			});

			this.inherited(arguments);
		}

	});

	return _Widget;

});