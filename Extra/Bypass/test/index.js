/** By @KanzuWakazaki 03/05/2024 - DD/MM/YYYY */
var Form_P1;
var CanResolve_P1;
var NextToken_P1;
var lsd;
utils.get('https://www.facebook.com/checkpoint/828281030927956/?next=https%3A%2F%2Faccountscenter.facebook.com%2Fpassword_and_security', ctx.jar, null, ctx.globalOptions)
    .then(function(data) {
        lsd = utils.getFrom(data.body, "[\"LSD\",[],{\"token\":\"", "\"}")
        Form_P1 = {
            lsd: lsd,
            fb_api_caller_class: 'RelayModern',
            fb_api_req_friendly_name: 'useEpsilonNavigateMutation',
            variables: JSON.stringify({
                input:{
                    client_mutation_id:"1",
                    actor_id: ctx.userId,
                    step:"STEPPER_CONFIRMATION",
                    token : JSON.stringify({
                        sensitive_string_value: Find_And_Parse(data.body)
                    })
                },
                scale:1
            }),
            server_timestamps: true,
            doc_id: 7414856831926043
        };
    })
.then(function() {
    defaultFuncs.postFormData('https://www.facebook.com/api/graphql/', ctx.jar, Form_P1, {}) 
    .then(function(resp) {
        let checkpoint = resp.data.epsilon_navigate.epsilon_checkpoint;
        if (checkpoint.id == '__EPSILON_CLIENT__' && checkpoint.__typename == "EpsilonStepperScreen" && checkpoint.screen.next_screen == 'CONTACT_POINT_REVIEW' && checkpoint.screen.steps.length === 3 && checkpoint.screen.steps[1].active == true) {
            NextToken_P1 = checkpoint.screen.token;    
            return CanResolve_P1 = true;
        }
        else return CanResolve_P1 = false;
    });
})

var CanResolve_P2;
var NextToken_P2;

let Form_P2 = {
    doc_id: 7414856831926043,
    lsd: lsd,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "useEpsilonNavigateMutation",
    server_timestamps: true,
    variables: JSON.stringify({
        input: {
            client_mutation_id: 2,
            actor_id: ctx.userId,
            step:"CONTACT_POINT_REVIEW",
            token: JSON.stringify({
                sensitive_string_value: NextToken_P1
            })
        },
        scale: 1
    })
}

defaultFuncs.postFormData('https://www.facebook.com/api/graphql/', ctx.jar, Form_P2, {}).then(function(resp) {
    let checkpoint = resp.data.epsilon_navigate.epsilon_checkpoint;
    if (checkpoint.id == '__EPSILON_CLIENT__' && checkpoint.__typename == "EpsilonContactPointReview" && checkpoint.screen.contact_points.length >= 1 && checkpoint.screen.contact_points[0].suspicious == "UNSUSPICIOUS") {
        NextToken_P2 = checkpoint.screen.token;    
        return CanResolve_P2 = true;
    }
    else return CanResolve_P2 = false;
});


var CanResolve_P3;
var NextToken_P3;
let Form_P3 ={
    doc_id: 7414856831926043,
    lsd: lsd,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "useEpsilonNavigateMutation",
    server_timestamps: true,
    variables: JSON.stringify({
        input: {
            client_mutation_id: 3,
            actor_id: ctx.userId,
            step: "CHANGE_PASSWORD",
            token: JSON.stringify({
                sensitive_string_value: NextToken_P2
            })
        },
        scale:1
    })
}

defaultFuncs.postFormData('https://www.facebook.com/api/graphql/', ctx.jar, Form_P3, {}).then(function(resp) {
    let checkpoint = resp.data.epsilon_navigate.epsilon_checkpoint;
    if (checkpoint.id == '__EPSILON_CLIENT__' && checkpoint.__typename == "EpsilonLoginDetailsConfirmationScreen" && checkpoint.screen.contact_points.length >= 1) {
        NextToken_P3 = checkpoint.screen.token;    
        return CanResolve_P3 = true;
    }
    else return CanResolve_P3 = false;
});

var CanResolve_P4;
var NextToken_P4;
let Form_P4 ={
    doc_id: 7414856831926043,
    lsd: lsd,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "useEpsilonNavigateMutation",
    server_timestamps: true,
    variables: JSON.stringify({
        input: {
            client_mutation_id: 4,
            actor_id: ctx.userId,
            step: "OUTRO",
            token: JSON.stringify({
                sensitive_string_value: NextToken_P3
            })
        },
        scale:1
    })
}

defaultFuncs.postFormData('https://www.facebook.com/api/graphql/', ctx.jar, Form_P4, {}).then(function(resp) {
    let checkpoint = resp.data.epsilon_navigate.epsilon_checkpoint;
    if (checkpoint.id == '__EPSILON_CLIENT__' && checkpoint.__typename == "EpsilonOutroScreen" && checkpoint.screen.fallback.uri == 'https://www.facebook.com/') {
        NextToken_P4 = checkpoint.screen.token;    
        return CanResolve_P4 = true;
    }
    else return CanResolve_P4 = false;
});


function Find_And_Parse(Data) {
    const regex = /<script\s+type="application\/json"\s+data-content-len="([0-9]+)"\s+data-sjs\s*(.*?)\s*<\/script>/gs;
    const matches = Data.matchAll(regex);
    let Data_resp;
    for (const match of matches) {
        if (JSON.parse(JSON.stringify((match[2]))).includes('any_eligible_challenges')) {
            const Data_ = JSON.parse(match[2].replace('>', ''))
            Data_resp = findAnyEligibleChallengesAndSiblings(Data_)
        }

    }
    
    
    function findAnyEligibleChallengesAndSiblings(data) {
        const screenData = findScreenData(data);
        if (!screenData) {
            return null;
        }
    
        const siblings = {};
        for (const [key, value] of Object.entries(screenData)) {
            if (key === 'any_eligible_challenges') {
                siblings[key] = value;
            } 
            else {
                siblings[key] = value;
            }
        }
    
        return siblings;
    }
    
    function findScreenData(data) {
        if (Array.isArray(data)) {
            for (const item of data) {
                const result = findScreenData(item);
                if (result) {
                    return result;
                }
            }
        } 
        else if (typeof data === 'object' && data !== null) {
            if (data.screen) {
                return data.screen;
            }
            for (const value of Object.values(data)) {
                const result = findScreenData(value);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }    
    return Data_resp.token || null
}