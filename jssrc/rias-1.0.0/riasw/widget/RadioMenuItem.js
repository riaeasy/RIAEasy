//RIAStudio client runtime widget - RadioMenuItem

define([
	"rias",
	"rias/riasw/widget/CheckedMenuItem",
	"dojo/query!css2" // query
], function(rias, CheckedMenuItem, query) {

	//rias.theme.loadThemeCss([
	//	"riasw/widget/Menu.css"
	//]);

	var riaswType = "rias.riasw.widget.RadioMenuItem";
	var Widget = rias.declare(riaswType, [CheckedMenuItem], {
		// summary:
		//		A radio-button-like menu item for toggling on and off

		// Use both base classes so we get styles like dijitMenuItemDisabled
		baseClass: "dijitMenuItem dijitRadioMenuItem",

		role: "menuitemradio",

		// checkedChar: String
		//		Character (or string) used in place of radio button icon when display in high contrast mode
		checkedChar: "*",

		// group: String
		//		Toggling on a RadioMenuItem in a given group toggles off the other RadioMenuItems in that group.
		group: "",
		_setGroupAttr: "domNode",	// needs to be set as an attribute so dojo/query can find it

		_setCheckedAttr: function(/*Boolean*/ checked){
			// If I am being checked then have to deselect currently checked items
			this.inherited(arguments);
			if(!this._created){
				return;
			}
			if(checked && this.group){
				rias.forEach(this._getRelatedWidgets(), function(widget){
					if(widget != this && widget.checked){
						widget.set('checked', false);
					}
				}, this);
			}
		},

		_onClick: function(evt){
			// summary:
			//		Clicking this item toggles it on.   If it's already on, then clicking does nothing.
			// tags:
			//		private

			if(!this.disabled && !this.checked){
				this.set("checked", true);
				this.onChange(true);
			}
			this.onClick(evt);
		},

		_getRelatedWidgets: function(){
			// Private function needed to help iterate over all radio menu items in a group.
			var ary = [];
			query("[group=" + this.group + "][role=" + this.role + "]").forEach(
				function(menuItemNode){
					var widget = rias.by(menuItemNode);
					if(widget){
						ary.push(widget);
					}
				}
			);
			return ary;
		}
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswRadioMenuItemIcon",
		iconClass16: "riaswRadioMenuItemIcon16",
		defaultParams: {
			//content: "<span></span>",
			//label: "RadioMenuItem",
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