import {Ionicons} from '@expo/vector-icons';
import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {BookRepository} from "@/repos/books";
import {Book} from "@/types/db";

function ReadingHeader({count}: { count: number }) {
  return (
    <Text style={styles.title}>
      You are reading {count} books
    </Text>
  );
}

function ReadingCard({
                       book,
                       onPrev,
                       onNext,
                     }: {
  book: Book;
  onPrev: () => void;
  onNext: () => void;
}) {
  const progress = book.currentPage / book.totalPages;

  return (
    <View style={styles.cardWrapper}>
      <Pressable style={styles.arrowButton} onPress={onPrev}>
        <Ionicons name="chevron-back" size={18} color="#fff"/>
      </Pressable>

      <View style={styles.card}>
        <View style={styles.cover}/>

        <View style={styles.info}>
          <Text style={styles.bookTitle}>{book.title}</Text>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, {width: `${progress * 100}%`}]}
            />
          </View>

          <Text style={styles.pagesText}>
            {book.currentPage} / {book.totalPages} pages
          </Text>
        </View>
      </View>

      <Pressable style={styles.arrowButton} onPress={onNext}>
        <Ionicons name="chevron-forward" size={18} color="#fff"/>
      </Pressable>
    </View>
  );
}

function ReadingCarousel() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const readingBooks = await BookRepository.getReadingBooks();
        setBooks(readingBooks);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Error fetching reading books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? books.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === books.length - 1 ? 0 : prev + 1
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff"/>
      </View>
    );
  }

  if (books.length === 0) {
    return (
      <View style={styles.container}>
        <ReadingHeader count={0}/>
        <View style={styles.centeredContainer}>
          <Text style={styles.emptyText}>You aren't reading any books right now.</Text>
        </View>
      </View>
    );
  }

  const currentBook = books[currentIndex];

  return (
    <View style={styles.container}>
      <ReadingHeader count={books.length}/>
      <ReadingCard
        book={currentBook}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </View>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.screenContainer}>
      <ReadingCarousel/>
    </View>
  );
}
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    paddingTop: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  centeredContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
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
});