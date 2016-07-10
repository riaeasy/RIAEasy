//>>built
define("dojo/touch","./_base/kernel ./aspect ./dom ./dom-class ./_base/lang ./on ./has ./mouse ./domReady ./_base/window".split(" "),function(F,w,x,q,G,g,m,n,y,e){function l(c,b,a){return u&&a?function(c,b){return g(c,a,b)}:H?function(a,e){var d=g(a,b,function(d){e.call(this,d);p=(new Date).getTime()}),I=g(a,c,function(d){(!p||(new Date).getTime()>p+1E3)&&e.call(this,d)});return{remove:function(){d.remove();I.remove()}}}:function(b,a){return g(b,c,a)}}function J(c){do if(void 0!==c.dojoClick)return c;
while(c=c.parentNode)}function z(c,b,a){if(!n.isRight(c)){var f=J(c.target);if(h=!c.target.disabled&&f&&f.dojoClick)if(s=(r="useTarget"==h)?f:c.target,r&&c.preventDefault(),A=c.changedTouches?c.changedTouches[0].pageX-e.global.pageXOffset:c.clientX,B=c.changedTouches?c.changedTouches[0].pageY-e.global.pageYOffset:c.clientY,C=("object"==typeof h?h.x:"number"==typeof h?h:0)||4,D=("object"==typeof h?h.y:"number"==typeof h?h:0)||4,!E){E=!0;var k=function(d){h=r?x.isDescendant(e.doc.elementFromPoint(d.changedTouches?
d.changedTouches[0].pageX-e.global.pageXOffset:d.clientX,d.changedTouches?d.changedTouches[0].pageY-e.global.pageYOffset:d.clientY),s):h&&(d.changedTouches?d.changedTouches[0].target:d.target)==s&&Math.abs((d.changedTouches?d.changedTouches[0].pageX-e.global.pageXOffset:d.clientX)-A)<=C&&Math.abs((d.changedTouches?d.changedTouches[0].pageY-e.global.pageYOffset:d.clientY)-B)<=D};e.doc.addEventListener(b,function(d){n.isRight(d)||(k(d),r&&d.preventDefault())},!0);e.doc.addEventListener(a,function(d){if(!n.isRight(d)&&
(k(d),h)){v=(new Date).getTime();var b=r?s:d.target;"LABEL"===b.tagName&&(b=x.byId(b.getAttribute("for"))||b);var c=d.changedTouches?d.changedTouches[0]:d,a=function(b){var a=document.createEvent("MouseEvents");a._dojo_click=!0;a.initMouseEvent(b,!0,!0,d.view,d.detail,c.screenX,c.screenY,c.clientX,c.clientY,d.ctrlKey,d.altKey,d.shiftKey,d.metaKey,0,null);return a},e=a("mousedown"),f=a("mouseup"),l=a("click");setTimeout(function(){g.emit(b,"mousedown",e);g.emit(b,"mouseup",f);g.emit(b,"click",l);v=
(new Date).getTime()},0)}},!0);c=function(b){e.doc.addEventListener(b,function(c){var a=c.target;h&&(!c._dojo_click&&(new Date).getTime()<=v+1E3&&!("INPUT"==a.tagName&&q.contains(a,"dijitOffScreen")))&&(c.stopPropagation(),c.stopImmediatePropagation&&c.stopImmediatePropagation(),"click"==b&&(("INPUT"!=a.tagName||"radio"==a.type&&(q.contains(a,"dijitCheckBoxInput")||q.contains(a,"mblRadioButton"))||"checkbox"==a.type&&(q.contains(a,"dijitCheckBoxInput")||q.contains(a,"mblCheckBox")))&&"TEXTAREA"!=
a.tagName&&"AUDIO"!=a.tagName&&"VIDEO"!=a.tagName)&&c.preventDefault())},!0)};c("click");c("mousedown");c("mouseup")}}}var t=5>m("ios"),u=m("pointer-events")||m("MSPointer"),f=function(){var c={},b;for(b in{down:1,move:1,up:1,cancel:1,over:1,out:1})c[b]=m("MSPointer")?"MSPointer"+b.charAt(0).toUpperCase()+b.slice(1):"pointer"+b;return c}(),H=m("touch-events"),E,h,r=!1,s,A,B,C,D,v,p,k;u?y(function(){e.doc.addEventListener(f.down,function(c){z(c,f.move,f.up)},!0)}):y(function(){function c(b){var a=
G.delegate(b,{bubbles:!0});6<=m("ios")&&(a.touches=b.touches,a.altKey=b.altKey,a.changedTouches=b.changedTouches,a.ctrlKey=b.ctrlKey,a.metaKey=b.metaKey,a.shiftKey=b.shiftKey,a.targetTouches=b.targetTouches);return a}k=e.body();e.doc.addEventListener("touchstart",function(b){p=(new Date).getTime();var a=k;k=b.target;g.emit(a,"dojotouchout",{relatedTarget:k,bubbles:!0});g.emit(k,"dojotouchover",{relatedTarget:a,bubbles:!0});z(b,"touchmove","touchend")},!0);g(e.doc,"touchmove",function(b){p=(new Date).getTime();
var a=e.doc.elementFromPoint(b.pageX-(t?0:e.global.pageXOffset),b.pageY-(t?0:e.global.pageYOffset));a&&(k!==a&&(g.emit(k,"dojotouchout",{relatedTarget:a,bubbles:!0}),g.emit(a,"dojotouchover",{relatedTarget:k,bubbles:!0}),k=a),g.emit(a,"dojotouchmove",c(b))||b.preventDefault())});g(e.doc,"touchend",function(b){p=(new Date).getTime();var a=e.doc.elementFromPoint(b.pageX-(t?0:e.global.pageXOffset),b.pageY-(t?0:e.global.pageYOffset))||e.body();g.emit(a,"dojotouchend",c(b))})});w={press:l("mousedown",
"touchstart",f.down),move:l("mousemove","dojotouchmove",f.move),release:l("mouseup","dojotouchend",f.up),cancel:l(n.leave,"touchcancel",u?f.cancel:null),over:l("mouseover","dojotouchover",f.over),out:l("mouseout","dojotouchout",f.out),enter:n._eventHandler(l("mouseover","dojotouchover",f.over)),leave:n._eventHandler(l("mouseout","dojotouchout",f.out))};return F.touch=w});
/// touch.js.map