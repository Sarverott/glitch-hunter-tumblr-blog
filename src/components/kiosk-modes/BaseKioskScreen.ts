/**
 * BaseKioskScreen.ts
 * Abstract base class for 3D retro CRT kiosk glitch screens
 */

export interface KioskCustomData {
  customMessage?: string;
  venueName?: string;
  osDetected?: string;
  locationAddress?: string;
  incidentRef?: string;
  userPayload?: string;
  timestamp?: string;
}

export abstract class BaseKioskScreen {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly color: string;
  abstract readonly defaultSummary: string;
  abstract readonly osCategory: string;

  /**
   * Renders the dynamic CRT screen content onto the canvas texture
   */
  abstract render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    hardGlitch: boolean,
    customData?: KioskCustomData
  ): void;

  /**
   * Helper utility to draw CRT scanlines
   */
  protected drawScanlines(ctx: CanvasRenderingContext2D, width: number, height: number, opacity: number = 0.15): void {
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1.5);
    }
  }

  /**
   * Helper utility to draw CRT noise jitter
   */
  protected drawNoise(ctx: CanvasRenderingContext2D, width: number, height: number, count: number = 20): void {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let i = 0; i < count; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const rw = Math.random() * 80 + 20;
      ctx.fillRect(rx, ry, rw, 2);
    }
  }
}
