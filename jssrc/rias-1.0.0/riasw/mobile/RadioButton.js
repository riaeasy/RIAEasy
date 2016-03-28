
//RIAStudio client runtime widget - RadioButton

define([
	"rias",
	"dojox/mobile/RadioButton"
], function(rias, _Widget){

	rias.theme.loadRiasCss([
		"RadioButton.css"
	], true);

	var riasType = "rias.riasw.mobile.RadioButton";
	var Widget = rias.declare(riasType, [_Widget], {

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
