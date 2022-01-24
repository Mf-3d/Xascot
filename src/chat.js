const text     = document.querySelector('#chattext')
const speakBtn = document.querySelector('#speechbtn')

speakBtn.addEventListener('click', function() {
    // 発言を作成
    const uttr = new SpeechSynthesisUtterance(/*text.value*/"学生なら、Excelの練習をしてください。社会で役立ちます。")
    // 発言を再生 (発言キューに発言を追加)
    speechSynthesis.speak(uttr)
})