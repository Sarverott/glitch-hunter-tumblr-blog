export * from './BaseKioskScreen';
export * from './McDonaldsWin10Screen';
export * from './SubwayKernelPanicScreen';
export * from './AtmBsodScreen';
export * from './BillboardTeamViewerScreen';
export * from './AirportBiosBootScreen';

import { BaseKioskScreen } from './BaseKioskScreen';
import { McDonaldsWin10Screen } from './McDonaldsWin10Screen';
import { SubwayKernelPanicScreen } from './SubwayKernelPanicScreen';
import { AtmBsodScreen } from './AtmBsodScreen';
import { BillboardTeamViewerScreen } from './BillboardTeamViewerScreen';
import { AirportBiosBootScreen } from './AirportBiosBootScreen';

export const REGISTERED_KIOSK_SCREENS: BaseKioskScreen[] = [
  new McDonaldsWin10Screen(),
  new SubwayKernelPanicScreen(),
  new AtmBsodScreen(),
  new BillboardTeamViewerScreen(),
  new AirportBiosBootScreen(),
];
