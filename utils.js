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

if (process.env.HalzionVersion == 1973) { 
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
                            })
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
        switch (require(process.cwd() + "/FastConfigFca.json").EncryptFeature) {
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
                logger.Normal(getText(Language.IsNotABoolean,require(process.cwd() + "/FastConfigFca.json").EncryptFeature));
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