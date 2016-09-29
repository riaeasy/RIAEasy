
define([
	"rias",
	"rias/riasw/layout/_PanelBase",
	"rias/riasw/form/_FormMixin",
	"rias/riasw/studio/_ModuleMixin",
	"rias/riasw/studio/Loading"
], function(rias, _PanelBase, _FormMixin, _ModuleMixin, Loading){

	//rias.theme.loadThemeCss([
	//	"riasw/studio/App.css"
	//]);

	var _riasWidgets = {};
	var riaswType = "rias.riasw.studio.App";
	var Widget = rias.declare(riaswType, [_PanelBase, _FormMixin, _ModuleMixin],{

		_focusStack: true,

		baseClass: "webApp",
		//isLayoutContainer: true,

		animate: false,
		//moduleMeta 要参与 isRiaswModule() 判断，不能在 rias.riasw.studio._ModuleMixin 中初始化，可以在 rias.riasw.studio.Module 和 rias.riasw.studio.App 中初始化。
		moduleMeta: "",
		dataServerAddr: "",

		_setDataServerAddrAttr: function(value){
			value = value + "";
			if(value && !rias.endWith(value, "/")){
				value = value + "/";
			}
			this._set("dataServerAddr", value);
		},

		constructor: function(params){
			this.__riasrWidgetsCount = 0;
			this._riasWidgets = _riasWidgets;

			this.riasdFileSelector = undefined;
			this.mainModule = undefined;
			this.mainMenu = undefined;
			this.mainDock = undefined;
			this.mainWorkbench = undefined;
			this.datas = undefined;
			this.launchedModules = {};
		},
		postMixInProperties: function(){
			this.webApp = this;
			this.oper = this.getNullOper();
			this.inherited(arguments);
			//this.id = 'rias.webApp';///建议不设 id，即 rias.webApp 不绑定 domNode，而直接是 riasWidget。
			//this.loadMetaOnStartup = false;
		},
		buildRendering: function(){
			this.inherited(arguments);
			rias.dom.webAppNode = this.domNode;
			//rias.dom.addClass(this.domNode, "webApp");
			if(rias.hostNative){
				rias.dom.addClass(this.domNode, "mobileBody");
			}
		},
		postCreate: function(){
			var self = this;
			self._onIsNative(self.isNative);
			//self._onLocation(self.ownerDocument.location || document.location);
			//self._onIsLocal(self.location.protocol == "file:");
			self.inherited(arguments);
			self.own(self._onBeforeUnload = rias.on(window, "beforeunload", function(e){
				e = e || window.event;
				var modi = self.get("modified");
				if(modi){
					modi = "有数据已修改，尚未保存.\n是否放弃修改，退出并关闭?";
				}else{
					modi = "";
				}
				// For IE and Firefox prior to version 4
				if(e && modi) {
					e.returnValue = modi;
				}
				return modi;
			}));
		},
		destroy: function(){
			this.inherited(false);
		},
		startup: function(){
			var self = this;
			if(self._started){
				return;
			}
			self.own(rias.subscribe("_riaswPostCreate", function(params){
				if(params.widget){
					self.addWidget(params.widget);
				}
			//}),rias.subscribe("_riaswOrphan", function(params){
			//	if(params.widget){
			//		self.removeWidget(params.widget);
			//	}
			}),rias.subscribe("_riaswDestroy", function(params){
				if(params.widget){
					self.destroyWidget(params.widget);
				}
			}));
			self.inherited(arguments);
			self.initRiasd = rias.initRiasd();
		},

		_onIsNative: function(value, oldValue){
			this.isNative = !!value;
		},
		//_onLocation: function(value, oldValue){
		//	this.location = value + "";
		//},
		//_onIsLocal: function(value, oldValue){
		//	this.isLocal = !!value;
		//},

		_beforeBind: function(){
			//this._setContent("");/// App 应该允许保留已有 childrenNodes
			//if (rias.isFunction(this._riaswModuleMeta.beforeBind)){
			//	rias.hitch(this, this._riaswModuleMeta.beforeBind)(meta);
			//}
			if (rias.isFunction(this.beforeBind)){
				this.beforeBind();
			}
		},
		_loading: function(){
			var self = this;
			///很重要！须在 ready 后再载入，以保证 dom 初始化正确。
			//ready(100, function())是dojo.parser.parse().
			//ready(1000, function())是缺省.
			//ready(500, function())是 App.
			rias.ready(500, function(){
				if(!self.isDestroyed(true)){
					self.defer(function(){
						self._loadModuleMeta().then(function(result){
							if(result.errors){
								rias.error(result.errors);
							}else{
								if(self.mainModule){
									self.mainModule.whenMetaLoaded(function(isOk){
										self.afterLoadMainModule.apply(self, isOk ? [self.mainModule] : []);
									});
								}
							}
						});
					}, 30);
				}
			});
		},
		_afterBind: function(){
			var self = this;
			rias.dom.doc.title = self.appTitle;
			//if(!rias.hostNative){
				self.own(self._appLoading = rias.createRiasw(Loading, {
					ownerRiasw: self,
					_riaswIdOfModule: "loading"
				}));
				//self._appLoading.set("content", rias.i18n.message.loading);
				self._appLoading.placeAt(self);
			//}
			self.inherited(arguments);
		},

		_setDefaultTimeoutAttr: function(timeout){
			rias.isNumber(timeout) && (timeout > 999) && (rias.xhr.defaultTimeout = timeout);
			this._set("defaultTimeout", rias.xhr.defaultTimeout);
		},
		_setCurrentThemeAttr: function(theme){
			if(rias.theme.currentTheme){
				rias.dom.removeClass(this.domNode, rias.theme.currentTheme);
			}
			rias.theme.currentTheme = theme + "";
			rias.dom.addClass(this.domNode, rias.theme.currentTheme);
		},
		_getCurrentThemeAttr: function(){
			return rias.theme.currentTheme;
		},

		addWidget: function(widget){
			if(!widget.id){
				widget.id = widget._riasrModule && widget._riaswIdOfModule ? (widget._riasrModule.id + "_" + widget._riaswIdOfModule) :
					rias.getUniqueId(this.id + "_" + rias._getUniqueCat(widget), this);
			}
			if(this._riasWidgets[widget.id]){
				throw new Error("Tried to register widget with id['" + widget.id + "'],\n but that id is already registered.");
			}
			this._riasWidgets[widget.id] = widget;
			this.__riasrWidgetsCount++;
		},
		//removeWidget: function(/*String|dijit*/id){
		//	if(!rias.isString(id)){
		//		if(!(id = id.id)){
		//			throw new Error("rias.riasw.studio.App.removeWidget: invalid id: " + id);
		//		}
		//	}
		//	if(this._riasWidgets[id]){
		//		delete this._riasWidgets[id];
		//		this.__riasrWidgetsCount--;
		//	}
		//},
		destroyWidget: function(/*String|dijit*/id){
			if(!rias.isString(id)){
				if(!(id = id.id)){
					throw new Error("rias.riasw.studio.App.destroyWidget: invalid id: " + id);
				}
			}
			if(this._riasWidgets[id]){
				///需要检查用什么方法释放
				rias.destroy(this._riasWidgets[id]);
				delete this._riasWidgets[id];
				this.__riasrWidgetsCount--;
			}
		},
		/*removeWidgets: function(id){
			if(rias.isString(id)){
				id = [id];
			}else if(id && rias.isString(id.id)){
				id = [id.id];
			}else if(!rias.isArray(id)){
				id = [];
			}
			var i = 0;
			for(; i < id.length - 1; i++){
				if(this._riasWidgets[id[i]]){
					delete this._riasWidgets[id[i]];
					this.__riasrWidgetsCount--;
				}
			}
		},*/
		/*destroyModuleChildren: function(module){
			var id;
			for(id in this._riasWidgets){
				if(this._riasWidgets.hasOwnProperty(id)){
					if(this._riasWidgets[id]._riasrModule == module){
						this.destroyWidget(id);
					}
				}
			}
		},*/
		byId: function(/*String|Widget*/ id){
			return typeof id == "string" ? this._riasWidgets[id] : undefined;
		},
		//by: function(/*String|DOMNode|Dijit|riasWidget*/any){
		//	return typeof any == "string" ? this._riasWidgets[any] : any.id ? this._riasWidgets[any.id] : undefined;
		//},

		_internalResize: function(){
			//console.debug(this.id, "resize in.");
			//console.trace();
			if(this.isDestroyed(true)){
				return;
			}

			rias.dom.setMarginBox(this.domNode, rias.dom.getContentMargin(this.getParentNode()));

			this.layout();
			//console.debug(this.id, "resize out.");
		},
		resize: function(){
			//console.warn("resize(): " + this.id);
			this.inherited(arguments);
		},

		// =========================== //

		doing: function(token){
			rias.publish("/rias/webApp/doing", [token]);
		},
		done: function(token){
			rias.publish("/rias/webApp/done", [token]);
		},

		getNullOper: function(){
			return {
				"logged": false,
				"code": "",
				"name": "",
				"petname": "",
				"dept": "",
				"rights": {},
				"persist": {}
			};
		},
		hasRight: function (rightCode){
			rightCode = rias.trim(rightCode).toLowerCase();
			rightCode = this.oper.rights[rightCode];
			return rightCode == true;
		},

		"actions": function (){
			return {
				"login": "",
				"logout": ""
			};
		},
		"afterLogin": function (){
		},
		"_afterLogin": function (){
			var m = this;
			if(!m.oper.logged){
				m._afterLogout();
			}else{
				rias.when(m.initDatas({}), function(){
					rias.when(m.initRiasd).always(function(result){
						if(result != false){
							rias.webApp.launchRiasdFileSelector({///这个需要 rias.webApp
								"_riaswIdOfModule": "riasdFileSelector",
								"initDisplayState": "hidden",
								"initPlaceToArgs": {
									parent: m,
									around: "riasdFileSelector._riasrDockNode",
									positions: ["below-centered"]
								},
								reCreate: false,
								autoFocus: false,
								closable: false,
								"dockTo": {
									"$refObj": "appMainDockTop"
								},
								//dialogType: "top",
								//toggleable: false,
								//toggleOnEnter: true,
								//toggleOnBlur: true,
								//closeDisplayState: "hidden",
								style: {
									width: "30em",
									height: rias.toInt(m.domNode.clientHeight * 0.7, 600) + "px",//"80em"//rias.toInt(m.domNode.clientHeight * 0.7) + "px"
									"padding": "0px"
								}
							}).always(function(result){
									if(!m.riasdFileSelector && m.mainModule){
										m.riasdFileSelector = m.mainModule.riasdFileSelector;
									}
								});
						}
						m.afterLogin();
						//return result;
					});
				});
			}
		},
		"login": function (args){
			/// login 需要重载具体实现
			this._afterLogin();
		},
		"doLogin": function (args){
			/// doLogin 需要重载具体实现
		},
		"afterLogout": function (){
		},
		"_afterLogout": function (){
			var m = this;
			if(m.launchedModules){
				var pn;
				for(pn in m.launchedModules){
					if(m.launchedModules[pn].closable){
						rias.destroy(m.launchedModules[pn]);
						delete m.launchedModules[pn];
					}
				}
			}
			if(m.riasdFileSelector){
				rias.destroy(m.riasdFileSelector);
				delete m.riasdFileSelector;
			}
			if(m.mainMenu){
				rias.destroy(m.mainMenu);
				delete m.mainMenu;
			}
			if(m.mainWorkbench){
				rias.destroy(m.mainWorkbench);
				delete m.mainWorkbench;
			}
			this.afterLogout();
		},
		"logout": function (args){
			args = args || {};
			var m = this,
				r = false,
				url;
			function _after(){
				m.oper = m.getNullOper();
				m._afterLogout();
			}
			if(rias.isFunction(m.actions)){
				url = m.actions().logout;
			}else if(rias.isObject(m.actions)){
				url = m.actions.logout;
			}
			if(url){
				r = rias.xhr.post({
					url: url,
					handleAs: "json",
					timeout: m.defaultTimeout
				}, args.data, function(result){
					_after();
				}, function(result){
					_after();
				});
			}
			return r;
		},
		"doLogout": function (around){
			var m = this;
			m._doingLogout = rias.choose({
				ownerRiasw: m,
				_riaswIdOfModule: "winLogout",
				iconClass: "loginIcon",
				around: around,
				dialogType: "modal",
				//id: "winLogout",
				caption: rias.i18n.webApp.logout,
				closeDelay: 0,
				content: "是否退出?",
				//resizable: false,
				//maxable: false,
				//minable: false,
				//state: 0,
				//cookieName: "",
				//persist: false,
				onSubmit: function(){///因为 服务端 有可能处理 logout 出错，这里用 onSubmit 以忽略服务端
					m.logout();
					m._doingLogout = undefined;
				}
			});
			return m._doingLogout;
		},
		"initDatas": function (querys){
			var m = this,
				d = rias.newDeferred();
			if(!m.datas){
				d.resolve();
			}else{
				m.datas.whenMetaLoaded(function(isOk){
					if(!isOk){
						d.reject("App.datas load error.");
						return false;
					}
					return m.datas.loadDatas(querys).then(function(result){
						d.resolve(result);
						return result;
					}, function(e){
						rias.warn({
							dialogType: "modal",
							//around: around,
							content: "初始化数据失败，请重新登录.\n" + e
						});
						d.reject(e);
						return e;
					});
				});
			}
			return d.promise;
		},

		// ============================ //

		afterLoadMainModule: function(mainModule){
			var m = this;
			m.mainModule = mainModule;
			if(mainModule){
				if(!m.riasdFileSelector){
					m.riasdFileSelector = mainModule.riasdFileSelector;
				}
				if(!m.mainDock){
					m.mainDock = mainModule.mainDock;
				}
				if(!m.mainWorkbench){
					m.mainWorkbench = mainModule.mainWorkbench;
				}
				if(!m.mainMenu){
					m.mainMenu = mainModule.mainMenu;
				}
			}else{
				m.riasdFileSelector = undefined;
				m.mainDock = undefined;
				m.mainWorkbench = undefined;
				m.mainMenu = undefined;
			}
		},

		launch: function(args){//moduleMeta, _riaswIdOfModule, caption, moduleParams, reCreate, id
			var m = this,
				launchModule, mm = m.mainModule,
				d;
			if(rias.isRiaswModule(mm) && rias.isFunction(mm.launchModule)){
				launchModule = mm.launchModule;
			}
			if(!launchModule){
				d = rias.newDeferred();
				d.reject();
				rias.error("缺少主模块或缺少主模块中的 launchModule 方法。");
				return d.promise;
			}
			if(rias.isArray(args)){
				var ds = [];
				rias.forEach(args, function(arg){
					ds.push(m.launch(arg));
				});
				return rias.all(ds);
			}else{
				d = rias.newDeferred();
				rias.when(m.oper.logged || args.requireLogged == false || m.doLogin(), function(result){
					launchModule.apply(mm, [args]).then(function(){
						d.resolve(rias.toArray(arguments));
					}, function(){
						d.reject(rias.toArray(arguments));
					});
				}, function(e){
					d.reject(e);
				});
				return d.promise;
			}
		}
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswModuleIcon",
		iconClass16: "riaswModuleIcon16",
		defaultParams: {
			//content: "<div></div>",
			//doLayout: true
			//"class": "webApp"
		}
	};

	return Widget;

});