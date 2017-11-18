const fetch = require('node-fetch')
const util = require('util')
const parseXML = util.promisify(require('xml2js').parseString)
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList
} = require('graphql')

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: '...',

    fields: () => ({
        title: {
            type: GraphQLString,
            resolve: xml => {
                // console.log('books.title>>>', xml.title[0])
                return xml.title[0]
            }
        },
        isbn: {
            type: GraphQLString,
            resolve: xml => {
                const isbn = xml.isbn[0]
                if (typeof isbn !== 'string') {
                    return null;
                }
                return isbn;
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: '...',

    fields: () => ({
        name: {
            type: GraphQLString,
            resolve: xml => {
                console.log('name>>', xml.GoodreadsResponse.author[0].name[0]);
                return xml.GoodreadsResponse.author[0].name[0]
            }
        },
        books: {
            type: new GraphQLList(BookType),
            resolve: xml => {
                console.log('books>>', xml.GoodreadsResponse.author[0].books[0].book.length);
                return xml.GoodreadsResponse.author[0].books[0].book
            }
        }
    })
})

module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        description: '...',

        fields: () => ({
            author: {
                type: AuthorType,
                args: {
                    id: {
                        type: GraphQLInt,
                    },
                },
                resolve: (root, args) => fetch(
                    `https://www.goodreads.com/author/show.xml?id=${args.id}&key=rqOmNcJJHyGDtCwMwCnG4g`
                )
                .then(response => response.text())
                .then(parseXML)
            }
        })
    })
})