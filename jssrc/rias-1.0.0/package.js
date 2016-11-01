var copyOnlyMids = {
	'rias/changes.md': 1,
	'rias/license.md': 1,
	'rias/README.md': 1,
	'rias/package': 1
};
var miniExcludeMids = {
	'rias/changes.md': 1,
	'rias/license.md': 1,
	'rias/README.md': 1,
	'rias/package': 1
};

// jshint unused: false
var profile = {
	resourceTags: {
		copyOnly: function (filename, mid) {
			return mid in copyOnlyMids;
		},

		test: function (filename) {
			return /\/test\//.test(filename);
		},

		miniExclude: function (filename, mid) {
			return (/\/(?:test|demos)\//).test(filename) ||
				(/\.styl$/).test(filename) ||
			 	mid in miniExcludeMids;
		},

		amd: function (filename) {
			return (/\.js$/).test(filename);
		}
	}
};
