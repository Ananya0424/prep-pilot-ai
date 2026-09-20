import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

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
    const isAllowed = await isAllowedByRobots(normalizedUrl, normalizedUrl);
    if (isAllowed) {
      const resp = await axios.get(normalizedUrl, {
        timeout: 6000,
        headers: { 'User-Agent': 'PrepPilotAI-Crawler/1.0' },
        maxRedirects: 3,
        validateStatus: (status) => status < 400
      });

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
            validateStatus: (status) => status < 400
          });

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
