import React, { useState, useEffect } from 'react';
import { useEthereum } from '../hooks/useEthereum';
import { Card, Button, Alert } from '../components/ui';

const StudentDashboard = () => {
  const [scholarships, setScholarships] = useState([]);
  const { account, contract } = useEthereum();

  useEffect(() => {
    // Fetch available scholarships
    const fetchScholarships = async () => {
      // Implementation here
    };
    
    fetchScholarships();
  }, [contract]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scholarships.map((scholarship) => (
          <Card key={scholarship.id}>
            {/* Scholarship details */}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard; 