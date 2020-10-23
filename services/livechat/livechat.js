const axios = require("axios");
const _ = require("lodash");
const FormData = require("form-data");
const fs = require("fs");
const config = require("../../config/config");
var path = require("path");

exports.sendEvent = async (
  chatId,
  image_or_text,
  rich_message = true,
  image_type = ""
) => {
  try {
    console.log("starting send event livechat.js", rich_message);
    if (rich_message) {
      const uploadResp = await uploadFile(image_or_text, image_type, config);

      const url = uploadResp.url;

      const resp = await axios({
        method: "post",
        auth: {
          username: config.livechat_username,
          password: config.livechat_password,
        },
        url: "https://api.livechatinc.com/v3.2/agent/action/send_event",
        data: {
          chat_id: chatId,
          event: {
            type: "file",
            recipients: "all",
            template_id: "cards",
            url: url,
            content_type: "image/png",
          },
        },
      });
    } else {
      const resp = await axios({
        method: "post",
        auth: {
          username: config.livechat_username,
          password: config.livechat_password,
        },
        url: "https://api.livechatinc.com/v3.2/agent/action/send_event",
        data: {
          chat_id: chatId,
          event: {
            type: "message",
            recipients: "all",
            text: image_or_text,
          },
        },
      });
    }

    console.log("finishing send event livechat.js");
    return resp.data;
  } catch (err) {
    if (_.get(err, "response.data.error.message")) {
      console.log(
        "!!! Send event failed !!!",
        _.get(err, "response.data.error.message")
      );
    } else {
      console.log("!!! Send event failed !!! - no idea");
    }
  }
};

exports.deactivateChat = async (chatId) => {
  try {
    const resp = await axios({
      method: "post",
      auth: {
        username: config.livechat_username,
        password: config.livechat_password,
      },
      url: "https://api.livechatinc.com/v3.2/agent/action/deactivate_chat",
      data: {
        chat_id: chatId,
      },
    });
    return resp.data;
  } catch (error) {
    console.log("Deactivate chat failed", error);
  }
};

exports.activateChat = async (chatId) => {
  return axios({
    method: "post",
    auth: {
      username: config.livechat_username,
      password: config.livechat_password,
    },
    url: "https://api.livechatinc.com/v3.2/agent/action/activate_chat",
    data: {
      chat: {
        id: chatId,
        continuous: true,
      },
    },
  });
};

async function uploadFile(image_or_text, image_type, config) {
  try {
    let imageLoc = `../../extras/assets/${image_or_text}`;
    if (image_type) {
      imageLoc += `_${image_type}`;
    }
    imageLoc += ".png";
    console.log(imageLoc);
    const imagePath = path.resolve(__dirname, imageLoc);
    console.log(imagePath);
    const token = Buffer.from(
      `${config.livechat_username}:${config.livechat_password}`,
      "utf8"
    ).toString("base64");
    var data = new FormData();
    data.append("file", fs.createReadStream(imagePath));

    var config = {
      method: "post",
      url: "https://api.livechatinc.com/v3.2/agent/action/upload_file",
      headers: {
        Authorization: `Basic ${token}`,
        ...data.getHeaders(),
      },
      data: data,
    };

    const resp = await axios(config);
    console.log(resp.data);
    return resp.data;
  } catch (err) {
    console.log("Send event failed", err);
  }
}
