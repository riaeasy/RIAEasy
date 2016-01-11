
//RIAStudio client runtime widget - ProgressIndicator

define([
	"rias/riasw/mobile/mobileBase",
	"dojox/mobile/ProgressIndicator"
], function(rias, _Widget){

	rias.theme.loadCss([
		"ProgressIndicator.css"
	], true);

	var riasType = "rias.riasw.mobile.ProgressIndicator";
	var Widget = rias.declare(riasType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswProgressIndicatorIcon",
		iconClass16: "riaswProgressIndicatorIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
