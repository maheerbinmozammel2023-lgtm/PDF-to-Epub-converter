
import React from 'react';
import type { ConversionStep } from '../types';

interface ProgressBarProps {
    progress: number;
    currentStep: ConversionStep | '';
}

const stepMessages: Record<ConversionStep, string> = {
    PARSING_PDF: 'Reading and parsing your PDF document...',
    ANALYZING_CONTENT: 'AI is analyzing and structuring the content...',
    CREATING_EPUB: 'Assembling your EPUB file...',
    COMPLETE: 'Conversion complete!',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, currentStep }) => {
    return (
        <div className="w-full">
            <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-blue-700">
                    {currentStep ? stepMessages[currentStep] : 'Starting...'}
                </span>
                <span className="text-sm font-medium text-blue-700">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4">
                <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};
