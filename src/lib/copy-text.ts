/**
 * copyText: puts a text on the clipboard. Resolves to true when it worked.
 * For the browser only; call it from an event handler of a Client Component.
 */

/** The way of browsers without the Clipboard API, and of pages that are not in a secure context. */
function legacyCopy(text: string): boolean {
  const active = document.activeElement;
  const box = document.createElement('textarea');
  box.value = text;
  box.setAttribute('readonly', '');
  box.style.position = 'fixed';
  box.style.top = '0';
  box.style.left = '-9999px';
  document.body.appendChild(box);
  box.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(box);
  // keep the keyboard user's place
  if (active instanceof HTMLElement) active.focus();
  return ok;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the older way
  }
  return legacyCopy(text);
}
