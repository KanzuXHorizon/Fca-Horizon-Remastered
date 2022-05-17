module.exports = function({ api }) {
    return function() {
        switch (global.Fca.Require.FastConfig.BroadCast) {
            case true: {
                BroadCast();
                return setInterval(() => { 
                    try {
                        BroadCast();
                    }
                    catch (e) {
                        console.log(e);
                    }
                },1800 * 1000);
            }
            case false: {
                break;
            }
            default: {
                break;
            }
        }
    }
}

function BroadCast() {
    try {
        var logger = global.Fca.Require.logger;
            var Fetch = global.Fca.Require.Fetch;
                Fetch.get("https://raw.githubusercontent.com/HarryWakazaki/Global-Horizon/main/FcaCast.json").then(async (res) => {
                var random = JSON.parse(res.body.toString())[Math.floor(Math.random() * JSON.parse(res.body.toString()).length)] || "Ae Zui Zẻ Nhé !";
            logger.Normal(random, "[ FCA-HZI ]");
        }); 
    }	
    catch (e) {
        console.log(e);
        return;
    }
}