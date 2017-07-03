define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin"
], function(rias, _WidgetBase, _TemplatedMixin){

	var riaswType = "riasw.sys.ToolbarSeparator";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin], {
		// summary:
		//		A spacer between two `riasw.sys.Toolbar` items

		templateString: '<div class="riaswToolbarSeparator" role="presentation"></div>',

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
		initialSize: {},
		resizable: "none",
		property: {
		}
	};

	return Widget;

});
