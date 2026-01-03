export const logger = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (msg: string, meta: any = {}) => {
    console.log(
      JSON.stringify({
        level: "info",
        message: msg,
        ...meta,
        timestamp: new Date().toISOString(),
      })
    );
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (msg: string, meta: any = {}) => {
    console.error(
      JSON.stringify({
        level: "error",
        message: msg,
        ...meta,
        timestamp: new Date().toISOString(),
      })
    );
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (msg: string, meta: any = {}) => {
    console.warn(
      JSON.stringify({
        level: "warn",
        message: msg,
        ...meta,
        timestamp: new Date().toISOString(),
      })
    );
  },
};
