
//RIAStudio Client Runtime(rias) in Browser.

define([
	"module",
	"rias/base/riasBase",
	"dojo/_base/xhr",
	"dojo/request",
	"dojo/request/util",
	'dojo/request/watch',
	'dojo/request/handlers',
	"dojo/request/notify",
	"dojo/dom-form"
], function(module, rias, xhr, request, util, watch, handlers, notify, domForm) {

	util.parseArgs = function(url, options, skipData){
		var data = options.data,
			query = options.query;

		if(data && !skipData){
			///兼容性修改 ArrayBuffer 和 Blob
			if(typeof data === 'object'){
				try{
					if(!(data instanceof ArrayBuffer || data instanceof Blob )){
						options.data = rias.objectToQuery(data);
					}
				}catch(e){
					options.data = rias.objectToQuery(data);
				}
			}
		}

		if(typeof query === 'object'){
			query = rias.objectToQuery(query);
		}
		if(options.preventCache){
			query += (query ? '&' : '') + 'request.preventCache=' + (+(new Date));
		}

		if(url && query){
			url += (~url.indexOf('?') ? '&' : '?') + query;
		}

		return {
			url: url,
			options: options,
			getHeader: function(headerName){ return null; }
		};
	};

	rias.xhr = {
		simulate: rias.has("rias-xhr-simulate"),
		defaultTimeout: rias.config.waitSeconds ? rias.config.waitSeconds * 1000 : undefined,
		withCredentials: true
	};

	//rias.xhr.isLocal = function(url){
	//	return /^file:\/\//.test(url) && !/^http/.test(url);
	//};

	rias.xhr.toServerUrl = function(url, referenceModule){
		!/:\/\//.test(url) && (url = rias.hostNative && rias.nativeShell ?
			(rias.nativeShell.serverLocation ? rias.formatPath(rias.nativeShell.serverLocation) : "") + url :
			url);
		return url;
	};

	rias.xhr.checkStatus = function(stat){
		stat = stat || 0;
		return (stat >= 200 && stat < 300) || // allow any 2XX response code
			stat === 304 ||                 // or, get it out of the cache
			stat === 1223 ||                // or, Internet Explorer mangled the status code
			!stat;                         // or, we're Titanium/browser chrome/chrome extension requesting a local file
	};
	rias.xhr.error = function(err, args){
		var s = "";
		if(err){
			if(err.responseURL){
				s = err.responseURL + "<br/>";
			}else if(err.response){
				s = err.response.url + "<br/>";
			}
			s = decodeURI(s);
		}
		if(err instanceof Error){
			console.error(s, rias.captureStackTrace(err));
		}
		if(err.status == 401){
			if(rias.webApp && rias.isFunction(rias.webApp.doLogin)){
				rias.webApp.doLogin({
					around: args.initPlaceToArgs ? args.initPlaceToArgs.around : undefined
				});
			}else{
				rias.error(s + "需要登录...<br/>" + err.responseText,
					args.initPlaceToArgs ? args.initPlaceToArgs.around : undefined,
					args.initPlaceToArgs ? args.initPlaceToArgs.popupParent : undefined
				);
			}
		}else if(err.status == 405){
			rias.error(s + "缺少权限...<br/>" + err.responseText,
				args.initPlaceToArgs ? args.initPlaceToArgs.around : undefined,
				args.initPlaceToArgs ? args.initPlaceToArgs.popupParent : undefined
			);
		}else if(!args.silenceError){
			if(err){
				if(err.status == 0){
					rias.error(s + "未能找到服务器，请检查网络连接是否正常。",
						args.initPlaceToArgs ? args.initPlaceToArgs.around : undefined,
						args.initPlaceToArgs ? args.initPlaceToArgs.popupParent : undefined
					);
				}else if(err.status == 500){
					rias.error(s + "服务器Action处理出错...<br/>" + err.responseText,
						args.initPlaceToArgs ? args.initPlaceToArgs.around : undefined,
						args.initPlaceToArgs ? args.initPlaceToArgs.popupParent : undefined
					);
				}else if(err.status == 504){
					rias.error(s + "服务器超时...<br/>" + err.responseText,
						args.initPlaceToArgs ? args.initPlaceToArgs.around : undefined,
						args.initPlaceToArgs ? args.initPlaceToArgs.popupParent : undefined
					);
				}else if(/Timeout/ig.test(err.message)){
					rias.error(s + "网络超时，请重试...",
						args.initPlaceToArgs ? args.initPlaceToArgs.around : undefined,
						args.initPlaceToArgs ? args.initPlaceToArgs.popupParent : undefined
					);
				}else if(/Request canceled/ig.test(err.message)){
					//rias.warn(s + "取消了网络请求...");
				}else if(rias.isDebug){
					rias.error(s + err.toString() + "<br/>" + err.responseText,
						args.initPlaceToArgs ? args.initPlaceToArgs.around : undefined,
						args.initPlaceToArgs ? args.initPlaceToArgs.popupParent : undefined
					);
				}else{
					rias.error(s + err.toString(),
						args.initPlaceToArgs ? args.initPlaceToArgs.around : undefined,
						args.initPlaceToArgs ? args.initPlaceToArgs.popupParent : undefined
					);
				}
			}else{
				rias.error(s + "网络请求发生错误，请检查。",
					args.initPlaceToArgs ? args.initPlaceToArgs.around : undefined,
					args.initPlaceToArgs ? args.initPlaceToArgs.popupParent : undefined
				);
			}
		}
		if(rias.isFunction(args.errorCallback)){
			args.errorCallback(err);
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
		args.url = rias.toUrl(args.url);
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
								status: response.status || 500,
								response: {
									url: args.url
								}
							}), args);
						}else if(rias.isFunction(callback)){
							return callback(response);
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
	rias.xhr.get = function(/*url|args*/url, query, callback, errCall, preventCache, handleAs){
		var args;
		if(typeof url === "object"){
			args = rias.mixinDeep({}, url);
		}else{
			args = {
				url: url
			};
		}
		if(handleAs){
			args.handleAs = handleAs;
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
		if(args.postData){
			delete args.postData;
		}
		return _xhr("GET", args, false, callback, errCall);
	};
	function _xhrPost(method, /*url|args*/url, postData, callback, errCall, preventCache, handleAs){
		var args;
		if(typeof url === "object"){
			args = rias.mixinDeep({}, url);
		}else{
			args = {
				url: url
			};
		}
		if(handleAs){
			args.handleAs = handleAs;
		}
		if(!args.handleAs){
			args.handleAs = "json";
		}
		if(!args.postData){
			args.postData = {};
		}
		rias.mixinDeep(args.postData, postData);
		if(preventCache != undefined){
			args.preventCache = preventCache;
		}
		args.postData._method = method;
		if(args.query){
			delete args.query;
		}
		return _xhr("POST", args, true, callback, errCall);
	}
	rias.xhr.post = function(/*url|args*/url, postData, callback, errCall, preventCache, handleAs){
		return _xhrPost("POST", url, postData, callback, errCall, preventCache, handleAs);
	};
	rias.xhr.put = function(/*url|args*/url, postData, callback, errCall, preventCache, handleAs){
		return _xhrPost("PUT", url, postData, callback, errCall, preventCache, handleAs);
	};
	rias.xhr.modi = rias.xhr.put;
	rias.xhr.add = function(/*url|args*/url, postData, callback, errCall, preventCache, handleAs){
		return _xhrPost("POST", url, postData, callback, errCall, preventCache, handleAs);
	};
	rias.xhr.dele = function(/*url|args*/url, postData, callback, errCall, preventCache, handleAs){
		return _xhrPost("DELETE", url, postData, callback, errCall, preventCache, handleAs);
	};
	rias.xhr["delete"] = rias.xhr.dele;
	rias.xhr.save = function(/*url|args*/url, postData, callback, errCall, preventCache, handleAs){
		return _xhrPost("SAVE", url, postData, callback, errCall, preventCache, handleAs);
	};


	/* iframe =======================================*/
	/* 重写 dojo.request.iframe，使 form 能够保持既有的 target，并扩展 handleResponse 方法？*/

	var mid = module.id.replace(/[\/\.\-]/g, '_'),
		_iframeName = mid + "_iframe",
		_formName = mid + "_form",
		//onloadName = mid + '_onload',
		_dfdQueue = [],
		_currentDfd;

	function iframeOnload(hasError){
		var dfd = _currentDfd;
		if(!dfd){
			fireNextRequest();
			return;
		}

		var response = dfd.response,
			options = response.options,
			formNode = rias.dom.byId(options.form);// || dfd._tmpForm;

		if(formNode){
			// remove all the hidden content inputs
			var toClean = dfd._contentToClean;
			for(var i = 0; i < toClean.length; i++){
				var key = toClean[i];
				//Need to cycle over all nodes since we may have added
				//an array value which means that more than one node could
				//have the same .name value.
				for(var j = 0; j < formNode.childNodes.length; j++){
					var childNode = formNode.childNodes[j];
					if(childNode.name === key){
						rias.dom.destroy(childNode);
						break;
					}
				}
			}

			// restore original action + target
			dfd._originalAction && formNode.setAttribute('action', dfd._originalAction);
			if(dfd._originalMethod){
				formNode.setAttribute('method', dfd._originalMethod);
				formNode.method = dfd._originalMethod;
			}
			if(dfd._originalTarget){
				formNode.setAttribute('target', dfd._originalTarget);
				formNode.target = dfd._originalTarget;
			}
			if(dfd._originalEncoding){
				formNode.setAttribute('encoding', dfd._originalEncoding);
				formNode.encoding = dfd._originalEncoding;
			}
		}

		if(dfd._tmpForm){
			rias.dom.destroy(dfd._tmpForm);
			delete dfd._tmpForm;
		}

		dfd._finished = !hasError;
	}
	function getIframe(){
		if(rias.global.frames[_iframeName]){
			return rias.global.frames[_iframeName];
		}

		var uri;// = rias.has("ie") ? "javascript:''" : "about:blank";
		if(!uri){
			if(rias.has('config-useXDomain') && !rias.has('config-dojoBlankHtmlUrl')){
				console.warn('dojo/request/iframe: When using cross-domain Dojo builds,' +
					' please save dojo/resources/blank.html to your domain and set dojoConfig.dojoBlankHtmlUrl' +
					' to the path on your domain to blank.html');
			}
			uri = (rias.has('config-dojoBlankHtmlUrl') || rias.toUrl('dojo/resources/blank.html'));
		}

		var frame = rias.dom.place('<iframe id="' + _iframeName + '" name="' + _iframeName + '" src="' + uri +
			'" style="position: absolute; left: 1px; top: 1px; height: 1px; width: 1px; visibility: hidden">',
			rias.webApp ? rias.webApp.domNode : rias.dom.docBody);
		if (frame.attachEvent){
			frame.attachEvent("onload", function(){
				iframeOnload();
			});
			frame.attachEvent("onerror", function(e){
				iframeOnload(e);
			});
		} else {
			frame.onload = function(){
				iframeOnload();
			};
			frame.onerror = function(e){
				iframeOnload(e);
			};
		}

		return frame;
	}
	function getForm(){
		return rias.dom.create('form', {
			name: _formName,
			style: {
				position: 'absolute',
				top: '-1000px',
				left: '-1000px'
			}
		}, rias.webApp ? rias.webApp.domNode : rias.dom.docBody);
	}

	function fireNextRequest(){
		// summary:
		//		Internal method used to fire the next request in the queue.
		var dfd;
		try{
			if(_currentDfd || !_dfdQueue.length){
				return;
			}
			do{
				dfd = _currentDfd = _dfdQueue.shift();
			}while(dfd && (dfd.canceled || (dfd.isCanceled && dfd.isCanceled())) && _dfdQueue.length);

			if(!dfd || dfd.canceled || (dfd.isCanceled && dfd.isCanceled())){
				_currentDfd = null;
				return;
			}

			var response = dfd.response,
				options = response.options,
				c2c = dfd._contentToClean = [],
				formNode = rias.dom.byId(options.form),
				notify = util.notify,
				data = options.data || null,
				queryStr;

			if(!dfd._legacy && (options.target || options.method === 'POST') && !formNode){
				formNode = dfd._tmpForm = getForm(_formName);
			}else if(options.method === 'GET' && formNode && response.url.indexOf('?') > -1){
				queryStr = response.url.slice(response.url.indexOf('?') + 1);
				data = rias.mixin(rias.queryToObject(queryStr), data);
			}

			if(formNode){
				if(!dfd._legacy){
					var parentNode = formNode;
					do{
						parentNode = parentNode.parentNode;
					}while(parentNode && parentNode !== rias.dom.doc.documentElement);

					// Append the form node or some browsers won't work
					if(!parentNode){
						formNode.style.position = 'absolute';
						formNode.style.left = '-1000px';
						formNode.style.top = '-1000px';
						(rias.webApp ? rias.webApp.domNode : rias.dom.docBody).appendChild(formNode);
					}

					if(!formNode.name){
						formNode.name = _formName;
					}
				}

				// if we have things in data, we need to add them to the form
				// before submission
				if(data){
					var createInput = function(name, value){
						rias.dom.create('input', {
							type: 'hidden',
							name: name,
							value: value
						}, formNode);
						c2c.push(name);
					};
					for(var x in data){
						var val = data[x];
						if(rias.isArray(val) && val.length > 1){
							for(var i = 0; i < val.length; i++){
								createInput(x, val[i]);
							}
						}else{
							if(!formNode[x]){
								createInput(x, val);
							}else{
								formNode[x].value = val;
							}
						}
					}
				}

				//IE requires going through getAttributeNode instead of just getAttribute in some form cases,
				//so use it for all.  See #2844
				var actionNode = formNode.getAttributeNode('action'),
					methodNode = formNode.getAttributeNode('method'),
					targetNode = formNode.getAttributeNode('target'),
					encodingNode = formNode.getAttributeNode('encoding'),
					target = options.target ? options.target : _iframeName,
					encoding = "multipart/form-data";

				if(response.url){
					dfd._originalAction = actionNode ? actionNode.value : null;
					if(actionNode){
						actionNode.value = response.url;
					}else{
						formNode.setAttribute('action', response.url);
					}
				}

				if(!dfd._legacy){
					dfd._originalMethod = methodNode ? methodNode.value : null;
					if(methodNode){
						methodNode.value = options.method;
					}else{
						formNode.setAttribute('method', options.method);
					}
				}else{
					if(!methodNode || !methodNode.value){
						if(methodNode){
							methodNode.value = options.method;
						}else{
							formNode.setAttribute('method', options.method);
						}
					}
				}

				dfd._originalTarget = targetNode ? targetNode.value : null;
				if(targetNode){
					targetNode.value = target;
				}else{
					formNode.setAttribute('target', target);
				}
				formNode.target = target;

				dfd._originalEncoding = encodingNode ? encodingNode.value : null;
				if(options.isUpload){
					if(encodingNode){
						encodingNode.value = encoding;
					}else{
						formNode.setAttribute('encoding', encoding);
					}
					formNode.encoding = encoding;
				}

				notify && notify.emit('send', response, dfd.promise.cancel);
				formNode.submit();
			}else{
				// otherwise we post a GET string by changing URL location for the
				// iframe

				var extra = '';
				if(response.options.data){
					extra = response.options.data;
					if(typeof extra !== 'string'){
						extra = rias.objectToQuery(extra);
					}
				}
				var tmpUrl = response.url + (response.url.indexOf('?') > -1 ? '&' : '?') + extra;
				notify && notify.emit('send', response, dfd.promise.cancel);
				var frame = getIframe();
				if(frame.contentWindow){
					// We have an iframe node instead of the window
					frame = frame.contentWindow;
				}
				try{
					//if(!replace){
					//	frame.location = tmpUrl;
					//}else{
						frame.location.replace(tmpUrl);
					//}
				}catch(e){
					console.log('dojo/request/iframe.setSrc: ', e);
				}
			}
		}catch(e){
			dfd.reject(e);
		}
	}

	// dojo/request/watch handlers
	function isValid(response){
		return !this.isFulfilled();
	}
	function isReady(response){
		return !!this._finished;
	}
	function handleResponse(response, error){
		function iframeDoc(iframeNode){
			if(iframeNode.contentDocument){
				return iframeNode.contentDocument;
			}
			var name = iframeNode.name;
			if(name){
				var iframes = rias.dom.doc.getElementsByTagName('iframe');
				if(iframeNode.document && iframes[name].contentWindow && iframes[name].contentWindow.document){
					return iframes[name].contentWindow.document;
				}else if(rias.dom.doc.frames[name] && rias.dom.doc.frames[name].document){
					return rias.dom.doc.frames[name].document;
				}
			}
			return null;
		}
		if(!error){
			try{
				var options = response.options,
					doc = iframeDoc(getIframe()),///this = dfd;
					handleAs = options.handleAs;

				if(handleAs !== 'html'){
					if(handleAs === 'xml'){
						// IE6-8 have to parse the XML manually. See http://bugs.dojotoolkit.org/ticket/6334
						if(doc.documentElement.tagName.toLowerCase() === 'html'){
							rias.dom.query('a', doc.documentElement).orphan();
							var xmlText = doc.documentElement.innerText || doc.documentElement.textContent;
							xmlText = xmlText.replace(/>\s+</g, '><');
							response.text = rias.trim(xmlText);
						}else{
							response.data = doc;
						}
					}else{
						// 'json' and 'javascript' and 'text'
						response.text = doc.getElementsByTagName('textarea')[0].value; // text
					}
					handlers(response);
				}else{
					response.data = doc;
				}
			}catch(e){
				error = e;
			}
		}

		if(error){
			this.reject(error);
		}else if(this._finished){
			this.resolve(response);
		}else{
			this.reject(new Error('Invalid dojo/request/iframe request state'));
		}
	}
	function last(response){
		this._callNext();
	}
	function iframeRequest(url, options, returnDeferred){
		var response = util.parseArgs(url, util.deepCreate({
			method: 'POST'
		}, options), true);
		url = response.url;
		options = response.options;

		if(options.method !== 'GET' && options.method !== 'POST'){
			throw new Error(options.method + ' not supported by dojo/request/iframe');
		}

		getIframe();
		var dfd = util.deferred(response, null, isValid, isReady, handleResponse, last);
		dfd._callNext = function(){
			if(!this._calledNext){
				this._calledNext = true;
				_currentDfd = null;
				fireNextRequest();
			}
		};
		dfd._legacy = returnDeferred;

		_dfdQueue.push(dfd);
		fireNextRequest();

		watch(dfd);

		return returnDeferred ? dfd : dfd.promise;
	}
	/*=====
	 iframe = function(url, options){
	 // summary:
	 //		Sends a request using an iframe element with the given URL and options.
	 // url: String
	 //		URL to request
	 // options: dojo/request/iframe.__Options?
	 //		Options for the request.
	 // returns: dojo/request.__Promise
	 };
	 iframe.__BaseOptions = declare(request.__BaseOptions, {
	 // form: DOMNode?
	 //		A form node to use to submit data to the server.
	 // data: String|Object?
	 //		Data to transfer. When making a GET request, this will
	 //		be converted to key=value parameters and appended to the
	 //		URL.
	 });
	 iframe.__MethodOptions = declare(null, {
	 // method: String?
	 //		The HTTP method to use to make the request. Must be
	 //		uppercase. Only `"GET"` and `"POST"` are accepted.
	 //		Default is `"POST"`.
	 });
	 iframe.__Options = declare([iframe.__BaseOptions, iframe.__MethodOptions]);

	 iframe.get = function(url, options){
	 // summary:
	 //		Send an HTTP GET request using an iframe element with the given URL and options.
	 // url: String
	 //		URL to request
	 // options: dojo/request/iframe.__BaseOptions?
	 //		Options for the request.
	 // returns: dojo/request.__Promise
	 };
	 iframe.post = function(url, options){
	 // summary:
	 //		Send an HTTP POST request using an iframe element with the given URL and options.
	 // url: String
	 //		URL to request
	 // options: dojo/request/iframe.__BaseOptions?
	 //		Options for the request.
	 // returns: dojo/request.__Promise
	 };
	 =====*/
	util.addCommonMethods(iframeRequest, ['GET', 'POST']);

	function _iframeRequest(method, args, callback, errCall){
		args = rias.mixinDeep({}, args);
		args.method = method;
		args.url = rias.toUrl(args.url);
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
		return iframeRequest(args.url, args).then(function(response){
			try{
				if(response instanceof Error){
					//var s = method + " " + args.url + " error:\n";
					rias.xhr.error(rias.mixinDeep(response, {
						status: response.status || 500,
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
		}, function(e){
			rias.xhr.error(e, args);
		});
	}
	rias.xhr.iframeGet = function(url, query, callback, errCall, preventCache, handleAs, target){
		var args;
		if(typeof url === "object"){
			args = rias.mixinDeep({}, url);
		}else{
			args = {
				url: url
			};
		}
		if(handleAs){
			args.handleAs = handleAs;
		}
		if(!args.data){
			args.data = {};
		}
		if(args.content){///兼容 xhrGet
			rias.mixinDeep(args.data, args.content);
		}
		if(args.query){
			rias.mixinDeep(args.data, args.query);
		}
		if(query != undefined){
			rias.mixinDeep(args.data, query);
		}
		if(preventCache != undefined){
			args.preventCache = preventCache;
		}
		args.target = target;
		args.data._method = "GET";
		//args.withCredentials = true;///跨域 cookie
		//args.postData._method = "GET";
		if(args.postData){
			delete args.postData;
		}
		return _iframeRequest("GET", args, callback, errCall);
	};
	rias.xhr.iframePost = function(url, postData, callback, errCall, preventCache, handleAs, target){
		var args;
		if(typeof url === "object"){
			args = rias.mixinDeep({}, url);
		}else{
			args = {
				url: url
			};
		}
		if(handleAs){
			args.handleAs = handleAs;
		}
		if(!args.handleAs){
			args.handleAs = "json";
		}
		if(!args.data){
			args.data = {};
		}
		rias.mixinDeep(args.data, postData);
		if(preventCache != undefined){
			args.preventCache = preventCache;
		}
		args.target = target;
		args.data._method = "POST";
		if(args.query){
			delete args.query;
		}
		return _iframeRequest("POST", args, callback, errCall);
	};

	rias.xhr.open = function(/*url|args*/url, query, preventCache, windowName){
		var args;
		if(typeof url === "object"){
			args = rias.mixinDeep({}, url);
		}else{
			args = {
				url: url
			};
		}
		url = rias.toUrl(args.url);

		if(typeof query === 'object'){
			query = rias.objectToQuery(query);
		}
		if(args.query){
			if(typeof args.query === 'object'){
				query += rias.objectToQuery(args.query);
			}else{
				query += args.query;
			}
		}
		if(preventCache || args.preventCache){
			query += (query ? '&' : '') + 'request.preventCache=' + (+(new Date));
		}

		if(url && query){
			url += (~url.indexOf('?') ? '&' : '?') + query;
		}

		window.open(url, windowName || "_blank").focus();
	};

	return rias;

});
