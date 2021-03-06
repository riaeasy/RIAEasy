define([
	"riasw/riaswBase",
	"../_Plugin",
	"riasw/form/ToggleButton",
	"dojo/i18n!./nls/commands"
], function(rias, _Plugin, ToggleButton){

	// module:
	//		riasw/_editor/plugins/ViewSource
	var pluginsName = "riasw.editor.htmleditor.plugins";

	var ViewSource = rias.declare(pluginsName + ".ViewSource", _Plugin, {
		// summary:
		//		This plugin provides a simple view source capability.  When view
		//		source mode is enabled, it disables all other buttons/plugins on the RTE.
		//		It also binds to the hotkey: CTRL-SHIFT-F11 for toggling ViewSource mode.

		// stripScripts: [public] Boolean
		//		Boolean flag used to indicate if script tags should be stripped from the document.
		//		Defaults to true.
		stripScripts: true,

		// stripComments: [public] Boolean
		//		Boolean flag used to indicate if comment tags should be stripped from the document.
		//		Defaults to true.
		stripComments: true,

		// stripComments: [public] Boolean
		//		Boolean flag used to indicate if iframe tags should be stripped from the document.
		//		Defaults to true.
		stripIFrames: true,

		// readOnly: [const] Boolean
		//		Boolean flag used to indicate if the source view should be readonly or not.
		//		Cannot be changed after initialization of the plugin.
		//		Defaults to false.
		readOnly: false,

		// _fsPlugin: [private] Object
		//		Reference to a registered fullscreen plugin so that viewSource knows
		//		how to scale.
		_fsPlugin: null,

		toggle: function(){
			// summary:
			//		Function to allow programmatic toggling of the view.

			// For Webkit, we have to focus a very particular way.
			// when swapping views, otherwise focus doesn't shift right
			// but can't focus this way all the time, only for VS changes.
			// If we did it all the time, buttons like bold, italic, etc
			// break.
			if(rias.has("webkit")){
				this._vsFocused = true;
			}
			this.button.set("checked", !this.button.get("checked"));

		},

		_initButton: function(){
			// summary:
			//		Over-ride for creation of the resize button.
			var strings = rias.i18n.getLocalization(pluginsName, "commands"),
				editor = this.editor;
			this.button = new ToggleButton({
				//ownerDocument: editor.ownerDocument,
				ownerRiasw: this,
				disabled: this.get("disabled"),
				readOnly: this.get("readOnly"),
				label: strings.viewSource,
				tooltip: strings.viewSource,
				dir: editor.dir,
				lang: editor.lang,
				showLabel: false,
				iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "ViewSource",
				tabIndex: "-1",
				onChange: rias.hitch(this, "_showSource")
			});

			// Make sure readonly mode doesn't make the wrong cursor appear over the button.
			//this.button.set("readOnly", false);
		},


		setEditor: function(/*Editor*/ editor){
			// summary:
			//		Tell the plugin which Editor it is associated with.
			// editor: Object
			//		The editor object to attach the print capability to.
			this.editor = editor;
			this._initButton();

			this.editor.addKeyHandler(rias.keys.F12, true, true, rias.hitch(this, function(e){
				// Move the focus before switching
				// It'll focus back.  Hiding a focused
				// node causes issues.
				this.button.focus();
				this.toggle();
				e.stopPropagation();
				e.preventDefault();

				// Call the focus shift outside of the handler.
				setTimeout(rias.hitch(this, function(){
					// Focus the textarea... unless focus has moved outside of the editor completely during the timeout.
					// Since we override focus, so we just need to call it.
					if(this.editor.focused){
						this.editor.focus();
					}
				}), 100);
			}));
		},

		_showSource: function(_shown){
			// summary:
			//		Function to toggle between the source and RTE views.
			// source: boolean
			//		Boolean value indicating if it should be in source mode or not.
			// tags:
			//		private
			var ed = this.editor;
			var edPlugins = ed._plugins;
			var html;
			this._sourceShown = _shown;
			var self = this;
			try{
				if(!this.sourceArea){
					this._createSourceView();
				}
				if(_shown){
					// Update the QueryCommandEnabled function to disable everything but
					// the source view mode.  Have to over-ride a function, then kick all
					// plugins to check their state.
					ed._sourceQueryCommandEnabled = ed.queryCommandEnabled;
					ed.queryCommandEnabled = function(cmd){
						return cmd.toLowerCase() === "viewsource";
					};
					ed.onDisplayChanged();
					html = ed.get("value");
					html = this._filter(html);
					ed.set("value", html);
					rias.forEach(edPlugins, function(p){
						// Turn off any plugins not controlled by queryCommandenabled.
						if(p && !(p instanceof ViewSource) && p.isInstanceOf(_Plugin)){
							p.set("disabled", true);
						}
					});

					// We actually do need to trap this plugin and adjust how we
					// display the textarea.
					if(this._fsPlugin){
						this._fsPlugin._getAltViewNode = function(){
							return self.sourceArea;
						};
					}

					this.sourceArea.value = html;

					// Since neither iframe nor textarea have margin, border, or padding,
					// just set sizes equal.
					this.sourceArea.style.height = ed.iframe.style.height;
					this.sourceArea.style.width = ed.iframe.style.width;

					// Hide the iframe and show the HTML source <textarea>.  But don't use display:none because
					// that loses scroll position, and also causes weird problems on FF (see #18607).
					//ed.iframe.parentNode.style.position = "relative";
					rias.dom.setStyle(ed.iframe, {
						//position: "absolute",
						//top: 0,
						display: "none"
					});
					rias.dom.setStyle(this.sourceArea, {
						display: "block"
					});

					//Trigger a check for command enablement/disablement.
					//ed.onNormalizedDisplayChanged();
					ed.publish(ed.id + "_normalizedDisplayChanged", [ed]);

					ed.__oldGetValue = ed.getValue;
					ed.getValue = function(){
						var txt = self.sourceArea.value;
						txt = self._filter(txt);
						return txt;
					};

					this._setListener = rias.after(ed, "_setValueAttr", function(htmlTxt){
						htmlTxt = htmlTxt || "";
						htmlTxt = self._filter(htmlTxt);
						self.sourceArea.value = htmlTxt;
					}, true);
				}else{
					// First check that we were in source view before doing anything.
					// corner case for being called with a value of false and we hadn't
					// actually been in source display mode.
					if(!ed._sourceQueryCommandEnabled){
						return;
					}

					// Remove the set listener.
					this._setListener.remove();
					delete this._setListener;

					if(this._resizeHandle){
						this._resizeHandle.remove();
						delete this._resizeHandle;
					}

					if(ed.__oldGetValue){
						ed.getValue = ed.__oldGetValue;
						delete ed.__oldGetValue;
					}

					// Restore all the plugin buttons state.
					ed.queryCommandEnabled = ed._sourceQueryCommandEnabled;
					if(!this._readOnly){
						html = this.sourceArea.value;
						html = this._filter(html);
						ed.beginEditing();
						ed.set("value", html);
						ed.endEditing();
					}

					rias.forEach(edPlugins, function(p){
						// Turn back on any plugins we turned off.
						if(p && p.isInstanceOf(_Plugin)){
							p.set("disabled", false);
						}
					});

					rias.dom.setStyle(this.sourceArea, "display", "none");
					rias.dom.setStyle(ed.iframe, {
						//position: "relative",
						display: "block"
					});
					delete ed._sourceQueryCommandEnabled;

					//Trigger a check for command enablement/disablement.
					ed.onDisplayChanged();
				}
				// Call a delayed resize to wait for some things to display in header/footer.
				setTimeout(function(){
					// Make resize calls.
					ed.resize();
				}, 300);
			}catch(e){
				console.error(e);
			}
		},

		updateState: function(){
			// summary:
			//		Over-ride for button state control for disabled to work.
			this.button.set("disabled", this.get("disabled"));
		},

		_createSourceView: function(){
			// summary:
			//		Internal function for creating the source view area.
			// tags:
			//		private
			var ed = this.editor;
			var edPlugins = ed._plugins;
			this.sourceArea = rias.dom.create("textarea");
			if(this.readOnly){
				rias.dom.setAttr(this.sourceArea, "readOnly", true);
				this._readOnly = true;
			}
			rias.dom.setStyle(this.sourceArea, {
				display: "none",
				resize: "none",
				padding: "0px",
				margin: "0px",
				borderWidth: "0px",
				borderStyle: "none"
			});
			rias.dom.setAttr(this.sourceArea, "aria-label", this.editor.id);

			rias.dom.place(this.sourceArea, ed.iframe, "after");

			if(rias.has("ie") && ed.iframe.parentNode.lastChild !== ed.iframe){
				// There's some weirdo div in IE used for focus control
				// But is messed up scaling the textarea if we don't config
				// it some so it doesn't have a varying height.
				rias.dom.setStyle(ed.iframe.parentNode.lastChild, {
					width: "0px",
					height: "0px",
					padding: "0px",
					margin: "0px",
					borderWidth: "0px",
					borderStyle: "none"
				});
			}

			// We also need to take over editor focus a bit here, so that focus calls to
			// focus the editor will focus to the right node when VS is active.
			ed._viewsource_oldFocus = ed.focus;
			var self = this;
			ed.focus = function(){
				if(self._sourceShown){
					self.setSourceAreaCaret();
				}else{
					try{
						if(this._vsFocused){
							delete this._vsFocused;
							// Must focus edit node in this case (webkit only) or
							// focus doesn't shift right, but in normal
							// cases we focus with the regular function.
							rias.dom.focus(ed.editNode);
						}else{
							ed._viewsource_oldFocus();
						}
					}catch(e){
						console.error("ViewSource focus code error: " + e);
					}
				}
			};

			var i, p;
			for(i = 0; i < edPlugins.length; i++){
				// We actually do need to trap this plugin and adjust how we
				// display the textarea.
				p = edPlugins[i];
				if(p && (p.declaredClass === pluginsName + ".FullScreen")){
					this._fsPlugin = p;
					break;
				}
			}
			if(this._fsPlugin){
				// Found, we need to over-ride the alt-view node function
				// on FullScreen with our own, chain up to parent call when appropriate.
				this._fsPlugin._viewsource_getAltViewNode = this._fsPlugin._getAltViewNode;
				this._fsPlugin._getAltViewNode = function(){
					return self._sourceShown ? self.sourceArea : this._viewsource_getAltViewNode();
				};
			}

			// Listen to the source area for key events as well, as we need to be able to hotkey toggle
			// it from there too.
			this.own(rias.on(this.sourceArea, "keydown", rias.hitch(this, function(e){
				if(this._sourceShown && e.keyCode === rias.keys.F12 && e.ctrlKey && e.shiftKey){
					this.button.focus();
					this.button.set("checked", false);
					setTimeout(rias.hitch(this, function(){
						ed.focus();
					}), 100);
					e.stopPropagation();
					e.preventDefault();
				}
			})));
		},

		_stripScripts: function(html){
			// summary:
			//		Strips out script tags from the HTML used in editor.
			// html: String
			//		The HTML to filter
			// tags:
			//		private
			if(html){
				// Look for closed and unclosed (malformed) script attacks.
				html = html.replace(/<\s*script[^>]*>((.|\s)*?)<\\?\/\s*script\s*>/ig, "");
				html = html.replace(/<\s*script\b([^<>]|\s)*>?/ig, "");
				html = html.replace(/<[^>]*=(\s|)*[("|')]javascript:[^$1][(\s|.)]*[$1][^>]*>/ig, "");
			}
			return html;
		},

		_stripComments: function(html){
			// summary:
			//		Strips out comments from the HTML used in editor.
			// html: String
			//		The HTML to filter
			// tags:
			//		private
			if(html){
				html = html.replace(/<!--(.|\s){1,}?-->/g, "");
			}
			return html;
		},

		_stripIFrames: function(html){
			// summary:
			//		Strips out iframe tags from the content, to avoid iframe script
			//		style injection attacks.
			// html: String
			//		The HTML to filter
			// tags:
			//		private
			if(html){
				html = html.replace(/<\s*iframe[^>]*>((.|\s)*?)<\\?\/\s*iframe\s*>/ig, "");
			}
			return html;
		},

		_filter: function(html){
			// summary:
			//		Internal function to perform some filtering on the HTML.
			// html: String
			//		The HTML to filter
			// tags:
			//		private
			if(html){
				if(this.stripScripts){
					html = this._stripScripts(html);
				}
				if(this.stripComments){
					html = this._stripComments(html);
				}
				if(this.stripIFrames){
					html = this._stripIFrames(html);
				}
			}
			return html;
		},

		setSourceAreaCaret: function(){
			// summary:
			//		Internal function to set the caret in the sourceArea
			//		to 0x0
			var elem = this.sourceArea;
			rias.dom.focus(elem);
			if(this._sourceShown && !this.readOnly){
				if(elem.setSelectionRange){
					elem.setSelectionRange(0, 0);
				}else if(this.sourceArea.createTextRange){
					// IE
					var range = elem.createTextRange();
					range.collapse(true);
					range.moveStart("character", -99999); // move to 0
					range.moveStart("character", 0); // delta from 0 is the correct position
					range.moveEnd("character", 0);
					range.select();
				}
			}
		},

		_onDestroy: function(){
			if(this._resizer){
				clearTimeout(this._resizer);
				delete this._resizer;
			}
			if(this._resizeHandle){
				this._resizeHandle.remove();
				delete this._resizeHandle;
			}
			if(this._setListener){
				this._setListener.remove();
				delete this._setListener;
			}
			this.inherited(arguments);
		}
	});

	// Register this plugin.
	// For back-compat accept "viewsource" (all lowercase) too, remove in 2.0
	_Plugin.registry.viewSource = _Plugin.registry.viewsource = function(args){
		return new ViewSource(args);
	};

	return ViewSource;
});
