
//RIAStudio client runtime widget - SearchBox

define([
	"rias",
	"dojox/mobile/SearchBox"
], function(rias, _Widget){

	rias.theme.loadRiasCss([
		"SearchBox.css"
	], true);

	var riasType = "rias.riasw.mobile.SearchBox";
	var Widget = rias.declare(riasType, [_Widget], {

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
