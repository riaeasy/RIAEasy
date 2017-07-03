define([
	"riasw/riaswBase",
	"riasd/main"
], function(rias, riasd){

	return {
	"_rsfVersion": 1,
	"_riaswVersion": "2017",
		"caption": {
			$refObj: "rias.i18n.desktop.studio"
		},
		"iconClass": "riasdIcon",
		_initRiasdOk: false,
		//themeCss: [
		//	"riasd/resources/riasd.css"
		//],
		requires: [
			"riasd/riasdMetas",
			"riasd/module/fileSelector",
			"riasd/module/visualEditor"
		],
		beforeDestroyed: function(){
			if(rias.desktop.launchRiasdModule === this.launchRiasdModule){
				delete rias.desktop.launchRiasdModule;
			}
		},
		beforeParse: function(){
			//riasd, riasdMetas, fileSelector, visualEditor
			rias.theme.loadCss([/// module.themeCss 是 app 路径，这里需要用 rias 路径
				rias.toUrl("riasd/resources/riasd.css")
			]);
			var riasdMetas = this._riasrRequiresResult["riasd/riasdMetas"];

			this.visualEditor = this._riasrRequiresResult["riasd/module/visualEditor"];
			if(riasdMetas === "not-a-module"){
				rias.has.add("riasd", 0, 0, 1);
				this._initRiasdOk = false;
			}else{
				rias.registerRiaswMetas(1, riasdMetas);
				if(!rias.desktop.launchRiasdModule){
					rias.desktop.launchRiasdModule = this.launchRiasdModule;
				}
				this._initRiasdOk = true;
			}
		},
		launchRiasdModule: function(modulename){
			var m = rias.desktop.riastudio,
				cs = modulename.split("/"),
				i, l = cs.length,
				ts = "";
			if(l > 0){
				for(i = 0, --l; i < l; i++){
					ts = ts + cs[i] + "/";
				}
				ts = "<span class='riasdTabLabelPath'>" + ts +
					"</span><span class='riasdTabLabelName'>" + cs[l] + "</span>";
				//ts = ts + cs[l];
			}
			var args = {
				isRiasd: true,
				moduleMeta: m.visualEditor,
				_riaswIdInModule: "ve_" + modulename.replace(/\//g, "_").replace(/\./g, "_").replace(/^appmodule_/, ""),
				caption: ts,
				_riasdModulename: modulename,
				//reCreate: false,
				id: "ve_" + modulename.replace(/\//g, "_").replace(/\./g, "_").replace(/^appmodule_/, ""),
				iconClass: "riasdIcon"
			};
			return m.launch(args).always(function(result){
				return result;
			});
		},
		"afterLoadedAll": function (loadOk){
			if(!loadOk || this.getDesigning()){
				return;
			}
			this.toggleContextOption();
		},
		"afterLogin": function (){
			var m = this;
			m.launchWelcome();
			m.showLogInfo();
		},
		"afterLogout": function (){
			var m = this;
			if(m.welcome){
				rias.destroy(m.welcome);
				delete m.welcome;
			}
			m.showLogInfo();
		},
		"showLogInfo": function (){
			//var m = this,
			//	b = m.oper.logged;
			//m.btnLogin.set("label", b ? rias.i18n.desktop.logout : rias.i18n.desktop.login);
			//m.btnOperInfo.set("label", b ? rias.desktop.oper.name : rias.i18n.desktop.operInfo);
			//m.btnOperInfo.set("visible", b);027 87165555-32635
			//m.mainTop.layout();
		},
		toggleContextOption: function(args, around){
			if(this.contextOption){
				if(this.contextOption.isShowing()){
					this.contextOption.hide();
				}else{
					this.contextOption.restore();
				}
			}else{
				if(this._initRiasdOk){
					rias.showDialog(rias.mixinDeep({
						ownerRiasw: this,
						moduleMeta: this._riasrRequiresResult["riasd/module/fileSelector"],// fileSelector,
						_riaswType: "riasw.sys.Dialog",
						_riaswIdInModule: "contextOption",
						dialogType: "dropDown",
						showCaption: false,
						caption: rias.i18n.desktop.studio,//"资源管理器",
						tooltip: rias.i18n.desktop.studio + "<br/>IE11及以下版本只能使用" + rias.i18n.riasd.ModuleEditor + "部分功能",
						iconClass: "riasdIcon",
						reCreate: false,
						closable: false,
						maxable: false,
						resizable: false,
						selected: false,
						//autoFocus: false,
						//toggleable: true,
						displayStateOnBlur: "hidden",
						//alwaysShowDockNode:true,
						"initDisplayState": "hidden",
						style: {
							width: "30em",
							height: "70%"
						},
						"popupArgs": {
							popupPositions: ["below-centered", "above-centered", "after-centered", "before-centered"],
							lockPosition: true
						},
						afterSubmit: function(value){
							var //m = this,
								mn;
							if(!value){
								//请选择一个条目
								return false;
							}else{
								if(value.itemType === "file"){
									mn = value.pathname.replace(/\.js$/gi, "").replace(/\.rsf$/gi, "").replace(/\./gi, "/");
									rias.undef(mn);
									///先获取文件锁，然后再打开
									//rias.xhr.post({
									//
									//});
									return rias.desktop.launchRiasdModule(mn).then(function(){
									});
								}
							}
						}
					}, args), this, around || args && args.around || this.dockNode);
				}
			}
			return this.contextOption;
		},
		"launchWelcome": function (args){
			if(!this.welcome){
				this.launch([{
					moduleMeta: "riasd/module/welcome",
					_riaswIdInModule: "welcome",
					//caption: "工作台",
					reCreate: false,
					//selectedOnShow: false,
					"closable": false
				}]);
			}
		},
	"_riaswElements": [
		{
			"_riaswType": "riasw.layout.TabPanel",
			"_riaswIdInModule": "sceneWorkarea",
			"class": "sceneCenter",
			"region": "center",
			//"tabLayoutRtl": true,
			"tabPosition": "top"
		},
		{
			"_riaswType": "riasw.layout.Panel",
			"_riaswIdInModule": "mainBottom",
			"class": "sceneFooter",
			"design": "sidebar",
			"region": "bottom",
			"splitter": false,
			"_riaswElements": [
				{
					"_riaswType": "riasw.layout.DockBar",
					"_riaswIdInModule": "appDock",
					"class": "sceneFooterDockBar",
					"region": "center"
				},
				{
					"_riaswType": "riasw.sys.Toolbar",
					"_riaswIdInModule": "statusBar",
					"class": "sceneFooterStatusBar",
					"layoutPriority": 0,
					"region": "right",
					"_riaswElements": [
						{
							"_riaswType": "riasw.sys.ToolButton",
							"_riaswIdInModule": "sceneMessageTray",
							"class": "sceneMessageTray sceneMessageTrayEmpty",
							iconClass: "messageEmptyIcon",
							showLabel: false,
							label: {
								"$refObj": "rias.i18n.action.message"
							},
							"tooltip": {
								"$refObj": "rias.i18n.action.message"
							},
							onStartup: function(){
								var m = this.ownerModule();
								this.subscribe("/rias/desktop/message", function(messages){
									if(messages && messages.length){
										this.set("badge", messages.length);
										this.set("iconClass", "messageHighlightIcon");
										rias.dom.removeClass(this.domNode, "sceneMessageTrayEmpty");
									}else{
										this.set("badge", "");
										this.set("iconClass", "messageEmptyIcon");
										rias.dom.addClass(this.domNode, "sceneMessageTrayEmpty");
									}
									m.mainBottom.layout();
								});
							}
						}
					]
				}
			]
		}
	]
};
	
});
