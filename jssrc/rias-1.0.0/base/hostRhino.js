
//RIAStudio Client/Server Java Extent(riasjava) in Rhino.

var _typeStr = _typeString = "s",
	_typeNum = _typeNumber = "n",
	_typeBool = _typeBoolean = "b",
	_typeObj = _typeObject = "o",
	_typeArray = "a";

define([
	"rias"
], function (rias) {

	//rias.host.SysUtil = com.riastudio.util.SysUtil;
	//rias.host.DbUtil = com.riastudio.util.DbUtil;
	//rias.host.ZipUtil = com.riastudio.util.ZipUtil;
	var SysUtil = com.riastudio.util.SysUtil,
		WebUtil = com.riastudio.util.WebUtil,
		FileUtil = com.riastudio.util.FileUtil,
		DbUtil = com.riastudio.util.DbUtil;

	///dojo.rhino 有 console
	function _args2str(args) {
		var a = Array.prototype.slice.call(arguments);
		a = a.join(" ");
		return a;
	}
	if (!console) {
		console = {};
	}
	console.log = function (args) {
		rias.log(1, "console", _args2str.apply(this, arguments));
	};
	console.debug = function (args) {
		rias.log(0, "console", _args2str.apply(this, arguments));
	};
	console.info = function (args) {
		rias.log(1, "console", _args2str.apply(this, arguments));
	};
	console.warn = function (args) {
		rias.log(2, "console", _args2str.apply(this, arguments));
	};
	console.error = function (args) {
		rias.log(3, "console", _args2str.apply(this, arguments));
	};

	//Rhino中有List类。
	rias.getObject("rias.host", true);

	rias.host.jsString = rias.host.toString = function (/*java String*/str) {
		return String(str);
	};
	rias.host.jsNumber = rias.host.toNumber = function (/*java Int*/i) {
		return Number(rias.host.jsString(i));///必须先转换为 String，否则 i 为对象时可能不正确。
	};
	rias.host.jsBoolean = rias.host.toBoolean = function (/*java Boolean*/b) {
		return (b != "false" && Boolean(b));///Boolean("false") = true。
	};
	rias.host.jsArray = rias.host.toArray = function (/*java Collections*/list) {
		var i = 0,
			l = list && list.size() || 0,
			arr = [];
		for (; i < l; ++i) {
			arr.push(list.get(i));
		}
		return arr;
	};
	rias.host.toType = function (it, type) {
		switch (type) {
			case _typeStr:
				return rias.host.toString(it);
			case _typeNum:
				return rias.host.toNumber(it);
			case _typeBool:
				return rias.host.toBoolean(it);
			case _typeArray:
				return rias.host.toArray(it);
			default:
				return it;//可以返回 Object。
		}
	};

	//rias.host.Thread = java.lang.Thread;
	rias.host.newThread = function (func) {
		return new java.lang.Thread(func);
	};
	rias.host.currentThread = function () {
		return java.lang.Thread.currentThread();
	};
	//rias.host.String = java.lang.String;
	rias.host.newString = function (str) {
		return new java.lang.String(str);
	};

///File================================================================///
	//rias.host.File = java.io.File;
	rias.host.newFile = function (parent, filename) {
		///parent + filename 或者 pathname
		if (!filename) {
			return new java.io.File(parent);
		} else {
			return new java.io.File(parent, filename);
		}
	};
	rias.host.getFilePathName = function (file) {
		//if(rias.isString(file)){
		//	file = new java.io.File(file);
		//}
		return rias.host.jsString(file.getCanonicalPath()).replace(/\\/g, "/");
	};
	rias.host.getFileExt = function (file) {
		file = rias.host.getFilePathName(file);
		var p = file.lastIndexOf(".");
		if (p > -1) {
			return file.substring(p + 1);
		} else {
			return "";
		}
	};
	rias.host.fileSize = function (file) {
		return file.length();
	};
	rias.host.fileLastModified = function (file) {
		return file.lastModified();
	};
	rias.host.fileExists = function (file) {
		return file.exists();
	};
	rias.host.isFile = function (file) {
		return file.isFile();
	};
	rias.host.isDirectory = function (file) {
		return file.isDirectory();
	};
	rias.host.createNewFile = function (file) {
		return file.createNewFile();
	};
	rias.host.createNewDir = function (file) {
		return file.mkdirs();
	};
	rias.host.deleteFile = function (file) {
		return file.delete();
	};
	rias.host.copyFile = function (srcfile, desfile, autoRename, isCut) {
		/*var r = 0;
		try {
			var ins = new java.io.FileInputStream(srcfile).getChannel(),
				outs = new java.io.FileOutputStream(desfile).getChannel();
			ins.transferTo(0, ins.size(), outs);
			r = 1;
		} finally {
			if (ins != null) {
				try {
					ins.close();
				} catch (e) {
				}
			}
			if (outs != null) {
				try {
					outs.close();
				} catch (e) {
				}
			}
		}
		desfile.setLastModified(srcfile.lastModified());
		return r;*/
		try{
			FileUtil.copyFile(srcfile, desfile, !!autoRename, !!isCut);
			return 1;
		}catch(e){
			return 0;
		}
	};

	rias.host.readText = function (file, charset) {
		if(rias.isString(file)){
			file = new java.io.File(file);
		}
		/*var fs = new java.io.FileInputStream(file),
			bs = rias.host.newBuff(file.length());
		try {
			fs.read(bs);
			if (!charset)
				return rias.host.jsString(new java.lang.String(bs));
			else
				return rias.host.jsString(new java.lang.String(bs, charset));
		} finally {
			fs.close();
		}*/
		return rias.host.jsString(FileUtil.readText(file, charset || "utf-8"));
	};
	rias.host.writeText = function (file, text, charset) {
		if(rias.isString(file)){
			file = new java.io.File(file);
		}
		/*var r = 0,
			os = new java.io.FileOutputStream(file);
		try {
			text = new java.lang.String(text);
			if (!charset) {
				os.write(text.getBytes());
			} else {
				os.write(text.getBytes(charset));
			}
			r = 1;
		} finally {
			os.close();
		}
		return r;*/
		try{
			FileUtil.writeText(file, text, charset || "utf-8");
			return 1;
		}catch(e){
			return 0;
		}
	};

	rias.host.listFiles = function (file) {
		return file.listFiles();
	};
	rias.host.sortFiles = function (files, type, desc) {
		var fType = type || -1,
			fDesc = desc || 0,
			collator = java.text.Collator.getInstance();
		function compare(f1, f2) {
			var l1, l2,
				t1, t2,
				b1, b2;
			switch (fType) {
				case "size":
				case 1:
					l1 = f1.isDirectory() ? -1 : f1.length();
					l2 = f2.isDirectory() ? -1 : f2.length();
					if (fDesc) {
						return l2.compareTo(l1);
					} else {
						return l1.compareTo(l2);
					}
				case "type":
				case 2:
					t1 = collator.getCollationKey(f1.isDirectory() ? "0" : "1" + rias.host.getFileExt(f1).toLowerCase());
					t2 = collator.getCollationKey(f2.isDirectory() ? "0" : "1" + rias.host.getFileExt(f2).toLowerCase());
					if (fDesc) {
						return t2.compareTo(t1);
					} else {
						return t1.compareTo(t2);
					}
				case "lastModified":
				case 3:
					l1 = f1.lastModified();
					l2 = f2.lastModified();
					b1 = f1.isDirectory();
					b2 = f2.isDirectory();

					if (b1 && !b2)
						l1 = Number.MIN_VALUE;
					if (b2 && !b1)
						l2 = Number.MIN_VALUE;
					if (fDesc) {
						return l2.compareTo(l1);
					} else {
						return l1.compareTo(l2);
					}
				default:
					t1 = collator.getCollationKey((f1.isDirectory() ? 0 : 1) + f1.getName().toLowerCase());
					t2 = collator.getCollationKey((f2.isDirectory() ? 0 : 1) + f2.getName().toLowerCase());
					if (fDesc) {
						return t2.compareTo(t1);
					} else {
						return t1.compareTo(t2);
					}
			}
		}
		if (files) {
			files.sort(compare);
		}
	};

	//rias.host.FileInputStream = java.io.FileInputStream;
	//rias.host.FileOutputStream = java.io.FileOutputStream;
	//rias.host.InputStream = java.io.InputStream;
	//rias.host.GZIPOutputStream = java.util.zip.GZIPOutputStream;


///SysUtil======================================================///

	rias.host.debugLevel = function () {
		return SysUtil.debugLevel;
	};

	rias.host.toBuff = function (str, charset) {
		if (charset) {
			return SysUtil.toBuff(str, charset);
		}
		return SysUtil.toBuff(str);
	};
	rias.host.newBuff = function (len) {
		return SysUtil.newBuff(len);
	};
	rias.host.newCache = function () {
		return SysUtil.newCache();
	};

	rias.host.inputToOutput = function (input, output) {
		return SysUtil.isToOs(input, output);
	};

	rias.host.readStream = function (stream) {
		return rias.host.toString(SysUtil.readString(stream));
	};

///WebUtil======================================================///

	rias.host.response = function (res, code, data, gzip, charset) {
		WebUtil.response(res, data, code, !!gzip);
		/*res.setStatus(code);
		if (data instanceof java.io.InputStream) {
			try {
				rias.host.inputToOutput(data, res.getOutputStream());
			} finally {
				data.close();
			}
		} else if (data) {
			if (!rias.isString(data)) {
				data = data.toString();
			}
			//var buff = rias.host.String(s).getBytes(charset);
			var buff = (charset ? rias.host.toBuff(data, charset) : rias.host.toBuff(data, "utf-8"));
			/// null == undefined , but , null !== undefined
			if((gzip || gzip == undefined) && buff.length >= (gzip && gzip.min || 1024) && buff.length < (gzip && gzip.max || 1048576)){
				res.setHeader("Content-Encoding", "gzip");
				var gos = new java.util.zip.GZIPOutputStream(res.getOutputStream());
				try {
					gos.write(buff);
				} finally {
					gos.close();
				}
			} else {
				res.setContentLength(buff.length);
				res.getOutputStream().write(buff);
			}
		}
		res.flushBuffer();*/
	};

///DbUtil======================================================///

	rias.host.db = {
		initConnection: function (dbConnName, dbConnConfig) {
			return DbUtil.initConnection(rias.toStr(dbConnName), dbConnConfig);
		},
		getField: function (rs, index, type, ignoreBlob, toStr) {
			return DbUtil.getObject(rs, rias.toInt(index), rias.toInt(type), !!ignoreBlob, !!toStr);
		},
		toJSONArray: function (rs, maxResultRecords) {
			return DbUtil.toJSONArray(rs, rias.toInt(maxResultRecords, 999));
		}
	};

	return rias;

});

