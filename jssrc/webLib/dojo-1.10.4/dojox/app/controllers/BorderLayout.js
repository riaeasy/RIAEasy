//>>built

define("dojox/app/controllers/BorderLayout", ["dojo/_base/declare", "dojo/dom-attr", "dojo/dom-style", "./LayoutBase", "dijit/layout/BorderContainer", "dijit/layout/StackContainer", "dijit/layout/ContentPane", "dijit/registry"], function (declare, domAttr, domStyle, LayoutBase, BorderContainer, StackContainer, ContentPane, registry) {
    return declare("dojox.app.controllers.BorderLayout", LayoutBase, {initLayout:function (event) {
        this.app.log("in app/controllers/BorderLayout.initLayout event.view.name=[", event.view.name, "] event.view.parent.name=[", event.view.parent.name, "]");
        var bc;
        if (!this.borderLayoutCreated) {
            this.borderLayoutCreated = true;
            bc = new BorderContainer({id:this.app.id + "-BC", style:"height:100%;width:100%;border:1px solid black"});
            event.view.parent.domNode.appendChild(bc.domNode);
            bc.startup();
        } else {
            bc = registry.byId(this.app.id + "-BC");
        }
        this.app.log("in app/controllers/BorderLayout.initLayout event.view.constraint=", event.view.constraint);
        var constraint = event.view.constraint;
        if (event.view.parent.id == this.app.id) {
            var reg = registry.byId(event.view.parent.id + "-" + constraint);
            if (reg) {
                var cp1 = registry.byId(event.view.id + "-cp-" + constraint);
                if (!cp1) {
                    cp1 = new ContentPane({id:event.view.id + "-cp-" + constraint});
                    cp1.addChild(event.view);
                    reg.addChild(cp1);
                    bc.addChild(reg);
                } else {
                    cp1.domNode.appendChild(event.view.domNode);
                }
            } else {
                var noSplitter = this.app.borderLayoutNoSplitter || false;
                var sc1 = new StackContainer({doLayout:true, splitter:!noSplitter, region:constraint, id:event.view.parent.id + "-" + constraint});
                var cp1 = new ContentPane({id:event.view.id + "-cp-" + constraint});
                cp1.addChild(event.view);
                sc1.addChild(cp1);
                bc.addChild(sc1);
            }
        } else {
            event.view.parent.domNode.appendChild(event.view.domNode);
            domAttr.set(event.view.domNode, "data-app-constraint", event.view.constraint);
        }
        this.inherited(arguments);
    }, hideView:function (view) {
        var bc = registry.byId(this.app.id + "-BC");
        var sc = registry.byId(view.parent.id + "-" + view.constraint);
        if (bc && sc) {
            sc.removedFromBc = true;
            bc.removeChild(sc);
        }
    }, showView:function (view) {
        var sc = registry.byId(view.parent.id + "-" + view.constraint);
        var cp = registry.byId(view.id + "-cp-" + view.constraint);
        if (sc && cp) {
            if (sc.removedFromBc) {
                sc.removedFromBc = false;
                registry.byId(this.app.id + "-BC").addChild(sc);
                domStyle.set(view.domNode, "display", "");
            }
            domStyle.set(cp.domNode, "display", "");
            sc.selectChild(cp);
            sc.resize();
        }
    }});
});

