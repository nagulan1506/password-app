import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/forgot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to send reset email');
            setMessage('Check your inbox for further instructions');
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '400px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Password Reset</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {message && <Alert variant="success">{message}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email" className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" required onChange={(e) => setEmail(e.target.value)} />
                        </Form.Group>
                        <Button className="w-100" type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Reset Password'}
                        </Button>
                    </Form>
                    <div className="w-100 text-center mt-3">
                        <Link to="/login">Login</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
