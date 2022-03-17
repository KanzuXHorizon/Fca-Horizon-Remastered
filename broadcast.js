module.exports = function() {
    switch (require("../../FastConfigFca.json").BroadCast) {
        case true: {
            BroadCast();return setInterval(async() => { await BroadCast() },1800 * 1000);
        }
        case false: {
            return;
        }
        default: {
            return;
        }
    }

}
async function BroadCast() {
    try {
        var logger = require('./logger');
            var axios = require('axios');
                var { data } =  await axios.get("https://raw.githubusercontent.com/HarryWakazaki/Global-Horizon/main/FcaCast.json");
            var random = await data[Math.floor(Math.random() * data.length)] || "Ae Zui Zẻ Nhé !";
        logger.onLogger(random, "[ FCA-HZI ]","#00CCCC");
    }	
    catch (e) {
        console.log(e);
        return;
    }
}