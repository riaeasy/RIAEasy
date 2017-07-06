
define([
	"riasw/riaswBase"
], function(rias){

	var riaswType = "riasw.sys._ContentMixin";
	var Widget = rias.declare(riaswType, null,{

		content: "",
		href: "",
		//ioArgs: {},
		preventCache: false,

		//_loadContentDeferred: null,
		//_loadAllDeferred: null,
		_loadingMessage: "<span class='riaswModuleLoading'><span class='dijitInline riaswModuleLoadingIcon'></span>${0}</span>",
		_errorMessage: "<span class='riaswModuleLoading'><span class='dijitInline riaswModuleLoadingError'></span>${0}</span>",
		loadingMessage: rias.i18n.message.loading,
		errorMessage: rias.i18n.message.loadError,
		contentLoading: false,
		contentLoaded: false,
		loadError: false,
		loadMetaOnStartup: true,
		loadAllDeferredTimeout: 30,//seconds, 0 is no

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
			this.inherited(arguments);
			this.loadingMessage = rias.substitute(this._loadingMessage, [this.loadingMessage]);
			this.errorMessage = rias.substitute(this._errorMessage, [this.errorMessage]);
			this._loadingDeferreds = [];
			if(!rias.isObject(this.ioArgs)){
				this.ioArgs = {};
			}
		},
		postCreate: function(){
			if(!this.contentNode){///可能在 _TemplatedMixin 之前，buildRendering 中不能正确获取 containerNode
				this.contentNode = this.containerNode;
			}
			this.inherited(arguments);
		},
		destroyDescendants: function(/*Boolean*/ preserveDom){
			/// 只清除动态创建的 content
			this._clearContent();
			this.inherited(arguments);
		},
		_onDestroy: function(){
			try{
				this._cancelLoad();
			}catch(e){
				console.error(e);
			}
			delete this.contentNode;
			this.inherited(arguments);
		},

		_onStartup: function(){
			this.inherited(arguments);
			if(!this.contentLoading && !this.contentLoaded){
				this.load();
			}
		},
		_startChildren: function(){
			if(this._started){
				if(this._contentSetter){
					rias.forEach(this._contentSetter.parseResults, function(obj){
						if(!obj._started && !obj.isDestroyed(true) && rias.isFunction(obj.startup)){
							obj.startup();
							obj._started = true;
						}
					}, this);
				}
			}
		},

		_onHrefAttr: function(/*String|Uri*/ href){
			if(href && this.moduleMeta){
				throw this.id + " - The moduleMeta already exists, can not set the href parameter.";
			}
			//this.content = "";
			//this.moduleMeta = "";
			this.href = href;
			if(this._started){
				this.load();
			}
		},
		_onContentAttr: function(/*String|DomNode|Nodelist*/content){
			if(content && (this.moduleMeta || this.href)){
				throw this.id + " - The moduleMeta or href already exists, can not set the content parameter.";
			}
			//this.href = "";
			//this.moduleMeta = "";
			this.content = content;// rias.isString(content) ? rias.toHTMLStr(content) : content;
			if(this._started){
				this.load();
			}
		},
		//_getContentAttr: function(){
		//	return this.content;
		//},

		_show: function(newState){
			var self = this,
				args = arguments,
				d = rias.newDeferred();
			function _do(){
				rias.when(self.inherited(args), function(){
					self._loadAllDeferred.promise.always(function(){
						try{
							return d.resolve(!self.loadError);
						}catch(e){
							console.error("_afterLoadedAll execute error:", e, self);
							rias.error("_afterLoadedAll execute error:\n" + e, self);
							return rias.newDeferredReject(e);
						}
					});
				});
			}
			if(!self.contentLoading && !self.contentLoaded){
				self.load();
			}
			if(self.contentLoading && self._loadContentDeferred){
				self._loadContentDeferred.promise.always(function(){
					///需要 loadMeta 之后再 inherited
					_do();
				});
			}else{
				_do();
			}
			return d.then(function(result){
				if(self._needLoadedAllAndShown){// && self._wasResized){
					try{
						self._needLoadedAllAndShown = undefined;
						result = self._afterLoadedAllAndShown(!self.loadError);
					}catch(e){
						result = rias.newDeferredReject(e);
						console.error("after _afterLoadedAllAndShown execute error:", e, self);
						rias.error("after _afterLoadedAllAndShown execute error:\n" + e, self);
					}
				}
				return result;
			});
		},

		_cancelLoad: function(){
			this._cancelLoadHref();

			if(this._whenLoadedDeferred){
				this._whenLoadedDeferred.cancel(this.id + "._whenLoadedDeferred _cancelLoad.");
				this._whenLoadedDeferred = undefined;
			}
			if(this._contentSetter){
				if(this._contentSetter.parseDeferred){
					this._contentSetter.parseDeferred.cancel(this.id + "._contentSetter _cancelLoad.");
					delete this._contentSetter.parseDeferred;
				}
				delete this._contentSetter;
			}
			if(this._loadContentDeferred){
				this._loadContentDeferred.cancel(this.id + "._loadContentDeferred _cancelLoad.");
			}
			if(this.getOwnerModule()){
				rias.removeItems(this.getOwnerModule()._loadingDeferreds, this._loadContentDeferred);
			}
			this._loadContentDeferred = undefined;
			///使用后进先出，并逐一删除。
			for(var i = this._loadingDeferreds.length - 1; i >= 0; i--){
				this._loadingDeferreds.pop().cancel();
			}
			if(this._loadAllDeferred){
				this._loadAllDeferred.cancel(this.id + "._loadAllDeferred _cancelLoad.");
				this._loadAllDeferred = undefined;
			}
		},
		beforeLoad: function(){
			return true;
		},
		_beforeLoad: function(callback){
			var self = this;
			///_cancelLoad 释放了 _contentSetter，故应先 _clearContent，再 cancel
			self._clearContent();
			self._cancelLoad();
			self.loadError = false;
			self.contentLoading = true;
			self.contentLoaded = false;
			self._loadContentDeferred = rias.newDeferred(this.id + "._loadContentDeferred", rias.defaultDeferredTimeout, function(){
				this.cancel();
			}, self);
			//self._beforeUpdateSize(this.id + " - _beforeLoad.");
			self._loadContentDeferred.then(function(result){
				try{
					var r = self.afterLoaded(result);
					if(r == undefined){
						r = result;
					}
					return r;
				}catch(e){
					console.error("afterLoaded execute error:", e, self);
					rias.error("afterLoaded execute error:\n" + e, self);
				}
			}, function(result){
				///始终归并到 resolve，用 loadError 来判断
				self.loadError = true;
				return result;
			}).then(function(result){
				rias.all(self._loadingDeferreds, rias.defaultDeferredTimeout, function(arr, _p){
					this.cancel();
				}, self).then(function(){
					//self.loadError = false;
					return result;///注意：需要返回原始值
				}, function(err){
					///始终归并到 resolve，用 loadError 来判断
					self.loadError = true;
					return err;
				}).always(function(result){
					///始终归并到 resolve，用 loadError 来判断
					self.contentLoaded = true;
					self.contentLoading = false;
					self._loadingDeferreds = [];
					//self._afterUpdateSize(this.id + " - _afterLoaded.");
					self._loadAllDeferred.resolve(result);///注意 _result 和 result 的区别
				});
			});
			self._loadAllDeferred = rias.newDeferred(this.id + "._loadAllDeferred", rias.defaultDeferredTimeout << 1, function(){
				this.cancel();
			});
			self._loadAllDeferred.promise.always(function(){
				/*try{
					return self._afterLoadedAll(!self.loadError);
				}catch(e){
					console.error("_afterLoadedAll execute error:", e, self);
					rias.error("_afterLoadedAll execute error:\n" + e, self);
					return rias.newDeferredReject(e);
				}*/
				return rias.when(!self.isDestroyed(false) && self._afterLoadedAll(!self.loadError));
			});
			if(self.getOwnerModule()){
				self.getOwnerModule()._loadingDeferreds.push(self._loadContentDeferred);
			}
			//rias.dom.removeClass(self.containerNode, "riaswDialogContentMessage");
			rias.when(self.beforeLoad(), function(){
				return callback.apply(self, []);
			}, function(e){
				self._loadContentDeferred.cancel(e);
			});
			return self._loadAllDeferred.promise;
		},
		afterLoaded: function(result){
		},
		_afterLoaded: function(result){
			var self = this;
			self._startChildren();

			function _af(){
				self._loadContentDeferred.resolve(result);
			}
			try{
				if(self._loadContentDeferred){
					if(self._contentSetter && self._contentSetter.parseDeferred){
						self._contentSetter.parseDeferred.then(function(){
							_af();
						});
					}else{
						_af();
					}
				}else{
					console.debug(self.id + " has no _loadContentDeferred.");
				}
			}catch(e){
				console.error('Error ' + self.widgetId + ' running custom onLoaded code: ' + e.message);
			}

			if(result && result.errors){
				rias.error(result.errors, self);
			}
		},
		afterLoadedAll: function(loadOk){
		},
		_afterLoadedAll: function(loadOk){
			var self = this;
			return rias.when(self.afterLoadedAll(loadOk)).always(function(result){
				if(self.isShowing()){
					self._whenDisplayed(function(){
						try{
							result = self._afterLoadedAllAndShown(loadOk);
						}catch(e){
							result = rias.newDeferredReject(e);
							console.error("_afterLoadedAllAndShown execute error:", e, self);
							rias.error("_afterLoadedAllAndShown execute error:\n" + e, self);
						}
					});
				}else{
					self._needLoadedAllAndShown = true;
				}
				if(self._whenLoadedDeferred){
					//if(self._whenLoadedDeferred._needWhenDeferredResolve){
					self._whenLoadedDeferred.resolve(loadOk);
					//}
					result = self._whenLoadedDeferred.promise;
				}
				return result;
			});
		},
		afterLoadedAllAndShown: function(loadOk){
		},
		_afterLoadedAllAndShown: function(loadOk){
			this.afterLoadedAllAndShown(loadOk);
			this.set("needResizeContent", true);
			this._containerLayout();
			this._doInitFocusedChild();
			//console.debug("_afterLoadedAllAndShown - " + this.id);
			if(this.get("selected") && this.autoFocus && this._needFocus()){///_needFocus 包含 isFocusable
				//console.debug("focus - _afterLoadedAllAndShown - " + this.id);
				this.focus();///需要立即 focus，刷新 focusedStack，不能 defer
			}
		},
		_doLoad: function(){
			if(!this.isDestroyed(true)){
				//this.defer(function(){
				///需要等待 给 _started 赋值
				//this._setLoadingMessage(this.loadingMessage).then(function(){
				this._loadContent();
				//});
				//}, 10);
			}
		},
		load: function(){
			var self = this;
			///由于 ready 无法取消，故需要检测 contentLoading
			if(!this.contentLoading){
				this._beforeLoad(function(){
					///很重要！须在 ready 后再载入，以保证 dom 初始化正确。
					//ready(100, function())是dojo.parser.parse().
					//ready(1000, function())是缺省.
					rias.ready(1000, function(){
						self._doLoad();
					});
				});
			}
			return this._loadAllDeferred.promise;
		},
		refresh: function(){
			return this.load();
		},
		whenLoadedAll: function(callback){
			//只应该对本次 load 有效，即 new _loadAllDeferred 之后，不应该 always 之前的。
			var self = this,
				d = self._whenLoadedDeferred;
			if(!d){
				d = self._whenLoadedDeferred = rias.newDeferred(function(){
					self._whenLoadedDeferred = undefined;
				});
			}
			if(!self.isDestroyed(true)){
				if(self.contentLoaded){
					d.resolve(!self.loadError);
				}
				return d.promise.always(function(){
					if(rias.isFunction(callback)){
						return callback.apply(self, [!self.loadError]);
					}
					return !self.loadError;
				});
			}
			d.cancel(this.id + " is destroyed.");
			return d.promise;
		},

		_clearContent: function(){
			/// 只清除 contentNode
			if(this._contentSetter){
				this._contentSetter.empty();
			}
		},
		_setContent: function(/*String|DocumentFragment*/ content){
			///该方法不继承。继承不好处理。
			if(!this.contentNode){
				//rias.error(this.id + " must has a contentNode.");
				return rias.newDeferredReject(this.id + " must has a contentNode.");
			}

			var self = this;

			///this._stopPlay();/// _stopPlay 会导致显示不正确。
			self._clearContent();

			var setterParams = rias.mixin({
				cleanContent: self.cleanContent,
				extractContent: self.extractContent,
				parseContent: self.parseOnLoad,// && !content.domNode,
				parserScope: self.parserScope,
				startup: false,/// 用 _startChildren 手动 startup。
				dir: self.dir,
				lang: self.lang,
				textDir: self.textDir
			}, self._contentSetterParams || {});

			if(!self._contentSetter || !(self._contentSetter instanceof rias.dom.html._ContentSetter)){
				self._contentSetter = new rias.dom.html._ContentSetter({
					node: self.contentNode
				});
			}
			return self._contentSetter.setContent((rias.isObject(content) && content.domNode) ? content.domNode : content, setterParams);
		},

		_cancelLoadHref: function(){
			if(this._xhrDfd){
				this._xhrDfd.cancel();
			}
			this._xhrDfd = undefined; // garbage collect
		},
		_loadContent: function(){
			var self = this,
				errs = "";
			function _when(func, args){
				var r;
				try{
					r = func.apply(self, rias.argsToArray(arguments, 1));
				}catch(e){
					console.error(e, self);
					if(e instanceof Error){
						errs += e.message + "\n";
					}else{
						errs += e + "\n";
					}
				}
				return rias.when(r).then(function(result){
					return result;
				}, function(e){
					console.error(e, self);
					if(e instanceof Error){
						errs += e.message + "\n";
					}else{
						errs += e + "\n";
					}
				});
			}
			function _af(){
				self.defer(function(){///保证 _loadContentDeferred 正确 fullFilled
					_when(self._afterLoaded, self.content).then(function(){
						if(errs){
							rias.error(errs);
						}
					});
				});
			}
			function _e(s, e){
				if(e instanceof Error){
					console.error(s, self);
					errs += e.message + "\n";
				}else{
					console.error(s, self);
					errs += e + "\n";
				}
				if(self.contentNode){
					self._setContent(errs).then(function(){
						_af();
					});
				}else{
					_af();
				}
			}
			function _bind(){
				if(self.contentNode){
					self._setContent(self.content).then(function(){
						_af();
					}, function(error){
						_e("setContent error:\n" + error.message, error);
					});
				}else{
					_af();
				}
			}
			function _loadHref(href){
				var getArgs = {
					preventCache: self.preventCache,
					url: href,
					timeout: self.loadAllDeferredTimeout || rias.xhr.defaultTimeout,
					handleAs: "text"
				};
				self._cancelLoadHref();
				if(rias.isObject(self.ioArgs)){
					rias.mixin(getArgs, self.ioArgs);
				}
				self._xhrDfd = (self.ioMethod || rias.xhr.get)(getArgs);
				return self._xhrDfd.then(
					function(html){
						self.content = html;
					},
					function(err){
						if(!self._xhrDfd.canceled){
							self.content = "_loadHref error: " + err;
						}else{
							self._cancelLoadHref();
							self.content = "_loadHref cancel.";
						}
						return err;
					}
				);
			}

			if(self.href){
				_loadHref(self.href).then(function(){
					_when(_bind);
				});
			}else{
				_when(_bind);
			}

			//不检查 self._loadAllDeferred === null 的情况，如果调用不正常，就报错。
			return self._loadAllDeferred.promise;
		}

	});

	return Widget;

});