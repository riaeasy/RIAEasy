//>>built

define("dojox/data/GoogleFeedStore", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare", "dojox/data/GoogleSearchStore"], function (dojo, lang, declare, GoogleSearchStore) {
    dojo.experimental("dojox.data.GoogleFeedStore");
    var Search = GoogleSearchStore.Search;
    return declare("dojox.data.GoogleFeedStore", Search, {_type:"", _googleUrl:"http://ajax.googleapis.com/ajax/services/feed/load", _attributes:["title", "link", "author", "published", "content", "summary", "categories"], _queryAttrs:{"url":"q"}, getFeedValue:function (attribute, defaultValue) {
        var values = this.getFeedValues(attribute, defaultValue);
        if (lang.isArray(values)) {
            return values[0];
        }
        return values;
    }, getFeedValues:function (attribute, defaultValue) {
        if (!this._feedMetaData) {
            return defaultValue;
        }
        return this._feedMetaData[attribute] || defaultValue;
    }, _processItem:function (item, request) {
        this.inherited(arguments);
        item["summary"] = item["contentSnippet"];
        item["published"] = item["publishedDate"];
    }, _getItems:function (data) {
        if (data["feed"]) {
            this._feedMetaData = {title:data.feed.title, desc:data.feed.description, url:data.feed.link, author:data.feed.author};
            return data.feed.entries;
        }
        return null;
    }, _createContent:function (query, callback, request) {
        var cb = this.inherited(arguments);
        cb.num = (request.count || 10) + (request.start || 0);
        return cb;
    }});
});

