import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import {
  TextInput,
  Text,
  Button,
  RadioButton,
  HelperText,
} from "react-native-paper";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import moment from "moment";
import { AntDesign } from "@expo/vector-icons";
import { useAuthDispatch, useAuthState } from "../context/AuthContext";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { PersonalDetailsScreenNavigationProp } from "../types/types";

const PersonalDetailsScreen = () => {
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [biography, setBiography] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const { bioWasChosen } = useAuthDispatch();
  const navigation = useNavigation<PersonalDetailsScreenNavigationProp>();

  const { chosenTags, chosenAvatar } = useAuthState();

  //check if there are already personal details on the server and if so, fetch them and update the state
  useEffect(() => {
    async function fetchPersonalDetails() {
      try {
        const userData = await axios
          .get("/user/user-data")
          .then((response) => response.data.user);

        if (userData) {
          setNickname(userData.nickname);
          setGender(userData.gender);
          setDateOfBirth(userData.dateOfBirth);
          setBiography(userData.biography);
        }
      } catch (error) {
        console.log("error fetching personal details: ", error);
      }
    }
    fetchPersonalDetails();
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text variant="headlineLarge" style={styles.title}>
            Personal Details
          </Text>

          <TextInput
            label="Nickname *"
            value={escapeHtml(nickname)}
            onChangeText={setNickname}
            mode="outlined"
            style={styles.input}
            error={nickname.length < 3 && nickname !== ""}
          />
          {nickname.length < 3 && nickname !== "" && (
            <HelperText type="error" visible={true}>
              Nickname must be at least 3 characters long
            </HelperText>
          )}

          <View style={styles.radioButtonSection}>
            <RadioButton.Group onValueChange={setGender} value={gender}>
              <View style={styles.radioGroup}>
                <View style={styles.radioButton}>
                  <RadioButton value="man" />
                  <Text>Man</Text>
                </View>
                <View style={styles.radioButton}>
                  <RadioButton value="woman" />
                  <Text>Woman</Text>
                </View>
                <View style={styles.radioButton}>
                  <RadioButton value="other" />
                  <Text>Other</Text>
                </View>
              </View>
            </RadioButton.Group>
            {!gender && (
              <HelperText type="error" visible={true}>
                Please select your gender
              </HelperText>
            )}
          </View>

          <Button
            onPress={() => setShowDatePicker(true)}
            mode="outlined"
            style={styles.input}
          >
            {dateOfBirth
              ? moment(dateOfBirth).format("DD/MM/YYYY")
              : "Date of Birth"}
          </Button>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <TextInput
            label="Short Bio *"
            value={escapeHtml(biography)}
            onChangeText={setBiography}
            mode="outlined"
            multiline={true}
            numberOfLines={5}
            style={styles.input}
            error={biography.length < 100 && biography !== ""}
          />
          {biography.length < 100 && biography !== "" && (
            <HelperText type="error" visible={true}>
              Bio must be at least 100 characters long
            </HelperText>
          )}
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!isFormValid()}
          style={styles.saveButton}
        >
          <AntDesign name="arrowright" size={24} color="black" />{" "}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  async function handleSubmit() {
    //update the DB
    //update the state
    //navigate to home/next screen (tags or something)
    try {
      await axios.post("/user/post-bio", {
        gender,
        biography,
        //making sure that the date is sent in a "YYYY-MM-DD" pattern
        dateOfBirth:
          dateOfBirth != null
            ? new Date(dateOfBirth).toISOString().split("T")[0]
            : null,
        nickname,
      });

      bioWasChosen();

      // navigate to home screen unless the user hasn't chosen tags or an avatar
      if (!chosenAvatar || !chosenTags) {
        navigation.navigate("SelectAvatar");
      } else {
        navigation.navigate("Tabs", { screen: "Home" });
      }
    } catch (error) {
      console.log(
        "something went wrong while submitting the user's bio: ",
        error
      );
    }
  }

  function handleDateChange(
    event: DateTimePickerEvent,
    selectedDate?: Date | undefined
  ) {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  }

  function isFormValid() {
    return nickname.length >= 3 && gender !== "" && biography.length >= 100;
  }

  function escapeHtml(unsafeStr: string) {
    return unsafeStr.replaceAll("<", "");
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  title: {
    marginBottom: 20,
    marginTop: 20,
  },
  input: {
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  radioButtonSection: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: 20,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButton: {
    marginTop: 20,
    alignSelf: "flex-end",
    paddingTop: 5,
  },
});

export default PersonalDetailsScreen;
