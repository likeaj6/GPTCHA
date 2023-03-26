import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/solid'
import { Container, Button, Text } from '@chakra-ui/react';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import WaveSurfer from 'wavesurfer.js';
import AudioContext from '../Audio/AudioContext';
import { useReactMediaRecorder } from "../Audio/MediaRecorder.ts";
import AudioSpectrum from "react-audio-spectrum";
import { Avatar } from '@chatscope/chat-ui-kit-react';
import waveform1 from '../../assets/animations/waveform1.json'
import waveform2 from '../../assets/animations/waveform2.json'
import Lottie from "lottie-react";

const mainColor = "#4353FF"
let GPTLogo = "https://seeklogo.com/images/C/chatgpt-logo-02AFA704B5-seeklogo.com.png"
let roboIcon = "https://github.com/likeaj6/GPTCHA/blob/main/src/assets/robot.jpeg?raw=true";

const RecordingWrappedView = (props) => {
  const { onRecordStarted, allAudio, currentAudioUser, playingAudio } = props
  // const handleMediaRecorderStop = (blobUrl, blob) => {
  //   submitRecordingToWhisper(blob);
  // }
  const {
    status,
    startRecording,
    stopRecording,
    clearBlobUrl,
    previewAudioStream,
    mediaBlobUrl,
  } = useReactMediaRecorder({ video: false });
  let audioUrl = props.currentAudioStreamUrl ?? mediaBlobUrl

  const [wavesurf, setWavesurf] = useState(null)
  const [startTime, setStart] = useState(moment())
  const [endTime, setEnd] = useState(moment())
  const [duration, setDuration] = useState()
  const [whisperTranscriptions, setWhisperTranscriptions] = useState([]);

  const lottie1Ref = useRef();
  const lottie2Ref = useRef();

  const endTimeRef = useRef()
  const startTimeRef = useRef()
  endTimeRef.current = endTime
  startTimeRef.current = startTime
  endTimeRef.current = endTime

  // useEffect(() => {
    // startRecording()
  // }, [])

  const submitRecordingToWhisper = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'audio.wav');
    formData.append('model', 'whisper-1');

    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer [API Key goes here]',
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        whisperTranscriptions.push(data.text);
        setWhisperTranscriptions([...whisperTranscriptions]);
        startRecording();
      } else {
        console.error(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    let handle = setInterval(updateTime, 1000)
    if (!wavesurf) {
      let wavesurf = WaveSurfer.create({
        container: document.querySelector('#waveform'),
        waveColor: '#D9DCFF',
        progressColor: mainColor,
        cursorColor: mainColor,
        barWidth: 3,
        barRadius: 3,
        cursorWidth: 2,
        height: 60,
        plugins: [],
        barGap: 3
      });
      setWavesurf(wavesurf)
    }
    return () => {
      clearInterval(handle)
    }
  }, [])

  useEffect(() => {
    if (wavesurf && audioUrl) {
      wavesurf.load(audioUrl);
    }
  }, [audioUrl])

  let audioCtx = AudioContext.getAudioContext()
  let analyser = AudioContext.getAnalyser()
  if (previewAudioStream) {
    const sourceNode = audioCtx.createMediaStreamSource(previewAudioStream)
    sourceNode.connect(analyser)
  } else {
    if (allAudio?.length % 2 == 1) {
      lottie1Ref.current?.start?.();
      if (!playingAudio) {
        lottie1Ref.current?.stop?.();
      }
    }
    if (allAudio?.length % 2 == 0) {
      lottie2Ref.current?.start?.();
      if (!playingAudio) {
        lottie2Ref.current?.stop?.();
      }
    }

    const audio = new Audio();
    const sourceNode = audioCtx.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    audio.play();
  }
  const updateTime = () => {
    if (endTimeRef.current != null && startTimeRef.current != null) {
      let diff = moment().diff(startTimeRef.current, 'seconds')
      let duration = `${Math.floor(diff / 60)}:${diff%60 < 10 ? `0${diff%60}` : diff%60}`

      setDuration(duration)
    }
  }

  function restartTimer() {
    clearBlobUrl()
    AudioContext.resetAnalyser()
    wavesurf.empty()
    setStart(null)
    setEnd(null)
    setDuration(null)
  }
  
  function startPlaying() {
    // We use an external audio element
    wavesurf.playPause();
    if (props.onStartPlaying) props.onStartPlaying()
  }
  function stopPlaying() {
    // We use an external audio element
    wavesurf.pause();
    if (props.onStopPlaying) props.onStopPlaying()
  }
  const isRecording = status == 'recording'

  useEffect(() => {
    let handle;
    if (isRecording) {
      handle = setInterval(() => onRecordStarted(), 1500)
    }
    return () => {
      clearInterval(handle);
    }
  }, [isRecording])

  useEffect(() => {
    let handle;
    if (allAudio && allAudio.length == 0 && !playingAudio) {
      restartTimer()
    }
  }, [allAudio])

  const WhisperTranscriptionsMap = () => {
    if (!whisperTranscriptions) return null;

    return whisperTranscriptions.map((transcriptionText, i) => <Text key={i}>{transcriptionText}</Text>);
  }

  return (
    <div className="p-4">
      <Container className="border border-solid border-gray-300 rounded-lg p-4">
      {/* {<Button disabled={!isRecording || audioUrl} onClick={() => {
        stopRecording()
        setEnd(moment())
      }}>Transcribe Audio Snippet</Button>} */}
      {/* <WhisperTranscriptionsMap /> */}
      {<div style={{
        position: "relative", marginTop: 8, height: 160 }}>
        <div style={{ position: "relative", display: 'flex', flexDirection: "row", width: "100%", marginRight: 8 }}>
          <Text className="uppercase text-red-400 font-bold font-base justify-end flex-end" style={{ position: "absolute", bottom: 16, right: 16 }}>
            {duration != null && duration}
          </Text>
          <Text className="uppercase text-gray-600 font-bold font-base" style={{ fontSize: 12 }}>
            {`${isRecording ? 'Live': 'Recording'} `} 
            {` Preview `}
            <Text style={{ textAlign: "left", color: "#00f", fontWeight: "bold", fontSize: 12 }}>
              {playingAudio ? "SPEAKING": "IDLE... CLICK BELOW TO GENERATE MORE."}
            </Text>
          </Text>
        </div>
        <div className="flex flex-row m-2 w-full">
          {currentAudioUser == "robo-caller" && <Avatar src={roboIcon} name={"Robo caller"} />}
          {currentAudioUser == "robo-caller" && <div
            style={{
              marginTop: -60
            }}
          ><Lottie lottieRef={lottie1Ref} animationData={waveform1} loop={true} autoplay={true} style={{
            height: 200
          }} /></div>}
        </div>
        <div className="flex flex-row m-2 w-full justify-end">
          {currentAudioUser == "gptcha" && <div
            style={{
              top: -120
            }}
          ><Lottie lottieRef={lottie2Ref} animationData={waveform2} loop={true} autoplay={true} style={{
            height: 120
          }} /></div>}
          {currentAudioUser == "gptcha" && <Avatar src={GPTLogo} name={"GPTCHA"} />}
        </div>
        {audioUrl && <audio
          id="audioRecording"
          src={audioUrl}
        >
        </audio>}
        <AudioSpectrum
          id="audio-canvas"
          height={200}
          width={300}
          audioId={"audioRecording"}
        />
      </div>}
      </Container>
      {props.children}
      {<Container className={audioUrl ? "border border-solid border-gray-100 rounded-lg p-4": ""}>
        <div id="waveform" style={{ height: 120, visibility: audioUrl ? 'visible' : 'hidden', zIndex: 1 }}></div>
        <Text className="border border-solid border-gray-100 rounded-lg p-4">
          {props.currentMessage?.text}
        </Text>
        {<ReactPlayer
          url={audioUrl}
          width="90%"
          height="50px"
          playing={true}
          controls={true}
          onStart={() => startPlaying()}
          onEnded={() => stopPlaying()}
          onPause={() => stopPlaying()}
          config={{ file: { forceAudio: true } }}
          style={{
            marginTop: 16
          }}
        />}
        <br/>
        <Button className="m-2" onClick={() => { alert("RLHF coming soon") }} style={{
          fontSize: 20,
        }}>
          <HandThumbUpIcon className="h-6 w-6 text-green-500"></HandThumbUpIcon>
        </Button>
        <Button className="m-2" onClick={() => { alert("RLHF coming soon") }} style={{
          fontSize: 20
        }}>
          <HandThumbDownIcon className="h-6 w-6 text-red-500"></HandThumbDownIcon>
        </Button>
      </Container>}
    </div>
  );
};

export default RecordingWrappedView;