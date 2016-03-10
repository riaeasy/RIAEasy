//>>built

define("dojox/editor/plugins/AutoSave", ["dojo", "dijit", "dojox", "dijit/_base/manager", "dijit/_base/popup", "dijit/_Widget", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/Dialog", "dijit/MenuItem", "dijit/Menu", "dijit/form/Button", "dijit/form/ComboButton", "dijit/form/ComboBox", "dijit/form/_TextBoxMixin", "dijit/form/TextBox", "dijit/TooltipDialog", "dijit/_editor/_Plugin", "dojo/_base/connect", "dojo/_base/declare", "dojo/date/locale", "dojo/i18n", "dojo/string", "dojox/editor/plugins/Save", "dojo/i18n!dojox/editor/plugins/nls/AutoSave"], function (dojo, dijit, dojox, manager, popup, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Dialog, MenuItem, Menu, Button, ComboButton, ComboBox, _TextBoxMixin, TextBox, TooltipDialog, _Plugin, connect, declare, locale, i18n, string, Save) {
    dojo.experimental("dojox.editor.plugins.AutoSave");
    var AutoSaveSettingDialog = dojo.declare("dojox.editor.plugins._AutoSaveSettingDialog", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {dialogTitle:"", dialogDescription:"", paramName:"", paramLabel:"", btnOk:"", btnCancel:"", widgetsInTemplate:true, templateString:"<span id='${dialogId}' class='dijit dijitReset dijitInline' tabindex='-1'>" + "<div dojoType='dijit.Dialog' title='${dialogTitle}' dojoAttachPoint='dialog' " + "class='dijitEditorAutoSaveSettingDialog'>" + "<div tabindex='-1'>${dialogDescription}</div>" + "<div tabindex='-1' class='dijitEditorAutoSaveSettingInputArea'>${paramName}</div>" + "<div class='dijitEditorAutoSaveSettingInputArea' tabindex='-1'>" + "<input class='textBox' dojoType='dijit.form.TextBox' id='${textBoxId}' required='false' intermediateChanges='true' " + "selectOnClick='true' required='true' dojoAttachPoint='intBox' " + "dojoAttachEvent='onKeyDown: _onKeyDown, onChange: _onChange'/>" + "<label class='dijitLeft dijitInline boxLabel' " + "for='${textBoxId}' tabindex='-1'>${paramLabel}</label>" + "</div>" + "<div class='dijitEditorAutoSaveSettingButtonArea' tabindex='-1'>" + "<button dojoType='dijit.form.Button' dojoAttachEvent='onClick: onOk'>${btnOk}</button>" + "<button dojoType='dijit.form.Button' dojoAttachEvent='onClick: onCancel'>${btnCancel}</button>" + "</div>" + "</div>" + "</span>", postMixInProperties:function () {
        this.id = dijit.getUniqueId(this.declaredClass.replace(/\./g, "_"));
        this.dialogId = this.id + "_dialog";
        this.textBoxId = this.id + "_textBox";
    }, show:function () {
        if (this._value == "") {
            this._value = 0;
            this.intBox.set("value", 0);
        } else {
            this.intBox.set("value", this._value);
        }
        this.dialog.show();
        dijit.selectInputText(this.intBox.focusNode);
    }, hide:function () {
        this.dialog.hide();
    }, onOk:function () {
        this.dialog.hide();
    }, onCancel:function () {
        this.dialog.hide();
    }, _onKeyDown:function (evt) {
        if (evt.keyCode == dojo.keys.ENTER) {
            this.onOk();
        }
    }, _onChange:function (val) {
        if (this._isValidValue(val)) {
            this._value = val;
        } else {
            this.intBox.set("value", this._value);
        }
    }, _setValueAttr:function (val) {
        if (this._isValidValue(val)) {
            this._value = val;
        }
    }, _getValueAttr:function () {
        return this._value;
    }, _isValidValue:function (val) {
        var regExp = /^\d{0,3}$/, _v = String(val);
        return Boolean(_v.match ? _v.match(regExp) : "");
    }});
    var AutoSave = dojo.declare("dojox.editor.plugins.AutoSave", Save, {url:"", logResults:true, interval:0, _iconClassPrefix:"dijitEditorIconAutoSave", _MIN:60000, _setIntervalAttr:function (val) {
        this.interval = val;
    }, _getIntervalAttr:function () {
        return this._interval;
    }, setEditor:function (editor) {
        this.editor = editor;
        this._strings = dojo.i18n.getLocalization("dojox.editor.plugins", "AutoSave");
        this._initButton();
        this._saveSettingDialog = new AutoSaveSettingDialog({"dialogTitle":this._strings["saveSettingdialogTitle"], "dialogDescription":this._strings["saveSettingdialogDescription"], "paramName":this._strings["saveSettingdialogParamName"], "paramLabel":this._strings["saveSettingdialogParamLabel"], "btnOk":this._strings["saveSettingdialogButtonOk"], "btnCancel":this._strings["saveSettingdialogButtonCancel"]});
        this.connect(this._saveSettingDialog, "onOk", "_onDialogOk");
        var pd = (this._promDialog = new dijit.TooltipDialog());
        pd.startup();
        pd.set("content", "");
    }, _initButton:function () {
        var menu = new dijit.Menu({style:"display: none"}), menuItemSave = new dijit.MenuItem({iconClass:this._iconClassPrefix + "Default " + this._iconClassPrefix, label:this._strings["saveLabel"]}), menuItemAutoSave = (this._menuItemAutoSave = new dijit.MenuItem({iconClass:this._iconClassPrefix + "Setting " + this._iconClassPrefix, label:this._strings["saveSettingLabelOn"]}));
        menu.addChild(menuItemSave);
        menu.addChild(menuItemAutoSave);
        this.button = new dijit.form.ComboButton({label:this._strings["saveLabel"], iconClass:this._iconClassPrefix + "Default " + this._iconClassPrefix, showLabel:false, dropDown:menu});
        this.connect(this.button, "onClick", "_save");
        this.connect(menuItemSave, "onClick", "_save");
        this._menuItemAutoSaveClickHandler = dojo.connect(menuItemAutoSave, "onClick", this, "_showAutSaveSettingDialog");
    }, _showAutSaveSettingDialog:function () {
        var dialog = this._saveSettingDialog;
        dialog.set("value", this.interval);
        dialog.show();
    }, _onDialogOk:function () {
        var interval = (this.interval = this._saveSettingDialog.get("value") * this._MIN);
        if (interval > 0) {
            this._setSaveInterval(interval);
            dojo.disconnect(this._menuItemAutoSaveClickHandler);
            this._menuItemAutoSave.set("label", this._strings["saveSettingLabelOff"]);
            this._menuItemAutoSaveClickHandler = dojo.connect(this._menuItemAutoSave, "onClick", this, "_onStopClick");
            this.button.set("iconClass", this._iconClassPrefix + "Setting " + this._iconClassPrefix);
        }
    }, _onStopClick:function () {
        this._clearSaveInterval();
        dojo.disconnect(this._menuItemAutoSaveClickHandler);
        this._menuItemAutoSave.set("label", this._strings["saveSettingLabelOn"]);
        this._menuItemAutoSaveClickHandler = dojo.connect(this._menuItemAutoSave, "onClick", this, "_showAutSaveSettingDialog");
        this.button.set("iconClass", this._iconClassPrefix + "Default " + this._iconClassPrefix);
    }, _setSaveInterval:function (interval) {
        if (interval <= 0) {
            return;
        }
        this._clearSaveInterval();
        this._intervalHandler = setInterval(dojo.hitch(this, function () {
            if (!this._isWorking && !this.get("disabled")) {
                this._isWorking = true;
                this._save();
            }
        }), interval);
    }, _clearSaveInterval:function () {
        if (this._intervalHandler) {
            clearInterval(this._intervalHandler);
            this._intervalHandler = null;
        }
    }, onSuccess:function (resp, ioargs) {
        this.button.set("disabled", false);
        this._promDialog.set("content", dojo.string.substitute(this._strings["saveMessageSuccess"], {"0":dojo.date.locale.format(new Date(), {selector:"time"})}));
        dijit.popup.open({popup:this._promDialog, around:this.button.domNode});
        this._promDialogTimeout = setTimeout(dojo.hitch(this, function () {
            clearTimeout(this._promDialogTimeout);
            this._promDialogTimeout = null;
            dijit.popup.close(this._promDialog);
        }), 3000);
        this._isWorking = false;
        if (this.logResults) {
            console.log(resp);
        }
    }, onError:function (error, ioargs) {
        this.button.set("disabled", false);
        this._promDialog.set("content", dojo.string.substitute(this._strings["saveMessageFail"], {"0":dojo.date.locale.format(new Date(), {selector:"time"})}));
        dijit.popup.open({popup:this._promDialog, around:this.button.domNode});
        this._promDialogTimeout = setTimeout(dojo.hitch(this, function () {
            clearTimeout(this._promDialogTimeout);
            this._promDialogTimeout = null;
            dijit.popup.close(this._promDialog);
        }), 3000);
        this._isWorking = false;
        if (this.logResults) {
            console.log(error);
        }
    }, destroy:function () {
        this.inherited(arguments);
        this._menuItemAutoSave = null;
        if (this._promDialogTimeout) {
            clearTimeout(this._promDialogTimeout);
            this._promDialogTimeout = null;
            dijit.popup.close(this._promDialog);
        }
        this._clearSaveInterval();
        if (this._saveSettingDialog) {
            this._saveSettingDialog.destroyRecursive();
            this._destroyRecursive = null;
        }
        if (this._menuItemAutoSaveClickHandler) {
            dojo.disconnect(this._menuItemAutoSaveClickHandler);
            this._menuItemAutoSaveClickHandler = null;
        }
    }});
    AutoSave._AutoSaveSettingDialog = AutoSaveSettingDialog;
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        var name = o.args.name.toLowerCase();
        if (name == "autosave") {
            o.plugin = new AutoSave({url:("url" in o.args) ? o.args.url : "", logResults:("logResults" in o.args) ? o.args.logResults : true, interval:("interval" in o.args) ? o.args.interval : 5});
        }
    });
    return AutoSave;
});

