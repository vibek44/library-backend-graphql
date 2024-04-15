const typeDefs = `
type User{
  username:String!
  favoriteGenre:String!
  id:ID!
}

type Token{
  value:String!
}

type Author{
  name:String!
  id:ID!
  born:Int
  bookCount:Int!
  
}

type Book{
  id:ID!
  title:String!
  author:Author!
  published:Int!
  genres:[String!]!
}

type Query {
    me:User
    bookCount: Int
    authorCount:Int
    allBooks(author:String genre:String):[Book!]! 
    allAuthors:[Author!]!
  }

type Mutation{
    createUser(
      username:String!
      favoriteGenre:String!
      ):User
    login(
      username:String!
      password:String!
    ):Token
    addBook(
      title:String!
      author:String!
      published:Int!
      genres:[String!]!
      ):Book!
    addAuthor(
      name:String!
      born:Int
    ):Author
    editAuthor(
      name:String!
      born:Int!
    ):Author
   
  }
`

module.exports = typeDefs
