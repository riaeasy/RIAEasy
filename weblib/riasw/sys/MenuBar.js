//RIAStudio client runtime widget - MenuBar

define([
	"riasw/riaswBase",
	"riasw/sys/_MenuBase",
	"riasw/sys/PopupMenuBarItem",
	"riasw/sys/MenuItem"
], function(rias, _MenuBase) {

	//rias.theme.loadThemeCss([
	//	"riasw/sys/Menu.css"
	//]);

	var riaswType = "riasw.sys.MenuBar";
	var Widget = rias.declare(riaswType, [_MenuBase], {

		templateString:
			"<div class='riaswMenuPassive' data-dojo-attach-point='containerNode' role='menubar' tabIndex='${tabIndex}>' "+
			"</div>",

		baseClass: "riaswMenuBar",

		// By default open popups for MenuBar instantly
		popupDelay: 0,

		// _isMenuBar: [protected] Boolean
		//		This is a MenuBar widget, not a (vertical) Menu widget.
		_isMenuBar: true,

		// parameter to rias.popupManager.open() about where to put popup (relative to this.domNode)
		popupPositions: ["below"],

		_moveToPopup: function(/*Event*/ evt){
			// summary:
			//		This handles the down arrow key, opening a submenu if one exists.
			//		Unlike _MenuBase._moveToPopup(), will never move to the next item in the MenuBar.
			// tags:
			//		private

			if(this.focusedChild && this.focusedChild.popup && !this.focusedChild.disabled){
				this.onItemClick(this.focusedChild, evt);
			}
		},

		focusChild: function(item){
			// Overload focusChild so that whenever a new item is focused and the menu is active, open its submenu immediately.

			this.inherited(arguments);
			if(this.activated && item.popup && !item.disabled){
				this._openItemPopup(item, true);
			}
		},

		_onChildDeselect: function(item){
			// override _MenuBase._onChildDeselect() to close submenu immediately

			if(this.currentPopupItem === item){
				this.currentPopupItem = null;
				item._closePopup(); // this calls onClose
			}

			this.inherited(arguments);
		},

		// Arrow key navigation
		_onLeftArrow: function(){
			this.focusPrev();
		},
		_onRightArrow: function(){
			this.focusNext();
		},
		_onDownArrow: function(/*Event*/ evt){
			this._moveToPopup(evt);
		},
		_onUpArrow: function(){
		},

		onItemClick: function(/*_WidgetBase*/ item, /*Event*/ evt){
			// summary:
			//		Handle clicks on an item.   Also called by _moveToPopup() due to a down-arrow key on the item.
			//		Cancels a dropdown if already open and click is either mouse or space/enter.
			//		Don't close dropdown due to down arrow.
			// tags:
			//		private
			if(item.popup && item.popup.isShowingNow && (!/^key/.test(evt.type) || evt.keyCode !== rias.keys.DOWN_ARROW)){
				item.focusNode.focus();
				this._cleanUp(true);
			}else{
				this.inherited(arguments);
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "none",
		allowedChild: "riasw.sys.PopupMenuBarItem, riasw.sys.MenuBarItem",
		"property": {
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