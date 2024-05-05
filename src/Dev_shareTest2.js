"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function (defaultFuncs, api, ctx) {
	return async function shareTest(text, senderID, threadID, callback) {
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
		ctx.req_ID++;
		var form = JSON.stringify({
						"app_id": "2220391788200892",
						"payload": JSON.stringify({
								tasks: [{
                                    label: '46',
										payload: JSON.stringify({
											//"contact_id": senderID,
                                            "otid": utils.generateOfflineThreadingID(),
                                            "source": "1572866",
											"sync_group": 1,
                                            "send_type": 7,
                                            "mark_thread_read": 1,
                                            "url": "",
                                            "attribution_app_id": ,
                                            "skip_url_preview_gen": 0,
                                            "text_has_links": 0,
                                            "multitab_env": 0,
											//"text": text || "",
											"thread_id": 6711308795587598,
                                            "initiating_source": 0
										}),
										queue_name: '6711308795587598',
										task_id: Math.random() * 1001 << 0,
										failure_count: null,
								},
                            {
                                label: '21',
                                payload: JSON.stringify({
                                    "thread_id": 6711308795587598,
                                    last_read_watermark_ts: 1713035994383,
                                    sync_group: 1
                                }),
                                queue_name: 6711308795587598,
                                task_id: Math.random() * 1001 << 0,
                                failure_count: null
                            }],
								epoch_id: utils.generateOfflineThreadingID(),
								version_id: '7191105584331330',
                                data_trace_id: ""
						}),
						"request_id": ctx.req_ID,
						"type": 3
				});
		ctx.mqttClient.publish('/ls_req',form)

		return returnPromise;
	};
};
