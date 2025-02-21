import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { Card } from './ui/Card';

const AdminDashboard = () => {
    const [pendingApplications, setPendingApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { contract } = useWallet();

    const [newScholarship, setNewScholarship] = useState({
        name: '',
        amount: '',
        deadline: '',
        maxRecipients: ''
    });

    useEffect(() => {
        loadPendingApplications();
    }, [contract]);

    const loadPendingApplications = async () => {
        try {
            setLoading(true);
            // Implementation will depend on your contract events/structure
            // This is a simplified version
            const applications = await contract.getPendingApplications();
            setPendingApplications(applications);
        } catch (err) {
            setError('Failed to load applications');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyStudent = async (studentAddress) => {
        try {
            const tx = await contract.verifyStudent(studentAddress);
            await tx.wait();
            alert('Student verified successfully!');
            loadPendingApplications(); // Refresh the list
        } catch (err) {
            alert('Failed to verify student');
            console.error(err);
        }
    };

    const handleCreateScholarship = async (e) => {
        e.preventDefault();
        try {
            const deadline = Math.floor(new Date(newScholarship.deadline).getTime() / 1000);
            const tx = await contract.createScholarship(
                newScholarship.name,
                newScholarship.amount,
                deadline,
                newScholarship.maxRecipients
            );
            await tx.wait();
            alert('Scholarship created successfully!');
            setNewScholarship({ name: '', amount: '', deadline: '', maxRecipients: '' });
        } catch (err) {
            alert('Failed to create scholarship');
            console.error(err);
        }
    };

    return (
        <div className="space-y-8">
            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Create New Scholarship</h2>
                <form onSubmit={handleCreateScholarship} className="space-y-4">
                    <div>
                        <label className="block mb-2">Scholarship Name</label>
                        <input
                            type="text"
                            value={newScholarship.name}
                            onChange={(e) => setNewScholarship({...newScholarship, name: e.target.value})}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Amount (USDT)</label>
                        <input
                            type="number"
                            value={newScholarship.amount}
                            onChange={(e) => setNewScholarship({...newScholarship, amount: e.target.value})}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Deadline</label>
                        <input
                            type="date"
                            value={newScholarship.deadline}
                            onChange={(e) => setNewScholarship({...newScholarship, deadline: e.target.value})}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Maximum Recipients</label>
                        <input
                            type="number"
                            value={newScholarship.maxRecipients}
                            onChange={(e) => setNewScholarship({...newScholarship, maxRecipients: e.target.value})}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Create Scholarship
                    </button>
                </form>
            </Card>

            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Pending Verifications</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <div className="space-y-4">
                        {pendingApplications.map((application, index) => (
                            <div key={index} className="border p-4 rounded">
                                <p>Student Address: {application.studentAddress}</p>
                                <p>University ID: {application.universityId}</p>
                                <p>Documents: <a href={`https://ipfs.io/ipfs/${application.documentsHash}`} target="_blank" rel="noopener noreferrer">View Documents</a></p>
                                <button
                                    onClick={() => handleVerifyStudent(application.studentAddress)}
                                    className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Verify Student
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminDashboard; 