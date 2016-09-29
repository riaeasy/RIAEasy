
//RIAStudio client runtime widget - RoundRectList

define([
	"rias",
	"dojox/mobile/RoundRectList",
	"dojox/mobile/_EditableListMixin",
	"rias/riasw/mobile/ListItem"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		"RoundRectList.css"
	]);

	var riaswType = "rias.riasw.mobile.RoundRectList";
	var Widget = rias.declare(riaswType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswRoundRectListIcon",
		iconClass16: "riaswRoundRectListIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
