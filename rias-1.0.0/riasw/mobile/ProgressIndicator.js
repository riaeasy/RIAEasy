
//RIAStudio client runtime widget - ProgressIndicator

define([
	"rias",
	"dojox/mobile/ProgressIndicator"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		"ProgressIndicator.css"
	]);

	var riaswType = "rias.riasw.mobile.ProgressIndicator";
	var Widget = rias.declare(riaswType, [_Widget], {

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
