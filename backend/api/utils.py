from fastapi import APIRouter, Response
import requests
import re

router = APIRouter()

@router.get("/check-embed")
def check_embed(url: str):
    """
    Checks if a URL allows being embedded in an iframe.
    Returns {"blocked": True} if headers like X-Frame-Options or CSP frame-ancestors prevent embedding.
    """
    try:
        # Use GET with stream=True so we don't download the body, just the headers.
        response = requests.get(url, stream=True, timeout=5.0)
        response.close()
        headers = response.headers

        x_frame_options = headers.get("X-Frame-Options", "").lower()
        if x_frame_options in ["deny", "sameorigin"]:
            return {"blocked": True, "reason": f"X-Frame-Options: {x_frame_options}"}

        csp = headers.get("Content-Security-Policy", "").lower()
        if "frame-ancestors" in csp:
            return {"blocked": True, "reason": "CSP frame-ancestors"}

        return {"blocked": False}
    except Exception as e:
        # If we can't reach it, assume not blocked by headers, 
        # let the iframe natively fail (or succeed if it was just a local network issue)
        return {"blocked": False, "error": str(e)}

last_proxy_url = None

@router.get("/proxy")
def proxy(url: str):
    """
    Fetches the requested URL and returns its content with X-Frame-Options and CSP removed.
    Injects a <base> tag to fix relative links.
    """
    global last_proxy_url
    last_proxy_url = url
    try:
        response = requests.get(
            url, 
            headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"}, 
            timeout=10.0
        )
        content = response.content
        
        base_tag = f'<base href="{url}">'
        if b"<head>" in content.lower():
            content = content.replace(b"<head>", b"<head>\n    " + base_tag.encode(), 1)
        elif b"<head " in content.lower():
            content = re.sub(b"(<head[^>]*>)", b"\\1\n    " + base_tag.encode(), content, count=1)
        else:
            content = base_tag.encode() + content
            
        return Response(content=content, media_type=response.headers.get("content-type", "text/html"))
    except Exception as e:
        return Response(content=f"Error proxying {url}: {e}", status_code=500)

from fastapi import Request, HTTPException
from urllib.parse import urlparse

@router.get("/{path:path}")
def proxy_catch_all(path: str, request: Request):
    global last_proxy_url
    if not last_proxy_url:
        raise HTTPException(status_code=404, detail="No active proxy session")
        
    parsed_orig = urlparse(last_proxy_url)
    base_domain = f"{parsed_orig.scheme}://{parsed_orig.netloc}"
    
    target_url = f"{base_domain}/{path}"
    if request.url.query:
        target_url += f"?{request.url.query}"
        
    try:
        resp = requests.get(target_url, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"}, timeout=5.0)
        return Response(content=resp.content, media_type=resp.headers.get("content-type"))
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
