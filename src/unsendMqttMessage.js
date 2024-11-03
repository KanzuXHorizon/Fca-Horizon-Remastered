/* eslint-disable linebreak-style */
"use strict";

var utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
	return function(threadID, messageID ,callback) {
		var resolveFunc = function () { };
		var rejectFunc = function () { };

		var returnPromise = new Promise(function (resolve, reject) {
			resolveFunc = resolve;
			rejectFunc = reject;
		});

        if (!callback && utils.getType(messageID) === "AsyncFunction" || !callback && utils.getType(messageID) === "Function") messageID = callback;
		
        if (!callback) {
			callback = function (err, data) {
				if (err) return rejectFunc(err);
				resolveFunc(data);
			};
		}

        const Payload = {
            message_id:messageID,
            thread_key:threadID,
            sync_group: 1
        };

        if (messageID != undefined || messageID != null) Payload.reply_metadata = {
            reply_source_id: messageID,
            reply_source_type: 1,
            reply_type: 0
        };

        const Form = JSON.stringify({
            app_id: "2220391788200892",
            payload: JSON.stringify({
                tasks: [{
                    label: 33,
                    payload: JSON.stringify(Payload),
                    queue_name: "unsend_message",
                    task_id: Math.random() * 1001 << 0,
                    failure_count: null,
                }],
                epoch_id: utils.generateOfflineThreadingID(),
                version_id: '9094446350588544',

            }),
            request_id: ++ctx.req_ID,
            type: 3
        });

		ctx.mqttClient.publish('/ls_req', Form,{
            qos: 1,
            retain: false,
        });
        ctx.callback_Task[ctx.req_ID] = new Object({
            callback,
            type: "unsendMqttMessage",
        });
        
		return returnPromise;
	};
};