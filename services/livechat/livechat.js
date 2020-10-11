const axios = require("axios");
const config = require("../../config/config");

exports.sendEvent = async (chatId, image_url, rich_message = true) => {
  try {
    console.log("starting send event livechat.js");
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
          url: image_url,
          content_type: "image/png",
        },
      },
    });
    console.log("finishing send event livechat.js");
    return resp.data;
  } catch (err) {
    console.log("Send event failed", err);
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
    console.log("Deactivate chat failed", err);
  }
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
//           url: image_url,
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
