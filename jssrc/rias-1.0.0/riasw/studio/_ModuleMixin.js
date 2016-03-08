
define([
	"rias"
], function(rias){

	var riasType = "rias.riasw.studio._ModuleMixin";
	var Widget = rias.declare(riasType, null,{

		///暴露给 riasd.widgetEditor
		requires: [],//自身定义的 requires 没用，在 rias.filer 会忽略，使用 meta 的 requires 代替。
		moduleCss: [],//自身定义的 moduleCss 没用，在 rias.filer 会忽略，使用 meta 的 moduleCss 代替。
		//_riaswChildren: [],//自身定义的 _riaswChildren 没用，在 rias.filer 会忽略，使用 meta 的 _riasChildren 代替。
		//events: [],//自身定义的 events 没用，在 rias.filer 会忽略，使用 meta 的 events 代替。

		moduleParams: {},

		///moduleMeta: "", //moduleMeta 要参与 isRiaswModule() 判断，不能在 rias.riasw.studio._ModuleMixin 中初始化，可以在 rias.riasw.studio.Module 和 rias.riasw.studio.App 中初始化。
		content: "",

		loadOnStartup: true,
		//_lazyLoad: true,// false,
		onLoadDeferred: null,
		loadingMessage: "<span class='riaswModuleLoading'><span class='dijitInline riaswModuleLoadingIcon'></span>${rias.i18n.message.loading}</span>",
		errorMessage: "<span class='riaswModuleLoading'><span class='dijitInline riaswModuleLoadingError'></span>${rias.i18n.message.loadError}</span>",
		isLoading: false,
		isLoaded: false,

		// extractContent: Boolean
		//		Extract visible content from inside of `<body> .... </body>`.
		//		I.e., strip `<html>` and `<head>` (and it's contents) from the href
		extractContent: false,
		// parseOnLoad: Boolean
		//		Parse content and create the widgets, if any.
		parseOnLoad: true,
		// parserScope: String
		//		Flag passed to parser.  Root for attribute names to search for.   If scopeName is dojo,
		//		will search for data-dojo-type (or dojoType).  For backwards compatibility
		//		reasons defaults to dojo._scopeName (which is "dojo" except when
		//		multi-version support is used, when it will be something like dojo16, dojo20, etc.)
		parserScope: dojo._scopeName,
		// Flag to parser that I'll parse my contents, so it shouldn't.
		stopParser: true,

		postMixInProperties: function(){
			this.loadingMessage = rias.substitute(this.loadingMessage);
			this.errorMessage = rias.substitute(this.errorMessage);
			this.inherited(arguments);
		},
		buildRendering: function(){
			this.inherited(arguments);
		},
		postCreate: function(){
			this.inherited(arguments);
			///this._onContent(this.content);///无需初始化
			this._initAttr([{
				name: "moduleMeta",
				initialize: false
			}]);
		},
		destroyDescendants: function(/*Boolean*/ preserveDom){
			if(this.isLoaded){
				this._onUnload();
			}
			if(this._contentSetter){
				// Most of the widgets in setter.parseResults have already been destroyed, but
				// things like Menu that have been moved to <body> haven't yet
				rias.forEach(this._contentSetter.parseResults, function(widget){
					rias.destroy(widget, preserveDom);
				});
				delete this._contentSetter.parseResults;
			}
			this.inherited(arguments);
			if(!preserveDom){
				rias.dom.empty(this.containerNode);
			}
		},
		destroy: function(){
			this.cancelLoad();
			try{
				this._beforeDestroy();
			}catch(e){
				console.error(rias.getStackTrace(e));
			}
			this.inherited(arguments);
		},

		startup: function(){
			var self = this;
			if(self._started){
				return;
			}
			if(self._needLoad || (!self.isLoading && !self.isLoaded && self.loadOnStartup)){
				rias.when(self._load(), function(){
				});
			}
			self.inherited(arguments);
		},
		///在为完成 child.loaded 之前，this.isLoaded 不准确。
		/*_checkRestrict: function(box){
			var change = false;
			if(!this.isLoaded){
				return change;
			}
			return this.inherited(arguments);
		},*/
		_show: function(newState){
			var self = this,
				arg = arguments,
				d = rias.newDeferred();
			if(self.isLoading && self.onLoadDeferred){
				//if(self._lazyLoad){
				//	rias.when(self.inherited(arg), function(){
				//		d.resolve(self);
				//	});
				//}else{
					self.onLoadDeferred.then(function(){
						rias.when(self.inherited(arg), function(){
							d.resolve(self);
						});
					});
				//}
			}else if(!self.isLoading && (self._needLoad || !self.isLoaded)){
				//if(self._lazyLoad){
				//	rias.when(self.inherited(arg), function(){
				//		d.resolve(self);
				//	});
				//	self._load();
				//}else{
					rias.when(self._load(), function(){
						rias.when(self.inherited(arg), function(){
							d.resolve(self);
						});
					});
				//}
			}else{
				//self._startChildren();
				rias.when(self.inherited(arg), function(){
					d.resolve(self);
				});
			}
			d.then(function(){
				if(self._needLoadedAndShown && self._wasResized){
					self.afterLoadedAndShown();
					delete self._needLoadedAndShown;
				}
			});
			return d.promise;
		},
		_onModuleMeta: function(/*String|Object*/meta){
			//this.content = "";
			//this.href = "";
			this.moduleMeta = meta;
			return this._load();
		},
		_load: function(){
			var self = this,
				r = self._beforeLoad();
			if(r){
				///很重要！须在 ready 后再载入，以保证 dom 初始化正确。
				//ready(100, function())是dojo.parser.parse().
				//ready(1000, function())是缺省.
				rias.ready(1000, function(){
					if(self._beingDestroyed){
						return false;
					}
					//self.defer(function(){
						self._loadModuleMeta();
					//});
				});
			}
			return r;
		},
		cancelLoad: function(){
			//this._onStartupDeferred = null;
			this.onLoadDeferred = null;
			/// cancel children，可能导致 children load 失败，在 children.destroy 中 cancel
			/*rias.forEach(this.getChildren(), function(child){
				//if(rias.isRiaswModule(child)){
				if(rias.isInstanceOf(child, Widget)){
					if(rias.isFunction(child.cancelLoad)){
						child.cancelLoad();
					}
				}
			});*/
		},

		_startChildren: function(){
			if(this._started){
				rias.forEach(this.getChildren(), function(obj){
					if(!obj._started && !obj._beingDestroyed && rias.isFunction(obj.startup)){
						obj.startup();
						obj._started = true;
					}
				});
				if(this._contentSetter){
					rias.forEach(this._contentSetter.parseResults, function(obj){
						if(!obj._started && !obj._beingDestroyed && rias.isFunction(obj.startup)){
							obj.startup();
							obj._started = true;
						}
					}, this);
				}
			}
		},
		_setContent: function(/*String|DocumentFragment*/ content){
			///该方法不继承。继承不好处理。
			var self = this;

			///this._stopPlay();/// _stopPlay 会导致显示不正确。
			///TODO:zensst.闪烁问题。需要支持自动 height，不能固定 height。
			//rias.dom.setBox(this.containerNode, {
			//	h: rias.dom.getBox(this.containerNode).h
			//});
			self.destroyDescendants();

			if(rias.isDijit(content) || rias.isDomNode(content)){
				self.parseOnLoad = false;
			}else{
				self.parseOnLoad = true;
				//content = rias.toHTMLStr(content);
			}
			var setterParams = rias.mixin({
				cleanContent: self.cleanContent,
				extractContent: self.extractContent,
				parseContent: !content.domNode && self.parseOnLoad,
				parserScope: self.parserScope,
				startup: false,
				dir: self.dir,
				lang: self.lang,
				textDir: self.textDir
			}, self._contentSetterParams || {});

			if(!(self._contentSetter && self._contentSetter instanceof rias.html._ContentSetter)){
				self._contentSetter = new rias.html._ContentSetter({
					node: self.containerNode,
					_onError: rias.hitch(self, self._onError),
					onContentError: function(e){
						var errMess = self.onContentError(e);
						try{
							self.containerNode.innerHTML = errMess;
						}catch(e){
							console.error('Fatal ' + self.id + ' could not change content due to ' + e.message, e);
						}
					}
				});
			}
			var p = self._contentSetter.set((rias.isObject(content) && content.domNode) ? content.domNode : content, setterParams);

			return rias.when(p && p.then ? p : self._contentSetter.parseDeferred, function(){
				// setter params must be pulled afresh from the ContentPane each time
				delete self._contentSetterParams;
			});
		},

		///TODO:zensst.最好改在 resize 流程中处理。
		_initSize: function(){
			/// _loadModuleMeta 时设置 containerNode，这里是设置 domNode，params 是 create 时的 params
			/*if(params){
				if(params.style){
					this.set("style", params.style);
					//rias.dom.setStyle(this.containerNode, rias.mixin({}, params.style, {top: "0px", left: "0px"}));
				}
				if(params.region){
					this.set("region", params.region);
				}
			}*/
			if(this._resizeParent){
				//this.needLayout = true;///_loadModuleMeta 后，强行 layout()
				//this.resize();///先 resize 确定自身位置大小，再 parent.resize();
				this._resizeParent();
			}
		},
		_beforeLoadMeta: function(){
			this._beforeUpdateSize(this.id + " - _beforeLoadMeta.");
			//在 _loadModuleMeta 之前，没有“继承”关系.
			if (rias.isFunction(this.beforeLoadMeta)){
				this.beforeLoadMeta();
			}
		},
		_afterLoadMeta: function(meta){
			if(this.moduleParams){
				rias.mixinDeep(this._riaswModuleMeta, this.moduleParams);
			}
			//if (rias.isFunction(this._riaswModuleMeta.afterLoadMeta)){
			//	rias.hitch(this, this._riaswModuleMeta.afterLoadMeta)(this._riaswModuleMeta);
			//}
			if (rias.isFunction(this.afterLoadMeta)){
				this.afterLoadMeta(this._riaswModuleMeta);
			}
			this._afterUpdateSize(this.id + " - _afterLoadMeta.");
		},
		_beforeFiler: function(meta){
			this._setContent("");
			//if (rias.isFunction(this._riaswModuleMeta.beforeFiler)){
			//	rias.hitch(this, this._riaswModuleMeta.beforeFiler)(meta);
			//}
			if (rias.isFunction(this.beforeFiler)){
				this.beforeFiler(meta);
			}
		},
		_afterFiler: function(/*{widgets: widgets, parent: parent, module: m}*/result){
			//if (rias.isFunction(this._riaswModuleMeta.afterFiler)){
			//	rias.hitch(this, this._riaswModuleMeta.afterFiler)(result);
			//}
			if (rias.isFunction(this.afterFiler)){
				this.afterFiler(result);
			}
		},
		_beforeDestroy: function(){
			if (rias.isFunction(this.beforeDestroy)){
				this.beforeDestroy();
			}
			//if (this._riaswModuleMeta && rias.isFunction(this._riaswModuleMeta.beforeDestroy)){
			//	rias.hitch(this, this._riaswModuleMeta.beforeDestroy)();
			//}
		},

		onUnload: function(){
		},
		_onUnload: function(){
			this.isLoaded = false;
			try{
				this.onUnload();
			}catch(e){
				console.error('Error ' + this.widgetId + ' running custom onUnload code: ' + e.message);
			}
		},
		beforeLoad: function(){
			return true;
		},
		_beforeLoad: function(){
			var self = this;
			self.cancelLoad();
			if(self.beforeLoad() != false){
				delete self._needLoad;
				self.isLoading = true;
				self.isLoaded = false;
				self.onLoadDeferred = rias.newDeferred(rias.hitch(self, "cancelLoad"));
				//self.onLoadDeferred.then(rias.hitch(self, "afterLoaded"));
				self.onLoadDeferred.then(function(result){
					self.afterLoaded(result);
					if(self.isShown(true) && self._wasResized){
						self.afterLoadedAndShown();
					}else{
						self._needLoadedAndShown = true;
					}
				});
				//rias.dom.removeClass(self.containerNode, "riaswDialogPanelContentMessage");
				return self.onLoadDeferred.promise;
			}else{
				self._needLoad = true;
				return false;
			}
		},
		afterLoaded: function(result){
		},
		afterLoadedAndShown: function(){
		},
		_afterLoaded: function(result, noResolve){
			var self = this;
			self.isLoaded = true;
			self.isLoading = false;
			self._startChildren();

			try{
				if(!noResolve){
					if(self.onLoadDeferred){
						self.onLoadDeferred.resolve(result);
					}
				}else{

				}
			}catch(e){
				console.error('Error ' + self.widgetId + ' running custom onLoaded code: ' + e.message);
			}

			if(result && result.errors){
				rias.error(result.errors);
			}
		},
		_loadModuleMeta: function(){
			var self = this,
				errs = "";
			function _do(func, args){
				try{
					func.apply(self, rias.toArray(arguments, 1));
				}catch(e){
					console.error(e, self, rias.getStackTrace(e));
					if(e instanceof Error){
						errs += e.message + "\n";
					}else{
						errs += e + "\n";
					}
				}
			}
			function _af(result){
				_do(self._afterFiler, result);
				self.defer(function(){
					_do(self._afterLoaded, result);
				});
			}
			function _e(s, e){
				if(e instanceof Error){
					console.error(s, self, rias.getStackTrace(e));
				}else{
					console.error(s, self);
				}
				rias.filer([{
						_riaswType: "rias.riasw.studio.DefaultError",
						errorMessage: s
					}], self, self).then(function(result){
						result.errors = s;
						_af(result);
					});
			}
			function _filer(){
				//if(rias.isDebug){
				//	console.debug(self.id, self);
				//}
				////使用 self 而不是 _riaswModuleMeta 的 _riaswChildren 创建，保持 _riaswModuleMeta 不变。
				//_do(self._beforeFiler, self);
				_do(self._beforeFiler, self);
				rias.filer(self._riaswChildren, self, self).then(function(result){
					_af(result);
				}, function(error){
					_e("loading Module error:\n" + error.message + "\n\n" + errs, error);
				});
			}
			function _pro(meta, mixinMeta){
				//使用副本，避免原始 meta 被修改.
				self._riaswModuleMeta = rias.mixinDeep({}, meta);
				//self._riaswModuleMeta = rias.delegate(meta);///? delete 是否会影响原型？
				_do(self._afterLoadMeta, self._riaswModuleMeta);
				delete self._riaswModuleMeta._riaswType;
				///delete self._riaswModuleMeta._riaswChildren;//保留，后面要使用 meta 的 _riaswChildren 创建
				delete self._riaswModuleMeta._riaswIdOfModule;
				///delete self._riaswModuleMeta._riaswVersion;//保留
				rias._deleDP(self._riaswModuleMeta, true, false, false);//保留 _riaswChildren，后面要使用 meta 的 _riaswChildren 创建

				///为了实现自动布局，由 params 的 region 和 style 设置，params 不设置时，由 ModuleMeta.style 处理。
				// 都不设置时，再在？先删除 ModuleMeta.region，
				//delete self._riaswModuleMeta.region;

				/*///loadMeta 时，self.params 中的值有可能已经改变，需要取当前值，用 rias.copy
				var p = rias.mixinDeep(rias.copy(rias.mixin({}, self.params), self), mixinMeta);*/
				///还是取 初始值 好些。
				var p = rias.mixinDeep({}, self.params, mixinMeta);
				delete p._riaswType;
				delete p.ownerRiasw;
				//delete p._riaswChildren;//在下面的 rias._deleDP 中删除，使用 meta 的 _riaswChildren 创建
				//delete p._riaswIdOfModule;//保留运行期的 _riaswIdOfModule
				delete p._riaswVersion;
				/*delete p._riasrOwner;
				delete p._riasrParent;
				delete p._riasrChildren;
				delete p._riasrModule;
				delete p._riaspParent;
				delete p._riaspChildren;
				delete p._riasrWidget;*/
				///rias._deleDP(p, false, false, false);
				delete p.moduleMeta;///避免设计期循环，可以用 module.params 或者 module._riaswModuleMeta
				if(self._riaswModuleMeta.moduleMeta){///避免设计期循环
					if(rias.isDebug){
						console.debug(self.id + ": _riaswModuleMeta.moduleMeta = " + self._riaswModuleMeta.moduleMeta, self);
					}
					delete self._riaswModuleMeta.moduleMeta;
				}
				rias._deleDP(p, false, false, false);

				var pn,
					_p = p;
				//p = rias.mixinDeep({}, self._riaswModuleMeta, p);///使用 _riaswModuleMeta._riaswChildren
				p = rias.mixinDeep({}, self._riaswModuleMeta);
				rias.decodeRiaswParams(self, p);
				/// p.style(_riaswModuleMeta.style) 是设置 containerNode 的（Module.containerNode = domNode）
				/// parames.style 是设置 domNode 的，在 create 中已经设置了，这里不能 mixin
				/// CaptionPanel/DialogPanel 等有 CaptionNode 存在，不应该设置 domNode.style，而应该设置 containerNode
				rias.dom.setStyle(self.containerNode, p.style);
				self._initSize();
				rias.deleteDeep(p, _p);
				delete p.style;
				///先混合 meta，避免执行 _setXXXAttr 出现错误。此时不会触发 _onXXX()。
				///这里用 safeMixin ，而不是 mixinDeep，直接取代原型中属性。
				for(pn in _p){
					///需要重新 set 在 _riaswModuleMeta 中有 _setXXXAttr 的 params 值
					/// _p 是 parames，检测 p(self._riaswModuleMeta)，此时的 p 已经是 params 中未覆盖的 _setXXXAttr
					/// 此时，p 中可能没有 p[pn]，所以不能 p.hasOwnProperty(pn)
					if(p["_set" + rias.upperCaseFirst(pn) + "Attr"]){/// _setClassAttr 不是 function
						p[pn] = _p[pn];
					}
				}
				_p = rias.mixin({}, p);
				for(pn in _p){
					if(_p.hasOwnProperty(pn) && self["_set" + rias.upperCaseFirst(pn) + "Attr"]){/// _setClassAttr 不是 function
						delete _p[pn];
					}
				}
				rias.mixinDeep(self, _p);
				for(pn in p){
					//if(p.hasOwnProperty(pn) && rias.isFunction(self["_set" + rias.upperCaseFirst(pn) + "Attr"])){
					if(p.hasOwnProperty(pn) && self["_set" + rias.upperCaseFirst(pn) + "Attr"]){/// _setClassAttr 不是 function
						self.set(pn, p[pn]);
					}
				}
				var r = self.requires,
					c = self.moduleCss;
				r = rias.isString(r) ? [r] : rias.isArray(r) ? r : [];
				c = rias.isString(c) ? [c] : rias.isArray(c) ? c : [];
				if(c.length > 0){
					rias.theme.loadWebAppCss(c);
				}
				try{
					if(r.length > 0){
						rias.require(r, function(){
							//if(self.onLoadDeferred){
								rias.hitch(self, _filer)();
							//}
						}, function(moduleId){
							_e("require module's requires error:" + r);
						});
					}else{
						rias.hitch(self, _filer)();
					}
				}catch(e){
					_e("require module's requires error:" + e.message, e);
				}
			}

			///self.destroyRiasrChildren(); /// _beforeFile 中调用 setContent("");
			if(!self.moduleMeta){
				try{
					self.moduleMeta = {};
					_do(self._beforeLoadMeta);
					rias.hitch(self, _pro)(self.moduleMeta);
				}catch(error){
					_e("creating Module error:" + error.message, error);
				}
			}else{
				if(self.moduleMeta.$refObj){//
					self.moduleMeta = rias.getObject(self.moduleMeta.$refObj, 0, self) || rias.getObject(self.moduleMeta.$refObj) || rias.by(self.moduleMeta.$refObj);
				}else if(self.moduleMeta.$refScript){//
					try{
						self.moduleMeta = rias.$refByModule(self, self.moduleMeta.$refScript, self.id + "[moduleMeta]");
					}catch(e){
						self.moduleMeta = {};
					}
				}
			}
			if(rias.isObjectSimple(self.moduleMeta)){
				try{
					if(self.moduleMeta.moduleMeta){
						_e("Please rias.mixinDeep(moduleMeta, moduleMeta.moduleMeta).");
					}else{
						_do(self._beforeLoadMeta);
						rias.hitch(self, _pro)(self.moduleMeta);
					}
				}catch(error){
					_e("creating Module error:" + error.message, error);
				}
			}else if(rias.isString(self.moduleMeta)){
				try{
					//self.moduleMeta = self.moduleMeta.replace(/\.js$/g, "").replace(/\./g, "/") + ".js";
					_do(self._beforeLoadMeta);
					rias.require([self.moduleMeta], function(meta){
						//if(self.onLoadDeferred){
							rias.hitch(self, _pro)(meta);
						//}
					});
				}catch(error){
					_e("require moduleMeta error:" + error.message, error);
				}
			}else{
				_e("The Module must has moduleMeta.");
			}

			//不检查 self.onLoadDeferred === null 的情况，如果调用不正常，就报错。
			return self.onLoadDeferred.promise;
		}

	});

	return Widget;

});