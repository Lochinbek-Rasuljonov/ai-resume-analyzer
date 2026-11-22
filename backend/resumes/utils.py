import io
import logging

import docx
import pymupdf

log = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = ('.pdf', '.docx')


def extract_text(data: bytes, extension: str) -> str:
    """Return the plain text of a PDF or DOCX file, or "" when none can be read."""
    try:
        if extension == '.pdf':
            with pymupdf.open(stream=data, filetype='pdf') as doc:
                return '\n'.join(page.get_text() for page in doc).strip()
        if extension == '.docx':
            document = docx.Document(io.BytesIO(data))
            return '\n'.join(p.text for p in document.paragraphs).strip()
    except Exception:
        log.warning('Could not read a %s file', extension, exc_info=True)
    return ''
