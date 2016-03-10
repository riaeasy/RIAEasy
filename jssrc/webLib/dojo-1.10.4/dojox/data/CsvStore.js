//>>built

define("dojox/data/CsvStore", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/xhr", "dojo/_base/kernel", "dojo/data/util/filter", "dojo/data/util/simpleFetch"], function (lang, declare, xhr, kernel, filterUtil, simpleFetch) {
    var CsvStore = declare("dojox.data.CsvStore", null, {constructor:function (keywordParameters) {
        this._attributes = [];
        this._attributeIndexes = {};
        this._dataArray = [];
        this._arrayOfAllItems = [];
        this._loadFinished = false;
        if (keywordParameters.url) {
            this.url = keywordParameters.url;
        }
        this._csvData = keywordParameters.data;
        if (keywordParameters.label) {
            this.label = keywordParameters.label;
        } else {
            if (this.label === "") {
                this.label = undefined;
            }
        }
        this._storeProp = "_csvStore";
        this._idProp = "_csvId";
        this._features = {"dojo.data.api.Read":true, "dojo.data.api.Identity":true};
        this._loadInProgress = false;
        this._queuedFetches = [];
        this.identifier = keywordParameters.identifier;
        if (this.identifier === "") {
            delete this.identifier;
        } else {
            this._idMap = {};
        }
        if ("separator" in keywordParameters) {
            this.separator = keywordParameters.separator;
        }
        if ("urlPreventCache" in keywordParameters) {
            this.urlPreventCache = keywordParameters.urlPreventCache ? true : false;
        }
    }, url:"", label:"", identifier:"", separator:",", urlPreventCache:false, _assertIsItem:function (item) {
        if (!this.isItem(item)) {
            throw new Error(this.declaredClass + ": a function was passed an item argument that was not an item");
        }
    }, _getIndex:function (item) {
        var idx = this.getIdentity(item);
        if (this.identifier) {
            idx = this._idMap[idx];
        }
        return idx;
    }, getValue:function (item, attribute, defaultValue) {
        this._assertIsItem(item);
        var itemValue = defaultValue;
        if (typeof attribute === "string") {
            var ai = this._attributeIndexes[attribute];
            if (ai != null) {
                var itemData = this._dataArray[this._getIndex(item)];
                itemValue = itemData[ai] || defaultValue;
            }
        } else {
            throw new Error(this.declaredClass + ": a function was passed an attribute argument that was not a string");
        }
        return itemValue;
    }, getValues:function (item, attribute) {
        var value = this.getValue(item, attribute);
        return (value ? [value] : []);
    }, getAttributes:function (item) {
        this._assertIsItem(item);
        var attributes = [];
        var itemData = this._dataArray[this._getIndex(item)];
        for (var i = 0; i < itemData.length; i++) {
            if (itemData[i] !== "") {
                attributes.push(this._attributes[i]);
            }
        }
        return attributes;
    }, hasAttribute:function (item, attribute) {
        this._assertIsItem(item);
        if (typeof attribute === "string") {
            var attributeIndex = this._attributeIndexes[attribute];
            var itemData = this._dataArray[this._getIndex(item)];
            return (typeof attributeIndex !== "undefined" && attributeIndex < itemData.length && itemData[attributeIndex] !== "");
        } else {
            throw new Error(this.declaredClass + ": a function was passed an attribute argument that was not a string");
        }
    }, containsValue:function (item, attribute, value) {
        var regexp = undefined;
        if (typeof value === "string") {
            regexp = filterUtil.patternToRegExp(value, false);
        }
        return this._containsValue(item, attribute, value, regexp);
    }, _containsValue:function (item, attribute, value, regexp) {
        var values = this.getValues(item, attribute);
        for (var i = 0; i < values.length; ++i) {
            var possibleValue = values[i];
            if (typeof possibleValue === "string" && regexp) {
                return (possibleValue.match(regexp) !== null);
            } else {
                if (value === possibleValue) {
                    return true;
                }
            }
        }
        return false;
    }, isItem:function (something) {
        if (something && something[this._storeProp] === this) {
            var identity = something[this._idProp];
            if (this.identifier) {
                var data = this._dataArray[this._idMap[identity]];
                if (data) {
                    return true;
                }
            } else {
                if (identity >= 0 && identity < this._dataArray.length) {
                    return true;
                }
            }
        }
        return false;
    }, isItemLoaded:function (something) {
        return this.isItem(something);
    }, loadItem:function (item) {
    }, getFeatures:function () {
        return this._features;
    }, getLabel:function (item) {
        if (this.label && this.isItem(item)) {
            return this.getValue(item, this.label);
        }
        return undefined;
    }, getLabelAttributes:function (item) {
        if (this.label) {
            return [this.label];
        }
        return null;
    }, _fetchItems:function (keywordArgs, findCallback, errorCallback) {
        var self = this;
        var filter = function (requestArgs, arrayOfAllItems) {
            var items = null;
            if (requestArgs.query) {
                var key, value;
                items = [];
                var ignoreCase = requestArgs.queryOptions ? requestArgs.queryOptions.ignoreCase : false;
                var regexpList = {};
                for (key in requestArgs.query) {
                    value = requestArgs.query[key];
                    if (typeof value === "string") {
                        regexpList[key] = filterUtil.patternToRegExp(value, ignoreCase);
                    }
                }
                for (var i = 0; i < arrayOfAllItems.length; ++i) {
                    var match = true;
                    var candidateItem = arrayOfAllItems[i];
                    for (key in requestArgs.query) {
                        value = requestArgs.query[key];
                        if (!self._containsValue(candidateItem, key, value, regexpList[key])) {
                            match = false;
                        }
                    }
                    if (match) {
                        items.push(candidateItem);
                    }
                }
            } else {
                items = arrayOfAllItems.slice(0, arrayOfAllItems.length);
            }
            findCallback(items, requestArgs);
        };
        if (this._loadFinished) {
            filter(keywordArgs, this._arrayOfAllItems);
        } else {
            if (this.url !== "") {
                if (this._loadInProgress) {
                    this._queuedFetches.push({args:keywordArgs, filter:filter});
                } else {
                    this._loadInProgress = true;
                    var getArgs = {url:self.url, handleAs:"text", preventCache:self.urlPreventCache};
                    var getHandler = xhr.get(getArgs);
                    getHandler.addCallback(function (data) {
                        try {
                            self._processData(data);
                            filter(keywordArgs, self._arrayOfAllItems);
                            self._handleQueuedFetches();
                        }
                        catch (e) {
                            errorCallback(e, keywordArgs);
                        }
                    });
                    getHandler.addErrback(function (error) {
                        self._loadInProgress = false;
                        if (errorCallback) {
                            errorCallback(error, keywordArgs);
                        } else {
                            throw error;
                        }
                    });
                    var oldAbort = null;
                    if (keywordArgs.abort) {
                        oldAbort = keywordArgs.abort;
                    }
                    keywordArgs.abort = function () {
                        var df = getHandler;
                        if (df && df.fired === -1) {
                            df.cancel();
                            df = null;
                        }
                        if (oldAbort) {
                            oldAbort.call(keywordArgs);
                        }
                    };
                }
            } else {
                if (this._csvData) {
                    try {
                        this._processData(this._csvData);
                        this._csvData = null;
                        filter(keywordArgs, this._arrayOfAllItems);
                    }
                    catch (e) {
                        errorCallback(e, keywordArgs);
                    }
                } else {
                    var error = new Error(this.declaredClass + ": No CSV source data was provided as either URL or String data input.");
                    if (errorCallback) {
                        errorCallback(error, keywordArgs);
                    } else {
                        throw error;
                    }
                }
            }
        }
    }, close:function (request) {
    }, _getArrayOfArraysFromCsvFileContents:function (csvFileContents) {
        if (lang.isString(csvFileContents)) {
            var leadingWhiteSpaceCharacters = new RegExp("^\\s+", "g");
            var trailingWhiteSpaceCharacters = new RegExp("\\s+$", "g");
            var doubleQuotes = new RegExp("\"\"", "g");
            var arrayOfOutputRecords = [];
            var i;
            var arrayOfInputLines = this._splitLines(csvFileContents);
            for (i = 0; i < arrayOfInputLines.length; ++i) {
                var singleLine = arrayOfInputLines[i];
                if (singleLine.length > 0) {
                    var listOfFields = singleLine.split(this.separator);
                    var j = 0;
                    while (j < listOfFields.length) {
                        var space_field_space = listOfFields[j];
                        var field_space = space_field_space.replace(leadingWhiteSpaceCharacters, "");
                        var field = field_space.replace(trailingWhiteSpaceCharacters, "");
                        var firstChar = field.charAt(0);
                        var lastChar = field.charAt(field.length - 1);
                        var secondToLastChar = field.charAt(field.length - 2);
                        var thirdToLastChar = field.charAt(field.length - 3);
                        if (field.length === 2 && field == "\"\"") {
                            listOfFields[j] = "";
                        } else {
                            if ((firstChar == "\"") && ((lastChar != "\"") || ((lastChar == "\"") && (secondToLastChar == "\"") && (thirdToLastChar != "\"")))) {
                                if (j + 1 === listOfFields.length) {
                                    return;
                                }
                                var nextField = listOfFields[j + 1];
                                listOfFields[j] = field_space + this.separator + nextField;
                                listOfFields.splice(j + 1, 1);
                            } else {
                                if ((firstChar == "\"") && (lastChar == "\"")) {
                                    field = field.slice(1, (field.length - 1));
                                    field = field.replace(doubleQuotes, "\"");
                                }
                                listOfFields[j] = field;
                                j += 1;
                            }
                        }
                    }
                    arrayOfOutputRecords.push(listOfFields);
                }
            }
            this._attributes = arrayOfOutputRecords.shift();
            for (i = 0; i < this._attributes.length; i++) {
                this._attributeIndexes[this._attributes[i]] = i;
            }
            this._dataArray = arrayOfOutputRecords;
        }
    }, _splitLines:function (csvContent) {
        var split = [];
        var i;
        var line = "";
        var inQuotes = false;
        for (i = 0; i < csvContent.length; i++) {
            var c = csvContent.charAt(i);
            switch (c) {
              case "\"":
                inQuotes = !inQuotes;
                line += c;
                break;
              case "\r":
                if (inQuotes) {
                    line += c;
                } else {
                    split.push(line);
                    line = "";
                    if (i < (csvContent.length - 1) && csvContent.charAt(i + 1) == "\n") {
                        i++;
                    }
                }
                break;
              case "\n":
                if (inQuotes) {
                    line += c;
                } else {
                    split.push(line);
                    line = "";
                }
                break;
              default:
                line += c;
            }
        }
        if (line !== "") {
            split.push(line);
        }
        return split;
    }, _processData:function (data) {
        this._getArrayOfArraysFromCsvFileContents(data);
        this._arrayOfAllItems = [];
        if (this.identifier) {
            if (this._attributeIndexes[this.identifier] === undefined) {
                throw new Error(this.declaredClass + ": Identity specified is not a column header in the data set.");
            }
        }
        for (var i = 0; i < this._dataArray.length; i++) {
            var id = i;
            if (this.identifier) {
                var iData = this._dataArray[i];
                id = iData[this._attributeIndexes[this.identifier]];
                this._idMap[id] = i;
            }
            this._arrayOfAllItems.push(this._createItemFromIdentity(id));
        }
        this._loadFinished = true;
        this._loadInProgress = false;
    }, _createItemFromIdentity:function (identity) {
        var item = {};
        item[this._storeProp] = this;
        item[this._idProp] = identity;
        return item;
    }, getIdentity:function (item) {
        if (this.isItem(item)) {
            return item[this._idProp];
        }
        return null;
    }, fetchItemByIdentity:function (keywordArgs) {
        var item;
        var scope = keywordArgs.scope ? keywordArgs.scope : kernel.global;
        if (!this._loadFinished) {
            var self = this;
            if (this.url !== "") {
                if (this._loadInProgress) {
                    this._queuedFetches.push({args:keywordArgs});
                } else {
                    this._loadInProgress = true;
                    var getArgs = {url:self.url, handleAs:"text"};
                    var getHandler = xhr.get(getArgs);
                    getHandler.addCallback(function (data) {
                        try {
                            self._processData(data);
                            var item = self._createItemFromIdentity(keywordArgs.identity);
                            if (!self.isItem(item)) {
                                item = null;
                            }
                            if (keywordArgs.onItem) {
                                keywordArgs.onItem.call(scope, item);
                            }
                            self._handleQueuedFetches();
                        }
                        catch (error) {
                            if (keywordArgs.onError) {
                                keywordArgs.onError.call(scope, error);
                            }
                        }
                    });
                    getHandler.addErrback(function (error) {
                        this._loadInProgress = false;
                        if (keywordArgs.onError) {
                            keywordArgs.onError.call(scope, error);
                        }
                    });
                }
            } else {
                if (this._csvData) {
                    try {
                        self._processData(self._csvData);
                        self._csvData = null;
                        item = self._createItemFromIdentity(keywordArgs.identity);
                        if (!self.isItem(item)) {
                            item = null;
                        }
                        if (keywordArgs.onItem) {
                            keywordArgs.onItem.call(scope, item);
                        }
                    }
                    catch (e) {
                        if (keywordArgs.onError) {
                            keywordArgs.onError.call(scope, e);
                        }
                    }
                }
            }
        } else {
            item = this._createItemFromIdentity(keywordArgs.identity);
            if (!this.isItem(item)) {
                item = null;
            }
            if (keywordArgs.onItem) {
                keywordArgs.onItem.call(scope, item);
            }
        }
    }, getIdentityAttributes:function (item) {
        if (this.identifier) {
            return [this.identifier];
        } else {
            return null;
        }
    }, _handleQueuedFetches:function () {
        if (this._queuedFetches.length > 0) {
            for (var i = 0; i < this._queuedFetches.length; i++) {
                var fData = this._queuedFetches[i];
                var delayedFilter = fData.filter;
                var delayedQuery = fData.args;
                if (delayedFilter) {
                    delayedFilter(delayedQuery, this._arrayOfAllItems);
                } else {
                    this.fetchItemByIdentity(fData.args);
                }
            }
            this._queuedFetches = [];
        }
    }});
    lang.extend(CsvStore, simpleFetch);
    return CsvStore;
});

