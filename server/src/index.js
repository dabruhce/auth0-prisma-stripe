const { GraphQLServer } = require('graphql-yoga')
const { Prisma, extractFragmentReplacements, forwardTo } = require('prisma-binding')
//const resolvers = require('./resolvers')
const { makeExecutableSchema } = require("graphql-tools")
const { importSchema } = require("graphql-import")

const { checkJwt } = require("./middleware/jwt")
const { getUser } = require("./middleware/getUser")
const validateAndParseIdToken = require("./helpers/validateAndParseIdToken")
const { directiveResolvers } = require("./directives")
const stripe = require('stripe')('sk_test_????')



async function createPrismaUser(ctx, idToken) {
  const user = await ctx.db.mutation.createUser({
    data: {
      identity: idToken.sub,
      auth0id: idToken.sub,
      name: idToken.name,
      email: idToken.email,
      avatar: idToken.picture
    }
  })
  return user
}



const ctxUser = ctx => ctx.request.user

const resolvers = {
  Query: {
    feed(parent, args, ctx, info) {
      return ctx.db.query.posts({ where: { isPublished: true } }, info)
    },
    drafts(parent, args, ctx, info) {
      return ctx.db.query.posts(
        { where: { isPublished: false, user: { id: ctxUser(ctx).id } } },
        info
      )
    },
    async post(parent, { id }, ctx, info) {
      return ctx.db.query.post({ where: { id } }, info)
    },
    me(parent, args, ctx, info) {
      return ctx.db.query.user({ where: { id: ctxUser(ctx).id } })
    },
    users: forwardTo('db')
  },
  User: {
    email: {
      fragment: `fragment UserId on User { id }`,
      resolve: (parent, args, ctx, info) => {
        return parent.email
      }
    }
  },
  Mutation: {
    async authenticate(parent, { idToken }, ctx, info) {
      let userToken = null
      try {
        userToken = await validateAndParseIdToken(idToken)
      } catch (err) {
        throw new Error(err.message)
      }

      const auth0id = userToken.sub
      //console.log(auth0id)
      let user = await ctx.db.query.user({ where: { auth0id } }, info)
      if (!user) {
        user = createPrismaUser(ctx, userToken)
      }
      return user
    },
    createStripeUser(parent, { email, firstName, lastName, stripeToken }, ctx, info)  {
      console.log(`Creating stripe customer for ${email}`)
      return new Promise((resolve, reject) => {
        const input = {
          email,
          description: firstName,
          source: stripeToken,
        }
        console.log('trying to create stripe customer', input)
        stripe.customers.create(
          input,
          (err, customer) => {
            if (err) {
              console.log(
                `Error creating stripe customer: ${JSON.stringify(err)}`,
              )
              reject(err)
            } else {
              console.log(`Successfully created stripe customer: ${customer.id}`)
          //    resolve(customer.id)
          // TODO
          // from here could toss the stripe ID back to the USER table w/e
            }
          },
        )
      })
    },
    createDraft(parent, { title, text }, ctx, info) {
      const { id } = ctxUser(ctx)
      return ctx.db.mutation.createPost(
        {
          data: { title, text, isPublished: false, user: { connect: { id } } }
        },
        info
      )
    },
    async deletePost(parent, { id }, ctx, info) {
      ctx.db.mutation.deletePost({ where: { id } }, info)
    },
    async publish(parent, { id, ...p }, ctx, info) {
      console.log('PUBLISH')
      return ctx.db.mutation.updatePost(
        {
          where: { id },
          data: { isPublished: true }
        },
        info
      )
    }
  }
}







const schema = makeExecutableSchema({
  typeDefs: importSchema('./src/schema.graphql'),
  resolvers,
  directiveResolvers
})

const db = new Prisma({
  fragmentReplacements: extractFragmentReplacements(resolvers),
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: 'http://localhost:4466/bea/dev',
  secret: process.env.PRISMA_SECRET,
  debug: true
})


const server = new GraphQLServer({
  schema,
//  resolvers,
  context: req => ({
    ...req,
    db
  })
})

const options = {
// playground: null, // Dissable playground endpoint,
}


server.express.get(server.options.endpoint + 'user', (req, res, done) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({
    message: 'Message from graphql-yoga (Express API)',
    obj: 'You can use graphql-yoga as a simple REST API'
  })
})


server.express.post(
  server.options.endpoint,
  checkJwt,
  (err, req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (err) return res.status(401).send(err.message)
    next()
  }
)

server.express.post(server.options.endpoint, (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      getUser(req, res, next, db)
    }
)

server.start(options, () => { console.log('Server is running on http://localhost:4000') })
