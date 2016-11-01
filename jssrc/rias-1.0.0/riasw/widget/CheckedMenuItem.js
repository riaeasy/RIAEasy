//RIAStudio client runtime widget - CheckedMenuItem

define([
	"rias",
	"rias/riasw/widget/MenuItem"
], function(rias, MenuItem) {

	//rias.theme.loadThemeCss([
	//	"riasw/widget/Menu.css"
	//]);

	var riaswType = "rias.riasw.widget.CheckedMenuItem";
	var Widget = rias.declare(riaswType, [MenuItem], {
		// summary:
		//		A checkbox-like menu item for toggling on and off

		// Use both base classes so we get styles like dijitMenuItemDisabled
		baseClass: "dijitMenuItem dijitCheckedMenuItem",

		templateString:
			'<tr class="dijitReset" data-dojo-attach-point="focusNode" role="${role}" tabIndex="-1" aria-checked="${checked}">' +
				'<td class="dijitReset dijitMenuItemIconCell" role="presentation">' +
					'<span class="dijitInline dijitIcon dijitMenuItemIcon dijitCheckedMenuItemIcon" data-dojo-attach-point="iconNode"></span>' +
					'<span class="dijitMenuItemIconChar dijitCheckedMenuItemIconChar">${!checkedChar}</span>' +
				'</td>' +
				'<td class="dijitReset dijitMenuItemLabel" colspan="2" data-dojo-attach-point="containerNode,labelNode,textDirNode"></td>' +
				'<td class="dijitReset dijitMenuItemAccelKey" style="display: none" data-dojo-attach-point="accelKeyNode"></td>' +
				'<td class="dijitReset dijitMenuArrowCell" role="presentation">&#160;</td>' +
			'</tr>',

		// checked: Boolean
		//		Our checked state
		checked: false,
		_setCheckedAttr: function(/*Boolean*/ checked){
			this.domNode.setAttribute("aria-checked", checked ? "true" : "false");
			this._set("checked", checked);	// triggers CSS update via _CssStateMixin
		},

		iconClass: "",	// override dijitNoIcon

		role: "menuitemcheckbox",

		// checkedChar: String
		//		Character (or string) used in place of checkbox icon when display in high contrast mode
		checkedChar: "&#10003;",

		onChange: function(/*Boolean*/ /*===== checked =====*/){
			// summary:
			//		User defined function to handle check/uncheck events
			// tags:
			//		callback
		},

		_onClick: function(evt){
			// summary:
			//		Clicking this item just toggles its state
			// tags:
			//		private
			if(!this.disabled){
				this.set("checked", !this.checked);
				this.onChange(this.checked);
			}
			this.onClick(evt);
		}
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswCheckedMenuItemIcon",
		iconClass16: "riaswCheckedMenuItemIcon16",
		defaultParams: {
			//content: "<span></span>",
			//label: "CheckedMenuItem",
			accelKey: ""
		},
		initialSize: {},
		resizable: "none",
		allowedParent: "rias.riasw.Menu, dijit.Menu",
		allowedChild: "",
		"property": {
			"label": {
				"datatype": "string",
				"title": "Label"
			},
			"iconClass": {
				"datatype": "string",
				"title": "Icon Class"
			},
			"accelKey": {
				"datatype": "string",
				"title": "Shortcut Key"
			},
			"checked": {
				"datatype": "boolean",
				"title": "Checked"
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled"
			}
		}
	};

	return Widget;
});