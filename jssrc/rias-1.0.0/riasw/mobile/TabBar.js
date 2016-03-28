
//RIAStudio client runtime widget - TabBar

define([
	"rias",
	"dojox/mobile/TabBar"
], function(rias, _Widget){

	rias.theme.loadRiasCss([
		"TabBar.css"
	], true);

	var riasType = "rias.riasw.mobile.TabBar";
	var Widget = rias.declare(riasType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTabBarIcon",
		iconClass16: "riaswTabBarIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
