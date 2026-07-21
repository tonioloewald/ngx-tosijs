import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

// tell React it's running in a test environment that uses act()
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
