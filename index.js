const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const { GraphQLError } = require('graphql')

let authors = [
  {
    name: 'Robert Martin',
    id: 'afa51ab0-344d-11e9-a414-719c6709cf3e',
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: 'afa5b6f0-344d-11e9-a414-719c6709cf3e',
    born: 1963,
  },
  {
    name: 'Fyodor Dostoevsky',
    id: 'afa5b6f1-344d-11e9-a414-719c6709cf3e',
    born: 1821,
  },
  {
    name: 'Joshua Kerievsky', // birthyear not known
    id: 'afa5b6f2-344d-11e9-a414-719c6709cf3e',
  },
  {
    name: 'Sandi Metz', // birthyear not known
    id: 'afa5b6f3-344d-11e9-a414-719c6709cf3e',
  },
]

/*
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 */

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: 'afa5b6f4-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring'],
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: 'afa5b6f5-344d-11e9-a414-719c6709cf3e',
    genres: ['agile', 'patterns', 'design'],
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: 'afa5de00-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring'],
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: 'afa5de01-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring', 'patterns'],
  },
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: 'afa5de02-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring', 'design'],
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: 'afa5de03-344d-11e9-a414-719c6709cf3e',
    genres: ['classic', 'crime'],
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: 'afa5de04-344d-11e9-a414-719c6709cf3e',
    genres: ['classic', 'revolution'],
  },
]

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
    allBooks(author:String genre:String="refactoring"):[Book!]!
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

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      if (args.author) {
        let authorBooks = books.filter((book) => book.author === args.author)
        return authorBooks
      }
      if (args.genre) {
        let genreBooks = books.filter((book) => {
          const decision = book.genres.map((el) => {
            if (el === args.genre) return true
            return false
          })
          //console.log(decision)
          return decision.includes(true)
        })
        return genreBooks
      }
    },
    allAuthors: (root, args) => {
      const changedAuthors = authors.map((author) => {
        const changedBooks = books.filter((book) => book.author === author.name)
        return {
          ...author,
          bookCount: changedBooks.length,
        }
      })
      return changedAuthors
    },
  },
  Mutation: {
    addBook: (root, args) => {
      if (
        books.find(
          (book) => book.title.toLowerCase() === args.title.toLowerCase()
        )
      ) {
        throw new GraphQLError('Title must be unique', {
          extensions: {
            code: 'BAD_TITLE_INPUT',
            invalidArgs: args.title,
          },
        })
      }
      const book = { ...args, id: uuid() }
      books = books.concat(book)
      return book
    },
    addAuthor: (root, args) => {
      if (
        authors.find(
          (author) => author.name.toLowerCase() === args.name.toLowerCase()
        )
      ) {
        throw new GraphQLError('name must be unique', {
          extensions: {
            code: 'BAD_TITLE_INPUT',
            invalidArgs: args.name,
          },
        })
      }
      const author = { ...args, id: uuid() }
      authors = authors.concat(author)
      return author
    },
    editAuthor: (root, args) => {
      console.log(args)
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
