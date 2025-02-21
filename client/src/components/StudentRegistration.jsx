import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { Card } from './ui/Card';

const StudentRegistration = () => {
    const [name, setName] = useState('');
    const [universityId, setUniversityId] = useState('');
    const [loading, setLoading] = useState(false);
    const { contract, account } = useWallet();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const tx = await contract.registerStudent(name, universityId);
            await tx.wait();
            alert('Registration successful!');
        } catch (error) {
            console.error(error);
            alert('Registration failed!');
        }
        setLoading(false);
    };

    return (
        <Card className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Student Registration</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2">Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-2">University ID</label>
                    <input
                        type="text"
                        value={universityId}
                        onChange={(e) => setUniversityId(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </Card>
    );
};

export default StudentRegistration; 