//>>built

define("dijit/form/_ComboBoxMenu", ["dojo/_base/declare", "dojo/dom-class", "dojo/dom-style", "dojo/keys", "../_WidgetBase", "../_TemplatedMixin", "./_ComboBoxMenuMixin", "./_ListMouseMixin"], function (declare, domClass, domStyle, keys, _WidgetBase, _TemplatedMixin, _ComboBoxMenuMixin, _ListMouseMixin) {
    return declare("dijit.form._ComboBoxMenu", [_WidgetBase, _TemplatedMixin, _ListMouseMixin, _ComboBoxMenuMixin], {templateString:"<div class='dijitReset dijitMenu' data-dojo-attach-point='containerNode' style='overflow: auto; overflow-x: hidden;' role='listbox'>" + "<div class='dijitMenuItem dijitMenuPreviousButton' data-dojo-attach-point='previousButton' role='option'></div>" + "<div class='dijitMenuItem dijitMenuNextButton' data-dojo-attach-point='nextButton' role='option'></div>" + "</div>", baseClass:"dijitComboBoxMenu", postCreate:function () {
        this.inherited(arguments);
        if (!this.isLeftToRight()) {
            domClass.add(this.previousButton, "dijitMenuItemRtl");
            domClass.add(this.nextButton, "dijitMenuItemRtl");
        }
        this.containerNode.setAttribute("role", "listbox");
    }, _createMenuItem:function () {
        var item = this.ownerDocument.createElement("div");
        item.className = "dijitReset dijitMenuItem" + (this.isLeftToRight() ? "" : " dijitMenuItemRtl");
        item.setAttribute("role", "option");
        return item;
    }, onHover:function (node) {
        domClass.add(node, "dijitMenuItemHover");
    }, onUnhover:function (node) {
        domClass.remove(node, "dijitMenuItemHover");
    }, onSelect:function (node) {
        domClass.add(node, "dijitMenuItemSelected");
    }, onDeselect:function (node) {
        domClass.remove(node, "dijitMenuItemSelected");
    }, _page:function (up) {
        var scrollamount = 0;
        var oldscroll = this.domNode.scrollTop;
        var height = domStyle.get(this.domNode, "height");
        if (!this.getHighlightedOption()) {
            this.selectNextNode();
        }
        while (scrollamount < height) {
            var highlighted_option = this.getHighlightedOption();
            if (up) {
                if (!highlighted_option.previousSibling || highlighted_option.previousSibling.style.display == "none") {
                    break;
                }
                this.selectPreviousNode();
            } else {
                if (!highlighted_option.nextSibling || highlighted_option.nextSibling.style.display == "none") {
                    break;
                }
                this.selectNextNode();
            }
            var newscroll = this.domNode.scrollTop;
            scrollamount += (newscroll - oldscroll) * (up ? -1 : 1);
            oldscroll = newscroll;
        }
    }, handleKey:function (evt) {
        switch (evt.keyCode) {
          case keys.DOWN_ARROW:
            this.selectNextNode();
            return false;
          case keys.PAGE_DOWN:
            this._page(false);
            return false;
          case keys.UP_ARROW:
            this.selectPreviousNode();
            return false;
          case keys.PAGE_UP:
            this._page(true);
            return false;
          default:
            return true;
        }
    }});
});

