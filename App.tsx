
import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ProgressBar } from './components/ProgressBar';
import { DownloadIcon, CheckCircleIcon, AlertTriangleIcon } from './components/Icons';
import { extractTextFromPdf } from './services/pdfService';
import { structureContentWithAI } from './services/geminiService';
import { createEpub } from './services/epubService';
import type { ConversionStep } from './types';

const App: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [currentStep, setCurrentStep] = useState<ConversionStep | ''>('');
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const resetState = () => {
        setFile(null);
        setIsConverting(false);
        setProgress(0);
        setCurrentStep('');
        setDownloadUrl(null);
        setError(null);
    };

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                setError('Invalid file type. Please upload a PDF.');
                setFile(null);
                return;
            }
            setError(null);
            setDownloadUrl(null);
            setFile(selectedFile);
        }
    };

    const updateProgress = (step: ConversionStep, value: number) => {
        setCurrentStep(step);
        setProgress(value);
    };

    const handleConvert = useCallback(async () => {
        if (!file) return;

        setIsConverting(true);
        setError(null);
        setDownloadUrl(null);

        try {
            updateProgress('PARSING_PDF', 10);
            const pdfText = await extractTextFromPdf(file, (p) => updateProgress('PARSING_PDF', 10 + p * 0.3)); // Parsing is 30% of total progress

            updateProgress('ANALYZING_CONTENT', 40);
            const structuredBook = await structureContentWithAI(pdfText, (p) => updateProgress('ANALYZING_CONTENT', 40 + p * 0.5)); // AI is 50%

            updateProgress('CREATING_EPUB', 90);
            const epubBlob = await createEpub(structuredBook);

            updateProgress('COMPLETE', 100);
            setDownloadUrl(URL.createObjectURL(epubBlob));
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during conversion.';
            setError(`Conversion Failed: ${errorMessage}`);
            setProgress(0);
            setCurrentStep('');
        } finally {
            setIsConverting(false);
        }
    }, [file]);

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
                        PDF to EPUB <span className="text-blue-600">AI Converter</span>
                    </h1>
                    <p className="mt-4 text-lg text-slate-600">
                        Transform your PDF documents into structured e-books effortlessly.
                    </p>
                </header>

                <main className="bg-white rounded-xl shadow-2xl p-6 md:p-10 transition-all duration-300">
                    {!downloadUrl ? (
                        <>
                            <FileUpload onFileChange={handleFileChange} disabled={isConverting} file={file} />

                            {isConverting && currentStep && (
                                <div className="mt-8">
                                    <ProgressBar progress={progress} currentStep={currentStep} />
                                </div>
                            )}

                            {error && (
                                <div className="mt-6 flex items-center justify-center bg-red-100 text-red-700 p-3 rounded-lg">
                                    <AlertTriangleIcon className="h-5 w-5 mr-3" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="mt-8 text-center">
                                <button
                                    onClick={handleConvert}
                                    disabled={!file || isConverting}
                                    className="px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
                                >
                                    {isConverting ? 'Converting...' : 'Start Conversion'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                             <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Conversion Successful!</h2>
                            <p className="text-slate-600 mb-8">Your EPUB file is ready for download.</p>
                            <a
                                href={downloadUrl}
                                download={file?.name.replace(/\.pdf$/i, '.epub') || 'converted.epub'}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
                            >
                                <DownloadIcon className="h-6 w-6" />
                                Download EPUB
                            </a>
                            <button
                                onClick={resetState}
                                className="mt-6 text-blue-600 hover:text-blue-800 font-semibold"
                            >
                                Convert Another File
                            </button>
                        </div>
                    )}
                </main>

                <footer className="text-center mt-8 text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} AI Document Tools. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
