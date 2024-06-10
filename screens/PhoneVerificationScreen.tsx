import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { PhoneVerificationScreenRouteProp } from "../types/types";
import { useRoute } from "@react-navigation/native";
import { countryCodes, CountryPicker } from "react-native-country-codes-picker";

const PhoneVerificationScreen = () => {
  const route = useRoute<PhoneVerificationScreenRouteProp>();
  const { userCountry } = route.params;
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const [countryFlag, setCountryFlag] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(
    Array(10).fill("0", 0, 1).fill("", 1)
  );
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [hint, setHint] = React.useState<string>();

  useGetCountryData(); //get the dial code and flag of the country from "userCountry"
  useFocusOnFirstDigit();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phone Number Verification</Text>
      <View style={styles.phoneNumberContainer}>
        {/* country code */}
        <TouchableOpacity
          onPress={() => setShowCountryPicker(true)}
          style={styles.countryCodeContainer}
        >
          <View>
            <Text style={styles.countryCodeText}>{countryCode}</Text>
            <Text style={styles.countryCodeText}>{countryFlag}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.digitsContainer}>
          {phoneNumber.map((digit, index) => (
            <View key={index} style={{ flexDirection: "row" }}>
              {index === 3 && (
                <Text style={[styles.input, styles.plainText]}>-</Text>
              )}
              <TextInput
                style={styles.input}
                value={digit}
                onChangeText={(text) => handlePhoneNumberChange(text, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleBackspace(nativeEvent.key, index)
                }
                keyboardType="number-pad"
                maxLength={1}
                ref={(ref) => (inputRefs.current[index] = ref)}
              />
            </View>
          ))}
        </View>
      </View>
      <Button title="Send Verification Code" onPress={sendVerificationCode} />
      <TextInput
        style={[styles.input, { width: 100 }]}
        placeholder={hint}
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="number-pad"
      />
      <Button title="Verify Code" onPress={verifyCode} />

      <CountryPicker
        style={{ modal: { height: "40%" } }}
        inputPlaceholder={"search country"}
        show={showCountryPicker}
        // when picker button press you will get the country object with dial code
        pickerButtonOnPress={(country) => {
          setCountryCode(country.dial_code);
          setCountryFlag(country.flag);
          setShowCountryPicker(false);
        }}
        lang={"en"}
      />
    </View>
  );

  function handlePhoneNumberChange(text: string, index: number) {
    text = text.replace(/[^0-9]/g, ""); //replace any character that is not a digit, with ""
    if (index === 0 && text !== "0") {
      text = "";
    }
    console.log("text:", text);
    const newPhoneNumber = [...phoneNumber];
    newPhoneNumber[index] = text;
    setPhoneNumber(newPhoneNumber);

    if ((text === "0" || text) && index < phoneNumber.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleBackspace(key: string, index: number) {
    if (key === "Backspace" && index > 0 && !phoneNumber[index]) {
      inputRefs.current[index - 1]?.focus();
      const newPhoneNumber = [...phoneNumber];
      newPhoneNumber[index - 1] = "";
      setPhoneNumber(newPhoneNumber);
    }
  }

  async function sendVerificationCode() {
    const fullPhoneNumber = countryCode + phoneNumber.join("");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
  }

  async function verifyCode() {
    if (verificationCode === sentCode) {
      console.log("Phone number verified successfully!");
      // Send the verified phone number to your server
      // Example: await fetch('YOUR_SERVER_URL', { method: 'POST', body: JSON.stringify({ phoneNumber }) });
    } else {
      console.log("Invalid verification code");
    }
  }

  function useGetCountryData() {
    useEffect(() => {
      let countryData = countryCodes.find(
        (country) => country.name.en === userCountry
      );
      if (countryData === undefined) {
        setCountryCode("+1");
        setCountryFlag("🇺🇸");
        return;
      }
      setCountryCode(countryData.dial_code);
      setCountryFlag(countryData.flag);
    }, []);
  }

  //focus on the first digit
  function useFocusOnFirstDigit() {
    useEffect(() => {
      if (inputRefs.current[1]) {
        inputRefs.current[1].focus();
      }
    }, []);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  phoneNumberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // borderWidth: 1,
    // borderColor: "red",
    alignItems: "center",
    marginBottom: 16,
  },
  countryCodeContainer: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 3,
    width: 50,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "white",
    // padding: 10,
  },
  countryCodeText: {
    color: "dimgrey",
    textAlign: "center",
    fontSize: 15,
  },
  digitsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
    // borderWidth: 1,
    // borderColor: "green",
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

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black",
    paddingRight: 30,
    marginBottom: 16,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "gray",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    marginBottom: 16,
  },
});

export default PhoneVerificationScreen;
