const { ApolloServer } = require('@apollo/server')
const { WebSocketServer } =require('ws')
const { useServer }=require('graphql-ws/lib/use/ws')
const { expressMiddleware }=require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer }=require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema }=require('@graphql-tools/schema')
const express=require('express')
const cors=require('cors')
const http=require('http')
//const { startStandaloneServer } = require('@apollo/server/standalone')
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


const start=async()=>{
  const app=express()
  const httpServer=http.createServer(app)

  const wsServer=new WebSocketServer({
    server:httpServer,
    path:'/'
  })

  const schema=makeExecutableSchema({typeDefs,resolvers})
  const serverCleanup=useServer({schema},wsServer)
  const server=new ApolloServer({
  schema,
  plugins:[  //httpserver shutdown
    ApolloServerPluginDrainHttpServer({httpServer}),
    {  //wsServer shutdown
      async serverWillStart(){
        return{
          async drainServer(){
            serverCleanup.dispose()
          }
        }
      }
    }
  ]
  })

  await server.start()
  app.use('/',
    cors(),
    express.json(),
    expressMiddleware(server,{
      context:async({req})=>{
        const auth=req ? req.headers.authorization : null
        if (auth && auth.startsWith('Bearer')) {
          const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SEKRET)
          const currentUser = await User.findById(decodedToken.id)  
          return { currentUser }
        }
      }
    })
  )
  const PORT=4000
  httpServer.listen(PORT,()=>{
    console.log(`server runningg at http://localhost:${PORT}`);
    
  })
}


start()

/*
  const server = new ApolloServer({
  typeDefs,
  resolvers,
})


startStandaloneServer(server, {
  listen: { port: 4000 },
  //context is passed to all resolver of query and mutation as parameter
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    //console.log(auth);
    
    if (auth && auth.startsWith('Bearer')) {
      const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SEKRET)
      const currentUser = await User.findById(decodedToken.id)  
      return { currentUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

*/
