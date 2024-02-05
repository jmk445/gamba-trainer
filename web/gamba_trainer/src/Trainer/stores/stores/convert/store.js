import { derived, readable, writable } from "svelte/store";

//convert된 tflite 파일을 저장하는 변수, set은 호출 함수(aggregatedactions.js)에서 이루어 진다. 추후 밑의 방식으로
//바꿔야 새로고침 해도 유지하는 등의 기능을 구현할 수 있을 듯. 일단 이렇게 돌아는 가게끔 하자
export let blob = null;

//convert 된 tflite파일을 스벨트 변수인 writable을 활용하여 저장해보기 위한 노력의 흔적
export const tfliteModelBlob = writable(null);