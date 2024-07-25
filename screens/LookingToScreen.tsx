import React, {useEffect, useState} from 'react';
import {StyleSheet, View, ScrollView, FlatList} from 'react-native';
import {Searchbar, Chip, Text} from 'react-native-paper';
import axios from "axios";
import {FlashList} from "@shopify/flash-list";


const LookingToScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [filteredTags, setFilteredTags] = useState<string[]>(allTags)

    //get the categories and the tags
    useEffect(() => {
        (async () => {
            try {
                const {categoryAndTagList} = await axios.get("/user/tags").then(response => response.data);
            } catch (error) {
                console.log("Error trying to retrieve tags and tag categories: ", error)
            }
        })()
    }, []);

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
                    keyExtractor={(item) => item} //TODO - we want it to be possible to have duplicate tags in different categories
                    renderItem={({item}) => (
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
            <FlashList data></FlashList>


            {/*<ScrollView style={styles.tagsContainer}>*/}
            {/*    <View style={styles.tagsWrapper}>*/}
            {/*        {filteredTags.map((tag) => (*/}
            {/*            <Chip*/}
            {/*                key={tag}*/}
            {/*                style={[*/}
            {/*                    styles.tag,*/}
            {/*                    selectedTags.includes(tag) && styles.selectedTag,*/}
            {/*                ]}*/}
            {/*                onPress={() => handleTagPress(tag)}*/}
            {/*            >*/}
            {/*                {tag}*/}
            {/*            </Chip>*/}
            {/*        ))}*/}
            {/*    </View>*/}
            {/*</ScrollView>*/}
        </View>
    );

    function handleSearchChange(text: string) {
        setSearchQuery(text);
        setFilteredTags(allTags.filter((tag) =>
            tag.toLowerCase().includes(text.toLowerCase())
        ));

    }

    function handleTagPress(tag: string) {
        console.log("selectedTags.length", selectedTags.length);
        console.log("selectedTags: ", selectedTags);
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter((selectedTag) => selectedTag !== tag));
        } else {
            if (selectedTags.length < 5) {
                setSelectedTags([...selectedTags, tag]);
            }
        }
    };
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
        backgroundColor: '#e0f2f7', // Light blue color for selected tags
    },
    tagsContainer: {
        flex: 1,
    },
    tagsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        margin: 4,
        borderRadius: 16, // Soft edges
    },
});

export default LookingToScreen;
