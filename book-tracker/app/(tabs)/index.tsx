import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Book = {
  id: number;
  title: string;
  currentPage: number;
  totalPages: number;
};

const MOCK_CURRENT_BOOKS: Book[] = [
  {
    id: 1,
    title: 'Harry Potter',
    currentPage: 50,
    totalPages: 200,
  },
  {
    id: 2,
    title: 'The Hobbit',
    currentPage: 90,
    totalPages: 310,
  },
];

export default function HomeScreen() {
  const currentBook = MOCK_CURRENT_BOOKS[0];
  const progress = currentBook.currentPage / currentBook.totalPages;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>
          You are reading {MOCK_CURRENT_BOOKS.length} books
        </Text>

        <View style={styles.cardWrapper}>
          <Pressable style={styles.arrowButton}>
            <Ionicons name="chevron-back" size={18} color="#fff" />
          </Pressable>

          <View style={styles.card}>
            <View style={styles.cover} />

            <View style={styles.info}>
              <Text style={styles.bookTitle}>{currentBook.title}</Text>

              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>

              <Text style={styles.pagesText}>
                {currentBook.currentPage} / {currentBook.totalPages} pages
              </Text>


            </View>
          </View>

          <Pressable style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: '#222',
    marginBottom: 40,
  },
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#C96D6D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    marginHorizontal: 12,
    minHeight: 410,
    backgroundColor: '#DCDCDC',
    borderRadius: 36,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cover: {
    width: 110,
    height: 260,
    backgroundColor: '#695050',
    borderRadius: 4,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 28,
    color: '#222',
    marginBottom: 40,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E9B5B5',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E11D1D',
    borderRadius: 999,
  },
  pagesText: {
    fontSize: 24,
    color: '#222',
    marginBottom: 30,
  },
  editButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#E88989',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  editButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '500',
  },
});