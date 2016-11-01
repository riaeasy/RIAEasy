define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"../_Plugin",
	"rias/riasw/layout/DialogPanel",
	"rias/riasw/form/Button",
	"rias/riasw/form/DropDownButton",
	"rias/riasw/widget/ColorPicker",
	"dojo/i18n!./nls/TextColor"
], function(rias, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _Plugin, DialogPanel, Button, DropDownButton, ColorPicker) {

	//rias.experimental("dojox.editor.plugins.TextColor");
	var pluginsName = "rias.riasw.editor.htmleditor.plugins";

	/*var TextColorDropDown = rias.declare(pluginsName + "._TextColorDropDown", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
		// summary:
		//		A sample widget that uses/creates a dropdown with a dojox.widget.ColorPicker.  Also provides
		//		passthroughs to the value of the color picker and convenient hook points.
		// tags:
		//		private

		// templateString: String
		//		The template used to create the ColorPicker.
		templateString:
			"<div style='display: none; position: absolute; top: -10000; z-index: -10000'>" +
				"<div dojoType='rias.riasw.layout.DialogPanel' dojoAttachPoint='dialog' class='dojoxEditorColorPicker'>" +
					"<div dojoType='rias.riasw.widget.ColorPicker' dojoAttachPoint='_colorPicker'></div>" +
					"<br>" +
					"<center>" +
						"<button dojoType='rias.riasw.form.Button' type='button' dojoAttachPoint='_setButton'>${setButtonText}</button>" +
						"&nbsp;" +
						"<button dojoType='rias.riasw.form.Button' type='button' dojoAttachPoint='_cancelButton'>${cancelButtonText}</button>" +
					"</center>" +
				"</div>" +
			"</div>",

		// widgetsInTemplate: Boolean
		//		Flag denoting widgets are contained in the template.
		widgetsInTemplate: true,

		constructor: function(){
			// summary:
			//		Constructor over-ride so that the translated strings are mixsed in so
			//		the template fills out.
			var strings = rias.i18n.getLocalization(pluginsName, "TextColor");
			rias.mixin(this, strings);
		},

		startup: function(){
			// summary:
			//		Over-ride of startup to do the basic connect setups and such.
			if(!this._started){
				this.inherited(arguments);
				this.connect(this._setButton, "onClick", rias.hitch(this, function(){
					this.onChange(this.get("value"));
				}));
				this.connect(this._cancelButton, "onClick", rias.hitch(this, function(){
					rias.dom.closePopup(this.dialog);
					this.onCancel();
				}));
				// Fully statred, so go ahead and remove the hide.
				rias.dom.setStyle(this.domNode, "display", "block");
			}
		},

		_setValueAttr: function(value, priorityChange){
			// summary:
			//		Passthrough function for the color picker value.
			// value: String
			//		The value to set in the color picker
			// priorityChange:
			//		Value to indicate whether or not to trigger an onChange event.
			this._colorPicker.set("value", value, priorityChange);
		},

		_getValueAttr: function(){
			// summary:
			//		Passthrough function for the color picker value.
			return this._colorPicker.get("value");
		},

		onChange: function(value){
			// summary:
			//		Hook point to get the value when the color picker value is selected.
			// value: String
			//		The value from the color picker.
		},

		onCancel: function(){
			// summary:
			//		Hook point to get when the dialog is canceled.
		}
	});*/


	var TextColor = rias.declare(pluginsName + ".TextColor", _Plugin, {
		// summary:
		//		This plugin provides dropdown color pickers for setting text color and background color
		//		and makes use of the nicer-looking (though not entirely accessible), dojox.widget.ColorPicker.
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
			rias.dom.webAppNode.appendChild(this._picker.domNode);
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
			self.dropDown = {
				ownerRiasw: self,
				"dialogType": "modal",
				actionBar: [
					"btnSave",
					"btnCancel"
				],
				moduleMeta: {
					"class": "dojoxEditorColorPicker",
					//"value": self._colorValue,
					beforeDropDown: function(args){
						args.value = self._colorValue;
					},
					"afterLoaded": function (result){
						this.colorPicker.silentSetValue(this._get("value"));
					},
					"_setValueAttr": function (value){
						if(!("_oldValue" in this)){
							this._oldValue = value;
						}
						this.value = value;
						if(this.colorPicker){
							this.colorPicker.silentSetValue(value);
						}
					},
					"onSubmit": function (){
						this.value = this.colorPicker.get("value");
						this.set("value", this.value);
						self.editor.execCommand(self.command, this.value);
						//return this.inherited(arguments);
					},
					onCancel: function(){
						///FIXME:zensst.需要判断是否有选中
						//self.editor.execCommand(self.command, this._oldValue);
					},
					onClose: function(){
						self.editor.focus();
					},
					_riaswChildren: [{
						_riaswType: "rias.riasw.widget.ColorPicker",
						_riaswIdOfModule: "colorPicker",
						//region: "center",
						onChange: function(value){
							this._riasrModule.value = value;
							///FIXME:zensst.需要判断是否有选中
							//self.editor.execCommand(self.command, value, true);
						}
					}]
				}
			};
			self.inherited(arguments);
			self.button.beforeDropDown = function(args){
				args.value = self._colorValue;
			};
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

			if(value == ""){
				value = "#000000";
			}
			if(value == "transparent"){
				value = "#ffffff";
			}

			if(typeof value == "string"){
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
			this._colorValue = value;
		},

		destroy: function(){
			// summary:
			//		Over-ride cleanup function.
			this.inherited(arguments);
			//this._picker.destroyRecursive();
			//delete this._picker;
		}
	});

// For monkey-patching
	//TextColor._TextColorDropDown = TextColorDropDown;

	// Register this plugin.
	_Plugin.registry["foreColor"] = _Plugin.registry["forecolor"] = function(args){
		return new TextColor(rias.mixin({
			command: "foreColor"
		}, args));
	};
	_Plugin.registry["hiliteColor"] = _Plugin.registry["hilitecolor"] = function(args){
		return new TextColor(rias.mixin({
			command: "hiliteColor"
		}, args));
	};

	return TextColor;

});
