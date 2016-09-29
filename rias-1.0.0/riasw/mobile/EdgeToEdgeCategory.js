
//RIAStudio client runtime widget - EdgeToEdgeCategory

define([
	"rias",
	"dojox/mobile/EdgeToEdgeCategory"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		"EdgeToEdgeCategory.css"
	]);

	var riaswType = "rias.riasw.mobile.EdgeToEdgeCategory";
	var Widget = rias.declare(riaswType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswEdgeToEdgeCategoryIcon",
		iconClass16: "riaswEdgeToEdgeCategoryIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
