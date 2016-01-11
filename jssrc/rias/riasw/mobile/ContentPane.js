
//RIAStudio client runtime widget - ContentPane(mobile)

define([
	"rias/riasw/mobile/mobileBase",
	"rias/riasw/mobile/BaseMixin",
	"dojox/mobile/ContentPane"
], function(rias, BaseMixin, _Widget){

	//rias.theme.loadCss([
	//	"ContentPane.css"
	//], true);

	var riasType = "rias.riasw.mobile.ContentPane";
	var Widget = rias.declare(riasType, [BaseMixin, _Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswContentPaneIcon",
		iconClass16: "riaswContentPaneIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
