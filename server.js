const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
// const axios = require("axios");
const request = require("request-promise");

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
app.use(bodyParser.json({ limit: "20mb", extended: true }));

//Store text from file
let tweets;

app.post("/upload", (req, res) => {
  //req.body.fileContent.part0 contains an object with keys 0,1,2 etc whose values are tweet-objects
  // console.log("filecontent", req.body.fileContent);
  tweets = req.body.fileContent.part0;
  if (tweets) {
    return res.send({ success: true });
  } else {
    return res.send({ success: false });
  }
});
app.get("/alltweets", (req, res) => {
  res.send({ success: true, tweets: tweets });
});

app.get("/findTweetById", (req, res) => {
  //axios request to twitter api
  request({
    uri: "https://api.twitter.com/1.1/statuses/show.json?id=210462857140252672",
    headers: {
      Authorization: process.env.BEARER_TOKEN
    }
  })
    .then(res => {
      console.log(res);
      return res.json();
    })
    .catch(err => console.log("ERR:", err));
});

app.post("/search", (req, res) => {
  //this should always search for tweets from the logged in user
  //search in uploaded file
  let matches = [];
  for (let i = 0; i < tweets.length; i++) {
    if (tweets[i]["full_text"]) {
      if (tweets[i]["full_text"].includes(req.body.keyword)) {
        matches.push(tweets[i]);
      }
    } else if (tweets[i]["text"]) {
      if (tweets[i]["text"].includes(req.body.keyword)) {
        matches.push(tweets[i]);
      }
    }
  }
  res.send({ success: "true", matches: matches });
});

app.post("/deleteTweets", (req, res) => {
  let deleteList = req.body.deleteList;
  for (let i = 0; i < deleteList.length; i++) {
    let id = deleteList[i];
    //need to add user context authorization to delete request
    request({
      uri: `https://api.twitter.com/1.1/statuses/destroy/:${id}.json`,
      method: "POST",
      headers: {
        Authorization: process.env.BEARER_TOKEN
      }
    }).then(res => console.log(res));
  }
});

//set express server to listen on port 4000
app.listen(4000, () => {
  console.log("Server listening on port 4000!");
});
