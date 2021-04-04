const { ApolloServer } = require('apollo-server');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// let links = [
//   {
//     id: 'link-0',
//     description: 'Fullstack tutorial for GraphQL',
//     url: 'www.howtographql.com',
//   },
// ];
// let idCount = links.length;

const resolvers = {
  Query: {
    info: () => `This is the API of a Hacker News Clone `,
    feed: async (parent, args, context) => {
      return context.prisma.link.findMany();
    },
  },
  Mutation: {
    post: (parent, args, context, info) => {
      // const link = {
      //   id: `link-${idCount++}`,
      //   description: args.description,
      //   url: args.url,
      // };
      // links.push(link);
      // return link;
      const newLink = context.prisma.link.create({
        data: {
          url: args.url,
          description: args.description,
        },
      });
      return newLink;
    },
  },
};

const typeDefs = fs.readFileSync(
  path.join(__dirname, 'schema.graphql'),
  'utf8'
);
const prisma = new PrismaClient();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    prisma,
  },
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
