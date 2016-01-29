
//RIAStudio client runtime widget - Pane(mobile)

define([
	"rias/riasw/mobile/mobileBase",
	"rias/riasw/mobile/BaseMixin",
	"dojox/mobile/Pane"
], function(rias, BaseMixin, _Widget){

	//rias.theme.loadCss([
	//	"Pane.css"
	//], true);

	var riasType = "rias.riasw.mobile.Pane";
	var Widget = rias.declare(riasType, [BaseMixin, _Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswPaneIcon",
		iconClass16: "riaswPaneIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
