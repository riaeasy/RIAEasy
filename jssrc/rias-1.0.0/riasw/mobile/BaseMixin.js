
//RIAStudio client runtime widget - Pane(mobile)

define([
	"rias/riasw/mobile/mobileBase"
], function(rias){

	//rias.theme.loadRiasCss([
	//	"Pane.css"
	//], true);

	var riasType = "rias.riasw.mobile.BaseMixin";
	var Widget = rias.declare(riasType, null, {
		//_setLayoutAttr: function(value){
		//	this._set("layout", value);
		//}
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
