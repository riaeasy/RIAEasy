
//RIAStudio client runtime widget - TextBox

define([
	"rias/riasw/mobile/mobileBase",
	"dojox/mobile/TextBox"
], function(rias, _Widget){

	_Widget.extend({

		editable: true,
		_setEditableAttr: function(value){
			this._set("editable", !!value);
			rias.dom.setAttr(this.textbox, "readonly", (this.readOnly || !value));
		}

	});

	rias.theme.loadRiasCss([
		"TextBox.css"
	], true);

	var riasType = "rias.riasw.mobile.TextBox";
	var Widget = rias.declare(riasType, [_Widget], {

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
