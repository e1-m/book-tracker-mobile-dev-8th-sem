import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type BookStatus = 'READING' | 'READ' | 'WANT_TO_READ';
type StatusFilter = 'ALL' | 'READING' | 'READ' | 'WANT_TO_READ';

type Book = {
  id: number;
  title: string;
  author: string;
  currentPage: number;
  totalPages: number;
  status: BookStatus;
  tags: string[];
};

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'All statuses', value: 'ALL' },
  { label: 'Reading', value: 'READING' },
  { label: 'Read', value: 'READ' },
  { label: 'Want to read', value: 'WANT_TO_READ' },
];

const MOCK_BOOKS: Book[] = [
  {
    id: 1,
    title: 'Book Title',
    author: 'Author',
    currentPage: 200,
    totalPages: 800,
    status: 'READ',
    tags: ['Tag 1', 'Tag 2', 'Tag 3'],
  },
  {
    id: 2,
    title: 'Book Title',
    author: 'Author',
    currentPage: 50,
    totalPages: 700,
    status: 'READING',
    tags: ['Tag 1', 'Tag 2', 'Tag 3'],
  },
  {
    id: 3,
    title: 'Book Title',
    author: 'Author',
    currentPage: 200,
    totalPages: 800,
    status: 'WANT_TO_READ',
    tags: ['Tag 1', 'Tag 2', 'Tag 3'],
  },
  {
    id: 4,
    title: 'Book Title',
    author: 'Author',
    currentPage: 200,
    totalPages: 800,
    status: 'READ',
    tags: ['Tag 1', 'Tag 2', 'Tag 3'],
  },
  {
    id: 5,
    title: 'Book Title',
    author: 'Author',
    currentPage: 50,
    totalPages: 700,
    status: 'READING',
    tags: ['Tag 1', 'Tag 2', 'Tag 3'],
  },
  {
    id: 6,
    title: 'Book Title',
    author: 'Author',
    currentPage: 200,
    totalPages: 800,
    status: 'WANT_TO_READ',
    tags: ['Tag 1', 'Tag 2', 'Tag 3'],
  },
];

function getStatusLabel(status: BookStatus) {
  switch (status) {
    case 'READ':
      return 'Read';
    case 'READING':
      return 'Reading';
    case 'WANT_TO_READ':
      return 'Want to read';
  }
}

function getStatusColor(status: BookStatus) {
  switch (status) {
    case 'READ':
      return '#44A35F';
    case 'READING':
      return '#C74B4B';
    case 'WANT_TO_READ':
      return '#4A67C7';
  }
}

function LibraryHeader() {
  return <Text style={styles.header}>My Library</Text>;
}

function SearchBar({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={styles.searchBox}>
      <Ionicons name="search" size={16} color="#444" />
      <TextInput
        placeholder="Search..."
        placeholderTextColor="#777"
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

function StatusFilter({
  isOpen,
  selectedLabel,
  onToggle,
  onSelect,
}: {
  isOpen: boolean;
  selectedLabel: string;
  onToggle: () => void;
  onSelect: (value: StatusFilter) => void;
}) {
  return (
    <View style={styles.dropdownWrapper}>
      <Pressable style={styles.filterButton} onPress={onToggle}>
        <Text style={styles.filterButtonText}>{selectedLabel}</Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#444"
        />
      </Pressable>

      {isOpen && (
        <View style={styles.dropdownMenu}>
          {STATUS_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={({ pressed, hovered }) => [
                styles.dropdownItem,
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
  );
}

function TagFilter() {
  return (
    <Pressable style={styles.filterButton}>
      <Text style={styles.filterButtonText}>All tags</Text>
      <Ionicons name="chevron-down" size={16} color="#444" />
    </Pressable>
  );
}

function BookCard({ book }: { book: Book }) {
  const progress = book.currentPage / book.totalPages;

  return (
    <Pressable style={styles.card} onPress={() => router.push('/edit-book')}>
      <View style={styles.bookCover} />

      <Text style={styles.bookName}>{book.title}</Text>
      <Text style={styles.bookAuthor}>{book.author}</Text>

      <View style={styles.progressTrack}>
        <View
          style={[styles.progressFill, { width: `${progress * 100}%` }]}
        />
      </View>

      <Text style={styles.pageCount}>
        {book.currentPage} / {book.totalPages} pages
      </Text>

      <Text style={[styles.statusText, { color: getStatusColor(book.status) }]}>
        {getStatusLabel(book.status)}
      </Text>

      <View style={styles.tagsRow}>
        {book.tags.map((tag) => (
          <Text key={tag} style={styles.tagText}>
            {tag}
          </Text>
        ))}
      </View>
    </Pressable>
  );
}

function BooksGrid({ books }: { books: Book[] }) {
  return (
    <FlatList
      data={books}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.column}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => <BookCard book={item} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

export default function LibraryScreen() {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');
  const [searchValue, setSearchValue] = useState('');

  const filteredBooks = useMemo(() => {
    return MOCK_BOOKS.filter((book) => {
      const matchesStatus =
        selectedStatus === 'ALL' ? true : book.status === selectedStatus;

      const matchesSearch =
        book.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        book.author.toLowerCase().includes(searchValue.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [selectedStatus, searchValue]);

  const selectedStatusLabel =
    STATUS_OPTIONS.find((option) => option.value === selectedStatus)?.label ||
    'All statuses';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <LibraryHeader />

        <SearchBar value={searchValue} onChangeText={setSearchValue} />

        <View style={styles.filtersRow}>
          <StatusFilter
            isOpen={isStatusOpen}
            selectedLabel={selectedStatusLabel}
            onToggle={() => setIsStatusOpen((prev) => !prev)}
            onSelect={(value) => {
              setSelectedStatus(value);
              setIsStatusOpen(false);
            }}
          />

          <TagFilter />
        </View>

        <BooksGrid books={filteredBooks} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '500',
    color: '#222',
    marginBottom: 18,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#222',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 12,
    zIndex: 10,
  },
  dropdownWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 20,
  },
  filterButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterButtonText: {
    color: '#333',
    fontSize: 14,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 46,
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
  dropdownItemHover: {
    backgroundColor: '#E8AFAF',
  },
  dropdownItemPressed: {
    backgroundColor: '#D98F8F',
  },
  listContent: {
    paddingBottom: 20,
  },
  column: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#D9D9D9',
    padding: 12,
    borderRadius: 0,
    minHeight: 280,
  },
  bookCover: {
    width: '100%',
    height: 130,
    backgroundColor: '#695050',
    marginBottom: 10,
  },
  bookName: {
    textAlign: 'center',
    fontSize: 14,
    color: '#222',
    marginBottom: 6,
  },
  bookAuthor: {
    textAlign: 'center',
    fontSize: 13,
    color: '#444',
    marginBottom: 10,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E9B5B5',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E11D1D',
    borderRadius: 999,
  },
  pageCount: {
    fontSize: 12,
    color: '#333',
    marginBottom: 6,
  },
  statusText: {
    fontSize: 13,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#222',
  },
});