import axios from 'axios'

let apiEndpoint = 'https://5023-12-94-170-82.ngrok.io'

export const generateRoboMessage = (messages=[]) => {
  // console.log("isOnboarding", isOnboarding)
  return axios.post(`${apiEndpoint}/robocaller`, { messages })
}

export const generateGuardianMessage = (messages=[]) => {
  // console.log("isOnboarding", isOnboarding)
  return axios.post(`${apiEndpoint}/guardian`, { messages })
}

export default {
  generateRoboMessage,
  generateGuardianMessage
}