// Credit: Kb2a Team

var fetch = require("got")

/**
  * Translate a text from <from> to <to> using Bing engine
  * @async
  * @method bing
  * @param  {string} text  Text to be translated
  * @param  {string} from  Source language
  * @param  {string} to    Destination language
  * @return {string} Translated text
  * @example
  * await bing("xin chào kẻ mạo danh", "vi", "en") // => "hello impostor"
  */
async function bing(text, from, to) {
    const body = await fetch.get(`http://api.microsofttranslator.com/V2/Ajax.svc/Translate?appId=68D088969D79A8B23AF8585CC83EBA2A05A97651&from=${from}&to=${to}&text=${text}`).text()
    return body.replace(/\"/g,'')
}

/**
  * Translate a text from <from> to <to> using Google engine
  * @async
  * @method bing
  * @param  {string} text  Text to be translated
  * @param  {string} [from="auto"]  Source language
  * @param  {string} to    Destination language
  * @return {string} Translated text
  * @example
  * await google("giữa chúng ta", null, "en") // => "among us"
  */

async function google(text, from, to) {
    const json = await 
        fetch
            .get(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${text}
            `)
        .json()
    return json[0][0][0];
}

/**
  * Detect language that the text are using
  * @async
  * @method detect
  * @param  {string} text  Source text
  * @return {string} language
  * @example
  * await detect("Hello") // => "vi"
  */

async function detect(text) {
    const body = await fetch.get(`https://api.microsofttranslator.com/V2/Http.svc/Detect?&appid=68D088969D79A8B23AF8585CC83EBA2A05A97651&text=${text}`);
    return />(.*?)</.exec(body.body)[1]
}

module.exports = {
    bing,
    google,
    detect
}