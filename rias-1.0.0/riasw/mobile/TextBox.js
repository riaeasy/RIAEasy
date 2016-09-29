
//RIAStudio client runtime widget - TextBox

define([
	"rias",
	"dojox/mobile/TextBox"
], function(rias, _Widget){

	///已经 extend 了 _TextBoxMixin

	//_Widget.extend({
	//	editable: true
	//});

	rias.theme.loadMobileThemeCss([
		"TextBox.css"
	]);

	var riaswType = "rias.riasw.mobile.TextBox";
	var Widget = rias.declare(riaswType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTextBoxIcon",
		iconClass16: "riaswTextBoxIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
