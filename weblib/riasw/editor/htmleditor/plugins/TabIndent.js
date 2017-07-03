define([
	"riasw/riaswBase",
	"../_Plugin",
	"riasw/form/ToggleButton"
], function(rias, _Plugin, ToggleButton){

	// module:
	//		riasw/_editor/plugins/TabIndent

	//rias.experimental("riasw._editor.plugins.TabIndent");
	var pluginsName = "riasw.editor.htmleditor.plugins";


	var TabIndent = rias.declare(pluginsName + ".TabIndent", _Plugin, {
		// summary:
		//		This plugin is used to allow the use of the tab and shift-tab keys
		//		to indent/outdent list items.  This overrides the default behavior
		//		of moving focus from/to the toolbar

		// Override _Plugin.useDefaultCommand... processing is handled by this plugin, not by Editor.
		useDefaultCommand: false,

		// Override _Plugin.buttonClass to use a ToggleButton for this plugin rather than a vanilla Button
		buttonClass: ToggleButton,

		command: "tabIndent",

		_initButton: function(){
			// Override _Plugin._initButton() to setup listener on button click
			this.inherited(arguments);

			var e = this.editor;
			this.own(this.button.on("change", function(val){
				e.set("isTabIndent", val);
			}));

			// Set initial checked state of button based on Editor.isTabIndent
			this.updateState();
		},

		updateState: function(){
			// Overrides _Plugin.updateState().
			// Ctrl-m in the editor will switch tabIndent mode on/off, so we need to react to that.
			var disabled = this.get("disabled");
			this.button.set("disabled", disabled);
			if(disabled){
				return;
			}
			this.button.set('checked', this.editor.isTabIndent, false);
		}
	});

	// Register this plugin.
	_Plugin.registry.tabIndent = _Plugin.registry.tabindent = function(args){
		return new TabIndent(args);
	};


	return TabIndent;
});
