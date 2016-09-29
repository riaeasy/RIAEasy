
//RIAStudio client runtime widget - RoundRectCategory

define([
	"rias",
	"dojox/mobile/RoundRectCategory"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		"RoundRectCategory.css"
	]);

	var riaswType = "rias.riasw.mobile.RoundRectCategory";
	var Widget = rias.declare(riaswType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswRoundRectCategoryIcon",
		iconClass16: "riaswRoundRectCategoryIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
