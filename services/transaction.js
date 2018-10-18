import axios from 'axios'
import CONFIG from '../config'

const instance = axios.create({
  baseURL: CONFIG.API_URL,
  timeout: 1000
})

export function getTransactionById (transactionId) {
  return instance.get(`/transaction/${transactionId}`)
}
