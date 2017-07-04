//RIAStudio client runtime widget - DefaultError

define([
	"riasw/riaswBase",
	"riasw/sys/ContainerTag"
], function(rias, _Widget) {

	var riaswType = "riasw.sys.DefaultError";
	var Widget = rias.declare(riaswType, [_Widget], {
	});

	Widget.buildParams = function(params){
		if(!params.errorMessage){
			params.errorMessage = "The widget have some errors.";
		}
		params.content = "<span style='color:Red;font-weight:bold'>" + params.errorMessage.replace(/\n/g, "<br/>") + "</span>";
		params.region = params.region || "top";
		params.style = {
			"min-width": "1em",
			"min-height": "1em"
		};
		return params;
	};
	Widget._riasdMeta = {
		visual: true
	};

	return Widget;

});