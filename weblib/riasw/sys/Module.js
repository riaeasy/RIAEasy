
define([
	"riasw/riaswBase",
	"riasw/layout/_PanelWidget",
	"riasw/sys/_FormMixin",
	"riasw/sys/_ModuleMixin"
], function(rias, _PanelWidget, _FormMixin, _ModuleMixin){

	//rias.theme.loadThemeCss([
	//	"riasw/sys/Module.css"
	//]);

	var riaswType = "riasw.sys.Module";
	var Widget = rias.declare(riaswType, [_PanelWidget, _FormMixin, _ModuleMixin],{

		///暴露给 riasd.widgetEditor
		//requires: [],//自身定义的 requires 没用，在 rias.parseRiasws 会忽略，使用 meta 的 requires 代替。
		//themeCss: [],//自身定义的 themeCss 没用，在 rias.parseRiasws 会忽略，使用 meta 的 themeCss 代替。
		//_riaswElements: [],//自身定义的 _riaswElements 没用，在 rias.parseRiasws 会忽略，使用 meta 的 _riasChildren 代替。

		moduleMeta: "",

		baseClass: "riaswModule",

		checkModifiedWhenHide: false,
		actionType: "",

		//postMixInProperties: function(){
		//	this.inherited(arguments);
		//	//if(!this.desktop){
		//	//	this.desktop = rias.desktop;
		//	//}
		//},
		buildRendering: function(){
			this.inherited(arguments);
			rias.dom.addClass(this.domNode, "dijitReset");
			rias.dom.setAttr(this.domNode, "role", "region");
		}

	});

	Widget._riasdMeta = {
		visual: true
	};

	return Widget;

});