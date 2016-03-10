//>>built

define("dojox/editor/plugins/LocalImage", ["dojo", "dijit", "dijit/registry", "dijit/_base/popup", "dijit/_editor/_Plugin", "dijit/_editor/plugins/LinkDialog", "dijit/TooltipDialog", "dijit/form/_TextBoxMixin", "dijit/form/Button", "dijit/form/ValidationTextBox", "dijit/form/DropDownButton", "dojo/_base/connect", "dojo/_base/declare", "dojo/_base/sniff", "dojox/form/FileUploader", "dojo/i18n!dojox/editor/plugins/nls/LocalImage"], function (dojo, dijit, registry, popup, _Plugin, LinkDialog, TooltipDialog, _TextBoxMixin, Button, ValidationTextBox, DropDownButton, connect, declare, has, FileUploader, messages) {
    var LocalImage = dojo.declare("dojox.editor.plugins.LocalImage", LinkDialog.ImgLinkDialog, {uploadable:false, uploadUrl:"", baseImageUrl:"", fileMask:"*.jpg;*.jpeg;*.gif;*.png;*.bmp", urlRegExp:"", htmlFieldName:"uploadedfile", _isLocalFile:false, _messages:"", _cssPrefix:"dijitEditorEilDialog", _closable:true, linkDialogTemplate:["<div style='border-bottom: 1px solid black; padding-bottom: 2pt; margin-bottom: 4pt;'></div>", "<div class='dijitEditorEilDialogDescription'>${prePopuTextUrl}${prePopuTextBrowse}</div>", "<table role='presentation'><tr><td colspan='2'>", "<label for='${id}_urlInput' title='${prePopuTextUrl}${prePopuTextBrowse}'>${url}</label>", "</td></tr><tr><td class='dijitEditorEilDialogField'>", "<input dojoType='dijit.form.ValidationTextBox' class='dijitEditorEilDialogField'" + "regExp='${urlRegExp}' title='${prePopuTextUrl}${prePopuTextBrowse}'  selectOnClick='true' required='true' " + "id='${id}_urlInput' name='urlInput' intermediateChanges='true' invalidMessage='${invalidMessage}' " + "prePopuText='&lt;${prePopuTextUrl}${prePopuTextBrowse}&gt'>", "</td><td>", "<div id='${id}_browse' style='display:${uploadable}'>${browse}</div>", "</td></tr><tr><td colspan='2'>", "<label for='${id}_textInput'>${text}</label>", "</td></tr><tr><td>", "<input dojoType='dijit.form.TextBox' required='false' id='${id}_textInput' " + "name='textInput' intermediateChanges='true' selectOnClick='true' class='dijitEditorEilDialogField'>", "</td><td></td></tr><tr><td>", "</td><td>", "</td></tr><tr><td colspan='2'>", "<button dojoType='dijit.form.Button' id='${id}_setButton'>${set}</button>", "</td></tr></table>"].join(""), _initButton:function () {
        var _this = this;
        this._messages = messages;
        this.tag = "img";
        var dropDown = (this.dropDown = new TooltipDialog({title:messages[this.command + "Title"], onOpen:function () {
            _this._initialFileUploader();
            _this._onOpenDialog();
            TooltipDialog.prototype.onOpen.apply(this, arguments);
            setTimeout(function () {
                _TextBoxMixin.selectInputText(_this._urlInput.textbox);
                _this._urlInput.isLoadComplete = true;
            }, 0);
        }, onClose:function () {
            dojo.disconnect(_this.blurHandler);
            _this.blurHandler = null;
            this.onHide();
        }, onCancel:function () {
            setTimeout(dojo.hitch(_this, "_onCloseDialog"), 0);
        }}));
        var label = this.getLabel(this.command), className = this.iconClassPrefix + " " + this.iconClassPrefix + this.command.charAt(0).toUpperCase() + this.command.substr(1), props = dojo.mixin({label:label, showLabel:false, iconClass:className, dropDown:this.dropDown, tabIndex:"-1"}, this.params || {});
        if (!has("ie")) {
            props.closeDropDown = function (focus) {
                if (_this._closable) {
                    if (this._opened) {
                        popup.close(this.dropDown);
                        if (focus) {
                            this.focus();
                        }
                        this._opened = false;
                        this.state = "";
                    }
                }
                setTimeout(function () {
                    _this._closable = true;
                }, 10);
            };
        }
        this.button = new DropDownButton(props);
        var masks = this.fileMask.split(";"), temp = "";
        dojo.forEach(masks, function (m) {
            m = m.replace(/\./, "\\.").replace(/\*/g, ".*");
            temp += "|" + m + "|" + m.toUpperCase();
        });
        messages.urlRegExp = this.urlRegExp = temp.substring(1);
        if (!this.uploadable) {
            messages.prePopuTextBrowse = ".";
        }
        messages.id = registry.getUniqueId(this.editor.id);
        messages.uploadable = this.uploadable ? "inline" : "none";
        this._uniqueId = messages.id;
        this._setContent("<div class='" + this._cssPrefix + "Title'>" + dropDown.title + "</div>" + dojo.string.substitute(this.linkDialogTemplate, messages));
        dropDown.startup();
        var urlInput = (this._urlInput = registry.byId(this._uniqueId + "_urlInput"));
        this._textInput = registry.byId(this._uniqueId + "_textInput");
        this._setButton = registry.byId(this._uniqueId + "_setButton");
        if (urlInput) {
            var pt = ValidationTextBox.prototype;
            urlInput = dojo.mixin(urlInput, {isLoadComplete:false, isValid:function (isFocused) {
                if (this.isLoadComplete) {
                    return pt.isValid.apply(this, arguments);
                } else {
                    return this.get("value").length > 0;
                }
            }, reset:function () {
                this.isLoadComplete = false;
                pt.reset.apply(this, arguments);
            }});
            this.connect(urlInput, "onKeyDown", "_cancelFileUpload");
            this.connect(urlInput, "onChange", "_checkAndFixInput");
        }
        if (this._setButton) {
            this.connect(this._setButton, "onClick", "_checkAndSetValue");
        }
        this._connectTagEvents();
    }, _initialFileUploader:function () {
        var fup = null, _this = this, widgetId = _this._uniqueId, fUpId = widgetId + "_browse", urlInput = _this._urlInput;
        if (_this.uploadable && !_this._fileUploader) {
            fup = _this._fileUploader = new FileUploader({force:"html", uploadUrl:_this.uploadUrl, htmlFieldName:_this.htmlFieldName, uploadOnChange:false, selectMultipleFiles:false, showProgress:true}, fUpId);
            fup.reset = function () {
                _this._isLocalFile = false;
                fup._resetHTML();
            };
            _this.connect(fup, "onClick", function () {
                urlInput.validate(false);
                if (!has("ie")) {
                    _this._closable = false;
                }
            });
            _this.connect(fup, "onChange", function (data) {
                _this._isLocalFile = true;
                urlInput.set("value", data[0].name);
                urlInput.focus();
            });
            _this.connect(fup, "onComplete", function (data) {
                var urlPrefix = _this.baseImageUrl;
                urlPrefix = urlPrefix && urlPrefix.charAt(urlPrefix.length - 1) == "/" ? urlPrefix : urlPrefix + "/";
                urlInput.set("value", urlPrefix + data[0].file);
                _this._isLocalFile = false;
                _this._setDialogStatus(true);
                _this.setValue(_this.dropDown.get("value"));
            });
            _this.connect(fup, "onError", function (evtObject) {
                console.log("Error occurred when uploading image file!");
                _this._setDialogStatus(true);
            });
        }
    }, _checkAndFixInput:function () {
        this._setButton.set("disabled", !this._isValid());
    }, _isValid:function () {
        return this._urlInput.isValid();
    }, _cancelFileUpload:function () {
        this._fileUploader.reset();
        this._isLocalFile = false;
    }, _checkAndSetValue:function () {
        if (this._fileUploader && this._isLocalFile) {
            this._setDialogStatus(false);
            this._fileUploader.upload();
        } else {
            this.setValue(this.dropDown.get("value"));
        }
    }, _setDialogStatus:function (value) {
        this._urlInput.set("disabled", !value);
        this._textInput.set("disabled", !value);
        this._setButton.set("disabled", !value);
    }, destroy:function () {
        this.inherited(arguments);
        if (this._fileUploader) {
            this._fileUploader.destroy();
            delete this._fileUploader;
        }
    }});
    var plugin = function (args) {
        return new LocalImage({command:"insertImage", uploadable:("uploadable" in args) ? args.uploadable : false, uploadUrl:("uploadable" in args && "uploadUrl" in args) ? args.uploadUrl : "", htmlFieldName:("uploadable" in args && "htmlFieldName" in args) ? args.htmlFieldName : "uploadedfile", baseImageUrl:("uploadable" in args && "baseImageUrl" in args) ? args.baseImageUrl : "", fileMask:("fileMask" in args) ? args.fileMask : "*.jpg;*.jpeg;*.gif;*.png;*.bmp"});
    };
    _Plugin.registry["LocalImage"] = plugin;
    _Plugin.registry["localImage"] = plugin;
    _Plugin.registry["localimage"] = plugin;
    return LocalImage;
});

