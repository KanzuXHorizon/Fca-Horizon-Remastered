/* eslint-disable linebreak-style */
"use strict";

var utils = require("../utils");
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

const MAX_ARRAY_LENGTH = 6; //safe 
var Request_Update_Time = 0;
var updateInterval;
var updateTimeout;
let Queues = [];

let onetimecook = false

function addToQueues(num) {
  const existingArray = Queues.some(subArr => subArr.some(obj => obj.threadID == num.threadID));

  if (!existingArray) {
    if (Queues.length > 0 && Queues[Queues.length - 1].length === MAX_ARRAY_LENGTH) {
      Queues.push([num]);
    } else {
      const lastArray = Queues.length > 0 ? Queues[Queues.length - 1] : [];
      lastArray.push(num);

      if (Queues.length === 0) {
        Queues.push(lastArray);
      }
    }
  }
}


module.exports = function(defaultFuncs, api, ctx) {

  var { createData,getData,hasData,updateData, getAll } = require('../Extra/ExtraGetThread');
  var Database = require('../Extra/Database');
  
  return async function getThreadInfoGraphQL(threadID, callback) {
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
    
    if (utils.getType(threadID) !== "Array") threadID = [threadID];


    if (utils.getType(global.Fca.Data.Userinfo) == "Array" || global.Fca.Data.Userinfo == undefined) global.Fca.Data.Userinfo = new Map();

    const updateUserInfo = (threadInfo) => {
      if (!global.Fca.Data.Userinfo) {
        global.Fca.Data.Userinfo = new Map();
      }
    
      threadInfo.forEach(thread => {
        const userInfo = thread.userInfo;
    
        if (Array.isArray(userInfo)) {
          const userInfoMap = new Map(userInfo.map(user => [user.id, user]));
          for (const [id, user] of userInfoMap) {
            global.Fca.Data.Userinfo.set(id, user);
          }
        }
      });
    };
  
  const getMultiInfo = async function (threadIDs) {
      let form = {};
      let tempThreadInf = [];
          threadIDs.forEach((x,y) => {
              form["o" + y] = {
                  doc_id: "3449967031715030",
                  query_params: { id: x, message_limit: 0, load_messages: false, load_read_receipts: false, before: null }
              }; 
          });
      let Submit = { queries: JSON.stringify(form), batch_name: "MessengerGraphQLThreadFetcher" };
          
      const promise = new Promise((resolve, reject) => {
          defaultFuncs.post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, Submit)
          .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
          .then(resData => {
              if (resData.error || resData[resData.length - 1].error_results !== 0) throw "Lỗi: getThreadInfoGraphQL Có Thể Do Bạn Spam Quá Nhiều";
                  resData = resData.slice(0, -1).sort((a, b) => Object.keys(a)[0].localeCompare(Object.keys(b)[0]));
                  resData.forEach((x, y) => tempThreadInf.push(formatThreadGraphQLResponse(x["o" + y].data)));
                  return resolve({
                      Success: true,
                      Data: tempThreadInf
                  });
          })
          .catch(() => { 
              reject({ Success: false, Data: '' }) 
          });
      })
  
      return await promise;
  }
  
  const formatAndUpdateData = (AllThreadInfo) => {
      try {
          AllThreadInfo.forEach(threadInf => { updateData(threadInf.threadID, threadInf); })
          updateUserInfo(AllThreadInfo) // [ {}, {} ]
  
      } catch (e) {
          console.log(e);
      }
  }

  const formatAndCreateData = (AllThreadInfo) => {
    try {
        AllThreadInfo.forEach(threadInf => { createData(threadInf.threadID, threadInf); })
        updateUserInfo(AllThreadInfo) // [ {}, {} ]

    } catch (e) {
        console.log(e);
    }
}
  
  const checkAverageStaticTimestamp = function (avgTimeStamp) {
    const DEFAULT_UPDATE_TIME = 900 * 1000; //thời gian cập nhật tối đa + với thời gian trung bình của tổng request 1 mảng
    //khi request phút thứ 3, 1 req ở phút thứ 7, 1 req ở phút thứ 10, vậy trung bình là (3+7+1) / time.length (3) + với 15p = tg trung bình để cập nhật 1 mảng
    const MAXIMUM_ERROR_TIME = 10 * 1000;
    return { //khi check = false thì cần cập nhật vì đã hơn thời gian tb + 15p
        Check:  (parseInt(avgTimeStamp) + parseInt(DEFAULT_UPDATE_TIME)) + parseInt(MAXIMUM_ERROR_TIME) >= Date.now(), // ở đây avgTimeStamp là thời gian cố định của 1 mảng queue khi đầy 
        timeLeft: (parseInt(avgTimeStamp) + parseInt(DEFAULT_UPDATE_TIME)) - Date.now() + parseInt(MAXIMUM_ERROR_TIME)
    }
  }
  
  const autoCheckAndUpdateRecallTime = () => {
      let holdTime = [];
      let oneTimeCall = false;
      //lấy tất cả trung bình thời gian của tất cả mảng và tìm thời gian còn lại ngắn nhất, nếu có sẵn id cần cập nhật thì cập nhật ngày lập tức
      Queues.forEach((i, index) => {
          // [ { threadID, TimeCreate }, {} ]
          const averageTimestamp = Math.round(i.reduce((acc, obj) => acc + obj.TimeCreate, 0) / i.length);
          const DataAvg = checkAverageStaticTimestamp(averageTimestamp);
          if (DataAvg.Check) {
            //cần chờ
             // holdTime.push(DataAvg.timeLeft);
             //cho thi cho 10s sau check lai roi cho tiep nhe =))
          }
          else {
            oneTimeCall = true;
          }
      });

      if (oneTimeCall) autoUpdateData(); // cập nhật ngay, nhin la biet tot hon hold roi =))

      // if (holdTime.length >= 1) {
      //     holdTime.sort((a,b) => a - b) //low to high time
      //     if (holdTime[0] > Request_Update_Time) {
      //         Request_Update_Time = holdTime[0];
      //         clearInterval(updateInterval);
      //         updateInterval = setInterval(() => { autoUpdateData(); }, holdTime[0])
      //     }
      // }

      //hold lam cai cho gi khi ta co check lien tuc 10s 1 lan 😔

      const MAXIMUM_RECALL_TIME = 30 * 1000;
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => { autoCheckAndUpdateRecallTime(); }, MAXIMUM_RECALL_TIME)
  }
  
  const autoUpdateData = async function() {
      //[ [ {}, {} ], [ {}, {}  ] ]
      let doUpdate = [];
      let holdTime = [];
  
      Queues.forEach((i, index) => {
          // [ {}, {} ]
          const averageTimestamp = Math.round(i.reduce((acc, obj) => acc + obj.TimeCreate, 0) / i.length);
          // thời gian trung bình của 1 mảng từ lúc bắt đầu request lần đầu, cần + thêm thời gian cố định là 15p !
  
          const DataAvg = checkAverageStaticTimestamp(averageTimestamp)
          if (DataAvg.Check) {
              // chờ tiếp
          }
          else {
            // đã hơn thời gian 15p
              doUpdate.push(i) // [ {}, {} ]
              Queues.splice(index, 1); //đạt điều kiện nên xoá để tý nó tự thêm 💀
          }
  
      });
  
      if (doUpdate.length >= 1) {
          // maybe [ [ {}, {} ] [ {}, {} ] ]
          let ids = []; // [ id, id ]
          doUpdate.forEach(i => {
              //[ {} {} ]
              const onlyThreadID = [...new Set(i.map(obj => obj.threadID))]; // [ id1, id2 ]
              ids.push(onlyThreadID) //[ [ id1, id2 ] ]
          })
  
          // [ [ id1, id2 ],[ id1, id2 ] ] 5 per arr
  
          ids.forEach(async function(i) {
              const dataResp = await getMultiInfo(i);
              if (dataResp.Success == true) {
                  let MultiThread = dataResp.Data;
                  formatAndUpdateData(MultiThread)
              }
              else {
                  global.Fca.Require.logger.Warning('CANT NOT GET THREADINFO 💀 MAYBE U HAS BEEN BLOCKED FROM FACEBOOK');
              }
          })
      }
  }
  
  const createOrTakeDataFromDatabase = async (threadIDs) => {
      let inDb = []; //NOTE: xử lý resp thành 1 mảng nếu có nhiều hơn 1 threadID và obj nếu 1 threadID
      let inFastArr = [];
      let createNow = [];
      let cbThreadInfos = [];
      // kiểm tra và phân ra 2 loại 1 là chưa  có 2 là có =))
      // kiểm tra
  
      threadIDs.forEach(id => {
          // id, id ,id
          hasData(id) == true ? inDb.push(id) : createNow.push(id)
      });

      if (inDb.length >= 1) {
          let threadInfos = inDb.map(id => getData(id));
          cbThreadInfos = cbThreadInfos.concat(threadInfos);
          updateUserInfo(threadInfos);
  
          //request update queue
          threadInfos.forEach(i => addToQueues({ threadID: i.threadID, TimeCreate: Date.now() }));
      }
      if (createNow.length >= 1) {
          //5 data per chunk []
          const chunkSize = 5;
          const totalChunk = []; // [ [ id, id ], [ id,id ] ]
          
          for (let i = 0; i < createNow.length; i += chunkSize) {
            const chunk = createNow.slice(i, i + chunkSize);
            totalChunk.push(chunk);
          }
  
          for (let i of totalChunk) {
              //i = [ id,id ]
              const newThreadInf = await getMultiInfo(i); // always [ {} ] or [ {}, {} ]
              if (newThreadInf.Success == true) {
                let MultiThread = newThreadInf.Data;  
                formatAndCreateData(MultiThread)
                cbThreadInfos = cbThreadInfos.concat(MultiThread)
    
                //request update queue
                MultiThread.forEach(i => addToQueues({ threadID: i.threadID, TimeCreate: Date.now() }));
            }
            else {
                global.Fca.Require.logger.Warning('CANT NOT GET THREADINFO 💀 MAYBE U HAS BEEN BLOCKED FROM FACEBOOK');
            }
          } 
      }
      return cbThreadInfos.length == 1 ? callback(null, cbThreadInfos[0]) : callback(null, cbThreadInfos)
  }

    if (global.Fca.Data.Already != true) {
      global.Fca.Data.Already = true;
      autoCheckAndUpdateRecallTime(); 
      setInterval(function(){ 
        const MapToArray = Array.from(global.Fca.Data.Userinfo, ([name, value]) => (value));
        Database(true).set('UserInfo', MapToArray); 
      }, 420 * 1000); 
    } 

    await createOrTakeDataFromDatabase(threadID);
    
    return returnPromise;
  };
};