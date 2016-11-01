//RIAStudio Server Runtime(rias).

define([
	"rias"
], function (rias) {

	///�� page �� appModule Ȩ��
	var rights = {
		"/": {
			requireLogged: true,
			requireRights: ""
		},
		"/appModule/demo": false
	};

	return rights;

});