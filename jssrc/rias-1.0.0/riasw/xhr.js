
//RIAStudio Client Runtime(rias) in Browser.

define([
	"rias/base/riasBase",

	"dojo/_base/xhr",
	"dojo/io-query",
	"dojo/request",

	"dojo/dom-form"
], function(rias, xhr, ioq, request, domForm) {

	rias.xhr = xhr; /// xhr === dojo.xhr
	rias.xhr.simulate = rias.has("rias-xhr-simulate");
	rias.xhr.objectToQuery = ioq.objectToQuery;
	rias.xhr.queryToObject = ioq.queryToObject;
	rias.xhr.fieldToObject = domForm.fieldToObject;
	rias.xhr.formToObject = domForm.toObject;
	rias.xhr.formToQuery = domForm.toQuery;
	rias.xhr.formToJson = domForm.toJson;
	rias.xhr.defaultTimeout = rias.config.waitSeconds ? rias.config.waitSeconds * 1000 : undefined;

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

	rias.xhr.error = function(err, callback, silence){
		var s = "";
		if(err && err.response){
			s = err.response.url + "<br/>";
		}
		console.error(s, rias.captureStackTrace(err));
		if(rias.isFunction(callback)){
			callback(err);
		}else if(!silence){
			if(err){
				if(err.status == 0){
					rias.error(s + "未能找到服务器，请检查网络连接是否正常。");
				}else if(err.status == 500){
					rias.error(s + "服务器Action处理出错...<br/>" + err.responseText);
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
	rias.after(dojo, "_ioSetArgs", function(d){
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
									callback(result);
								}
							},
							function(e){
								//console.error(e);
								if(rias.isFunction(errCall)){
									errCall(e);
								}
							});
					}catch(e){
						rias.xhr.error(e, errCall, !!errCall);
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
							}), errCall, !!errCall);
						}else{
							//response = rias.fromJson(response);
							if(rias.isFunction(callback)){
								callback(response);
							}
						}
					}catch(e){
						rias.xhr.error(e, errCall, !!errCall);
					}
				};
			}
		}
		!(args.timeout > 0) && (args.timeout = rias.xhr.defaultTimeout);
		args = rias.mixin({
			//timeout: rias.xhr.defaultTimeout,
			/// error 改在 rias.after(dojo, "_ioSetArgs", function(d) 中处理
			error: function(e){
				rias.xhr.error(e, errCall, !!errCall);
			},
			_riaswXhr: 1
		}, args);
		return xhr(method, args, hasBody);
	}
	rias.xhrGet = function(/*url|args*/url, query, callback, errCall, preventCache, handleAs){
		var args;
		if(typeof url === "object"){
			args = url;
		}else{
			args = {
				url: url,
				handleAs: handleAs
			};
		}
		if(query != undefined){
			args.content = query;
		}
		if(preventCache != undefined){
			args.preventCache = preventCache;
		}
		if(!args.content){
			args.content = {};
		}
		args.content._method = "GET";
		//args.postData._method = "GET";
		return _xhr("GET", args, false, callback, errCall);
	};
	function _xhrPost(method, /*url|args*/url, postData, callback, errCall){
		var args;
		if(typeof url === "object"){
			args = url;
		}else{
			args = {
				url: url
			};
		}
		args.postData = postData == undefined ? {} : postData;
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

	return rias;

});
