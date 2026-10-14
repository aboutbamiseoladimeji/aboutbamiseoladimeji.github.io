// Configure these public Supabase project values after following README.md.
// The anon key is designed to be public; protect data and publishing with server-side policies/functions.
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
let supabaseClient = null;
const $ = id => document.getElementById(id);
function status(message){$('status').textContent=message;}
function configured(){return SUPABASE_URL.startsWith('https://')&&!SUPABASE_URL.includes('YOUR_')&&!SUPABASE_ANON_KEY.includes('YOUR_');}
if(configured() && window.supabase){supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);}
$('login').addEventListener('click',async()=>{
 if(!supabaseClient){alert('Google sign-in is not configured yet. Follow the setup guide in README.md first.');return;}
 const {error}=await supabaseClient.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href}});if(error)alert(error.message);
});
$('logout').addEventListener('click',async()=>{if(supabaseClient)await supabaseClient.auth.signOut();showSession(null);});
$('load').addEventListener('click',loadContent);
$('publish').addEventListener('click',async()=>{
 if(!supabaseClient){status('Configure Supabase first.');return;}
 let parsed;try{parsed=JSON.parse($('content').value);}catch(e){status('Invalid JSON: '+e.message);return;}
 status('Publishing…');
 const {data:{session}}=await supabaseClient.auth.getSession();
 if(!session){status('Please sign in again.');return;}
 const {data,error}=await supabaseClient.functions.invoke('publish-site',{body:{content:parsed}});
 if(error){status('Publish failed: '+error.message);return;}
 status(data?.message||'Published. Allow GitHub Pages a short time to rebuild.');
});
async function loadContent(){
 try{const r=await fetch('../data/site.json?cache='+Date.now());if(!r.ok)throw Error('Could not read data/site.json');$('content').value=JSON.stringify(await r.json(),null,2);status('Loaded current public content.');}
 catch(e){status(e.message);}
}
function showSession(session){
 $('signed-out').hidden=!!session;$('signed-in').hidden=!session;
 if(session){$('account').textContent='Signed in as '+(session.user.email||'Google account');loadContent();}
}
async function init(){
 if(!supabaseClient){$('login').textContent='Google sign-in setup required';return;}
 const {data:{session}}=await supabaseClient.auth.getSession();showSession(session);
 supabaseClient.auth.onAuthStateChange((_event,s)=>showSession(s));
}
init();
