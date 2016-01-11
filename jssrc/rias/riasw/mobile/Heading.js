
//RIAStudio client runtime widget - Heading

define([
	"rias/riasw/mobile/mobileBase",
	"dojox/mobile/Heading",
	"rias/riasw/mobile/View"
], function(rias, _Widget){

	rias.theme.loadCss([
		"Heading.css"
	], true);

	var riasType = "rias.riasw.mobile.Heading";
	var Widget = rias.declare(riasType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswHeadingIcon",
		iconClass16: "riaswHeadingIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
