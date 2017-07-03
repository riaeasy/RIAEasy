define([
	"riasw/riaswBase",
	"../_Plugin",
	"../range",
	"riasw/form/DropDownButton",
	"riasw/form/Select",
	"riasw/form/ValidationTextBox",
	"riasw/sys/Dialog",
	"dojo/i18n!./nls/LinkDialog"
], function(rias, _Plugin, rangeapi, DropDownButton, Select, ValidationTextBox, Dialog){

	// module:
	//		riasw/_editor/plugins/LinkDialog
	var pluginsName = "riasw.editor.htmleditor.plugins";

	var LinkDialog = rias.declare(pluginsName + ".LinkDialog", _Plugin, {
		// summary:
		//		This plugin provides the basis for an 'anchor' (link) dialog and an extension of it
		//		provides the image link dialog.
		// description:
		//		The command provided by this plugin is:
		//
		//		- createLink

		// Override _Plugin.buttonClass.   This plugin is controlled by a DropDownButton
		// (which triggers a TooltipDialog).
		buttonClass: DropDownButton,

		// Override _Plugin.useDefaultCommand... processing is handled by this plugin, not by Editor.
		useDefaultCommand: false,

		// urlRegExp: [protected] String
		//		Used for validating input as correct URL.  While file:// urls are not terribly
		//		useful, they are technically valid.
		urlRegExp: "((https?|ftps?|file)\\://|\./|\.\./|/|)(/[a-zA-Z]{1,1}:/|)(((?:(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)\\.)*(?:[a-zA-Z](?:[-\\da-zA-Z]{0,80}[\\da-zA-Z])?)\\.?)|(((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])|(0[xX]0*[\\da-fA-F]?[\\da-fA-F]\\.){3}0[xX]0*[\\da-fA-F]?[\\da-fA-F]|(0+[0-3][0-7][0-7]\\.){3}0+[0-3][0-7][0-7]|(0|[1-9]\\d{0,8}|[1-3]\\d{9}|4[01]\\d{8}|42[0-8]\\d{7}|429[0-3]\\d{6}|4294[0-8]\\d{5}|42949[0-5]\\d{4}|429496[0-6]\\d{3}|4294967[01]\\d{2}|42949672[0-8]\\d|429496729[0-5])|0[xX]0*[\\da-fA-F]{1,8}|([\\da-fA-F]{1,4}\\:){7}[\\da-fA-F]{1,4}|([\\da-fA-F]{1,4}\\:){6}((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])))(\\:\\d+)?(/(?:[^?#\\s/]+/)*(?:[^?#\\s/]{0,}(?:\\?[^?#\\s/]*)?(?:#.*)?)?)?",

		// emailRegExp: [protected] String
		//		Used for validating input as correct email address.  Taken from dojox.validate
		emailRegExp: "<?(mailto\\:)([!#-'*+\\-\\/-9=?A-Z^-~]+[.])*[!#-'*+\\-\\/-9=?A-Z^-~]+" /*username*/ + "@" +
			"((?:(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)\\.)+(?:[a-zA-Z](?:[-\\da-zA-Z]{0,6}[\\da-zA-Z])?)\\.?)|localhost|^[^-][a-zA-Z0-9_-]*>?", // host.

		// htmlTemplate: [protected] String
		//		String used for templating the HTML to insert at the desired point.
		htmlTemplate: "<a href=\"${urlInput}\" _djrealurl=\"${urlInput}\"" +
			" target=\"${targetSelect}\"" +
			">${textInput}</a>",

		// tag: [protected] String
		//		Tag used for the link type.
		tag: "a",

		// _hostRxp [private] RegExp
		//		Regular expression used to validate url fragments (ip address, hostname, etc)
		_hostRxp: /^((([^\[:]+):)?([^@]+)@)?(\[([^\]]+)\]|([^\[:]*))(:([0-9]+))?$/,

		// _userAtRxp [private] RegExp
		//		Regular expression used to validate e-mail address fragment.
		_userAtRxp: /^([!#-'*+\-\/-9=?A-Z^-~]+[.])*[!#-'*+\-\/-9=?A-Z^-~]+@/i,

		_initButton: function(){
			var self = this;
			var messages = rias.delegate(
				rias.i18n.getLocalization(pluginsName, "LinkDialog", this.lang)
			);
			//this.inherited(arguments);
			// Setup to lazy create TooltipDialog first time the button is clicked
			this.tag = this.command === 'insertImage' ? 'img' : 'a';
			this._urlRegExp = new RegExp("^" + this.urlRegExp + "$", "i");
			this._emailRegExp = new RegExp("^" + this.emailRegExp + "$", "i");
			this.button = new this.buttonClass({
				ownerRiasw: this,
				disabled: this.get("disabled"),
				readOnly: this.get("readOnly"),
				label: messages[this.command + "Title"],
				showLabel: false,
				tooltip: messages[this.command + "Title"],
				iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + this.command.charAt(0).toUpperCase() + this.command.substr(1),
				tabIndex: "-1",
				dropDown: {
					ownerRiasw: self,
					"dialogType": "modal,tip",
					//dir: this.editor.dir,
					actionBar: [
						"btnSubmit",
						"btnAbort"
					],
					caption: messages[this.command + "Title"],
					//content: rias.substitute(this._template, messages),
					style: {
						height: "18em",
						width: "30em"
					},
					moduleMeta: {
						region: "center",
						afterLoadedAll: function(loadOk){
							if(loadOk){
								self._onOpenDropDown(this);
							}
						},
						onSubmit: function(){
							self.setValue(this.get("value"));
						},
						onHide: function(){
							setTimeout(function(){
								self.editor.focus();
							}, 10);
						},
						_riaswElements: [{
							_riaswType: "riasw.layout.TablePanel",
							"_riaswIdInModule": "_table",
							name: "edts",
							region: "center",
							cols: 1,
							"childParams": {
								"labelWidth": "4em",
								"showLabel": true
							},
							cellStyle: {
								padding: "2px"
							},
							style: {
								padding: "1em 2em"
							},
							_riaswElements: [{
								_riaswType: "riasw.form.ValidationTextBox",
								_riaswIdInModule: "urlInput",
								name: "urlInput",
								label: messages.url,
								intermediateChanges: true,
								rc: {
									col: 1,
									row: 1
								},
								style: {
									width: "100%",
									height: "2em"
								},
								onChange:  function(){
									self._checkAndFixInput(this.ownerModule());
								}
							},{
								_riaswType: "riasw.form.ValidationTextBox",
								_riaswIdInModule: "textInput",
								name: "textInput",
								label: messages.text,
								intermediateChanges: true,
								rc: {
									col: 1,
									row: 2
								},
								style: {
									width: "100%",
									height: "2em"
								},
								isValid: function(){
									// Function over-ride of isValid to test if the input matches a url or a mailto style link.
									var value = this.get("value");
									return self._urlRegExp.test(value) || self._emailRegExp.test(value);
								},
								onChange:  function(){
									self._checkAndFixInput(this.ownerModule());
								}
							},{
								_riaswType: "riasw.form.Select",
								_riaswIdInModule: "targetSelect",
								name: "targetSelect",
								label: messages.target,
								intermediateChanges: true,
								rc: {
									col: 1,
									row: 3
								},
								options: [{
									selected: 'selected',
									value: '_self',
									label: messages.currentWindow
								},{
									value: '_blank',
									label: messages.newWindow
								},{
									value: '_top',
									label: messages.topWindow
								},{
									value: '_parent',
									label: messages.parentWindow
								}],
								style: {
									width: "15em",
									height: "2em"
								}
							}]
						}]
					}
				}
			});

			this._connectTagEvents();
		},

		_checkAndFixInput: function(dropDown){
			// summary:
			//		A function to listen for onChange events and test the input contents
			//		for valid information, such as valid urls with http/https/ftp and if
			//		not present, try and guess if the input url is relative or not, and if
			//		not, append http:// to it.  Also validates other fields as determined by
			//		the internal _isValid function.
			var self = this;
			var url = dropDown.urlInput.get("value");
			var fixupUrl = function(url){
				var appendHttp = false;
				var appendMailto = false;
				if(url && url.length > 1){
					url = rias.trim(url);
					if(url.indexOf("mailto:") !== 0){
						if(url.indexOf("/") > 0){
							if(url.indexOf("://") === -1){
								// Check that it doesn't start with /, ./, or ../, which would
								// imply 'target server relativeness'
								if(url.charAt(0) !== '/' && url.indexOf("./") && url.indexOf("../") !== 0){
									if(self._hostRxp.test(url)){
										appendHttp = true;
									}
								}
							}
						}else if(self._userAtRxp.test(url)){
							// If it looks like a foo@, append a mailto.
							appendMailto = true;
						}
					}
				}
				if(appendHttp){
					dropDown.urlInput.set("value", "http://" + url);
				}
				if(appendMailto){
					dropDown.urlInput.set("value", "mailto:" + url);
				}
				dropDown.btnSave.set("disabled", !self._isValid(dropDown));
			};
			if(this._delayedCheck){
				clearTimeout(this._delayedCheck);
				this._delayedCheck = null;
			}
			this._delayedCheck = setTimeout(function(){
				fixupUrl(url);
			}, 250);
		},

		_connectTagEvents: function(){
			// summary:
			//		Over-ridable function that connects tag specific events.
			this.editor.onLoadDeferred.then(rias.hitch(this, function(){
				this.own(rias.on(this.editor.editNode, "dblclick", rias.hitch(this, "_onDblClick")));
			}));
		},

		_isValid: function(dropDown){
			// summary:
			//		Internal function to allow validating of the inputs
			//		for a link to determine if set should be disabled or not
			// tags:
			//		protected
			return dropDown.urlInput.isValid() && dropDown.textInput.isValid();
		},

		/*_setContent: function(staticPanel){
			// summary:
			//		Helper for _initButton above.   Not sure why it's a separate method.
			this.dropDown.set({
				parserScope: "dojo", // make parser search for dojoType/data-dojo-type even if page is multi-version
				content: staticPanel
			});
		},*/

		_checkValues: function(args){
			// summary:
			//		Function to check the values in args and 'fix' them up as needed.
			// args: Object
			//		Content being set.
			// tags:
			//		protected
			if(args && args.urlInput){
				args.urlInput = args.urlInput.replace(/"/g, "&quot;");
			}
			return args;
		},

		setValue: function(args){
			// summary:
			//		Callback from the dialog when user presses "set" button.
			// tags:
			//		private

			// TODO: prevent closing popup if the text is empty
			//this._onCloseDialog();
			if(rias.has("ie") < 9){ //see #4151
				var sel = rangeapi.getSelection(this.editor.window);
				var range = sel.getRangeAt(0);
				var a = range.endContainer;
				if(a.nodeType === 3){
					// Text node, may be the link contents, so check parent.
					// This plugin doesn't really support nested HTML elements
					// in the link, it assumes all link content is text.
					a = a.parentNode;
				}
				if(a && (a.nodeName && a.nodeName.toLowerCase() !== this.tag)){
					// Still nothing, one last thing to try on IE, as it might be 'img'
					// and thus considered a control.
					a = this.editor.selection.getSelectedElement(this.tag);
				}
				if(a && (a.nodeName && a.nodeName.toLowerCase() === this.tag)){
					// Okay, we do have a match.  IE, for some reason, sometimes pastes before
					// instead of removing the targeted paste-over element, so we unlink the
					// old one first.  If we do not the <a> tag remains, but it has no content,
					// so isn't readily visible (but is wrong for the action).
					if(this.editor.queryCommandEnabled("unlink")){
						// Select all the link children, then unlink.  The following insert will
						// then replace the selected text.
						this.editor.selection.selectElementChildren(a);
						this.editor.execCommand("unlink");
					}
				}
			}
			// make sure values are properly escaped, etc.
			args = this._checkValues(args);
			this.editor.execCommand('inserthtml', rias.substitute(this.htmlTemplate, args));

			// IE sometimes leaves a blank link, so we need to fix it up.
			// Go ahead and do this for everyone just to avoid blank links
			// in the page.
			rias.dom.query("a", this.editor.document).forEach(function(a){
				if(!a.innerHTML && !rias.dom.hasAttr(a, "name")){
					// Remove empty anchors that do not have "name" set.
					// Empty ones with a name set could be a hidden hash
					// anchor.
					a.parentNode.removeChild(a);
				}
			}, this);
		},

		/*_onCloseDialog: function(){
			// summary:
			//		Handler for close event on the dialog

			if(this.editor.focused){
				// put focus back in the edit area, unless the dialog closed because the user clicked somewhere else
				this.editor.focus();
			}
		},*/

		_getCurrentValues: function(a){
			// summary:
			//		Over-ride for getting the values to set in the dropdown.
			// a:
			//		The anchor/link to process for data for the dropdown.
			// tags:
			//		protected
			var url, text, target;
			if(a && a.tagName.toLowerCase() === this.tag){
				url = a.getAttribute('_djrealurl') || a.getAttribute('href');
				target = a.getAttribute('target') || "_self";
				text = a.textContent || a.innerText;
				this.editor.selection.selectElement(a, true);
			}else{
				text = this.editor.selection.getSelectedText();
			}
			return {urlInput: url || '', textInput: text || '', targetSelect: target || ''}; //Object;
		},

		_onOpenDropDown: function(dropDown){
			// summary:
			//		Handler for when the dialog is opened.
			//		If the caret is currently in a URL then populate the URL's info into the dialog.
			var a, b, fc;
			if(rias.has("ie")){
				// IE, even IE10, is difficult to select the element in, using the range unified
				// API seems to work reasonably well.
				var sel = rangeapi.getSelection(this.editor.window);
				if(sel.rangeCount){
					var range = sel.getRangeAt(0);
					a = range.endContainer;
					if(a.nodeType === 3){
						// Text node, may be the link contents, so check parent.
						// This plugin doesn't really support nested HTML elements
						// in the link, it assumes all link content is text.
						a = a.parentNode;
					}
					if(a && (a.nodeName && a.nodeName.toLowerCase() !== this.tag)){
						// Still nothing, one last thing to try on IE, as it might be 'img'
						// and thus considered a control.
						a = this.editor.selection.getSelectedElement(this.tag);
					}
					if(!a || (a.nodeName && a.nodeName.toLowerCase() !== this.tag)){
						// Try another lookup, IE's selection is just terrible.
						b = this.editor.selection.getAncestorElement(this.tag);
						if(b && (b.nodeName && b.nodeName.toLowerCase() === this.tag)){
							// Looks like we found an A tag, use it and make sure just it is
							// selected.
							a = b;
							this.editor.selection.selectElement(a);
						}else if(range.startContainer === range.endContainer){
							// STILL nothing.  Trying one more thing.  Lets look at the first child.
							// It might be an anchor tag in a div by itself or the like.  If it is,
							// we'll use it otherwise we give up.  The selection is not easily
							// determinable to be on an existing anchor tag.
							fc = range.startContainer.firstChild;
							if(fc && (fc.nodeName && fc.nodeName.toLowerCase() === this.tag)){
								a = fc;
								this.editor.selection.selectElement(a);
							}
						}
					}
				}
			}else{
				a = this.editor.selection.getAncestorElement(this.tag);
			}
			dropDown.reset();
			dropDown.btnSave.set("disabled", true);
			dropDown.set("value", this._getCurrentValues(a));
		},

		_onDblClick: function(e){
			// summary:
			//		Function to define a behavior on double clicks on the element
			//		type this dialog edits to select it and pop up the editor
			//		dialog.
			// e: Object
			//		The double-click event.
			// tags:
			//		protected.
			if(e && e.target){
				var t = e.target;
				var tg = t.tagName ? t.tagName.toLowerCase() : "";
				if(tg === this.tag && rias.dom.getAttr(t, "href")){
					var ed = this.editor;

					ed.selection.selectElement(t);
					ed.onDisplayChanged();

					// Call onNormalizedDisplayChange() now, rather than on timer.
					// On IE, when focus goes to the first <input> in the TooltipDialog, the editor loses it's selection.
					// Later if onNormalizedDisplayChange() gets called via the timer it will disable the LinkDialog button
					// (actually, all the toolbar buttons), at which point clicking the <input> will close the dialog,
					// since (for unknown reasons) focus.js ignores disabled controls.
					if(ed._updateTimer){
						ed._updateTimer.remove();
						delete ed._updateTimer;
					}
					//ed.onNormalizedDisplayChanged();
					ed.publish(ed.id + "_normalizedDisplayChanged", [ed]);

					var button = this.button;
					setTimeout(function(){
						// Focus shift outside the event handler.
						// IE doesn't like focus changes in event handles.
						button.set("disabled", false);
						button.loadAndOpenDropDown().then(function(){
							if(button.dropDown.focus){
								button.dropDown.focus();
							}
						});
					}, 10);
				}
			}
		}
	});

	var ImgLinkDialog = rias.declare(pluginsName + ".ImgLinkDialog", [LinkDialog], {
		// summary:
		//		This plugin extends LinkDialog and adds in a plugin for handling image links.
		//		provides the image link dialog.
		// description:
		//		The command provided by this plugin is:
		//
		//		- insertImage

		// htmlTemplate: [protected] String
		//		String used for templating the `<img>` HTML to insert at the desired point.
		htmlTemplate: "<img src=\"${urlInput}\" _djrealurl=\"${urlInput}\" alt=\"${textInput}\" />",

		// tag: [protected] String
		//		Tag used for the link type (img).
		tag: "img",

		_getCurrentValues: function(img){
			// summary:
			//		Over-ride for getting the values to set in the dropdown.
			// a:
			//		The anchor/link to process for data for the dropdown.
			// tags:
			//		protected
			var url, text;
			if(img && img.tagName.toLowerCase() === this.tag){
				url = img.getAttribute('_djrealurl') || img.getAttribute('src');
				text = img.getAttribute('alt');
				this.editor.selection.selectElement(img, true);
			}else{
				text = this.editor.selection.getSelectedText();
			}
			return {urlInput: url || '', textInput: text || ''}; //Object
		},

		_isValid: function(dropDown){
			// summary:
			//		Over-ride for images.  You can have alt text of blank, it is valid.
			// tags:
			//		protected
			return dropDown.urlInput.isValid();
		},

		_connectTagEvents: function(){
			// summary:
			//		Over-ridable function that connects tag specific events.
			this.inherited(arguments);
			this.editor.onLoadDeferred.then(rias.hitch(this, function(){
				// Use onmousedown instead of onclick.  Seems that IE eats the first onclick
				// to wrap it in a selector box, then the second one acts as onclick.  See #10420
				this.own(rias.on(this.editor.editNode, "mousedown", rias.hitch(this, "_selectTag")));
			}));
		},

		_selectTag: function(e){
			// summary:
			//		A simple event handler that lets me select an image if it is clicked on.
			//		makes it easier to select images in a standard way across browsers.  Otherwise
			//		selecting an image for edit becomes difficult.
			// e: Event
			//		The mousedown event.
			// tags:
			//		private
			if(e && e.target){
				var t = e.target;
				var tg = t.tagName ? t.tagName.toLowerCase() : "";
				if(tg === this.tag){
					this.editor.selection.selectElement(t);
				}
			}
		},

		_checkValues: function(args){
			// summary:
			//		Function to check the values in args and 'fix' them up as needed
			//		(special characters in the url or alt text)
			// args: Object
			//		Content being set.
			// tags:
			//		protected
			if(args && args.urlInput){
				args.urlInput = args.urlInput.replace(/"/g, "&quot;");
			}
			if(args && args.textInput){
				args.textInput = args.textInput.replace(/"/g, "&quot;");
			}
			return args;
		},

		_onDblClick: function(e){
			// summary:
			//		Function to define a behavior on double clicks on the element
			//		type this dialog edits to select it and pop up the editor
			//		dialog.
			// e: Object
			//		The double-click event.
			// tags:
			//		protected.
			if(e && e.target){
				var t = e.target;
				var tg = t.tagName ? t.tagName.toLowerCase() : "";
				if(tg === this.tag && rias.dom.getAttr(t, "src")){
					var ed = this.editor;

					ed.selection.selectElement(t);
					ed.onDisplayChanged();

					// Call onNormalizedDisplayChange() now, rather than on timer.
					// On IE, when focus goes to the first <input> in the TooltipDialog, the editor loses it's selection.
					// Later if onNormalizedDisplayChange() gets called via the timer it will disable the LinkDialog button
					// (actually, all the toolbar buttons), at which point clicking the <input> will close the dialog,
					// since (for unknown reasons) focus.js ignores disabled controls.
					if(ed._updateTimer){
						ed._updateTimer.remove();
						delete ed._updateTimer;
					}
					//editor.onNormalizedDisplayChanged();
					ed.publish(ed.id + "_normalizedDisplayChanged", [ed]);

					var button = this.button;
					setTimeout(function(){
						// Focus shift outside the event handler.
						// IE doesn't like focus changes in event handles.
						button.set("disabled", false);
						button.loadAndOpenDropDown().then(function(){
							if(button.dropDown.focus){
								button.dropDown.focus();
							}
						});
					}, 10);
				}
			}
		}
	});

	// Register these plugins
	_Plugin.registry.createLink = _Plugin.registry.createlink = function(args){
		return new LinkDialog(rias.mixin({
			command: "createLink"
		}, args));
	};
	_Plugin.registry.insertImage = _Plugin.registry.insertimage = function(args){
		return new ImgLinkDialog(rias.mixin({
			command: "insertImage"
		}, args));
	};


	// Export both LinkDialog and ImgLinkDialog
	// TODO for 2.0: either return both classes in a hash, or split this file into two separate files.
	// Then the documentation for the module can be applied to the hash, and will show up in the API doc.
	LinkDialog.ImgLinkDialog = ImgLinkDialog;
	return LinkDialog;
});
