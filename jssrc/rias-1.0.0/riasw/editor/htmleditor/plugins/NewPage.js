define([
	"rias",
	"../_Plugin",
	"rias/riasw/form/Button",
	"dojo/i18n!./nls/commands"
], function(rias, _Plugin, Button){

	// module:
	//		dijit/_editor/plugins/NewPage
	var pluginsName = "rias.riasw.editor.htmleditor.plugins";

	var NewPage = rias.declare(pluginsName + ".NewPage", _Plugin, {
		// summary:
		//		This plugin provides a simple 'new page' capability.  In other
		//		words, set content to some default user defined string.

		// content: [public] String
		//		The default content to insert into the editor as the new page.
		//		The default is the `<br>` tag, a single blank line.
		content: "<br>",

		_initButton: function(){
			// summary:
			//		Over-ride for creation of the Print button.
			var strings = rias.i18n.getLocalization(pluginsName, "commands"),
				editor = this.editor;
			this.button = new Button({
				ownerRiasw: this,
				label: strings["newPage"],
				tooltip: strings["newPage"],
				ownerDocument: editor.ownerDocument,
				dir: editor.dir,
				lang: editor.lang,
				showLabel: false,
				iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "NewPage",
				tabIndex: "-1",
				onClick: rias.hitch(this, "_newPage")
			});
		},

		setEditor: function(/*dijit/Editor*/ editor){
			// summary:
			//		Tell the plugin which Editor it is associated with.
			// editor: Object
			//		The editor object to attach the newPage capability to.
			this.editor = editor;
			this._initButton();
		},

		updateState: function(){
			// summary:
			//		Over-ride for button state control for disabled to work.
			this.button.set("disabled", this.get("disabled"));
		},

		_newPage: function(){
			// summary:
			//		Function to set the content to blank.
			// tags:
			//		private
			this.editor.beginEditing();
			this.editor.set("value", this.content);
			this.editor.endEditing();
			this.editor.focus();
		}
	});

	// Register this plugin.
	// For back-compat accept "newpage" (all lowercase) too, remove in 2.0
	_Plugin.registry["newPage"] = _Plugin.registry["newpage"] = function(args){
		return new NewPage(args)
	};

	return NewPage;
});
