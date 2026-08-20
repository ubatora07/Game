import { BridgeMessageToPreview, BridgeMessageToHost } from './EditorTypes';

export type BridgeHostListener = (msg: BridgeMessageToHost) => void;

export class EditorBridge {
  private iframe: HTMLIFrameElement | null = null;
  private listeners: Set<BridgeHostListener> = new Set();
  private isReady: boolean = false;

  constructor() {
    window.addEventListener('message', (event) => {
      const msg = event.data as BridgeMessageToHost;
      if (!msg || typeof msg !== 'object' || !msg.type) return;

      if (msg.type === 'PREVIEW_READY') {
        this.isReady = true;
      }

      this.listeners.forEach((listener) => {
        try {
          listener(msg);
        } catch (err) {
          console.error('[EditorBridge] Listener error:', err);
        }
      });
    });
  }

  public bindIframe(iframe: HTMLIFrameElement): void {
    this.iframe = iframe;
    this.isReady = false;
  }

  public onMessage(listener: BridgeHostListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public send(msg: BridgeMessageToPreview): void {
    if (!this.iframe || !this.iframe.contentWindow) {
      console.warn('[EditorBridge] Cannot send message; iframe is not bound.');
      return;
    }
    this.iframe.contentWindow.postMessage(msg, '*');
  }

  public getIframeWindow(): Window | null {
    return this.iframe?.contentWindow || null;
  }

  public getIframeDocument(): Document | null {
    try {
      return this.iframe?.contentDocument || this.iframe?.contentWindow?.document || null;
    } catch {
      return null;
    }
  }

  public isPreviewReady(): boolean {
    return this.isReady;
  }
}
