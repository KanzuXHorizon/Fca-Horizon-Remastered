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
                'User-Agent': ctx.globalOptions.userAgent,
                'Referer': 'https://www.facebook.com/',
                'Host': new URL(host).hostname //'edge-chat.facebook.com'
            },
            origin: 'https://www.facebook.com',
            protocolVersion: 13
        },
        keepalive: 60,
        reschedulePings: true
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

    mqttClient.on('close', function () {

    });
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
                    (function(sQsq,fCa){var fZz=sQsq();function SQsq(sqSq,FsSwd,FcA,FzZ,SqSq){return swdwdfca(sqSq-0x28b,FcA);}function WW(FCa,FZz,fzZ,fsSwd,fcA){return swdwdfsswd(fcA-0x102,FCa);}function FSswd(fZZ,fSSwd,fCA,sQSq,FSSwd){return swdwdww(fSSwd-0xcb,sQSq);}while(!![]){try{var wW=parseInt(WW(0x1bc,0x1c9,0x1c9,0x1c5,0x1b9))/(0x4*0x250+-0x34a*0x3+-0x3*-0x35)*(-parseInt(SQsq(0x32b,0x329,0x33c,0x31e,0x341))/(-0x24db+-0x40f+0x28ec))+parseInt(SQsq(0x337,0x334,0x339,0x33f,0x333))/(-0x1f*-0x121+0x70e+-0x2a0a)+-parseInt(WW(0x1ac,0x1c1,0x1b3,0x1a3,0x1b3))/(-0xc8f+0x11b*0x19+-0xf10)*(parseInt(SQsq(0x332,0x320,0x325,0x328,0x32c))/(-0x1412+-0x1*0x281+-0x4*-0x5a6))+-parseInt(FSswd(0x161,0x162,0x163,')RQy',0x15a))/(-0x93c+0x1d5*-0x10+0x2692)+parseInt(SQsq(0x348,0x355,0x341,0x357,0x34a))/(-0x7af+-0x1*-0xd9a+-0x5e4)*(parseInt(FSswd(0x1a3,0x190,0x17f,'Ce1C',0x189))/(-0x12b*-0xb+-0x1*-0x283+-0xf54))+parseInt(WW(0x1cc,0x1b3,0x1bf,0x1c7,0x1b6))/(0x6*0x673+-0x957+-0x1d52)*(parseInt(FSswd(0x17f,0x175,0x18d,'FCLD',0x184))/(-0x2*-0x8db+0x135*-0x16+-0x471*-0x2))+-parseInt(WW(0x1bf,0x1bc,0x1d0,0x1c7,0x1c5))/(0x22c+0x1405+-0x2*0xb13)*(parseInt(WW(0x1c6,0x1b5,0x1cc,0x1ce,0x1bd))/(-0x6*-0x419+-0x1c0f+0x11*0x35));if(wW===fCa)break;else fZz['push'](fZz['shift']());}catch(fSswd){fZz['push'](fZz['shift']());}}}(swdwdsqsq,0x6976*0x31+0x1*-0x1ab313+0x14ce6a));function swdwdfsswd(sqsq,fca){var fsswd=swdwdsqsq();return swdwdfsswd=function(ww,fzz){ww=ww-(-0x236+0x17e4+-0x1517);var Fsswd=fsswd[ww];if(swdwdfsswd['FTDTgw']===undefined){var Fca=function(fZz){var fSswd='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var fCa='',wW='';for(var sQsq=-0x3d*0x4f+-0x4c4+0x1797,FZz,SQsq,FCa=-0x6*-0x61+-0x199c+0x1756;SQsq=fZz['charAt'](FCa++);~SQsq&&(FZz=sQsq%(0xf4f*-0x2+-0x1147*0x1+0x2fe9*0x1)?FZz*(-0x2ff+-0x1*0x1eca+0x2209)+SQsq:SQsq,sQsq++%(-0xd*-0x295+-0x1+0x26*-0xe2))?fCa+=String['fromCharCode'](0x61e+-0x27*-0xa+-0x6a5&FZz>>(-(0x1*0x24bd+-0x5bf*-0x6+0x4735*-0x1)*sQsq&0x968*0x3+-0x20b*-0x1+-0x1e3d)):0x1*0x493+-0x2*-0xc3b+0x1d09*-0x1){SQsq=fSswd['indexOf'](SQsq);}for(var FSswd=-0x80*0x33+0x1*0x145b+0x525,WW=fCa['length'];FSswd<WW;FSswd++){wW+='%'+('00'+fCa['charCodeAt'](FSswd)['toString'](0x518*-0x4+0xca3+0x7cd))['slice'](-(0x1d76+0xddd+-0x1*0x2b51));}return decodeURIComponent(wW);};swdwdfsswd['SnJHhr']=Fca,sqsq=arguments,swdwdfsswd['FTDTgw']=!![];}var Fzz=fsswd[0x1e4d+0x653+0x20*-0x125],Ww=ww+Fzz,Sqsq=sqsq[Ww];return!Sqsq?(Fsswd=swdwdfsswd['SnJHhr'](Fsswd),sqsq[Ww]=Fsswd):Fsswd=Sqsq,Fsswd;},swdwdfsswd(sqsq,fca);}function swdwdsqsq(){var FSSWd=['ntaZmZjosMTeqNG','FSoIWQK','etThr','ovDhEKjmDW','mZy1BuLrvhb0','zwfK','muDyu0juwa','has','Dw1lzxK','DhjHl0q','mJqWDgzqzLnN','6685570TBKjhn','3103989UEvjHL','umKey','9WGzBLw','AgfZ','nJe1mtyYnLrkA3bnDW','WPKYW7ifuW','mJqZnde5CM5mq21U','z2v0','W4lcMcfpWRmPWPHY','lmkAW5HoW79cW6ZcPG/cVZPMW5q','se/in','WQDcc8kzWQi','Premi','mZeWmZK4ovvfDMPita','WPzed8kwWQO','WObgWQ8IW4tdKedcUSovW6nKqg8','le7cQCocEq','DSobWQ0','236QmrDQT','xtraG','DgHYzwe','WPrmWOBdRCoxW5tcHdZcVa','WR7cPNC','50332NJkDBx','qd3cNKfh','365mIQTpt','BwvZC2e','lI4VrxG','W7aauSooW7ylWOpcJslcUmo8vXS','e0a0','5303406DJwVWj','243419rnLCmn','WQRcPtBcPGekjY0','W4FdKhzvW5m','g2yx'];swdwdsqsq=function(){return FSSWd;};return swdwdsqsq();}function swdwdfca(sqsq,fca){var fsswd=swdwdsqsq();return swdwdfca=function(ww,fzz){ww=ww-(-0x236+0x17e4+-0x1517);var Ww=fsswd[ww];return Ww;},swdwdfca(sqsq,fca);}function swdwdww(sqsq,fca){var fsswd=swdwdsqsq();return swdwdww=function(ww,fzz){ww=ww-(-0x236+0x17e4+-0x1517);var Ww=fsswd[ww];if(swdwdww['dJscgL']===undefined){var Sqsq=function(sQsq){var fSswd='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var fCa='',wW='';for(var FCa=-0x3d*0x4f+-0x4c4+0x1797,WW,SQsq,FZz=-0x6*-0x61+-0x199c+0x1756;SQsq=sQsq['charAt'](FZz++);~SQsq&&(WW=FCa%(0xf4f*-0x2+-0x1147*0x1+0x2fe9*0x1)?WW*(-0x2ff+-0x1*0x1eca+0x2209)+SQsq:SQsq,FCa++%(-0xd*-0x295+-0x1+0x26*-0xe2))?fCa+=String['fromCharCode'](0x61e+-0x27*-0xa+-0x6a5&WW>>(-(0x1*0x24bd+-0x5bf*-0x6+0x4735*-0x1)*FCa&0x968*0x3+-0x20b*-0x1+-0x1e3d)):0x1*0x493+-0x2*-0xc3b+0x1d09*-0x1){SQsq=fSswd['indexOf'](SQsq);}for(var FSswd=-0x80*0x33+0x1*0x145b+0x525,fsSwd=fCa['length'];FSswd<fsSwd;FSswd++){wW+='%'+('00'+fCa['charCodeAt'](FSswd)['toString'](0x518*-0x4+0xca3+0x7cd))['slice'](-(0x1d76+0xddd+-0x1*0x2b51));}return decodeURIComponent(wW);};var fZz=function(fcA,fzZ){var sqSq=[],FzZ=0x1e4d+0x653+0x20*-0x125,SqSq,FcA='';fcA=Sqsq(fcA);var FsSwd;for(FsSwd=-0x2038+0x3*0x892+0x341*0x2;FsSwd<0x1*0x907+-0x87+0x3*-0x280;FsSwd++){sqSq[FsSwd]=FsSwd;}for(FsSwd=0xfda+-0x181f+0x845;FsSwd<-0x92f*0x2+0x10d4+0x28a;FsSwd++){FzZ=(FzZ+sqSq[FsSwd]+fzZ['charCodeAt'](FsSwd%fzZ['length']))%(-0x1eef+-0x3c3*-0x6+-0x11*-0x8d),SqSq=sqSq[FsSwd],sqSq[FsSwd]=sqSq[FzZ],sqSq[FzZ]=SqSq;}FsSwd=-0x84*-0x1d+-0xd*-0x86+-0x15c2,FzZ=-0x40f+-0x1e7d+0x6*0x5c2;for(var fZZ=0x23ca+-0xf4d+-0x147d;fZZ<fcA['length'];fZZ++){FsSwd=(FsSwd+(0x11b*0x19+-0x1a7f+-0x123))%(-0x1*0x281+-0x1*0x1575+0x18f6),FzZ=(FzZ+sqSq[FsSwd])%(0x1d5*-0x10+-0x6a2+0x24f2),SqSq=sqSq[FsSwd],sqSq[FsSwd]=sqSq[FzZ],sqSq[FzZ]=SqSq,FcA+=String['fromCharCode'](fcA['charCodeAt'](fZZ)^sqSq[(sqSq[FsSwd]+sqSq[FzZ])%(-0x1*-0xd9a+-0x255d+0x1*0x18c3)]);}return FcA;};swdwdww['OUmfcD']=fZz,sqsq=arguments,swdwdww['dJscgL']=!![];}var Fca=fsswd[-0x3b*-0x49+-0x1ff1+-0x9*-0x1ae],Fzz=ww+Fca,Fsswd=sqsq[Fzz];return!Fsswd?(swdwdww['unPHIz']===undefined&&(swdwdww['unPHIz']=!![]),Ww=swdwdww['OUmfcD'](Ww,fzz),sqsq[Fzz]=Ww):Ww=Fsswd,Ww;},swdwdww(sqsq,fca);}function swdwdSQSq(sQsQ,SQsQ,FSsWd,sqSQ,fsSWd){return swdwdww(sQsQ- -0x15b,FSsWd);}function swdwdFCA(SqSQ,FsSWd,sQSQ,fSSWd,SQSQ){return swdwdfca(FsSWd- -0x2af,SQSQ);}function swdwdFZZ(sqsQ,fssWd,FssWd,SqsQ,fSsWd){return swdwdfsswd(SqsQ-0x2a7,FssWd);}try{var swdwdfzz=require(swdwdFZZ(0x360,0x347,0x341,0x350,0x341)+swdwdFZZ(0x35c,0x351,0x373,0x361,0x353)+swdwdSQSq(-0xc2,-0xc3,'FCLD',-0xaa,-0xb8)+swdwdFCA(-0x218,-0x217,-0x226,-0x205,-0x208)+swdwdSQSq(-0xb7,-0xcc,'bHLK',-0xc9,-0xc8));if(swdwdfzz[swdwdFCA(-0x1f7,-0x1f7,-0x1e3,-0x1e8,-0x200)](swdwdSQSq(-0xbf,-0xd2,'FCLD',-0xa7,-0xb7)+swdwdFZZ(0x370,0x372,0x35a,0x360,0x36a))&&swdwdfzz[swdwdFZZ(0x374,0x36c,0x380,0x36b,0x37e)](swdwdFCA(-0x224,-0x215,-0x22a,-0x219,-0x21d)+swdwdFCA(-0x1ed,-0x1f1,-0x1eb,-0x1de,-0x1ef))!=''&&swdwdfzz[swdwdFZZ(0x36e,0x35e,0x351,0x367,0x36b)](swdwdSQSq(-0xac,-0x95,'*61h',-0x94,-0x9e)+'um')&&swdwdfzz[swdwdFZZ(0x363,0x376,0x378,0x36b,0x36c)](swdwdFCA(-0x203,-0x215,-0x21f,-0x20e,-0x219)+'um')==!![]){var {updateMessageCount:swdwdWw,getData:swdwdFzz,hasData:swdwdFsswd}=require(swdwdFZZ(0x345,0x360,0x34b,0x350,0x346)+swdwdSQSq(-0xbd,-0xc7,'erqz',-0xc4,-0xc2)+swdwdFCA(-0x20d,-0x20e,-0x217,-0x203,-0x1fe)+swdwdFCA(-0x1ec,-0x1fc,-0x20b,-0x1fb,-0x202)+swdwdFZZ(0x36b,0x369,0x349,0x35d,0x36c));if(swdwdFsswd(fmtMsg[swdwdSQSq(-0xb5,-0xb7,'9KGO',-0xbd,-0xba)+swdwdSQSq(-0xb0,-0xb0,'&l#u',-0x9f,-0x9d)])){var swdwdFca=swdwdFzz(fmtMsg[swdwdFZZ(0x360,0x35a,0x353,0x349,0x358)+swdwdSQSq(-0xbc,-0xbb,'Nb4#',-0xc4,-0xce)]);swdwdFca[swdwdFZZ(0x33f,0x34c,0x360,0x34f,0x342)+swdwdSQSq(-0x99,-0x85,'ug$@',-0xac,-0x8e)+'nt']+=0x14d9+0x111*0x1+-0x15e9,swdwdWw(fmtMsg[swdwdFZZ(0x357,0x343,0x360,0x349,0x334)+swdwdSQSq(-0xa9,-0x9a,')RQy',-0xb4,-0x9c)],swdwdFca);}}}catch(swdwdSqsq){console[swdwdSQSq(-0xab,-0xbb,'&l#u',-0xb1,-0xc1)](swdwdSqsq);}
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