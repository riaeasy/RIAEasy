define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin"
], function(rias, _WidgetBase, _TemplatedMixin){

	var riaswType = "riasw.sys.ToolbarLineBreak";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin], {
		// summary:
		//		A 'line break' between two `riasw.sys.Toolbar` items so that very
		//		long toolbars can be organized a bit.

		templateString: "<span class='dijitReset'><br></span>",
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
