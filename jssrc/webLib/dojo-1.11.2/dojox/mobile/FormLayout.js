//>>built
define("dojox/mobile/FormLayout",["dojo/_base/declare","dojo/dom-class","./Container","dojo/has","require"],function(b,a,c,d,e){return b("dojox.mobile.FormLayout",c,{columns:"auto",rightAlign:!1,baseClass:"mblFormLayout",buildRendering:function(){this.inherited(arguments);"auto"==this.columns?a.add(this.domNode,"mblFormLayoutAuto"):"single"==this.columns?a.add(this.domNode,"mblFormLayoutSingleCol"):"two"==this.columns&&a.add(this.domNode,"mblFormLayoutTwoCol");this.rightAlign&&a.add(this.domNode,
"mblFormLayoutRightAlign")}})});
/// FormLayout.js.map