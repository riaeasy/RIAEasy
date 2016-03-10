//>>built

define("dojox/form/BusyButton", ["dojo/_base/lang", "dojo/dom-attr", "dojo/dom-class", "dijit/form/Button", "dijit/form/DropDownButton", "dijit/form/ComboButton", "dojo/i18n", "dojo/i18n!dijit/nls/loading", "dojo/_base/declare"], function (lang, domAttr, domClass, Button, DropDownButton, ComboButton, i18n, nlsLoading, declare) {
    var _BusyButtonMixin = declare("dojox.form._BusyButtonMixin", null, {isBusy:false, busyLabel:"", timeout:null, useIcon:true, postMixInProperties:function () {
        this.inherited(arguments);
        if (!this.busyLabel) {
            this.busyLabel = i18n.getLocalization("dijit", "loading", this.lang).loadingState;
        }
    }, postCreate:function () {
        this.inherited(arguments);
        this._label = this.containerNode.innerHTML;
        this._initTimeout = this.timeout;
        if (this.isBusy) {
            this.makeBusy();
        }
    }, makeBusy:function () {
        this.isBusy = true;
        if (this._disableHandle) {
            this._disableHandle.remove();
        }
        this._disableHandle = this.defer(function () {
            this.set("disabled", true);
        });
        this.setLabel(this.busyLabel, this.timeout);
    }, cancel:function () {
        if (this._disableHandle) {
            this._disableHandle.remove();
        }
        this.set("disabled", false);
        this.isBusy = false;
        this.setLabel(this._label);
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
        this.timeout = this._initTimeout;
    }, resetTimeout:function (timeout) {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
        if (timeout) {
            this._timeout = setTimeout(lang.hitch(this, function () {
                this.cancel();
            }), timeout);
        } else {
            if (timeout == undefined || timeout === 0) {
                this.cancel();
            }
        }
    }, setLabel:function (content, timeout) {
        this.label = content;
        while (this.containerNode.firstChild) {
            this.containerNode.removeChild(this.containerNode.firstChild);
        }
        this.containerNode.appendChild(document.createTextNode(this.label));
        if (this.showLabel == false && !domAttr.get(this.domNode, "title")) {
            this.titleNode.title = lang.trim(this.containerNode.innerText || this.containerNode.textContent || "");
        }
        if (timeout) {
            this.resetTimeout(timeout);
        } else {
            this.timeout = null;
        }
        if (this.useIcon && this.isBusy) {
            var node = new Image();
            node.src = this._blankGif;
            domAttr.set(node, "id", this.id + "_icon");
            domClass.add(node, "dojoxBusyButtonIcon");
            this.containerNode.appendChild(node);
        }
    }, _onClick:function (e) {
        if (!this.isBusy) {
            this.inherited(arguments);
            this.makeBusy();
        }
    }});
    var BusyButton = declare("dojox.form.BusyButton", [Button, _BusyButtonMixin], {});
    declare("dojox.form.BusyComboButton", [ComboButton, _BusyButtonMixin], {});
    declare("dojox.form.BusyDropDownButton", [DropDownButton, _BusyButtonMixin], {});
    return BusyButton;
});

