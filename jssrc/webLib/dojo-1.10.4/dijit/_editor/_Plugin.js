//>>built

define("dijit/_editor/_Plugin", ["dojo/_base/connect", "dojo/_base/declare", "dojo/_base/lang", "../Destroyable", "../form/Button"], function (connect, declare, lang, Destroyable, Button) {
    var _Plugin = declare("dijit._editor._Plugin", Destroyable, {constructor:function (args) {
        this.params = args || {};
        lang.mixin(this, this.params);
        this._attrPairNames = {};
    }, editor:null, iconClassPrefix:"dijitEditorIcon", button:null, command:"", useDefaultCommand:true, buttonClass:Button, disabled:false, getLabel:function (key) {
        return this.editor.commands[key];
    }, _initButton:function () {
        if (this.command.length) {
            var label = this.getLabel(this.command), editor = this.editor, className = this.iconClassPrefix + " " + this.iconClassPrefix + this.command.charAt(0).toUpperCase() + this.command.substr(1);
            if (!this.button) {
                var props = lang.mixin({label:label, ownerDocument:editor.ownerDocument, dir:editor.dir, lang:editor.lang, showLabel:false, iconClass:className, dropDown:this.dropDown, tabIndex:"-1"}, this.params || {});
                delete props.name;
                this.button = new this.buttonClass(props);
            }
        }
        if (this.get("disabled") && this.button) {
            this.button.set("disabled", this.get("disabled"));
        }
    }, destroy:function () {
        if (this.dropDown) {
            this.dropDown.destroyRecursive();
        }
        this.inherited(arguments);
    }, connect:function (o, f, tf) {
        this.own(connect.connect(o, f, this, tf));
    }, updateState:function () {
        var e = this.editor, c = this.command, checked, enabled;
        if (!e || !e.isLoaded || !c.length) {
            return;
        }
        var disabled = this.get("disabled");
        if (this.button) {
            try {
                enabled = !disabled && e.queryCommandEnabled(c);
                if (this.enabled !== enabled) {
                    this.enabled = enabled;
                    this.button.set("disabled", !enabled);
                }
                if (enabled) {
                    if (typeof this.button.checked == "boolean") {
                        checked = e.queryCommandState(c);
                        if (this.checked !== checked) {
                            this.checked = checked;
                            this.button.set("checked", e.queryCommandState(c));
                        }
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        }
    }, setEditor:function (editor) {
        this.editor = editor;
        this._initButton();
        if (this.button && this.useDefaultCommand) {
            if (this.editor.queryCommandAvailable(this.command)) {
                this.own(this.button.on("click", lang.hitch(this.editor, "execCommand", this.command, this.commandArg)));
            } else {
                this.button.domNode.style.display = "none";
            }
        }
        this.own(this.editor.on("NormalizedDisplayChanged", lang.hitch(this, "updateState")));
    }, setToolbar:function (toolbar) {
        if (this.button) {
            toolbar.addChild(this.button);
        }
    }, set:function (name, value) {
        if (typeof name === "object") {
            for (var x in name) {
                this.set(x, name[x]);
            }
            return this;
        }
        var names = this._getAttrNames(name);
        if (this[names.s]) {
            var result = this[names.s].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            this._set(name, value);
        }
        return result || this;
    }, get:function (name) {
        var names = this._getAttrNames(name);
        return this[names.g] ? this[names.g]() : this[name];
    }, _setDisabledAttr:function (disabled) {
        this._set("disabled", disabled);
        this.updateState();
    }, _getAttrNames:function (name) {
        var apn = this._attrPairNames;
        if (apn[name]) {
            return apn[name];
        }
        var uc = name.charAt(0).toUpperCase() + name.substr(1);
        return (apn[name] = {s:"_set" + uc + "Attr", g:"_get" + uc + "Attr"});
    }, _set:function (name, value) {
        this[name] = value;
    }});
    _Plugin.registry = {};
    return _Plugin;
});

