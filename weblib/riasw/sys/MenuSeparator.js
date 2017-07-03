//RIAStudio client runtime widget - MenuSeparator

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin"
], function(rias, _WidgetBase, _TemplatedMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/sys/Menu.css"
	//]);

	var riaswType = "riasw.sys.MenuSeparator";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin], {
		// summary:
		//		A line between two menu items

		templateString:
			'<tr class="riaswMenuSeparator" role="separator">' +
				'<td class="riaswMenuSeparatorIconCell">' +
					'<div class="riaswMenuSeparatorTop"></div>' +
					'<div class="riaswMenuSeparatorBottom"></div>' +
				'</td>' +
				'<td colspan="3" class="riaswMenuSeparatorLabelCell">' +
					'<div class="riaswMenuSeparatorTop riaswMenuSeparatorLabel"></div>' +
					'<div class="riaswMenuSeparatorBottom"></div>' +
				'</td>' +
			'</tr>',

		buildRendering: function(){
			this.inherited(arguments);
			rias.dom.setSelectable(this.domNode, false);
		},

		//增加
		_setSelected: function(selected){
		},

		isFocusable: function(){
			// summary:
			//		Override to always return false
			// tags:
			//		protected

			return false; // Boolean
		}
	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "none",
		allowedParent: "riasw.sys.Menu",
		allowedChild: ""
	};

	return Widget;

});