define([
	"riasw/riaswBase",
	"../_Plugin",
	"./LinkDialog",
	"riasw/sys/Dialog",
	"riasw/form/DropDownButton",
	"riasw/form/Button",
	"riasw/form/TextBox",
	"riasw/form/ValidationTextBox",
	"riasw/form/Uploader",
	"dojo/i18n!./nls/LocalImage"
], function(rias, _Plugin, LinkDialog, Dialog, DropDownButton, Button, TextBox, ValidationTextBox, Uploader, messages) {

	var pluginsName = "riasw.editor.htmleditor.plugins";

	var LocalImage = rias.declare(pluginsName + ".LocalImage", LinkDialog.ImgLinkDialog, {
		// summary:
		//		This plugin provides an enhanced image link dialog that
		//		not only insert the online images, but upload the local image files onto
		//		to server then insert them as well.
		//
		//		Dependencies:
		//		This plugin depends on riasw.form.Uploader to upload the images on the local driver.
		//		Do the regression test whenever Uploader is upgraded.

		// uploadable: [public] Boolean
		//		Indicate whether the user can upload a local image file onto the server.
		//		If it is set to true, the Browse button will be available.
		uploadable: false,

		// uploadUrl: [public] String
		//		The url targeted for uploading. Both absolute and relative URLs are OK.
		uploadUrl: "",

		// baseImageUrl: [public] String
		//		The prefix of the image url on the server.
		//		For example, an image is uploaded and stored at
		//		`http://www.myhost.com/images/uploads/test.jpg`.
		//		When the image is uploaded, the server returns "uploads/test.jpg" as the
		//		relative path. So the baseImageUrl should be set to "http://www.myhost.com/images/"
		//		so that the client can retrieve the image from the server.
		//		If the image file is located on the same domain as that of the current web page,
		//		baseImageUrl can be a relative path. For example:
		// |	baseImageUrl = images/
		//		and the server returns uploads/test.jpg
		//		The complete URL of the image file is images/upload/test.jpg
		baseImageUrl: "",

		// fileMask: [public] String
		//		Specify the types of images that are allowed to be uploaded.
		//		Note that the type checking on server is also very important!
		fileMask: "*.jpg;*.jpeg;*.gif;*.png;*.bmp",

		// urlRegExp: [protected] String
		//		Used to validate if the input is a valid image URL.
		urlRegExp: "",

		// htmlFieldName: [private] htmlFieldName
		htmlFieldName:"uploadedfile",

		// _isLocalFile: [private] Boolean
		//		Indicate if a local file is to be uploaded to the server
		//		If false, the text of _urlInput field is regarded as the
		//		URL of the online image
		_isLocalFile: false,

		// _messages: [private] Array<String>
		//		Contains i18n strings.
		_messages: "",

		// _cssPrefix: [private] String
		//		The prefix of the CSS style
		_cssPrefix: "riaswEditorEilDialog",

		// _closable: [private] Boolean
		//		Indicate if the tooltip dialog can be closed. Used to workaround Safari 5 bug
		//		where the file dialog doesn't pop up in modal until after the first click.
		_closable: true,

		// linkDialogTemplate: [protected] String
		//		Over-ride for template since this is an enhanced image dialog.
		linkDialogTemplate: [
			"<div style='border-bottom: 1px solid black; padding-bottom: 2pt; margin-bottom: 4pt;'></div>", // <hr/> breaks the dialog in IE6
			"<div class='riaswEditorEilDialogDescription'>${prePopuTextUrl}${prePopuTextBrowse}</div>",
			"<table role='presentation'>",
				"<tr>",
					"<td colspan='2'>",
						"<label for='${id}_urlInput' title='${prePopuTextUrl}${prePopuTextBrowse}'>${url}</label>",
					"</td>",
				"</tr><tr>",
					"<td class='riaswEditorEilDialogField'>",
						"<input dojoType='riasw.form.ValidationTextBox' class='riaswEditorEilDialogField' " +
							"constraints='${urlRegExp}' title='${prePopuTextUrl}${prePopuTextBrowse}'  selectOnClick='true' required='true' " +
							"id='${id}_urlInput' name='urlInput' intermediateChanges='true' invalidMessage='${invalidMessage}' " +
							"prePopuText='&lt;${prePopuTextUrl}${prePopuTextBrowse}&gt'>",
					"</td><td>",
						"<div id='${id}_browse' style='display:${uploadable}'>${browse}</div>",
					"</td>",
				"</tr><tr>",
					"<td colspan='2'>",
						"<label for='${id}_textInput'>${text}</label>",
					"</td>",
				"</tr><tr>",
					"<td>",
						"<input dojoType='riasw.form.TextBox' required='false' id='${id}_textInput' " +
							"name='textInput' intermediateChanges='true' selectOnClick='true' class='riaswEditorEilDialogField'>",
					"</td><td>",
					"</td>",
				"</tr><tr>",
					"<td>",
					"</td><td>",
					"</td>",
				"</tr><tr>",
					"<td colspan='2'>",
						"<button dojoType='riasw.form.Button' id='${id}_setButton'>${set}</button>",
					"</td>",
				"</tr>",
			"</table>"
		].join(""),

		_initButton: function(){
			// summary:
			//		Override _Plugin._initButton() to initialize DropDownButton and Dialog.
			// tags:
			//		protected
			var self = this;
			this._messages = messages;
			this.tag = "img";
			var dropDown = (this.dropDown = new Dialog({
				title: messages[this.command + "Title"],
				onShow: function(){
					self._initialUploader();
					self._onOpenDialog();
					//Dialog.prototype.onOpen.apply(this, arguments);
					setTimeout(function(){
						// Auto-select the text if it is not empty
						rias.dom.selectInputText(self._urlInput.textbox);
						self._urlInput.isLoadComplete = true;
					}, 0);
				}
			}));

			var label = this.getLabel(this.command),
				className = this.iconClassPrefix + " " + this.iconClassPrefix + this.command.charAt(0).toUpperCase() + this.command.substr(1),
				props = rias.mixin({
					ownerRiasw: this,
					disabled: this.get("disabled"),
					readOnly: this.get("readOnly"),
					label: label,
					showLabel: false,
					tooltip: label,
					iconClass: className,
					dropDown: this.dropDown,
					tabIndex: "-1"
				}, this.params || {});

			if(!rias.has('ie')){
				// Workaround for Non-IE problem:
				// Safari 5: After the select-file dialog opens, the first time the user clicks anywhere (even on that dialog)
				// it's treated like a plain click on the page, and the tooltip dialog closes
				// FF & Chrome: the select-file dialog does not block the execution of JS
				props.closeDropDown = function(/*Boolean*/ focus){
					if(self._closable){
						if(this.isOpened()){
							rias.popupManager.hide(this.dropDown);
							if(focus){ this.focus(); }
							this._opened = false;
							this.state = "";
						}
					}
					setTimeout(function(){
						self._closable = true;
					}, 10);
				};
			}

			this.button = new DropDownButton(props);

			// Generate the RegExp of the ValidationTextBox from fileMask
			// *.jpg;*.png => /.*\.jpg|.*\.JPG|.*\.png|.*\.PNG/
			var masks = this.fileMask.split(";"),
				temp = "";
			rias.forEach(masks, function(m){
				m = m.replace(/\./, "\\.").replace(/\*/g, ".*");
				temp += "|" + m + "|" + m.toUpperCase();
			});
			messages.urlRegExp = this.urlRegExp = temp.substring(1);

			if(!this.uploadable){
				messages.prePopuTextBrowse = ".";
			}

			messages.id = rias.rt.getUniqueId(this.editor.id);
			messages.uploadable = this.uploadable ? "inline" : "none";
			this._uniqueId = messages.id;
			//this._setContent("<div class='" + this._cssPrefix + "Title'>" + dropDown.title + "</div>" +
			//	rias.substitute(this.linkDialogTemplate, messages));
			dropDown.startup();

			var urlInput = (this._urlInput = rias.by(this._uniqueId + "_urlInput"));
			this._textInput = rias.by(this._uniqueId + "_textInput");
			this._setButton = rias.by(this._uniqueId + "_setButton");

			if(urlInput){
				var pt = ValidationTextBox.prototype;
				urlInput = rias.mixin(urlInput, {
					// Indicate if the widget is ready to validate the input text
					isLoadComplete: false,
					isValid: function(isFocused){
						if(this.isLoadComplete){
							return pt.isValid.apply(this, arguments);
						}else{
							return this.get("value").length > 0;
						}
					},
					reset: function(){
						this.isLoadComplete = false;
						pt.reset.apply(this, arguments);
					}
				});

				this.after(urlInput, "onKeyDown", "_cancelFileUpload", true);
				this.after(urlInput, "onChange", "_checkAndFixInput", true);
			}
			if(this._setButton){
				this.after(this._setButton, "onClick", "_checkAndSetValue", true);
			}
			this._connectTagEvents();
		},

		_initialUploader: function(){
			// summary:
			//		Initialize the Uploader and connect up its events
			// tags:
			//		private
			var fup = null,
				self = this,
				widgetId = self._uniqueId,
				fUpId = widgetId + "_browse",
				urlInput = self._urlInput;

			if(self.uploadable && !self._uploader){
				fup = self._uploader = new Uploader({
					ownerRiasw: self,
					force: "html", // Noticed that SWF may cause browsers to crash sometimes
					uploadUrl: self.uploadUrl,
					htmlFieldName: self.htmlFieldName,
					uploadOnChange: false,
					selectMultipleFiles: false,
					showProgress: true
				}, fUpId);

				// Dialog will call reset on all the widgets contained within it.
				// Have Uploader be responsive to this call.
				fup.reset = function(){
					self._isLocalFile = false;
					fup._resetHTML();
				};
				self.after(fup, "onClick", function(){
					urlInput.validate(false);
					if(!rias.has('ie')){
						// Firefox, Chrome and Safari have a strange behavior:
						// When the File Upload dialog is open, the browse div (Uploader) will lose its focus
						// and triggers onBlur event. This event will cause the whole tooltip dialog
						// to be closed when the File Upload dialog is open. The popup dialog should hang up
						// the js execution rather than triggering an event. IE does not have such a problem.
						self._closable = false;
					}
				});
				self.after(fup, "onChange", function(data){
					self._isLocalFile = true;
					urlInput.set("value", data[0].name); //Single selection
					urlInput.focus();
				});
				self.after(fup, "onComplete", function(data){
					var urlPrefix = self.baseImageUrl;
					urlPrefix = urlPrefix && urlPrefix.charAt(urlPrefix.length - 1) === "/" ? urlPrefix : urlPrefix + "/";
					urlInput.set("value", urlPrefix + data[0].file); //Single selection
					self._isLocalFile = false;
					self._setDialogStatus(true);
					self.setValue(self.dropDown.get("value"));
				});
				self.after(fup, "onError", function(evtObject){
					// summary:
					//		Fires on errors
					console.log("Error occurred when uploading image file!");
					self._setDialogStatus(true);
				});
			}
		},

		_checkAndFixInput: function(){
			// summary:
			//		Over-ride the original method
			this._setButton.set("disabled", !this._isValid());
		},

		_isValid: function(){
			// summary:
			//		Invalid cases: URL is not ended with the suffix listed
			return this._urlInput.isValid();
		},

		_cancelFileUpload: function(){
			this._uploader.reset();
			this._isLocalFile = false;
		},

		_checkAndSetValue: function(){
			// summary:
			//		Determine if a local file is to be uploaded.
			//		If a local file is to be uploaded, do not close the dialog
			//		until the file uploading is finished. Else, insert the image directly into the editor.
			// tags:
			//		private
			if(this._uploader && this._isLocalFile){
				this._setDialogStatus(false);
				this._uploader.upload();
			}else{
				this.setValue(this.dropDown.get("value"));
			}
		},

		_setDialogStatus: function(/*Boolean*/ value){
			this._urlInput.set("disabled", !value);
			this._textInput.set("disabled", !value);
			this._setButton.set("disabled", !value);
		},

		_onDestroy: function(){
			// summary:
			//		Cleanup of the plugin.
			if(this._uploader){
				this._uploader.destroy();
				delete this._uploader;
			}
			this.inherited(arguments);
		}
	});

	var plugin = function(args){
		return new LocalImage(rias.mixin({
			command: "insertImage"
		}, args));
	};

// Register the plugin and some name varients.
	_Plugin.registry.localImage = _Plugin.registry.localimage = plugin;

	return LocalImage;

});
