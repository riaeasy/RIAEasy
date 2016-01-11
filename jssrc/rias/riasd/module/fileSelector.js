define(["rias/riasd/riasd"],function(c){var f={_riaswVersion:"0.7",caption:"\u8d44\u6e90\u7ba1\u7406\u5668",rootId:"appModule",onlyDir:!1,actions:{},beforeFiler:function(a){a=c.queryRiasd(a,"_riaswIdOfModule","tree");0<a.length&&this.rootId&&(a[0].model.rootId=this.rootId,a[0].model.rootLabel="appModule"===this.rootId?"\u9875\u9762\u6a21\u5757":"serverAct"===this.rootId?"\u670d\u52a1\u5668Act":"\u672a\u77e5\u7c7b\u578b",a[0].model.query={onlyDir:this.onlyDir},a[0].model.store.target=c.toUrl(this.actions.get))},afterFiler:function(a){this.btnNewDir.set("visible",!!this.actions.newDir);this.btnNewFile.set("visible",!!this.actions.newFile);this.btnDele.set("visible",!!this.actions.dele)},_setBtnState:function(a){this.isLoaded&&!this._beingDestroyed&&(a=a||this.tree.selectedItem,this.btnOk.set("disabled",!a||"file"!==a.itemType),this.btnNewDir.set("disabled",!a||"file"===a.itemType),this.btnNewFile.set("disabled",!a||"dir"!==a.itemType),this.btnDele.set("disabled",!a||!!a.root))},onShow:function(){this._setBtnState()},_actOk:function(){var a=this.tree.selectedItem;a&&"file"===a.itemType&&!this.tree.model.mayHaveChildren(a)&&c.isFunction(this.callOpen)&&this.callOpen(a)},callOpen:function(a){},_newDir:function(){var a=this,b=a.tree.selectedItem,e,d;!b||"dir"!==b.itemType&&b!=a.tree.model.root?c.info({dialogType:"tip",parent:a,around:a.btnNewDir,content:"\u8bf7\u9009\u62e9\u4e00\u4e2a\u76ee\u5f55..."}):(e=b==a.tree.model.root?b.id:b.pathname,c.input({around:a.btnNewDir,autoClose:0,caption:c.i18n.action.newDir,value:"",onSubmit:function(){return c.xhrPost(c.toUrl(a.actions.newDir),{pathname:e+"/"+this.get("value"),dir:1},function(b){if(!b.success||1>b.success)return c.warn({parent:a,content:c.i18n.action.newDir+"\u5931\u8d25...",caption:a.caption}),!1;a.tree.reload().then(function(b){c.isArray(b)&&(d=a.tree.getNodesByItem(b.pop())[0],a.tree._expandNode(d))})})}}))},_newFile:function(){var a=this,b=a.tree.selectedItem,e,d;!b||"dir"!==b.itemType&&b!=a.tree.model.root?c.info({dialogType:"tip",parent:a,around:a.btnNewFile,content:"\u8bf7\u9009\u62e9\u4e00\u4e2a\u76ee\u5f55..."}):(e=b==a.tree.model.root?b.id:b.pathname,c.input({around:a.btnNewFile,autoClose:0,caption:c.i18n.action.newFile,value:"",onSubmit:function(){return c.xhrPost(c.toUrl(a.actions.newFile),{pathname:e+"/"+this.get("value"),dir:0},function(b){if(!b.success||1>b.success)return c.warn({parent:a,content:c.i18n.action.newFile+"\u5931\u8d25...",caption:a.caption}),!1;a.tree.reload().then(function(b){c.isArray(b)&&(d=a.tree.getNodesByItem(b.pop())[0],a.tree._expandNode(d))})})}}))},_dele:function(){var a=this,b=a.tree.selectedItem,e,d;b?(e=b==a.tree.model.root?b.id:b.pathname,c.choice({around:a.btnDele,autoClose:0,content:"\u662f\u5426\u5220\u9664["+e+"]?",caption:c.i18n.action.dele,onSubmit:function(f){c.xhrPost(c.toUrl(a.actions.dele),{pathname:e,dir:"dir"===b.itemType?1:0},function(b){!b.success||1>b.success?c.warn({parent:a,content:c.i18n.action.dele+"\u5931\u8d25...",caption:a.caption}):((d=a.tree.path?a.tree.path:[]).pop(),a.tree.reload().then(function(){a.tree.set("path",d).then(function(b){c.isArray(b)&&(d=a.tree.getNodesByItem(b.pop())[0],a.tree._expandNode(d))})}))});return 1}})):c.info({dialogType:"tip",parent:a,around:a.btnDele,content:"\u8bf7\u9009\u62e9\u4e00\u4e2a\u8282\u70b9..."})},_riaswChildren:[{_riaswType:"rias.riasw.layout.Panel",_riaswIdOfModule:"main",region:"center",caption:"\u8d44\u6e90\u7ba1\u7406\u5668",design:"sidebar",persist:!1,gutters:!0,style:{padding:"0px"},_riaswChildren:[{_riaswType:"rias.riasw.layout.Panel",_riaswIdOfModule:"btns",region:"top",style:{"border-bottom":"1px silver solid",padding:"2px"},_riaswChildren:[{_riaswType:"rias.riasw.form.Button",_riaswIdOfModule:"btnOk",label:{$refScript:"return module.btnOkLabel || rias.i18n.action.ok;"},tooltip:"\u63d0\u4ea4\u8f93\u5165\u4fe1\u606f...",iconClass:"okIcon",disabled:!1,onClick:function(a){this._riasrModule._actOk()}},{_riaswType:"rias.riasw.form.Button",_riaswIdOfModule:"btnNewDir",label:c.i18n.action.newDir,tooltip:c.i18n.action.newDir,iconClass:"newDirIcon",onClick:function(a){this._riasrModule._newDir()}},{_riaswType:"rias.riasw.form.Button",_riaswIdOfModule:"btnNewFile",label:c.i18n.action.newFile,tooltip:c.i18n.action.newFile,iconClass:"newFileIcon",onClick:function(a){this._riasrModule._newFile()}},{_riaswType:"rias.riasw.form.Button",_riaswIdOfModule:"btnDele",label:c.i18n.action.dele,tooltip:c.i18n.action.dele,iconClass:"deleIcon",onClick:function(a){this._riasrModule._dele()}}]},{_riaswType:"rias.riasw.widget.Tree",_riaswIdOfModule:"tree",region:"center",persist:!1,noDnd:!0,model:{_riaswType:"rias.riasw.widget.TreeModel",rootId:"appModule",rootLabel:"\u9875\u9762\u6a21\u5757",store:{_riaswType:"rias.riasw.store.JsonRestStore",idAttribute:"pathname",labelAttribute:"name"}},style:{border:"0px silver solid",padding:"0px"},onClick:function(a,b,c){this._riasrModule._setBtnState();b.tree.model.mayHaveChildren(a)&&(b.isExpanded?b.tree._collapseNode(b):b.tree._expandNode(b))},onDblClick:function(a,b,c){var d=this._riasrModule;a&&"file"===a.itemType&&!d.tree.model.mayHaveChildren(a)&&d.defer(function(){d._actOk()})}}]}]};c.setObject("rias.riasd.module.fileSelector",f);return f});