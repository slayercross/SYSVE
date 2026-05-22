const Url = 'https://apeammhaanpwtuwrxeze.supabase.co';
const Key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZWFtbWhhYW5wd3R1d3J4ZXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA2NzcsImV4cCI6MjA3NTQ3NjY3N30.BuMnfZrM1mfJIP4XFWJg2lf7TOx8GocLVDp2FM-Uti8';

if (!window.supabase) {
    throw new Error('Supabase CDN não carregou');
}

window.supabaseClient =
                     window.supabase.createClient(Url, Key); 

                     const db = window.supabaseClient;
                     window.db = db;

