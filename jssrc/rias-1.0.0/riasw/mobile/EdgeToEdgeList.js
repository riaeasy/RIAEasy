
//RIAStudio client runtime widget - EdgeToEdgeList

define([
	"rias",
	"dojox/mobile/EdgeToEdgeList"
], function(rias, _Widget){

	rias.theme.loadRiasCss([
		"EdgeToEdgeList.css"
	], true);

	var riasType = "rias.riasw.mobile.EdgeToEdgeList";
	var Widget = rias.declare(riasType, [_Widget], {

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
