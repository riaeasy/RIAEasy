//>>built

define("dojox/widget/PlaceholderMenuItem", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "dojo/dom-style", "dojo/_base/kernel", "dojo/query", "dijit/registry", "dijit/Menu", "dijit/MenuItem"], function (array, declare, lang, style, kernel, query, registry, Menu, MenuItem) {
    kernel.experimental("dojox.widget.PlaceholderMenuItem");
    var PlaceholderMenuItem = declare("dojox.widget.PlaceholderMenuItem", MenuItem, {_replaced:false, _replacedWith:null, _isPlaceholder:true, postCreate:function () {
        style.set(this.domNode, "display", "none");
        this._replacedWith = [];
        if (!this.label) {
            this.label = this.containerNode.innerHTML;
        }
        this.inherited(arguments);
    }, replace:function (menuItems) {
        if (this._replaced) {
            return false;
        }
        var index = this.getIndexInParent();
        if (index < 0) {
            return false;
        }
        var p = this.getParent();
        array.forEach(menuItems, function (item) {
            p.addChild(item, index++);
        });
        this._replacedWith = menuItems;
        this._replaced = true;
        return true;
    }, unReplace:function (destroy) {
        if (!this._replaced) {
            return [];
        }
        var p = this.getParent();
        if (!p) {
            return [];
        }
        var r = this._replacedWith;
        array.forEach(this._replacedWith, function (item) {
            p.removeChild(item);
            if (destroy) {
                item.destroyRecursive();
            }
        });
        this._replacedWith = [];
        this._replaced = false;
        return r;
    }});
    lang.extend(Menu, {getPlaceholders:function (label) {
        var r = [];
        var children = this.getChildren();
        array.forEach(children, function (child) {
            if (child._isPlaceholder && (!label || child.label == label)) {
                r.push(child);
            } else {
                if (child._started && child.popup && child.popup.getPlaceholders) {
                    r = r.concat(child.popup.getPlaceholders(label));
                } else {
                    if (!child._started && child.dropDownContainer) {
                        var node = query("[widgetId]", child.dropDownContainer)[0];
                        var menu = registry.byNode(node);
                        if (menu.getPlaceholders) {
                            r = r.concat(menu.getPlaceholders(label));
                        }
                    }
                }
            }
        }, this);
        return r;
    }});
    return PlaceholderMenuItem;
});

