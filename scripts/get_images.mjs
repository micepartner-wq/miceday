import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zwxvjlnzhjmsuwjnwvqv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eHZqbG56aGptc3V3am53dnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODcwNjIsImV4cCI6MjA4NTE2MzA2Mn0.GA0nRGSMr9XxXHc1VhpSeSB2hnaZknO2ojedpsTWrw4';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('installation_cases')
    .select('id, image_url')
    .eq('id', '35bb41e2-4696-45a4-aeea-6da6467b6da5');
    
  if (error) console.error(error);
  
  console.log(JSON.stringify(data, null, 2));
}

run();
