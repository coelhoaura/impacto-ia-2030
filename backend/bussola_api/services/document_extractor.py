import io
import zipfile
import xml.etree.ElementTree as ET
from typing import Tuple


class DocumentExtractorService:
    """Extrai texto estruturado e limpo de arquivos PDF, DOCX e TXT."""

    @staticmethod
    def extract_from_bytes(file_bytes: bytes, filename: str) -> Tuple[str, str]:
        ext = filename.lower().split(".")[-1]
        
        if ext == "pdf":
            return DocumentExtractorService._extract_pdf(file_bytes), "pdf"
        elif ext in ["docx", "doc"]:
            return DocumentExtractorService._extract_docx(file_bytes), "docx"
        elif ext in ["txt", "md"]:
            return file_bytes.decode("utf-8", errors="ignore"), "text"
        else:
            return file_bytes.decode("utf-8", errors="ignore"), "unknown"

    @staticmethod
    def _extract_pdf(file_bytes: bytes) -> str:
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            text_pages = []
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    text_pages.append(t)
            return "\n".join(text_pages).strip()
        except Exception as e:
            raise ValueError(f"Falha ao ler PDF: {str(e)}")

    @staticmethod
    def _extract_docx(file_bytes: bytes) -> str:
        try:
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            return "\n".join([p.text for p in doc.paragraphs if p.text.strip()]).strip()
        except ImportError:
            pass
        except Exception:
            pass

        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as docx_zip:
                xml_content = docx_zip.read("word/document.xml")
                tree = ET.fromstring(xml_content)
                namespaces = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
                paragraphs = []
                for p in tree.iterfind(".//w:p", namespaces):
                    texts = [node.text for node in p.iterfind(".//w:t", namespaces) if node.text]
                    if texts:
                        paragraphs.append("".join(texts))
                return "\n".join(paragraphs).strip()
        except Exception as e:
            raise ValueError(f"Falha ao extrair documento Word (.docx): {str(e)}")