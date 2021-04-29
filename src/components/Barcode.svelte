<script>
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
  
  import Quagga from '@ericblade/quagga2';

  let wrapper;

  var backCamID = null;
  var last_camera = null;
  navigator.mediaDevices.enumerateDevices()
  .then(function(devices) {
    devices.forEach(function(device) {  
      console.log(device);
      if( device.kind == "videoinput" && device.label.match(/back/) !== null ){
            backCamID = device.deviceId;
      }
      if( device.kind === "videoinput"){
        last_camera = device.deviceId;
      } 
    });
  
    if( backCamID === null){
      backCamID = last_camera;
    }
  })
  .catch(function(err) {         });

  console.log(backCamID);

  function barcode(code) {
    console.log(code);
    Quagga.stop();
    console.log('dispatching message');
		dispatch('message', {
      type: 'code',
			code: code.codeResult.code
		});
	}

  onDestroy(() => {
    Quagga.stop();
  });

  onMount(() => {
    console.log(wrapper);
    Quagga.init({
      inputStream : {
        name : "Live",
        type : "LiveStream",
        target: wrapper
      },
      constraints: {
        width: 320,
        height: 240,
        video: {
          mandatory: {
            minWidth: { min: 1280 },
            minHeight: { min: 720 }
          },
        facingMode: "environment",
        deviceId: backCamID
        }

      },
      showCanvas: false,
      locator: false,
      decoder : {
        readers : ["ean_reader"]
      }
    }, function(err) {
        if (err) {
            console.log(err);
            return
        }
        console.log("Initialization finished. Ready to start");
        Quagga.start();
        Quagga.onDetected(barcode);

    });
  })

</script>

<div bind:this="{wrapper}"></div>
