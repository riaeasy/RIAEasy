define([
	"riasw/riaswBase",
	"../_Plugin",
	"../range",
	"riasw/form/ValidationTextBox",
	"riasw/form/DropDownButton",
	"riasw/sys/Dialog",
	"dojo/i18n!./nls/InsertAnchor"
], function(rias, _Plugin, rangeapi, ValidationTextBox, DropDownButton, Dialog) {

	var pluginsName = "riasw.editor.htmleditor.plugins";

	var InsertAnchor = rias.declare(pluginsName + ".InsertAnchor", _Plugin, {
		// summary:
		//		This plugin provides the basis for an insert anchor dialog for the
		//		Editor
		//
		// description:
		//		The command provided by this plugin is:
		//
		//		- insertAnchor

		// htmlTemplate: [protected] String
		//		String used for templating the HTML to insert at the desired point.
		htmlTemplate: "<a name=\"${anchorInput}\" class=\"riaswEditorPluginInsertAnchorStyle\">${textInput}</a>",

		_initButton: function(){
			// summary:
			//		Override _Plugin._initButton() to initialize DropDownButton and TooltipDialog.
			var self = this;
			var messages = rias.i18n.getLocalization(pluginsName, "InsertAnchor", this.lang);

			this.button = new DropDownButton({
				ownerRiasw: this,
				disabled: this.get("disabled"),
				readOnly: this.get("readOnly"),
				label: messages.insertAnchor,
				showLabel: false,
				tooltip: messages.insertAnchor,
				iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "InsertAnchor",
				tabIndex: "-1",
				dropDown: {
					ownerRiasw: self,
					"dialogType": "modal,tip",
					actionBar: [
						"btnSubmit",
						"btnAbort"
					],
					caption: messages.title,
					//content: rias.substitute(this._template, messages),
					style: {
						height: "13em",
						width: "30em"
					},
					moduleMeta: {
						region: "center",
						afterLoadedAll: function(loadOk){
							if(loadOk){
								//self._anchorInput = rias.dom.byId(self._uniqueId + "_anchorInput");
								//self._textInput = rias.dom.byId(self._uniqueId + "_textInput");
								//self._setButton = rias.dom.byId(self._uniqueId + "_setButton");
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
								"labelWidth": "5em",
								"showLabel": true
							},
							cellStyle: {
								padding: "2px"
							},
							_riaswElements: [{
								_riaswType: "riasw.form.ValidationTextBox",
								_riaswIdInModule: "anchorInput",
								name: "anchorInput",
								label: messages.anchor,
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
									this.getOwnerModule().btnSave.set("disabled", !this.isValid());
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
								onChange:  function(){
									this.getOwnerModule().btnSave.set("disabled", !this.isValid());
								}
							}]
						}]
					}
				}
			});

			//Register some filters to handle setting/removing the class tags on anchors.
			this.editor.contentDomPreFilters.push(rias.hitch(this, this._preDomFilter));
			this.editor.contentDomPostFilters.push(rias.hitch(this, this._postDomFilter));
			this._setup();
		},

		updateState: function(){
			// summary:
			//		Over-ride for button state control for disabled to work.
			this.button.set("disabled", this.get("disabled"));
		},

		setEditor: function(editor){
			// summary:
			//		Over-ride for the setting of the editor.
			// editor: Object
			//		The editor to configure for this plugin to use.
			this.editor = editor;
			this._initButton();
		},

		/*_checkInput: function(){
			// summary:
			//		Function to check the input to the dialog is valid
			//		and enable/disable set button
			// tags:
			//		private
			var disable = true;
			if(this._anchorInput.isValid()){
				disable = false;
			}
			this._setButton.set("disabled", disable);
		},*/

		_setup: function(){
			// summary:
			//		Over-ridable function that connects tag specific events.
			this.editor.onLoadDeferred.then(rias.hitch(this, function(){
				this.on(this.editor.editNode, "dblclick", this._onDblClick);
				setTimeout(rias.hitch(this, function() {
					this._applyStyles();
				}), 100);
			}));
		},

		getAnchorStyle: function(){
			// summary:
			//		Over-ridable function for getting the style to apply to the anchor.
			//		The default is a dashed border with an anchor symbol.
			// tags:
			//		public
			var style = "@media screen {\n" +
				"\t.riaswEditorPluginInsertAnchorStyle {\n" +
				"\t\tbackground-image: url({MODURL}/images/anchor.gif);\n" +
				"\t\tbackground-repeat: no-repeat;\n"	+
				"\t\tbackground-position: top left;\n" +
				"\t\tborder-width: 1px;\n" +
				"\t\tborder-style: dashed;\n" +
				"\t\tborder-color: #D0D0D0;\n" +
				"\t\tpadding-left: 20px;\n" +
				"\t}\n" +
				"}\n";

			//Finally associate in the image locations based off the module url.
			//var modurl = dojo.moduleUrl(dojox._scopeName, "editor/plugins/resources").toString();
			var modurl = rias.toUrl(pluginsName.replace(/\./g, "/"));
			if(!(modurl.match(/^https?:\/\//i)) &&
				!(modurl.match(/^file:\/\//i))){
				// We have to root it to the page location on webkit for some nutball reason.
				// Probably has to do with how iframe was loaded.
				var bUrl;
				if(modurl.charAt(0) === "/"){
					//Absolute path on the server, so lets handle...
					var proto = rias.dom.doc.location.protocol;
					var hostn = rias.dom.doc.location.host;
					bUrl = proto + "//" + hostn;
				}else{
					bUrl = this._calcBaseUrl(rias.global.location.href);
				}
				if(bUrl[bUrl.length - 1] !== "/" && modurl.charAt(0) !== "/"){
					bUrl += "/";
				}
				modurl = bUrl + modurl;
			}
			return style.replace(/\{MODURL\}/gi, modurl);
		},

		_applyStyles: function(){
			// summary:
			//		Function to apply a style to inserted anchor tags so that
			//		they are obviously anchors.
			if(!this._styled){
				try{
					//Attempt to inject our specialized style rules for doing this.
					this._styled = true;
					var doc = this.editor.document;
					var style = this.getAnchorStyle();
					if(!rias.has("ie")){
						var sNode = doc.createElement("style");
						sNode.appendChild(doc.createTextNode(style));
						doc.getElementsByTagName("head")[0].appendChild(sNode);
					}else{
						var ss = doc.createStyleSheet("");
						ss.cssText = style;
					}
				}catch(e){ /* Squelch */ }
			}
		},

		_calcBaseUrl: function(fullUrl) {
			// summary:
			//		Internal function used to figure out the full root url (no relatives)
			//		for loading images in the styles in the iframe.
			// fullUrl: String
			//		The full url to tear down to the base.
			// tags:
			//		private
			var baseUrl = null;
			if (fullUrl !== null) {
				// Check to see if we need to strip off any query parameters from the Url.
				var index = fullUrl.indexOf("?");
				if (index !== -1) {
					fullUrl = fullUrl.substring(0,index);
				}

				// Now we need to trim if necessary.  If it ends in /, then we don't
				// have a filename to trim off so we can return.
				index = fullUrl.lastIndexOf("/");
				if (index > 0 && index < fullUrl.length) {
					baseUrl = fullUrl.substring(0,index);
				}else{
					baseUrl = fullUrl;
				}
			}
			return baseUrl; //String
		},

		_checkValues: function(args){
			// summary:
			//		Function to check the values in args and 'fix' them up as needed.
			// args: Object
			//		Content being set.
			// tags:
			//		protected
			if(args){
				if(args.anchorInput){
					args.anchorInput = args.anchorInput.replace(/"/g, "&quot;");
				}
				if(!args.textInput){
					// WebKit doesn't work with double-click select unless there's
					// a space in the anchor text, so put a in the case of
					// empty desc.
					args.textInput = "&nbsp;";
				}
			}
			return args;
		},

		setValue: function(args){
			// summary:
			//		Callback from the dialog when user presses "set" button.
			// tags:
			//		private
			//this._onCloseDialog();
			if(!this.editor.window.getSelection){
				// IE check without using user agent string.
				var sel = rangeapi.getSelection(this.editor.window);
				var range = sel.getRangeAt(0);
				var a = range.endContainer;
				if(a.nodeType === 3){
					// Text node, may be the link contents, so check parent.
					// This plugin doesn't really support nested HTML elements
					// in the link, it assumes all link content is text.
					a = a.parentNode;
				}
				if(a && (a.nodeName && a.nodeName.toLowerCase() !== "a")){
					// Stll nothing, one last thing to try on IE, as it might be 'img'
					// and thus considered a control.
					a = this.editor._sCall("getSelectedElement", ["a"]);
				}
				if(a && (a.nodeName && a.nodeName.toLowerCase() === "a")){
					// Okay, we do have a match.  IE, for some reason, sometimes pastes before
					// instead of removing the targetted paste-over element, so we unlink the
					// old one first.  If we do not the <a> tag remains, but it has no content,
					// so isn't readily visible (but is wrong for the action).
					if(this.editor.queryCommandEnabled("unlink")){
						// Select all the link childent, then unlink.  The following insert will
						// then replace the selected text.
						this.editor._sCall("selectElementChildren", [a]);
						this.editor.execCommand("unlink");
					}
				}
			}
			// make sure values are properly escaped, etc.
			args = this._checkValues(args);
			this.editor.execCommand('inserthtml', rias.substitute(this.htmlTemplate, args));
		},

		/*_onCloseDialog: function(){
			// summary:
			//		Handler for close event on the dialog
			this.editor.focus();
		},*/

		_getCurrentValues: function(a){
			// summary:
			//		Over-ride for getting the values to set in the dropdown.
			// a:
			//		The anchor/link to process for data for the dropdown.
			// tags:
			//		protected
			var anchor, text;
			if(a && a.tagName.toLowerCase() === "a" && rias.dom.getAttr(a, "name")){
				anchor = rias.dom.getAttr(a, "name");
				text = a.textContent || a.innerText;
				this.editor._sCall("selectElement", [a, true]);
			}else{
				text = this.editor._sCall("getSelectedText");
			}
			return {
				anchorInput: anchor || '',
				textInput: text || ''
			}; //Object;
		},

		_onOpenDropDown: function(dropDown){
			// summary:
			//		Handler for when the dialog is opened.
			//		If the caret is currently in a URL then populate the URL's info into the dialog.
			var a;
			if(!this.editor.window.getSelection){
				// IE is difficult to select the element in, using the range unified
				// API seems to work reasonably well.
				var sel = rangeapi.getSelection(this.editor.window);
				var range = sel.getRangeAt(0);
				a = range.endContainer;
				if(a.nodeType === 3){
					// Text node, may be the link contents, so check parent.
					// this plugin doesn't really support nested HTML elements
					// in the link, it assumes all link content is text.
					a = a.parentNode;
				}
				if(a && (a.nodeName && a.nodeName.toLowerCase() !== "a")){
					// Stll nothing, one last thing to try on IE, as it might be 'img'
					// and thus considered a control.
					a = this.editor._sCall("getSelectedElement", ["a"]);
				}
			}else{
				a = this.editor._sCall("getAncestorElement", ["a"]);
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
				var tg = t.tagName? t.tagName.toLowerCase() : "";
				if(tg === "a" && rias.dom.getAttr(t, "name")){
					this.editor.onDisplayChanged();
					this.editor._sCall("selectElement", [t]);
					setTimeout(rias.hitch(this, function(){
						// Focus shift outside the event handler.
						// IE doesn't like focus changes in event handles.
						this.button.set("disabled", false);
						this.button.openDropDown();
						if(this.button.dropDown.focus){
							this.button.dropDown.focus();
						}
					}), 10);
				}
			}
		},

		_preDomFilter: function(node){
			// summary:
			//		A filter to identify the 'a' tags and if they're anchors,
			//		apply the right style to them.
			// node:
			//		The node to search from.
			// tags:
			//		private

			rias.dom.query("a[name]:not([href])", this.editor.editNode).addClass("riaswEditorPluginInsertAnchorStyle");
		},

		_postDomFilter: function(node){
			// summary:
			//		A filter to identify the 'a' tags and if they're anchors,
			//		remove the class style that shows up in the editor from
			//		them.
			// node:
			//		The node to search from.
			// tags:
			//		private
			if(node){	// avoid error when Editor.get("value") called before editor's iframe initialized
				rias.dom.query("a[name]:not([href])", node).removeClass("riaswEditorPluginInsertAnchorStyle");
			}
			return node;
		}
	});


	// Register this plugin.
	_Plugin.registry.insertAnchor = _Plugin.registry.insertanchor = function(args){
		return new InsertAnchor(args);
	};

	return InsertAnchor;

});
