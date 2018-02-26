/**
 * Created by junrui on 2018/2/26.
 */

let request = require('request');
const dingTalkUrl = 'https://oapi.dingtalk.com/robot/send?access_token=8b18c7270611dfff4dbb8ebd954bbb48066923b0e1b7d9d8c68c90ac6780acfb';

/**
 *
 * @param msg
 */
function text(msg) {
    const requestData = {
        "msgtype": "text",
        "text": {
            "content": msg
        }
    };
    sendReq(JSON.stringify(requestData), cb);
}

function markdown(msg) {
    const requestData = {
        "msgtype": "markdown",
        "markdown": {
            "titel": "webhook响应结果",
            "text": msg
        }
    };
    let request = require('request');
    sendReq(JSON.stringify(requestData), cb);
}

function sendReq(body, func) {
    request({
        url: dingTalkUrl,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: body
    }, (func ||cb));
}

function cb(error, response, body) {
    if (!error && response.statusCode == 200) {
        //
        console.log(response.body);
    }
}

exports.text = text;
exports.markdown = markdown;