
//RIAStudio client runtime widget - EdgeToEdgeCategory

define([
	"rias/riasw/mobile/mobileBase",
	"dojox/mobile/EdgeToEdgeCategory"
], function(rias, _Widget){

	rias.theme.loadRiasCss([
		"EdgeToEdgeCategory.css"
	], true);

	var riasType = "rias.riasw.mobile.EdgeToEdgeCategory";
	var Widget = rias.declare(riasType, [_Widget], {

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
