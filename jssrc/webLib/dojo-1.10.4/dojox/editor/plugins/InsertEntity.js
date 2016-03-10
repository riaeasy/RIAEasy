//>>built

define("dojox/editor/plugins/InsertEntity", ["dojo", "dijit", "dojox", "dijit/_editor/_Plugin", "dijit/TooltipDialog", "dijit/form/DropDownButton", "dojo/_base/connect", "dojo/_base/declare", "dojo/i18n", "dojox/html/entities", "dojox/editor/plugins/EntityPalette", "dojo/i18n!dojox/editor/plugins/nls/InsertEntity"], function (dojo, dijit, dojox, _Plugin) {
    var InsertEntity = dojo.declare("dojox.editor.plugins.InsertEntity", _Plugin, {iconClassPrefix:"dijitAdditionalEditorIcon", _initButton:function () {
        this.dropDown = new dojox.editor.plugins.EntityPalette({showCode:this.showCode, showEntityName:this.showEntityName});
        this.connect(this.dropDown, "onChange", function (entity) {
            this.button.closeDropDown();
            this.editor.focus();
            this.editor.execCommand("inserthtml", entity);
        });
        var strings = dojo.i18n.getLocalization("dojox.editor.plugins", "InsertEntity");
        this.button = new dijit.form.DropDownButton({label:strings["insertEntity"], showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "InsertEntity", tabIndex:"-1", dropDown:this.dropDown});
    }, updateState:function () {
        this.button.set("disabled", this.get("disabled"));
    }, setEditor:function (editor) {
        this.editor = editor;
        this._initButton();
        this.editor.addKeyHandler("s", true, true, dojo.hitch(this, function () {
            this.button.openDropDown();
            this.dropDown.focus();
        }));
        editor.contentPreFilters.push(this._preFilterEntities);
        editor.contentPostFilters.push(this._postFilterEntities);
    }, _preFilterEntities:function (s) {
        return dojox.html.entities.decode(s, dojox.html.entities.latin);
    }, _postFilterEntities:function (s) {
        return dojox.html.entities.encode(s, dojox.html.entities.latin);
    }});
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        var name = o.args.name ? o.args.name.toLowerCase() : "";
        if (name === "insertentity") {
            o.plugin = new InsertEntity({showCode:("showCode" in o.args) ? o.args.showCode : false, showEntityName:("showEntityName" in o.args) ? o.args.showEntityName : false});
        }
    });
    return InsertEntity;
});

