import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert } from 'react-bootstrap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const nav = useNavigate();

    useEffect(() => {
        fetch(`${API_URL}/me`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user);
                else nav('/login');
            })
            .catch(() => setError('Failed to fetch user data'));
    }, [nav]);

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
            nav('/login');
        } catch {
            setError('Failed to log out');
        }
    };

    if (!user) return <Container className="mt-5 text-center">Loading...</Container>;

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card className="w-100" style={{ maxWidth: '400px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Dashboard</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <div className="text-center">
                        <strong>Email:</strong> {user.email}
                    </div>
                    <Button variant="link" onClick={handleLogout} className="w-100 mt-3">
                        Log Out
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
}
