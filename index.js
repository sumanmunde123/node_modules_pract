const express = require("express");

const app = express();

const redis = require("ioredis");

const client = redis.createClient({
  port: process.env.REDIS_PORT || 6480,
  host: process.env.REDIS_HOST || "localhost",
});

client.on("connect", function () {
  console.log("connected");
});

app.get("/", async (req, res) => {
  try {
    res.send("Hello World!");


  } catch (error) {
    console.log(error);
  }
});

app.post("/", async (req, res) => {


  async function isOverLimit(ip) {
    let res;
    try {
      res = await client.incr(ip);
      console.log(`${ip} has value: ${res}`);

      if (res > 10) {
        console.log("Limit exceeded");
        return true;
      }
      client.expire(ip, 60);
    } catch (error) {
      console.log("isOverLimit: could not increment key");
      throw error;
    }
  }
  // check rate limit
  let overLimit = await isOverLimit(req.ip);


  if (overLimit) {
    res.status(429).send(" many requests - try again ");
    return;
  }
  // allow access to resources
  res.send("Accessed the precious resources!");
});

app.listen(3245, async (req, res) => {
  try {
    console.log("Listening on port 3000");
  } catch (error) {}
});

   