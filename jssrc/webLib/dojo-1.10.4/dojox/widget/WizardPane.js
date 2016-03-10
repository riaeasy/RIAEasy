//>>built

define("dojox/widget/WizardPane", ["dojo/_base/lang", "dojo/_base/declare", "dijit/layout/ContentPane"], function (lang, declare, ContentPane) {
    return declare("dojox.widget.WizardPane", ContentPane, {canGoBack:true, passFunction:null, doneFunction:null, startup:function () {
        this.inherited(arguments);
        if (this.isFirstChild) {
            this.canGoBack = false;
        }
        if (lang.isString(this.passFunction)) {
            this.passFunction = lang.getObject(this.passFunction);
        }
        if (lang.isString(this.doneFunction) && this.doneFunction) {
            this.doneFunction = lang.getObject(this.doneFunction);
        }
    }, _onShow:function () {
        if (this.isFirstChild) {
            this.canGoBack = false;
        }
        this.inherited(arguments);
    }, _checkPass:function () {
        var r = true;
        if (this.passFunction && lang.isFunction(this.passFunction)) {
            var failMessage = this.passFunction();
            switch (typeof failMessage) {
              case "boolean":
                r = failMessage;
                break;
              case "string":
                alert(failMessage);
                r = false;
                break;
            }
        }
        return r;
    }, done:function () {
        if (this.doneFunction && lang.isFunction(this.doneFunction)) {
            this.doneFunction();
        }
    }});
});

