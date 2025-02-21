import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { Card } from './ui/Card';

const ScholarshipApplication = () => {
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { contract } = useWallet();

    useEffect(() => {
        loadScholarships();
    }, [contract]);

    const loadScholarships = async () => {
        try {
            setLoading(true);
            const count = await contract.scholarshipCount();
            const scholarshipPromises = [];

            for (let i = 0; i < count; i++) {
                scholarshipPromises.push(contract.scholarships(i));
            }

            const results = await Promise.all(scholarshipPromises);
            const activeScholarships = results.map((scholarship, index) => ({
                id: index,
                name: scholarship.name,
                amount: scholarship.amount,
                deadline: new Date(scholarship.deadline * 1000),
                isActive: scholarship.isActive,
                maxRecipients: scholarship.maxRecipients,
                currentRecipients: scholarship.currentRecipients
            })).filter(s => s.isActive);

            setScholarships(activeScholarships);
        } catch (err) {
            setError('Failed to load scholarships');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (scholarshipId) => {
        try {
            const tx = await contract.applyForScholarship(scholarshipId);
            await tx.wait();
            alert('Application submitted successfully!');
            loadScholarships(); // Refresh the list
        } catch (err) {
            alert('Failed to submit application. Please try again.');
            console.error(err);
        }
    };

    if (loading) return <div>Loading scholarships...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Available Scholarships</h2>
            {scholarships.length === 0 ? (
                <Card>
                    <p className="text-gray-500">No active scholarships available.</p>
                </Card>
            ) : (
                scholarships.map(scholarship => (
                    <Card key={scholarship.id} className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-semibold">{scholarship.name}</h3>
                                <p className="text-gray-600">
                                    Amount: {scholarship.amount.toString()} USDT
                                </p>
                                <p className="text-gray-600">
                                    Deadline: {scholarship.deadline.toLocaleDateString()}
                                </p>
                                <p className="text-gray-600">
                                    Available Slots: {scholarship.maxRecipients - scholarship.currentRecipients}
                                </p>
                            </div>
                            <button
                                onClick={() => handleApply(scholarship.id)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Apply Now
                            </button>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
};

export default ScholarshipApplication; 