
//RIAStudio client runtime widget - ToggleButton

define([
	"rias",
	"rias/riasw/mobile/Button",
	"rias/riasw/form/_ToggleButtonMixin"
], function(rias, _Widget, _ToggleButtonMixin){

	rias.theme.loadMobileThemeCss([
		"ToggleButton.css"
	]);

	var riaswType = "rias.riasw.mobile.ToggleButton";
	var Widget = rias.declare(riaswType, [_Widget, _ToggleButtonMixin], {

		baseClass: "mblToggleButton",

		_setCheckedAttr: function(){
			this.inherited(arguments);
			var newStateClasses = (this.baseClass + ' ' + this["class"]).replace(/(\S+)\s*/g, "$1Checked ").split(" ");
			rias.dom[this.checked ? "addClass" : "removeClass"](this.focusNode || this.domNode, newStateClasses);
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswToggleButtonIcon",
		iconClass16: "riaswToggleButtonIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
