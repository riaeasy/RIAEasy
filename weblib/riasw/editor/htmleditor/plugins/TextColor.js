define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"../_Plugin",
	"riasw/form/DropDownButton",
	"riasw/form/ColorPicker",
	"dojo/i18n!./nls/TextColor"
], function(rias, _WidgetBase, _TemplatedMixin, _Plugin, DropDownButton, ColorPicker) {

	//rias.experimental("dojox.editor.plugins.TextColor");
	var pluginsName = "riasw.editor.htmleditor.plugins";

	var TextColor = rias.declare(pluginsName + ".TextColor", _Plugin, {
		// summary:
		//		This plugin provides dropdown color pickers for setting text color and background color
		//		and makes use of the nicer-looking (though not entirely accessible), riasw.form.ColorPicker.
		//
		// description:
		//		The commands provided by this plugin are:
		//
		//		- foreColor - sets the text color
		//		- hiliteColor - sets the background color

		// Override _Plugin.buttonClass to use DropDownButton (with ColorPalette) to control this plugin
		buttonClass: DropDownButton,

		// False as we do not use the default editor command/click behavior.
		useDefaultCommand: false,

		/*postMixInProperties: function(){
			var self = this;
			this.inherited(arguments);
			this._picker = new TextColorDropDown({
				ownerRiasw: this
			});
			rias.dom.desktopBody.appendChild(this._picker.domNode);
			this._picker.startup();
			this.dropDown = this._picker.dialog;
			this.connect(this._picker, "onChange", function(color){
				this.editor.execCommand(this.command, color);
			});
			this.connect(this._picker, "onCancel", function(){
				this.editor.focus();
			});
		},*/

		_initButton: function(){
			var self = this;
			self.dropDown = function(){
				return {
					ownerRiasw: self,
					"dialogType": "modal,tip",
					actionBar: [
						"btnSubmit",
						"btnAbort"
					],
					moduleMeta: {
						"class": "riaswEditorColorPicker",
						"afterLoadedAll": function (loadOk){
							if(loadOk){
								this._oldValue = this.get("submitValue");
								this.colorPicker.silentSetValue(this._oldValue);
							}
						},
						//onShow: function(){
						//	this.colorPicker.silentSetValue(self._colorValue);
						//},
						"onSubmit": function (){
							this.set("submitValue", this.colorPicker.get("value"));
							self.editor.execCommand(self.command, this.get("submitValue"));
							//return this.inherited(arguments);
						},
						onHide: function(){
							self.defer(function(){
								self.editor.focus();
							}, 10);
						},
						_riaswElements: [{
							_riaswType: "riasw.form.ColorPicker",
							_riaswAttachPoint: "colorPicker",
							//region: "center",
							onChange: function(value){
								this.ownerModule().value = value;
								///FIXME:zensst.需要判断是否有选中
								//self.editor.execCommand(self.command, value, true);
							}
						}]
					}
				};
			};
			self.inherited(arguments);
		},

		updateState: function(){
			// summary:
			//		Overrides _Plugin.updateState().  This updates the ColorPalette
			//		to show the color of the currently selected text.
			// tags:
			//		protected
			var _e = this.editor;
			var _c = this.command;
			if(!_e || !_e.isLoaded || !_c.length){
				return;
			}

			var disabled = this.get("disabled");

			var value;
			if(this.button){
				this.button.set("disabled", disabled);
				if(disabled){
					return;
				}
				try{
					value = _e.queryCommandValue(_c)|| "";
				}catch(e){
					//Firefox may throw error above if the editor is just loaded, ignore it
					value = "";
				}
			}

			if(value === ""){
				value = "#000000";
			}
			if(value === "transparent"){
				value = "#ffffff";
			}

			if(typeof value === "string"){
				//if RGB value, convert to hex value
				if(value.indexOf("rgb")> -1){
					value = rias.Color.fromRgb(value).toHex();
				}
			}else{	//it's an integer(IE returns an MS access #)
				value =((value & 0x0000ff)<< 16)|(value & 0x00ff00)|((value & 0xff0000)>>> 16);
				value = value.toString(16);
				value = "#000000".slice(0, 7 - value.length)+ value;

			}

			//if(value !== this._picker.get('value')){
			//	this._picker.set('value', value, false);
			//}
			this.set("value", (this._colorValue = value));
		},

		_onDestroy: function(){
			// summary:
			//		Over-ride cleanup function.
			this.inherited(arguments);
			//this._picker.destroy();
			//delete this._picker;
		}
	});

// For monkey-patching
	//TextColor._TextColorDropDown = TextColorDropDown;

	// Register this plugin.
	_Plugin.registry.foreColor = _Plugin.registry.forecolor = function(args){
		return new TextColor(rias.mixin({
			command: "foreColor"
		}, args));
	};
	_Plugin.registry.hiliteColor = _Plugin.registry.hilitecolor = function(args){
		return new TextColor(rias.mixin({
			command: "hiliteColor"
		}, args));
	};

	return TextColor;

});
