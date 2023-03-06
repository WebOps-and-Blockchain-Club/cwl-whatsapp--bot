import express from "express";
import WaterData from "../entities/waterData.js";
const router = express.Router();
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();
import AppDataSource from "../config";
router.post("/", async (req, res) => {
  let coord;
  const image = req.body.MediaUrl0;
  let [depth, location] = req.body.Body.split(";");
  res.writeHead(200, { "Content-Type": "text/xml" });
  const twiml = new MessagingResponse();
  if (!depth || depth.trim() === "") {
    twiml.message("Enter the depth");
    res.end(twiml.toString());
    return;
  }
  if (!location || location.trim() === "") {
    twiml.message("Enter the location");
    res.end(twiml.toString());
    return;
  }
  depth = parseInt(depth);
  await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${JSON.stringify(
      location
    )}.json?access_token=${process.env.MAPBOX_SECRET_KEY}`
  )
    .then((res: { json: () => any }) => res.json())
    .then((data: { features: { center: [any, any] }[] }) => {
      const [lng, lat] = data.features[0].center;
      coord = { lat, lng };
    })
    .catch((e: any) => console.log(e));
  const waterData = AppDataSource.getRepository(WaterData);
  let data = new WaterData();
  data.location = JSON.stringify(coord);
  data.depth = depth;
  data.image = image ? image : "";
  data.date = new Date();
  data.remarks = "";
  data.flagged = false;
  let dataInserted = await waterData.save(data);
  console.log(dataInserted);
  twiml.message("Message received");
  res.end(twiml.toString());
});

module.exports = router;
