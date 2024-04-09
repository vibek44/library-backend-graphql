const typeDefs = `
type Book{
  title:String!
  author:String!
  published:Int!
  genres:[String!]!
}

type Author{
  name:String!
  id:ID!
  born:Int
  bookCount:Int!
  
}
  type Query {
    bookCount: Int
    authorCount:Int
    allBooks(author:String genre:String):[Book!]! 
    allAuthors:[Author!]!
  }

  type Mutation{
    addBook(
      title:String!
      author:String!
      published:Int!
      genres:[String!]!
      ):Book
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

module.exports=typeDefs