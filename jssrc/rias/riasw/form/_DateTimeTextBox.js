//RIAStudio client runtime widget - DateTextBox

define([
	"rias",
	"dijit/form/_DateTimeTextBox",
	"rias/riasw/form/TextBox"///extend(templateString)
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
			'</div>'
	});

	return _Widget;

});