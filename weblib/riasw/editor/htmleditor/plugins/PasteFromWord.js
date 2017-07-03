define([
	"riasw/riaswBase",
	"../_Plugin",
	"riasw/form/Button",
	"riasw/sys/Dialog",
	"riasw/editor/RichText",
	"dojo/i18n!./nls/PasteFromWord",
	"dojo/i18n!./nls/commands"
], function(rias, _Plugin, Button, Dialog, RichText) {

	var pluginsName = "riasw.editor.htmleditor.plugins";

	var PasteFromWord = rias.declare(pluginsName + ".PasteFromWord", _Plugin, {
		// summary:
		//		This plugin provides PasteFromWord capability to the editor.  When
		//		clicked, a dialog opens with a spartan RichText instance to paste
		//		word content into via the keyboard commands.  The contents are
		//		then filtered to remove word style classes and other meta-junk
		//		that tends to cause issues.

		// width: [public] String
		//		The width to use for the rich text area in the copy/pate dialog, in px.  Default is 400px.
		width: "400px",

		// height: [public] String
		//		The height to use for the rich text area in the copy/pate dialog, in px.  Default is 300px.
		height: "300px",

		// _filters: [protected] Array
		//		The filters is an array of regular expressions to try and strip out a lot
		//		of style data MS Word likes to insert when pasting into a contentEditable.
		//		Prettymuch all of it is junk and not good html.  The hander is a place to put a function
		//		for match handling.  In most cases, it just handles it as empty string.  But the option is
		//		there for more complex handling.
		_filters: [
			// Meta tags, link tags, and prefixed tags
			{regexp: /(<meta\s*[^>]*\s*>)|(<\s*link\s* href="file:[^>]*\s*>)|(<\/?\s*\w+:[^>]*\s*>)/gi, handler: ""},
			// Style tags
			{regexp: /(?:<style([^>]*)>([\s\S]*?)<\/style>|<link\s+(?=[^>]*rel=['"]?stylesheet)([^>]*?href=(['"])([^>]*?)\4[^>\/]*)\/?>)/gi, handler: ""},
			// MS class tags and comment tags.
			{regexp: /(class="Mso[^"]*")|(<!--(.|\s){1,}?-->)/gi, handler: ""},
			// blank p tags
			{regexp: /(<p[^>]*>\s*(\&nbsp;|\u00A0)*\s*<\/p[^>]*>)|(<p[^>]*>\s*<font[^>]*>\s*(\&nbsp;|\u00A0)*\s*<\/\s*font\s*>\s<\/p[^>]*>)/ig, handler: ""},
			// Strip out styles containing mso defs and margins, as likely added in IE and are not good to have as it mangles presentation.
			{regexp: /(style="[^"]*mso-[^;][^"]*")|(style="margin:\s*[^;"]*;")/gi, handler: ""},
			// Scripts (if any)
			{regexp: /(<\s*script[^>]*>((.|\s)*?)<\\?\/\s*script\s*>)|(<\s*script\b([^<>]|\s)*>?)|(<[^>]*=(\s|)*[("|')]javascript:[^$1][(\s|.)]*[$1][^>]*>)/ig, handler: ""},
			// Word 10 odd o:p tags.
			{regexp: /<(\/?)o\:p[^>]*>/gi, handler: ""}
		],

		_initButton: function(){
			// summary:
			//		Over-ride for creation of the save button.
			this._filters = this._filters.slice(0);

			var strings = this.i18n = rias.i18n.getLocalization(pluginsName, "PasteFromWord");
			rias.mixin(strings, rias.i18n.getLocalization(pluginsName, "commands"));
			this.button = new Button({
				ownerRiasw: this,
				disabled: this.get("disabled"),
				readOnly: this.get("readOnly"),
				label: strings.pasteFromWord,
				showLabel: false,
				tooltip: strings.pasteFromWord,
				iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "PasteFromWord",
				tabIndex: "-1",
				onClick: rias.hitch(this, "_openDialog")
			});

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

		_openDialog: function(){
			// summary:
			//		Function to trigger opening the copy dialog.
			// tags:
			//		private
			var self = this;
			rias.showDialog({
				ownerRiasw: this,
				//parent: rias.dom.desktopBody,
				"dialogType": "modal,tip",
				caption: this.i18n.pasteFromWord,
				style: {
					width: this.width,
					height: this.height
				},
				actionBar: [
					"btnSubmit",
					"btnAbort"
				],
				moduleMeta: {
					_riaswElements: [{
						_riaswType: "riasw.layout.ContentPanel",
						_riaswIdInModule: "_instructions",
						region: "top",
						content: this.i18n.instructions,
						style: {
							margin: "0.5em"
						}
					},{
						_riaswType: "riasw.editor.RichText",
						_riaswIdInModule: "_rte",
						plugins: [],
						region: "center",
						style: {
							margin: "0.5em"
						}
					}],
					onSubmit: function(){
						self._paste(this._rte.get("value"));
					}
				}
			});
			/*if(!this._rte){
				// RTE hasn't been created yet, so we need to create it now that the
				// dialog is showing up.
				setTimeout(rias.hitch(this, function() {
					this._rte = new RichText({
						height: this.height || "300px"
					}, this._uId + "_rte");
					this._rte.startup();
					this._rte.onLoadDeferred.then(rias.hitch(this, function() {
						rias.fx.animateProperty({
							node: this._rte.domNode, properties: { opacity: { start: 0.001, end: 1.0 } }
						}).play();
					}));
				}), 100);
			}*/
		},

		_paste: function(content){
			// summary:
			//		Function to handle setting the contents of the copy from dialog
			//		into the editor.
			// tags:
			//		private

			// Gather the content and try to format it a bit (makes regexp cleanup simpler).
			// It also normalizes tag names and styles, so regexps are the same across browsers.
			content = rias.dom.html.format.prettyPrint(content);

			// Apply all the filters to remove MS specific injected text.
			var i;
			for(i = 0; i < this._filters.length; i++){
				var filter  = this._filters[i];
				content = content.replace(filter.regexp, filter.handler);
			}

			// Format it again to make sure it is reasonably formatted as
			// the regexp applies will have likely chewed up the formatting.
			content = rias.dom.html.format.prettyPrint(content);

			// Paste it in.
			this.editor.focus();
			this.editor.execCommand("inserthtml", content);
		},

		_onDestroy: function(){
			// sunnary:
			//		Cleanup function
			// tags:
			//		public
			if(this._rte){
				this._rte.destroy();
			}
			if(this._dialog){
				this._dialog.destroy();
			}
			delete this._dialog;
			delete this._rte;
			this.inherited(arguments);
		}

	});

// Register this plugin.
	_Plugin.registry.pasteFromWord = _Plugin.registry.pastefromword = function(args){
		return new PasteFromWord(args);
	};

	return PasteFromWord;
});
