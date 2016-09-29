
//RIAStudio client runtime widget - IconItem

define([
	"rias",
	"dojox/mobile/IconItem"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		//"IconItem.css"
	]);

	var riaswType = "rias.riasw.mobile.IconItem";
	var Widget = rias.declare(riaswType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswIconItemIcon",
		iconClass16: "riaswIconItemIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
