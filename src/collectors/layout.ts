import { Page } from 'playwright';
import { LayoutIssue, LayoutOverflowElement } from '../types/audit.js';

/**
 * Checks for horizontal scrolling and identifies elements causing viewport overflow.
 */
export async function detectLayoutIssues(page: Page): Promise<LayoutIssue> {
  return await page.evaluate((): LayoutIssue => {
    const docScrollWidth = document.documentElement.scrollWidth;
    const bodyScrollWidth = document.body ? document.body.scrollWidth : 0;
    const scrollWidth = Math.max(docScrollWidth, bodyScrollWidth);

    const clientWidth = document.documentElement.clientWidth;
    const visualViewportWidth = window.visualViewport?.width || clientWidth;
    const windowInnerWidth = window.innerWidth;

    // Use the effective viewport width representing what the user physically sees
    const effectiveViewportWidth = Math.min(
      visualViewportWidth,
      clientWidth > 0 ? clientWidth : visualViewportWidth,
      windowInnerWidth
    );

    const hasHorizontalScroll =
      docScrollWidth > windowInnerWidth ||
      scrollWidth > effectiveViewportWidth + 2;

    const overflowAmount = Math.max(0, scrollWidth - effectiveViewportWidth);

    const culpritElements: LayoutOverflowElement[] = [];

    if (hasHorizontalScroll) {
      const allElements = document.querySelectorAll('*');
      for (const el of Array.from(allElements)) {
        if (!(el instanceof HTMLElement)) continue;

        // Skip invisible / zero-size elements
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          continue;
        }

        const rect = el.getBoundingClientRect();
        const elScrollWidth = el.scrollWidth;
        const elClientWidth = el.clientWidth;

        const overflowsWindow = rect.right > effectiveViewportWidth + 2;
        const hasWideScroll = elScrollWidth > effectiveViewportWidth + 2;

        if (overflowsWindow || hasWideScroll) {
          // Generate a clean selector
          let selector = el.tagName.toLowerCase();
          if (el.id) {
            selector += `#${el.id}`;
          } else if (el.className && typeof el.className === 'string') {
            const classes = el.className
              .trim()
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((c) => `.${c}`)
              .join('');
            if (classes) selector += classes;
          }

          culpritElements.push({
            selector,
            tagName: el.tagName.toLowerCase(),
            id: el.id || undefined,
            className: typeof el.className === 'string' ? el.className.trim() : undefined,
            scrollWidth: elScrollWidth,
            clientWidth: elClientWidth,
            boundingRight: Math.round(rect.right),
            viewportWidth: Math.round(effectiveViewportWidth),
          });

          // Limit to top 10 culprit elements
          if (culpritElements.length >= 10) {
            break;
          }
        }
      }
    }

    return {
      hasHorizontalScroll,
      scrollWidth,
      viewportWidth: Math.round(effectiveViewportWidth),
      overflowAmount,
      culpritElements,
    };
  });
}
