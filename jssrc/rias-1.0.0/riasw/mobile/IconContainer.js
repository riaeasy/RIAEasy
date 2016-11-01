
//RIAStudio client runtime widget - IconContainer

define([
	"rias",
	"dojox/mobile/IconContainer"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		"IconContainer.css"
	]);

	var riaswType = "rias.riasw.mobile.IconContainer";
	var Widget = rias.declare(riaswType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswIconContainerIcon",
		iconClass16: "riaswIconContainerIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
