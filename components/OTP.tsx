import { I18nManager, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useEffect, useRef } from "react";

/*
receives:
- an array of strings
- a hook to update the array
- array of indexes where a dash separator will be put
*/
type OTPProps = {
  digitsArray: string[];
  setDigitsArray: React.Dispatch<React.SetStateAction<any[]>>;
  separatorIndexes: number[];
  visible?: boolean;
};

const OTP = ({
  digitsArray,
  setDigitsArray,
  separatorIndexes = [],
  visible = false,
  // visible is not obligatory. used in case OPT is used in a modal that
  // becomes visible when the user does something. In that case we want the keyboard to pop-up
}: OTPProps) => {
  const digitInputRefs = useRef<(TextInput | null)[]>([]);
  useFocusOnFirstDigit(visible);

  return (
    <View>
      <View style={styles.digitsContainer}>
        {digitsArray.map((digit, index) => (
          <View
            key={index}
            style={{ flexDirection: I18nManager.isRTL ? "row-reverse" : "row" }}
          >
            {separatorIndexes.includes(index) && (
              <Text style={[styles.input, styles.plainText]}>-</Text>
            )}
            <TextInput
              style={styles.input}
              value={digit}
              onChangeText={(text) => handleDigitsArrayChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleBackspace(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              ref={(ref) => (digitInputRefs.current[index] = ref)}
              onFocus={() => handleInputFocus(index)}
            />
          </View>
        ))}
      </View>
    </View>
  );

  function handleDigitsArrayChange(text: string, index: number) {
    text = text.replace(/[^0-9]/g, ""); //replace any character that is not a digit, with ""
    // enforce the first digit to be "0"
    // if (index === 0 && text !== "0") {
    //   text = "";
    // }
    const newDigitsArray = [...digitsArray];
    newDigitsArray[index] = text;
    setDigitsArray(newDigitsArray);

    if ((text === "0" || text) && index < digitsArray.length - 1) {
      digitInputRefs.current[index + 1]?.focus();
    }
  }

  function handleBackspace(key: string, index: number) {
    if (key === "Backspace" && index > 0 && !digitsArray[index]) {
      digitInputRefs.current[index - 1]?.focus();
      const newDigitsArray = [...digitsArray];
      newDigitsArray[index - 1] = "";
      setDigitsArray(newDigitsArray);
    }
  }

  function handleInputFocus(index: number) {
    if (index === 0 || digitsArray[index - 1] !== "") {
      digitInputRefs.current[index]?.focus();
      return;
    }
    digitInputRefs.current[index]?.blur();
  }

  //focus on the first digit
  function useFocusOnFirstDigit(visible: boolean) {
    useEffect(() => {
      // Small delay to ensure modal is rendered
      const timer = setTimeout(() => {
        if (digitInputRefs.current[0]) {
          digitInputRefs.current[0].focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }, [visible]);
  }
};

export default OTP;

const styles = StyleSheet.create({
  digitsContainer: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    justifyContent: "center",
    marginBottom: 5,
  },
  input: {
    height: 30,
    width: 22.5,
    borderColor: "gray",
    borderWidth: 1,
    marginHorizontal: 1,
    textAlign: "center",
    borderRadius: 3,
  },
  plainText: {
    width: 10,
    borderWidth: 0,
    textAlignVertical: "center",
  },
});
