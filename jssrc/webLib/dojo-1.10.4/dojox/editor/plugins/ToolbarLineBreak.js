//>>built

define("dojox/editor/plugins/ToolbarLineBreak", ["dojo", "dijit", "dojox", "dijit/_Widget", "dijit/_TemplatedMixin", "dijit/_editor/_Plugin", "dojo/_base/declare"], function (dojo, dijit, dojox, _Widget, _TemplatedMixin, _Plugin, declare) {
    var ToolbarLineBreak = declare("dojox.editor.plugins.ToolbarLineBreak", [_Widget, _TemplatedMixin], {templateString:"<span class='dijit dijitReset'><br></span>", postCreate:function () {
        dojo.setSelectable(this.domNode, false);
    }, isFocusable:function () {
        return false;
    }});
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        var name = o.args.name.toLowerCase();
        if (name === "||" || name === "toolbarlinebreak") {
            o.plugin = new _Plugin({button:new ToolbarLineBreak(), setEditor:function (editor) {
                this.editor = editor;
            }});
        }
    });
    return ToolbarLineBreak;
});

