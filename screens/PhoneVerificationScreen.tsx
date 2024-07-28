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
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  PhoneVerificationScreenNavigationProp,
  PhoneVerificationScreenRouteProp,
} from "../types/types";
import { useNavigation, useRoute } from "@react-navigation/native";
import { countryCodes, CountryPicker } from "react-native-country-codes-picker";
import axios, { AxiosError } from "axios";
import { osName } from "expo-device";
import { getIosIdForVendorAsync, getAndroidId } from "expo-application";
import OTP from "../components/OTP";
import { setItemAsync, getItemAsync } from "expo-secure-store";
import { useAuthDispatch } from "../AuthContext";
import { useScreenOrder } from "../hooks/useScreenOrder";

const PhoneVerificationScreen = () => {
  const route = useRoute<PhoneVerificationScreenRouteProp>();
  const { userCountry } = route.params;
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const [countryFlag, setCountryFlag] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<string[]>(Array(10).fill(""));
  const [code, setCode] = useState(Array(5).fill(""));

  const [hash, setHash] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const phoneInputRefs = useRef<(TextInput | null)[]>([]);
  const codeInputRefs = useRef<(TextInput | null)[]>([]);
  const [hint, setHint] = React.useState<string>();
  const [modalVisible, setModalVisible] = useState(false);
  const { signUp } = useAuthDispatch();
  const navigation = useNavigation<PhoneVerificationScreenNavigationProp>();
  const initialScreenOrder = useScreenOrder();

  useGetCountryData(); //get the dial code and flag of the country from "userCountry"

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
        <OTP
          digitsArray={phoneNumber}
          setDigitsArray={setPhoneNumber}
          separatorIndexes={[3]}
        />
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
            <Text style={styles.modalText}>Enter the SMS code</Text>
            <OTP
              digitsArray={code}
              setDigitsArray={setCode}
              separatorIndexes={[]}
            />
            <Pressable
              style={({ pressed }) => [
                styles.minimizeButton,
                pressed ? styles.pressedMinimizeButton : null,
              ]}
              onPress={handleVerifyCode}
            >
              <Text style={styles.minimizeButtonText}>verify code</Text>
            </Pressable>
            <Pressable style={styles.returnButton} onPress={toggleModal}>
              <Text style={{ color: "#007AFF" }}>didn't get the SMS?</Text>
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
            Id ? Id : "no identifier",
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
      const { hash } = await axios
        .post(`/auth/send-sms`, {
          phoneNumber: concatenatedPhoneNumber,
          uniqueOSCode,
        })
        .then((response) => response.data);
      setHash(hash);
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(
          "error while trying to send code:",
          error.response.data.message,
        );
      }
    }
  }

  function useGetCountryData() {
    useEffect(() => {
      let countryData = countryCodes.find(
        (country) => country.name.en === userCountry,
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

  function toggleModal() {
    //if we want to show the modal, then it is now NOT visible, and thus the code needs to be reset.
    //if we want to hide the modal, then it is NOW visible, and thus the phone number needs to be reset.

    modalVisible
      ? setPhoneNumber(Array(phoneNumber.length).fill(""))
      : setCode(Array(code.length).fill(""));

    setModalVisible(!modalVisible);
  }

  async function handleVerifyCode() {
    //if the code is not totally filled, do nothing
    if (!code[code.length - 1]) return;
    let concatenatedPhoneNumber = countryCode;
    concatenatedPhoneNumber +=
      phoneNumber[0] === "0"
        ? phoneNumber.join("").slice(1)
        : phoneNumber.join("");
    //if the phone number starts with "0", remove the "0";

    try {
      const {
        token,
        userId,
        chosenAvatar,
        chosenBio,
        chosenTags,
        isAdmin,
      }: {
        token: string;
        userId: string;
        chosenAvatar: boolean;
        chosenBio: boolean;
        chosenTags: boolean;
        isAdmin: boolean;
        offGrid: boolean;
      } = await axios
        .post("/auth/create-token", {
          phoneNumber: concatenatedPhoneNumber,
          code: code.join(""), //concatenated
          hash,
        })
        .then((response) => response.data);

      //store token in secure store
      await setItemAsync("TILK-token", token);

      //add the token to the header in every request
      axios.interceptors.request.use((config) => {
        config.headers["TILK-token"] = token;
        return config;
      });
      //store user details in context
      signUp({
        userId,
        chosenAvatar: chosenAvatar,
        chosenBio,
        chosenTags,
        isAdmin,
        userToken: token,
      });

      //since it takes time for the context to update the state,
      //for the stackNavigator to not throw us to a wrong screen, we will navigate manually
      navigation.navigate(initialScreenOrder);
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(
          "error while trying to verify the code and create a token:",
          error.response.data.message,
        );
      } else {
        console.log(
          "error trying to verify the code and create a token:",
          error,
        );
      }
    }
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
    gap: 20,
    justifyContent: "center",
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
  returnButton: {
    marginTop: 15,
    // alignSelf: "flex-end",
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
