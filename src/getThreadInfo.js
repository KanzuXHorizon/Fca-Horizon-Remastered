"use strict";

var utils = require("../utils");
var log = require("npmlog");
// tương lai đi rồi fix ahahha
function formatEventReminders(reminder) {
  return {
    reminderID: reminder.id,
    eventCreatorID: reminder.lightweight_event_creator.id,
    time: reminder.time,
    eventType: reminder.lightweight_event_type.toLowerCase(),
    locationName: reminder.location_name,
    // @TODO verify this
    locationCoordinates: reminder.location_coordinates,
    locationPage: reminder.location_page,
    eventStatus: reminder.lightweight_event_status.toLowerCase(),
    note: reminder.note,
    repeatMode: reminder.repeat_mode.toLowerCase(),
    eventTitle: reminder.event_title,
    triggerMessage: reminder.trigger_message,
    secondsToNotifyBefore: reminder.seconds_to_notify_before,
    allowsRsvp: reminder.allows_rsvp,
    relatedEvent: reminder.related_event,
    members: reminder.event_reminder_members.edges.map(function(member) {
      return {
        memberID: member.node.id,
        state: member.guest_list_state.toLowerCase()
      };
    })
  };
}

function formatThreadGraphQLResponse(data) {
  try{
    var messageThread = data.message_thread;
  } catch (err){
    console.error("GetThreadInfoGraphQL", "Can't get this thread info!");
    return {err: err};
  }
  var threadID = messageThread.thread_key.thread_fbid
    ? messageThread.thread_key.thread_fbid
    : messageThread.thread_key.other_user_id;

  // Remove me
  var lastM = messageThread.last_message;
  var snippetID =
    lastM &&
    lastM.nodes &&
    lastM.nodes[0] &&
    lastM.nodes[0].message_sender &&
    lastM.nodes[0].message_sender.messaging_actor
      ? lastM.nodes[0].message_sender.messaging_actor.id
      : null;
  var snippetText =
    lastM && lastM.nodes && lastM.nodes[0] ? lastM.nodes[0].snippet : null;
  var lastR = messageThread.last_read_receipt;
  var lastReadTimestamp =
    lastR && lastR.nodes && lastR.nodes[0] && lastR.nodes[0].timestamp_precise
      ? lastR.nodes[0].timestamp_precise
      : null;

  return {
    threadID: threadID,
    threadName: messageThread.name,
    participantIDs: messageThread.all_participants.edges.map(d => d.node.messaging_actor.id),
    userInfo: messageThread.all_participants.edges.map(d => ({
      id: d.node.messaging_actor.id,
      name: d.node.messaging_actor.name,
      firstName: d.node.messaging_actor.short_name,
      vanity: d.node.messaging_actor.username,
      thumbSrc: d.node.messaging_actor.big_image_src.uri,
      profileUrl: d.node.messaging_actor.big_image_src.uri,
      gender: d.node.messaging_actor.gender,
      type: d.node.messaging_actor.__typename,
      isFriend: d.node.messaging_actor.is_viewer_friend,
      isBirthday: !!d.node.messaging_actor.is_birthday //not sure?
    })),
    unreadCount: messageThread.unread_count,
    messageCount: messageThread.messages_count,
    timestamp: messageThread.updated_time_precise,
    muteUntil: messageThread.mute_until,
    isGroup: messageThread.thread_type == "GROUP",
    isSubscribed: messageThread.is_viewer_subscribed,
    isArchived: messageThread.has_viewer_archived,
    folder: messageThread.folder,
    cannotReplyReason: messageThread.cannot_reply_reason,
    eventReminders: messageThread.event_reminders
      ? messageThread.event_reminders.nodes.map(formatEventReminders)
      : null,
    emoji: messageThread.customization_info
      ? messageThread.customization_info.emoji
      : null,
    color:
      messageThread.customization_info &&
      messageThread.customization_info.outgoing_bubble_color
        ? messageThread.customization_info.outgoing_bubble_color.slice(2)
        : null,
    nicknames:
      messageThread.customization_info &&
      messageThread.customization_info.participant_customizations
        ? messageThread.customization_info.participant_customizations.reduce(
            function(res, val) {
              if (val.nickname) res[val.participant_id] = val.nickname;
              return res;
            },
            {}
          )
        : {},
    adminIDs: messageThread.thread_admins,
    approvalMode: Boolean(messageThread.approval_mode),
    approvalQueue: messageThread.group_approval_queue.nodes.map(a => ({
      inviterID: a.inviter.id,
      requesterID: a.requester.id,
      timestamp: a.request_timestamp,
      request_source: a.request_source // @Undocumented
    })),

    // @Undocumented
    reactionsMuteMode: messageThread.reactions_mute_mode.toLowerCase(),
    mentionsMuteMode: messageThread.mentions_mute_mode.toLowerCase(),
    isPinProtected: messageThread.is_pin_protected,
    relatedPageThread: messageThread.related_page_thread,

    // @Legacy
    name: messageThread.name,
    snippet: snippetText,
    snippetSender: snippetID,
    snippetAttachments: [],
    serverTimestamp: messageThread.updated_time_precise,
    imageSrc: messageThread.image ? messageThread.image.uri : null,
    isCanonicalUser: messageThread.is_canonical_neo_user,
    isCanonical: messageThread.thread_type != "GROUP",
    recipientsLoadable: true,
    hasEmailParticipant: false,
    readOnly: false,
    canReply: messageThread.cannot_reply_reason == null,
    lastMessageTimestamp: messageThread.last_message
      ? messageThread.last_message.timestamp_precise
      : null,
    lastMessageType: "message",
    lastReadTimestamp: lastReadTimestamp,
    threadType: messageThread.thread_type == "GROUP" ? 2 : 1,
    TimeCreate: Date.now(),
    TimeUpdate: Date.now()
  };
}

module.exports = function(defaultFuncs, api, ctx) {

  var { createData,getData,hasData,alreadyUpdate,setLastRun,updateData, getAll } = require('../Extra/ExtraGetThread');
  var { capture } = require('../Extra/Src/Last-Run');
  global.Fca.Data.Userinfo = []
  
  return function getThreadInfoGraphQL(threadID, callback) {
    var resolveFunc = function(){};
    var rejectFunc = function(){};
    var returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (utils.getType(callback) != "Function" && utils.getType(callback) != "AsyncFunction") {
      callback = function (err, data) {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc(data);
      };
    }

      // được tìm thấy vào giữa tháng 8/2022 bởi @KanzuWakazaki - đã được chia sẻ cho @D-Jukie và Horizon Team Public group 🤴
      // những code tương tự muliti thread như này đều có thể là copy idea 🐧
      // đã áp dụng vào fca mới(cloud - fca(private)) vào cuối tháng 8/2022 bởi @IteralingCode(Hidden Member( always :) )) - Synthetic 4 - @Horizon Team
      //cập nhật dự án bị bỏ rơi này vào ngày 19/11/2022 bởi @KanzuWakazaki(Owner) - Synthetic 1  - @Horizon Team nhằm đáp ứng nhu cầu của client !

      var time = new Date().toLocaleDateString('vi-VN',  {minute: 'numeric' }).split(',')[0]

      if (utils.getType(threadID) !== "Array") threadID = [threadID];


    var SpecialMethod = function(TID) {
      var All = getAll();
      var AllofThread = []
      if (All.length < 1) {
        return DefaultMethod(TID);
      } else if (All.length > 1) {
        for (let i of All) {
            if (i.data.threadID != undefined) {
              AllofThread.push(i.data.threadID);
            } else continue;
        }
        var Form = {}
        var ThreadInfo = [];
  
        AllofThread.map(function (x,y) {
          Form["o" + y] = {
            doc_id: "3449967031715030",
            query_params: {
              id: x,
              message_limit: 0,
              load_messages: false,
              load_read_receipts: false,
              before: null
            }
          };
        });
  
        var form = {
          queries: JSON.stringify(Form),
          batch_name: "MessengerGraphQLThreadFetcher"
        };
  
        defaultFuncs
        .post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, form)
          .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
          .then(function(resData) {
          if (resData.error) {
            throw "Lỗi: getThreadInfoGraphQL Có Thể Do Bạn Spam Quá Nhiều"
          }
          if (resData[resData.length - 1].error_results !== 0) {
            throw "Lỗi: getThreadInfoGraphQL Có Thể Do Bạn Spam Quá Nhiều"
          }
          resData = resData.splice(0, resData.length - 1);
          resData.sort((a, b) => { return Object.keys(a)[0].localeCompare(Object.keys(b)[0]); });
          resData.map(function (x,y) {
            ThreadInfo.push(formatThreadGraphQLResponse(x["o"+y].data));
          });
          global.Fca.Data.Userinfo = []
          if (process.env.HalzionVersion == 1973) {
            if (Object.keys(resData).length == 1) {
              updateData(threadID,ThreadInfo[0]);	
              global.Fca.Data.Userinfo.push(ThreadInfo[0].userInfo);
            } else {
              for (let i of ThreadInfo) {
                updateData(i.threadID,i);
                global.Fca.Data.Userinfo.push(i.userInfo);
              }
            }
          }
        })
        .catch(function(err){
          throw "Lỗi: getThreadInfoGraphQL Có Thể Do Bạn Spam Quá Nhiều"
        });
      }
    }
    var DefaultMethod = function(TID) { 
      var ThreadInfo = [];
      for (let i of TID) {
        ThreadInfo.push(getData(i));
      }
      if (ThreadInfo.length == 1) {
        callback(null,ThreadInfo[0]);
        global.Fca.Data.Userinfo.push(ThreadInfo[0].userInfo);
      } else {
        for (let i of ThreadInfo) {
          global.Fca.Data.Userinfo.push(i.userInfo);
        }
        callback(null,ThreadInfo);
      }
    }
    var CreateMethod = function(TID) { 
      var Form = {}
      var ThreadInfo = [];

      TID.map(function (x,y) {
        Form["o" + y] = {
          doc_id: "3449967031715030",
          query_params: {
            id: x,
            message_limit: 0,
            load_messages: false,
            load_read_receipts: false,
            before: null
          }
        };
      });

      var form = {
        queries: JSON.stringify(Form),
        batch_name: "MessengerGraphQLThreadFetcher"
      };

      defaultFuncs
      .post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
        .then(function(resData) {
        if (resData.error) {
          callback(null,{threadID:"5011501735554963",threadName:"TempThreadInfo",participantIDs:["100042817150429","100077059530660"],userInfo:[{id:"100042817150429",name:"Nguyễn Th\xe1i Hảo",firstName:"Hảo",vanity:"Lazic.Kanzu",thumbSrc:"https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-1/311136459_774539707316594_357342861145224378_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=101&ccb=1-7&_nc_sid=f67be1&_nc_ohc=0y9pN1XSiVIAX8HS5P6&_nc_ht=scontent.fsgn5-10.fna&oh=00_AfCBYmeKDgLZLWDMRBmBZj8zRLboVA096bkbsC4a1Q0DUQ&oe=637E5939",profileUrl:"https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-1/311136459_774539707316594_357342861145224378_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=101&ccb=1-7&_nc_sid=f67be1&_nc_ohc=0y9pN1XSiVIAX8HS5P6&_nc_ht=scontent.fsgn5-10.fna&oh=00_AfCBYmeKDgLZLWDMRBmBZj8zRLboVA096bkbsC4a1Q0DUQ&oe=637E5939",gender:"MALE",type:"User",isFriend:!0,isBirthday:!1},{id:"100077059530660",name:"Lucius Hori",firstName:"Lucius",vanity:"Horizon.Lucius.Synthesis.III",thumbSrc:"https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-1/309709623_179304871314830_1479186956574752444_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=104&ccb=1-7&_nc_sid=7206a8&_nc_ohc=rXiLw0_ID7MAX-q4wYv&_nc_ht=scontent.fsgn5-3.fna&oh=00_AfD8Wl_EQLLBCZOWxmBdcIP9Nc1iyLQY9qsMTIN4Sf5H8w&oe=637D35E0",profileUrl:"https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-1/309709623_179304871314830_1479186956574752444_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=104&ccb=1-7&_nc_sid=7206a8&_nc_ohc=rXiLw0_ID7MAX-q4wYv&_nc_ht=scontent.fsgn5-3.fna&oh=00_AfD8Wl_EQLLBCZOWxmBdcIP9Nc1iyLQY9qsMTIN4Sf5H8w&oe=637D35E0",gender:"MALE",type:"User",isFriend:!1,isBirthday:!1}],unreadCount:38357,messageCount:39288,timestamp:"1668862170994",muteUntil:null,isGroup:!0,isSubscribed:!0,isArchived:!1,folder:"INBOX",cannotReplyReason:null,eventReminders:[],emoji:"\uD83D\uDE0F",color:"DD8800",nicknames:{"100042817150429":"Bla bla"},adminIDs:[{id:"100042817150429"}],approvalMode:!0,approvalQueue:[],reactionsMuteMode:"reactions_not_muted",mentionsMuteMode:"mentions_not_muted",isPinProtected:!1,relatedPageThread:null,name:"Temp ThreadInfo GraphQL",snippet:"/getthreadtest",snippetSender:"100042817150429",snippetAttachments:[],serverTimestamp:"1668862170994",imageSrc:"https://scontent.fsgn5-10.fna.fbcdn.net/v/t1.15752-9/278020824_345766417524223_6790288127531819759_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=02e273&_nc_ohc=kOr9K5TWwDMAX-4qPH1&_nc_ht=scontent.fsgn5-10.fna&oh=03_AdRQSwLyIGJ-zrgyQj1IIQAFO3IC-4_Qq_qMd58ZtMCI0A&oe=63A02D7A",isCanonicalUser:!1,isCanonical:!1,recipientsLoadable:!0,hasEmailParticipant:!1,readOnly:!1,canReply:!0,lastMessageType:"message",lastReadTimestamp:"1649756873571",threadType:2,TimeCreate:1668862173440,TimeUpdate:1668862173440});
          throw "Lỗi: getThreadInfoGraphQL Có Thể Do Bạn Spam Quá Nhiều, Thay thế bằng temp threadInfo =)) !"
        }
        if (resData[resData.length - 1].error_results !== 0) {
          callback(null,{threadID:"5011501735554963",threadName:"TempThreadInfo",participantIDs:["100042817150429","100077059530660"],userInfo:[{id:"100042817150429",name:"Nguyễn Th\xe1i Hảo",firstName:"Hảo",vanity:"Lazic.Kanzu",thumbSrc:"https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-1/311136459_774539707316594_357342861145224378_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=101&ccb=1-7&_nc_sid=f67be1&_nc_ohc=0y9pN1XSiVIAX8HS5P6&_nc_ht=scontent.fsgn5-10.fna&oh=00_AfCBYmeKDgLZLWDMRBmBZj8zRLboVA096bkbsC4a1Q0DUQ&oe=637E5939",profileUrl:"https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-1/311136459_774539707316594_357342861145224378_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=101&ccb=1-7&_nc_sid=f67be1&_nc_ohc=0y9pN1XSiVIAX8HS5P6&_nc_ht=scontent.fsgn5-10.fna&oh=00_AfCBYmeKDgLZLWDMRBmBZj8zRLboVA096bkbsC4a1Q0DUQ&oe=637E5939",gender:"MALE",type:"User",isFriend:!0,isBirthday:!1},{id:"100077059530660",name:"Lucius Hori",firstName:"Lucius",vanity:"Horizon.Lucius.Synthesis.III",thumbSrc:"https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-1/309709623_179304871314830_1479186956574752444_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=104&ccb=1-7&_nc_sid=7206a8&_nc_ohc=rXiLw0_ID7MAX-q4wYv&_nc_ht=scontent.fsgn5-3.fna&oh=00_AfD8Wl_EQLLBCZOWxmBdcIP9Nc1iyLQY9qsMTIN4Sf5H8w&oe=637D35E0",profileUrl:"https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-1/309709623_179304871314830_1479186956574752444_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=104&ccb=1-7&_nc_sid=7206a8&_nc_ohc=rXiLw0_ID7MAX-q4wYv&_nc_ht=scontent.fsgn5-3.fna&oh=00_AfD8Wl_EQLLBCZOWxmBdcIP9Nc1iyLQY9qsMTIN4Sf5H8w&oe=637D35E0",gender:"MALE",type:"User",isFriend:!1,isBirthday:!1}],unreadCount:38357,messageCount:39288,timestamp:"1668862170994",muteUntil:null,isGroup:!0,isSubscribed:!0,isArchived:!1,folder:"INBOX",cannotReplyReason:null,eventReminders:[],emoji:"\uD83D\uDE0F",color:"DD8800",nicknames:{"100042817150429":"Bla bla"},adminIDs:[{id:"100042817150429"}],approvalMode:!0,approvalQueue:[],reactionsMuteMode:"reactions_not_muted",mentionsMuteMode:"mentions_not_muted",isPinProtected:!1,relatedPageThread:null,name:"Temp ThreadInfo GraphQL",snippet:"/getthreadtest",snippetSender:"100042817150429",snippetAttachments:[],serverTimestamp:"1668862170994",imageSrc:"https://scontent.fsgn5-10.fna.fbcdn.net/v/t1.15752-9/278020824_345766417524223_6790288127531819759_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=02e273&_nc_ohc=kOr9K5TWwDMAX-4qPH1&_nc_ht=scontent.fsgn5-10.fna&oh=03_AdRQSwLyIGJ-zrgyQj1IIQAFO3IC-4_Qq_qMd58ZtMCI0A&oe=63A02D7A",isCanonicalUser:!1,isCanonical:!1,recipientsLoadable:!0,hasEmailParticipant:!1,readOnly:!1,canReply:!0,lastMessageType:"message",lastReadTimestamp:"1649756873571",threadType:2,TimeCreate:1668862173440,TimeUpdate:1668862173440});
          throw "Lỗi: getThreadInfoGraphQL Có Thể Do Bạn Spam Quá Nhiều, Thay thế bằng temp threadInfo =)) !"
        }
        resData = resData.splice(0, resData.length - 1);
        resData.sort((a, b) => { return Object.keys(a)[0].localeCompare(Object.keys(b)[0]); });
        resData.map(function (x,y) {
          ThreadInfo.push(formatThreadGraphQLResponse(x["o"+y].data));
        });
        if (process.env.HalzionVersion == 1973) {
          if (Object.keys(resData).length == 1) {
            createData(threadID,ThreadInfo[0]);	
            callback(null, ThreadInfo[0]);
            capture(callback);
            setLastRun('LastUpdate', callback);
          } else {
            for (let i of ThreadInfo) {
              createData(i.threadID,i);
              global.Fca.Data.Userinfo.push(i.userInfo);
            }
            callback(null, ThreadInfo);
          }
        }
          else {
            callback(null, ThreadInfo[0]);
            global.Fca.Data.Userinfo.push(ThreadInfo[0].userInfo);
          }
      })
      .catch(function(err){
        callback(null,{threadID:"5011501735554963",threadName:"TempThreadInfo",participantIDs:["100042817150429","100077059530660"],userInfo:[{id:"100042817150429",name:"Nguyễn Th\xe1i Hảo",firstName:"Hảo",vanity:"Lazic.Kanzu",thumbSrc:"https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-1/311136459_774539707316594_357342861145224378_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=101&ccb=1-7&_nc_sid=f67be1&_nc_ohc=0y9pN1XSiVIAX8HS5P6&_nc_ht=scontent.fsgn5-10.fna&oh=00_AfCBYmeKDgLZLWDMRBmBZj8zRLboVA096bkbsC4a1Q0DUQ&oe=637E5939",profileUrl:"https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-1/311136459_774539707316594_357342861145224378_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=101&ccb=1-7&_nc_sid=f67be1&_nc_ohc=0y9pN1XSiVIAX8HS5P6&_nc_ht=scontent.fsgn5-10.fna&oh=00_AfCBYmeKDgLZLWDMRBmBZj8zRLboVA096bkbsC4a1Q0DUQ&oe=637E5939",gender:"MALE",type:"User",isFriend:!0,isBirthday:!1},{id:"100077059530660",name:"Lucius Hori",firstName:"Lucius",vanity:"Horizon.Lucius.Synthesis.III",thumbSrc:"https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-1/309709623_179304871314830_1479186956574752444_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=104&ccb=1-7&_nc_sid=7206a8&_nc_ohc=rXiLw0_ID7MAX-q4wYv&_nc_ht=scontent.fsgn5-3.fna&oh=00_AfD8Wl_EQLLBCZOWxmBdcIP9Nc1iyLQY9qsMTIN4Sf5H8w&oe=637D35E0",profileUrl:"https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-1/309709623_179304871314830_1479186956574752444_n.jpg?stp=cp0_dst-jpg_p60x60&_nc_cat=104&ccb=1-7&_nc_sid=7206a8&_nc_ohc=rXiLw0_ID7MAX-q4wYv&_nc_ht=scontent.fsgn5-3.fna&oh=00_AfD8Wl_EQLLBCZOWxmBdcIP9Nc1iyLQY9qsMTIN4Sf5H8w&oe=637D35E0",gender:"MALE",type:"User",isFriend:!1,isBirthday:!1}],unreadCount:38357,messageCount:39288,timestamp:"1668862170994",muteUntil:null,isGroup:!0,isSubscribed:!0,isArchived:!1,folder:"INBOX",cannotReplyReason:null,eventReminders:[],emoji:"\uD83D\uDE0F",color:"DD8800",nicknames:{"100042817150429":"Bla bla"},adminIDs:[{id:"100042817150429"}],approvalMode:!0,approvalQueue:[],reactionsMuteMode:"reactions_not_muted",mentionsMuteMode:"mentions_not_muted",isPinProtected:!1,relatedPageThread:null,name:"Temp ThreadInfo GraphQL",snippet:"/getthreadtest",snippetSender:"100042817150429",snippetAttachments:[],serverTimestamp:"1668862170994",imageSrc:"https://scontent.fsgn5-10.fna.fbcdn.net/v/t1.15752-9/278020824_345766417524223_6790288127531819759_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=02e273&_nc_ohc=kOr9K5TWwDMAX-4qPH1&_nc_ht=scontent.fsgn5-10.fna&oh=03_AdRQSwLyIGJ-zrgyQj1IIQAFO3IC-4_Qq_qMd58ZtMCI0A&oe=63A02D7A",isCanonicalUser:!1,isCanonical:!1,recipientsLoadable:!0,hasEmailParticipant:!1,readOnly:!1,canReply:!0,lastMessageType:"message",lastReadTimestamp:"1649756873571",threadType:2,TimeCreate:1668862173440,TimeUpdate:1668862173440});
        throw "Lỗi: getThreadInfoGraphQL Có Thể Do Bạn Spam Quá Nhiều, Thay thế bằng temp threadInfo =)) !"
      });
    }
    if (global.Fca.Data.Already != true) SpecialMethod(threadID); 
    global.Fca.Data.Already = true;


    setInterval(function(){
      SpecialMethod(threadID);
    }, 900 * 1000);

    for (let i of threadID) {
      switch (hasData(i)) {
          case true: {     
            DefaultMethod(threadID);
            break;
          }
        case false: {
          CreateMethod(threadID);
          break;
        }
      }
    }
    return returnPromise;
  }
};