import { List } from "react-native-paper";
import { ConnectionsCategory } from "../../types/types";
import { cat2text } from "./connections-APIs/cat2text";

export const ListHeader = ({
  firstConnectionCat,
}: {
  firstConnectionCat: keyof typeof ConnectionsCategory | null;
}) => {
  if (!firstConnectionCat) return null;
  return <List.Subheader>{cat2text(firstConnectionCat)}</List.Subheader>;
};
