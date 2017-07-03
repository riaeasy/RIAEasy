define([
	"riasw/riaswBase",
	"riasw/sys/_MenuBase"
], function(rias, _MenuBase){

	//rias.theme.loadThemeCss([
	//	"riasw/sys/Menu.css"
	//]);

	var riaswType = "riasw.sys.DropDownMenu";
	var Widget = rias.declare(riaswType, _MenuBase, {
		// summary:
		//		A menu, without features for context menu (Meaning, drop down menu)

		templateString:
			'<table class="dijitReset riaswMenuPassive riaswDropDownMenu" role="menu" tabIndex="${tabIndex}" cellspacing="0">' +
				'<tbody class="dijitReset" data-dojo-attach-point="containerNode"></tbody>' +
			'</table>',

		baseClass: "riaswMenu",

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
		initialSize: {},
		resizable: "none",
		allowedChild: "riasw.sys.MenuItem, riasw.sys.CheckMenuItem, riasw.sys.RadioMenuItem, riasw.sys.MenuSeparator, riasw.sys.PopupMenuItem",
		style: "min-width: 1em; min-height: 1em; visibility: hidden;",
		"property": {
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
			}
		}
	};

	return Widget;
});
