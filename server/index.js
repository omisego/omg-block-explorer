import next from 'next'

import express from 'express'
import bodyParser from 'body-parser'
import http from 'http'

import apiRoute from './routes/api'
import compression from 'compression'
import morgan from 'morgan'
const nextApp = next({ dev: process.env.NODE_ENV !== 'production' })
const LRUCache = require('lru-cache')

const expressApp = express()
const server = http.Server(expressApp)

const nextRequestHandler = nextApp.getRequestHandler()

const ssrCache = new LRUCache({
  max: 100,
  maxAge: 1000 * 10
})

const PORT = 3000

if (process.env.NODE_ENV === 'production') {
  expressApp.use(compression())
}

expressApp.use(morgan(process.env.NODE_ENV !== 'production' ? 'dev' : 'common'))

expressApp.use(bodyParser.json())

expressApp.use('/api', apiRoute)

expressApp.get('/transaction/:id', (req, res) => {
  const params = { id: req.params.id }
  return renderAndCache(req, res, '/transaction', params)
})
expressApp.get('/address/:id', (req, res) => {
  const params = { id: req.params.id }
  return renderAndCache(req, res, '/address', params)
})

expressApp.get('/', (req, res) => {
  return renderAndCache(req, res, '/')
})

nextApp.prepare().then(() => {
  expressApp.get('*', (req, res) => {
    return nextRequestHandler(req, res)
  })
})

expressApp.use(handleUnexpectedError)

server.listen(PORT, err => {
  if (err) throw err
  console.log(`Ready on http://localhost:${PORT}`)
})

function getCacheKey (req) {
  return `${req.url}`
}

async function renderAndCache (req, res, pagePath, queryParams) {
  const key = getCacheKey(req)

  if (ssrCache.has(key)) {
    res.setHeader('x-cache', 'HIT')
    console.log('cache hits!')
    return res.send(ssrCache.get(key))
  }

  try {
    const html = await nextApp.renderToHTML(req, res, pagePath, queryParams)

    if (res.statusCode !== 200) {
      return res.send(html)
    }
    ssrCache.set(key, html)
    res.setHeader('x-cache', 'MISS')
    res.send(html)
  } catch (err) {
    nextApp.renderError(err, req, res, pagePath, queryParams)
  }
}

function handleUnexpectedError (error, req, res, next) {
  res.status(500).send({ success: false, error: error.message })
}
