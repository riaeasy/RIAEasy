//>>built

require({cache:{"url:dijit/templates/MenuBar.html":"<div class=\"dijitMenuBar dijitMenuPassive\" data-dojo-attach-point=\"containerNode\" role=\"menubar\" tabIndex=\"${tabIndex}\"\n\t ></div>\n"}});
define("dijit/MenuBar", ["dojo/_base/declare", "dojo/keys", "./_MenuBase", "dojo/text!./templates/MenuBar.html"], function (declare, keys, _MenuBase, template) {
    return declare("dijit.MenuBar", _MenuBase, {templateString:template, baseClass:"dijitMenuBar", popupDelay:0, _isMenuBar:true, _orient:["below"], _moveToPopup:function (evt) {
        if (this.focusedChild && this.focusedChild.popup && !this.focusedChild.disabled) {
            this.onItemClick(this.focusedChild, evt);
        }
    }, focusChild:function (item) {
        this.inherited(arguments);
        if (this.activated && item.popup && !item.disabled) {
            this._openItemPopup(item, true);
        }
    }, _onChildDeselect:function (item) {
        if (this.currentPopupItem == item) {
            this.currentPopupItem = null;
            item._closePopup();
        }
        this.inherited(arguments);
    }, _onLeftArrow:function () {
        this.focusPrev();
    }, _onRightArrow:function () {
        this.focusNext();
    }, _onDownArrow:function (evt) {
        this._moveToPopup(evt);
    }, _onUpArrow:function () {
    }, onItemClick:function (item, evt) {
        if (item.popup && item.popup.isShowingNow && (!/^key/.test(evt.type) || evt.keyCode !== keys.DOWN_ARROW)) {
            item.focusNode.focus();
            this._cleanUp(true);
        } else {
            this.inherited(arguments);
        }
    }});
});

