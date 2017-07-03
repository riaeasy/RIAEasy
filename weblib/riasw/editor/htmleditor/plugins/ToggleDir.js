define([
	"riasw/riaswBase",
	"../_Plugin",
	"riasw/form/ToggleButton"
], function(rias, _Plugin, ToggleButton){

	// module:
	//		riasw/_editor/plugins/ToggleDir
	var pluginsName = "riasw.editor.htmleditor.plugins";

	var ToggleDir = rias.declare(pluginsName + ".ToggleDir", _Plugin, {
		// summary:
		//		This plugin is used to toggle direction of the edited document,
		//		independent of what direction the whole page is.

		// Override _Plugin.useDefaultCommand: processing is done in this plugin
		// rather than by sending commands to the Editor
		useDefaultCommand: false,

		command: "toggleDir",

		// Override _Plugin.buttonClass to use a ToggleButton for this plugin rather than a vanilla Button
		buttonClass: ToggleButton,

		_initButton: function(){
			this.inherited(arguments);

			var button = this.button,
				editorLtr = this.editor.isLeftToRight();

			this.own(this.button.on("change", rias.hitch(this, function(checked){
				this.editor.set("textDir", editorLtr ^ checked ? "ltr" : "rtl");
			})));

			// Button should be checked if the editor's textDir is opposite of the editor's dir.
			// Note that the arrow in the icon points in opposite directions depending on the editor's dir.
			var editorDir = editorLtr ? "ltr" : "rtl";
			function setButtonChecked(textDir){
				button.set("checked", textDir && textDir !== editorDir, false);
			}
			setButtonChecked(this.editor.get("textDir"));
			this.editor.watch("textDir", function(name, oval, nval){
				setButtonChecked(nval);
			});
		},

		updateState: function(){
			// summary:
			//		Over-ride for button state control for disabled to work.
			this.button.set("disabled", this.get("disabled"));
		}
	});

	// Register this plugin.
	_Plugin.registry.toggleDir = _Plugin.registry.toggledir = function(args){
		return new ToggleDir(args);
	};

	return ToggleDir;
});
