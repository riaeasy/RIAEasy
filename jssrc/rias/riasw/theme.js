
//RIAStudio Client Runtime(rias) in Browser -- rias.Theme.

define([
	"rias/riasw/riasw"
], function(rias) {

///theme******************************************************************************///
	rias.theme = {
		baseUrl: "rias/themes",
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
		toUrl: function(url, theme, isMobile){
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
			return rias.toUrl(rias.formatPath(this.baseUrl) + theme.location + "/" + url);
		},
		loadCss: function(names, isMobile){
			var self = this,
				links = rias.dom.query('link'),
				theme, m;

			function _load(names, theme, loaded){
				rias.forEach(names, function(name){
					if(!self._loaded._all[name]){
						self._loaded._all[name] = {
							//isMobile: isMobile
						};
					}
					self._loaded._all[name].isMobile = isMobile;
					name = self.toUrl(name, theme, isMobile);
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
							isRiasdCss = name.indexOf("riasd/resources/riasd.css") > -1,
							appCssLink, riasdCssLink;
						rias.forEach(links, function(link) {
							if(link.href.indexOf(self.appCss) > -1){
								appCssLink = link;
							}
							if(link.href.indexOf("riasd/resources/riasd.css") > -1){
								riasdCssLink = link;
							}
						});
						if(isAppCss || !appCssLink){
							headElem.appendChild(newLink);
						}else if(isRiasdCss || !riasdCssLink){
							if(!appCssLink){
								headElem.appendChild(newLink);
							}else{
								headElem.insertBefore(newLink, appCssLink);
							}
						}else{
							headElem.insertBefore(newLink, riasdCssLink);
						}
					});
				});
			}
			names = rias.isArray(names) ? names : rias.isString(names) ? [names] : [];//name.split(",");
			//rias.forEach(names, function(name){
			//	if(!self._loaded._all[name]){
			//		self._loaded._all[name] = {
			//			isMobile: isMobile
			//		};
			//	}
			//});
			for(theme in self.themes){
				if(self.themes.hasOwnProperty(theme)){
					//if(!self.currentTheme){
					//	self.currentTheme = theme;
					//}
					_load(names, theme, rias.getObject(theme, true, self._loaded));
				}
			}
		},
		loadTheme: function(name, location, main, mobileTheme){
			if(!rias.isString(name)){
				console.error("The name must be a string.", name);
				return;
			}
			if(!location || !rias.isString(location)){
				location = name;
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
			this.loadCss(names);
			this.loadCss(namesM, true);
		}
	};

	return rias;

});
