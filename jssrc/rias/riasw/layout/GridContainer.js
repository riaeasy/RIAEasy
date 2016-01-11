//RIAStudio client runtime widget - GridContainer

define([
	"rias",
	"dojox/layout/GridContainer",
	"dojox/layout/GridContainerLite"
], function(rias, _Widget, GridContainerLite) {

	_Widget.extend({
		_updateColumnsWidth: function(/*Object*/ manager){
			// summary:
			//		Update the columns width.
			// manager:
			//		dojox.mdnd.AreaManager singleton
			// tags:
			//		private

			//console.log("dojox.layout.GridContainer ::: _updateColumnsWidth");
			this.inherited(arguments);
			///基类的 _setColWidthsAttr 中调用时，缺少 manager 参数。
			//manager._dropMode.updateAreas(manager._areaList);
			manager = manager ? manager : this._dragManager;
			manager._dropMode.updateAreas(manager._areaList);
		},
		addChild: function(/*Object*/child, /*Integer?Object?*/column, /*Integer?*/p){
			// summary:
			//		Add a child in a specific column of the GridContainer widget.
			// child:
			//		widget to insert
			// column:
			//		column number
			// p:
			//		place in the zone (first = 0)
			// returns:
			//		The widget inserted

			//console.log("dojox.layout.GridContainerLite ::: addChild");
			child.domNode.id = child.id;
			GridContainerLite.superclass.addChild.call(this, child, 0);
			if(rias.isObjectExact(column)){///增加支持 column = {}
				p = column.zone;
				column = column.column;
			}
			if(column < 0 || column === undefined){
				column = 0;
			}
			if(p <= 0){
				p = 0;
			}
			try{
				return this._insertChild(child, column, p);
			}
			catch(e){
				console.error("Unable to insert child in GridContainer", e);
			}
			return null;	// Widget
		}
	});

	rias.theme.loadCss([
		"layout/GridContainer.css",
		"layout/DndGridContainer.css"
	]);

	var riasType = "rias.riasw.layout.GridContainer";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswGridContainerIcon",
		iconClass16: "riaswGridContainerIcon16",
		defaultParams: {
			//content: "<span></span>",
			nbZones: "3",
			opacity: "0.7",
			allowAutoScroll: true,
			hasResizableColumns: true,
			withHandles: false,
			width: "500px",
			height: "300px",
			mode: "right",
			executeScripts: true
		},
		initialSize: {
			flow: "auto",
			absolute: {
				"width": "500px",
				"height": "300px"
			}
		},
		//allowedChild: "",
		"property": {
			"isAutoOrganized": {
				"datatype": "boolean",
				"title": "Is Auto-Organized"
			},
			"isRightFixed": {
				"datatype": "boolean",
				"title": "Is Right Fixed"
			},
			"isLeftFixed": {
				"datatype": "boolean",
				"title": "Is Left Fixed"
			},
			"hasResizableColumns": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Has Resizable columns"
			},
			"nbZones": {
				"datatype": "string",
				"title": "Number of Drop Zones"
			},
			"opacity": {
				"datatype": "string",
				"title": "DnD Avatar Opacity"
			},
			"minColWidth": {
				"datatype": "string",
				"title": "Minimum Column Width (percent)"
			},
			"minChildWidth": {
				"datatype": "string",
				"title": "Minimum Child Width"
			},
			"mode": {
				"datatype": "string",
				"option": [
					{
						"value": "left"
					},
					{
						"value": "right"
					}
				],
				"defaultValue": "right",
				"title": "Mode"
			},
			"allowAutoScroll": {
				"datatype": "boolean",
				"title": "Allow Auto Scroll"
			},
			"timeDisplayPopup": {
				"datatype": "string",
				"title": "Time to Display Popup (ms)"
			},
			"isOffset": {
				"datatype": "boolean",
				"title": "Is Offset"
			},
			"withHandles": {
				"datatype": "boolean",
				"title": "Specific Drag With Handles"
			},
			"executeScripts": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Execute Scripts"
			},
			"scriptHasHooks": {
				"datatype": "boolean",
				"title": "Script Has Hooks"
			},
			"isContainer": {
				"datatype": "boolean",
				"description": "Just a flag indicating that this widget descends from dijit._Container",
				"hidden": true,
				"defaultValue": true
			},
			"acceptTypes": {
				"datatype": "array",
				"description": "The gridcontainer will only accept the children that fit to the types.\nIn order to do that, the child must have a widgetType or a dndType attribute corresponding to the accepted type.",
				"hidden": false
			},
			"offsetDrag": {
				"datatype": "object",
				"description": "Allow to specify its own offset (x and y) onl when Parameter isOffset is true",
				"hidden": true
			},
			"handleClasses": {
				"datatype": "array",
				"description": "Array of classes of nodes that will act as drag handles",
				"hidden": false
			}
		}
	};

	return Widget;
});