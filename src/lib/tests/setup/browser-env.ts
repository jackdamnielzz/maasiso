import { Window } from 'happy-dom';

// Create a new window instance
const window = new Window();
const document = window.document;

// Create a fake indexedDB implementation
const createFakeIndexedDB = () => {
  const databases: { [key: string]: any } = {};

  const createObjectStore = (db: any, name: string) => ({
    name,
    data: new Map(),
    put: (value: any, key: any) => ({
      onsuccess: null,
      onerror: null,
    }),
    get: (key: any) => ({
      onsuccess: null,
      onerror: null,
      result: databases[db.name]?.[name]?.get(key),
    }),
    delete: (key: any) => ({
      onsuccess: null,
      onerror: null,
    }),
    clear: () => ({
      onsuccess: null,
      onerror: null,
    }),
    openCursor: () => ({
      onsuccess: null,
      onerror: null,
      result: null,
    }),
  });

  return {
    open: (name: string, version?: number) => {
      const request = {
        onerror: null as any,
        onsuccess: null as any,
        onupgradeneeded: null as any,
        result: {
          name,
          version: version || 1,
          objectStoreNames: {
            contains: (name: string) => databases[name]?.hasOwnProperty(name) || false,
          },
          createObjectStore: (name: string) => {
            if (!databases[name]) {
              databases[name] = {};
            }
            databases[name][name] = createObjectStore(request.result, name);
            return databases[name][name];
          },
          transaction: (storeNames: string | string[], mode: string) => ({
            objectStore: (name: string) => databases[name]?.[name] || createObjectStore(request.result, name),
          }),
          close: () => {},
        },
      };

      setTimeout(() => {
        if (request.onupgradeneeded) {
          request.onupgradeneeded({ target: request });
        }
        if (request.onsuccess) {
          request.onsuccess({ target: request });
        }
      }, 0);

      return request;
    },
    deleteDatabase: (name: string) => {
      delete databases[name];
      return {
        onsuccess: null,
        onerror: null,
      };
    },
  };
};

// Create fake IDBKeyRange
const createFakeIDBKeyRange = () => ({
  lowerBound: (value: any) => ({ lower: value, upper: null, lowerOpen: false, upperOpen: true }),
  upperBound: (value: any) => ({ lower: null, upper: value, lowerOpen: true, upperOpen: false }),
  bound: (lower: any, upper: any) => ({ lower, upper, lowerOpen: false, upperOpen: false }),
  only: (value: any) => ({ lower: value, upper: value, lowerOpen: false, upperOpen: false }),
});

// Setup global browser environment
(global as any).window = window;
(global as any).document = document;
(global as any).navigator = window.navigator;
(global as any).localStorage = window.localStorage;
(global as any).sessionStorage = window.sessionStorage;

// Setup IndexedDB
(global as any).indexedDB = createFakeIndexedDB();
(global as any).IDBKeyRange = createFakeIDBKeyRange();

// Add missing browser APIs
(global.window as any).setInterval = setInterval;
(global.window as any).clearInterval = clearInterval;
(global.window as any).requestAnimationFrame = (callback: FrameRequestCallback) => setTimeout(callback, 0);
(global.window as any).cancelAnimationFrame = (id: number) => clearTimeout(id);

// Create fake PerformanceMark and PerformanceMeasure
class FakePerformanceEntry implements PerformanceEntry {
  readonly detail: any;
  readonly duration: number;
  readonly entryType: string;
  readonly name: string;
  readonly startTime: number;

  constructor(
    name: string,
    entryType: string,
    startTime: number,
    duration: number,
    detail?: any
  ) {
    this.name = name;
    this.entryType = entryType;
    this.startTime = startTime;
    this.duration = duration;
    this.detail = detail;
  }

  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
}

class FakePerformanceMark extends FakePerformanceEntry {
  constructor(name: string, options?: PerformanceMarkOptions) {
    super(
      name,
      'mark',
      options?.startTime ?? performance.now(),
      0,
      options?.detail
    );
  }
}

class FakePerformanceMeasure extends FakePerformanceEntry {
  constructor(name: string, startTime: number, duration: number) {
    super(name, 'measure', startTime, duration);
  }
}

// Create a proper Performance implementation
const createPerformance = (): Partial<Performance> => {
  const marks = new Map<string, FakePerformanceMark>();
  const measures = new Map<string, FakePerformanceMeasure>();

  const perf: Partial<Performance> = {
    now: () => Date.now(),
    mark: (name: string, options?: PerformanceMarkOptions) => {
      const mark = new FakePerformanceMark(name, options);
      marks.set(name, mark);
      return mark;
    },
    measure: (name: string, startMark?: string, endMark?: string) => {
      const start = startMark ? marks.get(startMark)?.startTime ?? 0 : 0;
      const end = endMark ? marks.get(endMark)?.startTime ?? performance.now() : performance.now();
      const measure = new FakePerformanceMeasure(name, start, end - start);
      measures.set(name, measure);
      return measure;
    },
    getEntriesByName: (name: string) => {
      const mark = marks.get(name);
      const measure = measures.get(name);
      return mark ? [mark] : measure ? [measure] : [];
    },
    clearMarks: () => marks.clear(),
    clearMeasures: () => measures.clear(),
    timeOrigin: Date.now(),
    timing: {} as PerformanceTiming,
    navigation: {} as PerformanceNavigation,
    eventCounts: new Map(),
    onresourcetimingbufferfull: null,
    toJSON: () => ({}),
    clearResourceTimings: () => {},
    getEntries: () => [...marks.values(), ...measures.values()],
    getEntriesByType: (type: string) => 
      type === 'mark' ? [...marks.values()] : 
      type === 'measure' ? [...measures.values()] : [],
    setResourceTimingBufferSize: () => {},
  };

  // Add event handling capabilities
  const target = new EventTarget();
  perf.addEventListener = target.addEventListener.bind(target);
  perf.removeEventListener = target.removeEventListener.bind(target);
  perf.dispatchEvent = target.dispatchEvent.bind(target);

  return perf;
};

(global.window as any).performance = createPerformance();

// Add missing fetch API
(global as any).fetch = window.fetch;
(global as any).Headers = window.Headers;
(global as any).Request = window.Request;
(global as any).Response = window.Response;
