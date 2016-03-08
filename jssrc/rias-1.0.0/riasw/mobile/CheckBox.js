
//RIAStudio client runtime widget - CheckBox

define([
	"rias/riasw/mobile/mobileBase",
	"dojox/mobile/CheckBox"
], function(rias, _Widget){

	rias.theme.loadRiasCss([
		"CheckBox.css"
	], true);

	var riasType = "rias.riasw.mobile.CheckBox";
	var Widget = rias.declare(riasType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswCheckBoxIcon",
		iconClass16: "riaswCheckBoxIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
