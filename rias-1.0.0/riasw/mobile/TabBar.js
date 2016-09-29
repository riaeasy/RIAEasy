
//RIAStudio client runtime widget - TabBar

define([
	"rias",
	"dojox/mobile/TabBar"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		"TabBar.css"
	]);

	var riaswType = "rias.riasw.mobile.TabBar";
	var Widget = rias.declare(riaswType, [_Widget], {

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
