/* eslint-disable linebreak-style */
"use strict";

var utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
	return function editMessage(messageID, changedText, callback) {
		var resolveFunc = function () { };
		var rejectFunc = function () { };

		var returnPromise = new Promise(function (resolve, reject) {
			resolveFunc = resolve;
			rejectFunc = reject;
		});

		if (!callback) {
			callback = function (err, data) {
				if (err) return rejectFunc(err);
				resolveFunc(data);
			};
		}
		ctx.mqttClient.publish('/ls_req', 
			JSON.stringify({
				app_id: "2220391788200892",
				payload: JSON.stringify({
					tasks: [{
							label: 742,
							payload: JSON.stringify({
                                message_id: messageID,
                                text: changedText //how tf this didn't need threadID:D
							}),
							queue_name: 'edit_message',
							task_id: Math.random() * 1001 << 0,
							failure_count: null,
					}],
					epoch_id: utils.generateOfflineThreadingID(),
					version_id: '7992185107461798',
				}),
				request_id: ++ctx.req_ID,
				type: 3
			}),
            {
                qos: 1,
                retain: false,
            }
		);
        ctx.callback_Task[ctx.req_ID] = new Object({
            callback,
            type: "editMessage"
        });
		return returnPromise;
	};
};
