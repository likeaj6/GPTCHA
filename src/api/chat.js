import axios from 'axios'

let isProd = true || process.env.NODE_ENV === "production"
let apiEndpoint = isProd ? 'https://gptcha-backend.onrender.com':'http://localhost:3000'
// let apiEndpoint = 'https://gptcha-backend.onrender.com'
let UNREAL_SPEECH_API_KEY = process.env.REACT_APP_UNREAL_SPEECH_API_KEY
let ELEVEN_LABS_API_KEY = process.env.REACT_APP_ELEVEN_LABS_API_KEY

export const generateRoboMessage = (messages=[], fraudTopic="bank fraud") => {
  // console.log("isOnboarding", isOnboarding)
  return axios.post(`${apiEndpoint}/robocaller`, { messages, fraudTopic })
}

export const generateGuardianMessage = (messages=[], fraudTopic='bank fraud') => {
  // console.log("isOnboarding", isOnboarding)
  return axios.post(`${apiEndpoint}/guardian`, { messages, fraudTopic })
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
  // console.log("ELEVEN_LABS_API_KEY", ELEVEN_LABS_API_KEY, process.env)
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