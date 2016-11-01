define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin"
], function(rias, _Widget, _TemplatedMixin){

	var riaswType = "rias.riasw.widget.ToolbarSeparator";
	var Widget = rias.declare(riaswType, [_Widget, _TemplatedMixin], {
		// summary:
		//		A spacer between two `dijit.Toolbar` items

		templateString: '<div class="riaswToolbarSeparator dijitInline" role="presentation"></div>',

		buildRendering: function(){
			this.inherited(arguments);
			rias.dom.setSelectable(this.domNode, false);
		},

		isFocusable: function(){
			// summary:
			//		This widget isn't focusable, so pass along that fact.
			// tags:
			//		protected
			return false;
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswToolbarSeparatorIcon",
		iconClass16: "riaswToolbarSeparatorIcon16",
		defaultParams: {
			//content: "<span></span>"
		},
		initialSize: {},
		resizable: "none",
		property: {
		}
	};

	return Widget;

});
