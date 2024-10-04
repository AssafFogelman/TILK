// const connectedUsers = await db
//   .select({
//     userId: users.userId,
//     // phoneNumber: users.phoneNumber,
//     smallAvatar: users.smallAvatar,
//     biography: users.biography,
//     dateOfBirth: users.dateOfBirth,
//     gender: users.gender,
//     // activeUser: users.activeUser,
//     // offGrid: users.offGrid,
//     nickname: users.nickname,
//     // created: users.created,
//     currentlyConnected: users.currentlyConnected,
//     // admin: users.admin,
//     // locationDate: users.locationDate,
//     socketId: users.socketId,
//   })
//   .from(connections)
//   .innerJoin(
//     users,
//     or(
//       and(
//         eq(connections.connectedUser1, userId),
//         eq(users.userId, connections.connectedUser2)
//       ),
//       and(
//         eq(connections.connectedUser2, userId),
//         eq(users.userId, connections.connectedUser1)
//       )
//     )
//   )
//   .where(
//     and(
//       or(
//         eq(connections.connectedUser1, userId),
//         eq(connections.connectedUser2, userId)
//       ),
//       eq(users.activeUser, true)
//     )
//   );

const result = {
  connectedUsers: [
    {
      userId: "a8d8bbc4-6ae9-4f0c-87ca-2cb4da6a210c",
      smallAvatar: "https://example.com/small-avatar.jpg",
      nickname: "John Doe",
      currentlyConnected: true,
      socketId: "1234567890",
      tags: ["tag1", "tag2", "tag3"],
    },
    {
      userId: "a8d8bbc4-6ae9-4f0c-87ca-2cb4da6a210c",
      smallAvatar: "https://example.com/small-avatar.jpg",
      nickname: "John Doe",
      currentlyConnected: true,
      socketId: "1234567890",
      tags: ["tag1", "tag2", "tag3"],
    },
  ],
  receivedConnectionsRequests: [
    {
      userId: "a8d8bbc4-6ae9-4f0c-87ca-2cb4da6a210c",
      smallAvatar: "https://example.com/small-avatar.jpg",
      nickname: "John Doe",
      currentlyConnected: true,
      socketId: "1234567890",
      tags: ["tag1", "tag2", "tag3"],
      unread: true, //the received request is unread
    },
  ],
  sentConnectionsRequests: [
    {
      userId: "a8d8bbc4-6ae9-4f0c-87ca-2cb4da6a210c",
      smallAvatar: "https://example.com/small-avatar.jpg",
      nickname: "John Doe",
      currentlyConnected: true,
      socketId: "1234567890",
      tags: ["tag1", "tag2", "tag3"],
    },
  ],
};

// and we need to see only users that we haven't blocked or have blocked us (mentioned in the "blocks" table in the data base).
// also, the list of "sentConnectionsRequests" will only include users that are not "off-grid".
//in addition, if we have chatted with a user, we need to return the last message in the chat in text. if it is an image, the last message should read "image". if the last message is unread, we need to mark it as unread.
