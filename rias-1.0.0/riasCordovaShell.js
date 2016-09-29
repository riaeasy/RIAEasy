
//RIAStudio phonegapApp Runtime (rias).

window.onerror = function(msg, url, line) {
	//alert("ERROR in " + url + " (line #" + line + "): " + msg);
	alert("window.onerror: " + arguments);
	return false;
};

(function(config){

	var shell = {

		pix: 360,
		timeout: 15000,
		hostNative: false,
		//appVersion: null,

		// Application Constructor
		initialize: function() {
			document.addEventListener('deviceready', shell.onDeviceReady, false);
			document.addEventListener("backbutton", shell.onBackButton, false);//返回键
			document.addEventListener("menubutton", shell.onMenuButton, false);//菜单键
			document.addEventListener("searchbutton", shell.onSearchButton, false);//搜索键
		},
		onDeviceReady: function() {
			///this === window !== shell, 重要提示
			//window.alert("deviceready");
			console.info('Received Event: ' + 'deviceready');
			cordova.getAppVersion(function (version) {
				shell.appVersion = version;
			});
			shell.hostNative = !!window.requestFileSystem;///this === window
			shell._setViewportSize();
			shell._loadRias();
		},
		onBackButton: function(){
			navigator.notification.confirm('是否退出？', function(button){
				if(button == 1){
					navigator.app.exitApp();
				}
			}, rias.webApp.appTitle || "请选择...", ["是的", "取消"]);
		},
		onMenuButton: function(){
			//window.plugins.ToastPlugin.show_short('点击了 菜单 按钮!');
		},
		onSearchButton: function(){
			//window.plugins.ToastPlugin.show_short('点击了 搜索 按钮!');
		},

		_setViewportSize: function(){
			require([
				"dojo/dom",
				"dojo/window",
				"dojo/number",
				"dojo/ready"
			], function(dom, win, number, ready){
				var v = dom.byId("appViewport"),
					box = win.getBox();
				//window.alert('box: ' + JSON.stringify(box));
				console.info('appViewport: ' + JSON.stringify(box));
				if(v && shell.hostNative){
					box = (box.w > box.h ? box.h : box.w);
					box = number.round(box / shell.pix, 0, 2.5);
					//window.alert('box2: ' + JSON.stringify(box));
					console.info('initial-scale = ' + box);
					v.setAttribute("content","user-scalable=yes, initial-scale=" + box + ", maximum-scale=4, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi");
				}
			});
		},
		_initVar: function(){
			var self = this,
				d = rias.mixinDeep({}, config);
			if(!rias.hostNative){
				rias.mixin_exact(self, {
					serverLocation: d.serverLocation,
					oper: d.oper,
					timeout: d.timeout,
					pix: d.pix
				});
				//self._setViewportSize();
				//self.loadRiasApp();
			}else{
				shell._readFile("option.json", function(txt){
					if(txt){
						try{
							rias.mixin(d, rias.fromJson(txt));
						}catch(e){
							console.error(e);
							rias.error(e);
						}
					}
					rias.mixin_exact(self, {
						serverLocation: d.serverLocation,
						oper: d.oper,
						timeout: d.timeout,
						pix: d.pix
					});
					//self._setViewportSize();
					//self.loadRiasApp();
				});
			}
		},

		_readFile: function(fn, cb, errCall, dir){
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
			function gotFS(fileSystem) {
				fileSystem.root.getDirectory(dir || "riasm", {
					create: true,
					exclusive: false
				}, function(file){
					file.getFile(fn, {
						create: true,
						exclusive: false
					}, function(entry){
						entry.file(readAsText, fail);
					}, fail);
				}, fail);
			}
			function readAsText(file) {
				var reader = new FileReader();
				reader.onloadend = function(evt) {
					if(cb){
						cb(evt.target.result);
					}
				};
				reader.readAsText(file);
			}
			function fail(error) {
				console.error(error);
				if(rias.isFunction(errCall)){
					errCall(error);
				}
			}
		},
		_writeFile: function(fn, cb, errCall, dir){
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
			function gotFS(fileSystem) {
				fileSystem.root.getDirectory(dir || "riasm", {
					create: true,
					exclusive: false
				}, function(file){
					file.getFile(fn, {
						create: true,
						exclusive: false
					}, function(entry){
						entry.createWriter(gotFileWriter, fail);
					}, fail);
				}, fail);
			}
			function gotFileWriter(writer) {
				if(cb){
					cb(writer);
				}
			}
			function fail(error) {
				console.error(error);
				if(rias.isFunction(errCall)){
					errCall(error);
				}
			}
		},
		_downloadFile: function(url, fn, cb, dir){
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
			function gotFS(fileSystem) {
				fileSystem.root.getDirectory(dir || "riasm", {
					create: true,
					exclusive: false
				}, function(file){
					file.getFile(fn, {
						create: true,
						exclusive: false
					}, function(entry){
						entry.file(_download, fail);
					}, fail);
				}, fail);
			}
			function _download1(file) {
				var fileTransfer = new FileTransfer();
				var uri = encodeURI(url);
				fileTransfer.onprogress = function(evt) {
					/*if (evt.lengthComputable) {
						var percentLoaded = Math.round(100 * (evt.loaded / evt.total));
						var progressbarWidth = percentLoaded / 2 + "%";
						//下载进度显示，可自己定义
						$.mobile.showPageLoadingMsg('a',"正在下载......" + progressbarWidth, true);
						if(progressbarWidth = 100){
							//设置延时
							setTimeout("$.mobile.hidePageLoadingMsg()",3000);
						}
					} else {
						loadingStatus.increment();
					}*/
				};
				fileTransfer.download(
					uri,
					file.fullPath,
					function(entry){
						//调用自动安装的插件
						window.plugins.update.openFile(entry.fullPath, null, null);
					},
					function(error){
						console.error(error);
						rias.error("下载'" + url + "'失败...");
					}
				);
			}
			function _download(file){
				var fileURL = file.localURL;//"cdvfile://localhost/persistent/CegekaMon.apk";
				var fileTransfer = new FileTransfer();
				var uri = encodeURI(url);
				fileTransfer.download(
					uri,
					fileURL,
					function (entry) {
						console.info("下载完成: " + url);
						if(cb){
							cb(entry);
						}
					},
					function (error) {
						console.error(error);
						rias.error("下载'" + url + "'失败...");
					},
					false,
					{}
				);
			}
			function fail(error) {
				console.error(error);
			}
		},
		_installFile: function(entry){
			window.plugins.webintent.startActivity({
					action: window.plugins.webintent.ACTION_VIEW,
					url: entry.toURL(),
					type: 'application/vnd.android.package-archive'
				},
				function () {
					console.info("Installed. " + entry.fullPath);
					rias.error("安装成功.");
				},
				function (error) {
					console.error("Failed to open URL via Android Intent.\n" + error);
					rias.error("安装'" + entry.fullPath + "'失败...");
				}
			);
		},

		_loadRias: function() {
			require([
				"rias"
			], function(rias){
				//	receivedElement.innerText = "afterRequireRias";
				rias.nativeShell = shell;
				rias.hostNative = shell.hostNative;
				if(!("mblApplyPageStyles" in config)){
					config.mblApplyPageStyles = true;
				}

				rias.afterLoaded(function(){
					shell._initVar();

					var parentElement = document.getElementById('deviceready');
					var listeningElement = parentElement.querySelector('.listening');
					var receivedElement = parentElement.querySelector('.received');
					listeningElement.setAttribute('style', 'display:none;');
					receivedElement.setAttribute('style', 'display:block;');
					console.info('_loadRias.');

					var theme = rias.queryToObject(document.location.search).theme,
						mobileTheme = rias.queryToObject(document.location.search).mobileTheme;
					if(!theme){
						theme = "rias";
					}
					if(!mobileTheme){
						mobileTheme = "ios7";
					}
					rias.theme.loadTheme(theme, mobileTheme);
				});
			});
		},

		// Update DOM on a Received Event
		startup: function() {
			rias.afterLoaded(function(){
				rias.require([
					"webApp"
				], function(webAppConfig) {
					rias.startupWebApp(rias.mixinDeep(webAppConfig, {
							defaultTimeout: shell.timeout
						})).then(function(){
							var a = rias.dom.byId("splash");
							if(a){
								rias.dom.visible(a, false);
							}
							console.info("webApp.startup. The mainModuleMeta is '" + webAppConfig.mainModuleMeta + "'");
						});
				});
			});
		},
		downloadApk: function(url){
			if(!url || !rias.isString(url)){
				console.error("loss url in downloadApk().");
			}else{
				shell._downloadFile(url, "cbxjmy.apk", function(entry){
					if(entry){
						console.info("Installing... " + entry.fullPath);
						shell._installFile(entry);
					}else{
						console.error("Failed to install: no install file.");
						rias.error("安装失败，缺少安装文件...");
					}
				});
			}
		},

		responseData: function(value, okCall){
			if (rias.isFunction(okCall)) {
				okCall(value);
			}
		},
		responseOk: function(result, value, okCall){
			result.success = true;
			result.value = value;
			if (rias.isFunction(okCall)) {
				okCall(result);
			}
		},
		responseError: function(result, value, errorCall){
			result.success = false;
			result.value = value;
			if (rias.isFunction(errorCall)) {
				errorCall(result);
			}
		}

	};

	shell.initialize();

})(shellConfig);
