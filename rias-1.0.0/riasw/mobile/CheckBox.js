
//RIAStudio client runtime widget - CheckBox

define([
	"rias",
	"dojox/mobile/CheckBox"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		"CheckBox.css"
	]);

	var riaswType = "rias.riasw.mobile.CheckBox";
	var Widget = rias.declare(riaswType, [_Widget], {

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
