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
    
    const detection = await faceapi.detectSingleFace(imgRef.current).withFaceLandmarks().withFaceDescriptor();

    console.log(detection.descriptor);

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
    // resized.forEach( detection => {
      const box = detection.detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: faceMatcher.findBestMatch(detection.descriptor)})
      drawBox.draw(canvasRef.current)
    // })
  }
  
  // const handleTraining = async () => {
  //   const labels = ['Captain', 'Thor', 'Tony Stark'];

  //   var faceDescriptor = [];

  //   for (const label of labels) {
  //     var descriptions = [];

  //     for(let i = 1; i <= 3; i++) {
  //       const image = await faceapi.fetchImage(`/training-data/${label}/${i}.jpg`);
        
  //       const detection = await faceapi.detectSingleFace(image, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceDescriptor();

  //       descriptions.push(detection.descriptor);
  //     }
  //     console.log('Train xong '+ label);

  //     faceDescriptor.push(new faceapi.LabeledFaceDescriptors(label, descriptions));
  //   }

  //   return faceDescriptor;
  // }

  // const handleTraining = async () => {
  //   const labels = ['Captain', 'Thor', 'Tony Stark'];

  //   return Promise.all(
  //     labels.map(async label => {
  //       var descriptions = [];

  //       for (let i = 1; i <= 3; i++) {
  //         const img = await faceapi.fetchImage(`/training/${label}/${i}.jpg`);
  //         const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
  //         // const detection = await faceapi.computeFaceDescriptor(img);

  //         console.log(detection.descriptor);
          
  //         descriptions.push(detection.descriptor);
  //       }
  //       console.log('Train xong ' + label);

  //       const lfd = await faceapi.LabeledFaceDescriptors(label, descriptions);

  //       return new Float32Array(lfd);
  //     })
  //   );
  // }

  useEffect(() => {
    const handleTraining = async () => {
      const labels = ['Captain', 'Thor', 'Tony Stark'];

      var faceDescriptor = [];

      for (const label of labels) {
        var descriptions = [];

        for(let i = 1; i <= 3; i++) {
          const image = await faceapi.fetchImage(`/training/${label}/${i}.jpg`);
          
          const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();

          descriptions.push(detection.descriptor);
        }
        console.log('Train xong '+ label);

        faceDescriptor.push(new faceapi.LabeledFaceDescriptors(label, descriptions));
      }

      setFWL(faceDescriptor);
    }

    const loadModels = () => {
      Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      ])
      .then(async () => {
        // const training_data = await handleTraining();
        // setFWL(training_data);

        await handleTraining();
      })
    };

    loadModels();
  }, []);

  console.log(face_with_label);

  return (
    <div className='wrapper'>

      <input type='file' onChange={e => {
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