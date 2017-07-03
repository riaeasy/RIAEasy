define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 3,
	"_riaswVersion": "1.0",
	"caption": "新的页面模块",
	"title": "新的页面模块",
	"style": {
	},
	"_riaswElements": [
		{
			"_riaswType": "riasw.sys.Tag",
			"_riaswIdInModule": "tag1",
			"layoutPriority": 0,
			"region": "center",
			"splitter": false,
			"src": "/",
			"tagType": "iframe",
			"onload": function (){
		console.debug("iframe: " + this.src);
	}
		}
	]
};
	
});
