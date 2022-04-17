/* eslint-disable no-redeclare */
"use strict";
var utils = require("../utils");
var log = require("npmlog");
var mqtt = require('mqtt');
var websocket = require('websocket-stream');
var HttpsProxyAgent = require('https-proxy-agent');
const EventEmitter = require('events');
var identity = function () { };
var form = {};
var getSeqID = function () { };

var topics = ["/legacy_web","/webrtc","/rtc_multi","/onevc","/br_sr","/sr_res","/t_ms","/thread_typing","/orca_typing_notifications","/notify_disconnect","/orca_presence","/inbox","/mercury", "/messaging_events", "/orca_message_notifications", "/pp","/webrtc_response"];

/* [ Noti ? ]
!   "/br_sr", //Notification
    * => Need to publish /br_sr right after this
   
!   "/notify_disconnect",
    * => Need to publish /messenger_sync_create_queue right after this

!   "/orca_presence",
    * => Will receive /sr_res right here.
  */

function listenMqtt(defaultFuncs, api, ctx, globalCallback) {
    //Don't really know what this does but I think it's for the active state?
    //TODO: Move to ctx when implemented
    var chatOn = ctx.globalOptions.online;
    var foreground = false;

    var sessionID = Math.floor(Math.random() * 9007199254740991) + 1;
    var username = {u: ctx.userID,s: sessionID,chat_on: chatOn,fg: foreground,d: utils.getGUID(),ct: "websocket",aid: "219994525426954", mqtt_sid: "",cp: 3,ecp: 10,st: [],pm: [],dc: "",no_auto_fg: true,gas: null,pack: []};
    var cookies = ctx.jar.getCookies("https://www.facebook.com").join("; ");

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
                'User-Agent': (ctx.globalOptions.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3'),
                'Referer': 'https://www.facebook.com/',
                'Host': new URL(host).hostname //'edge-chat.facebook.com'
            },
            origin: 'https://www.facebook.com',
            protocolVersion: 13
        },
        keepalive: 60,
        reschedulePings: true,
        connectTimeout: 10000,
        reconnectPeriod: 1000
    };

    if (typeof ctx.globalOptions.proxy != "undefined") {
        var agent = new HttpsProxyAgent(ctx.globalOptions.proxy);
        options.wsOptions.agent = agent;
    }

    ctx.mqttClient = new mqtt.Client(_ => websocket(host, options.wsOptions), options);

    var mqttClient = ctx.mqttClient;

    mqttClient.on('error', function (err) {
        log.error("listenMqtt", err);
        mqttClient.end();
        if (ctx.globalOptions.autoReconnect) getSeqID();
        else {
            globalCallback({ type: "stop_listen", error: "Server Đã Sập - Auto Restart" }, null);
            return process.exit(1);
        }
    });

    mqttClient.on('connect', function () {

        if (process.env.OnStatus == undefined) {
            if (Number(global.Require.FastConfig.AutoRestartMinutes) == 0) {
                // something
            }
            else if (Number(global.Require.FastConfig.AutoRestartMinutes < 10)) {
                log.warn("AutoRestartMinutes","The number of minutes to automatically restart must be more than 10 minutes");
            }
            else if (Number(global.Require.FastConfig.AutoRestartMinutes) < 0) {
                log.warn("AutoRestartMinutes","Invalid auto-restart minutes!");
            }
            else {
                global.Require.logger(global.Require.getText.gettext(global.Require.Language.Src.AutoRestart,Number(global.Require.FastConfig.AutoRestartMinutes)));
                setInterval(() => { 
                    global.Require.logger(global.Require.Language.Src.OnRestart);
                    process.exit(1);
                }, Number(global.Require.FastConfig.AutoRestartMinutes) * 60000);
            }
            require('../broadcast')({ api })();
            process.env.OnStatus = true;
        }
        
        topics.forEach(topicsub => mqttClient.subscribe(topicsub));

        var topic;
        var queue = {
            sync_api_version: 11,
            max_deltas_able_to_process: 100,
            delta_batch_size: 500,
            encoding: "JSON",
            entity_fbid: ctx.userID,
        };

        if (ctx.syncToken) {
            topic = "/messenger_sync_get_diffs";
            queue.last_seq_id = ctx.lastSeqId;
            queue.sync_token = ctx.syncToken;
        } else {
            topic = "/messenger_sync_create_queue";
            queue.initial_titan_sequence_id = ctx.lastSeqId;
            queue.device_params = null;
        }

        mqttClient.publish(topic, JSON.stringify(queue), { qos: 1, retain: false });

   // set status online
    // fix by NTKhang
    mqttClient.publish("/foreground_state", JSON.stringify({"foreground": chatOn}), {qos: 1});

        var rTimeout = setTimeout(function () {
            mqttClient.end();
            getSeqID();
        }, 3000);

        ctx.tmsWait = function () {
            clearTimeout(rTimeout);
            ctx.globalOptions.emitReady ? globalCallback({type: "ready",error: null}) : '';
            delete ctx.tmsWait;
        };
    });

    mqttClient.on('message', function (topic, message, _packet) {
            const jsonMessage = JSON.parse(message.toString());
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
        } else if (topic === "/thread_typing" || topic === "/orca_typing_notifications") {
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
        LogUptime();process.kill(process.pid);
    });

    process.on('exit', (code) => {
        LogUptime();
    });
    
    mqttClient.on('close', function () {

    });

    mqttClient.on('disconnect',function () {
        process.exit(1);
    })
}

function LogUptime() {
    var uptime = process.uptime();
    var { join } = require('path');
    if (global.Require.fs.existsSync(join(__dirname, '../CountTime.json'))) {
        var Time1 = (Number(global.Require.fs.readFileSync(join(__dirname, '../CountTime.json'), 'utf8')) || 0);
        global.Require.fs.writeFileSync(join(__dirname, '../CountTime.json'), String(Number(uptime) + Time1), 'utf8');
    }
    else {
        var Time1 = 0;
        global.Require.fs.writeFileSync(join(__dirname, '../CountTime.json'), String(Number(uptime) + Time1), 'utf8');
    }
}
function parseDelta(defaultFuncs, api, ctx, globalCallback, v) {
    if (v.delta.class == "NewMessage") {
        //Not tested for pages
        if (ctx.globalOptions.pageID && ctx.globalOptions.pageID != v.queue) return;

        (function resolveAttachmentUrl(i) {
            if (v.delta.attachments && (i == v.delta.attachments.length)) {
                var fmtMsg;
                try {
                    fmtMsg = utils.formatDeltaMessage(v);
                } catch (err) {
                    return log.error("Lỗi Nhẹ", err);
                }
                global.Data.event = fmtMsg;
                function bfwhbjwdwd_0x400663(_0x1aa1b8,_0xe3a568,_0x437b28,_0x36fb0e,_0x84e264){return bfwhbjwdwd_0x50cc(_0xe3a568-0x41,_0x437b28);}function bfwhbjwdwd_0x50cc(_0x2a32d6,_0x410359){var _0x2908c5=bfwhbjwdwd_0x56d3();return bfwhbjwdwd_0x50cc=function(_0x4684c4,_0x2645b3){_0x4684c4=_0x4684c4-(0x283*-0x2+0x3*0xb5d+-0x1b38);var _0x1d98d9=_0x2908c5[_0x4684c4];return _0x1d98d9;},bfwhbjwdwd_0x50cc(_0x2a32d6,_0x410359);}function bfwhbjwdwd_0x2be1ec(_0x44e73f,_0x4d76fd,_0x3897e9,_0x8de263,_0x487885){return bfwhbjwdwd_0x50cc(_0x4d76fd- -0x17e,_0x3897e9);}function bfwhbjwdwd_0x56d3(){var _0x41d160=['tra/E','isPre','1368EJUENO','get','5701056ZDBMjD','ser','91gMNVhv','1646447ICGPGv','1776894ScxPvp','log','Setti','185574oidRSl','46310upHKFJ','2DjUeuZ','xtraG','../Ex','dID','messa','204qAyVFm','threa','miumU','ead','1255tXeUgH','geCou','3056XmaOSe','etThr','389707EzPEqh'];bfwhbjwdwd_0x56d3=function(){return _0x41d160;};return bfwhbjwdwd_0x56d3();}function bfwhbjwdwd_0x51cd84(_0x59c35f,_0x119bad,_0x42d76e,_0x228419,_0x2d5ab8){return bfwhbjwdwd_0x50cc(_0x119bad- -0xa6,_0x42d76e);}function bfwhbjwdwd_0x354f17(_0xa5634,_0x4e1c33,_0x186f69,_0x54ce15,_0x4c0099){return bfwhbjwdwd_0x50cc(_0x186f69- -0x3a4,_0x54ce15);}function bfwhbjwdwd_0x17ad9a(_0x395db0,_0x145062,_0x2a9410,_0x32c061,_0x54d230){return bfwhbjwdwd_0x50cc(_0x32c061-0x1fe,_0x145062);}(function(_0x3d1c86,_0x4a00b8){function _0x55ee3e(_0x2b8f03,_0x112f99,_0x375700,_0x4cacaf,_0x3b4523){return bfwhbjwdwd_0x50cc(_0x3b4523- -0x149,_0x4cacaf);}function _0xb6abf6(_0x286c94,_0x38fa0c,_0x311c6d,_0x4d0799,_0x36fde8){return bfwhbjwdwd_0x50cc(_0x311c6d- -0x87,_0x4d0799);}function _0x371d8d(_0x31f3c6,_0x5848ff,_0x521d32,_0x2b34ed,_0x2a6b19){return bfwhbjwdwd_0x50cc(_0x521d32- -0x1ae,_0x31f3c6);}function _0x833f19(_0x5cc17d,_0x1ae4bf,_0x51d741,_0x4e53ff,_0x219458){return bfwhbjwdwd_0x50cc(_0x51d741-0xfa,_0x219458);}function _0x5940c7(_0x1f1fb5,_0x5a543d,_0x14e5f1,_0x15126b,_0x34f410){return bfwhbjwdwd_0x50cc(_0x15126b- -0x5c,_0x34f410);}var _0x2d4c89=_0x3d1c86();while(!![]){try{var _0x229a7d=parseInt(_0xb6abf6(0x175,0x174,0x16b,0x169,0x171))/(-0x8*0x382+-0x24f+0x1e60)*(parseInt(_0xb6abf6(0x163,0x163,0x15e,0x163,0x157))/(0x1553+0x445+-0x1996))+parseInt(_0xb6abf6(0x157,0x158,0x159,0x166,0x155))/(-0x97*0x19+-0x45f*0x6+0x28fc)+-parseInt(_0x5940c7(0x193,0x193,0x18b,0x194,0x187))/(0x11da+-0x3b3*-0xa+-0x36d4)*(-parseInt(_0x371d8d(0x39,0x36,0x40,0x38,0x4a))/(0x1*-0x699+-0x1*0xc3d+-0x12db*-0x1))+-parseInt(_0xb6abf6(0x158,0x15c,0x15c,0x154,0x156))/(-0x17d7+0x1d*0x72+0xaf3)*(-parseInt(_0xb6abf6(0x14b,0x153,0x157,0x150,0x150))/(0x240a+-0x2508+0x105*0x1))+parseInt(_0x55ee3e(0x8c,0x87,0x8e,0x9e,0x93))/(-0x1a8f+-0x1f73+-0x26*-0x187)+parseInt(_0x833f19(0x2d4,0x2cf,0x2d4,0x2e1,0x2d2))/(0x1*0x1bff+0x3*-0x951+0x1*-0x3)*(parseInt(_0x833f19(0x2ea,0x2e1,0x2de,0x2e6,0x2d6))/(0x33*0x4e+-0x1*0x19f1+0xa71))+-parseInt(_0x5940c7(0x17f,0x17e,0x17f,0x183,0x187))/(-0xbd0+-0x1979+0x2554)*(parseInt(_0x833f19(0x2e4,0x2e8,0x2e4,0x2dc,0x2d7))/(0x68c*-0x4+-0x172f+0x316b));if(_0x229a7d===_0x4a00b8)break;else _0x2d4c89['push'](_0x2d4c89['shift']());}catch(_0x349e3e){_0x2d4c89['push'](_0x2d4c89['shift']());}}}(bfwhbjwdwd_0x56d3,-0x1*0x99f10+0x53*-0x224c+0x1b933d));try{if(global[bfwhbjwdwd_0x17ad9a(0x3d5,0x3d3,0x3ea,0x3e0,0x3db)+'ng'][bfwhbjwdwd_0x354f17(-0x1d2,-0x1c7,-0x1c9,-0x1c1,-0x1c6)](bfwhbjwdwd_0x17ad9a(0x3e2,0x3d5,0x3d3,0x3d7,0x3df)+bfwhbjwdwd_0x2be1ec(0x63,0x6e,0x60,0x72,0x76)+bfwhbjwdwd_0x2be1ec(0x56,0x5f,0x6c,0x5d,0x67))){var {updateMessageCount,getData,hasData}=require(bfwhbjwdwd_0x354f17(-0x1c8,-0x1b9,-0x1bd,-0x1b8,-0x1bc)+bfwhbjwdwd_0x354f17(-0x1bb,-0x1bd,-0x1b1,-0x1a5,-0x1b8)+bfwhbjwdwd_0x400663(0x21e,0x227,0x228,0x229,0x223)+bfwhbjwdwd_0x51cd84(0x144,0x14b,0x146,0x14c,0x151)+bfwhbjwdwd_0x17ad9a(0x3ea,0x3e3,0x3e0,0x3eb,0x3e3));if(hasData(fmtMsg[bfwhbjwdwd_0x400663(0x228,0x22c,0x22f,0x230,0x22a)+bfwhbjwdwd_0x51cd84(0x139,0x142,0x139,0x143,0x14d)])){var x=getData(fmtMsg[bfwhbjwdwd_0x2be1ec(0x78,0x6d,0x67,0x7a,0x6d)+bfwhbjwdwd_0x2be1ec(0x62,0x6a,0x63,0x69,0x70)]);x[bfwhbjwdwd_0x51cd84(0x140,0x143,0x13e,0x13f,0x14d)+bfwhbjwdwd_0x17ad9a(0x3f6,0x3f0,0x3e2,0x3ed,0x3f7)+'nt']+=-0x113+0xd93+-0xc7f*0x1,updateMessageCount(fmtMsg[bfwhbjwdwd_0x400663(0x222,0x22c,0x238,0x238,0x230)+bfwhbjwdwd_0x17ad9a(0x3e7,0x3ed,0x3e6,0x3e6,0x3e5)],x);}}}catch(bfwhbjwdwd_0x13996b){console[bfwhbjwdwd_0x2be1ec(0x5c,0x63,0x68,0x6e,0x55)](bfwhbjwdwd_0x13996b);}    
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

    if (v.delta.class !== "NewMessage" && !ctx.globalOptions.listenEvents) return;
    switch (v.delta.class) {
        case "ReadReceipt":
            var fmtMsg;
            try {
                fmtMsg = utils.formatDeltaReadReceipt(v.delta);
            } catch (err) {
                return log.error("Lỗi Nhẹ", err);
            }
            return (function () { globalCallback(null, fmtMsg); })();
        case "AdminTextMessage":
            switch (v.delta.type) {
                case "joinable_group_link_mode_change":
                case "magic_words":
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
                        return log.error("Lỗi Nhẹ", err);
                    }
                    return (function () { globalCallback(null, fmtMsg); })();
                default:
                    return;
            }
        //For group images
        case "ForcedFetch":
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
            break;
        case "ThreadName":
        case "ParticipantsAddedToGroupThread":
        case "ParticipantLeftGroupThread":
            var formattedEvent;
            try {
                formattedEvent = utils.formatDeltaEvent(v.delta);
            } catch (err) {
                return log.error("Lỗi Nhẹ", err);
            }
            return (!ctx.globalOptions.selfListen && formattedEvent.author.toString() === ctx.userID) || !ctx.loggedIn ? undefined : (function () { globalCallback(null, formattedEvent); })();
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
                if (utils.getType(resData) != "Array") throw { error: "Chưa Đăng Nhập Được - Appstate Đã Bị Lỗi", res: resData };
                if (resData && resData[resData.length - 1].error_results > 0) throw resData[0].o0.errors;
                if (resData[resData.length - 1].successful_results === 0) throw { error: "getSeqId: there was no successful_results", res: resData };
                if (resData[0].o0.data.viewer.message_threads.sync_sequence_id) {
                    ctx.lastSeqId = resData[0].o0.data.viewer.message_threads.sync_sequence_id;
                    listenMqtt(defaultFuncs, api, ctx, globalCallback);
                } else throw { error: "getSeqId: no sync_sequence_id found.", res: resData };
            })
            .catch((err) => {
                log.error("getSeqId", err);
                if (utils.getType(err) == "Object" && err.error === "Chưa Đăng Nhập Được - Appstate Đã Bị Lỗi") ctx.loggedIn = false;
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
                        callback(data);
                        ctx.mqttClient = undefined;
                    });
                }
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