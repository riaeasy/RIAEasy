//>>built

define("dojox/widget/RollingList", ["dijit", "dojo", "dojox", "dojo/i18n!dijit/nls/common", "dojo/require!dojo/window,dijit/layout/ContentPane,dijit/_Templated,dijit/_Contained,dijit/layout/_LayoutWidget,dijit/Menu,dijit/form/Button,dijit/focus,dijit/_base/focus,dojox/html/metrics,dojo/i18n"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.widget.RollingList");
    dojo.experimental("dojox.widget.RollingList");
    dojo.require("dojo.window");
    dojo.require("dijit.layout.ContentPane");
    dojo.require("dijit._Templated");
    dojo.require("dijit._Contained");
    dojo.require("dijit.layout._LayoutWidget");
    dojo.require("dijit.Menu");
    dojo.require("dijit.form.Button");
    dojo.require("dijit.focus");
    dojo.require("dijit._base.focus");
    dojo.require("dojox.html.metrics");
    dojo.require("dojo.i18n");
    dojo.requireLocalization("dijit", "common");
    dojo.declare("dojox.widget._RollingListPane", [dijit.layout.ContentPane, dijit._Templated, dijit._Contained], {templateString:"<div class=\"dojoxRollingListPane\"><table><tbody><tr><td dojoAttachPoint=\"containerNode\"></td></tr></tbody></div>", parentWidget:null, parentPane:null, store:null, items:null, query:null, queryOptions:null, _focusByNode:true, minWidth:0, _setContentAndScroll:function (cont, isFakeContent) {
        this._setContent(cont, isFakeContent);
        this.parentWidget.scrollIntoView(this);
    }, _updateNodeWidth:function (n, min) {
        n.style.width = "";
        var nWidth = dojo.marginBox(n).w;
        if (nWidth < min) {
            dojo.marginBox(n, {w:min});
        }
    }, _onMinWidthChange:function (v) {
        this._updateNodeWidth(this.domNode, v);
    }, _setMinWidthAttr:function (v) {
        if (v !== this.minWidth) {
            this.minWidth = v;
            this._onMinWidthChange(v);
        }
    }, startup:function () {
        if (this._started) {
            return;
        }
        if (this.store && this.store.getFeatures()["dojo.data.api.Notification"]) {
            window.setTimeout(dojo.hitch(this, function () {
                this.connect(this.store, "onSet", "_onSetItem");
                this.connect(this.store, "onNew", "_onNewItem");
                this.connect(this.store, "onDelete", "_onDeleteItem");
            }), 1);
        }
        this.connect(this.focusNode || this.domNode, "onkeypress", "_focusKey");
        this.parentWidget._updateClass(this.domNode, "Pane");
        this.inherited(arguments);
        this._onMinWidthChange(this.minWidth);
    }, _focusKey:function (e) {
        if (e.charOrCode == dojo.keys.BACKSPACE) {
            dojo.stopEvent(e);
            return;
        } else {
            if (e.charOrCode == dojo.keys.LEFT_ARROW && this.parentPane) {
                this.parentPane.focus();
                this.parentWidget.scrollIntoView(this.parentPane);
            } else {
                if (e.charOrCode == dojo.keys.ENTER) {
                    this.parentWidget._onExecute();
                }
            }
        }
    }, focus:function (force) {
        if (this.parentWidget._focusedPane != this) {
            this.parentWidget._focusedPane = this;
            this.parentWidget.scrollIntoView(this);
            if (this._focusByNode && (!this.parentWidget._savedFocus || force)) {
                try {
                    (this.focusNode || this.domNode).focus();
                }
                catch (e) {
                }
            }
        }
    }, _onShow:function () {
        this.inherited(arguments);
        if ((this.store || this.items) && ((this.refreshOnShow && this.domNode) || (!this.isLoaded && this.domNode))) {
            this.refresh();
        }
    }, _load:function () {
        this.isLoaded = false;
        if (this.items) {
            this._setContentAndScroll(this.onLoadStart(), true);
            window.setTimeout(dojo.hitch(this, "_doQuery"), 1);
        } else {
            this._doQuery();
        }
    }, _doLoadItems:function (items, callback) {
        var _waitCount = 0, store = this.store;
        dojo.forEach(items, function (item) {
            if (!store.isItemLoaded(item)) {
                _waitCount++;
            }
        });
        if (_waitCount === 0) {
            callback();
        } else {
            var onItem = function (item) {
                _waitCount--;
                if ((_waitCount) === 0) {
                    callback();
                }
            };
            dojo.forEach(items, function (item) {
                if (!store.isItemLoaded(item)) {
                    store.loadItem({item:item, onItem:onItem});
                }
            });
        }
    }, _doQuery:function () {
        if (!this.domNode) {
            return;
        }
        var preload = this.parentWidget.preloadItems;
        preload = (preload === true || (this.items && this.items.length <= Number(preload)));
        if (this.items && preload) {
            this._doLoadItems(this.items, dojo.hitch(this, "onItems"));
        } else {
            if (this.items) {
                this.onItems();
            } else {
                this._setContentAndScroll(this.onFetchStart(), true);
                this.store.fetch({query:this.query, onComplete:function (items) {
                    this.items = items;
                    this.onItems();
                }, onError:function (e) {
                    this._onError("Fetch", e);
                }, scope:this});
            }
        }
    }, _hasItem:function (item) {
        var items = this.items || [];
        for (var i = 0, myItem; (myItem = items[i]); i++) {
            if (this.parentWidget._itemsMatch(myItem, item)) {
                return true;
            }
        }
        return false;
    }, _onSetItem:function (item, attribute, oldValue, newValue) {
        if (this._hasItem(item)) {
            this.refresh();
        }
    }, _onNewItem:function (newItem, parentInfo) {
        var sel;
        if ((!parentInfo && !this.parentPane) || (parentInfo && this.parentPane && this.parentPane._hasItem(parentInfo.item) && (sel = this.parentPane._getSelected()) && this.parentWidget._itemsMatch(sel.item, parentInfo.item))) {
            this.items.push(newItem);
            this.refresh();
        } else {
            if (parentInfo && this.parentPane && this._hasItem(parentInfo.item)) {
                this.refresh();
            }
        }
    }, _onDeleteItem:function (deletedItem) {
        if (this._hasItem(deletedItem)) {
            this.items = dojo.filter(this.items, function (i) {
                return (i != deletedItem);
            });
            this.refresh();
        }
    }, onFetchStart:function () {
        return this.loadingMessage;
    }, onFetchError:function (error) {
        return this.errorMessage;
    }, onLoadStart:function () {
        return this.loadingMessage;
    }, onLoadError:function (error) {
        return this.errorMessage;
    }, onItems:function () {
        if (!this.onLoadDeferred) {
            this.cancel();
            this.onLoadDeferred = new dojo.Deferred(dojo.hitch(this, "cancel"));
        }
        this._onLoadHandler();
    }});
    dojo.declare("dojox.widget._RollingListGroupPane", [dojox.widget._RollingListPane], {templateString:"<div><div dojoAttachPoint=\"containerNode\"></div>" + "<div dojoAttachPoint=\"menuContainer\">" + "<div dojoAttachPoint=\"menuNode\"></div>" + "</div></div>", _menu:null, _setContent:function (cont) {
        if (!this._menu) {
            this.inherited(arguments);
        }
    }, _onMinWidthChange:function (v) {
        if (!this._menu) {
            return;
        }
        var dWidth = dojo.marginBox(this.domNode).w;
        var mWidth = dojo.marginBox(this._menu.domNode).w;
        this._updateNodeWidth(this._menu.domNode, v - (dWidth - mWidth));
    }, onItems:function () {
        var selectItem, hadChildren = false;
        if (this._menu) {
            selectItem = this._getSelected();
            this._menu.destroyRecursive();
        }
        this._menu = this._getMenu();
        var child, selectMenuItem;
        if (this.items.length) {
            dojo.forEach(this.items, function (item) {
                child = this.parentWidget._getMenuItemForItem(item, this);
                if (child) {
                    if (selectItem && this.parentWidget._itemsMatch(child.item, selectItem.item)) {
                        selectMenuItem = child;
                    }
                    this._menu.addChild(child);
                }
            }, this);
        } else {
            child = this.parentWidget._getMenuItemForItem(null, this);
            if (child) {
                this._menu.addChild(child);
            }
        }
        if (selectMenuItem) {
            this._setSelected(selectMenuItem);
            if ((selectItem && !selectItem.children && selectMenuItem.children) || (selectItem && selectItem.children && !selectMenuItem.children)) {
                var itemPane = this.parentWidget._getPaneForItem(selectMenuItem.item, this, selectMenuItem.children);
                if (itemPane) {
                    this.parentWidget.addChild(itemPane, this.getIndexInParent() + 1);
                } else {
                    this.parentWidget._removeAfter(this);
                    this.parentWidget._onItemClick(null, this, selectMenuItem.item, selectMenuItem.children);
                }
            }
        } else {
            if (selectItem) {
                this.parentWidget._removeAfter(this);
            }
        }
        this.containerNode.innerHTML = "";
        this.containerNode.appendChild(this._menu.domNode);
        this.parentWidget.scrollIntoView(this);
        this._checkScrollConnection(true);
        this.inherited(arguments);
        this._onMinWidthChange(this.minWidth);
    }, _checkScrollConnection:function (doLoad) {
        var store = this.store;
        if (this._scrollConn) {
            this.disconnect(this._scrollConn);
        }
        delete this._scrollConn;
        if (!dojo.every(this.items, function (i) {
            return store.isItemLoaded(i);
        })) {
            if (doLoad) {
                this._loadVisibleItems();
            }
            this._scrollConn = this.connect(this.domNode, "onscroll", "_onScrollPane");
        }
    }, startup:function () {
        this.inherited(arguments);
        this.parentWidget._updateClass(this.domNode, "GroupPane");
    }, focus:function (force) {
        if (this._menu) {
            if (this._pendingFocus) {
                this.disconnect(this._pendingFocus);
            }
            delete this._pendingFocus;
            var focusWidget = this._menu.focusedChild;
            if (!focusWidget) {
                var focusNode = dojo.query(".dojoxRollingListItemSelected", this.domNode)[0];
                if (focusNode) {
                    focusWidget = dijit.byNode(focusNode);
                }
            }
            if (!focusWidget) {
                focusWidget = this._menu.getChildren()[0] || this._menu;
            }
            this._focusByNode = false;
            if (focusWidget.focusNode) {
                if (!this.parentWidget._savedFocus || force) {
                    try {
                        focusWidget.focusNode.focus();
                    }
                    catch (e) {
                    }
                }
                window.setTimeout(function () {
                    try {
                        dojo.window.scrollIntoView(focusWidget.focusNode);
                    }
                    catch (e) {
                    }
                }, 1);
            } else {
                if (focusWidget.focus) {
                    if (!this.parentWidget._savedFocus || force) {
                        focusWidget.focus();
                    }
                } else {
                    this._focusByNode = true;
                }
            }
            this.inherited(arguments);
        } else {
            if (!this._pendingFocus) {
                this._pendingFocus = this.connect(this, "onItems", "focus");
            }
        }
    }, _getMenu:function () {
        var self = this;
        var menu = new dijit.Menu({parentMenu:this.parentPane ? this.parentPane._menu : null, onCancel:function (closeAll) {
            if (self.parentPane) {
                self.parentPane.focus(true);
            }
        }, _moveToPopup:function (evt) {
            if (this.focusedChild && !this.focusedChild.disabled) {
                this.onItemClick(this.focusedChild, evt);
            }
        }}, this.menuNode);
        this.connect(menu, "onItemClick", function (item, evt) {
            if (item.disabled) {
                return;
            }
            evt.alreadySelected = dojo.hasClass(item.domNode, "dojoxRollingListItemSelected");
            if (evt.alreadySelected && ((evt.type == "keypress" && evt.charOrCode != dojo.keys.ENTER) || (evt.type == "internal"))) {
                var p = this.parentWidget.getChildren()[this.getIndexInParent() + 1];
                if (p) {
                    p.focus(true);
                    this.parentWidget.scrollIntoView(p);
                }
            } else {
                this._setSelected(item, menu);
                this.parentWidget._onItemClick(evt, this, item.item, item.children);
                if (evt.type == "keypress" && evt.charOrCode == dojo.keys.ENTER) {
                    this.parentWidget._onExecute();
                }
            }
        });
        if (!menu._started) {
            menu.startup();
        }
        return menu;
    }, _onScrollPane:function () {
        if (this._visibleLoadPending) {
            window.clearTimeout(this._visibleLoadPending);
        }
        this._visibleLoadPending = window.setTimeout(dojo.hitch(this, "_loadVisibleItems"), 500);
    }, _loadVisibleItems:function () {
        delete this._visibleLoadPending;
        var menu = this._menu;
        if (!menu) {
            return;
        }
        var children = menu.getChildren();
        if (!children || !children.length) {
            return;
        }
        var gpbme = function (n, m, pb) {
            var s = dojo.getComputedStyle(n);
            var r = 0;
            if (m) {
                r += dojo._getMarginExtents(n, s).t;
            }
            if (pb) {
                r += dojo._getPadBorderExtents(n, s).t;
            }
            return r;
        };
        var topOffset = gpbme(this.domNode, false, true) + gpbme(this.containerNode, true, true) + gpbme(menu.domNode, true, true) + gpbme(children[0].domNode, true, false);
        var h = dojo.contentBox(this.domNode).h;
        var minOffset = this.domNode.scrollTop - topOffset - (h / 2);
        var maxOffset = minOffset + (3 * h / 2);
        var menuItemsToLoad = dojo.filter(children, function (c) {
            var cnt = c.domNode.offsetTop;
            var s = c.store;
            var i = c.item;
            return (cnt >= minOffset && cnt <= maxOffset && !s.isItemLoaded(i));
        });
        var itemsToLoad = dojo.map(menuItemsToLoad, function (c) {
            return c.item;
        });
        var onItems = dojo.hitch(this, function () {
            var selectItem = this._getSelected();
            var selectMenuItem;
            dojo.forEach(itemsToLoad, function (item, idx) {
                var newItem = this.parentWidget._getMenuItemForItem(item, this);
                var oItem = menuItemsToLoad[idx];
                var oIdx = oItem.getIndexInParent();
                menu.removeChild(oItem);
                if (newItem) {
                    if (selectItem && this.parentWidget._itemsMatch(newItem.item, selectItem.item)) {
                        selectMenuItem = newItem;
                    }
                    menu.addChild(newItem, oIdx);
                    if (menu.focusedChild == oItem) {
                        menu.focusChild(newItem);
                    }
                }
                oItem.destroy();
            }, this);
            this._checkScrollConnection(false);
        });
        this._doLoadItems(itemsToLoad, onItems);
    }, _getSelected:function (menu) {
        if (!menu) {
            menu = this._menu;
        }
        if (menu) {
            var children = this._menu.getChildren();
            for (var i = 0, item; (item = children[i]); i++) {
                if (dojo.hasClass(item.domNode, "dojoxRollingListItemSelected")) {
                    return item;
                }
            }
        }
        return null;
    }, _setSelected:function (item, menu) {
        if (!menu) {
            menu = this._menu;
        }
        if (menu) {
            dojo.forEach(menu.getChildren(), function (i) {
                this.parentWidget._updateClass(i.domNode, "Item", {"Selected":(item && (i == item && !i.disabled))});
            }, this);
        }
    }});
    dojo.declare("dojox.widget.RollingList", [dijit._Widget, dijit._Templated, dijit._Container], {templateString:dojo.cache("dojox.widget", "RollingList/RollingList.html", "<div class=\"dojoxRollingList ${className}\"\n\t><div class=\"dojoxRollingListContainer\" dojoAttachPoint=\"containerNode\" dojoAttachEvent=\"onkeypress:_onKey\"\n\t></div\n\t><div class=\"dojoxRollingListButtons\" dojoAttachPoint=\"buttonsNode\"\n        ><button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"okButton\"\n\t\t\t\tdojoAttachEvent=\"onClick:_onExecute\">${okButtonLabel}</button\n        ><button dojoType=\"dijit.form.Button\" dojoAttachPoint=\"cancelButton\"\n\t\t\t\tdojoAttachEvent=\"onClick:_onCancel\">${cancelButtonLabel}</button\n\t></div\n></div>\n"), widgetsInTemplate:true, className:"", store:null, query:null, queryOptions:null, childrenAttrs:["children"], parentAttr:"", value:null, executeOnDblClick:true, preloadItems:false, showButtons:false, okButtonLabel:"", cancelButtonLabel:"", minPaneWidth:0, postMixInProperties:function () {
        this.inherited(arguments);
        var loc = dojo.i18n.getLocalization("dijit", "common");
        this.okButtonLabel = this.okButtonLabel || loc.buttonOk;
        this.cancelButtonLabel = this.cancelButtonLabel || loc.buttonCancel;
    }, _setShowButtonsAttr:function (doShow) {
        var needsLayout = false;
        if ((this.showButtons != doShow && this._started) || (this.showButtons == doShow && !this.started)) {
            needsLayout = true;
        }
        dojo.toggleClass(this.domNode, "dojoxRollingListButtonsHidden", !doShow);
        this.showButtons = doShow;
        if (needsLayout) {
            if (this._started) {
                this.layout();
            } else {
                window.setTimeout(dojo.hitch(this, "layout"), 0);
            }
        }
    }, _itemsMatch:function (item1, item2) {
        if (!item1 && !item2) {
            return true;
        } else {
            if (!item1 || !item2) {
                return false;
            }
        }
        return (item1 == item2 || (this._isIdentity && this.store.getIdentity(item1) == this.store.getIdentity(item2)));
    }, _removeAfter:function (idx) {
        if (typeof idx != "number") {
            idx = this.getIndexOfChild(idx);
        }
        if (idx >= 0) {
            dojo.forEach(this.getChildren(), function (c, i) {
                if (i > idx) {
                    this.removeChild(c);
                    c.destroyRecursive();
                }
            }, this);
        }
        var children = this.getChildren(), child = children[children.length - 1];
        var selItem = null;
        while (child && !selItem) {
            var val = child._getSelected ? child._getSelected() : null;
            if (val) {
                selItem = val.item;
            }
            child = child.parentPane;
        }
        if (!this._setInProgress) {
            this._setValue(selItem);
        }
    }, addChild:function (widget, insertIndex) {
        if (insertIndex > 0) {
            this._removeAfter(insertIndex - 1);
        }
        this.inherited(arguments);
        if (!widget._started) {
            widget.startup();
        }
        widget.attr("minWidth", this.minPaneWidth);
        this.layout();
        if (!this._savedFocus) {
            widget.focus();
        }
    }, _setMinPaneWidthAttr:function (value) {
        if (value !== this.minPaneWidth) {
            this.minPaneWidth = value;
            dojo.forEach(this.getChildren(), function (c) {
                c.attr("minWidth", value);
            });
        }
    }, _updateClass:function (node, type, options) {
        if (!this._declaredClasses) {
            this._declaredClasses = ("dojoxRollingList " + this.className).split(" ");
        }
        dojo.forEach(this._declaredClasses, function (c) {
            if (c) {
                dojo.addClass(node, c + type);
                for (var k in options || {}) {
                    dojo.toggleClass(node, c + type + k, options[k]);
                }
                dojo.toggleClass(node, c + type + "FocusSelected", (dojo.hasClass(node, c + type + "Focus") && dojo.hasClass(node, c + type + "Selected")));
                dojo.toggleClass(node, c + type + "HoverSelected", (dojo.hasClass(node, c + type + "Hover") && dojo.hasClass(node, c + type + "Selected")));
            }
        });
    }, scrollIntoView:function (childWidget) {
        if (this._scrollingTimeout) {
            window.clearTimeout(this._scrollingTimeout);
        }
        delete this._scrollingTimeout;
        this._scrollingTimeout = window.setTimeout(dojo.hitch(this, function () {
            if (childWidget.domNode) {
                dojo.window.scrollIntoView(childWidget.domNode);
            }
            delete this._scrollingTimeout;
            return;
        }), 1);
    }, resize:function (args) {
        dijit.layout._LayoutWidget.prototype.resize.call(this, args);
    }, layout:function () {
        var children = this.getChildren();
        if (this._contentBox) {
            var bn = this.buttonsNode;
            var height = this._contentBox.h - dojo.marginBox(bn).h - dojox.html.metrics.getScrollbar().h;
            dojo.forEach(children, function (c) {
                dojo.marginBox(c.domNode, {h:height});
            });
        }
        if (this._focusedPane) {
            var foc = this._focusedPane;
            delete this._focusedPane;
            if (!this._savedFocus) {
                foc.focus();
            }
        } else {
            if (children && children.length) {
                if (!this._savedFocus) {
                    children[0].focus();
                }
            }
        }
    }, _onChange:function (value) {
        this.onChange(value);
    }, _setValue:function (value) {
        delete this._setInProgress;
        if (!this._itemsMatch(this.value, value)) {
            this.value = value;
            this._onChange(value);
        }
    }, _setValueAttr:function (value) {
        if (this._itemsMatch(this.value, value) && !value) {
            return;
        }
        if (this._setInProgress && this._setInProgress === value) {
            return;
        }
        this._setInProgress = value;
        if (!value || !this.store.isItem(value)) {
            var pane = this.getChildren()[0];
            pane._setSelected(null);
            this._onItemClick(null, pane, null, null);
            return;
        }
        var fetchParentItems = dojo.hitch(this, function (item, callback) {
            var store = this.store, id;
            if (this.parentAttr && store.getFeatures()["dojo.data.api.Identity"] && ((id = this.store.getValue(item, this.parentAttr)) || id === "")) {
                var cb = function (i) {
                    if (store.getIdentity(i) == store.getIdentity(item)) {
                        callback(null);
                    } else {
                        callback([i]);
                    }
                };
                if (id === "") {
                    callback(null);
                } else {
                    if (typeof id == "string") {
                        store.fetchItemByIdentity({identity:id, onItem:cb});
                    } else {
                        if (store.isItem(id)) {
                            cb(id);
                        }
                    }
                }
            } else {
                var numCheck = this.childrenAttrs.length;
                var parents = [];
                dojo.forEach(this.childrenAttrs, function (attr) {
                    var q = {};
                    q[attr] = item;
                    store.fetch({query:q, scope:this, onComplete:function (items) {
                        if (this._setInProgress !== value) {
                            return;
                        }
                        parents = parents.concat(items);
                        numCheck--;
                        if (numCheck === 0) {
                            callback(parents);
                        }
                    }});
                }, this);
            }
        });
        var setFromChain = dojo.hitch(this, function (itemChain, idx) {
            var set = itemChain[idx];
            var child = this.getChildren()[idx];
            var conn;
            if (set && child) {
                var fx = dojo.hitch(this, function () {
                    if (conn) {
                        this.disconnect(conn);
                    }
                    delete conn;
                    if (this._setInProgress !== value) {
                        return;
                    }
                    var selOpt = dojo.filter(child._menu.getChildren(), function (i) {
                        return this._itemsMatch(i.item, set);
                    }, this)[0];
                    if (selOpt) {
                        idx++;
                        child._menu.onItemClick(selOpt, {type:"internal", stopPropagation:function () {
                        }, preventDefault:function () {
                        }});
                        if (itemChain[idx]) {
                            setFromChain(itemChain, idx);
                        } else {
                            this._setValue(set);
                            this.onItemClick(set, child, this.getChildItems(set));
                        }
                    }
                });
                if (!child.isLoaded) {
                    conn = this.connect(child, "onLoad", fx);
                } else {
                    fx();
                }
            } else {
                if (idx === 0) {
                    this.set("value", null);
                }
            }
        });
        var parentChain = [];
        var onParents = dojo.hitch(this, function (parents) {
            if (parents && parents.length) {
                parentChain.push(parents[0]);
                fetchParentItems(parents[0], onParents);
            } else {
                if (!parents) {
                    parentChain.pop();
                }
                parentChain.reverse();
                setFromChain(parentChain, 0);
            }
        });
        var ns = this.domNode.style;
        if (ns.display == "none" || ns.visibility == "hidden") {
            this._setValue(value);
        } else {
            if (!this._itemsMatch(value, this._visibleItem)) {
                onParents([value]);
            }
        }
    }, _onItemClick:function (evt, pane, item, children) {
        if (evt) {
            var itemPane = this._getPaneForItem(item, pane, children);
            var alreadySelected = (evt.type == "click" && evt.alreadySelected);
            if (alreadySelected && itemPane) {
                this._removeAfter(pane.getIndexInParent() + 1);
                var next = pane.getNextSibling();
                if (next && next._setSelected) {
                    next._setSelected(null);
                }
                this.scrollIntoView(next);
            } else {
                if (itemPane) {
                    this.addChild(itemPane, pane.getIndexInParent() + 1);
                    if (this._savedFocus) {
                        itemPane.focus(true);
                    }
                } else {
                    this._removeAfter(pane);
                    this.scrollIntoView(pane);
                }
            }
        } else {
            if (pane) {
                this._removeAfter(pane);
                this.scrollIntoView(pane);
            }
        }
        if (!evt || evt.type != "internal") {
            this._setValue(item);
            this.onItemClick(item, pane, children);
        }
        this._visibleItem = item;
    }, _getPaneForItem:function (item, parentPane, children) {
        var ret = this.getPaneForItem(item, parentPane, children);
        ret.store = this.store;
        ret.parentWidget = this;
        ret.parentPane = parentPane || null;
        if (!item) {
            ret.query = this.query;
            ret.queryOptions = this.queryOptions;
        } else {
            if (children) {
                ret.items = children;
            } else {
                ret.items = [item];
            }
        }
        return ret;
    }, _getMenuItemForItem:function (item, parentPane) {
        var store = this.store;
        if (!item || !store || !store.isItem(item)) {
            var i = new dijit.MenuItem({label:"---", disabled:true, iconClass:"dojoxEmpty", focus:function () {
            }});
            this._updateClass(i.domNode, "Item");
            return i;
        } else {
            var itemLoaded = store.isItemLoaded(item);
            var childItems = itemLoaded ? this.getChildItems(item) : undefined;
            var widgetItem;
            if (childItems) {
                widgetItem = this.getMenuItemForItem(item, parentPane, childItems);
                widgetItem.children = childItems;
                this._updateClass(widgetItem.domNode, "Item", {"Expanding":true});
                if (!widgetItem._started) {
                    var c = widgetItem.connect(widgetItem, "startup", function () {
                        this.disconnect(c);
                        dojo.style(this.arrowWrapper, "visibility", "");
                    });
                } else {
                    dojo.style(widgetItem.arrowWrapper, "visibility", "");
                }
            } else {
                widgetItem = this.getMenuItemForItem(item, parentPane, null);
                if (itemLoaded) {
                    this._updateClass(widgetItem.domNode, "Item", {"Single":true});
                } else {
                    this._updateClass(widgetItem.domNode, "Item", {"Unloaded":true});
                    widgetItem.attr("disabled", true);
                }
            }
            widgetItem.store = this.store;
            widgetItem.item = item;
            if (!widgetItem.label) {
                widgetItem.attr("label", this.store.getLabel(item).replace(/</, "&lt;"));
            }
            if (widgetItem.focusNode) {
                var self = this;
                widgetItem.focus = function () {
                    if (!this.disabled) {
                        try {
                            this.focusNode.focus();
                        }
                        catch (e) {
                        }
                    }
                };
                widgetItem.connect(widgetItem.focusNode, "onmouseenter", function () {
                    if (!this.disabled) {
                        self._updateClass(this.domNode, "Item", {"Hover":true});
                    }
                });
                widgetItem.connect(widgetItem.focusNode, "onmouseleave", function () {
                    if (!this.disabled) {
                        self._updateClass(this.domNode, "Item", {"Hover":false});
                    }
                });
                widgetItem.connect(widgetItem.focusNode, "blur", function () {
                    self._updateClass(this.domNode, "Item", {"Focus":false, "Hover":false});
                });
                widgetItem.connect(widgetItem.focusNode, "focus", function () {
                    self._updateClass(this.domNode, "Item", {"Focus":true});
                    self._focusedPane = parentPane;
                });
                if (this.executeOnDblClick) {
                    widgetItem.connect(widgetItem.focusNode, "ondblclick", function () {
                        self._onExecute();
                    });
                }
            }
            return widgetItem;
        }
    }, _setStore:function (store) {
        if (store === this.store && this._started) {
            return;
        }
        this.store = store;
        this._isIdentity = store.getFeatures()["dojo.data.api.Identity"];
        var rootPane = this._getPaneForItem();
        this.addChild(rootPane, 0);
    }, _onKey:function (e) {
        if (e.charOrCode == dojo.keys.BACKSPACE) {
            dojo.stopEvent(e);
            return;
        } else {
            if (e.charOrCode == dojo.keys.ESCAPE && this._savedFocus) {
                try {
                    dijit.focus(this._savedFocus);
                }
                catch (e) {
                }
                dojo.stopEvent(e);
                return;
            } else {
                if (e.charOrCode == dojo.keys.LEFT_ARROW || e.charOrCode == dojo.keys.RIGHT_ARROW) {
                    dojo.stopEvent(e);
                    return;
                }
            }
        }
    }, _resetValue:function () {
        this.set("value", this._lastExecutedValue);
    }, _onCancel:function () {
        this._resetValue();
        this.onCancel();
    }, _onExecute:function () {
        this._lastExecutedValue = this.get("value");
        this.onExecute();
    }, focus:function () {
        var wasSaved = this._savedFocus;
        this._savedFocus = dijit.getFocus(this);
        if (!this._savedFocus.node) {
            delete this._savedFocus;
        }
        if (!this._focusedPane) {
            var child = this.getChildren()[0];
            if (child && !wasSaved) {
                child.focus(true);
            }
        } else {
            this._savedFocus = dijit.getFocus(this);
            var foc = this._focusedPane;
            delete this._focusedPane;
            if (!wasSaved) {
                foc.focus(true);
            }
        }
    }, handleKey:function (e) {
        if (e.keyCode == dojo.keys.DOWN_ARROW) {
            delete this._savedFocus;
            this.focus();
            return false;
        } else {
            if (e.keyCode == dojo.keys.ESCAPE) {
                this._onCancel();
                return false;
            }
        }
        return true;
    }, _updateChildClasses:function () {
        var children = this.getChildren();
        var length = children.length;
        dojo.forEach(children, function (c, idx) {
            dojo.toggleClass(c.domNode, "dojoxRollingListPaneCurrentChild", (idx == (length - 1)));
            dojo.toggleClass(c.domNode, "dojoxRollingListPaneCurrentSelected", (idx == (length - 2)));
        });
    }, startup:function () {
        if (this._started) {
            return;
        }
        if (!this.getParent || !this.getParent()) {
            this.resize();
            this.connect(dojo.global, "onresize", "resize");
        }
        this.connect(this, "addChild", "_updateChildClasses");
        this.connect(this, "removeChild", "_updateChildClasses");
        this._setStore(this.store);
        this.set("showButtons", this.showButtons);
        this.inherited(arguments);
        this._lastExecutedValue = this.get("value");
    }, getChildItems:function (item) {
        var childItems, store = this.store;
        dojo.forEach(this.childrenAttrs, function (attr) {
            var vals = store.getValues(item, attr);
            if (vals && vals.length) {
                childItems = (childItems || []).concat(vals);
            }
        });
        return childItems;
    }, getMenuItemForItem:function (item, parentPane, children) {
        return new dijit.MenuItem({});
    }, getPaneForItem:function (item, parentPane, children) {
        if (!item || children) {
            return new dojox.widget._RollingListGroupPane({});
        } else {
            return null;
        }
    }, onItemClick:function (item, pane, children) {
    }, onExecute:function () {
    }, onCancel:function () {
    }, onChange:function (value) {
    }});
});

