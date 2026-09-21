import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import dns from 'dns';
import { promisify } from 'util';

const lookupAsync = promisify(dns.lookup);

export interface CrawlPageResult {
  url: string;
  title: string;
  text: string;
  error?: string;
}

export interface CrawlResult {
  company_url: string;
  pages: CrawlPageResult[];
  pages_used: string[];
  summaryText: string;
}

const CAREER_KEYWORDS = [
  'career', 'careers', 'job', 'jobs', 'hiring', 'about', 'join', 'work-with-us',
  'engineering', 'handbook', 'culture', 'team', 'interview', 'process', 'people'
];

/**
 * Clean HTML content to plain text
 */
export function cleanHtmlToText(html: string): string {
  const $ = cheerio.load(html);
  
  // Remove irrelevant elements
  $('script, style, svg, iframe, noscript, nav, footer, header').remove();

  const text = $('body').text() || $.text();
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}

/**
 * Simple robots.txt parser checking if path is allowed
 */
export async function isAllowedByRobots(baseUrl: string, targetUrl: string): Promise<boolean> {
  try {
    const origin = new URL(baseUrl).origin;
    const robotsUrl = `${origin}/robots.txt`;
    const res = await axios.get(robotsUrl, { timeout: 3000, validateStatus: () => true });
    
    if (res.status !== 200 || typeof res.data !== 'string') {
      return true; // Assume allowed if no robots.txt
    }

    const path = new URL(targetUrl).pathname;
    const lines = res.data.split('\n');
    let userAgentMatch = true;

    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.startsWith('user-agent:')) {
        const agent = trimmed.split(':')[1].trim();
        userAgentMatch = agent === '*' || agent.includes('bot');
      } else if (userAgentMatch && trimmed.startsWith('disallow:')) {
        const disallowPath = trimmed.split(':')[1].trim();
        if (disallowPath && path.startsWith(disallowPath)) {
          return false;
        }
      }
    }
  } catch (err) {
    // Ignore robots.txt errors gracefully
  }
  return true;
}

/**
 * Score and rank candidate links
 */
function rankLinks(links: string[], baseUrlStr: string): string[] {
  const baseUrl = new URL(baseUrlStr);
  const scored = links.map(link => {
    let score = 0;
    const lower = link.toLowerCase();
    
    CAREER_KEYWORDS.forEach(kw => {
      if (lower.includes(kw)) score += 10;
    });

    // Prefer links under same host/path
    if (link.startsWith(baseUrl.origin)) score += 5;
    return { link, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.link);
}

/**
 * Check if an IP address is private or loopback
 */
function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false; // Basic IPv4 check, ignoring IPv6 for simplicity in this assessment
  
  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    parts[0] === 127 ||
    parts[0] === 0 ||
    parts[0] === 169 // Link-local
  );
}

/**
 * SSRF Protection: Resolve hostname and reject if it points to a private/loopback IP (in production)
 */
async function validateUrlSecurity(targetUrl: string): Promise<void> {
  if (process.env.NODE_ENV !== 'production') return; // Allow localhost in development/testing
  
  const urlObj = new URL(targetUrl);
  const hostname = urlObj.hostname;

  if (hostname === 'localhost') {
    throw new Error('Loopback addresses are not allowed in production.');
  }

  try {
    const { address } = await lookupAsync(hostname);
    if (isPrivateIP(address)) {
      throw new Error('Private IP addresses are not allowed in production.');
    }
  } catch (err) {
    throw new Error('Failed to resolve hostname securely.');
  }
}

/**
 * Crawl company website safely
 */
export async function crawlCompanySite(companyUrl: string, maxPages = 4): Promise<CrawlResult> {
  const pages: CrawlPageResult[] = [];
  const pages_used: string[] = [];
  let summaryText = '';

  // Validate URL format
  let normalizedUrl = companyUrl.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(normalizedUrl);
  } catch (e) {
    return {
      company_url: companyUrl,
      pages: [{ url: companyUrl, title: 'Invalid URL', text: '', error: 'Invalid URL format' }],
      pages_used: [],
      summaryText: 'Company URL provided was invalid.'
    };
  }

  // Fetch Homepage
  try {
    await validateUrlSecurity(normalizedUrl);
    const isAllowed = await isAllowedByRobots(normalizedUrl, normalizedUrl);
    if (isAllowed) {
      const resp = await axios.get(normalizedUrl, {
        timeout: 6000,
        headers: { 'User-Agent': 'PrepPilotAI-Crawler/1.0' },
        maxRedirects: 3,
        maxContentLength: 5 * 1024 * 1024, // 5MB limit
        validateStatus: (status) => status < 400
      });

      const contentType = String(resp.headers['content-type'] || '');
      if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
         throw new Error('Invalid content type. Only HTML or text is allowed.');
      }

      const $ = cheerio.load(resp.data);
      const title = $('title').text().trim() || 'Homepage';
      const cleanText = cleanHtmlToText(resp.data);

      pages.push({ url: normalizedUrl, title, text: cleanText });
      pages_used.push(normalizedUrl);
      summaryText += `[Page: ${normalizedUrl}]\n${cleanText.slice(0, 2000)}\n\n`;

      // Extract internal candidate links
      const foundLinks: string[] = [];
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          try {
            const absolute = new URL(href, normalizedUrl).toString();
            if (absolute.startsWith(baseUrl.origin) && !foundLinks.includes(absolute)) {
              foundLinks.push(absolute);
            }
          } catch (err) {
            // Ignore malformed hrefs
          }
        }
      });

      const ranked = rankLinks(foundLinks, normalizedUrl).slice(0, maxPages - 1);

      // Crawl top ranked candidate pages
      for (const link of ranked) {
        if (pages.length >= maxPages) break;
        try {
          const allowed = await isAllowedByRobots(normalizedUrl, link);
          if (!allowed) continue;

          const pageResp = await axios.get(link, {
            timeout: 5000,
            headers: { 'User-Agent': 'PrepPilotAI-Crawler/1.0' },
            maxRedirects: 3,
            maxContentLength: 5 * 1024 * 1024,
            validateStatus: (status) => status < 400
          });

          const pageContentType = String(pageResp.headers['content-type'] || '');
          if (!pageContentType.includes('text/html') && !pageContentType.includes('text/plain')) {
            throw new Error('Invalid content type');
          }

          const page$ = cheerio.load(pageResp.data);
          const pageTitle = page$('title').text().trim() || 'Subpage';
          const pageCleanText = cleanHtmlToText(pageResp.data);

          pages.push({ url: link, title: pageTitle, text: pageCleanText });
          pages_used.push(link);
          summaryText += `[Page: ${link}]\n${pageCleanText.slice(0, 1500)}\n\n`;
        } catch (linkErr: any) {
          pages.push({
            url: link,
            title: 'Unreachable',
            text: '',
            error: linkErr?.message || 'Failed to fetch link'
          });
        }
      }
    }
  } catch (err: any) {
    pages.push({
      url: normalizedUrl,
      title: 'Unreachable',
      text: '',
      error: err?.message || 'Failed to connect to company site'
    });
  }

  return {
    company_url: normalizedUrl,
    pages,
    pages_used,
    summaryText: summaryText.trim() || 'No public website details could be retrieved.'
  };
}
