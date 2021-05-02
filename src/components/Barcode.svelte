<script>
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  import { BrowserBarcodeReader, BarcodeFormat, DecodeHintType, RGBLuminanceSource, BinaryBitmap, HybridBinarizer } from "@zxing/library";

  const codeReader = new BrowserBarcodeReader();

  function barcode(code) {
    console.log(code);
    console.log("dispatching message");
    codeReader.reset();

    dispatch("message", {
      type: "code",
      code: code.codeResult.code,
    });
  }

  onDestroy(() => {
    codeReader.reset();
  });

  onMount(() => {
    var backCamID = null;
    var last_camera = null;
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      devices.forEach(function (device) {
        console.log(device);
        if (
          device.kind == "videoinput" &&
          device.label.match(/back/) !== null
        ) {
          backCamID = device.deviceId;
        }
        if (device.kind === "videoinput") {
          last_camera = device.deviceId;
        }
      });

      if (backCamID === null) {
        backCamID = last_camera;
      }

      console.log("Camera selected");
      console.log(backCamID);

      console.log(wrapper);
      console.log("Camera");
      console.log(backCamID);
    });


    codeReader.decodeOnceFromVideoDevice(null, 'video', (result, err) => {
    if (result) {
      // properly decoded qr code
      console.log('Found code!', result)
      barcode(result.text);
    }

    if (err) {
      // As long as this error belongs into one of the following categories
      // the code reader is going to continue as excepted. Any other error
      // will stop the decoding loop.
      //
      // Excepted Exceptions:
      //
      //  - NotFoundException
      //  - ChecksumException
      //  - FormatException

      console.log(err);
      /*
      if (err instanceof ZXing.NotFoundException) {
        console.log('No QR code found.')
      }

      if (err instanceof ZXing.ChecksumException) {
        console.log('A code was found, but it\'s read value was not valid.')
      }

      if (err instanceof ZXing.FormatException) {
        console.log('A code was found, but it was in a invalid format.')
      }
      */
    }
  })

  });
</script>

<video id="video" width="300" height="200" style="border: 1px solid gray">
<track default kind="captions">
</video>

