'use strict';
const cust = './custom_nodemods_web/';
const config = require('./appconfig.json');
const cookieParser = require('cookie-parser');
const formidable = require('formidable');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const path = require('path');
const { setReqObj } = require(cust + 'nodeutils.js');
app.use(cookieParser());
app.use(express.static('public'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/mods', express.static(__dirname + '/public/js/modules'));
app.use('/css', express.static(__dirname + ''));
app.use('/res', express.static(__dirname + '/public/resources'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.disable('x-powered-by');
app.disable('x-host');
app.disable('x-forwarded-server');
app.disable('x-http-host-override');

const renderPage = (page, fileName) => {
  app.get(page, (req, res) => {
    res.sendFile(fileName, { root: path.join(__dirname, './views/') });
  });
};
renderPage('/', 'home.html');
const pageFiles = fs.readdirSync('./views');
pageFiles.forEach(page => {
  renderPage(`/` + page.split('.')[0], page);
});

app.post('/api/v1/hello', async (req, res) => {
  try {
    const [reqObj, resObj] = setReqObj(req);
    res.json(resObj);
  } catch (e) {
    console.log(e);
  }
});

app.post('/api/v1/fileupload', async (req, res) => {
  try {
    const [reqObj, resObj] = setReqObj(req);
    if (reqObj.headers.fileupload === true) {
      const numberOfFiles = reqObj.headers.files.count;
      const uploadFolder = path.join(__dirname, +'uploads');
      const form = new formidable.IncomingForm();
      const approvedTypes = ['png'];
      form.multiples = true;
      form.maxFileSize = 10 * 1024;
      form.uploadDir = uploadFolder;

      const formPart = async () => {
        let num = 0;
        await form.parse(req).on('part', (name, file) => {});
        const prom = new Promise((resolve, reject) => {
          let allowFiles = true;
          form.onPart = part => {
            if (
              part.mimetype !== undefined &&
              part.mimetype !== null &&
              approvedTypes.includes(part.mimetype.split('/')[1])
            ) {
              if (!fs.existsSync(uploadFolder)) {
                fs.mkdirSync(uploadFolder);
              }
              const writeStream = fs.createWriteStream(
                uploadFolder + part.originalFilename
              );
              part.pipe(writeStream);
            } else {
              allowFiles = false;
            }
            if (numberOfFiles === num) {
              resolve(allowFiles);
            }
          };
        });
        return prom;
      };

      const allowFiles = formPart();
      if (!allowFiles && fs.existsSync(uploadFolder)) {
        fs.rm(uploadFolder, { recursive: true, force: true }, e => {
          if (e) {
            console.log('FileRemove error', e);
          }
        });
      }
      resObj.response = 'File uploaded';
      reqObj.status = 1;
    } else {
      resObj.error = 'fileupload header not set to true';
      reqObj.status = 0;
    }

    res.json(resObj);
  } catch (e) {
    console.log(e);
  }
});

const certs = {
  key: fs.readFileSync('./certs/selfcerts/key.pem', 'utf8'),
  cert: fs.readFileSync('./certs/selfcerts/cert.pem', 'utf8'),
  passphrase: config.webserver.certpass,
};

const httpsServer = https.createServer(certs, app);
const server = httpsServer.listen('443', () => {
  console.log(`\nServer is ready on port 443.`);
});

const exitApp = async () => {
  server.unref();
  process.exit(0);
};

process.on('SIGTERM', () => {
  exitApp();
});

process.on('SIGINT', () => {
  exitApp();
});
