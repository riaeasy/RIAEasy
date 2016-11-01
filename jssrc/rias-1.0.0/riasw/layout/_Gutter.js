//RIAStudio client runtime widget - BorderPanel

define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin"
], function(rias, _Widget, _TemplatedMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/layout/Splitter.css"
	//]);

	var riaswType = "rias.riasw.layout._Gutter";
	var Widget = rias.declare(riaswType, [_Widget, _TemplatedMixin], {

		baseClass: "riaswGutter",
		templateString: '<div role="presentation"></div>',

		postMixInProperties: function(){
			this.inherited(arguments);
			this.horizontal = /top|bottom/.test(this.region);
		},

		buildRendering: function(){
			this.inherited(arguments);
			rias.dom.addClass(this.domNode, this._baseClass0 + (this.horizontal ? "H" : "V"));
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswSplitterIcon",
		iconClass16: "riaswSplitterIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});