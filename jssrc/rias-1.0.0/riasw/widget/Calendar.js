//RIAStudio client runtime widget - Calendar

define([
	"rias",
	"dijit/Calendar"
], function(rias, _Widget) {

	rias.theme.loadCss([
		"widget/Calendar.css"
	]);

	var riasType = "rias.riasw.widget.Calendar";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswCalendarIcon",
		iconClass16: "riaswCalendarIcon16",
		defaultParams: {
			//content: "<input></input>",
			dayWidth: "narrow"
		},
		initialSize: {},
		//allowedChild: "",
		property: {
			name: {
				datatype: "string",
				title: "Name"
			},
			value: {
				datatype: "string",
				format: "date",
				title: "Value"
			},
			dayWidth: {
				datatype: "string",
				option: [
					{
						value: "narrow"
					},
					{
						value: "wide"
					},
					{
						value: "abbr"
					}
				],
				defaultValue: "narrow",
				title: "Day Width"
			},
			datePackage: {
				datatype: "string",
				description: "JavaScript namespace to find Calendar routines.  Uses Gregorian Calendar routines\nat dojo.date by default.",
				hidden: false
			}
		}
	};

	return Widget;
});