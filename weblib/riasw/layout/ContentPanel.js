
//RIAStudio client runtime widget - ContentPanel

define([
	"riasw/riaswBase",
	"riasw/layout/Panel",
	"riasw/sys/_ContentMixin"
], function(rias, Panel, _ContentMixin){

	//rias.theme.loadThemeCss([
	//	"riasw/layout/Panel.css"
	//]);

	var riaswType = "riasw.layout.ContentPanel";
	var Widget = rias.declare(riaswType, [Panel, _ContentMixin], {
	});

	Widget._riasdMeta = {
		visual: true
	};

	return Widget;

});
