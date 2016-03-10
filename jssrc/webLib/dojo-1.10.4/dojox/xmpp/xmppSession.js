//>>built

define("dojox/xmpp/xmppSession", ["dijit", "dojo", "dojox", "dojo/require!dojox/xmpp/TransportSession,dojox/xmpp/RosterService,dojox/xmpp/PresenceService,dojox/xmpp/UserService,dojox/xmpp/ChatService,dojox/xmpp/sasl"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.xmpp.xmppSession");
    dojo.require("dojox.xmpp.TransportSession");
    dojo.require("dojox.xmpp.RosterService");
    dojo.require("dojox.xmpp.PresenceService");
    dojo.require("dojox.xmpp.UserService");
    dojo.require("dojox.xmpp.ChatService");
    dojo.require("dojox.xmpp.sasl");
    dojox.xmpp.xmpp = {STREAM_NS:"http://etherx.jabber.org/streams", CLIENT_NS:"jabber:client", STANZA_NS:"urn:ietf:params:xml:ns:xmpp-stanzas", SASL_NS:"urn:ietf:params:xml:ns:xmpp-sasl", BIND_NS:"urn:ietf:params:xml:ns:xmpp-bind", SESSION_NS:"urn:ietf:params:xml:ns:xmpp-session", BODY_NS:"http://jabber.org/protocol/httpbind", XHTML_BODY_NS:"http://www.w3.org/1999/xhtml", XHTML_IM_NS:"http://jabber.org/protocol/xhtml-im", INACTIVE:"Inactive", CONNECTED:"Connected", ACTIVE:"Active", TERMINATE:"Terminate", LOGIN_FAILURE:"LoginFailure", INVALID_ID:-1, NO_ID:0, error:{BAD_REQUEST:"bad-request", CONFLICT:"conflict", FEATURE_NOT_IMPLEMENTED:"feature-not-implemented", FORBIDDEN:"forbidden", GONE:"gone", INTERNAL_SERVER_ERROR:"internal-server-error", ITEM_NOT_FOUND:"item-not-found", ID_MALFORMED:"jid-malformed", NOT_ACCEPTABLE:"not-acceptable", NOT_ALLOWED:"not-allowed", NOT_AUTHORIZED:"not-authorized", SERVICE_UNAVAILABLE:"service-unavailable", SUBSCRIPTION_REQUIRED:"subscription-required", UNEXPECTED_REQUEST:"unexpected-request"}};
    dojox.xmpp.xmppSession = function (props) {
        this.roster = [];
        this.chatRegister = [];
        this._iqId = Math.round(Math.random() * 1000000000);
        if (props && dojo.isObject(props)) {
            dojo.mixin(this, props);
        }
        this.session = new dojox.xmpp.TransportSession(props);
        dojo.connect(this.session, "onReady", this, "onTransportReady");
        dojo.connect(this.session, "onTerminate", this, "onTransportTerminate");
        dojo.connect(this.session, "onProcessProtocolResponse", this, "processProtocolResponse");
    };
    dojo.extend(dojox.xmpp.xmppSession, {roster:[], chatRegister:[], _iqId:0, open:function (user, password, resource) {
        if (!user) {
            throw new Error("User id cannot be null");
        } else {
            this.jid = user;
            if (user.indexOf("@") == -1) {
                this.jid = this.jid + "@" + this.domain;
            }
        }
        if (password) {
            this.password = password;
        }
        if (resource) {
            this.resource = resource;
        }
        this.session.open();
    }, close:function () {
        this.state = dojox.xmpp.xmpp.TERMINATE;
        this.session.close(dojox.xmpp.util.createElement("presence", {type:"unavailable", xmlns:dojox.xmpp.xmpp.CLIENT_NS}, true));
    }, processProtocolResponse:function (msg) {
        var type = msg.nodeName;
        var nsIndex = type.indexOf(":");
        if (nsIndex > 0) {
            type = type.substring(nsIndex + 1);
        }
        switch (type) {
          case "iq":
          case "presence":
          case "message":
          case "features":
            this[type + "Handler"](msg);
            break;
          default:
            if (msg.getAttribute("xmlns") == dojox.xmpp.xmpp.SASL_NS) {
                this.saslHandler(msg);
            }
        }
    }, messageHandler:function (msg) {
        switch (msg.getAttribute("type")) {
          case "chat":
            this.chatHandler(msg);
            break;
          case "normal":
            break;
          default:
            this.simpleMessageHandler(msg);
        }
    }, iqHandler:function (msg) {
        if (msg.getAttribute("type") == "set") {
            this.iqSetHandler(msg);
            return;
        } else {
            if (msg.getAttribute("type") == "get") {
                return;
            }
        }
    }, presenceHandler:function (msg) {
        switch (msg.getAttribute("type")) {
          case "subscribe":
            this.presenceSubscriptionRequest(msg.getAttribute("from"));
            break;
          case "subscribed":
          case "unsubscribed":
            break;
          case "error":
            this.processXmppError(msg);
            break;
          default:
            this.presenceUpdate(msg);
            break;
        }
    }, featuresHandler:function (msg) {
        var authMechanisms = [];
        var hasBindFeature = false;
        var hasSessionFeature = false;
        if (msg.hasChildNodes()) {
            for (var i = 0; i < msg.childNodes.length; i++) {
                var n = msg.childNodes[i];
                switch (n.nodeName) {
                  case "mechanisms":
                    for (var x = 0; x < n.childNodes.length; x++) {
                        authMechanisms.push(n.childNodes[x].firstChild.nodeValue);
                    }
                    break;
                  case "bind":
                    hasBindFeature = true;
                    break;
                  case "session":
                    hasSessionFeature = true;
                }
            }
        }
        if (this.state == dojox.xmpp.xmpp.CONNECTED) {
            if (!this.auth) {
                for (var i = 0; i < authMechanisms.length; i++) {
                    try {
                        this.auth = dojox.xmpp.sasl.registry.match(authMechanisms[i], this);
                        break;
                    }
                    catch (e) {
                        console.warn("No suitable auth mechanism found for: ", authMechanisms[i]);
                    }
                }
            } else {
                if (hasBindFeature) {
                    this.bindResource(hasSessionFeature);
                }
            }
        }
    }, saslHandler:function (msg) {
        if (msg.nodeName == "success") {
            this.auth.onSuccess();
            return;
        }
        if (msg.nodeName == "challenge") {
            this.auth.onChallenge(msg);
            return;
        }
        if (msg.hasChildNodes()) {
            this.onLoginFailure(msg.firstChild.nodeName);
            this.session.setState("Terminate", msg.firstChild.nodeName);
        }
    }, sendRestart:function () {
        this.session._sendRestart();
    }, chatHandler:function (msg) {
        var message = {from:msg.getAttribute("from"), to:msg.getAttribute("to")};
        var chatState = null;
        for (var i = 0; i < msg.childNodes.length; i++) {
            var n = msg.childNodes[i];
            if (n.hasChildNodes()) {
                switch (n.nodeName) {
                  case "thread":
                    message.chatid = n.firstChild.nodeValue;
                    break;
                  case "body":
                    if (!n.getAttribute("xmlns") || (n.getAttribute("xmlns") === "")) {
                        message.body = n.firstChild.nodeValue;
                    }
                    break;
                  case "subject":
                    message.subject = n.firstChild.nodeValue;
                    break;
                  case "html":
                    if (n.getAttribute("xmlns") == dojox.xmpp.xmpp.XHTML_IM_NS) {
                        message.xhtml = n.getElementsByTagName("body")[0];
                    }
                    break;
                  case "x":
                    break;
                  default:
                }
            }
        }
        var found = -1;
        if (message.chatid) {
            for (var i = 0; i < this.chatRegister.length; i++) {
                var ci = this.chatRegister[i];
                if (ci && ci.chatid == message.chatid) {
                    found = i;
                    break;
                }
            }
        } else {
            for (var i = 0; i < this.chatRegister.length; i++) {
                var ci = this.chatRegister[i];
                if (ci) {
                    if (ci.uid == this.getBareJid(message.from)) {
                        found = i;
                    }
                }
            }
        }
        if (found > -1 && chatState) {
            var chat = this.chatRegister[found];
            chat.setState(chatState);
            if (chat.firstMessage) {
                if (chatState == dojox.xmpp.chat.ACTIVE_STATE) {
                    chat.useChatState = (chatState !== null) ? true : false;
                    chat.firstMessage = false;
                }
            }
        }
        if ((!message.body || message.body === "") && !message.xhtml) {
            return;
        }
        if (found > -1) {
            var chat = this.chatRegister[found];
            chat.receiveMessage(message);
        } else {
            var chatInstance = new dojox.xmpp.ChatService();
            chatInstance.uid = this.getBareJid(message.from);
            chatInstance.chatid = message.chatid;
            chatInstance.firstMessage = true;
            if (!chatState || chatState != dojox.xmpp.chat.ACTIVE_STATE) {
                this.useChatState = false;
            }
            this.registerChatInstance(chatInstance, message);
        }
    }, simpleMessageHandler:function (msg) {
    }, registerChatInstance:function (chatInstance, message) {
        chatInstance.setSession(this);
        this.chatRegister.push(chatInstance);
        this.onRegisterChatInstance(chatInstance, message);
        chatInstance.receiveMessage(message, true);
    }, iqSetHandler:function (msg) {
        if (msg.hasChildNodes()) {
            var fn = msg.firstChild;
            switch (fn.nodeName) {
              case "query":
                if (fn.getAttribute("xmlns") == "jabber:iq:roster") {
                    this.rosterSetHandler(fn);
                    this.sendIqResult(msg.getAttribute("id"), msg.getAttribute("from"));
                }
                break;
              default:
                break;
            }
        }
    }, sendIqResult:function (iqId, to) {
        var req = {id:iqId, to:to || this.domain, type:"result", from:this.jid + "/" + this.resource};
        this.dispatchPacket(dojox.xmpp.util.createElement("iq", req, true));
    }, rosterSetHandler:function (elem) {
        var r;
        for (var i = 0; i < elem.childNodes.length; i++) {
            var n = elem.childNodes[i];
            if (n.nodeName == "item") {
                var found = false;
                var state = -1;
                var rosterItem = null;
                var previousCopy = null;
                for (var x = 0; x < this.roster.length; x++) {
                    r = this.roster[x];
                    if (n.getAttribute("jid") == r.jid) {
                        found = true;
                        if (n.getAttribute("subscription") == "remove") {
                            rosterItem = {id:r.jid, name:r.name, groups:[]};
                            for (var y = 0; y < r.groups.length; y++) {
                                rosterItem.groups.push(r.groups[y]);
                            }
                            this.roster.splice(x, 1);
                            state = dojox.xmpp.roster.REMOVED;
                        } else {
                            previousCopy = dojo.clone(r);
                            var itemName = n.getAttribute("name");
                            if (itemName) {
                                this.roster[x].name = itemName;
                            }
                            r.groups = [];
                            if (n.getAttribute("subscription")) {
                                r.status = n.getAttribute("subscription");
                            }
                            r.substatus = dojox.xmpp.presence.SUBSCRIPTION_SUBSTATUS_NONE;
                            if (n.getAttribute("ask") == "subscribe") {
                                r.substatus = dojox.xmpp.presence.SUBSCRIPTION_REQUEST_PENDING;
                            }
                            for (var y = 0; y < n.childNodes.length; y++) {
                                var groupNode = n.childNodes[y];
                                if ((groupNode.nodeName == "group") && (groupNode.hasChildNodes())) {
                                    var gname = groupNode.firstChild.nodeValue;
                                    r.groups.push(gname);
                                }
                            }
                            rosterItem = r;
                            state = dojox.xmpp.roster.CHANGED;
                        }
                        break;
                    }
                }
                if (!found && (n.getAttribute("subscription") != "remove")) {
                    r = this.createRosterEntry(n);
                    rosterItem = r;
                    state = dojox.xmpp.roster.ADDED;
                }
                switch (state) {
                  case dojox.xmpp.roster.ADDED:
                    this.onRosterAdded(rosterItem);
                    break;
                  case dojox.xmpp.roster.REMOVED:
                    this.onRosterRemoved(rosterItem);
                    break;
                  case dojox.xmpp.roster.CHANGED:
                    this.onRosterChanged(rosterItem, previousCopy);
                    break;
                }
            }
        }
    }, presenceUpdate:function (msg) {
        if (msg.getAttribute("to")) {
            var jid = this.getBareJid(msg.getAttribute("to"));
            if (jid != this.jid) {
                return;
            }
        }
        var fromRes = this.getResourceFromJid(msg.getAttribute("from"));
        var p = {from:this.getBareJid(msg.getAttribute("from")), resource:fromRes, show:dojox.xmpp.presence.STATUS_ONLINE, priority:5, hasAvatar:false};
        if (msg.getAttribute("type") == "unavailable") {
            p.show = dojox.xmpp.presence.STATUS_OFFLINE;
        }
        for (var i = 0; i < msg.childNodes.length; i++) {
            var n = msg.childNodes[i];
            if (n.hasChildNodes()) {
                switch (n.nodeName) {
                  case "status":
                  case "show":
                    p[n.nodeName] = n.firstChild.nodeValue;
                    break;
                  case "priority":
                    p.priority = parseInt(n.firstChild.nodeValue, 10);
                    break;
                  case "x":
                    if (n.firstChild && n.firstChild.firstChild && n.firstChild.firstChild.nodeValue !== "") {
                        p.avatarHash = n.firstChild.firstChild.nodeValue;
                        p.hasAvatar = true;
                    }
                    break;
                }
            }
        }
        this.onPresenceUpdate(p);
    }, retrieveRoster:function () {
        var props = {id:this.getNextIqId(), from:this.jid + "/" + this.resource, type:"get"};
        var req = new dojox.string.Builder(dojox.xmpp.util.createElement("iq", props, false));
        req.append(dojox.xmpp.util.createElement("query", {xmlns:"jabber:iq:roster"}, true));
        req.append("</iq>");
        var def = this.dispatchPacket(req, "iq", props.id);
        def.addCallback(this, "onRetrieveRoster");
    }, getRosterIndex:function (jid) {
        if (jid.indexOf("@") == -1) {
            jid += "@" + this.domain;
        }
        for (var i = 0; i < this.roster.length; i++) {
            if (jid == this.roster[i].jid) {
                return i;
            }
        }
        return -1;
    }, createRosterEntry:function (elem) {
        var re = {name:elem.getAttribute("name"), jid:elem.getAttribute("jid"), groups:[], status:dojox.xmpp.presence.SUBSCRIPTION_NONE, substatus:dojox.xmpp.presence.SUBSCRIPTION_SUBSTATUS_NONE};
        if (!re.name) {
            re.name = re.id;
        }
        for (var i = 0; i < elem.childNodes.length; i++) {
            var n = elem.childNodes[i];
            if (n.nodeName == "group" && n.hasChildNodes()) {
                re.groups.push(n.firstChild.nodeValue);
            }
        }
        if (elem.getAttribute("subscription")) {
            re.status = elem.getAttribute("subscription");
        }
        if (elem.getAttribute("ask") == "subscribe") {
            re.substatus = dojox.xmpp.presence.SUBSCRIPTION_REQUEST_PENDING;
        }
        return re;
    }, bindResource:function (hasSession) {
        var props = {id:this.getNextIqId(), type:"set"};
        var bindReq = new dojox.string.Builder(dojox.xmpp.util.createElement("iq", props, false));
        bindReq.append(dojox.xmpp.util.createElement("bind", {xmlns:dojox.xmpp.xmpp.BIND_NS}, false));
        if (this.resource) {
            bindReq.append(dojox.xmpp.util.createElement("resource"));
            bindReq.append(this.resource);
            bindReq.append("</resource>");
        }
        bindReq.append("</bind></iq>");
        var def = this.dispatchPacket(bindReq, "iq", props.id);
        def.addCallback(this, function (msg) {
            this.onBindResource(msg, hasSession);
            return msg;
        });
    }, getNextIqId:function () {
        return "im_" + this._iqId++;
    }, presenceSubscriptionRequest:function (msg) {
        this.onSubscriptionRequest(msg);
    }, dispatchPacket:function (msg, type, matchId) {
        if (this.state != "Terminate") {
            return this.session.dispatchPacket(msg, type, matchId);
        } else {
        }
    }, setState:function (state, message) {
        if (this.state != state) {
            if (this["on" + state]) {
                this["on" + state](state, this.state, message);
            }
            this.state = state;
        }
    }, search:function (searchString, service, searchAttribute) {
        var req = {id:this.getNextIqId(), "xml:lang":this.lang, type:"set", from:this.jid + "/" + this.resource, to:service};
        var request = new dojox.string.Builder(dojox.xmpp.util.createElement("iq", req, false));
        request.append(dojox.xmpp.util.createElement("query", {xmlns:"jabber:iq:search"}, false));
        request.append(dojox.xmpp.util.createElement(searchAttribute, {}, false));
        request.append(searchString);
        request.append("</").append(searchAttribute).append(">");
        request.append("</query></iq>");
        var def = this.dispatchPacket(request.toString, "iq", req.id);
        def.addCallback(this, "_onSearchResults");
    }, _onSearchResults:function (msg) {
        if ((msg.getAttribute("type") == "result") && (msg.hasChildNodes())) {
            this.onSearchResults([]);
        }
    }, onLogin:function () {
        this.retrieveRoster();
    }, onLoginFailure:function (msg) {
    }, onBindResource:function (msg, hasSession) {
        if (msg.getAttribute("type") == "result") {
            if ((msg.hasChildNodes()) && (msg.firstChild.nodeName == "bind")) {
                var bindTag = msg.firstChild;
                if ((bindTag.hasChildNodes()) && (bindTag.firstChild.nodeName == "jid")) {
                    if (bindTag.firstChild.hasChildNodes()) {
                        var fulljid = bindTag.firstChild.firstChild.nodeValue;
                        this.jid = this.getBareJid(fulljid);
                        this.resource = this.getResourceFromJid(fulljid);
                    }
                }
                if (hasSession) {
                    var props = {id:this.getNextIqId(), type:"set"};
                    var bindReq = new dojox.string.Builder(dojox.xmpp.util.createElement("iq", props, false));
                    bindReq.append(dojox.xmpp.util.createElement("session", {xmlns:dojox.xmpp.xmpp.SESSION_NS}, true));
                    bindReq.append("</iq>");
                    var def = this.dispatchPacket(bindReq, "iq", props.id);
                    def.addCallback(this, "onBindSession");
                    return;
                }
            } else {
            }
            this.onLogin();
        } else {
            if (msg.getAttribute("type") == "error") {
                var err = this.processXmppError(msg);
                this.onLoginFailure(err);
            }
        }
    }, onBindSession:function (msg) {
        if (msg.getAttribute("type") == "error") {
            var err = this.processXmppError(msg);
            this.onLoginFailure(err);
        } else {
            this.onLogin();
        }
    }, onSearchResults:function (results) {
    }, onRetrieveRoster:function (msg) {
        if ((msg.getAttribute("type") == "result") && msg.hasChildNodes()) {
            var query = msg.getElementsByTagName("query")[0];
            if (query.getAttribute("xmlns") == "jabber:iq:roster") {
                for (var i = 0; i < query.childNodes.length; i++) {
                    if (query.childNodes[i].nodeName == "item") {
                        this.roster[i] = this.createRosterEntry(query.childNodes[i]);
                    }
                }
            }
        } else {
            if (msg.getAttribute("type") == "error") {
            }
        }
        this.setState(dojox.xmpp.xmpp.ACTIVE);
        this.onRosterUpdated();
        return msg;
    }, onRosterUpdated:function () {
    }, onSubscriptionRequest:function (req) {
    }, onPresenceUpdate:function (p) {
    }, onTransportReady:function () {
        this.setState(dojox.xmpp.xmpp.CONNECTED);
        this.rosterService = new dojox.xmpp.RosterService(this);
        this.presenceService = new dojox.xmpp.PresenceService(this);
        this.userService = new dojox.xmpp.UserService(this);
    }, onTransportTerminate:function (newState, oldState, message) {
        this.setState(dojox.xmpp.xmpp.TERMINATE, message);
    }, onConnected:function () {
    }, onTerminate:function (newState, oldState, message) {
    }, onActive:function () {
    }, onRegisterChatInstance:function (chatInstance, message) {
    }, onRosterAdded:function (ri) {
    }, onRosterRemoved:function (ri) {
    }, onRosterChanged:function (ri, previousCopy) {
    }, processXmppError:function (msg) {
        var err = {stanzaType:msg.nodeName, id:msg.getAttribute("id")};
        for (var i = 0; i < msg.childNodes.length; i++) {
            var n = msg.childNodes[i];
            switch (n.nodeName) {
              case "error":
                err.errorType = n.getAttribute("type");
                for (var x = 0; x < n.childNodes.length; x++) {
                    var cn = n.childNodes[x];
                    if ((cn.nodeName == "text") && (cn.getAttribute("xmlns") == dojox.xmpp.xmpp.STANZA_NS) && cn.hasChildNodes()) {
                        err.message = cn.firstChild.nodeValue;
                    } else {
                        if ((cn.getAttribute("xmlns") == dojox.xmpp.xmpp.STANZA_NS) && (!cn.hasChildNodes())) {
                            err.condition = cn.nodeName;
                        }
                    }
                }
                break;
              default:
                break;
            }
        }
        return err;
    }, sendStanzaError:function (stanzaType, to, id, errorType, condition, text) {
        var req = {type:"error"};
        if (to) {
            req.to = to;
        }
        if (id) {
            req.id = id;
        }
        var request = new dojox.string.Builder(dojox.xmpp.util.createElement(stanzaType, req, false));
        request.append(dojox.xmpp.util.createElement("error", {type:errorType}, false));
        request.append(dojox.xmpp.util.createElement("condition", {xmlns:dojox.xmpp.xmpp.STANZA_NS}, true));
        if (text) {
            var textAttr = {xmlns:dojox.xmpp.xmpp.STANZA_NS, "xml:lang":this.lang};
            request.append(dojox.xmpp.util.createElement("text", textAttr, false));
            request.append(text).append("</text>");
        }
        request.append("</error></").append(stanzaType).append(">");
        this.dispatchPacket(request.toString());
    }, getBareJid:function (jid) {
        var i = jid.indexOf("/");
        if (i != -1) {
            return jid.substring(0, i);
        }
        return jid;
    }, getResourceFromJid:function (jid) {
        var i = jid.indexOf("/");
        if (i != -1) {
            return jid.substring((i + 1), jid.length);
        }
        return "";
    }});
});

