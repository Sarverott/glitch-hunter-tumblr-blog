import { BaseKioskScreen, KioskCustomData } from './BaseKioskScreen';

export class SubwayKernelPanicScreen extends BaseKioskScreen {
  readonly id = 'subway_kernel';
  readonly name = 'Subway Linux Kernel Panic';
  readonly color = '#000000';
  readonly defaultSummary = 'KERNEL PANIC: FATAL EXCEPTION IN INTERRUPT';
  readonly osCategory = 'Linux / systemd';

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

    const venue = customData?.venueName || 'TransitKiosk-Intel-Atom-E3940';
    const msg = customData?.customMessage || 'gpu_irq_handler failed to acknowledge frame';

    const lines = [
      `[   8.289102] Kernel panic - not syncing: Fatal exception in interrupt`,
      `[   8.289104] CPU: 0 PID: 489 Comm: Xorg Tainted: G        W  5.15.0-76-generic`,
      `[   8.289106] Hardware: ${venue}`,
      `[   8.289108] Call Trace:`,
      `[   8.289110]  <IRQ>`,
      `[   8.289112]  dump_stack_lvl+0x48/0x5e`,
      `[   8.289114]  panic+0x101/0x290`,
      `[   8.289116]  nmi_panic+0x34/0x38`,
      `[   8.289118]  drm_intel_display_pipe_fault+0x8a/0x120`,
      `[   8.289120]  ${msg.slice(0, 52)}`,
      `[   8.289122]  handle_irq_event_percpu+0x32/0x70`,
      `[   8.289124] ---[ end Kernel panic - not syncing ]---`,
      `[   8.289126] System halted. Reboot required via watchdog daemon.`,
    ];

    lines.forEach((line, idx) => {
      ctx.fillText(line, 16, 26 + idx * 22);
    });

    if (hardGlitch) {
      this.drawNoise(ctx, width, height, 40);
    }
    this.drawScanlines(ctx, width, height, 0.2);
  }
}
