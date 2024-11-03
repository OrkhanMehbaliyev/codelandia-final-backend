const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://aaajhqtrfvgsxzwaqlyb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhYWpocXRyZnZnc3h6d2FxbHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgyMzQ3NzYsImV4cCI6MjA0MzgxMDc3Nn0.kMVAT81ji-WxXljtsNYz8-6NRMI1uiie0VGq0J0O0GA";
const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = supabase;
