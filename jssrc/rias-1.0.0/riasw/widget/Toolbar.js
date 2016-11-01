//RIAStudio client runtime widget - Toolbar

define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_KeyNavContainer"
], function(rias, _Widget, _TemplatedMixin, _KeyNavContainer) {

	//rias.theme.loadThemeCss([
	//	"riasw/widget/Toolbar.css"
	//]);

	var riaswType = "rias.riasw.widget.Toolbar";
	var Widget = rias.declare(riaswType, [_Widget, _TemplatedMixin, _KeyNavContainer], {

		templateString:
			'<div class="dijit" role="toolbar" tabIndex="${tabIndex}" data-dojo-attach-point="containerNode"></div>',

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
		iconClass: "riaswToolbarIcon",
		iconClass16: "riaswToolbarIcon16",
		defaultParams: {
			//content: "<span></span>"
		},
		initialSize: {},
		resizable: "none",
		allowedChild: "rias.riasw.form.Button, rias.riasw.form.ComboButton, rias.riasw.form.DropDownButton, rias.riasw.form.ToggleButton, rias.riasw.ToolbarSeparator, rias.riasw.ToolbarLineBreak",
		property: {
			tabIndex: {
				datatype: "string",
				defaultValue: "0",
				title: "Tab Index"
			},
			focusedChild: {
				datatype: "object",
				description: "The currently focused child widget, or null if there isn't one",
				hidden: true
			},
			isContainer: {
				datatype: "boolean",
				description: "Just a flag indicating that this widget descends from dijit._Container"
			}
		}
	};

	return Widget;

});