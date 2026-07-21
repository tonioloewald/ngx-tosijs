import { Provider } from "@angular/core";
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
export declare const provideTosi: () => Provider;
