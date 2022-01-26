const text     = document.querySelector('#chattext');
const speakBtn = document.querySelector('#speechbtn');
var _4655 = ['4655','四六五五','ケンシロウ'];

function sleep(waitMsec) {
  var startMsec = new Date();
 
  // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
  while (new Date() - startMsec < waitMsec);
}

speakBtn.addEventListener('click', function() {
    if(text.value.match('おはよう')){
        // 発言を作成
        const uttr = new SpeechSynthesisUtterance(/*text.value*/"おはようございます、ご主人様。")
        // 発言を再生 (発言キューに発言を追加)
        speechSynthesis.speak(uttr)
    }
    else if(text.value.match('こんにちは')){
        // 発言を作成
        const uttr = new SpeechSynthesisUtterance(/*text.value*/"こんにちは、ご主人様。")
        // 発言を再生 (発言キューに発言を追加)
        speechSynthesis.speak(uttr)
    }
    else if(text.value.match('こんばんは')){
        // 発言を作成
        const uttr = new SpeechSynthesisUtterance(/*text.value*/"こんばんは、ご主人様。")
        // 発言を再生 (発言キューに発言を追加)
        speechSynthesis.speak(uttr)
    }
    else if(text.value.match('黙れ')){
        // 発言を作成
        const uttr = new SpeechSynthesisUtterance(/*text.value*/"開発者に言え。")
        // 発言を再生 (発言キューに発言を追加)
        speechSynthesis.speak(uttr)
    }
    else if(text.value.match(_4655[0])){
        // 発言を作成
        const uttr = new SpeechSynthesisUtterance(/*text.value*/"あああああああああああああああ");
        // 発言を再生 (発言キューに発言を追加)
        speechSynthesis.speak(uttr);
        sleep(2000)
        window.apis.quit();
    }
    else{
        // 発言を作成
        const uttr = new SpeechSynthesisUtterance(/*text.value*/"学生なら、Excelの練習をしてください。社会で役立ちます。")
        // 発言を再生 (発言キューに発言を追加)
        speechSynthesis.speak(uttr)}
    }
)