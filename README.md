# txtlss hackiesacks API

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) (atleast v12.13.0, npm v6.12.0) installed.

```sh
git clone https://github.com/abhinavchawla13/txtlss-hackiesacks.git
cd txtlss-hackiesacks
npm install
npm run start
```

## Environment Variables

Add a `.env` file in the root folder (you should setup your LiveChat, IBM Watson Credentials):

```
NODE_ENV=development
PORT=8000
LIVECHAT_USERNAME=
LIVECHAT_PASSWORD=
LIVECHAT_WEBHOOK_KEY=
WATSON_APIKEY=
```

Add a `ibm-credentials.env` file in the root folder for automatic watson authentication.

## Deployment

Heroku pipeline is set to auto deploy `master` branch currently.
