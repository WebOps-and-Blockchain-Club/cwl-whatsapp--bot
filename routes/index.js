"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const waterData_js_1 = __importDefault(require("../entities/waterData.js"));
const router = express_1.default.Router();
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();
const config_1 = __importDefault(require("../config"));
router.post("/message", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let coord;
    const image = req.body.MediaUrl0;
    let [depth, location] = req.body.Body.split(";");
    depth = parseInt(depth);
    yield fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${JSON.stringify(location)}.json?access_token=${process.env.MAPBOX_SECRET_KEY}`)
        .then((res) => res.json())
        .then((data) => {
        const [lng, lat] = data.features[0].center;
        coord = { lat, lng };
    })
        .catch((e) => console.log(e));
    const twiml = new MessagingResponse();
    twiml.message("Message received");
    res.writeHead(200, { "Content-Type": "text/xml" });
    const waterData = config_1.default.getRepository(waterData_js_1.default);
    let data = new waterData_js_1.default();
    data.location = JSON.stringify(coord);
    data.depth = depth;
    data.image = image;
    data.date = new Date();
    console.log(data);
    let dataInserted = yield waterData.save(data);
    console.log(dataInserted);
    res.end(twiml.toString());
}));
module.exports = router;
