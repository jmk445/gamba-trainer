/* Copyright 2021 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
======================================================================*/

import App from "./components/App.svelte";
//개발 중에 scss를 사용하지 않기 때문에 주석처리함.
import "./scss/main.scss";
// import "./scss/_reset.scss";

new App({
  target: document.getElementById("svelte_app"),
  //hydrate: true,
});
