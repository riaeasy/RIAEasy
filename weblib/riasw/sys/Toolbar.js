//RIAStudio client runtime widget - Toolbar

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/_KeyNavContainer"
], function(rias, _WidgetBase, _TemplatedMixin, _KeyNavContainer) {

	//rias.theme.loadThemeCss([
	//	"riasw/sys/Toolbar.css"
	//]);

	var riaswType = "riasw.sys.Toolbar";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin, _KeyNavContainer], {

		templateString:
			'<div role="toolbar" tabIndex="${tabIndex}" data-dojo-attach-point="containerNode"></div>',

		baseClass: "riaswToolbar",

		_onLeftArrow: function(){
			this.focusPrev();
		},

		_onRightArrow: function(){
			this.focusNext();
		}

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "none",
		allowedChild: "riasw.form.Button, riasw.form.ComboButton, riasw.form.ToggleButton, riasw.sys.ToolbarSeparator, riasw.sys.ToolbarLineBreak",
		property: {
			tabIndex: {
				datatype: "string",
				defaultValue: "0",
				title: "Tab Index"
			}
		}
	};

	return Widget;

});