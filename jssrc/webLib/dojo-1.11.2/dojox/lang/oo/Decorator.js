//>>built
define("dojox/lang/oo/Decorator",["dijit","dojo","dojox"],function(e,b,d){b.provide("dojox.lang.oo.Decorator");(function(){var c=d.lang.oo,b=c.Decorator=function(b,a){this.value=b;this.decorator="object"==typeof a?function(){return a.exec.apply(a,arguments)}:a};c.makeDecorator=function(c){return function(a){return new b(a,c)}}})()});
/// Decorator.js.map