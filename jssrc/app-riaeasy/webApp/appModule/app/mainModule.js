define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 128,
	"_riaswVersion": "1.0",
	"region": "center",
	"_riaswSeo": function (){
			return "";
		},
	"afterLoaded": function (){
			var m = this;
			if(m.get("_riasrDesigning")){
				return;
			}
			rias.webApp.mainWorkarea = m.mainWorkarea;
			rias.webApp.mainDock = m.mainDock;
			rias.webApp.appDock = m.appDock;

			rias.webApp.launch([{
				requireLogged: false,
				moduleMeta: "appModule/app/myHome",
				_riaswIdOfModule: "myHome",
				//caption: "主页",
				moduleParams: {},
				//reCreate: true,
				closable: false
			/*},{
				requireLogged: false,
				"moduleMeta": "appModule/tools/infos",
				"_riaswType": "rias.riasw.layout.DialogPanel",
				_riaswIdOfModule: "appInfos",
				caption: "公告",/// 提前赋值，以确定 dockNode 的显示
				tooltip: "公告",
				iconClass: "infoIcon",
				moduleParams: {},
				//reCreate: true,
				closable: false,

				//"$refNote": "",
				//"cookieName": "appInfos",
				//"persist": false,
				"initDisplayState": "hidden",
				"initPlaceToArgs": {
					around: "_riasrDockNode",
					positions: ["below-centered"]
				},
				"dockTo": m.mainDock,
				//"maxable": true,
				"minSize": {
					"h": 320,
					"w": 200
				},
				"_riaswChildren": []
			*/}]);
			//rias.webApp.login();
			m.showLogInfo();
		},
		afterLoadedAllAndShown: function(){
			var m = this;
			m.launchMainMenu();
			m.showLogInfo();
		},
		"afterLogin": function (){
			var m = this;
			m.launchWorkbench();
			m.showLogInfo();
		},
		"afterLogout": function (){
			var m = this;
			if(rias.webApp.mainWorkbench){
				rias.destroy(rias.webApp.mainWorkbench);
				delete rias.webApp.mainWorkbench;
			}
			m.showLogInfo();
		},
	"showLogInfo": function (){
			var m = this,
				b = rias.webApp.oper.logged;
		m.btnLogin.set("label", b ? rias.i18n.webApp.logout : rias.i18n.webApp.login);
			if(m.panOper){
				m.panOper.set("content", b ? rias.webApp.oper.code + "/" + rias.webApp.oper.name : "尚未登录");
			}
		},
		"launchMainMenu": function(args){
			var m = this;
			/*if(rias.webApp.mainWorkbench){
			 rias.destroy(rias.webApp.mainWorkbench);
			 delete rias.webApp.mainWorkbench;
			 }*/
			if(rias.webApp.mainMenu){
				//rias.webApp.mainMenu.focus();
			}else{
				rias.webApp.launch([{
					requireLogged: false,
					"moduleMeta": "appModule/app/mainMenu",
					"_riaswType": "rias.riasw.layout.DialogPanel",
					_riaswIdOfModule: "mainMenu",
					showCaption: false,
					"caption": rias.i18n.webApp.menu,
					"tooltip": rias.i18n.webApp.menu,
					"iconClass": "menuIcon",
					moduleParams: args,
					reCreate: false,
					autoFocus: false,
					closable: false,

					"dockTo": m.mainDock,
					dialogType: "top",
					resizable: false,
					maxable: false,
					toggleOnBlur: true,
					//alwaysShowDockNode:true,
					//closeDisplayState: "hidden",
					//dockNodeArgs: {
					//	toggleOnEnter: true
					//},
					"initDisplayState": "hidden",
					"initPlaceToArgs": {
						around: "_riasrDockNode",
						positions: ["below-centered"]
					},
					"style": {
						//"display": "none",
						//"padding": "0px",
						"width": "25em",
						height: rias.toInt(m.domNode.clientHeight * 0.7, 480) + "px"//"80em"//rias.toInt(m.domNode.clientHeight * 0.7) + "px"
					}
				}]);
			}
		},
		"launchWorkbench": function(args){
			/*if(rias.webApp.mainWorkbench){
			 rias.destroy(rias.webApp.mainWorkbench);
			 delete rias.webApp.mainWorkbench;
			 }*/
			if(rias.webApp.mainWorkbench){
				//rias.webApp.mainWorkbench.focus();
			}else{
				rias.webApp.launch([{
					moduleMeta: "appModule/app/workbench",
					_riaswIdOfModule: "mainWorkbench",
					//caption: "工作台",
					moduleParams: args,
					reCreate: false,
					autoFocus: false,
					"closable": true
				}]);
			}
		},
	"launchModule": function (args){
			var self = this,
				asDialog = (args._riaswType === "rias.riasw.layout.DialogPanel"),
				owner = rias.webApp,
				parent = (asDialog ? owner : owner.mainWorkarea);
			args = rias.decodeRiaswParams(owner, args);
			var dLaunch = rias.newDeferred(),
				//parentModule = args._riasrModule || (args.moduleParams && args.moduleParams._riasrModule ? args.moduleParams._riasrModule : self),
				ts = args.caption || "",
				c;
			function _getStyle(moduleParams, meta){
				var _box;
				if(meta){
					_box = rias.dom.getContentMargin(parent.containerNode);
					moduleParams.style = rias.mixinDeep({}, {
						height: rias.toInt(rias.max(_box.h * 0.8, 360)) + "px",
						width: rias.toInt(rias.max(_box.w * 0.8, 640)) + "px"
					}, meta.style, moduleParams.style);
				}
				return moduleParams.style;
			}
			function _bind(){
				var _dfMeta = rias.newDeferred("launchModule._bind.require", rias.defaultDeferredTimeout, function(){
					this.cancel();
				});
				if(rias.isString(args.moduleMeta)){
					try{
						rias.require([args.moduleMeta], function(meta){
							_dfMeta.resolve(meta);
						});
					}catch(e){
						_dfMeta.reject(e);
					}
				}else{
					_dfMeta.resolve(args.moduleMeta);
				}
				_dfMeta.then(function(meta){
					var moduleParams = rias.mixinDeep({}, args, {
						///ownerRiasw: (args.ownerRiasw != undefined ? args.ownerRiasw : owner),///rias.bind 会忽略 ownerRiasw
						parent: (args.parent != undefined ? args.parent : parent),
						"_riaswType": args._riaswType || (asDialog ? "rias.riasw.layout.DialogPanel" : "rias.riasw.studio.Module"),
						_riaswIdOfModule: args._riaswIdOfModule,
						id: args.id,
						moduleMeta: meta,
						"captionClass": (args.captionClass != undefined
							? args.captionClass.indexOf("appModuleCaption") >= 0 ? args.captionClass : args.captionClass + " appModuleCaption"
							: "appModuleCaption"),
						"contentClass": (args.contentClass != undefined
							? args.contentClass.indexOf("appModuleContent") >= 0 ? args.contentClass : args.contentClass + " appModuleContent"
							: "appModuleContent"),
						closable: (args.closable != undefined ? args.closable : true),
						"dockTo": args.dockTo,// || self.appDock,
						region: (args.region != undefined ? args.region : asDialog ? "" : "center"),///Dialod 强制 region = ""
						resizable: (args.resizable != undefined ? args.resizable : !!asDialog),// !meta.region,
						maxable: (args.maxable != undefined ? args.maxable : !!asDialog),
						"toggleable": (args.toggleable != undefined ? args.toggleable : !!asDialog),
						"toggleOnEnter": (args.toggleOnEnter != undefined ? args.toggleOnEnter : false),
						toggleOnBlur: (args.toggleOnBlur != undefined ? args.toggleOnBlur : false),
						toggleOnLeave: (args.toggleOnLeave != undefined ? args.toggleOnLeave : false),
						alwaysShowDockNode: (args.alwaysShowDockNode != undefined ? args.alwaysShowDockNode : true),
						dockNodeArgs: {
							style: {}
						}
					});
					moduleParams.style = rias.dom.styleToObject(moduleParams.style);
					if(asDialog){
						_getStyle(moduleParams, meta);
					}else if(parent === self.mainWorkarea){
						rias.mixinDeep(moduleParams, {
							dockNodeArgs: {
								toggle: function(){
									var target = this.targetWidget;
									if(target === self.mainWorkarea.selectedChildWidget){
										//self.mainWorkarea.back();
									}else{
										self.mainWorkarea.selectChild(target, true);
									}
								}
							}
						});
					}
					if(ts){
						moduleParams.caption = ts;
					}
					if(args.iconClass != undefined){
						moduleParams.iconClass = args.iconClass;
					}
					if(args.restrictPadding != undefined){
						if(!asDialog){
							moduleParams.restrictPadding = args.restrictPadding;
						}
					}
					rias.mixinDeep(moduleParams, args.moduleParams);
					//delete moduleParams.asDialog;
					//delete moduleParams.idOfModule;
					delete moduleParams.reCreate;
					delete moduleParams.autoFocus;
					if(args.parent){
						if(!moduleParams.initPlaceToArgs){
							moduleParams.initPlaceToArgs = {};
						}
						if(!moduleParams.initPlaceToArgs.parent){
							moduleParams.initPlaceToArgs.parent = args.parent;
						}
						delete args.parent;
					}
					rias._deleDP(moduleParams);
					rias.bind([moduleParams], owner).then(function(result){
						if(result.errors){
							rias.error(result.errors, null, self);
							dLaunch.reject(result);///有错，则不返回 模块。
						}else if(c = result.widgets[0]){
							if(asDialog){
								dLaunch.resolve(c);
							}else{
								self.mainWorkarea.selectChild(c, true).always(function(){
									dLaunch.resolve(c);
								});
							}
						}else{
							dLaunch.reject(result);///有错，则不返回 模块。
						}
					});
				}, function(e){
					rias.error({
						content: e.message
					});
					dLaunch.reject(e);///有错，则不返回 模块。
				});
			}
			if(args._riaswIdOfModule){
				if(c = self[args._riaswIdOfModule]){
					if(!args.reCreate){
						if(rias.isInstanceOf(c, "rias.riasw.layout.DialogPanel")){
							if(args.autoFocus != false){///有些模块不应该自动 focus 导致 restore。比如 mainMenu 和 workbench
								c.focus();
							}
							dLaunch.resolve(c);
						}else{
							self.mainWorkarea.selectChild(c, true).always(function(){
								dLaunch.resolve(c);
							});
						}
					}else{
						var h = rias.after(c, "destroy", function(){
							_bind();
							h.remove();
						}, false);
						rias.destroy(c);
					}
				}
			}
			if(!c){
				_bind();
			}
			return dLaunch.promise;
		},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "mainTop",
			"region": "top",
			"design": "headline",
			"persist": false,
			"class": "webAppHeader",
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.layout.Panel",
					"region": "left",
					"class": "webAppHeaderLogo",
					"onClick": function (evt){
							rias.showAbout(this);
						},
					"_riaswIdOfModule": "panLogo"
				},
				{
					"_riaswType": "rias.riasw.layout.DockBar",
					"_riaswIdOfModule": "mainDock",
					"region": "center",
					"float": "right",
					"class": "webAppHeaderDockBar"
				},
				{
					"_riaswType": "rias.riasw.layout.Panel",
					"_riaswIdOfModule": "btns",
					"class": "webAppHeaderBtns",
					"layoutPriority": 0,
					"region": "right",
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.form.Button",
							"_riaswIdOfModule": "btnLogin",
							"iconClass": "loginIcon",
							"label": {
								"$refObj": "rias.i18n.webApp.login"
							},
							"onClick": function (evt){
									var m = this._riasrModule;
									if(rias.webApp.oper.logged){
										rias.webApp.doLogout();
									}else{
										rias.webApp.doLogin();
									}
								}
						}
					]
				}
			]
		},
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "mainBottom",
			"class": "webAppFooter",
			"design": "sidebar",
			"persist": false,
			"region": "bottom",
			"splitter": false,
			"style": {
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.html.Tag",
					"_riaswIdOfModule": "panOper",
					"content": "尚未登录",
					"region": "left",
					"style": {
						"margin": "0px",
						"padding": "0px",
						"width": "16em"
					},
					"tagType": "label"
				},
				{
					"_riaswType": "rias.riasw.layout.DockBar",
					"_riaswIdOfModule": "appDock",
					"class": "webAppFooterDockBar",
					"region": "center"
				}
			]
		},
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "panWorkarea",
			"class": "webAppCenter",
			"design": "headline",
			"persist": false,
			"region": "center",
			"style": {
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.layout.TabPanel",
					"_riaswIdOfModule": "mainWorkarea",
					"class": "webAppCenterStack",
					"region": "center",
					"tabPosition": "top",
					"tabStrip": true,
					"nested": false
				}
			]
		}
	]
}

});
