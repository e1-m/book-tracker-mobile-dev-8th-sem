import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { socketManager } from '@/services/socket-manager';
import {
    NotificationEvent,
    SocketConnectionState,
} from '@/services/socket-events';

const WS_URL = 'ws://192.168.0.234:8000/notifications';

function ConnectionBadge({ state }: { state: SocketConnectionState }) {
    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{state}</Text>
        </View>
    );
}

function NotificationCard({ item }: { item: NotificationEvent }) {
    return (
        <View style={styles.card}>
            <Text style={styles.cardText}>{item.message}</Text>
            <Text style={styles.cardTime}>
                {new Date(item.createdAt).toLocaleTimeString()}
            </Text>
        </View>
    );
}

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
    const [connectionState, setConnectionState] =
        useState<SocketConnectionState>('DISCONNECTED');

    useEffect(() => {
        socketManager.connect(WS_URL);

        const unsubscribeMessage = socketManager.onMessage((event) => {
            setNotifications((prev) => [event, ...prev]);
        });

        const unsubscribeState = socketManager.onStateChange((state) => {
            setConnectionState(state);
        });

        return () => {
            unsubscribeMessage();
            unsubscribeState();
            socketManager.disconnect();
        };
    }, []);

    return (
        <View style={styles.screen}>
            <View style={styles.headerRow}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color="#222" />
                </Pressable>

                <Text style={styles.headerTitle}>Notifications</Text>

                <View style={styles.headerSpacer} />
            </View>

            <ConnectionBadge state={connectionState} />

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No notifications yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <NotificationCard item={item} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F3F3F3',
        padding: 16,
        paddingTop: 24,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    backButton: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: '#D9D9D9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#222',
    },
    headerSpacer: {
        width: 34,
        height: 34,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: '#D9D9D9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 16,
    },
    badgeText: {
        fontSize: 12,
        color: '#333',
    },
    listContent: {
        paddingBottom: 24,
    },
    card: {
        backgroundColor: '#D9D9D9',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
    },
    cardText: {
        color: '#222',
        fontSize: 15,
        marginBottom: 6,
    },
    cardTime: {
        color: '#666',
        fontSize: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
    },
});