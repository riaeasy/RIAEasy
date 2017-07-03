define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 10,
	"_riaswVersion": "2017",
	"caption": {
		"$refObj": "rias.i18n.desktop.workbench"
	},
	"iconClass": "worksIcon",
	"_riaswSeo": function (){
		return "";
	},
	"afterLoadedAll": function (loadOk){
		if(!loadOk || this.getDesigning()){
			return;
		}
		this.toggleContextOption();
	},
	"afterLogin": function (){
		var m = this;
		m.launchWorkbench();
		m.showLogInfo();
	},
	"afterLogout": function (){
		var m = this;
		if(m.workbench){
			rias.destroy(m.workbench);
			delete m.workbench;
		}
		m.showLogInfo();
	},
	"showLogInfo": function (){
		//var m = this,
		//	b = m.oper.logged;
		//m.btnLogin.set("label", b ? rias.i18n.desktop.logout : rias.i18n.desktop.login);
		//m.btnOperInfo.set("label", b ? rias.desktop.oper.name : rias.i18n.desktop.operInfo);
		//m.btnOperInfo.set("visible", b);
		//m.desktopTop.layout();
	},
	"toggleContextOption": function (args, around){
			if(this.contextOption){
				if(this.contextOption.isShowing()){
					this.contextOption.hide();
				}else{
					this.contextOption.restore();
				}
			}else{
				rias.showDialog(rias.mixinDeep({
					ownerRiasw: this,
					"moduleMeta": "appmodule/workbench/mainMenu",
					"_riaswType": "riasw.sys.Dialog",
					_riaswIdInModule: "contextOption",
					showCaption: false,
					"caption": rias.i18n.desktop.workbench,
					"tooltip": rias.i18n.desktop.workbench,
					"iconClass": "worksIcon",
					reCreate: false,
					closable: false,
					maxable: false,
					resizable: false,
					selected: true,
					//autoFocus: false,
					//toggleable: true,
					displayStateOnBlur: "hidden",
					//alwaysShowDockNode:true,
					"initDisplayState": "hidden",
					dialogType: "dropDown",
					"popupArgs": {
						popupPositions: ["below-centered", "above-centered", "after-centered", "before-centered"],
						lockPosition: true
					},
					"style": {
						height: "70%",
						"width": "25em"
					}
				}, args), this, around || args && args.around || this.dockNode);
			}
			return this.contextOption;
		},
	"launchWorkbench": function (args){
		if(!this.workbench){
			this.launch([{
				moduleMeta: "appmodule/workbench/workbench",
				_riaswIdInModule: "workbench",
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
							"iconClass": "messageEmptyIcon",
							"showLabel": false,
							"label": {
								"$refObj": "rias.i18n.action.message"
							},
							"tooltip": {
								"$refObj": "rias.i18n.action.message"
							},
							"onStartup": function (){
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
