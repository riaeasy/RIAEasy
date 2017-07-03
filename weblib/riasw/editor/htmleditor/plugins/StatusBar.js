define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"../_Plugin",
	"riasw/layout/Resizer"
], function(rias, _WidgetBase, _TemplatedMixin, _Plugin, Resizer) {

	var pluginsName = "riasw.editor.htmleditor.plugins";

	var _StatusBar = rias.declare(pluginsName + "._StatusBar", [_WidgetBase, _TemplatedMixin],{
		// templateString: String
		//		Template for the widget.  Currently using table to get the alignment behavior and
		//		bordering I wanted.  Would prefer not to use table, though.
		templateString:
			'<div class="riaswEditorStatusBar">' +
				'<table><tbody><tr>'+
					'<td class="riaswEditorStatusBarText" tabindex="-1" aria-role="presentation" aria-live="aggressive">' +
						'<span data-dojo-attach-point="barContent">&nbsp;</span>' +
					'</td><td>' +
						'<span data-dojo-attach-point="handle"></span>' +
					'</td>' +
				'</tr></tbody><table>'+
			'</div>',

		_getValueAttr: function(){
			// summary:
			//		Over-ride to get the value of the status bar from the widget.
			// tags:
			//		Protected
			return this.barContent.innerHTML;
		},

		_setValueAttr: function(str){
			// summary:
			//		Over-ride to set the value of the status bar from the widget.
			//		If no value is set, it is replaced with a non-blocking space.
			// str: String
			//		The string to set as the status bar content.
			// tags:
			//		protected
			if(str){
				str = rias.trim(str);
				if(!str){
					str = "&nbsp;";
				}
			}else{
				str = "&nbsp;";
			}
			this.barContent.innerHTML = str;
		}
	});

	var StatusBar = rias.declare(pluginsName + ".StatusBar", _Plugin, {
		// summary:
		//		This plugin provides StatusBar capability to the editor.
		//		Basically a footer bar where status can be published.  It also
		//		puts a resize handle on the status bar, allowing you to resize the
		//		editor via mouse.

		// _statusBar: [protected]
		//		The status bar and resizer.
		//_statusBar: null,

		// resizable: [public] Boolean
		//		Flag indicating that a resizer should be shown or not.  Default is true.
		//		There are cases (such as using center pane border container to autoresize the editor
		//		That a resizer is not valued.
		resizable: true,

		setEditor: function(editor){
			// summary:
			//		Over-ride for the setting of the editor.
			// editor: Object
			//		The editor to configure for this plugin to use.
			this.editor = editor;
			this._statusBar = new _StatusBar({
				ownerRiasw: this
			});
			if(this.resizable){
				this._resizeHandle = new Resizer({
					ownerRiasw: this,
					targetWidget: this.editor,
					activeResize: true
				}, this._statusBar.handle);
				this._resizeHandle.startup();
			}else{
				rias.dom.setStyle(this._statusBar.handle.parentNode, "display", "none");
			}
			var pos = null;
			if(editor.footer.lastChild){
				pos = "after";
			}
			rias.dom.place(this._statusBar.domNode, editor.footer.lastChild || editor.footer, pos);
			this._statusBar.startup();
			this.editor.statusBar = this;

			// Register a pub-sub event to listen for status bar messages, in addition to being available off
			// the editor as a property '_statusBar'
			this._msgListener = rias.subscribe(this.editor.id + "_statusBar", rias.hitch(this, this._setValueAttr));
		},

		_getValueAttr: function(){
			// summary:
			//		Over-ride to get the value of the status bar from the widget.
			// tags:
			//	protected
			return this._statusBar.get("value");
		},

		_setValueAttr: function(str){
			// summary:
			//		Over-ride to set the value of the status bar from the widget.
			//		If no value is set, it is replaced with a non-blocking space.
			// str: String
			//	The String value to set in the bar.
			// tags:
			//		protected
			this._statusBar.set("value", str);
		},

		set: function(attr, val){
			// summary:
			//		Quick and dirty implementation of 'set' pattern
			// attr:
			//		The attribute to set.
			// val:
			//		The value to set it to.
			if(attr){
				var fName = "_set" + rias.upperCaseFirst(attr) + "Attr";
				if(rias.isFunction(this[fName])){
					this[fName](val);
				}else{
					this[attr] = val;
				}
			}
		},

		get: function(attr){
			// summary:
			//		Quick and dirty implementation of 'get' pattern
			// attr:
			//		The attribute to get.
			if(attr){
				var fName = "_get" + attr.charAt(0).toUpperCase() + attr.substring(1, attr.length) + "Attr";
				var f = this[fName];
				if(rias.isFunction(f)){
					return this[fName]();
				}else{
					return this[attr];
				}
			}
			return null;
		},

		_onDestroy: function(){
			// summary:
			//		Over-ride to clean up the breadcrumb toolbar.
			if(this._statusBar){
				this._statusBar.destroy();
				delete this._statusBar;
			}
			if(this._resizeHandle){
				this._resizeHandle.destroy();
				delete this._resizeHandle;
			}
			if(this._msgListener){
				this._msgListener.remove();
				this._msgListener = null;
			}
			delete this.editor.statusBar;

			this.inherited(arguments);
		}
	});

// For monkey patching
	StatusBar._StatusBar = _StatusBar;

// Register this plugin.
	_Plugin.registry.statusBar = _Plugin.registry.statusbar = function(args){
		return new StatusBar(args);
	};

	return StatusBar;

});
