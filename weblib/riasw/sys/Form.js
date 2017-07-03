
//RIAStudio client runtime widget - Form

define([
	"riasw/riaswBase",
	"riasw/layout/_PanelWidget",
	"riasw/sys/_FormMixin"
], function(rias, _PanelWidget, _FormMixin){

	//rias.theme.loadThemeCss([
	//	"riasw/sys/Form.css"
	//]);

	var riaswType = "riasw.sys.Form";
	var Widget = rias.declare(riaswType, [_PanelWidget, _FormMixin], {

		baseClass: "riaswForm",
		checkModifiedWhenHide: true,

		buildRendering: function(){
			this.inherited(arguments);
			rias.dom.addClass(this.domNode, "dijitReset");
			rias.dom.setAttr(this.domNode, "role", "region");
		}

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
