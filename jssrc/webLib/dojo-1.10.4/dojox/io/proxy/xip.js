//>>built

define("dojox/io/proxy/xip", ["dojo/main", "dojo/io/iframe", "dojox/data/dom", "dojo/_base/xhr", "dojo/_base/url"], function (dojo, iframe, dom) {
    dojo.getObject("io.proxy.xip", true, dojox);
    dojox.io.proxy.xip = {xipClientUrl:((dojo.config || djConfig)["xipClientUrl"]) || dojo.moduleUrl("dojox.io.proxy", "xip_client.html").toString(), urlLimit:4000, _callbackName:(dojox._scopeName || "dojox") + ".io.proxy.xip.fragmentReceived", _state:{}, _stateIdCounter:0, _isWebKit:navigator.userAgent.indexOf("WebKit") != -1, send:function (facade) {
        var url = this.xipClientUrl;
        if (url.split(":")[0].match(/javascript/i) || facade._ifpServerUrl.split(":")[0].match(/javascript/i)) {
            return null;
        }
        var colonIndex = url.indexOf(":");
        var slashIndex = url.indexOf("/");
        if (colonIndex == -1 || slashIndex < colonIndex) {
            var loc = window.location.href;
            if (slashIndex == 0) {
                url = loc.substring(0, loc.indexOf("/", 9)) + url;
            } else {
                url = loc.substring(0, (loc.lastIndexOf("/") + 1)) + url;
            }
        }
        this.fullXipClientUrl = url;
        if (typeof document.postMessage != "undefined") {
            document.addEventListener("message", dojo.hitch(this, this.fragmentReceivedEvent), false);
        }
        this.send = this._realSend;
        return this._realSend(facade);
    }, _realSend:function (facade) {
        var stateId = "XhrIframeProxy" + (this._stateIdCounter++);
        facade._stateId = stateId;
        var frameUrl = facade._ifpServerUrl + "#0:init:id=" + stateId + "&client=" + encodeURIComponent(this.fullXipClientUrl) + "&callback=" + encodeURIComponent(this._callbackName);
        this._state[stateId] = {facade:facade, stateId:stateId, clientFrame:iframe.create(stateId, "", frameUrl), isSending:false, serverUrl:facade._ifpServerUrl, requestData:null, responseMessage:"", requestParts:[], idCounter:1, partIndex:0, serverWindow:null};
        return stateId;
    }, receive:function (stateId, urlEncodedData) {
        var response = {};
        var nvPairs = urlEncodedData.split("&");
        for (var i = 0; i < nvPairs.length; i++) {
            if (nvPairs[i]) {
                var nameValue = nvPairs[i].split("=");
                response[decodeURIComponent(nameValue[0])] = decodeURIComponent(nameValue[1]);
            }
        }
        var state = this._state[stateId];
        var facade = state.facade;
        facade._setResponseHeaders(response.responseHeaders);
        if (response.status == 0 || response.status) {
            facade.status = parseInt(response.status, 10);
        }
        if (response.statusText) {
            facade.statusText = response.statusText;
        }
        if (response.responseText) {
            facade.responseText = response.responseText;
            var contentType = facade.getResponseHeader("Content-Type");
            if (contentType) {
                var mimeType = contentType.split(";")[0];
                if (mimeType.indexOf("application/xml") == 0 || mimeType.indexOf("text/xml") == 0) {
                    facade.responseXML = dom.createDocument(response.responseText, contentType);
                }
            }
        }
        facade.readyState = 4;
        this.destroyState(stateId);
    }, frameLoaded:function (stateId) {
        var state = this._state[stateId];
        var facade = state.facade;
        var reqHeaders = [];
        for (var param in facade._requestHeaders) {
            reqHeaders.push(param + ": " + facade._requestHeaders[param]);
        }
        var requestData = {uri:facade._uri};
        if (reqHeaders.length > 0) {
            requestData.requestHeaders = reqHeaders.join("\r\n");
        }
        if (facade._method) {
            requestData.method = facade._method;
        }
        if (facade._bodyData) {
            requestData.data = facade._bodyData;
        }
        this.sendRequest(stateId, dojo.objectToQuery(requestData));
    }, destroyState:function (stateId) {
        var state = this._state[stateId];
        if (state) {
            delete this._state[stateId];
            var parentNode = state.clientFrame.parentNode;
            parentNode.removeChild(state.clientFrame);
            state.clientFrame = null;
            state = null;
        }
    }, createFacade:function () {
        if (arguments && arguments[0] && arguments[0].iframeProxyUrl) {
            return new dojox.io.proxy.xip.XhrIframeFacade(arguments[0].iframeProxyUrl);
        } else {
            return dojox.io.proxy.xip._xhrObjOld.apply(dojo, arguments);
        }
    }, sendRequest:function (stateId, encodedData) {
        var state = this._state[stateId];
        if (!state.isSending) {
            state.isSending = true;
            state.requestData = encodedData || "";
            state.serverWindow = frames[state.stateId];
            if (!state.serverWindow) {
                state.serverWindow = document.getElementById(state.stateId).contentWindow;
            }
            if (typeof document.postMessage == "undefined") {
                if (state.serverWindow.contentWindow) {
                    state.serverWindow = state.serverWindow.contentWindow;
                }
            }
            this.sendRequestStart(stateId);
        }
    }, sendRequestStart:function (stateId) {
        var state = this._state[stateId];
        state.requestParts = [];
        var reqData = state.requestData;
        var urlLength = state.serverUrl.length;
        var partLength = this.urlLimit - urlLength;
        var reqIndex = 0;
        while ((reqData.length - reqIndex) + urlLength > this.urlLimit) {
            var part = reqData.substring(reqIndex, reqIndex + partLength);
            var percentIndex = part.lastIndexOf("%");
            if (percentIndex == part.length - 1 || percentIndex == part.length - 2) {
                part = part.substring(0, percentIndex);
            }
            state.requestParts.push(part);
            reqIndex += part.length;
        }
        state.requestParts.push(reqData.substring(reqIndex, reqData.length));
        state.partIndex = 0;
        this.sendRequestPart(stateId);
    }, sendRequestPart:function (stateId) {
        var state = this._state[stateId];
        if (state.partIndex < state.requestParts.length) {
            var partData = state.requestParts[state.partIndex];
            var cmd = "part";
            if (state.partIndex + 1 == state.requestParts.length) {
                cmd = "end";
            } else {
                if (state.partIndex == 0) {
                    cmd = "start";
                }
            }
            this.setServerUrl(stateId, cmd, partData);
            state.partIndex++;
        }
    }, setServerUrl:function (stateId, cmd, message) {
        var serverUrl = this.makeServerUrl(stateId, cmd, message);
        var state = this._state[stateId];
        if (this._isWebKit) {
            state.serverWindow.location = serverUrl;
        } else {
            state.serverWindow.location.replace(serverUrl);
        }
    }, makeServerUrl:function (stateId, cmd, message) {
        var state = this._state[stateId];
        var serverUrl = state.serverUrl + "#" + (state.idCounter++) + ":" + cmd;
        if (message) {
            serverUrl += ":" + message;
        }
        return serverUrl;
    }, fragmentReceivedEvent:function (evt) {
        if (evt.uri.split("#")[0] == this.fullXipClientUrl) {
            this.fragmentReceived(evt.data);
        }
    }, fragmentReceived:function (frag) {
        var index = frag.indexOf("#");
        var stateId = frag.substring(0, index);
        var encodedData = frag.substring(index + 1, frag.length);
        var msg = this.unpackMessage(encodedData);
        var state = this._state[stateId];
        switch (msg.command) {
          case "loaded":
            this.frameLoaded(stateId);
            break;
          case "ok":
            this.sendRequestPart(stateId);
            break;
          case "start":
            state.responseMessage = "" + msg.message;
            this.setServerUrl(stateId, "ok");
            break;
          case "part":
            state.responseMessage += msg.message;
            this.setServerUrl(stateId, "ok");
            break;
          case "end":
            this.setServerUrl(stateId, "ok");
            state.responseMessage += msg.message;
            this.receive(stateId, state.responseMessage);
            break;
        }
    }, unpackMessage:function (encodedMessage) {
        var parts = encodedMessage.split(":");
        var command = parts[1];
        encodedMessage = parts[2] || "";
        var config = null;
        if (command == "init") {
            var configParts = encodedMessage.split("&");
            config = {};
            for (var i = 0; i < configParts.length; i++) {
                var nameValue = configParts[i].split("=");
                config[decodeURIComponent(nameValue[0])] = decodeURIComponent(nameValue[1]);
            }
        }
        return {command:command, message:encodedMessage, config:config};
    }};
    dojox.io.proxy.xip._xhrObjOld = dojo._xhrObj;
    dojo._xhrObj = dojox.io.proxy.xip.createFacade;
    dojox.io.proxy.xip.XhrIframeFacade = function (ifpServerUrl) {
        this._requestHeaders = {};
        this._allResponseHeaders = null;
        this._responseHeaders = {};
        this._method = null;
        this._uri = null;
        this._bodyData = null;
        this.responseText = null;
        this.responseXML = null;
        this.status = null;
        this.statusText = null;
        this.readyState = 0;
        this._ifpServerUrl = ifpServerUrl;
        this._stateId = null;
    };
    dojo.extend(dojox.io.proxy.xip.XhrIframeFacade, {open:function (method, uri) {
        this._method = method;
        this._uri = uri;
        this.readyState = 1;
    }, setRequestHeader:function (header, value) {
        this._requestHeaders[header] = value;
    }, send:function (stringData) {
        this._bodyData = stringData;
        this._stateId = dojox.io.proxy.xip.send(this);
        this.readyState = 2;
    }, abort:function () {
        dojox.io.proxy.xip.destroyState(this._stateId);
    }, getAllResponseHeaders:function () {
        return this._allResponseHeaders;
    }, getResponseHeader:function (header) {
        return this._responseHeaders[header];
    }, _setResponseHeaders:function (allHeaders) {
        if (allHeaders) {
            this._allResponseHeaders = allHeaders;
            allHeaders = allHeaders.replace(/\r/g, "");
            var nvPairs = allHeaders.split("\n");
            for (var i = 0; i < nvPairs.length; i++) {
                if (nvPairs[i]) {
                    var nameValue = nvPairs[i].split(": ");
                    this._responseHeaders[nameValue[0]] = nameValue[1];
                }
            }
        }
    }});
    return dojox.io.proxy.xip;
});

