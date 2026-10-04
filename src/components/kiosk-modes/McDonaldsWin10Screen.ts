import { BaseKioskScreen, KioskCustomData } from './BaseKioskScreen';

export class McDonaldsWin10Screen extends BaseKioskScreen {
  readonly id = 'mcdonalds_win10';
  readonly name = "McDonald's Win10 Breakout";
  readonly color = '#103554';
  readonly defaultSummary = 'WINDOWS 10 PRO - DESKTOP EXITED';
  readonly osCategory = 'Windows 10 IoT Enterprise';

  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    hardGlitch: boolean,
    customData?: KioskCustomData
  ): void {
    // Windows 10 desktop background
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, width, height);

    // Windows 10 glowing logo in background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(width * 0.45, height * 0.22, width * 0.35, height * 0.45);

    // Bottom taskbar
    ctx.fillStyle = '#0f141c';
    ctx.fillRect(0, height - 48, width, 48);

    // Windows Start button
    ctx.fillStyle = '#0078d7';
    ctx.fillRect(8, height - 40, 32, 32);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('⊞', 16, height - 18);

    // Desktop icons
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px sans-serif';
    ctx.fillText('🗑 Recycle Bin', 20, 35);
    ctx.fillText('📂 Menu_Promos_2026', 20, 75);
    ctx.fillText('⚙️ Signage_Service.bat', 20, 115);
    if (customData?.incidentRef) {
      ctx.fillText(`📄 ${customData.incidentRef}.log`, 20, 155);
    }

    // McDonald's NewPOS Error Box
    const boxX = 75;
    const boxY = 65;
    const boxW = Math.min(width - 120, 370);
    const boxH = 190;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = '#000000';
    ctx.fillRect(boxX, boxY, boxW, 32);

    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 13px "Fira Code", monospace';
    const venueTitle = (customData?.venueName || "MCDONALD'S DRIVE-THRU").toUpperCase();
    ctx.fillText(`${venueTitle} - CRASH`, boxX + 12, boxY + 22);

    ctx.fillStyle = '#cc0000';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Fatal: Kiosk display viewport lost exclusive lock.', boxX + 16, boxY + 60);

    ctx.fillStyle = '#222222';
    ctx.font = '12px sans-serif';
    ctx.fillText('Process: NewPOS_ShellLauncher.exe exited.', boxX + 16, boxY + 85);
    ctx.fillText(`OS: ${customData?.osDetected || 'Windows 10 Pro (Build 19045)'}`, boxX + 16, boxY + 110);

    const userMsg = customData?.customMessage || 'Full Windows desktop exposed to customers.';
    ctx.fillStyle = '#d9534f';
    ctx.font = 'italic 11px sans-serif';
    ctx.fillText(userMsg.slice(0, 48), boxX + 16, boxY + 138);

    // Taskbar clock & system tray
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px "Fira Code", monospace';
    const timeStr = customData?.timestamp || new Date().toLocaleTimeString();
    ctx.fillText(timeStr, width - 85, height - 20);

    if (hardGlitch) {
      this.drawNoise(ctx, width, height, 35);
    }
    this.drawScanlines(ctx, width, height);
  }
}
