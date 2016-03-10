//>>built

define("dojox/editor/plugins/Breadcrumb", ["dojo", "dijit", "dojox", "dijit/_Widget", "dijit/_TemplatedMixin", "dijit/_Contained", "dijit/Toolbar", "dijit/Menu", "dijit/MenuItem", "dijit/MenuSeparator", "dijit/_editor/_Plugin", "dijit/form/Button", "dijit/form/ComboButton", "dojo/_base/connect", "dojo/_base/declare", "dojo/i18n", "dojo/string", "dojo/i18n!dojox/editor/plugins/nls/Breadcrumb"], function (dojo, dijit, dojox, _Widget, _TemplatedMixin, _Contained, Toolbar, Menu, MenuItem, MenuSeparator, _Plugin) {
    dojo.experimental("dojox.editor.plugins.Breadcrumb");
    var BreadcrumbMenuTitle = dojo.declare("dojox.editor.plugins._BreadcrumbMenuTitle", [_Widget, _TemplatedMixin, _Contained], {templateString:"<tr><td dojoAttachPoint=\"title\" colspan=\"4\" class=\"dijitToolbar\" style=\"font-weight: bold; padding: 3px;\"></td></tr>", menuTitle:"", postCreate:function () {
        dojo.setSelectable(this.domNode, false);
        var label = this.id + "_text";
        this.domNode.setAttribute("aria-labelledby", label);
    }, _setMenuTitleAttr:function (str) {
        this.title.innerHTML = str;
    }, _getMenuTitleAttr:function (str) {
        return this.title.innerHTML;
    }});
    var Breadcrumb = dojo.declare("dojox.editor.plugins.Breadcrumb", _Plugin, {_menu:null, breadcrumbBar:null, setEditor:function (editor) {
        this.editor = editor;
        this._buttons = [];
        this.breadcrumbBar = new dijit.Toolbar();
        var strings = dojo.i18n.getLocalization("dojox.editor.plugins", "Breadcrumb");
        this._titleTemplate = strings.nodeActions;
        dojo.place(this.breadcrumbBar.domNode, editor.footer);
        this.editor.onLoadDeferred.addCallback(dojo.hitch(this, function () {
            this._menu = new dijit.Menu({});
            dojo.addClass(this.breadcrumbBar.domNode, "dojoxEditorBreadcrumbArrow");
            var self = this;
            var body = new dijit.form.ComboButton({showLabel:true, label:"body", _selNode:editor.editNode, dropDown:this._menu, onClick:dojo.hitch(this, function () {
                this._menuTarget = editor.editNode;
                this._selectContents();
            })});
            this._menuTitle = new BreadcrumbMenuTitle({menuTitle:strings.nodeActions});
            this._selCMenu = new dijit.MenuItem({label:strings.selectContents, onClick:dojo.hitch(this, this._selectContents)});
            this._delCMenu = new dijit.MenuItem({label:strings.deleteContents, onClick:dojo.hitch(this, this._deleteContents)});
            this._selEMenu = new dijit.MenuItem({label:strings.selectElement, onClick:dojo.hitch(this, this._selectElement)});
            this._delEMenu = new dijit.MenuItem({label:strings.deleteElement, onClick:dojo.hitch(this, this._deleteElement)});
            this._moveSMenu = new dijit.MenuItem({label:strings.moveStart, onClick:dojo.hitch(this, this._moveCToStart)});
            this._moveEMenu = new dijit.MenuItem({label:strings.moveEnd, onClick:dojo.hitch(this, this._moveCToEnd)});
            this._menu.addChild(this._menuTitle);
            this._menu.addChild(this._selCMenu);
            this._menu.addChild(this._delCMenu);
            this._menu.addChild(new dijit.MenuSeparator({}));
            this._menu.addChild(this._selEMenu);
            this._menu.addChild(this._delEMenu);
            this._menu.addChild(new dijit.MenuSeparator({}));
            this._menu.addChild(this._moveSMenu);
            this._menu.addChild(this._moveEMenu);
            body._ddConnect = dojo.connect(body, "openDropDown", dojo.hitch(this, function () {
                this._menuTarget = body._selNode;
                this._menuTitle.set("menuTitle", dojo.string.substitute(this._titleTemplate, {"nodeName":"&lt;body&gt;"}));
                this._selEMenu.set("disabled", true);
                this._delEMenu.set("disabled", true);
                this._selCMenu.set("disabled", false);
                this._delCMenu.set("disabled", false);
                this._moveSMenu.set("disabled", false);
                this._moveEMenu.set("disabled", false);
            }));
            this.breadcrumbBar.addChild(body);
            this.connect(this.editor, "onNormalizedDisplayChanged", "updateState");
        }));
        this.breadcrumbBar.startup();
        if (dojo.isIE) {
            setTimeout(dojo.hitch(this, function () {
                this.breadcrumbBar.domNode.className = this.breadcrumbBar.domNode.className;
            }), 100);
        }
    }, _selectContents:function () {
        this.editor.focus();
        if (this._menuTarget) {
            var nodeName = this._menuTarget.tagName.toLowerCase();
            switch (nodeName) {
              case "br":
              case "hr":
              case "img":
              case "input":
              case "base":
              case "meta":
              case "area":
              case "basefont":
                break;
              default:
                try {
                    this.editor._sCall("collapse", [null]);
                    this.editor._sCall("selectElementChildren", [this._menuTarget]);
                    this.editor.onDisplayChanged();
                }
                catch (e) {
                }
            }
        }
    }, _deleteContents:function () {
        if (this._menuTarget) {
            this.editor.beginEditing();
            this._selectContents();
            this.editor._sCall("remove", [this._menuTarget]);
            this.editor.endEditing();
            this._updateBreadcrumb();
            this.editor.onDisplayChanged();
        }
    }, _selectElement:function () {
        this.editor.focus();
        if (this._menuTarget) {
            this.editor._sCall("collapse", [null]);
            this.editor._sCall("selectElement", [this._menuTarget]);
            this.editor.onDisplayChanged();
        }
    }, _deleteElement:function () {
        if (this._menuTarget) {
            this.editor.beginEditing();
            this._selectElement();
            this.editor._sCall("remove", [this._menuTarget]);
            this.editor.endEditing();
            this._updateBreadcrumb();
            this.editor.onDisplayChanged();
        }
    }, _moveCToStart:function () {
        this.editor.focus();
        if (this._menuTarget) {
            this._selectContents();
            this.editor._sCall("collapse", [true]);
        }
    }, _moveCToEnd:function () {
        this.editor.focus();
        if (this._menuTarget) {
            this._selectContents();
            this.editor._sCall("collapse", [false]);
        }
    }, _updateBreadcrumb:function () {
        var ed = this.editor;
        if (ed.window) {
            var sel = dijit.range.getSelection(ed.window);
            if (sel && sel.rangeCount > 0) {
                var range = sel.getRangeAt(0);
                var node = ed._sCall("getSelectedElement", []) || range.startContainer;
                var bcList = [];
                if (node && node.ownerDocument === ed.document) {
                    while (node && node !== ed.editNode && node != ed.document.body && node != ed.document) {
                        if (node.nodeType === 1) {
                            bcList.push({type:node.tagName.toLowerCase(), node:node});
                        }
                        node = node.parentNode;
                    }
                    bcList = bcList.reverse();
                    while (this._buttons.length) {
                        var db = this._buttons.pop();
                        dojo.disconnect(db._ddConnect);
                        this.breadcrumbBar.removeChild(db);
                    }
                    this._buttons = [];
                    var i;
                    var self = this;
                    for (i = 0; i < bcList.length; i++) {
                        var bc = bcList[i];
                        var b = new dijit.form.ComboButton({showLabel:true, label:bc.type, _selNode:bc.node, dropDown:this._menu, onClick:function () {
                            self._menuTarget = this._selNode;
                            self._selectContents();
                        }});
                        b._ddConnect = dojo.connect(b, "openDropDown", dojo.hitch(b, function () {
                            self._menuTarget = this._selNode;
                            var nodeName = self._menuTarget.tagName.toLowerCase();
                            var title = dojo.string.substitute(self._titleTemplate, {"nodeName":"&lt;" + nodeName + "&gt;"});
                            self._menuTitle.set("menuTitle", title);
                            switch (nodeName) {
                              case "br":
                              case "hr":
                              case "img":
                              case "input":
                              case "base":
                              case "meta":
                              case "area":
                              case "basefont":
                                self._selCMenu.set("disabled", true);
                                self._delCMenu.set("disabled", true);
                                self._moveSMenu.set("disabled", true);
                                self._moveEMenu.set("disabled", true);
                                self._selEMenu.set("disabled", false);
                                self._delEMenu.set("disabled", false);
                                break;
                              default:
                                self._selCMenu.set("disabled", false);
                                self._delCMenu.set("disabled", false);
                                self._selEMenu.set("disabled", false);
                                self._delEMenu.set("disabled", false);
                                self._moveSMenu.set("disabled", false);
                                self._moveEMenu.set("disabled", false);
                            }
                        }));
                        this._buttons.push(b);
                        this.breadcrumbBar.addChild(b);
                    }
                    if (dojo.isIE) {
                        this.breadcrumbBar.domNode.className = this.breadcrumbBar.domNode.className;
                    }
                }
            }
        }
    }, updateState:function () {
        if (dojo.style(this.editor.iframe, "display") === "none" || this.get("disabled")) {
            dojo.style(this.breadcrumbBar.domNode, "display", "none");
        } else {
            if (dojo.style(this.breadcrumbBar.domNode, "display") === "none") {
                dojo.style(this.breadcrumbBar.domNode, "display", "block");
            }
            this._updateBreadcrumb();
            var size = dojo.marginBox(this.editor.domNode);
            this.editor.resize({h:size.h});
        }
    }, destroy:function () {
        if (this.breadcrumbBar) {
            this.breadcrumbBar.destroyRecursive();
            this.breadcrumbBar = null;
        }
        if (this._menu) {
            this._menu.destroyRecursive();
            delete this._menu;
        }
        this._buttons = null;
        delete this.editor.breadcrumbBar;
        this.inherited(arguments);
    }});
    Breadcrumb._BreadcrumbMenuTitle = BreadcrumbMenuTitle;
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        var name = o.args.name.toLowerCase();
        if (name === "breadcrumb") {
            o.plugin = new Breadcrumb({});
        }
    });
    return Breadcrumb;
});

