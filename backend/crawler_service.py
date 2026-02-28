"""
Web Crawler Service

Crawls educational resources (Wikipedia, GeeksForGeeks, JavaTPoint, etc.)
for a given subject + topic query and returns clean extracted text.
"""

import requests
from bs4 import BeautifulSoup
import urllib.parse
import re
import time

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    )
}

# Sites to try, in priority order
CRAWL_SOURCES = [
    "geeksforgeeks.org",
    "javatpoint.com",
    "tutorialspoint.com",
    "en.wikipedia.org",
]


def _clean_text(soup: BeautifulSoup) -> str:
    """Remove nav, ads, footers and return clean paragraph text."""
    for tag in soup(["script", "style", "nav", "footer", "header",
                     "aside", "form", "noscript", "iframe", "svg"]):
        tag.decompose()

    # Remove ad / sidebar divs by common class names
    for tag in soup.find_all(class_=re.compile(
            r"ad|sidebar|widget|cookie|banner|popup|subscribe", re.I)):
        tag.decompose()

    # Prefer article / main body
    body = (
        soup.find("article") or
        soup.find("main") or
        soup.find(id=re.compile(r"content|main|article", re.I)) or
        soup.find(class_=re.compile(r"content|article|post|entry", re.I)) or
        soup.body
    )
    if not body:
        return ""

    lines = []
    for el in body.find_all(["p", "h1", "h2", "h3", "h4", "li", "pre", "code"]):
        text = el.get_text(separator=" ", strip=True)
        if len(text) > 30:
            lines.append(text)

    return "\n\n".join(lines)


def _fetch_url(url: str, timeout: int = 8) -> str:
    """Fetch a URL and return clean text. Returns '' on failure."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout)
        if resp.status_code != 200:
            return ""
        soup = BeautifulSoup(resp.text, "lxml")
        return _clean_text(soup)
    except Exception as e:
        print(f"[Crawler] Failed {url}: {e}")
        return ""


def _google_first_result(query: str, site: str) -> str | None:
    """Use DuckDuckGo HTML search to find first result URL for a site."""
    search_query = f"site:{site} {query}"
    encoded = urllib.parse.quote_plus(search_query)
    url = f"https://html.duckduckgo.com/html/?q={encoded}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=8)
        soup = BeautifulSoup(resp.text, "lxml")
        # DuckDuckGo result links
        for a in soup.select("a.result__url, .result__title a, a[href*='uddg=']"):
            href = a.get("href", "")
            if "uddg=" in href:
                href = urllib.parse.unquote(href.split("uddg=")[-1].split("&")[0])
            if site in href and href.startswith("http"):
                return href
    except Exception as e:
        print(f"[Crawler] DuckDuckGo search failed: {e}")
    return None


def crawl_topic(subject: str, topics: list[str], max_per_topic: int = 2) -> dict:
    """
    Crawl educational sites for each topic.
    Returns:
        { "topic": { "url": str, "text": str }, ... }
    """
    results = {}
    for topic in topics[:6]:          # cap at 6 topics to avoid overloading
        query = f"{subject} {topic} tutorial"
        found = False
        for site in CRAWL_SOURCES:
            url = _google_first_result(query, site)
            if not url:
                # Fallback: build Wikipedia URL directly
                if site == "en.wikipedia.org":
                    slug = urllib.parse.quote_plus(f"{subject} {topic}".replace(" ", "_"))
                    url = f"https://en.wikipedia.org/wiki/{slug}"
                else:
                    continue

            text = _fetch_url(url)
            if text and len(text) > 300:
                results[topic] = {"url": url, "text": text[:8000]}  # cap per topic
                found = True
                time.sleep(0.5)       # polite crawl delay
                break

        if not found:
            results[topic] = {"url": "", "text": ""}

    return results


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF given its raw bytes."""
    from pypdf import PdfReader
    import io
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return "\n\n".join(pages)


def extract_text_from_raw(text: str) -> str:
    """Pass-through for plain text uploads."""
    return text.strip()
