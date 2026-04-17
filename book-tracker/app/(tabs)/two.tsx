import {Ionicons} from '@expo/vector-icons';
import {router, useFocusEffect} from 'expo-router';
import {useMemo, useState, useCallback} from 'react';
import {FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, ActivityIndicator} from 'react-native';

import {BookRepository} from '@/repos/books';
import {TagRepository} from '@/repos/tags';
import {Book, Tag} from '@/types/db';

type BookStatus = 'READING' | 'READ' | 'WANT_TO_READ';
type StatusFilter = 'ALL' | BookStatus;

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  {label: 'All statuses', value: 'ALL'},
  {label: 'Reading', value: 'READING'},
  {label: 'Read', value: 'READ'},
  {label: 'Want to read', value: 'WANT_TO_READ'},
];

function getStatusLabel(status: string) {
  switch (status) {
    case 'READ':
      return 'Read';
    case 'READING':
      return 'Reading';
    case 'WANT_TO_READ':
      return 'Want to read';
    default:
      return status;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'READ':
      return '#44A35F';
    case 'READING':
      return '#C74B4B';
    case 'WANT_TO_READ':
      return '#4A67C7';
    default:
      return '#333';
  }
}

function LibraryHeader() {
  return <Text style={styles.header}>My Library</Text>;
}

function SearchBar({value, onChangeText}: { value: string; onChangeText: (text: string) => void; }) {
  return (
    <View style={styles.searchBox}>
      <Ionicons name="search" size={16} color="#444"/>
      <TextInput placeholder="Search..." placeholderTextColor="#777" style={styles.searchInput} value={value}
                 onChangeText={onChangeText}/>
    </View>
  );
}

function DropdownFilter({isOpen, selectedLabel, options, onToggle, onSelect}: {
  isOpen: boolean;
  selectedLabel: string;
  options: { label: string; value: string }[];
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.dropdownWrapper}>
      <Pressable style={styles.filterButton} onPress={onToggle}>
        <Text style={styles.filterButtonText} numberOfLines={1}>{selectedLabel}</Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#444"/>
      </Pressable>

      {isOpen && (
        <View style={styles.dropdownMenu}>
          {options.map((option) => (
            <Pressable key={option.value} onPress={() => onSelect(option.value)} style={({
                                                                                           pressed,
                                                                                           hovered
                                                                                         }) => [styles.dropdownItem, hovered && styles.dropdownItemHover, pressed && styles.dropdownItemPressed]}>
              <Text style={styles.dropdownItemText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function BookCard({book}: { book: Book }) {
  const current = book.currentPage || 0;
  const total = book.totalPages || 1;
  const progress = total > 0 ? current / total : 0;

  return (
    <Pressable style={styles.card} onPress={() => router.push({pathname: '/edit-book', params: {id: book.id}})}>
      <View style={styles.bookCover}/>

      <Text style={styles.bookName}>{book.title}</Text>
      <Text style={styles.bookAuthor}>{book.author}</Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, {width: `${progress * 100}%`}]}/>
      </View>

      <Text style={styles.pageCount}>
        {current} / {total} pages
      </Text>

      <Text style={[styles.statusText, {color: getStatusColor(book.status)}]}>
        {getStatusLabel(book.status)}
      </Text>

      <View style={styles.tagsRow}>
        {(book.tags || []).map((tag: string) => (
          <Text key={tag} style={styles.tagText}>{tag}</Text>
        ))}
      </View>
    </Pressable>
  );
}

function BooksGrid({books}: { books: Book[] }) {
  return (
    <FlatList
      data={books}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.column}
      contentContainerStyle={styles.listContent}
      renderItem={({item}) => <BookCard book={item}/>}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No books found.</Text>
        </View>
      }
    />
  );
}

function AddBookButton() {
  return (
    <Pressable style={({pressed}) => [styles.fab, pressed && styles.fabPressed]}
               onPress={() => router.push('/edit-book')}>
      <Ionicons name="add" size={28} color="#FFF"/>
    </Pressable>
  );
}

export default function LibraryScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isTagOpen, setIsTagOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [searchValue, setSearchValue] = useState('');

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          setIsLoading(true);
          const [fetchedBooks, fetchedTags] = await Promise.all([
            BookRepository.getAllBooks(),
            TagRepository.getAllTags()
          ]);
          setBooks(fetchedBooks);
          setTags(fetchedTags);
        } catch (error) {
          console.error("Failed to load library data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }, [])
  );

  const handleToggleStatus = () => {
    setIsStatusOpen((prev) => !prev);
    if (!isStatusOpen) setIsTagOpen(false);
  };

  const handleToggleTag = () => {
    setIsTagOpen((prev) => !prev);
    if (!isTagOpen) setIsStatusOpen(false);
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesStatus = selectedStatus === 'ALL' ? true : book.status === selectedStatus;
      const matchesTag = selectedTag === 'ALL' ? true : (book.tags || []).includes(selectedTag);
      const titleMatch = book.title?.toLowerCase().includes(searchValue.toLowerCase());
      const authorMatch = book.author?.toLowerCase().includes(searchValue.toLowerCase());

      return matchesStatus && (titleMatch || authorMatch) && matchesTag;
    });
  }, [books, selectedStatus, searchValue, selectedTag]);

  const selectedStatusLabel = STATUS_OPTIONS.find((option) => option.value === selectedStatus)?.label || 'All statuses';
  const tagOptions = [{label: 'All tags', value: 'ALL'}, ...tags.map(t => ({label: t.name, value: t.name}))];
  const selectedTagLabel = tagOptions.find((option) => option.value === selectedTag)?.label || 'All tags';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <LibraryHeader/>
        <SearchBar value={searchValue} onChangeText={setSearchValue}/>

        <View style={styles.filtersRow}>
          <DropdownFilter isOpen={isStatusOpen} selectedLabel={selectedStatusLabel} options={STATUS_OPTIONS}
                          onToggle={handleToggleStatus} onSelect={(value) => {
            setSelectedStatus(value as StatusFilter);
            setIsStatusOpen(false);
          }}/>
          <DropdownFilter isOpen={isTagOpen} selectedLabel={selectedTagLabel} options={tagOptions}
                          onToggle={handleToggleTag} onSelect={(value) => {
            setSelectedTag(value);
            setIsTagOpen(false);
          }}/>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A67C7"/>
          </View>
        ) : (
          <BooksGrid books={filteredBooks}/>
        )}

        <AddBookButton/>
      </View>
    </SafeAreaView>
  );
}

// Ensure you paste your exact `const styles = StyleSheet.create({...})` from the original `two.tsx` here.
const styles = StyleSheet.create({
  // Your styles remain identical.
  safeArea: {flex: 1, backgroundColor: '#F3F3F3'},
  screen: {flex: 1, paddingHorizontal: 16, paddingTop: 20, position: 'relative'},
  header: {fontSize: 28, fontWeight: '500', color: '#222', marginBottom: 18},
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 16
  },
  searchInput: {flex: 1, marginLeft: 8, fontSize: 14, color: '#222'},
  filtersRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18, gap: 12, zIndex: 10},
  dropdownWrapper: {flex: 1, position: 'relative', zIndex: 20},
  filterButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  filterButtonText: {color: '#333', fontSize: 14, flex: 1},
  dropdownMenu: {
    position: 'absolute',
    top: 46,
    left: 0,
    right: 0,
    backgroundColor: '#F0C7C7',
    borderRadius: 10,
    paddingVertical: 6,
    maxHeight: 200
  },
  dropdownItem: {paddingHorizontal: 12, paddingVertical: 10},
  dropdownItemText: {fontSize: 14, color: '#333'},
  dropdownItemHover: {backgroundColor: '#E8AFAF'},
  dropdownItemPressed: {backgroundColor: '#D98F8F'},
  listContent: {paddingBottom: 80},
  column: {gap: 12, marginBottom: 12},
  card: {flex: 1, backgroundColor: '#D9D9D9', padding: 12, borderRadius: 0, minHeight: 280},
  bookCover: {width: '100%', height: 130, backgroundColor: '#695050', marginBottom: 10},
  bookName: {textAlign: 'center', fontSize: 14, color: '#222', marginBottom: 6},
  bookAuthor: {textAlign: 'center', fontSize: 13, color: '#444', marginBottom: 10},
  progressTrack: {height: 6, backgroundColor: '#E9B5B5', borderRadius: 999, overflow: 'hidden', marginBottom: 8},
  progressFill: {height: '100%', backgroundColor: '#E11D1D', borderRadius: 999},
  pageCount: {fontSize: 12, color: '#333', marginBottom: 6},
  statusText: {fontSize: 13, marginBottom: 8},
  tagsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  tagText: {fontSize: 12, color: '#222'},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyContainer: {flex: 1, marginTop: 40, alignItems: 'center'},
  emptyText: {color: '#666', fontSize: 16},
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A67C7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 100
  },
  fabPressed: {backgroundColor: '#3852a3', transform: [{scale: 0.96}]}
});