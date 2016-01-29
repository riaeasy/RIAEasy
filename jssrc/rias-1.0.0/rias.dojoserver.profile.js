
var profile = (function(){
	return {
		basePath: "../../../js-lib-src/dojo-1.10.4-src",///相对于本文件的路径，接下类的编译都从这里开始计算。关联编译配置的文件位置。
		releaseDir: "../../RSServer/jssrc/serverLib/dojo-1.10.4-min",///相对于 basePath，编译目标目录，编译器会覆盖它发现的一切。
		releaseName: "",
		action: "release",
		//默认值为"shrinksafe"。若该值为false，则关闭压缩。shrinksafe.keeplines, closure, closure.keeplines comments,comments.keeplines///dojo1.7+建议用closure。
		layerOptimize: false,
		//设置那些不是层的模块的压缩设置，默认为false，其他值和layerOptimize相同///dojo1.7+建议用closure。
		optimize: false,
		//处理CSS的优化。默认为false。若为comments则去除注释和换行，并连接任何@import命令。其他可选的值有comments.keeplines，剔除注释和连接@import命令，但是保留换行。
		cssOptimize: false,
		//决定编译过程中是否最小化。如果为真则标记为miniExcludes的文件被排除在外就像tests那样，demo和其他元素对于编译不是必需的。默认的为false。
		mini: true,
		stripConsole: "none",///处理输出代码中的conole语名， 默认为"normal", 会删除所以console语句，除了console.error 和 console.warn.最需注意的是，这个特征只在优化级别时才适用。否则它会被忽略。 另外可能的值为"none", "warn" 和"all"
		//selectorEngine: "lite",///标识默认的选择器引擎。这不会直接使代码变小，它确保选择器引擎不包含其他的调用。默认没有设置，Dojo包含两个引擎lite和acme。

		defaultConfig: {
			hasCache:{
				"dojo-built": 1,
				"dojo-loader": 1,
				//"config-selectorEngine": "lite",
				"dom": 0,
				"host-browser": 0,
				"host-rhino": 1,
				"host-node": 0
			},
			async: 1
		},

		staticHasFeatures: {
			"config-deferredInstrumentation": 1,//是否自动加载那些会报告un-handled rejected promises的代码
			"config-dojo-loader-catches": 1,//是否 catch 加载模块时的error handling
			"config-tlmSiblingOfDojo": 1,//是否支持非标准的模块解析代码。1表示即使没有定义 require.pack，也可以当做 dojo 同级的模块包。建议设为 1
			"dojo-amd-factory-scan": 0,//是否扫描所有的模块对AMD的支持
			"dojo-combo-api": 0,//是否支持一些老式的加载器API
			"dojo-config-api": 1,//是否保证 build 是可以配置的
			"dojo-config-require": 1,//是否可以配置require()
			"dojo-debug-messages": 1,//是否包含检测diagnostic 信息
			"dojo-dom-ready-api": 0,//是否保证 DOM ready API 是可用的//设为0才能支持 Rhino
			"dojo-firebug": 0,//是否为那些没有开发者控制台（developer console）的浏览器启用firebug lite (e.g. IE6)
			"dojo-guarantee-console": 1,//是否使那些不能使用控制台的浏览器可以使用console(e.g. IE6)
			"dojo-has-api": 1,//是否使得 has 功能检测API 是可用的
			"dojo-inject-api": 1,//是否支持跨域加载模块
			"dojo-loader": 1,//是否使得加载器是可用的
			"dojo-log-api": 1,//是否记录加载器的日志？
			"dojo-modulePaths": 1,//是否支持那些和加载模块相关的老式API
			"dojo-moduleUrl": 1,//是否那些和加载模块相关的老式API
			"dojo-publish-privates": 1,//是否显示加载器的一些内部信息
			"dojo-requirejs-api": 0,//是否支持RequireJS。
			"dojo-sniff": 0,//是否当从一个CDN加载模块的时候，启用一些老式的模块加载行为？//设为0才能支持 Rhino
			"dojo-sync-loader": 0,//是否采用同步加载器
			"dojo-test-sniff": 0,//Disables some features for testing purposes.是否包含测试代码//设为0才能支持 Rhino
			"dojo-timeout-api": 0,//Disables code dealing with modules that don’t load.？//设为0才能支持 Rhino
			"dojo-trace-api": 1,//Disables the tracing of module loading.是否跟踪模块加载过程
			"dojo-undef-api": 1,//是否包含对模块卸载的支持
			"dojo-v1x-i18n-Api": 0,//启动对v1.x 国际化加载的支持 （ Dijit需要使用）
			"dojo-xhr-factory": 0,///Rhino需要设为0
			"dom": 0,//Ensures the DOM code is available.保证DOM 代码可用//设为0才能支持 Rhino
			"host-browser": 0,//确定构建的代码是用于浏览器平台的//设为0才能支持 Rhino
			"host-rhino": 1,
			"host-node": 0,
			"extend-dojo": 1,//Ensures pre-Dojo 2.0 behavior is maintained.保证  pre-Dojo 2.0行为是被维护的。

			"dojo-loader-catches": 1,
			"dojo-dom-ready-plugin": 0,
			"dojo-ready-api": 0,
			"dojo-error-api": 1,
			"dojo-gettext-api": 1,
			"dojo-test-xd": 0
		},

		packages:[{
			name: "dojo",
			location: "dojo"///相对于 basePath
		}],

		layers: {
			"dojo/dojo": {
				include: [
					"dojo/i18n",
					"dojo/_base/declare",
					"dojo/_base/sniff",
					"dojo/_base/lang",
					"dojo/_base/config",
					"dojo/_base/array",
					"dojo/_base/Deferred",
					"dojo/_base/json",
					"dojo/_base/Color",

					"dojo/errors/create",
					"dojo/errors/CancelError",
					"dojo/cache",
					"dojo/errors/create",
					"dojo/number",
					"dojo/string",
					"dojo/aspect",
					"dojo/Deferred",
					"dojo/promise/tracer",
					"dojo/promise/Promise",
					"dojo/promise/all",
					"dojo/when",
					"dojo/topic",

					"dojo/date/locale",
					"dojo/date/stamp",
					"dojo/store/Observable",

					"dojo/regexp",
					"dojo/has",
					"dojo/sniff"
				],
				exclude: [
					"dojo/_base/kernel",
					"dojo/main",///dojo/main 引用了 dom
					"dojo/on",///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
					"dojo/request/watch"///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
				],
				customBase: true,
				boot: true
			}
		}
	};
})();
 