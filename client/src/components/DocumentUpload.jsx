import React, { useState, useCallback } from 'react';
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import { useWallet } from '../hooks/useWallet';
import { Card } from './ui/Card';

// Configure IPFS - you might want to use your own IPFS node or Infura
const projectId = 'YOUR_INFURA_PROJECT_ID';
const projectSecret = 'YOUR_INFURA_PROJECT_SECRET';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

const DocumentUpload = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const { contract } = useWallet();

    const onFileChange = (e) => {
        setFiles(Array.from(e.target.files));
        setUploadError(null);
    };

    const uploadToIPFS = async (file) => {
        try {
            const added = await ipfs.add(file);
            return added.path;
        } catch (error) {
            console.error('IPFS upload error:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setUploadError(null);

        try {
            const uploadPromises = files.map(uploadToIPFS);
            const ipfsHashes = await Promise.all(uploadPromises);
            
            // Combine all document hashes
            const combinedHash = ipfsHashes.join(',');
            
            // Submit to smart contract
            const tx = await contract.submitDocuments(combinedHash);
            await tx.wait();
            
            alert('Documents uploaded successfully!');
            setFiles([]);
        } catch (error) {
            console.error('Upload error:', error);
            setUploadError('Failed to upload documents. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Document Upload</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2">Required Documents</label>
                    <input
                        type="file"
                        multiple
                        onChange={onFileChange}
                        className="w-full p-2 border rounded"
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Upload your ID proof, grade sheets, and income certificates
                    </p>
                </div>

                {files.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-semibold">Selected Files:</h3>
                        <ul className="list-disc pl-5">
                            {files.map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {uploadError && (
                    <div className="text-red-500 text-sm">{uploadError}</div>
                )}

                <button
                    type="submit"
                    disabled={uploading || files.length === 0}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {uploading ? 'Uploading...' : 'Upload Documents'}
                </button>
            </form>
        </Card>
    );
};

export default DocumentUpload; 