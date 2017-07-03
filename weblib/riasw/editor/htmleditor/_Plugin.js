define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/form/Button"
], function(rias, _WidgetBase, Button){

	var riaswType = "riasw.editor._Plugin";
	var _Plugin = rias.declare(riaswType, _WidgetBase, {
		// summary:
		//		Base class for a "plugin" to the editor, which is usually
		//		a single button on the Toolbar and some associated code

		/*constructor: function(args){
			// summary:
			//		Create the plugin.
			// args: Object?
			//		Initial settings for any of the attributes.

			this.params = args || {};
			rias.mixin(this, this.params);
			this._attrPairNames = {};
		},*/

		// editor: [const] Editor
		//		Points to the parent editor
		editor: null,

		// iconClassPrefix: [const] String
		//		The CSS class name for the button node is formed from `iconClassPrefix` and `command`
		iconClassPrefix: "riaswEditorIcon",

		// button: _WidgetBase?
		//		Pointer to `riasw/form/Button` or other widget (ex: `riasw/form/FilteringSelect`)
		//		that is added to the toolbar to control this plugin.
		//		If not specified, will be created on initialization according to `buttonClass`
		button: null,

		// command: String
		//		String like "insertUnorderedList", "outdent", "justifyCenter", etc. that represents an editor command.
		//		Passed to editor.execCommand() if `useDefaultCommand` is true.
		command: "",

		// useDefaultCommand: Boolean
		//		If true, this plugin executes by calling Editor.execCommand() with the argument specified in `command`.
		useDefaultCommand: true,

		// buttonClass: Widget Class
		//		Class of widget (ex: riasw.form.Button or riasw/form/FilteringSelect)
		//		that is added to the toolbar to control this plugin.
		//		This is used to instantiate the button, unless `button` itself is specified directly.
		buttonClass: Button,

		// disabled: Boolean
		//		Flag to indicate if this plugin has been disabled and should do nothing
		//		helps control button state, among other things.  Set via the setter api.
		disabled: false,

		_onDestroy: function(){
			if(this.dropDown && this.dropDown.getOwnerRiasw){
				///有可能尚未 open，dropDown 还是 params。
				if(this.dropDown.getOwnerRiasw() === this){
					rias.destroy(this.dropDown);///如果是 属于 this 的，可以让 inherited 自动释放，如果不是，则不应该 destroy
				}
				delete this.dropDown;
			}

			this.inherited(arguments);
		},

		getLabel: function(/*String*/key){
			// summary:
			//		Returns the label to use for the button
			// tags:
			//		private
			return this.editor.commands[key];		// String
		},
		_initButton: function(){
			// summary:
			//		Initialize the button or other widget that will control this plugin.
			//		This code only works for plugins controlling built-in commands in the editor.
			// tags:
			//		protected extension
			if(this.command.length){
				var label = this.getLabel(this.command),
					editor = this.editor,
					className = this.iconClassPrefix + " " + this.iconClassPrefix + this.command.charAt(0).toUpperCase() + this.command.substr(1);
				if(!this.button){
					var props = rias.mixin({
						//ownerDocument: editor.ownerDocument,
						ownerRiasw: this,
						disabled: this.get("disabled"),
						readOnly: this.get("readOnly"),
						label: label,
						tooltip: label,
						dir: editor.dir,
						lang: editor.lang,
						showLabel: false,
						iconClass: className,
						dropDown: this.dropDown,
						tabIndex: "-1"
					}, this.params || {});

					// Avoid creating Button with a name like "riasw/editor/_plugins/ToggleDir", since that name becomes
					// a global object, and then if the ToggleDir plugin is referenced again, _Plugin.js will
					// find the <input> rather than the ToggleDir module.
					// Not necessary in 2.0 once the getObject() call is removed from _Plugin.js.
					delete props.name;

					this.button = new this.buttonClass(props);
				}
			}
			//if(this.get("disabled") && this.button){
			//	this.button.set("disabled", this.get("disabled"));
			//}
		},
		setEditor: function(/*Editor*/ editor){
			// summary:
			//		Tell the plugin which Editor it is associated with.

			// TODO: refactor code to just pass editor to constructor.

			// FIXME: detach from previous editor!!
			this.editor = editor;

			// FIXME: prevent creating this if we don't need to (i.e., editor can't handle our command)
			this._initButton();

			// Processing for buttons that execute by calling editor.execCommand()
			if(this.button && this.useDefaultCommand){
				if(editor.queryCommandAvailable(this.command)){
					this.own(this.button.on("click",
						rias.hitch(editor, "execCommand", this.command, this.commandArg)
					));
				}else{
					// hide button because editor doesn't support command (due to browser limitations)
					this.button.domNode.style.display = "none";
				}
			}

			//this.own(this.editor.on("NormalizedDisplayChanged", rias.hitch(this, "updateState")));
			var self = this;
			self.subscribe(editor.id + "_normalizedDisplayChanged", function(){
				self.updateState();
			});
		},

		updateState: function(){
			// summary:
			//		Change state of the plugin to respond to events in the editor.
			// description:
			//		This is called on meaningful events in the editor, such as change of selection
			//		or caret position (but not simple typing of alphanumeric keys).   It gives the
			//		plugin a chance to update the CSS of its button.
			//
			//		For example, the "bold" plugin will highlight/unhighlight the bold button depending on whether the
			//		characters next to the caret are bold or not.
			//
			//		Only makes sense when `useDefaultCommand` is true, as it calls Editor.queryCommandEnabled(`command`).
			var e = this.editor,
				c = this.command,
				checked, enabled;
			if(!e || !e.isLoaded || !c.length){
				return;
			}
			var disabled = this.get("disabled");
			if(this.button){
				try{
					enabled = !disabled && e.queryCommandEnabled(c);
					if(this.enabled !== enabled){
						this.enabled = enabled;
						this.button.set('disabled', !enabled);
					}
					if(enabled){
						if(typeof this.button.checked === 'boolean'){
							checked = e.queryCommandState(c);
							if(this.checked !== checked){
								this.checked = checked;
								this.button.set('checked', e.queryCommandState(c));
							}
						}
					}
				}catch(err){
					console.error(err);
				}
			}
		},

		setToolbar: function(/*riasw.sys/Toolbar*/ toolbar){
			// summary:
			//		Tell the plugin to add it's controller widget (often a button)
			//		to the toolbar.  Does nothing if there is no controller widget.

			// TODO: refactor code to just pass toolbar to constructor.

			if(this.button){
				toolbar.addChild(this.button);
			}
			// console.debug("adding", this.button, "to:", toolbar);
		},

		_setDisabledAttr: function(disabled){
			// summary:
			//		Function to set the plugin state and call updateState to make sure the
			//		button is updated appropriately.
			this._set("disabled", disabled);
			if(this._started){
				this.updateState();
			}
		}
	});

	// Hash mapping plugin name to factory, used for registering plugins
	_Plugin.registry = {};

	return _Plugin;

});
