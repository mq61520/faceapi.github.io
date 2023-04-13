import { useEffect, useState, useRef} from 'react'
import * as faceapi from 'face-api.js';

import './App.css';

function App() {

  const imgRef = useRef();
  const canvasRef = useRef();

  const [img, setImg] = useState('');

  const [face_with_label, setFWL] = useState([]);

  const handleDetection = async () => {
    const faceMatcher = new faceapi.FaceMatcher(face_with_label, 0.7);
    
    const detection = await faceapi.detectAllFaces(imgRef.current).withFaceLandmarks().withFaceDescriptors();

    console.log(detection[0].descriptor);

    canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(imgRef.current);

    faceapi.matchDimensions(canvasRef.current, {
      width: 700,
      height: 700,
    });

    const resized = faceapi.resizeResults(detection, {
      width:700,
      height:700,
    });

    // faceapi.draw.drawDetections(canvasRef.current, resized);
    faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
    resized.forEach( detection => {
      const box = detection.detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: faceMatcher.findBestMatch(detection.descriptor)})
      drawBox.draw(canvasRef.current)
    })
  }
  
  const handleTraning = async () => {
    const labels = ['Captain', 'Thor', 'Tony Stark'];

    var faceDescriptor = [];

    for (const label of labels) {
      var descriptors = [];

      for(let i = 1; i <= 3; i++) {
        const image = await faceapi.fetchImage(`/training-data/${label}/${i}.jpg`);
        
        const detection = await faceapi.detectSingleFace(image)
                                                        .withFaceLandmarks()
                                                        .withFaceDescriptor();

        descriptors.push(detection.descriptor);
      }
      console.log('Train xong '+ label);

      faceDescriptor.push(new faceapi.LabeledFaceDescriptors(label, descriptors));
    }

    return faceDescriptor;
  }

  useEffect(() => {
    const loadModels = () => {
      Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ])
      .then(async () => {
        const training_data = await handleTraning();
        setFWL(training_data);
      })
    };

    loadModels();
  }, []);

  console.log(face_with_label);

  return (
    <div className='wrapper'>

      <input type='file'  onChange={e => {
          setImg(e.target.files[0]);

          var ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0,0,700,700);
        }}
      />

      <div className='container'>
        <img
          ref={imgRef}
          crossOrigin="anonymous"
          src={img ? URL.createObjectURL(img) : ""}
          alt=""
          width='700'
          height='700'
        />
  
        <canvas
          ref={canvasRef}
          width='700'
          height='700'
        >
        </canvas>
      </div>

      <button onClick={handleDetection}>Submit</button>
    </div>
  );
}

export default App;