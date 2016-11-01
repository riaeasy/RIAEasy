//RIAStudio Server Runtime(rias).

define([
	"rias"
], function (rias) {

	var logs;
	//logs = true;//false;
	logs = {
		"/": "POST,PUT,DELETE",
		"/act/login": 1,
		"/act/heartbeat": 0,
		"/act/logout": 1,
		"/act/riasd": 1,
		"/act/test": 0
	};

	return logs;

});