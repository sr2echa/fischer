"""
Document Ingestion Utility using Google Gemini API.

This module provides utilities to ingest and extract content from PDF and DOCX files
using Google's Gemini AI with native vision understanding capabilities.

Supports:
- PDF files (up to 1000 pages)
- DOCX files
- Markdown extraction only (optimized for clean document conversion)

Features:
- Clean markdown extraction with formatting preserved
- Table extraction as markdown tables
- Image description placeholders
- High token limit for comprehensive document extraction (32K tokens)
"""

import os
from pathlib import Path
from typing import Optional, Dict, Any, Union, List
from enum import Enum
import json

try:
    from google import genai
    from google.genai import types
except ImportError:
    import google.generativeai as genai


class ExtractionMode(Enum):
    """Extraction mode for converting documents to markdown."""
    MARKDOWN = "markdown"  # Convert to clean markdown


class DocumentIngestion:
    """
    Main class for ingesting documents using Google Gemini API.
    
    This class specializes in converting PDF and DOCX documents to clean,
    well-formatted markdown with high token limits for comprehensive extraction.
    
    Attributes:
        api_key: Google AI API key
        model_name: Gemini model to use (default: gemini-2.0-flash)
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "gemini-2.5-pro"
    ):
        """
        Initialize the document ingestion utility.
        
        Args:
            api_key: Google AI API key. If not provided, will try to get from environment
            model_name: Gemini model to use (default: gemini-2.5-pro for superior vision and table extraction)
        """
        # Try to get API key from parameter or environment
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_AI_API_KEY")
        
        if not self.api_key:
            raise ValueError(
                "API key required. Provide it as parameter or set GEMINI_API_KEY environment variable."
            )
        
        # Configure Gemini
        try:
            # Try new SDK first
            self.client = genai.Client(api_key=self.api_key)
            self.use_new_sdk = True
        except (AttributeError, TypeError):
            # Fall back to old SDK
            genai.configure(api_key=self.api_key)
            self.use_new_sdk = False
        
        self.model_name = model_name
    
    def _get_extraction_prompt(
        self,
        custom_prompt: Optional[str] = None
    ) -> str:
        """
        Generate the markdown extraction prompt.
        
        Args:
            custom_prompt: Custom prompt to override default
            
        Returns:
            Formatted prompt string
        """
        if custom_prompt:
            return custom_prompt
        
        return """
You are a comprehensive document-to-markdown converter with EXPERT table extraction capabilities.

CRITICAL: Extract the ENTIRE document content. Do not summarize, truncate, or skip any sections.

SPECIAL EMPHASIS ON TABLES:
- Pay extreme attention to ALL tables in the document
- Extract EVERY row and EVERY column from each table
- Preserve exact table structure and cell content
- Do NOT stop mid-table or omit table rows
- Tables must be complete from header to last row
- If a table spans multiple pages, extract ALL pages
- Use proper GitHub-flavored Markdown table syntax with | separators

GENERAL INSTRUCTIONS:
- Convert the complete document into clean, readable **Markdown**
- Preserve ALL section headings (#, ##, ###, etc.)
- Include ALL bullet points and numbered lists
- Convert ALL tables into complete GitHub-flavored Markdown tables
- For images, insert placeholders like ![image description](image.png)
- Preserve ALL code blocks if present
- Maintain the complete document structure and hierarchy
- Include ALL text content - do not omit any sections
- Extract ALL data, numbers, statistics, and details
- Include ALL names, organizations, dates, and references
- Process the document page by page to ensure nothing is missed
- Continue extraction until the VERY END of the document
- Ensure proper spacing and formatting for readability

FORMATTING RULES:
- Do NOT include base64 encoded data or embedded images
- Do NOT add excessive whitespace or padding in tables
- Do NOT use HTML entities like &nbsp; - use regular spaces only
- Keep output clean and compact
- Use simple markdown table formatting without extra spacing
- For complex tables, preserve all information accurately

TABLE EXTRACTION CHECKLIST:
✓ Extract ALL table headers
✓ Extract ALL table rows (do not stop early)
✓ Preserve column alignment
✓ Ensure no data is lost or truncated
✓ Continue until the last row is extracted

RETURN THE COMPLETE DOCUMENT CONTENT - NOT A SUMMARY. ESPECIALLY ENSURE ALL TABLES ARE FULLY EXTRACTED.
"""
    
    def ingest_document(
        self,
        file_path: Union[str, Path],
        custom_prompt: Optional[str] = None,
        temperature: float = 0.0,
        max_output_tokens: int = 100000,
        save_output: bool = False,
        output_path: Optional[Union[str, Path]] = None
    ) -> Dict[str, Any]:
        """
        Ingest a document (PDF or DOCX) and extract content as markdown.
        
        Args:
            file_path: Path to the document file
            custom_prompt: Custom prompt to override default markdown prompt
            temperature: Model temperature (0.0 = deterministic)
            max_output_tokens: Maximum tokens in response
            save_output: Whether to save output to file
            output_path: Path to save output (auto-generated if not provided)
            
        Returns:
            Dictionary containing:
                - success: bool
                - content: extracted content as markdown
                - metadata: file metadata
                - error: error message if failed
        """
        file_path = Path(file_path)
        
        # Validate file exists
        if not file_path.exists():
            return {
                "success": False,
                "error": f"File not found: {file_path}",
                "content": None,
                "metadata": None
            }
        
        # Validate file type
        supported_extensions = ['.pdf']
        if file_path.suffix.lower() not in supported_extensions:
            return {
                "success": False,
                "error": f"Unsupported file type: {file_path.suffix}. Supported: {supported_extensions}",
                "content": None,
                "metadata": None
            }
        
        try:
            # Determine MIME type
            mime_type = "application/pdf"
            
            # Get extraction prompt
            prompt = self._get_extraction_prompt(custom_prompt)
            
            # Read file bytes
            file_bytes = file_path.read_bytes()
            file_size_mb = len(file_bytes) / (1024 * 1024)
            
            print(f"📄 Processing: {file_path.name} ({file_size_mb:.2f} MB)")
            print(f"🎯 Mode: markdown extraction")
            print(f"🤖 Model: {self.model_name}")
            
            # Process based on file size and SDK version
            if self.use_new_sdk:
                content = self._process_with_new_sdk(
                    file_path, file_bytes, mime_type, prompt,
                    temperature, max_output_tokens, file_size_mb
                )
            else:
                content = self._process_with_old_sdk(
                    file_path, file_bytes, mime_type, prompt,
                    temperature, max_output_tokens, file_size_mb
                )
            
            # Save output if requested
            if save_output:
                output_path = self._save_output(
                    content, file_path, output_path
                )
            
            # Clean the content
            content = self._clean_content(content)
            
            return {
                "success": True,
                "content": content,
                "metadata": {
                    "filename": file_path.name,
                    "file_size_mb": file_size_mb,
                    "mode": "markdown",
                    "mime_type": mime_type,
                    "output_path": str(output_path) if save_output else None
                },
                "error": None
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to process document: {str(e)}",
                "content": None,
                "metadata": {
                    "filename": file_path.name,
                    "file_size_mb": file_size_mb if 'file_size_mb' in locals() else 0
                }
            }
    
    def _process_with_new_sdk(
        self,
        file_path: Path,
        file_bytes: bytes,
        mime_type: str,
        prompt: str,
        temperature: float,
        max_output_tokens: int,
        file_size_mb: float
    ) -> str:
        """Process document using new GenAI SDK."""
        # For files larger than 20MB, use File API
        if file_size_mb > 20:
            print("📤 Uploading large file using File API...")
            uploaded_file = self.client.files.upload(
                file=file_path,
            )
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[uploaded_file, prompt],
                config=types.GenerateContentConfig(
                    temperature=temperature,
                    max_output_tokens=max_output_tokens,
                )
            )
            
            # Clean up uploaded file
            try:
                self.client.files.delete(name=uploaded_file.name)
            except Exception:
                pass
        else:
            # Use inline bytes for smaller files
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[
                    types.Part.from_bytes(
                        data=file_bytes,
                        mime_type=mime_type,
                    ),
                    prompt
                ],
                config=types.GenerateContentConfig(
                    temperature=temperature,
                    max_output_tokens=max_output_tokens,
                )
            )
        
        return response.text
    
    def _process_with_old_sdk(
        self,
        file_path: Path,
        file_bytes: bytes,
        mime_type: str,
        prompt: str,
        temperature: float,
        max_output_tokens: int,
        file_size_mb: float
    ) -> str:
        """Process document using old google-generativeai SDK."""
        model = genai.GenerativeModel(self.model_name)
        
        # For files larger than 20MB, use File API
        if file_size_mb > 20:
            print("📤 Uploading large file using File API...")
            uploaded_file = genai.upload_file(
                path=str(file_path),
                mime_type=mime_type
            )
            
            response = model.generate_content(
                [uploaded_file, prompt],
                generation_config=genai.GenerationConfig(
                    max_output_tokens=max_output_tokens,
                    temperature=temperature
                )
            )
            
            # Clean up uploaded file
            try:
                genai.delete_file(uploaded_file.name)
            except Exception:
                pass
        else:
            # Use inline bytes for smaller files
            response = model.generate_content(
                [
                    {"mime_type": mime_type, "data": file_bytes},
                    prompt
                ],
                generation_config=genai.GenerationConfig(
                    max_output_tokens=max_output_tokens,
                    temperature=temperature
                )
            )
        
        return response.text
    
    def _save_output(
        self,
        content: str,
        file_path: Path,
        output_path: Optional[Union[str, Path]]
    ) -> Path:
        """Save extracted content to file."""
        # Clean the content before saving
        content = self._clean_content(content)
        
        if output_path:
            output_path = Path(output_path)
        else:
            # Auto-generate output path with .md extension
            output_path = file_path.parent / f"{file_path.stem}_extracted.md"
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(content, encoding='utf-8')
        
        print(f"💾 Output saved to: {output_path}")
        return output_path
    
    def _clean_content(self, content: str) -> str:
        """
        Clean the extracted content to remove excessive whitespace and formatting issues.
        
        Args:
            content: Raw content from Gemini
            
        Returns:
            Cleaned content
        """
        import re
        
        # Remove excessive HTML entities (like &nbsp;)
        # Replace 3+ consecutive &nbsp; with just one space
        content = re.sub(r'(&nbsp;\s*){3,}', ' ', content)
        # Replace any remaining &nbsp; with regular space
        content = re.sub(r'&nbsp;', ' ', content)
        
        # Remove trailing whitespace from each line
        lines = [line.rstrip() for line in content.split('\n')]
        
        # Remove excessive blank lines (more than 2 consecutive)
        cleaned_lines = []
        blank_count = 0
        for line in lines:
            if not line.strip():
                blank_count += 1
                if blank_count <= 2:
                    cleaned_lines.append(line)
            else:
                blank_count = 0
                cleaned_lines.append(line)
        
        # Join back and strip leading/trailing whitespace
        cleaned = '\n'.join(cleaned_lines).strip()
        
        # Remove any remaining excessive whitespace
        # Replace multiple spaces with single space (but preserve indentation)
        cleaned = re.sub(r'(?<!^)(?<!\n) {3,}', ' ', cleaned, flags=re.MULTILINE)
        
        # Clean up excessive spaces in markdown tables
        # Replace long sequences of spaces in table cells
        cleaned = re.sub(r'\|([^|\n]*?)\s{5,}', r'| \1 ', cleaned)
        
        return cleaned + '\n'  # Add single newline at end
    
    def ingest_multiple_documents(
        self,
        file_paths: List[Union[str, Path]],
        comparison_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Ingest multiple documents and optionally compare/analyze them together.
        
        Args:
            file_paths: List of document file paths
            comparison_prompt: Optional prompt to compare/analyze documents together
            
        Returns:
            Dictionary with results for each document or combined analysis
        """
        if not file_paths:
            return {"success": False, "error": "No files provided"}
        
        if len(file_paths) == 1:
            return self.ingest_document(file_paths[0])
        
        try:
            # Upload all files
            uploaded_files = []
            for file_path in file_paths:
                file_path = Path(file_path)
                if not file_path.exists():
                    continue
                
                mime_type = "application/pdf" if file_path.suffix.lower() == '.pdf' else \
                           "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                
                if self.use_new_sdk:
                    uploaded = self.client.files.upload(file=file_path)
                else:
                    uploaded = genai.upload_file(path=str(file_path), mime_type=mime_type)
                
                uploaded_files.append(uploaded)
                print(f"📤 Uploaded: {file_path.name}")
            
            # Generate content with all files
            prompt = comparison_prompt or self._get_extraction_prompt()
            
            if self.use_new_sdk:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=[*uploaded_files, prompt],
                    config=types.GenerateContentConfig(temperature=0.0, max_output_tokens=100000)
                )
            else:
                model = genai.GenerativeModel(self.model_name)
                response = model.generate_content(
                    [*uploaded_files, prompt],
                    generation_config=genai.GenerationConfig(max_output_tokens=100000, temperature=0.0)
                )
            
            # Clean up
            for uploaded in uploaded_files:
                try:
                    if self.use_new_sdk:
                        self.client.files.delete(name=uploaded.name)
                    else:
                        genai.delete_file(uploaded.name)
                except Exception:
                    pass
            
            return {
                "success": True,
                "content": response.text,
                "metadata": {
                    "file_count": len(file_paths),
                    "filenames": [Path(p).name for p in file_paths],
                    "mode": "markdown"
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to process multiple documents: {str(e)}",
                "content": None
            }


# Convenience function for markdown extraction

def extract_text_from_pdf(
    pdf_path: Union[str, Path],
    api_key: Optional[str] = None
) -> str:
    """
    Quick function to extract text from a PDF as markdown.
    
    Args:
        pdf_path: Path to PDF file
        api_key: Google AI API key
        
    Returns:
        Extracted text content as markdown
    """
    ingestion = DocumentIngestion(api_key=api_key)
    result = ingestion.ingest_document(pdf_path)
    
    if result["success"]:
        return result["content"]
    else:
        raise Exception(result["error"])
