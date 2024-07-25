import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, KeyboardAvoidingView} from 'react-native';
import {TextInput, Text, Button, RadioButton, HelperText} from 'react-native-paper';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import moment from 'moment';
import {AntDesign} from '@expo/vector-icons';
import {useAuthDispatch, useAuthState} from "../AuthContext";
import axios from "axios";
import {useNavigation} from "@react-navigation/native";
import {PersonalDetailsScreenNavigationProp} from "../types/types";

const PersonalDetailsScreen = () => {
    const [nickname, setNickname] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
    const [biography, setBiography] = useState('');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const {bioWasChosen} = useAuthDispatch();
    const navigation = useNavigation<PersonalDetailsScreenNavigationProp>()

    const {
        chosenBio,
        chosenTags,
        chosenAvatar
    } = useAuthState();

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date | undefined) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDateOfBirth(selectedDate);
        }
    };

    const isFormValid = () => {
        return (
            nickname.length >= 3 &&
            gender !== '' &&
            biography.length >= 140
        );
    };

    const escapeHtml = (unsafeStr: string) => {
        return unsafeStr.replaceAll('<', '');
    }

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
                        error={nickname.length < 3 && nickname !== ''}
                    />
                    {nickname.length < 3 && nickname !== '' && (
                        <HelperText type="error" visible={true}>
                            Nickname must be at least 3 characters long
                        </HelperText>
                    )}

                    <View style={styles.radioButtonSection}>
                        <RadioButton.Group onValueChange={setGender} value={gender}>
                            <View style={styles.radioGroup}>
                                <View style={styles.radioButton}>
                                    <RadioButton value="man"/>
                                    <Text>Man</Text>
                                </View>
                                <View style={styles.radioButton}>
                                    <RadioButton value="woman"/>
                                    <Text>Woman</Text>
                                </View>
                                <View style={styles.radioButton}>
                                    <RadioButton value="other"/>
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
                        {dateOfBirth ? moment(dateOfBirth).format('DD/MM/YYYY') : 'Date of Birth'}
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
                        error={biography.length < 140 && biography !== ''}
                    />
                    {biography.length < 140 && biography !== '' && (
                        <HelperText type="error" visible={true}>
                            Bio must be at least 140 characters long
                        </HelperText>
                    )}
                </View>


                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    disabled={!isFormValid()}
                    style={styles.saveButton}
                >
                    <AntDesign name="arrowright" size={24} color="black"/> </Button>
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
                dateOfBirth,
                nickname
            })

            bioWasChosen();

            // navigate to home screen unless the user hasn't chosen a bio
            if (!chosenAvatar || !chosenTags) {
                navigation.navigate("SelectAvatar");
            } else {
                navigation.navigate("Home")
            }
        } catch (error) {
            console.log("something went wrong while submitting the user's bio: ", error)
        }
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
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    radioButtonSection: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: 20,
        marginTop: 20,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveButton: {
        marginTop: 20,
        alignSelf: 'flex-end',
        paddingTop: 5,
    },
});

export default PersonalDetailsScreen;