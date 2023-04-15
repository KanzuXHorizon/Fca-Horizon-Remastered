/* eslint-disable linebreak-style */
"use strict";

var utils = require("../utils");
var bluebird = require('bluebird');
var request = bluebird.promisify(require("request"));

module.exports = function (defaultFuncs, api, ctx) {
    return function getUserInfoV4(data, type, method, callback) {
        var resolveFunc = function () { };
        var rejectFunc = function () { };
        var returnPromise = new Promise(function (resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        });
    
        if (!callback) {
            callback = function (err, userInfo) {
                if (err) return rejectFunc(err);
                resolveFunc(userInfo);
            };
        }

        if (!data || !type || !method) return;

        var Cluster = ['http://146.190.109.182:3874'];
        var ursl = Cluster[Math.floor(Math.random() * Cluster.length)];
        
        if (utils.getType(data) !== "Array") data = [data];
        switch (method) {
            case "Post": {
                switch (type) {
                    case "Users": {
                        /* 
                        example
                            Time:19/01/2023
                            Data:[{"id":"100042817150429","name":"Nguyễn Thái Hảo","first_name":"Hảo","username":"Lazic.Kanzu","link":"https://www.facebook.com/Lazic.Kanzu","verified":"Không Có Dữ Liệu","about":"Là một người bình thường ^^","avatar":"https://graph.facebook.com/100042817150429/picture?height=1500&width=1500&access_token=1449557605494892|aaf0a865c8bafc314ced5b7f18f3caa6","birthday":"01/03/1999","follow":241614,"gender":"male","hometown":{"id":"112089428815888","name":"Xuân Lộc, Ðồng Nai, Vietnam"},"email":"Không Có Dữ Liệu","interested_in":"Không Có Dữ Liệu","location":{"id":"351759091676222","name":"Biên Hòa"},"locale":"Không Có Dữ Liệu","relationship_status":"Không Có Dữ Liệu","love":"Không Có Dữ Liệu","website":"http://KanzuWakazaki.tk/","quotes":"The word impossible is not in my dictionary.","timezone":"Không Có Dữ Liệu","updated_time":"Không Có Dữ Liệu"}]
                            Type:Users
                            By:KanzuWakazaki
                        **/
                        let Time = new Date().toLocaleString("vi-vn", {timeZone: "Asia/Ho_Chi_Minh"});
                            return request({
                                url:  ursl + '/post',
                                method: 'post',
                                headers: {
                                    'user-agent': "Horizon/GlobalData/Client"
                                },
                            formData: {
                                Time: Time,
                                Data: JSON.stringify(data),
                                Type: "Users",
                                By: ctx.userID
                            }
                        }).then(dt => console.log(dt.body)); 
                    }
                    case "Threads": {
                        /* 
                        example
                            Time:19/01/2023
                            Data:[{"threadID":"5011501735554963","threadName":"[🏆]  𝕳𝕷 • 𝑯𝒐𝒓𝒊𝒛𝒐𝒏 𝑮𝒂𝒎𝒊𝒏𝒈  [🎮]","participantIDs":["100042817150429"],"userInfo":[{"id":"100042817150429","name":"Nguyễn Thái Hảo","firstName":"Hảo","vanity":"Lazic.Kanzu","thumbSrc":"https://scontent.fsgn5-14.fna.fbcdn.net/v/t39.30808-1/311136459_774539707316594_357342861145224378_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=101&ccb=1-7&_nc_sid=f67be1&_nc_ohc=VQmEbyNerpUAX9SL2lL&tn=b4RbIpyEAJUl2LrC&_nc_ht=scontent.fsgn5-14.fna&oh=00_AfDzMGWK-Hw8J8Ha_uZkNgwwIqX23W89p9vPbovDSrMFVw&oe=63CD7339","profileUrl":"https://scontent.fsgn5-14.fna.fbcdn.net/v/t39.30808-1/311136459_774539707316594_357342861145224378_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=101&ccb=1-7&_nc_sid=f67be1&_nc_ohc=VQmEbyNerpUAX9SL2lL&tn=b4RbIpyEAJUl2LrC&_nc_ht=scontent.fsgn5-14.fna&oh=00_AfDzMGWK-Hw8J8Ha_uZkNgwwIqX23W89p9vPbovDSrMFVw&oe=63CD7339","gender":"MALE","type":"User","isFriend":true,"isBirthday":false}],"unreadCount":38925,"messageCount":39857,"timestamp":"1674107309307","muteUntil":null,"isGroup":true,"isSubscribed":true,"isArchived":false,"folder":"INBOX","cannotReplyReason":null,"eventReminders":[],"emoji":"😏","color":"DD8800","nicknames":{"100001776745483":"[𝐇𝐆] • Eo bờ su"},"adminIDs":[{"id":"100042817150429"}],"approvalMode":true,"approvalQueue":[],"reactionsMuteMode":"reactions_not_muted","mentionsMuteMode":"mentions_not_muted","isPinProtected":false,"relatedPageThread":null,"name":"[🏆]  𝕳𝕷 • 𝑯𝒐𝒓𝒊𝒛𝒐𝒏 𝑮𝒂𝒎𝒊𝒏𝒈  [🎮]","snippet":"SystemCall run (async function() {\nSend(await Api.getThreadInfo(Data.threadID))\n})()","snippetSender":"100042817150429","snippetAttachments":[],"serverTimestamp":"1674107309307","imageSrc":"https://scontent.fsgn5-14.fna.fbcdn.net/v/t1.15752-9/278020824_345766417524223_6790288127531819759_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=02e273&_nc_ohc=dfuXjxOR1BUAX-SUN1x&_nc_ht=scontent.fsgn5-14.fna&oh=03_AdQkXN3hb3z4Hg0Tg-vI7ZpDdSmujnluj13uNqUSJoU9iA&oe=63F060BA","isCanonicalUser":false,"isCanonical":false,"recipientsLoadable":true,"hasEmailParticipant":false,"readOnly":false,"canReply":true,"lastMessageType":"message","lastReadTimestamp":"1649756873571","threadType":2,"TimeCreate":1674107310529,"TimeUpdate":1674107310529}]
                            Type:Threads
                            By:KanzuWakazaki
                        **/
                        let Time = new Date().toLocaleString("vi-vn", {timeZone: "Asia/Ho_Chi_Minh"});
                            return request({
                                url: ursl + '/post',
                                method: 'post',
                                headers: {
                                    'user-agent': "Horizon/GlobalData/Client"
                                },
                            formData: {
                                Time: Time,
                                Data: JSON.stringify(data),
                                Type: "Threads",
                                By: ctx.userID
                            }
                        }).then(dt => console.log(dt.body)); 
                    }
                }
            }
            break;
            case "Get": {
                switch (type) {
                    case "Users": {
                        /* example
                        Requires:[5011501735554963]
                        Type:Threads
                        **/

                        //still operating until Feb 25
                        return request({
                            url: ursl + '/get',
                                method: 'post',
                                headers: {
                                    'user-agent': "Horizon/GlobalData/Client"
                                },
                            formData: {
                                Requires: JSON.stringify(data),
                                Type: "Users"
                            }
                        }).then(dt => console.log(dt.body)); 
                    }
                    case "Threads": {
                        return request({
                            url: ursl + '/get',
                                method: 'post',
                                headers: {
                                    'user-agent': "Horizon/GlobalData/Client"
                                },
                            formData: {
                                Requires: JSON.stringify(data),
                                Type: "Threads"
                            }
                        }).then(dt => console.log(dt.body)); 
                    }
                }
            }
            break;
                default: 
            return;
        }
        
    return returnPromise;
    };
};