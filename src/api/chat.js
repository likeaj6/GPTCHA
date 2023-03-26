import axios from 'axios'

let apiEndpoint = 'https://5023-12-94-170-82.ngrok.io'
// let apiEndpoint = 'https://gptcha-backend.onrender.com'
let UNREAL_SPEECH_API_KEY = process.env.UNREAL_SPEECH_API_KEY

export const generateRoboMessage = (messages=[]) => {
  // console.log("isOnboarding", isOnboarding)
  return axios.post(`${apiEndpoint}/robocaller`, { messages })
}

export const generateGuardianMessage = (messages=[]) => {
  // console.log("isOnboarding", isOnboarding)
  return axios.post(`${apiEndpoint}/guardian`, { messages })
}

export const generateSpeechFromText = (text) => {
  let body = {
    'Text': `${text}`,
    'VoiceId': 'male-0',
    'AudioFormat': 'mp3',
    'BitRate': '192k',
  }
  let devUrl = process.env.NODE_ENV === 'development' ? 'https://cors-anywhere.herokuapp.com/' : ''
  return axios.post(
  `${devUrl}https://api.v5.unrealspeech.com/speech`,
  body,
  {
    headers:{
      'Authorization' : `Bearer ${UNREAL_SPEECH_API_KEY}`
    },
     responseType: 'blob'
  })
}

export default {
  generateRoboMessage,
  generateGuardianMessage,
  generateSpeechFromText
}