//RIAStudio client runtime widget - ColorPalette

define([
	"rias",
	"dijit/_editor/RichText",
	"rias/riasw/form/ValidationTextBox",///extend()
	"rias/riasw/form/ComboBox"///extend()
], function(rias, _Widget) {

	rias.theme.loadThemeCss([
		"riasw/widget/Editor.css",
		"riasw/widget/editorIcons.css",
		"riasw/widget/editor/editorPlugins.css"
	]);

	_Widget.extend({
		///修改 this.style 不是字符串时的问题。将 style 转换为字符串。
		postMixInProperties: function(){
			if(rias.isObject(this.style)){
				var p, pn, s = "";
				for(pn in this.style){
					if(this.style.hasOwnProperty(pn)){
						s = s + pn + "=" + this.style[pn] + ";";
					}
				}
				this.style = s;
			}
			this.inherited(arguments);
		},
		startup: function(){
			///避免二次 startup()，以致显示不正确。
			if(this._started){
				return;
			}
			this.inherited(arguments);

			// Don't call open() until startup() because we need to be attached to the DOM, and also if we are the
			// child of a StackContainer, let StackContainer._setupChild() do DOM manipulations before iframe is
			// created, to avoid duplicate onload call.
			this.open();
			this.setupDefaultShortcuts();
		}
	});

	var riaswType = "rias.riasw.widget.RichText";
	var Widget = rias.declare(riaswType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswEditorIcon",
		iconClass16: "riaswEditorIcon16",
		defaultParams: {
			//content: "RichText"
		},
		initialSize: {},
		resizable: "none",
		//allowedChild: "",
		"property": {
			"minHeight": {
				"datatype": "string",
				"defaultValue": "1em",
				"title": "minHeight"
			},
			"updateInterval": {
				"datatype": "number",
				"defaultValue": 200,
				"title": "Timeout Change"
			},
			"value": {
				"datatype": "string",
				"description": "The value of the editor.",
				"hidden": false
			},
			"tabIndex": {
				"datatype": "string",
				"description": "Widget tab index.",
				"hidden": false
			}
		}
	};

	return Widget;
});