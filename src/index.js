import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import redis from 'redis'
import session from 'express-session'
import typeDefs from './typeDefs'
import resolvers from './resolvers'
import mongoose from 'mongoose'
import connectRedis from 'connect-redis'
import
{ APP_PORT, IN_PROD, NODE_ENV, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, SESS_NAME, SESS_SECRET, SESS_LIFETIME, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD }
  from './config'
import schemaDirectives from './directives'


mongoose.connect(`mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0-d5rbu.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
  {
    autoIndex: false,
    useUnifiedTopology: true
  })

const app = express()

app.disable('x-powered-by')

const RedisStore = connectRedis(session)

const redisClient = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD
})

redisClient.unref()
redisClient.on('error', console.log)
const store = new RedisStore({ client: redisClient })

app.use(session({
  store,
  name: SESS_NAME,
  secret: SESS_SECRET,
  resave: true,
  rolling: true,
  saveUninitialized: false,
  cookie: {
    maxAge: parseInt(SESS_LIFETIME),
    sameSite: true,
    secure: IN_PROD
  }
}))

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives,
  playground: IN_PROD ? false : {
    settings: {
      'request.credentials': 'include'
    }
  },
  context: ({ req, res }) => ({ req, res })
})

server.applyMiddleware({ app, cors: false })

app.listen({ port: APP_PORT }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)
