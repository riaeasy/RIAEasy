//>>built
require({cache:{"url:dijit/form/templates/Button.html":'\x3cspan class\x3d"dijit dijitReset dijitInline" role\x3d"presentation"\n\t\x3e\x3cspan class\x3d"dijitReset dijitInline dijitButtonNode"\n\t\tdata-dojo-attach-event\x3d"ondijitclick:__onClick" role\x3d"presentation"\n\t\t\x3e\x3cspan class\x3d"dijitReset dijitStretch dijitButtonContents"\n\t\t\tdata-dojo-attach-point\x3d"titleNode,focusNode"\n\t\t\trole\x3d"button" aria-labelledby\x3d"${id}_label"\n\t\t\t\x3e\x3cspan class\x3d"dijitReset dijitInline dijitIcon" data-dojo-attach-point\x3d"iconNode"\x3e\x3c/span\n\t\t\t\x3e\x3cspan class\x3d"dijitReset dijitToggleButtonIconChar"\x3e\x26#x25CF;\x3c/span\n\t\t\t\x3e\x3cspan class\x3d"dijitReset dijitInline dijitButtonText"\n\t\t\t\tid\x3d"${id}_label"\n\t\t\t\tdata-dojo-attach-point\x3d"containerNode"\n\t\t\t\x3e\x3c/span\n\t\t\x3e\x3c/span\n\t\x3e\x3c/span\n\t\x3e\x3cinput ${!nameAttrSetting} type\x3d"${type}" value\x3d"${value}" class\x3d"dijitOffScreen"\n\t\tdata-dojo-attach-event\x3d"onclick:_onClick"\n\t\ttabIndex\x3d"-1" aria-hidden\x3d"true" data-dojo-attach-point\x3d"valueNode"\n/\x3e\x3c/span\x3e\n'}});
define("dijit/form/Button","require dojo/_base/declare dojo/dom-class dojo/has dojo/_base/kernel dojo/_base/lang dojo/ready ./_FormWidget ./_ButtonMixin dojo/text!./templates/Button.html ../a11yclick".split(" "),function(c,d,e,f,g,b,h,k,l,m){f("dijit-legacy-requires")&&h(0,function(){c(["dijit/form/DropDownButton","dijit/form/ComboButton","dijit/form/ToggleButton"])});return d("dijit.form.Button",[k,l],{showLabel:!0,iconClass:"dijitNoIcon",_setIconClassAttr:{node:"iconNode",type:"class"},baseClass:"dijitButton",
templateString:m,_setValueAttr:"valueNode",_setNameAttr:function(a){this.valueNode&&this.valueNode.setAttribute("name",a)},postCreate:function(){this.inherited(arguments);this._setLabelFromContainer()},_setLabelFromContainer:function(){this.containerNode&&!this.label&&(this.label=b.trim(this.containerNode.innerHTML),this.onLabelSet())},_setShowLabelAttr:function(a){this.containerNode&&e.toggle(this.containerNode,"dijitDisplayNone",!a);this._set("showLabel",a)},setLabel:function(a){g.deprecated("dijit.form.Button.setLabel() is deprecated.  Use set('label', ...) instead.",
"","2.0");this.set("label",a)},onLabelSet:function(){this.inherited(arguments);!this.showLabel&&!("title"in this.params)&&(this.titleNode.title=b.trim(this.containerNode.innerText||this.containerNode.textContent||""))}})});
/// Button.js.map