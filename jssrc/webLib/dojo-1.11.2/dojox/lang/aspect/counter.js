//>>built
define("dojox/lang/aspect/counter",["dijit","dojo","dojox"],function(e,a,c){a.provide("dojox.lang.aspect.counter");(function(){var d=c.lang.aspect,b=function(){this.reset()};a.extend(b,{before:function(){++this.calls},afterThrowing:function(){++this.errors},reset:function(){this.calls=this.errors=0}});d.counter=function(){return new b}})()});
/// counter.js.map