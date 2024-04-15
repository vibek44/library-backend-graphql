const User = require('./models/user')
const Author = require('./models/author')
const Book = require('./models/book')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const books = await Book.find({}).populate('author')
      if (args.author) {
        let authorBooks = books.filter(
          (book) => book.author.name.toLowerCase() === args.author.toLowerCase()
        )
        return authorBooks
      }
      if (args.genre) {
        let genreBooks = await Book.find({
          //genres: args.genre,
          genres: { $in: [args.genre] },
        }).populate('author')
        return genreBooks
      }
      return books
    },
    allAuthors: async (root, args) => await Author.find({}),
    me: async (root, args, context) => {
      if (context.currentUser) return context.currentUser
    },
  },
  Mutation: {
    createUser: async (root, args) => {
      let isUser = await User.find({ username: args.username })
      if (isUser && isUser.length > 0) {
        throw new GraphQLError('username must be unique', {
          extensions: {
            code: 'NAME_MUST_BE_UNIQUEE',
          },
        })
      }
      const user = new User({ ...args })
      return user.save().catch((error) => {
        throw new GraphQLError('user save failed', {
          extensions: {
            code: 'USER_SAVE_FAILED',
            error,
          },
        })
      })
    },
    login: async (root, args) => {
      const isUser = await User.find({ username: args.username })
      if (isUser.length === 0 || args.password !== 'User123') {
        throw new GraphQLError('wrong credential', {
          extensions: {
            code: 'WRONG_USER_CREDENTIALS',
          },
        })
      }
      const userToken = {
        username: isUser[0].username,
        id: isUser[0]._id,
      }
      return { value: jwt.sign(userToken, process.env.JWT_SEKRET) }
    },
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('permission not allowed', {
          extensions: {
            code: 'USER_NOT_ALLOWED',
          },
        })
      }
      const author = new Author({ name: args.author })
      const authors = await Author.find({})
      const authorResult = authors.find(
        (a) => a.name.toLowerCase() === args.author.toLowerCase()
      )
      if (args.title.length < 5 || args.author.length < 5) {
        throw new GraphQLError('title or author name is too short', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }
      if (!authorResult) {
        const savedAuthor = await author.save()
        const book = new Book({ ...args, author: savedAuthor._id })
        return book.save()
      }
      if (authorResult) {
        const book = new Book({ ...args, author: authorResult._id })
        return book.save()
      }
    },
    addAuthor: (root, args) => {
      const authors = Author.find({})
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
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('permission not allowed', {
          extensions: {
            code: 'USER_NOT_ALLOWED',
          },
        })
      }
      //const author = await Author.find({ name: args.name })
      const authors = await Author.find({})
      const author = authors.find(
        (author) => author.name.toLowerCase() === args.name.toLowerCase()
      )
      if (!author) return null
      let updatedAuthor = {
        _id: author._id,
        name: author.name,
        born: args.born,
      }
      updatedAuthor = await Author.findByIdAndUpdate(
        author._id,
        updatedAuthor,
        {
          new: true,
        }
      )
      console.log(updatedAuthor)

      return updatedAuthor
    },
  },
  Author: {
    bookCount: async (root) => {
      const books = await Book.find({ author: { $eq: root._id } })
      return books.length
    },
  },
}

module.exports = resolvers
