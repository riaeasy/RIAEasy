
//RIAStudio client runtime widget - ProgressBar

define([
	"rias/riasw/mobile/mobileBase",
	"dojox/mobile/ProgressBar"
], function(rias, _Widget){

	rias.theme.loadCss([
		"ProgressBar.css"
	], true);

	var riasType = "rias.riasw.mobile.ProgressBar";
	var Widget = rias.declare(riasType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswProgressBarIcon",
		iconClass16: "riaswProgressBarIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
