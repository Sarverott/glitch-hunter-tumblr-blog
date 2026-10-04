import { BaseKioskScreen, KioskCustomData } from './BaseKioskScreen';

export class AirportBiosBootScreen extends BaseKioskScreen {
  readonly id = 'bios_boot';
  readonly name = 'Airport FIDS AMI BIOS Prompt';
  readonly color = '#000000';
  readonly defaultSummary = 'CMOS BATTERY LOW // PRESS F1 TO RUN SETUP';
  readonly osCategory = 'Firmware / UEFI BIOS';

  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    hardGlitch: boolean,
    customData?: KioskCustomData
  ): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px "Courier New", monospace';

    const venue = customData?.venueName || 'Heathrow Terminal 5 FIDS Gate B32';
    const errorMsg = customData?.customMessage || 'CMOS Battery Low // System Date / Time Not Set';

    const lines = [
      'American Megatrends BIOS v2.18.1263 (C) 2018 AMI',
      'CPU: Intel(R) Core(TM) i3-7100U CPU @ 2.40GHz',
      'Speed: 2400MHz | Memory: 8192MB DDR4 2133MHz Dual-Channel',
      `Device: ${venue}`,
      '------------------------------------------------------------',
      'Primary Master: SSD 128GB SATA3 (SanDisk X400)',
      'Primary Slave : None',
      'USB Devices   : 1 Keyboard, 1 Mouse, 1 Barcode Scanner',
      'Auto-Detecting USB Mass Storage Devices .. Done.',
      '------------------------------------------------------------',
      `00:01.0 Alert: ${errorMsg}`,
      'Press F1 to Run SETUP',
      'Press F2 to load default values and continue',
      'Booting stalled waiting for terminal user input...',
    ];

    lines.forEach((line, idx) => {
      if (line.includes('Alert:') || line.includes('Press F1')) {
        ctx.fillStyle = '#ffcc00';
      } else {
        ctx.fillStyle = '#cccccc';
      }
      ctx.fillText(line, 16, 26 + idx * 21);
    });

    if (hardGlitch) {
      this.drawNoise(ctx, width, height, 40);
    }
    this.drawScanlines(ctx, width, height, 0.25);
  }
}
