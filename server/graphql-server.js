const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const path = require('path');

const typeDefs = fs.readFileSync(
  path.join(__dirname, '../schema/schema.graphql'),
  'utf8'
);
const server = new ApolloServer({
    typeDefs,
    resolvers,
    cors: {
      origin: '*', // Разрешить все домены
      credentials: true
    }
  });
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

const resolvers = {
  Query: {
    products: () => JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8')),
    product: (_, { id }) => {
      const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
      return products.find(p => p.id === id);
    },
    productNames: () => {
      const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
      return products.map(p => p.name);
    },
    productPrices: () => {
      const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
      return products.map(p => p.price);
    },
    productNamesWithPrices: () => {
      const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
      return products.map(p => ({ name: p.name, price: p.price }));
    },
    productNamesWithDescriptions: () => {
      const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
      return products.map(p => ({ name: p.name, description: p.description }));
    },
    productsByCategory: (_, { category }) => {
      const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
      return products.filter(p => p.categories.includes(category));
    }
  }
};


server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`GraphQL server ready at ${url}`);
});