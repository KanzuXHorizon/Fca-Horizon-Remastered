/* eslint-disable no-redeclare */
"use strict";
const utils = require("../utils");
const log = require("npmlog");
const mqtt = require('mqtt');
const Websocket = require('ws');
const HttpsProxyAgent = require('https-proxy-agent');
const EventEmitter = require('events');
const Duplexify = require('duplexify');
const Transform = require('readable-stream').Transform;
var identity = function () { };
var form = {};
var getSeqID = function () { };


var topics = ["/ls_req","/ls_resp","/legacy_web","/webrtc","/rtc_multi","/onevc","/br_sr","/sr_res","/t_ms","/thread_typing","/orca_typing_notifications","/notify_disconnect","/orca_presence","/inbox","/mercury", "/messaging_events", "/orca_message_notifications", "/pp","/webrtc_response"];

/* [ Noti ? ]
!   "/br_sr", //Notification
    * => Need to publish /br_sr right after this
   
!   "/notify_disconnect",
    * => Need to publish /messenger_sync_create_queue right after this

!   "/orca_presence",
    * => Will receive /sr_res right here.
  */

var WebSocket_Global;

function buildProxy() {
    var Proxy = new Transform({
        objectMode: false
    });

    Proxy._write = function socketWriteNode(chunk, enc, next) {
        if (WebSocket_Global.readyState !== WebSocket_Global.OPEN) {
            return next();
        }
    
        if (typeof chunk === 'string') {
            chunk = new Buffer.from(chunk, 'utf8');
        }
        WebSocket_Global.send(chunk, next);
    };

    Proxy._flush = function(done) {
        WebSocket_Global.close();
        done();
    };

    Proxy._writev = function(chunks, cb) {
        var buffers = new Array(chunks.length);
        for (var i = 0; i < chunks.length; i++) {
            if (typeof chunks[i].chunk === 'string') {
                buffers[i] = new Buffer.from(chunks[i], 'utf8');
            } else {
                buffers[i] = chunks[i].chunk;
            }
        }
        this._write(new Buffer.concat(buffers), 'binary', cb);
    };

    return Proxy;
}

function buildStream(options, WebSocket, Proxy) {
    const Stream = Duplexify(undefined, undefined, options);
    Stream.socket = WebSocket;
    
    WebSocket 
        .onclose = function() {
            Stream.end();
            Stream.destroy();
        };
    WebSocket
        .onerror = function(err) {
            Stream.destroy(err);
        };
    WebSocket
        .onmessage = function(event) {
            var data = event.data;
            if (data instanceof ArrayBuffer) data = new Buffer.from(data);
            else data = new Buffer.from(data, 'utf8');
            Stream.push(data);
        };
    WebSocket
        .onopen = function() {
            Stream.setReadable(Proxy);
            Stream.setWritable(Proxy);
            Stream.emit('connect');
        };
    WebSocket_Global = WebSocket;
    Proxy.on('close', function() { WebSocket.close(); });
    return Stream;
}


function listenMqtt(defaultFuncs, api, ctx, globalCallback) {
    //Don't really know what this does but I think it's for the act`ive state?
    //TODO: Move to ctx when implemented
    var chatOn = ctx.globalOptions.online;
    var foreground = false;

    var sessionID = Math.floor((Math.random() * Number.MAX_SAFE_INTEGER)+1);
    var username = {u: ctx.userID,s: sessionID,chat_on: chatOn,fg: foreground,d: utils.getGUID(),ct: "websocket",aid: "219994525426954", mqtt_sid: "",cp: 3,ecp: 10,st: [],pm: [],dc: "",no_auto_fg: true,gas: null,pack: []};
    var cookies = ctx.jar.getCookies('https://www.facebook.com').join("; ");

    var host;
    if (ctx.mqttEndpoint) host = `${ctx.mqttEndpoint}&sid=${sessionID}`;
    else if (ctx.region) host = `wss://edge-chat.facebook.com/chat?region=${ctx.region.toLocaleLowerCase()}&sid=${sessionID}`;
    else host = `wss://edge-chat.facebook.com/chat?sid=${sessionID}`;

    var options = { 
        clientId: "mqttwsclient",
        protocolId: 'MQIsdp',
        protocolVersion: 3,
        username: JSON.stringify(username), 
        clean: true,
        wsOptions: {
            headers: {
                'Cookie': cookies,
                'Origin': 'https://www.facebook.com',
                'User-Agent': (ctx.globalOptions.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'),
                'Referer': 'https://www.facebook.com/',
                'Host': new URL(host).hostname //'edge-chat.facebook.com'
            },
            origin: 'https://www.facebook.com',
            protocolVersion: 13,
            binaryType: 'arraybuffer',
        },
        keepalive: 60,
        reschedulePings: true,
        reconnectPeriod: 3
    };

    if (typeof ctx.globalOptions.proxy != "undefined") {
        var agent = new HttpsProxyAgent(ctx.globalOptions.proxy);
        options.wsOptions.agent = agent;
    }
    ctx.mqttClient = new mqtt.Client(_ => buildStream(options, new Websocket(host, options.wsOptions), buildProxy()), options);
    global.mqttClient = ctx.mqttClient;

    global.mqttClient.on('error', function (err) {
        log.error("listenMqtt", err);
        global.mqttClient.end();

        if (ctx.globalOptions.autoReconnect) getSeqID();
        else {
            globalCallback({ type: "stop_listen", error: "Server Đã Sập - Auto Restart" }, null);
            return process.exit(1);
        }
    });

    global.mqttClient.on('connect', function () {
        if (!global.Fca.Data.Setup || global.Fca.Data.Setup == undefined) {
            if (global.Fca.Require.FastConfig.RestartMQTT_Minutes != 0 && global.Fca.Data.StopListening != true) { 
                global.Fca.Data.Setup = true;
                setTimeout(() => {
                    global.Fca.Require.logger.Warning("Closing MQTT Client...");
                    ctx.mqttClient.end();
                    global.Fca.Require.logger.Warning("Reconnecting MQTT Client...");
                    global.Fca.Data.Setup = false;
                    getSeqID();
                }, Number(global.Fca.Require.FastConfig.RestartMQTT_Minutes) * 60 * 1000);
            }        
        }
        if (process.env.OnStatus == undefined) {
            global.Fca.Require.logger.Normal("Bạn Đang Sài Phiên Bản: Premium Access");
            if (Number(global.Fca.Require.FastConfig.AutoRestartMinutes) == 0) {
                // something
            }
            else if (Number(global.Fca.Require.FastConfig.AutoRestartMinutes < 10)) {
                log.warn("AutoRestartMinutes","The number of minutes to automatically restart must be more than 10 minutes");
            }
            else if (Number(global.Fca.Require.FastConfig.AutoRestartMinutes) < 0) {
                log.warn("AutoRestartMinutes","Invalid auto-restart minutes!");
            }
            else {
                global.Fca.Require.logger.Normal(global.Fca.getText(global.Fca.Require.Language.Src.AutoRestart,global.Fca.Require.FastConfig.AutoRestartMinutes));
                global.Fca.Require.logger.Normal("Auto Restart MQTT Client After: " + global.Fca.Require.FastConfig.RestartMQTT_Minutes + " Minutes");
                setInterval(() => { 
                    global.Fca.Require.logger.Normal(global.Fca.Require.Language.Src.OnRestart);
                    process.exit(1);
                }, Number(global.Fca.Require.FastConfig.AutoRestartMinutes) * 60000);
            }
            require('../broadcast').startBroadcasting();
            const MemoryManager = require('../Extra/Src/Release_Memory');
            const path = require('path');

            const memoryManager = new MemoryManager({
                warningThreshold: 0.6,
                releaseThreshold: 0.7, 
                maxThreshold: 0.8, 
                interval: 30 * 1000,
                logLevel: 'warn',
                logFile: path.join(__dirname, 'memory.log'),
                smartReleaseEnabled: true,
            });


            memoryManager.autoStart(60 * 60 * 1000); 

            process.env.OnStatus = true;
        }
        
        topics.forEach(topicsub => global.mqttClient.subscribe(topicsub));

        var topic;
        var queue = {
            sync_api_version: 11,
            max_deltas_able_to_process: 100,
            delta_batch_size: 500,
            encoding: "JSON",
            entity_fbid: ctx.userID,
        };

        topic = "/messenger_sync_create_queue";
        queue.initial_titan_sequence_id = ctx.lastSeqId;
        queue.device_params = null;

        global.mqttClient.publish(topic, JSON.stringify(queue), { qos: 1, retain: false });

        var rTimeout = setTimeout(function () {
            global.mqttClient.end();
            getSeqID();
        }, 3000);

        ctx.tmsWait = function () {
            clearTimeout(rTimeout);
            ctx.globalOptions.emitReady ? globalCallback({type: "ready",error: null}) : '';
            delete ctx.tmsWait;
        };
    });

    global.mqttClient.on('message', function (topic, message, _packet) {
        const jsonMessage = JSON.parse(message.toString());
        console.log(message.toString())
        if (topic === "/t_ms") {
            if (ctx.tmsWait && typeof ctx.tmsWait == "function") ctx.tmsWait();

            if (jsonMessage.firstDeltaSeqId && jsonMessage.syncToken) {
                ctx.lastSeqId = jsonMessage.firstDeltaSeqId;
                ctx.syncToken = jsonMessage.syncToken;
            }

            if (jsonMessage.lastIssuedSeqId) ctx.lastSeqId = parseInt(jsonMessage.lastIssuedSeqId);
            //If it contains more than 1 delta
            for (var i in jsonMessage.deltas) {
                var delta = jsonMessage.deltas[i];
                parseDelta(defaultFuncs, api, ctx, globalCallback, { "delta": delta });
            }
        } 
        else if (topic === "/ls_resp") {
            console.log((jsonMessage.payload));
            const payload = JSON.parse(jsonMessage.payload); //'{"name":null,"step":[1,[1,[4,0,1,[5,"taskExists",[19,"415"]]],[23,[2,0],[1,[5,"replaceOptimsiticMessage","7192532113093667880","mid.$gABfX5li9LA6VdUymnWPRAdlkiawo"]]]],[1,[4,0,1,[5,"taskExists",[19,"415"]]],[23,[2,0],[1,[5,"mailboxTaskCompletionApiOnTaskCompletion",[19,"415"],true]]]],[1,[4,0,1,[5,"taskExists",[19,"415"]]],[23,[2,0],[1,[5,"removeTask",[19,"415"],[9]]]]]]}'
            const request_ID = jsonMessage.request_id;
            if (ctx.callback_Task[request_ID] != undefined) {
                const { callback, type } = ctx.callback_Task[request_ID];
                const Data = new getRespData(type, payload);

                if (!Data) {
                    callback("Something went wrong 🐳", null);
                }
                else {
                    callback(null, Data);
                }
            }
        }
        else if (topic === "/thread_typing" || topic === "/orca_typing_notifications") {
            var typ = {
                type: "typ",
                isTyping: !!jsonMessage.state,
                from: jsonMessage.sender_fbid.toString(),
                threadID: utils.formatID((jsonMessage.thread || jsonMessage.sender_fbid).toString())
            };
            (function () { globalCallback(null, typ); })();
        } else if (topic === "/orca_presence") {
            if (!ctx.globalOptions.updatePresence) {
                for (var i in jsonMessage.list) {
                    var data = jsonMessage.list[i];
                    var userID = data["u"];

                    var presence = {
                        type: "presence",
                        userID: userID.toString(),
                        //Convert to ms
                        timestamp: data["l"] * 1000,
                        statuses: data["p"]
                    };
                    (function () { globalCallback(null, presence); })();
                }
            }
        }

    });

    process.on('SIGINT', function () {
        LogUptime();
        process.kill(process.pid);
    });

    process.on('exit', () => {
        LogUptime();
    });
    
}

function getRespData(Type, payload) {
    try { 
        switch (Type) {
            case "sendMqttMessage": {
                return {
                    type: Type,
                    threadID: payload.step[1][2][2][1][2], //this is sick bro
                    messageID: payload.step[1][2][2][1][3],
                    payload: payload.step[1][2]
                };
            }
            default: { //!very LAZY :> cook yourself
                return {
                    Data: payload.step[1][2][2][1],
                    type: Type,
                    payload: payload.step[1][2] 
                };
            }
        }
    }
    catch (e) {
        return null;
    }
}

function LogUptime() {
    var uptime = process.uptime();
    var { join } = require('path');
    if (global.Fca.Require.fs.existsSync(join(__dirname, '../CountTime.json'))) {
        var Time1 = (Number(global.Fca.Require.fs.readFileSync(join(__dirname, '../CountTime.json'), 'utf8')) || 0);
        global.Fca.Require.fs.writeFileSync(join(__dirname, '../CountTime.json'), String(Number(uptime) + Time1), 'utf8');
    }
    else {
        var Time1 = 0;
        global.Fca.Require.fs.writeFileSync(join(__dirname, '../CountTime.json'), String(Number(uptime) + Time1), 'utf8');
    }
}
function parseDelta(defaultFuncs, api, ctx, globalCallback, v) {
    if (v.delta.class == "NewMessage") {
        //Not tested for pages
        if (ctx.globalOptions.pageID && ctx.globalOptions.pageID != v.queue) return;

        (function resolveAttachmentUrl(i) {
            if (v.delta.attachments && (i == v.delta.attachments.length) || utils.getType(v.delta.attachments) !== "Array") {
                var fmtMsg;
                try {
                    fmtMsg = utils.formatDeltaMessage(v);
                } catch (err) {
                    return log.error("Lỗi Nhẹ", err);
                }
                global.Fca.Data.event = fmtMsg;
                try {
                    var { updateMessageCount,getData,hasData } = require('../Extra/ExtraGetThread');
                    if (hasData(fmtMsg.threadID)) {
                        var x = getData(fmtMsg.threadID);
                        x.messageCount+=1;
                        updateMessageCount(fmtMsg.threadID,x);
                    }   
                }
                catch (e) {
                    //temp
                }
                if (fmtMsg)
                    if (ctx.globalOptions.autoMarkDelivery) markDelivery(ctx, api, fmtMsg.threadID, fmtMsg.messageID);

                return !ctx.globalOptions.selfListen && fmtMsg.senderID === ctx.userID ? undefined : (function () { globalCallback(null, fmtMsg); })();
            } else {
                if (v.delta.attachments && (v.delta.attachments[i].mercury.attach_type == "photo")) {
                    api.resolvePhotoUrl(v.delta.attachments[i].fbid, (err, url) => {
                        if (!err) v.delta.attachments[i].mercury.metadata.url = url;
                        return resolveAttachmentUrl(i + 1);
                    });
                } else return resolveAttachmentUrl(i + 1);
            }
        })(0);
    }

    if (v.delta.class == "ClientPayload") {
        var clientPayload = utils.decodeClientPayload(v.delta.payload);
        if (clientPayload && clientPayload.deltas) {
            for (var i in clientPayload.deltas) {
                var delta = clientPayload.deltas[i];
                if (delta.deltaMessageReaction && !!ctx.globalOptions.listenEvents) {
                    (function () {
                        globalCallback(null, {
                            type: "message_reaction",
                            threadID: (delta.deltaMessageReaction.threadKey.threadFbId ? delta.deltaMessageReaction.threadKey.threadFbId : delta.deltaMessageReaction.threadKey.otherUserFbId).toString(),
                            messageID: delta.deltaMessageReaction.messageId,
                            reaction: delta.deltaMessageReaction.reaction,
                            senderID: delta.deltaMessageReaction.senderId.toString(),
                            userID: delta.deltaMessageReaction.userId.toString()
                        });
                    })();
                } else if (delta.deltaRecallMessageData && !!ctx.globalOptions.listenEvents) {
                    (function () {
                        globalCallback(null, {
                            type: "message_unsend",
                            threadID: (delta.deltaRecallMessageData.threadKey.threadFbId ? delta.deltaRecallMessageData.threadKey.threadFbId : delta.deltaRecallMessageData.threadKey.otherUserFbId).toString(),
                            messageID: delta.deltaRecallMessageData.messageID,
                            senderID: delta.deltaRecallMessageData.senderID.toString(),
                            deletionTimestamp: delta.deltaRecallMessageData.deletionTimestamp,
                            timestamp: delta.deltaRecallMessageData.timestamp
                        });
                    })();
                } else if (delta.deltaMessageReply) {
                    //Mention block - #1
                    var mdata =
                        delta.deltaMessageReply.message === undefined ? [] :
                            delta.deltaMessageReply.message.data === undefined ? [] :
                                delta.deltaMessageReply.message.data.prng === undefined ? [] :
                                    JSON.parse(delta.deltaMessageReply.message.data.prng);
                    var m_id = mdata.map(u => u.i);
                    var m_offset = mdata.map(u => u.o);
                    var m_length = mdata.map(u => u.l);

                    var mentions = {};

                    for (var i = 0; i < m_id.length; i++) mentions[m_id[i]] = (delta.deltaMessageReply.message.body || "").substring(m_offset[i], m_offset[i] + m_length[i]);
                    //Mention block - 1#
                    var callbackToReturn = {
                        type: "message_reply",
                        threadID: (delta.deltaMessageReply.message.messageMetadata.threadKey.threadFbId ? delta.deltaMessageReply.message.messageMetadata.threadKey.threadFbId : delta.deltaMessageReply.message.messageMetadata.threadKey.otherUserFbId).toString(),
                        messageID: delta.deltaMessageReply.message.messageMetadata.messageId,
                        senderID: delta.deltaMessageReply.message.messageMetadata.actorFbId.toString(),
                        attachments: delta.deltaMessageReply.message.attachments.map(function (att) {
                            var mercury = JSON.parse(att.mercuryJSON);
                            Object.assign(att, mercury);
                            return att;
                        }).map(att => {
                            var x;
                            try {
                                x = utils._formatAttachment(att);
                            } catch (ex) {
                                x = att;
                                x.error = ex;
                                x.type = "unknown";
                            }
                            return x;
                        }),
                        args: (delta.deltaMessageReply.message.body || "").trim().split(/\s+/),
                        body: (delta.deltaMessageReply.message.body || ""),
                        isGroup: !!delta.deltaMessageReply.message.messageMetadata.threadKey.threadFbId,
                        mentions: mentions,
                        timestamp: delta.deltaMessageReply.message.messageMetadata.timestamp,
                        participantIDs: (delta.deltaMessageReply.message.participants || []).map(e => e.toString())
                    };

                    if (delta.deltaMessageReply.repliedToMessage) {
                        //Mention block - #2
                        mdata =
                            delta.deltaMessageReply.repliedToMessage === undefined ? [] :
                                delta.deltaMessageReply.repliedToMessage.data === undefined ? [] :
                                    delta.deltaMessageReply.repliedToMessage.data.prng === undefined ? [] :
                                        JSON.parse(delta.deltaMessageReply.repliedToMessage.data.prng);
                        m_id = mdata.map(u => u.i);
                        m_offset = mdata.map(u => u.o);
                        m_length = mdata.map(u => u.l);

                        var rmentions = {};

                        for (var i = 0; i < m_id.length; i++) rmentions[m_id[i]] = (delta.deltaMessageReply.repliedToMessage.body || "").substring(m_offset[i], m_offset[i] + m_length[i]);
                        //Mention block - 2#
                        callbackToReturn.messageReply = {
                            threadID: (delta.deltaMessageReply.repliedToMessage.messageMetadata.threadKey.threadFbId ? delta.deltaMessageReply.repliedToMessage.messageMetadata.threadKey.threadFbId : delta.deltaMessageReply.repliedToMessage.messageMetadata.threadKey.otherUserFbId).toString(),
                            messageID: delta.deltaMessageReply.repliedToMessage.messageMetadata.messageId,
                            senderID: delta.deltaMessageReply.repliedToMessage.messageMetadata.actorFbId.toString(),
                            attachments: delta.deltaMessageReply.repliedToMessage.attachments.map(function (att) {
                                var mercury = JSON.parse(att.mercuryJSON);
                                Object.assign(att, mercury);
                                return att;
                            }).map(att => {
                                var x;
                                try {
                                    x = utils._formatAttachment(att);
                                } catch (ex) {
                                    x = att;
                                    x.error = ex;
                                    x.type = "unknown";
                                }
                                return x;
                            }),
                            args: (delta.deltaMessageReply.repliedToMessage.body || "").trim().split(/\s+/),
                            body: delta.deltaMessageReply.repliedToMessage.body || "",
                            isGroup: !!delta.deltaMessageReply.repliedToMessage.messageMetadata.threadKey.threadFbId,
                            mentions: rmentions,
                            timestamp: delta.deltaMessageReply.repliedToMessage.messageMetadata.timestamp,
                            participantIDs: (delta.deltaMessageReply.repliedToMessage.participants || []).map(e => e.toString())
                        };
                    } else if (delta.deltaMessageReply.replyToMessageId) {
                        return defaultFuncs
                            .post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, {
                                "av": ctx.globalOptions.pageID,
                                "queries": JSON.stringify({
                                    "o0": {
                                        //Using the same doc_id as forcedFetch
                                        "doc_id": "2848441488556444",
                                        "query_params": {
                                            "thread_and_message_id": {
                                                "thread_id": callbackToReturn.threadID,
                                                "message_id": delta.deltaMessageReply.replyToMessageId.id,
                                            }
                                        }
                                    }
                                })
                            })
                            .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
                            .then((resData) => {
                                if (resData[resData.length - 1].error_results > 0) throw resData[0].o0.errors;
                                if (resData[resData.length - 1].successful_results === 0) throw { error: "forcedFetch: there was no successful_results", res: resData };
                                var fetchData = resData[0].o0.data.message;
                                var mobj = {};
                                for (var n in fetchData.message.ranges) mobj[fetchData.message.ranges[n].entity.id] = (fetchData.message.text || "").substr(fetchData.message.ranges[n].offset, fetchData.message.ranges[n].length);

                                callbackToReturn.messageReply = {
                                    type: "Message",
                                    threadID: callbackToReturn.threadID,
                                    messageID: fetchData.message_id,
                                    senderID: fetchData.message_sender.id.toString(),
                                    attachments: fetchData.message.blob_attachment.map(att => {
                                        var x;
                                        try {
                                            x = utils._formatAttachment({ blob_attachment: att });
                                        } catch (ex) {
                                            x = att;
                                            x.error = ex;
                                            x.type = "unknown";
                                        }
                                        return x;
                                    }),
                                    args: (fetchData.message.text || "").trim().split(/\s+/) || [],
                                    body: fetchData.message.text || "",
                                    isGroup: callbackToReturn.isGroup,
                                    mentions: mobj,
                                    timestamp: parseInt(fetchData.timestamp_precise)
                                };
                            })
                            .catch(err => log.error("forcedFetch", err))
                            .finally(function () {
                                if (ctx.globalOptions.autoMarkDelivery) markDelivery(ctx, api, callbackToReturn.threadID, callbackToReturn.messageID);
                                !ctx.globalOptions.selfListen && callbackToReturn.senderID === ctx.userID ? undefined : (function () { globalCallback(null, callbackToReturn); })();
                            });
                    } else callbackToReturn.delta = delta;
            
                    if (ctx.globalOptions.autoMarkDelivery) markDelivery(ctx, api, callbackToReturn.threadID, callbackToReturn.messageID);

                    return !ctx.globalOptions.selfListen && callbackToReturn.senderID === ctx.userID ? undefined : (function () { globalCallback(null, callbackToReturn); })();
                }
            }
            return;
        }
    }
    switch (v.delta.class) {
        case "ReadReceipt": {
            var fmtMsg;
            try {
                fmtMsg = utils.formatDeltaReadReceipt(v.delta);
            } catch (err) {
                return log.error("Lỗi Nhẹ", err);
            }
            return (function () { globalCallback(null, fmtMsg); })();
        }
        case "AdminTextMessage": {
            switch (v.delta.type) {
                case "joinable_group_link_mode_change":
                case "magic_words":
                case "pin_messages_v2":
                case "change_thread_theme":
                case "change_thread_icon":
                case "change_thread_nickname":
                case "change_thread_admins":
                case "change_thread_approval_mode":
                case "group_poll":
                case "messenger_call_log":
                case "participant_joined_group_call":
                    var fmtMsg;
                    try {
                        fmtMsg = utils.formatDeltaEvent(v.delta);
                    } catch (err) {
                        console.log(v.delta);
                        return log.error("Lỗi Nhẹ", err);
                    }
                    return (function () { globalCallback(null, fmtMsg); })();
                }
            break;
        }
        //For group images
        case "ForcedFetch": {
            if (!v.delta.threadKey) return;
            var mid = v.delta.messageId;
            var tid = v.delta.threadKey.threadFbId;
            if (mid && tid) {
                const form = {
                    "av": ctx.globalOptions.pageID,
                    "queries": JSON.stringify({
                        "o0": {
                            //This doc_id is valid as of March 25, 2020
                            "doc_id": "2848441488556444",
                            "query_params": {
                                "thread_and_message_id": {
                                    "thread_id": tid.toString(),
                                    "message_id": mid,
                                }
                            }
                        }
                    })
                };

                defaultFuncs
                    .post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, form)
                    .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
                    .then((resData) => {
                        if (resData[resData.length - 1].error_results > 0) throw resData[0].o0.errors;

                        if (resData[resData.length - 1].successful_results === 0) throw { error: "forcedFetch: there was no successful_results", res: resData };

                        var fetchData = resData[0].o0.data.message;

                        if (utils.getType(fetchData) == "Object") {
                            log.info("forcedFetch", fetchData);
                            switch (fetchData.__typename) {
                                case "ThreadImageMessage":
                                    (!ctx.globalOptions.selfListen &&
                                        fetchData.message_sender.id.toString() === ctx.userID) ||
                                        !ctx.loggedIn ?
                                        undefined :
                                        (function () {
                                            globalCallback(null, {
                                                type: "change_thread_image",
                                                threadID: utils.formatID(tid.toString()),
                                                snippet: fetchData.snippet,
                                                timestamp: fetchData.timestamp_precise,
                                                author: fetchData.message_sender.id,
                                                image: {
                                                    attachmentID: fetchData.image_with_metadata && fetchData.image_with_metadata.legacy_attachment_id,
                                                    width: fetchData.image_with_metadata && fetchData.image_with_metadata.original_dimensions.x,
                                                    height: fetchData.image_with_metadata && fetchData.image_with_metadata.original_dimensions.y,
                                                    url: fetchData.image_with_metadata && fetchData.image_with_metadata.preview.uri
                                                }
                                            });
                                        })();
                                    break;
                                case "UserMessage":
                                    log.info("ff-Return", {
                                        type: "message",
                                        senderID: utils.formatID(fetchData.message_sender.id),
                                        body: fetchData.message.text || "",
                                        threadID: utils.formatID(tid.toString()),
                                        messageID: fetchData.message_id,
                                        attachments: [{
                                            type: "share",
                                            ID: fetchData.extensible_attachment.legacy_attachment_id,
                                            url: fetchData.extensible_attachment.story_attachment.url,

                                            title: fetchData.extensible_attachment.story_attachment.title_with_entities.text,
                                            description: fetchData.extensible_attachment.story_attachment.description.text,
                                            source: fetchData.extensible_attachment.story_attachment.source,

                                            image: ((fetchData.extensible_attachment.story_attachment.media || {}).image || {}).uri,
                                            width: ((fetchData.extensible_attachment.story_attachment.media || {}).image || {}).width,
                                            height: ((fetchData.extensible_attachment.story_attachment.media || {}).image || {}).height,
                                            playable: (fetchData.extensible_attachment.story_attachment.media || {}).is_playable || false,
                                            duration: (fetchData.extensible_attachment.story_attachment.media || {}).playable_duration_in_ms || 0,

                                            subattachments: fetchData.extensible_attachment.subattachments,
                                            properties: fetchData.extensible_attachment.story_attachment.properties,
                                        }],
                                        mentions: {},
                                        timestamp: parseInt(fetchData.timestamp_precise),
                                        isGroup: (fetchData.message_sender.id != tid.toString())
                                    });
                                    globalCallback(null, {
                                        type: "message",
                                        senderID: utils.formatID(fetchData.message_sender.id),
                                        body: fetchData.message.text || "",
                                        threadID: utils.formatID(tid.toString()),
                                        messageID: fetchData.message_id,
                                        attachments: [{
                                            type: "share",
                                            ID: fetchData.extensible_attachment.legacy_attachment_id,
                                            url: fetchData.extensible_attachment.story_attachment.url,

                                            title: fetchData.extensible_attachment.story_attachment.title_with_entities.text,
                                            description: fetchData.extensible_attachment.story_attachment.description.text,
                                            source: fetchData.extensible_attachment.story_attachment.source,

                                            image: ((fetchData.extensible_attachment.story_attachment.media || {}).image || {}).uri,
                                            width: ((fetchData.extensible_attachment.story_attachment.media || {}).image || {}).width,
                                            height: ((fetchData.extensible_attachment.story_attachment.media || {}).image || {}).height,
                                            playable: (fetchData.extensible_attachment.story_attachment.media || {}).is_playable || false,
                                            duration: (fetchData.extensible_attachment.story_attachment.media || {}).playable_duration_in_ms || 0,

                                            subattachments: fetchData.extensible_attachment.subattachments,
                                            properties: fetchData.extensible_attachment.story_attachment.properties,
                                        }],
                                        mentions: {},
                                        timestamp: parseInt(fetchData.timestamp_precise),
                                        isGroup: (fetchData.message_sender.id != tid.toString())
                                    });
                            }
                        } else log.error("forcedFetch", fetchData);
                    })
                    .catch((err) => log.error("forcedFetch", err));
                }
            }
            break;
        case "ThreadName":
        case "ParticipantsAddedToGroupThread":
        case "ParticipantLeftGroupThread": {
            var formattedEvent;
            try {
                formattedEvent = utils.formatDeltaEvent(v.delta);
            } catch (err) {
                console.log(err);
                return log.error("Lỗi Nhẹ", err);
            }
            return (!ctx.globalOptions.selfListen && formattedEvent.author.toString() === ctx.userID) || !ctx.loggedIn ? undefined : (function () { globalCallback(null, formattedEvent); })();
        }
        case "NewMessage": {
            if (v.delta.attachments != undefined && v.delta.attachments.length == 1 && v.delta.attachments[0].mercury.extensible_attachment != undefined && v.delta.attachments[0].mercury.extensible_attachment.story_attachment.style_list.includes("message_live_location")) {
                v.delta.class = "UserLocation";
                var fmtMsg;
                try {
                    fmtMsg = utils.formatDeltaEvent(v.delta);
                } catch (err) {
                    console.log(v.delta);
                    return log.error("Lỗi Nhẹ", err);
                }
                return (function () { globalCallback(null, fmtMsg); })();
            }
        }
        break;
    }
}


function markDelivery(ctx, api, threadID, messageID) {
    if (threadID && messageID) {
        api.markAsDelivered(threadID, messageID, (err) => {
            if (err) log.error("markAsDelivered", err);
            else {
                if (ctx.globalOptions.autoMarkRead) {
                    api.markAsRead(threadID, (err) => {
                        if (err) log.error("markAsDelivered", err);
                    });
                }
            }
        });
    }
}

module.exports = function (defaultFuncs, api, ctx) {
    var globalCallback = identity;
    getSeqID = function getSeqID() {
        ctx.t_mqttCalled = false;
        defaultFuncs
            .post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, form)
            .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
            .then((resData) => {
                if (utils.getType(resData) != "Array") {
                    if (global.Fca.Require.FastConfig.AutoLogin) {
                        return global.Fca.Require.logger.Warning(global.Fca.Require.Language.Index.AutoLogin, function() {
                            return global.Fca.Action('AutoLogin');
                        });
                    }
                    else if (!global.Fca.Require.FastConfig.AutoLogin) {
                        return global.Fca.Require.logger.Error(global.Fca.Require.Language.Index.ErrAppState);
                    }
                    return;
                }
                else {
                    if (resData && resData[resData.length - 1].error_results > 0) throw resData[0].o0.errors;
                    if (resData[resData.length - 1].successful_results === 0) throw { error: "getSeqId: there was no successful_results", res: resData };
                    if (resData[0].o0.data.viewer.message_threads.sync_sequence_id) {
                        ctx.lastSeqId = resData[0].o0.data.viewer.message_threads.sync_sequence_id;
                        listenMqtt(defaultFuncs, api, ctx, globalCallback);
                    } 
                    else throw { error: "getSeqId: no sync_sequence_id found.", res: resData };
                }
            })
            .catch((err) => {
                log.error("getSeqId", err);
                if (utils.getType(err) == "Object" && err.error === global.Fca.Require.Language.Index.ErrAppState) ctx.loggedIn = false;
                return globalCallback(err);
            });
    };

    return function (callback) {
        class MessageEmitter extends EventEmitter {
            stopListening(callback) {
                callback = callback || (() => { });
                globalCallback = identity;
                if (ctx.mqttClient) {
                    ctx.mqttClient.unsubscribe("/webrtc");
                    ctx.mqttClient.unsubscribe("/rtc_multi");
                    ctx.mqttClient.unsubscribe("/onevc");
                    ctx.mqttClient.publish("/browser_close", "{}");
                    ctx.mqttClient.end(false, function (...data) {
                        ctx.mqttClient = undefined;
                    });
                }
                global.Fca.Data.StopListening = true;
            }
        }

        var msgEmitter = new MessageEmitter();
        globalCallback = (callback || function (error, message) {
            if (error) return msgEmitter.emit("error", error);
            msgEmitter.emit("message", message);
        });

        //Reset some stuff
        if (!ctx.firstListen) ctx.lastSeqId = null;
        ctx.syncToken = undefined;
        ctx.t_mqttCalled = false;

        //Same request as getThreadList
        form = {
            "av": ctx.globalOptions.pageID,
            "queries": JSON.stringify({
                "o0": {
                    "doc_id": "3336396659757871",
                    "query_params": {
                        "limit": 1,
                        "before": null,
                        "tags": ["INBOX"],
                        "includeDeliveryReceipts": false,
                        "includeSeqID": true
                    }
                }
            })
        };

        if (!ctx.firstListen || !ctx.lastSeqId) getSeqID();
        else listenMqtt(defaultFuncs, api, ctx, globalCallback);
        ctx.firstListen = false;
        return msgEmitter;
    };
};