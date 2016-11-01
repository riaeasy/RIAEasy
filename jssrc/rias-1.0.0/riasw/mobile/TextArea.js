
//RIAStudio client runtime widget - TextArea

define([
	"rias",
	"dojox/mobile/TextArea"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		"TextArea.css"
	]);

	var riaswType = "rias.riasw.mobile.TextArea";
	var Widget = rias.declare(riaswType, [_Widget], {

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
