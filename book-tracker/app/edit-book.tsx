import {Ionicons} from '@expo/vector-icons';
import {router, useLocalSearchParams} from 'expo-router';
import {useState, useEffect} from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';

import {BookRepository} from '@/repos/books';
import {TagRepository} from '@/repos/tags';
import {Book, BookStatus} from '@/types/db';

const STATUS_OPTIONS: { label: string; value: BookStatus }[] = [
  {label: 'Reading', value: 'READING'},
  {label: 'Read', value: 'READ'},
  {label: 'Want to read', value: 'WANT_TO_READ'},
];

function EditHeader({onDelete, isNew}: { onDelete: () => void, isNew: boolean }) {
  return (
    <View style={styles.headerRow}>
      <Pressable style={styles.iconButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color="#222"/>
      </Pressable>

      <Text style={styles.headerTitle}>{isNew ? 'Add Book' : 'Edit Book'}</Text>

      {isNew ? (
        <View style={{width: 62}} /* Placeholder to keep header centered */ />
      ) : (
        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      )}
    </View>
  );
}

// ... [Keep BookMainInfo, StatusSection, PageSection, and TagsSection components exactly the same] ...

function BookMainInfo({
                        book,
                        onUpdate,
                      }: {
  book: Book;
  onUpdate: (field: keyof Book, value: any) => void;
}) {
  return (
    <>
      <View style={styles.topSection}>
        <View style={styles.cover}/>

        <View style={styles.inputsColumn}>
          <TextInput
            value={book.title}
            onChangeText={(text) => onUpdate('title', text)}
            style={styles.input}
            placeholder="Title"
          />
          <TextInput
            value={book.author || ''}
            onChangeText={(text) => onUpdate('author', text)}
            style={styles.input}
            placeholder="Author"
          />
          <TextInput
            value={book.publishYear ? String(book.publishYear) : ''}
            onChangeText={(text) => onUpdate('publishYear', parseInt(text) || 0)}
            style={[styles.input, styles.shortInput]}
            placeholder="Year"
            keyboardType="numeric"
          />
        </View>
      </View>

      <TextInput
        value={book.description || ''}
        onChangeText={(text) => onUpdate('description', text)}
        style={styles.descriptionInput}
        placeholder="Description"
        multiline
        textAlignVertical="top"
      />
    </>
  );
}

function StatusSection({
                         isOpen,
                         selectedStatusLabel,
                         selectedStatus,
                         onToggle,
                         onSelect,
                       }: {
  isOpen: boolean;
  selectedStatusLabel: string;
  selectedStatus: BookStatus;
  onToggle: () => void;
  onSelect: (value: BookStatus) => void;
}) {
  return (
    <>
      <Text style={styles.sectionTitle}>Status</Text>

      <View style={styles.dropdownWrapper}>
        <Pressable style={styles.selectBox} onPress={onToggle}>
          <Text style={styles.selectText}>{selectedStatusLabel}</Text>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#444"
          />
        </Pressable>

        {isOpen && (
          <View style={styles.dropdownMenu}>
            {STATUS_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => onSelect(option.value)}
                style={({pressed, hovered}) => [
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
    </>
  );
}

function PageSection({
                       book,
                       onUpdate,
                     }: {
  book: Book;
  onUpdate: (field: keyof Book, value: any) => void;
}) {
  const current = book.currentPage || 0;
  const total = book.totalPages || 1;
  const progress = total > 0 ? current / total : 0;

  return (
    <>
      <View style={styles.pageRow}>
        <Text style={styles.pageLabel}>Page</Text>
        <Text style={styles.pageValue}>
          {current} / {total}
        </Text>
      </View>

      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, {width: `${progress * 100}%`}]}/>
        <View style={[styles.sliderThumb, {left: `${progress * 100}%`}]}/>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>Progress</Text>

        <View style={styles.pageInputGroup}>
          <Text style={styles.progressLabel}>P.</Text>
          <TextInput
            value={String(current)}
            onChangeText={(text) => onUpdate('currentPage', parseInt(text) || 0)}
            style={styles.progressSmallInput}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.pageInputGroup}>
          <Text style={styles.progressLabel}>of</Text>
          <TextInput
            value={String(total)}
            onChangeText={(text) => onUpdate('totalPages', parseInt(text) || 1)}
            style={styles.progressSmallInput}
            keyboardType="numeric"
          />
        </View>
      </View>
    </>
  );
}

function TagsSection({
                       selectedTags,
                       suggestedTags,
                       onAddTag,
                       onRemoveTag,
                     }: {
  selectedTags: string[];
  suggestedTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAddCustom = () => {
    if (inputValue.trim()) {
      onAddTag(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <>
      <Text style={styles.sectionTitle}>Tags</Text>

      <View style={styles.addTagRow}>
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Add tag"
          style={styles.addTagInput}
          onSubmitEditing={handleAddCustom}
        />
        <Pressable style={styles.plusButton} onPress={handleAddCustom}>
          <Ionicons name="add" size={22} color="#222"/>
        </Pressable>
      </View>

      {selectedTags.length > 0 && (
        <View style={styles.selectedTagsBox}>
          {selectedTags.map((tag) => (
            <Pressable key={tag} style={styles.selectedTagChip} onPress={() => onRemoveTag(tag)}>
              <Text style={styles.selectedTagText}>{tag}</Text>
              <Ionicons name="close" size={14} color="#222"/>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.suggestedTagsWrap}>
        {suggestedTags.map((tag) => (
          <Pressable key={tag} style={styles.suggestedTagChip} onPress={() => onAddTag(tag)}>
            <Text style={styles.suggestedTagText}>{tag}</Text>
            <Ionicons name="add" size={14} color="#222"/>
          </Pressable>
        ))}
      </View>
    </>
  );
}


export default function EditBookScreen() {
  const {id} = useLocalSearchParams<{ id: string }>();
  const bookId = Number(id);
  const isNewBook = !bookId || isNaN(bookId); // Determine if we are adding or editing

  const [book, setBook] = useState<Book | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // 1. Always fetch tags so the user has suggestions
        const fetchedTags = await TagRepository.getAllTags();
        setAllTags(fetchedTags.map((t) => t.name));

        if (!isNewBook) {
          // 2a. If editing, fetch the existing book
          const fetchedBook = await BookRepository.getBookById(bookId);
          if (fetchedBook) setBook(fetchedBook);
        } else {
          // 2b. If adding, initialize an empty book state
          setBook({
            id: 0,
            title: '',
            author: '',
            publishYear: new Date().getFullYear(),
            description: '',
            currentPage: 0,
            totalPages: 100, // Reasonable default
            status: 'WANT_TO_READ',
            tags: [],
            coverImageUri: null,
            createdAt: new Date().toISOString(),
          } as Book);
        }
      } catch (error) {
        console.error('Error loading book/tags:', error);
      } finally {
        // Now this ALWAYS runs, removing the infinite load
        setIsLoading(false);
      }
    };

    loadData();
  }, [bookId, isNewBook]);

  const handleUpdateField = (field: keyof Book, value: any) => {
    setBook((prev) => (prev ? {...prev, [field]: value} : null));
  };

  const handleAddTag = (tag: string) => {
    if (!book || book.tags?.includes(tag)) return;
    handleUpdateField('tags', [...(book.tags || []), tag]);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!book) return;
    handleUpdateField(
      'tags',
      (book.tags || []).filter((t) => t !== tagToRemove)
    );
  };

  const handleSave = async () => {
    if (!book) return;
    try {
      setIsSaving(true);

      let finalBookId = bookId;

      if (isNewBook) {
        // Create
        finalBookId = await BookRepository.createBook(book);
      } else {
        // Update
        await BookRepository.updateBook(bookId, book);
        await TagRepository.clearTagsForBook(bookId); // Clear old tags to insert fresh
      }

      // Save Tags
      for (const tagName of book.tags || []) {
        const tagId = await TagRepository.findOrCreateTag(tagName);
        await TagRepository.linkTagToBook(finalBookId, tagId);
      }

      router.back();
    } catch (error) {
      console.error('Failed to save book:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNewBook) return;
    try {
      await BookRepository.deleteBook(bookId);
      router.back();
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color="#6050E8"/>
      </SafeAreaView>
    );
  }

  if (!book) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <Text>Could not load book data.</Text>
        <Pressable onPress={() => router.back()} style={{marginTop: 20}}>
          <Text style={{color: '#6050E8'}}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const selectedStatusLabel =
    STATUS_OPTIONS.find((option) => option.value === book.status)?.label ||
    'Choose status';

  const suggestedTags = allTags.filter((t) => !book.tags?.includes(t));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Pass down isNew flag to hide delete button if adding new */}
        <EditHeader onDelete={handleDelete} isNew={isNewBook}/>

        <BookMainInfo book={book} onUpdate={handleUpdateField}/>

        <StatusSection
          isOpen={isStatusOpen}
          selectedStatusLabel={selectedStatusLabel}
          selectedStatus={book.status}
          onToggle={() => setIsStatusOpen((prev) => !prev)}
          onSelect={(value) => {
            handleUpdateField('status', value);
            setIsStatusOpen(false);
          }}
        />

        <PageSection book={book} onUpdate={handleUpdateField}/>

        <TagsSection
          selectedTags={book.tags || []}
          suggestedTags={suggestedTags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />

        <Pressable
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving || !book.title.trim()} // Prevent saving empty titles
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Keep your existing styles down here!
  safeArea: {flex: 1, backgroundColor: '#F3F3F3'},
  center: {justifyContent: 'center', alignItems: 'center'},
  content: {padding: 20, paddingBottom: 40},
  headerRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28},
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {fontSize: 24, fontWeight: '500', color: '#222'},
  deleteButton: {backgroundColor: '#D9D9D9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8},
  deleteButtonText: {fontSize: 14, color: '#222'},
  topSection: {flexDirection: 'row', gap: 14, marginBottom: 20},
  cover: {width: 110, height: 170, backgroundColor: '#695050'},
  inputsColumn: {flex: 1, gap: 12},
  input: {backgroundColor: '#D9D9D9', borderRadius: 8, height: 42, paddingHorizontal: 12, color: '#222'},
  shortInput: {width: 120},
  descriptionInput: {
    backgroundColor: '#D9D9D9',
    borderRadius: 14,
    minHeight: 120,
    padding: 12,
    marginBottom: 26,
    color: '#222'
  },
  sectionTitle: {fontSize: 28, color: '#222', marginBottom: 14},
  dropdownWrapper: {position: 'relative', zIndex: 20, marginBottom: 22},
  selectBox: {
    height: 44,
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  selectText: {color: '#444', fontSize: 15},
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#F0C7C7',
    borderRadius: 10,
    paddingVertical: 6
  },
  dropdownItem: {paddingHorizontal: 12, paddingVertical: 10},
  dropdownItemText: {fontSize: 14, color: '#333'},
  dropdownItemActive: {backgroundColor: '#F0C7C7'},
  dropdownItemHover: {backgroundColor: '#E8AFAF'},
  dropdownItemPressed: {backgroundColor: '#D98F8F'},
  pageRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12},
  pageLabel: {fontSize: 16, color: '#222'},
  pageValue: {fontSize: 16, color: '#6050E8'},
  sliderTrack: {
    position: 'relative',
    height: 6,
    backgroundColor: '#D9D9D9',
    borderRadius: 999,
    marginBottom: 26,
    overflow: 'visible'
  },
  sliderFill: {height: '100%', backgroundColor: '#C74444', borderRadius: 999},
  sliderThumb: {
    position: 'absolute',
    top: -6,
    marginLeft: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#C74444'
  },
  progressRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30},
  progressLabel: {fontSize: 16, color: '#222'},
  pageInputGroup: {flexDirection: 'row', alignItems: 'center', gap: 8},
  progressSmallInput: {
    width: 80,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#D9D9D9',
    textAlign: 'center',
    color: '#222'
  },
  addTagRow: {flexDirection: 'row', gap: 10, marginBottom: 18},
  addTagInput: {flex: 1, height: 42, backgroundColor: '#D9D9D9', borderRadius: 8, paddingHorizontal: 12, color: '#222'},
  plusButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedTagsBox: {
    backgroundColor: '#F0C7C7',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22
  },
  selectedTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D9D9D9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  selectedTagText: {color: '#222', fontSize: 14},
  suggestedTagsWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32},
  suggestedTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D9D9D9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20
  },
  suggestedTagText: {color: '#222', fontSize: 14},
  saveButton: {backgroundColor: '#E88989', height: 46, borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
  saveButtonDisabled: {opacity: 0.7},
  saveButtonText: {fontSize: 18, color: '#222', fontWeight: '500'},
});