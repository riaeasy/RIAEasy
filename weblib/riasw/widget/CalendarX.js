//RIAStudio client runtime widget - CalendarX

define([
	"riasw/riaswBase",
	"dojox/widget/Calendar"
], function(rias, _Widget) {

	//rias.theme.loadThemeCss([
	//	"riasw/widget/Calendar.css"//,
	//	//"dojox/widget/Calendar/Calendar.css"
	//]);

	var riaswType = "riasw.widget.CalendarX";
	var Widget = rias.declare(riaswType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//allowedChild: "",
		"property": {
			"name": {
				"datatype": "string",
				"title": "Name"
			},
			"value": {
				"datatype": "string",
				"title": "Value"
			},
			"dayWidth": {
				"datatype": "string",
				"option": [
					{
						"value": "narrow"
					},
					{
						"value": "wide"
					},
					{
						"value": "abbr"
					}
				],
				"defaultValue": "narrow",
				"title": "Day Width"
			},
			"datePackage": {
				"datatype": "string",
				"description": "JavaScript namespace to find Calendar routines.  Uses Gregorian Calendar routines\nat dojo.date by default.",
				"hidden": false
			}
		}
	};

	return Widget;
});