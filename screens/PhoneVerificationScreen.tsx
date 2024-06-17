import {
  Alert,
  Button,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { PhoneVerificationScreenRouteProp } from "../types/types";
import { useRoute } from "@react-navigation/native";
import { countryCodes, CountryPicker } from "react-native-country-codes-picker";
import axios from "axios";
import { osName } from "expo-device";
import { getIosIdForVendorAsync, getAndroidId } from "expo-application";

const PhoneVerificationScreen = () => {
  const route = useRoute<PhoneVerificationScreenRouteProp>();
  const { userCountry } = route.params;
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const [countryFlag, setCountryFlag] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(Array(10).fill(""));
  const [code, setCode] = useState(Array(5).fill(""));

  const [hash, setHash] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const phoneInputRefs = useRef<(TextInput | null)[]>([]);
  const codeInputRefs = useRef<(TextInput | null)[]>([]);
  const [hint, setHint] = React.useState<string>();
  const [modalVisible, setModalVisible] = useState(false);

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
                ref={(ref) => (phoneInputRefs.current[index] = ref)}
                onFocus={() => handleInputFocus(index)}
              />
            </View>
          ))}
        </View>
      </View>
      {/* a button that sends the SMS code and opens a Modal to enter the code */}
      <View style={{ alignItems: "center" }}>
        <Pressable
          style={({ pressed }) => [
            styles.pressable,
            pressed ? styles.pressedPressable : null,
          ]}
          onPress={sendVerificationCode}
        >
          <Text style={styles.pressableText}>get code</Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>This is a modal message!</Text>
            <Pressable
              style={({ pressed }) => [
                styles.minimizeButton,
                pressed ? styles.pressedMinimizeButton : null,
              ]}
              onPress={toggleModal}
            >
              <Text style={styles.minimizeButtonText}>didn't get the SMS?</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
    const newPhoneNumber = [...phoneNumber];
    newPhoneNumber[index] = text;
    setPhoneNumber(newPhoneNumber);

    if ((text === "0" || text) && index < phoneNumber.length - 1) {
      phoneInputRefs.current[index + 1]?.focus();
    }
  }

  function handleBackspace(key: string, index: number) {
    if (key === "Backspace" && index > 0 && !phoneNumber[index]) {
      phoneInputRefs.current[index - 1]?.focus();
      const newPhoneNumber = [...phoneNumber];
      newPhoneNumber[index - 1] = "";
      setPhoneNumber(newPhoneNumber);
    }
  }

  async function sendVerificationCode() {
    try {
      //show the Modal
      toggleModal();
      //get a unique OS ID
      let uniqueOSCode = "no identifier";
      switch (osName) {
        case "iOS":
        case "iPadOS":
          uniqueOSCode = await getIosIdForVendorAsync().then((Id) =>
            Id ? Id : "no identifier"
          );
          break;
        case "Android":
          uniqueOSCode = getAndroidId();
          break;
        case "Windows":
          uniqueOSCode = "app is run on windows";
          break;
      }

      let concatenatedPhoneNumber = countryCode;
      concatenatedPhoneNumber +=
        phoneNumber[0] === "0"
          ? phoneNumber.join("").slice(1)
          : phoneNumber.join("");
      //if the phone number starts with "0", remove the "0";
      const hash = await axios
        .post(`/auth/send-sms`, {
          phoneNumber: concatenatedPhoneNumber,
          uniqueOSCode,
        })
        .then((response) => response.data);
      setHash(hash);
    } catch (error) {
      console.log("error trying to send code:", error);
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
      if (phoneInputRefs.current[0]) {
        phoneInputRefs.current[0].focus();
      }
    }, []);
  }

  function handleInputFocus(index: number) {
    if (index === 0 || phoneNumber[index - 1] !== "") {
      phoneInputRefs.current[index]?.focus();
      return;
    }
    phoneInputRefs.current[index]?.blur();
  }

  function toggleModal() {
    setModalVisible(!modalVisible);
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
  pressable: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: 200,
    textAlign: "center",
    borderRadius: 20,
  },
  pressedPressable: {
    opacity: 0.7,
  },
  pressableText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 16,
  },
  minimizeButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  pressedMinimizeButton: {
    opacity: 0.7,
  },
  minimizeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
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
