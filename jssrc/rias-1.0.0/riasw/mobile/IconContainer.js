
//RIAStudio client runtime widget - IconContainer

define([
	"rias",
	"dojox/mobile/IconContainer"
], function(rias, _Widget){

	rias.theme.loadRiasCss([
		"IconContainer.css"
	], true);

	var riasType = "rias.riasw.mobile.IconContainer";
	var Widget = rias.declare(riasType, [_Widget], {

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
