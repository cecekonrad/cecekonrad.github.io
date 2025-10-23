const btnNew=document.querySelector('#js-new-quote');
const btnAnswer=document.querySelector('#js-show-answer');
const questionText=document.querySelector('#js-quote-text');
const answerText=document.querySelector('#js-answer-text');
const endpoint='https://trivia.cyberwisp.com/getrandomchristmasquestion';
let currentAnswer='';

async function getQuote(){
  try{
    const res=await fetch(endpoint,{cache:'no-store'});
    if(!res.ok)throw new Error('Network error');
    const data=await res.json();
    currentAnswer=data.answer;
    questionText.textContent=data.question;
    answerText.textContent='';
  }catch(err){
    console.error(err);
    alert('Could not load trivia.');
  }
}

function showAnswer(){
  answerText.textContent=currentAnswer;
}

btnNew.addEventListener('click',getQuote);
btnAnswer.addEventListener('click',showAnswer);
document.addEventListener('DOMContentLoaded',getQuote);