
//RIAStudio client runtime widget - SpinWheel

define([
	"rias",
	"dojox/mobile/SpinWheel",
	"rias/riasw/mobile/scrollable"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		"SpinWheel.css"
	]);

	var riaswType = "rias.riasw.mobile.SpinWheel";
	var Widget = rias.declare(riaswType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswSpinWheelIcon",
		iconClass16: "riaswSpinWheelIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
