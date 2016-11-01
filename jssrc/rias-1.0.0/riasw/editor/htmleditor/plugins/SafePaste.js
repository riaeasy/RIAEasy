define([
	"rias",
	"../_Plugin",
	"./PasteFromWord",
	"rias/riasw/layout/DialogPanel",
	"dojo/i18n!./nls/SafePaste",
	"dojo/i18n!dijit/nls/common",
	"dojo/i18n!./nls/commands"
], function(rias, _Plugin, PasteFromWord, DialogPanel) {

	var pluginsName = "rias.riasw.editor.htmleditor.plugins";

	var SafePaste = rias.declare(pluginsName + ".SafePaste", [PasteFromWord],{
		// summary:
		//		This plugin extends from the PasteFromWord plugin and provides
		//		'safe pasting', meaning that it will not allow keyboard/menu pasting
		//		into the dijit editor.  It still runs all of the word cleanup code,
		//		including script strippers.  If you use this plugin, you don't need to
		//		use the 'PasteFromWord Plugin'

		stripTags: null,

		_initButton: function(){
			// summary:
			//		Over-ride the editor paste controls

			// Create instance local copy.
			this._filters = this._filters.slice(0);
			var strings = this.i18n = rias.i18n.getLocalization(pluginsName, "SafePaste");
			rias.mixin(strings, rias.i18n.getLocalization("dijit", "common"));
			rias.mixin(strings, rias.i18n.getLocalization(pluginsName, "commands"));

			/*this._uId = rias.getUniqueId(this.editor.id);

			strings.uId = this._uId;
			strings.width = this.width || "400px";
			strings.height = this.height || "300px";

			this._dialog = new DialogPanel({
				ownerRiasw: this,
				parent: rias.dom.webAppNode,
				caption: strings["paste"],
				actionBar: [
				]
			});
			this._dialog.set("content", rias.substitute(this._template, strings));

			// Make it translucent so we can fade in the window when the RTE is created.
			// the RTE has to be created 'visible, and this is a ncie trick to make the creation
			// 'pretty'.
			rias.dom.setStyle(rias.dom.byId(this._uId + "_rte"), "opacity", 0.001);

			// Link up the action buttons to perform the insert or cleanup.
			this.connect(rias.by(this._uId + "_paste"), "onClick", "_paste");
			this.connect(rias.by(this._uId + "_cancel"), "onClick", "_cancel");
			this.connect(this._dialog, "onHide", "_clearDialog");*/

			// Create regular expressions for sripping out user-specified tags and register
			// them with the filters.
			rias.forEach(this.stripTags, function(tag){
				var tagName = tag + "";
				var rxStartTag = new RegExp("<\\s*" + tagName + "[^>]*>", "igm");
				var rxEndTag = new RegExp("<\\\\?\\/\\s*" + tagName + "\\s*>", "igm");
				this._filters.push({regexp:
					rxStartTag,
					handler: ""
				});
				this._filters.push({regexp:
					rxEndTag,
					handler: ""
				});
			}, this);
		},

		updateState: function(){
			// summary:
			//		Overrides _Plugin.updateState().
			// tags:
			//		protected

			// Do nothing.
		},

		setEditor: function(editor){
			// summary:
			//		Over-ride for the setting of the editor.
			// editor: Object
			//		The editor to configure for this plugin to use.
			this.editor = editor;
			this._initButton();
			this.editor.onLoadDeferred.then(rias.hitch(this, function(){
				var spFunc = rias.hitch(this, function(e){
					if(e){
						rias.event.stopEvent(e);
					}
					this._openDialog();
					return true;
				});
				this.connect(this.editor.editNode, "onpaste", spFunc);
				this.editor._pasteImpl = spFunc;
			}));
		}
	});

// Register this plugin.
	_Plugin.registry["safePaste"] = _Plugin.registry["safepaste"] = function(args){
		return new SafePaste(args);
	};

	return SafePaste;

});
