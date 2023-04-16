'use strict';
const https = require('https');

const getInput = async cliText => {
  const prom = new Promise((resolve, reject) => {
    let input = '';
    const stdout = process.stdout;
    const stdin = process.stdin;
    stdout.write(cliText);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf-8');

    const enter = () => {
      stdin.removeListener('data', pn);
      stdin.setRawMode(false);
      stdin.pause();
      resolve(input);
    };

    const ctrlc = () => {
      stdin.removeListener('data', pn);
      stdin.setRawMode(false);
      stdin.pause();
      reject('Ctrl C entered');
    };
    const newchar = c => {
      input += c;
    };
    const backSpace = () => {
      input = input.slice(0, input.length - 1);
    };

    const pn = data => {
      const c = data;
      switch (c) {
        case '\u0004': //ctrl-d
        case '\r':
        case '\n':
          return enter();
        case '\u0003': //ctrl-c
          return ctrlc();
        default:
          //backspace
          if (c.charCodeAt(0) === 8) {
            return backSpace();
          } else {
            return newchar(c);
          }
      }
    };

    stdin.on('data', pn);
  }).catch(e => {
    console.log('Input error:', e);
  });
  return prom;
};

const webRequest = async (options, requestObject = null) => {
  const prom = new Promise((resolve, reject) => {
    const req = https.request((options, res) => {
      const reqObj = {
        status: res.statusCode,
        headers: res.headers,
        data: '',
      };

      res.on('data', d => {
        const stream = Buffer.from(d);
        reqObj.data += stream.toString('utf8');
      });

      res.on('end', () => {
        resolve(reqObj);
      });
    });

    req.on('error', e => {
      reject(e);
    });
    if (requestObject !== null) {
      req.write(requestObject);
    }
    req.end();
  }).catch(e => {
    console.log('webRequest promise error:', e);
  });
  return prom;
};

const setReqObj = request => {
  return [
    {
      cookies: request?.cookies,
      headers: JSON.parse(request.headers.inputdata),
      body: request.body,
    },
    {},
  ];
};
module.exports.getInput = getInput;
module.exports.webRequest = webRequest;
module.exports.setReqObj = setReqObj;
