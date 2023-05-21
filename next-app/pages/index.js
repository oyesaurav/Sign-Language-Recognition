import React, { useRef, useEffect } from "react"
import { Hands, VERSION } from "@mediapipe/hands"

function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const handsRef = useRef(null)
  const initializedRef = useRef(false)
  const [inputVideoReady, setInputVideoReady] = React.useState(false)

  useEffect(() => {
    if (!inputVideoReady) {
      return
    }
    async function initializeHands() {
      handsRef.current = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${VERSION}/${file}`
        },
        onResults: (results) => {
          console.log(results)
        },
        // onRuntimeInit
      })
      handsRef.current.setOptions({
        maxNumHands: 1,
        detectionConfidence: 0.8,
        trackingConfidence: 0.8,
      })
      await handsRef.current.initialize()
      initializedRef.current = true
    }

    if (!handsRef.current) {
      initializeHands()
    }
  }, [handsRef, initializedRef, inputVideoReady])

  if (videoRef.current && canvasRef.current && initializedRef.current) {
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    const constraints = {
      video: {
        width: { min: 320, ideal: 640, max: 1280 },
        height: { min: 240, ideal: 480, max: 720 },
        facingMode: "user",
      },
    }

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        video.srcObject = stream
        video.play()
      })
      .catch((error) => {
        console.error("Failed to get user media:", error)
      })

    video.addEventListener("loadeddata", () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const drawHands = () => {
        if (handsRef.current) {
          handsRef.current
            .send({ image: video })
            .then(() => {
              requestAnimationFrame(drawHands)
            })
            .catch((error) => {
              console.error("Failed to send image to hands:", error)
            })
        }
      }

      drawHands()
    })
  }

  return (
    <div className="App">
      <video
        autoPlay
        ref={(el) => {
          videoRef.current = el
          setInputVideoReady(!!el)
        }}
      ></video>
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}

export default App
