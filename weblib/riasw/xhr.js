
//RIAStudio Client Runtime(rias) in Browser.

define([
	"exports",
	"module",
	"riasw/hostDojo",///riaswBase 引用了 xhr，需要单独引用 hostDojo 获取 rias
	"riasw/riaswBase",///rias.error 等
	"dojo/_base/xhr",
	"dojo/request",
	"dojo/request/util",
	'dojo/request/watch',
	'dojo/request/handlers',
	"dojo/request/notify",
	"dojo/dom-form"
], function(exports, module, rias, riaswBase, xhr, request, util, watch, handlers, notify, domForm) {

	util.parseArgs = function(url, options, skipData){
		var data = options.data,
			query = options.query;

		if(data && !skipData){
			///兼容性修改 ArrayBuffer 和 Blob
			if(typeof data === 'object'){
				try{
					if(!(data instanceof ArrayBuffer || data instanceof Blob )){
						options.data = rias.objToUrlParams(data);
					}
				}catch(e){
					options.data = rias.objToUrlParams(data);
				}
			}
		}

		if(typeof query === 'object'){
			query = rias.objToUrlParams(query);
		}
		if(options.preventCache){
			query += (query ? '&' : '') + 'request.preventCache=' + (+(new Date()));
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

	rias.xhr = exports;
	exports.simulate = rias.has("rias-xhr-simulate");
	exports.defaultTimeout = rias.config.waitSeconds ? rias.config.waitSeconds * 1000 : undefined;
	exports.withCredentials = true;

	//exports.isLocal = function(url){
	//	return /^file:\/\//.test(url) && !/^http/.test(url);
	//};

	exports.toServerUrl = function(url, referenceModule){
		if(!/:\/\//.test(url)){
			if(rias.hostNative && rias.nativeShell){
				url = (rias.nativeShell.serverLocation ? rias.formatPath(rias.nativeShell.serverLocation) : "") + url;
			}
		}
		return url;
	};

	exports.checkStatus = function(stat){
		stat = stat || 0;
		return (stat >= 200 && stat < 300) || // allow any 2XX response code
			stat === 304 ||                 // or, get it out of the cache
			stat === 1223 ||                // or, Internet Explorer mangled the status code
			!stat;                         // or, we're Titanium/browser chrome/chrome extension requesting a local file
	};
	exports._timeoutCount = 0;
	exports._timeoutLimit = 10;
	exports._countTimeout = function(isTimeout){
		if(isTimeout){
			exports._timeoutCount++;
			if(exports._timeoutCount > exports._timeoutLimit){
				var s = rias.substitute(rias.i18n.message.xhrTimeoutLimit, [exports._timeoutLimit]);
				console.warn(s);
				rias.publish("/rias/xhr/timeoutLimit", s);
			}
		}else{
			exports._timeoutCount = 0;
		}
	};
	exports.isOrigin = function(url){
		return url && (url.indexOf("./") === 0 || url.indexOf("../") === 0 || url.indexOf(location.origin) === 0 ||
			url.indexOf("/") === 0 && url.indexOf("//") !== 0);
	};

	exports.convertErrorMessage = function(err){
		if(!err.messageConverted){
			var s = "";
			if(err.responseURL){
				s = err.responseURL + "<br/>";
			}else if(err.response){
				s = err.response.url + "<br/>";
			}
			s = decodeURI(s);
			s += err.message + "<br/>";

			if(/Request canceled/ig.test(err.message)){
				s += rias.i18n.message.xhrCancel;
			}else if(err.status === 401){
				s += rias.i18n.message.needLogin + "<br/>" + err.responseText;
			}else if(err.status === 405){
				s += rias.i18n.message.needRight + "<br/>" + err.responseText;
			}else{
				if(err.status === 0){
					s += rias.i18n.message.xhrNoServer;
				}else if(err.status === 500){
					s += rias.i18n.message.xhr500 + "<br/>" + err.responseText;
				}else if(err.status === 504){
					s += rias.i18n.message.xhr504 + "<br/>" + err.responseText;
				}else if(/Timeout/ig.test(err.message)){
					s += rias.i18n.message.xhrTimeout;
				}else{
					s += rias.i18n.message.xhrError;
					if(rias.isDebug){
						s += "<br/>" + err.responseText;
					}
				}
			}
			err.message = s;
			err.messageConverted = true;
		}
		return err;
	};
	exports.error = function(err, ioArgs){
		exports.convertErrorMessage(err);
		var s = err.message,
			args = ioArgs ? ioArgs.args ? ioArgs.args : ioArgs : {};
		if(/Request canceled/ig.test(err.message)){
			s = "";
		}else if(err.status === 401){
			//if(exports.isOrigin(ioArgs && ioArgs.xhr && ioArgs.xhr.responseURL) && rias.desktop && rias.isFunction(rias.desktop.doLogin)){
			//if(exports.isOrigin(args.url)){
				//if(rias.desktop && rias.isFunction(rias.desktop.doLogin)){
				//	s = "";
				//	rias.desktop.doLogin({
				//		around: args.popupArgs ? args.popupArgs.around : undefined
				//	});
				//}
				s = "";
				rias.publish("/rias/xhr/401", args);
			//}
		}else if(args.silenceError){
			s = "";
		}

		exports._countTimeout(err.status === 0 || /Timeout/ig.test(err.message));

		console.error(s, err, rias.getStackTrace(err));
		if(s){
			rias.error(s, args.ownerRiasw, args.popupArgs ? args.popupArgs.around : undefined);
		}
		if(rias.isFunction(args.errorCallback)){
			args.errorCallback(err);
		}
		return err;
	};
	rias.after(xhr, "_ioSetArgs", function(d){
		d.addCallback(function(result){
			exports._countTimeout(false);
		});
		d.addErrback(function(e){
			if(!d.ioArgs.args._riaswXhr){
				return exports.error(e, d.ioArgs);
			}
			return exports.convertErrorMessage(e);
		});
		return d;
	});

	function _xhr(method, args, hasBody, callback, errCall){
		//args.url = args.location ? args.location + args.url : args.url;
		//delete args.location;
		//if(exports.isLocal(args.url)){
		args = rias.mixinDeep({}, args);
		args.url = rias.toUrl(args.url);
		if(args.isFileLocation){
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
								exports._countTimeout(false);
								if(rias.isFunction(callback)){
									return callback(result);
								}
							},
							function(e){
								console.error(e);
								if(rias.isFunction(errCall)){
									errCall(e);
								}
							});
					}catch(e){
						console.error(e, args);
						rias.error(e);
					}
				};
			}
		}else{
			if(!args.load){
				args.load = function(response){
					try{
						if(response instanceof Error){
							//var s = method + " " + args.url + " error:\n";
							console.error(response, args);
							rias.error(response);
						}else{
							exports._countTimeout(false);
							if(rias.isFunction(callback)){
								return callback(response);
							}
						}
					}catch(e){
						console.error(e, args);
						rias.error(e);
					}
				};
			}
		}
		if(!(args.timeout > 0)){
			args.timeout = exports.defaultTimeout;
		}
		if(exports.withCredentials){
			args.withCredentials = true;
		}
		args.popupArgs = rias.mixin({
			parent: args.parent,
			around: args.around ? args.around : args.x && args.y ? {x: args.x, y: args.y} : undefined,
			popupPositions: args.popupPositions,
			maxHeight: args.maxHeight,
			padding: args.padding
		}, args.popupArgs);
		args.errorCallback = errCall;
		var argErr = args.error;
		delete args.error;
		args = rias.mixin({
			//timeout: exports.defaultTimeout,
			/// error 改在 rias.after(xhr, "_ioSetArgs", function(d) 中处理
			failOk: true,
			error: function(){
				if(rias.isFunction(argErr)){
					if(argErr.apply(exports, arguments) == false){
						return;
					}
				}
				return exports.error.apply(exports, arguments);
			},
			_riaswXhr: 1
		}, args);
		return xhr(method, args, hasBody);
	}
	exports.get = function(/*url|args*/url, query, callback, errCall, preventCache, handleAs){
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
	exports.post = function(/*url|args*/url, postData, callback, errCall, preventCache, handleAs){
		return _xhrPost("POST", url, postData, callback, errCall, preventCache, handleAs);
	};
	exports.put = function(/*url|args*/url, postData, callback, errCall, preventCache, handleAs){
		return _xhrPost("PUT", url, postData, callback, errCall, preventCache, handleAs);
	};
	exports.modi = exports.put;
	exports.add = function(/*url|args*/url, postData, callback, errCall, preventCache, handleAs){
		return _xhrPost("POST", url, postData, callback, errCall, preventCache, handleAs);
	};
	exports.dele = function(/*url|args*/url, postData, callback, errCall, preventCache, handleAs){
		return _xhrPost("DELETE", url, postData, callback, errCall, preventCache, handleAs);
	};
	exports["delete"] = exports.dele;
	exports.save = function(/*url|args*/url, postData, callback, errCall, preventCache, handleAs){
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
			if(dfd._originalAction){
				formNode.setAttribute('action', dfd._originalAction);
			}
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
			rias.desktop ? rias.desktop.domNode : rias.dom.docBody);
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
		}, rias.desktop ? rias.desktop.domNode : rias.dom.docBody);
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
				data = rias.mixin(rias.urlParamsToObj(queryStr), data);
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
						(rias.desktop ? rias.desktop.domNode : rias.dom.docBody).appendChild(formNode);
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

				if(notify){
					notify.emit('send', response, dfd.promise.cancel);
				}
				formNode.submit();
			}else{
				// otherwise we post a GET string by changing URL location for the
				// iframe

				var extra = '';
				if(response.options.data){
					extra = response.options.data;
					if(typeof extra !== 'string'){
						extra = rias.objToUrlParams(extra);
					}
				}
				var tmpUrl = response.url + (response.url.indexOf('?') > -1 ? '&' : '?') + extra;
				if(notify){
					notify.emit('send', response, dfd.promise.cancel);
				}
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
		if(!(args.timeout > 0)){
			args.timeout = exports.defaultTimeout;
		}
		if(exports.withCredentials){
			args.withCredentials = true;
		}
		args.popupArgs = rias.mixin({
			parent: args.parent,
			around: args.around ? args.around : args.x && args.y ? {x: args.x, y: args.y} : undefined,
			popupPositions: args.popupPositions,
			maxHeight: args.maxHeight,
			padding: args.padding
		}, args.popupArgs);
		args.errorCallback = errCall;
		return iframeRequest(args.url, args).then(function(response){
			try{
				if(response instanceof Error){
					//var s = method + " " + args.url + " error:\n";
					console.error(response, args);
					rias.error(response);
				}else{
					//response = rias.fromJson(response);
					if(rias.isFunction(callback)){
						return callback(response);
					}
				}
			}catch(e){
				console.error(e, args);
				rias.error(e);
			}
		}, function(e){
			console.error(e, args);
			rias.error(e);
		});
	}
	exports.iframeGet = function(url, query, callback, errCall, preventCache, handleAs, target){
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
	exports.iframePost = function(url, postData, callback, errCall, preventCache, handleAs, target){
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

	exports.open = function(/*url|args*/url, query, preventCache, windowName){
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
			query = rias.objToUrlParams(query);
		}
		if(args.query){
			if(typeof args.query === 'object'){
				query += rias.objToUrlParams(args.query);
			}else{
				query += args.query;
			}
		}
		if(preventCache || args.preventCache){
			query += (query ? '&' : '') + 'request.preventCache=' + (+(new Date()));
		}

		if(url && query){
			url += (~url.indexOf('?') ? '&' : '?') + query;
		}

		window.open(url, windowName || "_blank").focus();
	};

	return exports;

});
