import { useState, useEffect } from 'react';
import { notifications } from '../api';

export default function Notifications() {
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        const result = await notifications.get();
        if (result.success) {
            setNotifs(result.data);
        }
        setLoading(false);
    };

    const handleMarkAsRead = async (id) => {
        await notifications.markAsRead(id);
        loadNotifications();
    };

    const handleMarkAllAsRead = async () => {
        await notifications.markAllAsRead();
        loadNotifications();
    };

    if (loading) return <p>Loading notifications...</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Notifications</h2>
            <button onClick={handleMarkAllAsRead} style={{ marginBottom: '15px', padding: '8px 15px' }}>
                Mark All as Read
            </button>
            {notifs.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {notifs.map((n) => (
                        <li
                            key={n.id}
                            style={{
                                marginBottom: '10px',
                                padding: '15px',
                                border: '1px solid #ccc',
                                background: n.isRead ? '#f9f9f9' : '#fffbe6',
                            }}
                        >
                            <strong>{n.title}</strong>
                            <span style={{ float: 'right', color: '#888', fontSize: '12px' }}>
                                {new Date(n.createdAt).toLocaleString()}
                            </span>
                            <p>{n.message}</p>
                            <p style={{ fontSize: '12px', color: '#666' }}>Type: {n.type}</p>
                            {!n.isRead && (
                                <button onClick={() => handleMarkAsRead(n.id)} style={{ padding: '5px 10px' }}>
                                    Mark as Read
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No notifications.</p>
            )}
        </div>
    );
}
