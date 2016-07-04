
//RIAStudio client runtime widget - ContentPanel

define([
	"rias",
	"rias/riasw/layout/Panel",
	"rias/riasw/form/_FormMixin",
	"rias/riasw/studio/_ModuleMixin"
], function(rias, Panel, _FormMixin, _ModuleMixin){

	//rias.theme.loadRiasCss([
	//	"layout/Panel.css"
	//]);

	var riasType = "rias.riasw.layout.ContentPanel";
	var Widget = rias.declare(riasType, [Panel, _FormMixin, _ModuleMixin], {

		href: "",
		preventCache: false,

		ioArgs: {},
		timeout: rias.xhr.defaultTimeout,

		buildRendering: function(){
			this.inherited(arguments);
		},
		postCreate: function(){
			this.inherited(arguments);
			///不应该初始化，否则会导致 moduleMeta、href、content 错乱
			//moduleMeta 要参与 isRiaswModule() 判断，不能在 rias.riasw.studio._ModuleMixin 中初始化，可以在 rias.riasw.studio.Module 和 rias.riasw.studio.App 中初始化。
			///this._onModuleMeta(this.moduleMeta);///无需初始化？
			///this._onHref(this.href);///无需初始化
			///this._onContent(this.content);///需要初始化
			this._initAttr([{
				name: "href",
				initialize: false
			}, {
				name: "content",
				initialize: false
			}]);
		},

		startup: function(){
			var self = this;
			if(self._started){
				return;
			}
			self.inherited(arguments);
		},

		_afterLoadedAndShown: function(){
			this.set("modified", false);
			this.inherited(arguments);
		},

		cancelLoad: function(){
			if(this._xhrDfd && (this._xhrDfd.fired == -1)){
				this._xhrDfd.cancel();
			}
			this._xhrDfd = undefined; // garbage collect

			//this.onLoadDeferred = null;
			this.inherited(arguments);
		},

		_load: function(){
			var self = this,
				r = self._beforeLoad();
			if(r){
				///很重要！须在 ready 后再载入，以保证 dom 初始化正确。
				//ready(100, function())是dojo.parser.parse().
				//ready(1000, function())是缺省.
				rias.ready(1000, function(){
					if(self.isDestroyed(true)){
						return;
					}
					self.defer(function(){
						///需要等待 给 _started 赋值
						if(!self._riaswChildren || self._riaswChildren.length < 1){
							self._setContent(self.loadingMessage).then(function(){
								if(self.moduleMeta){
									self._loadModuleMeta();
								}else if(self.href){
									self._loadHref();
								}else{
									self._loadContent();
								}
							});
						}else{
							self._initSize();
							self._afterLoaded(self._riasrChildren);
						}
					}, 150);
				});
			}
			return r;
		},
		_loadHref: function(){
			var self = this;
			var getArgs = {
				preventCache: self.preventCache,
				url: self.href,
				timeout: self.timeout || rias.xhr.defaultTimeout,
				handleAs: "text"
			};
			if(rias.isObject(self.ioArgs)){
				rias.mixin(getArgs, self.ioArgs);
			}
			var hand = (self._xhrDfd = (self.ioMethod || rias.xhr.get)(getArgs)),
				returnedHtml;
			hand.then(
				function(html){
					returnedHtml = html;
					try{
						self._isDownloaded = true;
						return self._setContent(html).then(function(){
							self._initSize();
							self._afterLoaded(html);
						});
					}catch(err){
						self._onError('Content', err); // onContentError
						return err;
					}
				},
				function(err){
					if(!hand.canceled){
						// show error message in the pane
						self._onError('Load', err);
					}else{
						self.cancelLoad();
					}
					self._xhrDfd = undefined;
					return err;
				}
			).then(function(){
					self._xhrDfd = undefined;
					return returnedHtml;
				});
		},
		_loadContent: function(){
			var self = this;
			self._isDownloaded = false; // mark that content is from a set('content') not a set('href')
			self._setContent(self.content || "").then(function(result){
				//rias.dom.addClass(self.containerNode, "riaswDialogPanelContentMessage");
				self._initSize();
				self._afterLoaded(self.content);
			});
		},
		_loadChildren: function(){
			var self = this;
			self._isDownloaded = false; // mark that content is from a set('content') not a set('href')
			//self._setContent("");
			rias.filer([]/*self._riaswChildren*/, self, self._riasrModule).then(function(result){
				if(result.errors){
					self._onError('Load', "Filer children error:\n" + result.errors);
				}else{
					self._initSize();
					self._afterLoaded(result);
				}
			}, function(error){
				self._onError('Load', "Filer children error:\n" + error.message);
			});
		},

		_onHref: function(/*String|Uri*/ href){
			//this.content = "";
			//this.moduleMeta = "";
			this.href = href;
			return this._load();
		},
		_onContent: function(/*String|DomNode|Nodelist*/content){
			//this.href = "";
			//this.moduleMeta = "";
			this.content = content;// rias.isString(content) ? rias.toHTMLStr(content) : content;
			return this._load();
		},
		_getContentAttr: function(){
			return this.containerNode.innerHTML;
		},

		onContentError: function(/*Error*/ /*===== error =====*/){
		},
		onLoadError: function(/*Error*/ /*===== error =====*/){
			return this.errorMessage;
		},
		_onError: function(type, err, consoleText){
			var self= this,
				errText = self['on' + type + 'Error'].call(self, err);
			self.loadMetaDeferred.reject(err);
			if(consoleText){
				console.error(consoleText, err);
			}else if(errText){// a empty string won't change current content
				self._setContent(errText).then(function(){
					self._initSize();
					self._afterLoaded(errText, true);
				});
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswPaneIcon",
		iconClass16: "riaswPaneIcon16",
		defaultParams: {
		}
	};

	return Widget;

});
