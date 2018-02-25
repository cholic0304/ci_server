const http = require('http');
const port = 8081;
const workspace = '~/workspace/';

http.createServer(requestHandler).listen(port);

//
console.log(`Server running at http://127.0.0.1:${port}`);

/**
 *
 * @param request
 * @param response
 */
function requestHandler(request, response) {
    const { method, url, headers, } = request;
    console.log(`new request to ${url}`);

    switch (method) {
        case 'GET': {
            returnResponse(response, url);
            break;
        }
        case 'POST': {
            getPostData(request).then((data) => {
                returnResponse(response, `webhook processing accepted.`);
                // todo 处理webhook
                try {
                    const hookData = JSON.parse(data);
                    let result = webHookHandler(hookData);
                    result.then((result) => {
                        //
                        console.log('success: processer finished!')
                    });
                } catch (err) {
                    //
                    console.log(err);
                }
            })
            break;
        }
        default: {
            // todo
        }
    }
}

/**
 *
 * @param request
 * @returns {Promise}
 */
function getPostData(request) {
    return new Promise(
        (resolve) => {
            // 接收 POST 数据。如果请求方法不是 POST，那么这个变量最终是空字符串
            let POST = '';
            request.on('data', function (chunk) {
                POST += chunk;
            });
            request.on('end', function () {
                resolve(POST);
            });
        })
}

/**
 *
 * @param response
 * @param data
 */
function returnResponse(response, data) {
    // 发送 HTTP 头部
    // HTTP 状态值: 200 : OK
    // 内容类型: text/plain
    response.writeHead(200, { 'Content-Type': 'text/plain' });

    // 发送响应数据
    response.end(data);

}

/**
 *
 * @param data
 * @returns {*}
 */
function webHookHandler(data) {
    const { action, commits, head_commit, repository, pusher, sender } = data;
    //
    if (repository) {
        const name = repository.name;
        // 切换到对应目录，更新代码
        return cmdProcesser([
            `cd ${workspace + name}`,
            'git pull origin master',
        ]);
    } else {
        return rejectedPromise('webhook data error!');
    }
}

/**
 *
 * @param cmd_strs
 * @returns {Promise.<number>}
 */
async function cmdProcesser(cmd_strs) {
    let exec = require('child_process').exec;
    let result = null;
    try {
        if (Array.isArray(cmd_strs)) {
            // let i = 0;
            // for (i; i < cmd_strs.length; i++) {
            //     result = await CMD(cmd_strs[i]).catch((err) => {
            //         throw err;
            //     });
            // }

            return await CMD(cmd_strs.join(' && ')).catch((err) => {
                throw err;
            });
        } else if (typeof cmd_strs === 'string') {
            return await CMD(cmd_strs).catch((err) => {
                throw err;
            });
        }
        throw new Error('cmdProcesser input error!');
    } catch (err) {
        console.log(err);
        return rejectedPromise(err);
    }

    /**
     *
     * @param cmd_str
     * @returns {Promise}
     * @constructor
     */
    function CMD(cmd_str) {
        return new Promise((resolve, reject) => {
            exec(cmd_str, function (err, stdout, stderr) {
                if (err) {
                    reject(err);
                } else {
                    console.log(`${cmd_str}: ${stdout}`);
                    resolve(stdout);
                }
            });
        })
    }
}

function rejectedPromise(err) {
    return new Promise((resolve, reject) => {
        reject(err);
    });
}