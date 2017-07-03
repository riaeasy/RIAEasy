define([
	"riasw/riaswBase",
	"../_Plugin",
	"riasw/form/ToggleButton",
	"dojo/i18n!./nls/ShowBlockNodes"
], function(rias, _Plugin, ToggleButton) {

	var pluginsName = "riasw.editor.htmleditor.plugins";

	var ShowBlockNodes = rias.declare(pluginsName + ".ShowBlockNodes", _Plugin, {
		// summary:
		//		This plugin provides ShowBlockNodes capability to the editor.  When
		//		clicked, the document in the editor will apply a class to specific
		//		block nodes to make them visible in the layout.  This info is not
		//		exposed/extracted when the editor value is obtained, it is purely for help
		//		while working on the page.

		// Over-ride indicating that the command processing is done all by this plugin.
		useDefaultCommand: false,

		// _styled: [private] boolean
		//		Flag indicating the document has had the style updates applied.
		_styled: false,

		_initButton: function(){
			// summary:
			//		Over-ride for creation of the preview button.
			var strings = rias.i18n.getLocalization(pluginsName, "ShowBlockNodes");
			this.button = new ToggleButton({
				ownerRiasw: this,
				disabled: this.get("disabled"),
				readOnly: this.get("readOnly"),
				label: strings.showBlockNodes,
				tooltip: strings.showBlockNodes,
				showLabel: false,
				iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "ShowBlockNodes",
				tabIndex: "-1",
				onChange: rias.hitch(this, "_showBlocks")
			});
			this.editor.addKeyHandler(rias.keys.F9, true, true, rias.hitch(this, this.toggle));
		},
		setEditor: function(editor){
			// summary:
			//		Over-ride for the setting of the editor.
			// editor: Object
			//		The editor to configure for this plugin to use.
			this.editor = editor;
			this._initButton();
		},

		updateState: function(){
			// summary:
			//		Over-ride for button state control for disabled to work.
			this.button.set("disabled", this.get("disabled"));
		},

		toggle: function(){
			// summary:
			//		Function to allow programmatic toggling of the view.
			this.button.set("checked", !this.button.get("checked"));
		},

		_showBlocks: function(show){
			// summary:
			//		Function to trigger printing of the editor document
			// tags:
			//		private
			var doc = this.editor.document;
			if(!this._styled){
				try{
					//Attempt to inject our specialized style rules for doing this.
					this._styled = true;

					var style = "";
					var blocks = ["div", "p", "ul", "ol", "table", "h1",
						"h2", "h3", "h4", "h5", "h6", "pre", "dir", "center",
						"blockquote", "form", "fieldset", "address", "object",
						"pre", "hr", "ins", "noscript", "li", "map", "button",
						"dd", "dt"];

					var template = "@media screen {\n" +
						"\t.editorShowBlocks {TAG} {\n" +
						"\t\tbackground-image: url({MODURL}/images/blockelems/{TAG}.gif);\n" +
						"\t\tbackground-repeat: no-repeat;\n"	+
						"\t\tbackground-position: top left;\n" +
						"\t\tborder-width: 1px;\n" +
						"\t\tborder-style: dashed;\n" +
						"\t\tborder-color: #D0D0D0;\n" +
						"\t\tpadding-top: 15px;\n" +
						"\t\tpadding-left: 15px;\n" +
						"\t}\n" +
						"}\n";

					rias.forEach(blocks, function(tag){
						style += template.replace(/\{TAG\}/gi, tag);
					});

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
							var proto = location.protocol;
							var hostn = location.host;
							bUrl = 	proto + "//" + hostn;
						}else{
							bUrl = this._calcBaseUrl(location.href);
						}
						if(bUrl[bUrl.length - 1] !== "/" && modurl.charAt(0) !== "/"){
							bUrl += "/";
						}
						modurl = bUrl + modurl;
					}
					// Update all the urls.
					style = style.replace(/\{MODURL\}/gi, modurl);
					if(!rias.has("ie")){
						var sNode = doc.createElement("style");
						sNode.appendChild(doc.createTextNode(style));
						doc.getElementsByTagName("head")[0].appendChild(sNode);
					}else{
						var ss = doc.createStyleSheet("");
						ss.cssText = style;
					}
				}catch(e){
					console.error(e);
				}
			}

			// Apply/remove the classes based on state.
			if(show){
				rias.dom.addClass(this.editor.editNode, "editorShowBlocks");
			}else{
				rias.dom.removeClass(this.editor.editNode, "editorShowBlocks");
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
		}
	});

// Register this plugin.
	_Plugin.registry.showBlockNodes = _Plugin.registry.showblocknodes = function(args){
		return new ShowBlockNodes(args);
	};

	return ShowBlockNodes;

});
