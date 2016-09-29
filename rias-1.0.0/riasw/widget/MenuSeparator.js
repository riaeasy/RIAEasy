//RIAStudio client runtime widget - MenuSeparator

define([
	"rias",
	"dijit/MenuSeparator"
], function(rias, _Widget) {

	_Widget.extend({
		_setSelected: function(selected){
		}
	});

	//rias.theme.loadThemeCss([
	//	"riasw/widget/Menu.css"
	//]);

	var riaswType = "rias.riasw.widget.MenuSeparator";
	var Widget = rias.declare(riaswType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswMenuSeparatorIcon",
		iconClass16: "riaswMenuSeparatorIcon16",
		defaultParams: {
			//content: "<span></span>",
			//label: "MenuSeparator"
		},
		initialSize: {},
		resizable: "none",
		allowedParent: "rias.riasw.Menu, dijit.Menu",
		allowedChild: ""
	};

	return Widget;

});