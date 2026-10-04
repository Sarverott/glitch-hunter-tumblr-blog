import { BaseKioskScreen, KioskCustomData } from './BaseKioskScreen';

export class AtmBsodScreen extends BaseKioskScreen {
  readonly id = 'atm_bsod';
  readonly name = 'ATM Blue Screen of Death';
  readonly color = '#0078d7';
  readonly defaultSummary = 'CRITICAL_PROCESS_DIED (ntoskrnl.exe)';
  readonly osCategory = 'Windows 10 / POSReady';

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
    ctx.font = '54px sans-serif';
    ctx.fillText(':(', 40, 85);

    ctx.font = '16px sans-serif';
    ctx.fillText('Your PC ran into a problem and needs to restart.', 40, 130);
    ctx.fillText("We're just collecting some error info, and then we'll restart for you.", 40, 155);

    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('100% complete', 40, 195);

    // QR Code simulation box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 220, 75, 75);
    ctx.fillStyle = '#0078d7';
    ctx.fillRect(48, 228, 20, 20);
    ctx.fillRect(86, 228, 20, 20);
    ctx.fillRect(48, 266, 20, 20);
    ctx.fillRect(72, 252, 12, 12);

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px sans-serif';
    ctx.fillText('For more info about this issue and possible fixes, visit', 130, 235);
    ctx.fillText('https://windows.com/stopcode', 130, 255);

    const stopCode = customData?.customMessage || 'CRITICAL_PROCESS_DIED';
    ctx.fillText(`Stop code: ${stopCode}`, 130, 280);
    ctx.fillText(`Asset: ${customData?.venueName || 'ATM_CHASE_TERMINAL_#04'}`, 130, 300);

    if (hardGlitch) {
      this.drawNoise(ctx, width, height, 30);
    }
    this.drawScanlines(ctx, width, height, 0.12);
  }
}
