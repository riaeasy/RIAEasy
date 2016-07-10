//>>built
define("dojox/io/proxy/xip",["dojo/main","dojo/io/iframe","dojox/data/dom","dojo/_base/xhr","dojo/_base/url"],function(e,k,l){e.getObject("io.proxy.xip",!0,dojox);dojox.io.proxy.xip={xipClientUrl:(e.config||djConfig).xipClientUrl||e.moduleUrl("dojox.io.proxy","xip_client.html").toString(),urlLimit:4E3,_callbackName:(dojox._scopeName||"dojox")+".io.proxy.xip.fragmentReceived",_state:{},_stateIdCounter:0,_isWebKit:-1!=navigator.userAgent.indexOf("WebKit"),send:function(b){var a=this.xipClientUrl;if(a.split(":")[0].match(/javascript/i)||
b._ifpServerUrl.split(":")[0].match(/javascript/i))return null;var c=a.indexOf(":"),d=a.indexOf("/");if(-1==c||d<c)c=window.location.href,a=0==d?c.substring(0,c.indexOf("/",9))+a:c.substring(0,c.lastIndexOf("/")+1)+a;this.fullXipClientUrl=a;"undefined"!=typeof document.postMessage&&document.addEventListener("message",e.hitch(this,this.fragmentReceivedEvent),!1);this.send=this._realSend;return this._realSend(b)},_realSend:function(b){var a="XhrIframeProxy"+this._stateIdCounter++;b._stateId=a;var c=
b._ifpServerUrl+"#0:init:id\x3d"+a+"\x26client\x3d"+encodeURIComponent(this.fullXipClientUrl)+"\x26callback\x3d"+encodeURIComponent(this._callbackName);this._state[a]={facade:b,stateId:a,clientFrame:k.create(a,"",c),isSending:!1,serverUrl:b._ifpServerUrl,requestData:null,responseMessage:"",requestParts:[],idCounter:1,partIndex:0,serverWindow:null};return a},receive:function(b,a){for(var c={},d=a.split("\x26"),g=0;g<d.length;g++)if(d[g]){var f=d[g].split("\x3d");c[decodeURIComponent(f[0])]=decodeURIComponent(f[1])}d=
this._state[b].facade;d._setResponseHeaders(c.responseHeaders);if(0==c.status||c.status)d.status=parseInt(c.status,10);c.statusText&&(d.statusText=c.statusText);if(c.responseText&&(d.responseText=c.responseText,g=d.getResponseHeader("Content-Type")))if(f=g.split(";")[0],0==f.indexOf("application/xml")||0==f.indexOf("text/xml"))d.responseXML=l.createDocument(c.responseText,g);d.readyState=4;this.destroyState(b)},frameLoaded:function(b){var a=this._state[b].facade,c=[],d;for(d in a._requestHeaders)c.push(d+
": "+a._requestHeaders[d]);d={uri:a._uri};0<c.length&&(d.requestHeaders=c.join("\r\n"));a._method&&(d.method=a._method);a._bodyData&&(d.data=a._bodyData);this.sendRequest(b,e.objectToQuery(d))},destroyState:function(b){var a=this._state[b];a&&(delete this._state[b],a.clientFrame.parentNode.removeChild(a.clientFrame),a.clientFrame=null)},createFacade:function(){return arguments&&arguments[0]&&arguments[0].iframeProxyUrl?new dojox.io.proxy.xip.XhrIframeFacade(arguments[0].iframeProxyUrl):dojox.io.proxy.xip._xhrObjOld.apply(e,
arguments)},sendRequest:function(b,a){var c=this._state[b];c.isSending||(c.isSending=!0,c.requestData=a||"",c.serverWindow=frames[c.stateId],c.serverWindow||(c.serverWindow=document.getElementById(c.stateId).contentWindow),"undefined"==typeof document.postMessage&&c.serverWindow.contentWindow&&(c.serverWindow=c.serverWindow.contentWindow),this.sendRequestStart(b))},sendRequestStart:function(b){var a=this._state[b];a.requestParts=[];for(var c=a.requestData,d=a.serverUrl.length,g=this.urlLimit-d,f=
0;c.length-f+d>this.urlLimit;){var e=c.substring(f,f+g),h=e.lastIndexOf("%");if(h==e.length-1||h==e.length-2)e=e.substring(0,h);a.requestParts.push(e);f+=e.length}a.requestParts.push(c.substring(f,c.length));a.partIndex=0;this.sendRequestPart(b)},sendRequestPart:function(b){var a=this._state[b];if(a.partIndex<a.requestParts.length){var c=a.requestParts[a.partIndex],d="part";a.partIndex+1==a.requestParts.length?d="end":0==a.partIndex&&(d="start");this.setServerUrl(b,d,c);a.partIndex++}},setServerUrl:function(b,
a,c){a=this.makeServerUrl(b,a,c);b=this._state[b];this._isWebKit?b.serverWindow.location=a:b.serverWindow.location.replace(a)},makeServerUrl:function(b,a,c){b=this._state[b];a=b.serverUrl+"#"+b.idCounter++ +":"+a;c&&(a+=":"+c);return a},fragmentReceivedEvent:function(b){b.uri.split("#")[0]==this.fullXipClientUrl&&this.fragmentReceived(b.data)},fragmentReceived:function(b){var a=b.indexOf("#"),c=b.substring(0,a);b=b.substring(a+1,b.length);b=this.unpackMessage(b);a=this._state[c];switch(b.command){case "loaded":this.frameLoaded(c);
break;case "ok":this.sendRequestPart(c);break;case "start":a.responseMessage=""+b.message;this.setServerUrl(c,"ok");break;case "part":a.responseMessage+=b.message;this.setServerUrl(c,"ok");break;case "end":this.setServerUrl(c,"ok"),a.responseMessage+=b.message,this.receive(c,a.responseMessage)}},unpackMessage:function(b){b=b.split(":");var a=b[1];b=b[2]||"";var c=null;if("init"==a)for(var d=b.split("\x26"),c={},e=0;e<d.length;e++){var f=d[e].split("\x3d");c[decodeURIComponent(f[0])]=decodeURIComponent(f[1])}return{command:a,
message:b,config:c}}};dojox.io.proxy.xip._xhrObjOld=e._xhrObj;e._xhrObj=dojox.io.proxy.xip.createFacade;dojox.io.proxy.xip.XhrIframeFacade=function(b){this._requestHeaders={};this._allResponseHeaders=null;this._responseHeaders={};this.statusText=this.status=this.responseXML=this.responseText=this._bodyData=this._uri=this._method=null;this.readyState=0;this._ifpServerUrl=b;this._stateId=null};e.extend(dojox.io.proxy.xip.XhrIframeFacade,{open:function(b,a){this._method=b;this._uri=a;this.readyState=
1},setRequestHeader:function(b,a){this._requestHeaders[b]=a},send:function(b){this._bodyData=b;this._stateId=dojox.io.proxy.xip.send(this);this.readyState=2},abort:function(){dojox.io.proxy.xip.destroyState(this._stateId)},getAllResponseHeaders:function(){return this._allResponseHeaders},getResponseHeader:function(b){return this._responseHeaders[b]},_setResponseHeaders:function(b){if(b){this._allResponseHeaders=b;b=b.replace(/\r/g,"");b=b.split("\n");for(var a=0;a<b.length;a++)if(b[a]){var c=b[a].split(": ");
this._responseHeaders[c[0]]=c[1]}}}});return dojox.io.proxy.xip});
/// xip.js.map