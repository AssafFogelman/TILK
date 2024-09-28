import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { Searchbar, Chip, Text } from "react-native-paper";
import axios from "axios";
import { FlashList } from "@shopify/flash-list";
import { FAB } from "react-native-paper";
import { useAuthDispatch, useAuthState } from "../AuthContext";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { LookingToScreenNavigationProp } from "../types/types";

type TagItem = {
  categoryName: string;
  tags: { tagName: string }[];
};
type TagList = TagItem[];

const LookingToScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredTags, setFilteredTags] = useState<TagList>([]);
  const [staticTagList, setStaticTagList] = useState<TagList>([]);
  const { tagsWereChosen } = useAuthDispatch();
  const { chosenBio, chosenAvatar } = useAuthState();
  const navigation = useNavigation<LookingToScreenNavigationProp>();
  //get the categories and the tags
  useEffect(() => {
    (async () => {
      try {
        //get all the tags and categories that are relevant to this user
        const { categoryAndTagList } = await axios
          .get("/user/get-tags")
          .then((response) => response.data);
        //get the tags that the user has chosen in the past
        const { userTags } = await axios
          .get("/user/user-selected-tags")
          .then((response) => response.data);
        //update staticTagList
        setStaticTagList(categoryAndTagList);
        //update filteredTags
        setFilteredTags(categoryAndTagList);
        //update selectedTags
        setSelectedTags(userTags);
      } catch (error) {
        console.log(
          "Error trying to retrieve tags and tag categories: ",
          error
        );
      }
    })();
  }, []);

  //the categories and tags item
  const renderItem = useCallback(
    ({ item }: { item: TagItem }) =>
      item.tags.length ? (
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryName}>{item.categoryName}</Text>
          <View style={styles.chipsContainer}>
            {item.tags.map((tag) => (
              <Chip
                key={item.categoryName + "-" + tag.tagName}
                style={[
                  styles.tag,
                  //if the tag is equal to a tag in the selected tags, style it as a selected tag
                  selectedTags.some(
                    (selectedTagItem) =>
                      selectedTagItem.toLowerCase() ===
                      tag.tagName.toLowerCase()
                  ) && styles.selectedTag,
                ]}
                onPress={() => handleTagPress(tag.tagName)}
              >
                {tag.tagName}
              </Chip>
            ))}
          </View>
        </View>
      ) : null,
    [selectedTags]
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Looking To..
      </Text>
      <View style={styles.searchAndCount}>
        {/* Search Bar */}
        <Searchbar
          placeholder="Search tags..."
          onChangeText={handleSearchChange}
          value={searchQuery}
          style={styles.searchBar}
        />
        <Text>{selectedTags.length}/5</Text>
      </View>

      {/* Selected Tags Section */}
      <View style={styles.selectedTagsContainer}>
        <FlatList
          data={selectedTags}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Chip
              style={styles.selectedTag}
              onClose={() => handleTagPress(item)}
            >
              {item}
            </Chip>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Scrollable Tags Section */}
      <FlashList
        data={filteredTags}
        renderItem={renderItem}
        estimatedItemSize={315}
        keyExtractor={(item) => item.categoryName}
        extraData={selectedTags}
      />
      <FAB
        icon="arrow-right"
        style={styles.fab}
        size={"medium"}
        disabled={!selectedTags.length}
        onPress={handleNext}
      />
    </View>
  );

  async function handleNext() {
    /*
     * saves selected tags to the database
     * updates the global state
     * navigates to home
     */
    try {
      await axios.post("/user/post-tags", selectedTags);
      tagsWereChosen();

      //navigation from this page
      const previousScreen =
        navigation.getState().routes[navigation.getState().index - 1].name;
      if (previousScreen === "Tabs" && chosenAvatar && chosenBio) {
        //if the user came to the lookingTo screen from the home screen (aka the "Tabs" screen since it is a Tab Navigator)
        //and has already chosen an avatar and bio, go to home.

        navigation.replace("Tabs", { screen: "Home" });
      }
      if (!chosenAvatar) {
        navigation.navigate("SelectAvatar");
      }
      if (!chosenBio) {
        navigation.navigate("PersonalDetails");
      }

      //the user has filled all the registration screens and should:
      // - be set as currently connected
      // - go to HomeScreen without a way to go back.

      //this means we should set the user as "currently connected":
      await axios.post("/user/activate-user");

      //removing the navigation history
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Tabs" }],
        })
      );

      navigation.replace("Tabs", { screen: "Home" });
    } catch (error) {
      console.log(
        "error trying to save the chosen tags to the server: ",
        error
      );
    }
  }

  // Extracted method for filtering tag based on content
  function filterTagsByContent(tags: { tagName: string }[], text: string) {
    return tags.filter((tag) =>
      tag.tagName.toLowerCase().includes(text.toLowerCase())
    );
  }

  // Updated handleSearchChange using above method
  function handleSearchChange(text: string) {
    setSearchQuery(text);
    setFilteredTags(
      staticTagList.map((tagItem) => ({
        categoryName: tagItem.categoryName,
        tags: filterTagsByContent(tagItem.tags, text),
      }))
    );
  }

  function handleTagPress(tagName: string) {
    //if the tag is already selected
    if (selectedTags.some((selectedTagItem) => selectedTagItem === tagName)) {
      //get the tag out of the "selected tag" array
      setSelectedTags(
        selectedTags.filter((selectedTagItem) => selectedTagItem !== tagName)
      );
    } else {
      if (selectedTags.length < 5) {
        //add the tag to the "selected tag" array
        setSelectedTags((current) => [...current, tagName]);
      }
    }
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 20,
    marginTop: 20,
  },
  searchAndCount: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
  },
  selectedTagsContainer: {
    marginBottom: 16,
  },
  selectedTag: {
    marginRight: 8,
    backgroundColor: "#e0f2f7", // Light blue color for selected tags
  },
  tagsContainer: {
    flex: 1,
  },
  tagsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    margin: 4,
    borderRadius: 16, // Soft edges
  },
  categoryContainer: {
    marginBottom: 20,
    padding: 10,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  fab: {
    position: "absolute",
    margin: 50,
    right: 0,
    bottom: 0,
  },
});

export default LookingToScreen;
