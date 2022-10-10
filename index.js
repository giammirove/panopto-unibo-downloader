#!/usr/bin/env node

import fetch from 'node-fetch';
import fs from 'fs';
import { convertM3u8ToMp4 } from './my_m3u8.js'

import { login, clearCookie } from "./login.js";
import { printInfo, printWarn, printError, sanitizeName, readInput } from "./utils.js";
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PANOPTO_LOGIN = "https://unibo.cloud.panopto.eu/Panopto/Pages/Auth/Login.aspx?instance=Virtuale&AllowBounce=true&ReturnUrl="
const DELIVERY_INFO = "https://unibo.cloud.panopto.eu/Panopto/Pages/Viewer/DeliveryInfo.aspx"

const DIR = __dirname + "/video"

async function getAuth() {
  try {
    let cookie = await login();
    let res = await fetch(PANOPTO_LOGIN, {
      "redirect": "manual"
    });
    let sso_location = res.headers.get("location");


    res = await fetch(sso_location, {
      "headers": {
        "cookie": cookie
      },
      "body": null,
      "method": "GET",
      "redirect": "manual"
    });
    let login_location = res.headers.get("location");
    res = await fetch(login_location, {
      "headers": {
        "cookie": cookie
      },
      "body": null,
      "method": "GET",
      "redirect": "manual"
    });

    let check_location = res.headers.get("location");
    let panopto_cookie = res.headers.get("set-cookie").replace(/,/gm, ";");

    res = await fetch(check_location, {
      "headers": {
        "cookie": panopto_cookie
      },
      "body": null,
      "method": "GET",
    });

    return panopto_cookie;

  } catch (e) {
    throw e;
  }
}


function getIdFromLink(link) {
  let id = link.substr(link.indexOf("id=") + 3);
  if (id.indexOf("&") >= 0)
    id = id.replace(id.substr(id.indexOf("&")), "");
  return id;
}

/*
    sample link : https://unibo.cloud.panopto.eu/Panopto/Pages/Viewer.aspx?id=85c994ec-a955-4868-878d-ae8a00e5e61d
*/
async function getStream(link) {
  try {
    let cookie = await getAuth();
    let id = getIdFromLink(link);

    printWarn("Cerco lo stream!");
    let res = await fetch(DELIVERY_INFO, {
      "headers": {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9,it;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "cookie": cookie,
      },
      "body": `deliveryId=${id}&invocationId=&isLiveNotes=false&refreshAuthCookie=true&isActiveBroadcast=false&isEditing=false&isKollectiveAgentInstalled=false&isEmbed=false&responseType=json`,
      "method": "POST"
    })
    let json = await res.json();
    let stream = json.Delivery.Streams[0].StreamUrl;
    printInfo("Stream trovato, inizio a scaricare ... attendere !");
    return stream;
  } catch (e) {
    clearCookie();
    printError("Sessione cookie probabilmente scaduta ... riprova!")
    return await getStream(link);
  }
}

async function menu() {
  try {
    let url = await readInput("Che video vuoi scaricare (url) ? ");
    let name = await readInput("Con che nome vuoi salvarlo ? ");

    let stream = await getStream(url);
    if (!fs.existsSync(DIR)) {
      fs.mkdirSync(DIR);
    }
    let outPath = `${DIR}/${name}.mp4`;
    await convertM3u8ToMp4(stream, outPath);

    printInfo(`Download completato in '${outPath}'`);
  } catch (e) {
    console.log(e);
    printError("Qualcosa e' andato storto ... riprovare!");
  }
}

menu();
