import { BaseKioskScreen, KioskCustomData } from './BaseKioskScreen';

export class BillboardTeamViewerScreen extends BaseKioskScreen {
  readonly id = 'billboard_teamviewer';
  readonly name = 'LED Billboard TeamViewer';
  readonly color = '#0d2542';
  readonly defaultSummary = 'TEAMVIEWER ID: 492 881 024';
  readonly osCategory = 'Remote Access / Exposed IT';

  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    hardGlitch: boolean,
    customData?: KioskCustomData
  ): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, width, height);

    // TeamViewer Dialog Box
    const boxX = 60;
    const boxY = 50;
    const boxW = Math.min(width - 100, 390);
    const boxH = 240;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(boxX, boxY, boxW, boxH);

    // Header blue bar
    ctx.fillStyle = '#0e5fba';
    ctx.fillRect(boxX, boxY, boxW, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('TeamViewer - Remote Control', boxX + 16, boxY + 26);

    // ID section
    ctx.fillStyle = '#333333';
    ctx.font = '12px sans-serif';
    ctx.fillText('Allow Remote Control', boxX + 20, boxY + 65);

    ctx.fillStyle = '#666666';
    ctx.font = '11px sans-serif';
    ctx.fillText('Your ID:', boxX + 20, boxY + 95);

    ctx.fillStyle = '#0e5fba';
    ctx.font = 'bold 22px "Fira Code", monospace';
    const remoteId = customData?.userPayload || '492 881 024';
    ctx.fillText(remoteId, boxX + 20, boxY + 125);

    ctx.fillStyle = '#666666';
    ctx.font = '11px sans-serif';
    ctx.fillText('Password:', boxX + 20, boxY + 155);

    ctx.fillStyle = '#111111';
    ctx.font = 'bold 18px "Fira Code", monospace';
    ctx.fillText('k7#m99x!', boxX + 20, boxY + 180);

    // Warning strip
    ctx.fillStyle = '#fffae6';
    ctx.fillRect(boxX, boxY + 200, boxW, 40);
    ctx.fillStyle = '#b7791f';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(`[VULNERABILITY] Displayed on Public Billboard: ${customData?.venueName || 'Times Square Matrix #14'}`, boxX + 10, boxY + 225);

    if (hardGlitch) {
      this.drawNoise(ctx, width, height, 30);
    }
    this.drawScanlines(ctx, width, height, 0.15);
  }
}
