import express from 'express'
import WaterData from '../entities/waterData.js'
const router = express.Router()
const MessagingResponse = require('twilio').twiml.MessagingResponse
const fetch = require('node-fetch')
const dotenv = require('dotenv')
dotenv.config()
import AppDataSource from '../config'
import createMessage from '../utils/sendMessages.js'

router.post('/message', async (req, res) => {
  try {
    console.log(req.session.states)
    let coord
    const image = req.body.MediaUrl0
    const receivedMessage = req.body.Body
    req.session.states = req.session.states || {
      depth: undefined,
      location: undefined,
      image: undefined,
      step: 0,
    }
    const twiml = new MessagingResponse()
    res.writeHead(200, { 'Content-Type': 'text/xml' })
    switch (req.session.states.step) {
      case 0:
        if (receivedMessage && /^\d+$/.test(receivedMessage)) {
          req.session.states = {
            depth: parseInt(receivedMessage),
            step: 1,
            location: '',
            image: '',
          }
          return res.status(200).end(createMessage('Enter the location', twiml))
        }
        throw Error('FORMAT')
      case 1:
        if (receivedMessage) {
          req.session.states = {
            depth: req.session.states.depth,
            step: 2,
            location: receivedMessage,
            image: '',
          }
          return res.status(200).end(createMessage('Send an image (optional)', twiml))
        }
        throw Error('FORMAT')
      case 2:
        req.session.states.image = image || ''
      default:
        req.session.states.step = 0
    }

    await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${JSON.stringify(
        req.session.states.location,
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
    data.depth = req.session.states.depth || 0
    data.image = req.session.states.image || ''
    data.date = new Date()
    data.remarks = ''
    data.flagged = false
    let dataInserted = await waterData.save(data)
    console.log(dataInserted)
    req.session.states = undefined
    return res
      .status(200)
      .end(
        createMessage(
          'Thank you for your contribution. Your data has been successfully recorded.',
          twiml,
        ),
      )
  } catch (error: any) {
    console.error(error)
    const twiml = new MessagingResponse()
    if (error.message === 'FORMAT') {
      console.log('Reaching')
      const responseMessage =
        req.session.states?.step === 0 ? 'Enter a valid depth' : 'Enter a valid location'
      return res.status(400).end(createMessage(responseMessage, twiml))
    }
    return res.status(500).end(createMessage('An error occurred', twiml))
  }
})

router.get('/message', async (req, res) => {
  console.log('Reaching')
  res.status(200).send('Something')
})

module.exports = router
