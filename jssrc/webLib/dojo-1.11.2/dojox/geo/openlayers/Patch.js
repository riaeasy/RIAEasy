//>>built
define("dojox/geo/openlayers/Patch",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/sniff","dojox/gfx","dojox/gfx/shape"],function(b,e,f,c,g){b=e.getObject("geo.openlayers",!0,dojox);b.Patch={patchMethod:function(a,d,c,b){var e=a.prototype[d];a.prototype[d]=function(){c&&c.call(this,d,arguments);var a=e.apply(this,arguments);b&&(a=b.call(this,d,a,arguments)||a);return a}},patchGFX:function(){var a=function(){this.rawNode.path||(this.rawNode.path={})},b=function(){this.rawNode.fill&&!this.rawNode.fill.colors&&
(this.rawNode.fill.colors={})};8>=f.isIE&&"vml"===c.renderer&&(this.patchMethod(c.Line,"setShape",a,null),this.patchMethod(c.Polyline,"setShape",a,null),this.patchMethod(c.Path,"setShape",a,null),this.patchMethod(g.Shape,"setFill",b,null))}};return b.Patch});
/// Patch.js.map