
export interface EpubChapter {
    title: string;
    content: string; // Should be well-formed XHTML content
}

export interface StructuredBook {
    title: string;
    author: string;
    chapters: EpubChapter[];
}

export type ConversionStep = 'PARSING_PDF' | 'ANALYZING_CONTENT' | 'CREATING_EPUB' | 'COMPLETE';
