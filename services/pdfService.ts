
// This assumes pdf.js is loaded from a CDN and available on the window object
declare const pdfjsLib: any;

/**
 * Extracts text content from a PDF file.
 * @param file The PDF file object.
 * @param onProgress Callback to report progress (0 to 100).
 * @returns A promise that resolves to the full text content of the PDF.
 */
export const extractTextFromPdf = async (file: File, onProgress: (progress: number) => void): Promise<string> => {
    if (typeof pdfjsLib === 'undefined') {
        throw new Error('pdf.js library is not loaded. Please check your index.html file.');
    }
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
        onProgress((i / numPages) * 100);
    }

    return fullText;
};
