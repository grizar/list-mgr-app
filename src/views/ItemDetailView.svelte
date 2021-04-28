<script>
  import {
    local,
    categoryList,
    database
  } from "../components/state.js";

  import Barcode from "../components/Barcode.svelte"
  
  import { Button } from "smelte";
  import { TextField } from "smelte";
  import { Select } from "smelte";
  import { AppBar } from "smelte";
  import { Spacer } from "smelte";
  import { Image } from "smelte";
  import { ProgressCircular } from "smelte";

  import { fade } from "svelte/transition";
  import { pop, push } from "svelte-spa-router";

  import { onMount, onDestroy } from "svelte";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let params = {};

  var barcodeScannerVisible = false;

  var item = {};
  var saveOnDestroy = true;
  var queryInProgress = false;

  var selectCategories = $categoryList.map(oneItem => ({
    value: oneItem._id,
    text: oneItem.category
  }));

  function saveItem(doPop = true) {
    if (item.produit == "") item.produit = $local.empty;
    database.updateItem(item);
    saveOnDestroy = false;
    if (doPop) pop();
  }

  // Load values
  if (params.action == "new") {
    item = database.getShoppingListNewItem();
    item.categoryId = params.id == undefined ? "" : params.id;
  } else {
    // We enter this form with an existing item Id in that case
    item = database.getShoppingListItem(params.id);
    if (item == undefined) {
      // Only happen if we reload the page directly
      item = database.getShoppingListNewItem();
      saveOnDestroy = false;
      push("#/");
    }
  }

  onMount(async () => {
    document.getElementById("produit").focus();
  });

  onDestroy(async () => {
    if (saveOnDestroy) saveItem(false);
  });

  function back() {
    saveItem();
  }

  async function getBarcodeInfo(code) {
    queryInProgress = true;
    console.log(code);
    var produit = await getOpenFacts(code);
    if (produit != null) {
      item.produit = produit.product_name;
      item.ean = code;
      item.image_small_url = produit.image_small_url;
      item.image_url = produit.image_url;
      item.detail = produit.brands;
    } else {
      dispatch("routeEvent", {
        action: "displaySnackbar",
        message: $local.scanNotFound,
        color: "error"
      });
    }
    queryInProgress = false;
  }

  function barcodeScannerResult(message) {
    barcodeScannerVisible = false;
    console.log('Result from barcode scanner');
    console.log(message);
    if (message.detail.type == 'code') {
      getBarcodeInfo(message.detail.code);
    }
  }

  function showError(error) {
    dispatch("routeEvent", {
      action: "displaySnackbar",
      message: $local.scanError + error,
      color: "error"
    });
  }

  function barcodeScan() {
    barcodeScannerVisible = !barcodeScannerVisible;
  }

  // *****************************************************************************************
  // OpenFoodFacts & OpenBeautyFacts requests
  // *****************************************************************************************

  function _getBaseUrl(category) {
    return category === "Food"
      ? "https://world.openfoodfacts.org"
      : "https://world.openbeautyfacts.org";
  }

  async function getProduct(ean, category) {
    const url = _getBaseUrl(category) + "/api/v0/product/" + ean + ".json";
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "text/plain"
          // ,UserAgent: navigator.userAgent
        }
      });
      const product = await response.json();
      if (product.status === 0) {
        return null;
      }
      return product;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function getOpenFacts(ean) {
    var produit = await getProduct(ean, "Food");
    if (produit != null) {
      return produit.product;
    } else {
      produit = await getProduct(ean, "Beauty");
      if (produit != null) {
        return produit.product;
      } else {
        return null;
      }
    }
  }
  // *****************************************************************************************
</script>

<div in:fade>
  <AppBar class="bg-blue-400">
    <div class="md:visible">
      <Button
        icon="keyboard_backspace"
        flat
        color="white"
        text
        on:click={back} />
    </div>
    <h6 class="md:pl-3 text-white text-lg">{$local.product}</h6>
      <Spacer />
      {#if queryInProgress}
        <ProgressCircular size="50" color="alert" />
      {:else}
        <Button
          icon="calendar_view_day"
          iconClass="text-white transform rotate-90"
          color="white"
          flat
          text
          on:click={barcodeScan} />
      {/if}
  </AppBar>

  {#if barcodeScannerVisible}
  <Barcode on:message={barcodeScannerResult}></Barcode>
  {/if}

  <TextField
    id="produit"
    bind:value={item.produit}
    label={$local.product}
    outlined
    type="text"
    min="3"
    max="100" />

  <Select
    bind:value={item.categoryId}
    label={$local.category}
    items={selectCategories}
    dense
    noUnderline
    class="mb-6" />

  <TextField
    id="detail"
    bind:value={item.detail}
    label={$local.detail}
    outlined
    textarea
    type="text"
    min="3"
    max="500" />

  {#if item.image_url != undefined && item.image_url != ''}
    <div class="text-center">
      <Image src={item.image_url} alt={item.produit} />
    </div>
  {/if}

</div>
