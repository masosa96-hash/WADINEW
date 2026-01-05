export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Placeholder until generation runs
  public: {
    Tables: {
      [key: string]: any
    }
  }
}
