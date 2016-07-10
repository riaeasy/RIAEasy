//>>built
define("dojox/widget/Toaster","dojo/_base/declare dojo/_base/lang dojo/on dojo/aspect dojo/topic dojo/_base/fx dojo/dom-style dojo/dom-class dojo/dom-geometry dijit/registry dijit/_WidgetBase dijit/_TemplatedMixin dijit/BackgroundIframe dojo/fx dojo/has dojo/window".split(" "),function(n,e,y,p,q,r,h,k,l,s,t,u,v,w,x,m){e.getObject("dojox.widget",!0);return n("dojox.widget.Toaster",[t,u],{templateString:'\x3cdiv class\x3d"dijitToasterClip" data-dojo-attach-point\x3d"clipNode"\x3e\x3cdiv class\x3d"dijitToasterContainer" data-dojo-attach-point\x3d"containerNode" data-dojo-attach-event\x3d"onclick:onSelect"\x3e\x3cdiv class\x3d"dijitToasterContent" data-dojo-attach-point\x3d"contentNode"\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e',
messageTopic:"",messageTypes:{MESSAGE:"message",WARNING:"warning",ERROR:"error",FATAL:"fatal"},defaultType:"message",positionDirection:"br-up",positionDirectionTypes:"br-up br-left bl-up bl-right tr-down tr-left tl-down tl-right".split(" "),duration:2E3,slideDuration:500,separator:"\x3chr\x3e",postCreate:function(){this.inherited(arguments);this.hide();this.ownerDocument.body.appendChild(this.domNode);this.messageTopic&&this.own(q.subscribe(this.messageTopic,e.hitch(this,"_handleMessage")))},_handleMessage:function(a){e.isString(a)?
this.setContent(a):this.setContent(a.message,a.type,a.duration)},setContent:function(a,d,b){b=void 0===b?this.duration:b;if(this.slideAnim&&("playing"!=this.slideAnim.status()&&this.slideAnim.stop(),"playing"==this.slideAnim.status()||this.fadeAnim&&"playing"==this.fadeAnim.status())){setTimeout(e.hitch(this,function(){this.setContent(a,d,b)}),50);return}for(var c in this.messageTypes)k.remove(this.containerNode,"dijitToaster"+(this.messageTypes[c].substring(0,1).toUpperCase()+this.messageTypes[c].substring(1)));
h.set(this.containerNode,"opacity",1);this._setContent(a);k.add(this.containerNode,"dijitToaster"+((d||this.defaultType).substring(0,1).toUpperCase()+(d||this.defaultType).substring(1)));this.show();c=l.getMarginBox(this.containerNode);this._cancelHideTimer();if(this.isVisible)this._placeClip(),this._stickyMessage||this._setHideTimer(b);else{var f=this.containerNode.style,g=this.positionDirection;if(0<=g.indexOf("-up"))f.left="0px",f.top=c.h+10+"px";else if(0<=g.indexOf("-left"))f.left=c.w+10+"px",
f.top="0px";else if(0<=g.indexOf("-right"))f.left=0-c.w-10+"px",f.top="0px";else if(0<=g.indexOf("-down"))f.left="0px",f.top=0-c.h-10+"px";else throw Error(this.id+".positionDirection is invalid: "+g);this.slideAnim=w.slideTo({node:this.containerNode,top:0,left:0,duration:this.slideDuration,onEnd:e.hitch(this,function(){this.fadeAnim=r.fadeOut({node:this.containerNode,duration:1E3,onEnd:e.hitch(this,function(){this.isVisible=!1;this.hide()})});this.own(this.fadeAnim);this._setHideTimer(b);this.on("select",
e.hitch(this,function(){this._cancelHideTimer();this._stickyMessage=!1;this.fadeAnim.play()}));this.isVisible=!0})});this.own(this.slideAnim);this.slideAnim.play()}},_setContent:function(a){e.isFunction(a)?a(this):(a&&this.isVisible&&(a=this.contentNode.innerHTML+this.separator+a),this.contentNode.innerHTML=a)},_cancelHideTimer:function(){this._hideTimer&&(clearTimeout(this._hideTimer),this._hideTimer=null)},_setHideTimer:function(a){this._cancelHideTimer();0<a?(this._cancelHideTimer(),this._hideTimer=
setTimeout(e.hitch(this,function(a){this.bgIframe&&this.bgIframe.iframe&&(this.bgIframe.iframe.style.display="none");this._hideTimer=null;this._stickyMessage=!1;this.fadeAnim.play()}),a)):this._stickyMessage=!0},_placeClip:function(){var a=m.getBox(this.ownerDocument),d=l.getMarginBox(this.containerNode),b=this.clipNode.style;b.height=d.h+"px";b.width=d.w+"px";var c=this.positionDirection;c.match(/^t/)?b.top=a.t+"px":c.match(/^b/)&&(b.top=a.h-d.h-2+a.t+"px");c.match(/^[tb]r-/)?b.left=a.w-d.w-1-a.l+
"px":c.match(/^[tb]l-/)?b.left="0px":c.match(/^[tb]c-/)&&(b.left=Math.round((a.w-d.w-1-a.l)/2)+"px");b.clip="rect(0px, "+d.w+"px, "+d.h+"px, 0px)";if(x("ie")&&(this.bgIframe||(this.clipNode.id||(this.clipNode.id=s.getUniqueId("dojox_widget_Toaster_clipNode")),this.bgIframe=new v(this.clipNode)),a=this.bgIframe.iframe))a.style.display="block"},onSelect:function(a){},show:function(){h.set(this.domNode,"display","block");this._placeClip();this._scrollConnected||(this._scrollConnected=p.after(m,"scroll",
e.hitch(this,"_placeClip")),this.own(this._scrollConnected))},hide:function(){h.set(this.domNode,"display","none");this._scrollConnected&&(this._scrollConnected.remove(),this._scrollConnected=!1);h.set(this.containerNode,"opacity",1)}})});
/// Toaster.js.map