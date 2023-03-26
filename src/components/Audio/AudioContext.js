let audioCtx;
let analyser;

const AudioContext = {
  getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  },

  getAnalyser() {
    if (!analyser) {
      analyser = this.getAudioContext().createAnalyser();
    }
    return analyser;
  },

  resetAnalyser() {
    analyser = this.getAudioContext().createAnalyser();
  },

  decodeAudioData() {
    this.getAudioContext().decodeAudioData().then(function (decodedData) {
      // use the decoded data here
    });
  }

}

export default AudioContext;
