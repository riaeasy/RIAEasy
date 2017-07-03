
define([
	"riasw/riaswBase",
	"riasw/layout/_PanelWidget",
	"riasw/sys/_FormMixin",
	"riasw/sys/_ModuleMixin",
	"riasw/sys/_HistoryMixin",
	"riasw/sys/_HistoryHashMixin",
	"riasw/sys/Loadingtip"
], function(rias, _PanelWidget, _FormMixin, _ModuleMixin, _HistoryMixin, _HistoryHashMixin, Loadingtip){

	//rias.theme.loadThemeCss([
	//	"riasw/sys/Desktop.css"
	//]);

	var riaswType = "riasw.sys.Desktop";
	var Widget = rias.declare(riaswType, [_PanelWidget, _FormMixin, _ModuleMixin, rias.has("ie") <= 9 ? _HistoryHashMixin : _HistoryMixin],{

		baseClass: "riaswDesktop",

		checkModifiedWhenHide: false,

		loadingtipUnderlayOpacity: 0.1,

		animate: false,
		moduleMeta: "",

		heartbeatUrl: "",
		heartbeat: 0,///minutes
		idleCount: 3,///3次心跳无操作，则 idle，应该 > 1
		operPersistUrl: "",
		operPersistInterval: 5000,

		persist: true,

		dataServerAddr: "",
		_setDataServerAddrAttr: function(value){
			value = value + "";
			if(value && !rias.endWith(value, "/")){
				value = value + "/";
			}
			this._set("dataServerAddr", value);
		},

		messages: null,
		messageLimit: 99,
		autoShowMessage: false,
		message: function (/*args*/) {
			if(this.isDestroyed(false)){
				return;
			}
			if(!rias.isArray(this.messages)){
				this.messages = [];
			}
			this.messages.push([(new Date()), arguments]);
			if(this.messageLimit > 0 && this.messages.length > this.messageLimit){
				this.messages.shift();
			}
			this.publish("/rias/desktop/message", this.messages);
		},
		_clearMessage: function(){
			this.messages = [];
			this.publish("/rias/desktop/message", this.messages);
		},

		autoShowConsole: true,
		autoShowMsg: false,

		constructor: function(params){
			if(rias.config.hookConsole && !rias._hookConsoleHandle){
				/// 没有 rias._hookConsoleHandle 时才 hook，this._hookConsoleHandle 表示是 self 进行的 hook 操作。
				this._hookConsoleHandle = rias._hookConsoleHandle = rias.fakeConsole._hookConsole(rias.config.hookConsole);
			}

			this.__riasrWidgetsCount = 0;
			this._riasWidgets = {};

			this.sceneDock = undefined;
		},

		postMixInProperties: function(){
			this.inherited(arguments);

			this.messages = [];

			this.oper = this.getNullOper();
			this._riasrPersist = {};
			this._resizeWidgets = [];
			this._sceneDefines = [];
			this.launchedScenes = [];
			//this.id = 'riasDesktop';///建议不设 id。
		},
		buildRendering: function(){
			this.inherited(arguments);
			rias.dom.addClass(this.domNode, "riasApp");
			rias.dom.desktopBody = this.domNode;
			rias.dom.place(rias.dom._globalTempDiv, rias.dom.desktopBody);
			this.containerNode = rias.dom.create("div");
			this.domNode.appendChild(this.containerNode);
			if(rias.hostNative){
				rias.dom.addClass(this.domNode, "mobileBody");
			}
		},
		postCreate: function(){
			var self = this;
			//self._onIsNative(self.isNative);
			//self._onLocation(self.ownerDocument.location || document.location);
			//self._onIsLocal(self.location.protocol == "file:");
			self.inherited(arguments);

			if(rias.has("rias-desktop-focusAction")){
				this.set("focusAction", rias.has("rias-desktop-focusAction"));
			}
			self.own(
				rias.subscribe("/rias/create/done", function(params){
					if(params.widget){
						self.addWidget(params.widget);
					}
				//}), rias.subscribe("/riasr/orphan", function(params){
				//	if(params.widget){
				//		self.removeWidget(params.widget);
				//	}
				}), rias.subscribe("/rias/destroy/done", function(params){
					if(params.widget){
						self.destroyWidget(params.widget);
					}
				}), rias.subscribe("/rias/desktop/clearMessage", function(){
					self._clearMessage();
				}), self._onBeforeUnload = rias.on(window, "beforeunload", function(e){
					var r;
					if(self.oper.logged && self.operPersistUrl){
						r = self.saveOperPersist(true);
					}
					e = e || window.event;
					var modi = self.get("modified");
					if(modi){
						modi = "有数据已修改，尚未保存.\n是否放弃修改?";
					}else{
						modi = "";
					}
					console.debug("desktop.beforeunload - " + modi);
					// For IE and Firefox prior to version 4
					if(e && modi) {
						e.returnValue = modi;
					}
					return modi;
				}), self._onUnload = rias.on(window, "unload", function(e){
					console.debug("desktop.unload");
					self.destroy();
					if(self._hookConsoleHandle){
						self._hookConsoleHandle.remove();
						delete self._hookConsoleHandle;
					}
				}));
		},
		destroyDesktop: function(){
			if(this._focusQueue){
				this._focusQueue.length = 0;
			}
			if(this._focusAnimateHandle){
				this._focusAnimateHandle.remove();
				delete this._focusAnimateHandle;
			}
			if(this._focusRule){
				this._focusRule.remove();
				delete this._focusRule;
			}
			if(this._focusPlay){
				this._focusPlay.stop(true);
				this._focusPlay = undefined;
			}
			this._resizeWidgets.length = 0;
			if(this.persistChangeHandle){
				this.persistChangeHandle.remove();
				this.persistChangeHandle = undefined;
			}

			this.stopHeartbeat();

			rias.forEach(rias.objToArray(this._riasWidgets), function(id){
				this.destroyWidget(id);
			}, this);

			rias.rt._destroyAll();
			this._sceneDefines.length = 0;
		},
		_onDestroy: function(){
			this.destroyDesktop();
			this.inherited(arguments);
			this.messages = undefined;
			if(rias.desktop === this){
				rias.desktop = undefined;
			}
		},
		_onStartup: function(){
			var self = this;
			self.own(
				rias.subscribe("/rias/xhr/401", function(params){
					if(rias.xhr.isOrigin(params.url)){
						rias.desktop.doLogin({
							around: params.popupArgs ? params.popupArgs.around : undefined
						});
					}
				}), rias.subscribe("/riasr/persistChange", function(params){
					self.persistChangeHandle = rias._debounce(self.id + "PersistChange", function(){
						self.persistChangeHandle = undefined;
						if(self.oper.logged && self.operPersistUrl){
							self.saveOperPersist();
						}
					}, self, self.operPersistInterval, function(){
						//console.debug(this.id + "PersistChange debounce pass...");
					})();
				})
			);

			self.initDisplayState = "showNormal";
			self.inherited(arguments);

			this._doContainerChanged();
		},

		//_onIsNative: function(value, oldValue){
		//	this.isNative = !!value;
		//},
		//_onLocation: function(value, oldValue){
		//	this.location = value + "";
		//},
		//_onIsLocal: function(value, oldValue){
		//	this.isLocal = !!value;
		//},

		doing: function(msg){
			rias.publish("/rias/desktop/doing", [msg]);
		},
		done: function(msg){
			rias.publish("/rias/desktop/done", [msg]);
		},

		_setDefaultTimeoutAttr: function(timeout){
			if(rias.isNumber(timeout) && (timeout > 999)){
				rias.xhr.defaultTimeout = timeout;
			}
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
				widget.id = widget.ownerModule() && widget._riaswIdInModule ? (widget.ownerModule().id + "_" + widget._riaswIdInModule) :
					rias.rt.getUniqueId(this.id + "_" + rias.rt._getUniqueCat(widget), this);
			}
			if(this._riasWidgets[widget.id]){
				throw new Error("Tried to register widget with id['" + widget.id + "'],\n but that id is already registered.");
			}
			this._riasWidgets[widget.id] = widget;
			this.__riasrWidgetsCount++;
		},
		//removeWidget: function(/*String|riasWidget*/id){
		//	if(!rias.isString(id)){
		//		if(!(id = id.id)){
		//			throw new Error("desktop.removeWidget: invalid id: " + id);
		//		}
		//	}
		//	if(this._riasWidgets[id]){
		//		delete this._riasWidgets[id];
		//		this.__riasrWidgetsCount--;
		//	}
		//},
		destroyWidget: function(/*String|riasWidget*/id){
			if(!rias.isString(id)){
				if(!(id = id.id)){
					throw new Error("desktop.destroyWidget: invalid id: " + id);
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
		byId: function(/*String|Widget*/ id){
			return typeof id === "string" ? this._riasWidgets[id] : undefined;
		},
		//by: function(/*String|DOMNode|Dijit|riasWidget*/any){
		//	return typeof any == "string" ? this._riasWidgets[any] : any.id ? this._riasWidgets[any.id] : undefined;
		//},

		addResizeWidget: function(widget, initResize){
			var self = this,
				result = [];

			function _do(w){
				///注意：要排除 desktop 自身，否则 self.resize 会递归。
				if(w !== self && !rias.contains(self._resizeWidgets, w, "w")){
					console.debug("desktop.addResizeWidget - " + w.id);
					var h = {
						remove: function(){
							self.removeResizeWidget(w);
						}
					};
					result.push(h);
					self._resizeWidgets.push({
						w: w,
						h: w.own(h)[0]
					});
					if(initResize != false){
						w.resize();
					}
				}
			}

			if(rias.isArray(widget)){
				rias.forEach(widget, function(w){
					_do(w);
				});
			}else{
				_do(widget);
			}
			return result;
		},
		removeResizeWidget: function(widget){
			var self = this;

			function _do(w){
				var i, h;
				i = rias.indexOfByAttr(self._resizeWidgets, w, "w");
				if(i >= 0){
					console.debug("desktop.removeResizeWidget - " + w.id);
					h = self._resizeWidgets[i];
					self._resizeWidgets.splice(i, 1);///先执行 splice，避免 h.h.remove() 递归
					h.h.remove();
				}
			}

			if(rias.isArray(widget)){
				rias.forEach(widget, function(w){
					_do(w);
				});
			}else{
				_do(widget);
			}
		},
		_layoutChildren: function(/*String?*/ changedChildId, /*Number?*/ changedChildSize){
			this.inherited(arguments);
			rias.forEach(this._resizeWidgets, function(w){
				w.w.resize();
			});
		},
		_resize: function(){
			//console.debug("resize - " + this.id);
			///注意： body 有 margin，而 getContentBox(body) 没有去掉 margin，不知道为什么，所以需要在 css 中设置 margin: 0
			var box = rias.dom.getContentBox(this.getParentNode());
			rias.dom.setContentSize(this.domNode, box);
			this.layout();
			this.needResizeContent = false;
			return box;
		},
		_show: function(){
			return this.inherited(arguments);
		},

		// =========================== //

		activating: function(){
			this._idleCount = 0;
			//console.debug("desktop activating.");
		},
		onDesktopIdle: function(){
			console.debug("desktop idle - " + new Date() + " - desktop: " + this.id);
			if(this.oper.logged){
				///this.logout();
				this.doLogin({
					dialogType: "modal"
				});
			}
		},
		postHeartbeat: function(){
			/// postHeartbeat 需要重载具体实现
		},
		startHeartbeat: function(){
			var self = this;
			self._totalHeartbeat = self._idleCount = 0;
			if(!(this.heartbeat > 1)){
				console.error("startHeartbeat - The heartbeat must > 1, current is " + self.heartbeat);
				return;
			}
			self._hIdleCount = self.on("mousedown,keydown", function(){
				self.activating();
			});
			self._hHeartbeat = setInterval(function(){
				self._totalHeartbeat++;
				self._idleCount++;
				if(self._idleCount >= self.idleCount){
					self.onDesktopIdle();
				}else{
					console.debug("desktop heartbeat - _idleCount: " + self._idleCount + ", _totalHeartbeat: " + self._totalHeartbeat + " - desktop: " + this.id);
					if(self.oper.logged && self.heartbeatUrl){
						self.postHeartbeat();
					}
				}
			}, self.heartbeat * 60000);
			console.debug("startHeartbeat - " + self.heartbeat + " minutes, " + self.heartbeatUrl + " - desktop: " + this.id);
		},
		stopHeartbeat: function(){
			if(this._hHeartbeat){
				clearInterval(this._hHeartbeat);
				delete this._hHeartbeat;
			}
			if(this._hIdleCount){
				this._hIdleCount.remove();
				delete this._hIdleCount;
			}
			console.debug("stopHeartbeat - desktop: " + this.id);
		},
		_setHeartbeatAttr: function(value){
			if(!(value >= 0)){
				value = 0;
			}
			this._set("heartbeat", value);
			if(this.heartbeat > 0){
				this.startHeartbeat();
			}else{
				this.stopHeartbeat();
			}
		},

		initOk: false,
		init: function(){
			this.initOk = true;
		},
		_afterParse: function(){
			var self = this;
			rias.dom.doc.title = self.desktopTitle;
			self._loadingtip = rias.newRiasw(Loadingtip, {
				ownerRiasw: self,
				_riaswIdInModule: "loadingtip",
				loadingtipUnderlayOpacity: self.loadingtipUnderlayOpacity
			});
			self._loadingtip.placeAt(self);
			self.inherited(arguments);
		},
		_afterLoadedAll: function(loadOk){
			var m = this,
				args = arguments;
			if(!loadOk){
				return m.inherited(args);
			}else{
				return m.launchScene(this.initScenes || []).then(function(result){
					return rias.when(m.init()).always(function(){
						return m.inherited(args);
					});
				}, function(err){
					console.error(m.id + "._afterLoadedAll error.", err);
				});
			}
		},

		getNullOper: function(){
			return {
				"logged": false,
				"code": "",
				"name": "",
				"petname": "",
				"dept": "",
				"rights": {}
			};
		},
		hasRight: function (rightCode){
			if(!this.oper.logged){
				return false;
			}
			rightCode = rias.trim(rightCode).toLowerCase();
			rightCode = this.oper.rights[rightCode];
			return rightCode == true;
		},
		loadOperPersist: function(){
			//rias.mixinDeep(this._riasrPersist, {});
		},
		compactOperPersist: function(){
			/*var name, v,
				result = {};
			function walk(obj, r){
				for(name in obj){
					if(obj.hasOwnProperty(name)){
						v = obj[name];
						if(v != undefined){
							if(rias.isObjectExact(v)){
								walk(v, r[name]);
							}else{
								r[name] = v;
							}
						}
					}
				}
			}
			walk(this._riasrPersist, result);
			return result;*/
			return rias.mixinDeep_exact({}, this._riasrPersist);
		},
		needSaveOperPersist: function(){
			var p = this.compactOperPersist();
			if(rias.isEqual(this._savedOperPersist, this._riasrPersist)){
				return false;
			}
			return p;
		},
		saveOperPersist: function(){
			this._savedOperPersist = this.compactOperPersist();
			return rias.when(true);
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
			var m = this,
				a = [rias.hitch(m, m.afterLogin)];
			m._idleCount = 0;
			if(!m.oper.logged){
				return m._afterLogout();
			}else{
				m.loadOperPersist();
				/// afterLogin 由 allInOrder 来执行
				rias.forEach(rias.concatUnique(m.getRiasrElements(), m.launchedScenes), function(c){
					if(c && rias.isFunction(c.afterLogin)){
						a.push(rias.hitch(c, c.afterLogin));
					}
				});
				return rias.allInOrder(a, rias.defaultDeferredTimeout, function(){
					console.error("desktop._afterLogin timout.", arguments);
				});
			}
		},
		"login": function (args){
			/// login 需要重载具体实现
			//if(!this.initOk){
				this.oper.logged = false;
			//}
			return this._afterLogin();
		},
		"doLogin": function (args){
			/// doLogin 需要重载具体实现
			return this.login();
		},
		"afterLogout": function (){
		},
		"_afterLogout": function (){
			var m = this,
				a = [];
			/// afterLogout 由 allInOrder 来执行
			rias.forEach(rias.concatUnique(m.getRiasrElements(), m.launchedScenes), function(c){
				if(c && rias.isFunction(c.afterLogout)){
					a.push(rias.hitch(c, c.afterLogout));
				}
			});
			a.push(rias.hitch(m, m.afterLogout));
			var d = rias.allInOrder(a, rias.defaultDeferredTimeout, function(){
				console.error("desktop._afterLogout timout.", arguments);
			});
			return d.then(function(){
				for(var i = m.launchedScenes.length - 1; i >= 0; i--){
					if(m.launchedScenes[i] && m.launchedScenes[i].closable){
						rias.destroy(m.launchedScenes[i]);///已经 after destroy，无需 removeItems
					}
				}
			});
		},
		"logout": function (args){
			args = args || {};
			var m = this,
				d,
				url;
			function _after(){
				m.oper = m.getNullOper();
				return m._afterLogout();
			}
			return rias.when(m.saveOperPersist()).always(function(){
				if(rias.isFunction(m.actions)){
					url = m.actions().logout;
				}else if(rias.isObject(m.actions)){
					url = m.actions.logout;
				}
				if(url){
					d = rias.xhr.post({
						url: url,
						handleAs: "json",
						timeout: m.defaultTimeout
					}, args.data).then(function(result){
							return _after();
						}, function(result){
							return _after();
						});
				}else{
					d = _after();
				}
				console.info("desktop logout.");
				return d;
			});
		},
		"doLogout": function (args){
			args = args || {};
			var m = this;
			m._doingLogout = rias.choose({
				_riaswIdInModule: "winLogout",
				iconClass: "loginIcon",
				//id: "winLogout",
				caption: rias.i18n.desktop.logout,
				//closeDelay: 0,
				content: "是否退出?",
				//resizable: false,
				//maxable: false,
				//minable: false,
				//state: 0,
				//style: {
				//	"font-size": "15px"
				//},
				onSubmit: function(){///因为 服务端 有可能处理 logout 出错，这里用 onSubmit 以忽略服务端
					m.logout();
					m._doingLogout = undefined;
				}
			}, m, args.around || args.popupArgs && args.popupArgs.around);
			return m._doingLogout;
		},

		// ============================ //

		addSceneDefine: function(args){
			var m = this,
				id,
				idx;

			function _do(arg){
				id = arg.sceneId;
				if(!id){
					console.error("addSceneDefine need sceneId.", args);
					return;
				}
				idx = rias.indexOfByAttr(m._sceneDefines, id, "sceneId");
				if(idx >= 0){
					rias.mixinDeep(m._sceneDefines[idx], arg);
				}else{
					arg._riaswType = "riasw.sys.Scene";
					arg._riaswIdInModule = id;
					m._sceneDefines.push(arg);
				}
			}

			if(rias.isArray(args)){
				rias.forEach(args, function(arg){
					_do(arg);
				});
			}else if(args){
				_do(args);
			}
			return this._sceneDefines;
		},
		removeSceneDefine: function(id){
			var idx;
			if(rias.isString(id)){
				idx = rias.indexOfByAttr(this._sceneDefines, id, "sceneId");
				if(idx >= 0){
					this._sceneDefines.splice(idx, 1);
				}
			}else if(rias.isRiaswScene(id) || rias.isRiaswParam(id)){
				return this.removeSceneDefine(id.sceneId);
			}
			return this._sceneDefines;
		},
		getSceneDefine: function(id){
			var idx;
			if(rias.isString(id)){
				idx = rias.indexOfByAttr(this._sceneDefines, id, "sceneId");
				if(idx >= 0){
					return this._sceneDefines[idx];
				}
			}else if(rias.isRiaswScene(id) || rias.isRiaswParam(id)){
				return this.getSceneDefine(id.sceneId);
			}
			return null;
		},
		getLaunchedScene: function(scene){
			var idx;
			if(rias.isString(scene)){
				idx = rias.indexOfByAttr(this.launchedScenes, scene, "sceneId");
				if(idx >= 0){
					return this.launchedScenes[idx];
				}
			}else if(rias.isRiaswScene(scene)){
				if(rias.contains(this.launchedScenes, scene)){
					return scene;
				}
			}else if(rias.isRiaswParam(scene)){
				idx = rias.indexOfByAttr(this.launchedScenes, scene.sceneId, "sceneId");
				if(idx >= 0){
					return this.launchedScenes[idx];
				}
			}
			return null;
		},
		_getCurrentSceneAttr: function(){
			return this.sceneContainer.get("selectedChild");
		},
		_setCurrentSceneAttr: function(scene){
			var m = this;
			return this.launchScene(scene).always(function(){
				return m.get("currentScene");
			});
		},
		_launch: function (args, owner, parent){
			var self = this,
				asDialog = (args._riaswType === "riasw.sys.Dialog"),
				doing,
				dLaunch = rias.newDeferred(),
				ts = args.caption || "",
				c;
			function _getStyle(moduleParams, meta){
				var _box;
				_box = rias.dom.getContentBox(parent.containerNode);
				moduleParams.style = rias.mixinDeep({}, {
					height: rias.toInt(rias.max(_box.h * 0.8, 360)) + "px",
					width: rias.toInt(rias.max(_box.w * 0.8, 640)) + "px"
				}, meta ? meta.style : null, moduleParams.style);
				return moduleParams.style;
			}
			function _after(ok, result){
				if(ok){
					dLaunch.resolve(result);
					result.whenLoadedAll(function(){
						rias.desktop.done(doing);
					});
				}else{
					rias.desktop.done(doing);
					dLaunch.reject(result);
				}
			}
			function _parse(){
				var _dfMeta = rias.newDeferred("launchApp._parse.require", rias.defaultDeferredTimeout, function(){
					this.cancel();
				});
				if(rias.isString(args.moduleMeta)){
					try{
						rias.require([args.moduleMeta], function(meta){
							_dfMeta.resolve(rias.mixinDeep({}, meta));///返回副本，避免被修改
						});
					}catch(e){
						_dfMeta.reject(e);
					}
				}else{
					_dfMeta.resolve(args.moduleMeta);
				}
				_dfMeta.then(function(meta){
					var moduleParams = rias.mixinDeep({}, args, {
						///ownerRiasw: (args.ownerRiasw != undefined ? args.ownerRiasw : owner),///rias.parseRiasws 会忽略 ownerRiasw
						//parent: (args.parent != undefined ? args.parent : parent),
						"_riaswType": args._riaswType || (asDialog ? "riasw.sys.Dialog" : "riasw.sys.Module"),
						_riaswIdInModule: args._riaswIdInModule,
						id: args.id,
						moduleMeta: meta,
						"captionClass": (args.captionClass != undefined
							? args.captionClass.indexOf("appmoduleCaption") >= 0 ? args.captionClass : args.captionClass + " appmoduleCaption"
							: "appmoduleCaption"),
						"contentClass": (args.contentClass != undefined
							? args.contentClass.indexOf("appmoduleContent") >= 0 ? args.contentClass : args.contentClass + " appmoduleContent"
							: "appmoduleContent"),
						selected: (args.selected != undefined ? args.selected : true),
						autoFocus: (args.autoFocus != undefined ? args.autoFocus : asDialog),
						closable: (args.closable != undefined ? args.closable : true),
						"dockTo": args.dockTo,// || self.appDock,
						region: (args.region != undefined ? args.region : asDialog ? "" : "center"),///Dialod 强制 region = ""
						resizable: (args.resizable != undefined ? args.resizable : !!asDialog),// !meta.region,
						maxable: (args.maxable != undefined ? args.maxable : !!asDialog),
						"toggleable": (args.toggleable != undefined ? args.toggleable : !!asDialog),
						"displayStateOnHover": (args.displayStateOnHover != undefined ? args.displayStateOnHover : ""),
						displayStateOnBlur: (args.displayStateOnBlur != undefined ? args.displayStateOnBlur : ""),
						displayStateOnLeave: (args.displayStateOnLeave != undefined ? args.displayStateOnLeave : ""),
						alwaysShowDockNode: (args.alwaysShowDockNode != undefined ? args.alwaysShowDockNode : true)
					});
					moduleParams.style = rias.dom.styleToObject(moduleParams.style);
					if(asDialog){
						_getStyle(moduleParams, meta);
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
					//delete moduleParams.asDialog;
					//delete moduleParams.idOfModule;
					delete moduleParams.reCreate;
					if(asDialog && args.parent){
						if(!moduleParams.popupArgs){
							moduleParams.popupArgs = {};
						}
						if(!moduleParams.popupArgs.parent){
							moduleParams.popupArgs.parent = args.parent;
						}
					}
					delete args.parent;
					rias._deleDP(moduleParams);
					doing = rias.i18n.action.launch + " - " + (args.caption || args._riaswIdInModule || args.id ||
						(rias.isObjectExact(args.moduleMeta) ? args.moduleMeta.caption || args.moduleMeta.id || "" : rias.isString(args.moduleMeta) ? args.moduleMeta : ""));
					rias.desktop.doing(doing);
					rias.parseRiasws(moduleParams, owner, parent).then(function(result){
						if(result.errors){
							rias.error(result.errors, self);
							_after(false, result);///有错，则不返回 模块。
						}else if((c = result.widgets[0])){
							self.defer(function(){
								///交由 c.selected 控制
								//if(asDialog){
								//	_after(true, c);
								//}else{
								//	parent.selectChild(c).always(function(){
								//		_after(true, c);
								//	});
								//}
								_after(true, c);
							}, 10);
						}else{
							_after(false, result);///有错，则不返回 模块。
						}
					});
				}, function(e){
					rias.error(e.message, self);
					_after(false, e);///有错，则不返回 模块。
				});
			}

			parent = (asDialog ? owner : parent);
			if(!owner || !parent){
				dLaunch.reject();
				rias.error("desktop._launch params error, need a owner and a parent.");
				return dLaunch.promise;
			}
			if(args._riaswIdInModule){
				if((c = owner[args._riaswIdInModule])){
					if(!args.reCreate){
						if(rias.is(c, "riasw.sys.Dialog")){
							c.select(true);
							_after(true, c);
						}else{
							parent.selectChild(c).always(function(){
								_after(true, c);
							});
						}
					}else{
						var h = rias.after(c, "_afterDestroyed", function(){
							_parse();
							h.remove();
							h = undefined;
						}, false);
						rias.destroy(c);
					}
				}
			}
			if(!c){
				_parse();
			}
			return dLaunch.promise;
		},
		launchScene: function(args){
			var m = this,
				w;

			function _do(arg){
				w = m.getLaunchedScene(arg);
				if(w && !w.reCreate){/// reCreate 只有 arg 为 riaswParams 时才会存在
					return m.sceneContainer.set("selectedChild", w);
				}
				if(rias.isString(arg)){
					arg = m.getSceneDefine(arg);
				}
				if(!rias.isObjectSimple(arg)){
					console.error("The scene params error.", arg);
					return rias.newDeferredReject("The scene params error.");
				}
				if(!arg.sceneId || !rias.isString(arg.sceneId)){
					console.error("The sceneId params error.", arg.sceneId);
					return rias.newDeferredReject("The sceneId params error.");
				}
				arg._riaswType = "riasw.sys.Scene";
				arg._riaswIdInModule = arg.sceneId;
				arg.desktop = m;
				if(arg.region == undefined){
					arg.region = "center";
				}
				if(arg.dockTo == undefined){
					arg.dockTo = m.sceneDock;
				}
				if(arg.alwaysShowDockNode == undefined){
					arg.alwaysShowDockNode = true;
				}
				if(arg.closable == undefined){
					arg.closable = false;
				}
				if(arg.showCaption == undefined){
					arg.showCaption = false;
				}
				if(arg.toggleable == undefined){
					arg.toggleable = false;
				}
				m.addSceneDefine(arg);
				return rias.when(m.oper.logged || arg.requireLogged != true || m.doLogin({
					dialogType: "modal"
				})).then(function(result){
					return m._launch(arg, m, m.sceneContainer).then(function(scene){
						function _click(node){
							node.toggleTarget(true);
							node.defer(function(){
								node.targetWidget.toggleContextOption();
							}, 33);
						}
						m.launchedScenes.push(scene);
						scene.whenLoadedAll(function(){
							if(scene.alwaysShowDockNode){
								scene.dockNode.set("onClick", function(evt){
									_click(this);
									return false;
								});
							}else{
								scene.makeDockNodeArgs = function(){
									return rias.mixinDeep(rias.isFunction(arg.makeDockNodeArgs) ? arg.makeDockNodeArgs.apply(this, arguments || []) : {}, {
										onClick: function(evt){
											_click(this);
											return false;
										}
									});
								};
							}
						});
						var _h = rias.after(scene, "_afterDestroyed", function(){
							_h.remove();
							rias.removeItems(m.launchedScenes, scene);
						}, true);
						return scene;
					});
				});
			}

			if(!rias.isArray(args)){
				args = [args];
			}
			return rias.allInOrder(args, rias.debugDeferredTimeout ? rias.defaultDeferredTimeout : 0, function(arr){
				this.cancel();
			}, function(item){
				return _do(item);
			});
		},
		closeScene: function(id, removeDefine){
			var w = this.getLaunchedScene(id);
			if(w){
				rias.destroy(w);
			}
			if(removeDefine){
				this.removeSceneDefine(id);
			}
		}

	});

	if(rias.has("rias-desktop-focusAction")){
		Widget.extend({
			focusAction: "none",/// none, outline, animate
			focusActionColor: "darkorange",
			focusActionStyle: "dashed",
			focusActionWidth: 2,
			focusActionOffset: -2,
			focusAnimateDuration: 1000,
			_setFocusActionAttr: function(value){
				this.focusAction = value;
				var self = this;
				if(value.indexOf("animate") >= 0){
					if(!this._focusAnimateHandle){
						this._focusAnimateHandle = this.own(this._focusManager.watch("currNode", function(name, oldVal, newVal){
							if(newVal){
								self._doFocusAnimate(newVal, self.focusAnimateDuration,
									//rias.dom.getStyle(newVal, "border-color"),
									self.focusActionColor, self.focusActionWidth, self.focusActionOffset);
							}
						}))[0];
					}
				}else{
					if(this._focusAnimateHandle){
						this._focusAnimateHandle.remove();
						delete this._focusAnimateHandle;
					}
				}
				if(value.indexOf("outline") >= 0){
					if(!this._focusRule){
						this._focusRule = rias.theme.addCssRule(".riaswFocused", {
							"outline-color": this.focusActionColor,
							"outline-style": this.focusActionStyle,
							"outline-width": this.focusActionWidth + "px",
							"outline-offset": this.focusActionOffset + "px"
						});
					}
				}else{
					if(this._focusRule){
						this._focusRule.remove();
						delete this._focusRule;
					}
				}
			},
			_doFocusAnimate: function(node, duration, outlineColor, outlineWidth, outlineOffset){
				var self = this;
				if(!node || !rias.dom.isVisible(node)){
					if(self._focusQueue.length){
						self._doFocusAnimate.apply(self, self._focusQueue.shift());/// queue 保存的是 arguments，需要用 apply
					}
					return;
				}
				if(!this._focusQueue){
					this._focusQueue = [];
				}
				if(this._focusPlay){
					this._focusQueue.push(arguments);
					return;
				}
				var s = node.style,
					s0 = {
						outlineColor: s.outlineColor,
						outlineStyle: s.outlineStyle,
						outlineWidth: s.outlineWidth,
						outlineOffset: s.outlineOffset
					};
				//s.borderStyle = "solid";
				s.outlineColor = outlineColor;
				s.outlineStyle = this.focusActionStyle;
				s.outlineWidth = outlineWidth + "px";
				s.outlineOffset = outlineOffset + "px";
				this._focusPlay = rias.fx.animateProperty({
					node: node,
					duration: self._focusQueue.length ? 150 : duration,
					//properties: {
					//borderColor: {
					//	start: startColor,
					//	end: endColor
					//},
					//borderWidth: {
					//	start: startWidth,
					//	end: endWidth
					//},
					//outlineColor: {
					//	start: endColor,
					//	end: endColor
					//}
					//},
					onEnd: function(){
						//console.debug("_doFocusAnimate - " + (widget ? widget.id ? widget.id : widget : "nothing") + (widget && widget.isDestroyed(false) ? " - destroyed." : ""));
						self._focusPlay = undefined;
						rias.dom.setStyle(node, s0);
						if(self._focusQueue.length){
							self._doFocusAnimate.apply(self, self._focusQueue.shift());/// queue 保存的是 arguments，需要用 apply
						}
					},
					onStop: function(){
						self._focusQueue.length = 0;
						rias.dom.setStyle(node, s0);
					}
				});
				this._focusPlay.play();
			}
		});
	}

	/*Widget._riasdMeta = {
		visual: true
	};*/

	return Widget;

});