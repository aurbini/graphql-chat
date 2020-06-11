import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import typeDefs from './typeDefs'
import resolvers from './resolvers'
import mongoose from 'mongoose'
import
{ APP_PORT, IN_PROD, NODE_ENV, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME }
  from './config'

mongoose.connect(`mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0-d5rbu.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
  { autoIndex: false,
    useUnifiedTopology: true })

const app = express()

app.disable('x-powered-by')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: !IN_PROD
})

server.applyMiddleware({ app })

app.listen({ port: APP_PORT }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)
