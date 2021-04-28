<script>
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

  import Quagga from 'quagga'; 

  let wrapper;

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
        width: 640,
        height: 480,
        video: {
          mandatory: {
            minWidth: { min: 1280 },
            minHeight: { min: 720 }
          }
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
