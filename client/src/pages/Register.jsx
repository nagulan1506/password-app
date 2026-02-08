import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Register() {
    const nav = useNavigate();
    const [form, setForm] = useState({ email: '', password: '', confirm: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) {
            return setError('Passwords do not match');
        }
        setError('');
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: form.email, password: form.password, confirm: form.confirm })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            nav('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '400px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Register</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email" className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </Form.Group>
                        <Form.Group id="password" className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" required onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        </Form.Group>
                        <Form.Group id="confirm-password" className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control type="password" required onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
                        </Form.Group>
                        <Button className="w-100" type="submit">Sign Up</Button>
                    </Form>
                    <div className="w-100 text-center mt-2">
                        Already have an account? <Link to="/login">Log In</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
