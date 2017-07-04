define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 1,
	"_riaswVersion": "2017",
	"actions": function (){
			return {
				"login": this.dataServerAddr + "act/login",
				"logout": this.dataServerAddr + "act/logout"
			};
		},
		"postHeartbeat": function (){
			rias.xhr.post({
				url: this.heartbeatUrl,
				postData: {
					operCode: this.oper.code
				},
				handleAs: "json",
				timeout: this.defaultTimeout,
				ioPublish: false,
				load: function(result){
					if(result.success){
						console.debug("heartbeat.value - " + result.value);
					}
				}
			});
		},
		"loadOperPersist": function (){
			var m = this,
				p = {};
			if(m.oper.logged && m.operPersistUrl){
				rias.xhr.get({
					url: m.operPersistUrl,
					handleAs: "json",
					timeout: m.defaultTimeout,
					ioPublish: true
				}).then(function(items){
					try{
						p = items[0];
						if(p && p.desktoppersist){
							p = rias.fromJson(p.desktoppersist);
							rias.mixinDeep(m._riasrPersist, p);
							m.autoShowConsole = m.getPersist("autoShowConsole") != false;
							m.mConsole.loadPersist();
							m.autoShowMsg = m.getPersist("autoShowMsg") != false;
							m.mMsg.loadPersist();
						}
					}catch(e){
						console.error("The desktop.loadOperPersist error.");
					}
				});
			}
		},
		"saveOperPersist": function (sync){
			var m = this,
				r = true,
				p = m.needSaveOperPersist();
			if(p && m.oper.logged && m.operPersistUrl){
				r = rias.xhr.post({
					sync: sync,
					url: m.operPersistUrl,
					postData: {
						text: rias.toJson(p)
					},
					handleAs: "json",
					timeout: m.defaultTimeout,
					ioPublish: false
				}).then(function(result){
					//console.debug("saveOperPersist - " + result);
						m._savedOperPersist = p;
						return result;
				});
			}
			return rias.when(r);
		},
		init: function(){
			var m = this;
			this.initOk = true;
			this.destroyHds();
			this._hds = [
				this.subscribe("/rias/xhr/timeoutLimit", function(msg){
					m.oper.logged = false;
					rias.hint(msg);
				}),
				this.subscribe("/rias/console/log", function(items){
					if(!m.isDestroyed()){
						m.btnConsole.set("badge", items.length ? items.length : "");
					}
				}),
				this.subscribe("/rias/desktop/message", function(items){
					if(!m.isDestroyed()){
						m.btnMsg.set("badge", items.length ? items.length : "");
					}
				})
			];
			return this.login();
		},
		destroyHds: function(){
			if(this._hds){
				rias.forEach(this._hds, function(item){
					item.remove();
				});
				delete this._hds;
			}
		},
		"onDestroy": function (){
			this.destroyHds();
		},
	"login": function (args){
			args = args || {};
			var m = this;

			function _do(){
				var d,
					data = args.data,
					url = args.url;
				if(data){
					if(data.code){
						data.code = rias.encoding.SimpleAES.encrypt(data.code, "riaeasy");
					}
					if(data.password){
						data.password = rias.encoding.SimpleAES.encrypt(data.password, "riaeasy");
					}
				}
				if(!url){
					if(rias.isFunction(m.actions)){
						url = m.actions().login;
					}else if(rias.isObject(m.actions)){
						url = m.actions.login;
					}
				}
				if(url){
					d = rias.xhr.post({
						url: url,
						handleAs: "json",
						timeout: m.defaultTimeout
					}, data);
				}else{
					d = rias.newDeferred();
					d.resolve();
				}
				d.promise.always(function(result){
					var r;
					if(!result || !result.success || result.success < 1){
						if(rias.isFunction(args.onError)){
							args.onError.apply(this, arguments || []);
						}
						r = m.oper = m.getNullOper();
					}else{
						r = m.oper = result && result.success && result.value.oper ? result.value.oper : m.getNullOper();
					}
					return r;
				});
				d.then(function(){
					return m._afterLogin();
				});
				return d.promise;
			}

			m.oper.logged = false;
			if(m.initDataOk || !m.datas){
				return _do();
			}else{
				return m.datas.whenLoadedAll(function(loadOk){
					if(loadOk){
						return m.datas.reloadDatas().then(function(result){
							return _do();
						}, function(e){
							return e;
						});
					}
				});
			}
		},
	"doLogin": function (args){
			//args = {
			//	around
			//};
			args = args || {};
			var m = this;
			m.oper.logged = false;
			if(!m._doingLogin){
				m._doingLogin = rias.showDialog(rias.mixinDeep({
					//_riaswIdInModule: "winLogin",///不建议，因为 m._doingLogin 不是 m.winLogin ，有可能会 重复
					iconClass: "loginIcon",
					dialogType: "modal",
					"popupArgs": {
						//around: args.around,
						//popupPositions: ["below-centered"],
						lockPosition: true
					},
					caption: rias.i18n.desktop.login,
					resizable: "",
					maxable: false,
					//state: 0,
					moduleMeta: "appmodule/desktop/login"
				}, args), m, args.around).whenHide(function(formResult){
						var result = rias.formResult.isSubmit(formResult);
						if(!result){
							console.info("desktop.doLogin cancel.");
							m.logout();
						}
						m._doingLogin = undefined;
						return result;
					});
			}
			return m._doingLogin;
		},
		"afterLogin": function (){
			var m = this;
			if(!m.riastudio && rias.has("riasd")){
				m.launchScene({
					sceneId: "riastudio",
					//region: "center",
					//closable: false,
					selected: false,
					moduleMeta: "riasw/scene/riasdScene"
				});
			}
			if(!m.workbench){
				m.launchScene({
					sceneId: "workbench",
					//region: "center",
					//closable: false,
					moduleMeta: "appmodule/workbench/scene"
				});
			}
			m.showLogInfo();
		},
		"afterLogout": function (){
			var m = this;
			m.closeScene("riastudio");
			m.closeScene("workbench");
			m.showLogInfo();
		},
		"showLogInfo": function (){
			var m = this,
				b = m.oper.logged;
			m.btnLogin.set("label", b ? rias.i18n.desktop.logout : rias.i18n.desktop.login);
			m.btnLogin.set("iconClass", b ? "powerIcon" : "loginIcon");
			m.btnOperInfo.set("label", b ? rias.desktop.oper.name : rias.i18n.desktop.operInfo);
			m.btnOperInfo.set("visible", b);
			m.desktopTop.layout();
		},
	"_riaswElements": [
		{
			"_riaswType": "riasw.sys.Menu",
			"_riaswIdInModule": "contextMenu",
			"contextMenuForWindow": true,
			"_riaswElements": [
				{
					"_riaswType": "riasw.sys.MenuItem",
					"_riaswIdInModule": "contextMenu_about",
					iconClass: "aboutIcon",
					"label": {
						$refObj: "rias.i18n.sys.about"
					},
					onClick: function(evt){
						rias.showAbout();
					}
				}
			]
		}, {
			"_riaswType": "riasw.sys.Module",
			"_riaswIdInModule": "datas",
			"initDisplayState": "hidden",
			"moduleMeta": "appmodule/desktop/datas"
		}, {
			"_riaswType": "riasw.layout.Panel",
			"_riaswIdInModule": "desktopTop",
			"class": "desktopHeader",
			"design": "headline",
			"region": "top",
			"_riaswElements": [
				{
					"_riaswType": "riasw.sys.Logo",
					"_riaswIdInModule": "logo",
					"region": "left",
					showLabel: true,
					"onClick": function (evt){
						rias.showAbout(this);
					}
				},
				{
					"_riaswType": "riasw.layout.DockBar",
					"_riaswIdInModule": "sceneDock",
					"region": "center",
					"layoutRtl": "true",
					"class": "desktopHeaderDockBar"
				},
				{
					"_riaswType": "riasw.sys.TimerLabel",
					"_riaswIdInModule": "now",
					"layoutPriority": 0,
					"region": "right",
					"class": "desktopHeaderDateTime",
					"tooltip": {
						"$refObj": "rias.i18n.sys.now"
					},
					onGetTooltip: function(tooltip){
						return tooltip + this.get("label");
					}
				},
				{
					"_riaswType": "riasw.layout.Panel",
					"_riaswIdInModule": "mainBtns",
					"class": "desktopHeaderBtns",
					"layoutPriority": 1,
					"region": "right",
					"_riaswElements": [
						//{
						//	"_riaswType": "riasw.form.Button",
						//	"_riaswIdInModule": "btnIndex",
						//	"iconClass": "homeIcon",
						//	"label": {
						//		"$refObj": "rias.i18n.desktop.home"
						//	},
						//	"onClick": function (evt){
						//		rias.dom.openWindow("//" + location.host + location.pathname.replace("/studio.", "/index."));
						//	}
						//},
						{
							"_riaswType": "riasw.form.DropDownButton",
							"_riaswIdInModule": "btnOperInfo",
							"visible": false,
							"iconClass": "optionIcon",
							"label": {
								"$refObj": "rias.i18n.desktop.operInfo"
							},
							isLoaded: function(){
								return false;
							},
							onLoadDropDown: function(){
								return (this.dropDown = {
									"moduleMeta": "appmodule/desktop/operInfo",
									"caption": rias.i18n.desktop.operInfo + " - " + this.label,
									"resizable": false,
									"maxable": false,
									actionBar: ["btnSubmit"]
								});
							}
						},
						{
							"_riaswType": "riasw.form.Button",
							"_riaswIdInModule": "btnLogin",
							"iconClass": "loginIcon",
							"label": {
								"$refObj": "rias.i18n.desktop.login"
							},
							//"style": {
							//	"width": "4em"
							//},
							"onClick": function (evt){
								var m = this.getOwnerModule();
								if(m.oper.logged){
									m.doLogout({
										dialogType: "dropDown",
										popupArgs: {
											around: this
										},
										popupPositions: ["below-alt", "above-alt", "after-centered", "before-centered"]
									});
								}else{
									m.doLogin({
										dialogType: "dropDown",
										popupArgs: {
											around: this
										},
										popupPositions: ["below-alt", "above-alt", "after-centered", "before-centered"]
									});
								}
							}
						},
						{
							"_riaswType": "riasw.sys.ToolButton",
							"_riaswIdInModule": "btnMsg",
							"iconClass": "messageIcon",
							"label": {
								"$refObj": "rias.i18n.desktop.message"
							},
							showLabel: false,
							onClick: function(){
								this.getOwnerModule().mMsg.toggle();
							}
						},
						{
							"_riaswType": "riasw.sys.ToolButton",
							"_riaswIdInModule": "btnConsole",
							"iconClass": "consoleIcon",
							"label": {
								"$refObj": "rias.i18n.desktop.console"
							},
							showLabel: false,
							onClick: function(){
								this.getOwnerModule().mConsole.toggle();
							}
						}
					]
				}
			]
		}, {
			"_riaswType": "riasw.layout.Panel",
			"_riaswIdInModule": "desktopCenter",
			"class": "desktopCenter",
			"region": "center",
			"_riaswElements": [{
				"_riaswType": "riasw.layout.StackPanel",
				"_riaswIdInModule": "sceneContainer",
				"class": "sceneContainer",
				"region": "center",
				//"tabLayoutRtl": true,
				"tabPosition": "top",
				"_riaswElements": []
			}, {
				"_riaswType": "riasw.sys.Dialog",
				"_riaswIdInModule": "mMsg",
				//"caption": rias.i18n.desktop.message,
				"initDisplayState": "hidden",
				dialogType: "tip",
				"selected": false,
				"closable": true,
				closeDelay: -1,
				//hiddenConnector: true,
				"toggleable": true,
				displayStateOnToggle: "hidden",
				"displayStateOnBlur": "",
				"displayStateOnHover": "",
				"displayStateOnLeave": "",
				//dockTo: {
				//	$refObj: "module.sceneDock"
				//},
				//alwaysShowDockNode: true,
				moduleMeta: "appmodule/desktop/message",
				//"region": "",
				"style": {
					//top: "1px",
					//right: "2em",
					"height": "20em",
					"width": "30em"
				}
			}, {
				"_riaswType": "riasw.sys.Dialog",
				"_riaswIdInModule": "mConsole",
				//"caption": rias.i18n.desktop.console,
				"initDisplayState": "hidden",
				dialogType: "tip",
				"selected": false,
				"closable": true,
				closeDelay: -1,
				//hiddenConnector: true,
				"toggleable": true,
				displayStateOnToggle: "hidden",
				"displayStateOnBlur": "",
				"displayStateOnHover": "",
				"displayStateOnLeave": "",
				moduleMeta: "riasw/module/console",
				//"region": "",
				"restrictBox": {
					"bottom": "3em",
					"right": "1em"
				},
				"style": {
					"height": "20em",
					"width": "30em"
				}
			}]
		}
	]
};
	
});
