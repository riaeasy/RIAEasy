define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin"
], function(rias, _Widget, _TemplatedMixin){

	var riaswType = "rias.riasw.widget.ToolbarLineBreak";
	var Widget = rias.declare(riaswType, [_Widget, _TemplatedMixin], {
		// summary:
		//		A 'line break' between two `dijit.Toolbar` items so that very
		//		long toolbars can be organized a bit.

		templateString: "<span class='dijit dijitReset'><br></span>",
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
		iconClass: "riaswToolbarLineBreakIcon",
		iconClass16: "riaswToolbarLineBreakIcon16",
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
