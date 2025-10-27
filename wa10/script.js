const q=document.getElementById("js-quote-text");
const a=document.getElementById("js-answer-text");
const bNew=document.getElementById("js-new-quote");
const bShow=document.getElementById("js-show-answer");

const forismaticBase="http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en";
function proxied(){return "https://api.allorigins.win/raw?url="+encodeURIComponent(forismaticBase+"&_="+Date.now())}

async function getQuote(){
  bNew.disabled=true;
  bShow.disabled=true;
  a.style.visibility="hidden";
  q.textContent="Loading...";
  a.textContent="";
  try{
    const r=await fetch(proxied(),{cache:"no-store",mode:"cors"});
    if(!r.ok)throw new Error();
    const t=await r.text();
    const j=JSON.parse(t.replace(/\\'/g,"'"));
    const text=(j.quoteText||"").trim()||"No quote.";
    const author=(j.quoteAuthor||"Unknown").trim()||"Unknown";
    q.textContent=`"${text}"`;
    a.textContent=`— ${author}`;
    bShow.disabled=false;
  }catch(e){
    q.textContent="Couldn’t load a quote. Try again.";
    a.textContent="";
  }finally{
    bNew.disabled=false;
  }
}
function showAuthor(){a.style.visibility="visible"}

bNew.addEventListener("click",getQuote);
bShow.addEventListener("click",showAuthor);
getQuote();