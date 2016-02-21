
//RIAStudio client runtime widget - IconItem

define([
	"rias/riasw/mobile/mobileBase",
	"dojox/mobile/IconItem"
], function(rias, _Widget){

	rias.theme.loadCss([
		//"IconItem.css"
	], true);

	var riasType = "rias.riasw.mobile.IconItem";
	var Widget = rias.declare(riasType, [_Widget], {

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
