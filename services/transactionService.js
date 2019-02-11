import { instance, handleError, handleResponse } from './apiClientService'
import queryString from 'query-string'
import CONSTANT from '../constant'

function formatTransaction (tx) {
  if (typeof tx === 'object') {
    return {
      txid: tx.txhash,
      inputs: tx.inputs,
      outputs: tx.outputs,
      txblknum: tx.block.blknum,
      eth_height: tx.block.eth_height,
      timestamp: Math.round(tx.block.timestamp * 1000)
    }
  }
  return tx
}

function formatAmount (amount) {
  return {
    value: amount.value,
    token_symbol: CONSTANT.contractTokenAddressMap[amount.currency]
  }
}

function formatTransactionAll (tx) {
  if (typeof tx === 'object') {
    const amounts = tx.results.map(amount => formatAmount(amount))
    return {
      txid: tx.txhash,
      txblknum: tx.block.blknum,
      timestamp: Math.round(tx.block.timestamp * 1000),
      amounts: amounts
    }
  }
  return tx
}

export function getTransactionById (transactionId) {
  return instance
    .get(`/transaction/${transactionId}`)
    .then(handleResponse)
    .then(response => ({ ...response, data: formatTransaction(response.data) }))
    .catch(handleError)
}

export function getTransactions ({ address, limit = 50 } = {}) {
  let query = { limit }
  if (address) {
    query = Object.assign(query, { address })
  }
  const qs = queryString.stringify(query)
  return instance
    .get(`/transactions${qs ? `?${qs}` : ''}`)
    .then(handleResponse)
    .then(response => ({ ...response, data: response.data.map(tx => formatTransactionAll(tx)) }))
    .catch(handleError)
}
