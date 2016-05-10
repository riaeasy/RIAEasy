define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 14,
	"requires": [
	],
	"moduleCss": [
	],
	"_riaswVersion": "1.0",
	"region": "center",
	"caption": "新的页面模块",
	"title": "新的页面模块",
	"style": {
	},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.html.Tag",
			"_riaswIdOfModule": "tag1",
			"layoutPriority": 0,
			"region": "center",
			"splitter": false,
			"src": "http://localhost:9098/",
			"tagType": "iframe",
			"onload": function (){
		console.debug("iframe: " + this.src);
	}
		}
	]
}
	
});
