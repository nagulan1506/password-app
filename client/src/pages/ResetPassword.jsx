import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ResetPassword() {
    const { token } = useParams();
    const nav = useNavigate();
    const [form, setForm] = useState({ password: '', confirm: '' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isValidToken, setIsValidToken] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Verify token on mount
        fetch(`${API_URL}/reset/${token}`)
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    setIsValidToken(true);
                } else {
                    setError(data.error || 'Invalid or expired token');
                }
            })
            .catch(() => setError('Failed to verify token'))
            .finally(() => setChecking(false));
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) {
            return setError('Passwords do not match');
        }
        setError('');
        setMessage('');
        try {
            const res = await fetch(`${API_URL}/reset/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: form.password, confirm: form.confirm })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to reset password');
            setMessage('Password has been reset successfully. You can now log in.');
            setTimeout(() => nav('/login'), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    if (checking) return <Container className="mt-5 text-center">Loading...</Container>;

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '400px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Reset Password</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {message && <Alert variant="success">{message}</Alert>}
                    {!isValidToken ? (
                        <div className="text-center">
                            <Link to="/forgot">Request a new reset link</Link>
                        </div>
                    ) : (
                        !message && <Form onSubmit={handleSubmit}>
                            <Form.Group id="password" className="mb-3">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control type="password" required minLength="6" onChange={(e) => setForm({ ...form, password: e.target.value })} />
                            </Form.Group>
                            <Form.Group id="confirm-password" className="mb-3">
                                <Form.Label>Confirm New Password</Form.Label>
                                <Form.Control type="password" required minLength="6" onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
                            </Form.Group>
                            <Button className="w-100" type="submit">Update Password</Button>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}
