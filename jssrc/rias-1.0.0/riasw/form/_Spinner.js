//RIAStudio client runtime widget - NumberSpinner

define([
	"rias",
	"dijit/form/_Spinner",
	"rias/riasw/form/ValidationTextBox"///extend(templateString)
], function(rias, _Widget) {

	_Widget.extend({
		templateString:
			'<div class="dijit dijitReset dijitInline dijitLeft" id="widget_${id}" role="presentation">'+
				'<div class="dijitReset riaswTextBoxLabel" data-dojo-attach-point="labelNode" tabIndex="-1" readonly="readonly" role="presentation">'+
				'</div>'+
				'<div class="dijitReset dijitButtonNode dijitSpinnerButtonContainer" data-dojo-attach-point="_buttonNode">'+
					'<input class="dijitReset dijitInputField dijitSpinnerButtonInner" type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
					'<div class="dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitUpArrowButton" data-dojo-attach-point="upArrowNode">'+
						'<div class="dijitArrowButtonInner">'+
							'<input class="dijitReset dijitInputField" value="&#9650; " type="text" tabIndex="-1" readonly="readonly" role="presentation"'+
								'${_buttonInputDisabled}/>'+
						'</div>'+
					'</div>'+
					'<div class="dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitDownArrowButton" data-dojo-attach-point="downArrowNode">'+
						'<div class="dijitArrowButtonInner">'+
							'<input class="dijitReset dijitInputField" value="&#9660; " type="text" tabIndex="-1" readonly="readonly" role="presentation"'+
								'${_buttonInputDisabled}/>'+
						'</div>'+
					'</div>'+
				'</div>'+
				'<div class="dijitReset dijitInputField dijitInputContainer riaswTextBoxContainer" data-dojo-attach-point="containerNode">'+
					'<input class="dijitReset dijitInputInner" data-dojo-attach-point="textbox,focusNode" type="${type}" data-dojo-attach-event="onkeydown:_onKeyDown" role="spinbutton" autocomplete="off"'+
					 	'${!nameAttrSetting}/>'+
				'</div>'+
				'<div class="dijitReset dijitValidationContainer" data-dojo-attach-point="validationNode">'+
					'<input class="dijitReset dijitInputField dijitValidationIcon dijitValidationInner"'+
						'value="&#935;" type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
				'</div>'+
			'</div>'
	});

	return _Widget;

});