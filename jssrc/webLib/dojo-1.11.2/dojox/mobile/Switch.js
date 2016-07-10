//>>built
define("dojox/mobile/Switch","dojo/_base/array dojo/_base/connect dojo/_base/declare dojo/_base/event dojo/_base/window dojo/dom-class dojo/dom-construct dojo/dom-style dojo/dom-attr dojo/touch dijit/_Contained dijit/_WidgetBase ./sniff ./_maskUtils ./common require".split(" "),function(p,q,r,s,m,g,h,b,k,l,t,u,f,v,n,w){return r("dojox.mobile.Switch",[u,t],{value:"on",name:"",leftLabel:"ON",rightLabel:"OFF",shape:"mblSwDefaultShape",tabIndex:"0",_setTabIndexAttr:"",baseClass:"mblSwitch",role:"",buildRendering:function(){this.templateString||
(this.domNode=this.srcNodeRef&&"SPAN"===this.srcNodeRef.tagName?this.srcNodeRef:h.create("span"));n._setTouchAction(this.domNode,"none");this.inherited(arguments);if(!this.templateString){var a=this.srcNodeRef&&this.srcNodeRef.className||this.className||this["class"];if(a=a.match(/mblSw.*Shape\d*/))this.shape=a;g.add(this.domNode,this.shape);this.domNode.innerHTML='\x3cdiv class\x3d"mblSwitchInner"\x3e\x3cdiv class\x3d"mblSwitchBg mblSwitchBgLeft"\x3e\x3cdiv class\x3d"mblSwitchText mblSwitchTextLeft"\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"mblSwitchBg mblSwitchBgRight"\x3e\x3cdiv class\x3d"mblSwitchText mblSwitchTextRight"\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"mblSwitchKnob"\x3e\x3c/div\x3e\x3cinput type\x3d"hidden"'+
(this.name?' name\x3d"'+this.name+'"':"")+' value\x3d"'+this.value+'"\x3e\x3c/div\x3e\x3c/div\x3e';a=this.inner=this.domNode.firstChild;this.left=a.childNodes[0];this.right=a.childNodes[1];this.knob=a.childNodes[2];this.input=a.childNodes[3]}k.set(this.domNode,"role","checkbox");k.set(this.domNode,"aria-checked","on"===this.value?"true":"false");this.switchNode=this.domNode;f("windows-theme")&&(a=h.create("div",{className:"mblSwitchContainer"}),this.labelNode=h.create("label",{"class":"mblSwitchLabel",
"for":this.id},a),a.appendChild(this.domNode.cloneNode(!0)),this.domNode=a,this.focusNode=a.childNodes[1],this.labelNode.innerHTML="off"==this.value?this.rightLabel:this.leftLabel,this.switchNode=this.domNode.childNodes[1],a=this.inner=this.domNode.childNodes[1].firstChild,this.left=a.childNodes[0],this.right=a.childNodes[1],this.knob=a.childNodes[2],this.input=a.childNodes[3])},postCreate:function(){this.connect(this.switchNode,"onclick","_onClick");this.connect(this.switchNode,"onkeydown","_onClick");
this._startHandle=this.connect(this.switchNode,l.press,"onTouchStart");this._initialValue=this.value},startup:function(){var a=this._started;this.inherited(arguments);a||this.resize()},resize:function(){if(f("windows-theme"))b.set(this.domNode,"width","100%");else{var a=b.get(this.domNode,"width"),e=a+"px",a=a-b.get(this.knob,"width")+"px";b.set(this.left,"width",e);b.set(this.right,this.isLeftToRight()?{width:e,left:a}:{width:e});b.set(this.left.firstChild,"width",a);b.set(this.right.firstChild,
"width",a);b.set(this.knob,"left",a);"off"==this.value&&b.set(this.inner,"left",this.isLeftToRight()?"-"+a:0);this._hasMaskImage=!1;this._createMaskImage()}},_changeState:function(a,e){var c="on"===a;this.left.style.display="";this.right.style.display="";this.inner.style.left="";e&&g.add(this.switchNode,"mblSwitchAnimation");g.remove(this.switchNode,c?"mblSwitchOff":"mblSwitchOn");g.add(this.switchNode,c?"mblSwitchOn":"mblSwitchOff");k.set(this.switchNode,"aria-checked",c?"true":"false");!c&&!f("windows-theme")&&
(this.inner.style.left=(this.isLeftToRight()?-(b.get(this.domNode,"width")-b.get(this.knob,"width")):0)+"px");var d=this;d.defer(function(){d.left.style.display=c?"":"none";d.right.style.display=!c?"":"none";g.remove(d.switchNode,"mblSwitchAnimation")},e?300:0)},_createMaskImage:function(){this._timer&&(this._timer.remove(),delete this._timer);if(!this._hasMaskImage){var a=b.get(this.domNode,"width"),e=b.get(this.domNode,"height");this._width=a-b.get(this.knob,"width");this._hasMaskImage=!0;if(f("mask-image")){var c=
b.get(this.left,"borderTopLeftRadius");if("0px"!=c){var d=c.split(" "),c=parseFloat(d[0]),d=1==d.length?c:parseFloat(d[1]);(this.shape+"Mask"+a+e+c+d).replace(/\./,"_");v.createRoundMask(this.switchNode,0,0,0,0,a,e,c,d,1)}}}},_onClick:function(a){if((!a||!("keydown"===a.type&&13!==a.keyCode))&&!1!==this.onClick(a)&&!this._moved)this._set("value",this.input.value="on"==this.value?"off":"on"),this._changeState(this.value,!0),this.onStateChanged(this.value)},onClick:function(){},onTouchStart:function(a){this._moved=
!1;this.innerStartX=this.inner.offsetLeft;this._conn||(this._conn=[this.connect(this.inner,l.move,"onTouchMove"),this.connect(m.doc,l.release,"onTouchEnd")],f("windows-theme")&&this._conn.push(this.connect(m.doc,"MSPointerCancel","onTouchEnd")));this.touchStartX=a.touches?a.touches[0].pageX:a.clientX;this.left.style.display="";this.right.style.display="";s.stop(a);this._createMaskImage()},onTouchMove:function(a){a.preventDefault();if(a.targetTouches){if(1!=a.targetTouches.length)return;a=a.targetTouches[0].clientX-
this.touchStartX}else a=a.clientX-this.touchStartX;var b=this.innerStartX+a;b<=-(this._width-10)&&(b=-this._width);-10<=b&&(b=0);this.inner.style.left=b+"px";10<Math.abs(a)&&(this._moved=!0)},onTouchEnd:function(a){p.forEach(this._conn,q.disconnect);this._conn=null;this.innerStartX==this.inner.offsetLeft?f("clicks-prevented")&&n._sendClick(this.inner,a):(a=this.inner.offsetLeft<-(this._width/2)?"off":"on",a=this._newState(a),this._changeState(a,!0),a!=this.value&&(this._set("value",this.input.value=
a),this.onStateChanged(a)))},_newState:function(a){return a},onStateChanged:function(a){this.labelNode&&(this.labelNode.innerHTML="off"==a?this.rightLabel:this.leftLabel)},_setValueAttr:function(a){this._changeState(a,!1);this.value!=a&&(this._set("value",this.input.value=a),this.onStateChanged(a))},_setLeftLabelAttr:function(a){this.leftLabel=a;this.left.firstChild.innerHTML=this._cv?this._cv(a):a},_setRightLabelAttr:function(a){this.rightLabel=a;this.right.firstChild.innerHTML=this._cv?this._cv(a):
a},reset:function(){this.set("value",this._initialValue)}})});
/// Switch.js.map