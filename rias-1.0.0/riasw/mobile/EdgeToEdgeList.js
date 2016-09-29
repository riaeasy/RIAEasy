
//RIAStudio client runtime widget - EdgeToEdgeList

define([
	"rias",
	"dojox/mobile/EdgeToEdgeList"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		"EdgeToEdgeList.css"
	]);

	var riaswType = "rias.riasw.mobile.EdgeToEdgeList";
	var Widget = rias.declare(riaswType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswEdgeToEdgeListIcon",
		iconClass16: "riaswEdgeToEdgeListIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
