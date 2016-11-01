define([
	"rias",
	"../_Plugin",
	"rias/riasw/form/ToggleButton",
	"dojo/i18n!./nls/commands"
], function(rias, _Plugin, ToggleButton){

	// module:
	//		dijit/_editor/plugins/FullScreen
	var pluginsName = "rias.riasw.editor.htmleditor.plugins";

	var FullScreen = rias.declare(pluginsName + ".FullScreen", _Plugin, {
		// summary:
		//		This plugin provides FullScreen capability to the editor.  When
		//		toggled on, it will render the editor into the full window and
		//		overlay everything.  It also binds to the hotkey: CTRL-SHIFT-F11
		//		for toggling fullscreen mode.

		// zIndex: [public] Number
		//		zIndex value used for overlaying the full page.
		//		default is 5000.
		zIndex: 5000,

		// _origState: [private] Object
		//		The original view state of the editor.
		_origState: null,

		// _origiFrameState: [private] Object
		//		The original view state of the iframe of the editor.
		_origiFrameState: null,

		// _resizeHandle: [private] Object
		//		Connection point used for handling resize when window resizes.
		_resizeHandle: null,

		// isFullscreen: [const] boolean
		//		Read-Only variable used to denote of the editor is in fullscreen mode or not.
		isFullscreen: false,

		toggle: function(){
			// summary:
			//		Function to allow programmatic toggling of the view.
			this.button.set("checked", !this.button.get("checked"));
		},

		_initButton: function(){
			// summary:
			//		Over-ride for creation of the resize button.
			var strings = rias.i18n.getLocalization(pluginsName, "commands"),
				editor = this.editor;
			this.button = new ToggleButton({
				ownerRiasw: this,
				label: strings["fullScreen"],
				tooltip: strings["fullScreen"],
				ownerDocument: editor.ownerDocument,
				dir: editor.dir,
				lang: editor.lang,
				showLabel: false,
				iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "FullScreen",
				tabIndex: "-1",
				onChange: rias.hitch(this, "_setFullScreen")
			});
		},

		setEditor: function(editor){
			// summary:
			//		Over-ride for the setting of the editor.
			// editor: Object
			//		The editor to configure for this plugin to use.
			this.editor = editor;
			this._initButton();

			this.editor.addKeyHandler(rias.keys.F11, true, true, rias.hitch(this, function(e){
				// Enable the CTRL-SHIFT-F11 hotkey for fullscreen mode.
				this.toggle();
				e.stopPropagation();
				e.preventDefault();
				this.editor.defer("focus", 250);
				return true;
			}));
			this.own(rias.on(this.editor.domNode, "keydown", rias.hitch(this, "_containFocus")));
		},

		_containFocus: function(e){
			// summary:
			//		When in Full Screen mode, it's good to try and retain focus in the editor
			//		so this function is intended to try and constrain the TAB key.
			// e: Event
			//		The key event.
			// tags:
			//		private
			if(this.isFullscreen){
				var ed = this.editor;
				if(!ed.isTabIndent &&
					ed._fullscreen_oldOnKeyDown &&
					e.keyCode === rias.keys.TAB){
					// If we're in fullscreen mode, we want to take over how tab moves focus a bit.
					// to keep it within the editor since it's hiding the rest of the page.
					// IE hates changing focus IN the event handler, so need to put calls
					// in a timeout.  Gotta love IE.
					// Also need to check for alternate view nodes if present and active.
					var f = rias.dom.focusedNode;
					var avn = this._getAltViewNode();
					if(f == ed.iframe ||
						(avn && f === avn)){
						setTimeout(function(){
							ed.toolbar.focus();
						}, 10);
					}else{
						if(avn && rias.dom.getStyle(ed.iframe, "display") === "none"){
							setTimeout(function(){
								rias.dom.focus(avn);
							}, 10);
						}else{
							setTimeout(function(){
								ed.focus();
							}, 10);
						}
					}
					event.stopPropagation();
					event.preventDefault();
				}else if(ed._fullscreen_oldOnKeyDown){
					// Only call up when it's a different function.  Traps corner case event issue
					// on IE which caused stack overflow on handler cleanup.
					ed._fullscreen_oldOnKeyDown(e);
				}
			}
		},

		_resizeEditor: function(){
			// summary:
			//		Function to handle resizing the editor as the viewport
			//		resizes (window scaled)
			// tags:
			//		private
			var vp = rias.dom.getWindowBox(this.editor.ownerDocument);
			rias.dom.setMarginBox(this.editor.domNode, {
				w: vp.w,
				h: vp.h
			});

			//Adjust the internal heights too, as they can be a bit off.
			var hHeight = this.editor.getHeaderHeight();
			var fHeight = this.editor.getFooterHeight();
			var extents = rias.dom.getPadBorderExtents(this.editor.domNode);
			var fcpExtents = rias.dom.getPadBorderExtents(this.editor.iframe.parentNode);
			var fcmExtents = rias.dom.getMarginExtents(this.editor.iframe.parentNode);

			var cHeight = vp.h - (hHeight + extents.h + fHeight);
			rias.dom.setMarginBox(this.editor.iframe.parentNode, {
				h: cHeight,
				w: vp.w
			});
			rias.dom.setMarginBox(this.editor.iframe, {
				h: cHeight - (fcpExtents.h + fcmExtents.h)
			});
		},

		_getAltViewNode: function(){
			// summary:
			//		This function is intended as a hook point for setting an
			//		alternate view node for when in full screen mode and the
			//		editable iframe is hidden.
			// tags:
			//		protected.
		},

		_setFullScreen: function(full){
			// summary:
			//		Function to handle toggling between full screen and
			//		regular view.
			// tags:
			//		private

			//Alias this for shorter code.
			var ed = this.editor;
			var body = ed.ownerDocumentBody;
			var editorParent = ed.domNode.parentNode;

			var vp = rias.dom.getWindowBox(ed.ownerDocument);

			this.isFullscreen = full;

			if(full){
				//Parent classes can royally screw up this plugin, so we
				//have to set everything to position static.
				while(editorParent && editorParent !== body){
					rias.dom.addClass(editorParent, "dijitForceStatic");
					editorParent = editorParent.parentNode;
				}

				// Save off the resize function.  We want to kill its behavior.
				this._editorResizeHolder = this.editor.resize;
				ed.resize = function(){
				};

				// Try to constrain focus control.
				ed._fullscreen_oldOnKeyDown = ed.onKeyDown;
				ed.onKeyDown = rias.hitch(this, this._containFocus);

				this._origState = {};
				this._origiFrameState = {};

				// Store the basic editor state we have to restore later.
				// Not using domStyle.get here, had problems, didn't
				// give me stuff like 100%, gave me pixel calculated values.
				// Need the exact original values.
				var domNode = ed.domNode,
					rawStyle = domNode && domNode.style || {};
				this._origState = {
					width: rawStyle.width || "",
					height: rawStyle.height || "",
					top: rias.dom.getStyle(domNode, "top") || "",
					left: rias.dom.getStyle(domNode, "left") || "",
					position: rias.dom.getStyle(domNode, "position") || "static",
					marginBox: rias.dom.getMarginBox(ed.domNode)
				};

				// Store the iframe state we have to restore later.
				// Not using domStyle.get here, had problems, didn't
				// give me stuff like 100%, gave me pixel calculated values.
				// Need the exact original values.
				var iframe = ed.iframe,
					iframeStyle = iframe && iframe.style || {};

				var bc = rias.dom.getStyle(ed.iframe, "backgroundColor");
				this._origiFrameState = {
					backgroundColor: bc || "transparent",
					width: iframeStyle.width || "auto",
					height: iframeStyle.height || "auto",
					zIndex: iframeStyle.zIndex || ""
				};

				// Okay, size everything.
				rias.dom.setStyle(ed.domNode, {
					position: "absolute",
					top: "0px",
					left: "0px",
					zIndex: this.zIndex,
					width: vp.w + "px",
					height: vp.h + "px"
				});

				rias.dom.setStyle(ed.iframe, {
					height: "100%",
					width: "100%",
					zIndex: this.zIndex,
					backgroundColor: bc !== "transparent" &&
						bc !== "rgba(0, 0, 0, 0)" ? bc : "white"
				});

				rias.dom.setStyle(ed.iframe.parentNode, {
					height: "95%",
					width: "100%"
				});

				// Store the overflow state we have to restore later.
				// IE had issues, so have to check that it's defined.  Ugh.
				if(body.style && body.style.overflow){
					this._oldOverflow = rias.dom.getStyle(body, "overflow");
				}else{
					this._oldOverflow = "";
				}

				if(rias.has("ie") && !rias.has("quirks")){
					// IE will put scrollbars in anyway, html (parent of body)
					// also controls them in standards mode, so we have to
					// remove them, argh.
					if(body.parentNode &&
						body.parentNode.style &&
						body.parentNode.style.overflow){
						this._oldBodyParentOverflow = body.parentNode.style.overflow;
					}else{
						try{
							this._oldBodyParentOverflow = rias.dom.getStyle(body.parentNode, "overflow");
						}catch(e){
							this._oldBodyParentOverflow = "scroll";
						}
					}
					rias.dom.setStyle(body.parentNode, "overflow", "hidden");
				}
				rias.dom.setStyle(body, "overflow", "hidden");

				var resizer = function(){
					// function to handle resize events.
					// Will check current VP and only resize if
					// different.
					var vp = rias.dom.getWindowBox(ed.ownerDocument);
					if("_prevW" in this && "_prevH" in this){
						// No actual size change, ignore.
						if(vp.w === this._prevW && vp.h === this._prevH){
							return;
						}
					}else{
						this._prevW = vp.w;
						this._prevH = vp.h;
					}
					if(this._resizer){
						clearTimeout(this._resizer);
						delete this._resizer;
					}
					// Timeout it to help avoid spamming resize on IE.
					// Works for all browsers.
					this._resizer = setTimeout(rias.hitch(this, function(){
						delete this._resizer;
						this._resizeEditor();
					}), 10);
				};
				this._resizeHandle = rias.on(window, "resize", rias.hitch(this, resizer));

				// Also monitor for direct calls to resize and adapt editor.
				this._resizeHandle2 = rias.after(ed, "onResize", rias.hitch(this, function(){
					if(this._resizer){
						clearTimeout(this._resizer);
						delete this._resizer;
					}
					this._resizer = setTimeout(rias.hitch(this, function(){
						delete this._resizer;
						this._resizeEditor();
					}), 10);
				}));

				// Call it once to work around IE glitchiness.  Safe for other browsers too.
				this._resizeEditor();
				var dn = this.editor.toolbar.domNode;
				setTimeout(function(){
					rias.dom.scrollIntoView(dn);
				}, 250);
			}else{
				if(this._resizeHandle){
					// Cleanup resizing listeners
					this._resizeHandle.remove();
					this._resizeHandle = null;
				}
				if(this._resizeHandle2){
					// Cleanup resizing listeners
					this._resizeHandle2.remove();
					this._resizeHandle2 = null;
				}
				if(this._rst){
					clearTimeout(this._rst);
					this._rst = null;
				}

				//Remove all position static class assigns.
				while(editorParent && editorParent !== body){
					rias.dom.removeClass(editorParent, "dijitForceStatic");
					editorParent = editorParent.parentNode;
				}

				// Restore resize function
				if(this._editorResizeHolder){
					this.editor.resize = this._editorResizeHolder;
				}

				if(!this._origState && !this._origiFrameState){
					// If we actually didn't toggle, then don't do anything.
					return;
				}
				if(ed._fullscreen_oldOnKeyDown){
					ed.onKeyDown = ed._fullscreen_oldOnKeyDown;
					delete ed._fullscreen_oldOnKeyDown;
				}

				// Add a timeout to make sure we don't have a resize firing in the
				// background at the time of minimize.
				var self = this;
				setTimeout(function(){
					// Restore all the editor state.
					var mb = self._origState.marginBox;
					var oh = self._origState.height;
					if(rias.has("ie") && !rias.has("quirks")){
						body.parentNode.style.overflow = self._oldBodyParentOverflow;
						delete self._oldBodyParentOverflow;
					}
					rias.dom.setStyle(body, "overflow", self._oldOverflow);
					delete self._oldOverflow;

					rias.dom.setStyle(ed.domNode, self._origState);
					rias.dom.setStyle(ed.iframe.parentNode, {
						height: "",
						width: ""
					});
					rias.dom.setStyle(ed.iframe, self._origiFrameState);
					delete self._origState;
					delete self._origiFrameState;
					// In case it is contained in a layout and the layout changed size,
					// go ahead and call resize.
					var pWidget = rias.by(ed.domNode.parentNode);
					if(pWidget && pWidget.resize){
						pWidget.resize();
					}else{
						if(!oh || oh.indexOf("%") < 0){
							// Resize if the original size wasn't set
							// or wasn't in percent.  Timeout is to avoid
							// an IE crash in unit testing.
							setTimeout(function(){
								ed.resize({h: mb.h});
							}, 0);
						}
					}
					rias.dom.scrollIntoView(self.editor.toolbar.domNode);
				}, 100);
			}
		},

		updateState: function(){
			// summary:
			//		Over-ride for button state control for disabled to work.
			this.button.set("disabled", this.get("disabled"));
		},

		destroy: function(){
			// summary:
			//		Over-ride to ensure the resize handle gets cleaned up.
			if(this._resizeHandle){
				// Cleanup resizing listeners
				this._resizeHandle.remove();
				this._resizeHandle = null;
			}
			if(this._resizeHandle2){
				// Cleanup resizing listeners
				this._resizeHandle2.remove();
				this._resizeHandle2 = null;
			}
			if(this._resizer){
				clearTimeout(this._resizer);
				this._resizer = null;
			}
			this.inherited(arguments);
		}
	});

	// Register this plugin.
	// For back-compat accept "fullscreen" (all lowercase) too, remove in 2.0
	_Plugin.registry["fullScreen"] = _Plugin.registry["fullscreen"] = function(args){
		return new FullScreen(args);
	};

	return FullScreen;
});
