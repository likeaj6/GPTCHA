import axios from 'axios'

let apiEndpoint = 'https://gptcha-backend.onrender.com'

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