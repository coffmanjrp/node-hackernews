const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { secret, getUserId } = require('../utils');

async function signup(parent, args, context, info) {
  const password = await bcrypt.hash(args.password, 10);
  const user = await context.prisma.user.create({
    data: { ...args, password },
  });
  const token = jwt.sign({ userId: user.id }, secret);

  return {
    user,
    token,
  };
}

async function login(parent, args, context, info) {
  const user = await context.prisma.user.findUnique({
    where: { email: args.email },
  });
  if (!user) {
    throw new Error('No such user found');
  }

  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error('invalid password');
  }

  const token = jwt.sign({ userId: user.id }, secret);

  return {
    token,
    user,
  };
}

async function post(parent, args, context, info) {
  const { userId } = context;

  const newLink = await context.prisma.link.create({
    data: {
      url: args.url,
      description: args.description,
      postedBy: {
        connect: {
          id: userId,
        },
      },
    },
  });
  context.pubsub.publish('NEW_LINK', newLink);

  return newLink;
}

async function vote(parent, args, context, info) {
  const userId = getUserId(context);

  const vote = await context.prisma.vote.findUnique({
    where: {
      linkId_userId: {
        linkId: Number(args.linkId),
        userId,
      },
    },
  });

  if (Boolean(vote)) {
    throw new Error(`Already voted for link: ${args.linkId}`);
  }

  const newVote = context.prisma.vote.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      link: {
        connect: {
          id: Number(args.linkId),
        },
      },
    },
  });
  context.pubsub.publish('NEW_VOTE', newVote);

  return newVote;
}

module.exports = {
  signup,
  login,
  post,
  vote,
};
