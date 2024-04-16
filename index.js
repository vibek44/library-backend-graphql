const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const mongoose = require('mongoose')
require('dotenv').config()
const resolvers = require('./resolver')
const typeDefs = require('./typedef')
const jwt = require('jsonwebtoken')
const User = require('./models/user')

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('connected'))
  .catch(() => console.log('error mongodb'))

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  //context is passed to all resolver of query and mutation as parameter
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null

    if (auth && auth.startsWith('Bearer')) {
      const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SEKRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
