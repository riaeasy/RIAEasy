
//RIAStudio Client Runtime(rias) in Browser.

define([
	"rias/base/riasBase",
	"dojo/_base/xhr",
	"dojo/io-query",
	"dojo/request",
	"dojo/dom-form"
], function(rias, xhr, ioq, request, domForm) {

	rias.xhr = rias.mixin(xhr, {
		simulate: rias.has("rias-xhr-simulate"),
		defaultTimeout: rias.config.waitSeconds ? rias.config.waitSeconds * 1000 : undefined,
		withCredentials: true
	});

	//rias.xhr.isLocal = function(url){
	//	return /^file:\/\//.test(url) && !/^http/.test(url);
	//};

	rias.xhr.toServerUrl = function(url, referenceModule){
		!/:\/\//.test(url) && (url = rias.hostMobile && rias.mobileShell ?
			(rias.mobileShell.serverLocation ?
				(rias.endWith(rias.mobileShell.serverLocation, "/") ?
					rias.mobileShell.serverLocation :
					rias.mobileShell.serverLocation + "/") :
				"") + url :
			url);
		return url;
	};
	rias.xhr.toUrl = function(url, referenceModule){
		return rias.toUrl(url, referenceModule);
	};

	rias.xhr.error = function(err, args, callback, silence){
		var s = "";
		if(err && err.response){
			s = err.response.url + "<br/>";
		}
		console.error(s, rias.captureStackTrace(err));
		if(rias.isFunction(args.errorCallback)){
			args.errorCallback(err);
		}else if(!args.silenceError){
			if(err){
				if(err.status == 0){
					rias.error(s + "未能找到服务器，请检查网络连接是否正常。");
				}else if(err.status == 401){
					if(rias.webApp && rias.isFunction(rias.webApp.doLogin)){
						rias.webApp.doLogin(args.initPlaceToArgs ? args.initPlaceToArgs.around : undefined);
					}else{
						rias.error(s + "需要登录...<br/>" + err.responseText);
					}
				}else if(err.status == 405){
					rias.error(s + "缺少权限...<br/>" + err.responseText);
				}else if(err.status == 500){
					rias.error(s + "服务器Action处理出错...<br/>" + err.responseText);
				}else if(err.status == 504){
					rias.error(s + "服务器超时...<br/>" + err.responseText);
				}else if(/Timeout/ig.test(err.message)){
					rias.error(s + "网络超时，请重试...");
				}else if(/Request canceled/ig.test(err.message)){
					//rias.warn(s + "取消了网络请求...");
				}else if(rias.isDebug){
					rias.error(s + err.toString() + "<br/>" + err.responseText);
				}else{
					rias.error(s + err.toString());
				}
			}else{
				rias.error(s + "网络请求发生错误，请检查。");
			}
		}
	};
	rias.after(xhr, "_ioSetArgs", function(d){
		d.addErrback(function(e){
			if(!d.ioArgs.args._riaswXhr){
				rias.xhr.error(e);
			}
		});
		return d;
	});

	function _xhr(method, args, hasBody, callback, errCall){
		//args.url = args.location ? args.location + args.url : args.url;
		//delete args.location;
		//if(rias.xhr.isLocal(args.url)){
		args = rias.mixinDeep({}, args);
		args.url = rias.xhr.toUrl(args.url);
		/*if(rias.xhr.simulate){
			var d = rias.newDeferred();
			try{
				rias.require([args.url], function (func) {
					console.debug(func);
					//callback
					d.resolve();
				});
			}catch(e){
				rias.xhr.error(e, errCall, !!errCall);
				d.reject();
			}
			return d;
		}else*/ if(args.isFileLocation){
			args.url = args.url + ".js";
			args.handleAs = "text";
			if(!args.load){
				args.load = function(js){
					try{
						var func = new Function(
							"args",
							"okCall",
							"errorCall",
							js + "\r\n////@ sourceURL=" + args.url);
						func(
							args,
							function(result){
								if(rias.isFunction(callback)){
									return callback(result);
								}
							},
							function(e){
								//console.error(e);
								if(rias.isFunction(errCall)){
									errCall(e);
								}
							});
					}catch(e){
						rias.xhr.error(e, args);
					}
				};
			}
		}else{
			if(!args.load){
				args.load = function(response){
					try{
						if(response instanceof Error){
							//var s = method + " " + args.url + " error:\n";
							rias.xhr.error(rias.mixinDeep(response, {
								status: 500,
								response: {
									url: args.url
								}
							}), args);
						}else{
							//response = rias.fromJson(response);
							if(rias.isFunction(callback)){
								return callback(response);
							}
						}
					}catch(e){
						rias.xhr.error(e, args);
					}
				};
			}
		}
		!(args.timeout > 0) && (args.timeout = rias.xhr.defaultTimeout);
		if(rias.xhr.withCredentials){
			args.withCredentials = true;
		}
		args.initPlaceToArgs = rias.mixin({
			parent: args.parent,
			around: args.around ? args.around : args.x && args.y ? {x: args.x, y: args.y} : undefined,
			positions: args.positions,
			maxHeight: args.maxHeight,
			padding: args.padding
		}, args.initPlaceToArgs);
		args.errorCallback = errCall;
		args.silenceError = (args.silenceError == undefined ? !!args.errorCallback : args.silenceError);
		args = rias.mixin({
			//timeout: rias.xhr.defaultTimeout,
			/// error 改在 rias.after(xhr, "_ioSetArgs", function(d) 中处理
			error: function(e){
				rias.xhr.error(e, args);
			},
			_riaswXhr: 1
		}, args);
		return xhr(method, args, hasBody);
	}
	rias.xhrGet = function(/*url|args*/url, query, callback, errCall, preventCache, handleAs){
		var args;
		if(typeof url === "object"){
			args = rias.mixinDeep({}, url);
		}else{
			args = {
				url: url,
				handleAs: handleAs
			};
		}
		if(!args.content){
			args.content = {};
		}
		if(args.query){
			rias.mixinDeep(args.content, args.query);
		}
		if(query != undefined){
			rias.mixinDeep(args.content, query);
		}
		if(preventCache != undefined){
			args.preventCache = preventCache;
		}
		args.content._method = "GET";
		//args.withCredentials = true;///跨域 cookie
		//args.postData._method = "GET";
		return _xhr("GET", args, false, callback, errCall);
	};
	function _xhrPost(method, /*url|args*/url, postData, callback, errCall){
		var args;
		if(typeof url === "object"){
			args = rias.mixinDeep({}, url);
		}else{
			args = {
				url: url
			};
		}
		if(!args.postData){
			args.postData = {};
		}
		rias.mixinDeep(args.postData, postData);
		args.postData._method = method;
		if(!args.handleAs){
			args.handleAs = "json";
		}
		return _xhr("POST", args, true, callback, errCall);
	}
	rias.xhrPost = function(/*url|args*/url, postData, callback, errCall){
		return _xhrPost("POST", url, postData, callback, errCall);
	};
	rias.xhrPut = rias.xhrModi = function(/*url|args*/url, postData, callback, errCall){
		return _xhrPost("PUT", url, postData, callback, errCall);
	};
	rias.xhrAdd = function(/*url|args*/url, postData, callback, errCall){
		return _xhrPost("POST", url, postData, callback, errCall);
	};
	rias.xhrDelete = function(/*url|args*/url, postData, callback, errCall){
		return _xhrPost("DELETE", url, postData, callback, errCall);
	};
	rias.xhrSave = function(/*url|args*/url, postData, callback, errCall){
		return _xhrPost("SAVE", url, postData, callback, errCall);
	};

	rias.xhrIframe = function(method, options, data, callback, errCall){
		var name = "_riasrGlobalIframe";
		if(method !== "GET" && method !== "POST"){
			//method = "POST";
			throw new Error(method + ' not supported by rias.xhrIframe');
		}
		//options.postData = data == undefined ? {} : data;
		//options.postData._method = method;
		//if(!options.handleAs){
		//	options.handleAs = "json";
		//}

		function getFrame(onloadstr){
			if(rias.global.frames[name]){
				return rias.global.frames[name];
			}
			var uri = rias.has("ie") ? "javascript:''" : "about:blank";
			var frame = rias.dom.place('<iframe id="' + name + '" name="' + name + '" src="' + uri + //'" onload="' + onloadstr +
					'" style="position: absolute; left: 1px; top: 1px; height: 1px; width: 1px; visibility: hidden">',
				rias.webApp ? rias.webApp.domNode : rias.dom.docBody);
			rias.on(frame, "load", function(result){
				console.debug("_riasrGlobalIframe.onload:", result);
			});
			rias.global[name] = frame;
			return frame;
		}
		function getForm(target){
			var form,
				dn;
			if(rias.isObjectExact(options.form)){
				form = options.form;
			}else{
				form = rias.dom.byId(name + "_form");
				if(form){
					while (form.childNodes.length !== 0){
						form.removeChild(form.childNodes[0]);
					}
				}else{
					form = rias.dom.create("form", {
						id: name + "_form",
						name: name + "_form",
						style: {
							position: "absolute",
							top: "-1000px",
							left: "-1000px"
						}
					}, rias.webApp ? rias.webApp.domNode : rias.dom.docBody);
				}
				rias.dom.setAttr(form, {
					encoding: options.isUpload ? "multipart/form-data" : "application/x-www-form-urlencoded",
					action: rias.xhr.toUrl(options.url),
					method: method,
					target: options.isDownload ? name : "_blank"
				});
				if (rias.isObjectSimple(data)) {
					for (dn in data) {
						if(data.hasOwnProperty(dn)){
							rias.dom.create("input", {
								name: dn,
								type: "hidden",
								value: data[dn]
							}, form);
						}
					}
				}
			}
			return form;
		}
		if(!rias.xhrIframe._frame){
			rias.xhrIframe._frame = getFrame(onload + '();');
		}
		getForm().submit();
	};

	return rias;

});
