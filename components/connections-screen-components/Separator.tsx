import { List } from "react-native-paper";
import { ConnectionsScreenUser } from "../../types/types";
import { cat2text } from "./connections-APIs/cat2text";

export const Separator = ({
  leadingItem,
  trailingItem,
}: {
  leadingItem: ConnectionsScreenUser;
  trailingItem: ConnectionsScreenUser;
}) => {
  if (leadingItem.category === trailingItem.category) return null;

  return <List.Subheader>{cat2text(trailingItem.category)}</List.Subheader>;
};
