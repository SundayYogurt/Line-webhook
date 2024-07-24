const express = require("express");
const bodyParser = require("body-parser");
const { WebhookClient, Payload } = require("dialogflow-fulfillment");
const port = 5000;

// create server
const app = express();

// middleware
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("<h1>Welcome, this is a webhook for Line Chatbot.</h1>");
});

app.post("/webhook", (req, res) => {
  //create webhook
  const agent = new WebhookClient({
    request: req,
    response: res,
  });
  console.log("Dialogflow Request headers:" + JSON.stringify(req.headers));
  console.log("Dialogflow Request body: " + JSON.stringify(req.body));

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function bodyMessIndex(agent) {
    let weight = agent.parameters.weight;
    let height = agent.parameters.height;
    let bmi = weight / (height * height).toFixed(2);
    let result = "I can't understand";

    if (bmi < 18.5) {
      result = "คุณผอมเกินไป กินข้าวบ้างนะ";
    } else if (bmi >= 18.5 && bmi <= 22.9) {
      result = "คุณหุ่นดี";
    } else if (bmi >= 23 && bmi <= 24.9) {
      result = "คุณเริ่มจะท้วม";
    } else if (bmi >= 25.8 && bmi <= 29.9) {
      result = "คุณอ้วนหล่ะ";
    } else if (bmi > 30) {
      result = "คุณอ้วนเกินไป";
    }

    const flexMessage = {
      type: "flex",
      altText: "Flex Message",
      contents: {
        type: "bubble",
        hero: {
          type: "image",
          url: "https://api.parashospitals.com/uploads/2017/10/BMI.png",
          size: "full",
          aspectRatio: "20:13",
          aspectMode: "cover",
          action: {
            type: "uri",
            uri: "https://line.me/",
          },
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "BMI",
              weight: "bold",
              size: "xl",
              contents: [],
            },
            {
              type: "box",
              layout: "baseline",
              margin: "md",
              contents: [
                {
                  type: "text",
                  text: "height: " + height * 100 + " cm",
                },
              ],
            },
          ],
          justifyContent: "center",
          alignItems: "center",
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "button",
              style: "link",
              height: "sm",
              action: {
                type: "uri",
                label: "CALL",
                uri: "https://line.me/",
              },
            },
            {
              type: "button",
              style: "link",
              height: "sm",
              action: {
                type: "uri",
                label: "WEBSITE",
                uri: "https://line.me/",
              },
            },
            {
              type: "box",
              layout: "vertical",
              contents: [],
              margin: "sm",
            },
          ],
        },
      },
    };

    let payload = new Payload("LINE", flexMessage, { sendAsMessage: true });
    agent.add(payload);

    // agent.add(result);
  }

  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Default Fallback Intent", fallback);
  intentMap.set("BMI - custom - yes", bodyMessIndex);
  agent.handleRequest(intentMap);
});

app.listen(port, () =>
  console.log(`Server is running at http://localhost:${port}`)
);
