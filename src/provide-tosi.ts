import { APP_INITIALIZER, NgZone, Provider, inject } from "@angular/core";
import * as tosijs from "tosijs";

const { observe } = tosijs;

/**
 * For Zone.js applications that read tosijs proxies directly in templates
 * (dirty checking re-reads them on every change-detection pass): bridges
 * tosijs flushes into the zone so mutations from OUTSIDE Angular — timers,
 * sockets, other frameworks, the console — trigger change detection.
 * Coalesced to one zone entry per flush.
 *
 * Unnecessary in zoneless apps using tosiSignal (signals notify Angular's
 * scheduler directly), and harmless if present.
 *
 *   bootstrapApplication(AppComponent, { providers: [provideTosi()] })
 */
export const provideTosi = (): Provider => ({
  // APP_INITIALIZER (not provideAppInitializer) for compatibility across
  // the >=16 peer range
  provide: APP_INITIALIZER,
  multi: true,
  useFactory: () => {
    const zone = inject(NgZone);
    return () => {
      let queued = false;
      observe(/^./, () => {
        if (!queued) {
          queued = true;
          queueMicrotask(() => {
            queued = false;
            zone.run(() => {});
          });
        }
      });
    };
  },
});
