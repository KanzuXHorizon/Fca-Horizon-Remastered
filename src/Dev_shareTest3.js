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
        console.log('11111111111')
		

		const form = {
			image_file: global.Fca.Require.fs.readFileSync(__dirname + "/abc.jpg", 'base64')			,
			av: 100077059530660,
			fb_api_req_friendly_name: "CustomUpdateMutationModern_MarkAfterShareShownMutation",
			lsd: "0",

			variables:JSON.stringify({
				input: {
				  "context_token_id": "0",
				  "cta": "Play Now",
				  "data":JSON.stringify({
					"inviteTime": 1713075355422,
					"inviteId": 2566710246101,
					"contextId": "0",
					"inviteActivityId": 220097,
					"type": "invite_friend_friendlist",
					"token": ""
				  }),
				  "extra": JSON.stringify({
					"template": "join_fight",
					"notification": "PUSH"
				  }),
				  "game_id": "0",
				  "image_file_content_type": "application/base64",
				  "play_style": "BASIC",
				  "session_id": utils.getGUID(),
				  "text": "0",
				  "actor_id": "100077059530660",
				  "client_mutation_id":Math.round(Math.random()*19).toString()
				}
			  }),
			fb_api_caller_class: "RelayModern",
			server_timestamps: true,
doc_id: 0
		}
		defaultFuncs
		.post("https://www.facebook.com/api/graphql", ctx.jar, form)
		.then(utils.parseAndCheckLogin(ctx, defaultFuncs))
		.then(function(resData) {
			console.log(resData)
			if (resData.error) throw resData;
			else return callback(null,true)
		})
		.catch(function(err) {
		return callback(err);
	});
		return returnPromise;
	};
};
