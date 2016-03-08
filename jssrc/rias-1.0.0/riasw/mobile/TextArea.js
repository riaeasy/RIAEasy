
//RIAStudio client runtime widget - TextArea

define([
	"rias/riasw/mobile/mobileBase",
	"dojox/mobile/TextArea"
], function(rias, _Widget){

	rias.theme.loadRiasCss([
		"TextArea.css"
	], true);

	var riasType = "rias.riasw.mobile.TextArea";
	var Widget = rias.declare(riasType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTextAreaIcon",
		iconClass16: "riaswTextAreaIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
