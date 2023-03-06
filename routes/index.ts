import express from 'express'
import WaterData from '../entities/waterData.js'
const router = express.Router()
const MessagingResponse = require('twilio').twiml.MessagingResponse
const fetch = require('node-fetch')
const dotenv = require('dotenv')
dotenv.config()
import AppDataSource from '../config'
import { Sender } from '../utils/types.js'

router.post('/message', async (req, res) => {
  try {
    console.log(req.session.states)
    let coord
    const image = req.body.MediaUrl0
    const receivedMessage = req.body.Body
    let [depth, location] = receivedMessage.split(';')
    req.session.states = req.session.states || {}
    req.session.states.messages = req.session.states.messages
      ? [
          ...req.session.states.messages,
          {
            sender: Sender['USER'],
            text: receivedMessage,
          },
        ]
      : [
          {
            sender: Sender['USER'],
            text: receivedMessage,
          },
        ]
    res.writeHead(200, { 'Content-Type': 'text/xml' })
    const twiml = new MessagingResponse()
    if (!depth || depth.trim() === '') {
      throw Error('FORMAT')
    }
    if (!location || location.trim() === '') {
      throw Error('FORMAT')
    }
    depth = parseInt(depth)
    await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${JSON.stringify(
        location,
      )}.json?access_token=${process.env.MAPBOX_SECRET_KEY}`,
    )
      .then((res: { json: () => any }) => res.json())
      .then((data: { features: { center: [any, any] }[] }) => {
        const [lng, lat] = data.features[0].center
        coord = { lat, lng }
      })
      .catch((e: any) => console.log(e))
    const waterData = AppDataSource.getRepository(WaterData)
    let data = new WaterData()
    data.location = JSON.stringify(coord)
    data.depth = depth
    data.image = image ? image : ''
    data.date = new Date()
    data.remarks = ''
    data.flagged = false
    let dataInserted = await waterData.save(data)
    console.log(dataInserted)
    const responseMessage = 'Message received'
    twiml.message(responseMessage)
    req.session.states.messages = [
      ...req.session.states.messages,
      {
        sender: Sender['BOT'],
        text: responseMessage,
      },
    ]
    res.end(twiml.toString())
  } catch (error: any) {
    console.error(error)
    const twiml = new MessagingResponse()
    if (error.message === 'FORMAT') {
      twiml.message('Use the format DEPTH; LOCATION')
      twiml.message('Example:\n44; IIT Madras')
      req.session.states.messages = [
        ...req.session.states.messages,
        {
          sender: Sender['BOT'],
          text: 'Use the format DEPTH; LOCATION',
        },
        {
          sender: Sender['BOT'],
          text: 'Example:\n44; IIT Madras',
        },
      ]
      return res.status(400).end(twiml.toString())
    }
    twiml.message('An error occurred')
    req.session.states.messages = [
      ...req.session.states.messages,
      {
        sender: Sender['BOT'],
        text: 'An error occurred',
      },
    ]
    res.status(500).end(twiml.toString())
  }
})

module.exports = router
