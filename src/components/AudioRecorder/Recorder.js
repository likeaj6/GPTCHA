import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

import { Button } from '@chakra-ui/react';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import WaveSurfer from 'wavesurfer.js';
import AudioContext from '../Audio/AudioContext';
import Visualizer from '../Audio/AudioVisualizer';
import { useReactMediaRecorder } from "../Audio/MediaRecorder.ts";
import AudioSpectrum from "react-audio-spectrum";

const mainColor = "#4353FF"

const RecordView = (props) => {
  const { onRecordStarted } = props
  const {
    status,
    startRecording,
    stopRecording,
    clearBlobUrl,
    previewAudioStream,
    mediaBlobUrl,
  } = useReactMediaRecorder({ video: false, onStop: (blobUrl, blob) => { setBlob(blob) } });

  const [wavesurf, setWavesurf] = useState(null)
  const [startTime, setStart] = useState()
  const [duration, setDuration] = useState()
  const [isUploading, setIsUploading] = useState(false)

  const [filename, setFilename] = useState(`test.webm`)
  const [endTime, setEnd] = useState()
  const [blob, setBlob] = useState()

  const visualizerRef = useRef()
  const endTimeRef = useRef()
  const startTimeRef = useRef()
  endTimeRef.current = endTime
  startTimeRef.current = startTime
  endTimeRef.current = endTime
  useEffect(() => {
    setTimeout(() => {
      if (visualizerRef.current) {
        let canvas = visualizerRef.current
        Visualizer.visualizeFrequencyBars(canvas.getContext('2d'), canvas, 300, 100, "#000", mainColor)
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
        height: 120,
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
      console.log("wavesurf", wavesurf)
      setWavesurf(wavesurf)
    }
  }, [])

  useEffect(() => {
    if (wavesurf && mediaBlobUrl) {
      wavesurf.load(mediaBlobUrl);
    }
  }, [mediaBlobUrl])

  let audioCtx = AudioContext.getAudioContext()
  let analyser = AudioContext.getAnalyser()
  if (previewAudioStream) {
    const sourceNode = audioCtx.createMediaStreamSource(previewAudioStream)
    sourceNode.connect(analyser)
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
  }
  function stopPlaying() {
    // We use an external audio element
    wavesurf.pause();
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
    <div>
      <h4>Recording...</h4>
      {/* <Button onClick={() => setIsExerciseModalOpen(true)} style={{ width: '100%' }}><PlusOutlined />exercise</Button> */}

      <Button type="primary" loading={isRecording} disabled={isRecording} onClick={() => {
        deleteRecording()
        startRecording() 
        setStart(moment())
      }}>{mediaBlobUrl ? 'Restart': 'Start'} Recording</Button>
      {<Button disabled={!isRecording || mediaBlobUrl} onClick={() => {
        stopRecording()
        setEnd(moment())
      }}>Stop Recording</Button>}
      {<div style={{
        position: "relative", marginTop: 8 }}>
        <div style={{ display: 'flex', flexDirection: "row", width: "100%", marginRight: 8 }}>
          <p style={{ color: "#aaa" }}>
            {`${isRecording ? 'Live': 'Recording'} `} 
            {` Preview: `}
          </p>
          <p style={{ textAlign: "left", color: "#00f", fontWeight: "bold" }}>
            {` ${status?.toUpperCase()} `}
            {duration != null && duration}
          </p>
        </div>
        {<canvas
          id="livepreview"
          ref={visualizerRef}
          style={{
            visibility: !mediaBlobUrl ? 'visible':'hidden',
          }}
          height={!mediaBlobUrl ? 100: 1}
          width={300}
        />}
        {/* <AudioSpectrum
          id="audio-canvas"
          height={200}
          width={300}
          audioId={"audioRecording"}
        /> */}
        {/* {mediaBlobUrl && wavesurf && `${wavesurf.getCurrentTime()}/${wavesurf.getDuration()}`} */}
        <div id="waveform" style={{ height: mediaBlobUrl ? 60: 1, visibility: mediaBlobUrl ? 'visible' : 'hidden', zIndex: 1, margin: 16 }}></div>
        {<ReactPlayer
          id="audioRecording"
          url={mediaBlobUrl}
          width="90%"
          height="50px"
          playing={false}
          controls={true}
          onStart={() => startPlaying()}
          onPause={() => stopPlaying()}
          config={{ file: { forceAudio: true } }}
        />}
      </div>}
      <Button disabled={!mediaBlobUrl} style={{ color: "#f87077" }} onClick={() => deleteRecording()}><XCircleIcon /> Delete</Button>
      <Button disabled={!mediaBlobUrl || isUploading} style={{ color: "#66cc91" }} loading={isUploading} onClick={() => {
        uploadRecording()
      }}><CheckCircleIcon /> Upload recording</Button>
    </div>
  );
};

export default RecordView;