define([
	"rias",
	"rias/riasw/widget/_MenuBase"
], function(rias, _MenuBase){

	//rias.theme.loadThemeCss([
	//	"riasw/widget/Menu.css"
	//]);

	var riaswType = "rias.riasw.widget.DropDownMenu";
	var Widget = rias.declare(riaswType, _MenuBase, {
		// summary:
		//		A menu, without features for context menu (Meaning, drop down menu)

		templateString:
			'<table class="dijit dijitMenu dijitMenuPassive dijitReset dijitMenuTable" role="menu" tabIndex="${tabIndex}" cellspacing="0">' +
				'<tbody class="dijitReset" data-dojo-attach-point="containerNode"></tbody>' +
			'</table>',

		baseClass: "dijitMenu",

		// Arrow key navigation
		_onUpArrow: function(){
			this.focusPrev();
		},
		_onDownArrow: function(){
			this.focusNext();
		},
		_onRightArrow: function(/*Event*/ evt){
			this._moveToPopup(evt);
			evt.stopPropagation();
			evt.preventDefault();
		},
		_onLeftArrow: function(/*Event*/ evt){
			if(this.parentMenu){
				if(this.parentMenu._isMenuBar){
					this.parentMenu.focusPrev();
				}else{
					this.onCancel(false);
				}
			}else{
				evt.stopPropagation();
				evt.preventDefault();
			}
		}
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswMenuIcon",
		iconClass16: "riaswMenuIcon16",
		defaultParams: {
			//content: "<span></span>",
			contextMenuForWindow: false,
			targetNodeIds: [],
			popupDelay: 500
		},
		initialSize: {},
		resizable: "none",
		allowedChild: "dijit.MenuItem, dijit.CheckedMenuItem, dijit.RadioMenuItem, dijit.MenuSeparator, dijit.PopupMenuItem",
		style: "min-width: 1em; min-height: 1em; visibility: hidden;",
		"property": {
			"targetNodeIds": {
				"datatype": "array",
				"defaultValue": "[]",
				"title": "Target Node IDs"
			},
			"contextMenuForWindow": {
				"datatype": "boolean",
				"title": "Context Menu For Window"
			},
			"leftClickToOpen": {
				"datatype": "boolean",
				"title": "Left Click To Open"
			},
			"popupDelay": {
				"datatype": "number",
				"defaultValue": 500,
				"title": "Popup Delay"
			},
			"parentMenu": {
				"datatype": "object",
				"description": "pointer to menu that displayed me",
				"hidden": true
			},
			"focusedChild": {
				"datatype": "object",
				"description": "The currently focused child widget, or null if there isn't one",
				"hidden": true
			},
			"tabIndex": {
				"datatype": "number",
				"description": "Tab index of the container; same as HTML tabindex attribute.\nNote then when user tabs into the container, focus is immediately\nmoved to the first item in the container.",
				"hidden": false
			},
			"isContainer": {
				"datatype": "boolean",
				"description": "Just a flag indicating that this widget descends from dijit._Container",
				"defaultValue": true,
				"hidden": true
			}
		}
	};

	return Widget;
});
