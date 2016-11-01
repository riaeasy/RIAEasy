
//RIAStudio client runtime widget - TreeView

define([
	"rias",
	//"dojox/mobile/TreeView",
	"rias/riasw/mobile/ScrollableView",
	"rias/riasw/mobile/Heading",
	"rias/riasw/mobile/ListItem",
	"rias/riasw/mobile/ProgressIndicator",
	"rias/riasw/mobile/RoundRectList",
	"dojox/mobile/viewRegistry"
], function(rias, ScrollableView, Heading, ListItem, ProgressIndicator, RoundRectList, viewRegistry){

	rias.theme.loadMobileThemeCss([
		"ScrollablePane.css"
		//"mobile/TreeView.css"
	]);

	var riaswType = "rias.riasw.mobile.TreeView";
	var Widget = rias.declare(riaswType, [ScrollableView], {

		postCreate: function(){
			this._load();
			this.inherited(arguments);
		},

		_customizeListItem: function(listItemArgs){
		},

		_load: function(){
			this.model.getRoot(
				rias.hitch(this, function(item){
					var scope = this;
					var list = new RoundRectList();
					var node = {};
					var listItemArgs = {
						label: scope.model.rootLabel,
						moveTo: '#',
						onClick: function(){ scope.handleClick(this); },
						item: item
					};
					this._customizeListItem(listItemArgs);
					var listitem = new ListItem(listItemArgs);
					list.addChild(listitem);
					this.addChild(list);
				})
			)
		},

		handleClick: function(li){
			// summary:
			//		Called when the user clicks a tree item.
			// li: dojox/mobile/ListItem
			//		The item that the user clicked.
			var newViewId = "view_";
			if(li.item[this.model.newItemIdAttr]){
				newViewId += li.item[this.model.newItemIdAttr];
			}else{
				newViewId += "rootView";
			}
			newViewId = newViewId.replace('/', '_');
			if(rias.by(newViewId)){  // view already exists, just transition to it
				rias.by(li.domNode).transitionTo(newViewId);
				return;
			}

			var prog = ProgressIndicator.getInstance();
			//rias.dom.docBody.appendChild(prog.domNode);
			rias.dom.webAppNode.appendChild(prog.domNode);
			prog.start();

			this.model.getChildren(li.item,
				rias.hitch(this, function(items){
					var scope = this;
					var list = new RoundRectList();
					rias.forEach(items, function(item, i){
						var listItemArgs = {
							item: item,
							label: item[scope.model.store.label],
							transition: "slide"
						};
						scope._customizeListItem(listItemArgs);
						if(scope.model.mayHaveChildren(item)){
							listItemArgs.moveTo = '#';
							listItemArgs.onClick = function(){ scope.handleClick(this); };
						}
						var listitem = new ListItem(listItemArgs);
						list.addChild(listitem);
					});

					var heading = new Heading({
						label: "Dynamic View",
						back: "Back",
						moveTo: viewRegistry.getEnclosingView(li.domNode).id,
						dir: this.isLeftToRight() ? "ltr" : "rtl"
					});

					var newView = ScrollableView({
						id: newViewId,
						dir: this.isLeftToRight() ? "ltr" : "rtl"
					}, rias.dom.create("div", null, rias.dom.webAppNode));
					newView.addChild(heading);
					newView.addChild(list);
					newView.startup();
					prog.stop();
					rias.by(li.domNode).transitionTo(newView.id);
				})
			)
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTreeViewIcon",
		iconClass16: "riaswTreeViewIcon16",
		defaultParams: function(params){
			params = rias.mixinDeep({}, {
				autoExpand: false,
				showRoot: true,
				persist: false,
				isSource: false,
				accept: [],
				dragThreshold:8,
				betweenThreshold:5,
				noDnd: false,
				lazyLoad: true,
				childrenAttr: ["children"]
			}, params);
			if(!params.model){
				params.model = {
					_riaswType: "rias.riasw.widget.TreeModel"
				}
			}
			if(params.store){
				params.model.store = params.store
			}else if(!params.model.store){
				if(params.lazyLoad == false){
					params.model.store = {
						_riaswType: "rias.riasw.store.MemoryStore"
					}
				}else{
					if(params.model.deferItemLoadingUntilExpand === undefined){
						params.model.deferItemLoadingUntilExpand = true;
					}
					params.model.store = {
						_riaswType: "rias.riasw.store.JsonXhrStore"
					}
				}
			}
			if(params.idProperty){
				params.model.store.idProperty = params.idProperty;
				//delete params.idProperty;
			}
			if(params.labelProperty){
				params.model.store.labelProperty = params.labelProperty;
				//delete params.labelProperty;
			}
			if(params.target){
				params.model.store.target = params.target;
				//delete params.target;
			}
			return params;
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
