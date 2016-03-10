//>>built

require({cache:{"url:dojox/editor/plugins/resources/insertTable.html":"<div class=\"dijitDialog\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"${id}_title\">\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\">${insertTableTitle}</span>\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\" title=\"${buttonCancel}\">\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\" title=\"${buttonCancel}\">x</span>\n\t</span>\n\t</div>\n    <div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\n        <table class=\"etdTable\"><tr>\n            <td>\n                <label>${rows}</label>\n\t\t\t</td><td>\n                <span dojoAttachPoint=\"selectRow\" dojoType=\"dijit.form.TextBox\" value=\"2\"></span>\n            </td><td><table><tr><td class=\"inner\">\n                <label>${columns}</label>\n\t\t\t</td><td class=\"inner\">\n                <span dojoAttachPoint=\"selectCol\" dojoType=\"dijit.form.TextBox\" value=\"2\"></span>\n            </td></tr></table></td></tr>\t\t\n\t\t\t<tr><td>\n                <label>${tableWidth}</label>\n            </td><td>\n                <span dojoAttachPoint=\"selectWidth\" dojoType=\"dijit.form.TextBox\" value=\"100\"></span>\n\t\t\t</td><td>\n                <select dojoAttachPoint=\"selectWidthType\" hasDownArrow=\"true\" dojoType=\"dijit.form.FilteringSelect\">\n                  <option value=\"percent\">${percent}</option>\n                  <option value=\"pixels\">${pixels}</option>\n                </select></td></tr>\t\n            <tr><td>\n                <label>${borderThickness}</label>\n            </td><td>\n                <span dojoAttachPoint=\"selectBorder\" dojoType=\"dijit.form.TextBox\" value=\"1\"></span>\n            </td><td>\n                ${pixels}\n            </td></tr><tr><td>\n                <label>${cellPadding}</label>\n            </td><td>\n                <span dojoAttachPoint=\"selectPad\" dojoType=\"dijit.form.TextBox\" value=\"0\"></span>\n            </td><td class=\"cellpad\"></td></tr><tr><td>\n                <label>${cellSpacing}</label>\n            </td><td>\n                <span dojoAttachPoint=\"selectSpace\" dojoType=\"dijit.form.TextBox\" value=\"0\"></span>\n            </td><td class=\"cellspace\"></td></tr></table>\n        <div class=\"dialogButtonContainer\">\n            <div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick: onInsert\">${buttonInsert}</div>\n            <div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick: onCancel\">${buttonCancel}</div>\n        </div>\n\t</div>\n</div>\n", "url:dojox/editor/plugins/resources/modifyTable.html":"<div class=\"dijitDialog\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"${id}_title\">\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\">${modifyTableTitle}</span>\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\" title=\"${buttonCancel}\">\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\" title=\"${buttonCancel}\">x</span>\n\t</span>\n\t</div>\n    <div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\n        <table class=\"etdTable\">\n          <tr><td>\n                <label>${backgroundColor}</label>\n            </td><td colspan=\"2\">\n                <span class=\"colorSwatchBtn\" dojoAttachPoint=\"backgroundCol\"></span>\n            </td></tr><tr><td>\n                <label>${borderColor}</label>\n            </td><td colspan=\"2\">\n                <span class=\"colorSwatchBtn\" dojoAttachPoint=\"borderCol\"></span>\n            </td></tr><tr><td>\n                <label>${align}</label>\n            </td><td colspan=\"2\">\t\n                <select dojoAttachPoint=\"selectAlign\" dojoType=\"dijit.form.FilteringSelect\">\n                  <option value=\"default\">${default}</option>\n                  <option value=\"left\">${left}</option>\n                  <option value=\"center\">${center}</option>\n                  <option value=\"right\">${right}</option>\n                </select>\n            </td></tr>\n            <tr><td>\n                <label>${tableWidth}</label>\n            </td><td>\n                <span dojoAttachPoint=\"selectWidth\" dojoType=\"dijit.form.TextBox\" value=\"100\"></span>\n            </td><td>\n                <select dojoAttachPoint=\"selectWidthType\" hasDownArrow=\"true\" dojoType=\"dijit.form.FilteringSelect\">\n                  <option value=\"percent\">${percent}</option>\n                  <option value=\"pixels\">${pixels}</option>\n                </select></td></tr>\t\n            <tr><td>\n                <label>${borderThickness}</label>\n            </td><td>\n                <span dojoAttachPoint=\"selectBorder\" dojoType=\"dijit.form.TextBox\" value=\"1\"></span>\n            </td><td>\n                ${pixels}\n            </td></tr><tr><td>\n                <label>${cellPadding}</label>\n            </td><td>\n                <span dojoAttachPoint=\"selectPad\" dojoType=\"dijit.form.TextBox\" value=\"0\"></span>\n            </td><td class=\"cellpad\"></td></tr><tr><td>\n                <label>${cellSpacing}</label>\n            </td><td>\n                <span dojoAttachPoint=\"selectSpace\" dojoType=\"dijit.form.TextBox\" value=\"0\"></span>\n            </td><td class=\"cellspace\"></td></tr>\n        </table>\n        <div class=\"dialogButtonContainer\">\n            <div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick: onSet\">${buttonSet}</div>\n            <div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick: onCancel\">${buttonCancel}</div>\n        </div>\n\t</div>\n</div>\n"}});
define("dojox/editor/plugins/TablePlugins", ["dojo/_base/declare", "dojo/_base/array", "dojo/_base/Color", "dojo/aspect", "dojo/dom-attr", "dojo/dom-style", "dijit/_editor/_Plugin", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/Dialog", "dijit/Menu", "dijit/MenuItem", "dijit/MenuSeparator", "dijit/ColorPalette", "dojox/widget/ColorPicker", "dojo/text!./resources/insertTable.html", "dojo/text!./resources/modifyTable.html", "dojo/i18n!./nls/TableDialog", "dijit/_base/popup", "dijit/popup", "dojo/_base/connect", "dijit/TooltipDialog", "dijit/form/Button", "dijit/form/DropDownButton", "dijit/form/TextBox", "dijit/form/FilteringSelect"], function (declare, array, Color, aspect, domAttr, domStyle, _Plugin, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, Menu, MenuItem, MenuSeparator, ColorPalette, ColorPicker, insertTableTemplate, modifyTableTemplate, tableDialogStrings) {
    dojo.experimental("dojox.editor.plugins.TablePlugins");
    var TableHandler = declare(_Plugin, {tablesConnected:false, currentlyAvailable:false, alwaysAvailable:false, availableCurrentlySet:false, initialized:false, tableData:null, shiftKeyDown:false, editorDomNode:null, undoEnabled:true, refCount:0, doMixins:function () {
        dojo.mixin(this.editor, {getAncestorElement:function (tagName) {
            return this._sCall("getAncestorElement", [tagName]);
        }, hasAncestorElement:function (tagName) {
            return this._sCall("hasAncestorElement", [tagName]);
        }, selectElement:function (elem) {
            this._sCall("selectElement", [elem]);
        }, byId:function (id) {
            return dojo.byId(id, this.document);
        }, query:function (arg, scope, returnFirstOnly) {
            var ar = dojo.query(arg, scope || this.document);
            return (returnFirstOnly) ? ar[0] : ar;
        }});
    }, initialize:function (editor) {
        this.refCount++;
        editor.customUndo = true;
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.editor = editor;
        this.editor._tablePluginHandler = this;
        editor.onLoadDeferred.addCallback(dojo.hitch(this, function () {
            this.editorDomNode = this.editor.editNode || this.editor.iframe.document.body.firstChild;
            this._myListeners = [dojo.connect(this.editorDomNode, "mouseup", this.editor, "onClick"), dojo.connect(this.editor, "onDisplayChanged", this, "checkAvailable"), dojo.connect(this.editor, "onBlur", this, "checkAvailable"), dojo.connect(this.editor, "_saveSelection", this, function () {
                this._savedTableInfo = this.getTableInfo();
            }), dojo.connect(this.editor, "_restoreSelection", this, function () {
                delete this._savedTableInfo;
            })];
            this.doMixins();
            this.connectDraggable();
        }));
    }, getTableInfo:function (forceNewData) {
        if (this._savedTableInfo) {
            return this._savedTableInfo;
        }
        if (forceNewData) {
            this._tempStoreTableData(false);
        }
        if (this.tableData) {
            return this.tableData;
        }
        var tr, trs, td, tds, tbl, cols, tdIndex, trIndex, o;
        td = this.editor.getAncestorElement("td");
        if (td) {
            tr = td.parentNode;
        }
        tbl = this.editor.getAncestorElement("table");
        if (tbl) {
            tds = dojo.query("td", tbl);
            tds.forEach(function (d, i) {
                if (td == d) {
                    tdIndex = i;
                }
            });
            trs = dojo.query("tr", tbl);
            trs.forEach(function (r, i) {
                if (tr == r) {
                    trIndex = i;
                }
            });
            cols = tds.length / trs.length;
            o = {tbl:tbl, td:td, tr:tr, trs:trs, tds:tds, rows:trs.length, cols:cols, tdIndex:tdIndex, trIndex:trIndex, colIndex:tdIndex % cols};
        } else {
            o = {};
        }
        this.tableData = o;
        this._tempStoreTableData(500);
        return this.tableData;
    }, connectDraggable:function () {
        if (!dojo.isIE) {
            return;
        }
        this.editorDomNode.ondragstart = dojo.hitch(this, "onDragStart");
        this.editorDomNode.ondragend = dojo.hitch(this, "onDragEnd");
    }, onDragStart:function () {
        var e = window.event;
        if (!e.srcElement.id) {
            e.srcElement.id = "tbl_" + (new Date().getTime());
        }
    }, onDragEnd:function () {
        var e = window.event;
        var node = e.srcElement;
        var id = node.id;
        var doc = this.editor.document;
        if (node.tagName.toLowerCase() == "table") {
            setTimeout(function () {
                var node = dojo.byId(id, doc);
                dojo.removeAttr(node, "align");
            }, 100);
        }
    }, checkAvailable:function () {
        if (this.availableCurrentlySet) {
            return this.currentlyAvailable;
        }
        if (!this.editor) {
            return false;
        }
        if (this.alwaysAvailable) {
            return true;
        }
        this.currentlyAvailable = this.editor.focused && (this._savedTableInfo ? this._savedTableInfo.tbl : this.editor.hasAncestorElement("table"));
        if (this.currentlyAvailable) {
            this.connectTableKeys();
        } else {
            this.disconnectTableKeys();
        }
        this._tempAvailability(500);
        dojo.publish(this.editor.id + "_tablePlugins", [this.currentlyAvailable]);
        return this.currentlyAvailable;
    }, _prepareTable:function (tbl) {
        var tds = this.editor.query("td", tbl);
        console.log("prep:", tds, tbl);
        if (!tds[0].id) {
            tds.forEach(function (td, i) {
                if (!td.id) {
                    td.id = "tdid" + i + this.getTimeStamp();
                }
            }, this);
        }
        return tds;
    }, getTimeStamp:function () {
        return new Date().getTime();
    }, _tempStoreTableData:function (type) {
        if (type === true) {
        } else {
            if (type === false) {
                this.tableData = null;
            } else {
                if (type === undefined) {
                    console.warn("_tempStoreTableData must be passed an argument");
                } else {
                    setTimeout(dojo.hitch(this, function () {
                        this.tableData = null;
                    }), type);
                }
            }
        }
    }, _tempAvailability:function (type) {
        if (type === true) {
            this.availableCurrentlySet = true;
        } else {
            if (type === false) {
                this.availableCurrentlySet = false;
            } else {
                if (type === undefined) {
                    console.warn("_tempAvailability must be passed an argument");
                } else {
                    this.availableCurrentlySet = true;
                    setTimeout(dojo.hitch(this, function () {
                        this.availableCurrentlySet = false;
                    }), type);
                }
            }
        }
    }, connectTableKeys:function () {
        if (this.tablesConnected) {
            return;
        }
        this.tablesConnected = true;
        var node = (this.editor.iframe) ? this.editor.document : this.editor.editNode;
        this.cnKeyDn = dojo.connect(node, "onkeydown", this, "onKeyDown");
        this.cnKeyUp = dojo.connect(node, "onkeyup", this, "onKeyUp");
        this._myListeners.push(dojo.connect(node, "onkeypress", this, "onKeyUp"));
    }, disconnectTableKeys:function () {
        dojo.disconnect(this.cnKeyDn);
        dojo.disconnect(this.cnKeyUp);
        this.tablesConnected = false;
    }, onKeyDown:function (evt) {
        var key = evt.keyCode;
        if (key == 16) {
            this.shiftKeyDown = true;
        }
        if (key == 9) {
            var o = this.getTableInfo();
            o.tdIndex = (this.shiftKeyDown) ? o.tdIndex - 1 : tabTo = o.tdIndex + 1;
            if (o.tdIndex >= 0 && o.tdIndex < o.tds.length) {
                this.editor.selectElement(o.tds[o.tdIndex]);
                this.currentlyAvailable = true;
                this._tempAvailability(true);
                this._tempStoreTableData(true);
                this.stopEvent = true;
            } else {
                this.stopEvent = false;
                this.onDisplayChanged();
            }
            if (this.stopEvent) {
                dojo.stopEvent(evt);
            }
        }
    }, onKeyUp:function (evt) {
        var key = evt.keyCode;
        if (key == 16) {
            this.shiftKeyDown = false;
        }
        if (key == 37 || key == 38 || key == 39 || key == 40) {
            this.onDisplayChanged();
        }
        if (key == 9 && this.stopEvent) {
            dojo.stopEvent(evt);
        }
    }, onDisplayChanged:function () {
        this.currentlyAvailable = false;
        this._tempStoreTableData(false);
        this._tempAvailability(false);
        this.checkAvailable();
    }, uninitialize:function (editor) {
        if (this.editor == editor) {
            this.refCount--;
            if (!this.refCount && this.initialized) {
                if (this.tablesConnected) {
                    this.disconnectTableKeys();
                }
                this.initialized = false;
                dojo.forEach(this._myListeners, function (l) {
                    dojo.disconnect(l);
                });
                delete this._myListeners;
                delete this.editor._tablePluginHandler;
                delete this.editor;
            }
            this.inherited(arguments);
        }
    }});
    var TablePlugins = declare("dojox.editor.plugins.TablePlugins", _Plugin, {iconClassPrefix:"editorIcon", useDefaultCommand:false, buttonClass:dijit.form.Button, commandName:"", label:"", alwaysAvailable:false, undoEnabled:true, onDisplayChanged:function (withinTable) {
        if (!this.alwaysAvailable) {
            this.available = withinTable;
            this.button.set("disabled", !this.available);
        }
    }, setEditor:function (editor) {
        this.editor = editor;
        this.editor.customUndo = true;
        this.inherited(arguments);
        this._availableTopic = dojo.subscribe(this.editor.id + "_tablePlugins", this, "onDisplayChanged");
        this.onEditorLoaded();
    }, onEditorLoaded:function () {
        if (!this.editor._tablePluginHandler) {
            var tablePluginHandler = new TableHandler();
            tablePluginHandler.initialize(this.editor);
        } else {
            this.editor._tablePluginHandler.initialize(this.editor);
        }
    }, selectTable:function () {
        var o = this.getTableInfo();
        if (o && o.tbl) {
            this.editor._sCall("selectElement", [o.tbl]);
        }
    }, _initButton:function () {
        this.command = this.name;
        this.label = this.editor.commands[this.command] = this._makeTitle(this.command);
        this.inherited(arguments);
        delete this.command;
        this.connect(this.button, "onClick", "modTable");
        this.onDisplayChanged(false);
    }, modTable:function (cmd, args) {
        if (dojo.isIE) {
            this.editor.focus();
        }
        this.begEdit();
        var o = this.getTableInfo();
        var sw = (dojo.isString(cmd)) ? cmd : this.name;
        var r, c, i;
        var adjustColWidth = false;
        switch (sw) {
          case "insertTableRowBefore":
            r = o.tbl.insertRow(o.trIndex);
            for (i = 0; i < o.cols; i++) {
                c = r.insertCell(-1);
                c.innerHTML = "&nbsp;";
            }
            break;
          case "insertTableRowAfter":
            r = o.tbl.insertRow(o.trIndex + 1);
            for (i = 0; i < o.cols; i++) {
                c = r.insertCell(-1);
                c.innerHTML = "&nbsp;";
            }
            break;
          case "insertTableColumnBefore":
            o.trs.forEach(function (r) {
                c = r.insertCell(o.colIndex);
                c.innerHTML = "&nbsp;";
            });
            adjustColWidth = true;
            break;
          case "insertTableColumnAfter":
            o.trs.forEach(function (r) {
                c = r.insertCell(o.colIndex + 1);
                c.innerHTML = "&nbsp;";
            });
            adjustColWidth = true;
            break;
          case "deleteTableRow":
            o.tbl.deleteRow(o.trIndex);
            console.log("TableInfo:", this.getTableInfo());
            break;
          case "deleteTableColumn":
            o.trs.forEach(function (tr) {
                tr.deleteCell(o.colIndex);
            });
            adjustColWidth = true;
            break;
          case "modifyTable":
            break;
          case "insertTable":
            break;
        }
        if (adjustColWidth) {
            this.makeColumnsEven();
        }
        this.endEdit();
    }, begEdit:function () {
        if (this.editor._tablePluginHandler.undoEnabled) {
            if (this.editor.customUndo) {
                this.editor.beginEditing();
            } else {
                this.valBeforeUndo = this.editor.getValue();
            }
        }
    }, endEdit:function () {
        if (this.editor._tablePluginHandler.undoEnabled) {
            if (this.editor.customUndo) {
                this.editor.endEditing();
            } else {
                var afterUndo = this.editor.getValue();
                this.editor.setValue(this.valBeforeUndo);
                this.editor.replaceValue(afterUndo);
            }
            this.editor.onDisplayChanged();
        }
    }, makeColumnsEven:function () {
        setTimeout(dojo.hitch(this, function () {
            var o = this.getTableInfo(true);
            var w = Math.floor(100 / o.cols);
            o.tds.forEach(function (d) {
                dojo.attr(d, "width", w + "%");
            });
        }), 10);
    }, getTableInfo:function (forceNewData) {
        return this.editor._tablePluginHandler.getTableInfo(forceNewData);
    }, _makeTitle:function (str) {
        this._strings = dojo.i18n.getLocalization("dojox.editor.plugins", "TableDialog");
        var title = this._strings[str + "Title"] || this._strings[str + "Label"] || str;
        return title;
    }, getSelectedCells:function () {
        var cells = [];
        var tbl = this.getTableInfo().tbl;
        this.editor._tablePluginHandler._prepareTable(tbl);
        var e = this.editor;
        var text = e._sCall("getSelectedHtml", [null]);
        var str = text.match(/id="*\w*"*/g);
        dojo.forEach(str, function (a) {
            var id = a.substring(3, a.length);
            if (id.charAt(0) == "\"" && id.charAt(id.length - 1) == "\"") {
                id = id.substring(1, id.length - 1);
            }
            var node = e.byId(id);
            if (node && node.tagName.toLowerCase() == "td") {
                cells.push(node);
            }
        }, this);
        if (!cells.length) {
            var sel = dijit.range.getSelection(e.window);
            if (sel.rangeCount) {
                var r = sel.getRangeAt(0);
                var node = r.startContainer;
                while (node && node != e.editNode && node != e.document) {
                    if (node.nodeType === 1) {
                        var tg = node.tagName ? node.tagName.toLowerCase() : "";
                        if (tg === "td") {
                            return [node];
                        }
                    }
                    node = node.parentNode;
                }
            }
        }
        return cells;
    }, updateState:function () {
        if (this.button) {
            if ((this.available || this.alwaysAvailable) && !this.get("disabled")) {
                this.button.set("disabled", false);
            } else {
                this.button.set("disabled", true);
            }
        }
    }, destroy:function () {
        this.inherited(arguments);
        dojo.unsubscribe(this._availableTopic);
        this.editor._tablePluginHandler.uninitialize(this.editor);
    }});
    var TableContextMenu = declare(TablePlugins, {constructor:function () {
        this.connect(this, "setEditor", function (editor) {
            editor.onLoadDeferred.addCallback(dojo.hitch(this, function () {
                this._createContextMenu();
            }));
            this.button.domNode.style.display = "none";
        });
    }, destroy:function () {
        if (this.menu) {
            this.menu.destroyRecursive();
            delete this.menu;
        }
        this.inherited(arguments);
    }, _initButton:function () {
        this.inherited(arguments);
        if (this.name === "tableContextMenu") {
            this.button.domNode.display = "none";
        }
    }, _createContextMenu:function () {
        var pMenu = new Menu({targetNodeIds:[this.editor.iframe]});
        var messages = tableDialogStrings;
        pMenu.addChild(new MenuItem({label:messages.selectTableLabel, onClick:dojo.hitch(this, "selectTable")}));
        pMenu.addChild(new MenuSeparator());
        pMenu.addChild(new MenuItem({label:messages.insertTableRowBeforeLabel, onClick:dojo.hitch(this, "modTable", "insertTableRowBefore")}));
        pMenu.addChild(new MenuItem({label:messages.insertTableRowAfterLabel, onClick:dojo.hitch(this, "modTable", "insertTableRowAfter")}));
        pMenu.addChild(new MenuItem({label:messages.insertTableColumnBeforeLabel, onClick:dojo.hitch(this, "modTable", "insertTableColumnBefore")}));
        pMenu.addChild(new MenuItem({label:messages.insertTableColumnAfterLabel, onClick:dojo.hitch(this, "modTable", "insertTableColumnAfter")}));
        pMenu.addChild(new MenuSeparator());
        pMenu.addChild(new MenuItem({label:messages.deleteTableRowLabel, onClick:dojo.hitch(this, "modTable", "deleteTableRow")}));
        pMenu.addChild(new MenuItem({label:messages.deleteTableColumnLabel, onClick:dojo.hitch(this, "modTable", "deleteTableColumn")}));
        this.menu = pMenu;
    }});
    var EditorTableDialog = declare("dojox.editor.plugins.EditorTableDialog", [Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {baseClass:"EditorTableDialog", templateString:insertTableTemplate, postMixInProperties:function () {
        dojo.mixin(this, tableDialogStrings);
        this.inherited(arguments);
    }, postCreate:function () {
        dojo.addClass(this.domNode, this.baseClass);
        this.inherited(arguments);
    }, onInsert:function () {
        console.log("insert");
        var rows = this.selectRow.get("value") || 1, cols = this.selectCol.get("value") || 1, width = this.selectWidth.get("value"), widthType = this.selectWidthType.get("value"), border = this.selectBorder.get("value"), pad = this.selectPad.get("value"), space = this.selectSpace.get("value"), _id = "tbl_" + (new Date().getTime()), t = "<table id=\"" + _id + "\"width=\"" + width + ((widthType == "percent") ? "%" : "") + "\" border=\"" + border + "\" cellspacing=\"" + space + "\" cellpadding=\"" + pad + "\">\n";
        for (var r = 0; r < rows; r++) {
            t += "\t<tr>\n";
            for (var c = 0; c < cols; c++) {
                t += "\t\t<td width=\"" + (Math.floor(100 / cols)) + "%\">&nbsp;</td>\n";
            }
            t += "\t</tr>\n";
        }
        t += "</table><br />";
        var cl = dojo.connect(this, "onHide", function () {
            dojo.disconnect(cl);
            var self = this;
            setTimeout(function () {
                self.destroyRecursive();
            }, 10);
        });
        this.hide();
        this.onBuildTable({htmlText:t, id:_id});
    }, onCancel:function () {
        var c = dojo.connect(this, "onHide", function () {
            dojo.disconnect(c);
            var self = this;
            setTimeout(function () {
                self.destroyRecursive();
            }, 10);
        });
    }, onBuildTable:function (tableText) {
    }});
    var InsertTable = declare("dojox.editor.plugins.InsertTable", TablePlugins, {alwaysAvailable:true, modTable:function () {
        var w = new EditorTableDialog({});
        w.show();
        var c = dojo.connect(w, "onBuildTable", this, function (obj) {
            dojo.disconnect(c);
            this.editor.focus();
            var res = this.editor.execCommand("inserthtml", obj.htmlText);
        });
    }});
    var EditorModifyTableDialog = declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {baseClass:"EditorTableDialog", table:null, tableAtts:{}, templateString:modifyTableTemplate, postMixInProperties:function () {
        dojo.mixin(this, tableDialogStrings);
        this.inherited(arguments);
    }, postCreate:function () {
        dojo.addClass(this.domNode, this.baseClass);
        this.inherited(arguments);
        var w1 = new this.colorPicker({params:this.params});
        this.connect(w1, "onChange", function (color) {
            if (!this._started) {
                return;
            }
            dijit.popup.close(w1);
            this.setBrdColor(color);
        });
        this.connect(w1, "onBlur", function () {
            dijit.popup.close(w1);
        });
        this.connect(this.borderCol, "click", function () {
            w1.set("value", this.brdColor, false);
            dijit.popup.open({popup:w1, around:this.borderCol});
            w1.focus();
        });
        var w2 = new this.colorPicker({params:this.params});
        this.connect(w2, "onChange", function (color) {
            if (!this._started) {
                return;
            }
            dijit.popup.close(w2);
            this.setBkColor(color);
        });
        this.connect(w2, "onBlur", function () {
            dijit.popup.close(w2);
        });
        this.connect(this.backgroundCol, "click", function () {
            w2.set("value", this.bkColor, false);
            dijit.popup.open({popup:w2, around:this.backgroundCol});
            w2.focus();
        });
        this.own(w1, w2);
        this.pickers = [w1, w2];
        this.setBrdColor(domStyle.get(this.table, "borderColor"));
        this.setBkColor(domStyle.get(this.table, "backgroundColor"));
        var w = domAttr.get(this.table, "width");
        if (!w) {
            w = this.table.style.width;
        }
        var p = "pixels";
        if (dojo.isString(w) && w.indexOf("%") > -1) {
            p = "percent";
            w = w.replace(/%/, "");
        }
        if (w) {
            this.selectWidth.set("value", w);
            this.selectWidthType.set("value", p);
        } else {
            this.selectWidth.set("value", "");
            this.selectWidthType.set("value", "percent");
        }
        this.selectBorder.set("value", domAttr.get(this.table, "border"));
        this.selectPad.set("value", domAttr.get(this.table, "cellPadding"));
        this.selectSpace.set("value", domAttr.get(this.table, "cellSpacing"));
        this.selectAlign.set("value", domAttr.get(this.table, "align"));
    }, startup:function () {
        array.forEach(this.pickers, function (picker) {
            picker.startup();
        });
        this.inherited(arguments);
    }, setBrdColor:function (color) {
        this.brdColor = color;
        domStyle.set(this.borderCol, "backgroundColor", color);
    }, setBkColor:function (color) {
        this.bkColor = color;
        domStyle.set(this.backgroundCol, "backgroundColor", color);
    }, onSet:function () {
        domStyle.set(this.table, "borderColor", this.brdColor);
        domStyle.set(this.table, "backgroundColor", this.bkColor);
        if (this.selectWidth.get("value")) {
            domStyle.set(this.table, "width", "");
            domAttr.set(this.table, "width", (this.selectWidth.get("value") + ((this.selectWidthType.get("value") == "pixels") ? "" : "%")));
        }
        domAttr.set(this.table, "border", this.selectBorder.get("value"));
        domAttr.set(this.table, "cellPadding", this.selectPad.get("value"));
        domAttr.set(this.table, "cellSpacing", this.selectSpace.get("value"));
        domAttr.set(this.table, "align", this.selectAlign.get("value"));
        var c = dojo.connect(this, "onHide", function () {
            dojo.disconnect(c);
            var self = this;
            setTimeout(function () {
                self.destroyRecursive();
            }, 10);
        });
        this.hide();
    }, onCancel:function () {
        var c = dojo.connect(this, "onHide", function () {
            dojo.disconnect(c);
            var self = this;
            setTimeout(function () {
                self.destroyRecursive();
            }, 10);
        });
    }, onSetTable:function (tableText) {
    }});
    var ModifyTable = declare("dojox.editor.plugins.ModifyTable", TablePlugins, {colorPicker:ColorPalette, modTable:function () {
        if (!this.editor._tablePluginHandler.checkAvailable()) {
            return;
        }
        var o = this.getTableInfo();
        var w = new EditorModifyTableDialog({table:o.tbl, colorPicker:typeof this.colorPicker === "string" ? require(this.colorPicker) : this.colorPicker, params:this.params});
        w.show();
        this.connect(w, "onSetTable", function (color) {
            var o = this.getTableInfo();
            domStyle.set(o.td, "backgroundColor", color);
        });
    }});
    var CellColorDropDown = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {colorPicker:ColorPicker, templateString:"<div style='display: none; position: absolute; top: -10000; z-index: -10000'>" + "<div dojoType='dijit.TooltipDialog' dojoAttachPoint='dialog' class='dojoxEditorColorPicker'>" + "<div dojoAttachPoint='_colorPicker'></div>" + "<div style='margin: 0.5em 0em 0em 0em'>" + "<button dojoType='dijit.form.Button' type='submit' dojoAttachPoint='_setButton'>${buttonSet}</button>" + "&nbsp;" + "<button dojoType='dijit.form.Button' type='button' dojoAttachPoint='_cancelButton'>${buttonCancel}</button>" + "</div>" + "</div>" + "</div>", widgetsInTemplate:true, constructor:function () {
        dojo.mixin(this, tableDialogStrings);
    }, postCreate:function () {
        var ColorPicker = typeof this.colorPicker == "string" ? require(this.colorPicker) : this.colorPicker;
        this._colorPicker = new ColorPicker({params:this.params}, this._colorPicker);
    }, startup:function () {
        if (!this._started) {
            this.inherited(arguments);
            this.connect(this.dialog, "execute", function () {
                this.onChange(this.get("value"));
            });
            this.connect(this._cancelButton, "onClick", function () {
                dijit.popup.close(this.dialog);
            });
            this.connect(this.dialog, "onCancel", "onCancel");
            dojo.style(this.domNode, "display", "block");
        }
    }, _setValueAttr:function (value, priorityChange) {
        this._colorPicker.set("value", value, priorityChange);
    }, _getValueAttr:function () {
        return this._colorPicker.get("value");
    }, onChange:function (value) {
    }, onCancel:function () {
    }});
    var ColorTableCell = declare("dojox.editor.plugins.ColorTableCell", TablePlugins, {colorPicker:ColorPicker, constructor:function () {
        this.closable = true;
        this.buttonClass = dijit.form.DropDownButton;
        var self = this, picker, pickerInit = {colorPicker:this.colorPicker, params:this.params};
        if (!this.dropDown) {
            picker = new CellColorDropDown(pickerInit);
            picker.startup();
            this.dropDown = picker.dialog;
        } else {
            picker = this.dropDown;
            picker.set(pickerInit);
        }
        this.connect(picker, "onChange", function (color) {
            this.editor.focus();
            this.modTable(null, color);
        });
        this.connect(picker, "onCancel", function () {
            this.editor.focus();
        });
        aspect.before(this.dropDown, "onOpen", function () {
            var o = self.getTableInfo(), tds = self.getSelectedCells(o.tbl);
            if (tds && tds.length > 0) {
                var t = tds[0] === self.lastObject ? tds[0] : tds[tds.length - 1], color;
                while (t && t !== self.editor.document && ((color = dojo.style(t, "backgroundColor")) === "transparent" || color.indexOf("rgba") === 0)) {
                    t = t.parentNode;
                }
                if (color !== "transparent" && color.indexOf("rgba") !== 0) {
                    picker.set("value", Color.fromString(color).toHex());
                }
            }
        });
        this.connect(this, "setEditor", function (editor) {
            editor.onLoadDeferred.addCallback(dojo.hitch(this, function () {
                this.connect(this.editor.editNode, "onmouseup", function (evt) {
                    this.lastObject = evt.target;
                });
            }));
        });
    }, _initButton:function () {
        this.command = this.name;
        this.label = this.editor.commands[this.command] = this._makeTitle(this.command);
        this.inherited(arguments);
        delete this.command;
        this.onDisplayChanged(false);
    }, modTable:function (cmd, args) {
        this.begEdit();
        var o = this.getTableInfo();
        var tds = this.getSelectedCells(o.tbl);
        dojo.forEach(tds, function (td) {
            dojo.style(td, "backgroundColor", args);
        });
        this.endEdit();
    }});
    function registerGeneric(args) {
        return new TablePlugins(args);
    }
    _Plugin.registry["insertTableRowBefore"] = registerGeneric;
    _Plugin.registry["insertTableRowAfter"] = registerGeneric;
    _Plugin.registry["insertTableColumnBefore"] = registerGeneric;
    _Plugin.registry["insertTableColumnAfter"] = registerGeneric;
    _Plugin.registry["deleteTableRow"] = registerGeneric;
    _Plugin.registry["deleteTableColumn"] = registerGeneric;
    _Plugin.registry["colorTableCell"] = function (args) {
        return new ColorTableCell(args);
    };
    _Plugin.registry["modifyTable"] = function (args) {
        return new ModifyTable(args);
    };
    _Plugin.registry["insertTable"] = function (args) {
        return new InsertTable(args);
    };
    _Plugin.registry["tableContextMenu"] = function (args) {
        return new TableContextMenu(args);
    };
    return TablePlugins;
});

