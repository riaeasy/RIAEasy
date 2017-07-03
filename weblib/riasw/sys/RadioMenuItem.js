//RIAStudio client runtime widget - RadioMenuItem

define([
	"riasw/riaswBase",
	"riasw/sys/CheckMenuItem",
	"dojo/query!css2" // query
], function(rias, CheckMenuItem, query) {

	//rias.theme.loadThemeCss([
	//	"riasw/sys/Menu.css"
	//]);

	var riaswType = "riasw.sys.RadioMenuItem";
	var Widget = rias.declare(riaswType, [CheckMenuItem], {
		// summary:
		//		A radio-button-like menu item for toggling on and off

		// Use both base classes so we get styles like riaswMenuItemDisabled
		baseClass: "riaswMenuItem riaswRadioMenuItem",

		role: "menuitemradio",

		// checkedChar: String
		//		Character (or string) used in place of radio button icon when display in high contrast mode
		checkedChar: "*",

		// name: String
		//		Toggling on a RadioMenuItem in a given name toggles off the other RadioMenuItems in that group.
		name: "",
		_setNameAttr: "domNode",	// needs to be set as an attribute so dojo/query can find it

		_setCheckedAttr: function(/*Boolean*/ checked){
			// If I am being checked then have to deselect currently checked items
			this.inherited(arguments);
			if(!this._created){
				return;
			}
			if(checked && this.name){
				rias.forEach(this._getRelatedWidgets(), function(widget){
					if(widget !== this && widget.checked){
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
			query("[name=" + this.name + "][role=" + this.role + "]").forEach(
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
		initialSize: {},
		resizable: "none",
		allowedParent: "riasw.sys.Menu",
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