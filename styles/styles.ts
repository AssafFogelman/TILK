import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  chatMessageScreen_userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#9ab5e3",
    padding: 8,
    maxWidth: "60%",
    borderRadius: 10,
    margin: 10,
  },
  chatMessageScreen_recipientMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ccdaf1",
    padding: 8,
    maxWidth: "60%",
    borderRadius: 10,
    margin: 10,
  },
  chatMessageScreen_selectedMessage: {
    borderWidth: 1,
    backgroundColor: "#4663ac",
  },
});

export default styles;
