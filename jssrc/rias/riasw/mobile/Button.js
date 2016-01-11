
//RIAStudio client runtime widget - Button

define([
	"rias/riasw/mobile/mobileBase",
	"rias/riasw/mobile/BaseMixin",
	"dojox/mobile/Button"
], function(rias, BaseMixin, _Widget){

	rias.theme.loadCss([
		"Button.css"
	], true);

	var riasType = "rias.riasw.mobile.Button";
	var Widget = rias.declare(riasType, [BaseMixin, _Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswButtonIcon",
		iconClass16: "riaswButtonIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
