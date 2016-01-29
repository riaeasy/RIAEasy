
define([
	"rias",
	"dijit/_TemplatedMixin",
	"rias/riasw/layout/_PanelBase",
	"rias/riasw/form/_FormMixin",
	"rias/riasw/studio/_ModuleMixin"
], function(rias, _TemplatedMixin, _PanelBase, _FormMixin, _ModuleMixin){

	rias.theme.loadCss([
		"studio/Module.css"
	]);

	var riasType = "rias.riasw.studio.Module";
	var Widget = rias.declare(riasType, [_PanelBase, _TemplatedMixin, _FormMixin, _ModuleMixin],{

		///暴露给 riasd.widgetEditor
		requires: [],//自身定义的 requires 没用，在 rias.filer 会忽略，使用 meta 的 requires 代替。
		moduleCss: [],//自身定义的 moduleCss 没用，在 rias.filer 会忽略，使用 meta 的 moduleCss 代替。
		//_riaswChildren: [],//自身定义的 _riaswChildren 没用，在 rias.filer 会忽略，使用 meta 的 _riasChildren 代替。
		//events: [],//自身定义的 events 没用，在 rias.filer 会忽略，使用 meta 的 events 代替。

		//moduleMeta 要参与 isRiaswModule() 判断，不能在 rias.riasw.studio._ModuleMixin 中初始化，可以在 rias.riasw.studio.Module 和 rias.riasw.studio.App 中初始化。
		moduleMeta: "",

		templateString:
			"<div data-dojo-attach-point='containerNode,focusNode' class='dijitReset' role='region' ${!nameAttrSetting}></div>",
		baseClass: "riaswModule",

		startup: function(){
			var self = this;
			if(self._started){
				return;
			}

			self.inherited(arguments);
		},

		/// ============================== ///

		resize: function(changeSize, resultSize){
			//console.debug("resize(): " + this.id);
			this.inherited(arguments);
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswModuleIcon",
		iconClass16: "riaswModuleIcon16",
		defaultParams: {
			//moduleMeta: "rias/riasw/studio/Module",
			//loadOnStartup: true
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
			loadOnStartup: {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "loadOnStartup"
			},
			beforeFiler: {
				"datatype": "function",
				"title": "beforeFiler"
			},
			afterFiler: {
				"datatype": "function",
				"title": "afterFiler"
			}
		}
	};

	return Widget;

});