
//RIAStudio Client Runtime(rias) in Browser -- rias.Theme.

define([
	"rias/riasw/riasw"
], function(rias) {

///theme******************************************************************************///
	var invalidCssChars = /([^A-Za-z0-9_\u00A0-\uFFFF-])/g;
	var extraSheet = rias.dom.create('style');
	rias.dom.heads[0].appendChild(extraSheet);
	extraSheet = extraSheet.sheet || extraSheet.styleSheet;// Keep reference to actual StyleSheet object (`styleSheet` for IE < 9)
	var removeMethod = extraSheet.deleteRule ? 'deleteRule' : 'removeRule',// Store name of method used to remove rules (`removeRule` for IE < 9)
		rulesProperty = extraSheet.cssRules ? 'cssRules' : 'rules';// Store name of property used to access rules (`rules` for IE < 9)

	function _load(self, links, names, theme, isMobile, isWebApp, loaded, callback){
		loaded = loaded || rias.getObject(theme, true, self._loaded);
		rias.forEach(names, function(name){
			if(!self._loaded._all[name]){
				self._loaded._all[name] = {
					//isMobile: isMobile
				};
			}
			self._loaded._all[name].isMobile = isMobile;
			name = self.toUrl(name, theme, isMobile, isWebApp);
			if(loaded[name]){
				return;
			}
			if(links.some(function(val){
				return val.getAttribute('href') === name;
			})){
				// don't add if stylesheet is already loaded in the page
				return;
			}

			var newLink = rias.dom.create('link', {
				rel: 'stylesheet',
				type: 'text/css',
				href: name
			});
			loaded[name] = newLink;
			// Make sure app.css is the after library CSS files
			// FIXME: Shouldn't hardcode this sort of thing
			var headElem = rias.dom.heads[0],
				isAppCss = name.indexOf(self.appCss) > -1,
				//isRiasdCss = name.indexOf("riasd.css") > -1,
				appCssLink, riasdCssLink;
			rias.forEach(links, function(link) {
				if(link.href.indexOf(self.appCss) > -1){
					appCssLink = link;
				}
				if(link.href.indexOf("riasd.css") > -1){
					riasdCssLink = link;
				}
			});
			if(isAppCss){
				rias.dom.place(newLink, headElem, "", callback);
			}else if(!appCssLink){
				if(!riasdCssLink){
					rias.dom.place(newLink, headElem, "", callback);
				}else{
					rias.dom.place(newLink, riasdCssLink, "before", callback);
				}
			}else{
				if(!riasdCssLink){
					rias.dom.place(newLink, appCssLink, "before", callback);
				}else{
					rias.dom.place(newLink, riasdCssLink, "before", callback);
				}
			}
		});
	}

	rias.theme = {
		riasUrl: "rias/themes",
		webAppUrl: "webApp/themes",
		appCss: "webApp.css",
		themes: {
			rias: {
				location: "rias",
				main: "main.css",
				mobileTheme: ""
			}
		},
		//currentTheme: "",
		_loaded: {
			"_all": {
				//"webApp": {
				//	isMobile: false
				//}
			}
		},
		toUrl: function(url, theme, isMobile, isWebApp){
			if(rias.isUrl(url)){
				return url;
			}
			theme = this.themes[theme || this.currentTheme];
			theme = theme || this.themes.rias;
			if(isMobile){
				if(theme.mobileTheme){
					url = "mobile/" + theme.mobileTheme + "/" + url;
				}else{
					console.warn("no mobileTheme.");
					url = "mobile/common/" + url;
				}
			}
			return rias.xhr.toUrl(rias.formatPath(isWebApp ? this.webAppUrl : this.riasUrl) + theme.location + "/" + url);
		},
		loadRiasCss: function(names, isMobile, callback){
			var self = this,
				links = rias.dom.query('link'),
				theme;

			names = rias.isArray(names) ? names : rias.isString(names) ? [names] : [];//name.split(",");
			for(theme in self.themes){
				if(self.themes.hasOwnProperty(theme)){
					//if(!self.currentTheme){
					//	self.currentTheme = theme;
					//}
					_load(self, links, names, theme, isMobile, false, rias.getObject(theme, true, self._loaded), callback);
				}
			}
		},
		loadWebAppCss: function(names, isMobile, callback){
			var self = this,
				links = rias.dom.query('link'),
				theme;

			names = rias.isArray(names) ? names : rias.isString(names) ? [names] : [];//name.split(",");
			for(theme in self.themes){
				if(self.themes.hasOwnProperty(theme)){
					//if(!self.currentTheme){
					//	self.currentTheme = theme;
					//}
					_load(self, links, names, theme, isMobile, true, rias.getObject(theme, true, self._loaded), callback);
				}
			}
		},
		loadTheme: function(name, location, main, mobileTheme){
			if(!name || !rias.isString(name)){
				console.error("The name must be a string.", name);
				return;
			}
			if(!location || !rias.isString(location)){
				location = "rias/themes/" + name;
			}
			if(!main || !rias.isString(main)){
				main = "main.css";
			}
			name = this.themes[name];
			if(!name){
				name = this.themes[name] = {};
			}
			name.location = location;
			name.main = main;
			name.mobileTheme = mobileTheme;
			var names = [name.main],
				namesM = mobileTheme ? [mobileTheme + ".css"] : [];
			for(name in this._loaded._all){
				if(this._loaded._all.hasOwnProperty(name)){
					if(this._loaded._all[name].isMobile){
						if(namesM.indexOf(name) < 0){
							namesM.push(name);
						}
					}else{
						if(names.indexOf(name) < 0){
							names.push(name);
						}
					}
				}
			}
			this.loadRiasCss(names);
			this.loadRiasCss(namesM, true);
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
