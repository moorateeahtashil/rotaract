export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          bio: string | null;
          date_of_birth: string | null;
          address_line_1: string | null;
          address_line_2: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          blood_group: string | null;
          occupation: string | null;
          company: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          date_of_birth?: string | null;
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          blood_group?: string | null;
          occupation?: string | null;
          company?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          date_of_birth?: string | null;
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          blood_group?: string | null;
          occupation?: string | null;
          company?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: Database["public"]["Enums"]["user_role_type"];
          granted_by: string | null;
          granted_at: string;
          expires_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: Database["public"]["Enums"]["user_role_type"];
          granted_by?: string | null;
          granted_at?: string;
          expires_at?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["user_role_type"];
          granted_by?: string | null;
          granted_at?: string;
          expires_at?: string | null;
          is_active?: boolean;
        };
      };
      members: {
        Row: {
          id: string;
          user_id: string;
          member_number: string | null;
          classification: string | null;
          join_date: string;
          membership_type: string | null;
          status: Database["public"]["Enums"]["member_status"];
          total_service_hours: number | null;
          total_projects: number | null;
          total_events: number | null;
          show_in_directory: boolean;
          social_facebook: string | null;
          social_instagram: string | null;
          social_linkedin: string | null;
          social_twitter: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          member_number?: string | null;
          classification?: string | null;
          join_date: string;
          membership_type?: string | null;
          status?: Database["public"]["Enums"]["member_status"];
          total_service_hours?: number | null;
          total_projects?: number | null;
          total_events?: number | null;
          show_in_directory?: boolean;
          social_facebook?: string | null;
          social_instagram?: string | null;
          social_linkedin?: string | null;
          social_twitter?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          member_number?: string | null;
          classification?: string | null;
          join_date?: string;
          membership_type?: string | null;
          status?: Database["public"]["Enums"]["member_status"];
          total_service_hours?: number | null;
          total_projects?: number | null;
          total_events?: number | null;
          show_in_directory?: boolean;
          social_facebook?: string | null;
          social_instagram?: string | null;
          social_linkedin?: string | null;
          social_twitter?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
      };
      board_positions: {
        Row: {
          id: string;
          position_key: string;
          title: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          position_key: string;
          title: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          position_key?: string;
          title?: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
      };
      board_members: {
        Row: {
          id: string;
          member_id: string;
          position_id: string;
          custom_title: string | null;
          photo_url: string | null;
          term_start: string;
          term_end: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          member_id: string;
          position_id: string;
          custom_title?: string | null;
          photo_url?: string | null;
          term_start: string;
          term_end?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          member_id?: string;
          position_id?: string;
          custom_title?: string | null;
          photo_url?: string | null;
          term_start?: string;
          term_end?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      committees: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          avenue_id: string | null;
          chair_member_id: string | null;
          logo_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          avenue_id?: string | null;
          chair_member_id?: string | null;
          logo_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          avenue_id?: string | null;
          chair_member_id?: string | null;
          logo_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
      };
      committee_members: {
        Row: {
          id: string;
          committee_id: string;
          member_id: string;
          role_in_committee: string | null;
          joined_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          committee_id: string;
          member_id: string;
          role_in_committee?: string | null;
          joined_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          committee_id?: string;
          member_id?: string;
          role_in_committee?: string | null;
          joined_at?: string;
          is_active?: boolean;
        };
      };
      avenues: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          long_description: string | null;
          icon_key: string | null;
          image_url: string | null;
          color_hex: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          long_description?: string | null;
          icon_key?: string | null;
          image_url?: string | null;
          color_hex?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          long_description?: string | null;
          icon_key?: string | null;
          image_url?: string | null;
          color_hex?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          subtitle: string | null;
          description: string;
          long_description: string | null;
          avenue_id: string | null;
          committee_id: string | null;
          status: Database["public"]["Enums"]["project_status"];
          start_date: string | null;
          end_date: string | null;
          location: string | null;
          location_url: string | null;
          budget_amount: number | null;
          funds_raised: number | null;
          impact_metrics: Json | null;
          is_featured: boolean;
          is_published: boolean;
          published_at: string | null;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string | null;
          og_image_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          subtitle?: string | null;
          description: string;
          long_description?: string | null;
          avenue_id?: string | null;
          committee_id?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          start_date?: string | null;
          end_date?: string | null;
          location?: string | null;
          location_url?: string | null;
          budget_amount?: number | null;
          funds_raised?: number | null;
          impact_metrics?: Json | null;
          is_featured?: boolean;
          is_published?: boolean;
          published_at?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string | null;
          og_image_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          subtitle?: string | null;
          description?: string;
          long_description?: string | null;
          avenue_id?: string | null;
          committee_id?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          start_date?: string | null;
          end_date?: string | null;
          location?: string | null;
          location_url?: string | null;
          budget_amount?: number | null;
          funds_raised?: number | null;
          impact_metrics?: Json | null;
          is_featured?: boolean;
          is_published?: boolean;
          published_at?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string | null;
          og_image_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
      };
      project_images: {
        Row: {
          id: string;
          project_id: string;
          image_url: string;
          caption: string | null;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          image_url: string;
          caption?: string | null;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          image_url?: string;
          caption?: string | null;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      project_team: {
        Row: {
          id: string;
          project_id: string;
          member_id: string;
          role_in_project: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          member_id: string;
          role_in_project?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          member_id?: string;
          role_in_project?: string | null;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          long_description: string | null;
          event_type: string | null;
          avenue_id: string | null;
          project_id: string | null;
          date: string;
          end_date: string | null;
          location: string | null;
          location_url: string | null;
          map_embed_url: string | null;
          capacity: number | null;
          registration_open: boolean;
          registration_opens_at: string | null;
          registration_deadline: string | null;
          registration_fee: number | null;
          image_url: string | null;
          is_featured: boolean;
          status: Database["public"]["Enums"]["event_status"];
          is_public: boolean;
          seo_title: string | null;
          seo_description: string | null;
          og_image_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description: string;
          long_description?: string | null;
          event_type?: string | null;
          avenue_id?: string | null;
          project_id?: string | null;
          date: string;
          end_date?: string | null;
          location?: string | null;
          location_url?: string | null;
          map_embed_url?: string | null;
          capacity?: number | null;
          registration_open?: boolean;
          registration_opens_at?: string | null;
          registration_deadline?: string | null;
          registration_fee?: number | null;
          image_url?: string | null;
          is_featured?: boolean;
          status?: Database["public"]["Enums"]["event_status"];
          is_public?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string;
          long_description?: string | null;
          event_type?: string | null;
          avenue_id?: string | null;
          project_id?: string | null;
          date?: string;
          end_date?: string | null;
          location?: string | null;
          location_url?: string | null;
          map_embed_url?: string | null;
          capacity?: number | null;
          registration_open?: boolean;
          registration_opens_at?: string | null;
          registration_deadline?: string | null;
          registration_fee?: number | null;
          image_url?: string | null;
          is_featured?: boolean;
          status?: Database["public"]["Enums"]["event_status"];
          is_public?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
      };
      event_registrations: {
        Row: {
          id: string;
          event_id: string;
          member_id: string;
          status: Database["public"]["Enums"]["registration_status"];
          registered_at: string;
          payment_status: string | null;
          payment_amount: number | null;
          notes: string | null;
          cancelled_at: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          member_id: string;
          status?: Database["public"]["Enums"]["registration_status"];
          registered_at?: string;
          payment_status?: string | null;
          payment_amount?: number | null;
          notes?: string | null;
          cancelled_at?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          member_id?: string;
          status?: Database["public"]["Enums"]["registration_status"];
          registered_at?: string;
          payment_status?: string | null;
          payment_amount?: number | null;
          notes?: string | null;
          cancelled_at?: string | null;
        };
      };
      event_waitlist: {
        Row: {
          id: string;
          event_id: string;
          member_id: string;
          position: number;
          added_at: string;
          notified_at: string | null;
          status: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          member_id: string;
          position: number;
          added_at?: string;
          notified_at?: string | null;
          status?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          member_id?: string;
          position?: number;
          added_at?: string;
          notified_at?: string | null;
          status?: string | null;
        };
      };
      booking_types: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          capacity: number | null;
          duration_minutes: number;
          requires_approval: boolean;
          max_hours_per_month: number | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          capacity?: number | null;
          duration_minutes?: number;
          requires_approval?: boolean;
          max_hours_per_month?: number | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          capacity?: number | null;
          duration_minutes?: number;
          requires_approval?: boolean;
          max_hours_per_month?: number | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      booking_slots: {
        Row: {
          id: string;
          booking_type_id: string;
          start_time: string;
          end_time: string;
          max_bookings: number | null;
          current_bookings: number | null;
          is_available: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_type_id: string;
          start_time: string;
          end_time: string;
          max_bookings?: number | null;
          current_bookings?: number | null;
          is_available?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_type_id?: string;
          start_time?: string;
          end_time?: string;
          max_bookings?: number | null;
          current_bookings?: number | null;
          is_available?: boolean;
          notes?: string | null;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          booking_type_id: string;
          slot_id: string | null;
          member_id: string;
          start_time: string;
          end_time: string;
          status: Database["public"]["Enums"]["booking_status"];
          notes: string | null;
          admin_notes: string | null;
          approved_by: string | null;
          approved_at: string | null;
          rejected_by: string | null;
          rejected_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          booking_type_id: string;
          slot_id?: string | null;
          member_id: string;
          start_time: string;
          end_time: string;
          status?: Database["public"]["Enums"]["booking_status"];
          notes?: string | null;
          admin_notes?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejected_by?: string | null;
          rejected_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          booking_type_id?: string;
          slot_id?: string | null;
          member_id?: string;
          start_time?: string;
          end_time?: string;
          status?: Database["public"]["Enums"]["booking_status"];
          notes?: string | null;
          admin_notes?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejected_by?: string | null;
          rejected_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      contact_inquiries: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          subject: string | null;
          message: string;
          inquiry_type: string | null;
          is_read: boolean;
          replied_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          subject?: string | null;
          message: string;
          inquiry_type?: string | null;
          is_read?: boolean;
          replied_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          subject?: string | null;
          message?: string;
          inquiry_type?: string | null;
          is_read?: boolean;
          replied_at?: string | null;
          created_at?: string;
        };
      };
      membership_applications: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          date_of_birth: string | null;
          occupation: string | null;
          company: string | null;
          education: string | null;
          why_join: string | null;
          how_heard: string | null;
          social_links: Json | null;
          additional_answers: Json | null;
          status: Database["public"]["Enums"]["application_status"];
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_notes: string | null;
          invite_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          date_of_birth?: string | null;
          occupation?: string | null;
          company?: string | null;
          education?: string | null;
          why_join?: string | null;
          how_heard?: string | null;
          social_links?: Json | null;
          additional_answers?: Json | null;
          status?: Database["public"]["Enums"]["application_status"];
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_notes?: string | null;
          invite_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          date_of_birth?: string | null;
          occupation?: string | null;
          company?: string | null;
          education?: string | null;
          why_join?: string | null;
          how_heard?: string | null;
          social_links?: Json | null;
          additional_answers?: Json | null;
          status?: Database["public"]["Enums"]["application_status"];
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_notes?: string | null;
          invite_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          featured_image: string | null;
          category_id: string | null;
          author_id: string | null;
          status: string;
          is_featured: boolean;
          is_published: boolean;
          published_at: string | null;
          seo_title: string | null;
          seo_description: string | null;
          og_image_url: string | null;
          view_count: number | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          featured_image?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          status?: string;
          is_featured?: boolean;
          is_published?: boolean;
          published_at?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          view_count?: number | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          featured_image?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          status?: string;
          is_featured?: boolean;
          is_published?: boolean;
          published_at?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          view_count?: number | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
      };
      post_tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
        };
      };
      post_tagged: {
        Row: {
          post_id: string;
          tag_id: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
        };
      };
      media_files: {
        Row: {
          id: string;
          title: string;
          file_url: string;
          file_type: Database["public"]["Enums"]["media_type"];
          mime_type: string | null;
          file_size_bytes: number | null;
          width: number | null;
          height: number | null;
          caption: string | null;
          alt_text: string | null;
          category: string | null;
          uploaded_by: string | null;
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          file_url: string;
          file_type?: Database["public"]["Enums"]["media_type"];
          mime_type?: string | null;
          file_size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          caption?: string | null;
          alt_text?: string | null;
          category?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          file_url?: string;
          file_type?: Database["public"]["Enums"]["media_type"];
          mime_type?: string | null;
          file_size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          caption?: string | null;
          alt_text?: string | null;
          category?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
      };
      albums: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          cover_image_url: string | null;
          event_id: string | null;
          project_id: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          cover_image_url?: string | null;
          event_id?: string | null;
          project_id?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          cover_image_url?: string | null;
          event_id?: string | null;
          project_id?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
      };
      album_media: {
        Row: {
          id: string;
          album_id: string;
          media_id: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          album_id: string;
          media_id: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          album_id?: string;
          media_id?: string;
          sort_order?: number;
        };
      };
      homepage_sections: {
        Row: {
          id: string;
          section_type: string;
          title: string | null;
          subtitle: string | null;
          body: string | null;
          image_url: string | null;
          cta_label: string | null;
          cta_href: string | null;
          secondary_cta_label: string | null;
          secondary_cta_href: string | null;
          data_json: Json | null;
          sort_order: number;
          is_visible: boolean;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_type: string;
          title?: string | null;
          subtitle?: string | null;
          body?: string | null;
          image_url?: string | null;
          cta_label?: string | null;
          cta_href?: string | null;
          secondary_cta_label?: string | null;
          secondary_cta_href?: string | null;
          data_json?: Json | null;
          sort_order?: number;
          is_visible?: boolean;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_type?: string;
          title?: string | null;
          subtitle?: string | null;
          body?: string | null;
          image_url?: string | null;
          cta_label?: string | null;
          cta_href?: string | null;
          secondary_cta_label?: string | null;
          secondary_cta_href?: string | null;
          data_json?: Json | null;
          sort_order?: number;
          is_visible?: boolean;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      pages: {
        Row: {
          id: string;
          title: string;
          slug: string;
          meta_title: string | null;
          meta_description: string | null;
          meta_keywords: string | null;
          og_image_url: string | null;
          is_published: boolean;
          is_public: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          meta_title?: string | null;
          meta_description?: string | null;
          meta_keywords?: string | null;
          og_image_url?: string | null;
          is_published?: boolean;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          meta_keywords?: string | null;
          og_image_url?: string | null;
          is_published?: boolean;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
      };
      page_blocks: {
        Row: {
          id: string;
          page_id: string;
          block_type: Database["public"]["Enums"]["page_block_type"];
          title: string | null;
          content: string | null;
          content_json: Json | null;
          image_url: string | null;
          image_url_2: string | null;
          cta_label: string | null;
          cta_href: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          block_type: Database["public"]["Enums"]["page_block_type"];
          title?: string | null;
          content?: string | null;
          content_json?: Json | null;
          image_url?: string | null;
          image_url_2?: string | null;
          cta_label?: string | null;
          cta_href?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          block_type?: Database["public"]["Enums"]["page_block_type"];
          title?: string | null;
          content?: string | null;
          content_json?: Json | null;
          image_url?: string | null;
          image_url_2?: string | null;
          cta_label?: string | null;
          cta_href?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      navigation_items: {
        Row: {
          id: string;
          menu_key: string;
          label: string;
          href: string;
          parent_id: string | null;
          sort_order: number;
          is_visible: boolean;
          requires_auth: boolean;
          required_role: Database["public"]["Enums"]["user_role_type"] | null;
          is_external: boolean;
          open_in_new_tab: boolean;
          icon_key: string | null;
          mobile_only: boolean;
          desktop_only: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          menu_key?: string;
          label: string;
          href: string;
          parent_id?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          requires_auth?: boolean;
          required_role?: Database["public"]["Enums"]["user_role_type"] | null;
          is_external?: boolean;
          open_in_new_tab?: boolean;
          icon_key?: string | null;
          mobile_only?: boolean;
          desktop_only?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          menu_key?: string;
          label?: string;
          href?: string;
          parent_id?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          requires_auth?: boolean;
          required_role?: Database["public"]["Enums"]["user_role_type"] | null;
          is_external?: boolean;
          open_in_new_tab?: boolean;
          icon_key?: string | null;
          mobile_only?: boolean;
          desktop_only?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_settings: {
        Row: {
          key: string;
          value: string;
          value_type: string;
          group_key: string;
          label: string | null;
          description: string | null;
          is_public: boolean;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          key: string;
          value: string;
          value_type?: string;
          group_key?: string;
          label?: string | null;
          description?: string | null;
          is_public?: boolean;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          key?: string;
          value?: string;
          value_type?: string;
          group_key?: string;
          label?: string | null;
          description?: string | null;
          is_public?: boolean;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
      sponsor_club: {
        Row: {
          id: string;
          club_name: string;
          district: string | null;
          charter_date: string | null;
          logo_url: string | null;
          description: string | null;
          relationship_text: string | null;
          president_name: string | null;
          president_email: string | null;
          website_url: string | null;
          social_facebook: string | null;
          social_instagram: string | null;
          social_twitter: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          club_name: string;
          district?: string | null;
          charter_date?: string | null;
          logo_url?: string | null;
          description?: string | null;
          relationship_text?: string | null;
          president_name?: string | null;
          president_email?: string | null;
          website_url?: string | null;
          social_facebook?: string | null;
          social_instagram?: string | null;
          social_twitter?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          club_name?: string;
          district?: string | null;
          charter_date?: string | null;
          logo_url?: string | null;
          description?: string | null;
          relationship_text?: string | null;
          president_name?: string | null;
          president_email?: string | null;
          website_url?: string | null;
          social_facebook?: string | null;
          social_instagram?: string | null;
          social_twitter?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_templates: {
        Row: {
          id: string;
          template_key: string;
          name: string;
          subject: string;
          html_body: string;
          text_body: string | null;
          variables: Json | null;
          category: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_key: string;
          name: string;
          subject: string;
          html_body: string;
          text_body?: string | null;
          variables?: Json | null;
          category?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_key?: string;
          name?: string;
          subject?: string;
          html_body?: string;
          text_body?: string | null;
          variables?: Json | null;
          category?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_logs: {
        Row: {
          id: string;
          template_id: string | null;
          recipient_email: string;
          recipient_name: string | null;
          subject: string;
          sent_by: string | null;
          sent_via: string | null;
          message_id: string | null;
          status: Database["public"]["Enums"]["email_send_status"];
          sent_at: string | null;
          delivered_at: string | null;
          opened_at: string | null;
          clicked_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id?: string | null;
          recipient_email: string;
          recipient_name?: string | null;
          subject: string;
          sent_by?: string | null;
          sent_via?: string | null;
          message_id?: string | null;
          status?: Database["public"]["Enums"]["email_send_status"];
          sent_at?: string | null;
          delivered_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string | null;
          recipient_email?: string;
          recipient_name?: string | null;
          subject?: string;
          sent_by?: string | null;
          sent_via?: string | null;
          message_id?: string | null;
          status?: Database["public"]["Enums"]["email_send_status"];
          sent_at?: string | null;
          delivered_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
      };
      reminder_rules: {
        Row: {
          id: string;
          event_type: string;
          trigger_event: string;
          send_before_hours: number;
          template_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          trigger_event: string;
          send_before_hours: number;
          template_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          trigger_event?: string;
          send_before_hours?: number;
          template_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reminder_logs: {
        Row: {
          id: string;
          rule_id: string | null;
          event_id: string | null;
          member_id: string | null;
          email_log_id: string | null;
          scheduled_for: string;
          sent_at: string | null;
          status: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          rule_id?: string | null;
          event_id?: string | null;
          member_id?: string | null;
          email_log_id?: string | null;
          scheduled_for: string;
          sent_at?: string | null;
          status?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          rule_id?: string | null;
          event_id?: string | null;
          member_id?: string | null;
          email_log_id?: string | null;
          scheduled_for?: string;
          sent_at?: string | null;
          status?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          body: string;
          priority: Database["public"]["Enums"]["announcement_priority"];
          target_audience: string | null;
          is_published: boolean;
          published_at: string | null;
          expires_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          priority?: Database["public"]["Enums"]["announcement_priority"];
          target_audience?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          priority?: Database["public"]["Enums"]["announcement_priority"];
          target_audience?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      resources: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          file_url: string;
          file_type: string | null;
          file_size_bytes: number | null;
          category: string | null;
          access_level: Database["public"]["Enums"]["resource_access_level"];
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          file_url: string;
          file_type?: string | null;
          file_size_bytes?: number | null;
          category?: string | null;
          access_level?: Database["public"]["Enums"]["resource_access_level"];
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          file_url?: string;
          file_type?: string | null;
          file_size_bytes?: number | null;
          category?: string | null;
          access_level?: Database["public"]["Enums"]["resource_access_level"];
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          event_id: string;
          member_id: string;
          attended: boolean;
          marked_by: string | null;
          marked_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          member_id: string;
          attended?: boolean;
          marked_by?: string | null;
          marked_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          member_id?: string;
          attended?: boolean;
          marked_by?: string | null;
          marked_at?: string;
          notes?: string | null;
        };
      };
      volunteer_hours: {
        Row: {
          id: string;
          member_id: string;
          project_id: string | null;
          event_id: string | null;
          hours: number;
          activity_date: string;
          description: string | null;
          approved_by: string | null;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          project_id?: string | null;
          event_id?: string | null;
          hours: number;
          activity_date: string;
          description?: string | null;
          approved_by?: string | null;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          project_id?: string | null;
          event_id?: string | null;
          hours?: number;
          activity_date?: string;
          description?: string | null;
          approved_by?: string | null;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          source: string | null;
          is_confirmed: boolean;
          confirmed_at: string | null;
          unsubscribed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          source?: string | null;
          is_confirmed?: boolean;
          confirmed_at?: string | null;
          unsubscribed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          source?: string | null;
          is_confirmed?: boolean;
          confirmed_at?: string | null;
          unsubscribed_at?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: Database["public"]["Enums"]["audit_action"];
          entity_type: string;
          entity_id: string | null;
          previous_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: Database["public"]["Enums"]["audit_action"];
          entity_type: string;
          entity_id?: string | null;
          previous_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: Database["public"]["Enums"]["audit_action"];
          entity_type?: string;
          entity_id?: string | null;
          previous_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          category: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          category?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          question?: string;
          answer?: string;
          category?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
      };
      password_resets: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token_hash?: string;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_user_highest_role: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Enums"]["user_role_type"];
      };
      current_member_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      user_role_type:
        | "super_admin"
        | "admin"
        | "president"
        | "secretary"
        | "public_image_director"
        | "membership_director"
        | "project_director"
        | "event_manager"
        | "board_member"
        | "member"
        | "applicant"
        | "public";
      member_status: "active" | "inactive" | "suspended" | "alumni" | "pending";
      project_status: "planned" | "active" | "completed" | "archived" | "cancelled";
      event_status: "draft" | "published" | "ongoing" | "completed" | "cancelled";
      registration_status: "registered" | "checked_in" | "cancelled" | "no_show";
      booking_status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
      application_status: "submitted" | "under_review" | "approved" | "rejected" | "withdrawn";
      announcement_priority: "low" | "normal" | "high" | "urgent";
      resource_access_level: "public" | "member_only" | "board_only";
      media_type: "image" | "video" | "document" | "other";
      page_block_type:
        | "hero"
        | "text"
        | "image"
        | "image_gallery"
        | "cta"
        | "stats"
        | "cards"
        | "faq"
        | "timeline"
        | "video_embed"
        | "spacer"
        | "custom_html";
      email_send_status:
        | "pending"
        | "sent"
        | "delivered"
        | "bounced"
        | "failed"
        | "opened"
        | "clicked";
      audit_action:
        | "create"
        | "update"
        | "delete"
        | "restore"
        | "login"
        | "logout"
        | "role_change"
        | "approval"
        | "rejection"
        | "email_sent"
        | "reminder_sent"
        | "setting_change";
    };
  };
};
