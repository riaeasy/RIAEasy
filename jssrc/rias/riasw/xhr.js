
//RIAStudio Client Runtime(rias) in Browser.

define([
	"rias/base/riasBase",

	"dojo/_base/xhr",
	"dojo/io-query",
	"dojo/request",

	"dojo/dom-form"
], function(rias, xhr, ioq, request, domForm) {

	rias.xhr = xhr; /// xhr === dojo.xhr
	rias.xhr.objectToQuery = ioq.objectToQuery;
	rias.xhr.queryToObject = ioq.queryToObject;
	rias.xhr.fieldToObject = domForm.fieldToObject;
	rias.xhr.formToObject = domForm.toObject;
	rias.xhr.formToQuery = domForm.toQuery;
	rias.xhr.formToJson = domForm.toJson;
	rias.xhr.defaultTimeout = rias.config.waitSeconds ? rias.config.waitSeconds * 1000 : undefined;

	rias.xhr.isLocal = function(url){
		return /^file:\/\//.test(location) && !/^http/.test(url);
	};

	rias.xhr.error = function(err, callback, silence){
		var s = "";
		if(err && err.response){
			s = err.response.url + "<br/>";
		}
		console.error(s, rias.getStackTrace(err));
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

	/*rias.xhr.whenRest = function(xhr, okCall, errorCall){
		return rias.when(xhr, function(response){

		}, function(){

		})
	};*/
	/*function _xhr(method, args, hasBody, callback, errCall){
		var d = rias.newDeferred();
		//args.url = args.location ? args.location + args.url : args.url;
		//delete args.location;
		if(rias.xhr.isLocal(args.url)){
			args.url = args.url + ".js";
			args.handleAs = "text";
			args = rias.mixin({
				load: function(js){
					try{
						//var func = rias._eval(rias.global, js);
						//var func = rias._eval(undefined, js);
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
								d.resolve(result.value);
							},
							function(e){
								//console.error(e);
								if(rias.isFunction(errCall)){
									errCall(result);
								}
								d.reject(e);
							});
					}catch(e){
						//console.error(s, js, rias.getStackTrace(e));
						//rias.error(s + e.toString() + "\n" + response.toString());
						rias.xhr.error(e, errCall);
						d.reject(e);
					}
				}
			}, args);
		}else{
			args = rias.mixin({
				load: function(response){
					try{
						if(response instanceof Error){
							console.error(s, response);
							rias.error(s + response.toString());
							d.reject(response);
						}else{
							args = rias.fromJson(response);
							if(rias.isFunction(callback)){
								callback(args);
							}
							d.resolve(args);
						}
					}catch(e){
						//console.error(s, response, rias.getStackTrace(e));
						//rias.error(s + e.toString() + "\n" + response.toString());
						rias.xhr.error(e, errCall);
						d.reject(e);
					}
				}
			}, args);
		}
		args = rias.mixin({
			timeout: rias.xhr.defaultTimeout//,
			/// error 改在 rias.after(dojo, "_ioSetArgs", function(d) 中处理
			//error: function(e){
			//	//console.error(e);
			//	rias.xhr.error(e, errCall);
			//	d.reject(e);
			//}
		}, args);
		var s = method + " " + args.url + " error:\n";
		xhr(method, args, hasBody);
		return d;
	}*/
	function _xhr(method, args, hasBody, callback, errCall){
		//args.url = args.location ? args.location + args.url : args.url;
		//delete args.location;
		//if(rias.xhr.isLocal(args.url)){
		if(args.isFileLocation){
			args.url = args.url + ".js";
			var _handleAs = args.handleAs;
			args.handleAs = "text";
			args = rias.mixin({
				load: function(js){
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
				}
			}, args);
		}else{
			args = rias.mixin({
				load: function(response){
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
				}
			}, args);
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
		query = (query ? rias.delegate(query) : {});
		if(typeof url === "object"){
			args = url;
			args.content = query;
		}else{
			args = {
				url: url,
				handleAs: handleAs,
				preventCache: preventCache || true,
				content: query
			};
		}
		if(!args.content){
			args.content = {};
		}
		//args.postData._method = "GET";
		return _xhr("GET", args, false, callback, errCall);
	};
	rias.xhrPost = function(/*url|args*/url, postData, callback, errCall){
		var args;
		postData = (postData ? rias.delegate(postData) : {});
		if(typeof url === "object"){
			args = url;
			args.postData = postData;
		}else{
			args = {
				url: url,
				postData: postData
			};
		}
		args.postData._method = "POST";
		if(!args.handleAs){
			args.handleAs = "json";
		}
		return _xhr("POST", args, true, callback, errCall);
	};
	rias.xhrPut = rias.xhrModi = function(/*url|args*/url, postData, callback, errCall){
		var args;
		postData = (postData ? rias.delegate(postData) : {});
		if(typeof url === "object"){
			args = url;
			args.postData = postData;
		}else{
			args = {
				url: url,
				postData: postData
			};
		}
		args.postData._method = "PUT";
		if(!args.handleAs){
			args.handleAs = "json";
		}
		return _xhr("POST", args, true, callback, errCall);
	};
	rias.xhrAdd = function(/*url|args*/url, postData, callback, errCall){
		var args;
		postData = (postData ? rias.delegate(postData) : {});
		if(typeof url === "object"){
			args = url;
			args.postData = postData;
		}else{
			args = {
				url: url,
				postData: postData
			};
		}
		args.postData._method = "POST";
		if(!args.handleAs){
			args.handleAs = "json";
		}
		return _xhr("POST", args, true, callback, errCall);
	};
	rias.xhrDelete = function(/*url|args*/url, postData, callback, errCall){
		var args;
		postData = (postData ? rias.delegate(postData) : {});
		if(typeof url === "object"){
			args = url;
			args.postData = postData;
		}else{
			args = {
				url: url,
				postData: postData
			};
		}
		args.postData._method = "DELETE";
		if(!args.handleAs){
			args.handleAs = "json";
		}
		return _xhr("POST", args, true, callback, errCall);
	};
	rias.xhrSave = function(/*url|args*/url, postData, callback, errCall){
		var args;
		postData = (postData ? rias.delegate(postData) : {});
		if(typeof url === "object"){
			args = url;
			args.postData = postData;
		}else{
			args = {
				url: url,
				postData: postData
			};
		}
		args.postData._method = "SAVE";
		if(!args.handleAs){
			args.handleAs = "json";
		}
		return _xhr("POST", args, true, callback, errCall);
	};

	return rias;

});
