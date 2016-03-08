
//RIAStudio Client Runtime(rias) in Browser -- rias.Theme.

define([
	"rias/riasw/riasw"
], function(rias) {

///theme******************************************************************************///
	function _load(self, links, names, theme, isMobile, isWebApp, loaded){
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

			rias.withDoc(rias.doc, function(){
				var newLink = rias.dom.create('link', {
					rel: 'stylesheet',
					type: 'text/css',
					href: name
				});
				loaded[name] = newLink;
				// Make sure app.css is the after library CSS files
				// FIXME: Shouldn't hardcode this sort of thing
				var headElem = rias.doc.getElementsByTagName('head')[0],
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
					headElem.appendChild(newLink);
				}else if(!appCssLink){
					if(!riasdCssLink){
						headElem.appendChild(newLink);
					}else{
						headElem.insertBefore(newLink, riasdCssLink);
					}
				}else{
					if(!riasdCssLink){
						headElem.insertBefore(newLink, appCssLink);
					}else{
						headElem.insertBefore(newLink, riasdCssLink);
					}
				}
			});
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
		loadRiasCss: function(names, isMobile){
			var self = this,
				links = rias.dom.query('link'),
				theme;

			names = rias.isArray(names) ? names : rias.isString(names) ? [names] : [];//name.split(",");
			for(theme in self.themes){
				if(self.themes.hasOwnProperty(theme)){
					//if(!self.currentTheme){
					//	self.currentTheme = theme;
					//}
					_load(self, links, names, theme, isMobile, false, rias.getObject(theme, true, self._loaded));
				}
			}
		},
		loadWebAppCss: function(names, isMobile){
			var self = this,
				links = rias.dom.query('link'),
				theme;

			names = rias.isArray(names) ? names : rias.isString(names) ? [names] : [];//name.split(",");
			for(theme in self.themes){
				if(self.themes.hasOwnProperty(theme)){
					//if(!self.currentTheme){
					//	self.currentTheme = theme;
					//}
					_load(self, links, names, theme, isMobile, true, rias.getObject(theme, true, self._loaded));
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
		}
	};

	return rias;

});
