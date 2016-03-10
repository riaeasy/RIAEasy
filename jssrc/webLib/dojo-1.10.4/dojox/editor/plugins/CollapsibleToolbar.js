//>>built

define("dojox/editor/plugins/CollapsibleToolbar", ["dojo", "dijit", "dojox", "dijit/_Widget", "dijit/_TemplatedMixin", "dijit/_editor/_Plugin", "dijit/form/Button", "dijit/focus", "dojo/_base/connect", "dojo/_base/declare", "dojo/i18n", "dojo/i18n!dojox/editor/plugins/nls/CollapsibleToolbar"], function (dojo, dijit, dojox, _Widget, _TemplatedMixin, _Plugin) {
    var CollapsibleToolbarButton = dojo.declare("dojox.editor.plugins._CollapsibleToolbarButton", [_Widget, _TemplatedMixin], {templateString:"<div tabindex='0' role='button' title='${title}' class='${buttonClass}' " + "dojoAttachEvent='ondijitclick: onClick'><span class='${textClass}'>${text}</span></div>", title:"", buttonClass:"", text:"", textClass:"", onClick:function (e) {
    }});
    var CollapsibleToolbar = dojo.declare("dojox.editor.plugins.CollapsibleToolbar", _Plugin, {_myWidgets:null, setEditor:function (editor) {
        this.editor = editor;
        this._constructContainer();
    }, _constructContainer:function () {
        var strings = dojo.i18n.getLocalization("dojox.editor.plugins", "CollapsibleToolbar");
        this._myWidgets = [];
        var container = dojo.create("table", {style:{width:"100%"}, tabindex:-1, "class":"dojoxCollapsibleToolbarContainer"});
        var tbody = dojo.create("tbody", {tabindex:-1}, container);
        var row = dojo.create("tr", {tabindex:-1}, tbody);
        var openTd = dojo.create("td", {"class":"dojoxCollapsibleToolbarControl", tabindex:-1}, row);
        var closeTd = dojo.create("td", {"class":"dojoxCollapsibleToolbarControl", tabindex:-1}, row);
        var menuTd = dojo.create("td", {style:{width:"100%"}, tabindex:-1}, row);
        var m = dojo.create("span", {style:{width:"100%"}, tabindex:-1}, menuTd);
        var collapseButton = new CollapsibleToolbarButton({buttonClass:"dojoxCollapsibleToolbarCollapse", title:strings.collapse, text:"-", textClass:"dojoxCollapsibleToolbarCollapseText"});
        dojo.place(collapseButton.domNode, openTd);
        var expandButton = new CollapsibleToolbarButton({buttonClass:"dojoxCollapsibleToolbarExpand", title:strings.expand, text:"+", textClass:"dojoxCollapsibleToolbarExpandText"});
        dojo.place(expandButton.domNode, closeTd);
        this._myWidgets.push(collapseButton);
        this._myWidgets.push(expandButton);
        dojo.style(closeTd, "display", "none");
        dojo.place(container, this.editor.toolbar.domNode, "after");
        dojo.place(this.editor.toolbar.domNode, m);
        this.openTd = openTd;
        this.closeTd = closeTd;
        this.menu = m;
        this.connect(collapseButton, "onClick", "_onClose");
        this.connect(expandButton, "onClick", "_onOpen");
    }, _onClose:function (e) {
        if (e) {
            dojo.stopEvent(e);
        }
        var size = dojo.marginBox(this.editor.domNode);
        dojo.style(this.openTd, "display", "none");
        dojo.style(this.closeTd, "display", "");
        dojo.style(this.menu, "display", "none");
        this.editor.resize({h:size.h});
        if (dojo.isIE) {
            this.editor.header.className = this.editor.header.className;
            this.editor.footer.className = this.editor.footer.className;
        }
        dijit.focus(this.closeTd.firstChild);
    }, _onOpen:function (e) {
        if (e) {
            dojo.stopEvent(e);
        }
        var size = dojo.marginBox(this.editor.domNode);
        dojo.style(this.closeTd, "display", "none");
        dojo.style(this.openTd, "display", "");
        dojo.style(this.menu, "display", "");
        this.editor.resize({h:size.h});
        if (dojo.isIE) {
            this.editor.header.className = this.editor.header.className;
            this.editor.footer.className = this.editor.footer.className;
        }
        dijit.focus(this.openTd.firstChild);
    }, destroy:function () {
        this.inherited(arguments);
        if (this._myWidgets) {
            while (this._myWidgets.length) {
                this._myWidgets.pop().destroy();
            }
            delete this._myWidgets;
        }
    }});
    CollapsibleToolbar._CollapsibleToolbarButton = CollapsibleToolbarButton;
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        var name = o.args.name.toLowerCase();
        if (name === "collapsibletoolbar") {
            o.plugin = new CollapsibleToolbar({});
        }
    });
    return CollapsibleToolbar;
});

