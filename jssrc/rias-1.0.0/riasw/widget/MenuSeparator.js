//RIAStudio client runtime widget - MenuSeparator

define([
	"rias",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_Contained"
], function(rias, _WidgetBase, _TemplatedMixin, _Contained) {

	//rias.theme.loadThemeCss([
	//	"riasw/widget/Menu.css"
	//]);

	var riaswType = "rias.riasw.widget.MenuSeparator";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin, _Contained], {
		// summary:
		//		A line between two menu items

		templateString:
			'<tr class="dijitMenuSeparator" role="separator">' +
				'<td class="dijitMenuSeparatorIconCell">' +
					'<div class="dijitMenuSeparatorTop"></div>' +
					'<div class="dijitMenuSeparatorBottom"></div>' +
				'</td>' +
				'<td colspan="3" class="dijitMenuSeparatorLabelCell">' +
					'<div class="dijitMenuSeparatorTop dijitMenuSeparatorLabel"></div>' +
					'<div class="dijitMenuSeparatorBottom"></div>' +
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
		iconClass: "riaswMenuSeparatorIcon",
		iconClass16: "riaswMenuSeparatorIcon16",
		defaultParams: {
			//content: "<span></span>",
			//label: "MenuSeparator"
		},
		initialSize: {},
		resizable: "none",
		allowedParent: "rias.riasw.Menu, dijit.Menu",
		allowedChild: ""
	};

	return Widget;

});