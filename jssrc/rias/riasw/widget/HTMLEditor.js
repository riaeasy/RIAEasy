//RIAStudio client runtime widget - HTMLEditor

define([
	"rias",
	"rias/riasw/widget/Editor"
], function(rias, Editor) {

	var riasType = "rias.riasw.widget.HTMLEditor";
	var Widget = rias.declare(riasType, Editor, {
		postCreate: function(){
			this.inherited(arguments);
			this.contentDomPreFilters.push(rias.hitch(this, this._preDomFilter));
			this.contentDomPostFilters.push(rias.hitch(this, this._postDomFilter));
		},
		startup: function(){
			///避免二次 startup()，以致显示不正确。
			if(this._started){
				return;
			}
			this.inherited(arguments);

			this.own(
				rias.after(dojox.editor.plugins.Save.prototype, "save", function(content){
					var w = this.editor;///this 是 plugin，用 this.editor 取 widget
					rias.publish("__riasdWidgetModified", {widget: w, value: content});
				}, true),
				rias.before(this, "close", function(save){
					var w = this;///this 是 editor
					if(save == 1){
						rias.publish("__riasdWidgetModified", {widget: w, value: w.getValue(true)});
					}
				}, true)
			);
		},
		_preDomFilter: function(node){
			var id, _n;
			node = (node ? node.firstChild : undefined);
			while(node){
				_n = node;
				node = node.nextSibling;
				if(_n.nodeType == 1 && (id = _n.getAttribute("widgetId"))){
					if(rias.registry.byId(id)){///FIXME:zensst.目前不能保证是 riasw，故用 rias.registry.byId， 以后改为 rias.by。
						_n.parentNode.removeChild(_n);
					}
				}
			}
			//rias.dom.query("a[name]:not([href])", this.editNode).addClass("dijitEditorPluginInsertAnchorStyle");
		},
		_postDomFilter: function(node){
			//console.debug(node);
			//if(node){	// avoid error when Editor.get("value") called before editor's iframe initialized
			//	rias.dom.query("a[name]:not([href])", node).removeClass("dijitEditorPluginInsertAnchorStyle");
			//}
			return node;
		}
	});
	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswHTMLEditorIcon",
		iconClass16: "riaswHTMLEditorIcon16",
		defaultParams: function(params){
			var ep = Editor._riasdMeta.defaultParams({
				plugins: "all"
			});
			delete params.plugins;
			params = rias.mixinDeep({}, {
				//value: "RichText",
				plugins: ep.plugins,
				extraPlugins: ep.extraPlugins
			}, params);
			return params;
		},
		initialSize: {},
		resizable: "none",
		//allowedChild: "",
		"property": {
			"minHeight": {
				"datatype": "string",
				"defaultValue": "1em",
				"title": "minHeight"
			},
			"updateInterval": {
				"datatype": "number",
				"defaultValue": 200,
				"title": "Timeout Change"
			},
			"value": {
				"datatype": "string",
				"description": "The value of the editor.",
				"hidden": false
			},
			"tabIndex": {
				"datatype": "string",
				"description": "Widget tab index.",
				"hidden": false
			}
		}
	};

	return Widget;
});