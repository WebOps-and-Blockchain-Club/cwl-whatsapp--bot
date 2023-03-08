const createMessage = (message: string, twiml: any) => {
  twiml.message(message)
  return twiml.toString()
}

export default createMessage
