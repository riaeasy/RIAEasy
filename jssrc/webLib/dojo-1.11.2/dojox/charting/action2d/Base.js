//>>built
define("dojox/charting/action2d/Base",["dojo/_base/lang","dojo/_base/declare","dojo/Evented"],function(c,b,d){return b("dojox.charting.action2d.Base",d,{constructor:function(b,a){this.chart=b;this.plot=a?c.isString(a)?this.chart.getPlot(a):a:this.chart.getPlot("default")},connect:function(){},disconnect:function(){},destroy:function(){this.disconnect()}})});
/// Base.js.map