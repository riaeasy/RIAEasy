//>>built

define("dojox/editor/plugins/Save", ["dojo", "dijit", "dojox", "dijit/_editor/_Plugin", "dijit/form/Button", "dojo/_base/connect", "dojo/_base/declare", "dojo/i18n", "dojo/i18n!dojox/editor/plugins/nls/Save"], function (dojo, dijit, dojox, _Plugin) {
    var Save = dojo.declare("dojox.editor.plugins.Save", _Plugin, {iconClassPrefix:"dijitAdditionalEditorIcon", url:"", logResults:true, _initButton:function () {
        var strings = dojo.i18n.getLocalization("dojox.editor.plugins", "Save");
        this.button = new dijit.form.Button({label:strings["save"], showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "Save", tabIndex:"-1", onClick:dojo.hitch(this, "_save")});
    }, updateState:function () {
        this.button.set("disabled", this.get("disabled"));
    }, setEditor:function (editor) {
        this.editor = editor;
        this._initButton();
    }, _save:function () {
        var content = this.editor.get("value");
        this.save(content);
    }, save:function (content) {
        var headers = {"Content-Type":"text/html"};
        if (this.url) {
            var postArgs = {url:this.url, postData:content, headers:headers, handleAs:"text"};
            this.button.set("disabled", true);
            var deferred = dojo.xhrPost(postArgs);
            deferred.addCallback(dojo.hitch(this, this.onSuccess));
            deferred.addErrback(dojo.hitch(this, this.onError));
        } else {
            console.log("No URL provided, no post-back of content: " + content);
        }
    }, onSuccess:function (resp, ioargs) {
        this.button.set("disabled", false);
        if (this.logResults) {
            console.log(resp);
        }
    }, onError:function (error, ioargs) {
        this.button.set("disabled", false);
        if (this.logResults) {
            console.log(error);
        }
    }});
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        var name = o.args.name.toLowerCase();
        if (name === "save") {
            o.plugin = new Save({url:("url" in o.args) ? o.args.url : "", logResults:("logResults" in o.args) ? o.args.logResults : true});
        }
    });
    return Save;
});

