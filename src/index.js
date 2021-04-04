const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const path = require('path');

let links = [
  {
    id: 'link-0',
    description: 'Fullstack tutorial for GraphQL',
    url: 'www.howtographql.com',
  },
];
let idCount = links.length;

const resolvers = {
  Query: {
    info: () => `This is the API of a Hacker News Clone `,
    feed: () => links,
  },
  Mutation: {
    post: (parent, args) => {
      const link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url,
      };
      links.push(link);
      return link;
    },
  },
};

const typeDefs = fs.readFileSync(
  path.join(__dirname, 'schema.graphql'),
  'utf8'
);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
