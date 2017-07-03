//RIAStudio client runtime widget - BorderPanel

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin"
], function(rias, _WidgetBase, _TemplatedMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/sys/Splitter.css"
	//]);

	var riaswType = "riasw.sys._Gutter";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin], {

		baseClass: "riaswGutter",
		templateString: '<div role="presentation"></div>',

		_setRegionAttr: function(value){
			this.inherited(arguments);
			this.horizontal = /top|bottom/.test(value);
			rias.dom.addClass(this.domNode, this._baseClass0 + (this.horizontal ? "H" : "V"));
		}

	});

	/*Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};*/

	return Widget;

});