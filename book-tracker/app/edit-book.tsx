import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

type BookStatus = 'READING' | 'READ' | 'WANT_TO_READ';

type Book = {
    id: number;
    title: string;
    author: string;
    publishYear: number;
    description: string;
    currentPage: number;
    totalPages: number;
    status: BookStatus;
    tags: string[];
};

const STATUS_OPTIONS: { label: string; value: BookStatus }[] = [
    { label: 'Reading', value: 'READING' },
    { label: 'Read', value: 'READ' },
    { label: 'Want to read', value: 'WANT_TO_READ' },
];

const MOCK_BOOK: Book = {
    id: 1,
    title: 'Harry Potter and the Philosopher’s Stone',
    author: 'J.K. Rowling',
    publishYear: 1997,
    description:
        'A story about a boy who discovers that he is a wizard and begins his journey at Hogwarts.',
    currentPage: 40,
    totalPages: 670,
    status: 'READING',
    tags: ['Fantasy', 'Adventure', 'Magic'],
};

const SUGGESTED_TAGS = ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4'];

export default function EditBookScreen() {
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<BookStatus>(
        MOCK_BOOK.status
    );

    const progress = MOCK_BOOK.currentPage / MOCK_BOOK.totalPages;

    const selectedStatusLabel =
        STATUS_OPTIONS.find((option) => option.value === selectedStatus)?.label ||
        'Choose status';

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.headerRow}>
                    <Pressable style={styles.iconButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color="#222" />
                    </Pressable>

                    <Text style={styles.headerTitle}>Edit Book</Text>

                    <Pressable style={styles.deleteButton}>
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </Pressable>
                </View>

                <View style={styles.topSection}>
                    <View style={styles.cover} />

                    <View style={styles.inputsColumn}>
                        <TextInput
                            value={MOCK_BOOK.title}
                            style={styles.input}
                            placeholder="Title"
                        />
                        <TextInput
                            value={MOCK_BOOK.author}
                            style={styles.input}
                            placeholder="Author"
                        />
                        <TextInput
                            value={String(MOCK_BOOK.publishYear)}
                            style={[styles.input, styles.shortInput]}
                            placeholder="Year"
                        />
                    </View>
                </View>

                <TextInput
                    value={MOCK_BOOK.description}
                    style={styles.descriptionInput}
                    placeholder="Description"
                    multiline
                    textAlignVertical="top"
                />

                <Text style={styles.sectionTitle}>Status</Text>

                <View style={styles.dropdownWrapper}>
                    <Pressable
                        style={styles.selectBox}
                        onPress={() => setIsStatusOpen((prev) => !prev)}
                    >
                        <Text style={styles.selectText}>{selectedStatusLabel}</Text>
                        <Ionicons
                            name={isStatusOpen ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color="#444"
                        />
                    </Pressable>

                    {isStatusOpen && (
                        <View style={styles.dropdownMenu}>
                            {STATUS_OPTIONS.map((option) => (
                                <Pressable
                                    key={option.value}
                                    onPress={() => {
                                        setSelectedStatus(option.value);
                                        setIsStatusOpen(false);
                                    }}
                                    style={({ pressed, hovered }) => [
                                        styles.dropdownItem,
                                        selectedStatus === option.value && styles.dropdownItemActive,
                                        hovered && styles.dropdownItemHover,
                                        pressed && styles.dropdownItemPressed,
                                    ]}
                                >
                                    <Text style={styles.dropdownItemText}>{option.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.pageRow}>
                    <Text style={styles.pageLabel}>Page</Text>
                    <Text style={styles.pageValue}>
                        {MOCK_BOOK.currentPage} / {MOCK_BOOK.totalPages}
                    </Text>
                </View>

                <View style={styles.sliderTrack}>
                    <View style={[styles.sliderFill, { width: `${progress * 100}%` }]} />
                    <View style={[styles.sliderThumb, { left: `${progress * 100}%` }]} />
                </View>

                <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <TextInput
                        value={String(MOCK_BOOK.currentPage)}
                        style={styles.progressSmallInput}
                        keyboardType="numeric"
                    />
                </View>

                <Text style={styles.sectionTitle}>Tags</Text>

                <View style={styles.addTagRow}>
                    <TextInput placeholder="Add tag" style={styles.addTagInput} />
                    <Pressable style={styles.plusButton}>
                        <Ionicons name="add" size={22} color="#222" />
                    </Pressable>
                </View>

                <View style={styles.selectedTagsBox}>
                    {MOCK_BOOK.tags.map((tag) => (
                        <View key={tag} style={styles.selectedTagChip}>
                            <Text style={styles.selectedTagText}>{tag}</Text>
                            <Ionicons name="close" size={14} color="#222" />
                        </View>
                    ))}
                </View>

                <View style={styles.suggestedTagsWrap}>
                    {SUGGESTED_TAGS.map((tag) => (
                        <Pressable key={tag} style={styles.suggestedTagChip}>
                            <Text style={styles.suggestedTagText}>{tag}</Text>
                            <Ionicons name="add" size={14} color="#222" />
                        </Pressable>
                    ))}
                </View>

                <Pressable style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F3F3F3',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
    },
    iconButton: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: '#D9D9D9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '500',
        color: '#222',
    },
    deleteButton: {
        backgroundColor: '#D9D9D9',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    deleteButtonText: {
        fontSize: 14,
        color: '#222',
    },
    topSection: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 20,
    },
    cover: {
        width: 110,
        height: 170,
        backgroundColor: '#695050',
    },
    inputsColumn: {
        flex: 1,
        gap: 12,
    },
    input: {
        backgroundColor: '#D9D9D9',
        borderRadius: 8,
        height: 42,
        paddingHorizontal: 12,
        color: '#222',
    },
    shortInput: {
        width: 120,
    },
    descriptionInput: {
        backgroundColor: '#D9D9D9',
        borderRadius: 14,
        minHeight: 120,
        padding: 12,
        marginBottom: 26,
        color: '#222',
    },
    sectionTitle: {
        fontSize: 28,
        color: '#222',
        marginBottom: 14,
    },
    dropdownWrapper: {
        position: 'relative',
        zIndex: 20,
        marginBottom: 22,
    },
    selectBox: {
        height: 44,
        backgroundColor: '#D9D9D9',
        borderRadius: 8,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectText: {
        color: '#444',
        fontSize: 15,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        backgroundColor: '#F0C7C7',
        borderRadius: 10,
        paddingVertical: 6,
    },
    dropdownItem: {
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#333',
    },
    dropdownItemActive: {
        backgroundColor: '#F0C7C7',
    },
    dropdownItemHover: {
        backgroundColor: '#E8AFAF',
    },
    dropdownItemPressed: {
        backgroundColor: '#D98F8F',
    },
    pageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    pageLabel: {
        fontSize: 16,
        color: '#222',
    },
    pageValue: {
        fontSize: 16,
        color: '#6050E8',
    },
    sliderTrack: {
        position: 'relative',
        height: 6,
        backgroundColor: '#D9D9D9',
        borderRadius: 999,
        marginBottom: 26,
        overflow: 'visible',
    },
    sliderFill: {
        height: '100%',
        backgroundColor: '#C74444',
        borderRadius: 999,
    },
    sliderThumb: {
        position: 'absolute',
        top: -6,
        marginLeft: -8,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#C74444',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    progressLabel: {
        fontSize: 16,
        color: '#222',
    },
    progressSmallInput: {
        width: 80,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#D9D9D9',
        textAlign: 'center',
        color: '#222',
    },
    addTagRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 18,
    },
    addTagInput: {
        flex: 1,
        height: 42,
        backgroundColor: '#D9D9D9',
        borderRadius: 8,
        paddingHorizontal: 12,
        color: '#222',
    },
    plusButton: {
        width: 42,
        height: 42,
        borderRadius: 8,
        backgroundColor: '#D9D9D9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedTagsBox: {
        backgroundColor: '#F0C7C7',
        borderRadius: 10,
        padding: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 22,
    },
    selectedTagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#D9D9D9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    selectedTagText: {
        color: '#222',
        fontSize: 14,
    },
    suggestedTagsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 32,
    },
    suggestedTagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#D9D9D9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    suggestedTagText: {
        color: '#222',
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#E88989',
        height: 46,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: 18,
        color: '#222',
        fontWeight: '500',
    },
});