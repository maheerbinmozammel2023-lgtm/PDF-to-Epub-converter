
import React, { useState, useCallback } from 'react';
import { UploadCloudIcon, FileIcon } from './Icons';

interface FileUploadProps {
    onFileChange: (file: File | null) => void;
    disabled: boolean;
    file: File | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, disabled, file }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            onFileChange(files[0]);
        }
    }, [disabled, onFileChange]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileChange(files[0]);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const baseClasses = "relative block w-full border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-300";
    const draggingClasses = "border-blue-500 bg-blue-50";
    const idleClasses = "border-slate-300 hover:border-blue-400 bg-slate-50";

    if (file && !disabled) {
        return (
            <div className="border border-slate-200 bg-white rounded-lg p-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <FileIcon className="h-10 w-10 text-blue-500" />
                    <div>
                        <p className="font-semibold text-slate-800">{file.name}</p>
                        <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                </div>
                <button
                    onClick={() => onFileChange(null)}
                    className="text-slate-500 hover:text-red-500 font-semibold transition-colors"
                    aria-label="Remove file"
                >
                    &times;
                </button>
            </div>
        );
    }

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${baseClasses} ${isDragging ? draggingClasses : idleClasses}`}
        >
            <input
                type="file"
                id="file-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileSelect}
                accept=".pdf"
                disabled={disabled}
            />
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-400" />
                <span className="mt-4 text-lg font-semibold text-slate-700">
                    Drop your PDF here or <span className="text-blue-600">browse</span>
                </span>
                <span className="mt-1 text-sm text-slate-500">Maximum file size: 50MB</span>
            </label>
        </div>
    );
};
