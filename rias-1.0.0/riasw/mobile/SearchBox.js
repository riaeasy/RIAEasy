
//RIAStudio client runtime widget - SearchBox

define([
	"rias",
	"dojox/mobile/SearchBox"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		"SearchBox.css"
	]);

	var riaswType = "rias.riasw.mobile.SearchBox";
	var Widget = rias.declare(riaswType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswSearchBoxIcon",
		iconClass16: "riaswSearchBoxIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
