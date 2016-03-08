
define([
	"rias"
], function(rias){

	var Module = {

		_riaswVersion: "0.7",

		afterFiler: function(result){
			//this.gridBtnModify.on("click", rias.hitch(this, this.gridBtnModifyOnClick));
		},

		btnCalClick: function(evt){
			//this.grid.body.refresh();
			var m = this;
			rias.xhrPost("act/riasbi/kmeans", {
					k: m.input_k.get("value"),
					data: m.input_data.get("value")
				}, function(result){
					if(!result.success || result.success < 1){
						rias.warn({parent: self, content: "计算失败", title: self.title});
					}else{
						m.output_data.set("value", rias.toJson(result.value, true));
					}
				}
			);
		},

		events: [{
			widget: "btnCal",
			event: "click",
			func: "btnCalClick"
		}],

		_riaswChildren: [{
			_riaswIdOfModule: "mainBorder",
			_riaswType: "rias.riasw.layout.Panel",
			design: "headline",
			persist: false,
			gutters: true,
			style: "padding: 0px; width: 100%; height: 100%;",
			_riaswChildren: [{
				_riaswType: "rias.riasw.layout.ContentPanel",
				region: "top",
				style: {
					padding: "0px",
					width: "100%",
					height: "32px"
				},
				_riaswChildren: [{
					_riaswType: "rias.riasw.form.Button",
					_riaswIdOfModule: "btnCal",
					label: "开始计算",
					iconClass: "optionIcon"
				}]
			},{
				_riaswType: "rias.riasw.layout.GridContainer",
				//_riaswIdOfModule: "myHomeGrid",
				region: 'center',
				nbZones: 2,
				colWidths: "45,45",
				hasResizableColumns: true,
				acceptTypes: ['ContentPane', 'TitlePane', 'AccordionPane', 'GridX', 'Calendar'],
				style: {
					width: '100%',
					height: '100%'
				},
				_riaswChildren: [{
					_riaswType: "rias.riasw.layout.TitlePane",
					position: {
						column: 0,
						zone: 0
					},
					attachParent:true,
					title:'输入簇数',
					//content: "321",
					dndType:'TitlePane',
					_riaswChildren: [{
						_riaswType: "rias.riasw.form.TextBox",
						_riaswIdOfModule: "input_k",
						fieldName: "id",
						title: "待聚类的簇数:",
						style: {
							width: "99%",
							height: "24px"
						},
						value: 3
					}]
				},{
					_riaswType: "rias.riasw.layout.TitlePane",
					position: {
						column: 0,
						zone: 1
					},
					attachParent:true,
					title:'输入待聚类的数据',
					content: "",
					dndType:'TitlePane',
					_riaswChildren: [{
						_riaswType: "rias.riasw.form.Textarea",
						_riaswIdOfModule: "input_data",
						fieldName: "id",
						title: "待聚类的数据:",
						style: {
							width: "99%"
						},
						value: "[[2,10], [2,5], [8,4],\n [5,8], [7,5], [6,4],\n [1,2], [4,9]\n]"
					}]
				},{
					_riaswType: "rias.riasw.layout.TitlePane",
					position: {
						column: 1,
						zone: 0
					},
					attachParent:true,
					title:'结果',
					//content: "123",
					dndType:'TitlePane',
					_riaswChildren: [{
						_riaswType: "rias.riasw.form.Textarea",
						_riaswIdOfModule: "output_data",
						fieldName: "id",
						title: "聚类后的结果:",
						style: {
							width: "99%"
						},
						value: ""
					}]
				}]
			}]
		}]
	};

	return Module;

});