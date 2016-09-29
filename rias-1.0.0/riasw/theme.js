
//RIAStudio Client Runtime(rias) in Browser -- rias.Theme.

define([
	"rias/riasw/riasw",
	"rias/riasw/xhr"
], function(rias) {

///theme******************************************************************************///
	var invalidCssChars = /([^A-Za-z0-9_\u00A0-\uFFFF-])/g;
	var extraSheet = rias.dom.create('style');
	rias.dom.heads[0].appendChild(extraSheet);
	extraSheet = extraSheet.sheet || extraSheet.styleSheet;// Keep reference to actual StyleSheet object (`styleSheet` for IE < 9)
	var removeMethod = extraSheet.deleteRule ? 'deleteRule' : 'removeRule',// Store name of method used to remove rules (`removeRule` for IE < 9)
		rulesProperty = extraSheet.cssRules ? 'cssRules' : 'rules';// Store name of property used to access rules (`rules` for IE < 9)

	function _toUrl(self, url){
		if(rias.isUrl(url)){
			return url;
		}
		return rias.toUrl(url);
	}
	function _toThemeUrl(self, url, themeName, mobileTheme, isWebApp){
		if(rias.isUrl(url)){
			return url;
		}
		if(mobileTheme){
			mobileTheme = "riasw/mobile/" + rias.formatPath(mobileTheme);
		}
		return rias.toUrl(rias.formatPath(isWebApp ? self.webAppUrl : self.riasUrl) + rias.formatPath(themeName) + mobileTheme + url);
	}
	function _load(self, names, themeName, mobileTheme, isWebApp, loaded, toUrl, callback){
		var name,
			appCss = rias.formatPath(themeName) + self.themeParams.webAppCss,///防止重名
			currTheme = self.themeParams.name,
			currMobile = self.themeParams.mobileTheme,
			headElem = rias.dom.heads[0],
			links = rias.dom.query('link'),
			appCssLink, riasdCssLink;
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
			if(links.some(function(val){
				return val.getAttribute('href') === name;
			})){
				// don't add if stylesheet is already loaded in the page
				continue;
			}

			var newLink = rias.dom.create('link', {
				rel: 'stylesheet',
				type: 'text/css',
				href: name
			});
			var isAppCss = name.indexOf(appCss) > -1,
				isRiasdCss = name.indexOf("riasd/resources/riasd.css") > -1;
			if(isAppCss){
				rias.dom.place(newLink, headElem, "", callback);
				appCssLink = newLink;
			}else if(isRiasdCss){
				if(!appCssLink){
					rias.dom.place(newLink, headElem, "", callback);
				}else{
					rias.dom.place(newLink, appCssLink, "before", callback);
				}
				riasdCssLink = newLink;
			}else if(!isWebApp && (riasdCssLink || appCssLink)){
				rias.dom.place(newLink, riasdCssLink || appCssLink, "before", callback);
			}else{
				rias.dom.place(newLink, headElem, "", callback);
			}
		}
	}

	rias.theme = {
		riasUrl: "rias/themes",
		webAppUrl: "webApp/themes",
		themeParams: {
			name: "",
			mobileTheme: "",
			webAppCss: "webApp.css"
		},
		_loadedCss: {
			"base": {},
			"mobile": {},
			"webApp": {}
		},
		toUrl: function(url){
			return _toUrl(this, url);
		},
		toThemeUrl: function(url, themeName, isWebApp){
			themeName = themeName || this.themeParams.name;
			if(!themeName){
				console.error("No themeName.");
				return url;
			}
			return _toThemeUrl(this, url, themeName, "", isWebApp);
		},
		loadCss: function(names, callback){
			names = rias.isArray(names) ? names : rias.isString(names) ? [names] : [];
			_load(this, names, "", "", true, null, function(self, name, themeName){
				return _toUrl(self, name);
			}, callback);
		},
		loadThemeCss: function(names, isWebApp, callback){
			if(!this.themeParams.name){
				console.error("No themeParams.name.");
				return;
			}
			names = rias.isArray(names) ? names : rias.isString(names) ? [names] : [];
			_load(this, names, this.themeParams.name, this.themeParams.mobileTheme, isWebApp, isWebApp ? this._loadedCss.webApp : this._loadedCss.base, function(self, name, themeName){
				return _toThemeUrl(self, name, themeName, "", isWebApp);
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
		loadTheme: function(themeName, mobileTheme, webAppCssName){
			if(!themeName || !rias.isString(themeName)){
				console.error("The themeName must be a string.", themeName);
				return;
			}
			if(!mobileTheme || !rias.isString(mobileTheme)){
				mobileTheme = this.themeParams.mobileTheme;
			}
			if(!webAppCssName || !rias.isString(webAppCssName)){
				webAppCssName = "webApp.css";
			}
			var name,
				names = [themeName + ".css"],
				namesM = mobileTheme ? [mobileTheme + ".css"] : [],
				namesApp = [webAppCssName];
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
			for(name in this._loadedCss.webApp){
				if(this._loadedCss.webApp.hasOwnProperty(name)){
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
			_load(this, namesApp, themeName, mobileTheme, true, this._loadedCss.webApp, function(self, name, themeName){
				return _toThemeUrl(self, name, themeName, "", true);
			});

			this.themeParams.name = themeName;
			this.themeParams.mobileTheme = mobileTheme;
			this.themeParams.webAppCss = webAppCssName;
		},

		extraRules: [],
		addCssRule: function (selector, css) {
			// summary:
			//		Dynamically adds a style rule to the document.  Returns an object
			//		with a remove method which can be called to later remove the rule.

			css = rias.dom.styleToString(css);
			var extraRules = this.extraRules,
				index = extraRules.length;
			extraRules[index] = extraSheet[rulesProperty].length;
			extraSheet.addRule ? extraSheet.addRule(selector, css) : extraSheet.insertRule(selector + '{' + css + '}', extraRules[index]);

			return {
				_rule: extraSheet[rulesProperty][extraRules[index]],
				get: function (prop) {
					if(prop){
						return extraSheet[rulesProperty][extraRules[index]].style[prop];
					}else{
						return extraSheet[rulesProperty][extraRules[index]].style;
					}
				},
				set: function (prop, value) {
					if (typeof extraRules[index] !== 'undefined') {
						if(arguments.length > 1){
							extraSheet[rulesProperty][extraRules[index]].style[prop] = value;
						}else{
							value = rias.dom.styleToObject(prop);
							rias.mixinDeep(extraSheet[rulesProperty][extraRules[index]].style, value);
						}
					}
				},
				remove: function () {
					var realIndex = extraRules[index],
						i, l;
					this._rule = undefined;
					if (realIndex === undefined) {
						return; // already removed
					}

					// remove rule indicated in internal array at index
					extraSheet[removeMethod](realIndex);

					// Clear internal array item representing rule that was just deleted.
					// NOTE: we do NOT splice, since the point of this array is specifically
					// to negotiate the splicing that occurs in the stylesheet itself!
					extraRules[index] = undefined;

					// Then update array items as necessary to downshift remaining rule indices.
					// Can start at index + 1, since array is sparse but strictly increasing.
					for (i = index + 1, l = extraRules.length; i < l; i++) {
						if (extraRules[i] > realIndex) {
							extraRules[i]--;
						}
					}
				}
			};
		},
		escapeCssIdentifier: function (id, replace) {
			// summary:
			//		Escapes normally-invalid characters in a CSS identifier (such as . or :);
			//		see http://www.w3.org/TR/CSS2/syndata.html#value-def-identifier
			// id: String
			//		CSS identifier (e.g. tag name, class, or id) to be escaped
			// replace: String?
			//		If specified, indicates that invalid characters should be
			//		replaced by the given string rather than being escaped

			return typeof id === 'string' ? id.replace(invalidCssChars, replace || '\\$1') : id;
		},

		testElement: function(parentNode, callback){
			parentNode.appendChild(element);
			element.style.cssText = rias.dom.styleToString({
				width: "10em",
				height: "10em",
				margin: "1em 2em",
				padding: "1em",
				border: "1px solid black",
				overflow: "scroll",
				position: "absolute",
				top: "-9999px",
				opacity: 0
			});
			if(callback){
				callback(element);
			}
			element.style.cssText = "";
			if (element.parentNode) {
				element.parentNode.removeChild(element);
			}
		}
	};

	var element = rias.dom.create('div');
	function getThemeSize(element) {
		rias.dom.docBody.appendChild(element);
		element.style.cssText = rias.dom.styleToString({
			width: "10em",
			height: "10em",
			overflow: "scroll",
			position: "absolute",
			top: "-9999px"
		});
		rias.theme.emWidth = element.scrollWidth / 10;
		rias.theme.emHeight = element.scrollHeight / 10;
		rias.theme.scrollbarWidth = element.offsetWidth - element.clientWidth;
		rias.theme.scrollbarHeight = element.offsetHeight - element.clientHeight;
		if (rias.has('ie')) {
			rias.theme.scrollbarWidth++;
			rias.theme.scrollbarHeight++;
		}

		element.setAttribute('dir', 'rtl');
		var div = rias.dom.create('div');
		element.appendChild(div);
		rias.theme.scrollbarLeft = !!rias.has('ie') || !!rias.has('trident') || /\bEdge\//.test(navigator.userAgent) ||
			div.offsetLeft >= rias.theme.scrollbarWidth;
		rias.dom.destroy(div);
		element.removeAttribute('dir');
		element.style.cssText = "";
		if (element.parentNode) {
			element.parentNode.removeChild(element);
		}
	}
	getThemeSize(element);

	return rias;

});
