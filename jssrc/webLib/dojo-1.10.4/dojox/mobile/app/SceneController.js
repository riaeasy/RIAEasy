//>>built

define("dojox/mobile/app/SceneController", ["dijit", "dojo", "dojox", "dojo/require!dojox/mobile/_base"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.mobile.app.SceneController");
    dojo.experimental("dojox.mobile.app.SceneController");
    dojo.require("dojox.mobile._base");
    (function () {
        var app = dojox.mobile.app;
        var templates = {};
        dojo.declare("dojox.mobile.app.SceneController", dojox.mobile.View, {stageController:null, keepScrollPos:false, init:function (sceneName, params) {
            this.sceneName = sceneName;
            this.params = params;
            var templateUrl = app.resolveTemplate(sceneName);
            this._deferredInit = new dojo.Deferred();
            if (templates[sceneName]) {
                this._setContents(templates[sceneName]);
            } else {
                dojo.xhrGet({url:templateUrl, handleAs:"text"}).addCallback(dojo.hitch(this, this._setContents));
            }
            return this._deferredInit;
        }, _setContents:function (templateHtml) {
            templates[this.sceneName] = templateHtml;
            this.domNode.innerHTML = "<div>" + templateHtml + "</div>";
            var sceneAssistantName = "";
            var nameParts = this.sceneName.split("-");
            for (var i = 0; i < nameParts.length; i++) {
                sceneAssistantName += nameParts[i].substring(0, 1).toUpperCase() + nameParts[i].substring(1);
            }
            sceneAssistantName += "Assistant";
            this.sceneAssistantName = sceneAssistantName;
            var _this = this;
            dojox.mobile.app.loadResourcesForScene(this.sceneName, function () {
                console.log("All resources for ", _this.sceneName, " loaded");
                var assistant;
                if (typeof (dojo.global[sceneAssistantName]) != "undefined") {
                    _this._initAssistant();
                } else {
                    var assistantUrl = app.resolveAssistant(_this.sceneName);
                    dojo.xhrGet({url:assistantUrl, handleAs:"text"}).addCallback(function (text) {
                        try {
                            dojo.eval(text);
                        }
                        catch (e) {
                            console.log("Error initializing code for scene " + _this.sceneName + ". Please check for syntax errors");
                            throw e;
                        }
                        _this._initAssistant();
                    });
                }
            });
        }, _initAssistant:function () {
            console.log("Instantiating the scene assistant " + this.sceneAssistantName);
            var cls = dojo.getObject(this.sceneAssistantName);
            if (!cls) {
                throw Error("Unable to resolve scene assistant " + this.sceneAssistantName);
            }
            this.assistant = new cls(this.params);
            this.assistant.controller = this;
            this.assistant.domNode = this.domNode.firstChild;
            this.assistant.setup();
            this._deferredInit.callback();
        }, query:function (selector, node) {
            return dojo.query(selector, node || this.domNode);
        }, parse:function (node) {
            var widgets = this._widgets = dojox.mobile.parser.parse(node || this.domNode, {controller:this});
            for (var i = 0; i < widgets.length; i++) {
                widgets[i].set("controller", this);
            }
        }, getWindowSize:function () {
            return {w:dojo.global.innerWidth, h:dojo.global.innerHeight};
        }, showAlertDialog:function (props) {
            var size = dojo.marginBox(this.assistant.domNode);
            var dialog = new dojox.mobile.app.AlertDialog(dojo.mixin(props, {controller:this}));
            this.assistant.domNode.appendChild(dialog.domNode);
            console.log("Appended ", dialog.domNode, " to ", this.assistant.domNode);
            dialog.show();
        }, popupSubMenu:function (info) {
            var widget = new dojox.mobile.app.ListSelector({controller:this, destroyOnHide:true, onChoose:info.onChoose});
            this.assistant.domNode.appendChild(widget.domNode);
            widget.set("data", info.choices);
            widget.show(info.fromNode);
        }});
    })();
});

