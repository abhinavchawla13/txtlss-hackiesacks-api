const axios = require("axios");
const config = require("../../config/config");
const _ = require("lodash");

exports.sendEvent = async (chatId, image_url_or_text, rich_message = true) => {
  try {
    console.log("starting send event livechat.js", rich_message);
    if (rich_message) {
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
            url: image_url_or_text,
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
            text: image_url_or_text,
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
      console.log("!!! Send event failed !!!");
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

// exports.uploadFile = async (fileName) => {
//   try {
//     console.log("upload fileName");
//     const resp = await axios({
//       method: "post",
//       auth: {
//         username: config.livechat_username,
//         password: config.livechat_password,
//       },
//       url: "https://api.livechatinc.com/v3.2/agent/action/send_event",
//       data: {
//         chat_id: chatId,
//         event: {
//           type: "file",
//           recipients: "all",
//           template_id: "cards",
//           url: image_url_or_text,
//           content_type: "image/png",
//         },
//       },
//     });
//     console.log("finishing send event livechat.js");
//     return resp.data;
//   } catch (err) {
//     console.log("Send event failed", err);
//   }
// };
