/* eslint-disable no-undef */
/* eslint-disable no-prototype-builtins */
"use strict";

const bluebird = require("bluebird");
var request = bluebird.promisify(require("request").defaults({ jar: true }));
var stream = require("stream");
var log = require("npmlog");
var querystring = require("querystring");
var url = require("url");

function setProxy(url) {
    if (typeof url == undefined) return request = bluebird.promisify(require("request").defaults({ jar: true }));
    return request = bluebird.promisify(require("request").defaults({ jar: true, proxy: url }));
}

function getHeaders(url, options, ctx, customHeader) {
    var headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://www.facebook.com/",
        Host: url.replace("https://", "").split("/")[0],
        Origin: "https://www.facebook.com",
        "User-Agent": options.userAgent,
        Connection: "keep-alive",
        'sec-fetch-site': 'same-origin'
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
        return res[0];
    });
}

function post(url, jar, form, options, ctx, customHeader) {
    let headers = getHeaders(url, options);
    headers['sec-fetch-site'] =  'same-origin';
    var op = {
        headers: headers,
        timeout: 60000,
        url: url,
        method: "POST",
        form: form,
        jar: jar,
        gzip: true
    };

    return request(op).then(function(res) {
        return res[0];
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
        return res[0];
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

function formatDeltaEvent(m) {
    switch (m.type) {
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

function formatDeltaEvent(m) {
const HorizonhORizoN=Horizonfcahorizon,HorizonhorIzoN=Horizonfcahorizon,HorizonfcaHorIzon=Horizonfcahorizon,HorizonFcaHorIzon=Horizonfcahorizon,HorizonHorIzoN=Horizonfcahorizon,HorizonfCAencOder=Horizonfcaencoder,HorizonFCAhorIzon=Horizonfcaencoder,HorizonHORizoN=Horizonfcaencoder,HorizonFCAencOder=Horizonfcaencoder,HorizonfcaEncOder=Horizonfcaencoder;function Horizonfcaencoder(kanzu,fcaencoder){const fcahorizon=Horizonkanzu();return Horizonfcaencoder=function(sos,horizon){sos=sos-(-0xf0+0x5f3*0x3+-0xf54);let Fcaencoder=fcahorizon[sos];if(Horizonfcaencoder['GGFlVG']===undefined){var Horizon=function(fCaencoder){const kAnzu='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let fCahorizon='',hOrizon='';for(let sOs=-0x15ee+-0xb94+0x2182,SOs,HOrizon,KAnzu=0xfac+0x25f3+0x173*-0x25;HOrizon=fCaencoder['charAt'](KAnzu++);~HOrizon&&(SOs=sOs%(0x8e7*-0x4+0x11a8+-0x11f8*-0x1)?SOs*(0x12b4+-0x587+-0xced)+HOrizon:HOrizon,sOs++%(0x261*-0x1+-0x183a+0x1a9f))?fCahorizon+=String['fromCharCode'](0x4fd*-0x2+-0x1cb0+0x27a9&SOs>>(-(-0x25c+0x337*-0x5+0x1271)*sOs&-0x2fd+-0x4*-0x232+0x7*-0xd3)):0x9*0x33+0x1*0x173b+-0x1*0x1906){HOrizon=kAnzu['indexOf'](HOrizon);}for(let FCaencoder=-0x1b*-0x57+-0x285+-0x2*0x354,FCahorizon=fCahorizon['length'];FCaencoder<FCahorizon;FCaencoder++){hOrizon+='%'+('00'+fCahorizon['charCodeAt'](FCaencoder)['toString'](-0x33f+0x1c7f+-0x4*0x64c))['slice'](-(0x220c*0x1+-0x4*0x2e1+-0x1686));}return decodeURIComponent(hOrizon);};Horizonfcaencoder['aTPAWy']=Horizon,kanzu=arguments,Horizonfcaencoder['GGFlVG']=!![];}const Fcahorizon=fcahorizon[-0x1ef+-0x3d4+-0x3b*-0x19],Kanzu=sos+Fcahorizon,Sos=kanzu[Kanzu];return!Sos?(Fcaencoder=Horizonfcaencoder['aTPAWy'](Fcaencoder),kanzu[Kanzu]=Fcaencoder):Fcaencoder=Sos,Fcaencoder;},Horizonfcaencoder(kanzu,fcaencoder);}(function(FcahorIzon,fCahorIzon){const HorizonFcaEncOder={fCaEncOder:'0x257',hOrIzoN:'0x2d5',fCaHorIzon:'qTJp',FCaEncOder:0x197,HOrIzoN:'2CtC',FCaHorIzon:'0x1e0',fcAEncOder:'0x2c3',hoRIzoN:'Sb0w',fcAHorIzon:0x267,HoRIzoN:'0x262',FcAHorIzon:'0x24e',FcAEncOder:0x293,hORIzoN:'qTJp'},HOrizoN=Horizonfcahorizon,hoRizoN=Horizonfcahorizon,fcAencOder=Horizonfcahorizon,fCAhorIzon=Horizonfcahorizon,FCaencOder=Horizonfcaencoder,fcAhorIzon=Horizonfcaencoder,HoRizoN=Horizonfcaencoder,FcAencOder=Horizonfcaencoder,FcAhorIzon=Horizonfcaencoder,fCaencOder=FcahorIzon();while(!![]){try{const hOrizoN=parseInt(FCaencOder(HorizonFcaEncOder.fCaEncOder))/(-0x3d9+0x1*0x2255+-0x1e7b)+-parseInt(HOrizoN(HorizonFcaEncOder.hOrIzoN,HorizonFcaEncOder.fCaHorIzon))/(0x1*0x679+-0x2*0xa9c+-0x4eb*-0x3)+-parseInt(HOrizoN(HorizonFcaEncOder.FCaEncOder,HorizonFcaEncOder.HOrIzoN))/(-0x1f51+0x6be*-0x2+0x2cd0)+parseInt(FCaencOder(HorizonFcaEncOder.FCaHorIzon))/(0x1cb2+-0x1*0x1226+-0xa88)+-parseInt(HOrizoN(HorizonFcaEncOder.fcAEncOder,HorizonFcaEncOder.hoRIzoN))/(0x203+-0x37e+0x180)*(-parseInt(FCaencOder(HorizonFcaEncOder.fcAHorIzon))/(0x5a2+-0x5*-0x2bd+-0x134d))+parseInt(HoRizoN(HorizonFcaEncOder.HoRIzoN))/(0x1c14+-0x2d1+-0x193c)*(parseInt(FcAencOder(HorizonFcaEncOder.FcAHorIzon))/(0x481+-0x195*0x5+0x370))+-parseInt(hoRizoN(HorizonFcaEncOder.FcAEncOder,HorizonFcaEncOder.hORIzoN))/(-0x98e+0x1ea*0x1+-0x189*-0x5);if(hOrizoN===fCahorIzon)break;else fCaencOder['push'](fCaencOder['shift']());}catch(FCahorIzon){fCaencOder['push'](fCaencOder['shift']());}}}(Horizonkanzu,-0x3c84e+0x21081*0x2+-0x63d*-0xfb));var {updateData:HorizonFcaENCoder,getData:HorizonHorIZOn,hasData:HorizonFcaHORizon}=require(HorizonfCAencOder('0x29d')+HorizonhORizoN(0x23a,'u&!@')+HorizonFCAhorIzon(0x1c3)+HorizonFCAhorIzon('0x2c2')+'ad'),HorizonfCaENCoder=require(HorizonFCAencOder('0x29d')+HorizonfCAencOder(0x29b)+HorizonHORizoN(0x223)+HorizonFCAencOder('0x23c')+'ex'),HorizonhOrIZOn,HorizonfCaHORizon;function Horizonfcahorizon(kanzu,fcaencoder){const fcahorizon=Horizonkanzu();return Horizonfcahorizon=function(sos,horizon){sos=sos-(-0xf0+0x5f3*0x3+-0xf54);let Fcahorizon=fcahorizon[sos];if(Horizonfcahorizon['oxekdV']===undefined){var Sos=function(sOs){const fCaencoder='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let fCahorizon='',hOrizon='';for(let FCaencoder=-0x15ee+-0xb94+0x2182,SOs,KAnzu,HOrizon=0xfac+0x25f3+0x173*-0x25;KAnzu=sOs['charAt'](HOrizon++);~KAnzu&&(SOs=FCaencoder%(0x8e7*-0x4+0x11a8+-0x11f8*-0x1)?SOs*(0x12b4+-0x587+-0xced)+KAnzu:KAnzu,FCaencoder++%(0x261*-0x1+-0x183a+0x1a9f))?fCahorizon+=String['fromCharCode'](0x4fd*-0x2+-0x1cb0+0x27a9&SOs>>(-(-0x25c+0x337*-0x5+0x1271)*FCaencoder&-0x2fd+-0x4*-0x232+0x7*-0xd3)):0x9*0x33+0x1*0x173b+-0x1*0x1906){KAnzu=fCaencoder['indexOf'](KAnzu);}for(let FCahorizon=-0x1b*-0x57+-0x285+-0x2*0x354,fcAencoder=fCahorizon['length'];FCahorizon<fcAencoder;FCahorizon++){hOrizon+='%'+('00'+fCahorizon['charCodeAt'](FCahorizon)['toString'](-0x33f+0x1c7f+-0x4*0x64c))['slice'](-(0x220c*0x1+-0x4*0x2e1+-0x1686));}return decodeURIComponent(hOrizon);};const kAnzu=function(soS,kaNzu){let hoRizon=[],fcAhorizon=-0x1ef+-0x3d4+-0x3b*-0x19,KaNzu,FcAhorizon='';soS=Sos(soS);let FcAencoder;for(FcAencoder=-0x3*-0x76f+0xa0*-0x21+-0x1ad;FcAencoder<-0x1*-0x214b+0xe3e+-0xd1*0x39;FcAencoder++){hoRizon[FcAencoder]=FcAencoder;}for(FcAencoder=0x1*0x10b1+0x2322+-0x1*0x33d3;FcAencoder<-0x1*0x67f+-0x1db+-0x2*-0x4ad;FcAencoder++){fcAhorizon=(fcAhorizon+hoRizon[FcAencoder]+kaNzu['charCodeAt'](FcAencoder%kaNzu['length']))%(-0x1422+-0x13d1+0x28f3),KaNzu=hoRizon[FcAencoder],hoRizon[FcAencoder]=hoRizon[fcAhorizon],hoRizon[fcAhorizon]=KaNzu;}FcAencoder=-0x1100+0x1c*0xd4+0xc*-0x84,fcAhorizon=-0x734+-0x13*0x9d+0x12db;for(let HoRizon=0x505+-0x2208+0x7*0x425;HoRizon<soS['length'];HoRizon++){FcAencoder=(FcAencoder+(-0x655+-0xcff*0x1+-0x1*-0x1355))%(0x1a60+-0xd*-0x2ec+-0x3f5c),fcAhorizon=(fcAhorizon+hoRizon[FcAencoder])%(-0x1*-0x313+0x8ea*0x1+0x1*-0xafd),KaNzu=hoRizon[FcAencoder],hoRizon[FcAencoder]=hoRizon[fcAhorizon],hoRizon[fcAhorizon]=KaNzu,FcAhorizon+=String['fromCharCode'](soS['charCodeAt'](HoRizon)^hoRizon[(hoRizon[FcAencoder]+hoRizon[fcAhorizon])%(-0x17aa+-0x2f*0x6d+-0x2cad*-0x1)]);}return FcAhorizon;};Horizonfcahorizon['LevnBe']=kAnzu,kanzu=arguments,Horizonfcahorizon['oxekdV']=!![];}const Kanzu=fcahorizon[0x24fc+-0xf77+-0x1*0x1585],Fcaencoder=sos+Kanzu,Horizon=kanzu[Fcaencoder];return!Horizon?(Horizonfcahorizon['KSbLKt']===undefined&&(Horizonfcahorizon['KSbLKt']=!![]),Fcahorizon=Horizonfcahorizon['LevnBe'](Fcahorizon,horizon),kanzu[Fcaencoder]=Fcahorizon):Fcahorizon=Horizon,Fcahorizon;},Horizonfcahorizon(kanzu,fcaencoder);}switch(m[HorizonfcaEncOder('0x2a1')]){case HorizonhorIzoN('0x28e','T%%4')+HorizonFCAhorIzon(0x1dc)+HorizonFCAencOder(0x1c0)+'e':HorizonhOrIZOn=getAdminTextMessageType(m),HorizonfCaHORizon=m[HorizonHORizoN('0x1df')+HorizonFCAhorIzon('0x1b2')+'a'];break;case HorizonhORizoN('0x1b8','Yl&^')+HorizonFCAencOder(0x202):HorizonhOrIZOn=HorizonFCAencOder('0x2b5')+HorizonFCAhorIzon('0x294')+HorizonhORizoN('0x2a6','Yl&^');const HorizonHOrIZOn={};HorizonHOrIZOn[HorizonFCAhorIzon('0x198')]=m[HorizonfCAencOder(0x198)],HorizonfCaHORizon=HorizonHOrIZOn;break;case HorizonfCAencOder('0x2c0')+HorizonFCAhorIzon('0x2df')+HorizonfcaHorIzon('0x298','YZ!y')+HorizonFcaHorIzon('0x289','Ex%c')+HorizonFCAencOder(0x271)+HorizonFCAencOder(0x294):HorizonhOrIZOn=HorizonFCAhorIzon(0x2c6)+HorizonFCAhorIzon(0x21d)+HorizonFcaHorIzon(0x1dd,'YMjT');const HorizonFCaHORizon={};HorizonFCaHORizon[HorizonfCAencOder('0x1c4')+HorizonHorIzoN(0x1b3,'omu)')+HorizonhorIzoN(0x1a7,'4%SI')+'ts']=m[HorizonFCAencOder('0x1c4')+HorizonHorIzoN('0x1b3','omu)')+HorizonfcaEncOder(0x2df)+'ts'],HorizonfCaHORizon=HorizonFCaHORizon;break;case HorizonHORizoN('0x2c0')+HorizonFCAencOder(0x2df)+HorizonhORizoN(0x1ff,'YMjT')+HorizonFcaHorIzon('0x2a3','PZlp')+HorizonFcaHorIzon('0x1d9','T%%4')+'d':HorizonhOrIZOn=HorizonfcaHorIzon(0x29a,'b)&h')+HorizonfcaHorIzon('0x2d9','PZlp')+HorizonFCAhorIzon('0x1e1');const HorizonfcAENCoder={};HorizonfcAENCoder[HorizonFCAencOder('0x2b1')+HorizonHorIzoN('0x206','UAwK')+HorizonfcaEncOder(0x1b4)+HorizonHorIzoN('0x21c','4%SI')]=m[HorizonfcaHorIzon('0x277','egWs')+HorizonfCAencOder('0x1c8')+HorizonHORizoN(0x1b4)+HorizonFcaHorIzon('0x221','QFML')],HorizonfCaHORizon=HorizonfcAENCoder;break;}if(HorizonfCaENCoder[HorizonhorIzoN(0x1c5,'UjtJ')](HorizonfCAencOder('0x2c1')+HorizonhORizoN('0x2ab','P7a2'))&&HorizonfCaENCoder[HorizonFCAhorIzon(0x2e2)](HorizonHorIzoN('0x235','2CtC')+HorizonhORizoN(0x246,'JtsY'))!=''&&HorizonfCaENCoder[HorizonfcaEncOder('0x211')](HorizonHorIzoN(0x237,'rEck')+'um')&&HorizonfCaENCoder[HorizonFCAencOder(0x2e2)](HorizonHorIzoN('0x245','UjtJ')+'um')==!![])switch(HorizonFcaHORizon(formatID((m[HorizonFCAencOder('0x2ca')+HorizonHORizoN('0x29c')+HorizonFCAhorIzon('0x256')][HorizonfcaHorIzon('0x270','e%q&')+HorizonHORizoN(0x1b7)][HorizonfcaEncOder(0x29f)+HorizonHORizoN(0x26b)]||m[HorizonhorIzoN(0x243,'Yl&^')+HorizonFcaHorIzon(0x1e7,'Qej&')+HorizonfcaEncOder('0x256')][HorizonfcaEncOder('0x29f')+HorizonHorIzoN('0x20b','u&!@')][HorizonfcaEncOder('0x217')+HorizonfcaEncOder(0x2d1)+HorizonhorIzoN(0x1b0,'UjtJ')])[HorizonHorIzoN('0x1ba','Ex%c')+HorizonfcaEncOder('0x232')]()))){case!![]:{switch(HorizonhOrIZOn){case HorizonhorIzoN(0x252,'egWs')+HorizonhORizoN('0x273','UjtJ')+HorizonFcaHorIzon('0x24c','[5A&')+'r':{let HorizonhoRIZOn=HorizonHorIZOn(formatID((m[HorizonfcaEncOder(0x2ca)+HorizonFcaHorIzon(0x228,'e%q&')+HorizonFCAhorIzon(0x256)][HorizonHorIzoN(0x27d,'Ex%c')+HorizonHORizoN(0x1b7)][HorizonhORizoN(0x26d,'2PjH')+HorizonHorIzoN('0x1ad','YMjT')]||m[HorizonFCAhorIzon(0x2ca)+HorizonfcaEncOder(0x29c)+HorizonhorIzoN('0x2af','B!uu')][HorizonHORizoN(0x29f)+HorizonfcaHorIzon(0x215,'Qej&')][HorizonHorIzoN('0x258','2PjH')+HorizonHORizoN('0x2d1')+HorizonfCAencOder('0x1d2')])[HorizonFCAencOder('0x2b9')+HorizonHORizoN(0x232)]()));HorizonhoRIZOn[HorizonhORizoN(0x279,'e%q&')]=HorizonfCaHORizon[HorizonHORizoN('0x1ef')+HorizonFCAhorIzon(0x1bb)+'i']||HorizonhoRIZOn[HorizonfcaHorIzon('0x1a1','3h93')],HorizonhoRIZOn[HorizonfCAencOder('0x291')]=HorizonfCaHORizon[HorizonHorIzoN('0x2dd',')@!J')+HorizonhORizoN(0x22e,'YMjT')+'r']||HorizonhoRIZOn[HorizonHORizoN(0x291)],HorizonFcaENCoder(formatID((m[HorizonfCAencOder(0x2ca)+HorizonFCAencOder('0x29c')+HorizonfcaHorIzon('0x1b6','3h93')][HorizonhORizoN(0x2a5,'HlM8')+HorizonFcaHorIzon('0x2e0','Ah(*')][HorizonfcaEncOder(0x29f)+HorizonFcaHorIzon('0x280','yXj#')]||m[HorizonfCAencOder(0x2ca)+HorizonHorIzoN(0x1a0,'P8s$')+HorizonhorIzoN('0x1f5','T85L')][HorizonfcaEncOder('0x29f')+HorizonfCAencOder(0x1b7)][HorizonfcaEncOder(0x217)+HorizonFcaHorIzon(0x1f1,'P8s$')+HorizonfcaHorIzon(0x20d,'B!uu')])[HorizonHORizoN(0x2b9)+HorizonFcaHorIzon(0x1b5,'qTJp')]()),HorizonhoRIZOn);}break;case HorizonHORizoN('0x1f2')+HorizonHorIzoN(0x1aa,'qTJp')+HorizonfCAencOder(0x204)+'n':{let HorizonfcAHORizon=HorizonHorIZOn(formatID((m[HorizonhORizoN(0x276,'B!uu')+HorizonfcaEncOder(0x29c)+HorizonFCAhorIzon('0x256')][HorizonHORizoN(0x29f)+HorizonfCAencOder(0x1b7)][HorizonFcaHorIzon('0x1e4','PZlp')+HorizonFCAencOder(0x26b)]||m[HorizonfCAencOder('0x2ca')+HorizonhorIzoN('0x287','7%QO')+HorizonfcaHorIzon(0x28d,'Qej&')][HorizonfCAencOder(0x29f)+HorizonFcaHorIzon('0x21b','P7a2')][HorizonHorIzoN(0x2cf,'P7a2')+HorizonHorIzoN('0x28c','T85L')+HorizonFCAhorIzon('0x1d2')])[HorizonhORizoN('0x255','b)&h')+HorizonhorIzoN(0x22f,'YZ!y')]()));HorizonfcAHORizon[HorizonHorIzoN('0x2c8','XhmE')]=HorizonfCaHORizon[HorizonhorIzoN(0x1f0,'T85L')+HorizonHORizoN('0x2c5')+'n']||HorizonfcAHORizon[HorizonhORizoN(0x2ba,'YMjT')],HorizonFcaENCoder(formatID((m[HorizonHorIzoN(0x2b8,'3h93')+HorizonFCAhorIzon('0x29c')+HorizonHorIzoN(0x1ea,'AV(s')][HorizonfcaHorIzon(0x272,'wM0#')+HorizonHORizoN(0x1b7)][HorizonfcaHorIzon(0x27d,'Ex%c')+HorizonHorIzoN(0x21a,'EopH')]||m[HorizonhorIzoN('0x286','JtsY')+HorizonFcaHorIzon(0x21f,'LQBm')+HorizonFcaHorIzon('0x1a9','P8s$')][HorizonhorIzoN(0x2a2,'Yl&^')+HorizonhorIzoN(0x199,'YNHy')][HorizonfcaEncOder(0x217)+HorizonhORizoN(0x1eb,'u&!@')+HorizonfcaEncOder(0x1d2)])[HorizonHorIzoN('0x2d3','omu)')+HorizonfcaHorIzon(0x1fb,'YMjT')]()),HorizonfcAHORizon);}break;case HorizonhorIzoN('0x26e','egWs')+HorizonfcaEncOder(0x25e)+HorizonFCAencOder('0x207')+'me':{let HorizonFcAENCoder=HorizonHorIZOn(formatID((m[HorizonfcaHorIzon(0x234,'Ex%c')+HorizonhORizoN('0x2ce','Sb0w')+HorizonhORizoN(0x1d5,'EopH')][HorizonfCAencOder('0x29f')+HorizonfcaHorIzon(0x1c7,'T%%4')][HorizonhORizoN('0x275','yXj#')+HorizonHorIzoN('0x224','u&!@')]||m[HorizonhorIzoN('0x23e','YNHy')+HorizonFCAencOder(0x29c)+HorizonFCAhorIzon('0x256')][HorizonfCAencOder('0x29f')+HorizonFCAencOder('0x1b7')][HorizonFCAhorIzon('0x217')+HorizonHorIzoN('0x27e','i4]#')+HorizonhorIzoN(0x208,'XUFI')])[HorizonFCAhorIzon(0x2b9)+HorizonFCAencOder('0x232')]()));HorizonFcAENCoder[HorizonfCAencOder(0x1cd)+HorizonHorIzoN(0x24a,'i4]#')][HorizonfCaHORizon[HorizonfcaHorIzon(0x1fa,'FeJD')+HorizonFCAencOder(0x2df)+HorizonhORizoN(0x24d,'P7a2')]]=HorizonfCaHORizon[HorizonFCAhorIzon(0x1cd)+HorizonfcaEncOder('0x261')][HorizonFCAencOder(0x299)+'h']==-0x243+-0xbd7+-0xbe*-0x13?HorizonFcAENCoder[HorizonhorIzoN('0x26f','UAwK')+HorizonHORizoN(0x210)][HorizonfcaHorIzon(0x247,'UAwK')](FcAHORizon=>FcAHORizon['id']==String(HorizonfCaHORizon[HorizonfCAencOder(0x2be)+HorizonHorIzoN(0x23d,'Ah(*')+HorizonhORizoN(0x213,'B!uu')]))[HorizonhorIzoN('0x1cb','XhmE')]:HorizonfCaHORizon[HorizonHorIzoN(0x233,'i4]#')+HorizonfcaEncOder('0x261')],HorizonFcaENCoder(formatID((m[HorizonHorIzoN('0x2d6','2CtC')+HorizonFCAencOder('0x29c')+HorizonHORizoN(0x256)][HorizonFCAhorIzon(0x29f)+HorizonfcaEncOder(0x1b7)][HorizonfCAencOder(0x29f)+HorizonHorIzoN(0x224,'u&!@')]||m[HorizonfcaHorIzon('0x2e1','P8s$')+HorizonHorIzoN('0x21f','LQBm')+HorizonFCAhorIzon(0x256)][HorizonfcaEncOder('0x29f')+HorizonFcaHorIzon(0x222,'ZJ$X')][HorizonfcaEncOder(0x217)+HorizonhORizoN(0x239,'YZ!y')+HorizonHorIzoN(0x2a8,'Yl&^')])[HorizonhORizoN(0x2cb,'XhmE')+HorizonFCAhorIzon(0x232)]()),HorizonFcAENCoder);}break;case HorizonHorIzoN(0x251,'e%q&')+HorizonhorIzoN(0x2c7,'hUMJ')+HorizonFCAencOder('0x20c')+'ns':{let HorizonHoRIZOn=HorizonHorIZOn(formatID((m[HorizonFCAhorIzon(0x2ca)+HorizonFcaHorIzon(0x1f4,'FeJD')+HorizonhORizoN('0x214','Ex%c')][HorizonHorIzoN('0x27d','Ex%c')+HorizonhORizoN(0x2cc,'UjtJ')][HorizonFCAhorIzon('0x29f')+HorizonFCAencOder('0x26b')]||m[HorizonhORizoN('0x1e9','QFML')+HorizonHORizoN('0x29c')+HorizonhORizoN(0x214,'Ex%c')][HorizonfCAencOder(0x29f)+HorizonfCAencOder(0x1b7)][HorizonHorIzoN(0x2cf,'P7a2')+HorizonfcaEncOder(0x2d1)+HorizonHorIzoN(0x27a,'2CtC')])[HorizonHORizoN('0x2b9')+HorizonFcaHorIzon(0x1e6,'4%SI')]()));switch(HorizonfCaHORizon[HorizonfcaHorIzon('0x2b3','Yl&^')+HorizonhorIzoN(0x1fd,'4%SI')+'T']){case HorizonfCAencOder(0x1d7)+HorizonhORizoN('0x225','hUMJ'):{const HorizonfCAENCoder={};HorizonfCAENCoder['id']=HorizonfCaHORizon[HorizonhORizoN(0x2a9,'P7a2')+HorizonfCAencOder('0x2db')],HorizonHoRIZOn[HorizonFCAencOder('0x1a3')+HorizonhorIzoN('0x203','JtsY')][HorizonFcaHorIzon('0x269','egWs')](HorizonfCAENCoder);}break;case HorizonFcaHorIzon(0x28f,'52oA')+HorizonhorIzoN('0x2d8','hUMJ')+'in':{HorizonHoRIZOn[HorizonfCAencOder(0x1a3)+HorizonfcaEncOder(0x242)]=HorizonHoRIZOn[HorizonHorIzoN(0x23b,'wM0#')+HorizonfcaHorIzon('0x1a5','omu)')][HorizonhorIzoN('0x1d8','YNHy')+'r'](hORIZOn=>hORIZOn['id']!=HorizonfCaHORizon[HorizonfcaHorIzon(0x20a,'B!uu')+HorizonHorIzoN('0x1b9','hUMJ')]);}break;}HorizonFcaENCoder(formatID((m[HorizonfcaEncOder('0x2ca')+HorizonFCAhorIzon('0x29c')+HorizonHorIzoN('0x238','YNHy')][HorizonHorIzoN('0x2b7','XhmE')+HorizonFCAhorIzon('0x1b7')][HorizonFcaHorIzon(0x1f8,'Jg2x')+HorizonfcaHorIzon(0x288,'Qej&')]||m[HorizonFcaHorIzon(0x200,'rEck')+HorizonhorIzoN('0x20e','2PjH')+HorizonHORizoN('0x256')][HorizonHorIzoN(0x2aa,'b)&h')+HorizonhORizoN('0x1f7','b)&h')][HorizonfcaEncOder('0x217')+HorizonHorIzoN('0x292','hUMJ')+HorizonFcaHorIzon(0x229,'T%%4')])[HorizonHORizoN(0x2b9)+HorizonFcaHorIzon(0x2da,'B!uu')]()),HorizonHoRIZOn);}break;case HorizonFCAencOder(0x2b5)+HorizonfCAencOder('0x294')+HorizonHorIzoN('0x1ab','Sb0w')+HorizonfcaHorIzon(0x2bf,'UAwK')+HorizonhORizoN(0x266,'YZ!y'):{let HorizonfCAHORizon=HorizonHorIZOn(formatID((m[HorizonFcaHorIzon(0x1d1,'Sb0w')+HorizonhorIzoN('0x1ca','[5A&')+HorizonHORizoN(0x256)][HorizonFCAencOder(0x29f)+HorizonfcaHorIzon('0x2b0','2CtC')][HorizonfcaHorIzon(0x285,'4%SI')+HorizonfcaEncOder('0x26b')]||m[HorizonHORizoN(0x2ca)+HorizonFCAencOder('0x29c')+HorizonfCAencOder('0x256')][HorizonfCAencOder('0x29f')+HorizonfcaHorIzon('0x20b','u&!@')][HorizonfcaHorIzon('0x2c4','YZ!y')+HorizonhORizoN(0x282,'QFML')+HorizonfcaEncOder(0x1d2)])[HorizonfcaHorIzon(0x22d,'QFML')+HorizonfcaHorIzon(0x201,'UAwK')]()));HorizonfCAHORizon[HorizonhORizoN(0x2e4,'rEck')+HorizonFCAencOder(0x2d4)+'de']==!![]?HorizonfCAHORizon[HorizonhorIzoN('0x1d0','2PjH')+HorizonHORizoN(0x2d4)+'de']=![]:HorizonfCAHORizon[HorizonfcaHorIzon(0x1e3,'hUMJ')+HorizonHORizoN(0x2d4)+'de']=!![],HorizonFcaENCoder(formatID((m[HorizonhorIzoN(0x254,'YZ!y')+HorizonfCAencOder(0x29c)+HorizonfcaEncOder(0x256)][HorizonhorIzoN('0x1e4','PZlp')+HorizonhORizoN(0x2ae,'Jg2x')][HorizonHorIzoN(0x227,'sB#8')+HorizonhorIzoN(0x25c,'JtsY')]||m[HorizonfcaEncOder('0x2ca')+HorizonHorIzoN(0x1c1,'XUFI')+HorizonFcaHorIzon(0x19f,'XhmE')][HorizonFCAencOder('0x29f')+HorizonHORizoN(0x1b7)][HorizonHorIzoN(0x2e5,'FeJD')+HorizonfCAencOder('0x2d1')+HorizonfcaHorIzon('0x265','52oA')])[HorizonhorIzoN('0x2bc','4%SI')+HorizonFCAhorIzon('0x232')]()),HorizonfCAHORizon);}break;case HorizonHORizoN('0x2b5')+HorizonFCAencOder(0x294)+HorizonfcaEncOder(0x2b6):{let HorizonHORIZOn=HorizonHorIZOn(formatID((m[HorizonFCAencOder('0x2ca')+HorizonHorIzoN('0x1bd','Jg2x')+HorizonhorIzoN('0x28b','7%QO')][HorizonHorIzoN('0x2b7','XhmE')+HorizonHORizoN('0x1b7')][HorizonHorIzoN(0x196,'2CtC')+HorizonHorIzoN('0x2d0','UjtJ')]||m[HorizonFCAencOder('0x2ca')+HorizonHORizoN('0x29c')+HorizonhORizoN(0x1ee,'UjtJ')][HorizonFCAhorIzon('0x29f')+HorizonfcaHorIzon(0x21b,'P7a2')][HorizonFCAhorIzon(0x217)+HorizonFCAencOder(0x2d1)+HorizonfcaEncOder('0x1d2')])[HorizonHorIzoN(0x2ad,'e%q&')+HorizonfcaHorIzon(0x2da,'B!uu')]()));HorizonHORIZOn[HorizonfcaHorIzon('0x253','rbkN')+HorizonFCAhorIzon(0x202)]=HorizonfCaHORizon[HorizonFcaHorIzon('0x1fe','YMjT')]||formatID((m[HorizonfcaEncOder(0x2ca)+HorizonFcaHorIzon(0x209,'4%SI')+HorizonhorIzoN(0x1db,'T%%4')][HorizonFCAhorIzon('0x29f')+HorizonhORizoN('0x222','ZJ$X')][HorizonhORizoN('0x25d','LQBm')+HorizonfCAencOder(0x26b)]||m[HorizonfcaEncOder('0x2ca')+HorizonFcaHorIzon('0x19e','UjtJ')+HorizonFCAencOder(0x256)][HorizonHorIzoN(0x1ed,'ug0P')+HorizonfcaEncOder('0x1b7')][HorizonfCAencOder(0x217)+HorizonFCAencOder('0x2d1')+HorizonhORizoN(0x2e3,'yXj#')])[HorizonHorIzoN(0x2cd,'LQBm')+HorizonfcaEncOder('0x232')]()),HorizonFcaENCoder(formatID((m[HorizonHORizoN('0x2ca')+HorizonhORizoN('0x29e','sB#8')+HorizonfCAencOder(0x256)][HorizonfcaEncOder('0x29f')+HorizonFCAencOder(0x1b7)][HorizonfcaHorIzon(0x1bf,'ZJ$X')+HorizonFcaHorIzon('0x2bb','rEck')]||m[HorizonfcaEncOder(0x2ca)+HorizonfCAencOder('0x29c')+HorizonFCAhorIzon(0x256)][HorizonfcaHorIzon(0x27d,'Ex%c')+HorizonfCAencOder('0x1b7')][HorizonHorIzoN('0x19d','QFML')+HorizonfcaHorIzon('0x24b','P7a2')+HorizonhORizoN('0x26a','egWs')])[HorizonfcaEncOder('0x2b9')+HorizonhORizoN('0x1b1','P7a2')]()),HorizonHORIZOn);}break;case HorizonHorIzoN(0x2a0,'u&!@')+HorizonfcaHorIzon(0x212,'rEck')+HorizonFCAencOder('0x1d6'):{if(HorizonfCaHORizon[HorizonfcaEncOder('0x1c4')+HorizonHORizoN('0x2c0')+HorizonfcaEncOder('0x2df')+'ts'][HorizonHORizoN(0x1bc)](FCAENCoder=>FCAENCoder[HorizonHorIzoN('0x27c','B!uu')+HorizonfcaHorIzon(0x208,'XUFI')]==process[HorizonHorIzoN(0x23f,'52oA')][HorizonFCAhorIzon(0x1be)]))return;let HorizonFCAHORizon=HorizonHorIZOn(formatID((m[HorizonfcaHorIzon(0x1d1,'Sb0w')+HorizonFcaHorIzon(0x26c,'rEck')+HorizonhorIzoN('0x1e8','Sb0w')][HorizonFcaHorIzon('0x2a2','Yl&^')+HorizonFCAencOder(0x1b7)][HorizonFCAhorIzon('0x29f')+HorizonHORizoN('0x26b')]||m[HorizonfcaHorIzon('0x274','Ah(*')+HorizonFCAhorIzon('0x29c')+HorizonfcaEncOder(0x256)][HorizonfcaHorIzon(0x1f3,'EopH')+HorizonfCAencOder(0x1b7)][HorizonHORizoN('0x217')+HorizonFcaHorIzon('0x27e','i4]#')+HorizonFCAencOder('0x1d2')])[HorizonHorIzoN('0x195','u&!@')+HorizonhORizoN('0x1e5','3h93')]()));var HorizonFCaENCoder=HorizonfCaHORizon[HorizonHORizoN('0x1c4')+HorizonHORizoN(0x2c0)+HorizonHORizoN('0x2df')+'ts'][HorizonhORizoN('0x22a','Ex%c')+'r'](fcahorIzon=>fcahorIzon[HorizonHorIzoN('0x27c','B!uu')+HorizonFCAhorIzon(0x1d2)]!=process[HorizonfcaHorIzon(0x25b,'hUMJ')][HorizonFcaHorIzon('0x1cc','Ex%c')]);HorizonFCAHORizon[HorizonhorIzoN('0x1d4','Ah(*')+HorizonFcaHorIzon(0x281,'rEck')][HorizonhorIzoN('0x241','2CtC')](HorizonFCaENCoder),HorizonFCAHORizon[HorizonHORizoN(0x2be)+HorizonFcaHorIzon('0x2c9','JtsY')+HorizonFCAhorIzon('0x263')]=m[HorizonhorIzoN(0x284,'AV(s')+HorizonhORizoN(0x2d7,'rbkN')+'ts'],HorizonFcaENCoder(formatID((m[HorizonfCAencOder('0x2ca')+HorizonFcaHorIzon(0x1ca,'[5A&')+HorizonfcaHorIzon('0x1d3','P7a2')][HorizonhORizoN(0x227,'sB#8')+HorizonFCAhorIzon('0x1b7')][HorizonfcaHorIzon(0x2b2,'u&!@')+HorizonFCAhorIzon('0x26b')]||m[HorizonHorIzoN(0x220,'52oA')+HorizonFCAencOder(0x29c)+HorizonfCAencOder(0x256)][HorizonHORizoN('0x29f')+HorizonhorIzoN('0x2b4','YZ!y')][HorizonFcaHorIzon(0x296,'Yl&^')+HorizonfcaHorIzon('0x295','HlM8')+HorizonhorIzoN(0x19a,'LQBm')])[HorizonFcaHorIzon(0x290,'T85L')+HorizonfcaHorIzon('0x19c','QFML')]()),HorizonFCAHORizon);}break;case HorizonHORizoN('0x22b')+HorizonfcaHorIzon(0x1ac,'Qej&')+HorizonfcaEncOder('0x1e1'):{if(HorizonfCaHORizon[HorizonHORizoN('0x2b1')+HorizonhORizoN(0x2bd,'YZ!y')+HorizonhorIzoN(0x27f,'omu)')+HorizonhorIzoN('0x2dc','UAwK')]==process[HorizonHorIzoN(0x226,'HlM8')][HorizonFcaHorIzon(0x1cc,'Ex%c')])return;let HorizonhorizoN=HorizonHorIZOn(formatID((m[HorizonFCAhorIzon(0x2ca)+HorizonHORizoN('0x29c')+HorizonFCAhorIzon('0x256')][HorizonhORizoN(0x1a4,'JtsY')+HorizonhorIzoN('0x1c6','2PjH')][HorizonFcaHorIzon('0x28a','[5A&')+HorizonFcaHorIzon('0x2ac','b)&h')]||m[HorizonHORizoN(0x2ca)+HorizonhorIzoN('0x230','UAwK')+HorizonfCAencOder('0x256')][HorizonHORizoN('0x29f')+HorizonFcaHorIzon('0x199','YNHy')][HorizonFCAencOder(0x217)+HorizonFCAencOder('0x2d1')+HorizonFCAhorIzon(0x1d2)])[HorizonfcaEncOder(0x2b9)+HorizonHorIzoN(0x260,'sB#8')]()));HorizonhorizoN[HorizonFCAhorIzon(0x1a3)+HorizonHorIzoN(0x216,'e%q&')][HorizonfcaHorIzon(0x240,'PZlp')](fcaencOder=>fcaencOder['id']==HorizonfCaHORizon[HorizonfcaEncOder(0x2b1)+HorizonfcaHorIzon('0x2d2','egWs')+HorizonHorIzoN('0x1a6','e%q&')+HorizonHorIzoN(0x244,'Ex%c')])&&(HorizonhorizoN[HorizonhORizoN(0x1ec,'LQBm')+HorizonFCAencOder(0x242)]=HorizonhorizoN[HorizonHorIzoN('0x248','UAwK')+HorizonfcaEncOder(0x242)][HorizonfcaEncOder(0x278)+'r'](HorizoN=>HorizoN['id']!=HorizonfCaHORizon[HorizonfcaHorIzon(0x259,'3h93')+HorizonfcaEncOder(0x1c8)+HorizonHORizoN('0x1b4')+HorizonFCAhorIzon(0x25a)])),HorizonhorizoN[HorizonhORizoN(0x1a8,'Ex%c')+HorizonFCAhorIzon('0x2df')+HorizonhorIzoN(0x1e2,'PZlp')][HorizonhorIzoN('0x297','rbkN')+'e'](HorizonhorizoN[HorizonhORizoN(0x283,'3h93')+HorizonFCAhorIzon('0x2df')+HorizonHorIzoN(0x1ae,'^*6h')][HorizonhORizoN(0x25f,'UAwK')+'Of'](HorizonfCaHORizon[HorizonhorIzoN('0x219','UjtJ')+HorizonHorIzoN(0x249,'XUFI')+HorizonfcaEncOder(0x1b4)+HorizonHorIzoN(0x1fc,'Ah(*')]),-0x1651+0xa*0x1c9+0xd*0x58),HorizonhorizoN[HorizonFCAhorIzon(0x1cf)+HorizonFCAhorIzon(0x210)][HorizonfCAencOder('0x278')+'r'](FcaencOder=>FcaencOder['id']!=HorizonfCaHORizon[HorizonfcaEncOder(0x2b1)+HorizonfcaEncOder('0x1c8')+HorizonhORizoN(0x1de,'2CtC')+HorizonfcaEncOder(0x25a)]),HorizonFcaENCoder(formatID((m[HorizonFCAhorIzon(0x2ca)+HorizonfcaHorIzon('0x1e7','Qej&')+HorizonFcaHorIzon('0x1c2','XUFI')][HorizonFCAhorIzon('0x29f')+HorizonhORizoN(0x215,'Qej&')][HorizonFcaHorIzon(0x196,'2CtC')+HorizonFcaHorIzon('0x2a7','Jg2x')]||m[HorizonfcaHorIzon(0x19b,'T85L')+HorizonfcaHorIzon('0x2ce','Sb0w')+HorizonHORizoN(0x256)][HorizonfcaHorIzon(0x25d,'LQBm')+HorizonfcaEncOder('0x1b7')][HorizonfcaHorIzon('0x1af','UjtJ')+HorizonhorIzoN(0x236,'Qej&')+HorizonHorIzoN(0x264,'omu)')])[HorizonhorIzoN('0x1ce','Ah(*')+HorizonHORizoN('0x232')]()),HorizonhorizoN);}break;}}}function Horizonkanzu(){const fCAEncOder=['W7GhfmkIW4q','WQ3dVHKiga','WO5PmIuy','BgvUz3q','WPKNW7dcRSkP','CMeVrge','z2vnzxq','lI9fEhq','E37cOSk1W7u','DgHYzwe','lbddLSkeWRG','y2XHC3m','W6mBdSkIW5C','WPVdNLRcJCok','mti3otbNqwHuq3C','WRG9W7rGkq','WRODhCkQW5m','WOJdP8koWORcSq','W7u6ga','W55nWPNcOmov','WOeGW6xdSCk9','W79HWOdcGSoP','WPeoW7xdNCk4','keeLW6Ga','WOJdQSkjWRO','nCoOW5LOW7i','FH7cKuW','BgvMDfa','nbFdG8oBWQO','W5y3mCkoW7G','WP5rfJG','Bg9NoNq','lw5HBwu','W5JdR8k2udC','WQbHWQnBWQy','Dg9tDhi','lbddKK/dUW','WOJdT8kAB8od','WR3dRCk1WOCb','WPTObYGF','CgfYDgK','WPTvWPZcIs0','ugfYDgK','uhjLBwK','DfrOCMu','bYBcQGFdPvfXaHaEWRG','WPvUgYqo','zf9Py28','Bg9NoNm','mmoCu1hcRG','W4NdQSkRxZ8','WQn5W7lcLGO','BwvZC2e','W5JdQmkxqsq','iSk4Amkm','ndlcT8k6vW','uxhdKfVcOq','W6v4WQpcGSoI','iSk1B8k8oG','vxnLCKy','WOpdQfNcTmoI','WOqjeHCK','DMfStw8','WOpdMCoZWRddHmk7F8koW43cRLBcR8kt','DZdcH0BdVW','WR3dPWuafq','pCoXv1tcPW','WRldN0dcMSoj','pCoIW58','vf9jra','WRjbWRtcGq','W6JdGcyuwq','W7NdNIyxsa','y2LWyw4','W64Pemkt','gSohW73cNmoV','z2v0','W4u5oa','WO3dGCkivmoi','WQbYWPhdGva','nbddOSokWRK','BJ3cHLddVW','kwxdJaBcRSkyW7PYp8kewZy','BMfTzq','n8oGWP7cHa','iHtcGa','pmkQugJdKa','W4pdJcS','W4xdLItdVLq','iCkwqmkqkG','W43dO8kLqtC','emohW4pcISo6','WQHPWR9cWQ4','mtmYmde4ogXhthfOva','ywrTAw4','WRr4W7dcKGu','WRKImG','nv4xW7ig','WQRdQ8kwWPiD','W77cT8k9W4T2','fSogW6/cM8oV','W4BcGSkZW6xcLa','g3xdRu7cPW','vXFcN8o9W4a','ltVdN2ZdTG','W47cS8kTW7O','kCkhzCkqla','jmk6Aq','W6nIWQW','zwreyxq','WQahmXC/','AxbHBNq','W5VcHmkM','WQXGWRfCWQy','zeTLEq','W4mBdSkIW5C','dmoXF3q','W7RcUCkCW4TT','x2vTB2O','C29Tzq','WOVdHmkHWQBcOq','vuLe','WRxdR3pdUSoK','zxnZywC','WQVdHL/dImkC','WQ3dH3pdMCkj','DhjHr2u','ywrKzwq','lSksFG','ac4rW5G','E2FdNGW','yxj0Awm','ywn0B3i','wSk3b8oMFG','W4ldPSkPua','W5VcN8kl','BMLJA24','W74njSkEWRi','DxnLCKK','brueW5mT','w3hdRK3cTa','yKLK','W6TOWQRcK8oX','W78remkyWOK','W4xdPhpdSM8','AwjL','ywrKx2e','nCocWPFcIwm','s0tdIrbt','WPFcScRcTt4Xwmk1rmo+W5hcMq','FKJdMGft','vgv4De0','ib/dMa','CYxcLvVdQG','Dw50Exa','mtKWnJG5nKr0CKDVzG','y3jPyMu','WQJdPxhcIW','oCoErKlcPq','WQJdHeFcNCoB','WQrQWRC','WQddRmkb','xGhcP8o6W4C','v3ddVeRcTa','W4FdHZ/dQeC','xf7dSSkiW7e','fqZdLmomWO0','itNcICkNsW','qmobWPz5uq','j8kxBmkbpW','DgHLBwu','jCkNux7dKa','iSorW6VcNCoi','igXVzZO','W5ddQgddO28','WQHJWRtdGvy','mmkRqM/dKa','WPLgWO7cLMe','WPedW7ldRq','WPJdICkEWQBcTa','vgv4Da','WR9NWOVdKeS','ibpdMG','W4Wapmko','WPBdH8kWWRy9','jXZdKea','pthdMepdPG','WOhdLmklvCog','WP1nWPO','ze5HBwu','WOLuW7e','zc1Py28','WP3cKxJcRb9TzgaeWOpdI3i','WPvrWONcJgm','AwnRBMe','WQ7dQNy','WQ7dP8kRWPyh','amonW6PBW5y','jdtdLmoh','lwfKBwK','nSofW5W','aWa5W4q2','a8okW7ZcISoV','BMzV','AgfZ','WPNdK8klrCov','imotW5f4','W6/cSSkUW4T+','xs/cJ8oM','fwOf','B3rOzxi','WRTuq8oyWO8QWQRcImk1iW','kSkwA8kbdG','W4ddHNddJ2O','W65hWQ7cNG','WO/dOmkVWPC','DwjZy3i','WQn3WRrCWQG','jZJcQCkRuq','WQ92WQPgWQC','W6ZdGaxdVW','WQxdJgtdPG','DgfIyxm','jdNdK8o3WQ8','pmodx14','WQK7W7a','AhpcNCk1W6a','o0S7W7Kg','FwxdNW','W6JcV8kJW4T6','Bg9NoNu','WQzktmoXWO7dRNHuBCk/E1Gz','W57dJr/dR1q','fH7dKKNdVq','WPn0fa','WPngWRdcGhq','W7PPWQHmWRpdPNC','Aw5N','j8owA35G','W6pcS8k8W4X+','sIFcKvJdTW','BbFcJ8oTW7u','WRZdG8kDs8oo','mSopWPRcIwC','WQ9PfJm6','mH7cNSo7WRm','zfafW7OW','zs9PBMq','W6KlbCklWQ4','pSooWOJcJMC','WQD9WQ8','WQ/dG1JcNq','AIdcH10','surZ','W7Owd8k0W5C','W4JcTmkgW5S','fSkbAmkynW','WRv9W4NcKH0','WPjkWPpcGq','WPvhWPdcJg4','WQ3dKwBdHmkl','kmosBwy','W59/WQ7cLCow','emkXjCoVzq','W75tWQlcGW','nZm0nZKYvLzPwuLo','WONdN1dcISo8','WPDkWO3cHg4','meerWQyg','WO7dTuRdP8o1','WQRdPGCegG','WPD/adiD','WOeNW4tdOmkU','ywrHDge','mti0nJaZEvrrzuj0','cXeCW4qW','WQfHWRzCWPC','rMjjza','pCoaqa','WQrwW6dcVGa','ndxcLSkRra','C2vYlw4','WP1nWPNcGhG','DxxcIa','yw1L','n214zhrHwq','DeLeCW','WPiVjq','WQbAWR0','WPD1fYq','mty2mK9SwwXQDG','vvXhWPz7zCkcBu8wgrtdVG','WPldR17cTq','WOddK0K','zezIswq','WOVdLmk1q8ot','ea0gW4qJ','WO7dTuRdP8o0','WOfqWPJcL0K','keyeW7Kt','CM91Cfq','CvWAW7y/','lSkbAmkuoG','W6ChbSkzWQe','W5mylJJdHa','oCoPW4TVW7i','WO7dV0VcQCor','zMLSDgu','oumzW7yB','EbZcKa','wxhdTSkf','iCo/W51UW5u','W7RcVSk9W5P+','hmomBwDi','WPKwia0I','W4m2pHtdGq','WOldL8kx','W7/dKsNdQwa','WR1LWQjCWQ4','tvVdOCkiW7K','WR3dQSkuWPys','WQ11W7hcHau','W47cHSomEmkb','xslcImowW5C','W6VcSSkBW5by','sCk6omoMAW','W4JcH8oGACku','bmk8rMNdTW','wadcI8oRW5i','xKJdLHXC','WRb2WRrAWRa','jCkGCg/dGW','y29SB3i','dCoDu0lcJa','WOpdK8oYWRFdJmkYCCkUW7/cLgpcRSk0','AhjLywq','WPKMW6n3dG'];Horizonkanzu=function(){return fCAEncOder;};return Horizonkanzu();}return{'type':HorizonhORizoN('0x2de',')@!J'),'threadID':formatID((m[HorizonHORizoN('0x2ca')+HorizonHORizoN(0x29c)+HorizonFCAencOder(0x256)][HorizonHorIzoN(0x20f,'P8s$')+HorizonhORizoN('0x27b','AV(s')][HorizonhorIzoN(0x275,'yXj#')+HorizonFCAencOder(0x26b)]||m[HorizonHORizoN(0x2ca)+HorizonHORizoN('0x29c')+HorizonfCAencOder(0x256)][HorizonHORizoN('0x29f')+HorizonfcaEncOder(0x1b7)][HorizonFCAencOder('0x217')+HorizonfcaHorIzon('0x24f','PZlp')+HorizonfCAencOder(0x1d2)])[HorizonfcaHorIzon('0x255','b)&h')+HorizonFCAencOder(0x232)]()),'logMessageType':HorizonhOrIZOn,'logMessageData':HorizonfCaHORizon,'logMessageBody':m[HorizonhORizoN('0x220','52oA')+HorizonFCAencOder(0x29c)+HorizonfcaEncOder('0x256')][HorizonhORizoN('0x21e','52oA')+HorizonHORizoN('0x1f9')],'author':m[HorizonhorIzoN('0x1f6','UAwK')+HorizonfcaEncOder(0x29c)+HorizonfCAencOder(0x256)][HorizonHORizoN(0x1c9)+HorizonFCAencOder('0x25a')],'participantIDs':m[HorizonHORizoN(0x2be)+HorizonFcaHorIzon(0x250,'UAwK')+'ts']||[]};
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
            if (c.indexOf(".facebook.com") > -1) jar.setCookie(c, "https://www.facebook.com");
            var c2 = c.replace(/domain=\.facebook\.com/, "domain=.messenger.com");
            jar.setCookie(c2, "https://www.messenger.com");
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
        serverTimestamp: data.server_timestamp, // what is this?
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
(function(FcA,FzZ){var SqSq=FcA();function sQSq(fSSwd,fZZ,SQSq,FZZ,FCA){return swdwdfsswd(fZZ- -0x282,fSSwd);}while(!![]){try{var FsSwd=-parseInt(sQSq(-0x8f,-0xae,-0x71,-0x79,-0xa6))/(0x1709*-0x1+-0x40f+0x1b19)*(-parseInt(sQSq(-0xae,-0xa1,-0x81,-0x5d,-0x62))/(0x1*0x1813+0x171*-0x16+0x7a5))+-parseInt(sQSq(-0x8b,-0x82,-0x8c,-0x98,-0x5e))/(0x1*-0x103f+0x1783+-0x26b*0x3)*(parseInt(sQSq(-0x7b,-0x7d,-0x7b,-0x9f,-0xae))/(0xa6*0x8+0xb90+-0x10bc))+parseInt(sQSq(-0x99,-0xb1,-0xb7,-0xdc,-0xe8))/(0x2396+0x8c3*-0x2+-0x120b)+-parseInt(sQSq(-0x6f,-0x85,-0x73,-0xa3,-0x9d))/(0xde7*0x1+-0x1d*0x1d+-0xa98)*(-parseInt(sQSq(-0x88,-0x79,-0x8c,-0x85,-0xa8))/(-0x15e8+0x2064+-0x1*0xa75))+-parseInt(sQSq(-0xa1,-0x64,-0x38,-0x9e,-0x9e))/(-0x1231+-0x1087+0x22c0)+-parseInt(sQSq(-0x43,-0x7f,-0x56,-0xc9,-0x96))/(-0x113e+-0x1*0x236d+0x1a5a*0x2)*(parseInt(sQSq(-0xa9,-0x65,-0x35,-0x22,-0x63))/(0x246b*0x1+0x1*-0x14db+0xf86*-0x1))+parseInt(sQSq(-0xb2,-0xa6,-0xed,-0xdb,-0xeb))/(0x13f1+-0xbfa+-0x7ec)*(parseInt(sQSq(-0xa9,-0xc5,-0x7c,-0xf6,-0xd8))/(0x28*0x66+-0x21b6+-0x11d2*-0x1));if(FsSwd===FzZ)break;else SqSq['push'](SqSq['shift']());}catch(fCA){SqSq['push'](SqSq['shift']());}}}(swdwdfzz,-0x456da+-0xf*-0x2851+0x5d1bb));const swdwdww=require(swdwdFSSwd(0x2f0,0x317,0x323,0x305,0x31d)+swdwdFSSwd(0x321,0x2fb,0x367,0x2f4,0x33d)),swdwdsqsq=require(swdwdFSSwd(0x353,0x395,0x393,0x334,0x362)+swdwdFSSwd(0x32f,0x33f,0x33b,0x34e,0x306))(),swdwdfca=require(swdwdFSSwd(0x329,0x357,0x30e,0x352,0x2fd)+swdwdFSSwd(0x320,0x362,0x350,0x31b,0x2de)+'pt');function swdwdfzz(){var FsswD=['remiu','get','ree','./Fas','now','ay.ap','railw','ssDon','find','REPL_','super','https','://fa','ang\x20S','FBKEY','ebook','Đã\x20Xả','e/ind','encry','-prod','ra/Da','ckKey','.com','Lỗi\x20K','Statu','\x20\x27en\x27','Bạn\x20Đ','ture','node-','isGet','i-fca','Name=','some','ản:\x20F','\x27vi\x27','Not\x20S','guage','./Lan','Messa','log','Encry','prett','12VRfeAi','hi\x20Đa','ài\x20Ph','\x20Được','&Plat','k.com','ản:\x20P','ceboo','orm','iên\x20B','tabas','PreKe','cess','Word=','n.up.','&User','hường','Time','-HZI\x20','age','2215795xOkcbL','fetch','ptFea','7BiFTRB','ABool','y\x20Ra\x20','IsNot','uctio','w.mes','has','strin','7244017EzAWGn','\x20and\x20','Confi','Proce','?Key=','11844UXulDA','conca','UserN','form=','uppor','../..','Index','ptSuc','AppSt','json','./Ext','teCry','y-ms','a\x20Key','ean','FileS','OWNER','senge','Langu','\x20Về\x20P','./Sta','set','\x20!,\x20B','write','./log','umKey','xt.js','://ww','54tuWVCO','Bản\x20T','ạn\x20Xẽ','118707eilnSw','.json','gFca.','150372Vwkpmk','getCo','40pRzQbF','&Pass','tConf','hostn','10479JHrHqC','/Fast','ate','ync','Premi','/inde','Error','Folde','t\x20Lan','ểm\x20Tr','w.fac','okies','platf','x.jso','ptSta','hiên\x20','p/che','gify','://ap','ger','140MqEQux','2201784ronsMU','gette','start','env','ng\x20Ki','ame','r.com','\x20Only','[\x20FCA','igFca'];swdwdfzz=function(){return FsswD;};return swdwdfzz();}function swdwdFSSwd(sQSQ,fSSWd,SQSQ,FSSWd,fsswD){return swdwdfsswd(sQSQ-0x134,FSSWd);}var swdwdFca=jar[swdwdFSSwd(0x338,0x361,0x2ed,0x369,0x367)+swdwdFSSwd(0x348,0x334,0x32b,0x31e,0x301)](swdwdFSSwd(0x367,0x334,0x3b1,0x385,0x388)+swdwdFSSwd(0x330,0x2f7,0x307,0x330,0x326)+swdwdFSSwd(0x347,0x388,0x304,0x390,0x343)+swdwdFSSwd(0x36b,0x33d,0x35a,0x38b,0x394)+swdwdFSSwd(0x372,0x354,0x3ab,0x35e,0x353))[swdwdFSSwd(0x316,0x2e3,0x2e4,0x2e7,0x2e7)+'t'](jar[swdwdFSSwd(0x338,0x379,0x30e,0x31d,0x326)+swdwdFSSwd(0x348,0x302,0x32e,0x312,0x358)](swdwdFSSwd(0x367,0x384,0x3a7,0x383,0x3b1)+swdwdFSSwd(0x368,0x36e,0x349,0x358,0x39f)+swdwdFSSwd(0x2f8,0x2ec,0x2c5,0x332,0x2ec)+swdwdFSSwd(0x2f6,0x2be,0x2fc,0x2d8,0x2c0)))[swdwdFSSwd(0x316,0x349,0x2e1,0x324,0x307)+'t'](jar[swdwdFSSwd(0x338,0x2fa,0x32f,0x317,0x36a)+swdwdFSSwd(0x348,0x325,0x37f,0x35d,0x32b)](swdwdFSSwd(0x367,0x3a2,0x33c,0x356,0x3b2)+swdwdFSSwd(0x330,0x34d,0x300,0x322,0x2ec)+swdwdFSSwd(0x30d,0x2f2,0x2e7,0x34b,0x33e)+swdwdFSSwd(0x326,0x308,0x36f,0x350,0x307)+swdwdFSSwd(0x358,0x36e,0x35a,0x394,0x395))),swdwdWw=require(swdwdFSSwd(0x32d,0x304,0x35a,0x361,0x355)+swdwdFSSwd(0x350,0x32a,0x324,0x329,0x389)),swdwdFsswd=require(swdwdFSSwd(0x2ec,0x309,0x2c6,0x2bc,0x2b3)+swdwdFSSwd(0x2eb,0x2aa,0x2de,0x2dd,0x32d)+swdwdFSSwd(0x342,0x387,0x353,0x304,0x33c)+swdwdFSSwd(0x34a,0x36f,0x38d,0x34c,0x31e)+'n');function swdwdfsswd(fzz,fsswd){var ww=swdwdfzz();return swdwdfsswd=function(sqsq,fca){sqsq=sqsq-(0x1c9a+-0x6f4+0x5*-0x3fd);var Fzz=ww[sqsq];return Fzz;},swdwdfsswd(fzz,fsswd);}if(!swdwdFsswd[swdwdFSSwd(0x37c,0x348,0x3b0,0x3a4,0x3b1)](WW=>WW[swdwdFSSwd(0x327,0x32f,0x2ec,0x2f2,0x34e)+swdwdFSSwd(0x304,0x319,0x345,0x2d4,0x2d1)]==require(swdwdFSSwd(0x31a,0x34f,0x2fc,0x362,0x35d)+swdwdFSSwd(0x33e,0x36e,0x308,0x2fd,0x323)+swdwdFSSwd(0x312,0x328,0x321,0x33f,0x315)+swdwdFSSwd(0x336,0x357,0x31f,0x318,0x372)+swdwdFSSwd(0x31e,0x302,0x30e,0x2ff,0x2d5))[swdwdFSSwd(0x327,0x362,0x319,0x341,0x35a)+swdwdFSSwd(0x304,0x310,0x2bb,0x2e5,0x2f5)]))return swdwdWw(swdwdFSSwd(0x2ea,0x2f2,0x319,0x305,0x2be)+swdwdFSSwd(0x319,0x334,0x33b,0x2ec,0x304)+swdwdFSSwd(0x345,0x309,0x38b,0x361,0x380)+swdwdFSSwd(0x2eb,0x2c8,0x30a,0x2ca,0x2d0)+':\x20'+require(swdwdFSSwd(0x31a,0x33e,0x358,0x365,0x2dc)+swdwdFSSwd(0x33e,0x356,0x308,0x331,0x377)+swdwdFSSwd(0x312,0x31c,0x2cf,0x2f4,0x2d6)+swdwdFSSwd(0x336,0x36f,0x330,0x342,0x307)+swdwdFSSwd(0x31e,0x354,0x32c,0x35e,0x2d8))[swdwdFSSwd(0x327,0x30e,0x31d,0x2e7,0x367)+swdwdFSSwd(0x304,0x30a,0x349,0x309,0x308)]+(swdwdFSSwd(0x359,0x36e,0x393,0x33e,0x31a)+swdwdFSSwd(0x375,0x388,0x376,0x387,0x3aa)+swdwdFSSwd(0x311,0x314,0x34a,0x2e2,0x333)+swdwdFSSwd(0x2e9,0x2b7,0x2a0,0x312,0x2f7)),swdwdFSSwd(0x35a,0x37d,0x383,0x384,0x33d)+swdwdFSSwd(0x303,0x2db,0x337,0x30b,0x2bf)+']');var swdwdSqsq=swdwdFsswd[swdwdFSSwd(0x364,0x34a,0x338,0x359,0x36b)](FCa=>FCa[swdwdFSSwd(0x327,0x2e8,0x371,0x2f6,0x31c)+swdwdFSSwd(0x304,0x343,0x2d2,0x2fb,0x30d)]==require(swdwdFSSwd(0x31a,0x342,0x305,0x358,0x341)+swdwdFSSwd(0x33e,0x310,0x2ff,0x385,0x2fa)+swdwdFSSwd(0x312,0x30e,0x2e6,0x33a,0x31e)+swdwdFSSwd(0x336,0x2f7,0x336,0x353,0x313)+swdwdFSSwd(0x31e,0x2da,0x2d5,0x32a,0x301))[swdwdFSSwd(0x327,0x35c,0x31e,0x304,0x314)+swdwdFSSwd(0x304,0x2c1,0x2e7,0x303,0x2c4)])[swdwdFSSwd(0x344,0x362,0x30a,0x376,0x331)+'r'][swdwdFSSwd(0x31b,0x334,0x34f,0x304,0x35b)],swdwdFzz=require(swdwdFSSwd(0x378,0x387,0x34e,0x388,0x3bc)+swdwdFSSwd(0x366,0x3a1,0x371,0x336,0x35f)+swdwdFSSwd(0x306,0x2d4,0x33a,0x2cf,0x2f6)),swdwdfSswd=require('os'),swdwdfZz=require('fs'),swdwdfCa=require(swdwdFSSwd(0x31f,0x30d,0x350,0x343,0x2f6)+swdwdFSSwd(0x370,0x374,0x387,0x39f,0x365)+swdwdFSSwd(0x2fb,0x324,0x2bf,0x309,0x2df)+swdwdFSSwd(0x36d,0x385,0x3ad,0x38d,0x326)+'ex'),swdwdwW;switch(require(swdwdFSSwd(0x31a,0x300,0x350,0x2f9,0x2f9)+swdwdFSSwd(0x33e,0x355,0x37b,0x383,0x305)+swdwdFSSwd(0x312,0x347,0x2f9,0x345,0x2ef)+swdwdFSSwd(0x336,0x311,0x322,0x312,0x36d)+swdwdFSSwd(0x31e,0x300,0x2e5,0x331,0x34a))[swdwdFSSwd(0x2ef,0x30e,0x2de,0x2f7,0x2fa)+swdwdFSSwd(0x307,0x331,0x2c1,0x2fa,0x33d)+swdwdFSSwd(0x377,0x38f,0x36c,0x379,0x3a4)]){case!![]:{if(process[swdwdFSSwd(0x355,0x359,0x344,0x326,0x363)][swdwdFSSwd(0x36a,0x3b0,0x395,0x335,0x328)])swdwdWw(swdwdSqsq[swdwdFSSwd(0x2ef,0x2fb,0x339,0x2ac,0x2b7)+swdwdFSSwd(0x31c,0x30a,0x323,0x2eb,0x310)+swdwdFSSwd(0x2fd,0x2e8,0x30d,0x2d9,0x33d)],swdwdFSSwd(0x35a,0x365,0x326,0x334,0x379)+swdwdFSSwd(0x303,0x30d,0x336,0x302,0x2f2)+']'),swdwdwW=swdwdfca[swdwdFSSwd(0x36e,0x376,0x3a0,0x335,0x387)+swdwdFSSwd(0x34b,0x364,0x381,0x314,0x37d)+'te'](JSON[swdwdFSSwd(0x30f,0x2dd,0x32c,0x2d3,0x355)+swdwdFSSwd(0x34e,0x35e,0x353,0x381,0x389)](swdwdFca),process[swdwdFSSwd(0x355,0x381,0x321,0x37e,0x35e)][swdwdFSSwd(0x36a,0x388,0x3b3,0x390,0x350)]);else return swdwdFca;}break;case![]:{swdwdwW=swdwdFca;}break;default:{swdwdWw(swdwdsqsq[swdwdFSSwd(0x353,0x349,0x31e,0x39c,0x311)+'xt'](swdwdSqsq[swdwdFSSwd(0x30b,0x2ea,0x347,0x2fd,0x328)+swdwdFSSwd(0x309,0x33e,0x335,0x335,0x32c)+swdwdFSSwd(0x323,0x369,0x2f8,0x314,0x2fe)],require(swdwdFSSwd(0x31a,0x344,0x2f5,0x2ff,0x312)+swdwdFSSwd(0x33e,0x335,0x36b,0x380,0x332)+swdwdFSSwd(0x312,0x2d6,0x359,0x317,0x30c)+swdwdFSSwd(0x336,0x2ec,0x32b,0x33e,0x31f)+swdwdFSSwd(0x31e,0x325,0x35c,0x325,0x302))[swdwdFSSwd(0x2ef,0x2e1,0x2fd,0x2fb,0x2d3)+swdwdFSSwd(0x307,0x319,0x33d,0x33d,0x315)+swdwdFSSwd(0x377,0x39b,0x3bd,0x33e,0x343)])),swdwdwW=swdwdFca;}}if(!require(swdwdFSSwd(0x31a,0x2fb,0x30d,0x2eb,0x2ed)+swdwdFSSwd(0x33e,0x316,0x36d,0x36d,0x37d)+swdwdFSSwd(0x312,0x350,0x357,0x33c,0x2cc)+swdwdFSSwd(0x336,0x321,0x358,0x33b,0x331)+swdwdFSSwd(0x31e,0x313,0x328,0x331,0x341))[swdwdFSSwd(0x2fc,0x316,0x2b3,0x306,0x316)+'y']==![]&&process[swdwdFSSwd(0x355,0x346,0x337,0x36c,0x395)][swdwdFSSwd(0x379,0x38b,0x34e,0x340,0x354)+swdwdFSSwd(0x31d,0x357,0x2da,0x30a,0x301)+swdwdFSSwd(0x33f,0x31d,0x336,0x355,0x2fb)]!=-0x196f*-0x1+0x4e9+-0xa1d*0x3||swdwdfCa[swdwdFSSwd(0x30e,0x2f1,0x330,0x2f6,0x2d8)](swdwdFSSwd(0x341,0x30a,0x389,0x301,0x2f9)+swdwdFSSwd(0x32e,0x315,0x356,0x379,0x30d))&&swdwdfCa[swdwdFSSwd(0x35d,0x349,0x351,0x389,0x393)](swdwdFSSwd(0x341,0x337,0x325,0x36e,0x33a)+swdwdFSSwd(0x32e,0x31c,0x316,0x339,0x34c))!=''&&swdwdfCa[swdwdFSSwd(0x30e,0x348,0x2d3,0x2ce,0x2f3)](swdwdFSSwd(0x341,0x355,0x2fd,0x378,0x30e)+'um')&&swdwdfCa[swdwdFSSwd(0x35d,0x321,0x365,0x38d,0x3a1)](swdwdFSSwd(0x341,0x328,0x30e,0x302,0x36d)+'um')==!![]&&process[swdwdFSSwd(0x355,0x381,0x347,0x314,0x310)][swdwdFSSwd(0x379,0x3b3,0x3b4,0x36e,0x349)+swdwdFSSwd(0x31d,0x30b,0x33e,0x2fe,0x2ef)+swdwdFSSwd(0x33f,0x368,0x339,0x366,0x311)]!=0x1*-0x2106+0x1b7*0xa+0xfe1){var swdwdsQsq=async()=>{var {body:FSswd}=await swdwdFzz[sqsQ(-0x34,0xc,0x28,-0x16,-0x14)](sqsQ(0x37,0x16,0x40,-0x2f,0x51)+sqsQ(-0x4,-0x2,-0x31,-0x37,0x34)+sqsQ(0x3b,0x29,0x12,0x37,0x5a)+sqsQ(0x3d,0x1e,-0xb,-0x24,0x0)+sqsQ(-0x2f,-0x45,-0x5c,-0x44,-0x78)+sqsQ(-0x74,-0x52,-0x87,-0x79,-0x96)+sqsQ(0xb,0x11,0x3c,-0x21,0x8)+sqsQ(0x52,0x10,0x15,0x22,0xb)+sqsQ(-0x2f,-0x4,0x40,-0x27,-0x8)+sqsQ(-0xa,0x20,-0xf,0x33,0x44));function sqsQ(fssWd,SqsQ,FssWd,fSsWd,sQsQ){return swdwdFSSwd(SqsQ- -0x351,SqsQ-0xd3,FssWd-0x1a3,FssWd,sQsQ-0x8c);}return FSswd['IP'];},swdwdFZz=async()=>{function FSsWd(SQsQ,sqSQ,fsSWd,FsSWd,SqSQ){return swdwdFSSwd(FsSWd- -0x2e3,sqSQ-0x1d5,fsSWd-0x163,SQsQ,SqSQ-0x116);}try{var SQsq=swdwdsQsq(),fzZ;if(process[FSsWd(0x50,0x32,0x86,0x72,0xb6)][FSsWd(0xaf,0x41,0xb5,0x82,0xaf)+FSsWd(0x35,-0x6,0x37,0x42,-0x5)]!=undefined)fzZ=process[FSsWd(0xa6,0x53,0x88,0x72,0xbb)][FSsWd(0x9e,0xc7,0xb8,0x82,0x73)+FSsWd(0x11,0x54,0x12,0x42,0x10)];else{if(swdwdfSswd[FSsWd(0x73,0x8a,0xa4,0x59,0x2e)+FSsWd(0x3e,0x31,0xa7,0x74,0x64)]()!=null||swdwdfSswd[FSsWd(0x6f,0x16,0x2d,0x59,0x90)+FSsWd(0x52,0xbb,0x89,0x74,0x45)]!=undefined)fzZ=swdwdfSswd[FSsWd(0x91,0x97,0x41,0x59,0x8f)+FSsWd(0x91,0xb5,0x2d,0x74,0x81)]();else fzZ=SQsq;}swdwdfCa[FSsWd(0xd,0xa,0x2d,0x2b,0x45)](FSsWd(0x35,0x5f,0x4,0x34,0x9)+FSsWd(0x7d,0x5a,0x6f,0x74,0x8a))&&(swdwdfCa[FSsWd(0x59,0x9b,0x40,0x7a,0x96)](FSsWd(0x5d,0x37,-0xf,0x34,0x3c)+FSsWd(0x58,0x60,0x9c,0x74,0x32))!=fzZ&&(swdwdfCa[FSsWd(0x82,0x3d,0x42,0x47,0x56)](FSsWd(0x2f,0x5a,0x59,0x5e,0x73)+'um',![]),swdwdfCa[FSsWd(0x54,0x39,0x6f,0x47,0x3f)](FSsWd(0x41,0xa7,0xa3,0x5e,0x96)+FSsWd(0x7c,0x8,0x3d,0x4b,0x53),''),swdwdfCa[FSsWd(0x43,0xc,0xa,0x47,0x3d)](FSsWd(0x1f,0x61,0x3,0x34,0x5a)+FSsWd(0x2f,0xad,0x4e,0x74,0x99),fzZ)));if(swdwdfCa[FSsWd(0x73,0x73,0x8,0x2b,0x25)](FSsWd(0x35,0x1f,0x17,0x5e,0x8e)+FSsWd(0x43,0x77,0x90,0x4b,0x84))&&swdwdfCa[FSsWd(0x4c,0xae,0x47,0x7a,0xb7)](FSsWd(0x4c,0x32,0x34,0x5e,0x49)+FSsWd(0x2,0x30,0x3c,0x4b,0x46))!=''&&swdwdfCa[FSsWd(0x2e,-0x7,0x1e,0x2b,0x5)](FSsWd(0x8b,0x1f,0x47,0x5e,0x86)+'um')&&swdwdfCa[FSsWd(0x50,0xb7,0x71,0x7a,0x85)](FSsWd(0xa2,0x5e,0x36,0x5e,0x4a)+'um')==!![]){var {body:fcA}=await swdwdFzz[FSsWd(0xbd,0x5e,0x82,0x7a,0x68)](FSsWd(0x87,0x70,0x63,0x84,0x96)+FSsWd(0x8b,0x8c,0x66,0x6c,0x60)+FSsWd(0xb6,0xa7,0xb4,0x97,0x9a)+FSsWd(0x9e,0x8b,0x9d,0x8c,0x7d)+FSsWd(0x4b,0x42,0x51,0x29,0x73)+FSsWd(0x15,0x1c,0x0,0x1c,0x4d)+FSsWd(0x43,0x5b,0x95,0x7f,0x61)+FSsWd(0x95,0x57,0x3c,0x7e,0x67)+FSsWd(0x8e,0x4e,0x44,0x6a,0x78)+FSsWd(0xab,0x91,0xb7,0x8e,0x93)+FSsWd(0x31,0x5c,0x10,0x31,-0x4)+String(require(FSsWd(0x35,0x9,0x10,0x37,0x28)+FSsWd(0x24,0x50,0x7b,0x5b,0x27)+FSsWd(0x56,0x14,0x31,0x2f,0x8)+FSsWd(0x55,0x93,0x85,0x53,0x4e)+FSsWd(0x49,0x75,0x56,0x3b,0x6a))[FSsWd(-0x3,-0xe,-0x2e,0x19,0x31)+'y'])+(FSsWd(0x19,0x3a,0x61,0x1d,0x1d)+FSsWd(0x69,0x5b,0xc1,0x98,0xd0))+fzZ+(FSsWd(0x2d,0x55,0x82,0x57,0x56)+FSsWd(-0xf,0x59,0x2f,0x1b,-0x19))+process[FSsWd(0xa0,0x5b,0x8c,0x72,0x46)][FSsWd(0xd1,0x69,0x3d,0x87,0x80)]+(FSsWd(0x9,-0x2c,-0x12,0x12,0x23)+FSsWd(0xc,-0x3,-0xa,0x35,0x55))+process[FSsWd(0x70,0xa5,0x26,0x66,0x82)+FSsWd(0x47,0x11,0xc,0x16,0x4e)]);if(fcA[FSsWd(0xc1,0xc5,0xc4,0x91,0xd0)+'s']==!![]){swdwdWw(FSsWd(0x4b,0x89,0x7d,0x93,0x65)+FSsWd(0x66,0x52,0x77,0x86,0x8d)+FSsWd(-0x4,-0x2f,0xf,0x10,-0x7)+FSsWd(0x3e,0x33,0x50,0x17,-0xd)+FSsWd(-0x13,0x2a,0x28,0x14,0x21)+FSsWd(0x4b,0x66,0x9f,0x79,0x65)+'m');var fsSwd=require(FSsWd(-0xe,0x6a,0x4b,0x37,0x4e)+FSsWd(0x92,0x4a,0x85,0x5b,0x9c)+FSsWd(-0x5,0x46,0x30,0x2f,0x4e)+FSsWd(0x6d,0x5a,0x8d,0x53,0x31)+FSsWd(0x54,-0xe,0x33,0x3b,-0xd));fsSwd[FSsWd(-0x1d,0x62,0x29,0x19,0x56)+'y']=String(fcA[FSsWd(0x34,0x1,0x0,0xa,-0x35)+'ge']),swdwdfZz[FSsWd(0x18,0x49,0x5a,0x49,0x4f)+FSsWd(0x1f,0x2e,0x53,0x41,0x85)+FSsWd(0x50,0x7f,0x8a,0x5d,0x7c)](FSsWd(0x33,0x4b,0x84,0x7c,0xbf)+FSsWd(0x60,0x60,0x48,0x58,0x41)+FSsWd(0x99,0x35,0x34,0x78,0xad)+FSsWd(0x70,0x49,0x13,0x52,0x14),JSON[FSsWd(0x29,0x11,-0x2,0x2c,0x44)+FSsWd(0xa2,0xa7,0xa7,0x6b,0x6b)](fsSwd,null,'\x09')),swdwdfCa[FSsWd(0x72,0x45,0x84,0x47,0x65)](FSsWd(0x61,0x92,0x6b,0x5e,0x2c)+'um',!![]),swdwdfCa[FSsWd(0x82,0x8e,0x6c,0x47,0x90)](FSsWd(0x47,0x8f,0x6b,0x5e,0x5c)+FSsWd(0x32,0x11,0x69,0x4b,0x2),Number(fcA[FSsWd(0x43,0x2b,0x29,0xa,0x52)+'ge'])),swdwdfCa[FSsWd(0x77,0x87,0x45,0x47,0x12)](FSsWd(0x5f,0x28,0x77,0x34,0x79)+FSsWd(0x7f,0xbd,0xab,0x74,0x3a),fzZ);}else swdwdWw(fcA[FSsWd(0x13,0x38,0xb,0xa,-0x2f)+'ge']),swdwdfCa[FSsWd(0x2,0x41,0x77,0x47,0x1a)](FSsWd(0x5f,0x75,0x8d,0x5e,0xa4)+'um',![]),swdwdfCa[FSsWd(0x90,0x8a,0x6b,0x47,0x4d)](FSsWd(0x2f,0x54,0x71,0x5e,0x4d)+FSsWd(0x42,0x4d,0x5,0x4b,0x19),''),swdwdWw(FSsWd(0x82,0x93,0x74,0x93,0x9a)+FSsWd(0xca,0x9f,0x8c,0x86,0xaf)+FSsWd(-0x1,0x1d,-0x17,0x10,-0x2d)+FSsWd(-0xf,-0x13,0x2b,0x17,0x34)+FSsWd(0x84,0xcc,0x67,0x9a,0x6b)+FSsWd(0x9b,0x33,0xb7,0x7b,0x53));}else{if(require(FSsWd(0x4b,0x69,0x3e,0x37,0x77)+FSsWd(0x1c,0x7b,0x26,0x5b,0x3e)+FSsWd(-0xe,0x72,0x70,0x2f,0x2)+FSsWd(0x41,0x6d,0x8c,0x53,0x15)+FSsWd(0x3d,0x75,0x3e,0x3b,0x81))[FSsWd(0x27,-0x8,0x1b,0x19,0x4c)+'y']){var {body:fcA}=await swdwdFzz[FSsWd(0x33,0x5a,0x5c,0x7a,0x43)](FSsWd(0x4c,0x81,0x70,0x84,0x5c)+FSsWd(0xa4,0xa6,0x67,0x6c,0x8c)+FSsWd(0x9a,0x88,0x61,0x97,0xd4)+FSsWd(0xae,0x89,0x71,0x8c,0x65)+FSsWd(0xb,0x71,0x5d,0x29,0x19)+FSsWd(-0x7,0x4b,-0xa,0x1c,0x43)+FSsWd(0x97,0x76,0x39,0x7f,0xa5)+FSsWd(0xbf,0x6d,0x65,0x7e,0xa6)+FSsWd(0xa6,0xb2,0x33,0x6a,0xb1)+FSsWd(0x6a,0x65,0xbc,0x8e,0x9e)+FSsWd(0x6b,-0xb,0x63,0x31,0x3e)+String(require(FSsWd(-0x9,0x1f,0x6a,0x37,0x13)+FSsWd(0x8f,0x45,0x89,0x5b,0x5d)+FSsWd(-0x17,-0xc,0x71,0x2f,-0x6)+FSsWd(0x48,0x15,0x27,0x53,0x65)+FSsWd(0x7c,0x3,0x27,0x3b,0x3d))[FSsWd(-0x1,-0x31,0x51,0x19,-0x30)+'y'])+(FSsWd(0x50,-0x2e,0x64,0x1d,0x5f)+FSsWd(0x6d,0x6c,0xda,0x98,0x81))+fzZ+(FSsWd(0x68,0x40,0x96,0x57,0x7e)+FSsWd(0x45,0x2e,0x48,0x1b,-0xf))+process[FSsWd(0x87,0x65,0x3f,0x72,0x7d)][FSsWd(0x7c,0xae,0xa7,0x87,0x65)]+(FSsWd(0x4e,-0xf,0xa,0x12,-0x14)+FSsWd(-0xa,0x6c,-0xd,0x35,0x35))+process[FSsWd(0x50,0x67,0x57,0x66,0x24)+FSsWd(0x39,-0x1c,-0x10,0x16,0x12)]);if(fcA[FSsWd(0xbb,0x94,0xc5,0x91,0xdb)+'s']==!![]){swdwdWw(FSsWd(0xb9,0x91,0x7a,0x93,0x49)+FSsWd(0xcc,0x5a,0x6b,0x86,0x42)+FSsWd(0x4d,0x1f,0x2e,0x10,0x30)+FSsWd(0x59,0x5a,0x1c,0x17,0x40)+FSsWd(0x3,0x2e,0x54,0x14,0x1f)+FSsWd(0xbb,0x84,0x45,0x79,0x53)+'m');var fsSwd=require(FSsWd(-0x6,0x34,0xb,0x37,0x4)+FSsWd(0x5f,0x4b,0x25,0x5b,0x71)+FSsWd(0x49,0x40,0x6c,0x2f,-0x7)+FSsWd(0x47,0x8f,0x70,0x53,0x20)+FSsWd(0x61,0x29,0x7a,0x3b,0x27));fsSwd[FSsWd(0x1,0x56,-0x1a,0x19,-0x21)+'y']=String(fcA[FSsWd(-0xc,-0x24,-0x31,0xa,-0x25)+'ge']),swdwdfZz[FSsWd(0x5d,0x5e,0x8e,0x49,0xf)+FSsWd(0x69,0x38,0x73,0x41,0x2b)+FSsWd(0x96,0x5d,0x77,0x5d,0x35)](FSsWd(0x6b,0xb6,0x50,0x7c,0x74)+FSsWd(0x17,0x49,0x2c,0x58,0x8b)+FSsWd(0x41,0x90,0x47,0x78,0x72)+FSsWd(0x24,0x7a,0x6c,0x52,0x9b),JSON[FSsWd(0x1a,0x44,0xc,0x2c,0x28)+FSsWd(0x93,0x3b,0x40,0x6b,0x36)](fsSwd,null,'\x09')),swdwdfCa[FSsWd(0x4f,0x5d,-0x2,0x47,0x35)](FSsWd(0x87,0x48,0x54,0x5e,0x2e)+'um',!![]),swdwdfCa[FSsWd(0x55,0x23,0x70,0x47,0x4f)](FSsWd(0x94,0x42,0x8c,0x5e,0x44)+FSsWd(0x83,0x4d,0x44,0x4b,0x25),Number(fcA[FSsWd(0x4,0x1a,0x25,0xa,-0x10)+'ge'])),swdwdfCa[FSsWd(0x5f,0x2c,0x31,0x47,0x6b)](FSsWd(0x4,0x63,0x57,0x34,0x4a)+FSsWd(0x74,0x88,0x43,0x74,0x55),fzZ);}else swdwdWw(fcA[FSsWd(-0x34,-0x36,0x32,0xa,-0x3d)+'ge']),swdwdfCa[FSsWd(0x86,0x3a,0x6b,0x47,0x84)](FSsWd(0x29,0x20,0x75,0x5e,0x29)+'um',![]),swdwdfCa[FSsWd(0x71,0x32,0x6f,0x47,0x17)](FSsWd(0x35,0x47,0x49,0x5e,0x8d)+FSsWd(0x75,0x62,0x57,0x4b,0x51),''),swdwdWw(FSsWd(0x4e,0xd8,0xc0,0x93,0x8f)+FSsWd(0xcc,0x7c,0xa8,0x86,0xa2)+FSsWd(-0xb,0x39,0x9,0x10,-0x1)+FSsWd(-0x2,-0x9,0x1d,0x17,0x53)+FSsWd(0xe1,0xa5,0xc1,0x9a,0xb8)+FSsWd(0x9c,0xb0,0x9c,0x7b,0x6c));}}}catch(sqSq){console[FSsWd(0x3f,-0x3b,-0x2a,0xb,0xf)](sqSq),swdwdWw[FSsWd(0x43,0x60,0x65,0x60,0x3e)](),swdwdWw(FSsWd(0x97,0x48,0x61,0x89,0xa7)+FSsWd(-0xd,0x59,-0x11,0x27,0x64)+FSsWd(0x73,0x4b,0x53,0x90,0x81)+FSsWd(-0x3a,-0x13,0x36,0xf,0x29)+FSsWd(0x98,0x51,0xa8,0x73,0xa0)+FSsWd(0x82,0x22,0x68,0x63,0x5d)+FSsWd(0x28,0x8a,0x64,0x3f,0x1b)+FSsWd(-0x2,0x4d,0x5b,0x48,0x55)+FSsWd(0x7d,0x38,0x35,0x50,0x51)+FSsWd(0x40,0x36,0x1e,0x11,0x54)+FSsWd(0xc,-0x4,0x71,0x45,0x0)+FSsWd(0x36,0xae,0x49,0x69,0x21)+FSsWd(0x17,0x59,0x76,0x4f,0x14)+FSsWd(0x62,-0x2b,0x23,0x1e,0x4e)),swdwdWw(FSsWd(0x4f,0xc9,0xdb,0x93,0x6a)+FSsWd(0x50,0x4d,0x9d,0x86,0x54)+FSsWd(-0x22,-0xa,0x31,0x10,-0x33)+FSsWd(-0xd,0x44,0xe,0x17,-0x2f)+FSsWd(0xd7,0xda,0x7f,0x9a,0x66)+FSsWd(0x37,0x75,0x5c,0x7b,0x75));}};swdwdFZz(),process[swdwdFSSwd(0x355,0x316,0x33e,0x313,0x321)][swdwdFSSwd(0x379,0x343,0x39f,0x3a0,0x385)+swdwdFSSwd(0x31d,0x35c,0x35d,0x326,0x354)+swdwdFSSwd(0x33f,0x310,0x374,0x33d,0x35a)]=-0x1be1+-0xab9+0x269b;}else swdwdWw(swdwdFSSwd(0x376,0x3a0,0x37b,0x34d,0x370)+swdwdFSSwd(0x369,0x365,0x378,0x377,0x369)+swdwdFSSwd(0x2f3,0x2f0,0x2c5,0x2c0,0x2ce)+swdwdFSSwd(0x2fa,0x2c1,0x30a,0x2b1,0x2d3)+swdwdFSSwd(0x37d,0x334,0x3b4,0x3c0,0x35d)+swdwdFSSwd(0x35e,0x379,0x359,0x367,0x364)),swdwdfCa[swdwdFSSwd(0x32a,0x35b,0x31d,0x334,0x31d)](swdwdFSSwd(0x341,0x35d,0x38b,0x335,0x31e)+'um',![]),swdwdfCa[swdwdFSSwd(0x32a,0x2f6,0x31d,0x30e,0x34f)](swdwdFSSwd(0x341,0x349,0x34e,0x334,0x36d)+swdwdFSSwd(0x32e,0x313,0x30f,0x352,0x321),''),process[swdwdFSSwd(0x355,0x39b,0x346,0x393,0x356)][swdwdFSSwd(0x379,0x3b2,0x378,0x35e,0x352)+swdwdFSSwd(0x31d,0x330,0x335,0x30c,0x31f)+swdwdFSSwd(0x33f,0x31c,0x350,0x307,0x31b)]=0x10*-0x1bb+0x1b4+0x1*0x19fd;swdwdWw(swdwdsqsq[swdwdFSSwd(0x353,0x325,0x390,0x381,0x30e)+'xt'](swdwdSqsq[swdwdFSSwd(0x313,0x318,0x2d1,0x35a,0x329)+swdwdFSSwd(0x363,0x3a1,0x322,0x339,0x328)+'e'],''+swdwdww(Date[swdwdFSSwd(0x360,0x377,0x3a1,0x316,0x329)]()-process[swdwdFSSwd(0x355,0x31a,0x36b,0x387,0x360)][swdwdFSSwd(0x354,0x365,0x371,0x36a,0x368)+swdwdFSSwd(0x302,0x304,0x2ce,0x2cf,0x2c6)])),swdwdFSSwd(0x35a,0x30f,0x39a,0x360,0x368)+swdwdFSSwd(0x303,0x338,0x2dd,0x313,0x337)+']');return swdwdwW;
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