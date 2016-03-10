//>>built

require({cache:{"url:dijit/templates/actionBar.html":"<div class='dijitDialogPaneActionBar' data-dojo-attach-point=\"actionBarNode\">\n\t<button data-dojo-type='dijit/form/Button' type='submit' data-dojo-attach-point=\"okButton\"></button>\n\t<button data-dojo-type='dijit/form/Button' type='button'\n\t\t\tdata-dojo-attach-point=\"cancelButton\" data-dojo-attach-event='click:onCancel'></button>\n</div>\n"}});
define("dijit/_ConfirmDialogMixin", ["dojo/_base/declare", "./_WidgetsInTemplateMixin", "dojo/i18n!./nls/common", "dojo/text!./templates/actionBar.html", "./form/Button"], function (declare, _WidgetsInTemplateMixin, strings, actionBarMarkup) {
    return declare("dijit/_ConfirmDialogMixin", _WidgetsInTemplateMixin, {actionBarTemplate:actionBarMarkup, buttonOk:strings.buttonOk, _setButtonOkAttr:{node:"okButton", attribute:"label"}, buttonCancel:strings.buttonCancel, _setButtonCancelAttr:{node:"cancelButton", attribute:"label"}});
});

