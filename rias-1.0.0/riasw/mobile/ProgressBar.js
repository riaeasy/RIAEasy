
//RIAStudio client runtime widget - ProgressBar

define([
	"rias",
	"dojox/mobile/ProgressBar"
], function(rias, _Widget){

	//rias.theme.loadMobileThemeCss([
	//	"ProgressBar.css"
	//]);

	var riaswType = "rias.riasw.mobile.ProgressBar";
	var Widget = rias.declare(riaswType, [_Widget], {

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
