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

  var { createData,getData,hasData,setLastRun,updateData, getAll } = require('../Extra/ExtraGetThread');
  var { capture } = require('../Extra/Src/Last-Run');
  var Database = require('../Extra/Database');
  global.Fca.Data.Userinfo = [];
  
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

      if (utils.getType(threadID) !== "Array") threadID = [threadID];


    var SpecialMethod = function(TID) {
      var All = getAll();
      var Real = [];
      for (let i of All) {
          if (i.data.threadID != undefined) {
            Real.push(i.data.threadID);
          } else continue;
      }
    var AllofThread = [];
    if (Real.length == 0) return;
    else if (Real.length == 1) {
      return DefaultMethod(TID);
    } 
    else if (All.length > 1) {
      for (let i of All) {
        if (i.data.threadID != undefined) {
          AllofThread.push(i.data.threadID);
        } else continue;
      }
      var Form = {};
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
            throw "Lỗi: getThreadInfoGraphQL Có Thể Do Bạn Spam Quá Nhiều";
          }
          if (resData[resData.length - 1].error_results !== 0) {
            throw "Lỗi: getThreadInfoGraphQL Có Thể Do Bạn Spam Quá Nhiều";
          }
          resData = resData.splice(0, resData.length - 1);
          resData.sort((a, b) => { return Object.keys(a)[0].localeCompare(Object.keys(b)[0]); });
          resData.map(function (x,y) {
            ThreadInfo.push(formatThreadGraphQLResponse(x["o"+y].data));
          });
          if (process.env.HalzionVersion == 1973) {
            try {
            if (Object.keys(resData).length == 1) {
              updateData(threadID,ThreadInfo[0]);	
              if (utils.getType(ThreadInfo[0].userInfo) == "Array") {
                for (let i of ThreadInfo[0].userInfo) {
                  if (global.Fca.Data.Userinfo.some(ii => ii.id == i.id)) {
                    global.Fca.Data.Userinfo.splice(global.Fca.Data.Userinfo.findIndex(ii => ii.id == i.id), 1);
                  }
                  global.Fca.Data.Userinfo.push(i);
                }
              }
            } else {
              for (let i of ThreadInfo) {
                updateData(i.threadID,i);
                if (utils.getType(i.userInfo) == "Array") {
                  for (let ii of i.userInfo) {
                    if (global.Fca.Data.Userinfo.some(iii => iii.id == ii.id)) {
                      global.Fca.Data.Userinfo.splice(global.Fca.Data.Userinfo.findIndex(iii => iii.id == ii.id), 1);
                    }
                    global.Fca.Data.Userinfo.push(ii);
                  }
                }
              }
            }
          }
        catch (e) {
          console.log(e);
        }
      }
        })
        .catch(function(err){
          throw "Lỗi: getThreadInfoGraphQL Có Thể Do Bạn Spam Quá Nhiều";
        });
      }
    };

    var DefaultMethod = function(TID) { 
      var ThreadInfo = [];
      for (let i of TID) {
        ThreadInfo.push(getData(i));
      }
      if (ThreadInfo.length == 1) {
        callback(null,ThreadInfo[0]);
        if (utils.getType(ThreadInfo[0].userInfo) == "Array") {
          for (let i of ThreadInfo[0].userInfo) {
            if (global.Fca.Data.Userinfo.some(ii => ii.id == i.id)) {
              global.Fca.Data.Userinfo.splice(global.Fca.Data.Userinfo.findIndex(ii => ii.id == i.id), 1);
            }
            global.Fca.Data.Userinfo.push(i);
          }
      } else {
        for (let i of ThreadInfo) {
          if (utils.getType(i.userInfo) == "Array") {
            for (let ii of i.userInfo) {
              if (global.Fca.Data.Userinfo.some(iii => iii.id == ii.id)) {
                global.Fca.Data.Userinfo.splice(global.Fca.Data.Userinfo.findIndex(iii => iii.id == ii.id), 1);
              }
              global.Fca.Data.Userinfo.push(ii);
            }
          }
        }
        callback(null,ThreadInfo);
      }
    }
  };
    var CreateMethod = function(TID) { 
      var Form = {};
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
          throw resData.error;
        }
        if (resData[resData.length - 1].error_results !== 0) {
          throw resData.error;
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
            if (utils.getType(ThreadInfo[0].userInfo) == "Array") {
              for (let i of ThreadInfo[0].userInfo) {
                if (global.Fca.Data.Userinfo.some(ii => ii.id == i.id)) {
                  global.Fca.Data.Userinfo.splice(global.Fca.Data.Userinfo.findIndex(ii => ii.id == i.id), 1);
                }
                global.Fca.Data.Userinfo.push(i);
              }
            }
          } else {
           // api.Horizon_Data([ThreadInfo], "Threads", "Post");
            for (let i of ThreadInfo) {
              createData(i.threadID,i);
              if (utils.getType(i.userInfo) == "Array") {
                for (let ii of i.userInfo) {
                  if (global.Fca.Data.Userinfo.some(iii => iii.id == ii.id)) {
                    global.Fca.Data.Userinfo.splice(global.Fca.Data.Userinfo.findIndex(iii => iii.id == ii.id), 1);
                  }
                  global.Fca.Data.Userinfo.push(ii);
                }
              }
            }
            callback(null, ThreadInfo);
          }
        }
          else {
            callback(null, ThreadInfo[0]);
            if (utils.getType(ThreadInfo[0].userInfo) == "Array") {
              for (let i of ThreadInfo[0].userInfo) {
                if (global.Fca.Data.Userinfo.some(ii => ii.id == i.id)) {
                  global.Fca.Data.Userinfo.splice(global.Fca.Data.Userinfo.findIndex(ii => ii.id == i.id), 1);
                }
                global.Fca.Data.Userinfo.push(i);
              }
            }
          }
      })
      .catch(function(err){
        throw err;
      });
    };
    if (global.Fca.Data.Already != true) SpecialMethod(threadID); 
    global.Fca.Data.Already = true;


    setInterval(function(){
      Database(true).set('UserInfo', global.Fca.Data.Userinfo);
        global.Fca.Data.Userinfo = [];
      SpecialMethod(threadID);
    }, 900 * 1000);
    try {
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
    }
    catch (err) {
      console.log(err);
    }
    return returnPromise;
  };
};