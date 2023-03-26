import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

import { Container, Button, Select, Text } from '@chakra-ui/react';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import WaveSurfer from 'wavesurfer.js';
import AudioContext from '../Audio/AudioContext';
import Visualizer from '../Audio/AudioVisualizer';
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
  const {
    status,
    startRecording,
    stopRecording,
    clearBlobUrl,
    previewAudioStream,
    mediaBlobUrl,
  } = useReactMediaRecorder({ video: false, onStop: (blobUrl, blob) => { setBlob(blob) } });
  let audioUrl = props.currentAudioStreamUrl ?? mediaBlobUrl
  console.log("currentAudioStreamUrl", props.currentAudioStreamUrl, audioUrl)

  const [wavesurf, setWavesurf] = useState(null)
  const [startTime, setStart] = useState()
  const [duration, setDuration] = useState()
  const [isUploading, setIsUploading] = useState(false)

  const [filename, setFilename] = useState(`test.webm`)
  const [endTime, setEnd] = useState()
  const [blob, setBlob] = useState()

  const lottie1Ref = useRef();
  const lottie2Ref = useRef();

  const visualizerRef = useRef()
  const visualizer2Ref = useRef()
  const endTimeRef = useRef()
  const startTimeRef = useRef()
  endTimeRef.current = endTime
  startTimeRef.current = startTime
  endTimeRef.current = endTime
  useEffect(() => {
    setTimeout(() => {
      if (visualizerRef.current) {
        let canvas = visualizerRef.current
        Visualizer.visualizeFrequencyBars(canvas.getContext('2d'), canvas, 300, 60, "#000", mainColor)
        setInterval(updateTime, 1000)
      }
    }, 1000)
    setTimeout(() => {
      if (visualizer2Ref.current) {
        let canvas = visualizer2Ref.current
        Visualizer.visualizeFrequencyBars(canvas.getContext('2d'), canvas, 300, 60, "#000", mainColor)
        setInterval(updateTime, 1000)
      }
    }, 1000)
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
        plugins: [
          // CursorPlugin.create({
          //   showTime: true,
          //   opacity: 1,
          //   customShowTimeStyle: {
          //     'background-color': '#000',
          //     color: '#fff',
          //     padding: '2px',
          //     'font-size': '10px'
          //   }
          // })
        ],
        barGap: 3
      });
      setWavesurf(wavesurf)
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
    console.log("updating lottie animation", allAudio.length)
    if (allAudio?.length % 2 == 1) {
      console.log("pausing robo audiowave")
      lottie1Ref.current?.start?.();
      // lottie2Ref.current?.stop?.();
    }
    if (allAudio?.length % 2 == 0) {
      console.log("starting gptcha audiowave")
      lottie2Ref.current?.start?.();
      // lottie1Ref.current?.stop?.();
    }

    const audio = new Audio();
    const sourceNode = audioCtx.createMediaElementSource(audio);
    console.log("audioCtx.destination", audioCtx)
    sourceNode.connect(analyser);
    console.log("playing audio", audio)
    audio.play();
  }
  const updateTime = () => {
    if (!endTimeRef.current && startTimeRef.current) {
      // var date = new Date()
      let diff = moment().diff(startTimeRef.current, 'seconds')
      // date.setSeconds(moment().diff(startTime, 'seconds')); // specify value for SECONDS here
      let duration = `${Math.floor(diff / 60)}:${diff%60 < 10 ? `0${diff%60}` : diff%60}`

      setDuration(duration)
    }
  }

  function deleteRecording() {
    clearBlobUrl()
    AudioContext.resetAnalyser()
    wavesurf.empty()
    setStart(null)
    setEnd(null)
    setDuration(null)
  }

  async function uploadRecording() {
    setIsUploading(true)
    let handle = setTimeout(() => {
      alert("Upload timed out")
      setIsUploading(false)
    }, 30000)
    const data = new FormData()
    const file = new File([blob], `${filename.replace('.webm', '')}.webm`)

    console.log(file);

    const formData = new FormData();

    data.append('file', file, file.name);
    let uploadSearchParams = ``
    // let uploadSearchParams = `?userId=${props.clientId}`
    // if (props.routineId) {
    //   uploadSearchParams = uploadSearchParams + `&routineId=${props.routineId}`
    // }
  }
  // useEffect(() => {
  //   let handle;
  //   if (!startTime) {
  //   }
  //   if (endTime) {
  //     clearInterval(handle)
  //   }
  // }, [endTime])
  
  function startPlaying() {
    // We use an external audio element
    wavesurf.playPause();
    if (props.onStartPlaying) props.onStartPlaying()
  }
  function stopPlaying() {
    // We use an external audio element
    wavesurf.pause();
    console.log("stop playing")
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

  return (
    <div className="p-4">
      {/* {!isRecording && <Container className="border border-solid border-gray-300 rounded-lg p-4 mb-8">
        <Text className="uppercase text-gray-600 font-bold font-base" style={{ fontSize: 12 }}>{'Live call'}</Text>
        {!isRecording && <Button colorScheme={"teal"} type="primary" loading={isRecording} disabled={isRecording} onClick={() => {
          deleteRecording()
          startRecording() 
          setStart(moment())
        }}>{audioUrl ? 'Restart': 'Start'} Call</Button>}
        <Text className="text-xs text-center width-full">
          OR
        </Text>
        <Text className="uppercase text-gray-600 font-bold font-base" style={{ fontSize: 12 }}>{'Use pre-existing robo call'}</Text>
        <Select placeholder='Select option'>
          <option value='option1'>Call example 1</option>
          <option value='option2'>Call example 2</option>
          <option value='option3'>Call example 3</option>
        </Select>
      </Container>} */}
      <Container className="border border-solid border-gray-300 rounded-lg p-4">
      {isRecording && <Button disabled={!isRecording || audioUrl} onClick={() => {
        stopRecording()
        setEnd(moment())
      }}>Stop Recording</Button>}
      {<div style={{
        position: "relative", marginTop: 8, height: 160 }}>
        <div style={{ display: 'flex', flexDirection: "row", width: "100%", marginRight: 8 }}>
          <Text className="uppercase text-gray-600 font-bold font-base" style={{ fontSize: 12 }}>
            {`${isRecording ? 'Live': 'Recording'} `} 
            {` Preview `}
            <Text style={{ textAlign: "left", color: "#00f", fontWeight: "bold", fontSize: 12 }}>
              {status ? ` ${status?.toUpperCase()} `: playingAudio ? "SPEAKING": "IDLE"}
              {duration != null && duration}
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
          {/* {<canvas
            id="livepreview"
            ref={visualizerRef}
            style={{
              // visibility: !mediaBlobUrl ? 'visible':'hidden',
            }}
            height={!audioUrl ? 60: 1}
            width={300}
            className='ml-2'
          />} */}
        </div>
        <div className="flex flex-row m-2 w-full justify-end">
          {currentAudioUser == "gptcha" && <div
            style={{
              top: -120
            }}
          ><Lottie lottieRef={lottie2Ref} animationData={waveform2} loop={true} autoplay={true} style={{
            height: 120
          }} /></div>}
          {/* {<canvas
            id="livepreview-2"
            ref={visualizer2Ref}
            style={{
              // visibility: !mediaBlobUrl ? 'visible':'hidden',
              float: "right",
            }}
            height={!audioUrl ? 60: 1}
            width={300}
            className='mr-2'
          />} */}
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
        {/* {mediaBlobUrl && wavesurf && `${wavesurf.getCurrentTime()}/${wavesurf.getDuration()}`} */}
      </div>}
      </Container>
      {props.children}
      {<Container className={audioUrl ? "border border-solid border-gray-100 rounded-lg p-4": ""}>
        <div id="waveform" style={{ height: 120, visibility: audioUrl ? 'visible' : 'hidden', zIndex: 1 }}></div>
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
      </Container>}
      {/* <div className="w-full">
        <Button disabled={!mediaBlobUrl} style={{ color: "#f87077" }} onClick={() => deleteRecording()}><XCircleIcon /> Delete</Button>
        <Button disabled={!mediaBlobUrl || isUploading} style={{ color: "#66cc91" }} loading={isUploading} onClick={() => {
          uploadRecording()
        }}><CheckCircleIcon /> Upload recording</Button>
      </div> */}
    </div>
  );
};

export default RecordingWrappedView;