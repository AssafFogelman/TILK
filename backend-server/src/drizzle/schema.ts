import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  date,
  pgEnum,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

//declaring an enum
export const genderEnum = pgEnum("gender_enum", ["man", "woman", "other"]);

//users
export const users = pgTable("users", {
  userId: uuid("user_id").primaryKey().unique().notNull().defaultRandom(),
  /*using a UUID is better than using an incremental integer id, because
    if you make branches, and add rows to each branch, once you try to merge the
    branches, they show a problem - two different rows with the same primary key.

    However. if we were to make a incremental integer primary key we would write:
    user_id: serial("user_id").primaryKey()
    which would have auto incremented the counter.    
  */
  phoneNumber: text("phone_number").notNull(),
  avatarLink: text("avatar_link")
    .default(
      "https://png.pngtree.com/png-clipart/20210915/ourlarge/pngtree-user-avatar-placeholder-black-png-image_3918427.jpg"
    )
    .notNull(),
  biography: text("biography"),
  dateOfBirth: date("date_of_birth"),
  //gender is an enum - man, woman, other
  gender: genderEnum("gender").notNull(),
  //is the user active, a.k.a, has the application on their phone
  active: boolean("active").default(true),
  //off-grid: the user has decided to be invisible and not see others
  offGrid: boolean("off-grid").default(false),
  //!do we need this hash column? how will this be used? I suppose there will have to be a way to authenticate the token... some password, even if the app is making it
  hash: text("hash"),
  nickname: text("nickname").notNull(),
  //makes SQL create a timestamp once the record is created
  created: timestamp("created").default(sql`CURRENT_TIMESTAMP`),
  //is the user currently connected
  connected: boolean("connected").default(true),
  locationDate: timestamp("location_date").default(new Date(0)),
});
/*
uuid - a long long string for Ids
varchar - 255 char string. changes by use.
text - like varchar. just a better name
integer - a whole number
date - "The DATE type is used for values with a date part but no time part"
timestamp - type Date()
pgTable - how to create a table in postgres
primaryKey - the rows are defined by this column
unique - make sure it is unique
notNull - make sure it's not null
defaultRandom - create a random value

*/

/*
we also added a column named "location" of type "geometry". 
we did that through the sql editor in Neon. Because Drizzle couldn't handle it.
This is the sql code line: 
`ALTER TABLE "users" ADD COLUMN "location" geometry(POINT,4326);`);
BTW, 4326 is the SRID number, which is a covention for caculating areas and distances.
It is the default SRID of postGIS. 
*/

export const userRelations = relations(users, ({ many }) => ({
  tags: many(tags),
  connections: many(connections),
  receivedConnectionRequests: many(receivedConnectionRequests),
  sentConnectionRequests: many(sentConnectionRequests),
  blocks: many(blocks),
  chats: many(chats),
  events: many(events),
}));

//tags
export const tags = pgTable("tags", {
  tagId: uuid("tag_id").primaryKey().unique().notNull().defaultRandom(),
  tagTemplateId: uuid("tag_template_id")
    .notNull()
    .references(() => tagTemplates.tagTemplateId), //add a reference to tagTemplate table
  tagChooser: uuid("tag_chooser")
    .notNull()
    .references(() => users.userId),
});

export const tagRelations = relations(tags, ({ one }) => ({
  tagChooser: one(users, {
    fields: [tags.tagChooser],
    references: [users.userId],
  }),
  tagTemplateId: one(tagTemplates, {
    fields: [tags.tagTemplateId],
    references: [tagTemplates.tagTemplateId],
  }),
}));

//tag templates
export const tagTemplates = pgTable("tag_templates", {
  tagTemplateId: uuid("tag_template_id")
    .primaryKey()
    .notNull()
    .unique()
    .defaultRandom(),
  tagContent: text("tag_content").notNull().unique(),
  tagCategory: uuid("tag_category")
    .notNull()
    .references(() => tagCategories.tagCategoryId),
});

export const tagTemplateRelations = relations(
  tagTemplates,
  ({ many, one }) => ({
    tags: many(tags),
    tagCategory: one(tagCategories, {
      fields: [tagTemplates.tagCategory],
      references: [tagCategories.tagCategoryId],
    }),
  })
);

//tag template categories
export const tagCategories = pgTable("tag_categories", {
  tagCategoryId: uuid("tag_category_id")
    .primaryKey()
    .notNull()
    .unique()
    .defaultRandom(),
  categoryName: text("category_name").notNull().unique(),
});

export const tagCategoryRelations = relations(tagCategories, ({ many }) => ({
  tagTemplates: many(tagTemplates),
}));

// connections (friendships)
export const connections = pgTable("connections", {
  connectionId: uuid("connection_id")
    .notNull()
    .unique()
    .defaultRandom()
    .primaryKey(),
  connectionDate: timestamp("connection_date")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  connectedUser1: uuid("connected_user1")
    .notNull()
    .references(() => users.userId),
  connectedUser2: uuid("connected_user2")
    .notNull()
    .references(() => users.userId),
});

export const connectionsRelations = relations(connections, ({ one }) => ({
  connectedUser1: one(users, {
    fields: [connections.connectedUser1],
    references: [users.userId],
  }),
  connectedUser2: one(users, {
    fields: [connections.connectedUser2],
    references: [users.userId],
  }),
}));

// received connection requests
export const receivedConnectionRequests = pgTable(
  "received_connection_requests",
  {
    receivedRequestId: uuid("received_request_id")
      .primaryKey()
      .defaultRandom()
      .unique()
      .notNull(),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => users.userId),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.userId),
    requestDate: timestamp("request_date").default(sql`CURRENT_TIMESTAMP`),
    unread: boolean("unread").notNull().default(true),
  }
);

export const receivedConnectionRequestRelations = relations(
  receivedConnectionRequests,
  ({ one }) => ({
    recipientId: one(users, {
      fields: [receivedConnectionRequests.recipientId],
      references: [users.userId],
    }),
    senderId: one(users, {
      fields: [receivedConnectionRequests.senderId],
      references: [users.userId],
    }),
  })
);

// sent connection requests
export const sentConnectionRequests = pgTable("sent_connection_requests", {
  sentRequestId: uuid("sent_request_id")
    .notNull()
    .primaryKey()
    .defaultRandom()
    .unique(),
  recipientId: uuid("recipient_id")
    .notNull()
    .references(() => users.userId),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.userId),
  requestDate: timestamp("request_date")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const sentConnectionRequestRelations = relations(
  sentConnectionRequests,
  ({ one }) => ({
    recipientId: one(users, {
      fields: [sentConnectionRequests.recipientId],
      references: [users.userId],
    }),
    senderId: one(users, {
      fields: [sentConnectionRequests.senderId],
      references: [users.userId],
    }),
  })
);

//blocks
export const blocks = pgTable("blocks", {
  blockId: uuid("block_id").primaryKey().defaultRandom().notNull().unique(),
  blockingUserId: uuid("blocking_user_id")
    .notNull()
    .references(() => users.userId),
  blockedUserId: uuid("blocked_user_id")
    .notNull()
    .references(() => users.userId),
  blockDate: timestamp("block_date")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const blocksRelations = relations(blocks, ({ one }) => ({
  blockingUserId: one(users, {
    fields: [blocks.blockingUserId],
    references: [users.userId],
  }),
  blockedUserId: one(users, {
    fields: [blocks.blockedUserId],
    references: [users.userId],
  }),
}));

//chats
export const chats = pgTable("chats", {
  chatId: uuid("chat_id").primaryKey().defaultRandom().unique().notNull(),
  participant1: uuid("participant1")
    .notNull()
    .references(() => users.userId),
  participant2: uuid("participant2")
    .notNull()
    .references(() => users.userId),
});

export const chatsRelations = relations(chats, ({ one, many }) => ({
  participant1: one(users, {
    fields: [chats.participant1],
    references: [users.userId],
  }),
  participant2: one(users, {
    fields: [chats.participant1],
    references: [users.userId],
  }),
  chatMessage: many(chatMessages),
}));

//declaring an enum for message types
export const messageTypeEnum = pgEnum("message_type_enum", ["image", "text"]);

//chat messages

//we want the search of messages to go this way: each chat message has a chat id.
//that way we can index the chat messages with the chat id field.
//plus, when you just need to fetch all the messages of a certain chat id, it is more efficient
//than to search every message for the existence of two specific chat participants
export const chatMessages = pgTable("chat_messages", {
  messageId: uuid("message_id").primaryKey().unique().notNull().defaultRandom(),
  chatId: uuid("chat_id").notNull(),
  date: timestamp("date")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  sender: uuid("sender")
    .notNull()
    .references(() => users.userId),
  recipient: uuid("recipient")
    .notNull()
    .references(() => users.userId),
  type: messageTypeEnum("type").notNull(),
  imageURI: text("image_URI").default(""),
  text: text("text").default(""),
  unread: boolean("unread").default(true).notNull(),
  receivedSuccessfully: boolean("received_successfully")
    .default(false)
    .notNull(),
});

export const chatMessageRelations = relations(chatMessages, ({ one }) => ({
  chatId: one(chats, {
    fields: [chatMessages.chatId],
    references: [chats.chatId],
  }),
  sender: one(users, {
    fields: [chatMessages.sender],
    references: [users.userId],
  }),
  recipient: one(users, {
    fields: [chatMessages.recipient],
    references: [users.userId],
  }),
}));

//notification templates
export const notificationTemplates = pgTable("notification_templates", {
  notificationId: uuid("notification_id")
    .primaryKey()
    .notNull()
    .defaultRandom()
    .unique(),
  notificationName: text("notification_name").notNull().unique(),
  content: text("content").notNull(),
});

//event history
export const events = pgTable("events", {
  eventId: uuid("event_id").primaryKey().defaultRandom().notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.userId),
  eventDate: timestamp("event_date")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  eventType: uuid("event_type")
    .notNull()
    .references(() => eventTypes.eventTypeId),
  /*
  so, let's assume a user has blocked another user. a record will be added to the "blocks"
  table. that record will have a "block_id". through this id we can extrapolate data on 
  this event. the field "relevant_table_primary_key" records just that.
  */
  relevantTablePrimaryKey: uuid("relevant_table_primary_key").notNull(),
});

export const eventsRelations = relations(events, ({ one }) => ({
  eventType: one(eventTypes, {
    fields: [events.eventType],
    references: [eventTypes.eventTypeId],
  }),
}));

//declaring an enum for table names
export const tablesEnum = pgEnum("tables_enum", [
  "users",
  "location_records",
  "connections",
  "sent_connection_requests",
  "received_connection_requests",
  "blocks",
  "chats",
  "chat_messages",
  "tags",
  "tag_templates",
]);

export const eventTypes = pgTable("event_types", {
  eventTypeId: uuid("event_type_id")
    .primaryKey()
    .notNull()
    .unique()
    .defaultRandom(),
  eventTypeName: text("event_type_name").notNull().unique(),
  tableAffected: tablesEnum("table_affected").notNull(),
});

export const eventTypesRelations = relations(eventTypes, ({ many }) => ({
  events: many(events),
}));
