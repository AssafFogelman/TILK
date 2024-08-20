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
  tags: { tagContent: string }[];
};
type TagList = TagItem[];

const LookingToScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<TagList>([]);
  const [filteredTags, setFilteredTags] = useState<TagList>([]);
  const [staticTagList, setStaticTagList] = useState<TagList>([]);
  const { tagsWereChosen } = useAuthDispatch();
  const { chosenBio, chosenAvatar } = useAuthState();
  const navigation = useNavigation<LookingToScreenNavigationProp>();
  //get the categories and the tags
  useEffect(() => {
    (async () => {
      try {
        const { categoryAndTagList } = await axios
          .get("/user/get-tags")
          .then((response) => response.data);
        //update staticTagList
        setStaticTagList(categoryAndTagList);
        //update filteredTags
        setFilteredTags(categoryAndTagList);
      } catch (error) {
        console.log(
          "Error trying to retrieve tags and tag categories: ",
          error,
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
                key={item.categoryName + "-" + tag.tagContent}
                style={[
                  styles.tag,
                  //if the tag is equal to a tag in the selected tags, style it as a selected tag
                  selectedTags.some(
                    (selectedTagItem) =>
                      selectedTagItem.tags[0].tagContent.toLowerCase() ===
                      tag.tagContent.toLowerCase(),
                  ) && styles.selectedTag,
                ]}
                onPress={() =>
                  handleTagPress(item.categoryName, tag.tagContent)
                }
              >
                {tag.tagContent}
              </Chip>
            ))}
          </View>
        </View>
      ) : null,
    [selectedTags],
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
          keyExtractor={(item) =>
            item.categoryName + "-" + item.tags[0].tagContent
          }
          renderItem={({ item }) => (
            <Chip
              style={styles.selectedTag}
              onClose={() =>
                handleTagPress(item.categoryName, item.tags[0].tagContent)
              }
            >
              {item.tags[0].tagContent}
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
      const previousScreen =
        navigation.getState().routes[navigation.getState().index - 1].name;
      console.log("previousScreen: ", previousScreen);
      if (previousScreen != "Home" && chosenAvatar && chosenBio) {
        //if the user came to the lookingTo screen not from the home screen
        //and has already chosen an avatar and bio, this means we should now activate him
        await axios.post("/user/activate-user");

        //also, we don't want the user to be able to return to the registration screens once
        // he navigates to the "Home" screen
        //removing the navigation history
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" }],
          }),
        );
      }
      // else, navigate to "Home" and don't let the user return to this specific screen
      // (he may return to other screens in the navigation stack)
      navigation.replace("Home");
    } catch (error) {
      console.log(
        "error trying to save the chosen tags to the server: ",
        error,
      );
    }
  }

  // Extracted method for filtering tag based on content
  function filterTagsByContent(tags: { tagContent: string }[], text: string) {
    return tags.filter((tag) =>
      tag.tagContent.toLowerCase().includes(text.toLowerCase()),
    );
  }

  // Updated handleSearchChange using above method
  function handleSearchChange(text: string) {
    setSearchQuery(text);
    setFilteredTags(
      staticTagList.map((tagItem) => ({
        categoryName: tagItem.categoryName,
        tags: filterTagsByContent(tagItem.tags, text),
      })),
    );
  }

  function handleTagPress(tagCategory: string, tagContent: string) {
    //if the tag (in the right category) is already selected
    if (
      selectedTags.some(
        (selectedTagItem) =>
          selectedTagItem.categoryName === tagCategory &&
          selectedTagItem.tags.some(
            (selectedTag) => selectedTag.tagContent === tagContent,
          ),
      )
    ) {
      //get the tag out of the "selected tag" array
      setSelectedTags(
        selectedTags.filter(
          (selectedTagItem) =>
            selectedTagItem.tags[0].tagContent !== tagContent,
        ),
      );
    } else {
      if (selectedTags.length < 5) {
        //add the tag to the "selected tag" array
        setSelectedTags((current) => [
          ...current,
          { categoryName: tagCategory, tags: [{ tagContent: tagContent }] },
        ]);
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
