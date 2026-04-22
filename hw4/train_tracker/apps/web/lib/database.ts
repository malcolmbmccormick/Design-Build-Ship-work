import type { FeedStatus, TrainPosition, UserPreferences } from "@tracker/shared";

export type Database = {
  public: {
    Tables: {
      train_positions: {
        Row: TrainPosition;
        Insert: TrainPosition;
        Update: Partial<TrainPosition>;
        Relationships: [];
      };
      feed_statuses: {
        Row: FeedStatus;
        Insert: FeedStatus;
        Update: Partial<FeedStatus>;
        Relationships: [];
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: UserPreferences;
        Update: Partial<UserPreferences>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
