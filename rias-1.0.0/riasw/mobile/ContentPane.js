
//RIAStudio client runtime widget - ContentPane(mobile)

define([
	"rias",
	"rias/riasw/mobile/BaseMixin",
	"dojox/mobile/ContentPane"
], function(rias, BaseMixin, _Widget){

	//rias.theme.loadMobileThemeCss([
	//	"ContentPane.css"
	//]);

	var riaswType = "rias.riasw.mobile.ContentPane";
	var Widget = rias.declare(riaswType, [BaseMixin, _Widget], {

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
