//>>built

define("dojox/widget/FilePicker", ["dijit", "dojo", "dojox", "dojo/i18n!dojox/widget/nls/FilePicker", "dojo/require!dojox/widget/RollingList,dojo/i18n"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.widget.FilePicker");
    dojo.require("dojox.widget.RollingList");
    dojo.require("dojo.i18n");
    dojo.requireLocalization("dojox.widget", "FilePicker");
    dojo.declare("dojox.widget._FileInfoPane", [dojox.widget._RollingListPane], {templateString:"", templateString:dojo.cache("dojox.widget", "FilePicker/_FileInfoPane.html", "<div class=\"dojoxFileInfoPane\">\n\t<table>\n\t\t<tbody>\n\t\t\t<tr>\n\t\t\t\t<td class=\"dojoxFileInfoLabel dojoxFileInfoNameLabel\">${_messages.name}</td>\n\t\t\t\t<td class=\"dojoxFileInfoName\" dojoAttachPoint=\"nameNode\"></td>\n\t\t\t</tr>\n\t\t\t<tr>\n\t\t\t\t<td class=\"dojoxFileInfoLabel dojoxFileInfoPathLabel\">${_messages.path}</td>\n\t\t\t\t<td class=\"dojoxFileInfoPath\" dojoAttachPoint=\"pathNode\"></td>\n\t\t\t</tr>\n\t\t\t<tr>\n\t\t\t\t<td class=\"dojoxFileInfoLabel dojoxFileInfoSizeLabel\">${_messages.size}</td>\n\t\t\t\t<td class=\"dojoxFileInfoSize\" dojoAttachPoint=\"sizeNode\"></td>\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\n\t<div dojoAttachPoint=\"containerNode\" style=\"display:none;\"></div>\n</div>"), postMixInProperties:function () {
        this._messages = dojo.i18n.getLocalization("dojox.widget", "FilePicker", this.lang);
        this.inherited(arguments);
    }, onItems:function () {
        var store = this.store, item = this.items[0];
        if (!item) {
            this._onError("Load", new Error("No item defined"));
        } else {
            this.nameNode.innerHTML = store.getLabel(item);
            this.pathNode.innerHTML = store.getIdentity(item);
            this.sizeNode.innerHTML = store.getValue(item, "size");
            this.parentWidget.scrollIntoView(this);
            this.inherited(arguments);
        }
    }});
    dojo.declare("dojox.widget.FilePicker", dojox.widget.RollingList, {className:"dojoxFilePicker", pathSeparator:"", topDir:"", parentAttr:"parentDir", pathAttr:"path", preloadItems:50, selectDirectories:true, selectFiles:true, _itemsMatch:function (item1, item2) {
        if (!item1 && !item2) {
            return true;
        } else {
            if (!item1 || !item2) {
                return false;
            } else {
                if (item1 == item2) {
                    return true;
                } else {
                    if (this._isIdentity) {
                        var iArr = [this.store.getIdentity(item1), this.store.getIdentity(item2)];
                        dojo.forEach(iArr, function (i, idx) {
                            if (i.lastIndexOf(this.pathSeparator) == (i.length - 1)) {
                                iArr[idx] = i.substring(0, i.length - 1);
                            } else {
                            }
                        }, this);
                        return (iArr[0] == iArr[1]);
                    }
                }
            }
        }
        return false;
    }, startup:function () {
        if (this._started) {
            return;
        }
        this.inherited(arguments);
        var conn, child = this.getChildren()[0];
        var setSeparator = dojo.hitch(this, function () {
            if (conn) {
                this.disconnect(conn);
            }
            delete conn;
            var item = child.items[0];
            if (item) {
                var store = this.store;
                var parent = store.getValue(item, this.parentAttr);
                var path = store.getValue(item, this.pathAttr);
                this.pathSeparator = this.pathSeparator || store.pathSeparator;
                if (!this.pathSeparator) {
                    this.pathSeparator = path.substring(parent.length, parent.length + 1);
                }
                if (!this.topDir) {
                    this.topDir = parent;
                    if (this.topDir.lastIndexOf(this.pathSeparator) != (this.topDir.length - 1)) {
                        this.topDir += this.pathSeparator;
                    }
                }
            }
        });
        if (!this.pathSeparator || !this.topDir) {
            if (!child.items) {
                conn = this.connect(child, "onItems", setSeparator);
            } else {
                setSeparator();
            }
        }
    }, getChildItems:function (item) {
        var ret = this.inherited(arguments);
        if (!ret && this.store.getValue(item, "directory")) {
            ret = [];
        }
        return ret;
    }, getMenuItemForItem:function (item, parentPane, children) {
        var menuOptions = {iconClass:"dojoxDirectoryItemIcon"};
        if (!this.store.getValue(item, "directory")) {
            menuOptions.iconClass = "dojoxFileItemIcon";
            var l = this.store.getLabel(item), idx = l.lastIndexOf(".");
            if (idx >= 0) {
                menuOptions.iconClass += " dojoxFileItemIcon_" + l.substring(idx + 1);
            }
            if (!this.selectFiles) {
                menuOptions.disabled = true;
            }
        }
        var ret = new dijit.MenuItem(menuOptions);
        return ret;
    }, getPaneForItem:function (item, parentPane, children) {
        var ret = null;
        if (!item || (this.store.isItem(item) && this.store.getValue(item, "directory"))) {
            ret = new dojox.widget._RollingListGroupPane({});
        } else {
            if (this.store.isItem(item) && !this.store.getValue(item, "directory")) {
                ret = new dojox.widget._FileInfoPane({});
            }
        }
        return ret;
    }, _setPathValueAttr:function (path, resetLastExec, onSet) {
        if (!path) {
            this.set("value", null);
            return;
        }
        if (path.lastIndexOf(this.pathSeparator) == (path.length - 1)) {
            path = path.substring(0, path.length - 1);
        }
        this.store.fetchItemByIdentity({identity:path, onItem:function (v) {
            if (resetLastExec) {
                this._lastExecutedValue = v;
            }
            this.set("value", v);
            if (onSet) {
                onSet();
            }
        }, scope:this});
    }, _getPathValueAttr:function (val) {
        if (!val) {
            val = this.value;
        }
        if (val && this.store.isItem(val)) {
            return this.store.getValue(val, this.pathAttr);
        } else {
            return "";
        }
    }, _setValue:function (value) {
        delete this._setInProgress;
        var store = this.store;
        if (value && store.isItem(value)) {
            var isDirectory = this.store.getValue(value, "directory");
            if ((isDirectory && !this.selectDirectories) || (!isDirectory && !this.selectFiles)) {
                return;
            }
        } else {
            value = null;
        }
        if (!this._itemsMatch(this.value, value)) {
            this.value = value;
            this._onChange(value);
        }
    }});
});

