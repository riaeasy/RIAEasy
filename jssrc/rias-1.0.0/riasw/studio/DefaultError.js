//RIAStudio client runtime widget - DefaultError

define([
	"rias",
	"rias/riasw/layout/Panel"
], function(rias, _Widget) {

	var riaswType = "rias.riasw.studio.DefaultError";
	var Widget = rias.declare(riaswType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswPaneIcon",
		iconClass16: "riaswPaneIcon16",
		defaultParams: function(params){
			if(!params.errorMessage){
				params.errorMessage = "The widget have some errors.";
			}
			params.innerHTML = "<span style='color:Red;font-weight:bold'>" + params.errorMessage.replace(/\n/g, "<br/>") + "</span>";
			params.region = params.region || "top";
			params.style = {
				"min-width": "1em",
				"min-height": "1em"
			};
			return params;
		}
	};

	return Widget;

});