export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          efficiency_points: number;
          efficiency_rank: string;
          active_focus: string | null;
          custom_instructions: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["conversations"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["conversations"]["Row"]>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string | null;
          role: "user" | "assistant" | "system";
          content: string;
          attachments: any[];
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
      };
      wadi_reflections: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          content: string;
          priority: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["wadi_reflections"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["wadi_reflections"]["Row"]>;
      };
      wadi_knowledge_base: {
        Row: {
          id: string;
          user_id: string;
          knowledge_point: string;
          category: string;
          confidence_score: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["wadi_knowledge_base"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["wadi_knowledge_base"]["Row"]>;
      };
      wadi_cloud_reports: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          content: string;
          type: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["wadi_cloud_reports"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["wadi_cloud_reports"]["Row"]>;
      };
    };
  };
}

