define([
	"riasw/riaswBase",
	"../_Plugin",
	"./EntityPalette",
	"riasw/form/Button",
	"dojo/i18n!./nls/InsertEntity"
], function(rias, _Plugin, EntityPalette, Button) {

	var pluginsName = "riasw.editor.htmleditor.plugins";

	var InsertEntity = rias.declare(pluginsName + ".InsertEntity", _Plugin, {
		// summary:
		//		This plugin allows the user to select from standard Symbols (HTML Entities)
		//		to insert at the current cursor position.  It binds to the key pattern:
		//		ctrl-shift-s for opening the insert symbol dropdown.
		//
		// description:
		//		The commands provided by this plugin are:
		//
		//		- insertEntity - inserts the selected HTML entity character

		showCode: false,
		showEntityName: false,

		_initButton: function(){
			// summary:
			//		Over-ride for creation of the save button.
			this.dropDown = new EntityPalette({
				ownerRiasw: this,
				showCode: this.showCode,
				showEntityName: this.showEntityName
			});
			var self = this;
			this.dropDown.on("onChange", function(entity){
				self.button.closeDropDown();
				self.editor.focus();
				self.editor.execCommand("inserthtml", entity);
			});
			var strings = rias.i18n.getLocalization(pluginsName, "InsertEntity");
			this.button = new Button({
				ownerRiasw: this,
				disabled: this.get("disabled"),
				readOnly: this.get("readOnly"),
				label: strings.insertEntity,
				showLabel: false,
				tooltip: strings.insertEntity,
				iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "InsertEntity",
				tabIndex: "-1",
				dropDown: this.dropDown
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

			this.editor.addKeyHandler("s", true, true, rias.hitch(this, function(){
				this.button.openDropDown();
				this.dropDown.focus();
			}));

			editor.contentPreFilters.push(this._preFilterEntities);
			editor.contentPostFilters.push(this._postFilterEntities);
		},

		_preFilterEntities: function(s/*String content passed in*/){
			// summary:
			//		A function to filter out entity characters into their UTF-8 character form
			//		displayed in the editor.  It gets registered with the preFilters
			//		of the editor.
			// tags:
			//		private.
			return rias.dom.html.entities.decode(s, rias.dom.html.entities.latin);
		},

		_postFilterEntities: function(s/*String content passed in*/){
			// summary:
			//		A function to filter out entity characters into encoded form so they
			//		are properly displayed in the editor.  It gets registered with the
			//		postFilters of the editor.
			// tags:
			//		private.
			return rias.dom.html.entities.encode(s, rias.dom.html.entities.latin);
		}
	});

	// Register this plugin.
	_Plugin.registry.insertEntity = _Plugin.registry.insertentity = function(args){
		return new InsertEntity(args);
	};

	return InsertEntity;
});
