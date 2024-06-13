import { JSDOM } from 'jsdom';

function normalizeURL(url) {
  const urlObj = new URL(url);
  let fullPath = `${urlObj.host}${urlObj.pathname}`;
  if (fullPath.slice(-1) === '/') {
    fullPath = fullPath.slice(0, -1);
  }
  return fullPath;
}

function getURLsFromHTML(html, baseURL) {
  const urls = [];
  const dom = new JSDOM(html);
  const anchors = dom.window.document.querySelectorAll('a');
  for (const anchor of anchors) {
    if (anchor.hasAttribute('href')) {
      let href = anchor.getAttribute('href');

      try {
        href = new URL(href, baseURL).href;
        urls.push(href);
      } catch (err) {
        console.log(`${err.message}: ${href}`);
      }
    }
  }
  return urls;
}

async function getHTML(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(`Got Network error: ${err.message}`);
  }

  if (res.status > 399) {
    console.log(`Got HTTP error: ${res.status} ${res.statusText}`);
    return;
  }

  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('text/html')) {
    console.log(`Got non-HTML response: ${contentType}`);
    return;
  }

  return await res.text();
}

async function crawlPage(baseURL, currentURL = baseURL, pages = {}) {
  // fetch and parse the html of the currentURL
  console.log(`crawling ${currentURL}`);

  const currentURLObj = new URL(currentURL);
  const baseURLObj = new URL(baseURL);

  if (baseURLObj.host != currentURLObj.host) {
    return pages;
  }

  const normalizedURL = normalizeURL(currentURL);

  if (pages[normalizedURL]) {
    pages[normalizedURL]++;
    return pages
  } else {
    pages[normalizedURL] = 1;
  }

  const html = await getHTML(currentURL); // Corrected to use currentURL
  if (!html) {
    return pages; // Exit if there is no HTML content
  }

  const newURLs = getURLsFromHTML(html, baseURL); // Corrected to pass baseURL
  for (let url of newURLs) {
    await crawlPage(baseURL, url, pages);
  }
  return pages;
}

export { normalizeURL, getURLsFromHTML, crawlPage };
