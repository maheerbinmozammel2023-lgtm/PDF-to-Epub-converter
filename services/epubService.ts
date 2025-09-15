
import type { StructuredBook } from '../types';

// This assumes JSZip is loaded from a CDN and available on the window object
declare const JSZip: any;

const createContainerXml = () => `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

const createContentOpf = (book: StructuredBook) => {
    const manifestItems = book.chapters
        .map((_, i) => `<item id="chapter${i + 1}" href="chapter${i + 1}.xhtml" media-type="application/xhtml+xml"/>`)
        .join('\n    ');

    const spineItems = book.chapters
        .map((_, i) => `<itemref idref="chapter${i + 1}"/>`)
        .join('\n    ');

    const uuid = `urn:uuid:${crypto.randomUUID()}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<package version="2.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${book.title}</dc:title>
    <dc:creator opf:role="aut">${book.author}</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="book-id">${uuid}</dc:identifier>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="css" href="style.css" media-type="text/css"/>
    ${manifestItems}
  </manifest>
  <spine toc="ncx">
    ${spineItems}
  </spine>
</package>`;
};

const createTocNcx = (book: StructuredBook) => {
    const navPoints = book.chapters
        .map((chapter, i) => `
    <navPoint id="navPoint-${i + 1}" playOrder="${i + 1}">
      <navLabel>
        <text>${chapter.title}</text>
      </navLabel>
      <content src="chapter${i + 1}.xhtml"/>
    </navPoint>`)
        .join('');
    
    const uuid = `urn:uuid:${crypto.randomUUID()}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx version="2005-1" xmlns="http://www.daisy.org/z3986/2005/ncx/">
  <head>
    <meta name="dtb:uid" content="${uuid}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${book.title}</text>
  </docTitle>
  <navMap>
    ${navPoints}
  </navMap>
</ncx>`;
};

const createChapterXhtml = (title: string, content: string) => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${title}</title>
  <link rel="stylesheet" type="text/css" href="style.css" />
</head>
<body>
  <h1>${title}</h1>
  ${content}
</body>
</html>`;

const createStyleCss = () => `body {
    font-family: sans-serif;
    line-height: 1.6;
}
h1, h2, h3 {
    font-family: serif;
    font-weight: bold;
}
p {
    margin-bottom: 1em;
}`;

export const createEpub = async (book: StructuredBook): Promise<Blob> => {
     if (typeof JSZip === 'undefined') {
        throw new Error('JSZip library is not loaded. Please check your index.html file.');
    }
    const zip = new JSZip();

    // The mimetype file must be the first file and stored without compression
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    const metaInf = zip.folder('META-INF');
    metaInf.file('container.xml', createContainerXml());

    const oebps = zip.folder('OEBPS');
    oebps.file('content.opf', createContentOpf(book));
    oebps.file('toc.ncx', createTocNcx(book));
    oebps.file('style.css', createStyleCss());

    book.chapters.forEach((chapter, i) => {
        const xhtmlContent = createChapterXhtml(chapter.title, chapter.content);
        oebps.file(`chapter${i + 1}.xhtml`, xhtmlContent);
    });

    const blob = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/epub+zip',
    });

    return blob;
};
