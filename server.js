// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // npm install node-fetch@2

const allowedOrigins = [
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "http://0.0.0.0:8000",
  "http://localhost:3000",
];

const app = express();
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Origin:", origin);
      console.log("Allowed Origins:", allowedOrigins);
      // allow requests with no origin (like curl/postman) or whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);
app.use(express.json());

app.post("/connect-pipecat", async (req, res) => {
  try {
    const { config } = req.body;

    console.log(
      `Fetching https://api.pipecat.daily.co/v1/public/${process.env.AGENT_NAME}/start`,
    );
    console.log("config", config);

    const response = await fetch(
      `https://api.pipecat.daily.co/v1/public/${process.env.AGENT_NAME}/start`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PIPECAT_CLOUD_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Create Daily room
          createDailyRoom: true,
          // Optionally set Daily room properties
          dailyRoomProperties: {
            start_video_off: true,
            geo: "ap-south-1",
            exp: +new Date() / 1000 + 610, // time in minutes now + 10 minutes + 10 seconds
            max_participants: 2,
            eject_at_room_exp: true,
          },
          // Optionally pass custom data to the bot
          body: { config },
          // body: JSON.stringify(updatedBotConfig),
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Transform to what your RTVI client expects
    res.json({
      room_url: data.dailyRoom,
      token: data.dailyToken,
    });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Failed to start agent" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});
