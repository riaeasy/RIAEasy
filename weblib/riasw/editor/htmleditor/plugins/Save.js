define([
	"riasw/riaswBase",
	"../_Plugin",
	"riasw/form/Button",
	"dojo/i18n!./nls/Save"
], function(rias, _Plugin, Button) {

	var pluginsName = "riasw.editor.htmleditor.plugins";

	var Save = rias.declare(pluginsName + ".Save", _Plugin, {
		// summary:
		//		This plugin provides Save capability to the editor.  When
		//		clicked, the document in the editor frame will be posted to the URL
		//		provided, or none, if none provided.  Users who desire a different save
		//		function can extend this plugin (via dojo.extend) and over-ride the
		//		save method	while save is in process, the save button is disabled.

		// url: [public] String
		//		The URL to POST the content back to.  Used by the save function.
		url: "",

		// logResults: [public] boolean
		//		Boolean flag to indicate that the default action for save and
		//		error handlers is to just log to console.  Default is true.
		logResults: true,

		_initButton: function(){
			// summary:
			//		Over-ride for creation of the save button.
			var strings = rias.i18n.getLocalization(pluginsName, "Save");
			this.button = new Button({
				ownerRiasw: this,
				disabled: this.get("disabled"),
				readOnly: this.get("readOnly"),
				label: strings.save,
				tooltip: strings.save,
				showLabel: false,
				iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "Save",
				tabIndex: "-1",
				onClick: rias.hitch(this, "_save")
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

		_save: function(){
			// summary:
			//		Function to trigger saving of the editor document
			// tags:
			//		private
			var content = this.editor.get("value");
			this.save(content);
		},

		save: function(content){
			// summary:
			//		User over-ridable save function for the editor content.
			//		Please note that the service URL provided should do content
			//		filtering of the posted content to avoid XSS injection via
			//		the data from the editor.
			// tags:
			//		public

			// Set the default header to post as a body of text/html.
			var headers = {
				"Content-Type": "text/html"
			};
			if(this.url){
				var postArgs = {
					url: this.url,
					postData: content,
					headers: headers,
					handleAs: "text"
				};
				this.button.set("disabled", true);
				var deferred = rias.xhr.post(postArgs);
				deferred.addCallback(rias.hitch(this, this.onSuccess));
				deferred.addErrback(rias.hitch(this, this.onError));
			}else{
				console.log("No URL provided, no post-back of content: " + content);
			}
		},

		onSuccess: function(resp, ioargs){
			// summary:
			//		User over-ridable save success function for editor content.
			//		Be sure to call this.inherited(arguments) if over-riding this method.
			// resp:
			//		The response from the server, if any, in text format.
			// tags:
			//		public
			this.button.set("disabled", false);
			if(this.logResults){
				console.log(resp);
			}
		},

		onError: function(error, ioargs){
			// summary:
			//		User over-ridable save success function for editor content.
			//		Be sure to call this.inherited(arguments) if over-riding this method.
			// resp:
			//		The response from the server, if any, in text format.
			// tags:
			//		public
			this.button.set("disabled", false);
			//if(this.logResults){
				console.error(error);
			//}
		}
	});

	// Register this plugin.
	_Plugin.registry.save = function(args){
		return new Save(args);
	};

	return Save;

});
