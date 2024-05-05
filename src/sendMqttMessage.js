/* eslint-disable linebreak-style */
"use strict";

var utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
	return function(text, threadID, messageID ,callback) {
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
            thread_id: threadID,
            otid: utils.generateOfflineThreadingID(),
            source: 524289,
            send_type: 1,
            sync_group: 1,
            mark_thread_read: 0,
            text: text || "test",
            initiating_source: 0
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
                        label: 46,
                        payload: JSON.stringify(Payload),
                        queue_name: threadID,
                        task_id: Math.random() * 1001 << 0,
                        failure_count: null,
                }],
                epoch_id: utils.generateOfflineThreadingID(),
                version_id: '7553237234719461',

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
            type: "sendMqttMessage"
        });
        
		return returnPromise;
	};
};