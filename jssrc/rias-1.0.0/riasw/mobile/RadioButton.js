
//RIAStudio client runtime widget - RadioButton

define([
	"rias",
	"dojox/mobile/RadioButton"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		"RadioButton.css"
	]);

	var riaswType = "rias.riasw.mobile.RadioButton";
	var Widget = rias.declare(riaswType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswRadioButtonIcon",
		iconClass16: "riaswRadioButtonIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
