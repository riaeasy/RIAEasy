
define([
	"rias",
	"dijit/_TemplatedMixin",
	"rias/riasw/layout/_PanelBase",
	"rias/riasw/form/_FormMixin",
	"rias/riasw/studio/_ModuleMixin"
], function(rias, _TemplatedMixin, _PanelBase, _FormMixin, _ModuleMixin){

	//rias.theme.loadThemeCss([
	//	"riasw/studio/Module.css"
	//]);

	var riaswType = "rias.riasw.studio.Module";
	var Widget = rias.declare(riaswType, [_PanelBase, _TemplatedMixin, _FormMixin, _ModuleMixin],{

		///暴露给 riasd.widgetEditor
		//requires: [],//自身定义的 requires 没用，在 rias.bind 会忽略，使用 meta 的 requires 代替。
		//themeCss: [],//自身定义的 themeCss 没用，在 rias.bind 会忽略，使用 meta 的 themeCss 代替。
		//_riaswChildren: [],//自身定义的 _riaswChildren 没用，在 rias.bind 会忽略，使用 meta 的 _riasChildren 代替。

		//moduleMeta 要参与 isRiaswModule() 判断，不能在 rias.riasw.studio._ModuleMixin 中初始化，可以在 rias.riasw.studio.Module 和 rias.riasw.studio.App 中初始化。
		moduleMeta: "",

		templateString:
			"<div role='region' data-dojo-attach-point='containerNode,focusNode' class='dijit dijitReset riaswModuleContent' ${!nameAttrSetting}>"+
				//"<div role='region' data-dojo-attach-point='_wrapper' class='dijit dijitReset riaswModuleWrapper'>"+
				//	"<div role='region' data-dojo-attach-point='containerNode,focusNode' class='riaswModuleContent'></div>"+
				//"</div>" +
			"</div>",
		baseClass: "riaswModule",

		/*iconClass: "dijitNoIcon",
		_setIconClassAttr: function(value){
			if(this.iconNode){
				rias.dom.removeClass(this.iconNode, this.iconClass);
				this._set("iconClass", (value && value !== "dijitNoIcon") ? value : "dijitNoIcon");
				rias.dom.addClass(this.iconNode, this.iconClass);
			}else{
				this._set("iconClass", (value && value !== "dijitNoIcon") ? value : "dijitNoIcon");
			}
		},*/

		postMixInProperties: function(){
			if(!this.webApp){
				this.webApp = rias.webApp;
			}
			this.inherited(arguments);
		},
		/*buildRendering: function(){
			this.inherited(arguments);
		},*/
		postCreate: function(){
			this.inherited(arguments);
			this._initAttr(["tooltip", "iconClass", "badgeStyle", "badgeColor", "badge"]);
		},
		/*startup: function(){
			var self = this;
			if(self._started){
				return;
			}

			self.inherited(arguments);
		},

		resize: function(changeSize, resultSize){
			//console.debug("resize(): " + this.id);
			if(!this._canResize()){
				return;
			}
			this.inherited(arguments);
		},*/

		_afterSubmit: function(result){
			this.afterSubmit(this.get("moduleResult"));
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswModuleIcon",
		iconClass16: "riaswModuleIcon16",
		defaultParams: {
		},
		initialSize: {},
		"property": {
			"caption": {
				"datatype": "string",
				"description": "The Caption of the Module.",
				"hidden": false
			},
			moduleMeta: {
				"datatype": "string",
				"hidden": false,
				"isData": false,
				"defaultValue": "",
				"title": "Module's Params"
			},
			loadMetaOnStartup: {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "loadMetaOnStartup"
			},
			beforeBind: {
				"datatype": "function",
				"title": "beforeBind"
			},
			afterBind: {
				"datatype": "function",
				"title": "afterBind"
			}
		}
	};

	return Widget;

});