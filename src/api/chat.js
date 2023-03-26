import axios from 'axios'

let isProd = true || process.env.NODE_ENV === "production"
let apiEndpoint = isProd ? 'https://gptcha-backend.onrender.com':'https://5023-12-94-170-82.ngrok.io'
// let apiEndpoint = 'https://gptcha-backend.onrender.com'
let UNREAL_SPEECH_API_KEY = process.env.UNREAL_SPEECH_API_KEY ?? "S4qWKbu2cjCt7NgOjPqCCuP4KNLEoWPFWFKrMGBKR_EigqabVkKPUw"
let ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY ?? "d5cb565f14b05ee73dca28d63ab2ddc3"

export const generateRoboMessage = (messages=[]) => {
  // console.log("isOnboarding", isOnboarding)
  return axios.post(`${apiEndpoint}/robocaller`, { messages })
}

export const generateGuardianMessage = (messages=[]) => {
  // console.log("isOnboarding", isOnboarding)
  return axios.post(`${apiEndpoint}/guardian`, { messages })
}

export const _unrealSpeechGenerateSpeechFromText = (text, voiceId='male-0') => {
  let body = {
    'Text': `${text}`,
    'VoiceId': voiceId,
    'AudioFormat': 'mp3',
    'BitRate': '192k',
  }
  let devUrl = process.env.NODE_ENV === 'development' ? 'https://cors-anywhere.herokuapp.com/' : ''
  console.log("UNREAL_SPEECH_API_KEY", UNREAL_SPEECH_API_KEY)
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

export const generateSpeechFromText = (text, voiceId='TxGEqnHWrfWFTfGW9XjX') => {
  let body = {
    'text': `${text}`,
    'voice_id': voiceId,
    "voice_settings": {
      "stability": 0.75,
      "similarity_boost": 0.75
    }
  }
  let devUrl = process.env.NODE_ENV === 'development' ? 'https://cors-anywhere.herokuapp.com/' : ''
  console.log("ELEVEN_LABS_API_KEY", ELEVEN_LABS_API_KEY)
  return axios.post(
  `${devUrl}https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  body,
  {
    headers:{
      // 'Authorization' : `Bearer ${ELEVEN_LABS_API_KEY}`,
      'xi-api-key' : `${ELEVEN_LABS_API_KEY}`
    },
     responseType: 'blob'
  })
}

export default {
  generateRoboMessage,
  generateGuardianMessage,
  generateSpeechFromText
}