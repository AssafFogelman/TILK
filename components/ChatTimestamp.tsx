import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { ChatMessageType } from "../types/types";
import { formatDate2 } from "../functions/formatDate";

const ChatTimestamp = ({
  chatMessage,
  previousMessageTimestamp,

  index,
}: {
  chatMessage: ChatMessageType;
  previousMessageTimestamp: string;

  index: number;
}) => {
  const [timestamp, setTimestamp] = useState<string>(
    formatDate2(chatMessage.timeStamp)
  );
  const [showTimestamp, setShowTimestamp] = useState(false);

  const differentDay = (newerDate: string, olderDate: string) => {
    const newerDateAsDate = new Date(newerDate);
    const olderDateAsDate = new Date(olderDate);
    const newerDateInMilliseconds = newerDateAsDate.getTime();
    const olderDateInMilliseconds = olderDateAsDate.getTime();
    const newerDateInWeekday = newerDateAsDate.getDay();
    const olderDateInWeekday = olderDateAsDate.getDay();
    const elapsedTimeInDays = Math.abs(
      (olderDateInMilliseconds - newerDateInMilliseconds) / 1000 / 60 / 60 / 24
    );
    //if the dates are of different weekdays, than it's definitely a different day.
    //also, they are the same weekday but a different week, they are in different days.
    //because you could have two dates that are less than 24 hours apart, and yet are on different days.
    return olderDateInWeekday !== newerDateInWeekday || elapsedTimeInDays >= 1;
  };

  useEffect(() => {
    //if this is the first message, or the dates are on different days
    if (
      index === 0 ||
      differentDay(previousMessageTimestamp, chatMessage.timeStamp)
    ) {
      setShowTimestamp(true);
    } else {
      setShowTimestamp(false);
    }
  }, []);

  //if the timestamps are on the same day return null;
  return (
    <>
      {showTimestamp ? (
        <View
          style={{
            alignSelf: "center",
            backgroundColor: "#808080",
            padding: 8,
            maxWidth: "60%",
            borderRadius: 10,
            margin: 10,
          }}
        >
          <Text>{timestamp}</Text>
        </View>
      ) : null}
    </>
  );
};

export default ChatTimestamp;
