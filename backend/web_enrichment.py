from __future__ import annotations

import re
import asyncio
from typing import List, Dict
import httpx
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0 Safari/537.36"
)

async def _fetch(session: httpx.AsyncClient, url: str) -> str:
    try:
        resp = await session.get(url, timeout=20)
        resp.raise_for_status()
        return resp.text
    except Exception:
        return ""

def _clean_html(html: str) -> str:
    if not html:
        return ""
    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    text = soup.get_text(" ")
    text = re.sub(r"\s+", " ", text).strip()
    return text

def _chunk_text(text: str, max_len: int = 1200) -> List[str]:
    if not text:
        return []
    chunks: List[str] = []
    start = 0
    while start < len(text):
        end = min(start + max_len, len(text))
        # try break on sentence end
        slice_ = text[start:end]
        last_period = slice_.rfind(".")
        if last_period > 200:
            end = start + last_period + 1
        chunks.append(text[start:end].strip())
        start = end
    return [c for c in chunks if len(c) > 100]

async def enrich_company_context(company_name: str, website: str | None = None) -> List[Dict[str, str]]:
    """Search and fetch public web content for a company and return text chunks.

    Returns list of {source, url, text}.
    """
    queries = [
        f"{company_name} company overview",
        f"{company_name} funding news",
        f"{company_name} product",
        f"{company_name} traction metrics",
    ]
    if website:
        queries.insert(0, website)

    urls: List[str] = []
    with DDGS() as ddgs:
        for q in queries:
            try:
                for r in ddgs.text(q, max_results=4, safesearch="moderate"):  # type: ignore
                    url = r.get("href") or r.get("url")
                    if url and url not in urls:
                        urls.append(url)
            except Exception:
                continue

    # de-dup domain-ish
    urls = urls[:12]

    headers = {"User-Agent": USER_AGENT}
    async with httpx.AsyncClient(headers=headers, follow_redirects=True) as session:
        pages = await asyncio.gather(*[_fetch(session, u) for u in urls])

    chunks: List[Dict[str, str]] = []
    for u, html in zip(urls, pages):
        text = _clean_html(html)
        for c in _chunk_text(text):
            chunks.append({"source": company_name, "url": u, "text": c})

    return chunks[:200]
