//>>built

define("dojox/sql/_base", ["dijit", "dojo", "dojox", "dojo/require!dojox/sql/_crypto"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.sql._base");
    dojo.require("dojox.sql._crypto");
    dojo.mixin(dojox.sql, {dbName:null, debug:(dojo.exists("dojox.sql.debug") ? dojox.sql.debug : false), open:function (dbName) {
        if (this._dbOpen && (!dbName || dbName == this.dbName)) {
            return;
        }
        if (!this.dbName) {
            this.dbName = "dot_store_" + window.location.href.replace(/[^0-9A-Za-z_]/g, "_");
            if (this.dbName.length > 63) {
                this.dbName = this.dbName.substring(0, 63);
            }
        }
        if (!dbName) {
            dbName = this.dbName;
        }
        try {
            this._initDb();
            this.db.open(dbName);
            this._dbOpen = true;
        }
        catch (exp) {
            throw exp.message || exp;
        }
    }, close:function (dbName) {
        if (dojo.isIE) {
            return;
        }
        if (!this._dbOpen && (!dbName || dbName == this.dbName)) {
            return;
        }
        if (!dbName) {
            dbName = this.dbName;
        }
        try {
            this.db.close(dbName);
            this._dbOpen = false;
        }
        catch (exp) {
            throw exp.message || exp;
        }
    }, _exec:function (params) {
        try {
            this._initDb();
            if (!this._dbOpen) {
                this.open();
                this._autoClose = true;
            }
            var sql = null;
            var callback = null;
            var password = null;
            var args = dojo._toArray(params);
            sql = args.splice(0, 1)[0];
            if (this._needsEncrypt(sql) || this._needsDecrypt(sql)) {
                callback = args.splice(args.length - 1, 1)[0];
                password = args.splice(args.length - 1, 1)[0];
            }
            if (this.debug) {
                this._printDebugSQL(sql, args);
            }
            var crypto;
            if (this._needsEncrypt(sql)) {
                crypto = new dojox.sql._SQLCrypto("encrypt", sql, password, args, callback);
                return null;
            } else {
                if (this._needsDecrypt(sql)) {
                    crypto = new dojox.sql._SQLCrypto("decrypt", sql, password, args, callback);
                    return null;
                }
            }
            var rs = this.db.execute(sql, args);
            rs = this._normalizeResults(rs);
            if (this._autoClose) {
                this.close();
            }
            return rs;
        }
        catch (exp) {
            exp = exp.message || exp;
            console.debug("SQL Exception: " + exp);
            if (this._autoClose) {
                try {
                    this.close();
                }
                catch (e) {
                    console.debug("Error closing database: " + e.message || e);
                }
            }
            throw exp;
        }
        return null;
    }, _initDb:function () {
        if (!this.db) {
            try {
                this.db = google.gears.factory.create("beta.database", "1.0");
            }
            catch (exp) {
                dojo.setObject("google.gears.denied", true);
                if (dojox.off) {
                    dojox.off.onFrameworkEvent("coreOperationFailed");
                }
                throw "Google Gears must be allowed to run";
            }
        }
    }, _printDebugSQL:function (sql, args) {
        var msg = "dojox.sql(\"" + sql + "\"";
        for (var i = 0; i < args.length; i++) {
            if (typeof args[i] == "string") {
                msg += ", \"" + args[i] + "\"";
            } else {
                msg += ", " + args[i];
            }
        }
        msg += ")";
        console.debug(msg);
    }, _normalizeResults:function (rs) {
        var results = [];
        if (!rs) {
            return [];
        }
        while (rs.isValidRow()) {
            var row = {};
            for (var i = 0; i < rs.fieldCount(); i++) {
                var fieldName = rs.fieldName(i);
                var fieldValue = rs.field(i);
                row[fieldName] = fieldValue;
            }
            results.push(row);
            rs.next();
        }
        rs.close();
        return results;
    }, _needsEncrypt:function (sql) {
        return /encrypt\([^\)]*\)/i.test(sql);
    }, _needsDecrypt:function (sql) {
        return /decrypt\([^\)]*\)/i.test(sql);
    }});
    dojo.declare("dojox.sql._SQLCrypto", null, {constructor:function (action, sql, password, args, callback) {
        if (action == "encrypt") {
            this._execEncryptSQL(sql, password, args, callback);
        } else {
            this._execDecryptSQL(sql, password, args, callback);
        }
    }, _execEncryptSQL:function (sql, password, args, callback) {
        var strippedSQL = this._stripCryptoSQL(sql);
        var encryptColumns = this._flagEncryptedArgs(sql, args);
        var self = this;
        this._encrypt(strippedSQL, password, args, encryptColumns, function (finalArgs) {
            var error = false;
            var resultSet = [];
            var exp = null;
            try {
                resultSet = dojox.sql.db.execute(strippedSQL, finalArgs);
            }
            catch (execError) {
                error = true;
                exp = execError.message || execError;
            }
            if (exp != null) {
                if (dojox.sql._autoClose) {
                    try {
                        dojox.sql.close();
                    }
                    catch (e) {
                    }
                }
                callback(null, true, exp.toString());
                return;
            }
            resultSet = dojox.sql._normalizeResults(resultSet);
            if (dojox.sql._autoClose) {
                dojox.sql.close();
            }
            if (dojox.sql._needsDecrypt(sql)) {
                var needsDecrypt = self._determineDecryptedColumns(sql);
                self._decrypt(resultSet, needsDecrypt, password, function (finalResultSet) {
                    callback(finalResultSet, false, null);
                });
            } else {
                callback(resultSet, false, null);
            }
        });
    }, _execDecryptSQL:function (sql, password, args, callback) {
        var strippedSQL = this._stripCryptoSQL(sql);
        var needsDecrypt = this._determineDecryptedColumns(sql);
        var error = false;
        var resultSet = [];
        var exp = null;
        try {
            resultSet = dojox.sql.db.execute(strippedSQL, args);
        }
        catch (execError) {
            error = true;
            exp = execError.message || execError;
        }
        if (exp != null) {
            if (dojox.sql._autoClose) {
                try {
                    dojox.sql.close();
                }
                catch (e) {
                }
            }
            callback(resultSet, true, exp.toString());
            return;
        }
        resultSet = dojox.sql._normalizeResults(resultSet);
        if (dojox.sql._autoClose) {
            dojox.sql.close();
        }
        this._decrypt(resultSet, needsDecrypt, password, function (finalResultSet) {
            callback(finalResultSet, false, null);
        });
    }, _encrypt:function (sql, password, args, encryptColumns, callback) {
        this._totalCrypto = 0;
        this._finishedCrypto = 0;
        this._finishedSpawningCrypto = false;
        this._finalArgs = args;
        for (var i = 0; i < args.length; i++) {
            if (encryptColumns[i]) {
                var sqlParam = args[i];
                var paramIndex = i;
                this._totalCrypto++;
                dojox.sql._crypto.encrypt(sqlParam, password, dojo.hitch(this, function (results) {
                    this._finalArgs[paramIndex] = results;
                    this._finishedCrypto++;
                    if (this._finishedCrypto >= this._totalCrypto && this._finishedSpawningCrypto) {
                        callback(this._finalArgs);
                    }
                }));
            }
        }
        this._finishedSpawningCrypto = true;
    }, _decrypt:function (resultSet, needsDecrypt, password, callback) {
        this._totalCrypto = 0;
        this._finishedCrypto = 0;
        this._finishedSpawningCrypto = false;
        this._finalResultSet = resultSet;
        for (var i = 0; i < resultSet.length; i++) {
            var row = resultSet[i];
            for (var columnName in row) {
                if (needsDecrypt == "*" || needsDecrypt[columnName]) {
                    this._totalCrypto++;
                    var columnValue = row[columnName];
                    this._decryptSingleColumn(columnName, columnValue, password, i, function (finalResultSet) {
                        callback(finalResultSet);
                    });
                }
            }
        }
        this._finishedSpawningCrypto = true;
    }, _stripCryptoSQL:function (sql) {
        sql = sql.replace(/DECRYPT\(\*\)/ig, "*");
        var matches = sql.match(/ENCRYPT\([^\)]*\)/ig);
        if (matches != null) {
            for (var i = 0; i < matches.length; i++) {
                var encryptStatement = matches[i];
                var encryptValue = encryptStatement.match(/ENCRYPT\(([^\)]*)\)/i)[1];
                sql = sql.replace(encryptStatement, encryptValue);
            }
        }
        matches = sql.match(/DECRYPT\([^\)]*\)/ig);
        if (matches != null) {
            for (i = 0; i < matches.length; i++) {
                var decryptStatement = matches[i];
                var decryptValue = decryptStatement.match(/DECRYPT\(([^\)]*)\)/i)[1];
                sql = sql.replace(decryptStatement, decryptValue);
            }
        }
        return sql;
    }, _flagEncryptedArgs:function (sql, args) {
        var tester = new RegExp(/([\"][^\"]*\?[^\"]*[\"])|([\'][^\']*\?[^\']*[\'])|(\?)/ig);
        var matches;
        var currentParam = 0;
        var results = [];
        while ((matches = tester.exec(sql)) != null) {
            var currentMatch = RegExp.lastMatch + "";
            if (/^[\"\']/.test(currentMatch)) {
                continue;
            }
            var needsEncrypt = false;
            if (/ENCRYPT\([^\)]*$/i.test(RegExp.leftContext)) {
                needsEncrypt = true;
            }
            results[currentParam] = needsEncrypt;
            currentParam++;
        }
        return results;
    }, _determineDecryptedColumns:function (sql) {
        var results = {};
        if (/DECRYPT\(\*\)/i.test(sql)) {
            results = "*";
        } else {
            var tester = /DECRYPT\((?:\s*\w*\s*\,?)*\)/ig;
            var matches = tester.exec(sql);
            while (matches) {
                var lastMatch = new String(RegExp.lastMatch);
                var columnNames = lastMatch.replace(/DECRYPT\(/i, "");
                columnNames = columnNames.replace(/\)/, "");
                columnNames = columnNames.split(/\s*,\s*/);
                dojo.forEach(columnNames, function (column) {
                    if (/\s*\w* AS (\w*)/i.test(column)) {
                        column = column.match(/\s*\w* AS (\w*)/i)[1];
                    }
                    results[column] = true;
                });
                matches = tester.exec(sql);
            }
        }
        return results;
    }, _decryptSingleColumn:function (columnName, columnValue, password, currentRowIndex, callback) {
        dojox.sql._crypto.decrypt(columnValue, password, dojo.hitch(this, function (results) {
            this._finalResultSet[currentRowIndex][columnName] = results;
            this._finishedCrypto++;
            if (this._finishedCrypto >= this._totalCrypto && this._finishedSpawningCrypto) {
                callback(this._finalResultSet);
            }
        }));
    }});
    (function () {
        var orig_sql = dojox.sql;
        dojox.sql = new Function("return dojox.sql._exec(arguments);");
        dojo.mixin(dojox.sql, orig_sql);
    })();
});

