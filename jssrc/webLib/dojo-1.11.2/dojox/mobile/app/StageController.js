//>>built
define("dojox/mobile/app/StageController",["dijit","dojo","dojox","dojo/require!dojox/mobile/app/SceneController"],function(h,d,f){d.provide("dojox.mobile.app.StageController");d.experimental("dojox.mobile.app.StageController");d.require("dojox.mobile.app.SceneController");d.declare("dojox.mobile.app.StageController",null,{scenes:null,effect:"fade",constructor:function(b){this.domNode=b;this.scenes=[];d.config.mobileAnim&&(this.effect=d.config.mobileAnim)},getActiveSceneController:function(){return this.scenes[this.scenes.length-
1]},pushScene:function(b,a){if(!this._opInProgress){this._opInProgress=!0;var g=d.create("div",{"class":"scene-wrapper",style:{visibility:"hidden"}},this.domNode),e=new f.mobile.app.SceneController({},g);0<this.scenes.length&&this.scenes[this.scenes.length-1].assistant.deactivate();this.scenes.push(e);var c=this;d.forEach(this.scenes,this.setZIndex);e.stageController=this;e.init(b,a).addCallback(function(){1==c.scenes.length?(e.domNode.style.visibility="visible",c.scenes[c.scenes.length-1].assistant.activate(a),
c._opInProgress=!1):c.scenes[c.scenes.length-2].performTransition(c.scenes[c.scenes.length-1].domNode,1,c.effect,null,function(){c.scenes[c.scenes.length-1].assistant.activate(a);c._opInProgress=!1})})}},setZIndex:function(b,a){d.style(b.domNode,"zIndex",a+1)},popScene:function(b){if(!this._opInProgress){var a=this;1<this.scenes.length?(this._opInProgress=!0,this.scenes[a.scenes.length-2].assistant.activate(b),this.scenes[a.scenes.length-1].performTransition(a.scenes[this.scenes.length-2].domNode,
-1,this.effect,null,function(){a._destroyScene(a.scenes[a.scenes.length-1]);a.scenes.splice(a.scenes.length-1,1);a._opInProgress=!1})):console.log("cannot pop the scene if there is just one")}},popScenesTo:function(b,a){if(!this._opInProgress){for(;2<this.scenes.length&&this.scenes[this.scenes.length-2].sceneName!=b;)this._destroyScene(this.scenes[this.scenes.length-2]),this.scenes.splice(this.scenes.length-2,1);this.popScene(a)}},_destroyScene:function(b){b.assistant.deactivate();b.assistant.destroy();
b.destroyRecursive()}})});
/// StageController.js.map