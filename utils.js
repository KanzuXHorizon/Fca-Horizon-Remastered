// @ts-nocheck
/* eslint-disable no-undef */

/* eslint-disable no-prototype-builtins */

"use strict";
var url = require("url");
var log = require("npmlog");
var stream = require("stream");
var bluebird = require("bluebird");
var querystring = require("querystring");
var request = bluebird.promisify(require("request").defaults({ jar: true }));

/**
 * @param {any} url
 */

function setProxy(url) {
    if (typeof url == "undefined") return request = bluebird.promisify(require("request").defaults({ jar: true }));
    return request = bluebird.promisify(require("request").defaults({ jar: true, proxy: url }));
}

/**
 * @param {string | URL} url
 * @param {{ userAgent: any; }} options
 * @param {{ region: any; }} [ctx]
 * @param {undefined} [customHeader]
 */

function getHeaders(url, options, ctx, customHeader) {
    var headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://www.facebook.com/",
        Host: url.replace("https://", "").split("/")[0],
        Origin: "https://www.facebook.com",
        "user-agent": (options.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36"),
        Connection: "keep-alive",
        "sec-fetch-site": 'same-origin',
        "sec-fetch-mode": 'cors'
    };
    if (customHeader) Object.assign(headers, customHeader);
    if (ctx && ctx.region) headers["X-MSGR-Region"] = ctx.region;

    return headers;
}

/**
 * @param {{ _read: any; _readableState: any; }} obj
 */

function isReadableStream(obj) {
    return (
        obj instanceof stream.Stream &&
        (getType(obj._read) === "Function" ||
            getType(obj._read) === "AsyncFunction") &&
        getType(obj._readableState) === "Object"
    );
}

/**
 * @param {any} url
 * @param {any} jar
 * @param {{ [x: string]: any; fb_dtsg?: any; jazoest?: any; hasOwnProperty?: any; }} qs
 * @param {any} options
 * @param {any} ctx
 */

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

/**
 * @param {any} url
 * @param {any} jar
 * @param {{ __user: any; __req: string; __rev: any; __a: number; 
// __af: siteData.features,
fb_dtsg: any; jazoest: any; }} form
 * @param {{ __user: any; __req: string; __rev: any; __a: number; 
// __af: siteData.features,
fb_dtsg: any; jazoest: any; }} qs
 * @param {any} options
 * @param {any} ctx
 */

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

/**
 * @param {string | number | any[]} val
 * @param {number} [len]
 */

function padZeros(val, len) {
    val = String(val);
    len = len || 2;
    while (val.length < len) val = "0" + val;
    return val;
}

/**
 * @param {any} clientID
 */

function generateThreadingID(clientID) {
    var k = Date.now();
    var l = Math.floor(Math.random() * 4294967295);
    var m = clientID;
    return "<" + k + ":" + l + "-" + m + "@mail.projektitan.com>";
}

/**
 * @param {string | any[]} data
 */

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

/**
 * @param {string | number | boolean} str
 */

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
/**
 * @param {string} str
 */

function presenceDecode(str) {
    return decodeURIComponent(
        str.replace(/[_A-Z]/g, function(/** @type {string | number} */m) {
            return j[m];
        })
    );
}

/**
 * @param {string} userID
 */

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

/**
 * @param {{ mercury: any; blob_attachment: any; attach_type: any; sticker_attachment: any; extensible_attachment: { story_attachment: { target: { __typename: string; }; }; }; metadata: { stickerID: { toString: () => any; }; packID: { toString: () => any; }; spriteURI: any; spriteURI2x: any; width: any; height: any; frameCount: any; frameRate: any; framesPerRow: any; framesPerCol: any; fbid: { toString: () => any; }; url: any; dimensions: { split: (arg0: string) => any[]; width: any; height: any; }; duration: any; }; url: any; name: any; fileName: any; thumbnail_url: any; preview_url: any; preview_width: any; preview_height: any; large_preview_url: any; large_preview_width: any; large_preview_height: any; share: { share_id: { toString: () => any; }; title: any; description: any; source: any; media: { image: any; image_size: { width: any; height: any; }; playable: any; duration: any; animated_image_size: any; }; subattachments: any; uri: any; target: any; style_list: any; }; }} attachment1
 * @param {{ caption?: any; description?: any; id: any; is_malicious?: any; mime_type?: any; file_size?: any; filename?: any; image_data: any; href?: any; }} [attachment2]
 */

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
                properties: blob.story_attachment.properties.reduce(function(/** @type {{ [x: string]: any; }} */obj, /** @type {{ key: string | number; value: { text: any; }; }} */cur) {
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

/**
 * @param {any[]} attachments
 * @param {{ [x: string]: string | number; }} attachmentIds
 * @param {{ [x: string]: any; }} attachmentMap
 * @param {any} shareMap
 */

function formatAttachment(attachments, attachmentIds, attachmentMap, shareMap) {
    attachmentMap = shareMap || attachmentMap;
    return attachments ?
        attachments.map(function(/** @type {any} */val, /** @type {string | number} */i) {
            if (!attachmentMap ||
                !attachmentIds ||
                !attachmentMap[attachmentIds[i]]
            ) {
                return _formatAttachment(val);
            }
            return _formatAttachment(val, attachmentMap[attachmentIds[i]]);
        }) : [];
}

/**
 * @param {{ delta: { messageMetadata: any; data: { prng: string; }; body: string; attachments: any; participants: any; }; }} m
 */

function formatDeltaMessage(m) {
    var md = m.messageMetadata;
    var mdata =
        m.data === undefined ? [] :
        m.data.prng === undefined ? [] :
        JSON.parse(m.data.prng);
    var m_id = mdata.map((/** @type {{ i: any; }} */u) => u.i);
    var m_offset = mdata.map((/** @type {{ o: any; }} */u) => u.o);
    var m_length = mdata.map((/** @type {{ l: any; }} */u) => u.l);
    var mentions = {};
    var body = m.body || "";
    var args = body == "" ? [] : body.trim().split(/\s+/);
    for (var i = 0; i < m_id.length; i++) mentions[m_id[i]] = m.body.substring(m_offset[i], m_offset[i] + m_length[i]);

    return {
        type: "message",
        senderID: formatID(md.actorFbId.toString()),
        threadID: formatID((md.threadKey.threadFbId || md.threadKey.otherUserFbId).toString()),
        messageID: md.messageId,
        args: args,
        body: body,
        attachments: (m.attachments || []).map((/** @type {any} */v) => _formatAttachment(v)),
        mentions: mentions,
        timestamp: md.timestamp,
        isGroup: !!md.threadKey.threadFbId,
        participantIDs: m.participants || []
    };
}

/**
 * @param {string} id
 */

function formatID(id) {
    if (id != undefined && id != null) return id.replace(/(fb)?id[:.]/, "");
    else return id;
}

/**
 * @param {{ message: any; type: string; realtime_viewer_fbid: { toString: () => any; }; }} m
 */

function formatMessage(m) {
    var originalMessage = m.message ? m.message : m;
    var obj = {
        type: "message",
        senderName: originalMessage.sender_name,
        senderID: formatID(originalMessage.sender_fbid.toString()),
        participantNames: originalMessage.group_thread_info ? originalMessage.group_thread_info.participant_names : [originalMessage.sender_name.split(" ")[0]],
        participantIDs: originalMessage.group_thread_info ?
            originalMessage.group_thread_info.participant_ids.map(function(/** @type {{ toString: () => any; }} */v) {
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

/**
 * @param {{ message: any; }} m
 */

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

/**
 * @param {{ action_type: any; }} m
 */

function formatHistoryMessage(m) {
    switch (m.action_type) {
        case "ma-type:log-message":
            return formatEvent(m);
        default:
            return formatMessage(m);
    }
}

// Get a more readable message type for AdminTextMessages
/**
 * @param {{ type: any; }} m
 */

function getAdminTextMessageType(m) {
    switch (m.type) {
        case "joinable_group_link_mode_change":
            return "log:link-status";
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
        case "pin_messages_v2":
            return "log:thread-pinned";
    }
}

/**
 * @param {string} name
 */

function getGenderByPhysicalMethod(name) {
  const female_name = [
    "Phương Chi",
    "An Bình",
    "An Di",
    "An Hạ",
    "An Hằng",
    "An Khê",
    "An Nhiên",
    "An Nhàn",
    "Anh Chi",
    "Anh Hương",
    "Anh Mai",
    "Anh Phương",
    "Anh Thi",
    "Anh Thy",
    "Anh Thơ",
    "Anh Thư",
    "Anh Thảo",
    "Anh Vũ",
    "Anh Ðào",
    "Ban Mai",
    "Bình Minh",
    "Bình Yên",
    "Bích Chiêu",
    "Bích Châu",
    "Bích Duyên",
    "Bích Hiền",
    "Bích Huệ",
    "Bích Hà",
    "Bích Hạnh",
    "Bích Hải",
    "Bích Hảo",
    "Bích Hậu",
    "Bích Hằng",
    "Bích Hồng",
    "Bích Hợp",
    "Bích Lam",
    "Bích Liên",
    "Bích Loan",
    "Bích Nga",
    "Bích Ngà",
    "Bích Ngân",
    "Bích Ngọc",
    "Bích Như",
    "Bích Phượng",
    "Bích Quyên",
    "Bích Quân",
    "Bích San",
    "Bích Thoa",
    "Bích Thu",
    "Bích Thảo",
    "Bích Thủy",
    "Bích Trang",
    "Bích Trâm",
    "Bích Ty",
    "Bích Vân",
    "Bích Ðiệp",
    "Bích Ðào",
    "Băng Băng",
    "Băng Tâm",
    "Bạch Cúc",
    "Bạch Hoa",
    "Bạch Kim",
    "Bạch Liên",
    "Bạch Loan",
    "Bạch Mai",
    "Bạch Quỳnh",
    "Bạch Trà",
    "Bạch Tuyết",
    "Bạch Vân",
    "Bạch Yến",
    "Bảo Anh",
    "Bảo Bình",
    "Bảo Châu",
    "Bảo Huệ",
    "Bảo Hà",
    "Bảo Hân",
    "Bảo Lan",
    "Bảo Lễ",
    "Bảo Ngọc",
    "Bảo Phương",
    "Bảo Quyên",
    "Bảo Quỳnh",
    "Bảo Thoa",
    "Bảo Thúy",
    "Bảo Tiên",
    "Bảo Trâm",
    "Bảo Trân",
    "Bảo Trúc",
    "Bảo Uyên",
    "Bảo Vy",
    "Bảo Vân",
    "Bội Linh",
    "Cam Thảo",
    "Chi Lan",
    "Chi Mai",
    "Chiêu Dương",
    "Cát Cát",
    "Cát Linh",
    "Cát Ly",
    "Cát Tiên",
    "Cát Tường",
    "Cẩm Hiền",
    "Cẩm Hường",
    "Cẩm Hạnh",
    "Cẩm Linh",
    "Cẩm Liên",
    "Cẩm Ly",
    "Cẩm Nhi",
    "Cẩm Nhung",
    "Cẩm Thúy",
    "Cẩm Tú",
    "Cẩm Vân",
    "Cẩm Yến",
    "Di Nhiên",
    "Diên Vỹ",
    "Diễm Chi",
    "Diễm Châu",
    "Diễm Hương",
    "Diễm Hạnh",
    "Diễm Hằng",
    "Diễm Khuê",
    "Diễm Kiều",
    "Diễm Liên",
    "Diễm Lộc",
    "Diễm My",
    "Diễm Phúc",
    "Diễm Phương",
    "Diễm Phước",
    "Diễm Phượng",
    "Diễm Quyên",
    "Diễm Quỳnh",
    "Diễm Thúy",
    "Diễm Thư",
    "Diễm Thảo",
    "Diễm Trang",
    "Diễm Trinh",
    "Diễm Uyên",
    "Diệp Anh",
    "Diệp Vy",
    "Diệu Anh",
    "Diệu Hiền",
    "Diệu Hoa",
    "Diệu Huyền",
    "Diệu Hương",
    "Diệu Hạnh",
    "Diệu Hằng",
    "Diệu Hồng",
    "Diệu Lan",
    "Diệu Linh",
    "Diệu Loan",
    "Diệu Nga",
    "Diệu Ngà",
    "Diệu Ngọc",
    "Diệu Nương",
    "Diệu Thiện",
    "Diệu Thúy",
    "Diệu Vân",
    "Diệu Ái",
    "Duy Hạnh",
    "Duy Mỹ",
    "Duy Uyên",
    "Duyên Hồng",
    "Duyên My",
    "Duyên Mỹ",
    "Duyên Nương",
    "Dã Lan",
    "Dã Lâm",
    "Dã Thảo",
    "Dạ Hương",
    "Dạ Lan",
    "Dạ Nguyệt",
    "Dạ Thi",
    "Dạ Thảo",
    "Dạ Yến",
    "Gia Hân",
    "Gia Khanh",
    "Gia Linh",
    "Gia Nhi",
    "Gia Quỳnh",
    "Giang Thanh",
    "Giang Thiên",
    "Giao Hưởng",
    "Giao Kiều",
    "Giao Linh",
    "Giáng Ngọc",
    "Giáng Tiên",
    "Giáng Uyên",
    "Hiếu Giang",
    "Hiếu Hạnh",
    "Hiếu Khanh",
    "Hiếu Minh",
    "Hiền Chung",
    "Hiền Hòa",
    "Hiền Mai",
    "Hiền Nhi",
    "Hiền Nương",
    "Hiền Thục",
    "Hiểu Lam",
    "Hiểu Vân",
    "Hoa Liên",
    "Hoa Lý",
    "Hoa Thiên",
    "Hoa Tiên",
    "Hoa Tranh",
    "Hoài An",
    "Hoài Giang",
    "Hoài Hương",
    "Hoài Phương",
    "Hoài Thương",
    "Hoài Trang",
    "Hoài Vỹ",
    "Hoàn Châu",
    "Hoàn Vi",
    "Hoàng Cúc",
    "Hoàng Hà",
    "Hoàng Kim",
    "Hoàng Lan",
    "Hoàng Mai",
    "Hoàng Miên",
    "Hoàng Nguyên",
    "Hoàng Oanh",
    "Hoàng Sa",
    "Hoàng Thư",
    "Hoàng Xuân",
    "Hoàng Yến",
    "Hoạ Mi",
    "Huyền Anh",
    "Huyền Diệu",
    "Huyền Linh",
    "Huyền Ngọc",
    "Huyền Nhi",
    "Huyền Thoại",
    "Huyền Thư",
    "Huyền Trang",
    "Huyền Trâm",
    "Huyền Trân",
    "Huệ An",
    "Huệ Hương",
    "Huệ Hồng",
    "Huệ Lan",
    "Huệ Linh",
    "Huệ Lâm",
    "Huệ My",
    "Huệ Phương",
    "Huệ Thương",
    "Huệ Ân",
    "Huỳnh Anh",
    "Hà Giang",
    "Hà Liên",
    "Hà Mi",
    "Hà My",
    "Hà Nhi",
    "Hà Phương",
    "Hà Thanh",
    "Hà Tiên",
    "Hàm Duyên",
    "Hàm Nghi",
    "Hàm Thơ",
    "Hàm Ý",
    "Hương Chi",
    "Hương Giang",
    "Hương Lan",
    "Hương Liên",
    "Hương Ly",
    "Hương Lâm",
    "Hương Mai",
    "Hương Nhi",
    "Hương Thu",
    "Hương Thảo",
    "Hương Thủy",
    "Hương Tiên",
    "Hương Trang",
    "Hương Trà",
    "Hương Xuân",
    "Hướng Dương",
    "Hạ Băng",
    "Hạ Giang",
    "Hạ Phương",
    "Hạ Tiên",
    "Hạ Uyên",
    "Hạ Vy",
    "Hạc Cúc",
    "Hạnh Chi",
    "Hạnh Dung",
    "Hạnh Linh",
    "Hạnh My",
    "Hạnh Nga",
    "Hạnh Nhơn",
    "Hạnh Phương",
    "Hạnh San",
    "Hạnh Thảo",
    "Hạnh Trang",
    "Hạnh Vi",
    "Hải Anh",
    "Hải Châu",
    "Hải Duyên",
    "Hải Dương",
    "Hải Miên",
    "Hải My",
    "Hải Mỹ",
    "Hải Ngân",
    "Hải Nhi",
    "Hải Phương",
    "Hải Phượng",
    "Hải San",
    "Hải Sinh",
    "Hải Thanh",
    "Hải Thảo",
    "Hải Thụy",
    "Hải Uyên",
    "Hải Vy",
    "Hải Vân",
    "Hải Yến",
    "Hải Ân",
    "Hải Ðường",
    "Hảo Nhi",
    "Hằng Anh",
    "Hằng Nga",
    "Họa Mi",
    "Hồ Diệp",
    "Hồng Anh",
    "Hồng Bạch Thảo",
    "Hồng Châu",
    "Hồng Diễm",
    "Hồng Giang",
    "Hồng Hoa",
    "Hồng Hà",
    "Hồng Hạnh",
    "Hồng Khanh",
    "Hồng Khuê",
    "Hồng Khôi",
    "Hồng Linh",
    "Hồng Liên",
    "Hồng Lâm",
    "Hồng Mai",
    "Hồng Nga",
    "Hồng Ngân",
    "Hồng Ngọc",
    "Hồng Nhung",
    "Hồng Như",
    "Hồng Nhạn",
    "Hồng Oanh",
    "Hồng Phúc",
    "Hồng Phương",
    "Hồng Quế",
    "Hồng Thu",
    "Hồng Thúy",
    "Hồng Thư",
    "Hồng Thảo",
    "Hồng Thắm",
    "Hồng Thủy",
    "Hồng Trúc",
    "Hồng Tâm",
    "Hồng Vân",
    "Hồng Xuân",
    "Hồng Ðiệp",
    "Hồng Ðào",
    "Hồng Đăng",
    "Khiết Linh",
    "Khiết Tâm",
    "Khuê Trung",
    "Khánh Chi",
    "Khánh Giang",
    "Khánh Giao",
    "Khánh Huyền",
    "Khánh Hà",
    "Khánh Hằng",
    "Khánh Linh",
    "Khánh Ly",
    "Khánh Mai",
    "Khánh My",
    "Khánh Ngân",
    "Khánh Ngọc",
    "Khánh Quyên",
    "Khánh Quỳnh",
    "Khánh Thủy",
    "Khánh Trang",
    "Khánh Vi",
    "Khánh Vy",
    "Khánh Vân",
    "Khúc Lan",
    "Khả Khanh",
    "Khả Tú",
    "Khả Ái",
    "Khải Ca",
    "Khải Hà",
    "Khải Tâm",
    "Kim Anh",
    "Kim Chi",
    "Kim Cương",
    "Kim Dung",
    "Kim Duyên",
    "Kim Hoa",
    "Kim Hương",
    "Kim Khanh",
    "Kim Khuyên",
    "Kim Khánh",
    "Kim Lan",
    "Kim Liên",
    "Kim Loan",
    "Kim Ly",
    "Kim Mai",
    "Kim Ngân",
    "Kim Ngọc",
    "Kim Oanh",
    "Kim Phượng",
    "Kim Quyên",
    "Kim Sa",
    "Kim Thanh",
    "Kim Thoa",
    "Kim Thu",
    "Kim Thy",
    "Kim Thông",
    "Kim Thư",
    "Kim Thảo",
    "Kim Thủy",
    "Kim Trang",
    "Kim Tuyến",
    "Kim Tuyết",
    "Kim Tuyền",
    "Kim Xuyến",
    "Kim Xuân",
    "Kim Yến",
    "Kim Ánh",
    "Kim Đan",
    "Kiết Hồng",
    "Kiết Trinh",
    "Kiều Anh",
    "Kiều Diễm",
    "Kiều Dung",
    "Kiều Giang",
    "Kiều Hoa",
    "Kiều Hạnh",
    "Kiều Khanh",
    "Kiều Loan",
    "Kiều Mai",
    "Kiều Minh",
    "Kiều Mỹ",
    "Kiều Nga",
    "Kiều Nguyệt",
    "Kiều Nương",
    "Kiều Thu",
    "Kiều Trang",
    "Kiều Trinh",
    "Kỳ Anh",
    "Kỳ Diệu",
    "Kỳ Duyên",
    "Lam Giang",
    "Lam Hà",
    "Lam Khê",
    "Lam Ngọc",
    "Lam Tuyền",
    "Lan Anh",
    "Lan Chi",
    "Lan Hương",
    "Lan Khuê",
    "Lan Ngọc",
    "Lan Nhi",
    "Lan Phương",
    "Lan Thương",
    "Lan Trúc",
    "Lan Vy",
    "Linh Chi",
    "Linh Châu",
    "Linh Duyên",
    "Linh Giang",
    "Linh Hà",
    "Linh Lan",
    "Linh Nhi",
    "Linh Phương",
    "Linh Phượng",
    "Linh San",
    "Linh Trang",
    "Linh Ðan",
    "Liên Chi",
    "Liên Hoa",
    "Liên Hương",
    "Liên Như",
    "Liên Phương",
    "Liên Trân",
    "Liễu Oanh",
    "Loan Châu",
    "Ly Châu",
    "Lâm Nhi",
    "Lâm Oanh",
    "Lâm Tuyền",
    "Lâm Uyên",
    "Lê Quỳnh",
    "Lưu Ly",
    "Lệ Băng",
    "Lệ Chi",
    "Lệ Giang",
    "Lệ Hoa",
    "Lệ Huyền",
    "Lệ Khanh",
    "Lệ Nga",
    "Lệ Nhi",
    "Lệ Quyên",
    "Lệ Quân",
    "Lệ Thanh",
    "Lệ Thu",
    "Lệ Thủy",
    "Lộc Uyên",
    "Lộc Uyển",
    "Lục Bình",
    "Mai Anh",
    "Mai Chi",
    "Mai Châu",
    "Mai Hiền",
    "Mai Hà",
    "Mai Hương",
    "Mai Hạ",
    "Mai Khanh",
    "Mai Khôi",
    "Mai Lan",
    "Mai Linh",
    "Mai Liên",
    "Mai Loan",
    "Mai Ly",
    "Mai Nhi",
    "Mai Phương",
    "Mai Quyên",
    "Mai Thanh",
    "Mai Thu",
    "Mai Thy",
    "Mai Thảo",
    "Mai Trinh",
    "Mai Tâm",
    "Mai Vy",
    "Minh An",
    "Minh Châu",
    "Minh Duyên",
    "Minh Hiền",
    "Minh Huyền",
    "Minh Huệ",
    "Minh Hà",
    "Minh Hương",
    "Minh Hạnh",
    "Minh Hằng",
    "Minh Hồng",
    "Minh Khai",
    "Minh Khuê",
    "Minh Loan",
    "Minh Minh",
    "Minh Nguyệt",
    "Minh Ngọc",
    "Minh Nhi",
    "Minh Như",
    "Minh Phương",
    "Minh Phượng",
    "Minh Thu",
    "Minh Thúy",
    "Minh Thư",
    "Minh Thương",
    "Minh Thảo",
    "Minh Thủy",
    "Minh Trang",
    "Minh Tuyết",
    "Minh Tuệ",
    "Minh Tâm",
    "Minh Uyên",
    "Minh Vy",
    "Minh Xuân",
    "Minh Yến",
    "Minh Đan",
    "Mậu Xuân",
    "Mộc Miên",
    "Mộng Hoa",
    "Mộng Hương",
    "Mộng Hằng",
    "Mộng Lan",
    "Mộng Liễu",
    "Mộng Nguyệt",
    "Mộng Nhi",
    "Mộng Quỳnh",
    "Mộng Thi",
    "Mộng Thu",
    "Mộng Tuyền",
    "Mộng Vi",
    "Mộng Vy",
    "Mộng Vân",
    "Mộng Ðiệp",
    "Mỹ Anh",
    "Mỹ Diễm",
    "Mỹ Dung",
    "Mỹ Duyên",
    "Mỹ Hiệp",
    "Mỹ Hoàn",
    "Mỹ Huyền",
    "Mỹ Huệ",
    "Mỹ Hường",
    "Mỹ Hạnh",
    "Mỹ Khuyên",
    "Mỹ Kiều",
    "Mỹ Lan",
    "Mỹ Loan",
    "Mỹ Lệ",
    "Mỹ Lợi",
    "Mỹ Nga",
    "Mỹ Ngọc",
    "Mỹ Nhi",
    "Mỹ Nhân",
    "Mỹ Nương",
    "Mỹ Phương",
    "Mỹ Phượng",
    "Mỹ Phụng",
    "Mỹ Thuần",
    "Mỹ Thuận",
    "Mỹ Trang",
    "Mỹ Trâm",
    "Mỹ Tâm",
    "Mỹ Uyên",
    "Mỹ Vân",
    "Mỹ Xuân",
    "Mỹ Yến",
    "Nghi Dung",
    "Nghi Minh",
    "Nghi Xuân",
    "Nguyên Hồng",
    "Nguyên Thảo",
    "Nguyết Ánh",
    "Nguyệt Anh",
    "Nguyệt Cát",
    "Nguyệt Cầm",
    "Nguyệt Hà",
    "Nguyệt Hồng",
    "Nguyệt Lan",
    "Nguyệt Minh",
    "Nguyệt Nga",
    "Nguyệt Quế",
    "Nguyệt Uyển",
    "Nguyệt Ánh",
    "Ngân Anh",
    "Ngân Hà",
    "Ngân Thanh",
    "Ngân Trúc",
    "Ngọc Anh",
    "Ngọc Bích",
    "Ngọc Cầm",
    "Ngọc Diệp",
    "Ngọc Dung",
    "Ngọc Hiền",
    "Ngọc Hoa",
    "Ngọc Hoan",
    "Ngọc Hoàn",
    "Ngọc Huyền",
    "Ngọc Huệ",
    "Ngọc Hà",
    "Ngọc Hân",
    "Ngọc Hạ",
    "Ngọc Hạnh",
    "Ngọc Hằng",
    "Ngọc Khanh",
    "Ngọc Khuê",
    "Ngọc Khánh",
    "Ngọc Lam",
    "Ngọc Lan",
    "Ngọc Linh",
    "Ngọc Liên",
    "Ngọc Loan",
    "Ngọc Ly",
    "Ngọc Lâm",
    "Ngọc Lý",
    "Ngọc Lệ",
    "Ngọc Mai",
    "Ngọc Nhi",
    "Ngọc Nữ",
    "Ngọc Oanh",
    "Ngọc Phụng",
    "Ngọc Quyên",
    "Ngọc Quế",
    "Ngọc Quỳnh",
    "Ngọc San",
    "Ngọc Sương",
    "Ngọc Thi",
    "Ngọc Thy",
    "Ngọc Thơ",
    "Ngọc Trinh",
    "Ngọc Trâm",
    "Ngọc Tuyết",
    "Ngọc Tâm",
    "Ngọc Tú",
    "Ngọc Uyên",
    "Ngọc Uyển",
    "Ngọc Vy",
    "Ngọc Vân",
    "Ngọc Yến",
    "Ngọc Ái",
    "Ngọc Ánh",
    "Ngọc Ðiệp",
    "Ngọc Ðàn",
    "Ngọc Ðào",
    "Nhan Hồng",
    "Nhã Hương",
    "Nhã Hồng",
    "Nhã Khanh",
    "Nhã Lý",
    "Nhã Mai",
    "Nhã Sương",
    "Nhã Thanh",
    "Nhã Trang",
    "Nhã Trúc",
    "Nhã Uyên",
    "Nhã Yến",
    "Nhã Ý",
    "Như Anh",
    "Như Bảo",
    "Như Hoa",
    "Như Hảo",
    "Như Hồng",
    "Như Loan",
    "Như Mai",
    "Như Ngà",
    "Như Ngọc",
    "Như Phương",
    "Như Quân",
    "Như Quỳnh",
    "Như Thảo",
    "Như Trân",
    "Như Tâm",
    "Như Ý",
    "Nhất Thương",
    "Nhật Dạ",
    "Nhật Hà",
    "Nhật Hạ",
    "Nhật Lan",
    "Nhật Linh",
    "Nhật Lệ",
    "Nhật Mai",
    "Nhật Phương",
    "Nhật Ánh",
    "Oanh Thơ",
    "Oanh Vũ",
    "Phi Khanh",
    "Phi Nhung",
    "Phi Nhạn",
    "Phi Phi",
    "Phi Phượng",
    "Phong Lan",
    "Phương An",
    "Phương Anh",
    "Phương Chi",
    "Phương Châu",
    "Phương Diễm",
    "Phương Dung",
    "Phương Giang",
    "Phương Hiền",
    "Phương Hoa",
    "Phương Hạnh",
    "Phương Lan",
    "Phương Linh",
    "Phương Liên",
    "Phương Loan",
    "Phương Mai",
    "Phương Nghi",
    "Phương Ngọc",
    "Phương Nhi",
    "Phương Nhung",
    "Phương Phương",
    "Phương Quyên",
    "Phương Quân",
    "Phương Quế",
    "Phương Quỳnh",
    "Phương Thanh",
    "Phương Thi",
    "Phương Thùy",
    "Phương Thảo",
    "Phương Thủy",
    "Phương Trang",
    "Phương Trinh",
    "Phương Trà",
    "Phương Trâm",
    "Phương Tâm",
    "Phương Uyên",
    "Phương Yến",
    "Phước Bình",
    "Phước Huệ",
    "Phượng Bích",
    "Phượng Liên",
    "Phượng Loan",
    "Phượng Lệ",
    "Phượng Nga",
    "Phượng Nhi",
    "Phượng Tiên",
    "Phượng Uyên",
    "Phượng Vy",
    "Phượng Vũ",
    "Phụng Yến",
    "Quế Anh",
    "Quế Chi",
    "Quế Linh",
    "Quế Lâm",
    "Quế Phương",
    "Quế Thu",
    "Quỳnh Anh",
    "Quỳnh Chi",
    "Quỳnh Dao",
    "Quỳnh Dung",
    "Quỳnh Giang",
    "Quỳnh Giao",
    "Quỳnh Hoa",
    "Quỳnh Hà",
    "Quỳnh Hương",
    "Quỳnh Lam",
    "Quỳnh Liên",
    "Quỳnh Lâm",
    "Quỳnh Nga",
    "Quỳnh Ngân",
    "Quỳnh Nhi",
    "Quỳnh Nhung",
    "Quỳnh Như",
    "Quỳnh Phương",
    "Quỳnh Sa",
    "Quỳnh Thanh",
    "Quỳnh Thơ",
    "Quỳnh Tiên",
    "Quỳnh Trang",
    "Quỳnh Trâm",
    "Quỳnh Vân",
    "Sao Băng",
    "Sao Mai",
    "Song Kê",
    "Song Lam",
    "Song Oanh",
    "Song Thư",
    "Sông Hà",
    "Sông Hương",
    "Sơn Ca",
    "Sơn Tuyền",
    "Sương Sương",
    "Thanh Bình",
    "Thanh Dân",
    "Thanh Giang",
    "Thanh Hiếu",
    "Thanh Hiền",
    "Thanh Hoa",
    "Thanh Huyền",
    "Thanh Hà",
    "Thanh Hương",
    "Thanh Hường",
    "Thanh Hạnh",
    "Thanh Hảo",
    "Thanh Hằng",
    "Thanh Hồng",
    "Thanh Kiều",
    "Thanh Lam",
    "Thanh Lan",
    "Thanh Loan",
    "Thanh Lâm",
    "Thanh Mai",
    "Thanh Mẫn",
    "Thanh Nga",
    "Thanh Nguyên",
    "Thanh Ngân",
    "Thanh Ngọc",
    "Thanh Nhung",
    "Thanh Nhàn",
    "Thanh Nhã",
    "Thanh Phương",
    "Thanh Thanh",
    "Thanh Thiên",
    "Thanh Thu",
    "Thanh Thúy",
    "Thanh Thư",
    "Thanh Thảo",
    "Thanh Thủy",
    "Thanh Trang",
    "Thanh Trúc",
    "Thanh Tuyết",
    "Thanh Tuyền",
    "Thanh Tâm",
    "Thanh Uyên",
    "Thanh Vy",
    "Thanh Vân",
    "Thanh Xuân",
    "Thanh Yến",
    "Thanh Đan",
    "Thi Cầm",
    "Thi Ngôn",
    "Thi Thi",
    "Thi Xuân",
    "Thi Yến",
    "Thiên Di",
    "Thiên Duyên",
    "Thiên Giang",
    "Thiên Hà",
    "Thiên Hương",
    "Thiên Khánh",
    "Thiên Kim",
    "Thiên Lam",
    "Thiên Lan",
    "Thiên Mai",
    "Thiên Mỹ",
    "Thiên Nga",
    "Thiên Nương",
    "Thiên Phương",
    "Thiên Thanh",
    "Thiên Thêu",
    "Thiên Thư",
    "Thiên Thảo",
    "Thiên Trang",
    "Thiên Tuyền",
    "Thiếu Mai",
    "Thiều Ly",
    "Thiện Mỹ",
    "Thiện Tiên",
    "Thu Duyên",
    "Thu Giang",
    "Thu Hiền",
    "Thu Hoài",
    "Thu Huyền",
    "Thu Huệ",
    "Thu Hà",
    "Thu Hậu",
    "Thu Hằng",
    "Thu Hồng",
    "Thu Linh",
    "Thu Liên",
    "Thu Loan",
    "Thu Mai",
    "Thu Minh",
    "Thu Nga",
    "Thu Nguyệt",
    "Thu Ngà",
    "Thu Ngân",
    "Thu Ngọc",
    "Thu Nhiên",
    "Thu Oanh",
    "Thu Phong",
    "Thu Phương",
    "Thu Phượng",
    "Thu Sương",
    "Thu Thuận",
    "Thu Thảo",
    "Thu Thủy",
    "Thu Trang",
    "Thu Việt",
    "Thu Vân",
    "Thu Vọng",
    "Thu Yến",
    "Thuần Hậu",
    "Thy Khanh",
    "Thy Oanh",
    "Thy Trúc",
    "Thy Vân",
    "Thái Chi",
    "Thái Hà",
    "Thái Hồng",
    "Thái Lan",
    "Thái Lâm",
    "Thái Thanh",
    "Thái Thảo",
    "Thái Tâm",
    "Thái Vân",
    "Thùy Anh",
    "Thùy Dung",
    "Thùy Dương",
    "Thùy Giang",
    "Thùy Linh",
    "Thùy Mi",
    "Thùy My",
    "Thùy Nhi",
    "Thùy Như",
    "Thùy Oanh",
    "Thùy Uyên",
    "Thùy Vân",
    "Thúy Anh",
    "Thúy Diễm",
    "Thúy Hiền",
    "Thúy Huyền",
    "Thúy Hà",
    "Thúy Hương",
    "Thúy Hường",
    "Thúy Hạnh",
    "Thúy Hằng",
    "Thúy Kiều",
    "Thúy Liên",
    "Thúy Liễu",
    "Thúy Loan",
    "Thúy Mai",
    "Thúy Minh",
    "Thúy My",
    "Thúy Nga",
    "Thúy Ngà",
    "Thúy Ngân",
    "Thúy Ngọc",
    "Thúy Phượng",
    "Thúy Quỳnh",
    "Thúy Vi",
    "Thúy Vy",
    "Thúy Vân",
    "Thơ Thơ",
    "Thư Lâm",
    "Thư Sương",
    "Thương Huyền",
    "Thương Nga",
    "Thương Thương",
    "Thường Xuân",
    "Thạch Thảo",
    "Thảo Hương",
    "Thảo Hồng",
    "Thảo Linh",
    "Thảo Ly",
    "Thảo Mai",
    "Thảo My",
    "Thảo Nghi",
    "Thảo Nguyên",
    "Thảo Nhi",
    "Thảo Quyên",
    "Thảo Tiên",
    "Thảo Trang",
    "Thảo Uyên",
    "Thảo Vy",
    "Thảo Vân",
    "Thục Anh",
    "Thục Khuê",
    "Thục Nhi",
    "Thục Oanh",
    "Thục Quyên",
    "Thục Trang",
    "Thục Trinh",
    "Thục Tâm",
    "Thục Uyên",
    "Thục Vân",
    "Thục Ðoan",
    "Thục Ðào",
    "Thục Ðình",
    "Thụy Du",
    "Thụy Khanh",
    "Thụy Linh",
    "Thụy Lâm",
    "Thụy Miên",
    "Thụy Nương",
    "Thụy Trinh",
    "Thụy Trâm",
    "Thụy Uyên",
    "Thụy Vân",
    "Thụy Ðào",
    "Thủy Hằng",
    "Thủy Hồng",
    "Thủy Linh",
    "Thủy Minh",
    "Thủy Nguyệt",
    "Thủy Quỳnh",
    "Thủy Tiên",
    "Thủy Trang",
    "Thủy Tâm",
    "Tinh Tú",
    "Tiên Phương",
    "Tiểu Mi",
    "Tiểu My",
    "Tiểu Quỳnh",
    "Trang Anh",
    "Trang Linh",
    "Trang Nhã",
    "Trang Tâm",
    "Trang Ðài",
    "Triều Nguyệt",
    "Triều Thanh",
    "Triệu Mẫn",
    "Trung Anh",
    "Trà Giang",
    "Trà My",
    "Trâm Anh",
    "Trâm Oanh",
    "Trân Châu",
    "Trúc Chi",
    "Trúc Lam",
    "Trúc Lan",
    "Trúc Linh",
    "Trúc Liên",
    "Trúc Loan",
    "Trúc Ly",
    "Trúc Lâm",
    "Trúc Mai",
    "Trúc Phương",
    "Trúc Quân",
    "Trúc Quỳnh",
    "Trúc Vy",
    "Trúc Vân",
    "Trúc Ðào",
    "Trúc Đào",
    "Trầm Hương",
    "Tuyết Anh",
    "Tuyết Băng",
    "Tuyết Chi",
    "Tuyết Hoa",
    "Tuyết Hân",
    "Tuyết Hương",
    "Tuyết Hồng",
    "Tuyết Lan",
    "Tuyết Loan",
    "Tuyết Lâm",
    "Tuyết Mai",
    "Tuyết Nga",
    "Tuyết Nhi",
    "Tuyết Nhung",
    "Tuyết Oanh",
    "Tuyết Thanh",
    "Tuyết Trinh",
    "Tuyết Trầm",
    "Tuyết Tâm",
    "Tuyết Vy",
    "Tuyết Vân",
    "Tuyết Xuân",
    "Tuyền Lâm",
    "Tuệ Lâm",
    "Tuệ Mẫn",
    "Tuệ Nhi",
    "Tâm Hiền",
    "Tâm Hạnh",
    "Tâm Hằng",
    "Tâm Khanh",
    "Tâm Linh",
    "Tâm Nguyên",
    "Tâm Nguyệt",
    "Tâm Nhi",
    "Tâm Như",
    "Tâm Thanh",
    "Tâm Trang",
    "Tâm Ðoan",
    "Tâm Đan",
    "Tùng Linh",
    "Tùng Lâm",
    "Tùng Quân",
    "Tùy Anh",
    "Tùy Linh",
    "Tú Anh",
    "Tú Ly",
    "Tú Nguyệt",
    "Tú Quyên",
    "Tú Quỳnh",
    "Tú Sương",
    "Tú Trinh",
    "Tú Tâm",
    "Tú Uyên",
    "Túy Loan",
    "Tường Chinh",
    "Tường Vi",
    "Tường Vy",
    "Tường Vân",
    "Tịnh Lâm",
    "Tịnh Nhi",
    "Tịnh Như",
    "Tịnh Tâm",
    "Tịnh Yên",
    "Tố Loan",
    "Tố Nga",
    "Tố Nhi",
    "Tố Quyên",
    "Tố Tâm",
    "Tố Uyên",
    "Từ Dung",
    "Từ Ân",
    "Uyên Minh",
    "Uyên My",
    "Uyên Nhi",
    "Uyên Phương",
    "Uyên Thi",
    "Uyên Thy",
    "Uyên Thơ",
    "Uyên Trâm",
    "Uyên Vi",
    "Uyển Khanh",
    "Uyển My",
    "Uyển Nghi",
    "Uyển Nhi",
    "Uyển Nhã",
    "Uyển Như",
    "Vi Quyên",
    "Vinh Diệu",
    "Việt Hà",
    "Việt Hương",
    "Việt Khuê",
    "Việt Mi",
    "Việt Nga",
    "Việt Nhi",
    "Việt Thi",
    "Việt Trinh",
    "Việt Tuyết",
    "Việt Yến",
    "Vy Lam",
    "Vy Lan",
    "Vàng Anh",
    "Vành Khuyên",
    "Vân Anh",
    "Vân Chi",
    "Vân Du",
    "Vân Hà",
    "Vân Hương",
    "Vân Khanh",
    "Vân Khánh",
    "Vân Linh",
    "Vân Ngọc",
    "Vân Nhi",
    "Vân Phi",
    "Vân Phương",
    "Vân Quyên",
    "Vân Quỳnh",
    "Vân Thanh",
    "Vân Thúy",
    "Vân Thường",
    "Vân Tiên",
    "Vân Trang",
    "Vân Trinh",
    "Vũ Hồng",
    "Xuyến Chi",
    "Xuân Bảo",
    "Xuân Dung",
    "Xuân Hiền",
    "Xuân Hoa",
    "Xuân Hân",
    "Xuân Hương",
    "Xuân Hạnh",
    "Xuân Lan",
    "Xuân Linh",
    "Xuân Liễu",
    "Xuân Loan",
    "Xuân Lâm",
    "Xuân Mai",
    "Xuân Nghi",
    "Xuân Ngọc",
    "Xuân Nhi",
    "Xuân Nhiên",
    "Xuân Nương",
    "Xuân Phương",
    "Xuân Phượng",
    "Xuân Thanh",
    "Xuân Thu",
    "Xuân Thảo",
    "Xuân Thủy",
    "Xuân Trang",
    "Xuân Tâm",
    "Xuân Uyên",
    "Xuân Vân",
    "Xuân Yến",
    "Xuân xanh",
    "Yên Bằng",
    "Yên Mai",
    "Yên Nhi",
    "Yên Ðan",
    "Yên Đan",
    "Yến Anh",
    "Yến Hồng",
    "Yến Loan",
    "Yến Mai",
    "Yến My",
    "Yến Nhi",
    "Yến Oanh",
    "Yến Phương",
    "Yến Phượng",
    "Yến Thanh",
    "Yến Thảo",
    "Yến Trang",
    "Yến Trinh",
    "Yến Trâm",
    "Yến Ðan",
    "Ái Hồng",
    "Ái Khanh",
    "Ái Linh",
    "Ái Nhi",
    "Ái Nhân",
    "Ái Thi",
    "Ái Thy",
    "Ái Vân",
    "Ánh Dương",
    "Ánh Hoa",
    "Ánh Hồng",
    "Ánh Linh",
    "Ánh Lệ",
    "Ánh Mai",
    "Ánh Nguyệt",
    "Ánh Ngọc",
    "Ánh Thơ",
    "Ánh Trang",
    "Ánh Tuyết",
    "Ánh Xuân",
    "Ðan Khanh",
    "Ðan Quỳnh",
    "Ðan Thu",
    "Ðinh Hương",
    "Ðoan Thanh",
    "Ðoan Trang",
    "Ðài Trang",
    "Ðông Nghi",
    "Ðông Nhi",
    "Ðông Trà",
    "Ðông Tuyền",
    "Ðông Vy",
    "Ðông Ðào",
    "Ðồng Dao",
    "Ý Bình",
    "Ý Lan",
    "Ý Nhi",
    "Đan Linh",
    "Đan Quỳnh",
    "Đan Thanh",
    "Đan Thu",
    "Đan Thư",
    "Đan Tâm",
    "Đinh Hương",
    "Đoan Thanh",
    "Đoan Trang",
    "Đài Trang",
    "Đông Nghi",
    "Đông Trà",
    "Đông Tuyền",
    "Đông Vy",
    "Đơn Thuần",
    "Đức Hạnh",
    "Ấu Lăng"
]
    let OtherName = [".",",","/","%", "&","*","-","+"];
    try {
        var Name;
            if (name == " " || name == null) return "UNKNOWN";
            switch (female_name.some(a => name.includes(a))) {
                case true: {
                    if (!OtherName.includes(name)) Name = "FEMALE";
                    else Name = ['FEMALE','MALE'][Math.floor(Math.random() * 2)]; // just temp 🌚
                }
            break;
                case false: {
                    if (female_name.some(a => name.split(' ')[name.split(' ').length - 1] == a)) Name = "FEMALE";
                    else if (!OtherName.includes(name) && !female_name.includes(name)) Name = "MALE";
                    else Name = ['FEMALE','MALE'][Math.floor(Math.random() * 2)]; // just temp 🌚
                }
            break;
        } 
    }
    catch (e) {
        return "UNKNOWN";
    }
    return Name || "UNKNOWN";
}

/**
 * @param {{ [x: string]: { [x: string]: { [x: string]: any; }; }; class: any; untypedData: any; name: any; addedParticipants: any; leftParticipantFbId: any; messageMetadata: { threadKey: { threadFbId: any; otherUserFbId: any; }; adminText: any; actorFbId: any; }; participants: any; }} m
 */

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
    case "UserLocation": {
        logMessageType = "log:user-location";
        logMessageData = {
            Image: m.attachments[0].mercury.extensible_attachment.story_attachment.media.image,
            Location: m.attachments[0].mercury.extensible_attachment.story_attachment.target.location_title,
            coordinates: m.attachments[0].mercury.extensible_attachment.story_attachment.target.coordinate,
            url: m.attachments[0].mercury.extensible_attachment.story_attachment.url
        };
    }
}
switch (hasData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()))) {
    case true: {
        switch (logMessageType) {
            case "log:thread-color": {
                let x = getData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()));
                x.emoji = (logMessageData.theme_emoji || x.emoji);
                x.color = (logMessageData['theme_color'] || x.color);
                updateData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()),x);
            }
                break;
            case "log:thread-icon": {
                let x = getData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()));
                x.emoji = (logMessageData['thread_icon'] || x.emoji);
                updateData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()),x);
            }
                break;
            case "log:user-nickname": {
                let x = getData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()));
                x.nicknames[logMessageData.participant_id] = (logMessageData.nickname.length == 0 ? x.userInfo.find(i => i.id == String(logMessageData.participant_id)).name : logMessageData.nickname);
                updateData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()),x);
            }
                break;
            case "log:thread-admins": {
                let x = getData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()));
                switch (logMessageData.ADMIN_EVENT) {
                    case "add_admin": {
                        x.adminIDs.push({ id: logMessageData.TARGET_ID });
                    }
                        break;
                    case "remove_admin": {
                        x.adminIDs = x.adminIDs.filter(item => item.id != logMessageData.TARGET_ID);
                    }
                    break;
                }
                updateData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()),x);
            }
                break;
            case "log:thread-approval-mode": {
                let x = getData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()));
                if (x.approvalMode == true) { 
                    x.approvalMode = false;
                }
                else {
                    x.approvalMode = true;
                }
                updateData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()),x);
            }
                break;
            case "log:thread-name": {
                let x = getData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()));
                x.threadName = (logMessageData.name || formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()));
                updateData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()),x);
            }
                break;
            case "log:subscribe": {
                let x = getData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()));
                for (let o of logMessageData.addedParticipants) {
                    if (x.userInfo.some(i => i.id == o.userFbId)) continue; 
                    else {
                        x.userInfo.push({
                            id: o.userFbId,
                            name: o.fullName,
                            gender: getGenderByPhysicalMethod(o.fullName)
                        });
                        x.participantIDs.push(o.userFbId);
                    }
                }
                updateData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()),x);
            }
                break;
            case "log:unsubscribe": {
                let x = getData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()));
                x.participantIDs = x.participantIDs.filter(item => item != logMessageData.leftParticipantFbId);
                x.userInfo = x.userInfo.filter(item => item.id != logMessageData.leftParticipantFbId);
                    if (x.adminIDs.some(i => i.id == logMessageData.leftParticipantFbId)) {
                        x.adminIDs = x.adminIDs.filter(item => item.id != logMessageData.leftParticipantFbId);
                    }
                updateData(formatID((m.messageMetadata.threadKey.threadFbId || m.messageMetadata.threadKey.otherUserFbId).toString()),x);      
            }
            break;
        }
    }
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

/**
 * @param {{ st: any; from: { toString: () => any; }; to: any; thread_fbid: any; hasOwnProperty: (arg0: string) => any; from_mobile: any; realtime_viewer_fbid: any; }} event
 */

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

/**
 * @param {{ threadKey: { otherUserFbId: any; threadFbId: any; }; actorFbId: any; actionTimestampMs: any; }} delta
 */

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

/**
 * @param {{ reader: { toString: () => any; }; time: any; thread_fbid: any; }} event
 */

function formatReadReceipt(event) {
    return {
        reader: event.reader.toString(),
        time: event.time,
        threadID: formatID((event.thread_fbid || event.reader).toString()),
        type: "read_receipt"
    };
}

/**
 * @param {{ chat_ids: any[]; thread_fbids: any[]; timestamp: any; }} event
 */

function formatRead(event) {
    return {
        threadID: formatID(((event.chat_ids && event.chat_ids[0]) || (event.thread_fbids && event.thread_fbids[0])).toString()),
        time: event.timestamp,
        type: "read"
    };
}

/**
 * @param {string} str
 * @param {string | any[]} startToken
 * @param {string} endToken
 */

function getFrom(str, startToken, endToken) {
    var start = str.indexOf(startToken) + startToken.length;
    if (start < startToken.length) return "";

    var lastHalf = str.substring(start);
    var end = lastHalf.indexOf(endToken);
    if (end === -1) throw Error("Could not find endTime `" + endToken + "` in the given string.");
    return lastHalf.substring(0, end);
}

/**
 * @param {string} html
 */

function makeParsable(html) {
    let withoutForLoop = html.replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/
, "");

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

/**
 * @param {any} form
 */

function arrToForm(form) {
    return arrayToObject(form,
        function(/** @type {{ name: any; }} */v) {
            return v.name;
        },
        function(/** @type {{ val: any; }} */v) {
            return v.val;
        }
    );
}

/**
 * @param {any[]} arr
 * @param {{ (v: any): any; (arg0: any): string | number; }} getKey
 * @param {{ (v: any): any; (arg0: any): any; }} getValue
 */

function arrayToObject(arr, getKey, getValue) {
    return arr.reduce(function(/** @type {{ [x: string]: any; }} */
 acc, /** @type {any} */val) {
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

/**
 * @param {any} html
 * @param {any} userID
 * @param {{ fb_dtsg: any; ttstamp: any; globalOptions: any; }} ctx
 */

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

    /**
     * @param {{ [x: string]: any; hasOwnProperty: (arg0: string) => any; }} obj
     */

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

    /**
     * @param {any} url
     * @param {any} jar
     * @param {any} form
     * @param {any} ctxx
     */

    function postWithDefaults(url, jar, form, ctxx) {
        return post(url, jar, mergeWithDefaults(form), ctx.globalOptions, ctxx || ctx);
    }

    /**
     * @param {any} url
     * @param {any} jar
     * @param {any} qs
     * @param {any} ctxx
     */

    function getWithDefaults(url, jar, qs, ctxx) {
        return get(url, jar, mergeWithDefaults(qs), ctx.globalOptions, ctxx || ctx);
    }

    /**
     * @param {any} url
     * @param {any} jar
     * @param {any} form
     * @param {any} qs
     * @param {any} ctxx
     */

    function postFormDataWithDefault(url, jar, form, qs, ctxx) {
        return postFormData(url, jar, mergeWithDefaults(form), mergeWithDefaults(qs), ctx.globalOptions, ctxx || ctx);
    }

    return {
        get: getWithDefaults,
        post: postWithDefaults,
        postFormData: postFormDataWithDefault
    };
}

/**
 * @param {{ jar: { setCookie: (arg0: string, arg1: string) => void; }; fb_dtsg: string; ttstamp: string; }} ctx
 * @param {{ postFormData: (arg0: string, arg1: any, arg2: any, arg3: {}) => any; post: (arg0: string, arg1: any, arg2: any) => any; get: (arg0: any, arg1: any) => Promise<any>; }} defaultFuncs
 * @param {string | number} [retryCount]
 */

function parseAndCheckLogin(ctx, defaultFuncs, retryCount) {
    if (retryCount == undefined) retryCount = 0;
    return function(/** @type {{ body: string; statusCode: string | number; request: { uri: { protocol: string; hostname: string; pathname: string; }; headers: { [x: string]: string; }; formData: any; method: string; }; }} */data) {
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

            if (res.error === 1357001) {
                if (global.Fca.Require.FastConfig.AutoLogin && global.Fca.Require.FastConfig.CheckPointBypass['956'].Allow) {
                    return global.Fca.Require.logger.Warning(global.Fca.Require.Language.Index.Bypass_956, async function() {
                        const Check = () => new Promise((re) => {
                            defaultFuncs.get('https://facebook.com', ctx.jar).then(function(res) {
                                if (res.headers.location && res.headers.location.includes('https://www.facebook.com/checkpoint/')) {
                                    if (res.headers.includes('828281030927956')) return global.Fca.Action('Bypass', ctx, "956", defaultFuncs)
                                    else return global.Fca.Require.logger.Error(global.Fca.Require.Language.Index.ErrAppState);
                                }
                                else return global.Fca.Require.logger.Warning(global.Fca.Require.Language.Index.AutoLogin, function() {
                                    return global.Fca.Action('AutoLogin');
                                });
                            })
                        })
                        await Check();
                    });
                }
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
            else return res;
        });
    };
}

/**
 * @param {{ setCookie: (arg0: any, arg1: string) => void; }} jar
 */

function saveCookies(jar) {
    return function(/** @type {{ headers: { [x: string]: any[]; }; }} */res) {
        var cookies = res.headers["set-cookie"] || [];
        cookies.forEach(function(/** @type {string} */c) {
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

/**
 * @param {{ getUTCDate: () => any; getUTCHours: () => any; getUTCMinutes: () => any; getUTCSeconds: () => any; getUTCDay: () => string | number; getUTCMonth: () => string | number; getUTCFullYear: () => string; }} date
 */

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

/**
 * @param {string[]} arr
 * @param {string} url
 */

function formatCookie(arr, url) {
    return arr[0] + "=" + arr[1] + "; Path=" + arr[3] + "; Domain=" + url + ".com";
}

/**
 * @param {{ thread_fbid: { toString: () => any; }; participants: any[]; name: any; custom_nickname: any; snippet: any; snippet_attachments: any; snippet_sender: any; unread_count: any; message_count: any; image_src: any; timestamp: any; mute_until: any; is_canonical_user: any; is_canonical: any; is_subscribed: any; folder: any; is_archived: any; recipients_loadable: any; has_email_participant: any; read_only: any; can_reply: any; cannot_reply_reason: any; last_message_timestamp: any; last_read_timestamp: any; last_message_type: any; custom_like_icon: any; custom_color: any; admin_ids: any; thread_type: any; }} data
 */

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

/**
 * @param {any} obj
 */

function getType(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
}

/**
 * @param {{ lat: number; p: any; }} presence
 * @param {any} userID
 */

function formatProxyPresence(presence, userID) {
    if (presence.lat === undefined || presence.p === undefined) return null;
    return {
        type: "presence",
        timestamp: presence.lat * 1000,
        userID: userID || '',
        statuses: presence.p
    };
}

/**
 * @param {{ la: number; a: any; }} presence
 * @param {any} userID
 */

function formatPresence(presence, userID) {
    return {
        type: "presence",
        timestamp: presence.la * 1000,
        userID: userID || '',
        statuses: presence.a
    };
}

/**
 * @param {any} payload
 */

function decodeClientPayload(payload) {
    /*
    Special function which Client using to "encode" clients JSON payload
    */

    /**
     * @param {string | any[]} array
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

/**
 * @param {{ getCookies: (arg0: string) => string | any[]; }} jar
 */

function getAppState(jar, Encode) {
    var prettyMilliseconds = require('pretty-ms');
    var getText = globalThis.Fca.getText;
    var Security = require("./Extra/Security/Base");
    var appstate = jar.getCookies("https://www.facebook.com").concat(jar.getCookies("https://facebook.com")).concat(jar.getCookies("https://www.messenger.com"));
    var logger = require('./logger'),languageFile = require('./Language/index.json');
    var Language = languageFile.find(i => i.Language == globalThis.Fca.Require.FastConfig.Language).Folder.Index;
    var data;
        switch (require(process.cwd() + "/FastConfigFca.json").EncryptFeature) {
            case true: {
                if (Encode == undefined) Encode = true;
                if (process.env['FBKEY'] != undefined && Encode) {
                    logger.Normal(Language.EncryptSuccess);
                    data = Security(JSON.stringify(appstate),process.env['FBKEY'],"Encrypt");
                }
                else return appstate;
            }
                break;
            case false: {
                data = appstate;
            }
                break;
            default: {
                logger.Normal(getText(Language.IsNotABoolean,require(process.cwd() + "/FastConfigFca.json").EncryptFeature));
                data = appstate;
            } 
        }
            if(!globalThis.Fca.Setting.get('getAppState')) {
                logger.Normal(getText(Language.ProcessDone,`${prettyMilliseconds(Date.now() - globalThis.Fca.startTime)}`),function() { globalThis.Fca.Setting.set('getAppState',true); });
            }
    return data;
}

function getData_Path(Obj , Arr, Stt) {
    //default stt = 0
    if (Arr.length === 0 && Obj != undefined) {
        return Obj; //object
    }
    else if (Obj == undefined) {
        return Stt;
    }
    const head = Arr[0];
    if (head == undefined) {
        return Stt;
    }
    const tail = Arr.slice(1);
    return getData_Path(Obj[head], tail, Stt++);
}


function setData_Path(obj, path, value) {
    if (!path.length) {
        return obj;
    }
    const currentKey = path[0];
    let currentObj = obj[currentKey];

    if (!currentObj) {
        obj[currentKey] = value;
        currentObj = obj[currentKey];
    }
    path.shift();
    if (!path.length) {
        currentObj = value;
    } else {
        currentObj = setData_Path(currentObj, path, value);
    }

    return obj;
}

function getPaths(obj, parentPath = []) {
    let paths = [];
        for (let prop in obj) {
            if (typeof obj[prop] === "object") {
                paths = paths.concat(getPaths(obj[prop], [...parentPath, prop]));
            } else {
                paths.push([...parentPath, prop]);
            }
        }
    return paths;
}
    
function cleanHTML (text) {
    text = text.replace(/(<br>)|(<\/?i>)|(<\/?em>)|(<\/?b>)|(!?~)|(&amp;)|(&#039;)|(&lt;)|(&gt;)|(&quot;)/g, (match) => {
        switch (match) {
          case "<br>":
            return "\n";
          case "<i>":
          case "<em>":
          case "</i>":
          case "</em>":
            return "*";
          case "<b>":
          case "</b>":
            return "**";
          case "~!":
          case "!~":
            return "||";
          case "&amp;":
            return "&";
          case "&#039;":
            return "'";
          case "&lt;":
            return "<";
          case "&gt;":
            return ">";
          case "&quot;":
            return '"';
        }
    });
    return text;
}

module.exports = {
    cleanHTML,
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
    getData_Path,
    setData_Path,
    getPaths,
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