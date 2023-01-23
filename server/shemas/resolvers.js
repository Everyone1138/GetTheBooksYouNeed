const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");
const { User } = require("../models");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      return User.findOne({ _id: context.user._id });
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("This email is not in our database.Try creating an account!");
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("The password you used is incorrect.");
      }

      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, { bookInput }, context) => {
      console.log("User", context.user);
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookInput } },
          { new: true }
        );
      }
      throw new AuthenticationError(
        "Fogot to log in? Please log in to continue!"
      );
    },

    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
      }
      throw new AuthenticationError(
        "Fogot to log in? Please log in to continue!"
      );
    },
  },
};

module.exports = resolvers;
