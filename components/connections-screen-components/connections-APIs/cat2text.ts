import { ConnectionsCategory } from "../../../types/types";

export function cat2text(cat: keyof typeof ConnectionsCategory) {
  switch (cat) {
    case ConnectionsCategory.CONNECTION_REQUEST:
      return "Connection Requests";
    case ConnectionsCategory.CONNECTED_USER:
      return "Connected Users";
    case ConnectionsCategory.SENT_REQUEST:
      return "Sent Requests";
    default:
      return cat;
  }
}
