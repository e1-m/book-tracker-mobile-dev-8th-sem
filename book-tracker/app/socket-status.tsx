import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { socketManager } from '@/services/socket-manager';
import {
    NotificationEvent,
    SocketConnectionState,
} from '@/services/socket-events';

const WS_URL = 'ws://192.168.0.183:8000/notifications';

export default function SocketStatusScreen() {
    const [connectionState, setConnectionState] =
        useState<SocketConnectionState>('DISCONNECTED');
    const [lastMessage, setLastMessage] = useState<NotificationEvent | null>(null);

    useEffect(() => {
        const unsubscribeState = socketManager.onStateChange((state) => {
            setConnectionState(state);
        });

        const unsubscribeMessage = socketManager.onMessage((event) => {
            setLastMessage(event);
        });

        return () => {
            unsubscribeState();
            unsubscribeMessage();
        };
    }, []);

    return (
        <View style={styles.screen}>
            <View style={styles.headerRow}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color="#222" />
                </Pressable>

                <Text style={styles.headerTitle}>Socket Status</Text>

                <View style={styles.headerSpacer} />
            </View>

            <Text style={styles.label}>Connection state</Text>
            <Text style={styles.value}>{connectionState}</Text>

            <Text style={styles.label}>Last message</Text>
            <Text style={styles.value}>
                {lastMessage ? lastMessage.message : 'No messages yet'}
            </Text>

            <View style={styles.buttonsRow}>
                <Pressable
                    style={styles.button}
                    onPress={() => socketManager.connect(WS_URL)}
                >
                    <Text style={styles.buttonText}>Connect</Text>
                </Pressable>

                <Pressable
                    style={styles.button}
                    onPress={() => socketManager.disconnect()}
                >
                    <Text style={styles.buttonText}>Disconnect</Text>
                </Pressable>
            </View>
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
    header: {
        fontSize: 28,
        fontWeight: '600',
        color: '#222',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#444',
        marginTop: 10,
    },
    value: {
        fontSize: 18,
        color: '#222',
        marginTop: 4,
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    button: {
        backgroundColor: '#4A67C7',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
    },
    secondaryButton: {
        marginTop: 16,
        backgroundColor: '#C96D6D',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
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
});