import { Route } from "../types/types";

export const initialTabState = {
  index: 0,
  routes: [
    {
      key: "Home",
      title: "Home",
      focusedIcon: "home",
      unfocusedIcon: "home-outline",
    },

    {
      key: "Connections",
      title: "Connections",
      focusedIcon: "people",
      unfocusedIcon: "people-outline",
    },
    {
      key: "Chats",
      title: "Chats",
      focusedIcon: "chat",
      unfocusedIcon: "chat-outline",
    },
  ] as Route[],
};
