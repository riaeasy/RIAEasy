define([
	"rias",
	"../_Plugin"
], function(rias, _Plugin){

	// module:
	//		dijit/_editor/plugins/AlwaysShowToolbar
	var pluginsName = "rias.riasw.editor.htmleditor.plugins";

	return rias.declare(pluginsName + ".AlwaysShowToolbar", _Plugin, {
		// summary:
		//		This plugin is required for Editors in auto-expand mode.
		//		It handles the auto-expansion as the user adds/deletes text,
		//		and keeps the editor's toolbar visible even when the top of the editor
		//		has scrolled off the top of the viewport (usually when editing a long
		//		document).
		// description:
		//		Specify this in extraPlugins (or plugins) parameter and also set
		//		height to "".
		// example:
		//	|	<script type="dojo/require">
		//	|		AlwaysShowToolbar: "dijit/_editor/plugins/AlwaysShowToolbar"
		//	|	</script>
		//	|	<div data-dojo-type="dijit/Editor" height=""
		//	|			data-dojo-props="extraPlugins: [AlwaysShowToolbar]">

		// _handleScroll: Boolean
		//		Enables/disables the handler for scroll events
		_handleScroll: true,

		setEditor: function(e){
			// Overrides _Plugin.setEditor().
			if(!e.iframe){
				console.log('Port AlwaysShowToolbar plugin to work with Editor without iframe');
				return;
			}

			this.editor = e;

			e.onLoadDeferred.then(rias.hitch(this, this.enable));
		},

		enable: function(d){
			// summary:
			//		Enable plugin.  Called when Editor has finished initializing.
			// tags:
			//		private

			this._updateHeight();
			this.own(
				rias.on(window, 'scroll', rias.hitch(this, "globalOnScrollHandler"))//,
				//this.editor.on('NormalizedDisplayChanged', rias.hitch(this, "_updateHeight"))
			);
			this.subscribe(this.editor.id + "_normalizedDisplayChanged", function(){
				this._updateHeight();
			});
			return d;
		},

		_updateHeight: function(){
			// summary:
			//		Updates the height of the editor area to fit the contents.
			var e = this.editor;
			if(!e.isLoaded){
				return;
			}
			if(e.height){
				return;
			}

			var height = rias.dom.getMarginSize(e.editNode).h;
			if(rias.has("opera")){
				height = e.editNode.scrollHeight;
			}
			// console.debug('height',height);
			// alert(this.editNode);

			//height maybe zero in some cases even though the content is not empty,
			//we try the height of body instead
			if(!height){
				height = rias.dom.getMarginSize(e.document.body).h;
			}

			if(this._fixEnabled){
				// #16204: add toolbar height when it is fixed aka "stuck to the top of the screen" to prevent content from cutting off during autosizing.
				// Seems like _updateHeight should be taking the intitial margin height from a more appropriate node that includes the marginTop set in globalOnScrollHandler.
				height += rias.dom.getMarginSize(this.editor.header).h;
			}

			if(height == 0){
				console.debug("Can not figure out the height of the editing area!");
				return; //prevent setting height to 0
			}
			if(rias.has("ie") <= 7 && this.editor.minHeight){
				var min = parseInt(this.editor.minHeight);
				if(height < min){
					height = min;
				}
			}
			if(height != this._lastHeight){
				this._lastHeight = height;
				// this.editorObject.style.height = this._lastHeight + "px";
				rias.dom.setMarginBox(e.iframe, { h: this._lastHeight });
			}
		},

		// _lastHeight: Integer
		//		Height in px of the editor at the last time we did sizing
		_lastHeight: 0,

		globalOnScrollHandler: function(){
			// summary:
			//		Handler for scroll events that bubbled up to `<html>`
			// tags:
			//		private

			var isIE6 = rias.has("ie") < 7;
			if(!this._handleScroll){
				return;
			}
			var tdn = this.editor.header;
			if(!this._scrollSetUp){
				this._scrollSetUp = true;
				this._scrollThreshold = rias.dom.position(tdn, true).y;
			}

			var scrollPos = rias.dom.docScroll(this.editor.ownerDocument).y;
			var s = tdn.style;

			if(scrollPos > this._scrollThreshold && scrollPos < this._scrollThreshold + this._lastHeight){
				// console.debug(scrollPos);
				if(!this._fixEnabled){
					var tdnbox = rias.dom.getMarginSize(tdn);
					this.editor.iframe.style.marginTop = tdnbox.h + "px";

					if(isIE6){
						s.left = rias.dom.position(tdn).x;
						if(tdn.previousSibling){
							this._IEOriginalPos = ['after', tdn.previousSibling];
						}else if(tdn.nextSibling){
							this._IEOriginalPos = ['before', tdn.nextSibling];
						}else{
							this._IEOriginalPos = ['last', tdn.parentNode];
						}
						this.editor.ownerDocumentBody.appendChild(tdn);
						rias.dom.addClass(tdn, 'dijitIEFixedToolbar');
					}else{
						s.position = "fixed";
						s.top = "0px";
					}

					rias.dom.setMarginBox(tdn, { w: tdnbox.w });
					s.zIndex = 2000;
					this._fixEnabled = true;
				}
				// if we're showing the floating toolbar, make sure that if
				// we've scrolled past the bottom of the editor that we hide
				// the toolbar for this instance of the editor.

				// TODO: when we get multiple editor toolbar support working
				// correctly, ensure that we check this against the scroll
				// position of the bottom-most editor instance.
				var eHeight = (this.height) ? parseInt(this.editor.height) : this.editor._lastHeight;
				s.display = (scrollPos > this._scrollThreshold + eHeight) ? "none" : "";
			}else if(this._fixEnabled){
				this.editor.iframe.style.marginTop = '';
				s.position = "";
				s.top = "";
				s.zIndex = "";
				s.display = "";
				if(isIE6){
					s.left = "";
					rias.dom.removeClass(tdn, 'dijitIEFixedToolbar');
					if(this._IEOriginalPos){
						rias.dom.place(tdn, this._IEOriginalPos[1], this._IEOriginalPos[0]);
						this._IEOriginalPos = null;
					}else{
						rias.dom.place(tdn, this.editor.iframe, 'before');
					}
				}
				s.width = "";
				this._fixEnabled = false;
			}
		},

		destroy: function(){
			// Overrides _Plugin.destroy().   TODO: call this.inherited() rather than repeating code.
			this._IEOriginalPos = null;
			this._handleScroll = false;
			this.inherited(arguments);

			if(rias.has("ie") < 7){
				rias.dom.removeClass(this.editor.header, 'dijitIEFixedToolbar');
			}
		}
	});

});
