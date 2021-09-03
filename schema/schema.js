const { default: axios } = require("axios");
const graphQL = require("graphql");
const { getUser } = require("./dummydata");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} = graphQL;

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${parenValue.id}/users`)
          .then((response) => response.data);
      },
    },
  }),
});
const UserType = new GraphQLObjectType({
  name: "user",
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${parenValue.companyId}`)
          .then((response) => response.data);
      },
    },
  }),
});

// Root query is used to allow graphQL to enter in our application, it is application's graph object entry point
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: () => ({
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      // resolve is responsible to interact with Db or do an API call etc.
      resolve(parentValue, args) {
        // return getUser(args.id);
        return axios
          .get(`http://localhost:3000/users/${args.id}`)
          .then((response) => response.data);
      },
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      // resolve is responsible to interact with Db or do an API call etc.
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${args.id}`)
          .then((response) => response.data);
      },
    },
  }),
});
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLString) },
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, args) {
        const { firstName, age } = args;
        return axios
          .post(`http://localhost:3000/users/`, { firstName, age })
          .then((response) => response.data);
      },
    },
    deleteUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parentValue, args) {
        const { id } = args;
        return axios
          .delete(`http://localhost:3000/users/${id}`)
          .then((response) => response.data);
      },
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, args) {
        const { id } = args;
        return (
          // put is used to completely override the object whereas patch is used to update a part of the object
          axios
            .patch(`http://localhost:3000/users/${id}`, args)
            .then((response) => response.data)
        );
      },
    },
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: mutation,
});
