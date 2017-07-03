define([
	"riasw/riaswBase",
	"../_Plugin",
	"./Save",
	"riasw/sys/Menu",
	"riasw/sys/MenuItem",
	"riasw/form/ComboButton",
	"dojo/i18n!./nls/AutoSave"
], function(rias, _Plugin, Save, Menu, MenuItem, ComboButton) {

	//rias.experimental("dojox.editor.plugins.AutoSave");
	var pluginsName = "riasw.editor.htmleditor.plugins";

	var AutoSave = rias.declare(pluginsName + ".AutoSave", Save, {
		// summary:
		//		This plugin provides the auto save capability to the editor. The
		//		plugin saves the content of the editor in interval. When
		//		the save action is performed, the document in the editor frame
		//		will be posted to the URL provided, or none, if none provided.

		// url: [public] String
		//		The URL to POST the content back to.  Used by the save function.
		url: "",

		// logResults: [public] Boolean
		//		Boolean flag to indicate that the default action for save and
		//		error handlers is to just log to console.  Default is true.
		logResults: true,

		// interval: [public] Number
		//		The interval to perform the save action.
		interval: 5,///minutes

		// _iconClassPrefix: [private] String
		//		This prefix of the CSS class
		_iconClassPrefix: "riaswEditorIconAutoSave",

		// _MIN: [private const] Number
		//		Default 1 minute
		_MIN: 60000,

		_setIntervalAttr: function(val){
			// summary:
			//		Set the interval value.
			//		Delay the boundary check to _isValidValue of the dialog class
			// val:
			//		The interval value.
			// tags:
			//		private
			this.interval = val;
		},

		setEditor: function(editor){
			// summary:
			//		Over-ride for the setting of the editor. No toggle button for
			//		this plugin. And start to save the content of the editor in
			//		interval
			// editor: Object
			//		The editor to configure for this plugin to use.
			this.editor = editor;
			this._strings = rias.i18n.getLocalization(pluginsName, "AutoSave");
			this._initButton();
		},

		_initButton: function(){
			var menu = new Menu({
					ownerRiasw: this,
					style: "display: none"
				}),
				menuItemSave = new MenuItem({
					ownerRiasw: this,
					iconClass: this._iconClassPrefix + "Default " + this._iconClassPrefix,
					label: this._strings.saveLabel
				}),
				menuItemAutoSave = (this._menuItemAutoSave = new MenuItem({
					ownerRiasw: this,
					iconClass: this._iconClassPrefix + "Setting " + this._iconClassPrefix,
					label: this._strings.saveSettingLabelOn
				}));

			menu.addChild(menuItemSave);
			menu.addChild(menuItemAutoSave);
			this.button = new ComboButton({
				ownerRiasw: this,
				disabled: this.get("disabled"),
				readOnly: this.get("readOnly"),
				label: this._strings.saveLabel,
				tooltip: this._strings.saveLabel,
				iconClass: this._iconClassPrefix + "Default " + this._iconClassPrefix,
				showLabel: false,
				dropDown: menu
			});

			this.on(this.button, "onClick", "_save");
			this.on(menuItemSave, "onClick", "_save");
			this._menuItemAutoSaveClickHandler = this.on(menuItemAutoSave, "onClick", "_showAutSaveSettingDialog");
		},

		_showAutSaveSettingDialog: function(){
			// summary:
			//		Show the setting dialog
			// tags:
			//		private
			var self = this;
			rias.showInput({
				popupArgs: {
					around: this.button
				},
				caption: this._strings.saveSettingdialogTitle,
				value: this.interval,
				infos: this._strings.saveSettingdialogParamLabel + ": 1",
				onSubmit: function(){
					var interval = (self.interval = this.get("value") * this._MIN);
					if(interval > 0){
						self._setSaveInterval(interval);
						// Change the menu "Set Auto-Save Interval..." to "Turn off Auto-Save"
						// Connect it to another handler that terminates the auto-save.
						if(self._menuItemAutoSaveClickHandler){
							self._menuItemAutoSaveClickHandler.remove();
						}
						self._menuItemAutoSave.set("label", self._strings.saveSettingLabelOff);
						self._menuItemAutoSaveClickHandler = self.on(self._menuItemAutoSave, "onClick", "_onStopClick");
						// Change the icon of the main button to auto-save style
						self.button.set("iconClass", self._iconClassPrefix + "Setting " + self._iconClassPrefix);
					}
				}
			});
		},

		_onStopClick: function(){
			// summary:
			//		Stop auto-save
			// tags:
			//		private
			this._clearSaveInterval();
			// Change the menu "Turn off Auto-Save" to "Set Auto-Save Interval...".
			// Connect it to another handler that show the setting dialog.
			if(this._menuItemAutoSaveClickHandler){
				this._menuItemAutoSaveClickHandler.remove();
			}
			this._menuItemAutoSave.set("label", this._strings.saveSettingLabelOn);
			this._menuItemAutoSaveClickHandler = this.on(this._menuItemAutoSave, "onClick", "_showAutSaveSettingDialog");
			// Change the icon of the main button
			this.button.set("iconClass", this._iconClassPrefix + "Default " + this._iconClassPrefix);
		},

		_setSaveInterval: function(/*Number*/ interval){
			// summary:
			//		Function to trigger saving of the editor document
			// tags:
			//		private
			if(interval <= 0){
				return;
			}
			var self = this;
			self._clearSaveInterval();
			self._intervalHandler = setInterval(function(){
				if(!self._isWorking && !self.get("disabled")){
					// If the plugin is not disabled (ViewSource, etc.)
					// and not working. Do saving!
					self._isWorking = true;
					self._save();
				}
			}, interval);
		},

		_clearSaveInterval: function(){
			if(this._intervalHandler){
				clearInterval(this._intervalHandler);
				this._intervalHandler = null;
			}
		},

		onSuccess: function(resp, ioargs){
			// summary:
			//		User over-ridable save success function for editor content.
			// resp:
			//		The response from the server, if any, in text format.
			// tags:
			//		public
			this.button.set("disabled", false);
			// Show the successful message
			rias.hint(rias.substitute(this._strings.saveMessageSuccess, {
				"0": rias.dateLocale.format(new Date(), {selector: "time"})
			}), this, this.button);
			this._isWorking = false;
			if(this.logResults){
				console.log(resp);
			}
		},

		onError: function(error, ioargs){
			// summary:
			//		User over-ridable save success function for editor content.
			// resp:
			//		The response from the server, if any, in text format.
			// tags:
			//		public
			this.button.set("disabled", false);
			// Show the failure message
			rias.hint(rias.substitute(this._strings.saveMessageFail, {
				"0": rias.dateLocale.format(new Date(), {selector: "time"})
			}), this, this.button);
			this._isWorking = false;
			//if(this.logResults){
				console.error(error);
			//}
		},

		_onDestroy: function(){
			// summary:
			//		Cleanup of our plugin.
			this._menuItemAutoSave = null;

			this._clearSaveInterval();

			if(this._menuItemAutoSaveClickHandler){
				this._menuItemAutoSaveClickHandler.remove();
				this._menuItemAutoSaveClickHandler = null;
			}

			this.inherited(arguments);
		}
	});

	// Register this plugin.
	_Plugin.registry.autoSave = _Plugin.registry.autosave = function(args){
		return new AutoSave(args);
	};

	return AutoSave;

});
