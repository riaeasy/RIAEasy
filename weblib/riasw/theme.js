
//RIAStudio Client Runtime(rias) in Browser -- rias.Theme.

define([
	"exports",
	"riasw/hostDojo"
], function(exports, rias) {

	var _dom = rias.dom;

///theme******************************************************************************///
	var invalidCssChars = /([^A-Za-z0-9_\u00A0-\uFFFF-])/g;
	var _styleSheet = _dom.create('style');
	_dom.head.appendChild(_styleSheet);
	_styleSheet = _styleSheet.sheet || _styleSheet.styleSheet;// Keep reference to actual StyleSheet object (`styleSheet` for IE < 9)
	var removeMethod = _styleSheet.deleteRule ? 'deleteRule' : 'removeRule',// Store name of method used to remove rules (`removeRule` for IE < 9)
		rulesProperty = _styleSheet.cssRules ? 'cssRules' : 'rules';// Store name of property used to access rules (`rules` for IE < 9)

	function _toUrl(self, url){
		if(rias.isUrl(url)){
			return url;
		}
		return rias.toUrl(url);
	}
	function _toThemeUrl(self, url, themeName, mobileTheme, isApp){
		if(rias.isUrl(url)){
			return url;
		}
		if(mobileTheme){
			mobileTheme = "riasw/mobile/" + rias.formatPath(mobileTheme);
		}
		return rias.toUrl(rias.formatPath(isApp ? self.appThemePackagePath : self.riaswThemePackagePath) + rias.formatPath(themeName) + mobileTheme + url);
	}
	function _load(self, names, themeName, mobileTheme, isApp, loaded, toUrl, callback){
		var name,
			appCss = rias.formatPath(themeName) + self.themeParams.appCss,///防止重名
			currTheme = self.themeParams.name,
			currMobile = self.themeParams.mobileTheme,
			headElem = _dom.head,
			links = _dom.query('link'),
			appCssLink, riasdCssLink;
		function _some(val){
			return val.getAttribute('href') === name;
		}
		rias.forEach(links, function(link) {
			if(link.href.indexOf(appCss) > -1){
				appCssLink = link;
			}
			if(link.href.indexOf("riasd/resources/riasd.css") > -1){
				riasdCssLink = link;
			}
		});
		for(var i = 0, l = names.length; i < l; i++){
			name = names[i];
			if(!name){
				continue;
			}
			if(loaded){
				if(name in loaded){
					if(themeName === currTheme && mobileTheme === currMobile){
						continue;
					}
				}else{
					loaded[name] = 1;
				}
			}
			if(toUrl){
				name = toUrl(self, name, themeName);
			}
			if(!name.endWith(".css")){
				name += ".css";
			}
			if(links.some(_some)){
				// don't add if stylesheet is already loaded in the page
				continue;
			}

			var newLink = _dom.create('link', {
				rel: 'stylesheet',
				type: 'text/css',
				href: name
			});
			var isAppCss = name.indexOf(appCss) > -1,
				isRiasdCss = name.indexOf("riasd/resources/riasd.css") > -1;
			if(isAppCss){
				_dom.place(newLink, headElem, "", callback);
				appCssLink = newLink;
			}else if(isRiasdCss){
				if(!appCssLink){
					_dom.place(newLink, headElem, "", callback);
				}else{
					_dom.place(newLink, appCssLink, "before", callback);
				}
				riasdCssLink = newLink;
			}else if(!isApp && (riasdCssLink || appCssLink)){
				_dom.place(newLink, riasdCssLink || appCssLink, "before", callback);
			}else{
				_dom.place(newLink, headElem, "", callback);
			}
		}
	}

	var _ruleId = 0;
	rias.theme = exports;
	rias.mixin(exports, {
		riaswThemePackagePath: "riasw/themes",
		appThemePackagePath: "appweb/themes",
		themeParams: {
			name: "",
			mobileTheme: "",
			appCss: "app.css"
		},
		_loadedCss: {
			"base": {},
			"mobile": {},
			"app": {}
		},
		//toUrl: function(url){
		//	return _toUrl(this, url);
		//},
		//toThemeUrl: function(url, themeName, isApp){
		//	themeName = themeName || this.themeParams.name;
		//	if(!themeName){
		//		console.error("No themeName.");
		//		return url;
		//	}
		//	return _toThemeUrl(this, url, themeName, "", isApp);
		//},
		loadCss: function(names, callback){
			names = rias.isArray(names) ? names : rias.isString(names) ? [names] : [];
			_load(this, names, "", "", true, null, function(self, name, themeName){
				return _toUrl(self, name);
			}, callback);
		},
		loadThemeCss: function(names, isApp, callback){
			if(!this.themeParams.name){
				console.error("No themeParams.name.");
				return;
			}
			names = rias.isArray(names) ? names : rias.isString(names) ? [names] : [];
			_load(this, names, this.themeParams.name, this.themeParams.mobileTheme, isApp, isApp ? this._loadedCss.app : this._loadedCss.base, function(self, name, themeName){
				return _toThemeUrl(self, name, themeName, "", isApp);
			}, callback);
		},
		loadMobileThemeCss: function(names, callback){
			if(!this.themeParams.name){
				console.error("No themeParams.name.");
				return;
			}
			if(!this.themeParams.mobileTheme){
				console.error("No themeParams.mobileTheme.");
				return;
			}
			names = rias.isArray(names) ? names : rias.isString(names) ? [names] : [];
			_load(this, names, this.themeParams.name, this.themeParams.mobileTheme, false, this._loadedCss.mobile, function(self, name, themeName){
				return _toThemeUrl(self, name, themeName, self.themeParams.mobileTheme, false);
			}, callback);
		},
		loadTheme: function(themeName, mobileTheme, appCssName){
			if(!themeName || !rias.isString(themeName)){
				console.error("The themeName must be a string.", themeName);
				return;
			}
			if(!mobileTheme || !rias.isString(mobileTheme)){
				mobileTheme = this.themeParams.mobileTheme;
			}
			if(!appCssName || !rias.isString(appCssName)){
				appCssName = this.themeParams.appCss;
			}
			var name,
				names = [themeName + ".css"],
				namesM = mobileTheme ? [mobileTheme + ".css"] : [],
				namesApp = [appCssName];
			for(name in this._loadedCss.base){
				if(this._loadedCss.base.hasOwnProperty(name)){
					if(names.indexOf(name) < 0){
						names.push(name);
					}
				}
			}
			for(name in this._loadedCss.mobile){
				if(this._loadedCss.mobile.hasOwnProperty(name)){
					if(namesM.indexOf(name) < 0){
						namesM.push(name);
					}
				}
			}
			for(name in this._loadedCss.app){
				if(this._loadedCss.app.hasOwnProperty(name)){
					if(namesApp.indexOf(name) < 0){
						namesApp.push(name);
					}
				}
			}
			_load(this, names, themeName, mobileTheme, false, this._loadedCss.base, function(self, name, themeName){
				return _toThemeUrl(self, name, themeName, "", false);
			});
			_load(this, namesM, themeName, mobileTheme, false, this._loadedCss.mobile, function(self, name, themeName){
				return _toThemeUrl(self, name, themeName, mobileTheme, false);
			});
			_load(this, namesApp, themeName, mobileTheme, true, this._loadedCss.app, function(self, name, themeName){
				return _toThemeUrl(self, name, themeName, "", true);
			});

			this.themeParams.name = themeName;
			this.themeParams.mobileTheme = mobileTheme;
			this.themeParams.appCss = appCssName;

			rias.ready(990, function(){
				getThemeSize(element);
			});
		},

		rules: {},
		addCssRule: function (selector, css) {
			css = _dom.styleToString(css);
			var rules = this.rules,
				id = _ruleId++;
			rules[id] = _styleSheet[rulesProperty].length;
			try{
				if(_styleSheet.addRule){
					_styleSheet.addRule(selector, css);
				}else{
					_styleSheet.insertRule(selector + '{' + css + '}', rules[id]);
				}
			}catch(e){
				console.error("rias.theme.addCssRule error: " + e, e);
				throw e;
			}

			return {
				id: id,
				get: function (prop) {
					if(prop){
						return _styleSheet[rulesProperty][rules[this.id]].style[prop];
					}else{
						return _styleSheet[rulesProperty][rules[this.id]].style;
					}
				},
				set: function (prop, value) {
					if (rules[this.id] >= 0) {
						if(arguments.length > 1){
							_styleSheet[rulesProperty][rules[this.id]].style[prop] = value;
						}else{
							value = _dom.styleToObject(prop);
							rias.mixinDeep(_styleSheet[rulesProperty][rules[this.id]].style, value);
						}
					}
				},
				remove: function () {
					var pos = rules[this.id];
					if (pos >= 0) {
						_styleSheet[removeMethod](pos);
						delete rules[this.id];
						rias.forEach(rules, function(value, key){
							if (value > pos) {
								rules[key]--;
							}
						});
						rias.compact(rules);
					}
				}
			};
		},
		escapeCssIdentifier: function (id, replace) {
			return typeof id === 'string' ? id.replace(invalidCssChars, replace || '\\$1') : id;
		},

		testElement: function(testNode, style, callback, scope){
			testNode.appendChild(element);
			element.style.cssText = _dom.styleToString(rias.mixin({
				width: "1em",
				height: "1em",
				margin: "0",
				padding: "0",
				border: "0",
				overflow: "hidden",
				position: "absolute",
				top: "-9999px",
				opacity: 0
			}, style));
			if(callback){
				callback.apply(scope, [element]);
			}
			element.style.cssText = "";
			if (element.parentNode) {
				element.parentNode.removeChild(element);
			}
		}
	});

	exports._detectWindowsTheme = function(){
		// summary:
		//		Detects if the "windows" theme is used,
		//		if it is used, set has("windows-theme") and
		//		add the .windows_theme class on the document.

		// Avoid unwanted (un)zoom on some WP8 devices (at least Nokia Lumia 920)
		if(navigator.userAgent.match(/IEMobile\/10\.0/)){
			_dom.create("style", {
				innerHTML: "@-ms-viewport {width: auto !important}"
			}, _dom.doc.head);
		}

		var setWindowsTheme = function(){
			_dom.addClass(_dom.doc.documentElement, "windows_theme");
			//rias.experimental("Dojo Mobile Windows theme", "Behavior and appearance of the Windows theme are experimental.");
		};

		// First see if the "windows-theme" feature has already been set explicitly
		// in that case skip aut-detect
		var windows = rias.has("windows-theme");
		if(windows !== undefined){
			if(windows){
				setWindowsTheme();
			}
			return;
		}

		// check css
		var i, j;

		var check = function(href){
			// TODO: find a better regexp to match?
			if(href && href.indexOf("/windows/") !== -1){
				rias.has.add("windows-theme", true);
				setWindowsTheme();
				return true;
			}
			return false;
		};

		// collect @import
		var s = _dom.doc.styleSheets;
		for(i = 0; i < s.length; i++){
			if(s[i].href){ continue; }
			var r = s[i].cssRules || s[i].imports;
			if(!r){ continue; }
			for(j = 0; j < r.length; j++){
				if(check(r[j].href)){
					return;
				}
			}
		}

		// collect <link>
		var elems = _dom.doc.getElementsByTagName("link");
		for(i = 0; i < elems.length; i++){
			if(check(elems[i].href)){
				return;
			}
		}
	};

	var element = _dom.create('div', {
		id: '_riasrGlobalTestElement'
	});
	function getThemeSize(element) {
		_dom.docBody.appendChild(element);
		element.style.cssText = _dom.styleToString({
			width: "10em",
			height: "10em",
			overflow: "scroll",
			position: "absolute",
			top: "-9999px"
		});
		exports.emWidth = element.scrollWidth / 10;
		exports.emHeight = element.scrollHeight / 10;
		exports.scrollbarWidth = element.offsetWidth - element.clientWidth;
		exports.scrollbarHeight = element.offsetHeight - element.clientHeight;
		if (rias.has('ie')) {
			exports.scrollbarWidth++;
			exports.scrollbarHeight++;
		}

		//element.setAttribute('dir', 'rtl');
		//var div = _dom.create('div');
		//element.appendChild(div);
		//exports.scrollbarLeft = !!rias.has('ie') || !!rias.has('trident') || /\bEdge\//.test(navigator.userAgent) || div.offsetLeft >= exports.scrollbarWidth;
		//_dom.destroy(div);
		//element.removeAttribute('dir');

		element.style.cssText = "";
		if (element.parentNode) {
			element.parentNode.removeChild(element);
		}
	}
	getThemeSize(element);

	exports._detectWindowsTheme();

	return rias;

});
