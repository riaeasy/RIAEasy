define([
	"riasw/riaswBase",
	"../_Plugin",
	"./_SmileyPalette",
	"riasw/form/Button",
	"dojo/i18n!./nls/Smiley"
], function(rias, _Plugin, _SmileyPalette, Button) {

	//rias.experimental("dojox.editor.plugins.Smiley");
	var pluginsName = "riasw.editor.htmleditor.plugins";

	var Smiley = rias.declare(pluginsName + ".Smiley", _Plugin, {
		// summary:
		//		This plugin allows the user to select from emoticons or "smileys"
		//		to insert at the current cursor position.
		// description:
		//		The commands provided by this plugin are:
		//
		//		- smiley - inserts the selected emoticon

		// emoticonMarker:
		//		a marker for emoticon wrap like [:-)] for regexp convienent
		//		when a message which contains an emoticon stored in a database or view source, this marker include also
		//		but when user enter an emoticon by key board, user don't need to enter this marker.
		//		also emoticon definition character set can not contains this marker
		emoticonMarker: '[]',

		emoticonImageClass: 'riaswEditorEmotion',

		_initButton: function(){
			this.dropDown = new _SmileyPalette({
				ownerRiasw: this
			});
			var self = this;
			this.after(this.dropDown, "onChange", function(ascii){
				self.button.closeDropDown();
				self.editor.focus();
				//
				ascii = self.emoticonMarker.charAt(0) + ascii + self.emoticonMarker.charAt(1);
				self.editor.execCommand("inserthtml", ascii);
			}, true);
			this.i18n = rias.i18n.getLocalization(pluginsName, "Smiley");
			this.button = new Button({
				ownerRiasw: this,
				disabled: this.get("disabled"),
				readOnly: this.get("readOnly"),
				label: this.i18n.smiley,
				showLabel: false,
				tooltip: this.i18n.smiley,
				iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "Smiley",
				tabIndex: "-1",
				dropDown: this.dropDown
			});
			this.emoticonImageRegexp = new RegExp("class=(\"|\')" + this.emoticonImageClass + "(\"|\')");
			this._setup();
		},

		_setup: function(){
			// summary:
			//		Over-ridable function that connects tag specific events.
			this.editor.onLoadDeferred.then(rias.hitch(this, function(){
				setTimeout(rias.hitch(this, function() {
					this._applyStyles();
				}), 100);
			}));
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
					var style = "@media screen {\n" +
						"\t.riaswEditorEmotion {\n" +
						"\t\tvertical-align: middle;\n" +
						"\t}\n" +
						"}\n";
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
			this.editor.contentPreFilters.push(rias.hitch(this, this._preFilterEntities));
			this.editor.contentPostFilters.push(rias.hitch(this, this._postFilterEntities));

			if(rias.has("ff")){
				// This is a workaround for a really odd Firefox bug with
				// leaving behind phantom cursors when deleting smiley images.
				// See: #13299
				var deleteHandler = function(){
					// have to use timers here because the event has to happen
					// (bubble), then we can poke the dom.
					setTimeout(function(){
						if(editor.editNode){
							rias.dom.setStyle(editor.editNode, "opacity", "0.99");
							// Allow it to apply, then undo it to trigger cleanup of those
							// phantoms.
							setTimeout(function(){
								if(editor.editNode) {
									rias.dom.setStyle(editor.editNode, "opacity", "");
								}
							}, 0);
						}
					}, 0);
					return true;
				};
				this.editor.onLoadDeferred.then(rias.hitch(this, function(){
					this.editor.addKeyHandler(rias.keys.DELETE, false, false, deleteHandler);
					this.editor.addKeyHandler(rias.keys.BACKSPACE, false, false, deleteHandler);
				}));
			}
		},

		_preFilterEntities: function(/*String*/ value){
			// summary:
			//		A function to filter out emoticons into their UTF-8 character form
			//		displayed in the editor.  It gets registered with the preFilters
			//		of the editor.
			// value: String
			//		content passed in
			// tags:
			//		private.

			return value.replace(/\[([^\]]*)\]/g, rias.hitch(this, this._decode));
		},

		_postFilterEntities: function(/*String*/ value){
			// summary:
			//		A function to filter out emoticons into encoded form so they
			//		are properly displayed in the editor.  It gets registered with the
			//		postFilters of the editor.
			// value: String
			//		content passed in
			// tags:
			//		private.
			return value.replace(/<img [^>]*>/gi, rias.hitch(this, this._encode));
		},

		_decode: function(str, ascii){
			// summary:
			//		Pre-filter for editor to convert strings like [:-)] into an `<img>` of the corresponding smiley
			var emoticon = _SmileyPalette.Emoticon.fromAscii(ascii);
			return emoticon ? emoticon.imgHtml(this.emoticonImageClass) : str;
		},

		_encode: function(str){
			// summary:
			//		Post-filter for editor to convert `<img>` nodes of smileys into strings like [:-)]

			// Each <img> node has an alt tag with it's ascii representation, so just use that.
			// TODO: wouldn't this be easier as a postDomFilter ?
			if(str.search(this.emoticonImageRegexp) > -1){
				return this.emoticonMarker.charAt(0) + str.replace(/(<img [^>]*)alt="([^"]*)"([^>]*>)/, "$2") + this.emoticonMarker.charAt(1);
			}
			else{
				return str;
			}
		}

	});

// Register this plugin.
	_Plugin.registry.smiley = function(args){
		return new Smiley(args);
	};

	return Smiley;

});
