/**
 * Rotary RSS Feed Parser
 * Fetches and parses news from Rotary.org RSS feed
 * Feed URL: https://www.rotary.org/en/rss.xml
 */

export interface RotaryNewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  imageUrl?: string;
  source: 'rotary-org' | 'club';
}

export interface RSSFeedConfig {
  url: string;
  name: string;
  enabled: boolean;
}

// Official Rotary RSS feeds (English only)
export const ROTARY_RSS_FEEDS: RSSFeedConfig[] = [
  {
    url: 'https://www.rotary.org/en/rss.xml',
    name: 'Rotary International News',
    enabled: true,
  },
];

/**
 * Fetch and parse RSS feed from Rotary.org
 * Returns parsed news items with fallback to local news if feed fails
 */
export async function fetchRotaryRSSFeed(maxItems: number = 5): Promise<RotaryNewsItem[]> {
  try {
    const response = await fetch(ROTARY_RSS_FEEDS[0].url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }

    const xmlText = await response.text();
    
    // Check channel language - skip if not English
    const channelLangMatch = /<language>(.*?)<\/language>/.exec(xmlText);
    const channelLang = channelLangMatch?.[1]?.toLowerCase();
    if (channelLang && !channelLang.startsWith('en')) {
      console.warn('⚠️ RSS feed is not in English, skipping');
      return [];
    }

    const items = parseRSSXML(xmlText);
    
    return items.slice(0, maxItems).map(item => ({
      ...item,
      source: 'rotary-org' as const,
    }));
  } catch (error) {
    console.warn('⚠️ Failed to fetch Rotary RSS feed, falling back to local news:', error);
    return [];
  }
}

/**
 * Parse XML RSS feed into structured data
 */
function parseRSSXML(xmlText: string): Omit<RotaryNewsItem, 'source'>[] {
  const items: Omit<RotaryNewsItem, 'source'>[] = [];
  
  try {
    // Simple XML parsing for RSS 2.0
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
    const linkRegex = /<link>(.*?)<\/link>/;
    const descriptionRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/;
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
    const enclosureRegex = /<enclosure[^>]*url="(.*?)"[^>]*\/>/;
    const mediaContentRegex = /<media:content[^>]*url="(.*?)"[^>]*\/>/;
    const categoryRegex = /<category>(.*?)<\/category>/;

    let match;
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = match[1];
      
      const titleMatch = titleRegex.exec(itemXml);
      const linkMatch = linkRegex.exec(itemXml);
      const descMatch = descriptionRegex.exec(itemXml);
      const pubDateMatch = pubDateRegex.exec(itemXml);
      const enclosureMatch = enclosureRegex.exec(itemXml);
      const mediaMatch = mediaContentRegex.exec(itemXml);
      const categoryMatch = categoryRegex.exec(itemXml);

      // Skip non-English content based on category or description patterns
      const category = categoryMatch?.[1] || '';
      const title = titleMatch?.[1] || titleMatch?.[2] || '';
      
      // Filter out non-English items by checking for common non-English patterns
      // This is a basic filter - can be enhanced
      if (title && isValidEnglish(title)) {
        const description = (descMatch?.[1] || descMatch?.[2] || '').trim();
        
        items.push({
          title: title.trim(),
          link: (linkMatch?.[1] || '').trim(),
          description: cleanHtmlDescription(description),
          pubDate: (pubDateMatch?.[1] || new Date().toISOString()).trim(),
          imageUrl: enclosureMatch?.[1] || mediaMatch?.[1] || extractImageFromDescription(description),
        });
      }
    }
  } catch (error) {
    console.error('Error parsing RSS XML:', error);
  }

  return items;
}

/**
 * Basic English language validation
 * Filters out items with common non-English character patterns
 */
function isValidEnglish(text: string): boolean {
  if (!text) return false;
  
  // Check for common non-English language markers
  // This is a simple heuristic - the Rotary English RSS feed should be primarily English
  const nonEnglishPatterns = [
    /^[\u0400-\u04FF]+/, // Cyrillic
    /^[\u4E00-\u9FFF]+/, // Chinese
    /^[\u3040-\u309F]+/, // Japanese Hiragana
    /^[\u30A0-\u30FF]+/, // Japanese Katakana
    /^[\uAC00-\uD7AF]+/, // Korean
    /^[\u0600-\u06FF]+/, // Arabic
    /^[\u0900-\u097F]+/, // Devanagari
  ];
  
  return !nonEnglishPatterns.some(pattern => pattern.test(text));
}

/**
 * Clean HTML tags from description
 */
function cleanHtmlDescription(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
    .substring(0, 300);
}

/**
 * Extract image URL from HTML description
 */
function extractImageFromDescription(html: string): string | undefined {
  const imgRegex = /<img[^>]+src="([^"]+)"/;
  const match = imgRegex.exec(html);
  return match?.[1];
}

/**
 * Format date from RSS feed
 */
export function formatRSSDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}
