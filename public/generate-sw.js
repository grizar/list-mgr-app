/*
Copyright 2015, 2019 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// Incrementing OFFLINE_VERSION will kick off the install event and force
// previously cached resources to be updated from the network.
const OFFLINE_VERSION = 1;
const CACHE_NAME = 'offline';
// Customize this with a different URL if needed.
const CACHE_FILES =  [
  'https://fonts.googleapis.com/css?family=Roboto:300,400,500|Material+Icons&display=swap',
  '/index.html',
  '/favicon.png',
  '/global.css',
  '/build/bundle.css',
  '/build/bundle.js'];


self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(
        CACHE_FILES
      );
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('activate');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      console.log('caches keys');
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          console.log('Test cache ' + cacheName);
          return (cacheName != CACHE_NAME);
          // Return true if you want to remove this cache,
          // but remember that caches are shared across
          // the whole origin
        }).map(function(cacheName) {
          console.log('Delete cache ' + cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
